/**
 * Stanley Tools catalog scraper
 * Source: stanleytools.com (Drupal/Acquia)
 * Images: /NAG/PRODUCT/IMAGES/HIRES/Ecomm_Large-{SKU}_{N}.jpg (from thumbnail slider)
 * Prices: PriceSpider retailer widget (JS-rendered, stored as null)
 * Run: node scripts/stanley/scrape-catalog.mjs [--resume] [--limit N] [--concurrency N]
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { mkdir } from 'fs/promises';

const OUTPUT_FILE = new URL('./data/stanley-catalog.json', import.meta.url).pathname;
const PROGRESS_FILE = new URL('./data/stanley-progress.json', import.meta.url).pathname;
const SITEMAP_URL = 'https://www.stanleytools.com/sitemap.xml';
const BASE_URL = 'https://www.stanleytools.com';
const FALLBACK_BYNDER_HASH = '3f4dcbe4c38e4f12'; // generic stanley category fallback image

const args = process.argv.slice(2);
const RESUME = args.includes('--resume');
const LIMIT = (() => { const i = args.indexOf('--limit'); return i >= 0 ? parseInt(args[i+1]) : 0; })();
const CONCURRENCY = (() => { const i = args.indexOf('--concurrency'); return i >= 0 ? parseInt(args[i+1]) : 5; })();
const DELAY_MS = 400;

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

function decodeEntities(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&#039;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .trim();
}

async function getSitemapUrls() {
  const resp = await fetch(SITEMAP_URL, { headers: { 'User-Agent': UA } });
  if (!resp.ok) throw new Error(`Sitemap fetch failed: ${resp.status}`);
  const xml = await resp.text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map(m => m[1])
    .filter(u => u.includes('/product/'));
}

function parseProduct(html, url) {
  const urlSku = url.split('/product/')[1]?.split('/')[0]?.toUpperCase() || '';

  // SKU from page element (more accurate casing)
  const pageSku = html.match(/class="[^"]*product-id[^"]*">([^<]+)</)?.[1]?.trim() || urlSku;

  // Title
  const title = decodeEntities(
    html.match(/<title>([^<]+)<\/title>/)?.[1]
      ?.replace(/\s*\|\s*STANLEY[^<]*$/, '')
      .trim() || ''
  );

  // Meta description
  const description = decodeEntities(
    html.match(/<meta name="description" content="([^"]+)"/)?.[1] || ''
  );

  // Images from thumbnail slider (any /NAG/PRODUCT/IMAGES/HIRES/ paths, deduplicated)
  const imgSet = new Set();
  for (const m of html.matchAll(/\/NAG\/PRODUCT\/IMAGES\/HIRES\/([^"'\s?>]+)/g)) {
    imgSet.add(BASE_URL + '/NAG/PRODUCT/IMAGES/HIRES/' + m[1].split('?')[0].replace(/^\//, ''));
  }
  const images = [...imgSet];
  const heroImage = images[0] || null;

  // Breadcrumbs (from nav with 'breadcrumb' class)
  const categories = [];
  const bcNav = html.match(/class="[^"]*breadcrumb[^"]*"[\s\S]{0,5000}?<\/nav>/i);
  if (bcNav) {
    for (const m of bcNav[0].matchAll(/<a[^>]+href="([^"]+)"[^>]*>([^<]+)<\/a>/g)) {
      const label = decodeEntities(m[2]);
      if (label && label !== 'Home') categories.push(label);
    }
  }
  const category = categories[categories.length - 1] || '';

  // Specifications from HTML table rows with 2 cells
  const specifications = {};
  for (const row of html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/g)) {
    const cells = [...row[1].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/g)]
      .map(c => decodeEntities(c[1].replace(/<[^>]+>/g, '')));
    if (cells.length === 2 && cells[0] && cells[1]) {
      specifications[cells[0]] = cells[1];
    }
  }

  // Features from bullet lists near a "feature" heading
  const features = [];
  const featSection = html.match(/[Ff]eature[^<]{0,50}<\/h[23]>([\s\S]{0,4000}?)<\/(?:ul|section)>/);
  if (featSection) {
    for (const li of featSection[1].matchAll(/<li[^>]*>([\s\S]*?)<\/li>/g)) {
      const text = decodeEntities(li[1].replace(/<[^>]+>/g, ''));
      if (text) features.push(text);
    }
  }

  // UPC — 12-13 digit codes in HTML
  const upcMatch = html.match(/\b(\d{12,13})\b/);
  const upc = upcMatch?.[1] || null;

  return {
    sku: pageSku,
    name: title,
    url,
    description,
    images,
    heroImage,
    category,
    categories,
    categoryPath: categories.join(' > '),
    features,
    specifications: Object.keys(specifications).length ? specifications : null,
    upc,
    price: null, // Prices via PriceSpider JS widget (retailer-dependent, not server-rendered)
  };
}

async function scrapeProduct(url) {
  const resp = await fetch(url, {
    headers: { 'User-Agent': UA },
    redirect: 'follow',
  });
  if (!resp.ok) {
    if (resp.status === 404) return null; // product removed
    throw new Error(`HTTP ${resp.status}`);
  }
  const html = await resp.text();
  if (html.includes('Error 404') && html.includes('<title>Error')) return null;
  return parseProduct(html, url);
}

async function runWithConcurrency(tasks, concurrency) {
  const results = [];
  let idx = 0;
  async function worker() {
    while (idx < tasks.length) {
      const i = idx++;
      results[i] = await tasks[i]();
    }
  }
  await Promise.all(Array.from({ length: concurrency }, worker));
  return results;
}

async function main() {
  await mkdir(new URL('./data', import.meta.url).pathname, { recursive: true });

  console.log('Fetching sitemap...');
  const allUrls = await getSitemapUrls();
  console.log(`Found ${allUrls.length} product URLs`);

  const urls = LIMIT > 0 ? allUrls.slice(0, LIMIT) : allUrls;

  // Resume: load existing catalog
  let catalog = [];
  let done = new Set();
  if (RESUME && existsSync(OUTPUT_FILE)) {
    catalog = JSON.parse(readFileSync(OUTPUT_FILE, 'utf8'));
    done = new Set(catalog.map(p => p.url));
    console.log(`Resuming: ${done.size} already done`);
  }

  const pending = urls.filter(u => !done.has(u));
  console.log(`${pending.length} products to scrape (concurrency=${CONCURRENCY})`);

  let completed = 0;
  let skipped = 0;
  let errors = 0;
  const startTime = Date.now();

  // Process in batches
  const batchSize = CONCURRENCY;
  for (let i = 0; i < pending.length; i += batchSize) {
    const batch = pending.slice(i, i + batchSize);
    const batchTasks = batch.map(url => async () => {
      await new Promise(r => setTimeout(r, DELAY_MS));
      try {
        const product = await scrapeProduct(url);
        if (product) {
          catalog.push(product);
          completed++;
        } else {
          skipped++;
        }
      } catch (e) {
        errors++;
        console.error(`  ERR ${url.split('/product/')[1]?.split('/')[0]}: ${e.message}`);
      }
    });

    await runWithConcurrency(batchTasks, CONCURRENCY);

    // Save checkpoint
    writeFileSync(OUTPUT_FILE, JSON.stringify(catalog, null, 2));

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
    const done2 = completed + skipped + errors;
    const pct = ((done2 / pending.length) * 100).toFixed(1);
    console.log(`[${elapsed}s] ${done2}/${pending.length} (${pct}%) — ok:${completed} skip:${skipped} err:${errors}`);
  }

  writeFileSync(OUTPUT_FILE, JSON.stringify(catalog, null, 2));

  const withImages = catalog.filter(p => p.images.length > 0).length;
  const withSpecs = catalog.filter(p => p.specifications).length;
  console.log('\n=== Done ===');
  console.log(`Total: ${catalog.length} products`);
  console.log(`With images: ${withImages}`);
  console.log(`With specs: ${withSpecs}`);
  console.log(`Skipped (404): ${skipped}, Errors: ${errors}`);
  console.log(`Output: ${OUTPUT_FILE}`);
}

main().catch(e => { console.error(e); process.exit(1); });
