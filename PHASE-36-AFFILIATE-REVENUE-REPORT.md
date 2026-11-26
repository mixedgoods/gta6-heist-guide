# PHASE 36 — Affiliate Revenue & Clicks Reporting Dashboard Report

**Project:** GTA6HeistGuide.com (`https://www.gta6heistguide.com`)  
**Protected API Endpoint:** `GET /api/cd-admin/affiliate-report` (Cloudflare Access RS256 JWT + `CD_ADMIN_EMAILS` allowlist, fail-closed)  
**Protected Admin UI:** `/cd-admin/affiliate-dashboard.html` (protected by `functions/cd-admin/_middleware.js`, `noindex, nofollow, noarchive`, `Cache-Control: no-store`)  
**Data Source:** Existing Cloudflare D1 `affiliate_clicks` table (`gta6heistguide-db`, read-only baseline inspected 2026-11-25)

> **Revenue Integrity Guarantee:** Every click count below is an **actual outbound affiliate click** recorded in Cloudflare D1. Clicks are **never** labeled as purchases, commissions, or revenue. Confirmed purchases and commissions are reported only when verified from official merchant dashboards (currently `null` / awaiting merchant reporting).

---

## 1. Live D1 Read-Only Baseline (As of 2026-11-25)

| Metric | Value | Classification |
|---|---:|---|
| **Total Actual Clicks (All-Time)** | `51` | Actual outbound clicks (includes `9` automated QA/smoke probe rows) |
| **Organic / Non-Probe Clicks** | `42` | Actual outbound clicks excluding `http_smoke` (7) & `phase35_*_probe` (2) |
| **Clicks — Last 7 Days** | `51` | Rolling 7-day actual clicks |
| **Clicks — Last 30 Days** | `51` | Rolling 30-day actual clicks |
| **Confirmed Purchases** | `Not reported` (`null`) | Requires official merchant dashboard confirmation |
| **Confirmed Commissions (USD)** | `Not reported` (`null`) | Requires official merchant dashboard confirmation |
| **Estimated Revenue (USD)** | `Not fabricated` (`null`) | Not estimated without verified conversion data |

### Clicks by Merchant (D1 Baseline)
| Merchant / Partner | Actual Clicks | Notes |
|---|---:|---|
| `amazon` | `38` | Amazon Associates (`gta6heistguid-20`); placements currently paused (`enableAmazonProductPlacements: false`) |
| `gumroad` | `5` | CutFlow Pro / Apex Local Labs |
| `exitlag` | `2` | ExitLag referral |
| `getapexlocal` | `2` | Owned sister site |
| `whop` | `2` | Legacy historical rows |
| `gfuel` | `1` | Legacy historical row |
| `eneba` | `1` | Legacy historical row (purged in prior phase) |

### Top Landing Pages by Actual Clicks (D1 Baseline)
| Landing Page | Actual Clicks |
|---|---:|
| `/` | `14` |
| `/gaming-gear/` | `10` |
| `/radio` | `6` |
| `/secrets` | `4` |
| `/live` | `3` |
| `/save-planner` | `2` |
| `/heists/small-banks-payday-loans` | `2` |
| `/gta-6-money-guide/` | `2` |
| `/drops` | `2` |
| `/cheats` | `2` |
| `/settings`, `/lucia-jason-skills`, `/heists/vcia-takedown`, `/free` | `1` each |

### Top Click Placements (D1 Baseline)
| Placement | Actual Clicks | Type |
|---|---:|---|
| `sitewide` | `19` | Sitewide / general affiliate link |
| `http_smoke` | `7` | Automated QA smoke test |
| `home-setup-picks-1` | `3` | Homepage setup card (prior to Phase 35.1C pause) |
| `live-player-bar`, `home-thumbsticks`, `home-ssd`, `heist-setup-bar` | `2` each | Contextual placements |
| `phase35_1b_probe`, `phase35_1b1_probe` | `1` each | Security verification probes |
| `money-top:blueYetiBlackout`, `live-toolkit-cutflow`, `store-deals-ssd`, etc. | `1` each | Contextual slots |

---

## 2. Phase 36 Dashboard Implementation (Isolated Branch Only)

### Backend Enhancements (`functions/_lib/affiliate-clicks.js`)
Extended `getAffiliateClickReport(db)` using the existing D1 `affiliate_clicks` table (zero duplicate tracking tables, zero public endpoints, 100% backwards-compatible):
- Added `totalClicks30d` and `last30DaysByPartner`.
- Added `byPage` (top 20 landing pages), `byProduct` (top 20 products extracted from `placement` `slot:productKey` or Amazon `/dp/ASIN`), and `byPlacement` (top 20 placements).
- Added `dailyTrend` (last 30 days) and `weeklyTrend` (last 12 weeks).
- Added `revenueSummary` explicitly separating `actualClicks`, `organicClicksExcludingProbes`, `qaProbeClicks`, `confirmedPurchases: null`, `confirmedCommissionsUsd: null`, and `estimatedRevenueUsd: null`.

### Protected Admin Dashboard UI (`/cd-admin/affiliate-dashboard.html` + `/assets/community/cd-affiliate-dashboard.js`)
- Protected automatically by `functions/cd-admin/_middleware.js` (Cloudflare Access RS256 JWT + `CD_ADMIN_EMAILS`, fail-closed `503`/`401`/`403`).
- Zero `innerHTML` sinks (renders strictly with DOM `createElement` / `textContent`).
- Linked from `/cd-admin/index.html` header for one-click owner access.
- Displays KPI summary cards, Measurement Integrity Notice, Merchant breakdown, Top Landing Pages, Top Products, Top Placements, Daily Trend, Weekly Trend, and Recent Clicks.
- Excluded from AdSense (`scripts/audit_adsense_verification.py`) and GA4 (`public/site-config.js` / `main.js`).
