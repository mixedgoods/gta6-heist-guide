// ==========================================================================
// GTA6HEISTGUIDE.COM — 1-FILE MASTER REVENUE & OWNER CONFIGURATION (v4.0)
// Verified Amazon Associates Direct Product Links (Tag: gta6heistguid-20)
// ==========================================================================
window.SITE_CONFIG = Object.freeze({
  siteName: "GTA6HeistGuide.com",
  domain: "https://www.gta6heistguide.com",
  ownerContactEmail: "inquiries@gta6heistguide.com",

  // Centralized Amazon Associates Direct Links — Phase 33.1 Verified In-Stock ASINs (Tag: gta6heistguid-20)
  amazonLinks: {
    // 6 Phase 33.1 Real-Photograph Featured & Hub Products (verified In Stock 2026-11-25)
    dualsenseWhite: "https://www.amazon.com/dp/B0FY6X2XXY?tag=gta6heistguid-20",
    xboxCarbonBlack: "https://www.amazon.com/dp/B0F1HX3WXX?tag=gta6heistguid-20",
    kossPortaPro: "https://www.amazon.com/dp/B00001P4ZH?tag=gta6heistguid-20",
    sonyMdr7506: "https://www.amazon.com/dp/B000AJIF4E?tag=gta6heistguid-20",
    samsung990Pro4tb: "https://www.amazon.com/dp/B0CHGT1KFJ?tag=gta6heistguid-20",
    blueYetiBlackout: "https://www.amazon.com/dp/B00N1YPXW2?tag=gta6heistguid-20",
    // 12 Phase 33 Verified Catalog Products (verified In Stock 2026-11-25; Photo Pending Permission)
    poweraPs5Dock: "https://www.amazon.com/dp/B09B1XX1PN?tag=gta6heistguid-20",
    poweraXboxDock: "https://www.amazon.com/dp/B09FZ4K8FQ?tag=gta6heistguid-20",
    kontrolfreekHeist: "https://www.amazon.com/dp/B0GNNTYQGH?tag=gta6heistguid-20",
    kontrolfreekGalaxy: "https://www.amazon.com/dp/B0B4862QNJ?tag=gta6heistguid-20",
    turtleBeachRecon70: "https://www.amazon.com/dp/B0CWS6WV23?tag=gta6heistguid-20",
    hyperxStinger2Core: "https://www.amazon.com/dp/B0BDGMNF6V?tag=gta6heistguid-20",
    lexarNm790Heatsink: "https://www.amazon.com/dp/B0CGKPPZY9?tag=gta6heistguid-20",
    wdBlackSn850p: "https://www.amazon.com/dp/B0C47ZX1WB?tag=gta6heistguid-20",
    headsetStand: "https://www.amazon.com/dp/B01GJQ7N94?tag=gta6heistguid-20",
    cableKit: "https://www.amazon.com/dp/B071FXZBMV?tag=gta6heistguid-20",
    paladonePsIcons: "https://www.amazon.com/dp/B079CBP6P9?tag=gta6heistguid-20",
    cableGuyMonkeybomb: "https://www.amazon.com/dp/B08KJJFFY8?tag=gta6heistguid-20",
    // Legacy key aliases mapped safely to verified In-Stock equivalents (zero 404s)
    dualsenseDock: "https://www.amazon.com/dp/B09B1XX1PN?tag=gta6heistguid-20",
    kontrolfreek: "https://www.amazon.com/dp/B0GNNTYQGH?tag=gta6heistguid-20",
    crucialT500: "https://www.amazon.com/dp/B0CGKPPZY9?tag=gta6heistguid-20",
    samsung990pro: "https://www.amazon.com/dp/B0C47ZX1WB?tag=gta6heistguid-20",
    nova7p: "https://www.amazon.com/dp/B0BDGMNF6V?tag=gta6heistguid-20",
    nova7x: "https://www.amazon.com/dp/B0CWS6WV23?tag=gta6heistguid-20",
    prime: "https://www.amazon.com/tryprimefree?tag=gta6heistguid-20"
  },

  // Affiliate & Store Monetization IDs
  amazonTag: "gta6heistguid-20",
  exitLagUrl: "https://www.exitlag.com/refer/10386953",
  g2aUrl: "https://www.g2a.com/n/reflink-4094b9aab5",
  gumroadCutFlowUrl: "https://apexlocallabs.gumroad.com/l/cutflow-pro",
  gumroadBundleUrl: "https://apexlocallabs.gumroad.com/l/apex-pro-bundle",
  getApexLocalUrl: "https://getapexlocal.com",
  getApexLocalPartnersUrl: "https://getapexlocal.com/partners",

  // Optional Buyer Activations (leave blank "" to keep disabled)
  adsensePublisherId: "ca-pub-9556158063903839",
  ga4MeasurementId: "G-DG7REYHR80",
  enableAffiliateClickTracking: true,

  // Phase 35.1C — Centralized Amazon Product Placement Pause Switch (disabled by default)
  // Underlying Amazon ASIN catalog, tracking tag, licensed photo manifest, and click deduplication remain intact.
  enableAmazonProductPlacements: false
});

// Privacy-first single reusable analytics adapter (Phase 36/36.1 GA4 + Consent Mode + opt-out controls)
(function() {
  var OPT_OUT_KEY = 'gta6_analytics_opt_out';
  var CONSENT_REQUIRED_REGIONS = [
    'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR',
    'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK',
    'SI', 'ES', 'SE', 'IS', 'LI', 'NO', 'GB', 'CH'
  ];
  var BLOCKED_KEY_RE = /^name$|email|mail|pass|pwd|secret|token|auth|phone|tel|address|query|search_?term|text|input|body|message|comment|cookie|session|user_?name|full_?name|first_?name|last_?name|display_?name|ssn|target_?url|link_?url|full_?url|href/i;
  var PHONE_VAL_RE = /^\+?\d[\d\s().-]{7,}\d$/;
  var AFFILIATE_HOST_RE = /(?:^|\.)(?:amazon\.com|amzn\.to|g2a\.com|exitlag\.com|gumroad\.com|getapexlocal\.com|gfuel\.com)$/i;
  var ALLOWED_EVENTS = {
    page_view: true,
    affiliate_click: true,
    tool_interaction: true,
    search_interaction: true,
    outbound_click: true,
    map_pin_open: true,
    map_search: true,
    map_pin_complete: true,
    vehicle_compare: true,
    guide_related_click: true,
    continue_read: true,
    heist_command_open: true,
    heist_selected: true,
    heist_checklist_toggle: true,
    heist_map_open: true,
    heist_resource_click: true,
    heist_progress_export: true,
    my_leonida_open: true,
    my_leonida_category_open: true,
    progress_category_update: true,
    progress_backup_export: true,
    progress_backup_import: true,
    my_next_activity_click: true,
    discovery_submit_start: true,
    discovery_submit_success: true,
    discovery_detail_open: true,
    discovery_map_open: true,
    discovery_bookmark: true,
    discovery_report: true
  };

  function isAdminPath() {
    var p = String((window.location && window.location.pathname) || '/').toLowerCase();
    return p.indexOf('/cd-admin') === 0 || p.indexOf('/syndicate-command') === 0;
  }

  function isAnalyticsOptedOut() {
    try {
      if (isAdminPath()) return true;
      var cfg = window.SITE_CONFIG || {};
      var gaId = String(cfg.ga4MeasurementId || '').trim();
      if (gaId && window['ga-disable-' + gaId] === true) return true;
      if (window.navigator && (window.navigator.globalPrivacyControl === true || window.navigator.doNotTrack === '1' || window.navigator.doNotTrack === 'yes')) {
        return true;
      }
      if (window.localStorage && window.localStorage.getItem(OPT_OUT_KEY) === '1') {
        return true;
      }
    } catch (e) {}
    return false;
  }

  function initGa4(overrideId) {
    try {
      var cfg = window.SITE_CONFIG || {};
      var gaId = String(overrideId || cfg.ga4MeasurementId || '').trim();
      if (!/^G-[A-Z0-9]+$/i.test(gaId)) return false;
      if (isAdminPath() || isAnalyticsOptedOut()) return false;
      if (window._gta6Ga4Initialized) return true;
      if (document.querySelector('script[data-gta6-ga4], script[src*="googletagmanager.com/gtag/js"]')) {
        window._gta6Ga4Initialized = true;
        return true;
      }
      window._gta6Ga4Initialized = true;
      window.dataLayer = window.dataLayer || [];
      if (typeof window.gtag !== 'function') {
        window.gtag = function gtag() { window.dataLayer.push(arguments); };
      }
      // Consent Mode defaults: never auto-grant advertising consent; deny analytics storage in consent-required regions
      window.gtag('consent', 'default', {
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        analytics_storage: 'denied',
        region: CONSENT_REQUIRED_REGIONS
      });
      window.gtag('consent', 'default', {
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied'
      });
      window.gtag('js', new Date());
      var cleanPath = (window.location && window.location.pathname) ? window.location.pathname : '/';
      var cleanOrigin = (window.location && window.location.origin) ? window.location.origin : '';
      window.gtag('config', gaId, {
        anonymize_ip: true,
        allow_google_signals: false,
        allow_ad_personalization_signals: false,
        page_location: cleanOrigin + cleanPath,
        page_path: cleanPath,
        send_page_view: true
      });
      var s = document.createElement('script');
      s.async = true;
      s.setAttribute('data-gta6-ga4', gaId);
      s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(gaId);
      if (document.head) document.head.appendChild(s);
      return true;
    } catch (e) {
      return false;
    }
  }

  function setAnalyticsOptOut(optedOut) {
    try {
      var flag = !!optedOut;
      var cfg = window.SITE_CONFIG || {};
      var gaId = String(cfg.ga4MeasurementId || '').trim();
      if (gaId) window['ga-disable-' + gaId] = flag;
      if (window.localStorage) {
        if (flag) window.localStorage.setItem(OPT_OUT_KEY, '1');
        else window.localStorage.removeItem(OPT_OUT_KEY);
      }
      if (flag && typeof window.gtag === 'function') {
        window.gtag('consent', 'update', {
          analytics_storage: 'denied',
          ad_storage: 'denied',
          ad_user_data: 'denied',
          ad_personalization: 'denied'
        });
      }
      return flag;
    } catch (e) {
      return !!optedOut;
    }
  }

  window.GTA6Privacy = {
    OPT_OUT_KEY: OPT_OUT_KEY,
    CONSENT_REQUIRED_REGIONS: CONSENT_REQUIRED_REGIONS,
    isAdminPath: isAdminPath,
    isAnalyticsOptedOut: isAnalyticsOptedOut,
    setAnalyticsOptOut: setAnalyticsOptOut,
    initGa4: initGa4
  };

  function classifyPathCategory(pathname) {
    var p = String(pathname || '/').toLowerCase();
    if (p === '/' || p === '/index.html') return 'home';
    if (p.indexOf('/gaming-gear') === 0 || p.indexOf('/affiliates-gear') === 0) return 'gaming_gear';
    if (p.indexOf('/community-discoveries') === 0) return 'community_discoveries';
    if (p.indexOf('/my-leonida') === 0) return 'my_leonida';
    if (p.indexOf('/heist-command-center') === 0) return 'heist_command';
    if (p.indexOf('/map') === 0) return 'map';
    if (/^\/(properties|animals|vehicles|weapons|weapons-bonuses|radio|gta-6-database)/.test(p)) return 'database';
    if (/^\/(heist-planner|heist-payout-calculator|save-planner|gta-6-tools|free|live)/.test(p)) return 'tools';
    if (/^\/(cheats|secrets|gta-6-tips-and-tricks|gta-6-settings|gta-6-discoveries)/.test(p)) return 'tips';
    if (/^\/(missions|gta-6-|heist)/.test(p)) return 'guides';
    return 'page';
  }

  function sanitizeParams(rawParams) {
    var clean = { page_category: classifyPathCategory(window.location.pathname) };
    if (!rawParams || typeof rawParams !== 'object') return clean;
    Object.keys(rawParams).forEach(function(k) {
      if (!k || BLOCKED_KEY_RE.test(k)) return;
      var v = rawParams[k];
      if (v === null || v === undefined) return;
      if (typeof v === 'number' && isFinite(v)) {
        clean[k] = v;
      } else if (typeof v === 'boolean') {
        clean[k] = v;
      } else if (typeof v === 'string') {
        var s = v.trim();
        if (!s || s.indexOf('@') !== -1) return;
        if (s.indexOf('?') !== -1 && s.indexOf('=') !== -1) return;
        if (PHONE_VAL_RE.test(s)) return;
        clean[k] = s.length > 80 ? s.slice(0, 80) : s;
      }
    });
    return clean;
  }

  var eventHistory = [];
  function GTA6Track(eventName, params) {
    try {
      var name = String(eventName || '').trim();
      if (!ALLOWED_EVENTS[name]) return false;
      var clean = sanitizeParams(params);
      var cfg = window.SITE_CONFIG || {};
      var gaId = String(cfg.ga4MeasurementId || '').trim();
      var optedOut = isAnalyticsOptedOut();
      var gaActive = !optedOut && /^G-[A-Z0-9]+$/i.test(gaId) && typeof window.gtag === 'function';
      if (gaActive) {
        window.gtag('event', name, clean);
      }
      var record = { event: name, params: clean, dispatchedToGa4: gaActive, optedOut: optedOut, ts: Date.now() };
      eventHistory.push(record);
      if (eventHistory.length > 50) eventHistory.shift();
      if (typeof window.CustomEvent === 'function') {
        window.dispatchEvent(new CustomEvent('gta6:track', { detail: record }));
      }
      return true;
    } catch (e) {
      return false;
    }
  }
  GTA6Track.classifyPath = classifyPathCategory;
  GTA6Track.getEvents = function() { return eventHistory.slice(); };
  GTA6Track.isGa4Active = function() {
    if (isAnalyticsOptedOut()) return false;
    var cfg = window.SITE_CONFIG || {};
    var gaId = String(cfg.ga4MeasurementId || '').trim();
    return /^G-[A-Z0-9]+$/i.test(gaId) && typeof window.gtag === 'function';
  };
  window.GTA6Track = GTA6Track;

  if (!window._gta6TrackDelegatedBound) {
    window._gta6TrackDelegatedBound = true;
    document.addEventListener('click', function(e) {
      try {
        var target = e.target && e.target.closest ? e.target.closest('a[href]') : null;
        if (!target) return;
        var href = target.getAttribute('href') || '';
        if (!href || href.charAt(0) === '#') return;
        var parsedUrl = null;
        var destPath = href;
        try {
          parsedUrl = new URL(target.href, window.location.origin);
          destPath = parsedUrl.pathname;
        } catch (err) {
          destPath = href;
        }
        var destCat = classifyPathCategory(destPath);

        if (parsedUrl && (parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:') && parsedUrl.origin !== window.location.origin) {
          var isAffiliate = !!(target.getAttribute('data-aff-partner') || target.getAttribute('data-amazon-link') || AFFILIATE_HOST_RE.test(parsedUrl.hostname));
          if (!isAffiliate) {
            GTA6Track('outbound_click', {
              destination_host: parsedUrl.hostname.toLowerCase(),
              source_page: (window.location && window.location.pathname) ? window.location.pathname : '/',
              event_timestamp: new Date().toISOString()
            });
          }
          return;
        }

        if (target.closest('#p26ContinueLinks')) {
          GTA6Track('continue_read', {
            destination_category: destCat,
            interaction_type: 'continue_reading'
          });
          return;
        }
        if (target.matches('.wdb-related-link, [data-related-guide], .guide-related-card') ||
            target.closest('.related-guides, .related-links, .next-guides, .cross-links, .wdb-related-links')) {
          GTA6Track('guide_related_click', {
            destination_category: destCat,
            interaction_type: 'related_guide_click'
          });
        }
      } catch (err) {}
    }, { passive: true });
  }

  if (!window._gta6ToolSearchBound) {
    window._gta6ToolSearchBound = true;
    var lastSearchTs = 0;
    document.addEventListener('input', function(e) {
      try {
        var el = e.target;
        if (!el || !el.matches) return;
        if (!el.matches('input[type="search"], [data-analytics-search], #mapSearchInput, #dbSearch, #vehicleSearch, #weaponSearch, #cheatSearch')) return;
        var now = Date.now();
        if (now - lastSearchTs < 1500) return;
        lastSearchTs = now;
        var valLen = String(el.value || '').trim().length;
        if (valLen < 2) return;
        GTA6Track('search_interaction', {
          search_surface: el.getAttribute('data-analytics-search') || el.id || 'site_search',
          source_page: (window.location && window.location.pathname) ? window.location.pathname : '/',
          event_timestamp: new Date().toISOString()
        });
      } catch (err) {}
    }, { passive: true });

    document.addEventListener('change', function(e) {
      try {
        var el = e.target;
        if (!el || !el.closest) return;
        var toolWrap = el.closest('[data-analytics-tool], #heistCalc, #heistPlanner, #savePlanner, .calculator-box, .tool-box');
        if (!toolWrap) return;
        if (el.type === 'email' || el.type === 'password' || el.type === 'tel') return;
        GTA6Track('tool_interaction', {
          tool_name: toolWrap.getAttribute('data-analytics-tool') || toolWrap.id || classifyPathCategory(window.location.pathname),
          interaction_type: el.tagName ? el.tagName.toLowerCase() + '_change' : 'change',
          source_page: (window.location && window.location.pathname) ? window.location.pathname : '/',
          event_timestamp: new Date().toISOString()
        });
      } catch (err) {}
    }, { passive: true });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      initGa4();
    });
  } else {
    initGa4();
  }
})();

// Auto-hydrate centralized Amazon product links & nav dropdowns sitewide
(function() {
  function hydrateLinks() {
    var cfg = window.SITE_CONFIG;
    if (!cfg || !cfg.amazonLinks) return;

    document.querySelectorAll('[data-amazon-link]').forEach(function(el) {
      var key = el.getAttribute('data-amazon-link');
      if (cfg.amazonLinks[key]) {
        el.href = cfg.amazonLinks[key];
      }
    });

    document.querySelectorAll('a[href*="amazon.com"]').forEach(function(a) {
      var h = a.getAttribute('href') || '';
      if (/B0BHJJ9Y77|B0CK39YR41|samsung.*990|990\+pro/i.test(h)) {
        a.href = cfg.amazonLinks.lexarNm790Heatsink;
      } else if (/B08DP7Z725|kontrolfreek/i.test(h)) {
        a.href = cfg.amazonLinks.kontrolfreekHeist;
      } else if (/B08FC6Y4VG|dualsense.*charging|charging.*station/i.test(h)) {
        a.href = cfg.amazonLinks.poweraPs5Dock;
      } else if (/B08J845875/i.test(h)) {
        a.href = cfg.amazonLinks.poweraXboxDock;
      } else if (/B0B1647BD7|nova.*7p/i.test(h)) {
        a.href = cfg.amazonLinks.hyperxStinger2Core;
      } else if (/B0B161B1YQ|nova.*7x/i.test(h)) {
        a.href = cfg.amazonLinks.turtleBeachRecon70;
      } else if (/sn850p|wd_black/i.test(h)) {
        a.href = cfg.amazonLinks.wdBlackSn850p;
      }
    });

    // Setup desktop hover (fine-pointer), keyboard, and mobile tap support for .nav-dropdown
    var supportsFineHover = !!(window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches);
    function closeAllDropdowns(exceptDd) {
      document.querySelectorAll('.nav-dropdown.is-open').forEach(function(other) {
        if (other !== exceptDd) {
          other.classList.remove('is-open');
          var ob = other.querySelector('.nav-dropdown-btn');
          if (ob) ob.setAttribute('aria-expanded', 'false');
        }
      });
    }
    function openDropdown(dd) {
      closeAllDropdowns(dd);
      dd.classList.add('is-open');
      var btn = dd.querySelector('.nav-dropdown-btn');
      if (btn) btn.setAttribute('aria-expanded', 'true');
    }
    function closeDropdown(dd) {
      dd.classList.remove('is-open');
      var btn = dd.querySelector('.nav-dropdown-btn');
      if (btn) btn.setAttribute('aria-expanded', 'false');
    }

    document.querySelectorAll('.nav-dropdown').forEach(function(dd, ddIdx) {
      var btn = dd.querySelector('.nav-dropdown-btn');
      var menu = dd.querySelector('.nav-dropdown-menu');
      if (!btn || btn.dataset.bound) return;
      btn.dataset.bound = 'true';
      dd.setAttribute('data-nav-ready', 'true');
      if (menu) {
        if (!menu.id) {
          var slug = (btn.textContent || ('group-' + ddIdx)).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || ('group-' + ddIdx);
          menu.id = 'nav-dropdown-menu-' + slug;
        }
        btn.setAttribute('aria-controls', menu.id);
      }
      btn.setAttribute('aria-expanded', dd.classList.contains('is-open') ? 'true' : 'false');
      var closeTimer = null;
      var suppressFocusOpen = false;

      // Tap / click toggle (works on mobile touchscreens & desktop click)
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }
        var wasOpen = dd.classList.contains('is-open');
        if (wasOpen) closeDropdown(dd);
        else openDropdown(dd);
      });

      // Desktop fine-pointer hover with intent delay so moving pointer from trigger to menu never drops
      if (supportsFineHover) {
        dd.addEventListener('mouseenter', function() {
          if (window.innerWidth < 1024) return;
          if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }
          openDropdown(dd);
        });
        dd.addEventListener('mouseleave', function() {
          if (window.innerWidth < 1024) return;
          if (closeTimer) clearTimeout(closeTimer);
          closeTimer = setTimeout(function() {
            closeDropdown(dd);
          }, 160);
        });
      }

      // Keyboard accessibility: focus opens on desktop (unless explicitly dismissed via Escape),
      // ArrowDown/Up navigates items, Escape closes cleanly without reopening via :focus-within.
      // On mobile (<1024px), focusin/focusout do not auto-open or collapse accordions so tapping
      // another dropdown group never shifts layout during pointerdown and closes the drawer.
      dd.addEventListener('focusin', function() {
        if (window.innerWidth < 1024) return;
        if (suppressFocusOpen) {
          suppressFocusOpen = false;
          return;
        }
        openDropdown(dd);
      });
      dd.addEventListener('focusout', function(e) {
        if (window.innerWidth < 1024) return;
        if (!dd.contains(e.relatedTarget)) {
          closeDropdown(dd);
        }
      });
      dd.addEventListener('keydown', function(e) {
        var items = menu ? Array.from(menu.querySelectorAll('a.nav-dropdown-item')) : [];
        if (e.key === 'Escape') {
          var wasOpen = dd.classList.contains('is-open');
          if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }
          closeDropdown(dd);
          if (wasOpen) {
            e.preventDefault();
            e.stopPropagation();
          }
          if (document.activeElement !== btn) {
            suppressFocusOpen = true;
            btn.focus();
            suppressFocusOpen = false;
          }
          return;
        }
        if (e.key === 'ArrowDown' && items.length) {
          e.preventDefault();
          openDropdown(dd);
          var idx = items.indexOf(document.activeElement);
          items[(idx + 1) % items.length].focus();
        } else if (e.key === 'ArrowUp' && items.length) {
          e.preventDefault();
          openDropdown(dd);
          var idxUp = items.indexOf(document.activeElement);
          items[(idxUp <= 0 ? items.length - 1 : idxUp - 1)].focus();
        }
      });
    });
    if (!window._gta6DropdownGlobalBound) {
      window._gta6DropdownGlobalBound = true;
      document.addEventListener('click', function(e) {
        if (e.target && e.target.closest && e.target.closest('.nav-dropdown')) return;
        closeAllDropdowns(null);
      });
      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') closeAllDropdowns(null);
      });
    }

    // Browser-local recently viewed guide/database tracker for "Continue Where You Left Off"
    try {
      var curPath = window.location.pathname || '/';
      if (curPath !== '/' && curPath !== '/index.html' && curPath.indexOf('/my-leonida') !== 0 && curPath.indexOf('/cd-admin') !== 0 && curPath.indexOf('/404') !== 0) {
        var rawTitle = (document.title || curPath).split('|')[0].split(':')[0].trim();
        if (rawTitle.length > 48) rawTitle = rawTitle.slice(0, 45) + '...';
        var recRaw = localStorage.getItem('gta6_recent_pages_v1');
        var recList = recRaw ? JSON.parse(recRaw) : [];
        if (!Array.isArray(recList)) recList = [];
        recList = recList.filter(function(x) { return x && x.path !== curPath; });
        recList.unshift({ path: curPath, title: rawTitle, ts: Date.now() });
        localStorage.setItem('gta6_recent_pages_v1', JSON.stringify(recList.slice(0, 6)));
      }
    } catch (e) {}

    // Rotating Drops Tab label cycler in header
    var dropsTab = document.getElementById('rotatingDropsTab');
    if (dropsTab && !dropsTab.dataset.rotatorBound) {
      dropsTab.dataset.rotatorBound = 'true';
      var labels = [
        '🎁 Kick 10K Giveaway',
        '🎁 Twitch Drops Live',
        '🎁 $0 Prime Sub'
      ];
      var idx = 0;
      setInterval(function() {
        idx = (idx + 1) % labels.length;
        dropsTab.style.opacity = '0.35';
        setTimeout(function() {
          dropsTab.textContent = labels[idx];
          dropsTab.style.opacity = '1';
        }, 180);
      }, 4000);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', hydrateLinks);
  } else {
    hydrateLinks();
  }
})();
