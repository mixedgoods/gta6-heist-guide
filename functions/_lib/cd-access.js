// Cloudflare Access JWT verification (RS256) for owner-only admin endpoints and dashboard. Not a route.
// Required env (must be configured by the owner in Cloudflare Pages Production):
//   CF_ACCESS_TEAM_DOMAIN  e.g. "myteam.cloudflareaccess.com"
//   CF_ACCESS_AUD          one or more comma-separated Access application Audience (AUD) tags
//   CD_ADMIN_EMAILS        comma-separated owner email allowlist (required; fails closed if empty)

const jwksCache = new Map(); // team -> { keys, at }
const JWKS_TTL_MS = 60 * 60 * 1000;

function b64uToBytes(s) {
  const b = atob(s.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(s.length / 4) * 4, "="));
  return Uint8Array.from(b, (c) => c.charCodeAt(0));
}
const b64uJson = (s) => JSON.parse(new TextDecoder().decode(b64uToBytes(s)));

function parseCsvList(v, lower = false) {
  return String(v || "")
    .split(",")
    .map((s) => (lower ? s.trim().toLowerCase() : s.trim()))
    .filter(Boolean);
}

async function getJwks(team, fetchImpl, force = false) {
  const hit = jwksCache.get(team);
  if (!force && hit && Date.now() - hit.at < JWKS_TTL_MS) return hit.keys;
  const res = await fetchImpl(`https://${team}/cdn-cgi/access/certs`);
  if (!res.ok) throw new Error("jwks_fetch_failed");
  const { keys } = await res.json();
  jwksCache.set(team, { keys, at: Date.now() });
  return keys;
}

export function resetJwksCache() { jwksCache.clear(); }

/**
 * Returns { ok:true, email, sub, aud } or { ok:false, status, reason }.
 * status 503 = Access/allowlist not configured (fail closed), 401 = missing/invalid token, 403 = not on allowlist.
 */
export async function verifyAccess(request, env, fetchImpl = fetch) {
  const team = String(env.CF_ACCESS_TEAM_DOMAIN || "").trim().toLowerCase();
  const allowedAuds = parseCsvList(env.CF_ACCESS_AUD, false);
  const allowEmails = parseCsvList(env.CD_ADMIN_EMAILS, true);
  if (!team || !allowedAuds.length || !allowEmails.length || !/^[a-z0-9.-]+\.cloudflareaccess\.com$/.test(team)) {
    return { ok: false, status: 503, reason: "admin_not_configured" };
  }
  const token = request.headers.get("Cf-Access-Jwt-Assertion");
  if (!token) return { ok: false, status: 401, reason: "missing_token" };
  const parts = token.split(".");
  if (parts.length !== 3) return { ok: false, status: 401, reason: "malformed_token" };
  try {
    const header = b64uJson(parts[0]);
    const payload = b64uJson(parts[1]);
    if (header.alg !== "RS256" || !header.kid) return { ok: false, status: 401, reason: "bad_alg" };

    let keys = await getJwks(team, fetchImpl);
    let jwk = keys.find((k) => k.kid === header.kid);
    if (!jwk) {
      keys = await getJwks(team, fetchImpl, true); // key rotation
      jwk = keys.find((k) => k.kid === header.kid);
    }
    if (!jwk) return { ok: false, status: 401, reason: "unknown_kid" };

    const key = await crypto.subtle.importKey("jwk", jwk, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]);
    const valid = await crypto.subtle.verify(
      "RSASSA-PKCS1-v1_5", key, b64uToBytes(parts[2]), new TextEncoder().encode(`${parts[0]}.${parts[1]}`)
    );
    if (!valid) return { ok: false, status: 401, reason: "bad_signature" };

    const now = Math.floor(Date.now() / 1000);
    const tokenAuds = Array.isArray(payload.aud)
      ? payload.aud.filter((a) => typeof a === "string")
      : typeof payload.aud === "string"
        ? [payload.aud]
        : [];
    const matchedAud = tokenAuds.find((a) => allowedAuds.includes(a));
    if (!matchedAud) return { ok: false, status: 401, reason: "bad_aud" };
    if (payload.iss !== `https://${team}`) return { ok: false, status: 401, reason: "bad_iss" };
    if (typeof payload.exp !== "number" || payload.exp < now) return { ok: false, status: 401, reason: "expired" };
    if (payload.nbf !== undefined && (typeof payload.nbf !== "number" || payload.nbf > now + 30)) {
      return { ok: false, status: 401, reason: "not_yet_valid" };
    }

    const email = String(payload.email || "").trim().toLowerCase();
    if (!email) return { ok: false, status: 401, reason: "no_identity" };
    if (!allowEmails.includes(email)) return { ok: false, status: 403, reason: "not_allowlisted" };
    return { ok: true, email, sub: String(payload.sub || ""), aud: matchedAud };
  } catch {
    return { ok: false, status: 401, reason: "verify_error" };
  }
}
