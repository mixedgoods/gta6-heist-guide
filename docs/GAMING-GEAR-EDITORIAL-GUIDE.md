# GTA6HeistGuide — Gaming Gear & Leonida Editor's Pick Editorial Control Guide

This guide explains how to maintain the **Gaming Gear** catalog and **LEONIDA EDITOR'S PICK OF THE DAY** without editing multiple HTML files or requiring a public admin panel.

## Single Source of Truth

All product data lives in one structured JSON file:

- Authoritative source: `data/gear-products-master.json`
- Deployed runtime mirror: `public/data/gear-products-master.json`

Whenever you edit `data/gear-products-master.json`, run:

```bash
node scripts/sync-gear-catalog.mjs
```

That script validates every active product (ASIN format, `gta6heistguid-20` tracking tag, direct `https://www.amazon.com/dp/<ASIN>?tag=gta6heistguid-20` URL, licensed image path on disk, zero static prices or Amazon star ratings/reviews) and mirrors the file to `public/data/gear-products-master.json`.

---

## 1. Add a Product

1. Open `data/gear-products-master.json`.
2. Add a new object inside the `"products"` array with a unique kebab-case `"id"` (for example `"my-new-gadget"`).
3. Set `"sectionId"` to one of the six existing Gaming Gear sections:
   - `"controllers"`
   - `"charging-solutions"`
   - `"affordable-headsets"`
   - `"ps5-storage"`
   - `"gaming-room"`
   - `"funny-gear"`
4. Set `"analyticsPlacement"` to the matching GA4 placement label (`gaming_gear_controllers`, `gaming_gear_charging`, `gaming_gear_audio`, `gaming_gear_storage`, `gaming_gear_setup`, or `gaming_gear_unusual`).
5. Fill in original, honest editorial copy (`shortDescription`, `whyInteresting`, `editorialIntro`, `whatMakesItDifferent`, `intendedAudience`, `compatibility`, `honestDisadvantages`) and cite independent review sources in `independentResearchReferences`.
6. **Never** write static prices (e.g., `$49.99`), Amazon star ratings, review counts, or scarcity claims — the validator automatically rejects them.

## 2. Verify Its Listing

Before setting `"active": true`:

1. Confirm the exact manufacturer, model, and SKU on Amazon.com.
2. Confirm the 10-character ASIN matches the exact product variant you are describing (especially for controllers, PS5 heatsinks, switch colors, and platform-specific accessories).
3. Record today's date in `"researchVerifiedDate"` and `"linkVerifiedDate"` (`YYYY-MM-DD`).

## 3. Generate Its Affiliate Link (Regular Amazon Associates / SiteStripe)

1. Sign in to the regular Amazon Associates account (`gta6heistguid-20`) — do **not** use Amazon Influencer tools.
2. Open the verified product page on `amazon.com` and use **SiteStripe → Get Link → Text (Full Link)** or confirm the clean direct product Special Link format:
   ```
   https://www.amazon.com/dp/<10-CHAR-ASIN>?tag=gta6heistguid-20
   ```
3. Paste the verified URL into `"amazonSpecialLink"` and set `"associatesTag": "gta6heistguid-20"`.
4. Never use third-party cloakers, misleading shorteners, or unverified ASINs.

## 4. Add Licensed Imagery

Never copy, hotlink, or rehost Amazon product images without authorized Creators API access and license compliance. Use one of two lawful options:

- **Option A — Commercially Licensed Photograph (`"mediaType": "photo"`):** Use an exact-match Wikimedia Commons CC0, CC BY, or CC BY-SA photograph, convert proportionally to `.webp` inside `public/assets/gear-photos/`, and populate `imageLicense` (`creator`, `sourceUrl`, `licenseName`, `licenseUrl`, `status: "Approved (...)"`).
- **Option B — Publisher-Owned Category Illustration (`"mediaType": "illustration"`):** Place an original SVG illustration inside `public/assets/gear-illustrations/` and set `imageLicense.status` to `"Authorized (Publisher-Owned Category Illustration)"` and `badgeLabel: "Category Illustration"`.

## 5. Enable It for Daily Rotation

1. Verify all daily editorial fields are complete (`editorialIntro`, `whyInteresting`, `whatMakesItDifferent`, `intendedAudience`, `compatibility`, `honestDisadvantages`).
2. Set `"active": true`, `"dailyEligible": true`, and assign the next `"dailyOrder"` integer.
3. Run `node scripts/sync-gear-catalog.mjs` and `node --test tests/gaming-gear-rotation.test.mjs`.

## 6. Disable or Replace an Old / Expired Product

1. Locate the product in `data/gear-products-master.json`.
2. Set `"active": false` and `"dailyEligible": false`.
3. Optionally add `"rejectionReason": "Listing unavailable on YYYY-MM-DD — replaced by <new-id>"`.
4. Add the replacement product as a new entry (or update `"amazonSpecialLink"` and `"linkVerifiedDate"` if only the ASIN changed).
5. Run `node scripts/sync-gear-catalog.mjs`. Disabled products are immediately excluded from both the catalog grids and **LEONIDA EDITOR'S PICK OF THE DAY**.

## 7. Test Today's & Tomorrow's Pick

Run the deterministic schedule preview script from the repository root:

```bash
# Preview today and tomorrow (America/Chicago)
node scripts/preview-daily-pick.mjs

# Preview a specific America/Chicago calendar date
node scripts/preview-daily-pick.mjs 2026-12-01

# Preview the next 19 days to verify full non-repeating rotation
node scripts/preview-daily-pick.mjs --days 19
```

## Future Creators API Readiness

The manual JSON catalog runs completely independently of Amazon Creators API availability. When the Associates account meets Amazon's documented Creators API eligibility requirements (including 10 qualifying shipped sales in the trailing 30 days and marketplace API registration — see `https://affiliate-program.amazon.com/creatorsapi/docs/`), a server-side endpoint can optionally register an API hydrator via `window.GTA6GearEngine.registerApiHydrator(asyncFn)` without changing any HTML markup or breaking the deterministic daily rotation fallback.
