/**
 * Strict GTA VI Image Source Policy & Deduplication Utilities
 * (scripts/lib/gta6-image-policy.mjs)
 *
 * POLICY ENFORCEMENT:
 * 1. Default (Tier A/B — GTA VI Official / Gameplay Media):
 *    - Wikimedia Commons, Wikipedia, generic stock photos, AI-generated imagery,
 *      and real-world animal/vehicle photographs are PROHIBITED in default GTA VI mode.
 *    - ONLY relevant GTA VI imagery from approved sources is permitted:
 *      - GTA Wiki animal & vehicle galleries (static.wikia.nocookie.net/gtawiki/...)
 *      - Individual GTA Wiki GTA VI pages (gta.fandom.com)
 *      - Rockstar official screenshots, trailers & promotional materials
 *        (rockstargames.com, media-rockstargames-com.akamaized.net,
 *         videos-rockstargames-com.akamaized.net)
 *    - Every image must preserve authentic GTA VI context (rejects older GTA V/GTAO/SA/VC/IV
 *      and RDR/RDR2 assets and UI icons/sprites/logos/maps).
 *
 * 2. Explicitly Approved Tier C ("Real-World Species Reference — Not GTA VI Gameplay"):
 *    - Narrowly permitted ONLY when explicitly evaluated as Tier C with complete,
 *      verified provenance and licensing metadata for real-world wildlife species references.
 *    - Permitted license categories (strictly separated; never conflated):
 *      - Public Domain (verified PD / PD-USGov / Public Domain Mark 1.0)
 *      - CC0 (CC0 1.0 Universal)
 *      - CC BY (CC BY 2.0 / 2.5 / 3.0 / 4.0)
 *      - CC BY-SA (CC BY-SA 2.0 / 2.5 / 3.0 / 4.0 — compliant attribution & share-alike)
 *      - Unsplash License (platform license — NEVER classified as PD, CC0, or Creative Commons)
 *      - Pexels License (platform license — NEVER classified as PD, CC0, or Creative Commons)
 *    - Strictly rejected even in Tier C:
 *      - CC BY-NC, CC BY-NC-SA, CC BY-NC-ND, CC BY-ND, unverified licensing,
 *        watermarked images, AI-generated imagery, GTA V/RDR2/older GTA imagery,
 *        commercial stock agencies (Getty, Shutterstock, iStock, Alamy, Adobe Stock, etc.),
 *        and images with unclear ownership.
 */

export const TIER_C_LABEL = 'Real-World Species Reference — Not GTA VI Gameplay';

export const WIKIMEDIA_PROHIBITED_HOSTS = [
  'wikimedia.org',
  'commons.wikimedia.org',
  'upload.wikimedia.org',
  'wikipedia.org',
  'wikidata.org',
  'wikisource.org',
];

export const COMMERCIAL_STOCK_PROHIBITED_HOSTS = [
  'shutterstock.com',
  'gettyimages.com',
  'istockphoto.com',
  'dreamstime.com',
  'alamy.com',
  'depositphotos.com',
  '123rf.com',
  'vecteezy.com',
  'freepik.com',
  'stock.adobe.com',
];

export const STOCK_AND_REALWORLD_PROHIBITED_HOSTS = [
  ...COMMERCIAL_STOCK_PROHIBITED_HOSTS,
  'unsplash.com',
  'pexels.com',
  'pixabay.com',
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

export const TIER_C_APPROVED_HOSTS = [
  'commons.wikimedia.org',
  'upload.wikimedia.org',
  'unsplash.com',
  'images.unsplash.com',
  'pexels.com',
  'images.pexels.com',
  'nps.gov',
  'fws.gov',
  'noaa.gov',
  'usgs.gov',
];

export const TIER_C_REQUIRED_METADATA_FIELDS = [
  'originalSourcePageUrl',
  'originalImageUrl',
  'creatorName',
  'licenseName',
  'licenseUrl',
  'dateAcquired',
  'attributionText',
  'modifications',
];

const TIER_C_LICENSE_RULES = [
  {
    category: 'public-domain',
    canonicalFamily: 'Public Domain',
    namePattern: /^(public\s*domain(?:\s*(?:\([^)]+\)|mark\s*1\.0|us\s*gov(?:ernment)?|pd-[a-z0-9-]+))?|pd(?:-usgov[a-z0-9-]*|-self|-old(?:-\d+)?|-ineligible)?)$/i,
    allowedPlatform: 'general',
  },
  {
    category: 'cc0',
    canonicalFamily: 'CC0',
    namePattern: /^(cc0(?:\s*1\.0(?:\s*universal)?)?|creative\s*commons\s*zero\s*1\.0)$/i,
    allowedPlatform: 'general',
  },
  {
    category: 'cc-by',
    canonicalFamily: 'CC BY',
    namePattern: /^(cc[\s-]*by(?:\s*(?:2\.0|2\.5|3\.0|4\.0)(?:\s*[a-z]{2})?)?|creative\s*commons\s*attribution\s*(?:2\.0|2\.5|3\.0|4\.0))$/i,
    allowedPlatform: 'general',
  },
  {
    category: 'cc-by-sa',
    canonicalFamily: 'CC BY-SA',
    namePattern: /^(cc[\s-]*by[\s-]*sa(?:\s*(?:2\.0|2\.5|3\.0|4\.0)(?:\s*[a-z]{2})?)?|creative\s*commons\s*attribution[\s-]*share\s*alike\s*(?:2\.0|2\.5|3\.0|4\.0))$/i,
    allowedPlatform: 'general',
  },
  {
    category: 'unsplash-license',
    canonicalFamily: 'Unsplash License',
    namePattern: /^unsplash\s+license$/i,
    allowedPlatform: 'unsplash',
  },
  {
    category: 'pexels-license',
    canonicalFamily: 'Pexels License',
    namePattern: /^pexels\s+license$/i,
    allowedPlatform: 'pexels',
  },
];

const TIER_C_REJECTED_LICENSE_PATTERN =
  /(by-nc|nc-sa|nc-nd|non-?commercial|by-nd|no-?deriv|all\s*rights\s*reserved|copyrighted|fair\s*use|editorial\s*use\s*only|unverified|unknown|unclear|proprietary)/i;

const TIER_C_REJECTED_CONTENT_PATTERN =
  /(watermark|shutterstock|gettyimages|istockphoto|alamy|dreamstime|depositphotos|123rf|adobe\s*stock|midjourney|dall-?e|stable-?diffusion|ai-generated|ai\s+art|generative\s+ai)/i;

const UNCLEAR_CREATOR_PATTERN =
  /^(unknown|unverified|unclear|anonymous|n\/a|none|tbd|various|internet|google|web)$/i;

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

// Blocked patterns that apply even in Tier C (excludes wikimedia/commons which are allowed in Tier C when license is verified)
const TIER_C_BLOCKED_PATTERNS = [
  /midjourney/i,
  /dall-?e/i,
  /stable-?diffusion/i,
  /ai-generated/i,
  /shutterstock/i,
  /gettyimages/i,
  /istockphoto/i,
  /alamy/i,
  /dreamstime/i,
  /depositphotos/i,
  /123rf/i,
  /watermark/i,
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
 * Classify and validate a Tier C license name + license URL against platform hosts.
 * Explicitly prevents misclassifying Unsplash or Pexels photographs as Public Domain,
 * CC0, or Creative Commons, and rejects CC BY-NC / ND / unverified licenses.
 */
export function classifyTierCLicense(licenseName, licenseUrl, sourceHosts = []) {
  const rawName = String(licenseName || '').trim();
  const rawUrl = String(licenseUrl || '').trim();
  if (!rawName) {
    return { valid: false, reason: 'missing-license-name', category: null, canonicalFamily: null };
  }
  if (!rawUrl) {
    return { valid: false, reason: 'missing-license-url', category: null, canonicalFamily: null };
  }
  let parsedLicenseUrl;
  try {
    parsedLicenseUrl = new URL(rawUrl);
    if (parsedLicenseUrl.protocol !== 'http:' && parsedLicenseUrl.protocol !== 'https:') {
      return { valid: false, reason: 'invalid-license-url', category: null, canonicalFamily: null };
    }
  } catch {
    return { valid: false, reason: 'invalid-license-url', category: null, canonicalFamily: null };
  }

  if (TIER_C_REJECTED_LICENSE_PATTERN.test(rawName) || TIER_C_REJECTED_LICENSE_PATTERN.test(rawUrl)) {
    return { valid: false, reason: 'prohibited-nc-nd-or-unverified-license', category: null, canonicalFamily: null };
  }

  const matchedRule = TIER_C_LICENSE_RULES.find((r) => r.namePattern.test(rawName));
  if (!matchedRule) {
    return { valid: false, reason: 'unrecognized-tier-c-license', category: null, canonicalFamily: null };
  }

  const lowerHosts = sourceHosts.map((h) => String(h || '').toLowerCase()).filter(Boolean);
  const isUnsplashHost = lowerHosts.some((h) => hostMatches(h, 'unsplash.com'));
  const isPexelsHost = lowerHosts.some((h) => hostMatches(h, 'pexels.com'));

  // Enforce strict platform license separation:
  // Unsplash photos MUST use "Unsplash License" (never PD, CC0, or CC)
  if (isUnsplashHost && matchedRule.category !== 'unsplash-license') {
    return {
      valid: false,
      reason: 'unsplash-license-misclassification-prohibited',
      category: null,
      canonicalFamily: null,
    };
  }
  if (!isUnsplashHost && matchedRule.category === 'unsplash-license') {
    return {
      valid: false,
      reason: 'unsplash-license-requires-unsplash-source',
      category: null,
      canonicalFamily: null,
    };
  }

  // Pexels photos MUST use "Pexels License" (never PD, CC0, or CC)
  if (isPexelsHost && matchedRule.category !== 'pexels-license') {
    return {
      valid: false,
      reason: 'pexels-license-misclassification-prohibited',
      category: null,
      canonicalFamily: null,
    };
  }
  if (!isPexelsHost && matchedRule.category === 'pexels-license') {
    return {
      valid: false,
      reason: 'pexels-license-requires-pexels-source',
      category: null,
      canonicalFamily: null,
    };
  }

  return {
    valid: true,
    reason: 'approved-tier-c-license',
    category: matchedRule.category,
    canonicalFamily: matchedRule.canonicalFamily,
  };
}

/**
 * Validate a Tier C ("Real-World Species Reference — Not GTA VI Gameplay") image
 * and its mandatory 8-field provenance & licensing record.
 *
 * @param {object} meta
 * @returns {{
 *   allowed: boolean,
 *   tier: 'C',
 *   tierLabel: string,
 *   reason: string,
 *   licenseCategory: string|null,
 *   canonicalLicenseFamily: string|null,
 *   normalizedUrl: string|null,
 *   imageSource: string|null
 * }}
 */
export function evaluateTierCReferenceImage(meta = {}) {
  if (!meta || typeof meta !== 'object') {
    return {
      allowed: false,
      tier: 'C',
      tierLabel: TIER_C_LABEL,
      reason: 'missing-tier-c-metadata',
      licenseCategory: null,
      canonicalLicenseFamily: null,
      normalizedUrl: null,
      imageSource: null,
    };
  }

  // 1. Verify all 8 mandatory provenance & licensing fields are present and non-empty
  for (const field of TIER_C_REQUIRED_METADATA_FIELDS) {
    const val = String(meta[field] || '').trim();
    if (!val) {
      return {
        allowed: false,
        tier: 'C',
        tierLabel: TIER_C_LABEL,
        reason: `missing-required-field:${field}`,
        licenseCategory: null,
        canonicalLicenseFamily: null,
        normalizedUrl: null,
        imageSource: null,
      };
    }
  }

  // 2. Reject unclear ownership / creator
  const creator = String(meta.creatorName || '').trim();
  if (creator.length < 2 || UNCLEAR_CREATOR_PATTERN.test(creator)) {
    return {
      allowed: false,
      tier: 'C',
      tierLabel: TIER_C_LABEL,
      reason: 'unclear-creator-or-ownership',
      licenseCategory: null,
      canonicalLicenseFamily: null,
      normalizedUrl: null,
      imageSource: null,
    };
  }

  // 3. Validate dateAcquired format (YYYY-MM-DD)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(meta.dateAcquired || '').trim())) {
    return {
      allowed: false,
      tier: 'C',
      tierLabel: TIER_C_LABEL,
      reason: 'invalid-date-acquired',
      licenseCategory: null,
      canonicalLicenseFamily: null,
      normalizedUrl: null,
      imageSource: null,
    };
  }

  // 4. Validate originalSourcePageUrl and originalImageUrl
  const normImgUrl = normalizeImageUrl(meta.originalImageUrl);
  const normPageUrl = normalizeImageUrl(meta.originalSourcePageUrl);
  if (!normImgUrl || !normPageUrl) {
    return {
      allowed: false,
      tier: 'C',
      tierLabel: TIER_C_LABEL,
      reason: 'invalid-source-or-image-url',
      licenseCategory: null,
      canonicalLicenseFamily: null,
      normalizedUrl: null,
      imageSource: null,
    };
  }

  let imgUrlObj;
  let pageUrlObj;
  try {
    imgUrlObj = new URL(normImgUrl);
    pageUrlObj = new URL(normPageUrl);
  } catch {
    return {
      allowed: false,
      tier: 'C',
      tierLabel: TIER_C_LABEL,
      reason: 'invalid-source-or-image-url',
      licenseCategory: null,
      canonicalLicenseFamily: null,
      normalizedUrl: null,
      imageSource: null,
    };
  }

  const imgHost = imgUrlObj.hostname.toLowerCase();
  const pageHost = pageUrlObj.hostname.toLowerCase();

  // 5. Reject commercial stock hosts unconditionally
  if (
    COMMERCIAL_STOCK_PROHIBITED_HOSTS.some((blocked) => hostMatches(imgHost, blocked) || hostMatches(pageHost, blocked))
  ) {
    return {
      allowed: false,
      tier: 'C',
      tierLabel: TIER_C_LABEL,
      reason: 'commercial-stock-prohibited',
      licenseCategory: null,
      canonicalLicenseFamily: null,
      normalizedUrl: normImgUrl,
      imageSource: null,
    };
  }

  // 6. Require approved Tier C hosts for both source page and image asset
  const imgHostApproved = TIER_C_APPROVED_HOSTS.some((allowed) => hostMatches(imgHost, allowed));
  const pageHostApproved = TIER_C_APPROVED_HOSTS.some((allowed) => hostMatches(pageHost, allowed));
  if (!imgHostApproved || !pageHostApproved) {
    return {
      allowed: false,
      tier: 'C',
      tierLabel: TIER_C_LABEL,
      reason: 'unapproved-tier-c-host',
      licenseCategory: null,
      canonicalLicenseFamily: null,
      normalizedUrl: normImgUrl,
      imageSource: null,
    };
  }

  // 7. Reject watermarked, AI-generated, or GTA V / RDR2 / older game imagery
  const combinedInspect = [
    normImgUrl,
    normPageUrl,
    meta.creatorName,
    meta.attributionText,
    meta.modifications,
    meta.notes || '',
    meta.fileName || '',
  ].join(' ');

  if (
    TIER_C_BLOCKED_PATTERNS.some((rx) => rx.test(combinedInspect)) ||
    TIER_C_REJECTED_CONTENT_PATTERN.test(combinedInspect) ||
    meta.watermarked === true ||
    meta.aiGenerated === true
  ) {
    return {
      allowed: false,
      tier: 'C',
      tierLabel: TIER_C_LABEL,
      reason: 'watermarked-or-ai-or-blocked-content',
      licenseCategory: null,
      canonicalLicenseFamily: null,
      normalizedUrl: normImgUrl,
      imageSource: null,
    };
  }

  if (NON_GTA6_GAME_PATTERN.test(combinedInspect)) {
    return {
      allowed: false,
      tier: 'C',
      tierLabel: TIER_C_LABEL,
      reason: 'non-gtavi-game-asset',
      licenseCategory: null,
      canonicalLicenseFamily: null,
      normalizedUrl: normImgUrl,
      imageSource: null,
    };
  }

  // 8. Validate license classification & platform-specific rules
  const licenseCheck = classifyTierCLicense(meta.licenseName, meta.licenseUrl, [imgHost, pageHost]);
  if (!licenseCheck.valid) {
    return {
      allowed: false,
      tier: 'C',
      tierLabel: TIER_C_LABEL,
      reason: licenseCheck.reason,
      licenseCategory: null,
      canonicalLicenseFamily: null,
      normalizedUrl: normImgUrl,
      imageSource: null,
    };
  }

  const formattedSource = `${TIER_C_LABEL} — Photo by ${creator} (${String(meta.licenseName).trim()})`;

  return {
    allowed: true,
    tier: 'C',
    tierLabel: TIER_C_LABEL,
    reason: 'approved-tier-c-species-reference',
    licenseCategory: licenseCheck.category,
    canonicalLicenseFamily: licenseCheck.canonicalFamily,
    normalizedUrl: normImgUrl,
    imageSource: formattedSource,
  };
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

  // Narrowly recognize explicitly approved Tier C ("Real-World Species Reference — Not GTA VI Gameplay")
  // when evaluated with tier: 'C' or tierCMetadata. Never bypasses default safeguards for Tier A/B.
  if (opts && (opts.tier === 'C' || opts.allowTierC === true || opts.tierCMetadata)) {
    const tierMeta = {
      ...(opts.tierCMetadata || opts),
      originalImageUrl: (opts.tierCMetadata && opts.tierCMetadata.originalImageUrl) || s,
    };
    return evaluateTierCReferenceImage(tierMeta);
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
