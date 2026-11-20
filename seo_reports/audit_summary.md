# GTA6HeistGuide.com — Plain-English SEO & Technical Health Report

**Run Mode:** `LOCAL` | **Checked At:** `2026-11-20T17:16:05Z` | **Total Sitemap URLs:** `117`

## 1. Two-Stage Audit Results
- **Stage 1 (Raw HTML Check — what Googlebot & AI crawlers read first):**
  - Pages returning HTTP 200 OK: **117 / 117**
  - Broken internal links (404s): **0**
  - Pages missing `<title>`: **0**
  - Pages missing `<meta name="description">`: **0**
  - Pages missing canonical URL (`rel="canonical"`): **0**
  - Pages with missing or duplicate `<h1>` tags: **0**
  - Pages with missing image `alt` descriptions: **0**
  - Invalid JSON-LD structured data blocks: **0**
  - Repeated generic boilerplate paragraphs across >15 pages: **0**

- **Stage 2 (Real Browser / Playwright JavaScript Render Check):**
  - Pages rendered in headless Chromium: **117** (`117` HTTP 200)
  - Pages with JavaScript crashes (`pageerror`): **0**
  - Pages with broken local images: **0**
  - Pages loading 1-file `site-config.js` cleanly: **117 / 117**

## 2. AI Search & Google AdSense Readiness
- **`robots.txt` Bot Check (`Googlebot`, `Bingbot`, `GPTBot`, `ClaudeBot`, `PerplexityBot`, `Google-Extended`):** **ALL ALLOWED**
- **Key Infrastructure & Trust URLs Checked:**
- `/robots.txt` -> HTTP `200`
- `/llms.txt` -> HTTP `200`
- `/ads.txt` -> HTTP `200`
- `/site-config.js` -> HTTP `200`
- `/about` -> HTTP `200`
- `/contact` -> HTTP `200`
- `/privacy-policy` -> HTTP `200`
- `/terms` -> HTTP `200`
- `/giveaways` -> HTTP `200`
- **Protected Owner Click Proof Endpoint (`/api/clicks` without admin key):** `None`

## 3. Free Keyword Gap & Competitor Discovery (`seo_reports/keyword_gaps.csv`)
- **Missing Launch Keywords Logged:** **25**
- **Competitor Domains Scanned:**
- `www.gtabase.com`: HTTP `200` (ok, 5 headings scanned)
- `www.gtaboom.com`: HTTP `200` (ok, 9 headings scanned)
- `leonidaverse.com`: HTTP `200` (ok, 11 headings scanned)
- `gtaheistinfo.com`: HTTP `None` (error:ReadTimeout, 0 headings scanned)
- **Top Priority Keyword Gaps Woven Into Home FAQs, 6 Vault Pages, `/free`, and `/giveaways.html`:**
  - 1. gta 6 censorship in japan covers nudity and reduces gore (/ & /free/)
  - 2. gta 6 essentials (/ & /free/)
  - 3. the whole gta 6 universe (/ & /free/)
  - 4. the lore of gta 6 (/ & /free/)
  - 5. latest gta 6 content (/ & /free/)
  - 6. how to change clothes and outfits in gta 6 (/ & /free/)
  - 7. gta 6 cheats codes (/ & /free/)
  - 8. the hub that centralizes all of gta 6 (/ & /free/)

## 4. Auto-Fixer Log
- **HTML files patched during this run:** **0**
