#!/usr/bin/env node
/**
 * Makita image downloader
 * Reads scripts/makita/data/makita-catalog.json
 * Saves to data/product-images/{SKU}/{SKU}_{N}.{ext}
 */

import { execFile } from 'child_process';
import { promisify } from 'util';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join, dirname, extname } from 'path';
import { fileURLToPath } from 'url';

const execFileAsync = promisify(execFile);
const __dirname = dirname(fileURLToPath(import.meta.url));

const CATALOG_FILE = join(__dirname, 'data', 'makita-catalog.json');
const IMAGES_DIR = join(__dirname, '..', '..', 'data', 'product-images');
const PROGRESS_FILE = join(__dirname, 'data', 'img-progress.json');

const CONCURRENCY = 8;
const DELAY_MS = 100;
const MAX_RETRIES = 2;

if (!existsSync(IMAGES_DIR)) mkdirSync(IMAGES_DIR, { recursive: true });

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function downloadFile(url, dest, timeoutSec = 20) {
  await execFileAsync('curl', [
    '-sL', url,
    '-H', 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    '-H', 'Referer: https://www.makitatools.com/',
    '--max-time', String(timeoutSec),
    '-o', dest,
  ]);
}

async function downloadOne(sku, urls) {
  const dir = join(IMAGES_DIR, sku);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

  const downloaded = [];
  for (let i = 0; i < urls.length; i++) {
    const rawUrl = urls[i].split('?')[0];
    const ext = extname(rawUrl) || '.png';
    const filename = `${sku}_${i + 1}${ext}`;
    const dest = join(dir, filename);

    if (existsSync(dest)) { downloaded.push(filename); continue; }

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        await downloadFile(rawUrl, dest);
        downloaded.push(filename);
        break;
      } catch (err) {
        if (attempt === MAX_RETRIES) console.error(`  ERR ${sku} img${i + 1}: ${err.message}`);
        else await sleep(1000);
      }
    }

    if (i < urls.length - 1) await sleep(DELAY_MS);
  }
  return downloaded;
}

async function runWorker(queue, stats, progress) {
  while (queue.length > 0) {
    const item = queue.shift();
    if (!item) break;
    const { sku, images } = item;

    if (!images || images.length === 0) { stats.skip++; progress.done++; continue; }

    const files = await downloadOne(sku, images);
    stats.ok += files.length;
    progress.done++;

    const pct = ((progress.done / progress.total) * 100).toFixed(1);
    process.stdout.write(
      `\r[${Math.floor(process.uptime())}s] ${progress.done}/${progress.total} (${pct}%) — files:${stats.ok} skip:${stats.skip} err:${stats.err}   `
    );

    await sleep(DELAY_MS);
  }
}

async function main() {
  if (!existsSync(CATALOG_FILE)) {
    console.error(`Catalog not found: ${CATALOG_FILE}`);
    process.exit(1);
  }

  const catalog = JSON.parse(readFileSync(CATALOG_FILE, 'utf8'));
  console.log(`Loaded ${catalog.length} products`);

  // Resume: skip SKUs where directory already has files
  const queue = catalog.filter(p => {
    if (!p.images || p.images.length === 0) return false;
    const dir = join(IMAGES_DIR, p.sku);
    if (existsSync(dir)) {
      const existing = existsSync(join(dir, `${p.sku}_1.png`)) ||
                       existsSync(join(dir, `${p.sku}_1.jpg`));
      return !existing;
    }
    return true;
  });

  const progress = { done: catalog.length - queue.length, total: catalog.length };
  const stats = { ok: 0, skip: 0, err: 0 };

  if (queue.length === 0) { console.log('All images already downloaded.'); return; }
  console.log(`Downloading images for ${queue.length} products (${CONCURRENCY} workers)…`);

  const workers = Array.from({ length: CONCURRENCY }, () =>
    runWorker(queue, stats, progress)
  );
  await Promise.all(workers);

  process.stdout.write('\n');
  console.log(`Done. files:${stats.ok} skip:${stats.skip} err:${stats.err}`);
}

main().catch(err => { console.error(err); process.exit(1); });
