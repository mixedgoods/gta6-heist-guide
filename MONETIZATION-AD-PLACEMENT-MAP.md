# GTA6HEISTGUIDE — SITE-WIDE AD PLACEMENT & EXCLUSION MAP (PHASE 48)

**Audit Date:** November 27, 2026  
**Publisher ID:** `ca-pub-9556158063903839` (`pub-9556158063903839`)  
**AdSense Code Coverage Verified:** `571 / 571` eligible HTML pages (`9` excluded; `580` total HTML documents in `public/`)  
**Live `ads.txt` Status:** `Authorized` in AdSense UI (`google.com, pub-9556158063903839, DIRECT, f08c47fec0942fa0`)  
**Current Account State:** Site Approval = **`Getting ready`** | Auto Ads = **`OFF`** | Manual Ad Units = **`0`** | Policy Center = **`No current issues`**

> **Phase 48 Code Hygiene Fix Applied:** Removed 3 stale fabricated placeholder `<div class="adsense-slot" data-ad-slot="...">` elements (`home-mid-bottom` in `public/index.html`, `cheats-mid` and `cheats-bot` in `public/cheats.html`). Zero fabricated `data-ad-slot` attributes remain across all 580 HTML pages (`P48-ADS-02 PASS`).

---

## 1. Full 580-Page Monetization Inventory by Category

Every HTML document under `public/` was programmatically audited and classified into the 10 Phase 48 page categories:

| # | Page Category | HTML Count | AdSense Script | Current Ad Serving | Recommended AdSense Strategy (Post-Approval) | Affiliate Strategy | Policy / UX Guardrails |
|---|---|---:|---|---|---|---|---|
| 1 | **Long-Form Guides** (`/guides/*`, `/articles/*`, `/gta-6-*` hubs, district guides e.g. `/port-gellhorn`, `/escape-routes`, `/gameplay-mechanics`) | **193** | `193/193` | `0` ads (site `Getting ready`, Auto Ads `OFF`) | **PRIMARY DISPLAY REVENUE TIER** — In-page banners at natural section breaks + Multiplex at article end + Desktop side rails (`>=1440px`) + Dismissible mobile anchor | Contextual internal links to `/gaming-gear/` & `/gta-6-settings/` where relevant; preserve existing non-card contextual text links (`Samsung 990 PRO`, `ExitLag`, `G2A`) | Never split numbered steps or safe-code copy boxes; keep >=24px spacing from interactive buttons |
| 2 | **Mission & Heist Walkthroughs** (`/missions/*`, `/heists/*`, `/vice-city-yacht-heist.html`, etc.) | **136** | `136/136` | `0` ads | **PRIMARY DISPLAY REVENUE TIER** — In-page banners between major phases/sections + Multiplex after walkthrough completion + Desktop side rails | Do NOT insert unrelated Amazon hardware cards into mission walkthroughs; keep editorial purity | Never place ads inside step-by-step lists, mission checklist toggles, or spoiler warning buttons |
| 3 | **Databases & Reference Material** (`/vehicles`, `/vehicles/*`, `/weapons`, `/weapons/*`, `/properties`, `/properties/*`, `/animals`, `/animals/*`, `/radio`, `/cheats`, `/secrets`, `/compare/*`, `/locations/*`, etc.) | **212** | `212/212` | `0` ads | **HIGH-VOLUME SECONDARY TIER** — Top-of-editorial-intro or post-filter/below-grid banners + Multiplex at bottom of detail pages; Desktop side rails on detail pages | Contextual audio link on `/radio` → `/gaming-gear/`; preserve cleaned text links on `/compare/*` (note: `/compare/*` & legacy `/guides/*` carry `noindex` — evaluate consolidating or keeping light ad load) | **Avoid:** 1 ad per DB row, ads between every card, ads styled like DB entries, or ads overlapping filter/search bars |
| 4 | **Interactive Tools** (`/heist-payout-calculator`, `/heist-planner`, `/heist-command-center/`, `/gta-6-tools/`, `/live`, `/live-intel`, `/calculator`) | **12** | `12/12` | `0` ads | **RESTRICTED / OUTSIDE WORKSPACE ONLY** — Exclude active calculator inputs, keypad trainers, and live video embeds from in-page Auto Ads; allow at most 1 non-intrusive below-results/editorial placement | Preserve contextual streamer tools on `/live` + cross-link to `/gaming-gear/`; keep paused Amazon cards hidden unless owner opts in | Never overlap calculator sliders, form inputs, copy-to-clipboard buttons, or Twitch/YouTube embeds |
| 5 | **Maps & Trackers** (`/map`, `/my-leonida/`, `/save-planner/`) | **3** | `3/3` | `0` ads | **EXCLUDE FROM AUTO ADS** (`/map`, `/my-leonida/*`, `/save-planner/*` in AdSense *Excluded pages*) | Zero affiliate banners inside map HUD or tracker checkboxes | **Strict Protection:** Zero ads may overlap map markers, zoom controls, search bar, mobile FABs, region jump pills, Leaflet attribution, or save-slot controls |
| 6 | **Gaming Hardware & Product Guides** (`/gaming-gear/`, `/gta-6-settings/`) | **2** | `2/2` | `0` ads | **MODERATE / CAREFULLY SPACED** — Allow editorial-section Auto Ads ONLY with excluded areas on `.amz-card`, `.amz-grid`, and `#leonidaDropMount`; **disable Multiplex** on `/gaming-gear/` so Google recommendation grids are never confused with curated Amazon cards | **PRIMARY AFFILIATE HUBS** — Preserve Phase 47 compact text-only `.amz-card` design (53 cards on `/gaming-gear/` + 14 on `/gta-6-settings/`), Leonida Drop 3-product rotation, exact Amazon Associate disclosures | Never place an AdSense ad adjacent to an Amazon `"View on Amazon →"` button; maintain unmistakable visual distinction |
| 7 | **Commercial Landing Pages** (`/drops`, `/giveaways`, `/free/`, `/affiliates-gear`) | **4** | `4/4` | `0` ads | **LIGHT / EXCLUDE THIN REDIRECTS** — Exclude `/giveaways` (301 redirects to `/drops`) and `noindex` `/affiliates-gear`; allow light non-intrusive display ads on `/drops` and `/free/` outside reward checklists | Preserve Prime trial & approved partner offers; keep Phase 35.1C paused modules hidden | Never disguise ads as giveaway claim buttons or reward links |
| 8 | **Homepage & Main Navigation** (`/index.html`) | **1** | `1/1` | `0` ads | **CONSERVATIVE / BELOW-THE-FOLD ONLY** — Preserve fast LCP and clean mobile hero; exclude hero & top navigation via AdSense Excluded Areas; allow at most 1 mid/lower-page in-page banner below primary navigation cards if Auto Ads Preview confirms zero crowding | **STRICTLY PRESERVE** Phase 35.1C Amazon Placement Pause (`enableAmazonProductPlacements: false` — 0 visible Amazon product cards on `/`) | Protect LCP, mobile menu button, and primary CTA hierarchy |
| 9 | **Community-Related Content** (`/gta-6-discoveries/`, `/community-discoveries/`, `/community-discoveries/submit/`) | **3** | `2/3` (`submit/` excluded) | `0` ads | **EXCLUDE SUBMISSION & THIN QUEUES** — `/community-discoveries/submit/` already excluded from AdSense code; exclude `/community-discoveries/*` until high-volume verified editorial discovery pages are indexed; allow light editorial ads on `/gta-6-discoveries/` below filter controls | No affiliate cards inside community submission or report workflows | Never monetize unmoderated forms, moderation pages, or thin placeholder views |
| 10 | **Legal, Administrative & Utility** (`/about`, `/contact`, `/privacy-policy`, `/terms`, `/acquisitions`, `/404`, `/cd-admin/*`, `/syndicate-command`, `/embed/*`, `/cloud-mirrors/*`, GSC verification files) | **14** | `6/14` (`8` excluded) | `0` ads | **EXCLUDE ALL ADMIN, ERROR, EMBED, FORM & PROSPECTUS ROUTES** — Exclude `/contact`, `/acquisitions`, `/privacy-policy`, `/terms`, `/cloud-mirrors/*` in AdSense *Excluded pages* (in addition to the 9 files already stripped of AdSense script) | Zero commercial product cards; preserve accurate FTC/Amazon/AdSense disclosures | AdSense strictly prohibits ads on 404/error pages, admin panels, login gates, embeds, and low-content utility pages |

---

## 2. Recommended Google AdSense Auto Ads Configuration (For Owner Approval Once Site = `Ready`)

**Do NOT toggle Auto Ads ON until Google updates `gta6heistguide.com` from `Getting ready` to `Ready`.** Once approved, apply this exact balanced configuration inside **AdSense → Ads → By site → `gta6heistguide.com` → Edit**:

| Auto Ads Setting | Recommended Value | Rationale & UX Guardrail |
|---|---|---|
| **Auto Ads Master Switch** | **ON** *(only after `Ready`)* | Eliminates need to maintain hundreds of manual ad units across 571 pages; zero invented `data-ad-slot` IDs. |
| **In-page formats → Banner ads** | **ON** | Primary revenue driver across 329 long-form guides & heist walkthroughs and 212 database pages. |
| **In-page formats → Multiplex ads** | **ON** *(exclude `/gaming-gear/` & `/gta-6-settings/`)* | High-performing end-of-article recommendation grid on walkthroughs & guides; must NOT compete with or mimic `.amz-card` product grids. |
| **Overlay formats → Anchor ads** | **ON (Mobile & Desktop — Dismissible, Bottom preferred)** | Strong viewability on 63.4% mobile traffic; safe because `/map`, `/my-leonida/`, `/save-planner/`, and `/heist-payout-calculator` are in *Excluded pages*. |
| **Overlay formats → Side rail ads** | **ON (Desktop wide viewports only)** | Captures unused margin space on 1440px+ screens (`34.4%` desktop share) without shifting article text. Verify in Preview that sticky nav & dropdowns are never covered. |
| **Overlay formats → Vignette ads** | **ON — Conservative frequency (`10+ minutes` or lowest frequency cap)** | Captures full-screen transition RPM between guide clicks without frustrating multi-page readers. Re-evaluate bounce rate in GA4 after 14 days. |
| **Intent-driven formats (Ad intents / Related search)** | **OFF initially** | Can convert ordinary in-guide entity text/links into ad triggers and confuse players reading safe codes, mission steps, or hardware specs. Test only after inspecting AdSense Preview on live guides. |
| **Ad Load Slider** | **Moderate (~45%–55%)** | Balances meaningful ad visibility (solving the owner's concern) against reading comfort and Core Web Vitals. |
| **Minimum Distance Between In-Page Ads** | **Standard / Wide** | Prevents stacked back-to-back ad blocks on mobile screens. |
| **Optimize Existing Ad Units** | **OFF** | Zero manual ad units exist (`By ad unit` is empty). |

---

## 3. Exact AdSense Excluded Pages & Excluded Areas List

### A. Already Excluded at Code Level (9 HTML Files — Zero AdSense Script, Verified by `audit_adsense_verification.py`)
1. `/404.html` (Error page)
2. `/google29e7fdcf68272179.html` (GSC verification)
3. `/googlec63f7e8032408675.html` (GSC verification)
4. `/cd-admin/index.html` (Protected admin console)
5. `/cd-admin/affiliate-dashboard.html` (Protected admin dashboard)
6. `/syndicate-command.html` (Internal owner console)
7. `/community-discoveries/submit/index.html` (Submission form)
8. `/embed/calculator.html` (Embeddable iframe widget)
9. `/embed/clock.html` (Embeddable iframe widget)

### B. Recommended AdSense UI *Excluded Pages* (Configure in Auto Ads → Page Exclusions)
Add these exact URL paths/patterns in AdSense Auto Ads *Excluded pages* before clicking **Apply to site**:
- `https://www.gta6heistguide.com/map` (and `/interactive-map`) — Interactive Leaflet map with markers, zoom controls, region pills, and mobile FABs.
- `https://www.gta6heistguide.com/my-leonida/*` — Interactive personal completion dashboard.
- `https://www.gta6heistguide.com/save-planner/*` — Interactive 15-slot save manager.
- `https://www.gta6heistguide.com/heist-payout-calculator` (and `/calculator`) — Interactive calculator workspace.
- `https://www.gta6heistguide.com/heist-planner` — Interactive squad planner workspace.
- `https://www.gta6heistguide.com/contact` — Support/DMCA/sponsorship contact form.
- `https://www.gta6heistguide.com/acquisitions` — Sponsorship & Media Kit prospectus.
- `https://www.gta6heistguide.com/privacy-policy` — Legal/opt-out control page.
- `https://www.gta6heistguide.com/terms` — Legal/DMCA terms page.
- `https://www.gta6heistguide.com/cloud-mirrors/*` — Utility mirror pages (`noindex`).
- `https://www.gta6heistguide.com/giveaways` — 301 redirect route.
- `https://www.gta6heistguide.com/affiliates-gear` — `noindex` legacy gear route.
- `https://www.gta6heistguide.com/community-discoveries/*` — Dynamic community queue/forms (keep `/gta-6-discoveries/` editorial hub eligible).

### C. Recommended AdSense UI *Excluded Areas* (Configure in Auto Ads Preview)
Use the visual **Excluded areas** tool in AdSense Preview to click-exclude:
1. Top countdown strip (`#siteTopStrip`) and primary navigation bar (`#siteNavbar`) on all pages.
2. Homepage hero section and primary CTA button cluster on `/`.
3. `#leonidaDropMount` and `.amz-grid` card grids on `/gaming-gear/` and `/gta-6-settings/` (keeping display ads separated from Amazon `"View on Amazon →"` buttons).

---

## 4. AdSense Policy & UX Compliance Checklist

- [x] **No fabricated ad slots:** All 3 legacy non-numeric `data-ad-slot` placeholders removed (`P48-ADS-02 PASS`).
- [x] **Single publisher script per eligible page:** Verified `571/571` (`0` duplicates, `0` conflicting IDs).
- [x] **Valid `ads.txt`:** `Authorized` in Google AdSense UI (`google.com, pub-9556158063903839, DIRECT, f08c47fec0942fa0`).
- [x] **Visual distinction:** AdSense ads look like Google ads; `.amz-card` items carry `"Paid link"` badges and `"Paid Amazon link"` footers; normal site buttons remain distinct.
- [x] **Zero artificial clicks/impressions:** Playwright QA aborts third-party ad requests and never clicks any ads.
- [x] **Consent & privacy preserved:** GA4 Consent Mode v2 (`ad_storage: 'denied'`), GPC/DNT respect, and `/privacy-policy` opt-out control remain 100% intact.
