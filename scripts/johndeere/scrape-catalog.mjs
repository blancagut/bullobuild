#!/usr/bin/env node
/**
 * John Deere compact equipment catalog scraper
 * No sitemap available — discovers models by crawling category index pages.
 * Products: skid steers, compact track loaders, compact excavators, compact wheel loaders
 * Images:   salesmanual.deere.com (450px, low-res but official)
 * Data:     <title> (stripped) + <meta name="description">
 */

import { execFile } from 'child_process';
import { promisify } from 'util';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const execFileAsync = promisify(execFile);
const __dirname = dirname(fileURLToPath(import.meta.url));

const DATA_DIR = join(__dirname, 'data');
const CATALOG_FILE = join(DATA_DIR, 'johndeere-catalog.json');
const PROGRESS_FILE = join(DATA_DIR, 'johndeere-progress.json');
const BASE_URL = 'https://www.deere.com';

// Category index pages to crawl for model URLs
const CATEGORY_PAGES = [
  'https://www.deere.com/en/compact-equipment/',
  'https://www.deere.com/en/excavators/compact-excavators/',
  'https://www.deere.com/en/loaders/wheel-loaders/compact-wheel-loaders/',
  'https://www.deere.com/en/loaders/skid-steers/',
  'https://www.deere.com/en/loaders/compact-track-loaders/',
];

// Path segment patterns for valid model pages (depth 4: /en/{cat}/{subcat}/{model}/)
const MODEL_PATH_RE = /^\/en\/(loaders|excavators|utility-vehicles|compact-equipment)\/[^/]+\/[^/]+-[^/]+\//;

function isModelHref(href) {
  const parts = href.split('/').filter(Boolean);
  const slug = parts[parts.length - 1] || '';
  return /\d/.test(slug);
}

const CONCURRENCY = 3;
const TIMEOUT_SEC = 30;
const DELAY_MS = 600;
const CHECKPOINT_EVERY = 10;

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

async function discoverModelUrls() {
  const seen = new Set();
  const models = [];

  for (const catUrl of CATEGORY_PAGES) {
    console.log(`  Crawling: ${catUrl}`);
    let html;
    try { html = await curlGet(catUrl); } catch (err) {
      console.error(`  SKIP (error): ${catUrl} — ${err.message?.slice(0, 60)}`);
      continue;
    }

    // Extract href attributes pointing to model pages
    const hrefs = [...html.matchAll(/href="(\/en\/[^"]+\/)"/g)].map(m => m[1]);
    for (const href of hrefs) {
      if (!MODEL_PATH_RE.test(href) || !isModelHref(href)) continue;
      const fullUrl = BASE_URL + href;
      if (!seen.has(fullUrl)) {
        seen.add(fullUrl);
        models.push(fullUrl);
      }
    }

    await sleep(800);
  }

  return models;
}

function getCategoryFromUrl(url) {
  if (url.includes('/skid-steers/')) return 'Skid-Steer Loader';
  if (url.includes('/compact-track-loaders/')) return 'Compact Track Loader';
  if (url.includes('/compact-excavators/')) return 'Compact Excavator';
  if (url.includes('/compact-wheel-loaders/')) return 'Compact Wheel Loader';
  if (url.includes('/compact-equipment/')) return 'Compact Equipment';
  if (url.includes('/utility-vehicles/')) return 'Utility Vehicle';
  return 'Equipment';
}

function parseProductPage(html, url) {
  // Title: from <title>, strip suffixes
  const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
  let title = titleMatch ? titleMatch[1]
    .replace(/\s*\|.*$/, '')   // strip everything after |
    .trim() : '';

  // Description: <meta name="description">
  const descMatch = html.match(/<meta\s+name="description"\s+content="([^"]*)"/i)
    || html.match(/<meta\s+content="([^"]*)"\s+name="description"/i);
  const description = descMatch ? descMatch[1].trim() : '';

  if (!title) return null;

  const urlParts = url.split('/').filter(Boolean);
  const slug = urlParts[urlParts.length - 1];
  const category = getCategoryFromUrl(url);

  // Images: salesmanual.deere.com official product images
  const imgRe = /https:\/\/salesmanual\.deere\.com\/[^"'\s<>]+\.(?:jpg|png|webp)/gi;
  const deereImgs = [...new Set(html.match(imgRe) || [])];

  // Also pick up any deere.com image CDN
  const cdnRe = /https:\/\/[^"'\s<>]*\.deere\.com\/[^"'\s<>]+\.(?:jpg|png)/gi;
  const cdnImgs = [...new Set(html.match(cdnRe) || [])].filter(u =>
    !u.includes('logo') && !u.includes('icon') && !u.includes('/nav/')
  );

  const images = [...new Set([...deereImgs, ...cdnImgs])].slice(0, 10);

  return {
    id: slug,
    brand: 'John Deere',
    title,
    description,
    category,
    images,
    url,
    source: 'deere.com',
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
  console.log('Discovering John Deere compact equipment model pages…');
  const productUrls = await discoverModelUrls();
  console.log(`Found ${productUrls.length} model pages`);

  if (productUrls.length === 0) {
    console.error('No model URLs found. Check category page structure.');
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

  console.log(`Scraping ${queue.length} remaining models (${CONCURRENCY} workers)…`);

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
  if (results.length > 0) {
    console.log('\nModels found:');
    results.forEach(p => console.log(`  [${p.category}] ${p.title}`));
  }
}

main().catch(err => { console.error(err); process.exit(1); });
