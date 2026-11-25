import { json, PUBLISHABLE, STATUSES, PUBLIC_LABELS, MAP_CLASSIFICATIONS, VERIFIED_STATUSES } from "../../_lib/cd.js";

// Owner-approved community map entries, in the EXISTING map-pins.json pin schema, kept in a SEPARATE feed.
// Nothing here is written to public/data/map-pins.json and nothing counts toward the 100% completion tracker
// (every pin carries counts_toward_completion:false). Pending submissions can never appear here.
export async function onRequestGet({ env }) {
  if (!env.DB) return json({ ok: true, total_pins: 0, pins: [] });
  const { results } = await env.DB.prepare(
    `SELECT ref, map_pin, evidence_status, published_at FROM cd_published
     WHERE is_published = 1 AND map_approved = 1 AND map_pin IS NOT NULL
       AND evidence_status IN (${PUBLISHABLE.map(() => "?").join(",")})
     ORDER BY published_at DESC LIMIT 200`
  ).bind(...PUBLISHABLE).all();
  const pins = [];
  for (const r of results || []) {
    try {
      const p = JSON.parse(r.map_pin);
      const detailUrl = `/community-discoveries/d/${encodeURIComponent(r.ref)}`;
      const mapClassification = MAP_CLASSIFICATIONS[r.evidence_status] || "Community Reported";
      pins.push({
        ...p,
        id: `community-${r.ref}`,
        ref: r.ref,
        status: "community",
        is_community: true,
        evidence_status: r.evidence_status,
        evidence_label: STATUSES[r.evidence_status] || r.evidence_status,
        evidence_notice: PUBLIC_LABELS[r.evidence_status] || "",
        map_classification: mapClassification,
        badge: mapClassification,
        is_verified: VERIFIED_STATUSES.includes(r.evidence_status),
        link: detailUrl,
        detail_url: detailUrl,
        published_at: r.published_at || null,
        counts_toward_completion: false,
      });
    } catch { /* skip corrupt row */ }
  }
  return json({ ok: true, total_pins: pins.length, pins }, 200, { "Cache-Control": "public, max-age=60", "X-Robots-Tag": "noindex" });
}
