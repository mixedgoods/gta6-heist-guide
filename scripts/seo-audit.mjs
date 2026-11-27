#!/usr/bin/env node
/**
 * GTA6HeistGuide.com — Expanded Production SEO & Guardrails Audit (scripts/seo-audit.mjs)
 *
 * Validates:
 * 1. JSON-LD parsing & Schema.org validity across indexable pages
 * 2. Missing or duplicate <title> & <meta name="description">
 * 3. Missing, duplicate, or broken <link rel="canonical">
 * 4. public/sitemap.xml URLs matching page canonicals & resolving cleanly to files
 * 5. Robots meta directives / accidental noindex + max-image-preview:large + robots.txt
 * 6. Valid public/image-sitemap.xml, existing local image files, and HTML <img> alt tags
 * 7. Broken internal links (excluding intentionally non-indexable utility/search pages)
 * 8. Monetization & quality guardrails (ZERO whop.com, ZERO G FUEL, 4 Amazon cards on homepage)
 *
 * Output strictly separated into:
 * - FATAL ERRORS (exit code 1 — blocks deployment)
 * - WARNINGS (reported for human review — NEVER auto-rewrites content)
 * - INFO (coverage summary)
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');
const CANONICAL_ORIGIN = 'https://www.gta6heistguide.com';

const NON_INDEXABLE_SKIP = new Set([
  'syndicate-command.html',
  'google29e7fdcf68272179.html',
  'googlec63f7e8032408675.html',
]);

// Known intentionally mirrored alias HTML files that carry canonical pointing to their primary URL
const KNOWN_ALIAS_FILES = new Set([
  'vehicles-getaway-cars.html',
  'weapons-gear.html',
  'money-guide.html',
  'save-planner.html',
  'free.html',
  'interactive-map.html',
  'leonida-interactive-map.html',
  'calculator.html',
  'live.html',
  'acquisitions.html',
  'affiliates-gear.html',
  'everglades-smuggler-run.html',
  'leonida-reserve.html',
  'ocean-drive-armored-convoy.html',
  'port-gellhorn.html',
  'sinfrontera-bank.html',
  'vice-city-yacht-heist.html',
]);

function walkHtml(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (['assets', 'data', 'embed', 'cloud-mirrors', 'pins', 'guides'].includes(ent.name)) continue;
      walkHtml(full, out);
    } else if (ent.name.endsWith('.html')) {
      out.push(full);
    }
  }
  return out;
}

function loadRedirectSources() {
  const redirects = new Set();
  const fp = path.join(PUBLIC_DIR, '_redirects');
  if (!fs.existsSync(fp)) return redirects;
  for (const line of fs.readFileSync(fp, 'utf-8').split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const parts = t.split(/\s+/);
    if (parts.length >= 2) {
      redirects.add(parts[0].replace(/\*$/, ''));
    }
  }
  return redirects;
}

function resolvePublicPath(webPath) {
  const clean = String(webPath || '').split('?')[0].split('#')[0];
  if (!clean.startsWith('/')) return null;
  if (clean === '/') {
    const idx = path.join(PUBLIC_DIR, 'index.html');
    return fs.existsSync(idx) ? idx : null;
  }
  const rel = clean.slice(1);
  const direct = path.join(PUBLIC_DIR, rel);
  if (fs.existsSync(direct) && fs.statSync(direct).isFile()) return direct;
  if (clean.endsWith('/')) {
    const idx = path.join(PUBLIC_DIR, rel, 'index.html');
    if (fs.existsSync(idx) && fs.statSync(idx).isFile()) return idx;
  }
  const htmlAlt = direct + '.html';
  if (fs.existsSync(htmlAlt) && fs.statSync(htmlAlt).isFile()) return htmlAlt;
  const dirIdx = path.join(direct, 'index.html');
  if (fs.existsSync(dirIdx) && fs.statSync(dirIdx).isFile()) return dirIdx;
  return null;
}

function extractMetaContent(html, attrName, attrVal) {
  const rx1 = new RegExp(`<meta[^>]+${attrName}=["']${attrVal}["'][^>]+content=["']([^"']*)["']`, 'i');
  const rx2 = new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+${attrName}=["']${attrVal}["']`, 'i');
  const m = html.match(rx1) || html.match(rx2);
  return m ? m[1].trim() : null;
}

function extractCanonical(html) {
  const m =
    html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']*)["']/i) ||
    html.match(/<link[^>]+href=["']([^"']*)["'][^>]+rel=["']canonical["']/i);
  return m ? m[1].trim() : null;
}

function runAudit() {
  const fatal = [];
  const warnings = [];
  const info = [];

  const redirectSources = loadRedirectSources();
  const allHtmlFiles = walkHtml(PUBLIC_DIR);

  const titlesMap = new Map();
  const descsMap = new Map();
  const canonicalsMap = new Map();
  const pageDataByUrl = new Map();

  let jsonLdTotal = 0;
  let checkedPrimaryPages = 0;
  let totalInternalLinksChecked = 0;
  let totalImgsChecked = 0;

  // 1. Audit HTML pages
  for (const fullPath of allHtmlFiles) {
    const rel = path.relative(PUBLIC_DIR, fullPath).replace(/\\/g, '/');
    if (NON_INDEXABLE_SKIP.has(rel)) continue;

    const html = fs.readFileSync(fullPath, 'utf-8');
    const isAlias = KNOWN_ALIAS_FILES.has(rel);
    const robots = extractMetaContent(html, 'name', 'robots') || '';
    const isNoindex = /\bnoindex\b/i.test(robots);

    // Monetization guardrails (check every HTML page)
    if (/whop\.com/i.test(html)) {
      fatal.push(`[GUARDRAIL] Prohibited whop.com reference found in ${rel}`);
    }
    if (/\bg\s*fuel\b/i.test(html)) {
      fatal.push(`[GUARDRAIL] Prohibited G FUEL reference found in ${rel}`);
    }

    if (isNoindex) {
      info.push(`Skipped intentionally noindex page: ${rel}`);
      continue;
    }

    const titleM = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const title = titleM ? titleM[1].replace(/\s+/g, ' ').trim() : '';
    const desc = extractMetaContent(html, 'name', 'description') || '';
    const canonical = extractCanonical(html);

    // JSON-LD validation (FATAL if malformed JSON or missing @context/@type/@graph)
    const ldRx = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
    let ldM;
    while ((ldM = ldRx.exec(html)) !== null) {
      jsonLdTotal++;
      try {
        const parsed = JSON.parse(ldM[1]);
        if (!parsed || typeof parsed !== 'object') {
          fatal.push(`[JSON-LD] Non-object JSON-LD block in ${rel}`);
        } else if (!parsed['@context']) {
          fatal.push(`[JSON-LD] Missing @context in ${rel}`);
        } else if (!parsed['@type'] && !Array.isArray(parsed['@graph'])) {
          fatal.push(`[JSON-LD] Missing @type or @graph in ${rel}`);
        }
      } catch (err) {
        fatal.push(`[JSON-LD] Invalid JSON-LD syntax in ${rel}: ${err.message}`);
      }
    }

    if (!isAlias) {
      checkedPrimaryPages++;

      if (!title) fatal.push(`[META] Missing <title> in ${rel}`);
      else {
        if (!titlesMap.has(title)) titlesMap.set(title, []);
        titlesMap.get(title).push(rel);
      }

      if (!desc) warnings.push(`[META] Missing meta description in ${rel}`);
      else {
        if (!descsMap.has(desc)) descsMap.set(desc, []);
        descsMap.get(desc).push(rel);
      }

      if (!canonical) {
        fatal.push(`[CANONICAL] Missing <link rel="canonical"> in ${rel}`);
      } else {
        if (!canonical.startsWith(CANONICAL_ORIGIN)) {
          fatal.push(`[CANONICAL] Non-canonical or relative URL in ${rel}: ${canonical}`);
        } else {
          try {
            const canonPath = new URL(canonical).pathname;
            if (!resolvePublicPath(canonPath)) {
              fatal.push(`[CANONICAL] Canonical URL does not resolve to a file in ${rel}: ${canonical}`);
            }
          } catch (err) {
            fatal.push(`[CANONICAL] Invalid canonical URL in ${rel}: ${canonical}`);
          }
        }
        if (!canonicalsMap.has(canonical)) canonicalsMap.set(canonical, []);
        canonicalsMap.get(canonical).push(rel);
        pageDataByUrl.set(canonical, { rel, isNoindex, title, desc, robots });
      }

      if (!/max-image-preview\s*:\s*large/i.test(robots)) {
        warnings.push(`[DISCOVER] Missing max-image-preview:large robots directive in ${rel}`);
      }

      // Check OG image exists locally if referencing our domain
      const ogImg = extractMetaContent(html, 'property', 'og:image');
      if (!ogImg) {
        warnings.push(`[OG] Missing og:image in ${rel}`);
      } else if (ogImg.startsWith(CANONICAL_ORIGIN)) {
        const imgPath = ogImg.slice(CANONICAL_ORIGIN.length);
        if (!resolvePublicPath(imgPath)) {
          fatal.push(`[OG] Broken og:image file in ${rel}: ${imgPath}`);
        }
      }

      // Check HTML <img> tags (ignore template strings inside <script>)
      const htmlNoScripts = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
      const imgRx = /<img\b[^>]*>/gi;
      let im;
      while ((im = imgRx.exec(htmlNoScripts)) !== null) {
        totalImgsChecked++;
        const tag = im[0];
        const srcM = tag.match(/\bsrc=["']([^"']+)["']/i);
        const altM = tag.match(/\balt=["']([^"']*)["']/i);
        if (!altM || !altM[1].trim()) {
          warnings.push(`[IMG] Missing or empty alt attribute in ${rel}: ${tag.slice(0, 90)}`);
        }
        if (srcM) {
          const src = srcM[1];
          if (src.startsWith('/') && !src.startsWith('//') && !resolvePublicPath(src)) {
            fatal.push(`[IMG] Broken local <img src="${src}"> in ${rel}`);
          }
        }
      }

      // Check internal <a href="/..."> links (outside <script>)
      const linkRx = /<a\b[^>]*\bhref=["'](\/[^"']*)["']/gi;
      let lm;
      while ((lm = linkRx.exec(htmlNoScripts)) !== null) {
        const href = lm[1];
        if (href.startsWith('//') || href.startsWith('/api/') || href.startsWith('/rss.xml') || href.startsWith('/sitemap.xml') || href.startsWith('/image-sitemap.xml')) {
          continue;
        }
        totalInternalLinksChecked++;
        const cleanPath = href.split('?')[0].split('#')[0];
        if (!cleanPath || cleanPath === '/') continue;
        if (resolvePublicPath(cleanPath)) continue;
        if (redirectSources.has(cleanPath)) continue;
        fatal.push(`[LINK] Broken internal link "${href}" in ${rel}`);
      }
    }
  }

  // Check duplicate titles, descriptions, canonicals among primary pages
  for (const [t, files] of titlesMap.entries()) {
    if (files.length > 1) warnings.push(`[DUP-TITLE] Duplicate <title> "${t.slice(0, 60)}" in: ${files.join(', ')}`);
  }
  for (const [d, files] of descsMap.entries()) {
    if (files.length > 1) warnings.push(`[DUP-DESC] Duplicate meta description in: ${files.join(', ')}`);
  }
  for (const [c, files] of canonicalsMap.entries()) {
    if (files.length > 1) fatal.push(`[DUP-CANONICAL] Duplicate canonical "${c}" claimed by multiple primary files: ${files.join(', ')}`);
  }

  // 2. Validate public/sitemap.xml
  const sitemapPath = path.join(PUBLIC_DIR, 'sitemap.xml');
  let sitemapUrlCount = 0;
  if (!fs.existsSync(sitemapPath)) {
    fatal.push('[SITEMAP] Missing public/sitemap.xml');
  } else {
    const smXml = fs.readFileSync(sitemapPath, 'utf-8');
    if (!/<urlset\b/.test(smXml) || !/<\/urlset>/.test(smXml)) {
      fatal.push('[SITEMAP] Malformed public/sitemap.xml (missing <urlset> root)');
    }
    const locRx = /<loc>(https?:\/\/[^<]+)<\/loc>/gi;
    const seenLocs = new Set();
    let sm;
    while ((sm = locRx.exec(smXml)) !== null) {
      sitemapUrlCount++;
      const loc = sm[1].trim();
      if (seenLocs.has(loc)) {
        fatal.push(`[SITEMAP] Duplicate <loc> in sitemap.xml: ${loc}`);
      }
      seenLocs.add(loc);
      if (!loc.startsWith(CANONICAL_ORIGIN)) {
        fatal.push(`[SITEMAP] Non-canonical host in sitemap.xml: ${loc}`);
        continue;
      }
      const p = new URL(loc).pathname;
      const fp = resolvePublicPath(p);
      if (!fp) {
        fatal.push(`[SITEMAP] Sitemap URL does not resolve to a file: ${loc}`);
        continue;
      }
      const html = fs.readFileSync(fp, 'utf-8');
      const robots = extractMetaContent(html, 'name', 'robots') || '';
      if (/\bnoindex\b/i.test(robots)) {
        fatal.push(`[SITEMAP] Sitemap URL is marked noindex: ${loc}`);
      }
      const pageCanon = extractCanonical(html);
      if (pageCanon && pageCanon !== loc) {
        fatal.push(`[SITEMAP] Sitemap URL (${loc}) does not match page canonical (${pageCanon})`);
      }
    }
  }

  // 3. Validate public/image-sitemap.xml
  const imgSitemapPath = path.join(PUBLIC_DIR, 'image-sitemap.xml');
  let imgSitemapUrls = 0;
  let imgSitemapImages = 0;
  if (!fs.existsSync(imgSitemapPath)) {
    fatal.push('[IMAGE-SITEMAP] Missing public/image-sitemap.xml');
  } else {
    const imXml = fs.readFileSync(imgSitemapPath, 'utf-8');
    if (!imXml.includes('http://www.google.com/schemas/sitemap-image/1.1') || !/<\/urlset>/.test(imXml)) {
      fatal.push('[IMAGE-SITEMAP] Invalid Google image sitemap namespace or closing tag');
    }
    const urlBlocks = imXml.match(/<url>[\s\S]*?<\/url>/gi) || [];
    for (const block of urlBlocks) {
      imgSitemapUrls++;
      const locM = block.match(/<loc>(https?:\/\/[^<]+)<\/loc>/i);
      if (!locM) {
        fatal.push('[IMAGE-SITEMAP] <url> block missing <loc>');
        continue;
      }
      const loc = locM[1].trim();
      if (!loc.startsWith(CANONICAL_ORIGIN) || !resolvePublicPath(new URL(loc).pathname)) {
        fatal.push(`[IMAGE-SITEMAP] Canonical page <loc> does not resolve: ${loc}`);
      }
      const imgLocRx = /<image:loc>(https?:\/\/[^<]+)<\/image:loc>/gi;
      let im;
      while ((im = imgLocRx.exec(block)) !== null) {
        imgSitemapImages++;
        const imgUrl = im[1].trim();
        if (!imgUrl.startsWith(CANONICAL_ORIGIN)) {
          fatal.push(`[IMAGE-SITEMAP] External or non-canonical <image:loc>: ${imgUrl}`);
        } else {
          const imgPath = imgUrl.slice(CANONICAL_ORIGIN.length);
          if (!resolvePublicPath(imgPath)) {
            fatal.push(`[IMAGE-SITEMAP] Missing image file on disk: ${imgPath}`);
          }
        }
      }
    }
  }

  // 4. Validate robots.txt
  const robotsPath = path.join(PUBLIC_DIR, 'robots.txt');
  if (!fs.existsSync(robotsPath)) {
    fatal.push('[ROBOTS] Missing public/robots.txt');
  } else {
    const rtxt = fs.readFileSync(robotsPath, 'utf-8');
    if (/Disallow:\s*\/\s*$/m.test(rtxt)) {
      fatal.push('[ROBOTS] Accidental site-wide Disallow: / in public/robots.txt');
    }
    if (!rtxt.includes('Sitemap: https://www.gta6heistguide.com/sitemap.xml')) {
      warnings.push('[ROBOTS] sitemap.xml directive missing in public/robots.txt');
    }
    if (!rtxt.includes('Sitemap: https://www.gta6heistguide.com/image-sitemap.xml')) {
      warnings.push('[ROBOTS] image-sitemap.xml directive missing in public/robots.txt');
    }
  }

  // 5. Configuration-aware homepage & sitewide Amazon monetization guardrail
  const homeHtml = fs.readFileSync(path.join(PUBLIC_DIR, 'index.html'), 'utf-8');
  const siteConfigPath = path.join(PUBLIC_DIR, 'site-config.js');
  const siteConfigSource = fs.existsSync(siteConfigPath) ? fs.readFileSync(siteConfigPath, 'utf-8') : null;
  const settingsPath = path.join(PUBLIC_DIR, 'gta-6-settings', 'index.html');
  const settingsHtml = fs.existsSync(settingsPath) ? fs.readFileSync(settingsPath, 'utf-8') : null;
  const gearMasterPath = path.join(PUBLIC_DIR, 'data', 'gear-products-master.json');
  const gearMasterRaw = fs.existsSync(gearMasterPath) ? fs.readFileSync(gearMasterPath, 'utf-8') : null;

  const guardrailResult = evaluateHomepageAmazonGuardrail({
    siteConfigSource,
    homeHtml,
    settingsHtml,
    gearMasterRaw,
  });
  for (const err of guardrailResult.fatal) fatal.push(err);
  for (const warn of guardrailResult.warnings) warnings.push(warn);
  for (const note of guardrailResult.info) info.push(note);

  info.push(`Primary HTML pages audited: ${checkedPrimaryPages}`);
  info.push(`JSON-LD blocks parsed & validated: ${jsonLdTotal}`);
  info.push(`Sitemap canonical URLs validated: ${sitemapUrlCount}`);
  info.push(`Image Sitemap: ${imgSitemapUrls} canonical pages, ${imgSitemapImages} verified <image:loc> URLs`);
  info.push(`HTML <img> tags checked: ${totalImgsChecked}`);
  info.push(`Internal links checked: ${totalInternalLinksChecked}`);

  console.log('==============================================================');
  console.log('  GTA6HEISTGUIDE.COM — SEO & GUARDRAILS AUDIT REPORT');
  console.log('==============================================================');
  console.log(`\n[INFO] (${info.length}):`);
  for (const line of info) console.log(`  • ${line}`);

  console.log(`\n[WARNINGS] (${warnings.length}) — Human review (no auto-rewrites):`);
  if (warnings.length === 0) console.log('  (none)');
  else for (const w of warnings) console.log(`  ⚠ ${w}`);

  console.log(`\n[FATAL ERRORS] (${fatal.length}) — Blocks deployment:`);
  if (fatal.length === 0) console.log('  ✓ ZERO FATAL ERRORS — PASS');
  else for (const f of fatal) console.log(`  ✖ ${f}`);

  if (fatal.length > 0) {
    process.exit(1);
  }
}

export function parseSiteConfigAmazonSettings(siteConfigSource) {
  if (typeof siteConfigSource !== 'string' || !siteConfigSource.trim()) {
    return { valid: false, error: 'Missing public/site-config.js content' };
  }
  const flagMatch = siteConfigSource.match(/\benableAmazonProductPlacements\s*:\s*([^,\r\n}]+)/);
  if (!flagMatch) {
    return { valid: false, error: 'Missing enableAmazonProductPlacements key in public/site-config.js' };
  }
  const rawFlag = flagMatch[1].replace(/\/\/.*$/, '').trim();
  if (rawFlag !== 'true' && rawFlag !== 'false') {
    return {
      valid: false,
      error: `Invalid enableAmazonProductPlacements value "${rawFlag}" in public/site-config.js (expected boolean true or false)`,
    };
  }
  const tagMatch = siteConfigSource.match(/\bamazonTag\s*:\s*["']([^"']+)["']/);
  if (!tagMatch || !tagMatch[1].trim()) {
    return { valid: false, error: 'Missing amazonTag in public/site-config.js' };
  }
  return {
    valid: true,
    enableAmazonProductPlacements: rawFlag === 'true',
    amazonTag: tagMatch[1].trim(),
  };
}

export function evaluateHomepageAmazonGuardrail({
  siteConfigSource,
  homeHtml,
  settingsHtml = null,
  gearMasterRaw = null,
  expectedTag = 'gta6heistguid-20',
}) {
  const fatal = [];
  const warnings = [];
  const info = [];

  const parsed = parseSiteConfigAmazonSettings(siteConfigSource);
  if (!parsed.valid) {
    fatal.push(`[GUARDRAIL] ${parsed.error}`);
    return { fatal, warnings, info, enabled: null };
  }

  const activeTag = parsed.amazonTag;
  if (expectedTag && activeTag !== expectedTag) {
    fatal.push(`[GUARDRAIL] Unexpected amazonTag "${activeTag}" in public/site-config.js (expected "${expectedTag}")`);
  }

  const html = String(homeHtml || '');
  const hasDisclosure = /As an Amazon Associate I earn from qualifying purchases/i.test(html);
  if (!hasDisclosure) {
    fatal.push('[GUARDRAIL] Missing required Amazon Associates disclosure on homepage');
  }

  // Validate any static Amazon URLs on homepage have valid Amazon hostname and expected tracking tag
  const amazonHrefs = [...html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>/gi)]
    .map((m) => m[1])
    .filter((href) => /amazon\.|amzn\.to|tag=/i.test(href));
  for (const href of amazonHrefs) {
    let u;
    try {
      u = new URL(href, CANONICAL_ORIGIN);
    } catch {
      fatal.push(`[GUARDRAIL] Malformed affiliate URL on homepage: ${href}`);
      continue;
    }
    if (!/(?:^|\.)amazon\.com$/i.test(u.hostname) && !/(?:^|\.)amzn\.to$/i.test(u.hostname)) {
      fatal.push(`[GUARDRAIL] Invalid Amazon affiliate destination hostname on homepage: ${u.hostname}`);
      continue;
    }
    if (u.searchParams.get('tag') !== activeTag) {
      fatal.push(`[GUARDRAIL] Homepage Amazon URL missing expected tag "${activeTag}": ${href}`);
    }
  }

  if (parsed.enableAmazonProductPlacements) {
    const tagRegex = new RegExp(activeTag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    const amazonTagMatches = html.match(tagRegex) || [];
    const amzCardCount = (html.match(/class=["'][^"']*\bamz-card\b[^"']*["']/gi) || []).length;
    const amzLinkCount = amazonHrefs.filter((href) => /amazon\.com|amzn\.to/i.test(href)).length;
    const effectiveCount = Math.max(amazonTagMatches.length, amzCardCount, amzLinkCount);
    if (effectiveCount < 4) {
      fatal.push(`[GUARDRAIL] Homepage Amazon placements enabled, expected 4+ Amazon affiliate references on homepage, found ${effectiveCount}`);
    } else if (amzLinkCount > 0 && amzLinkCount < 4 && amzCardCount < 4 && amazonTagMatches.length < 4) {
      fatal.push(`[GUARDRAIL] Homepage Amazon placements enabled, expected 4+ product links, found ${amzLinkCount}`);
    }
    info.push(`Homepage Amazon guardrail: enabled (true) — ${effectiveCount} homepage references verified with tag ${activeTag}`);
  } else {
    // Verify homepage Amazon placement modules remain intentionally paused (hidden) with zero unauthorized visible cards
    const moduleTags = [...html.matchAll(/<section\b[^>]*data-amazon-placement-module=["']1["'][^>]*>/gi)];
    for (const m of moduleTags) {
      if (!/\bhidden\b/i.test(m[0])) {
        fatal.push('[GUARDRAIL] Unauthorized visible homepage Amazon placement module detected while enableAmazonProductPlacements is false');
      }
    }
    // Strip hidden data-amazon-placement-module sections before checking for unauthorized visible .amz-card blocks
    const withoutHiddenModules = html.replace(
      /<section\b[^>]*data-amazon-placement-module=["']1["'][^>]*\bhidden\b[^>]*>[\s\S]*?<\/section>/gi,
      ''
    );
    const unauthorizedCards = (withoutHiddenModules.match(/class=["'][^"']*\bamz-card\b[^"']*["']/gi) || []).length;
    if (unauthorizedCards > 0) {
      fatal.push(`[GUARDRAIL] Found ${unauthorizedCards} unauthorized visible .amz-card placement(s) on homepage while enableAmazonProductPlacements is false`);
    }
    info.push(`Homepage Amazon guardrail: intentionally paused (enableAmazonProductPlacements: false) — 0 unauthorized visible homepage cards`);
  }

  // Verify dedicated monetization pages (Gaming Gear catalog & Settings) were not accidentally disabled
  if (gearMasterRaw !== null) {
    try {
      const catalog = JSON.parse(gearMasterRaw);
      const activeProducts = (catalog.products || []).filter((p) => p.active !== false);
      if (activeProducts.length < 50) {
        fatal.push(`[GUARDRAIL] Dedicated Gaming Gear catalog unexpectedly low: expected 50+ active products, found ${activeProducts.length}`);
      }
      const badCatalogLinks = activeProducts.filter(
        (p) => !p.amazonSpecialLink || !p.amazonSpecialLink.startsWith('https://www.amazon.com/dp/') || !p.amazonSpecialLink.includes(`tag=${activeTag}`)
      );
      if (badCatalogLinks.length > 0) {
        fatal.push(`[GUARDRAIL] Gaming Gear catalog has ${badCatalogLinks.length} active product(s) with invalid Amazon destination or missing tag "${activeTag}"`);
      }
    } catch (err) {
      fatal.push(`[GUARDRAIL] Failed to parse public/data/gear-products-master.json: ${err.message}`);
    }
  }

  if (settingsHtml !== null) {
    const settingsCardCount = (settingsHtml.match(/<article\b[^>]*class=["'][^"']*\bamz-card\b[^"']*["']/gi) || []).length;
    if (settingsCardCount < 14) {
      fatal.push(`[GUARDRAIL] Dedicated Settings page Amazon cards unexpectedly low: expected 14+, found ${settingsCardCount}`);
    }
    if (!/As an Amazon Associate I earn from qualifying purchases/i.test(settingsHtml)) {
      fatal.push('[GUARDRAIL] Missing Amazon Associates disclosure on /gta-6-settings/');
    }
  }

  return { fatal, warnings, info, enabled: parsed.enableAmazonProductPlacements, amazonTag: activeTag };
}

export { runAudit };

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  runAudit();
}
