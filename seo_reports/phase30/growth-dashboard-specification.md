# GTA6HeistGuide — Lightweight Owner Growth Dashboard Specification (Phase 30)

**Status:** Architecture & Data-Contract Specification Only (Not Implemented in Phase 30)  
**Target Route (Future):** `/cd-admin/growth/` (protected by existing Cloudflare Access RS256 JWT middleware + `CD_ADMIN_EMAILS` allowlist — zero new auth systems)  
**Design Principle:** Aggregate from existing authoritative sources and lightweight snapshots. **Do NOT build a competing analytics database in D1.**

---

## 1. Metric Inventory & Data Availability Classification

Every widget in the owner dashboard MUST explicitly display a freshness badge (`LIVE`, `DELAYED`, or `UNAVAILABLE`) and last-updated timestamp so the owner never confuses real-time counts with delayed search/revenue reports.

| Metric | Source System | Classification | Refresh Cadence | Current Production Status (2026-11-24) |
|---|---|---|---|---|
| **Community Submissions** (total + by evidence tier) | Remote D1 (`cd_submissions`, `cd_verification_meta`) | **LIVE** | On-demand SQL aggregate (`<5ms`) | Active (`2` total, `2` rejected, `0` pending) |
| **Approved & Published Discoveries** + **Approved Map Pins** | Remote D1 (`cd_published`, `cd_reports`) | **LIVE** | On-demand SQL aggregate (`<5ms`) | Active (`0` published, `0` pins, `0` reports) |
| **Affiliate Outbound Clicks** (by partner & page_path) | Remote D1 (`affiliate_clicks`) | **LIVE** | On-demand SQL aggregate (`<5ms`) | Active (`36` outbound clicks logged; explicitly labeled **"Outbound Clicks — Not Revenue"**) |
| **Visits & Page Views** (24h / 7d / 30d) | Cloudflare Web Analytics (GraphQL API / Dashboard) | **LIVE / NEAR-REALTIME** (5–15 min lag) | Cached 15 min via read-only CF API token (or manual snapshot) | Active (`3` visits, `3` page views in first ~45 min; `siteTag=e8d79595f57b43cbb2a8fd92d84cf5ad`) |
| **Top Pages & Top Referrers** | Cloudflare Web Analytics (RUM) | **LIVE / NEAR-REALTIME** | Cached 15 min | Active (`/vehicles` = 3, `None (direct)` = 3) |
| **Core Web Vitals (LCP, INP, CLS)** | Cloudflare Web Analytics (RUM) | **DELAYED / SAMPLE-GATED** | Rolling 24h / 7d | LCP active (`489ms`, 100% Good); INP & CLS `No data` until sufficient interaction samples accumulate |
| **Search Clicks & Search Impressions** (Property vs Page totals) | Google Search Console (Search Analytics API or dated CSV import) | **DELAYED** (24–48h Google processing lag) | Daily / Weekly CSV snapshot | Active via GSC (`200` clicks / `22,117` impr in Phase 25.1; `147` / `15,887` in Nov 24 3-month finalized window). Must display Property-level and Page-level totals separately |
| **Custom Feature Events** (`heist_command_open`, `my_leonida_open`, `discovery_submit_start`, etc.) | Google Analytics 4 (via `window.GTA6Track`) | **UNAVAILABLE** (until GA4 property & ID configured) | Real-time / 24h once enabled | Instrumented locally in `site-config.js`, but `ga4MeasurementId` is blank and no GA4 property exists for `gta6heistguide.com` |
| **Returning Visitor Indicators** | GA4 (User/Session retention) + Cloudflare Navigation/Session ratios | **UNAVAILABLE** (no reliable returning-user cookie/ID today) | 24h once GA4 is enabled | Do NOT infer retention from Cloudflare page-view totals alone; show explicit `Unavailable — requires GA4` badge |
| **Confirmed Affiliate Revenue & Commission** | Amazon Associates Reports / Gumroad / ExitLag / G2A | **DELAYED / MANUAL** (24–72h ship-date lag; currently **UNAVAILABLE** for automated pull) | Weekly manual CSV import or authenticated owner review | Amazon Associates login blocked during automated audit; dashboard must show `Manual Import Required` and never estimate dollars from outbound clicks |
| **Display Ad Revenue (AdSense)** | Google AdSense | **UNAVAILABLE** | Daily once approved | AdSense login blocked; `public/ads.txt` is commented placeholder; `adsensePublisherId` is blank |

---

## 2. Dashboard Layout (4 Lightweight Panels)

1. **Panel A — Traffic & Web Vitals (Cloudflare RUM)**
   - KPI cards: Visits (24h / 7d), Page Views (24h / 7d), Avg Load Time, LCP P75, INP P75, CLS P75.
   - Compact tables: Top 10 Paths (highlighting core hubs `/`, `/map`, `/heist-command-center/`, `/my-leonida/`, `/community-discoveries/`, `/vehicles`, `/animals`, `/weapons`, `/properties`, `/weapons-bonuses`) and Top Referrers.
   - Badge: `Source: Cloudflare Web Analytics (Bots Excluded) · Near-Real-Time`.

2. **Panel B — Organic Search Performance (Google Search Console)**
   - KPI cards: Property Clicks, Property Impressions, Avg CTR, Avg Position, Data Freshness date.
   - Separate footnote/card for Page-level vs Property-level sum (preserving the documented Phase 25.1 GSC aggregation discrepancy).
   - Checkpoint tracker: Phase 25.2 evaluation countdown (**December 2, 2026**).
   - Badge: `Source: GSC Dated Snapshot · Delayed 24–48h`.

3. **Panel C — Community Intelligence Health (Live D1)**
   - Funnel counts straight from `cd_submissions`, `cd_verification_meta`, `cd_published`, `cd_reports`:
     - Total Submissions -> Awaiting Review -> Needs More Evidence -> Published (by tier: Community Reported / Corroborated / Verified in Gameplay / Officially Confirmed) -> Approved Map Pins -> Open Correction Reports.
   - Direct link to `/cd-admin/` moderation queue.
   - Badge: `Source: D1 Live Aggregate · Real-Time`.

4. **Panel D — Monetization & Feature Engagement (Clicks vs. Confirmed Revenue)**
   - **Left column (LIVE):** Outbound Affiliate Clicks by partner (`amazon`, `gumroad`, `exitlag`, `g2a`, etc.) and top converting `page_path` from `affiliate_clicks` — strictly labeled **Outbound Clicks (Not Earnings)**.
   - **Right column (DELAYED / UNAVAILABLE):** Confirmed Amazon Associates ordered/shipped items & commission (manual weekly upload slot), AdSense status (`Not Configured`), and GA4 Custom Event + Returning Visitor status (`Awaiting GA4 Property`).

---

## 3. Lightweight Technical Architecture (No Competing Analytics DB)

- **Endpoint:** `GET /api/cd-admin/growth-summary` (inherits `functions/api/cd-admin/_middleware.js` Cloudflare Access JWT + email allowlist protection; fails closed).
- **Live Queries:** Runs 4 read-only `SELECT COUNT(...) / GROUP BY` queries on existing D1 tables (`cd_submissions`, `cd_verification_meta`, `cd_published`, `affiliate_clicks`). Zero new D1 write tables required.
- **External Data Ingestion:**
  - **Cloudflare Web Analytics:** Optional read-only `CF_ANALYTICS_API_TOKEN` secret querying Cloudflare GraphQL Analytics API (`rumPageloadEventsAdaptiveGroups` + `rumWebVitalsEventsAdaptiveGroups`) with 15-minute edge cache.
  - **GSC & Amazon Reports:** Read-only JSON/CSV snapshot files committed to `seo_reports/` (or uploaded via authenticated admin view to a single KV key) — avoids OAuth complexity and respects GSC/Amazon Terms of Service.
- **Privacy & Security Guardrails:**
  - Zero PII (`contact_email`, `ip_hash`, raw user agents) returned in any dashboard payload.
  - Strict `Cache-Control: no-store` and `X-Robots-Tag: noindex, nofollow`.
  - No fake/placeholder revenue figures or synthetic retention percentages.
