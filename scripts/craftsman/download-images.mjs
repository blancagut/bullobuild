#!/usr/bin/env node
/**
 * Craftsman Product Image Downloader
 *
 * Downloads product images from assets.craftsman.com.
 *
 * Usage:
 *   node download-images.mjs [--resume] [--max-images N] [--limit N] [--concurrency N]
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, createWriteStream } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { pipeline } from "stream/promises";
import { Readable } from "stream";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = resolve(__dirname, "data");
const CATALOG_FILE = resolve(DATA_DIR, "craftsman-catalog.json");
const IMAGES_DIR = resolve(DATA_DIR, "product-images");
const PROGRESS_FILE = resolve(DATA_DIR, "image-download-progress.json");

// ── CLI args ──
const args = process.argv.slice(2);
const RESUME = args.includes("--resume");
const MAX_IMAGES = args.includes("--max-images")
  ? parseInt(args[args.indexOf("--max-images") + 1], 10)
  : 3;
const LIMIT = args.includes("--limit")
  ? parseInt(args[args.indexOf("--limit") + 1], 10)
  : Infinity;
const CONCURRENCY = args.includes("--concurrency")
  ? parseInt(args[args.indexOf("--concurrency") + 1], 10)
  : 10;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function getExtension(contentType, url) {
  if (contentType?.includes("webp")) return ".webp";
  if (contentType?.includes("png")) return ".png";
  if (contentType?.includes("jpeg") || contentType?.includes("jpg")) return ".jpg";
  // Derive from URL
  if (url.endsWith(".webp")) return ".webp";
  if (url.endsWith(".png")) return ".png";
  return ".jpg";
}

async function downloadImage(url, filepath, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const resp = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        },
        redirect: "follow",
      });

      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

      const contentType = resp.headers.get("content-type") || "";
      const ext = getExtension(contentType, url);

      // Adjust filepath extension if needed
      const finalPath = filepath.replace(/\.[^.]+$/, ext);

      await pipeline(Readable.fromWeb(resp.body), createWriteStream(finalPath));

      return { ok: true, path: finalPath };
    } catch (err) {
      if (attempt < retries) {
        await sleep(1000 * attempt);
        continue;
      }
      return { ok: false, error: err.message };
    }
  }
}

async function main() {
  if (!existsSync(CATALOG_FILE)) {
    console.error("Catalog file not found. Run scrape-catalog.mjs first.");
    process.exit(1);
  }

  const catalog = JSON.parse(readFileSync(CATALOG_FILE, "utf-8"));
  console.log(`Catalog: ${catalog.length} products`);

  mkdirSync(IMAGES_DIR, { recursive: true });

  // Load progress
  let downloaded = new Set();
  if (RESUME && existsSync(PROGRESS_FILE)) {
    const saved = JSON.parse(readFileSync(PROGRESS_FILE, "utf-8"));
    saved.forEach((s) => downloaded.add(s));
    console.log(`Resuming: ${downloaded.size} already downloaded`);
  }

  // Build download queue
  const queue = [];
  for (const product of catalog.slice(0, LIMIT)) {
    if (!product.sku) continue;

    const skuDir = resolve(IMAGES_DIR, product.sku);
    const allImages = product.images || [];

    // Hero image first, then others
    const imagesToDownload = [];
    if (product.heroImage) {
      imagesToDownload.push({ url: product.heroImage, name: `${product.sku}_hero.jpg` });
    }
    for (let i = 0; i < allImages.length && imagesToDownload.length < MAX_IMAGES; i++) {
      const imgUrl = allImages[i];
      // Skip if same as hero
      if (imgUrl === product.heroImage) continue;
      imagesToDownload.push({ url: imgUrl, name: `${product.sku}_${i + 1}.jpg` });
    }

    for (const img of imagesToDownload) {
      const key = `${product.sku}/${img.name}`;
      if (downloaded.has(key)) continue;
      queue.push({ sku: product.sku, dir: skuDir, ...img, key });
    }
  }

  console.log(`Images to download: ${queue.length} (concurrency: ${CONCURRENCY})`);

  let completed = 0;
  let failures = 0;

  for (let i = 0; i < queue.length; i += CONCURRENCY) {
    const batch = queue.slice(i, i + CONCURRENCY);

    const results = await Promise.all(
      batch.map(async (item) => {
        mkdirSync(item.dir, { recursive: true });
        const filepath = resolve(item.dir, item.name);
        const result = await downloadImage(item.url, filepath);
        return { ...item, ...result };
      })
    );

    for (const r of results) {
      completed++;
      if (r.ok) {
        downloaded.add(r.key);
      } else {
        failures++;
        console.error(`  FAIL ${r.key}: ${r.error}`);
      }
    }

    if (completed % 50 === 0 || i + CONCURRENCY >= queue.length) {
      console.log(
        `  Progress: ${completed}/${queue.length} | failures: ${failures}`
      );
    }

    // Save progress every 100
    if (completed % 100 < CONCURRENCY) {
      writeFileSync(PROGRESS_FILE, JSON.stringify([...downloaded], null, 2));
    }

    if (i + CONCURRENCY < queue.length) {
      await sleep(100);
    }
  }

  // Final save
  writeFileSync(PROGRESS_FILE, JSON.stringify([...downloaded], null, 2));

  console.log(`\nDone! Downloaded: ${downloaded.size} images`);
  console.log(`Failures: ${failures}`);
}

main().catch(console.error);
