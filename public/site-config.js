// ==========================================================================
// GTA6HEISTGUIDE.COM — 1-FILE MASTER REVENUE & OWNER CONFIGURATION (v3.2)
// Swap 100% of affiliate IDs, contact email, AdSense & GA4 in 60 seconds.
// ==========================================================================
window.SITE_CONFIG = Object.freeze({
  siteName: "GTA6HeistGuide.com",
  domain: "https://www.gta6heistguide.com",
  ownerContactEmail: "inquiries@gta6heistguide.com",

  // Centralized Direct Amazon Product Links
  amazonLinks: {
    kontrolfreek: "https://www.amazon.com/s?k=KontrolFreek+FPS+Thumbsticks+PS5&tag=gta6heistguid-20",
    samsung990pro: "https://www.amazon.com/s?k=Samsung+990+PRO+2TB+PCIe+4.0+M.2&tag=gta6heistguid-20",
    pulseElite: "https://www.amazon.com/s?k=PlayStation+Pulse+Elite+Wireless+Headset&tag=gta6heistguid-20",
    pulseExplore: "https://www.amazon.com/s?k=PlayStation+PULSE+Explore+Wireless+Earbuds&tag=gta6heistguid-20",
    dualsenseDock: "https://www.amazon.com/s?k=PlayStation+DualSense+Charging+Station&tag=gta6heistguid-20",
    dualsenseEdge: "https://www.amazon.com/s?k=DualSense+Edge+Wireless+Controller&tag=gta6heistguid-20",
    amazonMusic: "https://www.amazon.com/music/unlimited?tag=gta6heistguid-20",
    gamingMonitor: "https://www.amazon.com/s?k=4K+120Hz+HDMI+2.1+Gaming+Monitor+PS5&tag=gta6heistguid-20"
  },

  // Affiliate & Store Monetization IDs
  amazonTag: "gta6heistguid-20",
  exitLagUrl: "https://www.exitlag.com/refer/10386953",
  g2aUrl: "https://www.g2a.com/n/reflink-4094b9aab5",
  enebaUrl: "https://www.eneba.com/store/all?q=gta&af_id=gta6heistguide",
  enebaAffiliateId: "gta6heistguide",
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
      } else if (/pulse.*elite/i.test(h)) {
        a.href = cfg.amazonLinks.pulseElite;
      } else if (/dualsense.*charging|charging.*station/i.test(h)) {
        a.href = cfg.amazonLinks.dualsenseDock;
      } else if (/dualsense.*edge|B0BS5V7T65/i.test(h)) {
        a.href = cfg.amazonLinks.dualsenseEdge;
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
