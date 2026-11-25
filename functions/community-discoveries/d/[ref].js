import {
  CATEGORIES, STATUSES, PUBLISHABLE, VERIFIED_STATUSES, PUBLIC_LABELS, MAP_CLASSIFICATIONS,
  REPORT_REASONS, REF_RE, escapeHtml, isSubstantiveForIndex,
} from "../../_lib/cd.js";

const REGION_GUIDES = {
  "Vice City": { label: "Vice City Region Guide", href: "/locations/vice-city" },
  "Vice Beach": { label: "Vice Beach Location Guide", href: "/locations/vice-beach" },
  "Grassrivers": { label: "Grassrivers Wetlands Guide", href: "/locations/grassrivers" },
  "Leonida Keys": { label: "Leonida Keys Region Guide", href: "/locations/leonida-keys" },
  "Mt. Kalaga": { label: "Mount Kalaga Region Guide", href: "/locations/mount-kalaga" },
  "Port Gellhorn": { label: "Port Gellhorn Location Guide", href: "/port-gellhorn" },
  "Lake Leonida": { label: "Lake Leonida Guide", href: "/locations/lake-leonida" },
  "Ambrosia": { label: "Ambrosia Region Guide", href: "/locations/ambrosia" },
};

const CATEGORY_DB_LINKS = {
  hidden_location: [
    { label: "Interactive Leonida Map", href: "/map" },
    { label: "GTA 6 Secrets Hub", href: "/secrets" },
  ],
  secret_area: [
    { label: "GTA 6 Secrets Hub", href: "/secrets" },
    { label: "Interactive Leonida Map", href: "/map" },
  ],
  rare_vehicle: [
    { label: "GTA 6 Vehicles Database", href: "/vehicles" },
    { label: "Best Getaway Vehicles Guide", href: "/guides/best-getaway-vehicles-and-trunk-storage" },
  ],
  wildlife: [
    { label: "Animals & Wildlife Database", href: "/animals" },
    { label: "Legendary Hunter Animals Guide", href: "/guides/legendary-hunter-animals-guide" },
  ],
  weapons_equipment: [
    { label: "GTA 6 Weapons Database", href: "/weapons" },
    { label: "Gun Stores & Bonuses", href: "/weapons-bonuses" },
  ],
  collectible: [
    { label: "Collectibles & 100% Hub", href: "/gta-6-collectibles/" },
    { label: "100% Completion Tracker", href: "/gta-6-100-completion-tracker/" },
  ],
  safe_code: [
    { label: "GTA 6 Safe Codes Guide", href: "/guides/gta-6-safe-codes" },
    { label: "Heist Command Center", href: "/heist-command-center/" },
  ],
  mission_tip: [
    { label: "Mission Walkthrough Hub", href: "/missions/" },
    { label: "Heist Command Center", href: "/heist-command-center/" },
  ],
  glitch: [
    { label: "GTA 6 Glitches & Exploits Hub", href: "/gta-6-glitches/" },
    { label: "Troubleshooting Center", href: "/gta-6-troubleshooting/" },
  ],
  easter_egg: [
    { label: "GTA 6 Secrets & Easter Eggs", href: "/secrets" },
    { label: "New Discoveries Hub", href: "/gta-6-discoveries/" },
  ],
  side_activity: [
    { label: "GTA 6 Tips & Tricks", href: "/gta-6-tips-and-tricks/" },
    { label: "100% Completion Tracker", href: "/gta-6-100-completion-tracker/" },
  ],
  money_method: [
    { label: "GTA 6 Money Guide", href: "/gta-6-money-guide/" },
    { label: "Heist Payout Calculator", href: "/heist-payout-calculator" },
  ],
  map_correction: [
    { label: "Interactive Leonida Map", href: "/map" },
    { label: "World Database Hub", href: "/gta-6-database/" },
  ],
  general: [
    { label: "New Discoveries Hub", href: "/gta-6-discoveries/" },
    { label: "World Database Hub", href: "/gta-6-database/" },
  ],
};

function notFoundHtml(refText) {
  return new Response(
    `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="robots" content="noindex, nofollow">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Discovery Not Found | GTA6HeistGuide</title>
  <link rel="stylesheet" href="/assets/style.css?v=20261124_p26">
</head>
<body>
  <main class="container" style="max-width:760px; margin:3rem auto; padding:1.5rem;">
    <section class="tool-box">
      <h1 style="color:#fff; margin-top:0;">Discovery Not Published</h1>
      <p style="color:#cbd5e1; line-height:1.6;">
        Reference <code>${escapeHtml(refText || "Unknown")}</code> is not a published community discovery.
        Pending, unverified, or rejected submissions are never publicly accessible.
      </p>
      <div style="display:flex; gap:.75rem; flex-wrap:wrap; margin-top:1rem;">
        <a href="/community-discoveries/" class="btn btn-primary">Browse Approved Discoveries</a>
        <a href="/community-discoveries/submit/" class="btn btn-secondary">Submit a Discovery</a>
      </div>
    </section>
  </main>
</body>
</html>`,
    {
      status: 404,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
        "X-Robots-Tag": "noindex, nofollow",
      },
    }
  );
}

export async function onRequestGet({ params, env }) {
  const ref = String(params?.ref || "").trim();
  if (!REF_RE.test(ref) || !env.DB) {
    return notFoundHtml(ref);
  }

  let hasMeta = true;
  try {
    await env.DB.prepare("SELECT 1 FROM cd_verification_meta LIMIT 1").first();
  } catch {
    hasMeta = false;
  }

  const metaCols = hasMeta
    ? ", m.official_confirmed, m.authoritative_source_url, m.authoritative_source_label, m.evidence_source_summary, m.related_db_records, m.moderated_at, COALESCE(m.featured, 0) AS featured"
    : "";
  const joinSql = hasMeta
    ? "FROM cd_published p LEFT JOIN cd_submissions s ON s.id = p.submission_id LEFT JOIN cd_verification_meta m ON m.submission_id = p.submission_id"
    : "FROM cd_published p LEFT JOIN cd_submissions s ON s.id = p.submission_id";

  const row = await env.DB.prepare(
    `SELECT p.ref, p.title, p.category, p.short_explanation, p.finding_instructions, p.region, p.evidence_status,
            p.credit_name, p.public_links, p.related_guides, p.is_published, p.published_at, p.updated_at,
            p.map_approved, p.map_pin, s.platform, s.game_version, s.location_description, s.created_at AS submitted_at${metaCols}
     ${joinSql}
     WHERE p.ref = ?1 AND p.is_published = 1 AND p.evidence_status IN (${PUBLISHABLE.map(() => "?").join(",")})
     LIMIT 1`
  ).bind(ref, ...PUBLISHABLE).first();

  if (!row) {
    return notFoundHtml(ref);
  }

  // Fetch up to 3 other approved discoveries in the same region for retention
  const { results: relatedRegionRows } = await env.DB.prepare(
    `SELECT ref, title, category, evidence_status, published_at
     FROM cd_published
     WHERE is_published = 1 AND region = ?1 AND ref != ?2 AND evidence_status IN (${PUBLISHABLE.map(() => "?").join(",")})
     ORDER BY published_at DESC LIMIT 3`
  ).bind(row.region, ref, ...PUBLISHABLE).all();

  const indexable = isSubstantiveForIndex(row);
  const canonicalUrl = `https://www.gta6heistguide.com/community-discoveries/d/${encodeURIComponent(row.ref)}`;
  const catLabel = CATEGORIES[row.category] || row.category;
  const statusLabel = STATUSES[row.evidence_status] || row.evidence_status;
  const statusNotice = PUBLIC_LABELS[row.evidence_status] || "";
  const mapClass = MAP_CLASSIFICATIONS[row.evidence_status] || "Community Reported";
  const isVerified = VERIFIED_STATUSES.includes(row.evidence_status);
  const badgeClass = isVerified ? "verify-confirmed" : row.evidence_status === "CORROBORATED" ? "verify-testing" : "verify-community";

  const parseArr = (s) => { try { const a = JSON.parse(s || "[]"); return Array.isArray(a) ? a : []; } catch { return []; } };
  const safePath = (p) => typeof p === "string" && /^\/(?!\/)[A-Za-z0-9\-_/.#]*$/.test(p);

  const pubLinks = parseArr(row.public_links)
    .filter((l) => l && typeof l.url === "string" && l.url.startsWith("https://"))
    .slice(0, 5);
  const reviewerGuides = parseArr(row.related_guides).filter(safePath).slice(0, 5);
  const reviewerDb = parseArr(row.related_db_records).filter(safePath).slice(0, 5);

  let mapPin = null;
  if (row.map_approved === 1 && row.map_pin) {
    try { mapPin = JSON.parse(row.map_pin); } catch { mapPin = null; }
  }
  const mapPinId = mapPin ? `community-${row.ref}` : "";
  const mapPinUrl = mapPin ? `/map?pin=${encodeURIComponent(mapPinId)}` : "";

  const fmtDate = (iso) => (iso ? String(iso).slice(0, 10) : "—");
  const verifiedDate = fmtDate(row.moderated_at || row.published_at);

  const dbLinks = [...(CATEGORY_DB_LINKS[row.category] || CATEGORY_DB_LINKS.general)];
  if (REGION_GUIDES[row.region]) dbLinks.unshift(REGION_GUIDES[row.region]);
  reviewerDb.forEach((p) => dbLinks.push({ label: p.replace(/^\/|\/$/g, ""), href: p }));
  reviewerGuides.forEach((p) => dbLinks.push({ label: "Related Guide: " + p.replace(/^\/|\/$/g, ""), href: p }));
  const seenHref = new Set();
  const uniqueLinks = dbLinks.filter((l) => {
    if (seenHref.has(l.href)) return false;
    seenHref.add(l.href);
    return true;
  }).slice(0, 6);

  const jsonLd = indexable
    ? JSON.stringify({
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Article",
            "@id": `${canonicalUrl}#article`,
            headline: row.title,
            description: row.short_explanation.slice(0, 160),
            url: canonicalUrl,
            datePublished: row.published_at || row.updated_at,
            dateModified: row.updated_at || row.published_at,
            author: {
              "@type": "Organization",
              name: row.credit_name ? `${row.credit_name} (via GTA6HeistGuide Community)` : "GTA6HeistGuide Community Editorial",
            },
            publisher: {
              "@type": "Organization",
              name: "GTA6HeistGuide.com",
              url: "https://www.gta6heistguide.com/",
            },
            about: { "@type": "VideoGame", name: "Grand Theft Auto VI" },
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://www.gta6heistguide.com/" },
              { "@type": "ListItem", position: 2, name: "Community Discoveries", item: "https://www.gta6heistguide.com/community-discoveries/" },
              { "@type": "ListItem", position: 3, name: row.title, item: canonicalUrl },
            ],
          },
        ],
      }).replace(/</g, "\\u003c")
    : "";

  const metaDescription = `${row.short_explanation.slice(0, 145)} (${statusLabel} · ${row.region})`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <meta charset="UTF-8">
  <meta name="robots" content="${indexable ? "index, follow, max-image-preview:large" : "noindex, follow"}">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(row.title)} — GTA 6 Community Discovery | GTA6HeistGuide</title>
  <meta name="description" content="${escapeHtml(metaDescription)}">
  ${indexable ? `<link rel="canonical" href="${canonicalUrl}">` : ""}
  <link rel="stylesheet" href="/assets/style.css?v=20261124_p26">
  ${indexable ? `<script type="application/ld+json">${jsonLd}</script>` : ""}
  <style>
    .cd-detail-wrap{max-width:960px;margin:0 auto;padding:1.15rem 1rem 3.5rem;}
    .cd-detail-grid{display:grid;grid-template-columns:1fr 310px;gap:1.15rem;align-items:start;}
    @media (max-width:860px){.cd-detail-grid{grid-template-columns:1fr;}}
    .cd-kv{display:grid;grid-template-columns:130px 1fr;gap:.4rem .75rem;font-size:.84rem;color:#e2e8f0;}
    .cd-kv dt{color:#94a3b8;font-weight:700;}
    .cd-kv dd{margin:0;overflow-wrap:anywhere;}
    .cd-actions{display:flex;flex-wrap:wrap;gap:.55rem;margin-top:.85rem;}
    .cd-btn{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.18);color:#e2e8f0;padding:.52rem .9rem;border-radius:8px;font-size:.82rem;font-weight:700;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;gap:.35rem;}
    .cd-btn:hover:not(:disabled){border-color:var(--neon-cyan);color:#fff;}
    .cd-btn.is-active{background:rgba(0,240,255,.16);border-color:var(--neon-cyan);color:#fff;}
    .cd-btn.is-verified-found{background:rgba(0,255,136,.16);border-color:var(--neon-green);color:#86efac;}
    .cd-btn:disabled{opacity:.5;cursor:not-allowed;}
    .cd-notice-box{font-size:.82rem;color:var(--neon-yellow);border-left:3px solid var(--neon-yellow);padding:.55rem .75rem;background:rgba(255,184,0,.06);border-radius:0 8px 8px 0;margin:.85rem 0;}
    .cd-rel-list{display:grid;gap:.5rem;margin-top:.5rem;}
    .cd-rel-list a{color:var(--neon-cyan);text-decoration:none;font-weight:700;font-size:.85rem;}
    .cd-rel-list a:hover{text-decoration:underline;}
    .cd-report-box details{margin-top:.5rem;}
    .cd-report-box summary{cursor:pointer;color:#94a3b8;font-size:.82rem;font-weight:700;}
  </style>
</head>
<body>
<nav class="navbar" id="siteNavbar">
  <div class="nav-container">
    <a href="/" class="brand-logo" aria-label="GTA 6 Heist Guide Home"><img src="/assets/images/logo.webp" alt="GTA 6 Heist Guide" class="brand-logo-img" width="688" height="110" decoding="async"></a>
    <ul class="nav-links">
      <li><a href="/" class="nav-pill">HEISTS</a></li>
      <li><a href="/map" class="nav-pill">MAP</a></li>
      <li><a href="/my-leonida/" class="nav-pill">MY LEONIDA</a></li>
      <li><a href="/community-discoveries/" class="nav-pill active">COMMUNITY</a></li>
      <li><a href="/gta-6-database/" class="nav-pill">DATABASE</a></li>
    </ul>
  </div>
</nav>

<main class="cd-detail-wrap" id="cdDetailRoot"
  data-ref="${escapeHtml(row.ref)}"
  data-title="${escapeHtml(row.title)}"
  data-category="${escapeHtml(row.category)}"
  data-region="${escapeHtml(row.region)}"
  data-status="${escapeHtml(row.evidence_status)}"
  data-verified="${isVerified ? "1" : "0"}"
  data-map-pin-id="${escapeHtml(mapPinId)}">

  <nav aria-label="Breadcrumb" style="font-size:.78rem;color:#94a3b8;margin-bottom:.85rem;">
    <a href="/" style="color:var(--neon-cyan);text-decoration:none;font-weight:700;">Home</a> /
    <a href="/community-discoveries/" style="color:var(--neon-cyan);text-decoration:none;font-weight:700;">Community Discoveries</a> /
    <span style="color:#e2e8f0;font-weight:700;">${escapeHtml(row.ref)}</span>
  </nav>

  <header class="tool-box pink-glow" style="margin-bottom:1.15rem;">
    <div style="display:flex;flex-wrap:wrap;gap:.5rem;align-items:center;margin-bottom:.55rem;">
      <span class="verify-badge ${badgeClass}">${escapeHtml(statusLabel)}</span>
      <span style="font-family:var(--font-mono);font-size:.75rem;color:#94a3b8;">${escapeHtml(catLabel)} · ${escapeHtml(row.region)} · Ref ${escapeHtml(row.ref)}</span>
    </div>
    <h1 style="color:#fff;font-size:clamp(1.45rem,3vw,2.1rem);margin:0 0 .5rem;">${escapeHtml(row.title)}</h1>
    <div class="cd-notice-box">${escapeHtml(statusNotice)}</div>
    <div class="cd-actions">
      <button type="button" class="cd-btn" id="cdSaveBtn">☆ Save to My Leonida</button>
      ${mapPin ? `<button type="button" class="cd-btn" id="cdBookmarkPinBtn">📌 Bookmark Map Location</button>` : ""}
      <button type="button" class="cd-btn" id="cdFoundBtn" ${isVerified ? "" : 'disabled title="Only Verified in Gameplay or Officially Confirmed discoveries can be marked as found."'}>
        ${isVerified ? "✓ Mark Verified Discovery Found" : "🔒 Verification Required to Mark Found"}
      </button>
      ${mapPin ? `<a href="${escapeHtml(mapPinUrl)}" class="btn btn-primary" id="cdOpenMapBtn" style="padding:.52rem .95rem;font-size:.82rem;">🗺️ Open on Leonida Map &rarr;</a>` : ""}
    </div>
    <p id="cdSyncMsg" style="font-size:.78rem;color:var(--neon-cyan);margin:.5rem 0 0;min-height:1.1rem;" role="status" aria-live="polite"></p>
  </header>

  <div class="cd-detail-grid">
    <article style="display:grid;gap:1rem;">
      <section class="tool-box">
        <h2 style="color:#fff;font-size:1.12rem;margin:0 0 .5rem;">Discovery Summary</h2>
        <p style="color:#cbd5e1;font-size:.94rem;line-height:1.65;margin:0;white-space:pre-line;">${escapeHtml(row.short_explanation)}</p>
      </section>

      ${row.location_description ? `<section class="tool-box">
        <h2 style="color:#fff;font-size:1.12rem;margin:0 0 .5rem;">Where It Was Found</h2>
        <p style="color:#cbd5e1;font-size:.92rem;line-height:1.6;margin:0;white-space:pre-line;">${escapeHtml(row.location_description)}</p>
      </section>` : ""}

      <section class="tool-box">
        <h2 style="color:#fff;font-size:1.12rem;margin:0 0 .5rem;">How to Find It</h2>
        <p style="color:#e2e8f0;font-size:.92rem;line-height:1.65;margin:0;white-space:pre-line;">${escapeHtml(row.finding_instructions)}</p>
      </section>

      ${mapPin ? `<section class="tool-box">
        <h2 style="color:#fff;font-size:1.12rem;margin:0 0 .5rem;">Approved Map Location</h2>
        <p style="color:#cbd5e1;font-size:.86rem;line-height:1.55;margin:0 0 .7rem;">
          Classification on map: <strong>${escapeHtml(mapClass)}</strong> · Region: <strong>${escapeHtml(mapPin.region || row.region)}</strong>
          · Coordinates: <code>${escapeHtml(String(mapPin.xPct))}, ${escapeHtml(String(mapPin.yPct))}</code>.
          Community pins remain clearly separated from the 188 established verified completion pins.
        </p>
        <a href="${escapeHtml(mapPinUrl)}" class="btn btn-primary" data-cd-map-link="1" style="padding:.52rem 1rem;font-size:.82rem;">Open Pin on Interactive Map &rarr;</a>
      </section>` : ""}

      ${(relatedRegionRows && relatedRegionRows.length) ? `<section class="tool-box">
        <h2 style="color:#fff;font-size:1.05rem;margin:0 0 .5rem;">More Approved Discoveries in ${escapeHtml(row.region)}</h2>
        <div class="cd-rel-list">
          ${relatedRegionRows.map((rr) => `<a href="/community-discoveries/d/${encodeURIComponent(rr.ref)}">${escapeHtml(rr.title)} <span style="color:#94a3b8;font-weight:400;">(${escapeHtml(STATUSES[rr.evidence_status] || rr.evidence_status)})</span></a>`).join("")}
        </div>
      </section>` : ""}
    </article>

    <aside style="display:grid;gap:1rem;">
      <section class="tool-box">
        <h2 style="color:var(--neon-cyan);font-size:.95rem;text-transform:uppercase;margin:0 0 .65rem;">Evidence &amp; Verification</h2>
        <dl class="cd-kv">
          <dt>Classification</dt><dd>${escapeHtml(statusLabel)}</dd>
          <dt>Region</dt><dd>${escapeHtml(row.region)}</dd>
          <dt>Category</dt><dd>${escapeHtml(catLabel)}</dd>
          <dt>Submitted</dt><dd>${escapeHtml(fmtDate(row.submitted_at))}</dd>
          <dt>Verified / Reviewed</dt><dd>${escapeHtml(verifiedDate)}</dd>
          ${row.platform ? `<dt>Platform</dt><dd>${escapeHtml(row.platform)}</dd>` : ""}
          ${row.game_version ? `<dt>Game Version</dt><dd>${escapeHtml(row.game_version)}</dd>` : ""}
          ${row.evidence_source_summary ? `<dt>Evidence Source</dt><dd>${escapeHtml(row.evidence_source_summary)}</dd>` : ""}
          ${row.credit_name ? `<dt>Contributor</dt><dd>${escapeHtml(row.credit_name)}</dd>` : `<dt>Contributor</dt><dd>Anonymous community contributor</dd>`}
        </dl>
        ${row.authoritative_source_url ? `<div style="margin-top:.75rem;padding-top:.65rem;border-top:1px solid rgba(255,255,255,.1);font-size:.82rem;">
          <strong style="color:var(--neon-green);">Authoritative Source:</strong><br>
          <a href="${escapeHtml(row.authoritative_source_url)}" target="_blank" rel="noopener noreferrer" style="color:var(--neon-cyan);">${escapeHtml(row.authoritative_source_label || "Official Reference")} &nearr;</a>
        </div>` : ""}
        ${pubLinks.length ? `<div style="margin-top:.75rem;padding-top:.65rem;border-top:1px solid rgba(255,255,255,.1);font-size:.82rem;">
          <strong style="color:#e2e8f0;">Reviewed Evidence Links:</strong>
          <ul style="margin:.35rem 0 0;padding-left:1.1rem;">
            ${pubLinks.map((l) => `<li><a href="${escapeHtml(l.url)}" target="_blank" rel="nofollow ugc noopener noreferrer" style="color:var(--neon-cyan);">${escapeHtml(l.label || "Reference")}</a></li>`).join("")}
          </ul>
        </div>` : ""}
      </section>

      <section class="tool-box">
        <h2 style="color:var(--neon-cyan);font-size:.95rem;text-transform:uppercase;margin:0 0 .5rem;">Related Guides &amp; Database</h2>
        <div class="cd-rel-list">
          ${uniqueLinks.map((l) => `<a href="${escapeHtml(l.href)}" data-related-guide="1">${escapeHtml(l.label)} &rarr;</a>`).join("")}
          <a href="/my-leonida/">🌴 View Saved Items in My Leonida &rarr;</a>
        </div>
      </section>

      <section class="tool-box cd-report-box">
        <details>
          <summary>Report an issue or patch change</summary>
          <form id="cdReportForm" style="display:grid;gap:.55rem;margin-top:.65rem;">
            <label style="font-size:.78rem;color:#cbd5e1;">Reason
              <select name="reason" class="form-select" required style="width:100%;margin-top:.25rem;">
                ${Object.entries(REPORT_REASONS).map(([k, v]) => `<option value="${escapeHtml(k)}">${escapeHtml(v)}</option>`).join("")}
              </select>
            </label>
            <label style="font-size:.78rem;color:#cbd5e1;">Details (optional, max 500 chars)
              <textarea name="details" class="form-input" rows="2" maxlength="500" placeholder="Patch version, correction, or broken link note..." style="width:100%;margin-top:.25rem;"></textarea>
            </label>
            <button type="submit" class="btn btn-secondary" id="cdReportSubmit" style="padding:.45rem .8rem;font-size:.78rem;">Send Correction Note</button>
            <div id="cdReportMsg" style="font-size:.76rem;" role="status" aria-live="polite"></div>
          </form>
        </details>
      </section>
    </aside>
  </div>
</main>

<script src="/assets/js/gta6-progress-store.js"></script>
<script src="/site-config.js"></script>
<script src="/assets/community/cd-detail.js?v=20261124_p29"></script>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=120",
      "X-Content-Type-Options": "nosniff",
      "X-Robots-Tag": indexable ? "index, follow" : "noindex, follow",
    },
  });
}
