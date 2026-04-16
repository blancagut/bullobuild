#!/usr/bin/env node
/**
 * Skil catalog scraper
 * Source: www.skil.com Shopify store (giguj2-z2.myshopify.com)
 * Method: /products.json Shopify public API  —  no auth token needed
 * Output: scripts/skil/data/skil-catalog.json
 */

import { createWriteStream, existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, 'data');
const OUTPUT_FILE = join(DATA_DIR, 'skil-catalog.json');

if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });

const SHOP_HOST = 'www.skil.com';

// ── helpers ──────────────────────────────────────────────────────────────────

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function get(path) {
  return new Promise((res, rej) => {
    const opts = {
      hostname: SHOP_HOST,
      path,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'application/json',
      },
    };
    https.get(opts, r => {
      let d = '';
      r.on('data', c => d += c);
      r.on('end', () => {
        try { res(JSON.parse(d)); }
        catch (e) { rej(new Error(`JSON parse error: ${d.slice(0, 100)}`)); }
      });
    }).on('error', rej);
  });
}

function stripHtml(html) {
  if (!html) return '';
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// ── transform ────────────────────────────────────────────────────────────────

function transformProduct(p) {
  const variant = p.variants?.[0] ?? {};
  const allVariantSkus = [...new Set(
    p.variants?.map(v => v.sku).filter(Boolean) ?? []
  )];

  // Primary SKU = first variant's SKU, fall back to handle
  const sku = variant.sku || p.handle;

  // Price — use first available variant, fall back to any
  const price = parseFloat(
    p.variants?.find(v => v.price)?.price ?? variant.price ?? '0'
  ) || null;
  const compareAtPrice = parseFloat(variant.compare_at_price ?? '0') || null;

  // Images — all unique src URLs (strip Shopify transform params)
  const images = [
    ...new Set(p.images?.map(img => img.src.split('?')[0]) ?? [])
  ];

  // Categories from product_type and tags
  const categories = [
    ...(p.product_type ? [p.product_type] : []),
    ...(p.tags ?? []),
  ].filter(Boolean);

  return {
    id: String(p.id),
    sku,
    allVariantSkus,
    brand: 'SKIL',
    title: p.title,
    handle: p.handle,
    description: stripHtml(p.body_html),
    price,
    compareAtPrice,
    currency: 'USD',
    available: p.variants?.some(v => v.available) ?? false,
    category: p.product_type || '',
    tags: p.tags ?? [],
    categories,
    images,
    url: `https://www.skil.com/products/${p.handle}`,
    vendor: p.vendor,
    publishedAt: p.published_at,
    updatedAt: p.updated_at,
    scrapedAt: new Date().toISOString(),
  };
}

// ── main ─────────────────────────────────────────────────────────────────────

async function main() {
  const products = [];
  let page = 1;
  let totalFetched = 0;

  console.log(`Fetching Skil catalog from ${SHOP_HOST}…`);

  while (true) {
    const path = `/products.json?limit=250&page=${page}`;
    let data;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        data = await get(path);
        break;
      } catch (err) {
        if (attempt === 2) throw err;
        console.error(`  Retry ${attempt + 1} page ${page}: ${err.message}`);
        await sleep(2000);
      }
    }

    const batch = data.products ?? [];
    if (batch.length === 0) break;

    for (const p of batch) {
      products.push(transformProduct(p));
    }

    totalFetched += batch.length;
    console.log(`  Page ${page}: ${batch.length} products (total: ${totalFetched})`);

    if (batch.length < 250) break;
    page++;
    await sleep(500);
  }

  writeFileSync(OUTPUT_FILE, JSON.stringify(products, null, 2));
  console.log(`\nDone! Saved ${products.length} products to ${OUTPUT_FILE}`);

  // Quick stats
  const withPrice = products.filter(p => p.price).length;
  const withImages = products.filter(p => p.images.length > 0).length;
  const totalImages = products.reduce((s, p) => s + p.images.length, 0);
  console.log(`  With price: ${withPrice}/${products.length}`);
  console.log(`  With images: ${withImages}/${products.length} (${totalImages} total images)`);
}

main().catch(err => { console.error(err); process.exit(1); });
