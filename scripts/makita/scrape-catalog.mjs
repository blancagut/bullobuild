#!/usr/bin/env node
/**
 * Makita catalog scraper
 * Source: https://www.makitatools.com/products/details/{SKU}
 * Method: curl via child_process (Node fetch fails due to Azure App Gateway SSL)
 * Output: scripts/makita/data/makita-catalog.json
 */

import { execFile } from 'child_process';
import { promisify } from 'util';
import { createWriteStream, existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const execFileAsync = promisify(execFile);
const __dirname = dirname(fileURLToPath(import.meta.url));

const DATA_DIR = join(__dirname, 'data');
const OUTPUT_FILE = join(DATA_DIR, 'makita-catalog.json');
const PROGRESS_FILE = join(DATA_DIR, 'makita-progress.json');

const CONCURRENCY = 6;
const DELAY_MS = 350;     // between requests per worker
const MAX_RETRIES = 2;
const SITEMAP_URL = 'https://www.makitatools.com/sitemap.xml';

if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });

// ── helpers ─────────────────────────────────────────────────────────────────

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function curlGet(url, timeoutSec = 18) {
  const { stdout } = await execFileAsync('curl', [
    '-sL', url,
    '-H', 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    '-H', 'Accept: text/html,application/xhtml+xml,*/*',
    '-H', 'Accept-Language: en-US,en;q=0.9',
    '--max-time', String(timeoutSec),
    '--compressed',
  ], { maxBuffer: 10 * 1024 * 1024 });
  return stdout;
}

function text(html) {
  return html.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'").replace(/&#174;/g, '®').replace(/&#8209;/g, '‑')
    .replace(/&#8220;/g, '"').replace(/&#8221;/g, '"').replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>').replace(/\s+/g, ' ').trim();
}

// ── sitemap ──────────────────────────────────────────────────────────────────

async function fetchProductUrls() {
  console.log('Fetching sitemap…');
  const xml = await curlGet(SITEMAP_URL, 30);
  const urls = [];
  const re = /<loc>\s*(https?:\/\/[^<]+\/products\/details\/([^<\s]+))\s*<\/loc>/gi;
  let m;
  while ((m = re.exec(xml)) !== null) {
    urls.push({ url: m[1].trim(), sku: m[2].trim().toUpperCase() });
  }
  console.log(`Found ${urls.length} product URLs in sitemap`);
  return urls;
}

// ── parsers ──────────────────────────────────────────────────────────────────

function parseMakitaPage(html, sku) {
  const skuLower = sku.toLowerCase();

  // Title / description
  const titleMatch = html.match(/<h3[^>]*class="product-description"[^>]*>([\s\S]*?)<\/h3>/i);
  const title = titleMatch ? text(titleMatch[1]) : '';

  // Meta description as fallback
  const metaDesc = (html.match(/<meta\s+name="description"\s+content="([^"]+)"/) || [])[1] || '';

  // Model number (confirm SKU from page)
  const modelMatch = html.match(/data-model="([^"]+)"/);
  const pageSku = modelMatch ? modelMatch[1].toUpperCase() : sku;

  // Category: extract from meta keywords (2nd keyword after brand name)
  // keywords: "Makita, XFD061, Cordless, 18V, LXT, Drills, Driver-Drills, ..."
  const kwMatch = html.match(/<meta\s+name="keywords"\s+content="([^"]+)"/i);
  const keywords = kwMatch ? kwMatch[1].split(',').map(k => k.trim()) : [];
  // keywords[0]=Makita, [1]=SKU, [2..]=categories/attributes
  const category = keywords.slice(2).join(' / ') || '';

  // Key features (bullet list at top)
  const keyFeaturesSection = html.match(/<ul[^>]*class="key-features"[^>]*>([\s\S]*?)<\/ul>/i);
  const keyFeatures = [];
  if (keyFeaturesSection) {
    const liRe = /<li>([\s\S]*?)<\/li>/gi;
    let m;
    const block = keyFeaturesSection[1];
    while ((m = liRe.exec(block)) !== null) {
      keyFeatures.push(text(m[1]));
    }
  }

  // Full features list
  const featuresSection = html.match(/<ul[^>]*class="ul-features"[^>]*>([\s\S]*?)<\/ul>/i);
  const features = [];
  if (featuresSection) {
    const liRe = /<li>([\s\S]*?)<\/li>/gi;
    let m;
    while ((m = liRe.exec(featuresSection[1])) !== null) {
      const f = text(m[1]);
      if (f) features.push(f);
    }
  }

  // About/description paragraph
  const aboutSection = html.match(/<div[^>]*class="[^"]*detail-about[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
  const aboutText = aboutSection ? text(aboutSection[1]).replace(/\s+/g, ' ').trim() : '';

  // Specs
  const specSection = html.match(/<div[^>]*class="[^"]*detail-specs[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
  const specs = {};
  if (specSection) {
    const liRe = /<li>([\s\S]*?)<\/li>/gi;
    let m;
    while ((m = liRe.exec(specSection[1])) !== null) {
      const nameM = m[1].match(/<span[^>]*class="spec-name"[^>]*>([\s\S]*?)<\/span>/i);
      const valM  = m[1].match(/<span[^>]*class="spec-value"[^>]*>([\s\S]*?)<\/span>/i);
      if (nameM && valM) {
        const k = text(nameM[1]).replace(/ :\s*$/, '').trim();
        const v = text(valM[1]).trim();
        if (k && v) specs[k] = v;
      }
    }
  }

  // Images: Main hero from #js-product-image-shot data-src (1500px)
  const heroMatch = html.match(/id="js-product-image-shot"[^>]*data-src="([^"]+)"/i);
  const images = new Set();
  if (heroMatch) images.add(heroMatch[1].split('?')[0]);

  // Slider images: data-img-large containing SKU in the url path
  const sliderRe = /data-img-large="(https:\/\/cdn\.makitatools\.com\/apps\/cms\/img\/[^"]+)"/gi;
  let sm;
  while ((sm = sliderRe.exec(html)) !== null) {
    const imgUrl = sm[1].split('?')[0];
    // Only include images where the filename contains the SKU (lowercase)
    const filename = imgUrl.split('/').pop().toLowerCase();
    if (filename.includes(skuLower)) {
      images.add(imgUrl);
    }
  }

  // Status: check for DISCONTINUED
  const discontinued = /class="status-label">DISCONTINUED</.test(html);

  return {
    sku: pageSku,
    url: `https://www.makitatools.com/products/details/${pageSku}`,
    brand: 'Makita',
    title: title || text(metaDesc),
    description: aboutText || text(metaDesc),
    price: null,
    category,
    keywords: keywords.slice(2),
    features,
    keyFeatures,
    specs,
    images: [...images],
    discontinued,
    scrapedAt: new Date().toISOString(),
  };
}

// ── worker pool ──────────────────────────────────────────────────────────────

async function scrapeOne(url, sku, retries = MAX_RETRIES) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const html = await curlGet(url);
      if (!html || html.length < 2000) throw new Error(`Too short: ${html.length} bytes`);
      return parseMakitaPage(html, sku);
    } catch (err) {
      if (attempt === retries) return { sku, url, error: err.message };
      await sleep(1500 * (attempt + 1));
    }
  }
}

async function runWorker(queue, results, progress, stats, id) {
  while (queue.length > 0) {
    const item = queue.shift();
    if (!item) break;
    const { url, sku } = item;

    const product = await scrapeOne(url, sku);
    if (product && !product.error) {
      results.push(product);
      stats.ok++;
    } else {
      stats.err++;
      if (product?.error) console.error(`  [W${id}] ERR ${sku}: ${product.error}`);
    }

    progress.done++;
    const pct = ((progress.done / progress.total) * 100).toFixed(1);
    process.stdout.write(
      `\r[${Math.floor(process.uptime())}s] ${progress.done}/${progress.total} (${pct}%) — ok:${stats.ok} err:${stats.err}   `
    );

    // Checkpoint every 200 products
    if (progress.done % 200 === 0) {
      writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2));
      writeFileSync(PROGRESS_FILE, JSON.stringify({ done: progress.done, total: progress.total }));
    }

    await sleep(DELAY_MS);
  }
}

// ── main ─────────────────────────────────────────────────────────────────────

async function main() {
  const items = await fetchProductUrls();
  if (items.length === 0) { console.error('No product URLs found'); process.exit(1); }

  // Resume support
  let results = [];
  const doneSkus = new Set();
  if (existsSync(OUTPUT_FILE)) {
    try {
      results = JSON.parse(readFileSync(OUTPUT_FILE, 'utf8'));
      results.forEach(p => doneSkus.add(p.sku));
      console.log(`Resuming: ${doneSkus.size} already scraped`);
    } catch { results = []; }
  }

  const queue = items.filter(i => !doneSkus.has(i.sku));
  const progress = { done: doneSkus.size, total: items.length };
  const stats = { ok: 0, err: 0 };

  if (queue.length === 0) {
    console.log('All products already scraped.');
    return;
  }

  console.log(`Scraping ${queue.length} products with ${CONCURRENCY} workers…`);

  const workers = Array.from({ length: CONCURRENCY }, (_, i) =>
    runWorker(queue, results, progress, stats, i + 1)
  );
  await Promise.all(workers);

  process.stdout.write('\n');
  console.log(`Done. ok:${stats.ok} err:${stats.err}`);

  writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2));
  console.log(`Saved ${results.length} products to ${OUTPUT_FILE}`);
}

main().catch(err => { console.error(err); process.exit(1); });
