const STATIC_ROUTES = [
  { loc: "https://www.gta6heistguide.com/", changefreq: "daily", priority: "1.0" },
  // Destination Hubs
  { loc: "https://www.gta6heistguide.com/gta-6-money-guide/", changefreq: "daily", priority: "0.98" },
  { loc: "https://www.gta6heistguide.com/gta-6-tips-and-tricks/", changefreq: "daily", priority: "0.98" },
  { loc: "https://www.gta6heistguide.com/gta-6-tools/", changefreq: "daily", priority: "0.96" },
  { loc: "https://www.gta6heistguide.com/gta-6-database/", changefreq: "daily", priority: "0.96" },
  { loc: "https://www.gta6heistguide.com/gta-6-discoveries/", lastmod: "2026-11-21", changefreq: "daily", priority: "0.96" },
  { loc: "https://www.gta6heistguide.com/gta-6-glitches/", lastmod: "2026-11-21", changefreq: "daily", priority: "0.96" },
  // All 8 Heist & Robbery Walkthroughs
  { loc: "https://www.gta6heistguide.com/heists/the-cartel-heist.html", changefreq: "daily", priority: "0.98" },
  { loc: "https://www.gta6heistguide.com/heists/vcia-takedown.html", changefreq: "daily", priority: "0.98" },
  { loc: "https://www.gta6heistguide.com/heists/shops-and-stickups.html", changefreq: "daily", priority: "0.95" },
  { loc: "https://www.gta6heistguide.com/heists/pawn-shops.html", changefreq: "daily", priority: "0.95" },
  { loc: "https://www.gta6heistguide.com/heists/jewelry-stores.html", changefreq: "daily", priority: "0.95" },
  { loc: "https://www.gta6heistguide.com/heists/small-banks-payday-loans.html", changefreq: "daily", priority: "0.96" },
  { loc: "https://www.gta6heistguide.com/heists/large-bank-vaults.html", changefreq: "daily", priority: "0.98" },
  { loc: "https://www.gta6heistguide.com/heists/armored-trucks-gang-ops.html", changefreq: "daily", priority: "0.95" },
  // Interactive Tools
  { loc: "https://www.gta6heistguide.com/map.html", changefreq: "daily", priority: "0.98" },
  { loc: "https://www.gta6heistguide.com/save-planner/", changefreq: "daily", priority: "0.98" },
  { loc: "https://www.gta6heistguide.com/cheats.html", changefreq: "daily", priority: "0.98" },
  { loc: "https://www.gta6heistguide.com/heist-planner.html", changefreq: "daily", priority: "0.95" },
  { loc: "https://www.gta6heistguide.com/heist-payout-calculator.html", changefreq: "daily", priority: "0.93" },
  { loc: "https://www.gta6heistguide.com/free/", changefreq: "weekly", priority: "0.90" },
  { loc: "https://www.gta6heistguide.com/leonida-wanted-system.html", changefreq: "weekly", priority: "0.88" },
  { loc: "https://www.gta6heistguide.com/settings.html", changefreq: "daily", priority: "0.92" },
  // World Database Pages
  { loc: "https://www.gta6heistguide.com/properties.html", changefreq: "daily", priority: "0.95" },
  { loc: "https://www.gta6heistguide.com/animals.html", changefreq: "daily", priority: "0.95" },
  { loc: "https://www.gta6heistguide.com/vehicles.html", changefreq: "weekly", priority: "0.92" },
  { loc: "https://www.gta6heistguide.com/weapons.html", changefreq: "weekly", priority: "0.92" },
  { loc: "https://www.gta6heistguide.com/weapons-bonuses.html", changefreq: "weekly", priority: "0.90" },
  { loc: "https://www.gta6heistguide.com/radio.html", changefreq: "daily", priority: "0.92" },
  // Guides & Feeds
  { loc: "https://www.gta6heistguide.com/secrets.html", changefreq: "daily", priority: "0.90" },
  { loc: "https://www.gta6heistguide.com/live-intel.html", changefreq: "daily", priority: "0.90" },
  { loc: "https://www.gta6heistguide.com/drops.html", changefreq: "daily", priority: "0.88" },
  { loc: "https://www.gta6heistguide.com/giveaways.html", changefreq: "daily", priority: "0.86" },
  { loc: "https://www.gta6heistguide.com/lucia-jason-skills.html", changefreq: "weekly", priority: "0.85" },
  { loc: "https://www.gta6heistguide.com/safehouses-laundering.html", changefreq: "weekly", priority: "0.85" },
  { loc: "https://www.gta6heistguide.com/escape-routes.html", changefreq: "weekly", priority: "0.85" },
  { loc: "https://www.gta6heistguide.com/gameplay-mechanics.html", changefreq: "weekly", priority: "0.85" },
  { loc: "https://www.gta6heistguide.com/crew-database.html", changefreq: "weekly", priority: "0.85" },
  // Editorial Articles
  { loc: "https://www.gta6heistguide.com/articles/every-leonida-region-in-gta-6-mapped-escape-coordinates.html", changefreq: "weekly", priority: "0.84" },
  { loc: "https://www.gta6heistguide.com/articles/gta-6-heist-payout-math-true-net-dollar-per-hour.html", changefreq: "weekly", priority: "0.84" },
  { loc: "https://www.gta6heistguide.com/articles/how-to-beat-15-second-biometric-vault-keypad-hack-gta-6.html", changefreq: "weekly", priority: "0.84" },
  { loc: "https://www.gta6heistguide.com/articles/how-to-clip-auto-edit-916-vertical-gta-6-heist-highlights-offline.html", changefreq: "weekly", priority: "0.84" },
  { loc: "https://www.gta6heistguide.com/articles/leaked-leonida-collectors-map-lummox-pelican-valley-key-lento.html", changefreq: "weekly", priority: "0.84" },
  { loc: "https://www.gta6heistguide.com/articles/protecting-gta-6-online-heist-lobby-ip-sniffing-texture-pop-in.html", changefreq: "weekly", priority: "0.84" },
  { loc: "https://www.gta6heistguide.com/articles/solo-vs-4-player-co-op-heist-splits-gta-6-loot-weight.html", changefreq: "weekly", priority: "0.84" },
  // Legal & Info
  { loc: "https://www.gta6heistguide.com/about.html", changefreq: "monthly", priority: "0.50" },
  { loc: "https://www.gta6heistguide.com/contact.html", changefreq: "monthly", priority: "0.50" },
  { loc: "https://www.gta6heistguide.com/privacy-policy.html", changefreq: "monthly", priority: "0.40" },
  { loc: "https://www.gta6heistguide.com/terms.html", changefreq: "monthly", priority: "0.40" }
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
