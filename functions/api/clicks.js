const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const KNOWN_PARTNERS = ["amazon", "g2a", "eneba", "exitlag", "gfuel", "gumroad", "getapexlocal", "other"];

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

async function ensureClicksTable(db) {
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS affiliate_clicks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        partner TEXT NOT NULL,
        placement TEXT DEFAULT 'general',
        page_path TEXT DEFAULT '/',
        target_url TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`
    )
    .run();
}

function normalizePartner(rawPartner, targetUrl = "") {
  const token = String(rawPartner || "").trim().toLowerCase();
  if (KNOWN_PARTNERS.includes(token)) return token;
  const u = String(targetUrl || "").toLowerCase();
  if (u.includes("amazon.com") || u.includes("amzn.to")) return "amazon";
  if (u.includes("g2a.com")) return "g2a";
  if (u.includes("eneba.com")) return "eneba";
  if (u.includes("exitlag.com")) return "exitlag";
  if (u.includes("gfuel.com") || u.includes("gfuel")) return "gfuel";
  if (u.includes("gumroad.com")) return "gumroad";
  if (u.includes("getapexlocal.com")) return "getapexlocal";
  return "other";
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function onRequestPost({ request, env }) {
  try {
    if (!env || !env.DB) {
      return jsonResponse({ ok: false, error: "D1 database unavailable." }, 500);
    }
    await ensureClicksTable(env.DB);

    const rawText = await request.text();
    let body = {};
    try {
      body = rawText ? JSON.parse(rawText) : {};
    } catch (e) {
      return jsonResponse({ ok: false, error: "Invalid JSON payload." }, 400);
    }

    const targetUrl = String(body.target_url || "").trim().slice(0, 500);
    const partner = normalizePartner(body.partner, targetUrl);
    const placement = String(body.placement || "general").trim().slice(0, 80);
    const pagePath = String(body.page_path || "/").trim().slice(0, 200);

    await env.DB.prepare(
      `INSERT INTO affiliate_clicks (partner, placement, page_path, target_url)
       VALUES (?1, ?2, ?3, ?4)`
    )
      .bind(partner, placement, pagePath, targetUrl)
      .run();

    return jsonResponse({ ok: true, partner, placement });
  } catch (err) {
    return jsonResponse({ ok: false, error: err.message }, 500);
  }
}

export async function onRequestGet({ request, env }) {
  try {
    const url = new URL(request.url);
    const key = url.searchParams.get("key") || "";
    const adminKey = env?.ADMIN_KEY || "syndicateadmin";
    if (key !== adminKey) {
      return jsonResponse({ ok: false, error: "Unauthorized" }, 401);
    }
    if (!env || !env.DB) {
      return jsonResponse({ ok: false, error: "D1 database unavailable." }, 500);
    }
    await ensureClicksTable(env.DB);

    const [allTimeRes, sevenDayRes, recentRes] = await Promise.all([
      env.DB.prepare(
        "SELECT partner, COUNT(*) AS clicks FROM affiliate_clicks GROUP BY partner ORDER BY clicks DESC"
      ).all(),
      env.DB.prepare(
        "SELECT partner, COUNT(*) AS clicks_7d FROM affiliate_clicks WHERE created_at >= datetime('now', '-7 days') GROUP BY partner"
      ).all(),
      env.DB.prepare(
        "SELECT id, partner, placement, page_path, target_url, created_at FROM affiliate_clicks ORDER BY id DESC LIMIT 20"
      ).all(),
    ]);

    const byPartner = {};
    const last7DaysByPartner = {};
    for (const p of KNOWN_PARTNERS) {
      byPartner[p] = 0;
      last7DaysByPartner[p] = 0;
    }

    let totalClicks = 0;
    for (const row of allTimeRes.results || []) {
      const k = KNOWN_PARTNERS.includes(row.partner) ? row.partner : "other";
      const c = Number(row.clicks || 0);
      byPartner[k] = (byPartner[k] || 0) + c;
      totalClicks += c;
    }

    let totalClicks7d = 0;
    for (const row of sevenDayRes.results || []) {
      const k = KNOWN_PARTNERS.includes(row.partner) ? row.partner : "other";
      const c = Number(row.clicks_7d || 0);
      last7DaysByPartner[k] = (last7DaysByPartner[k] || 0) + c;
      totalClicks7d += c;
    }

    return jsonResponse({
      ok: true,
      totalClicks,
      totalClicks7d,
      byPartner,
      last7DaysByPartner,
      recent: recentRes.results || [],
    });
  } catch (err) {
    return jsonResponse({ ok: false, error: err.message }, 500);
  }
}
