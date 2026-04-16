#!/usr/bin/env node
/**
 * New Holland Construction catalog scraper — compact equipment only
 * Source sitemap: https://construction.newholland.com/en-us/northamerica/sitemap.xml
 * Product URLs:   https://construction.newholland.com/en-us/northamerica/products/...
 * Platform:       CNH Industrial / Sitecore Content Hub (same as Case CE)
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
const CATALOG_FILE = join(DATA_DIR, 'newholland-catalog.json');
const PROGRESS_FILE = join(DATA_DIR, 'newholland-progress.json');
const SITEMAP_URL = 'https://construction.newholland.com/en-us/northamerica/sitemap.xml';

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
  // Handle sitemap index: if it lists other sitemaps, fetch those too
  const sitemapLocs = [...xml.matchAll(/<sitemap>\s*<loc>([^<]+)<\/loc>/g)].map(m => m[1].trim());
  if (sitemapLocs.length > 0) {
    // Filter to northamerica sitemap
    const naSitemaps = sitemapLocs.filter(u => u.includes('northamerica') || u.includes('en-us'));
    const allUrls = [];
    for (const smUrl of (naSitemaps.length > 0 ? naSitemaps : sitemapLocs)) {
      console.log(`  Fetching sub-sitemap: ${smUrl}`);
      try {
        const subXml = await curlGet(smUrl);
        const locs = [...subXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1].trim());
        allUrls.push(...locs);
      } catch (err) {
        console.error(`  ERR fetching sub-sitemap: ${err.message?.slice(0, 60)}`);
      }
      await sleep(500);
    }
    return allUrls;
  }
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1].trim());
}

const COMPACT_EXCLUDE = [
  'motor-grader', 'articulated-dump', 'crawler-dozer',
  'crawler-loader', 'large',
];

function isCompactProductUrl(url) {
  if (!url.includes('/products/light-construction-equipment/')) return false;
  const path = (url.split('/products/')[1] || '').replace(/\/$/, '');
  if (!path) return false;
  const parts = path.split('/').filter(Boolean);
  if (parts.length < 3) return false;

  const lower = path.toLowerCase();
  if (COMPACT_EXCLUDE.some(k => lower.includes(k))) return false;
  return true;
}

function getCategoryFromUrl(url) {
  const path = (url.split('/products/')[1] || '').toLowerCase();
  if (path.includes('skid-steer')) return 'Skid-Steer Loader';
  if (path.includes('compact-track-loader') || path.includes('track-loader')) return 'Compact Track Loader';
  if (path.includes('excavator')) return 'Compact Excavator';
  if (path.includes('backhoe')) return 'Backhoe Loader';
  if (path.includes('telehandler')) return 'Telehandler';
  if (path.includes('mini-track-loader') || path.includes('mini-loader')) return 'Mini Loader';
  if (path.includes('attachment')) return 'Attachment';
  if (path.includes('light-construction')) return 'Light Construction';
  return 'Equipment';
}

function extractCnhiImages(html) {
  const re = /https:\/\/cnhi-p-001-delivery\.sitecorecontenthub\.cloud\/api\/public\/content\/[a-f0-9A-F-]+\?[^"'\s<>]*/g;
  const found = [...new Set(html.match(re) || [])];

  return found
    .filter(u => {
      const idx = html.indexOf(u);
      const after = html.slice(idx + u.length, idx + u.length + 30);
      return !after.includes(';') && !u.includes(';');
    })
    .map(u => {
      const base = u.split('&t=')[0].split('?')[0];
      const vMatch = u.match(/[?&]v=([^&"'\s<>]+)/);
      const v = vMatch ? vMatch[1] : '';
      return v ? `${base}?v=${v}&t=Size1000` : `${base}?t=Size1000`;
    })
    .filter((u, i, arr) => arr.indexOf(u) === i);
}

function parseProductPage(html, url) {
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

  if (og['image'] && !images.includes(og['image'])) {
    const ogImg = og['image'];
    const vMatch = ogImg.match(/[?&]v=([^&"'\s<>]+)/);
    const base = ogImg.split('&t=')[0].split('?')[0];
    const upgraded = vMatch ? `${base}?v=${vMatch[1]}&t=Size1000` : `${base}?t=Size1000`;
    if (!images.includes(upgraded)) images.unshift(upgraded);
  }

  return {
    id: slug,
    brand: 'New Holland',
    title,
    description,
    category,
    images: [...new Set(images)].slice(0, 12),
    url,
    source: 'construction.newholland.com',
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

  if (productUrls.length === 0) {
    console.log('No compact product URLs found. Showing all /products/ URLs for investigation:');
    allUrls.filter(u => u.includes('/products/')).slice(0, 20).forEach(u => console.log(' ', u));
    process.exit(1);
  }

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
