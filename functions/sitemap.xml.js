const STATIC_ROUTES = [
  { loc: "https://www.gta6heistguide.com/", changefreq: "daily", priority: "1.0" },
  // Destination Hubs
  { loc: "https://www.gta6heistguide.com/gta-6-money-guide/", changefreq: "daily", priority: "0.98" },
  { loc: "https://www.gta6heistguide.com/gta-6-tips-and-tricks/", lastmod: "2026-11-22", changefreq: "daily", priority: "0.98" },
  { loc: "https://www.gta6heistguide.com/gta-6-endings-guide/", lastmod: "2026-11-22", changefreq: "daily", priority: "0.98" },
  { loc: "https://www.gta6heistguide.com/gta-6-relationship-guide/", lastmod: "2026-11-22", changefreq: "daily", priority: "0.98" },
  { loc: "https://www.gta6heistguide.com/gta-6-100-completion-tracker/", lastmod: "2026-11-22", changefreq: "daily", priority: "0.99" },
  { loc: "https://www.gta6heistguide.com/gta-6-tools/", lastmod: "2026-11-22", changefreq: "daily", priority: "0.96" },
  { loc: "https://www.gta6heistguide.com/gta-6-database/", lastmod: "2026-11-22", changefreq: "daily", priority: "0.96" },
  { loc: "https://www.gta6heistguide.com/gta-6-discoveries/", lastmod: "2026-11-21", changefreq: "daily", priority: "0.96" },
  { loc: "https://www.gta6heistguide.com/gta-6-glitches/", lastmod: "2026-11-21", changefreq: "daily", priority: "0.96" },
  { loc: "https://www.gta6heistguide.com/gta-6-settings/", lastmod: "2026-11-21", changefreq: "daily", priority: "0.96" },
  // All 8 Heist & Robbery Walkthroughs
  { loc: "https://www.gta6heistguide.com/heists/the-cartel-heist", changefreq: "daily", priority: "0.98" },
  { loc: "https://www.gta6heistguide.com/heists/vcia-takedown", changefreq: "daily", priority: "0.98" },
  { loc: "https://www.gta6heistguide.com/heists/shops-and-stickups", changefreq: "daily", priority: "0.95" },
  { loc: "https://www.gta6heistguide.com/heists/pawn-shops", changefreq: "daily", priority: "0.95" },
  { loc: "https://www.gta6heistguide.com/heists/jewelry-stores", changefreq: "daily", priority: "0.95" },
  { loc: "https://www.gta6heistguide.com/heists/small-banks-payday-loans", changefreq: "daily", priority: "0.96" },
  { loc: "https://www.gta6heistguide.com/heists/large-bank-vaults", changefreq: "daily", priority: "0.98" },
  { loc: "https://www.gta6heistguide.com/heists/armored-trucks-gang-ops", changefreq: "daily", priority: "0.95" },
  // Interactive Tools
  { loc: "https://www.gta6heistguide.com/map", changefreq: "daily", priority: "0.98" },
  { loc: "https://www.gta6heistguide.com/save-planner/", changefreq: "daily", priority: "0.98" },
  { loc: "https://www.gta6heistguide.com/cheats", changefreq: "daily", priority: "0.98" },
  { loc: "https://www.gta6heistguide.com/heist-planner", changefreq: "daily", priority: "0.95" },
  { loc: "https://www.gta6heistguide.com/heist-payout-calculator", changefreq: "daily", priority: "0.93" },
  { loc: "https://www.gta6heistguide.com/free/", changefreq: "weekly", priority: "0.90" },
  { loc: "https://www.gta6heistguide.com/leonida-wanted-system", changefreq: "weekly", priority: "0.88" },
  // World Database Pages
  { loc: "https://www.gta6heistguide.com/properties", changefreq: "daily", priority: "0.95" },
  { loc: "https://www.gta6heistguide.com/animals", lastmod: "2026-11-22", changefreq: "daily", priority: "0.95" },
  { loc: "https://www.gta6heistguide.com/vehicles", lastmod: "2026-11-22", changefreq: "weekly", priority: "0.92" },
  { loc: "https://www.gta6heistguide.com/weapons", changefreq: "weekly", priority: "0.92" },
  { loc: "https://www.gta6heistguide.com/weapons-bonuses", changefreq: "weekly", priority: "0.90" },
  { loc: "https://www.gta6heistguide.com/radio", changefreq: "daily", priority: "0.92" },
  // Guides & Feeds
  { loc: "https://www.gta6heistguide.com/port-gellhorn", lastmod: "2026-11-23", changefreq: "daily", priority: "0.95" },
  { loc: "https://www.gta6heistguide.com/guides/vice-city-portal-easter-egg", lastmod: "2026-11-23", changefreq: "daily", priority: "0.90" },
  { loc: "https://www.gta6heistguide.com/guides/gta-6-safe-codes", lastmod: "2026-11-23", changefreq: "daily", priority: "0.90" },
  { loc: "https://www.gta6heistguide.com/secrets", changefreq: "daily", priority: "0.90" },
  { loc: "https://www.gta6heistguide.com/live-intel", changefreq: "daily", priority: "0.90" },
  { loc: "https://www.gta6heistguide.com/live", lastmod: "2026-11-23", changefreq: "daily", priority: "0.88" },
  { loc: "https://www.gta6heistguide.com/drops", changefreq: "daily", priority: "0.88" },
  { loc: "https://www.gta6heistguide.com/giveaways", changefreq: "daily", priority: "0.86" },
  { loc: "https://www.gta6heistguide.com/lucia-jason-skills", changefreq: "weekly", priority: "0.85" },
  { loc: "https://www.gta6heistguide.com/safehouses-laundering", changefreq: "weekly", priority: "0.85" },
  { loc: "https://www.gta6heistguide.com/escape-routes", changefreq: "weekly", priority: "0.85" },
  { loc: "https://www.gta6heistguide.com/gameplay-mechanics", changefreq: "weekly", priority: "0.85" },
  { loc: "https://www.gta6heistguide.com/crew-database", changefreq: "weekly", priority: "0.85" },
  // Editorial Articles
  { loc: "https://www.gta6heistguide.com/articles/every-leonida-region-in-gta-6-mapped-escape-coordinates", changefreq: "weekly", priority: "0.84" },
  { loc: "https://www.gta6heistguide.com/articles/gta-6-heist-payout-math-true-net-dollar-per-hour", changefreq: "weekly", priority: "0.84" },
  // Legal & Info
  { loc: "https://www.gta6heistguide.com/about", lastmod: "2026-11-22", changefreq: "monthly", priority: "0.50" },
  { loc: "https://www.gta6heistguide.com/contact", changefreq: "monthly", priority: "0.50" },
  { loc: "https://www.gta6heistguide.com/privacy-policy", changefreq: "monthly", priority: "0.40" },
  { loc: "https://www.gta6heistguide.com/terms", changefreq: "monthly", priority: "0.40" },
  // Destination Hubs (synced with public/sitemap.xml)
  { loc: "https://www.gta6heistguide.com/missions/", lastmod: "2026-11-24", changefreq: "weekly", priority: "0.8" },
  { loc: "https://www.gta6heistguide.com/gta-6-controls/", lastmod: "2026-11-23", changefreq: "weekly", priority: "0.8" },
  { loc: "https://www.gta6heistguide.com/gta-6-troubleshooting/", lastmod: "2026-11-23", changefreq: "weekly", priority: "0.8" },
  { loc: "https://www.gta6heistguide.com/gta-6-collectibles/", lastmod: "2026-11-24", changefreq: "weekly", priority: "0.8" },
  { loc: "https://www.gta6heistguide.com/gta-6-vehicles-guide/", lastmod: "2026-11-23", changefreq: "weekly", priority: "0.8" },
  { loc: "https://www.gta6heistguide.com/gta-6-property-ownership/", lastmod: "2026-11-23", changefreq: "weekly", priority: "0.8" },
  // Phase 6 Content Expansion (32 New Canonical Guides)
  { loc: "https://www.gta6heistguide.com/missions/buck-me", lastmod: "2026-11-24", changefreq: "weekly", priority: "0.90" },
  { loc: "https://www.gta6heistguide.com/missions/lab-fees", lastmod: "2026-11-24", changefreq: "weekly", priority: "0.92" },
  { loc: "https://www.gta6heistguide.com/missions/coming-home", lastmod: "2026-11-24", changefreq: "weekly", priority: "0.90" },
  { loc: "https://www.gta6heistguide.com/missions/swamped", lastmod: "2026-11-24", changefreq: "weekly", priority: "0.90" },
  { loc: "https://www.gta6heistguide.com/missions/day-release", lastmod: "2026-11-24", changefreq: "weekly", priority: "0.92" },
  { loc: "https://www.gta6heistguide.com/missions/tourist-trap", lastmod: "2026-11-24", changefreq: "weekly", priority: "0.90" },
  { loc: "https://www.gta6heistguide.com/missions/girls-trip", lastmod: "2026-11-24", changefreq: "weekly", priority: "0.88" },
  { loc: "https://www.gta6heistguide.com/missions/moses", lastmod: "2026-11-24", changefreq: "weekly", priority: "0.92" },
  { loc: "https://www.gta6heistguide.com/missions/slam-dunk", lastmod: "2026-11-24", changefreq: "weekly", priority: "0.92" },
  { loc: "https://www.gta6heistguide.com/missions/coffee-break", lastmod: "2026-11-24", changefreq: "weekly", priority: "0.92" },
  { loc: "https://www.gta6heistguide.com/missions/checking-out", lastmod: "2026-11-24", changefreq: "weekly", priority: "0.92" },
  { loc: "https://www.gta6heistguide.com/missions/credit-check", lastmod: "2026-11-24", changefreq: "weekly", priority: "0.94" },
  { loc: "https://www.gta6heistguide.com/locations/vice-city", lastmod: "2026-11-24", changefreq: "daily", priority: "0.95" },
  { loc: "https://www.gta6heistguide.com/locations/leonida-keys", lastmod: "2026-11-24", changefreq: "weekly", priority: "0.94" },
  { loc: "https://www.gta6heistguide.com/locations/grassrivers", lastmod: "2026-11-24", changefreq: "weekly", priority: "0.93" },
  { loc: "https://www.gta6heistguide.com/locations/mount-kalaga", lastmod: "2026-11-24", changefreq: "weekly", priority: "0.93" },
  { loc: "https://www.gta6heistguide.com/locations/ambrosia", lastmod: "2026-11-24", changefreq: "weekly", priority: "0.90" },
  { loc: "https://www.gta6heistguide.com/locations/lake-leonida", lastmod: "2026-11-24", changefreq: "weekly", priority: "0.88" },
  { loc: "https://www.gta6heistguide.com/guides/bret-vogel-hunting-target-decks", lastmod: "2026-11-24", changefreq: "weekly", priority: "0.93" },
  { loc: "https://www.gta6heistguide.com/guides/legendary-hunter-animals-guide", lastmod: "2026-11-24", changefreq: "weekly", priority: "0.92" },
  { loc: "https://www.gta6heistguide.com/guides/secret-radio-stations-poster-scans", lastmod: "2026-11-24", changefreq: "weekly", priority: "0.90" },
  { loc: "https://www.gta6heistguide.com/guides/playable-arcade-retro-minigames", lastmod: "2026-11-24", changefreq: "weekly", priority: "0.89" },
  { loc: "https://www.gta6heistguide.com/guides/cocaine-flamingos-cards-collectibles", lastmod: "2026-11-24", changefreq: "weekly", priority: "0.93" },
  { loc: "https://www.gta6heistguide.com/guides/jason-duval-character-guide", lastmod: "2026-11-24", changefreq: "weekly", priority: "0.91" },
  { loc: "https://www.gta6heistguide.com/guides/lucia-caminos-character-guide", lastmod: "2026-11-24", changefreq: "weekly", priority: "0.91" },
  { loc: "https://www.gta6heistguide.com/guides/raul-bautista-crew-guide", lastmod: "2026-11-24", changefreq: "weekly", priority: "0.91" },
  { loc: "https://www.gta6heistguide.com/guides/all-7-fences-and-vehicle-buyers", lastmod: "2026-11-24", changefreq: "weekly", priority: "0.93" },
  { loc: "https://www.gta6heistguide.com/guides/wank-app-slim-jim-vehicle-theft", lastmod: "2026-11-24", changefreq: "weekly", priority: "0.92" },
  { loc: "https://www.gta6heistguide.com/guides/best-weapons-and-unique-variants", lastmod: "2026-11-24", changefreq: "weekly", priority: "0.92" },
  { loc: "https://www.gta6heistguide.com/guides/best-getaway-vehicles-and-trunk-storage", lastmod: "2026-11-24", changefreq: "weekly", priority: "0.92" },
  { loc: "https://www.gta6heistguide.com/guides/how-to-escape-police-wanted-levels", lastmod: "2026-11-24", changefreq: "weekly", priority: "0.92" },
  { loc: "https://www.gta6heistguide.com/guides/apollo-aggregates-red-barn-money-loop", lastmod: "2026-11-24", changefreq: "daily", priority: "0.91" },
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

export async function onRequestGet(context) {
  // Prefer the static public/sitemap.xml so accurate per-URL <lastmod> dates
  // are never overwritten with fake "today" timestamps on every crawler fetch.
  try {
    if (context && context.env && context.env.ASSETS) {
      const assetUrl = new URL("/sitemap.xml", context.request.url);
      const staticRes = await context.env.ASSETS.fetch(new Request(assetUrl));
      if (staticRes && staticRes.ok) {
        const xmlBody = await staticRes.text();
        return new Response(xmlBody, {
          status: 200,
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=600, s-maxage=1800",
          },
        });
      }
    }
  } catch (_) {}

  const fallbackDate = "2026-11-21";
  const staticXml = STATIC_ROUTES.map(
    (u) => `  <url>
    <loc>${escapeXml(u.loc)}</loc>
    <lastmod>${u.lastmod || fallbackDate}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  ).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticXml}
</urlset>`;

  return new Response(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=600, s-maxage=1800",
    },
  });
}
