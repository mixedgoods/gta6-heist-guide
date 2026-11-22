#!/usr/bin/env node
/**
 * Safe Daily GTA 6 Wildlife Sync (scripts/sync-animals.mjs)
 *
 * SAFETY GUARANTEES:
 * 1. Auto-updates verified text fields ONLY (new species names, habitats, regions).
 * 2. NEVER auto-publishes scraped images into public/data/animals.json — stages
 *    unique candidate image URLs into public/data/animals-pending-images.json
 *    for manual editorial approval, with duplicate-URL & stock-photo rejection.
 * 3. STRICT FAIL-SAFE: If a fetch fails, times out, or returns incomplete/truncated
 *    data, aborts the write immediately so existing public/data/animals.json
 *    records and verified images are NEVER erased or overwritten.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const PUBLIC_ANIMALS_PATH = path.join(ROOT_DIR, 'public', 'data', 'animals.json');
const MIRROR_ANIMALS_PATH = path.join(ROOT_DIR, 'data', 'animals.json');
const PENDING_IMAGES_PATH = path.join(ROOT_DIR, 'public', 'data', 'animals-pending-images.json');
const ANIMALS_HTML_PATH = path.join(ROOT_DIR, 'public', 'animals.html');
const SITEMAP_PATH = path.join(ROOT_DIR, 'public', 'sitemap.xml');

function updateFreshnessOnRealChange(today) {
  // Update visible Last Updated & JSON-LD dateModified in public/animals.html ONLY when real wildlife content changed
  if (fs.existsSync(ANIMALS_HTML_PATH)) {
    let html = fs.readFileSync(ANIMALS_HTML_PATH, 'utf-8');
    const nextHtml = html
      .replace(/("dateModified"\s*:\s*")\d{4}-\d{2}-\d{2}(")/g, `$1${today}$2`)
      .replace(/(Last Updated:\s*<[^>]+>)\d{4}-\d{2}-\d{2}(<\/[^>]+>)/gi, `$1${today}$2`)
      .replace(/(Last Updated:\s*)\d{4}-\d{2}-\d{2}/gi, `$1${today}`);
    if (nextHtml !== html) {
      fs.writeFileSync(ANIMALS_HTML_PATH, nextHtml, 'utf-8');
    }
  }
  // Update ONLY the /animals.html <lastmod> entry in public/sitemap.xml
  if (fs.existsSync(SITEMAP_PATH)) {
    const xml = fs.readFileSync(SITEMAP_PATH, 'utf-8');
    const rx = /(<loc>https:\/\/www\.gta6heistguide\.com\/animals\.html<\/loc>\s*<lastmod>)\d{4}-\d{2}-\d{2}(<\/lastmod>)/;
    const nextXml = xml.replace(rx, `$1${today}$2`);
    if (nextXml !== xml) {
      fs.writeFileSync(SITEMAP_PATH, nextXml, 'utf-8');
    }
  }
}

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 GTA6HeistGuideWildlifeSync/1.0';

const DEFAULT_FEEDS = [
  {
    name: 'Google News GTA 6 Wildlife',
    url: 'https://news.google.com/rss/search?q=%22GTA+6%22+animals+OR+wildlife+OR+%22Bret+Vogel%22+OR+%22Legendary+Hunter%22&hl=en-US&gl=US&ceid=US:en',
    kind: 'rss',
  },
];

// Stock photo & AI-slop domains strictly blocked from candidate staging
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

const VALID_REGIONS = new Set([
  'Vice City',
  'Leonida Keys',
  'Grassrivers',
  'Port Gellhorn',
  'Ambrosia',
  'Mount Kalaga National Park',
]);

const VALID_CATEGORIES = new Set([
  'Land & Predators',
  'Birds',
  'Marine & Aquatic',
  'Domestic/Pettable',
]);

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

function slugify(name) {
  return (
    'an-' +
    String(name || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 48)
  );
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

function validateAndParseFeed(rawText, kind) {
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
    const speciesUpdates = Array.isArray(parsed.species) ? parsed.species : [];
    const imageCandidates = Array.isArray(parsed.imageCandidates) ? parsed.imageCandidates : [];
    return { speciesUpdates, imageCandidates, itemsRead: speciesUpdates.length + imageCandidates.length };
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

    // Extract any media/enclosure image URLs for MANUAL review staging ONLY
    const mediaRegex = /<(?:media:content|media:thumbnail|enclosure)[^>]+url=["']([^"']+)["'][^>]*>/gi;
    let m;
    while ((m = mediaRegex.exec(block)) !== null) {
      const candidateUrl = m[1].trim();
      if (/\.(jpe?g|png|webp)(\?|$)/i.test(candidateUrl) || /image/i.test(m[0])) {
        imageCandidates.push({
          speciesId: null,
          speciesName: title.slice(0, 120) || 'Unassigned Wildlife Candidate',
          candidateUrl,
          source,
        });
      }
    }
  }

  return { speciesUpdates: [], imageCandidates, itemsRead: itemBlocks.length };
}

async function fetchFeedStrict(feed, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(feed.url, {
      signal: controller.signal,
      headers: { 'User-Agent': USER_AGENT, Accept: 'application/rss+xml, application/xml, application/json, text/xml' },
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} from ${feed.url}`);
    }
    const text = await res.text();
    return validateAndParseFeed(text, feed.kind);
  } finally {
    clearTimeout(timer);
  }
}

function atomicWriteJson(filePath, dataObj) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const tmpPath = `${filePath}.tmp.${process.pid}`;
  const serialized = JSON.stringify(dataObj, null, 2) + '\n';
  fs.writeFileSync(tmpPath, serialized, 'utf-8');
  // Re-parse tmp file before swap to guarantee valid JSON on disk
  JSON.parse(fs.readFileSync(tmpPath, 'utf-8'));
  fs.renameSync(tmpPath, filePath);
}

function loadAnimalsSafely() {
  if (!fs.existsSync(PUBLIC_ANIMALS_PATH)) {
    throw new Error(`Existing animals database missing at ${PUBLIC_ANIMALS_PATH}`);
  }
  const parsed = JSON.parse(fs.readFileSync(PUBLIC_ANIMALS_PATH, 'utf-8'));
  if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.items) || parsed.items.length === 0) {
    throw new Error('Existing public/data/animals.json is empty or malformed — aborting.');
  }
  return parsed;
}

function loadPendingImagesSafely() {
  if (!fs.existsSync(PENDING_IMAGES_PATH)) {
    return {
      updated: new Date().toISOString().slice(0, 10),
      policy:
        'Candidate image URLs discovered by scripts/sync-animals.mjs are staged here for manual editorial review. NEVER auto-publish scraped, stock, AI, or duplicate images directly into public/data/animals.json.',
      candidates: [],
    };
  }
  try {
    const parsed = JSON.parse(fs.readFileSync(PENDING_IMAGES_PATH, 'utf-8'));
    if (parsed && Array.isArray(parsed.candidates)) return parsed;
  } catch {
    // Do not crash on pending queue parse failure; abort instead to protect manual queue
    throw new Error('Existing public/data/animals-pending-images.json is invalid JSON — aborting.');
  }
  return {
    updated: new Date().toISOString().slice(0, 10),
    policy:
      'Candidate image URLs discovered by scripts/sync-animals.mjs are staged here for manual editorial review. NEVER auto-publish scraped, stock, AI, or duplicate images directly into public/data/animals.json.',
    candidates: [],
  };
}

export async function runWildlifeSync(opts = {}) {
  const today = new Date().toISOString().slice(0, 10);
  const existingAnimals = loadAnimalsSafely();
  const existingPending = loadPendingImagesSafely();

  // Snapshot verified images & item count for strict post-merge invariant checks
  const originalCount = existingAnimals.items.length;
  const verifiedImagesSnapshot = new Map();
  for (const item of existingAnimals.items) {
    if (item && item.id && item.imageVerified === true && item.image) {
      verifiedImagesSnapshot.set(item.id, {
        image: item.image,
        imageVerified: item.imageVerified,
        imageSource: item.imageSource || null,
      });
    }
  }

  if (opts.simulateFailure) {
    console.warn('[FAIL-SAFE ABORT] Simulated fetch/timeout failure triggered — zero files modified.');
    return { ok: false, aborted: true, reason: 'simulated-failure' };
  }

  // Collect payloads from either local test feed file or remote feeds (STRICT fail-safe)
  const speciesUpdates = [];
  const rawImageCandidates = [];
  let successfulFeeds = 0;

  try {
    if (opts.feedFile) {
      const resolvedFeed = path.resolve(opts.feedFile);
      const raw = fs.readFileSync(resolvedFeed, 'utf-8');
      const kind = resolvedFeed.endsWith('.json') ? 'json' : 'rss';
      const parsed = validateAndParseFeed(raw, kind);
      speciesUpdates.push(...parsed.speciesUpdates);
      rawImageCandidates.push(...parsed.imageCandidates);
      successfulFeeds++;
    } else {
      for (const feed of DEFAULT_FEEDS) {
        const parsed = await fetchFeedStrict(feed, opts.timeoutMs || 12000);
        speciesUpdates.push(...parsed.speciesUpdates);
        rawImageCandidates.push(...parsed.imageCandidates);
        successfulFeeds++;
      }
    }
  } catch (err) {
    console.warn(`[FAIL-SAFE ABORT] Wildlife feed failed or returned incomplete data: ${err.message}`);
    console.warn('[FAIL-SAFE ABORT] Existing public/data/animals.json and verified images left completely untouched.');
    return { ok: false, aborted: true, reason: err.message };
  }

  if (successfulFeeds === 0) {
    console.warn('[FAIL-SAFE ABORT] No feeds succeeded — aborting write.');
    return { ok: false, aborted: true, reason: 'no-feeds-succeeded' };
  }

  // Deep-clone existing data so we only mutate verified text fields cleanly
  const nextAnimals = JSON.parse(JSON.stringify(existingAnimals));
  const byId = new Map();
  const byName = new Map();
  for (const item of nextAnimals.items) {
    byId.set(item.id, item);
    byName.set(String(item.name || '').toLowerCase().trim(), item);
  }

  let textFieldsUpdated = 0;
  let speciesAdded = 0;

  // 1. Apply VERIFIED TEXT FIELDS ONLY (names, habitats, regions) — NEVER touch images!
  for (const cand of speciesUpdates) {
    if (!cand || typeof cand !== 'object' || cand.verified !== true) continue;
    const cleanName = cleanText(cand.name);
    if (!cleanName || cleanName.length < 2) continue;

    const cleanRegion = VALID_REGIONS.has(cand.region) ? cand.region : null;
    const cleanCategory = VALID_CATEGORIES.has(cand.category) ? cand.category : null;
    const cleanHabitat = cleanText(cand.habitat);
    const cleanNotes = cleanText(cand.notes);

    // Stage any image URL attached to a species update into pending-images.json ONLY
    if (cand.candidateImageUrl || cand.imageUrl) {
      rawImageCandidates.push({
        speciesId: cand.id || slugify(cleanName),
        speciesName: cleanName,
        candidateUrl: cand.candidateImageUrl || cand.imageUrl,
        source: cand.source || 'Verified Text Sync Feed',
      });
    }

    const match = byId.get(cand.id) || byName.get(cleanName.toLowerCase());
    if (match) {
      // Only enrich verified text fields (habitat, region, notes) — NEVER overwrite image fields
      if (cleanHabitat && cleanHabitat !== match.habitat) {
        match.habitat = cleanHabitat;
        textFieldsUpdated++;
      }
      if (cleanRegion && !match.region) {
        match.region = cleanRegion;
        textFieldsUpdated++;
      }
      if (cleanNotes && (!match.notes || match.notes.length < 15)) {
        match.notes = cleanNotes;
        textFieldsUpdated++;
      }
    } else if (cleanRegion && cleanCategory) {
      const newId = cand.id && typeof cand.id === 'string' ? cand.id : slugify(cleanName);
      if (!byId.has(newId)) {
        const newEntry = {
          id: newId,
          name: cleanName,
          category: cleanCategory,
          region: cleanRegion,
          habitat: cleanHabitat || cleanRegion,
          danger: cleanText(cand.danger) || 'Unclassified',
          tags: Array.isArray(cand.tags)
            ? cand.tags.filter((t) => t === 'target-deck' || t === 'legendary-hunter')
            : [],
          notes: cleanNotes || `Verified Leonida wildlife species found in ${cleanHabitat || cleanRegion}.`,
          image: null,
          imageVerified: false,
          imageSource: null,
          pinId: newId,
        };
        nextAnimals.items.push(newEntry);
        byId.set(newId, newEntry);
        byName.set(cleanName.toLowerCase(), newEntry);
        speciesAdded++;
      }
    }
  }

  // Enforce strict invariant: NEVER lose species, NEVER overwrite verified images, ALWAYS keep separate birdStats
  if (nextAnimals.items.length < originalCount) {
    throw new Error('Invariant violation: species count shrunk — aborting write.');
  }
  for (const [id, snap] of verifiedImagesSnapshot.entries()) {
    const item = byId.get(id);
    if (!item || item.image !== snap.image || item.imageVerified !== true) {
      throw new Error(`Invariant violation: verified image altered for ${id} — aborting write.`);
    }
  }
  // Guarantee separate bird stats remain intact
  nextAnimals.birdStats = existingAnimals.birdStats;

  // 2. Stage candidate image URLs into public/data/animals-pending-images.json with duplicate-URL detection
  const nextPending = JSON.parse(JSON.stringify(existingPending));
  const knownNormalizedUrls = new Set();

  for (const c of nextPending.candidates) {
    const n1 = normalizeImageUrl(c.normalizedUrl || c.candidateUrl);
    if (n1) knownNormalizedUrls.add(n1);
  }
  for (const item of nextAnimals.items) {
    if (item.image) {
      const n2 = normalizeImageUrl(item.image);
      if (n2) knownNormalizedUrls.add(n2);
      knownNormalizedUrls.add(String(item.image).trim().toLowerCase());
    }
  }

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
    if (!normUrl || knownNormalizedUrls.has(normUrl)) {
      duplicatesSkipped++;
      continue;
    }
    knownNormalizedUrls.add(normUrl);
    const hashId = crypto.createHash('sha1').update(normUrl).digest('hex').slice(0, 12);
    nextPending.candidates.push({
      id: `img-${hashId}`,
      speciesId: cand.speciesId || null,
      speciesName: cleanText(cand.speciesName) || 'Unassigned Species',
      candidateUrl: rawUrl,
      normalizedUrl: normUrl,
      source: cleanText(cand.source) || 'Daily Wildlife Sync',
      discoveredAt: new Date().toISOString(),
      status: 'pending_manual_approval',
    });
    stagedImages++;
  }

  const animalsChanged = speciesAdded > 0 || textFieldsUpdated > 0;
  const pendingChanged = stagedImages > 0;

  if (!opts.dryRun) {
    if (animalsChanged) {
      nextAnimals.updated = today;
      atomicWriteJson(PUBLIC_ANIMALS_PATH, nextAnimals);
      atomicWriteJson(MIRROR_ANIMALS_PATH, nextAnimals);
      updateFreshnessOnRealChange(today);
      console.log(`[OK] Updated public/data/animals.json, data/animals.json, animals.html dateModified & sitemap.xml lastmod (+${speciesAdded} species, ${textFieldsUpdated} verified text updates).`);
    } else {
      console.log('[OK] No new verified wildlife text updates — animals.json, animals.html dateModified & sitemap.xml lastmod left untouched.');
    }

    if (pendingChanged) {
      nextPending.updated = today;
      atomicWriteJson(PENDING_IMAGES_PATH, nextPending);
      console.log(`[OK] Staged ${stagedImages} new candidate image URL(s) in public/data/animals-pending-images.json (skipped ${duplicatesSkipped} duplicates, ${disallowedSkipped} stock/blocked).`);
    } else {
      console.log(`[OK] No new candidate images staged (skipped ${duplicatesSkipped} duplicates, ${disallowedSkipped} stock/blocked).`);
    }
  } else {
    console.log(`[DRY-RUN] speciesAdded=${speciesAdded}, textFieldsUpdated=${textFieldsUpdated}, stagedImages=${stagedImages}, duplicatesSkipped=${duplicatesSkipped}, disallowedSkipped=${disallowedSkipped}`);
  }

  return {
    ok: true,
    aborted: false,
    speciesAdded,
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
  runWildlifeSync(opts)
    .then((res) => {
      if (res.aborted) {
        // Exit 0 on fail-safe abort in scheduled CI only if network failed, OR exit cleanly with warning?
        // Using exit code 0 when --simulate-failure isn't fatal keeps scheduled workflows from spamming failure alerts
        // while strictly preserving all existing files untouched.
        process.exit(0);
      }
    })
    .catch((err) => {
      console.error('[FATAL] Wildlife sync error:', err.message);
      process.exit(1);
    });
}
