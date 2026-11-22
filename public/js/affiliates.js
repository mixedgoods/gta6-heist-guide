// ==========================================================================
// GTA6HEISTGUIDE.COM — CENTRALIZED NATIVE AFFILIATE & PRODUCT CARD ENGINE (v5.0)
// Single source of truth for Amazon (gta6heistguid-20), G2A, Eneba, ExitLag
// and CutFlow Pro.
//
// Features:
// - Preserves all exact partner URLs & tracking IDs
// - Amazon Creators API fallback-safe controlled catalog across 5 categories:
//   Controllers, Headsets & Audio, Storage, Streaming, Gaming Accessories
// - Zero scraped data, zero fabricated ASINs, zero hardcoded prices or fake stars
// - Session- + day-stable rotation (changes over time, never flickers on refresh)
// - Strict per-page product deduplication & multi-category diversity
// - Native dark card design matching Animals, Vehicles & World Database cards
// ==========================================================================
window.GTA6_AFFILIATES = Object.freeze({
  amazon: {
    tag: "gta6heistguid-20",
    discoveryMode: "curated-fallback",
    links: {
      kontrolfreek: "https://www.amazon.com/s?k=KontrolFreek+FPS+Thumbsticks+PS5&tag=gta6heistguid-20",
      dualsenseDock: "https://www.amazon.com/s?k=DualSense+Charging+Station+PS5&tag=gta6heistguid-20",
      controllerStand: "https://www.amazon.com/s?k=PS5+Xbox+Controller+Headset+Stand+Desk&tag=gta6heistguid-20",
      controllerCase: "https://www.amazon.com/s?k=PS5+DualSense+Protective+Travel+Case&tag=gta6heistguid-20",
      replacementSticks: "https://www.amazon.com/s?k=PS5+Xbox+Controller+Thumb+Grips+Silicone+Caps&tag=gta6heistguid-20",
      dualsenseEdge: "https://www.amazon.com/s?k=DualSense+Edge+Wireless+Controller&tag=gta6heistguid-20",
      xboxElite2: "https://www.amazon.com/s?k=Xbox+Elite+Wireless+Controller+Series+2&tag=gta6heistguid-20",
      pulseElite: "https://www.amazon.com/s?k=PlayStation+Pulse+Elite+Wireless+Headset&tag=gta6heistguid-20",
      pulseExplore: "https://www.amazon.com/s?k=PlayStation+PULSE+Explore+Wireless+Earbuds&tag=gta6heistguid-20",
      usbGamingMic: "https://www.amazon.com/s?k=USB+Gaming+Microphone+Streaming+PS5+PC&tag=gta6heistguid-20",
      headsetStand: "https://www.amazon.com/s?k=Aluminum+Gaming+Headset+Stand+Desk+Mount&tag=gta6heistguid-20",
      samsung990pro: "https://www.amazon.com/s?k=Samsung+990+PRO+2TB+PCIe+4.0+M.2&tag=gta6heistguid-20",
      ssdHeatsink: "https://www.amazon.com/s?k=PS5+M.2+NVMe+SSD+Heatsink&tag=gta6heistguid-20",
      wdBlackSn850p: "https://www.amazon.com/s?k=WD_BLACK+SN850P+NVMe+SSD+for+PS5&tag=gta6heistguid-20",
      elgatoHd60x: "https://www.amazon.com/s?k=Elgato+HD60+X+Capture+Card&tag=gta6heistguid-20",
      streamLight: "https://www.amazon.com/s?k=LED+Streaming+Key+Light+Desk+Mount+Gaming&tag=gta6heistguid-20",
      cableKit: "https://www.amazon.com/s?k=Desk+Cable+Management+Kit+Gaming+Setup&tag=gta6heistguid-20",
      prime: "https://www.amazon.com/prime?tag=gta6heistguid-20",
      primeTrial: "https://www.amazon.com/tryprimefree?tag=gta6heistguid-20",
      amazonMusic: "https://www.amazon.com/music/unlimited?tag=gta6heistguid-20",
      gamingMonitor: "https://www.amazon.com/s?k=4K+120Hz+HDMI+2.1+Gaming+Monitor+PS5&tag=gta6heistguid-20",
      gta6Ps5: "https://www.amazon.com/s?k=GTA+6+PlayStation+5&tag=gta6heistguid-20"
    }
  },
  exitlag: {
    url: "https://www.exitlag.com/refer/10386953",
    label: "ExitLag Gaming Routing",
    cta: "Explore ExitLag"
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

// Auto-updating Launch Day calculation (Launch: Nov 19, 2026 UTC)
window.getGTA6LaunchDay = function() {
  return Math.max(1, Math.floor((Date.now() - Date.parse('2026-11-19T00:00:00Z')) / 86400000) + 1);
};

window.getGTA6LaunchBannerText = function() {
  return "Story Mode: LIVE \u00b7 GTA 6 Online: No official release date announced";
};

(function(global) {
  'use strict';

  var SESSION_SEED_KEY = 'gta6hg_aff_session_seed_v2';
  var aff = global.GTA6_AFFILIATES;
  var AMZ_DISCLOSURE = 'Affiliate link \u00b7 As an Amazon Associate we earn from qualifying purchases. Prices and availability vary on Amazon.';

  var CATALOG = Object.freeze({
    // --- CONTROLLERS ---
    kontrolfreek: {
      id: 'kontrolfreek',
      partner: 'amazon',
      partnerName: 'Amazon',
      category: 'Controllers',
      badge: 'Controller Grips',
      accent: 'pink',
      title: 'KontrolFreek Performance Thumbsticks',
      desc: 'High-rise & mid-rise concave thumb grips designed to expand analog stick range of motion on console.',
      benefit: 'Finer stick control for console gunfights, cover peeks & driving precision',
      cta: 'Check on Amazon \u2192',
      url: aff.amazon.links.kontrolfreek,
      amazonKey: 'kontrolfreek',
      mediaType: 'product',
      iconType: 'thumbsticks',
      image: '/assets/gear/kontrolfreek.jpg',
      alt: 'KontrolFreek Performance Thumbsticks for PS5',
      disclosure: AMZ_DISCLOSURE
    },
    dualsenseDock: {
      id: 'dualsenseDock',
      partner: 'amazon',
      partnerName: 'Amazon',
      category: 'Controllers',
      badge: 'Charging Station',
      accent: 'cyan',
      title: 'DualSense Charging Station',
      desc: 'Drop-in dual controller charging dock that keeps two PS5 controllers powered without tying up console USB ports.',
      benefit: 'Keep a spare controller fully charged for marathon Leonida sessions',
      cta: 'Check on Amazon \u2192',
      url: aff.amazon.links.dualsenseDock,
      amazonKey: 'dualsenseDock',
      mediaType: 'product',
      iconType: 'dock',
      image: '/assets/dualsense-charging-station.jpg',
      alt: 'PlayStation DualSense Charging Station',
      disclosure: AMZ_DISCLOSURE
    },
    replacementSticks: {
      id: 'replacementSticks',
      partner: 'amazon',
      partnerName: 'Amazon',
      category: 'Controllers',
      badge: 'Thumb Grips',
      accent: 'pink',
      title: 'Silicone Controller Thumb Grips & Caps',
      desc: 'Affordable textured slip-on thumbstick caps that add traction and shield factory analog rubber from wear.',
      benefit: 'Everyday grip comfort and stick protection for PS5 & Xbox pads',
      cta: 'Check on Amazon \u2192',
      url: aff.amazon.links.replacementSticks,
      amazonKey: 'replacementSticks',
      mediaType: 'icon-card',
      iconType: 'thumbsticks',
      alt: 'Silicone Controller Thumb Grips and Caps',
      disclosure: AMZ_DISCLOSURE
    },
    controllerCase: {
      id: 'controllerCase',
      partner: 'amazon',
      partnerName: 'Amazon',
      category: 'Controllers',
      badge: 'Protective Case',
      accent: 'amber',
      title: 'Hardshell Controller Protective Case',
      desc: 'Molded EVA travel shell guards DualSense or Xbox triggers and analog sticks against dust and accidental bumps.',
      benefit: 'Protects analog sticks from drift pressure when storing or traveling',
      cta: 'Check on Amazon \u2192',
      url: aff.amazon.links.controllerCase,
      amazonKey: 'controllerCase',
      mediaType: 'icon-card',
      iconType: 'case',
      alt: 'Hardshell Controller Protective Case',
      disclosure: AMZ_DISCLOSURE
    },
    dualsenseEdge: {
      id: 'dualsenseEdge',
      partner: 'amazon',
      partnerName: 'Amazon',
      category: 'Controllers',
      badge: 'Back-Paddle Controller',
      accent: 'cyan',
      title: 'DualSense Edge Wireless Controller',
      desc: 'PlayStation pro controller with remappable back paddles, 3-stop trigger locks, and swappable stick modules.',
      benefit: 'Faster weapon swaps, cover exits & custom stick deadzones on PS5',
      cta: 'Check on Amazon \u2192',
      url: aff.amazon.links.dualsenseEdge,
      amazonKey: 'dualsenseEdge',
      mediaType: 'product',
      iconType: 'controller',
      image: '/assets/gear/dualsense-edge.jpg',
      alt: 'PlayStation DualSense Edge Wireless Controller',
      disclosure: AMZ_DISCLOSURE
    },
    xboxElite2: {
      id: 'xboxElite2',
      partner: 'amazon',
      partnerName: 'Amazon',
      category: 'Controllers',
      badge: 'Xbox Pro Controller',
      accent: 'green',
      title: 'Xbox Elite Wireless Controller Series 2',
      desc: 'Adjustable-tension thumbsticks, wrap-around rubberized grip, and rear paddles built for Xbox Series X|S.',
      benefit: 'Custom trigger stops & paddle profiles for rapid heist loadouts',
      cta: 'Check on Amazon \u2192',
      url: aff.amazon.links.xboxElite2,
      amazonKey: 'xboxElite2',
      mediaType: 'icon-card',
      iconType: 'controller',
      alt: 'Xbox Elite Wireless Controller Series 2',
      disclosure: AMZ_DISCLOSURE
    },

    // --- HEADSETS & AUDIO ---
    pulseElite: {
      id: 'pulseElite',
      partner: 'amazon',
      partnerName: 'Amazon',
      category: 'Headsets & Audio',
      badge: 'Wireless Headset',
      accent: 'amber',
      title: 'PlayStation PULSE Elite Headset',
      desc: 'Planar magnetic wireless headset tuned for PS5 3D spatial audio, directional sirens, and clean voice chat.',
      benefit: 'Crisp spatial cues for stealth heists & all 23 Leonida radio stations',
      cta: 'Check on Amazon \u2192',
      url: aff.amazon.links.pulseElite,
      amazonKey: 'pulseElite',
      mediaType: 'product',
      iconType: 'headset',
      image: '/assets/gear/pulse-elite.jpg',
      alt: 'PlayStation PULSE Elite Wireless Headset',
      disclosure: AMZ_DISCLOSURE
    },
    pulseExplore: {
      id: 'pulseExplore',
      partner: 'amazon',
      partnerName: 'Amazon',
      category: 'Headsets & Audio',
      badge: 'Gaming Earbuds',
      accent: 'purple',
      title: 'PlayStation PULSE Explore Earbuds',
      desc: 'Lightweight low-latency wireless earbuds for players who prefer cool, headband-free comfort on long runs.',
      benefit: 'Low-latency PlayStation Link audio + Bluetooth for second-screen guides',
      cta: 'Check on Amazon \u2192',
      url: aff.amazon.links.pulseExplore,
      amazonKey: 'pulseExplore',
      mediaType: 'icon-card',
      iconType: 'earbuds',
      alt: 'PlayStation PULSE Explore Wireless Earbuds',
      disclosure: AMZ_DISCLOSURE
    },
    usbGamingMic: {
      id: 'usbGamingMic',
      partner: 'amazon',
      partnerName: 'Amazon',
      category: 'Headsets & Audio',
      badge: 'USB Microphone',
      accent: 'pink',
      title: 'USB Condenser Gaming Microphone',
      desc: 'Plug-and-play cardioid desk microphone with tap-to-mute control for clean party chat and commentary.',
      benefit: 'Clear voice capture for squad callouts, YouTube guides & live streams',
      cta: 'Check on Amazon \u2192',
      url: aff.amazon.links.usbGamingMic,
      amazonKey: 'usbGamingMic',
      mediaType: 'icon-card',
      iconType: 'mic',
      alt: 'USB Condenser Gaming Microphone',
      disclosure: AMZ_DISCLOSURE
    },
    headsetStand: {
      id: 'headsetStand',
      partner: 'amazon',
      partnerName: 'Amazon',
      category: 'Headsets & Audio',
      badge: 'Headset Stand',
      accent: 'cyan',
      title: 'Aluminum Gaming Headset Stand',
      desc: 'Affordable weighted desktop or under-desk hanger that keeps wireless headsets safe and off clutter.',
      benefit: 'Protects earcups and headbands while freeing desk space',
      cta: 'Check on Amazon \u2192',
      url: aff.amazon.links.headsetStand,
      amazonKey: 'headsetStand',
      mediaType: 'icon-card',
      iconType: 'headset',
      alt: 'Aluminum Gaming Headset Stand',
      disclosure: AMZ_DISCLOSURE
    },

    // --- STORAGE ---
    samsung990pro: {
      id: 'samsung990pro',
      partner: 'amazon',
      partnerName: 'Amazon',
      category: 'Storage',
      badge: 'PS5 M.2 NVMe SSD',
      accent: 'green',
      title: 'Samsung 990 PRO 2TB M.2 SSD',
      desc: 'High-speed PCIe 4.0 M.2 NVMe storage built for PlayStation 5 expansion bays and large open-world installs.',
      benefit: 'Up to 7,450 MB/s read speeds \u00b7 Room for 212 GB+ GTA VI installs',
      cta: 'Check on Amazon \u2192',
      url: aff.amazon.links.samsung990pro,
      amazonKey: 'samsung990pro',
      mediaType: 'cover',
      iconType: 'ssd',
      image: '/assets/gear/samsung-990pro.jpg',
      alt: 'Samsung 990 PRO 2TB PCIe 4.0 M.2 NVMe SSD',
      disclosure: AMZ_DISCLOSURE
    },
    ssdHeatsink: {
      id: 'ssdHeatsink',
      partner: 'amazon',
      partnerName: 'Amazon',
      category: 'Storage',
      badge: 'SSD Heatsink',
      accent: 'green',
      title: 'PS5 M.2 NVMe SSD Heatsink',
      desc: 'Affordable low-profile aluminum heatsink with silicone thermal pads sized to fit inside the PS5 M.2 slot.',
      benefit: 'Keeps bare PCIe 4.0 NVMe drives cool under heavy open-world streaming',
      cta: 'Check on Amazon \u2192',
      url: aff.amazon.links.ssdHeatsink,
      amazonKey: 'ssdHeatsink',
      mediaType: 'icon-card',
      iconType: 'ssd',
      alt: 'PS5 Compatible M.2 NVMe SSD Heatsink',
      disclosure: AMZ_DISCLOSURE
    },
    wdBlackSn850p: {
      id: 'wdBlackSn850p',
      partner: 'amazon',
      partnerName: 'Amazon',
      category: 'Storage',
      badge: 'PS5 Licensed SSD',
      accent: 'cyan',
      title: 'WD_BLACK SN850P NVMe SSD for PS5',
      desc: 'Officially licensed PS5 internal M.2 drive with pre-fitted heatsink for drop-in console storage expansion.',
      benefit: 'Ready-to-install heatsink design built for PlayStation 5 expansion',
      cta: 'Check on Amazon \u2192',
      url: aff.amazon.links.wdBlackSn850p,
      amazonKey: 'wdBlackSn850p',
      mediaType: 'icon-card',
      iconType: 'ssd',
      alt: 'WD_BLACK SN850P NVMe SSD for PS5',
      disclosure: AMZ_DISCLOSURE
    },

    // --- STREAMING & GAMING ACCESSORIES ---
    elgatoHd60x: {
      id: 'elgatoHd60x',
      partner: 'amazon',
      partnerName: 'Amazon',
      category: 'Streaming',
      badge: 'Capture Card',
      accent: 'purple',
      title: 'Elgato HD60 X Capture Card',
      desc: 'External USB console capture card with low-latency passthrough for recording PS5 & Xbox heist runs.',
      benefit: 'Clean gameplay capture for YouTube guides, Twitch & vertical shorts',
      cta: 'Check on Amazon \u2192',
      url: aff.amazon.links.elgatoHd60x,
      amazonKey: 'elgatoHd60x',
      mediaType: 'icon-card',
      iconType: 'capture',
      alt: 'Elgato HD60 X Console Capture Card',
      disclosure: AMZ_DISCLOSURE
    },
    streamLight: {
      id: 'streamLight',
      partner: 'amazon',
      partnerName: 'Amazon',
      category: 'Streaming',
      badge: 'Streaming Light',
      accent: 'amber',
      title: 'Compact LED Desk Streaming Light',
      desc: 'Affordable adjustable bi-color key light that brightens webcam feeds for late-night streams without screen glare.',
      benefit: 'Soft diffused lighting for sharper facecam quality in dark rooms',
      cta: 'Check on Amazon \u2192',
      url: aff.amazon.links.streamLight,
      amazonKey: 'streamLight',
      mediaType: 'icon-card',
      iconType: 'light',
      alt: 'Compact LED Desk Streaming Light',
      disclosure: AMZ_DISCLOSURE
    },
    controllerStand: {
      id: 'controllerStand',
      partner: 'amazon',
      partnerName: 'Amazon',
      category: 'Gaming Accessories',
      badge: 'Desk Stand',
      accent: 'cyan',
      title: 'Controller & Headset Desk Stand',
      desc: 'Affordable all-in-one desktop stand holding two console controllers and a headset in one small footprint.',
      benefit: 'Keeps controllers, cables & headset tidy beside your monitor or TV',
      cta: 'Check on Amazon \u2192',
      url: aff.amazon.links.controllerStand,
      amazonKey: 'controllerStand',
      mediaType: 'icon-card',
      iconType: 'stand',
      alt: 'Desktop Controller and Headset Stand',
      disclosure: AMZ_DISCLOSURE
    },
    cableKit: {
      id: 'cableKit',
      partner: 'amazon',
      partnerName: 'Amazon',
      category: 'Gaming Accessories',
      badge: 'Cable Management',
      accent: 'green',
      title: 'Desk Cable Management Kit',
      desc: 'Affordable under-desk cable clips, sleeves, and ties to cleanly route console HDMI, power, and charging cords.',
      benefit: 'Eliminates cord clutter around PS5, Xbox & dual-screen desk setups',
      cta: 'Check on Amazon \u2192',
      url: aff.amazon.links.cableKit,
      amazonKey: 'cableKit',
      mediaType: 'icon-card',
      iconType: 'cable',
      alt: 'Desk Cable Management Kit for Gaming Setup',
      disclosure: AMZ_DISCLOSURE
    },

    // --- NON-AMAZON VERIFIED PARTNERS ---
    g2a: {
      id: 'g2a',
      partner: 'g2a',
      partnerName: 'G2A.COM',
      category: 'Game Deals',
      badge: 'Digital Marketplace',
      accent: 'orange',
      title: 'G2A Game Keys & Gift Cards',
      desc: 'Browse digital PlayStation Store, Xbox Live wallet top-ups, subscriptions, and PC keys from marketplace sellers.',
      benefit: 'Compare global PSN, Xbox & PC digital listings with instant code delivery',
      cta: 'Browse G2A Deals \u2192',
      url: aff.g2a.url,
      mediaType: 'brand-g2a',
      alt: 'G2A.COM Digital Marketplace',
      disclosure: 'Affiliate link \u00b7 We earn a commission on qualifying G2A purchases at no extra cost to you.'
    },
    eneba: {
      id: 'eneba',
      partner: 'eneba',
      partnerName: 'Eneba',
      category: 'Store Credit',
      badge: 'Digital Top-Ups',
      accent: 'purple',
      title: 'Eneba GTA & Console Store Cards',
      desc: 'Explore PlayStation, Xbox, and PC gift cards, digital game keys, and GTA storefront offers in one catalog.',
      benefit: 'Fast region filtering for PSN & Xbox wallet cards and digital editions',
      cta: 'Explore Eneba Store \u2192',
      url: aff.eneba.url,
      mediaType: 'brand-eneba',
      alt: 'Eneba Digital Storefront',
      disclosure: 'Affiliate link \u00b7 We earn a commission on qualifying Eneba purchases at no extra cost to you.'
    },
    exitlag: {
      id: 'exitlag',
      partner: 'exitlag',
      partnerName: 'ExitLag',
      category: 'Network Routing',
      badge: 'Gaming Routing',
      accent: 'crimson',
      title: 'ExitLag Multi-Path Routing',
      desc: 'Dedicated multi-path connection routing software built to optimize PC gaming network paths across supported titles.',
      benefit: 'Automated route selection & connection stability tools (results vary by ISP & region)',
      cta: 'Explore ExitLag \u2192',
      url: aff.exitlag.url,
      mediaType: 'brand-exitlag',
      alt: 'ExitLag Multi-Path Gaming Network Routing',
      disclosure: 'Affiliate link \u00b7 We earn a commission on qualifying ExitLag referrals at no extra cost to you.'
    },
    cutflow: {
      id: 'cutflow',
      partner: 'gumroad',
      partnerName: 'CutFlow Pro',
      category: 'Creator Utility',
      badge: 'Offline Clip Tool',
      accent: 'amber',
      title: 'CutFlow Pro Clip Workstation',
      desc: '100% offline Windows utility that auto-cuts dead air from raw heist gameplay VODs and exports clean NLE timelines.',
      benefit: 'Local FFmpeg silence removal & timeline XML export with no monthly cloud fees',
      cta: 'View CutFlow Pro \u2192',
      url: aff.gumroad.cutflowPro,
      mediaType: 'ui-cutflow',
      image: '/assets/cutflow-ui.png',
      alt: 'CutFlow Pro Desktop Auto-Silence Remover Interface',
      disclosure: 'Partner link \u00b7 Qualifying Gumroad purchases support GTA6HeistGuide.com at no extra cost to you.'
    }
  });

  // Category buckets for multi-category 4-card Amazon rotation
  var AMAZON_CATEGORY_BUCKETS = Object.freeze([
    ['kontrolfreek', 'dualsenseDock', 'replacementSticks', 'controllerCase', 'dualsenseEdge', 'xboxElite2'],
    ['pulseElite', 'pulseExplore', 'usbGamingMic', 'headsetStand'],
    ['samsung990pro', 'ssdHeatsink', 'wdBlackSn850p'],
    ['elgatoHd60x', 'controllerStand', 'streamLight', 'cableKit']
  ]);

  // Contextual slot pools mapped to page types
  var CONTEXT_POOLS = {
    'homepage-hero': ['kontrolfreek', 'dualsenseDock', 'samsung990pro', 'pulseElite', 'dualsenseEdge', 'ssdHeatsink', 'controllerCase'],
    'homepage-deals': ['eneba', 'g2a', 'exitlag', 'cutflow'],
    'money-top': ['eneba', 'g2a'],
    'money-robbery-gear': ['kontrolfreek', 'dualsenseDock', 'replacementSticks', 'dualsenseEdge', 'controllerCase'],
    'money-mid': ['samsung990pro', 'ssdHeatsink', 'wdBlackSn850p', 'g2a', 'eneba', 'controllerStand'],
    'money-bottom': ['samsung990pro', 'wdBlackSn850p', 'pulseElite', 'ssdHeatsink', 'externalSsd'],
    'radio-audio': ['pulseElite', 'pulseExplore', 'usbGamingMic', 'headsetStand'],
    'gunstores-gear': ['kontrolfreek', 'dualsenseDock', 'dualsenseEdge', 'controllerCase', 'xboxElite2'],
    'planner-creator': ['cutflow'],
    'tips-top': ['kontrolfreek', 'dualsenseDock', 'pulseElite', 'dualsenseEdge', 'ssdHeatsink'],
    'tips-bottom': ['eneba', 'g2a', 'cutflow', 'exitlag'],
    'tools-top': ['exitlag', 'cutflow'],
    'tools-mid': ['cutflow', 'exitlag', 'samsung990pro', 'dualsenseEdge'],
    'database': ['kontrolfreek', 'samsung990pro', 'pulseElite', 'dualsenseDock', 'ssdHeatsink', 'controllerStand'],
    'default': ['kontrolfreek', 'eneba', 'g2a', 'samsung990pro', 'pulseElite', 'dualsenseDock', 'cutflow', 'exitlag']
  };

  function esc(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function hashStr(str) {
    var h = 2166136261;
    var s = String(str || '');
    for (var i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul ? Math.imul(h, 16777619) : ((h * 16777619) >>> 0);
    }
    return h >>> 0;
  }

  function getDayIndex() {
    return Math.floor(Date.now() / 86400000);
  }

  function getSessionSeed() {
    var day = getDayIndex();
    try {
      var existing = global.sessionStorage.getItem(SESSION_SEED_KEY);
      if (existing !== null && /^\d+$/.test(existing)) {
        return parseInt(existing, 10) + day;
      }
      var seed = Math.floor(Math.random() * 10000);
      global.sessionStorage.setItem(SESSION_SEED_KEY, String(seed));
      return seed + day;
    } catch (e) {
      return day % 10000;
    }
  }

  var pageUsedPartners = {};
  var pageUsedIds = {};

  function resetPageRegistry() {
    pageUsedPartners = {};
    pageUsedIds = {};
  }

  function markUsed(offer) {
    if (!offer) return;
    pageUsedIds[offer.id] = true;
    pageUsedPartners[offer.partner] = true;
  }

  function detectDefaultContext() {
    var p = (global.location && global.location.pathname || '/').toLowerCase();
    if (p.indexOf('radio') !== -1) return 'radio-audio';
    if (p.indexOf('weapons-bonuses') !== -1) return 'gunstores-gear';
    if (p.indexOf('money') !== -1) return 'money-top';
    if (p.indexOf('tips') !== -1 || p.indexOf('secret') !== -1 || p.indexOf('discover') !== -1) return 'tips-top';
    if (p.indexOf('tools') !== -1 || p.indexOf('planner') !== -1 || p.indexOf('calc') !== -1 || p.indexOf('free') !== -1 || p.indexOf('cheat') !== -1 || p.indexOf('live') !== -1) return 'tools-top';
    if (p.indexOf('database') !== -1 || p.indexOf('animal') !== -1 || p.indexOf('vehicle') !== -1 || p.indexOf('weapon') !== -1 || p.indexOf('propert') !== -1) return 'database';
    return 'default';
  }

  function selectOffers(contextKey, count, slotId, options) {
    options = options || {};
    var poolIds = Array.isArray(contextKey)
      ? contextKey.slice()
      : (CONTEXT_POOLS[contextKey] || CONTEXT_POOLS['default']).slice();

    var seed = getSessionSeed();
    var offset = (seed + hashStr(slotId || contextKey)) % Math.max(1, poolIds.length);
    var rotated = poolIds.slice(offset).concat(poolIds.slice(0, offset));

    var picked = [];
    var localPartners = {};

    for (var i = 0; i < rotated.length && picked.length < count; i++) {
      var offer = CATALOG[rotated[i]];
      if (!offer) continue;
      if (pageUsedIds[offer.id]) continue;
      if (!options.allowPagePartnerReuse && pageUsedPartners[offer.partner]) continue;
      if (!options.allowSamePartner && localPartners[offer.partner]) continue;
      picked.push(offer);
      localPartners[offer.partner] = true;
    }

    if (picked.length < count) {
      var fallbackOrder = ['eneba', 'g2a', 'kontrolfreek', 'dualsenseDock', 'pulseElite', 'samsung990pro', 'cutflow', 'exitlag'];
      for (var j = 0; j < fallbackOrder.length && picked.length < count; j++) {
        var fb = CATALOG[fallbackOrder[j]];
        if (!fb || pageUsedIds[fb.id]) continue;
        if (!options.allowSamePartner && localPartners[fb.partner]) continue;
        if (!options.allowPagePartnerReuse && pageUsedPartners[fb.partner]) continue;
        picked.push(fb);
        localPartners[fb.partner] = true;
      }
    }

    if (!options.skipRegister) {
      for (var k = 0; k < picked.length; k++) {
        markUsed(picked[k]);
      }
    }
    return picked;
  }

  function selectDiverseAmazonSet(slotId, count) {
    var seed = getSessionSeed();
    var picked = [];
    var buckets = AMAZON_CATEGORY_BUCKETS;
    for (var b = 0; b < buckets.length && picked.length < count; b++) {
      var pool = buckets[b];
      var offset = (seed + hashStr((slotId || 'amz') + '-' + b)) % pool.length;
      for (var tries = 0; tries < pool.length; tries++) {
        var id = pool[(offset + tries) % pool.length];
        var item = CATALOG[id];
        if (item && !pageUsedIds[item.id]) {
          picked.push(item);
          pageUsedIds[item.id] = true;
          break;
        }
      }
    }
    return picked;
  }

  function getCategoryIconSvg(iconType) {
    switch (iconType) {
      case 'thumbsticks':
        return '<svg viewBox="0 0 64 64" width="46" height="46" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="22" cy="26" r="11"/><circle cx="22" cy="26" r="5"/><path d="M16 36 v8 c0 3 12 3 12 0 v-8"/><circle cx="44" cy="30" r="10"/><circle cx="44" cy="30" r="4.5"/><path d="M39 39 v7 c0 3 10 3 10 0 v-7"/></svg>';
      case 'dock':
        return '<svg viewBox="0 0 64 64" width="46" height="46" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="10" y="38" width="44" height="12" rx="5"/><path d="M18 38 L24 18 H40 L46 38"/><path d="M33 22 L28 31 H34 L31 37"/></svg>';
      case 'controller':
        return '<svg viewBox="0 0 64 64" width="46" height="46" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 22 H48 C54 22 57 30 55 41 C54 47 49 49 45 45 L39 39 H25 L19 45 C15 49 10 47 9 41 C7 30 10 22 16 22 Z"/><line x1="20" y1="28" x2="20" y2="34"/><line x1="17" y1="31" x2="23" y2="31"/><circle cx="44" cy="29" r="1.6" fill="currentColor"/><circle cx="48" cy="33" r="1.6" fill="currentColor"/></svg>';
      case 'case':
        return '<svg viewBox="0 0 64 64" width="46" height="46" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="10" y="18" width="44" height="32" rx="10"/><path d="M24 18 V14 C24 11 40 11 40 14 V18"/><line x1="10" y1="34" x2="54" y2="34"/><circle cx="32" cy="34" r="3"/></svg>';
      case 'headset':
        return '<svg viewBox="0 0 64 64" width="46" height="46" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 34 V30 A18 18 0 0 1 50 30 V34"/><rect x="10" y="32" width="10" height="16" rx="4"/><rect x="44" y="32" width="10" height="16" rx="4"/><path d="M49 48 C49 54 42 56 34 56"/></svg>';
      case 'earbuds':
        return '<svg viewBox="0 0 64 64" width="46" height="46" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="21" cy="26" r="8"/><path d="M21 34 V48"/><circle cx="43" cy="26" r="8"/><path d="M43 34 V48"/><circle cx="21" cy="26" r="2.5"/><circle cx="43" cy="26" r="2.5"/></svg>';
      case 'mic':
        return '<svg viewBox="0 0 64 64" width="46" height="46" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="24" y="10" width="16" height="26" rx="8"/><path d="M16 30 A16 16 0 0 0 48 30"/><line x1="32" y1="46" x2="32" y2="54"/><line x1="22" y1="54" x2="42" y2="54"/></svg>';
      case 'ssd':
        return '<svg viewBox="0 0 64 64" width="46" height="46" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="8" y="21" width="48" height="22" rx="4"/><rect x="15" y="27" width="12" height="10" rx="1.5"/><rect x="31" y="27" width="12" height="10" rx="1.5"/><line x1="50" y1="25" x2="50" y2="39"/></svg>';
      case 'capture':
        return '<svg viewBox="0 0 64 64" width="46" height="46" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="10" y="16" width="44" height="32" rx="6"/><circle cx="32" cy="32" r="9"/><circle cx="32" cy="32" r="3" fill="currentColor"/><circle cx="46" cy="23" r="2" fill="currentColor"/></svg>';
      case 'light':
        return '<svg viewBox="0 0 64 64" width="46" height="46" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="14" y="12" width="36" height="24" rx="5"/><line x1="32" y1="36" x2="32" y2="54"/><line x1="22" y1="54" x2="42" y2="54"/><circle cx="24" cy="24" r="2" fill="currentColor"/><circle cx="32" cy="24" r="2" fill="currentColor"/><circle cx="40" cy="24" r="2" fill="currentColor"/></svg>';
      case 'stand':
        return '<svg viewBox="0 0 64 64" width="46" height="46" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 14 H42"/><line x1="32" y1="14" x2="32" y2="50"/><rect x="16" y="48" width="32" height="6" rx="3"/><path d="M22 30 H42"/></svg>';
      case 'cable':
      default:
        return '<svg viewBox="0 0 64 64" width="46" height="46" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="12" y="14" width="12" height="10" rx="2"/><rect x="40" y="40" width="12" height="10" rx="2"/><path d="M18 24 V36 C18 42 26 42 32 32 C38 22 46 22 46 28 V40"/></svg>';
    }
  }

  function renderMediaHtml(offer, compact) {
    if (offer.mediaType === 'brand-g2a') {
      return (
        '<div class="aff-media aff-brand-panel aff-brand-panel--g2a' + (compact ? ' is-compact' : '') + '">' +
          '<div class="aff-brand-wordmark-wrap">' +
            '<span class="aff-brand-mark aff-brand-mark--g2a" aria-hidden="true">G2A</span>' +
            '<span class="aff-brand-sub">DIGITAL MARKETPLACE</span>' +
          '</div>' +
          (!compact ? '<div class="aff-brand-chips"><span>PSN</span><span>XBOX</span><span>PC KEYS</span></div>' : '') +
        '</div>'
      );
    }
    if (offer.mediaType === 'brand-eneba') {
      return (
        '<div class="aff-media aff-brand-panel aff-brand-panel--eneba' + (compact ? ' is-compact' : '') + '">' +
          '<div class="aff-brand-wordmark-wrap">' +
            '<span class="aff-brand-mark aff-brand-mark--eneba" aria-hidden="true">eneba</span>' +
            '<span class="aff-brand-sub">GIFT CARDS &amp; KEYS</span>' +
          '</div>' +
          (!compact ? '<div class="aff-brand-chips"><span>WALLET CARDS</span><span>GLOBAL STORE</span></div>' : '') +
        '</div>'
      );
    }
    if (offer.mediaType === 'brand-exitlag') {
      return (
        '<div class="aff-media aff-brand-panel aff-brand-panel--exitlag' + (compact ? ' is-compact' : '') + '">' +
          '<div class="aff-brand-wordmark-wrap">' +
            '<span class="aff-brand-mark aff-brand-mark--exitlag" aria-hidden="true">EXITLAG</span>' +
            '<span class="aff-brand-sub">MULTI-PATH ROUTING</span>' +
          '</div>' +
          (!compact ? '<div class="aff-brand-chips"><span>PC ROUTING</span><span>ROUTE OPTIMIZER</span></div>' : '') +
        '</div>'
      );
    }
    if (offer.mediaType === 'ui-cutflow') {
      return (
        '<div class="aff-media aff-media--ui' + (compact ? ' is-compact' : '') + '">' +
          '<img src="' + esc(offer.image) + '" alt="' + esc(offer.alt) + '" loading="lazy" decoding="async">' +
          '<span class="aff-media-brand-pill aff-media-brand-pill--cutflow">CutFlow Pro</span>' +
        '</div>'
      );
    }
    if (offer.mediaType === 'icon-card' || !offer.image) {
      return (
        '<div class="aff-media aff-media--category aff-cat-accent-' + esc(offer.accent || 'cyan') + (compact ? ' is-compact' : '') + '">' +
          '<div class="aff-cat-icon-orb">' + getCategoryIconSvg(offer.iconType) + '</div>' +
          (!compact ? '<span class="aff-cat-kicker">' + esc(offer.category || 'Console Gear') + '</span>' : '') +
          (!compact ? '<span class="aff-cat-retailer">AMAZON ASSOCIATES</span>' : '') +
        '</div>'
      );
    }
    var mediaCls = offer.mediaType === 'cover' ? 'aff-media aff-media--cover' : 'aff-media aff-media--product';
    return (
      '<div class="' + mediaCls + (compact ? ' is-compact' : '') + '">' +
        '<img src="' + esc(offer.image) + '" alt="' + esc(offer.alt) + '" loading="lazy" decoding="async">' +
      '</div>'
    );
  }

  function renderCardHtml(offer, variant, placement) {
    var amzAttr = offer.amazonKey ? ' data-amazon-link="' + esc(offer.amazonKey) + '"' : '';
    var linkAttrs = 'href="' + esc(offer.url) + '"' + amzAttr +
      ' target="_blank" rel="sponsored noopener noreferrer"' +
      ' data-aff-partner="' + esc(offer.partner) + '"' +
      ' data-aff-placement="' + esc(placement || variant) + '"';

    if (variant === 'compact-inline') {
      return (
        '<aside class="aff-card aff-card--compact aff-accent-' + esc(offer.accent) + '" aria-label="Recommended gaming accessory (affiliate link)">' +
          renderMediaHtml(offer, true) +
          '<div class="aff-compact-body">' +
            '<div class="aff-meta-row">' +
              '<span class="aff-partner-pill">' + esc(offer.partnerName) + '</span>' +
              '<span class="aff-badge-pill">' + esc(offer.badge) + '</span>' +
              '<span class="aff-disclosure-tag">Affiliate Disclosure</span>' +
            '</div>' +
            '<div class="aff-compact-title">' + esc(offer.title) + '</div>' +
            '<div class="aff-compact-benefit">' + esc(offer.benefit) + '</div>' +
            '<div class="aff-disclosure-inline">' + esc(offer.disclosure) + '</div>' +
          '</div>' +
          '<div class="aff-compact-action">' +
            '<a ' + linkAttrs + ' class="aff-cta aff-cta--' + esc(offer.accent) + '">' + esc(offer.cta) + '</a>' +
          '</div>' +
        '</aside>'
      );
    }

    if (variant === 'horizontal-featured') {
      return (
        '<aside class="aff-card aff-card--horizontal aff-accent-' + esc(offer.accent) + '" aria-label="Featured partner recommendation (affiliate link)">' +
          renderMediaHtml(offer, false) +
          '<div class="aff-card-body">' +
            '<div class="aff-meta-row">' +
              '<span class="aff-partner-pill">' + esc(offer.partnerName) + '</span>' +
              '<span class="aff-badge-pill">' + esc(offer.badge) + '</span>' +
              '<span class="aff-disclosure-tag">Affiliate Link</span>' +
            '</div>' +
            '<h3 class="aff-card-title">' + esc(offer.title) + '</h3>' +
            '<p class="aff-card-desc">' + esc(offer.desc) + '</p>' +
            '<div class="aff-card-benefit">\u2713 ' + esc(offer.benefit) + '</div>' +
            '<div class="aff-disclosure-note">' + esc(offer.disclosure) + '</div>' +
          '</div>' +
          '<div class="aff-horizontal-cta">' +
            '<a ' + linkAttrs + ' class="aff-cta aff-cta--' + esc(offer.accent) + '">' + esc(offer.cta) + '</a>' +
          '</div>' +
        '</aside>'
      );
    }

    if (variant === 'hero-featured') {
      return (
        '<aside class="aff-card aff-card--hero aff-accent-' + esc(offer.accent) + '" aria-label="Featured console hardware recommendation (affiliate link)">' +
          '<div class="aff-hero-head">' +
            '<span class="aff-partner-pill">' + esc(offer.partnerName) + '</span>' +
            '<span class="aff-disclosure-tag">Affiliate Pick</span>' +
          '</div>' +
          renderMediaHtml(offer, false) +
          '<div class="aff-card-body">' +
            '<span class="aff-badge-pill">' + esc(offer.category || offer.badge) + '</span>' +
            '<h2 class="aff-card-title">' + esc(offer.title) + '</h2>' +
            '<p class="aff-card-desc">' + esc(offer.desc) + '</p>' +
            '<div class="aff-card-benefit">\u2713 ' + esc(offer.benefit) + '</div>' +
          '</div>' +
          '<div class="aff-card-foot">' +
            '<a ' + linkAttrs + ' class="aff-cta aff-cta--' + esc(offer.accent) + '">' + esc(offer.cta) + '</a>' +
            '<div class="aff-disclosure-note">' + esc(offer.disclosure) + '</div>' +
          '</div>' +
        '</aside>'
      );
    }

    if (variant === 'amazon-tile') {
      return (
        '<article class="aff-card aff-card--tile aff-accent-' + esc(offer.accent) + '">' +
          renderMediaHtml(offer, false) +
          '<div class="aff-card-body">' +
            '<div class="aff-meta-row">' +
              '<span class="aff-partner-pill">' + esc(offer.partnerName) + '</span>' +
              '<span class="aff-badge-pill">' + esc(offer.badge) + '</span>' +
            '</div>' +
            '<h3 class="aff-card-title">' + esc(offer.title) + '</h3>' +
            '<p class="aff-card-desc">' + esc(offer.benefit) + '</p>' +
          '</div>' +
          '<div class="aff-card-foot">' +
            '<a ' + linkAttrs + ' class="aff-cta aff-cta--' + esc(offer.accent) + '">' + esc(offer.cta) + '</a>' +
          '</div>' +
        '</article>'
      );
    }

    // Standard native card (matches World Database / Animals / Vehicles card language)
    return (
      '<article class="aff-card aff-card--standard aff-accent-' + esc(offer.accent) + '">' +
        renderMediaHtml(offer, false) +
        '<div class="aff-card-body">' +
          '<div class="aff-meta-row">' +
            '<span class="aff-partner-pill">' + esc(offer.partnerName) + '</span>' +
            '<span class="aff-badge-pill">' + esc(offer.badge) + '</span>' +
            '<span class="aff-disclosure-tag">Affiliate</span>' +
          '</div>' +
          '<h3 class="aff-card-title">' + esc(offer.title) + '</h3>' +
          '<p class="aff-card-desc">' + esc(offer.desc) + '</p>' +
          '<div class="aff-card-benefit">\u2713 ' + esc(offer.benefit) + '</div>' +
        '</div>' +
        '<div class="aff-card-foot">' +
          '<a ' + linkAttrs + ' class="aff-cta aff-cta--' + esc(offer.accent) + '">' + esc(offer.cta) + '</a>' +
          '<div class="aff-disclosure-note">' + esc(offer.disclosure) + '</div>' +
        '</div>' +
      '</article>'
    );
  }

  function renderSlotHtml(config) {
    var context = config.context || detectDefaultContext();
    var variant = config.variant || 'horizontal-featured';
    var count = parseInt(config.count, 10) || (variant === 'card-grid-2' ? 2 : (variant === 'amazon-grid-4' ? 4 : 1));
    var slotId = config.slotId || (context + '-' + variant);
    var heading = config.heading || '';
    var subheading = config.subheading || '';
    var eyebrow = config.eyebrow || '';

    if (variant === 'amazon-grid-4') {
      var amzOffers = selectDiverseAmazonSet(slotId, count);
      if (!amzOffers.length) return '';
      return amzOffers.map(function(o, idx) {
        return renderCardHtml(o, 'amazon-tile', slotId + '-' + (idx + 1));
      }).join('');
    }

    var offers = selectOffers(context, count, slotId, config);
    if (!offers.length) return '';

    if (variant === 'card-grid-2') {
      var headHtml = heading
        ? '<div class="aff-module-head">' +
            '<div>' +
              (eyebrow ? '<span class="aff-module-eyebrow">' + esc(eyebrow) + '</span>' : '') +
              '<h2 class="aff-module-title">' + esc(heading) + '</h2>' +
              (subheading ? '<p class="aff-module-sub">' + esc(subheading) + '</p>' : '') +
            '</div>' +
            '<span class="aff-disclosure-tag">Affiliate Disclosure</span>' +
          '</div>'
        : '';
      return (
        '<section class="aff-card-module" aria-label="' + esc(heading || 'Gaming gear and deals') + '">' +
          headHtml +
          '<div class="aff-grid-2">' +
            offers.map(function(o, idx) {
              return renderCardHtml(o, 'standard', slotId + '-' + (idx + 1));
            }).join('') +
          '</div>' +
        '</section>'
      );
    }

    return renderCardHtml(offers[0], variant, slotId);
  }

  function mountAllSlots() {
    resetPageRegistry();

    // 1. Mount explicit [data-aff-slot] containers in DOM order
    document.querySelectorAll('[data-aff-slot]').forEach(function(el) {
      if (el.getAttribute('data-aff-mounted') === '1') return;
      el.setAttribute('data-aff-mounted', '1');
      var cfg = {
        slotId: el.getAttribute('data-aff-slot') || 'slot',
        context: el.getAttribute('data-aff-context') || detectDefaultContext(),
        variant: el.getAttribute('data-aff-variant') || 'horizontal-featured',
        count: el.getAttribute('data-aff-count') || '',
        eyebrow: el.getAttribute('data-aff-eyebrow') || '',
        heading: el.getAttribute('data-aff-heading') || '',
        subheading: el.getAttribute('data-aff-subheading') || '',
        allowPagePartnerReuse: el.getAttribute('data-aff-allow-reuse') === 'true'
      };
      var html = renderSlotHtml(cfg);
      if (html) el.innerHTML = html;
    });

    // 2. Auto-upgrade any legacy plain-text .syndicate-aff-bar elements cleanly
    var legacyBars = document.querySelectorAll('.syndicate-aff-bar');
    legacyBars.forEach(function(bar, idx) {
      if (bar.getAttribute('data-aff-upgraded') === '1') return;
      bar.setAttribute('data-aff-upgraded', '1');
      if (idx > 0) {
        bar.style.display = 'none';
        return;
      }
      var ctx = detectDefaultContext();
      var html = renderSlotHtml({
        slotId: 'legacy-bar-' + idx,
        context: ctx,
        variant: ctx === 'database' ? 'compact-inline' : 'horizontal-featured',
        count: 1
      });
      if (html) {
        var wrapper = document.createElement('div');
        wrapper.className = 'aff-legacy-upgrade';
        wrapper.innerHTML = html;
        bar.parentNode.replaceChild(wrapper, bar);
      }
    });
  }

  // Expose reusable Native Affiliate Card API
  global.GTA6AffiliateCards = {
    catalog: CATALOG,
    contexts: CONTEXT_POOLS,
    categoryBuckets: AMAZON_CATEGORY_BUCKETS,
    getSessionSeed: getSessionSeed,
    resetPageRegistry: resetPageRegistry,
    selectOffers: selectOffers,
    selectDiverseAmazonSet: selectDiverseAmazonSet,
    renderCardHtml: renderCardHtml,
    renderSlotHtml: renderSlotHtml,
    mountAll: mountAllSlots,
    getDatabaseHardwareCardHtml: function(slotId, contextOverride) {
      return renderSlotHtml({
        slotId: slotId || 'db-hardware-card',
        context: contextOverride || detectDefaultContext() || 'database',
        variant: 'compact-inline',
        count: 1
      });
    }
  };

  global.getSyndicateAffBarHtml = function() {
    return global.GTA6AffiliateCards.renderSlotHtml({
      slotId: 'inline-helper-card',
      context: detectDefaultContext(),
      variant: 'compact-inline',
      count: 1
    });
  };

  function hydrateAffiliatesAndBanner() {
    var launchDay = global.getGTA6LaunchDay();
    var bannerText = global.getGTA6LaunchBannerText();

    document.querySelectorAll('[data-launch-banner], #launchDayBanner').forEach(function(el) {
      el.textContent = bannerText;
    });
    document.querySelectorAll('[data-launch-day-num]').forEach(function(el) {
      el.textContent = "DAY-" + launchDay;
    });

    mountAllSlots();

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
})(window);
