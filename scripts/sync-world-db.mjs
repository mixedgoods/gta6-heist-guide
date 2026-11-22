#!/usr/bin/env node
/**
 * Safe Daily GTA 6 World Database Monitoring & Sync (scripts/sync-world-db.mjs)
 * Covers: Vehicles, Weapons, Properties, Gun Stores, and Radio Stations.
 *
 * SAFETY & POLICY GUARANTEES:
 * 1. Auto-updates VERIFIED TEXT FIELDS ONLY (never fabricates stats, never overwrites
 *    existing descriptions/classifications or publishes scraped photos directly into
 *    public/data/*.json, and never deletes existing records when a source is unavailable).
 * 2. STRICT GTA VI IMAGE SOURCE POLICY:
 *    - Wikimedia Commons, Wikipedia, stock photos, AI-generated imagery, generic real-world
 *      vehicle/weapon photos, and older GTA game images are EXPLICITLY PROHIBITED.
 *    - ONLY authentic GTA VI imagery from GTA Wiki GTA VI pages/galleries and Rockstar
 *      official screenshots/trailers/promo materials is permitted.
 *    - Candidate image URLs are staged into public/data/world-pending-images.json with
 *      full image-source attribution and cross-database deduplication.
 * 3. PENDING-REVIEW DISCOVERY QUEUE:
 *    - Discovers GTA VI vehicles from GTA Wiki (Vehicles in GTA VI/table & /images) and
 *      RSS feeds, deduplicating against existing public/data/vehicles.json entries.
 *    - Newly discovered unverified vehicles are queued in
 *      public/data/world-pending-discoveries.json for editorial review.
 * 4. ZERO-CHANGE COMMIT PROTECTION & STRICT FAIL-SAFE:
 *    - If all sources fail or return incomplete data, aborts with zero files modified.
 *    - If no meaningful content changes are detected, writes ZERO files and leaves all
 *      timestamps, HTML dateModified, and sitemap.xml lastmod untouched.
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
  meaningfulContentEqual,
} from './lib/gta6-image-policy.mjs';

export { normalizeImageUrl, evaluateGta6ImageUrl, isDisallowedImageUrl };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const PUBLIC_DATA_DIR = path.join(ROOT_DIR, 'public', 'data');
const MIRROR_DATA_DIR = path.join(ROOT_DIR, 'data');
const PENDING_IMAGES_PATH = path.join(PUBLIC_DATA_DIR, 'world-pending-images.json');
const PENDING_DISCOVERIES_PATH = path.join(PUBLIC_DATA_DIR, 'world-pending-discoveries.json');
const ANIMALS_JSON_PATH = path.join(PUBLIC_DATA_DIR, 'animals.json');
const ANIMALS_PENDING_PATH = path.join(PUBLIC_DATA_DIR, 'animals-pending-images.json');
const SITEMAP_PATH = path.join(ROOT_DIR, 'public', 'sitemap.xml');

const GTA_WIKI_API = 'https://gta.fandom.com/api.php';
const MIN_CANDIDATE_WIDTH = 320;

const CATEGORIES = ['vehicles', 'weapons', 'properties', 'gun-stores', 'radio'];
const CATEGORY_PAGE_MAP = {
  vehicles: { html: ['vehicles.html', 'vehicles-getaway-cars.html'], loc: 'https://www.gta6heistguide.com/vehicles.html' },
  weapons: { html: ['weapons.html', 'weapons-gear.html'], loc: 'https://www.gta6heistguide.com/weapons.html' },
  properties: { html: ['properties.html'], loc: 'https://www.gta6heistguide.com/properties.html' },
  'gun-stores': { html: ['weapons-bonuses.html'], loc: 'https://www.gta6heistguide.com/weapons-bonuses.html' },
  radio: { html: ['radio.html'], loc: 'https://www.gta6heistguide.com/radio.html' },
};

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 GTA6HeistGuideWorldDbSync/2.0';

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

const VEHICLE_MANUFACTURERS = [
  'albany', 'annis', 'benefactor', 'bf', 'bollokan', 'bravado', 'brute', 'buckingham',
  'canis', 'chariot', 'cheval', 'classique', 'coil', 'crest', 'declasse', 'dewbauchee',
  'dinka', 'dundreary', 'emperor', 'enus', 'fathom', 'gallivanter', 'grotti', 'hijak',
  'hvy', 'imponte', 'invetero', 'jobuilt', 'johansen', 'karin', 'lampadati', 'lcc',
  'maibatsu', 'mammoth', 'maxwell', 'mtl', 'nagasaki', 'obey', 'ocelot', 'overflod',
  'pegassi', 'penaud', 'pfister', 'principe', 'progen', 'rune', 'schyster', 'shitzu',
  'sirius', 'speedophile', 'stanley', 'toundra', 'truffade', 'ubermacht', 'vapid',
  'vcpd', 'vulcar', 'vysser', 'weeny', 'western', 'willard', 'zirconium',
];

// Strict per-category text-only field allowlist (NEVER permits image fields or fabricated numbers)
const ALLOWED_TEXT_FIELDS = {
  vehicles: ['notes', 'priceOrAcquisition', 'verificationStatus', 'sourceUrl'],
  weapons: ['notes', 'howToObtain', 'price', 'bestUseCase', 'verificationStatus', 'sourceUrl'],
  properties: ['notes', 'purchaseAvailability', 'unlockRequirement', 'interiorFeatures', 'capacity', 'verificationStatus', 'sourceUrl'],
  'gun-stores': ['notes', 'locationDetail', 'verificationStatus', 'sourceUrl'],
  radio: ['notes', 'dj', 'unlockRequirement', 'verificationStatus', 'sourceUrl'],
};

const VALID_VERIFICATION_STATUSES = new Set(['Confirmed', 'Community Discovered', 'Testing', 'Unverified']);

function updateCategoryFreshnessOnRealChange(changedCats, today) {
  if (!changedCats || changedCats.size === 0) return;
  const pubDir = path.join(ROOT_DIR, 'public');
  const locsToUpdate = new Set(['https://www.gta6heistguide.com/gta-6-database/']);
  const htmlFilesToUpdate = new Set(['gta-6-database/index.html']);

  for (const cat of changedCats) {
    const meta = CATEGORY_PAGE_MAP[cat];
    if (!meta) continue;
    locsToUpdate.add(meta.loc);
    for (const h of meta.html) htmlFilesToUpdate.add(h);
  }

  for (const relHtml of htmlFilesToUpdate) {
    const fp = path.join(pubDir, relHtml);
    if (!fs.existsSync(fp)) continue;
    const html = fs.readFileSync(fp, 'utf-8');
    const nextHtml = html
      .replace(/("dateModified"\s*:\s*")\d{4}-\d{2}-\d{2}(")/g, `$1${today}$2`)
      .replace(/(Last Updated:\s*<[^>]+>)\d{4}-\d{2}-\d{2}(<\/[^>]+>)/gi, `$1${today}$2`)
      .replace(/(Last Updated:\s*)\d{4}-\d{2}-\d{2}/gi, `$1${today}`);
    if (nextHtml !== html) {
      fs.writeFileSync(fp, nextHtml, 'utf-8');
    }
  }

  if (fs.existsSync(SITEMAP_PATH)) {
    let xml = fs.readFileSync(SITEMAP_PATH, 'utf-8');
    let xmlChanged = false;
    for (const loc of locsToUpdate) {
      const escapedLoc = loc.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const rx = new RegExp(`(<loc>${escapedLoc}<\\/loc>\\s*<lastmod>)\\d{4}-\\d{2}-\\d{2}(<\\/lastmod>)`);
      const nextXml = xml.replace(rx, `$1${today}$2`);
      if (nextXml !== xml) {
        xml = nextXml;
        xmlChanged = true;
      }
    }
    if (xmlChanged) {
      fs.writeFileSync(SITEMAP_PATH, xml, 'utf-8');
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

function stripVehicleManufacturer(name) {
  let norm = normalizeEntityName(name);
  for (const mfr of VEHICLE_MANUFACTURERS) {
    if (norm.startsWith(mfr + ' ')) {
      norm = norm.slice(mfr.length + 1).trim();
      break;
    }
  }
  return norm;
}

function compactKey(name) {
  return stripVehicleManufacturer(name).replace(/[^a-z0-9]/g, '');
}

function buildVehicleLookup(vehicleItems) {
  const byId = new Map();
  const byFullCompact = new Map();
  const byModelCompact = new Map();

  for (const item of vehicleItems) {
    if (!item || !item.id) continue;
    byId.set(item.id, item);
    const full = normalizeEntityName(item.name).replace(/[^a-z0-9]/g, '');
    const model = compactKey(item.name);
    if (full) byFullCompact.set(full, item);
    if (model && model.length >= 4) byModelCompact.set(model, item);
  }

  return { byId, byFullCompact, byModelCompact };
}

function matchExistingVehicle(candidateName, lookup) {
  const full = normalizeEntityName(candidateName).replace(/[^a-z0-9]/g, '');
  const model = compactKey(candidateName);
  if (!full) return null;
  if (lookup.byFullCompact.has(full)) return lookup.byFullCompact.get(full);
  if (lookup.byModelCompact.has(full)) return lookup.byModelCompact.get(full);
  if (model && lookup.byModelCompact.has(model)) return lookup.byModelCompact.get(model);
  if (model && lookup.byFullCompact.has(model)) return lookup.byFullCompact.get(model);

  // Prefix/variant matching (e.g., "Dominator ASP" / "Dominator GT" -> "Vapid Dominator", "Comet S2" -> "Pfister Comet")
  if (model && model.length >= 5) {
    for (const [existingModel, item] of lookup.byModelCompact.entries()) {
      if (existingModel.length >= 5 && (model.startsWith(existingModel) || existingModel.startsWith(model))) {
        return item;
      }
    }
  }
  return null;
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
 * Query GTA Wiki MediaWiki API for Vehicles in GTA VI/images and Vehicles in GTA VI/table.
 * - Matches GTA VI screenshots to existing public/data/vehicles.json entries that lack
 *   verified screenshots (staging strictly validated URLs into world-pending-images.json).
 * - Stages newly confirmed named GTA VI vehicles not yet in vehicles.json into the
 *   pending-review queue (world-pending-discoveries.json).
 */
async function fetchGtaWikiVehicles(existingVehicles, timeoutMs) {
  const lookup = buildVehicleLookup(existingVehicles);

  const [imgPageJson, tablePageJson] = await Promise.all([
    fetchJsonStrict(
      GTA_WIKI_API +
        '?' +
        new URLSearchParams({
          action: 'parse',
          format: 'json',
          page: 'Vehicles in GTA VI/images',
          prop: 'images',
        }),
      timeoutMs
    ),
    fetchJsonStrict(
      GTA_WIKI_API +
        '?' +
        new URLSearchParams({
          action: 'parse',
          format: 'json',
          page: 'Vehicles in GTA VI/table',
          prop: 'wikitext',
        }),
      timeoutMs
    ),
  ]);

  const rawFiles = Array.isArray(imgPageJson?.parse?.images) ? imgPageJson.parse.images : [];
  const tableWikitext = String(tablePageJson?.parse?.wikitext?.['*'] || '');
  if (rawFiles.length === 0 && tableWikitext.length < 200) {
    throw new Error('GTA Wiki Vehicles in GTA VI pages returned empty payload.');
  }

  // Index GTA VI gallery files by normalized vehicle stem (e.g., "GauntletHellfire-GTAVI-Trailer1.png" -> "gauntlethellfire")
  const gtaviFiles = rawFiles.filter(
    (f) => /gtavi|gta[_-]?vi|gta[_-]?6/i.test(f) && /\.(png|jpe?g|webp)$/i.test(f)
  );

  const stemToFiles = new Map();
  const matchedFilesToResolve = new Map(); // fileName -> { item, stem }

  for (const fname of gtaviFiles) {
    if (/^Unnamed/i.test(fname)) continue;
    const stemRaw = fname.split(/[-_]GTAVI/i)[0] || '';
    const stemKey = stemRaw.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!stemKey || stemKey.length < 3) continue;

    if (!stemToFiles.has(stemKey)) stemToFiles.set(stemKey, []);
    stemToFiles.get(stemKey).push(fname);

    // Match against existing vehicles.json entries that do NOT yet have a verified image
    const matchedItem = matchExistingVehicle(stemRaw.replace(/([a-z])([A-Z])/g, '$1 $2'), lookup);
    if (matchedItem && matchedItem.imageVerified !== true) {
      if (!matchedFilesToResolve.has(fname)) {
        matchedFilesToResolve.set(fname, { item: matchedItem, stem: stemKey });
      }
    }
  }

  // Parse confirmed (non-leak, non-Unnamed) named GTA VI vehicles from Vehicles in GTA VI/table
  const strippedWikitext = tableWikitext.replace(/<!--[\s\S]*?-->/g, '');
  const lineRx = /^\*\s*\[\[([^\]|]+)(?:\|([^\]]+))?\]\]([^\n]*)$/gm;
  const discoveredVehicles = [];
  const seenDiscKeys = new Set();
  const discoveryFilesToResolve = new Set();

  let m;
  while ((m = lineRx.exec(strippedWikitext)) !== null) {
    const wikiTarget = cleanText(m[1]);
    const displayLabel = cleanText(m[2] || m[1]);
    const trailing = String(m[3] || '').trim();

    // Skip leak-only entries marked with "*" right after the link
    if (trailing.startsWith('*')) continue;
    if (!wikiTarget || /^Unnamed\b/i.test(wikiTarget) || /^File:|^Category:/i.test(wikiTarget)) continue;

    const cleanName = displayLabel.replace(/\s*\([^)]*\)\s*/g, '').trim();
    if (!cleanName || cleanName.length < 3) continue;

    const key = compactKey(cleanName);
    if (!key || seenDiscKeys.has(key)) continue;

    // Skip vehicles already present in public/data/vehicles.json (prevent duplicates!)
    if (matchExistingVehicle(cleanName, lookup) || matchExistingVehicle(wikiTarget, lookup)) {
      continue;
    }

    // Only queue vehicles that ALSO have an authentic GTA VI gallery file on GTA Wiki
    // (guarantees confirmed official trailer/screenshot appearance rather than speculation)
    const galleryFiles = stemToFiles.get(key) || [];
    if (galleryFiles.length === 0) continue;

    seenDiscKeys.add(key);
    const topFile = galleryFiles[0];
    discoveryFilesToResolve.add(topFile);
    discoveredVehicles.push({
      name: cleanName,
      wikiTitle: wikiTarget,
      sourceUrl: `https://gta.fandom.com/wiki/${encodeURIComponent(wikiTarget.replace(/ /g, '_'))}`,
      galleryFiles: galleryFiles.slice(0, 2),
    });
  }

  // Resolve imageinfo URLs in batches (for matched vehicles needing shots + top 25 confirmed discoveries)
  const filesToQuery = Array.from(
    new Set([
      ...matchedFilesToResolve.keys(),
      ...Array.from(discoveryFilesToResolve).slice(0, 25),
    ])
  );

  const fileInfoMap = new Map();
  for (let i = 0; i < filesToQuery.length; i += 25) {
    const chunk = filesToQuery.slice(i, i + 25).map((f) => (f.startsWith('File:') ? f : `File:${f}`));
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
      const title = String(p?.title || '').replace(/^File:/i, '').trim();
      const ii = Array.isArray(p?.imageinfo) ? p.imageinfo[0] : null;
      if (!title || !ii?.url) continue;
      if ((ii.width || 0) < MIN_CANDIDATE_WIDTH) continue;
      if (!/^image\/(jpeg|png|webp)$/i.test(ii.mime || '')) continue;
      const evalRes = evaluateGta6ImageUrl(ii.url, {
        fileName: title,
        contextText: 'Vehicles in GTA VI',
      });
      if (!evalRes.allowed) continue;
      fileInfoMap.set(title.toLowerCase(), {
        fileName: title,
        url: evalRes.normalizedUrl,
        imageSource: evalRes.imageSource,
        width: ii.width || null,
        height: ii.height || null,
      });
    }
  }

  const wikiImageCandidates = [];
  for (const [fname, meta] of matchedFilesToResolve.entries()) {
    const info = fileInfoMap.get(fname.toLowerCase());
    if (!info) continue;
    wikiImageCandidates.push({
      category: 'vehicles',
      itemId: meta.item.id,
      itemName: meta.item.name,
      candidateUrl: info.url,
      source: info.imageSource,
      sourceUrl: 'https://gta.fandom.com/wiki/Vehicles_in_GTA_VI/images',
      wikiFile: info.fileName,
      width: info.width,
      height: info.height,
    });
  }

  const wikiVehicleDiscoveries = discoveredVehicles.map((dv) => {
    const resolvedImgs = dv.galleryFiles
      .map((f) => fileInfoMap.get(f.toLowerCase()))
      .filter(Boolean)
      .map((info) => ({
        candidateUrl: info.url,
        imageSource: info.imageSource,
        fileTitle: `File:${info.fileName}`,
        width: info.width,
        height: info.height,
      }));
    return {
      category: 'vehicles',
      name: dv.name,
      wikiTitle: dv.wikiTitle,
      source: 'GTA Wiki (Vehicles in GTA VI)',
      sourceUrl: dv.sourceUrl,
      candidateImages: resolvedImgs,
    };
  });

  return {
    wikiImageCandidates,
    wikiVehicleDiscoveries,
    galleryFilesScanned: gtaviFiles.length,
  };
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
  const fallback = {
    updated: new Date().toISOString().slice(0, 10),
    policy:
      'Candidate GTA VI image URLs discovered by scripts/sync-world-db.mjs from approved GTA Wiki GTA VI pages/galleries and Rockstar official media across Vehicles, Weapons, Properties, Gun Stores, and Radio are staged here for manual editorial verification. Wikimedia Commons, stock photos, real-world vehicle photos, AI-generated, and duplicate images are strictly rejected and NEVER published.',
    categories: CATEGORIES,
    candidates: [],
  };
  if (!fs.existsSync(PENDING_IMAGES_PATH)) return fallback;
  const parsed = JSON.parse(fs.readFileSync(PENDING_IMAGES_PATH, 'utf-8'));
  if (!parsed || !Array.isArray(parsed.candidates)) {
    throw new Error('Existing public/data/world-pending-images.json is malformed — aborting.');
  }
  return parsed;
}

function loadPendingDiscoveriesSafely() {
  const fallback = {
    updated: new Date().toISOString().slice(0, 10),
    policy:
      'Unverified newly discovered GTA VI vehicles and world database entities from external sources (e.g. GTA Wiki Vehicles in GTA VI) are queued here for editorial review before promotion to public/data/*.json. Existing verified records are never overwritten or deleted.',
    categories: CATEGORIES,
    discoveries: [],
  };
  if (!fs.existsSync(PENDING_DISCOVERIES_PATH)) return fallback;
  const parsed = JSON.parse(fs.readFileSync(PENDING_DISCOVERIES_PATH, 'utf-8'));
  if (!parsed || !Array.isArray(parsed.discoveries)) {
    throw new Error('Existing public/data/world-pending-discoveries.json is malformed — aborting.');
  }
  return parsed;
}

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
  const existingDiscoveries = loadPendingDiscoveriesSafely();

  if (opts.simulateFailure) {
    console.warn('[FAIL-SAFE ABORT] Simulated fetch/timeout failure triggered — zero files modified.');
    return { ok: false, aborted: true, reason: 'simulated-failure' };
  }

  // 2. Fetch sources with STRICT fail-safe (if all fail, abort ALL writes)
  const textUpdates = [];
  const rawImageCandidates = [];
  const wikiVehicleDiscoveries = [];
  let successfulSources = 0;
  const sourceErrors = [];

  try {
    if (opts.feedFile) {
      const resolvedFeed = path.resolve(opts.feedFile);
      const raw = fs.readFileSync(resolvedFeed, 'utf-8');
      const kind = resolvedFeed.endsWith('.json') ? 'json' : 'rss';
      const parsed = validateAndParseFeed(raw, kind, 'vehicles');
      textUpdates.push(...parsed.textUpdates);
      rawImageCandidates.push(...parsed.imageCandidates);
      successfulSources++;
    } else {
      // 2a. GTA Wiki Vehicles in GTA VI discovery & authentic GTA VI image staging
      if (!opts.skipWiki) {
        try {
          const wiki = await fetchGtaWikiVehicles(existingByCat.vehicles.items, opts.timeoutMs || 15000);
          rawImageCandidates.push(...wiki.wikiImageCandidates);
          wikiVehicleDiscoveries.push(...wiki.wikiVehicleDiscoveries);
          successfulSources++;
          console.log(
            `[INFO] GTA Wiki Vehicles in GTA VI scanned: ${wiki.galleryFilesScanned} GTA VI gallery files, ${wiki.wikiImageCandidates.length} matched shot candidate(s), ${wiki.wikiVehicleDiscoveries.length} unindexed vehicle discovery candidate(s).`
          );
        } catch (err) {
          sourceErrors.push(`GTA Wiki Vehicles: ${err.message}`);
          console.warn(`[WARN] GTA Wiki vehicles check skipped (existing data preserved): ${err.message}`);
        }
      }

      // 2b. Existing Google News World DB RSS feeds
      for (const feed of DEFAULT_FEEDS) {
        try {
          const parsed = await fetchFeedStrict(feed, opts.timeoutMs || 12000);
          textUpdates.push(...parsed.textUpdates);
          rawImageCandidates.push(...parsed.imageCandidates);
          successfulSources++;
        } catch (err) {
          sourceErrors.push(`${feed.name}: ${err.message}`);
          console.warn(`[WARN] Feed ${feed.name} skipped (existing data preserved): ${err.message}`);
        }
      }
    }
  } catch (err) {
    console.warn(`[FAIL-SAFE ABORT] World DB feed failed or returned incomplete data: ${err.message}`);
    console.warn('[FAIL-SAFE ABORT] Existing public/data/*.json databases and verified screenshots left completely untouched.');
    return { ok: false, aborted: true, reason: err.message };
  }

  if (successfulSources === 0) {
    const reason = sourceErrors.join('; ') || 'no-feeds-succeeded';
    console.warn(`[FAIL-SAFE ABORT] All World DB sources failed (${reason}) — zero files modified.`);
    return { ok: false, aborted: true, reason };
  }

  // 3. Apply VERIFIED TEXT UPDATES ONLY (never mutate verified images or overwrite rich descriptions!)
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

    if (cand.candidateImageUrl || cand.imageUrl) {
      rawImageCandidates.push({
        category: cat,
        itemId: cand.id || null,
        itemName: cleanText(cand.name || cand.id || 'World DB Entry'),
        candidateUrl: cand.candidateImageUrl || cand.imageUrl,
        source: cand.source || 'Verified Text Sync Feed',
        sourceUrl: cand.sourceUrl || null,
      });
    }

    const items = nextByCat[cat].items;
    const match = items.find(
      (x) =>
        (cand.id && x.id === cand.id) ||
        (cand.name && normalizeEntityName(x.name) === normalizeEntityName(cand.name))
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
      // Preserve existing rich notes unless currently empty/short
      if (field === 'notes' && match.notes && match.notes.length >= 25) continue;
      if (match[field] !== val) {
        match[field] = val;
        itemMutated = true;
        textFieldsUpdated++;
      }
    }

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

  // 5. Stage newly discovered unverified vehicles into public/data/world-pending-discoveries.json
  const nextDiscoveries = JSON.parse(JSON.stringify(existingDiscoveries));
  const vehicleLookup = buildVehicleLookup(nextByCat.vehicles.items);
  const knownDiscoveryKeys = new Set(
    nextDiscoveries.discoveries.map((d) => `${d.category}:${compactKey(d.name || d.wikiTitle || '')}`)
  );
  let discoveriesQueued = 0;

  for (const disc of wikiVehicleDiscoveries) {
    if (matchExistingVehicle(disc.name, vehicleLookup) || matchExistingVehicle(disc.wikiTitle, vehicleLookup)) {
      continue; // Already in vehicles.json — prevent duplicates!
    }
    const key = `vehicles:${compactKey(disc.name)}`;
    if (knownDiscoveryKeys.has(key)) continue;

    knownDiscoveryKeys.add(key);
    const idHash = crypto.createHash('sha1').update(key).digest('hex').slice(0, 10);
    nextDiscoveries.discoveries.push({
      id: `disc-veh-${idHash}`,
      category: 'vehicles',
      name: disc.name,
      wikiTitle: disc.wikiTitle,
      source: disc.source,
      sourceUrl: disc.sourceUrl,
      candidateImages: disc.candidateImages,
      discoveredAt: new Date().toISOString(),
      status: 'pending_manual_review',
    });
    discoveriesQueued++;
  }

  // 6. Stage candidate GTA VI image URLs into public/data/world-pending-images.json with strict policy & deduplication
  const nextPending = JSON.parse(JSON.stringify(existingPending));
  const knownUrls = new Set();

  for (const c of nextPending.candidates) {
    const n = normalizeImageUrl(c.normalizedUrl || c.candidateUrl);
    if (n) knownUrls.add(n);
  }
  try {
    if (fs.existsSync(ANIMALS_PENDING_PATH)) {
      const ap = JSON.parse(fs.readFileSync(ANIMALS_PENDING_PATH, 'utf-8'));
      for (const c of ap.candidates || []) {
        const n = normalizeImageUrl(c.normalizedUrl || c.candidateUrl);
        if (n) knownUrls.add(n);
      }
    }
  } catch {}

  for (const cat of CATEGORIES) {
    for (const item of nextByCat[cat].items) {
      if (item.image) {
        const n = normalizeImageUrl(item.image);
        if (n) knownUrls.add(n);
        knownUrls.add(String(item.image).trim().toLowerCase());
      }
      if (item.sourceImageUrl) {
        const nSrc = normalizeImageUrl(item.sourceImageUrl);
        if (nSrc) knownUrls.add(nSrc);
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

    const evalRes = evaluateGta6ImageUrl(rawUrl, {
      fileName: cand.wikiFile || '',
      contextText: `${cand.itemName || ''} ${cand.source || ''}`,
      source: cand.source,
    });

    if (!evalRes.allowed || !evalRes.normalizedUrl) {
      disallowedSkipped++;
      continue;
    }

    if (knownUrls.has(evalRes.normalizedUrl)) {
      duplicatesSkipped++;
      continue;
    }

    // Never stage candidate images for an item that already has a verified GTA VI screenshot
    const cat = CATEGORIES.includes(cand.category) ? cand.category : inferCategoryFromText(cand.itemName, 'vehicles');
    if (cand.itemId) {
      const existingItem = nextByCat[cat]?.items?.find((x) => x.id === cand.itemId);
      if (existingItem && existingItem.image && existingItem.imageVerified === true) {
        duplicatesSkipped++;
        continue;
      }
    }

    knownUrls.add(evalRes.normalizedUrl);
    const hashId = crypto.createHash('sha1').update(evalRes.normalizedUrl).digest('hex').slice(0, 12);
    nextPending.candidates.push({
      id: `wimg-${hashId}`,
      category: cat,
      itemId: cand.itemId || null,
      itemName: cleanText(cand.itemName) || 'Unassigned World DB Entry',
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

  // Filter changedCats using deep meaningful-content equality
  const reallyChangedCats = new Set();
  for (const cat of changedCats) {
    if (!meaningfulContentEqual(existingByCat[cat], nextByCat[cat])) {
      reallyChangedCats.add(cat);
    }
  }
  const pendingChanged = !meaningfulContentEqual(existingPending, nextPending);
  const discoveriesChanged = !meaningfulContentEqual(existingDiscoveries, nextDiscoveries);

  // 7. Write changed files atomically (unless --dry-run)
  if (!opts.dryRun) {
    for (const cat of reallyChangedCats) {
      nextByCat[cat].updated = today;
      atomicWriteJson(path.join(PUBLIC_DATA_DIR, `${cat}.json`), nextByCat[cat]);
      atomicWriteJson(path.join(MIRROR_DATA_DIR, `${cat}.json`), nextByCat[cat]);
      console.log(`[OK] Updated public/data/${cat}.json & data/${cat}.json.`);
    }
    if (reallyChangedCats.size > 0) {
      updateCategoryFreshnessOnRealChange(reallyChangedCats, today);
      console.log(
        `[OK] Updated JSON-LD dateModified & sitemap.xml lastmod for changed categories only: ${Array.from(reallyChangedCats).join(', ')}.`
      );
    } else {
      console.log(
        '[OK] No new verified World DB text updates — category JSONs, HTML dateModified & sitemap.xml lastmod left untouched.'
      );
    }

    if (pendingChanged) {
      nextPending.updated = today;
      atomicWriteJson(PENDING_IMAGES_PATH, nextPending);
      console.log(
        `[OK] Staged ${stagedImages} new GTA VI candidate image URL(s) in public/data/world-pending-images.json (skipped ${duplicatesSkipped} duplicates, ${disallowedSkipped} prohibited/non-GTA-VI).`
      );
    } else {
      console.log(
        `[OK] No new World DB candidate images staged (skipped ${duplicatesSkipped} duplicates, ${disallowedSkipped} prohibited/non-GTA-VI).`
      );
    }

    if (discoveriesChanged) {
      nextDiscoveries.updated = today;
      atomicWriteJson(PENDING_DISCOVERIES_PATH, nextDiscoveries);
      console.log(
        `[OK] Queued ${discoveriesQueued} unverified World DB discovery/discoveries in public/data/world-pending-discoveries.json for editorial review.`
      );
    } else {
      console.log('[OK] No new unverified World DB discoveries queued.');
    }
  } else {
    console.log(
      `[DRY-RUN] changedCats=${Array.from(reallyChangedCats).join(',') || 'none'}, textFieldsUpdated=${textFieldsUpdated}, stagedImages=${stagedImages}, discoveriesQueued=${discoveriesQueued}, duplicatesSkipped=${duplicatesSkipped}, disallowedSkipped=${disallowedSkipped}`
    );
  }

  return {
    ok: true,
    aborted: false,
    changed: reallyChangedCats.size > 0 || pendingChanged || discoveriesChanged,
    changedCategories: Array.from(reallyChangedCats),
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
