// Shared helpers for anonymous affiliate click ingestion and protected admin reporting.
// Not a route (exports no onRequest*).

export const KNOWN_PARTNERS = [
  "amazon",
  "g2a",
  "exitlag",
  "gfuel",
  "gumroad",
  "getapexlocal",
  "other",
];

export const MAX_CLICK_BODY_BYTES = 4096;

export async function ensureClicksTable(db) {
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

export function normalizePartner(rawPartner, targetUrl = "") {
  const token = String(rawPartner || "").trim().toLowerCase();
  if (KNOWN_PARTNERS.includes(token)) return token;
  const u = String(targetUrl || "").toLowerCase();
  if (u.includes("amazon.com") || u.includes("amzn.to")) return "amazon";
  if (u.includes("g2a.com")) return "g2a";
  if (u.includes("exitlag.com")) return "exitlag";
  if (u.includes("gfuel.com") || u.includes("gfuel")) return "gfuel";
  if (u.includes("gumroad.com")) return "gumroad";
  if (u.includes("getapexlocal.com")) return "getapexlocal";
  return "other";
}

export function sanitizeTargetUrl(rawUrl) {
  const s = String(rawUrl || "").trim().slice(0, 500);
  if (!s) return "";
  if (/^(javascript|vbscript|data):/i.test(s)) return "";
  return s;
}

export async function getAffiliateClickReport(db) {
  await ensureClicksTable(db);

  const [allTimeRes, sevenDayRes, recentRes] = await Promise.all([
    db
      .prepare(
        "SELECT partner, COUNT(*) AS clicks FROM affiliate_clicks GROUP BY partner ORDER BY clicks DESC"
      )
      .all(),
    db
      .prepare(
        "SELECT partner, COUNT(*) AS clicks_7d FROM affiliate_clicks WHERE created_at >= datetime('now', '-7 days') GROUP BY partner"
      )
      .all(),
    db
      .prepare(
        "SELECT id, partner, placement, page_path, target_url, created_at FROM affiliate_clicks ORDER BY id DESC LIMIT 20"
      )
      .all(),
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

  return {
    totalClicks,
    totalClicks7d,
    byPartner,
    last7DaysByPartner,
    recent: recentRes.results || [],
  };
}
