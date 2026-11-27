// ==========================================================================
// GTA6HEISTGUIDE.COM — PHASE 33.1 REAL PRODUCT PHOTOGRAPHY STOREFRONT (v8.1)
// Official Amazon Associates Tracking ID: gta6heistguid-20
// Approved Partners: Amazon Associates, Direct G2A Goldmine, ExitLag, Gumroad
//
// Compliant with Amazon Associates Operating Agreement, IP License & FTC 16 CFR 255:
// - "As an Amazon Associate I earn from qualifying purchases."
// - Clear "Sponsored · Paid link" disclosure badge on every recommendation
// - Featured storefront uses exact-match, commercially licensed product photographs
//   documented in /data/gear-product-images.json (CC0 / CC BY / CC BY-SA)
// - Zero scraped/rehosted Amazon images; catalog items awaiting manufacturer photo
//   permission remain explicitly badged "Category Illustration (Photo Pending)"
// - Every ASIN independently verified In Stock on amazon.com (2026-11-25)
// - Zero unverified prices, ratings, or inflated performance claims
// - Zero interference with LocalStorage, IndexedDB, or map controls
// ==========================================================================

window.GTA6_AFFILIATES = Object.freeze({
  amazon: {
    tag: "gta6heistguid-20",
    links: {
      // 6 Phase 33.1 Real-Photograph Verified In-Stock Products
      dualsenseWhite: "https://www.amazon.com/dp/B0FY6X2XXY?tag=gta6heistguid-20",
      xboxCarbonBlack: "https://www.amazon.com/dp/B0F1HX3WXX?tag=gta6heistguid-20",
      kossPortaPro: "https://www.amazon.com/dp/B00001P4ZH?tag=gta6heistguid-20",
      sonyMdr7506: "https://www.amazon.com/dp/B000AJIF4E?tag=gta6heistguid-20",
      samsung990Pro4tb: "https://www.amazon.com/dp/B0CHGT1KFJ?tag=gta6heistguid-20",
      blueYetiBlackout: "https://www.amazon.com/dp/B00N1YPXW2?tag=gta6heistguid-20",
      // 12 Phase 33 Verified Catalog Products (Photo Pending Manufacturer Permission)
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
      // Safe aliases for any legacy references
      dualsenseDock: "https://www.amazon.com/dp/B09B1XX1PN?tag=gta6heistguid-20",
      kontrolfreek: "https://www.amazon.com/dp/B0GNNTYQGH?tag=gta6heistguid-20",
      crucialT500: "https://www.amazon.com/dp/B0CK2RKPBL?tag=gta6heistguid-20",
      samsung990pro: "https://www.amazon.com/dp/B0BHJDY57J?tag=gta6heistguid-20"
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
  var AMZ_TAG = aff.amazon.tag;
  var AMZ_STATEMENT = 'As an Amazon Associate I earn from qualifying purchases.';
  var AMZ_PRICE_NOTE = 'Check current price and availability on Amazon.';

  // 1. MASTER VERIFIED PRODUCT CATALOG (6 REAL-PHOTO PRODUCTS + 12 PHOTO-PENDING CATALOG PRODUCTS + APPROVED PARTNERS)
  // Every product includes structured maintenance fields and can be disabled centrally via enabled: false.
  var CATALOG = Object.freeze({
    // --- 0. PHASE 33.1 VERIFIED REAL PRODUCT PHOTOGRAPHY (EXACT MATCH, COMMERCIALLY LICENSED) ---
    dualsenseWhite: {
      id: 'dualsenseWhite',
      enabled: true,
      featured: true,
      partner: 'amazon',
      partnerName: 'Amazon',
      brand: 'Sony PlayStation',
      category: 'Controllers',
      badge: 'PS5 Controller',
      accent: 'cyan',
      title: 'PlayStation DualSense Wireless Controller (White)',
      asin: 'B0FY6X2XXY',
      trackingId: AMZ_TAG,
      compat: 'PlayStation 5, PC, Mac & Mobile (Bluetooth / USB-C)',
      desc: 'Official Sony PlayStation 5 wireless controller featuring adaptive triggers, haptic feedback, built-in microphone, and 3.5mm headset jack.',
      whyConsider: 'Reliable spare or replacement PS5 gamepad for long Leonida story runs and couch co-op.',
      cta: 'View on Amazon \u2192',
      url: aff.amazon.links.dualsenseWhite,
      amazonKey: 'dualsenseWhite',
      mediaType: 'none',
      image: null,
      imageCreator: 'Alex Cochrane',
      imageLicense: 'CC BY-SA 4.0',
      imageLicenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
      imageCredit: 'Photo: Alex Cochrane \u00b7 CC BY-SA 4.0',
      imageSource: 'https://commons.wikimedia.org/wiki/File:Playstation_DualSense_Controller.png',
      imageRightsStatus: 'Text-Only (Strict Amazon-Only Photo Policy)',
      alt: 'Photograph of the Sony PlayStation DualSense Wireless Controller in White',
      lastVerified: '2026-11-25',
      placements: ['homepage-setup', 'vehicles', 'weapons', 'controls', 'heist-command', 'default'],
      disclosure: AMZ_STATEMENT
    },
    xboxCarbonBlack: {
      id: 'xboxCarbonBlack',
      enabled: true,
      featured: true,
      partner: 'amazon',
      partnerName: 'Amazon',
      brand: 'Microsoft Xbox',
      category: 'Controllers',
      badge: 'Xbox Controller',
      accent: 'green',
      title: 'Xbox Wireless Controller (Carbon Black)',
      asin: 'B0F1HX3WXX',
      trackingId: AMZ_TAG,
      compat: 'Xbox Series X|S, Xbox One, Windows PC, Android & iOS',
      desc: 'Official Microsoft Xbox Series X|S wireless gamepad with textured trigger grips, hybrid D-pad, Share button, and 3.5mm audio jack.',
      whyConsider: 'Textured grip and responsive triggers built for highway pursuits and gunfights on Xbox or PC.',
      cta: 'View on Amazon \u2192',
      url: aff.amazon.links.xboxCarbonBlack,
      amazonKey: 'xboxCarbonBlack',
      mediaType: 'none',
      image: null,
      imageCreator: 'uKER',
      imageLicense: 'CC BY-SA 4.0',
      imageLicenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
      imageCredit: 'Photo: uKER \u00b7 CC BY-SA 4.0',
      imageSource: 'https://commons.wikimedia.org/wiki/File:Xbox_Series_Controller_Carbon_Black.jpg',
      imageRightsStatus: 'Text-Only (Strict Amazon-Only Photo Policy)',
      alt: 'Photograph of the Microsoft Xbox Wireless Controller in Carbon Black',
      lastVerified: '2026-11-25',
      placements: ['homepage-setup', 'vehicles', 'weapons', 'controls', 'heist-command', 'xbox-gear', 'default'],
      disclosure: AMZ_STATEMENT
    },
    kossPortaPro: {
      id: 'kossPortaPro',
      enabled: true,
      featured: true,
      partner: 'amazon',
      partnerName: 'Amazon',
      brand: 'Koss',
      category: 'Wired Headphones',
      badge: 'Wired 3.5mm Headphones',
      accent: 'pink',
      title: 'Koss Porta Pro Classic On-Ear Wired Headphones',
      asin: 'B00001P4ZH',
      trackingId: AMZ_TAG,
      compat: 'PS5 DualSense, Xbox Series X|S Controllers, PC & Mobile (3.5mm wired)',
      desc: 'Ultra-lightweight 1980s retro on-ear wired headphones (no built-in mic) with open-back stereo sound, adjustable ComfortZone temple pads, and collapsible steel band.',
      whyConsider: 'Affordable Vice-era classic wired headphones that plug straight into PS5 or Xbox controllers with zero battery charging.',
      cta: 'View on Amazon \u2192',
      url: aff.amazon.links.kossPortaPro,
      amazonKey: 'kossPortaPro',
      mediaType: 'none',
      image: null,
      imageCreator: 'Malcolm Tyrrell',
      imageLicense: 'CC BY-SA 3.0',
      imageLicenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/',
      imageCredit: 'Photo: Malcolm Tyrrell \u00b7 CC BY-SA 3.0',
      imageSource: 'https://commons.wikimedia.org/wiki/File:Koss_PortaPro.jpg',
      imageRightsStatus: 'Text-Only (Strict Amazon-Only Photo Policy)',
      alt: 'Photograph of Koss Porta Pro Classic On-Ear Wired Headphones (Silver & Blue)',
      lastVerified: '2026-11-25',
      placements: ['homepage-setup', 'weapons', 'missions', 'properties', 'xbox-gear', 'default'],
      disclosure: AMZ_STATEMENT
    },
    sonyMdr7506: {
      id: 'sonyMdr7506',
      enabled: true,
      featured: true,
      partner: 'amazon',
      partnerName: 'Amazon',
      brand: 'Sony',
      category: 'Studio Headphones',
      badge: 'Studio Wired 3.5mm',
      accent: 'cyan',
      title: 'Sony MDR-7506 Professional Over-Ear Wired Headphones',
      asin: 'B000AJIF4E',
      trackingId: AMZ_TAG,
      compat: 'PS5 DualSense, Xbox Controllers, PC & Audio Interfaces (3.5mm + 1/4" adapter)',
      desc: 'Closed-back wired studio monitor headphones (no built-in mic) with 40mm neodymium drivers, coiled cable, folding design, and clear directional sound isolation.',
      whyConsider: 'Hear crisp Leonida radio tracks, dialogue, and footsteps clearly without paying wireless headset markups.',
      cta: 'View on Amazon \u2192',
      url: aff.amazon.links.sonyMdr7506,
      amazonKey: 'sonyMdr7506',
      mediaType: 'none',
      image: null,
      imageCreator: 'Ashley Pomeroy',
      imageLicense: 'CC BY 4.0',
      imageLicenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
      imageCredit: 'Photo: Ashley Pomeroy \u00b7 CC BY 4.0',
      imageSource: 'https://commons.wikimedia.org/wiki/File:Sony_MDR-7506_7615.jpg',
      imageRightsStatus: 'Text-Only (Strict Amazon-Only Photo Policy)',
      alt: 'Photograph of Sony MDR-7506 Professional Over-Ear Wired Headphones',
      lastVerified: '2026-11-25',
      placements: ['homepage-setup', 'weapons', 'missions', 'heist-command', 'default'],
      disclosure: AMZ_STATEMENT
    },
    samsung990Pro4tb: {
      id: 'samsung990Pro4tb',
      enabled: true,
      featured: false,
      partner: 'amazon',
      partnerName: 'Amazon',
      brand: 'Samsung',
      category: 'Storage',
      badge: '4TB Gen4 NVMe (Bare)',
      accent: 'purple',
      title: 'Samsung 990 PRO 4TB PCIe 4.0 NVMe M.2 SSD (MZ-V9P4T0B/AM)',
      asin: 'B0CHGT1KFJ',
      trackingId: AMZ_TAG,
      compat: 'PC / Laptop M.2 2280 Slot (PS5 requires adding a separate M.2 heatsink)',
      desc: 'High-capacity 4TB PCIe Gen4 x4 NVMe M.2 2280 internal SSD rated up to 7,450 MB/s sequential read for large game libraries.',
      whyConsider: 'Bare M.2 drive (no factory heatsink) ideal for PC builds or PS5 players pairing with an aftermarket PS5 heatsink.',
      cta: 'View on Amazon \u2192',
      url: aff.amazon.links.samsung990Pro4tb,
      amazonKey: 'samsung990Pro4tb',
      mediaType: 'none',
      image: null,
      imageCreator: 'Dinkun Chen',
      imageLicense: 'CC BY-SA 4.0',
      imageLicenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
      imageCredit: 'Photo: Dinkun Chen \u00b7 CC BY-SA 4.0',
      imageSource: 'https://commons.wikimedia.org/wiki/File:SAMSUNG_M.2_NVMe_SSD_990_PRO_4TB.jpg',
      imageRightsStatus: 'Text-Only (Strict Amazon-Only Photo Policy)',
      alt: 'Photograph of the Samsung 990 PRO 4TB PCIe 4.0 NVMe M.2 SSD',
      lastVerified: '2026-11-25',
      placements: ['storage', 'troubleshooting'],
      disclosure: AMZ_STATEMENT
    },
    blueYetiBlackout: {
      id: 'blueYetiBlackout',
      enabled: true,
      featured: false,
      partner: 'amazon',
      partnerName: 'Amazon',
      brand: 'Logitech / Blue',
      category: 'Gaming Setup & Streaming',
      badge: 'USB Desktop Mic',
      accent: 'cyan',
      title: 'Logitech Blue Yeti USB Microphone (Blackout)',
      asin: 'B00N1YPXW2',
      trackingId: AMZ_TAG,
      compat: 'PlayStation 5 (USB), Windows PC & Mac (Plug-and-Play USB)',
      desc: 'Plug-and-play desktop condenser USB microphone with four pickup patterns, onboard gain/mute controls, and zero-latency headphone monitoring.',
      whyConsider: 'Clean squad voice chat and gameplay commentary upgrade when pairing with studio wired headphones.',
      cta: 'View on Amazon \u2192',
      url: aff.amazon.links.blueYetiBlackout,
      amazonKey: 'blueYetiBlackout',
      mediaType: 'none',
      image: null,
      imageCreator: 'Guillaume Pasquier',
      imageLicense: 'CC0 1.0',
      imageLicenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
      imageCredit: 'Photo: Guillaume Pasquier \u00b7 CC0 1.0',
      imageSource: 'https://commons.wikimedia.org/wiki/File:Blue_Yeti_Blackout_USB_microphone_(51844234538).jpg',
      imageRightsStatus: 'Text-Only (Strict Amazon-Only Photo Policy)',
      alt: 'Photograph of the Logitech Blue Yeti USB Microphone in Blackout finish',
      lastVerified: '2026-11-25',
      placements: ['properties', 'gaming-room', 'heist-command', 'creator', 'default'],
      disclosure: AMZ_STATEMENT
    },

    // --- A. CONTROLLERS & CHARGING (CATEGORY ILLUSTRATION FALLBACKS — PHOTO PERMISSION PENDING) ---
    poweraPs5Dock: {
      id: 'poweraPs5Dock',
      enabled: true,
      featured: false,
      partner: 'amazon',
      partnerName: 'Amazon',
      brand: 'PowerA',
      category: 'Controllers & Charging',
      badge: 'PS5 Charging Dock',
      accent: 'cyan',
      title: 'PowerA Twin Charging Station for DualSense Controllers',
      asin: 'B09B1XX1PN',
      trackingId: AMZ_TAG,
      compat: 'PlayStation 5 (DualSense Wireless Controllers)',
      desc: 'Officially licensed click-down dual charging cradle that charges two PS5 DualSense controllers simultaneously without tying up console USB ports.',
      whyConsider: 'Keeps a charged controller ready on your desk or TV stand between long Leonida story runs.',
      cta: 'View on Amazon \u2192',
      url: aff.amazon.links.poweraPs5Dock,
      amazonKey: 'poweraPs5Dock',
      mediaType: 'none',
      image: null,
      imageSource: 'Publisher-owned studio hardware category illustration',
      imageRightsStatus: 'Text-Only (Strict Amazon-Only Photo Policy)',
      imageLabel: 'Category Illustration (Photo Pending)',
      alt: 'Category illustration of a dual PlayStation 5 controller charging station',
      lastVerified: '2026-11-25',
      placements: ['charging'],
      disclosure: AMZ_STATEMENT
    },
    poweraXboxDock: {
      id: 'poweraXboxDock',
      enabled: true,
      featured: false,
      partner: 'amazon',
      partnerName: 'Amazon',
      brand: 'PowerA',
      category: 'Controllers & Charging',
      badge: 'Xbox Charging Dock',
      accent: 'green',
      title: 'PowerA Duo Charging Station for Xbox Series X|S',
      asin: 'B09FZ4K8FQ',
      trackingId: AMZ_TAG,
      compat: 'Xbox Series X|S Wireless Controllers (Includes 2 Rechargeable Batteries)',
      desc: 'Officially licensed Designed-for-Xbox dual charging dock with two rechargeable battery packs and charge-through doors.',
      whyConsider: 'Replaces disposable AA batteries with snap-down desktop charging and clear LED charge indicators.',
      cta: 'View on Amazon \u2192',
      url: aff.amazon.links.poweraXboxDock,
      amazonKey: 'poweraXboxDock',
      mediaType: 'none',
      image: null,
      imageSource: 'Publisher-owned studio hardware category illustration',
      imageRightsStatus: 'Text-Only (Strict Amazon-Only Photo Policy)',
      imageLabel: 'Category Illustration (Photo Pending)',
      alt: 'Category illustration of a dual Xbox Series X|S controller charging dock with rechargeable battery pack',
      lastVerified: '2026-11-25',
      placements: ['vehicles', 'controls', 'heist-command', 'collectibles', 'xbox-gear', 'default'],
      disclosure: AMZ_STATEMENT
    },

    // --- B. THUMBSTICKS & CONTROLLER ACCESSORIES ---
    kontrolfreekHeist: {
      id: 'kontrolfreekHeist',
      enabled: true,
      featured: false,
      partner: 'amazon',
      partnerName: 'Amazon',
      brand: 'KontrolFreek',
      category: 'Thumbsticks & Grips',
      badge: 'Aim & Grip Extenders',
      accent: 'pink',
      title: 'KontrolFreek Action Adventure Thumbsticks \u2014 Heist Edition',
      asin: 'B0GNNTYQGH',
      trackingId: AMZ_TAG,
      compat: 'PlayStation 5 & PlayStation 4 Controllers',
      desc: 'Slip-on performance thumbstick grips in pink and blue designed to add stick height and textured thumb grip for driving and gunplay.',
      whyConsider: 'Affordable controller comfort and grip upgrade with Vice-inspired colors without buying a pro gamepad.',
      cta: 'View on Amazon \u2192',
      url: aff.amazon.links.kontrolfreekHeist,
      amazonKey: 'kontrolfreekHeist',
      mediaType: 'none',
      image: null,
      imageSource: 'Publisher-owned studio hardware category illustration',
      imageRightsStatus: 'Text-Only (Strict Amazon-Only Photo Policy)',
      imageLabel: 'Category Illustration (Photo Pending)',
      alt: 'Category illustration of pink and blue performance controller thumbstick grips',
      lastVerified: '2026-11-25',
      placements: ['homepage-setup', 'vehicles', 'weapons', 'controls', 'collectibles', 'default'],
      disclosure: AMZ_STATEMENT
    },
    kontrolfreekGalaxy: {
      id: 'kontrolfreekGalaxy',
      enabled: true,
      featured: false,
      partner: 'amazon',
      partnerName: 'Amazon',
      brand: 'KontrolFreek',
      category: 'Thumbsticks & Grips',
      badge: 'High + Mid-Rise Grips',
      accent: 'purple',
      title: 'KontrolFreek FPS Freek Galaxy Black Performance Thumbsticks',
      asin: 'B0B4862QNJ',
      trackingId: AMZ_TAG,
      compat: 'PlayStation 5 & PlayStation 4 Controllers',
      desc: 'Mixed-height concave thumbstick extenders combining a high-rise right stick with a mid-rise left stick for textured grip.',
      whyConsider: 'Adds extra thumbstick leverage for finer steering and camera adjustments during shootouts.',
      cta: 'View on Amazon \u2192',
      url: aff.amazon.links.kontrolfreekGalaxy,
      amazonKey: 'kontrolfreekGalaxy',
      mediaType: 'none',
      image: null,
      imageSource: 'Publisher-owned studio hardware category illustration',
      imageRightsStatus: 'Text-Only (Strict Amazon-Only Photo Policy)',
      imageLabel: 'Category Illustration (Photo Pending)',
      alt: 'Category illustration of black high-rise and mid-rise controller thumbstick grips',
      lastVerified: '2026-11-25',
      placements: ['weapons', 'vehicles', 'controls', 'default'],
      disclosure: AMZ_STATEMENT
    },

    // --- C. AFFORDABLE GAMING HEADSETS ---
    turtleBeachRecon70: {
      id: 'turtleBeachRecon70',
      enabled: true,
      featured: false,
      partner: 'amazon',
      partnerName: 'Amazon',
      brand: 'Turtle Beach',
      category: 'Affordable Headsets',
      badge: 'Multiplatform 3.5mm',
      accent: 'cyan',
      title: 'Turtle Beach Recon 70 Wired Multiplatform Gaming Headset',
      asin: 'B0CWS6WV23',
      trackingId: AMZ_TAG,
      compat: 'PS5, PS4, Xbox Series X|S, Xbox One, PC, Switch & Mobile (3.5mm wired)',
      desc: 'Lightweight wired 3.5mm gaming headset with 40mm speakers, cushioned earpads, and a flip-to-mute boom microphone.',
      whyConsider: 'Plugs straight into either a PS5 DualSense or Xbox controller jack with zero battery charging required.',
      cta: 'View on Amazon \u2192',
      url: aff.amazon.links.turtleBeachRecon70,
      amazonKey: 'turtleBeachRecon70',
      mediaType: 'none',
      image: null,
      imageSource: 'Publisher-owned studio hardware category illustration',
      imageRightsStatus: 'Text-Only (Strict Amazon-Only Photo Policy)',
      imageLabel: 'Category Illustration (Photo Pending)',
      alt: 'Category illustration of a wired multiplatform over-ear gaming headset with flip-to-mute microphone',
      lastVerified: '2026-11-25',
      placements: ['homepage-setup', 'weapons', 'missions', 'heist-command', 'xbox-gear', 'default'],
      disclosure: AMZ_STATEMENT
    },
    hyperxStinger2Core: {
      id: 'hyperxStinger2Core',
      enabled: true,
      featured: false,
      partner: 'amazon',
      partnerName: 'Amazon',
      brand: 'HyperX',
      category: 'Affordable Headsets',
      badge: 'PlayStation Wired',
      accent: 'cyan',
      title: 'HyperX Cloud Stinger 2 Core Gaming Headset (PlayStation)',
      asin: 'B0BDGMNF6V',
      trackingId: AMZ_TAG,
      compat: 'PlayStation 5 & PlayStation 4 (3.5mm wired)',
      desc: 'Budget-friendly lightweight over-ear PlayStation headset with 40mm drivers, on-ear volume slider, and swivel-to-mute mic.',
      whyConsider: 'Clean PS5 white-and-blue styling and comfortable soft ear cushions for marathon story sessions.',
      cta: 'View on Amazon \u2192',
      url: aff.amazon.links.hyperxStinger2Core,
      amazonKey: 'hyperxStinger2Core',
      mediaType: 'none',
      image: null,
      imageSource: 'Publisher-owned studio hardware category illustration',
      imageRightsStatus: 'Text-Only (Strict Amazon-Only Photo Policy)',
      imageLabel: 'Category Illustration (Photo Pending)',
      alt: 'Category illustration of a white and blue PlayStation wired gaming headset',
      lastVerified: '2026-11-25',
      placements: ['weapons', 'missions', 'heist-command', 'default'],
      disclosure: AMZ_STATEMENT
    },

    // --- D. PS5 STORAGE UPGRADES (HEATSINK VERIFIED) ---
    lexarNm790Heatsink: {
      id: 'lexarNm790Heatsink',
      enabled: true,
      featured: false,
      partner: 'amazon',
      partnerName: 'Amazon',
      brand: 'Lexar',
      category: 'PS5 Storage',
      badge: '1TB PS5 NVMe + Heatsink',
      accent: 'green',
      title: 'Lexar 1TB NM790 PCIe Gen4 NVMe M.2 SSD with Heatsink',
      asin: 'B0CGKPPZY9',
      trackingId: AMZ_TAG,
      compat: 'PlayStation 5 Internal M.2 2280 Slot (PCIe 4.0 x4, Integrated Heatsink) & PC',
      desc: '1TB PCIe Gen4 x4 M.2 2280 SSD with a pre-installed low-profile heatsink rated up to 7,400 MB/s read for PS5 storage expansion.',
      whyConsider: 'Meets Sony PS5 M.2 speed, size, and heatsink requirements in an approachable 1TB capacity.',
      cta: 'View on Amazon \u2192',
      url: aff.amazon.links.lexarNm790Heatsink,
      amazonKey: 'lexarNm790Heatsink',
      mediaType: 'none',
      image: null,
      imageSource: 'Publisher-owned studio hardware category illustration',
      imageRightsStatus: 'Text-Only (Strict Amazon-Only Photo Policy)',
      imageLabel: 'Category Illustration (Photo Pending)',
      alt: 'Category illustration of a 1TB PCIe 4.0 M.2 NVMe SSD with integrated PS5 heatsink',
      lastVerified: '2026-11-25',
      placements: ['troubleshooting', 'storage'],
      disclosure: AMZ_STATEMENT
    },
    wdBlackSn850p: {
      id: 'wdBlackSn850p',
      enabled: true,
      featured: false,
      partner: 'amazon',
      partnerName: 'Amazon',
      brand: 'WD_BLACK',
      category: 'PS5 Storage',
      badge: '2TB PS5 Licensed',
      accent: 'cyan',
      title: 'WD_BLACK 2TB SN850P NVMe M.2 SSD with Heatsink (PS5 Licensed)',
      asin: 'B0C47ZX1WB',
      trackingId: AMZ_TAG,
      compat: 'PlayStation 5 Internal M.2 2280 Slot (Officially Licensed w/ Heatsink) & PC',
      desc: 'Officially licensed 2TB PS5 internal M.2 NVMe SSD with a custom pre-installed heatsink rated up to 7,300 MB/s read.',
      whyConsider: 'Spacious 2TB capacity for keeping GTA VI alongside several other large open-world installs.',
      cta: 'View on Amazon \u2192',
      url: aff.amazon.links.wdBlackSn850p,
      amazonKey: 'wdBlackSn850p',
      mediaType: 'none',
      image: null,
      imageSource: 'Publisher-owned studio hardware category illustration',
      imageRightsStatus: 'Text-Only (Strict Amazon-Only Photo Policy)',
      imageLabel: 'Category Illustration (Photo Pending)',
      alt: 'Category illustration of a 2TB officially licensed PS5 NVMe M.2 SSD with heatsink',
      lastVerified: '2026-11-25',
      placements: ['troubleshooting', 'storage'],
      disclosure: AMZ_STATEMENT
    },

    // --- E. GAMING SETUP ACCESSORIES ---
    headsetStand: {
      id: 'headsetStand',
      enabled: true,
      featured: false,
      partner: 'amazon',
      partnerName: 'Amazon',
      brand: 'New Bee',
      category: 'Gaming Setup Accessories',
      badge: 'Desk Organizer',
      accent: 'cyan',
      title: 'New Bee Aluminum Desktop Headphone Stand',
      asin: 'B01GJQ7N94',
      trackingId: AMZ_TAG,
      compat: 'Universal (All Over-Ear Gaming Headsets & Headphones)',
      desc: 'Compact weighted desktop stand with an anodized aluminum pole and flexible TPU headrest that protects headset headbands.',
      whyConsider: 'Keeps your headset off the desk surface and away from spills without taking up extra room.',
      cta: 'View on Amazon \u2192',
      url: aff.amazon.links.headsetStand,
      amazonKey: 'headsetStand',
      mediaType: 'none',
      image: null,
      imageSource: 'Publisher-owned studio hardware category illustration',
      imageRightsStatus: 'Text-Only (Strict Amazon-Only Photo Policy)',
      imageLabel: 'Category Illustration (Photo Pending)',
      alt: 'Category illustration of an aluminum desktop gaming headphone stand',
      lastVerified: '2026-11-25',
      placements: ['homepage-setup', 'properties', 'gaming-room', 'heist-command', 'default'],
      disclosure: AMZ_STATEMENT
    },
    cableKit: {
      id: 'cableKit',
      enabled: true,
      featured: false,
      partner: 'amazon',
      partnerName: 'Amazon',
      brand: 'OHill',
      category: 'Gaming Setup Accessories',
      badge: 'Cable Management',
      accent: 'green',
      title: 'OHill 16-Pack Self-Adhesive Desktop Cable Clips',
      asin: 'B071FXZBMV',
      trackingId: AMZ_TAG,
      compat: 'Universal (USB-C Charging Cables, HDMI Lines & Headset Cords)',
      desc: '16-pack of assorted multi-slot silicone desk clips with self-adhesive pads for organizing charging and audio cables.',
      whyConsider: 'Stops controller charging cords from sliding behind your desk or TV console every time you unplug.',
      cta: 'View on Amazon \u2192',
      url: aff.amazon.links.cableKit,
      amazonKey: 'cableKit',
      mediaType: 'none',
      image: null,
      imageSource: 'Publisher-owned studio hardware category illustration',
      imageRightsStatus: 'Text-Only (Strict Amazon-Only Photo Policy)',
      imageLabel: 'Category Illustration (Photo Pending)',
      alt: 'Category illustration of silicone adhesive desktop cable management clips',
      lastVerified: '2026-11-25',
      placements: ['properties', 'gaming-room', 'troubleshooting', 'default'],
      disclosure: AMZ_STATEMENT
    },

    // --- F. FUNNY & UNUSUAL GAMING GEAR ---
    paladonePsIcons: {
      id: 'paladonePsIcons',
      enabled: true,
      featured: false,
      partner: 'amazon',
      partnerName: 'Amazon',
      brand: 'Paladone',
      category: 'Funny & Unusual',
      badge: 'Gaming Room Decor',
      accent: 'purple',
      title: 'Paladone PlayStation Controller Icons Light (3 Light Modes)',
      asin: 'B079CBP6P9',
      trackingId: AMZ_TAG,
      compat: 'Universal Desk & Shelf Decor (USB or AAA Battery Powered)',
      desc: 'Officially licensed PlayStation desk light featuring standard, color-phasing, and music/sound-reactive modes.',
      whyConsider: 'Adds retro neon Vice City ambiance to a gaming shelf or TV stand at an affordable gift price.',
      cta: 'View on Amazon \u2192',
      url: aff.amazon.links.paladonePsIcons,
      amazonKey: 'paladonePsIcons',
      mediaType: 'none',
      image: null,
      imageSource: 'Publisher-owned studio hardware category illustration',
      imageRightsStatus: 'Text-Only (Strict Amazon-Only Photo Policy)',
      imageLabel: 'Category Illustration (Photo Pending)',
      alt: 'Category illustration of a glowing PlayStation controller icons desktop light',
      lastVerified: '2026-11-25',
      placements: ['properties', 'gaming-room', 'funny-gear'],
      disclosure: AMZ_STATEMENT
    },
    cableGuyMonkeybomb: {
      id: 'cableGuyMonkeybomb',
      enabled: true,
      featured: false,
      partner: 'amazon',
      partnerName: 'Amazon',
      brand: 'Exquisite Gaming',
      category: 'Funny & Unusual',
      badge: 'Novelty Stand',
      accent: 'amber',
      title: 'Exquisite Gaming Cable Guys: Monkeybomb Controller & Phone Stand',
      asin: 'B08KJJFFY8',
      trackingId: AMZ_TAG,
      compat: 'PlayStation 5, Xbox Series X|S Controllers & Most Smartphones',
      desc: 'Officially licensed collectible figure stand designed to cradle a console gamepad or smartphone on your desk.',
      whyConsider: 'Fun conversation-piece controller stand that pulls double duty holding your phone while using our interactive map.',
      cta: 'View on Amazon \u2192',
      url: aff.amazon.links.cableGuyMonkeybomb,
      amazonKey: 'cableGuyMonkeybomb',
      mediaType: 'none',
      image: null,
      imageSource: 'Publisher-owned studio hardware category illustration',
      imageRightsStatus: 'Text-Only (Strict Amazon-Only Photo Policy)',
      imageLabel: 'Category Illustration (Photo Pending)',
      alt: 'Category illustration of a novelty gaming figure holding a wireless controller',
      lastVerified: '2026-11-25',
      placements: ['properties', 'gaming-room', 'funny-gear'],
      disclosure: AMZ_STATEMENT
    },

    // --- APPROVED NON-AMAZON PARTNERS (PRESERVED) ---
    g2a: {
      id: 'g2a',
      enabled: true,
      featured: false,
      partner: 'g2a',
      partnerName: 'G2A.COM',
      brand: 'G2A.COM',
      category: 'Game Deals',
      badge: 'Digital Keys',
      accent: 'orange',
      title: 'G2A Verified Game Keys & Gift Cards',
      compat: 'PlayStation Network \u00b7 Xbox \u00b7 PC / Steam',
      desc: 'Compare digital PlayStation Store credit, Xbox wallet top-ups, and PC game key listings across marketplace sellers.',
      whyConsider: 'Handy for comparing regional digital gift cards in one marketplace.',
      cta: 'Browse G2A \u2192',
      url: aff.g2a.url,
      mediaType: 'brand-g2a',
      alt: 'G2A.COM Digital Marketplace',
      disclosure: 'Affiliate link \u00b7 We earn a commission on qualifying G2A purchases at no extra cost to you.'
    },
    exitlag: {
      id: 'exitlag',
      enabled: true,
      featured: false,
      partner: 'exitlag',
      partnerName: 'ExitLag',
      brand: 'ExitLag',
      category: 'Network Routing',
      badge: 'PC Routing Utility',
      accent: 'crimson',
      title: 'ExitLag Multi-Path Gaming Connection Routing',
      compat: 'Windows PC (Supported Multiplayer Titles)',
      desc: 'Connection routing utility for PC games designed to manage packet paths across supported online titles.',
      whyConsider: 'Useful for PC multiplayer players dealing with ISP jitter; not for PS5/Xbox consoles.',
      cta: 'Visit ExitLag \u2192',
      url: aff.exitlag.url,
      mediaType: 'brand-exitlag',
      alt: 'ExitLag Multi-Path Gaming Network Routing',
      disclosure: 'Referral link \u00b7 We may earn a commission on qualifying ExitLag referrals at no extra cost to you.'
    },
    cutflow: {
      id: 'cutflow',
      enabled: true,
      featured: false,
      partner: 'gumroad',
      partnerName: 'CutFlow Pro',
      brand: 'Apex Local Labs',
      category: 'Creator Utility',
      badge: 'Offline Clip Tool',
      accent: 'amber',
      title: 'CutFlow Pro Clip Workstation',
      compat: 'Windows PC (Premiere Pro \u00b7 DaVinci Resolve)',
      desc: 'Local Windows utility that trims dead air from raw gameplay VODs and exports clean NLE timelines offline.',
      whyConsider: 'Processes multi-hour gameplay recordings locally with no cloud upload queue.',
      cta: 'View CutFlow Pro \u2192',
      url: aff.gumroad.cutflowPro,
      mediaType: 'ui-cutflow',
      image: '/assets/cutflow-ui.png',
      alt: 'CutFlow Pro Desktop Auto-Silence Remover Interface',
      disclosure: 'Partner link \u00b7 Qualifying Gumroad purchases support GTA6HeistGuide.com at no extra cost to you.'
    }
  });

  // 2. CONTEXTUAL PRODUCT POOLS (PHASE 33.1 — PRIORITIZES VERIFIED REAL PRODUCT PHOTOGRAPHY)
  var CONTEXT_POOLS = {
    'homepage-setup': ['dualsenseWhite', 'xboxCarbonBlack', 'kossPortaPro', 'sonyMdr7506'],
    'vehicles': ['dualsenseWhite', 'xboxCarbonBlack', 'kossPortaPro', 'sonyMdr7506'],
    'weapons': ['sonyMdr7506', 'kossPortaPro', 'dualsenseWhite', 'xboxCarbonBlack'],
    'heist-command': ['dualsenseWhite', 'xboxCarbonBlack', 'sonyMdr7506', 'blueYetiBlackout'],
    'properties': ['blueYetiBlackout', 'kossPortaPro', 'dualsenseWhite', 'xboxCarbonBlack'],
    'gaming-room': ['blueYetiBlackout', 'paladonePsIcons', 'cableGuyMonkeybomb', 'headsetStand'],
    'funny-gear': ['paladonePsIcons', 'cableGuyMonkeybomb'],
    'controls': ['dualsenseWhite', 'xboxCarbonBlack', 'kontrolfreekHeist', 'kontrolfreekGalaxy'],
    'troubleshooting': ['samsung990Pro4tb', 'lexarNm790Heatsink', 'wdBlackSn850p'],
    'storage': ['samsung990Pro4tb', 'lexarNm790Heatsink', 'wdBlackSn850p'],
    'missions': ['sonyMdr7506', 'kossPortaPro', 'dualsenseWhite', 'xboxCarbonBlack'],
    'collectibles': ['dualsenseWhite', 'xboxCarbonBlack', 'kossPortaPro', 'blueYetiBlackout'],
    'xbox-gear': ['xboxCarbonBlack', 'kossPortaPro', 'poweraXboxDock'],
    'creator': ['blueYetiBlackout', 'sonyMdr7506', 'cutflow'],
    'money': ['dualsenseWhite', 'xboxCarbonBlack', 'kossPortaPro', 'sonyMdr7506'],
    'default': ['dualsenseWhite', 'xboxCarbonBlack', 'kossPortaPro', 'sonyMdr7506', 'blueYetiBlackout', 'samsung990Pro4tb']
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

  var pageUsedIds = {};
  function resetPageRegistry() {
    pageUsedIds = {};
  }

  function detectDefaultContext() {
    var p = (global.location && global.location.pathname || '/').toLowerCase();
    if (p.indexOf('vehicle') !== -1) return 'vehicles';
    if (p.indexOf('weapon') !== -1) return 'weapons';
    if (p.indexOf('heist-command') !== -1) return 'heist-command';
    if (p.indexOf('propert') !== -1) return 'properties';
    if (p.indexOf('control') !== -1) return 'controls';
    if (p.indexOf('troubleshoot') !== -1 || p.indexOf('settings') !== -1) return 'troubleshooting';
    if (p.indexOf('mission') !== -1 || p.indexOf('heist') !== -1) return 'missions';
    if (p.indexOf('collect') !== -1) return 'collectibles';
    if (p.indexOf('radio') !== -1) return 'weapons';
    if (p.indexOf('money') !== -1) return 'money';
    return 'default';
  }

  function isAmazonProductPlacementsEnabled() {
    var cfg = global.SITE_CONFIG;
    return !!(cfg && cfg.enableAmazonProductPlacements === true);
  }

  function isBlockedPath() {
    var p = (global.location && global.location.pathname || '').toLowerCase();
    if (p.indexOf('/animals') !== -1) return true;
    if (p.indexOf('/community-discoveries/submit') !== -1) return true;
    if (p.indexOf('/cd-admin') !== -1) return true;
    if (p === '/map' || p === '/map.html' || p.indexOf('/interactive-map') !== -1 || p.indexOf('/leonida-interactive-map') !== -1) return true;
    return false;
  }

  function selectOffers(contextKey, count, slotId, options) {
    options = options || {};
    var allowAmazon = isAmazonProductPlacementsEnabled();
    var poolIds = Array.isArray(contextKey)
      ? contextKey.slice()
      : (CONTEXT_POOLS[contextKey] || CONTEXT_POOLS['default']).slice();

    // Deterministic order for homepage-setup and explicit product lists so flagship picks stay predictable
    var preserveOrder = options.preserveOrder || contextKey === 'homepage-setup' || Array.isArray(contextKey);
    var ordered = poolIds;
    if (!preserveOrder && poolIds.length > 1) {
      var offset = hashStr((global.location ? global.location.pathname : '/') + '|' + (slotId || contextKey)) % poolIds.length;
      ordered = poolIds.slice(offset).concat(poolIds.slice(0, offset));
    }

    var picked = [];
    for (var i = 0; i < ordered.length && picked.length < count; i++) {
      var offer = CATALOG[ordered[i]];
      if (!offer || offer.enabled === false) continue;
      if (!allowAmazon && offer.partner === 'amazon') continue;
      if (pageUsedIds[offer.id]) continue;
      picked.push(offer);
      pageUsedIds[offer.id] = true;
    }

    if (allowAmazon && picked.length < count) {
      var fallback = ['dualsenseWhite', 'xboxCarbonBlack', 'kossPortaPro', 'sonyMdr7506', 'blueYetiBlackout', 'samsung990Pro4tb'];
      for (var j = 0; j < fallback.length && picked.length < count; j++) {
        var fb = CATALOG[fallback[j]];
        if (!fb || fb.enabled === false || pageUsedIds[fb.id]) continue;
        picked.push(fb);
        pageUsedIds[fb.id] = true;
      }
    }
    return picked;
  }

  function buildLinkAttrs(offer, placement, area) {
    var amzAttr = offer.amazonKey ? ' data-amazon-link="' + esc(offer.amazonKey) + '"' : '';
    var asinAttr = offer.asin ? ' data-aff-asin="' + esc(offer.asin) + '"' : '';
    return 'href="' + esc(offer.url) + '"' + amzAttr + asinAttr +
      ' target="_blank" rel="sponsored nofollow noopener"' +
      ' data-aff-partner="' + esc(offer.partner) + '"' +
      ' data-aff-product="' + esc(offer.id) + '"' +
      ' data-aff-category="' + esc(offer.category || '') + '"' +
      ' data-aff-placement="' + esc(placement || 'card') + '"' +
      ' data-aff-area="' + esc(area || 'cta') + '"';
  }

  function renderMediaHtml(offer, compact, eager, placement) {
    var loadAttr = eager ? 'eager' : 'lazy';
    var linkAttrs = buildLinkAttrs(offer, placement, 'image');

    if (offer.mediaType === 'brand-g2a') {
      return (
        '<a ' + linkAttrs + ' class="aff-media aff-brand-panel aff-brand-panel--g2a' + (compact ? ' is-compact' : '') + '" aria-label="Browse ' + esc(offer.title) + '">' +
          '<div class="aff-brand-wordmark-wrap">' +
            '<span class="aff-brand-mark aff-brand-mark--g2a" aria-hidden="true">G2A</span>' +
            '<span class="aff-brand-sub">DIGITAL MARKETPLACE</span>' +
          '</div>' +
          (!compact ? '<div class="aff-brand-chips"><span>PSN</span><span>XBOX</span><span>PC KEYS</span></div>' : '') +
        '</a>'
      );
    }
    if (offer.mediaType === 'brand-exitlag') {
      return (
        '<a ' + linkAttrs + ' class="aff-media aff-brand-panel aff-brand-panel--exitlag' + (compact ? ' is-compact' : '') + '" aria-label="Visit ' + esc(offer.title) + '">' +
          '<div class="aff-brand-wordmark-wrap">' +
            '<span class="aff-brand-mark aff-brand-mark--exitlag" aria-hidden="true">EXITLAG</span>' +
            '<span class="aff-brand-sub">MULTI-PATH ROUTING</span>' +
          '</div>' +
          (!compact ? '<div class="aff-brand-chips"><span>PC ROUTING</span><span>OPTIMIZER</span></div>' : '') +
        '</a>'
      );
    }
    if (offer.mediaType === 'ui-cutflow' && offer.image) {
      return (
        '<a ' + linkAttrs + ' class="aff-media aff-media--ui' + (compact ? ' is-compact' : '') + '" aria-label="View ' + esc(offer.title) + '">' +
          '<img src="' + esc(offer.image) + '" alt="' + esc(offer.alt) + '" loading="' + loadAttr + '" decoding="async" width="400" height="300">' +
          '<span class="aff-media-brand-pill aff-media-brand-pill--cutflow">CutFlow Pro</span>' +
        '</a>'
      );
    }

    // Studio-stage product showcase (supports both authorized 'photo' and clearly-badged 'illustration')
    if (offer.image) {
      var isPhoto = offer.mediaType === 'photo';
      var decodeAttr = eager ? 'sync' : 'async';
      var stageLabel = isPhoto
        ? ''
        : '<span class="aff-stage-badge aff-stage-badge--illus">' + esc(offer.imageLabel || 'Category Illustration') + '</span>';

      var photoCreditHtml = '';
      if (isPhoto && offer.imageCreator && offer.imageSource && offer.imageLicense && offer.imageLicenseUrl) {
        photoCreditHtml =
          '<div class="aff-photo-credit">' +
            'Photo: <a href="' + esc(offer.imageSource) + '" target="_blank" rel="noopener noreferrer">' + esc(offer.imageCreator) + '</a>' +
            ' &middot; <a href="' + esc(offer.imageLicenseUrl) + '" target="_blank" rel="noopener noreferrer">' + esc(offer.imageLicense) + '</a>' +
          '</div>';
      } else if (isPhoto && offer.imageCredit && offer.imageSource) {
        photoCreditHtml =
          '<div class="aff-photo-credit">' +
            '<a href="' + esc(offer.imageSource) + '" target="_blank" rel="noopener noreferrer">' + esc(offer.imageCredit) + '</a>' +
          '</div>';
      }

      return (
        '<div class="aff-stage-wrap' + (compact ? ' aff-stage-wrap--compact' : '') + '">' +
          '<a ' + linkAttrs + ' class="aff-stage' + (compact ? ' aff-stage--compact' : '') + (isPhoto ? ' aff-stage--photo' : ' aff-stage--illus') + '" aria-label="View ' + esc(offer.title) + ' on Amazon">' +
            '<img class="aff-stage-img" src="' + esc(offer.image) + '" alt="' + esc(offer.alt || offer.title) + '" width="400" height="300" loading="' + loadAttr + '" decoding="' + decodeAttr + '">' +
            stageLabel +
          '</a>' +
          photoCreditHtml +
        '</div>'
      );
    }

    return '';
  }

  // 3. GLOBAL COMPACT AMAZON CARD + NON-AMAZON PARTNER CARD RENDERER
  function renderCardHtml(offer, variant, placement) {
    if (!offer) return '';
    var isAmazon = offer.partner === 'amazon';
    if (isAmazon && !isAmazonProductPlacementsEnabled()) return '';

    var ctaAttrs = buildLinkAttrs(offer, placement || variant, 'cta');

    // Unified global compact Amazon product card (.amz-card) — strictly text-only unless authorized Amazon image is supplied
    if (isAmazon) {
      var detailRows = [];
      if (offer.compat) detailRows.push('<p><strong>Compatibility:</strong> ' + esc(offer.compat) + '</p>');
      if (offer.whyConsider) detailRows.push('<p><strong>Why consider it:</strong> ' + esc(offer.whyConsider) + '</p>');
      if (offer.asin) detailRows.push('<p><strong>Verified ASIN:</strong> <code>' + esc(offer.asin) + '</code></p>');
      return (
        '<article class="amz-card amz-card--accent-' + esc(offer.accent || 'cyan') + ' amz-card--text-only" data-product-id="' + esc(offer.id) + '" data-asin="' + esc(offer.asin || '') + '" data-media-mode="text-only" aria-label="' + esc(offer.title) + '">' +
          '<div class="amz-card__body">' +
            '<div class="amz-card__top">' +
              '<span class="amz-card__role">' + esc(offer.badge || offer.category || 'Gear') + '</span>' +
              (offer.brand ? '<span class="amz-card__brand">' + esc(offer.brand) + '</span>' : '') +
              '<span class="amz-card__paid">Paid link</span>' +
            '</div>' +
            '<h3 class="amz-card__title">' + esc(offer.title) + '</h3>' +
            '<p class="amz-card__desc">' + esc(offer.desc) + '</p>' +
            (offer.compat ? '<p class="amz-card__compat-note"><strong>Fits:</strong> ' + esc(offer.compat) + '</p>' : '') +
            '<details class="amz-card__details">' +
              '<summary class="amz-card__details-summary">View specifications &amp; compatibility</summary>' +
              '<div class="amz-card__details-body">' + detailRows.join('') + '</div>' +
            '</details>' +
          '</div>' +
          '<div class="amz-card__foot">' +
            '<a ' + ctaAttrs + ' class="amz-card__cta">View on Amazon <span aria-hidden="true">&rarr;</span></a>' +
            '<p class="amz-card__disclosure">Paid Amazon link &middot; View photos &amp; price on Amazon</p>' +
          '</div>' +
        '</article>'
      );
    }

    var ctaClass = 'aff-cta aff-cta--' + esc(offer.accent || 'cyan');
    var ctaText = esc(offer.cta);
    var disclosureTag = '<span class="aff-disclosure-tag">Partner Link</span>';
    var brandRow = offer.brand ? '<span class="aff-brand-eyebrow">' + esc(offer.brand) + '</span>' : '';
    var compatHtml = offer.compat
      ? '<div class="aff-card-compat"><span class="aff-compat-label">Fits:</span> <span class="aff-compat-val">' + esc(offer.compat) + '</span></div>'
      : '';
    var whyHtml = offer.whyConsider
      ? '<div class="aff-card-why"><span class="aff-why-dot" aria-hidden="true">&#10003;</span> ' + esc(offer.whyConsider) + '</div>'
      : '';

    if (variant === 'compact-inline') {
      return (
        '<aside class="aff-card aff-card--compact aff-card--visual aff-accent-' + esc(offer.accent) + '" aria-label="' + esc(offer.title) + ' (partner link)">' +
          renderMediaHtml(offer, true, false, placement || variant) +
          '<div class="aff-compact-body">' +
            '<div class="aff-meta-row">' + brandRow + '<span class="aff-badge-pill">' + esc(offer.badge) + '</span>' + disclosureTag + '</div>' +
            '<div class="aff-compact-title">' + esc(offer.title) + '</div>' +
            compatHtml + whyHtml +
          '</div>' +
          '<div class="aff-compact-action"><a ' + ctaAttrs + ' class="' + ctaClass + ' aff-cta--sm">' + ctaText + '</a></div>' +
        '</aside>'
      );
    }

    return (
      '<article class="aff-card aff-card--standard aff-card--visual aff-accent-' + esc(offer.accent) + '" aria-label="' + esc(offer.title) + '">' +
        renderMediaHtml(offer, false, false, placement || variant) +
        '<div class="aff-card-body">' +
          '<div class="aff-meta-row">' + brandRow + '<span class="aff-badge-pill">' + esc(offer.badge) + '</span>' + disclosureTag + '</div>' +
          '<h3 class="aff-card-title">' + esc(offer.title) + '</h3>' +
          '<p class="aff-card-desc">' + esc(offer.desc) + '</p>' +
          compatHtml + whyHtml +
        '</div>' +
        '<div class="aff-card-foot">' +
          '<a ' + ctaAttrs + ' class="' + ctaClass + '">' + ctaText + '</a>' +
        '</div>' +
      '</article>'
    );
  }

  // 4. SLOT HTML BUILDER
  function renderSlotHtml(config) {
    var context = config.context || detectDefaultContext();
    var variant = config.variant || 'horizontal-featured';
    var explicitIds = config.products
      ? String(config.products).split(',').map(function(s) { return s.trim(); }).filter(Boolean)
      : null;
    var defaultCount = (variant === 'setup-picks-4' || variant === 'card-grid-4') ? 4
      : (variant === 'setup-picks-3' || variant === 'card-grid-3') ? 3
      : (variant === 'card-grid-2') ? 2 : 1;
    var count = parseInt(config.count, 10) || defaultCount;
    var slotId = config.slotId || (context + '-' + variant);
    var heading = config.heading || '';
    var subheading = config.subheading || '';
    var eyebrow = config.eyebrow || '';
    var gearHubLink = config.hubLink !== '0';

    var gridClass = '';
    if (variant === 'setup-picks-4' || variant === 'card-grid-4') gridClass = 'aff-grid-4';
    else if (variant === 'setup-picks-3' || variant === 'card-grid-3') gridClass = 'aff-grid-3';
    else if (variant === 'card-grid-2') gridClass = 'aff-grid-2';

    if (gridClass) {
      var picks = selectOffers(explicitIds || context, count, slotId, config);
      if (!picks.length) return '';
      var cardsHtml = picks.map(function(o, idx) {
        return renderCardHtml(o, 'standard', slotId + '-' + (idx + 1));
      }).join('');
      if (!heading && !eyebrow) {
        return '<div class="' + gridClass + '">' + cardsHtml + '</div>';
      }
      var headHtml = '<div class="aff-module-head">' +
          '<div>' +
            (eyebrow ? '<span class="aff-module-eyebrow">' + esc(eyebrow) + '</span>' : '') +
            '<h2 class="aff-module-title">' + esc(heading) + '</h2>' +
            (subheading ? '<p class="aff-module-sub">' + esc(subheading) + (gearHubLink ? ' <a href="/gaming-gear/" class="aff-hub-inline-link">Browse Full Gaming Gear Hub \u2192</a>' : '') + '</p>' : '') +
          '</div>' +
          '<span class="aff-disclosure-tag aff-disclosure-tag--sponsored">Sponsored Recommendations</span>' +
        '</div>';
      return (
        '<section class="aff-card-module aff-visual-shop" aria-label="' + esc(heading || 'Gaming Gear Recommendations') + '">' +
          headHtml +
          '<div class="' + gridClass + '">' + cardsHtml + '</div>' +
          '<p class="aff-disclosure-note aff-module-disclosure">' +
            '<strong>Affiliate Disclosure:</strong> ' + AMZ_STATEMENT + ' ' + AMZ_PRICE_NOTE +
          '</p>' +
        '</section>'
      );
    }

    var singleOffer = selectOffers(explicitIds || context, 1, slotId, config);
    if (!singleOffer.length) return '';
    return renderCardHtml(singleOffer[0], variant, slotId);
  }

  // 5. DOM MOUNTING & ANALYTICS CLICK TRACKING
  function isAffiliateClickTrackingEnabled() {
    var cfg = global.SITE_CONFIG;
    return !(cfg && cfg.enableAffiliateClickTracking === false);
  }

  function wrapMainAffiliateTracking() {
    var g = global.GTA6;
    if (!g || typeof g.initAffiliateTracking !== 'function') return false;
    if (g.initAffiliateTracking._gta6Wrapped) return true;
    var origInit = g.initAffiliateTracking;
    var wrapped = function() {
      if (global._gta6MainAffTrackingBound) return;
      global._gta6MainAffTrackingBound = true;
      return origInit.apply(this, arguments);
    };
    wrapped._gta6Wrapped = true;
    g.initAffiliateTracking = wrapped;
    return true;
  }

  // Wrap main.js initAffiliateTracking early if main.js executed before affiliates.js
  wrapMainAffiliateTracking();

  function sendAnonymousClickBeacon(payload) {
    try {
      if (!isAffiliateClickTrackingEnabled()) return;
      var body = JSON.stringify(payload);
      if (global.navigator && typeof global.navigator.sendBeacon === 'function') {
        var blob = new Blob([body], { type: 'application/json' });
        global.navigator.sendBeacon('/api/clicks', blob);
      } else if (typeof global.fetch === 'function') {
        global.fetch('/api/clicks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: body,
          keepalive: true
        }).catch(function() {});
      }
    } catch (err) {}
  }

  function bindAffiliateAnalyticsNow() {
    wrapMainAffiliateTracking();
    if (global._gta6MainAffTrackingBound || global._gta6AffClickBound) return;
    if (!isAffiliateClickTrackingEnabled()) return;
    global._gta6AffClickBound = true;
    document.addEventListener('click', function(e) {
      try {
        if (global._gta6MainAffTrackingBound) return;
        if (!isAffiliateClickTrackingEnabled()) return;
        var link = e.target && e.target.closest ? e.target.closest('a[data-aff-partner], a[href*="amazon.com"], a[href*="amzn.to"]') : null;
        if (!link) return;
        var partner = link.getAttribute('data-aff-partner') || 'amazon';
        var productKey = link.getAttribute('data-aff-product') || link.getAttribute('data-amazon-link') || 'inline';
        var placement = link.getAttribute('data-aff-placement') || 'card';
        var targetUrl = link.getAttribute('href') || '';
        if (typeof global.GTA6Track === 'function') {
          var asinVal = link.getAttribute('data-aff-asin') || '';
          var categoryVal = link.getAttribute('data-aff-category') || '';
          var dailySlotVal = link.getAttribute('data-aff-daily-slot') || 'catalog';
          if (/^\d{4}-\d{2}-\d{2}$/.test(dailySlotVal)) {
            dailySlotVal = 'daily_' + dailySlotVal;
          }
          var destHost = link.getAttribute('data-aff-dest-host') || '';
          if (!destHost && targetUrl) {
            try {
              destHost = new URL(targetUrl, global.location && global.location.origin ? global.location.origin : 'https://www.gta6heistguide.com').hostname.toLowerCase();
            } catch (urlErr) {
              destHost = '';
            }
          }
          var curPath = (global.location && global.location.pathname) ? global.location.pathname : '/';
          var collectionVal = link.getAttribute('data-aff-collection') || '';
          var positionRaw = link.getAttribute('data-aff-position') || '';
          var positionNum = /^[1-9]\d*$/.test(positionRaw) ? Number(positionRaw) : null;
          var trackPayload = {
            merchant: partner,
            partner: partner,
            product_id: productKey || asinVal || partner,
            product_key: productKey,
            asin: asinVal,
            category: categoryVal,
            product_category: categoryVal,
            placement: placement,
            feature_placement: placement,
            daily_editorial_slot: dailySlotVal,
            destination_host: destHost,
            page_path: curPath,
            source_page: curPath,
            event_timestamp: new Date().toISOString(),
            click_area: link.getAttribute('data-aff-area') || 'cta'
          };
          if (collectionVal) {
            trackPayload.collection_id = collectionVal;
          }
          if (positionNum !== null) {
            trackPayload.product_position = positionNum;
          }
          global.GTA6Track('affiliate_click', trackPayload);
        }
        sendAnonymousClickBeacon({
          partner: partner,
          placement: placement + ':' + productKey,
          page_path: (global.location && global.location.pathname) ? global.location.pathname : '/',
          target_url: targetUrl
        });
      } catch (err) {}
    }, { passive: true });
  }

  function bindAffiliateAnalytics() {
    var hasMainTracker = wrapMainAffiliateTracking();
    if (global._gta6MainAffTrackingBound || global._gta6AffClickBound) return;
    if (!isAffiliateClickTrackingEnabled()) return;
    if (hasMainTracker) {
      if (global._gta6AffClickDeferScheduled) return;
      global._gta6AffClickDeferScheduled = true;
      setTimeout(function() {
        global._gta6AffClickDeferScheduled = false;
        bindAffiliateAnalyticsNow();
      }, 0);
      return;
    }
    bindAffiliateAnalyticsNow();
  }

  function mountAllSlots() {
    resetPageRegistry();
    var allowAmazon = isAmazonProductPlacementsEnabled();

    // Sync any static Amazon placement modules marked with data-amazon-placement-module="1"
    document.querySelectorAll('[data-amazon-placement-module="1"]').forEach(function(mod) {
      if (!allowAmazon) {
        mod.hidden = true;
        mod.style.display = 'none';
      } else {
        mod.hidden = false;
        mod.style.display = '';
      }
    });

    if (isBlockedPath()) return;

    document.querySelectorAll('[data-aff-slot]').forEach(function(el) {
      if (el.getAttribute('data-aff-mounted') === '1') return;
      el.setAttribute('data-aff-mounted', '1');
      var cfg = {
        slotId: el.getAttribute('data-aff-slot') || 'slot',
        context: el.getAttribute('data-aff-context') || detectDefaultContext(),
        variant: el.getAttribute('data-aff-variant') || 'horizontal-featured',
        count: el.getAttribute('data-aff-count') || '',
        products: el.getAttribute('data-aff-products') || '',
        eyebrow: el.getAttribute('data-aff-eyebrow') || '',
        heading: el.getAttribute('data-aff-heading') || '',
        subheading: el.getAttribute('data-aff-subheading') || '',
        hubLink: el.getAttribute('data-aff-hub-link') || '1'
      };
      var html = renderSlotHtml(cfg);
      if (html) {
        el.innerHTML = html;
        el.hidden = false;
        el.style.display = '';
      } else {
        el.innerHTML = '';
        el.hidden = true;
        el.style.display = 'none';
      }
    });

    // Upgrade any legacy syndicate affiliate bars cleanly (or suppress when Amazon placements are paused)
    var legacyBars = document.querySelectorAll('.syndicate-aff-bar');
    legacyBars.forEach(function(bar, idx) {
      if (bar.getAttribute('data-aff-upgraded') === '1') return;
      bar.setAttribute('data-aff-upgraded', '1');
      if (!allowAmazon) {
        bar.hidden = true;
        bar.style.display = 'none';
        return;
      }
      if (idx > 0) {
        bar.style.display = 'none';
        return;
      }
      var html = renderSlotHtml({
        slotId: 'legacy-bar-' + idx,
        context: detectDefaultContext(),
        variant: 'compact-inline',
        count: 1
      });
      if (html) {
        var wrapper = document.createElement('div');
        wrapper.className = 'aff-legacy-upgrade';
        wrapper.innerHTML = html;
        bar.parentNode.replaceChild(wrapper, bar);
      } else {
        bar.hidden = true;
        bar.style.display = 'none';
      }
    });
  }

  // Expose API
  global.GTA6AffiliateCards = {
    version: '8.2-phase35.1c',
    catalog: CATALOG,
    contexts: CONTEXT_POOLS,
    isAmazonProductPlacementsEnabled: isAmazonProductPlacementsEnabled,
    resetPageRegistry: resetPageRegistry,
    selectOffers: selectOffers,
    renderCardHtml: renderCardHtml,
    renderSlotHtml: renderSlotHtml,
    mountAll: mountAllSlots,
    getDatabaseHardwareCardHtml: function(slotId, contextOverride) {
      if (isBlockedPath() || !isAmazonProductPlacementsEnabled()) return '';
      return renderSlotHtml({
        slotId: slotId || 'db-hardware-card',
        context: contextOverride || detectDefaultContext(),
        variant: 'compact-inline',
        count: 1
      });
    }
  };

  global.getSyndicateAffBarHtml = function() {
    if (isBlockedPath() || !isAmazonProductPlacementsEnabled()) return '';
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

    bindAffiliateAnalytics();
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
