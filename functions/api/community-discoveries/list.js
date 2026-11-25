import {
  json, CATEGORIES, REGIONS, STATUSES, PUBLISHABLE, VERIFIED_STATUSES, PUBLIC_LABELS, MAP_CLASSIFICATIONS,
} from "../../_lib/cd.js";

// PUBLIC read-only list of owner-approved, published community discoveries ONLY.
// Exposes: ref, detail_url, title, category, short_explanation, finding_instructions, region,
// evidence_status + label + notice + map_classification, published_at/updated_at/moderated_at,
// credit_name (only if contributor chose named credit), reviewer-approved links, related_guides,
// related_db_records, featured flag, platform/game_version (when provided), authoritative_source.
// Never exposes: internal ids, e-mail, ip hash, reviewer notes, original (unedited) submission text, pending items.
export async function onRequestGet({ request, env }) {
  if (!env.DB) return json({ ok: true, total: 0, items: [] });
  const u = new URL(request.url);
  const category = u.searchParams.get("category") || "";
  const region = u.searchParams.get("region") || "";
  const status = u.searchParams.get("status") || "";
  const featuredOnly = u.searchParams.get("featured") === "1";
  const q = (u.searchParams.get("q") || "").slice(0, 80).trim();
  const sortParam = u.searchParams.get("sort") || "newest";
  const sort = sortParam === "updated" ? "updated" : sortParam === "featured" ? "featured" : "newest";
  const limit = Math.min(Math.max(parseInt(u.searchParams.get("limit") || "30", 10) || 30, 1), 50);
  const offset = Math.min(Math.max(parseInt(u.searchParams.get("offset") || "0", 10) || 0, 0), 5000);

  const where = ["p.is_published = 1", `p.evidence_status IN (${PUBLISHABLE.map(() => "?").join(",")})`];
  const args = [...PUBLISHABLE];
  if (category) {
    if (!Object.hasOwn(CATEGORIES, category)) return json({ ok: false, error: "Unknown category." }, 400);
    where.push("p.category = ?"); args.push(category);
  }
  if (region) {
    if (!REGIONS.includes(region)) return json({ ok: false, error: "Unknown region." }, 400);
    where.push("p.region = ?"); args.push(region);
  }
  if (status) {
    if (!PUBLISHABLE.includes(status)) return json({ ok: false, error: "Unknown status." }, 400);
    where.push("p.evidence_status = ?"); args.push(status);
  }
  if (q) {
    const like = `%${q.replace(/[\\%_]/g, (m) => "\\" + m)}%`;
    where.push("(p.title LIKE ? ESCAPE '\\' OR p.short_explanation LIKE ? ESCAPE '\\' OR p.finding_instructions LIKE ? ESCAPE '\\')");
    args.push(like, like, like);
  }

  let hasMeta = true;
  try {
    await env.DB.prepare("SELECT 1 FROM cd_verification_meta LIMIT 1").first();
  } catch {
    hasMeta = false;
  }

  if (featuredOnly && hasMeta) {
    where.push("COALESCE(m.featured, 0) = 1");
  }

  const w = where.join(" AND ");
  const joinSql = hasMeta
    ? "FROM cd_published p LEFT JOIN cd_submissions s ON s.id = p.submission_id LEFT JOIN cd_verification_meta m ON m.submission_id = p.submission_id"
    : "FROM cd_published p LEFT JOIN cd_submissions s ON s.id = p.submission_id";

  const order = sort === "updated"
    ? "p.updated_at DESC"
    : sort === "featured" && hasMeta
      ? "COALESCE(m.featured, 0) DESC, p.published_at DESC"
      : "p.published_at DESC";

  const totalRow = await env.DB.prepare(`SELECT COUNT(*) AS n ${joinSql} WHERE ${w}`).bind(...args).first();
  const total = totalRow ? totalRow.n : 0;

  const metaCols = hasMeta
    ? ", COALESCE(m.featured, 0) AS featured, m.authoritative_source_url, m.authoritative_source_label, m.evidence_source_summary, m.related_db_records, m.moderated_at"
    : "";

  const { results } = await env.DB.prepare(
    `SELECT p.ref, p.title, p.category, p.short_explanation, p.finding_instructions, p.region, p.evidence_status,
            p.credit_name, p.public_links, p.related_guides, p.published_at, p.updated_at, p.map_approved,
            s.platform, s.game_version, s.created_at AS submitted_at${metaCols}
     ${joinSql} WHERE ${w} ORDER BY ${order} LIMIT ? OFFSET ?`
  ).bind(...args, limit, offset).all();

  const parse = (s) => { try { const a = JSON.parse(s || "[]"); return Array.isArray(a) ? a : []; } catch { return []; } };
  const safePath = (p) => typeof p === "string" && /^\/(?!\/)[A-Za-z0-9\-_/.#]*$/.test(p);

  const items = (results || []).map((r) => ({
    ref: r.ref,
    detail_url: `/community-discoveries/d/${encodeURIComponent(r.ref)}`,
    title: r.title,
    category: r.category,
    category_label: CATEGORIES[r.category] || r.category,
    short_explanation: r.short_explanation,
    finding_instructions: r.finding_instructions,
    region: r.region,
    evidence_status: r.evidence_status,
    evidence_label: STATUSES[r.evidence_status] || r.evidence_status,
    evidence_notice: PUBLIC_LABELS[r.evidence_status] || "",
    map_classification: MAP_CLASSIFICATIONS[r.evidence_status] || "Community Reported",
    is_verified: VERIFIED_STATUSES.includes(r.evidence_status),
    featured: r.featured === 1,
    platform: r.platform || null,
    game_version: r.game_version || null,
    evidence_source_summary: r.evidence_source_summary || null,
    authoritative_source: r.authoritative_source_url
      ? { label: r.authoritative_source_label || "Official Source", url: r.authoritative_source_url }
      : null,
    credit: r.credit_name || null,
    links: parse(r.public_links).filter((l) => l && typeof l.url === "string" && l.url.startsWith("https://")).slice(0, 5)
      .map((l) => ({ label: String(l.label || "Reference").slice(0, 60), url: l.url })),
    related_guides: parse(r.related_guides).filter(safePath).slice(0, 5),
    related_db_records: parse(r.related_db_records).filter(safePath).slice(0, 5),
    on_map: r.map_approved === 1,
    map_pin_id: r.map_approved === 1 ? `community-${r.ref}` : null,
    submitted_at: r.submitted_at || null,
    published_at: r.published_at,
    verified_at: r.moderated_at || r.published_at,
    updated_at: r.updated_at,
  }));
  return json({ ok: true, total, items }, 200, { "Cache-Control": "public, max-age=60", "X-Robots-Tag": "noindex" });
}
