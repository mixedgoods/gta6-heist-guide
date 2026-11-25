# PHASE 26.2 — PRODUCTION UX HOTFIX, ANALYTICS ACTIVATION & AFFILIATE MEASUREMENT REPORT

**Project:** GTA6HeistGuide.com  
**Production Domain:** https://www.gta6heistguide.com  
**Release Date:** 2026-11-24  
**Status:** UX Hotfixes Deployed & Verified on Live Production; Event Adapter Instrumented & Verified; Cloudflare Web Analytics & GA4 Property Activation Pending Account-Owner Credentials/Login

---

## 1. Git Branch & Source Commit

| Field | Verified Value |
|---|---|
| **Working Branch** | `phase-26-2-production-ux-hotfix` |
| **Base Commit (Phase 26)** | `2710418d53d7f497c8ca3179973e084af9b9d9d5` (`2710418` on `phase-26-retention-visual-monetization`) |
| **Phase 26.2 Code Commit** | `60eb2b85834f3597e34a1b778dfabf1af8c4ebd6` (`60eb2b8`) |
| **Stale `main` Branch Status** | Untouched (`60e90d4` — Phase 22). **Not merged, not checked out, not deployed.** |
| **Untracked User Files & Image Libraries** | Preserved intact (all 3 GTA image libraries, Phase 26 reports, contact sheets, manifests, and untracked files preserved). |

---

## 2. Exact Changed Files (Deployed Build `60eb2b8`)

1. `public/assets/style.css` — Removed `:focus-within` visual override on `.nav-dropdown-menu` and scoped CSS hover fallback to `:not([data-nav-ready="true"])` so `.is-open` is the sole authoritative visual state once hydrated.
2. `public/site-config.js` — Fixed desktop `Escape` focus-reopen race, wired `aria-controls` + `data-nav-ready="true"` across all dropdowns, disabled mobile `<1024px` `focusin`/`focusout` accordion auto-collapse, added single reusable privacy-first `window.GTA6Track(eventName, params)` adapter, and added delegated `continue_read` and `guide_related_click` listeners.
3. `public/assets/main.js` — Updated `closeDrawer()` to collapse open mobile dropdowns cleanly on drawer close, added GA4 privacy defaults (`anonymize_ip: true`, `allow_google_signals: false`, `allow_ad_personalization_signals: false`) for future GA4 activation, and wired `affiliate_click` into `initAffiliateTracking()`.
4. `public/map.html` — Implemented dynamic unobstructed viewport calculation (`getUnobstructedMapBounds()`), smart flip-below placement (`.p26-popup-below`) + smooth edge-clearance panning (`positionDesktopPopup()`), synced `popupopen` and `flyToPin` handling, and wired `map_pin_open`, `map_pin_complete`, and `map_search` (no raw query text).
5. `public/assets/js/world-db-engine.js` — Wired `vehicle_compare` event in `openCompareModal()` with `database_type: categoryKey || 'vehicles'`.

---

## 3. Desktop Navigation Escape Fix

- **Root Cause:** Pressing `Escape` in `public/site-config.js` removed `.is-open` and called `btn.focus()`, which triggered two simultaneous defects: (1) CSS `.nav-dropdown:focus-within > .nav-dropdown-menu` in `public/assets/style.css` forced the menu to stay visually open, and (2) `btn.focus()` fired `focusin` on `.nav-dropdown`, reopening the menu.
- **Fix Applied:**
  - Removed `:focus-within` menu-display rules in `public/assets/style.css` and gated CSS `:hover` display to `:not([data-nav-ready="true"])` so `.is-open` is the single source of truth once JS binds.
  - Added a `suppressFocusOpen` guard in `public/site-config.js` when `Escape` returns focus from a menu item to `.nav-dropdown-btn`.
  - Automatically assigned stable menu IDs (`#nav-dropdown-menu-guides`, `#nav-dropdown-menu-tips`, `#nav-dropdown-menu-tools`, `#nav-dropdown-menu-database`) and wired `aria-controls` on every parent button sitewide.
- **Verified Behavior (`1280×800` & `1440×900`):** Hover open, invisible hover bridge, `mouseleave` close, keyboard `focusin` open, `ArrowDown`/`ArrowUp` navigation, `Escape` visual close + focus return to parent button without reopening, second `Escape` idempotency, and `aria-expanded` / `aria-controls` accuracy all **PASS** across `GUIDES`, `TIPS`, `TOOLS`, and `DATABASE`.

---

## 4. Mobile Multi-Dropdown Collapse Fix

- **Root Cause:** When `GUIDES` was expanded inside the mobile drawer and a visitor tapped `TIPS` below it, the browser shifted focus from `GUIDES` to `TIPS` during `pointerdown`/`mousedown`. That fired `focusout` on `GUIDES`, immediately collapsing `GUIDES` (~250px height) **before `mouseup`**, shifting the drawer upward out from under the tap coordinates so the click landed outside `.navbar` and triggered `closeDrawer()`.
- **Fix Applied:**
  - Scoped `.nav-dropdown` `focusin` and `focusout` handlers in `public/site-config.js` to desktop (`window.innerWidth >= 1024`) only. On mobile/tablet (`<1024px`), accordions toggle solely via explicit button `click` (with `e.stopPropagation()`), collapsing the previously open group and expanding the tapped group cleanly without closing the drawer.
  - Updated `closeDrawer()` in `public/assets/main.js` to reset any `.nav-dropdown.is-open` state when the mobile drawer is explicitly closed.
- **Verified Behavior (`390×844`, `360×800`, `768×1024`):** Full transition sequence `GUIDES → TIPS → TOOLS → DATABASE → GUIDES` keeps the mobile drawer open, collapses the prior group (`aria-expanded="false"`), expands the tapped group (`aria-expanded="true"`), and maintains zero horizontal overflow.

---

## 5. Desktop Map Popup Top Clipping Fix (`/map`)

- **Root Cause:** Northern and central pins opened popups exclusively above the marker (`popupAnchor: [0, -24]`, `offset: [0, -6]`), while `map.setMaxBounds(mapBounds)` blocked panning past the northern edge of the Leonida map image. As a result, popups extended above `#leafletMap` and clipped behind the fixed top region filter toolbar (`y = 0..140px`).
- **Fix Applied:**
  - Added `getUnobstructedMapBounds()` in `public/map.html` to dynamically compute the real unobstructed viewport (`safeTop = max(mapRect.top, toolbar.bottom, navbar.bottom) + 12`, `safeBottom`, `safeLeft`, `safeRight`).
  - Added `positionDesktopPopup(marker)` triggered via `popupopen` and `selectPinMarker`: measures the rendered above-marker popup rect; if `bounds.safeTop - initialRect.top > 0` and panning north within `maxBounds` cannot clear the toolbar (or below-space is larger), flips the popup cleanly below the marker (`.p26-popup-below` with `top: 26px !important; bottom: auto !important;` and inverted upward pointer tip); then applies a single smooth `map.panBy` if any edge still needs clearance.
  - Capped desktop `.leaflet-popup-content` `max-height: min(44vh, 330px)` so popups always fit comfortably in the unobstructed map height at `1280×800` and `1440×900`.
- **Verified Behavior (`1280×800` & `1440×900`):** Northernmost (`ammu-mt-kalaga-summit-lodge`), northern (`gar-purch-8`), central (`heist-cartel` / Sinfrontera Bank, `ammu-downtown-vice-financial`), southern (`gar-story-1`), western (`op-port-gellhorn-dock-smuggling`), and eastern (`jewelry-vangelico-vice-beach`) pins all open strictly below `safeTop` (`140px`), inside viewport bounds, with `.is-selected-pin` visible and cleanly cleared on popup close.

---

## 6. Mobile Bottom-Sheet Verification (`/map`)

- **Preserved intact:** Compact `#mobilePinSheet` was preserved without regression.
- **Verified Behavior (`390×844` & `360×800`):**
  - `390×844`: `#mobilePinSheet` opens at `339px` height (`40.2%` of viewport), `0` horizontal overflow on sheet or document, selected pin visible above sheet, `×` close button closes cleanly.
  - `360×800`: `#mobilePinSheet` opens at `352px` height (`44.0%` of viewport), `0` horizontal overflow on sheet or document, selected pin visible above sheet, `×` close button closes cleanly.

---

## 7. Cloudflare Web Analytics Status

- **Classification:** **Not activated because account access or configuration is missing.**
- **Verification Performed:**
  - Inspected `npx wrangler whoami` and `npx wrangler pages --help`: Wrangler CLI does not expose a command to toggle Cloudflare Pages Web Analytics, and the local Wrangler OAuth token does not include `rum:write`.
  - Checked Cloudflare Dashboard (`https://dash.cloudflare.com/9840f253689c06964ded96c068445e05/pages/view/gta6heistguide/metrics`) via the browser subagent: redirected to `https://dash.cloudflare.com/login` ("Sign in to Cloudflare"). No login bypass or credential probing was performed.
  - Confirmed live production HTML does **not** yet contain a `cloudflareinsights.com` beacon.
- **Note on Scope:** Cloudflare Web Analytics provides cookieless page-view, referrer, and Core Web Vitals telemetry only — it does **not** automatically collect the 7 custom interaction events in Section 6 (those are handled by the GA4-ready adapter).

---

## 8. GA4 Configuration Status

- **Classification:** **Not activated because account access or configuration is missing.**
- **Verified State:**
  - `ga4MeasurementId: ""` remains intentionally blank in `public/site-config.js` (no fabricated `G-XXXXXXXX` ID).
  - `window.GTA6Track.isGa4Active()` returns `false` on live production; zero `googletagmanager.com` requests are made until an authorized Measurement ID is supplied.
  - Privacy defaults (`anonymize_ip: true`, `allow_google_signals: false`, `allow_ad_personalization_signals: false`) are pre-configured in `public/assets/main.js` for immediate safe activation once a real `G-` ID is provided.

---

## 9. Event Instrumentation Status

- **Adapter:** Single reusable `window.GTA6Track(eventName, params)` in `public/site-config.js` (non-blocking, `try/catch` guarded, allowlisted event names, strict PII sanitizer, in-memory QA buffer `window.GTA6Track.getEvents()`).
- **All 7 Events Verified in Live Production Browser QA:**

| Event | Trigger Location | Verified Non-Personal Parameters | Live Production QA |
|---|---|---|---|
| `map_pin_open` | `public/map.html` (`selectPinMarker`) | `page_category`, `map_pin_category`, `region`, `interaction_type` | **PASS** |
| `map_search` | `public/map.html` (`handleSearchKeydown` / `selectSearchResult`) | `page_category`, `interaction_type`, `result_count` / `map_pin_category` (never raw query) | **PASS** |
| `map_pin_complete` | `public/map.html` (`togglePinFound`) | `page_category`, `map_pin_category`, `interaction_type` | **PASS** |
| `affiliate_click` | `public/assets/main.js` (`initAffiliateTracking`) | `page_category`, `destination_category`, `product_category`, `product_id`, `placement`, `interaction_type` | **PASS** |
| `vehicle_compare` | `public/assets/js/world-db-engine.js` (`openCompareModal`) | `page_category`, `database_type`, `interaction_type`, `item_count` | **PASS** |
| `guide_related_click` | `public/site-config.js` (delegated listener) | `page_category`, `destination_category`, `interaction_type` | **PASS** |
| `continue_read` | `public/site-config.js` (`#p26ContinueLinks` listener) | `page_category`, `destination_category`, `interaction_type` | **PASS** |

---

## 10. Affiliate-Click Measurement Status

- **Amazon Associates Tag:** `gta6heistguid-20` verified intact across all rendered homepage Amazon links.
- **Verified Replacement ASINs:** `B08FC6Y4VG`, `B0CK39YR41`, `B08DP7Z725` preserved with compliant text-only dark spec cards (no Amazon product images downloaded or rehosted).
- **Compliance Attributes:** `rel="sponsored nofollow noopener"` and `Sponsored · Paid link` / FTC + Amazon Associates disclosures verified intact.
- **Outbound Measurement:** `initAffiliateTracking()` dispatches non-blocking `window.GTA6Track('affiliate_click', ...)` (ready for GA4 once authorized) and preserves non-blocking `navigator.sendBeacon('/api/clicks', ...)` without interfering with Amazon redirects. No revenue or commission claims are made without verified Associates Central reporting.

---

## 11. Privacy & Data Collection Safeguards

- `window.GTA6Track` enforces an explicit event allowlist and strips any parameter key matching `/email|mail|pass|pwd|secret|token|auth|phone|address|query|text|input|body|message|cookie|session|user_?name|full_?name/i` as well as any string containing `@`.
- Automated browser QA confirmed that passing synthetic `email`, `query`, `password`, and `bad_val: 'alice@domain.com'` parameters to `window.GTA6Track` strips all 4 fields while preserving `interaction_type`.
- Zero cookies are set by the adapter; navigation and outbound affiliate clicks are never blocked.

---

## 12. Preview Deployment ID

| Field | Value |
|---|---|
| **Preview Deployment UUID** | `dc0f0dd9-611b-4d56-bafa-d84a800372ca` |
| **Preview URL** | `https://dc0f0dd9.gta6heistguide.pages.dev` |
| **Branch Alias URL** | `https://phase-26-2-production-ux-hot.gta6heistguide.pages.dev` |
| **Source Commit** | `60eb2b8` (`phase-26-2-production-ux-hotfix`) |
| **Preview QA Result** | **PASS (0 failures across all 10 multi-viewport check suites)** |

---

## 13. Production Deployment ID

| Field | Value |
|---|---|
| **Production Deployment UUID** | `601d8776-466d-40a1-ae34-cc3cc921a58d` |
| **Deployment URL** | `https://601d8776.gta6heistguide.pages.dev` |
| **Active Custom Domain** | `https://www.gta6heistguide.com` |
| **Cloudflare Pages Branch Label** | `main` (Direct Upload from local verified `phase-26-2-production-ux-hotfix` commit `60eb2b8`; stale git `main` was NOT used) |
| **Production QA Result** | **PASS (0 failures across all 10 multi-viewport check suites)** |

---

## 14. Browser QA & Test Suite Results

| Verification Suite | Scope | Result |
|---|---|---|
| **Unit & Security Tests** (`node --test tests/community-discoveries.test.mjs`) | 73 tests (validation, XSS, SQLi, CSRF, rate-limit, Access JWT, RBAC, audit, isolation) | **73/73 PASS** |
| **JS Syntax Checks** (`node --check`) | `site-config.js`, `main.js`, `world-db-engine.js` | **PASS (0 errors)** |
| **SEO & Guardrails Audit** (`node scripts/seo-audit.mjs`) | 335 primary HTML pages, 337 JSON-LD blocks, 500 sitemap URLs, 1,160 `<img>` tags, 23,909 internal links | **PASS (0 fatal errors, 0 warnings)** |
| **Local Playwright QA** | Desktop `1280×800` & `1440×900`, Tablet `768×1024`, Mobile `390×844` & `360×800` | **10/10 PASS (0 failures)** |
| **Cloudflare Preview Playwright QA** (`dc0f0dd9`) | Desktop, Tablet, Mobile, Map Popups, Mobile Sheet, 7 Analytics Events + PII + Affiliates | **10/10 PASS (0 failures)** |
| **Live Production Playwright QA** (`www.gta6heistguide.com`) | Desktop, Tablet, Mobile, Map Popups, Mobile Sheet, 7 Analytics Events + PII + Affiliates | **10/10 PASS (0 failures)** |

---

## 15. Remaining Account-Owner Configuration Requirements

1. **Enable Cloudflare Web Analytics (1-minute Dashboard action):**
   - Sign in to https://dash.cloudflare.com → **Workers & Pages** → **gta6heistguide** → **Metrics** → **Web Analytics** → click **Enable Web Analytics**.
   - Re-run one production deploy (`npx wrangler pages deploy public --project-name=gta6heistguide --branch=main` from `phase-26-2-production-ux-hotfix`) so Cloudflare automatically injects the official `cloudflareinsights.com` beacon into served HTML.
   - Verify beacon network request (`200`/`204`) and incoming page-view data in the Cloudflare Web Analytics dashboard.
2. **Optional — Activate GA4 Custom Event Reporting:**
   - Create or select an authorized Google Analytics 4 web data stream for `https://www.gta6heistguide.com`.
   - Paste the real `G-XXXXXXXXXX` Measurement ID into `ga4MeasurementId` in `public/site-config.js` and redeploy.
   - Verify all 7 events (`map_pin_open`, `map_search`, `map_pin_complete`, `affiliate_click`, `vehicle_compare`, `guide_related_click`, `continue_read`) in GA4 **DebugView**.
3. **Git `main` Reconciliation (Pending Owner Approval):**
   - Local/remote `main` remains at Phase 22 (`60e90d4`). Do not deploy from `main` until explicitly reconciled with `phase-26-2-production-ux-hotfix`.

---

## 16. Rollback Reference

- **Immediate Phase 26 Rollback Target:** `63811b6b-1f11-4844-9e48-3f36286e6e6a` (`https://63811b6b.gta6heistguide.pages.dev`, source commit `2710418`).
- **Prior Phase 24 Rollback Target:** `3ec0e6e9-e4aa-40c1-9cc1-9e4d85906fc3` (`https://3ec0e6e9.gta6heistguide.pages.dev`, source commit `f7e949f`).
