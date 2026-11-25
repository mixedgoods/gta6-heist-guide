import { json } from "../../_lib/cd.js";

// Owner-only subscriber list and CSV export.
// Protected by functions/api/cd-admin/_middleware.js (Cloudflare Access RS256 JWT + CD_ADMIN_EMAILS allowlist, fail-closed).
function escapeCsvCell(val) {
  const str = String(val ?? "");
  if (/[",\r\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function onRequestGet({ request, env }) {
  try {
    if (!env || !env.DB) {
      return json({ ok: false, error: "Database unavailable." }, 500);
    }

    const url = new URL(request.url);
    const exportType = url.searchParams.get("export");

    if (exportType === "csv") {
      const { results } = await env.DB.prepare(
        "SELECT id, email, callsign, platform, role, discord_tag, marketing_opt_in, created_at FROM subscribers ORDER BY id DESC"
      ).all();

      const header = "id,email,callsign,platform,role,discord_tag,marketing_opt_in,created_at";
      const rows = (results || []).map((r) =>
        [
          r.id,
          escapeCsvCell(r.email),
          escapeCsvCell(r.callsign),
          escapeCsvCell(r.platform),
          escapeCsvCell(r.role),
          escapeCsvCell(r.discord_tag),
          r.marketing_opt_in,
          escapeCsvCell(r.created_at),
        ].join(",")
      );

      const csv = [header, ...rows].join("\r\n");
      return new Response(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": 'attachment; filename="gta6heistguide-subscribers.csv"',
          "Cache-Control": "no-store",
          "X-Content-Type-Options": "nosniff",
          "X-Robots-Tag": "noindex, nofollow",
        },
      });
    }

    const countRow = await env.DB.prepare("SELECT COUNT(*) AS count FROM subscribers").first();
    const rawCount = countRow?.count || 0;
    const { results } = await env.DB.prepare(
      "SELECT id, email, callsign, platform, role, discord_tag, marketing_opt_in, created_at FROM subscribers ORDER BY id DESC LIMIT 200"
    ).all();

    return json({
      ok: true,
      rawCount,
      totalSubscribers: rawCount,
      regionsMapped: 6,
      subscribers: results || [],
    });
  } catch {
    return json({ ok: false, error: "Unable to load subscribers." }, 500);
  }
}

export async function onRequest() {
  return json({ ok: false, error: "Method not allowed." }, 405, { Allow: "GET" });
}
