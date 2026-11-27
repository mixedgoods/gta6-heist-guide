// ==========================================================================
// GTA6HEISTGUIDE.COM — GAMING GEAR HUB & LEONIDA DROP ENGINE (GLOBAL COMPACT CARDS)
// Renders:
//   1. LEONIDA DROP — three coordinated, balanced unusual gaming discoveries
//      (1 Editor's Pick + 2 Related Picks) in one equal-height 3-column desktop
//      row that rotates across themed collections on refresh and via SHOW ANOTHER DROP.
//   2. All 6 curated Gaming Gear catalog sections + platform filters using the
//      exact same global compact .amz-card component with expandable specifications.
//
// Compliance invariants:
// - Strict Amazon-only product image policy across the entire page: NEVER renders
//   Wikimedia Commons, manufacturer, third-party, AI, SVG, or placeholder images.
//   Displays authorized Amazon product photography ONLY when a verified,
//   mobile-approved <24h Amazon Creators API / official widget hydrator supplies it;
//   renders compact, balanced text-only cards otherwise.
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

  function renderPlatformChips(platforms) {
    if (!Array.isArray(platforms) || !platforms.length) return '';
    var html = '<div class="amz-card__compat-row" aria-label="Compatible platforms">';
    for (var i = 0; i < platforms.length; i++) {
      var key = normalizePlatformTag(platforms[i]);
      html += '<span class="amz-plat-chip amz-plat-chip--' + esc(key) + '">' + esc(platforms[i]) + '</span>';
    }
    html += '</div>';
    return html;
  }

  // Strictly Amazon-Only authorized product photo renderer.
  // Returns empty string unless product carries a verified, mobile-approved,
  // <24h Amazon CDN image from Creators API or an official Amazon widget.
  function renderAuthorizedAmazonMedia(product, placement, extra) {
    if (!global.GTA6GearRotation || !product) return '';
    if (!global.GTA6GearRotation.isAuthorizedAmazonDropImage(product)) {
      return '';
    }
    var img = product.amazonDropImage;
    var imgAttrs = buildLinkAttrs(product, placement, 'image', extra);
    var w = Number(img.width) > 0 ? Number(img.width) : 500;
    var h = Number(img.height) > 0 ? Number(img.height) : 500;
    return (
      '<a ' + imgAttrs + ' class="amz-card__media" aria-label="View ' + esc(product.productName) + ' on Amazon">' +
        '<img src="' + esc(img.url) + '" alt="' + esc(img.alt || product.productName) + '" width="' + esc(w) + '" height="' + esc(h) + '" loading="lazy" decoding="async">' +
      '</a>'
    );
  }

  function renderGlobalProductCard(product, opts) {
    var cfg = opts || {};
    var isFeatured = Boolean(cfg.featured);
    var roleText = cfg.roleLabel || product.badge || product.category;
    var roleCls = isFeatured ? 'amz-card__role amz-card__role--pick' : 'amz-card__role';
    var placement = cfg.placement || product.analyticsPlacement || 'gaming_gear_catalog';
    var extraAttrs = {
      dailySlot: cfg.dailySlot || 'catalog',
      collectionId: cfg.collectionId || '',
      position: cfg.position || ''
    };
    var ctaAttrs = buildLinkAttrs(product, placement, 'cta', extraAttrs);
    var mediaHtml = renderAuthorizedAmazonMedia(product, placement, extraAttrs);
    var hasPhoto = Boolean(mediaHtml);

    var summaryText = product.cardSummary || product.shortDescription || '';
    var considerationText = product.keyConsideration || product.honestDisadvantages || '';
    var accent = product.accent || cfg.accent || 'cyan';

    var dropDataAttrs = cfg.dropRole
      ? ' data-drop-role="' + esc(cfg.dropRole) + '" data-drop-position="' + esc(cfg.position) + '"'
      : '';

    var detailParts = [];
    if (product.model) {
      detailParts.push('<p><strong>Model:</strong> ' + esc(product.model) + '</p>');
    }
    if (cfg.pairingNote) {
      detailParts.push('<p><strong>Why it pairs in this drop:</strong> ' + esc(cfg.pairingNote) + '</p>');
    } else if (product.whyInteresting) {
      detailParts.push('<p><strong>Why consider it:</strong> ' + esc(product.whyInteresting) + '</p>');
    }
    if (product.whatMakesItDifferent && isFeatured) {
      detailParts.push('<p><strong>Key highlight:</strong> ' + esc(product.whatMakesItDifferent) + '</p>');
    }
    if (product.compatibility) {
      detailParts.push('<p><strong>Compatibility:</strong> ' + esc(product.compatibility) + '</p>');
    }
    if (product.honestDisadvantages) {
      detailParts.push('<p class="amz-detail-cons"><strong>Trade-offs:</strong> ' + esc(product.honestDisadvantages) + '</p>');
    }

    return (
      '<article class="amz-card amz-card--accent-' + esc(accent) + (isFeatured ? ' amz-card--featured' : '') + (hasPhoto ? ' amz-card--photo' : ' amz-card--text-only') + '"' +
        ' data-product-id="' + esc(product.id) + '"' +
        ' data-asin="' + esc(product.asin) + '"' +
        ' data-media-mode="' + (hasPhoto ? 'photo' : 'text-only') + '"' +
        dropDataAttrs + '>' +
        mediaHtml +
        '<div class="amz-card__body">' +
          '<div class="amz-card__top">' +
            '<span class="' + roleCls + '">' + esc(roleText) + '</span>' +
            '<span class="amz-card__brand">' + esc(product.manufacturer) + '</span>' +
            '<span class="amz-card__paid">Paid link</span>' +
          '</div>' +
          '<h3 class="amz-card__title">' + esc(product.productName) + '</h3>' +
          '<p class="amz-card__desc">' + esc(summaryText) + '</p>' +
          renderPlatformChips(product.platforms) +
          (considerationText
            ? '<p class="amz-card__consideration"><strong>Note:</strong> ' + esc(considerationText) + '</p>'
            : '') +
          '<details class="amz-card__details">' +
            '<summary class="amz-card__details-summary">View specifications &amp; compatibility</summary>' +
            '<div class="amz-card__details-body">' + detailParts.join('') + '</div>' +
          '</details>' +
        '</div>' +
        '<div class="amz-card__foot">' +
          '<a ' + ctaAttrs + ' class="amz-card__cta">View on Amazon <span aria-hidden="true">&rarr;</span></a>' +
          '<p class="amz-card__disclosure">Paid Amazon link &middot; View photos &amp; price on Amazon</p>' +
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

    var cardsHtml = col.items.map(function (item, idx) {
      var isMain = idx === 0;
      return renderGlobalProductCard(item.product, {
        featured: isMain,
        roleLabel: isMain ? "Editor's Pick" : ('Related Pick #' + item.position),
        placement: isMain ? 'leonida_drop_main' : 'leonida_drop_supporting',
        dailySlot: 'drop_' + col.id,
        collectionId: col.id,
        position: item.position,
        dropRole: item.role,
        pairingNote: item.pairingNote,
        accent: col.accent || 'cyan'
      });
    }).join('');

    mount.innerHTML =
      '<div class="ld-shell ld-accent-' + esc(col.accent || 'cyan') + '" data-collection-id="' + esc(col.id) + '" data-drop-slot="' + esc(selection.slotNumber) + '" data-drop-total="' + esc(selection.totalCollections) + '" data-drop-cycle="' + esc(selection.cycle) + '">' +
        '<div class="ld-header">' +
          '<div class="ld-header-left">' +
            '<span class="ld-kicker">3-PRODUCT COLLECTION &middot; REFRESH FOR A NEW DROP</span>' +
            '<h2 class="ld-title" id="leonidaDropHeading">' + esc(featureName) + '</h2>' +
            '<p class="ld-subtitle">' + esc(subtitle) + '</p>' +
          '</div>' +
          '<div class="ld-header-controls">' +
            '<div class="ld-cycle-meta" aria-live="polite">' +
              '<span class="ld-theme-pill">' + esc(col.name) + '</span>' +
              '<span class="ld-counter-pill">Drop ' + esc(selection.slotNumber) + ' of ' + esc(selection.totalCollections) + '</span>' +
            '</div>' +
            '<button type="button" id="showAnotherDropBtn" class="ld-next-btn" data-action="show-another-drop" aria-label="Show another three-product Leonida Drop collection">' +
              '<span class="ld-next-icon" aria-hidden="true">&#8635;</span> ' + esc(nextBtnLabel) +
            '</button>' +
          '</div>' +
        '</div>' +

        '<div class="ld-theme-banner">' +
          '<span class="ld-theme-eyebrow">' + esc(col.name) + (col.tagline ? ' &middot; ' + esc(col.tagline) : '') + '</span>' +
          '<p class="ld-theme-desc">' + esc(col.description) + '</p>' +
        '</div>' +

        '<div class="amz-grid amz-grid--drop">' +
          cardsHtml +
        '</div>' +

        '<div class="amz-disclosure-strip" role="note" aria-label="Leonida Drop affiliate disclosure">' +
          '<strong>Affiliate Disclosure:</strong> ' + esc(assocStatement) + ' Every button links directly to Amazon US (<code>gta6heistguid-20</code>). Product photos and live pricing are viewed on Amazon.' +
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
        grid.innerHTML = items.map(function (product, idx) {
          return renderGlobalProductCard(product, {
            featured: false,
            placement: product.analyticsPlacement || ('gaming_gear_' + sectionId),
            dailySlot: 'catalog',
            position: idx + 1
          });
        }).join('');
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
    version: '3.0.0-global-amz-cards',
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
    renderGlobalProductCard: renderGlobalProductCard,
    renderWithCatalog: applyCatalog,
    init: initGamingGearPage
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGamingGearPage);
  } else {
    initGamingGearPage();
  }
})(window);
