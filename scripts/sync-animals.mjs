#!/usr/bin/env node
/**
 * Safe Daily GTA 6 Wildlife Monitoring & Sync (scripts/sync-animals.mjs)
 *
 * SAFETY & POLICY GUARANTEES:
 * 1. Auto-updates verified text fields ONLY (new species names, habitats, regions).
 *    NEVER overwrites existing descriptions, classifications, or verified images.
 *    NEVER deletes existing records if an external source temporarily disappears.
 * 2. STRICT GTA VI IMAGE SOURCE POLICY:
 *    - Wikimedia Commons, Wikipedia, stock photography, AI slop, generic real-world
 *      animal photos, and older GTA game images are EXPLICITLY PROHIBITED.
 *    - ONLY authentic GTA VI imagery from GTA Wiki GTA VI pages/galleries and
 *      Rockstar official screenshots/trailers/promo materials is permitted.
 *    - Candidate images are staged into public/data/animals-pending-images.json
 *      with full image-source attribution (NEVER auto-overwriting verified shots).
 * 3. PENDING-REVIEW DISCOVERY QUEUE:
 *    - Discovers GTA VI animals from GTA Wiki (Category:Animals in GTA VI) and
 *      RSS feeds, deduplicating against existing public/data/animals.json records.
 *    - Unverified newly discovered species are staged into
 *      public/data/animals-pending-discoveries.json for editorial review.
 * 4. ZERO-CHANGE COMMIT PROTECTION & STRICT FAIL-SAFE:
 *    - If a fetch fails/times out or returns incomplete data, aborts without
 *      modifying any existing file.
 *    - If no meaningful content changes are detected, writes ZERO files and leaves
 *      all timestamps, HTML dateModified, and sitemap.xml lastmod untouched.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import {
  normalizeImageUrl,
  evaluateGta6ImageUrl,
  isDisallowedImageUrl,
  normalizeEntityName,
  singularizeName,
  meaningfulContentEqual,
} from './lib/gta6-image-policy.mjs';

export { normalizeImageUrl, evaluateGta6ImageUrl, isDisallowedImageUrl };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const PUBLIC_ANIMALS_PATH = path.join(ROOT_DIR, 'public', 'data', 'animals.json');
const MIRROR_ANIMALS_PATH = path.join(ROOT_DIR, 'data', 'animals.json');
const PENDING_IMAGES_PATH = path.join(ROOT_DIR, 'public', 'data', 'animals-pending-images.json');
const PENDING_DISCOVERIES_PATH = path.join(ROOT_DIR, 'public', 'data', 'animals-pending-discoveries.json');
const ANIMALS_HTML_PATH = path.join(ROOT_DIR, 'public', 'animals.html');
const SITEMAP_PATH = path.join(ROOT_DIR, 'public', 'sitemap.xml');

const GTA_WIKI_API = 'https://gta.fandom.com/api.php';
const MIN_CANDIDATE_WIDTH = 320;

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 GTA6HeistGuideWildlifeSync/2.0';

const DEFAULT_FEEDS = [
  {
    name: 'Google News GTA 6 Wildlife',
    url: 'https://news.google.com/rss/search?q=%22GTA+6%22+animals+OR+wildlife+OR+%22Bret+Vogel%22+OR+%22Legendary+Hunter%22&hl=en-US&gl=US&ceid=US:en',
    kind: 'rss',
  },
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

// Broad wiki umbrella pages already represented by specific species/breeds in animals.json
const ANIMAL_UMBRELLA_ALIASES = new Map([
  ['alligator', 'an-alligator'],
  ['cougar', 'an-panther'],
  ['panther', 'an-panther'],
  ['florida panther', 'an-panther'],
  ['cat', 'an-domestic-cat'],
  ['domestic cat', 'an-domestic-cat'],
  ['crane', 'an-whooping-crane'],
  ['flamingo', 'an-flamingo'],
  ['fox', 'an-red-fox'],
  ['iguana', 'an-green-iguana'],
  ['spoonbill', 'an-spoonbill'],
  ['snake', 'an-snake'],
  ['double crested cormorant', 'an-cormorant'],
  ['sea turtle', 'an-sea-turtle'],
  ['dog', 'an-chihuahua'], // multiple dog breeds already indexed in animals.json
  ['shark', 'an-hammerhead'], // hammerhead & great white already indexed in animals.json
]);

// Generic umbrella wiki pages that should not be queued as single animal species
const GENERIC_NON_SPECIES_PAGES = new Set(['fish', 'animal', 'animals', 'bird', 'birds', 'wildlife']);

function updateFreshnessOnRealChange(today) {
  if (fs.existsSync(ANIMALS_HTML_PATH)) {
    const html = fs.readFileSync(ANIMALS_HTML_PATH, 'utf-8');
    const nextHtml = html
      .replace(/("dateModified"\s*:\s*")\d{4}-\d{2}-\d{2}(")/g, `$1${today}$2`)
      .replace(/(Last Updated:\s*<[^>]+>)\d{4}-\d{2}-\d{2}(<\/[^>]+>)/gi, `$1${today}$2`)
      .replace(/(Last Updated:\s*)\d{4}-\d{2}-\d{2}/gi, `$1${today}`);
    if (nextHtml !== html) {
      fs.writeFileSync(ANIMALS_HTML_PATH, nextHtml, 'utf-8');
    }
  }
  if (fs.existsSync(SITEMAP_PATH)) {
    const xml = fs.readFileSync(SITEMAP_PATH, 'utf-8');
    const rx = /(<loc>https:\/\/www\.gta6heistguide\.com\/animals\.html<\/loc>\s*<lastmod>)\d{4}-\d{2}-\d{2}(<\/lastmod>)/;
    const nextXml = xml.replace(rx, `$1${today}$2`);
    if (nextXml !== xml) {
      fs.writeFileSync(SITEMAP_PATH, nextXml, 'utf-8');
    }
  }
}

function parseArgs(argv) {
  const opts = {
    dryRun: false,
    simulateFailure: false,
    skipWiki: false,
    feedFile: null,
    timeoutMs: 12000,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--dry-run') opts.dryRun = true;
    else if (a === '--simulate-failure') opts.simulateFailure = true;
    else if (a === '--skip-wiki') opts.skipWiki = true;
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

function matchExistingAnimal(rawTitle, byId, byNormName, bySingName) {
  const norm = normalizeEntityName(rawTitle);
  const sing = singularizeName(rawTitle);
  if (!norm) return null;

  const aliasId = ANIMAL_UMBRELLA_ALIASES.get(norm) || ANIMAL_UMBRELLA_ALIASES.get(sing);
  if (aliasId && byId.has(aliasId)) return byId.get(aliasId);

  if (byNormName.has(norm)) return byNormName.get(norm);
  if (bySingName.has(sing)) return bySingName.get(sing);

  // Substring token match for compound names like "American Flamingo" vs "Flamingos"
  for (const [k, item] of bySingName.entries()) {
    if (sing.length >= 4 && (k === sing || k.split(' ').includes(sing) || sing.split(' ').includes(k))) {
      return item;
    }
  }
  return null;
}

async function fetchJsonStrict(url, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'application/json',
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} from ${url}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Query GTA Wiki MediaWiki API for Category:Animals in GTA VI and extract
 * authentic GTA VI animal discoveries & strictly validated GTA VI image candidates.
 */
async function fetchGtaWikiAnimals(timeoutMs) {
  const cmUrl =
    GTA_WIKI_API +
    '?' +
    new URLSearchParams({
      action: 'query',
      format: 'json',
      list: 'categorymembers',
      cmtitle: 'Category:Animals in GTA VI',
      cmnamespace: '0',
      cmlimit: '200',
    });

  const cmJson = await fetchJsonStrict(cmUrl, timeoutMs);
  const members = cmJson?.query?.categorymembers;
  if (!Array.isArray(members) || members.length === 0) {
    throw new Error('GTA Wiki Category:Animals in GTA VI returned empty member list.');
  }

  const pageTitles = members
    .map((m) => String(m?.title || '').trim())
    .filter((t) => t && !t.includes(':'));

  // Batch fetch images on all GTA VI animal pages (chunks of 20 titles)
  const pageToGtaviFiles = new Map();
  const allGtaviFiles = new Set();

  for (let i = 0; i < pageTitles.length; i += 20) {
    const chunk = pageTitles.slice(i, i + 20);
    const imgUrl =
      GTA_WIKI_API +
      '?' +
      new URLSearchParams({
        action: 'query',
        format: 'json',
        titles: chunk.join('|'),
        prop: 'images',
        imlimit: '500',
      });
    const imgJson = await fetchJsonStrict(imgUrl, timeoutMs);
    const pages = Object.values(imgJson?.query?.pages || {});
    for (const p of pages) {
      const title = String(p?.title || '').trim();
      if (!title) continue;
      const files = (p.images || [])
        .map((im) => String(im?.title || '').trim())
        .filter((f) => /gtavi|gta[_-]?vi|gta[_-]?6/i.test(f) && /\.(png|jpe?g|webp)$/i.test(f))
        // Exclude generic region wallpapers that aren't specific animal captures unless tied to trailer/animal
        .filter((f) => !/(?:Artwork|Postcard)-.*-BG-GTAVI/i.test(f));
      pageToGtaviFiles.set(title, files);
      for (const f of files) allGtaviFiles.add(f);
    }
  }

  // Batch resolve imageinfo (actual CDN URL + resolution)
  const fileInfoMap = new Map();
  const fileList = Array.from(allGtaviFiles);
  for (let i = 0; i < fileList.length; i += 25) {
    const chunk = fileList.slice(i, i + 25);
    const infoUrl =
      GTA_WIKI_API +
      '?' +
      new URLSearchParams({
        action: 'query',
        format: 'json',
        titles: chunk.join('|'),
        prop: 'imageinfo',
        iiprop: 'url|size|mime',
      });
    const infoJson = await fetchJsonStrict(infoUrl, timeoutMs);
    const pages = Object.values(infoJson?.query?.pages || {});
    for (const p of pages) {
      const title = String(p?.title || '').trim();
      const ii = Array.isArray(p?.imageinfo) ? p.imageinfo[0] : null;
      if (!title || !ii?.url) continue;
      if ((ii.width || 0) < MIN_CANDIDATE_WIDTH) continue;
      if (!/^image\/(jpeg|png|webp)$/i.test(ii.mime || '')) continue;
      fileInfoMap.set(title, {
        fileTitle: title,
        url: ii.url,
        width: ii.width || null,
        height: ii.height || null,
        mime: ii.mime || null,
      });
    }
  }

  const wikiDiscoveries = [];
  const wikiImageCandidates = [];

  for (const title of pageTitles) {
    const wikiPageUrl = `https://gta.fandom.com/wiki/${encodeURIComponent(title.replace(/ /g, '_'))}`;
    const files = pageToGtaviFiles.get(title) || [];
    const verifiedFileUrls = [];

    for (const f of files) {
      const info = fileInfoMap.get(f);
      if (!info) continue;
      const evalRes = evaluateGta6ImageUrl(info.url, {
        fileName: f,
        contextText: `${title} GTA VI`,
      });
      if (!evalRes.allowed) continue;

      verifiedFileUrls.push({
        candidateUrl: evalRes.normalizedUrl,
        imageSource: evalRes.imageSource,
        fileTitle: f,
        width: info.width,
        height: info.height,
      });

      wikiImageCandidates.push({
        speciesId: null,
        speciesName: title,
        candidateUrl: evalRes.normalizedUrl,
        source: evalRes.imageSource,
        sourceUrl: wikiPageUrl,
        wikiFile: f,
        width: info.width,
        height: info.height,
      });
    }

    wikiDiscoveries.push({
      wikiTitle: title,
      sourceUrl: wikiPageUrl,
      candidateImages: verifiedFileUrls,
    });
  }

  return { wikiDiscoveries, wikiImageCandidates, pagesScanned: pageTitles.length };
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
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'application/rss+xml, application/xml, application/json, text/xml',
      },
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
  const fallback = {
    updated: new Date().toISOString().slice(0, 10),
    policy:
      'Candidate GTA VI image URLs discovered by scripts/sync-animals.mjs from approved GTA Wiki GTA VI pages and Rockstar official media are staged here for manual editorial review. Wikimedia Commons, stock photos, real-world animal photos, AI-generated, and duplicate images are strictly rejected and NEVER published.',
    candidates: [],
  };
  if (!fs.existsSync(PENDING_IMAGES_PATH)) return fallback;
  try {
    const parsed = JSON.parse(fs.readFileSync(PENDING_IMAGES_PATH, 'utf-8'));
    if (parsed && Array.isArray(parsed.candidates)) return parsed;
  } catch {
    throw new Error('Existing public/data/animals-pending-images.json is invalid JSON — aborting.');
  }
  return fallback;
}

function loadPendingDiscoveriesSafely() {
  const fallback = {
    updated: new Date().toISOString().slice(0, 10),
    policy:
      'Unverified newly discovered GTA VI animal species from external sources (e.g. GTA Wiki Category:Animals in GTA VI) are queued here for editorial review before promotion to public/data/animals.json. Existing verified records are never overwritten or deleted.',
    discoveries: [],
  };
  if (!fs.existsSync(PENDING_DISCOVERIES_PATH)) return fallback;
  try {
    const parsed = JSON.parse(fs.readFileSync(PENDING_DISCOVERIES_PATH, 'utf-8'));
    if (parsed && Array.isArray(parsed.discoveries)) return parsed;
  } catch {
    throw new Error('Existing public/data/animals-pending-discoveries.json is invalid JSON — aborting.');
  }
  return fallback;
}

export async function runWildlifeSync(opts = {}) {
  const today = new Date().toISOString().slice(0, 10);
  const existingAnimals = loadAnimalsSafely();
  const existingPending = loadPendingImagesSafely();
  const existingDiscoveries = loadPendingDiscoveriesSafely();

  // Snapshot verified images & item count for strict post-merge invariant checks
  const originalCount = existingAnimals.items.length;
  const verifiedImagesSnapshot = new Map();
  for (const item of existingAnimals.items) {
    if (item && item.id && (item.manualHqLocked === true || (item.imageVerified === true && item.image))) {
      verifiedImagesSnapshot.set(item.id, {
        image: item.image,
        imageVerified: item.imageVerified,
        imageSource: item.imageSource || null,
        manualHqLocked: item.manualHqLocked === true,
      });
    }
  }

  if (opts.simulateFailure) {
    console.warn('[FAIL-SAFE ABORT] Simulated fetch/timeout failure triggered — zero files modified.');
    return { ok: false, aborted: true, reason: 'simulated-failure' };
  }

  const speciesUpdates = [];
  const rawImageCandidates = [];
  const wikiDiscoveries = [];
  let successfulSources = 0;
  const sourceErrors = [];

  try {
    if (opts.feedFile) {
      const resolvedFeed = path.resolve(opts.feedFile);
      const raw = fs.readFileSync(resolvedFeed, 'utf-8');
      const kind = resolvedFeed.endsWith('.json') ? 'json' : 'rss';
      const parsed = validateAndParseFeed(raw, kind);
      speciesUpdates.push(...parsed.speciesUpdates);
      rawImageCandidates.push(...parsed.imageCandidates);
      successfulSources++;
    } else {
      // 1. GTA Wiki GTA VI animal discovery & official GTA VI gallery check
      if (!opts.skipWiki) {
        try {
          const wiki = await fetchGtaWikiAnimals(opts.timeoutMs || 15000);
          wikiDiscoveries.push(...wiki.wikiDiscoveries);
          rawImageCandidates.push(...wiki.wikiImageCandidates);
          successfulSources++;
          console.log(
            `[INFO] GTA Wiki Animals in GTA VI scanned: ${wiki.pagesScanned} pages, ${wiki.wikiImageCandidates.length} approved GTA VI image candidate(s).`
          );
        } catch (err) {
          sourceErrors.push(`GTA Wiki: ${err.message}`);
          console.warn(`[WARN] GTA Wiki animals check skipped (existing data preserved): ${err.message}`);
        }
      }

      // 2. Existing Google News GTA 6 wildlife RSS check
      for (const feed of DEFAULT_FEEDS) {
        try {
          const parsed = await fetchFeedStrict(feed, opts.timeoutMs || 12000);
          speciesUpdates.push(...parsed.speciesUpdates);
          rawImageCandidates.push(...parsed.imageCandidates);
          successfulSources++;
        } catch (err) {
          sourceErrors.push(`${feed.name}: ${err.message}`);
          console.warn(`[WARN] Feed ${feed.name} skipped (existing data preserved): ${err.message}`);
        }
      }
    }
  } catch (err) {
    console.warn(`[FAIL-SAFE ABORT] Wildlife feed failed or returned incomplete data: ${err.message}`);
    console.warn('[FAIL-SAFE ABORT] Existing public/data/animals.json and verified images left completely untouched.');
    return { ok: false, aborted: true, reason: err.message };
  }

  if (successfulSources === 0) {
    const reason = sourceErrors.join('; ') || 'no-feeds-succeeded';
    console.warn(`[FAIL-SAFE ABORT] All wildlife sources failed (${reason}) — zero files modified.`);
    return { ok: false, aborted: true, reason };
  }

  // Deep-clone existing data so we only mutate verified text fields cleanly
  const nextAnimals = JSON.parse(JSON.stringify(existingAnimals));
  const byId = new Map();
  const byNormName = new Map();
  const bySingName = new Map();
  for (const item of nextAnimals.items) {
    byId.set(item.id, item);
    const n = normalizeEntityName(item.name);
    const s = singularizeName(item.name);
    if (n) byNormName.set(n, item);
    if (s) bySingName.set(s, item);
  }

  let textFieldsUpdated = 0;
  let speciesAdded = 0;

  // 1. Apply VERIFIED TEXT FIELDS ONLY (names, habitats, regions) — NEVER overwrite images or good descriptions!
  for (const cand of speciesUpdates) {
    if (!cand || typeof cand !== 'object' || cand.verified !== true) continue;
    const cleanName = cleanText(cand.name);
    if (!cleanName || cleanName.length < 2) continue;

    const cleanRegion = VALID_REGIONS.has(cand.region) ? cand.region : null;
    const cleanCategory = VALID_CATEGORIES.has(cand.category) ? cand.category : null;
    const cleanHabitat = cleanText(cand.habitat);
    const cleanNotes = cleanText(cand.notes);

    if (cand.candidateImageUrl || cand.imageUrl) {
      rawImageCandidates.push({
        speciesId: cand.id || slugify(cleanName),
        speciesName: cleanName,
        candidateUrl: cand.candidateImageUrl || cand.imageUrl,
        source: cand.source || 'Verified Text Sync Feed',
        sourceUrl: cand.sourceUrl || null,
      });
    }

    const match = (cand.id && byId.get(cand.id)) || matchExistingAnimal(cleanName, byId, byNormName, bySingName);
    if (match) {
      // Preserve existing rich descriptions/classifications; only fill missing or clearly richer verified habitat
      if (cleanHabitat && (!match.habitat || match.habitat === match.region)) {
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
          verificationStatus: 'Confirmed',
          lastUpdated: today,
          sourceUrl: cand.sourceUrl || 'https://www.rockstargames.com/VI',
          mapPinId: newId,
        };
        nextAnimals.items.push(newEntry);
        byId.set(newId, newEntry);
        byNormName.set(normalizeEntityName(cleanName), newEntry);
        bySingName.set(singularizeName(cleanName), newEntry);
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
    if (!item || item.image !== snap.image || item.imageVerified !== true || (snap.manualHqLocked && item.manualHqLocked !== true)) {
      throw new Error(`Invariant violation: verified/locked image altered for ${id} — aborting write.`);
    }
  }
  nextAnimals.birdStats = existingAnimals.birdStats;

  // 2. Stage unverified newly discovered GTA Wiki animal species into pending-review queue (preventing duplicates!)
  const nextDiscoveries = JSON.parse(JSON.stringify(existingDiscoveries));
  const knownDiscoveryKeys = new Set(
    nextDiscoveries.discoveries.map((d) => singularizeName(d.wikiTitle || d.name || ''))
  );
  let discoveriesQueued = 0;

  for (const disc of wikiDiscoveries) {
    const sing = singularizeName(disc.wikiTitle);
    if (!sing || GENERIC_NON_SPECIES_PAGES.has(sing)) continue;
    const existingMatch = matchExistingAnimal(disc.wikiTitle, byId, byNormName, bySingName);
    if (existingMatch) continue; // Already in animals.json — prevent duplicates!
    if (knownDiscoveryKeys.has(sing)) continue; // Already queued!

    knownDiscoveryKeys.add(sing);
    const idHash = crypto.createHash('sha1').update(sing).digest('hex').slice(0, 10);
    nextDiscoveries.discoveries.push({
      id: `disc-an-${idHash}`,
      wikiTitle: disc.wikiTitle,
      suggestedName: disc.wikiTitle.replace(/\s*\([^)]*\)\s*/g, '').trim(),
      source: 'GTA Wiki (Category:Animals in GTA VI)',
      sourceUrl: disc.sourceUrl,
      candidateImages: disc.candidateImages.slice(0, 4),
      discoveredAt: new Date().toISOString(),
      status: 'pending_manual_review',
    });
    discoveriesQueued++;
  }

  // 3. Stage candidate GTA VI image URLs into public/data/animals-pending-images.json with strict policy & deduplication
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
    if (item.sourceImageUrl) {
      const n3 = normalizeImageUrl(item.sourceImageUrl);
      if (n3) knownNormalizedUrls.add(n3);
    }
  }

  let stagedImages = 0;
  let duplicatesSkipped = 0;
  let disallowedSkipped = 0;

  for (const cand of rawImageCandidates) {
    const rawUrl = String(cand.candidateUrl || '').trim();
    if (!rawUrl) continue;

    const evalRes = evaluateGta6ImageUrl(rawUrl, {
      fileName: cand.wikiFile || '',
      contextText: `${cand.speciesName || ''} ${cand.source || ''}`,
      source: cand.source,
    });

    if (!evalRes.allowed || !evalRes.normalizedUrl) {
      disallowedSkipped++;
      continue;
    }

    if (knownNormalizedUrls.has(evalRes.normalizedUrl)) {
      duplicatesSkipped++;
      continue;
    }

    // Resolve speciesId against existing animals.json if not set
    let resolvedSpeciesId = cand.speciesId || null;
    let resolvedSpeciesName = cleanText(cand.speciesName) || 'Unassigned Species';
    let matchedItem = resolvedSpeciesId ? byId.get(resolvedSpeciesId) : null;
    if (!matchedItem) {
      matchedItem = matchExistingAnimal(resolvedSpeciesName, byId, byNormName, bySingName);
      if (matchedItem) {
        resolvedSpeciesId = matchedItem.id;
        resolvedSpeciesName = matchedItem.name;
      }
    }
    // Never stage candidate images for a species that already has a verified GTA VI screenshot
    if (matchedItem && matchedItem.image && matchedItem.imageVerified === true) {
      duplicatesSkipped++;
      continue;
    }

    knownNormalizedUrls.add(evalRes.normalizedUrl);
    const hashId = crypto.createHash('sha1').update(evalRes.normalizedUrl).digest('hex').slice(0, 12);
    nextPending.candidates.push({
      id: `img-${hashId}`,
      speciesId: resolvedSpeciesId,
      speciesName: resolvedSpeciesName,
      candidateUrl: rawUrl,
      normalizedUrl: evalRes.normalizedUrl,
      imageSource: evalRes.imageSource,
      source: evalRes.imageSource || cleanText(cand.source) || 'GTA Wiki (GTA VI Gallery)',
      sourceUrl: cand.sourceUrl || null,
      width: cand.width || null,
      height: cand.height || null,
      discoveredAt: new Date().toISOString(),
      status: 'pending_manual_approval',
    });
    stagedImages++;
  }

  const animalsChanged = !meaningfulContentEqual(existingAnimals, nextAnimals);
  const pendingChanged = !meaningfulContentEqual(existingPending, nextPending);
  const discoveriesChanged = !meaningfulContentEqual(existingDiscoveries, nextDiscoveries);

  if (!opts.dryRun) {
    if (animalsChanged) {
      nextAnimals.updated = today;
      atomicWriteJson(PUBLIC_ANIMALS_PATH, nextAnimals);
      atomicWriteJson(MIRROR_ANIMALS_PATH, nextAnimals);
      updateFreshnessOnRealChange(today);
      console.log(
        `[OK] Updated public/data/animals.json, data/animals.json, animals.html dateModified & sitemap.xml lastmod (+${speciesAdded} species, ${textFieldsUpdated} verified text updates).`
      );
    } else {
      console.log(
        '[OK] No new verified wildlife text updates — animals.json, animals.html dateModified & sitemap.xml lastmod left untouched.'
      );
    }

    if (pendingChanged) {
      nextPending.updated = today;
      atomicWriteJson(PENDING_IMAGES_PATH, nextPending);
      console.log(
        `[OK] Staged ${stagedImages} new GTA VI candidate image URL(s) in public/data/animals-pending-images.json (skipped ${duplicatesSkipped} duplicates, ${disallowedSkipped} prohibited/non-GTA-VI).`
      );
    } else {
      console.log(
        `[OK] No new candidate wildlife images staged (skipped ${duplicatesSkipped} duplicates, ${disallowedSkipped} prohibited/non-GTA-VI).`
      );
    }

    if (discoveriesChanged) {
      nextDiscoveries.updated = today;
      atomicWriteJson(PENDING_DISCOVERIES_PATH, nextDiscoveries);
      console.log(
        `[OK] Queued ${discoveriesQueued} unverified animal discovery/discoveries in public/data/animals-pending-discoveries.json for editorial review.`
      );
    } else {
      console.log('[OK] No new unverified animal discoveries queued.');
    }
  } else {
    console.log(
      `[DRY-RUN] speciesAdded=${speciesAdded}, textFieldsUpdated=${textFieldsUpdated}, stagedImages=${stagedImages}, discoveriesQueued=${discoveriesQueued}, duplicatesSkipped=${duplicatesSkipped}, disallowedSkipped=${disallowedSkipped}`
    );
  }

  return {
    ok: true,
    aborted: false,
    changed: animalsChanged || pendingChanged || discoveriesChanged,
    speciesAdded,
    textFieldsUpdated,
    stagedImages,
    discoveriesQueued,
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
        process.exit(0);
      }
    })
    .catch((err) => {
      console.error('[FATAL] Wildlife sync error:', err.message);
      process.exit(1);
    });
}
