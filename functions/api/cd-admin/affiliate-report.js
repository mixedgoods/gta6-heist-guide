import { json } from "../../_lib/cd.js";
import { getAffiliateClickReport } from "../../_lib/affiliate-clicks.js";

// Owner-only affiliate click analytics report.
// Protected by functions/api/cd-admin/_middleware.js (Cloudflare Access RS256 JWT + CD_ADMIN_EMAILS allowlist, fail-closed).
export async function onRequestGet({ env }) {
  try {
    if (!env || !env.DB) {
      return json({ ok: false, error: "Database unavailable." }, 500);
    }
    const report = await getAffiliateClickReport(env.DB);
    return json({ ok: true, ...report });
  } catch {
    return json({ ok: false, error: "Unable to load affiliate report." }, 500);
  }
}

export async function onRequest() {
  return json({ ok: false, error: "Method not allowed." }, 405, { Allow: "GET" });
}
