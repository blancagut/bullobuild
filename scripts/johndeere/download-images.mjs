#!/usr/bin/env node
/**
 * John Deere image downloader
 * Reads scripts/johndeere/data/johndeere-catalog.json
 * Downloads images (salesmanual.deere.com) to data/product-images/{id}/
 */

import { execFile } from 'child_process';
import { promisify } from 'util';
import { existsSync, mkdirSync, readFileSync } from 'fs';
import { join, dirname, extname } from 'path';
import { fileURLToPath } from 'url';

const execFileAsync = promisify(execFile);
const __dirname = dirname(fileURLToPath(import.meta.url));

const CATALOG_FILE = join(__dirname, 'data', 'johndeere-catalog.json');
const IMAGES_DIR = join(__dirname, '..', '..', 'data', 'product-images');

const CONCURRENCY = 5;
const DELAY_MS = 150;
const MAX_RETRIES = 2;

if (!existsSync(IMAGES_DIR)) mkdirSync(IMAGES_DIR, { recursive: true });

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function downloadFile(url, dest) {
  await execFileAsync('curl', [
    '-sL', url,
    '-H', 'User-Agent: Mozilla/5.0',
    '-H', 'Referer: https://www.deere.com/',
    '--max-time', '30',
    '-o', dest,
  ]);
}

async function downloadProduct(id, images) {
  const dir = join(IMAGES_DIR, id);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

  let downloaded = 0;
  for (let i = 0; i < images.length; i++) {
    const url = images[i];
    const rawPath = url.split('/').pop().split('?')[0];
    const ext = extname(rawPath) || '.jpg';
    const filename = `${id}_${i + 1}${ext}`;
    const dest = join(dir, filename);

    if (existsSync(dest)) { downloaded++; continue; }

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        await downloadFile(url, dest);
        downloaded++;
        break;
      } catch (err) {
        if (attempt === MAX_RETRIES) console.error(`  ERR ${id} img${i + 1}: ${err.message?.slice(0, 60)}`);
        else await sleep(1000);
      }
    }

    if (i < images.length - 1) await sleep(DELAY_MS);
  }
  return downloaded;
}

async function runWorker(queue, stats, progress) {
  while (queue.length > 0) {
    const item = queue.shift();
    if (!item) break;
    const { id, images } = item;

    if (!images || images.length === 0) { stats.skip++; progress.done++; continue; }

    const n = await downloadProduct(id, images);
    stats.files += n;
    progress.done++;
    const pct = ((progress.done / progress.total) * 100).toFixed(1);
    process.stdout.write(
      `\r[${Math.floor(process.uptime())}s] ${progress.done}/${progress.total} (${pct}%) — files:${stats.files}   `
    );
  }
}

async function main() {
  if (!existsSync(CATALOG_FILE)) {
    console.error(`Catalog not found: ${CATALOG_FILE}`);
    console.error('Run scrape-catalog.mjs first.');
    process.exit(1);
  }

  const catalog = JSON.parse(readFileSync(CATALOG_FILE, 'utf8'));
  const withImages = catalog.filter(p => p.images && p.images.length > 0);
  console.log(`Catalog: ${catalog.length} products, ${withImages.length} with images`);

  const queue = withImages.map(p => ({ id: p.id, images: p.images }));
  const stats = { files: 0, skip: 0 };
  const progress = { done: 0, total: queue.length };

  const workers = Array.from({ length: CONCURRENCY }, () =>
    runWorker(queue, stats, progress)
  );
  await Promise.all(workers);

  process.stdout.write('\n');
  console.log(`Done! Downloaded ${stats.files} image files.`);
}

main().catch(err => { console.error(err); process.exit(1); });
