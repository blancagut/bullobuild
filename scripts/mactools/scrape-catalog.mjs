#!/usr/bin/env node
/**
 * Mac Tools Product Catalog Scraper
 *
 * Mac Tools runs on Shopify — their /products.json API returns all data
 * including prices, variants, images, and metadata tags.
 *
 * API: https://www.mactools.com/products.json?limit=250&page=N
 * Total: ~8,926 products across 36 pages
 *
 * Usage:
 *   node scrape-catalog.mjs [--resume] [--limit N] [--delay N]
 */

import { writeFileSync, existsSync, mkdirSync, readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = resolve(__dirname, "data");
const CATALOG_FILE = resolve(DATA_DIR, "mactools-catalog.json");
const PROGRESS_FILE = resolve(DATA_DIR, "mactools-progress.json");

// ── CLI args ──
const args = process.argv.slice(2);
const RESUME = args.includes("--resume");
const LIMIT = args.includes("--limit")
  ? parseInt(args[args.indexOf("--limit") + 1], 10)
  : Infinity;
const DELAY_MS = args.includes("--delay")
  ? parseInt(args[args.indexOf("--delay") + 1], 10)
  : 500;
const PAGE_SIZE = 250;

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "application/json",
};

if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Parse EP:* and PRICE:* encoded tags into structured metadata.
 * Mac Tools encodes product attributes in tags like:
 *   "EP:ItemNum|MACIMP-O-XXL"
 *   "PRICE:NP|30.59"
 */
function parseTags(tags) {
  const meta = {};
  const prices = {};
  const refiners = {};
  const raw = [];

  for (const tag of tags) {
    if (tag.startsWith("EP:")) {
      const rest = tag.slice(3);
      const pipe = rest.indexOf("|");
      if (pipe !== -1) {
        const key = rest.slice(0, pipe);
        const val = rest.slice(pipe + 1).trim();
        meta[key] = val;
      } else {
        raw.push(tag);
      }
    } else if (tag.startsWith("PRICE:")) {
      const rest = tag.slice(6);
      const pipe = rest.indexOf("|");
      if (pipe !== -1) {
        const key = rest.slice(0, pipe);
        const val = rest.slice(pipe + 1).trim();
        if (val !== "") prices[key] = val;
      }
    } else if (tag.startsWith("REFINER:")) {
      const rest = tag.slice(8);
      const pipe = rest.indexOf("|");
      if (pipe !== -1) {
        const key = rest.slice(0, pipe);
        const val = rest.slice(pipe + 1).trim();
        if (val !== "") {
          if (!refiners[key]) refiners[key] = [];
          refiners[key].push(val);
        }
      }
    } else {
      raw.push(tag);
    }
  }

  return { meta, prices, refiners, otherTags: raw };
}

/**
 * Transform a raw Shopify product into our normalized catalog format.
 */
function normalizeProduct(p) {
  const { meta, prices, refiners, otherTags } = parseTags(p.tags || []);

  // Collect all unique image URLs
  const images = (p.images || []).map((img) => ({
    url: img.src,
    alt: img.alt || null,
    width: img.width || null,
    height: img.height || null,
    position: img.position,
    variantIds: img.variant_ids || [],
  }));

  // Normalize variants
  const variants = (p.variants || []).map((v) => ({
    id: v.id,
    sku: v.sku || null,
    title: v.title,
    price: v.price ? parseFloat(v.price) : null,
    compareAtPrice: v.compare_at_price ? parseFloat(v.compare_at_price) : null,
    available: v.available,
    option1: v.option1 || null,
    option2: v.option2 || null,
    option3: v.option3 || null,
    requiresShipping: v.requires_shipping,
    taxable: v.taxable,
    grams: v.grams,
    imageId: v.featured_image?.id || null,
  }));

  // Primary price = first variant price (lowest when sorted)
  const pricesSorted = variants
    .map((v) => v.price)
    .filter((x) => x !== null)
    .sort((a, b) => a - b);
  const priceMin = pricesSorted[0] ?? null;
  const priceMax = pricesSorted[pricesSorted.length - 1] ?? null;

  // Primary SKU — from EP metadata or first variant
  const primarySku =
    meta.ItemNum ||
    (variants.length === 1 ? variants[0].sku : null) ||
    p.handle.toUpperCase();

  return {
    shopifyId: p.id,
    handle: p.handle,
    sku: primarySku,
    title: p.title,
    description: p.body_html || null,
    vendor: p.vendor,
    productType: p.product_type || null,
    url: `https://www.mactools.com/products/${p.handle}`,
    publishedAt: p.published_at,
    createdAt: p.created_at,
    updatedAt: p.updated_at,
    priceMin,
    priceMax,
    // Decoded price tiers from tags (EP=employee, NP=normal, STP=suggested trade, NA2-4=tier)
    priceTiers: prices,
    images,
    heroImage: images[0]?.url || null,
    variants,
    options: (p.options || []).map((o) => ({
      name: o.name,
      values: o.values,
    })),
    // EP metadata (country of origin, weight, discontinued flag, etc.)
    metadata: meta,
    // REFINER attributes (Color, Size, Style, etc. from tags)
    refiners,
    tags: otherTags,
    isDiscontinued: meta.DiscontinueFlag === "true",
    availableForSale: variants.some((v) => v.available),
    weight: meta.Weight ? parseFloat(meta.Weight) : null,
    countryOfOrigin: meta.CountryOfOrigin || null,
  };
}

async function fetchPage(page) {
  const url = `https://www.mactools.com/products.json?limit=${PAGE_SIZE}&page=${page}`;
  const resp = await fetch(url, { headers: HEADERS });
  if (!resp.ok) throw new Error(`HTTP ${resp.status} for page ${page}`);
  const data = await resp.json();
  return data.products || [];
}

async function main() {
  console.log("=== Mac Tools Catalog Scraper ===");
  console.log(`API: Shopify /products.json | Page size: ${PAGE_SIZE}`);
  console.log(`Delay between pages: ${DELAY_MS}ms`);
  if (RESUME) console.log("Resume: enabled");
  if (LIMIT < Infinity) console.log(`Limit: ${LIMIT} products`);
  console.log();

  // Load existing progress if resuming
  let catalog = {};
  let startPage = 1;

  if (RESUME && existsSync(PROGRESS_FILE)) {
    try {
      catalog = JSON.parse(readFileSync(PROGRESS_FILE, "utf8"));
      const existing = Object.keys(catalog).length;
      console.log(`Resuming from ${existing} existing products`);
      // Estimate start page (pages are 250 each)
      startPage = Math.max(1, Math.floor(existing / PAGE_SIZE));
      console.log(`Starting from page ${startPage} (may re-fetch some)`);
    } catch {
      console.warn("Could not load progress file, starting fresh");
      catalog = {};
    }
  }

  let totalFetched = 0;
  let page = startPage;
  let emptyPages = 0;

  while (true) {
    if (totalFetched >= LIMIT) {
      console.log(`\nLimit of ${LIMIT} products reached.`);
      break;
    }

    process.stdout.write(`  Page ${page}... `);

    let products;
    try {
      products = await fetchPage(page);
    } catch (err) {
      console.error(`\nError fetching page ${page}: ${err.message}`);
      // Retry once after a delay
      await sleep(3000);
      try {
        products = await fetchPage(page);
      } catch (err2) {
        console.error(`Retry failed: ${err2.message} — skipping page ${page}`);
        page++;
        continue;
      }
    }

    if (!products.length) {
      emptyPages++;
      console.log("empty");
      if (emptyPages >= 2) {
        console.log("Two consecutive empty pages — end of catalog.");
        break;
      }
      page++;
      continue;
    }
    emptyPages = 0;

    let newOnPage = 0;
    for (const raw of products) {
      const product = normalizeProduct(raw);
      const key = product.handle;
      if (!catalog[key]) newOnPage++;
      catalog[key] = product;
      totalFetched++;
      if (totalFetched >= LIMIT) break;
    }

    const total = Object.keys(catalog).length;
    console.log(
      `${products.length} products (${newOnPage} new) | total: ${total}`
    );

    // Checkpoint every page
    writeFileSync(PROGRESS_FILE, JSON.stringify(catalog, null, 2));

    if (products.length < PAGE_SIZE) {
      console.log("\nLast page reached — catalog complete.");
      break;
    }

    page++;
    await sleep(DELAY_MS);
  }

  // Write final catalog
  const allProducts = Object.values(catalog);
  allProducts.sort((a, b) => a.handle.localeCompare(b.handle));

  writeFileSync(CATALOG_FILE, JSON.stringify(allProducts, null, 2));

  console.log(`\n${"=".repeat(50)}`);
  console.log(`Total products: ${allProducts.length}`);
  console.log(
    `With prices:    ${allProducts.filter((p) => p.priceMin !== null).length}`
  );
  console.log(
    `Available:      ${allProducts.filter((p) => p.availableForSale).length}`
  );
  console.log(
    `Discontinued:   ${allProducts.filter((p) => p.isDiscontinued).length}`
  );
  console.log(
    `With images:    ${allProducts.filter((p) => p.images.length > 0).length}`
  );
  console.log(
    `Avg images:     ${(allProducts.reduce((s, p) => s + p.images.length, 0) / allProducts.length).toFixed(1)}`
  );
  console.log(
    `Avg variants:   ${(allProducts.reduce((s, p) => s + p.variants.length, 0) / allProducts.length).toFixed(1)}`
  );
  console.log(`\nCatalog saved → ${CATALOG_FILE}`);
  console.log(`Progress saved → ${PROGRESS_FILE}`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
