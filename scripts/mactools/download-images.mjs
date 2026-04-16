#!/usr/bin/env node
/**
 * Mac Tools Product Image Downloader
 *
 * Downloads product images from Shopify CDN (cdn.shopify.com).
 * Reads from mactools-catalog.json produced by scrape-catalog.mjs.
 *
 * Usage:
 *   node download-images.mjs [--resume] [--max-images N] [--limit N] [--concurrency N]
 */

import {
  readFileSync,
  writeFileSync,
  existsSync,
  mkdirSync,
  createWriteStream,
} from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { pipeline } from "stream/promises";
import { Readable } from "stream";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = resolve(__dirname, "data");
const CATALOG_FILE = resolve(DATA_DIR, "mactools-catalog.json");
const IMAGES_DIR = resolve(DATA_DIR, "product-images");
const PROGRESS_FILE = resolve(DATA_DIR, "image-download-progress.json");

const args = process.argv.slice(2);
const RESUME = args.includes("--resume");
const MAX_IMAGES = args.includes("--max-images")
  ? parseInt(args[args.indexOf("--max-images") + 1], 10)
  : 5;
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
  if (contentType?.includes("jpeg") || contentType?.includes("jpg"))
    return ".jpg";
  const m = url.match(/\.(webp|png|jpg|jpeg)(\?|$)/i);
  return m ? `.${m[1].toLowerCase()}` : ".jpg";
}

function sanitizeSku(sku) {
  return sku.replace(/[^a-zA-Z0-9\-_.]/g, "_").toUpperCase();
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
    console.error("Catalog not found. Run scrape-catalog.mjs first.");
    process.exit(1);
  }

  const catalog = JSON.parse(readFileSync(CATALOG_FILE, "utf-8"));
  console.log(`=== Mac Tools Image Downloader ===`);
  console.log(`Catalog: ${catalog.length} products`);
  console.log(`Max images per product: ${MAX_IMAGES}`);
  console.log(`Concurrency: ${CONCURRENCY}`);

  mkdirSync(IMAGES_DIR, { recursive: true });

  let downloaded = new Set();
  if (RESUME && existsSync(PROGRESS_FILE)) {
    const saved = JSON.parse(readFileSync(PROGRESS_FILE, "utf-8"));
    saved.forEach((s) => downloaded.add(s));
    console.log(`Resuming: ${downloaded.size} already downloaded`);
  }

  // Build download queue
  const queue = [];
  for (const product of catalog.slice(0, LIMIT)) {
    const sku = sanitizeSku(product.sku || product.handle);
    const skuDir = resolve(IMAGES_DIR, sku);
    const images = (product.images || []).slice(0, MAX_IMAGES);

    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      const label = i === 0 ? "hero" : `${i}`;
      const filename = `${sku}_${label}.jpg`;
      const key = `${sku}/${filename}`;
      if (downloaded.has(key)) continue;
      queue.push({ sku, dir: skuDir, url: img.url, filename, key });
    }
  }

  console.log(`Images to download: ${queue.length}`);
  console.log();

  let completed = 0;
  let failures = 0;

  for (let i = 0; i < queue.length; i += CONCURRENCY) {
    const batch = queue.slice(i, i + CONCURRENCY);

    const results = await Promise.all(
      batch.map(async (item) => {
        mkdirSync(item.dir, { recursive: true });
        const filepath = resolve(item.dir, item.filename);
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
        if (failures <= 20) console.error(`  FAIL ${r.key}: ${r.error}`);
      }
    }

    if (completed % 200 === 0 || i + CONCURRENCY >= queue.length) {
      console.log(
        `  ${completed}/${queue.length} downloaded | failures: ${failures}`
      );
    }

    if (completed % 500 < CONCURRENCY) {
      writeFileSync(PROGRESS_FILE, JSON.stringify([...downloaded], null, 2));
    }

    await sleep(50);
  }

  writeFileSync(PROGRESS_FILE, JSON.stringify([...downloaded], null, 2));

  console.log(`\n${"=".repeat(50)}`);
  console.log(`Downloaded: ${downloaded.size} images`);
  console.log(`Failures:   ${failures}`);
  console.log(`Images dir: ${IMAGES_DIR}`);
}

main().catch(console.error);
