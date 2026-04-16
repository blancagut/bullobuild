#!/usr/bin/env node
/**
 * Black+Decker Product Image Downloader
 *
 * Downloads up to 3 images per product from Shopify CDN.
 * Images are saved as: data/product-images/{SKU}/{SKU}_hero.jpg, _2.jpg, _3.jpg
 *
 * Usage:
 *   node download-images.mjs [--resume] [--max-images N] [--concurrency N]
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, createWriteStream } from "fs";
import { resolve, dirname, extname } from "path";
import { fileURLToPath } from "url";
import { pipeline } from "stream/promises";
import { Readable } from "stream";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = resolve(__dirname, "data");
const CATALOG_FILE = resolve(DATA_DIR, "bd-catalog.json");
const IMAGES_DIR = resolve(DATA_DIR, "product-images");
const PROGRESS_FILE = resolve(DATA_DIR, "image-download-progress.json");

// ── CLI args ──
const args = process.argv.slice(2);
const RESUME = args.includes("--resume");
const MAX_IMAGES = args.includes("--max-images")
  ? parseInt(args[args.indexOf("--max-images") + 1], 10)
  : 3;
const CONCURRENCY = args.includes("--concurrency")
  ? parseInt(args[args.indexOf("--concurrency") + 1], 10)
  : 8;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function getExtFromUrl(url) {
  // Shopify CDN URLs: .../filename.jpg?v=xxx
  const clean = url.split("?")[0];
  const ext = extname(clean).toLowerCase();
  if ([".jpg", ".jpeg", ".png", ".webp", ".gif"].includes(ext)) return ext;
  return ".jpg";
}

function getSuffix(index) {
  if (index === 0) return "_hero";
  return `_${index + 1}`;
}

async function downloadImage(url, filepath, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const resp = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        },
        redirect: "follow",
      });

      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

      const contentType = resp.headers.get("content-type") || "";
      let ext = ".jpg";
      if (contentType.includes("webp")) ext = ".webp";
      else if (contentType.includes("png")) ext = ".png";
      else ext = getExtFromUrl(url);

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

async function processProduct(product, downloaded) {
  const sku = product.sku || product.handle?.toUpperCase();
  if (!sku) return { ok: false, sku: "UNKNOWN", error: "No SKU" };
  if (downloaded.has(sku)) return { ok: true, sku, skipped: true };

  const images = (product.images || []).slice(0, MAX_IMAGES);
  if (images.length === 0) {
    downloaded.add(sku);
    return { ok: true, sku, count: 0 };
  }

  const skuDir = resolve(IMAGES_DIR, sku);
  mkdirSync(skuDir, { recursive: true });

  let count = 0;
  for (let i = 0; i < images.length; i++) {
    const url = images[i];
    const suffix = getSuffix(i);
    const placeholder = resolve(skuDir, `${sku}${suffix}.jpg`);
    const result = await downloadImage(url, placeholder);
    if (result.ok) count++;
    else console.error(`    FAIL img[${i}] ${sku}: ${result.error}`);
  }

  downloaded.add(sku);
  return { ok: true, sku, count };
}

async function main() {
  if (!existsSync(CATALOG_FILE)) {
    console.error("Catalog not found. Run scrape-catalog.mjs first.");
    process.exit(1);
  }

  const catalog = JSON.parse(readFileSync(CATALOG_FILE, "utf-8"));
  console.log(`=== Black+Decker Image Downloader ===`);
  console.log(`Catalog: ${catalog.length} products | Max images per product: ${MAX_IMAGES}`);

  mkdirSync(IMAGES_DIR, { recursive: true });

  let downloaded = new Set();
  if (RESUME && existsSync(PROGRESS_FILE)) {
    const saved = JSON.parse(readFileSync(PROGRESS_FILE, "utf-8"));
    saved.forEach((s) => downloaded.add(s));
    console.log(`Resuming: ${downloaded.size} already done`);
  }

  const pending = catalog.filter((p) => !downloaded.has(p.sku || p.handle?.toUpperCase()));
  console.log(`Pending: ${pending.length} products\n`);

  let done = 0;
  let failures = 0;

  for (let i = 0; i < pending.length; i += CONCURRENCY) {
    const batch = pending.slice(i, i + CONCURRENCY);
    const results = await Promise.all(batch.map((p) => processProduct(p, downloaded)));

    for (const r of results) {
      done++;
      if (!r.ok) failures++;
      else if (!r.skipped) {
        // already added to downloaded inside processProduct
      }
    }

    if (done % 50 === 0 || i + CONCURRENCY >= pending.length) {
      console.log(`  Progress: ${done}/${pending.length} | failures: ${failures}`);
      writeFileSync(PROGRESS_FILE, JSON.stringify([...downloaded], null, 2));
    }

    if (i + CONCURRENCY < pending.length) await sleep(100);
  }

  writeFileSync(PROGRESS_FILE, JSON.stringify([...downloaded], null, 2));

  console.log(`\n=== Done ===`);
  console.log(`Downloaded: ${done - failures} | Failures: ${failures}`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
