# PHASE 29 — LEONIDA COMMUNITY INTELLIGENCE NETWORK REPORT

**Project:** GTA6HeistGuide.com  
**Production Domain:** https://www.gta6heistguide.com  
**Branch:** `phase-29-community-intelligence`  
**Base Commit (Phase 28 Final Report):** `479eef7` (`phase-28-my-leonida`, implementation `2894649`)  
**Phase 29 Implementation Commits:** `4676177`, `e089aa1`  
**Release Date:** 2026-11-24  
**Status:** Implemented, Verified Locally (81/81 Tests + SEO Audit), Verified on Cloudflare Preview, Deployed & Verified on Live Production

---

## 1. Existing Infrastructure Audited

Before making any changes, the entire repository, Git history, Cloudflare Pages deployment list, and remote D1 database were audited:

- **Git & Branch Provenance:** Verified HEAD at `479eef7` on `phase-28-my-leonida` (`2894649` Phase 28 implementation). Stale `main` was never checked out, merged, or deployed. All untracked files, reports, scripts, and all three GTA image libraries (`GTA6-ROCKSTAR-HIGH-QUALITY-LIBRARY`, `GTA6_APPROVED_IMAGE_LIBRARY`, `public/assets/images/`) were preserved 100% intact.
- **Production Deployment Verified:** Confirmed previous live production deployment `f1245183-51c5-4d79-bfe2-6afe972e2d95` (Phase 28 beacon-enabled release).
- **Existing D1 Database (`gta6heistguide-db`, `31866186-7d51-4c36-a749-3822ac05bad7`):** Audited all 8 existing `cd_*` tables from `migrations/0001_community_discoveries.sql` (`cd_submissions` with 2 rows, `cd_evidence`, `cd_sources`, `cd_relations`, `cd_decisions`, `cd_published` with 0 published rows, `cd_audit`, `cd_rate_limit`), including the immutability trigger `trg_cd_sub_immutable` and append-only audit/decision triggers. Zero duplicate databases or duplicate submission endpoints were created.
- **Existing Security & Routes Audited:** Audited `/community-discoveries/`, `/community-discoveries/submit/`, `/cd-admin/`, `/api/community-discoveries/{config,list,map-pins,submit}`, `/api/cd-admin/{_middleware,queue,detail,action}`, `functions/cd-admin/_middleware.js`, Cloudflare Access RS256 JWT verification (`functions/_lib/cd-access.js`), Turnstile verification, and D1-backed rate limiting (`functions/_lib/cd.js`).

---

## 2. Submission Workflow

- **Route:** `/community-discoveries/submit/` (`public/community-discoveries/submit/index.html`, `public/assets/community/cd-submit.js`, `functions/api/community-discoveries/submit.js`).
- **Expanded Allowlisted Categories (14 total):** Added `secret_area` ("Secret areas"), `safe_code` ("Safe codes"), and `glitch` ("Glitches") alongside all 11 existing categories (`hidden_location`, `rare_vehicle`, `wildlife`, `weapons_equipment`, `collectible`, `mission_tip`, `easter_egg`, `side_activity`, `money_method`, `map_correction`, `general`).
- **Quick & Complete Capture:** Preserved the low-friction 4-field quick submission (Title, Category, Description/Location/Instructions, Permission & Originality confirmation) with expandable optional details (Region, Platform, Game Version, Date Discovered, Exact Location, Directions, Map X/Y 0–1 coordinates, Personally Witnessed, Supporting Evidence, Sources, Screenshot/Video HTTPS URLs with media-rights confirmation, Optional Public Handle, Optional Private Contact Email).
- **Server-Side Authority:** Every field, allowlist, length cap, coordinate range, date bound, media-rights check, URL policy, script/HTML check, duplicate hash, Turnstile token, and rate limit is strictly validated server-side.

---

## 3. Evidence Standards

Implemented explicit Phase 29 evidence classifications in `functions/_lib/cd.js`, `functions/api/cd-admin/action.js`, `public/community-discoveries/index.html`, and `public/assets/community/cd-admin.js`:

| Internal Code | Public / Moderator Label | Publicly Visible? | Requirements |
|---|---|---|---|
| `PENDING_REVIEW` | **Awaiting Review** | Never | Default state for all new submissions |
| `NEEDS_MORE_EVIDENCE` | **Needs More Evidence** | Never | Moderator note describing missing evidence |
| `COMMUNITY_REPORTED` | **Community Reported** | Only if published | Explicitly labelled as not independently verified by GTA6HeistGuide |
| `CORROBORATED` | **Corroborated** | Only if published | Written basis (>=20 chars) + independent confirmation link or external evidence ack |
| `INDEPENDENTLY_VERIFIED` | **Verified in Gameplay** | Only if published | Explicit `confirm_verified: true` + reproduction note (>=20 chars) |
| `OFFICIALLY_CONFIRMED` | **Officially Confirmed** | Only if published | Explicit `confirm_official: true` + validated `https://` `authoritative_source_url` + `authoritative_source_label` (5–100 chars) + note (>=20 chars) |
| `REJECTED` | **Rejected** | Never | Mandatory rejection reason; auto-unpublishes & removes map pin if previously published |

- **Recorded Metadata:** Submission timestamp (`cd_submissions.created_at`), game version, platform, evidence source summary, verification notes, authoritative source URL/label, and moderation timestamp/actor (`cd_verification_meta.moderated_at`, `moderated_by`).
- **No Fabricated Evidence:** Zero discoveries, screenshots, or verification claims were invented.

---

## 4. Moderation Controls

- **Authorization Preserved:** Built directly on existing Cloudflare Access RS256 JWT verification (`functions/cd-admin/_middleware.js` + `functions/api/cd-admin/_middleware.js` + `CD_ADMIN_EMAILS` allowlist). Fails closed (401/403/503) when unauthenticated or unconfigured; live production edge redirects `/cd-admin/` with HTTP 302 to Cloudflare Access.
- **Moderation Actions:** Approve (`approve_report`), Reject (`reject`), Request additional evidence (`request_evidence`), Flag duplicate (`flag_duplicate`), Edit editorial presentation without mutating original submission (`edit_published`, now also supporting `featured`, `related_db_records`, and `evidence_source_summary`), Change verification status (`set_status` including `OFFICIALLY_CONFIRMED`), Publish / Unpublish, and Approve / Remove Map Pin.
- **Audit Trail:** Append-only `cd_decisions` and `cd_audit` tables record every actor, timestamp, and before/after state. Moderator detail view (`/api/cd-admin/detail`) now also surfaces `verification_meta` and community correction `reports` (`cd_reports`).

---

## 5. Security Checks

- **Hardened Server-Side Controls:**
  - Server-side category (14) and region (9) allowlists.
  - Strict field length limits and hard 24 KB streaming body cap (`readJsonLimited`).
  - Strict `https://`-only URL validation blocking `javascript:`, `data:`, `http:`, IP literals, private/localhost hosts, credentials in URL, and executable extensions.
  - **New Script & Dangerous HTML Rejection (`containsDangerousMarkup`):** Rejects `<script>`, `<iframe>`, `<object>`, `<embed>`, `<svg>`, `<img>`, inline event handlers (`onerror=`, `onclick=`, etc.), `javascript:`, `vbscript:`, and `data:text/html` across all submission fields, editorial edits, and correction reports.
  - **Zero `innerHTML` Sinks:** Verified by automated test (`SUB-09`) across `cd-list.js`, `cd-submit.js`, `cd-admin.js`, and `cd-detail.js`; SSR detail page escapes all outputs with `escapeHtml()`.
  - Parameterized D1 queries throughout (SQLi tested and verified inert).
  - Exact content-hash duplicate blocking (409) + Jaccard near-duplicate / shared-source / nearby-coordinate provenance warnings.
  - D1-backed per-IP attempt/hourly/daily and global daily rate limits + Turnstile fail-closed verification + same-origin JSON CSRF guard.
  - **Community Correction Reports (`POST /api/community-discoveries/report`):** Same-origin JSON, rate-limited (10/hr/IP), allowlisted reasons, script-rejected, published-ref-only.
  - Private `contact_email`, `ip_hash`, internal `id`, and reviewer `internal_note` are never exposed in any public endpoint or detail page.

---

## 6. Database Changes

Created and applied one strictly additive, idempotent migration: `migrations/0002_community_intelligence_phase29.sql`.

- **New Tables:**
  - `cd_verification_meta`: Stores `official_confirmed`, `authoritative_source_url`, `authoritative_source_label`, `evidence_source_summary`, `verification_notes`, `featured`, `related_db_records`, `moderated_at`, `moderated_by`, `updated_at` keyed by `submission_id`. Preserves the existing `cd_submissions` CHECK constraint and immutability trigger without altering or recreating any existing table.
  - `cd_reports`: Stores community correction/outdated-patch flags (`ref`, `reason`, `details`, `ip_hash`, `created_at`).
- **Remote Application:** Applied to `gta6heistguide-db` (`31866186-7d51-4c36-a749-3822ac05bad7`) in 41.35ms (bookmark `000004ba-00000006-0000512e-17add89da71e42f7dcda9d44751b4b2a`). Zero existing rows modified.
- **Rollback Plan:** `DROP TABLE IF EXISTS cd_reports; DROP TABLE IF EXISTS cd_verification_meta;`

---

## 7. Approved Discovery Publication Behavior

- **Community Discovery Hub (`/community-discoveries/`):** Upgraded with Featured Verified Discoveries section (hidden honestly when 0 featured items exist), all 14 categories, all regions, all 4 publishable evidence filters, search, sort (`Recently approved`, `Featured first`, `Recently updated`), quick Save to My Leonida toggle, Evidence & Verification Standards guide, and an honest empty state when 0 discoveries are published.
- **SSR Discovery Detail Pages (`/community-discoveries/d/[ref]`):** Implemented via `functions/community-discoveries/d/[ref].js` + `public/assets/community/cd-detail.js`.
  - Pending, rejected, needs-evidence, unpublished, and invalid refs return **HTTP 404** with `X-Robots-Tag: noindex, nofollow`.
  - Published records meeting substantive quality thresholds (`title >= 10`, `short_explanation >= 60`, `finding_instructions >= 40`, valid `region`) emit `index, follow, max-image-preview:large`, canonical URL, and validated `Article` + `BreadcrumbList` JSON-LD.
  - Thin published records emit `noindex, follow` without an indexable canonical.
  - Includes discovery summary, where it was found, finding instructions, verification metadata table, optional contributor credit (only when opted in), approved map location link, My Leonida controls, related guides & World Database links, same-region approved discoveries, and inline correction reporting.

---

## 8. Map Integration

- **Separate Community Feed (`/api/community-discoveries/map-pins`):** Emits `map_classification` (`Community Reported`, `Verification Pending`, `Verified Discovery`), `is_community: true`, `counts_toward_completion: false`, and `link: "/community-discoveries/d/<REF>"`.
- **Interactive Map (`public/map.html`):** Fetches `/api/community-discoveries/map-pins` non-blockingly alongside `/data/map-pins.json` without modifying `public/data/map-pins.json`.
  - Community markers render with a distinct dashed ring (`is-community-pin`) and classification badge (`Community Reported` / `Verification Pending` / `Verified Discovery`) plus the explicit `evidence_notice`.
  - Community pin popups link directly to `/community-discoveries/d/<REF>` (`Discovery Detail ->`) and escape all strings via `escapeMapHtml()`.
  - `updateChecklistStats()` strictly filters out `counts_toward_completion === false` and `is_community`, preserving the exact **188 verified map pins** completion tracker (`Found: 0 / 188 (0%)` verified live).

---

## 9. My Leonida Integration

- **Unified Store Only:** Connected via the existing `window.GTA6Progress` (`gta6hg_progress_v1`) store using `isDone` / `setDone` (`cd-saved:<REF>`, `cd-verified-found:<REF>`, `pin-fav:community-<REF>`) and `getToolState` / `setToolState` (`savedDiscoveries`, `recentDiscoveries`). Zero competing localStorage systems created.
- **Dashboard Card (`/my-leonida/`):** Added **Community Discoveries — Saved & Recently Viewed** card (`#mlCommunityDiscoveriesCard`) in `public/my-leonida/index.html` and `public/assets/js/my-leonida.js`.
- **Verification Integrity:** Only `INDEPENDENTLY_VERIFIED` or `OFFICIALLY_CONFIRMED` discoveries can be marked as found; unverified `COMMUNITY_REPORTED` discoveries show an `Unverified Report` pill and never inflate overall verified completion percentage (verified in Playwright: saving an unverified report kept Overall Verified Progress at `0%`).

---

## 10. Analytics Status

- **Cloudflare Web Analytics:** Preserved and active on live production `https://www.gta6heistguide.com`.
- **GA4 Measurement ID:** Remains intentionally blank (`ga4MeasurementId: ""` in `public/site-config.js`; `window.GTA6Track.isGa4Active()` returns `false`). Custom events are instrumented locally via `window.GTA6Track` and are **not** claimed as collected in GA4 until an authorized GA4 Measurement ID is configured.
- **Phase 29 Custom Events Instrumented (non-personal parameters only):**
  - `discovery_submit_start`
  - `discovery_submit_success`
  - `discovery_detail_open`
  - `discovery_map_open`
  - `discovery_bookmark`
  - `discovery_report`

---

## 11. SEO Results

- **Dynamic Sitemap (`functions/sitemap.xml.js`):** Preserves static `public/sitemap.xml` and dynamically appends `/community-discoveries/d/<REF>` ONLY for published discoveries passing `isSubstantiveForIndex()`. Pending, rejected, thin, `/community-discoveries/submit/`, and `/cd-admin/` URLs are never emitted.
- **Internal Linking:** Added crawlable link to `/community-discoveries/` from Heist Command Center (`public/heist-command-center/index.html`) alongside existing links from `/gta-6-discoveries/`, `/secrets`, and `/my-leonida/`.
- **Sitewide SEO Audit (`node scripts/seo-audit.mjs`):**
  - **337** primary HTML pages audited
  - **339** JSON-LD blocks validated
  - **502** static sitemap canonical URLs validated
  - **1,176** HTML `<img>` tags checked
  - **24,128** internal links checked
  - **0 warnings, 0 fatal errors — PASS**

---

## 12. Security, Unit & Browser QA

| Suite | Scope | Result |
|---|---|---|
| **Security & Unit Tests** (`node --test tests/community-discoveries.test.mjs`) | All 73 original tests + 8 new Phase 29 tests (`P29-01`..`P29-08`: new categories, `OFFICIALLY_CONFIRMED`, detail page 404/noindex/index/privacy, map classifications, dynamic sitemap gating, report API security/rate-limit, featured/db metadata, migration 0002 idempotency) | **81/81 PASS** |
| **JS Syntax Checks** (`node --check`) | All 16 modified/added Function & frontend JS files | **16/16 PASS** |
| **SEO Audit** (`node scripts/seo-audit.mjs`) | Full sitewide HTML, JSON-LD, sitemap, image & link checks | **PASS (0 warnings, 0 errors)** |
| **Preview HTTP Smoke** (`tests/http-smoke.mjs`) | Preview `f91259d8`: all 13 preview-applicable checks pass; Turnstile/salt fail closed on preview as expected | **13/13 preview-applicable PASS** |
| **Preview Playwright QA** (`73871f65`) | Desktop 1280×800 + Mobile 390×844 across Hub, Submit, Detail 404, Admin fail-closed, Map 188-pin tracker, My Leonida sync, Sitemap, 0 app errors, 0 overflow (caught and fixed `GTA6Progress.setDone`/`isDone` mismatch prior to prod!) | **19/19 app checks PASS** (1 expected `.pages.dev` RUM CORS notice) |
| **Live Production Playwright QA** (`www.gta6heistguide.com`) | Full desktop + mobile verification; `/api/community-discoveries/config` confirms `submissionsOpen: true` + Turnstile active; `/cd-admin/` edge-protected (302); 188-pin tracker intact; My Leonida sync verified; 0 app JS errors; 0 horizontal overflow | **19/19 app checks PASS** (1 Cloudflare Turnstile internal iframe CSP probe) |

### Verification Screenshots Captured
- `verification-screenshots/phase-29-preview-hub-desktop.png`
- `verification-screenshots/phase-29-preview-submit-desktop.png`
- `verification-screenshots/phase-29-preview-hub-mobile.png`
- `verification-screenshots/phase-29-prod-hub-desktop.png`
- `verification-screenshots/phase-29-prod-submit-desktop.png`
- `verification-screenshots/phase-29-prod-hub-mobile.png`

---

## 13. Preview Deployment

- **Initial Preview:** `f91259d8-a283-4234-90ec-68453a85ecb5` (`https://f91259d8.gta6heistguide.pages.dev`, source `4676177`) — Playwright QA caught `GTA6Progress.setCompleted` -> `setDone` mismatch.
- **Verified Preview:** `73871f65-9f26-44e9-ac68-aced4238de13` (`https://73871f65.gta6heistguide.pages.dev`, alias `https://phase-29-community-intellige.gta6heistguide.pages.dev`, source `e089aa1`) — verified before production release.

---

## 14. Production Deployment

- **Deployment UUID:** `4db4aedf-9ffa-4d14-a4f8-49f7b870ce09`
- **Deployment URL:** `https://4db4aedf.gta6heistguide.pages.dev` -> `https://www.gta6heistguide.com`
- **Source Commit:** `e089aa1` (Direct Upload `--branch=main` from verified `phase-29-community-intelligence`; stale git `main` was NOT used)
- **Live Config Check:** `{"ok":true,"turnstile":{"siteKey":"0x4AAAAAAGP6iFDSa03U7dSE"},"turnstileMisconfigured":false,"uploads":false,"submissionsOpen":true}`

---

## 15. Rollback Reference

- **Immediate Production Rollback Target (Phase 28):** `f1245183-51c5-4d79-bfe2-6afe972e2d95` (`https://f1245183.gta6heistguide.pages.dev`, source `13913a4`) — preserved intact in Cloudflare Pages for one-click rollback.
- **D1 Additive Rollback (if ever needed):** `DROP TABLE IF EXISTS cd_reports; DROP TABLE IF EXISTS cd_verification_meta;` (zero impact on `cd_submissions`, `cd_published`, or any prior tables).

---

## 16. Remaining Limitations

1. **Direct Image Uploads Disabled by Design:** No Cloudflare R2 bucket binding exists in `wrangler.toml`; contributors submit external `https://` screenshot/video reference URLs that moderators review privately (never auto-embedded).
2. **Custom Event Destination:** `window.GTA6Track` instruments all 6 Phase 29 events cleanly with non-personal parameters, but GA4 collection remains inactive until an authorized GA4 Measurement ID is configured in `public/site-config.js`.
3. **Zero Published Community Records Initially:** Production D1 currently has 0 approved/published community discoveries (`cd_published WHERE is_published = 1` = 0). The Hub honestly displays its empty state and `/sitemap.xml` includes 0 discovery detail URLs until moderators approve and publish genuine substantive player submissions.
