#!/usr/bin/env node
/**
 * download-images.mjs — Milwaukee Product Image Downloader
 *
 * Downloads product images from the Milwaukee Sitecore CDN.
 * Uses the catalog JSON to find image URLs per product.
 *
 * Creates: product-images/{SKU}/{SKU}_hero.webp
 *          product-images/{SKU}/{SKU}_1.webp
 *          product-images/{SKU}/{SKU}_2.webp
 *
 * Usage:
 *   node scripts/milwaukee/download-images.mjs
 *   node scripts/milwaukee/download-images.mjs --resume        (skip existing)
 *   node scripts/milwaukee/download-images.mjs --max-images 3  (limit per product)
 *   node scripts/milwaukee/download-images.mjs --limit 100     (first N products)
 */

import { createWriteStream, existsSync, mkdirSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { pipeline } from 'node:stream/promises';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, 'data');
const OUT_DIR = join(__dirname, 'product-images');
const CATALOG_PATH = join(DATA_DIR, 'milwaukee-catalog.json');

// ── CLI flags ──────────────────────────────────────────────
const args = process.argv.slice(2);
const RESUME = args.includes('--resume');
const MAX_IMAGES = args.includes('--max-images')
  ? parseInt(args[args.indexOf('--max-images') + 1], 10)
  : 3;
const LIMIT = args.includes('--limit')
  ? parseInt(args[args.indexOf('--limit') + 1], 10)
  : 0;
const CONCURRENCY = args.includes('--concurrency')
  ? parseInt(args[args.indexOf('--concurrency') + 1], 10)
  : 10;
const RETRY_LIMIT = 3;
const RETRY_DELAY_MS = 1000;

const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

// ── Helpers ────────────────────────────────────────────────
function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function downloadFile(url, destPath) {
  for (let attempt = 1; attempt <= RETRY_LIMIT; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': USER_AGENT },
        redirect: 'follow',
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      // Detect actual content type and adjust extension
      const contentType = res.headers.get('content-type') || '';
      let actualPath = destPath;
      if (contentType.includes('webp')) {
        actualPath = destPath.replace(/\.\w+$/, '.webp');
      } else if (contentType.includes('png')) {
        actualPath = destPath.replace(/\.\w+$/, '.png');
      }

      const dir = dirname(actualPath);
      if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

      await pipeline(res.body, createWriteStream(actualPath));
      return true;
    } catch (err) {
      if (attempt < RETRY_LIMIT) {
        await sleep(RETRY_DELAY_MS * attempt);
      } else {
        return false;
      }
    }
  }
}

function getImageExtension(url) {
  // Milwaukee images don't have extensions in URLs (Sitecore CDN)
  // They serve as image/jpeg or image/webp — save as .jpg by default
  return '.jpg';
}

// ── Main ───────────────────────────────────────────────────
async function main() {
  const raw = await readFile(CATALOG_PATH, 'utf-8');
  const catalog = JSON.parse(raw);

  let products = LIMIT > 0 ? catalog.slice(0, LIMIT) : catalog;

  // Build download queue
  const queue = [];
  for (const product of products) {
    const images = product.images || [];
    if (images.length === 0) continue;

    const sku = product.sku;
    const imagesToDownload = images.slice(0, MAX_IMAGES);

    for (let i = 0; i < imagesToDownload.length; i++) {
      const url = imagesToDownload[i];
      if (!url) continue;

      const suffix = i === 0 ? 'hero' : String(i);
      const filename = `${sku}_${suffix}${getImageExtension(url)}`;
      const destPath = join(OUT_DIR, sku, filename);

      if (RESUME && existsSync(destPath)) continue;

      queue.push({ sku, url, destPath, index: i });
    }
  }

  const totalProducts = products.length;
  const totalDownloads = queue.length;

  console.log(`\n🔧 Milwaukee Product Image Downloader`);
  console.log(`   Products:     ${totalProducts}`);
  console.log(`   Max images:   ${MAX_IMAGES} per product`);
  console.log(`   To download:  ${totalDownloads}`);
  console.log(`   Concurrency:  ${CONCURRENCY}`);
  console.log(`   Output:       ${OUT_DIR}\n`);

  if (totalDownloads === 0) {
    console.log('✅ All images already downloaded.');
    return;
  }

  let completed = 0;
  let failed = 0;
  const failures = [];
  const startTime = Date.now();

  async function worker() {
    while (queue.length > 0) {
      const item = queue.shift();
      if (!item) break;

      const ok = await downloadFile(item.url, item.destPath);
      completed++;

      if (!ok) {
        failed++;
        failures.push(`${item.sku}/${item.index}`);
      }

      if (completed % 50 === 0 || completed === totalDownloads) {
        const pct = ((completed / totalDownloads) * 100).toFixed(1);
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
        const rate = (completed / ((Date.now() - startTime) / 1000)).toFixed(1);
        process.stdout.write(
          `\r   Progress: ${completed}/${totalDownloads} (${pct}%) | ${rate} img/s | ${elapsed}s | Failed: ${failed}`
        );
      }
    }
  }

  const workers = Array.from({ length: CONCURRENCY }, () => worker());
  await Promise.all(workers);

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n\n✅ Done in ${elapsed}s`);
  console.log(`   Downloaded: ${completed - failed}`);
  console.log(`   Failed: ${failed}`);

  if (failures.length > 0) {
    console.log(`\n⚠️  Failed items (${failures.length}):`);
    failures.slice(0, 20).forEach((f) => console.log(`   - ${f}`));
    if (failures.length > 20)
      console.log(`   ... and ${failures.length - 20} more`);
    console.log(`\n   Run with --resume to retry.`);
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
