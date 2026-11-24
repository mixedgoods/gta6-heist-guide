import { json, PUBLISHABLE, PUBLIC_LABELS } from "../../_lib/cd.js";

// Owner-approved community map entries, in the EXISTING map-pins.json pin schema, kept in a SEPARATE feed.
// Nothing here is written to public/data/map-pins.json and nothing counts toward the 100% completion tracker
// (every pin carries counts_toward_completion:false). Pending submissions can never appear here.
export async function onRequestGet({ env }) {
  if (!env.DB) return json({ ok: true, pins: [] });
  const { results } = await env.DB.prepare(
    `SELECT ref, map_pin, evidence_status FROM cd_published
     WHERE is_published = 1 AND map_approved = 1 AND map_pin IS NOT NULL
       AND evidence_status IN (${PUBLISHABLE.map(() => "?").join(",")})
     ORDER BY published_at DESC LIMIT 200`
  ).bind(...PUBLISHABLE).all();
  const pins = [];
  for (const r of results || []) {
    try {
      const p = JSON.parse(r.map_pin);
      pins.push({ ...p, id: `community-${r.ref}`, status: "community", evidence_status: r.evidence_status,
        evidence_notice: PUBLIC_LABELS[r.evidence_status], counts_toward_completion: false });
    } catch { /* skip corrupt row */ }
  }
  return json({ ok: true, total_pins: pins.length, pins }, 200, { "Cache-Control": "public, max-age=60", "X-Robots-Tag": "noindex" });
}
