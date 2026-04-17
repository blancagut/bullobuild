#!/usr/bin/env node
/**
 * diff-catalog-vs-db.mjs
 * For each brand catalog JSON, compare image counts vs what's in Supabase.
 * Identifies SKUs where the importer lost images (leak).
 *
 * Usage:
 *   node scripts/diff-catalog-vs-db.mjs
 *   node scripts/diff-catalog-vs-db.mjs --brand makita
 */

import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '../node_modules/@supabase/supabase-js/dist/index.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));

const SUPABASE_URL = 'https://yxwqjrgcowcsovktmkzl.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4d3Fqcmdjb3djc292a3Rta3psIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjI1NTAxMSwiZXhwIjoyMDkxODMxMDExfQ._QFQ8i4PKIpP-suSp6LbqD9V5NRGgzXZ-HTw6ovFzWs';

const args = process.argv.slice(2);
const ONLY_BRAND = args.includes('--brand') ? args[args.indexOf('--brand') + 1] : null;

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

function extractCatalogImages(p) {
  // Mirrors importer logic — plus stricter URL check
  if (Array.isArray(p.images)) {
    return p.images.filter(v => typeof v === 'string' && /^https?:\/\//.test(v));
  }
  if (p.images && typeof p.images === 'object') {
    return Object.values(p.images).filter(v => typeof v === 'string' && /^https?:\/\//.test(v));
  }
  return [];
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
      .select('slug, images')
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

const pad = (s, n) => String(s).padEnd(n);
const padL = (s, n) => String(s).padStart(n);

async function diffBrand({ brand, slug, file }) {
  const filePath = join(__dirname, file);
  if (!existsSync(filePath)) {
    console.log(`\n[${brand}] catalog not found, skipping`);
    return null;
  }

  const raw = JSON.parse(readFileSync(filePath, 'utf8'));
  const items = Array.isArray(raw) ? raw : raw.products ?? raw.items ?? [];

  // Build catalog map keyed by the same slug used in importer
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
    catalogMap.set(s, extractCatalogImages(p));
  }

  const brandId = await getBrandId(slug);
  if (!brandId) {
    console.log(`\n[${brand}] brand row not found in DB, skipping`);
    return null;
  }
  const dbRows = await fetchBrandProducts(brandId);
  const dbMap = new Map(dbRows.map(r => [r.slug, Array.isArray(r.images) ? r.images.length : 0]));

  let catalogSum = 0;
  let dbSum = 0;
  let leaks = 0; // catalog has MORE than DB
  let missingInDb = 0;
  let missingInCatalog = 0;
  const leakSamples = [];

  for (const [s, imgs] of catalogMap.entries()) {
    catalogSum += imgs.length;
    const dbCount = dbMap.get(s);
    if (dbCount === undefined) {
      missingInDb += 1;
      continue;
    }
    dbSum += dbCount;
    if (imgs.length > dbCount) {
      leaks += 1;
      if (leakSamples.length < 5) leakSamples.push({ slug: s, catalog: imgs.length, db: dbCount });
    }
  }
  for (const s of dbMap.keys()) {
    if (!catalogMap.has(s)) missingInCatalog += 1;
  }

  return {
    brand,
    slug,
    catalogCount: catalogMap.size,
    dbCount: dbMap.size,
    catalogAvg: catalogMap.size ? catalogSum / catalogMap.size : 0,
    dbAvg: dbMap.size ? dbSum / dbMap.size : 0,
    leaks,
    missingInDb,
    missingInCatalog,
    leakSamples,
  };
}

async function main() {
  const targets = ONLY_BRAND
    ? CATALOGS.filter(c => c.slug === ONLY_BRAND)
    : CATALOGS;

  console.log(`Diffing ${targets.length} brand(s)...`);
  const results = [];
  for (const c of targets) {
    const r = await diffBrand(c);
    if (r) results.push(r);
  }

  console.log(`\n${pad('brand', 14)} ${padL('cat#', 7)} ${padL('db#', 7)} ${padL('catAvg', 8)} ${padL('dbAvg', 8)} ${padL('leaks', 8)} ${padL('missDB', 8)} ${padL('missCat', 8)}`);
  for (const r of results) {
    console.log(
      `${pad(r.brand, 14)} ${padL(r.catalogCount, 7)} ${padL(r.dbCount, 7)} ${padL(r.catalogAvg.toFixed(2), 8)} ${padL(r.dbAvg.toFixed(2), 8)} ${padL(r.leaks, 8)} ${padL(r.missingInDb, 8)} ${padL(r.missingInCatalog, 8)}`
    );
  }

  console.log('\n── leak samples (catalog has MORE images than DB) ──');
  for (const r of results) {
    if (r.leakSamples.length === 0) continue;
    console.log(`\n[${r.brand}]`);
    for (const s of r.leakSamples) {
      console.log(`  ${s.slug}  catalog=${s.catalog}  db=${s.db}`);
    }
  }
}

main().catch(e => {
  console.error('Fatal:', e.message);
  process.exit(1);
});
