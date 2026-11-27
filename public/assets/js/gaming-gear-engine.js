// ==========================================================================
// GTA6HEISTGUIDE.COM — GAMING GEAR HUB & LEONIDA EDITOR'S PICK RENDERER
// Renders the daily rotating Leonida Editor's Pick of the Day and curated
// Gaming Gear sections directly from /data/gear-products-master.json.
//
// Preserves Phase 35.1C Amazon Placement Pause everywhere else on the site
// (never alters window.SITE_CONFIG.enableAmazonProductPlacements).
// Zero auto-redirects, zero random rotation, zero timers, zero prices/ratings.
// ==========================================================================
(function (global) {
  'use strict';

  var CATALOG_URL = '/data/gear-products-master.json';
  var apiHydrator = null;
  var activeCatalog = null;
  var activePlatformFilter = 'all';

  function esc(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function normalizePlatformTag(platform) {
    var p = String(platform || '').toLowerCase();
    if (p.indexOf('ps5') !== -1 || p.indexOf('playstation') !== -1) return 'ps5';
    if (p.indexOf('xbox') !== -1) return 'xbox';
    if (p === 'pc' || p.indexOf('windows') !== -1) return 'pc';
    if (p.indexOf('stream') !== -1 || p.indexOf('desk') !== -1) return 'desk';
    return 'other';
  }

  function matchesPlatformFilter(product, filter) {
    if (!filter || filter === 'all') return true;
    var platforms = Array.isArray(product.platforms) ? product.platforms : [];
    for (var i = 0; i < platforms.length; i++) {
      if (normalizePlatformTag(platforms[i]) === filter) return true;
    }
    return false;
  }

  function getDestinationHost(urlStr) {
    try {
      return new URL(urlStr).hostname.toLowerCase();
    } catch (e) {
      return 'www.amazon.com';
    }
  }

  function buildLinkAttrs(product, placement, area, dailySlot) {
    var host = getDestinationHost(product.amazonSpecialLink);
    var slotAttr = dailySlot ? ' data-aff-daily-slot="' + esc(dailySlot) + '"' : ' data-aff-daily-slot="catalog"';
    return (
      'href="' + esc(product.amazonSpecialLink) + '"' +
      ' target="_blank" rel="sponsored nofollow noopener"' +
      ' data-aff-partner="amazon"' +
      ' data-aff-product="' + esc(product.id) + '"' +
      ' data-aff-asin="' + esc(product.asin) + '"' +
      ' data-aff-category="' + esc(product.category) + '"' +
      ' data-aff-placement="' + esc(placement) + '"' +
      ' data-aff-area="' + esc(area || 'cta') + '"' +
      ' data-aff-dest-host="' + esc(host) + '"' +
      slotAttr
    );
  }

  function renderPhotoCredit(product) {
    var lic = product.imageLicense || {};
    if (product.mediaType !== 'photo') return '';
    if (lic.creator && lic.sourceUrl && lic.licenseName && lic.licenseUrl) {
      return (
        '<div class="gg-media-credit">' +
          'Photo: <a href="' + esc(lic.sourceUrl) + '" target="_blank" rel="noopener noreferrer">' + esc(lic.creator) + '</a>' +
          ' &middot; <a href="' + esc(lic.licenseUrl) + '" target="_blank" rel="noopener noreferrer">' + esc(lic.licenseName) + '</a>' +
        '</div>'
      );
    }
    return '';
  }

  function renderPlatformPills(platforms) {
    if (!Array.isArray(platforms) || !platforms.length) return '';
    var html = '<div class="gg-platform-row" aria-label="Compatible platforms">';
    for (var i = 0; i < platforms.length; i++) {
      var key = normalizePlatformTag(platforms[i]);
      html += '<span class="gg-plat-chip gg-plat-chip--' + esc(key) + '">' + esc(platforms[i]) + '</span>';
    }
    html += '</div>';
    return html;
  }

  function renderEditorsPick(selection, catalog) {
    var mount = document.getElementById('leonidaEditorsPickMount');
    if (!mount || !selection || !selection.ok || !selection.product) return;

    var p = selection.product;
    var rotCfg = (catalog && catalog.rotationConfig) || {};
    var ctaLabel = rotCfg.ctaLabel || 'CHECK IT OUT ON AMAZON';
    var disclosureText = rotCfg.inlineDisclosure || 'Affiliate link — we may earn from qualifying purchases.';
    var assocStatement = rotCfg.disclosureStatement || 'As an Amazon Associate I earn from qualifying purchases.';
    var isPhoto = p.mediaType === 'photo';
    var dailySlot = 'daily_' + selection.calendarDate.isoDate;
    var ctaAttrs = buildLinkAttrs(p, 'editors_pick_daily', 'cta', dailySlot);
    var imgAttrs = buildLinkAttrs(p, 'editors_pick_daily', 'image', dailySlot);
    var stageBadge = isPhoto
      ? '<span class="gg-media-badge gg-media-badge--photo">Licensed Product Photo</span>'
      : '<span class="gg-media-badge gg-media-badge--illus">' + esc((p.imageLicense && p.imageLicense.badgeLabel) || 'Category Illustration') + '</span>';

    mount.innerHTML =
      '<div class="lep-card lep-accent-' + esc(p.accent || 'cyan') + '" data-daily-pick-id="' + esc(p.id) + '" data-daily-date="' + esc(dailySlot) + '">' +
        '<div class="lep-header">' +
          '<div class="lep-header-left">' +
            '<span class="lep-kicker">DAILY EDITORIAL FEATURE &middot; AMERICA/CHICAGO ROTATION</span>' +
            '<h2 class="lep-title" id="editorsPickHeading">LEONIDA EDITOR&#39;S PICK OF THE DAY</h2>' +
            '<p class="lep-subtitle">One unusual gaming discovery, selected daily.</p>' +
          '</div>' +
          '<div class="lep-date-meta" aria-label="Daily rotation schedule">' +
            '<span class="lep-date-pill">' + esc(selection.displayDate) + '</span>' +
            '<span class="lep-slot-pill">Pick #' + esc(selection.slotNumber) + ' of ' + esc(selection.poolSize) + ' &middot; Updates midnight CT</span>' +
          '</div>' +
        '</div>' +

        '<div class="lep-grid">' +
          '<div class="lep-media-col">' +
            '<a ' + imgAttrs + ' class="lep-media-stage' + (isPhoto ? ' is-photo' : ' is-illus') + '" aria-label="Check ' + esc(p.productName) + ' on Amazon">' +
              '<img src="' + esc(p.imageSource) + '" alt="' + esc(p.imageAlt) + '" width="400" height="300" loading="eager" decoding="sync">' +
              stageBadge +
            '</a>' +
            renderPhotoCredit(p) +
            '<div class="lep-cta-panel">' +
              '<a ' + ctaAttrs + ' class="lep-cta-btn">' + esc(ctaLabel) + ' <span aria-hidden="true">&rarr;</span></a>' +
              '<p class="lep-disclosure"><strong>Disclosure:</strong> ' + esc(disclosureText) + ' ' + esc(assocStatement) + ' Check current price and availability directly on Amazon.</p>' +
            '</div>' +
          '</div>' +

          '<div class="lep-body-col">' +
            '<div class="lep-meta-row">' +
              '<span class="lep-category-pill">' + esc(p.category) + '</span>' +
              '<span class="lep-brand-label">' + esc(p.manufacturer) + '</span>' +
              (p.badge ? '<span class="lep-highlight-tag">' + esc(p.badge) + '</span>' : '') +
            '</div>' +
            '<h3 class="lep-product-name">' + esc(p.productName) + '</h3>' +
            renderPlatformPills(p.platforms) +
            '<p class="lep-intro">' + esc(p.editorialIntro) + '</p>' +

            '<dl class="lep-details-grid">' +
              '<div class="lep-detail-box">' +
                '<dt>Why We Selected It</dt>' +
                '<dd>' + esc(p.whyInteresting) + '</dd>' +
              '</div>' +
              '<div class="lep-detail-box">' +
                '<dt>What Makes It Different</dt>' +
                '<dd>' + esc(p.whatMakesItDifferent) + '</dd>' +
              '</div>' +
              '<div class="lep-detail-box">' +
                '<dt>Who Might Enjoy It</dt>' +
                '<dd>' + esc(p.intendedAudience) + '</dd>' +
              '</div>' +
              '<div class="lep-detail-box">' +
                '<dt>Platform &amp; Setup Compatibility</dt>' +
                '<dd>' + esc(p.compatibility) + '</dd>' +
              '</div>' +
            '</dl>' +

            '<div class="lep-caveat">' +
              '<span class="lep-caveat-label">Honest Limitation to Consider:</span> ' +
              '<span>' + esc(p.honestDisadvantages) + '</span>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';

    mount.setAttribute('data-rendered', 'dynamic');
  }

  function renderCatalogCard(product) {
    var isPhoto = product.mediaType === 'photo';
    var placement = product.analyticsPlacement || 'gaming_gear_catalog';
    var ctaAttrs = buildLinkAttrs(product, placement, 'cta', 'catalog');
    var imgAttrs = buildLinkAttrs(product, placement, 'image', 'catalog');
    var badgeLabel = isPhoto
      ? ''
      : '<span class="gg-media-badge gg-media-badge--illus">' + esc((product.imageLicense && product.imageLicense.badgeLabel) || 'Category Illustration') + '</span>';

    return (
      '<article class="gg-card gg-accent-' + esc(product.accent || 'cyan') + '" data-product-id="' + esc(product.id) + '">' +
        '<div class="gg-card-media-wrap">' +
          '<a ' + imgAttrs + ' class="gg-card-media' + (isPhoto ? ' is-photo' : ' is-illus') + '" aria-label="Check ' + esc(product.productName) + ' on Amazon">' +
            '<img src="' + esc(product.imageSource) + '" alt="' + esc(product.imageAlt) + '" width="400" height="300" loading="lazy" decoding="async">' +
            badgeLabel +
          '</a>' +
          renderPhotoCredit(product) +
        '</div>' +
        '<div class="gg-card-body">' +
          '<div class="gg-card-top">' +
            '<span class="gg-brand">' + esc(product.manufacturer) + '</span>' +
            (product.badge ? '<span class="gg-pill">' + esc(product.badge) + '</span>' : '') +
            '<span class="gg-paid-badge">Affiliate link</span>' +
          '</div>' +
          '<h3 class="gg-card-title">' + esc(product.productName) + '</h3>' +
          renderPlatformPills(product.platforms) +
          '<p class="gg-card-desc">' + esc(product.shortDescription) + '</p>' +
          '<div class="gg-card-meta-block">' +
            '<p class="gg-card-line"><strong>Why consider it:</strong> ' + esc(product.whyInteresting) + '</p>' +
            '<p class="gg-card-line"><strong>Compatibility:</strong> ' + esc(product.compatibility) + '</p>' +
            '<p class="gg-card-line gg-card-caveat"><strong>Trade-off:</strong> ' + esc(product.honestDisadvantages) + '</p>' +
          '</div>' +
        '</div>' +
        '<div class="gg-card-foot">' +
          '<span class="gg-foot-note">Affiliate link &mdash; we may earn from qualifying purchases. Check current price on Amazon.</span>' +
          '<a ' + ctaAttrs + ' class="gg-cta-btn">Check on Amazon <span aria-hidden="true">&rarr;</span></a>' +
        '</div>' +
      '</article>'
    );
  }

  function renderSections(catalog, filter) {
    if (!global.GTA6GearRotation) return;
    var approved = global.GTA6GearRotation.getApprovedCatalogProducts(catalog);
    var grids = document.querySelectorAll('[data-gear-section-grid]');
    var totalVisible = 0;

    grids.forEach(function (grid) {
      var sectionId = grid.getAttribute('data-gear-section-grid');
      var items = approved.filter(function (p) {
        return p.sectionId === sectionId && matchesPlatformFilter(p, filter);
      });
      totalVisible += items.length;
      if (!items.length) {
        grid.innerHTML =
          '<div class="gg-empty-filter">No items in this category match the selected platform filter. Switch back to <strong>All Platforms</strong> to view every verified pick.</div>';
      } else {
        grid.innerHTML = items.map(renderCatalogCard).join('');
      }
      var countEl = document.querySelector('[data-section-count="' + sectionId + '"]');
      if (countEl) {
        countEl.textContent = items.length + (items.length === 1 ? ' verified pick' : ' verified picks');
      }
    });

    var statusEl = document.getElementById('gearFilterStatus');
    if (statusEl) {
      var labelMap = {
        all: 'All Platforms',
        ps5: 'PlayStation 5',
        xbox: 'Xbox Series X|S',
        pc: 'PC & Keyboard',
        desk: 'Desk & Streaming'
      };
      statusEl.textContent = 'Showing ' + totalVisible + ' verified recommendations (' + (labelMap[filter] || filter) + ')';
    }
  }

  function bindPlatformFilters() {
    var bar = document.getElementById('gearPlatformFilterBar');
    if (!bar || bar.dataset.bound === '1') return;
    bar.dataset.bound = '1';

    bar.addEventListener('click', function (e) {
      var btn = e.target && e.target.closest ? e.target.closest('button[data-platform-filter]') : null;
      if (!btn || !activeCatalog) return;
      var nextFilter = btn.getAttribute('data-platform-filter') || 'all';
      activePlatformFilter = nextFilter;

      bar.querySelectorAll('button[data-platform-filter]').forEach(function (b) {
        var isActive = b === btn;
        b.classList.toggle('is-active', isActive);
        b.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      });

      renderSections(activeCatalog, activePlatformFilter);
    });
  }

  // Lightweight accessible mobile navigation toggle (exact match to main.js + style.css .mobile-menu-btn)
  function initMobileNavToggle() {
    var navbar = document.getElementById('siteNavbar');
    if (!navbar || document.getElementById('mobileMenuBtn')) return;
    var container = navbar.querySelector('.nav-container');
    var navLinks = navbar.querySelector('.nav-links');
    if (!container || !navLinks) return;

    if (!navLinks.id) navLinks.id = 'primary-nav-links';
    var menuSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>';
    var closeSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'mobileMenuBtn';
    btn.className = 'mobile-menu-btn';
    btn.setAttribute('aria-label', 'Toggle Navigation Menu');
    btn.setAttribute('aria-controls', navLinks.id);
    btn.setAttribute('aria-expanded', 'false');
    btn.innerHTML = menuSvg + '<span>Menu</span>';
    container.appendChild(btn);

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var isOpen = navLinks.classList.toggle('open');
      btn.innerHTML = isOpen ? (closeSvg + '<span>Close</span>') : (menuSvg + '<span>Menu</span>');
      btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navLinks.classList.contains('open')) {
        navLinks.classList.remove('open');
        btn.innerHTML = menuSvg + '<span>Menu</span>';
        btn.setAttribute('aria-expanded', 'false');
        btn.focus();
      }
    });
  }

  function applyCatalog(catalog) {
    if (!catalog || !Array.isArray(catalog.products) || !global.GTA6GearRotation) return false;
    activeCatalog = catalog;

    // Optional future authorized Creators API hydrator hook (manual rotation works 100% without it)
    var runRender = function (resolvedCatalog) {
      var selection = global.GTA6GearRotation.selectDailyPick(resolvedCatalog, new Date());
      if (selection && selection.ok) {
        renderEditorsPick(selection, resolvedCatalog);
      }
      renderSections(resolvedCatalog, activePlatformFilter);
      bindPlatformFilters();
    };

    if (typeof apiHydrator === 'function') {
      try {
        Promise.resolve(apiHydrator(catalog)).then(function (hydrated) {
          runRender(hydrated && Array.isArray(hydrated.products) ? hydrated : catalog);
        }).catch(function () {
          runRender(catalog);
        });
      } catch (err) {
        runRender(catalog);
      }
    } else {
      runRender(catalog);
    }
    return true;
  }

  function initGamingGearPage() {
    initMobileNavToggle();
    if (!global.GTA6GearRotation) return;

    // Load authoritative JSON catalog (falls back gracefully to static HTML if fetch fails)
    if (typeof global.fetch === 'function') {
      global.fetch(CATALOG_URL, { credentials: 'same-origin' })
        .then(function (res) {
          if (!res.ok) throw new Error('HTTP ' + res.status);
          return res.json();
        })
        .then(function (data) {
          applyCatalog(data);
        })
        .catch(function () {
          // Static HTML fallback inside #leonidaEditorsPickMount and section tables remains intact and usable.
          var mount = document.getElementById('leonidaEditorsPickMount');
          if (mount) mount.setAttribute('data-rendered', 'static-fallback');
        });
    }
  }

  global.GTA6GearEngine = {
    version: '1.0.0',
    catalogUrl: CATALOG_URL,
    registerApiHydrator: function (fn) {
      apiHydrator = typeof fn === 'function' ? fn : null;
    },
    getActiveCatalog: function () {
      return activeCatalog;
    },
    renderWithCatalog: applyCatalog,
    init: initGamingGearPage
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGamingGearPage);
  } else {
    initGamingGearPage();
  }
})(window);
