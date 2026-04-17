#!/usr/bin/env node
/**
 * check-image-links.mjs
 * HEAD-request every URL in products.images to find dead links.
 *
 * Usage:
 *   node scripts/check-image-links.mjs --brand milwaukee --limit 200
 *   node scripts/check-image-links.mjs --fix     # on 4xx/5xx: remove the URL from the row
 *
 * NOTE: by default runs in sample mode (--limit 200) to keep traffic sane.
 * Pass --all to check everything (30k+ rows, expect many minutes).
 */

import { createClient } from '../node_modules/@supabase/supabase-js/dist/index.mjs';

const SUPABASE_URL = 'https://yxwqjrgcowcsovktmkzl.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4d3Fqcmdjb3djc292a3Rta3psIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjI1NTAxMSwiZXhwIjoyMDkxODMxMDExfQ._QFQ8i4PKIpP-suSp6LbqD9V5NRGgzXZ-HTw6ovFzWs';

const args = process.argv.slice(2);
const BRAND_SLUG = args.includes('--brand') ? args[args.indexOf('--brand') + 1] : null;
const LIMIT = args.includes('--limit') ? Number(args[args.indexOf('--limit') + 1]) : 200;
const ALL = args.includes('--all');
const FIX = args.includes('--fix');
const CONCURRENCY = 16;

const sb = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } });

async function fetchRows() {
  let brandId = null;
  if (BRAND_SLUG) {
    const { data } = await sb.from('brands').select('id').eq('slug', BRAND_SLUG).single();
    brandId = data?.id;
    if (!brandId) throw new Error(`Unknown brand: ${BRAND_SLUG}`);
  }
  const rows = [];
  const PAGE = 1000;
  let from = 0;
  const target = ALL ? Infinity : LIMIT;
  while (rows.length < target) {
    let q = sb.from('products').select('id, slug, images, brand_id').range(from, from + PAGE - 1);
    if (brandId) q = q.eq('brand_id', brandId);
    const { data, error } = await q;
    if (error) throw new Error(error.message);
    if (!data || data.length === 0) break;
    rows.push(...data);
    if (data.length < PAGE) break;
    from += PAGE;
  }
  return rows.slice(0, target);
}

async function head(url) {
  // Try HEAD first (cheap). If HEAD is blocked (405/403) or times out, fall
  // back to a ranged GET (bytes=0-0) so we don't flag live images as dead.
  try {
    const res = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      headers: { 'User-Agent': 'Mozilla/5.0 (link-checker)' },
      signal: AbortSignal.timeout(10000),
    });
    if (res.status >= 200 && res.status < 400) return res.status;
    if (res.status !== 405 && res.status !== 403) return res.status;
  } catch {
    // fall through to GET
  }
  try {
    const res = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      headers: { 'User-Agent': 'Mozilla/5.0 (link-checker)', Range: 'bytes=0-0' },
      signal: AbortSignal.timeout(15000),
    });
    // Drain body so the socket releases
    try { await res.arrayBuffer(); } catch {}
    return res.status;
  } catch {
    return 0;
  }
}

async function runWithConcurrency(items, fn, n) {
  const out = new Array(items.length);
  let i = 0;
  async function worker() {
    while (true) {
      const idx = i++;
      if (idx >= items.length) return;
      out[idx] = await fn(items[idx], idx);
    }
  }
  await Promise.all(Array.from({ length: n }, () => worker()));
  return out;
}

async function main() {
  const rows = await fetchRows();
  // Build (rowId, url) pairs
  const urls = [];
  for (const r of rows) {
    const imgs = Array.isArray(r.images) ? r.images : [];
    for (const u of imgs) urls.push({ rowId: r.id, slug: r.slug, url: u });
  }
  console.log(`Checking ${urls.length} image URLs across ${rows.length} products (concurrency=${CONCURRENCY})...`);

  const results = await runWithConcurrency(
    urls,
    async (u) => ({ ...u, status: await head(u.url) }),
    CONCURRENCY,
  );

  const byBucket = { ok: 0, notfound: 0, server: 0, network: 0, other: 0 };
  const dead = [];
  for (const r of results) {
    if (r.status >= 200 && r.status < 400) byBucket.ok += 1;
    else if (r.status >= 400 && r.status < 500) { byBucket.notfound += 1; dead.push(r); }
    else if (r.status >= 500) { byBucket.server += 1; dead.push(r); }
    else if (r.status === 0) { byBucket.network += 1; dead.push(r); }
    else byBucket.other += 1;
  }

  console.log(`\n── Results ──`);
  console.log(`ok          ${byBucket.ok}`);
  console.log(`4xx         ${byBucket.notfound}`);
  console.log(`5xx         ${byBucket.server}`);
  console.log(`network/DNS ${byBucket.network}`);
  console.log(`other       ${byBucket.other}`);

  if (dead.length > 0) {
    console.log(`\n── Sample dead URLs (first 20) ──`);
    for (const d of dead.slice(0, 20)) {
      console.log(`  [${d.slug}] ${d.status}  ${d.url}`);
    }
  }

  if (FIX && dead.length > 0) {
    console.log(`\nRemoving ${dead.length} dead URLs...`);
    const byRow = new Map();
    for (const d of dead) {
      if (!byRow.has(d.rowId)) byRow.set(d.rowId, new Set());
      byRow.get(d.rowId).add(d.url);
    }
    for (const [rowId, badSet] of byRow.entries()) {
      const row = rows.find(r => r.id === rowId);
      const cleaned = (row.images || []).filter(u => !badSet.has(u));
      const stock = cleaned.length > 0 ? 1 : 0;
      await sb.from('products').update({ images: cleaned, stock }).eq('id', rowId);
    }
    console.log('Done.');
  }

  // Non-zero exit for CI when dead links exist
  if (dead.length > 0) process.exit(1);
}

main().catch(e => {
  console.error('Fatal:', e.message);
  process.exit(1);
});
