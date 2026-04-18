#!/usr/bin/env node
/**
 * apply-official-pricing.mjs
 *
 * Official-source MSRP pipeline. Reads per-brand catalogs that already contain
 * MSRP-equivalent fields from each brand's own official source (no Amazon,
 * no third-party scraping) and updates the products table with:
 *   - price              → actual listed price from the official source
 *   - original_price     → MSRP when it is strictly greater than price (for strike-through)
 *   - msrp               → MSRP from the official source
 *   - msrp_source        → identifier of the source feed
 *   - price_updated_at   → now()
 *   - raw_pricing_data   → raw payload snapshot for auditing
 *
 * Only brands with confirmed usable official MSRP data are updated. Brands whose
 * official sources return null MSRP (DeWalt, Milwaukee, Craftsman via
 * PriceSpider) or whose endpoints are not reachable (Makita, Stanley) are left
 * untouched: their products keep NULL pricing rather than invented prices.
 *
 * Usage:
 *   node scripts/apply-official-pricing.mjs
 *   node scripts/apply-official-pricing.mjs --brand mactools
 *   node scripts/apply-official-pricing.mjs --dry-run
 */

import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '../node_modules/@supabase/supabase-js/dist/index.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));

const SUPABASE_URL     = 'https://yxwqjrgcowcsovktmkzl.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4d3Fqcmdjb3djc292a3Rta3psIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjI1NTAxMSwiZXhwIjoyMDkxODMxMDExfQ._QFQ8i4PKIpP-suSp6LbqD9V5NRGgzXZ-HTw6ovFzWs';

const args = process.argv.slice(2);
const DRY_RUN    = args.includes('--dry-run');
const ONLY_BRAND = args.includes('--brand') ? args[args.indexOf('--brand') + 1] : null;

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[®™©]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 200);
}

function productSlug(brandSlug, sku, title) {
  // Must match the slug scheme used by scripts/import-to-supabase.mjs
  return slugify(`${brandSlug}-${sku || title}`);
}

function num(v) {
  if (v == null) return null;
  const n = typeof v === 'number' ? v : parseFloat(String(v));
  return Number.isFinite(n) && n > 0 ? Number(n.toFixed(2)) : null;
}

// ── Brand extractors ────────────────────────────────────────────────────────
// Each extractor returns { price, msrp, raw } using ONLY that brand's official
// source data. Returns null when the product has no usable pricing.

/**
 * Mac Tools (mactools.com) — official Shopify products.json.
 * priceMin is the public retail price shown on mactools.com and is treated as
 * the brand's published MSRP. The priceTiers.* codes (EP/STP/NP/NA2/PO/SBD)
 * are B2B wholesale/distributor tiers, NOT MSRP, so they are not used here.
 */
function extractMacTools(p) {
  const price = num(p.priceMin);
  if (!price) return null;
  return {
    price,
    msrp:  price,
    raw:   { priceMin: p.priceMin ?? null, priceMax: p.priceMax ?? null },
  };
}

/**
 * Black+Decker (blackanddecker.com) — official Shopify Storefront API.
 * price.min        = current listed price.
 * price.compareAt  = MSRP-equivalent (compareAtPrice).
 */
function extractBlackDecker(p) {
  const price = num(p.price?.min);
  const cmp   = num(p.price?.compareAt);
  const msrp  = cmp ?? price;
  if (!price && !msrp) return null;
  return {
    price: price ?? msrp,
    msrp,
    raw:   { price: p.price ?? null },
  };
}

const BRANDS = [
  {
    slug:     'mactools',
    file:     'mactools/data/mactools-catalog.json',
    source:   'mactools-shopify',
    extract:  extractMacTools,
  },
  {
    slug:     'blackdecker',
    file:     'blackdecker/data/bd-catalog.json',
    source:   'blackdecker-shopify',
    extract:  extractBlackDecker,
  },
];

// Brands whose official MSRP source was investigated and confirmed as
// unavailable or null. Kept here as documentation so the pipeline knows
// to leave their products alone.
const UNAVAILABLE_BRANDS = [
  { slug: 'dewalt',    reason: 'PriceSpider returns msrp:null on all sampled SKUs' },
  { slug: 'milwaukee', reason: 'PriceSpider returns msrp:null on all sampled SKUs' },
  { slug: 'craftsman', reason: 'PriceSpider returns msrp:null on all sampled SKUs' },
  { slug: 'makita',    reason: 'ps-key only (4871); no configId/token exposed; no on-page MSRP' },
  { slug: 'stanley',   reason: 'stanleytools.com unreachable from this environment' },
  { slug: 'bobcat',    reason: 'heavy equipment; no official MSRP feed' },
  { slug: 'casece',    reason: 'heavy equipment; no official MSRP feed' },
  { slug: 'johndeere', reason: 'heavy equipment; no official MSRP feed' },
  { slug: 'newholland',reason: 'heavy equipment; no official MSRP feed' },
  { slug: 'skil',      reason: 'no official MSRP feed investigated yet' },
];

// ── Main ────────────────────────────────────────────────────────────────────
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

async function applyBrand({ slug, file, source, extract }) {
  const path = join(__dirname, file);
  if (!existsSync(path)) {
    console.warn(`  ⚠ Catalog not found: ${path}`);
    return { updated: 0, skipped: 0, missing: 0 };
  }

  const raw = JSON.parse(readFileSync(path, 'utf8'));
  const items = Array.isArray(raw) ? raw : raw.products ?? raw.items ?? [];
  console.log(`\n── ${slug} (${items.length} items in catalog) ──`);

  const now = new Date().toISOString();
  const updates = [];
  const slugsSeen = new Set();

  for (const p of items) {
    const title = p.title || p.name || p.sku || '';
    const sku   = p.sku || p.model || '';
    if (!title && !sku) continue;

    // Reproduce the same unique-slug logic as the importer: collisions append -1, -2...
    let base = productSlug(slug, sku, title);
    let s = base;
    let n = 1;
    while (slugsSeen.has(s)) s = `${base}-${n++}`;
    slugsSeen.add(s);

    const pricing = extract(p);
    if (!pricing) continue;

    const originalPrice = pricing.msrp && pricing.price && pricing.msrp > pricing.price
      ? pricing.msrp
      : null;

    updates.push({
      slug: s,
      row: {
        price:             pricing.price,
        original_price:    originalPrice,
        msrp:              pricing.msrp,
        msrp_source:       source,
        price_updated_at:  now,
        raw_pricing_data:  pricing.raw ?? null,
      },
    });
  }

  console.log(`  Derived pricing for ${updates.length} products`);

  if (DRY_RUN) {
    console.log('  [DRY RUN] sample updates:', updates.slice(0, 3));
    return { updated: updates.length, skipped: 0, missing: 0 };
  }

  let updated = 0, missing = 0, failed = 0;
  const CONCURRENCY = 16;
  let idx = 0;
  async function worker() {
    while (true) {
      const i = idx++;
      if (i >= updates.length) return;
      const { slug: s, row } = updates[i];
      const { data, error } = await supabase
        .from('products')
        .update(row)
        .eq('slug', s)
        .select('id');
      if (error) {
        failed++;
        if (failed <= 3) console.error(`  ERROR updating ${s}: ${error.message}`);
        continue;
      }
      if (!data || data.length === 0) missing++; else updated++;
      if ((i + 1) % 500 === 0) process.stdout.write(`    progress: ${i + 1}/${updates.length}\n`);
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  console.log(`  ✓ updated=${updated}  missing(slug not in DB)=${missing}  failed=${failed}`);
  return { updated, missing, failed };
}

async function main() {
  console.log('BULLOBUILD — Apply official-source MSRP pricing');
  console.log(`Project: ${SUPABASE_URL}`);
  if (DRY_RUN) console.log('DRY RUN mode');

  const toRun = ONLY_BRAND
    ? BRANDS.filter(b => b.slug === ONLY_BRAND)
    : BRANDS;

  if (toRun.length === 0) {
    console.error(`No supported brand matched: ${ONLY_BRAND}`);
    console.error('Supported:', BRANDS.map(b => b.slug).join(', '));
    process.exit(1);
  }

  const totals = { updated: 0, missing: 0, failed: 0 };
  for (const b of toRun) {
    const r = await applyBrand(b);
    totals.updated += r.updated ?? 0;
    totals.missing += r.missing ?? 0;
    totals.failed  += r.failed  ?? 0;
  }

  console.log('\n════════════════════════════════');
  console.log(`TOTAL updated=${totals.updated} missing=${totals.missing} failed=${totals.failed}`);
  console.log('\nOfficial-source MSRP NOT available for:');
  for (const b of UNAVAILABLE_BRANDS) console.log(`  - ${b.slug}: ${b.reason}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
