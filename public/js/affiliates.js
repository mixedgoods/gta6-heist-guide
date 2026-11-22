// ==========================================================================
// GTA6HEISTGUIDE.COM — CENTRALIZED NATIVE AFFILIATE & PRODUCT CARD ENGINE (v6.0)
// Single source of truth for Amazon (gta6heistguid-20), G2A, Eneba, ExitLag
// and CutFlow Pro.
//
// Features:
// - Preserves all exact partner URLs & tracking IDs
// - Verified dark-integrated product photos & cutouts where available;
//   clean dark product-information cards otherwise (zero giant generic icons,
//   zero harsh white squares, zero fake images, zero hardcoded prices)
// - Session- + day-stable rotation (never flickers on refresh)
// - Strict per-page merchant & product deduplication
// - Native dark cyberpunk design matching GTA6HeistGuide panels
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
    label: "ExitLag Network Routing",
    cta: "Visit ExitLag"
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

  var SESSION_SEED_KEY = 'gta6hg_aff_session_seed_v3';
  var aff = global.GTA6_AFFILIATES;
  var AMZ_DISCLOSURE = 'Affiliate link \u00b7 As an Amazon Associate we earn from qualifying purchases. Prices and availability vary on Amazon.';

  var CATALOG = Object.freeze({
    // --- CONTROLLERS ---
    dualsenseEdge: {
      id: 'dualsenseEdge',
      partner: 'amazon',
      partnerName: 'Amazon',
      category: 'Controllers',
      badge: 'Back-Paddle Controller',
      accent: 'cyan',
      title: 'DualSense Edge Wireless Controller',
      specs: ['Remappable Back Paddles', 'Replaceable Stick Modules'],
      desc: 'Official PlayStation pro controller featuring customizable back buttons, adjustable trigger stops, and swappable stick modules.',
      benefit: 'Custom profiles & trigger stops for faster weapon swaps on PS5',
      cta: 'Check on Amazon \u2192',
      url: aff.amazon.links.dualsenseEdge,
      amazonKey: 'dualsenseEdge',
      mediaType: 'cutout',
      image: '/assets/gear/dualsense-edge-cutout.webp',
      alt: 'PlayStation DualSense Edge Wireless Controller',
      disclosure: AMZ_DISCLOSURE
    },
    kontrolfreek: {
      id: 'kontrolfreek',
      partner: 'amazon',
      partnerName: 'Amazon',
      category: 'Controllers',
      badge: 'Controller Grips',
      accent: 'pink',
      title: 'KontrolFreek Performance Thumbsticks',
      specs: ['High-Rise & Mid-Rise Grips', 'PS5 & Xbox Variants'],
      desc: 'Textured concave thumb grips designed to extend analog stick height for finer aim adjustments on console controllers.',
      benefit: 'Added stick precision for console gunfights & tight cornering',
      cta: 'Check on Amazon \u2192',
      url: aff.amazon.links.kontrolfreek,
      amazonKey: 'kontrolfreek',
      mediaType: 'info',
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
      specs: ['Charges 2 Controllers', 'Click-In Cradle Design'],
      desc: 'Drop-in dual controller charging dock that keeps two PS5 controllers powered without occupying console USB ports.',
      benefit: 'Keep a spare DualSense topped up for long story sessions',
      cta: 'Check on Amazon \u2192',
      url: aff.amazon.links.dualsenseDock,
      amazonKey: 'dualsenseDock',
      mediaType: 'info',
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
      specs: ['Slip-On Silicone Caps', 'PS5 & Xbox Compatible'],
      desc: 'Textured slip-on thumbstick caps that improve grip traction and help shield stock analog rubber from wear.',
      benefit: 'Simple grip comfort and stick protection for everyday play',
      cta: 'Check on Amazon \u2192',
      url: aff.amazon.links.replacementSticks,
      amazonKey: 'replacementSticks',
      mediaType: 'info',
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
      specs: ['Molded EVA Shell', 'Stick & Trigger Guard'],
      desc: 'Molded EVA travel shell shields DualSense or Xbox triggers and analog sticks against dust and accidental bag pressure.',
      benefit: 'Protects analog sticks and shoulder buttons in storage or transit',
      cta: 'Check on Amazon \u2192',
      url: aff.amazon.links.controllerCase,
      amazonKey: 'controllerCase',
      mediaType: 'info',
      alt: 'Hardshell Controller Protective Case',
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
      specs: ['Adjustable-Tension Sticks', 'Hair-Trigger Locks & Paddles'],
      desc: 'Adjustable-tension thumbsticks, wrap-around rubberized grip, and rear paddles built for Xbox Series X|S and PC.',
      benefit: 'Custom trigger stops & paddle profiles for console play',
      cta: 'Check on Amazon \u2192',
      url: aff.amazon.links.xboxElite2,
      amazonKey: 'xboxElite2',
      mediaType: 'info',
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
      specs: ['Planar Magnetic Drivers', 'PS Link + Bluetooth Audio'],
      desc: 'Planar magnetic wireless headset tuned for PS5 3D spatial audio, directional audio cues, and clean voice chat.',
      benefit: 'Spatial soundstage for stealth cues, sirens & Leonida radio',
      cta: 'Check on Amazon \u2192',
      url: aff.amazon.links.pulseElite,
      amazonKey: 'pulseElite',
      mediaType: 'cutout',
      image: '/assets/gear/pulse-elite-cutout.webp',
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
      specs: ['Planar Magnetic Earbuds', 'PlayStation Link + Bluetooth'],
      desc: 'Lightweight low-latency wireless earbuds for players who prefer headband-free comfort on long gaming sessions.',
      benefit: 'Dual-device audio lets you hear PS5 audio alongside phone guides',
      cta: 'Check on Amazon \u2192',
      url: aff.amazon.links.pulseExplore,
      amazonKey: 'pulseExplore',
      mediaType: 'info',
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
      specs: ['Cardioid Voice Pickup', 'Plug-and-Play USB (PS5 / PC)'],
      desc: 'Plug-and-play cardioid desk microphone with quick mute control for clean party chat and stream commentary.',
      benefit: 'Clear voice capture for squad callouts, guides & live streams',
      cta: 'Check on Amazon \u2192',
      url: aff.amazon.links.usbGamingMic,
      amazonKey: 'usbGamingMic',
      mediaType: 'info',
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
      specs: ['Anodized Aluminum', 'Cushioned Headband Rest'],
      desc: 'Weighted desktop or under-desk hanger that keeps wireless headsets safe, accessible, and off desk clutter.',
      benefit: 'Protects earcups and headbands between gaming sessions',
      cta: 'Check on Amazon \u2192',
      url: aff.amazon.links.headsetStand,
      amazonKey: 'headsetStand',
      mediaType: 'info',
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
      specs: ['PCIe 4.0 x4 NVMe M.2', 'PS5 & PC Compatible'],
      desc: 'High-speed PCIe 4.0 M.2 NVMe storage built for PlayStation 5 expansion bays and large open-world installs.',
      benefit: 'Expands console & PC storage for massive modern game libraries',
      cta: 'Check on Amazon \u2192',
      url: aff.amazon.links.samsung990pro,
      amazonKey: 'samsung990pro',
      mediaType: 'cover',
      image: '/assets/gear/samsung-990pro.jpg',
      alt: 'Samsung 990 PRO 2TB PCIe 4.0 M.2 NVMe SSD',
      disclosure: AMZ_DISCLOSURE
    },
    ssdHeatsink: {
      id: 'ssdHeatsink',
      partner: 'amazon',
      partnerName: 'Amazon',
      category: 'Storage',
      badge: 'PS5 SSD Heatsink',
      accent: 'green',
      title: 'PS5 M.2 NVMe SSD Heatsink',
      specs: ['Low-Profile Aluminum', 'Fits PS5 M.2 2280 Slot'],
      desc: 'Low-profile aluminum heatsink with silicone thermal pads sized to meet Sony PS5 M.2 expansion slot clearances.',
      benefit: 'Keeps bare PCIe 4.0 NVMe drives cool inside the PS5 bay',
      cta: 'Check on Amazon \u2192',
      url: aff.amazon.links.ssdHeatsink,
      amazonKey: 'ssdHeatsink',
      mediaType: 'info',
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
      specs: ['Pre-Installed Heatsink', 'PCIe Gen4 M.2 2280'],
      desc: 'Officially licensed PS5 internal M.2 drive with pre-fitted heatsink for straightforward console storage expansion.',
      benefit: 'Drop-in heatsink design sized directly for PS5 expansion',
      cta: 'Check on Amazon \u2192',
      url: aff.amazon.links.wdBlackSn850p,
      amazonKey: 'wdBlackSn850p',
      mediaType: 'info',
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
      specs: ['HDMI VRR Passthrough', 'USB 3.0 PS5 / Xbox / PC'],
      desc: 'External USB console capture card with low-latency passthrough for recording PS5 and Xbox gameplay footage.',
      benefit: 'Clean gameplay capture for guides, Twitch streams & highlight clips',
      cta: 'Check on Amazon \u2192',
      url: aff.amazon.links.elgatoHd60x,
      amazonKey: 'elgatoHd60x',
      mediaType: 'info',
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
      specs: ['Bi-Color Dimming', 'Desk Clamp Mount'],
      desc: 'Adjustable bi-color key light that brightens webcam feeds for late-night streams without harsh monitor glare.',
      benefit: 'Soft diffused lighting for clearer facecam video in dark rooms',
      cta: 'Check on Amazon \u2192',
      url: aff.amazon.links.streamLight,
      amazonKey: 'streamLight',
      mediaType: 'info',
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
      specs: ['Dual Controller Cradle', 'Integrated Headset Hook'],
      desc: 'Compact desktop stand holding console controllers and a headset in one organized footprint beside your display.',
      benefit: 'Keeps controllers, headset & charging cables neatly staged',
      cta: 'Check on Amazon \u2192',
      url: aff.amazon.links.controllerStand,
      amazonKey: 'controllerStand',
      mediaType: 'info',
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
      specs: ['Braided Sleeves & Clips', 'HDMI & Power Routing'],
      desc: 'Under-desk cable clips, sleeves, and ties to cleanly route console HDMI, power, and controller charging cords.',
      benefit: 'Reduces cord clutter around PS5, Xbox & dual-screen desks',
      cta: 'Check on Amazon \u2192',
      url: aff.amazon.links.cableKit,
      amazonKey: 'cableKit',
      mediaType: 'info',
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
      desc: 'Browse digital PlayStation Store, Xbox wallet top-ups, subscriptions, and PC game listings across marketplace sellers.',
      benefit: 'Compare regional PSN, Xbox & PC digital store listings in one place',
      cta: 'Browse G2A \u2192',
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
      badge: 'Digital Marketplace',
      accent: 'purple',
      title: 'Eneba GTA & Console Store Cards',
      desc: 'Explore PlayStation, Xbox, and PC gift cards, digital game keys, and GTA storefront listings in one catalog.',
      benefit: 'Region filtering for PSN & Xbox wallet cards and digital editions',
      cta: 'Explore Eneba \u2192',
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
      badge: 'Connection Routing',
      accent: 'crimson',
      title: 'ExitLag Multi-Path Routing',
      desc: 'Connection routing software for PC games designed to manage network paths across supported titles (results vary by ISP and region).',
      benefit: 'Multi-path route management utility for supported PC games',
      cta: 'Visit ExitLag \u2192',
      url: aff.exitlag.url,
      mediaType: 'brand-exitlag',
      alt: 'ExitLag Multi-Path Gaming Network Routing',
      disclosure: 'Referral link \u00b7 We may earn a commission on qualifying ExitLag referrals at no extra cost to you.'
    },
    cutflow: {
      id: 'cutflow',
      partner: 'gumroad',
      partnerName: 'CutFlow Pro',
      category: 'Creator Utility',
      badge: 'Offline Clip Tool',
      accent: 'amber',
      title: 'CutFlow Pro Clip Workstation',
      desc: '100% offline Windows utility that trims dead air from raw gameplay VODs and exports clean NLE timelines locally.',
      benefit: 'Local FFmpeg silence removal & Premiere/Resolve XML timeline export',
      cta: 'View CutFlow Pro \u2192',
      url: aff.gumroad.cutflowPro,
      mediaType: 'ui-cutflow',
      image: '/assets/cutflow-ui.png',
      alt: 'CutFlow Pro Desktop Auto-Silence Remover Interface',
      disclosure: 'Partner link \u00b7 Qualifying Gumroad purchases support GTA6HeistGuide.com at no extra cost to you.'
    }
  });

  // Category buckets for multi-category 4-card Amazon rotation
  // Balances verified dark-integrated product photos with clean dark product-info cards
  var AMAZON_CATEGORY_BUCKETS = Object.freeze([
    ['dualsenseEdge', 'kontrolfreek', 'dualsenseDock', 'xboxElite2', 'controllerCase', 'replacementSticks'],
    ['pulseElite', 'usbGamingMic', 'pulseExplore', 'headsetStand'],
    ['samsung990pro', 'ssdHeatsink', 'wdBlackSn850p'],
    ['elgatoHd60x', 'controllerStand', 'streamLight', 'cableKit']
  ]);

  // Contextual slot pools mapped to page types
  var CONTEXT_POOLS = {
    'homepage-hero': ['samsung990pro', 'dualsenseEdge', 'pulseElite'],
    'homepage-deals': ['eneba', 'g2a', 'cutflow', 'exitlag'],
    'heist-mid': ['dualsenseEdge', 'pulseElite', 'samsung990pro', 'kontrolfreek', 'dualsenseDock'],
    'heist-bottom': ['eneba', 'g2a', 'cutflow', 'exitlag'],
    'money-top': ['eneba', 'g2a'],
    'money-robbery-gear': ['dualsenseEdge', 'kontrolfreek', 'dualsenseDock', 'controllerCase', 'replacementSticks'],
    'money-mid': ['g2a', 'eneba'],
    'money-bottom': ['cutflow', 'exitlag', 'samsung990pro', 'wdBlackSn850p'],
    'radio-audio': ['pulseElite', 'pulseExplore', 'usbGamingMic', 'headsetStand'],
    'radio-bottom': ['eneba', 'g2a', 'cutflow'],
    'gunstores-gear': ['dualsenseEdge', 'kontrolfreek', 'dualsenseDock', 'xboxElite2', 'controllerCase'],
    'planner-creator': ['cutflow'],
    'tips-top': ['dualsenseEdge', 'pulseElite', 'kontrolfreek', 'dualsenseDock', 'ssdHeatsink'],
    'tips-bottom': ['eneba', 'g2a', 'cutflow', 'exitlag'],
    'tools-top': ['cutflow', 'exitlag'],
    'tools-mid': ['eneba', 'g2a', 'samsung990pro', 'elgatoHd60x'],
    'database': ['samsung990pro', 'dualsenseEdge', 'pulseElite', 'ssdHeatsink', 'controllerStand'],
    'default': ['eneba', 'g2a', 'samsung990pro', 'dualsenseEdge', 'pulseElite', 'cutflow', 'exitlag']
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
      // Deterministic daily base combined with per-session salt so cards stay stable across refreshes
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
    if (p.indexOf('/heists/') !== -1) return 'heist-mid';
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
    var offset = (seed + hashStr(slotId || String(contextKey))) % Math.max(1, poolIds.length);
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
      var fallbackOrder = ['eneba', 'g2a', 'dualsenseEdge', 'pulseElite', 'samsung990pro', 'cutflow', 'exitlag'];
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

  function renderSpecListHtml(specs) {
    if (!Array.isArray(specs) || !specs.length) return '';
    return (
      '<ul class="aff-info-specs">' +
        specs.slice(0, 2).map(function(s) {
          return '<li>' + esc(s) + '</li>';
        }).join('') +
      '</ul>'
    );
  }

  function hasVisualMedia(offer) {
    return (
      offer.mediaType === 'brand-g2a' ||
      offer.mediaType === 'brand-eneba' ||
      offer.mediaType === 'brand-exitlag' ||
      offer.mediaType === 'ui-cutflow' ||
      ((offer.mediaType === 'cover' || offer.mediaType === 'cutout') && Boolean(offer.image))
    );
  }

  function renderMediaHtml(offer, compact, eager) {
    var loadAttr = eager ? 'eager' : 'lazy';
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
          (!compact ? '<div class="aff-brand-chips"><span>PC ROUTING</span><span>REFERRAL</span></div>' : '') +
        '</div>'
      );
    }
    if (offer.mediaType === 'ui-cutflow') {
      return (
        '<div class="aff-media aff-media--ui' + (compact ? ' is-compact' : '') + '">' +
          '<img src="' + esc(offer.image) + '" alt="' + esc(offer.alt) + '" loading="' + loadAttr + '" decoding="async">' +
          '<span class="aff-media-brand-pill aff-media-brand-pill--cutflow">CutFlow Pro</span>' +
        '</div>'
      );
    }
    if (offer.mediaType === 'cutout' && offer.image) {
      return (
        '<div class="aff-media aff-media--cutout aff-cutout-accent-' + esc(offer.accent || 'cyan') + (compact ? ' is-compact' : '') + '">' +
          '<img src="' + esc(offer.image) + '" alt="' + esc(offer.alt) + '" loading="' + loadAttr + '" decoding="async">' +
        '</div>'
      );
    }
    if (offer.mediaType === 'cover' && offer.image) {
      return (
        '<div class="aff-media aff-media--cover' + (compact ? ' is-compact' : '') + '">' +
          '<img src="' + esc(offer.image) + '" alt="' + esc(offer.alt) + '" loading="' + loadAttr + '" decoding="async">' +
        '</div>'
      );
    }
    // Clean dark product-information header panel (zero generic icons, zero fake images)
    return (
      '<div class="aff-info-header aff-info-accent-' + esc(offer.accent || 'cyan') + '">' +
        '<div class="aff-info-header-top">' +
          '<span class="aff-info-cat">' + esc(offer.category || 'Hardware') + '</span>' +
          '<span class="aff-info-retailer">' + esc(offer.partnerName || 'Amazon') + '</span>' +
        '</div>' +
        renderSpecListHtml(offer.specs) +
      '</div>'
    );
  }

  function renderCardHtml(offer, variant, placement) {
    var amzAttr = offer.amazonKey ? ' data-amazon-link="' + esc(offer.amazonKey) + '"' : '';
    var linkAttrs = 'href="' + esc(offer.url) + '"' + amzAttr +
      ' target="_blank" rel="sponsored noopener noreferrer"' +
      ' data-aff-partner="' + esc(offer.partner) + '"' +
      ' data-aff-placement="' + esc(placement || variant) + '"';
    var isInfoOnly = !hasVisualMedia(offer);

    if (variant === 'compact-inline') {
      return (
        '<aside class="aff-card aff-card--compact' + (isInfoOnly ? ' is-info-only' : '') + ' aff-accent-' + esc(offer.accent) + '" aria-label="Recommended gaming accessory (affiliate link)">' +
          (isInfoOnly ? '' : renderMediaHtml(offer, true, false)) +
          '<div class="aff-compact-body">' +
            '<div class="aff-meta-row">' +
              '<span class="aff-partner-pill">' + esc(offer.partnerName) + '</span>' +
              '<span class="aff-badge-pill">' + esc(offer.badge) + '</span>' +
              '<span class="aff-disclosure-tag">Affiliate</span>' +
            '</div>' +
            '<div class="aff-compact-title">' + esc(offer.title) + '</div>' +
            '<div class="aff-compact-benefit">' + esc(offer.benefit) + '</div>' +
            (isInfoOnly && offer.specs ? '<div class="aff-info-inline-specs">' + offer.specs.map(esc).join(' &middot; ') + '</div>' : '') +
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
        '<aside class="aff-card aff-card--horizontal' + (isInfoOnly ? ' is-info-only' : '') + ' aff-accent-' + esc(offer.accent) + '" aria-label="Featured partner recommendation (affiliate link)">' +
          (isInfoOnly ? '' : renderMediaHtml(offer, false, false)) +
          '<div class="aff-card-body">' +
            '<div class="aff-meta-row">' +
              '<span class="aff-partner-pill">' + esc(offer.partnerName) + '</span>' +
              '<span class="aff-badge-pill">' + esc(offer.badge) + '</span>' +
              '<span class="aff-disclosure-tag">Affiliate Link</span>' +
            '</div>' +
            '<h3 class="aff-card-title">' + esc(offer.title) + '</h3>' +
            '<p class="aff-card-desc">' + esc(offer.desc) + '</p>' +
            (isInfoOnly && offer.specs ? '<div class="aff-info-chip-row">' + offer.specs.map(function(s) { return '<span class="aff-info-chip">' + esc(s) + '</span>'; }).join('') + '</div>' : '') +
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
        '<aside class="aff-card aff-card--hero' + (isInfoOnly ? ' is-info-only' : '') + ' aff-accent-' + esc(offer.accent) + '" aria-label="Featured console hardware recommendation (affiliate link)">' +
          '<div class="aff-hero-head">' +
            '<span class="aff-partner-pill">' + esc(offer.partnerName) + '</span>' +
            '<span class="aff-disclosure-tag">Affiliate Pick</span>' +
          '</div>' +
          renderMediaHtml(offer, false, true) +
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
        '<article class="aff-card aff-card--tile' + (isInfoOnly ? ' is-info-only' : '') + ' aff-accent-' + esc(offer.accent) + '">' +
          renderMediaHtml(offer, false, false) +
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

    // Standard native card
    return (
      '<article class="aff-card aff-card--standard' + (isInfoOnly ? ' is-info-only' : '') + ' aff-accent-' + esc(offer.accent) + '">' +
        renderMediaHtml(offer, false, false) +
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

    // 2. Auto-upgrade any legacy plain-text .syndicate-aff-bar elements cleanly (max 1 per page)
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
