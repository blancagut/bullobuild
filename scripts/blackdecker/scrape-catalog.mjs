#!/usr/bin/env node
/**
 * Black+Decker Product Catalog Scraper
 *
 * Uses Shopify Storefront API (GraphQL) to fetch all products.
 * Storefront token is public/read-only (exposed in page HTML).
 *
 * Usage:
 *   node scrape-catalog.mjs [--resume] [--limit N]
 */

import { writeFileSync, readFileSync, existsSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = resolve(__dirname, "data");
const CATALOG_FILE = resolve(DATA_DIR, "bd-catalog.json");
const PROGRESS_FILE = resolve(DATA_DIR, "bd-progress.json");

const SHOP = "blackanddecker-prod.myshopify.com";
const STOREFRONT_TOKEN = "f9264d5f6b457325e37d31daf3a42d2f";
const ENDPOINT = `https://${SHOP}/api/2024-01/graphql.json`;
const PAGE_SIZE = 250;

// ── CLI args ──
const args = process.argv.slice(2);
const RESUME = args.includes("--resume");
const LIMIT = args.includes("--limit")
  ? parseInt(args[args.indexOf("--limit") + 1], 10)
  : Infinity;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

const PRODUCTS_QUERY = `
  query GetProducts($first: Int!, $after: String) {
    products(first: $first, after: $after) {
      edges {
        node {
          id
          title
          handle
          productType
          vendor
          tags
          descriptionHtml
          description
          priceRange {
            minVariantPrice { amount currencyCode }
            maxVariantPrice { amount currencyCode }
          }
          compareAtPriceRange {
            minVariantPrice { amount currencyCode }
          }
          images(first: 10) {
            edges {
              node {
                url
                altText
                width
                height
              }
            }
          }
          variants(first: 20) {
            edges {
              node {
                id
                title
                sku
                availableForSale
                price { amount currencyCode }
                compareAtPrice { amount currencyCode }
                selectedOptions { name value }
              }
            }
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

async function fetchPage(after = null, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const variables = { first: PAGE_SIZE };
      if (after) variables.after = after;

      const resp = await fetch(ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Storefront-Access-Token": STOREFRONT_TOKEN,
        },
        body: JSON.stringify({ query: PRODUCTS_QUERY, variables }),
      });

      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

      const json = await resp.json();
      if (json.errors) throw new Error(json.errors[0].message);

      return json.data.products;
    } catch (err) {
      if (attempt < retries) {
        await sleep(2000 * attempt);
        continue;
      }
      throw err;
    }
  }
}

function extractFeatures(description) {
  if (!description) return [];
  // Extract bullet-point-like sentences (lines starting with - or •, or short sentences after newlines)
  const lines = description.split(/\n/).map((l) => l.trim()).filter(Boolean);
  return lines
    .map((l) => l.replace(/^[-•*]\s*/, "").trim())
    .filter((l) => l.length > 10 && l.length < 300);
}

function extractCategories(tags, productType) {
  // B+D tags mix category info with other flags
  // Category tags are typically Title Case without colons
  const skipPatterns = /^(available|badge|giftwrap|spinimages|zeropriceproduct|UPLOADING|tool kit)/i;
  const cats = tags.filter((t) => !skipPatterns.test(t) && !t.includes(":"));

  const categories = [];
  if (productType && productType.trim()) categories.push(productType.trim());

  for (const cat of cats) {
    if (!categories.includes(cat)) categories.push(cat);
  }

  return categories.slice(0, 6);
}

function extractSpecifications(tags, variants) {
  const specs = {};

  // Extract variant option specs
  if (variants.length > 0) {
    const firstVariant = variants[0];
    for (const opt of firstVariant.selectedOptions || []) {
      if (opt.name !== "Title" && opt.value !== "Default Title") {
        specs[opt.name] = opt.value;
      }
    }
  }

  // Extract spec-like tags (key:value format)
  for (const tag of tags) {
    const colonIdx = tag.indexOf(":");
    if (colonIdx > 0) {
      const key = tag.slice(0, colonIdx).trim();
      const val = tag.slice(colonIdx + 1).trim();
      if (key && val && key.toLowerCase() !== "available" && key.toLowerCase() !== "badge" && key.toLowerCase() !== "giftwrap") {
        specs[key] = val;
      }
    }
  }

  return specs;
}

function mapProduct(node) {
  const variants = node.variants.edges.map((e) => e.node);
  const images = node.images.edges.map((e) => e.node.url);
  const heroImage = images[0] || "";

  // Primary SKU — use first variant's SKU, fallback to handle
  const sku = (variants[0]?.sku || node.handle || "").toUpperCase();

  const categories = extractCategories(node.tags, node.productType);
  const features = extractFeatures(node.description);
  const specifications = extractSpecifications(node.tags, variants);

  const minPrice = parseFloat(node.priceRange.minVariantPrice.amount);
  const maxPrice = parseFloat(node.priceRange.maxVariantPrice.amount);
  const currency = node.priceRange.minVariantPrice.currencyCode;

  const compareAt = parseFloat(node.compareAtPriceRange?.minVariantPrice?.amount || "0");

  return {
    sku,
    name: node.title,
    handle: node.handle,
    url: `https://www.blackanddecker.com/products/${node.handle}`,
    description: node.description,
    images,
    heroImage,
    category: node.productType || categories[0] || "Uncategorized",
    categories,
    features,
    specifications,
    price: {
      min: minPrice,
      max: maxPrice,
      currency,
      compareAt: compareAt > 0 ? compareAt : null,
    },
    vendor: node.vendor,
    tags: node.tags,
    variants: variants.map((v) => ({
      id: v.id,
      title: v.title,
      sku: v.sku,
      price: parseFloat(v.price.amount),
      compareAtPrice: v.compareAtPrice ? parseFloat(v.compareAtPrice.amount) : null,
      available: v.availableForSale,
      options: v.selectedOptions,
    })),
    hasVariants: variants.length > 1,
    available: variants.some((v) => v.availableForSale),
  };
}

async function main() {
  mkdirSync(DATA_DIR, { recursive: true });

  console.log("=== Black+Decker Shopify Catalog Scraper ===\n");

  let catalog = [];
  let seenSkus = new Set();
  let cursor = null;

  // Resume support
  if (RESUME && existsSync(PROGRESS_FILE)) {
    const saved = JSON.parse(readFileSync(PROGRESS_FILE, "utf-8"));
    catalog = saved.catalog || [];
    cursor = saved.cursor || null;
    catalog.forEach((p) => { if (p.sku) seenSkus.add(p.sku); });
    console.log(`Resuming from cursor ${cursor} | ${catalog.length} products already fetched`);
  }

  let pageNum = 0;
  let totalFetched = 0;
  let hasMore = true;

  while (hasMore && totalFetched < LIMIT) {
    pageNum++;
    process.stdout.write(`  Page ${pageNum} (cursor: ${cursor || "start"})... `);

    let page;
    try {
      page = await fetchPage(cursor);
    } catch (err) {
      console.error(`\nFailed page ${pageNum}: ${err.message}`);
      break;
    }

    const products = page.edges.map((e) => e.node);
    hasMore = page.pageInfo.hasNextPage;
    cursor = page.pageInfo.endCursor;

    let added = 0;
    for (const node of products) {
      if (totalFetched >= LIMIT) break;
      const product = mapProduct(node);

      // Deduplicate by SKU
      if (product.sku && seenSkus.has(product.sku)) continue;
      if (product.sku) seenSkus.add(product.sku);

      catalog.push(product);
      totalFetched++;
      added++;
    }

    console.log(`${added} added | total: ${catalog.length}`);

    // Save checkpoint every page
    writeFileSync(PROGRESS_FILE, JSON.stringify({ catalog, cursor }, null, 2));

    if (hasMore) await sleep(300);
  }

  // Final save
  writeFileSync(CATALOG_FILE, JSON.stringify(catalog, null, 2));

  console.log(`\n=== Done ===`);
  console.log(`Total products: ${catalog.length}`);
  console.log(`Unique SKUs: ${seenSkus.size}`);

  // Stats
  const cats = {};
  let priced = 0;
  let withImages = 0;
  for (const p of catalog) {
    cats[p.category] = (cats[p.category] || 0) + 1;
    if (p.price.min > 0) priced++;
    if (p.images.length > 0) withImages++;
  }
  console.log(`With price: ${priced} | With images: ${withImages}`);
  console.log(`\nTop categories:`);
  Object.entries(cats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .forEach(([c, n]) => console.log(`  ${c}: ${n}`));
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
