# PHASE 36 — Affiliate Partner Application Status Tracker

**Project:** GTA6HeistGuide.com (`https://www.gta6heistguide.com`)  
**Updated:** 2026-11-25 (Updated from Phase 34 & Phase 35 baseline trackers)  
**Active Approved Partners:** Amazon Associates (`gta6heistguid-20` — placements paused via `enableAmazonProductPlacements: false`), G2A, ExitLag, Gumroad (CutFlow Pro / Apex Pro Bundle)

> **Safeguard Compliance:** No duplicate publisher accounts created. No existing applications resubmitted. No unapproved merchants activated in code. No merchant terms accepted without owner authorization.

---

## 1. Current Application Status Table

| Partner / Network | Network | Application Status | Approval Status | Outstanding Requirements | Tracking Credentials Received | Next Owner Action |
|---|---|---|---|---|---|---|
| **Impact.com Publisher Account** | Impact.com | **Account established** (`impact-site-verification` meta tag live on `/` and intact) | Active publisher onboarding | Monitor account/tax profile verification inside Impact portal | Site verification meta tag (`f69da5d8-ba34-4487-a5d9-2985b3e4c47d`) live | Check Impact inbox for merchant decisions; do not create duplicate account |
| **Logitech** | Impact.com | **Submitted / Pending** (via Impact Marketplace) | **Pending review** | Awaiting Logitech merchant review & contract approval | None yet | Wait for Impact approval email; once approved, record public-safe campaign tracking link only |
| **Razer** | Impact.com | **Submitted / Pending** (via Impact Marketplace) | **Pending review** | Awaiting Razer merchant review & brand-fit approval | None yet | Wait for Impact approval email; keep inactive until approved |
| **Green Man Gaming** | Impact.com | **Submitted / Pending** (Business Affiliate track) | **Pending review** | Awaiting GMG merchant review | None yet | Wait for Impact approval email; keep inactive until approved |
| **Fanatical** | Awin | **Application pending** | **Pending review** | Awaiting Awin / Fanatical publisher review decision | None yet | Monitor Awin dashboard & email; do not open duplicate CJ/Awin account while pending |
| **Newegg** | Rakuten Advertising | **Application pending** | **Pending review** | Awaiting Rakuten Network Quality & Newegg approval (state tax-nexus review) | None yet | Monitor Rakuten dashboard & email; keep inactive until approved |

---

## 2. Integration Readiness When Approved

- `functions/_lib/affiliate-clicks.js` (`KNOWN_PARTNERS`) and `public/js/affiliates.js` are architected for zero-friction addition of approved merchants.
- **Activation Gate:** No pending merchant will be added to `KNOWN_PARTNERS`, `SITE_CONFIG`, or `/gaming-gear/` until:
  1. Approval is confirmed in the official network portal.
  2. Official public-safe tracking URLs/IDs are provided by the owner.
  3. Owner explicitly authorizes activation.
