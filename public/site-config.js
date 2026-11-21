// ==========================================================================
// GTA6HEISTGUIDE.COM — 1-FILE MASTER REVENUE & OWNER CONFIGURATION
// Swap 100% of affiliate IDs, contact email, AdSense & GA4 in 60 seconds.
// ==========================================================================
window.SITE_CONFIG = Object.freeze({
  siteName: "GTA6HeistGuide.com",
  domain: "https://www.gta6heistguide.com",
  ownerContactEmail: "inquiries@gta6heistguide.com",

  // Centralized Direct Amazon Product Links (Paste exact https://amzn.to/... SiteStripe links here)
  amazonLinks: {
    kontrolfreek: "https://www.amazon.com/s?k=KontrolFreek+FPS+Thumbsticks+PS5&tag=gta6heistguid-20",
    samsung990pro: "https://www.amazon.com/s?k=Samsung+990+PRO+2TB+PCIe+4.0+M.2&tag=gta6heistguid-20",
    pulseElite: "https://www.amazon.com/s?k=PlayStation+Pulse+Elite+Wireless+Headset&tag=gta6heistguid-20",
    dualsenseDock: "https://www.amazon.com/s?k=PlayStation+DualSense+Charging+Station&tag=gta6heistguid-20",
    dualsenseEdge: "https://www.amazon.com/s?k=DualSense+Edge+Wireless+Controller&tag=gta6heistguid-20"
  },

  // Affiliate & Store Monetization IDs
  amazonTag: "gta6heistguid-20",
  exitLagUrl: "https://www.exitlag.com/refer/10386953",
  exitLagCode: "10386953",
  g2aUrl: "https://www.g2a.com/n/reflink-4094b9aab5",
  enebaUrl: "https://www.eneba.com/store/all?q=gta&af_id=gta6heistguide",
  enebaAffiliateId: "gta6heistguide",
  whopUrl: "https://apexlocallabs.gumroad.com/l/apex-pro-bundle",
  gumroadCutFlowUrl: "https://apexlocallabs.gumroad.com/l/cutflow-pro",
  gumroadBundleUrl: "https://apexlocallabs.gumroad.com/l/apex-pro-bundle",
  getApexLocalUrl: "https://getapexlocal.com",
  getApexLocalPartnersUrl: "https://getapexlocal.com/partners",

  // Optional Buyer Activations (leave blank "" to keep disabled)
  adsensePublisherId: "",   // Example: "ca-pub-1234567890123456"
  ga4MeasurementId: "",     // Example: "G-XXXXXXXXXX"
  enableAffiliateClickTracking: true
});

// Auto-hydrate centralized Amazon product links sitewide
(function() {
  function hydrateLinks() {
    var cfg = window.SITE_CONFIG;
    if (!cfg || !cfg.amazonLinks) return;

    // 1. Explicit data-amazon-link hooks
    document.querySelectorAll('[data-amazon-link]').forEach(function(el) {
      var key = el.getAttribute('data-amazon-link');
      if (cfg.amazonLinks[key]) {
        el.href = cfg.amazonLinks[key];
      }
    });

    // 2. Sitewide automatic mapping of product buttons to centralized links
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

    // 3. Setup click / hover support for .nav-dropdown
    document.querySelectorAll('.nav-dropdown').forEach(function(dd) {
      var btn = dd.querySelector('.nav-dropdown-btn');
      if (btn && !btn.dataset.bound) {
        btn.dataset.bound = 'true';
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          var isOpen = dd.classList.toggle('is-open');
          btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });
      }
    });
    document.addEventListener('click', function() {
      document.querySelectorAll('.nav-dropdown.is-open').forEach(function(dd) {
        dd.classList.remove('is-open');
        var btn = dd.querySelector('.nav-dropdown-btn');
        if (btn) btn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', hydrateLinks);
  } else {
    hydrateLinks();
  }
})();
