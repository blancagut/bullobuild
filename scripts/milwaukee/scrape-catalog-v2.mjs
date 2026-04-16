#!/usr/bin/env node
/**
 * scrape-catalog.mjs — Milwaukee Full Product Catalog Scraper (v2)
 *
 * Extracts ALL product data from milwaukeetool.com including:
 *   - SKU, name, description, UPC, family identifier
 *   - Images (hero + gallery)
 *   - Full specification list (key/name/value/display)
 *   - Features list
 *   - Kit includes (saleable items + accessories)
 *   - Category hierarchy (marketing categories)
 *   - Documents (manuals, parts lists)
 *   - Flags (configurable, ONE-KEY, hide signup)
 *   - Replacement products
 *   - Product line, sub-brand, score, dates
 *
 * Milwaukee does NOT list prices on their website — they sell through
 * distributors only ("Where To Buy").
 *
 * Input:   data/milwaukee-product-urls.txt
 * Output:  data/milwaukee-catalog.json
 *          data/milwaukee-progress.json  (resume checkpoint)
 *
 * Usage:
 *   node scripts/milwaukee/scrape-catalog.mjs
 *   node scripts/milwaukee/scrape-catalog.mjs --resume
 *   node scripts/milwaukee/scrape-catalog.mjs --limit 50
 *   node scripts/milwaukee/scrape-catalog.mjs --concurrency 5
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, 'data');
const URL_FILE = join(DATA_DIR, 'milwaukee-product-urls.txt');
const OUTPUT_PATH = join(DATA_DIR, 'milwaukee-catalog.json');
const PROGRESS_PATH = join(DATA_DIR, 'milwaukee-progress.json');

// ── CLI ────────────────────────────────────────────────────
const args = process.argv.slice(2);
const RESUME = args.includes('--resume');
const LIMIT = args.includes('--limit')
  ? parseInt(args[args.indexOf('--limit') + 1], 10) : 0;
const CONCURRENCY = args.includes('--concurrency')
  ? parseInt(args[args.indexOf('--concurrency') + 1], 10) : 3;

const DELAY_MS = 300;
const BATCH_PAUSE_EVERY = 100;
const BATCH_PAUSE_MS = 5000;
const SAVE_EVERY = 100;
const MAX_RETRIES = 3;

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ── Flight-chunk extraction (indexOf-based, no regex backtracking) ──
function extractChunks(html) {
  const chunks = [];
  const marker = 'self.__next_f.push([1,"';
  let pos = 0;
  while (true) {
    const start = html.indexOf(marker, pos);
    if (start === -1) break;
    const contentStart = start + marker.length;
    // Find closing "])  — content ends at the unescaped "
    let i = contentStart;
    while (i < html.length) {
      if (html[i] === '\\' && i + 1 < html.length) { i += 2; continue; }
      if (html[i] === '"') break;
      i++;
    }
    chunks.push(html.substring(contentStart, i));
    pos = i + 1;
  }
  return chunks;
}

// ── Single-pass JS string unescape ─────────────────────────
function unescapeJS(raw) {
  let out = '';
  for (let i = 0; i < raw.length; i++) {
    if (raw[i] === '\\' && i + 1 < raw.length) {
      const next = raw[i + 1];
      switch (next) {
        case '"':  out += '"'; i++; break;
        case '\\': out += '\\'; i++; break;
        case 'n':  out += '\n'; i++; break;
        case 't':  out += '\t'; i++; break;
        case 'r':  out += '\r'; i++; break;
        case '/':  out += '/'; i++; break;
        default:   out += '\\' + next; i++; break; // preserve \uXXXX
      }
    } else {
      out += raw[i];
    }
  }
  return out;
}

// ── Balanced-brace JSON extraction ──────────────────────────
function extractBalancedObject(str, startIdx) {
  let depth = 0, i = startIdx;
  while (i < str.length) {
    const c = str[i];
    if (c === '\\' && i + 1 < str.length) { i += 2; continue; }
    if (c === '{') depth++;
    else if (c === '}') depth--;
    if (depth === 0) return str.substring(startIdx, i + 1);
    i++;
  }
  return null;
}

// ── Resolve overview $-refs from RSC T-type lines ───────────
function resolveOverview(refToken, chunks, html) {
  if (typeof refToken !== 'string' || !refToken.startsWith('$')) return refToken;
  const refId = refToken.slice(1);

  // Build RSC line map from all chunks
  const allText = chunks.join('');
  const lines = allText.split('\\n');
  for (const line of lines) {
    const m = line.match(/^([0-9a-f]+):(.*)/s);
    if (m && m[1] === refId) {
      const content = m[2];
      // T-type: T<length>,<text>
      if (content.startsWith('T')) {
        const commaIdx = content.indexOf(',');
        if (commaIdx > 0) return content.slice(commaIdx + 1);
      }
      return content;
    }
  }

  // Fallback: meta description
  const metaMatch = html.match(/<meta\s+name="description"\s+content="([^"]*?)"/i);
  if (metaMatch) {
    return metaMatch[1]
      .replace(/&#x27;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&');
  }
  return '';
}

// ── Extract product data from HTML ──────────────────────────
function extractProductData(html) {
  const chunks = extractChunks(html);
  if (chunks.length === 0) return null;

  // Find chunk containing productData (search raw — quotes are escaped as \")
  let productChunk = null;
  let pdIdx = -1;
  for (let i = chunks.length - 1; i >= 0; i--) {
    const idx = chunks[i].indexOf('productData');
    if (idx !== -1) {
      productChunk = chunks[i];
      pdIdx = idx;
      break;
    }
  }
  if (!productChunk || pdIdx === -1) return null;

  // Extract the productData JSON object
  const objStart = productChunk.indexOf('{', pdIdx + 'productData'.length);
  if (objStart === -1) return null;

  const rawPd = extractBalancedObject(productChunk, objStart);
  if (!rawPd) return null;

  // Unescape and parse
  const unescaped = unescapeJS(rawPd);
  let pd;
  try {
    pd = JSON.parse(unescaped);
  } catch {
    return null;
  }

  // Resolve overview ($-ref → text)
  let description = pd.overview || '';
  if (typeof description === 'string' && description.startsWith('$')) {
    description = resolveOverview(description, chunks, html);
  }

  // Images — hero + mediaGallery + supportingImages
  const imageUrls = [];
  const addImage = (urlStr) => {
    if (!urlStr) return;
    const full = urlStr.startsWith('/') ? `https://www.milwaukeetool.com${urlStr}` : urlStr;
    if (!imageUrls.includes(full)) imageUrls.push(full);
  };
  if (pd.heroImage?.url) addImage(pd.heroImage.url);
  for (const arr of [pd.mediaGallery, pd.supportingImages]) {
    if (Array.isArray(arr)) {
      for (const img of arr) {
        if (img?.url) addImage(img.url);
      }
    }
  }

  // Videos
  let videos = [];
  if (Array.isArray(pd.videos)) {
    videos = pd.videos.map(v => ({
      poster: v?.poster?.url || '',
      vimeoId: v?.vimeoId || '',
    })).filter(v => v.vimeoId);
  }

  // Marketing categories → sorted hierarchy
  const categoryEntries = [];
  if (typeof pd.marketingCategories === 'object' && pd.marketingCategories !== null) {
    for (const val of Object.values(pd.marketingCategories)) {
      if (val && typeof val === 'object' && val.display) {
        categoryEntries.push(val);
      }
    }
  }
  categoryEntries.sort((a, b) => (a.order || 0) - (b.order || 0));
  const categories = categoryEntries.map(c => c.display);
  const categoryPath = categoryEntries.map(c => c.url || '');

  // Specs — handle both array format and object format, plus specs2
  const specifications = {};
  const specsRaw = [];
  const addSpec = (key, name, value, display) => {
    if (!key || specifications[key]) return; // dedup
    specifications[key] = [value || display || ''];
    specsRaw.push({ key, name: name || key, value: value || '', display: display || '' });
  };

  if (Array.isArray(pd.specs)) {
    for (const s of pd.specs) {
      if (s && typeof s === 'object' && s.key) addSpec(s.key, s.name, s.value, s.display);
    }
  } else if (typeof pd.specs === 'object' && pd.specs !== null) {
    for (const [k, v] of Object.entries(pd.specs)) {
      if (v && typeof v === 'object') addSpec(k, v.name, v.value, v.display);
    }
  }
  // specs2 (additional specs on some products)
  if (Array.isArray(pd.specs2)) {
    for (const s of pd.specs2) {
      if (s && typeof s === 'object' && s.key) addSpec(s.key, s.name, s.value, s.display);
    }
  }

  // Features
  let features = [];
  if (Array.isArray(pd.features)) {
    features = pd.features.filter(f => typeof f === 'string');
  }

  // Includes
  let includes = [];
  if (Array.isArray(pd.includes)) {
    includes = pd.includes.map(inc => {
      if (typeof inc === 'object' && inc !== null) {
        return {
          type: inc.type || '',
          sku: inc.sku || '',
          title: inc.title || '',
          quantity: inc.quantity || 1,
        };
      }
      return null;
    }).filter(Boolean);
  }

  // Kits (related kit items)
  let kits = [];
  if (Array.isArray(pd.kits)) {
    kits = pd.kits.map(k => {
      if (typeof k === 'object' && k !== null) {
        return { type: k.type || '', sku: k.sku || '', title: k.title || '' };
      }
      return null;
    }).filter(Boolean);
  }

  // Variants
  let variants = [];
  if (Array.isArray(pd.variants)) {
    variants = pd.variants.map(v => {
      if (typeof v === 'object' && v !== null) {
        return { sku: v.sku || '', title: v.title || '' };
      }
      return null;
    }).filter(Boolean);
  }

  // Documents
  let documents = [];
  if (Array.isArray(pd.documents)) {
    documents = pd.documents.map(d => {
      if (typeof d === 'object' && d !== null) {
        return { type: d.type || '', title: d.title || '', url: d.url || '' };
      }
      return null;
    }).filter(Boolean);
  }

  // Replacement products
  let replacementProducts = [];
  if (Array.isArray(pd.replacementProducts)) {
    replacementProducts = pd.replacementProducts;
  }

  return {
    sku: pd.sku || '',
    type: pd.type || '',
    familyIdentifier: pd.familyIdentifier || '',
    familyMemberOf: pd.familyMemberOf || '',
    name: pd.title || '',
    url: '',
    description,
    images: imageUrls,
    heroImage: imageUrls[0] || '',
    videos,
    category: categories[0] || 'Uncategorized',
    categories,
    categoryPath,
    subBrand: pd.productLine || '',
    features,
    specifications,
    specsRaw,
    includes,
    kits,
    variants,
    documents,
    upc: pd.upc || '',
    flags: {
      isConfigurable: !!pd.configurable,
      isOneKeyCompatible: !!pd.isOneKeyCompatible,
      hideSignup: !!pd.hideSignup,
    },
    productLine: pd.productLine || '',
    replacementProducts,
    score: pd.score || 0,
    sortOrder: pd.sortOrder || 0,
    launchDate: pd.launchDate || '',
    publicAnnouncementDate: pd.publicAnnouncementDate || '',
  };
}

// ── Fetch with retries ─────────────────────────────────────
async function fetchPage(url) {
  let lastErr;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': UA },
        redirect: 'follow',
      });
      if (res.status === 404) return { status: 404, html: '' };
      if (res.status >= 400) throw new Error(`HTTP ${res.status}`);
      return { status: res.status, html: await res.text() };
    } catch (err) {
      lastErr = err;
      if (attempt < MAX_RETRIES) {
        await sleep(1000 * attempt);
      }
    }
  }
  throw lastErr;
}

// ── Main ───────────────────────────────────────────────────
async function main() {
  console.log('=== Milwaukee Full Catalog Scraper v2 ===\n');

  mkdirSync(DATA_DIR, { recursive: true });

  if (!existsSync(URL_FILE)) {
    console.error('URL file not found:', URL_FILE);
    process.exit(1);
  }

  const urls = readFileSync(URL_FILE, 'utf-8')
    .split('\n')
    .map(u => u.trim())
    .filter(u => u.startsWith('http'));

  console.log(`Loaded ${urls.length} product URLs`);

  // Deduplicate by SKU (last path segment)
  const skuMap = new Map();
  for (const url of urls) {
    const parts = url.split('/');
    const sku = parts[parts.length - 1];
    if (!skuMap.has(sku)) skuMap.set(sku, url);
  }
  console.log(`Unique SKUs: ${skuMap.size}`);

  const toScrape = LIMIT > 0
    ? [...skuMap.entries()].slice(0, LIMIT)
    : [...skuMap.entries()];

  console.log(`Will scrape: ${toScrape.length}`);
  console.log(`Concurrency: ${CONCURRENCY}`);
  console.log(`Resume: ${RESUME}\n`);

  // Load existing progress
  let results = {};
  if (RESUME && existsSync(PROGRESS_PATH)) {
    try {
      results = JSON.parse(readFileSync(PROGRESS_PATH, 'utf8'));
      console.log(`Resuming: ${Object.keys(results).length} already scraped\n`);
    } catch {
      console.log('Could not parse progress file, starting fresh\n');
    }
  }

  // Build work queue (skip already-scraped)
  const queue = [];
  let skipped = 0;
  for (const [sku, url] of toScrape) {
    if (RESUME && results[sku]) {
      skipped++;
      continue;
    }
    queue.push({ sku, url });
  }
  console.log(`Queue: ${queue.length} (skipped ${skipped} already done)\n`);

  if (queue.length === 0) {
    console.log('Nothing to scrape. Use without --resume to re-scrape all.');
    const catalog = Object.values(results);
    writeFileSync(OUTPUT_PATH, JSON.stringify(catalog, null, 2));
    console.log(`Catalog: ${catalog.length} products → ${OUTPUT_PATH}`);
    return;
  }

  const failed = [];
  let completed = 0;
  let notFound = 0;
  let noData = 0;
  let fetchCount = 0;
  const startTime = Date.now();

  async function worker() {
    while (true) {
      const idx = fetchCount++;
      if (idx >= queue.length) break;
      const { sku, url } = queue[idx];

      // Batch pause
      if (idx > 0 && idx % BATCH_PAUSE_EVERY === 0) {
        await sleep(BATCH_PAUSE_MS);
      }

      try {
        const { status, html } = await fetchPage(url);

        if (status === 404) {
          notFound++;
          // Skip discontinued products
          if ((completed + notFound) % 50 === 0) {
            process.stdout.write(`\r  [${completed}] scraped | ${notFound} 404 | ${idx + 1}/${queue.length} processed`);
          }
          await sleep(DELAY_MS);
          continue;
        }

        const data = extractProductData(html);
        if (data) {
          data.url = url;
          results[sku] = data;
          completed++;

          if (completed <= 5 || completed % 50 === 0) {
            const imgs = data.images.length;
            const specs = Object.keys(data.specifications).length;
            const feats = data.features.length;
            const cats = data.categories.length;
            process.stdout.write(
              `\r  [${completed}] ${sku} — img:${imgs} spec:${specs} feat:${feats} cat:${cats} | ${notFound} 404 | ${idx + 1}/${queue.length}`
            );
          }
        } else {
          noData++;
          failed.push({ sku, url, reason: 'no-data' });
        }
      } catch (err) {
        failed.push({ sku, url, reason: err.message });
      }

      // Checkpoint
      if ((completed + notFound) > 0 && (completed + notFound) % SAVE_EVERY === 0) {
        writeFileSync(PROGRESS_PATH, JSON.stringify(results, null, 2));
        process.stdout.write(`\n  💾 Checkpoint: ${Object.keys(results).length} products saved\n`);
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

  const elapsed = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
  console.log(`\n\n=== Done in ${elapsed}min ===`);
  console.log(`  Products scraped: ${catalog.length}`);
  console.log(`  404 (discontinued): ${notFound}`);
  console.log(`  No data: ${noData}`);
  console.log(`  Errors: ${failed.length - noData}`);
  console.log(`  Output: ${OUTPUT_PATH}`);

  if (failed.length > 0) {
    console.log('\n  Failed:');
    for (const f of failed.slice(0, 20)) {
      console.log(`    ${f.sku}: ${f.reason}`);
    }
    if (failed.length > 20) console.log(`    ... and ${failed.length - 20} more`);
    writeFileSync(join(DATA_DIR, 'milwaukee-failed.json'), JSON.stringify(failed, null, 2));
  }

  // Quality stats
  let totImg = 0, totSpec = 0, totFeat = 0, totCat = 0, noDesc = 0;
  for (const p of catalog) {
    totImg += p.images.length;
    totSpec += Object.keys(p.specifications).length;
    totFeat += p.features.length;
    totCat += p.categories.length;
    if (!p.description) noDesc++;
  }
  console.log('\n  Quality:');
  console.log(`    Avg images: ${(totImg / catalog.length).toFixed(1)}`);
  console.log(`    Avg specs: ${(totSpec / catalog.length).toFixed(1)}`);
  console.log(`    Avg features: ${(totFeat / catalog.length).toFixed(1)}`);
  console.log(`    Avg categories: ${(totCat / catalog.length).toFixed(1)}`);
  console.log(`    Missing desc: ${noDesc}`);
}

main().catch(console.error);
