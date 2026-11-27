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

const MASTER_RAW = fs.readFileSync(MASTER_PATH, 'utf8');
const MASTER_CATALOG = JSON.parse(MASTER_RAW);
const GEAR_HTML = fs.readFileSync(GEAR_HTML_PATH, 'utf8');

function cloneCatalog() {
  return JSON.parse(MASTER_RAW);
}

test('GG-01: Single source of truth parity, real-photos-only enforcement & verified catalog/daily thresholds', () => {
  const publicRaw = fs.readFileSync(PUBLIC_MASTER_PATH, 'utf8');
  assert.equal(publicRaw, MASTER_RAW, 'public/data/gear-products-master.json must match data/gear-products-master.json byte-for-byte');

  const approved = rotation.getApprovedCatalogProducts(MASTER_CATALOG);
  const daily = rotation.getEligibleDailyProducts(MASTER_CATALOG);
  assert.equal(MASTER_CATALOG.products.length, 42, `Expected 42 audited product records, got ${MASTER_CATALOG.products.length}`);
  assert.ok(approved.length >= 25, `Expected >=25 approved active products, got ${approved.length}`);
  assert.ok(daily.length >= 8, `Expected >=8 verified real-photo daily-eligible picks, got ${daily.length}`);

  // Zero generated / illustrative product images anywhere in the master catalog
  for (const p of MASTER_CATALOG.products) {
    assert.notEqual(p.mediaType, 'illustration', `Forbidden illustration mediaType on ${p.id}`);
    assert.ok(!String(p.imageSource || '').includes('gear-illustrations'), `Forbidden illustration asset on ${p.id}: ${p.imageSource}`);
    assert.ok(!/\.svg(?:$|\?)/i.test(String(p.imageSource || '')), `Forbidden SVG product image on ${p.id}: ${p.imageSource}`);
  }

  // Every active photo product must point to an existing real photo in public/assets/gear-photos/;
  // every active text-only product must have mediaType 'none' and imageSource null.
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
  assert.equal(photoCount, 8, `Expected 8 active products with verified actual product photos, got ${photoCount}`);
  assert.equal(textOnlyCount, 27, `Expected 27 active text-only product cards, got ${textOnlyCount}`);

  // Every daily-eligible product MUST have a verified real product photograph
  for (const dp of daily) {
    assert.equal(dp.mediaType, 'photo', `Daily pick ${dp.id} must have mediaType === 'photo'`);
    const imgDisk = path.join(ROOT, 'public', dp.imageSource.replace(/^\/+/, ''));
    assert.ok(fs.existsSync(imgDisk), `Missing verified daily pick photo on disk for ${dp.id}`);
  }
});

test('GG-02: Same America/Chicago date always produces the exact same product (deterministic)', () => {
  const morning = rotation.selectDailyPick(MASTER_CATALOG, new Date('2026-11-26T14:00:00Z')); // 8:00 AM CST
  const afternoon = rotation.selectDailyPick(MASTER_CATALOG, new Date('2026-11-26T21:30:00Z')); // 3:30 PM CST
  const lateNight = rotation.selectDailyPick(MASTER_CATALOG, new Date('2026-11-27T05:59:59Z')); // 11:59:59 PM CST

  assert.equal(morning.ok, true);
  assert.equal(morning.calendarDate.isoDate, '2026-11-26');
  assert.equal(afternoon.calendarDate.isoDate, '2026-11-26');
  assert.equal(lateNight.calendarDate.isoDate, '2026-11-26');

  assert.equal(morning.product.id, afternoon.product.id);
  assert.equal(morning.product.id, lateNight.product.id);
});

test('GG-03: Different consecutive days rotate cleanly and exhaust all approved products before repeating', () => {
  const eligible = rotation.getEligibleDailyProducts(MASTER_CATALOG);
  const N = eligible.length;
  const seen = new Set();
  const baseMs = Date.parse('2026-11-26T18:00:00Z'); // 12:00 PM CST

  const firstCycleIds = [];
  for (let d = 0; d < N; d++) {
    const pick = rotation.selectDailyPick(MASTER_CATALOG, new Date(baseMs + d * 86400000));
    assert.equal(pick.ok, true);
    assert.ok(!seen.has(pick.product.id), `Product ${pick.product.id} repeated before exhausting all ${N} items (day ${d})`);
    seen.add(pick.product.id);
    firstCycleIds.push(pick.product.id);
  }
  assert.equal(seen.size, N, 'Every daily-eligible product must appear exactly once per cycle');

  // Day N wraps back to Day 0 cleanly
  const wrapPick = rotation.selectDailyPick(MASTER_CATALOG, new Date(baseMs + N * 86400000));
  assert.equal(wrapPick.product.id, firstCycleIds[0]);
});

test('GG-04: Disabled products are strictly skipped from catalog and daily rotation', () => {
  const cat = cloneCatalog();
  const todayBefore = rotation.selectDailyPick(cat, new Date('2026-11-26T18:00:00Z'));
  const targetId = todayBefore.product.id;

  // Disable today's product
  const target = cat.products.find((p) => p.id === targetId);
  target.active = false;

  const eligibleAfter = rotation.getEligibleDailyProducts(cat);
  assert.ok(!eligibleAfter.some((p) => p.id === targetId), 'Disabled product must not remain eligible');

  const todayAfter = rotation.selectDailyPick(cat, new Date('2026-11-26T18:00:00Z'));
  assert.equal(todayAfter.ok, true);
  assert.notEqual(todayAfter.product.id, targetId);

  // Also ensure the 7 real rejected/inactive items in MASTER_CATALOG never appear
  const masterEligible = rotation.getEligibleDailyProducts(MASTER_CATALOG);
  const masterApproved = rotation.getApprovedCatalogProducts(MASTER_CATALOG);
  for (const rejectedId of [
    'elgato-stream-deck-plus-rejected',
    '8bitdo-sn30-pro-rejected',
    'tidbyt-gen2-rejected',
    'keychron-c3-pro-pending',
    'divoom-ditoo-pro-pending',
    'elgato-hd60x-oos-rejected',
    'samsung-990-pro-2tb-mismatch-rejected',
  ]) {
    assert.ok(!masterEligible.some((p) => p.id === rejectedId), `Rejected item ${rejectedId} leaked into daily pool`);
    assert.ok(!masterApproved.some((p) => p.id === rejectedId), `Rejected item ${rejectedId} leaked into approved catalog`);
  }
});

test('GG-05: Broken, cloaked, non-direct, or ASIN-mismatched affiliate links are rejected', () => {
  const validSample = MASTER_CATALOG.products.find((p) => p.active && p.dailyEligible);
  const badUrls = [
    'http://www.amazon.com/dp/' + validSample.asin + '?tag=gta6heistguid-20', // non-HTTPS
    'https://amzn.to/3fakeShort', // shortened / non-direct
    'https://evil.example.com/dp/' + validSample.asin + '?tag=gta6heistguid-20', // wrong host
    'https://www.amazon.com/s?k=gaming+gear&tag=gta6heistguid-20', // search URL, not /dp/ASIN
    'https://www.amazon.com/dp/B000000000?tag=gta6heistguid-20', // ASIN mismatch
    'not-a-valid-url',
  ];

  for (const url of badUrls) {
    const p = { ...validSample, amazonSpecialLink: url };
    const res = rotation.validateProduct(p, { requireDaily: true });
    assert.equal(res.valid, false, `Expected invalid URL to be rejected: ${url}`);
  }
});

test('GG-06: Missing or wrong Amazon Associates tracking IDs are rejected', () => {
  const validSample = MASTER_CATALOG.products.find((p) => p.active && p.dailyEligible);

  const missingTagUrl = { ...validSample, amazonSpecialLink: `https://www.amazon.com/dp/${validSample.asin}` };
  assert.equal(rotation.validateProduct(missingTagUrl, { requireDaily: true }).valid, false);

  const wrongTagUrl = { ...validSample, amazonSpecialLink: `https://www.amazon.com/dp/${validSample.asin}?tag=someoneelse-20` };
  assert.equal(rotation.validateProduct(wrongTagUrl, { requireDaily: true }).valid, false);

  const wrongTagField = { ...validSample, associatesTag: 'wrong-20' };
  assert.equal(rotation.validateProduct(wrongTagField, { requireDaily: true }).valid, false);
});

test('GG-07: Missing required data or empty catalog fails gracefully without throwing', () => {
  assert.equal(rotation.selectDailyPick(null, new Date()).ok, false);
  assert.equal(rotation.selectDailyPick({ products: [] }, new Date()).ok, false);
  assert.equal(rotation.selectDailyPick({ products: [{ id: 'broken', active: true, dailyEligible: true }] }, new Date()).ok, false);

  // Missing image license, generated illustrations, text-only daily picks, or missing editorial field rejected
  const sample = MASTER_CATALOG.products.find((p) => p.active && p.dailyEligible);
  const noLicense = { ...sample, imageLicense: { status: 'Unknown' } };
  assert.equal(rotation.validateProduct(noLicense, { requireDaily: true }).valid, false);

  const fakeIllustration = {
    ...sample,
    mediaType: 'illustration',
    imageSource: '/assets/gear-illustrations/fake.svg',
    imageLicense: { status: 'Authorized (Category Illustration)' },
  };
  assert.equal(rotation.validateProduct(fakeIllustration, { requireDaily: false }).valid, false);
  assert.equal(rotation.validateProduct(fakeIllustration, { requireDaily: true }).valid, false);

  const textOnlyItem = {
    ...sample,
    mediaType: 'none',
    imageSource: null,
    imageAlt: '',
    imageLicense: { status: 'Text-Only Presentation (No Permitted Real Photo Available)' },
  };
  assert.equal(rotation.validateProduct(textOnlyItem, { requireDaily: false }).valid, true, 'Text-only cards must be allowed in catalog');
  assert.equal(rotation.validateProduct(textOnlyItem, { requireDaily: true }).valid, false, 'Daily Editor Pick must reject text-only items without a real photo');

  const noEditorial = { ...sample, editorialIntro: '' };
  assert.equal(rotation.validateProduct(noEditorial, { requireDaily: true }).valid, false);
});

test('GG-08: Daily selection is identical across simulated visitor time zones for the same UTC instant', () => {
  // Same UTC instant represented with different timezone offsets (Tokyo +09:00, London +00:00, LA -08:00, NY -05:00, Chicago -06:00)
  const sameInstantRepresentations = [
    '2026-11-26T20:00:00Z',       // UTC
    '2026-11-27T05:00:00+09:00',  // Tokyo (already Nov 27 locally, still Nov 26 in Chicago!)
    '2026-11-26T20:00:00+00:00',  // London
    '2026-11-26T12:00:00-08:00',  // Los Angeles
    '2026-11-26T15:00:00-05:00',  // New York
    '2026-11-26T14:00:00-06:00',  // Chicago
  ];

  const picks = sameInstantRepresentations.map((iso) => rotation.selectDailyPick(MASTER_CATALOG, new Date(iso)));
  const firstId = picks[0].product.id;
  for (const p of picks) {
    assert.equal(p.calendarDate.isoDate, '2026-11-26');
    assert.equal(p.product.id, firstId, 'All simulated visitor time zones must see the exact same America/Chicago pick');
  }
});

test('GG-09: America/Chicago midnight flips the selected product cleanly at 00:00:00 CT', () => {
  // CST (UTC-6): 2026-11-26 23:59:59 CST == 2026-11-27T05:59:59Z
  const beforeMidnight = rotation.selectDailyPick(MASTER_CATALOG, new Date('2026-11-27T05:59:59Z'));
  // CST (UTC-6): 2026-11-27 00:00:00 CST == 2026-11-27T06:00:00Z
  const atMidnight = rotation.selectDailyPick(MASTER_CATALOG, new Date('2026-11-27T06:00:00Z'));

  assert.equal(beforeMidnight.calendarDate.isoDate, '2026-11-26');
  assert.equal(atMidnight.calendarDate.isoDate, '2026-11-27');
  assert.notEqual(beforeMidnight.product.id, atMidnight.product.id);
  assert.equal((beforeMidnight.index + 1) % beforeMidnight.poolSize, atMidnight.index);
});

test('GG-10: Daylight Saving Time spring-forward (23h day) and fall-back (25h day) rotate by exact +1 without skipping or repeating', () => {
  // Spring Forward 2027 in America/Chicago: Sunday 2027-03-14 (CST UTC-6 -> CDT UTC-5 at 2:00 AM)
  const sfDay0End = rotation.selectDailyPick(MASTER_CATALOG, new Date('2027-03-14T05:59:59Z'));   // 2027-03-13 23:59:59 CST
  const sfDay1Start = rotation.selectDailyPick(MASTER_CATALOG, new Date('2027-03-14T06:00:00Z')); // 2027-03-14 00:00:00 CST
  const sfDay1End = rotation.selectDailyPick(MASTER_CATALOG, new Date('2027-03-15T04:59:59Z'));   // 2027-03-14 23:59:59 CDT (23h later!)
  const sfDay2Start = rotation.selectDailyPick(MASTER_CATALOG, new Date('2027-03-15T05:00:00Z')); // 2027-03-15 00:00:00 CDT

  assert.equal(sfDay0End.calendarDate.isoDate, '2027-03-13');
  assert.equal(sfDay1Start.calendarDate.isoDate, '2027-03-14');
  assert.equal(sfDay1End.calendarDate.isoDate, '2027-03-14');
  assert.equal(sfDay2Start.calendarDate.isoDate, '2027-03-15');
  assert.equal(sfDay1Start.product.id, sfDay1End.product.id);
  assert.equal((sfDay0End.index + 1) % sfDay0End.poolSize, sfDay1Start.index);
  assert.equal((sfDay1End.index + 1) % sfDay1End.poolSize, sfDay2Start.index);

  // Fall Back 2027 in America/Chicago: Sunday 2027-11-07 (CDT UTC-5 -> CST UTC-6 at 2:00 AM)
  const fbDay0End = rotation.selectDailyPick(MASTER_CATALOG, new Date('2027-11-07T04:59:59Z'));   // 2027-11-06 23:59:59 CDT
  const fbDay1Start = rotation.selectDailyPick(MASTER_CATALOG, new Date('2027-11-07T05:00:00Z')); // 2027-11-07 00:00:00 CDT
  const fbDay1End = rotation.selectDailyPick(MASTER_CATALOG, new Date('2027-11-08T05:59:59Z'));   // 2027-11-07 23:59:59 CST (25h later!)
  const fbDay2Start = rotation.selectDailyPick(MASTER_CATALOG, new Date('2027-11-08T06:00:00Z')); // 2027-11-08 00:00:00 CST

  assert.equal(fbDay0End.calendarDate.isoDate, '2027-11-06');
  assert.equal(fbDay1Start.calendarDate.isoDate, '2027-11-07');
  assert.equal(fbDay1End.calendarDate.isoDate, '2027-11-07');
  assert.equal(fbDay2Start.calendarDate.isoDate, '2027-11-08');
  assert.equal(fbDay1Start.product.id, fbDay1End.product.id);
  assert.equal((fbDay0End.index + 1) % fbDay0End.poolSize, fbDay1Start.index);
  assert.equal((fbDay1End.index + 1) % fbDay1End.poolSize, fbDay2Start.index);
});

test('GG-11 & GG-12: Zero stale prices, stock claims, or Amazon star ratings/reviews in catalog or HTML; validator rejects them', () => {
  const sample = MASTER_CATALOG.products.find((p) => p.active && p.dailyEligible);
  assert.equal(rotation.validateProduct({ ...sample, shortDescription: 'Great deal for $49.99 today' }, { requireDaily: true }).valid, false);
  assert.equal(rotation.validateProduct({ ...sample, shortDescription: 'Rated 4.7 out of 5 stars on Amazon' }, { requireDaily: true }).valid, false);
  assert.equal(rotation.validateProduct({ ...sample, shortDescription: 'Only 3 left in stock' }, { requireDaily: true }).valid, false);

  // Verify rendered HTML has no static dollar prices, AggregateRating, or Amazon star ratings
  const htmlBody = GEAR_HTML.replace(/<script[\s\S]*?<\/script>/gi, '');
  assert.doesNotMatch(htmlBody, /\$\d+(?:\.\d{2})?/, 'Gaming Gear HTML must not hardcode static product prices');
  assert.doesNotMatch(htmlBody, /AggregateRating/i, 'Must not include AggregateRating schema');
  assert.doesNotMatch(htmlBody, /\b\d(?:\.\d)?\s*(?:\/\s*5|out of 5)\s*stars?\b/i, 'Must not render Amazon star ratings');
  assert.match(htmlBody, /As an Amazon Associate I earn from qualifying purchases\./, 'Required Amazon Associate statement must be present');
  assert.match(htmlBody, /LEONIDA EDITOR'S PICK OF THE DAY/, 'Feature heading must be present');
  assert.match(htmlBody, /CHECK IT OUT ON AMAZON/, 'Required CTA label must be present');
});

test('GG-13: All active Amazon CTA URLs are direct, correctly tagged Special Links; GA4 affiliate_click emits full non-PII params; homepage pause preserved', () => {
  const approved = rotation.getApprovedCatalogProducts(MASTER_CATALOG);
  for (const p of approved) {
    const check = rotation.validateAmazonSpecialLink(p.amazonSpecialLink, p.asin, 'gta6heistguid-20');
    assert.equal(check.valid, true, `Invalid Special Link on ${p.id}: ${check.reasons.join(', ')}`);
    assert.equal(check.host, 'www.amazon.com');
    assert.equal(check.tag, 'gta6heistguid-20');
  }

  // Verify Phase 35.1C Amazon Placement Pause remains false in site-config.js
  const siteConfigSrc = fs.readFileSync(path.join(ROOT, 'public', 'site-config.js'), 'utf8');
  const affiliatesSrc = fs.readFileSync(path.join(ROOT, 'public', 'js', 'affiliates.js'), 'utf8');
  assert.match(siteConfigSrc, /enableAmazonProductPlacements:\s*false/, 'Phase 35.1C homepage Amazon Placement Pause must remain false');

  // Verify GA4 affiliate_click parameters on /gaming-gear/ Editor's Pick click
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

  const mockCta = {
    href: 'https://www.amazon.com/dp/B0CDG5HCCH?tag=gta6heistguid-20',
    getAttribute(k) {
      return ({
        href: 'https://www.amazon.com/dp/B0CDG5HCCH?tag=gta6heistguid-20',
        'data-aff-partner': 'amazon',
        'data-aff-product': '8bitdo-micro-gamepad',
        'data-aff-asin': 'B0CDG5HCCH',
        'data-aff-category': 'Funny & Unusual',
        'data-aff-placement': 'editors_pick_daily',
        'data-aff-daily-slot': 'daily_2026-11-26',
        'data-aff-dest-host': 'www.amazon.com',
        'data-aff-area': 'cta',
      })[k] || null;
    },
    closest() { return this; },
    matches() { return false; },
  };

  for (const fn of docListeners.get('click') || []) fn({ target: mockCta });

  const affEvents = ctx.GTA6Track.getEvents().filter((e) => e.event === 'affiliate_click');
  assert.equal(affEvents.length, 1);
  assert.equal(affEvents[0].params.product_id, '8bitdo-micro-gamepad');
  assert.equal(affEvents[0].params.product_category, 'Funny & Unusual');
  assert.equal(affEvents[0].params.feature_placement, 'editors_pick_daily');
  assert.equal(affEvents[0].params.daily_editorial_slot, 'daily_2026-11-26');
  assert.equal(affEvents[0].params.destination_host, 'www.amazon.com');
  assert.equal(affEvents[0].params.source_page, '/gaming-gear/');
  assert.equal('page_location' in affEvents[0].params, false, 'Must respect P36.3-PII1 custom event sanitizer');
});
