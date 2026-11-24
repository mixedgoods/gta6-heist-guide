import { json, STATUSES, nowIso } from "../../_lib/cd.js";

// Owner-only (middleware enforces Cloudflare Access). Read-only queue view.
export async function onRequestGet({ request, env }) {
  const u = new URL(request.url);
  const status = u.searchParams.get("status") || "ALL";
  const limit = Math.min(Math.max(parseInt(u.searchParams.get("limit") || "50", 10) || 50, 1), 100);
  const offset = Math.max(parseInt(u.searchParams.get("offset") || "0", 10) || 0, 0);

  const { results: counts } = await env.DB.prepare("SELECT evidence_status AS s, COUNT(*) AS n FROM cd_submissions GROUP BY evidence_status").all();
  const newCount = (await env.DB.prepare("SELECT COUNT(*) AS n FROM cd_submissions WHERE reviewer_status = 'new'").first()).n;

  let where = "1=1";
  const args = [];
  if (status === "NEW") where = "s.reviewer_status = 'new'";
  else if (status === "PENDING") where = "s.evidence_status IN ('PENDING_REVIEW','NEEDS_MORE_EVIDENCE')";
  else if (status === "APPROVED") where = "s.evidence_status IN ('COMMUNITY_REPORTED','CORROBORATED','INDEPENDENTLY_VERIFIED')";
  else if (status === "PUBLISHED") where = "p.is_published = 1";
  else if (status !== "ALL") {
    if (!Object.hasOwn(STATUSES, status)) return json({ ok: false, error: "Unknown status." }, 400);
    where = "s.evidence_status = ?"; args.push(status);
  }
  const { results } = await env.DB.prepare(
    `SELECT s.ref, s.created_at, s.title, s.category, s.region, s.evidence_status, s.reviewer_status, s.witnessed,
            (SELECT COUNT(*) FROM cd_relations r WHERE r.submission_id = s.id AND r.kind IN ('possible_duplicate','shared_source','nearby')) AS warnings,
            COALESCE(p.is_published, 0) AS is_published
     FROM cd_submissions s LEFT JOIN cd_published p ON p.submission_id = s.id
     WHERE ${where} ORDER BY s.id DESC LIMIT ? OFFSET ?`
  ).bind(...args, limit, offset).all();
  const byStatus = Object.fromEntries(Object.keys(STATUSES).map((k) => [k, 0]));
  for (const c of counts || []) byStatus[c.s] = c.n;
  const pendingCount = (byStatus.PENDING_REVIEW || 0) + (byStatus.NEEDS_MORE_EVIDENCE || 0);
  const approvedCount = (byStatus.COMMUNITY_REPORTED || 0) + (byStatus.CORROBORATED || 0) + (byStatus.INDEPENDENTLY_VERIFIED || 0);
  return json({ ok: true, now: nowIso(), counts: { ...byStatus, NEW: newCount, PENDING: pendingCount, APPROVED: approvedCount }, items: results || [] });
}
