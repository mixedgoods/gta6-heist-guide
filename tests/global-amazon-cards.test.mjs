import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const PUBLIC_DIR = path.join(ROOT, 'public');

const PHYSICAL_CARD_PAGES = [
  'gaming-gear/index.html',
  'gta-6-settings/index.html',
  'affiliates-gear.html',
  'gameplay-mechanics.html',
  'heist-payout-calculator.html',
  'drops.html',
  'giveaways.html',
  'cheats.html',
  'secrets.html',
  'free/index.html',
  'cloud-mirrors/index.html',
  'cloud-mirrors/heist-payout-calculator.html',
];

function walkHtml(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walkHtml(p, out);
    else if (ent.name.endsWith('.html')) out.push(p);
  }
  return out;
}

test('GLOBAL-AMZ-01: Shared global Amazon product card CSS exists and is linked on every physical-product card route', () => {
  const cssPath = path.join(PUBLIC_DIR, 'assets', 'css', 'amazon-product-cards.css');
  assert.ok(fs.existsSync(cssPath), 'Shared amazon-product-cards.css must exist');
  const css = fs.readFileSync(cssPath, 'utf8');
  assert.match(css, /\.amz-grid\s*\{/, 'Must define .amz-grid');
  assert.match(css, /repeat\(3,\s*minmax\(0,\s*1fr\)\)/, 'Desktop grid must use 3 balanced columns');
  assert.match(css, /\.amz-card\s*\{/, 'Must define .amz-card');
  assert.match(css, /\.amz-card__details/, 'Must style expandable details disclosure');

  for (const rel of PHYSICAL_CARD_PAGES) {
    const html = fs.readFileSync(path.join(PUBLIC_DIR, rel), 'utf8');
    assert.match(html, /\/assets\/css\/amazon-product-cards\.css/, `${rel} must link global amazon-product-cards.css`);
    assert.match(html, /class="[^"]*\bamz-card\b/, `${rel} must render physical Amazon products with shared .amz-card class`);
    assert.match(html, /<details class="amz-card__details">/, `${rel} must use expandable details disclosure on Amazon cards`);
  }
});

test('GLOBAL-AMZ-02: /gta-6-settings/ renders all 14 hardware models with exact verified ASINs, PS5 vs Xbox separation, and expandable details', () => {
  const html = fs.readFileSync(path.join(PUBLIC_DIR, 'gta-6-settings', 'index.html'), 'utf8');
  const expectedModels = [
    ['samsung-990-pro-heatsink', 'B0BHJDY57J'],
    ['wd-black-sn850p', 'B0C47ZX1WB'],
    ['crucial-t500-heatsink', 'B0CK2RKPBL'],
    ['seagate-xbox-expansion-card', 'B08K3S6WJM'],
    ['wd-black-c50-xbox', 'B0C44XVWCH'],
    ['elgato-4k-x', 'B0CPFWXMBL'],
    ['elgato-4k-pro', 'B0DLR3WQWR'],
    ['avermedia-gc553g2', 'B0CJWYCVRM'],
    ['elgato-hd60-x', 'B09V1KJ3J4'],
    ['lg-oled-c4', 'B0CVRDK4P6'],
    ['samsung-s90d-oled', 'B0CV9VGMPT'],
    ['asus-rog-pg32ucdm', 'B0CV26XVMD'],
    ['dualsense-edge', 'B0BS5V7T65'],
    ['xbox-elite-series-2', 'B07SFKTLZM'],
  ];

  const cardMatches = html.match(/<article class="hw-card amz-card\b/g) || [];
  assert.equal(cardMatches.length, 14, `Expected 14 hardware cards on /gta-6-settings/, found ${cardMatches.length}`);

  for (const [prodId, asin] of expectedModels) {
    assert.ok(html.includes(`data-product-id="${prodId}"`), `Missing hardware card ${prodId}`);
    assert.ok(html.includes(`https://www.amazon.com/dp/${asin}?tag=gta6heistguid-20`), `Missing exact verified Special Link for ${prodId} (${asin})`);
  }

  // Ensure Amazon buttons on /gta-6-settings/ are NOT hidden and have clear PS5 vs Xbox distinction
  const hwSection = html.slice(html.indexOf('id="hardware-comparison"'), html.indexOf('<!-- RELATED HUBS -->'));
  assert.doesNotMatch(hwSection, /hidden\s+data-amazon-placement-module/, 'Hardware comparison CTAs on /gta-6-settings/ must be visible');
  assert.match(hwSection, /PS5 &amp; PS5 Pro Only/, 'PS5-only badge must be explicit');
  assert.match(hwSection, /Xbox Series X\|S Only/, 'Xbox-only badge must be explicit');
  assert.match(hwSection, /As an Amazon Associate I earn from qualifying purchases\./, 'Amazon Associates disclosure required');
  assert.doesNotMatch(hwSection, /<img\b/i, 'Text-only compact hardware cards must not embed unauthorized product images');
});

test('GLOBAL-AMZ-03: Zero Wikimedia photos, zero SVG illustrations, zero unapproved product images, and zero fake stars inside any Amazon product card or JS renderer', () => {
  const cardRx = /<article class="[^"]*\bamz-card\b[\s\S]*?<\/article>/gi;
  for (const rel of PHYSICAL_CARD_PAGES) {
    const html = fs.readFileSync(path.join(PUBLIC_DIR, rel), 'utf8');
    const cards = html.match(cardRx) || [];
    assert.ok(cards.length > 0, `Expected .amz-card elements on ${rel}`);
    for (const card of cards) {
      assert.doesNotMatch(card, /gear-photos|gear-illustrations|\/assets\/gear\/|wikimedia\.org|\.svg/i, `Forbidden non-Amazon image in .amz-card on ${rel}`);
      assert.doesNotMatch(card, /★|AggregateRating/i, `Forbidden fabricated star rating in .amz-card on ${rel}`);
      assert.match(card, /tag=gta6heistguid-20/, `Missing tracking ID gta6heistguid-20 in .amz-card on ${rel}`);
      assert.match(card, /rel="sponsored nofollow noopener"/, `Missing rel="sponsored nofollow noopener" in .amz-card on ${rel}`);
    }
  }

  // Verify shared JS renderers have zero Wikimedia/SVG/unapproved Amazon images and zero fake stars
  const affJs = fs.readFileSync(path.join(PUBLIC_DIR, 'js', 'affiliates.js'), 'utf8');
  assert.doesNotMatch(affJs, /\/assets\/gear-photos\//, 'affiliates.js must not reference Wikimedia gear-photos');
  assert.doesNotMatch(affJs, /\/assets\/gear-illustrations\//, 'affiliates.js must not reference SVG gear-illustrations');

  const mainJs = fs.readFileSync(path.join(PUBLIC_DIR, 'assets', 'main.js'), 'utf8');
  const dealBlock = mainJs.slice(mainJs.indexOf('DealRotator:'), mainJs.indexOf('currentIndex: 0'));
  assert.doesNotMatch(dealBlock, /★|18,500\+|6,200\+|21,000\+/, 'main.js DealRotator must not contain fabricated stars or buyer counts');
  assert.doesNotMatch(dealBlock, /dualsense-edge-controller\.jpg|samsung-990-pro\.jpg|dualsense-edge-cutout\.webp/, 'main.js DealRotator must not embed unapproved product images');

  const wdbJs = fs.readFileSync(path.join(PUBLIC_DIR, 'assets', 'js', 'world-db-engine.js'), 'utf8');
  assert.doesNotMatch(wdbJs, /\/assets\/gear\/samsung-990pro\.jpg/, 'world-db-engine.js must not embed unapproved product images');
});

test('GLOBAL-AMZ-04: Zero cross-product ASIN hijacks in site-config.js and zero Samsung 990 PRO links pointing to WD_BLACK B0C47ZX1WB', () => {
  const siteCfg = fs.readFileSync(path.join(PUBLIC_DIR, 'site-config.js'), 'utf8');
  assert.match(siteCfg, /enableAmazonProductPlacements:\s*false/, 'Homepage & paused placement switch must remain false');
  assert.doesNotMatch(siteCfg, /sn850p\|wd_black/i, 'site-config.js must never hijack WD_BLACK C50 links into SN850P');
  assert.match(siteCfg, /samsung990pro:\s*"https:\/\/www\.amazon\.com\/dp\/B0BHJDY57J\?tag=gta6heistguid-20"/, 'samsung990pro must map to B0BHJDY57J');

  const allHtml = walkHtml(PUBLIC_DIR);
  const badSamsungRe = /href="https:\/\/www\.amazon\.com\/dp\/B0C47ZX1WB\?tag=gta6heistguid-20"[^>]*>[^<]*Samsung\s+990\s+PRO/i;
  for (const fp of allHtml) {
    const html = fs.readFileSync(fp, 'utf8');
    assert.doesNotMatch(html, badSamsungRe, `Mismatched Samsung 990 PRO -> WD_BLACK ASIN found in ${path.relative(PUBLIC_DIR, fp)}`);
  }
});

test('GLOBAL-AMZ-05: Google AdSense preserved and non-Amazon partners untouched across affected pages', () => {
  for (const rel of ['gaming-gear/index.html', 'gta-6-settings/index.html', 'affiliates-gear.html', 'drops.html', 'cheats.html', 'secrets.html']) {
    const html = fs.readFileSync(path.join(PUBLIC_DIR, rel), 'utf8');
    assert.match(html, /ca-pub-9556158063903839/, `AdSense publisher tag missing on ${rel}`);
  }
  const affGear = fs.readFileSync(path.join(PUBLIC_DIR, 'affiliates-gear.html'), 'utf8');
  assert.match(affGear, /g2a\.com\/n\/reflink-4094b9aab5/, 'G2A partner link must remain untouched');
  assert.match(affGear, /exitlag\.com\/refer\/10386953/, 'ExitLag partner link must remain untouched');
});
