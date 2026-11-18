/**
 * GTA 6 Heist Guide — Dynamic RSS 2.0 Syndication Feed
 * Cloudflare Pages Function (/rss.xml)
 */

function escapeXml(unsafe) {
  if (!unsafe) return "";
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

const RSS_ITEMS = [
  {
    title: "Grassrivers Cartel Airstrip Raid — 🔥 1.5X Weekly Bonus Active ($9.75M Duo Exfil)",
    link: "https://www.gta6heistguide.com/everglades-smuggler-run.html",
    guid: "https://www.gta6heistguide.com/everglades-smuggler-run.html?v=bonus-week-1",
    description: "The 1.5X Weekly Bonus is currently active on the Grassrivers Cartel Airstrip Raid! Base take boosted from $6,500,000 to $9,750,000 for duo airboat exfiltrations through the mangrove canal reed beds.",
    category: "Weekly Bonus & Blueprints",
    pubDate: "Wed, 18 Nov 2026 12:00:00 GMT"
  },
  {
    title: "Leonida State Gold Reserve Infiltration Blueprint — $25.0M Maximum Bullion Payout",
    link: "https://www.gta6heistguide.com/leonida-reserve.html",
    guid: "https://www.gta6heistguide.com/leonida-reserve.html",
    description: "Full blueprints, laser grid bypass sequences, and storm drain sewer escape routes for the highest-paying score in Leonida. Max take: $25,000,000 with thermal lance specialist cuts.",
    category: "Vault Blueprints",
    pubDate: "Tue, 17 Nov 2026 15:30:00 GMT"
  },
  {
    title: "How to Beat the 15-Second Biometric Vault Keypad Hack in GTA 6 (Interactive Trainer)",
    link: "https://www.gta6heistguide.com/vault-hack-trainer.html",
    guid: "https://www.gta6heistguide.com/vault-hack-trainer.html",
    description: "Master the 5-node and 7-node biometric frequency bypass before launch night. Practice with our 100% free interactive browser mini-game with real 15.000s countdown timer.",
    category: "Interactive Utilities",
    pubDate: "Mon, 16 Nov 2026 18:45:00 GMT"
  },
  {
    title: "Starlet Superyacht Offshore Heist Strategy — $11.8M High-Seas Infiltration",
    link: "https://www.gta6heistguide.com/vice-city-yacht-heist.html",
    guid: "https://www.gta6heistguide.com/vice-city-yacht-heist.html",
    description: "Offshore Sector 04 tactical guide: underwater scuba rebreather insertion, private military counter-measures, and high-speed Squalo speedboat exfiltration.",
    category: "Vault Blueprints",
    pubDate: "Sun, 15 Nov 2026 09:20:00 GMT"
  },
  {
    title: "Solo vs 4-Player Co-Op Heist Cut Splits & True Net $/Hour Calculator",
    link: "https://www.gta6heistguide.com/calculator.html",
    guid: "https://www.gta6heistguide.com/calculator.html",
    description: "Mathematical breakdown of loot bag weight penalties, hired NPC specialist cuts (Hacker, Gunner, Driver), laundering fence fees, and cooldown timers across all 6 Leonida vaults.",
    category: "Heist Economics",
    pubDate: "Sat, 14 Nov 2026 14:10:00 GMT"
  },
  {
    title: "Ocean Drive Armored Depository Ambush — $9.4M Heavy Exfiltration",
    link: "https://www.gta6heistguide.com/ocean-drive-armored-convoy.html",
    guid: "https://www.gta6heistguide.com/ocean-drive-armored-convoy.html",
    description: "Downtown Vice City ambush routes, EMP sticky charge placement, and 5-star NOOSE tactical evasion through the underground parking garages.",
    category: "Vault Blueprints",
    pubDate: "Fri, 13 Nov 2026 11:00:00 GMT"
  },
  {
    title: "Rockstar Anti-DDoS Architecture & Protecting Your Heist Lobby with ExitLag",
    link: "https://www.gta6heistguide.com/articles/protecting-gta-6-online-heist-lobby-ip-sniffing-texture-pop-in.html",
    guid: "https://www.gta6heistguide.com/articles/protecting-gta-6-online-heist-lobby-ip-sniffing-texture-pop-in.html",
    description: "Network engineering dispatch: how P2P host sniffing works in GTA Online lobbies and how routing host traffic through ExitLag prevents malicious disconnect booters during $25M finale cashouts.",
    category: "Hardware & Security",
    pubDate: "Thu, 12 Nov 2026 16:30:00 GMT"
  },
  {
    title: "How to Clip & Auto-Edit 9:16 Vertical GTA 6 Heist Highlights Offline",
    link: "https://www.gta6heistguide.com/articles/how-to-clip-auto-edit-916-vertical-gta-6-heist-highlights-offline.html",
    guid: "https://www.gta6heistguide.com/articles/how-to-clip-auto-edit-916-vertical-gta-6-heist-highlights-offline.html",
    description: "Step-by-step workflow for gaming creators to auto-detect squad voice peaks, silence dead air, and export 9:16 vertical TikTok/Shorts clips offline with CutFlow Pro & ClipBounty Studio.",
    category: "Content Creation",
    pubDate: "Wed, 11 Nov 2026 10:15:00 GMT"
  }
];

export async function onRequest(context) {
  const now = new Date().toUTCString();

  const itemsXml = RSS_ITEMS.map((item) => `    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${escapeXml(item.link)}</link>
      <guid isPermaLink="false">${escapeXml(item.guid)}</guid>
      <description>${escapeXml(item.description)}</description>
      <category>${escapeXml(item.category)}</category>
      <pubDate>${item.pubDate}</pubDate>
    </item>`).join("\n");

  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>GTA 6 Heist Guide | Syndicate Live Intel, Vault Blueprints &amp; Meta Feed</title>
    <link>https://www.gta6heistguide.com/</link>
    <atom:link href="https://www.gta6heistguide.com/rss.xml" rel="self" type="application/rss+xml" />
    <description>Real-time GTA 6 heist payout math, 15s vault keypad hacks, Leonida regional escape routes, weekly 1.5X bonus rotations, and verified launch meta.</description>
    <language>en-us</language>
    <lastBuildDate>${now}</lastBuildDate>
    <managingEditor>intel@gta6heistguide.com (Syndicate Command)</managingEditor>
    <webMaster>tech@gta6heistguide.com (Syndicate Ops)</webMaster>
    <ttl>60</ttl>
    <image>
      <url>https://www.gta6heistguide.com/assets/avatar-mastermind.png</url>
      <title>GTA 6 Heist Guide</title>
      <link>https://www.gta6heistguide.com/</link>
    </image>
${itemsXml}
  </channel>
</rss>`;

  return new Response(rssXml, {
    status: 200,
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=1800, s-maxage=3600"
    }
  });
}
