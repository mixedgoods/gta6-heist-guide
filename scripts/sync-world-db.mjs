#!/usr/bin/env node
/**
 * Safe Daily GTA 6 World Database Sync (scripts/sync-world-db.mjs)
 * Covers: Vehicles, Weapons, Properties, Gun Stores, and Radio Stations.
 *
 * SAFETY GUARANTEES:
 * 1. Auto-updates VERIFIED TEXT FIELDS ONLY (never fabricates stats, never overwrites
 *    or publishes scraped photos into public/data/*.json).
 * 2. Writes unique candidate image URLs into public/data/world-pending-images.json
 *    for manual editorial approval, with duplicate-URL & stock/AI-photo rejection.
 * 3. STRICT FAIL-SAFE: If a fetch fails, times out, or returns incomplete/truncated
 *    data, aborts the write immediately so existing JSON data and verified screenshots
 *    are NEVER erased or overwritten.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const PUBLIC_DATA_DIR = path.join(ROOT_DIR, 'public', 'data');
const MIRROR_DATA_DIR = path.join(ROOT_DIR, 'data');
const PENDING_IMAGES_PATH = path.join(PUBLIC_DATA_DIR, 'world-pending-images.json');
const ANIMALS_JSON_PATH = path.join(PUBLIC_DATA_DIR, 'animals.json');
const ANIMALS_PENDING_PATH = path.join(PUBLIC_DATA_DIR, 'animals-pending-images.json');

const CATEGORIES = ['vehicles', 'weapons', 'properties', 'gun-stores', 'radio'];

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 GTA6HeistGuideWorldDbSync/1.0';

const DEFAULT_FEEDS = [
  {
    name: 'Google News GTA 6 Vehicles & Weapons',
    category: 'vehicles',
    url: 'https://news.google.com/rss/search?q=%22GTA+6%22+vehicles+OR+cars+OR+weapons+OR+%22Ammu-Nation%22&hl=en-US&gl=US&ceid=US:en',
    kind: 'rss',
  },
  {
    name: 'Google News GTA 6 Properties & Radio',
    category: 'properties',
    url: 'https://news.google.com/rss/search?q=%22GTA+6%22+safehouses+OR+garages+OR+fences+OR+%22radio+stations%22&hl=en-US&gl=US&ceid=US:en',
    kind: 'rss',
  },
];

// Stock photo & AI-generated image hosts strictly blocked from staging
const BLOCKED_IMAGE_HOSTS = [
  'shutterstock.com',
  'gettyimages.com',
  'istockphoto.com',
  'unsplash.com',
  'pexels.com',
  'pixabay.com',
  'dreamstime.com',
  'alamy.com',
  'depositphotos.com',
  '123rf.com',
  'vecteezy.com',
  'freepik.com',
  'stock.adobe.com',
];

const BLOCKED_IMAGE_PATTERNS = [
  /midjourney/i,
  /dall-?e/i,
  /stable-?diffusion/i,
  /ai-generated/i,
  /stock-?photo/i,
  /favicon/i,
  /logo\.(png|svg|webp)$/i,
];

function parseArgs(argv) {
  const opts = {
    dryRun: false,
    simulateFailure: false,
    feedFile: null,
    timeoutMs: 12000,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--dry-run') opts.dryRun = true;
    else if (a === '--simulate-failure') opts.simulateFailure = true;
    else if (a === '--feed-file' && argv[i + 1]) opts.feedFile = argv[++i];
    else if (a === '--timeout-ms' && argv[i + 1]) opts.timeoutMs = Math.max(500, Number(argv[++i]) || 12000);
  }
  return opts;
}

export function normalizeImageUrl(rawUrl) {
  try {
    const u = new URL(String(rawUrl || '').trim());
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
    u.hash = '';
    const dropParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'fbclid', 'gclid', 'ref'];
    for (const p of dropParams) u.searchParams.delete(p);
    u.hostname = u.hostname.toLowerCase();
    return u.toString();
  } catch {
    return null;
  }
}

function isDisallowedImageUrl(rawUrl) {
  const norm = normalizeImageUrl(rawUrl);
  if (!norm) return true;
  try {
    const u = new URL(norm);
    const host = u.hostname.toLowerCase();
    if (BLOCKED_IMAGE_HOSTS.some((blocked) => host === blocked || host.endsWith('.' + blocked))) {
      return true;
    }
    if (BLOCKED_IMAGE_PATTERNS.some((rx) => rx.test(norm))) {
      return true;
    }
    return false;
  } catch {
    return true;
  }
}

function cleanText(text) {
  return String(text || '')
    .replace(/<!\[CDATA\[(.*?)\]\]>/gs, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function inferCategoryFromText(text, fallbackCat) {
  const t = String(text || '').toLowerCase();
  if (/radio|soundtrack|station|dj\b|tracklist/.test(t)) return 'radio';
  if (/ammu-?nation|gun store|pawn shop|surplus/.test(t)) return 'gun-stores';
  if (/weapon|rifle|pistol|shotgun|smg|sniper|sm-69|revolver/.test(t)) return 'weapons';
  if (/safehouse|garage|fence|lockup|property|real estate/.test(t)) return 'properties';
  if (/vehicle|car|truck|pickup|motorcycle|boat|airboat|aircraft|helicopter|yosemite/.test(t)) return 'vehicles';
  return CATEGORIES.includes(fallbackCat) ? fallbackCat : 'vehicles';
}

function validateAndParseFeed(rawText, kind, defaultCategory = 'vehicles') {
  if (typeof rawText !== 'string' || rawText.trim().length < 40) {
    throw new Error('Incomplete or empty feed payload.');
  }
  const trimmed = rawText.trim();

  if (kind === 'json' || trimmed.startsWith('{') || trimmed.startsWith('[')) {
    let parsed;
    try {
      parsed = JSON.parse(trimmed);
    } catch (err) {
      throw new Error(`Truncated or invalid JSON feed: ${err.message}`);
    }
    if (!parsed || typeof parsed !== 'object') {
      throw new Error('JSON feed must be an object.');
    }
    if (parsed.incomplete === true) {
      throw new Error('Feed explicitly flagged incomplete.');
    }
    const textUpdates = Array.isArray(parsed.updates) ? parsed.updates : [];
    const imageCandidates = Array.isArray(parsed.imageCandidates) ? parsed.imageCandidates : [];
    return { textUpdates, imageCandidates, itemsRead: textUpdates.length + imageCandidates.length };
  }

  // RSS / Atom validation (fail-safe against truncated XML)
  const isRss = /<rss[\s>]/i.test(trimmed) && /<\/rss>\s*$/i.test(trimmed);
  const isAtom = /<feed[\s>]/i.test(trimmed) && /<\/feed>\s*$/i.test(trimmed);
  if (!isRss && !isAtom) {
    throw new Error('Incomplete or malformed RSS/Atom XML (missing root open/close tags).');
  }

  const imageCandidates = [];
  const itemBlocks = trimmed.match(/<(item|entry)[\s>][\s\S]*?<\/\1>/gi) || [];
  if (itemBlocks.length === 0) {
    throw new Error('Feed returned zero <item>/<entry> entries — treating as incomplete.');
  }

  for (const block of itemBlocks) {
    const titleMatch = block.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const sourceMatch = block.match(/<source[^>]*>([\s\S]*?)<\/source>/i);
    const title = cleanText(titleMatch ? titleMatch[1] : '');
    const source = cleanText(sourceMatch ? sourceMatch[1] : 'RSS Feed');
    const inferredCat = inferCategoryFromText(title, defaultCategory);

    // Stage media/enclosure image URLs for MANUAL editorial approval ONLY
    const mediaRegex = /<(?:media:content|media:thumbnail|enclosure)[^>]+url=["']([^"']+)["'][^>]*>/gi;
    let m;
    while ((m = mediaRegex.exec(block)) !== null) {
      const candidateUrl = m[1].trim();
      if (/\.(jpe?g|png|webp)(\?|$)/i.test(candidateUrl) || /image/i.test(m[0])) {
        imageCandidates.push({
          category: inferredCat,
          itemId: null,
          itemName: title.slice(0, 120) || 'Unassigned World DB Candidate',
          candidateUrl,
          source,
        });
      }
    }
  }

  return { textUpdates: [], imageCandidates, itemsRead: itemBlocks.length };
}

async function fetchFeedStrict(feed, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(feed.url, {
      signal: controller.signal,
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'application/rss+xml, application/xml, application/json, text/xml',
      },
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} from ${feed.url}`);
    }
    const text = await res.text();
    return validateAndParseFeed(text, feed.kind, feed.category);
  } finally {
    clearTimeout(timer);
  }
}

function atomicWriteJson(filePath, dataObj) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const tmpPath = `${filePath}.tmp.${process.pid}`;
  const serialized = JSON.stringify(dataObj, null, 2) + '\n';
  fs.writeFileSync(tmpPath, serialized, 'utf-8');
  JSON.parse(fs.readFileSync(tmpPath, 'utf-8'));
  fs.renameSync(tmpPath, filePath);
}

function loadCategorySafely(cat) {
  const fp = path.join(PUBLIC_DATA_DIR, `${cat}.json`);
  if (!fs.existsSync(fp)) {
    throw new Error(`Missing required category database: ${fp}`);
  }
  const parsed = JSON.parse(fs.readFileSync(fp, 'utf-8'));
  if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.items) || parsed.items.length === 0) {
    throw new Error(`Category database public/data/${cat}.json is empty or malformed — aborting.`);
  }
  return parsed;
}

function loadPendingImagesSafely() {
  if (!fs.existsSync(PENDING_IMAGES_PATH)) {
    return {
      updated: new Date().toISOString().slice(0, 10),
      policy:
        'Candidate image URLs discovered by scripts/sync-world-db.mjs across Vehicles, Weapons, Properties, Gun Stores, and Radio are staged here for manual editorial verification. NEVER auto-publish scraped, stock, AI-generated, character-filler, or duplicate images directly into public/data/*.json.',
      categories: CATEGORIES,
      candidates: [],
    };
  }
  const parsed = JSON.parse(fs.readFileSync(PENDING_IMAGES_PATH, 'utf-8'));
  if (!parsed || !Array.isArray(parsed.candidates)) {
    throw new Error('Existing public/data/world-pending-images.json is malformed — aborting.');
  }
  return parsed;
}

// Strict per-category text-only field allowlist (NEVER permits image fields or fabricated numbers)
const ALLOWED_TEXT_FIELDS = {
  vehicles: ['notes', 'priceOrAcquisition', 'verificationStatus', 'sourceUrl'],
  weapons: ['notes', 'howToObtain', 'price', 'bestUseCase', 'verificationStatus', 'sourceUrl'],
  properties: ['notes', 'purchaseAvailability', 'unlockRequirement', 'interiorFeatures', 'capacity', 'verificationStatus', 'sourceUrl'],
  'gun-stores': ['notes', 'locationDetail', 'verificationStatus', 'sourceUrl'],
  radio: ['notes', 'dj', 'unlockRequirement', 'verificationStatus', 'sourceUrl'],
};

const VALID_VERIFICATION_STATUSES = new Set(['Confirmed', 'Community Discovered', 'Testing', 'Unverified']);

export async function runWorldDbSync(opts = {}) {
  const today = new Date().toISOString().slice(0, 10);

  // 1. Load ALL 5 category databases & snapshot verified images + counts for invariant checks
  const existingByCat = {};
  const verifiedImageSnapshots = {};
  const originalCounts = {};

  for (const cat of CATEGORIES) {
    const data = loadCategorySafely(cat);
    existingByCat[cat] = data;
    originalCounts[cat] = data.items.length;
    verifiedImageSnapshots[cat] = new Map();
    for (const item of data.items) {
      if (item && item.id && item.imageVerified === true && item.image) {
        verifiedImageSnapshots[cat].set(item.id, {
          image: item.image,
          imageVerified: item.imageVerified,
          imageSource: item.imageSource || null,
        });
      }
    }
  }

  const existingPending = loadPendingImagesSafely();

  if (opts.simulateFailure) {
    console.warn('[FAIL-SAFE ABORT] Simulated fetch/timeout failure triggered — zero files modified.');
    return { ok: false, aborted: true, reason: 'simulated-failure' };
  }

  // 2. Fetch feeds with STRICT fail-safe (any failure/incomplete payload aborts ALL writes)
  const textUpdates = [];
  const rawImageCandidates = [];
  let successfulFeeds = 0;

  try {
    if (opts.feedFile) {
      const resolvedFeed = path.resolve(opts.feedFile);
      const raw = fs.readFileSync(resolvedFeed, 'utf-8');
      const kind = resolvedFeed.endsWith('.json') ? 'json' : 'rss';
      const parsed = validateAndParseFeed(raw, kind, 'vehicles');
      textUpdates.push(...parsed.textUpdates);
      rawImageCandidates.push(...parsed.imageCandidates);
      successfulFeeds++;
    } else {
      for (const feed of DEFAULT_FEEDS) {
        const parsed = await fetchFeedStrict(feed, opts.timeoutMs || 12000);
        textUpdates.push(...parsed.textUpdates);
        rawImageCandidates.push(...parsed.imageCandidates);
        successfulFeeds++;
      }
    }
  } catch (err) {
    console.warn(`[FAIL-SAFE ABORT] World DB feed failed or returned incomplete data: ${err.message}`);
    console.warn('[FAIL-SAFE ABORT] Existing public/data/*.json databases and verified screenshots left completely untouched.');
    return { ok: false, aborted: true, reason: err.message };
  }

  if (successfulFeeds === 0) {
    console.warn('[FAIL-SAFE ABORT] No feeds succeeded — aborting write.');
    return { ok: false, aborted: true, reason: 'no-feeds-succeeded' };
  }

  // 3. Apply VERIFIED TEXT UPDATES ONLY (never mutate images!)
  const nextByCat = {};
  const changedCats = new Set();
  let textFieldsUpdated = 0;

  for (const cat of CATEGORIES) {
    nextByCat[cat] = JSON.parse(JSON.stringify(existingByCat[cat]));
  }

  for (const cand of textUpdates) {
    if (!cand || typeof cand !== 'object' || cand.verified !== true) continue;
    const cat = String(cand.category || '').trim();
    if (!CATEGORIES.includes(cat)) continue;

    // Stage any image URL attached to a text update into pending queue ONLY
    if (cand.candidateImageUrl || cand.imageUrl) {
      rawImageCandidates.push({
        category: cat,
        itemId: cand.id || null,
        itemName: cleanText(cand.name || cand.id || 'World DB Entry'),
        candidateUrl: cand.candidateImageUrl || cand.imageUrl,
        source: cand.source || 'Verified Text Sync Feed',
      });
    }

    const items = nextByCat[cat].items;
    const match = items.find(
      (x) =>
        (cand.id && x.id === cand.id) ||
        (cand.name && String(x.name || '').toLowerCase() === String(cand.name).toLowerCase())
    );
    if (!match) continue;

    const allowed = ALLOWED_TEXT_FIELDS[cat] || [];
    let itemMutated = false;

    for (const field of allowed) {
      if (cand[field] === undefined || cand[field] === null) continue;
      const val = cleanText(cand[field]);
      if (!val) continue;
      if (field === 'verificationStatus' && !VALID_VERIFICATION_STATUSES.has(val)) continue;
      if (field === 'sourceUrl' && !/^https?:\/\//i.test(val)) continue;
      if (match[field] !== val) {
        match[field] = val;
        itemMutated = true;
        textFieldsUpdated++;
      }
    }

    // Verified tracklist additions for Radio (text-only, never audio/MP3)
    if (cat === 'radio' && Array.isArray(cand.verifiedTracklist)) {
      match.verifiedTracklist = Array.isArray(match.verifiedTracklist) ? match.verifiedTracklist : [];
      const existingTracks = new Set(match.verifiedTracklist.map((t) => String(t).toLowerCase()));
      for (const rawTrack of cand.verifiedTracklist) {
        const tr = cleanText(rawTrack);
        if (tr && !/\.mp3|\.wav|\.ogg/i.test(tr) && !existingTracks.has(tr.toLowerCase())) {
          match.verifiedTracklist.push(tr);
          existingTracks.add(tr.toLowerCase());
          itemMutated = true;
          textFieldsUpdated++;
        }
      }
    }

    if (itemMutated) {
      match.lastUpdated = today;
      changedCats.add(cat);
    }
  }

  // 4. Enforce strict post-merge invariants BEFORE writing anything to disk
  for (const cat of CATEGORIES) {
    const items = nextByCat[cat].items;
    if (items.length < originalCounts[cat]) {
      throw new Error(`Invariant violation: ${cat} item count shrunk — aborting write.`);
    }
    const byId = new Map(items.map((x) => [x.id, x]));
    for (const [id, snap] of verifiedImageSnapshots[cat].entries()) {
      const it = byId.get(id);
      if (!it || it.image !== snap.image || it.imageVerified !== true) {
        throw new Error(`Invariant violation: verified screenshot altered for ${cat}:${id} — aborting write.`);
      }
    }
  }

  // 5. Stage candidate image URLs into public/data/world-pending-images.json with duplicate-URL detection
  const nextPending = JSON.parse(JSON.stringify(existingPending));
  const knownUrls = new Set();

  for (const c of nextPending.candidates) {
    const n = normalizeImageUrl(c.normalizedUrl || c.candidateUrl);
    if (n) knownUrls.add(n);
  }
  // Cross-check animals-pending-images.json too
  try {
    if (fs.existsSync(ANIMALS_PENDING_PATH)) {
      const ap = JSON.parse(fs.readFileSync(ANIMALS_PENDING_PATH, 'utf-8'));
      for (const c of ap.candidates || []) {
        const n = normalizeImageUrl(c.normalizedUrl || c.candidateUrl);
        if (n) knownUrls.add(n);
      }
    }
  } catch {}

  // Cross-check ALL existing verified images across all 6 category JSONs
  for (const cat of CATEGORIES) {
    for (const item of nextByCat[cat].items) {
      if (item.image) {
        const n = normalizeImageUrl(item.image);
        if (n) knownUrls.add(n);
        knownUrls.add(String(item.image).trim().toLowerCase());
      }
    }
  }
  try {
    if (fs.existsSync(ANIMALS_JSON_PATH)) {
      const an = JSON.parse(fs.readFileSync(ANIMALS_JSON_PATH, 'utf-8'));
      for (const item of an.items || []) {
        if (item.image) {
          const n = normalizeImageUrl(item.image);
          if (n) knownUrls.add(n);
          knownUrls.add(String(item.image).trim().toLowerCase());
        }
      }
    }
  } catch {}

  let stagedImages = 0;
  let duplicatesSkipped = 0;
  let disallowedSkipped = 0;

  for (const cand of rawImageCandidates) {
    const rawUrl = String(cand.candidateUrl || '').trim();
    if (!rawUrl) continue;
    if (isDisallowedImageUrl(rawUrl)) {
      disallowedSkipped++;
      continue;
    }
    const normUrl = normalizeImageUrl(rawUrl);
    if (!normUrl || knownUrls.has(normUrl)) {
      duplicatesSkipped++;
      continue;
    }
    knownUrls.add(normUrl);
    const hashId = crypto.createHash('sha1').update(normUrl).digest('hex').slice(0, 12);
    const cat = CATEGORIES.includes(cand.category) ? cand.category : inferCategoryFromText(cand.itemName, 'vehicles');
    nextPending.candidates.push({
      id: `wimg-${hashId}`,
      category: cat,
      itemId: cand.itemId || null,
      itemName: cleanText(cand.itemName) || 'Unassigned World DB Entry',
      candidateUrl: rawUrl,
      normalizedUrl: normUrl,
      source: cleanText(cand.source) || 'Daily World DB Sync',
      discoveredAt: new Date().toISOString(),
      status: 'pending_manual_approval',
    });
    stagedImages++;
  }

  // 6. Write changed files atomically (unless --dry-run)
  if (!opts.dryRun) {
    for (const cat of changedCats) {
      nextByCat[cat].updated = today;
      atomicWriteJson(path.join(PUBLIC_DATA_DIR, `${cat}.json`), nextByCat[cat]);
      atomicWriteJson(path.join(MIRROR_DATA_DIR, `${cat}.json`), nextByCat[cat]);
      console.log(`[OK] Updated public/data/${cat}.json & data/${cat}.json.`);
    }
    if (changedCats.size === 0) {
      console.log('[OK] No new verified World DB text updates — category JSONs unchanged.');
    }

    if (stagedImages > 0) {
      nextPending.updated = today;
      atomicWriteJson(PENDING_IMAGES_PATH, nextPending);
      console.log(
        `[OK] Staged ${stagedImages} new candidate image URL(s) in public/data/world-pending-images.json (skipped ${duplicatesSkipped} duplicates, ${disallowedSkipped} stock/blocked).`
      );
    } else {
      console.log(
        `[OK] No new World DB candidate images staged (skipped ${duplicatesSkipped} duplicates, ${disallowedSkipped} stock/blocked).`
      );
    }
  } else {
    console.log(
      `[DRY-RUN] changedCats=${Array.from(changedCats).join(',') || 'none'}, textFieldsUpdated=${textFieldsUpdated}, stagedImages=${stagedImages}, duplicatesSkipped=${duplicatesSkipped}, disallowedSkipped=${disallowedSkipped}`
    );
  }

  return {
    ok: true,
    aborted: false,
    changedCategories: Array.from(changedCats),
    textFieldsUpdated,
    stagedImages,
    duplicatesSkipped,
    disallowedSkipped,
  };
}

// CLI execution
const isMain = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename);
if (isMain) {
  const opts = parseArgs(process.argv.slice(2));
  runWorldDbSync(opts)
    .then((res) => {
      if (res.aborted) {
        process.exit(0);
      }
    })
    .catch((err) => {
      console.error('[FATAL] World DB sync error:', err.message);
      process.exit(1);
    });
}
