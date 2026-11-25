# PHASE 26 — COMPLETE WEBSITE VISUAL OVERHAUL, IMAGE LIBRARY INTEGRATION, RETENTION & AFFILIATE MONETIZATION REPORT

**Project:** GTA6HeistGuide.com  
**Production:** https://www.gta6heistguide.com  
**Branch:** `phase-26-retention-visual-monetization`  
**Verified Baseline:** Phase 25.1 commit `5c93c86b5311332d055921f1c1b4c54f0ab5a80d`  
**Pre-Release Production Rollback Reference:** `f7e949fc335458a7e14be6d2a8e0f281e350dee5` (Cloudflare Pages Deployment ID `3ec0e6e9-e4aa-40c1-9cc1-9e4d85906fc3` — `https://3ec0e6e9.gta6heistguide.pages.dev`)  
**Phase 26 Preview Deployment:** `https://2d980ecd.gta6heistguide.pages.dev` (`https://phase-26-retention-visual-mo.gta6heistguide.pages.dev`)  
**Date:** 2026-11-24

---

## 1. Executive Summary

Phase 26 transformed GTA6HeistGuide.com from a text-heavy directory into a visually cohesive, evidence-accurate GTA VI destination without altering any security boundaries, D1 schemas, Turnstile checks, Cloudflare Access policies, or untracked user files.

Key outcomes:
- **Discovered and inventoried all 3 local GTA image libraries** (1,583 total image records audited with dimensions, aspect ratios, file sizes, formats, and SHA-256 hashes in `seo_reports/phase26/phase26-image-asset-audit.csv`, plus 7 grouped visual contact sheets in `seo_reports/phase26/contact_sheets/`).
- **Extracted and web-optimized 55 genuine official Rockstar Games GTA VI screenshots** (1600×900 JPG + 800w/1200w WebP) directly from `GTA6-ROCKSTAR-HIGH-QUALITY-LIBRARY` ZIP press kits (preserving all original ZIPs and files untouched) and catalogued them in `public/data/image-library-manifest.json`.
- **Upgraded World Database visual coverage:**
  - Properties: **1/27 → 27/27** verified official Rockstar screenshots (with explicit `Regional Visual` provenance labels where an exact interior/exterior is not shown).
  - Weapons: **6/25 → 20/25** verified official Rockstar weapon screenshots (honest category placeholders retained for the 5 unconfirmed melee/throwables; zero fake firearm photos).
  - Gun Stores (`/weapons-bonuses`): **0/24 → 24/24** verified storefront/regional Leonida visuals.
  - Vehicles: **33/33** visually audited and verified (zero mismatches, zero stretching), upgraded with **visual class section headers** and **side-by-side comparison thumbnails**.
  - Animals: **49/49** visually audited; created a crisp alligator-focused 16:9 crop from official 4K `Grassrivers_01.jpg` for American Alligator, authenticated Florida Panther (`Mount_Kalaga_National_Park_05.jpg`) and Green Iguana (`Leonida_Keys_06.jpg`), and corrected Marsh Snake (`Grassrivers_07.jpg`) to **`Unidentified Leonida Snake`** removing unsupported taxonomy (`Agkistrodon / Crotalus sp.`), venom, rattling, and Mount Kalaga habitat claims.
- **Homepage, Navigation & Map UX Fixes:**
  - Replaced stale `VERIFIED NOV 23, 2026` and `UPDATED DAILY` / `New Discoveries Today` copy with data-driven `Latest Verified Discoveries`.
  - Fixed mismatched homepage World Database Gallery thumbnails (Animals, Weapons, Gun Stores, Properties) and added a 6-card **Featured Leonida Regions** visual showcase.
  - Fixed homepage heist card & expanded drawer heading wrapping (`text-wrap: balance`, `min-width: 0`, natural word breaks).
  - Added **desktop fine-pointer hover dropdowns** with hover-bridge gap coverage, 160ms close-intent timer, keyboard Arrow/Escape navigation, and preserved mobile tap-to-open across `GUIDES`, `TIPS`, `TOOLS`, and `DATABASE`.
  - Fixed `/map` pin popup positioning on desktop (increased anchor clearance, `.is-selected-pin` ring, smart viewport auto-pan) and added a **compact mobile bottom-sheet (`#mobilePinSheet`)** that pans the selected pin into the upper visible map area.
  - Added browser-local **"Continue Where You Left Off"** retention bar (`localStorage`, zero cookies, zero login).
- **Value-First Affiliate Monetization:**
  - Replaced expensive flagship homepage picks (`DualSense Edge`, `Samsung 990 PRO 2TB`, `Arctis Nova 7P`) with affordable, value-first GTA VI essentials (`PS5 DualSense Charging Station`, `Crucial T500 M.2 SSD with Heatsink`, `KontrolFreek Galaxy Thumbsticks`) preserving tracking tag `gta6heistguid-20`.
  - Audited all 5 disclosed affiliate partners (`seo_reports/phase26/affiliate-inventory.csv`) and display advertising/analytics (`seo_reports/phase26/retention-and-analytics-audit.md`).

---

## 2. Git Branch & Baseline

- **Branch created:** `phase-26-retention-visual-monetization`
- **Branched from:** `5c93c86b5311332d055921f1c1b4c54f0ab5a80d` (Phase 25.1 baseline)
- **Production prior to Phase 26:** `f7e949fc335458a7e14be6d2a8e0f281e350dee5` (Phase 24)
- **Untracked user files preserved:** All existing untracked markdown reports, `scripts/`, `verification-screenshots/`, and `GTA6_APPROVED_IMAGE_LIBRARY/review_candidates_unverified/` were preserved untouched.
- **Protected systems untouched:** Zero modifications to D1 schemas/data, Turnstile, Cloudflare Access, moderation logic, secrets, `_redirects`, or `_headers`.

---

## 3. Discovered Three GTA Image Folders

1. **`GTA6-ROCKSTAR-HIGH-QUALITY-LIBRARY/`**
   - Contains 4 official Rockstar Games high-resolution ZIP archives (preserved untouched):
     - `GTAVI_Screenshots.zip` (138 official 4K JPGs across `People/` and `Places/` — Vice City, Leonida Keys, Grassrivers, Port Gellhorn, Ambrosia, Mount Kalaga National Park)
     - `GTAVI_Ultimate_Edition_Benefits.zip` (51 official 4K JPGs — Safehouse Vehicles, Rideout Customs, Grotti Cheetah, Hawk & Little Morgan Revolvers, Weapon Variants, Squalo, Wyman Car Collection, PTT Store, Stock 305, etc.)
     - `GTAVI_Vintage_Vice_City_Pack.zip` (12 official 4K JPGs — Vapid Stanier, Vintage Vice City Weapon Pattern, etc.)
     - `GTAVI_Videos.zip` (9 official MP4 clips)
2. **`GTA6_APPROVED_IMAGE_LIBRARY/`**
   - Structured repository library containing `originals/`, `web/`, `contact_sheets/`, `manifests/`, and `review_candidates_unverified/`.
3. **`public/assets/`** (and source `assets/`)
   - Live web-served image directories (`public/assets/images/animals`, `vehicles`, `properties`, `weapons`, `gun-stores`, `heists`, `intel`, `regions`, `radio`, `gear`, `maps`, plus root `public/assets/`).

---

## 4. Total Image Files Inventoried

- **Total image records inventoried:** **1,583** (recorded with exact filename, full relative path, dimensions, aspect ratio, file size, format, SHA-256 hash, category, provenance, verification tier, and intended pages in [`seo_reports/phase26/phase26-image-asset-audit.csv`](seo_reports/phase26/phase26-image-asset-audit.csv)).
- **Visual contact sheets generated (`seo_reports/phase26/contact_sheets/`):**
  - `01_rockstar_places_leonida.jpg` (61 official Leonida location screenshots)
  - `02a_rockstar_people_part1.jpg` & `02b_rockstar_people_part2.jpg` (77 official character, weapon, and heist screenshots)
  - `03_rockstar_ultimate_and_vintage.jpg` (63 official Ultimate Edition & Vintage Vice City Pack screenshots)
  - `04_animals_tier_a_current.jpg` (current Tier A animal visual check)
  - `05_properties_current.jpg` (visual audit exposing legacy mismatched property images)
  - `06_weapons_current.jpg` (visual audit exposing legacy mismatched weapon images)
  - `07_vehicles_remaining_12.jpg` (visual audit of the 12 non-4K-locked vehicles)

---

## 5. Images Approved for Use

- **55 official Rockstar Games GTA VI screenshots** extracted non-destructively from `GTA6-ROCKSTAR-HIGH-QUALITY-LIBRARY` ZIP archives, normalized to 16:9 (1600×900 JPG + 800w/1200w WebP), and registered in [`public/data/image-library-manifest.json`](public/data/image-library-manifest.json):
  - **23 Properties & Regional Location visuals** (`public/assets/images/properties/gtavi-*`)
  - **15 Weapon & Heist Loadout visuals** (`public/assets/images/weapons/gtavi-*`)
  - **17 Gun Store & Regional Outlet visuals** (`public/assets/images/gun-stores/gtavi-*`)
- **1 alligator-focused 16:9 crop** from official 4K `Grassrivers_01.jpg` (`public/assets/images/animals/gtavi-american-alligator-grassrivers-closeup.jpg` + 800w/1200w/1600w WebP).
- **All 33 existing vehicle screenshots** (`21` 4K Rockstar + `12` verified GTA VI gameplay screenshots) retained after full visual inspection.
- **All 42 Tier C Wikimedia Commons wildlife reference photos** retained with photographer attribution and CC/Public Domain licenses clearly labeled as `Real-World Reference — GTA VI Presence Unconfirmed`.

---

## 6. Images Rejected and Why

Visual inspection of existing `public/assets/images/properties/` and `public/assets/images/weapons/` caught major filename-vs-subject mismatches that were removed from active hub/card usage (original files preserved on disk per Section 1):
- `weapon-duo-heist.jpg`: Depicts Jason and Lucia in a nightclub with **no weapons**.
- `weapon-goodtime-gear.jpg`: Depicts two people in Vice City t-shirts with **no weapons or gun store** (was incorrectly used on the Homepage & Hub Gun Stores card).
- `weapon-jason-rifle.jpg`: Depicts Jason driving a car with **no rifle** (was incorrectly used on the Homepage & Hub Weapons card).
- `downtown-bay.jpg`, `little-cuba-garage.jpg`, `vice-beach-garage.jpg`, `keys-safehouse.jpg`, `kalaga-lodge.jpg`, `gellhorn-industrial.jpg`: Depicted unrelated characters, nightclub scenes, beachgoers, or a helicopter rather than buildings/garages.
- Zero AI-generated images, zero scraped Google Images thumbnails, and zero fabricated real-world firearm photos were added.

---

## 7. Page-by-Page Image Coverage

| Route / Page | Before Phase 26 | After Phase 26 | Notes |
|---|---|---|---|
| `/` (Homepage) | Mismatched Weapons/Gun Stores thumbnails; wide Alligator crop | 100% verified Rockstar shots + 6 Featured Region cards | Fixed all 6 DB cards + added 6 Leonida region cards |
| `/animals` | 49/49 (7 Tier A + 42 Tier C), Snake overclaimed, Alligator small in corner | 49/49 verified; crisp Alligator close-up; Snake corrected | All 7 Tier A linked to exact Rockstar filenames |
| `/properties` | 1/27 images | **27/27** verified official Rockstar visuals | Exact shots + clearly labeled Regional Visuals |
| `/vehicles` | 33/33 images | **33/33** visually verified + class headers + compare thumbnails | Zero broken/stretched vehicles |
| `/weapons` | 6/25 images | **20/25** verified official Rockstar shots | 5 unconfirmed melee/throwables use honest placeholders |
| `/weapons-bonuses` (Gun Stores) | 0/24 images | **24/24** verified storefront/regional Leonida visuals | Honest regional/store visual captions |
| `/gta-6-database/` | Mismatched Weapons/Gun Stores thumbnails | 6/6 verified thumbnails | Synchronized with Homepage |
| 16 Long-Form Guides & Location Pages | Text-heavy walls | 1–2 verified 16:9 editorial `<figure>` visuals per page | Placed after opening quick-answers |

---

## 8. Animal Image Correction Findings (`/animals`)

1. **American Alligator (`an-alligator`):** Authentic official Rockstar screenshot (`Grassrivers_01.jpg`), but in the wide frame the alligator sat in the bottom-left corner behind three muddy swamp hunters. Created a clean 16:9 alligator-focused derivative (`gtavi-american-alligator-grassrivers-closeup.jpg` + WebP) directly from the 4K `Grassrivers_01.jpg` master so the alligator is immediately unmistakable.
2. **Florida Panther (`an-panther`):** Visually verified against official Rockstar `Mount_Kalaga_National_Park_05.jpg` — genuinely depicts a Florida Panther (`Puma concolor coryi`) crossing a sunlit stream with White-tailed Deer on the opposite bank. Added explicit focal positioning (`25% 70%`) and exact filename provenance.
3. **Green Iguana (`an-green-iguana`):** Visually verified against Rockstar's official **`Leonida_Keys_06.jpg`** screenshot inside `GTAVI_Screenshots.zip`. The local asset is 100% authentic and matches Rockstar's official gallery (`Leonida Keys 06`). Retained verified classification and updated provenance metadata.
4. **Marsh Snake / Leonida Viper (`an-snake`):** Visually verified against official Rockstar `Grassrivers_07.jpg` (a large patterned snake draped over a resident's shoulder at a Grassrivers camp). **Removed all unsupported claims:**
   - Renamed to **`Unidentified Leonida Snake`**
   - Removed `Agkistrodon / Crotalus sp.` → `Unidentified species (Serpentes)`
   - Removed `Venomous / Cautious` → `Unconfirmed (Venom & wild behavior unverified)`
   - Removed warning rattle, Mount Kalaga habitat, and `target-deck` tag claims.
5. **All 42 Tier C Reference Entries:** Visually verified on `verified_all_49_animals_tier_a_and_c.jpg`; photographer credits, CC/Public Domain licenses, and `GTA VI Presence Unconfirmed` badges preserved.

---

## 9. Properties Visual Improvements (`/properties`)

- Upgraded `public/data/properties.json` and `data/properties.json` from **1/27** to **27/27** verified official Rockstar screenshots.
- Exact property/location visuals used for Key Lento Safehouse (`ULTIMATE_EDITION_SAFEHOUSE_VEHICLES_01.jpg`), Port Gellhorn Motel (`Port_Gellhorn_01.jpg`), Rideout Customs Garage (`ULTIMATE_EDITION_RIDEOUT_CUSTOMS_03.jpg`), Brian Heder's Boatyard (`Brian_Heder_04.jpg`), and Port Gellhorn Pawn & Cash (`Lucia_Caminos_08.jpg`).
- Regional Leonida screenshots used for remaining garages/fences with explicit `📍 Regional GTA VI Visual` badges and caption bars in `world-db-engine.js` so visitors are never misled.
- Preserved accurate Story Mode ownership rules (0 purchasable story houses; no fabricated prices).

---

## 10. Vehicle Image Corrections (`/vehicles`)

- Visually audited all 33 vehicle screenshots (21 locked 4K Rockstar shots + 12 verified GTA VI gameplay shots via `07_vehicles_remaining_12.jpg`). All 33 accurately match their labeled vehicles with proper 16:9 aspect ratios.
- Upgraded `world-db-engine.js` to render **visual class section breaks** (Super, Sports, Sports Classics, Muscle, Off-Road, SUVs & Pickups, Motorcycles, Boats & Watercraft, Helicopters & Planes, Emergency) when viewing all vehicles.
- Upgraded the **Side-by-Side Compare Modal** to render 16:9 vehicle thumbnails in the comparison table headers while preserving Owned, Favorites, Share, and Map Pin functionality.

---

## 11. Weapon & Gun-Store Image Improvements (`/weapons`, `/weapons-bonuses`)

- **Weapons:** Upgraded from 6/25 to **20/25** verified official Rockstar weapon screenshots covering Handguns, Revolvers, SMGs, Rifles, Shotguns, Snipers & Hunting, Heavy, and Combat Knife, with focal positioning and side-by-side Compare Modal thumbnails. Left the 5 unconfirmed melee/throwable items with honest category placeholders rather than fake firearm photos.
- **Gun Stores (`/weapons-bonuses`):** Upgraded from 0/24 to **24/24** verified Leonida storefront and regional location screenshots across all 5 counties with honest `📍 Regional GTA VI Visual` labels.

---

## 12. Homepage Changes (`/`)

- **Freshness & Trust:** Removed stale `VERIFIED NOV 23, 2026` hero text and `UPDATED DAILY` / `New Discoveries Today` headings; replaced with data-driven `Latest Verified Discoveries` synced from `/data/discoveries.json`.
- **Hero:** Clearer headline (`VERIFIED HEISTS. LEONIDA MAP. WORLD DATABASE.`) with immediate top-fold CTAs for Interactive Leonida Map, Heist Walkthroughs, World Database, and Money Guide.
- **World Database Gallery:** Fixed all 6 database card thumbnails with verified official Rockstar screenshots.
- **Featured Leonida Regions:** Added a 6-card visual region showcase linking to Vice City, Leonida Keys, Port Gellhorn, Grassrivers, Ambrosia, and Mount Kalaga guides.
- **Retention:** Added browser-local `#p26ContinueBar` ("Continue Where You Left Off").

---

## 13. Heist-Heading Wrap Fix

- Fixed `.targets-grid .card-title`, `.vault-card-redesign .card-title`, `.heist-extra-target h3`, and `.heist-drawer-header` in `public/assets/style.css`:
  - Applied `min-width: 0`, `flex: 1 1 auto`, `text-wrap: balance`, `word-break: normal`, `overflow-wrap: break-word`, `hyphens: none`, and clean `flex-wrap: wrap` on `.vault-card-top` so badges and headings never collide or split mid-word at desktop, tablet, or mobile widths.

---

## 14. Navigation Hover Behavior

- Implemented desktop fine-pointer hover menus in `public/site-config.js` and `public/assets/style.css` across all 4 dropdown groups (`GUIDES`, `TIPS`, `TOOLS`, `DATABASE`):
  - `@media (hover: hover) and (pointer: fine) and (min-width: 1024px)` + invisible `::before` hover bridge across the 6px gap + 160ms close-intent delay so moving the cursor from button to menu never prematurely closes it.
  - Full keyboard support (`focusin`/`focusout`, `ArrowDown`/`ArrowUp` item navigation, `Escape` closes and returns focus, `:focus-visible` outlines, accurate `aria-expanded`).
  - Mobile/touchscreens retain tap-to-open behavior without hover interference.

---

## 15. Map Popup Correction (`/map`)

- **Desktop:** Increased marker `popupAnchor` to `[0, -24]` with `offset: [0, -6]`, added `.is-selected-pin` cyan highlight ring + `zIndexOffset: 1000`, `max-height: 52vh` scroll safety, and a smart `selectPinMarker` clearance check that smoothly pans the map if the popup clips the top edge or overlaps the marker center.
- **Mobile (`<= 768px`):** Added `#mobilePinSheet` compact bottom sheet (`max-height: 44vh`, sticky close button `×`) that automatically pans the selected marker into the upper visible 55% of the map so the pin is never obscured.

---

## 16. Affiliate Product Audit & 17. Retained vs. Removed Recommendations

- **Audited live homepage picks:**
  - Removed from homepage default showcase: `PlayStation DualSense Edge Wireless Controller` ($199 flagship), `Samsung 990 PRO 2TB M.2 SSD` (premium tier), `SteelSeries Arctis Nova 7P` ($179 mid-high tier).
  - Replaced with value-first, ASIN-verified GTA VI essentials (all tagged `gta6heistguid-20`):
    1. **PlayStation 5 DualSense Charging Station** (`B08FC6Y4VG`) — affordable dual drop-in charger.
    2. **Crucial T500 PCIe 4.0 M.2 SSD with Heatsink** (`B0CK39YR41`) — value-focused PS5-compatible NVMe SSD.
    3. **KontrolFreek Galaxy Performance Thumbsticks** (`B08DP7Z725`) — budget aim & steering grips.
- **Updated `public/js/affiliates.js` `CONTEXT_POOLS`** to prioritize value-first accessories (`dualsenseDock`, `crucialT500`, `kontrolfreek`, `headsetStand`, `cableKit`, `dualsense`, `xboxController`) across homepage, vehicles, map, and default pools.
- **Compliance:** Preserved `tag=gta6heistguid-20`, clear `Sponsored · Paid link` badges, and FTC/Amazon Associates disclosure; avoided unverified scraped Amazon product images (clean dark info cards used per Amazon Associates Operating Agreement).

---

## 18. Existing Affiliate Partner Inventory

Full CSV inventory generated at [`seo_reports/phase26/affiliate-inventory.csv`](seo_reports/phase26/affiliate-inventory.csv) covering:
- **Amazon Associates (`gta6heistguid-20`)** — Active & tracked across site.
- **G2A Goldmine (`reflink-4094b9aab5`)** — Configured in `site-config.js` & `affiliates.js`.
- **ExitLag (`refer/10386953`)** — Configured; low relevance until GTA 6 Online / PC launch.
- **Gumroad (`apexlocallabs`)** — CutFlow Pro / Apex Pro Bundle creator tools.
- **Eneba** — Confirmed removed/inactive (0 links).

---

## 19. Advertising Integration Findings

Full audit in [`seo_reports/phase26/retention-and-analytics-audit.md`](seo_reports/phase26/retention-and-analytics-audit.md):
- Google AdSense placeholder slots (`<div class="adsense-slot">`) exist, with `adsensePublisherId: ""` (disabled / not approved yet).
- Zero duplicate ad scripts, zero CLS impact, zero interference with map controls or dropdowns.

---

## 20. Retention Improvements

- Added browser-local **"Continue Where You Left Off"** bar (`#p26ContinueBar`) powered by `localStorage['gta6_recent_pages_v1']` (zero cookies, zero login, includes Clear History).
- Added 6-card **Featured Leonida Regions** visual navigation strip on the homepage.
- Added verified 16:9 editorial screenshots to **16 long-form location, money, property, vehicle, and heist guides**.
- Full analytics/retention audit saved in [`seo_reports/phase26/retention-and-analytics-audit.md`](seo_reports/phase26/retention-and-analytics-audit.md).

---

## 21. SEO & Accessibility Safeguards

- Ran full 500-page `seo_audit_engine.py` (Stage 1 HTML + Stage 2 Playwright Chromium):
  - **500 / 500** HTTP 200 OK
  - **0** missing `<title>`, **0** missing `<meta description>`, **0** missing canonical URLs
  - **0** missing or duplicate `<h1>` tags
  - **0** missing `alt` attributes
  - **0** invalid JSON-LD blocks
  - **0** broken local images across all 500 pages in Playwright
  - **500 / 500** `site-config.js` loaded cleanly
- Ran `scripts/phase26_verify_all.py`: **0** missing JSON image files, **0** missing HTML `<img>` files on core pages, **3/3** homepage Amazon links verified with `tag=gta6heistguid-20`.
- Ran `node --check` on all modified JS files (`JS_SYNTAX_OK`) and `node --test tests/community-discoveries.test.mjs` (**73/73 security & unit tests passed**).

---

## 22. Desktop & Mobile QA

- **Preview URL tested:** `https://2d980ecd.gta6heistguide.pages.dev` (Host-verified origin)
- **Homepage (`/`):** PASS at `1280×800` & `390×844` — 0 JS console errors, 23/23 images loaded (0 broken), 0 horizontal overflow, all 4 desktop hover dropdowns (`GUIDES`, `TIPS`, `TOOLS`, `DATABASE`) opened cleanly on hover, Story Heists drawer header wrapped cleanly without collision, all 6 World Database Gallery thumbnails verified, all 3 value-first Amazon picks verified with `tag=gta6heistguid-20`, `Latest Verified Discoveries` verified (no `UPDATED DAILY` or `VERIFIED NOV 23, 2026`), and browser-local "Continue Where You Left Off" bar verified.
- **Animals (`/animals`):** PASS — 51/51 images rendered, verified `gtavi-american-alligator-grassrivers-closeup.jpg`, `gtavi-florida-panther-mount-kalaga-stream.jpg`, `gtavi-green-iguana-leonida-keys-rocks.jpg`, `Unidentified Leonida Snake` (`gtavi-marsh-snake-grassrivers-camp.jpg`), and confirmed `"Agkistrodon"` does not appear.
- **Database Pages:** PASS — `/properties` (27/27 images), `/vehicles` (33/33 images + 7 class section headers + side-by-side Compare modal thumbnails verified), `/weapons` (20/20 images), `/weapons-bonuses` (25/25 images), 0 failed requests.
- **Interactive Map (`/map`):**
  - Desktop (`1280×800`): PASS — `.is-selected-pin` remained visible below popup (`desktopOverlaps: false`).
  - Mobile (`390×844`): `#mobilePinSheet` opened and closed cleanly; QA caught a `flex-wrap` overflow on `.popup-actions-row` (`419.2px` > `390px`), which was immediately fixed in `public/map.html` (`max-width: calc(100vw - 16px); overflow-x: hidden;` + `flex-wrap: wrap;` on `#mobilePinSheet .popup-actions-row`) prior to production release.

---

## 23. Production Deployment Information

- **Branch:** `phase-26-retention-visual-monetization`
- **Production Deployment:** Deployed via authorized Cloudflare Pages workflow (`npx wrangler pages deploy public --project-name=gta6heistguide --branch=main`) after all tests, SEO checks, and Preview QA passed.

---

## 24. Rollback Reference

- **Previous Production Commit:** `f7e949fc335458a7e14be6d2a8e0f281e350dee5`
- **Cloudflare Pages Rollback Deployment ID:** `3ec0e6e9-e4aa-40c1-9cc1-9e4d85906fc3` (`https://3ec0e6e9.gta6heistguide.pages.dev`)

---

## 25. Remaining Limitations

1. **Amazon Product Thumbnails:** Amazon Associates Creators API requires 10 qualifying sales in the trailing 30 days before server-side authorized product imagery can be fetched; until approved, clean dark product-information cards remain active for full Amazon Associates Operating Agreement compliance.
2. **Analytics Telemetry:** `ga4MeasurementId` in `public/site-config.js` is currently blank `""`; enabling Cloudflare Web Analytics (zero-cookie) in the Cloudflare Pages dashboard or adding a GA4 Measurement ID is recommended to record live engagement metrics post-Phase-26.
3. **5 Unconfirmed Melee/Throwable Weapons:** Baseball Bat, Crowbar, Frag Grenade, Molotov Cocktail, and Flashbang retain honest category placeholders until official GTA VI screenshots depict them.
