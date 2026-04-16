#!/usr/bin/env node
/**
 * extract-urls.mjs — Extract Milwaukee product URLs from sitemap
 *
 * Downloads the sitemap XML from milwaukeetool.com and extracts
 * all product detail page URLs.
 *
 * Output: data/milwaukee-product-urls.txt
 *
 * Usage: node scripts/milwaukee/extract-urls.mjs
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, 'data');
const OUTPUT = join(DATA_DIR, 'milwaukee-product-urls.txt');
const SITEMAP_URL = 'https://www.milwaukeetool.com/sitemap.xml';

async function main() {
  console.log('=== Milwaukee Sitemap URL Extractor ===\n');
  mkdirSync(DATA_DIR, { recursive: true });

  console.log(`Fetching sitemap: ${SITEMAP_URL}`);
  const res = await fetch(SITEMAP_URL, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    },
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const xml = await res.text();
  console.log(`Sitemap size: ${(xml.length / 1024).toFixed(0)} KB`);

  // Extract all <loc> URLs that match /products/details/ pattern
  const locRe = /<loc>(https:\/\/www\.milwaukeetool\.com\/products\/details\/[^<]+)<\/loc>/gi;
  const urls = new Set();
  let match;
  while ((match = locRe.exec(xml)) !== null) {
    urls.add(match[1]);
  }

  const sorted = [...urls].sort();
  writeFileSync(OUTPUT, sorted.join('\n') + '\n');

  console.log(`\nExtracted ${sorted.length} product URLs`);
  console.log(`Output: ${OUTPUT}`);
  console.log(`\nFirst 5:`);
  for (const u of sorted.slice(0, 5)) console.log(`  ${u}`);
  console.log(`Last 5:`);
  for (const u of sorted.slice(-5)) console.log(`  ${u}`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
