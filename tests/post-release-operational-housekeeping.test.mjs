import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {
  parseSiteConfigAmazonSettings,
  evaluateHomepageAmazonGuardrail,
} from '../scripts/seo-audit.mjs';

const ROOT = process.cwd();
const PUBLIC = path.join(ROOT, 'public');

function readText(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8');
}

function walkFiles(dir, exts, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['.git', 'node_modules', '.wrangler', 'seo_reports'].includes(ent.name)) continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walkFiles(p, exts, out);
    else if (exts.some((e) => ent.name.endsWith(e))) out.push(p);
  }
  return out;
}

const VALID_HOME_DISABLED = `
<section id="officialDealsBox" hidden data-amazon-placement-module="1">
  <div id="homeSetupPicks" data-aff-slot="home-setup-picks" hidden></div>
  <p>As an Amazon Associate I earn from qualifying purchases. Tracking ID: <code>gta6heistguid-20</code>.</p>
</section>`;

const VALID_HOME_ENABLED = `
<section id="officialDealsBox" data-amazon-placement-module="1">
  <article class="amz-card"><a href="https://www.amazon.com/dp/B0FY6X2XXY?tag=gta6heistguid-20" rel="sponsored nofollow noopener">A</a></article>
  <article class="amz-card"><a href="https://www.amazon.com/dp/B0F1HX3WXX?tag=gta6heistguid-20" rel="sponsored nofollow noopener">B</a></article>
  <article class="amz-card"><a href="https://www.amazon.com/dp/B00001P4ZH?tag=gta6heistguid-20" rel="sponsored nofollow noopener">C</a></article>
  <article class="amz-card"><a href="https://www.amazon.com/dp/B000AJIF4E?tag=gta6heistguid-20" rel="sponsored nofollow noopener">D</a></article>
  <p>As an Amazon Associate I earn from qualifying purchases.</p>
</section>`;

test('OPS-SEO-01 (Test A): enableAmazonProductPlacements=false passes on live repo files without false 4-card warning', () => {
  const res = evaluateHomepageAmazonGuardrail({
    siteConfigSource: readText('public/site-config.js'),
    homeHtml: readText('public/index.html'),
    settingsHtml: readText('public/gta-6-settings/index.html'),
    gearMasterRaw: readText('public/data/gear-products-master.json'),
  });
  assert.equal(res.enabled, false);
  assert.equal(res.amazonTag, 'gta6heistguid-20');
  assert.deepEqual(res.fatal, []);
  assert.deepEqual(res.warnings, []);
});

test('OPS-SEO-02 (Test B): enableAmazonProductPlacements=true enforces 4+ homepage Amazon placements', () => {
  const cfgTrue = `window.SITE_CONFIG = Object.freeze({ amazonTag: "gta6heistguid-20", enableAmazonProductPlacements: true });`;
  const passRes = evaluateHomepageAmazonGuardrail({
    siteConfigSource: cfgTrue,
    homeHtml: VALID_HOME_ENABLED,
  });
  assert.equal(passRes.enabled, true);
  assert.deepEqual(passRes.fatal, []);

  const failRes = evaluateHomepageAmazonGuardrail({
    siteConfigSource: cfgTrue,
    homeHtml: VALID_HOME_DISABLED,
  });
  assert.ok(
    failRes.fatal.some((msg) => /expected 4\+ Amazon affiliate references on homepage/i.test(msg)),
    `Expected fatal count error when enabled with <4 references, got: ${JSON.stringify(failRes.fatal)}`
  );
});

test('OPS-SEO-03: missing or invalid enableAmazonProductPlacements configuration fails closed', () => {
  const missingCfg = `window.SITE_CONFIG = Object.freeze({ amazonTag: "gta6heistguid-20" });`;
  const resMissing = evaluateHomepageAmazonGuardrail({
    siteConfigSource: missingCfg,
    homeHtml: VALID_HOME_DISABLED,
  });
  assert.ok(resMissing.fatal.some((m) => /Missing enableAmazonProductPlacements/i.test(m)));

  const invalidCfg = `window.SITE_CONFIG = Object.freeze({ amazonTag: "gta6heistguid-20", enableAmazonProductPlacements: "yes" });`;
  const resInvalid = evaluateHomepageAmazonGuardrail({
    siteConfigSource: invalidCfg,
    homeHtml: VALID_HOME_DISABLED,
  });
  assert.ok(resInvalid.fatal.some((m) => /Invalid enableAmazonProductPlacements/i.test(m)));

  const parsedEmpty = parseSiteConfigAmazonSettings('');
  assert.equal(parsedEmpty.valid, false);
});

test('OPS-SEO-04: unauthorized visible homepage placements when disabled are caught', () => {
  const cfgFalse = `window.SITE_CONFIG = Object.freeze({ amazonTag: "gta6heistguid-20", enableAmazonProductPlacements: false });`;
  const unhiddenModule = `<section data-amazon-placement-module="1"><article class="amz-card"></article><p>As an Amazon Associate I earn from qualifying purchases.</p></section>`;
  const res = evaluateHomepageAmazonGuardrail({
    siteConfigSource: cfgFalse,
    homeHtml: unhiddenModule,
  });
  assert.ok(res.fatal.some((m) => /Unauthorized visible homepage Amazon placement/i.test(m)));
});

test('OPS-SEO-05: missing affiliate disclosure and wrong affiliate destination / missing tag are caught', () => {
  const cfgTrue = `window.SITE_CONFIG = Object.freeze({ amazonTag: "gta6heistguid-20", enableAmazonProductPlacements: true });`;
  const noDisclosureHtml = VALID_HOME_ENABLED.replace(/As an Amazon Associate I earn from qualifying purchases\./i, '');
  const resNoDisc = evaluateHomepageAmazonGuardrail({
    siteConfigSource: cfgTrue,
    homeHtml: noDisclosureHtml,
  });
  assert.ok(resNoDisc.fatal.some((m) => /Missing required Amazon Associates disclosure/i.test(m)));

  const badDestHtml = VALID_HOME_ENABLED.replace(
    'https://www.amazon.com/dp/B0FY6X2XXY?tag=gta6heistguid-20',
    'https://evil-example.com/dp/B0FY6X2XXY?tag=gta6heistguid-20'
  );
  const resBadDest = evaluateHomepageAmazonGuardrail({
    siteConfigSource: cfgTrue,
    homeHtml: badDestHtml,
  });
  assert.ok(resBadDest.fatal.some((m) => /Invalid Amazon affiliate destination hostname/i.test(m)));

  const wrongTagHtml = VALID_HOME_ENABLED.replace(
    'https://www.amazon.com/dp/B0FY6X2XXY?tag=gta6heistguid-20',
    'https://www.amazon.com/dp/B0FY6X2XXY?tag=wrongtag-20'
  );
  const resWrongTag = evaluateHomepageAmazonGuardrail({
    siteConfigSource: cfgTrue,
    homeHtml: wrongTagHtml,
  });
  assert.ok(resWrongTag.fatal.some((m) => /missing expected tag/i.test(m)));
});

test('OPS-SEO-06: accidentally disabled dedicated Gaming Gear or Settings pages fail guardrail', () => {
  const cfgFalse = `window.SITE_CONFIG = Object.freeze({ amazonTag: "gta6heistguid-20", enableAmazonProductPlacements: false });`;
  const res = evaluateHomepageAmazonGuardrail({
    siteConfigSource: cfgFalse,
    homeHtml: VALID_HOME_DISABLED,
    gearMasterRaw: JSON.stringify({ products: [] }),
    settingsHtml: '<main><p>No cards</p></main>',
  });
  assert.ok(res.fatal.some((m) => /Dedicated Gaming Gear catalog unexpectedly low/i.test(m)));
  assert.ok(res.fatal.some((m) => /Dedicated Settings page Amazon cards unexpectedly low/i.test(m)));
  assert.ok(res.fatal.some((m) => /Missing Amazon Associates disclosure on \/gta-6-settings\//i.test(m)));
});

test('OPS-CFG-01: unused nova7p and nova7x keys are removed cleanly while remaining config and safe hydration stay intact', () => {
  const siteConfigSrc = readText('public/site-config.js');
  assert.ok(!/\bnova7p\b/i.test(siteConfigSrc), 'nova7p must be removed from public/site-config.js');
  assert.ok(!/\bnova7x\b/i.test(siteConfigSrc), 'nova7x must be removed from public/site-config.js');

  // Verify zero remaining references in tracked code/HTML/JSON across public/, functions/, scripts/
  const codeFiles = [
    ...walkFiles(PUBLIC, ['.html', '.js', '.mjs', '.json']),
    ...walkFiles(path.join(ROOT, 'functions'), ['.js', '.mjs']),
  ];
  for (const f of codeFiles) {
    const txt = fs.readFileSync(f, 'utf8');
    assert.ok(!/\bnova7[px]\b/i.test(txt), `Unexpected residual nova7p/nova7x reference in ${path.relative(ROOT, f)}`);
  }

  // Execute public/site-config.js in a minimal DOM sandbox to test runtime loading & missing optional key safety
  const missingKeyAnchor = {
    attrs: { 'data-amazon-link': 'nova7p', href: 'https://www.amazon.com/dp/B0BDGMNF6V?tag=gta6heistguid-20' },
    href: 'https://www.amazon.com/dp/B0BDGMNF6V?tag=gta6heistguid-20',
    getAttribute(k) { return this.attrs[k] || null; },
  };
  const validKeyAnchor = {
    attrs: { 'data-amazon-link': 'hyperxStinger2Core', href: '#' },
    href: '#',
    getAttribute(k) { return this.attrs[k] || null; },
  };
  const sandbox = {
    window: {
      location: { origin: 'https://www.gta6heistguide.com', pathname: '/gaming-gear/', href: 'https://www.gta6heistguide.com/gaming-gear/' },
      navigator: {},
      matchMedia: () => ({ matches: false }),
      localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
    },
    document: {
      readyState: 'complete',
      referrer: '',
      title: 'Gaming Gear',
      head: { appendChild: () => {} },
      querySelector: () => null,
      querySelectorAll(sel) {
        if (sel === '[data-amazon-link]') return [missingKeyAnchor, validKeyAnchor];
        return [];
      },
      getElementById: () => null,
      addEventListener: () => {},
      createElement: () => ({ setAttribute: () => {} }),
    },
    localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
    URL,
    URLSearchParams,
    Date,
    setTimeout: () => 0,
    setInterval: () => 0,
    clearTimeout: () => {},
  };
  sandbox.globalThis = sandbox.window;
  vm.runInNewContext(siteConfigSrc, sandbox);

  const cfg = sandbox.window.SITE_CONFIG;
  assert.ok(cfg && cfg.amazonLinks, 'SITE_CONFIG.amazonLinks must load');
  assert.equal(cfg.amazonLinks.nova7p, undefined);
  assert.equal(cfg.amazonLinks.nova7x, undefined);
  assert.equal(cfg.enableAmazonProductPlacements, false);
  assert.equal(cfg.amazonLinks.hyperxStinger2Core, 'https://www.amazon.com/dp/B0BDGMNF6V?tag=gta6heistguid-20');
  assert.equal(cfg.amazonLinks.turtleBeachRecon70, 'https://www.amazon.com/dp/B0CWS6WV23?tag=gta6heistguid-20');
  // Valid key hydrated, missing optional key left safely untouched without throwing
  assert.equal(validKeyAnchor.href, 'https://www.amazon.com/dp/B0BDGMNF6V?tag=gta6heistguid-20');
  assert.equal(missingKeyAnchor.href, 'https://www.amazon.com/dp/B0BDGMNF6V?tag=gta6heistguid-20');

  // Verify Gaming Gear master catalog & 6 Leonida Drop rotations remain intact
  const gearCatalog = JSON.parse(readText('public/data/gear-products-master.json'));
  const activeProducts = gearCatalog.products.filter((p) => p.active !== false);
  assert.equal(activeProducts.length, 50);
  assert.equal(gearCatalog.leonidaDropCollections.length, 6);
});
