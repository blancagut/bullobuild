#!/usr/bin/env node
/**
 * check-images.mjs
 * Audit product image coverage in Supabase.
 *
 * Usage:
 *   node scripts/check-images.mjs                 # full report
 *   node scripts/check-images.mjs --min 3         # exit 1 if any product has <3 images (CI guard)
 *   node scripts/check-images.mjs --samples 20    # sample slugs per bucket
 */

import { createClient } from '../node_modules/@supabase/supabase-js/dist/index.mjs';

const SUPABASE_URL = 'https://yxwqjrgcowcsovktmkzl.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4d3Fqcmdjb3djc292a3Rta3psIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjI1NTAxMSwiZXhwIjoyMDkxODMxMDExfQ._QFQ8i4PKIpP-suSp6LbqD9V5NRGgzXZ-HTw6ovFzWs';

const args = process.argv.slice(2);
const MIN = args.includes('--min') ? Number(args[args.indexOf('--min') + 1]) : 0;
const SAMPLES = args.includes('--samples') ? Number(args[args.indexOf('--samples') + 1]) : 10;

const sb = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } });

// Page through all products (Supabase max 1000 per call)
async function fetchAll() {
  const rows = [];
  const PAGE = 1000;
  let from = 0;
  while (true) {
    const { data, error } = await sb
      .from('products')
      .select('id, slug, brand_id, images, stock')
      .range(from, from + PAGE - 1);
    if (error) throw new Error(error.message);
    if (!data || data.length === 0) break;
    rows.push(...data);
    if (data.length < PAGE) break;
    from += PAGE;
  }
  return rows;
}

async function fetchBrands() {
  const { data, error } = await sb.from('brands').select('id, name, slug');
  if (error) throw new Error(error.message);
  const map = new Map();
  for (const b of data) map.set(b.id, b);
  return map;
}

function imgCount(p) {
  return Array.isArray(p.images) ? p.images.length : 0;
}

function bucket(n) {
  if (n === 0) return '0';
  if (n === 1) return '1';
  if (n === 2) return '2';
  if (n < 5) return '3-4';
  if (n < 10) return '5-9';
  return '10+';
}

const pad = (s, n) => String(s).padEnd(n);
const padL = (s, n) => String(s).padStart(n);

async function main() {
  console.log('Loading products and brands...');
  const [products, brands] = await Promise.all([fetchAll(), fetchBrands()]);
  console.log(`Loaded ${products.length} products across ${brands.size} brands.\n`);

  // Global buckets
  const globalBuckets = new Map();
  // Per-brand stats
  const perBrand = new Map(); // brandId -> { total, zero, lt3, sum }

  for (const p of products) {
    const n = imgCount(p);
    globalBuckets.set(bucket(n), (globalBuckets.get(bucket(n)) || 0) + 1);

    const key = p.brand_id || 'unknown';
    const s = perBrand.get(key) || { total: 0, zero: 0, lt3: 0, sum: 0 };
    s.total += 1;
    s.sum += n;
    if (n === 0) s.zero += 1;
    if (n < 3) s.lt3 += 1;
    perBrand.set(key, s);
  }

  // ── Global buckets ─────────────────────────────────────────
  console.log('── Image-count distribution (global) ─────────────');
  console.log(`${pad('images', 10)} ${padL('products', 10)} ${padL('%', 7)}`);
  const order = ['0', '1', '2', '3-4', '5-9', '10+'];
  for (const b of order) {
    const c = globalBuckets.get(b) || 0;
    const pct = ((c / products.length) * 100).toFixed(2);
    console.log(`${pad(b, 10)} ${padL(c, 10)} ${padL(pct, 7)}`);
  }

  const zero = products.filter(p => imgCount(p) === 0).length;
  const lt3 = products.filter(p => imgCount(p) < 3).length;
  console.log(`\nTOTAL:    ${products.length}`);
  console.log(`0 images: ${zero}   (${((zero / products.length) * 100).toFixed(2)}%)`);
  console.log(`<3 images: ${lt3}  (${((lt3 / products.length) * 100).toFixed(2)}%)`);

  // ── Per-brand ─────────────────────────────────────────────
  console.log('\n── Per-brand coverage ────────────────────────────');
  console.log(
    `${pad('brand', 18)} ${padL('total', 8)} ${padL('zero', 8)} ${padL('<3', 8)} ${padL('avg', 7)} ${padL('zero%', 7)}`
  );
  const brandRows = [];
  for (const [brandId, s] of perBrand.entries()) {
    const b = brands.get(brandId);
    brandRows.push({
      name: b ? b.name : '(no brand)',
      slug: b ? b.slug : 'null',
      total: s.total,
      zero: s.zero,
      lt3: s.lt3,
      avg: s.sum / s.total,
    });
  }
  brandRows.sort((a, b) => b.zero - a.zero || b.total - a.total);
  for (const r of brandRows) {
    console.log(
      `${pad(r.name, 18)} ${padL(r.total, 8)} ${padL(r.zero, 8)} ${padL(r.lt3, 8)} ${padL(r.avg.toFixed(2), 7)} ${padL(((r.zero / r.total) * 100).toFixed(1), 7)}`
    );
  }

  // ── Samples ────────────────────────────────────────────────
  if (SAMPLES > 0 && zero > 0) {
    console.log(`\n── Sample of ${Math.min(SAMPLES, zero)} products with 0 images ──`);
    const empties = products.filter(p => imgCount(p) === 0).slice(0, SAMPLES);
    for (const p of empties) {
      const b = brands.get(p.brand_id);
      console.log(`  [${b?.slug || '?'}] ${p.slug}`);
    }
  }

  // ── CI guard ───────────────────────────────────────────────
  if (MIN > 0) {
    const bad = products.filter(p => imgCount(p) < MIN).length;
    if (bad > 0) {
      console.error(`\n✗ ${bad} products have fewer than ${MIN} images (threshold fail).`);
      process.exit(1);
    }
    console.log(`\n✓ All ${products.length} products have >= ${MIN} images.`);
  }
}

main().catch(e => {
  console.error('Fatal:', e.message);
  process.exit(1);
});
