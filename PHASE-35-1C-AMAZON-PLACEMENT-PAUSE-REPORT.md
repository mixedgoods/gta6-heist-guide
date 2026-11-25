# PHASE 35.1C — AMAZON ADVERTISING PAUSE & HOMEPAGE MOBILE REDESIGN REPORT

- **Date:** 2026-11-25
- **Branch:** `phase-35-1c-amazon-placement-pause` (isolated worktree at `C:\Users\Shawn\.gemini\antigravity\scratch\phase-35-1c-amazon-placement-pause`)
- **Verified Base Commit (Phase 35.1B.1):** `d0ac040` (`docs(phase-35.1b.1): add final security readiness report and Preview verification`, built directly on `f86c77a` -> `87f1f25` -> `9e27574` -> `6055358` -> `e07b5c1` -> `fb5491e` -> `8634d5e`)
- **Phase 35.1C Implementation Commits:** `4b8f8ab`, `04d44ee`
- **Production Baseline (Untouched):** `8634d5e` (`https://www.gta6heistguide.com`)
- **Fresh Preview Deployment ID:** `47880d36`
- **Fresh Preview URL:** `https://47880d36.gta6heistguide.pages.dev`
- **Preview Branch Alias:** `https://phase-35-1c-amazon-placement.gta6heistguide.pages.dev`
- **Production / Safety Status:** **NOT merged into `main`, NOT pushed to `origin/main`, NOT deployed to production. Cloudflare production secrets and Dynadot DNS untouched. Original Desktop working tree (`C:\Users\Shawn\Desktop\gta6heistguide`) untouched with all 67 pre-existing uncommitted items preserved.**

---

## 0. Git History & Commit Discrepancy Resolution

Inspection of actual Git history on `phase-35-1b-affiliate-security` confirmed:
- `d0ac040` is the verified HEAD / release commit of `phase-35-1b-affiliate-security` (`docs(phase-35.1b.1): add final security readiness report and Preview verification`).
- `f86c77a` is its immediate parent (`security(phase-35.1b.1): retire ADMIN_KEY by unifying contact and subscriber admin reads under Cloudflare Access`).
- Ancestry cleanly includes:
  - Phase 35 organic SEO improvements (`fb5491e`)
  - Phase 35.1A affiliate click deduplication (`e07b5c1`, `6055358`)
  - Phase 35.1B affiliate analytics security hardening (`9e27574`, `87f1f25`)
  - Phase 35.1B.1 `ADMIN_KEY` retirement & unified Cloudflare Access admin endpoints (`f86c77a`, `d0ac040`)
  - Production baseline `main` / `origin/main` (`8634d5e`)

The new isolated branch `phase-35-1c-amazon-placement-pause` was created directly from `d0ac040`.

---

## 1. Exact Number of Amazon Product Placements Discovered

A complete audit of all **579 HTML documents** and all JavaScript rendering modules in `public/` identified **110 commercial Amazon product placements** across **5 rendering mechanisms**:

| Category | Count Discovered | Scope |
|---|---:|---|
| Dynamic `[data-aff-slot]` containers | **39** | 24 HTML pages (including `/index.html`, `/gaming-gear/index.html` [8 slots], `/vehicles.html`, `/weapons.html`, `/properties.html`, `/heist-command-center/index.html`, `/radio.html`, `/weapons-bonuses.html`, `/missions/index.html`, `/gta-6-*` hubs, and 8 `/heists/*.html` guides) |
| Legacy `.syndicate-aff-bar` bars (upgraded dynamically to Amazon cards) | **14** | 12 HTML pages (`cheats.html` [2], `drops.html`, `free/index.html`, `giveaways.html`, `gta-6-discoveries/index.html`, `gta-6-glitches/index.html`, `gta-6-settings/index.html`, `heist-payout-calculator.html`, `leonida-wanted-system.html`, `live-intel.html` [2], `save-planner/index.html`, `secrets.html`) |
| Static commercial Amazon product cards / promotional button modules | **54** | 15 HTML pages: `/index.html` (`#officialDealsBox`, 4 static cards), `/affiliates-gear.html` (3 `.aff-card` modules), `/gta-6-settings/index.html` (14 `.hw-actions` Amazon buttons), `/gameplay-mechanics.html` (3 `.tool-box` cards), `/heist-payout-calculator.html` (3 `.tool-box` cards + 1 SSD strip), `/drops.html` (5 promo cards/buttons), `/giveaways.html` (5 promo cards/buttons), `/secrets.html` (4 ad cards), `/cheats.html` (2 promo cards in `.even-promo-grid`), `/live.html` (1 `.prime-twitch-card`), `/free/index.html` (2), `/cloud-mirrors/index.html` (2), `/cloud-mirrors/heist-payout-calculator.html` (2), `/calculator.html` (1), `/articles/leaked-leonida-collectors-map-lummox-pelican-valley-key-lento.html` (2) |
| Dynamic JS hardware / deal renderers (`world-db-engine.js`, `main.js`) | **2** | `public/assets/js/world-db-engine.js` (`getAffiliateStripHtml()` fallback card) and `public/assets/main.js` (`dealSpotlightGrid` Amazon deal cards) |
| Inline JS dynamic Amazon CTA injection | **1** | `public/secrets.html` (`🎧 Audio Clues →` injected into 12 rendered secret cards) |
| **Total Commercial Amazon Placements Discovered** | **110** | Across **42 HTML files** + **4 JS modules** |

---

## 2. Number of Placements Disabled

- **Disabled:** **110 / 110 (100%)** of all commercial Amazon product cards, dynamic slots, legacy affiliate bars, and promotional modules.
- **Visible Amazon-sponsored product cards remaining on the public site:** **0**.
- **Empty advertising containers remaining:** **0** (all slots and suppressed modules carry `hidden` + CSS `display: none !important` + runtime suppression in `affiliates.js`).
- **Promotional gear image downloads on `/` and `/gaming-gear/`:** **0** (`0` requests to `/assets/gear-photos/*` or `/assets/gear-illustrations/*`).
- **Preserved Underlying Infrastructure:**
  - All 18 verified Amazon ASINs in `public/site-config.js` and `public/js/affiliates.js` preserved.
  - Amazon Associates tracking tag (`gta6heistguid-20`) and URL generation preserved.
  - All licensed product photography (`/assets/gear-photos/*`), Wikimedia creator credits, Creative Commons / CC0 metadata (`/data/gear-product-images.json`), and compatibility metadata preserved.
  - Phase 35.1A affiliate click deduplication and multi-merchant architecture preserved.

---

## 3. Pages Affected

**42 HTML documents**, **4 JavaScript files**, and **1 CSS stylesheet** were updated:
- **Core JS / CSS:** `public/site-config.js`, `public/js/affiliates.js`, `public/assets/js/world-db-engine.js`, `public/assets/main.js`, `public/assets/style.css`
- **Homepage & Gear Hub:** `public/index.html`, `public/gaming-gear/index.html`, `public/affiliates-gear.html`
- **World Database & Core Tools:** `public/vehicles.html`, `public/weapons.html`, `public/weapons-bonuses.html`, `public/properties.html`, `public/radio.html`, `public/heist-command-center/index.html`, `public/heist-payout-calculator.html`, `public/calculator.html`, `public/save-planner/index.html`, `public/cheats.html`, `public/secrets.html`, `public/live.html`, `public/live-intel.html`, `public/leonida-wanted-system.html`, `public/gameplay-mechanics.html`, `public/drops.html`, `public/giveaways.html`, `public/free/index.html`
- **Flagship Gaming Hubs:** `public/gta-6-collectibles/index.html`, `public/gta-6-controls/index.html`, `public/gta-6-discoveries/index.html`, `public/gta-6-glitches/index.html`, `public/gta-6-money-guide/index.html`, `public/gta-6-settings/index.html`, `public/gta-6-tips-and-tricks/index.html`, `public/gta-6-tools/index.html`, `public/gta-6-troubleshooting/index.html`, `public/gta-6-vehicles-guide/index.html`, `public/missions/index.html`
- **Heist Walkthroughs & Articles/Mirrors:** 8 files under `public/heists/*.html`, `public/articles/leaked-leonida-collectors-map-lummox-pelican-valley-key-lento.html`, `public/cloud-mirrors/index.html`, `public/cloud-mirrors/heist-payout-calculator.html`

---

## 4. Remaining Contextual Affiliate Links Audit

All **60 remaining visible Amazon text links** across the site are non-card contextual text references (zero product cards, zero promotional image boxes), and all carry `tag=gta6heistguid-20`, `rel="sponsored nofollow noopener"`, and active affiliate disclosures on their respective pages:

| Page Group / URL | Count | Product / Reference | Classification | Disclosure Status |
|---|---:|---|---|---|
| `/cheats.html` | 1 | `120Hz HDMI 2.1 VRR monitor` (inside `<ol.glitch-steps>` display setup step) | Genuine inline editorial reference | Required & preserved |
| `/articles/protecting-gta-6-online-heist-lobby-ip-sniffing-texture-pop-in.html` | 2 | `Samsung 990 PRO 2TB PCIe 4.0 M.2 NVMe SSD` (1 inline troubleshooting body reference + 1 bottom partner text line) | Contextual editorial / text partner reference | Required & preserved |
| `/articles/*.html` (3 other articles: `how-to-clip-auto-edit-916-vertical-gta-6-heist-highlights-offline.html`, `solo-vs-4-player-co-op-heist-splits-gta-6-loot-weight.html`, plus the above) | 2 | `Samsung 990 PRO Gen4 SSD` (1-line text partner strip alongside ExitLag & G2A) | Contextual text partner link (non-card) | Required & preserved |
| `/guides/*.html` (16 guides including `/guides/index.html`, `1715-fleet-treasures...`, `6-star-police...`, `ambrosia-gold-reserve...`, `vice-city-vaults...`, etc.) | 16 | `Samsung 990 PRO Gen4 NVMe SSD` (1-line text partner strip alongside ExitLag & G2A) | Contextual text partner link (non-card) | Required & preserved |
| `/compare/*.html` (39 comparison pages including `/compare/index.html`, `ps5-pro-vs-pc...`, `sinfrontera-bank-vs...`, etc.) | 39 | `Samsung 990 PRO Gen4 NVMe SSD` (1-line text partner strip alongside ExitLag & G2A) | Contextual text partner link (non-card) | Required & preserved |

### Disclosure Accuracy Updates
- **`/index.html`:** Removed the inaccurate footer claim `"As an Amazon Associate I earn from qualifying purchases. Tracking ID: gta6heistguid-20."` because zero Amazon links remain visible on the homepage. Replaced with an accurate Editorial & Legal Notice.
- **`/gaming-gear/index.html`:** Replaced the hero and footer active Amazon Associate disclosure banners with an accurate **Editorial Buying Guide Notice** explaining that Amazon product cards are paused while hardware compatibility tables and editorial guidance remain active.

---

## 5. Centralized Feature-Switch Implementation

- **Configuration flag:** `window.SITE_CONFIG.enableAmazonProductPlacements: false` in `public/site-config.js` (disabled by default; fail-closed unless strictly `=== true`).
- **Source-level rendering control:**
  - `public/js/affiliates.js` (`v8.2-phase35.1c`):
    - `isAmazonProductPlacementsEnabled()` strictly checks `Boolean(global.SITE_CONFIG && global.SITE_CONFIG.enableAmazonProductPlacements === true)`.
    - `selectOffers()` excludes all `partner === 'amazon'` items and skips the Amazon fallback list when disabled.
    - `renderCardHtml()` returns `''` for any Amazon offer when disabled.
    - `mountAllSlots()` suppresses `[data-aff-slot]`, `[data-amazon-placement-module="1"]`, and `.syndicate-aff-bar` elements cleanly with `hidden = true` and `display = 'none'` when disabled, and cleanly restores them if ever re-enabled.
    - `getDatabaseHardwareCardHtml()` and `getSyndicateAffBarHtml()` return `''` when disabled.
  - `public/assets/js/world-db-engine.js`: `getAffiliateStripHtml()` returns `''` when `enableAmazonProductPlacements !== true`.
  - `public/assets/main.js`: `dealSpotlightGrid.init()` filters out Amazon deals and hides `#dealSpotlightGrid` when disabled.
  - `public/secrets.html`: Dynamic `🎧 Audio Clues →` card link gated by `window.SITE_CONFIG && window.SITE_CONFIG.enableAmazonProductPlacements === true`.
  - `public/assets/style.css`: `[data-amazon-placement-module="1"][hidden], [data-aff-slot][hidden], .syndicate-aff-bar[hidden] { display: none !important; }` prevents any pre-JS flash or empty margin spacing.

---

## 6. Homepage Mobile Hero Banner Before-and-After

- **Before (`c925d027`):** Oversized green-bordered pill banner (`.home-hero-kicker`) above the H1 reading `FREE GTA VI RESOURCE • UPDATED 2026-11-21 • NO LOGIN REQUIRED` (dynamically overwritten from `/data/discoveries.json`). On 390px and 360px mobile viewports, it wrapped awkwardly onto two lines inside a heavy oval pill, pushing the main title down and competing with the hero headline.
- **After (`47880d36`):**
  - Removed `.home-hero-kicker` above the H1 and removed the dynamic `#homeDataUpdatedBadge` (`UPDATED 2026-11-21`) injection from `public/index.html`.
  - Added a compact, restrained `.home-hero-trust` metadata row directly beneath `.home-hero-actions`:
    `● FREE GAMING RESOURCE · NO LOGIN REQUIRED`
  - Uses subtle monospace typography (`0.7rem` desktop / `0.66rem` mobile), zero background box, zero border, restrained spacing, single-line alignment (`17px`–`19px` height across all 5 viewports including `360×800` and `390×844`), zero competition with the H1 title, and zero crowding of the primary CTA buttons.

---

## 7. Future Approved Merchant Compact Product-Card Standard

Added a dedicated, inactive-by-default compact product-card design system in `public/assets/style.css` (`.merchant-card-grid`, `.merchant-card`, `.merchant-card__media`, `.merchant-card__body`, `.merchant-card__meta`, `.merchant-card__title`, `.merchant-card__desc`, `.merchant-card__compat`, `.merchant-card__foot`, `.merchant-card__disclosure`, `.merchant-card__cta`):
- **Compact proportional media:** Bounded `88×88px` desktop (`72×72px` mobile) `object-fit: contain` stage — eliminates giant ad boxes.
- **Responsive layout:** `grid-template-columns: repeat(auto-fit, minmax(260px, 1fr))` with clean horizontal thumbnail + editorial body pairing.
- **Editorial & compliance fields:** Concise description, platform compatibility note, clear inline affiliate disclosure, no invented prices/inventory, and mandatory `rel="sponsored nofollow noopener"` on all merchant CTAs.
- **Activation status:** Inactive. No new merchant has been activated and no Logitech, Razer, Green Man Gaming, Fanatical, or Newegg affiliate URLs were fabricated.

---

## 8. Desktop & Mobile Screenshots & Multi-Viewport QA

All screenshots were captured live from Preview `c925d027` (**BEFORE**) and Preview `47880d36` (**AFTER**) in `verification-screenshots/phase35-1c/`:
- **BEFORE:**
  - `verification-screenshots/phase35-1c/BEFORE_home_desktop_1440x900.png`
  - `verification-screenshots/phase35-1c/BEFORE_home_amazon_cards_1440x900.png`
  - `verification-screenshots/phase35-1c/BEFORE_home_mobile_390x844.png`
  - `verification-screenshots/phase35-1c/BEFORE_gaming_gear_desktop_1440x900.png`
  - `verification-screenshots/phase35-1c/BEFORE_gaming_gear_cards_1440x900.png`
  - `verification-screenshots/phase35-1c/BEFORE_gaming_gear_mobile_390x844.png`
- **AFTER (Live Preview `47880d36`):**
  - `verification-screenshots/phase35-1c/AFTER_home_desktop_1440x900.png`
  - `verification-screenshots/phase35-1c/AFTER_home_desktop_1280x800.png`
  - `verification-screenshots/phase35-1c/AFTER_home_tablet_768x1024.png`
  - `verification-screenshots/phase35-1c/AFTER_home_mobile_390x844.png`
  - `verification-screenshots/phase35-1c/AFTER_home_mobile_360x800.png`
  - `verification-screenshots/phase35-1c/AFTER_gaming_gear_desktop_1440x900.png`
  - `verification-screenshots/phase35-1c/AFTER_gaming_gear_mobile_390x844.png`

### Live Preview Playwright QA Summary (`47880d36`)
- **Final 16-check verification (all 5 viewports on `/`, desktop + mobile on `/gaming-gear/` & `/secrets`, plus `/vehicles`, `/weapons`, `/properties`, `/port-gellhorn`, `/heist-command-center/`, `/animals`, `/map`):** **16/16 PASS** — `0` visible Amazon cards, `0` visible Amazon links, `0` empty slots, `0` broken images (after eager-loading lazy images), `0` horizontal overflow, `0` promotional gear image downloads, `0` JS errors.
- **Full 31-page / 68-check sweep across all 13 flagship hubs, database pages, tools, and community pages:** `0` visible Amazon cards, `0` empty containers, `0` horizontal overflow, `0` JS errors (and the 1 dynamic link discovered on `/secrets` during sweep #1 was fixed in `04d44ee` and re-verified as `0` on `47880d36`).

---

## 9. Affiliate Regression Results

| Suite / Audit | Result | Details |
|---|---|---|
| `node --test tests/affiliate-click-deduplication.test.mjs` | **PASS (8/8)** | All Phase 35.1A deduplication tests intact across script load orders and future merchants |
| `python scripts/phase33_product_audit.py` | **PASS** | `18/18` catalog products PASS, `114` static Amazon links audited, `0` dead ASINs, `0` missing tags, `0` missing `rel="sponsored nofollow noopener"`, `0` forbidden page violations |

---

## 10. Security Regression Results

| Suite / Check | Result | Details |
|---|---|---|
| `node --test tests/affiliate-analytics-security.test.mjs` | **PASS (8/8)** | Verifies `/api/clicks`, `/api/contact`, `/api/subscribe`, `/api/cd-admin/*` RS256 Access JWT verification, and zero `ADMIN_KEY`/`syndicateadmin` references |
| `node --test tests/community-discoveries.test.mjs` | **PASS (81/81)** | All submission, rate-limit, Access auth, moderation, and Phase 29 tests pass |
| Recursive grep for `syndicateadmin` in `public/` & `functions/` | **PASS (0 matches)** | Zero hardcoded credentials |
| `node --check` (12 JS files) | **PASS (12/12)** | Zero syntax errors |
| `npx wrangler pages functions build` | **PASS** | Compiled Worker successfully |
| `node tests/http-smoke.mjs https://47880d36.gta6heistguide.pages.dev` | **18/24 PASS** | All 18 security, Cloudflare Access admin (`/api/cd-admin/*`), legacy block (`HTTP-13`), anonymous click (`HTTP-13B`), and public checks PASS |

### Documented Preview Turnstile / Cloudflare Edge Exceptions (6 Known Exceptions)
On isolated Cloudflare Pages Preview deployments without Preview Turnstile secrets configured, the same 6 expected exceptions occur:
1. `HTTP-06` — Preview runtime reports `turnstileMisconfigured: true`, `submissionsOpen: false` (fail-closed by design).
2. `HTTP-06B` — Missing Turnstile token blocked with `403` by preview same-origin/edge guard.
3. `HTTP-07` — Live submission blocked at preview edge before reaching JSON handler.
4. `HTTP-10` — Validation probe blocked at preview edge (`403`).
5. `HTTP-11` — Oversized body probe blocked at preview edge (`403`).
6. `HTTP-12` — Repeated submission rate-limit probe blocked at preview edge (`403`).

---

## 11. SEO, AdSense & Verification Results

- **`python scripts/audit_adsense_verification.py`:** **PASS** — `571/571` eligible HTML documents pass (`ca-pub-9556158063903839`), `0` duplicate scripts, `0` conflicting publisher IDs, `0` errors.
- **Auto Ads & Display Ad Placements:** Remain disabled.
- **Live `/ads.txt` on `47880d36`:** Intact (`google.com, pub-9556158063903839, DIRECT, f08c47fec0942fa0`).
- **Impact.com Verification Tag:** Intact (`<meta name='impact-site-verification' value='f69da5d8-ba34-4487-a5d9-2985b3e4c47d'>`).
- **Phase 35 Organic SEO Improvements:** Fully preserved in ancestry and live Preview.

---

## 12. Preview URL & Deployment Record

- **Branch:** `phase-35-1c-amazon-placement-pause`
- **Commit SHA (Code + QA Fix):** `04d44ee`
- **Cloudflare Deployment ID:** `47880d36`
- **Preview URL:** `https://47880d36.gta6heistguide.pages.dev`
- **Preview Branch Alias:** `https://phase-35-1c-amazon-placement.gta6heistguide.pages.dev`
- **Build Status:** **SUCCESS** (Worker compiled cleanly, all static assets & Functions deployed)

---

## 13. Remaining Production Prerequisites (Awaiting Owner Review)

1. Owner reviews this report and live Preview `https://47880d36.gta6heistguide.pages.dev` on desktop and mobile.
2. Confirm Cloudflare Zero Trust Access environment variables (`CF_ACCESS_TEAM_DOMAIN`, `CF_ACCESS_AUD`, `CD_ADMIN_EMAILS`) are set on the Production Cloudflare Pages project for `/api/cd-admin/*` (carried forward from Phase 35.1B.1).
3. When authorized by the owner, merge `phase-35-1c-amazon-placement-pause` into `main` from an isolated clean worktree (without touching the Desktop working tree) and push `main` to `origin/main` to promote Phase 35 + 35.1A + 35.1B + 35.1B.1 + 35.1C to production.
4. When alternative merchant partnerships are approved in the future, configure them using the new `.merchant-card` compact design system (or set `enableAmazonProductPlacements: true` in `public/site-config.js` if Amazon placements are ever resumed).
