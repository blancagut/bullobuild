#!/usr/bin/env node
/**
 * import-to-supabase.mjs
 * Imports all brand catalogs into Supabase (brands + products tables)
 * Usage: node scripts/import-to-supabase.mjs
 *        node scripts/import-to-supabase.mjs --brand dewalt
 *        node scripts/import-to-supabase.mjs --dry-run
 */

import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '../node_modules/@supabase/supabase-js/dist/index.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Config ───────────────────────────────────────────────────────────────────
const SUPABASE_URL     = 'https://yxwqjrgcowcsovktmkzl.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4d3Fqcmdjb3djc292a3Rta3psIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjI1NTAxMSwiZXhwIjoyMDkxODMxMDExfQ._QFQ8i4PKIpP-suSp6LbqD9V5NRGgzXZ-HTw6ovFzWs';

const BATCH_SIZE = 200;

const args = process.argv.slice(2);
const DRY_RUN    = args.includes('--dry-run');
const ONLY_BRAND = args.includes('--brand') ? args[args.indexOf('--brand') + 1] : null;

// All brand catalog files
const CATALOGS = [
  { brand: 'Black+Decker', slug: 'blackdecker',  file: 'blackdecker/data/bd-catalog.json' },
  { brand: 'Bobcat',       slug: 'bobcat',        file: 'bobcat/data/bobcat-catalog.json' },
  { brand: 'Case CE',      slug: 'casece',        file: 'casece/data/casece-catalog.json' },
  { brand: 'Craftsman',    slug: 'craftsman',     file: 'craftsman/data/craftsman-catalog.json' },
  { brand: 'DeWalt',       slug: 'dewalt',        file: 'dewalt/data/dewalt-catalog.json' },
  { brand: 'John Deere',   slug: 'johndeere',     file: 'johndeere/data/johndeere-catalog.json' },
  { brand: 'Mac Tools',    slug: 'mactools',      file: 'mactools/data/mactools-catalog.json' },
  { brand: 'Makita',       slug: 'makita',        file: 'makita/data/makita-catalog.json' },
  { brand: 'Milwaukee',    slug: 'milwaukee',     file: 'milwaukee/data/milwaukee-catalog.json' },
  { brand: 'New Holland',  slug: 'newholland',    file: 'newholland/data/newholland-catalog.json' },
  { brand: 'Skil',         slug: 'skil',          file: 'skil/data/skil-catalog.json' },
  { brand: 'Stanley',      slug: 'stanley',       file: 'stanley/data/stanley-catalog.json' },
];

// ── Helpers ──────────────────────────────────────────────────────────────────
function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[®™©]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 200);
}

function chunks(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

// Normalize whatever shape a catalog uses for images into an array of clean URL strings.
// Supports:
//   - array of URL strings                         (most brands)
//   - array of objects with .url / .src / .image   (Mac Tools / Shopify)
//   - object keyed by variant                      (older schemas)
//   - string                                       (single hero)
// Dedupes, trims, keeps only http(s) URLs.
export function extractImageUrls(p) {
  if (!p) return [];
  const raw = [];
  const push = (v) => {
    if (!v) return;
    if (typeof v === 'string') raw.push(v);
    else if (typeof v === 'object') {
      const u = v.url || v.src || v.image || v.href || v.original || v.large;
      if (typeof u === 'string') raw.push(u);
    }
  };

  if (Array.isArray(p.images)) p.images.forEach(push);
  else if (p.images && typeof p.images === 'object') Object.values(p.images).forEach(push);
  else if (typeof p.images === 'string') push(p.images);

  // Shopify-style hero
  if (p.heroImage) push(p.heroImage);
  if (p.image) push(p.image);

  const seen = new Set();
  const out = [];
  for (let u of raw) {
    u = String(u).trim();
    if (!/^https?:\/\//i.test(u)) continue;
    if (seen.has(u)) continue;
    seen.add(u);
    out.push(u);
  }
  return out;
}

// ── Main ─────────────────────────────────────────────────────────────────────
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

async function upsertBrand(name, slug) {
  if (DRY_RUN) return `dry-run-${slug}`;
  const { data, error } = await supabase
    .from('brands')
    .upsert({ name, slug }, { onConflict: 'slug' })
    .select('id')
    .single();
  if (error) throw new Error(`Brand upsert failed: ${error.message}`);
  return data.id;
}

async function importBrand({ brand, slug, file }) {
  const filePath = join(__dirname, file);
  if (!existsSync(filePath)) {
    console.warn(`  ⚠ File not found: ${filePath}`);
    return { inserted: 0, skipped: 0 };
  }

  const raw = JSON.parse(readFileSync(filePath, 'utf8'));
  const items = Array.isArray(raw) ? raw : raw.products ?? raw.items ?? [];

  console.log(`\n── ${brand} (${items.length} productos) ──`);

  const brandId = await upsertBrand(brand, slug);
  console.log(`  Brand ID: ${brandId}`);

  // Build product rows
  const slugsSeen = new Set();
  const rows = [];

  for (const p of items) {
    const title = p.title || p.name || p.sku || '';
    const sku   = p.sku || p.model || '';
    if (!title && !sku) continue;

    // Unique slug: brand-sku or brand-title
    let base = slugify(`${slug}-${sku || title}`);
    let s = base;
    let n = 1;
    while (slugsSeen.has(s)) s = `${base}-${n++}`;
    slugsSeen.add(s);

    const images = extractImageUrls(p);

    // Enforce minimum image coverage — products without an image are not sellable.
    // We still upsert them so admins can see/fix them, but we mark stock=0 so
    // the RLS policy (stock > 0) hides them from the public storefront.
    const hasImage = images.length > 0;

    rows.push({
      name:        title.slice(0, 500),
      slug:        s,
      model:       sku.slice(0, 100),
      description: (p.description || '').slice(0, 5000),
      price:       0.00,       // placeholder — no pricing on manufacturer sites
      brand_id:    brandId,
      images:      images.slice(0, 50),
      stock:       hasImage ? 1 : 0,
      is_featured: false,
      is_deal:     false,
    });
  }

  if (DRY_RUN) {
    console.log(`  [DRY RUN] Would insert ${rows.length} products`);
    console.log('  Sample:', JSON.stringify(rows[0], null, 2).slice(0, 300));
    return { inserted: rows.length, skipped: 0 };
  }

  // Batch upsert (conflict on slug → update)
  let inserted = 0;
  let skipped  = 0;
  const batches = chunks(rows, BATCH_SIZE);

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    process.stdout.write(`  Lote ${i + 1}/${batches.length} (${batch.length} filas)... `);
    const { error, count } = await supabase
      .from('products')
      .upsert(batch, { onConflict: 'slug', ignoreDuplicates: false })
      .select('id', { count: 'exact', head: true });

    if (error) {
      console.error(`ERROR: ${error.message}`);
      skipped += batch.length;
    } else {
      inserted += batch.length;
      console.log('OK');
    }
  }

  return { inserted, skipped };
}

async function main() {
  console.log(`\nBULLOBUILD — Import a Supabase`);
  console.log(`Proyecto: ${SUPABASE_URL}`);
  if (DRY_RUN) console.log('MODO DRY-RUN activado\n');

  const toImport = ONLY_BRAND
    ? CATALOGS.filter(c => c.slug === ONLY_BRAND || c.brand.toLowerCase() === ONLY_BRAND.toLowerCase())
    : CATALOGS;

  if (toImport.length === 0) {
    console.error(`No se encontró la marca: ${ONLY_BRAND}`);
    process.exit(1);
  }

  let totalInserted = 0;
  let totalSkipped  = 0;

  for (const catalog of toImport) {
    const { inserted, skipped } = await importBrand(catalog);
    totalInserted += inserted;
    totalSkipped  += skipped;
  }

  console.log(`\n════════════════════════════════`);
  console.log(`Total insertados: ${totalInserted}`);
  console.log(`Total con error:  ${totalSkipped}`);
  console.log(`════════════════════════════════\n`);
}

// Only run main() when invoked directly, not when imported as a module.
const invokedDirectly = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (invokedDirectly) {
main().catch(err => {
  console.error('Error fatal:', err.message);
  process.exit(1);
});
}
