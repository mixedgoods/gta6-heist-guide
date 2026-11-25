# PHASE 35.1B — AFFILIATE ANALYTICS ACCESS SECURITY HARDENING REPORT

- **Date:** 2026-11-25
- **Branch:** `phase-35-1b-affiliate-security` (isolated worktree at `C:\Users\Shawn\.gemini\antigravity\scratch\phase-35-1b-affiliate-security`)
- **Base Commit:** `6055358` (`phase-35-organic-growth-readiness`, preserving Phase 35 SEO improvements and Phase 35.1A affiliate deduplication `e07b5c1`)
- **Hardening Commit:** `9e27574`
- **Production Baseline (Untouched):** `8634d5e` (`https://www.gta6heistguide.com`)
- **Preview Deployment ID:** `7881d673`
- **Preview URL:** `https://7881d673.gta6heistguide.pages.dev`
- **Preview Branch Alias:** `https://phase-35-1b-affiliate-securi.gta6heistguide.pages.dev`
- **Production Status:** **NOT merged, NOT pushed, NOT deployed to production. Production secrets NOT modified.**

---

## 1. Original Vulnerability & Exact Exposed Functionality

During Phase 35.1A verification on production (`8634d5e`), an access-control vulnerability was confirmed in `functions/api/clicks.js` (line 89):

```js
const adminKey = env?.ADMIN_KEY || "syndicateadmin";
```

Because production had no `ADMIN_KEY` secret configured, `GET /api/clicks?key=syndicateadmin` returned **HTTP 200 OK** to any unauthenticated caller on the internet.

### Exact Data Exposed by the Vulnerable Endpoint
- `totalClicks` — all-time outbound affiliate click count in D1 (`affiliate_clicks`)
- `totalClicks7d` — 7-day rolling outbound affiliate click count
- `byPartner` — all-time click breakdown by affiliate partner (`amazon`, `g2a`, `exitlag`, `gfuel`, `gumroad`, `getapexlocal`, `other`)
- `last7DaysByPartner` — 7-day breakdown by partner
- `recent` — last 20 raw rows from `affiliate_clicks` (`id`, `partner`, `placement`, `page_path`, `target_url`, `created_at`)

### Additional Hardcoded Fallback Findings (`ADMIN_KEY` Audit)
A full codebase audit for `ADMIN_KEY` and `syndicateadmin` uncovered the same hardcoded fallback pattern in three additional locations:
1. `functions/api/contact.js` (line 85): `GET /api/contact?key=syndicateadmin` exposed up to 100 rows from `contact_inquiries` (including **PII**: `name`, `email`, `budget`, `message`).
2. `functions/api/subscribe.js` (line 34): `GET /api/subscribe?list=1&key=syndicateadmin` and `GET /api/subscribe?export=csv&key=syndicateadmin` exposed `subscribers` (including **PII**: `email`, `callsign`, `discord_tag`).
3. `public/syndicate-command.html` (lines 254–255): Publicly embedded `<label>Admin Access Key (Default: syndicateadmin)</label>` and `<input ... value="syndicateadmin"/>` in client HTML.

---

## 2. New Access-Control Design

1. **Public `/api/clicks` restricted strictly to anonymous click ingestion (`POST` / `OPTIONS` only):**
   - `GET /api/clicks` (with or without any `?key=` parameter) now unconditionally returns **HTTP 405 Method Not Allowed** with `Allow: POST, OPTIONS`, `Cache-Control: no-store`, `X-Content-Type-Options: nosniff`, `X-Robots-Tag: noindex, nofollow`, and a generic body `{"ok":false,"error":"Method not allowed."}`.
   - `POST /api/clicks` remains anonymous (supporting `navigator.sendBeacon` and `fetch(..., { keepalive: true })`), enforces a 4 KB max payload guard (`413 Payload Too Large`), validates JSON object shape (`400 Bad Request`), strips dangerous URL schemes (`javascript:`, `vbscript:`, `data:`), normalizes partners against the allowlist, truncates field lengths (`target_url` ≤ 500, `placement` ≤ 80, `page_path` ≤ 200), binds parameters via D1 prepared statements, and returns generic errors on failure without leaking `err.message`.

2. **Privileged affiliate reporting moved behind Cloudflare Access at `/api/cd-admin/affiliate-report`:**
   - Implemented in `functions/api/cd-admin/affiliate-report.js`, sharing D1 query logic via `functions/_lib/affiliate-clicks.js` (non-route helper).
   - Automatically protected by existing `functions/api/cd-admin/_middleware.js` → `functions/_lib/cd-access.js`:
     - Cryptographically verifies the Cloudflare Access **RS256 JWT** (`Cf-Access-Jwt-Assertion`) against `https://${CF_ACCESS_TEAM_DOMAIN}/cdn-cgi/access/certs` JWKS (never trusting client-supplied headers alone).
     - Enforces `CF_ACCESS_AUD`, `iss`, `exp`, `nbf`, and `CD_ADMIN_EMAILS` owner allowlist.
     - **Fails closed (`503`)** if any required Access env var (`CF_ACCESS_TEAM_DOMAIN`, `CF_ACCESS_AUD`, `CD_ADMIN_EMAILS`) is missing.
     - Returns `401` on missing/invalid/forged tokens and `403` for authenticated identities not on `CD_ADMIN_EMAILS`.
     - Serves `Cache-Control: no-store`, `X-Content-Type-Options: nosniff`, and `X-Robots-Tag: noindex, nofollow` with generic error bodies.

3. **Legitimate reporting consumers updated:**
   - `public/assets/main.js` (`GTA6.OwnerDrawer.refreshClicks()`): Calls `/api/cd-admin/affiliate-report` with `credentials: 'same-origin'` (no `?key=` query string).
   - `public/syndicate-command.html` (`loadAffiliateClicks()`): Calls `/api/cd-admin/affiliate-report` with `credentials: 'same-origin'`. Removed `syndicateadmin` from label and input default; changed `#adminKeyInput` to `type="password"` with empty value and `autocomplete="off"`.

4. **`ADMIN_KEY` hardened to fail closed where still legitimately used:**
   - `functions/api/contact.js` (`GET /api/contact`) and `functions/api/subscribe.js` (`GET /api/subscribe?list=1` and `?export=csv`) had their `|| "syndicateadmin"` fallback removed completely.
   - Both now check `const adminKey = String(env?.ADMIN_KEY || "").trim();` and return **HTTP 503** (`Admin access is not configured.`) when `ADMIN_KEY` is absent, and use constant-time byte comparison (`401 Unauthorized.`) on mismatch.
   - Plain `GET /api/subscribe` (without `list=1` or `export=csv`) continues returning the non-PII public subscriber count (`{ ok: true, rawCount, totalSubscribers, regionsMapped: 6 }`).

---

## 3. Files Changed

| File | Action | Purpose |
|---|---|---|
| `functions/_lib/affiliate-clicks.js` | Created | Shared allowlist, payload constants, sanitization, and D1 report query helpers (non-route) |
| `functions/api/cd-admin/affiliate-report.js` | Created | Cloudflare Access-protected owner affiliate analytics endpoint (`GET` only) |
| `functions/api/clicks.js` | Modified | Removed `GET` reporting & `syndicateadmin` fallback; returns `405` on `GET`; hardened `POST` payload/error handling |
| `functions/api/contact.js` | Modified | Removed `syndicateadmin` fallback; fail-closed `503` when `ADMIN_KEY` missing; constant-time key check |
| `functions/api/subscribe.js` | Modified | Removed `syndicateadmin` fallback; fail-closed `503` when `ADMIN_KEY` missing for `list=1`/`export=csv`; preserved public count |
| `public/assets/main.js` | Modified | Updated `GTA6.OwnerDrawer.refreshClicks()` to call `/api/cd-admin/affiliate-report` via same-origin credentials |
| `public/syndicate-command.html` | Modified | Updated `loadAffiliateClicks()` to `/api/cd-admin/affiliate-report`; removed hardcoded `syndicateadmin` label/input default |
| `tests/affiliate-analytics-security.test.mjs` | Created | 8 security regression tests covering SEC-A through SEC-J (handler + Access middleware + RS256 JWT + `ADMIN_KEY` fail-closed) |
| `tests/http-smoke.mjs` | Modified | Added live runtime checks for `/api/cd-admin/affiliate-report`, `GET /api/clicks` (405), and `POST /api/clicks` (200) |
| `seo_reports/phase35-1b/screenshots/syndicate-command-preview.png` | Created | Preview QA visual screenshot evidence |

---

## 4. Before / After Security Test Results

| Request / Scenario | Before (`8634d5e` Production) | After (`7881d673` Preview / Unit Suite) |
|---|---|---|
| `GET /api/clicks?key=syndicateadmin` | **HTTP 200** (exposed click totals + 20 recent rows) | **HTTP 405** (`Method not allowed.`, `Cache-Control: no-store`, `Allow: POST, OPTIONS`) |
| `GET /api/clicks` (no credentials) | HTTP 401 | **HTTP 405** (`Method not allowed.`, no data) |
| `GET /api/clicks?key=random123` | HTTP 401 | **HTTP 405** (`Method not allowed.`, no data) |
| `GET /api/cd-admin/affiliate-report` (unconfigured Preview) | N/A | **HTTP 503** (`Admin access is not configured.`, fail-closed, `Cache-Control: no-store`) |
| `GET /api/cd-admin/affiliate-report?key=syndicateadmin` | N/A | **HTTP 503** (Preview) / **HTTP 401** (Access-configured without valid RS256 JWT) |
| `GET /api/cd-admin/affiliate-report` (valid RS256 Access JWT + allowlisted email) | N/A | **HTTP 200** (verified in `SEC-F` with real RS256 keypair & JWKS verification) |
| `GET /api/cd-admin/affiliate-report` (valid JWT, non-allowlisted email) | N/A | **HTTP 403** (verified in `SEC-E`) |
| `GET /api/contact?key=syndicateadmin` (no `ADMIN_KEY`) | **HTTP 200** (exposed PII inquiries) | **HTTP 503** (`Admin access is not configured.`, fail-closed) |
| `GET /api/subscribe?list=1&key=syndicateadmin` (no `ADMIN_KEY`) | **HTTP 200** (exposed PII subscribers) | **HTTP 503** (`Admin access is not configured.`, fail-closed) |
| `GET /api/subscribe?export=csv&key=syndicateadmin` (no `ADMIN_KEY`) | **HTTP 200** (CSV dump of PII) | **HTTP 503** (`Admin access is not configured.`, fail-closed) |
| `GET /api/subscribe` (public count) | HTTP 200 | **HTTP 200** (`rawCount`, `totalSubscribers`, `regionsMapped`; zero PII) |
| `POST /api/clicks` (anonymous click) | HTTP 200 | **HTTP 200** (`{"ok":true,"partner":"amazon","placement":"phase35_1b_probe"}`) |

---

## 5. Full Regression & Deduplication Results

| Check | Result | Details |
|---|---|---|
| `node --test tests/affiliate-analytics-security.test.mjs` | **PASS (8/8)** | Covers SEC-A, SEC-B, SEC-C, SEC-D, SEC-E, SEC-F, SEC-G/H, SEC-J |
| `node --test tests/affiliate-click-deduplication.test.mjs` | **PASS (8/8)** | All 8 Phase 35.1A deduplication tests pass (homepage both scripts, `/gaming-gear/` `affiliates.js` alone, `main.js` alone, tracking enabled/disabled, Amazon & other merchants, multiple clicks) |
| `node --test tests/community-discoveries.test.mjs` | **PASS (81/81)** | All submission, rate-limit, auth, moderation, and Phase 29 tests pass |
| `python scripts/phase33_product_audit.py` | **PASS** | 18/18 products, 98 pages, 122 Amazon links, 0 dead ASINs, 0 missing tags, 0 `rel` issues |
| `python scripts/audit_adsense_verification.py` | **PASS** | 571/571 eligible HTML docs pass (`ca-pub-9556158063903839`), 8 excluded, 0 errors, Impact tag intact |
| JavaScript syntax (`node --check`) | **PASS (11/11)** | All modified/added Functions, public JS, and test files pass |
| Cloudflare Pages Functions build | **PASS** | `npx wrangler pages functions build` compiled Worker cleanly |
| HTTP Smoke Suite (`tests/http-smoke.mjs` vs Preview, default mode) | **15/21 PASS** | All 15 non-Turnstile checks pass (including new `HTTP-ADM-affiliate-report`, `HTTP-13`, `HTTP-13B`); 6 known Preview Turnstile exceptions documented below |
| HTTP Smoke Suite (`tests/http-smoke.mjs` vs Preview, `--closed` mode) | **14/15 PASS** | `HTTP-06-CLOSED` passes; `HTTP-07-CLOSED` returns `403` because `guardSameOriginJson` rejects `.pages.dev` preview origin before the `503` Turnstile check |

### Six Known Cloudflare Pages Preview Turnstile / Origin Exceptions
These 6 failures in default-mode `tests/http-smoke.mjs` occur solely because Cloudflare Pages Preview does not have Production Turnstile secrets configured and enforces same-origin host allowlisting (`gta6heistguide.com`) on `POST /api/community-discoveries/submit`. They are **not** misrepresented as passes:
1. **`HTTP-06`** — `GET /api/community-discoveries/config` reports `submissionsOpen: false`, `turnstile: null`, `turnstileMisconfigured: true` because Preview lacks `TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET_KEY`.
2. **`HTTP-06B`** — `POST /api/community-discoveries/submit` (missing Turnstile token) returns `403` (same-origin guard rejects `*.pages.dev` origin) instead of `400`.
3. **`HTTP-07`** — Valid submission test returns `403` / non-JSON on Preview due to missing Turnstile secrets and preview origin guard.
4. **`HTTP-10`** — Validation failure & invalid URL test returns `403` on Preview origin before reaching field validation (`400`).
5. **`HTTP-11`** — Oversized body test returns `403` on Preview origin before reaching body-size rejection (`413`).
6. **`HTTP-12`** — Rate-limit probe returns `403,403,403,403,403` on Preview origin before reaching rate limiter (`429`).

---

## 6. Live Cloudflare Preview Browser QA (`https://7881d673.gta6heistguide.pages.dev`)

- **Homepage (`/`):** HTTP 200; 27 images, **0 broken**; AdSense (`ca-pub-9556158063903839`) loaded (HTTP 200) + Impact verification meta tag present; clicking an Amazon affiliate link fired `POST /api/clicks` **exactly once** (HTTP 200); 0 unexpected console errors (only expected Preview-domain `cloudflareinsights.com/cdn-cgi/rum` CORS).
- **Gaming Gear (`/gaming-gear/`):** HTTP 200; 19 images, **0 broken**; affiliate disclosure visible; all 36 Amazon links carry `tag=gta6heistguid-20` and `rel="sponsored nofollow noopener"`; clicking an Amazon link fired `POST /api/clicks` **exactly once** (HTTP 200).
- **Syndicate Command (`/syndicate-command.html`):** HTTP 200; **0** occurrences of `syndicateadmin` in visible text or HTML; `#adminKeyInput` is `type="password"` with empty value; clicking **Refresh Click Counts** calls `GET /api/cd-admin/affiliate-report` (not `/api/clicks`) and fails closed with **HTTP 503** (`Admin access is not configured.`).
- **Ads.txt (`/ads.txt`):** HTTP 200 with `google.com, pub-9556158063903839, DIRECT, f08c47fec0942fa0`.
- **Evidence Screenshot:** `seo_reports/phase35-1b/screenshots/syndicate-command-preview.png`

---

## 7. `ADMIN_KEY` Findings & Remaining Production Prerequisites

1. **Cloudflare Access for `/api/cd-admin/affiliate-report`:**
   - Ensure the Cloudflare Zero Trust Access policy covering `/api/cd-admin/*` (already used for `/api/cd-admin/queue`, `detail`, `action`) is active in Production and that `CF_ACCESS_TEAM_DOMAIN`, `CF_ACCESS_AUD`, and `CD_ADMIN_EMAILS` are configured in Cloudflare Pages Production environment variables.
2. **Owner-Only `ADMIN_KEY` Secret Provisioning (for `/api/contact` and `/api/subscribe` admin reads):**
   - `ADMIN_KEY` is still used by `GET /api/contact?key=...`, `GET /api/subscribe?list=1&key=...`, and `GET /api/subscribe?export=csv&key=...`.
   - With Phase 35.1B, these endpoints **fail closed (`503`)** if `ADMIN_KEY` is unset (closing the unauthenticated PII exposure immediately upon deploy).
   - If the owner wishes to continue using those subscriber/contact admin reads in `syndicate-command.html`, provision a high-entropy random `ADMIN_KEY` secret in **Cloudflare Pages → Settings → Environment Variables (Production, Encrypted)** (or, in a future phase, migrate `/api/contact` and `/api/subscribe` admin reads behind `/api/cd-admin/*` Cloudflare Access and retire `ADMIN_KEY` entirely).

---

## 8. Recommended Production Deployment Procedure (Awaiting Owner Authorization)

1. Owner reviews this report and live Preview (`https://7881d673.gta6heistguide.pages.dev`).
2. Verify Production Cloudflare Pages environment variables (`CF_ACCESS_TEAM_DOMAIN`, `CF_ACCESS_AUD`, `CD_ADMIN_EMAILS`, and optionally a newly generated encrypted `ADMIN_KEY` if subscriber/contact admin reads are needed).
3. Fast-forward/merge `phase-35-1b-affiliate-security` into `main` from an isolated clean worktree (preserving all Desktop working-tree changes untouched).
4. Push `main` to `origin/main` and verify Cloudflare Pages Production deployment.
5. Run post-deploy Production verification:
   - Confirm `GET https://www.gta6heistguide.com/api/clicks?key=syndicateadmin` returns **HTTP 405**.
   - Confirm `GET https://www.gta6heistguide.com/api/cd-admin/affiliate-report` returns **HTTP 401** unauthenticated and **HTTP 200** when signed in through Cloudflare Access.
   - Confirm `POST https://www.gta6heistguide.com/api/clicks` returns **HTTP 200** and homepage / `/gaming-gear/` clicks fire once per click.
