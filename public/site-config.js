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

    // Setup click support for .nav-dropdown (supports multiple dropdowns: Tools, Database)
    document.querySelectorAll('.nav-dropdown').forEach(function(dd) {
      var btn = dd.querySelector('.nav-dropdown-btn');
      if (btn && !btn.dataset.bound) {
        btn.dataset.bound = 'true';
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          var wasOpen = dd.classList.contains('is-open');
          document.querySelectorAll('.nav-dropdown.is-open').forEach(function(other) {
            if (other !== dd) {
              other.classList.remove('is-open');
              var ob = other.querySelector('.nav-dropdown-btn');
              if (ob) ob.setAttribute('aria-expanded', 'false');
            }
          });
          var isOpen = !wasOpen;
          dd.classList.toggle('is-open', isOpen);
          btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });
      }
    });
    if (!window._gta6DropdownGlobalBound) {
      window._gta6DropdownGlobalBound = true;
      document.addEventListener('click', function(e) {
        if (e.target && e.target.closest && e.target.closest('.nav-dropdown-menu')) return;
        document.querySelectorAll('.nav-dropdown.is-open').forEach(function(dd) {
          dd.classList.remove('is-open');
          var btn = dd.querySelector('.nav-dropdown-btn');
          if (btn) btn.setAttribute('aria-expanded', 'false');
        });
      });
      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
          document.querySelectorAll('.nav-dropdown.is-open').forEach(function(dd) {
            dd.classList.remove('is-open');
            var btn = dd.querySelector('.nav-dropdown-btn');
            if (btn) btn.setAttribute('aria-expanded', 'false');
          });
        }
      });
    }

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
