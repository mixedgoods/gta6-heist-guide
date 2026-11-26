# PHASE 36.1 — GA4 Integration, Affiliate Dashboard & Analytics Preview Verification

**Project:** GTA6HeistGuide.com (`https://www.gta6heistguide.com`)  
**Isolated Branch:** `phase-36-analytics-growth`  
**Isolated Worktree:** `C:\Users\Shawn\.gemini\antigravity\scratch\phase-36-analytics-growth`  
**Production Baseline (Untouched):** `main` at `443a268` (`origin/main` and Desktop repo `C:\Users\Shawn\Desktop\gta6heistguide` untouched)  
**Preview URL:** `https://ad2cf0da.gta6heistguide.pages.dev`  
**Preview Deployment ID:** `ad2cf0da`  
**Branch Alias URL:** `https://phase-36-analytics-growth.gta6heistguide.pages.dev`  
**Verification Date (UTC):** 2026-11-26  

---

## 1. Verified GA4 Property & Stream Details

| Field | Verified Value |
|---|---|
| **Account** | Meditative (`165308318`) |
| **Property** | GTA6HeistGuide (`565884775`) |
| **Web Stream ID** | `16417865148` |
| **Website URL** | `https://www.gta6heistguide.com` |
| **Measurement ID** | `G-DG7REYHR80` |
| **Timezone / Currency / Industry** | `America/Chicago` / `USD` / `Games` |
| **Separate Property Isolation** | Existing **GetApexLocal** GA4 property remains completely separate and untouched |

---

## 2. Privacy & Consent Configuration

### GA4 Property-Level Settings (Verified)
- **Google Signals:** `OFF`
- **Ads Personalization:** `OFF` (`Disallow all` — 0 of 307 regions)
- **Granular Location & Device Collection:** `OFF`
- **User-Provided Data Collection:** `OFF`

### Client-Side Architecture (`public/site-config.js`, `public/assets/main.js`, `public/privacy-policy.html`)
- **Single Shared Idempotent Initializer:** `window.GTA6Privacy.initGa4()` in `public/site-config.js` initializes GA4 once per page across **all** public pages — including `/gaming-gear/` and `/my-leonida/`, which load `site-config.js` without `main.js`. `main.js` delegates to `window.GTA6Privacy.initGa4(gaId)` and checks both `window._gta6Ga4Initialized` and `script[data-gta6-ga4], script[src*="googletagmanager.com/gtag/js"]`.
- **Google Consent Mode v2 Defaults (Prior to `gtag('config', ...)`):**
  - **Consent-Required Regions (EEA + UK + Switzerland — 32 ISO region codes):** `analytics_storage: 'denied'`, `ad_storage: 'denied'`, `ad_user_data: 'denied'`, `ad_personalization: 'denied'`.
  - **Global Default:** `ad_storage: 'denied'`, `ad_user_data: 'denied'`, `ad_personalization: 'denied'` (advertising consent is never auto-granted).
- **Automatic Opt-Out Respect:** Never loads `gtag.js` or dispatches GA4 events when:
  - `navigator.globalPrivacyControl === true` (GPC)
  - `navigator.doNotTrack === '1'` or `'yes'` (DNT)
  - `localStorage.getItem('gta6_analytics_opt_out') === '1'`
  - `window['ga-disable-G-DG7REYHR80'] === true`
  - Current route is `/cd-admin*` or `/syndicate-command*`
- **Runtime Opt-Out:** Clicking **Disable Analytics on This Browser** on `/privacy-policy` sets `window['ga-disable-G-DG7REYHR80'] = true`, stores `gta6_analytics_opt_out = '1'`, pushes `gtag('consent', 'update', { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' })`, and blocks all subsequent `GTA6Track` dispatches (`dispatchedToGa4: false`).
- **Clean Paths & Zero-PII Filtering:**
  - `page_location` is forced to `window.location.origin + window.location.pathname` and `page_path` to `window.location.pathname` (strips all query strings).
  - `BLOCKED_KEY_RE` drops keys matching `name`, `first_name`, `last_name`, `full_name`, `user_name`, `email`, `mail`, `pass`, `pwd`, `secret`, `token`, `auth`, `phone`, `tel`, `address`, `query`, `search_term`, `text`, `input`, `body`, `message`, `comment`, `cookie`, `session`, `ssn`, `target_url`, `link_url`, `full_url`, `href`.
  - Value filtering rejects emails (`@`), query-bearing URLs (`?` + `=`), and phone-number strings.
- **Privacy Policy (`public/privacy-policy.html`):** Updated with accurate GA4 (`G-DG7REYHR80`), Consent Mode, GPC/DNT, and interactive opt-out disclosure without unsupported legal compliance claims.

---

## 3. Analytics Events & Duplicate Tracking Verification

### Implemented Event Model
| Event | Trigger | Key Anonymous Parameters |
|---|---|---|
| `page_view` | Single `gtag('config', 'G-DG7REYHR80', { send_page_view: true, ... })` | Clean `page_location` (query-stripped), `page_path` |
| `affiliate_click` | Single delegated handler (`main.js` primary, `affiliates.js` fallback only when `main.js` absent) | `merchant`, `product_id`, `placement`, `source_page`, `event_timestamp`, `page_category` |
| `tool_interaction` | Delegated `change` on tool/calculator controls (excludes email/password/tel) | `tool_name`, `interaction_type`, `source_page`, `event_timestamp`, `page_category` |
| `search_interaction` | Throttled (1500ms) `input` on site/map/database search fields (never sends raw query text) | `search_surface`, `source_page`, `event_timestamp`, `page_category` |
| `outbound_click` | Delegated click on non-affiliate external links only | `destination_host` (hostname only — no full URL/query), `source_page`, `event_timestamp` |

### Duplicate Tracking & Enhanced Measurement Results
- **Affiliate Click Deduplication (`tests/affiliate-click-deduplication.test.mjs` — 8/8 PASS):**
  - `affiliates.js` → `site-config.js` → `main.js`: **1 GA4 event, 1 D1 POST, 1 D1 row**
  - `main.js` → `affiliates.js`: **1 GA4 event, 1 D1 POST, 1 D1 row**
  - `affiliates.js` only (`/gaming-gear/`): **1 GA4 event, 1 D1 POST, 1 D1 row**
  - `main.js` only: **1 GA4 event, 1 D1 POST**
  - `enableAffiliateClickTracking: false`: **0 GA4 events, 0 D1 POSTs**
- **Live Preview Deduplication Check (Playwright on `https://ad2cf0da.gta6heistguide.pages.dev/`):**
  - Single click on an ExitLag affiliate link produced **`affEventCount: 1`**, **`outEventCount: 0`**, **`apiClicksPostCount: 1`**, **`dispatchedToGa4: true`**.
- **No Duplicate Page Views:** Across all 20 Desktop + Mobile Preview checks, `gaScriptCount === 1` and `configCallCount === 1`.
- **Enhanced Measurement Note:** GA4 Enhanced Measurement emits `click` (not `outbound_click`) by default for outbound links. For cleanest parity with our PII-free `outbound_click` event (which omits full outbound URLs/query strings), the owner may optionally toggle **Outbound clicks** OFF under *GA4 Admin → Data Streams → Web Stream `16417865148` → Enhanced measurement* prior to or after production promotion.

---

## 4. Protected Affiliate Dashboard Security & D1 Reporting Evidence

### Security Verification
- **Protected HTML Shell:** `/cd-admin/affiliate-dashboard.html` protected by `functions/cd-admin/_middleware.js` (Cloudflare Access RS256 JWT + `CD_ADMIN_EMAILS` allowlist, fail-closed).
- **Protected API:** `/api/cd-admin/affiliate-report` (alongside `/api/cd-admin/contact-inquiries` and `/api/cd-admin/subscribers`) protected by `functions/api/cd-admin/_middleware.js`.
- **Zero Embedded Secrets / Zero `sessionStorage` Secrets:** Verified via `SEC-J` test (`syndicateadmin` / `ADMIN_KEY` absent across all `functions/` and `public/` reporting files).
- **Live Preview Fail-Closed Evidence (`https://ad2cf0da.gta6heistguide.pages.dev`):**
  - `GET /cd-admin/affiliate-dashboard.html` → HTTP `503`, `Cache-Control: no-store`, `X-Robots-Tag: noindex, nofollow, noarchive`, `dashboardLeaksHtml: false`
  - `GET /api/cd-admin/affiliate-report` → HTTP `503`, `Cache-Control: no-store`, body `{"ok":false,"error":"Admin access is not configured."}`
  - `GET /api/clicks` → HTTP `405` (public reporting permanently blocked)
  - *Preview Limitation:* Cloudflare Pages Preview environments do not carry production Cloudflare Access secrets (`CF_ACCESS_TEAM_DOMAIN`, `CF_ACCESS_AUD`, `CD_ADMIN_EMAILS`), so `/cd-admin/*` and `/api/cd-admin/*` properly fail closed with HTTP `503`. Full RS256 JWT + allowlist authentication is verified in unit tests (`SEC-E`, `SEC-F`).

### D1 Reporting Coverage & Baseline Evidence
`getAffiliateClickReport(db)` (`functions/_lib/affiliate-clicks.js`) and `/cd-admin/affiliate-dashboard.html` render all 8 required reporting views directly from D1 `affiliate_clicks`:
1. **Total affiliate clicks** (`totalClicks` — baseline `51` total / `42` organic + `9` QA probes)
2. **Last 7 days** (`totalClicks7d` — baseline `51`)
3. **Last 30 days** (`totalClicks30d` — baseline `51`)
4. **Clicks by merchant** (`byPartner`, `last7DaysByPartner`, `last30DaysByPartner` — baseline: `amazon: 38`, `gumroad: 5`, `exitlag: 2`, `getapexlocal: 2`, `whop: 2`, `gfuel: 1`, `eneba: 1`)
5. **Clicks by landing page** (`byPage` — top baseline: `/`: 14, `/gaming-gear/`: 10, `/radio`: 6, `/secrets`: 4, `/live`: 3)
6. **Clicks by product** (`byProduct` — extracted from `placement` key or Amazon ASIN)
7. **Daily click trends** (`dailyTrend` 30d + `weeklyTrend` 12w)
8. **Most popular placements** (`byPlacement`)

**Revenue Integrity:** `revenueSummary` explicitly keeps `confirmedPurchases: null`, `confirmedCommissionsUsd: null`, and `estimatedRevenueUsd: null`. The dashboard renders `"Awaiting merchant report"` / `"Not fabricated"` with a prominent Measurement Integrity Notice so clicks are never presented as purchases or revenue.

---

## 5. Full Regression & Audit Results

| Check / Suite | Result | Details |
|---|---|---|
| JS Syntax Checks (`node --check` on 6 modified files) | **PASS (6/6)** | Zero syntax errors |
| `tests/affiliate-analytics-security.test.mjs` | **PASS (8/8)** | Fail-closed Access, JWT/allowlist verification, `no-store`, zero legacy keys |
| `tests/affiliate-click-deduplication.test.mjs` | **PASS (8/8)** | 1 click → 1 GA4 event + 1 D1 POST across all load orders |
| `tests/community-discoveries.test.mjs` | **PASS (81/81)** | Full community, moderation, security, and sitemap invariants intact |
| `tests/phase36-analytics-dashboard.test.mjs` | **PASS (6/6)** | GA4 `G-DG7REYHR80`, Consent Mode v2, `/gaming-gear/` init, opt-outs, PII blocking, dashboard schema |
| `scripts/phase33_product_audit.py` | **PASS (18/18)** | 0 dead ASINs, 0 missing tags, 0 forbidden page violations |
| `scripts/audit_adsense_verification.py` | **PASS (571/571)** | 0 duplicates, 0 conflicting publisher IDs, Impact.com verification intact |
| `npx wrangler pages functions build` | **PASS** | Compiled Worker successfully |
| `tests/http-smoke.mjs` against Preview | **18/24 PASS** | All security/admin/D1/click checks pass; 6 expected Preview-only Turnstile exceptions documented below |
| Playwright Preview QA (Desktop 1440×900 + Mobile 390×844) | **PASS (20/20)** | 10 routes × 2 viewports + live opt-out + live click dedupe + dashboard fail-closed |

### Documented Preview-Specific Turnstile Exceptions
The 6 `http-smoke.mjs` failures (`HTTP-06`, `HTTP-06B`, `HTTP-07`, `HTTP-10`, `HTTP-11`, `HTTP-12`) are expected Preview-environment behavior:
- Preview does not have production `TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET_KEY` secrets configured (`GET /api/community-discoveries/config` returns `{"ok":true,"turnstile":null,"turnstileMisconfigured":true,"uploads":false,"submissionsOpen":false}`), so `/api/community-discoveries/submit` intentionally fails closed.
- Production secrets were not modified per stop conditions.

---

## 6. Preview QA Coverage & Artifacts

- **Preview URL:** `https://ad2cf0da.gta6heistguide.pages.dev`
- **Deployment ID:** `ad2cf0da`
- **Branch Alias:** `https://phase-36-analytics-growth.gta6heistguide.pages.dev`
- **Routes Verified (Desktop 1440×900 & Mobile 390×844):**
  - `/` (Homepage)
  - `/gaming-gear/` (Gaming Gear — verified GA4 loads via `site-config.js` without `main.js`)
  - `/port-gellhorn` (Port Gellhorn)
  - `/vehicles` (Vehicles)
  - `/weapons` (Weapons)
  - `/properties` (Properties)
  - `/heist-command-center/` (Heist Command Center)
  - `/map` (Interactive Map)
  - `/heists/the-cartel-heist` (Editorial Heist Guide)
  - `/privacy-policy` (Editorial Privacy Policy + Interactive Opt-Out Control)
  - `/cd-admin/affiliate-dashboard.html` (Fail-closed `503` verification)
- **Verified Invariants Across All 20 Checks:**
  - `gaScriptCount === 1` (`G-DG7REYHR80`), `configCallCount === 1`, `consentCallsCount === 2`, `queryStripped === true`
  - `enableAmazonProductPlacements === false`, `visibleAmazonCards === 0`
  - `adsScriptCount === 1`, `/ads.txt` HTTP `200` with `pub-9556158063903839`
  - `brokenImageCount === 0`, `overflowPx === 0`, `pageErrors === []`
- **Raw QA JSON:** `C:\Users\Shawn\.gemini\antigravity\brain\fc797d5c-29ca-4d8c-a1f6-64bb0ae09c96\scratch\phase36_1_qa\phase36_1_preview_qa.json`
- **Fresh Screenshots (21 PNGs):** `C:\Users\Shawn\.gemini\antigravity\brain\fc797d5c-29ca-4d8c-a1f6-64bb0ae09c96\scratch\phase36_1_qa\screenshots\`

---

## 7. Safeguards & Remaining Production Prerequisites

### Safeguards Confirmed
- No merge into `main` (`main` remains at `443a268`).
- No push to `origin/main`.
- No production deployment.
- No production secret modifications.
- Auto Ads remains `OFF`.
- Amazon product placements remain disabled (`enableAmazonProductPlacements: false`).
- Zero unapproved affiliate merchants activated.
- All 8 Phase 36 reports preserved intact; original Desktop repo untouched.

### Exact Remaining Production Prerequisites (For Owner Approval)
1. **Owner Visual Review of Preview:** Review `https://ad2cf0da.gta6heistguide.pages.dev` (especially `/`, `/gaming-gear/`, `/port-gellhorn`, `/privacy-policy`).
2. **Optional GA4 Stream Hygiene:** In GA4 Admin → *Data Streams → `16417865148` → Enhanced measurement*, optionally disable **Outbound clicks** so GA4 relies solely on our PII-stripped `outbound_click` and `affiliate_click` events.
3. **Merge & Deploy Production (When Owner Approves):**
   - Merge `phase-36-analytics-growth` into `main` and push to `origin/main` (or deploy via Cloudflare Pages production trigger).
4. **Post-Production Verification:**
   - Sign in via Cloudflare Access to `https://www.gta6heistguide.com/cd-admin/affiliate-dashboard.html` and confirm live D1 metrics render with `Cache-Control: no-store`.
   - Open GA4 Realtime for property `565884775` (`G-DG7REYHR80`) and verify single `page_view` and single `affiliate_click` without query parameters or PII.
   - Re-run `node tests/http-smoke.mjs https://www.gta6heistguide.com` to confirm Turnstile-backed `HTTP-06..12` pass in production.
