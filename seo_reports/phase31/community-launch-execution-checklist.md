# Phase 31 — Community Launch Execution Checklist

**Project:** GTA6HeistGuide.com  
**Target Hub:** `https://www.gta6heistguide.com/community-discoveries/`  
**Submission Form:** `https://www.gta6heistguide.com/community-discoveries/submit/`  
**Source Drafts:** `seo_reports/phase30/community-launch-kit.md`  
**Verified Production D1 Baseline (2026-11-25 UTC):** `2` rejected submissions · `0` pending · `0` approved discoveries · `0` approved community map pins · `0` correction reports.  

> **Strict Execution Guardrails:**
> - **Manual publication ONLY** — zero automated posting, zero bots, zero spam cross-posting.
> - **Zero fabricated activity** — be transparent that the board is starting fresh at 0 published discoveries to attract founding contributors.
> - **No Rockstar affiliation** — always state GTA6HeistGuide.com is an independent fan resource unaffiliated with Rockstar Games or Take-Two Interactive.
> - **Preserve moderation & evidence tiers** — every submission stays private in `/cd-admin/` until human review assigns an honest evidence tier (`Community Reported`, `Corroborated`, `Verified in Gameplay`, or `Officially Confirmed`).

---

## Pre-Launch Technical Verification (Completed in Phase 31)

- [x] **Homepage Community Launch CTA live in code:** `#p31CommunityLaunchCta` added to `public/index.html` with direct links to `/community-discoveries/` and `/community-discoveries/submit/`.
- [x] **Contextual submission funnels live across high-CTR pages:**
  - `/animals` -> `/community-discoveries/submit/?category=wildlife`
  - `/weapons` -> `/community-discoveries/submit/?category=weapons_equipment`
  - `/port-gellhorn` -> `/community-discoveries/submit/?category=hidden_location&region=Port%20Gellhorn`
  - `/map` sidebar -> `/community-discoveries/submit/` ("Missing a Pin? Submit")
- [x] **Turnstile & Cloudflare Access moderation verified:** Public submission form active (`submissionsOpen: true`), `/cd-admin/` edge-protected behind Cloudflare Access + `CD_ADMIN_EMAILS`.
- [x] **D1 Migration 0002 ledger reconciled:** `cd_verification_meta` and `cd_reports` tables verified and officially recorded in `d1_migrations`.

---

## Manual Publication Sequence (Owner Action Plan)

### Day 1 — Owned Channels & Direct Funnels (Zero External Rule Risk)
- [ ] **1. Website Homepage CTA (Automated via Phase 31 Deploy):** Verify `#p31CommunityLaunchCta` renders cleanly on desktop & mobile on `https://www.gta6heistguide.com/`.
- [ ] **2. X (Twitter) Launch Announcement:**
  - **Copy Source:** `seo_reports/phase30/community-launch-kit.md` §2 (Single Post or 3-Post Thread).
  - **Pre-Check:** Confirm links resolve to `https://www.gta6heistguide.com/community-discoveries/submit/` and no hashtag spam (limit to `#GTA6`).
- [ ] **3. YouTube Video Description Block:**
  - **Copy Source:** `seo_reports/phase30/community-launch-kit.md` §5.
  - **Action:** Add the 4-link resource block to existing/new GTA 6 guide, secret-hunting, and heist walkthrough descriptions.

### Day 2 — Reddit Founding-Contributor Launch (Check Subreddit Rules First)
- [ ] **4. r/GTA6 (Primary Community):**
  - **Rule Check Before Posting:** Verify current r/GTA6 sidebar rules on external fan tools, required post flair (e.g., *Resource* / *Discussion*), and self-promotion ratio. If unsure, send a brief Modmail asking permission first.
  - **Copy Source:** `seo_reports/phase30/community-launch-kit.md` §1 Option A (Value-First Founding Contributors Post).
  - **Engagement Plan:** Stay active for the first 2–3 hours to answer questions, log feedback, and review any incoming submissions in `/cd-admin/`.
- [ ] **5. r/GTA6unmoderated (Secondary Community — Staggered 24h Later):**
  - **Rule Check Before Posting:** Do not copy-paste identically from r/GTA6; use the shorter casual version.
  - **Copy Source:** `seo_reports/phase30/community-launch-kit.md` §1 Option B.

### Day 3–4 — Discord & Facebook Gaming Groups (Permission-First)
- [ ] **6. GTA VI Discord Communities (r/GTA6 Partnered Discord & Secret-Hunting Servers):**
  - **Rule Check Before Posting:** Post **only** in explicitly allowed channels (`#self-promotion`, `#community-resources`, `#guides`, or `#secrets-and-discoveries`). Ask a server moderator first in strict servers.
  - **Copy Source:** `seo_reports/phase30/community-launch-kit.md` §4.
- [ ] **7. Facebook Gaming Groups (GTA 6, PS5, Xbox Series X Open-World Groups):**
  - **Rule Check Before Posting:** Confirm group rules allow member-built fan tools/links; limit to 1–2 relevant groups rather than mass cross-posting.
  - **Copy Source:** `seo_reports/phase30/community-launch-kit.md` §3.

### Day 5–7 — Targeted Creator Invitations (Personalized, Non-Spam)
- [ ] **8. Ethical Creator Outreach (Max 2–3 personalized messages/week):**
  - **Copy Source:** `seo_reports/phase30/community-launch-kit.md` §7.
  - **Targets:** GTA Series Videos, TGG, Broughy1322, DarkViperAU (personalize with a specific recent video; zero sponsorship pitch; offer credited attribution for verified submissions).

---

## Moderation SLA & Quality Control (First 10 Real Submissions)

- [ ] Review incoming submissions in `https://www.gta6heistguide.com/cd-admin/` within 24 hours.
- [ ] Reject spam, unverifiable rumors, or duplicate entries cleanly.
- [ ] For genuine finds with clear steps/evidence, publish with the accurate evidence tier (`COMMUNITY_REPORTED` until independently reproduced in-game).
- [ ] Only approve `map_approved = 1` pins when coordinates are clearly verified on the Leonida map.
- [ ] Never inflate or seed fake submissions to make the board look busy.
