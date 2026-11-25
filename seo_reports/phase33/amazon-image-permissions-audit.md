# Phase 33 — Amazon Associates & Product Image Permissions Audit

**Site:** GTA6HeistGuide.com (`https://www.gta6heistguide.com`)  
**Amazon Associates Tracking ID:** `gta6heistguid-20`  
**Audit Date:** 2026-11-25  
**Decision Path Taken:** **Decision B** (Creators API unavailable / unverified + no express prior written Amazon approval for mobile/responsive website display of Product Advertising Content)

---

## 1. Amazon Associates Account & Official Policy Verification

Live browser inspection of `https://affiliate-program.amazon.com/` and official Amazon Associates documentation on **2026-11-25** established the following verified facts:

1. **Authenticated Session Check:** No authenticated Amazon Associates session was active in the browser profile (`https://affiliate-program.amazon.com/` loaded the public Associates Central sign-in page). Account-private metrics (final acceptance status, 30-day qualifying sales count, and `Tools -> Creators API` credential issuance) could not be directly inspected and must be verified by the primary account owner.
2. **Creators API Replacement & Eligibility (`https://affiliate-program.amazon.com/creatorsapi/docs/en-us/onboarding/register-for-creators-api`):**
   - Legacy PA-API 5.0 is deprecated (`403 AccessDeniedException`) and replaced by the **Creators API** (`creatorsapi.amazon/catalog/v1/...`, OAuth 2.0 `client_credentials`).
   - Requires **final Amazon Associates account acceptance** AND **at least 10 qualifying sales within the previous 30 days** to unlock Creators API registration.
   - Only the **primary account owner** can register credentials under `Tools -> Creators API`.
   - Access is suspended if the account goes 30 consecutive days without qualifying referred sales.
3. **Responsive / Mobile Website Restriction (`Associates Program IP License`, Section 2(c)(d), updated April 14, 2026):**
   - *"You will not, **without our express prior written approval**, use any Product Advertising Content on or in connection with **any site or application designed or intended for use with a mobile phone or other handheld device**."*
   - Because GTA6HeistGuide.com is a responsive website intended for both desktop and mobile visitors, displaying Amazon Creators API / PA-API product images requires **express prior written approval** from an authorized Amazon representative (Operating Agreement Section 12).
4. **Image Caching & Storage Prohibition (`IP License`, Section 2(c)(h)):**
   - Publishers may **never** download, store, or locally host Amazon product image files (e.g., in `public/assets/`). Even with API + written mobile approval, only the Amazon-hosted image URL may be referenced (cached at most 24 hours).

---

## 2. Alternative Lawful Image Sources Investigation (Decision B)

| Source Evaluated | Commercial Affiliate Reuse Status | Audit Conclusion |
|---|---|---|
| **Amazon Product Pages / SiteStripe** | **Prohibited** without Creators API + express written mobile approval (IP License 2(c)(d) & 2(c)(h)). | **Not Used.** Zero Amazon images scraped, hotlinked, or rehosted. |
| **Manufacturer Press Kits / Newsrooms** (Sony PlayStation, PowerA, HyperX/HP, Logitech, SteelSeries/KontrolFreek, Razer, Corsair/Elgato, WD_BLACK) | Standard press-kit licenses explicitly permit **editorial news/review coverage only** and prohibit commercial/advertising/monetized display without **prior written authorization**. | **Not Used Yet.** Ready-to-send written commercial-affiliate permission requests are drafted in Section 4 below. |
| **Wikimedia Commons (CC BY / CC BY-SA 4.0)** | Commercial reuse permitted with attribution, *only* when the exact photo depicts the exact verified in-stock product ASIN. Available photos (e.g., standard DualSense, bare 4TB Samsung 990 PRO) did not match our verified in-stock affordable accessories (e.g., PowerA Twin Dock, KontrolFreek Heist Edition, Turtle Beach Recon 70, heatsink SSDs). | **Not Mismatched.** Refused to misrepresent a different product's photo as a finalist item. |
| **Original Publisher-Owned Branded Category Illustrations** (`public/assets/gear-illustrations/*.svg`) | **100% Authorized & Owned by Publisher.** Custom vector hardware illustrations created specifically for GTA6HeistGuide.com, displayed on a clean neutral studio showcase stage (`object-fit: contain`), and **explicitly badged `Category Illustration`** so they are never misrepresented as product photographs. | **Active Production Implementation (Decision B).** Eliminates the old dark text-only boxes while remaining 100% legally compliant. |

---

## 3. Ready-to-Upgrade Photo Pipeline (Zero-Refactor Switch)

The Phase 33 card renderer (`public/js/affiliates.js`) supports both `mediaType: 'illustration'` (currently active, clearly labeled `Category Illustration`) and `mediaType: 'photo'` (with `object-fit: contain`, neutral studio backdrop, optional attribution caption, and clickable Amazon Special Link). As soon as the site owner receives:
1. Amazon Creators API credentials + written IP License Section 2(c)(d) mobile-site approval (implemented server-side via Cloudflare Pages Functions with secrets in Cloudflare env vars and 24-hour URL refresh), **OR**
2. Written manufacturer commercial-affiliate image permission, **OR**
3. Original product photographs taken by the site owner,

each product card can be upgraded to genuine photography in a single catalog config update without redesigning the UI.

---

## 4. Owner Action Required — Ready-to-Send Approval Requests (NOT Sent Automatically)

### A. Amazon Associates Creators API & Responsive/Mobile Written Approval Request
*Submit via Amazon Associates Central (`https://affiliate-program.amazon.com/home/contact`) after confirming final account acceptance and ≥10 qualifying sales in the past 30 days:*

> **Subject:** Request for Creators API Access & Express Prior Written Approval Under IP License Section 2(c)(d) — `gta6heistguid-20`
>
> Hello Amazon Associates Team,
>
> I am the primary account owner for Amazon Associates Store ID `gta6heistguid-20`, operating the gaming editorial website `https://www.gta6heistguide.com`.
>
> 1. **Creators API Access:** Please confirm whether our account has received final acceptance and is eligible to register for Creators API credentials under `Tools -> Creators API`.
> 2. **IP License Section 2(c)(d) Written Approval:** Because `https://www.gta6heistguide.com` is a responsive website accessible on both desktop and mobile browsers, I am requesting Amazon's express prior written approval under Section 2(c)(d) of the Associates Program IP License to display Creators API Product Advertising Content (specifically unmodified Amazon-hosted product image URLs, refreshed within 24 hours, linking solely to matching Amazon Special Links with tag `gta6heistguid-20`, and never downloading or locally hosting image files) on our responsive website.
>
> All required disclosures ("As an Amazon Associate I earn from qualifying purchases.", "Sponsored · Paid link", and Amazon content/price disclaimers) are prominently displayed.
>
> Thank you,  
> Owner, GTA6HeistGuide.com (`inquiries@gta6heistguide.com`)

### B. Manufacturer Written Permission Request Template (PowerA, KontrolFreek, HyperX, Turtle Beach, Lexar, WD_BLACK, Paladone, Exquisite Gaming)
*Send to each brand's PR / Press / Affiliate Partnerships email:*

> **Subject:** Written Permission Request — Official Product Packshots for GTA6HeistGuide.com Buying Guide
>
> Hello [Brand] Media & Partnerships Team,
>
> I operate GTA6HeistGuide.com (`https://www.gta6heistguide.com`), an independent GTA VI strategy and console hardware guide serving PS5 and Xbox Series X|S players. We feature [Exact Product Name / Model] in our editorial Gaming Gear Hub (`/gaming-gear/`) with affiliate links to Amazon.
>
> May we have written permission to display official [Brand] studio product photography (unmodified, with brand credit) on our product recommendation cards for [Exact Product Name / Model]? We will include full brand attribution and comply with all trademark guidelines.
>
> Best regards,  
> Owner, GTA6HeistGuide.com (`inquiries@gta6heistguide.com`)
