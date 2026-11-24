import { verifyAccess } from "../../_lib/cd-access.js";
import { json, guardSameOriginJson } from "../../_lib/cd.js";

// Every /api/cd-admin/* request must carry a valid Cloudflare Access JWT. Fails closed.
export async function onRequest(context) {
  const { request, env, next, data } = context;
  const auth = await verifyAccess(request, env);
  if (!auth.ok) {
    // Generic body: do not reveal which check failed to unauthenticated callers.
    return json(
      { ok: false, error: auth.status === 503 ? "Admin access is not configured." : "Unauthorized." },
      auth.status,
      { "X-Robots-Tag": "noindex, nofollow" }
    );
  }
  if (request.method !== "GET" && request.method !== "HEAD") {
    const bad = guardSameOriginJson(request);
    if (bad) return bad;
  }
  data.admin = { email: auth.email };
  return next();
}
