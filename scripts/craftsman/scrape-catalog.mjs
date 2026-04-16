#!/usr/bin/env node
/**
 * Craftsman Product Catalog Scraper
 *
 * Scrapes product pages from craftsman.com, extracting the `skuProductData`
 * object from SSR flight data (self.__next_f.push chunks).
 *
 * Usage:
 *   node scrape-catalog.mjs [--resume] [--limit N] [--concurrency N]
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = resolve(__dirname, "data");
const URLS_FILE = resolve(DATA_DIR, "craftsman-product-urls.txt");
const CATALOG_FILE = resolve(DATA_DIR, "craftsman-catalog.json");
const PROGRESS_FILE = resolve(DATA_DIR, "craftsman-progress.json");

const IMAGE_BASE = "https://assets.craftsman.com";

// ── CLI args ──
const args = process.argv.slice(2);
const RESUME = args.includes("--resume");
const LIMIT = args.includes("--limit")
  ? parseInt(args[args.indexOf("--limit") + 1], 10)
  : Infinity;
const CONCURRENCY = args.includes("--concurrency")
  ? parseInt(args[args.indexOf("--concurrency") + 1], 10)
  : 5;

// ── Helpers ──
function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function extractChunks(html) {
  // Manual extraction of self.__next_f.push([1,"..."]) chunks
  // to avoid regex backtracking issues with very large strings
  const chunks = [];
  const needle = 'self.__next_f.push([1,"';
  let pos = 0;
  while (true) {
    const start = html.indexOf(needle, pos);
    if (start === -1) break;
    const contentStart = start + needle.length;
    // Find the end: look for "])<" accounting for escaped quotes
    let i = contentStart;
    while (i < html.length) {
      if (html[i] === "\\") { i += 2; continue; }
      if (html[i] === '"') break;
      i++;
    }
    chunks.push(html.slice(contentStart, i));
    pos = i + 1;
  }
  return chunks;
}

function extractSkuProductData(html) {
  const chunks = extractChunks(html);
  let skuData = null;

  for (const raw of chunks) {
    if (!raw.includes("skuProductData")) continue;

    // Single-pass JS string unescape — handles \\n → \n (JSON escape) correctly
    const unescaped = raw.replace(/\\(.)/g, (_, ch) => {
      switch (ch) {
        case 'n': return '\n';
        case 't': return '\t';
        case 'r': return '\r';
        case '"': return '"';
        case '\\': return '\\';
        default: return '\\' + ch;
      }
    });

    // Find skuProductData:{...} using balanced brace parsing
    const marker = '"skuProductData":';
    const idx = unescaped.indexOf(marker);
    if (idx === -1) continue;

    const start = idx + marker.length;
    if (unescaped[start] !== "{") continue;

    let depth = 0;
    let inStr = false;
    let escNext = false;
    let end = start;

    for (let i = start; i < unescaped.length; i++) {
      const ch = unescaped[i];
      if (escNext) {
        escNext = false;
        continue;
      }
      if (ch === "\\") {
        escNext = true;
        continue;
      }
      if (ch === '"') {
        inStr = !inStr;
        continue;
      }
      if (inStr) continue;
      if (ch === "{") depth++;
      else if (ch === "}") {
        depth--;
        if (depth === 0) {
          end = i + 1;
          break;
        }
      }
    }

    const jsonStr = unescaped.slice(start, end);
    try {
      skuData = JSON.parse(jsonStr);
    } catch {
      // Try fixing common issues - remove $L references
      const cleaned = jsonStr.replace(/"\$L[0-9a-f]+"/g, "null");
      try {
        skuData = JSON.parse(cleaned);
      } catch {
        continue;
      }
    }
    break;
  }

  return skuData;
}

function extractHeroProps(html) {
  const chunks = extractChunks(html);

  for (const raw of chunks) {
    if (!raw.includes("productAssets")) continue;

    const unescaped = raw.replace(/\\(.)/g, (_, ch) => {
      switch (ch) {
        case 'n': return '\n';
        case 't': return '\t';
        case 'r': return '\r';
        case '"': return '"';
        case '\\': return '\\';
        default: return '\\' + ch;
      }
    });

    // Extract productAssets for additional images
    const assetsMarker = '"productAssets":';
    const assetsIdx = unescaped.indexOf(assetsMarker);
    if (assetsIdx === -1) continue;

    const aStart = assetsIdx + assetsMarker.length;
    if (unescaped[aStart] !== "[") continue;

    let depth = 0;
    let inStr = false;
    let escNext = false;
    let end = aStart;

    for (let i = aStart; i < unescaped.length; i++) {
      const ch = unescaped[i];
      if (escNext) { escNext = false; continue; }
      if (ch === "\\") { escNext = true; continue; }
      if (ch === '"') { inStr = !inStr; continue; }
      if (inStr) continue;
      if (ch === "[") depth++;
      else if (ch === "]") {
        depth--;
        if (depth === 0) { end = i + 1; break; }
      }
    }

    try {
      return JSON.parse(unescaped.slice(aStart, end));
    } catch {
      return null;
    }
  }
  return null;
}

function mapProduct(skuData, url, heroAssets) {
  if (!skuData) return null;

  const sku = skuData.sku || "";
  const name = skuData.skuName || skuData.shortName || "";
  const description = skuData.ecommerceCopy || "";

  // Images from websiteImagesOrder (full set) + primaryImage fallback
  const images = [];
  if (skuData.websiteImagesOrder?.length) {
    for (const img of skuData.websiteImagesOrder) {
      // Prefer 1680 webp preset, fall back to relativePath
      const preset1680 = img.presets?.find((p) => p.k === "dat1680");
      const imgUrl = preset1680
        ? IMAGE_BASE + preset1680.v
        : IMAGE_BASE + img.relativePath;
      images.push({
        url: imgUrl,
        alt: img.altText || "",
        type: img.bynderContentType || "Photography",
      });
    }
  } else if (skuData.primaryImage) {
    const preset = skuData.primaryImage.presets?.find(
      (p) => p.k === "dat1680"
    );
    const imgUrl = preset
      ? IMAGE_BASE + preset.v
      : IMAGE_BASE + skuData.primaryImage.relativePath;
    images.push({
      url: imgUrl,
      alt: skuData.primaryImage.altText || "",
      type: "Primary",
    });
  }

  // Hero image from productAssets if available
  const heroImage = heroAssets?.[0]?.url || images[0]?.url || "";

  // Category path
  const catPath = skuData.consumerFacingCategoryPath;
  const categories = catPath?.categoryNames || [];
  const category = catPath?.name || "";

  // Specs
  const specifications = {};
  if (skuData.specs?.length) {
    for (const spec of skuData.specs) {
      const val =
        spec.value?.length === 1 ? spec.value[0] : spec.value?.join(", ");
      specifications[spec.label || spec.id] = String(val ?? "");
    }
  }

  // Features
  const features = skuData.featureBenefits || [];

  // Includes
  const includes = skuData.includes || [];

  // Warranty
  const warranty = skuData.warrantyData?.map((w) => w.desc) || [];

  // Cross-sell
  const relatedSkus = skuData.crossSellProducts || skuData.relatedSkus || [];

  // Tags
  const flags = {};
  if (skuData.tagName) flags.tag = skuData.tagName;
  if (skuData.tagType) flags.tagType = skuData.tagType;
  if (skuData.isKit) flags.isKit = skuData.isKit;

  return {
    sku,
    name,
    url,
    description,
    images: images.map((i) => i.url),
    heroImage,
    category,
    categories,
    categoryPath: catPath?.desc || "",
    features,
    specifications,
    includes,
    warranty,
    relatedSkus,
    flags,
    brandId: skuData.brandId || "CM",
    launchDate: skuData.launchDate
      ? new Date(skuData.launchDate * 1000).toISOString()
      : null,
    locale: skuData.locale || "en-US",
    variants: skuData.variants || null,
  };
}

async function scrapeProduct(url, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const resp = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept: "text/html,application/xhtml+xml",
        },
        redirect: "follow",
      });

      if (!resp.ok) {
        if (resp.status === 404) return { error: "404", url };
        throw new Error(`HTTP ${resp.status}`);
      }

      const html = await resp.text();
      const skuData = extractSkuProductData(html);

      if (!skuData) {
        throw new Error("skuProductData not found in page");
      }

      const heroAssets = extractHeroProps(html);
      const product = mapProduct(skuData, url, heroAssets);

      return product;
    } catch (err) {
      if (attempt < retries) {
        await sleep(2000 * attempt);
        continue;
      }
      return { error: err.message, url };
    }
  }
}

// ── Main ──
async function main() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });

  const allUrls = readFileSync(URLS_FILE, "utf-8")
    .split("\n")
    .filter(Boolean);

  console.log(`Total product URLs: ${allUrls.length}`);

  // Load progress
  let done = new Map();
  let catalog = [];
  let seenSkus = new Set();

  if (RESUME && existsSync(PROGRESS_FILE)) {
    const saved = JSON.parse(readFileSync(PROGRESS_FILE, "utf-8"));
    catalog = saved;
    for (const p of saved) {
      done.set(p.url, true);
      if (p.sku) seenSkus.add(p.sku);
    }
    console.log(`Resuming from ${done.size} already scraped (${seenSkus.size} unique SKUs)`);
  }

  const urls = allUrls.filter((u) => !done.has(u)).slice(0, LIMIT);
  console.log(`URLs to scrape: ${urls.length} (concurrency: ${CONCURRENCY})`);

  let processed = 0;
  let failures = 0;

  // Process in batches
  for (let i = 0; i < urls.length; i += CONCURRENCY) {
    const batch = urls.slice(i, i + CONCURRENCY);
    const results = await Promise.all(batch.map((u) => scrapeProduct(u)));

    for (const result of results) {
      processed++;
      if (!result || result.error) {
        failures++;
        console.error(
          `  FAIL [${done.size + processed}/${allUrls.length}] ${result?.url || "unknown"}: ${result?.error || "null"}`
        );
        continue;
      }
      // Deduplicate by SKU
      if (result.sku && seenSkus.has(result.sku)) {
        continue;
      }
      if (result.sku) seenSkus.add(result.sku);
      catalog.push(result);
    }

    const total = done.size + processed;
    if (total % 10 === 0 || i + CONCURRENCY >= urls.length) {
      console.log(
        `  Progress: ${total}/${allUrls.length} | catalog: ${catalog.length} | failures: ${failures}`
      );
    }

    // Save checkpoint every 50
    if (catalog.length % 50 < CONCURRENCY && catalog.length > 0) {
      writeFileSync(PROGRESS_FILE, JSON.stringify(catalog, null, 2));
    }

    // Rate limiting
    if (i + CONCURRENCY < urls.length) {
      await sleep(300);
    }
  }

  // Final save
  writeFileSync(CATALOG_FILE, JSON.stringify(catalog, null, 2));
  writeFileSync(PROGRESS_FILE, JSON.stringify(catalog, null, 2));

  console.log(`\nDone! Catalog: ${catalog.length} products`);
  console.log(`Failures: ${failures}`);
  console.log(`Saved to: ${CATALOG_FILE}`);
}

main().catch(console.error);
