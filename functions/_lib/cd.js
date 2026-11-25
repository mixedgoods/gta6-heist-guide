// Shared helpers for the Community Discoveries system. Not a route (exports no onRequest*).

export const CATEGORIES = {
  hidden_location: "Hidden locations",
  secret_area: "Secret areas",
  rare_vehicle: "Rare vehicles",
  wildlife: "Wildlife sightings",
  weapons_equipment: "Weapons and equipment",
  collectible: "Collectibles",
  safe_code: "Safe codes",
  mission_tip: "Mission discoveries & tips",
  glitch: "Glitches",
  easter_egg: "Easter eggs",
  side_activity: "Side activities",
  money_method: "Money-making methods",
  map_correction: "Map corrections",
  general: "Other useful findings",
};

export const REGIONS = [
  "Vice City", "Vice Beach", "Grassrivers", "Leonida Keys", "Mt. Kalaga",
  "Port Gellhorn", "Lake Leonida", "Ambrosia", "Other / not sure",
];

export const PLATFORMS = { PS5: "PS5", XBOX_SERIES: "Xbox Series X|S" };

export const STATUSES = {
  PENDING_REVIEW: "Awaiting Review",
  NEEDS_MORE_EVIDENCE: "Needs More Evidence",
  COMMUNITY_REPORTED: "Community Reported",
  CORROBORATED: "Corroborated",
  INDEPENDENTLY_VERIFIED: "Verified in Gameplay",
  OFFICIALLY_CONFIRMED: "Officially Confirmed",
  REJECTED: "Rejected",
};

// Statuses that may ever be public.
export const PUBLISHABLE = [
  "COMMUNITY_REPORTED",
  "CORROBORATED",
  "INDEPENDENTLY_VERIFIED",
  "OFFICIALLY_CONFIRMED",
];

// Statuses that count as gameplay/officially verified (not merely community reported).
export const VERIFIED_STATUSES = [
  "INDEPENDENTLY_VERIFIED",
  "OFFICIALLY_CONFIRMED",
];

export const PUBLIC_LABELS = {
  COMMUNITY_REPORTED: "Community Reported — Not independently verified by GTA6HeistGuide.",
  CORROBORATED: "Corroborated — Supported by multiple independent observations or credible evidence. Verification in gameplay still pending.",
  INDEPENDENTLY_VERIFIED: "Verified in Gameplay — Reproduced and verified in gameplay by an authorized GTA6HeistGuide reviewer.",
  OFFICIALLY_CONFIRMED: "Officially Confirmed — Supported by an authoritative official source.",
};

export const MAP_CLASSIFICATIONS = {
  COMMUNITY_REPORTED: "Community Reported",
  CORROBORATED: "Verification Pending",
  INDEPENDENTLY_VERIFIED: "Verified Discovery",
  OFFICIALLY_CONFIRMED: "Verified Discovery",
};

export const REPORT_REASONS = {
  inaccurate: "Inaccurate or misleading claim",
  outdated_patch: "Patched or outdated in newer game version",
  wrong_location: "Incorrect map location or directions",
  duplicate: "Duplicate of an existing discovery or guide",
  broken_evidence: "Broken or unverified evidence link",
  other: "Other editorial correction",
};

export const MAX_BODY_BYTES = 24 * 1024;

export const SECURITY_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
  "X-Robots-Tag": "noindex, nofollow",
};

export function json(data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data), { status, headers: { ...SECURITY_HEADERS, ...extra } });
}

export const nowIso = () => new Date().toISOString().replace(/\.\d+Z$/, "Z");

// ---------- HTML escaping & script/markup rejection ----------

export function escapeHtml(str) {
  return String(str == null ? "" : str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const SCRIPT_OR_HTML_RE = /<\s*\/?\s*(script|iframe|object|embed|svg|math|style|link|meta|form|input|button|textarea|select|img|video|audio|source|body|html|head|base|applet|frame|frameset)\b|javascript\s*:|vbscript\s*:|data\s*:\s*text\/html|\bon(?:error|load|click|dblclick|mousedown|mouseup|mouseover|mouseout|mousemove|focus|blur|input|change|submit|keydown|keyup|keypress|animationstart|toggle|pointerover)\s*=/i;

/** Returns true if text contains executable HTML tags, script tags, event handlers, or dangerous URI schemes. */
export function containsDangerousMarkup(v) {
  if (typeof v !== "string" || !v) return false;
  return SCRIPT_OR_HTML_RE.test(v);
}

/** Substantive quality gate for indexing a published discovery detail page and including it in sitemap.xml. */
export function isSubstantiveForIndex(pub) {
  if (!pub || pub.is_published !== 1) return false;
  if (!PUBLISHABLE.includes(pub.evidence_status)) return false;
  const title = String(pub.title || "").trim();
  const shortExp = String(pub.short_explanation || "").trim();
  const instructions = String(pub.finding_instructions || "").trim();
  const region = String(pub.region || "").trim();
  return title.length >= 10 && shortExp.length >= 60 && instructions.length >= 40 && region.length >= 3;
}

// ---------- request guards ----------

/** State-changing requests must be same-origin JSON. Returns an error Response or null. */
export function guardSameOriginJson(request) {
  const origin = request.headers.get("Origin");
  if (!origin || origin !== new URL(request.url).origin) {
    return json({ ok: false, error: "Cross-origin or origin-less requests are not accepted." }, 403);
  }
  const sfs = request.headers.get("Sec-Fetch-Site");
  if (sfs && sfs !== "same-origin") {
    return json({ ok: false, error: "Cross-site request rejected." }, 403);
  }
  const ct = (request.headers.get("Content-Type") || "").toLowerCase();
  if (!ct.startsWith("application/json")) {
    return json({ ok: false, error: "Content-Type must be application/json." }, 415);
  }
  return null;
}

/** Read the body with a hard byte cap, independent of Content-Length. */
export async function readJsonLimited(request, max = MAX_BODY_BYTES) {
  const declared = Number(request.headers.get("Content-Length") || 0);
  if (declared > max) return { error: json({ ok: false, error: "Request too large." }, 413) };
  const reader = request.body?.getReader();
  if (!reader) return { error: json({ ok: false, error: "Empty body." }, 400) };
  const chunks = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > max) {
      try { await reader.cancel(); } catch { /* ignore */ }
      return { error: json({ ok: false, error: "Request too large." }, 413) };
    }
    chunks.push(value);
  }
  const buf = new Uint8Array(total);
  let off = 0;
  for (const c of chunks) { buf.set(c, off); off += c.byteLength; }
  try {
    const parsed = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(buf));
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("shape");
    return { body: parsed };
  } catch {
    return { error: json({ ok: false, error: "Invalid JSON body." }, 400) };
  }
}

// ---------- hashing / ids ----------

export async function sha256Hex(text) {
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

const B32 = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
export function newRef() {
  const bytes = crypto.getRandomValues(new Uint8Array(10));
  let s = "";
  for (const b of bytes) s += B32[b % 32];
  return `CD-${s.slice(0, 5)}-${s.slice(5)}`;
}
export const REF_RE = /^CD-[0-9A-HJKMNP-TV-Z]{5}-[0-9A-HJKMNP-TV-Z]{5}$/;

export function hashSaltConfigured(env) {
  return String(env?.CD_HASH_SALT || "").trim().length >= 32;
}

export async function ipHash(request, env) {
  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  const salt = String(env?.CD_HASH_SALT || "").trim();
  if (salt.length < 32) throw new Error("hash_salt_not_configured");
  return (await sha256Hex(`${salt}|${ip}`)).slice(0, 32);
}

// ---------- text / url validation ----------

// eslint-disable-next-line no-control-regex
const CTRL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F\u200B-\u200F\u202A-\u202E\u2066-\u2069\uFEFF]/g;

export function cleanText(v, { multiline = false } = {}) {
  if (typeof v !== "string") return "";
  let s = v.normalize("NFC").replace(CTRL, "");
  s = multiline ? s.replace(/\r\n?/g, "\n").replace(/\n{4,}/g, "\n\n\n") : s.replace(/\s+/g, " ");
  return s.trim();
}

const PRIVATE_HOST = /^(localhost|.*\.local|.*\.internal|.*\.localhost)$/i;

/** Returns normalized URL string or null if unsafe. https only, no credentials, no IP literals/private hosts. */
export function safeUrl(v) {
  if (typeof v !== "string") return null;
  const raw = v.trim();
  if (raw.length < 8 || raw.length > 500 || /[\s<>"'`\\]/.test(raw)) return null;
  let u;
  try { u = new URL(raw); } catch { return null; }
  if (u.protocol !== "https:") return null;
  if (u.username || u.password) return null;
  const h = u.hostname.toLowerCase();
  if (!h.includes(".") || PRIVATE_HOST.test(h)) return null;
  if (/^\d+\.\d+\.\d+\.\d+$/.test(h) || h.includes(":") || h.startsWith("[")) return null; // IP literals
  if (u.port && u.port !== "443") return null;
  if (/\.(zip|mov|exe|scr|bat|cmd|ps1|msi|apk|dmg|jar)$/i.test(u.pathname)) return null;
  u.hash = "";
  return u.toString();
}

export function normalizeUrlForHash(u) {
  const x = new URL(u);
  x.hash = "";
  let host = x.hostname.toLowerCase().replace(/^www\./, "");
  if (host === "youtu.be") {
    return `youtube.com/watch?v=${x.pathname.slice(1)}`;
  }
  if (host.endsWith("youtube.com") && x.searchParams.get("v")) {
    return `youtube.com/watch?v=${x.searchParams.get("v")}`;
  }
  return `${host}${x.pathname.replace(/\/+$/, "")}${x.search}`;
}

export function domainOf(u) {
  try { return new URL(u).hostname.toLowerCase().replace(/^www\./, ""); } catch { return null; }
}

// ---------- duplicate heuristics ----------

const STOP = new Set(["the", "and", "for", "with", "that", "this", "from", "near", "gta", "vice", "city", "you", "are", "can", "found", "find", "there", "have", "has", "its"]);
export function tokens(s) {
  return new Set(
    (s || "").toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((w) => w.length >= 3 && !STOP.has(w))
  );
}
export function jaccard(a, b) {
  if (!a.size || !b.size) return 0;
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  return inter / (a.size + b.size - inter);
}

// ---------- rate limiting (D1-backed; no Cloudflare rate-limit binding exists in this project) ----------

export async function rlCount(db, key, windowSec, now = Date.now()) {
  const w = Math.floor(now / 1000 / windowSec) * windowSec;
  const r = await db.prepare("SELECT count FROM cd_rate_limit WHERE key = ?1 AND window_start = ?2").bind(key, w).first();
  return r ? r.count : 0;
}
export async function rlHit(db, key, windowSec, now = Date.now()) {
  const w = Math.floor(now / 1000 / windowSec) * windowSec;
  const r = await db
    .prepare(
      "INSERT INTO cd_rate_limit (key, window_start, count) VALUES (?1, ?2, 1) ON CONFLICT(key, window_start) DO UPDATE SET count = count + 1 RETURNING count"
    )
    .bind(key, w)
    .first();
  return r ? r.count : 1;
}
export async function rlPrune(db, now = Date.now()) {
  await db.prepare("DELETE FROM cd_rate_limit WHERE window_start < ?1").bind(Math.floor(now / 1000) - 3 * 86400).run();
}

// ---------- Turnstile (required; fails closed if not configured) ----------

export function turnstileConfigured(env) {
  return Boolean(String(env?.TURNSTILE_SECRET_KEY || "").trim() && String(env?.TURNSTILE_SITE_KEY || "").trim());
}
export async function verifyTurnstile(env, token, request) {
  if (!turnstileConfigured(env)) return false;
  if (!token || typeof token !== "string" || token.length > 2048) return false;
  try {
    const form = new FormData();
    form.append("secret", String(env.TURNSTILE_SECRET_KEY).trim());
    form.append("response", token);
    const ip = request.headers.get("CF-Connecting-IP");
    if (ip) form.append("remoteip", ip);
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body: form });
    const data = await res.json();
    return data && data.success === true;
  } catch {
    return false; // fail closed
  }
}
