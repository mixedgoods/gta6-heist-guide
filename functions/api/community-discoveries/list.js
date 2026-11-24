import { json, CATEGORIES, REGIONS, STATUSES, PUBLISHABLE, PUBLIC_LABELS } from "../../_lib/cd.js";

// PUBLIC read-only list of owner-approved, published community discoveries ONLY.
// Exposes: ref, title, category, short_explanation, finding_instructions, region, evidence_status + label,
// published_at/updated_at, credit_name (only if contributor chose named credit), reviewer-approved links.
// Never exposes: internal ids, e-mail, ip hash, reviewer notes, original (unedited) submission text, pending items.
export async function onRequestGet({ request, env }) {
  if (!env.DB) return json({ ok: true, total: 0, items: [] });
  const u = new URL(request.url);
  const category = u.searchParams.get("category") || "";
  const region = u.searchParams.get("region") || "";
  const status = u.searchParams.get("status") || "";
  const q = (u.searchParams.get("q") || "").slice(0, 80).trim();
  const sort = u.searchParams.get("sort") === "updated" ? "updated" : "newest";
  const limit = Math.min(Math.max(parseInt(u.searchParams.get("limit") || "30", 10) || 30, 1), 50);
  const offset = Math.min(Math.max(parseInt(u.searchParams.get("offset") || "0", 10) || 0, 0), 5000);

  const where = ["is_published = 1", `evidence_status IN (${PUBLISHABLE.map(() => "?").join(",")})`];
  const args = [...PUBLISHABLE];
  if (category) {
    if (!Object.hasOwn(CATEGORIES, category)) return json({ ok: false, error: "Unknown category." }, 400);
    where.push("category = ?"); args.push(category);
  }
  if (region) {
    if (!REGIONS.includes(region)) return json({ ok: false, error: "Unknown region." }, 400);
    where.push("region = ?"); args.push(region);
  }
  if (status) {
    if (!PUBLISHABLE.includes(status)) return json({ ok: false, error: "Unknown status." }, 400);
    where.push("evidence_status = ?"); args.push(status);
  }
  if (q) {
    const like = `%${q.replace(/[\\%_]/g, (m) => "\\" + m)}%`;
    where.push("(title LIKE ? ESCAPE '\\' OR short_explanation LIKE ? ESCAPE '\\' OR finding_instructions LIKE ? ESCAPE '\\')");
    args.push(like, like, like);
  }
  const order = sort === "updated" ? "updated_at DESC" : "published_at DESC";
  const w = where.join(" AND ");
  const total = (await env.DB.prepare(`SELECT COUNT(*) AS n FROM cd_published WHERE ${w}`).bind(...args).first()).n;
  const { results } = await env.DB.prepare(
    `SELECT ref, title, category, short_explanation, finding_instructions, region, evidence_status, credit_name, public_links,
            related_guides, published_at, updated_at, map_approved
     FROM cd_published WHERE ${w} ORDER BY ${order} LIMIT ? OFFSET ?`
  ).bind(...args, limit, offset).all();

  const parse = (s) => { try { const a = JSON.parse(s || "[]"); return Array.isArray(a) ? a : []; } catch { return []; } };
  const items = (results || []).map((r) => ({
    ref: r.ref,
    title: r.title,
    category: r.category,
    category_label: CATEGORIES[r.category] || r.category,
    short_explanation: r.short_explanation,
    finding_instructions: r.finding_instructions,
    region: r.region,
    evidence_status: r.evidence_status,
    evidence_label: STATUSES[r.evidence_status],
    evidence_notice: PUBLIC_LABELS[r.evidence_status],
    credit: r.credit_name || null,
    links: parse(r.public_links).filter((l) => l && typeof l.url === "string" && l.url.startsWith("https://")).slice(0, 5)
      .map((l) => ({ label: String(l.label || "Reference").slice(0, 60), url: l.url })),
    related_guides: parse(r.related_guides).filter((p) => typeof p === "string" && /^\/(?!\/)[A-Za-z0-9\-_/.#]*$/.test(p)).slice(0, 5),
    on_map: r.map_approved === 1,
    published_at: r.published_at,
    updated_at: r.updated_at,
  }));
  return json({ ok: true, total, items }, 200, { "Cache-Control": "public, max-age=60", "X-Robots-Tag": "noindex" });
}
