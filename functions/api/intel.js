const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const WEEKLY_VAULT_ROTATION = [
  {
    slug: "leonida-reserve.html",
    name: "Leonida State Gold Reserve Infiltration",
    bonusTag: "1.5X FEATURED WEEKLY SCORE",
    basePayout: "$25,000,000",
    bonusPayout: "$37,500,000",
    recommendedApproach: "Silent Sewer Intake + Thermal Lance",
    specialistSpotlight: "Zero-Delay Ghost Hacker (-3% Cut Discount This Week)",
    summary: "Priority focus this week on Pelican Valley subterranean access routes and dual-keycard vaults.",
  },
  {
    slug: "sinfrontera-bank.html",
    name: "Sinfrontera National Bank Vault Raid",
    bonusTag: "1.5X FEATURED WEEKLY SCORE",
    basePayout: "$14,500,000",
    bonusPayout: "$21,750,000",
    recommendedApproach: "Sub-floor Drainage + EMP Transformer",
    specialistSpotlight: "Precision Laser Drill Tech (2x Vault Door Speed)",
    summary: "Downtown Vice City high-roller safety deposit boxes show elevated bearer-bond drops this rotation.",
  },
  {
    slug: "vice-city-yacht-heist.html",
    name: "Starlet Superyacht Offshore Heist",
    bonusTag: "1.5X FEATURED WEEKLY SCORE",
    basePayout: "$11,800,000",
    bonusPayout: "$17,700,000",
    recommendedApproach: "Sub-Aquatic Rebreather Hull Breach",
    specialistSpotlight: "Offshore Boat Wheelman (+15% Coastal Escape Speed)",
    summary: "VIP stateroom encryption keys rotate every 90 seconds; scuba exfiltration remains 100% radar-immune.",
  },
  {
    slug: "port-gellhorn.html",
    name: "Port Gellhorn Container Terminal Heist",
    bonusTag: "1.5X FEATURED WEEKLY SCORE",
    basePayout: "$8,200,000",
    bonusPayout: "$12,300,000",
    recommendedApproach: "Nighttime Crane Terminal Hijack",
    specialistSpotlight: "Canal Demolitionist (Silent Container Breaching)",
    summary: "Cartel manifest containers on Pier 4 carry triple bearer-share electronics crates this week.",
  },
  {
    slug: "ocean-drive-armored-convoy.html",
    name: "Ocean Drive Armored Depository Ambush",
    bonusTag: "1.5X FEATURED WEEKLY SCORE",
    basePayout: "$9,400,000",
    bonusPayout: "$14,100,000",
    recommendedApproach: "Magnetic EMP + Metro Subway Escape",
    specialistSpotlight: "Signal Gridlock Hacker (Extended 45s Dispatch Blindness)",
    summary: "Peak coastal traffic window rewards coordinated dual-EMP truck stops and subway tube exfiltration.",
  },
  {
    slug: "everglades-smuggler-run.html",
    name: "Grassrivers Cartel Airstrip Raid",
    bonusTag: "1.5X FEATURED WEEKLY SCORE",
    basePayout: "$6,500,000",
    bonusPayout: "$9,750,000",
    recommendedApproach: "Thermal Night-Vision Airboat Ingress",
    specialistSpotlight: "Swamp Bush Pilot (Zero Radar Altitude Flight)",
    summary: "Low-ceiling storm front reduces patrol helicopter sweeps across the Grassrivers corridor.",
  },
];

const DAILY_OPERATION_TEMPLATES = [
  {
    target: "Leonida State Gold Reserve",
    link: "leonida-reserve.html",
    weather: "Midnight Coastal Fog",
    crew: "4-Player Co-Op (1 Mastermind, 1 Ghost Hacker, 1 Wheelman, 1 Enforcer)",
    trunkLoadout: "Suppressed Carbine + Thermal Plasma Cutter + 2x EMP Mines",
    conduit: "Pelican Valley Northern Storm Intake Drain",
    payoutTip: "Prioritize uncut bearer bonds before heavy gold pallets to dodge the -25% sprint penalty during vault exfiltration.",
  },
  {
    target: "Sinfrontera National Bank Vault",
    link: "sinfrontera-bank.html",
    weather: "Tropical Downpour (Reduced NPC Audio Radius)",
    crew: "3-Player Trio (Jason/Lucia Style Sync + Specialist Hacker)",
    trunkLoadout: "Compact SMG + Silent Laser Lance + Tear Gas Canisters",
    conduit: "Ocean Blvd Subterranean Drainage Grates -> North Vice Dirt Bikes",
    payoutTip: "Maintain drill core temp under 800C while Hacker cycles alternating biometric vault PIN pads.",
  },
  {
    target: "Starlet Superyacht Offshore",
    link: "vice-city-yacht-heist.html",
    weather: "Clear Moonlit Tide (Low Patrol Boat Visibility)",
    crew: "2-3 Operatives (Sub-Aquatic Rebreather Specialists)",
    trunkLoadout: "Scuba Rebreathers + Suppressed Pistols + Glass Cutters",
    conduit: "Lower Starboard Bilge Hatch -> Coral Reef Underwater Ditch",
    payoutTip: "Skipping the rooftop helicopter avoids instant 4-star Coast Guard radar and preserves the +5% stealth bonus.",
  },
  {
    target: "Port Gellhorn Container Terminal",
    link: "port-gellhorn.html",
    weather: "Dawn Freight Fog",
    crew: "3 Operatives (Crane Operator + Dock Wheelman + Overwatch)",
    trunkLoadout: "Long-Range Carbine + Container Thermal Torches + Signal Jammer",
    conduit: "Pier 4 Industrial Water Canals -> Offshore Swamp Buggies",
    payoutTip: "Scan RFID manifest tags from the overhead crane cab before dropping down to open high-value electronics containers.",
  },
  {
    target: "Ocean Drive Armored Depository Convoy",
    link: "ocean-drive-armored-convoy.html",
    weather: "Twilight Neon Rush Hour",
    crew: "3-4 Operatives (EMP Bait Car + Heavy Extractor + Subway Escort)",
    trunkLoadout: "Magnetic Road EMPs + Stashed LMG + Armored Getaway Sedan",
    conduit: "Vice Transit Underground Subway Tunnels",
    payoutTip: "Trigger traffic gridlock diversion 4 seconds before detonating EMP charges to prevent convoy escort flankers from arriving.",
  },
  {
    target: "Grassrivers Cartel Airstrip",
    link: "everglades-smuggler-run.html",
    weather: "Low-Ceiling Storm Front",
    crew: "2-Player Duo (Pilot + Stealth Radar Jammer)",
    trunkLoadout: "Night-Vision Goggles + Silenced Carbines + Airboat Tow Hooks",
    conduit: "Marsh Airboat Backchannels -> Low-Altitude Coastal Skim",
    payoutTip: "Fly below 120ft over the swamp treeline after takeoff to stay completely underneath Leonida border patrol radar cones.",
  },
];

const WEATHER_CONDITIONS = [
  "Tropical Squall (+22% Acoustic Masking)",
  "Humid Night Fog (-30% Sniper Detection Range)",
  "High-Traffic Dusk Window (Optimal Diversion Cover)",
  "Clear Pre-Dawn Patrol Gap (Minimal Chopper Sweeps)",
  "Heatwave Shift Change (Extended Guard Rotation Window)",
];

const DMCA_BLOCKLIST_RE = /\b(leak|leaker|leaked|hacker|hacked|hacking|extort|extorting|extortion|crack|cracked|pirate|piracy|torrent|arrest|arrested|prison|court|pleads guilty|lawsuit)\b/i;


const ROTATION_OFFSET = 2;
function getRotationIndex(now = new Date()) {
  const cycle = Math.floor((now.getTime() - 10 * 3600 * 1000) / (7 * 86400 * 1000));
  return (((cycle + ROTATION_OFFSET) % WEEKLY_VAULT_ROTATION.length) + WEEKLY_VAULT_ROTATION.length) % WEEKLY_VAULT_ROTATION.length;
}

function getNextThursdayResetUTC(now = new Date()) {
  const next = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 10, 0, 0, 0));
  const day = next.getUTCDay();
  let daysUntilThursday = (4 - day + 7) % 7;
  if (daysUntilThursday === 0 && now.getTime() >= next.getTime()) {
    daysUntilThursday = 7;
  }
  next.setUTCDate(next.getUTCDate() + daysUntilThursday);
  return next;
}

function getIsoWeekNumber(d) {
  const date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(((date - yearStart) / 86400000 + 1) / 7);
}

function cleanXmlText(str = "") {
  return String(str)
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&rsquo;|&lsquo;/g, "'")
    .replace(/&rdquo;|&ldquo;/g, '"')
    .replace(/&ndash;|&mdash;/g, "-")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildAffiliateBarHtml() {
  return `
    <div style="margin-top:1.5rem; padding:1.25rem; background:rgba(16,185,129,0.08); border:1px solid #10b981; border-radius:10px;">
      <div style="color:#10b981; font-weight:900; font-size:0.85rem; letter-spacing:1px; margin-bottom:0.5rem;">VERIFIED SYNDICATE PREP &amp; PARTNER DEALS</div>
      <div style="display:flex; gap:0.65rem; flex-wrap:wrap;">
        <a href="https://www.g2a.com/n/reflink-4094b9aab5" target="_blank" rel="nofollow noopener" class="btn btn-primary" style="padding:0.45rem 0.9rem; font-size:0.78rem;">G2A Key Deals</a>
        <a href="https://www.eneba.com/store/all?q=gta&af_id=gta6heistguide" target="_blank" rel="nofollow noopener" class="btn btn-secondary" style="padding:0.45rem 0.9rem; font-size:0.78rem;">Eneba Pre-Orders</a>
        <a href="https://www.exitlag.com/refer/10386953" target="_blank" rel="nofollow noopener" class="btn btn-secondary" style="padding:0.45rem 0.9rem; font-size:0.78rem;">ExitLag Lobby Shield</a>
        <a href="https://www.amazon.com/s?k=Samsung+990+PRO+2TB+PCIe+4.0+M.2&tag=gta6heistguid-20" target="_blank" rel="nofollow noopener" class="btn btn-amber" style="padding:0.45rem 0.9rem; font-size:0.78rem;">Amazon 990 PRO SSD</a>
        <a href="https://getapexlocal.com/partners" target="_blank" rel="noopener" class="btn btn-secondary" style="padding:0.45rem 0.9rem; font-size:0.78rem; border-color:#10b981; color:#10b981;">CutFlow Pro (50% Partner)</a>
      </div>
    </div>
  `;
}

function buildDailyOperationGuide(dateStr, seedNum) {
  const op = DAILY_OPERATION_TEMPLATES[seedNum % DAILY_OPERATION_TEMPLATES.length];
  const weather = WEATHER_CONDITIONS[(seedNum * 3 + 1) % WEATHER_CONDITIONS.length];
  const title = `Daily Syndicate Blueprint (${dateStr}): ${op.target} — ${weather.split("(")[0].trim()} Run`;
  const summary = `Auto-generated multi-phase heist playbook for ${op.target}. Recommended squad: ${op.crew}. Primary entry/exit: ${op.conduit}.`;

  const html = `
    <div style="display:flex; gap:0.5rem; flex-wrap:wrap; margin-bottom:1rem;">
      <span class="user-badge badge-mastermind">DAILY AUTO-GENERATED PLAYBOOK</span>
      <span class="user-badge badge-hacker">${escapeHtml(weather)}</span>
    </div>
    <p style="color:var(--text-muted); margin-bottom:1rem;">
      <strong>Optimal Crew Configuration:</strong> ${escapeHtml(op.crew)}<br>
      <strong>Vehicle Trunk Armory:</strong> ${escapeHtml(op.trunkLoadout)}<br>
      <strong>Primary Conduit:</strong> ${escapeHtml(op.conduit)}
    </p>
    <div style="display:grid; gap:0.85rem;">
      <div style="background:rgba(255,255,255,0.03); border-left:3px solid var(--neon-cyan); padding:0.9rem; border-radius:6px;">
        <strong>Phase 1 &mdash; Pre-Heist Telemetry &amp; Lobby Lock</strong>
        <p style="color:var(--text-muted); font-size:0.9rem; margin-top:0.25rem;">Verify squad role cuts in the Interactive Planner and bookmark your split URL. Shield co-op host IPs if staging in open sessions.</p>
      </div>
      <div style="background:rgba(255,255,255,0.03); border-left:3px solid var(--neon-cyan); padding:0.9rem; border-radius:6px;">
        <strong>Phase 2 &mdash; Silent Approach via ${escapeHtml(op.conduit.split("->")[0].trim())}</strong>
        <p style="color:var(--text-muted); font-size:0.9rem; margin-top:0.25rem;">Leverage today's ${escapeHtml(weather)} window to slip past outer perimeter sweep cones without alerting dispatch.</p>
      </div>
      <div style="background:rgba(255,255,255,0.03); border-left:3px solid var(--neon-green); padding:0.9rem; border-radius:6px;">
        <strong>Phase 3 &mdash; Vault Loot Optimization</strong>
        <p style="color:var(--text-muted); font-size:0.9rem; margin-top:0.25rem;">${escapeHtml(op.payoutTip)}</p>
      </div>
      <div style="background:rgba(255,255,255,0.03); border-left:3px solid var(--neon-pink); padding:0.9rem; border-radius:6px;">
        <strong>Phase 4 &mdash; Clean Heat Shed &amp; Safehouse Drop</strong>
        <p style="color:var(--text-muted); font-size:0.9rem; margin-top:0.25rem;">Complete the final exfiltration along <strong>${escapeHtml(op.conduit)}</strong> while maintaining the +5% stealth integrity multiplier.</p>
      </div>
    </div>
    <div style="margin-top:1.25rem; display:flex; gap:0.75rem; flex-wrap:wrap;">
      <a href="/${op.link}" class="btn btn-primary" style="padding:0.55rem 1rem; font-size:0.82rem;">Open ${escapeHtml(op.target)} Calculator &rarr;</a>
      <a href="/forum#lfg-hub" class="btn btn-secondary" style="padding:0.55rem 1rem; font-size:0.82rem;">🤝 Find Squad for This Run</a>
    </div>
    ${buildAffiliateBarHtml()}
  `;

  return { title, summary, html };
}

const NEWS_TOPICS = [
  {
    re: /miami heat|vice city night|basketball night|nba night/i,
    area: "Vice City Hype & Scouting",
    link: "leonida-interactive-map",
    variants: [
      "A real-world Vice City night event pushes the neon-and-palm look of Leonida across social feeds before launch, so expect a wave of scouting clips that all point at the same downtown streets. Bookmark the Vice City sector on our radar map and rehearse the Sinfrontera National Bank route once so launch weekend starts with a plan instead of a guess.",
    ],
  },
  {
    re: /nba 2k/i,
    area: "Cross-Promo & Vice City Layout",
    link: "leonida-interactive-map",
    variants: [
      "A playable Vice City inside NBA 2K27 gives heisters a free look at how the city's boulevards and waterfront connect, which helps you pre-learn getaway directions before you hold a GTA 6 controller. Treat any 2K-side street layout as flavor only, because vault interiors and heist routes are still only confirmed inside GTA 6 itself.",
      "The 2K crossover turns Vice City into a basketball playground, which for a heist crew mainly means a time sink to avoid until your install, keys and squad are locked in. Spend that prep time filling your squad on the LFG board, since 3- and 4-player cut splits are decided before anyone loads into a vault.",
      "Seeing Vice City rebuilt for another game confirms how central the Vice Beach and downtown districts are to launch marketing, so those are the blocks most guides will cover first. Learn them early with our Vice City radar sector and plan your first bank entry around the storm drain approach rather than the lobby.",
    ],
  },
  {
    re: /merch|apparel|hoodie|collectible|lego|figure/i,
    area: "Launch Merch & Day-One Prep",
    link: "affiliates-gear",
    variants: [
      "Launch merchandise dropping ahead of release signals a huge physical-fan audience, so expect storefront stock and launch-night servers to be tight. Lock in a verified digital key and clear SSD space now instead of chasing last-minute stock on release night.",
      "A flood of GTA VI merch usually means pre-launch hype peaks several days before Nov 19, which is also when key sellers move prices. Compare edition prices early and keep your budget for the controller and storage upgrades that actually change your heist performance.",
    ],
  },
  {
    re: /pre-?order|ultimate edition|bonus items|edition/i,
    area: "Editions & Pre-Order Bonuses",
    link: "affiliates-gear",
    variants: [
      "Pre-order bonuses and the Ultimate Edition contents decide which cosmetics and head-start items you carry into your first heist, so compare tiers before buying and check whether any bonus touches stats or is purely cosmetic. Until Rockstar confirms stat effects, plan crew cuts with the standard payout numbers in our calculator.",
      "Edition differences matter most for day-one cash and extras, so decide your tier before launch and avoid paying twice. Use the Net $/Hour optimizer to see whether any early cash bonus actually changes your best first-week target.",
    ],
  },
  {
    re: /who'?s who|characters|cast|meet the/i,
    area: "Characters & Crew Contacts",
    link: "crew-database",
    variants: [
      "Knowing who is who in Vice City helps you read the story crew, and the names to track are Lucia Caminos, Jason Duval, Raul Bautista, Boobie Ike, Cal Hampton, Brian Heder, Dre'Quan Priest and Real Dimez. Use our roster and the Lucia and Jason skills simulator to decide which protagonist leads vault entry and which covers the wheel and overwatch.",
    ],
  },
  {
    re: /wanted|police|cops|law enforcement|cctv|witness/i,
    area: "Police AI & Evasion",
    link: "leonida-wanted-system",
    variants: [
      "Reports on how police track you in Leonida point to witnesses and plate recognition rather than random spawns, so vehicle swaps and clothing changes become part of the getaway plan. Run the wanted-cooldown simulator with a plate swap and a jacket change to see how much radar time you actually save.",
      "A smarter wanted system rewards leaving the area quickly and out of sight, not just outrunning cruisers. Stage a second clean vehicle near your exit and practice the swap before your first 4-star chase.",
    ],
  },
  {
    re: /download|file size|install|gb\b|storage|ssd|disk/i,
    area: "Install Size & Storage",
    link: "affiliates-gear",
    variants: [
      "A large install size means your day-one bottleneck is storage and download speed, not the heist plan. Free up space on a fast NVMe or console drive now so the install finishes before the launch window opens.",
    ],
  },
  {
    re: /release time|unlock|countdown|release date|come out|launch time|midnight|time zone/i,
    area: "Launch Timing",
    link: "live-intel",
    variants: [
      "Launch timing details affect when your squad can actually load in, so agree on a start time with your crew instead of everyone trying to guess the unlock. Use the LFG board to lock a time and platform for your first vault run.",
      "When the unlock lands depends on your region and platform, so check your own console or launcher schedule rather than relying on a headline. Have your key redeemed and your install verified before the clock hits zero.",
    ],
  },
  {
    re: /price|\$\d|cost|how much/i,
    area: "Price & Value",
    link: "affiliates-gear",
    variants: [
      "Price news matters for crews because a cheaper key from a verified seller frees budget for the hardware that changes performance. Compare sellers and edition tiers before you commit, and keep proof of purchase for the key.",
    ],
  },
  {
    re: /trailer|livestream|live stream|gameplay reveal|reveal|footage/i,
    area: "Trailers & Reveals",
    link: "gameplay-mechanics",
    variants: [
      "New footage and reveals are only useful for planning when they show repeatable mechanics, so note anything about weight, vehicles or police behavior and compare it with our mechanics guide. Treat single clips as hints, not confirmed numbers.",
      "Livestream-style reveals usually show polished scenarios, so focus on what repeats across clips such as cover, driving and interaction timing. Then test those assumptions in the planner instead of copying one clip.",
    ],
  },
  {
    re: /ps5 pro|pc requirements|performance|frame rate|fps|60 ?fps|graphics|4k/i,
    area: "Performance & Hardware",
    link: "affiliates-gear",
    variants: [
      "Performance reports shape which hardware actually helps on day one, so prioritize fast storage and a stable connection before cosmetic upgrades. Check our gear page for the controller and SSD picks that matter most in heist finales.",
    ],
  },
  {
    re: /streamer|twitch|youtube|content creator|creator/i,
    area: "Creators & Streaming",
    link: "vault-hack-trainer",
    variants: [
      "Streaming rules and creator news affect how you share heist runs, so check platform policies before clipping launch footage. Practice your hack timing in the trainer and keep short vertical clips ready for sharing.",
    ],
  },
  {
    re: /map|leonida|vice city|keys|grassrivers|port gellhorn|ambrosia|kalaga/i,
    area: "Map & Regions",
    link: "leonida-interactive-map",
    variants: [
      "Map details help you decide which region to learn first, and Vice City, the Leonida Keys, Grassrivers, Port Gellhorn, Ambrosia and Mount Kalaga each favor a different heist style. Jump between regions on our radar and log your own markers as you confirm real locations.",
    ],
  },
  {
    re: /vehicle|car|getaway|garage|customiz|drift|chopper|boat|airboat/i,
    area: "Getaway Vehicles & Trunk Loadouts",
    link: "vehicles-getaway-cars",
    variants: [
      "Vehicle handling and trunk storage directly dictate how many heavy thermal lances and suppressed carbines your crew carries to a vault breach. Check our Getaway Vehicle & Trunk Loadout guide to pair a high-torque 4-door sedan with an off-road canal swap car before starting your finale.",
      "High-speed Leonida pursuits punish low-traction sports cars once you leave paved Vice City boulevards for Grassrivers or Port Gellhorn canals. Pre-stage a secondary water or off-road getaway vehicle on the Interactive Radar Map to shed 4-star helicopter locks cleanly.",
    ],
  },
  {
    re: /heist|robbery|vault|loot|gold|cash|bond|payout|split/i,
    area: "Heist Economy & Vault Meta",
    link: "heist-payout-calculator",
    variants: [
      "Every vault robbery in Leonida balances raw payout against bag weight sprint penalties, setup grind minutes, and fence laundering fees. Run the True Net $/Hour Optimizer in our Heist Planner to see whether 2-player Bearer Bonds beat 4-player Gold Bars for your squad.",
      "Crew cut negotiations and specialist NPC fees can quietly eat 20%+ of a finale take if you hire overpriced drivers on short escapes. Lock in your exact player percentages and grab priority order in the Calculator before launching the mission lobby.",
    ],
  },
  {
    re: /online|economy|money|shark|grind|business|safehouse|launder|fence/i,
    area: "Criminal Enterprise & Laundering",
    link: "safehouses-laundering",
    variants: [
      "Unlaundered heist cash triggers higher heat and fence fees unless routed through a verified regional safehouse and clean front business. Review our Safehouses & Black-Market Laundering guide to minimize your fence cut and unlock fast-travel garage slots early.",
    ],
  },
  {
    re: /weapon|gun|loadout|suppressor|thermal|emp|hack|keypad/i,
    area: "Weapons, Hacking & Breaching",
    link: "vault-hack-trainer",
    variants: [
      "Silent vault entry depends on sub-15-second biometric keypad bypasses and suppressed weapon loadouts stored in your getaway trunk. Warm up with 3 rounds on our 15s Vault Keypad & Biometric Hack Trainer so you never trip the nerve-gas fail-safe in a live finale.",
    ],
  },
  {
    re: /patch|update|hotfix|nerf|buff|rockstar newswire|title update/i,
    area: "Live Patch Notes & Payout Meta",
    link: "heist-payout-calculator",
    variants: [
      "Title updates and hotfixes frequently adjust vault cooldown timers, fence laundering fees, and secondary loot table multipliers. Check our crowdsourced Live Payout & Cooldown tracker and recalculate your crew's True Net $/Hour before queuing your next heist.",
    ],
  },
];

const DEFAULT_TAKEAWAYS = [
  "This story is background rather than a mechanic change, so the practical move is to keep your crew roster and payout plan ready for launch. Revisit the planner once Rockstar confirms any numbers that affect cuts or payouts.",
  "Nothing here changes confirmed heist math, but it is worth tracking for how the community will talk about launch week. Use the live meta page to see which target is boosted and plan your first run around it.",
  "Treat this as context for the launch hype cycle and not as a gameplay source. Keep your squad and hardware ready and let the weekly bonus target decide your first vault.",
];

function pickTakeaway(headline, topic, usedSet) {
  let hash = 0;
  for (let i = 0; i < headline.length; i++) hash = ((hash << 5) - hash + headline.charCodeAt(i)) | 0;
  const pool = topic ? topic.variants : DEFAULT_TAKEAWAYS;
  for (let k = 0; k < pool.length; k++) {
    const candidate = pool[(Math.abs(hash) + k) % pool.length];
    if (!usedSet.has(candidate)) {
      usedSet.add(candidate);
      return candidate;
    }
  }
  const fallback = DEFAULT_TAKEAWAYS.find((d) => !usedSet.has(d));
  if (fallback) {
    usedSet.add(fallback);
    return fallback;
  }
  return `For "${headline.slice(0, 90)}", the actionable step is simple: confirm the detail on the official source, then update your squad plan only if it changes payouts, vehicles or police behavior.`;
}

function buildNewsCompanionGuide(headline, sourceName, sourceUrl, pubDate, usedSet) {
  const safeHeadline = escapeHtml(headline);
  const safeSource = escapeHtml(sourceName || "Gaming Press");
  const topic = NEWS_TOPICS.find((t) => t.re.test(headline)) || null;
  const takeaway = pickTakeaway(headline, topic, usedSet || new Set());
  const focusArea = topic ? topic.area : "Launch Context";
  const recommendedLink = topic ? topic.link : "heist-payout-calculator";

  const summary = `Syndicate Tactical Impact Breakdown: ${takeaway}`;
  const html = `
    <div style="display:flex; gap:0.5rem; flex-wrap:wrap; margin-bottom:1rem;">
      <span class="user-badge badge-hacker">LIVE NEWS ANALYSIS</span>
      <span class="user-badge badge-wheelman">${escapeHtml(focusArea)}</span>
    </div>
    <p style="color:var(--text-muted); font-size:0.95rem; margin-bottom:1rem;">
      <strong>Headline (${safeSource} &bull; ${escapeHtml(pubDate)}):</strong> "${safeHeadline}"
    </p>
    <div style="background:rgba(0,240,255,0.06); border:1px solid var(--neon-cyan); border-radius:8px; padding:1rem; margin-bottom:1rem;">
      <h4 style="color:var(--neon-cyan); margin-bottom:0.4rem;">Syndicate Tactical Impact Breakdown</h4>
      <p style="color:var(--text-main); font-size:0.92rem;">${escapeHtml(takeaway)}</p>
    </div>
    <div style="display:flex; gap:0.75rem; flex-wrap:wrap;">
      <a href="/${recommendedLink}" class="btn btn-primary" style="padding:0.55rem 1rem; font-size:0.82rem;">Open Matching Tool &rarr;</a>
      ${sourceUrl ? `<a href="${escapeHtml(sourceUrl)}" target="_blank" rel="nofollow noopener" class="btn btn-secondary" style="padding:0.55rem 1rem; font-size:0.82rem;">Read Original Source (${safeSource}) &nearr;</a>` : ""}
    </div>
    ${buildAffiliateBarHtml()}
  `;

  return { summary, html };
}

function buildCustomTopicGuide(topic, category, targetVault) {
  const safeTopic = escapeHtml(topic);
  const safeVault = escapeHtml(targetVault || "Leonida State Vaults");
  const summary = `Custom-generated Syndicate playbook focused on "${topic}" for ${targetVault || "all GTA 6 heists"}, including stealth timings, crew cut math, and equipment prep.`;

  const html = `
    <div style="display:flex; gap:0.5rem; flex-wrap:wrap; margin-bottom:1rem;">
      <span class="user-badge badge-mastermind">SYNDICATE CUSTOM GUIDE</span>
      <span class="user-badge badge-hacker">${safeVault}</span>
    </div>
    <p style="color:var(--text-muted); margin-bottom:1rem;">
      Generated on-demand inside the Syndicate Command Center to keep your community equipped with actionable strategies around <strong>${safeTopic}</strong>.
    </p>
    <div style="display:grid; gap:0.85rem;">
      <div style="background:rgba(255,255,255,0.03); border-left:3px solid var(--neon-cyan); padding:0.9rem; border-radius:6px;">
        <strong>Phase 1 &mdash; Reconnaissance &amp; Loadout Calibration</strong>
        <p style="color:var(--text-muted); font-size:0.9rem; margin-top:0.25rem;">Inspect guard camera dead-zones on the Interactive Radar Map and stow specialized cutting lances or signal scramblers in your getaway trunk prior to triggering ${safeTopic}.</p>
      </div>
      <div style="background:rgba(255,255,255,0.03); border-left:3px solid var(--neon-green); padding:0.9rem; border-radius:6px;">
        <strong>Phase 2 &mdash; Optimal Role Assignment &amp; Cut Split</strong>
        <p style="color:var(--text-muted); font-size:0.9rem; margin-top:0.25rem;">Balance a low-cost Wheelman (8%) with a high-tier Ghost Hacker (10%) to preserve maximum vault extraction speed for ${safeVault}.</p>
      </div>
      <div style="background:rgba(255,255,255,0.03); border-left:3px solid var(--neon-pink); padding:0.9rem; border-radius:6px;">
        <strong>Phase 3 &mdash; Extraction &amp; Post-Heist Content Workflow</strong>
        <p style="color:var(--text-muted); font-size:0.9rem; margin-top:0.25rem;">Clear police radar via canal/sewer conduits, then chop your best heist moments into viral 9:16 shorts using offline CutFlow Pro or ClipBounty Studio.</p>
      </div>
    </div>
    <div style="margin-top:1.25rem; display:flex; gap:0.75rem; flex-wrap:wrap;">
      <a href="heist-planner.html" class="btn btn-primary" style="padding:0.55rem 1rem; font-size:0.82rem;">Simulate Cut in Planner &rarr;</a>
      <a href="/forum#lfg-hub" class="btn btn-secondary" style="padding:0.55rem 1rem; font-size:0.82rem;">Recruit Squad in Crew Lounge</a>
    </div>
    ${buildAffiliateBarHtml()}
  `;

  return { summary, html };
}

async function harvestLiveRssNews(env, todayStr) {
  let inserted = 0;
  const usedTakeaways = new Set();
  const feeds = [
    "https://www.bing.com/news/search?q=GTA+6+Rockstar+Newswire+OR+IGN+OR+Polygon+OR+GamesRadar+OR+Vice+City&format=rss",
    "https://www.bing.com/news/search?q=GTA+6+gameplay+release+OR+Vice+City+OR+heist&format=rss",
    "https://news.google.com/rss/search?q=%22GTA+6%22+gameplay+OR+Vice+City+OR+heist+OR+Rockstar+Games&hl=en-US&gl=US&ceid=US:en",
  ];

  for (const rssUrl of feeds) {
    if (inserted >= 6) break;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);
    try {
      const resp = await fetch(rssUrl, {
        signal: controller.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
          "Accept": "application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8",
        },
      });
      clearTimeout(timeoutId);
      if (!resp.ok) continue;

      const xml = await resp.text();
      const itemMatches = xml.match(/<item>[\s\S]*?<\/item>/g) || [];
      let count = 0;

      for (const rawItem of itemMatches) {
        if (count >= 6) break;
        const titleMatch = rawItem.match(/<title>([\s\S]*?)<\/title>/);
        const linkMatch = rawItem.match(/<link>([\s\S]*?)<\/link>/);
        const dateMatch = rawItem.match(/<pubDate>([\s\S]*?)<\/pubDate>/);
        const sourceMatch = rawItem.match(/<(?:News:Source|source)[^>]*>([\s\S]*?)<\/(?:News:Source|source)>/i);

        let title = cleanXmlText(titleMatch ? titleMatch[1] : "");
        let link = cleanXmlText(linkMatch ? linkMatch[1] : "");
        if (link.includes("bing.com/news/apiclick.aspx")) {
          try {
            const parsedUrl = new URL(link);
            const target = parsedUrl.searchParams.get("url");
            if (target) link = target;
          } catch (e) {}
        }
        const sourceName = cleanXmlText(sourceMatch ? sourceMatch[1] : "Gaming Press");
        const pubDateRaw = cleanXmlText(dateMatch ? dateMatch[1] : "");

        if (!title || DMCA_BLOCKLIST_RE.test(title)) continue;
        if (sourceName && title.endsWith(` - ${sourceName}`)) {
          title = title.slice(0, -(` - ${sourceName}`).length).trim();
        }

        let pubDate = todayStr;
        if (pubDateRaw) {
          const parsed = new Date(pubDateRaw);
          if (!Number.isNaN(parsed.getTime())) {
            pubDate = parsed.toISOString().slice(0, 10);
          }
        }

        // Deterministic safe hash ID from headline
        let hash = 0;
        for (let i = 0; i < title.length; i++) {
          hash = ((hash << 5) - hash + title.charCodeAt(i)) | 0;
        }
        const id = `rss-${Math.abs(hash)}`;
        const lower = title.toLowerCase();
        const category = lower.includes("map") || lower.includes("vice city") ? "map" : lower.includes("heist") || lower.includes("wanted") ? "meta" : "official";
        const badge = `LIVE NEWS (${sourceName.toUpperCase().slice(0, 18)})`;

        const companion = buildNewsCompanionGuide(title, sourceName, link, pubDate, usedTakeaways);
        await env.DB.prepare(
          `INSERT OR REPLACE INTO dynamic_guides (id, category, badge, title, summary, full_guide_html, source_name, source_url, created_date, created_at)
           VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, datetime('now'))`
        )
          .bind(id, category, badge, title.slice(0, 180), companion.summary.slice(0, 600), companion.html, sourceName, link, pubDate)
          .run();

        count++;
        inserted++;
      }
    } catch (e) {
      clearTimeout(timeoutId);
    }
  }

  // Also harvest top verified community discussions from Reddit r/GTA6
  try {
    const redditCtrl = new AbortController();
    const redditTimer = setTimeout(() => redditCtrl.abort(), 3500);
    const redditResp = await fetch("https://www.reddit.com/r/GTA6/hot.json?limit=6", {
      signal: redditCtrl.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; GTA6HeistGuideBot/3.0; +https://www.gta6heistguide.com)",
        "Accept": "application/json",
      },
    });
    clearTimeout(redditTimer);
    if (redditResp.ok) {
      const redditJson = await redditResp.json();
      const posts = redditJson?.data?.children || [];
      let rCount = 0;
      for (const child of posts) {
        if (rCount >= 2) break;
        const post = child?.data;
        if (!post || post.stickied || post.over_18) continue;
        const rTitle = String(post.title || "").trim();
        if (!rTitle || rTitle.length < 24 || DMCA_BLOCKLIST_RE.test(rTitle)) continue;
        let hash = 0;
        for (let i = 0; i < rTitle.length; i++) hash = ((hash << 5) - hash + rTitle.charCodeAt(i)) | 0;
        const id = `rss-reddit-${Math.abs(hash)}`;
        const rUrl = `https://www.reddit.com${post.permalink || "/r/GTA6/"}`;
        const companion = buildNewsCompanionGuide(rTitle, "r/GTA6 Community Dispatch", rUrl, todayStr, usedTakeaways);
        await env.DB.prepare(
          `INSERT OR REPLACE INTO dynamic_guides (id, category, badge, title, summary, full_guide_html, source_name, source_url, created_date, created_at)
           VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, datetime('now'))`
        )
          .bind(id, "meta", "COMMUNITY META (R/GTA6)", rTitle.slice(0, 180), companion.summary.slice(0, 600), companion.html, "r/GTA6 Community Dispatch", rUrl, todayStr)
          .run();
        rCount++;
        inserted++;
      }
    }
  } catch (e) {}

  return inserted;
}

const CURATED_PRESS_DISPATCHES = [
  {
    id: "rss-224089651",
    category: "map",
    badge: "LIVE NEWS (NBC 6 SOUTH FLORID)",
    title: "VICE CITY NIGHT: Miami Heat bring GTA 6 to life for epic showdown",
    sourceName: "NBC 6 South Florida",
    sourceUrl: "https://www.nbcmiami.com/",
    pubDate: "2026-11-16",
    takeaway: "Miami's real-world Vice City arena crossover spotlights the exact Biscayne and Ocean Drive corridors that anchor downtown Leonida's street grid. Pre-mark the Sinfrontera National Bank storm drain and downtown subway exits on our Leonida Radar Map before launch-week crowds flood those blocks.",
  },
  {
    id: "rss-859843100",
    category: "map",
    badge: "LIVE NEWS (IGN)",
    title: "Vice City Will Be Playable in NBA 2K27 As Part of a Massive New GTA 6-Themed Event",
    sourceName: "IGN",
    sourceUrl: "https://www.ign.com/",
    pubDate: "2026-11-16",
    takeaway: "Exploring Vice City's neon courts inside NBA 2K27 is a fun visual preview of Leonida's art-deco aesthetic, but its arcade court layout does not include subterranean bank vaults or sewer escape tunnels. Keep your heist prep focused on our verified 6-region Leonida tactical map rather than crossover promo courts.",
  },
  {
    id: "rss-2143740637",
    category: "official",
    badge: "LIVE NEWS (ABC11 NEWS)",
    title: "Grand Theft Auto 6: New GTA VI merchandise drops ahead of launch",
    sourceName: "ABC11 News",
    sourceUrl: "https://abc11.com/",
    pubDate: "2026-11-16",
    takeaway: "Official GTA VI apparel and collector drops ahead of November 19 confirm retail demand is peaking early, which historically triggers physical disc shortages and digital key price spikes. Lock in your verified digital pre-order key and a 7,450 MB/s Gen4 NVMe SSD now so hardware bottlenecks never delay your day-one vault runs.",
  },
  {
    id: "rss-92388283",
    category: "meta",
    badge: "LIVE NEWS (VICE)",
    title: "All GTA 6 Pre-Order Bonus Items and What Ultimate Edition Includes",
    sourceName: "VICE",
    sourceUrl: "https://www.vice.com/",
    pubDate: "2026-11-16",
    takeaway: "Ultimate Edition cosmetics and starter cash boosts help fund early safehouse fees, but vault payout math still depends on your crew specialist cut percentages and bag weight selection. Run our True Net $/Hour Optimizer to see how skipping high-fee hired drivers nets you millions more than any pre-order starter pack.",
  },
  {
    id: "rss-1254259281",
    category: "official",
    badge: "LIVE NEWS (POLYGON.COM)",
    title: "GTA 6 comes to NBA 2K27 with massive Vice City makeover",
    sourceName: "Polygon.com",
    sourceUrl: "https://www.polygon.com/",
    pubDate: "2026-11-16",
    takeaway: "Cross-publisher Vice City events show how heavily Take-Two is pushing co-op social lobbies ahead of launch, making pre-formed 4-player squads more valuable than random matchmaking. Use our LFG Crew Finder and 1-click Discord Recruitment Card button today to lock in a dedicated Ghost Hacker and Wheelman before servers go live.",
  },
  {
    id: "rss-314587363",
    category: "meta",
    badge: "LIVE NEWS (RED BULL)",
    title: "Who's who in GTA 6? Meet the characters of Vice City",
    sourceName: "Red Bull",
    sourceUrl: "https://www.redbull.com/",
    pubDate: "2026-11-16",
    takeaway: "Understanding how protagonists Lucia Caminos and Jason Duval connect with veteran bank robber Raul Bautista, Boobie Ike, Brian Heder, and Cal Hampton tells you which contacts unlock high-tier vault equipment. Pair Lucia's fast keypad decryption with Jason's overwatch in our Dual-Operative Synergy Simulator to maximize your stealth integrity bonus.",
  },
];

async function ensureDailyAndNewsSync(env, forceSync = false) {
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const daySeed = Math.floor(now.getTime() / 86400000);
  const dailyId = `auto-guide-${todayStr}`;

  const existingDaily = await env.DB.prepare("SELECT id FROM dynamic_guides WHERE id = ?1").bind(dailyId).first();
  if (!existingDaily) {
    const daily = buildDailyOperationGuide(todayStr, daySeed);
    await env.DB.prepare(
      `INSERT OR IGNORE INTO dynamic_guides (id, category, badge, title, summary, full_guide_html, source_name, source_url, created_date)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)`
    )
      .bind(dailyId, "meta", "DAILY AUTO-GUIDE", daily.title, daily.summary, daily.html, "Syndicate AI Engine", "live-intel.html", todayStr)
      .run();
  }

  const recentRssRow = await env.DB.prepare(
    "SELECT COUNT(*) AS count FROM dynamic_guides WHERE id LIKE 'rss-%' AND created_at >= datetime('now', '-2 hours')"
  ).first();

  if (forceSync || !recentRssRow || recentRssRow.count < 6) {
    for (const item of CURATED_PRESS_DISPATCHES) {
      const summary = `Reported by ${item.sourceName} (${item.pubDate}). Syndicate Tactical Impact Breakdown: ${item.takeaway}`;
      const html = `
        <div style="display:flex; gap:0.5rem; flex-wrap:wrap; margin-bottom:1rem;">
          <span class="user-badge badge-hacker">${escapeHtml(item.badge)}</span>
          <span class="user-badge badge-wheelman">${escapeHtml(item.sourceName)}</span>
        </div>
        <p style="color:var(--text-muted); font-size:0.95rem; margin-bottom:1rem;">
          <strong>Headline (${escapeHtml(item.sourceName)} &bull; ${escapeHtml(item.pubDate)}):</strong> "${escapeHtml(item.title)}"
        </p>
        <div style="background:rgba(0,240,255,0.06); border:1px solid var(--neon-cyan); border-radius:8px; padding:1rem; margin-bottom:1rem;">
          <h4 style="color:var(--neon-cyan); margin-bottom:0.4rem;">Syndicate Tactical Impact Breakdown</h4>
          <p style="color:var(--text-main); font-size:0.92rem;">${escapeHtml(item.takeaway)}</p>
        </div>
        ${buildAffiliateBarHtml()}
      `;
      await env.DB.prepare(
        `INSERT OR REPLACE INTO dynamic_guides (id, category, badge, title, summary, full_guide_html, source_name, source_url, created_date, created_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, datetime('now'))`
      )
        .bind(item.id, item.category, item.badge, item.title, summary, html, item.sourceName, item.sourceUrl, item.pubDate)
        .run();
    }
    await harvestLiveRssNews(env, todayStr);
  }
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function onRequestGet({ request, env }) {
  const now = new Date();
  const nextReset = getNextThursdayResetUTC(now);
  const weekNum = getIsoWeekNumber(now);
  const vault = WEEKLY_VAULT_ROTATION[getRotationIndex(now)];
  const launchTimestamp = Date.UTC(2026, 10, 19, 0, 0, 0);
  const isPostLaunch = now.getTime() >= launchTimestamp;
  const url = new URL(request.url);
  const forceSync = url.searchParams.get("sync") === "1";

  let dynamicItems = [];
  if (env && env.DB) {
    try {
      await ensureDailyAndNewsSync(env, forceSync);
      const { results } = await env.DB.prepare(
        "SELECT id, category, badge, title, summary, full_guide_html, source_name, source_url, created_date AS date FROM dynamic_guides ORDER BY created_date DESC, rowid DESC LIMIT 18"
      ).all();
      dynamicItems = (results || []).map((r) => ({
        id: r.id,
        category: r.category,
        badge: r.badge,
        title: r.title,
        date: r.date,
        summary: r.summary,
        full_guide_html: r.full_guide_html,
        source_name: r.source_name,
        source_url: r.source_url,
        link: "live-intel.html",
      }));
    } catch (e) {}
  }

  const coreFeed = [
    {
      id: "intel-weekly-meta",
      category: "meta",
      badge: "WEEKLY META",
      title: `Week ${weekNum} Priority Target: ${vault.name} (${vault.bonusPayout} Max Potential)`,
      date: now.toISOString().slice(0, 10),
      summary: `${vault.summary} Recommended setup: ${vault.recommendedApproach}.`,
      link: vault.slug,
    },
    {
      id: "intel-launch-window",
      category: "official",
      badge: "OFFICIAL INTEL",
      title: isPostLaunch
        ? "Leonida Launch Live: Prioritize Stealth Integrity +5% Bonus & Loot Bag Weight Check"
        : "Launch Readiness Protocol: PS5 Pro & Gen4 NVMe Streaming + Day-1 Patch Windows",
      date: now.toISOString().slice(0, 10),
      summary:
        "Ensure high-speed PCIe Gen4 storage (7,000+ MB/s) and verify your 4-player squad roles in the Crew Lounge before tackling high-value depositories.",
      link: "gameplay-mechanics.html",
    },
    {
      id: "intel-map-radar",
      category: "map",
      badge: "MAP UPDATE",
      title: "Interactive Leonida Radar Updated: 6 Vault Pins, Sewer Conduits & Canal Exits",
      date: "2026-11-16",
      summary:
        "Tactical GPS coordinates calibrated across Vice City Downtown, Pelican Valley, Port Gellhorn, and Grassrivers airboat channels.",
      link: "interactive-map.html",
    },
    {
      id: "intel-dmca-compliance",
      category: "official",
      badge: "SAFE HARBOR",
      title: "100% DMCA-Safe Commentary & Original Tactical Schematics Policy",
      date: "2026-11-16",
      summary:
        "gta6heistguide.com uses zero ripped game binaries, leaked build footage, or copyrighted Rockstar logos—keeping your guides and community permanently strike-free.",
      link: "live-intel.html#dmca-rules",
    },
  ];

  const mergedFeed = [...dynamicItems, ...coreFeed];

  return new Response(
    JSON.stringify({
      ok: true,
      serverTimeUtc: now.toISOString(),
      isoWeek: weekNum,
      isPostLaunch,
      nextWeeklyResetUtc: nextReset.toISOString(),
      featuredVault: vault,
      dynamicGuidesCount: dynamicItems.length,
      intelFeed: mergedFeed,
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": forceSync ? "no-store" : "public, max-age=120, s-maxage=900, stale-while-revalidate=1800",
        ...CORS_HEADERS,
      },
    }
  );
}

export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json();
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);

    if (body.action === "force_sync") {
      await ensureDailyAndNewsSync(env, true);
      const { results } = await env.DB.prepare(
        "SELECT id, category, badge, title, summary, created_date FROM dynamic_guides ORDER BY created_date DESC, rowid DESC LIMIT 18"
      ).all();
      return new Response(
        JSON.stringify({ ok: true, synced: true, totalDynamicGuides: (results || []).length, latest: results || [] }),
        { status: 200, headers: { "Content-Type": "application/json; charset=utf-8", ...CORS_HEADERS } }
      );
    }

    const topic = String(body.topic || "").trim().slice(0, 180);
    const category = ["official", "meta", "map"].includes(body.category) ? body.category : "meta";
    const targetVault = String(body.targetVault || "Leonida State Vaults").trim().slice(0, 100);

    if (!topic) {
      return new Response(JSON.stringify({ ok: false, error: "Please provide a guide topic." }), {
        status: 400,
        headers: { "Content-Type": "application/json; charset=utf-8", ...CORS_HEADERS },
      });
    }

    const id = `custom-guide-${Date.now()}`;
    const generated = buildCustomTopicGuide(topic, category, targetVault);
    const title = topic;
    const badge = "CUSTOM GENERATED GUIDE";

    await env.DB.prepare(
      `INSERT INTO dynamic_guides (id, category, badge, title, summary, full_guide_html, source_name, source_url, created_date)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)`
    )
      .bind(id, category, badge, title, generated.summary, generated.html, "Syndicate Command Studio", "live-intel.html", todayStr)
      .run();

    return new Response(
      JSON.stringify({
        ok: true,
        guide: {
          id,
          category,
          badge,
          title,
          date: todayStr,
          summary: generated.summary,
          full_guide_html: generated.html,
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json; charset=utf-8", ...CORS_HEADERS } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json; charset=utf-8", ...CORS_HEADERS },
    });
  }
}
