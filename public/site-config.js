// ==========================================================================
// GTA6HEISTGUIDE.COM — 1-FILE MASTER REVENUE & OWNER CONFIGURATION (v4.0)
// Verified Amazon Associates Direct Product Links (Tag: gta6heistguid-20)
// ==========================================================================
window.SITE_CONFIG = Object.freeze({
  siteName: "GTA6HeistGuide.com",
  domain: "https://www.gta6heistguide.com",
  ownerContactEmail: "inquiries@gta6heistguide.com",

  // Centralized Amazon Associates Direct Links (Tag: gta6heistguid-20)
  amazonLinks: {
    dualsenseEdge: "https://www.amazon.com/dp/B0BS5V7T65?tag=gta6heistguid-20",
    dualsense: "https://www.amazon.com/dp/B08FC6C75B?tag=gta6heistguid-20",
    dualsenseDock: "https://www.amazon.com/dp/B08FC6Y4VG?tag=gta6heistguid-20",
    kontrolfreek: "https://www.amazon.com/dp/B08DP7Z725?tag=gta6heistguid-20",
    nova7p: "https://www.amazon.com/dp/B0B1647BD7?tag=gta6heistguid-20",
    xboxController: "https://www.amazon.com/dp/B08DF248HZ?tag=gta6heistguid-20",
    poweraXboxDock: "https://www.amazon.com/dp/B08J845875?tag=gta6heistguid-20",
    seagateXboxCard: "https://www.amazon.com/dp/B08K3S6WJM?tag=gta6heistguid-20",
    nova7x: "https://www.amazon.com/dp/B0B161B1YQ?tag=gta6heistguid-20",
    samsung990pro: "https://www.amazon.com/dp/B0BHJJ9Y77?tag=gta6heistguid-20",
    wdBlackSn850p: "https://www.amazon.com/dp/B0C47ZX1WB?tag=gta6heistguid-20",
    crucialT500: "https://www.amazon.com/dp/B0CK39YR41?tag=gta6heistguid-20",
    elgatoHd60x: "https://www.amazon.com/dp/B09V1KJ3J4?tag=gta6heistguid-20",
    elgato4kx: "https://www.amazon.com/dp/B0CPKDFF2D?tag=gta6heistguid-20",
    elgatoWave3: "https://www.amazon.com/dp/B0888746SZ?tag=gta6heistguid-20",
    headsetStand: "https://www.amazon.com/dp/B01GJQ7N94?tag=gta6heistguid-20",
    cableKit: "https://www.amazon.com/dp/B071FXZBMV?tag=gta6heistguid-20",
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
  adsensePublisherId: "",
  ga4MeasurementId: "",
  enableAffiliateClickTracking: true
});

// Privacy-first single reusable analytics adapter (GA4-ready when authorized ID is supplied)
(function() {
  var BLOCKED_KEY_RE = /email|mail|pass|pwd|secret|token|auth|phone|address|query|text|input|body|message|cookie|session|user_?name|full_?name/i;
  var ALLOWED_EVENTS = {
    map_pin_open: true,
    map_search: true,
    map_pin_complete: true,
    affiliate_click: true,
    vehicle_compare: true,
    guide_related_click: true,
    continue_read: true
  };

  function classifyPathCategory(pathname) {
    var p = String(pathname || '/').toLowerCase();
    if (p === '/' || p === '/index.html') return 'home';
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
      var gaActive = /^G-[A-Z0-9]+$/i.test(gaId) && typeof window.gtag === 'function';
      if (gaActive) {
        window.gtag('event', name, clean);
      }
      var record = { event: name, params: clean, dispatchedToGa4: gaActive, ts: Date.now() };
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
        var destPath = '';
        try { destPath = new URL(target.href, window.location.origin).pathname; } catch (err) { destPath = href; }
        var destCat = classifyPathCategory(destPath);

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
      if (/B0BHJJ9Y77|samsung.*990|990\+pro/i.test(h)) {
        a.href = cfg.amazonLinks.samsung990pro;
      } else if (/kontrolfreek/i.test(h)) {
        a.href = cfg.amazonLinks.kontrolfreek;
      } else if (/dualsense.*charging|charging.*station/i.test(h)) {
        a.href = cfg.amazonLinks.dualsenseDock;
      } else if (/dualsense.*edge|B0BS5V7T65/i.test(h)) {
        a.href = cfg.amazonLinks.dualsenseEdge;
      } else if (/nova.*7p/i.test(h)) {
        a.href = cfg.amazonLinks.nova7p;
      } else if (/sn850p|wd_black/i.test(h)) {
        a.href = cfg.amazonLinks.wdBlackSn850p;
      } else if (/hd60.*x/i.test(h)) {
        a.href = cfg.amazonLinks.elgatoHd60x;
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
      if (curPath !== '/' && curPath !== '/index.html' && curPath.indexOf('/cd-admin') !== 0 && curPath.indexOf('/404') !== 0) {
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
