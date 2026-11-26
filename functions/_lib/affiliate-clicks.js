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

function extractProductId(partner, placement, targetUrl) {
  const pl = String(placement || "");
  if (pl.includes(":")) {
    const part = pl.split(":").slice(1).join(":").trim();
    if (part && part !== "inline") return part.slice(0, 64);
  }
  const asinMatch = String(targetUrl || "").match(/\/dp\/([A-Z0-9]{10})/i);
  if (asinMatch) return asinMatch[1].toUpperCase();
  if (/cutflow-pro/i.test(String(targetUrl || ""))) return "cutflowPro";
  if (/apex-pro-bundle/i.test(String(targetUrl || ""))) return "apexProBundle";
  if (/exitlag\.com/i.test(String(targetUrl || ""))) return "exitlag";
  if (/g2a\.com/i.test(String(targetUrl || ""))) return "g2a";
  return String(partner || "other");
}

export async function getAffiliateClickReport(db) {
  await ensureClicksTable(db);

  const [
    allTimeRes,
    sevenDayRes,
    thirtyDayRes,
    byPageRes,
    byPlacementRes,
    byProductRawRes,
    dailyRes,
    weeklyRes,
    recentRes,
  ] = await Promise.all([
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
        "SELECT partner, COUNT(*) AS clicks_30d FROM affiliate_clicks WHERE created_at >= datetime('now', '-30 days') GROUP BY partner"
      )
      .all(),
    db
      .prepare(
        "SELECT page_path, COUNT(*) AS clicks FROM affiliate_clicks GROUP BY page_path ORDER BY clicks DESC LIMIT 20"
      )
      .all(),
    db
      .prepare(
        "SELECT placement, COUNT(*) AS clicks FROM affiliate_clicks GROUP BY placement ORDER BY clicks DESC LIMIT 20"
      )
      .all(),
    db
      .prepare(
        "SELECT partner, placement, target_url, COUNT(*) AS clicks FROM affiliate_clicks GROUP BY partner, placement, target_url ORDER BY clicks DESC LIMIT 100"
      )
      .all(),
    db
      .prepare(
        "SELECT substr(created_at, 1, 10) AS day, COUNT(*) AS clicks FROM affiliate_clicks WHERE created_at >= datetime('now', '-30 days') GROUP BY day ORDER BY day ASC"
      )
      .all(),
    db
      .prepare(
        "SELECT strftime('%Y-W%W', created_at) AS week, COUNT(*) AS clicks FROM affiliate_clicks WHERE created_at >= datetime('now', '-84 days') GROUP BY week ORDER BY week ASC"
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
  const last30DaysByPartner = {};
  for (const p of KNOWN_PARTNERS) {
    byPartner[p] = 0;
    last7DaysByPartner[p] = 0;
    last30DaysByPartner[p] = 0;
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

  let totalClicks30d = 0;
  for (const row of thirtyDayRes.results || []) {
    const k = KNOWN_PARTNERS.includes(row.partner) ? row.partner : "other";
    const c = Number(row.clicks_30d || 0);
    last30DaysByPartner[k] = (last30DaysByPartner[k] || 0) + c;
    totalClicks30d += c;
  }

  const byPage = (byPageRes.results || []).map((r) => ({
    page_path: String(r.page_path || "/"),
    clicks: Number(r.clicks || 0),
  }));

  let qaProbeClicks = 0;
  const byPlacement = (byPlacementRes.results || []).map((r) => {
    const pl = String(r.placement || "general");
    const clicks = Number(r.clicks || 0);
    if (/smoke|probe/i.test(pl)) qaProbeClicks += clicks;
    return { placement: pl, clicks };
  });

  const productMap = new Map();
  for (const r of byProductRawRes.results || []) {
    const partner = KNOWN_PARTNERS.includes(r.partner) ? r.partner : "other";
    const productId = extractProductId(partner, r.placement, r.target_url);
    const key = `${partner}|${productId}`;
    const prev = productMap.get(key) || { product_id: productId, partner, clicks: 0 };
    prev.clicks += Number(r.clicks || 0);
    productMap.set(key, prev);
  }
  const byProduct = [...productMap.values()]
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 20);

  const dailyTrend = (dailyRes.results || []).map((r) => ({
    date: String(r.day || ""),
    clicks: Number(r.clicks || 0),
  }));

  const weeklyTrend = (weeklyRes.results || []).map((r) => ({
    week: String(r.week || ""),
    clicks: Number(r.clicks || 0),
  }));

  return {
    totalClicks,
    totalClicks7d,
    totalClicks30d,
    byPartner,
    last7DaysByPartner,
    last30DaysByPartner,
    byPage,
    byProduct,
    byPlacement,
    dailyTrend,
    weeklyTrend,
    revenueSummary: {
      actualClicks: totalClicks,
      organicClicksExcludingProbes: Math.max(0, totalClicks - qaProbeClicks),
      qaProbeClicks,
      clicksLast7d: totalClicks7d,
      clicksLast30d: totalClicks30d,
      confirmedPurchases: null,
      confirmedCommissionsUsd: null,
      estimatedRevenueUsd: null,
      dataSource: "Cloudflare D1 (affiliate_clicks)",
      disclaimer:
        "Actual clicks are outbound referral clicks recorded in D1. Clicks are not purchases or revenue. Confirmed purchases and commissions are only reported when verified from official merchant reporting.",
    },
    recent: recentRes.results || [],
  };
}
