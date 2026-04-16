#!/usr/bin/env node
/**
 * Test extraction of Milwaukee product data with single-pass unescaping
 */

const url = 'https://www.milwaukeetool.com/products/details/m18-fuel-1-2-hammer-drilldriver-kit/2904-22';

async function main() {
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const html = await res.text();

  // Collect flight chunks
  const chunks = [];
  const re = /self\.__next_f\.push\(\[1,"(.*?)"\]\)/gs;
  let m;
  while ((m = re.exec(html)) !== null) {
    chunks.push(m[1]);
  }
  console.log('Flight chunks:', chunks.length);

  // Find productData in the last (biggest) chunk
  const bigChunk = chunks[chunks.length - 1];
  const pdIdx = bigChunk.indexOf('productData');
  if (pdIdx === -1) {
    console.log('No productData found');
    return;
  }
  const objStart = bigChunk.indexOf('{', pdIdx);

  // Balanced brace extraction
  let depth = 0, i = objStart;
  while (i < bigChunk.length) {
    const c = bigChunk[i];
    if (c === '\\' && i + 1 < bigChunk.length) { i += 2; continue; }
    if (c === '{') depth++;
    else if (c === '}') depth--;
    if (depth === 0) break;
    i++;
  }
  const rawPd = bigChunk.substring(objStart, i + 1);
  console.log('Raw productData length:', rawPd.length);

  // Single-pass unescape
  let out = '';
  for (let j = 0; j < rawPd.length; j++) {
    if (rawPd[j] === '\\' && j + 1 < rawPd.length) {
      const next = rawPd[j + 1];
      switch (next) {
        case '"': out += '"'; j++; break;
        case '\\': out += '\\'; j++; break;
        case 'n': out += '\n'; j++; break;
        case 't': out += '\t'; j++; break;
        case '/': out += '/'; j++; break;
        default: out += '\\' + next; j++; break;
      }
    } else {
      out += rawPd[j];
    }
  }

  const data = JSON.parse(out);
  console.log('\nALL KEYS:', Object.keys(data));

  for (const [k, v] of Object.entries(data)) {
    const t = Array.isArray(v) ? `array[${v.length}]` : typeof v;
    let preview;
    if (typeof v === 'string') preview = v.startsWith('$') ? v : v.slice(0, 60);
    else if (typeof v === 'object' && v !== null) preview = JSON.stringify(v).slice(0, 80);
    else preview = String(v);
    console.log(`  ${k} (${t}): ${preview}`);
  }

  // Count $-refs
  let refs = 0;
  function countRefs(obj) {
    if (typeof obj === 'string' && obj.startsWith('$')) refs++;
    if (Array.isArray(obj)) obj.forEach(countRefs);
    if (typeof obj === 'object' && obj !== null && !Array.isArray(obj)) {
      Object.values(obj).forEach(countRefs);
    }
  }
  countRefs(data);
  console.log(`\nTotal $-ref values: ${refs}`);

  // Show overview resolution
  console.log('\n=== OVERVIEW ===');
  const overview = data.overview;
  if (typeof overview === 'string' && overview.startsWith('$')) {
    console.log('Overview is a $-ref:', overview);
    // Resolve it from the RSC lines
    const allText = chunks.join('');
    const lines = allText.split('\\n');
    const refId = overview.slice(1);
    for (const line of lines) {
      const lm = line.match(/^([0-9a-f]+):(.*)/s);
      if (lm && lm[1] === refId) {
        console.log('Resolved ref:', lm[2].slice(0, 200));
        break;
      }
    }
  } else {
    console.log('Overview direct:', String(overview).slice(0, 200));
  }

  // Show specs
  console.log('\n=== SPECS (first 5) ===');
  const specs = data.specs;
  if (Array.isArray(specs)) {
    for (const s of specs.slice(0, 5)) {
      if (typeof s === 'string' && s.startsWith('$')) {
        console.log('  $-ref:', s);
      } else {
        console.log(`  ${s.key}: ${s.name} = ${s.value}`);
      }
    }
    console.log(`  ... total: ${specs.length}`);
  }

  // Show categories
  console.log('\n=== MARKETING CATEGORIES ===');
  const mc = data.marketingCategories;
  if (typeof mc === 'object' && mc !== null) {
    for (const [k, v] of Object.entries(mc)) {
      if (typeof v === 'string' && v.startsWith('$')) {
        console.log(`  ${k}: $-ref ${v}`);
      } else if (typeof v === 'object') {
        console.log(`  ${k}: ${v.display} (order: ${v.order})`);
      }
    }
  }

  // Show includes
  console.log('\n=== INCLUDES ===');
  const inc = data.includes;
  if (Array.isArray(inc)) {
    for (const item of inc) {
      if (typeof item === 'string' && item.startsWith('$')) {
        console.log(`  $-ref: ${item}`);
      } else {
        console.log(`  ${item.sku}: ${item.title} (qty: ${item.quantity})`);
      }
    }
  }

  // Show features
  console.log('\n=== FEATURES (first 5) ===');
  const feats = data.features;
  if (Array.isArray(feats)) {
    for (const f of feats.slice(0, 5)) {
      if (typeof f === 'string' && f.startsWith('$')) {
        console.log('  $-ref:', f);
      } else {
        console.log('  ' + String(f).slice(0, 80));
      }
    }
    console.log(`  ... total: ${feats.length}`);
  }

  // Show replacement products
  console.log('\n=== REPLACEMENT PRODUCTS ===');
  console.log(JSON.stringify(data.replacementProducts));
}

main().catch(console.error);
