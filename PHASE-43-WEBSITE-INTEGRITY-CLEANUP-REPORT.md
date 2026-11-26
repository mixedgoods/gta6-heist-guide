# PHASE 43 — WEBSITE INTEGRITY, CONTENT ACCURACY & QUALITY CLEANUP REPORT

**Date:** November 26, 2026  
**Target Website:** `https://www.gta6heistguide.com`  
**Mode:** Isolated Implementation Release Candidate (No push, no merge into `main`, no deployment)  
**Baseline:** `main` @ `59ce3ef0c4ee84038a43170f2da51fae389448da`  
**Audit Source:** `PHASE-42-COMPLETE-WEBSITE-QUALITY-AUDIT.md` (preserved untouched)

---

## 1. Executive Summary

**Status:** VERIFIED — All **4 P0 critical defects** and all **9 P1 high-priority defects** identified in Phase 42 have been resolved, regression-tested, and multi-viewport QA verified on an isolated release branch (`phase-43-site-integrity-cleanup`).

- **P0 Critical Fixes (4/4 VERIFIED):**
  1. Removed 3 debunked pre-launch fictional heist pins (`vault-starlet-superyacht`, `vault-port-gellhorn-terminal`, `op-keys-submarine-smuggler-dock`), repaired all 22 remaining broken `.html` map-pin links (including `vault-sinfrontera-downtown` -> `/guides/sinfrontera-national-bank`) plus 12 legacy `/money-guide.html#` redirects, and reconciled authoritative map totals from `188` (and stale `174` on `/gta-6-collectibles/`) to **`185`**.
  2. Reconciled cheats verification counts in `public/data/live_intel.json` (`verifiedCheatsCount: 6`, `unconfirmedCheatsCount: 53`, `conflictingCheatsCount: 2`, `totalCheatsTracked: 61`) directly from `public/data/cheats.json`, and updated `public/data/live-feed.json` badge wording.
  3. Fixed all broken `/settings.html` references across `discoveries.json`, `discoveries-featured.json`, `live-feed.json`, and `live_intel.json` to canonical `/gta-6-settings/` (HTTP 200 verified).
  4. Consolidated 99.8%-duplicate `/giveaways` onto `/drops` via `301` redirects in `public/_redirects`, removed `/giveaways` from `public/sitemap.xml` (503 -> 502 canonical URLs), updated internal links to `/drops`, and marked `public/giveaways.html` `noindex, follow` with canonical `/drops`.
- **P1 High-Priority Fixes (9/9 VERIFIED):**
  1. Removed all 24 visible developer-facing `"Phase N"` leaks across 13 canonical pages and all `"Pre-Launch Research Slot (Internal Tracker)"` / `"Internal Tracker"` / `"(Reconciled from prior pre-launch...)"` strings on `/cheats` and `cheats.json`.
  2. Reconciled stale safe-code counts (`7` and `17`) to the authoritative **`19`** across all 5 affected pages.
  3. Standardized Mount Kalaga region naming in `map-pins.json` and `map.html` (`8` pins renamed from `Mt. Kalaga` -> `Mount Kalaga National Park`, total `19` unified pins).
  4. Corrected misleading wildlife verification claims (`49 VERIFIED SPECIES` / `Verified Wildlife`) across `/guides/legendary-hunter-animals-guide` and 5 region hubs to distinguish 7 verified GTA VI species from 42 real-world reference species.
  5. Added the 2 missing standalone verified weapons (`black-eagle-kalinga-50`, `ride-free-revolver`) to `public/data/weapons.json` (`27/27` parity with `/weapons/*.html`), cleaned 20 `.html` suffixes in `relatedLinks`, and preserved clean `.wdb-placeholder` fallbacks for the 5 melee/throwables lacking verified local imagery.
  6. Unified `<nav>` and `<footer>` across all **502** canonical sitemap pages via `scripts/standardize_nav_footer.py` (`1` unified nav, `1` unified footer, `0` duplicate `15-Slot Save Planner` links, canonical `<footer>` added to `/map`, and every page's existing `.footer-disclaimer` preserved verbatim).
  7. Resolved all unlabeled form controls across all **10** interactive tools (`0` unlabeled visible inputs verified via Playwright), upgraded mobile touch targets to `>= 44px` on mobile, and fixed `520px` detail table overflow on `390×844` and `360×800` viewports (`358px` / `328px` exact fit, `0px` document overflow).

---

## 2. Original Git Baseline (VERIFIED)

- **Verified `main` commit:** `59ce3ef0c4ee84038a43170f2da51fae389448da` (`test: derive HTTP smoke pin count from authoritative map data`)
- **Pre-existing 6 worktrees (100% preserved untouched):**
  1. `C:/Users/Shawn/Desktop/gta6heistguide` — `phase-33-1-licensed-product-photography` (`dbbbf976624ca09ca07bbfcba63aeaebc34e1127`, 70 pre-existing dirty/untracked entries preserved)
  2. `C:/Users/Shawn/.gemini/antigravity/scratch/phase-34-2-main-promotion` — `main` (`59ce3ef0c4ee84038a43170f2da51fae389448da`, contains untouched `PHASE-42-COMPLETE-WEBSITE-QUALITY-AUDIT.md`)
  3. `C:/Users/Shawn/.gemini/antigravity/scratch/phase-35-1c-amazon-placement-pause` — `phase-35-1c-amazon-placement-pause` (`443a2681a2acee834a823b1a39aa91f27369dd41`)
  4. `C:/Users/Shawn/.gemini/antigravity/scratch/phase-36-3-ga4-url-privacy` — `phase-36-3-ga4-url-privacy` (`9773f71b7f47745a37e446a944dd82b9a2793e95`)
  5. `C:/Users/Shawn/.gemini/antigravity/scratch/phase-36-analytics-growth` — `phase-36-analytics-growth` (`a5f02459799c9bed31630d05d7e2e87e46ad5f21`)
  6. `C:/Users/Shawn/.gemini/antigravity/scratch/phase-38-seo-quick-wins` — `phase-38-seo-quick-wins` (`59ce3ef0c4ee84038a43170f2da51fae389448da`)

---

## 3. Exact Branch and Worktree (VERIFIED)

- **Branch:** `phase-43-site-integrity-cleanup` (branched directly from `main` @ `59ce3ef0c4ee84038a43170f2da51fae389448da`)
- **Worktree Path:** `C:/Users/Shawn/.gemini/antigravity/scratch/phase-43-site-integrity-cleanup`
- **Remote Push / Merge / Deploy:** None performed.

---

## 4. P0 Defects Corrected (VERIFIED)

| ID | Defect | Resolution | Verification |
|---|---|---|---|
| **P0-1A** | Broken map-pin guide links in `public/data/map-pins.json` (25 404s total + 12 `/money-guide.html#` redirects) | Repaired all 22 remaining broken links to verified canonical sitemap destinations + updated 12 `/money-guide.html#` links to `/gta-6-money-guide/#` | `phase43-site-integrity.test.mjs` (`0` broken pin links) |
| **P0-1B** | 4 debunked pre-launch fictional heist pins/links | Removed `vault-starlet-superyacht`, `vault-port-gellhorn-terminal`, `op-keys-submarine-smuggler-dock`; preserved real `vault-sinfrontera-downtown` with canonical `/guides/sinfrontera-national-bank`; reconciled totals `188`/`174` -> `185` | `map-pins.json` (`185` pins) + Playwright `/map` (`Found: 0 / 185`) |
| **P0-2** | 99.8% duplicate `/drops` & `/giveaways` canonical pages | Added `/giveaways /drops 301` & `/giveaways.html /drops 301` to `_redirects`; removed `/giveaways` from `sitemap.xml` (502 URLs); updated internal links to `/drops`; marked `giveaways.html` `noindex` + canonical `/drops` | `phase43-site-integrity.test.mjs` + Playwright 301 -> 200 check |
| **P0-3** | `live_intel.json` reported `verifiedCheatsCount: 61` vs `6` verified in `cheats.json` | Derived exact counts (`verifiedCheatsCount: 6`, `unconfirmedCheatsCount: 53`, `conflictingCheatsCount: 2`, `totalCheatsTracked: 61`) and updated `live-feed.json` badge | `phase43-site-integrity.test.mjs` + Playwright `/cheats` (`6 / 53 / 2`) |
| **P0-4** | Broken `/settings.html` link in `discoveries.json` (and mirrored in 3 other JSON files) | Updated `/settings.html` -> `/gta-6-settings/` across `discoveries.json`, `discoveries-featured.json`, `live-feed.json`, `live_intel.json` | `phase43-site-integrity.test.mjs` + Playwright HTTP 200 on `/gta-6-settings/` |

---

## 5. P1 Defects Corrected (VERIFIED)

1. **Developer-facing `"Phase N"` & `"Internal Tracker"` leaks:** Stripped all 24 visible `"Phase N"` strings across 13 pages and all `"Pre-Launch Research Slot (Internal Tracker)"` / `"Internal Tracker"` strings in `public/cheats.html` and `public/data/cheats.json`.
2. **Stale safe-code counts (`7` and `17` -> `19`):** Updated `/locations/moonstone-boutique`, `/heists/small-banks-payday-loans`, `/guides/kolt-and-associates-gang-ops`, `/locations/la-cascara-motel`, and `/guides/fast-cash-payday-loans` to authoritative `19`.
3. **Mount Kalaga region split:** Normalized 8 `Mt. Kalaga` pins and `regions` key in `map-pins.json` plus `map.html` region jump/filter controls to `Mount Kalaga National Park` (`19` pins unified).
4. **Wildlife verification wording:** Updated `/guides/legendary-hunter-animals-guide` and 5 region hubs (`/locations/vice-city`, `/leonida-keys`, `/grassrivers`, `/mount-kalaga`, `/ambrosia`) to accurately distinguish 7 verified GTA VI species from 42 real-world reference species.
5. **Weapons database completeness:** Added `black-eagle-kalinga-50` and `ride-free-revolver` to `public/data/weapons.json` (`27/27` parity with `/weapons/*.html`) and cleaned 20 `.html` suffixes in `relatedLinks`.
6. **Header & footer consistency:** Standardized `<nav>` and `<footer>` across all 502 canonical pages (1 nav signature, 1 footer signature, 0 duplicate `15-Slot Save Planner` links, canonical `<footer>` added to `/map`).
7. **Accessibility (form controls):** Added explicit `aria-label` or `<label for>` to every unlabeled input/select/textarea across all 10 interactive tools (`0` unlabeled visible controls verified).
8. **Mobile touch targets:** Enforced `>= 44px` tap-target heights on mobile (`<= 768px`) for `.pg-code-badge`, filter pills, map controls, and checkbox labels (`44px`+ verified live at `390×844`).
9. **Mobile table responsiveness:** Added responsive `.g-table-wrap` / `.g-table` rules in `public/assets/style.css` so detail tables fit within `358px` at `390×844` and `328px` at `360×800` with `0px` document overflow.

---

## 6. Remaining Unresolved Findings (VERIFIED / NOT AVAILABLE)

- **Melee/Throwable & Unique Pistol Images (NOT AVAILABLE locally):** 5 melee/throwable weapons (`baseball-bat`, `crowbar`, `frag-grenade`, `molotov-cocktail`, `flashbang-stun-grenade`) and `black-eagle-kalinga-50` do not have dedicated verified local photos in `public/assets/images/weapons/`. Per policy, no unrelated gun images or unlicensed artwork were substituted; `world-db-engine.js` renders a clean `.wdb-placeholder` fallback with zero broken `<img>` tags.
- **Pre-existing Phase 35-1c SEO Audit Guardrail:** `scripts/seo-audit.mjs` reports 1 pre-existing guardrail notice (`Expected 4+ Amazon affiliate references on homepage, found 1`) from the Phase 35-1c Amazon placement pause on `main`. Per strict preservation rules, affiliate/Amazon configurations were not modified.
- **Out-of-Scope Phase 42 P2/P3 Backlog:** Asset compression (>500 KB images), adding `loading="lazy"` to below-the-fold images, homepage `BreadcrumbList` cleanup, `/gaming-gear/` `og:image`, `/secrets` heading level `h1 -> h3`, `/my-leonida/` initial denominators/Import button, and Delights Cabaret (`2008`) map pin remain tracked for a future P2 polish phase.

---

## 7. Modified & Created Files Summary (VERIFIED)

Total changed/new files in isolated worktree: **520** (including 502 canonical HTML pages updated for unified `<nav>`/`<footer>`). Key non-template files:
- `public/data/map-pins.json` — Removed 3 fictional pins, fixed 22 broken links + 12 `/money-guide.html#` redirects, normalized `Mt. Kalaga` -> `Mount Kalaga National Park`, reconciled `total_pins: 185`.
- `public/data/live_intel.json` — Derived `verifiedCheatsCount: 6`, `unconfirmedCheatsCount: 53`, `conflictingCheatsCount: 2`, `totalCheatsTracked: 61`; fixed `/settings.html` -> `/gta-6-settings/` and `/giveaways.html` -> `/drops`.
- `public/data/discoveries.json`, `public/data/discoveries-featured.json`, `public/data/live-feed.json` — Fixed `/settings.html` -> `/gta-6-settings/`; updated `live-feed.json` cheats badge.
- `public/data/cheats.json` & `public/cheats.html` — Removed all `"Pre-Launch Research Slot (Internal Tracker)"`, `"Internal Tracker"`, and `"(Reconciled from prior pre-launch...)"` strings; added `aria-label` to all 5 form inputs.
- `public/data/weapons.json` — Added `black-eagle-kalinga-50` and `ride-free-revolver` (25 -> 27); cleaned 20 `.html` suffixes in `relatedLinks`.
- `public/_redirects`, `public/sitemap.xml`, `public/giveaways.html`, `public/live-intel.html`, `public/free/index.html` — Consolidated `/giveaways` -> `/drops` (301 redirect, removed from sitemap, updated internal links).
- `public/map.html` — Reconciled `188` -> `185`, normalized `Mount Kalaga National Park` filter/jump key, added canonical `<footer>`, added checkbox/modal labels and mobile `>= 44px` touch target CSS.
- `public/assets/js/world-db-engine.js` — Added `aria-label` to dynamic search input across `/weapons`, `/vehicles`, `/properties`, `/radio`.
- `public/assets/style.css` — Added responsive `.g-table-wrap`/`.g-table` mobile rules and `>= 44px` mobile touch target rules.
- `public/heist-payout-calculator.html`, `public/heist-planner.html`, `public/animals.html`, `public/gta-6-100-completion-tracker/index.html` — Added `aria-label` attributes to all interactive inputs/selects/sliders.
- `public/my-leonida/index.html`, `public/assets/js/my-leonida.js`, `public/assets/js/my-leonida-adapter.js`, `public/heist-command-center/index.html`, `public/community-discoveries/index.html`, `public/gta-6-collectibles/index.html`, `public/articles/every-leonida-region-in-gta-6-mapped-escape-coordinates.html` — Reconciled pin counts (`188`/`174` -> `185`) and removed `"Phase N"` copy leaks.
- 13 editorial pages, 5 safe-code pages, 6 wildlife pages — Cleaned `"Phase N"` leaks, stale safe-code counts (`7`/`17` -> `19`), and wildlife verification wording.
- `scripts/standardize_nav_footer.py` (NEW) — Reusable script unifying `<nav>` and `<footer>` across all 502 canonical pages while preserving `.footer-disclaimer`.
- `tests/phase43-site-integrity.test.mjs` (NEW) — 10-test regression suite covering every Phase 43 P0 and P1 fix.
- `PHASE-43-WEBSITE-INTEGRITY-CLEANUP-REPORT.md` (NEW, outside `public/`).

---

## 8. Map-Pin Corrections & Provenance (VERIFIED)

### Removed Fictional Pre-Launch Pins (3)
1. **`vault-starlet-superyacht`** (*The Starlet Casino Superyacht Offshore Vault*, Leonida Keys, `$1.9M–$3.1M`, broken `/starlet-superyacht-vs-port-gellhorn-terminal.html`) — Explicitly debunked as pre-launch speculation on `/missions/day-release` and `/missions/`.
2. **`vault-port-gellhorn-terminal`** (*Port Gellhorn Container Terminal Armored Depository*, Port Gellhorn, `$1.45M–$2.6M`, broken `/port-gellhorn-container-terminal-crane-heist.html`) — Explicitly debunked as pre-launch speculation on `/port-gellhorn`.
3. **`op-keys-submarine-smuggler-dock`** (*Sunken Cay Narco-Submersible Pen*, Leonida Keys, `$380K`, broken `/leonida-keys-offshore-heists-smuggler-docks.html`) — Pre-launch fictional offshore smuggling pin with no in-game confirmation.

### Repaired Real Pin Links (22 broken + 12 `/money-guide.html#` redirects)
- `vault-sinfrontera-downtown` -> `/guides/sinfrontera-national-bank` (real GTA 6 bank; retired pre-launch compare link replaced)
- `vault-state-gold-reserve` -> `/guides/ambrosia-banks-and-vaults`
- `vault-keys-marina-depository` -> `/guides/leonida-keys-banks-and-shops`
- `bank-grassrivers-payday-express`, `jewelry-grassrivers-bayou-traders`, `op-grassrivers-meth-airboat-shed` -> `/locations/grassrivers`
- `bank-kalaga-trail-trust`, `jewelry-kalaga-peak-gem-miners`, `op-kalaga-poacher-camp` -> `/locations/mount-kalaga`
- `ammu-mt-kalaga-summit-lodge`, `ammu-mt-kalaga-ranger-station`, `ammu-mt-kalaga-east-valley` -> `/weapons`
- `jewelry-starlet-diamonds-downtown` -> `/guides/vice-city-jewelry-route`
- `jewelry-port-gellhorn-pawn` -> `/guides/port-gellhorn-pawn-and-payday`
- `jewelry-keys-treasure-pawn` -> `/guides/underwater-treasure-money`
- `op-port-gellhorn-chop-shop` -> `/guides/all-7-fences-and-vehicle-buyers`
- `op-port-gellhorn-dock-smuggling` -> `/guides/port-gellhorn-shipyard-containers`
- `op-ambrosia-moonshine-still` -> `/locations/ambrosia`
- `op-little-haiti-voodoo-counterfeit` -> `/gta-6-money-guide/`
- `op-vice-beach-pill-press` -> `/locations/vice-beach`
- `op-airport-cargo-smuggling-ring` -> `/locations/vice-city-international-airport`
- `op-lake-leonida-hydroponics` -> `/locations/lake-leonida`
- `op-fishing-shacks` .. `op-nova-auto-junkyard` (12 pins) -> `/gta-6-money-guide/#op-card-1` .. `#op-card-12`

### Region Normalization
- `8` pins updated from `Mt. Kalaga` -> `Mount Kalaga National Park` (`19` total pins in `Mount Kalaga National Park`, `0` remaining `Mt. Kalaga`).

---

## 9. Cheats Verification Reconciliation (VERIFIED)

- Authoritative `public/data/cheats.json`: **61** total tracked entries (**6** `CONFIRMED`, **53** `UNCONFIRMED`, **2** `CONFLICTING`).
- Updated `public/data/live_intel.json` to derive and publish:
  - `verifiedCheatsCount`: `6`
  - `unconfirmedCheatsCount`: `53`
  - `conflictingCheatsCount`: `2`
  - `totalCheatsTracked`: `61`
- All 61 records and their existing evidence/provenance were preserved untouched (zero unconfirmed entries deleted); internal tracker phrasing was replaced with plain visitor-facing `"Unconfirmed community report — awaiting in-game verification"` / `"Community Report"`.

---

## 10. Drops / Giveaways Consolidation Decision (VERIFIED)

- **Diff Evidence:** Full line-by-line diff proved `public/drops.html` is a strict superset of `public/giveaways.html` (`drops.html` includes everything on `giveaways.html` plus the live `#liveDropsFeedSection` powered by `data/drops.json`; `giveaways.html` contained zero unique visitor content).
- **Action Taken:** Consolidated onto `/drops`, added `/giveaways /drops 301` and `/giveaways.html /drops 301` in `public/_redirects`, removed `/giveaways` from `public/sitemap.xml` (503 -> 502 canonical URLs), updated internal links in `public/live-intel.html`, `public/free/index.html`, and `public/data/live_intel.json`, and set `noindex, follow` + canonical `/drops` on `public/giveaways.html`.
- **SEO Risk:** Low (ESTIMATED). Clean 301 consolidation eliminates keyword cannibalization and concentrates link equity on `/drops`.

---

## 11. Wildlife and Weapon Corrections (VERIFIED)

- **Wildlife:** Updated `/guides/legendary-hunter-animals-guide` (`49 CATALOGUED SPECIES (7 VERIFIED GTA VI + 42 REFERENCE)`) and 5 region hubs (`Catalogued Wildlife & Reference Species in [Region]`) while preserving all 42 licensed reference photos and provenance.
- **Weapons:** Added `black-eagle-kalinga-50` and `ride-free-revolver` to `public/data/weapons.json` using authoritative facts from their standalone pages (`27/27` parity). Assigned existing verified `/assets/images/weapons/weapon-revolver.jpg` to `ride-free-revolver`; preserved clean `.wdb-placeholder` fallbacks for `black-eagle-kalinga-50` and the 5 melee/throwable entries without verified local photography.

---

## 12. Navigation & Footer Improvements (VERIFIED)

- Built `scripts/standardize_nav_footer.py` and applied it across all 502 canonical sitemap pages.
- **Result:** Reduced `16` `<nav>` variants -> **`1`** unified `<nav>` (preserving active pill states), reduced `19` `<footer>` variants -> **`1`** unified `<footer>`, eliminated duplicate `💾 15-Slot Save Planner` links across **482** footers (`0` duplicates remaining), added canonical `<footer>` to `/map`, and preserved each page's `.footer-disclaimer` verbatim.

---

## 13. Accessibility Improvements (VERIFIED)

- Added explicit `aria-label` / `<label for>` across all 10 interactive tools (`/map`, `/heist-payout-calculator`, `/heist-planner`, `/weapons`, `/vehicles`, `/properties`, `/animals`, `/radio`, `/cheats`, `/gta-6-100-completion-tracker/`).
- Live Playwright DOM audit confirmed **`0` unlabeled visible form controls** across all 10 pages.

---

## 14. Test Results (VERIFIED)

| Suite | Result | Details |
|---|---|---|
| `node --test tests/phase43-site-integrity.test.mjs` | **10/10 PASS** | Verifies all P0 & P1 invariants across JSON datasets and all 502 canonical HTML files |
| `node --test tests/community-discoveries.test.mjs` | **81/81 PASS** | All security, moderation, rate-limit, and sitemap invariants intact |
| `node --test tests/affiliate-analytics-security.test.mjs` | **8/8 PASS** | Security endpoints unchanged |
| `node --test tests/affiliate-click-deduplication.test.mjs` | **8/8 PASS** | Affiliate deduplication unchanged |
| `node --test tests/phase36-analytics-dashboard.test.mjs` | **10/10 PASS** | GA4 privacy/consent/UTM invariants unchanged |
| `node --check` (JS validation) | **PASS** | `world-db-engine.js`, `my-leonida.js`, `my-leonida-adapter.js`, `main.js` |
| `node scripts/seo-audit.mjs` | **0 new errors** | 502 sitemap URLs, 339 JSON-LD blocks, 1,179 `<img>` tags, 26,998 internal links verified; only pre-existing Phase 35-1c Amazon pause guardrail reported |

---

## 15. Desktop & Mobile QA (VERIFIED — Isolated Local Server + Playwright Chromium)

- **Viewports Tested:** `1440×900`, `1280×800`, `768×1024`, `390×844`, `360×800` across `/`, `/map`, `/weapons`, `/cheats`, `/port-gellhorn`, `/drops`, `/weapons/kl17g1-polymer-9mm-pistol`, `/vehicles/grotti-cheetah-classic`, `/missions/day-release`.
- **Horizontal Document Overflow:** `0` failures across all 45 viewport-page combinations (`scrollWidth - clientWidth <= 2px`).
- **Mobile Spec Tables:** `358px` table width inside `358px` wrapper at `390×844` and `328px` inside `328px` wrapper at `360×800` across weapon, vehicle, and mission templates (down from `520px` overflow).
- **Mobile Touch Targets:** `.pg-code-badge` copy buttons on `/port-gellhorn` measured `44px–90px` tall at `390×844` (up from `20px`).
- **Interactive Flows Verified:**
  - `/map`: `hasFooter: true`, `Found: 0 / 185 (0%)`, `Mount Kalaga National Park` pill active (`Mt. Kalaga` absent).
  - `/weapons`: `27` cards rendered; live search `"Kalinga"` -> `1` match, `"Ride Free"` -> `1` match.
  - `/cheats`: `6` confirmed, `53` unconfirmed, `2` conflicting, `0` `"Internal Tracker"` leaks.
  - `/giveaways` -> `301` -> `/drops` (`200`); `/gta-6-settings/` -> `200`.

---

## 16. Remaining Limitations

- Local Playwright run blocked third-party CDN hosts (`unpkg.com` Leaflet, ads/analytics) to guarantee strict isolation; live Leaflet map tile/marker rendering on Cloudflare Pages should be smoke-checked on a preview deploy before production promotion.
- `public/data/weapons.json` has 6 entries without verified local photography (5 melee/throwables + `black-eagle-kalinga-50`), intentionally rendered with `.wdb-placeholder` fallbacks.

---

## 17. Production Deployment Risks (ESTIMATED)

- **Low Risk:** All changes are static HTML/CSS/JSON and `_redirects` updates verified by 117 automated assertions and multi-viewport Playwright QA.
- **Note on `_redirects`:** Cloudflare Pages enforces `/giveaways /drops 301` at the edge; verify the 301 response header on a Cloudflare Pages preview deployment before promoting to production.
- **Preservation Confirmed:** Zero changes to GA4, AdSense, Auto Ads, Amazon/affiliate configurations, Cloudflare `wrangler.toml`, DNS, or hosting settings.

---

## 18. Recommended Next Steps

1. Review the isolated commit on `phase-43-site-integrity-cleanup` and test on a Cloudflare Pages preview deployment (verifying `/giveaways` -> `/drops` 301 header and live Leaflet map rendering on `/map`).
2. When approved, merge `phase-43-site-integrity-cleanup` into `main` and deploy.
3. Schedule a follow-up P2 polish phase for heavy image compression (>500 KB assets), below-the-fold `loading="lazy"`, homepage `BreadcrumbList` removal, `/gaming-gear/` `og:image`, `/my-leonida/` initial denominators/Import button, and Delights Cabaret (`2008`) map pin.
