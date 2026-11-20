# Buyer Operations & Handover Manual — GTA6HeistGuide.com

Welcome! This site is engineered to run at **$0/month** on Cloudflare Pages + Cloudflare D1 with autonomous content/photo syncing and a 1-file monetization config.

---

## 1. Architecture at a Glance ($0/Month Stack)
- **Static & Edge Hosting:** Cloudflare Pages serving `./public` + serverless Functions in `./functions/` (100% free tier).
- **Database:** Cloudflare D1 SQLite (`gta6heistguide-db`) storing VIP email subscribers, forum LFG squads, dynamic guides, map pins, contact inquiries, live crowdsourced cheat/cash spot discoveries (`live_discoveries`), and affiliate outbound click logs.
- **Auto-Sync Engines ($0/Month GitHub Actions):**
  - **12-Hour Intel, Cheats & Patch Sync** (`.github/workflows/auto-sync-gta6.yml` + `sync_gta6_intel.py`): Fetches public feeds (IGN, GameSpot, Push Square, PC Gamer, Reddit r/GTA6) every 12 hours, updates `/data/live_intel.json`, deploys to Cloudflare Pages, and pings search crawlers via IndexNow.
  - **2-Hour Auto Updater** (`.github/workflows/auto-update-intel.yml`): Refreshes confirmed GTA 6 vehicles, characters, weapons, safehouses, and photos.
  - **Crowdsourced Auto-Verifier**: Real-time player submissions on `/cheats.html`, `/money-guide.html`, and `/weapons-bonuses.html` that auto-promote into Verified Live once 3+ players confirm.

---

## 2. 60-Second Affiliate Link Swap (`public/site-config.js`)
Open **`public/site-config.js`** and replace the values with your own accounts:

| Field | What It Controls Site-Wide |
|---|---|
| `amazonTag` | All 250+ Amazon Associates links + FTC footer disclosure |
| `exitLagUrl` | ExitLag affiliate referral URL site-wide |
| `exitLagCode` | Visible ExitLag coupon code + one-click Copy button |
| `g2aUrl` | G2A top banner, footers, ticker, and gear cards |
| `enebaUrl` & `enebaAffiliateId` | Eneba digital keys / PSN / Xbox gift card links |
| `whopUrl` & `getApexLocalUrl` | Digital software & creator bundle links |
| `ownerContactEmail` | All `mailto:` & DMCA / privacy contact addresses |
| `adsensePublisherId` | Leave `""` off, or paste `"ca-pub-..."` to auto-activate Google AdSense |
| `ga4MeasurementId` | Leave `""` off, or paste `"G-..."` to enable Google Analytics 4 |

Save and deploy — every static page banner, rotating deal card, bottom ticker, and footer updates dynamically. If enabling AdSense, also uncomment your Publisher ID line in `public/ads.txt`.

---

## 3. Protected Owner Command Drawer & Email Export
- Press **`Ctrl + Shift + O`** on any page (or visit `/syndicate-command.html`) and enter your Owner Admin Key.
- Inside the drawer you get:
  - **📊 Affiliate Click Counts by Partner** (real-time Cloudflare D1 counts + 7-day breakdown).
  - **📥 Export VIP Email Subscribers (.CSV)** (1-click CSV download from Cloudflare D1).
  - **Inbound Contact / Sponsor Inquiries** saved in D1 from `/contact.html` and `/acquisitions.html`.
- **Change Admin Key After Transfer:** In Cloudflare Dashboard → *Workers & Pages → gta6heistguide → Settings → Environment variables*, add `ADMIN_KEY` with your own private passphrase (default fallback is `syndicateadmin`).

---

## 4. Seller-to-Buyer Technical Transfer Checklist
1. **Domain:** Transfer `gta6heistguide.com` via registrar push or EPP Auth Code.
2. **GitHub Repository:** Transfer ownership (`Settings -> General -> Transfer`). Replace GitHub Secrets (`CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`) with the buyer's Cloudflare account tokens (seller revokes old token).
3. **Cloudflare Pages + D1 Database:**
   - Export seller D1 data: `npx wrangler d1 export gta6heistguide-db --remote --output=backup.sql`
   - Buyer creates D1 DB in their account, runs `backup.sql` (or `schema.sql`), updates `database_id` in `wrangler.toml`, connects GitHub, and attaches custom domain `www.gta6heistguide.com`.
4. **Update `public/site-config.js`** with buyer affiliate IDs and push/deploy.

---

## 5. Free Zero-API-Key SEO & Monitoring Commands
Run anytime from the repo root (requires Python 3 + `requests`, `beautifulsoup4`, `playwright`, `lxml`):

```bash
# Audit every sitemap URL (Raw HTML + Playwright Chromium render)
python seo_audit_engine.py --live

# Refresh Google Autocomplete + competitor TF-IDF keyword gaps (seo_reports/keyword_gaps.csv)
python seo_keyword_gap.py

# Log HTTP status, TTFB latency & indexability (seo_reports/seo_rankings_log.csv)
python rank_tracker.py

# Broadcast updated sitemap URLs instantly to Bing, Yandex & IndexNow
python indexnow_ping.py
```
