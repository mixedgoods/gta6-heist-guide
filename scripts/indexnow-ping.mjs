#!/usr/bin/env node
/**
 * GTA6HeistGuide.com — Persistent IndexNow Submission Engine & Smart Change Detector
 *
 * KEY GUARANTEES:
 * 1. Reuses ONE persistent IndexNow key permanently (existing public/<KEY>.txt or generated once
 *    during initial setup). NEVER rotates or regenerates the key on deployments.
 * 2. Stores persistent submission state OUTSIDE public/ at scripts/state/indexnow-state.json
 *    (never publicly served via Cloudflare Pages).
 * 3. Intelligent content normalization before hashing: extracts meaningful main content + key SEO
 *    metadata while excluding shared navigation, global footer, ad/analytics/affiliate scripts,
 *    randomized blocks, and auto-changing timestamps. Navbar/footer edits NEVER trigger mass pings.
 * 4. Detects created, substantially modified, and deleted URLs (retaining prior URL ledger).
 *    Unchanged URLs are NEVER re-submitted.
 * 5. Handles HTTP 200 (received), 202 (accepted, key verification pending), 400, 403, 422, and
 *    429 (controlled exponential backoff).
 * 6. IndexNow notifies participating search engines (Bing, Yandex, Naver, Seznam, Yep). It does
 *    NOT notify Google Search and does NOT guarantee indexing.
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');
const STATE_DIR = path.join(__dirname, 'state');
const STATE_PATH = path.join(STATE_DIR, 'indexnow-state.json');

const CANONICAL_HOST = 'www.gta6heistguide.com';
const CANONICAL_ORIGIN = `https://${CANONICAL_HOST}`;
const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';
const KEY_PATTERN = /^[a-zA-Z0-9-]{8,128}$/;

function parseArgs(argv) {
  const opts = {
    dryRun: false,
    selfTest: false,
    forceAll: false,
    skipLiveKeyCheck: false,
    batchSize: 500,
    maxRetries: 3,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--dry-run') opts.dryRun = true;
    else if (a === '--self-test') opts.selfTest = true;
    else if (a === '--force-all') opts.forceAll = true;
    else if (a === '--skip-live-key-check') opts.skipLiveKeyCheck = true;
  }
  return opts;
}

function loadExistingState() {
  if (!fs.existsSync(STATE_PATH)) {
    return {
      schemaVersion: 1,
      host: CANONICAL_HOST,
      key: null,
      keyLocation: null,
      note: 'IndexNow notifies participating engines (Bing, Yandex, Naver, Seznam, Yep). It does NOT notify Google Search and does NOT guarantee indexing.',
      lastRunAt: null,
      urls: {},
    };
  }
  const parsed = JSON.parse(fs.readFileSync(STATE_PATH, 'utf-8'));
  if (!parsed || typeof parsed !== 'object') {
    throw new Error(`Invalid state file at ${STATE_PATH}`);
  }
  parsed.urls = parsed.urls && typeof parsed.urls === 'object' ? parsed.urls : {};
  return parsed;
}

function saveStateAtomically(stateObj) {
  fs.mkdirSync(STATE_DIR, { recursive: true });
  const tmp = `${STATE_PATH}.tmp.${process.pid}`;
  fs.writeFileSync(tmp, JSON.stringify(stateObj, null, 2) + '\n', 'utf-8');
  JSON.parse(fs.readFileSync(tmp, 'utf-8'));
  fs.renameSync(tmp, STATE_PATH);
}

/**
 * Resolve or initialize ONE permanent IndexNow key.
 * Priority: (1) state file key, (2) existing valid public/<KEY>.txt file, (3) generate once.
 */
export function ensurePersistentKey(state, publicDir = PUBLIC_DIR) {
  // 1. Reuse key from persistent state if present & valid
  if (state.key && KEY_PATTERN.test(state.key)) {
    const keyFile = path.join(publicDir, `${state.key}.txt`);
    if (!fs.existsSync(keyFile) || fs.readFileSync(keyFile, 'utf-8').trim() !== state.key) {
      fs.writeFileSync(keyFile, state.key, 'utf-8');
    }
    return state.key;
  }

  // 2. Discover existing plain-text IndexNow key file in public/ (e.g. df9198ac34c2f27023754589395a56d0.txt)
  if (fs.existsSync(publicDir)) {
    for (const ent of fs.readdirSync(publicDir)) {
      if (!ent.endsWith('.txt')) continue;
      const stem = ent.slice(0, -4);
      if (['robots', 'ads', 'llms', 'llms-full'].includes(stem.toLowerCase())) continue;
      if (!KEY_PATTERN.test(stem)) continue;
      const fp = path.join(publicDir, ent);
      if (!fs.statSync(fp).isFile()) continue;
      const body = fs.readFileSync(fp, 'utf-8').trim();
      if (body === stem) {
        return stem;
      }
    }
  }

  // 3. Initial one-time generation (32 hex chars — valid 8–128 permitted charset)
  const generated = crypto.randomBytes(16).toString('hex');
  fs.writeFileSync(path.join(publicDir, `${generated}.txt`), generated, 'utf-8');
  return generated;
}

function stripVolatileJsonLdKeys(node) {
  if (Array.isArray(node)) return node.map(stripVolatileJsonLdKeys);
  if (!node || typeof node !== 'object') return node;
  const out = {};
  const keys = Object.keys(node).sort();
  for (const k of keys) {
    if (['dateModified', 'uploadDate', 'last_synced', 'updated_utc'].includes(k)) continue;
    out[k] = stripVolatileJsonLdKeys(node[k]);
  }
  return out;
}

function decodeBasicEntities(s) {
  return String(s || '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

function removeTagBlocksByAttr(html, attrRegex) {
  // Iteratively strip block elements whose opening tag matches attrRegex (e.g. navbar/footer/ad/ticker)
  let out = html;
  const tagNames = ['nav', 'footer', 'aside', 'div', 'section'];
  for (const tag of tagNames) {
    const openRx = new RegExp(`<${tag}\\b[^>]*>`, 'gi');
    let match;
    const ranges = [];
    while ((match = openRx.exec(out)) !== null) {
      if (!attrRegex.test(match[0])) continue;
      const start = match.index;
      // Find matching closing tag accounting for nesting
      let depth = 1;
      const scanRx = new RegExp(`<(\\/?)${tag}\\b[^>]*>`, 'gi');
      scanRx.lastIndex = start + match[0].length;
      let m2;
      let end = -1;
      while ((m2 = scanRx.exec(out)) !== null) {
        if (m2[1] === '/') depth--;
        else depth++;
        if (depth === 0) {
          end = m2.index + m2[0].length;
          break;
        }
      }
      if (end > start) {
        ranges.push([start, end]);
        openRx.lastIndex = end;
      }
    }
    for (let i = ranges.length - 1; i >= 0; i--) {
      out = out.slice(0, ranges[i][0]) + ' ' + out.slice(ranges[i][1]);
    }
  }
  return out;
}

/**
 * Intelligent Content Normalization for IndexNow Hashing.
 * Extracts meaningful main content + key SEO metadata while excluding:
 * - Shared navigation (<nav class="navbar"...>, #siteNavbar, #siteTopStrip)
 * - Global footer (<footer>...</footer>)
 * - Ad, affiliate, analytics & arbitrary JS/CSS scripts (<script>, <style>, <noscript>, <svg>)
 * - Randomized blocks & auto-changing timestamps (Last Updated, DAY-N, ISO timestamps, ?v=...)
 */
export function normalizeHtmlForHash(rawHtml) {
  const html = String(rawHtml || '');

  // 1. Key SEO Metadata
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = decodeBasicEntities(titleMatch ? titleMatch[1] : '').replace(/\s+/g, ' ').trim();

  const descMatch =
    html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i) ||
    html.match(/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i);
  const description = decodeBasicEntities(descMatch ? descMatch[1] : '').replace(/\s+/g, ' ').trim();

  const canonMatch =
    html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']*)["']/i) ||
    html.match(/<link[^>]+href=["']([^"']*)["'][^>]+rel=["']canonical["']/i);
  const canonical = (canonMatch ? canonMatch[1] : '').trim();

  // 2. Meaningful JSON-LD (minus volatile timestamp keys)
  const jsonLdBlocks = [];
  const ldRx = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let ldM;
  while ((ldM = ldRx.exec(html)) !== null) {
    try {
      const parsed = JSON.parse(ldM[1]);
      jsonLdBlocks.push(JSON.stringify(stripVolatileJsonLdKeys(parsed)));
    } catch {
      // Ignore unparseable JSON-LD here; seo-audit.mjs flags it as FATAL
    }
  }

  // 3. Extract <main> if present; otherwise <body> with shared chrome stripped
  const mainMatch = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i);
  let bodyContent = mainMatch
    ? mainMatch[1]
    : (html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i)?.[1] || html);

  // Strip HTML comments
  bodyContent = bodyContent.replace(/<!--[\s\S]*?-->/g, ' ');

  // Strip shared chrome: navbar, countdown strip, global footer, ad/affiliate/random/timestamp blocks
  bodyContent = bodyContent.replace(/<footer\b[^>]*>[\s\S]*?<\/footer>/gi, ' ');
  bodyContent = removeTagBlocksByAttr(
    bodyContent,
    /(id|class)=["'][^"']*(navbar|siteNavbar|siteTopStrip|countdown-strip|syndicate-aff-bar|affiliate-banner|adsense-slot|wdb-aff-strip|contextual-tool-strip|random-block|live-ticker|auto-timestamp)[^"']*["']/i
  );

  // Strip scripts, styles, noscript, svg (prevents analytics/ad/cache-buster script churn)
  bodyContent = bodyContent
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<svg\b[^>]*>[\s\S]*?<\/svg>/gi, ' ');

  // Keep meaningful text + image alt/src (sans cache-busting query strings)
  const imgAlts = [];
  const imgRx = /<img\b[^>]*>/gi;
  let im;
  while ((im = imgRx.exec(bodyContent)) !== null) {
    const srcM = im[0].match(/src=["']([^"'?#]+)/i);
    const altM = im[0].match(/alt=["']([^"']*)/i);
    if (srcM || altM) {
      imgAlts.push(`${srcM ? srcM[1] : ''}|${decodeBasicEntities(altM ? altM[1] : '').trim()}`);
    }
  }

  // Strip remaining HTML tags to pure normalized semantic text
  let text = decodeBasicEntities(bodyContent.replace(/<[^>]+>/g, ' '));

  // Normalize away volatile/auto-changing timestamps & day counters
  text = text
    .replace(/\bLast\s+Updated\s*:?\s*\d{4}-\d{2}-\d{2}(T[\d:.Z+-]+)?/gi, '')
    .replace(/\bUpdated\s*:?\s*\d{4}-\d{2}-\d{2}\b/gi, '')
    .replace(/\bDAY-\d+\b/g, 'DAY-X')
    .replace(/\b\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z?\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  return JSON.stringify({
    title,
    description,
    canonical,
    jsonLd: jsonLdBlocks,
    images: imgAlts.sort(),
    text,
  });
}

export function hashNormalizedContent(rawHtml) {
  const normalized = normalizeHtmlForHash(rawHtml);
  return crypto.createHash('sha256').update(normalized).digest('hex');
}

function canonicalUrlToPublicFile(canonicalUrl, publicDir) {
  let pathname;
  try {
    pathname = new URL(canonicalUrl).pathname;
  } catch {
    return null;
  }
  if (pathname === '/' || pathname === '') {
    const idx = path.join(publicDir, 'index.html');
    return fs.existsSync(idx) ? idx : null;
  }
  if (pathname.endsWith('/')) {
    const idx = path.join(publicDir, pathname.slice(1), 'index.html');
    return fs.existsSync(idx) ? idx : null;
  }
  const direct = path.join(publicDir, pathname.slice(1));
  if (fs.existsSync(direct) && fs.statSync(direct).isFile()) return direct;
  const htmlAlt = direct + '.html';
  if (fs.existsSync(htmlAlt) && fs.statSync(htmlAlt).isFile()) return htmlAlt;
  const dirIdx = path.join(direct, 'index.html');
  if (fs.existsSync(dirIdx) && fs.statSync(dirIdx).isFile()) return dirIdx;
  return null;
}

/**
 * Discover all canonical indexable URLs and compute their normalized content hashes.
 */
export function scanCanonicalPages(publicDir = PUBLIC_DIR, host = CANONICAL_HOST) {
  const origin = `https://${host}`;
  const sitemapPath = path.join(publicDir, 'sitemap.xml');
  const discovered = new Map();

  // Primary source: public/sitemap.xml canonical URLs
  if (fs.existsSync(sitemapPath)) {
    const xml = fs.readFileSync(sitemapPath, 'utf-8');
    const locRx = /<loc>(https?:\/\/[^<]+)<\/loc>/gi;
    let m;
    while ((m = locRx.exec(xml)) !== null) {
      const url = m[1].trim();
      if (!url.startsWith(origin)) continue;
      const fp = canonicalUrlToPublicFile(url, publicDir);
      if (!fp) continue;
      const html = fs.readFileSync(fp, 'utf-8');
      if (/<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(html)) continue;
      discovered.set(url, {
        canonicalUrl: url,
        filePath: path.relative(ROOT_DIR, fp).replace(/\\/g, '/'),
        contentHash: hashNormalizedContent(html),
      });
    }
  }

  return discovered;
}

/**
 * Compare current scanned pages against persistent state to classify:
 * - created, modified, deleted, unchanged
 */
export function detectChanges(currentPagesMap, prevState) {
  const prevUrls = (prevState && prevState.urls) || {};
  const created = [];
  const modified = [];
  const deleted = [];
  const unchanged = [];

  for (const [url, info] of currentPagesMap.entries()) {
    const prev = prevUrls[url];
    if (!prev || prev.deleted === true) {
      created.push(info);
    } else if (prev.contentHash !== info.contentHash) {
      modified.push(info);
    } else {
      unchanged.push(info);
    }
  }

  for (const [url, prev] of Object.entries(prevUrls)) {
    if (!currentPagesMap.has(url) && prev && prev.deleted !== true) {
      deleted.push({
        canonicalUrl: url,
        filePath: prev.filePath || null,
        contentHash: prev.contentHash || null,
      });
    }
  }

  return { created, modified, deleted, unchanged };
}

async function verifyLiveKeyFile(host, key) {
  const keyUrl = `https://${host}/${key}.txt`;
  const res = await fetch(keyUrl, {
    headers: { 'User-Agent': 'GTA6HeistGuide-IndexNow/2.0' },
  });
  if (!res.ok) {
    throw new Error(`Live key file check failed: ${keyUrl} returned HTTP ${res.status}`);
  }
  const body = (await res.text()).trim();
  if (body !== key) {
    throw new Error(`Live key file mismatch at ${keyUrl} (expected ${key}, got ${body.slice(0, 64)})`);
  }
  return keyUrl;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Submit a batch of URLs to IndexNow with proper HTTP 200/202/400/403/422/429 handling
 * and controlled exponential backoff on HTTP 429.
 */
export async function submitBatchToIndexNow({ host, key, keyLocation, urlList, maxRetries = 3, fetchImpl = fetch }) {
  const payload = { host, key, keyLocation, urlList };
  let attempt = 0;

  while (attempt <= maxRetries) {
    attempt++;
    const res = await fetchImpl(INDEXNOW_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'User-Agent': 'GTA6HeistGuide-IndexNow/2.0',
      },
      body: JSON.stringify(payload),
    });

    const status = res.status;
    const text = await res.text().catch(() => '');

    if (status === 200) {
      return { ok: true, status: 200, meaning: 'Received by IndexNow', body: text, attempts: attempt };
    }
    if (status === 202) {
      return { ok: true, status: 202, meaning: 'Accepted — key verification pending', body: text, attempts: attempt };
    }
    if (status === 400) {
      return { ok: false, status: 400, meaning: 'Bad Request — invalid IndexNow payload format', body: text, attempts: attempt };
    }
    if (status === 403) {
      return { ok: false, status: 403, meaning: 'Forbidden — key not valid or key file verification failed', body: text, attempts: attempt };
    }
    if (status === 422) {
      return { ok: false, status: 422, meaning: 'Unprocessable Entity — URLs do not belong to host or schema mismatch', body: text, attempts: attempt };
    }
    if (status === 429) {
      if (attempt > maxRetries) {
        return { ok: false, status: 429, meaning: 'Too Many Requests — exhausted controlled backoff retries', body: text, attempts: attempt };
      }
      const retryAfterSec = Number(res.headers && res.headers.get ? res.headers.get('retry-after') : 0);
      const backoffMs = retryAfterSec > 0 ? Math.min(retryAfterSec * 1000, 30000) : Math.min(2000 * Math.pow(2, attempt - 1), 16000);
      console.warn(`[429] IndexNow rate limited — controlled backoff ${backoffMs}ms (attempt ${attempt}/${maxRetries})`);
      await sleep(backoffMs);
      continue;
    }

    return { ok: false, status, meaning: `Unexpected HTTP ${status}`, body: text, attempts: attempt };
  }
}

/**
 * Built-in 5-case verification suite:
 * (a) unchanged page, (b) real content edit, (c) navbar-only edit, (d) new page, (e) deleted page.
 */
export function runFiveCaseSelfTest() {
  const baseHtml = (opts = {}) => `<!DOCTYPE html>
<html lang="en">
<head>
  <title>${opts.title || 'GTA 6 Money Guide'}</title>
  <meta name="description" content="${opts.desc || 'Verified GTA 6 safe codes and heist payouts.'}">
  <link rel="canonical" href="https://www.gta6heistguide.com/test-page.html">
  <script type="application/ld+json">{"@context":"https://schema.org","@type":"Article","name":"GTA 6 Money Guide","dateModified":"${opts.dateMod || '2026-11-21'}"}</script>
</head>
<body>
  <div class="countdown-strip" id="siteTopStrip"><span>${opts.banner || 'DAY-3 LIVE'}</span></div>
  <nav class="navbar" id="siteNavbar">
    <ul class="nav-links"><li><a href="/">${opts.navLabel || 'HEISTS'}</a></li></ul>
  </nav>
  <main>
    <h1>GTA 6 Safe Codes</h1>
    <p>${opts.body || '0420 unlocks Moonstone Boutique back-room laboratory keypad; 7700 unlocks Brian Lockup keypad.'}</p>
    <div class="syndicate-aff-bar"><a href="https://example.com">${opts.adText || 'Promo A'}</a></div>
    <span>Last Updated: ${opts.visibleDate || '2026-11-21'}</span>
  </main>
  <footer><p>${opts.footer || 'Copyright 2026 GTA6HeistGuide.com'}</p></footer>
  <script>console.log("${opts.scriptRand || 'analytics-v1'}");</script>
</body>
</html>`;

  const urlA = 'https://www.gta6heistguide.com/page-unchanged.html';
  const urlB = 'https://www.gta6heistguide.com/page-content-edited.html';
  const urlC = 'https://www.gta6heistguide.com/page-navbar-edited.html';
  const urlD = 'https://www.gta6heistguide.com/page-new.html';
  const urlE = 'https://www.gta6heistguide.com/page-deleted.html';

  const prevState = {
    urls: {
      [urlA]: { canonicalUrl: urlA, contentHash: hashNormalizedContent(baseHtml()), deleted: false },
      [urlB]: { canonicalUrl: urlB, contentHash: hashNormalizedContent(baseHtml()), deleted: false },
      [urlC]: { canonicalUrl: urlC, contentHash: hashNormalizedContent(baseHtml()), deleted: false },
      [urlE]: { canonicalUrl: urlE, contentHash: hashNormalizedContent(baseHtml({ body: 'Old page to be deleted.' })), deleted: false },
    },
  };

  const currentMap = new Map([
    // (a) Unchanged page
    [urlA, { canonicalUrl: urlA, filePath: 'public/page-unchanged.html', contentHash: hashNormalizedContent(baseHtml()) }],
    // (b) Real content edit
    [urlB, { canonicalUrl: urlB, filePath: 'public/page-content-edited.html', contentHash: hashNormalizedContent(baseHtml({ body: 'Added verified details for Bret Vogel 15 Hunting Target Decks and Moonstone Boutique 0420.' })) }],
    // (c) Navbar + footer + ad + timestamp-only edit (MUST produce identical hash!)
    [urlC, { canonicalUrl: urlC, filePath: 'public/page-navbar-edited.html', contentHash: hashNormalizedContent(baseHtml({ navLabel: 'NEW NAV TAB', footer: 'New Footer Copy v9', adText: 'Promo B', banner: 'DAY-99 LIVE', dateMod: '2026-12-31', visibleDate: '2026-12-31', scriptRand: 'analytics-v99' })) }],
    // (d) Newly created page
    [urlD, { canonicalUrl: urlD, filePath: 'public/page-new.html', contentHash: hashNormalizedContent(baseHtml({ title: 'GTA 6 Glitches Tracker', body: 'Brand new verified glitch tracker page.' })) }],
    // (e) urlE omitted -> detected as deleted
  ]);

  const diff = detectChanges(currentMap, prevState);
  const results = {
    caseA_unchangedSkipped: diff.unchanged.some((x) => x.canonicalUrl === urlA),
    caseB_realContentEditDetected: diff.modified.some((x) => x.canonicalUrl === urlB),
    caseC_navbarFooterTimestampIgnored: diff.unchanged.some((x) => x.canonicalUrl === urlC) && !diff.modified.some((x) => x.canonicalUrl === urlC),
    caseD_newPageDetected: diff.created.some((x) => x.canonicalUrl === urlD),
    caseE_deletedPageDetected: diff.deleted.some((x) => x.canonicalUrl === urlE),
  };

  const allPassed = Object.values(results).every(Boolean);
  console.log('=== INDEXNOW 5-CASE SMART CHANGE DETECTION SELF-TEST ===');
  console.log(`  (a) Unchanged page skipped:                      ${results.caseA_unchangedSkipped ? 'PASS' : 'FAIL'}`);
  console.log(`  (b) Real content edit detected (modified):       ${results.caseB_realContentEditDetected ? 'PASS' : 'FAIL'}`);
  console.log(`  (c) Navbar/footer/timestamp-only edit ignored:   ${results.caseC_navbarFooterTimestampIgnored ? 'PASS' : 'FAIL'}`);
  console.log(`  (d) Newly created page detected (created):       ${results.caseD_newPageDetected ? 'PASS' : 'FAIL'}`);
  console.log(`  (e) Deleted page detected (deleted):             ${results.caseE_deletedPageDetected ? 'PASS' : 'FAIL'}`);
  console.log(`=== OVERALL: ${allPassed ? 'ALL 5 CASES PASSED' : 'FAILED'} ===`);

  if (!allPassed) process.exit(1);
  return results;
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.selfTest) {
    runFiveCaseSelfTest();
    return;
  }

  const state = loadExistingState();
  const key = ensurePersistentKey(state, PUBLIC_DIR);
  const keyLocation = `${CANONICAL_ORIGIN}/${key}.txt`;
  state.host = CANONICAL_HOST;
  state.key = key;
  state.keyLocation = keyLocation;

  console.log('==============================================================');
  console.log('  GTA6HEISTGUIDE.COM — PERSISTENT INDEXNOW ENGINE (PASS 5)');
  console.log('==============================================================');
  console.log(`[*] Canonical Host: ${CANONICAL_HOST}`);
  console.log(`[*] Persistent Key: ${key} (public/${key}.txt)`);
  console.log(`[*] State File:     scripts/state/indexnow-state.json (outside public/)`);
  console.log('[*] Scope Notice:   IndexNow notifies participating engines (Bing, Yandex, Naver, Seznam, Yep).');
  console.log('                    It does NOT notify Google Search and does NOT guarantee indexing.');

  const currentPages = scanCanonicalPages(PUBLIC_DIR, CANONICAL_HOST);
  const diff = detectChanges(currentPages, state);

  console.log(`[*] Scanned ${currentPages.size} canonical indexable pages:`);
  console.log(`    - Created:   ${diff.created.length}`);
  console.log(`    - Modified:  ${diff.modified.length}`);
  console.log(`    - Deleted:   ${diff.deleted.length}`);
  console.log(`    - Unchanged: ${diff.unchanged.length} (skipped — never re-submitted)`);

  const urlsToSubmit = opts.forceAll
    ? Array.from(currentPages.keys())
    : [
        ...diff.created.map((x) => x.canonicalUrl),
        ...diff.modified.map((x) => x.canonicalUrl),
        ...diff.deleted.map((x) => x.canonicalUrl),
      ];

  if (urlsToSubmit.length === 0) {
    console.log('[OK] Zero meaningful content changes or deletions detected — no IndexNow submission needed.');
    return;
  }

  if (opts.dryRun) {
    console.log(`[DRY-RUN] Would submit ${urlsToSubmit.length} changed/new/deleted URL(s):`);
    for (const u of urlsToSubmit.slice(0, 20)) console.log(`  - ${u}`);
    if (urlsToSubmit.length > 20) console.log(`  ... and ${urlsToSubmit.length - 20} more.`);
    return;
  }

  // Verify live production key file BEFORE submitting (ensures production deploy succeeded)
  if (!opts.skipLiveKeyCheck) {
    await verifyLiveKeyFile(CANONICAL_HOST, key);
    console.log(`[✓] Verified live production key file: ${keyLocation} (HTTP 200)`);
  }

  const nowIso = new Date().toISOString();
  let overallOk = true;

  for (let i = 0; i < urlsToSubmit.length; i += opts.batchSize) {
    const batch = urlsToSubmit.slice(i, i + opts.batchSize);
    const res = await submitBatchToIndexNow({
      host: CANONICAL_HOST,
      key,
      keyLocation,
      urlList: batch,
      maxRetries: opts.maxRetries,
    });

    console.log(`[${res.ok ? '✓' : '!'}] IndexNow Batch (${batch.length} URLs) -> HTTP ${res.status}: ${res.meaning} (attempts=${res.attempts})`);
    if (res.body) console.log(`    Response: ${res.body.slice(0, 240)}`);

    for (const url of batch) {
      const cur = currentPages.get(url);
      const prev = state.urls[url] || {};
      const isDeleted = !cur;
      const hashChanged = cur ? prev.contentHash !== cur.contentHash : true;

      state.urls[url] = {
        canonicalUrl: url,
        filePath: cur ? cur.filePath : prev.filePath || null,
        contentHash: cur ? cur.contentHash : prev.contentHash || null,
        lastMeaningfulModification: hashChanged || isDeleted ? nowIso : prev.lastMeaningfulModification || nowIso,
        lastSubmissionAttempt: nowIso,
        lastHttp200Receipt: res.status === 200 ? nowIso : prev.lastHttp200Receipt || null,
        pendingHttp202: res.status === 202 ? true : res.status === 200 ? false : Boolean(prev.pendingHttp202),
        lastHttpStatus: res.status,
        deleted: isDeleted,
      };
    }

    if (!res.ok) overallOk = false;
  }

  // Ensure unchanged URLs keep their metadata cleanly intact
  for (const info of diff.unchanged) {
    if (state.urls[info.canonicalUrl]) {
      state.urls[info.canonicalUrl].filePath = info.filePath;
    }
  }

  state.lastRunAt = nowIso;
  saveStateAtomically(state);
  console.log(`[OK] Persisted IndexNow submission state to scripts/state/indexnow-state.json (${Object.keys(state.urls).length} tracked URLs).`);

  if (!overallOk) {
    process.exitCode = 1;
  }
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename);
if (isMain) {
  main().catch((err) => {
    console.error('[FATAL] IndexNow error:', err.message);
    process.exit(1);
  });
}
