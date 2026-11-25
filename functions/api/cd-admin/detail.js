import { json, REF_RE } from "../../_lib/cd.js";

// Owner-only. Full detail including private contact + reviewer notes + provenance + audit trail + reports.
export async function onRequestGet({ request, env }) {
  const ref = new URL(request.url).searchParams.get("ref") || "";
  if (!REF_RE.test(ref)) return json({ ok: false, error: "Invalid reference." }, 400);
  const s = await env.DB.prepare("SELECT * FROM cd_submissions WHERE ref = ?1").bind(ref).first();
  if (!s) return json({ ok: false, error: "Not found." }, 404);
  const q = async (sql, ...a) => (await env.DB.prepare(sql).bind(...a).all()).results || [];
  const evidence = await q("SELECT kind, url, domain, created_at, reviewer_checked FROM cd_evidence WHERE submission_id = ?1", s.id);
  const sources = await q("SELECT url, domain, created_at FROM cd_sources WHERE submission_id = ?1", s.id);
  const relations = await q(
    `SELECT r.kind, r.score, r.created_by, r.created_at, o.ref AS related_ref, o.title AS related_title, o.evidence_status AS related_status
     FROM cd_relations r JOIN cd_submissions o ON o.id = r.related_id WHERE r.submission_id = ?1
     UNION ALL
     SELECT r.kind, r.score, r.created_by, r.created_at, o.ref, o.title, o.evidence_status
     FROM cd_relations r JOIN cd_submissions o ON o.id = r.submission_id WHERE r.related_id = ?1 AND r.created_by != 'system'`,
    s.id
  );
  const decisions = await q("SELECT action, from_status, to_status, internal_note, reviewer, created_at FROM cd_decisions WHERE submission_id = ?1 ORDER BY id", s.id);
  const audit = await q("SELECT at, actor, action, before_json, after_json FROM cd_audit WHERE submission_id = ?1 ORDER BY id", s.id);
  const published = await env.DB.prepare("SELECT * FROM cd_published WHERE submission_id = ?1").bind(s.id).first();
  let verification_meta = null;
  let reports = [];
  try {
    verification_meta = await env.DB.prepare("SELECT * FROM cd_verification_meta WHERE submission_id = ?1").bind(s.id).first();
    if (verification_meta) delete verification_meta.submission_id;
  } catch { /* migration 0002 optional fallback */ }
  try {
    reports = await q("SELECT reason, details, created_at FROM cd_reports WHERE ref = ?1 ORDER BY id DESC LIMIT 50", ref);
  } catch { /* migration 0002 optional fallback */ }

  const dupOf = s.duplicate_of ? await env.DB.prepare("SELECT ref FROM cd_submissions WHERE id = ?1").bind(s.duplicate_of).first() : null;
  const { id, ip_hash, content_hash, duplicate_of, ...submission } = s; // do not expose internals even to the UI
  if (published) { delete published.id; delete published.submission_id; }
  return json({
    ok: true,
    submission: { ...submission, duplicate_of_ref: dupOf ? dupOf.ref : null },
    evidence,
    sources,
    relations,
    decisions,
    audit,
    published,
    verification_meta,
    reports,
  });
}
