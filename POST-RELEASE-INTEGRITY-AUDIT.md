# GTA6HeistGuide — Post-Release Accuracy, SEO & Monetization Integrity Audit (Phase 49)

**Audit Date:** November 27, 2026  
**Branch / Worktree:** `phase-49-post-release-integrity-audit` (`C:\Users\Shawn\.gemini\antigravity\scratch\phase-49-post-release-integrity-audit`)  
**Production Baseline:** `e3a02b3e4f6151a183c202e3563fba7f6a04d115` (`main` / `origin/main`)  
**Preview Deployment:** `4671678a-d9bd-4f54-b0b5-094db21de01d` (`https://4671678a.gta6heistguide.pages.dev`)  
**Final Verdict:** **COMPLETE — READY FOR OWNER RELEASE REVIEW** *(Production untouched; isolated Preview verified end-to-end across all automated suites, 502/502 sitemap URLs, and 6-viewport Playwright QA.)*

---

## 1. Production Baseline Confirmation

All mandatory production baseline coordinates were verified before and after all audit activity and remain **100% untouched**:

| Baseline Control | Verified Value | Status |
|---|---|---|
| GitHub `main` & `origin/main` SHA | `e3a02b3e4f6151a183c202e3563fba7f6a04d115` | Untouched (`git rev-parse main === origin/main === ls-remote`) |
| Cloudflare Production Deployment ID | `e1aeb579-5a3e-409e-95b5-2ae3150fe4c0` | Active Production (`https://e1aeb579.gta6heistguide.pages.dev`) |
| Production Domain | `https://www.gta6heistguide.com` | Live & SHA-256 parity verified across 9 core assets |
| Production Asset Count (Release Report) | `1,849` assets | Verified; Preview adds `+1` (`canonical-gameplay-facts.json`) = `1,850` |
| Phase 35.1C Homepage Amazon Pause | `enableAmazonProductPlacements: false` | Preserved (`0` visible Amazon cards on `/`) |
| Consent Mode v2 & Cloudflare Controls | Default `analytics_storage: 'denied'`; Access on `/api/cd-admin/*`; fail-closed `.md` 404 | Preserved and verified via read-only probes |
| Existing Git Worktrees | All 10 prior worktrees + new Phase 49 worktree (`11` total) | Preserved intact |

---

## 2. Every Factual Inconsistency Discovered

### A. Heist Planner, Payout Calculator & Free Tools — Unsupported Multiplayer & Pre-Launch Fiction
1. **`/heist-planner` (`public/heist-planner.html`) & `/heist-payout-calculator` (`public/heist-payout-calculator.html`):**
   - Represented unannounced GTA VI Online multiplayer concepts as live gameplay: *Player Squad Size (Co-op 1–4 Players)*, *2P / 3P / 4P Grab Calculations*, *Public Lobby Restart / Fail Penalty*, *1.5X Weekly Featured Vault Bonus*, and *Hired Specialist Cut Percentages (Gunner/Hacker/Driver)* feeding directly into primary Story Mode payout totals.
   - Contained pre-launch fictional bag values (`$4,200,000` Diamonds, `$5,100,000` Gold, `$1,850,000` Cash) and inflated Jewelry Store range (`$15,000–$35,000`).
   - Lacked *Operation Savage Glory (Coast Guard Raid)* (`$50,000`) in the Story Mode target selector.
2. **`/free/` (`public/free/index.html`):**
   - Tool 1 (*Heist Payout Calculator*) included Co-op Squad Size, `1.5X Weekly Featured Event`, `+5% Stealth Bonus`, and pre-rendered static SSR placeholder `$26,250,000` / `$4,331,250`.

### B. Jewelry Store Payout & Timing Discrepancies
3. **Contradictory Jewelry Store Payout Ranges Across 6 Files:**
   - Dedicated guide (`/heists/jewelry-stores`) and Money Guide summary stated `$10,000–$25,000+`, whereas Money Guide cards/tables, Heist Planner, Heist Payout Calculator, `public/assets/main.js`, `public/data/map-pins.json`, and `public/articles/gta-6-heist-payout-math-true-net-dollar-per-hour.html` claimed **`$15,000–$35,000`** with no supporting launch-week evidence.
4. **Unverified 11-Minute Completion Time & Derived $/Hour:**
   - Money Guide calculator hardcoded `prepMins: 11` for Jewelry Stores, yielding an uncorroborated `$/hr` claim (originally conflated with Sinfrontera Bank's ~11-minute cell-tower blackout timer).

### C. Story Money Database Mislabeling & Sequence Error
5. **Misleading Section Title & Total Label (`public/gta-6-money-guide/index.html` & `public/index.html`):**
   - Section 4 was titled `"All 10 Story Heists & Planned Job Earnings"` despite listing 2 actual Major Story Heists (*The Cartel Heist* and *VCIA Takedown*) alongside 8 ordinary story missions, unlock milestones, and raids.
   - `$531,420` was labeled `"Total Story Score"` instead of the combined payout of the 10 listed entries.
6. **Mission Naming & Missing Direct Link:**
   - Entry #9 was labeled `"Coast Guard Heist"` without linking directly to the existing dedicated guide `/missions/operation-savage-glory`.
7. **Chapter Unlock Mismatch for *Credit Check*:**
   - Money Guide and Homepage referenced *Credit Check* (Dye Pack Jammer / Small Banks unlock) as `Ch. 2` or `Ch. 2–3`, contradicting the corroborated **Chapter 3** sequence used elsewhere on the site.

### D. Patch-Sensitive Exploits & Official Nov 23 Patch Notes Contradiction
8. **Internal Contradiction on `/gta-6-troubleshooting/` (`public/gta-6-troubleshooting/index.html`):**
   - The `#update-problems` and `#patch-notes` sections claimed Rockstar had published *"no official patch notes"* for the Nov 23 update, while the FAQ section on the same page cited Rockstar's **7 official fixes** for Update `01.002.002` (PS5) / `1.0.2.2` (Xbox Series X|S).
9. **Stale Version Metadata & Over-Asserted Exploit Status:**
   - `public/data/site-status.json` still had `confirmedOnSite: "01.002.001"` and `officialPatchNotesPublished: false`.
   - `public/data/glitches.json`, `/gta-6-glitches/`, `/guides/apollo-aggregates-red-barn-money-loop`, `/locations/apollo-aggregates-red-barn`, and `/cheats` labeled post-patch exploits as `"Confirmed Working"` without separating Rockstar's confirmed Nov 23 patch notes from post-patch community reports, and lacked explicit evidence classification and `2026-11-27` verification dates.

### E. Site-Wide Economy, Map Pins & Pre-Launch Fiction
10. **36 Legacy Pre-Launch Inflated Payout Pins in `public/data/map-pins.json`:**
    - Interactive Map pins still displayed pre-launch multi-million and six-figure fictional payouts (e.g., `$6.5M–$9.8M`, `$2.85M–$4.2M`, `$850K–$1.45M`) alongside `$15,000–$35,000` on `heist-jewelry`.
11. **Pawn Shops Typical Range Mismatch:**
    - Several cards cited `$4,000–$12,000` without clarifying the corroborated typical range of **`$2,500–$6,500`** (with exceptional high-value pulls up to `$10K–$12K`).
12. **Gang Ops Count Ambiguity (39 vs. 40):**
    - Multiple pages cited `40` Gang Ops without clarifying **39 core Illegal Operations** (required for 100% completion) vs. **40 total** including 1 Ultimate Edition exclusive (*PTT Youngin$ Illegal Goods Store*).
13. **Safe Codes Count Drift (17 vs. 19):**
    - `public/articles/every-leonida-region-in-gta-6-mapped-escape-coordinates.html` and Money Guide references still stated `17` safe codes instead of the verified **19** (3 fixed story + 11 gang-op safes + 5 doors).
14. **Unverified Fixed Percentage Claims:**
    - `Yasmani 5% remote pickup cut` and `Dye Pack Jammer ~25% cash loss` were presented as confirmed exact mechanics without official or multi-guide confirmation.
15. **Unlabeled Simulation Values in `public/data/gta6_master_intel.json`:**
    - 12 property records contained speculative pre-launch economy values (up to `$5.1M`) without explicit simulation labels.
16. **Obsolete Root `README.md`:**
    - Contained pre-launch fictional multi-million-dollar vault/heist payouts, obsolete LFG/Eneba references, and pre-launch promotional copy.
17. **Unused Legacy Keys in `public/site-config.js` (Non-Rendered Minor Finding):**
    - Unused legacy keys `nova7p` and `nova7x` point to HyperX/Turtle Beach ASINs; confirmed **not rendered** on any live page (flagged for future cleanup; zero user-facing impact).

---

## 3. Every Correction Implemented

1. **Canonical Source-of-Truth Record Created:** Added `public/data/canonical-gameplay-facts.json` encoding platform/mode scope, official Nov 23 Update `01.002.002 / 1.0.2.2`, 5-tier evidence taxonomy, core economy rules, corroborated heist/robbery payout ranges, 10 Story-Mode Money Milestones (`$531,420`), and patch-sensitive exploit statuses.
2. **Heist Planner, Payout Calculator & Free Tools Refactored:**
   - Defaulted `/heist-planner`, `/heist-payout-calculator`, and `/free/` strictly to **Single-Player Story Mode (PS5 & Xbox Series X|S)** with corroborated min/typical/max ranges, *Operation Savage Glory* (`$50,000`), and Jewelry Stores `$10,000–$25,000`.
   - Removed co-op squad splits, public-lobby fail penalties, 1.5X weekly bonuses, and fictional `$4.2M/$5.1M` bag values from all Story Mode outputs.
   - Preserved original speculative multiplayer modeling strictly inside a collapsed, clearly labeled `<details id="hypotheticalOnlineSandbox">` that never mutates Story Mode payout summaries.
   - Updated explanatory text, tooltips, share URLs (`public/assets/main.js`), and JSON-LD `SoftwareApplication` / `FAQPage` schemas.
3. **Jewelry Store Payout & Timing Synchronized Site-Wide:** Retired `$15,000–$35,000` and unverified `11 min` timing across Money Guide, Jewelry Stores guide, Heist Planner, Payout Calculator, `main.js`, `map-pins.json`, and Payout Math article; standardized on **`$10,000–$25,000`** typical fenced range (explicitly noting exceptional pulls vary by boutique/safe RNG).
4. **Story Money Milestones & *Operation Savage Glory* Updated:** Renamed Section 4 to **"10 Story-Mode Money Milestones"**, separated the 2 Major Story Heists from 8 other mission payouts/unlocks, described `$531,420` strictly as the combined payout of the 10 listed entries, fixed *Credit Check* → **Chapter 3**, and renamed `"Coast Guard Heist"` → **`Operation Savage Glory (Coast Guard Raid)`** with direct link to `/missions/operation-savage-glory`.
5. **Patch & Exploit Ledgers Reconciled:** Updated `site-status.json`, `glitches.json`, `/gta-6-glitches/`, `/guides/apollo-aggregates-red-barn-money-loop`, `/locations/apollo-aggregates-red-barn`, `/cheats`, and `/gta-6-troubleshooting/` to confirm Rockstar's Nov 23 Update `01.002.002 / 1.0.2.2` (7 official fixes), distinguish official notes from community reports, reclassify un-retested exploits from `Confirmed Working` → `Reported Working (Community-reported)`, and stamp `Last verified: 2026-11-27`.
6. **Site-Wide Data Hygiene:** Synchronized **44 pins** in `public/data/map-pins.json` (preserving all **185 pin IDs**, eliminating all 36 legacy million-dollar pins), labeled 12 sim property records in `public/data/gta6_master_intel.json`, normalized `39 Core Gang Ops (40 Ult.)` and `19` confirmed safe codes, and qualified unverified exact percentages (Yasmani remote cut / dye-pack spoilage) in tips & tools.
7. **Sitemap Hygiene & Regression Test:** Updated `lastmod` in `public/sitemap.xml` for **only the 30 genuinely modified canonical indexable URLs** (5 Phase 47 → `2026-11-26`; 25 Phase 48/49 → `2026-11-27`), preserving all 472 untouched URLs and exact 502 canonical inventory, and added `tests/phase49-post-release-integrity.test.mjs` (8 automated regression tests).
8. **Public `README.md` Rewritten:** Replaced obsolete pre-launch multi-million-dollar fiction with an accurate post-release description of GTA6HeistGuide (Story Mode PS5 & Xbox Series X|S, real canonical tools/guides, independent fan-site disclaimer, accurate Amazon/AdSense monetization disclosure, zero secrets/admin URLs).
9. **Restrained, GSC-Backed Internal Linking:** Added direct contextual internal links to `/guides/fast-cash-payday-loans` and `/port-gellhorn` from Money Guide & Pawn Shops pages to reinforce high-impression query clusters.

---

## 4. Source Evidence & 5-Tier Verification Classification

| Claim / Mechanic | Classification | Evidence & Source Basis | Last Verified |
|---|---|---|---|
| GTA VI launched Nov 19, 2026 as Single-Player Story Mode on PS5 & Xbox Series X\|S; no GTA VI Online date/mechanics announced | **Confirmed** | Official Rockstar Games pre-order & launch announcements | 2026-11-27 |
| Nov 23 Update `01.002.002` (PS5) / `1.0.2.2` (Xbox Series X\|S): 7 official bug fixes (crashes, stuck weather, autosaves, story phone calls, persistent wanted levels, gym deadlift bar, partner bag handovers to fences) | **Confirmed** | Official Rockstar Support patch notes (Nov 23, 2026) | 2026-11-27 |
| Pocket cash cap `$20,000` per protagonist; BuckMe Family Savings ATM deposits protect cash from Wasted/Busted | **Corroborated** | Multiple reputable launch guides (IGN, Eurogamer, PowerPyx, Game8) | 2026-11-27 |
| Jewelry Stores (20 locations, Ch. 3 *Yasmani's Jewelry Jobs*, Snap Gun reward): typical fenced payout **`$10,000–$25,000`** | **Corroborated** | Eurogamer, IGN, PowerPyx, Space4Games, TimeSaver launch guides | 2026-11-27 |
| *The Cartel Heist* (`$120,000` baseline; `$120K–$150K` reported), *VCIA Takedown* (`$250,000`), *Operation Savage Glory* (`$50,000`, Pegassi Penthouse, *Snow Storm* trophy) | **Corroborated** | PowerPyx, GTABase, Mobalytics, IGN walkthroughs | 2026-11-27 |
| *Credit Check* (Ch. 3) unlocks Dye Pack Jammer & Small Banks; 22 total banks (14 Small `$5K–$45K`, 8 Large `$65K–~$205K`) | **Corroborated** | Multiple launch guides & walkthrough cross-checks | 2026-11-27 |
| Pawn Shops (15 locations, Ch. 2 *Coffee Break*): `$2,500–$6,500` typical (exceptional pulls up to `$10K–$12K`) | **Corroborated** | Multiple launch guides | 2026-11-27 |
| Gang Ops count: **39 Core** for 100% completion (`Pause Menu > Progress > Gangs`); **40 total** with 1 Ultimate Edition exclusive | **Corroborated** | 100% completion trackers & PowerPyx | 2026-11-27 |
| Confirmed Safe & Door Codes: **19** (3 fixed story + 11 gang-op safes + 5 doors) | **Corroborated** | Site safe-code ledger & multi-guide cross-check | 2026-11-27 |
| Apollo Aggregates Red Barn save/reload money loop still functioning after Nov 23 Update `01.002.002 / 1.0.2.2` | **Community-reported** | Official notes do not list a fix; MeowDB, Notebookcheck, RockstarIntel & Reddit report continued operation (awaiting direct console re-test) | 2026-11-27 |
| Exact Yasmani remote-pickup cut (`5%`), exact Dye Pack spoilage percentage (`~25%`), and Jewelry Store `11-min` run time | **Unverified** | No official confirmation or repeatable multi-guide benchmark; qualified or retired | 2026-11-27 |
| Jewelry Store `$15,000–$35,000` range; GTA VI Online co-op splits / 1.5X weekly bonuses / `$4.2M–$26.25M` payouts; "no official Nov 23 patch notes" | **Contradicted / Outdated** | Contradicted by Rockstar launch scope, Nov 23 patch notes, and launch-week guides; removed or isolated as hypothetical | 2026-11-27 |

---

## 5. Before-and-After Examples

| Area | Before (Baseline `e3a02b3`) | After (Branch `phase-49-post-release-integrity-audit`) |
|---|---|---|
| **Heist Planner (`/heist-planner`)** | Defaulted to Co-op Squad Size (1–4P), Gunner/Hacker/Driver cuts, Public Lobby Fail Penalty, `1.5X Weekly Featured Vault Bonus`, `$4.2M` Diamond / `$5.1M` Gold bag loot | Defaults strictly to **Single-Player Story Mode** with corroborated targets (*Cartel* `$120K`, *VCIA* `$250K`, *Operation Savage Glory* `$50K`, *Jewelry* `$10K–$25K`); speculative co-op/weekly/specialist math isolated in collapsed `<details id="hypotheticalOnlineSandbox">` |
| **Jewelry Stores Payout** | Conflicting `$15,000–$35,000` (cards, tables, Planner, Calculator, `main.js`, `map-pins.json`) + unverified `11 min` $/hr math | Synchronized **`$10,000–$25,000`** typical fenced range across all pages, calculators, articles, and map pins; unverified `11 min` $/hr claim retired |
| **Money Guide Section 4** | `"All 10 Story Heists & Planned Job Earnings"` · `"Total Story Score: $531,420"` · `"Coast Guard Heist"` (unlinked) · `Credit Check (Ch. 2)` | `"10 Story-Mode Money Milestones"` (separating 2 Major Story Heists from 8 other mission payouts) · `"$531,420 combined payout of the 10 listed entries"` · **`Operation Savage Glory (Coast Guard Raid)`** linked to `/missions/operation-savage-glory` · `Credit Check (Ch. 3)` |
| **Glitches & Patch Status** | `confirmedOnSite: "01.002.001"`, `officialPatchNotesPublished: false`, Troubleshooting claimed "no official patch notes", exploits marked `"Confirmed Working"` | Confirmed Nov 23 Update **`01.002.002` (PS5) / `1.0.2.2` (Xbox Series X\|S)** with 7 official fixes; exploits reclassified to **`Reported Working (Community-reported)`** with `Last verified: 2026-11-27` |
| **Map Pins (`map-pins.json`)** | 36 legacy pre-launch pins advertising `$6.5M–$9.8M`, `$2.85M–$4.2M`, `$850K–$1.45M` + Jewelry `$15K–$35K` | All 44 inconsistent pins synchronized to corroborated Story Mode values (`0` million-dollar pins; all `185` pin IDs preserved) |
| **Root `README.md`** | Pre-launch fictional multi-million vault payouts, LFG & Eneba references | Accurate Story Mode (PS5 & Xbox Series X\|S) companion overview, real canonical links, fan-site disclaimer, accurate Amazon/AdSense disclosure |
| **Sitemap (`sitemap.xml`)** | 18 canonical pages modified in Phase 47/48 retained stale `lastmod` dates | Exactly **30** genuinely modified canonical URLs updated (`5` → `2026-11-26`, `25` → `2026-11-27`); `472` untouched URLs preserved |

---

## 6. Sitemap Freshness & Indexing Hygiene Findings

- **Root Cause Analysis:** Phase 47/48 modified **84 HTML files**:
  - `65` files are intentionally excluded from `sitemap.xml` (`noindex`, legacy `.html` redirect stubs, admin/draft pages).
  - `19` canonical indexable files mapped to **18 unique sitemap URLs** (`giveaways.html` canonicals to `/drops`), all `18` of which retained stale `lastmod` dates older than `2026-11-26`.
  - Earlier bulk git sweeps had updated git commit timestamps across all 502 files, confirming why blind date-stamping must never be used.
- **Surgical Update Applied:**
  - Updated **5** Phase 47 canonical URLs → `2026-11-26` (`/gaming-gear/`, `/gta-6-settings/`, `/weapons`, `/vehicles`, `/properties`).
  - Updated **25** Phase 48/49 genuinely modified canonical URLs → `2026-11-27` (including `/`, `/heist-planner`, `/heist-payout-calculator`, `/gta-6-money-guide/`, `/heists/jewelry-stores`, `/heists/pawn-shops`, `/gta-6-glitches/`, `/gta-6-troubleshooting/`, `/gta-6-tips-and-tricks/`, `/guides/apollo-aggregates-red-barn-money-loop`, `/locations/apollo-aggregates-red-barn`, `/cheats`, `/free/`, `/acquisitions`, `/privacy`, `/drops`, updated articles, and linked canonical hubs).
  - Preserved **`472` untouched URLs** at their original `lastmod` dates and maintained the exact **`502` canonical URL** inventory (zero redirects, zero `noindex`, zero admin routes).
- **Live 502-URL Canonical Destination Probe (Preview):**
  - Executed `verify_sitemap_502.mjs` against `https://4671678a.gta6heistguide.pages.dev` (`redirect: 'manual'`).
  - **Result:** **`502 / 502 PASS (0 failures)`** — every single sitemap URL returned HTTP `200`, had exact `<link rel="canonical">` parity with its sitemap `<loc>`, and carried zero `noindex` directives.
- **Regression Guardrail:** Added automated sitemap freshness regression check in `tests/phase49-post-release-integrity.test.mjs` verifying that every canonical sitemap page modified in the branch diff carries `lastmod >= 2026-11-26` and that `sitemap.xml` remains strictly 502 unique valid URLs.

---

## 7. Google Search Console & Organic Growth Audit

**Read-Only Live Snapshot (`https://www.gta6heistguide.com/`, retrieved Nov 27, 2026):**
- **Last 28 Days (Nov 16–25, 2026):** **203 clicks · 22,476 impressions · 0.9% CTR · Avg Pos 7.7** (`121` pages with data; Last 7d Nov 19–25 = `197` clicks, `22,189` impressions). *(Note: GSC reporting lags ~48h through Nov 25.)*
- **Page Indexing (updated Nov 22, 2026):** **222 Indexed**, **468 Not Indexed**:
  - `202` Alternate page with proper canonical tag (mostly `/map?pin=...` query URLs — expected & healthy).
  - `159` Page with redirect (legacy `.html` URLs 301-redirecting to clean canonicals — expected).
  - `100` Crawled — currently not indexed (legacy `.html` stubs plus newer thin/secondary character & weapon pages).
  - `4` Excluded by `noindex` (`/syndicate-command*`, `/dossier*` — intentional).
  - `3` Blocked due to unauthorized request 401 (`/api/contact*`, `/api/clicks?key=` — intentional).
  - `0` Soft 404s · `0` Duplicate without user-selected canonical · `0` Discovered — currently not indexed.
- **Sitemaps:** `/sitemap.xml` (`Success`, read Nov 24, `500` discovered); `/image-sitemap.xml` (`Success`, read Nov 24, `27` discovered).

### Top 20 Highest-Priority Organic Improvement Opportunities

| Rank | URL / Cluster | 28d Impr | Clicks | CTR | Avg Pos | Intent / Issue & Evidence-Backed Priority Action |
|---:|---|---:|---:|---:|---:|---|
| 1 | `/port-gellhorn` (+ `/port-gellhorn.html`) | 8,740 | 29 | 0.3% | 7.0–7.8 | **38.9% of total site impressions** (`port gellhorn shipyard`, `bank`, `atm`, `docks`, `safe code`, `sealed container`, `fence`); sharpen title/meta to explicitly answer Shipyard, ATM, Safe Code & Fence queries; consolidate `.html` signals & add internal links from Money Guide (link added in P49). |
| 2 | `/sinfrontera-bank` | 1,849 | 24 | 1.3% | 5.2 | Already near top-5; tighten snippet with `$120K–$150K` Cartel Heist payout + 11-min blackout timer & cross-link from Heist Planner. |
| 3 | `/` (Homepage) | 1,135 | 8 | 0.7% | 8.4 | Broad head queries; ensure updated Story Mode launch copy and clean `lastmod` propagate cleanly. |
| 4 | `/escape-routes` | 874 | 7 | 0.8% | 7.2 | Ranks pos 5.8 for `gta 6 sewer` (50 impr, 2 clicks); surface sewer/canal getaway answers in intro & meta description. |
| 5 | `/weapons-gear` → `/weapons` | 803 | 23 | 2.9% | 7.7 | Strong CTR on `gta 6 tactical gear` (169 impr, 4.1% CTR) but impressions still hitting 301-redirected `/weapons-gear`; ensure all internal anchors target canonical `/weapons` with prominent tactical gear section. |
| 6 | `/money-guide` → `/gta-6-money-guide/` | 1,021 | 13 | 1.3% | 8.6–9.6 | Split between redirected `/money-guide` (795 impr) and canonical `/gta-6-money-guide/` (226 impr); updated canonical `lastmod`, Story Milestones, & Jewelry consistency in P49. |
| 7 | `/heists/vcia-takedown` | 736 | 5 | 0.7% | 7.3 | High impressions, low 0.7% CTR at pos 7.3; highlight `$250,000` payout & Ch. 4 unlock in title/description. |
| 8 | `/heists/jewelry-stores` | 734 | 5 | 0.7% | 8.6 | Updated title/meta in P49 to exact corroborated `$10K–$25K` range + 20 locations + Snap Gun to match user search intent. |
| 9 | `/vice-city-yacht-heist.html` | 570 | 5 | 0.9% | 7.6 | High demand for `gta 6 yacht mission` (92 impr, pos 9.3) still hitting legacy `.html`; verify clean canonical signal & internal anchors. |
| 10 | `/heists/the-cartel-heist` | 528 | 1 | 0.2% | 8.3 | Very low CTR (0.2%) on `gta 6 cartel heist max payout` (73 impr, pos 8.1); put `$120,000–$150,000` max payout answer immediately in meta/H2. |
| 11 | `/vehicles-getaway-cars` | 438 | 10 | 2.3% | 8.8 | Healthy 2.3% CTR near page-1 bottom; strengthen internal links from Heist guides & escape routes. |
| 12 | `/radio` | 377 | 8 | 2.1% | 10.9 | Just outside page 1 (pos 10.9) with strong 2.1% CTR; add contextual links from Vice City & Beginner guides. |
| 13 | `/gta-6-endings-guide/` | 328 | 3 | 0.9% | 7.8 | Page-1 visibility; clarify ending outcomes & replay/save-slot advice cleanly in meta snippet. |
| 14 | `/heist-planner` | 300 | 1 | 0.3% | 8.2 | Refactored in P49 to accurate Story Mode planner with updated title/description/JSON-LD and `lastmod: 2026-11-27`. |
| 15 | `/heists/pawn-shops` (+ `/guides/fast-cash-payday-loans`) | 290 | 1 | 0.3% | 9.0 | Strong query `fast cash safe code` (49 impr, 0 clicks, pos 9.4); P49 added direct links from Pawn Shops & Money Guide to `/guides/fast-cash-payday-loans`. |
| 16 | `/lucia-jason-skills` (+ `.html`) | 309 | 4 | 1.3% | 8.0–8.1 | Impressions split across `.html` (166) and clean URL (143); keep canonical clean and link consistently. |
| 17 | `/crew-database.html` | 269 | 5 | 1.9% | 7.6 | Legacy `.html` receiving impressions; reinforce clean canonical links site-wide. |
| 18 | `/properties` | 249 | 4 | 1.6% | 10.3 | Right on page-1 boundary (pos 10.3); clarify Story Mode safehouses/penthouse unlocks vs. sim estimates. |
| 19 | `/leonida-reserve` | 143 | 10 | 7.0% | 6.8 | Highest CTR on site (**7.0%** at pos 6.8); expand internal linking from Bank/Money hubs to scale traffic. |
| 20 | `Crawled — currently not indexed` (`100` URLs) | — | — | — | — | Do NOT bulk-submit; audit high-value canonical guides (e.g., `/save-planner/`, character guides `/guides/moses-character-guide`, `/guides/drequan-priest-character-guide`) for stronger internal link depth rather than manufacturing new pages. |

---

## 8. Post-Release Monetization Measurement Findings

### A. Amazon Associates (Read-Only Verified)
- **Gaming Gear (`/gaming-gear/`):** **53 / 53** visible compact `.amz-card` items (`50` unique verified catalog ASINs + `3` Leonida Drop rotating picks). `53 / 53` carry `tag=gta6heistguid-20` and `rel="sponsored nofollow noopener"`. Required FTC/Amazon disclosure (`"As an Amazon Associate I earn from qualifying purchases."`) present. Leonida Drop rotation verified (`LEONIDA CONTROL ROOM` → `RETRO GAMING LAB`).
- **Settings & Hardware (`/gta-6-settings/`):** **14 / 14** visible compact `.amz-card` items verified matching actual linked ASINs, `14 / 14` carry `tag=gta6heistguid-20` and `rel="sponsored nofollow noopener"`, disclosure present.
- **Homepage Placement Pause (Phase 35.1C):** Verified active — `window.SITE_CONFIG.enableAmazonProductPlacements === false` and **`0` visible `.amz-card` elements** on `/`.
- **Minor Code Hygiene Note:** Unused legacy keys `nova7p`/`nova7x` in `public/site-config.js` map to HyperX/Turtle Beach ASINs but are not rendered anywhere on the site.

### B. Google Analytics 4 (`G-DG7REYHR80`, Stream `16417865148`)
- **Pre-Release Baseline (Nov 20–26, 2026):** `93` users · `108` sessions · `236` views · `55.56%` engagement rate · `724` events · **`2` `affiliate_click` events** (both on Nov 25; `0` on Nov 26).
- **Separate Post-Release Baseline (Nov 27, 2026 partial day, ~1.5h post-release):** `16` users · `17` sessions · `21` views · `35.29%` engagement rate · `71` events · **`0` `affiliate_click` events so far** (`3` active Realtime users).
- **Client-Side 10-Parameter Verification (Isolated Stub, Zero Live Clicks/Hits):** Verified via Playwright with blocked external analytics/affiliate domains, blocked `/api/clicks`, `preventDefault()`, and stubbed `window.gtag`:
  - Fired **exactly once (`fireCount: 1`)** — zero duplicate event handlers.
  - Populated **all 10 standardized non-PII parameters**: `affiliate_program: "amazon_associates"`, `partner_name: "Amazon Associates"`, `product_id: "8bitdo-retro-keyboard-c64"`, `asin: "B0CYSQWYZP"`, `category: "Funny & Unusual"`, `page_path: "/gaming-gear/"`, `placement: "leonida_drop_main"`, `destination_hostname: "www.amazon.com"`, `collection_id: "retro-gaming-lab"`, `feature_position: 1`.
  - **Zero PII keys** transmitted (`piiKeys: []`); Consent Mode v2 default (`consent`, `default`, `analytics_storage: 'denied'`) verified present in `window.dataLayer`.
- **GA4 Admin Reporting Gap Identified (Read-Only):** None of the 10 custom parameters are registered as Event-Scoped Custom Dimensions in GA4 Admin yet, causing GA4 event-detail cards to display `-` / `No data available` even when events arrive. *(Action documented in Section 12 — untouched per read-only policy.)*

### C. Google AdSense (`pub-9556158063903839` — Strictly Read-Only)
- **Account Status:** **`Getting ready`** (last updated `Nov 25, 2026 2:50 PM EST`).
- **`ads.txt`:** `Authorized` · **Auto Ads:** `OFF` · **Manual Ad Units:** `0` · **Policy Center:** `0` issues · **7d/30d Revenue/Impressions/Clicks:** `$0.00` / `0` / `0`.
- **Action Taken:** **Zero modifications** to AdSense settings, Auto Ads, review status, or `ads.txt`. Retained **571 / 571** passing AdSense code audit.

---

## 9. Complete List of Changed Files

`git diff --name-status e3a02b3e4f6151a183c202e3563fba7f6a04d115` (plus this audit report outside `public/`):

| Status | File Path |
|---|---|
| `M` | `README.md` |
| `A` | `POST-RELEASE-INTEGRITY-AUDIT.md` *(outside `public/`)* |
| `A` | `public/data/canonical-gameplay-facts.json` |
| `M` | `public/data/glitches.json` |
| `M` | `public/data/gta6_master_intel.json` |
| `M` | `public/data/heist-command-center.json` |
| `M` | `public/data/map-pins.json` |
| `M` | `public/data/site-status.json` |
| `M` | `public/assets/main.js` |
| `M` | `public/heist-planner.html` |
| `M` | `public/heist-payout-calculator.html` |
| `M` | `public/free/index.html` |
| `M` | `public/gta-6-money-guide/index.html` |
| `M` | `public/index.html` |
| `M` | `public/heists/jewelry-stores.html` |
| `M` | `public/heists/pawn-shops.html` |
| `M` | `public/gta-6-glitches/index.html` |
| `M` | `public/gta-6-tips-and-tricks/index.html` |
| `M` | `public/gta-6-troubleshooting/index.html` |
| `M` | `public/guides/apollo-aggregates-red-barn-money-loop.html` |
| `M` | `public/locations/apollo-aggregates-red-barn.html` |
| `M` | `public/cheats.html` |
| `M` | `public/articles/every-leonida-region-in-gta-6-mapped-escape-coordinates.html` |
| `M` | `public/articles/gta-6-heist-payout-math-true-net-dollar-per-hour.html` |
| `M` | `public/sitemap.xml` |
| `A` | `tests/phase49-post-release-integrity.test.mjs` |

---

## 10. Regression Verification, Test Results & Screenshots

| Verification Suite | Target | Result | Notes |
|---|---|---|---|
| `node --check` (syntax) | `main.js`, `affiliates.js`, `site-config.js`, `phase49-post-release-integrity.test.mjs` | **4 / 4 PASS** | Zero syntax errors |
| `node --test tests/*.test.mjs` | All test files (`71` existing + `8` new Phase 49) | **79 / 79 PASS** | Zero failures |
| `python scripts/audit_adsense_verification.py` | Full `public/` HTML tree | **571 / 571 PASS** | `0` errors, `0` duplicates, `0` conflicting pub IDs, Impact tag intact |
| `node scripts/seo-audit.mjs` | Full `public/` HTML + JSON-LD + sitemaps | **0 Warnings** | `337` pages, `339` JSON-LD valid, `502` sitemap canonicals, `1,173` `<img>`, `27,020` internal links |
| `npx wrangler pages functions build` | Cloudflare Pages Functions | **PASS** | Compiled Worker cleanly (`wrangler 4.169.0`) |
| `node scripts/phase22-routing-test.mjs` | Production (`www.gta6heistguide.com`) | **47 / 47 PASS** | `0` failures |
| `node scripts/phase22-routing-test.mjs` | Preview (`4671678a.gta6heistguide.pages.dev`) | **47 / 47 PASS** | `0` failures |
| Production HTTP, API & Asset Parity Probe | `www.gta6heistguide.com` vs `e1aeb579.gta6heistguide.pages.dev` | **18 / 18 PASS** | Exact SHA-256 parity across 9 assets; fail-closed `.md` 404 & Access 302 verified |
| Full 502-URL Sitemap Canonical Probe | Preview (`4671678a.gta6heistguide.pages.dev`) | **502 / 502 PASS** | `0` redirects, `0` 404s, `0` canonical mismatches, `0` noindex |
| 6-Viewport Playwright Matrix (`360×800`, `375×667`, `390×844`, `430×932`, `768×1024`, `1440×900` × 20 routes) | Preview (`4671678a.gta6heistguide.pages.dev`) | **120 / 120 PASS** | `0` broken images, `0` horizontal overflow, `0` JS errors, `0` first-party HTTP errors, `0` bad Amazon links |
| Playwright Interactive & Monetization Assertions | Preview (`4671678a.gta6heistguide.pages.dev`) | **16 / 16 PASS** | Story Mode math, isolated Hypothetical Sandbox, Money Guide milestones, 53 Gear + 14 Settings cards, Leonida Drop rotation, 10-param GA4 `affiliate_click` (no dup / no PII / Consent Mode), 185 clean Map pins |

### Verification Screenshots Captured (Outside `public/`)
- **Live Read-Only GSC/GA4/AdSense Browser Audit Evidence (Host-Verified):**
  - `C:\Users\Shawn\.gemini\antigravity\brain\5ea62a92-b9b2-4258-8d4d-12eb2f59734b\browser_evidence\bdafa55f-d123-40ac-8de5-5f6b51ec59d9\final_step_144.png`
- **Preview Playwright QA Captures (`1440×900` Desktop & `390×844` Mobile — 22 PNGs total):**
  - Directory: `C:\Users\Shawn\.gemini\antigravity\brain\5ea62a92-b9b2-4258-8d4d-12eb2f59734b\scratch\preview-qa\`
  - Key captures visually inspected: `heist_planner_1440x900.png`, `heist_planner_390x844.png`, `money_guide_1440x900.png`, `jewelry_stores_1440x900.png`, `gaming_gear_1440x900.png`, `homepage_1440x900.png`, `glitches_hub_1440x900.png`, plus `heist_calc_*`, `settings_hw_*`, `leonida_map_*`, `my_leonida_*`, `operation_savage_glory_*`.

---

## 11. Preview Deployment URL & Deployment ID

- **Cloudflare Preview Deployment ID:** `4671678a-d9bd-4f54-b0b5-094db21de01d`
- **Immutable Preview URL:** `https://4671678a.gta6heistguide.pages.dev`
- **Branch Alias URL:** `https://phase-49-post-release-integr.gta6heistguide.pages.dev`
- **Branch / Commit:** `phase-49-post-release-integrity-audit` @ `9785ba4`
- **Assets Uploaded:** `1,850` total (`23` updated + `1,827` cached)
- **Production Status:** Untouched (`e1aeb579-5a3e-409e-95b5-2ae3150fe4c0` remains active on `main` @ `e3a02b3e4f6151a183c202e3563fba7f6a04d115`).

---

## 12. Remaining External Owner Actions

1. **Review & Promote to Production:** Review the Preview deployment (`https://4671678a.gta6heistguide.pages.dev`) and this report, then fast-forward/merge `phase-49-post-release-integrity-audit` into `main` and deploy to Production when ready.
2. **Register 10 GA4 Custom Dimensions (GA4 Admin → Data display → Custom definitions → Create custom dimension, Scope = Event):**
   - `affiliate_program`, `partner_name`, `product_id`, `asin`, `category`, `page_path`, `placement`, `destination_hostname`, `collection_id`, `feature_position`.
3. **Google AdSense Approval Wait:** Leave AdSense untouched while status remains `Getting ready`. Once approved (`Ready`), enable Auto Ads with the 13 interactive-tool path exclusions (excluding `/map`, `/heist-planner`, `/heist-payout-calculator`, `/my-leonida/`, `/save-planner/`, etc.) and link GA4 to AdSense.
4. **Optional Direct Console In-Game Verification:** Test Apollo Aggregates Red Barn loop directly on PS5 `01.002.002` / Xbox Series X\|S `1.0.2.2`, time 3–5 Jewelry Store runs end-to-end, and check Yasmani remote-pickup % and unjammed dye-pack spoilage % in-game before upgrading those items from `Community-reported` / `Unverified` to `Confirmed`.
5. **External Monetization Admin Items:** Complete Amazon Associates tax/payout setup if still pending, monitor pending affiliate brand applications (Impact.com / direct partners), and optionally prune unused `nova7p`/`nova7x` legacy keys in `public/site-config.js` in a future housekeeping pass.

---

## 13. Issues That Could Not Be Independently Verified

- **Direct Console In-Game Testing:** No live PlayStation 5 or Xbox Series X\|S console is available in this audit environment; therefore:
  - Post-Nov 23 availability of the Apollo Aggregates Red Barn loop remains honestly classified as **`Community-reported`** (not upgraded to `Confirmed`).
  - Exact Jewelry Store average completion duration (`$/hour`), Yasmani remote-pickup driver percentage (`5%`), and bank dye-pack spoilage percentage (`~25%`) could not be empirically timed/measured in-game and remain retired or explicitly qualified as illustrative/unverified.
- **Third-Party Affiliate Portals:** G2A Goldmine, ExitLag, and Gumroad dashboards were not signed into this browser session and were not audited beyond on-site link/tag compliance.
- **Search Console Freshness Lag:** Live GSC data reflects through **November 25, 2026** (~48-hour reporting lag), so indexing/CTR impacts from Phase 47/48/49 cannot yet be observed in GSC performance reports.

---

## Final Verdict

**COMPLETE — READY FOR OWNER RELEASE REVIEW**

Every factual discrepancy, Story Mode vs. speculative Online separation, Jewelry Store range/timing conflict, Story Money milestone rename, Nov 23 patch contradiction, 36 legacy inflated map pins, root `README.md` cleanup, and selective 30-URL sitemap `lastmod` update has been implemented on isolated branch `phase-49-post-release-integrity-audit` and verified on Cloudflare Preview `4671678a-d9bd-4f54-b0b5-094db21de01d` with **79/79** Node tests, **571/571** AdSense audit, **0** SEO warnings, **47/47** routing tests, **502/502** sitemap canonical checks, **120/120** 6-viewport Playwright matrix checks, and **16/16** interactive/monetization checks passing — while leaving Production (`e3a02b3e4f6151a183c202e3563fba7f6a04d115` / `e1aeb579-5a3e-409e-95b5-2ae3150fe4c0`), AdSense, GA4 Admin, and all existing worktrees strictly untouched.
