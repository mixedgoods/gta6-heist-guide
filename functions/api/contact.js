const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function jsonResponse(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      "X-Robots-Tag": "noindex, nofollow",
      ...CORS_HEADERS,
      ...extraHeaders,
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

// Public /api/contact is strictly inquiry submission (POST only).
// Owner inquiry listing is served exclusively behind Cloudflare Access at /api/cd-admin/contact-inquiries.
export async function onRequestGet() {
  return jsonResponse({ ok: false, error: "Method not allowed." }, 405, {
    Allow: "POST, OPTIONS",
  });
}

export async function onRequestPost({ request, env }) {
  try {
    if (!env || !env.DB) {
      return jsonResponse({ ok: false, error: "Database unavailable." }, 500);
    }
    await ensureContactTable(env.DB);

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object" || Array.isArray(body)) {
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
  } catch {
    return jsonResponse({ ok: false, error: "Unable to submit inquiry." }, 500);
  }
}

export async function onRequest() {
  return jsonResponse({ ok: false, error: "Method not allowed." }, 405, {
    Allow: "POST, OPTIONS",
  });
}
