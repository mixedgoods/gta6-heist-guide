const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...CORS_HEADERS,
    },
  });
}

function escapeCsvCell(val) {
  const str = String(val ?? "");
  if (/[",\r\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function onRequestGet({ request, env }) {
  try {
    const url = new URL(request.url);
    const key = url.searchParams.get("key");
    const adminKey = env?.ADMIN_KEY || "syndicateadmin";
    const exportType = url.searchParams.get("export");
    const listMode = url.searchParams.get("list");

    const countRow = await env.DB.prepare("SELECT COUNT(*) AS count FROM subscribers").first();
    const rawCount = countRow?.count || 0;
    const totalSubscribers = rawCount;

    if (exportType === "csv" && key === adminKey) {
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
          ...CORS_HEADERS,
        },
      });
    }

    if (listMode === "1" && key === adminKey) {
      const { results } = await env.DB.prepare(
        "SELECT id, email, callsign, platform, role, discord_tag, marketing_opt_in, created_at FROM subscribers ORDER BY id DESC LIMIT 200"
      ).all();
      return jsonResponse({
        ok: true,
        rawCount,
        totalSubscribers,
        regionsMapped: 6,
        subscribers: results || [],
      });
    }

    return jsonResponse({
      ok: true,
      rawCount,
      totalSubscribers,
      regionsMapped: 6,
    });
  } catch (err) {
    return jsonResponse({ ok: false, error: err.message, totalSubscribers: 0, regionsMapped: 6 }, 500);
  }
}

export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json();
    const email = String(body.email || "").trim().toLowerCase();
    const callsign = String(body.callsign || "").trim() || "ViceOperative";
    const platform = String(body.platform || "PS5 Pro & PC").trim().slice(0, 60);
    const role = String(body.role || "Mastermind").trim().slice(0, 40);
    const discord_tag = String(body.discord_tag || "").trim().slice(0, 80);
    const marketing_opt_in = body.marketing_opt_in === false || body.marketing_opt_in === 0 ? 0 : 1;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return jsonResponse({ ok: false, error: "Please enter a valid email address." }, 400);
    }

    await env.DB.prepare(
      `INSERT INTO subscribers (email, callsign, platform, role, discord_tag, marketing_opt_in)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6)
       ON CONFLICT(email) DO UPDATE SET
         callsign = excluded.callsign,
         platform = excluded.platform,
         role = excluded.role,
         discord_tag = excluded.discord_tag,
         marketing_opt_in = excluded.marketing_opt_in`
    )
      .bind(email, callsign.slice(0, 40), platform, role, discord_tag, marketing_opt_in)
      .run();

    const countRow = await env.DB.prepare("SELECT COUNT(*) AS count FROM subscribers").first();
    const totalSubscribers = countRow?.count || 0;

    return jsonResponse({
      ok: true,
      perkCode: "FOUNDER-VIP-2026",
      badgeUnlocked: "FOUNDER // VERIFIED MASTERMIND",
      repBonus: 2500,
      totalSubscribers,
      regionsMapped: 6,
    });
  } catch (err) {
    return jsonResponse({ ok: false, error: err.message }, 500);
  }
}
