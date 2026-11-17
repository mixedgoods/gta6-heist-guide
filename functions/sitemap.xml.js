const STATIC_ROUTES = [
  { loc: "https://www.gta6heistguide.com/", changefreq: "daily", priority: "1.0" },
  { loc: "https://www.gta6heistguide.com/free/", changefreq: "daily", priority: "0.98" },
  { loc: "https://www.gta6heistguide.com/heist-payout-calculator", changefreq: "daily", priority: "0.95" },
  { loc: "https://www.gta6heistguide.com/leonida-interactive-map", changefreq: "daily", priority: "0.95" },
  { loc: "https://www.gta6heistguide.com/vault-hack-trainer", changefreq: "weekly", priority: "0.92" },
  { loc: "https://www.gta6heistguide.com/compare/", changefreq: "daily", priority: "0.90" },
  { loc: "https://www.gta6heistguide.com/guides/", changefreq: "daily", priority: "0.90" },
  { loc: "https://www.gta6heistguide.com/lucia-jason-skills", changefreq: "weekly", priority: "0.90" },
  { loc: "https://www.gta6heistguide.com/vehicles-getaway-cars", changefreq: "weekly", priority: "0.90" },
  { loc: "https://www.gta6heistguide.com/safehouses-laundering", changefreq: "weekly", priority: "0.90" },
  { loc: "https://www.gta6heistguide.com/leonida-wanted-system", changefreq: "weekly", priority: "0.90" },
  { loc: "https://www.gta6heistguide.com/leonida-reserve", changefreq: "weekly", priority: "0.90" },
  { loc: "https://www.gta6heistguide.com/sinfrontera-bank", changefreq: "weekly", priority: "0.88" },
  { loc: "https://www.gta6heistguide.com/vice-city-yacht-heist", changefreq: "weekly", priority: "0.88" },
  { loc: "https://www.gta6heistguide.com/port-gellhorn", changefreq: "weekly", priority: "0.88" },
  { loc: "https://www.gta6heistguide.com/ocean-drive-armored-convoy", changefreq: "weekly", priority: "0.88" },
  { loc: "https://www.gta6heistguide.com/everglades-smuggler-run", changefreq: "weekly", priority: "0.88" },
  { loc: "https://www.gta6heistguide.com/heist-planner", changefreq: "weekly", priority: "0.85" },
  { loc: "https://www.gta6heistguide.com/interactive-map", changefreq: "weekly", priority: "0.85" },
  { loc: "https://www.gta6heistguide.com/crew-database", changefreq: "weekly", priority: "0.85" },
  { loc: "https://www.gta6heistguide.com/gameplay-mechanics", changefreq: "weekly", priority: "0.85" },
  { loc: "https://www.gta6heistguide.com/live-intel", changefreq: "hourly", priority: "0.92" },
  { loc: "https://www.gta6heistguide.com/forum", changefreq: "hourly", priority: "0.88" },
  { loc: "https://www.gta6heistguide.com/affiliates-gear", changefreq: "weekly", priority: "0.80" },
  { loc: "https://www.gta6heistguide.com/faq", changefreq: "weekly", priority: "0.80" },
  { loc: "https://www.gta6heistguide.com/about", changefreq: "monthly", priority: "0.70" },
  { loc: "https://www.gta6heistguide.com/legal", changefreq: "monthly", priority: "0.50" },
  { loc: "https://www.gta6heistguide.com/compare/best-gtabase-interactive-map-alternative.html", changefreq: "weekly", priority: "0.84" },
  { loc: "https://www.gta6heistguide.com/compare/best-gtaboom-heist-calculator-alternative.html", changefreq: "weekly", priority: "0.84" },
  { loc: "https://www.gta6heistguide.com/compare/best-mapgenie-leonida-map-alternative.html", changefreq: "weekly", priority: "0.84" },
  { loc: "https://www.gta6heistguide.com/compare/best-gtaheistinfo-hack-trainer-alternative.html", changefreq: "weekly", priority: "0.84" },
  { loc: "https://www.gta6heistguide.com/compare/best-leonidaverse-map-radar-alternative.html", changefreq: "weekly", priority: "0.84" },
  { loc: "https://www.gta6heistguide.com/compare/best-gtatools-net-payout-optimizer-alternative.html", changefreq: "weekly", priority: "0.84" },
  { loc: "https://www.gta6heistguide.com/compare/best-gta6-lfg-discord-bot-alternative.html", changefreq: "weekly", priority: "0.84" },
  { loc: "https://www.gta6heistguide.com/compare/best-gtabase-crew-roster-alternative.html", changefreq: "weekly", priority: "0.84" },
  { loc: "https://www.gta6heistguide.com/compare/best-mapgenie-collectibles-checklist-alternative.html", changefreq: "weekly", priority: "0.84" },
  { loc: "https://www.gta6heistguide.com/compare/best-gtaboom-weekly-bonus-tracker-alternative.html", changefreq: "weekly", priority: "0.84" },
  { loc: "https://www.gta6heistguide.com/compare/best-gta6-second-screen-companion-app-alternative.html", changefreq: "weekly", priority: "0.84" },
  { loc: "https://www.gta6heistguide.com/compare/best-gta6-wanted-level-evasion-simulator-alternative.html", changefreq: "weekly", priority: "0.84" },
  { loc: "https://www.gta6heistguide.com/compare/best-gta6-vehicle-trunk-loadout-planner-alternative.html", changefreq: "weekly", priority: "0.84" },
  { loc: "https://www.gta6heistguide.com/compare/best-gta6-lucia-jason-skill-tree-calculator-alternative.html", changefreq: "weekly", priority: "0.84" },
  { loc: "https://www.gta6heistguide.com/compare/best-gta6-cash-laundering-fence-calculator-alternative.html", changefreq: "weekly", priority: "0.84" },
  { loc: "https://www.gta6heistguide.com/compare/best-gta6-heist-clip-editor-vertical-shorts-alternative.html", changefreq: "weekly", priority: "0.84" },
  { loc: "https://www.gta6heistguide.com/compare/best-gta6-interactive-sewer-escape-map-alternative.html", changefreq: "weekly", priority: "0.84" },
  { loc: "https://www.gta6heistguide.com/compare/best-gta6-solo-duo-heist-payout-calculator-alternative.html", changefreq: "weekly", priority: "0.84" },
  { loc: "https://www.gta6heistguide.com/compare/best-gta6-live-patch-notes-meta-tracker-alternative.html", changefreq: "weekly", priority: "0.84" },
  { loc: "https://www.gta6heistguide.com/compare/best-gta6-complete-all-in-one-heist-command-center.html", changefreq: "weekly", priority: "0.84" },
  { loc: "https://www.gta6heistguide.com/compare/sinfrontera-bank-vs-leonida-gold-reserve.html", changefreq: "weekly", priority: "0.84" },
  { loc: "https://www.gta6heistguide.com/compare/starlet-superyacht-vs-port-gellhorn-terminal.html", changefreq: "weekly", priority: "0.84" },
  { loc: "https://www.gta6heistguide.com/compare/grassrivers-airstrip-vs-ocean-drive-convoy.html", changefreq: "weekly", priority: "0.84" },
  { loc: "https://www.gta6heistguide.com/compare/gold-bars-vs-bearer-bonds-vs-crypto-drives-loot.html", changefreq: "weekly", priority: "0.84" },
  { loc: "https://www.gta6heistguide.com/compare/lucia-caminos-vs-jason-duval-heist-roles.html", changefreq: "weekly", priority: "0.84" },
  { loc: "https://www.gta6heistguide.com/compare/2-player-duo-vs-4-player-squad-heist-splits.html", changefreq: "weekly", priority: "0.84" },
  { loc: "https://www.gta6heistguide.com/compare/silent-sewer-stealth-vs-loud-thermite-assault.html", changefreq: "weekly", priority: "0.84" },
  { loc: "https://www.gta6heistguide.com/compare/elite-ghost-hacker-10pct-vs-budget-hacker-5pct.html", changefreq: "weekly", priority: "0.84" },
  { loc: "https://www.gta6heistguide.com/compare/human-wheelman-vs-hired-npc-driver-cut-math.html", changefreq: "weekly", priority: "0.84" },
  { loc: "https://www.gta6heistguide.com/compare/4-door-tuner-sedan-vs-armored-4x4-suv-getaway.html", changefreq: "weekly", priority: "0.84" },
  { loc: "https://www.gta6heistguide.com/compare/scuba-rebreather-exfil-vs-rooftop-heli-escape.html", changefreq: "weekly", priority: "0.84" },
  { loc: "https://www.gta6heistguide.com/compare/vice-city-nightclub-vs-keys-marina-laundering.html", changefreq: "weekly", priority: "0.84" },
  { loc: "https://www.gta6heistguide.com/compare/ps5-pro-vs-pc-heist-frame-rate-ssd-streaming.html", changefreq: "weekly", priority: "0.84" },
  { loc: "https://www.gta6heistguide.com/compare/nordvpn-encrypted-tunnel-vs-unprotected-p2p-lobby.html", changefreq: "weekly", priority: "0.84" },
  { loc: "https://www.gta6heistguide.com/compare/g2a-verified-keys-vs-eneba-store-gta6-deals.html", changefreq: "weekly", priority: "0.84" },
  { loc: "https://www.gta6heistguide.com/compare/cutflow-pro-vs-clipbounty-studio-916-shorts.html", changefreq: "weekly", priority: "0.84" },
  { loc: "https://www.gta6heistguide.com/compare/sinfrontera-bank-vs-starlet-superyacht-duo-grind.html", changefreq: "weekly", priority: "0.84" },
  { loc: "https://www.gta6heistguide.com/compare/port-gellhorn-vs-grassrivers-airstrip-fast-heists.html", changefreq: "weekly", priority: "0.84" },
  { loc: "https://www.gta6heistguide.com/compare/leonida-gold-reserve-vs-ocean-drive-convoy-mastermind.html", changefreq: "weekly", priority: "0.84" },
  { loc: "https://www.gta6heistguide.com/compare/normal-5-node-vs-hardcore-7-node-vault-keypad-hack.html", changefreq: "weekly", priority: "0.84" },
  { loc: "https://www.gta6heistguide.com/guides/vice-city-vaults-storm-drains-guide.html", changefreq: "weekly", priority: "0.84" },
  { loc: "https://www.gta6heistguide.com/guides/leonida-keys-offshore-heists-smuggler-docks.html", changefreq: "weekly", priority: "0.84" },
  { loc: "https://www.gta6heistguide.com/guides/grassrivers-wetlands-cartel-airstrip-airboats.html", changefreq: "weekly", priority: "0.84" },
  { loc: "https://www.gta6heistguide.com/guides/port-gellhorn-container-terminal-crane-heist.html", changefreq: "weekly", priority: "0.84" },
  { loc: "https://www.gta6heistguide.com/guides/ambrosia-gold-reserve-bullion-fences-guide.html", changefreq: "weekly", priority: "0.84" },
  { loc: "https://www.gta6heistguide.com/guides/mount-kalaga-national-park-outposts-chopper-evasion.html", changefreq: "weekly", priority: "0.84" },
  { loc: "https://www.gta6heistguide.com/guides/megamundo-jammers-collectible-checklist.html", changefreq: "weekly", priority: "0.84" },
  { loc: "https://www.gta6heistguide.com/guides/1715-fleet-treasures-underwater-collectibles-map.html", changefreq: "weekly", priority: "0.84" },
  { loc: "https://www.gta6heistguide.com/guides/jack-of-hearts-playing-cards-collectible-locations.html", changefreq: "weekly", priority: "0.84" },
  { loc: "https://www.gta6heistguide.com/guides/brians-lost-smuggler-bales-grassrivers-keys-guide.html", changefreq: "weekly", priority: "0.84" },
  { loc: "https://www.gta6heistguide.com/guides/fast-cash-laundering-fences-safehouses-guide.html", changefreq: "weekly", priority: "0.84" },
  { loc: "https://www.gta6heistguide.com/guides/6-star-police-cctv-anpr-license-plate-evasion.html", changefreq: "weekly", priority: "0.84" },
  { loc: "https://www.gta6heistguide.com/guides/how-to-beat-15-second-biometric-vault-keypad-hack.html", changefreq: "weekly", priority: "0.84" },
  { loc: "https://www.gta6heistguide.com/guides/best-2-player-lucia-jason-co-op-heist-loadouts.html", changefreq: "weekly", priority: "0.84" },
  { loc: "https://www.gta6heistguide.com/guides/vehicle-trunk-weapon-storage-armory-guide.html", changefreq: "weekly", priority: "0.84" },
  { loc: "https://www.gta6heistguide.com/guides/protect-gta6-online-heist-lobby-from-ddos-lag.html", changefreq: "weekly", priority: "0.84" },
  { loc: "https://www.gta6heistguide.com/guides/how-to-clip-916-vertical-gta6-heist-shorts-offline.html", changefreq: "weekly", priority: "0.84" },
  { loc: "https://www.gta6heistguide.com/guides/raul-bautista-bank-robbery-mastermind-playbooks.html", changefreq: "weekly", priority: "0.84" },
  { loc: "https://www.gta6heistguide.com/guides/boobie-ike-cal-hampton-drequan-priest-heist-perks.html", changefreq: "weekly", priority: "0.84" },
  { loc: "https://www.gta6heistguide.com/guides/day-1-gta6-heist-prep-master-checklist-november-2026.html", changefreq: "weekly", priority: "0.84" },
  { loc: "https://www.gta6heistguide.com/articles/", changefreq: "daily", priority: "0.88" },
  { loc: "https://www.gta6heistguide.com/articles/gta-6-heist-payout-math-true-net-dollar-per-hour.html", changefreq: "weekly", priority: "0.86" },
  { loc: "https://www.gta6heistguide.com/articles/every-leonida-region-in-gta-6-mapped-escape-coordinates.html", changefreq: "weekly", priority: "0.86" },
  { loc: "https://www.gta6heistguide.com/articles/how-to-beat-15-second-biometric-vault-keypad-hack-gta-6.html", changefreq: "weekly", priority: "0.86" },
  { loc: "https://www.gta6heistguide.com/articles/solo-vs-4-player-co-op-heist-splits-gta-6-loot-weight.html", changefreq: "weekly", priority: "0.86" },
  { loc: "https://www.gta6heistguide.com/articles/protecting-gta-6-online-heist-lobby-ip-sniffing-texture-pop-in.html", changefreq: "weekly", priority: "0.86" },
  { loc: "https://www.gta6heistguide.com/articles/how-to-clip-auto-edit-916-vertical-gta-6-heist-highlights-offline.html", changefreq: "weekly", priority: "0.86" },
  { loc: "https://www.gta6heistguide.com/cloud-mirrors/", changefreq: "weekly", priority: "0.82" },
  { loc: "https://www.gta6heistguide.com/cloud-mirrors/heist-payout-calculator.html", changefreq: "weekly", priority: "0.82" },
  { loc: "https://www.gta6heistguide.com/cloud-mirrors/vault-keypad-hack-trainer.html", changefreq: "weekly", priority: "0.82" }
];

function escapeXml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function onRequestGet({ env }) {
  const todayStr = new Date().toISOString().slice(0, 10);
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
