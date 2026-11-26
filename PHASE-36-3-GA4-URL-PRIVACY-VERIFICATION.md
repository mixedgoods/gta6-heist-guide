# PHASE 36.3 — GA4 URL PRIVACY HARDENING & ANALYTICS VALIDATION

**Status:** PREVIEW DEPLOYED & VERIFIED (STOPPED BEFORE PRODUCTION)  
**Verification Date (UTC):** `2026-11-26T02:30:00Z` – `2026-11-26T02:42:00Z`  
**Isolated Feature Branch:** `phase-36-3-ga4-url-privacy` (branched from production baseline `a5f0245`)  
**Fix Commit:** `1b0d75e`  
**Cloudflare Pages Preview URL:** `https://7234d1f6.gta6heistguide.pages.dev`  
**Branch Alias URL:** `https://phase-36-3-ga4-url-privacy.gta6heistguide.pages.dev`  
**Cloudflare Pages Deployment ID:** `7234d1f6-b47e-452c-9166-bf58fd862f73`  
**Production Baseline (Untouched):** `https://www.gta6heistguide.com` (Deployment `ff088f17-c245-4ab8-9aed-fbf1c925a1d1`, Commit `a5f0245`)  
**GA4 Property / Measurement ID:** Property `565884775` / `G-DG7REYHR80` (zero account-level changes)

---

## 1. Confirmed Original Root Cause

Live browser network inspection against `https://www.gta6heistguide.com` (commit `a5f0245`) and controlled experiments against live `https://www.googletagmanager.com/gtag/js?id=G-DG7REYHR80` confirmed the exact cause of query-parameter leakage into GA4 `dl` and `dr`:

1. **`gtag('js', new Date())` executed before `page_location` and `page_referrer` were established:**
   - In the baseline `public/site-config.js` (and fallback in `public/assets/main.js`), initialization pushed commands in this order:
     1. `gtag('consent', 'default', ...)`
     2. `gtag('js', new Date())`
     3. `gtag('config', 'G-DG7REYHR80', { page_location: cleanOrigin + cleanPath, page_path: cleanPath, send_page_view: true })`
   - Google Tag (`gtag.js` for `G-DG7REYHR80`, with Enhanced Measurement `Page views: ON`) processes the `dataLayer` chronologically and evaluates `window.location.href` / `document.referrer` when `gtag('js', new Date())` initializes the container — **before** `gtag('config', ...)` applies its `page_location` parameter.
   - As a result, the automatic `page_view` (and subsequent custom events) serialized the raw browser URL into `dl=` (leaking `token`, `fbclid`, `auth`, `session`, `phone`, `secret`, `q`, etc., with GA4 only redacting email-shaped values as `(redacted)`) and serialized the raw unsanitized `document.referrer` (including query parameters) into `dr=`.
2. **Why `send_page_view: false` + manual `page_view` alone was NOT sufficient (and caused duplication):**
   - Controlled Playwright tests against real `gtag.js` proved that setting `send_page_view: false` in `gtag('config', ...)` while keeping `gtag('js', new Date())` ahead of `gtag('set', ...)` **still leaked raw `dl`/`dr`** on the container's automatic `page_view` AND caused **2 `page_view` events** when combined with a manual `gtag('event', 'page_view', ...)`.
   - Calling `gtag('set', { page_location: cleanLocation, page_referrer: cleanReferrer })` **after Consent Mode defaults and strictly BEFORE `gtag('js', new Date())`** — without dispatching a duplicate manual `page_view` — causes the initial automatic `page_view` AND every subsequent event (`affiliate_click`, `search_interaction`, etc.) to transmit the sanitized `dl` and `dr` with **exactly 1 `page_view` per page load**.

---

## 2. Files Changed

| File | Summary of Changes |
|---|---|
| `public/site-config.js` | Added `sanitizeUtmValue()`, `sanitizePageLocation()`, and `sanitizePageReferrer()` exposed on `window.GTA6Privacy`. Reordered `initGa4()` to: (1) Consent Mode defaults → (2) `gtag('set', { page_location, page_referrer })` → (3) `gtag('js', new Date())` → (4) `gtag('config', gaId, ...)` with single `page_view`. Expanded `BLOCKED_KEY_RE` (`fbclid`, `gclid`, `msclkid`, `dclid`, `yclid`, `wbraid`, `gbraid`, `mc_eid`, `api_key`, `jwt`, `bearer`, `credit_card`, `card_number`, `ip`, `user_id`, `client_id`, `page_location`, `page_referrer`), added `SENSITIVE_VAL_RE` (emails, `%40`, JWTs, key=value patterns, URL fragments/queries), and excluded `input[type="hidden"]` from `tool_interaction`. |
| `public/assets/main.js` | Updated the standalone fallback GA4 initialization block inside `SiteConfig.initOptionalScripts()` to match the exact `consent default` → `set` (sanitized `page_location` and `page_referrer`) → `js` → `config` sequence. |
| `tests/phase36-analytics-dashboard.test.mjs` | Extended browser test harness with `referrer` and `hash` support and added 4 new Phase 36.3 regression tests (`P36.3-URL1`, `P36.3-UTM1`, `P36.3-ORDER1`, `P36.3-PII1`). |

---

## 3. URL & Referrer Sanitization Implementation

- **`sanitizePageLocation(rawHref)`:**
  - Parses the URL without mutating `window.location.href` (the visible browser URL and application query functionality remain completely untouched).
  - Preserves only `protocol + '//' + host + pathname` (strips credentials, fragments `#...`, and all arbitrary query parameters including `email`, `token`, `auth`, `secret`, `phone`, `session`, `fbclid`, `gclid`, `q`, and unknown keys).
  - Campaign attribution allowlist: preserves **only** `utm_source`, `utm_medium`, and `utm_campaign` when values pass strict `sanitizeUtmValue()` validation:
    - Length 1–40 chars, matching `/^[a-zA-Z0-9][a-zA-Z0-9._-]{0,39}$/` (rejects `@`, spaces, `=`, `?`, `#`, `%`, `/`, `+`, `:`).
    - Rejects sensitive substrings (`token`, `secret`, `auth`, `pass`, `pwd`, `session`, `email`, `phone`, `bearer`, `apikey`, `fbclid`, `gclid`, `cookie`, `ssn`).
    - Rejects phone-number shapes (`>= 7` digits), pure numeric IDs (`>= 6` digits), hex IDs (`>= 16` hex chars), and opaque alnum tokens (`>= 24` chars).
    - `utm_term` and `utm_content` are stripped to prevent search-term or ad-identifier leakage.
- **`sanitizePageReferrer(rawReferrer)`:**
  - Strips all query parameters, fragments, and embedded URL credentials unconditionally; returns `protocol + '//' + host + pathname` for `http:` / `https:` referrers and `""` for empty, invalid, or non-HTTP(S) referrers.
- **Initialization Sequence (`initGa4`):**
  1. `gtag('consent', 'default', { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied', region: CONSENT_REQUIRED_REGIONS })`
  2. `gtag('consent', 'default', { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' })`
  3. `gtag('set', { page_location: cleanLocation, page_referrer: cleanReferrer })`
  4. `gtag('js', new Date())`
  5. `gtag('config', gaId, { anonymize_ip: true, allow_google_signals: false, allow_ad_personalization_signals: false, page_location: cleanLocation, page_referrer: cleanReferrer, page_path: cleanPath, send_page_view: true })`

---

## 4. Before-and-After Network Evidence

Captured via headless Chromium (Playwright) executing live `gtag.js` (`G-DG7REYHR80`) and inspecting outgoing `POST https://www.google-analytics.com/g/collect` requests (fulfilled locally with HTTP `204` to avoid sending synthetic test values into live GA4):

### BEFORE (Production Baseline `a5f0245` on `https://www.gta6heistguide.com`)

| Test URL & Referrer | Observed `en` | Observed `dl` (Document Location) | Observed `dr` (Document Referrer) | Leak? |
|---|---|---|---|---|
| `/?email=test@example.com&token=FAKE_TOKEN_123&fbclid=FAKE_CLICK_ID&auth=FAKE_AUTH&session=FAKE_SESSION#secret_fragment` <br>Ref: `https://external-referrer.example/callback?token=REF_TOKEN_999&email=ref@example.com` | `page_view` (1) | `https://www.gta6heistguide.com/?email=(redacted)&token=FAKE_TOKEN_123&fbclid=FAKE_CLICK_ID&auth=FAKE_AUTH&session=FAKE_SESSION` | `https://external-referrer.example/callback?token=REF_TOKEN_999&email=(redacted)` | **YES — LEAKED** |
| `/port-gellhorn?auth=FAKE_AUTH&session=FAKE_SESSION&phone=5551234567&secret=FAKE_SECRET` <br>Ref: `https://www.gta6heistguide.com/?token=INTERNAL_REF_TOKEN&fbclid=INTERNAL_FBCLID` | `page_view` (1) | `https://www.gta6heistguide.com/port-gellhorn?auth=FAKE_AUTH&session=FAKE_SESSION&phone=5551234567&secret=FAKE_SECRET` | `https://www.gta6heistguide.com/?token=INTERNAL_REF_TOKEN&fbclid=INTERNAL_FBCLID` | **YES — LEAKED** |
| `/search?q=FAKE_QUERY_VALUE&utm_source=reddit&utm_medium=social&utm_campaign=launch_2026&utm_content=user@example.com` | `page_view` (1) | `https://www.gta6heistguide.com/search?q=FAKE_QUERY_VALUE&utm_source=reddit&utm_medium=social&utm_campaign=launch_2026&utm_content=(redacted)` | *(empty)* | **YES — LEAKED** |

### AFTER (Preview `7234d1f6-b47e-452c-9166-bf58fd862f73` on `https://7234d1f6.gta6heistguide.pages.dev`)

| Test URL & Referrer | Visible URL Untouched? | `gtag/js` Loads | `page_view` Count | Observed `dl` | Observed `dr` | Signals (`gcs`/`npa`/`ngs`) | Leak? |
|---|---|---|---|---|---|---|---|
| `/?email=test@example.com&token=FAKE_TOKEN_123&fbclid=FAKE_CLICK_ID&auth=FAKE_AUTH&session=FAKE_SESSION#secret_fragment` (Desktop) <br>Ref: `https://external-referrer.example/callback?token=REF_TOKEN_999&email=ref@example.com` | YES | `1` | `1` | `https://7234d1f6.gta6heistguide.pages.dev/` | `https://external-referrer.example/callback` | `G10-` / `1` / `1` | **NONE (PASS)** |
| `/?email=test@example.com&token=FAKE_TOKEN_123&fbclid=FAKE_CLICK_ID#secret_fragment` (Mobile `390x844`) <br>Ref: `https://external-referrer.example/callback?token=REF_TOKEN_999&email=ref@example.com` | YES | `1` | `1` | `https://7234d1f6.gta6heistguide.pages.dev/` | `https://external-referrer.example/callback` | `G10-` / `1` / `1` | **NONE (PASS)** |
| `/guides/example?auth=FAKE_AUTH&session=FAKE_SESSION` <br>Ref: `https://7234d1f6.gta6heistguide.pages.dev/?token=INTERNAL_REF_TOKEN&fbclid=INTERNAL_FBCLID` | YES | `1` | `1` | `https://7234d1f6.gta6heistguide.pages.dev/guides/example` | `https://7234d1f6.gta6heistguide.pages.dev/` | `G10-` / `1` / `1` | **NONE (PASS)** |
| `/port-gellhorn?auth=FAKE_AUTH&session=FAKE_SESSION&phone=5551234567&secret=FAKE_SECRET` <br>Ref: `https://7234d1f6.gta6heistguide.pages.dev/?token=INTERNAL_REF_TOKEN&fbclid=INTERNAL_FBCLID` | YES | `1` | `1` | `https://7234d1f6.gta6heistguide.pages.dev/port-gellhorn` | `https://7234d1f6.gta6heistguide.pages.dev/` | `G10-` / `1` / `1` | **NONE (PASS)** |
| `/search?q=FAKE_QUERY_VALUE` | YES | `1` | `1` | `https://7234d1f6.gta6heistguide.pages.dev/search` | `""` | `G10-` / `1` / `1` | **NONE (PASS)** |
| `/?utm_source=reddit&utm_medium=social&utm_campaign=launch_2026&utm_term=SECRET_TERM&utm_content=user@example.com&token=FAKE_TOKEN_123` | YES | `1` | `1` | `https://7234d1f6.gta6heistguide.pages.dev/?utm_source=reddit&utm_medium=social&utm_campaign=launch_2026` | `""` | `G10-` / `1` / `1` | **NONE (PASS)** |

---

## 5. Page_View & Affiliate Event Duplication Tests

### Page_View Duplication
- Tested across all Preview routes (Homepage desktop/mobile, `/gaming-gear/` desktop/mobile, `/port-gellhorn`, `/gta-6-money-guide/`, `/heist-command-center/` desktop/mobile, `/privacy-policy.html`, `/affiliates-gear`, `/map`):
  - **Every single page load emitted exactly `1` `gtag/js` load and exactly `1` `en=page_view` `/g/collect` event.**
  - Zero duplicate `page_view` events.

### Affiliate Click Deduplication & D1 Record Verification (`/affiliates-gear`)
- Loaded `https://7234d1f6.gta6heistguide.pages.dev/affiliates-gear?email=test@example.com&token=FAKE_TOKEN_123&fbclid=FAKE_CLICK_ID` with referrer `https://external-referrer.example/deals?token=REF_TOKEN_999&email=ref@example.com`, clicked live `a[data-aff-partner="exitlag"]`, and waited 6 seconds for GA4 batch flush:
  - `page_view` count: **`1`** (`dl = https://7234d1f6.gta6heistguide.pages.dev/affiliates-gear`, `dr = https://external-referrer.example/deals`)
  - `affiliate_click` count: **`1`** (`dl = https://7234d1f6.gta6heistguide.pages.dev/affiliates-gear`, `dr = https://external-referrer.example/deals`)
  - GA4 automatic `click` count: **`0`**
  - `outbound_click` count: **`0`**
  - `POST /api/clicks` (D1) count: **`1`** (`{"partner":"exitlag","placement":"sitewide","page_path":"/affiliates-gear","target_url":"https://www.exitlag.com/refer/10386953"}`)
  - Custom event parameters sent to GA4: `ep.page_category=gaming_gear`, `ep.merchant=exitlag`, `ep.destination_category=exitlag`, `ep.product_category=network_tool`, `ep.product_id=exitlag`, `ep.placement=sitewide`, `ep.source_page=/affiliates-gear`, `ep.interaction_type=outbound_click` (zero PII, zero `target_url`, zero query params).

---

## 6. Privacy Opt-Out & Automated Regression Suite Results

### Browser Opt-Out Verification (Preview)
| Control | `gtag/js` Requests | `/g/collect` Requests | Result |
|---|---|---|---|
| **Do Not Track (`navigator.doNotTrack === '1'`)** | `0` | `0` | **PASS** |
| **Global Privacy Control (`navigator.globalPrivacyControl === true`)** | `0` | `0` | **PASS** |
| **Privacy Policy Opt-Out (`localStorage` persisted)** | `0` | `0` | **PASS** |
| **Admin Route (`/cd-admin/affiliate-dashboard.html`)** | `0` | `0` | **PASS** (Fail-closed HTTP `503` on Preview without Access env; Edge Access `302` on Production) |

### Automated Regression & Audit Suites (Commit `1b0d75e`)
| Suite | Result | Details |
|---|---|---|
| `node --check` (`site-config.js`, `main.js`, `affiliates.js`) | **PASS (3/3)** | Zero syntax errors |
| `tests/phase36-analytics-dashboard.test.mjs` | **PASS (10/10)** | Existing 6 tests + 4 new Phase 36.3 tests (`P36.3-URL1`, `P36.3-UTM1`, `P36.3-ORDER1`, `P36.3-PII1`) |
| `tests/affiliate-analytics-security.test.mjs` | **PASS (8/8)** | `SEC-A` through `SEC-J` |
| `tests/affiliate-click-deduplication.test.mjs` | **PASS (8/8)** | `A1` through `F` |
| `tests/community-discoveries.test.mjs` | **PASS (81/81)** | All security, moderation, Turnstile, and Access JWT checks |
| `scripts/phase33_product_audit.py` | **PASS (18/18)** | 98 pages, 114 links, 0 dead ASINs, 0 violations |
| `scripts/audit_adsense_verification.py` | **PASS (571/571)** | `ca-pub-9556158063903839`, 0 duplicates, Impact.com intact |
| `npx wrangler pages functions build` | **PASS** | Compiled Worker successfully |

---

## 7. Desktop / Mobile QA & Preservation Checks (Preview)

| Route & Viewport | HTTP | `overflowX` | Page Errors | Amazon Placements Disabled (`0` cards) | AdSense / Impact Preservation |
|---|---|---|---|---|---|
| `/` Desktop (`1440x900`) | `200` | `false` | `0` | PASS (`enableAmazonProductPlacements: false`, `0` cards) | AdSense meta: `true`, Impact meta: `true` |
| `/` Mobile (`390x844`) | `200` | `false` | `0` | PASS (`0` cards) | AdSense meta: `true`, Impact meta: `true` |
| `/gaming-gear/` Desktop (`1440x900`) | `200` | `false` | `0` | PASS (`0` cards) | AdSense meta: `true` |
| `/gaming-gear/` Mobile (`390x844`) | `200` | `false` | `0` | PASS (`0` cards) | AdSense meta: `true` |
| `/port-gellhorn` Desktop (`1440x900`) | `200` | `false` | `0` | PASS (`0` cards) | AdSense meta: `true` |
| `/gta-6-money-guide/` Desktop (`1440x900`) | `200` | `false` | `0` | PASS (`0` cards) | AdSense meta: `true` |
| `/heist-command-center/` Desktop (`1440x900`) & Mobile (`390x844`) | `200` | `false` | `0` | PASS (`0` cards) | AdSense meta: `true` |
| `/privacy-policy.html` Desktop (`1440x900`) | `200` | `false` | `0` | PASS (`0` cards) | AdSense meta: `true` |
| `/ads.txt` | `200` | — | — | — | `google.com, pub-9556158063903839, DIRECT, f08c47fec0942fa0` intact |

---

## 8. Preview URL & Deployment Metadata

- **Preview URL:** `https://7234d1f6.gta6heistguide.pages.dev`
- **Branch Alias URL:** `https://phase-36-3-ga4-url-privacy.gta6heistguide.pages.dev`
- **Deployment ID:** `7234d1f6-b47e-452c-9166-bf58fd862f73`
- **Environment:** `Preview` (Branch: `phase-36-3-ga4-url-privacy`, Commit: `1b0d75e`)
- **Cloudflare Dashboard Build:** `https://dash.cloudflare.com/9840f253689c06964ded96c068445e05/pages/view/gta6heistguide/7234d1f6-b47e-452c-9166-bf58fd862f73`
- **Production Status:** Untouched (`ff088f17-c245-4ab8-9aed-fbf1c925a1d1`, `main` / `origin/main` remain at `a5f0245`).

---

## 9. Remaining Issues & Owner-Decision Items

1. **GA4 Enhanced Measurement "Site search" (`view_search_results` on `?q=` URLs — Account-Level Setting):**
   - On `/map?token=FAKE_TOKEN_123&q=FAKE_QUERY_VALUE`, `dl` and `dr` on `page_view` and `search_interaction` were 100% clean (`https://7234d1f6.gta6heistguide.pages.dev/map`, zero `FAKE_TOKEN_123`, zero `FAKE_QUERY_VALUE` in `dl`, `dr`, or `search_interaction`).
   - However, because GA4 Data Stream `16417865148` currently has Enhanced Measurement **Site search: ON** (an account-level setting that Phase 36.3 strictly prohibits changing without owner authorization), `gtag.js` independently inspects `window.location.search` for standard search query keys (`q`, `s`, `search`, `query`, `keyword`) and emits an automatic `view_search_results` event containing `ep.search_term=FAKE_QUERY_VALUE`.
   - **Recommended next step (requires owner approval):** Disable **Site search** in GA4 Admin → Data Streams → GTA6HeistGuide → Enhanced Measurement (just as **Outbound clicks** was disabled in Phase 36.2). The site's custom `search_interaction` event already tracks search surface usage without transmitting user search terms.
2. **Preview Environment Secrets (`503` on `/cd-admin/*` & `turnstileMisconfigured: true`):**
   - Expected on isolated `*.pages.dev` Preview branches because Cloudflare Pages Preview does not expose Production Access/Turnstile secrets; both endpoints fail closed as designed (`503` on `/cd-admin/*`, `submissionsOpen: false` on `/api/community-discoveries/config`).
3. **Cloudflare Insights RUM CORS console message on `*.pages.dev`:**
   - Standard Cloudflare Pages Preview artifact (`cloudflareinsights.com/cdn-cgi/rum` is scoped to the production hostname `www.gta6heistguide.com`), not a first-party error (`0` page errors).
