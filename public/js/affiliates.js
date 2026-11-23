// ==========================================================================
// GTA6HEISTGUIDE.COM — NATIVE AMAZON AFFILIATE & PRODUCT CARD SYSTEM (v7.0)
// Official Amazon Associates Tracking ID: gta6heistguid-20
// Approved Partners: Amazon Associates, Direct G2A Goldmine, ExitLag, Gumroad
//
// Compliant with Amazon Associates Operating Agreement & FTC 16 CFR Part 255:
// - "As an Amazon Associate I earn from qualifying purchases."
// - Clear "Sponsored · Paid link" disclosure tags on every recommendation
// - Controlled page-refresh rotation without pop-ups, redirects, or layout shifts
// - Strict single-instance product & image de-duplication per page view
// - Zero interference with LocalStorage, IndexedDB, or user gameplay progress
// ==========================================================================

window.GTA6_AFFILIATES = Object.freeze({
  amazon: {
    tag: "gta6heistguid-20",
    links: {
      dualsenseEdge: "https://www.amazon.com/dp/B0BS5V7T65?tag=gta6heistguid-20",
      dualsense: "https://www.amazon.com/dp/B08FC6C75B?tag=gta6heistguid-20",
      dualsenseDock: "https://www.amazon.com/dp/B08FC6Y4VG?tag=gta6heistguid-20",
      kontrolfreek: "https://www.amazon.com/dp/B08DP7Z725?tag=gta6heistguid-20",
      samsung990pro: "https://www.amazon.com/dp/B0BHJJ9Y77?tag=gta6heistguid-20",
      wdBlackSn850p: "https://www.amazon.com/dp/B0C47ZX1WB?tag=gta6heistguid-20",
      crucialT500: "https://www.amazon.com/dp/B0CK39YR41?tag=gta6heistguid-20",
      nova7p: "https://www.amazon.com/dp/B0B1647BD7?tag=gta6heistguid-20",
      xboxController: "https://www.amazon.com/dp/B08DF248HZ?tag=gta6heistguid-20",
      poweraXboxDock: "https://www.amazon.com/dp/B08J845875?tag=gta6heistguid-20",
      seagateXboxCard: "https://www.amazon.com/dp/B08K3S6WJM?tag=gta6heistguid-20",
      nova7x: "https://www.amazon.com/dp/B0B161B1YQ?tag=gta6heistguid-20",
      elgatoHd60x: "https://www.amazon.com/dp/B09V1KJ3J4?tag=gta6heistguid-20",
      elgato4kx: "https://www.amazon.com/dp/B0CPKDFF2D?tag=gta6heistguid-20",
      elgatoWave3: "https://www.amazon.com/dp/B0888746SZ?tag=gta6heistguid-20",
      headsetStand: "https://www.amazon.com/dp/B01GJQ7N94?tag=gta6heistguid-20",
      cableKit: "https://www.amazon.com/dp/B071FXZBMV?tag=gta6heistguid-20"
    }
  },
  g2a: {
    url: "https://www.g2a.com/n/reflink-4094b9aab5"
  },
  exitlag: {
    url: "https://www.exitlag.com/refer/10386953",
    label: "ExitLag Network Routing",
    cta: "Visit ExitLag"
  },
  gumroad: {
    cutflowPro: "https://apexlocallabs.gumroad.com/l/cutflow-pro",
    apexProBundle: "https://apexlocallabs.gumroad.com/l/apex-pro-bundle"
  }
});

// Launch Banner Helpers
window.getGTA6LaunchDay = function() {
  return Math.max(1, Math.floor((Date.now() - Date.parse('2026-11-19T00:00:00Z')) / 86400000) + 1);
};

window.getGTA6LaunchBannerText = function() {
  return "Story Mode: LIVE \u00b7 GTA 6 Online: No official release date announced";
};

(function(global) {
  'use strict';

  var aff = global.GTA6_AFFILIATES;
  var AMZ_STATEMENT = 'As an Amazon Associate I earn from qualifying purchases.';

  // 1. MASTER PRODUCT CATALOG WITH VERIFIED ASINs, SPECS, ADVANTAGES & DRAWBACKS
  var CATALOG = Object.freeze({
    // --- PS5 EQUIPMENT ---
    dualsenseEdge: {
      id: 'dualsenseEdge',
      partner: 'amazon',
      partnerName: 'Amazon',
      category: 'PS5 Equipment',
      badge: 'Pro Controller',
      accent: 'cyan',
      title: 'PlayStation DualSense Edge Wireless Controller',
      asin: 'B0BS5V7T65',
      compat: 'PlayStation 5 \u00b7 Windows PC',
      specs: ['Remappable Back Paddles', 'Replaceable Stick Modules'],
      desc: 'Official Sony pro controller with remappable back paddles, adjustable trigger stops, and modular analog stick assemblies.',
      advantage: 'Rear levers allow weapon wheel swaps and sprint controls without lifting thumbs off aim sticks.',
      drawback: 'Internal battery lasts ~5 to 6 hours between charges; shorter than standard DualSense.',
      cta: 'View on Amazon \u2192',
      url: aff.amazon.links.dualsenseEdge,
      amazonKey: 'dualsenseEdge',
      mediaType: 'info',
      alt: 'Sony PlayStation DualSense Edge Wireless Controller for PS5',
      disclosure: AMZ_STATEMENT
    },
    dualsense: {
      id: 'dualsense',
      partner: 'amazon',
      partnerName: 'Amazon',
      category: 'PS5 Equipment',
      badge: 'Official Gamepad',
      accent: 'cyan',
      title: 'PlayStation 5 DualSense Wireless Controller',
      asin: 'B08FC6C75B',
      compat: 'PS5 \u00b7 PC \u00b7 Mac \u00b7 iOS \u00b7 Android',
      specs: ['Haptic Feedback', 'Dynamic Adaptive Triggers'],
      desc: 'Standard PS5 wireless controller featuring dynamic tactile haptic feedback, adaptive tension triggers, and an integrated chat mic.',
      advantage: 'Full tactile immersion for vehicle handling and weapon recoil across Leonida streets.',
      drawback: 'Factory analog stick modules are permanently soldered; cannot be swapped individually if drift develops.',
      cta: 'View on Amazon \u2192',
      url: aff.amazon.links.dualsense,
      amazonKey: 'dualsense',
      mediaType: 'info',
      alt: 'PlayStation 5 DualSense Wireless Controller',
      disclosure: AMZ_STATEMENT
    },
    dualsenseDock: {
      id: 'dualsenseDock',
      partner: 'amazon',
      partnerName: 'Amazon',
      category: 'PS5 Equipment',
      badge: 'Charging Station',
      accent: 'cyan',
      title: 'PlayStation 5 DualSense Charging Station',
      asin: 'B08FC6Y4VG',
      compat: 'PS5 DualSense & DualSense Edge',
      specs: ['Charges 2 Controllers', 'Click-In Cradle Design'],
      desc: 'Official click-in dual charging dock that powers two controllers simultaneously at console USB speed.',
      advantage: 'Frees up console USB ports while keeping a charged backup gamepad ready for long sessions.',
      drawback: 'Powered by an external AC wall adapter rather than standard USB-C passthrough.',
      cta: 'View on Amazon \u2192',
      url: aff.amazon.links.dualsenseDock,
      amazonKey: 'dualsenseDock',
      mediaType: 'info',
      alt: 'Official PlayStation 5 DualSense Charging Station Dock',
      disclosure: AMZ_STATEMENT
    },
    kontrolfreek: {
      id: 'kontrolfreek',
      partner: 'amazon',
      partnerName: 'Amazon',
      category: 'PS5 Equipment',
      badge: 'Aim Grips',
      accent: 'pink',
      title: 'KontrolFreek Galaxy Performance Thumbsticks',
      asin: 'B08DP7Z725',
      compat: 'PlayStation 5 & PS4 Controllers',
      specs: ['10mm High-Rise Right Stick', 'Mid-Rise Left Stick'],
      desc: 'Laser-etched slip-on thumbstick extenders that increase analog stick arc distance for micro-aim adjustments.',
      advantage: '10.0mm high-rise right stick increases rotational leverage for finer crosshair control in gunfights.',
      drawback: 'Clamping prongs can leave small indentation marks on soft OEM rubber sticks if removed frequently.',
      cta: 'View on Amazon \u2192',
      url: aff.amazon.links.kontrolfreek,
      amazonKey: 'kontrolfreek',
      mediaType: 'info',
      alt: 'KontrolFreek Galaxy Performance Thumbsticks for PlayStation 5',
      disclosure: AMZ_STATEMENT
    },
    nova7p: {
      id: 'nova7p',
      partner: 'amazon',
      partnerName: 'Amazon',
      category: 'PS5 Equipment',
      badge: 'Wireless Headset',
      accent: 'amber',
      title: 'SteelSeries Arctis Nova 7P Wireless Headset',
      asin: 'B0B1647BD7',
      compat: 'PlayStation 5 \u00b7 PS4 \u00b7 PC \u00b7 Switch \u00b7 Mobile',
      specs: ['Simultaneous 2.4GHz + BT', '38-Hour Fast-Charge Battery'],
      desc: 'Multi-platform wireless headset featuring simultaneous 2.4GHz gaming audio and Bluetooth, tuned for 360\u00b0 spatial immersion.',
      advantage: 'Simultaneous Bluetooth audio lets you hear interactive phone guides while staying tuned to game audio.',
      drawback: 'Uses passive noise-isolating earcups rather than active noise cancellation (ANC); EQ requires PC app.',
      cta: 'View on Amazon \u2192',
      url: aff.amazon.links.nova7p,
      amazonKey: 'nova7p',
      mediaType: 'info',
      alt: 'SteelSeries Arctis Nova 7P Wireless Gaming Headset for PlayStation 5',
      disclosure: AMZ_STATEMENT
    },

    // --- XBOX EQUIPMENT ---
    xboxController: {
      id: 'xboxController',
      partner: 'amazon',
      partnerName: 'Amazon',
      category: 'Xbox Equipment',
      badge: 'Xbox Gamepad',
      accent: 'green',
      title: 'Microsoft Xbox Wireless Controller (Carbon Black)',
      asin: 'B08DF248HZ',
      compat: 'Xbox Series X|S \u00b7 Xbox One \u00b7 Windows PC \u00b7 Mobile',
      specs: ['Hybrid 8-Way D-Pad', 'Textured Triggers & Bumpers'],
      desc: 'Microsoft core gamepad featuring sculpted tactile grips, a hybrid 8-way directional pad, and a dedicated Share button.',
      advantage: 'Robust ergonomic shape with native low-latency wireless on Xbox Series X|S and Windows PCs.',
      drawback: 'Powered by disposable AA batteries out of the box; rechargeable pack sold separately.',
      cta: 'View on Amazon \u2192',
      url: aff.amazon.links.xboxController,
      amazonKey: 'xboxController',
      mediaType: 'info',
      alt: 'Microsoft Xbox Wireless Controller in Carbon Black',
      disclosure: AMZ_STATEMENT
    },
    poweraXboxDock: {
      id: 'poweraXboxDock',
      partner: 'amazon',
      partnerName: 'Amazon',
      category: 'Xbox Equipment',
      badge: 'Charging Station',
      accent: 'green',
      title: 'PowerA Dual Charging Station for Xbox Series X|S',
      asin: 'B08J845875',
      compat: 'Xbox Series X|S & Xbox One Controllers',
      specs: ['2x 1100mAh Battery Packs', '4x Charge-Thru Doors'],
      desc: 'Officially licensed dual charging dock with two 1100mAh rechargeable battery packs and click-down bays.',
      advantage: 'Eliminates disposable AA battery costs with snap-down docking and visible LED charging indicators.',
      drawback: 'Requires using the included custom battery door covers and 1100mAh packs.',
      cta: 'View on Amazon \u2192',
      url: aff.amazon.links.poweraXboxDock,
      amazonKey: 'poweraXboxDock',
      mediaType: 'info',
      alt: 'PowerA Dual Charging Station for Xbox Series X|S Controllers',
      disclosure: AMZ_STATEMENT
    },
    seagateXboxCard: {
      id: 'seagateXboxCard',
      partner: 'amazon',
      partnerName: 'Amazon',
      category: 'Xbox Equipment',
      badge: 'Xbox Expansion',
      accent: 'green',
      title: 'Seagate Storage Expansion Card 1TB for Xbox Series X|S',
      asin: 'B08K3S6WJM',
      compat: 'Xbox Series X & Xbox Series S',
      specs: ['Xbox Velocity Architecture', 'Instant Plug-and-Play Slot'],
      desc: 'Custom plug-in NVMe expansion that matches the exact performance of the internal Xbox Series X|S SSD.',
      advantage: 'Plugs directly into the rear expansion port; plays Series X|S optimized games directly with instant Quick Resume.',
      drawback: 'Proprietary form factor commands a higher price-per-gigabyte than open standard PC/PS5 M.2 drives.',
      cta: 'View on Amazon \u2192',
      url: aff.amazon.links.seagateXboxCard,
      amazonKey: 'seagateXboxCard',
      mediaType: 'info',
      alt: 'Seagate Storage Expansion Card 1TB for Xbox Series X|S',
      disclosure: AMZ_STATEMENT
    },
    nova7x: {
      id: 'nova7x',
      partner: 'amazon',
      partnerName: 'Amazon',
      category: 'Xbox Equipment',
      badge: 'Multi-Platform Headset',
      accent: 'green',
      title: 'SteelSeries Arctis Nova 7X Wireless Headset',
      asin: 'B0B161B1YQ',
      compat: 'Xbox Series X|S \u00b7 Xbox One \u00b7 PS5 \u00b7 PC \u00b7 Mobile',
      specs: ['Cross-Platform USB-C Dongle', 'On-Ear ChatMix Hardware Dial'],
      desc: 'Cross-platform wireless headset with dedicated Xbox security chip, 38-hour battery, and simultaneous Bluetooth.',
      advantage: 'Universal USB-C wireless dongle switches effortlessly between Xbox Series X|S, PS5, and PC.',
      drawback: 'On-ear physical ChatMix dial functions only on Xbox and PC; PS5 party balance requires console OS menus.',
      cta: 'View on Amazon \u2192',
      url: aff.amazon.links.nova7x,
      amazonKey: 'nova7x',
      mediaType: 'info',
      alt: 'SteelSeries Arctis Nova 7X Wireless Gaming Headset for Xbox',
      disclosure: AMZ_STATEMENT
    },

    // --- GAMING STORAGE ---
    samsung990pro: {
      id: 'samsung990pro',
      partner: 'amazon',
      partnerName: 'Amazon',
      category: 'Gaming Storage',
      badge: 'Gen4 NVMe SSD',
      accent: 'green',
      title: 'Samsung 990 PRO with Heatsink 2TB M.2 SSD',
      asin: 'B0BHJJ9Y77',
      compat: 'PlayStation 5 Internal M.2 Slot \u00b7 PC',
      specs: ['PCIe 4.0 x4 NVMe', 'Factory Low-Profile Heatsink'],
      desc: 'Fast internal PCIe 4.0 NVMe SSD with a pre-installed heatsink for PS5 storage expansion.',
      advantage: 'Meets Sony PS5 M.2 speed requirements with generous room for large open-world libraries.',
      drawback: 'Requires opening the PS5 cover and expansion bay with a Phillips screwdriver.',
      cta: 'View on Amazon \u2192',
      url: aff.amazon.links.samsung990pro,
      amazonKey: 'samsung990pro',
      mediaType: 'info',
      alt: 'Samsung 990 PRO 2TB PCIe 4.0 M.2 NVMe SSD with Heatsink',
      disclosure: AMZ_STATEMENT
    },
    wdBlackSn850p: {
      id: 'wdBlackSn850p',
      partner: 'amazon',
      partnerName: 'Amazon',
      category: 'Gaming Storage',
      badge: 'PS5 Licensed',
      accent: 'cyan',
      title: 'WD_BLACK 2TB SN850P NVMe SSD for PS5',
      asin: 'B0C47ZX1WB',
      compat: 'PlayStation 5 (Officially Licensed) \u00b7 PC',
      specs: ['7,300 MB/s Read Speed', 'Custom Pre-Fitted Heatsink'],
      desc: 'Officially licensed PS5 internal M.2 SSD engineered and tested specifically for the console expansion bay.',
      advantage: 'Certified 100% PS5 compatibility out of the box with optimized thermal clearance.',
      drawback: 'Official PlayStation branding adds a minor price premium over identical non-branded hardware.',
      cta: 'View on Amazon \u2192',
      url: aff.amazon.links.wdBlackSn850p,
      amazonKey: 'wdBlackSn850p',
      mediaType: 'info',
      alt: 'WD_BLACK 2TB SN850P NVMe SSD with Heatsink for PS5',
      disclosure: AMZ_STATEMENT
    },
    crucialT500: {
      id: 'crucialT500',
      partner: 'amazon',
      partnerName: 'Amazon',
      category: 'Gaming Storage',
      badge: 'Gen4 Storage',
      accent: 'green',
      title: 'Crucial T500 2TB Gen4 NVMe SSD with Heatsink',
      asin: 'B0CK39YR41',
      compat: 'PlayStation 5 Internal M.2 Slot \u00b7 PC',
      specs: ['7,400 MB/s Read Speed', 'Micron 232-Layer TLC + DRAM'],
      desc: 'High-speed PCIe 4.0 internal NVMe drive with onboard LPDDR4 DRAM and a factory low-profile heatsink.',
      advantage: 'Up to 7,400 MB/s reads and efficient Micron TLC flash ensure rapid fast-travel and asset streaming.',
      drawback: 'Sustained sequential writes run warm in tight spaces; requires adequate console airflow.',
      cta: 'View on Amazon \u2192',
      url: aff.amazon.links.crucialT500,
      amazonKey: 'crucialT500',
      mediaType: 'info',
      alt: 'Crucial T500 2TB Gen4 NVMe M.2 SSD with Heatsink',
      disclosure: AMZ_STATEMENT
    },

    // --- GAMING CREATOR EQUIPMENT ---
    elgatoHd60x: {
      id: 'elgatoHd60x',
      partner: 'amazon',
      partnerName: 'Amazon',
      category: 'Creator Equipment',
      badge: 'Capture Card',
      accent: 'purple',
      title: 'Elgato HD60 X External Capture Card',
      asin: 'B09V1KJ3J4',
      compat: 'PS5 \u00b7 Xbox Series X|S \u00b7 PC \u00b7 Mac \u00b7 OBS Studio',
      specs: ['4K60 HDR / 1440p120 VRR Passthrough', 'Plug-and-Play USB 3.0'],
      desc: 'External USB capture device enabling clean console recording and Twitch streaming with zero-lag VRR passthrough.',
      advantage: 'VRR passthrough eliminates screen tearing on your TV while streaming smooth gameplay to OBS.',
      drawback: 'Internal capture resolution is capped at 1080p60 HDR or 4K30; does not capture 4K60 video internally.',
      cta: 'View on Amazon \u2192',
      url: aff.amazon.links.elgatoHd60x,
      amazonKey: 'elgatoHd60x',
      mediaType: 'info',
      alt: 'Elgato HD60 X External Console Capture Card',
      disclosure: AMZ_STATEMENT
    },
    elgato4kx: {
      id: 'elgato4kx',
      partner: 'amazon',
      partnerName: 'Amazon',
      category: 'Creator Equipment',
      badge: 'HDMI 2.1 Capture',
      accent: 'purple',
      title: 'Elgato 4K X External Capture Card (HDMI 2.1)',
      asin: 'B0CPKDFF2D',
      compat: 'PS5 \u00b7 PS5 Pro \u00b7 Xbox Series X \u00b7 PC \u00b7 Mac \u00b7 iPad',
      specs: ['Up to 4K144 Passthrough & Capture', 'USB 3.2 Gen 2 (10Gbps)'],
      desc: 'Next-generation HDMI 2.1 external capture card supporting up to 4K144 VRR passthrough and uncompressed capture.',
      advantage: 'True HDMI 2.1 pipeline maintains 4K 120Hz/144Hz high-refresh gaming on your display during capture.',
      drawback: 'Requires a genuine 10Gbps USB 3.2 Gen 2 port on the host PC/Mac for maximum resolution recording.',
      cta: 'View on Amazon \u2192',
      url: aff.amazon.links.elgato4kx,
      amazonKey: 'elgato4kx',
      mediaType: 'info',
      alt: 'Elgato 4K X External HDMI 2.1 Capture Card',
      disclosure: AMZ_STATEMENT
    },
    elgatoWave3: {
      id: 'elgatoWave3',
      partner: 'amazon',
      partnerName: 'Amazon',
      category: 'Creator Equipment',
      badge: 'USB Microphone',
      accent: 'pink',
      title: 'Elgato Wave:3 USB Condenser Microphone',
      asin: 'B0888746SZ',
      compat: 'PC \u00b7 Mac \u00b7 PS5 \u00b7 PS4',
      specs: ['Clipguard Anti-Distortion', 'Wave Link Digital Mixer'],
      desc: 'Broadcast-grade USB cardioid microphone featuring proprietary Clipguard technology and multichannel digital mixing.',
      advantage: 'Clipguard technology automatically levels audio spikes when shouting during intense heist escapes.',
      drawback: 'Sensitive condenser capsule picks up room reverberation without an acoustic room or boom arm.',
      cta: 'View on Amazon \u2192',
      url: aff.amazon.links.elgatoWave3,
      amazonKey: 'elgatoWave3',
      mediaType: 'info',
      alt: 'Elgato Wave:3 USB Condenser Gaming Microphone',
      disclosure: AMZ_STATEMENT
    },

    // --- GENERAL GAMING ACCESSORIES ---
    headsetStand: {
      id: 'headsetStand',
      partner: 'amazon',
      partnerName: 'Amazon',
      category: 'Gaming Accessories',
      badge: 'Headset Stand',
      accent: 'cyan',
      title: 'New Bee Aluminum Desktop Headphone Stand',
      asin: 'B01GJQ7N94',
      compat: 'Universal (All Over-Ear Headsets)',
      specs: ['Anodized Aluminum Pole', 'Flexible TPU Rubber Rest'],
      desc: 'Minimalist desktop stand with an anodized aluminum center pole, weighted base, and flexible TPU rubber rest.',
      advantage: 'Soft TPU headrest cradles the headband without creasing cushions, keeping gear safe from spills.',
      drawback: 'Passive resting stand with no integrated USB ports, pass-through charging, or RGB lighting.',
      cta: 'View on Amazon \u2192',
      url: aff.amazon.links.headsetStand,
      amazonKey: 'headsetStand',
      mediaType: 'info',
      alt: 'New Bee Aluminum Desktop Gaming Headphone Stand',
      disclosure: AMZ_STATEMENT
    },
    cableKit: {
      id: 'cableKit',
      partner: 'amazon',
      partnerName: 'Amazon',
      category: 'Gaming Accessories',
      badge: 'Cable Routing',
      accent: 'green',
      title: 'OHill 16-Pack Desktop Adhesive Cable Clips',
      asin: 'B071FXZBMV',
      compat: 'All Controller Cables, HDMI Lines, USB-C & Headset Wires',
      specs: ['16 Multi-Slot Silicone Grips', 'Damage-Free 3M Adhesive'],
      desc: '16-piece assorted multi-slot silicone cable organizers with self-adhesive backing for desk cord routing.',
      advantage: 'Prevents controller charging cords and headset cables from slipping behind desks or tangling in chair wheels.',
      drawback: 'Self-adhesive pads require a flat, clean surface and can peel drywall paint if removed carelessly.',
      cta: 'View on Amazon \u2192',
      url: aff.amazon.links.cableKit,
      amazonKey: 'cableKit',
      mediaType: 'info',
      alt: 'OHill 16-Pack Desktop Adhesive Cable Management Clips',
      disclosure: AMZ_STATEMENT
    },

    // --- APPROVED NON-AMAZON PARTNERS ---
    g2a: {
      id: 'g2a',
      partner: 'g2a',
      partnerName: 'G2A.COM',
      category: 'Game Deals',
      badge: 'Digital Keys',
      accent: 'orange',
      title: 'G2A Verified Game Keys & Gift Cards',
      compat: 'PlayStation Network \u00b7 Xbox \u00b7 PC / Steam',
      specs: ['Buyer Protection Program', 'Instant Digital Delivery'],
      desc: 'Compare digital PlayStation Store credit, Xbox wallet top-ups, and PC game key listings across marketplace sellers.',
      advantage: 'Compare competitive regional digital store gift cards and game keys in one verified marketplace.',
      drawback: 'Marketplace pricing fluctuates based on seller inventory and regional currency conversions.',
      cta: 'Browse G2A \u2192',
      url: aff.g2a.url,
      mediaType: 'brand-g2a',
      alt: 'G2A.COM Digital Marketplace',
      disclosure: 'Affiliate link \u00b7 We earn a commission on qualifying G2A purchases at no extra cost to you.'
    },
    exitlag: {
      id: 'exitlag',
      partner: 'exitlag',
      partnerName: 'ExitLag',
      category: 'Network Routing',
      badge: 'Multi-Path Routing',
      accent: 'crimson',
      title: 'ExitLag Multi-Path Gaming Connection Routing',
      compat: 'Windows PC (Supported Multiplayer Titles)',
      specs: ['Multipath Connection Tuning', 'Worldwide Server Network'],
      desc: 'Connection routing utility for PC games designed to balance and manage packet paths across supported titles.',
      advantage: 'Multi-path route optimization helps stabilize packet delivery and reduce jitter on crowded home ISPs.',
      drawback: 'Subscription-based PC utility; does not run natively on PlayStation 5 or Xbox Series consoles.',
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
      compat: 'Windows PC (Premiere Pro \u00b7 DaVinci Resolve)',
      specs: ['100% Offline Processing', 'Automatic Silence Trimming'],
      desc: 'Local Windows utility that trims dead air from raw gameplay VODs and exports clean NLE timelines locally.',
      advantage: 'Processes multi-hour gameplay footage 100% locally with zero cloud upload delays or subscription fees.',
      drawback: 'Windows desktop utility only; requires local GPU or CPU power for video decoding and analysis.',
      cta: 'View CutFlow Pro \u2192',
      url: aff.gumroad.cutflowPro,
      mediaType: 'ui-cutflow',
      image: '/assets/cutflow-ui.png',
      alt: 'CutFlow Pro Desktop Auto-Silence Remover Interface',
      disclosure: 'Partner link \u00b7 Qualifying Gumroad purchases support GTA6HeistGuide.com at no extra cost to you.'
    }
  });

  // 2. CURATED CONTEXTUAL PRODUCT POOLS
  var CONTEXT_POOLS = {
    'homepage-setup': [
      'dualsenseEdge', 'samsung990pro', 'nova7p', 'wdBlackSn850p',
      'xboxController', 'seagateXboxCard', 'elgatoHd60x', 'dualsenseDock'
    ],
    'controls': [
      'dualsense', 'dualsenseEdge', 'dualsenseDock', 'kontrolfreek',
      'xboxController', 'poweraXboxDock'
    ],
    'troubleshooting': [
      'samsung990pro', 'wdBlackSn850p', 'crucialT500',
      'seagateXboxCard', 'cableKit'
    ],
    'missions': [
      'nova7p', 'nova7x', 'headsetStand', 'elgatoWave3'
    ],
    'collectibles': [
      'kontrolfreek', 'dualsenseDock', 'poweraXboxDock', 'dualsense'
    ],
    'vehicles': [
      'dualsenseEdge', 'kontrolfreek', 'elgatoHd60x', 'elgato4kx'
    ],
    'interactive-map': [
      'samsung990pro', 'headsetStand', 'kontrolfreek', 'dualsenseDock'
    ],
    'creator': [
      'elgatoHd60x', 'elgato4kx', 'elgatoWave3', 'cutflow'
    ],
    'money': [
      'g2a', 'samsung990pro', 'dualsenseEdge', 'exitlag'
    ],
    'default': [
      'samsung990pro', 'dualsenseEdge', 'nova7p', 'wdBlackSn850p', 'g2a', 'exitlag'
    ]
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

  // Pure in-memory rotation seed generated fresh per full page load.
  // Never touches LocalStorage or IndexedDB (preserves all user planner / map / save data).
  var RUNTIME_PAGE_SEED = Math.floor(Math.random() * 1000000);

  function getSessionSeed() {
    return RUNTIME_PAGE_SEED;
  }

  // Registry tracking products and image paths already displayed on current page view
  var pageUsedIds = {};
  var pageUsedImages = {};

  function resetPageRegistry() {
    pageUsedIds = {};
    pageUsedImages = {};
  }

  function markUsed(offer) {
    if (!offer) return;
    pageUsedIds[offer.id] = true;
    if (offer.image) {
      pageUsedImages[offer.image] = true;
    }
  }

  function detectDefaultContext() {
    var p = (global.location && global.location.pathname || '/').toLowerCase();
    if (p.indexOf('control') !== -1) return 'controls';
    if (p.indexOf('troubleshoot') !== -1) return 'troubleshooting';
    if (p.indexOf('mission') !== -1) return 'missions';
    if (p.indexOf('collect') !== -1) return 'collectibles';
    if (p.indexOf('vehicle') !== -1) return 'vehicles';
    if (p.indexOf('map') !== -1) return 'interactive-map';
    if (p.indexOf('heist') !== -1) return 'missions';
    if (p.indexOf('money') !== -1 || p.indexOf('property') !== -1) return 'money';
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

    for (var i = 0; i < rotated.length && picked.length < count; i++) {
      var offer = CATALOG[rotated[i]];
      if (!offer) continue;
      // Guarantee zero duplicate product IDs on same page view
      if (pageUsedIds[offer.id]) continue;
      // Guarantee zero duplicate product images on same page view
      if (offer.image && pageUsedImages[offer.image]) continue;

      picked.push(offer);
      markUsed(offer);
    }

    // Fallback if pool exhausted
    if (picked.length < count) {
      var fallbackOrder = ['samsung990pro', 'dualsenseEdge', 'nova7p', 'wdBlackSn850p', 'xboxController', 'g2a', 'exitlag'];
      for (var j = 0; j < fallbackOrder.length && picked.length < count; j++) {
        var fb = CATALOG[fallbackOrder[j]];
        if (!fb || pageUsedIds[fb.id]) continue;
        if (fb.image && pageUsedImages[fb.image]) continue;
        picked.push(fb);
        markUsed(fb);
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
    if (offer.mediaType === 'brand-exitlag') {
      return (
        '<div class="aff-media aff-brand-panel aff-brand-panel--exitlag' + (compact ? ' is-compact' : '') + '">' +
          '<div class="aff-brand-wordmark-wrap">' +
            '<span class="aff-brand-mark aff-brand-mark--exitlag" aria-hidden="true">EXITLAG</span>' +
            '<span class="aff-brand-sub">MULTI-PATH ROUTING</span>' +
          '</div>' +
          (!compact ? '<div class="aff-brand-chips"><span>PC ROUTING</span><span>OPTIMIZER</span></div>' : '') +
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

    // Clean, premium dark info-spec panel (zero scraped images, zero fake renders)
    return (
      '<div class="aff-info-header aff-info-accent-' + esc(offer.accent || 'cyan') + '">' +
        '<div class="aff-info-header-top">' +
          '<span class="aff-info-cat">' + esc(offer.category || 'Console Hardware') + '</span>' +
          '<span class="aff-info-retailer">' + esc(offer.partnerName || 'Amazon') + '</span>' +
        '</div>' +
        renderSpecListHtml(offer.specs) +
      '</div>'
    );
  }

  // 3. REUSABLE PRODUCT CARD RENDERER (TASK 3)
  function renderCardHtml(offer, variant, placement) {
    var amzAttr = offer.amazonKey ? ' data-amazon-link="' + esc(offer.amazonKey) + '"' : '';
    var isAmazon = offer.partner === 'amazon';
    var ctaClass = isAmazon ? 'aff-cta aff-cta--amazon' : ('aff-cta aff-cta--' + esc(offer.accent || 'cyan'));
    var ctaText = isAmazon ? 'View on Amazon \u2192' : esc(offer.cta);

    var linkAttrs = 'href="' + esc(offer.url) + '"' + amzAttr +
      ' target="_blank" rel="sponsored nofollow noopener"' +
      ' data-aff-partner="' + esc(offer.partner) + '"' +
      ' data-aff-placement="' + esc(placement || variant) + '"';

    var compatHtml = offer.compat
      ? '<div class="aff-card-compat"><span class="aff-compat-label">Compatibility:</span> <span class="aff-compat-val">' + esc(offer.compat) + '</span></div>'
      : '';

    var advantageHtml = offer.advantage
      ? '<div class="aff-card-advantage"><span class="aff-adv-badge">\u2713 Advantage:</span> ' + esc(offer.advantage) + '</div>'
      : '';

    var drawbackHtml = offer.drawback
      ? '<div class="aff-card-drawback"><span class="aff-draw-badge">\u26a0 Note:</span> ' + esc(offer.drawback) + '</div>'
      : '';

    var disclosureTag = isAmazon
      ? '<span class="aff-disclosure-tag aff-disclosure-tag--sponsored">Sponsored \u00b7 Paid link</span>'
      : '<span class="aff-disclosure-tag">Partner Link</span>';

    // Variant A: Compact Inline (For database, collectibles, guides)
    if (variant === 'compact-inline') {
      return (
        '<aside class="aff-card aff-card--compact aff-accent-' + esc(offer.accent) + '" aria-label="' + esc(offer.title) + ' (affiliate recommendation)">' +
          renderMediaHtml(offer, true, false) +
          '<div class="aff-compact-body">' +
            '<div class="aff-meta-row">' +
              '<span class="aff-partner-pill">' + esc(offer.partnerName) + '</span>' +
              '<span class="aff-badge-pill">' + esc(offer.badge) + '</span>' +
              disclosureTag +
            '</div>' +
            '<div class="aff-compact-title">' + esc(offer.title) + '</div>' +
            compatHtml +
            advantageHtml +
            drawbackHtml +
          '</div>' +
          '<div class="aff-compact-action">' +
            '<a ' + linkAttrs + ' class="' + ctaClass + ' aff-cta--sm">' + ctaText + '</a>' +
          '</div>' +
        '</aside>'
      );
    }

    // Variant B: Horizontal Featured (For Controls, Troubleshooting, Missions mid-page)
    if (variant === 'horizontal-featured') {
      return (
        '<aside class="aff-card aff-card--horizontal aff-accent-' + esc(offer.accent) + '" aria-label="' + esc(offer.title) + ' (featured gear recommendation)">' +
          renderMediaHtml(offer, false, false) +
          '<div class="aff-card-body">' +
            '<div class="aff-meta-row">' +
              '<span class="aff-partner-pill">' + esc(offer.partnerName) + '</span>' +
              '<span class="aff-badge-pill">' + esc(offer.badge) + '</span>' +
              disclosureTag +
            '</div>' +
            '<h3 class="aff-card-title">' + esc(offer.title) + '</h3>' +
            '<p class="aff-card-desc">' + esc(offer.desc) + '</p>' +
            compatHtml +
            advantageHtml +
            drawbackHtml +
          '</div>' +
          '<div class="aff-horizontal-cta">' +
            '<a ' + linkAttrs + ' class="' + ctaClass + '">' + ctaText + '</a>' +
          '</div>' +
        '</aside>'
      );
    }

    // Variant C: Sidebar Mini (For map drawer or tool utility)
    if (variant === 'sidebar') {
      return (
        '<aside class="aff-card aff-card--sidebar aff-accent-' + esc(offer.accent) + '" aria-label="' + esc(offer.title) + '">' +
          '<div class="aff-sidebar-top">' +
            renderMediaHtml(offer, true, false) +
            '<div class="aff-sidebar-info">' +
              '<div class="aff-meta-row">' +
                '<span class="aff-badge-pill">' + esc(offer.badge) + '</span>' +
                disclosureTag +
              '</div>' +
              '<div class="aff-sidebar-title">' + esc(offer.title) + '</div>' +
              compatHtml +
            '</div>' +
          '</div>' +
          advantageHtml +
          '<div class="aff-sidebar-foot">' +
            '<a ' + linkAttrs + ' class="' + ctaClass + ' aff-cta--sm">' + ctaText + '</a>' +
            '<span class="aff-disclosure-micro">Sponsored \u00b7 Paid link</span>' +
          '</div>' +
        '</aside>'
      );
    }

    // Standard Grid Card (Homepage "Gaming Setup Picks" & general galleries)
    return (
      '<article class="aff-card aff-card--standard aff-accent-' + esc(offer.accent) + '" aria-label="' + esc(offer.title) + '">' +
        renderMediaHtml(offer, false, false) +
        '<div class="aff-card-body">' +
          '<div class="aff-meta-row">' +
            '<span class="aff-partner-pill">' + esc(offer.partnerName) + '</span>' +
            '<span class="aff-badge-pill">' + esc(offer.badge) + '</span>' +
            disclosureTag +
          '</div>' +
          '<h3 class="aff-card-title">' + esc(offer.title) + '</h3>' +
          '<p class="aff-card-desc">' + esc(offer.desc) + '</p>' +
          compatHtml +
          advantageHtml +
          drawbackHtml +
        '</div>' +
        '<div class="aff-card-foot">' +
          '<a ' + linkAttrs + ' class="' + ctaClass + '">' + ctaText + '</a>' +
        '</div>' +
      '</article>'
    );
  }

  // 4. SLOT HTML BUILDER
  function renderSlotHtml(config) {
    var context = config.context || detectDefaultContext();
    var variant = config.variant || 'horizontal-featured';
    var count = parseInt(config.count, 10) || (variant === 'setup-picks-3' ? 3 : (variant === 'card-grid-2' ? 2 : 1));
    var slotId = config.slotId || (context + '-' + variant);
    var heading = config.heading || '';
    var subheading = config.subheading || '';
    var eyebrow = config.eyebrow || '';

    // Homepage Setup Picks 3-card dedicated section
    if (variant === 'setup-picks-3') {
      var picks = selectOffers('homepage-setup', 3, slotId, config);
      if (!picks.length) return '';
      var cardsHtml = picks.map(function(o, idx) {
        return renderCardHtml(o, 'standard', slotId + '-' + (idx + 1));
      }).join('');
      if (!heading && !eyebrow) {
        return '<div class="aff-grid-3">' + cardsHtml + '</div>';
      }
      var headHtml = '<div class="aff-module-head">' +
          '<div>' +
            (eyebrow ? '<span class="aff-module-eyebrow">' + esc(eyebrow) + '</span>' : '') +
            '<h2 class="aff-module-title">' + esc(heading || 'Gaming Setup Picks') + '</h2>' +
            (subheading ? '<p class="aff-module-sub">' + esc(subheading) + '</p>' : '') +
          '</div>' +
          '<span class="aff-disclosure-tag aff-disclosure-tag--sponsored">Sponsored Recommendations</span>' +
        '</div>';
      return (
        '<section class="aff-card-module aff-setup-picks" aria-label="' + esc(heading || 'Gaming Setup Picks') + '">' +
          headHtml +
          '<div class="aff-grid-3">' + cardsHtml + '</div>' +
        '</section>'
      );
    }

    if (variant === 'card-grid-2') {
      var offers2 = selectOffers(context, 2, slotId, config);
      if (!offers2.length) return '';
      var headHtml2 = heading
        ? '<div class="aff-module-head">' +
            '<div>' +
              (eyebrow ? '<span class="aff-module-eyebrow">' + esc(eyebrow) + '</span>' : '') +
              '<h2 class="aff-module-title">' + esc(heading) + '</h2>' +
              (subheading ? '<p class="aff-module-sub">' + esc(subheading) + '</p>' : '') +
            '</div>' +
            '<span class="aff-disclosure-tag aff-disclosure-tag--sponsored">Sponsored Links</span>' +
          '</div>'
        : '';
      return (
        '<section class="aff-card-module" aria-label="' + esc(heading || 'Recommended gear') + '">' +
          headHtml2 +
          '<div class="aff-grid-2">' +
            offers2.map(function(o, idx) {
              return renderCardHtml(o, 'standard', slotId + '-' + (idx + 1));
            }).join('') +
          '</div>' +
        '</section>'
      );
    }

    var singleOffer = selectOffers(context, 1, slotId, config);
    if (!singleOffer.length) return '';
    return renderCardHtml(singleOffer[0], variant, slotId);
  }

  // 5. DOM MOUNTING & HYDRATION
  function mountAllSlots() {
    resetPageRegistry();

    // Never advertise unrelated hardware products on the Animals & Wildlife database page
    var pathLow = (global.location && global.location.pathname || '').toLowerCase();
    if (pathLow.indexOf('animals') !== -1) {
      return;
    }

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
        subheading: el.getAttribute('data-aff-subheading') || ''
      };
      var html = renderSlotHtml(cfg);
      if (html) el.innerHTML = html;
    });

    // Auto-upgrade any legacy syndicate affiliate bars cleanly
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
        variant: 'compact-inline',
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

  // Expose API
  global.GTA6AffiliateCards = {
    catalog: CATALOG,
    contexts: CONTEXT_POOLS,
    getSessionSeed: getSessionSeed,
    resetPageRegistry: resetPageRegistry,
    selectOffers: selectOffers,
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
      else if (aff.amazon.links[key]) a.href = aff.amazon.links[key];
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', hydrateAffiliatesAndBanner);
  } else {
    hydrateAffiliatesAndBanner();
  }
})(window);
