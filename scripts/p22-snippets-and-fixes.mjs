#!/usr/bin/env node
// Phase 22: High-CTR snippet optimization (Top 25 opportunities + major hubs + 4 near-duplicate pairs),
// legacy internal link cleanup, /map guide container polish, and targeted Top-25 content & community CTA upgrades.
// Idempotent.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pub = rel => path.join(root, 'public', rel);
const read = rel => fs.readFileSync(pub(rel), 'utf8');
const write = (rel, html) => fs.writeFileSync(pub(rel), html, 'utf8');
const esc = s => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');

// 1. Metadata updates (title + description + matching og:title/og:description where present)
const META_UPDATES = [
  ['heists/pawn-shops.html',
    'GTA 6 Pawn Shops: $2.5K–$6.5K Payouts, Unlock & Codes',
    'GTA 6 Pawn Shops robbery guide: unlocks in Chapter 2 after Coffee Break across 15 shops (including Fast Cash). $2.5K–$6.5K+ payouts, safe rules & fences.'],
  ['heists/vcia-takedown.html',
    'GTA 6 VCIA Takedown: $250K Payout & Airport Walkthrough',
    'Chapter 4 Story Heist #2 walkthrough for VCIA Takedown at Vice City International Airport: $250,000 payout, all 4 setups, stealth vs. loud & ATM deposits.'],
  ['heists/small-banks-payday-loans.html',
    'GTA 6 Small Banks & Payday Loans: 14 Banks & Jammer',
    'GTA 6 Small Banks & Payday Loans robbery guide (Ch. 3 after Credit Check): all 14 banks, Dye Pack Jammer unlock, Fast Cash safe rules & ATM banking tips.'],
  ['heists/armored-trucks-gang-ops.html',
    'GTA 6 Armored Trucks & 40 Gang Ops Robbery Guide',
    'How to intercept mobile Armored Cash Trucks and clear all 40 Gang Hideouts in GTA 6. Rear-door breach tips, contraband fencing, and physical ATM banking.'],
  ['heists/large-bank-vaults.html',
    'GTA 6 Large Bank Vaults: Story Heists & Vault Payouts',
    'GTA 6 Large Bank Vaults guide: how major bank heists work in Story Mode, Sinfrontera National Bank ($120K–$150K), VCIA Takedown & vault security systems.'],
  ['live-intel.html',
    'GTA 6 Live Launch Intel, Patch Notes & Dispatches',
    'GTA 6 launch status with last-verified date, build 01.002.001 notes, verified glitches, safe codes (7700), and real-time Leonida intel dispatches.'],
  ['gta-6-discoveries/index.html',
    'GTA 6 New Discoveries Hub: Verified Finds & Secrets',
    'Verified GTA 6 discoveries across Leonida: hidden mechanics, secret radio posters, safe codes (7700, 0420), Easter eggs, and how to submit your own find.'],
  ['gta-6-glitches/index.html',
    'GTA 6 Glitches & Patch Tracker: Working vs. Patched',
    'Live GTA 6 Glitch & Patch Status Tracker: Confirmed Working, Testing, Patched, and Unverified statuses by PS5/Xbox build, with safe slot-15 testing steps.'],
  ['missions/index.html',
    'GTA 6 Mission List: All 91–93 Missions by Chapter',
    'GTA 6 mission list by chapter: why PC Gamer counts 91 missions and Press Start 93, a spoiler-free checklist with saved progress, and missable cutoffs.'],
  ['gta-6-controls/index.html',
    'GTA 6 Controls Guide: PS5 & Xbox Button Bindings',
    'Searchable GTA 6 controller reference with a PS5/Xbox switch for sprint, phone, weapon wheel and driving, labeled by source quality and verified bindings.'],
  ['gta-6-troubleshooting/index.html',
    'GTA 6 Troubleshooting: Saves, Crashes & Bug Fixes',
    'Searchable GTA 6 troubleshooting center for PS5 and Xbox: saves, missing weapons, crashes, mission bugs, and installs with safe checks and source labels.'],
  ['gta-6-collectibles/index.html',
    'GTA 6 Collectibles & 100%: Flamingos, Cards & Stunts',
    'GTA 6 collectibles hub: required totals for Cocaine Flamingos, card sets, WAiNK scans, underwater finds, and stunts linked to the 100% tracker and map.'],
  ['gta-6-vehicles-guide/index.html',
    'GTA 6 Vehicle Guide: Trunk Storage, Classes & Spawns',
    'GTA 6 vehicle guide built on our 33-vehicle database: classes, trunk storage & duffel slots, reported spawn regions, customization, and getaway picks.'],
  ['gta-6-property-ownership/index.html',
    'Can You Buy Houses & Garages in GTA 6? Ownership FAQ',
    'GTA 6 ownership FAQ: houses, businesses, garages, and boats, all 4 story safehouses, the 7 fence contacts, and what you can actually buy in Story Mode.'],
  ['gta-6-tips-and-tricks/index.html',
    'GTA 6 Tips, Tricks & Hidden Mechanics (PS5 & Xbox)',
    'Searchable GTA 6 Tips & Tricks Hub: hidden features, vehicle controls, things the game never explains, secret locations, money tips, and verified finds.'],
  ['gta-6-endings-guide/index.html',
    'GTA 6 All 5 Endings Explained — How to Get the Best Ending',
    'Complete GTA 6 endings guide: all 5 endings in The End of the Road, how to unlock Two Years Later, Hot Together 4/4, and the $2,000,000 savings threshold.'],
  ['gta-6-relationship-guide/index.html',
    'GTA 6 Jason & Lucia Relationship Guide (Hot Together)',
    'Complete GTA 6 Jason & Lucia relationship guide: all 4 tiers up to Hot Together 4/4, 5 Coming Home errands, house repairs, dates, and Criminal Profile.'],
  ['gta-6-settings/index.html',
    'GTA 6 Settings, SSD Storage & HDR/VRR Hub (PS5/Xbox)',
    'Verified GTA 6 Settings & Hardware Hub for PS5, PS5 Pro & Xbox Series X|S: console calibration, 212 GB SSD rules, HDMI 2.1 HDR/VRR setup, and capture tips.'],
  ['save-planner/index.html',
    'GTA 6 15-Slot Save Planner — No Mission Replay Guide',
    'Interactive GTA 6 15-Slot Manual Save Planner: track all 15 save slots across 5 chapters, Chapter 1 Tourist Trap cutoff checklist, and missable trophies.'],
  ['gta-6-100-completion-tracker/index.html',
    'GTA 6 100% Completion Tracker & Interactive Checklist',
    'Interactive GTA 6 100% completion tracker with browser-saved progress: story missions, Strangers & Freaks, collectibles, stunts, and missable warnings.'],
  ['gta-6-tools/index.html',
    'GTA 6 Tools Hub: Map, Save Planner & Heist Calculators',
    'Free GTA 6 interactive tools: Leonida Map, 15-Slot Save Planner, Heist Payout Calculator, 100% Completion Tracker, Cheat Tracker, and Settings Hub.'],
  ['gta-6-database/index.html',
    'GTA 6 World Database: Weapons, Vehicles, Animals & Radio',
    'Searchable GTA 6 World Database covering 33 vehicles, 27 properties & fences, 24 gun stores, 170+ animals, weapons, and all 23 verified radio stations.'],
  ['safehouses-laundering.html',
    'GTA 6 Safehouses, Fences & Cash Laundering Guide',
    'Verified GTA 6 Story Mode safehouse and fence rules across Vice City, Leonida Keys, and Port Gellhorn, plus an interactive cash-flow & fee simulator.'],
  ['drops.html',
    'GTA 6 Twitch Drops & Launch Rewards Tracker',
    'Track official GTA 6 Twitch Drops, Kick Ultimate Edition giveaways, and Prime Gaming launch rewards with verified claim windows and anti-scam checks.'],
  ['giveaways.html',
    'GTA 6 Kick 10,000 Ultimate Edition Giveaway Tracker',
    'Track the Kick 10,000 GTA 6 Ultimate Edition giveaway, daily 3-hour Sunset Cases countdown, Prime Gaming claim windows, and anti-scam verification steps.'],
  // 4 Near-duplicate pairs (differentiated + tightened)
  ['properties/vice-city-story-safehouse-3.html',
    'Vice City Story Safehouse #3 (Ch. 3 Base) | GTA 6',
    'GTA 6 Chapter 3 Vice City Story Safehouse #3 guide: unlock timing, central Vice City base features, weapon locker, and quick access to jewelry & banks.'],
  ['properties/vice-city-story-safehouse-4.html',
    'Vice City Story Safehouse #4 (Ch. 4 Endgame) | GTA 6',
    'GTA 6 Chapter 4 Vice City Story Safehouse #4 guide: endgame unlock, full gun cabinet, heist planning board, linked garage bay, and late-game hub role.'],
  ['vehicles/pegassi-tempesta.html',
    'Pegassi Tempesta (Vice City Super) Specs | GTA 6',
    'Verified GTA 6 Pegassi Tempesta guide: Super-class spawn spots in Vice City, trunk stowage limits, handling profile, and high-speed heist escape role.'],
  ['vehicles/pegassi-zorrusso.html',
    'Pegassi Zorrusso (Vice Beach Super) Specs | GTA 6',
    'Where to find the Pegassi Zorrusso Super in GTA 6: verified Vice City & Vice Beach spawns, acquisition notes, trunk limits, and getaway tactics.'],
  ['vehicles/vapid-dominator.html',
    'Vapid Dominator (Muscle Getaway) Specs | GTA 6',
    'Verified GTA 6 Vapid Dominator Muscle car guide: Vice City, Port Gellhorn & Ambrosia spawns, trunk stowage specs, and early-game getaway performance.'],
  ['vehicles/vapid-riata.html',
    'Vapid Riata (4x4 Off-Road Pickup) Specs | GTA 6',
    'Where to find the Vapid Riata 4x4 pickup in GTA 6: Mount Kalaga, Grassrivers & Ambrosia spawns, trunk storage capacity, and off-road escape tactics.'],
  ['weapons/compact-tactical-smg.html',
    'Compact Tactical SMG: Stealth & Loadout | GTA 6',
    'Verified GTA 6 Compact Tactical SMG guide: concealment role, confirmed attachments, stealth robbery loadout pairing, and Ammu-Nation map pin.'],
  ['weapons/tactical-9mm-smg.html',
    'Tactical 9mm SMG: Attachments & Loadout | GTA 6',
    'Verified GTA 6 Tactical 9mm SMG guide: Ammu-Nation & Vice City Firearms locations, suppressor/red-dot/extended-mag builds, and heist loadout pairing.'],
];

let metaChanged = 0;
for (const [rel, title, desc] of META_UPDATES) {
  let h = read(rel);
  const orig = h;
  h = h.replace(/<title>[^<]*<\/title>/i, `<title>${esc(title)}</title>`);
  h = h.replace(/<meta\s+name="description"\s+content="[^"]*"/i, `<meta name="description" content="${esc(desc)}"`);
  h = h.replace(/<meta\s+property="og:title"\s+content="[^"]*"/i, `<meta property="og:title" content="${esc(title)}"`);
  h = h.replace(/<meta\s+property="og:description"\s+content="[^"]*"/i, `<meta property="og:description" content="${esc(desc)}"`);
  if (h !== orig) { write(rel, h); metaChanged++; }
}
console.log(`Updated metadata on ${metaChanged} pages.`);

// 2. Fix all legacy/redirecting internal links
const LINK_FIXES = [
  ['free/index.html', [
    ['href="/cash-guide" style="color:var(--neon-cyan); font-weight:700;">Safe Codes &rarr;</a>', 'href="/guides/gta-6-safe-codes" style="color:var(--neon-cyan); font-weight:700;">Safe Codes &rarr;</a>'],
    ['href="/cash-guide"', 'href="/gta-6-money-guide/"'],
    ['href="/compare/best-gtabase-interactive-map-alternative.html" class="btn btn-secondary" style="padding:0.45rem 0.85rem; font-size:0.78rem;">GTABase Map Alternative</a>', 'href="/map" class="btn btn-secondary" style="padding:0.45rem 0.85rem; font-size:0.78rem;">Interactive Leonida Map</a>'],
    ['href="/compare/best-gtaboom-heist-calculator-alternative.html" class="btn btn-secondary" style="padding:0.45rem 0.85rem; font-size:0.78rem;">GTA BOOM Calculator Alternative</a>', 'href="/heist-payout-calculator" class="btn btn-secondary" style="padding:0.45rem 0.85rem; font-size:0.78rem;">Heist Payout Calculator</a>'],
    ['href="/compare/best-mapgenie-leonida-map-alternative.html" class="btn btn-secondary" style="padding:0.45rem 0.85rem; font-size:0.78rem;">MapGenie Free Alternative</a>', 'href="/gta-6-tools/" class="btn btn-secondary" style="padding:0.45rem 0.85rem; font-size:0.78rem;">All Free GTA 6 Tools</a>'],
    ['href="/compare/sinfrontera-bank-vs-leonida-gold-reserve.html" class="btn btn-secondary" style="padding:0.45rem 0.85rem; font-size:0.78rem;">Sinfrontera vs Gold Reserve</a>', 'href="/heists/the-cartel-heist" class="btn btn-secondary" style="padding:0.45rem 0.85rem; font-size:0.78rem;">The Cartel Heist Guide</a>'],
    ['href="/guides/vice-city-vaults-storm-drains-guide.html"', 'href="/guides/vice-city-storm-drains-escape"'],
    ['href="/guides/megamundo-jammers-collectible-checklist.html"', 'href="/gta-6-collectibles/"'],
  ]],
  ['leonida-wanted-system.html', [['href="affiliates-gear.html"', 'href="/gta-6-settings/"']]],
  ['gameplay-mechanics.html', [['href="leonida-wanted-system.html"', 'href="/leonida-wanted-system"']]],
  ['crew-database.html', [['href="lucia-jason-skills.html#synergy-calculator"', 'href="/lucia-jason-skills#synergy-calculator"']]],
  ['gta-6-money-guide/index.html', [['/map.html?pin=', '/map?pin=']]],
  ['gta-6-tips-and-tricks/index.html', [['/map.html?pin=', '/map?pin=']]],
  ['gta-6-database/index.html', [['/map.html?pin=', '/map?pin=']]],
  ['gta-6-discoveries/index.html', [['/map.html?pin=', '/map?pin=']]],
  ['heist-planner.html', [['/map.html?pin=', '/map?pin=']]],
  ['live-intel.html', [['/map.html?pin=', '/map?pin=']]],
];
let linkFiles = 0;
for (const [rel, reps] of LINK_FIXES) {
  let h = read(rel);
  const orig = h;
  for (const [a, b] of reps) h = h.split(a).join(b);
  if (h !== orig) { write(rel, h); linkFiles++; }
}
console.log(`Fixed legacy internal links in ${linkFiles} files.`);

// 3. Polish /map #map-guide container styling so it sits cleanly centered below the full-height map
{
  let h = read('map.html');
  const oldTag = '<section class="tool-box" id="map-guide" style="margin:2rem 0 0;">';
  const newTag = '<section class="tool-box" id="map-guide" style="max-width:1100px; margin:2rem auto; padding:1.5rem;">';
  if (h.includes(oldTag)) { write('map.html', h.replace(oldTag, newTag)); console.log('Polished #map-guide container styling.'); }
}

// 4. Targeted Top-25 content upgrades + Scoped Community Discoveries submission callouts (idempotent)
function injectBeforeMainEnd(rel, name, html) {
  let h = read(rel);
  const start = `<!--p22:${name}-->`, end = `<!--/p22:${name}-->`;
  const block = `${start}\n${html}\n${end}`;
  const re = new RegExp(`${start}[\\s\\S]*?${end.replace('/', '\\/')}`);
  if (re.test(h)) h = h.replace(re, () => block);
  else {
    const idx = h.lastIndexOf('</main>');
    if (idx < 0) throw new Error('No </main> in ' + rel);
    h = h.slice(0, idx) + block + '\n' + h.slice(idx);
  }
  write(rel, h);
  console.log(`Injected ${name} -> ${rel}`);
}

// Rank 5: Fast Cash & Payday Loan Safe Codes direct-answer box on /heists/small-banks-payday-loans
injectBeforeMainEnd('heists/small-banks-payday-loans.html', 'fast-cash-answer', `
    <section class="tool-box" id="fast-cash-safe-code" style="margin:2rem 0 0;">
        <h2 style="color:#fff; font-size:1.3rem; margin:0 0 0.6rem;">Fast Cash &amp; Payday Loan Safe Code Rules</h2>
        <p style="color:#cbd5e1; line-height:1.65; margin:0 0 0.7rem;">
            Looking for a fixed <strong>Fast Cash safe code</strong>? Unlike fixed story safes (such as Brian&rsquo;s Lockup <code>7700</code>) or the 10 Gang-Op safes, <strong>Fast Cash pawn &amp; payday loan safes use randomized per-robbery combinations</strong>. Check the back-office desk note, register slip, or clerk prompt during the robbery rather than reusing a static number.
        </p>
        <p style="color:#cbd5e1; line-height:1.65; margin:0;">
            See our <a href="/guides/gta-6-safe-codes" style="color:var(--neon-cyan); font-weight:700;">Complete GTA 6 Safe Codes Database</a> for all 17 fixed combinations and our <a href="/heists/pawn-shops" style="color:var(--neon-cyan); font-weight:700;">Pawn Shops Guide</a> for Fast Cash Chapter 2 payouts.
        </p>
    </section>`);

// Rank 18: Link /guides/ultimate-edition-bonuses-guide from /weapons-bonuses
injectBeforeMainEnd('weapons-bonuses.html', 'ultimate-ed-link', `
    <section class="tool-box" id="ultimate-edition-gun-store" style="margin:2rem auto 0; max-width:1100px;">
        <h2 style="color:#fff; font-size:1.25rem; margin:0 0 0.55rem;">Ultimate Edition Weapons at Ammu-Nation</h2>
        <p style="color:#cbd5e1; line-height:1.65; margin:0;">
            Own the Ultimate Edition or Vintage Vice City Pack? Bonus firearms (including the Hawk &amp; Little Morgan Revolvers) unlock progressively starting in Chapter 2 after <em>Coffee Break</em> via any Ammu-Nation weapon locker. Check our <a href="/guides/ultimate-edition-bonuses-guide" style="color:var(--neon-cyan); font-weight:700;">Ultimate Edition Bonuses Unlock Guide</a> for every chapter milestone and pickup location.
        </p>
    </section>`);

// Rank 16 + Section 8: Port Gellhorn Landmarks & Nearby POIs + Contextual Community Discovery CTA
injectBeforeMainEnd('port-gellhorn.html', 'pgh-pois-and-submit', `
    <section class="g-section" id="port-gellhorn-landmarks" aria-labelledby="pgh-poi-h">
        <h2 id="pgh-poi-h">Port Gellhorn Landmarks &amp; Nearby POIs Quick Reference</h2>
        <p>Players searching Port Gellhorn frequently look for nearby county landmarks and rumored spots. Here is the verified status of each:</p>
        <ul>
            <li><strong>Port Gellhorn Shipyard &amp; Rusted Cargo Ship:</strong> Verified Chapter 2–3 loot zone with sealed shipping containers and Port SCOOP activity &mdash; see our <a href="/guides/port-gellhorn-shipyard-containers">Port Gellhorn Shipyard Containers Guide</a>.</li>
            <li><strong>Hamlet Prison (Neighboring Kelly County):</strong> Located just outside Port Gellhorn in Kelly County (site of the Chapter 1 opening) &mdash; see the <a href="/locations/hamlet-prison">Hamlet Prison Location Guide</a>.</li>
            <li><strong>Scrapyard, Cinema &amp; Sarenas / Transgressor Rumors:</strong> No separate verified heist vault or fixed safe code is confirmed at a Port Gellhorn scrapyard or cinema in launch Story Mode. For confirmed local vehicle &amp; parts spots, check <a href="/locations/watkins-auto-parts">Watkins Auto Parts</a> and <a href="/guides/port-gellhorn-pawn-and-payday">Port Gellhorn Pawn &amp; Payday Loans</a>.</li>
        </ul>
        <div class="pg-callout" style="margin-top:1rem;">
            <strong>Found a new Port Gellhorn container, safe, or landmark?</strong> <a href="/community-discoveries/submit/">Submit a Community Discovery</a> (reviewed by our editors before publication; pending submissions stay private).
        </div>
    </section>`);

// Section 8 scoped contextual submission CTAs on high-traffic discovery guides
const SUBMIT_CTA_GUIDE = `
    <section class="g-section" id="report-discovery-cta">
        <div class="pg-callout">
            <strong>Spotted a new code, secret, or correction?</strong> <a href="/community-discoveries/submit/">Submit a Community Discovery</a> &mdash; every submission is reviewed by a person before publication, labelled with its evidence level, and kept private while pending.
        </div>
    </section>`;
const SUBMIT_CTA_BOX = `
    <section class="tool-box" id="report-discovery-cta" style="margin:1.75rem auto 0; max-width:1100px;">
        <p style="color:#cbd5e1; margin:0; line-height:1.6;">
            <strong style="color:#fff;">Spotted a new GTA 6 secret or correction?</strong> <a href="/community-discoveries/submit/" style="color:var(--neon-cyan); font-weight:700;">Submit a Community Discovery &rarr;</a> Every submission is reviewed by an editor before publication and labelled with its evidence level; pending and rejected reports remain private.
        </p>
    </section>`;

injectBeforeMainEnd('guides/gta-6-safe-codes.html', 'submit-cta', SUBMIT_CTA_GUIDE);
injectBeforeMainEnd('secrets.html', 'submit-cta', SUBMIT_CTA_BOX);
