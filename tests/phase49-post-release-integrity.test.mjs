import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const ROOT = process.cwd();
const PUBLIC = path.join(ROOT, 'public');

function readText(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8');
}

function walkFiles(dir, exts, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walkFiles(p, exts, out);
    else if (exts.some(e => ent.name.endsWith(e))) out.push(p);
  }
  return out;
}

test('P49-CANON-01: canonical-gameplay-facts.json exists, is valid, and uses strict 5-tier classification', () => {
  const facts = JSON.parse(readText('public/data/canonical-gameplay-facts.json'));
  assert.equal(facts.lastVerified, '2026-11-27');
  assert.equal(facts.platformAndModeScope.onlineStatus.live, false);
  assert.equal(facts.platformAndModeScope.onlineStatus.releaseDateAnnounced, false);
  assert.equal(facts.latestPatch.ps5Version, '01.002.002');
  assert.equal(facts.latestPatch.xboxVersion, '1.0.2.2');
  assert.equal(facts.latestPatch.confirmedOfficialFixes.length, 7);
  assert.equal(facts.robberiesAndHeists['jewelry-stores'].minPayout, 10000);
  assert.equal(facts.robberiesAndHeists['jewelry-stores'].maxPayout, 25000);
  assert.equal(facts.robberiesAndHeists['jewelry-stores'].completionTimeVerified, false);
  assert.equal(facts.storyModeMoneyMilestones.sectionTitle, '10 Story-Mode Money Milestones');
  assert.equal(facts.storyModeMoneyMilestones.combinedListedPayout, 531420);
  const sum = facts.storyModeMoneyMilestones.entries.reduce((acc, e) => acc + e.payout, 0);
  assert.equal(sum, 531420, 'Sum of 10 listed milestones must equal 531420');
  const opSavage = facts.storyModeMoneyMilestones.entries.find(e => e.url === '/missions/operation-savage-glory');
  assert.ok(opSavage, 'Operation Savage Glory must link to /missions/operation-savage-glory');
  assert.equal(opSavage.payout, 50000);
});

test('P49-PLANNER-01: Heist Planner, Payout Calculator & Free Tools separate Story Mode from hypothetical Online', () => {
  for (const rel of ['public/heist-planner.html', 'public/heist-payout-calculator.html']) {
    const html = readText(rel);
    assert.ok(!/Player Squad Size \(Co-op\)/i.test(html), `${rel} must not show co-op squad size in Story Mode`);
    assert.ok(!/Public Lobby Restart \/ Fail Penalty/i.test(html), `${rel} must not show public lobby fail penalty in Story Mode`);
    assert.ok(!/Apply 1\.5X Weekly Featured Vault Bonus/i.test(html), `${rel} must not show active 1.5X weekly bonus in Story Mode`);
    assert.ok(!/LFG crew finder/i.test(html), `${rel} must not contain pre-launch LFG crew finder schema claims`);
    assert.ok(!/valuePerBag:\s*4200000|valuePerBag:\s*5100000/.test(html), `${rel} must not contain fictional multi-million bag values`);
    assert.ok(/id="hypotheticalOnlineSandbox"/.test(html), `${rel} must isolate speculative Online concepts in hypotheticalOnlineSandbox`);
    assert.ok(/Hypothetical Future GTA VI Online Concept Sandbox/.test(html), `${rel} must clearly label hypothetical sandbox`);
    assert.ok(!/id="hypotheticalOnlineSandbox"[^>]*\bopen\b/i.test(html), `${rel} hypothetical sandbox must be collapsed by default`);
    assert.ok(/operation-savage-glory/.test(html), `${rel} must include Operation Savage Glory`);
    assert.ok(!/Coast Guard Offshore Heist/i.test(html), `${rel} must rename Coast Guard Offshore Heist`);
  }
  const freeHtml = readText('public/free/index.html');
  assert.ok(!/1\.5X Weekly Featured Vault Multiplier/i.test(freeHtml), 'free/index.html must not expose 1.5X weekly multiplier');
  assert.ok(!/Squad Size \(Co-Op\)/i.test(freeHtml), 'free/index.html must not expose co-op squad size');
  assert.ok(!/\$26,250,000|\$18,112,500/.test(freeHtml), 'free/index.html must not contain fictional pre-launch SSR totals');
});

test('P49-JEWELRY-01: Zero uncorroborated $15,000-$35,000 jewelry store payouts remain on indexable pages or active data', () => {
  const files = walkFiles(PUBLIC, ['.html', '.js', '.json']);
  const offenders = [];
  for (const f of files) {
    const rel = path.relative(ROOT, f).replace(/\\/g, '/');
    const txt = fs.readFileSync(f, 'utf8');
    if (f.endsWith('.html') && /<meta\s+name=["']robots["'][^>]*noindex/i.test(txt)) continue;
    if (/15,?000.{0,18}35,?000|\$15K.{0,12}\$35K|15k.{0,10}35k/i.test(txt)) {
      offenders.push(rel);
    }
  }
  assert.deepEqual(offenders, [], `Found stale $15K-$35K jewelry store payouts in: ${offenders.join(', ')}`);

  const moneyGuide = readText('public/gta-6-money-guide/index.html');
  assert.ok(!/prepMins:\s*11\b/.test(moneyGuide), 'Unverified 11-minute jewelry store prepMins must be removed');
  assert.ok(/\$10,000\s*&ndash;\s*\$25,000/.test(moneyGuide), 'Money Guide must show canonical $10,000–$25,000 jewelry range');
});

test('P49-STORY-01: Story Money Milestones renamed, $531,420 accurately described, Operation Savage Glory linked', () => {
  for (const rel of ['public/gta-6-money-guide/index.html', 'public/index.html']) {
    const html = readText(rel);
    assert.ok(!/All 10 (Real GTA 6 )?Story Heists/i.test(html), `${rel} must not title section "All 10 Story Heists"`);
    assert.ok(!/Total Story Score:\s*\$531,420/i.test(html), `${rel} must not call $531,420 "Total Story Score"`);
    assert.ok(/10 Story-Mode Money Milestones/.test(html), `${rel} must use accurate section title`);
    assert.ok(/Operation Savage Glory \(Coast Guard Raid\)/.test(html), `${rel} must rename Coast Guard Heist`);
    assert.ok(/href="\/missions\/operation-savage-glory"/.test(html), `${rel} must link directly to /missions/operation-savage-glory`);
    assert.ok(!/<td><strong>Coast Guard Heist<\/strong><\/td>|Coast Guard Heist<\/td>/.test(html), `${rel} must not retain unlinked Coast Guard Heist`);
  }
  assert.ok(fs.existsSync(path.join(PUBLIC, 'missions/operation-savage-glory.html')), 'Dedicated Operation Savage Glory walkthrough must be preserved');
});

test('P49-PATCH-01: Nov 23 Update 01.002.002 / 1.0.2.2 and Apollo Aggregates exploit status are consistent and classified', () => {
  const status = JSON.parse(readText('public/data/site-status.json'));
  assert.equal(status.lastVerified, '2026-11-27');
  assert.equal(status.build.confirmedOnSite, '01.002.002');
  assert.equal(status.build.officialPatchNotesPublished, true);

  const glitches = JSON.parse(readText('public/data/glitches.json'));
  const glitchItems = glitches.items.filter(i => i.type === 'glitch');
  assert.ok(glitchItems.length >= 6);
  for (const g of glitchItems) {
    assert.ok(g.status, `${g.id} missing status`);
    assert.ok(g.evidenceClassification, `${g.id} missing evidenceClassification`);
    assert.equal(g.lastVerifiedDate, '2026-11-27', `${g.id} missing updated lastVerifiedDate`);
    assert.ok(g.officialPatchNotesNote, `${g.id} missing officialPatchNotesNote separating official notes from community reports`);
  }
  const apollo = glitchItems.find(g => g.id === 'glitch-apollo-red-barn');
  assert.equal(apollo.evidenceClassification, 'Community-reported');
  assert.notEqual(apollo.status, 'Confirmed Working', 'Apollo loop must not claim unverified post-patch Confirmed Working without direct test');

  const tsHtml = readText('public/gta-6-troubleshooting/index.html');
  assert.ok(!/reported on November 23, 2026 with no official patch notes/i.test(tsHtml), 'Troubleshooting page must not contradict itself about Nov 23 official patch notes');
});

test('P49-MAPPINS-01: map-pins.json preserves all 185 pins and contains zero fabricated million-dollar payouts', () => {
  const mp = JSON.parse(readText('public/data/map-pins.json'));
  assert.equal(mp.pins.length, 185);
  assert.equal(mp.total_pins, 185);
  const inflated = mp.pins.filter(p => p.payout && /\$([3-9]\d{2},000|\d+,\d{3},\d{3})/.test(p.payout));
  assert.deepEqual(inflated.map(p => `${p.id}:${p.payout}`), [], 'map-pins.json must not retain fabricated pre-launch million-dollar/inflated payouts');
  const jewPin = mp.pins.find(p => p.id === 'heist-jewelry');
  assert.ok(/\$10,000–\$25,000/.test(jewPin.payout), 'heist-jewelry pin must match canonical $10,000–$25,000 range');
});

test('P49-README-01: Root README.md is accurate, Story Mode scoped, and free of fictional payouts or secrets', () => {
  const readme = readText('README.md');
  assert.ok(!/25,000,000|14,500,000|37,500,000|1\.5X Weekly Bonus|LFG Squad Finder|Eneba Global Store|Lobby DDoS Protection/i.test(readme), 'README must not retain fictional pre-launch payouts, LFG, or Eneba claims');
  assert.ok(!/cd-admin|syndicateadmin|CF_API_TOKEN|PRIVATE|POST-RELEASE-INTEGRITY-AUDIT/i.test(readme), 'README must not expose admin routes, secrets, or internal reports');
  assert.ok(/PlayStation 5.*Xbox Series X\|S/i.test(readme), 'README must reflect real PS5 & Xbox Series X|S scope');
  assert.ok(/not affiliated with, endorsed by, sponsored by/i.test(readme), 'README must include independent fan-site disclaimer');
  assert.ok(/gta6heistguid-20/.test(readme), 'README must disclose Amazon Associates tag accurately');
  assert.ok(/https:\/\/www\.gta6heistguide\.com\/heist-planner/.test(readme));
  assert.ok(/https:\/\/www\.gta6heistguide\.com\/missions\/operation-savage-glory/.test(readme));
});

test('P49-SITEMAP-01: Sitemap has exact 502 canonical indexable URLs, fresh lastmod for modified pages, and no blind stamping', () => {
  const xml = readText('public/sitemap.xml');
  const blocks = [...xml.matchAll(/<url>\s*<loc>([^<]+)<\/loc>\s*<lastmod>([^<]+)<\/lastmod>[\s\S]*?<\/url>/g)];
  assert.equal(blocks.length, 502, 'Canonical sitemap URL inventory must stay at 502');

  const redirects = new Set(
    readText('public/_redirects')
      .split(/\r?\n/)
      .map(l => l.trim())
      .filter(l => l && !l.startsWith('#'))
      .map(l => l.split(/\s+/)[0])
  );

  const map = new Map();
  const dateCounts = {};
  for (const m of blocks) {
    const loc = m[1];
    const lastmod = m[2];
    map.set(loc, lastmod);
    dateCounts[lastmod] = (dateCounts[lastmod] || 0) + 1;
    const pathname = loc.replace(/^https:\/\/www\.gta6heistguide\.com/, '') || '/';
    assert.ok(!redirects.has(pathname), `Redirect route ${pathname} must not appear in sitemap.xml`);
  }

  // Ensure we did NOT blindly stamp all 502 URLs with 2026-11-27
  assert.ok((dateCounts['2026-11-27'] || 0) < 100, 'Sitemap must not blindly stamp all URLs to today');
  assert.ok((dateCounts['2026-11-24'] || 0) > 400, 'Untouched pages must retain original lastmod dates');

  // Verify every canonical page modified in Phase 47/48/49 has fresh lastmod >= 2026-11-26
  const requiredFresh = [
    'https://www.gta6heistguide.com/',
    'https://www.gta6heistguide.com/gaming-gear/',
    'https://www.gta6heistguide.com/gta-6-settings/',
    'https://www.gta6heistguide.com/heist-planner',
    'https://www.gta6heistguide.com/heist-payout-calculator',
    'https://www.gta6heistguide.com/gta-6-money-guide/',
    'https://www.gta6heistguide.com/heists/jewelry-stores',
    'https://www.gta6heistguide.com/heists/pawn-shops',
    'https://www.gta6heistguide.com/gta-6-glitches/',
    'https://www.gta6heistguide.com/gta-6-troubleshooting/',
    'https://www.gta6heistguide.com/guides/apollo-aggregates-red-barn-money-loop',
    'https://www.gta6heistguide.com/locations/apollo-aggregates-red-barn',
    'https://www.gta6heistguide.com/about',
    'https://www.gta6heistguide.com/contact',
    'https://www.gta6heistguide.com/privacy-policy',
    'https://www.gta6heistguide.com/terms',
    'https://www.gta6heistguide.com/cheats',
    'https://www.gta6heistguide.com/free/',
    'https://www.gta6heistguide.com/live',
    'https://www.gta6heistguide.com/radio',
    'https://www.gta6heistguide.com/gta-6-controls/',
    'https://www.gta6heistguide.com/map'
  ];
  for (const url of requiredFresh) {
    const d = map.get(url);
    assert.ok(d && d >= '2026-11-26', `Modified canonical URL ${url} has stale lastmod: ${d}`);
  }

  // Regression check: any HTML file modified vs production baseline (e3a02b3) whose canonical is in sitemap.xml MUST have lastmod >= 2026-11-27
  let changed = [];
  try {
    changed = execSync('git diff --name-only e3a02b3 -- public/', { cwd: ROOT, encoding: 'utf8' })
      .split(/\r?\n/)
      .filter(f => f.endsWith('.html'));
  } catch {
    changed = [];
  }
  for (const rel of changed) {
    const full = path.join(ROOT, rel);
    if (!fs.existsSync(full)) continue;
    const html = fs.readFileSync(full, 'utf8');
    if (/<meta\s+name=["']robots["'][^>]*noindex/i.test(html)) continue;
    const canonM = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i);
    if (canonM && map.has(canonM[1])) {
      assert.ok(map.get(canonM[1]) >= '2026-11-27', `Newly edited canonical page ${canonM[1]} (${rel}) has stale sitemap lastmod: ${map.get(canonM[1])}`);
    }
  }
});
