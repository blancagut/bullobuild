#!/usr/bin/env node
/**
 * rebuild-dewalt-images.mjs
 *
 * All DeWalt image URLs in products.images point to a dead CDN path
 * (`www.dewalt.com/products/<SKU>/<SKU>_1_1280.webp` returns 404 for every SKU).
 * The real CDN is `assets.dewalt.com/NAG/PRODUCT/IMAGES/HIRES/WHITEBG/`.
 *
 * This script probes _1_ through _8_ variants per SKU on the live CDN and
 * writes the verified URLs back to products.images. If a SKU has no reachable
 * images, stock is set to 0 so it's hidden by RLS.
 *
 * Usage:
 *   node scripts/rebuild-dewalt-images.mjs --limit 20     # sample
 *   node scripts/rebuild-dewalt-images.mjs                # all
 */

import { createClient } from '../node_modules/@supabase/supabase-js/dist/index.mjs';

const SUPABASE_URL = 'https://yxwqjrgcowcsovktmkzl.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4d3Fqcmdjb3djc292a3Rta3psIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjI1NTAxMSwiZXhwIjoyMDkxODMxMDExfQ._QFQ8i4PKIpP-suSp6LbqD9V5NRGgzXZ-HTw6ovFzWs';

const args = process.argv.slice(2);
const LIMIT = args.includes('--limit') ? Number(args[args.indexOf('--limit') + 1]) : Infinity;
const CONCURRENCY = 24;
const MAX_VARIANT = 8;
const SIZES = ['1680.webp', '1280.webp', '320.webp'];

const sb = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } });

async function head(url) {
  try {
    const res = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: AbortSignal.timeout(10000) });
    return res.status;
  } catch {
    return 0;
  }
}

async function probeSku(sku) {
  const BASE = 'https://assets.dewalt.com/NAG/PRODUCT/IMAGES/HIRES/WHITEBG/';
  const found = [];
  // Probe _1_1680.webp first; if 404, stop (saves time for dead SKUs)
  for (let i = 1; i <= MAX_VARIANT; i++) {
    const url = `${BASE}${sku}_${i}_1680.webp`;
    const status = await head(url);
    if (status === 200) {
      found.push(url);
    } else {
      // No _2 if _1 missing; no _3 if _2 missing etc. CDN is dense.
      if (i === 1) {
        // try 1280 as fallback for the hero
        const url1280 = `${BASE}${sku}_1_1280.webp`;
        if ((await head(url1280)) === 200) found.push(url1280);
      }
      break;
    }
  }
  return found;
}

async function runWithConcurrency(items, fn, n) {
  const out = new Array(items.length);
  let i = 0;
  let done = 0;
  async function worker() {
    while (true) {
      const idx = i++;
      if (idx >= items.length) return;
      out[idx] = await fn(items[idx]);
      done++;
      if (done % 100 === 0) {
        process.stdout.write(`\r  probed ${done}/${items.length}`);
      }
    }
  }
  await Promise.all(Array.from({ length: n }, () => worker()));
  process.stdout.write('\n');
  return out;
}

async function fetchDewaltRows() {
  const { data: brand } = await sb.from('brands').select('id').eq('slug', 'dewalt').single();
  const rows = [];
  const PAGE = 1000;
  let from = 0;
  while (true) {
    const { data, error } = await sb
      .from('products')
      .select('id, slug, name, price, model, stock')
      .eq('brand_id', brand.id)
      .range(from, from + PAGE - 1);
    if (error) throw new Error(error.message);
    if (!data || data.length === 0) break;
    rows.push(...data);
    if (data.length < PAGE) break;
    from += PAGE;
  }
  return { brandId: brand.id, rows };
}

async function main() {
  console.log('Rebuilding DeWalt image URLs from real CDN (assets.dewalt.com)...');
  const { brandId, rows } = await fetchDewaltRows();
  const targets = rows.filter(r => r.model && r.model.trim()).slice(0, LIMIT);
  console.log(`${targets.length} DeWalt SKUs to probe (concurrency=${CONCURRENCY}, up to ${MAX_VARIANT} variants each)`);

  const results = await runWithConcurrency(targets, async (row) => {
    const urls = await probeSku(row.model);
    return { row, urls };
  }, CONCURRENCY);

  // Stats
  let withImages = 0;
  let withoutImages = 0;
  const buckets = {};
  for (const r of results) {
    const n = r.urls.length;
    buckets[n] = (buckets[n] || 0) + 1;
    if (n > 0) withImages++;
    else withoutImages++;
  }
  console.log('image-count distribution:', buckets);
  console.log(`recovered images for: ${withImages}   still empty: ${withoutImages}`);

  // Batch write back
  const pending = results.map(r => ({
    slug: r.row.slug,
    name: r.row.name,
    price: r.row.price,
    brand_id: brandId,
    images: r.urls,
    stock: r.urls.length > 0 ? Math.max(r.row.stock || 0, 1) : 0,
  }));

  const BATCH = 500;
  for (let i = 0; i < pending.length; i += BATCH) {
    const chunk = pending.slice(i, i + BATCH);
    process.stdout.write(`writing batch ${Math.floor(i / BATCH) + 1}/${Math.ceil(pending.length / BATCH)} (${chunk.length})... `);
    const { error } = await sb.from('products').upsert(chunk, { onConflict: 'slug', ignoreDuplicates: false });
    if (error) {
      console.error('ERR:', error.message);
      process.exit(1);
    }
    console.log('OK');
  }
  console.log('Done.');
}

main().catch(e => {
  console.error('Fatal:', e.message);
  process.exit(1);
});
