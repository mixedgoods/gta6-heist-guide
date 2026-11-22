/**
 * Strict GTA VI Image Source Policy & Deduplication Utilities
 * (scripts/lib/gta6-image-policy.mjs)
 *
 * POLICY ENFORCEMENT:
 * 1. Wikimedia Commons and Wikipedia are EXPLICITLY PROHIBITED.
 * 2. Generic stock photos, AI-generated imagery, and real-world animal/vehicle
 *    photographs are EXPLICITLY PROHIBITED.
 * 3. ONLY relevant GTA VI imagery from approved sources is permitted:
 *    - GTA Wiki animal & vehicle galleries (static.wikia.nocookie.net/gtawiki/...)
 *    - Individual GTA Wiki GTA VI pages (gta.fandom.com)
 *    - Rockstar official screenshots, trailers & promotional materials
 *      (rockstargames.com, media-rockstargames-com.akamaized.net,
 *       videos-rockstargames-com.akamaized.net)
 * 4. Every image must preserve authentic GTA VI context (rejects older GTA V/GTAO/SA/VC/IV
 *    assets and UI icons/sprites/logos/maps).
 */

export const WIKIMEDIA_PROHIBITED_HOSTS = [
  'wikimedia.org',
  'commons.wikimedia.org',
  'upload.wikimedia.org',
  'wikipedia.org',
  'wikidata.org',
  'wikisource.org',
];

export const STOCK_AND_REALWORLD_PROHIBITED_HOSTS = [
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
  'flickr.com',
  'staticflickr.com',
  'nationalgeographic.com',
  'inaturalist.org',
  'audubon.org',
  'britannica.com',
  'cars.com',
  'edmunds.com',
  'motortrend.com',
  'caranddriver.com',
  'autotrader.com',
  'kbb.com',
];

export const PROHIBITED_IMAGE_HOSTS = [
  ...WIKIMEDIA_PROHIBITED_HOSTS,
  ...STOCK_AND_REALWORLD_PROHIBITED_HOSTS,
];

export const APPROVED_GTA6_IMAGE_HOSTS = [
  'static.wikia.nocookie.net',
  'gta.fandom.com',
  'media-rockstargames-com.akamaized.net',
  'videos-rockstargames-com.akamaized.net',
  'www.rockstargames.com',
  'rockstargames.com',
];

const BLOCKED_IMAGE_PATTERNS = [
  /wikimedia/i,
  /commons\.wikimedia/i,
  /midjourney/i,
  /dall-?e/i,
  /stable-?diffusion/i,
  /ai-generated/i,
  /stock-?photo/i,
  /shutterstock/i,
  /gettyimages/i,
  /favicon/i,
  /logo\.(png|svg|webp|jpe?g)$/i,
  /(?:^|[/_-])(icon|sprite|badge|blip|radar|hud|disambig|placeholder|emblem|crest|site-logo)(?:[._-]|$)/i,
  /\.svg(\?|$)/i,
];

// Matches older GTA titles / non-GTA VI game markers without matching "GTAVI" or "GTA_VI"
const NON_GTA6_GAME_PATTERN =
  /(?:^|[^a-z0-9])(gtav(?!i)|gta[_-]?v(?!i)|gta[_-]?5|gtao|gta[_-]?online|gta[_-]?iv|gta[_-]?4|gta[_-]?sa|gta[_-]?vc|gta[_-]?vcs|gta[_-]?lcs|gta[_-]?3|gta[_-]?iii|gtacw|rdr2|rdr)(?:[^a-z0-9]|$)/i;

// Positive GTA VI context markers in URL, filename, or verified page context
const POSITIVE_GTA6_CONTEXT_PATTERN =
  /(gtavi|gta[_-]?vi|gta[_-]?6|grand[_ -]?theft[_ -]?auto[_ -]?vi|rockstargames\.com\/vi|leonida|vice[_ -]?city|grassrivers|mount[_ -]?kalaga|port[_ -]?gellhorn|ambrosia)/i;

function hostMatches(host, domain) {
  return host === domain || host.endsWith('.' + domain);
}

/**
 * Normalize an HTTP(S) image URL for consistent deduplication.
 * Preserves local verified asset paths starting with "/assets/".
 */
export function normalizeImageUrl(rawUrl) {
  const s = String(rawUrl || '').trim();
  if (!s) return null;
  if (s.startsWith('/assets/')) {
    return s.split('?')[0].split('#')[0].toLowerCase();
  }
  try {
    const u = new URL(s);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
    u.hash = '';
    const dropParams = [
      'utm_source',
      'utm_medium',
      'utm_campaign',
      'utm_term',
      'utm_content',
      'fbclid',
      'gclid',
      'ref',
      'cb',
    ];
    for (const p of dropParams) u.searchParams.delete(p);
    u.hostname = u.hostname.toLowerCase();
    // Normalize Fandom /revision/latest/scale-to-width-down/... variants to canonical base file URL
    if (u.hostname === 'static.wikia.nocookie.net') {
      u.pathname = u.pathname.replace(/\/revision\/latest(?:\/scale-to-width-down\/\d+)?/i, '/revision/latest');
    }
    return u.toString();
  } catch {
    return null;
  }
}

/**
 * Derive clean source attribution string from an approved GTA VI image URL.
 */
export function deriveGta6ImageSource(rawUrl, fallbackSource = null) {
  const s = String(rawUrl || '');
  const lower = s.toLowerCase();

  if (lower.includes('rockstargames.com') || lower.includes('rockstargames-com.akamaized.net')) {
    if (lower.includes('trailer')) return 'Official Rockstar GTA VI Trailer';
    return 'Official Rockstar GTA VI Screenshot';
  }
  if (lower.includes('static.wikia.nocookie.net') || lower.includes('gta.fandom.com')) {
    if (lower.includes('officialscreenshot')) return 'GTA Wiki (Official Rockstar GTA VI Screenshot)';
    if (lower.includes('trailer2') || lower.includes('trailer_2')) return 'GTA Wiki (GTA VI Trailer 2)';
    if (lower.includes('trailer1') || lower.includes('trailer_1') || lower.includes('gtavitrailer')) {
      return 'GTA Wiki (GTA VI Trailer 1)';
    }
    if (lower.includes('artwork') || lower.includes('postcard') || lower.includes('promotional')) {
      return 'GTA Wiki (Official GTA VI Promotional Material)';
    }
    return 'GTA Wiki (GTA VI Gallery)';
  }
  return fallbackSource || 'Verified GTA VI Official Media';
}

/**
 * Strictly evaluate whether an image URL complies with the GTA VI Image Source Policy.
 *
 * @param {string} rawUrl
 * @param {{ contextText?: string, fileName?: string, source?: string }} [opts]
 * @returns {{ allowed: boolean, reason: string, normalizedUrl: string|null, imageSource: string|null }}
 */
export function evaluateGta6ImageUrl(rawUrl, opts = {}) {
  const s = String(rawUrl || '').trim();
  if (!s) {
    return { allowed: false, reason: 'empty-url', normalizedUrl: null, imageSource: null };
  }

  // Local verified site assets are always allowed
  if (s.startsWith('/assets/images/')) {
    return {
      allowed: true,
      reason: 'local-verified-asset',
      normalizedUrl: normalizeImageUrl(s),
      imageSource: opts.source || 'Official Rockstar GTA VI Screenshot',
    };
  }

  const norm = normalizeImageUrl(s);
  if (!norm) {
    return { allowed: false, reason: 'invalid-url', normalizedUrl: null, imageSource: null };
  }

  let u;
  try {
    u = new URL(norm);
  } catch {
    return { allowed: false, reason: 'invalid-url', normalizedUrl: null, imageSource: null };
  }

  const host = u.hostname.toLowerCase();

  // 1. Explicit Wikimedia Commons / Wikipedia prohibition
  if (WIKIMEDIA_PROHIBITED_HOSTS.some((blocked) => hostMatches(host, blocked))) {
    return { allowed: false, reason: 'wikimedia-prohibited', normalizedUrl: norm, imageSource: null };
  }

  // 2. Explicit stock & generic real-world photo prohibition
  if (STOCK_AND_REALWORLD_PROHIBITED_HOSTS.some((blocked) => hostMatches(host, blocked))) {
    return { allowed: false, reason: 'stock-or-realworld-prohibited', normalizedUrl: norm, imageSource: null };
  }

  // 3. Blocked URL / filename patterns (AI slop, favicons, logos, sprites, SVGs)
  const inspectStr = `${norm} ${opts.fileName || ''}`;
  if (BLOCKED_IMAGE_PATTERNS.some((rx) => rx.test(inspectStr))) {
    return { allowed: false, reason: 'blocked-image-pattern', normalizedUrl: norm, imageSource: null };
  }

  // 4. Default-deny host allowlist: ONLY GTA Wiki & Rockstar official CDN/site
  const isApprovedHost = APPROVED_GTA6_IMAGE_HOSTS.some((allowed) => hostMatches(host, allowed));
  if (!isApprovedHost) {
    return { allowed: false, reason: 'unapproved-host', normalizedUrl: norm, imageSource: null };
  }

  // 5. For Wikia/Fandom CDN, require the /gtawiki/ namespace specifically
  if (host === 'static.wikia.nocookie.net' && !u.pathname.toLowerCase().includes('/gtawiki/')) {
    return { allowed: false, reason: 'non-gtawiki-fandom', normalizedUrl: norm, imageSource: null };
  }

  // 6. Reject older GTA games (GTA V, GTAO, GTA IV, SA, VC, etc.)
  const filePart = `${u.pathname} ${opts.fileName || ''}`;
  if (NON_GTA6_GAME_PATTERN.test(filePart)) {
    return { allowed: false, reason: 'non-gtavi-game-asset', normalizedUrl: norm, imageSource: null };
  }

  // 7. Require positive GTA VI context
  const fullContext = `${norm} ${opts.fileName || ''} ${opts.contextText || ''}`;
  if (!POSITIVE_GTA6_CONTEXT_PATTERN.test(fullContext)) {
    return { allowed: false, reason: 'missing-gtavi-context', normalizedUrl: norm, imageSource: null };
  }

  return {
    allowed: true,
    reason: 'approved-gtavi-source',
    normalizedUrl: norm,
    imageSource: deriveGta6ImageSource(norm, opts.source),
  };
}

export function isDisallowedImageUrl(rawUrl, opts = {}) {
  return !evaluateGta6ImageUrl(rawUrl, opts).allowed;
}

/**
 * Normalize an animal or vehicle name for duplicate detection.
 */
export function normalizeEntityName(name) {
  return String(name || '')
    .toLowerCase()
    .replace(/\([^)]*\)/g, ' ')
    .replace(/['’`]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function singularizeName(name) {
  const n = normalizeEntityName(name);
  if (!n) return '';
  return n
    .split(' ')
    .map((w) => {
      if (w.length <= 3) return w;
      if (w.endsWith('ies')) return w.slice(0, -3) + 'y';
      if (w.endsWith('es') && /(shes|ches|xes|zes|ses)$/.test(w)) return w.slice(0, -2);
      if (w.endsWith('s') && !w.endsWith('ss') && !w.endsWith('us') && !w.endsWith('is')) return w.slice(0, -1);
      return w;
    })
    .join(' ');
}

/**
 * Strip volatile timestamp keys recursively so zero-change checks only compare
 * meaningful repository content.
 */
export function stripVolatileKeys(value, ignoreKeys = new Set(['updated', 'updated_utc', 'last_synced', 'lastSynced', 'discoveredAt', 'lastRunAt'])) {
  if (Array.isArray(value)) {
    return value.map((item) => stripVolatileKeys(item, ignoreKeys));
  }
  if (!value || typeof value !== 'object') {
    return value;
  }
  const out = {};
  for (const key of Object.keys(value).sort()) {
    if (ignoreKeys.has(key)) continue;
    out[key] = stripVolatileKeys(value[key], ignoreKeys);
  }
  return out;
}

export function meaningfulContentEqual(a, b, ignoreKeys) {
  return JSON.stringify(stripVolatileKeys(a, ignoreKeys)) === JSON.stringify(stripVolatileKeys(b, ignoreKeys));
}
