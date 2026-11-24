# GTA6HEISTGUIDE — PHASE 25: SEARCH CONSOLE BASELINE, CTR MONITORING & POST-DEPLOYMENT MEASUREMENT REPORT

- **Audit & Baseline Date:** November 24, 2026 (`~4:30 PM CST`)
- **Mode:** **STRICTLY MEASUREMENT-ONLY** (zero website content, code, title, meta description, sitemap, `robots.txt`, `_headers`, `_redirects`, D1, Worker/Function, Turnstile, Cloudflare Access, moderation, or secret changes; zero deployments; zero rollbacks; zero manual Google `Request Indexing` submissions)
- **Production Domain:** `https://www.gta6heistguide.com`
- **Repository:** `C:\Users\Shawn\Desktop\gta6heistguide`
- **Phase 25 Branch:** `phase-25-seo-measurement-baseline` (branched from verified Phase 24 HEAD `88172f45c37a73de25154e2418380f4b35e0940f`)
- **Verified Production Deployment Commit (Cloudflare Pages):** `f7e949fc335458a7e14be6d2a8e0f281e350dee5` (`f7e949f`, deployment ID `3ec0e6e9-e4aa-40c1-9cc1-9e4d85906fc3`, preview URL `https://3ec0e6e9.gta6heistguide.pages.dev`)
- **Phase 24 Final Report Commit (Docs Only, Not Deployed):** `88172f45c37a73de25154e2418380f4b35e0940f` (`88172f4`)
- **Phase 22 Rollback Reference Deployment:** `2c5f52de-8315-4bbf-b652-1627851f563c` (`https://2c5f52de.gta6heistguide.pages.dev`, commit `cf8bb5a`) — preserved intact
- **Raw & Derived Exports:** `seo_reports/phase25/` (`9` CSV files: `7` unchanged raw Google Search Console exports + `2` reproducible Phase 25 verification exports, plus `validate_phase25_baseline.py` Phase 25.1 reconciliation script)
- **Phase 25.1 Reconciliation Audit:** Completed November 24, 2026 — all headline, canonical/legacy, cohort, and internal-link figures independently verified against raw exports (see Section 15: *Data Reconciliation & Metric Integrity*)

---

## 1. Executive Summary

1. **Production & Repository Verification (Verified Facts):**
   - Cloudflare Pages deployment metadata (`npx wrangler pages deployment list --project-name=gta6heistguide`) confirms that live production `https://www.gta6heistguide.com` is serving deployment `3ec0e6e9-e4aa-40c1-9cc1-9e4d85906fc3` built from Phase 24 implementation commit `f7e949fc335458a7e14be6d2a8e0f281e350dee5` (`f7e949f`).
   - Phase 24 final report commit `88172f45c37a73de25154e2418380f4b35e0940f` (`88172f4`) is a docs-only commit on top of `f7e949f` and is distinct from the deployed commit.
   - Live HTTP inspection confirms `https://www.gta6heistguide.com` serves Phase 24 HTML (e.g., `/heist-planner` `43c` title, `/port-gellhorn` `#quick-answers` table, all `29/29` hub-matrix links, `23/23` `/radio/*` links, and `24/24` `/animals/*` links).
   - Live Community Discoveries endpoints confirm `total: 0` (`/api/community-discoveries/list`) and `total_pins: 0` (`/api/community-discoveries/map-pins`); Community Verified Pins and related-guide callouts remain gated and disabled.
2. **Pre-Phase-24 Search Console Baseline (`2026-10-27` – `2026-11-23`; Active Data `2026-11-17` – `2026-11-23`):**
   - Authenticated read-only access to Google Search Console (`https://www.gta6heistguide.com/`, `Last update: 4 hours ago`) confirmed that **`2026-11-23`** is now available as a complete day (`53` clicks, `6,230` impressions, `0.85%` CTR, `7.6` avg position).
   - Within the requested 28-day baseline window (`2026-10-27` – `2026-11-23`), actual observed Search Console performance spans only **`7` active reporting days** (`2026-11-17` – `2026-11-23`; GSC property tracking began `2026-11-16` with `0` impressions, and `0` historical data exists before property tracking began). Across those `7` active reporting days, the site recorded **`200` clicks**, **`22,117` impressions**, **`0.90%` average CTR**, and **`7.7` average position**. These figures represent `7` active days of observed search performance — not `28` days of observed search performance.
   - The preceding 28-day comparison window (`2026-09-29` – `2026-10-26`) contains **`0` clicks and `0` impressions** because no Search Console data exists before `2026-11-17`.
   - **Zero (`0`) complete post-deployment days exist** as of `2026-11-24`. No causal SEO conclusions can be attributed to Phase 24 yet.
3. **Cohort Coverage & Deduplication:**
   - Phase 24 modified **`32` tracked files** under `public/` (`31` canonical HTML pages + `1` JS module `public/assets/community/cd-submit.js`).
   - Including the `24` `/animals/*` profile pages evaluated in Cohort D alongside the `31` modified canonical HTML pages, this baseline evaluates **`55` unique canonical URLs** (zero double-counting across overlapping cohorts; `55/55` verified present in live `https://www.gta6heistguide.com/sitemap.xml`).
   - Across those `55` unique canonical URLs, `14` generated pre-deployment impressions (`64` clicks, `11,698` impressions, `0.55%` aggregate CTR), while `41` (`13` enriched `/radio/*` spokes, `24` `/animals/*` profiles, `/vehicles`, `/guides/sinfrontera-national-bank`, `/guides/gta-6-safe-codes`, and `/gta-6-glitches/`) had `0` canonical impressions during `Oct 27 – Nov 23`.
4. **Live Indexing & Canonical Findings (7 Read-Only URL Inspections on `Nov 24`):**
   - `3` inspected pages are **`Page is indexed`**: `/port-gellhorn`, `/gameplay-mechanics`, and `/radio`.
   - `3` inspected pages are **`Crawled - currently not indexed`**: `/heist-planner` (crawled `Nov 24, 2:24 PM`, *before* Phase 24 removed promotional `<h2>` headings), `/heists/the-cartel-heist` (crawled `Nov 24, 2:52 PM`, during `/sinfrontera-bank` 301 consolidation), and `/vehicles` (crawled `Nov 24, 11:43 AM`, *before* Phase 24 added `#vehicle-trunk-storage-table`, while `/vehicles-getaway-cars` 301s into `/vehicles`).
   - `1` inspected page is **`URL is unknown to Google`**: `/guides/sinfrontera-national-bank` (newly entered the `500`-URL sitemap on `Nov 24`).
   - **Zero (`0`) canonical disagreements** were found across all `6` crawled URLs (`Google-selected canonical` matched `User-declared canonical` on `6/6`).
5. **Internal-Link Verification:**
   - Live production HTML verified **`29/29`** hub-to-Phase-6–20 links (`27` newly added in Phase 24 + `2` pre-existing deduplicated links on `/port-gellhorn`), **`23/23`** `/radio/*` static directory links on `/radio`, and **`24/24`** `/animals/*` static directory links on `/animals` as standard crawlable `<a href="...">` tags with **`0` broken destinations** (all HTTP `200`).
   - Total sitewide internal links verified via `node scripts/seo-audit.mjs`: **`23,896`** (`500` canonical sitemap URLs, `337` valid JSON-LD blocks, `0` warnings, `0` fatal errors).

---

## 2. Verified Production Deployment Commit

| Metadata Field | Verified Value | Verification Source |
|---|---|---|
| **Cloudflare Pages Project** | `gta6heistguide` | `npx wrangler pages deployment list --project-name=gta6heistguide` |
| **Active Production Deployment ID** | `3ec0e6e9-e4aa-40c1-9cc1-9e4d85906fc3` | Wrangler Pages deployment list (`Production`, `main`) |
| **Active Production Preview URL** | `https://3ec0e6e9.gta6heistguide.pages.dev` | Wrangler Pages deployment list |
| **Deployed Implementation Commit** | `f7e949fc335458a7e14be6d2a8e0f281e350dee5` (`f7e949f`) | Wrangler `Source` column (`f7e949f`) + `git cat-file -t` |
| **Phase 24 Final Report Commit** | `88172f45c37a73de25154e2418380f4b35e0940f` (`88172f4`) | `git log -n 2 --oneline` (adds `PHASE-24-CONTENT-CTR-INTERNAL-LINKING-REPORT.md` only; not deployed) |
| **Phase 22 Rollback Reference ID** | `2c5f52de-8315-4bbf-b652-1627851f563c` (`cf8bb5a`) | Wrangler Pages deployment list (`https://2c5f52de.gta6heistguide.pages.dev`) |
| **Live Production Origin Check** | `HTTP/1.1 200 OK` (`https://www.gta6heistguide.com/`) | `curl.exe -sI` (`Date: Tue, 24 Nov 2026 22:28:09 GMT`, `Server: cloudflare`) |
| **Live Phase 24 Marker Verification** | `/heist-planner` title = `GTA 6 Heist Planner & Payout Cut Calculator` (`43c`); `/port-gellhorn` `#quick-answers` = `TRUE` | Live HTML GET check on `https://www.gta6heistguide.com` |

---

## 3. Repository and Branch Status

- **Original Branch at Start of Phase 25:** `phase-24-content-ctr-internal-linking` (`HEAD` at `88172f45c37a73de25154e2418380f4b35e0940f`; `main` at `60e90d4d218b4bfa5cfcb785add4bdd4b0dcdad4`).
- **New Phase 25 Branch Created:** `phase-25-seo-measurement-baseline`, branched cleanly from `88172f45c37a73de25154e2418380f4b35e0940f`.
- **Untracked Files & Existing User Work:** All pre-existing untracked files (`50` root markdown reports, `scripts/*` affiliate utilities, `tests/last-run.json`, `verification-screenshots/`, `GTA6_APPROVED_IMAGE_LIBRARY/review_candidates_unverified/`) were preserved untouched; zero `reset`, `clean`, `stash`, or overwrite operations were run.
- **Production Website Files Modified:** **None (`0`)**. Only `PHASE-25-SEO-MEASUREMENT-BASELINE-REPORT.md` and `seo_reports/phase25/*.csv` are committed on `phase-25-seo-measurement-baseline`.

---

## 4. Search Console Property and Access Status

- **Property:** `https://www.gta6heistguide.com/` (URL-prefix property)
- **Access Status:** **Authenticated, Read-Only Access Confirmed** (verified via host-observed `https://search.google.com` session on `2026-11-24`).
- **Data Freshness in UI:** `Last update: 4 hours ago` (observed `2026-11-24`).
- **Search Type Filter:** `Web (text-based)` (verified in `seo_reports/phase25/Filters.csv`).
- **Read-Only Compliance:** Zero `Request Indexing` clicks, zero `Test Live URL` requests, zero sitemap resubmissions, zero setting changes.

---

## 5. Exact Reporting Date Ranges

| Reporting Window | Nominal Date Range | Actual GSC Data Span Available | Complete Days With Data | Attribution Qualification |
|---|---|---|---|---|
| **Pre-Phase-24 28-Day Baseline** | `2026-10-27` – `2026-11-23` (`28` complete calendar days preceding Nov 24 deployment) | `2026-11-17` – `2026-11-23` *(property tracking started `2026-11-16` with `0` impr)* | **`7` active days** (`8` chart rows incl. `Nov 16`) | **100% pre-Phase-24** (also 100% pre-Phase-20/22, which deployed `Nov 24`). |
| **Preceding 28-Day Comparison Window** | `2026-09-29` – `2026-10-26` (`28` days immediately preceding baseline) | **None (`No data`)** | **`0` days** | Property did not have GSC search data prior to `2026-11-17` (verified across Custom & Last 16 months). |
| **Post-Deployment Window (Phase 24)** | `2026-11-24` onward *(clean 7-day window begins `2026-11-25`)* | **Not yet available** | **`0` complete days** | Phase 24 deployed `2026-11-24 ~4:20 PM CST`. Too recent for causal SEO conclusions. |

*(Note: GSC's default `Last 3 months` / `Last 16 months` presets still ended at `2026-11-22`, whereas the Custom range `2026-10-27` – `2026-11-23` returned complete data for `2026-11-23`. All Phase 25 CSV exports use the exact `2026-10-27` – `2026-11-23` Custom export.)*

---

## 6. Overall Performance Comparison

### 6.1 Headline Baseline vs. Preceding 28-Day Window (`Filters.csv` + `Chart.csv`)

| Metric | Pre-Phase-24 Baseline (`2026-10-27` – `2026-11-23`, active `Nov 17–23`) | Preceding 28-Day Comparison (`2026-09-29` – `2026-10-26`) | Post-Phase-24 (`2026-11-25+`) |
|---|---:|---:|---:|
| **Total Clicks** | **`200`** | `0` *(No data)* | Pending |
| **Total Impressions** | **`22,117`** | `0` *(No data)* | Pending |
| **Average CTR** | **`0.90%`** (`0.9%` UI rounded) | `—` | Pending |
| **Average Position** | **`7.7`** | `—` | Pending |
| **Exported Pages With Impressions** | **`117`** (`43` canonical + `74` legacy) | `0` | Pending |
| **Exported Unique Queries** | **`588`** | `0` | Pending |

### 6.2 Daily Trajectory (`Chart.csv`: `2026-11-16` – `2026-11-23`, Pre-Deployment)

| Date | Clicks | Impressions | CTR | Avg Position | Context |
|---|---:|---:|---:|---:|---|
| `2026-11-16` | `0` | `0` | `—` | `—` | GSC property tracking start |
| `2026-11-17` | `0` | `4` | `0.00%` | `4.8` | First impressions |
| `2026-11-18` | `6` | `283` | `2.12%` | `7.7` | Pre-launch eve |
| `2026-11-19` | `23` | `1,188` | `1.94%` | `7.6` | GTA VI launch day |
| `2026-11-20` | `32` | `3,194` | `1.00%` | `7.8` | Launch +1 |
| `2026-11-21` | `29` | `4,627` | `0.63%` | `7.5` | Launch +2 |
| `2026-11-22` | `57` | `6,591` | `0.86%` | `7.8` | Launch +3 peak |
| `2026-11-23` | `53` | `6,230` | `0.85%` | `7.6` | Launch +4 *(newly published vs. Phase 23)* |
| **Total (`Nov 16–23`)** | **`200`** | **`22,117`** | **`0.90%`** | **`7.7`** | **Pre-Phase-20/22/24 Baseline** |

### 6.3 Device & Search Appearance Breakdown (`Devices.csv`, `Search appearance.csv`)

| Segment | Clicks | Click Share | Impressions | Impression Share | CTR | Avg Position |
|---|---:|---:|---:|---:|---:|---:|
| **Mobile** | **`170`** | `85.0%` | **`19,711`** | **`89.1%`** | `0.86%` | `7.57` |
| **Desktop** | **`28`** | `14.0%` | **`2,267`** | `10.3%` | `1.24%` | `8.65` |
| **Tablet** | **`2`** | `1.0%` | **`139`** | `0.6%` | `1.44%` | `7.65` |
| *Search Appearance: Product snippets* | `17` | `8.5%` | `612` | `2.8%` | **`2.78%`** | **`6.62`** |

### 6.4 Top 10 Countries (`Countries.csv`, 151 Countries Total)

| # | Country | Clicks | Impressions | CTR | Avg Position |
|---:|---|---:|---:|---:|---:|
| 1 | United States | `68` | `8,517` | `0.80%` | `7.86` |
| 2 | United Kingdom | `36` | `3,189` | `1.13%` | `7.87` |
| 3 | Australia | `11` | `952` | `1.16%` | `7.72` |
| 4 | Canada | `9` | `1,163` | `0.77%` | `7.84` |
| 5 | Finland | `7` | `233` | `3.00%` | `7.82` |
| 6 | Netherlands | `6` | `683` | `0.88%` | `7.84` |
| 7 | Italy | `6` | `217` | `2.76%` | `6.58` |
| 8 | Brazil | `5` | `352` | `1.42%` | `7.12` |
| 9 | Czechia | `5` | `106` | `4.72%` | `7.36` |
| 10 | India | `4` | `247` | `1.62%` | `8.62` |

### 6.5 Canonical vs. Legacy Non-Canonical Traffic Split (`Pages.csv`: 117 Rows)

Cross-referencing all `117` URLs in `Pages.csv` against live `https://www.gta6heistguide.com/sitemap.xml` (`500` canonicals):

- **Canonical Sitemap URLs (`43` active URLs):** `83` clicks (`41.3%` of page-row sum), `13,457` impressions (`61.0%`), `0.62%` aggregate CTR.
- **Legacy Non-Canonical URLs (`74` active URLs — `.html` aliases, retired slugs, noindexed `/compare/*`):** `118` clicks (`58.7%`), `8,600` impressions (`39.0%`), `1.37%` aggregate CTR.
  - Top legacy URLs still consolidating via `301` redirects: `/port-gellhorn.html` (`7` clicks / `2,107` impr → `/port-gellhorn`), `/sinfrontera-bank` (`22` / `1,821` → `/heists/the-cartel-heist`), `/weapons-gear` (`23` / `801` → `/weapons`), `/money-guide` (`12` / `791` → `/gta-6-money-guide/`), `/vice-city-yacht-heist.html` (`5` / `566` → `/missions/#walk-day-release`), `/vehicles-getaway-cars` (`10` / `433` → `/vehicles`), `/crew-database.html` (`5` / `263` → `/crew-database`).
  - *(Note: Page-row click sum is `201` vs. sitewide `200` and impression sum is `22,057` vs. `22,117` due to standard GSC multi-URL/anonymization aggregation differences.)*

---

## 7. Cohort-by-Cohort Page Performance (`2026-10-27` – `2026-11-23`)

### Exact Inventory & Deduplication Accounting

From `git diff --name-only 60e90d4..f7e949f`, Phase 24 modified **`32` tracked files** under `public/`: **`31` canonical HTML pages** plus `1` non-HTML module (`public/assets/community/cd-submit.js`, supporting `noindex` `/community-discoveries/submit/`). Cohort D additionally evaluates all **`24` `/animals/*` profile pages** linked from `/animals`, bringing the total unique canonical URLs evaluated in Phase 25 to **`55`** (`55/55` verified present in live `sitemap.xml`).

- **Overlapping URLs across cohorts (never double-counted in deduplicated totals):**
  - `/port-gellhorn` appears in Cohorts **A, C, E**.
  - `/weapons`, `/escape-routes`, `/heists/vcia-takedown`, `/heists/jewelry-stores` appear in Cohorts **A, C**.
  - `/radio` appears in Cohorts **C, D**.
- **Deduplicated Total Across All `55` Evaluated Canonical URLs:** **`14` URLs with impressions** | **`64` clicks** | **`11,698` impressions** | **`0.55%` aggregate CTR**.

### Cohort A: Quick-Answer Content (`7` Canonical URLs)

| Canonical URL | Clicks | Impressions | CTR | Avg Pos | Legacy 301 Companion Still Consolidating (Context Only) |
|---|---:|---:|---:|---:|---|
| `/port-gellhorn` | `21` | `6,365` | `0.33%` | `7.07` | `/port-gellhorn.html` (`7` cl / `2,107` im) |
| `/weapons` | `0` | `36` | `0.00%` | `8.69` | `/weapons-gear` + `.html` (`30` cl / `915` im) |
| `/escape-routes` | `7` | `871` | `0.80%` | `7.19` | — |
| `/heists/vcia-takedown` | `5` | `719` | `0.70%` | `7.35` | — |
| `/heists/jewelry-stores` | `5` | `728` | `0.69%` | `8.65` | — |
| `/weapons-bonuses` | `2` | `252` | `0.79%` | `8.90` | `/weapons-bonuses.html` (`0` cl / `70` im) |
| `/vehicles` | `0` | `0` | `0.00%` | `—` | `/vehicles-getaway-cars` (`10` cl / `433` im) |
| **Cohort A Subtotal (`6/7` active)** | **`40`** | **`8,971`** | **`0.45%`** | — | **Primary CTR-lift test cohort for Dec 1 checkpoint** |

### Cohort B: Promotional Hierarchy & Content-Intent Improvements (`4` Canonical URLs)

| Source File | Canonical URL | Clicks | Impressions | CTR | Avg Pos | Live Indexing Context (`Nov 24`) |
|---|---|---:|---:|---:|---:|---|
| `public/heist-planner.html` | `/heist-planner` | `1` | `294` | `0.34%` | `8.18` | `Crawled - currently not indexed` (`Nov 24, 2:24 PM`, pre-Phase-24) |
| `public/gameplay-mechanics.html` | `/gameplay-mechanics` | `0` | `87` | `0.00%` | `9.62` | `Page is indexed` (`Nov 24, 7:35 AM`) |
| `public/guides/sinfrontera-national-bank.html` | `/guides/sinfrontera-national-bank` | `0` | `0` | `0.00%` | `—` | `URL is unknown to Google` (newly in 500-URL sitemap) |
| `public/heists/the-cartel-heist.html` | `/heists/the-cartel-heist` | `1` | `520` | `0.19%` | `8.25` | `Crawled - currently not indexed` (`Nov 24, 2:52 PM`; `/sinfrontera-bank` holds `22` cl / `1,821` im) |
| **Cohort B Subtotal (`3/4` active)** | — | **`2`** | **`901`** | **`0.22%`** | — | Promotional placement fixes improve content quality/intent clarity; not assumed to guarantee ranking lifts |

### Cohort C: Internal-Link Authority Hubs (`8` Canonical URLs)

| Canonical URL | Clicks | Impressions | CTR | Avg Pos | Curated Phase 6–20 Links Live |
|---|---:|---:|---:|---:|---:|
| `/` | `8` | `1,120` | `0.71%` | `8.37` | `5/5` |
| `/port-gellhorn` | `21` | `6,365` | `0.33%` | `7.07` | `5/5` (`3` new + `2` pre-existing) |
| `/escape-routes` | `7` | `871` | `0.80%` | `7.19` | `3/3` |
| `/heists/vcia-takedown` | `5` | `719` | `0.70%` | `7.35` | `3/3` |
| `/heists/jewelry-stores` | `5` | `728` | `0.69%` | `8.65` | `3/3` |
| `/weapons` | `0` | `36` | `0.00%` | `8.69` | `4/4` |
| `/gta-6-money-guide/` | `1` | `224` | `0.45%` | `8.33` | `3/3` |
| `/radio` | `8` | `369` | `2.17%` | `10.95` | `3/3` |
| **Cohort C Subtotal (`8/8` active)** | **`55`** | **`10,432`** | **`0.53%`** | — | **`29/29` verified (`27` new + `2` existing)** |

### Cohort D: Radio & Animal Directories (`39` Canonical URLs)

| Segment | URL Count | Pages With Impressions | Clicks | Impressions | CTR | Avg Pos |
|---|---:|---:|---:|---:|---:|---:|
| `/radio` (Directory Hub) | `1` | `1` | `8` | `369` | `2.17%` | `10.95` |
| `/animals` (Directory Hub) | `1` | `1` | `5` | `66` | `7.58%` | `8.26` |
| `13` Enriched `/radio/*` Spokes (`kaleidoscope-fm`, `the-wipe-99-9`, `worldwide-fm`, `radio-on-u`, `stockyard-fm`, `honey-fm`, `afrobank-fm`, `symphony-fm`, `the-chamber-106-6`, `radio-la-ola`, `circoloco-records-radio`, `gloriana-blues-radio`, `leonida-jazz-radio`) | `13` | `0` | `0` | `0` | `0.00%` | `—` |
| `24` `/animals/*` Profile Pages (all `24` verified in `sitemap.xml` & linked from `/animals`) | `24` | `0` | `0` | `0` | `0.00%` | `—` |
| **Cohort D Subtotal** | **`39`** | **`2`** | **`13`** | **`435`** | **`2.99%`** | — |

### Cohort E: Community Discoveries Contextual CTA Pages (`4` Canonical URLs)

| Canonical URL | Clicks | Impressions | CTR | Avg Pos | Contextual CTA Verified |
|---|---:|---:|---:|---:|---|
| `/port-gellhorn` | `21` | `6,365` | `0.33%` | `7.07` | `?category=hidden_location&region=Port%20Gellhorn` |
| `/guides/gta-6-safe-codes` | `0` | `0` | `0.00%` | `—` | `?category=money_method` |
| `/secrets` | `0` | `47` | `0.00%` | `8.74` | `?category=easter_egg` |
| `/gta-6-glitches/` | `0` | `0` | `0.00%` | `—` | `?category=general` |
| **Cohort E Subtotal (`2/4` active)** | **`21`** | **`6,412`** | **`0.33%`** | — | **Approved count independently verified = `0`** |

---

## 8. Top Search Queries (`Queries.csv`: `588` Queries, `2026-10-27` – `2026-11-23`)

### 8.1 Top 15 Queries by Clicks

| # | Query | Clicks | Impressions | CTR | Avg Position |
|---:|---|---:|---:|---:|---:|
| 1 | `gta 6 tactical gear` | `7` | `169` | `4.14%` | `7.39` |
| 2 | `gta 6 military gear` | `4` | `34` | `11.76%` | `4.71` |
| 3 | `gta 6 sewer` | `2` | `50` | `4.00%` | `5.82` |
| 4 | `port gellhorn shipyard` | `1` | `567` | `0.18%` | `6.93` |
| 5 | `gta 6 yacht mission` | `1` | `92` | `1.09%` | `9.28` |
| 6 | `gta 6 money locations` | `1` | `34` | `2.94%` | `9.71` |
| 7 | `gta 6 heist` | `1` | `21` | `4.76%` | `8.62` |
| 8 | `tactical gear gta 6` | `1` | `20` | `5.00%` | `9.95` |
| 9 | `port gellhorn rusted ship` | `1` | `14` | `7.14%` | `5.50` |
| 10 | `gta 6 heist crew` | `1` | `13` | `7.69%` | `7.46` |
| 11 | `gta 6 tactical helmet` | `1` | `12` | `8.33%` | `9.75` |
| 12 | `gta 6 all houses` | `1` | `8` | `12.50%` | `10.12` |
| 13 | `best settings gta 6 ps5 pro` | `1` | `6` | `16.67%` | `7.83` |
| 14 | `gta 6 findings` | `1` | `4` | `25.00%` | `4.00` |
| 15 | `all gta 6 money locations` | `1` | `1` | `100.00%` | `5.00` |

### 8.2 Top 15 Queries by Impressions

| # | Query | Clicks | Impressions | CTR | Avg Position |
|---:|---|---:|---:|---:|---:|
| 1 | `port gellhorn shipyard` | `1` | `567` | `0.18%` | `6.93` |
| 2 | `gta 6 tactical gear` | `7` | `169` | `4.14%` | `7.39` |
| 3 | `port gellhorn bank` | `0` | `102` | `0.00%` | `9.68` |
| 4 | `atm port gellhorn` | `0` | `100` | `0.00%` | `6.97` |
| 5 | `port gellhorn docks` | `0` | `100` | `0.00%` | `7.23` |
| 6 | `gta 6 yacht mission` | `1` | `92` | `1.09%` | `9.28` |
| 7 | `port gellhorn safe code` | `0` | `90` | `0.00%` | `9.58` |
| 8 | `port gellhorn` | `0` | `86` | `0.00%` | `5.08` |
| 9 | `gta 6 cartel heist max payout` | `0` | `73` | `0.00%` | `8.05` |
| 10 | `port gellhorn atm` | `0` | `71` | `0.00%` | `8.34` |
| 11 | `gta 6 sewer` | `2` | `50` | `4.00%` | `5.82` |
| 12 | `fast cash safe code` | `0` | `49` | `0.00%` | `9.43` |
| 13 | `port gellhorn fence` | `0` | `45` | `0.00%` | `8.84` |
| 14 | `sinfrontera` | `0` | `43` | `0.00%` | `8.16` |
| 15 | `port gellhorn robbery` | `0` | `43` | `0.00%` | `10.33` |

---

## 9. Search Intent & CTR Opportunity Analysis

Every opportunity below is grounded strictly in `Queries.csv` + `Pages.csv` (`Oct 27 – Nov 23, 2026`), live production `<title>` and `<meta name="description">`, and live URL Inspection. Because `89.1%` of impressions are mobile and most Phase 24 title/quick-answer updates deployed only minutes prior to this audit, **no immediate title/meta edits are recommended**; instead, each opportunity is classified by whether it is a genuine post-recrawl opportunity, an indexing-recovery watch item, or a normal position/intent constraint.

| Priority & Category | Canonical URL | Representative Search Query | Impr | Clicks | CTR | Avg Pos | Search Intent | Existing Live `<title>` & `<meta name="description">` | Genuine Improvement Opportunity? |
|---|---|---|---:|---:|---:|---:|---|---|---|
| **1. High-Impr Low-CTR + Quick-Answer Match** | `/port-gellhorn` | `port gellhorn shipyard` *(also `docks` `100`, `cargo ship` `40`, `sealed container` `32`, `rusted cargo ship` `16` at pos `2.25`)* | `567` | `1` | `0.18%` | `6.93` | Informational / POI puzzle & container loot | **Title (`55c`):** `Port Gellhorn Guide: Safe Codes, Shipyard & Map \| GTA 6`<br>**Desc (`154c`):** `Verified GTA 6 Port Gellhorn guide: safe codes (0300, 6823, 6969), shipyard & SCOOP containers, Moses & Dunk fences, ATMs, gun stores, and Ch. 2 missions.` | **Yes — Monitor Phase 24 lift first.** Phase 24 just added `#quick-answers` (covering Shipyard & Rusted Cargo Ship) and trimmed title to `55c`. Wait for `Nov 25 – Dec 1` recrawl before further edits; position `6.93` on mobile naturally suppresses CTR vs. top-3 slots. |
| **2. Indexing Hold + High Demand** | `/heists/the-cartel-heist` | `gta 6 cartel heist max payout` *(also `sinfrontera` `43`, `cartel heist gta 6 payout` `14`)* | `73` | `0` | `0.00%` | `8.05` | Walkthrough & payout optimization | **Title (`56c`):** `GTA 6 The Cartel Heist: Mission #71 Walkthrough & Payout`<br>**Desc (`159c`):** `Complete Chapter 3 Story Mission #71 walkthrough for The Cartel Heist: all 5 Raul Bautista setups, 10 steps, Professional rating & $120K–$150K reported payout.` | **Yes — Indexing recovery priority, NOT a title edit.** Live inspection shows `Crawled - currently not indexed` (`Nov 24, 2:52 PM`) while legacy `/sinfrontera-bank` still holds `1,821` impr / `22` clicks (`pos 5.19`). Wait for 301 consolidation + recrawl of Phase 24 Sinfrontera differentiation. |
| **3. High-Impr Low-CTR + Quick-Answer Match** | `/escape-routes` | `gta 6 sewers` *(complementing `gta 6 sewer`: `50` im, `2` cl, `4.00%` CTR, pos `5.82`)* | `23` | `0` | `0.00%` | `5.96` | Informational / location verification | **Title (`48c`):** `GTA 6 Sewers & Escape Routes: Verified Locations`<br>**Desc (`153c`):** `Are there sewers in GTA 6? Verified status of Vice City storm drains, Hamlet Sewage Treatment Plant, drainage tunnels, and Leonida police evasion routes.` | **Yes — Strong Phase 24 test candidate.** Page sits at pos `5.8–6.0` with a clean `48c` title and new `#sewers-quick-table`. Do not edit further until `Dec 1` data arrives. |
| **4. High-Impr Low-CTR + Intent Match** | `/heists/pawn-shops` *(and `/guides/gta-6-safe-codes`)* | `fast cash safe code` *(also `fast cash code gta 6` `22`, `gta 6 fast cash code` `21`)* | `49` | `0` | `0.00%` | `9.43` | Quick-answer safe code lookup | **Title (`53c`):** `GTA 6 Pawn Shops: $2.5K–$6.5K Payouts, Unlock & Codes`<br>**Desc (`153c`):** `GTA 6 Pawn Shops robbery guide: unlocks in Chapter 2 after Coffee Break across 15 shops (including Fast Cash). $2.5K–$6.5K+ payouts, safe rules & fences.` | **Yes — Genuine intent/snippet opportunity.** Combined `102+` impressions for Fast Cash safe codes at pos `8.1–9.4` with `0%` CTR. Title mentions `Codes` generically; after `Dec 1`, evaluate whether `/guides/gta-6-safe-codes` or `/heists/pawn-shops` captures this query and consider clarifying randomized Fast Cash safe rules in the snippet if still `0%` CTR. |
| **5. Quick-Answer Match (Pos 7–9)** | `/heists/vcia-takedown` | `vcia takedown heist planning` *(also `gta 6 airport heist payout` `8`)* | `20` | `0` | `0.00%` | `7.90` | Mission planning & approach choice | **Title (`55c`):** `GTA 6 VCIA Takedown: $250K Payout & Airport Walkthrough`<br>**Desc (`154c`):** `Chapter 4 Story Heist #2 walkthrough for VCIA Takedown at Vice City International Airport: $250,000 payout, all 4 setups, stealth vs. loud & ATM deposits.` | **Yes — Monitor Phase 24 quick-answer table.** Phase 24 expanded `.quick-answer-box` with Stealth vs. Loud planning & payout clarity. Low impression volume (`20`) and pos `7.90` do not justify another title rewrite yet. |
| **6. Top of Page 2 (Pos 10–11) High-CTR Hub** | `/radio` | `gta 6 radio stations` *(page-level: `369` im, `8` cl, `2.17%` CTR, pos `10.95`)* | `10` | `0` | `0.00%` | `26.30` | Directory / station list lookup | **Title (`59c`):** `GTA 6 Radio Stations: All 23 Verified Stations & Tracklists`<br>**Desc (`154c`):** `Complete GTA 6 Radio Stations database: all 23 Leonida stations, DJs, genres, verified tracklists, secret unlockable The Vault Radio, and DMCA-safe picks.` | **Yes — Visibility/ranking opportunity, not a CTR defect.** `/radio` already converts at `2.17%` CTR (`2.4×` site average) despite pos `10.95`. Phase 24's static `23`-station HTML table (`#static-radio-directory`) directly targets page-1 crawl depth without needing a title change. |
| **7. Top of Page 2 (Pos 10.3)** | `/properties` | `gta 6 all houses` *(page-level: `238` im, `4` cl, `1.68%` CTR, pos `10.30`)* | `8` | `1` | `12.50%` | `10.12` | Directory / safehouses & garages | **Title (`57c`):** `GTA 6 Properties, Safehouses, Garages & 7 Fences Database`<br>**Desc (`155c`):** `GTA 6 Properties Database: 4 story safehouses, 8 purchasable + 4 story garages, Ultimate Edition Paradise Garage, and all 7 fence & vehicle buyer contacts.` | **Yes — Page-2-to-Page-1 watch.** Already converting at `1.68%` CTR at pos `10.30`; Phase 22 expanded static HTML to `1,095w`. Monitor recrawl rather than changing title. |
| **8. Page-2 Edge + Promo Cleanup** | `/gameplay-mechanics` | `gta 6 mechanics` *(page-level: `87` im, `0` cl, `0.00%` CTR, pos `9.62`)* | `17` | `0` | `0.00%` | `14.12` | Informational / gameplay systems | **Title (`50c`):** `GTA 6 Gameplay Mechanics: Fuel, Weight & Wanted AI`<br>**Desc (`151c`):** `Deep breakdown of confirmed GTA 6 realism systems: vehicle fuel consumption, duffel bag sprint penalties, trunk weapon stashing, and cop line-of-sight.` | **Moderate — Wait for Phase 24 recrawl.** Page is indexed (`Nov 24, 7:35 AM`), had promo `<h2>` removed and title sharpened to `50c` in Phase 24. Low impression volume (`17` on head query) and pos `14.12` explain `0%` CTR. |
| **9. Indexing Hold + Promo Cleanup** | `/heist-planner` | *(Page-level: `294` im, `1` cl, `0.34%` CTR, pos `8.18`)* | `294` *(page)* | `1` | `0.34%` | `8.18` | Interactive tool / payout calculator | **Title (`43c`):** `GTA 6 Heist Planner & Payout Cut Calculator`<br>**Desc (`133c`):** `Plan GTA 6 heist approaches and net payouts across The Cartel Heist ($120K), VCIA Takedown, bank vaults, fence cuts, and crew splits.` | **Yes — Indexing recovery watch first.** Live inspection shows `Crawled - currently not indexed` (`Nov 24, 2:24 PM`, *before* Phase 24 removed promotional `<h2>` headings above the calculator). Re-inspect at `Dec 1` checkpoint. |
| **10. Indexing Hold + 301 Consolidation** | `/vehicles` | `gta 6 cars with most storage` *(legacy `/vehicles-getaway-cars`: `433` im, `10` cl, `2.31%` CTR)* | `13` | `0` | `0.00%` | `9.85` | Comparison / trunk storage capacity | **Title (`48c`):** `GTA 6 Vehicles Database: 33 Cars & Trunk Storage`<br>**Desc (`147c`):** `Searchable GTA 6 Vehicles Database covering Sports, Super, Muscle, Pickups, Boats, and Aircraft with side-by-side Compare, Favorites, and Map pins.` | **Yes — Indexing recovery + consolidation watch.** Live inspection shows `Crawled - currently not indexed` (`Nov 24, 11:43 AM`, *before* Phase 24 added `#vehicle-trunk-storage-table`). Once recrawled and `/vehicles-getaway-cars` consolidates, evaluate CTR. |
| **11. Quick-Answer Match + 301 Consolidation** | `/weapons` | `polymer vs metal rounds gta 6` (`13` im) & `gta 6 plate carrier` (`11` im) | `13` / `11` | `0` | `0.00%` | `7.92` / `7.55` | Specific gear & ammo comparison | **Title (`51c`):** `GTA 6 Weapons, Plate Carriers & Tactical Gear Guide`<br>**Desc (`155c`):** `GTA 6 weapons & tactical gear guide: 8 weapon classes, body armor & plate carriers, ammo types, customization, and missable variants like Donnie's H&L .38.` | **Yes — Monitor Phase 24 quick-answer table.** Legacy `/weapons-gear` (`801` im, `23` cl, `2.87%` CTR) is consolidating into `/weapons`; Phase 24 added `#weapons-quick-answers` and `Plate Carriers` to the title. |
| **12. Low-Volume / Position Constraint (Not Urgent)** | `/weapons-bonuses` | `gta 6 ultimate edition gun store` *(page-level: `252` im, `2` cl, `0.79%` CTR, pos `8.90`)* | `10` | `0` | `0.00%` | `9.20` | Specific Ultimate Edition unlock lookup | **Title (`46c`):** `GTA 6 Gun Stores: All 24 Ammu-Nation Locations`<br>**Desc (`148c`):** `All 24 verified GTA 6 gun stores across Leonida: Ammu-Nation, Pawn & Armories, Surplus dealers, available weapons, body armor, and Leonida Map pins.` | **Partial intent mismatch — Low urgency.** User wants Ultimate Edition bonuses (better served by `/guides/ultimate-edition-bonuses-guide`, now linked from `/` in Phase 24). Do not alter `/weapons-bonuses`'s gun-store title for a 10-impression query. |

---

## 10. Indexing and Canonical Findings

### 10.1 Live Sitemap & Sitewide Technical Audit

| Check | Phase 24 Baseline | Phase 25 Direct Verification (`Nov 24, 2026`) | Status |
|---|---|---|---|
| Live `https://www.gta6heistguide.com/sitemap.xml` HTTP & XML validity | `500` unique canonicals | `HTTP 200`, valid XML, **`500` total / `500` unique** canonicals, `0` non-canonical-origin URLs, `100%` parity with `public/sitemap.xml` | **PASS** |
| GSC `Indexing -> Sitemaps` (`/sitemap.xml`) | `500` discovered (`Nov 24`) | `Success` — Submitted `Nov 24, 2026`, Last read `Nov 24, 2026`, **`500` discovered pages** (`0` videos) | **PASS** *(Discovery ≠ Indexing)* |
| GSC `Indexing -> Sitemaps` (`/image-sitemap.xml`) | `27` discovered (`Nov 24`) | `Success` — Submitted `Nov 21, 2026`, Last read `Nov 24, 2026`, **`27` discovered pages** (`0` videos) | **PASS** |
| `node scripts/seo-audit.mjs` (JSON-LD & Internal Links) | `337` JSON-LD / `23,896` internal links | **`335` primary HTML, `337` valid JSON-LD blocks, `500` sitemap canonicals, `1,136` `<img>`, `23,896` internal links, `0` warnings, `0` fatal errors** | **PASS** |
| Live HTML Canonical Parity (`18` core Phase 24 pages) | `18/18` self-canonical | **`18/18`** live HTTP `200` with exact self-matching `<link rel="canonical">` | **PASS** |

### 10.2 GSC Aggregate `Indexing -> Pages` Report

- **Last update:** `11/15/26` (still **9 days stale** relative to `Nov 24, 2026`).
- **Indexed:** `2` | **Not indexed:** `14` (`Page with redirect`: `3`; `Crawled - currently not indexed`: `11`).
- Because this aggregate report predates the `Nov 17–24` crawl wave, it cannot be used to measure current Phase 24 indexing.

### 10.3 Live Read-Only URL Inspection (`Nov 24, 2026` — 7 Representative Phase 24 URLs)

| Inspected Canonical URL | Overall Status | Coverage Status | Last Crawl | Crawled As | User-Declared Canonical | Google-Selected Canonical | Diagnostic & Action |
|---|---|---|---|---|---|---|---|
| `/port-gellhorn` | On Google | **Page is indexed** | `Nov 21, 2026, 2:47:21 AM` | Googlebot smartphone | `/port-gellhorn` | Inspected URL | Healthy; awaiting recrawl of Phase 24 `#quick-answers` & `55c` title |
| `/gameplay-mechanics` | On Google | **Page is indexed** | `Nov 24, 2026, 7:35:16 AM` | Googlebot smartphone | `/gameplay-mechanics` | Inspected URL | Healthy; sitemaps showed `Temporary processing error` (transient; monitor) |
| `/radio` | On Google | **Page is indexed** | `Nov 24, 2026, 6:59:46 AM` | Googlebot smartphone | `/radio` | Inspected URL | Healthy; awaiting recrawl of Phase 24 `#static-radio-directory` |
| `/heist-planner` | **Not on Google** | **Crawled - currently not indexed** | `Nov 24, 2026, 2:24:03 PM` | Googlebot smartphone | `/heist-planner` | Inspected URL | **Crawled pre-Phase-24** (when promo `<h2>` sat above calculator). Wait for natural recrawl; re-inspect `Dec 1`. |
| `/heists/the-cartel-heist` | **Not on Google** | **Crawled - currently not indexed** | `Nov 24, 2026, 2:52:38 PM` | Googlebot smartphone | `/heists/the-cartel-heist` | Inspected URL | Held out during `/sinfrontera-bank` 301 consolidation; re-inspect `Dec 1` after Phase 24 differentiation settles. |
| `/vehicles` | **Not on Google** | **Crawled - currently not indexed** | `Nov 24, 2026, 11:43:01 AM` | Googlebot smartphone | `/vehicles` | Inspected URL | **New live finding.** Crawled pre-Phase-24 (before `#vehicle-trunk-storage-table`) while `/vehicles-getaway-cars` 301s into `/vehicles`. Re-inspect `Dec 1`. |
| `/guides/sinfrontera-national-bank` | **Not on Google** | **URL is unknown to Google** | `N/A` | `N/A` | `N/A` | `N/A` | Newly discovered via `500`-URL sitemap on `Nov 24`; monitor crawl conversion. |

- **Canonical Disagreements:** **`0`** across all `6` crawled URLs (`Google-selected canonical` = `Inspected URL` on `6/6`).
- **Unexpected Exclusions:** `/vehicles` (`Crawled - currently not indexed`, `Nov 24, 11:43 AM`) and `/heist-planner` (`Crawled - currently not indexed`, `Nov 24, 2:24 PM`) are verified live holds that require passive observation after Phase 24 recrawl — **no manual `Request Indexing` spam is recommended**.

---

## 11. Internal-Link Verification

### 11.1 Direct Production HTML Verification

Every Phase 24 internal-link addition was fetched and verified directly against live `https://www.gta6heistguide.com` HTML (full row-by-row export in `seo_reports/phase25/phase25_internal_link_verification.csv`):

| Internal-Link Group | Links Verified Present in Live HTML | Crawlable `<a href>` Format | Relevant Descriptive Anchor Text | Broken Destinations (`HTTP != 200`) | Sitemap Parity |
|---|---:|---|---|---:|---|
| **8 Hubs → Phase 6–20 Matrix (`27` new + `2` pre-existing on `/port-gellhorn`)** | **`29 / 29` (`100%`)** | Yes (`29/29`) | Yes (`29/29`) | **`0`** (`29/29` HTTP `200`) | `100%` |
| **`/radio` Static Directory → `/radio/*` Spokes** | **`23 / 23` (`100%`)** | Yes (`23/23`) | Yes (`23/23`) | **`0`** (`23/23` HTTP `200`) | `100%` |
| **`/animals` Static Directory → `/animals/*` Profiles** | **`24 / 24` (`100%`)** | Yes (`24/24`) | Yes (`24/24`) | **`0`** (`24/24` HTTP `200`) | `100%` |

### 11.2 Direct Inlink Count Comparison (Phase 22 Baseline vs. Current `public/` Scan)

Comparing `seo_reports/phase22-link-graph-after.json` (Phase 22 direct inbound-file counts) against a direct Phase 25 scan of all indexable `public/**/*.html` files across the `25` unique Phase 6–20 hub-matrix destinations:

- **24 of 25 unique destinations gained `+1` to `+4` referring canonical HTML files:**
  - `+4`: `/guides/bank-vault-hacking-guide` (`3 → 7`)
  - `+2`: `/missions/day-release` (`24 → 26`), `/guides/ultimate-edition-bonuses-guide` (`4 → 6`), `/locations/grassrivers` (`30 → 32`), `/guides/kenton-shipwreck-sets` (`4 → 6`)
  - `+1` (`19` destinations): `/missions/prologue` (`3 → 4`), `/guides/cocaine-flamingos-locations` (`3 → 4`), `/missions/checking-out` (`44 → 45`), `/missions/moses` (`61 → 62`), `/missions/slam-dunk` (`24 → 25`), `/locations/hamlet-prison` (`3 → 4`), `/guides/stunt-jumps-locations` (`6 → 7`), `/locations/vice-city-international-airport` (`11 → 12`), `/missions/close-surveillance` (`4 → 5`), `/missions/yasmanis-jewelry-jobs` (`6 → 7`), `/guides/jewelry-and-pawn-farming-loop` (`4 → 5`), `/guides/fence-payout-comparison` (`13 → 14`), `/guides/weapon-attachments-and-ammo` (`8 → 9`), `/guides/weapon-trunk-storage-system` (`24 → 25`), `/guides/hidden-weapon-stashes` (`6 → 7`), `/guides/50-weapons-100-percent` (`8 → 9`), `/guides/underwater-treasure-money` (`3 → 4`), `/guides/vice-city-nightlife-encounters` (`6 → 7`), `/guides/collectible-card-sets` (`4 → 5`)
  - `0` (`1` deduplicated destination already linked on `/port-gellhorn` pre-Phase-24): `/guides/chapter-2-15000-money-guide` (`12 → 12`).
- **Sitewide Internal Link Total (`seo-audit.mjs`):** `23,725` (Phase 22) → **`23,896`** (Phase 24/25, `+171` total links).

### 11.3 Methodological Note: Why Added Links Do Not Prove Authority Gains

Adding crawlable internal links establishes **structural link presence and discoverability** — it does **not** establish that Google has transferred ranking authority or improved search performance.

- **Indicators that CANNOT prove internal-link authority gain:** raw link count increases, HTML presence checks, or single-day impression fluctuations.
- **Indicators that CAN provide evidence over 14–28+ days:**
  1. Target Phase 6–20 URLs transitioning from `URL is unknown to Google` to crawled/indexed in URL Inspection (`Last crawl` timestamps updating).
  2. Newly linked destinations accruing sustained non-brand impressions and clicks in `Pages.csv` across consecutive complete 7-day windows.
  3. Stable or improving average position on target long-tail queries without cannibalizing the source hubs.

---

## 12. Data Limitations & Historical Comparison Assessment

1. **Zero Complete Post-Deployment Data (`Nov 24`):** Phase 24 deployed `~4:20 PM CST` on `2026-11-24`, while the latest complete GSC day is `2026-11-23`. All post-deployment comparisons are **inconclusive / pending**.
2. **Short Pre-Deployment History (`7` Active Days):** GSC property tracking began `2026-11-16` with first impressions `2026-11-17`. The preceding 28-day window (`2026-09-29` – `2026-10-26`) has `0` data, preventing month-over-month seasonality comparison.
3. **Rapid GTA VI Launch-Week Volatility:** Daily impressions grew from `4` (`Nov 17`) to `6,591` (`Nov 22`) and `6,230` (`Nov 23`). Normal launch-week demand swings must not be misattributed to Phase 24.
4. **Stale GSC Aggregate Coverage Report:** `Indexing -> Pages` is frozen at `11/15/26` (`2` indexed / `14` not indexed), lagging live indexing reality by 9 days.
5. **Legacy 301 Split:** `58.7%` of clicks (`118/201` page-row sum) and `39.0%` of impressions (`8,600/22,057`) still sit on `74` legacy non-canonical URLs undergoing `301` consolidation.
6. **GSC Anonymization Variance:** Sum of exported `Pages.csv` rows (`201` clicks / `22,057` impr) differs slightly from headline `Chart.csv` totals (`200` clicks / `22,117` impr) due to standard Google Search Console query/page privacy filtering.

### Early Signal Summary (`Nov 17–23` Pre-Deployment Baseline Only)

- **Positive Pre-Deployment Signals:** Canonical pages with impressions expanded from `33` (`Nov 16–22`) to **`43`** (`Nov 17–23`); `Product snippets` earn `2.78%` CTR at pos `6.62` (`3.1×` site average); `/animals` (`7.58%` CTR) and `/radio` (`2.17%` CTR) outperform site average.
- **Technical Indexing Concerns to Watch:** `/heist-planner`, `/heists/the-cartel-heist`, and `/vehicles` are currently `Crawled - currently not indexed` (all crawled prior to Phase 24 deployment or mid-301 handoff).
- **Neutral / Inconclusive:** All Phase 24 CTR, quick-answer, Sinfrontera differentiation, and hub-to-spoke internal-link impacts are **inconclusive** until at least `Dec 1, 2026`.

---

## 13. Recommended Next Actions (Evidence-Based Only)

1. **Hold All Website, Title, Sitemap, and Indexing-Request Changes Until `Dec 1–2, 2026`:** Allow Googlebot to naturally recrawl the `31` Phase 24 canonical pages and process the `500`-URL sitemap without resetting crawl evaluation windows.
2. **Re-Inspect the 3 `Crawled - currently not indexed` Pages Once on `Dec 1–2, 2026`:** Perform read-only URL Inspection on `/heist-planner`, `/heists/the-cartel-heist`, and `/vehicles` to verify whether Phase 24 quality upgrades and `301` consolidation (`sinfrontera-bank`, `vehicles-getaway-cars`) moved them to `Page is indexed`.
3. **Evaluate Cohort A CTR Lift Against `Nov 17–23` Baseline:** Compare `Nov 25 – Dec 1` vs. `Nov 18 – Nov 24` CTR and position on `/port-gellhorn`, `/escape-routes`, `/heists/vcia-takedown`, `/heists/jewelry-stores`, `/weapons`, `/weapons-bonuses`, and `/vehicles`.
4. **Track Phase 6–20 Crawl Conversion on Linked Destinations:** Re-inspect `/missions/prologue`, `/missions/day-release`, `/guides/sinfrontera-national-bank`, `/guides/cocaine-flamingos-locations`, and sample `/radio/*` + `/animals/*` spokes at Day 14 to measure hub-to-spoke discovery.
5. **Keep Community Verified Pins & Related-Guide Callouts Gated:** Do not enable until at least one authentic discovery is approved in `/cd-admin/` and verified via `/api/community-discoveries/list` (`total > 0`).

---

## 14. Future Observation Checkpoints

| Checkpoint | Target Date | Complete Post-Phase-24 Window | Primary Comparison Window | Key Metrics & Decisions |
|---|---|---|---|---|
| **7-Day Checkpoint** | `Dec 2–3, 2026` *(accounting for 24–48h GSC lag)* | `2026-11-25` – `2026-12-01` | `2026-11-18` – `2026-11-24` | First clean 7-day Cohort A/B/C CTR & position comparison; read-only re-inspection of `/heist-planner`, `/heists/the-cartel-heist`, `/vehicles`; verify `301` legacy click share declining below `58.7%`. |
| **14-Day Checkpoint** | `Dec 9–10, 2026` | `2026-11-25` – `2026-12-08` | `2026-11-17` – `2026-11-24` *(normalized daily avg)* | Measure crawl/index conversion across the `25` hub-matrix Phase 6–20 destinations, `13` enriched `/radio/*` spokes, and `24` `/animals/*` profiles; verify GSC `Indexing -> Pages` refresh. |
| **28-Day Checkpoint** | `Dec 23–24, 2026` | `2026-11-25` – `2026-12-22` | `2026-10-27` – `2026-11-23` *(pre-Phase-24 baseline)* | First full 28-day causal evaluation of Phase 24 CTR, ranking stability, canonical consolidation, and internal-link discovery; decide whether any remaining zero-CTR high-impression pages (e.g., Fast Cash safe codes) merit Phase 26 snippet iteration. |

---

## 15. Data Reconciliation & Metric Integrity

*Phase 25.1 Read-Only Reconciliation Audit — independently reproducible via `python seo_reports/phase25/validate_phase25_baseline.py`. All original raw GSC CSV exports in `seo_reports/phase25/` remain completely unchanged.*

### 15.1 Original Discrepancy Investigated

The Phase 25 baseline report surfaced a discrepancy between sitewide headline/device totals and the summed canonical + legacy page breakdown:

- **Headline (`Chart.csv`) & Device (`Devices.csv`) Totals:** `200` clicks / `22,117` impressions (Mobile `170`/`19,711` + Desktop `28`/`2,267` + Tablet `2`/`139` = exact `200`/`22,117`).
- **Canonical + Legacy Page Breakdown (`Pages.csv`):** Canonical `83` clicks / `13,457` impressions + Legacy `118` clicks / `8,600` impressions = **`201` clicks / `22,057` impressions** (delta: **`+1` click** and **`-60` impressions** vs. headline).

### 15.2 Investigation Performed

Every raw export in `seo_reports/phase25/` and `public/sitemap.xml` was audited programmatically:

1. **Export Filters & Date Window (`Filters.csv`, `Chart.csv`):**
   - Confirmed identical export scope across all GSC files: `Search type = Web (text-based)`, `Date = Oct 27, 2026-Nov 23, 2026` (requested 28-day window).
   - Confirmed `Chart.csv` contains `8` rows: `1` zero-data start row (`2026-11-16`: `0` clicks / `0` impressions) and **`7` active reporting days** (`2026-11-17` – `2026-11-23`). Zero historical data exists prior to `2026-11-16`, and zero complete post-Phase-24 reporting days existed at collection time (`2026-11-24`).
2. **Cross-Dimension Reconciliation Across All Raw GSC Exports:**

| Raw GSC Export | Row Count | Clicks | Impressions | Delta vs. Headline (`200` / `22,117`) | GSC Export Cap (`1,000` rows) |
|---|---:|---:|---:|---|---|
| `Chart.csv` | `8` (`7` active) | **`200`** | **`22,117`** | `0` / `0` (exact) | Not hit |
| `Devices.csv` | `3` | **`200`** | **`22,117`** | `0` / `0` (exact) | Not hit |
| `Countries.csv` | `151` | **`200`** | **`22,117`** | `0` / `0` (exact) | Not hit |
| `Pages.csv` | `117` | **`201`** | **`22,057`** | **`+1` / `-60`** | Not hit (`117 < 1,000`) |
| `Queries.csv` | `588` | **`29`** | **`3,521`** | `-171` / `-18,596` *(anonymized long-tail)* | Not hit (`588 < 1,000`) |
| `Search appearance.csv` | `1` | **`17`** | **`612`** | Subset *(Product snippets only)* | Not hit |

3. **`Pages.csv` URL Hygiene & Normalization Checks:**
   - **Duplicate rows:** `0` (`117` unique exact URLs across `117` rows).
   - **Scheme & host uniformity:** `117/117` `https://` and `117/117` `www.gta6heistguide.com` (`0` HTTP, `0` non-www, `0` URL fragments).
   - **Truncation:** `0` row-limit truncation (`117` rows is well below GSC's `1,000`-row export cap).
   - **Exact-match canonical classification vs. `public/sitemap.xml` (`500` unique canonicals):**
     - **Canonical (`43` rows):** `83` clicks / `13,457` impressions (`0.62%` CTR).
     - **Legacy / Non-Canonical (`74` rows):** `118` clicks / `8,600` impressions (`1.37%` CTR), composed of `41` `.html` aliases, `21` retired/other slugs, `5` noindexed `/compare/*` URLs, `5` query-parameterized `/map` or `/map.html` URLs (`0` clicks / `14` impr), and `2` trailing-slash non-canonical variants of sitemap canonicals (`/save-planner`: `0` cl / `21` im vs. `/save-planner/`; `/free`: `0` cl / `3` im vs. `/free/`).
     - All `5` trailing-slash or query-parameter variants of canonical paths carry `0` clicks and `31` combined impressions (`24` trailing-slash + `7` query-param on `/map`); keeping strict exact-URL matching against `sitemap.xml` is methodologically correct for canonical consolidation tracking.
4. **Derived Cohort & Internal-Link Reproducibility Check:**
   - Recalculated all `55` unique canonical URLs in `phase25_cohort_performance.csv` directly against `Pages.csv`, `public/sitemap.xml`, and `git diff --name-only 60e90d4..f7e949f` (`31` modified canonical HTML pages + `1` JS module `public/assets/community/cd-submit.js`; `24` `/animals/*` profiles added in Cohort D; `55/55` in `sitemap.xml`; `0` row-level mismatches vs. `Pages.csv`).
   - Verified `6` overlapping URLs (`/port-gellhorn` in A|C|E; `/weapons`, `/escape-routes`, `/heists/vcia-takedown`, `/heists/jewelry-stores` in A|C; `/radio` in C|D) and deduplicated total: **`14` active / `41` zero-impression URLs, `64` clicks, `11,698` impressions, `0.55%` aggregate CTR**.
   - Verified all Cohort A–E subtotals exactly: **A** (`7` URLs, `6` active, `40` cl / `8,971` im, `0.45%` CTR), **B** (`4` URLs, `3` active, `2` cl / `901` im, `0.22%` CTR), **C** (`8` URLs, `8` active, `55` cl / `10,432` im, `0.53%` CTR), **D** (`39` URLs, `2` active, `13` cl / `435` im, `2.99%` CTR), **E** (`4` URLs, `2` active, `21` cl / `6,412` im, `0.33%` CTR).
   - Verified internal-link totals: `29/29` hub-matrix links present in live HTML with HTTP `200` and `100%` sitemap parity (`25` unique destinations), `23/23` `/radio/*` links in `public/radio.html`, and `24/24` `/animals/*` links in `public/animals.html`.

### 15.3 Verified Corrected Figures & Unresolved Upstream Limitations

- **Verified Figures (No Arbitrary Adjustments Required):** All reported headline (`200` / `22,117`), device (`200` / `22,117`), country (`200` / `22,117`), canonical (`83` / `13,457`), legacy (`118` / `8,600`), cohort (`64` / `11,698` deduplicated across `55` URLs), and internal-link totals (`29/29`, `23/23`, `24/24`) are **100% reproducible** from the raw exports with zero calculation errors.
- **Unresolved Upstream GSC Limitation #1 (Property vs. Page Aggregation Delta: `+1` Click / `-60` Impressions):** `Chart.csv`, `Devices.csv`, and `Countries.csv` use Google Search Console's **property-level aggregation** (`200` clicks / `22,117` impressions), whereas `Pages.csv` uses **page-level aggregation** (`201` clicks / `22,057` impressions). Under GSC's documented aggregation semantics, page-level tables can drop low-frequency/anonymized impressions (`-60`) while multi-URL SERP appearances (e.g., sitelinks or legacy+canonical URL pairs) can cause summed page-row clicks to slightly exceed deduplicated property-level clicks (`+1`). This upstream GSC variance is preserved faithfully without forced reconciliation.
- **Unresolved Upstream GSC Limitation #2 (Query Anonymization in `Queries.csv`):** Exported `Queries.csv` rows account for only `29` of `200` clicks (`14.5%`) and `3,521` of `22,117` impressions (`15.9%`); the remaining `85.5%` of clicks and `84.1%` of impressions belong to anonymized rare/long-tail queries omitted by Google Search Console.

### 15.4 Authoritative Source Matrix

| Metric Domain | Authoritative Source File(s) | Authoritative Baseline Value (`Oct 27 – Nov 23`, `7` Active Days) | Usage Rule |
|---|---|---|---|
| **Sitewide Headline Clicks, Impressions, CTR, Avg Position** | `Chart.csv` (corroborated by `Devices.csv` & `Countries.csv`) | `200` clicks / `22,117` impressions / `0.90%` CTR / `7.7` avg pos | Always use for sitewide totals and checkpoint comparisons. |
| **Daily Trajectory & Active-Day Count** | `Chart.csv` | `7` active days (`2026-11-17` – `2026-11-23`) + `1` zero start day (`2026-11-16`) | Always distinguish requested 28-day window from `7` active days. |
| **Device & Country Breakdowns** | `Devices.csv`, `Countries.csv` | Mobile `170`/`19,711`; Desktop `28`/`2,267`; Tablet `2`/`139` (`151` countries) | Reconciles `100%` to sitewide headline totals. |
| **Page-Level, Canonical/Legacy & Cohort Baselines** | `Pages.csv` + `phase25_cohort_performance.csv` | `43` canonical (`83`/`13,457`) + `74` legacy (`118`/`8,600`) = `201`/`22,057`; `55`-URL cohorts = `64`/`11,698` | Use for URL-level, canonical consolidation, and Cohort A–E tracking; do not force sum to `200`/`22,117`. |
| **Search Query Insights** | `Queries.csv` | `588` visible queries (`29` clicks / `3,521` impressions) | Treat as directional non-anonymized sample only — never as sitewide query sum. |
| **Rich Result Performance** | `Search appearance.csv` | `Product snippets`: `17` clicks / `612` impressions (`2.78%` CTR) | Subset of total performance; do not add to device or page totals. |

---

## Appendix: Exported CSV & Validation Script Inventory (`seo_reports/phase25/`)

1. `seo_reports/phase25/Chart.csv` — Raw GSC daily performance (`2026-11-16` – `2026-11-23`, unchanged)
2. `seo_reports/phase25/Pages.csv` — Raw GSC page performance (`117` URLs, unchanged)
3. `seo_reports/phase25/Queries.csv` — Raw GSC query performance (`588` queries, unchanged)
4. `seo_reports/phase25/Countries.csv` — Raw GSC country breakdown (`151` countries, unchanged)
5. `seo_reports/phase25/Devices.csv` — Raw GSC device breakdown (`3` devices, unchanged)
6. `seo_reports/phase25/Search appearance.csv` — Raw GSC search appearance (`Product snippets`, unchanged)
7. `seo_reports/phase25/Filters.csv` — Raw GSC export filter metadata (`Web (text-based)`, `Oct 27, 2026-Nov 23, 2026`, unchanged)
8. `seo_reports/phase25/phase25_cohort_performance.csv` — Reproducible deduplicated `55`-URL cohort performance & live metadata table
9. `seo_reports/phase25/phase25_internal_link_verification.csv` — Reproducible live production HTML verification of all `29` hub-matrix links
10. `seo_reports/phase25/validate_phase25_baseline.py` — Phase 25.1 read-only reproducible reconciliation & integrity validation script
