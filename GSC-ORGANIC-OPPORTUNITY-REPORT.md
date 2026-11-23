# GTA6HEISTGUIDE.COM — GOOGLE SEARCH CONSOLE ORGANIC OPPORTUNITY REPORT

- **Target Property:** `https://www.gta6heistguide.com/` (and Domain property `sc-domain:gta6heistguide.com`)
- **Audit Date:** November 23, 2026
- **Baseline Production Commit Preserved:** `7ea7426` (tagged `rollback-7ea7426`)
- **Report Scope:** Sprint 1 Phase 2 — Google Search Console Access Verification, Required 90-Day & 28-Day Export Specification, and Structured Opportunity Framework

---

## 1. AUTHENTICATED ACCESS STATUS & LIMITATION DOCUMENTATION

### Live Session Verification Result
- **Status:** **UNAUTHENTICATED / ACCESS UNAVAILABLE IN AUTOMATED SESSION**
- **Verified Check (November 23, 2026):**
  1. Navigated to `https://search.google.com/search-console` via the automated browser session.
  2. Google Search Console redirected to `https://search.google.com/search-console/about`, and clicking "Start now" redirected to `https://accounts.google.com/ServiceLogin`, which is a protected authentication boundary and cannot be bypassed or signed into autonomously.
  3. Checked the local repository (`C:\Users\Shawn\Desktop\gta6heistguide`) and user Downloads (`C:\Users\Shawn\Downloads`) for existing Google Search Console CSV/ZIP exports or service account credentials — **none are present**.
  4. Confirmed that property verification tags remain intact on production (`public/index.html` meta tags + `public/google29e7fdcf68272179.html` and `public/googlec63f7e8032408675.html`).

### Strict Zero-Fabrication Policy
- **Zero impressions, clicks, CTRs, average positions, device splits, country splits, or indexing counts have been invented, estimated, or substituted.**
- Every metric cell below is marked `AWAITING GENUINE GSC CSV EXPORT` until the property owner provides the raw exports.

---

## 2. EXACT GENUINE CSV EXPORTS REQUESTED FROM PROPERTY OWNER

To populate this report with real Google Search Console performance data without sharing Google credentials, please export the following from **Google Search Console → `https://www.gta6heistguide.com/` (or `sc-domain:gta6heistguide.com`)**:

1. **Performance → Search results — Last 90 Days**
   - Date range: **Last 3 months**
   - Click **Export → Download CSV** (produces `Queries.csv`, `Pages.csv`, `Countries.csv`, `Devices.csv`, `Search Appearance.csv`, `Dates.csv`, `Filters.csv`)
2. **Performance → Search results — Last 28 Days vs. Previous 28 Days**
   - Date range: **Compare → Last 28 days to previous period**
   - Click **Export → Download CSV**
3. **Indexing → Pages**
   - Click **Export → Download CSV** (captures indexed vs. non-indexed important guide URLs and exact exclusion reasons such as *Crawled – currently not indexed*, *Discovered – currently not indexed*, or *Duplicate without user-selected canonical*)

**Recommended private storage path (outside `public/` and git-ignored):**
`C:\Users\Shawn\Desktop\gta6heistguide\gsc_private_exports\`

---

## 3. REQUIRED GSC ANALYSIS DIMENSIONS (READY FOR CSV INGESTION)

Once the CSV exports are placed in `gsc_private_exports/`, the analysis will populate all 8 required slices:

| # | Dimension | Source File | Status |
|---|---|---|---|
| 1 | Last 90 days overall trend | `90d/Dates.csv` | Awaiting CSV |
| 2 | Last 28 days vs. previous 28 days | `28d-compare/Queries.csv`, `Pages.csv` | Awaiting CSV |
| 3 | Top & striking-distance search queries (Pos 5–20) | `90d/Queries.csv` + `28d-compare/Queries.csv` | Awaiting CSV |
| 4 | Landing pages (impressions vs. clicks) | `90d/Pages.csv` + `28d-compare/Pages.csv` | Awaiting CSV |
| 5 | Mobile vs. Desktop performance | `90d/Devices.csv` | Awaiting CSV |
| 6 | United States vs. Other Countries | `90d/Countries.csv` | Awaiting CSV |
| 7 | Search Appearance (Rich Results, FAQs, Video, Web Light) | `90d/Search Appearance.csv` | Awaiting CSV |
| 8 | Indexed vs. Non-Indexed Important Guide Pages | `indexing/Pages.csv` | Awaiting CSV |

---

## 4. STRUCTURED OPPORTUNITY TABLE (POPULATE FROM GENUINE EXPORTS)

| Opportunity Category | Actual Query | Impressions | Clicks | CTR | Avg Position | Landing Page | Recommended Action |
|---|---|---|---|---|---|---|---|
| High-Impression / Low-CTR | *Awaiting GSC CSV* | — | — | — | — | — | Rewrite `<title>` & meta description to match exact player intent |
| Striking Distance (Pos 5–20) | *Awaiting GSC CSV* | — | — | — | — | — | Expand direct-answer section, internal links, and structured tables |
| High-Impression Page / Low Clicks | *Awaiting GSC CSV* | — | — | — | — | — | Audit SERP snippet, canonical alignment, and above-the-fold clarity |
| Competitor-Covered Query | *Awaiting GSC CSV* | — | — | — | — | — | Publish or upgrade dedicated canonical guide |
| Irrelevant Query Match | *Awaiting GSC CSV* | — | — | — | — | — | Tighten on-page H1/H2 semantics and remove off-topic boilerplate |
| Declining Query / Page (28d vs Prev 28d) | *Awaiting GSC CSV* | — | — | — | — | — | Refresh launch facts, verify patch changes, improve internal links |
| Emerging Search Trend (Nov 2026) | *Awaiting GSC CSV* | — | — | — | — | — | Prioritize Sprint 1 guides (Vice City Portal Easter Egg, Safe Codes, Mission Walkthroughs, Radio Soundtrack) |

---

## 5. IMMEDIATE ON-SITE ORGANIC OPPORTUNITIES IDENTIFIED FROM CODEBASE & LIVE COMPETITOR COVERAGE (NOV 23, 2026)

Even before GSC CSV ingestion, direct repository and competitor coverage audits on November 23, 2026 identified five high-intent organic search gaps addressed in Sprint 1:

1. **Timely Discovery — Vice City Portal Easter Egg (Nov 23, 2026):**
   - Covered by Kotaku, IGN, Vice, Dexerto, Insider Gaming, Beebom, and KeenGamer.
   - **Action:** Build `/guides/vice-city-portal-easter-egg.html` with Badger R&D Radio Tower start, all 12 LPL Substations in order (`LIFEISPASSINGMEBY`), exact switch/button inputs, Reactor 2 (19:00–06:00), Tommy Vercetti shirt & Biker Angel motorcycle rewards, fast-travel/character-switch reset warning, 12 verified map pins, and persistent progress checklist.
2. **High-Intent Utility — Complete GTA 6 Safe Codes & Keypad Combinations:**
   - Dedicated guides exist on Radio Times, Vice, Space4Games, GTA Base, and Sortiraparis; our site previously scattered codes across `/gta-6-money-guide/` and `/map.html`.
   - **Action:** Publish `/guides/gta-6-safe-codes.html` separating fixed story mission codes (`7700`, `0420`), fixed gang-operation safes (`0300`, `6769`, `6823`, `6969`, `7777`, `2121`, `4124`, `1965`, `1122`, `8046`), fixed doors/garages (`0212`, `2341`, `2727`, `69185`, `092319`), and randomized free-roam robbery safes.
3. **Mission Walkthrough Depth (`/missions/`):**
   - Expanding from 6 walkthroughs toward chapter-by-chapter verified coverage (Prologue, Chapter 1, Chapter 2, Chapter 3, Chapter 4, Chapter 5) with clear completed vs. pending counts.
4. **Radio & Soundtrack Searchability (`/radio.html`):**
   - Expanding the 23-station database with song-title search, artist search, station filter, DJ/host metadata, unlockable station status, verification source, and last-checked date.
5. **Trust & Compliance Reconciliation (Phase 1):**
   - Fixed the cheats page contradiction (`61 VERIFIED CHEATS` vs. `1 Verified / 60 Unconfirmed`), removed remaining Eneba affiliate/promotional code, separated the 42 unconfirmed real-world reference animal pins from the confirmed GTA VI map layer, and replaced the overclaiming homepage hero headline.
