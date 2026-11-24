# Community Discoveries — Owner Moderation Guide

This guide covers setting up owner-only access, reviewing community submissions, assigning evidence classifications, publishing discoveries, and approving map pins.

---

## 1. Production Setup Status (Completed 2026-11-23)

All production infrastructure steps are complete on commit `8a06266` (Deployment `bcafd094-684c-44e3-bd83-1d031be24315`):
- **D1 Migration (`0001_community_discoveries.sql`):** Applied remotely to `gta6heistguide-db` (`31866186-7d51-4c36-a749-3822ac05bad7`). 0 pending migrations; 8 `cd_*` tables, 9 indexes, and 5 triggers verified.
- **Cloudflare Access (`GTA6HeistGuide Admin`):** Protects `www.gta6heistguide.com/cd-admin`, `/cd-admin/*`, `/api/cd-admin`, and `/api/cd-admin/*` (`302` → `gta6heistguide.cloudflareaccess.com`) with owner-only policy (`shawnmontgomery970@gmail.com`).
- **Pages Production Secrets (6/6):** `CF_ACCESS_TEAM_DOMAIN`, `CF_ACCESS_AUD`, `CD_ADMIN_EMAILS`, `CD_HASH_SALT`, `TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` (rotated).
- **Turnstile Hostname Follow-Up:** Ensure `www.gta6heistguide.com` is listed under **Hostname Management** for widget `GTA6HeistGuide Community Submissions` (`0x4AAAAAAGP6iFDSa03U7dSE`) to clear live browser error `110200`.

### Reference Setup Commands (If Re-provisioning)
```bash
npx wrangler d1 migrations apply gta6heistguide-db --remote
```
This only adds new `cd_*` tables and triggers. Existing tables and user data are untouched.

---

## 2. Daily Moderation Workflow

1. Navigate to `https://www.gta6heistguide.com/cd-admin/` and sign in via Cloudflare Access.
2. Start on the **New** or **Pending** tab.
3. Click a submission to inspect:
   - **Original submission (immutable):** Exact contributor text, platform, game version, discovery date, whether they personally witnessed it, optional coordinates, display name preference, and private contact email (if supplied).
   - **Evidence & sources:** External screenshot/video/source URLs are shown as plain text. Inspect the domain carefully before opening in a separate browser tab.
   - **Duplicate / provenance warnings:** Yellow `⚠` flags indicate possible duplicate titles, nearby coordinates, or shared source URLs (including normalized YouTube links). **Automatic warnings never count as corroboration.**

### Choosing an Action
- **Start review:** Marks `reviewer_status = in_review` so you know it is being worked on.
- **Request more evidence:** Moves status to `NEEDS_MORE_EVIDENCE` (requires an internal note). Remains private.
- **Reject:** Moves status to `REJECTED` (requires a reason in the internal note). Automatically unpublishes if previously published.
- **Flag as duplicate:** Links to the original submission's reference (`CD-XXXXX-XXXXX`) and rejects the duplicate.
- **Approve as Community Report:** Moves status to `COMMUNITY_REPORTED` and creates an **unpublished draft** in `cd_published`. Nothing is public yet.

---

## 3. Evidence Classification Policy

| Status | Meaning | Requirements Enforced by System |
|---|---|---|
| `PENDING_REVIEW` | Received, not yet reviewed | Default on submission; always private |
| `NEEDS_MORE_EVIDENCE` | Potentially useful, lacks detail | Requires internal note; always private |
| `COMMUNITY_REPORTED` | Accepted for publication as a community report; **not** independently corroborated or verified | Owner must click **Approve as Community Report** (then **Publish** when ready) |
| `CORROBORATED` | Supported by multiple genuinely independent observations or credible evidence | Requires a written basis (≥ 20 chars) **and** either a reviewer-linked `independent_confirmation` submission or explicit `External credible evidence` checkbox |
| `INDEPENDENTLY_VERIFIED` | Reproduced and verified by an authorized GTA6HeistGuide reviewer | Requires explicit owner confirmation checkbox + reviewer note (≥ 20 chars) describing reproduction |
| `REJECTED` | Inaccurate, duplicated, misleading, or unsupported | Requires a reason; auto-unpublishes and removes any map pin |

> **Important:** Multiple websites repeating the same original find—or multiple submissions citing the same source—do **not** establish independent corroboration. Use **Link submissions → `same_origin`** to record shared provenance without upgrading status.

---

## 4. Editing, Publishing & Attribution

1. After approving as a community report, use the **Published copy** panel to fix spelling, clarify instructions, add related site guide paths (e.g., `/map.html`), or add vetted public reference links (`Label | https://...`).
   - Editing the published copy **never** alters the original immutable submission.
   - Contributor credit can only be enabled if the contributor explicitly chose named credit; the system prevents attributing to an arbitrary name.
2. Click **Publish** to make the entry visible on `/community-discoveries/`. Every card automatically displays its evidence notice (e.g., *"Community Reported — Not independently verified by GTA6HeistGuide."*).
3. Click **Unpublish** at any time to immediately remove an entry from `/community-discoveries/` and from the community map feed.

---

## 5. Approving a Map Pin (Optional)

Only **published** discoveries can receive a map pin. Approved pins are served via `/api/community-discoveries/map-pins` (kept separate from `public/data/map-pins.json` and flagged `counts_toward_completion: false` so unverified discoveries never affect the 100% completion tracker).

Before clicking **Approve map pin**:
1. Confirm all 6 pre-publication checkboxes (no duplicate, category, coordinates, description, evidence, specificity).
2. Choose `live-discovery` or `easter-egg` and verify `xPct`/`yPct` (0–1 scale).
3. The server checks proximity against all 174 production pins in `public/data/map-pins.json` and returns `409` if a pin is too close (unless you explicitly check override after manual verification).
4. **Wildlife rule:** `wildlife` submissions cannot be approved as map pins unless their status is `INDEPENDENTLY_VERIFIED`.

---

## 6. Removal & Takedown Requests

If a contributor contacts `/contact.html` quoting their reference number (`CD-XXXXX-XXXXX`) to request removal or credit changes:
1. Open the submission in `/cd-admin/` and click **Unpublish** (and **Remove map pin** if pinned), or uncheck **Show contributor credit** and click **Save edits**.
2. Add an internal reviewer note documenting the contributor's request. All actions are logged in the append-only audit trail.

---

## 7. Phase 16 Editorial Verification Rubric (Research-to-Guide Intake)

Before promoting any community submission into a standalone guide or upgrading a verification-gated roadmap entry, reviewers must check all five evidence pillars without altering the D1 schema or bypassing `/cd-admin/` privacy controls:

| Pillar | Required Evidence | Minimum Bar to Promote |
|---|---|---|
| **1. Visual Proof** | Original gameplay screenshot(s) or unedited video clip (not real-world stock photos or promotional renders) | Direct visual confirmation of the mission prompt, HUD text, Easter egg, or in-game wildlife model |
| **2. Build & Platform** | Console platform (PS5 / PS5 Pro / Xbox Series X\|S) and game version / build number | Recorded in immutable submission metadata; flags patch-sensitive exploits/glitches |
| **3. Exact Location** | Leonida region, county/district, nearest named landmark, and verifiable map position | Required before publishing any coordinate or approving a map pin |
| **4. Reproducibility** | Clear step-by-step trigger conditions (chapter, character, time of day, prerequisite mission) | Must be reproducible by an independent player or reviewer |
| **5. Corroboration** | At least one genuinely independent second observation or credible external outlet (not a syndicated copy of the same post) | Required for `CORROBORATED` status; `PENDING_REVIEW` and `NEEDS_MORE_EVIDENCE` remain strictly private |

> **Editorial Rule:** A single unverified community submission is **never** published as confirmed fact or promoted into a standalone canonical guide. Submissions with incomplete evidence stay private under `NEEDS_MORE_EVIDENCE` until corroborated.
