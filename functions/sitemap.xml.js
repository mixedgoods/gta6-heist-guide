const STATIC_ROUTES = [
  {
    "loc": "https://www.gta6heistguide.com/",
    "changefreq": "daily",
    "priority": "1.0"
  },
  {
    "loc": "https://www.gta6heistguide.com/save-planner",
    "changefreq": "daily",
    "priority": "0.98"
  },
  {
    "loc": "https://www.gta6heistguide.com/cash-guide",
    "changefreq": "daily",
    "priority": "0.98"
  },
  {
    "loc": "https://www.gta6heistguide.com/cheats",
    "changefreq": "daily",
    "priority": "0.98"
  },
  {
    "loc": "https://www.gta6heistguide.com/settings",
    "changefreq": "daily",
    "priority": "0.95"
  },
  {
    "loc": "https://www.gta6heistguide.com/interactive-map",
    "changefreq": "daily",
    "priority": "0.95"
  },
  {
    "loc": "https://www.gta6heistguide.com/heist-planner",
    "changefreq": "daily",
    "priority": "0.95"
  },
  {
    "loc": "https://www.gta6heistguide.com/heist-payout-calculator",
    "changefreq": "daily",
    "priority": "0.93"
  },
  {
    "loc": "https://www.gta6heistguide.com/radio",
    "changefreq": "hourly",
    "priority": "0.92"
  },
  {
    "loc": "https://www.gta6heistguide.com/secrets",
    "changefreq": "hourly",
    "priority": "0.92"
  },
  {
    "loc": "https://www.gta6heistguide.com/live",
    "changefreq": "hourly",
    "priority": "0.90"
  },
  {
    "loc": "https://www.gta6heistguide.com/live-intel",
    "changefreq": "hourly",
    "priority": "0.90"
  },
  {
    "loc": "https://www.gta6heistguide.com/giveaways",
    "changefreq": "daily",
    "priority": "0.90"
  },
  {
    "loc": "https://www.gta6heistguide.com/free",
    "changefreq": "daily",
    "priority": "0.90"
  },
  {
    "loc": "https://www.gta6heistguide.com/vault-hack-trainer",
    "changefreq": "weekly",
    "priority": "0.88"
  },
  {
    "loc": "https://www.gta6heistguide.com/weapons-bonuses",
    "changefreq": "weekly",
    "priority": "0.88"
  },
  {
    "loc": "https://www.gta6heistguide.com/weapons-gear",
    "changefreq": "weekly",
    "priority": "0.88"
  },
  {
    "loc": "https://www.gta6heistguide.com/vehicles-getaway-cars",
    "changefreq": "weekly",
    "priority": "0.88"
  },
  {
    "loc": "https://www.gta6heistguide.com/crew-database",
    "changefreq": "weekly",
    "priority": "0.85"
  },
  {
    "loc": "https://www.gta6heistguide.com/lucia-jason-skills",
    "changefreq": "weekly",
    "priority": "0.85"
  },
  {
    "loc": "https://www.gta6heistguide.com/safehouses-laundering",
    "changefreq": "weekly",
    "priority": "0.85"
  },
  {
    "loc": "https://www.gta6heistguide.com/escape-routes",
    "changefreq": "weekly",
    "priority": "0.85"
  },
  {
    "loc": "https://www.gta6heistguide.com/gameplay-mechanics",
    "changefreq": "weekly",
    "priority": "0.85"
  },
  {
    "loc": "https://www.gta6heistguide.com/leonida-wanted-system",
    "changefreq": "weekly",
    "priority": "0.85"
  },
  {
    "loc": "https://www.gta6heistguide.com/affiliates-gear",
    "changefreq": "weekly",
    "priority": "0.80"
  },
  {
    "loc": "https://www.gta6heistguide.com/about",
    "changefreq": "monthly",
    "priority": "0.70"
  },
  {
    "loc": "https://www.gta6heistguide.com/contact",
    "changefreq": "monthly",
    "priority": "0.70"
  },
  {
    "loc": "https://www.gta6heistguide.com/privacy-policy",
    "changefreq": "monthly",
    "priority": "0.50"
  },
  {
    "loc": "https://www.gta6heistguide.com/terms",
    "changefreq": "monthly",
    "priority": "0.50"
  },
  {
    "loc": "https://www.gta6heistguide.com/articles/every-leonida-region-in-gta-6-mapped-escape-coordinates.html",
    "changefreq": "weekly",
    "priority": "0.84"
  },
  {
    "loc": "https://www.gta6heistguide.com/articles/gta-6-heist-payout-math-true-net-dollar-per-hour.html",
    "changefreq": "weekly",
    "priority": "0.84"
  },
  {
    "loc": "https://www.gta6heistguide.com/articles/how-to-beat-15-second-biometric-vault-keypad-hack-gta-6.html",
    "changefreq": "weekly",
    "priority": "0.84"
  },
  {
    "loc": "https://www.gta6heistguide.com/articles/how-to-clip-auto-edit-916-vertical-gta-6-heist-highlights-offline.html",
    "changefreq": "weekly",
    "priority": "0.84"
  },
  {
    "loc": "https://www.gta6heistguide.com/articles/leaked-leonida-collectors-map-lummox-pelican-valley-key-lento.html",
    "changefreq": "weekly",
    "priority": "0.84"
  },
  {
    "loc": "https://www.gta6heistguide.com/articles/protecting-gta-6-online-heist-lobby-ip-sniffing-texture-pop-in.html",
    "changefreq": "weekly",
    "priority": "0.84"
  },
  {
    "loc": "https://www.gta6heistguide.com/articles/solo-vs-4-player-co-op-heist-splits-gta-6-loot-weight.html",
    "changefreq": "weekly",
    "priority": "0.84"
  }
];

function escapeXml(unsafe) {
  if (!unsafe) return "";
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function onRequestGet({ env }) {
  const todayStr = "2026-11-20";
  let dynamicEntries = [];

  if (env && env.DB) {
    try {
      const { results } = await env.DB.prepare(
        "SELECT id, created_date FROM dynamic_guides ORDER BY created_date DESC, rowid DESC LIMIT 40"
      ).all();
      dynamicEntries = (results || []).map((row) => ({
        loc: `https://www.gta6heistguide.com/live-intel?guide=${encodeURIComponent(row.id)}`,
        lastmod: (row.created_date || todayStr).slice(0, 10),
        changefreq: "daily",
        priority: "0.78",
      }));
    } catch (e) {}
  }

  const staticXml = STATIC_ROUTES.map(
    (u) => `  <url>
    <loc>${escapeXml(u.loc)}</loc>
    <lastmod>${todayStr}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  ).join("\n");

  const dynamicXml = dynamicEntries
    .map(
      (u) => `  <url>
    <loc>${escapeXml(u.loc)}</loc>
    <lastmod>${escapeXml(u.lastmod)}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticXml}
${dynamicXml}
</urlset>`;

  return new Response(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=600, s-maxage=1800",
    },
  });
}
