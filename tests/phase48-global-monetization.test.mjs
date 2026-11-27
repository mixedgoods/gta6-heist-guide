import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  sanitizeExportObject,
  renderMonthlyScorecardMarkdown,
} from '../scripts/generate-monetization-scorecard.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT, 'public');

function walkHtml(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkHtml(full, out);
    else if (entry.name.toLowerCase().endsWith('.html')) {
      out.push(path.relative(PUBLIC_DIR, full).replace(/\\/g, '/'));
    }
  }
  return out.sort();
}

const ALL_HTML = walkHtml(PUBLIC_DIR);

test('P48-ADS-01: ads.txt is valid, matches ca-pub-9556158063903839, and has no duplicate/conflicting records', () => {
  const adsTxt = fs.readFileSync(path.join(PUBLIC_DIR, 'ads.txt'), 'utf8');
  const lines = adsTxt
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#'));

  assert.equal(lines.length, 1, 'Expected exactly one authorized seller record in ads.txt');
  assert.equal(
    lines[0],
    'google.com, pub-9556158063903839, DIRECT, f08c47fec0942fa0',
    'ads.txt must match verified Google AdSense publisher record'
  );
  assert.doesNotMatch(adsTxt, /gta6heistguid-20|exitlag|g2a|gumroad/i, 'No affiliate IDs allowed in ads.txt');
});

test('P48-ADS-02: zero fabricated data-ad-slot IDs, zero duplicate AdSense scripts, and zero manual ad units in protected routes', () => {
  const fabricatedSlots = [];
  const duplicateScripts = [];
  const wrongPubIds = [];

  for (const rel of ALL_HTML) {
    const html = fs.readFileSync(path.join(PUBLIC_DIR, rel), 'utf8');

    const slotMatches = [...html.matchAll(/data-ad-slot\s*=\s*["']([^"']*)["']/gi)];
    for (const m of slotMatches) {
      if (!/^\d{6,}$/.test(m[1].trim())) {
        fabricatedSlots.push(`${rel}: ${m[1]}`);
      }
    }

    const scriptMatches = html.match(/<script\b[^>]*googlesyndication\.com[^>]*>/gi) || [];
    if (scriptMatches.length > 1) {
      duplicateScripts.push(`${rel} (${scriptMatches.length})`);
    }

    const pubMatches = html.match(/ca-pub-\d+/gi) || [];
    for (const p of pubMatches) {
      if (p !== 'ca-pub-9556158063903839') {
        wrongPubIds.push(`${rel}: ${p}`);
      }
    }
  }

  assert.deepEqual(fabricatedSlots, [], `Fabricated data-ad-slot attributes found: ${fabricatedSlots.join(', ')}`);
  assert.deepEqual(duplicateScripts, [], `Duplicate AdSense scripts found: ${duplicateScripts.join(', ')}`);
  assert.deepEqual(wrongPubIds, [], `Conflicting publisher IDs found: ${wrongPubIds.join(', ')}`);

  // Protected interactive routes must have zero <ins class="adsbygoogle"> containers
  for (const rel of ['map.html', 'my-leonida/index.html', 'heist-payout-calculator.html', 'community-discoveries/submit/index.html']) {
    const p = path.join(PUBLIC_DIR, rel);
    if (!fs.existsSync(p)) continue;
    const html = fs.readFileSync(p, 'utf8');
    assert.doesNotMatch(html, /<ins\b[^>]*adsbygoogle/i, `Protected route ${rel} must not embed manual AdSense <ins>`);
  }
});

test('P48-AFF-01: Phase 35.1C homepage guardrail preserved, valid Amazon tags & rel=sponsored, zero unapproved partner links', () => {
  const siteConfig = fs.readFileSync(path.join(PUBLIC_DIR, 'site-config.js'), 'utf8');
  assert.match(siteConfig, /enableAmazonProductPlacements:\s*false/, 'Phase 35.1C enableAmazonProductPlacements: false must remain intact');
  assert.match(siteConfig, /ga4MeasurementId:\s*["']G-DG7REYHR80["']/, 'GA4 Measurement ID G-DG7REYHR80 must remain intact');
  assert.match(siteConfig, /adsensePublisherId:\s*["']ca-pub-9556158063903839["']/, 'AdSense publisher ID must remain intact');
  assert.match(siteConfig, /ad_storage:\s*['"]denied['"]/, 'Consent Mode v2 defaults must remain intact');

  const badAmazonTag = [];
  const missingRelSponsored = [];
  const unapprovedPartnerLinks = [];
  const UNAPPROVED_RE = /https?:\/\/[^"'\s]*(?:eneba\.com\/[^\s"']*ref|logitech\.sjv\.io|razer\.a9yw\.net|dpbolvw\.net|kqzyfj\.com|tkqlhce\.com|anrdoezrs\.net|click\.linksynergy\.com|awin1\.com\/cread)/i;

  for (const rel of ALL_HTML) {
    const html = fs.readFileSync(path.join(PUBLIC_DIR, rel), 'utf8');
    for (const m of html.matchAll(/<a\b([^>]*)>/gi)) {
      const attrs = m[1];
      const hm = attrs.match(/href\s*=\s*["']([^"']+)["']/i);
      if (!hm) continue;
      const href = hm[1];
      const rm = attrs.match(/rel\s*=\s*["']([^"']+)["']/i);
      const relVal = (rm ? rm[1] : '').toLowerCase();

      if (/amazon\.com/i.test(href)) {
        if (!/[?&]tag=gta6heistguid-20(?:&|$)/i.test(href)) {
          badAmazonTag.push(`${rel}: ${href}`);
        }
        if (!relVal.includes('sponsored')) {
          missingRelSponsored.push(`${rel}: ${href}`);
        }
      } else if (/(?:g2a\.com\/n\/|exitlag\.com\/refer\/|gumroad\.com\/l\/)/i.test(href)) {
        if (!relVal.includes('sponsored')) {
          missingRelSponsored.push(`${rel}: ${href}`);
        }
      }
      if (UNAPPROVED_RE.test(href)) {
        unapprovedPartnerLinks.push(`${rel}: ${href}`);
      }
    }
  }

  assert.deepEqual(badAmazonTag, [], `Amazon links with missing/wrong tag: ${badAmazonTag.join(', ')}`);
  assert.deepEqual(missingRelSponsored, [], `Affiliate links missing rel="sponsored": ${missingRelSponsored.join(', ')}`);
  assert.deepEqual(unapprovedPartnerLinks, [], `Unapproved affiliate partner links found: ${unapprovedPartnerLinks.join(', ')}`);
});

test('P48-AFF-02: GA4 affiliate_click payload includes Phase 48 non-PII parameters in main.js and affiliates.js', () => {
  const mainJs = fs.readFileSync(path.join(PUBLIC_DIR, 'assets', 'main.js'), 'utf8');
  const affJs = fs.readFileSync(path.join(PUBLIC_DIR, 'js', 'affiliates.js'), 'utf8');

  for (const [label, src] of [['main.js', mainJs], ['affiliates.js', affJs]]) {
    for (const key of ['affiliate_program', 'partner_name', 'product_id', 'asin', 'category', 'page_path', 'placement', 'destination_hostname', 'collection_id', 'feature_position']) {
      assert.ok(src.includes(key), `${label} must include non-PII affiliate_click parameter: ${key}`);
    }
  }
});

test('P48-COMPLIANCE-01: Legal disclosures, Sponsorship Prospectus (/acquisitions), and contextual /gaming-gear/ links are accurate', () => {
  const terms = fs.readFileSync(path.join(PUBLIC_DIR, 'terms.html'), 'utf8');
  const about = fs.readFileSync(path.join(PUBLIC_DIR, 'about.html'), 'utf8');
  const acq = fs.readFileSync(path.join(PUBLIC_DIR, 'acquisitions.html'), 'utf8');

  assert.ok(terms.includes('As an Amazon Associate I earn from qualifying purchases'), 'terms.html must include exact Amazon Associate statement');
  assert.ok(about.includes('As an Amazon Associate I earn from qualifying purchases'), 'about.html must include exact Amazon Associate statement');
  assert.doesNotMatch(about, /Category Illustrations/i, 'about.html must not contain stale Category Illustrations claim');

  // Sponsorship prospectus accuracy checks
  assert.ok(acq.includes('/api/contact'), 'acquisitions.html must wire working /api/contact form');
  assert.ok(acq.includes('inquiries@gta6heistguide.com'), 'acquisitions.html must include owner email');
  assert.ok(acq.includes('rel=&quot;sponsored&quot;') || acq.includes('rel="sponsored"'), 'acquisitions.html must state rel="sponsored" disclosure standard');
  assert.doesNotMatch(acq, /14 official operatives|\$10,000 - \$35,000|pre-launch gaming brand sponsorships/i, 'acquisitions.html must not contain outdated claims or pricing anchors');

  // Contextual /gaming-gear/ internal links on high-intent pages
  for (const rel of ['gta-6-settings/index.html', 'gta-6-controls/index.html', 'gta-6-troubleshooting/index.html', 'live.html', 'radio.html']) {
    const html = fs.readFileSync(path.join(PUBLIC_DIR, rel), 'utf8');
    const mainMatch = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i);
    assert.ok(mainMatch, `${rel} must contain <main>`);
    assert.ok(mainMatch[1].includes('/gaming-gear/'), `${rel} must include a contextual body link to /gaming-gear/`);
  }
});

test('P48-SCORECARD-01: Monthly scorecard generator strips secrets and separates estimated vs finalized revenue', () => {
  const dirty = {
    period: '2026-11',
    api_key: 'secret-should-be-dropped',
    tax_id: '00-0000000',
    adsense: {
      siteStatus: 'Getting ready',
      estimatedEarningsUsd: 0,
      finalizedEarningsUsd: null,
      pageViews: 0,
      impressions: 0,
      bankAccountNumber: '123456',
    },
    affiliates: [
      { partner: 'Amazon Associates', clicks: 82, confirmedOrders: 0, conversionRatePct: 0, confirmedCommissionsUsd: 0 },
    ],
    sponsorships: { inquiries: 0, activeAgreements: 0, paidRevenueUsd: 0 },
    traffic: { activeUsers: 93, sessions: 108, pageViews: 236, gscClicks: 203, gscImpressions: 22476 },
  };
  const clean = sanitizeExportObject(dirty);
  assert.equal('api_key' in clean, false);
  assert.equal('tax_id' in clean, false);
  assert.equal('bankAccountNumber' in clean.adsense, false);

  const md = renderMonthlyScorecardMarkdown(dirty);
  assert.ok(md.includes('Estimated (unfinalized)'), 'Must label estimated AdSense earnings clearly');
  assert.ok(md.includes('Finalized Payments (USD) | Unavailable'), 'Must mark missing finalized payments as Unavailable');
  assert.ok(md.includes('Amazon Associates | 82 | 0 | 0.00% | $0.00 | $0.00'));
  assert.doesNotMatch(md, /secret-should-be-dropped|00-0000000|123456/);
});
