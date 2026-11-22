#!/usr/bin/env node
/**
 * GTA6HeistGuide.com — Automated GTA VI Cheat Discovery & Verification Sync
 *
 * Monitors official & reputable GTA VI sources for new cheat codes and:
 * - Auto-promotes ONLY genuinely verified entries (OFFICIALLY CONFIRMED or VERIFIED IN-GAME)
 *   that include a confirmed button combination or phone code (never invented).
 * - Stages COMMUNITY VERIFYING / UNCONFIRMED discoveries into public/data/cheats-pending.json
 *   for manual editorial review (never counted in published totals).
 * - Deduplicates strictly by normalized name, slug, and button/phone code.
 * - Enforces strict non-destructive invariants: never deletes existing cheats or alters
 *   existing stable IDs when an external feed temporarily disappears.
 * - Zero-change safe: writes disk only when meaningful content changes.
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const PUBLIC_CHEATS_PATH = path.join(ROOT_DIR, 'public', 'data', 'cheats.json');
const MIRROR_CHEATS_PATH = path.join(ROOT_DIR, 'data', 'cheats.json');
const PENDING_CHEATS_PATH = path.join(ROOT_DIR, 'public', 'data', 'cheats-pending.json');

const VALID_CLASSIFICATIONS = new Set([
  'OFFICIALLY CONFIRMED',
  'VERIFIED IN-GAME',
  'COMMUNITY VERIFYING',
  'UNCONFIRMED',
]);

const AUTO_PUBLISH_STATUSES = new Set([
  'OFFICIALLY CONFIRMED',
  'VERIFIED IN-GAME',
]);

const VALID_CATS = new Set(['player', 'world', 'vehicle', 'weapon']);

const REPUTABLE_DOMAINS = [
  'rockstargames.com',
  'gta.fandom.com',
  'ign.com',
  'gamespot.com',
  'eurogamer.net',
  'polygon.com',
  'gamesradar.com',
  'powerpyx.com',
  'gtabase.com',
  'pushsquare.com',
  'purexbox.com',
];

const DEFAULT_FEEDS = [
  {
    name: 'Google News GTA VI Cheats',
    url: 'https://news.google.com/rss/search?q=%22GTA+6%22+OR+%22GTA+VI%22+%22cheat+code%22+OR+%22cheat+codes%22&hl=en-US&gl=US&ceid=US:en',
    kind: 'rss',
  },
];

const GTA_WIKI_CHEATS_API =
  'https://gta.fandom.com/api.php?action=parse&page=Cheats_in_GTA_VI&prop=wikitext&format=json&redirects=1';

function parseArgs(argv) {
  const opts = { dryRun: false, feedFile: null, skipWiki: false, timeoutMs: 12000 };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--dry-run') opts.dryRun = true;
    else if (a === '--skip-wiki') opts.skipWiki = true;
    else if (a === '--feed-file' && argv[i + 1]) opts.feedFile = argv[++i];
    else if (a === '--timeout-ms' && argv[i + 1]) opts.timeoutMs = Number(argv[++i]) || 12000;
  }
  return opts;
}

function cleanText(s) {
  return String(s || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeKey(name) {
  return cleanText(name)
    .toLowerCase()
    .replace(/['’`]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function slugify(name) {
  return 'cheat-' + normalizeKey(name).replace(/\s+/g, '-');
}

function isReputableSourceUrl(url) {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return REPUTABLE_DOMAINS.some((d) => host === d || host.endsWith('.' + d));
  } catch {
    return false;
  }
}

function loadJsonSafely(filePath, fallback) {
  if (!fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function atomicWriteJson(filePath, data) {
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
  const tmp = `${filePath}.tmp.${process.pid}`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2) + '\n', 'utf-8');
  fs.renameSync(tmp, filePath);
}

function stripVolatile(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  const clone = JSON.parse(JSON.stringify(obj));
  delete clone.updated;
  return clone;
}

function syncHtmlCheatCounts(cheatsPayload) {
  const count = Array.isArray(cheatsPayload?.items) ? cheatsPayload.items.length : 0;
  if (count <= 0) return;
  const htmlTargets = [
    path.join(ROOT_DIR, 'public', 'cheats.html'),
    path.join(ROOT_DIR, 'public', 'index.html'),
    path.join(ROOT_DIR, 'public', 'gta-6-tools', 'index.html'),
    path.join(ROOT_DIR, 'public', 'live-intel.html'),
  ];
  for (const fp of htmlTargets) {
    if (!fs.existsSync(fp)) continue;
    const raw = fs.readFileSync(fp, 'utf-8');
    let next = raw.replace(
      /(<span[^>]*\bdata-cheat-count\b[^>]*>)\d+(<\/span>)/gi,
      `$1${count}$2`
    );
    if (next !== raw) {
      fs.writeFileSync(fp, next, 'utf-8');
    }
  }
}

async function fetchWithTimeout(url, timeoutMs) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: {
        'User-Agent': 'GTA6HeistGuide-CheatSync/1.0 (+https://www.gta6heistguide.com)',
        Accept: 'application/json, application/xml, text/xml, */*',
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } finally {
    clearTimeout(t);
  }
}

function parseButtonCombo(raw) {
  if (Array.isArray(raw)) {
    return raw.map((x) => cleanText(x)).filter(Boolean);
  }
  const s = cleanText(raw);
  if (!s) return [];
  return s.split(/[\s,]+/).filter(Boolean);
}

function parseRssCandidates(xml, sourceName) {
  const out = [];
  const itemRx = /<item>([\s\S]*?)<\/item>/gi;
  let m;
  while ((m = itemRx.exec(xml)) !== null) {
    const block = m[1];
    const titleM = block.match(/<title>([\s\S]*?)<\/title>/i);
    const linkM = block.match(/<link>([\s\S]*?)<\/link>/i);
    const pubM = block.match(/<pubDate>([\s\S]*?)<\/pubDate>/i);
    const title = cleanText(titleM ? titleM[1].replace(/<!\[CDATA\[|\]\]>/g, '') : '');
    const link = cleanText(linkM ? linkM[1] : '');
    if (!title || !/gta\s*(6|vi)/i.test(title) || !/cheat/i.test(title)) continue;
    // RSS headlines alone are never auto-published — always staged as UNCONFIRMED
    out.push({
      name: title.slice(0, 110),
      platform: 'PS5 / Xbox Series X|S',
      buttonCombo: null,
      phoneCode: null,
      effect: 'Potential GTA VI cheat reported in news feed — requires manual verification of exact code and in-game effect.',
      unlockRequirements: 'Pending verification',
      source: sourceName,
      sourceUrl: link || 'https://www.rockstargames.com/VI',
      discoveryDate: pubM ? new Date(pubM[1]).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
      verificationStatus: 'UNCONFIRMED',
      cat: 'player',
    });
  }
  return out;
}

async function fetchWikiCheatCandidates(timeoutMs) {
  const raw = await fetchWithTimeout(GTA_WIKI_CHEATS_API, timeoutMs);
  const data = JSON.parse(raw);
  const wikitext = data?.parse?.wikitext?.['*'] || '';
  if (!wikitext) return [];
  const out = [];
  // Conservative parser: only extracts explicit wiki table rows with a cheat name;
  // stages them as COMMUNITY VERIFYING so no unverified wiki edit auto-publishes.
  const rowRx = /^\|\s*([^|\n]{3,60})\s*\|\|\s*([^|\n]{3,160})/gm;
  let m;
  while ((m = rowRx.exec(wikitext)) !== null) {
    const name = cleanText(m[1].replace(/\[+|\]+|'+/g, ''));
    const detail = cleanText(m[2].replace(/\[+|\]+|'+/g, ''));
    if (!name || /^(effect|cheat|code|platform|playstation|xbox|pc)$/i.test(name)) continue;
    out.push({
      name,
      platform: 'PS5 / Xbox Series X|S',
      buttonCombo: null,
      phoneCode: null,
      effect: detail || 'Discovered on GTA Wiki (Cheats in GTA VI) — pending in-game verification.',
      unlockRequirements: 'Pending verification',
      source: 'GTA Wiki (Cheats in GTA VI)',
      sourceUrl: 'https://gta.fandom.com/wiki/Cheats_in_GTA_VI',
      discoveryDate: new Date().toISOString().slice(0, 10),
      verificationStatus: 'COMMUNITY VERIFYING',
      cat: 'player',
    });
  }
  return out;
}

export async function runCheatSync(opts = {}) {
  const today = new Date().toISOString().slice(0, 10);
  const existingCheats = loadJsonSafely(PUBLIC_CHEATS_PATH, {
    version: '1.0',
    updated: today,
    totalPublished: 0,
    verifiedCodesCount: 0,
    classifications: [...VALID_CLASSIFICATIONS],
    items: [],
  });
  const existingPending = loadJsonSafely(PENDING_CHEATS_PATH, {
    version: '1.0',
    updated: today,
    candidates: [],
  });

  // Snapshot existing records for strict post-merge invariant checks
  const originalCount = existingCheats.items.length;
  const originalIds = new Set(existingCheats.items.map((x) => x.id));

  const rawCandidates = [];
  let successfulSources = 0;
  const sourceErrors = [];

  if (opts.feedFile) {
    const resolved = path.resolve(opts.feedFile);
    const raw = fs.readFileSync(resolved, 'utf-8');
    if (resolved.endsWith('.json')) {
      const parsed = JSON.parse(raw);
      const arr = Array.isArray(parsed) ? parsed : parsed.candidates || parsed.items || [];
      rawCandidates.push(...arr);
    } else {
      rawCandidates.push(...parseRssCandidates(raw, path.basename(resolved)));
    }
    successfulSources++;
  } else {
    if (!opts.skipWiki) {
      try {
        const wikiCands = await fetchWikiCheatCandidates(opts.timeoutMs || 12000);
        rawCandidates.push(...wikiCands);
        successfulSources++;
        console.log(`[INFO] GTA Wiki Cheats in GTA VI scanned: ${wikiCands.length} candidate(s).`);
      } catch (err) {
        sourceErrors.push(`GTA Wiki: ${err.message}`);
        console.warn(`[WARN] GTA Wiki cheats check skipped (existing data preserved): ${err.message}`);
      }
    }

    for (const feed of DEFAULT_FEEDS) {
      try {
        const xml = await fetchWithTimeout(feed.url, opts.timeoutMs || 12000);
        const rssCands = parseRssCandidates(xml, feed.name);
        rawCandidates.push(...rssCands);
        successfulSources++;
      } catch (err) {
        sourceErrors.push(`${feed.name}: ${err.message}`);
        console.warn(`[WARN] Feed ${feed.name} skipped (existing data preserved): ${err.message}`);
      }
    }
  }

  if (successfulSources === 0) {
    const reason = sourceErrors.join('; ') || 'no-feeds-succeeded';
    console.warn(`[FAIL-SAFE ABORT] All cheat sources failed (${reason}) — zero files modified.`);
    return { ok: false, aborted: true, reason };
  }

  const nextCheats = JSON.parse(JSON.stringify(existingCheats));
  const nextPending = JSON.parse(JSON.stringify(existingPending));

  const knownPublishedNames = new Set(nextCheats.items.map((x) => normalizeKey(x.title || x.name)));
  const knownPublishedSlugs = new Set(nextCheats.items.map((x) => x.slug || slugify(x.title || x.name)));
  const knownPublishedCodes = new Set(
    nextCheats.items
      .map((x) => (x.buttonCombo || x.phoneCode || '').trim().toLowerCase())
      .filter(Boolean)
  );
  const knownPendingKeys = new Set(
    (nextPending.candidates || []).map((c) => normalizeKey(c.name || c.title))
  );

  let nextNumericId = nextCheats.items.reduce((mx, x) => (typeof x.id === 'number' && x.id > mx ? x.id : mx), 0) + 1;
  let publishedAdded = 0;
  let pendingStaged = 0;
  let duplicatesSkipped = 0;

  for (const raw of rawCandidates) {
    if (!raw || typeof raw !== 'object') continue;
    const name = cleanText(raw.name || raw.title);
    if (!name || name.length < 3) continue;

    const normName = normalizeKey(name);
    const slug = slugify(name);
    const codeArr = parseButtonCombo(raw.code || raw.buttonCombo);
    const buttonCombo = codeArr.length > 0 ? codeArr.join(' ') : null;
    const phoneCode = cleanText(raw.phoneCode) || null;
    const codeKey = (buttonCombo || phoneCode || '').trim().toLowerCase();

    // Strict deduplication across published and pending
    if (
      knownPublishedNames.has(normName) ||
      knownPublishedSlugs.has(slug) ||
      (codeKey && knownPublishedCodes.has(codeKey)) ||
      knownPendingKeys.has(normName)
    ) {
      duplicatesSkipped++;
      continue;
    }

    const status = VALID_CLASSIFICATIONS.has(raw.verificationStatus)
      ? raw.verificationStatus
      : 'UNCONFIRMED';
    const source = cleanText(raw.source) || 'Automated Discovery Monitor';
    const sourceUrl = cleanText(raw.sourceUrl) || 'https://www.rockstargames.com/VI';
    const platform = cleanText(raw.platform) || 'PS5 / Xbox Series X|S';
    const effect = cleanText(raw.effect || raw.desc) || 'Pending verification.';
    const unlockReq = cleanText(raw.unlockRequirements || raw.unlock) || 'Pending verification';
    const discoveryDate = cleanText(raw.discoveryDate) || today;
    const cat = VALID_CATS.has(raw.cat) ? raw.cat : 'player';

    // Strict publication gate:
    // ONLY OFFICIALLY CONFIRMED or VERIFIED IN-GAME with a confirmed button combo or phone code
    // and a reputable source URL may auto-enter the published database.
    const hasConfirmedCode = Boolean(buttonCombo || phoneCode);
    const canAutoPublish =
      AUTO_PUBLISH_STATUSES.has(status) && hasConfirmedCode && isReputableSourceUrl(sourceUrl);

    if (canAutoPublish) {
      const newEntry = {
        id: nextNumericId++,
        slug,
        title: name,
        name,
        cat,
        platform,
        code: codeArr,
        buttonCombo,
        phoneCode,
        desc: effect,
        effect,
        unlock: unlockReq,
        unlockRequirements: unlockReq,
        source,
        sourceUrl,
        discoveryDate,
        verified: true,
        status,
        verificationStatus: status,
      };
      nextCheats.items.push(newEntry);
      knownPublishedNames.add(normName);
      knownPublishedSlugs.add(slug);
      if (codeKey) knownPublishedCodes.add(codeKey);
      publishedAdded++;
    } else {
      const pendingStatus = AUTO_PUBLISH_STATUSES.has(status) ? 'COMMUNITY VERIFYING' : status;
      const hashId = crypto.createHash('sha1').update(`${normName}|${sourceUrl}`).digest('hex').slice(0, 12);
      nextPending.candidates.push({
        id: `pend-cheat-${hashId}`,
        slug,
        name,
        platform,
        buttonCombo,
        phoneCode,
        effect,
        unlockRequirements: unlockReq,
        source,
        sourceUrl,
        discoveryDate,
        verificationStatus: pendingStatus,
        reviewStatus: 'pending_manual_review',
      });
      knownPendingKeys.add(normName);
      pendingStaged++;
    }
  }

  // Recompute published totals strictly from published items
  nextCheats.totalPublished = nextCheats.items.length;
  nextCheats.verifiedCodesCount = nextCheats.items.filter((x) => x.verified === true).length;

  // Strict post-merge invariants: NEVER shrink or lose any existing cheat ID
  if (nextCheats.items.length < originalCount) {
    throw new Error('Invariant violation: published cheat count shrunk — aborting write.');
  }
  const nextIds = new Set(nextCheats.items.map((x) => x.id));
  for (const id of originalIds) {
    if (!nextIds.has(id)) {
      throw new Error(`Invariant violation: existing cheat ID ${id} missing — aborting write.`);
    }
  }

  const cheatsChanged = JSON.stringify(stripVolatile(existingCheats)) !== JSON.stringify(stripVolatile(nextCheats));
  const pendingChanged = JSON.stringify(stripVolatile(existingPending)) !== JSON.stringify(stripVolatile(nextPending));

  if (!opts.dryRun) {
    if (cheatsChanged) {
      nextCheats.updated = today;
      atomicWriteJson(PUBLIC_CHEATS_PATH, nextCheats);
      atomicWriteJson(MIRROR_CHEATS_PATH, nextCheats);
      syncHtmlCheatCounts(nextCheats);
      console.log(`[OK] Updated public/data/cheats.json & data/cheats.json (+${publishedAdded} verified cheat(s), totalPublished=${nextCheats.totalPublished}).`);
    } else {
      syncHtmlCheatCounts(nextCheats);
      console.log(`[OK] No new verified cheats to publish (totalPublished=${nextCheats.totalPublished}).`);
    }
    if (pendingChanged) {
      nextPending.updated = today;
      atomicWriteJson(PENDING_CHEATS_PATH, nextPending);
      console.log(`[OK] Staged ${pendingStaged} unconfirmed/verifying cheat discovery/discoveries in public/data/cheats-pending.json (skipped ${duplicatesSkipped} duplicate(s)).`);
    } else {
      console.log(`[OK] No new pending cheat discoveries staged (skipped ${duplicatesSkipped} duplicate(s)).`);
    }
  } else {
    console.log(
      `[DRY-RUN] publishedAdded=${publishedAdded}, pendingStaged=${pendingStaged}, duplicatesSkipped=${duplicatesSkipped}, totalPublished=${nextCheats.totalPublished}`
    );
  }

  return {
    ok: true,
    aborted: false,
    changed: cheatsChanged || pendingChanged,
    publishedAdded,
    pendingStaged,
    duplicatesSkipped,
    totalPublished: nextCheats.totalPublished,
  };
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename);
if (isMain) {
  const opts = parseArgs(process.argv.slice(2));
  runCheatSync(opts)
    .then((res) => {
      if (res.aborted) process.exit(0);
    })
    .catch((err) => {
      console.error('[FATAL] Cheat sync error:', err.message);
      process.exit(1);
    });
}
