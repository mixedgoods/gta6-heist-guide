import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const ROOT = path.resolve(import.meta.dirname, '..');
const PUBLIC = path.join(ROOT, 'public');

function readText(relPath) {
  return fs.readFileSync(path.join(ROOT, relPath), 'utf8');
}

function readJson(relPath) {
  return JSON.parse(readText(relPath));
}

function createMyLeonidaSandbox(initialStorage = {}) {
  const store = new Map(Object.entries(initialStorage));
  const localStorage = {
    getItem(k) { return store.has(k) ? store.get(k) : null; },
    setItem(k, v) { store.set(k, String(v)); },
    removeItem(k) { store.delete(k); },
    clear() { store.clear(); },
  };
  const sandbox = {
    window: null,
    localStorage,
    CustomEvent: class CustomEvent {
      constructor(type, init = {}) { this.type = type; this.detail = init.detail; }
    },
    dispatchEvent() {},
    addEventListener() {},
    document: { readyState: 'complete', addEventListener() {} },
    console,
    Date,
    Math,
    JSON,
    Object,
    Array,
    String,
    Number,
    Boolean,
    RegExp,
    isFinite,
  };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(readText('public/assets/js/gta6-progress-store.js'), sandbox);
  vm.runInContext(readText('public/assets/js/my-leonida-adapter.js'), sandbox);
  return { sandbox, store };
}

function loadRealDatasets() {
  return {
    pins: readJson('public/data/map-pins.json').pins,
    jobs: readJson('public/data/heist-command-center.json').jobs,
    vehicles: readJson('public/data/vehicles.json').items,
    weapons: readJson('public/data/weapons.json').items,
    properties: readJson('public/data/properties.json').items,
    animals: readJson('public/data/animals.json').items,
    gunStores: readJson('public/data/gun-stores.json').items,
  };
}

test('P46-1: /my-leonida/ loads shared main.js mobile nav and retains accessible toggle attributes', () => {
  const html = readText('public/my-leonida/index.html');
  assert.match(html, /<script\s+src="\/assets\/main\.js[^"]*"\s+defer><\/script>/i);
  assert.match(html, /<nav\s+class="navbar"\s+id="siteNavbar">/);

  const mainJs = readText('public/assets/main.js');
  assert.match(mainJs, /btn\.setAttribute\('aria-label',\s*'Toggle Navigation Menu'\)/);
  assert.match(mainJs, /btn\.setAttribute\('aria-controls',\s*navLinks\.id\)/);
  assert.match(mainJs, /btn\.setAttribute\('aria-expanded',\s*'false'\)/);
});

test('P46-2: /my-leonida/ static HTML fallback denominators match live datasets with no stale 188 or 0/0', () => {
  const html = readText('public/my-leonida/index.html');
  assert.match(html, /id="mlKpiOverallSub">0 \/ 306 verified items</);
  assert.match(html, /id="mlKpiMapVal">0 \/ 185</);
  assert.match(html, /id="mlKpiMapSub">0% · 185 unvisited</);
  assert.ok(!html.includes('188 unvisited'), 'Stale 188 unvisited text must be removed');
  assert.match(html, /id="mlKpiGearVal">0 \/ 60</);
  assert.match(html, /id="mlKpiGearSub">0% · 0\/33 vehicles · 0\/27 weapons</);
  assert.match(html, /id="mlKpiWorldVal">0 \/ 34</);
  assert.match(html, /id="mlKpiWorldSub">0% · 0\/27 properties · 0\/7 verified animals</);
  assert.match(html, /id="mlImportFileBtn"/);
  assert.match(html, /id="mlImportPasteBtn"/);
});

test('P46-3: My Leonida computeSnapshot derives exact denominators, handles zero-item edge cases, and persists progress', () => {
  const datasets = loadRealDatasets();
  const { sandbox, store } = createMyLeonidaSandbox();

  // 1. Fresh state
  const snap0 = sandbox.GTA6MyLeonida.computeSnapshot(datasets);
  assert.equal(snap0.map.total, 185);
  assert.equal(snap0.map.completed, 0);
  assert.equal(snap0.map.unvisited, 185);
  assert.equal(snap0.map.pct, 0);
  assert.equal(snap0.gear.total, 60);
  assert.equal(snap0.gear.completed, 0);
  assert.equal(snap0.gear.remaining, 60);
  assert.equal(snap0.world.total, 34);
  assert.equal(snap0.world.completed, 0);
  assert.equal(snap0.world.remaining, 34);
  assert.equal(snap0.overall.total, 306);
  assert.equal(snap0.overall.completed, 0);
  assert.equal(snap0.overall.remaining, 306);

  // 2. Progress updates & persistence using genuinely independent (non-linked) pins
  const linkedIds = new Set(
    (sandbox.GTA6Progress.LINK_GROUPS || []).flat()
  );
  const independentPins = datasets.pins.filter(
    (p) => p && p.id && p.enabled !== false && !linkedIds.has('pin:' + p.id)
  );
  assert.ok(independentPins.length >= 2, 'Expected at least two unlinked enabled pins');

  sandbox.GTA6Progress.setDone('pin:' + independentPins[0].id, true);
  sandbox.GTA6Progress.setDone('pin:' + independentPins[1].id, true);
  sandbox.GTA6Progress.setDone('db:owned:vehicles:' + datasets.vehicles[0].id, true);
  sandbox.GTA6Progress.setDone('db:owned:weapons:' + datasets.weapons[0].id, true);
  sandbox.GTA6Progress.setDone('db:owned:properties:' + datasets.properties[0].id, true);
  const firstVerifiedAnimal = datasets.animals.find((a) => sandbox.GTA6MyLeonida.isVerifiedInGameAnimal(a));
  assert.ok(firstVerifiedAnimal, 'Expected at least one verified GTA VI animal');
  sandbox.GTA6Progress.setDone('db:owned:animals:' + firstVerifiedAnimal.id, true);

  // Re-create sandbox from persisted localStorage to verify persistence
  const persisted = Object.fromEntries(store.entries());
  const { sandbox: reloaded } = createMyLeonidaSandbox(persisted);
  const snap1 = reloaded.GTA6MyLeonida.computeSnapshot(datasets);

  assert.equal(snap1.map.completed, 2);
  assert.equal(snap1.map.unvisited, 183);
  assert.equal(snap1.map.completed + snap1.map.unvisited, snap1.map.total);
  assert.equal(snap1.map.pct, Math.round((2 / 185) * 100));

  assert.equal(snap1.gear.completed, 2);
  assert.equal(snap1.gear.remaining, 58);
  assert.equal(snap1.gear.completed + snap1.gear.remaining, snap1.gear.total);
  assert.equal(snap1.gear.pct, Math.round((2 / 60) * 100));

  assert.equal(snap1.world.completed, 2);
  assert.equal(snap1.world.remaining, 32);
  assert.equal(snap1.world.completed + snap1.world.remaining, snap1.world.total);
  assert.equal(snap1.world.pct, Math.round((2 / 34) * 100));

  assert.equal(snap1.overall.completed, 4); // 2 independent pins + 1 property + 1 verified animal
  assert.equal(snap1.overall.remaining, 302);
  assert.equal(snap1.overall.completed + snap1.overall.remaining, snap1.overall.total);

  // 2b. Verify intentional LINK_GROUPS cross-sync behavior (vault-sinfrontera-downtown <-> heist-cartel <-> heist:the-cartel-heist)
  reloaded.GTA6Progress.setDone('pin:vault-sinfrontera-downtown', true);
  assert.equal(reloaded.GTA6Progress.isDone('pin:heist-cartel'), true);
  assert.equal(reloaded.GTA6Progress.isDone('heist:the-cartel-heist'), true);
  const snapLinked = reloaded.GTA6MyLeonida.computeSnapshot(datasets);
  const cartelJob = datasets.jobs.find((j) => j.id === 'the-cartel-heist');
  const cartelSteps = cartelJob && Array.isArray(cartelJob.checklist) ? cartelJob.checklist.length : 0;
  assert.equal(snapLinked.map.completed, 4); // 2 independent pins + vault-sinfrontera-downtown + linked pin:heist-cartel
  assert.equal(snapLinked.map.unvisited, 181);
  assert.equal(snapLinked.overall.completed, 6 + cartelSteps); // +2 linked pins + linked Cartel Heist checklist steps
  assert.equal(snapLinked.overall.completed + snapLinked.overall.remaining, snapLinked.overall.total);

  // 3. Zero-item edge case
  const snapEmpty = reloaded.GTA6MyLeonida.computeSnapshot({
    pins: [], jobs: [], vehicles: [], weapons: [], properties: [], animals: [], gunStores: [],
  });
  assert.equal(snapEmpty.overall.hasItems, false);
  assert.equal(snapEmpty.overall.total, 0);
  assert.equal(snapEmpty.map.hasItems, false);
  assert.equal(snapEmpty.gear.hasItems, false);
  assert.equal(snapEmpty.world.hasItems, false);
  assert.equal(snapEmpty.heists.hasItems, false);
});

test('P46-4: /map separates mobile Saved Builds FAB from Pins & Filters and serves WebP map with JPG fallback', () => {
  const html = readText('public/map.html');
  assert.match(html, /\.mobile-toggle-btn\s*\{[^}]*min-height:\s*44px/s);
  assert.match(html, /\.bookmarks-fab\s*\{[^}]*bottom:\s*max\(72px/s);
  assert.match(html, /leonida-map\.webp/);
  assert.match(html, /leonida-map\.jpg/);
});

test('P46-5: Below-the-fold lazy loading applied across 5 target pages without lazy-loading hero/LCP images', () => {
  const indexHtml = readText('public/index.html');
  assert.match(indexHtml, /characters-duo-banner\.jpg[^>]*loading="eager"/);
  assert.match(indexHtml, /gtavi-american-alligator-grassrivers-closeup\.jpg[^>]*loading="lazy"/);
  assert.match(indexHtml, /gtavi-grotti-cheetah-classic-vice-city\.jpg[^>]*loading="lazy"/);

  const crewHtml = readText('public/crew-database.html');
  const crewLazy = [...crewHtml.matchAll(/<img\b[^>]*loading="lazy"[^>]*>/gi)];
  assert.ok(crewLazy.length >= 13, `Expected >=13 lazy portraits on crew-database.html, got ${crewLazy.length}`);
  assert.doesNotMatch(crewHtml, /character-lucia\.jpg[^>]*loading="lazy"/);

  const calcHtml = readText('public/heist-payout-calculator.html');
  const calcLazy = [...calcHtml.matchAll(/<img\b[^>]*loading="lazy"[^>]*>/gi)];
  assert.ok(calcLazy.length >= 3, `Expected >=3 lazy images on heist-payout-calculator.html, got ${calcLazy.length}`);

  const safeHtml = readText('public/safehouses-laundering.html');
  assert.match(safeHtml, /prop-venetian-mansion\.webp[^>]*loading="eager"/);
  assert.match(safeHtml, /prop-starlet-villa\.webp[^>]*loading="lazy"/);
  assert.match(safeHtml, /prop-ocean-drive\.webp[^>]*loading="lazy"/);

  const dbHtml = readText('public/gta-6-database/index.html');
  assert.match(dbHtml, /paradise-garage\.jpg[^>]*loading="eager"/);
  assert.match(dbHtml, /gtavi-american-alligator-grassrivers-closeup\.jpg[^>]*loading="lazy"/);
});

test('P46-6: Oversized top images are measurably reduced', () => {
  const checks = [
    ['public/assets/images/properties/paradise-garage.jpg', 500 * 1024],
    ['public/assets/images/vehicles/veh-cheetah-1.jpg', 500 * 1024],
    ['public/assets/lfg-squad-banner.png', 500 * 1024],
    ['public/assets/hero-heist-banner.png', 500 * 1024],
    ['public/assets/maps/leonida-map.webp', 900 * 1024],
  ];
  for (const [rel, maxBytes] of checks) {
    const size = fs.statSync(path.join(ROOT, rel)).size;
    assert.ok(size < maxBytes, `${rel} expected < ${maxBytes} bytes, got ${size}`);
  }
});

test('P46-7: /gta-6-discoveries/ filter controls have explicit accessible labels', () => {
  const html = readText('public/gta-6-discoveries/index.html');
  assert.match(html, /id="discSearchInput"[^>]*aria-label="[^"]{10,}"/);
  assert.match(html, /id="discVerifyFilter"[^>]*aria-label="[^"]{10,}"/);
});

test('P46-8: Homepage JSON-LD removes invalid BreadcrumbList while preserving WebSite and FAQPage', () => {
  const html = readText('public/index.html');
  const matches = [...html.matchAll(/<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/gi)];
  assert.ok(matches.length >= 1, 'Expected homepage JSON-LD block');
  const graphTypes = [];
  for (const m of matches) {
    const parsed = JSON.parse(m[1]);
    if (Array.isArray(parsed['@graph'])) {
      for (const node of parsed['@graph']) graphTypes.push(node['@type']);
    } else if (parsed['@type']) {
      graphTypes.push(parsed['@type']);
    }
  }
  assert.ok(graphTypes.includes('WebSite'), 'WebSite schema must be preserved');
  assert.ok(graphTypes.includes('FAQPage'), 'FAQPage schema must be preserved');
  assert.ok(!graphTypes.includes('BreadcrumbList'), 'Invalid homepage BreadcrumbList must be removed');
});

test('P46-9: /gaming-gear/ has valid og:image metadata pointing to an existing asset', () => {
  const html = readText('public/gaming-gear/index.html');
  const m = html.match(/<meta\s+property="og:image"\s+content="https:\/\/www\.gta6heistguide\.com(\/[^"]+)"/);
  assert.ok(m, 'Missing og:image meta tag on /gaming-gear/');
  const assetPath = path.join(PUBLIC, m[1].replace(/^\/+/, ''));
  assert.ok(fs.existsSync(assetPath) && fs.statSync(assetPath).isFile(), `og:image asset does not exist: ${assetPath}`);
  assert.match(html, /<meta\s+property="og:image:width"\s+content="1200">/);
  assert.match(html, /<meta\s+property="og:image:height"\s+content="900">/);
  assert.match(html, /<meta\s+name="twitter:image"\s+content="https:\/\/www\.gta6heistguide\.com\/assets\/gear\/dualsense-edge\.jpg">/);
});
