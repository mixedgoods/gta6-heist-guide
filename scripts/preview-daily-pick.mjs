#!/usr/bin/env node
/**
 * Preview LEONIDA EDITOR'S PICK OF THE DAY for today, tomorrow, or any Chicago date.
 * Usage:
 *   node scripts/preview-daily-pick.mjs
 *   node scripts/preview-daily-pick.mjs 2026-11-27
 *   node scripts/preview-daily-pick.mjs --days 7
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const rotation = require('../public/assets/js/gaming-gear-rotation.js');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const catalog = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'gear-products-master.json'), 'utf8'));

const args = process.argv.slice(2);
let days = 2;
let startDate = new Date();

if (args[0] === '--days' && args[1]) {
  days = Math.max(1, Math.min(60, Number(args[1]) || 7));
} else if (args[0] && /^\d{4}-\d{2}-\d{2}$/.test(args[0])) {
  // Noon UTC safely lands on the intended Chicago calendar date
  startDate = new Date(`${args[0]}T18:00:00Z`);
  days = 2;
}

console.log(`LEONIDA EDITOR'S PICK OF THE DAY — America/Chicago Schedule (${days} day(s))`);
console.log('='.repeat(78));
for (let i = 0; i < days; i++) {
  const probe = new Date(startDate.getTime() + i * 86400000);
  const res = rotation.selectDailyPick(catalog, probe);
  if (!res.ok) {
    console.log(`Day +${i}: NO ELIGIBLE PRODUCT (${res.reason})`);
    continue;
  }
  console.log(
    `${res.calendarDate.isoDate} | Slot #${String(res.slotNumber).padStart(2, '0')}/${res.poolSize} | ${res.product.id.padEnd(24)} | ${res.product.productName}`
  );
}
