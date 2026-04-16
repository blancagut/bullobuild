#!/usr/bin/env node
/**
 * Bobcat catalog scraper
 * Source: https://www.bobcat.com/na/en/sitemap.xml
 * Products: attachments + compact equipment (skid steers, CTLs, excavators, etc.)
 * Images: Cloudinary (doosan-bobcat cloud)
 * Note: pages are ~2MB uncompressed — do NOT use --compressed (triggers CAPTCHA)
 *       Must include Sec-Fetch headers to get real product HTML
 */

import { execFile } from 'child_process';
import { promisify } from 'util';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const execFileAsync = promisify(execFile);
const __dirname = dirname(fileURLToPath(import.meta.url));

const DATA_DIR = join(__dirname, 'data');
const CATALOG_FILE = join(DATA_DIR, 'bobcat-catalog.json');
const PROGRESS_FILE = join(DATA_DIR, 'bobcat-progress.json');
const SITEMAP_URL = 'https://www.bobcat.com/na/en/sitemap.xml';

const CONCURRENCY = 3;
const TIMEOUT_SEC = 60;
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
    // NOTE: do NOT add --compressed — it triggers CAPTCHA on equipment pages
  ], { maxBuffer: 25 * 1024 * 1024 }); // 25MB buffer (uncompressed pages ~2MB)
  return stdout;
}

async function fetchSitemap() {
  console.log('Fetching sitemap…');
  const xml = await curlGet(SITEMAP_URL);
  const matches = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
  return matches;
}

function getCategoryFromUrl(url) {
  const path = url.replace('https://www.bobcat.com/na/en/', '');
  if (path.startsWith('attachments/')) {
    return 'Attachment';
  }
  const equip = path.replace('equipment/', '');
  if (equip.startsWith('loaders/skid-steer')) return 'Skid-Steer Loader';
  if (equip.startsWith('loaders/compact-track')) return 'Compact Track Loader';
  if (equip.startsWith('loaders/mini-track')) return 'Mini Track Loader';
  if (equip.startsWith('loaders/')) return 'Loader';
  if (equip.startsWith('excavators/compact')) return 'Compact Excavator';
  if (equip.startsWith('excavators/large')) return 'Large Excavator';
  if (equip.startsWith('excavators/')) return 'Excavator';
  if (equip.startsWith('tractors/compact')) return 'Compact Tractor';
  if (equip.startsWith('tractors/sub-compact')) return 'Sub-Compact Tractor';
  if (equip.startsWith('tractors/')) return 'Tractor';
  if (equip.startsWith('mowers/')) return 'Mower';
  if (equip.startsWith('telehandlers/')) return 'Telehandler';
  if (equip.startsWith('utility-vehicles/')) return 'Utility Vehicle';
  if (equip.startsWith('industrial-air-compressors')) return 'Air Compressor';
  if (equip.startsWith('turf-renovation')) return 'Turf Equipment';
  return 'Equipment';
}

// Compact equipment category paths (after /na/en/equipment/)
const COMPACT_PATHS = new Set([
  'loaders/skid-steer-loaders',
  'loaders/compact-track-loaders',
  'loaders/mini-track-loaders',
  'loaders/small-articulated-loaders',
  'loaders/backhoe-loaders',
  'loaders/wheel-loaders/compact-wheel-loaders',
  'excavators/compact-excavators',
  'telehandlers',
  'utility-vehicles',
  'toolcat',
  'tractors/articulating-tractors',
  'tractors/compact-tractors',
  'tractors/sub-compact-tractors',
  'light-compaction/forward-plate-compactors',
  'light-compaction/rammers',
  'light-compaction/reversible-plate-compactors',
  'light-compaction/trench-rollers',
  'turf-renovation-equipment',
  'mowers/zero-turn-mowers',
  'mowers/stand-on-mowers',
  'mowers/walk-behind-mowers',
]);

// URL slugs that are sub-categories or pages, not individual models
const EXCLUDE_SLUGS = new Set([
  'non-current-models', 'feature', 'features', 'operation-modes',
  'steering-modes', 'instrumentation', 'r-series', 'slope-mowing',
  'compact-wheel-loaders', 'commercial-mowers', 'electric-equipment',
  'remanufacturing-program', 'used-equipment', 'platinum',
]);

function isCompactEquipmentUrl(url) {
  // Must be under /na/en/equipment/ with at least one sub-path + model slug
  const prefix = 'https://www.bobcat.com/na/en/equipment/';
  if (!url.startsWith(prefix)) return false;
  const path = url.slice(prefix.length);
  const parts = path.split('/').filter(Boolean);
  if (parts.length < 2) return false; // category page only

  const slug = parts[parts.length - 1];
  const parent = parts.slice(0, -1).join('/');

  if (/^\d+-\d+-ton$/.test(slug)) return false; // weight class page
  if (EXCLUDE_SLUGS.has(slug)) return false;

  return COMPACT_PATHS.has(parent);
}

function filterProductUrls(urls) {
  const attachments = urls.filter(u =>
    u.includes('/na/en/attachments/') &&
    !u.includes('/equipment/') &&
    !u.includes('/buying-resources/') &&
    !u.endsWith('/attachments')
  );

  const equipment = urls.filter(isCompactEquipmentUrl);

  console.log(`Product URLs: ${attachments.length} attachments + ${equipment.length} compact equipment models`);
  return [...attachments, ...equipment];
}

function parseProductPage(html, url) {
  const og = {};
  for (const m of html.matchAll(/property="og:([^"]+)" content="([^"]+)"/g)) {
    og[m[1]] = m[2];
  }

  const title = og['facet-title'] || og['title']?.replace(' - Bobcat Company', '').trim() || '';
  const fullTitle = og['title']?.replace(' - Bobcat Company', '').trim() || title;
  const description = og['description'] || '';
  const category = getCategoryFromUrl(url);
  const urlParts = url.split('/');
  const slug = urlParts[urlParts.length - 1];

  // Collect product-specific Cloudinary images (600px padded, no logos)
  const imgRe = /https:\/\/res\.cloudinary\.com\/doosan-bobcat\/image\/upload\/c_pad[^"\\s]+/g;
  const allImgs = [...new Set(html.match(imgRe) || [])];
  const productImgs = allImgs.filter(u =>
    u.includes('/products/') || u.includes('/bobcat-assets/na-')
  );

  // Make sure og:image is first
  const primary = og['image'];
  const images = primary
    ? [primary, ...productImgs.filter(u => u !== primary)]
    : productImgs;

  if (!title) return null;

  return {
    id: slug,
    brand: 'Bobcat',
    title: fullTitle,
    shortTitle: title,
    description,
    category,
    subcategory: og['type'] || '',
    images: [...new Set(images)].slice(0, 10),
    url,
    source: 'bobcat.com',
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

    const slug = url.split('/').pop();

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
          console.error(`  EMPTY: ${url}`);
        }
        break;
      } catch (err) {
        if (attempt === 1) {
          console.error(`  ERR ${slug}: ${err.message?.slice(0, 80)}`);
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
  const productUrls = filterProductUrls(allUrls);

  let progress = {};
  if (existsSync(PROGRESS_FILE)) {
    try { progress = JSON.parse(readFileSync(PROGRESS_FILE, 'utf8')); } catch {}
  }

  let results = [];
  if (existsSync(CATALOG_FILE)) {
    try { results = JSON.parse(readFileSync(CATALOG_FILE, 'utf8')); } catch {}
  }

  const doneSet = new Set(Object.keys(progress));
  const queue = productUrls.filter(u => {
    const slug = u.split('/').pop();
    return !doneSet.has(slug);
  });

  const done = { count: productUrls.length - queue.length, total: productUrls.length };

  if (queue.length === 0) {
    console.log(`All ${results.length} products already scraped.`);
    return;
  }

  console.log(`Scraping ${queue.length} remaining products (${CONCURRENCY} workers)…`);

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
