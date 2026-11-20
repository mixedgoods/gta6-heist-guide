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

async function ensureContactTable(db) {
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS contact_inquiries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        inquiry_type TEXT DEFAULT 'general',
        budget TEXT DEFAULT '',
        message TEXT NOT NULL,
        source_page TEXT DEFAULT '/contact.html',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`
    )
    .run();
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function onRequestPost({ request, env }) {
  try {
    if (!env || !env.DB) {
      return jsonResponse({ ok: false, error: "D1 database unavailable." }, 500);
    }
    await ensureContactTable(env.DB);

    const body = await request.json().catch(() => null);
    if (!body) {
      return jsonResponse({ ok: false, error: "Invalid JSON body." }, 400);
    }

    const name = String(body.name || "").trim().slice(0, 120);
    const email = String(body.email || "").trim().toLowerCase().slice(0, 160);
    const inquiryType = String(body.inquiry_type || body.inquiryType || "general").trim().slice(0, 60);
    const budget = String(body.budget || "").trim().slice(0, 80);
    const message = String(body.message || "").trim().slice(0, 3000);
    const sourcePage = String(body.source_page || body.sourcePage || "/contact.html").trim().slice(0, 120);

    if (!name || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !message) {
      return jsonResponse(
        { ok: false, error: "Name, valid email address, and message are required." },
        400
      );
    }

    await env.DB.prepare(
      `INSERT INTO contact_inquiries (name, email, inquiry_type, budget, message, source_page)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6)`
    )
      .bind(name, email, inquiryType, budget, message, sourcePage)
      .run();

    return jsonResponse({
      ok: true,
      message: "Inquiry received and logged.",
    });
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
    await ensureContactTable(env.DB);

    const { results } = await env.DB.prepare(
      "SELECT id, name, email, inquiry_type, budget, message, source_page, created_at FROM contact_inquiries ORDER BY id DESC LIMIT 100"
    ).all();

    return jsonResponse({
      ok: true,
      totalInquiries: (results || []).length,
      inquiries: results || [],
    });
  } catch (err) {
    return jsonResponse({ ok: false, error: err.message }, 500);
  }
}
