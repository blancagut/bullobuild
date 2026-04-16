#!/usr/bin/env node
/**
 * Case Construction Equipment catalog scraper — compact equipment only
 * Source sitemap: https://www.casece.com/northamerica/en-us/sitemap.xml
 * Product URLs:   https://www.casece.com/en-us/northamerica/products/...
 * Data:           og:title, og:description, og:image
 * Images:         Sitecore Content Hub CDN (cnhi-p-001-delivery.sitecorecontenthub.cloud)
 */

import { execFile } from 'child_process';
import { promisify } from 'util';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const execFileAsync = promisify(execFile);
const __dirname = dirname(fileURLToPath(import.meta.url));

const DATA_DIR = join(__dirname, 'data');
const CATALOG_FILE = join(DATA_DIR, 'casece-catalog.json');
const PROGRESS_FILE = join(DATA_DIR, 'casece-progress.json');
const SITEMAP_URL = 'https://www.casece.com/northamerica/en-us/sitemap.xml';

const CONCURRENCY = 3;
const TIMEOUT_SEC = 30;
const DELAY_MS = 500;
const CHECKPOINT_EVERY = 20;

if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function curlGet(url) {
  const { stdout } = await execFileAsync('curl', [
    '-sL', url,
    '-H', 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    '-H', 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    '-H', 'Accept-Language: en-US,en;q=0.9',
    '-H', 'Sec-Fetch-Dest: document',
    '-H', 'Sec-Fetch-Mode: navigate',
    '-H', 'Sec-Fetch-Site: none',
    '-H', 'Sec-Fetch-User: ?1',
    '-H', 'Upgrade-Insecure-Requests: 1',
    '--max-time', String(TIMEOUT_SEC),
    '--compressed',
  ], { maxBuffer: 10 * 1024 * 1024 });
  return stdout;
}

async function fetchSitemap() {
  console.log('Fetching sitemap…');
  const xml = await curlGet(SITEMAP_URL);
  const matches = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1].trim());
  return matches;
}

// URL must be a product page (not a listing/category page)
// Include compact equipment types only — exclude heavy machinery
const COMPACT_INCLUDE = [
  'skid-steer', 'track-loader', 'excavator', 'backhoe',
  'telehandler', 'mini', 'compact', 'dozer-loader', 'tl100',
  'compaction', 'trencher',
];
const COMPACT_EXCLUDE = [
  'motor-grader', 'articulated-dump', 'crawler-dozer',
  'crawler-loader', 'specialty', 'large-excavator',
];

const CATEGORY_SLUGS = new Set([
  'excavators',
  'compaction-equipment',
  'mini-attachments',
  'wheeled-excavators',
  'backhoes',
  'backhoe-loaders',
  'compact-track-loaders',
  'double-drum-rollers',
  'single-drum-rollers',
  'mini-excavators',
  'midi-excavators',
  'skid-steer-loaders',
  'compact-wheel-loaders',
]);

function isCompactProductUrl(url) {
  if (!url.includes('/products/')) return false;
  const path = (url.split('/products/')[1] || '').replace(/\/$/, '');
  if (!path) return false;
  const lower = path.toLowerCase();
  if (lower.startsWith('attachments/') || lower.includes('/attachments/')) return false;
  if (COMPACT_EXCLUDE.some(k => lower.includes(k))) return false;
  if (!COMPACT_INCLUDE.some(k => lower.includes(k))) return false;

  const slug = lower.split('/').filter(Boolean).pop();
  return !CATEGORY_SLUGS.has(slug);
}

function getCategoryFromUrl(url) {
  const path = url.split('/products/')[1] || '';
  if (path.includes('skid-steer')) return 'Skid-Steer Loader';
  if (path.includes('compact-track-loader') || path.includes('track-loader')) return 'Compact Track Loader';
  if (path.includes('mini-excavator') || path.includes('compact-excavator')) return 'Compact Excavator';
  if (path.includes('backhoe')) return 'Backhoe Loader';
  if (path.includes('telehandler')) return 'Telehandler';
  if (path.includes('mini-track-loader') || path.includes('tl100')) return 'Mini Track Loader';
  if (path.includes('dozer-loader')) return 'Compact Dozer Loader';
  if (path.includes('compaction')) return 'Compaction Equipment';
  if (path.includes('trencher')) return 'Trencher';
  if (path.includes('wheel-loader')) return 'Wheel Loader';
  return 'Equipment';
}

function extractCnhiImages(html) {
  // Match Sitecore Content Hub CDN image URLs
  const re = /https:\/\/cnhi-p-001-delivery\.sitecorecontenthub\.cloud\/api\/public\/content\/[a-f0-9A-F-]+\?[^"'\s<>]*/g;
  const found = [...new Set(html.match(re) || [])];

  return found
    .filter(u => {
      // Exclude CSS context: URLs followed by semicolons (background-image properties)
      const idx = html.indexOf(u);
      const after = html.slice(idx + u.length, idx + u.length + 30);
      return !after.includes(';') && !u.includes(';');
    })
    .map(u => {
      // Upgrade to Size1000 for larger images
      const base = u.split('&t=')[0].split('?')[0];
      const vMatch = u.match(/[?&]v=([^&"'\s<>]+)/);
      const v = vMatch ? vMatch[1] : '';
      return v ? `${base}?v=${v}&t=Size1000` : `${base}?t=Size1000`;
    })
    .filter((u, i, arr) => arr.indexOf(u) === i); // deduplicate after transform
}

function parseProductPage(html, url) {
  // Extract og: meta tags
  const og = {};
  for (const m of html.matchAll(/property="og:([^"]+)"\s+content="([^"]*)"/g)) og[m[1]] = m[2];
  for (const m of html.matchAll(/content="([^"]*)"\s+property="og:([^"]+)"/g)) og[m[2]] = og[m[2]] || m[1];

  const title = og['title']?.trim() || '';
  const description = og['description']?.trim() || '';
  if (!title) return null;

  const urlParts = url.split('/').filter(Boolean);
  const slug = urlParts[urlParts.length - 1];
  const category = getCategoryFromUrl(url);

  const images = extractCnhiImages(html);

  // Ensure og:image is first
  if (og['image'] && !images.includes(og['image'])) {
    const ogImg = og['image'];
    const vMatch = ogImg.match(/[?&]v=([^&"'\s<>]+)/);
    const base = ogImg.split('&t=')[0].split('?')[0];
    const upgraded = vMatch ? `${base}?v=${vMatch[1]}&t=Size1000` : `${base}?t=Size1000`;
    images.unshift(upgraded);
  }

  return {
    id: slug,
    brand: 'Case CE',
    title,
    description,
    category,
    images: [...new Set(images)].slice(0, 12),
    url,
    source: 'casece.com',
  };
}

async function scrapeProduct(url) {
  const html = await curlGet(url);
  return parseProductPage(html, url);
}

async function runWorker(queue, results, progress, done) {
  while (queue.length > 0) {
    const url = queue.shift();
    if (!url) break;

    const slug = url.split('/').filter(Boolean).pop();

    if (progress[slug]) {
      done.count++;
      continue;
    }

    for (let attempt = 0; attempt <= 1; attempt++) {
      try {
        const product = await scrapeProduct(url);
        if (product) {
          results.push(product);
          progress[slug] = true;
        } else {
          progress[slug] = 'empty';
          console.error(`\n  EMPTY: ${url}`);
        }
        break;
      } catch (err) {
        if (attempt === 1) {
          console.error(`\n  ERR ${slug}: ${err.message?.slice(0, 80)}`);
          progress[slug] = 'error';
        } else {
          await sleep(3000);
        }
      }
    }

    done.count++;
    const pct = ((done.count / done.total) * 100).toFixed(1);
    process.stdout.write(
      `\r[${Math.floor(process.uptime())}s] ${done.count}/${done.total} (${pct}%) — products:${results.length}   `
    );

    if (done.count % CHECKPOINT_EVERY === 0) {
      writeFileSync(CATALOG_FILE, JSON.stringify(results, null, 2));
      writeFileSync(PROGRESS_FILE, JSON.stringify(progress));
    }

    await sleep(DELAY_MS);
  }
}

async function main() {
  const allUrls = await fetchSitemap();
  const productUrls = allUrls.filter(isCompactProductUrl);
  console.log(`Sitemap URLs: ${allUrls.length} total, ${productUrls.length} compact equipment`);

  let progress = {};
  if (existsSync(PROGRESS_FILE)) {
    try { progress = JSON.parse(readFileSync(PROGRESS_FILE, 'utf8')); } catch {}
  }

  let results = [];
  if (existsSync(CATALOG_FILE)) {
    try { results = JSON.parse(readFileSync(CATALOG_FILE, 'utf8')); } catch {}
  }

  const doneSet = new Set(Object.keys(progress).filter(k => progress[k] === true));
  const queue = productUrls.filter(u => {
    const slug = u.split('/').filter(Boolean).pop();
    return !doneSet.has(slug);
  });

  const done = { count: productUrls.length - queue.length, total: productUrls.length };

  if (queue.length === 0) {
    console.log(`All ${results.length} products already scraped.`);
    return;
  }

  console.log(`Scraping ${queue.length} products (${CONCURRENCY} workers)…`);

  const workers = Array.from({ length: CONCURRENCY }, () =>
    runWorker(queue, results, progress, done)
  );
  await Promise.all(workers);

  process.stdout.write('\n');
  writeFileSync(CATALOG_FILE, JSON.stringify(results, null, 2));
  writeFileSync(PROGRESS_FILE, JSON.stringify(progress));
  console.log(`Done! Saved ${results.length} products to ${CATALOG_FILE}`);
  console.log(`  With images: ${results.filter(p => p.images.length > 0).length}`);
  console.log(`  Categories: ${[...new Set(results.map(p => p.category))].join(', ')}`);
}

main().catch(err => { console.error(err); process.exit(1); });
