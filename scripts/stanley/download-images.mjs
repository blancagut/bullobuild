/**
 * Download Stanley product images
 * Source: stanleytools.com/NAG/PRODUCT/IMAGES/HIRES/
 * Output: scripts/stanley/data/product-images/{SKU}/{SKU}_1.jpg, _2.jpg, _3.jpg
 * Run: node scripts/stanley/download-images.mjs [--resume] [--limit N] [--concurrency N]
 */

import { readFileSync, writeFileSync, existsSync, createWriteStream } from 'fs';
import { mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CATALOG_FILE = join(__dirname, 'data/stanley-catalog.json');
const PROGRESS_FILE = join(__dirname, 'data/image-download-progress.json');
const IMAGES_DIR = join(__dirname, 'data/product-images');

const args = process.argv.slice(2);
const RESUME = args.includes('--resume');
const LIMIT = (() => { const i = args.indexOf('--limit'); return i >= 0 ? parseInt(args[i+1]) : 0; })();
const CONCURRENCY = (() => { const i = args.indexOf('--concurrency'); return i >= 0 ? parseInt(args[i+1]) : 4; })();
const MAX_IMAGES = (() => { const i = args.indexOf('--max-images'); return i >= 0 ? parseInt(args[i+1]) : 3; })();
const DELAY_MS = 200;

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

async function downloadFile(url, destPath) {
  const resp = await fetch(url, {
    headers: {
      'User-Agent': UA,
      'Referer': 'https://www.stanleytools.com/',
    },
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  const buffer = await resp.arrayBuffer();
  const { writeFile } = await import('fs/promises');
  await writeFile(destPath, Buffer.from(buffer));
}

async function downloadProduct(product, alreadyDone) {
  if (alreadyDone.has(product.sku)) return { sku: product.sku, count: 0, skipped: true };
  if (!product.images || product.images.length === 0) return { sku: product.sku, count: 0, skipped: false };

  const skuDir = join(IMAGES_DIR, product.sku);
  await mkdir(skuDir, { recursive: true });

  const imagesToDownload = product.images.slice(0, MAX_IMAGES);
  let count = 0;

  for (let i = 0; i < imagesToDownload.length; i++) {
    const imgUrl = imagesToDownload[i];
    // Preserve original filename extension (jpg, png, webp)
    const ext = imgUrl.split('.').pop().split('?')[0].toLowerCase() || 'jpg';
    const suffix = i === 0 ? '_1' : `_${i + 1}`;
    const filename = `${product.sku}${suffix}.${ext}`;
    const destPath = join(skuDir, filename);

    if (RESUME && existsSync(destPath)) { count++; continue; }

    try {
      await new Promise(r => setTimeout(r, DELAY_MS));
      await downloadFile(imgUrl, destPath);
      count++;
    } catch (e) {
      console.error(`  IMG ERR ${product.sku} img${i+1}: ${e.message}`);
    }
  }

  return { sku: product.sku, count, skipped: false };
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
  if (!existsSync(CATALOG_FILE)) {
    console.error('Catalog not found. Run scrape-catalog.mjs first.');
    process.exit(1);
  }

  await mkdir(IMAGES_DIR, { recursive: true });

  const catalog = JSON.parse(readFileSync(CATALOG_FILE, 'utf8'));
  let products = LIMIT > 0 ? catalog.slice(0, LIMIT) : catalog;

  let alreadyDone = new Set();
  if (RESUME && existsSync(PROGRESS_FILE)) {
    alreadyDone = new Set(JSON.parse(readFileSync(PROGRESS_FILE, 'utf8')));
    console.log(`Resuming: ${alreadyDone.size} SKUs already downloaded`);
  }

  console.log(`Downloading images for ${products.length} products (concurrency=${CONCURRENCY}, max ${MAX_IMAGES} per product)`);

  let totalFiles = 0;
  let totalErrors = 0;
  let processed = 0;
  const startTime = Date.now();

  const batchSize = CONCURRENCY;
  for (let i = 0; i < products.length; i += batchSize) {
    const batch = products.slice(i, i + batchSize);
    const batchTasks = batch.map(p => async () => {
      const result = await downloadProduct(p, alreadyDone);
      if (!result.skipped) {
        alreadyDone.add(p.sku);
        totalFiles += result.count;
      }
      processed++;
      return result;
    });

    await runWithConcurrency(batchTasks, CONCURRENCY);
    writeFileSync(PROGRESS_FILE, JSON.stringify([...alreadyDone]));

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
    const pct = ((processed / products.length) * 100).toFixed(1);
    console.log(`[${elapsed}s] ${processed}/${products.length} (${pct}%) — files:${totalFiles}`);
  }

  writeFileSync(PROGRESS_FILE, JSON.stringify([...alreadyDone]));
  console.log('\n=== Done ===');
  console.log(`Total image files: ${totalFiles}`);
  console.log(`Output: ${IMAGES_DIR}`);
}

main().catch(e => { console.error(e); process.exit(1); });
