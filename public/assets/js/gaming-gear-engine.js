// ==========================================================================
// GTA6HEISTGUIDE.COM — GAMING GEAR HUB & LEONIDA DROP ENGINE
// Renders:
//   1. LEONIDA DROP — three coordinated, unusual gaming discoveries that
//      rotate across themed collections on every page refresh (tab-scoped
//      sessionStorage cycle with zero repeats until cycle end) plus an
//      interactive SHOW ANOTHER DROP button.
//   2. All 6 curated Gaming Gear catalog sections + platform filters.
//
// Compliance invariants:
// - Strictly Amazon-Only product images inside LEONIDA DROP: never renders
//   Wikimedia Commons, manufacturer, third-party, AI, SVG, or placeholder
//   images in LEONIDA DROP. Displays authorized Amazon images ONLY when a
//   verified, mobile-approved Amazon hydrator supplies <24h Amazon CDN URLs.
// - Preserves Phase 47 verified real-photo cards in the 6 lower catalog sections.
// - Preserves Phase 35.1C Amazon Placement Pause everywhere else on the site
//   (never alters window.SITE_CONFIG.enableAmazonProductPlacements).
// - Zero cookies, zero user profiling, zero timers, zero auto-redirects,
//   zero hardcoded prices, zero Amazon star ratings or review counts.
// ==========================================================================
(function (global) {
  'use strict';

  var CATALOG_URL = '/data/gear-products-master.json';
  var apiHydrator = null;
  var amazonDropHydrator = null;
  var activeCatalog = null;
  var activeDropResult = null;
  var activePlatformFilter = 'all';
  var memorySessionFallback = (function () {
    var store = {};
    return {
      getItem: function (k) { return Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null; },
      setItem: function (k, v) { store[k] = String(v); },
      removeItem: function (k) { delete store[k]; }
    };
  })();

  function getSafeSessionStorage() {
    try {
      if (global.sessionStorage) {
        var probeKey = '__gta6_ss_probe__';
        global.sessionStorage.setItem(probeKey, '1');
        global.sessionStorage.removeItem(probeKey);
        return global.sessionStorage;
      }
    } catch (e) {}
    return memorySessionFallback;
  }

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

  function buildLinkAttrs(product, placement, area, extra) {
    var opts = extra || {};
    var host = getDestinationHost(product.amazonSpecialLink);
    var slotAttr = opts.dailySlot
      ? ' data-aff-daily-slot="' + esc(opts.dailySlot) + '"'
      : ' data-aff-daily-slot="catalog"';
    var colAttr = opts.collectionId
      ? ' data-aff-collection="' + esc(opts.collectionId) + '"'
      : '';
    var posAttr = opts.position
      ? ' data-aff-position="' + esc(opts.position) + '"'
      : '';
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
      slotAttr +
      colAttr +
      posAttr
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
    if (lic.sourceOrigin) {
      return '<div class="gg-media-credit">' + esc(lic.sourceOrigin) + '</div>';
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

  // Strictly Amazon-Only image renderer for LEONIDA DROP cards.
  // Returns empty string unless product carries a verified, mobile-approved,
  // <24h Amazon CDN image from Creators API or an official Amazon widget.
  function renderAuthorizedDropAmazonMedia(item, collectionId, placement) {
    if (!global.GTA6GearRotation || !item || !item.product) return '';
    var p = item.product;
    if (!global.GTA6GearRotation.isAuthorizedAmazonDropImage(p)) {
      return '';
    }
    var img = p.amazonDropImage;
    var imgAttrs = buildLinkAttrs(p, placement, 'image', {
      dailySlot: 'drop_' + collectionId,
      collectionId: collectionId,
      position: item.position
    });
    var w = Number(img.width) > 0 ? Number(img.width) : 500;
    var h = Number(img.height) > 0 ? Number(img.height) : 500;
    return (
      '<a ' + imgAttrs + ' class="ld-amazon-media" aria-label="View ' + esc(p.productName) + ' on Amazon">' +
        '<img src="' + esc(img.url) + '" alt="' + esc(img.alt || p.productName) + '" width="' + esc(w) + '" height="' + esc(h) + '" loading="eager" decoding="async">' +
        '<span class="gg-media-badge gg-media-badge--photo">Official Amazon Product Image</span>' +
      '</a>'
    );
  }

  function renderDropMainCard(item, collection, dropCfg) {
    var p = item.product;
    var placement = 'leonida_drop_main';
    var ctaLabel = (dropCfg && dropCfg.ctaLabel) || 'CHECK IT OUT ON AMAZON';
    var ctaAttrs = buildLinkAttrs(p, placement, 'cta', {
      dailySlot: 'drop_' + collection.id,
      collectionId: collection.id,
      position: item.position
    });
    var amazonMediaHtml = renderAuthorizedDropAmazonMedia(item, collection.id, placement);

    return (
      '<article class="ld-card ld-card--main ld-accent-' + esc(p.accent || collection.accent || 'cyan') + '" data-drop-role="main" data-drop-position="1" data-product-id="' + esc(p.id) + '" data-asin="' + esc(p.asin) + '">' +
        '<div class="ld-card-main-grid' + (amazonMediaHtml ? ' has-amazon-media' : '') + '">' +
          '<div class="ld-main-copy">' +
            '<div class="ld-card-badges">' +
              '<span class="ld-role-pill ld-role-pill--main">' + esc(item.roleLabel || "Main Editor's Pick") + '</span>' +
              '<span class="ld-category-pill">' + esc(p.category) + '</span>' +
              '<span class="ld-brand-tag">' + esc(p.manufacturer) + '</span>' +
              (p.badge ? '<span class="ld-highlight-pill">' + esc(p.badge) + '</span>' : '') +
            '</div>' +
            '<h3 class="ld-product-title ld-product-title--main">' + esc(p.productName) + '</h3>' +
            (p.model ? '<p class="ld-model-line">Verified Model: ' + esc(p.model) + '</p>' : '') +
            renderPlatformPills(p.platforms) +
            '<p class="ld-main-intro">' + esc(p.editorialIntro || p.shortDescription) + '</p>' +
            '<dl class="ld-specs-grid">' +
              '<div class="ld-spec-box">' +
                '<dt>Why It Anchors This Drop</dt>' +
                '<dd>' + esc(item.pairingNote || p.whyInteresting) + '</dd>' +
              '</div>' +
              '<div class="ld-spec-box">' +
                '<dt>What Makes It Different</dt>' +
                '<dd>' + esc(p.whatMakesItDifferent || p.whyInteresting) + '</dd>' +
              '</div>' +
            '</dl>' +
          '</div>' +
          '<div class="ld-main-action-col">' +
            amazonMediaHtml +
            '<div class="ld-action-panel">' +
              '<div class="ld-action-meta">' +
                '<p class="ld-meta-line"><strong>Compatibility:</strong> ' + esc(p.compatibility) + '</p>' +
                '<p class="ld-meta-line ld-meta-line--caveat"><strong>Honest Trade-Off:</strong> ' + esc(p.honestDisadvantages) + '</p>' +
              '</div>' +
              '<a ' + ctaAttrs + ' class="ld-cta-btn ld-cta-btn--main">' + esc(ctaLabel) + ' <span aria-hidden="true">&rarr;</span></a>' +
              '<p class="ld-inline-note"><strong>Paid Amazon Link:</strong> View live official product photos, specs &amp; current pricing directly on Amazon US.</p>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</article>'
    );
  }

  function renderDropSupportingCard(item, collection, dropCfg) {
    var p = item.product;
    var placement = 'leonida_drop_supporting';
    var ctaLabel = (dropCfg && dropCfg.supportingCtaLabel) || 'CHECK ON AMAZON';
    var ctaAttrs = buildLinkAttrs(p, placement, 'cta', {
      dailySlot: 'drop_' + collection.id,
      collectionId: collection.id,
      position: item.position
    });
    var amazonMediaHtml = renderAuthorizedDropAmazonMedia(item, collection.id, placement);

    return (
      '<article class="ld-card ld-card--supporting ld-accent-' + esc(p.accent || collection.accent || 'cyan') + '" data-drop-role="supporting" data-drop-position="' + esc(item.position) + '" data-product-id="' + esc(p.id) + '" data-asin="' + esc(p.asin) + '">' +
        amazonMediaHtml +
        '<div class="ld-supp-body">' +
          '<div class="ld-card-badges">' +
            '<span class="ld-role-pill">' + esc(item.roleLabel || ('Complementary Pick #' + item.position)) + '</span>' +
            '<span class="ld-brand-tag">' + esc(p.manufacturer) + '</span>' +
            (p.badge ? '<span class="ld-highlight-pill">' + esc(p.badge) + '</span>' : '') +
          '</div>' +
          '<h3 class="ld-product-title">' + esc(p.productName) + '</h3>' +
          (p.model ? '<p class="ld-model-line">' + esc(p.model) + '</p>' : '') +
          renderPlatformPills(p.platforms) +
          '<p class="ld-supp-desc">' + esc(p.shortDescription) + '</p>' +
          '<div class="ld-supp-notes">' +
            '<p class="ld-meta-line"><strong>Why it pairs here:</strong> ' + esc(item.pairingNote || p.whyInteresting) + '</p>' +
            '<p class="ld-meta-line"><strong>Compatibility:</strong> ' + esc(p.compatibility) + '</p>' +
            '<p class="ld-meta-line ld-meta-line--caveat"><strong>Trade-off:</strong> ' + esc(p.honestDisadvantages) + '</p>' +
          '</div>' +
        '</div>' +
        '<div class="ld-supp-foot">' +
          '<span class="ld-inline-note">Paid Amazon link &mdash; view official photos &amp; current price on Amazon.</span>' +
          '<a ' + ctaAttrs + ' class="ld-cta-btn ld-cta-btn--supporting">' + esc(ctaLabel) + ' <span aria-hidden="true">&rarr;</span></a>' +
        '</div>' +
      '</article>'
    );
  }

  function renderLeonidaDrop(selection, catalog, options) {
    var opts = options || {};
    var mount = document.getElementById('leonidaDropMount');
    if (!mount || !selection || !selection.ok || !selection.collection) return false;

    var col = selection.collection;
    if (!Array.isArray(col.items) || col.items.length !== 3) return false;

    activeDropResult = selection;
    var dropCfg = (catalog && catalog.leonidaDropConfig) || {};
    var featureName = dropCfg.featureName || 'LEONIDA DROP';
    var subtitle = dropCfg.subtitle || 'Three unusual gaming discoveries. A fresh drop every visit.';
    var nextBtnLabel = dropCfg.nextDropButtonLabel || 'SHOW ANOTHER DROP';
    var assocStatement = dropCfg.disclosureStatement || 'As an Amazon Associate I earn from qualifying purchases.';

    var mainHtml = renderDropMainCard(col.items[0], col, dropCfg);
    var suppHtml =
      renderDropSupportingCard(col.items[1], col, dropCfg) +
      renderDropSupportingCard(col.items[2], col, dropCfg);

    mount.innerHTML =
      '<div class="ld-shell ld-accent-' + esc(col.accent || 'cyan') + '" data-collection-id="' + esc(col.id) + '" data-drop-slot="' + esc(selection.slotNumber) + '" data-drop-total="' + esc(selection.totalCollections) + '" data-drop-cycle="' + esc(selection.cycle) + '">' +
        '<div class="ld-header">' +
          '<div class="ld-header-left">' +
            '<span class="ld-kicker">CURATED 3-PRODUCT GAMING COLLECTION &middot; REFRESH FOR A NEW DROP</span>' +
            '<h2 class="ld-title" id="leonidaDropHeading">' + esc(featureName) + '</h2>' +
            '<p class="ld-subtitle">' + esc(subtitle) + '</p>' +
          '</div>' +
          '<div class="ld-header-controls">' +
            '<div class="ld-cycle-meta" aria-live="polite">' +
              '<span class="ld-theme-pill">' + esc(col.name) + '</span>' +
              '<span class="ld-counter-pill">Drop ' + esc(selection.slotNumber) + ' of ' + esc(selection.totalCollections) + ' &middot; Refresh or tap for next</span>' +
            '</div>' +
            '<button type="button" id="showAnotherDropBtn" class="ld-next-btn" data-action="show-another-drop" aria-label="Show another three-product Leonida Drop collection">' +
              '<span class="ld-next-icon" aria-hidden="true">&#8635;</span> ' + esc(nextBtnLabel) +
            '</button>' +
          '</div>' +
        '</div>' +

        '<div class="ld-theme-banner">' +
          '<div class="ld-theme-banner-copy">' +
            '<span class="ld-theme-eyebrow">Active Theme: ' + esc(col.name) + (col.tagline ? ' &middot; ' + esc(col.tagline) : '') + '</span>' +
            '<p class="ld-theme-desc">' + esc(col.description) + '</p>' +
          '</div>' +
        '</div>' +

        '<div class="ld-cards-layout">' +
          mainHtml +
          '<div class="ld-supporting-grid">' +
            suppHtml +
          '</div>' +
        '</div>' +

        '<div class="ld-footer-disclosure" role="note" aria-label="Leonida Drop affiliate disclosure">' +
          '<strong>Affiliate Disclosure:</strong> ' + esc(assocStatement) + ' Every product button above links directly to its verified Amazon US listing (<code>gta6heistguid-20</code>). We may earn a commission at no extra cost to you. Product photos and live pricing are viewed directly on Amazon.' +
        '</div>' +
      '</div>';

    mount.setAttribute('data-rendered', 'dynamic');
    mount.setAttribute('data-active-collection', col.id);

    if (opts.restoreFocus) {
      var nextBtn = document.getElementById('showAnotherDropBtn');
      if (nextBtn && typeof nextBtn.focus === 'function') {
        nextBtn.focus();
      }
    }
    return true;
  }

  function bindShowAnotherDrop() {
    var mount = document.getElementById('leonidaDropMount');
    if (!mount || mount.dataset.dropBound === '1') return;
    mount.dataset.dropBound = '1';

    mount.addEventListener('click', function (e) {
      var btn = e.target && e.target.closest ? e.target.closest('[data-action="show-another-drop"]') : null;
      if (!btn || !activeCatalog || !global.GTA6GearRotation) return;
      e.preventDefault();

      var next = global.GTA6GearRotation.advanceDropCollection(
        activeCatalog,
        getSafeSessionStorage(),
        { currentIndex: activeDropResult ? activeDropResult.index : undefined }
      );
      if (next && next.ok) {
        renderLeonidaDrop(next, activeCatalog, { restoreFocus: true });
        if (typeof global.GTA6Track === 'function') {
          global.GTA6Track('tool_interaction', {
            tool_name: 'leonida_drop',
            interaction_type: 'show_another_drop',
            collection_id: next.collection.id,
            source_page: (global.location && global.location.pathname) ? global.location.pathname : '/gaming-gear/'
          });
        }
      }
    });
  }

  function renderCatalogCard(product) {
    var hasPhoto = product.mediaType === 'photo' && Boolean(product.imageSource);
    var placement = product.analyticsPlacement || 'gaming_gear_catalog';
    var ctaAttrs = buildLinkAttrs(product, placement, 'cta', { dailySlot: 'catalog' });
    var mediaHtml = '';

    if (hasPhoto) {
      var imgAttrs = buildLinkAttrs(product, placement, 'image', { dailySlot: 'catalog' });
      var imgW = Number(product.imageWidth) > 0 ? Number(product.imageWidth) : 1000;
      var imgH = Number(product.imageHeight) > 0 ? Number(product.imageHeight) : 750;
      var cardDarkClass = product.photoBackdrop === 'dark' ? ' is-photo-dark' : '';
      mediaHtml =
        '<div class="gg-card-media-wrap">' +
          '<a ' + imgAttrs + ' class="gg-card-media is-photo' + cardDarkClass + '" aria-label="Check ' + esc(product.productName) + ' on Amazon">' +
            '<img src="' + esc(product.imageSource) + '" alt="' + esc(product.imageAlt) + '" width="' + esc(imgW) + '" height="' + esc(imgH) + '" loading="lazy" decoding="async">' +
          '</a>' +
          renderPhotoCredit(product) +
        '</div>';
    }

    var footNote = hasPhoto
      ? 'Affiliate link &mdash; we may earn from qualifying purchases. Check current price on Amazon.'
      : 'Affiliate link &mdash; view actual product photos and current pricing directly on Amazon.';

    return (
      '<article class="gg-card gg-accent-' + esc(product.accent || 'cyan') + (hasPhoto ? ' gg-card--photo' : ' gg-card--text-only') + '" data-product-id="' + esc(product.id) + '" data-media-mode="' + (hasPhoto ? 'photo' : 'text-only') + '">' +
        mediaHtml +
        '<div class="gg-card-body">' +
          '<div class="gg-card-top">' +
            '<span class="gg-brand">' + esc(product.manufacturer) + '</span>' +
            (product.badge ? '<span class="gg-pill">' + esc(product.badge) + '</span>' : '') +
            '<span class="gg-paid-badge">Affiliate link</span>' +
          '</div>' +
          '<h3 class="gg-card-title">' + esc(product.productName) + '</h3>' +
          (!hasPhoto && product.model ? '<p class="gg-card-model">Model: ' + esc(product.model) + '</p>' : '') +
          renderPlatformPills(product.platforms) +
          '<p class="gg-card-desc">' + esc(product.shortDescription) + '</p>' +
          '<div class="gg-card-meta-block">' +
            '<p class="gg-card-line"><strong>Why consider it:</strong> ' + esc(product.whyInteresting) + '</p>' +
            '<p class="gg-card-line"><strong>Compatibility:</strong> ' + esc(product.compatibility) + '</p>' +
            '<p class="gg-card-line gg-card-caveat"><strong>Trade-off:</strong> ' + esc(product.honestDisadvantages) + '</p>' +
          '</div>' +
        '</div>' +
        '<div class="gg-card-foot">' +
          '<span class="gg-foot-note">' + footNote + '</span>' +
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
      // Lead each section cleanly with verified real-photo cards, followed by clean text-only cards
      items.sort(function (a, b) {
        var ap = a.mediaType === 'photo' ? 0 : 1;
        var bp = b.mediaType === 'photo' ? 0 : 1;
        return ap - bp;
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

    var runRender = function (resolvedCatalog) {
      activeCatalog = resolvedCatalog;
      var dropSelection = global.GTA6GearRotation.selectDropCollection(
        resolvedCatalog,
        getSafeSessionStorage(),
        { advanceOnLoad: true }
      );
      if (dropSelection && dropSelection.ok) {
        renderLeonidaDrop(dropSelection, resolvedCatalog);
      }
      bindShowAnotherDrop();
      renderSections(resolvedCatalog, activePlatformFilter);
      bindPlatformFilters();
    };

    var hydrator = amazonDropHydrator || apiHydrator;
    if (typeof hydrator === 'function') {
      try {
        Promise.resolve(hydrator(catalog)).then(function (hydrated) {
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
          var mount = document.getElementById('leonidaDropMount');
          if (mount) mount.setAttribute('data-rendered', 'static-fallback');
        });
    }
  }

  global.GTA6GearEngine = {
    version: '2.0.0-leonida-drop',
    catalogUrl: CATALOG_URL,
    registerApiHydrator: function (fn) {
      apiHydrator = typeof fn === 'function' ? fn : null;
    },
    registerAmazonDropHydrator: function (fn) {
      amazonDropHydrator = typeof fn === 'function' ? fn : null;
    },
    getActiveCatalog: function () {
      return activeCatalog;
    },
    getActiveDrop: function () {
      return activeDropResult;
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
