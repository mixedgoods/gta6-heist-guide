import {
  json, nowIso, REF_RE, PUBLISHABLE, REPORT_REASONS, guardSameOriginJson, readJsonLimited,
  cleanText, containsDangerousMarkup, ipHash, hashSaltConfigured, rlHit,
} from "../../_lib/cd.js";

// Public correction / issue report endpoint for published discoveries.
// Same-origin JSON only, rate-limited, allowlisted reasons, never exposes private info.
export async function onRequestPost({ request, env }) {
  const bad = guardSameOriginJson(request);
  if (bad) return bad;
  if (!env.DB || !hashSaltConfigured(env)) {
    return json({ ok: false, error: "Reporting is temporarily unavailable." }, 503);
  }

  const hash = await ipHash(request, env);
  try {
    const attempts = await rlHit(env.DB, `rep:${hash}`, 3600);
    if (attempts > 10) {
      return json({ ok: false, error: "Too many reports. Please try again later." }, 429, { "Retry-After": "3600" });
    }

    const { body, error } = await readJsonLimited(request, 4 * 1024);
    if (error) return error;

    const ref = typeof body.ref === "string" ? body.ref.trim() : "";
    if (!REF_RE.test(ref)) return json({ ok: false, error: "Invalid discovery reference." }, 400);

    const reason = typeof body.reason === "string" ? body.reason.trim() : "";
    if (!Object.hasOwn(REPORT_REASONS, reason)) {
      return json({ ok: false, error: "Select a valid report reason." }, 400);
    }

    const details = cleanText(body.details || "", { multiline: true });
    if (details.length > 500) {
      return json({ ok: false, error: "Details must be at most 500 characters." }, 400);
    }
    if (containsDangerousMarkup(details)) {
      return json({ ok: false, error: "HTML tags and scripts are not allowed." }, 400);
    }

    const pub = await env.DB.prepare(
      `SELECT submission_id FROM cd_published
       WHERE ref = ?1 AND is_published = 1 AND evidence_status IN (${PUBLISHABLE.map(() => "?").join(",")})
       LIMIT 1`
    ).bind(ref, ...PUBLISHABLE).first();
    if (!pub) return json({ ok: false, error: "Published discovery not found." }, 404);

    const now = nowIso();
    await env.DB.batch([
      env.DB.prepare(
        "INSERT INTO cd_reports (ref, reason, details, ip_hash, created_at) VALUES (?1, ?2, ?3, ?4, ?5)"
      ).bind(ref, reason, details || null, hash, now),
      env.DB.prepare(
        "INSERT INTO cd_audit (at, actor, action, submission_id, after_json) VALUES (?1, 'public', 'community_report_flag', ?2, ?3)"
      ).bind(now, pub.submission_id, JSON.stringify({ ref, reason })),
    ]);

    return json({ ok: true, message: "Thank you. Your correction note has been logged for moderator review." }, 201);
  } catch (err) {
    console.error("cd report error", err && err.message);
    return json({ ok: false, error: "Could not submit report. Please try again later." }, 500);
  }
}

export async function onRequest() {
  return json({ ok: false, error: "Method not allowed." }, 405, { Allow: "POST" });
}
