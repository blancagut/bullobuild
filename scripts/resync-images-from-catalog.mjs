#!/usr/bin/env node
/**
 * resync-images-from-catalog.mjs
 * Re-extract image URLs from every brand catalog JSON and UPDATE products.images
 * in Supabase. Only updates when the freshly extracted list differs.
 *
 * This heals:
 *   - Mac Tools rows where images were stored as stringified JSON objects.
 *   - Any brand truncated by the old 10-image cap.
 *   - Any new URLs added to catalogs since the last import.
 *
 * It also sets stock=0 on products that end up with 0 images, and stock=1 on
 * products that now have images (public RLS gates visibility on stock > 0).
 *
 * Usage:
 *   node scripts/resync-images-from-catalog.mjs --dry-run
 *   node scripts/resync-images-from-catalog.mjs --brand mactools
 *   node scripts/resync-images-from-catalog.mjs
 */

import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '../node_modules/@supabase/supabase-js/dist/index.mjs';
import { extractImageUrls } from './import-to-supabase.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));

const SUPABASE_URL = 'https://yxwqjrgcowcsovktmkzl.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4d3Fqcmdjb3djc292a3Rta3psIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjI1NTAxMSwiZXhwIjoyMDkxODMxMDExfQ._QFQ8i4PKIpP-suSp6LbqD9V5NRGgzXZ-HTw6ovFzWs';

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const ONLY_BRAND = args.includes('--brand') ? args[args.indexOf('--brand') + 1] : null;
const MAX_IMAGES = 50;

const CATALOGS = [
  { brand: 'Black+Decker', slug: 'blackdecker', file: 'blackdecker/data/bd-catalog.json' },
  { brand: 'Bobcat',       slug: 'bobcat',      file: 'bobcat/data/bobcat-catalog.json' },
  { brand: 'Case CE',      slug: 'casece',      file: 'casece/data/casece-catalog.json' },
  { brand: 'Craftsman',    slug: 'craftsman',   file: 'craftsman/data/craftsman-catalog.json' },
  { brand: 'DeWalt',       slug: 'dewalt',      file: 'dewalt/data/dewalt-catalog.json' },
  { brand: 'John Deere',   slug: 'johndeere',   file: 'johndeere/data/johndeere-catalog.json' },
  { brand: 'Mac Tools',    slug: 'mactools',    file: 'mactools/data/mactools-catalog.json' },
  { brand: 'Makita',       slug: 'makita',      file: 'makita/data/makita-catalog.json' },
  { brand: 'Milwaukee',    slug: 'milwaukee',   file: 'milwaukee/data/milwaukee-catalog.json' },
  { brand: 'New Holland',  slug: 'newholland',  file: 'newholland/data/newholland-catalog.json' },
  { brand: 'Skil',         slug: 'skil',        file: 'skil/data/skil-catalog.json' },
  { brand: 'Stanley',      slug: 'stanley',     file: 'stanley/data/stanley-catalog.json' },
];

const sb = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } });

function slugify(str) {
  return String(str).toLowerCase().replace(/[®™©]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 200);
}

function arraysEqual(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

async function getBrandId(slug) {
  const { data } = await sb.from('brands').select('id').eq('slug', slug).single();
  return data?.id;
}

async function fetchBrandProducts(brandId) {
  const rows = [];
  const PAGE = 1000;
  let from = 0;
  while (true) {
    const { data, error } = await sb
      .from('products')
      .select('id, slug, name, price, images, stock')
      .eq('brand_id', brandId)
      .range(from, from + PAGE - 1);
    if (error) throw new Error(error.message);
    if (!data || data.length === 0) break;
    rows.push(...data);
    if (data.length < PAGE) break;
    from += PAGE;
  }
  return rows;
}

async function updateBatch(updates) {
  // Upsert on slug; must include NOT NULL cols (name, price) so PostgREST
  // can handle the conflict-as-update path without failing the INSERT validation.
  const { error } = await sb
    .from('products')
    .upsert(updates, { onConflict: 'slug', ignoreDuplicates: false });
  if (error) throw new Error(`batch upsert: ${error.message}`);
}

async function healBrand({ brand, slug, file }) {
  const filePath = join(__dirname, file);
  if (!existsSync(filePath)) {
    console.log(`\n[${brand}] catalog missing, skipping`);
    return null;
  }

  const raw = JSON.parse(readFileSync(filePath, 'utf8'));
  const items = Array.isArray(raw) ? raw : raw.products ?? raw.items ?? [];

  // Build catalog map keyed by same slug the importer produced
  const slugsSeen = new Set();
  const catalogMap = new Map();
  for (const p of items) {
    const title = p.title || p.name || p.sku || '';
    const sku = p.sku || p.model || '';
    if (!title && !sku) continue;
    let base = slugify(`${slug}-${sku || title}`);
    let s = base;
    let n = 1;
    while (slugsSeen.has(s)) s = `${base}-${n++}`;
    slugsSeen.add(s);
    const imgs = extractImageUrls(p).slice(0, MAX_IMAGES);
    catalogMap.set(s, imgs);
  }

  const brandId = await getBrandId(slug);
  if (!brandId) {
    console.log(`\n[${brand}] brand row not found in DB, skipping`);
    return null;
  }
  const dbRows = await fetchBrandProducts(brandId);

  let updated = 0;
  let healed0ToN = 0;
  let zeroRemaining = 0;
  let unchanged = 0;
  const pending = [];

  for (const row of dbRows) {
    const fresh = catalogMap.get(row.slug) || [];
    const current = Array.isArray(row.images) ? row.images : [];
    const newStock = fresh.length > 0 ? Math.max(row.stock || 0, 1) : 0;

    if (arraysEqual(current, fresh) && row.stock === newStock) {
      unchanged += 1;
      if (fresh.length === 0) zeroRemaining += 1;
      continue;
    }

    if (current.length === 0 && fresh.length > 0) healed0ToN += 1;
    if (fresh.length === 0) zeroRemaining += 1;

    pending.push({
      slug: row.slug,
      name: row.name,
      price: row.price,
      brand_id: brandId,
      images: fresh,
      stock: newStock,
    });
    updated += 1;
  }

  if (!DRY_RUN && pending.length > 0) {
    const BATCH = 500;
    for (let i = 0; i < pending.length; i += BATCH) {
      const chunk = pending.slice(i, i + BATCH);
      process.stdout.write(`  [${brand}] batch ${Math.floor(i / BATCH) + 1}/${Math.ceil(pending.length / BATCH)} (${chunk.length})... `);
      await updateBatch(chunk);
      console.log('OK');
    }
  }

  console.log(
    `[${brand}] rows=${dbRows.length} updated=${updated} unchanged=${unchanged} healed(0→N)=${healed0ToN} still_zero=${zeroRemaining}`
  );
  return { brand, updated, unchanged, healed0ToN, zeroRemaining };
}

async function main() {
  console.log(`${DRY_RUN ? '[DRY RUN] ' : ''}Resync product images from catalogs (cap ${MAX_IMAGES})`);
  const targets = ONLY_BRAND
    ? CATALOGS.filter(c => c.slug === ONLY_BRAND)
    : CATALOGS;

  const summary = [];
  for (const c of targets) {
    const r = await healBrand(c);
    if (r) summary.push(r);
  }

  console.log('\n── Summary ──');
  let totUpd = 0, totHeal = 0, totZero = 0;
  for (const r of summary) {
    totUpd += r.updated; totHeal += r.healed0ToN; totZero += r.zeroRemaining;
  }
  console.log(`updated=${totUpd}  healed(0→N)=${totHeal}  still_zero=${totZero}`);
  if (DRY_RUN) console.log('(dry run — nothing written)');
}

main().catch(e => {
  console.error('Fatal:', e.message);
  process.exit(1);
});
