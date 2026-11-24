# GTA6HEISTGUIDE — PHASE 24: CONTENT QUALITY, CTR & INTERNAL-LINK AUTHORITY REPORT

- **Implementation Date:** November 24, 2026
- **Repository:** `C:\Users\Shawn\Desktop\gta6heistguide`
- **Production Domain:** `https://www.gta6heistguide.com`
- **Canonical Sitemap Scope:** `500` unique canonical URLs (`https://www.gta6heistguide.com/sitemap.xml`)
- **Branch Name:** `phase-24-content-ctr-internal-linking`
- **Starting Baseline Commit:** `60e90d4d218b4bfa5cfcb785add4bdd4b0dcdad4` (`60e90d4`)
- **Phase 24 Implementation Commit:** `f7e949fc335458a7e14be6d2a8e0f281e350dee5` (`f7e949f`)
- **Production Deployment Preview URL / ID:** `https://3ec0e6e9.gta6heistguide.pages.dev` (deployment hash `3ec0e6e9`)
- **Rollback Reference Deployment ID:** `2c5f52de-8315-4bbf-b652-1627851f563c` (`https://2c5f52de.gta6heistguide.pages.dev`, Phase 22 commit `cf8bb5a`) — preserved intact
- **Guardrails Preserved:** Zero D1 schema/data changes, zero Turnstile config changes, zero Cloudflare Access policy changes, zero community moderation/approval changes, zero secret/env/header/redirect/sitemap changes, zero pages deleted or noindexed, and all pre-existing untracked files preserved untouched.

---

## 1. Starting & Final Commit IDs, Branch & Changed-File Inventory

- **Starting Commit:** `60e90d4d218b4bfa5cfcb785add4bdd4b0dcdad4` (`main`)
- **Working Branch:** `phase-24-content-ctr-internal-linking`
- **Implementation Commit (Deployed):** `f7e949fc335458a7e14be6d2a8e0f281e350dee5` (`32` files changed, `+785 / -206` lines)
- **Changed-File Inventory (32 tracked files, all under `public/`):**
  1. `public/heist-planner.html`
  2. `public/gameplay-mechanics.html`
  3. `public/port-gellhorn.html`
  4. `public/weapons.html`
  5. `public/escape-routes.html`
  6. `public/heists/vcia-takedown.html`
  7. `public/heists/jewelry-stores.html`
  8. `public/weapons-bonuses.html`
  9. `public/vehicles.html`
  10. `public/guides/sinfrontera-national-bank.html`
  11. `public/heists/the-cartel-heist.html`
  12. `public/index.html`
  13. `public/gta-6-money-guide/index.html`
  14. `public/radio.html`
  15. `public/animals.html`
  16. `public/radio/kaleidoscope-fm.html`
  17. `public/radio/the-wipe-99-9.html`
  18. `public/radio/worldwide-fm.html`
  19. `public/radio/radio-on-u.html`
  20. `public/radio/stockyard-fm.html`
  21. `public/radio/honey-fm.html`
  22. `public/radio/afrobank-fm.html`
  23. `public/radio/symphony-fm.html`
  24. `public/radio/the-chamber-106-6.html`
  25. `public/radio/radio-la-ola.html`
  26. `public/radio/circoloco-records-radio.html`
  27. `public/radio/gloriana-blues-radio.html`
  28. `public/radio/leonida-jazz-radio.html`
  29. `public/assets/community/cd-submit.js`
  30. `public/guides/gta-6-safe-codes.html`
  31. `public/secrets.html`
  32. `public/gta-6-glitches/index.html`
- **Report File Added:** `PHASE-24-CONTENT-CTR-INTERNAL-LINKING-REPORT.md`

---

## 2. Every Affected Canonical & Functional URL (31 HTML Pages + 1 JS Module)

- Core hubs & tools: `/`, `/heist-planner`, `/gameplay-mechanics`, `/port-gellhorn`, `/weapons`, `/escape-routes`, `/weapons-bonuses`, `/vehicles`, `/gta-6-money-guide/`, `/radio`, `/animals`, `/secrets`, `/gta-6-glitches/`
- Heist & topical guides: `/heists/vcia-takedown`, `/heists/jewelry-stores`, `/heists/the-cartel-heist`, `/guides/sinfrontera-national-bank`, `/guides/gta-6-safe-codes`
- Radio station spokes (13): `/radio/kaleidoscope-fm`, `/radio/the-wipe-99-9`, `/radio/worldwide-fm`, `/radio/radio-on-u`, `/radio/stockyard-fm`, `/radio/honey-fm`, `/radio/afrobank-fm`, `/radio/symphony-fm`, `/radio/the-chamber-106-6`, `/radio/radio-la-ola`, `/radio/circoloco-records-radio`, `/radio/gloriana-blues-radio`, `/radio/leonida-jazz-radio`
- Community Discoveries submission frontend (`noindex`, non-sitemap): `/community-discoveries/submit/` (via `/assets/community/cd-submit.js`)

---

## 3. Before-and-After Title & Promotional Heading Hierarchy Changes

### 3.1 Promotional Heading Hierarchy Fixes

| Page | Before (Defect) | After (Phase 24 Fix) | Affiliate Links Preserved? |
|---|---|---|---|
| `/heist-planner` | First `<h2>` above calculator was `"Discounted Game Keys & Gaming Network Tools"`; lower `<h2>`/`<h3>` were `"Recording, Editing & Exporting Heist Gameplay Clips"` / `"CutFlow Pro — Offline Auto-Cut & Timeline Export"`. | Both partner blocks converted to styled `<aside>` elements with non-heading `<div>` titles positioned **after** the interactive calculator. Main heading outline is now strictly: `H1: Leonida Heist Planner & Cut Calculator` → `H2: Heist & Robbery Completion Tracker` → `H2: Configure Mission Parameters` → `H3: Hired Specialist Cut Allocation` → `H3: True Net $/Hour Optimizer & Grind Parameters`. | Yes (`G2A`, `ExitLag`, `CutFlow Pro` with `rel="sponsored noopener noreferrer"` & disclosure). |
| `/gameplay-mechanics` | Second `<h2>` was `"CONFIRMED HARDWARE & DISCOUNTED DIGITAL KEYS"` (plus 3 `<h3>` affiliate card headings) placed **before** the Character Switching and Survival/Activities guide sections. Also fixed an unclosed `<div>` on Card 4 and mismatched `#mechanics-fuel` jump anchor. | Partner hardware showcase moved to the bottom of `<main>` after `#phase13-mechanics-activities` as an `<aside>` with **0 heading tags** (`h1–h6` count = 0). Core mechanics cards and guide sections lead uninterrupted. | Yes (all 3 Amazon affiliate cards preserved with `rel="sponsored nofollow noopener"` & disclosure). |

### 3.2 Title Tag Refinements (Target `<= 58` Rendered Characters)

| URL | Before Title (Chars) | After Title (Chars) |
|---|---|---|
| `/heist-planner` | `GTA 6 Heist Planner & Payout Cut Calculator (Story & Banks)` (`59c`) | `GTA 6 Heist Planner & Payout Cut Calculator` (`43c`) |
| `/gameplay-mechanics` | `GTA 6 Heist Mechanics, Fuel and Weight \| GTA 6 Guide` (`52c`) | `GTA 6 Gameplay Mechanics: Fuel, Weight & Wanted AI` (`50c`) |
| `/port-gellhorn` | `Port Gellhorn Guide: Safe Codes, Fences, Banks & Map \| GTA 6` (`60c`) | `Port Gellhorn Guide: Safe Codes, Shipyard & Map \| GTA 6` (`55c`) |
| `/weapons` | `GTA 6 Weapons, Tactical Gear, Armor & Unique Variants Guide` (`59c`) | `GTA 6 Weapons, Plate Carriers & Tactical Gear Guide` (`51c`) |
| `/escape-routes` | `GTA 6 Sewers & Escape Routes: Confirmed Locations & Evasion` (`59c`) | `GTA 6 Sewers & Escape Routes: Verified Locations` (`48c`) |
| `/heists/vcia-takedown` | `GTA 6 VCIA Takedown: $250K Payout & Airport Walkthrough` (`55c`) | Kept (`55c` — already `<= 58c` and intent-aligned) |
| `/heists/jewelry-stores` | `GTA 6 Jewelry Stores Guide: 20 Locations, Payouts & Stealth` (`59c`) | `GTA 6 Jewelry Stores: 20 Locations & Payout Guide` (`49c`) |
| `/weapons-bonuses` | `GTA 6 Gun Stores Directory: All 24 Ammu-Nation & Armory Pins` (`60c`) | `GTA 6 Gun Stores: All 24 Ammu-Nation Locations` (`46c`) |
| `/vehicles` | `GTA 6 Vehicles Database: 33 Cars, Boats, Aircraft & Compare` (`59c`) | `GTA 6 Vehicles Database: 33 Cars & Trunk Storage` (`48c`) |
| `/guides/sinfrontera-national-bank` | `Sinfrontera National Bank Vault Layout & Security Guide \| GTA 6` (`63c`) | `Sinfrontera National Bank: Building, Vault & Free-Roam` (`54c`) |
| `/heists/the-cartel-heist` | `GTA 6 The Cartel Heist: $120K–$150K Payout & Walkthrough` (`56c`) | `GTA 6 The Cartel Heist: Mission #71 Walkthrough & Payout` (`56c`) |

*(Also fixed the duplicate `"Radio Radio Station Guide"` wording in `<title>` on `/radio/circoloco-records-radio`, `/radio/gloriana-blues-radio`, and `/radio/leonida-jazz-radio`.)*

---

## 4. Above-the-Fold Quick Answers Added & Source Verification

All seven pages now lead with visible, semantic HTML quick-answer blocks and mobile-responsive (`overflow-x:auto`) tables with `<th scope="col">` headers and zero JavaScript dependencies:

| Page | Above-the-Fold Addition | Source Evidence & Verification Decisions |
|---|---|---|
| `/port-gellhorn` | `#quick-answers` 3-row table covering **What Port Gellhorn Is**, **Shipyard & Docks**, and **Rusted Cargo Ship**. | Verified against existing `/port-gellhorn` corroborated content (`0300`, `6823`, `6969`; Brooks Boatworks; SCOOP containers requiring Cut-Off Tool from Ch. 3 *Meet the Heders*; debunked "$8.2M Pier 4 crane heist"). Rusted cargo ship secret vault explicitly labelled **UNVERIFIED**. |
| `/weapons` | `#weapons-quick-answers` 2-row table covering **Polymer vs. Metal Rounds** and **Plate Carriers & Body Armor**. | Verified against existing `/weapons` FAQ & schema: explicitly labels a dedicated polymer-vs-metal swap system and specialty ballistic multipliers as **Unconfirmed** in Story Mode; summarizes reported plate carrier purchase (~$250 at gun stores), inventory tab management, and trunk/safehouse storage as **Reported**. |
| `/escape-routes` | `#sewers-quick-table` 3-row table inside `#gta-6-sewers` summarizing **Hamlet Sewage Treatment Plant** (Corroborated), **Lawton Co. Paper Mill Drainage Passage** (Community-Reported), and **Vice City Connected Storm-Drain Network** (Unverified). | Verified against `GTA6-CONTENT-SOURCE-REGISTER.md` & existing `/escape-routes` text. **No map coordinates invented:** every row explicitly states that exact coordinates are not yet verified in the source register. |
| `/heists/vcia-takedown` | Expanded `.quick-answer-box` with a 3-row **Stealth vs. Loud & Reported Payout** table. | Clearly distinguishes corroborated mission structure (Chapter 4 Story Heist #2, 4 setups, stealth roof infiltration delaying 4-star tarmac lockdown vs. loud immediate lockdown) from the **$250,000 story score figure**, which is explicitly labelled **Reported / Unverified by Rockstar**. |
| `/heists/jewelry-stores` | Expanded `.quick-answer-box` with a 3-row **Payout Range, Unlock & Fence** table. | **Evidence-gap decision:** `$15K–$35K` is **not** supported by `GTA6-CONTENT-SOURCE-REGISTER.md` or existing site data (which reports `$10,000–$25,000` per standard store). Per Phase 24 rules, `$15K–$35K` was omitted rather than fabricated, and the `$10,000–$25,000` figure is explicitly labelled as a *community-reported, variable range* (not guaranteed) depending on boutique tier, safe contents, and fencing with Yasmani in Little Cuba. |
| `/weapons-bonuses` | `#static-gun-stores-table` static HTML table listing **all 24 verified gun stores** (#, Store Name, County, Store Type, Inventory Tier, Services, Map Pin link). | Every row verified 1:1 against `public/data/gun-stores.json` (`24/24` complete records, `0` missing fields: 14 Vice-Dale, 5 Mariana, 3 Kelly, 1 Leonard, 1 Lummox). Zero JS required for crawlers or mobile readers. |
| `/vehicles` | `#vehicle-trunk-storage-table` concise 5-row class-level **Vehicle Trunk & Cargo Storage** table linking to verified `/vehicles/*` pages. | Built strictly from `public/data/vehicles.json` (`33` vehicles across 7 classes): explicitly separates **Reported** (SUVs & Pickups 4+ slots), **Confirmed** (Motorcycles: no car trunk; Crest Kayak: bow dry-hatch), and **Not yet confirmed** (exact slot counts for Muscle/Sports/Super, boats, aircraft). Zero invented speeds or slot numbers. |

---

## 5. Sinfrontera Content Differentiation

- **`/guides/sinfrontera-national-bank`** (refocused strictly as the **Vice City Bank Building, Vault & Free-Roam POI Guide**):
  - New title (`54c`): `Sinfrontera National Bank: Building, Vault & Free-Roam`
  - Removed the duplicated 5-setup walkthrough list, duplicated `$120,000–$150,000` payout breakdown, duplicated *Break the Bank* achievement mention, and duplicated payout FAQ.
  - Added distinct building-level sections (`Building & Free-Roam Profile`, `Interior Zones & Vault Floorplan` covering Lobby / Mezzanine & Roof / Basement Vault Corridor / Street & Freeway Exit, `Vault Security & Communications Blackout Window`, and `Can You Rob Sinfrontera Bank in Free Roam?` with repeatable free-roam bank alternatives).
  - Updated `Article` and `FAQPage` JSON-LD to match building/vault/free-roam intent, with a clear top link to `/heists/the-cartel-heist` for Story Mission #71 walkthrough readers.
- **`/heists/the-cartel-heist`** (focused strictly as the **Story Mission #71 Walkthrough & Payout Guide**):
  - New title (`56c`): `GTA 6 The Cartel Heist: Mission #71 Walkthrough & Payout`
  - Differentiated opening summary centered on Story Mission #71, Raul Bautista's 5 setups, 10-step tactical execution, Professional rating, and reported payout breakdown, with one contextual cross-link to `/guides/sinfrontera-national-bank` for building floorplan / free-roam revisit checks.
- **Preservation:** Both canonical URLs preserved (`index, follow`); neither page deleted or noindexed; no forced reindexing claims made. *(Note: raw 4+ char main-text token Jaccard measures `0.276` due to shared core entity terms like `sinfrontera`, `national`, `bank`, `vault`, `vice`, `city`, `freeway`, `lobby`, while all structural duplication of setups, payout math, and FAQs has been eliminated.)*

---

## 6. Internal-Link Authority Matrix (8 Strongest Confirmed-Indexed Hubs → Phases 6–20)

All 8 source hubs were selected from Phase 23 GSC evidence (confirmed indexed via `Nov 16–22` Performance or `Nov 24` URL Inspection). Every destination URL was verified against `public/sitemap.xml` (`500` canonicals):

| Source Hub (Phase 23 Indexed Evidence) | Destination Page (Phase 6–20) | User-Intent Connection | Anchor Text |
|---|---|---|---|
| `/` (`6` clicks / `1,013` impr) | `/missions/prologue` | Story Mode Mission #1 starting walkthrough | Story Mission #1: Prologue Walkthrough |
| `/` | `/missions/day-release` | High-demand yacht mission (`113` impr) | Day Release (Yacht Mission) Walkthrough |
| `/` | `/guides/cocaine-flamingos-locations` | 125-collectible 100% completion guide | All 125 Cocaine Flamingos Locations |
| `/` | `/guides/ultimate-edition-bonuses-guide` | Ultimate Edition weapon & garage unlocks | Ultimate Edition Bonuses Unlock Guide |
| `/` | `/guides/bank-vault-hacking-guide` | Bank vault keypads & security bypass | Bank Vault Hacking & Security Bypass Guide |
| `/port-gellhorn` (`19` clicks / `5,250` impr) | `/missions/checking-out` | Ch. 2 finale ($15K cutoff before leaving motel) | Checking Out (Chapter 2 Finale) Walkthrough |
| `/port-gellhorn` | `/missions/moses` | Unlocking Moses & WAiNK car sales | Moses Mission & Vehicle Buyer Walkthrough |
| `/port-gellhorn` | `/missions/slam-dunk` | Unlocking Dunk's Trailer fence | Slam Dunk (Dunk Fence Unlock) Walkthrough |
| `/port-gellhorn` | `/guides/chapter-2-15000-money-guide` | Earning $15,000 in Chapter 2 | Chapter 2 $15,000 Money Guide |
| `/port-gellhorn` | `/locations/hamlet-prison` | Kelly County prison POI near Port Gellhorn | Hamlet Prison (Kelly County) Location Guide |
| `/escape-routes` (`5` clicks / `599` impr) | `/locations/grassrivers` | Swamp airboat escape terrain & Pelican Valley | Grassrivers Wetlands & Swamp Corridors |
| `/escape-routes` | `/missions/day-release` | Offshore yacht mission & sea extraction | Day Release Yacht Mission & Sea Extraction |
| `/escape-routes` | `/guides/stunt-jumps-locations` | High-speed elevation breaks & jumps | Stunt Jumps Locations Across Leonida |
| `/heists/vcia-takedown` (`4` clicks / `375` impr) | `/locations/vice-city-international-airport` | VCIA airport perimeter & terminal POI | Vice City International Airport (VCIA) Guide |
| `/heists/vcia-takedown` | `/missions/close-surveillance` | Setup #1 camera blind-spot scouting | Close Surveillance (Setup #1) Walkthrough |
| `/heists/vcia-takedown` | `/guides/bank-vault-hacking-guide` | Endgame Large Bank Vaults unlocked next | Bank Vault Hacking & Security Guide |
| `/heists/jewelry-stores` (`2` clicks / `266` impr) | `/missions/yasmanis-jewelry-jobs` | Ch. 3 unlock mission & Snap Gun reward | Yasmani's Jewelry Jobs Walkthrough |
| `/heists/jewelry-stores` | `/guides/jewelry-and-pawn-farming-loop` | Chaining jewelry stores & pawn shops | Jewelry & Pawn Shop Farming Loop |
| `/heists/jewelry-stores` | `/guides/fence-payout-comparison` | Comparing Yasmani vs. other Leonida fences | Leonida Fence Payout Comparison |
| `/weapons` (Indexed `Nov 24`, receiving `908` impr 301s) | `/guides/weapon-attachments-and-ammo` | Suppressors, optics & hunting calibers | Weapon Attachments & Ammo Guide |
| `/weapons` | `/guides/weapon-trunk-storage-system` | Trunk weapon & armor stowage mechanics | Vehicle Trunk Weapon Storage System |
| `/weapons` | `/guides/hidden-weapon-stashes` | Free world weapons & missable variants | Hidden Weapon Stashes & Free Pickups |
| `/weapons` | `/guides/50-weapons-100-percent` | Tracking 50 of 66 weapons for 100% | 50 Weapons for 100% Completion Guide |
| `/gta-6-money-guide/` (`1` click / `61` impr + `490` impr 301) | `/guides/underwater-treasure-money` | Sunken Leonida Keys salvage caches | Underwater Treasure & Salvage Money Guide |
| `/gta-6-money-guide/` | `/guides/bank-vault-hacking-guide` | Free-roam & story bank vault prep | Bank Vault Hacking & Security Guide |
| `/gta-6-money-guide/` | `/guides/kenton-shipwreck-sets` | 5-of-7 shipwreck sets & salvage payouts | Kenton Shipwreck Sets Guide |
| `/radio` (`6` clicks / `264` impr, `2.27%` CTR) | `/guides/vice-city-nightlife-encounters` | Nightlife venues & secret radio posters | Vice City Nightlife & Secret Radio Posters |
| `/radio` | `/guides/collectible-card-sets` | 15-of-18 card sets while cruising Leonida | All 18 Collectible Card Sets Guide |
| `/radio` | `/guides/kenton-shipwreck-sets` | Coastal exploration collectibles | Kenton Shipwreck Sets Guide |

- **Destination Link Totals Added:** `27` new curated Phase 6–20 contextual links across the 8 hubs (`2` of the 5 Port Gellhorn candidates were already linked on `/port-gellhorn` and left deduplicated) + **`23`** static `/radio/*` directory links on `/radio` + **`24`** static `/animals/*` directory links on `/animals` + genre-peer links across the `13` thin radio spokes (`+171` total internal links across the site in `seo-audit.mjs`: `23,725 → 23,896`).

---

## 7. `/radio` & `/animals` Static Directories

- **`/radio` (`#static-radio-directory`):** Added a static, mobile-responsive HTML table (`overflow-x:auto`, `<th scope="col">`) right below `<header>` linking to all **23 verified `/radio/*` station guides** with dial frequency, genre, host/DJ, DMCA streamer status, and verified sample tracks from `public/data/radio.json`. Zero invented stations or tracks.
- **`/animals` (`#static-animals-directory`):** Added a static, mobile-responsive HTML table linking to all **24 `/animals/*` wildlife guides**, explicitly ordered and labelled into:
  1. **7 Verified GTA VI In-Game Species** (`alligator`, `dolphin`, `florida-panther-cougar`, `green-iguana`, `lionfish`, `sea-turtle`, `snake`) — backed by official in-game screenshots, counting toward the 100-animal study goal.
  2. **13 Species Guides with Real-World Reference Photos** — explicitly noted as *not* in-game screenshot proof.
  3. **4 GTA VI Presence Unconfirmed Reference Profiles** (`beaver`, `osprey`, `red-fox`, `white-river-otter`) — explicitly marked unconfirmed.
  - Includes a prominent disclaimer above the table: *"Real-world reference photographs are included for species identification only and are not proof of in-game GTA VI appearance."*

---

## 8. Improvements to the 13 Thin `/radio/*` Spokes & Remaining Evidence Gaps

All 13 shortest `/radio/*` pages (which sat at `354–399` words in Phase 21 and `373–430` `<main>` words post-Phase-22) were enriched individually with a distinct `#p24-station-context` section ("Broadcast Context, Tuning & Tracklist Verification Scope") grounded strictly in `public/data/radio.json` (frequency, host/DJ, genre context, wireless-earbuds on-foot tuning, distinction from the 34-track companion album, DMCA-safe vs. licensed-music streaming advice, and genuine genre-peer links):

| Radio Spoke | Main Words Before | Main Words After | Key Source-Supported Additions |
|---|---:|---:|---|
| `/radio/kaleidoscope-fm` | `373w` | `539w` | Jeremy Irons (DJ Dicky) international pop/Euro disco context, earbuds tuning, DMCA guidance, links to Flash FM / Vice City FM / Stockyard FM |
| `/radio/the-wipe-99-9` | `378w` | `536w` | DMCA-safe talk status (one of 2 safe channels alongside WKTT 100.3 AM), tuning & streamer guidance |
| `/radio/worldwide-fm` | `395w` | `556w` | Gilles Peterson UK jazz/soul/global club context, links to Leonida Jazz Radio & Radio On-U |
| `/radio/radio-on-u` | `396w` | `546w` | Adrian Sherwood dub/reggae sound-system context, links to Worldwide FM / AfroBank FM / Radio La Ola |
| `/radio/stockyard-fm` | `396w` | `549w` | The Dare & PinkPantheress indie sleaze/electroclash context, links to CircoLoco / Kaleidoscope / Flash FM |
| `/radio/honey-fm` | `398w` | `551w` | TLC & Craig David 90s R&B/neo-soul context, links to Worldwide FM / Gloriana Blues / VCRR |
| `/radio/afrobank-fm` | `399w` | `548w` | Burna Boy & Jay Donaldson Afrobeats/Amapiano context, links to Radio On-U / Cocoteo FM / Worldwide FM |
| `/radio/symphony-fm` | `404w` | `549w` | Yuja Wang orchestral classical & film-score context, links to Leonida Jazz Radio & Worldwide FM |
| `/radio/the-chamber-106-6` | `407w` | `555w` | Kerry King & Tom Araya thrash/hardcore context vs. V-Rock, links to V-Rock & Back Country Radio |
| `/radio/radio-la-ola` | `413w` | `570w` | Gloria & Emilio Estefan classic salsa/mambo context vs. Cocoteo FM, links to Cocoteo FM & AfroBank FM |
| `/radio/circoloco-records-radio` | `426w` | `577w` | Seth Troxler & Antonio D'Amico deep house/Ibiza techno context + fixed duplicate title word |
| `/radio/gloriana-blues-radio` | `427w` | `589w` | Buddy Guy & Keith Richards Delta blues/Southern soul context + fixed duplicate title word |
| `/radio/leonida-jazz-radio` | `430w` | `587w` | Randy Brecker & Stanley Clarke jazz fusion/bebop/funk context + fixed duplicate title word |

- **Remaining Evidence Gap (Reported Explicitly):** Full complete in-game station playlists beyond the `3–5` verified highlight tracks per station in `public/data/radio.json` are not yet independently verified. Rather than inventing unverified song lists or DJ quotes, each spoke explicitly documents that only verified `radio.json` highlight entries are listed.

---

## 9. Community Discoveries Frontend-Only Changes & Security Verification

- **Implemented (`public/assets/community/cd-submit.js`):**
  - Added `applyAllowlistedPrefill()` reading `?category=...&region=...` via `URLSearchParams`.
  - Validates `category` against the exact 11-item allowlist (`hidden_location`, `easter_egg`, `collectible`, `rare_vehicle`, `wildlife`, `weapons_equipment`, `mission_tip`, `side_activity`, `money_method`, `map_correction`, `general`) and `region` against the exact 9-item allowlist (`Vice City`, `Vice Beach`, `Grassrivers`, `Leonida Keys`, `Mt. Kalaga`, `Port Gellhorn`, `Lake Leonida`, `Ambrosia`, `Other / not sure`).
  - Safely ignores invalid/unknown/XSS values; never injects raw query parameters into HTML; opens `#cdMore` only when a valid `region` is preselected.
  - Preserves Turnstile verification, client + server validation, and honeypot/CSRF protections untouched.
- **Contextual CTA Links Updated:**
  - `/port-gellhorn` → `/community-discoveries/submit/?category=hidden_location&region=Port%20Gellhorn`
  - `/guides/gta-6-safe-codes` → `/community-discoveries/submit/?category=money_method`
  - `/secrets` → `/community-discoveries/submit/?category=easter_egg`
  - `/gta-6-glitches/` → `/community-discoveries/submit/?category=general`
- **Explicit Gating Decision:** Both the optional public `/map` Community Verified Pins layer and the `related_guides` discovery callout module remain **GATED and unimplemented** because `/api/community-discoveries/list` (`total: 0`) and `/api/community-discoveries/map-pins` (`total_pins: 0`) currently have **0 approved discoveries**. Neither will be enabled until at least one discovery is approved through `/cd-admin/` and verified end-to-end.

---

## 10. Full Test & Verification Output

| Suite / Check | Command | Baseline | Phase 24 Result |
|---|---|---|---|
| Security & Unit Tests | `node tests/community-discoveries.test.mjs` | `73 / 73` | **PASS — `73 / 73` passed, `0` failed** |
| HTTP Smoke & Fail-Closed Tests | `node tests/http-smoke.mjs http://127.0.0.1:8799 --closed` | `13 / 13` | **PASS — `13 / 13` passed** |
| Local Routing & Cache-Control | `node scripts/phase22-routing-test.mjs http://127.0.0.1:8799` | `47 / 47` | **PASS — `47 / 47` passed, `0` failures** |
| Live Production Routing & Cache-Control | `node scripts/phase22-routing-test.mjs https://www.gta6heistguide.com` | `47 / 47` | **PASS — `47 / 47` passed, `0` failures** |
| SEO & Asset Crawl Audit | `node scripts/seo-audit.mjs` | `0` fatal, `0` warn | **PASS — `0` fatal errors, `0` warnings** (`335` primary HTML, `337` JSON-LD blocks, `500` sitemap canonicals, `1,136` `<img>`, `23,896` internal links) |
| JS Syntax Check | `node --check public/assets/community/cd-submit.js` + `functions/**/*.js` | `0` errors | **PASS — `0` syntax errors** |
| Cloudflare Pages Functions Build | `npx wrangler pages functions build functions` | Compiled | **PASS — Compiled Worker successfully** |
| Sitemap & Canonical Parity | `public/sitemap.xml` | `500` unique canonicals | **PASS — `500` total, `500` unique canonical URLs** |
| Live Community Discoveries / Access Gate | `curl` on `/api/community-discoveries/{config,list,map-pins}` + `/cd-admin/` | Fail-closed, `0` leaks | **PASS — Turnstile active (`submissionsOpen: true`), `total: 0`, `total_pins: 0`, `/cd-admin/` `302` → Cloudflare Access (`private, no-store`)** |

---

## 11. Desktop (`1280×800`) & Mobile (`390×844`) Browser QA Results

Verified in live browser against `http://127.0.0.1:8799` across all key modified pages:
- **`/heist-planner`:** Calculator leads above the fold; 0 promotional `<h2>` tags above calculator; partner blocks at bottom as `<aside>`; Desktop `1264.8 / 1280`, Mobile `375.2 / 390` (0px horizontal overflow); `0` console errors.
- **`/gameplay-mechanics`:** Core mechanics `H2` leads at `y=271.35`; partner hardware `<aside>` at bottom (`y=3622.15`) with `0` heading tags; 0px horizontal overflow on desktop & mobile; `0` console errors.
- **`/port-gellhorn`, `/weapons-bonuses`, `/vehicles`, `/radio`, `/animals`, `/guides/sinfrontera-national-bank`:** All static quick answers and HTML tables rendered visibly; mobile tables scrolled cleanly inside their `overflow-x:auto` wrappers with **0 page-level horizontal overflow** (`375.2 / 390`) and **`0` console errors**.
- **`/community-discoveries/submit/?category=hidden_location&region=Port%20Gellhorn`:** `category` preselected to `hidden_location`, `region` preselected to `Port Gellhorn`, `#cdMore` opened cleanly; `0` console errors.
- **`/community-discoveries/submit/?category=%3Cscript%3Ealert(1)%3C/script%3E&region=FakeRegion`:** Invalid values safely ignored (`category=''`, `region=''`, `#cdMore` closed), no dialog triggered, no script text injected, `0` console errors.

---

## 12. Search Console Measurement Rules Preserved

- **Sitemap Discovery vs. Indexing:** `500` URLs discovered via `/sitemap.xml` on **November 24, 2026** is discovery status only — **not** indexing status.
- **Confirmed Indexed Floor:** `35` confirmed canonical URLs is a verified minimum from GSC Performance (`Nov 16–22`) + URL Inspection (`Nov 24`), not the complete indexed inventory; `5` URL Inspection samples from Phases 6–20 do not prove all `443` Phase 6–20 URLs are unindexed.
- **Pre-Deployment Baseline Preserved (`Nov 16–22, 2026`):** `147` clicks, `15,887` impressions, `0.9%` CTR, `7.7` average position. These figures predate Phases 20, 22, and 24 and are **not** attributed to these deployments. Identical clamped 7d/28d/90d ranges are never compared as separate periods.
- **Next Clean Evaluation Window:** **November 25 – December 1, 2026** (first complete 7-day post-Phase-22/24 window).

---

## 13. Deployment Details & Rollback Reference

- **Cloudflare Pages Project:** `gta6heistguide`
- **Deployed Production URL:** `https://www.gta6heistguide.com` (preview alias `https://3ec0e6e9.gta6heistguide.pages.dev`)
- **Uploaded Files:** `32` changed files (`1,598` already uploaded), plus `_headers`, `_redirects`, and compiled Functions bundle.
- **Rollback Reference:** Prior Phase 22 production deployment `2c5f52de-8315-4bbf-b652-1627851f563c` (`https://2c5f52de.gta6heistguide.pages.dev`, commit `cf8bb5a`) remains intact in Cloudflare Pages for instant one-click rollback if ever needed.

---

## 14. Next Highest-Value Opportunities

1. **First Clean Post-Deployment GSC Check (`Dec 1–2, 2026`):** Export the `Nov 25 – Dec 1` 7-day window to measure CTR lift on `/port-gellhorn`, `/weapons`, `/escape-routes`, `/heist-planner`, `/gameplay-mechanics`, `/weapons-bonuses`, `/heists/vcia-takedown`, and `/heists/jewelry-stores`, and re-inspect `/heists/the-cartel-heist` once after `/sinfrontera-bank` 301 consolidation settles.
2. **Track Phase 6–20 Crawl Conversion:** Monitor indexing uptake on `/missions/prologue`, `/missions/day-release`, `/guides/cocaine-flamingos-locations`, `/guides/ultimate-edition-bonuses-guide`, and `/radio/*` + `/animals/*` spokes now receiving direct hub-to-spoke link equity.
3. **Approve First Community Discovery Before Ungating Map Layer:** Once an authentic player discovery is approved and published via `/cd-admin/`, verify its live API payload and then implement the gated opt-in `/map` layer and `related_guides` callout module.
4. **Tighten Remaining High-Impression Titles Only as Data Arrives:** Use the `Dec 1` GSC export to target only pages accruing real impressions rather than mass-editing untouched long-tail pages.
