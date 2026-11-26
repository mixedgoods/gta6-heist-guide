// ==========================================================================
// GTA6HEISTGUIDE.COM — REUSABLE WORLD DATABASE ENGINE (v1.0)
// Shared, expandable dark cyberpunk database engine reading separate
// category JSON files (Vehicles, Properties, Weapons, Gun Stores, Radio,
// Animals & future categories like Businesses, Clothing, Restaurants, Collectibles).
//
// Features:
// - Category-specific search, sorting, and filter controls
// - Tailored category cards + detail modal (ZERO affiliate bars inside modals)
// - Lightweight side-by-side "Compare (up to 3)" modal using verified fields only
// - Favorites & Owned/Collected toggles synced to GTA6Progress (Pass 2 store)
//   with full JSON backup/restore compatibility
// - Strict Map Pin verification against /data/map-pins.json (ZERO dead map links)
// - Strict Related Links verification (ZERO broken links)
// - Strict Image Quality Guardrail (verified real screenshots only; dark
//   styled "Screenshot needed" placeholder otherwise)
// - Lean verification metadata: sourceUrl, verificationStatus, lastUpdated
// ==========================================================================
(function (global) {
  'use strict';

  if (global.GTA6WorldDB && global.GTA6WorldDB.__version === '1.2') {
    return;
  }

  var MAP_PINS_URL = '/data/map-pins.json';
  var mapPinIdsPromise = null;
  var verifiedPinSet = null;
  var stylesInjected = false;
  var activeInstances = [];

  // Verified internal routes allowlist for Related Links (zero broken links)
  var VERIFIED_SITE_ROUTES = new Set([
    '/',
    '/map.html',
    '/weapons.html',
    '/weapons-bonuses.html',
    '/vehicles.html',
    '/properties.html',
    '/animals.html',
    '/radio.html',
    '/cheats.html',
    '/secrets.html',
    '/drops.html',
    '/settings.html',
    '/heist-planner',
    '/heist-payout-calculator.html',
    '/gta-6-database/',
    '/gta-6-money-guide/',
    '/gta-6-tips-and-tricks/',
    '/gta-6-tools/',
    '/gta-6-discoveries/',
    '/gta-6-glitches/',
    '/save-planner/',
    '/free/',
    '/heists/the-cartel-heist.html',
    '/heists/vcia-takedown.html',
    '/heists/shops-and-stickups.html',
    '/heists/pawn-shops.html',
    '/heists/jewelry-stores.html',
    '/heists/small-banks-payday-loans.html',
    '/heists/large-bank-vaults.html',
    '/heists/armored-trucks-gang-ops.html'
  ]);

  function esc(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function hasText(v) {
    if (v == null) return false;
    if (Array.isArray(v)) return v.filter(Boolean).length > 0;
    var s = String(v).trim();
    return s.length > 0 && s.toLowerCase() !== 'null' && s.toLowerCase() !== 'undefined';
  }

  function isRealVerifiedValue(v) {
    if (!hasText(v)) return false;
    var s = Array.isArray(v) ? v.join(', ') : String(v).trim();
    return !/^(not yet confirmed|location unknown|price not confirmed|screenshot needed|availability unverified|unverified|unknown|tbd|n\/a)$/i.test(s);
  }

  function formatValue(v, fallbackLabel) {
    if (Array.isArray(v)) {
      var arr = v.map(function (x) { return String(x || '').trim(); }).filter(Boolean);
      return arr.length ? arr.join(', ') : (fallbackLabel || '');
    }
    var s = String(v == null ? '' : v).trim();
    return s || (fallbackLabel || '');
  }

  function formatDateStamp(iso) {
    if (!hasText(iso)) return '';
    var s = String(iso).trim();
    return s.length >= 10 ? s.slice(0, 10) : s;
  }

  function loadVerifiedPinSet() {
    if (verifiedPinSet) return Promise.resolve(verifiedPinSet);
    if (!mapPinIdsPromise) {
      mapPinIdsPromise = fetch(MAP_PINS_URL)
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (data) {
          var set = new Set();
          if (data && Array.isArray(data.pins)) {
            data.pins.forEach(function (p) {
              if (p && p.id) set.add(String(p.id).trim());
            });
          }
          verifiedPinSet = set;
          return set;
        })
        .catch(function () {
          verifiedPinSet = new Set();
          return verifiedPinSet;
        });
    }
    return mapPinIdsPromise;
  }

  function getItemPinId(item) {
    var raw = item && (item.mapPinId || item.pinId);
    if (!hasText(raw)) return null;
    var pin = String(raw).trim();
    if (!verifiedPinSet || !verifiedPinSet.has(pin)) return null;
    return pin;
  }

  function isValidRelatedUrl(url) {
    if (!hasText(url)) return false;
    var s = String(url).trim();
    if (s.indexOf('/') !== 0) return false;
    var qIdx = s.indexOf('?');
    var hIdx = s.indexOf('#');
    var cutIdx = qIdx >= 0 && hIdx >= 0 ? Math.min(qIdx, hIdx) : (qIdx >= 0 ? qIdx : hIdx);
    var basePath = cutIdx >= 0 ? s.slice(0, cutIdx) : s;
    if (!VERIFIED_SITE_ROUTES.has(basePath)) return false;
    if (basePath === '/map.html' && qIdx >= 0) {
      var params = new URLSearchParams(s.slice(qIdx + 1).split('#')[0]);
      var p = params.get('pin');
      if (p && verifiedPinSet && !verifiedPinSet.has(p)) return false;
    }
    return true;
  }

  function verificationBadgeClass(status) {
    var s = String(status || 'Unverified').toLowerCase();
    if (s === 'confirmed') return 'wdb-ver-confirmed';
    if (s === 'community discovered' || s === 'reported') return 'wdb-ver-community';
    if (s === 'testing' || s === 'estimated') return 'wdb-ver-testing';
    return 'wdb-ver-unverified';
  }

  function renderStatStatusTag(status) {
    if (!hasText(status)) return '';
    return ' <span class="wdb-ver-pill ' + verificationBadgeClass(status) + '" style="font-size:0.55rem; padding:1px 5px; margin-left:4px; vertical-align:middle;">' + esc(status) + '</span>';
  }

  function getAffiliateStripHtml(contextLabel, categoryKey) {
    var cfg = global.SITE_CONFIG;
    if (!(cfg && cfg.enableAmazonProductPlacements === true)) {
      return '';
    }
    if (global.GTA6AffiliateCards && typeof global.GTA6AffiliateCards.getDatabaseHardwareCardHtml === 'function') {
      var affCtx = categoryKey === 'radio'
        ? 'radio-audio'
        : (categoryKey === 'gun-stores' ? 'gunstores-gear' : 'database');
      return global.GTA6AffiliateCards.getDatabaseHardwareCardHtml('wdb-hardware-card-' + (categoryKey || 'db'), affCtx);
    }
    var aff = global.GTA6_AFFILIATES || {
      amazon: {
        links: {
          samsung990pro: 'https://www.amazon.com/s?k=Samsung+990+PRO+2TB+PCIe+4.0+M.2&tag=gta6heistguid-20'
        }
      }
    };
    var url = (aff.amazon && aff.amazon.links && aff.amazon.links.samsung990pro)
      ? aff.amazon.links.samsung990pro
      : 'https://www.amazon.com/s?k=Samsung+990+PRO+2TB+PCIe+4.0+M.2&tag=gta6heistguid-20';
    return (
      '<aside class="aff-card aff-card--compact aff-accent-green" aria-label="Recommended gaming hardware (affiliate link)">' +
        '<div class="aff-media aff-media--cover is-compact"><img src="/assets/gear/samsung-990pro.jpg" alt="Samsung 990 PRO 2TB PCIe 4.0 M.2 NVMe SSD" loading="lazy"></div>' +
        '<div class="aff-compact-body">' +
          '<div class="aff-meta-row"><span class="aff-partner-pill">Amazon Partner</span><span class="aff-badge-pill">PS5 &amp; PC NVMe SSD</span><span class="aff-disclosure-tag">Affiliate</span></div>' +
          '<div class="aff-compact-title">Samsung 990 PRO 2TB SSD</div>' +
          '<div class="aff-compact-benefit">7,450 MB/s read speeds &middot; Ample room for 212 GB+ GTA VI installs</div>' +
          '<div class="aff-disclosure-inline">' + esc(contextLabel || 'Affiliate link · As an Amazon Associate we earn from qualifying purchases. Prices vary on Amazon.') + '</div>' +
        '</div>' +
        '<div class="aff-compact-action"><a href="' + esc(url) + '" target="_blank" rel="sponsored nofollow noopener noreferrer" data-aff-partner="amazon" data-aff-placement="wdb-hardware-fallback" class="aff-cta aff-cta--green">Check Price on Amazon &rarr;</a></div>' +
      '</aside>'
    );
  }

  function injectStyles() {
    if (stylesInjected || typeof document === 'undefined') return;
    stylesInjected = true;
    var style = document.createElement('style');
    style.id = 'gta6WorldDbEngineStyles';
    style.textContent = [
      '.wdb-shell { display: flex; flex-direction: column; gap: 1rem; }',
      '.wdb-progress-strip { background: linear-gradient(155deg, rgba(12, 18, 32, 0.96), rgba(7, 11, 20, 0.98)); border: 1px solid rgba(0, 240, 255, 0.28); border-radius: 11px; padding: 0.72rem 0.95rem; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 0.65rem 1rem; }',
      '.wdb-progress-stats { display: flex; flex-wrap: wrap; align-items: center; gap: 0.65rem; font-family: var(--font-mono, monospace); font-size: 0.77rem; color: #cbd5e1; }',
      '.wdb-progress-pill { background: rgba(0, 240, 255, 0.1); border: 1px solid rgba(0, 240, 255, 0.3); color: var(--neon-cyan, #00f0ff); padding: 0.2rem 0.55rem; border-radius: 6px; font-weight: 800; }',
      '.wdb-progress-pill.is-green { background: rgba(0, 255, 136, 0.1); border-color: rgba(0, 255, 136, 0.35); color: var(--neon-green, #00ff88); }',
      '.wdb-progress-pill.is-amber { background: rgba(255, 184, 0, 0.12); border-color: rgba(255, 184, 0, 0.38); color: var(--neon-amber, #ffb800); }',
      '.wdb-progress-actions { display: flex; flex-wrap: wrap; gap: 0.4rem; align-items: center; }',
      '.wdb-mini-btn { background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.16); color: #e2e8f0; padding: 0.32rem 0.65rem; border-radius: 6px; font-size: 0.73rem; font-weight: 800; font-family: var(--font-mono, monospace); cursor: pointer; transition: all 0.18s ease; }',
      '.wdb-mini-btn:hover { border-color: var(--neon-cyan, #00f0ff); color: #fff; background: rgba(0, 240, 255, 0.14); }',
      '.wdb-mini-btn.is-green:hover { border-color: var(--neon-green, #00ff88); background: rgba(0, 255, 136, 0.14); }',
      '.wdb-mini-btn.is-danger:hover { border-color: #f43f5e; background: rgba(244, 63, 94, 0.16); }',

      '.wdb-controls { background: linear-gradient(160deg, rgba(11, 17, 30, 0.96), rgba(7, 10, 20, 0.98)); border: 1px solid rgba(0, 240, 255, 0.28); border-radius: 12px; padding: 1rem 1.05rem; display: flex; flex-direction: column; gap: 0.75rem; }',
      '.wdb-controls-top { display: flex; flex-wrap: wrap; gap: 0.6rem; align-items: center; }',
      '.wdb-search-wrap { flex: 1 1 250px; position: relative; }',
      '.wdb-search-input { width: 100%; box-sizing: border-box; background: #060a14; border: 1px solid rgba(0, 240, 255, 0.35); border-radius: 8px; color: #fff; font-size: 0.88rem; padding: 0.58rem 0.85rem 0.58rem 2.15rem; outline: none; }',
      '.wdb-search-input:focus { border-color: var(--neon-cyan, #00f0ff); box-shadow: 0 0 0 2px rgba(0, 240, 255, 0.18); }',
      '.wdb-search-icon { position: absolute; left: 0.72rem; top: 50%; transform: translateY(-50%); font-size: 0.86rem; pointer-events: none; opacity: 0.8; }',
      '.wdb-select { background: #060a14; border: 1px solid rgba(255, 255, 255, 0.18); border-radius: 8px; color: #e2e8f0; font-size: 0.82rem; font-weight: 600; padding: 0.56rem 0.75rem; cursor: pointer; max-width: 100%; }',
      '.wdb-select:focus { border-color: var(--neon-cyan, #00f0ff); outline: none; }',
      '.wdb-pill-row { display: flex; flex-wrap: wrap; gap: 0.42rem; align-items: center; }',
      '.wdb-pill { background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.14); color: #cbd5e1; padding: 0.36rem 0.76rem; border-radius: 999px; font-size: 0.75rem; font-weight: 800; cursor: pointer; transition: all 0.16s ease; }',
      '.wdb-pill:hover { border-color: var(--neon-cyan, #00f0ff); color: #fff; }',
      '.wdb-pill.is-active { background: rgba(0, 240, 255, 0.18); border-color: var(--neon-cyan, #00f0ff); color: #fff; box-shadow: 0 0 12px rgba(0, 240, 255, 0.22); }',
      '.wdb-toggle-row { display: flex; flex-wrap: wrap; gap: 0.42rem; align-items: center; justify-content: space-between; padding-top: 0.4rem; border-top: 1px solid rgba(255, 255, 255, 0.07); }',
      '.wdb-toggle-chips { display: flex; flex-wrap: wrap; gap: 0.4rem; align-items: center; }',
      '.wdb-chip { background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.14); color: #94a3b8; padding: 0.26rem 0.62rem; border-radius: 6px; font-size: 0.72rem; font-weight: 700; cursor: pointer; font-family: var(--font-mono, monospace); }',
      '.wdb-chip.is-active { background: rgba(0, 255, 136, 0.14); border-color: var(--neon-green, #00ff88); color: var(--neon-green, #00ff88); }',
      '.wdb-chip.is-fav.is-active { background: rgba(255, 184, 0, 0.16); border-color: var(--neon-amber, #ffb800); color: var(--neon-amber, #ffb800); }',
      '.wdb-result-meta { font-family: var(--font-mono, monospace); font-size: 0.76rem; color: var(--neon-cyan, #00f0ff); font-weight: 800; }',

      '.wdb-aff-strip { background: rgba(10, 15, 26, 0.95); border: 1px solid rgba(255, 255, 255, 0.13); border-radius: 10px; padding: 0.65rem 0.92rem; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 0.55rem 1rem; font-size: 0.77rem; color: #cbd5e1; }',
      '.wdb-aff-left { display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem; }',
      '.wdb-aff-tag { font-family: var(--font-mono, monospace); font-size: 0.65rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.4px; color: var(--neon-amber, #ffb800); background: rgba(255, 184, 0, 0.12); border: 1px solid rgba(255, 184, 0, 0.35); padding: 0.15rem 0.48rem; border-radius: 4px; white-space: nowrap; }',
      '.wdb-aff-links { display: flex; flex-wrap: wrap; align-items: center; gap: 0.42rem; }',
      '.wdb-aff-links a { color: var(--neon-cyan, #00f0ff); font-weight: 800; text-decoration: none; }',
      '.wdb-aff-links a:hover { text-decoration: underline; }',
      '.wdb-aff-sep { color: #475569; }',

      '.wdb-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 310px), 1fr)); gap: 0.95rem; }',
      '.wdb-card { background: linear-gradient(160deg, rgba(13, 19, 34, 0.96), rgba(8, 12, 22, 0.98)); border: 1px solid rgba(255, 255, 255, 0.11); border-radius: 12px; overflow: hidden; display: flex; flex-direction: column; cursor: pointer; transition: transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease; position: relative; }',
      '.wdb-card:hover { transform: translateY(-3px); border-color: var(--neon-cyan, #00f0ff); box-shadow: 0 10px 26px rgba(0, 240, 255, 0.16); }',
      '.wdb-card.is-owned { border-color: rgba(0, 255, 136, 0.55); }',
      '.wdb-card.is-compared { box-shadow: 0 0 0 2px var(--neon-pink, #ff2a8d), 0 8px 24px rgba(255, 42, 141, 0.22); }',

      '.wdb-card-media { width: 100%; aspect-ratio: 16/9; background: #060912; position: relative; overflow: hidden; border-bottom: 1px solid rgba(255, 255, 255, 0.07); }',
      '.wdb-card-media.is-radio { aspect-ratio: 16/9; }',
      '.wdb-card-cta-pill { display: inline-flex; align-items: center; gap: 0.28rem; font-family: var(--font-mono, monospace); font-size: 0.68rem; font-weight: 900; text-transform: uppercase; letter-spacing: 0.03em; color: var(--neon-cyan, #00f0ff); background: rgba(0, 240, 255, 0.1); border: 1px solid rgba(0, 240, 255, 0.35); border-radius: 5px; padding: 0.24rem 0.52rem; transition: background 0.16s ease, color 0.16s ease; }',
      '.wdb-card:hover .wdb-card-cta-pill { background: var(--neon-cyan, #00f0ff); color: #04101d; }',
      '.wdb-card-media picture { display: block; width: 100%; height: 100%; }',
      '.wdb-card-media img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.3s ease; }',
      '.wdb-card:hover .wdb-card-media img { transform: scale(1.03); }',
      '.wdb-placeholder { width: 100%; height: 100%; box-sizing: border-box; padding: 0.85rem; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; background: radial-gradient(circle at 20% 20%, rgba(0, 240, 255, 0.08), transparent 55%), radial-gradient(circle at 80% 80%, rgba(255, 42, 141, 0.07), transparent 55%), linear-gradient(155deg, #0b1120 0%, #060912 100%); position: relative; }',
      '.wdb-placeholder::before { content: ""; position: absolute; inset: 0; background-image: linear-gradient(rgba(255, 255, 255, 0.024) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.024) 1px, transparent 1px); background-size: 20px 20px; pointer-events: none; }',
      '.wdb-ph-icon { font-size: 1.75rem; line-height: 1; margin-bottom: 0.3rem; position: relative; z-index: 1; }',
      '.wdb-ph-title { color: #e2e8f0; font-size: 0.84rem; font-weight: 800; position: relative; z-index: 1; max-width: 92%; }',
      '.wdb-ph-tag { margin-top: 0.3rem; font-family: var(--font-mono, monospace); font-size: 0.62rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.4px; color: #94a3b8; background: rgba(0, 0, 0, 0.6); border: 1px dashed rgba(148, 163, 184, 0.35); padding: 0.14rem 0.5rem; border-radius: 999px; position: relative; z-index: 1; }',
      '.wdb-radio-banner { width: 100%; height: 100%; box-sizing: border-box; padding: 0.75rem 0.95rem; display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; background: linear-gradient(135deg, rgba(0, 240, 255, 0.12), rgba(255, 42, 141, 0.1) 60%, #070b14); }',
      '.wdb-radio-freq { font-family: var(--font-mono, monospace); font-size: 1.15rem; font-weight: 1000; color: var(--neon-cyan, #00f0ff); letter-spacing: 0.5px; }',
      '.wdb-radio-wave { font-family: var(--font-mono, monospace); font-size: 0.68rem; color: #94a3b8; text-transform: uppercase; }',

      '.wdb-badge-tl { position: absolute; top: 8px; left: 8px; background: rgba(6, 10, 20, 0.9); border: 1px solid rgba(0, 240, 255, 0.45); color: var(--neon-cyan, #00f0ff); font-family: var(--font-mono, monospace); font-size: 0.62rem; font-weight: 800; padding: 2px 7px; border-radius: 4px; text-transform: uppercase; z-index: 2; max-width: 62%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }',
      '.wdb-badge-tr { position: absolute; top: 8px; right: 8px; background: rgba(0, 255, 136, 0.18); border: 1px solid var(--neon-green, #00ff88); color: var(--neon-green, #00ff88); font-family: var(--font-mono, monospace); font-size: 0.6rem; font-weight: 800; padding: 2px 6px; border-radius: 4px; z-index: 2; }',
      '.wdb-badge-br { position: absolute; bottom: 8px; right: 8px; background: rgba(6, 10, 20, 0.9); color: #e2e8f0; font-size: 0.63rem; font-weight: 700; padding: 2px 7px; border-radius: 4px; z-index: 2; }',

      '.wdb-card-body { padding: 0.9rem 0.95rem 0.85rem; display: flex; flex-direction: column; gap: 0.45rem; flex: 1; }',
      '.wdb-card-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 0.45rem; }',
      '.wdb-card-title { color: #fff; font-size: 1.02rem; font-weight: 900; margin: 0; line-height: 1.25; }',
      '.wdb-card-sub { color: var(--neon-cyan, #00f0ff); font-family: var(--font-mono, monospace); font-size: 0.72rem; font-weight: 700; }',
      '.wdb-ver-pill { font-family: var(--font-mono, monospace); font-size: 0.6rem; font-weight: 800; padding: 2px 6px; border-radius: 4px; text-transform: uppercase; white-space: nowrap; flex-shrink: 0; }',
      '.wdb-ver-confirmed { background: rgba(0, 255, 136, 0.14); border: 1px solid rgba(0, 255, 136, 0.4); color: var(--neon-green, #00ff88); }',
      '.wdb-ver-community { background: rgba(0, 240, 255, 0.14); border: 1px solid rgba(0, 240, 255, 0.4); color: var(--neon-cyan, #00f0ff); }',
      '.wdb-ver-testing { background: rgba(255, 184, 0, 0.14); border: 1px solid rgba(255, 184, 0, 0.45); color: var(--neon-amber, #ffb800); }',
      '.wdb-ver-unverified { background: rgba(148, 163, 184, 0.14); border: 1px solid rgba(148, 163, 184, 0.35); color: #94a3b8; }',

      '.wdb-specs-list { display: flex; flex-direction: column; gap: 0.28rem; background: rgba(0, 0, 0, 0.38); border: 1px solid rgba(255, 255, 255, 0.07); border-radius: 7px; padding: 0.5rem 0.62rem; font-size: 0.75rem; }',
      '.wdb-spec-row { display: flex; justify-content: space-between; align-items: baseline; gap: 0.6rem; }',
      '.wdb-spec-k { color: #94a3b8; font-family: var(--font-mono, monospace); font-size: 0.69rem; flex-shrink: 0; }',
      '.wdb-spec-v { color: #f1f5f9; font-weight: 700; text-align: right; line-height: 1.3; }',
      '.wdb-spec-v.is-muted { color: #94a3b8; font-weight: 500; font-style: italic; }',
      '.wdb-card-note { color: #94a3b8; font-size: 0.78rem; line-height: 1.45; margin: 0; }',
      '.wdb-warn-banner { background: rgba(244, 63, 94, 0.12); border: 1px solid rgba(244, 63, 94, 0.4); color: #fda4af; font-size: 0.72rem; font-weight: 700; padding: 0.32rem 0.55rem; border-radius: 6px; }',
      '.wdb-tag-list { display: flex; flex-wrap: wrap; gap: 0.3rem; }',
      '.wdb-mini-tag { background: rgba(0, 240, 255, 0.08); border: 1px solid rgba(0, 240, 255, 0.24); color: #bae6fd; font-size: 0.66rem; font-weight: 700; padding: 0.12rem 0.45rem; border-radius: 4px; font-family: var(--font-mono, monospace); }',
      '.wdb-mini-tag.is-green { background: rgba(0, 255, 136, 0.1); border-color: rgba(0, 255, 136, 0.3); color: #86efac; }',
      '.wdb-mini-tag.is-amber { background: rgba(255, 184, 0, 0.12); border-color: rgba(255, 184, 0, 0.35); color: #fde68a; }',

      '.wdb-card-actions { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 0.4rem; margin-top: auto; padding-top: 0.55rem; border-top: 1px solid rgba(255, 255, 255, 0.08); }',
      '.wdb-action-group { display: flex; align-items: center; gap: 0.35rem; flex-wrap: wrap; }',
      '.wdb-act-btn { background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.14); color: #cbd5e1; font-size: 0.71rem; font-weight: 800; padding: 0.25rem 0.5rem; border-radius: 5px; cursor: pointer; font-family: var(--font-mono, monospace); transition: all 0.15s ease; }',
      '.wdb-act-btn:hover { border-color: var(--neon-cyan, #00f0ff); color: #fff; }',
      '.wdb-act-btn.is-fav { background: rgba(255, 184, 0, 0.18); border-color: var(--neon-amber, #ffb800); color: var(--neon-amber, #ffb800); }',
      '.wdb-act-btn.is-owned { background: rgba(0, 255, 136, 0.16); border-color: var(--neon-green, #00ff88); color: var(--neon-green, #00ff88); }',
      '.wdb-act-btn.is-cmp { background: rgba(255, 42, 141, 0.18); border-color: var(--neon-pink, #ff2a8d); color: #ff7cc4; }',
      '.wdb-map-pill { color: var(--neon-green, #00ff88); font-family: var(--font-mono, monospace); font-size: 0.7rem; font-weight: 800; text-decoration: none; padding: 0.24rem 0.48rem; border-radius: 5px; background: rgba(0, 255, 136, 0.1); border: 1px solid rgba(0, 255, 136, 0.35); }',
      '.wdb-map-pill:hover { background: rgba(0, 255, 136, 0.2); }',

      '.wdb-compare-tray { position: fixed; left: 50%; bottom: 58px; transform: translateX(-50%); z-index: 11000; width: min(94vw, 760px); background: rgba(7, 11, 22, 0.97); border: 1px solid var(--neon-pink, #ff2a8d); border-radius: 12px; padding: 0.65rem 0.9rem; box-shadow: 0 12px 36px rgba(0, 0, 0, 0.72), 0 0 24px rgba(255, 42, 141, 0.22); display: none; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.55rem; backdrop-filter: blur(8px); }',
      '.wdb-compare-tray.is-open { display: flex; }',
      '.wdb-compare-pills { display: flex; flex-wrap: wrap; gap: 0.4rem; align-items: center; }',
      '.wdb-cmp-item-pill { display: inline-flex; align-items: center; gap: 0.35rem; background: rgba(255, 42, 141, 0.14); border: 1px solid rgba(255, 42, 141, 0.45); color: #fff; font-size: 0.74rem; font-weight: 800; padding: 0.22rem 0.52rem; border-radius: 999px; }',
      '.wdb-cmp-item-pill button { background: none; border: none; color: #fda4af; cursor: pointer; font-weight: 900; padding: 0 2px; font-size: 0.85rem; }',

      '.wdb-modal-backdrop { position: fixed; inset: 0; z-index: 12000; background: rgba(3, 6, 14, 0.84); backdrop-filter: blur(6px); display: none; align-items: center; justify-content: center; padding: 1rem; box-sizing: border-box; }',
      '.wdb-modal-backdrop.is-open { display: flex; }',
      '.wdb-modal-card { width: min(100%, 780px); max-height: 90vh; overflow-y: auto; background: linear-gradient(160deg, #0d1424 0%, #070b14 100%); border: 1px solid rgba(0, 240, 255, 0.4); border-radius: 14px; position: relative; box-shadow: 0 22px 60px rgba(0, 0, 0, 0.8); }',
      '.wdb-modal-card.is-wide { width: min(100%, 980px); }',
      '.wdb-modal-close { position: absolute; top: 12px; right: 12px; z-index: 5; width: 34px; height: 34px; border-radius: 50%; background: rgba(6, 10, 20, 0.9); border: 1px solid rgba(255, 255, 255, 0.22); color: #fff; font-size: 1.25rem; line-height: 1; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; }',
      '.wdb-modal-close:hover { border-color: var(--neon-pink, #ff2a8d); color: var(--neon-pink, #ff2a8d); }',
      '.wdb-modal-hero { width: 100%; aspect-ratio: 16/8; max-height: 320px; overflow: hidden; background: #050811; position: relative; border-bottom: 1px solid rgba(255, 255, 255, 0.08); }',
      '.wdb-modal-hero.is-zoomable { cursor: zoom-in; }',
      '.wdb-modal-hero picture { display: block; width: 100%; height: 100%; }',
      '.wdb-modal-hero img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.25s ease; }',
      '.wdb-modal-caption { font-size: 0.78rem; color: #94a3b8; line-height: 1.45; margin: -0.35rem 0 0; padding: 0.42rem 0.65rem; background: rgba(0, 240, 255, 0.05); border-left: 2px solid rgba(0, 240, 255, 0.45); border-radius: 0 6px 6px 0; }',
      '.wdb-modal-hero.is-zoomable:hover img { transform: scale(1.02); }',
      '.wdb-zoom-pill { position: absolute; right: 12px; bottom: 12px; z-index: 3; display: inline-flex; align-items: center; gap: 5px; background: rgba(6, 10, 20, 0.88); border: 1px solid rgba(0, 240, 255, 0.5); color: #e2e8f0; font-family: var(--font-mono, monospace); font-size: 0.68rem; font-weight: 800; padding: 4px 9px; border-radius: 999px; pointer-events: none; backdrop-filter: blur(4px); }',
      '.wdb-lightbox-backdrop { position: fixed; inset: 0; z-index: 15000; background: rgba(2, 4, 10, 0.94); backdrop-filter: blur(10px); display: none; flex-direction: column; align-items: center; justify-content: center; padding: 1.25rem; box-sizing: border-box; gap: 0.75rem; }',
      '.wdb-lightbox-backdrop.is-open { display: flex; }',
      '.wdb-lightbox-close { position: fixed; top: 16px; right: 18px; z-index: 15002; width: 40px; height: 40px; border-radius: 50%; background: rgba(12, 18, 32, 0.95); border: 1px solid rgba(0, 240, 255, 0.5); color: #fff; font-size: 1.45rem; line-height: 1; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; }',
      '.wdb-lightbox-close:hover { border-color: var(--neon-pink, #ff2a8d); color: var(--neon-pink, #ff2a8d); }',
      '.wdb-lightbox-img { max-width: min(96vw, 1600px); max-height: 80vh; width: auto; height: auto; object-fit: contain; border-radius: 10px; border: 1px solid rgba(0, 240, 255, 0.35); box-shadow: 0 24px 70px rgba(0, 0, 0, 0.85); background: #050811; }',
      '.wdb-lightbox-caption { max-width: min(94vw, 920px); text-align: center; display: flex; flex-direction: column; gap: 0.25rem; }',
      '.wdb-lightbox-title { color: #fff; font-size: 1rem; font-weight: 900; }',
      '.wdb-lightbox-desc { color: #cbd5e1; font-size: 0.8rem; line-height: 1.45; }',
      '.wdb-lightbox-credit { font-family: var(--font-mono, monospace); font-size: 0.72rem; color: var(--neon-cyan, #00f0ff); }',
      '.wdb-modal-body { padding: 1.2rem 1.35rem 1.35rem; display: flex; flex-direction: column; gap: 0.9rem; }',
      '.wdb-modal-badges { display: flex; flex-wrap: wrap; gap: 0.4rem; align-items: center; }',
      '.wdb-modal-title { color: #fff; font-size: clamp(1.25rem, 2.5vw, 1.65rem); margin: 0; line-height: 1.2; }',
      '.wdb-modal-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 0.65rem; }',
      '.wdb-modal-stat { background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 0.6rem 0.75rem; }',
      '.wdb-modal-stat-k { font-family: var(--font-mono, monospace); font-size: 0.67rem; text-transform: uppercase; color: #94a3b8; margin-bottom: 0.2rem; }',
      '.wdb-modal-stat-v { color: #f8fafc; font-size: 0.85rem; font-weight: 700; line-height: 1.4; }',
      '.wdb-modal-section { background: rgba(0, 0, 0, 0.35); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 9px; padding: 0.78rem 0.92rem; }',
      '.wdb-modal-section h4 { margin: 0 0 0.45rem; font-family: var(--font-mono, monospace); font-size: 0.75rem; text-transform: uppercase; color: var(--neon-cyan, #00f0ff); letter-spacing: 0.5px; }',
      '.wdb-tracklist { list-style: none; margin: 0; padding: 0; display: grid; gap: 0.32rem; font-size: 0.84rem; color: #e2e8f0; }',
      '.wdb-tracklist li { padding: 0.32rem 0.5rem; background: rgba(255, 255, 255, 0.03); border-radius: 5px; border: 1px solid rgba(255, 255, 255, 0.06); }',
      '.wdb-related-links { display: flex; flex-wrap: wrap; gap: 0.45rem; }',
      '.wdb-related-link { display: inline-flex; align-items: center; gap: 0.3rem; background: rgba(0, 240, 255, 0.09); border: 1px solid rgba(0, 240, 255, 0.3); color: var(--neon-cyan, #00f0ff); padding: 0.32rem 0.68rem; border-radius: 6px; font-size: 0.77rem; font-weight: 800; text-decoration: none; }',
      '.wdb-related-link:hover { background: rgba(0, 240, 255, 0.18); color: #fff; }',
      '.wdb-ver-meta { display: flex; flex-wrap: wrap; gap: 0.55rem 1rem; align-items: center; font-family: var(--font-mono, monospace); font-size: 0.72rem; color: #94a3b8; padding-top: 0.55rem; border-top: 1px solid rgba(255, 255, 255, 0.08); }',
      '.wdb-ver-meta a { color: var(--neon-cyan, #00f0ff); text-decoration: none; }',
      '.wdb-ver-meta a:hover { text-decoration: underline; }',
      '.wdb-modal-footer { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 0.65rem; padding-top: 0.75rem; border-top: 1px solid rgba(255, 255, 255, 0.1); }',

      '.wdb-cmp-table-wrap { overflow-x: auto; }',
      '.wdb-cmp-table { width: 100%; border-collapse: collapse; font-size: 0.82rem; }',
      '.wdb-cmp-table th, .wdb-cmp-table td { padding: 0.65rem 0.75rem; border-bottom: 1px solid rgba(255, 255, 255, 0.08); text-align: left; vertical-align: top; }',
      '.wdb-cmp-table th { background: rgba(0, 240, 255, 0.08); color: #fff; font-weight: 900; }',
      '.wdb-cmp-table td:first-child, .wdb-cmp-table th:first-child { font-family: var(--font-mono, monospace); font-size: 0.73rem; color: #94a3b8; width: 170px; background: rgba(0, 0, 0, 0.32); }',

      '@media (max-width: 640px) { .wdb-modal-body { padding: 1rem; } .wdb-compare-tray { bottom: 54px; padding: 0.55rem 0.7rem; } }'
    ].join('\n');
    document.head.appendChild(style);
  }

  // ========================================================================
  // BUILT-IN CATEGORY SCHEMAS (TAILORED FIELDS PER CATEGORY — EXTENSIBLE)
  // ========================================================================
  var CATEGORY_SCHEMAS = Object.create(null);

  function registerCategory(key, schema) {
    CATEGORY_SCHEMAS[key] = schema;
  }

  // 1. VEHICLES SCHEMA
  registerCategory('vehicles', {
    key: 'vehicles',
    title: 'Vehicles',
    icon: '🏎️',
    ownedLabel: 'Owned',
    searchPlaceholder: 'Search vehicle, manufacturer (Declasse, Grotti, Vapid), class, region...',
    affiliateContext: 'Affiliate links — support GTA6HeistGuide.com with launch keys, low-ping routing, or clipping tools:',
    primaryFilter: {
      label: 'Vehicle Class',
      getValue: function (it) { return it.vehicleClass || 'Unclassified'; },
      order: ['Sports', 'Super', 'Muscle', 'SUVs & Pickups', 'Motorcycles', 'Boats & Airboats', 'Aircraft']
    },
    secondaryFilters: [
      {
        id: 'manufacturer',
        label: 'All Manufacturers',
        getValue: function (it) { return it.manufacturer || ''; }
      },
      {
        id: 'region',
        label: 'All Spawn Regions',
        getValues: function (it) { return Array.isArray(it.spawnRegions) ? it.spawnRegions : []; }
      }
    ],
    toggles: [
      { id: 'verifiedShot', label: '✓ Verified Screenshots' },
      { id: 'hasPin', label: '📍 Has Map Pin' },
      { id: 'favorites', label: '★ Favorites' },
      { id: 'owned', label: '✓ Owned' }
    ],
    sorts: [
      { id: 'verified', label: 'Sort: Verified & Photos First' },
      { id: 'name', label: 'Sort: Name (A–Z)' },
      { id: 'class', label: 'Sort: Vehicle Class' },
      { id: 'updated', label: 'Sort: Recently Updated' }
    ],
    getSubtitle: function (it) {
      return [it.manufacturer, it.vehicleClass].filter(Boolean).join(' · ');
    },
    getTopLeftBadge: function (it) { return it.vehicleClass || 'Vehicle'; },
    getBottomRightBadge: function (it) {
      return Array.isArray(it.spawnRegions) && it.spawnRegions.length ? '📍 ' + it.spawnRegions[0] : '';
    },
    getCardSpecs: function (it) {
      var perf = it.performance || {};
      var rows = [];
      if (hasText(it.manufacturer)) rows.push({ k: 'Manufacturer', v: it.manufacturer });
      if (hasText(perf.seatingCargo)) rows.push({ k: 'Seating / Cargo', v: perf.seatingCargo });
      if (hasText(perf.topSpeed) && isRealVerifiedValue(perf.topSpeed)) rows.push({ k: 'Top Speed', v: perf.topSpeed });
      rows.push({ k: 'Price / Acquire', v: formatValue(it.priceOrAcquisition, 'Price not confirmed'), muted: !isRealVerifiedValue(it.priceOrAcquisition) });
      if (Array.isArray(it.spawnRegions) && it.spawnRegions.length) {
        rows.push({ k: 'Spawn Regions', v: it.spawnRegions.join(', ') });
      }
      return rows;
    },
    getModalFields: function (it) {
      var perf = it.performance || {};
      var ss = it.statStatus || {};
      var fields = [
        { k: 'Vehicle Class', v: formatValue(it.vehicleClass, 'Not yet confirmed') },
        { k: 'Manufacturer', v: formatValue(it.manufacturer, 'Not yet confirmed') },
        { k: 'Price / How to Acquire', v: formatValue(it.priceOrAcquisition, 'Price not confirmed') },
        { k: 'Spawn Regions', v: formatValue(it.spawnRegions, 'Location unknown') }
      ];
      if (hasText(perf.topSpeed)) fields.push({ k: 'Top Speed', v: perf.topSpeed, status: ss.topSpeed || 'Not yet confirmed' });
      if (hasText(perf.acceleration)) fields.push({ k: 'Acceleration', v: perf.acceleration, status: ss.acceleration || 'Not yet confirmed' });
      if (hasText(perf.handling)) fields.push({ k: 'Handling', v: perf.handling, status: ss.handling || 'Reported' });
      if (hasText(perf.trunk)) fields.push({ k: 'Trunk / Stowage', v: perf.trunk, status: ss.trunk || 'Not yet confirmed' });
      if (hasText(perf.armor)) fields.push({ k: 'Armor', v: perf.armor, status: ss.armor || 'Not yet confirmed' });
      if (hasText(perf.seatingCargo)) fields.push({ k: 'Seating / Cargo', v: perf.seatingCargo });
      return fields;
    },
    compareFields: [
      { k: 'Vehicle Class', get: function (it) { return it.vehicleClass; } },
      { k: 'Manufacturer', get: function (it) { return it.manufacturer; } },
      { k: 'Top Speed', get: function (it) { return it.performance && it.performance.topSpeed; }, getStatus: function (it) { return it.statStatus && it.statStatus.topSpeed; } },
      { k: 'Acceleration', get: function (it) { return it.performance && it.performance.acceleration; }, getStatus: function (it) { return it.statStatus && it.statStatus.acceleration; } },
      { k: 'Handling', get: function (it) { return it.performance && it.performance.handling; }, getStatus: function (it) { return it.statStatus && it.statStatus.handling; } },
      { k: 'Trunk / Stowage', get: function (it) { return it.performance && it.performance.trunk; }, getStatus: function (it) { return it.statStatus && it.statStatus.trunk; } },
      { k: 'Armor', get: function (it) { return it.performance && it.performance.armor; }, getStatus: function (it) { return it.statStatus && it.statStatus.armor; } },
      { k: 'Seating / Cargo', get: function (it) { return it.performance && it.performance.seatingCargo; } },
      { k: 'Price / How to Acquire', get: function (it) { return it.priceOrAcquisition; }, fallback: 'Price not confirmed' },
      { k: 'Spawn Regions', get: function (it) { return formatValue(it.spawnRegions); }, fallback: 'Location unknown' }
    ],
    getSearchText: function (it) {
      var perf = it.performance || {};
      return [it.name, it.vehicleClass, it.manufacturer, it.priceOrAcquisition, formatValue(it.spawnRegions), perf.seatingCargo, perf.handling, it.notes].join(' ');
    }
  });

  // 2. PROPERTIES SCHEMA
  registerCategory('properties', {
    key: 'properties',
    title: 'Properties',
    icon: '🏠',
    ownedLabel: 'Owned / Unlocked',
    searchPlaceholder: 'Search safehouses, garages, fences, Brian\'s Lockup, code 7700, region...',
    affiliateContext: 'Affiliate links — qualifying purchases via our partners help fund daily Leonida intel updates:',
    primaryFilter: {
      label: 'Property Type',
      getValue: function (it) { return it.propertyType || it.category || 'Property'; },
      order: ['Story Safehouse', 'Purchasable Garage', 'Story Garage', 'Bonus Garage', 'Fence', 'Vehicle Buyer', 'Family Savings Safe']
    },
    secondaryFilters: [
      {
        id: 'region',
        label: 'All Regions',
        getValue: function (it) { return it.region || ''; }
      },
      {
        id: 'availability',
        label: 'All Availability',
        getValue: function (it) {
          var p = String(it.purchaseAvailability || it.cost || '').toLowerCase();
          if (p.indexOf('purchasable') >= 0) return 'Purchasable';
          if (p.indexOf('story') >= 0) return 'Story Unlocked';
          if (p.indexOf('ultimate') >= 0) return 'Ultimate Edition';
          return 'Activity / Fence';
        }
      }
    ],
    toggles: [
      { id: 'missable', label: '⚠️ Missable Warnings', test: function (it) { return Boolean(it.missableWarning); } },
      { id: 'favorites', label: '★ Favorites' },
      { id: 'owned', label: '✓ Owned / Unlocked' }
    ],
    sorts: [
      { id: 'default', label: 'Sort: Story & Type Order' },
      { id: 'name', label: 'Sort: Name (A–Z)' },
      { id: 'region', label: 'Sort: Region' },
      { id: 'updated', label: 'Sort: Recently Updated' }
    ],
    getSubtitle: function (it) {
      return [it.propertyType, it.region].filter(Boolean).join(' · ');
    },
    getTopLeftBadge: function (it) { return it.propertyType || 'Property'; },
    getBottomRightBadge: function (it) { return it.region ? '📍 ' + it.region : ''; },
    getWarning: function (it) { return it.missableWarning || ''; },
    getCardSpecs: function (it) {
      var rows = [
        { k: 'Availability / Price', v: formatValue(it.purchaseAvailability, 'Availability unverified'), muted: !isRealVerifiedValue(it.purchaseAvailability) },
        { k: 'Unlock Req.', v: formatValue(it.unlockRequirement, 'Not yet confirmed'), muted: !isRealVerifiedValue(it.unlockRequirement) }
      ];
      if (hasText(it.capacity)) rows.push({ k: 'Capacity / Role', v: it.capacity });
      if (hasText(it.interiorFeatures)) rows.push({ k: 'Features', v: it.interiorFeatures });
      return rows;
    },
    getModalFields: function (it) {
      var fields = [
        { k: 'Property Type', v: formatValue(it.propertyType, 'Not yet confirmed') },
        { k: 'Purchase Availability & Price', v: formatValue(it.purchaseAvailability, 'Availability unverified') },
        { k: 'Ownership / Unlock Requirement', v: formatValue(it.unlockRequirement, 'Not yet confirmed') },
        { k: 'Region / Location', v: formatValue(it.region, 'Location unknown') }
      ];
      if (hasText(it.capacity)) fields.push({ k: 'Garage / Fence Capacity', v: it.capacity });
      if (hasText(it.interiorFeatures)) fields.push({ k: 'Interior / Features', v: it.interiorFeatures });
      return fields;
    },
    compareFields: [
      { k: 'Property Type', get: function (it) { return it.propertyType; } },
      { k: 'Availability & Price', get: function (it) { return it.purchaseAvailability; }, fallback: 'Availability unverified' },
      { k: 'Unlock Requirement', get: function (it) { return it.unlockRequirement; } },
      { k: 'Garage / Fence Capacity', get: function (it) { return it.capacity; } },
      { k: 'Interior / Features', get: function (it) { return it.interiorFeatures; } },
      { k: 'Region / Location', get: function (it) { return it.region; }, fallback: 'Location unknown' }
    ],
    getSearchText: function (it) {
      return [it.name, it.propertyType, it.region, it.purchaseAvailability, it.unlockRequirement, it.interiorFeatures, it.capacity, it.notes, it.missableWarning].join(' ');
    }
  });

  // 3. WEAPONS SCHEMA
  registerCategory('weapons', {
    key: 'weapons',
    title: 'Weapons',
    icon: '⚔️',
    ownedLabel: 'Owned',
    searchPlaceholder: 'Search weapons (SM-69, Duval ES9, Carbine, Shotgun, Melee), attachments...',
    affiliateContext: 'Affiliate links — support GTA6HeistGuide.com with verified launch keys, ExitLag, or creator tools:',
    primaryFilter: {
      label: 'Weapon Class',
      getValue: function (it) { return it.weaponClass || 'Unclassified'; },
      order: ['Handguns', 'Rifles', 'Shotguns', 'SMGs', 'Snipers & Hunting', 'Heavy', 'Melee', 'Throwables']
    },
    secondaryFilters: [
      {
        id: 'obtain',
        label: 'All Acquisition Types',
        getValue: function (it) {
          var h = String(it.howToObtain || '').toLowerCase();
          if (h.indexOf('ammu-nation') >= 0 || h.indexOf('gun store') >= 0) return 'Ammu-Nation / Gun Stores';
          if (h.indexOf('bret vogel') >= 0 || h.indexOf('story') >= 0 || h.indexOf('mission') >= 0 || h.indexOf('contract') >= 0) return 'Story / Contract Reward';
          if (h.indexOf('ultimate') >= 0) return 'Ultimate Edition';
          if (h.indexOf('pawn') >= 0 || h.indexOf('surplus') >= 0) return 'Surplus / Pawn';
          return 'World Pickup / Other';
        }
      }
    ],
    toggles: [
      { id: 'verifiedShot', label: '✓ Verified Screenshots' },
      { id: 'hasPin', label: '📍 Has Map Pin' },
      { id: 'favorites', label: '★ Favorites' },
      { id: 'owned', label: '✓ Owned' }
    ],
    sorts: [
      { id: 'verified', label: 'Sort: Verified & Photos First' },
      { id: 'name', label: 'Sort: Name (A–Z)' },
      { id: 'class', label: 'Sort: Weapon Class' },
      { id: 'updated', label: 'Sort: Recently Updated' }
    ],
    getSubtitle: function (it) {
      return [it.weaponClass, it.price].filter(Boolean).join(' · ');
    },
    getTopLeftBadge: function (it) { return it.weaponClass || 'Weapon'; },
    getBottomRightBadge: function (it) { return isRealVerifiedValue(it.price) ? it.price : ''; },
    getCardSpecs: function (it) {
      var ch = it.characteristics || {};
      var rows = [
        { k: 'Obtain / Price', v: formatValue(it.howToObtain, 'Availability unverified'), muted: !isRealVerifiedValue(it.howToObtain) }
      ];
      if (hasText(it.bestUseCase)) rows.push({ k: 'Best Use Case', v: it.bestUseCase });
      if (hasText(ch.magCapacity) && isRealVerifiedValue(ch.magCapacity)) rows.push({ k: 'Mag Capacity', v: ch.magCapacity });
      if (Array.isArray(it.modifications) && it.modifications.length) {
        rows.push({ k: 'Attachments', v: it.modifications.slice(0, 3).join(', ') + (it.modifications.length > 3 ? ' +' + (it.modifications.length - 3) : '') });
      }
      return rows;
    },
    getModalFields: function (it) {
      var ch = it.characteristics || {};
      var ss = it.statStatus || {};
      var fields = [
        { k: 'Weapon Class', v: formatValue(it.weaponClass, 'Not yet confirmed') },
        { k: 'How to Obtain', v: formatValue(it.howToObtain, 'Availability unverified') },
        { k: 'Ammu-Nation / Price', v: formatValue(it.price, 'Price not confirmed') },
        { k: 'Best Use Case', v: formatValue(it.bestUseCase, 'Not yet confirmed') }
      ];
      if (hasText(ch.damage)) fields.push({ k: 'Damage', v: ch.damage, status: ss.damage || 'Not yet confirmed' });
      if (hasText(ch.fireRate)) fields.push({ k: 'Fire Rate', v: ch.fireRate, status: ss.fireRate || 'Not yet confirmed' });
      if (hasText(ch.range)) fields.push({ k: 'Range', v: ch.range, status: ss.range || 'Not yet confirmed' });
      if (hasText(ch.accuracy)) fields.push({ k: 'Accuracy', v: ch.accuracy, status: ss.accuracy || 'Not yet confirmed' });
      if (hasText(ch.magCapacity)) fields.push({ k: 'Mag Capacity', v: ch.magCapacity, status: ss.magCapacity || 'Not yet confirmed' });
      if (hasText(ch.bonuses)) fields.push({ k: 'Bonuses / Synergy', v: ch.bonuses, status: ss.bonuses || 'Not yet confirmed' });
      return fields;
    },
    getModalExtraHtml: function (it) {
      if (!Array.isArray(it.modifications) || !it.modifications.length) return '';
      return (
        '<div class="wdb-modal-section">' +
          '<h4>🔧 Supported Modifications &amp; Attachments</h4>' +
          '<div class="wdb-tag-list">' +
            it.modifications.map(function (m) {
              return '<span class="wdb-mini-tag">' + esc(m) + '</span>';
            }).join('') +
          '</div>' +
        '</div>'
      );
    },
    compareFields: [
      { k: 'Weapon Class', get: function (it) { return it.weaponClass; } },
      { k: 'Damage', get: function (it) { return it.characteristics && it.characteristics.damage; }, getStatus: function (it) { return it.statStatus && it.statStatus.damage; } },
      { k: 'Fire Rate', get: function (it) { return it.characteristics && it.characteristics.fireRate; }, getStatus: function (it) { return it.statStatus && it.statStatus.fireRate; } },
      { k: 'Range', get: function (it) { return it.characteristics && it.characteristics.range; }, getStatus: function (it) { return it.statStatus && it.statStatus.range; } },
      { k: 'Accuracy', get: function (it) { return it.characteristics && it.characteristics.accuracy; }, getStatus: function (it) { return it.statStatus && it.statStatus.accuracy; } },
      { k: 'Mag Capacity', get: function (it) { return it.characteristics && it.characteristics.magCapacity; }, getStatus: function (it) { return it.statStatus && it.statStatus.magCapacity; } },
      { k: 'Bonuses', get: function (it) { return it.characteristics && it.characteristics.bonuses; }, getStatus: function (it) { return it.statStatus && it.statStatus.bonuses; } },
      { k: 'Modifications', get: function (it) { return formatValue(it.modifications); } },
      { k: 'How to Obtain', get: function (it) { return it.howToObtain; }, fallback: 'Availability unverified' },
      { k: 'Price', get: function (it) { return it.price; }, fallback: 'Price not confirmed' },
      { k: 'Best Use Case', get: function (it) { return it.bestUseCase; } }
    ],
    getSearchText: function (it) {
      return [it.name, it.weaponClass, it.howToObtain, it.price, it.bestUseCase, formatValue(it.modifications), it.notes].join(' ');
    }
  });

  // 4. GUN STORES SCHEMA
  registerCategory('gun-stores', {
    key: 'gun-stores',
    title: 'Gun Stores',
    icon: '🔫',
    isGunStore: true,
    ownedLabel: 'Visited',
    searchPlaceholder: 'Search Phil\'s Ammu-Nation, Black Eagle, Woodhatch, Vice-Dale, weapon, service...',
    affiliateContext: 'Affiliate link · As an Amazon Associate we earn from qualifying purchases at no extra cost to you.',
    primaryFilter: {
      label: 'County',
      getValue: function (it) { return it.county || it.region || 'Vice-Dale County'; },
      order: ['Vice-Dale County', 'Mariana County', 'Kelly County', 'Leonard County', 'Lummox County']
    },
    secondaryFilters: [
      {
        id: 'storeType',
        label: 'All Store Types',
        getValue: function (it) { return it.storeType || 'Ammu-Nation'; }
      },
      {
        id: 'tier',
        label: 'All Inventory Tiers',
        getValue: function (it) { return it.inventoryTier || 'Standard'; }
      },
      {
        id: 'service',
        label: 'All Services',
        getValues: function (it) { return Array.isArray(it.services) ? it.services : []; }
      }
    ],
    toggles: [
      { id: 'hasPin', label: '📍 Has Map Pin' },
      { id: 'favorites', label: '★ Favorites' },
      { id: 'owned', label: '✓ Visited' }
    ],
    sorts: [
      { id: 'default', label: 'Sort: Directory Order' },
      { id: 'name', label: 'Sort: Store Name (A–Z)' },
      { id: 'region', label: 'Sort: Region' },
      { id: 'updated', label: 'Sort: Recently Updated' }
    ],
    getSubtitle: function (it) {
      return [it.county || it.region, it.inventoryTier ? (it.inventoryTier + ' Tier') : it.storeType].filter(Boolean).join(' · ');
    },
    getTopLeftBadge: function (it) { return it.inventoryTier ? (it.inventoryTier + ' · ' + (it.storeType || 'Gun Store')) : (it.storeType || 'Gun Store'); },
    getBottomRightBadge: function (it) { return (it.county || it.region) ? '📍 ' + (it.county || it.region) : ''; },
    getCardSpecs: function (it) {
      var rows = [
        { k: 'County / Location', v: [it.county, it.locationDetail].filter(Boolean).join(' — ') || 'Location unknown' },
        { k: 'Inventory Tier', v: formatValue(it.inventoryTier, 'Standard') },
        { k: 'Available Weapons', v: formatValue(it.availableWeapons, 'Availability unverified'), muted: !isRealVerifiedValue(it.availableWeapons) }
      ];
      if (Array.isArray(it.services) && it.services.length) {
        rows.push({ k: 'Services', v: it.services.join(' · ') });
      }
      return rows;
    },
    getModalFields: function (it) {
      var fields = [
        { k: 'Store Type', v: formatValue(it.storeType, 'Not yet confirmed') },
        { k: 'County', v: formatValue(it.county || it.region, 'Location unknown') },
        { k: 'Inventory Tier', v: formatValue(it.inventoryTier, 'Standard') },
        { k: 'Location Detail', v: formatValue(it.locationDetail, 'Location unknown') },
        { k: 'Services', v: formatValue(it.services, 'Not yet confirmed') }
      ];
      if (hasText(it.pinCoordinateStatus)) fields.push({ k: 'Map Pin Status', v: it.pinCoordinateStatus });
      return fields;
    },
    getModalExtraHtml: function (it) {
      if (!Array.isArray(it.availableWeapons) || !it.availableWeapons.length) return '';
      return (
        '<div class="wdb-modal-section">' +
          '<h4>🔫 Available Weapons &amp; Stock Highlights</h4>' +
          '<div class="wdb-tag-list">' +
            it.availableWeapons.map(function (w) {
              return '<span class="wdb-mini-tag is-green">' + esc(w) + '</span>';
            }).join('') +
          '</div>' +
        '</div>'
      );
    },
    compareFields: [
      { k: 'Store Type', get: function (it) { return it.storeType; } },
      { k: 'Region', get: function (it) { return it.region; }, fallback: 'Location unknown' },
      { k: 'Location Detail', get: function (it) { return it.locationDetail; }, fallback: 'Location unknown' },
      { k: 'Available Weapons', get: function (it) { return formatValue(it.availableWeapons); }, fallback: 'Availability unverified' },
      { k: 'Services', get: function (it) { return formatValue(it.services); } }
    ],
    getSearchText: function (it) {
      return [it.name, it.storeType, it.region, it.locationDetail, formatValue(it.availableWeapons), formatValue(it.services), it.notes].join(' ');
    }
  });

  // 5. RADIO STATIONS SCHEMA (ZERO MP3 / ZERO AUDIO PLAYERS)
  registerCategory('radio', {
    key: 'radio',
    title: 'Radio Stations',
    icon: '📻',
    isRadio: true,
    ownedLabel: 'Unlocked / Heard',
    searchPlaceholder: 'Search stations (Flash FM, V-Rock, Cocoteo), DJs (Bad Bunny, Robyn), songs...',
    affiliateContext: 'Affiliate links — support GTA6HeistGuide.com with launch keys, low-ping ExitLag routing, or 9:16 clipping tools:',
    primaryFilter: {
      label: 'Genre',
      getValue: function (it) { return it.genreGroup || 'Music'; },
      order: ['Rap & Hip-Hop', 'Pop & Synth', 'Latin & Tropical', 'Rock & Metal', 'Electronic & Club', 'Country & Blues', 'Jazz, Soul & Classical', 'Talk (DMCA-Safe)']
    },
    secondaryFilters: [
      {
        id: 'special',
        label: 'All Station Types',
        getValue: function (it) {
          if (it.dmcaSafe) return 'DMCA-Safe Streamer Pick';
          if (it.secretUnlock) return 'Secret Unlockable Station';
          return 'Standard Radio Wheel';
        }
      }
    ],
    toggles: [
      { id: 'dmcaSafe', label: '🎙️ DMCA-Safe Only', test: function (it) { return Boolean(it.dmcaSafe); } },
      { id: 'secret', label: '🔒 Secret Unlockable', test: function (it) { return Boolean(it.secretUnlock); } },
      { id: 'favorites', label: '★ Favorites' },
      { id: 'owned', label: '✓ Unlocked / Heard' }
    ],
    sorts: [
      { id: 'default', label: 'Sort: Dial Order' },
      { id: 'name', label: 'Sort: Station Name (A–Z)' },
      { id: 'frequency', label: 'Sort: Frequency' },
      { id: 'genre', label: 'Sort: Genre' }
    ],
    getSubtitle: function (it) {
      return [it.frequency, it.genre].filter(Boolean).join(' · ');
    },
    getCardSpecs: function (it) {
      var rows = [
        { k: 'DJ / Host', v: formatValue(it.dj, 'Not yet confirmed') },
        { k: 'Genre', v: formatValue(it.genre, 'Not yet confirmed') }
      ];
      if (Array.isArray(it.verifiedTracklist) && it.verifiedTracklist.length) {
        rows.push({
          k: 'Verified Tracks',
          v: it.verifiedTracklist.slice(0, 2).join(' · ') + (it.verifiedTracklist.length > 2 ? ' (+' + (it.verifiedTracklist.length - 2) + ' more)' : '')
        });
      }
      if (it.secretUnlock && hasText(it.unlockRequirement)) {
        rows.push({ k: 'Unlock', v: it.unlockRequirement });
      }
      return rows;
    },
    getModalFields: function (it) {
      var fields = [
        { k: 'Station Name', v: it.name },
        { k: 'DJ / Host(s)', v: formatValue(it.dj, 'Not yet confirmed') },
        { k: 'Genre', v: formatValue(it.genre, 'Not yet confirmed') },
        { k: 'Frequency / Dial', v: formatValue(it.frequency, 'Not yet confirmed') },
        { k: 'Streamer DMCA Status', v: it.dmcaSafe ? 'DMCA-Safe Talk Radio (No Licensed Music)' : 'Licensed Music (Enable In-Game Streamer Audio Mode)' }
      ];
      if (hasText(it.unlockRequirement)) {
        fields.push({ k: 'Availability / Unlock', v: it.unlockRequirement });
      }
      return fields;
    },
    getModalExtraHtml: function (it) {
      if (!Array.isArray(it.verifiedTracklist) || !it.verifiedTracklist.length) {
        return '<div class="wdb-modal-section"><h4>🎵 Verified Tracklist</h4><p style="margin:0; color:#94a3b8; font-size:0.82rem;">Not yet confirmed — tracklist entries are added as verified in-game.</p></div>';
      }
      return (
        '<div class="wdb-modal-section">' +
          '<h4>🎵 Verified Tracklist / Segments (Reference Index — Zero Hosted Audio)</h4>' +
          '<ul class="wdb-tracklist">' +
            it.verifiedTracklist.map(function (t, i) {
              return '<li><span style="color:var(--neon-cyan,#00f0ff); font-family:var(--font-mono,monospace); margin-right:0.45rem;">' + String(i + 1).padStart(2, '0') + '.</span>' + esc(t) + '</li>';
            }).join('') +
          '</ul>' +
        '</div>'
      );
    },
    compareFields: [
      { k: 'Frequency', get: function (it) { return it.frequency; } },
      { k: 'DJ / Host', get: function (it) { return it.dj; } },
      { k: 'Genre', get: function (it) { return it.genre; } },
      { k: 'DMCA-Safe', get: function (it) { return it.dmcaSafe ? 'Yes (Talk Radio)' : 'No (Licensed Tracks)'; } },
      { k: 'Unlock Requirement', get: function (it) { return it.unlockRequirement || 'Available on Radio Wheel'; } },
      { k: 'Verified Tracklist', get: function (it) { return Array.isArray(it.verifiedTracklist) ? it.verifiedTracklist.join(' • ') : ''; } }
    ],
    getSearchText: function (it) {
      return [it.name, it.frequency, it.dj, it.genre, it.genreGroup, it.unlockRequirement, formatValue(it.verifiedTracklist), it.notes].join(' ');
    }
  });

  // 6. ANIMALS & WILDLIFE COMPATIBILITY SCHEMA (PASS 3 COMPATIBLE)
  registerCategory('animals', {
    key: 'animals',
    title: 'Animals & Wildlife',
    icon: '🐊',
    ownedLabel: 'Studied',
    searchPlaceholder: 'Search species, region, habitat, Bret Vogel, Legendary Hunter...',
    affiliateContext: 'Affiliate links — support GTA6HeistGuide.com with verified launch keys, ExitLag, or creator tools:',
    primaryFilter: {
      label: 'Wildlife Category',
      getValue: function (it) { return it.category || 'Wildlife'; },
      order: ['Land & Predators', 'Birds', 'Marine & Aquatic', 'Domestic/Pettable']
    },
    secondaryFilters: [
      {
        id: 'region',
        label: 'All Regions',
        getValue: function (it) { return it.region || ''; }
      }
    ],
    toggles: [
      { id: 'targetDeck', label: '🎯 Bret Vogel Target Deck', test: function (it) { return Array.isArray(it.tags) && it.tags.indexOf('target-deck') >= 0; } },
      { id: 'legendary', label: '👑 Legendary Hunter', test: function (it) { return Array.isArray(it.tags) && it.tags.indexOf('legendary-hunter') >= 0; } },
      { id: 'verifiedShot', label: '✓ Verified Screenshots' },
      { id: 'favorites', label: '★ Favorites' },
      { id: 'owned', label: '✓ Studied' }
    ],
    sorts: [
      { id: 'verified', label: 'Sort: Verified & Photos First' },
      { id: 'name', label: 'Sort: Species Name (A–Z)' },
      { id: 'region', label: 'Sort: Region' }
    ],
    getSubtitle: function (it) { return [it.category, it.region].filter(Boolean).join(' · '); },
    getTopLeftBadge: function (it) { return it.category || 'Wildlife'; },
    getBottomRightBadge: function (it) { return it.region ? '📍 ' + it.region : ''; },
    getCardSpecs: function (it) {
      return [
        { k: 'Habitat', v: formatValue(it.habitat, 'Location unknown') },
        { k: 'Behavior', v: formatValue(it.danger, 'Not yet confirmed') }
      ];
    },
    getModalFields: function (it) {
      return [
        { k: 'Category', v: formatValue(it.category, 'Not yet confirmed') },
        { k: 'Primary Region', v: formatValue(it.region, 'Location unknown') },
        { k: 'Habitat', v: formatValue(it.habitat, 'Location unknown') },
        { k: 'Behavior / Threat', v: formatValue(it.danger, 'Not yet confirmed') }
      ];
    },
    compareFields: [
      { k: 'Category', get: function (it) { return it.category; } },
      { k: 'Region', get: function (it) { return it.region; } },
      { k: 'Habitat', get: function (it) { return it.habitat; } },
      { k: 'Behavior / Threat', get: function (it) { return it.danger; } }
    ],
    getSearchText: function (it) {
      return [it.name, it.category, it.region, it.habitat, it.danger, formatValue(it.tags), it.notes].join(' ');
    }
  });

  // ========================================================================
  // ENGINE INSTANCE MOUNT
  // ========================================================================
  function mount(options) {
    injectStyles();
    options = options || {};
    var rootEl = typeof options.container === 'string' ? document.querySelector(options.container) : options.container;
    if (!rootEl) return null;

    var categoryKey = options.category;
    var schema = options.schema || CATEGORY_SCHEMAS[categoryKey];
    if (!schema) {
      rootEl.innerHTML = '<div style="padding:1.5rem; color:#f87171;">Unknown World Database category: ' + esc(categoryKey) + '</div>';
      return null;
    }

    var dataUrl = options.dataUrl || ('/data/' + categoryKey + '.json');
    var showAffiliateBar = options.showAffiliateBar !== false;
    var affiliatePosition = options.affiliatePosition || 'before-grid';
    var progressPosition = options.progressPosition || 'before-controls';
    var showProgressStrip = options.showProgressStrip !== false;
    var maxInitialItems = typeof options.maxItems === 'number' ? options.maxItems : 0;

    var state = {
      items: [],
      datasetMeta: {},
      search: '',
      primaryVal: 'ALL',
      secondaryVals: {},
      activeToggles: {},
      sortBy: (schema.sorts && schema.sorts[0] && schema.sorts[0].id) || 'name',
      compareIds: [],
      activeModalItem: null
    };

    var uid = 'wdb_' + categoryKey.replace(/[^a-z0-9]/gi, '_') + '_' + Math.random().toString(36).slice(2, 7);

    var progressHtml = showProgressStrip
      ? '<div class="wdb-progress-strip" data-wdb-progress>' +
          '<div class="wdb-progress-stats">' +
            '<span class="wdb-progress-pill is-green" data-wdb-owned-count>' + esc(schema.ownedLabel || 'Owned') + ': 0 / 0</span>' +
            '<span class="wdb-progress-pill is-amber" data-wdb-fav-count>★ Favorites: 0</span>' +
            '<span class="wdb-progress-pill" data-wdb-verified-count>Verified Entries: 0</span>' +
          '</div>' +
          '<div class="wdb-progress-actions">' +
            '<button type="button" class="wdb-mini-btn" data-wdb-export>⬇ Export .json</button>' +
            '<button type="button" class="wdb-mini-btn is-green" data-wdb-import>⬆ Import .json</button>' +
            '<input type="file" accept=".json,application/json" style="display:none;" data-wdb-file>' +
            '<button type="button" class="wdb-mini-btn is-danger" data-wdb-reset>↺ Reset ' + esc(schema.title) + '</button>' +
          '</div>' +
        '</div>'
      : '';

    var affHtml = showAffiliateBar ? getAffiliateStripHtml(schema.affiliateContext, categoryKey) : '';

    // Build shell HTML
    rootEl.innerHTML =
      '<div class="wdb-shell" id="' + uid + '">' +
        (progressPosition === 'before-controls' ? progressHtml : '') +
        '<section class="wdb-controls" aria-label="' + esc(schema.title) + ' search and filters">' +
          '<div class="wdb-controls-top">' +
            '<div class="wdb-search-wrap">' +
              '<span class="wdb-search-icon" aria-hidden="true">🔍</span>' +
              '<input type="search" class="wdb-search-input" data-wdb-search aria-label="Search ' + esc(schema.title) + '" placeholder="' + esc(schema.searchPlaceholder || 'Search database...') + '">' +
            '</div>' +
            '<div data-wdb-secondary-wrap style="display:flex; flex-wrap:wrap; gap:0.5rem;"></div>' +
            '<select class="wdb-select" data-wdb-sort aria-label="Sort entries">' +
              (schema.sorts || [{ id: 'name', label: 'Sort: Name (A–Z)' }]).map(function (s) {
                return '<option value="' + esc(s.id) + '">' + esc(s.label) + '</option>';
              }).join('') +
            '</select>' +
          '</div>' +
          '<div class="wdb-pill-row" data-wdb-primary-pills></div>' +
          '<div class="wdb-toggle-row">' +
            '<div class="wdb-toggle-chips" data-wdb-toggles></div>' +
            '<div class="wdb-result-meta" data-wdb-result-count>Loading ' + esc(schema.title.toLowerCase()) + '...</div>' +
          '</div>' +
        '</section>' +
        (affiliatePosition === 'before-grid' ? affHtml : '') +
        '<div class="wdb-grid" data-wdb-grid></div>' +
        (progressPosition === 'after-grid' ? progressHtml : '') +
        (affiliatePosition === 'after-grid' ? affHtml : '') +
      '</div>';

    var shellEl = rootEl.querySelector('#' + uid);
    var gridEl = shellEl.querySelector('[data-wdb-grid]');
    var searchInput = shellEl.querySelector('[data-wdb-search]');
    var sortSelect = shellEl.querySelector('[data-wdb-sort]');
    var primaryPillsEl = shellEl.querySelector('[data-wdb-primary-pills]');
    var secondaryWrapEl = shellEl.querySelector('[data-wdb-secondary-wrap]');
    var togglesEl = shellEl.querySelector('[data-wdb-toggles]');
    var resultCountEl = shellEl.querySelector('[data-wdb-result-count]');

    // Ensure shared floating Compare Tray + Detail Modal + Compare Modal exist in body
    var trayId = uid + '_compareTray';
    var detailModalId = uid + '_detailModal';
    var compareModalId = uid + '_compareModal';

    var compareTray = document.createElement('div');
    compareTray.id = trayId;
    compareTray.className = 'wdb-compare-tray';
    compareTray.setAttribute('aria-live', 'polite');
    document.body.appendChild(compareTray);

    var detailModal = document.createElement('div');
    detailModal.id = detailModalId;
    detailModal.className = 'wdb-modal-backdrop';
    detailModal.setAttribute('role', 'dialog');
    detailModal.setAttribute('aria-modal', 'true');
    document.body.appendChild(detailModal);

    var compareModal = document.createElement('div');
    compareModal.id = compareModalId;
    compareModal.className = 'wdb-modal-backdrop';
    compareModal.setAttribute('role', 'dialog');
    compareModal.setAttribute('aria-modal', 'true');
    document.body.appendChild(compareModal);

    var lightboxModal = document.createElement('div');
    lightboxModal.id = uid + '_lightbox';
    lightboxModal.className = 'wdb-lightbox-backdrop';
    lightboxModal.setAttribute('role', 'dialog');
    lightboxModal.setAttribute('aria-modal', 'true');
    lightboxModal.setAttribute('aria-label', 'Full resolution image viewer');
    document.body.appendChild(lightboxModal);

    function isOwned(id) {
      return global.GTA6Progress ? global.GTA6Progress.isDbOwned(categoryKey, id) : false;
    }
    function toggleOwned(id) {
      if (global.GTA6Progress) global.GTA6Progress.toggleDbOwned(categoryKey, id);
    }
    function isFav(id) {
      return global.GTA6Progress ? global.GTA6Progress.isDbFavorite(categoryKey, id) : false;
    }
    function toggleFav(id) {
      if (global.GTA6Progress) global.GTA6Progress.toggleDbFavorite(categoryKey, id);
    }

    function toggleCompare(id) {
      var idx = state.compareIds.indexOf(id);
      if (idx >= 0) {
        state.compareIds.splice(idx, 1);
      } else {
        if (state.compareIds.length >= 3) {
          state.compareIds.shift();
        }
        state.compareIds.push(id);
      }
      renderCompareTray();
      renderGrid();
      if (state.activeModalItem && state.activeModalItem.id === id) {
        openDetailModal(state.activeModalItem);
      }
    }

    function renderPlaceholderHtml(item, isModal) {
      if (schema.isRadio) {
        return (
          '<div class="wdb-radio-banner">' +
            '<div>' +
              '<div class="wdb-radio-freq">' + esc(item.frequency || 'FM') + '</div>' +
              '<div class="wdb-radio-wave">' + esc(item.genre || 'Leonida Radio') + '</div>' +
            '</div>' +
            '<div style="display:flex; flex-direction:column; align-items:flex-end; gap:0.25rem;">' +
              (item.dmcaSafe ? '<span class="wdb-mini-tag is-green">🎙️ DMCA-Safe</span>' : '') +
              (item.secretUnlock ? '<span class="wdb-mini-tag is-amber">🔒 Secret Unlock</span>' : '') +
            '</div>' +
          '</div>'
        );
      }
      return (
        '<div class="wdb-placeholder" style="' + (isModal ? 'min-height:200px;' : '') + '">' +
          '<div class="wdb-ph-icon" aria-hidden="true">' + esc(schema.icon || '📦') + '</div>' +
          '<div class="wdb-ph-title">' + esc(item.name) + '</div>' +
          '<div class="wdb-ph-tag">GTA VI Capture Pending</div>' +
        '</div>'
      );
    }

    function getGunStoreArtworkPath(item) {
      var t = String(item.storeType || '').toLowerCase();
      if (t.indexOf('surplus') !== -1) return '/assets/images/gun-stores/military-surplus.svg?v=20261122_v23';
      if (t.indexOf('pawn') !== -1) return '/assets/images/gun-stores/pawn-armory.svg?v=20261122_v23';
      if (t.indexOf('hunt') !== -1) return '/assets/images/gun-stores/hunting-outfitter.svg?v=20261122_v23';
      return '/assets/images/gun-stores/ammu-nation.svg?v=20261122_v23';
    }

    function renderMediaHtml(item, isModal) {
      if (schema.isRadio) {
        var radioImg = '/assets/images/radio/' + encodeURIComponent(item.id) + '.svg?v=20261122_v23';
        var radioFallback = "var p=this.closest('.wdb-card-media,.wdb-modal-hero')||this.parentNode;p.innerHTML=this.getAttribute('data-fallback');";
        var extraBadges =
          (item.dmcaSafe ? '<span class="wdb-badge-tr">🎙️ DMCA-Safe</span>' : '') +
          (item.secretUnlock ? '<span class="wdb-badge-tr" style="background:rgba(255,184,0,0.22); border-color:var(--neon-amber,#ffb800); color:var(--neon-amber,#ffb800);">🔒 Secret Unlock</span>' : '');
        return (
          '<img src="' + radioImg + '" alt="' + esc(item.name + ' (' + (item.frequency || 'FM') + ') original station artwork') + '" width="640" height="360" decoding="async" onerror="' + radioFallback + '" data-fallback="' + esc(renderPlaceholderHtml(item, isModal)) + '">' +
          extraBadges
        );
      }
      if (item.image && item.imageVerified === true) {
        var altText = hasText(item.imageAlt) ? item.imageAlt : (item.name + ' verified GTA VI screenshot');
        var w = item.imageWidth || 1600;
        var h = item.imageHeight || 900;
        var focalPos = hasText(item.focalPosition) ? item.focalPosition : '50% 50%';
        var sizes = isModal ? '(max-width: 820px) 96vw, 780px' : '(max-width: 640px) 92vw, (max-width: 1100px) 46vw, 360px';
        var fallbackHandler = "var p=this.closest('.wdb-card-media,.wdb-modal-hero')||this.parentNode;p.innerHTML=this.getAttribute('data-fallback');";
        var imgTag = '<img src="' + esc(item.image) + '" alt="' + esc(altText) + '" width="' + esc(w) + '" height="' + esc(h) + '" style="object-position:' + esc(focalPos) + ';" loading="' + (isModal ? 'eager' : 'lazy') + '" decoding="async" onerror="' + fallbackHandler + '" data-fallback="' + esc(renderPlaceholderHtml(item, isModal)) + '">';
        var pictureHtml = imgTag;
        if (hasText(item.imageAvifSrcset) || hasText(item.imageWebpSrcset)) {
          pictureHtml =
            '<picture>' +
              (hasText(item.imageAvifSrcset) ? '<source type="image/avif" srcset="' + esc(item.imageAvifSrcset) + '" sizes="' + sizes + '">' : '') +
              (hasText(item.imageWebpSrcset) ? '<source type="image/webp" srcset="' + esc(item.imageWebpSrcset) + '" sizes="' + sizes + '">' : '') +
              imgTag +
            '</picture>';
        }
        var isRegional = /regional visual|store visual|illustrative/i.test(String(item.imageCaption || item.imageSource || ''));
        var badgeLabel = isRegional ? '📍 Regional GTA VI Visual' : '✓ Verified GTA VI Shot';
        return (
          pictureHtml +
          (isModal ? '<span class="wdb-zoom-pill">🔍 View Full Image</span>' : '<span class="wdb-badge-tr"' + (isRegional ? ' style="background:rgba(15,23,42,0.88); border-color:rgba(0,240,255,0.45); color:#67e8f9;"' : '') + '>' + badgeLabel + '</span>')
        );
      }
      if (schema.isGunStore) {
        var gsImg = getGunStoreArtworkPath(item);
        var gsFallback = "var p=this.closest('.wdb-card-media,.wdb-modal-hero')||this.parentNode;p.innerHTML=this.getAttribute('data-fallback');";
        return '<img src="' + gsImg + '" alt="' + esc(item.name + ' — ' + (item.storeType || 'Gun Store') + ' in ' + (item.county || item.region || 'Leonida')) + '" width="640" height="360" decoding="async" onerror="' + gsFallback + '" data-fallback="' + esc(renderPlaceholderHtml(item, isModal)) + '">';
      }
      return renderPlaceholderHtml(item, isModal);
    }

    function updateProgressStrip() {
      if (!showProgressStrip) return;
      var ownedEl = shellEl.querySelector('[data-wdb-owned-count]');
      var favEl = shellEl.querySelector('[data-wdb-fav-count]');
      var verEl = shellEl.querySelector('[data-wdb-verified-count]');
      var ownedCnt = state.items.filter(function (it) { return isOwned(it.id); }).length;
      var favCnt = state.items.filter(function (it) { return isFav(it.id); }).length;
      var shotCnt = state.items.filter(function (it) { return it.image && it.imageVerified === true; }).length;
      if (ownedEl) ownedEl.textContent = (schema.ownedLabel || 'Owned') + ': ' + ownedCnt + ' / ' + state.items.length;
      if (favEl) favEl.textContent = '★ Favorites: ' + favCnt;
      if (verEl) {
        verEl.textContent = schema.isRadio
          ? ('Verified Stations: ' + state.items.length)
          : (schema.isGunStore
            ? ('Verified Locations: ' + state.items.length + ' · 5 Counties')
            : ('Verified Screenshots: ' + shotCnt + ' / ' + state.items.length));
      }
    }

    function buildFilterControls() {
      // Primary filter pills
      if (schema.primaryFilter) {
        var counts = Object.create(null);
        state.items.forEach(function (it) {
          var v = schema.primaryFilter.getValue(it);
          counts[v] = (counts[v] || 0) + 1;
        });
        var ordered = [];
        (schema.primaryFilter.order || []).forEach(function (v) {
          if (counts[v]) ordered.push(v);
        });
        Object.keys(counts).forEach(function (v) {
          if (ordered.indexOf(v) === -1) ordered.push(v);
        });
        primaryPillsEl.innerHTML =
          '<button type="button" class="wdb-pill' + (state.primaryVal === 'ALL' ? ' is-active' : '') + '" data-primary="ALL">All (' + state.items.length + ')</button>' +
          ordered.map(function (v) {
            return '<button type="button" class="wdb-pill' + (state.primaryVal === v ? ' is-active' : '') + '" data-primary="' + esc(v) + '">' + esc(v) + ' (' + counts[v] + ')</button>';
          }).join('');
      }

      // Secondary dropdowns
      secondaryWrapEl.innerHTML = '';
      (schema.secondaryFilters || []).forEach(function (sf) {
        var valsSet = new Set();
        state.items.forEach(function (it) {
          if (sf.getValues) {
            sf.getValues(it).forEach(function (v) { if (hasText(v)) valsSet.add(v); });
          } else if (sf.getValue) {
            var val = sf.getValue(it);
            if (hasText(val)) valsSet.add(val);
          }
        });
        var vals = Array.from(valsSet).sort();
        var sel = document.createElement('select');
        sel.className = 'wdb-select';
        sel.setAttribute('data-sec-id', sf.id);
        sel.setAttribute('aria-label', sf.label);
        sel.innerHTML =
          '<option value="ALL">' + esc(sf.label) + '</option>' +
          vals.map(function (v) {
            return '<option value="' + esc(v) + '"' + (state.secondaryVals[sf.id] === v ? ' selected' : '') + '>' + esc(v) + '</option>';
          }).join('');
        sel.addEventListener('change', function () {
          state.secondaryVals[sf.id] = sel.value;
          renderGrid();
        });
        secondaryWrapEl.appendChild(sel);
      });

      // Toggle chips
      togglesEl.innerHTML = (schema.toggles || []).map(function (tg) {
        var active = Boolean(state.activeToggles[tg.id]);
        return '<button type="button" class="wdb-chip' + (tg.id === 'favorites' ? ' is-fav' : '') + (active ? ' is-active' : '') + '" data-toggle-id="' + esc(tg.id) + '">' + esc(tg.label) + '</button>';
      }).join('');
    }

    function getFilteredItems() {
      var q = state.search.trim().toLowerCase();
      var list = state.items.filter(function (it) {
        if (state.primaryVal !== 'ALL' && schema.primaryFilter) {
          if (schema.primaryFilter.getValue(it) !== state.primaryVal) return false;
        }
        var secs = schema.secondaryFilters || [];
        for (var i = 0; i < secs.length; i++) {
          var sf = secs[i];
          var chosen = state.secondaryVals[sf.id];
          if (chosen && chosen !== 'ALL') {
            if (sf.getValues) {
              if (sf.getValues(it).indexOf(chosen) === -1) return false;
            } else if (sf.getValue) {
              if (sf.getValue(it) !== chosen) return false;
            }
          }
        }
        var tgs = schema.toggles || [];
        for (var j = 0; j < tgs.length; j++) {
          var tg = tgs[j];
          if (!state.activeToggles[tg.id]) continue;
          if (tg.id === 'verifiedShot' && !(it.image && it.imageVerified === true)) return false;
          else if (tg.id === 'hasPin' && !getItemPinId(it)) return false;
          else if (tg.id === 'favorites' && !isFav(it.id)) return false;
          else if (tg.id === 'owned' && !isOwned(it.id)) return false;
          else if (typeof tg.test === 'function' && !tg.test(it)) return false;
        }
        if (q) {
          var hay = (schema.getSearchText ? schema.getSearchText(it) : it.name).toLowerCase();
          if (hay.indexOf(q) === -1) return false;
        }
        return true;
      });

      // Sorting
      var sorted = list.slice();
      if (state.sortBy === 'name') {
        sorted.sort(function (a, b) { return String(a.name || '').localeCompare(String(b.name || '')); });
      } else if (state.sortBy === 'class' && schema.primaryFilter) {
        sorted.sort(function (a, b) {
          var ca = schema.primaryFilter.getValue(a);
          var cb = schema.primaryFilter.getValue(b);
          return ca.localeCompare(cb) || String(a.name || '').localeCompare(String(b.name || ''));
        });
      } else if (state.sortBy === 'region') {
        sorted.sort(function (a, b) {
          var ra = String(a.region || (Array.isArray(a.spawnRegions) ? a.spawnRegions[0] : '') || 'zzz');
          var rb = String(b.region || (Array.isArray(b.spawnRegions) ? b.spawnRegions[0] : '') || 'zzz');
          return ra.localeCompare(rb) || String(a.name || '').localeCompare(String(b.name || ''));
        });
      } else if (state.sortBy === 'frequency') {
        sorted.sort(function (a, b) {
          return (parseFloat(a.frequency) || 999) - (parseFloat(b.frequency) || 999);
        });
      } else if (state.sortBy === 'genre') {
        sorted.sort(function (a, b) {
          return String(a.genre || '').localeCompare(String(b.genre || '')) || String(a.name || '').localeCompare(String(b.name || ''));
        });
      } else if (state.sortBy === 'updated') {
        sorted.sort(function (a, b) {
          return String(b.lastUpdated || '').localeCompare(String(a.lastUpdated || '')) || String(a.name || '').localeCompare(String(b.name || ''));
        });
      } else if (state.sortBy === 'verified') {
        sorted.sort(function (a, b) {
          var sa = (a.image && a.imageVerified === true ? 2 : 0) + (String(a.verificationStatus || '').toLowerCase() === 'confirmed' ? 1 : 0);
          var sb = (b.image && b.imageVerified === true ? 2 : 0) + (String(b.verificationStatus || '').toLowerCase() === 'confirmed' ? 1 : 0);
          return (sb - sa) || String(a.name || '').localeCompare(String(b.name || ''));
        });
      }
      return sorted;
    }

    function renderGrid() {
      updateProgressStrip();
      var filtered = getFilteredItems();
      var displayList = maxInitialItems > 0 ? filtered.slice(0, maxInitialItems) : filtered;
      resultCountEl.textContent = 'Showing ' + displayList.length + ' of ' + state.items.length + ' ' + schema.title.toLowerCase();

      if (!displayList.length) {
        gridEl.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:2rem; color:#94a3b8; background:rgba(10,16,28,0.85); border:1px dashed rgba(255,255,255,0.14); border-radius:10px;">No ' + esc(schema.title.toLowerCase()) + ' matched your active filters. Try clearing search or filter chips.</div>';
        return;
      }

      function renderCardHtml(it) {
        var owned = isOwned(it.id);
        var fav = isFav(it.id);
        var compared = state.compareIds.indexOf(it.id) >= 0;
        var pinId = getItemPinId(it);
        var specs = schema.getCardSpecs ? schema.getCardSpecs(it) : [];
        var warn = schema.getWarning ? schema.getWarning(it) : '';
        var verStatus = it.verificationStatus || 'Confirmed';
        var topLeft = !schema.isRadio && schema.getTopLeftBadge ? schema.getTopLeftBadge(it) : '';
        var botRight = !schema.isRadio && schema.getBottomRightBadge ? schema.getBottomRightBadge(it) : '';

        var cardNote = hasText(it.notes) ? String(it.notes) : '';
        if (schema.isRadio && cardNote) {
          cardNote = cardNote
            .replace(/Verified Leonida radio station\.\s*/gi, '')
            .replace(/Reference tracklist only\s*[—–-]\s*zero hosted MP3 files or audio players\.?/gi, '')
            .trim();
        }
        var isRegionalCap = /regional visual|store visual|illustrative/i.test(String(it.imageCaption || it.imageSource || ''));
        var capBar = (it.image && it.imageVerified === true && isRegionalCap && hasText(it.imageCaption))
          ? '<div style="font-size:0.66rem; color:#94a3b8; padding:0.26rem 0.72rem; background:rgba(6,10,20,0.82); border-bottom:1px solid rgba(255,255,255,0.06); line-height:1.3;">' + esc(it.imageCaption) + '</div>'
          : '';
        return (
          '<article class="wdb-card' + (owned ? ' is-owned' : '') + (compared ? ' is-compared' : '') + '" data-wdb-open="' + esc(it.id) + '" tabindex="0">' +
            '<div class="wdb-card-media' + (schema.isRadio ? ' is-radio' : '') + '">' +
              renderMediaHtml(it, false) +
              (topLeft ? '<span class="wdb-badge-tl">' + esc(topLeft) + '</span>' : '') +
              (botRight ? '<span class="wdb-badge-br">' + esc(botRight) + '</span>' : '') +
            '</div>' +
            capBar +
            '<div class="wdb-card-body">' +
              '<div class="wdb-card-head">' +
                '<div>' +
                  '<h3 class="wdb-card-title">' + esc(it.name) + '</h3>' +
                  (schema.getSubtitle ? '<div class="wdb-card-sub">' + esc(schema.getSubtitle(it)) + '</div>' : '') +
                '</div>' +
                '<span class="wdb-ver-pill ' + verificationBadgeClass(verStatus) + '">' + esc(verStatus) + '</span>' +
              '</div>' +
              (warn ? '<div class="wdb-warn-banner">⚠️ ' + esc(warn) + '</div>' : '') +
              (specs.length
                ? '<div class="wdb-specs-list">' +
                    specs.map(function (r) {
                      return '<div class="wdb-spec-row"><span class="wdb-spec-k">' + esc(r.k) + '</span><span class="wdb-spec-v' + (r.muted ? ' is-muted' : '') + '">' + esc(r.v) + '</span></div>';
                    }).join('') +
                  '</div>'
                : '') +
              (cardNote ? '<p class="wdb-card-note">' + esc(cardNote) + '</p>' : '') +
              '<div class="wdb-card-actions">' +
                '<div class="wdb-action-group">' +
                  '<button type="button" class="wdb-act-btn' + (fav ? ' is-fav' : '') + '" data-wdb-fav="' + esc(it.id) + '" aria-pressed="' + (fav ? 'true' : 'false') + '" title="Toggle Favorite">' + (fav ? '★ Fav' : '☆ Fav') + '</button>' +
                  '<button type="button" class="wdb-act-btn' + (owned ? ' is-owned' : '') + '" data-wdb-own="' + esc(it.id) + '" aria-pressed="' + (owned ? 'true' : 'false') + '" title="Toggle ' + esc(schema.ownedLabel || 'Owned') + '">' + (owned ? '✓ ' + esc(schema.ownedLabel || 'Owned') : '+ ' + esc(schema.ownedLabel || 'Owned')) + '</button>' +
                  '<button type="button" class="wdb-act-btn' + (compared ? ' is-cmp' : '') + '" data-wdb-cmp="' + esc(it.id) + '" aria-pressed="' + (compared ? 'true' : 'false') + '" title="Compare up to 3">⚖️ ' + (compared ? 'Added' : 'Compare') + '</button>' +
                '</div>' +
                (pinId
                  ? '<a href="/map?pin=' + encodeURIComponent(pinId) + '" class="wdb-map-pill" data-wdb-map-link>📍 Map Pin</a>'
                  : (schema.isRadio
                    ? '<span class="wdb-card-cta-pill">View Station &rarr;</span>'
                    : '<span class="wdb-card-cta-pill">Details &rarr;</span>')) +
              '</div>' +
            '</div>' +
          '</article>'
        );
      }

      if (categoryKey === 'vehicles' && state.primaryVal === 'ALL' && !state.search.trim() && maxInitialItems === 0) {
        var classOrder = ['Super', 'Sports', 'Sports Classics', 'Muscle', 'Off-Road', 'SUVs & Pickups', 'Motorcycles', 'Boats & Watercraft', 'Helicopters & Planes', 'Emergency'];
        var grouped = Object.create(null);
        displayList.forEach(function (it) {
          var cls = it.vehicleClass || 'Other';
          if (!grouped[cls]) grouped[cls] = [];
          grouped[cls].push(it);
        });
        var orderedKeys = classOrder.filter(function (k) { return grouped[k] && grouped[k].length; });
        Object.keys(grouped).forEach(function (k) {
          if (orderedKeys.indexOf(k) === -1) orderedKeys.push(k);
        });
        gridEl.innerHTML = orderedKeys.map(function (cls) {
          var arr = grouped[cls];
          return (
            '<div style="grid-column:1/-1; display:flex; align-items:center; justify-content:space-between; gap:0.75rem; padding:0.55rem 0.85rem; margin-top:0.5rem; background:linear-gradient(90deg, rgba(0,240,255,0.12), rgba(15,23,42,0.5)); border-left:3px solid var(--neon-cyan,#00f0ff); border-radius:6px;">' +
              '<h2 style="margin:0; font-size:1.05rem; color:#fff; font-weight:900; letter-spacing:0.02em;">' + esc(cls) + '</h2>' +
              '<span style="font-family:var(--font-mono,monospace); font-size:0.74rem; color:var(--neon-cyan,#00f0ff); font-weight:800;">' + arr.length + ' verified ' + (arr.length === 1 ? 'vehicle' : 'vehicles') + '</span>' +
            '</div>' +
            arr.map(renderCardHtml).join('')
          );
        }).join('');
        return;
      }

      gridEl.innerHTML = displayList.map(renderCardHtml).join('');
    }

    function renderCompareTray() {
      if (!state.compareIds.length) {
        compareTray.classList.remove('is-open');
        compareTray.innerHTML = '';
        return;
      }
      var selectedItems = state.compareIds.map(function (id) {
        return state.items.find(function (x) { return x.id === id; });
      }).filter(Boolean);

      compareTray.innerHTML =
        '<div class="wdb-compare-pills">' +
          '<span style="font-family:var(--font-mono,monospace); font-size:0.74rem; color:var(--neon-pink,#ff2a8d); font-weight:900;">⚖️ COMPARE (' + selectedItems.length + '/3):</span>' +
          selectedItems.map(function (it) {
            return '<span class="wdb-cmp-item-pill">' + esc(it.name) + '<button type="button" data-cmp-remove="' + esc(it.id) + '" aria-label="Remove ' + esc(it.name) + '">&times;</button></span>';
          }).join('') +
        '</div>' +
        '<div style="display:flex; gap:0.45rem; align-items:center;">' +
          '<button type="button" class="wdb-mini-btn" data-cmp-clear>Clear</button>' +
          '<button type="button" class="btn btn-primary" style="padding:0.38rem 0.85rem; font-size:0.78rem;" data-cmp-open' + (selectedItems.length < 2 ? ' disabled title="Select at least 2 items to compare"' : '') + '>Compare Side-by-Side (' + selectedItems.length + ')</button>' +
        '</div>';
      compareTray.classList.add('is-open');
    }

    function openDetailModal(item) {
      state.activeModalItem = item;
      var owned = isOwned(item.id);
      var fav = isFav(item.id);
      var compared = state.compareIds.indexOf(item.id) >= 0;
      var pinId = getItemPinId(item);
      var verStatus = item.verificationStatus || 'Confirmed';
      var fields = (schema.getModalFields ? schema.getModalFields(item) : []).filter(function (f) { return hasText(f.v); });
      var extraHtml = schema.getModalExtraHtml ? schema.getModalExtraHtml(item) : '';
      var warn = schema.getWarning ? schema.getWarning(item) : '';

      // Related links strictly filtered to verified site URLs only
      var validRelated = (Array.isArray(item.relatedLinks) ? item.relatedLinks : []).filter(function (lnk) {
        return lnk && hasText(lnk.label) && isValidRelatedUrl(lnk.url);
      });

      var hasVerifiedImg = Boolean(!schema.isRadio && item.image && item.imageVerified === true);

      // ZERO affiliate bars inside individual item popup modals!
      detailModal.innerHTML =
        '<div class="wdb-modal-card">' +
          '<button type="button" class="wdb-modal-close" data-modal-close aria-label="Close modal">&times;</button>' +
          '<div class="wdb-modal-hero' + (hasVerifiedImg ? ' is-zoomable' : '') + '"' + (hasVerifiedImg ? ' data-wdb-lightbox-open role="button" tabindex="0" title="Click to view full-resolution screenshot"' : '') + '>' + renderMediaHtml(item, true) + '</div>' +
          '<div class="wdb-modal-body">' +
            '<div class="wdb-modal-badges">' +
              (schema.primaryFilter ? '<span class="wdb-mini-tag">' + esc(schema.primaryFilter.getValue(item)) + '</span>' : '') +
              '<span class="wdb-ver-pill ' + verificationBadgeClass(verStatus) + '">' + esc(verStatus) + '</span>' +
              (hasVerifiedImg ? '<span class="wdb-mini-tag is-green">✓ Verified In-Game Screenshot</span>' : '') +
            '</div>' +
            '<h2 class="wdb-modal-title">' + esc(item.name) + '</h2>' +
            (hasVerifiedImg && hasText(item.imageCaption) ? '<p class="wdb-modal-caption">' + esc(item.imageCaption) + '</p>' : '') +
            (warn ? '<div class="wdb-warn-banner">⚠️ ' + esc(warn) + '</div>' : '') +
            '<div class="wdb-modal-grid">' +
              fields.map(function (f) {
                return '<div class="wdb-modal-stat"><div class="wdb-modal-stat-k">' + esc(f.k) + (f.status ? renderStatStatusTag(f.status) : '') + '</div><div class="wdb-modal-stat-v">' + esc(f.v) + '</div></div>';
              }).join('') +
            '</div>' +
            (hasText(item.notes) ? '<p style="color:#cbd5e1; font-size:0.88rem; line-height:1.58; margin:0;">' + esc(item.notes) + '</p>' : '') +
            extraHtml +
            (validRelated.length
              ? '<div class="wdb-modal-section">' +
                  '<h4>🔗 Related Leonida Guides &amp; Records</h4>' +
                  '<div class="wdb-related-links">' +
                    validRelated.map(function (r) {
                      return '<a href="' + esc(r.url) + '" class="wdb-related-link">' + esc(r.label) + ' &rarr;</a>';
                    }).join('') +
                  '</div>' +
                '</div>'
              : '') +
            '<div class="wdb-ver-meta">' +
              '<span>Status: <strong style="color:#e2e8f0;">' + esc(verStatus) + '</strong></span>' +
              (hasVerifiedImg && hasText(item.imageSource) ? '<span>Image Credit: <strong style="color:var(--neon-cyan,#00f0ff);">' + esc(item.imageSource) + '</strong></span>' : '') +
              (hasText(item.lastUpdated) ? '<span>Last Updated: <strong style="color:#e2e8f0;">' + esc(formatDateStamp(item.lastUpdated)) + '</strong></span>' : '') +
              (hasText(item.sourceUrl) ? '<a href="' + esc(item.sourceUrl) + '" target="_blank" rel="noopener noreferrer">Source Reference ↗</a>' : '') +
            '</div>' +
            '<div class="wdb-modal-footer">' +
              '<div class="wdb-action-group">' +
                '<button type="button" class="wdb-act-btn' + (fav ? ' is-fav' : '') + '" data-modal-fav="' + esc(item.id) + '">' + (fav ? '★ Favorited' : '☆ Favorite') + '</button>' +
                '<button type="button" class="wdb-act-btn' + (owned ? ' is-owned' : '') + '" data-modal-own="' + esc(item.id) + '">' + (owned ? '✓ ' + esc(schema.ownedLabel || 'Owned') : '+ Mark ' + esc(schema.ownedLabel || 'Owned')) + '</button>' +
                '<button type="button" class="wdb-act-btn' + (compared ? ' is-cmp' : '') + '" data-modal-cmp="' + esc(item.id) + '">⚖️ ' + (compared ? 'In Compare' : 'Compare') + '</button>' +
              '</div>' +
              (pinId
                ? '<a href="/map.html?pin=' + encodeURIComponent(pinId) + '" class="btn-map-ping" style="text-decoration:none;">📍 View on Map &rarr;</a>'
                : '') +
            '</div>' +
          '</div>' +
        '</div>';

      detailModal.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    }

    function closeDetailModal() {
      detailModal.classList.remove('is-open');
      state.activeModalItem = null;
      if (!compareModal.classList.contains('is-open') && !lightboxModal.classList.contains('is-open')) {
        document.body.style.overflow = '';
      }
    }

    function openLightbox(item) {
      if (!item || !item.image || item.imageVerified !== true) return;
      var altText = hasText(item.imageAlt) ? item.imageAlt : (item.name + ' verified GTA VI screenshot');
      var capText = hasText(item.imageCaption) ? item.imageCaption : altText;
      var imgTag = '<img class="wdb-lightbox-img" src="' + esc(item.image) + '" alt="' + esc(altText) + '" width="' + esc(item.imageWidth || 1600) + '" height="' + esc(item.imageHeight || 900) + '" decoding="async">';
      var mediaHtml = (hasText(item.imageAvifSrcset) || hasText(item.imageWebpSrcset))
        ? '<picture>' +
            (hasText(item.imageAvifSrcset) ? '<source type="image/avif" srcset="' + esc(item.imageAvifSrcset) + '" sizes="96vw">' : '') +
            (hasText(item.imageWebpSrcset) ? '<source type="image/webp" srcset="' + esc(item.imageWebpSrcset) + '" sizes="96vw">' : '') +
            imgTag +
          '</picture>'
        : imgTag;
      lightboxModal.innerHTML =
        '<button type="button" class="wdb-lightbox-close" data-wdb-lightbox-close aria-label="Close full-resolution image">&times;</button>' +
        mediaHtml +
        '<div class="wdb-lightbox-caption">' +
          '<div class="wdb-lightbox-title">' + esc(item.name) + '</div>' +
          '<div class="wdb-lightbox-desc">' + esc(capText) + '</div>' +
          (hasText(item.imageSource) ? '<div class="wdb-lightbox-credit">📷 Source Attribution: ' + esc(item.imageSource) + '</div>' : '') +
        '</div>';
      lightboxModal.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
      lightboxModal.classList.remove('is-open');
      lightboxModal.innerHTML = '';
      if (!detailModal.classList.contains('is-open') && !compareModal.classList.contains('is-open')) {
        document.body.style.overflow = '';
      }
    }

    function buildCompareShareUrl(selected) {
      var origin = (global.GTA6ShareTools && global.GTA6ShareTools.ORIGIN) || 'https://www.gta6heistguide.com';
      var pathname = (global.location && global.location.pathname) || ('/' + categoryKey + '.html');
      return origin + pathname + '?compare=' + selected.map(function (it) { return encodeURIComponent(it.id); }).join(',');
    }

    function buildCompareReddit(selected, activeRows) {
      var names = selected.map(function (it) { return it.name; }).join(' vs. ');
      var header = '| Stat / Field | ' + selected.map(function (it) { return it.name; }).join(' | ') + ' |';
      var sep = '|---|' + selected.map(function () { return '---|'; }).join('');
      var body = activeRows.map(function (cf) {
        return '| **' + cf.k + '** | ' + selected.map(function (it) {
          var raw = cf.get(it);
          var verified = isRealVerifiedValue(raw);
          var st = cf.getStatus ? cf.getStatus(it) : '';
          var txt = verified ? formatValue(raw) : (cf.fallback || 'Not yet confirmed');
          return txt + (st && st !== 'Not yet confirmed' ? ' *(' + st + ')*' : '');
        }).join(' | ') + ' |';
      });
      var url = buildCompareShareUrl(selected);
      if (global.GTA6ShareTools) {
        return global.GTA6ShareTools.formatReddit('GTA 6 ' + schema.title + ' Comparison: ' + names, [header, sep].concat(body), url);
      }
      return '### GTA 6 ' + schema.title + ' Comparison: ' + names + '\n\n' + [header, sep].concat(body).join('\n') + '\n\n' + url + '\n\n*Created with GTA6HeistGuide.com*';
    }

    function buildCompareDiscord(selected, activeRows) {
      var names = selected.map(function (it) { return it.name; }).join(' vs. ');
      var lines = activeRows.slice(0, 8).map(function (cf) {
        var vals = selected.map(function (it) {
          var raw = cf.get(it);
          var verified = isRealVerifiedValue(raw);
          var st = cf.getStatus ? cf.getStatus(it) : '';
          var txt = verified ? formatValue(raw) : (cf.fallback || 'Not yet confirmed');
          return '**' + it.name + ':** ' + txt + (st && st !== 'Not yet confirmed' ? ' (' + st + ')' : '');
        }).join(' | ');
        return '• **' + cf.k + '** — ' + vals;
      });
      var url = buildCompareShareUrl(selected);
      if (global.GTA6ShareTools) {
        return global.GTA6ShareTools.formatDiscord('⚖️ GTA 6 ' + schema.title + ' Comparison: ' + names, lines, url);
      }
      return '**⚖️ GTA 6 ' + schema.title + ' Comparison: ' + names + '**\n' + lines.join('\n') + '\n' + url + '\n*Created with GTA6HeistGuide.com*';
    }

    function openCompareModal() {
      var selected = state.compareIds.map(function (id) {
        return state.items.find(function (x) { return x.id === id; });
      }).filter(Boolean);
      if (selected.length < 2) return;
      if (typeof window.GTA6Track === 'function') {
        window.GTA6Track('vehicle_compare', {
          page_category: 'database',
          database_type: categoryKey || 'vehicles',
          interaction_type: 'compare_modal',
          item_count: selected.length
        });
      }

      // Only show rows where at least one selected item has a verified value
      var activeRows = (schema.compareFields || []).filter(function (cf) {
        return selected.some(function (it) {
          return isRealVerifiedValue(cf.get(it));
        });
      });

      var shareBarHtml = global.GTA6ShareTools
        ? global.GTA6ShareTools.buildShareBarHtml('wdbCmp')
        : (
          '<div style="display:flex; flex-wrap:wrap; gap:0.45rem;">' +
            '<button type="button" class="wdb-mini-btn" data-share-action="reddit">📋 Copy for Reddit</button>' +
            '<button type="button" class="wdb-mini-btn" data-share-action="discord">💬 Copy for Discord</button>' +
            '<button type="button" class="wdb-mini-btn" data-share-action="link">🔗 Copy Share Link</button>' +
          '</div>'
        );

      compareModal.innerHTML =
        '<div class="wdb-modal-card is-wide">' +
          '<button type="button" class="wdb-modal-close" data-cmp-modal-close aria-label="Close comparison">&times;</button>' +
          '<div class="wdb-modal-body">' +
            '<div class="wdb-modal-badges"><span class="wdb-mini-tag">⚖️ SIDE-BY-SIDE COMPARISON (' + selected.length + ' ' + esc(schema.title.toUpperCase()) + ')</span></div>' +
            '<div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.65rem;">' +
              '<h2 class="wdb-modal-title">Compare Verified ' + esc(schema.title) + ' Specs</h2>' +
              shareBarHtml +
            '</div>' +
            '<div class="wdb-cmp-table-wrap">' +
              '<table class="wdb-cmp-table">' +
                '<thead><tr>' +
                  '<th>Verified Field</th>' +
                  selected.map(function (it) {
                    var thumbHtml = (it.image && it.imageVerified === true)
                      ? '<div style="width:100%; max-width:210px; aspect-ratio:16/9; overflow:hidden; border-radius:7px; margin:0 0 0.45rem; background:#070b14; border:1px solid rgba(0,240,255,0.22);"><img src="' + esc(it.image) + '" alt="' + esc(it.imageAlt || it.name) + '" width="400" height="225" style="width:100%; height:100%; object-fit:cover; object-position:' + esc(it.focalPosition || '50% 50%') + '; display:block;" loading="lazy" decoding="async"></div>'
                      : '';
                    return '<th style="vertical-align:bottom;">' + thumbHtml + '<div>' + esc(it.name) + '</div><div style="font-size:0.68rem; font-weight:700; color:var(--neon-cyan,#00f0ff); margin-top:2px;">' + esc(it.verificationStatus || 'Confirmed') + '</div></th>';
                  }).join('') +
                '</tr></thead>' +
                '<tbody>' +
                  activeRows.map(function (cf) {
                    return '<tr><td>' + esc(cf.k) + '</td>' +
                      selected.map(function (it) {
                        var raw = cf.get(it);
                        var verified = isRealVerifiedValue(raw);
                        var st = cf.getStatus ? cf.getStatus(it) : '';
                        var txt = verified ? formatValue(raw) : (cf.fallback || 'Not yet confirmed');
                        return '<td style="' + (verified ? 'color:#f1f5f9; font-weight:700;' : 'color:#64748b; font-style:italic;') + '">' + esc(txt) + (st ? renderStatStatusTag(st) : '') + '</td>';
                      }).join('') +
                    '</tr>';
                  }).join('') +
                  '<tr><td>Interactive Map</td>' +
                    selected.map(function (it) {
                      var pin = getItemPinId(it);
                      return '<td>' + (pin ? '<a href="/map?pin=' + encodeURIComponent(pin) + '" class="wdb-map-pill">📍 View on Map</a>' : '<span style="color:#64748b; font-style:italic;">Location unknown</span>') + '</td>';
                    }).join('') +
                  '</tr>' +
                '</tbody>' +
              '</table>' +
            '</div>' +
          '</div>' +
        '</div>';

      compareModal._activeSelected = selected;
      compareModal._activeRows = activeRows;
      compareModal.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    }

    function closeCompareModal() {
      compareModal.classList.remove('is-open');
      if (!detailModal.classList.contains('is-open')) {
        document.body.style.overflow = '';
      }
    }

    // Event bindings
    searchInput.addEventListener('input', function () {
      state.search = searchInput.value || '';
      renderGrid();
    });
    sortSelect.addEventListener('change', function () {
      state.sortBy = sortSelect.value;
      renderGrid();
    });
    primaryPillsEl.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-primary]');
      if (!btn) return;
      state.primaryVal = btn.getAttribute('data-primary') || 'ALL';
      primaryPillsEl.querySelectorAll('.wdb-pill').forEach(function (p) {
        p.classList.toggle('is-active', p === btn);
      });
      renderGrid();
    });
    togglesEl.addEventListener('click', function (e) {
      var chip = e.target.closest('[data-toggle-id]');
      if (!chip) return;
      var tid = chip.getAttribute('data-toggle-id');
      state.activeToggles[tid] = !state.activeToggles[tid];
      chip.classList.toggle('is-active', Boolean(state.activeToggles[tid]));
      renderGrid();
    });

    gridEl.addEventListener('click', function (e) {
      var mapLink = e.target.closest('[data-wdb-map-link]');
      if (mapLink) return;
      var favBtn = e.target.closest('[data-wdb-fav]');
      if (favBtn) {
        e.stopPropagation();
        toggleFav(favBtn.getAttribute('data-wdb-fav'));
        renderGrid();
        return;
      }
      var ownBtn = e.target.closest('[data-wdb-own]');
      if (ownBtn) {
        e.stopPropagation();
        toggleOwned(ownBtn.getAttribute('data-wdb-own'));
        renderGrid();
        return;
      }
      var cmpBtn = e.target.closest('[data-wdb-cmp]');
      if (cmpBtn) {
        e.stopPropagation();
        toggleCompare(cmpBtn.getAttribute('data-wdb-cmp'));
        return;
      }
      var card = e.target.closest('[data-wdb-open]');
      if (card) {
        var found = state.items.find(function (x) { return x.id === card.getAttribute('data-wdb-open'); });
        if (found) openDetailModal(found);
      }
    });
    gridEl.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && e.target.matches('[data-wdb-open]')) {
        var found = state.items.find(function (x) { return x.id === e.target.getAttribute('data-wdb-open'); });
        if (found) openDetailModal(found);
      }
    });

    compareTray.addEventListener('click', function (e) {
      var rm = e.target.closest('[data-cmp-remove]');
      if (rm) {
        toggleCompare(rm.getAttribute('data-cmp-remove'));
        return;
      }
      if (e.target.closest('[data-cmp-clear]')) {
        state.compareIds = [];
        renderCompareTray();
        renderGrid();
        return;
      }
      if (e.target.closest('[data-cmp-open]')) {
        openCompareModal();
      }
    });

    detailModal.addEventListener('click', function (e) {
      if (e.target === detailModal || e.target.closest('[data-modal-close]')) {
        closeDetailModal();
        return;
      }
      if (e.target.closest('[data-wdb-lightbox-open]') && state.activeModalItem) {
        openLightbox(state.activeModalItem);
        return;
      }
      var mFav = e.target.closest('[data-modal-fav]');
      if (mFav) {
        toggleFav(mFav.getAttribute('data-modal-fav'));
        renderGrid();
        if (state.activeModalItem) openDetailModal(state.activeModalItem);
        return;
      }
      var mOwn = e.target.closest('[data-modal-own]');
      if (mOwn) {
        toggleOwned(mOwn.getAttribute('data-modal-own'));
        renderGrid();
        if (state.activeModalItem) openDetailModal(state.activeModalItem);
        return;
      }
      var mCmp = e.target.closest('[data-modal-cmp]');
      if (mCmp) {
        toggleCompare(mCmp.getAttribute('data-modal-cmp'));
      }
    });

    compareModal.addEventListener('click', function (e) {
      if (e.target === compareModal || e.target.closest('[data-cmp-modal-close]')) {
        closeCompareModal();
        return;
      }
      var shareBtn = e.target.closest('[data-share-action]');
      if (shareBtn && compareModal._activeSelected && compareModal._activeSelected.length >= 2) {
        var action = shareBtn.getAttribute('data-share-action');
        var sel = compareModal._activeSelected;
        var rows = compareModal._activeRows || [];
        var txt = '';
        var toast = '📋 Copied!';
        if (action === 'reddit') {
          txt = buildCompareReddit(sel, rows);
          toast = '📋 Reddit Comparison Table Copied!';
        } else if (action === 'discord') {
          txt = buildCompareDiscord(sel, rows);
          toast = '💬 Discord Comparison Copied!';
        } else if (action === 'link') {
          txt = buildCompareShareUrl(sel);
          toast = '🔗 Comparison Share Link Copied!';
        }
        if (global.GTA6ShareTools) {
          global.GTA6ShareTools.copyText(txt, shareBtn, toast);
        } else if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(txt).catch(function () {});
        }
      }
    });

    detailModal.addEventListener('keydown', function (e) {
      if ((e.key === 'Enter' || e.key === ' ') && e.target && e.target.matches('[data-wdb-lightbox-open]') && state.activeModalItem) {
        e.preventDefault();
        openLightbox(state.activeModalItem);
      }
    });

    lightboxModal.addEventListener('click', function (e) {
      if (e.target === lightboxModal || e.target.closest('[data-wdb-lightbox-close]')) {
        closeLightbox();
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        if (lightboxModal.classList.contains('is-open')) closeLightbox();
        else if (compareModal.classList.contains('is-open')) closeCompareModal();
        else if (detailModal.classList.contains('is-open')) closeDetailModal();
      }
    });

    // Wire Progress Strip Backup/Restore/Reset buttons
    if (showProgressStrip && global.GTA6Progress) {
      var expBtn = shellEl.querySelector('[data-wdb-export]');
      var impBtn = shellEl.querySelector('[data-wdb-import]');
      var fileInput = shellEl.querySelector('[data-wdb-file]');
      var resetBtn = shellEl.querySelector('[data-wdb-reset]');

      if (expBtn) expBtn.addEventListener('click', function () { global.GTA6Progress.exportJSON(); });
      if (impBtn && fileInput) {
        impBtn.addEventListener('click', function () {
          fileInput.value = '';
          fileInput.click();
        });
        fileInput.addEventListener('change', function (e) {
          var f = e.target.files && e.target.files[0];
          if (!f) return;
          var reader = new FileReader();
          reader.onload = function (evt) {
            global.GTA6Progress.openImportConfirmModal(evt.target.result, {
              onSuccess: function () { renderGrid(); }
            });
          };
          reader.readAsText(f);
        });
      }
      if (resetBtn) {
        resetBtn.addEventListener('click', function () {
          global.GTA6Progress.openResetModal({
            scope: 'db:' + categoryKey,
            scopeLabel: schema.title + ' Owned & Favorites',
            onReset: function () { renderGrid(); }
          });
        });
      }
    }

    global.addEventListener('gta6-progress-updated', function () {
      renderGrid();
      if (state.activeModalItem && detailModal.classList.contains('is-open')) {
        openDetailModal(state.activeModalItem);
      }
    });

    // Load map-pins + category JSON in parallel
    Promise.all([
      loadVerifiedPinSet(),
      fetch(dataUrl).then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
    ])
      .then(function (results) {
        var data = results[1] || {};
        state.datasetMeta = data;
        state.items = Array.isArray(data.items) ? data.items : [];
        buildFilterControls();
        renderGrid();
        if (typeof options.onLoaded === 'function') {
          options.onLoaded(data, state.items);
        }
        // Deep-link ?item=<id> or ?compare=id1,id2,id3
        try {
          var urlParams = new URLSearchParams(global.location.search);
          var deepCompare = urlParams.get('compare');
          if (deepCompare) {
            var cmpIds = deepCompare.split(',').map(function (s) { return s.trim(); }).filter(function (id) {
              return state.items.some(function (x) { return x.id === id; });
            }).slice(0, 3);
            if (cmpIds.length >= 2) {
              state.compareIds = cmpIds;
              renderCompareTray();
              renderGrid();
              openCompareModal();
            }
          }
          var deepItem = urlParams.get('item');
          if (deepItem) {
            var match = state.items.find(function (x) { return x.id === deepItem; });
            if (match) openDetailModal(match);
          }
        } catch (err) {}
      })
      .catch(function (err) {
        gridEl.innerHTML = '<div style="grid-column:1/-1; padding:1.5rem; color:#f87171;">Failed to load ' + esc(schema.title) + ' database (' + esc(err.message) + ').</div>';
      });

    var api = {
      category: categoryKey,
      refresh: renderGrid,
      openItem: function (id) {
        var found = state.items.find(function (x) { return x.id === id; });
        if (found) openDetailModal(found);
      },
      getItems: function () { return state.items.slice(); }
    };
    activeInstances.push(api);
    return api;
  }

  global.GTA6WorldDB = {
    __version: '1.2',
    registerCategory: registerCategory,
    getSchema: function (key) { return CATEGORY_SCHEMAS[key] || null; },
    listCategories: function () { return Object.keys(CATEGORY_SCHEMAS); },
    loadVerifiedPinSet: loadVerifiedPinSet,
    getAffiliateStripHtml: getAffiliateStripHtml,
    mount: mount
  };
})(window);
