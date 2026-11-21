// ==========================================================================
// GTA6HEISTGUIDE.COM — CENTRALIZED AFFILIATE & LAUNCH-DAY CONFIG (SYNDICATE v3.2)
// Single source of truth for Amazon, ExitLag, Gumroad, G2A & Eneba.
// ==========================================================================
window.GTA6_AFFILIATES = Object.freeze({
  amazon: {
    tag: "gta6heistguid-20",
    links: {
      kontrolfreek: "https://www.amazon.com/s?k=KontrolFreek+FPS+Thumbsticks+PS5&tag=gta6heistguid-20",
      samsung990pro: "https://www.amazon.com/s?k=Samsung+990+PRO+2TB+PCIe+4.0+M.2&tag=gta6heistguid-20",
      pulseElite: "https://www.amazon.com/s?k=PlayStation+Pulse+Elite+Wireless+Headset&tag=gta6heistguid-20",
      pulseExplore: "https://www.amazon.com/s?k=PlayStation+PULSE+Explore+Wireless+Earbuds&tag=gta6heistguid-20",
      dualsenseDock: "https://www.amazon.com/s?k=DualSense+Charging+Station+PS5&tag=gta6heistguid-20",
      dualsenseEdge: "https://www.amazon.com/s?k=DualSense+Edge+Wireless+Controller&tag=gta6heistguid-20",
      primeTrial: "https://www.amazon.com/tryprimefree?tag=gta6heistguid-20",
      amazonMusic: "https://www.amazon.com/music/unlimited?tag=gta6heistguid-20",
      gamingMonitor: "https://www.amazon.com/s?k=4K+120Hz+HDMI+2.1+Gaming+Monitor+PS5&tag=gta6heistguid-20",
      gta6Ps5: "https://www.amazon.com/s?k=GTA+6+PlayStation+5&tag=gta6heistguid-20"
    }
  },
  exitlag: {
    url: "https://www.exitlag.com/refer/10386953",
    label: "ExitLag Tunnel (Free)",
    cta: "Activate ExitLag"
  },
  gumroad: {
    cutflowPro: "https://apexlocallabs.gumroad.com/l/cutflow-pro",
    apexProBundle: "https://apexlocallabs.gumroad.com/l/apex-pro-bundle"
  },
  g2a: {
    url: "https://www.g2a.com/n/reflink-4094b9aab5"
  },
  eneba: {
    url: "https://www.eneba.com/store/all?q=gta&af_id=gta6heistguide",
    affiliateId: "gta6heistguide"
  }
});

// High-retention compact inline affiliate text bar (reused sitewide & inside popouts)
window.getSyndicateAffBarHtml = function(extraAmazonHtml) {
  var aff = window.GTA6_AFFILIATES;
  var extra = extraAmazonHtml ? '<div class="syndicate-aff-bar-sub">' + extraAmazonHtml + '</div>' : '';
  return (
    '<div class="syndicate-aff-bar">' +
      '<div class="syndicate-aff-bar-main">' +
        '<span>🔑 Need Discounted Launch Keys, Low-Ping Lobby Routing, or 9:16 Auto-Clipping? &rarr;</span> ' +
        '<a href="' + aff.g2a.url + '" target="_blank" rel="sponsored noopener noreferrer" data-aff-partner="g2a">G2A Keys</a>' +
        ' <span class="aff-sep">|</span> ' +
        '<a href="' + aff.eneba.url + '" target="_blank" rel="sponsored noopener noreferrer" data-aff-partner="eneba">Eneba</a>' +
        ' <span class="aff-sep">|</span> ' +
        '<a href="' + aff.exitlag.url + '" target="_blank" rel="sponsored noopener noreferrer" data-aff-partner="exitlag">ExitLag Tunnel (Free)</a>' +
        ' <span class="aff-sep">|</span> ' +
        '<a href="' + aff.gumroad.cutflowPro + '" target="_blank" rel="sponsored noopener noreferrer" data-aff-partner="gumroad">CutFlow Pro</a>' +
      '</div>' +
      extra +
    '</div>'
  );
};

// Auto-updating Launch Day calculation (Launch: Nov 19, 2026 UTC)
window.getGTA6LaunchDay = function() {
  return Math.max(1, Math.floor((Date.now() - Date.parse('2026-11-19T00:00:00Z')) / 86400000) + 1);
};

window.getGTA6LaunchBannerText = function() {
  return "Story Mode: LIVE · GTA 6 Online: Expected 2027";
};

(function() {
  function hydrateAffiliatesAndBanner() {
    var aff = window.GTA6_AFFILIATES;
    var launchDay = window.getGTA6LaunchDay();
    var bannerText = window.getGTA6LaunchBannerText();

    // Update all dynamic launch-day banners
    document.querySelectorAll('[data-launch-banner], #launchDayBanner').forEach(function(el) {
      el.textContent = bannerText;
    });
    document.querySelectorAll('[data-launch-day-num]').forEach(function(el) {
      el.textContent = "DAY-" + launchDay;
    });

    // Hydrate centralized affiliate links
    document.querySelectorAll('[data-aff-link]').forEach(function(a) {
      var key = a.getAttribute('data-aff-link');
      if (key === 'exitlag') a.href = aff.exitlag.url;
      else if (key === 'cutflow') a.href = aff.gumroad.cutflowPro;
      else if (key === 'apex-bundle') a.href = aff.gumroad.apexProBundle;
      else if (key === 'g2a') a.href = aff.g2a.url;
      else if (key === 'eneba') a.href = aff.eneba.url;
      else if (aff.amazon.links[key]) a.href = aff.amazon.links[key];
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', hydrateAffiliatesAndBanner);
  } else {
    hydrateAffiliatesAndBanner();
  }
})();
