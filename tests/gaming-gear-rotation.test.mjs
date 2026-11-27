import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const rotation = require('../public/assets/js/gaming-gear-rotation.js');

const ROOT = path.resolve(import.meta.dirname, '..');
const MASTER_PATH = path.join(ROOT, 'data', 'gear-products-master.json');
const PUBLIC_MASTER_PATH = path.join(ROOT, 'public', 'data', 'gear-products-master.json');
const GEAR_HTML_PATH = path.join(ROOT, 'public', 'gaming-gear', 'index.html');
const ROTATION_JS_PATH = path.join(ROOT, 'public', 'assets', 'js', 'gaming-gear-rotation.js');
const ENGINE_JS_PATH = path.join(ROOT, 'public', 'assets', 'js', 'gaming-gear-engine.js');

const MASTER_RAW = fs.readFileSync(MASTER_PATH, 'utf8');
const MASTER_CATALOG = JSON.parse(MASTER_RAW);
const GEAR_HTML = fs.readFileSync(GEAR_HTML_PATH, 'utf8');

function cloneCatalog() {
  return JSON.parse(MASTER_RAW);
}

function createMemoryStorage() {
  const map = new Map();
  return {
    getItem(k) { return map.has(k) ? map.get(k) : null; },
    setItem(k, v) { map.set(k, String(v)); },
    removeItem(k) { map.delete(k); },
    clear() { map.clear(); },
  };
}

test('GG-01: Single source of truth parity, real-photos-only catalog & verified 6-collection LEONIDA DROP catalog', () => {
  const publicRaw = fs.readFileSync(PUBLIC_MASTER_PATH, 'utf8');
  assert.equal(publicRaw, MASTER_RAW, 'public/data/gear-products-master.json must match data/gear-products-master.json byte-for-byte');

  const approved = rotation.getApprovedCatalogProducts(MASTER_CATALOG);
  const daily = rotation.getEligibleDailyProducts(MASTER_CATALOG);
  const dropCollections = rotation.getValidDropCollections(MASTER_CATALOG);

  assert.equal(MASTER_CATALOG.products.length, 66, `Expected 66 audited product records, got ${MASTER_CATALOG.products.length}`);
  assert.equal(approved.length, 50, `Expected 50 approved active products, got ${approved.length}`);
  assert.ok(daily.length >= 8, `Expected >=8 verified real-photo daily-eligible picks, got ${daily.length}`);
  assert.equal(dropCollections.length, 6, `Expected 6 verified 3-product LEONIDA DROP collections, got ${dropCollections.length}`);

  // Zero generated / illustrative product images anywhere in the master catalog
  for (const p of MASTER_CATALOG.products) {
    assert.notEqual(p.mediaType, 'illustration', `Forbidden illustration mediaType on ${p.id}`);
    assert.ok(!String(p.imageSource || '').includes('gear-illustrations'), `Forbidden illustration asset on ${p.id}: ${p.imageSource}`);
    assert.ok(!/\.svg(?:$|\?)/i.test(String(p.imageSource || '')), `Forbidden SVG product image on ${p.id}: ${p.imageSource}`);
  }

  // Every active photo product points to an existing verified real photo in public/assets/gear-photos/;
  // every active text-only product has mediaType 'none' and imageSource null.
  let photoCount = 0;
  let textOnlyCount = 0;
  for (const p of approved) {
    if (p.mediaType === 'photo') {
      photoCount++;
      assert.match(p.imageSource, /^\/assets\/gear-photos\/[a-z0-9._-]+\.(?:webp|jpg|jpeg|png)$/i);
      const imgDisk = path.join(ROOT, 'public', p.imageSource.replace(/^\/+/, ''));
      assert.ok(fs.existsSync(imgDisk), `Missing verified real photo asset for ${p.id}: ${p.imageSource}`);
    } else {
      textOnlyCount++;
      assert.equal(p.mediaType, 'none');
      assert.equal(p.imageSource, null);
    }
  }
  assert.equal(photoCount, 8, `Expected 8 preserved active real-photo catalog cards, got ${photoCount}`);
  assert.equal(textOnlyCount, 42, `Expected 42 active text-only catalog cards, got ${textOnlyCount}`);

  // Every LEONIDA DROP collection has exactly 3 distinct valid products (18 unique across all 6 collections)
  const globalDropProductIds = new Set();
  const globalDropAsins = new Set();
  for (const col of dropCollections) {
    assert.equal(col.items.length, 3, `Collection ${col.id} must contain exactly 3 products`);
    assert.equal(col.items[0].role, 'main');
    assert.equal(col.items[0].position, 1);
    assert.equal(col.items[1].role, 'supporting');
    assert.equal(col.items[1].position, 2);
    assert.equal(col.items[2].role, 'supporting');
    assert.equal(col.items[2].position, 3);
    for (const item of col.items) {
      assert.ok(!globalDropProductIds.has(item.product.id), `Duplicate product across drops: ${item.product.id}`);
      assert.ok(!globalDropAsins.has(item.product.asin), `Duplicate ASIN across drops: ${item.product.asin}`);
      globalDropProductIds.add(item.product.id);
      globalDropAsins.add(item.product.asin);
      // Currently zero unauthorized/non-Amazon images may pass the Amazon-Only drop image guard
      assert.equal(rotation.isAuthorizedAmazonDropImage(item.product), false);
    }
  }
  assert.equal(globalDropProductIds.size, 18);
});

test('GG-02: Same America/Chicago date always produces the exact same daily helper product', () => {
  const morning = rotation.selectDailyPick(MASTER_CATALOG, new Date('2026-11-26T14:00:00Z'));
  const afternoon = rotation.selectDailyPick(MASTER_CATALOG, new Date('2026-11-26T21:30:00Z'));
  const lateNight = rotation.selectDailyPick(MASTER_CATALOG, new Date('2026-11-27T05:59:59Z'));

  assert.equal(morning.ok, true);
  assert.equal(morning.calendarDate.isoDate, '2026-11-26');
  assert.equal(afternoon.calendarDate.isoDate, '2026-11-26');
  assert.equal(lateNight.calendarDate.isoDate, '2026-11-26');
  assert.equal(morning.product.id, afternoon.product.id);
  assert.equal(morning.product.id, lateNight.product.id);
});

test('GG-03: Consecutive days rotate cleanly in legacy daily helper without early repeats', () => {
  const eligible = rotation.getEligibleDailyProducts(MASTER_CATALOG);
  const N = eligible.length;
  const seen = new Set();
  const baseMs = Date.parse('2026-11-26T18:00:00Z');

  const firstCycleIds = [];
  for (let d = 0; d < N; d++) {
    const pick = rotation.selectDailyPick(MASTER_CATALOG, new Date(baseMs + d * 86400000));
    assert.equal(pick.ok, true);
    assert.ok(!seen.has(pick.product.id));
    seen.add(pick.product.id);
    firstCycleIds.push(pick.product.id);
  }
  assert.equal(seen.size, N);
  const wrapPick = rotation.selectDailyPick(MASTER_CATALOG, new Date(baseMs + N * 86400000));
  assert.equal(wrapPick.product.id, firstCycleIds[0]);
});

test('GG-04: Disabled & rejected products (all 16 inactive records) never leak into catalog or LEONIDA DROP', () => {
  const cat = cloneCatalog();
  // Disabling a product inside collection 1 disqualifies that collection cleanly
  const timesGate = cat.products.find((p) => p.id === 'divoom-times-gate');
  timesGate.active = false;
  const validAfterDisable = rotation.getValidDropCollections(cat);
  assert.ok(!validAfterDisable.some((c) => c.id === 'leonida-control-room'), 'Collection with disabled product must be skipped');
  assert.equal(validAfterDisable.length, 5);

  const masterApproved = rotation.getApprovedCatalogProducts(MASTER_CATALOG);
  const masterDrops = rotation.getValidDropCollections(MASTER_CATALOG);
  const dropProductIds = new Set(masterDrops.flatMap((c) => c.items.map((it) => it.product.id)));
  for (const rejectedId of [
    'elgato-stream-deck-plus-rejected',
    '8bitdo-sn30-pro-rejected',
    'tidbyt-gen2-rejected',
    'keychron-c3-pro-pending',
    'divoom-ditoo-pro-pending',
    'elgato-hd60x-oos-rejected',
    'samsung-990-pro-2tb-mismatch-rejected',
    'divoom-ditoo-pro-b0d46r46wy-rejected',
    'divoom-times-gate-pink-b0d44qwspn-rejected',
    'maono-pd100xs-mismatch-rejected',
    'sharge-retro-67w-caution-rejected',
    'haute42-t16-pro-caution-rejected',
    'gravastar-mars-pro-caution-rejected',
    'bitopbi-stackable-lamp-caution-rejected',
    '8bitdo-arcade-stick-switch-backorder-rejected',
    'razer-tartarus-v2-caution-rejected',
  ]) {
    assert.ok(!masterApproved.some((p) => p.id === rejectedId), `Rejected item ${rejectedId} leaked into catalog`);
    assert.ok(!dropProductIds.has(rejectedId), `Rejected item ${rejectedId} leaked into LEONIDA DROP`);
  }
});

test('GG-05: Broken, cloaked, non-direct, or ASIN-mismatched affiliate links are rejected', () => {
  const validSample = MASTER_CATALOG.products.find((p) => p.active && p.asin);
  const badUrls = [
    'http://www.amazon.com/dp/' + validSample.asin + '?tag=gta6heistguid-20',
    'https://amzn.to/3fakeShort',
    'https://evil.example.com/dp/' + validSample.asin + '?tag=gta6heistguid-20',
    'https://www.amazon.com/s?k=gaming+gear&tag=gta6heistguid-20',
    'https://www.amazon.com/dp/B000000000?tag=gta6heistguid-20',
    'not-a-valid-url',
  ];

  for (const url of badUrls) {
    const p = { ...validSample, amazonSpecialLink: url };
    assert.equal(rotation.validateProduct(p, { requireDaily: false }).valid, false, `Expected invalid URL rejected: ${url}`);
  }
});

test('GG-06: Missing or wrong Amazon Associates tracking IDs are rejected', () => {
  const validSample = MASTER_CATALOG.products.find((p) => p.active && p.asin);
  assert.equal(rotation.validateProduct({ ...validSample, amazonSpecialLink: `https://www.amazon.com/dp/${validSample.asin}` }).valid, false);
  assert.equal(rotation.validateProduct({ ...validSample, amazonSpecialLink: `https://www.amazon.com/dp/${validSample.asin}?tag=someoneelse-20` }).valid, false);
  assert.equal(rotation.validateProduct({ ...validSample, associatesTag: 'wrong-20' }).valid, false);
});

test('GG-07: Missing data, duplicate collection items, and non-Amazon drop images are rejected', () => {
  assert.equal(rotation.selectDropCollection(null, createMemoryStorage()).ok, false);
  assert.equal(rotation.selectDropCollection({ products: [], leonidaDropCollections: [] }, createMemoryStorage()).ok, false);

  // Duplicate product inside a collection must be rejected
  const cat = cloneCatalog();
  const badDupCol = JSON.parse(JSON.stringify(cat.leonidaDropCollections[0]));
  badDupCol.items[2].productId = badDupCol.items[0].productId;
  assert.equal(rotation.validateDropCollection(badDupCol, cat).valid, false);

  // Wrong number of items (2 instead of 3) must be rejected
  const badShortCol = JSON.parse(JSON.stringify(cat.leonidaDropCollections[0]));
  badShortCol.items.pop();
  assert.equal(rotation.validateDropCollection(badShortCol, cat).valid, false);

  // Strict Amazon-Only image guard for LEONIDA DROP
  const nowMs = Date.parse('2026-11-26T20:00:00Z');
  assert.equal(rotation.isAuthorizedAmazonDropImage({ mediaType: 'photo', imageSource: '/assets/gear-photos/koss-porta-pro.webp' }, nowMs), false);
  assert.equal(rotation.isAuthorizedAmazonDropImage({
    amazonDropImage: {
      authorized: true,
      mobileApproved: true,
      source: 'wikimedia-commons',
      url: 'https://upload.wikimedia.org/example.jpg',
      fetchedAt: '2026-11-26T19:00:00Z',
    },
  }, nowMs), false);
  assert.equal(rotation.isAuthorizedAmazonDropImage({
    amazonDropImage: {
      authorized: true,
      mobileApproved: false, // Missing IP License Sec. 2(d) mobile approval
      source: 'amazon-creators-api',
      url: 'https://m.media-amazon.com/images/I/example.jpg',
      fetchedAt: '2026-11-26T19:00:00Z',
    },
  }, nowMs), false);
  assert.equal(rotation.isAuthorizedAmazonDropImage({
    amazonDropImage: {
      authorized: true,
      mobileApproved: true,
      source: 'amazon-creators-api',
      url: 'https://m.media-amazon.com/images/I/example.jpg',
      fetchedAt: '2026-11-24T18:00:00Z', // Stale > 24h (IP License Sec. 2(h))
    },
  }, nowMs), false);
  assert.equal(rotation.isAuthorizedAmazonDropImage({
    amazonDropImage: {
      authorized: true,
      mobileApproved: true,
      source: 'amazon-creators-api',
      url: 'https://m.media-amazon.com/images/I/71authorized.jpg',
      fetchedAt: '2026-11-26T19:30:00Z',
    },
  }, nowMs), true);
});

test('GG-08: LEONIDA DROP refresh-driven rotation cycles through all 6 collections with zero repeats before cycle completion', () => {
  const storage = createMemoryStorage();
  const seen = new Set();
  const cycle1Order = [];

  for (let visit = 0; visit < 6; visit++) {
    const res = rotation.selectDropCollection(MASTER_CATALOG, storage, { advanceOnLoad: true });
    assert.equal(res.ok, true);
    assert.equal(res.collection.items.length, 3);
    assert.equal(res.cycle, 1);
    assert.equal(res.slotNumber, visit + 1);
    assert.ok(!seen.has(res.collection.id), `Collection ${res.collection.id} repeated early on visit ${visit + 1}`);
    seen.add(res.collection.id);
    cycle1Order.push(res.collection.id);
  }
  assert.equal(seen.size, 6, 'All 6 themed collections must appear once per cycle');

  // 7th refresh completes Cycle 1 and wraps cleanly into Cycle 2
  const wrapRes = rotation.selectDropCollection(MASTER_CATALOG, storage, { advanceOnLoad: true });
  assert.equal(wrapRes.ok, true);
  assert.equal(wrapRes.cycle, 2);
  assert.equal(wrapRes.slotNumber, 1);
  assert.equal(wrapRes.collection.id, cycle1Order[0]);
});

test('GG-09: SHOW ANOTHER DROP advances cleanly without repeating until cycle completes and reconciles disabled collections', () => {
  const storage = createMemoryStorage();
  const initial = rotation.selectDropCollection(MASTER_CATALOG, storage, { advanceOnLoad: true });
  assert.equal(initial.ok, true);
  assert.equal(initial.collection.id, 'leonida-control-room');

  const seen = [initial.collection.id];
  for (let click = 0; click < 5; click++) {
    const next = rotation.advanceDropCollection(MASTER_CATALOG, storage);
    assert.equal(next.ok, true);
    assert.equal(next.cycle, 1);
    assert.ok(!seen.includes(next.collection.id), `SHOW ANOTHER DROP repeated ${next.collection.id} before cycle finished`);
    seen.push(next.collection.id);
  }
  assert.equal(seen.length, 6);

  // Next click wraps to Cycle 2 cleanly
  const wrap = rotation.advanceDropCollection(MASTER_CATALOG, storage);
  assert.equal(wrap.cycle, 2);
  assert.equal(wrap.collection.id, seen[0]);

  // Stability check: executable code in rotation.js and engine.js never uses timers or Math.random()
  const stripComments = (src) => src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
  const rotSrc = stripComments(fs.readFileSync(ROTATION_JS_PATH, 'utf8'));
  const engSrc = stripComments(fs.readFileSync(ENGINE_JS_PATH, 'utf8'));
  assert.doesNotMatch(rotSrc, /\b(?:Math\.random|setInterval|setTimeout)\b/);
  assert.doesNotMatch(engSrc, /\b(?:Math\.random|setInterval|setTimeout)\b/);
});

test('GG-10: Daylight Saving Time spring-forward and fall-back preserved on daily helper', () => {
  const sfDay0End = rotation.selectDailyPick(MASTER_CATALOG, new Date('2027-03-14T05:59:59Z'));
  const sfDay1Start = rotation.selectDailyPick(MASTER_CATALOG, new Date('2027-03-14T06:00:00Z'));
  const sfDay1End = rotation.selectDailyPick(MASTER_CATALOG, new Date('2027-03-15T04:59:59Z'));
  const sfDay2Start = rotation.selectDailyPick(MASTER_CATALOG, new Date('2027-03-15T05:00:00Z'));

  assert.equal(sfDay1Start.product.id, sfDay1End.product.id);
  assert.equal((sfDay0End.index + 1) % sfDay0End.poolSize, sfDay1Start.index);
  assert.equal((sfDay1End.index + 1) % sfDay1End.poolSize, sfDay2Start.index);
});

test('GG-11 & GG-12: Zero stale prices, stock claims, or Amazon star ratings/reviews; required LEONIDA DROP copy & disclosure present', () => {
  const sample = MASTER_CATALOG.products.find((p) => p.active);
  assert.equal(rotation.validateProduct({ ...sample, shortDescription: 'Great deal for $49.99 today' }).valid, false);
  assert.equal(rotation.validateProduct({ ...sample, shortDescription: 'Rated 4.7 out of 5 stars on Amazon' }).valid, false);
  assert.equal(rotation.validateProduct({ ...sample, shortDescription: 'Only 3 left in stock' }).valid, false);

  const htmlBody = GEAR_HTML.replace(/<script[\s\S]*?<\/script>/gi, '');
  assert.doesNotMatch(htmlBody, /\$\d+(?:\.\d{2})?/, 'Gaming Gear HTML must not hardcode static product prices');
  assert.doesNotMatch(htmlBody, /AggregateRating/i, 'Must not include AggregateRating schema');
  assert.doesNotMatch(htmlBody, /\b\d(?:\.\d)?\s*(?:\/\s*5|out of 5)\s*stars?\b/i, 'Must not render Amazon star ratings');
  assert.match(htmlBody, /As an Amazon Associate I earn from qualifying purchases\./, 'Required Amazon Associate statement must be present');
  assert.match(htmlBody, /LEONIDA DROP/, 'LEONIDA DROP heading must be present');
  assert.match(htmlBody, /Three unusual gaming discoveries\. A fresh drop every visit\./, 'Required LEONIDA DROP subtitle must be present');
  assert.match(htmlBody, /SHOW ANOTHER DROP/, 'Required SHOW ANOTHER DROP button label must be present');

  // Static fallback inside #leonidaDropMount must contain ZERO non-Amazon <img> or SVG product images
  const dropSectionMatch = htmlBody.match(/<section id="leonida-drop"[\s\S]*?<\/section>/);
  assert.ok(dropSectionMatch, 'Expected #leonida-drop section in Gaming Gear HTML');
  assert.doesNotMatch(dropSectionMatch[0], /<img\b/i, 'Static LEONIDA DROP fallback must not embed unauthorized images');
  assert.doesNotMatch(dropSectionMatch[0], /<svg\b/i, 'Static LEONIDA DROP fallback must not embed SVG product illustrations');
});

test('GG-13: Direct tagged Special Links, GA4 affiliate_click with collection_id & product_position, AdSense & homepage pause preserved', () => {
  const approved = rotation.getApprovedCatalogProducts(MASTER_CATALOG);
  for (const p of approved) {
    const check = rotation.validateAmazonSpecialLink(p.amazonSpecialLink, p.asin, 'gta6heistguid-20');
    assert.equal(check.valid, true, `Invalid Special Link on ${p.id}: ${check.reasons.join(', ')}`);
    assert.equal(check.host, 'www.amazon.com');
    assert.equal(check.tag, 'gta6heistguid-20');
  }

  // AdSense script preserved on /gaming-gear/
  assert.match(GEAR_HTML, /ca-pub-9556158063903839/, 'AdSense publisher script must remain untouched');

  // Phase 35.1C Amazon Placement Pause remains false in site-config.js
  const siteConfigSrc = fs.readFileSync(path.join(ROOT, 'public', 'site-config.js'), 'utf8');
  const affiliatesSrc = fs.readFileSync(path.join(ROOT, 'public', 'js', 'affiliates.js'), 'utf8');
  assert.match(siteConfigSrc, /enableAmazonProductPlacements:\s*false/, 'Phase 35.1C homepage Amazon Placement Pause must remain false');

  // Verify GA4 affiliate_click parameters on LEONIDA DROP click
  const docListeners = new Map();
  const sandbox = {
    console,
    URL,
    URLSearchParams,
    Date,
    Math,
    JSON,
    Object,
    Array,
    String,
    Number,
    Boolean,
    RegExp,
    Blob: class { constructor(p) { this._text = p.join(''); } },
    document: {
      readyState: 'complete',
      referrer: '',
      head: { appendChild() {} },
      body: { classList: { add() {}, remove() {} }, appendChild() {} },
      addEventListener(t, fn) {
        if (!docListeners.has(t)) docListeners.set(t, []);
        docListeners.get(t).push(fn);
      },
      querySelector() { return null; },
      querySelectorAll() { return []; },
      getElementById() { return null; },
      createElement() { return { setAttribute() {}, style: {}, classList: { add() {}, remove() {} } }; },
    },
    localStorage: { getItem() { return null; }, setItem() {}, removeItem() {} },
    navigator: { userAgent: 'Test', sendBeacon: () => true },
    location: { pathname: '/gaming-gear/', origin: 'https://www.gta6heistguide.com', href: 'https://www.gta6heistguide.com/gaming-gear/', search: '', hash: '' },
    addEventListener() {},
    matchMedia: () => ({ matches: false }),
    setTimeout(fn) { fn(); return 1; },
    clearTimeout() {},
    setInterval() { return 0; },
  };
  sandbox.window = sandbox;
  sandbox.self = sandbox;
  sandbox.globalThis = sandbox;
  const ctx = vm.createContext(sandbox);
  vm.runInContext(siteConfigSrc, ctx);
  vm.runInContext(affiliatesSrc, ctx);

  const mockDropCta = {
    href: 'https://www.amazon.com/dp/B0CYSQWYZP?tag=gta6heistguid-20',
    getAttribute(k) {
      return ({
        href: 'https://www.amazon.com/dp/B0CYSQWYZP?tag=gta6heistguid-20',
        'data-aff-partner': 'amazon',
        'data-aff-product': '8bitdo-retro-keyboard-c64',
        'data-aff-asin': 'B0CYSQWYZP',
        'data-aff-category': 'Funny & Unusual',
        'data-aff-placement': 'leonida_drop_main',
        'data-aff-collection': 'retro-gaming-lab',
        'data-aff-position': '1',
        'data-aff-daily-slot': 'drop_retro-gaming-lab',
        'data-aff-dest-host': 'www.amazon.com',
        'data-aff-area': 'cta',
      })[k] || null;
    },
    closest() { return this; },
    matches() { return false; },
  };

  for (const fn of docListeners.get('click') || []) fn({ target: mockDropCta });

  const affEvents = ctx.GTA6Track.getEvents().filter((e) => e.event === 'affiliate_click');
  assert.equal(affEvents.length, 1);
  assert.equal(affEvents[0].params.product_id, '8bitdo-retro-keyboard-c64');
  assert.equal(affEvents[0].params.collection_id, 'retro-gaming-lab');
  assert.equal(affEvents[0].params.product_position, 1);
  assert.equal(affEvents[0].params.feature_placement, 'leonida_drop_main');
  assert.equal(affEvents[0].params.destination_host, 'www.amazon.com');
  assert.equal(affEvents[0].params.page_path, '/gaming-gear/');
  assert.equal(affEvents[0].params.source_page, '/gaming-gear/');
  assert.equal('page_location' in affEvents[0].params, false, 'Must respect P36.3-PII1 custom event sanitizer');
});
