#!/usr/bin/env node
/**
 * scrape-catalog.mjs — Milwaukee Product Catalog Scraper
 *
 * Fetches every Milwaukee product page from the sitemap, extracts
 * structured product data from the embedded RSC / SSR payload, and
 * writes a master catalog JSON file.
 *
 * Input:   URL list at ../data/milwaukee-product-urls.txt
 * Output:  ../data/milwaukee-catalog.json
 *          ../data/milwaukee-progress.json  (resume checkpoint)
 *
 * Usage:
 *   node scripts/milwaukee/scrape-catalog.mjs
 *   node scripts/milwaukee/scrape-catalog.mjs --resume
 *   node scripts/milwaukee/scrape-catalog.mjs --limit 50      (dev: only first N)
 *   node scripts/milwaukee/scrape-catalog.mjs --concurrency 5  (parallel fetches)
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..', '..');
const DATA_DIR = join(ROOT, 'scripts', 'milwaukee', 'data');
const URL_FILE = join(DATA_DIR, 'milwaukee-product-urls.txt');
const OUTPUT_PATH = join(DATA_DIR, 'milwaukee-catalog.json');
const PROGRESS_PATH = join(DATA_DIR, 'milwaukee-progress.json');

// ── CLI flags ──────────────────────────────────────────────
const args = process.argv.slice(2);
const RESUME = args.includes('--resume');
const LIMIT = args.includes('--limit')
  ? parseInt(args[args.indexOf('--limit') + 1], 10)
  : 0;
const CONCURRENCY = args.includes('--concurrency')
  ? parseInt(args[args.indexOf('--concurrency') + 1], 10)
  : 3;

const DELAY_MS = 300;           // between batches
const BATCH_PAUSE_EVERY = 100;  // pause after this many fetches
const BATCH_PAUSE_MS = 5000;    // longer pause to be polite
const SAVE_EVERY = 50;          // checkpoint every N products
const MAX_RETRIES = 3;

const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

// ── Helpers ────────────────────────────────────────────────
function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Extract data from the RSC / SSR payload embedded in the HTML.
 *
 * Milwaukee's Next.js pages embed flight data via:
 *   self.__next_f.push([1, "...escaped RSC lines..."])
 *
 * The productData JSON is nested inside the largest chunk, within a
 * Sitecore layout component prop.
 */
function extractProductData(html) {
  // Step 1: Collect all flight chunks
  const chunkRe = /self\.__next_f\.push\(\[1,"(.*?)"\]\)/gs;
  let match;
  const chunks = [];
  while ((match = chunkRe.exec(html)) !== null) {
    chunks.push(match[1]);
  }
  if (chunks.length === 0) return null;

  // Step 2: Build a global RSC ref map from ALL chunks
  // Lines in the flight stream are "hex_id:content\n"
  const allText = chunks.join('');
  const refMap = {};
  const lines = allText.split('\\n');
  for (const line of lines) {
    const m = line.match(/^([0-9a-f]+):(.*)/s);
    if (m) {
      refMap[m[1]] = m[2];
    }
  }

  // Step 3: Find the productData JSON inside the SSR chunk
  // Look for "productData":{...} in the raw chunk that contains it
  let productJson = null;
  for (const chunk of chunks) {
    const marker = 'productData';
    const idx = chunk.indexOf(marker);
    if (idx === -1) continue;

    // Find the opening { of productData
    const objStart = chunk.indexOf('{', idx + marker.length);
    if (objStart === -1) continue;

    // Extract balanced JSON object (accounting for escaped quotes)
    let depth = 0;
    let i = objStart;
    while (i < chunk.length) {
      const c = chunk[i];
      if (c === '\\' && i + 1 < chunk.length) {
        i += 2; // skip escaped char
        continue;
      }
      if (c === '{') depth++;
      else if (c === '}') depth--;
      if (depth === 0) {
        const raw = chunk.substring(objStart, i + 1);
        try {
          // Unescape JS string → valid JSON
          const cleaned = raw
            .replace(/\\"/g, '"')
            .replace(/\\\\/g, '\\')
            .replace(/\\u003c/g, '<')
            .replace(/\\u003e/g, '>')
            .replace(/\\u0026/g, '&');
          productJson = JSON.parse(cleaned);
        } catch {
          // Try alternate: sometimes there's a simpler copy later
        }
        break;
      }
      i++;
    }
    if (productJson) break;
  }

  if (!productJson) return null;

  // Step 4: Resolve overview text
  // The overview might be a $-ref (e.g. "$60") pointing to a T-type text ref
  let overview = productJson.overview || '';
  if (typeof overview === 'string' && overview.startsWith('$')) {
    const refId = overview.slice(1);
    const tRef = refMap[refId];
    if (tRef && tRef.startsWith('T')) {
      // Format: T<length>,<text>
      const commaIdx = tRef.indexOf(',');
      if (commaIdx > 0) {
        overview = tRef.slice(commaIdx + 1);
      }
    } else if (tRef) {
      overview = tRef;
    }
  }
  // If still unresolved, try finding a T-type ref that has overview text
  if (typeof overview === 'string' && overview.startsWith('$')) {
    for (const [, content] of Object.entries(refMap)) {
      if (content.startsWith('T') && content.length > 50) {
        const commaIdx = content.indexOf(',');
        if (commaIdx > 0) {
          overview = content.slice(commaIdx + 1);
          break;
        }
      }
    }
  }
  // Fallback: meta description
  if (!overview || overview.startsWith('$')) {
    const metaMatch = html.match(
      /<meta\s+name="description"\s+content="([^"]*?)"/i
    );
    if (metaMatch) {
      overview = metaMatch[1]
        .replace(/&#x27;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, '&');
    }
  }

  // Step 5: Resolve features
  let features = productJson.features || [];
  if (typeof features === 'string' && features.startsWith('$')) {
    const refId = features.slice(1);
    const content = refMap[refId];
    if (content) {
      try {
        const parsed = JSON.parse(content.replace(/\\"/g, '"').replace(/\\\\/g, '\\'));
        if (Array.isArray(parsed)) features = parsed;
      } catch { /* leave as-is */ }
    }
  }
  // If features is still a ref, search for inline features array in the SSR chunk
  if (!Array.isArray(features)) {
    for (const chunk of chunks) {
      const featIdx = chunk.indexOf('"features":[');
      if (featIdx === -1) continue;
      // Only take the one that follows our productData's sku
      const skuBefore = chunk.lastIndexOf(productJson.sku, featIdx);
      if (skuBefore === -1 || featIdx - skuBefore > 500) continue;

      const arrStart = chunk.indexOf('[', featIdx);
      let depth2 = 0, j = arrStart;
      while (j < chunk.length) {
        if (chunk[j] === '\\' && j + 1 < chunk.length) { j += 2; continue; }
        if (chunk[j] === '[') depth2++;
        else if (chunk[j] === ']') depth2--;
        if (depth2 === 0) {
          try {
            const raw2 = chunk.substring(arrStart, j + 1)
              .replace(/\\"/g, '"')
              .replace(/\\\\/g, '\\');
            features = JSON.parse(raw2);
          } catch { /* leave */ }
          break;
        }
        j++;
      }
      if (Array.isArray(features)) break;
    }
  }

  // Step 6: Resolve image URLs
  const heroImage = resolveImageRef(productJson.heroImage, refMap);
  let mediaGallery = productJson.mediaGallery || [];
  if (Array.isArray(mediaGallery)) {
    mediaGallery = mediaGallery.map((item) => {
      if (typeof item === 'object' && item !== null) return item;
      if (typeof item === 'string' && item.startsWith('$')) {
        return resolveImageRef(item, refMap);
      }
      return item;
    }).filter(Boolean);
  } else if (typeof mediaGallery === 'string' && mediaGallery.startsWith('$')) {
    const refId = mediaGallery.slice(1);
    const content = refMap[refId];
    if (content) {
      try {
        const parsed = JSON.parse(content.replace(/\\"/g, '"').replace(/\\\\/g, '\\'));
        if (Array.isArray(parsed)) {
          mediaGallery = parsed.map(item => {
            if (typeof item === 'string' && item.startsWith('$')) {
              return resolveImageRef(item, refMap);
            }
            return item;
          }).filter(Boolean);
        }
      } catch { mediaGallery = []; }
    }
  }

  // Step 7: Resolve specs
  // Milwaukee has two formats:
  //   "specs":  object-style { key: {name, display, value}, ... }
  //   "specs2": array-style  [ {key, name, value, display}, ... ]
  // Prefer specs2 (array) if available, fall back to specs (object)
  let specs = productJson.specs2 || productJson.specs || [];
  if (typeof specs === 'string' && specs.startsWith('$')) {
    specs = resolveArrayRef(specs, refMap);
  } else if (Array.isArray(specs)) {
    specs = specs.map((item) => {
      if (typeof item === 'string' && item.startsWith('$')) {
        return resolveJsonRef(item, refMap);
      }
      return item;
    }).filter(Boolean);
  } else if (typeof specs === 'object' && specs !== null && !Array.isArray(specs)) {
    // Object-style specs: convert { key: {name, display, value} } → array
    specs = Object.entries(specs).map(([key, val]) => {
      if (typeof val === 'object' && val !== null) {
        return { key, name: val.name || key, value: val.value || '', display: val.display || '' };
      }
      if (typeof val === 'string' && val.startsWith('$')) {
        const resolved = resolveJsonRef(val, refMap);
        if (resolved && typeof resolved === 'object') {
          return { key, name: resolved.name || key, value: resolved.value || '', display: resolved.display || '' };
        }
      }
      return null;
    }).filter(Boolean);
  }

  // Step 8: Resolve marketing categories
  let marketingCategories = productJson.marketingCategories || {};
  if (typeof marketingCategories === 'string' && marketingCategories.startsWith('$')) {
    const mRef = resolveJsonRef(marketingCategories, refMap);
    if (mRef && typeof mRef === 'object') {
      // Resolve nested $-refs in the categories
      const resolved = {};
      for (const [key, val] of Object.entries(mRef)) {
        if (typeof val === 'string' && val.startsWith('$')) {
          resolved[key] = resolveJsonRef(val, refMap);
        } else {
          resolved[key] = val;
        }
      }
      marketingCategories = resolved;
    }
  }

  // Step 9: Resolve includes
  let includes = productJson.includes || [];
  if (typeof includes === 'string' && includes.startsWith('$')) {
    includes = resolveArrayRef(includes, refMap);
  }

  // Step 10: Build category path from marketing categories
  const categoryEntries = [];
  if (typeof marketingCategories === 'object' && marketingCategories !== null) {
    for (const val of Object.values(marketingCategories)) {
      if (val && typeof val === 'object' && val.display) {
        categoryEntries.push(val);
      }
    }
  }
  categoryEntries.sort((a, b) => (a.order || 0) - (b.order || 0));
  const categories = categoryEntries.map((c) => c.display);
  const categoryPath = categoryEntries.map((c) => c.url || '');

  // Build images map matching DeWalt schema
  const imageUrls = [];
  if (heroImage?.url) {
    imageUrls.push(heroImage.url);
  }
  if (Array.isArray(mediaGallery)) {
    for (const img of mediaGallery) {
      if (img?.url && img.type === 'IMAGE' && !imageUrls.includes(img.url)) {
        imageUrls.push(img.url);
      }
    }
  }

  // Specs: normalize to match DeWalt format { key: [value] }
  const normalizedSpecs = {};
  if (Array.isArray(specs)) {
    for (const s of specs) {
      if (s && typeof s === 'object' && s.key && s.value) {
        normalizedSpecs[s.key] = [s.value];
      }
    }
  }

  // Documents
  let documents = productJson.documents || [];
  if (typeof documents === 'string' && documents.startsWith('$')) {
    documents = resolveArrayRef(documents, refMap);
  }

  return {
    sku: productJson.sku || '',
    familyIdentifier: productJson.familyIdentifier || '',
    name: productJson.title || '',
    url: '', // Will be set by caller
    description: overview,
    images: imageUrls.map((u) =>
      u.startsWith('/') ? `https://www.milwaukeetool.com${u}` : u
    ),
    heroImage: heroImage?.url
      ? (heroImage.url.startsWith('/')
          ? `https://www.milwaukeetool.com${heroImage.url}`
          : heroImage.url)
      : '',
    category: categories[0] || 'Uncategorized',
    categories,
    categoryPath,
    subBrand: productJson.productLine || '',
    features: Array.isArray(features) ? features : [],
    specifications: normalizedSpecs,
    specsRaw: Array.isArray(specs) ? specs : [],
    includes: Array.isArray(includes)
      ? includes.map((inc) => {
          if (typeof inc === 'object' && inc !== null) {
            return {
              sku: inc.sku || '',
              title: inc.title || '',
              quantity: inc.quantity || 1,
            };
          }
          return inc;
        })
      : [],
    documents: Array.isArray(documents)
      ? documents.map((d) => {
          if (typeof d === 'object' && d !== null) {
            return { type: d.type || '', title: d.title || '', url: d.url || '' };
          }
          return d;
        })
      : [],
    upc: productJson.upc || '',
    flags: {
      isConfigurable: !!productJson.configurable,
      isOneKeyCompatible: !!productJson.isOneKeyCompatible,
      hideSignup: !!productJson.hideSignup,
    },
    productLine: productJson.productLine || '',
    score: productJson.score || 0,
    launchDate: productJson.launchDate || '',
    publicAnnouncementDate: productJson.publicAnnouncementDate || '',
  };
}

function resolveJsonRef(val, refMap) {
  if (typeof val !== 'string' || !val.startsWith('$')) return val;
  const refId = val.slice(1);
  const content = refMap[refId];
  if (!content) return null;
  try {
    return JSON.parse(content.replace(/\\"/g, '"').replace(/\\\\/g, '\\'));
  } catch {
    return content;
  }
}

function resolveImageRef(val, refMap) {
  if (typeof val === 'object' && val !== null) return val;
  if (typeof val === 'string' && val.startsWith('$')) {
    return resolveJsonRef(val, refMap);
  }
  return null;
}

function resolveArrayRef(val, refMap) {
  if (Array.isArray(val)) return val;
  if (typeof val !== 'string' || !val.startsWith('$')) return [];
  const refId = val.slice(1);
  const content = refMap[refId];
  if (!content) return [];
  try {
    const parsed = JSON.parse(content.replace(/\\"/g, '"').replace(/\\\\/g, '\\'));
    if (Array.isArray(parsed)) {
      return parsed.map((item) => {
        if (typeof item === 'string' && item.startsWith('$')) {
          return resolveJsonRef(item, refMap);
        }
        return item;
      });
    }
    return [];
  } catch {
    return [];
  }
}

// ── Fetch with retries ─────────────────────────────────────
async function fetchWithRetry(url, maxRetries = MAX_RETRIES) {
  let lastErr;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': USER_AGENT },
        redirect: 'follow',
      });
      if (res.status >= 400 && res.status < 500) {
        throw Object.assign(new Error(`HTTP ${res.status}`), { noRetry: true });
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.text();
    } catch (err) {
      lastErr = err;
      if (err.noRetry || attempt >= maxRetries) break;
      process.stdout.write(`(retry ${attempt}) `);
      await sleep(1000 * attempt);
    }
  }
  throw lastErr;
}

// ── Main ───────────────────────────────────────────────────
async function main() {
  console.log('=== Milwaukee Full Catalog Scraper ===\n');

  mkdirSync(DATA_DIR, { recursive: true });

  // Load URLs
  if (!existsSync(URL_FILE)) {
    console.error(`URL file not found: ${URL_FILE}`);
    console.error('Run: node scripts/milwaukee/extract-urls.mjs first');
    process.exit(1);
  }

  const urls = readFileSync(URL_FILE, 'utf-8')
    .split('\n')
    .map((u) => u.trim())
    .filter((u) => u.startsWith('http'));

  console.log(`Loaded ${urls.length} product URLs`);

  const toScrape = LIMIT > 0 ? urls.slice(0, LIMIT) : urls;
  console.log(`Will scrape: ${toScrape.length} products`);
  console.log(`Concurrency: ${CONCURRENCY}`);
  console.log(`Resume: ${RESUME}\n`);

  // Load existing progress
  let results = {};
  if (RESUME && existsSync(PROGRESS_PATH)) {
    results = JSON.parse(readFileSync(PROGRESS_PATH, 'utf8'));
    console.log(`Resuming: ${Object.keys(results).length} already scraped\n`);
  }

  const failed = [];
  let completed = 0;
  let skipped = 0;
  const startTime = Date.now();

  // Build work queue
  const queue = [];
  for (const url of toScrape) {
    // Extract SKU from URL (last path segment)
    const parts = url.split('/');
    const sku = parts[parts.length - 1];
    if (RESUME && results[sku]) {
      skipped++;
      continue;
    }
    queue.push({ url, sku });
  }

  console.log(`Queue: ${queue.length} (skipped ${skipped} already done)\n`);

  // Process with concurrency
  let queueIdx = 0;
  let fetchCount = 0;

  async function worker() {
    while (true) {
      const idx = queueIdx++;
      if (idx >= queue.length) break;

      const { url, sku } = queue[idx];

      // Batch pause
      if (fetchCount > 0 && fetchCount % BATCH_PAUSE_EVERY === 0) {
        await sleep(BATCH_PAUSE_MS);
      }

      try {
        const html = await fetchWithRetry(url);
        const data = extractProductData(html);

        if (data) {
          data.url = url;
          results[sku] = data;
          completed++;

          const imgs = data.images.length;
          const feats = data.features.length;
          const specCount = Object.keys(data.specifications).length;
          const ov = data.description ? '✓' : '✗';

          if (completed % 10 === 0 || completed <= 5) {
            process.stdout.write(
              `\r  [${completed}/${queue.length}] ${sku} — img:${imgs} feat:${feats} spec:${specCount} ov:${ov}`
            );
          }
        } else {
          // Page loaded but no product data found
          failed.push({ sku, url, reason: 'no-data' });
          if (completed % 10 === 0) {
            process.stdout.write(`\r  [${completed}/${queue.length}] ${sku} — NO DATA`);
          }
        }
      } catch (err) {
        failed.push({ sku, url, reason: err.message });
      }

      fetchCount++;

      // Checkpoint save
      if (fetchCount % SAVE_EVERY === 0) {
        writeFileSync(PROGRESS_PATH, JSON.stringify(results, null, 2));
        const done = Object.keys(results).length;
        process.stdout.write(`\n  💾 Progress: ${done} saved\n`);
      }

      await sleep(DELAY_MS);
    }
  }

  const workers = Array.from({ length: CONCURRENCY }, () => worker());
  await Promise.all(workers);

  // Final save
  const catalog = Object.values(results);
  writeFileSync(OUTPUT_PATH, JSON.stringify(catalog, null, 2));
  writeFileSync(PROGRESS_PATH, JSON.stringify(results, null, 2));

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n\n=== Done in ${elapsed}s ===`);
  console.log(`  Products scraped: ${catalog.length}`);
  console.log(`  Failed: ${failed.length}`);
  console.log(`  Output: ${OUTPUT_PATH}`);

  if (failed.length > 0) {
    console.log(`\n  Failed products:`);
    for (const f of failed.slice(0, 20)) {
      console.log(`    ${f.sku}: ${f.reason}`);
    }
    if (failed.length > 20) {
      console.log(`    ... and ${failed.length - 20} more`);
    }
    writeFileSync(
      join(DATA_DIR, 'milwaukee-failed.json'),
      JSON.stringify(failed, null, 2)
    );
    console.log(`\n  Run with --resume to retry failed items.`);
  }

  // Print sample
  if (catalog.length > 0) {
    const sample = catalog[0];
    console.log('\n--- Sample product ---');
    console.log(
      JSON.stringify(
        {
          sku: sample.sku,
          name: sample.name,
          category: sample.category,
          categories: sample.categories,
          imageCount: sample.images.length,
          featureCount: sample.features.length,
          specCount: Object.keys(sample.specifications).length,
          descriptionPreview: (sample.description || '').slice(0, 120),
          productLine: sample.productLine,
        },
        null,
        2
      )
    );
  }

  // Category stats
  const byCategory = {};
  for (const p of catalog) {
    byCategory[p.category] = (byCategory[p.category] || 0) + 1;
  }
  const sortedCats = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);
  if (sortedCats.length > 0) {
    console.log('\nTop categories:');
    for (const [cat, count] of sortedCats.slice(0, 15)) {
      console.log(`  ${cat}: ${count}`);
    }
    console.log(`  ... (${sortedCats.length} total categories)`);
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
