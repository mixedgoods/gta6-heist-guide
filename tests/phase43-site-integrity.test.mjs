import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { onRequest as middlewareOnRequest } from '../functions/_middleware.js';

const ROOT = path.resolve(import.meta.dirname, '..');
const PUBLIC = path.join(ROOT, 'public');

function readText(relPath) {
  return fs.readFileSync(path.join(ROOT, relPath), 'utf8');
}

function readJson(relPath) {
  return JSON.parse(readText(relPath));
}

function existsInPublic(urlPath) {
  if (!urlPath || urlPath.startsWith('http')) return true;
  const clean = urlPath.split('#')[0].split('?')[0].replace(/^\/+/, '');
  if (!clean) return true;
  const candidates = [
    path.join(PUBLIC, clean),
    path.join(PUBLIC, `${clean}.html`),
    path.join(PUBLIC, clean, 'index.html'),
  ];
  return candidates.some((c) => fs.existsSync(c) && fs.statSync(c).isFile());
}

function getSitemapUrls() {
  const xml = readText('public/sitemap.xml');
  return [...xml.matchAll(/<loc>https:\/\/www\.gta6heistguide\.com([^<]*)<\/loc>/g)].map((m) => m[1] || '/');
}

function urlToFile(u) {
  const p = u.replace(/^\/+/, '');
  if (!p) return path.join(PUBLIC, 'index.html');
  const idx = path.join(PUBLIC, p, 'index.html');
  if (fs.existsSync(idx)) return idx;
  const html = path.join(PUBLIC, `${p}.html`);
  if (fs.existsSync(html)) return html;
  return path.join(PUBLIC, p);
}

test('P0-1: map-pins.json has 0 broken links, 0 fictional pre-launch pins, and reconciled total_pins (185)', () => {
  const data = readJson('public/data/map-pins.json');
  assert.equal(data.total_pins, data.pins.length);
  assert.equal(data.pins.length, 185);

  const forbiddenIds = new Set([
    'vault-starlet-superyacht',
    'vault-port-gellhorn-terminal',
    'op-keys-submarine-smuggler-dock',
  ]);
  for (const pin of data.pins) {
    assert.ok(!forbiddenIds.has(pin.id), `Debunked fictional pin still present: ${pin.id}`);
    if (pin.link) {
      assert.ok(existsInPublic(pin.link), `Broken map-pin link on ${pin.id}: ${pin.link}`);
      assert.ok(!pin.link.includes('/sinfrontera-bank-vs-leonida-gold-reserve.html'), 'Retired compare link still present');
    }
  }
});

test('P0-2: /giveaways consolidated onto /drops with 301 redirect and removed from sitemap.xml', () => {
  const redirects = readText('public/_redirects');
  assert.match(redirects, /^\/giveaways\s+\/drops\s+301$/m);
  assert.match(redirects, /^\/giveaways\.html\s+\/drops\s+301$/m);

  const sitemapUrls = getSitemapUrls();
  assert.ok(sitemapUrls.includes('/drops'), '/drops must remain in sitemap.xml');
  assert.ok(!sitemapUrls.includes('/giveaways'), '/giveaways must be removed from sitemap.xml');
  assert.equal(sitemapUrls.length, 502);

  const gHtml = readText('public/giveaways.html');
  assert.match(gHtml, /noindex/i);
  assert.match(gHtml, /rel="canonical"\s+href="https:\/\/www\.gta6heistguide\.com\/drops"/);
});

test('P0-3: live_intel.json cheats counts match authoritative cheats.json (6 verified, 53 unconfirmed, 2 conflicting, 61 total)', () => {
  const cheats = readJson('public/data/cheats.json');
  const liveIntel = readJson('public/data/live_intel.json');
  const items = cheats.items;
  assert.equal(items.length, 61);

  const confirmed = items.filter((c) => (c.verificationStatus || c.status || '').toUpperCase() === 'CONFIRMED').length;
  const unconfirmed = items.filter((c) => (c.verificationStatus || c.status || '').toUpperCase() === 'UNCONFIRMED').length;
  const conflicting = items.filter((c) => (c.verificationStatus || c.status || '').toUpperCase() === 'CONFLICTING').length;

  assert.equal(confirmed, 6);
  assert.equal(unconfirmed, 53);
  assert.equal(conflicting, 2);
  assert.equal(liveIntel.verifiedCheatsCount, confirmed);
  assert.equal(liveIntel.totalCheatsTracked, items.length);
  assert.equal(liveIntel.unconfirmedCheatsCount, unconfirmed);
  assert.equal(liveIntel.conflictingCheatsCount, conflicting);
});

test('P0-4: 0 broken /settings.html links remain in public/data/*.json and /gta-6-settings/ exists', () => {
  assert.ok(existsInPublic('/gta-6-settings/'));
  for (const fn of ['discoveries.json', 'discoveries-featured.json', 'live-feed.json', 'live_intel.json']) {
    const raw = readText(`public/data/${fn}`);
    assert.ok(!raw.includes('/settings.html'), `Broken /settings.html found in public/data/${fn}`);
  }
});

test('P1-1: 0 visible Phase N leaks across 13 audited pages and 0 Internal Tracker leaks on /cheats', () => {
  const pages = [
    'public/my-leonida/index.html',
    'public/gta-6-database/index.html',
    'public/gta-6-vehicles-guide/index.html',
    'public/missions/index.html',
    'public/articles/every-leonida-region-in-gta-6-mapped-escape-coordinates.html',
    'public/gta-6-property-ownership/index.html',
    'public/gta-6-money-guide/index.html',
    'public/gta-6-settings/index.html',
    'public/weapons.html',
    'public/radio.html',
    'public/gta-6-collectibles/index.html',
    'public/guides/how-to-escape-police-wanted-levels.html',
    'public/guides/grassrivers-skunk-ape-mystery.html',
  ];
  for (const p of pages) {
    const body = readText(p).replace(/<!--[\s\S]*?-->/g, '').replace(/<script[\s\S]*?<\/script>/gi, '');
    assert.ok(!/\bPhase\s+\d+\b/i.test(body), `Visible Phase N leak still present in ${p}`);
  }
  assert.ok(!readText('public/cheats.html').includes('Pre-Launch Research Slot (Internal Tracker)'));
  assert.ok(!readText('public/data/cheats.json').includes('Pre-Launch Research Slot (Internal Tracker)'));
});

test('P1-2: Safe-code counts reconciled to 19 across all 5 audited pages', () => {
  const pages = [
    'public/locations/moonstone-boutique.html',
    'public/heists/small-banks-payday-loans.html',
    'public/guides/kolt-and-associates-gang-ops.html',
    'public/locations/la-cascara-motel.html',
    'public/guides/fast-cash-payday-loans.html',
  ];
  for (const p of pages) {
    const txt = readText(p);
    assert.ok(!/All (7|17) (Verified |Fixed |verified fixed )?Safe Codes/i.test(txt), `Stale safe-code count in ${p}`);
    assert.ok(!/all 17 fixed combinations/i.test(txt), `Stale 17 combinations in ${p}`);
  }
});

test('P1-3: Mount Kalaga region naming normalized to Mount Kalaga National Park (19 pins, 0 Mt. Kalaga)', () => {
  const data = readJson('public/data/map-pins.json');
  const mtShort = data.pins.filter((p) => p.region === 'Mt. Kalaga');
  const fullName = data.pins.filter((p) => p.region === 'Mount Kalaga National Park');
  assert.equal(mtShort.length, 0);
  assert.equal(fullName.length, 19);
  assert.ok(!('Mt. Kalaga' in (data.regions || {})));
  assert.ok('Mount Kalaga National Park' in (data.regions || {}));
});

test('P1-4: Wildlife verification wording accurately distinguishes 7 verified GTA VI + 42 reference species', () => {
  assert.ok(!readText('public/guides/legendary-hunter-animals-guide.html').includes('49 VERIFIED SPECIES'));
  for (const p of [
    'public/locations/vice-city.html',
    'public/locations/leonida-keys.html',
    'public/locations/grassrivers.html',
    'public/locations/mount-kalaga.html',
    'public/locations/ambrosia.html',
  ]) {
    assert.ok(!readText(p).includes('Verified Wildlife in '), `Misleading Verified Wildlife heading in ${p}`);
  }
});

test('P1-5: weapons.json has 27/27 parity with /weapons/*.html and clean canonical relatedLinks', () => {
  const w = readJson('public/data/weapons.json');
  const htmlCount = fs.readdirSync(path.join(PUBLIC, 'weapons')).filter((f) => f.endsWith('.html')).length;
  assert.equal(w.items.length, 27);
  assert.equal(htmlCount, 27);

  const ids = new Set(w.items.map((it) => it.id));
  assert.ok(ids.has('black-eagle-kalinga-50'));
  assert.ok(ids.has('ride-free-revolver'));

  for (const it of w.items) {
    for (const rl of it.relatedLinks || []) {
      assert.ok(!rl.url.endsWith('.html'), `Non-canonical .html relatedLink on ${it.id}: ${rl.url}`);
      assert.ok(existsInPublic(rl.url), `Broken relatedLink on ${it.id}: ${rl.url}`);
    }
  }
});

test('P1-6: All 502 canonical pages share 1 unified <nav>, 1 unified <footer>, 0 duplicate Save Planner links, and /map has <footer>', () => {
  const urls = getSitemapUrls();
  const navSigs = new Set();
  const footerSigs = new Set();

  for (const u of urls) {
    const html = fs.readFileSync(urlToFile(u), 'utf8');
    const navMatch = html.match(/<nav\b[^>]*>[\s\S]*?<\/nav>/);
    assert.ok(navMatch, `Missing <nav> on ${u}`);
    const navLinks = [...navMatch[0].matchAll(/href="([^"]+)"/g)].map((m) => m[1]).join('|');
    navSigs.add(navLinks);

    const footerMatch = html.match(/<footer\b[^>]*>[\s\S]*?<\/footer>/);
    assert.ok(footerMatch, `Missing <footer> on ${u}`);
    const footerLinks = [...footerMatch[0].matchAll(/href="([^"]+)"/g)].map((m) => m[1]).join('|');
    footerSigs.add(footerLinks);

    const spCount = (footerMatch[0].match(/15-Slot Save Planner/g) || []).length;
    assert.equal(spCount, 1, `Expected exactly 1 Save Planner link in footer on ${u}, found ${spCount}`);
  }

  assert.equal(navSigs.size, 1, `Expected 1 unified nav signature, found ${navSigs.size}`);
  assert.equal(footerSigs.size, 1, `Expected 1 unified footer signature, found ${footerSigs.size}`);
});

test('Phase 43.2-1: Middleware redirects /giveaways and /giveaways.html directly to /drops in 1 hop, preserves query strings, and has no loops', async () => {
  const passthrough = async () => new Response('OK', { status: 200 });

  const cases = [
    ['https://www.gta6heistguide.com/giveaways', 'https://www.gta6heistguide.com/drops'],
    ['https://www.gta6heistguide.com/giveaways.html', 'https://www.gta6heistguide.com/drops'],
    ['https://www.gta6heistguide.com/giveaways?source=test', 'https://www.gta6heistguide.com/drops?source=test'],
    ['https://www.gta6heistguide.com/giveaways.html?source=test', 'https://www.gta6heistguide.com/drops?source=test'],
  ];

  for (const [reqUrl, expectedLocation] of cases) {
    const res = await middlewareOnRequest({
      request: new Request(reqUrl, { method: 'GET' }),
      next: passthrough,
    });
    assert.equal(res.status, 301, `Expected 301 for ${reqUrl}`);
    assert.equal(res.headers.get('location'), expectedLocation, `Expected single-hop redirect for ${reqUrl}`);

    // Follow destination through middleware to confirm zero redirect chains or loops
    const destRes = await middlewareOnRequest({
      request: new Request(expectedLocation, { method: 'GET' }),
      next: passthrough,
    });
    assert.equal(destRes.status, 200, `Expected destination ${expectedLocation} to resolve without redirect loop`);
  }

  // Static check: middleware must never map /giveaways.html -> /giveaways
  const mwSrc = readText('functions/_middleware.js');
  assert.ok(!mwSrc.includes('["/giveaways.html", "/giveaways"]'), 'Two-hop /giveaways.html -> /giveaways rule must not exist');
  assert.ok(mwSrc.includes('["/giveaways", "/drops"]'), 'Direct /giveaways -> /drops rule missing');
  assert.ok(mwSrc.includes('["/giveaways.html", "/drops"]'), 'Direct /giveaways.html -> /drops rule missing');
});

test('Phase 43.2-2: Mobile /map region jump pills do not shrink, preserve >=44px touch height, and retain all 6 region handlers', () => {
  const mapHtml = readText('public/map.html');
  const mobileBlockMatch = mapHtml.match(/\/\* Phase 43: Mobile touch-target accessibility[\s\S]*?@media\s*\(max-width:\s*768px\)\s*\{([\s\S]*?)\n\}/);
  assert.ok(mobileBlockMatch, 'Missing Phase 43 mobile touch-target @media (max-width: 768px) block in public/map.html');
  const mobileCss = mobileBlockMatch[1];

  // Ensure .region-jump-pill is NOT in any rule that sets min-width: 44px
  const ruleBlocks = [...mobileCss.matchAll(/([^{]+)\{([^}]+)\}/g)];
  const pillRules = ruleBlocks.filter((m) => m[1].includes('.region-jump-pill'));
  assert.ok(pillRules.length >= 1, 'Expected dedicated .region-jump-pill mobile rule');
  for (const [, selector, body] of pillRules) {
    assert.ok(!/min-width\s*:\s*44px/i.test(body), `Fixed min-width: 44px must not apply to .region-jump-pill (selector: ${selector.trim()})`);
  }

  const combinedPillCss = pillRules.map((m) => m[2]).join('\n');
  assert.match(combinedPillCss, /min-height\s*:\s*44px\s*!important/i, 'Missing min-height: 44px !important on .region-jump-pill');
  assert.match(combinedPillCss, /flex\s*:\s*0\s+0\s+auto\s*!important/i, 'Missing flex: 0 0 auto !important on .region-jump-pill');
  assert.match(combinedPillCss, /white-space\s*:\s*nowrap\s*!important/i, 'Missing white-space: nowrap !important on .region-jump-pill');

  // Verify all 6 region jump pills remain wired to jumpToRegion
  for (const region of [
    'Vice City',
    'Grassrivers',
    'Leonida Keys',
    'Mount Kalaga National Park',
    'Port Gellhorn',
    'Ambrosia',
  ]) {
    assert.ok(
      mapHtml.includes(`data-region="${region}"`) && mapHtml.includes(`jumpToRegion('${region}')`),
      `Missing region jump pill or handler for ${region}`,
    );
  }
});
