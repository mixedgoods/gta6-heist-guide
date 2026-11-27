# GTA6HEISTGUIDE — MONETIZATION MONTHLY SCORECARD (BASELINE: NOVEMBER 2026)

**Reporting Baseline Date:** November 27, 2026  
**Website:** `https://www.gta6heistguide.com`  
**Automation Script:** `scripts/generate-monetization-scorecard.mjs` *(ingests sanitized monthly JSON exports, strips any accidental secret/credential keys, and renders clean monthly markdown scorecards)*

> **Revenue Integrity Rules:**
> - **Estimated AdSense earnings** are NEVER conflated with **finalized payments**.
> - **Affiliate outbound clicks** are NEVER reported as confirmed orders, conversions, or revenue.
> - **Unavailable data** is explicitly marked `Unavailable` — zero historical or projected figures are fabricated.
> - Zero account secrets, passwords, tax IDs, or banking credentials are stored anywhere in this repository.

---

## 1. Google AdSense Baseline (Verified Read-Only 2026-11-27)

**Account:** `pub-9556158063903839` (`ca-pub-9556158063903839`, Customer ID `2258670210`)  
**Site Approval Status:** `Getting ready` (requested Nov 25, 2026 13:50) | **ads.txt Status:** `Authorized` | **Auto Ads:** `OFF` | **Policy Center:** `No current issues`

| Metric | Last 7 Days | Last 30 Days | All Time (Last 3 Years) | Classification |
|---|---:|---:|---:|---|
| Estimated Earnings (USD) | `$0.00` | `$0.00` | `$0.00` | Estimated (unfinalized) |
| Finalized Payments (USD) | `$0.00` | `$0.00` | `$0.00` | Finalized revenue |
| Page Views (AdSense) | `0` | `0` | `0` | AdSense report |
| Ad Requests | `Unavailable` *(0 populated rows)* | `Unavailable` *(0 populated rows)* | `Unavailable` | AdSense report (site `Getting ready`) |
| Matched Requests | `Unavailable` | `Unavailable` | `Unavailable` | AdSense report |
| Ad Impressions | `0` | `0` | `0` | AdSense report |
| Ad Coverage | `Unavailable` | `Unavailable` | `Unavailable` | AdSense report |
| Active View Viewable | `—` | `—` | `—` | AdSense report |
| Clicks | `0` | `0` | `0` | AdSense report |
| Page RPM (USD) | `—` | `—` | `—` | AdSense report |
| Impression RPM (USD) | `—` | `—` | `—` | AdSense report |
| Top Earning Ad Formats | `None yet` | `None yet` | `None yet` | Auto Ads OFF / site `Getting ready` |
| Top Earning Pages | `None yet` | `None yet` | `None yet` | Auto Ads OFF / site `Getting ready` |

---

## 2. Affiliate Partner Baseline (Verified 2026-11-27)

| Partner | Account / Tracking ID | Outbound Clicks (Official Dashboard) | Outbound Clicks (D1 / GA4) | Confirmed Orders | Shipped Items | Conversion Rate | Confirmed Commissions (USD) | EPC (USD) | Data Source |
|---|---|---:|---:|---:|---:|---:|---:|---:|---|
| **Amazon Associates (US)** | `gta6heistguid-20` | **82** *(Last 30d as of Nov 27, 2026)* | D1 baseline `38` (Nov 25) / GA4 `2` total aff clicks (Nov 25–26) | **0** | **0** | **0.00%** | **$0.00** | **$0.00** | Live Amazon Associates dashboard |
| **G2A Goldmine** | `reflink-4094b9aab5` | `Unavailable` *(owner login required)* | D1 baseline `0` | `Unavailable` | `Unavailable` | `Unavailable` | `Unavailable` | `Unavailable` | Pending owner dashboard check |
| **ExitLag** | `refer/10386953` | `Unavailable` *(owner login required)* | D1 baseline `2` | `Unavailable` | `Unavailable` | `Unavailable` | `Unavailable` | `Unavailable` | Pending owner dashboard check |
| **Gumroad (CutFlow Pro / Bundle)** | `apexlocallabs.gumroad.com` | `Unavailable` *(owner login required)* | D1 baseline `5` | `Unavailable` | `Unavailable` | `Unavailable` | `Unavailable` | `Unavailable` | Pending owner Gumroad check |
| **GetApexLocal** | Owned sister site | `N/A` | D1 baseline `2` | `N/A` | `N/A` | `N/A` | `N/A` | `N/A` | Sister property (non-affiliate) |
| **Eneba** | Inactive | `N/A` | `0` active | `N/A` | `N/A` | `N/A` | `N/A` | `N/A` | Inactive |

*Note on Amazon Clicks vs. Orders:* Live production (`de5d3a4`) still has `/gaming-gear/` cards paused under Phase 35.1C; Phase 47+48's 53 compact cards on `/gaming-gear/` and 14 cards on `/gta-6-settings/` are staged in Preview awaiting owner release.

---

## 3. Direct Sponsorships Baseline

| Metric | November 2026 Baseline | Notes |
|---|---:|---|
| Inbound Sponsor Inquiries | `0` *(baseline)* | Contact form `/api/contact` & `/acquisitions` upgraded in Phase 48 |
| Active Signed Agreements | `0` | No outreach sent without owner approval |
| Active Campaigns | `0` | Media kit & outreach drafts prepared in `MONETIZATION-SPONSORSHIP-MEDIA-KIT.md` |
| Paid Sponsorship Revenue (USD) | `$0.00` | Confirmed paid revenue only |
| Renewal Opportunities | `0` | — |

---

## 4. Traffic, Organic Search & Overall Revenue Summary

### Verified Audience & Search Baseline
- **GA4 (`G-DG7REYHR80`, Property `565884775`, active since Nov 25, 2026 — ~48h window):**
  - Active Users: `93` | New Users: `93` | Sessions: `108` (`57` engaged, `52.78%` engagement rate) | Page Views: `236` (`2.54` views/user) | Avg Engagement Time: `44s/user` (`38s/session`).
  - Channel Mix (Sessions): Direct `40` (`37.04%`), AI Assistant (`chatgpt.com`) `38` (`35.19%`, `68.42%` eng. rate), Organic Search `30` (`27.78%`, `63.33%` eng. rate), Unassigned `8` (`7.41%`).
  - Commercial-Intent Page Views: `/gaming-gear/` (`7` views, `34s` avg eng.), `/vehicles` (`15` views, `42s`), `/gta-6-money-guide/` (`9` views, `1m 01s`).
- **Google Search Console (`https://www.gta6heistguide.com/`, Nov 16–27, 2026):**
  - Indexed Pages: `222` (`468` not indexed) | Total Clicks: `203` | Total Impressions: `22,476` | Avg CTR: `0.9%` | Avg Position: `7.7`.
  - Hardware / Settings Queries: `13` clicks, `273` impressions (`4.8%` CTR, pos `8.1`) across 24 queries including `best settings gta 6 ps5 pro` (`pos 7.8`) and `best dualsense edge settings for gta 6` (`pos 11.0`).

### Overall Revenue Rollup (November 2026)

| Revenue Source | Estimated / Unfinalized (USD) | Confirmed / Finalized Revenue (USD) | Status |
|---|---:|---:|---|
| Google AdSense | `$0.00` | `$0.00` | Pending site approval (`Getting ready`) & Auto Ads activation |
| Amazon Associates (`gta6heistguid-20`) | `$0.00` | `$0.00` | Active (`82` clicks, `0` orders); Phase 47+48 cards pending release |
| G2A / ExitLag / Gumroad | `Unavailable` | `Unavailable` | Requires owner dashboard verification |
| Direct Sponsorships | `$0.00` | `$0.00` | Prospectus & media kit ready; outreach pending owner approval |
| Digital Products / Other | `$0.00` | `$0.00` | Deferred until audience scale & demand validated |
| **Total Confirmed Revenue (Nov 2026)** | **$0.00** | **$0.00** | **Verified baseline established** |

---

## 5. Monthly Review Workflow (Using `scripts/generate-monetization-scorecard.mjs`)

On the **1st business day of each month**:
1. Export trailing-month figures (non-sensitive metrics only — never credentials or tax IDs) from:
   - **AdSense Reports** (Estimated earnings, Finalized payments, Page views, Ad requests, Matched requests, Impressions, Coverage, Page RPM, Impression RPM)
   - **GA4 (`G-DG7REYHR80`)** (Users, Sessions, Views, `affiliate_click` by `partner_name` / `product_id` / `page_path`)
   - **Cloudflare D1 Admin Dashboard** (`/cd-admin/affiliate-dashboard.html`)
   - **Amazon Associates, Impact.com, G2A, ExitLag, Gumroad** (Clicks, Confirmed orders, Confirmed commissions)
   - **Google Search Console** (Organic clicks, Impressions, Top commercial queries)
2. Save sanitized monthly JSON locally (outside `public/` and untracked by git) and run:
   ```bash
   node scripts/generate-monetization-scorecard.mjs --input monthly-export.json --output MONETIZATION-MONTHLY-SCORECARD.md
   ```
3. Compare Month-over-Month (MoM) RPM, EPC, conversion rate, and commercial-intent organic clicks.
