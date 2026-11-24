import { json, turnstileConfigured, hashSaltConfigured } from "../../_lib/cd.js";

// Public, non-secret capability flags for the form. Only reports what is actually configured.
// Submissions stay closed until DB, Turnstile (both keys), and CD_HASH_SALT (>= 32 chars) are configured.
export async function onRequestGet({ env }) {
  const ts = turnstileConfigured(env);
  const saltOk = hashSaltConfigured(env);
  return json({
    ok: true,
    turnstile: ts ? { siteKey: String(env.TURNSTILE_SITE_KEY).trim() } : null,
    turnstileMisconfigured: !ts,
    uploads: false, // No R2 binding exists; file uploads are intentionally not offered.
    submissionsOpen: Boolean(env.DB) && ts && saltOk,
  }, 200, { "Cache-Control": "public, max-age=60" });
}
