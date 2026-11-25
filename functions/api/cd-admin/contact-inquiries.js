import { json } from "../../_lib/cd.js";

// Owner-only contact inquiries view.
// Protected by functions/api/cd-admin/_middleware.js (Cloudflare Access RS256 JWT + CD_ADMIN_EMAILS allowlist, fail-closed).
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

export async function onRequestGet({ env }) {
  try {
    if (!env || !env.DB) {
      return json({ ok: false, error: "Database unavailable." }, 500);
    }
    await ensureContactTable(env.DB);

    const { results } = await env.DB.prepare(
      "SELECT id, name, email, inquiry_type, budget, message, source_page, created_at FROM contact_inquiries ORDER BY id DESC LIMIT 100"
    ).all();

    return json({
      ok: true,
      totalInquiries: (results || []).length,
      inquiries: results || [],
    });
  } catch {
    return json({ ok: false, error: "Unable to load inquiries." }, 500);
  }
}

export async function onRequest() {
  return json({ ok: false, error: "Method not allowed." }, 405, { Allow: "GET" });
}
