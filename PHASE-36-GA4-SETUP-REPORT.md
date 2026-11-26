# PHASE 36 — Google Analytics 4 (GA4) Setup & Privacy Architecture Report

**Project:** GTA6HeistGuide.com (`https://www.gta6heistguide.com`)  
**Branch / Worktree:** `phase-36-analytics-growth` (isolated from production `main` commit `443a268`)  
**Date:** 2026-11-25  
**Source Verification:** Live authenticated Google Analytics session (`https://analytics.google.com`, account `shawnmontgomery972@gmail.com`), host-verified browser evidence (`final_step_140.png`).

---

## 1. Pre-Setup Audit & Duplicate Prevention

Prior to property creation, all accounts, properties, data streams, subscription settings, and Trash under the authenticated Google account were audited:
- **Existing Account:** `Meditative` (Account ID: `165308318`, Country: United States)
- **Existing Property (1 of 1):** `GetApexLocal` (Property ID: `563870384`, Web Stream `https://getapexlocal.com`, Stream ID `16323207084`) — **left completely unmodified**.
- **Duplicate Check:** Confirmed **zero** existing GA4 properties or data streams for `www.gta6heistguide.com` or `GTA6HeistGuide` (and `0` items in Trash).

---

## 2. Owner-Authorized GA4 Property & Web Stream Configuration

Following explicit owner authorization on 2026-11-25, the new GA4 property and web data stream were created under `Meditative` (`165308318`):

| Setting | Verified Value |
|---|---|
| **Account Name / ID** | `Meditative` (`165308318`) |
| **Property Name** | `GTA6HeistGuide` |
| **Property ID** | `565884775` |
| **Reporting Time Zone** | `United States` — `(GMT-06:00) Chicago Time` (`America/Chicago`) |
| **Reporting Currency** | `US Dollar ($)` (`USD`) |
| **Industry Category** | `Games` (`GAMES`) |
| **Business Size** | `Small - 1 to 10 employees` |
| **Business Objectives Selected** | `Understand web and/or app traffic`, `View user engagement & retention` *(current GA4 UI labels corresponding to user behavior & baseline reporting)* |
| **Web Stream Name** | `GTA6HeistGuide` |
| **Web Stream ID** | `16417865148` |
| **Measurement ID** | `G-DG7REYHR80` |
| **Stream URL** | `https://www.gta6heistguide.com` |

---

## 3. Enhanced Measurement, Data Collection & Retention Settings

### Enhanced Measurement (`Stream ID: 16417865148`)
- **Enhanced Measurement Master Toggle:** **ON**
- **Individual Toggles (7 of 7 ON):** Page views, Scrolls, Outbound clicks, Site search, Form interactions, Video engagement, File downloads.
- *Implementation Note:* Because GA4 Enhanced Measurement is enabled, our client-side `main.js` uses `send_page_view: true` once per page load (no manual duplicate `page_view` call), and `site-config.js` tracks non-affiliate `outbound_click` without overlapping `affiliate_click`.

### Privacy & Data Collection (`Property ID: 565884775`)
| Setting | Observed GA4 Admin State | Client-Side Enforcement (`phase-36-analytics-growth`) |
|---|---|---|
| **Google Signals** | **Disabled** (`Turn on` not clicked) | `allow_google_signals: false` enforced in `gtag('config', ...)` |
| **User-Provided Data Collection** | **Disabled** (`Turn on` not clicked) | Zero PII keys permitted (`BLOCKED_KEY_RE` strips email, phone, name, tokens, query, SSN) |
| **Granular Location & Device Data** | **Disabled** (toggled OFF & verified after reload) | Minimized telemetry |
| **Ads Personalization (GA4 Admin)** | **Disabled** (`allowed in 0 of 307 regions` — `Disallow all` applied & verified after reload) | `allow_ad_personalization_signals: false` enforced in `gtag('config', ...)` |
| **IP Anonymization & URL Query Stripping** | GA4 IP anonymization default | `anonymize_ip: true` and `page_location: origin + pathname` (strips query strings) |
| **Browser Opt-Out Signals** | N/A | Honors `navigator.globalPrivacyControl === true`, `navigator.doNotTrack === '1'`, local opt-out (`gta6_analytics_opt_out`), and excludes `/cd-admin/*` |

### Data Retention & Internal Traffic
- **Event Data Retention:** `2 months`
- **User Data Retention:** `14 months`
- **Reset User Data on New Activity:** **ON**
- **Data Filters:** `Internal Traffic` (`Exclude`, Current state: `Testing`)
- **Note on Internal Traffic IP Rules:** Opening `Configure tag settings -> Define internal traffic` loads an embedded `accounts.google.com` Google Tag Manager iframe blocked in the sandboxed browser; owner can optionally add office/home IP rules directly in GA4 Admin.

---

## 4. Production Safeguard & Evidence

- **Production Status:** `G-DG7REYHR80` is configured **only** on the isolated `phase-36-analytics-growth` branch and Preview deployment. Production (`main` commit `443a268`) remains untouched with `ga4MeasurementId: ""`.
- **Host-Verified Browser Evidence:** `C:/Users/Shawn/.gemini/antigravity/brain/67e41b28-8722-4b0c-aa5f-17bf941ee249/browser_evidence/76995c8a-9f33-48a3-8b2c-8dd0703f55d6/final_step_57.png` (privacy settings verified after reload).
