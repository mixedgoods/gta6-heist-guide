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
      "X-Content-Type-Options": "nosniff",
      "X-Robots-Tag": "noindex, nofollow",
      ...CORS_HEADERS,
    },
  });
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

// Public GET /api/subscribe returns aggregate non-PII subscriber counts only.
// Owner subscriber listing and CSV export are served exclusively behind Cloudflare Access at /api/cd-admin/subscribers.
export async function onRequestGet({ request, env }) {
  try {
    const url = new URL(request.url);
    if (url.searchParams.has("list") || url.searchParams.has("export")) {
      return jsonResponse({ ok: false, error: "Forbidden." }, 403);
    }

    const countRow = await env.DB.prepare("SELECT COUNT(*) AS count FROM subscribers").first();
    const rawCount = countRow?.count || 0;
    const totalSubscribers = rawCount;

    return jsonResponse({
      ok: true,
      rawCount,
      totalSubscribers,
      regionsMapped: 6,
    });
  } catch {
    return jsonResponse({ ok: false, error: "Unable to load subscriber count.", totalSubscribers: 0, regionsMapped: 6 }, 500);
  }
}

export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return jsonResponse({ ok: false, error: "Invalid JSON body." }, 400);
    }

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
  } catch {
    return jsonResponse({ ok: false, error: "Unable to process subscription." }, 500);
  }
}
