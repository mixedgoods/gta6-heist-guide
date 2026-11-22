// ==========================================================================
// GTA6HEISTGUIDE.COM — CENTRALIZED AFFILIATE & NATIVE CARD ENGINE (v4.0)
// Single source of truth for Amazon, G2A, Eneba, ExitLag & CutFlow Pro.
// Features:
// - Preserves all exact partner URLs & tracking IDs
// - Session-stable rotation (never shuffles randomly on page refresh)
// - Per-page partner deduplication (no duplicate partners on same page)
// - Contextual page placement (homepage, money, tips, tools, database, map)
// - Native card UI with clear affiliate disclosures & zero fabricated claims
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

  var SESSION_SEED_KEY = 'gta6hg_aff_session_seed_v1';
  var aff = global.GTA6_AFFILIATES;

  var CATALOG = Object.freeze({
    samsung990pro: {
      id: 'samsung990pro',
      partner: 'amazon',
      partnerName: 'Amazon Partner',
      badge: 'PS5 & PC NVMe SSD',
      accent: 'green',
      title: 'Samsung 990 PRO 2TB SSD',
      desc: 'High-speed PCIe 4.0 M.2 NVMe storage built for PlayStation 5 expansion and large open-world installs.',
      benefit: '7,450 MB/s read speeds \u00b7 Ample room for 212 GB+ GTA VI installs',
      cta: 'Check Price on Amazon \u2192',
      url: aff.amazon.links.samsung990pro,
      amazonKey: 'samsung990pro',
      mediaType: 'cover',
      image: '/assets/gear/samsung-990pro.jpg',
      alt: 'Samsung 990 PRO 2TB PCIe 4.0 M.2 NVMe SSD',
      disclosure: 'Affiliate link \u00b7 As an Amazon Associate we earn from qualifying purchases. Prices vary on Amazon.'
    },
    dualsenseEdge: {
      id: 'dualsenseEdge',
      partner: 'amazon',
      partnerName: 'Amazon Partner',
      badge: 'Pro Console Controller',
      accent: 'cyan',
      title: 'DualSense Edge Wireless Controller',
      desc: 'Official PlayStation pro controller with remappable back buttons, 3-stop trigger locks, and swappable stick modules.',
      benefit: 'Faster weapon swaps, cover exits & custom stick deadzones on PS5',
      cta: 'Check Price on Amazon \u2192',
      url: aff.amazon.links.dualsenseEdge,
      amazonKey: 'dualsenseEdge',
      mediaType: 'studio',
      image: '/assets/gear/dualsense-edge.jpg',
      alt: 'PlayStation DualSense Edge Wireless Controller',
      disclosure: 'Affiliate link \u00b7 As an Amazon Associate we earn from qualifying purchases. Prices vary on Amazon.'
    },
    pulseElite: {
      id: 'pulseElite',
      partner: 'amazon',
      partnerName: 'Amazon Partner',
      badge: 'Tempest 3D Audio',
      accent: 'amber',
      title: 'PlayStation PULSE Elite Headset',
      desc: 'Planar magnetic wireless headset tuned for PS5 3D spatial audio, directional sirens, and clean squad voice chat.',
      benefit: 'Crisp spatial cues for stealth heists & all 23 Leonida radio stations',
      cta: 'Check Price on Amazon \u2192',
      url: aff.amazon.links.pulseElite,
      amazonKey: 'pulseElite',
      mediaType: 'studio',
      image: '/assets/gear/pulse-elite.jpg',
      alt: 'PlayStation PULSE Elite Wireless Headset',
      disclosure: 'Affiliate link \u00b7 As an Amazon Associate we earn from qualifying purchases. Prices vary on Amazon.'
    },
    kontrolfreek: {
      id: 'kontrolfreek',
      partner: 'amazon',
      partnerName: 'Amazon Partner',
      badge: 'Aim Precision',
      accent: 'pink',
      title: 'KontrolFreek Galaxy Sticks',
      desc: 'High-rise & mid-rise concave performance thumbsticks engineered to expand analog range of motion.',
      benefit: '+10.2mm right-stick arc sharpens fine aim in 30 FPS console gunfights',
      cta: 'Check Price on Amazon \u2192',
      url: aff.amazon.links.kontrolfreek,
      amazonKey: 'kontrolfreek',
      mediaType: 'studio',
      image: '/assets/gear/kontrolfreek.jpg',
      alt: 'KontrolFreek Galaxy Performance Thumbsticks for PS5',
      disclosure: 'Affiliate link \u00b7 As an Amazon Associate we earn from qualifying purchases. Prices vary on Amazon.'
    },
    g2a: {
      id: 'g2a',
      partner: 'g2a',
      partnerName: 'G2A.COM',
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
      badge: 'Network Routing',
      accent: 'crimson',
      title: 'ExitLag Multi-Path Routing',
      desc: 'Dedicated multi-path connection routing software built for PC gaming traffic optimization across supported titles.',
      benefit: 'Automated route selection & connection stability tools (results vary by ISP & region)',
      cta: 'Explore ExitLag \u2192',
      url: aff.exitlag.url,
      mediaType: 'ui-exitlag',
      image: '/assets/gear/exitlag.webp',
      alt: 'ExitLag Connections Routing Interface',
      disclosure: 'Affiliate link \u00b7 We earn a commission on qualifying ExitLag referrals at no extra cost to you.'
    },
    cutflow: {
      id: 'cutflow',
      partner: 'gumroad',
      partnerName: 'CutFlow Pro',
      badge: 'Offline Creator Tool',
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

  // Contextual slot pools mapped to page types
  var CONTEXT_POOLS = {
    'homepage-hero': ['samsung990pro', 'dualsenseEdge', 'pulseElite', 'kontrolfreek'],
    'homepage-deals': ['g2a', 'eneba', 'cutflow', 'exitlag'],
    'money-top': ['g2a', 'eneba'],
    'money-mid': ['samsung990pro', 'dualsenseEdge', 'kontrolfreek', 'eneba', 'g2a'],
    'money-bottom': ['cutflow', 'pulseElite', 'kontrolfreek', 'samsung990pro'],
    'tips-top': ['dualsenseEdge', 'pulseElite', 'kontrolfreek'],
    'tips-bottom': ['g2a', 'eneba', 'cutflow', 'exitlag'],
    'tools-top': ['exitlag', 'cutflow'],
    'tools-mid': ['cutflow', 'exitlag', 'samsung990pro', 'dualsenseEdge'],
    'database': ['samsung990pro', 'dualsenseEdge', 'pulseElite', 'kontrolfreek'],
    'map': ['dualsenseEdge', 'samsung990pro', 'g2a', 'eneba'],
    'default': ['samsung990pro', 'g2a', 'eneba', 'dualsenseEdge', 'cutflow', 'exitlag']
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

  function getSessionSeed() {
    try {
      var existing = global.sessionStorage.getItem(SESSION_SEED_KEY);
      if (existing !== null && /^\d+$/.test(existing)) {
        return parseInt(existing, 10);
      }
      var seed = Math.floor(Math.random() * 100000);
      global.sessionStorage.setItem(SESSION_SEED_KEY, String(seed));
      return seed;
    } catch (e) {
      // Deterministic daily fallback if sessionStorage is unavailable
      return Math.floor(Date.now() / 86400000) % 10000;
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
    if (p.indexOf('money') !== -1) return 'money-top';
    if (p.indexOf('tips') !== -1 || p.indexOf('secret') !== -1 || p.indexOf('discover') !== -1) return 'tips-top';
    if (p.indexOf('tools') !== -1 || p.indexOf('planner') !== -1 || p.indexOf('calc') !== -1 || p.indexOf('free') !== -1 || p.indexOf('cheat') !== -1 || p.indexOf('live') !== -1) return 'tools-top';
    if (p.indexOf('database') !== -1 || p.indexOf('animal') !== -1 || p.indexOf('vehicle') !== -1 || p.indexOf('weapon') !== -1 || p.indexOf('propert') !== -1 || p.indexOf('radio') !== -1) return 'database';
    if (p.indexOf('map') !== -1) return 'map';
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

    // Pass 1: Strictly avoid duplicate partners anywhere on the same page
    for (var i = 0; i < rotated.length && picked.length < count; i++) {
      var offer = CATALOG[rotated[i]];
      if (!offer) continue;
      if (pageUsedIds[offer.id]) continue;
      if (!options.allowPagePartnerReuse && pageUsedPartners[offer.partner]) continue;
      if (localPartners[offer.partner]) continue;
      picked.push(offer);
      localPartners[offer.partner] = true;
    }

    // Pass 2: If pool had fewer unused partners than count, pull non-duplicate fallback offers from catalog
    if (picked.length < count) {
      var fallbackOrder = ['g2a', 'eneba', 'samsung990pro', 'dualsenseEdge', 'cutflow', 'exitlag', 'pulseElite', 'kontrolfreek'];
      for (var j = 0; j < fallbackOrder.length && picked.length < count; j++) {
        var fb = CATALOG[fallbackOrder[j]];
        if (!fb || pageUsedIds[fb.id] || localPartners[fb.partner]) continue;
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
    if (offer.mediaType === 'ui-exitlag') {
      return (
        '<div class="aff-media aff-media--ui' + (compact ? ' is-compact' : '') + '">' +
          '<img src="' + esc(offer.image) + '" alt="' + esc(offer.alt) + '" loading="lazy" decoding="async">' +
          '<span class="aff-media-brand-pill aff-media-brand-pill--exitlag">ExitLag</span>' +
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
    var mediaCls = offer.mediaType === 'studio' ? 'aff-media aff-media--studio' : 'aff-media aff-media--cover';
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
        '<aside class="aff-card aff-card--compact aff-accent-' + esc(offer.accent) + '" aria-label="Recommended gaming hardware (affiliate link)">' +
          renderMediaHtml(offer, true) +
          '<div class="aff-compact-body">' +
            '<div class="aff-meta-row">' +
              '<span class="aff-partner-pill">' + esc(offer.partnerName) + '</span>' +
              '<span class="aff-badge-pill">' + esc(offer.badge) + '</span>' +
              '<span class="aff-disclosure-tag">Affiliate</span>' +
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

    if (variant === 'sidebar-mini') {
      return (
        '<aside class="aff-card aff-card--sidebar aff-accent-' + esc(offer.accent) + '" aria-label="Recommended partner (affiliate link)">' +
          '<div class="aff-sidebar-top">' +
            renderMediaHtml(offer, true) +
            '<div class="aff-sidebar-info">' +
              '<div class="aff-meta-row">' +
                '<span class="aff-partner-pill">' + esc(offer.partnerName) + '</span>' +
                '<span class="aff-disclosure-tag">Affiliate</span>' +
              '</div>' +
              '<div class="aff-sidebar-title">' + esc(offer.title) + '</div>' +
              '<div class="aff-sidebar-benefit">' + esc(offer.benefit) + '</div>' +
            '</div>' +
          '</div>' +
          '<div class="aff-sidebar-foot">' +
            '<span class="aff-disclosure-micro">Partner link \u00b7 Commission earned at no extra cost</span>' +
            '<a ' + linkAttrs + ' class="aff-cta aff-cta--sm aff-cta--' + esc(offer.accent) + '">' + esc(offer.cta) + '</a>' +
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
            '<span class="aff-badge-pill">' + esc(offer.badge) + '</span>' +
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

    // Standard vertical card (used in 2-card contextual rows)
    return (
      '<article class="aff-card aff-card--standard aff-accent-' + esc(offer.accent) + '">' +
        renderMediaHtml(offer, false) +
        '<div class="aff-card-body">' +
          '<div class="aff-meta-row">' +
            '<span class="aff-partner-pill">' + esc(offer.partnerName) + '</span>' +
            '<span class="aff-badge-pill">' + esc(offer.badge) + '</span>' +
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
    var count = parseInt(config.count, 10) || (variant === 'card-grid-2' ? 2 : 1);
    var slotId = config.slotId || (context + '-' + variant);
    var heading = config.heading || '';
    var subheading = config.subheading || '';
    var offers = selectOffers(context, count, slotId, config);

    if (!offers.length) return '';

    if (variant === 'card-grid-2') {
      var headHtml = heading
        ? '<div class="aff-module-head">' +
            '<div>' +
              '<span class="aff-module-eyebrow">PARTNER RECOMMENDATIONS</span>' +
              '<h2 class="aff-module-title">' + esc(heading) + '</h2>' +
              (subheading ? '<p class="aff-module-sub">' + esc(subheading) + '</p>' : '') +
            '</div>' +
            '<span class="aff-disclosure-tag">Affiliate Disclosure</span>' +
          '</div>'
        : '';
      return (
        '<section class="aff-card-module" aria-label="' + esc(heading || 'Partner recommendations') + '">' +
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
      // Only show up to 1 upgraded card if multiple legacy bars appear on secondary pages
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
    getSessionSeed: getSessionSeed,
    resetPageRegistry: resetPageRegistry,
    selectOffers: selectOffers,
    renderCardHtml: renderCardHtml,
    renderSlotHtml: renderSlotHtml,
    mountAll: mountAllSlots,
    getDatabaseHardwareCardHtml: function(slotId) {
      return renderSlotHtml({
        slotId: slotId || 'db-hardware-card',
        context: 'database',
        variant: 'compact-inline',
        count: 1
      });
    },
    getMapSidebarCardHtml: function(slotId) {
      return renderSlotHtml({
        slotId: slotId || 'map-sidebar-card',
        context: 'map',
        variant: 'sidebar-mini',
        count: 1
      });
    }
  };

  // Backwards-compatible helper: now returns a sleek native card instead of plain-text bar
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

    // Update all dynamic launch-day banners
    document.querySelectorAll('[data-launch-banner], #launchDayBanner').forEach(function(el) {
      el.textContent = bannerText;
    });
    document.querySelectorAll('[data-launch-day-num]').forEach(function(el) {
      el.textContent = "DAY-" + launchDay;
    });

    // Mount native affiliate cards
    mountAllSlots();

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
})(window);
