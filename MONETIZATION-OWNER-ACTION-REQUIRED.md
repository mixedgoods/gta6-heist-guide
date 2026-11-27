# GTA6HEISTGUIDE — OWNER ACTION REQUIRED CHECKLIST (PHASE 48)

**Updated:** November 27, 2026  
**Purpose:** Single concise checklist of every monetization action that **only the site owner** can authorize or execute. Nothing below was executed automatically in respect of strict production, legal, financial, and account safeguards.

---

## Priority 1 — Release Phase 47 + Phase 48 to Production (Unblocks Active Amazon Cards!)

1. **Review the isolated Phase 48 Preview deployment** (URL recorded in `MONETIZATION-OWNER-CONTROL-CENTER.md` and `PHASE-48-GLOBAL-MONETIZATION-REPORT.md`).
2. **Why this immediately improves affiliate revenue readiness:** Live production (`de5d3a4`) still shows `0` Amazon cards on `/gaming-gear/` due to the Phase 35.1C pause, whereas Phase 47+48 restores **53 compact, compliant text-only cards on `/gaming-gear/`** and **14 cards on `/gta-6-settings/`** while keeping `enableAmazonProductPlacements: false` on the homepage (`/`).
3. **When ready:** Authorize merging `phase-48-global-monetization` into `main` and deploying to production.

---

## Priority 2 — Google AdSense Approval Monitoring & Post-Approval Auto Ads Activation

1. **DO NOT remove/re-add `gta6heistguide.com` or re-request review.** `ads.txt` is now **`Authorized`** and Policy Center shows **`No current issues`**. The site is in Google's normal `Getting ready` review queue (requested Nov 25, 2026; typically a few days up to 2–4 weeks).
2. **Check `https://adsense.google.com/adsense/u/0/` → Sites in 3–7 days.**
3. **Once `gta6heistguide.com` status changes from `Getting ready` → `Ready`:**
   - Open **Ads → By site → `gta6heistguide.com` → Edit**.
   - Toggle **Auto ads: ON** with the exact balanced settings documented in `MONETIZATION-AD-PLACEMENT-MAP.md`:
     - In-page Banner ads: **ON**
     - Multiplex ads: **ON** *(exclude `/gaming-gear/` and `/gta-6-settings/`)*
     - Anchor ads: **ON** (mobile/desktop dismissible)
     - Side rail ads: **ON** (wide desktop only)
     - Vignette ads: **ON** (conservative frequency cap)
     - Intent-driven formats: **OFF** initially
     - Ad load: **Moderate (~45%–55%)**
   - Add all **13 protected URLs/patterns** to **Excluded pages** (`/map`, `/interactive-map`, `/my-leonida/*`, `/save-planner/*`, `/heist-payout-calculator`, `/calculator`, `/heist-planner`, `/contact`, `/acquisitions`, `/privacy-policy`, `/terms`, `/cloud-mirrors/*`, `/giveaways`, `/affiliates-gear`, `/community-discoveries/*`).
   - Use **Excluded areas** in AdSense Preview to exclude top navbar (`#siteNavbar`), homepage hero, and `.amz-grid` / `#leonidaDropMount`.
   - Click **Apply to site**.
4. **Link AdSense ↔ GA4 (`G-DG7REYHR80`):**
   - Once AdSense approves the site (unlocking *Account → Access and authorization → Google Analytics integration*) and with GA4 Editor + AdSense Admin permissions, go to **GA4 Admin → Product Links → Google AdSense Links → Link** and connect `pub-9556158063903839` to property `GTA6HeistGuide (565884775)`.

---

## Priority 3 — Affiliate Account Verification & Top 3 New Applications

1. **Verify existing non-Amazon affiliate dashboards (read-only login required):**
   - **G2A Goldmine** (`https://www.g2a.com/goldmine`): Confirm active publisher profile, `reflink-4094b9aab5` attribution, and any pending balance.
   - **ExitLag** (`https://www.exitlag.com/be-affiliate` / Client Area): Confirm account status, site approval for `gta6heistguide.com`, tier level, and balance.
   - **Gumroad** (`https://apexlocallabs.gumroad.com`): Confirm `cutflow-pro` and `apex-pro-bundle` listings are live and owned/authorized.
2. **Check 5 pending Phase 36 network applications:**
   - **Impact.com** (account already active with live verification meta tag): Check decisions for **Logitech G**, **Razer**, and **Green Man Gaming**.
   - **Awin**: Check decision for **Fanatical**.
   - **Rakuten Advertising**: Check decision for **Newegg**.
3. **Submit the Top 3 Priority New Applications inside your existing Impact.com account** (zero new network accounts required):
   - **Priority #1:** **Elgato** (`91/100`) — ~5% commission, 30-day cookie; matches `/gta-6-settings/` capture cards & `/gaming-gear/` Stream Decks.
   - **Priority #2:** **Humble Bundle / Humble Partner** (`89/100`) — ~8% commission, 30-day cookie; authorized digital game store upgrade over grey-market sellers.
   - **Priority #3:** **B&H Photo Video** (`88/100`) — 2%–8% commission, 30-day cookie; trusted US retailer for PS5 SSDs, studio headphones, mics, capture cards & OLED monitors.
   - *(Optional next wave on Impact.com: **Govee** [89/100], **SCUF Gaming** [88/100], **Corsair** [85/100], **Streamlabs** [80/100]. Optional CJ Affiliate signup later for **KontrolFreek** & **Secretlab**.)*
4. **Amazon Associates (`gta6heistguid-20`) Tax & Payment Setup (Deferred by Owner):**
   - Account shows `US Tax Status: Incomplete` & `Canada Tax Status: Incomplete`. Complete tax/payment details directly in Amazon Associates when you are ready to receive payouts (not touched in Phase 48 per owner instruction).

---

## Priority 4 — Direct Sponsorships & Analytics Hygiene

1. **Wait for a full 30-day GA4 baseline (target ~Dec 26, 2026)**, then update the placeholder row in `MONETIZATION-SPONSORSHIP-MEDIA-KIT.md` and `public/acquisitions.html` with verified 30-day active users/pageviews before sending sponsor outreach.
2. **Approve & send outreach emails manually** using the drafts in `MONETIZATION-SPONSORSHIP-MEDIA-KIT.md` (starting with console storage & controller brands: WD_BLACK/Samsung/Lexar, Elgato, SCUF/PowerA/KontrolFreek).
3. **Optional GA4 Stream Hygiene (from Phase 36.1):** In GA4 Admin → Data Streams → `16417865148` → Enhanced measurement, optionally toggle **Outbound clicks** OFF so GA4 relies cleanly on our PII-stripped `affiliate_click` and `outbound_click` events.
4. **Confirm Cloudflare Zero Trust Access env vars** on production (`CF_ACCESS_TEAM_DOMAIN`, `CF_ACCESS_AUD`, `CD_ADMIN_EMAILS`) so `/cd-admin/affiliate-dashboard.html` works in production.

---

## Priority 5 — Deferred Future Opportunities (Do Not Implement Yet)

- **Original Digital Products** (e.g., printable 100% completion checklist PDFs or heist planning packs via Gumroad): Defer until site reaches consistent monthly traffic and clear reader demand.
- **Voluntary Email Newsletter:** Defer until an email service provider (e.g., Buttondown/ConvertKit/Brevo) is provisioned with verified double opt-in, privacy disclosure, and unsubscribe handling.
- **Paid Memberships / Paywalls:** **Not recommended** at this stage; keep the free, login-free utility model intact as the site's core competitive advantage.
- **GetApexLocal Links (`70` links across `62` pages):** Decide in a future cleanup whether to keep subtle footer/network brand links or remove non-gaming links from gameplay guides.
