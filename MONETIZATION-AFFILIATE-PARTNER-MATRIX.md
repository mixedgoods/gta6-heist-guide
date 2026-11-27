# GTA6HEISTGUIDE — AFFILIATE PARTNER AUDIT & NEW PARTNER MATRIX (PHASE 48)

**Audit Date:** November 27, 2026  
**Website:** `https://www.gta6heistguide.com`  
**Scope:** Independent verification of all 6 existing website partner references, 5 pending Phase 36 network applications, and 18 researched legitimate gaming/tech affiliate programs scored on the 0–100 Phase 48 rubric.

> **Strict Safeguards Observed:** Zero applications were submitted, zero contracts or legal terms were accepted, zero tax/bank/payment settings were changed, zero Amazon Influencer or video programs were pursued, and zero unapproved partner links were added to site code.

---

## 1. Existing Website Partner Audit (6 Referenced Programs)

A full scan of all **580 HTML files**, **21 JS files**, **31 JSON files**, and **32 Cloudflare Functions** identified **470 static outbound partner links** across **5 domains** (plus **53 dynamically rendered Amazon cards** on `/gaming-gear/` and **0 active Eneba links**).

| # | Program / Entity | Configured Link / Tag | Static HTML Links (Pages) | Verified Account Evidence (2026-11-27) | Status Classification | Terms & Compliance Notes | Required Owner Action |
|---|---|---|---:|---|---|---|---|
| 1 | **Amazon Associates (US Regular)** | `tag=gta6heistguid-20` (`https://www.amazon.com/dp/<ASIN>?tag=gta6heistguid-20`) | **117** static links (`75` pages) + **53** dynamic `/gaming-gear/` cards | **Verified signed-in dashboard:** Store ID `gta6heistguid-20`; `https://www.gta6heistguide.com` listed under Websites with green `Confirm Compliance` check. Trailing 30-day summary: **82 clicks, 0 ordered items, 0 shipped items, 0.00% CR, $0.00 earnings**. Tax status (US & Canada): `Incomplete` (intentionally deferred by owner). | **APPROVED AND ACTIVE** *(tax/payment deferred; homepage paused via `enableAmazonProductPlacements: false`)* | Exact required statement (`"As an Amazon Associate I earn from qualifying purchases."`) present on active hubs & legal pages; `100%` `rel="sponsored nofollow noopener"`; zero prices/ratings/scraped images. Production still has Phase 35.1C pause on `/gaming-gear/` until Phase 47/48 is released. | Review & release Phase 47+48 Preview so active compact cards go live on `/gaming-gear/` & `/gta-6-settings/`; complete tax/payment forms when ready. |
| 2 | **G2A Goldmine** | `https://www.g2a.com/n/reflink-4094b9aab5` | **95** links (`77` pages) | Reflink present & `100%` `rel="sponsored nofollow noopener"`. No signed-in G2A Goldmine dashboard session available in this environment to confirm publisher profile status or earnings. | **NOT VERIFIED** *(link active on site; account standing & earnings require owner login)* | Official program (`g2a.com/goldmine`): commission sharing (~5% digital / ~4% physical; dynamic per product), **24-hour renewable cookie**, balance verification (~3-day transfer to G2A balance), no brand PPC bidding, one account per user. Grey-market reputation risk—do not expand aggressively over authorized stores. | Log into `https://www.g2a.com/goldmine` to confirm active publisher profile, verify `reflink-4094b9aab5` attribution, and check any pending earnings. |
| 3 | **ExitLag Affiliate Program** | `https://www.exitlag.com/refer/10386953` | **100** links (`77` pages) | Referral link present & `100%` `rel="sponsored nofollow noopener"`. No signed-in ExitLag Client Area session available in this environment to confirm tier, site approval, or conversions. | **NOT VERIFIED** *(link active on site; tier & site approval require owner login)* | Official program (`exitlag.com/be-affiliate`): **10% baseline commission** on **first subscription only** (no renewal commissions); Levels 01–04 based on 30-day conversions; **$50.00 USD** minimum payout via PayPal; brand-bidding PPC prohibited. Note: ExitLag is primarily PC-focused while GTA VI launch platforms are PS5 & Xbox Series X|S—keep contextual to PC/network guides only. | Log into ExitLag Client Area → Affiliates to verify account standing, confirm `gta6heistguide.com` is approved, and check current tier/balance. |
| 4 | **Gumroad / CutFlow Pro & Apex Pro Bundle** | `https://apexlocallabs.gumroad.com/l/cutflow-pro` (`23x`) & `.../l/apex-pro-bundle` (`65x`) | **88** links (`72` pages) | Product pages belong to `apexlocallabs` (publisher-operated / sister creator product brand, not an independent third-party affiliate network). `100%` carry `rel="sponsored nofollow noopener"`. No signed-in Gumroad merchant/affiliate dashboard inspected. | **NOT VERIFIED** *(direct Gumroad product links — not a verified third-party affiliate contract)* | Standard Gumroad product URLs without `?a=` affiliate parameters do not prove a third-party affiliate arrangement; `public/terms.html` updated in Phase 48 to disclose Gumroad / CutFlow Pro accurately as publisher-operated digital tools rather than implying a third-party network contract. | Verify both `cutflow-pro` and `apex-pro-bundle` listings are live, priced accurately, and owned/authorized by the owner in Gumroad dashboard. |
| 5 | **GetApexLocal** | `https://getapexlocal.com` (`68x`) & `/partners` (`2x`) | **70** links (`62` pages) | Previously documented as an owned sister site (separate GA4 property). Zero affiliate tracking parameters on URLs. | **NOT SUITABLE** *(as a gaming affiliate program — owned sister property, low audience relevance to console gamers)* | GetApexLocal is a local-business/B2B sister property rather than a gaming product. Existing brand/footer mentions preserved without adding new gaming-guide placements; do not pitch as a gaming affiliate recommendation. | Owner decision: keep subtle brand-network footer/creator links or prune irrelevant placements on gaming guides in a future cleanup. |
| 6 | **Eneba** | None (`0` active links) | **0** links (`0` pages) | Confirmed `0` outbound Eneba links across all 580 HTML pages (`public/terms.html` explicitly notes Eneba is inactive; 1 historical D1 click row from pre-Phase 36). | **INACTIVE** | Preserved strictly inactive. Do not reactivate unless formal publisher approval is independently verified. | None required (keep inactive). |

---

## 2. Pending Affiliate Network Applications (Carried Forward from Phase 36)

No duplicate accounts were opened and no pending applications were resubmitted.

| Partner / Network | Network | Prior Recorded Status (Phase 36) | Verification Tag / Readiness | Current Status | Next Owner Action |
|---|---|---|---|---|---|
| **Impact.com Publisher Account** | Impact.com | Account established (`<meta name='impact-site-verification' value='f69da5d8-ba34-4487-a5d9-2985b3e4c47d'>` verified live on `/index.html`) | Meta tag verified intact in Phase 48 | **APPROVED AND ACTIVE** *(network account; merchant approvals pending)* | Sign into Impact.com dashboard to check merchant decisions & apply to Priority #1–#3 Impact brands below |
| **Logitech / Logitech G** | Impact.com | Application submitted / pending | Not activated in code | **APPLICATION PENDING** | Check Impact.com inbox for merchant decision |
| **Razer** | Impact.com | Application submitted / pending | Not activated in code | **APPLICATION PENDING** | Check Impact.com inbox for merchant decision |
| **Green Man Gaming** | Impact.com | Application submitted / pending | Not activated in code | **APPLICATION PENDING** | Check Impact.com inbox for merchant decision |
| **Fanatical** | Awin | Application pending | Not activated in code | **APPLICATION PENDING** | Check Awin dashboard / email for approval |
| **Newegg** | Rakuten Advertising | Application pending | Not activated in code | **APPLICATION PENDING** | Check Rakuten dashboard / email for approval (state tax-nexus review) |

---

## 3. Researched New Affiliate Partners (18 Legitimate Programs Scored 0–100)

### Scoring Rubric (100 Points Total)
- **Audience Relevance (25 pts):** Fit for PS5, Xbox Series X|S, gaming audio, storage, streaming, and PC/console gamers visiting GTA6HeistGuide.
- **Product Usefulness (20 pts):** Genuine practical value for readers (controllers, headsets, NVMe SSDs, capture cards, lighting, authorized games, security).
- **Program Legitimacy & Trustworthiness (20 pts):** Authorized retailer, first-party manufacturer, or established reputable service (penalizing grey-market risk).
- **Commission & Payout Attractiveness (15 pts):** Effective commission %, bounty value, AOV, and payout reliability.
- **Cookie & Tracking Conditions (10 pts):** Cookie duration (30–45d scores high; 24h scores lower) and reliable network attribution.
- **US Publisher Accessibility (10 pts):** Open US publisher enrollment, low friction, and alignment with existing networks (Impact.com already established!).

### Complete 18-Program Research & Scoring Table

| Rank | Partner | Category | Official Program URL | Network | US Avail. | Commission | Cookie | Payout / Key Restrictions | Rel (25) | Use (20) | Legit (20) | Comm (15) | Cook (10) | US Acc (10) | **Score** | Status |
|---:|---|---|---|---|---|---|---|---|---:|---:|---:|---:|---:|---:|---:|---|
| 1 | **Logitech G** | B. Hardware Mfg | `https://www.logitech.com/en-us/my-account/affiliate-program.html` | **Impact.com** | Yes | 4%–10% (avg ~5%–7.5%) | 30 days | Impact standard payout ($10 min); no brand PPC bidding; strong mice/headsets/Blue Yeti mics | 24 | 19 | 20 | 12 | 9 | 9 | **93** | `APPLICATION PENDING` |
| 2 | **Elgato (Corsair)** | B. Hardware Mfg | `https://www.elgato.com/us/en/s/creators` / Impact | **Impact.com** | Yes | ~5% (Stream Decks, 4K X/HD60 X capture cards, lights) | 30 days | Impact payout; direct match for `/gta-6-settings/` capture cards & `/gaming-gear/` Stream Decks | 23 | 19 | 20 | 11 | 9 | 9 | **91** | `APPLICATION REQUIRED` (**PRIORITY #1**) |
| 3 | **Govee** | B. Hardware Mfg | `https://us.govee.com/pages/affiliate-program` | **Impact.com** (`2621638`) / FlexOffers | Yes | 5%–12% (5%–6% baseline) | 30 days | Impact payout; high appeal for TV/monitor RGBIC backlighting & gaming room desk setups | 22 | 17 | 18 | 13 | 9 | 10 | **89** | `APPLICATION REQUIRED` |
| 4 | **Humble Bundle (Humble Partner)** | D. Authorized Game Store | `https://www.humblebundle.com/partner` | **Impact.com** | Yes | ~8% on eligible store/bundle sales | 30 days | Authorized publisher-direct keys + charity tie-in; Impact payout; no coupon abuse | 20 | 18 | 20 | 13 | 9 | 9 | **89** | `APPLICATION REQUIRED` (**PRIORITY #2**) |
| 5 | **B&H Photo Video** | A. Hardware Retailer | `https://www.bhphotovideo.com/find/affiliate.jsp` | **Impact.com** | Yes | 2%–8% (tiered by category) | 30 days | Highly trusted US electronics retailer carrying PS5 SSDs, capture cards, mics, studio headphones (MDR-7506) & OLED monitors | 22 | 19 | 20 | 10 | 9 | 8 | **88** | `APPLICATION REQUIRED` (**PRIORITY #3**) |
| 6 | **SCUF Gaming** | B. Hardware Mfg | `https://scufgaming.com/affiliates` | **Impact.com** (Corsair family) | Yes | Tiered rate card in Impact (high AOV ~$200–$300 controllers) | 30 days | Direct fit for PS5 Reflex & Xbox Instinct pro controllers (high intent alongside DualSense Edge queries) | 24 | 18 | 19 | 10 | 9 | 8 | **88** | `APPLICATION REQUIRED` |
| 7 | **Razer** | B. Hardware Mfg | `https://www.razer.com/affiliate` | **Impact.com** | Yes | Up to 5%–10% (peripherals higher; laptops lower) | 14–30 days | Impact payout; strict brand-asset compliance; strong PS5/Xbox headsets & controllers | 23 | 18 | 19 | 11 | 8 | 8 | **87** | `APPLICATION PENDING` |
| 8 | **Green Man Gaming** | D. Authorized Game Store | `https://www.greenmangaming.com/affiliates/` | **Impact.com** | Yes | Up to 5% standard / up to 10% bundles | 30 days | Fully authorized digital PC/console-gift retailer; cleaner trust profile than grey-market key resellers | 19 | 17 | 20 | 11 | 9 | 9 | **85** | `APPLICATION PENDING` |
| 9 | **Fanatical** | D. Authorized Game Store | `https://www.fanatical.com/en/affiliate` | **Awin** / CJ | Yes | 5%–12% (bundles & individual keys) | 30 days | Fully authorized retailer (Fandom-owned); strong bundle conversions; Awin approval required | 18 | 17 | 20 | 13 | 9 | 8 | **85** | `APPLICATION PENDING` |
| 10 | **KontrolFreek** | B. Hardware Mfg | `https://www.kontrolfreek.com` / CJ Affiliate | **CJ Affiliate** | Yes | ~10% baseline | 30 days | Already recommended in `/gaming-gear/` (Heist Edition & Galaxy PS5/Xbox thumbsticks); high conversion impulse AOV | 24 | 18 | 18 | 12 | 9 | 4 | **85** | `APPLICATION REQUIRED` *(requires CJ account)* |
| 11 | **Corsair** | B. Hardware Mfg | `https://www.corsair.com/us/en/s/affiliate-program` | **Impact.com** / FlexOffers | Yes | 2%–5% | 30 days | Covers PS5 MP600 PRO LPX SSDs, HS80 headsets, and PC builds; unified under Impact | 21 | 18 | 20 | 8 | 9 | 9 | **85** | `APPLICATION REQUIRED` |
| 12 | **Secretlab** | B. Hardware Mfg | `https://secretlab.co/pages/affiliates` | **CJ Affiliate** | Yes | Up to 12% on $500+ gaming chairs/desks | 7 days | Huge dollar payout per sale ($50–$80+); shorter 7-day cookie; requires CJ account | 19 | 17 | 19 | 15 | 6 | 7 | **83** | `APPLICATION REQUIRED` |
| 13 | **SteelSeries** | B. Hardware Mfg | `https://steelseries.com/affiliates` | **Impact.com** (periodic creator waves) | Yes | Up to 8% | 30 days (network) | Top console headsets (Arctis Nova 7P/7X); public enrollment opens selectively | 23 | 19 | 20 | 11 | 8 | 2 | **83** | `APPLICATION REQUIRED` *(selective waves)* |
| 14 | **NordVPN** | C. Gaming Software | `https://nordvpn.com/affiliate/` | **In-house / CJ / Awin** | Yes | 40% new sales + 30% renewals | 30 days | Strong commissions; relevant only to online lobby privacy/DDoS protection guides (avoid spammy placement) | 15 | 14 | 19 | 15 | 9 | 9 | **81** | `APPLICATION REQUIRED` |
| 15 | **Streamlabs (Ultra)** | C. Gaming Software | `https://streamlabs.com/affiliate` | **Impact.com** | Yes | $10 monthly / $20 annual CPA | 30 days | Ideal contextual match for `/live` Companion & streaming guides; already on Impact | 16 | 15 | 19 | 12 | 9 | 9 | **80** | `APPLICATION REQUIRED` |
| 16 | **GOG.com** | D. Authorized Game Store | `https://www.gog.com/partner` | **CJ Affiliate** | Yes | 6% flat net sales | 7 days | DRM-free authorized PC store; strong trust, modest console overlap until a PC GTA VI release | 15 | 16 | 20 | 10 | 6 | 8 | **75** | `APPLICATION REQUIRED` |
| 17 | **Newegg** | A. Hardware Retailer | `https://www.newegg.com/promotions/nepro/affiliate/` | **Rakuten Advertising** | Yes | 0.5%–1.5% baseline (some 0% SKUs) | 7 days | Wide SSD/monitor/hardware catalog, but low baseline % and state tax-nexus restrictions | 20 | 18 | 19 | 4 | 6 | 7 | **74** | `APPLICATION PENDING` |
| 18 | **Best Buy (US)** | A. Hardware Retailer | `https://www.bestbuy.com/site/misc/best-buy-affiliate-program/pcmcat198500050002.c` | **Impact.com** | Yes | 0%–1% (many categories 0%) | 1 day (24h) | High US buyer trust for PS5/Xbox hardware, but 0%–1% rate and 24h cookie severely limit earnings vs. direct brand programs | 22 | 19 | 20 | 2 | 2 | 8 | **73** | `APPLICATION REQUIRED` *(low priority)* |

*(Additional programs evaluated and excluded from Top 18: **ASUS ROG** [Awin, 1% baseline], **HyperX** [closed Sideqik creator portal], **Restream** [PartnerStack, 30%, niche], **Epidemic Sound** [CJ, creator audio niche], **NVIDIA GeForce NOW** [Rakuten, 2%–5%, limited GTA VI relevance since Rockstar lists PS5 & Xbox Series X|S], **Boosteroid** [EU-centric cloud gaming], **Micro Center** [no self-serve affiliate program — direct creator email only], **CDKeys/Loaded** [Impact, 2%–5%, grey-market risk].)*

---

## 4. Top 10 New Partner Opportunities & Top 3 Priority Applications

### Top 10 Ranked New Opportunities (Excluding Already-Active Amazon Associates)

1. **Logitech G** (`93/100`) — *Impact.com (Already Pending)* — Covers Blue Yeti mics, G305 mice, Astro/Logitech console headsets (4%–10%, 30d cookie).
2. **Elgato** (`91/100`) — *Impact.com* — **TOP PRIORITY APPLICATION #1** — Already featured in `/gta-6-settings/` (4K X, 4K Pro, HD60 X) and `/gaming-gear/` (Stream Deck MK.2, Pedal, Stream Deck+); 5% commission, 30-day cookie, single-click application inside existing Impact.com account.
3. **Humble Bundle / Humble Partner** (`89/100`) — *Impact.com* — **TOP PRIORITY APPLICATION #2** — Fully authorized game marketplace (~8% commission, 30-day cookie) on existing Impact.com account; upgrades digital game monetization beyond G2A without grey-market trust risk.
4. **Govee** (`89/100`) — *Impact.com* — High 5%–12% commission + 30-day cookie for TV/monitor RGBIC backlighting already featured in `/gaming-gear/`.
5. **B&H Photo Video** (`88/100`) — *Impact.com* — **TOP PRIORITY APPLICATION #3** — Reputable US authorized retailer (2%–8%, 30-day cookie) covering Sony MDR-7506 studio headphones, PS5 M.2 SSDs, capture cards, mics, and OLED monitors — provides a high-trust Amazon alternative with a 30× longer cookie window.
6. **SCUF Gaming** (`88/100`) — *Impact.com* — High-AOV PS5/Xbox pro controllers matching real GSC demand (`best dualsense edge settings for gta 6`).
7. **Razer** (`87/100`) — *Impact.com (Already Pending)* — Broad console & PC peripherals (5%–10%, 14–30d cookie).
8. **Green Man Gaming** (`85/100`) — *Impact.com (Already Pending)* — Authorized digital store (5%–10%, 30d cookie).
9. **Fanatical** (`85/100`) — *Awin (Already Pending)* — Authorized digital store & bundles (5%–12%, 30d cookie).
10. **KontrolFreek** (`85/100`) — *CJ Affiliate* — ~10% commission & 30d cookie on PS5/Xbox thumbsticks already featured on `/gaming-gear/` (requires opening one CJ Affiliate publisher account, which also unlocks Secretlab & GOG).

### Why Elgato, Humble Partner, and B&H Photo Video Are the Top 3 Immediate Applications
- **Zero new network signups required:** All three run on **Impact.com**, where GTA6HeistGuide already has an established publisher account and live `<meta name='impact-site-verification'>` verification on `/`.
- **100% product overlap with existing site hubs:** Elgato and B&H directly monetize hardware already recommended on `/gaming-gear/` and `/gta-6-settings/` at higher commissions and 30-day cookies (vs. Amazon's 24-hour cookie), while Humble Partner gives the site a legitimate authorized digital store alongside pending GMG/Fanatical.
- **Activation Gate:** Do NOT add any tracking links for Elgato, Humble, B&H, Logitech G, Razer, GMG, Fanatical, or Newegg to `public/` or `functions/_lib/affiliate-clicks.js` until the owner confirms approval in the official network dashboard and provides approved public-safe tracking URLs.
