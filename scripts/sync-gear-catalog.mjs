#!/usr/bin/env node
/**
 * Sync & validate data/gear-products-master.json -> public/data/gear-products-master.json
 * Ensures the deployed static copy stays byte-for-byte identical to the single source of truth.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const rotation = require('../public/assets/js/gaming-gear-rotation.js');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'data', 'gear-products-master.json');
const DST = path.join(ROOT, 'public', 'data', 'gear-products-master.json');

const raw = fs.readFileSync(SRC, 'utf8');
const catalog = JSON.parse(raw);

const approved = rotation.getApprovedCatalogProducts(catalog);
const daily = rotation.getEligibleDailyProducts(catalog);
const inactive = catalog.products.filter((p) => p.active !== true);

// Fail fast if any active product fails strict validation
const activeFailures = [];
for (const p of catalog.products) {
  if (p.active === true) {
    const res = rotation.validateProduct(p, {
      expectedTag: catalog.associatesTag,
      requireDaily: Boolean(p.dailyEligible),
    });
    if (!res.valid) {
      activeFailures.push({ id: p.id, reasons: res.reasons });
    }
    if (p.mediaType === 'photo') {
      if (p.imageSource && p.imageSource.startsWith('/')) {
        const imgPath = path.join(ROOT, 'public', p.imageSource.replace(/^\/+/, ''));
        if (!fs.existsSync(imgPath)) {
          activeFailures.push({ id: p.id, reasons: [`missing_local_image:${p.imageSource}`] });
        }
      }
    }
  }
}

if (activeFailures.length > 0) {
  console.error('ERROR: Active catalog validation failed:');
  for (const f of activeFailures) {
    console.error(`  - ${f.id}: ${f.reasons.join(', ')}`);
  }
  process.exit(1);
}

fs.mkdirSync(path.dirname(DST), { recursive: true });
fs.writeFileSync(DST, raw, 'utf8');

console.log(`Synced ${SRC} -> ${DST}`);
console.log(`Total entries: ${catalog.products.length} | Active approved: ${approved.length} | Daily eligible: ${daily.length} | Inactive/rejected: ${inactive.length}`);
