// ==========================================================================
// GTA 6 HEIST GUIDE v3.2 - LIVE CLIENT ENGINE, D1 SYNC & BOOKMARKS
// ==========================================================================
const GTA6 = {
  Icons: {
    close(size = 14) {
      return `<svg class="ui-icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
    },
    menu(size = 18) {
      return `<svg class="ui-icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>`;
    }
  },
  intelData: null,
  playBeep() {},
  playSuccess() {},

  showToast(message) {
    let toast = document.getElementById('gtaToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'gtaToast';
      toast.className = 'gta-toast';
      document.body.appendChild(toast);
    }
    toast.innerText = message;
    toast.classList.add('show');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => toast.classList.remove('show'), 3200);
  },

  href(l) {
    const v = String(l || '');
    if (/^(https?:|\/|#|mailto:)/.test(v)) return v;
    return '/' + v;
  },

  applyWeeklyBadges(v) {
    const targetSlug = (v && (v.slug || '').replace(/\.html$/, '')) || 'leonida-reserve';
    const targetBonus = (v && v.bonusPayout) || '$250,000';
    document.querySelectorAll('.bonus-badge[data-vault-slug]').forEach((b) => {
      const bSlug = (b.dataset.vaultSlug || '').replace(/\.html$/, '');
      const on = bSlug === targetSlug;
      b.style.display = on ? 'block' : 'none';
      const amt = b.querySelector('.bonus-amt');
      if (on && amt) amt.textContent = targetBonus;
    });
    const bonusNameEl = document.getElementById('vaultGridBonusName');
    if (bonusNameEl && v && v.name) bonusNameEl.textContent = v.name;
    const bonusPayoutEl = document.getElementById('vaultGridBonusPayout');
    if (bonusPayoutEl && v && v.bonusPayout) bonusPayoutEl.textContent = `${v.bonusPayout} Bonus Payout Active`;
  },

  heistTier(target) {
    const t = String(target || '');
    if (/VCIA|Large Bank/i.test(t)) return 'Mastermind';
    if (/Sinfrontera|Cartel/i.test(t)) return 'Expert';
    return 'Intermediate';
  },

  complementRole(role) {
    const r = String(role || '');
    if (/Hacker/i.test(r)) return 'Mastermind + Enforcer';
    if (/Wheelman/i.test(r)) return 'Ghost Hacker + Enforcer';
    if (/Enforcer/i.test(r)) return 'Ghost Hacker + Wheelman';
    return 'Ghost Hacker + Wheelman';
  },

  buildDiscordCard(s) {
    const needed = s.roleNeeded || this.complementRole(s.role);
    const lines = [
      '🎯 **GTA 6 HEIST SQUAD — LFG**',
      `🏦 **Target:** ${s.targetHeist}`,
      `💀 **Difficulty:** ${this.heistTier(s.targetHeist)}`,
      `🧩 **Role Needed:** ${needed}`,
      `💰 **Cut:** ${s.cutOffered || '25% Equal Split'}`,
      `🎮 **Platform:** ${s.platform}`,
      `🎙️ **Mic:** ${s.micRequired || 'Mic Optional'}`,
      `👤 **Host:** ${s.callsign} (${s.role})`,
      `➕ **Add:** ${s.contactTag}`,
    ];
    if (s.notes) lines.push(`📝 ${s.notes}`);
    lines.push('🔗 Open Leonida Map: https://www.gta6heistguide.com/map');
    return lines.join('\n');
  },

  copyDiscordCard(id) {
    const allCards = [...(this.getRecommendedSquadTemplates ? this.getRecommendedSquadTemplates() : []), ...(this.cachedSquads || [])];
    const sq = allCards.find((x) => x.id === id);
    if (!sq) return;
    this.copyText(this.buildDiscordCard(sq), 'Discord LFG Card');
  },

  prefillLfgFromTemplate(templateId) {
    const tpl = (this.getRecommendedSquadTemplates ? this.getRecommendedSquadTemplates() : []).find((x) => x.id === templateId);
    const form = document.getElementById('lfgPostForm');
    if (form) {
      if (tpl) {
        const hEl = document.getElementById('lfgHeist');
        if (hEl && tpl.targetHeist) {
          for (const opt of hEl.options) {
            if (opt.value.includes(tpl.targetHeist.split('(')[0].trim())) {
              hEl.value = opt.value;
              break;
            }
          }
        }
        const nEl = document.getElementById('lfgNotes');
        if (nEl && tpl.notes) nEl.value = tpl.notes;
      }
      form.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const contactInput = document.getElementById('lfgContact');
      if (contactInput) setTimeout(() => contactInput.focus(), 400);
      this.playBeep(520, 'triangle', 0.05);
      this.showToast('✍️ Enter your real PSN / Xbox / Discord tag below to publish your Day-1 Squad!');
    } else {
      window.location.href = '/map.html';
    }
  },

  SiteConfig: {
    defaults: {
      siteName: 'GTA6HeistGuide.com',
      domain: 'https://www.gta6heistguide.com',
      ownerContactEmail: 'inquiries@gta6heistguide.com',
      amazonTag: 'gta6heistguid-20',
      exitLagUrl: 'https://www.exitlag.com/refer/10386953',
      g2aUrl: 'https://www.g2a.com/n/reflink-4094b9aab5',
      
      gumroadUrl: 'https://apexlocallabs.gumroad.com/l/cutflow-pro',
      gumroadBundleUrl: 'https://apexlocallabs.gumroad.com/l/apex-pro-bundle',
      getApexLocalUrl: 'https://getapexlocal.com',
      getApexLocalPartnersUrl: 'https://getapexlocal.com/partners',
      adsensePublisherId: '',
      ga4MeasurementId: '',
      enableAffiliateClickTracking: true,
    },

    get() {
      const ext = typeof window !== 'undefined' && window.SITE_CONFIG && typeof window.SITE_CONFIG === 'object'
        ? window.SITE_CONFIG
        : {};
      return Object.assign({}, this.defaults, ext);
    },

    buildAmazonUrl(rawUrl) {
      const cfg = this.get();
      try {
        const u = new URL(rawUrl);
        if (/(^|\.)amazon\./i.test(u.hostname)) {
          u.searchParams.set('tag', cfg.amazonTag || this.defaults.amazonTag);
          return u.toString();
        }
      } catch (e) {}
      return rawUrl;
    },

    detectPartnerFromHref(href) {
      if (!href) return null;
      const low = String(href).toLowerCase();
      if (low.includes('amazon.com') || low.includes('amzn.to')) return 'amazon';
      if (low.includes('g2a.com')) return 'g2a';
      if (low.includes('exitlag.com')) return 'exitlag';
      if (low.includes('gumroad.com')) return 'gumroad';
      if (low.includes('getapexlocal.com')) return 'getapexlocal';
      return null;
    },

    ensureSponsoredRel(a) {
      const existing = String(a.getAttribute('rel') || '').split(/\s+/).filter(Boolean).map((t) => t.toLowerCase());
      const out = ['sponsored', 'nofollow', 'noopener'];
      if (existing.includes('noreferrer')) out.push('noreferrer');
      existing.forEach((t) => { if (!out.includes(t)) out.push(t); });
      a.setAttribute('rel', out.join(' '));
    },

    applyToDom() {
      const cfg = this.get();
      document.querySelectorAll('a[href]').forEach((a) => {
        const rawHref = a.getAttribute('href') || '';
        if (!rawHref) return;
        const low = rawHref.toLowerCase();
        if (low.includes('amazon.com') || low.includes('amzn.to')) {
          a.href = this.buildAmazonUrl(rawHref);
          if (!a.getAttribute('data-aff-partner')) a.setAttribute('data-aff-partner', 'amazon');
          this.ensureSponsoredRel(a);
        } else if (low.includes('exitlag.com')) {
          a.href = cfg.exitLagUrl;
          if (!a.getAttribute('data-aff-partner')) a.setAttribute('data-aff-partner', 'exitlag');
          this.ensureSponsoredRel(a);
        } else if (low.includes('g2a.com')) {
          a.href = cfg.g2aUrl;
          if (!a.getAttribute('data-aff-partner')) a.setAttribute('data-aff-partner', 'g2a');
          this.ensureSponsoredRel(a);
        } else if (low.includes('gumroad.com')) {
          a.href = low.includes('cutflow-pro')
            ? (cfg.gumroadCutFlowUrl || cfg.gumroadUrl || 'https://apexlocallabs.gumroad.com/l/cutflow-pro')
            : (cfg.gumroadBundleUrl || 'https://apexlocallabs.gumroad.com/l/apex-pro-bundle');
          if (!a.getAttribute('data-aff-partner')) a.setAttribute('data-aff-partner', 'gumroad');
          this.ensureSponsoredRel(a);
        } else if (low.includes('getapexlocal.com/partners')) {
          a.href = cfg.getApexLocalPartnersUrl;
          if (!a.getAttribute('data-aff-partner')) a.setAttribute('data-aff-partner', 'getapexlocal');
        } else if (low.includes('getapexlocal.com')) {
          a.href = cfg.getApexLocalUrl;
          if (!a.getAttribute('data-aff-partner')) a.setAttribute('data-aff-partner', 'getapexlocal');
        } else if (low.startsWith('mailto:') && (low.includes('inquiries@gta6heistguide.com') || a.hasAttribute('data-owner-email'))) {
          a.href = `mailto:${cfg.ownerContactEmail}`;
          if (a.textContent.includes('inquiries@gta6heistguide.com') || a.hasAttribute('data-owner-email')) {
            a.textContent = cfg.ownerContactEmail;
          }
        }
      });

      document.querySelectorAll('[data-owner-email-text]').forEach((el) => {
        el.textContent = cfg.ownerContactEmail;
      });

      document.querySelectorAll('.footer-disclaimer, .disclaimer-box').forEach((box) => {
        box.querySelectorAll('code').forEach((codeEl) => {
          if (codeEl.textContent.trim() === this.defaults.amazonTag || codeEl.hasAttribute('data-config-amazon-tag')) {
            codeEl.textContent = cfg.amazonTag;
          }
        });
      });

      document.querySelectorAll('[data-config-amazon-tag]').forEach((el) => {
        el.textContent = cfg.amazonTag;
      });
    },

    initOptionalScripts() {
      const cfg = this.get();
      const pubId = String(cfg.adsensePublisherId || '').trim();
      if (/^ca-pub-\d{8,}$/i.test(pubId)) {
        if (!document.querySelector('script[data-gta6-adsense], script[src*="pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]')) {
          const s = document.createElement('script');
          s.async = true;
          s.crossOrigin = 'anonymous';
          s.setAttribute('data-gta6-adsense', pubId);
          s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(pubId)}`;
          document.head.appendChild(s);
        }
        document.querySelectorAll('.adsense-slot, .gta-ad-slot').forEach((slot) => {
          const slotId = String(slot.getAttribute('data-ad-slot') || '').trim();
          if (!/^\d{6,}$/.test(slotId)) return;
          slot.style.display = 'block';
          if (!slot.querySelector('ins.adsbygoogle')) {
            const ins = document.createElement('ins');
            ins.className = 'adsbygoogle';
            ins.style.display = 'block';
            ins.setAttribute('data-ad-client', pubId);
            ins.setAttribute('data-ad-slot', slotId);
            ins.setAttribute('data-ad-format', 'auto');
            ins.setAttribute('data-full-width-responsive', 'true');
            slot.appendChild(ins);
            try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) {}
          }
        });
      }

      const gaId = String(cfg.ga4MeasurementId || '').trim();
      if (window.GTA6Privacy && typeof window.GTA6Privacy.initGa4 === 'function') {
        window.GTA6Privacy.initGa4(gaId);
      } else {
        const analyticsOptedOut = !!(window.GTA6Privacy && typeof window.GTA6Privacy.isAnalyticsOptedOut === 'function' && window.GTA6Privacy.isAnalyticsOptedOut());
        const isAdminRoute = /^\/(?:cd-admin|syndicate-command)/i.test(window.location.pathname || '/');
        if (!analyticsOptedOut && !isAdminRoute && !window._gta6Ga4Initialized && /^G-[A-Z0-9]+$/i.test(gaId) && !document.querySelector('script[data-gta6-ga4], script[src*="googletagmanager.com/gtag/js"]')) {
          window._gta6Ga4Initialized = true;
          window.dataLayer = window.dataLayer || [];
          window.gtag = function gtag() { window.dataLayer.push(arguments); };
          const cleanPath = window.location.pathname || '/';
          const cleanLocation = (window.location.origin || '') + cleanPath;
          let cleanReferrer = '';
          try {
            if (document.referrer) {
              const refUrl = new URL(document.referrer);
              if (refUrl.protocol === 'http:' || refUrl.protocol === 'https:') {
                cleanReferrer = `${refUrl.protocol}//${refUrl.host}${refUrl.pathname || '/'}`;
              }
            }
          } catch (e) {}
          window.gtag('consent', 'default', {
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied',
          });
          window.gtag('set', {
            page_location: cleanLocation,
            page_referrer: cleanReferrer,
          });
          window.gtag('js', new Date());
          window.gtag('config', gaId, {
            anonymize_ip: true,
            allow_google_signals: false,
            allow_ad_personalization_signals: false,
            page_location: cleanLocation,
            page_referrer: cleanReferrer,
            page_path: cleanPath,
            send_page_view: true,
          });
          const s = document.createElement('script');
          s.async = true;
          s.setAttribute('data-gta6-ga4', gaId);
          s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`;
          document.head.appendChild(s);
        }
      }
    },

    init() {
      this.applyToDom();
      this.initOptionalScripts();
    },
  },

  initAffiliateTracking() {
    if (window._gta6MainAffListenerAttached) return;
    window._gta6MainAffListenerAttached = true;
    window._gta6MainAffTrackingBound = true;
    document.addEventListener('click', (e) => {
      const cfg = this.SiteConfig ? this.SiteConfig.get() : { enableAffiliateClickTracking: true };
      const anchor = e.target.closest('a[href], [data-aff-partner]');
      if (!anchor) return;
      const href = anchor.getAttribute('href') || anchor.href || '';
      const partner = (
        anchor.getAttribute('data-aff-partner') ||
        (this.SiteConfig ? this.SiteConfig.detectPartnerFromHref(href) : null)
      );
      if (!partner) return;
      const placement = anchor.getAttribute('data-aff-placement') || 'sitewide';
      const targetUrl = anchor.href || href;
      const payload = {
        partner: String(partner).toLowerCase(),
        placement,
        page_path: window.location.pathname || '/',
        target_url: targetUrl,
      };
      try {
        const stored = localStorage.getItem('gta6_aff_clicks') || '[]';
        const arr = JSON.parse(stored);
        arr.push(Object.assign({}, payload, { ts: new Date().toISOString() }));
        if (arr.length > 120) arr.shift();
        localStorage.setItem('gta6_aff_clicks', JSON.stringify(arr));
      } catch (err) {}

      if (cfg.enableAffiliateClickTracking === false) return;
      try {
        if (typeof window.GTA6Track === 'function') {
          const asinMatch = String(targetUrl).match(/\/dp\/([A-Z0-9]{10})/i);
          const pNorm = payload.partner;
          const programMap = {
            amazon: { program: 'amazon_associates', name: 'Amazon Associates' },
            g2a: { program: 'g2a_goldmine', name: 'G2A Goldmine' },
            exitlag: { program: 'exitlag_affiliate', name: 'ExitLag' },
            gumroad: { program: 'gumroad_direct', name: 'Gumroad' },
            getapexlocal: { program: 'getapexlocal_owned', name: 'GetApexLocal' },
          };
          const progMeta = programMap[pNorm] || { program: pNorm, name: pNorm };
          let destHostname = anchor.getAttribute('data-aff-dest-host') || '';
          if (!destHostname && targetUrl) {
            try {
              destHostname = new URL(targetUrl, window.location.origin).hostname.toLowerCase();
            } catch (urlErr) {
              destHostname = '';
            }
          }
          const attrCategory = anchor.getAttribute('data-aff-category') || '';
          const productCategory = attrCategory || (pNorm === 'amazon'
            ? 'amazon_hardware'
            : pNorm === 'gumroad'
              ? 'creator_tool'
              : pNorm === 'exitlag'
                ? 'network_tool'
                : pNorm === 'g2a'
                  ? 'gaming_store'
                  : 'affiliate_partner');
          const curPath = window.location.pathname || '/';
          const trackPayload = {
            merchant: pNorm,
            affiliate_program: progMeta.program,
            partner_name: progMeta.name,
            destination_category: pNorm,
            category: productCategory,
            product_category: productCategory,
            product_id: anchor.getAttribute('data-aff-product') || (asinMatch ? asinMatch[1].toUpperCase() : pNorm),
            asin: anchor.getAttribute('data-aff-asin') || (asinMatch ? asinMatch[1].toUpperCase() : ''),
            placement: String(placement || 'sitewide').slice(0, 48),
            feature_placement: String(placement || 'sitewide').slice(0, 48),
            destination_hostname: destHostname,
            page_path: curPath,
            source_page: curPath,
            event_timestamp: new Date().toISOString(),
            interaction_type: 'outbound_click',
          };
          const colAttr = anchor.getAttribute('data-aff-collection') || '';
          const posAttr = anchor.getAttribute('data-aff-position') || '';
          if (colAttr) trackPayload.collection_id = colAttr;
          if (/^[1-9]\d*$/.test(posAttr)) {
            trackPayload.product_position = Number(posAttr);
            trackPayload.feature_position = Number(posAttr);
          }
          window.GTA6Track('affiliate_click', trackPayload);
        }
      } catch (err) {}
      try {
        const json = JSON.stringify(payload);
        if (navigator.sendBeacon) {
          navigator.sendBeacon('/api/clicks', new Blob([json], { type: 'application/json' }));
        } else {
          fetch('/api/clicks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: json,
            keepalive: true,
          }).catch(() => {});
        }
      } catch (err) {}
    });
  },

  copyText(text, label = 'Copied') {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        this.playSuccess();
        this.showToast(`✅ ${label} copied` + (String(text).length < 60 ? `: ${text}` : ' — paste it in Discord!'));
      }).catch(() => {
        window.prompt(`Copy ${label}:`, text);
      });
    } else {
      window.prompt(`Copy ${label}:`, text);
    }
  },

  // --------------------------------------------------------------------------
  // PERPETUAL MULTI-MODE COUNTDOWNS (LAUNCH + WEEKLY THURSDAY RESET)
  // --------------------------------------------------------------------------
  getNextThursdayUTC(now = new Date()) {
    const next = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 10, 0, 0, 0));
    const day = next.getUTCDay();
    let daysUntil = (4 - day + 7) % 7;
    if (daysUntil === 0 && now.getTime() >= next.getTime()) {
      daysUntil = 7;
    }
    next.setUTCDate(next.getUTCDate() + daysUntil);
    return next.getTime();
  },

  formatDiff(ms) {
    if (ms <= 0) return '0d 0h 0m 0s';
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((ms % (1000 * 60)) / 1000);
    return `${days}d ${hours}h ${mins}m ${secs}s`;
  },

  initCountdown() {
    const launchTarget = Date.parse('2026-11-19T00:00:00Z'); // Nov 19, 2026 00:00 UTC
    const launchEl = document.getElementById('countdownTimer');
    const weeklyEl = document.getElementById('weeklyResetTimer');

    const update = () => {
      const now = Date.now();
      const diff = launchTarget - now;
      const launchDay = Math.max(1, Math.floor((now - launchTarget) / 86400000) + 1);
      const liveBannerText = 'Story Mode: LIVE · GTA 6 Online: No official release date announced';
      if (launchEl) {
        launchEl.innerText = diff <= 0 ? liveBannerText : this.formatDiff(diff);
      }
      if (diff <= 0) {
        document.querySelectorAll('.launch-mode-label, [data-launch-banner], #launchDayBanner').forEach((el) => {
          el.innerText = liveBannerText;
        });
        // Launch-day counter removed: pages show a real last-verified date via assets/js/site-status.js
      }
      if (weeklyEl) {
        const nextReset = this.getNextThursdayUTC(new Date(now));
        weeklyEl.innerText = this.formatDiff(nextReset - now);
      }
    };

    update();
    setInterval(update, 60000);
  },

  initFAQ() {
    document.querySelectorAll('.faq-question').forEach((q) => {
      q.addEventListener('click', () => {
        q.parentElement.classList.toggle('open');
        GTA6.playBeep(320, 'sine', 0.04);
      });
    });
  },

  // --------------------------------------------------------------------------
  // LIVE AUTO-UPDATING WEEKLY META & CRUCIAL INTEL ENGINE
  // --------------------------------------------------------------------------
  getDeterministicIntelFallback() {
    const V = (slug, name, base, bonus, approach, spot, summary) => ({
      slug, name, bonusTag: 'VERIFIED STORY / LAUNCH TARGET', basePayout: base, bonusPayout: bonus,
      recommendedApproach: approach, specialistSpotlight: spot, summary,
    });
    const rotation = [
      V('cartel-heist', 'The Cartel Heist: Sinfrontera National Bank', '$120,000', '$120,000', 'Rig 3 Cell Towers (10:47 Vault Time)', 'Raul Bautista Lead Operative', 'Chapter 3 Story Heist #1 (Mission #71). 5 setups + 10-step vault job paying $120,000. Unlocks Break the Bank trophy.'),
      V('vcia-takedown', 'VCIA Takedown: Vice City Airport Heist', '$200,000', '$250,000', 'Roof Terminal Stealth & Cargo Plane', 'NOOSE Countermeasure Overwatch', 'Chapter 4 4-part airport finale. Tarmac gunfight and cargo plane escape. Unlocks Hi-Jacked trophy.'),
      V('large-banks', '22 Free-Roam Banks: Lombank Downtown', '$65,000', '$205,000', 'Dye Pack Jammer + Trunk Stash', 'Yasmani Little Cuba Fence (5% Cut)', 'Repeatable large bank vault run paying up to $205,000. Fence marked bills in Little Cuba.'),
      V('small-banks', '22 Free-Roam Banks: 14 Small Vaults & Fleeca', '$5,000', '$45,000', 'Keypad Decryption Drill', 'Rapid Getaway Driver', '14 repeatable small bank vaults across Vice City and Leonida Keys.'),
      V('illegal-ops', '40 Gang Hideouts & 20 Jewelry Stores', '$15,000', '$35,000', 'Verified Safe Codes: 7700, 0420, 0300, 4444', 'BuckMe ATM Deposit', 'Fast free-roam cash targets across Leonida. Deposit cash to avoid $20,000 pocket cap.'),
    ];
    const now = new Date();
    const cycle = Math.floor((now.getTime() - 10 * 3600 * 1000) / (7 * 86400 * 1000));
    const weekNum = cycle;
    const vault = rotation[(((cycle + 2) % rotation.length) + rotation.length) % rotation.length];
    return {
      isoWeek: 47,
      featuredVault: vault,
      intelFeed: [
        {
          id: 'intel-launch',
          category: 'official',
          badge: 'OFFICIAL INTEL',
          title: 'Launch Readiness Protocol: PS5 Pro & Gen4 NVMe Streaming + Day-1 Patch Windows',
          date: now.toISOString().slice(0, 10),
          summary: 'Ensure 7,000+ MB/s Gen4 NVMe storage and configure optimal 30 FPS console display settings for smooth gameplay.',
          link: 'gameplay-mechanics.html',
        },
        {
          id: 'intel-meta',
          category: 'meta',
          badge: 'LAUNCH INTEL',
          title: `Verified Target: ${vault.name} (${vault.bonusPayout} Potential)`,
          date: now.toISOString().slice(0, 10),
          summary: `${vault.summary} Recommended: ${vault.recommendedApproach}.`,
          link: vault.slug,
        },
        {
          id: 'intel-map',
          category: 'map',
          badge: 'MAP UPDATE',
          title: 'Interactive Leonida Radar Calibrated: 6 Vault Pins, Sewer Conduits & Canal Exits',
          date: now.toISOString().slice(0, 10),
          summary: 'Live GPS pins across Vice City Downtown, Pelican Valley, Port Gellhorn, and Grassrivers channels.',
          link: '/map',
        },
      ],
    };
  },

  async initIntelFeed() {
    let data = null;
    const fetchWithTimeout = async (url, ms = 2000) => {
      if (typeof AbortController === 'undefined') return fetch(url).catch(() => null);
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), ms);
      try {
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timer);
        return res;
      } catch (err) {
        clearTimeout(timer);
        return null;
      }
    };
    try {
      const res = await fetchWithTimeout('/api/intel', 1800);
      if (res && res.ok) data = await res.json();
    } catch (e) {}

    if (!data || !data.featuredVault) {
      try {
        const res2 = await fetchWithTimeout('/data/live_intel.json', 1500);
        if (res2 && res2.ok) {
          const liveJson = await res2.json();
          const fallback = this.getDeterministicIntelFallback();
          if (liveJson && Array.isArray(liveJson.intelFeed) && liveJson.intelFeed.length > 0) {
            fallback.intelFeed = liveJson.intelFeed.map((item) => ({
              id: item.id || ('intel-' + Math.random().toString(36).slice(2)),
              category: /cheat/i.test(item.category || item.badge) ? 'meta' : /cash|money/i.test(item.category || item.badge) ? 'meta' : /setting|ps5|hardware/i.test(item.category || item.badge) ? 'hardware' : 'official',
              badge: item.badge || 'LIVE INTEL',
              title: item.title,
              date: item.pubDate ? new Date(item.pubDate).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
              source_name: item.source || 'Syndicate Intel Wire',
              summary: item.summary,
              link: item.link || 'live-intel.html'
            }));
          }
          data = fallback;
        }
      } catch (e2) {}
    }

    if (!data || !data.featuredVault) {
      data = this.getDeterministicIntelFallback();
    }
    this.intelData = data;
    this.intelById = {};
    (data.intelFeed || []).forEach((item) => {
      if (item && item.id) this.intelById[item.id] = item;
    });

    const v = data.featuredVault;
    const setText = (id, val) => {
      const el = document.getElementById(id);
      if (el && val) el.innerText = val;
    };
    setText('weeklyVaultName', v.name);
    setText('weeklyVaultPayout', `${v.bonusPayout} Potential`);
    setText('weeklyVaultSummary', v.summary);
    setText('weeklyVaultApproach', v.recommendedApproach);
    setText('weeklyVaultSpecialist', v.specialistSpotlight);
    setText('intelWeekBadge', `Week ${data.isoWeek} Auto-Sync Active`);

    const linkEl = document.getElementById('weeklyVaultLink');
    if (linkEl && v.slug) linkEl.href = this.href(v.slug);

    this.renderIntelCards(this.currentIntelFilter);
    this.applyWeeklyBadges(v);
    if (typeof window.onWeeklyVaultReady === 'function') window.onWeeklyVaultReady(v);

    const params = new URLSearchParams(window.location.search);
    const openGuideId = params.get('guide');
    if (openGuideId && this.intelById[openGuideId]) {
      this.openDynamicGuide(openGuideId);
    }
  },

  filterIntel(category, btnEl) {
    this.currentIntelFilter = category;
    document.querySelectorAll('.intel-filter-btn').forEach((b) => b.classList.remove('active'));
    if (btnEl) btnEl.classList.add('active');
    this.renderIntelCards(category);
    this.playBeep(460, 'sine', 0.04);
  },

  renderIntelCards(category = 'all') {
    const container = document.getElementById('intelFeedContainer');
    if (!container) return;

    const domCards = container.querySelectorAll('.card[data-category]');
    if (domCards.length > 0) {
      domCards.forEach((c) => {
        const cat = c.getAttribute('data-category');
        c.style.display = (category === 'all' || cat === category) ? 'flex' : 'none';
      });
      return;
    }

    if (!this.intelData) return;

    const items = (this.intelData.intelFeed || []).filter(
      (item) => category === 'all' || item.category === category
    );

    container.innerHTML = items
      .map(
        (item) => `
      <div class="card">
        <div>
          <span class="card-tag ${item.category === 'official' ? 'tag-mastermind' : item.category === 'meta' ? 'tag-expert' : 'tag-intermediate'}">${item.badge}</span>
          <div style="font-size:0.75rem; color:var(--text-muted); margin-bottom:0.4rem;">Updated: ${item.date} &bull; ${item.source_name ? item.source_name : 'DMCA-Safe Syndicate Intel'}</div>
          <h3 class="card-title">${item.title}</h3>
          <p class="card-desc">${item.summary}</p>
        </div>
        ${
          item.full_guide_html
            ? `<button type="button" class="btn btn-primary" style="padding: 0.55rem 1rem; font-size: 0.82rem; width:100%;" onclick="GTA6.openDynamicGuide('${item.id}')">📖 Read Full Tactical Guide</button>`
            : `<a href="${GTA6.href(item.link)}" class="btn btn-secondary" style="padding: 0.5rem 1rem; font-size: 0.82rem;">Open Tactical Breakdown &rarr;</a>`
        }
      </div>
    `
      )
      .join('');
  },

  openDynamicGuide(id) {
    const item = this.intelById && this.intelById[id];
    if (!item) return;

    let modal = document.getElementById('dynamicGuideModal');
    if (!modal) {
      const wrap = document.createElement('div');
      wrap.innerHTML = `
        <div class="modal-backdrop" id="dynamicGuideModal">
          <div class="modal-box" style="max-width:780px; border-color:var(--neon-cyan);">
            <button type="button" class="modal-close-btn" onclick="GTA6.closeDynamicGuide()" aria-label="Close Guide Modal">${this.Icons.close(15)}</button>
            <div id="dynamicGuideModalBody"></div>
          </div>
        </div>
      `;
      document.body.appendChild(wrap);
      modal = document.getElementById('dynamicGuideModal');
    }

    const bodyEl = document.getElementById('dynamicGuideModalBody');
    const safeBookmarkTitle = String(item.title).replace(/'/g, "\\'");
    bodyEl.innerHTML = `
      <div style="margin-bottom:1.1rem; padding-right:2rem;">
        <span class="user-badge badge-hacker" style="margin-bottom:0.5rem;">${item.badge}</span>
        <div style="font-size:0.8rem; color:var(--text-muted); margin-bottom:0.4rem;">Published: ${item.date} &bull; Source: ${item.source_name || 'Syndicate Autonomous Engine'}</div>
        <h2 style="color:#fff; font-size:1.55rem; line-height:1.25;">${item.title}</h2>
      </div>
      <div style="margin-bottom:1.25rem; display:flex; gap:0.75rem; flex-wrap:wrap;">
        <button type="button" class="btn btn-secondary" style="padding:0.45rem 0.9rem; font-size:0.8rem;" onclick="GTA6.Bookmarks.addItem({id:'dyn-${item.id}', title:'${safeBookmarkTitle}', summary:'Dynamic Syndicate Guide (${item.date})', url:'live-intel.html?guide=${item.id}'})">⭐ Bookmark This Guide</button>
        <button type="button" class="btn btn-primary" style="padding:0.45rem 0.9rem; font-size:0.8rem;" onclick="GTA6.copyText(window.location.origin + '/live-intel.html?guide=${item.id}', 'Dynamic Guide Link')">🔗 Share Guide Link</button>
      </div>
      <div style="border-top:1px solid var(--border-card); padding-top:1rem;">
        ${item.full_guide_html || `<p style="color:var(--text-muted);">${item.summary}</p>`}
      </div>
    `;
    modal.classList.add('open');
    this.playSuccess();
  },

  closeDynamicGuide() {
    const modal = document.getElementById('dynamicGuideModal');
    if (modal) modal.classList.remove('open');
  },

  // --------------------------------------------------------------------------
  // OPERATIVE PROFILE MANAGEMENT & VIP EMAIL UNLOCK SYSTEM
  // --------------------------------------------------------------------------
  getProfile() {
    const defaultProfile = {
      alias: 'ViceOperative_99',
      role: 'Mastermind',
      badgeClass: 'badge-mastermind',
      platform: 'PS5 Pro & PC',
      bio: 'Stealth infiltration specialist. Clean vault extraction & zero casualty runs.',
      avatar: '/assets/avatar-mastermind.png',
      banner: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1200&q=80',
      heistsPlanned: 12,
      totalPayout: '$148,500,000',
      syndicateRep: 1240,
      email: '',
      discordTag: '',
      vipVerified: false,
      perkCode: '',
    };
    const merged = Object.assign(
      defaultProfile,
      JSON.parse(localStorage.getItem('gta6_user_profile') || '{}')
    );
    if (merged.avatar && merged.avatar.includes('1566492031773')) {
      merged.avatar = '/assets/avatar-mastermind.png';
      this.saveProfile(merged);
    }
    return merged;
  },

  saveProfile(profile) {
    localStorage.setItem('gta6_user_profile', JSON.stringify(profile));
  },

  initProfilePage() {
    const profile = this.getProfile();
    const bindVal = (id, val) => {
      const el = document.getElementById(id);
      if (el && val !== undefined) el.value = val;
    };
    const bindText = (id, val) => {
      const el = document.getElementById(id);
      if (el && val !== undefined) el.innerText = val;
    };

    bindVal('profAlias', profile.alias);
    bindVal('profRole', profile.role);
    bindVal('profPlatform', profile.platform);
    bindVal('profBio', profile.bio);
    bindVal('profAvatarInput', profile.avatar);
    bindVal('profBannerInput', profile.banner);
    bindVal('profDiscordInput', profile.discordTag || '');

    const avatarImg = document.getElementById('profAvatarDisplay');
    const bannerBox = document.getElementById('profBannerDisplay');
    if (avatarImg) avatarImg.src = profile.avatar;
    if (bannerBox) bannerBox.style.backgroundImage = `url('${profile.banner}')`;

    bindText('headerAliasDisplay', profile.alias);
    bindText('headerBioDisplay', profile.bio);
    const badgeEl = document.getElementById('headerBadgeDisplay');
    if (badgeEl) {
      badgeEl.innerText = profile.role;
      badgeEl.className = `user-badge ${profile.badgeClass}`;
    }

    const buildsCount = this.Bookmarks.getAll().length;
    bindText('statPlanned', String((profile.heistsPlanned || 12) + buildsCount));
    bindText('statPayout', profile.totalPayout || '$148.5M');
    bindText('statRep', Number(profile.syndicateRep || 1240).toLocaleString());
    bindText('statPlatform', profile.platform || 'PS5 Pro & PC');

    const vipBadgeBox = document.getElementById('profileVipStatusBox');
    if (vipBadgeBox) {
      vipBadgeBox.innerHTML = `<a href="/save-planner" class="btn btn-secondary" style="padding:0.45rem 1rem; font-size:0.8rem;">💾 Open 15-Slot Save Planner</a>`;
    }

    const form = document.getElementById('profileEditForm');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        profile.alias = document.getElementById('profAlias').value.trim() || 'ViceOperative_99';
        profile.role = document.getElementById('profRole').value;
        profile.platform = document.getElementById('profPlatform').value;
        profile.bio = document.getElementById('profBio').value.trim();
        profile.avatar = document.getElementById('profAvatarInput').value.trim() || profile.avatar;
        profile.banner = document.getElementById('profBannerInput').value.trim() || profile.banner;
        const discEl = document.getElementById('profDiscordInput');
        if (discEl) profile.discordTag = discEl.value.trim();

        if (profile.role === 'Mastermind') profile.badgeClass = 'badge-mastermind';
        else if (profile.role === 'Hacker') profile.badgeClass = 'badge-hacker';
        else if (profile.role === 'Wheelman') profile.badgeClass = 'badge-wheelman';
        else if (profile.role === 'Enforcer') profile.badgeClass = 'badge-enforcer';
        else profile.badgeClass = 'badge-rookie';

        this.saveProfile(profile);
        this.playSuccess();
        this.showToast('✅ Operative Dossier Saved to Syndicate Profile!');
        setTimeout(() => location.reload(), 650);
      });
    }
  },

  // --------------------------------------------------------------------------
  // VIP EMAIL LOGIN & INCENTIVE SYSTEM
  // --------------------------------------------------------------------------
  Auth: {
    init() {},
    updateNavButton() {},
    openModal() { window.location.href = '/save-planner'; },
    closeModal() {},
    openCheatSheet() { window.location.href = '/save-planner'; }
  },

  // --------------------------------------------------------------------------
  // CALCULATOR & GUIDE BOOKMARKING + URL STATE SHARING
  // --------------------------------------------------------------------------
  Bookmarks: {
    STORAGE_KEY: 'gta6_saved_blueprints',

    getAll() {
      try {
        if (window.GTA6Progress && typeof window.GTA6Progress.getHeistBuilds === 'function') {
          const synced = window.GTA6Progress.getHeistBuilds();
          if (Array.isArray(synced) && synced.length) return synced;
        }
        return JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
      } catch (e) {
        return [];
      }
    },

    saveAll(list) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(list));
      if (window.GTA6Progress && typeof window.GTA6Progress.setHeistBuilds === 'function') {
        window.GTA6Progress.setHeistBuilds(list);
      }
      this.renderDrawer();
      if (GTA6.MasteryAndStreak && typeof GTA6.MasteryAndStreak.refresh === 'function') {
        GTA6.MasteryAndStreak.refresh();
      }
    },

    addItem(item) {
      const list = this.getAll();
      const existsIdx = list.findIndex((x) => x.url === item.url && x.title === item.title);
      if (existsIdx >= 0) {
        list[existsIdx] = Object.assign(list[existsIdx], item);
      } else {
        list.unshift(item);
      }
      this.saveAll(list.slice(0, 30));
      GTA6.playSuccess();
      GTA6.showToast(`📌 Bookmarked "${item.title}" to Saved Builds!`);
    },

    removeItem(id) {
      const list = this.getAll().filter((x) => x.id !== id);
      this.saveAll(list);
      GTA6.playBeep(300, 'sine', 0.05);
    },

    toggleDrawer() {
      const drawer = document.getElementById('bookmarksDrawer');
      if (drawer) drawer.classList.toggle('open');
      this.renderDrawer();
    },

    init() {
      if (!document.getElementById('bookmarksDrawer')) {
        const div = document.createElement('div');
        div.innerHTML = `
          <button type="button" class="bookmarks-fab" id="bookmarksFab" onclick="GTA6.Bookmarks.toggleDrawer()">
            📌 Saved Builds (<span id="bookmarkFabCount">0</span>)
          </button>
          <aside class="bookmarks-drawer" id="bookmarksDrawer">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.25rem; border-bottom:1px solid var(--border-card); padding-bottom:0.75rem;">
              <h3 style="color:var(--neon-cyan); font-size:1.15rem;">📌 Saved Builds & Guides</h3>
              <button type="button" class="modal-close-btn" style="position:static;" onclick="GTA6.Bookmarks.toggleDrawer()" aria-label="Close Saved Drawer">${GTA6.Icons.close(15)}</button>
            </div>
            <p style="color:var(--text-muted); font-size:0.82rem; margin-bottom:1rem;">
              Bookmark calculator splits or heist guides so your squad can jump straight back into action anytime.
            </p>
            <button type="button" class="btn btn-secondary" style="width:100%; margin-bottom:1.25rem; padding:0.55rem;" onclick="GTA6.bookmarkCurrentPage()">
              ⭐ Bookmark Current Page Now
            </button>
            <div id="bookmarksDrawerList"></div>
          </aside>
        `;
        document.body.appendChild(div);
      }
      this.renderDrawer();
      this.initPlannerURLSync();
    },

    renderDrawer() {
      const list = this.getAll();
      const countEl = document.getElementById('bookmarkFabCount');
      if (countEl) countEl.innerText = String(list.length);
      const fabEl = document.getElementById('bookmarksFab');
      if (fabEl) {
        fabEl.style.display = list.length > 0 ? 'inline-flex' : 'none';
      }

      const listEl = document.getElementById('bookmarksDrawerList');
      if (!listEl) return;

      if (list.length === 0) {
        listEl.innerHTML = `<div style="padding:1.25rem; border:1px dashed var(--border-card); border-radius:8px; color:var(--text-muted); font-size:0.85rem; text-align:center;">No saved builds yet. Open the <strong>Heist Planner</strong> or any Vault Guide and hit <strong>Bookmark</strong>!</div>`;
        return;
      }

      listEl.innerHTML = list
        .map(
          (item) => `
        <div class="bookmark-item">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:0.5rem;">
            <a href="${item.url}" style="color:#fff; font-weight:800; text-decoration:none; font-size:0.92rem;">${item.title}</a>
            <button type="button" onclick="GTA6.Bookmarks.removeItem('${item.id}')" aria-label="Remove Bookmark" style="background:none; border:none; color:var(--neon-pink); cursor:pointer; display:inline-flex; align-items:center; justify-content:center; padding:4px;">${GTA6.Icons.close(14)}</button>
          </div>
          ${item.summary ? `<div style="color:var(--neon-green); font-size:0.78rem; font-family:var(--font-mono); margin-top:0.35rem;">${item.summary}</div>` : ''}
          <div style="display:flex; gap:0.5rem; margin-top:0.65rem;">
            <a href="${item.url}" class="btn btn-primary" style="padding:0.3rem 0.7rem; font-size:0.72rem; flex:1;">Load</a>
            <button type="button" class="btn btn-secondary" style="padding:0.3rem 0.7rem; font-size:0.72rem;" onclick="GTA6.copyText(window.location.origin + '/' + '${item.url.startsWith('/') ? item.url.slice(1) : item.url}', 'Squad Link')">Share</button>
          </div>
        </div>
      `
        )
        .join('');
    },

    initPlannerURLSync() {
      const targetEl = document.getElementById('targetSelect');
      if (!targetEl) return;
      const params = new URLSearchParams(window.location.search);
      if (params.has('target') && targetEl.querySelector(`option[value="${params.get('target')}"]`)) {
        targetEl.value = params.get('target');
      }
      const apEl = document.getElementById('approachSelect');
      if (apEl && params.has('approach')) apEl.value = params.get('approach');
      const plEl = document.getElementById('playerCount');
      if (plEl && params.has('players')) plEl.value = params.get('players');
      const gEl = document.getElementById('planGunner');
      if (gEl && params.has('g')) gEl.value = params.get('g');
      const hEl = document.getElementById('planHacker');
      if (hEl && params.has('h')) hEl.value = params.get('h');
      const dEl = document.getElementById('planDriver');
      if (dEl && params.has('d')) dEl.value = params.get('d');

      if (typeof window.calculatePlanner === 'function') {
        window.calculatePlanner();
      }
    },
  },

  getPlannerBuildUrl() {
    const t = document.getElementById('targetSelect')?.value || 'leonida-reserve';
    const a = document.getElementById('approachSelect')?.value || 'stealth';
    const p = document.getElementById('playerCount')?.value || '4';
    const g = document.getElementById('planGunner')?.value || '15';
    const h = document.getElementById('planHacker')?.value || '10';
    const d = document.getElementById('planDriver')?.value || '8';
    return `/heist-planner?target=${encodeURIComponent(t)}&approach=${encodeURIComponent(a)}&players=${encodeURIComponent(p)}&g=${g}&h=${h}&d=${d}`;
  },

  saveCurrentBuild() {
    const sel = document.getElementById('targetSelect');
    const targetName = sel ? sel.options[sel.selectedIndex].text.split('(')[0].trim() : 'Heist Plan';
    const approach = document.getElementById('approachSelect')?.value || 'stealth';
    const players = document.getElementById('playerCount')?.value || '4';
    const perPlayer = document.getElementById('perPlayerDisplay')?.innerText || '$0';
    const url = this.getPlannerBuildUrl();

    this.Bookmarks.addItem({
      id: 'build-' + Date.now(),
      title: `${targetName} (${players}P ${approach.toUpperCase()})`,
      summary: `Per Player Take: ${perPlayer}`,
      url,
    });
  },

  copyPlannerShareLink() {
    const relUrl = this.getPlannerBuildUrl();
    const fullUrl = `${window.location.origin}/${relUrl}`;
    this.copyText(fullUrl, 'Shareable Squad Build Link');
  },

  bookmarkCurrentPage() {
    if (document.getElementById('targetSelect')) {
      this.saveCurrentBuild();
      return;
    }
    const cleanTitle = document.title.split('|')[0].trim();
    const file = (window.location.pathname.split('/').pop() || '').replace(/\.html$/, '');
    this.Bookmarks.addItem({
      id: 'page-' + (file || 'home'),
      title: cleanTitle,
      summary: 'Saved Tactical Guide',
      url: '/' + file + window.location.search,
    });
  },

  // --------------------------------------------------------------------------
  // CLOUD-SYNCED FORUM & LFG FRIEND MATCHMAKER (/api/community + FALLBACK)
  // --------------------------------------------------------------------------
  getDefaultThreads() {
    return [
      {
        id: 'thread-1',
        author: 'Syndicate Editorial Desk',
        badge: 'badge-mastermind',
        badgeName: 'SYNDICATE TACTICAL BRIEFING • PRE-LAUNCH META',
        avatar: '/assets/avatar-mastermind.png',
        time: 'Pre-Launch Briefing',
        title: '[SYNDICATE TACTICAL BRIEFING] Leonida Reserve: Subterranean Sewer Intake & 4-Player Stealth Blueprint',
        content: 'Pre-launch tactical analysis of the Pelican Valley northern canal intake conduit. Disabling Grid 4 within the 15-second biometric window lets a 4-player squad bypass exterior courtyard cameras and preserve the +5% Stealth Integrity bonus.',
        votes: 142,
        tag: 'StealthMeta',
      },
      {
        id: 'thread-2',
        author: 'Syndicate Editorial Desk',
        badge: 'badge-hacker',
        badgeName: 'SYNDICATE TACTICAL BRIEFING • KEYPAD DRILL',
        avatar: '/assets/avatar-mastermind.png',
        time: 'Pre-Launch Briefing',
        title: '[SYNDICATE TACTICAL BRIEFING] Sinfrontera National Bank: Dual-Key Biometric Keypad & Laser Drill Pacing',
        content: 'Editorial breakdown of high-roller vault security mechanics: keep thermal drill core temperatures below 800C while the Ghost Hacker completes the 15-second frequency node sequence to avoid triggering nerve-gas lockdown.',
        votes: 89,
        tag: 'VaultIntel',
      },
      {
        id: 'thread-3',
        author: 'Syndicate Editorial Desk',
        badge: 'badge-wheelman',
        badgeName: 'SYNDICATE TACTICAL BRIEFING • ROLE SPLIT',
        avatar: '/assets/avatar-mastermind.png',
        time: 'Pre-Launch Briefing',
        title: '[SYNDICATE TACTICAL BRIEFING] Port Gellhorn Container Terminal: 4-Player Role Split & Swamp Canal Exfil',
        content: 'Recommended Day-1 crew composition for Pier 4 freight operations: pair an overhead crane spotter with a high-clearance off-road Wheelman and split 25% evenly across all 4 human operatives to maximize Net $/Hour.',
        votes: 64,
        tag: 'CrewRecruit',
      },
      {
        id: 'thread-4',
        author: 'Syndicate Editorial Desk',
        badge: 'badge-enforcer',
        badgeName: 'SYNDICATE TACTICAL BRIEFING • ESCAPE LOGISTICS',
        avatar: '/assets/avatar-mastermind.png',
        time: 'Pre-Launch Briefing',
        title: '[SYNDICATE TACTICAL BRIEFING] Starlet Superyacht Offshore: Sub-Aquatic Scuba Exfiltration vs. Helipad Heat',
        content: 'Tactical comparison of offshore exfiltration routes: rooftop helicopter extraction triggers immediate 4-star Coast Guard radar locks, whereas diving via the coral dropoff with scuba rebreathers clears coastal heat undetected.',
        votes: 118,
        tag: 'EscapeRoute',
      },
      {
        id: 'thread-5',
        author: 'Syndicate Connection Advisory',
        badge: 'badge-mastermind',
        badgeName: 'SYNDICATE CONNECTION & LAG ADVISORY',
        avatar: '/assets/avatar-mastermind.png',
        time: 'Verified Connection Note',
        title: '[SYNDICATE CONNECTION NOTE] Multi-Path Gaming Routing Overview with ExitLag',
        content: '⚡ Syndicate Connection Note: PC gamers looking to optimize multiplayer traffic routes can explore ExitLag multi-path routing software (https://www.exitlag.com/refer/10386953). Routing performance varies by ISP, game server, and region.',
        votes: 95,
        tag: 'StealthMeta',
      },
    ];
  },

  getDefaultSquads() {
    return [];
  },

  getRecommendedSquadTemplates() {
    return [
      {
        id: 'tpl-vcia-takedown',
        isTemplate: true,
        templateTitle: '4-Player VCIA Takedown Finale Squad Template',
        callsign: 'OPEN LAUNCH ARCHETYPE',
        platform: 'PS5 Pro / Xbox Series X|S',
        role: 'Mastermind + Ghost Hacker + Wheelman + Enforcer',
        roleNeeded: '1 Roof Stealth Lead + 1 Tarmac Pilot',
        targetHeist: 'VCIA Takedown — Airport Finale ($250,000)',
        micRequired: 'Mic Recommended',
        cutOffered: '25% / 25% / 25% / 25% Equal Split',
        contactTag: 'Template Ready — Click below to post your real tag',
        notes: 'Recommended 4-player Silent Sewer Intake setup. Prioritizes Bearer Bonds + Gold Bars while staying under the 65% sprint weight cap.',
      },
      {
        id: 'tpl-sinfrontera-blitz',
        isTemplate: true,
        templateTitle: '2-Player Sinfrontera Bank Blitz Template',
        callsign: 'OPEN DAY-1 ARCHETYPE',
        platform: 'PS5 Pro / Xbox Series X|S / PC',
        role: 'Lucia/Jason Duo Sync (Hacker + Enforcer)',
        roleNeeded: '1 Fast Keypad Decryptor (50/50 Duo Split)',
        targetHeist: 'Sinfrontera National Bank ($14.5M)',
        micRequired: 'Mic Optional (Ping Sync)',
        cutOffered: '50% / 50% Duo Split',
        notes: 'Fastest Net $/Hour duo grind: grab ultralight Bearer Bonds & Crypto Drives (6s grab time, 0% sprint penalty) and exit via Ocean Blvd storm drains.',
      },
      {
        id: 'tpl-superyacht-scuba',
        isTemplate: true,
        templateTitle: '3-Player Superyacht Scuba Infiltration Template',
        callsign: 'OPEN DAY-1 ARCHETYPE',
        platform: 'PS5 Pro / Xbox Series X|S / PC',
        role: 'Sub-Aquatic Stealth Trio',
        roleNeeded: '1 Rebreather Pointman + 1 Offshore Boat Pilot',
        targetHeist: 'Starlet Superyacht Offshore ($11.8M)',
        micRequired: 'Mic Required',
        cutOffered: '40% / 30% / 30% Trio Split',
        notes: 'Nighttime underwater hull breach during the 22:00–04:00 Leonida stealth window. Zero Coast Guard chopper heat.',
      },
      {
        id: 'tpl-grassrivers-bonus',
        isTemplate: true,
        templateTitle: 'Day-1 Grassrivers 1.5X Weekly Bonus Duo Template',
        callsign: 'OPEN DAY-1 ARCHETYPE',
        platform: 'PS5 Pro / Xbox Series X|S / PC',
        role: 'Swamp Bush Pilot + Radar Jammer',
        roleNeeded: '1 Low-Altitude Pilot or Airboat Driver',
        targetHeist: 'Grassrivers Cartel Airstrip ($9.75M 1.5X Bonus)',
        micRequired: 'Mic Optional',
        cutOffered: '50% / 50% Duo Split',
        notes: 'Built for the featured 1.5X Weekly Bonus target ($9,750,000). Skim below 120ft over the Grassrivers canopy to evade border radar.',
      },
    ];
  },

  async initForum() {
    const listEl = document.getElementById('threadsContainer');
    const lfgEl = document.getElementById('lfgSquadsContainer');
    if (!listEl && !lfgEl) return;

    // Clean out any legacy fake gamertags or pre-rebrand threads from localStorage
    localStorage.removeItem('gta6_forum_threads');
    localStorage.removeItem('gta6_lfg_squads');

    let threads = this.getDefaultThreads();
    let squads = [];

    try {
      const res = await fetch('/api/community');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.threads) && data.threads.length > 0) {
          threads = data.threads;
        }
        if (Array.isArray(data.squads)) {
          squads = data.squads;
        }
      }
    } catch (e) {}

    this.cachedThreads = threads;
    this.cachedSquads = squads;
    this.renderThreads(threads);
    this.renderSquads(squads);

    const postForm = document.getElementById('newPostForm');
    if (postForm) {
      const myProfile = this.getProfile();
      const authorInput = document.getElementById('postAuthor');
      if (authorInput) authorInput.value = myProfile.alias;

      postForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const author = document.getElementById('postAuthor').value.trim() || myProfile.alias;
        const role = document.getElementById('postRole') ? document.getElementById('postRole').value : myProfile.role;
        const title = document.getElementById('postTitle').value.trim();
        const content = document.getElementById('postContent').value.trim();
        const tag = document.getElementById('postTag').value;
        if (!title || !content) return;

        let badgeClass = 'badge-rookie';
        let badgeName = 'Rookie';
        if (role === 'Mastermind') { badgeClass = 'badge-mastermind'; badgeName = 'Mastermind'; }
        else if (role === 'Hacker') { badgeClass = 'badge-hacker'; badgeName = 'Ghost Hacker'; }
        else if (role === 'Wheelman') { badgeClass = 'badge-wheelman'; badgeName = 'Wheelman'; }
        else if (role === 'Enforcer') { badgeClass = 'badge-enforcer'; badgeName = 'Enforcer'; }

        let newThread = {
          id: 'thread-' + Date.now(),
          author,
          badge: badgeClass,
          badgeName,
          avatar: myProfile.avatar,
          time: 'Just now',
          title,
          content,
          votes: 1,
          tag,
        };

        try {
          const res = await fetch('/api/community', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'thread', author, badge: badgeClass, badgeName, avatar: myProfile.avatar, title, content, tag }),
          });
          if (res.ok) {
            const data = await res.json();
            if (data.thread) newThread = data.thread;
          }
        } catch (e) {}

        this.cachedThreads.unshift(newThread);
        localStorage.setItem('gta6_forum_threads', JSON.stringify(this.cachedThreads));
        this.renderThreads(this.cachedThreads);
        postForm.reset();
        GTA6.playSuccess();
        GTA6.showToast('📡 Dispatch Transmitted to Global Syndicate Board!');
      });
    }

    const lfgForm = document.getElementById('lfgPostForm');
    if (lfgForm) {
      const myProfile = this.getProfile();
      const csEl = document.getElementById('lfgCallsign');
      if (csEl) csEl.value = myProfile.alias;
      const tagEl = document.getElementById('lfgContact');
      if (tagEl && myProfile.discordTag) tagEl.value = myProfile.discordTag;

      const readLfgForm = () => ({
        callsign: document.getElementById('lfgCallsign').value.trim() || myProfile.alias,
        platform: document.getElementById('lfgPlatform').value,
        role: document.getElementById('lfgRole').value,
        roleNeeded: document.getElementById('lfgNeeded') ? document.getElementById('lfgNeeded').value : '',
        targetHeist: document.getElementById('lfgHeist').value,
        micRequired: document.getElementById('lfgMic').value,
        cutOffered: document.getElementById('lfgCut').value,
        contactTag: document.getElementById('lfgContact').value.trim() || '(add your Discord / PSN / Xbox tag)',
        notes: document.getElementById('lfgNotes').value.trim(),
      });
      const copyBtn = document.getElementById('lfgCopyDiscordBtn');
      if (copyBtn) {
        copyBtn.addEventListener('click', () => this.copyText(this.buildDiscordCard(readLfgForm()), 'Discord LFG Card'));
      }

      lfgForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
          type: 'lfg',
          callsign: document.getElementById('lfgCallsign').value.trim() || myProfile.alias,
          platform: document.getElementById('lfgPlatform').value,
          role: document.getElementById('lfgRole').value,
          roleNeeded: document.getElementById('lfgNeeded') ? document.getElementById('lfgNeeded').value : '',
          targetHeist: document.getElementById('lfgHeist').value,
          micRequired: document.getElementById('lfgMic').value,
          cutOffered: document.getElementById('lfgCut').value,
          contactTag: document.getElementById('lfgContact').value.trim(),
          notes: document.getElementById('lfgNotes').value.trim(),
        };
        if (!payload.contactTag) return;

        let newSquad = Object.assign({ id: 'lfg-' + Date.now() }, payload);
        try {
          const res = await fetch('/api/community', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          if (res.ok) {
            const data = await res.json();
            if (data.squad) newSquad = data.squad;
          }
        } catch (e) {}

        this.cachedSquads.unshift(newSquad);
        localStorage.setItem('gta6_lfg_squads', JSON.stringify(this.cachedSquads));
        this.renderSquads(this.cachedSquads);
        lfgForm.reset();
        GTA6.playSuccess();
        GTA6.showToast('🤝 Squad Listing Posted! Other players can now add you.');
      });
    }
  },

  filterThreads(tag) {
    this.currentThreadFilter = tag;
    this.renderThreads(this.cachedThreads);
    this.playBeep(420, 'sine', 0.04);
  },

  renderThreads(threads) {
    const listEl = document.getElementById('threadsContainer');
    if (!listEl) return;

    const filtered = this.currentThreadFilter === 'all'
      ? threads
      : threads.filter((t) => t.tag === this.currentThreadFilter);

    listEl.innerHTML = filtered
      .map(
        (t) => `
      <div class="thread-card" id="${t.id}">
        <div class="thread-top">
          <div class="thread-author">
            <img src="${t.avatar || '/assets/character-lucia.jpg'}" alt="${t.author || 'Syndicate Agent'} avatar" width="32" height="32" style="width: 32px; height: 32px; border-radius: 50%; border: 1px solid var(--neon-cyan); object-fit: cover;">
            <span>${t.author}</span>
            <span class="user-badge ${t.badge}">${t.badgeName || 'Operative'}</span>
          </div>
          <span class="thread-time">${t.time || (t.created_at ? t.created_at.slice(0, 10) : 'Active')}</span>
        </div>
        <div class="thread-title">${t.title}</div>
        <div class="thread-content">${t.content}</div>
        <div class="thread-actions">
          <button class="vote-btn" onclick="GTA6.upvote('${t.id}')">
            ▲ Upvote (<span id="votes-${t.id}">${t.votes}</span>)
          </button>
          <span style="color: var(--neon-cyan); font-size: 0.8rem; font-weight:700;">#${t.tag}</span>
          <span style="color: var(--text-muted); font-size: 0.8rem; margin-left: auto;">Cloud-Synced Syndicate Post</span>
        </div>
      </div>
    `
      )
      .join('');
  },

  filterSquads() {
    this.renderSquads(this.cachedSquads);
    this.playBeep(440, 'sine', 0.04);
  },

  renderSquads(squads) {
    const lfgEl = document.getElementById('lfgSquadsContainer');
    if (!lfgEl) return;

    const platFilter = document.getElementById('lfgFilterPlatform')?.value || 'all';
    const roleFilter = document.getElementById('lfgFilterRole')?.value || 'all';

    const filteredReal = (squads || []).filter((s) => {
      const pMatch = platFilter === 'all' || s.platform === platFilter;
      const rMatch = roleFilter === 'all' || s.role === roleFilter;
      return pMatch && rMatch;
    });

    const realHtml = filteredReal.length > 0
      ? filteredReal
          .map(
            (s) => `
          <div class="lfg-card" style="border-color:var(--neon-green);">
            <div>
              <div style="display:flex; justify-content:space-between; align-items:center; gap:0.5rem; margin-bottom:0.4rem; flex-wrap:wrap;">
                <strong style="color:#fff; font-size:1.05rem;">${s.callsign}</strong>
                <span class="platform-pill">${s.platform}</span>
              </div>
              <div style="display:flex; gap:0.4rem; flex-wrap:wrap; margin-bottom:0.65rem;">
                <span class="user-badge badge-mastermind" style="background:rgba(0,255,136,0.14); border-color:var(--neon-green); color:var(--neon-green);">✅ Verified Player</span>
                <span class="user-badge badge-hacker">${s.role}</span>
                <span class="user-badge badge-wheelman">${s.cutOffered || '25% Split'}</span>
              </div>
              <div style="color:var(--neon-green); font-size:0.84rem; font-weight:700; margin-bottom:0.35rem;">Target: ${s.targetHeist}</div>
              <p style="color:var(--text-muted); font-size:0.85rem;">${s.notes || 'Ready for Day-1 GTA 6 co-op setups and finales.'}</p>
            </div>
            <div class="friend-tag-box">
              <span style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${s.contactTag}</span>
              <button type="button" class="btn btn-secondary" style="padding:0.25rem 0.65rem; font-size:0.72rem; flex-shrink:0;" onclick="GTA6.copyText('${String(s.contactTag).replace(/'/g, "\\'")}', 'Friend Tag')">📋 Add Friend</button>
            </div>
            <button type="button" class="btn btn-primary" style="padding:0.45rem 0.8rem; font-size:0.76rem; width:100%;" onclick="GTA6.copyDiscordCard('${s.id}')">📋 Copy Discord LFG Recruitment Card</button>
          </div>
        `
          )
          .join('')
      : `<div style="grid-column: 1 / -1; background:rgba(0,240,255,0.05); border:1px dashed var(--neon-cyan); border-radius:10px; padding:1.75rem; text-align:center; color:var(--text-muted); font-size:0.9rem;">
          🛡️ <strong>Verified Co-Op Squad Board:</strong> Connect with real players for Day-1 GTA 6 Heist crews. Post your PSN, Xbox, or Discord tag above to squad up!
        </div>`;

    lfgEl.innerHTML = realHtml;
  },

  async upvote(threadId) {
    const thread = this.cachedThreads.find((t) => t.id === threadId);
    if (thread) {
      thread.votes += 1;
      localStorage.setItem('gta6_forum_threads', JSON.stringify(this.cachedThreads));
      const el = document.getElementById('votes-' + threadId);
      if (el) el.innerText = thread.votes;
      this.playBeep(600, 'sine', 0.05);
    }

    try {
      const res = await fetch('/api/community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'upvote', id: threadId }),
      });
      if (res.ok) {
        const data = await res.json();
        if (thread && typeof data.votes === 'number') {
          thread.votes = data.votes;
          const el = document.getElementById('votes-' + threadId);
          if (el) el.innerText = data.votes;
        }
      }
    } catch (e) {}
  },

  injectCommunityPulse() {
    return; // Disabled per user request (was too wide and misaligned)
  },

  // --------------------------------------------------------------------------
  // SYNTHWAVE AMBIENCE ENGINE
  // --------------------------------------------------------------------------
  toggleRadio() {
    this.radioPlaying = !this.radioPlaying;
    const btn = document.getElementById('radioBtn');
    if (!this.radioPlaying) {
      if (this.synthRadio) {
        clearInterval(this.synthRadio);
        this.synthRadio = null;
      }
      if (btn) btn.innerText = '📻 Synth Ambience: OFF';
      return;
    }
    if (btn) btn.innerText = '📻 Synth Ambience: ON (120 BPM)';
    if (!this.audioCtx) this.initSound();

    const notes = [130.81, 146.83, 164.81, 196.0, 220.0, 261.63];
    let step = 0;
    this.synthRadio = setInterval(() => {
      if (!this.radioPlaying) return;
      const freq = notes[step % notes.length];
      this.playBeep(freq, 'sawtooth', 0.16);
      if (step % 4 === 0) {
        this.playBeep(65.41, 'triangle', 0.22);
      }
      step++;
    }, 250);
  },

  // --------------------------------------------------------------------------
  // INTERACTIVE HTML5 PROMO VIDEO & 9:16 AD GENERATOR
  // --------------------------------------------------------------------------
  PromoVideo: {
    canvas: null,
    ctx: null,
    playing: true,
    mode: '16:9',
    frame: 0,
    rafId: null,
    recorder: null,

    init() {
      const c = document.getElementById('promoVideoCanvas');
      if (!c) return;
      this.canvas = c;
      this.ctx = c.getContext('2d');
      this.setMode('16:9', true);
      this.loop();
    },

    setMode(newMode, silent = false) {
      if (!this.canvas) return;
      this.mode = newMode;
      if (newMode === '9:16') {
        this.canvas.width = 405;
        this.canvas.height = 720;
      } else {
        this.canvas.width = 640;
        this.canvas.height = 360;
      }
      if (!silent) GTA6.playBeep(500, 'triangle', 0.05);
    },

    togglePlay() {
      this.playing = !this.playing;
      const btn = document.getElementById('promoPlayBtn');
      if (btn) btn.innerText = this.playing ? '⏸ Pause Trailer' : '▶ Play Trailer';
      GTA6.playBeep(480, 'sine', 0.05);
    },

    draw() {
      const ctx = this.ctx;
      const w = this.canvas.width;
      const h = this.canvas.height;
      const t = this.frame / 30; // seconds at ~30fps

      // Background dark gradient
      const bg = ctx.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, '#07050d');
      bg.addColorStop(0.55, '#1b0b2e');
      bg.addColorStop(1, '#05040a');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // Perspective neon synth grid
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.22)';
      ctx.lineWidth = 1;
      const horizonY = h * 0.56;
      for (let i = 0; i <= 10; i++) {
        const offset = ((t * 45 + i * 28) % 280) / 280;
        const y = horizonY + Math.pow(offset, 1.8) * (h - horizonY);
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
      for (let x = -w; x <= w * 2; x += 48) {
        ctx.beginPath();
        ctx.moveTo(w / 2, horizonY);
        ctx.lineTo(x, h);
        ctx.stroke();
      }

      // Rotating tactical radar ring
      const cx = w / 2;
      const cy = h * 0.36;
      const radius = Math.min(w, h) * 0.22;
      ctx.strokeStyle = 'rgba(255, 42, 141, 0.45)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 0.72, t * 2, t * 2 + 1.4);
      ctx.stroke();

      // Rotating scene copy every 3.5 seconds
      const sceneIdx = Math.floor(t / 3.5) % 4;
      const scenes = [
        { k: 'STOP GUESSING CREW CUTS', v: '$250,000 MAX STORY PAYOUT', s: 'INTERACTIVE PAYOUT OPTIMIZER' },
        { k: 'LIVE CO-OP LFG CREW FINDER', v: 'PS5 PRO • XBOX • PC', s: 'MATCH VERIFIED HEIST SQUADS' },
        { k: 'WEEKLY AUTO-UPDATING META', v: '1.5X BONUS TARGETS', s: 'THURSDAY RESET & SAFE GUIDES' },
        { k: '15-SLOT SAVE PLANNER FREE', v: 'GTA6HEISTGUIDE.COM', s: 'BOOKMARK & JOIN THE SYNDICATE' },
      ];
      const sc = scenes[sceneIdx];

      ctx.textAlign = 'center';
      ctx.fillStyle = '#00f0ff';
      ctx.font = `900 ${Math.round(w * 0.042)}px Segoe UI, sans-serif`;
      ctx.fillText(sc.k, cx, h * 0.16);

      // Glowing centerpiece counter
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#ff2a8d';
      ctx.shadowBlur = 18;
      ctx.font = `900 ${Math.round(w * 0.072)}px Consolas, monospace`;
      ctx.fillText(sc.v, cx, cy + 8);
      ctx.shadowBlur = 0;

      ctx.fillStyle = '#00ff88';
      ctx.font = `700 ${Math.round(w * 0.036)}px Segoe UI, sans-serif`;
      ctx.fillText(sc.s, cx, h * 0.72);

      // Lower CTA pill
      const btnW = w * 0.78;
      const btnH = 44;
      ctx.fillStyle = '#ff2a8d';
      ctx.fillRect(cx - btnW / 2, h * 0.82, btnW, btnH);
      ctx.fillStyle = '#ffffff';
      ctx.font = `900 ${Math.round(w * 0.038)}px Segoe UI, sans-serif`;
      ctx.fillText('PLAY SMARTER AT GTA6HEISTGUIDE.COM', cx, h * 0.82 + 28);
    },

    loop() {
      if (this.playing && this.canvas) {
        this.frame++;
        this.draw();
      }
      this.rafId = requestAnimationFrame(() => this.loop());
    },

    exportPromoVideo() {
      if (!this.canvas || typeof this.canvas.captureStream !== 'function' || typeof MediaRecorder === 'undefined') {
        GTA6.showToast('⚠ Browser does not support direct canvas video recording. Use screen capture or CutFlow/ClipBounty.');
        return;
      }
      const prevMode = this.mode;
      this.setMode('9:16', true);
      this.frame = 0;
      this.playing = true;

      const stream = this.canvas.captureStream(30);
      const chunks = [];
      let mimeType = 'video/webm';
      if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) mimeType = 'video/webm;codecs=vp9';

      const recorder = new MediaRecorder(stream, { mimeType });
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `GTA6HeistGuide_9x16_Ad_${Date.now()}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        this.setMode(prevMode, true);
        GTA6.playSuccess();
        GTA6.showToast('🎬 9:16 Promo Ad Video Exported (.webm)! Ready for TikTok/Reels/Shorts.');
        const st = document.getElementById('promoExportStatus');
        if (st) st.innerText = '✅ Export complete! Check your downloads.';
      };

      const st = document.getElementById('promoExportStatus');
      if (st) st.innerText = '🔴 Recording 8-second 9:16 vertical ad clip... please wait';
      GTA6.showToast('🔴 Recording 8s 9:16 Vertical Ad Video...');
      recorder.start();
      setTimeout(() => {
        if (recorder.state !== 'inactive') recorder.stop();
      }, 8000);
    },
  },

  // --------------------------------------------------------------------------
  // PERSISTENT CHECKLIST PROGRESS BAR + +250 REP REWARD
  // --------------------------------------------------------------------------
  initChecklists() {
    const groups = document.querySelectorAll('.checklist-group');
    if (!groups || groups.length === 0) return;

    const pageKey = window.location.pathname.split('/').pop() || 'heist';
    const storageKey = `gta6_checklist_${pageKey}`;
    const rewardKey = `gta6_check_reward_${pageKey}`;

    groups.forEach((group, gIdx) => {
      const checkboxes = Array.from(group.querySelectorAll('input[type="checkbox"]'));
      if (checkboxes.length === 0) return;

      const wrap = document.createElement('div');
      wrap.className = 'checklist-progress-wrap';
      wrap.innerHTML = `
        <div class="checklist-progress-header">
          <span>Mission Readiness Progress</span>
          <span id="checkPct-${gIdx}">0% READY (0 / ${checkboxes.length})</span>
        </div>
        <div class="checklist-progress-bar">
          <div class="checklist-progress-fill" id="checkFill-${gIdx}"></div>
        </div>
      `;
      group.parentNode.insertBefore(wrap, group);

      let saved = [];
      try {
        saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
      } catch (e) {}

      const syncUI = (awardCheck = false) => {
        const stateArr = [];
        let doneCount = 0;
        checkboxes.forEach((cb, idx) => {
          stateArr.push(!!cb.checked);
          if (cb.checked) doneCount++;
          const lbl = cb.closest('.check-item');
          if (lbl) lbl.classList.toggle('done', !!cb.checked);
        });
        localStorage.setItem(storageKey, JSON.stringify(stateArr));
        const pct = Math.round((doneCount / checkboxes.length) * 100);
        const pctEl = document.getElementById(`checkPct-${gIdx}`);
        const fillEl = document.getElementById(`checkFill-${gIdx}`);
        if (pctEl) pctEl.innerText = `${pct}% READY (${doneCount} / ${checkboxes.length})`;
        if (fillEl) fillEl.style.width = `${pct}%`;

        if (awardCheck && pct === 100 && !localStorage.getItem(rewardKey)) {
          localStorage.setItem(rewardKey, '1');
          const p = GTA6.getProfile();
          p.syndicateRep = (Number(p.syndicateRep) || 1240) + 250;
          GTA6.saveProfile(p);
          GTA6.playSuccess();
          GTA6.showToast('🏆 100% Heist Prep Complete! +250 Syndicate Rep Awarded.');
        }
      };

      checkboxes.forEach((cb, idx) => {
        if (saved[idx]) cb.checked = true;
        const lbl = cb.closest('.check-item');
        if (lbl) lbl.removeAttribute('onclick');
        cb.addEventListener('change', () => {
          GTA6.playBeep(cb.checked ? 587.33 : 330, 'triangle', 0.05);
          syncUI(true);
        });
      });

      syncUI(false);
    });
  },

  // --------------------------------------------------------------------------
  // INTERACTIVE VAULT KEYPAD DECRYPTION MINI-GAME TRAINER
  // --------------------------------------------------------------------------
  KeypadTrainer: { init() {} },

  // --------------------------------------------------------------------------
  // MOBILE HAMBURGER MENU INJECTOR
  // --------------------------------------------------------------------------
  initMobileNav() {
    const navContainer = document.querySelector('.nav-container');
    const navLinks = document.querySelector('.nav-links');
    if (!navContainer || !navLinks) return;

    const normPath = (p) => {
      let clean = (p || '/').split('?')[0].split('#')[0].replace(/\/index\.html$/i, '/').replace(/\.html$/i, '');
      if (clean.length > 1 && clean.endsWith('/')) clean = clean.slice(0, -1);
      return clean || '/';
    };
    const curPath = normPath(window.location.pathname);
    // Prioritize exact top-level nav pills before dropdown items so e.g. /map.html highlights MAP instead of TOOLS
    const topLinks = Array.from(navLinks.querySelectorAll(':scope > li > a'));
    const allLinks = Array.from(navLinks.querySelectorAll('a'));
    let matchedLink = topLinks.find((link) => {
      try {
        return normPath(new URL(link.href, window.location.origin).pathname) === curPath;
      } catch (e) { return false; }
    });
    if (!matchedLink) {
      matchedLink = allLinks.find((link) => {
        try {
          return normPath(new URL(link.href, window.location.origin).pathname) === curPath;
        } catch (e) { return false; }
      });
    }
    if (!matchedLink && curPath.startsWith('/heists/')) {
      matchedLink = topLinks.find((link) => {
        try {
          return normPath(new URL(link.href, window.location.origin).pathname) === '/';
        } catch (e) { return false; }
      });
    }
    if (matchedLink) {
      navLinks.querySelectorAll('a.active, .nav-dropdown-btn.active').forEach((a) => a.classList.remove('active'));
      matchedLink.classList.add('active');
      const parentDd = matchedLink.closest('.nav-dropdown');
      if (parentDd) {
        const ddBtn = parentDd.querySelector('.nav-dropdown-btn');
        if (ddBtn) ddBtn.classList.add('active');
      }
    }

    // Clean up any legacy mobile drawer actions so Launch Rewards / Install App never reappear
    const legacyDrawerActions = navLinks.querySelector('.mobile-drawer-actions');
    if (legacyDrawerActions) legacyDrawerActions.remove();

    const closeDrawer = () => {
      navLinks.classList.remove('open');
      navLinks.querySelectorAll('.nav-dropdown.is-open').forEach((dd) => {
        dd.classList.remove('is-open');
        const ddBtn = dd.querySelector('.nav-dropdown-btn');
        if (ddBtn) ddBtn.setAttribute('aria-expanded', 'false');
      });
      const b = document.getElementById('mobileMenuBtn');
      if (b) {
        b.innerHTML = `${this.Icons.menu(18)}<span>Menu</span>`;
        b.setAttribute('aria-expanded', 'false');
      }
    };

    if (!navLinks.id) navLinks.id = 'siteNavLinks';

    if (!document.getElementById('mobileMenuBtn')) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.id = 'mobileMenuBtn';
      btn.className = 'mobile-menu-btn';
      btn.setAttribute('aria-label', 'Toggle Navigation Menu');
      btn.setAttribute('aria-controls', navLinks.id);
      btn.setAttribute('aria-expanded', 'false');
      btn.innerHTML = `${this.Icons.menu(18)}<span>Menu</span>`;
      btn.onclick = (e) => {
        e.stopPropagation();
        const isOpen = navLinks.classList.toggle('open');
        btn.innerHTML = isOpen ? `${this.Icons.close(18)}<span>Close</span>` : `${this.Icons.menu(18)}<span>Menu</span>`;
        btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        this.playBeep(isOpen ? 540 : 380, 'sine', 0.04);
      };
      const actions = navContainer.querySelector('.nav-actions');
      if (actions) actions.appendChild(btn);
      else navContainer.appendChild(btn);
    }

    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', closeDrawer);
    });
    document.addEventListener('click', (e) => {
      if (navLinks.classList.contains('open') && !e.target.closest('.navbar')) closeDrawer();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navLinks.classList.contains('open')) {
        closeDrawer();
        const b = document.getElementById('mobileMenuBtn');
        if (b) b.focus();
      }
    });
  },

    // --------------------------------------------------------------------------
    // SECOND-SCREEN LIVE HEIST COMPANION HUD (CLOCK, COOLDOWN, FENCE & PANIC)
    // --------------------------------------------------------------------------
    CompanionHUD: {
      panicEndMs: 0,
      cooldownNotified: false,
      fenceNotified: false,
      panicNotified: false,

      init() {
        const hud = document.getElementById('liveCompanionHud');
        if (!hud) return;
        this.tick();
        setInterval(() => this.tick(), 250);
      },

      tick() {
        const now = Date.now();
        // 48 real minutes (2,880,000 ms) = 24 in-game hours (1,440 in-game minutes)
        // 1 real second = 0.5 in-game minutes (30 in-game seconds)
        const cycleMs = 48 * 60 * 1000;
        const posMs = now % cycleMs;
        const totalInGameMins = Math.floor((posMs / cycleMs) * 1440);
        const igHours = Math.floor(totalInGameMins / 60);
        const igMins = totalInGameMins % 60;
        const clockStr = `${String(igHours).padStart(2, '0')}:${String(igMins).padStart(2, '0')} LEONIDA`;

        const clockEl = document.getElementById('leonidaClockDisplay');
        if (clockEl) clockEl.innerText = clockStr;

        const weathers = [
          '🌴 Clear Neon Tide (100% Visibility)',
          '🌧️ Tropical Squall (+22% Acoustic Stealth)',
          '🌫️ Coastal Fog (-30% Sniper Sightlines)',
          '⚡ Humid Dusk Front (Optimal Patrol Gap)',
        ];
        const wIdx = Math.floor(now / (12 * 60 * 1000)) % weathers.length;
        const weatherEl = document.getElementById('leonidaWeatherDisplay');
        if (weatherEl) weatherEl.innerText = weathers[wIdx];

        // Optimal Night-Vision Stealth Window: 22:00 (1320m) to 04:00 (240m)
        const stealthEl = document.getElementById('stealthWindowCountdown');
        if (stealthEl) {
          const isStealthActive = igHours >= 22 || igHours < 4;
          if (isStealthActive) {
            const minsLeftInGame = igHours >= 22 ? (24 - igHours) * 60 - igMins + 240 : (4 - igHours) * 60 - igMins;
            const realSecsLeft = Math.max(0, Math.round(minsLeftInGame * 2));
            const m = Math.floor(realSecsLeft / 60);
            const s = realSecsLeft % 60;
            stealthEl.innerHTML = `<span style="color:var(--neon-green);">🟢 STEALTH WINDOW ACTIVE (${m}m ${s}s left)</span>`;
          } else {
            const minsUntil22 = (22 - igHours) * 60 - igMins;
            const realSecsUntil = Math.max(0, Math.round(minsUntil22 * 2));
            const m = Math.floor(realSecsUntil / 60);
            const s = realSecsUntil % 60;
            stealthEl.innerHTML = `<span style="color:var(--neon-amber);">⏳ Next 22:00 Stealth Window in ${m}m ${s}s (Real Time)</span>`;
          }
        }

        // Vault Cooldown (48m)
        const cdEnd = Number(localStorage.getItem('gta6_cooldown_end') || 0);
        const cdEl = document.getElementById('vaultCooldownDisplay');
        if (cdEl) {
          if (cdEnd > now) {
            const remSec = Math.ceil((cdEnd - now) / 1000);
            const m = Math.floor(remSec / 60);
            const s = remSec % 60;
            cdEl.innerText = `⏱️ ${m}m ${String(s).padStart(2, '0')}s`;
            cdEl.style.color = 'var(--neon-amber)';
          } else {
            if (cdEnd > 0 && !this.cooldownNotified) {
              this.cooldownNotified = true;
              localStorage.removeItem('gta6_cooldown_end');
              GTA6.playSuccess();
              GTA6.showToast('🔔 Vault Cooldown Complete! Your next heist is ready to launch.');
            }
            cdEl.innerText = 'READY TO LAUNCH';
            cdEl.style.color = 'var(--neon-green)';
          }
        }

        // Laundering Fence Timer (24m)
        const fnEnd = Number(localStorage.getItem('gta6_fence_end') || 0);
        const fnEl = document.getElementById('fenceTimerDisplay');
        if (fnEl) {
          if (fnEnd > now) {
            const remSec = Math.ceil((fnEnd - now) / 1000);
            const m = Math.floor(remSec / 60);
            const s = remSec % 60;
            fnEl.innerText = `🧼 ${m}m ${String(s).padStart(2, '0')}s`;
            fnEl.style.color = 'var(--neon-cyan)';
          } else {
            if (fnEnd > 0 && !this.fenceNotified) {
              this.fenceNotified = true;
              localStorage.removeItem('gta6_fence_end');
              GTA6.playSuccess();
              GTA6.showToast('💵 Fence Laundering Cycle Complete! Clean cash ready for pickup.');
            }
            fnEl.innerText = 'FENCE CLEAR';
            fnEl.style.color = 'var(--neon-green)';
          }
        }

        // 90s 5-Star Panic Escape Timer
        const pnEl = document.getElementById('panicTimerDisplay');
        if (pnEl) {
          if (this.panicEndMs > now) {
            const remMs = this.panicEndMs - now;
            pnEl.innerText = `🚨 ${(remMs / 1000).toFixed(1)}s HIDE IN TUNNEL`;
            pnEl.style.color = 'var(--neon-pink)';
          } else {
            if (this.panicEndMs > 0 && !this.panicNotified) {
              this.panicNotified = true;
              this.panicEndMs = 0;
              GTA6.playSuccess();
              GTA6.showToast('🚁 Chopper Line-of-Sight Broken! 5-Star Radar Sweep Evaded.');
            }
            pnEl.innerText = '90.0s STANDBY';
            pnEl.style.color = 'var(--neon-cyan)';
          }
        }
      },

      startVaultCooldown() {
        const end = Date.now() + 48 * 60 * 1000;
        localStorage.setItem('gta6_cooldown_end', String(end));
        this.cooldownNotified = false;
        GTA6.playSuccess();
        GTA6.showToast('⏱️ 48-Minute Vault Cooldown Timer Started! Audio chime will sound when ready.');
        this.tick();
      },

      startFenceTimer() {
        const end = Date.now() + 24 * 60 * 1000;
        localStorage.setItem('gta6_fence_end', String(end));
        this.fenceNotified = false;
        GTA6.playSuccess();
        GTA6.showToast('🧼 24-Minute Fence Laundering Timer Started! Audio chime enabled.');
        this.tick();
      },

      startPanicTimer() {
        this.panicEndMs = Date.now() + 90 * 1000;
        this.panicNotified = false;
        GTA6.playBeep(680, 'sawtooth', 0.12);
        GTA6.showToast('🚨 90s 5-Star Radar Sweep / Tunnel Hide Timer Started! Hold line-of-sight cover.');
        this.tick();
      },
    },

    // --------------------------------------------------------------------------
    // ZERO-LOGIN MASTERY BAR (0% -> 100%) & DAILY STREAK GAMIFICATION
    // --------------------------------------------------------------------------
    MasteryAndStreak: {
      TIPS: [
        'Pro Stealth Tip #1: Entering the Pelican Valley Sewer Intake between 22:00 and 04:00Leonida time cuts exterior guard sightcones by 35%.',
        'Pro Stealth Tip #2: Pairing Bearer Bonds with 1 Gold Bar keeps 2-player squads under the 65% bag weight threshold so sprint speed stays at 100%.',
        'Pro Stealth Tip #3: Swapping getaway vehicles inside an underground parking structure or canal bridge sheds 4-star ANPR license plate locks in 18 seconds.',
        'Pro Stealth Tip #4: Keep the Sinfrontera thermal laser drill under 800C—pulsing for 3.5 seconds with 1-second cooldowns prevents silent vault lockdown.',
        'Pro Stealth Tip #5: Skipping hired NPC drivers and using a human Wheelman saves 8%–12% of the gross heist pot on every single finale.',
      ],

      init() {
        this.updateDailyStreak();
        this.refresh();
      },

      updateDailyStreak() {
        const today = new Date().toISOString().slice(0, 10);
        const lastVisit = localStorage.getItem('gta6_last_visit_date') || '';
        let streak = Number(localStorage.getItem('gta6_daily_streak') || 0);

        if (lastVisit !== today) {
          const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
          if (lastVisit === yesterday) {
            streak += 1;
          } else {
            streak = Math.max(1, streak);
          }
          localStorage.setItem('gta6_last_visit_date', today);
          localStorage.setItem('gta6_daily_streak', String(streak));
          const p = GTA6.getProfile();
          p.syndicateRep = (Number(p.syndicateRep) || 1240) + 150;
          GTA6.saveProfile(p);
        }
      },

      claimDailyBounty() {
        const today = new Date().toISOString().slice(0, 10);
        const claimedDate = localStorage.getItem('gta6_bounty_claimed_date');
        if (claimedDate === today) {
          GTA6.showToast('✅ Daily Vault Bounty already claimed today! Return tomorrow for +250 Rep.');
          return;
        }
        localStorage.setItem('gta6_bounty_claimed_date', today);
        let streak = Number(localStorage.getItem('gta6_daily_streak') || 1);
        const p = GTA6.getProfile();
        p.syndicateRep = (Number(p.syndicateRep) || 1240) + 250;
        GTA6.saveProfile(p);
        GTA6.playSuccess();
        GTA6.showToast(`🔥 Day ${streak} Vault Bounty Claimed! +250 Syndicate Rep Added.`);
        this.refresh();
      },

      toggleBlueprintCheck(slug, checked) {
        let map = {};
        try {
          map = JSON.parse(localStorage.getItem('gta6_mastery_blueprints') || '{}');
        } catch (e) {}
        map[slug] = !!checked;
        localStorage.setItem('gta6_mastery_blueprints', JSON.stringify(map));
        GTA6.playBeep(checked ? 580 : 340, 'triangle', 0.05);
        this.refresh();
      },

      refresh() {
        // Calculate Mastery % across 5 zero-login activity pillars
        let bpMap = {};
        try {
          bpMap = JSON.parse(localStorage.getItem('gta6_mastery_blueprints') || '{}');
        } catch (e) {}
        const bpCheckedCount = Object.values(bpMap).filter(Boolean).length; // up to 6 vaults -> 30%
        const bpScore = Math.min(30, bpCheckedCount * 5);

        const bestHack = Number(localStorage.getItem('gta6_keypad_best_ms') || 0);
        const hackScore = bestHack > 0 ? (bestHack <= 15000 ? 20 : 12) : 0; // up to 20%

        const savedBuilds = GTA6.Bookmarks.getAll().length;
        const buildScore = Math.min(20, savedBuilds * 10); // up to 20%

        let foundPins = [];
        let checklistMap = {};
        try {
          foundPins = JSON.parse(localStorage.getItem('gta6_map_found_v2') || '[]');
          checklistMap = JSON.parse(localStorage.getItem('gta6_map_checklist_v2') || '{}');
        } catch (e) {}
        const mapChecks = Object.values(checklistMap).filter(Boolean).length;
        const mapScore = Math.min(20, foundPins.length * 3 + mapChecks * 4); // up to 20%

        const todayClaimed = localStorage.getItem('gta6_bounty_claimed_date') === new Date().toISOString().slice(0, 10);
        const streakScore = todayClaimed ? 10 : 5; // up to 10%

        const totalPct = Math.min(100, bpScore + hackScore + buildScore + mapScore + streakScore);
        let rankTitle = 'Street Runner';
        if (totalPct >= 75) rankTitle = 'Leonida Kingpin';
        else if (totalPct >= 35) rankTitle = 'Vault Specialist';

        const pctEl = document.getElementById('masteryPctDisplay');
        const fillEl = document.getElementById('masteryBarFill');
        const rankEl = document.getElementById('masteryRankDisplay');
        const repEl = document.getElementById('masteryRepDisplay');
        const p = GTA6.getProfile();

        if (pctEl) pctEl.innerText = `${totalPct}%`;
        if (fillEl) fillEl.style.width = `${totalPct}%`;
        if (rankEl) rankEl.innerText = rankTitle;
        if (repEl) repEl.innerText = `${Number(p.syndicateRep || 1240).toLocaleString()} REP`;

        // Sync blueprint checkboxes on homepage
        document.querySelectorAll('.mastery-bp-check').forEach((cb) => {
          const slug = cb.getAttribute('data-bp-slug');
          if (slug) cb.checked = !!bpMap[slug];
        });

        // Sync streak widget
        const streak = Number(localStorage.getItem('gta6_daily_streak') || 1);
        const streakCountEl = document.getElementById('dailyStreakCount');
        if (streakCountEl) streakCountEl.innerText = `🔥 ${streak}-Day Syndicate Streak`;

        const tipEl = document.getElementById('dailyStealthTipText');
        if (tipEl) {
          const tipIdx = (streak + bpCheckedCount) % this.TIPS.length;
          tipEl.innerText = this.TIPS[tipIdx];
        }

        const claimBtn = document.getElementById('claimDailyBountyBtn');
        if (claimBtn) {
          claimBtn.innerText = todayClaimed ? '✅ Daily +250 Rep Bounty Claimed' : '🎁 Claim Daily Vault Bounty (+250 Rep)';
        }

        // Only prompt for email backup once they have earned progress
        const backupPrompt = document.getElementById('masteryBackupPrompt');
        if (backupPrompt) {
          backupPrompt.style.display = totalPct > 5 && !p.vipVerified ? 'flex' : 'none';
        }
      },
    },

    // --------------------------------------------------------------------------
    // CROWDSOURCED LIVE PAYOUT / COOLDOWN REPORT MODAL (/api/payout-report)
    // --------------------------------------------------------------------------
    openPayoutReportModal(vaultSlug = 'cartel-heist', vaultName = 'The Cartel Heist: Sinfrontera National Bank') {
      let modal = document.getElementById('payoutReportModal');
      if (!modal) {
        const wrap = document.createElement('div');
        wrap.innerHTML = `
          <div class="modal-backdrop" id="payoutReportModal">
            <div class="modal-box" style="max-width:540px; border-color:var(--neon-amber);">
              <button type="button" class="modal-close-btn" onclick="document.getElementById('payoutReportModal').classList.remove('open')" aria-label="Close Modal">${GTA6.Icons.close(15)}</button>
              <span class="user-badge badge-mastermind" style="margin-bottom:0.5rem;">CROWDSOURCED D1 PATCH VERIFICATION</span>
              <h3 id="prModalTitle" style="color:#fff; font-size:1.3rem; margin-bottom:0.35rem;">Report Live Payout / Cooldown Change</h3>
              <p style="color:var(--text-muted); font-size:0.85rem; margin-bottom:1rem;">
                Did a Rockstar title update or hotfix change this vault's payout or cooldown? When 3 operatives submit matching numbers, our D1 consensus engine flags it as Verified!
              </p>
              <form id="payoutReportForm">
                <input type="hidden" id="prVaultSlug" value="">
                <div class="grid" style="grid-template-columns:1fr 1fr; gap:0.75rem;">
                  <div class="form-group">
                    <label>Reported Max Payout ($)</label>
                    <input type="number" class="form-input" id="prPayoutInput" value="25000000" min="50000" step="50000" required>
                  </div>
                  <div class="form-group">
                    <label>Reported Cooldown (Mins)</label>
                    <input type="number" class="form-input" id="prCooldownInput" value="48" min="5" max="720" required>
                  </div>
                </div>
                <div class="form-group">
                  <label>Operative Callsign</label>
                  <input type="text" class="form-input" id="prAliasInput" value="${this.getProfile().alias}" required>
                </div>
                <div class="form-group">
                  <label>Patch / Hotfix Note (e.g., Title Update 1.02 Hard Mode)</label>
                  <input type="text" class="form-input" id="prNoteInput" placeholder="Verified in 4-player lobby after hotfix..." required>
                </div>
                <button type="submit" class="btn btn-amber" style="width:100%;">📡 Transmit Live Payout Report to D1</button>
                <div id="prStatusMsg" style="margin-top:0.65rem; font-size:0.84rem; text-align:center;"></div>
              </form>
            </div>
          </div>
        `;
        document.body.appendChild(wrap);
        modal = document.getElementById('payoutReportModal');

        const form = document.getElementById('payoutReportForm');
        if (form) {
          form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const statusEl = document.getElementById('prStatusMsg');
            if (statusEl) statusEl.innerHTML = `<span style="color:var(--neon-cyan);">Submitting verified tactical report to database...</span>`;
            const payload = {
              vault_slug: document.getElementById('prVaultSlug').value,
              reported_payout: Number(document.getElementById('prPayoutInput').value),
              reported_cooldown_mins: Number(document.getElementById('prCooldownInput').value),
              reporter_alias: document.getElementById('prAliasInput').value.trim(),
              patch_note: document.getElementById('prNoteInput').value.trim(),
            };
            try {
              const res = await fetch('/api/payout-report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
              });
              const data = await res.json();
              if (data.ok) {
                const p = GTA6.getProfile();
                p.syndicateRep = (Number(p.syndicateRep) || 1240) + (data.repAwarded || 150);
                GTA6.saveProfile(p);
                if (GTA6.MasteryAndStreak) GTA6.MasteryAndStreak.refresh();
                GTA6.playSuccess();
                if (statusEl) {
                  statusEl.innerHTML = data.consensusVerified
                    ? `<span style="color:var(--neon-green);">✅ 3-Player Consensus Reached! Payout Verified (+500 Rep).</span>`
                    : `<span style="color:var(--neon-green);">✅ Report logged in D1 (${data.count}/3 consensus votes • +150 Rep)!</span>`;
                }
              }
            } catch (err) {
              if (statusEl) statusEl.innerHTML = `<span style="color:var(--neon-pink);">Could not reach D1 endpoint.</span>`;
            }
          });
        }
      }

      document.getElementById('prVaultSlug').value = vaultSlug;
      document.getElementById('prModalTitle').innerText = `Report Payout / Cooldown: ${vaultName}`;
      const st = document.getElementById('prStatusMsg');
      if (st) st.innerText = '';
      modal.classList.add('open');
      this.playBeep(500, 'triangle', 0.05);
    },

    // --------------------------------------------------------------------------
    // EXIT-INTENT MODAL & UNIVERSAL NAV / MULTI-CTA ENHANCER
    // --------------------------------------------------------------------------
    ExitIntent: {
      shown: true,
      init() {
        // ExitIntent permanently disabled per user request
      },
      trigger() {
        // Disabled
      }
    },
    // --------------------------------------------------------------------------
    // GTA 6 CHARACTER DOSSIERS & INTERACTIVE CLASSIFIED MODAL
    // --------------------------------------------------------------------------
    CharacterData: {
      "lucia-caminos": {
        name: "Lucia Caminos",
        alias: "Confirmed Co-Lead",
        category: "Playable Protagonist (Rockstar Confirmed)",
        role: "Co-Lead Protagonist • Simulated Infiltration Role",
        source: "Rockstar Games Official Website Bio & Trailers 1–2",
        actor: "Undisclosed by Rockstar Games (Community-Reported Cast)",
        district: "Vice City / Leonida",
        image: "assets/character-lucia.jpg?v=20261118_v5",
        bio: "Official Rockstar Bio: Taught to fight by her father as soon as she could walk, Lucia landed in the Leonida Penitentiary fighting for her family and got out by sheer luck. Determined to reach the smart life her mom dreamed of since their days in Liberty City, she partners with Jason Duval across Leonida.",
        specialty: "Confirmed: Close-quarters combat & hold-ups. Simulated Planner Role: Interior vault & crowd control.",
        weapon: "Compact SMG / Pistol & Heist Cash Duffel (Trailer / Sim Loadout)",
        weaponLink: "/weapons#item-mp5",
        perk: "Fan-Made Heist Simulator Role (Not an Official Rockstar Perk): Models Lucia as the primary interior vault and crowd-control operative in squad simulations.",
        stats: { decryption: 90, intimidation: 88, combat: 85, wheelman: 80 }
      },
      "jason-duval": {
        name: "Jason Duval",
        alias: "Confirmed Co-Lead",
        category: "Playable Protagonist (Rockstar Confirmed)",
        role: "Co-Lead Protagonist • Simulated Wheelman / Overwatch Role",
        source: "Rockstar Games Official Website Bio & Trailers 1–2",
        actor: "Undisclosed by Rockstar Games (Community-Reported Cast)",
        district: "Leonida Keys / Vice City",
        image: "assets/character-jason.jpg?v=20261118_v5",
        bio: "Official Rockstar Bio: Jason grew up around grifters and crooks. After a stint in the Army trying to shake off his troubled teenage years, he found himself in the Keys doing what he knows best—working for local drug runners like Brian Heder before partnering with Lucia Caminos.",
        specialty: "Confirmed: Ex-Army background & Keys smuggling work. Simulated Planner Role: Getaway driving & marksman overwatch.",
        weapon: "Marksman Carbine & Tactical Sidearm (Trailer / Sim Loadout)",
        weaponLink: "/weapons#item-carbine",
        perk: "Fan-Made Heist Simulator Role (Not an Official Rockstar Perk): Models Jason as the primary getaway driver and perimeter marksman in squad simulations.",
        stats: { decryption: 80, intimidation: 85, combat: 90, wheelman: 92 }
      },
      "stefanie": {
        name: "Stefanie",
        alias: "Prison Counselor",
        category: "Confirmed Story NPC (Trailer 1)",
        role: "Leonida Dept. of Corrections Counselor (Non-Crew NPC)",
        source: "Rockstar Games Trailer 1 Opening Scene",
        actor: "Undisclosed by Rockstar Games",
        district: "Leonida Penitentiary",
        image: "assets/character-stefanie.jpg?v=20261118_v4",
        bio: "Official Trailer 1 Appearance: Featured in the opening sequence of Trailer 1 at the Leonida Department of Corrections asking Lucia, 'Do you know why you're here?' She is a story NPC and not a hireable heist crew member.",
        specialty: "Correctional intake & parole narrative context.",
        weapon: "None (Correctional Staff NPC)",
        weaponLink: "/weapons",
        perk: "No Official Gameplay Perk: Stefanie is a narrative NPC in Lucia's prison storyline, not a heist crew operative.",
        stats: { decryption: 50, intimidation: 60, combat: 30, wheelman: 40 }
      },
      "cal-hampton": {
        name: "Cal Hampton",
        alias: "Coast Guard Comms",
        category: "Story Associate (Rockstar Confirmed)",
        role: "Jason's Friend & Brian Heder Associate • Simulated Comms Role",
        source: "Rockstar Games Official Website Bio & Trailer 2",
        actor: "Undisclosed by Rockstar Games",
        district: "Leonida Keys / Mainland",
        image: "assets/character-cal-hampton.jpg?v=20261118_v4",
        bio: "Official Rockstar Bio: Jason's friend and a fellow associate of Brian Heder. Cal feels safest hanging at home, snooping on Coast Guard comms with a few beers and some private browser tabs open.",
        specialty: "Confirmed: Snooping on Coast Guard comms. Simulated Planner Role: Radio scanner monitoring.",
        weapon: "Communications Scanner (Bio Reference)",
        weaponLink: "/weapons",
        perk: "Fan-Made Heist Simulator Role (Not an Official Rockstar Perk): Based on his official bio noting he monitors Coast Guard comms, our Heist Planner models Cal as a hypothetical radio-intel support option.",
        stats: { decryption: 85, intimidation: 45, combat: 55, wheelman: 60 }
      },
      "boobie-ike": {
        name: "Boobie Ike",
        alias: "Vice City Legend",
        category: "Story Associate (Rockstar Confirmed)",
        role: "Club, Strip Club & Studio Mogul • Simulated Fence Role",
        source: "Rockstar Games Official Website Bio & Trailer 2",
        actor: "Undisclosed by Rockstar Games",
        district: "Vice City",
        image: "assets/character-boobie-ike.jpg?v=20261118_v4",
        bio: "Official Rockstar Bio: A local Vice City legend who transformed his time in the streets into a legitimate empire spanning real estate, a strip club (Jack of Hearts), and a recording studio (Only Raw Records) in partnership with Dre'Quan Priest.",
        specialty: "Confirmed: Vice City real estate, Jack of Hearts club, and Only Raw Records mogul.",
        weapon: "Custom Sidearm (Simulated Loadout)",
        weaponLink: "/weapons",
        perk: "Fan-Made Heist Simulator Role (Not an Official Rockstar Perk): Models Boobie's Vice City nightclub empire as a high-roller laundering/fence contact in our simulator.",
        stats: { decryption: 65, intimidation: 85, combat: 75, wheelman: 75 }
      },
      "brian-heder": {
        name: "Brian Heder",
        alias: "Keys Smuggler",
        category: "Story Associate (Rockstar Confirmed)",
        role: "Leonida Keys Drug Runner & Boatyard Owner",
        source: "Rockstar Games Official Website Bio & Trailer 2",
        actor: "Undisclosed by Rockstar Games",
        district: "Leonida Keys (Mariana County)",
        image: "assets/character-brian-heder.jpg?v=20261118_v4",
        bio: "Official Rockstar Bio: A classic drug runner from the golden age of smuggling in the Keys. Still moving product through his boatyard with his third wife, Lori, Brian lets Jason live rent-free at one of his properties—provided he helps with local shakedowns.",
        specialty: "Confirmed: Keys boatyard smuggling & Jason's landlord. Verified In-Game Lockup: Brian's Lockup (Keypad 7700).",
        weapon: "Boatyard Logistics & Lockup 7700",
        weaponLink: "/properties",
        perk: "Fan-Made Heist Simulator Role (Not an Official Rockstar Perk): Models Brian's boatyard as a vehicle/marine staging contact in our Heist Planner.",
        stats: { decryption: 60, intimidation: 82, combat: 80, wheelman: 88 }
      },
      "lori-heder": {
        name: "Lori Heder",
        alias: "Keys Boatyard Partner",
        category: "Story Associate (Named in Rockstar Bio)",
        role: "Brian Heder's Third Wife • Simulated Marine Mechanic Role",
        source: "Rockstar Games Official Brian Heder Bio",
        actor: "Undisclosed by Rockstar Games",
        district: "Leonida Keys Boatyard",
        image: "assets/character-lori-heder.jpg?v=20261118_v4",
        bio: "Official Rockstar Bio Mention: Named in Rockstar's official character profile for Brian Heder as his third wife, Lori, with whom he continues moving product through his Leonida Keys boatyard.",
        specialty: "Confirmed: Co-runs Brian Heder's Keys boatyard. Simulated Planner Role: Marine rigging & boat prep.",
        weapon: "Marine Rigging Tools (Simulated)",
        weaponLink: "/weapons",
        perk: "Fan-Made Heist Simulator Role (Not an Official Rockstar Perk): Models Lori as a 5%-cut marine fleet specialist in our Heist Planner.",
        stats: { decryption: 60, intimidation: 72, combat: 70, wheelman: 85 }
      },
      "drequan-priest": {
        name: "Dre'Quan Priest",
        alias: "Only Raw Mogul",
        category: "Story Associate (Rockstar Confirmed)",
        role: "Founder of Only Raw Records • Simulated Logistics Role",
        source: "Rockstar Games Official Website Bio & Trailer 2",
        actor: "Undisclosed by Rockstar Games",
        district: "Vice City",
        image: "assets/character-drequan-priest.jpg?v=20261118_v4",
        bio: "Official Rockstar Bio: Always more of a hustler than a gangster, Dre'Quan broke into the music industry as the founder of Only Raw Records, partnering with Boobie Ike and signing viral rap duo Real Dimez.",
        specialty: "Confirmed: Only Raw Records music mogul & Boobie Ike partner.",
        weapon: "Compact Sidearm (Simulated)",
        weaponLink: "/weapons",
        perk: "Fan-Made Heist Simulator Role (Not an Official Rockstar Perk): Models Dre'Quan as a high-profile nightlife and charter extraction contact in squad simulations.",
        stats: { decryption: 70, intimidation: 75, combat: 75, wheelman: 85 }
      },
      "raul-bautista": {
        name: "Raul Bautista",
        alias: "Veteran Bank Robber",
        category: "Heist Specialist (Rockstar Confirmed)",
        role: "Seasoned Bank Robber • Simulated 8% Cut Breacher Role",
        source: "Rockstar Games Official Website Bio & Trailer 2",
        actor: "Undisclosed by Rockstar Games",
        district: "Vice City / State of Leonida",
        image: "assets/character-raul-bautista.jpg?v=20261118_v4",
        bio: "Official Rockstar Bio: With confidence, charm, and cunning, Raul is a seasoned bank robber always on the hunt for talent ready to take the risks that bring the biggest rewards—raising the stakes with every score.",
        specialty: "Confirmed: Veteran bank robber & crew recruiter (featured in Chapter 3's Cartel Heist).",
        weapon: "Tactical Carbine & Ornate Sidearm",
        weaponLink: "/weapons#item-carbine",
        perk: "Fan-Made Heist Simulator Role (Not an Official Rockstar Perk): While Raul is an officially confirmed bank robber, the 8% hireable crew cut and numeric breaching percentages are fan-made Heist Planner simulator estimates.",
        stats: { decryption: 85, intimidation: 88, combat: 94, wheelman: 75 }
      },
      "baeluxe": {
        name: "Bae-Luxe (Real Dimez)",
        alias: "Real Dimez Duo",
        category: "Story Associate (Rockstar Confirmed)",
        role: "Viral Rap Duo & Social Media Star (Only Raw Records)",
        source: "Rockstar Games Official Website Bio & Trailers 1–2",
        actor: "Undisclosed by Rockstar Games",
        district: "Vice City",
        image: "assets/character-bae-luxe.jpg",
        bio: "Official Rockstar Bio: Half of the viral Vice City rap duo Real Dimez alongside her high-school friend Roxy. Turning their time shaking down local dealers into spicy rap tracks and a relentless social media presence, they are signed to Dre'Quan Priest's Only Raw Records.",
        specialty: "Confirmed: Real Dimez rap duo & viral social media presence.",
        weapon: "Mobile Streaming Rig (Story Context)",
        weaponLink: "/weapons",
        perk: "Fan-Made Heist Simulator Role (Not an Official Rockstar Perk): Models Real Dimez's viral street gatherings as a hypothetical crowd-distraction concept in our planner.",
        stats: { decryption: 50, intimidation: 72, combat: 45, wheelman: 70 }
      },
      "roxy": {
        name: "Roxy (Real Dimez)",
        alias: "Real Dimez Duo",
        category: "Story Associate (Rockstar Confirmed)",
        role: "Viral Rap Duo & Social Media Star (Only Raw Records)",
        source: "Rockstar Games Official Website Bio & Trailers 1–2",
        actor: "Undisclosed by Rockstar Games",
        district: "Vice City",
        image: "assets/character-roxy.jpg",
        bio: "Official Rockstar Bio: The other half of Real Dimez with Bae-Luxe. Friends since high school, the duo parlayed an early hit single with local rapper DWNPLY into viral fame and a deal with Dre'Quan Priest at Only Raw Records.",
        specialty: "Confirmed: Real Dimez rap duo & Vice City nightlife presence.",
        weapon: "Nightlife & Street Contacts (Story Context)",
        weaponLink: "/weapons",
        perk: "Fan-Made Heist Simulator Role (Not an Official Rockstar Perk): Models Roxy's Vice City club and street-meet connections for roleplay theorycrafting.",
        stats: { decryption: 50, intimidation: 75, combat: 55, wheelman: 80 }
      },
      "petra-navarro": {
        name: "Petra Navarro",
        alias: "Fan-Created Concept",
        category: "Fan-Created Simulator Dossier (Unconfirmed)",
        role: "Simulated High-Society Art Fence & Corporate Insider",
        source: "Fan-Created Heist Simulator Archetype (Not Confirmed by Rockstar)",
        actor: "N/A (Fan-Created Concept)",
        district: "Vice City Downtown (Simulated)",
        image: "assets/character-petra.jpg",
        bio: "Fan-Created Syndicate Concept (Not Confirmed by Rockstar Games): A hypothetical high-society corporate insider and fine-art appraiser archetype created for our Heist Planner simulator.",
        specialty: "Simulated Roleplay Concept: Art appraisal & corporate schedule theorycrafting.",
        weapon: "None (Fan-Created Simulator Archetype)",
        weaponLink: "/weapons",
        perk: "Fan-Made Heist Simulator Role (Unconfirmed): Represents a theoretical high-society fence/insider role in squad planning simulations.",
        stats: { decryption: 80, intimidation: 65, combat: 50, wheelman: 60 }
      },
      "phil": {
        name: "Phil",
        alias: "Community / Fan Concept",
        category: "Community / Fan Simulator Dossier (Unconfirmed)",
        role: "Simulated Keys Bush-Pilot & Military Surplus Contact",
        source: "Community Vice City Lore Reference + Fan Simulator Archetype",
        actor: "N/A (Unconfirmed by Rockstar)",
        district: "Leonida Keys / Grassrivers (Simulated)",
        image: "assets/character-phil.jpg",
        bio: "Community Reference + Fan-Simulated Role: Inspired by GTA Vice City arms lore (Phil's Ammu-Nation / military surplus references spotted by community analysts). Not officially confirmed by Rockstar Games as a hireable GTA 6 heist pilot.",
        specialty: "Simulated Roleplay Concept: 5%-cut bush-pilot & heavy ordnance support.",
        weapon: "Heavy Surplus Ordnance (Simulated)",
        weaponLink: "/weapons",
        perk: "Fan-Made Heist Simulator Role (Unconfirmed): Models a 5%-cut bush-pilot and heavy-ordnance support specialist in our Heist Planner.",
        stats: { decryption: 55, intimidation: 85, combat: 90, wheelman: 82 }
      },
      "leonida-joker": {
        name: "Leonida Joker",
        alias: "Trailer 1 Parody Cameo",
        category: "Trailer 1 Viral Cameo • Simulated Crew Role",
        role: "Viral News Broadcast Prisoner • Simulated 6% Cut Decoy",
        source: "Rockstar Trailer 1 News Clip (Cameo) + Fan Simulator Role",
        actor: "Undisclosed (Trailer 1 Parody Cameo)",
        district: "Leonida Courtroom Broadcast",
        image: "assets/character-leonida-joker.jpg?v=20261118_v4",
        bio: "Trailer 1 Viral Cameo + Fan-Simulated Role: The tattooed prisoner shown in a brief news broadcast clip in Rockstar's Trailer 1. While the visual cameo is in Trailer 1, his role as a hireable 6%-cut heist diversion specialist is a fan-made simulator concept.",
        specialty: "Confirmed: Trailer 1 viral prisoner cameo. Simulated Planner Role: Street decoy distraction.",
        weapon: "Smoke Canisters (Simulated Decoy Loadout)",
        weaponLink: "/weapons",
        perk: "Fan-Made Heist Simulator Role (Not an Official Rockstar Perk): Included in our Heist Planner as a humorous 6%-cut street distraction archetype.",
        stats: { decryption: 55, intimidation: 80, combat: 68, wheelman: 65 }
      },
      "valentina": {
        name: "Valentina",
        alias: "Fan-Created Concept",
        category: "Fan-Created Simulator Dossier (Unconfirmed)",
        role: "Simulated Little Cuba Informant (4% Sim Cut)",
        source: "Fan-Created Heist Simulator Archetype (Not Confirmed by Rockstar)",
        actor: "N/A (Fan-Created Concept)",
        district: "Little Cuba, Vice City (Simulated)",
        image: "assets/character-valentina.jpg",
        bio: "Fan-Created Syndicate Concept (Not Confirmed by Rockstar Games): A hypothetical Little Cuba syndicate informant archetype created for heist route planning and squad cut simulations.",
        specialty: "Simulated Roleplay Concept: Convoy schedule scouting & 4% informant cut.",
        weapon: "Compact Sidearm (Simulated)",
        weaponLink: "/weapons",
        perk: "Fan-Made Heist Simulator Role (Unconfirmed): Represents a 4%-cut recon informant option in our Heist Planner.",
        stats: { decryption: 60, intimidation: 82, combat: 78, wheelman: 70 }
      },
      "aunt-tee": {
        name: "Aunt Tee",
        alias: "Community / Fan Concept",
        category: "Community / Fan Simulator Dossier (Unconfirmed)",
        role: "Simulated South Vice Stash Operator (5% Sim Cut)",
        source: "Community File Reference + Fan Simulator Archetype",
        actor: "N/A (Unconfirmed by Rockstar)",
        district: "South Vice City (Simulated)",
        image: "assets/character-aunt-tee.jpg",
        bio: "Community Reference + Fan-Simulated Role: While the name 'Aunt Tee' surfaced in early community analyses, her depiction here as a South Vice stash house operator and 5%-fee cash launderer is a fan-made simulator concept, not a confirmed Rockstar mechanic.",
        specialty: "Simulated Roleplay Concept: Stash house storage & 5% laundering fee model.",
        weapon: "Sawed-Off Shotgun (Simulated)",
        weaponLink: "/weapons",
        perk: "Fan-Made Heist Simulator Role (Unconfirmed): Models a theoretical 5% fence fee tier in our Cash Laundering Simulator (for verified in-game fences like Yasmani and Brian's Lockup 7700, see /properties).",
        stats: { decryption: 50, intimidation: 80, combat: 65, wheelman: 55 }
      }
    },

    
    
    VehicleData: {
      "declasse-tulip": {
            "id": "declasse-tulip",
            "name": "Declasse Tulip M-100",
            "realName": "1972 Chevrolet Chevelle Malibu",
            "category": "Muscle // Tuner",
            "catKey": "muscle",
            "speed": "142 MPH",
            "accel": "4.8s 0-60",
            "handling": "Tuned Drift",
            "armor": "Reinforced Steel",
            "driveType": "RWD V8 Big Block",
            "capacity": "4 Duffel Bags + 2 Long Guns",
            "bulletproof": "Optional Tier 2 Glass",
            "heistRole": "Primary Getaway Car // Jason & Lucia Starter Vehicle",
            "source": "GTA 6 Reveal Trailer (0:42 & Key Art)",
            "image": "assets/vehicle-tulip.jpg?v=20261119_v3",
            "stats": {
                  "speed": 78,
                  "accel": 82,
                  "handling": 74,
                  "armor": 65
            },
            "bio": "The signature personal getaway coupe for Jason and Lucia across Vice City and Kelly County. Powered by a carbureted big-block V8 with low-end torque perfect for power-sliding through narrow alleyways, ducking under highway overpasses, and shaking 3-star VCPD cruisers. Features a deep trunk capable of holding 4 cash bags and hidden stash compartments."
      },
      "bravado-gauntlet-hellfire": {
            "id": "bravado-gauntlet-hellfire",
            "name": "Bravado Gauntlet Hellfire",
            "realName": "Dodge Challenger SRT Demon",
            "category": "Muscle // Supercharged",
            "catKey": "muscle",
            "speed": "162 MPH",
            "accel": "3.4s 0-60",
            "handling": "Heavy Muscle Drift",
            "armor": "Ramming Bumper Ready",
            "driveType": "RWD Supercharged 6.2L HEMI",
            "capacity": "4 Duffel Bags",
            "bulletproof": "Armored Window Slits",
            "heistRole": "High-Impact Pursuit Breaker // Highway Escape",
            "source": "Trailer 1 Vice Beach Strip & Leaks",
            "image": "assets/vehicle-gauntlet-hellfire.jpg?v=20261119_v3",
            "stats": {
                  "speed": 88,
                  "accel": 92,
                  "handling": 68,
                  "armor": 78
            },
            "bio": "Pure American brute force. 700+ supercharged horsepower engineered to break through police blockades and pull away from standard cruisers on long interstate stretches like the Vice City Turnpike. Fitted with heavy ramming bars, it turns head-on PIT maneuvers into devastating counter-attacks."
      },
      "annis-elegy-retro": {
            "id": "annis-elegy-retro",
            "name": "Annis Elegy Retro Custom",
            "realName": "Nissan Skyline GT-R (R32 / R33)",
            "category": "Muscle // Tuner",
            "catKey": "muscle",
            "speed": "154 MPH",
            "accel": "3.6s 0-60",
            "handling": "AWD Precision Track",
            "armor": "Light Carbon Kevlar",
            "driveType": "ATTESA Twin-Turbo AWD",
            "capacity": "3 Duffel Bags + Compact SMG",
            "bulletproof": "Standard Lexan",
            "heistRole": "Alleyway Escape & Undercover Street Meet Racer",
            "source": "Port Gellhorn Street Meet & 2022 Leaks",
            "image": "assets/vehicle-elegy-retro.jpg?v=20261119_v3",
            "stats": {
                  "speed": 84,
                  "accel": 88,
                  "handling": 94,
                  "armor": 52
            },
            "bio": "A legendary JDM tuner favored by Port Gellhorn street syndicates and tech specialists. Its intelligent all-wheel-drive system grips slick Florida rainstorms effortlessly, letting drivers execute sharp 90-degree handbrake turns through Little Haiti alleys where heavier pursuit cruisers spin out."
      },
      "albany-buccaneer": {
            "id": "albany-buccaneer",
            "name": "Albany Buccaneer Custom",
            "realName": "1965 Buick Riviera Lowrider",
            "category": "Muscle // Tuner",
            "catKey": "muscle",
            "speed": "135 MPH",
            "accel": "5.2s 0-60",
            "handling": "Hydraulic Cruiser",
            "armor": "Reinforced Frame",
            "driveType": "RWD V8 Nailhead",
            "capacity": "5 Duffel Bags (Deep Trunk)",
            "bulletproof": "Standard Classic",
            "heistRole": "Low-Profile Covert Smuggling & Cartel Stash Car",
            "source": "Trailer 1 Little Cuba Cruising Scene",
            "image": "assets/vehicle-buccaneer.jpg?v=20261119_v3",
            "stats": {
                  "speed": 72,
                  "accel": 70,
                  "handling": 62,
                  "armor": 70
            },
            "bio": "A timeless Vice City classic lowrider with deep hydraulic suspension, velvet tuck upholstery, and enough trunk volume to hide half a million in laundered cartel bills. Blends in seamlessly among Little Cuba and Starlet Key, rarely drawing unwanted police suspicion."
      },
      "vapid-dominator-asp": {
            "id": "vapid-dominator-asp",
            "name": "Vapid Dominator ASP",
            "realName": "2000 Ford Mustang SVT Cobra R",
            "category": "Muscle // Tuner",
            "catKey": "muscle",
            "speed": "158 MPH",
            "accel": "3.8s 0-60",
            "handling": "Rear Track Sliced",
            "armor": "Roll Cage Stiffened",
            "driveType": "RWD High-Rev V8",
            "capacity": "3 Duffel Bags",
            "bulletproof": "Shatter-Resistant Film",
            "heistRole": "Rapid Interception & Fast Extrication",
            "source": "Stockade Robbery Leak Clip 24",
            "image": "assets/vehicle-dominator-asp.jpg?v=20261119_v3",
            "stats": {
                  "speed": 85,
                  "accel": 86,
                  "handling": 80,
                  "armor": 60
            },
            "bio": "A high-revving track-focused muscle machine spotted in early bank heist rehearsals. Its stiffened chassis and aggressive aero package deliver high-speed stability through the bridges connecting Vice City mainland to the beaches."
      },
      "declasse-vigero-zx": {
            "id": "declasse-vigero-zx",
            "name": "Declasse Vigero ZX Convertible",
            "realName": "Chevrolet Camaro ZL1 Convertible",
            "category": "Muscle // Tuner",
            "catKey": "muscle",
            "speed": "160 MPH",
            "accel": "3.5s 0-60",
            "handling": "Magnetic Ride Control",
            "armor": "Factory Composite",
            "driveType": "RWD 6.2L LT4 Supercharged",
            "capacity": "3 Duffel Bags",
            "bulletproof": "Driver Plate Shield",
            "heistRole": "Drive-By Suppressive Platform // 4-Seater Extraction",
            "source": "Ocean Drive Sunset Cruise Scene",
            "image": "assets/vehicle-vigero-zx.jpg?v=20261119_v3",
            "stats": {
                  "speed": 87,
                  "accel": 90,
                  "handling": 79,
                  "armor": 63
            },
            "bio": "Modern American performance with an open roof option that allows rear crew members to fire 360-degree suppressive automatic fire at pursuing helicopters and patrol vehicles. Features launch control for lightning-fast getaways."
      },
      "dinka-blista-compact": {
            "id": "dinka-blista-compact",
            "name": "Dinka Blista Compact",
            "realName": "1988 Honda CR-X Si",
            "category": "Muscle // Tuner",
            "catKey": "muscle",
            "speed": "128 MPH",
            "accel": "5.8s 0-60",
            "handling": "Ultra-Agile Micro FWD",
            "armor": "Lightweight Unibody",
            "driveType": "FWD 1.6L VTEC",
            "capacity": "2 Duffel Bags + Tools",
            "bulletproof": "None",
            "heistRole": "Pedestrian Alleyway Threader // Anonymous Scout",
            "source": "Ambrosia Strip Mall Leaked Footage",
            "image": "assets/vehicle-blista-compact.jpg?v=20261119_v3",
            "stats": {
                  "speed": 68,
                  "accel": 74,
                  "handling": 92,
                  "armor": 40
            },
            "bio": "Small, featherweight, and practically invisible to police traffic dispatch. Can squeeze through pedestrian bollards, parking garage service walkways, and canal footbridges where heavy squad cars get stuck."
      },
      "bravado-rat-loader": {
            "id": "bravado-rat-loader",
            "name": "Bravado Rat-Loader 500",
            "realName": "1938 Dodge Power Wagon Hot Rod",
            "category": "Muscle // Tuner",
            "catKey": "muscle",
            "speed": "125 MPH",
            "accel": "5.4s 0-60",
            "handling": "Loose Drift",
            "armor": "Solid Cast Iron Engine Block",
            "driveType": "RWD Heavy V8",
            "capacity": "6 Heavy Duffel Bags / Hardware",
            "bulletproof": "Thick Steel Cab",
            "heistRole": "Grassrivers Smuggling & Backwoods Extraction",
            "source": "Kelly County Mudboggers Scene",
            "image": "assets/vehicle-rat-loader.jpg?v=20261119_v3",
            "stats": {
                  "speed": 65,
                  "accel": 72,
                  "handling": 58,
                  "armor": 85
            },
            "bio": "A rust-patinated Kelly County rat rod built on a solid iron ladder frame. Unstoppable when cutting across sugar cane fields and swamp trails to dump heat before hitting the state line."
      },
      "vapid-slamvan-custom": {
            "id": "vapid-slamvan-custom",
            "name": "Vapid Slamvan Custom",
            "realName": "1953 Ford F-100 Slammed Pickup",
            "category": "Muscle // Tuner",
            "catKey": "muscle",
            "speed": "138 MPH",
            "accel": "4.9s 0-60",
            "handling": "Slammed Low-Center Drift",
            "armor": "Reinforced Bed Plates",
            "driveType": "RWD Blown V8",
            "capacity": "8 Duffel Bags in Flatbed",
            "bulletproof": "Cab Armor Plating",
            "heistRole": "Cargo Loot Hauler // Heavy Cash Stash",
            "source": "Wrecked Scrap Yard Leaks",
            "image": "assets/vehicle-slamvan.jpg?v=20261119_v3",
            "stats": {
                  "speed": 74,
                  "accel": 78,
                  "handling": 66,
                  "armor": 75
            },
            "bio": "Custom built by Brian Heder’s chop shop network. Boasts a dropped stance, massive rear tires, and a lockable diamond-plate tonneau cover that secures bulky loot stashes."
      },
      "declasse-sabre-turbo": {
            "id": "declasse-sabre-turbo",
            "name": "Declasse Sabre Turbo Classic",
            "realName": "1970 Oldsmobile 442 W-30",
            "category": "Muscle // Tuner",
            "catKey": "muscle",
            "speed": "146 MPH",
            "accel": "4.5s 0-60",
            "handling": "Linear Muscle Tracking",
            "armor": "Chrome Bumper Shield",
            "driveType": "RWD 455ci Rocket V8",
            "capacity": "4 Duffel Bags",
            "bulletproof": "Optional Front Grille Armor",
            "heistRole": "Drag-Strip Getaway & Highway Disappearance",
            "source": "Vice City North Beach Boulevard",
            "image": "assets/vehicle-sabre-turbo.jpg?v=20261119_v3",
            "stats": {
                  "speed": 80,
                  "accel": 81,
                  "handling": 70,
                  "armor": 66
            },
            "bio": "A high-displacement muscle powerhouse from the golden era of Vice City street racing. Straight-line acceleration can outpace helicopter searchlights across open causeways."
      },
      "albany-hermes": {
            "id": "albany-hermes",
            "name": "Albany Hermes Lead Sled",
            "realName": "1949 Mercury Eight Coupe",
            "category": "Muscle // Tuner",
            "catKey": "muscle",
            "speed": "132 MPH",
            "accel": "5.5s 0-60",
            "handling": "Heavy Boulevard Cruiser",
            "armor": "Thick Gauge Sheet Steel",
            "driveType": "RWD Flathead V8",
            "capacity": "4 Duffel Bags",
            "bulletproof": "Tinted Bullet-Resistant Glass",
            "heistRole": "Syndicate Boss Escort & Mob Safehouse Courier",
            "source": "Little Haiti Gang Meet",
            "image": "assets/vehicle-hermes.jpg?v=20261119_v3",
            "stats": {
                  "speed": 70,
                  "accel": 68,
                  "handling": 60,
                  "armor": 82
            },
            "bio": "Chopped roof, flame job, and airtight bullet-resistant privacy glass. The preferred transport for veteran mob bookmakers moving dirty cash bags without attracting federal eyes."
      },
      "schyster-deviant": {
            "id": "schyster-deviant",
            "name": "Schyster Deviant Restomod",
            "realName": "1972 AMC Javelin AMX Ringbrothers Defiant",
            "category": "Muscle // Tuner",
            "catKey": "muscle",
            "speed": "155 MPH",
            "accel": "3.7s 0-60",
            "handling": "Modernized Track Coilover",
            "armor": "Billet Aluminum Reinforced",
            "driveType": "RWD 6.4L Hellcat Crate",
            "capacity": "3 Duffel Bags",
            "bulletproof": "Underbody Armor",
            "heistRole": "Precision Getaway // High-G Cornering",
            "source": "Port Gellhorn Industrial Strip",
            "image": "assets/vehicle-deviant.jpg?v=20261119_v3",
            "stats": {
                  "speed": 84,
                  "accel": 87,
                  "handling": 82,
                  "armor": 64
            },
            "bio": "A restomod marvel combining vintage muscle lines with 2026 supercar suspension and massive 6-piston Brembo brakes that stop on a dime during tight downtown Vice City evasions."
      },
      "imponte-phoenix": {
            "id": "imponte-phoenix",
            "name": "Imponte Phoenix Trans-Am",
            "realName": "1977 Pontiac Firebird Trans Am",
            "category": "Muscle // Tuner",
            "catKey": "muscle",
            "speed": "144 MPH",
            "accel": "4.6s 0-60",
            "handling": "Rear Slide Oversteer",
            "armor": "T-Top Roll Hoop",
            "driveType": "RWD 400ci V8",
            "capacity": "3 Duffel Bags",
            "bulletproof": "Standard",
            "heistRole": "Decoy Pursuit Distractor // Siren Jammer",
            "source": "Trailer 1 Highway Overpass",
            "image": "assets/vehicle-phoenix.jpg?v=20261119_v3",
            "stats": {
                  "speed": 79,
                  "accel": 80,
                  "handling": 72,
                  "armor": 62
            },
            "bio": "Famous screaming bird hood decal with straight-pipe thunder. Ideal as a designated decoy car to trigger highway pursuit units away from the primary loot truck."
      },
      "bravado-banshee": {
            "id": "bravado-banshee",
            "name": "Bravado Banshee 900R",
            "realName": "Dodge Viper RT/10 & ACR",
            "category": "Sports // Supercar",
            "catKey": "super",
            "speed": "178 MPH",
            "accel": "3.1s 0-60",
            "handling": "Raw Twitch Supercar",
            "armor": "Fiberglass Lightweight",
            "driveType": "RWD 8.4L V10",
            "capacity": "2 Duffel Bags (Tight Boot)",
            "bulletproof": "Windshield Armor Strip",
            "heistRole": "High-Speed Interstate Ghosting",
            "source": "Official GTA 6 Artwork & Downtown Traffic",
            "image": "assets/vehicle-banshee.jpg?v=20261119_v3",
            "stats": {
                  "speed": 94,
                  "accel": 93,
                  "handling": 85,
                  "armor": 48
            },
            "bio": "The immortal king of GTA getaways. 10 cylinders of naturally aspirated terror that hits nearly 180 MPH on the MacArthur Causeway before pursuing police interceptors can shift into top gear."
      },
      "grotti-cheetah": {
            "id": "grotti-cheetah",
            "name": "Grotti Cheetah Classic",
            "realName": "1984 Ferrari Testarossa",
            "category": "Sports // Supercar",
            "catKey": "super",
            "speed": "168 MPH",
            "accel": "3.7s 0-60",
            "handling": "Mid-Engine Flat-12 Balance",
            "armor": "Aluminum Alloy",
            "driveType": "RWD 4.9L Flat-12",
            "capacity": "2 Duffel Bags (Front Frunk)",
            "bulletproof": "Tinted Police-Block Film",
            "heistRole": "Luxury Casino Infiltration & Rapid Evasion",
            "source": "Ocean Drive Art Deco Strip (Trailer 1)",
            "image": "assets/vehicle-cheetah.jpg?v=20261119_v3",
            "stats": {
                  "speed": 89,
                  "accel": 87,
                  "handling": 88,
                  "armor": 50
            },
            "bio": "The definitive Miami Vice symbol. Side strakes, pop-up headlights, and a flat-12 exhaust scream that echoes off the neon hotel facades of Ocean Beach. Perfect for high-stakes casino infiltrations."
      },
      "pfister-comet-s2": {
            "id": "pfister-comet-s2",
            "name": "Pfister Comet S2 Cabrio",
            "realName": "Porsche 911 Turbo S Cabriolet (992)",
            "category": "Sports // Supercar",
            "catKey": "super",
            "speed": "175 MPH",
            "accel": "2.6s 0-60",
            "handling": "Rear-Engine All-Wheel Grip",
            "armor": "Ceramic Composite",
            "driveType": "AWD Twin-Turbo 3.8L Flat-6",
            "capacity": "2 Duffel Bags (Frunk)",
            "bulletproof": "Reinforced A-Pillars",
            "heistRole": "Rain-Proof Wet Weather Getaway",
            "source": "Starlet Key Bridge Crossing Scene",
            "image": "assets/vehicle-comet-s2.jpg?v=20261119_v3",
            "stats": {
                  "speed": 93,
                  "accel": 98,
                  "handling": 95,
                  "armor": 56
            },
            "bio": "Launches from 0 to 60 in 2.6 seconds flat, even on wet asphalt during tropical thunderstorms. If a bank job turns hot in torrential rain, this is the #1 exfiltration vehicle in Leonida."
      },
      "invetero-coquette-d10": {
            "id": "invetero-coquette-d10",
            "name": "Invetero Coquette D10",
            "realName": "Chevrolet Corvette C8 Stingray",
            "category": "Sports // Supercar",
            "catKey": "super",
            "speed": "172 MPH",
            "accel": "2.9s 0-60",
            "handling": "Mid-Engine Downforce Tuned",
            "armor": "Composite Honeycomb",
            "driveType": "RWD 6.2L Mid-Mounted LT2 V8",
            "capacity": "3 Duffel Bags (Frunk + Trunk)",
            "bulletproof": "Lightweight Armor Plating",
            "heistRole": "VIP Fast Extraction // Highway Pursuit Disruption",
            "source": "Trailer 1 Freeway Chase Scene",
            "image": "assets/vehicle-coquette-d10.jpg?v=20261119_v3",
            "stats": {
                  "speed": 91,
                  "accel": 95,
                  "handling": 90,
                  "armor": 58
            },
            "bio": "American mid-engine exotic capable of supercar speeds at a fraction of the maintenance footprint. Dual luggage compartments allow splitting cash packs between front and rear bays."
      },
      "grotti-furia": {
            "id": "grotti-furia",
            "name": "Grotti Furia Hypercar",
            "realName": "Pininfarina Battista / Ferrari SF90",
            "category": "Sports // Supercar",
            "catKey": "super",
            "speed": "188 MPH",
            "accel": "2.3s 0-60",
            "handling": "Active Aero Butterfly Flaps",
            "armor": "Carbon Monocoque Cage",
            "driveType": "AWD Hybrid Tri-Motor",
            "capacity": "1 High-Value Jewelry Case",
            "bulletproof": "Full Run-Flat Compound",
            "heistRole": "Ultra-High Value Diamond & Bearer Bond Courier",
            "source": "Venetian Way Penthouse Driveway Scene",
            "image": "assets/vehicle-furia.jpg?v=20261119_v3",
            "stats": {
                  "speed": 98,
                  "accel": 99,
                  "handling": 97,
                  "armor": 55
            },
            "bio": "The peak of European hypercar luxury in Vice City. With active aerodynamic spoilers and hybrid electric boost, it vanishes into thin air before dispatch can coordinate spike strips."
      },
      "dewbauchee-champion": {
            "id": "dewbauchee-champion",
            "name": "Dewbauchee Champion Spec",
            "realName": "Aston Martin Victor / Vulcan",
            "category": "Sports // Supercar",
            "catKey": "super",
            "speed": "174 MPH",
            "accel": "3.0s 0-60",
            "handling": "GT Endurance Downforce",
            "armor": "Imani Tech Armor Plating",
            "driveType": "RWD 7.3L V12",
            "capacity": "2 Duffel Bags",
            "bulletproof": "Missile Lock-On Jammer + Slick",
            "heistRole": "Counter-Surveillance Escort Vehicle",
            "source": "Vice City Marina Leaked Parking Deck",
            "image": "assets/vehicle-champion.jpg?v=20261119_v3",
            "stats": {
                  "speed": 92,
                  "accel": 92,
                  "handling": 91,
                  "armor": 88
            },
            "bio": "Equipped with cutting-edge radar jamming technology that disrupts police helicopter search tracking and automated speed cameras throughout downtown Vice City."
      },
      "pegassi-torero-xo": {
            "id": "pegassi-torero-xo",
            "name": "Pegassi Torero XO",
            "realName": "Lamborghini Countach LPI 800-4",
            "category": "Sports // Supercar",
            "catKey": "super",
            "speed": "184 MPH",
            "accel": "2.5s 0-60",
            "handling": "All-Wheel Torque Vectoring",
            "armor": "Carbon Fiber Skin",
            "driveType": "AWD 6.5L V12 Hybrid",
            "capacity": "1 Diamond Stash Bag",
            "bulletproof": "Reinforced Monocoque",
            "heistRole": "Executive Syndicate Interceptor",
            "source": "Trailer 1 Starlet Key Yacht Club",
            "image": "assets/vehicle-torero-xo.jpg?v=20261119_v3",
            "stats": {
                  "speed": 97,
                  "accel": 97,
                  "handling": 93,
                  "armor": 54
            },
            "bio": "Scissor doors, angular retro-futuristic bodywork, and a blistering top speed that leaves state trooper Ford Explorers choking on rubber fumes."
      },
      "grotti-carbonizzare": {
            "id": "grotti-carbonizzare",
            "name": "Grotti Carbonizzare Spyder",
            "realName": "Ferrari California T / F12",
            "category": "Sports // Supercar",
            "catKey": "super",
            "speed": "166 MPH",
            "accel": "3.4s 0-60",
            "handling": "Predictable Grand Tourer",
            "armor": "Factory Composite",
            "driveType": "RWD Twin-Turbo V8",
            "capacity": "3 Duffel Bags",
            "bulletproof": "Standard Lexan",
            "heistRole": "Undercover Social Infiltration // Valet Swap",
            "source": "Downtown Vice City Financial District",
            "image": "assets/vehicle-carbonizzare.jpg?v=20261119_v3",
            "stats": {
                  "speed": 88,
                  "accel": 89,
                  "handling": 87,
                  "armor": 58
            },
            "bio": "Retractable hardtop convertible that allows blending in with high-society patrons outside vice bank vaults before switching tags and executing a rapid escape."
      },
      "benefactor-schafter-v12": {
            "id": "benefactor-schafter-v12",
            "name": "Benefactor Schafter V12 Armored",
            "realName": "Mercedes-AMG S65 V12 Biturbo",
            "category": "Sports // Supercar",
            "catKey": "super",
            "speed": "165 MPH",
            "accel": "3.3s 0-60",
            "handling": "Executive Heavy Grip",
            "armor": "B6 Ballistic Armored Glass & Steel",
            "driveType": "RWD 6.0L Twin-Turbo V12",
            "capacity": "5 Duffel Bags (Full Sized Sedan)",
            "bulletproof": "Withstands 15 AR Rounds per Panel",
            "heistRole": "Executive VIP Extrication & 4-Man Crew Escape",
            "source": "Bank Transit Robbery Leak Sequence",
            "image": "assets/vehicle-schafter-v12.jpg?v=20261119_v3",
            "stats": {
                  "speed": 89,
                  "accel": 90,
                  "handling": 82,
                  "armor": 86
            },
            "bio": "The undisputed king of 4-door armored extraction sedans. Protects all 4 crew members from sniper rifle fire while hitting 165 MPH down the interstate."
      },
      "pfister-astron-custom": {
            "id": "pfister-astron-custom",
            "name": "Pfister Astron Custom",
            "realName": "Porsche Macan GTS Turbo",
            "category": "Sports // Supercar",
            "catKey": "super",
            "speed": "160 MPH",
            "accel": "3.5s 0-60",
            "handling": "Performance SUV Cornering",
            "armor": "Reinforced Floor Pan",
            "driveType": "AWD 2.9L Twin-Turbo V6",
            "capacity": "6 Duffel Bags (SUV Cargo Bay)",
            "bulletproof": "Heavier Tint Windows",
            "heistRole": "Rapid Squad Transport // Curb-Jumping Utility",
            "source": "Kelly County Suburb Highway Scene",
            "image": "assets/vehicle-astron.jpg?v=20261119_v3",
            "stats": {
                  "speed": 86,
                  "accel": 89,
                  "handling": 86,
                  "armor": 72
            },
            "bio": "Combines the interior cargo space of an SUV with the cornering reflexes of a 911. Can jump concrete highway medians without tearing out its oil pan."
      },
      "progen-itali-gtb": {
            "id": "progen-itali-gtb",
            "name": "Progen Itali GTB Custom",
            "realName": "McLaren 570S / 650S GT3",
            "category": "Sports // Supercar",
            "catKey": "super",
            "speed": "180 MPH",
            "accel": "2.8s 0-60",
            "handling": "Carbon Mono-Cell Precision",
            "armor": "Ultra-Lightweight",
            "driveType": "RWD Twin-Turbo V8",
            "capacity": "2 Duffel Bags",
            "bulletproof": "Track Lexan",
            "heistRole": "Sprint Evasion // Causeway Crossing",
            "source": "Vice Port Container Yard Leak",
            "image": "assets/vehicle-itali-gtb.jpg?v=20261119_v3",
            "stats": {
                  "speed": 95,
                  "accel": 96,
                  "handling": 94,
                  "armor": 50
            },
            "bio": "Track-tuned aerodynamic downforce and instantaneous throttle response make this British supercar practically untouchable in sweeping high-speed bends."
      },
      "ocelot-jugular": {
            "id": "ocelot-jugular",
            "name": "Ocelot Jugular Super Sedan",
            "realName": "Jaguar XE SV Project 8",
            "category": "Sports // Supercar",
            "catKey": "super",
            "speed": "164 MPH",
            "accel": "3.2s 0-60",
            "handling": "AWD Competition Setup",
            "armor": "Roll Cage Stiffened Unibody",
            "driveType": "AWD 5.0L Supercharged V8",
            "capacity": "4 Duffel Bags",
            "bulletproof": "Kevlar Seat Inserts",
            "heistRole": "Aggressive 4-Man Hit-and-Run Platform",
            "source": "Trailer 1 Nightclub Alleyway",
            "image": "assets/vehicle-jugular.jpg?v=20261119_v3",
            "stats": {
                  "speed": 88,
                  "accel": 91,
                  "handling": 89,
                  "armor": 68
            },
            "bio": "A 600-horsepower all-wheel-drive super sedan with a guttural supercharger whine. Seats 4 heavily armed crew operatives with gear while keeping pace with mid-engine exotics."
      },
      "vcpd-cruiser": {
            "id": "vcpd-cruiser",
            "name": "VCPD Police Interceptor Cruiser",
            "realName": "Ford Police Interceptor Sedan (Taurus) & Crown Vic",
            "category": "Pursuit // Armored",
            "catKey": "pursuit",
            "speed": "148 MPH",
            "accel": "4.2s 0-60",
            "handling": "Heavy-Duty Pursuit Suspension",
            "armor": "Push Bumper + Ballistic Doors",
            "driveType": "AWD 3.5L Twin-Turbo EcoBoost",
            "capacity": "4 Seized Contraband Bags",
            "bulletproof": "Level III Door Armor Panels",
            "heistRole": "Infiltration Disguise // Police Radio Scanner Hub",
            "source": "Official Artwork & Trailer 1 Patrol Chase",
            "image": "assets/vehicle-vcpd-cruiser.jpg?v=20261119_v3",
            "stats": {
                  "speed": 81,
                  "accel": 84,
                  "handling": 78,
                  "armor": 85
            },
            "bio": "The front-line squad car of the Vice City Police Department. Equipped with automated license-plate recognition cameras, emergency strobe arrays, and heavy-duty steel push bumpers designed for PIT maneuvers at 90+ MPH. Stealing one grants real-time access to police tactical radio frequencies."
      },
      "buffalo-stx": {
            "id": "buffalo-stx",
            "name": "Bravado Buffalo STX Pursuit Package",
            "realName": "Dodge Charger SRT Hellcat Police Package",
            "category": "Pursuit // Armored",
            "catKey": "pursuit",
            "speed": "165 MPH",
            "accel": "3.3s 0-60",
            "handling": "Reinforced Highway Interceptor",
            "armor": "B4 Kevlar Lining + Ram Bumper",
            "driveType": "AWD Supercharged V8",
            "capacity": "4 Duffel Bags in Trunk",
            "bulletproof": "Bulletproof Windshield + Run-Flats",
            "heistRole": "Undercover High-Speed Interceptor & Counter-Ramming",
            "source": "Freeway Pursuit & Highway Patrol Leaks",
            "image": "assets/vehicle-buffalo-stx.jpg?v=20261119_v3",
            "stats": {
                  "speed": 90,
                  "accel": 93,
                  "handling": 83,
                  "armor": 88
            },
            "bio": "Assigned to the Leonida Highway Patrol Special Response Unit. Features reinforced steel wheels, push-bar bumper extensions, and a high-output supercharged engine capable of overtaking modified street racers on open causeways."
      },
      "vcpd-riot": {
            "id": "vcpd-riot",
            "name": "Brute Tactical Riot Enforcer",
            "realName": "Lenco BearCat Tactical Armored Vehicle",
            "category": "Pursuit // Armored",
            "catKey": "pursuit",
            "speed": "110 MPH",
            "accel": "7.5s 0-60",
            "handling": "Heavy Armored Chassis",
            "armor": "Mil-Spec Ballistic Steel Class IV",
            "driveType": "4WD Heavy Diesel Turbo",
            "capacity": "12 Full Gear Duffel Bags + 8 Operatives",
            "bulletproof": "Complete Bulletproof Glass & Tires",
            "heistRole": "Unstoppable Extraction Fortress // Bank Door Breacher",
            "source": "Trailer 1 Tactical SWAT Deployment Scene",
            "image": "assets/vehicle-vcpd-riot.jpg?v=20261119_v3",
            "stats": {
                  "speed": 58,
                  "accel": 52,
                  "handling": 50,
                  "armor": 99
            },
            "bio": "A 17,000-pound armored juggernaut impervious to small-arms fire and spike strips. Its hydraulic front ram plate can smash through security gates, bank security roll-up doors, and police roadblock vehicles."
      },
      "vcpd-park-ranger": {
            "id": "vcpd-park-ranger",
            "name": "Declasse Granger 3600LX Park Ranger",
            "realName": "Chevrolet Suburban 2500 Heavy Duty",
            "category": "Pursuit // Armored",
            "catKey": "pursuit",
            "speed": "135 MPH",
            "accel": "5.1s 0-60",
            "handling": "High-Clearance Off-Road",
            "armor": "Underbody Skid Plates & Grille Guard",
            "driveType": "4WD 6.6L Duramax Diesel",
            "capacity": "8 Duffel Bags",
            "bulletproof": "Front Cab Reinforcements",
            "heistRole": "Swamp & Grassrivers Off-Grid Exfiltration",
            "source": "Grassrivers Leaked Patrol Encounter",
            "image": "assets/vehicle-park-ranger.jpg?v=20261119_v3",
            "stats": {
                  "speed": 73,
                  "accel": 74,
                  "handling": 70,
                  "armor": 84
            },
            "bio": "Patrols the vast Grassrivers wetland park perimeter. Equipped with roof lightbars, off-road winches, and lifted heavy suspension that charges through 3 feet of swamp water without stalling."
      },
      "vcpd-unmarked": {
            "id": "vcpd-unmarked",
            "name": "VCPD Unmarked Tactical Cruiser",
            "realName": "Ford Police Interceptor Utility (Explorer) Unmarked",
            "category": "Pursuit // Armored",
            "catKey": "pursuit",
            "speed": "146 MPH",
            "accel": "4.4s 0-60",
            "handling": "Concealed Pursuit Spec",
            "armor": "Hidden Ballistic Composite Plating",
            "driveType": "AWD 3.0L Twin-Turbo EcoBoost",
            "capacity": "5 Duffel Bags + Surveillance Gear",
            "bulletproof": "Level III-A Hidden Window Laminate",
            "heistRole": "Covert Recon & Ambush Point Extraction",
            "source": "Ambrosia Motel Surveillance Leak",
            "image": "assets/vehicle-vcpd-unmarked.jpg?v=20261119_v3",
            "stats": {
                  "speed": 82,
                  "accel": 85,
                  "handling": 80,
                  "armor": 86
            },
            "bio": "Blends into civilian traffic with zero external roof lights or livery. Hidden blue-and-red strobes behind the grille allow sudden tactical ambushes and high-speed pursuit interception."
      },
      "predator-patrol": {
            "id": "predator-patrol",
            "name": "Coast Guard Predator Interceptor",
            "realName": "Safe Boats International 33-Foot Full Cabin",
            "category": "Pursuit // Armored",
            "catKey": "pursuit",
            "speed": "75 Knots (86 MPH)",
            "accel": "Instant Jet Drive",
            "handling": "Wave-Cutting Deep-V Hull",
            "armor": "Foam Collar Collar + Kevlar Helm",
            "driveType": "Twin 350HP Outboard Marine",
            "capacity": "8 Duffel Bags",
            "bulletproof": "Bridge Glass Level III",
            "heistRole": "Maritime Contraband Interception & Water Evade",
            "source": "Vice City Harbor Leaks & Trailer 1 Marina",
            "image": "assets/vehicle-predator-patrol.jpg?v=20261119_v3",
            "stats": {
                  "speed": 78,
                  "accel": 82,
                  "handling": 84,
                  "armor": 80
            },
            "bio": "The maritime enforcement arm of Leonida State. Armed with dual high-output outboards that track down cigarette smuggling boats through Biscayne Bay and outer barrier reefs."
      },
      "vcpd-maverick": {
            "id": "vcpd-maverick",
            "name": "VCPD Police Maverick Chopper",
            "realName": "Airbus Helicopters H125 / AS350 AStar",
            "category": "Pursuit // Armored",
            "catKey": "pursuit",
            "speed": "160 MPH Airspeed",
            "accel": "Turbine Rotor Lift",
            "handling": "High Altitude Overwatch",
            "armor": "Cockpit Ceramic Floor Armor",
            "driveType": "Turbomeca Arriel 2D Turboshaft",
            "capacity": "4 Crew + 4 Rucksacks",
            "bulletproof": "Lower Cockpit Deflection",
            "heistRole": "High-Altitude Overwatch & Sniper Platform",
            "source": "Trailer 1 Vice City Skyline Night Searchlight",
            "image": "assets/vehicle-police-maverick.jpg?v=20261119_v3",
            "stats": {
                  "speed": 87,
                  "accel": 85,
                  "handling": 88,
                  "armor": 70
            },
            "bio": "Equipped with a high-intensity NightSun searchlight and FLIR thermal camera that tracks suspects through building shadow lines. Stealing one provides an unmatched rooftop heist escape route."
      },
      "karin-rebel": {
            "id": "karin-rebel",
            "name": "Karin Rebel 4x4 Off-Road",
            "realName": "1985 Toyota Hilux 4WD Pickup",
            "category": "SUV // Off-Road",
            "catKey": "suv",
            "speed": "124 MPH",
            "accel": "5.9s 0-60",
            "handling": "All-Terrain Mud Crawl",
            "armor": "Tubular Steel Exo-Cage",
            "driveType": "4WD 22R-E Indestructible 4-Cyl",
            "capacity": "6 Duffel Bags in Truck Bed",
            "bulletproof": "Standard",
            "heistRole": "Everglades Swamp Exfiltration & Bayou Crossing",
            "source": "Grassrivers Gator Farm Scene",
            "image": "assets/vehicle-karin-rebel.jpg?v=20261119_v3",
            "stats": {
                  "speed": 65,
                  "accel": 68,
                  "handling": 82,
                  "armor": 76
            },
            "bio": "Virtually unkillable Japanese truck famous for surviving extreme abuse. Fitted with 35-inch swamp tires and snorkel intake to cross deep bayous where city squad cars flood their engines."
      },
      "vapid-sandking-xl": {
            "id": "vapid-sandking-xl",
            "name": "Vapid Sandking XL Crew Cab",
            "realName": "Ford F-350 Super Duty Dually Lifted",
            "category": "SUV // Off-Road",
            "catKey": "suv",
            "speed": "130 MPH",
            "accel": "5.3s 0-60",
            "handling": "Heavy Lifted Traction",
            "armor": "Heavy-Duty Steel Bumpers",
            "driveType": "4WD 6.7L Power Stroke Turbo Diesel",
            "capacity": "10 Duffel Bags / Heavy Crates",
            "bulletproof": "High Cab Clearance",
            "heistRole": "Obstacle Crusher & Heavy Payday Hauler",
            "source": "Trailer 1 Mud Club & Dirt Track Scene",
            "image": "assets/vehicle-sandking-xl.jpg?v=20261119_v3",
            "stats": {
                  "speed": 69,
                  "accel": 75,
                  "handling": 68,
                  "armor": 88
            },
            "bio": "Monstrous ground clearance that literally drives over normal civilian sedans during traffic gridlocks. The heavy-duty suspension absorbs 4-foot curb drops without flinching."
      },
      "canis-seminole-frontier": {
            "id": "canis-seminole-frontier",
            "name": "Canis Seminole Frontier 4x4",
            "realName": "1995 Jeep Grand Cherokee (ZJ)",
            "category": "SUV // Off-Road",
            "catKey": "suv",
            "speed": "132 MPH",
            "accel": "5.2s 0-60",
            "handling": "Quadra-Trac 4WD",
            "armor": "Roof Rack Cargo Steel",
            "driveType": "4WD 5.2L Magnum V8",
            "capacity": "5 Duffel Bags",
            "bulletproof": "Standard",
            "heistRole": "Low-Key Country Getaway & Smuggler Trail Runner",
            "source": "Ambrosia Motel Parking Lot",
            "image": "assets/vehicle-seminole.jpg?v=20261119_v3",
            "stats": {
                  "speed": 70,
                  "accel": 74,
                  "handling": 76,
                  "armor": 65
            },
            "bio": "A favorite of Leonida locals and back-alley runners. Low key, easy to hotwire, and equipped with a full-time 4WD transfer case that cuts across marsh ditches unnoticed."
      },
      "benefactor-dubsta-6x6": {
            "id": "benefactor-dubsta-6x6",
            "name": "Benefactor Dubsta 6x6 Heavy",
            "realName": "Mercedes-Benz G63 AMG 6x6",
            "category": "SUV // Off-Road",
            "catKey": "suv",
            "speed": "140 MPH",
            "accel": "4.4s 0-60",
            "handling": "6-Wheel Portal Axle Grip",
            "armor": "Military Grade Reinforced Belly",
            "driveType": "6x6 Twin-Turbo 5.5L V8",
            "capacity": "8 Duffel Bags",
            "bulletproof": "Reinforced Cab Panels",
            "heistRole": "Multi-Terrain Armored Convoy Lead",
            "source": "Venetian Islands High-Net-Worth Security",
            "image": "assets/vehicle-dubsta-6x6.jpg?v=20261119_v3",
            "stats": {
                  "speed": 76,
                  "accel": 82,
                  "handling": 74,
                  "armor": 92
            },
            "bio": "With six driven wheels on portal axles, this bespoke military-derived juggernaut climbs over shoreline seawalls and mud dunes that leave standard pursuit SUVs high-centered."
      },
      "bravado-dorado": {
            "id": "bravado-dorado",
            "name": "Bravado Dorado Custom",
            "realName": "1998 Dodge Durango SLT",
            "category": "SUV // Off-Road",
            "catKey": "suv",
            "speed": "134 MPH",
            "accel": "5.0s 0-60",
            "handling": "Rugged Midsize Body-on-Frame",
            "armor": "Factory Bullbar Option",
            "driveType": "4WD 5.9L Magnum V8",
            "capacity": "5 Duffel Bags",
            "bulletproof": "Standard",
            "heistRole": "Family-Profile Covert Getaway SUV",
            "source": "Vice City Suburb Leaks",
            "image": "assets/vehicle-dorado.jpg?v=20261119_v3",
            "stats": {
                  "speed": 71,
                  "accel": 76,
                  "handling": 72,
                  "armor": 68
            },
            "bio": "The definition of urban camouflage. Looks like an ordinary grocery-getter from 50 yards away, but packs a torquey Magnum V8 that hauls a full 4-man crew away from downtown jewelry stores."
      },
      "albany-cavalcade-xl": {
            "id": "albany-cavalcade-xl",
            "name": "Albany Cavalcade XL Luxury",
            "realName": "2023 Cadillac Escalade-V",
            "category": "SUV // Off-Road",
            "catKey": "suv",
            "speed": "152 MPH",
            "accel": "3.9s 0-60",
            "handling": "Magnetic Air Suspension",
            "armor": "Thick Acoustic Laminated Glass",
            "driveType": "AWD 6.2L Supercharged V8",
            "capacity": "7 Duffel Bags (Massive Cabin)",
            "bulletproof": "Tier 2 Ballistic Option",
            "heistRole": "Cartel Boss Escort & Heavy Syndicate Command",
            "source": "Starlet Key Mansion Gates (Trailer 1)",
            "image": "assets/vehicle-cavalcade-xl.jpg?v=20261119_v3",
            "stats": {
                  "speed": 82,
                  "accel": 86,
                  "handling": 78,
                  "armor": 80
            },
            "bio": "682 supercharged horses wrapped in obsidian black leather and chrome. Provides bullet-resistant privacy for crew commanders coordinating escape routes via the syndicate second screen."
      },
      "mammoth-patriot-milspec": {
            "id": "mammoth-patriot-milspec",
            "name": "Mammoth Patriot Mil-Spec",
            "realName": "Hummer H1 Alpha Tactical",
            "category": "SUV // Off-Road",
            "catKey": "suv",
            "speed": "120 MPH",
            "accel": "6.4s 0-60",
            "handling": "Ultra-Wide Track Stability",
            "armor": "Heavy Aluminum Ballistic Floorpan",
            "driveType": "4WD 6.6L V8 Turbo Diesel",
            "capacity": "8 Duffel Bags",
            "bulletproof": "Central Tire Inflation + Shield Glass",
            "heistRole": "Spike-Strip Immune Ram Vehicle",
            "source": "Military Armory Leaks",
            "image": "assets/vehicle-patriot-milspec.jpg?v=20261119_v3",
            "stats": {
                  "speed": 62,
                  "accel": 65,
                  "handling": 70,
                  "armor": 96
            },
            "bio": "Wider than a city bus lane, this military workhorse plows through spike strips using an onboard central tire inflation system that keeps moving even with punctured rubber."
      },
      "declasse-rancher-xl": {
            "id": "declasse-rancher-xl",
            "name": "Declasse Rancher XL 4x4",
            "realName": "1988 Chevrolet Suburban K20",
            "category": "SUV // Off-Road",
            "catKey": "suv",
            "speed": "126 MPH",
            "accel": "5.8s 0-60",
            "handling": "Solid Axle Heavy Duty",
            "armor": "Heavy Steel Bumpers",
            "driveType": "4WD 350ci Small Block V8",
            "capacity": "8 Duffel Bags",
            "bulletproof": "Standard",
            "heistRole": "Undercover Stash Hauler & Country Evade",
            "source": "Kelly County Bait Shop Leaks",
            "image": "assets/vehicle-rancher-xl.jpg?v=20261119_v3",
            "stats": {
                  "speed": 66,
                  "accel": 70,
                  "handling": 69,
                  "armor": 78
            },
            "bio": "A vintage steel-bodied utility workhorse with endless interior cabin room to stack millions in stolen bank bills under fishing gear and camping equipment."
      },
      "nagasaki-street-blazer": {
            "id": "nagasaki-street-blazer",
            "name": "Nagasaki Street Blazer ATV",
            "realName": "Yamaha Banshee 350 Quad Mod",
            "category": "SUV // Off-Road",
            "catKey": "suv",
            "speed": "115 MPH",
            "accel": "3.8s 0-60",
            "handling": "All-Terrain Quick Yaw",
            "armor": "Open Air (None)",
            "driveType": "RWD Twin-Cylinder 2-Stroke",
            "capacity": "1 Backpack",
            "bulletproof": "None",
            "heistRole": "Swamp Trail Quick Scout & Beach Infiltration",
            "source": "Trailer 1 Vice Beach Sand Cruising Scene",
            "image": "assets/vehicle-street-blazer.jpg?v=20261119_v3",
            "stats": {
                  "speed": 72,
                  "accel": 88,
                  "handling": 92,
                  "armor": 25
            },
            "bio": "Lightweight two-stroke quad bike that cuts across soft beach sands, coastal dunes, and narrow swamp embankments where heavy four-wheeled pursuit cruisers immediately sink."
      },
      "seasparrow": {
            "id": "seasparrow",
            "name": "Sea Sparrow Amphibious Chopper",
            "realName": "Bell 47 / Model 206 Float Helicopter",
            "category": "Marine // Aircraft",
            "catKey": "marine",
            "speed": "145 Knots (167 MPH)",
            "accel": "Rapid Marine Lift",
            "handling": "Water Landing Stable",
            "armor": "Pontoon Deflection",
            "driveType": "Turboshaft Single Rotor",
            "capacity": "4 Crew + 4 Duffel Bags",
            "bulletproof": "Reinforced Pontoon Skids",
            "heistRole": "Offshore Yacht Raid & Marsh Extraction",
            "source": "Vice City Waterways Leak",
            "image": "assets/vehicle-seasparrow.jpg?v=20261119_v3",
            "stats": {
                  "speed": 88,
                  "accel": 84,
                  "handling": 90,
                  "armor": 64
            },
            "bio": "Fitted with twin marine pontoons, the Sea Sparrow lands on ocean swells, inland canals, and swamp bayous alike. The ultimate water-to-air escape vehicle for offshore luxury yacht robberies."
      },
      "grotti-squalo": {
            "id": "grotti-squalo",
            "name": "Grotti Squalo Cigarette Boat",
            "realName": "1987 Cigarette 38 Top Gun Offshore Racer",
            "category": "Marine // Aircraft",
            "catKey": "marine",
            "speed": "85 Knots (98 MPH)",
            "accel": "Twin Big-Block Roar",
            "handling": "Deep-V Wave Slicer",
            "armor": "Kevlar Reinforced Hull",
            "driveType": "Twin 502ci Mercruiser Marine Engines",
            "capacity": "6 Duffel Bags in Forward Cabin",
            "bulletproof": "Gunwale Shields",
            "heistRole": "Maritime Contraband Dash to International Waters",
            "source": "Official Artwork & Trailer 1 Marina Scene",
            "image": "assets/vehicle-squalo.jpg?v=20261119_v3",
            "stats": {
                  "speed": 92,
                  "accel": 94,
                  "handling": 86,
                  "armor": 60
            },
            "bio": "The quintessential Vice City cigarette speed racer. Cracks 85 knots over choppy coastal swells, easily outrunning standard police harbor patrol craft as you head into international waters."
      },
      "shitzu-tropic": {
            "id": "shitzu-tropic",
            "name": "Shitzu Tropic Cabin Cruiser",
            "realName": "Sunseeker Portofino 40 Express Cruiser",
            "category": "Marine // Aircraft",
            "catKey": "marine",
            "speed": "55 Knots (63 MPH)",
            "accel": "Dual Diesel Torque",
            "handling": "Stable Coastal Cruising",
            "armor": "Fiberglass Heavy Hull",
            "driveType": "Twin Volvo Penta IPS Diesels",
            "capacity": "12 Duffel Bags + Living Quarters",
            "bulletproof": "Tinted Cabin Glass",
            "heistRole": "Floating Mobile Safehouse & Laundering Front",
            "source": "Starlet Key Luxury Mooring Leaks",
            "image": "assets/vehicle-tropic-cruiser.jpg?v=20261119_v3",
            "stats": {
                  "speed": 68,
                  "accel": 72,
                  "handling": 78,
                  "armor": 70
            },
            "bio": "Equipped with lower sleeping berths, kitchen galley, and a private stash hold to count cash while anchored off the Key West archipelago."
      },
      "nagasaki-dinghy": {
            "id": "nagasaki-dinghy",
            "name": "Nagasaki Dinghy Tactical RIB",
            "realName": "Zodiac Hurricane 733 Military Inflatable",
            "category": "Marine // Aircraft",
            "catKey": "marine",
            "speed": "65 Knots (75 MPH)",
            "accel": "Instant Marine Thrust",
            "handling": "Inflatable Collar High-G Turn",
            "armor": "Reinforced Multi-Chamber Collar",
            "driveType": "Twin 300HP Yamaha Outboards",
            "capacity": "6 Duffel Bags + Scuba Gear",
            "bulletproof": "Puncture Resistant Sponson Tubes",
            "heistRole": "Stealth Shoreline Landing & Storm Drain Insertion",
            "source": "Vice Port Drainage Infiltration Sequence",
            "image": "assets/vehicle-nagasaki-dinghy.jpg?v=20261119_v3",
            "stats": {
                  "speed": 82,
                  "accel": 86,
                  "handling": 92,
                  "armor": 58
            },
            "bio": "Rigid inflatable hull favored by navy SEAL teams and syndicate divers. Can navigate extremely shallow storm runoff canals right beneath downtown Vice City bank vaults."
      },
      "dinka-marquis": {
            "id": "dinka-marquis",
            "name": "Dinka Marquis Luxury Sailboat",
            "realName": "Beneteau Oceanis 51.1 Sailing Yacht",
            "category": "Marine // Aircraft",
            "catKey": "marine",
            "speed": "25 Knots Wind Assisted",
            "accel": "Silent Sail Propulsion",
            "handling": "Keel-Ballasted Ocean Cruising",
            "armor": "Thick Composite Keel",
            "driveType": "Auxiliary Diesel + Canvas Sails",
            "capacity": "15 Duffel Bags (Deep Bilge Stash)",
            "bulletproof": "Zero (Radar Absorbent Profile)",
            "heistRole": "Silent Zero-Radar Contraband Exfiltration",
            "source": "Trailer 1 Biscayne Bay Sailboats",
            "image": "assets/vehicle-marquis-sailboat.jpg?v=20261119_v3",
            "stats": {
                  "speed": 45,
                  "accel": 40,
                  "handling": 75,
                  "armor": 55
            },
            "bio": "Produces zero engine noise and a tiny radar signature under sail. Ideal for smuggling millions worth of diamonds and bearer bonds past Coast Guard thermal listening buoys."
      },
      "western-duster": {
            "id": "western-duster",
            "name": "Western Duster Crop Duster Plane",
            "realName": "Air Tractor AT-502B Crop Duster",
            "category": "Marine // Aircraft",
            "catKey": "marine",
            "speed": "170 MPH Airspeed",
            "accel": "Turboprop Takeoff 400ft",
            "handling": "Low-Altitude Bush Maneuver",
            "armor": "Tubular Steel Frame",
            "driveType": "Pratt & Whitney PT6A Turboprop",
            "capacity": "Chemical Hopper Stash (500 Gallons / Cash)",
            "bulletproof": "None",
            "heistRole": "Grassrivers Smuggler Landing Strip Insertion",
            "source": "Kelly County Farmland Scene",
            "image": "assets/vehicle-western-duster.jpg?v=20261119_v3",
            "stats": {
                  "speed": 86,
                  "accel": 90,
                  "handling": 88,
                  "armor": 42
            },
            "bio": "Can take off and land on unpaved dirt dikes and sugar cane roads in under 400 feet. The empty chemical hopper holds enough bulk cash to clear out an entire county bank vault."
      },
      "buckingham-maverick": {
            "id": "buckingham-maverick",
            "name": "Buckingham Maverick VIP Chopper",
            "realName": "Airbus Helicopters H130 VIP",
            "category": "Marine // Aircraft",
            "catKey": "marine",
            "speed": "155 Knots (178 MPH)",
            "accel": "Smooth Executive Turbine",
            "handling": "Fenestron Enclosed Tail Rotor",
            "armor": "Sound-Dampened Composite",
            "driveType": "Turbomeca Arriel 2D Turboshaft",
            "capacity": "6 VIPs + Luggage",
            "bulletproof": "Aviation Tint Glass",
            "heistRole": "Rooftop Helipad VIP Extrication",
            "source": "Ocean Drive Penthouse Helipad Leaks",
            "image": "assets/vehicle-buckingham-maverick.jpg?v=20261119_v3",
            "stats": {
                  "speed": 89,
                  "accel": 86,
                  "handling": 87,
                  "armor": 54
            },
            "bio": "Quiet, plush, and engineered with an enclosed Fenestron tail rotor for tight rooftop landings on luxury skyscraper pads across downtown Vice City."
      },
      "jobuilt-velum": {
            "id": "jobuilt-velum",
            "name": "JoBuilt Velum 5-Seater Plane",
            "realName": "Socata TBM 900 Single-Engine Turboprop",
            "category": "Marine // Aircraft",
            "catKey": "marine",
            "speed": "330 Knots (380 MPH)",
            "accel": "High-Altitude Fast Climb",
            "handling": "Pressurized Cruising",
            "armor": "Lightweight Aluminum Aircraft Skin",
            "driveType": "Pratt & Whitney 850 HP Turboprop",
            "capacity": "5 Crew + 8 Duffel Bags",
            "bulletproof": "Cockpit Storm Shield",
            "heistRole": "Interstate State-Border Transshipment Flight",
            "source": "Grassrivers Smuggler Airfield Sequence",
            "image": "assets/vehicle-jobuilt-velum.jpg?v=20261119_v3",
            "stats": {
                  "speed": 96,
                  "accel": 92,
                  "handling": 83,
                  "armor": 48
            },
            "bio": "Cruises at 31,000 feet far above state police helicopters. The ultimate high-altitude getaway craft to transport your crew and the total take out of Leonida jurisdiction."
      },
      "vapid-speedo": {
            "id": "vapid-speedo",
            "name": "Vapid Speedo Express Lockup",
            "realName": "Chevrolet Express 3500 Cargo Van",
            "category": "Commercial // Vans",
            "catKey": "commercial",
            "speed": "128 MPH",
            "accel": "5.6s 0-60",
            "handling": "Heavy Van Body-Roll",
            "armor": "Reinforced Partition Wall",
            "driveType": "RWD 6.6L V8 Commercial",
            "capacity": "12 Full Cash Bags (Huge Cargo Area)",
            "bulletproof": "Rear Door Steel Plates",
            "heistRole": "Bulky Heavy Loot Transport & Utility Disguise",
            "source": "Downtown Vice City Delivery Alleyways",
            "image": "assets/vehicle-speedo-van.jpg?v=20261119_v3",
            "stats": {
                  "speed": 68,
                  "accel": 72,
                  "handling": 64,
                  "armor": 74
            },
            "bio": "Disguised with fictional local laundry or HVAC commercial logos. Blends in 100% anywhere in urban Vice City while carrying the entire haul from a major jewelry exchange."
      },
      "brute-boxville": {
            "id": "brute-boxville",
            "name": "Brute Boxville Armored Courier",
            "realName": "Step Van P-Series Armored Postal Truck",
            "category": "Commercial // Vans",
            "catKey": "commercial",
            "speed": "112 MPH",
            "accel": "6.8s 0-60",
            "handling": "High Center-of-Gravity Stiff",
            "armor": "Heavy Gauge Double-Walled Steel",
            "driveType": "RWD 6.0L Commercial V8",
            "capacity": "20 Cash Bags / Pallet of Bullion",
            "bulletproof": "Armored Door Latches & Slit Glass",
            "heistRole": "Gold Bullion & Heavy Bank Vault Loot Hauler",
            "source": "Bank Transit Depot Scene",
            "image": "assets/vehicle-brute-boxville.jpg?v=20261119_v3",
            "stats": {
                  "speed": 60,
                  "accel": 58,
                  "handling": 56,
                  "armor": 90
            },
            "bio": "Heavy roll-up rear cargo doors with reinforced deadbolts. Built specifically to transport pallets of gold bullion and heavy safe deposit lockboxes."
      },
      "maibatsu-mule": {
            "id": "maibatsu-mule",
            "name": "Maibatsu Mule Logistics Transporter",
            "realName": "Mitsubishi Fuso Canter Box Truck",
            "category": "Commercial // Vans",
            "catKey": "commercial",
            "speed": "110 MPH",
            "accel": "7.2s 0-60",
            "handling": "Heavy Commercial Turning Radius",
            "armor": "Commercial Cargo Box",
            "driveType": "RWD 4-Cylinder Turbo Diesel",
            "capacity": "Full Palletized Cargo / 30 Bags",
            "bulletproof": "Standard Commercial Cab",
            "heistRole": "Massive Hardware Moving & Chop Shop Supply",
            "source": "Port Gellhorn Shipping Docks",
            "image": "assets/vehicle-maibatsu-mule.jpg?v=20261119_v3",
            "stats": {
                  "speed": 58,
                  "accel": 54,
                  "handling": 52,
                  "armor": 72
            },
            "bio": "The backbone of Port Gellhorn cargo transit. Able to transport heavy equipment, cutting torches, hydraulic jacks, and tons of raw loot across county lines."
      },
      "western-sovereign": {
            "id": "western-sovereign",
            "name": "Western Sovereign Touring Bagger",
            "realName": "Harley-Davidson Electra Glide Police Special",
            "category": "Commercial // Vans",
            "catKey": "commercial",
            "speed": "136 MPH",
            "accel": "4.6s 0-60",
            "handling": "Heavy Bagger Highway Cruiser",
            "armor": "Saddlebag Guards & Fairing",
            "driveType": "Belt-Drive Milwaukee-Eight V-Twin",
            "capacity": "2 Hard Saddlebags (Cash & Sidearm)",
            "bulletproof": "Windshield Deflector",
            "heistRole": "Solo Rapid Courier & Traffic Weaving",
            "source": "Kelly County Highway 101 Leaks",
            "image": "assets/vehicle-western-sovereign.jpg?v=20261119_v3",
            "stats": {
                  "speed": 75,
                  "accel": 80,
                  "handling": 81,
                  "armor": 46
            },
            "bio": "Equipped with lockable hard fiberglass saddlebags and a full touring fairing that splits congested highway lanes at over 100 MPH."
      },
      "pegassi-bati-801": {
            "id": "pegassi-bati-801",
            "name": "Pegassi Bati 801 Superbike",
            "realName": "Ducati 848 / 1098 Superbike",
            "category": "Commercial // Vans",
            "catKey": "commercial",
            "speed": "185 MPH",
            "accel": "2.5s 0-60",
            "handling": "Knee-Dragging Lean Angle",
            "armor": "Zero (Rider Dependent)",
            "driveType": "Chain-Drive Desmodromic V-Twin",
            "capacity": "1 Tactical Rucksack",
            "bulletproof": "None",
            "heistRole": "Ultra-Fast Solo Courier & Gridlock Weave",
            "source": "Ocean Drive Night Street Races",
            "image": "assets/vehicle-bati-801.jpg?v=20261119_v3",
            "stats": {
                  "speed": 96,
                  "accel": 98,
                  "handling": 95,
                  "armor": 20
            },
            "bio": "With a 2.5-second sprint to 60 MPH and razor-sharp steering geometry, the Bati 801 weaves between gridlocked freeway lanes where no patrol car can follow."
      },
      "nagasaki-bf400": {
            "id": "nagasaki-bf400",
            "name": "Nagasaki BF400 Enduro Rally Bike",
            "realName": "KTM 450 Rally Factory Replica",
            "category": "Commercial // Vans",
            "catKey": "commercial",
            "speed": "140 MPH",
            "accel": "3.6s 0-60",
            "handling": "Long-Travel Inverted Suspension",
            "armor": "Skid Plate & Handguards",
            "driveType": "Chain-Drive 450cc High-Output Single",
            "capacity": "1 Tactical Backpack",
            "bulletproof": "None",
            "heistRole": "Stairwell, Alley & Wetland Escape Bike",
            "source": "Port Gellhorn Drainage Canal Leaks",
            "image": "assets/vehicle-bf400.jpg?v=20261119_v3",
            "stats": {
                  "speed": 78,
                  "accel": 89,
                  "handling": 96,
                  "armor": 35
            },
            "bio": "Long-travel rally suspension lets this enduro bike hop over pedestrian curbs, launch down concrete drainage stairs, and tear across muddy marshland trails with ease."
      },
      "principe-nemesis": {
            "id": "principe-nemesis",
            "name": "Principe Nemesis Streetfighter",
            "realName": "Ducati Monster 1200 / Streetfighter",
            "category": "Commercial // Vans",
            "catKey": "commercial",
            "speed": "155 MPH",
            "accel": "3.1s 0-60",
            "handling": "Upright Naked Bike Agility",
            "armor": "Exposed Trellis Frame",
            "driveType": "Chain-Drive 1200cc L-Twin",
            "capacity": "1 Crossbody Duffel",
            "bulletproof": "None",
            "heistRole": "Downtown Vice City Alleyway Threader",
            "source": "Little Cuba Back Alleys Scene",
            "image": "assets/vehicle-nemesis.jpg?v=20261119_v3",
            "stats": {
                  "speed": 85,
                  "accel": 92,
                  "handling": 93,
                  "armor": 28
            },
            "bio": "Wide motocross handlebars and upright riding ergonomics give riders incredible low-speed leverage to flick around tight street corners and evade VCPD cruiser roadblocks."
      }
},

    WeaponData: {
      "polymer": {
            "id": "polymer",
            "name": "Polymer Pistol 9mm",
            "realName": "Glock 19 Gen 5",
            "category": "Sidearms",
            "catKey": "sidearms",
            "caliber": "9x19mm Parabellum",
            "magSize": "15 + 1 Rounds (33-Round Extended)",
            "fireRate": "Semi-Automatic (450 RPM)",
            "noise": "156 dB (118 dB Suppressed)",
            "conceal": "96% (Concealed Under Shirt)",
            "range": "50 Meters",
            "attachments": "Osprey Suppressor, Red Dot Micro Sight, 33-Round Drum, Streamlight TLR-7 Light/Laser",
            "stats": {
                  "damage": 68,
                  "fireRate": 65,
                  "range": 55,
                  "accuracy": 82
            },
            "source": "Trailer 1 Hold-Up Scene (Jason & Lucia) & 2022 Leaks",
            "image": "assets/weapon-polymer.jpg?v=20261119_v3",
            "bio": "The gold-standard compact striker-fired polymer sidearm carried by Lucia in the opening trailer diner robbery. Lightweight, failure-proof even when dropped in muddy Leonida wetlands, and offers near-total concealment under casual clothing."
      },
      "beretta": {
            "id": "beretta",
            "name": "Service Pistol 92FS",
            "realName": "Beretta 92FS / M9",
            "category": "Sidearms",
            "catKey": "sidearms",
            "caliber": "9x19mm Parabellum",
            "magSize": "15 Rounds (20-Round Mag)",
            "fireRate": "Semi-Automatic (480 RPM)",
            "noise": "158 dB (120 dB Suppressed)",
            "conceal": "85% (Holster / Waistband)",
            "range": "60 Meters",
            "attachments": "Threaded Barrel, Tactical Suppressor, Inox Match Trigger, Wooden Grip Panels",
            "stats": {
                  "damage": 72,
                  "fireRate": 68,
                  "range": 62,
                  "accuracy": 86
            },
            "source": "Jason Duval Official Character Stash Art & VCPD Armory",
            "image": "assets/weapon-beretta.jpg?v=20261119_v3",
            "bio": "Classic Italian open-slide double-action military sidearm with smooth recoil characteristics and flawless feeding reliability. Standard issue for many veteran law enforcement officers and Jason’s preferred defensive weapon."
      },
      "mustang357": {
            "id": "mustang357",
            "name": "Mustang .357 Heavy Magnum",
            "realName": "Colt Python .357 Magnum 6-Inch",
            "category": "Sidearms",
            "catKey": "sidearms",
            "caliber": ".357 Magnum / .38 Special",
            "magSize": "6-Round Cylinder",
            "fireRate": "Double-Action (220 RPM)",
            "noise": "164 dB (Unsuppressed Cannon)",
            "conceal": "62% (Under Jacket Only)",
            "range": "75 Meters",
            "attachments": "Ventilated Rib Barrel, Pachmayr Rubber Grips, 2x Handgun Scope, Speedloader Rings",
            "stats": {
                  "damage": 94,
                  "fireRate": 38,
                  "range": 75,
                  "accuracy": 90
            },
            "source": "Trailer 1 Highway Police Standoff & Leaks",
            "image": "assets/weapon-mustang357.jpg?v=20261119_v3",
            "bio": "High-polish stainless steel revolver packing devastating stopping power. Can punch through car doors and engine blocks at close range. One shot to center-mass drops unarmored guards instantly."
      },
      "browning-hipower": {
            "id": "browning-hipower",
            "name": "Vintage P35 High-Power",
            "realName": "Browning Hi-Power 9mm",
            "category": "Sidearms",
            "catKey": "sidearms",
            "caliber": "9x19mm Parabellum",
            "magSize": "13 Rounds",
            "fireRate": "Single-Action (460 RPM)",
            "noise": "157 dB",
            "conceal": "88%",
            "range": "55 Meters",
            "attachments": "Classic Walnut Grips, Ring Hammer, Novak Night Sights",
            "stats": {
                  "damage": 70,
                  "fireRate": 64,
                  "range": 58,
                  "accuracy": 85
            },
            "source": "Raul Bautista Smuggler Cache Leak",
            "image": "assets/weapon-browning-hipower.jpg?v=20261119_v3",
            "bio": "Historic single-action sidearm favored by veteran Caribbean contraband runners and cartel lieutenants for its crisp trigger break and ergonomic grip angle."
      },
      "taurus-judge": {
            "id": "taurus-judge",
            "name": "The Enforcer .410 Revolver",
            "realName": "Taurus Judge .410 Shotshell / .45 LC",
            "category": "Sidearms",
            "catKey": "sidearms",
            "caliber": ".410 Bore Shotshell / .45 Long Colt",
            "magSize": "5-Round Cylinder",
            "fireRate": "Double-Action (200 RPM)",
            "noise": "165 dB",
            "conceal": "70%",
            "range": "25 Meters (Spread)",
            "attachments": "Fiber Optic Front Sight, Ribber Grip",
            "stats": {
                  "damage": 92,
                  "fireRate": 35,
                  "range": 35,
                  "accuracy": 65
            },
            "bio": "Chambered in .410 shotgun buckshot shells. Devastating in close-quarters bank vestibule hold-ups where spreading shot clears out multiple security guards at once."
      },
      "mp5": {
            "id": "mp5",
            "name": "Tactical MP5 Submachine Gun",
            "realName": "Heckler & Koch MP5A3 / MP5SD",
            "category": "Submachine Guns",
            "catKey": "smg",
            "caliber": "9x19mm Parabellum",
            "magSize": "30 Rounds (Curved Mag)",
            "fireRate": "Full-Auto (800 RPM)",
            "noise": "112 dB (Integral Suppressor)",
            "conceal": "78% (Sling Under Coat)",
            "range": "100 Meters",
            "attachments": "Integral SD Suppressor, Collapsible Stock, Tri-Rail Forend, Holo Sight",
            "stats": {
                  "damage": 76,
                  "fireRate": 85,
                  "range": 70,
                  "accuracy": 88
            },
            "source": "Trailer 1 Bank Infiltration & Key Leaks",
            "image": "assets/weapon-mp5.jpg?v=20261119_v3",
            "bio": "The undisputed gold standard in roller-delayed submachine guns. Almost non-existent recoil allows putting an entire 30-round magazine into a 4-inch cluster while moving down bank hallways."
      },
      "micro-smg": {
            "id": "micro-smg",
            "name": "Micro Machine Pistol 9mm",
            "realName": "IMI Micro Uzi / Mini Uzi",
            "category": "Submachine Guns",
            "catKey": "smg",
            "caliber": "9x19mm Parabellum",
            "magSize": "32 Rounds",
            "fireRate": "Extreme Rapid (1,200 RPM)",
            "noise": "159 dB",
            "conceal": "85% (Drive-by Capable)",
            "range": "45 Meters",
            "attachments": "Folding Wire Stock, Extended 32-Rd Stick Mag, Compensator",
            "stats": {
                  "damage": 70,
                  "fireRate": 98,
                  "range": 42,
                  "accuracy": 60
            },
            "source": "Drive-By Shooting Clip & Leaks",
            "image": "assets/weapon-micro-smg.jpg?v=20261119_v3",
            "bio": "Blistering 1,200 rounds per minute cyclic rate that empties a full magazine in under two seconds. The ultimate drive-by weapon from the driver seat of a getaway car."
      },
      "tec9": {
            "id": "tec9",
            "name": "AB-10 Machine Pistol",
            "realName": "Intratec TEC-9 9mm",
            "category": "Submachine Guns",
            "catKey": "smg",
            "caliber": "9x19mm Luger",
            "magSize": "32 Rounds (50-Round Drum)",
            "fireRate": "Rapid-Fire (900 RPM)",
            "noise": "158 dB",
            "conceal": "80%",
            "range": "50 Meters",
            "attachments": "Ventilated Barrel Shroud, 50-Rd Drum, Threaded Barrel Extender",
            "stats": {
                  "damage": 72,
                  "fireRate": 90,
                  "range": 48,
                  "accuracy": 64
            },
            "source": "Vice City Little Haiti Gang Leaks",
            "image": "assets/weapon-tec9.jpg?v=20261119_v3",
            "bio": "Infamous 90s Vice City street syndicate staple. Intimidating barrel shroud profile and massive 50-round drum magazine make it deadly for vault corridor suppressive fire."
      },
      "p90": {
            "id": "p90",
            "name": "Tactical Bullpup PDW-57",
            "realName": "FN P90 5.7x28mm Bullpup",
            "category": "Submachine Guns",
            "catKey": "smg",
            "caliber": "5.7x28mm Armor Piercing",
            "magSize": "50-Round Top-Feeding Translucent Mag",
            "fireRate": "Full-Auto (900 RPM)",
            "noise": "152 dB (115 dB Suppressed)",
            "conceal": "75%",
            "range": "150 Meters",
            "attachments": "Integrated Reflex Optic, Side Tactical Lasers, Gemtech Suppressor",
            "stats": {
                  "damage": 78,
                  "fireRate": 92,
                  "range": 75,
                  "accuracy": 91
            },
            "source": "Port Gellhorn Shipping Facility Raid",
            "image": "assets/weapon-p90.jpg?v=20261119_v3",
            "bio": "Compact bullpup design chambered in high-velocity 5.7mm armor-piercing rounds that slice through Kevlar vests worn by armored car transit guards."
      },
      "carbine": {
            "id": "carbine",
            "name": "Duke Special Ops Carbine M4",
            "realName": "Colt M4A1 Tactical Carbine 5.56",
            "category": "Assault Rifles",
            "catKey": "rifles",
            "caliber": "5.56x45mm NATO",
            "magSize": "30 Rounds (60-Round C-Mag)",
            "fireRate": "Full-Auto (850 RPM)",
            "noise": "162 dB (126 dB Suppressed)",
            "conceal": "40% (Trunk / Tactical Sling)",
            "range": "300 Meters",
            "attachments": "ACOG 4x Scope, PEQ-15 Infrared Laser, Angled Foregrip, SOCOM Suppressor",
            "stats": {
                  "damage": 85,
                  "fireRate": 82,
                  "range": 88,
                  "accuracy": 92
            },
            "source": "Trailer 1 SWAT & Raul Bautista Syndicate Arsenal",
            "image": "assets/weapon-carbine.jpg?v=20261119_v3",
            "bio": "The military standard issue assault rifle. Extreme modularity and accuracy at medium-to-long ranges, capable of penetrating engine blocks and heavy ballistic glass."
      },
      "ak47": {
            "id": "ak47",
            "name": "Kalashnikov AK-103 Assault Rifle",
            "realName": "AK-47 / AK-103 7.62x39mm",
            "category": "Assault Rifles",
            "catKey": "rifles",
            "caliber": "7.62x39mm Soviet",
            "magSize": "30 Rounds (75-Round Drum)",
            "fireRate": "Full-Auto (650 RPM)",
            "noise": "165 dB",
            "conceal": "35%",
            "range": "280 Meters",
            "attachments": "Heavy Muzzle Brake, Kobra Red Dot, 75-Round Drum, Side-Folding Polymer Stock",
            "stats": {
                  "damage": 90,
                  "fireRate": 72,
                  "range": 84,
                  "accuracy": 78
            },
            "source": "Kelly County Militia Stash Leak",
            "image": "assets/weapon-ak47.jpg?v=20261119_v3",
            "bio": "Heavy 7.62mm stopping power that punches straight through concrete parking garage pillars and armored police vehicles. Incurably reliable in Leonida sand and mud."
      },
      "compact-rifle": {
            "id": "compact-rifle",
            "name": "Micro Draco Compact Rifle",
            "realName": "Century Arms Micro Draco 7.62x39mm",
            "category": "Assault Rifles",
            "catKey": "rifles",
            "caliber": "7.62x39mm Soviet",
            "magSize": "30 Rounds",
            "fireRate": "Full-Auto (700 RPM)",
            "noise": "168 dB (Massive Muzzle Flash)",
            "conceal": "72% (Concealable under Jacket)",
            "range": "120 Meters",
            "attachments": "KNS Piston, Flash Hider, SB Tactical Arm Brace",
            "stats": {
                  "damage": 88,
                  "fireRate": 76,
                  "range": 65,
                  "accuracy": 68
            },
            "source": "Trailer 1 Convenience Store Raid & Leaks",
            "image": "assets/weapon-compact-rifle.jpg?v=20261119_v3",
            "bio": "A chopped-down AK platform with a 6-inch barrel that produces deafening concussive blasts and blinding muzzle fire. Offers rifle power in a package that fits under a windbreaker."
      },
      "battle-rifle": {
            "id": "battle-rifle",
            "name": "Heavy Battle Rifle 7.62 NATO",
            "realName": "FN FAL / SA58 Paratrooper",
            "category": "Assault Rifles",
            "catKey": "rifles",
            "caliber": "7.62x51mm NATO (.308 Win)",
            "magSize": "20 Rounds (Steel Box)",
            "fireRate": "Select-Fire (600 RPM)",
            "noise": "166 dB",
            "conceal": "30%",
            "range": "400 Meters",
            "attachments": "Elcan SpecterDR Optic, Harris Bipod, Heavy Flash Suppressor",
            "stats": {
                  "damage": 95,
                  "fireRate": 64,
                  "range": 94,
                  "accuracy": 89
            },
            "source": "Grassrivers Smuggler Fortress Clip",
            "image": "assets/weapon-battle-rifle.jpg?v=20261119_v3",
            "bio": "The Right Hand of the Free World. Hits with sledgehammer energy at extreme distances, disabling pursuing patrol vehicles with shots through the radiator grille."
      },
      "pump-shotgun": {
            "id": "pump-shotgun",
            "name": "Tactical 12-Gauge Pump Shotgun",
            "realName": "Remington 870 Tactical / Mossberg 590A1",
            "category": "Shotguns & Heavy",
            "catKey": "shotguns",
            "caliber": "12-Gauge (00 Buckshot / 1oz Slug)",
            "magSize": "8 + 1 Tubular Magazine",
            "fireRate": "Pump-Action (75 RPM)",
            "noise": "162 dB",
            "conceal": "38%",
            "range": "40 Meters",
            "attachments": "Door Breaching Choke, Heat Shield, Side-Saddle 6-Shell Carrier, Magpul Forend with Tac-Light",
            "stats": {
                  "damage": 98,
                  "fireRate": 42,
                  "range": 45,
                  "accuracy": 72
            },
            "source": "Bank Transit Security Footage Leak",
            "image": "assets/weapon-pump-shotgun.jpg?v=20261119_v3",
            "bio": "The ultimate room clearer and vault breach tool. Loaded with 00 buckshot, it tears open wooden security doors and immobilizes advancing swat teams in tight hallways."
      },
      "sawed-off": {
            "id": "sawed-off",
            "name": "Sawed-Off Double Barrel",
            "realName": "Lupara 12-Gauge Double Barrel Sawed",
            "category": "Shotguns & Heavy",
            "catKey": "shotguns",
            "caliber": "12-Gauge Magnum",
            "magSize": "2 Shells (Simultaneous Trigger)",
            "fireRate": "Instant Double Tap",
            "noise": "166 dB",
            "conceal": "82% (Quick Draw from Coat)",
            "range": "18 Meters (Massive Spread)",
            "attachments": "Cut-Down Stock, Shortened Barrels",
            "stats": {
                  "damage": 100,
                  "fireRate": 50,
                  "range": 25,
                  "accuracy": 45
            },
            "source": "Kelly County Bayou Robbery Leak",
            "image": "assets/weapon-sawed-off.jpg?v=20261119_v3",
            "bio": "Both barrels sawed down to 8 inches. Empties a devastating wall of lead at point-blank range, turning armored vault locks and cash registers into shattered fragments."
      },
      "combat-shotgun": {
            "id": "combat-shotgun",
            "name": "SPAS-12 Combat Auto-Shotgun",
            "realName": "Franchi SPAS-12 Semi-Auto",
            "category": "Shotguns & Heavy",
            "catKey": "shotguns",
            "caliber": "12-Gauge Heavy Magnum",
            "magSize": "8 Rounds",
            "fireRate": "Semi-Automatic (300 RPM)",
            "noise": "163 dB",
            "conceal": "42%",
            "range": "50 Meters",
            "attachments": "Folding Metal Stock with Hook, Choke Adapter, EOTech Red Dot",
            "stats": {
                  "damage": 96,
                  "fireRate": 68,
                  "range": 52,
                  "accuracy": 76
            },
            "source": "Vice City Ocean Beach Gun Shop Leak",
            "image": "assets/weapon-combat-shotgun.jpg?v=20261119_v3",
            "bio": "Iconic folding-stock combat shotgun that cycles semi-automatic 12-gauge magnum shells as fast as the operator pulls the trigger."
      },
      "grenade-launcher": {
            "id": "grenade-launcher",
            "name": "Compact 40mm Thumper Launcher",
            "realName": "M79 / Milkor M32 40mm Grenade Launcher",
            "category": "Shotguns & Heavy",
            "catKey": "shotguns",
            "caliber": "40x46mm High Explosive / Smoke",
            "magSize": "Single Break-Action / 6-Round Cylinder",
            "fireRate": "Break-Action (15 RPM)",
            "noise": "172 dB (Explosive Impact)",
            "conceal": "30%",
            "range": "350 Meters",
            "attachments": "Leaf Sight, Padded Recoil Pad, Quad-Rail Mount",
            "stats": {
                  "damage": 100,
                  "fireRate": 25,
                  "range": 92,
                  "accuracy": 80
            },
            "source": "Trailer 2 SWAT Tactical Breach Sequence",
            "image": "assets/weapon-grenade-launcher.jpg?v=20261119_v3",
            "bio": "Lobs 40mm high-explosive or CS tear gas rounds with pinpoint trajectory over police barricades, flipping swat vans and clearing entire intersections in one thud."
      },
      "rpg7": {
            "id": "rpg7",
            "name": "Heavy Anti-Tank RPG-7",
            "realName": "RPG-7V2 Rocket-Propelled Grenade",
            "category": "Shotguns & Heavy",
            "catKey": "shotguns",
            "caliber": "85mm Shaped Charge Warhead",
            "magSize": "Single Rocket Reload",
            "fireRate": "Manual Reload (6 RPM)",
            "noise": "185 dB (Rocket Backblast)",
            "conceal": "10% (Shoulder Carried Only)",
            "range": "500 Meters",
            "attachments": "PGO-7V Optical Sight, Heat Warhead, Tandem Charge",
            "stats": {
                  "damage": 100,
                  "fireRate": 15,
                  "range": 96,
                  "accuracy": 75
            },
            "source": "Military Armory Heist Leaks",
            "image": "assets/weapon-rpg7.jpg?v=20261119_v3",
            "bio": "Devastating anti-armor launcher capable of blowing VCPD riot enforcers and police helicopters out of the sky in a blinding flash of shaped-charge explosive force."
      },
      "sniper": {
            "id": "sniper",
            "name": "Duke Assault Sniper Rifle",
            "realName": "Accuracy International AWM / AX308",
            "category": "Sniper Rifles",
            "catKey": "snipers",
            "caliber": ".338 Lapua Magnum / 7.62 NATO",
            "magSize": "5-Round Detachable Box Mag",
            "fireRate": "Bolt-Action (40 RPM)",
            "noise": "168 dB (130 dB Suppressed)",
            "conceal": "15% (Disassembled in Hard Case)",
            "range": "1,200 Meters",
            "attachments": "Nightforce 25x Mil-Dot Scope, Harvester 338 Suppressor, Folding Skeleton Stock, Carbon Bipod",
            "stats": {
                  "damage": 98,
                  "fireRate": 35,
                  "range": 100,
                  "accuracy": 98
            },
            "source": "Jason Duval Grassrivers Overwatch Scene",
            "image": "assets/weapon-sniper.jpg?v=20261119_v3",
            "bio": "Extreme-range bolt-action precision platform used for high-angle overwatch missions. One well-placed shot through the engine block disables pursuit vehicles before they reach the safehouse."
      },
      "heavy-sniper": {
            "id": "heavy-sniper",
            "name": "Anti-Material .50 Cal Sniper",
            "realName": "Barrett M82A1 / M107 .50 BMG",
            "category": "Sniper Rifles",
            "catKey": "snipers",
            "caliber": ".50 BMG (12.7x99mm NATO)",
            "magSize": "10-Round Steel Magazine",
            "fireRate": "Semi-Automatic (120 RPM)",
            "noise": "175 dB (Massive Arrowhead Brake)",
            "conceal": "5% (Heavy Vehicle Mount or Case)",
            "range": "1,800 Meters",
            "attachments": "Thermal Sniper Scope, Arrowhead Muzzle Brake, Bipod",
            "stats": {
                  "damage": 100,
                  "fireRate": 40,
                  "range": 100,
                  "accuracy": 96
            },
            "source": "Vice Port Military Guard Tower Scene",
            "image": "assets/weapon-heavy-sniper.jpg?v=20261119_v3",
            "bio": "Fires massive 660-grain armor-piercing incendiary rounds that detonate fuel tanks and tear through reinforced bunker walls from over a mile away."
      },
      "hammer": {
            "id": "hammer",
            "name": "Forged Steel Claw Hammer",
            "realName": "Estwing 20oz Steel Rip Claw Hammer",
            "category": "Melee & Intimidation",
            "catKey": "melee",
            "caliber": "Solid Forged American Steel",
            "magSize": "Infinite Durability",
            "fireRate": "Manual Swing (90 BPM)",
            "noise": "Zero dB (Silent)",
            "conceal": "94% (Belt Loop / Tool Bag)",
            "range": "1.5 Meters",
            "attachments": "Shock-Reduction Grip, Lanyard Hole",
            "stats": {
                  "damage": 78,
                  "fireRate": 60,
                  "range": 15,
                  "accuracy": 90
            },
            "source": "Trailer 1 Iconic \"Hammer Lady\" Scene",
            "image": "assets/weapon-hammer.jpg?v=20261119_v3",
            "bio": "Made famous in the first GTA 6 trailer by the neighborhood watch woman. Perfect for shattering jewelry display cases, disabling security cameras silently, and cracking door locks."
      },
      "baseball-bat": {
            "id": "baseball-bat",
            "name": "Solid Hardwood Baseball Bat",
            "realName": "Louisville Slugger 34-Inch Ash Bat",
            "category": "Melee & Intimidation",
            "catKey": "melee",
            "caliber": "Northern White Ash Wood",
            "magSize": "Heavy Blunt Force",
            "fireRate": "Manual Swing (80 BPM)",
            "noise": "Zero dB (Silent)",
            "conceal": "60% (Trunk / Under Trenchcoat)",
            "range": "2.0 Meters",
            "attachments": "Tar Grip Wrap, Barbed Wire Wrap Option",
            "stats": {
                  "damage": 75,
                  "fireRate": 55,
                  "range": 20,
                  "accuracy": 85
            },
            "source": "Port Gellhorn Street Brawl & Pawn Shop Leaks",
            "image": "assets/weapon-baseball-bat.jpg?v=20261119_v3",
            "bio": "The classic intimidation weapon. A couple of swings against a bank teller’s bulletproof glass instantly skyrockets the intimidation meter without firing a shot and alerting police dispatch."
      },
      "crowbar": {
            "id": "crowbar",
            "name": "Hardened Steel Wrecking Crowbar",
            "realName": "Stanley 36-Inch Forged Wrecking Bar",
            "category": "Melee & Intimidation",
            "catKey": "melee",
            "caliber": "High-Carbon Hexagon Steel",
            "magSize": "Indestructible",
            "fireRate": "Leverage Force (60 BPM)",
            "noise": "Low Clank",
            "conceal": "65%",
            "range": "2.0 Meters",
            "attachments": "Beveled Chisel Edge",
            "stats": {
                  "damage": 80,
                  "fireRate": 48,
                  "range": 22,
                  "accuracy": 88
            },
            "source": "Backdoor Delivery Robbery Leaks",
            "image": "assets/weapon-crowbar.jpg?v=20261119_v3",
            "bio": "Dual-purpose heist tool. Used to quietly pry open security fire doors, electrical junction boxes, and ATM access panels, or wielded as a crushing close-quarters weapon."
      },
      "combat-knife": {
            "id": "combat-knife",
            "name": "Tactical Tanto Combat Knife",
            "realName": "KA-BAR Tanto Fixed Blade",
            "category": "Melee & Intimidation",
            "catKey": "melee",
            "caliber": "1095 Cro-Van Carbon Steel",
            "magSize": "Razor Edge",
            "fireRate": "Rapid Thrust (140 BPM)",
            "noise": "Zero dB (Total Silence)",
            "conceal": "98% (Boot Holster)",
            "range": "1.0 Meter",
            "attachments": "Kydex Sheath, Serrated Spine, Non-Reflective Epoxy Coating",
            "stats": {
                  "damage": 84,
                  "fireRate": 85,
                  "range": 10,
                  "accuracy": 95
            },
            "source": "Stealth Infiltration Takedown Leak",
            "image": "assets/weapon-combat-knife.jpg?v=20261119_v3",
            "bio": "Black epoxy-coated 7-inch tanto blade designed for silent takedowns of security sentries from behind. Leaves zero shell casings or acoustic signature."
      }
},

    GearData: {
      "mask-skull": {
            "id": "mask-skull",
            "name": "Neoprene Skull Balaclava",
            "category": "Heist Masks",
            "catKey": "stealth",
            "policeDelay": "+35 Seconds Response Delay",
            "ballisticTier": "Level 0 (Thermal Concealment)",
            "concealIndex": "98% Facial Recognition Block",
            "perk": "Blocks CCTV facial recognition & delays 911 caller identification by 35 seconds.",
            "source": "Trailer 1 Diner Hold-Up Scene (Jason Duval)",
            "image": "assets/gear-skull-mask.jpg?v=20261119_v3",
            "stats": {
                  "conceal": 95,
                  "ballistic": 15,
                  "intimidation": 88,
                  "mobility": 98
            },
            "bio": "Jason’s signature heist face covering. Made of breathable weather-resistant neoprene that conceals facial geometry from automated bank security cameras and state surveillance databases."
      },
      "mask-pink-bandana": {
            "id": "mask-pink-bandana",
            "name": "Vice City Flamingo Pink Bandana",
            "category": "Heist Masks",
            "catKey": "stealth",
            "policeDelay": "+30 Seconds Response Delay",
            "ballisticTier": "Level 0 (Lightweight Cotton)",
            "concealIndex": "92% Identity Concealment",
            "perk": "Fastest equip animation during sudden cash register grab-and-dashes.",
            "source": "Official Lucia Key Art & Diner Holdup",
            "image": "assets/character-lucia.jpg?v=20261119_v3",
            "stats": {
                  "conceal": 90,
                  "ballistic": 10,
                  "intimidation": 82,
                  "mobility": 100
            },
            "bio": "Lucia’s iconic pink paisley bandana worn in quick-strike convenience store and pawn shop robberies. Can be pulled up or dropped in under 0.5 seconds."
      },
      "mask-ballistic": {
            "id": "mask-ballistic",
            "name": "Level III-A Ballistic Face Shield",
            "category": "Ballistic Protection",
            "catKey": "ballistic",
            "policeDelay": "+25 Seconds Response Delay",
            "ballisticTier": "Level III-A (Withstands 9mm & .44 Mag)",
            "concealIndex": "99% Total Head Shield",
            "perk": "Negates 1 fatal headshot from law enforcement pistol fire.",
            "source": "Bank Vault Heist Alpha Leak 14",
            "image": "assets/gear-ballistic-mask.jpg?v=20261119_v3",
            "stats": {
                  "conceal": 98,
                  "ballistic": 92,
                  "intimidation": 95,
                  "mobility": 80
            },
            "bio": "Molded ceramic-aramid composite face plate that deflects handgun shrapnel and direct 9mm headshots. Terrifies hostages and bank staff during heavy assaults."
      },
      "mask-stocking": {
            "id": "mask-stocking",
            "name": "Retro Nylon Stocking Mask",
            "category": "Heist Masks",
            "catKey": "stealth",
            "policeDelay": "+20 Seconds Response Delay",
            "ballisticTier": "None",
            "concealIndex": "85% Distortion",
            "perk": "Zero suspicion when stored in pockets; discarded instantly into trash bins.",
            "source": "Trailer 1 Kelly County Gas Station",
            "image": "assets/gear-stocking-mask.jpg?v=20261119_v3",
            "stats": {
                  "conceal": 85,
                  "ballistic": 5,
                  "intimidation": 75,
                  "mobility": 100
            },
            "bio": "The classic low-budget Bonnie & Clyde distortion mask. Crushes facial features against nylon mesh, confounding eyewitness descriptions given to arriving police officers."
      },
      "mask-clown": {
            "id": "mask-clown",
            "name": "Port Gellhorn Smiley Clown Mask",
            "category": "Heist Masks",
            "catKey": "stealth",
            "policeDelay": "+35 Seconds Response Delay",
            "ballisticTier": "Level 0 (Molded Plastic)",
            "concealIndex": "98% Identity Mask",
            "perk": "+20% Hostage Intimidation Speed; suppresses crowd panic alarms.",
            "source": "Port Gellhorn Amusement Pier Robbery Scene",
            "image": "assets/character-leonida-joker.jpg?v=20261119_v3",
            "stats": {
                  "conceal": 96,
                  "ballistic": 12,
                  "intimidation": 96,
                  "mobility": 92
            },
            "bio": "Disturbing molded fiberglass clown mask with manic painted smile. Greatly increases intimidation effect against crowds, keeping bystanders flat on the floor."
      },
      "mask-animal": {
            "id": "mask-animal",
            "name": "Vice Beach Neon Pig Rubber Mask",
            "category": "Heist Masks",
            "catKey": "stealth",
            "policeDelay": "+30 Seconds Response Delay",
            "ballisticTier": "Level 0 (Heavy Latex)",
            "concealIndex": "96% Identity Mask",
            "perk": "Cult following bonus; unlocks unique syndicate underground dialogue.",
            "source": "Ocean Drive Street Party Leaked Encounter",
            "image": "assets/gear-animal-mask.jpg?v=20261119_v3",
            "stats": {
                  "conceal": 94,
                  "ballistic": 10,
                  "intimidation": 90,
                  "mobility": 94
            },
            "bio": "Grotesque neon-splattered latex pig mask worn by reckless street crews. Confuses CCTV facial indexing by replacing human contours with animal features."
      },
      "outfit-scuba": {
            "id": "outfit-scuba",
            "name": "Rebreather Scuba Diving Rig",
            "category": "Environmental Suits",
            "catKey": "suits",
            "policeDelay": "+60 Seconds Underwater Immunity",
            "ballisticTier": "Level I (Neoprene Rubber)",
            "concealIndex": "100% (Submerged)",
            "perk": "Unlimited underwater breathing; zero air bubbles on radar sonar.",
            "source": "Biscayne Bay Underwater Drainage Leak",
            "image": "assets/gear-scuba-suit.jpg?v=20261119_v3",
            "stats": {
                  "conceal": 99,
                  "ballistic": 30,
                  "intimidation": 65,
                  "mobility": 85
            },
            "bio": "Military closed-circuit rebreather rig that produces zero surface bubbles. Allows diving into downtown stormwater canals to breach bank basements undetected."
      },
      "outfit-hazmat": {
            "id": "outfit-hazmat",
            "name": "Biohazard Level A Hazmat Suit",
            "category": "Environmental Suits",
            "catKey": "suits",
            "policeDelay": "+45 Seconds Confusion Delay",
            "ballisticTier": "Level II (Chemical Impermeable)",
            "concealIndex": "100% Full Body Shield",
            "perk": "Complete immunity to tear gas, smoke canisters, and chemical dispersants.",
            "source": "Port Gellhorn Pharmaceutical Cargo Raid",
            "image": "assets/gear-hazmat-suit.jpg?v=20261119_v3",
            "stats": {
                  "conceal": 99,
                  "ballistic": 45,
                  "intimidation": 88,
                  "mobility": 70
            },
            "bio": "Bright yellow pressurized hazmat suit with self-contained air tanks. Lets operatives walk straight through heavy tear gas clouds without taking damage or coughing."
      },
      "outfit-vcpd": {
            "id": "outfit-vcpd",
            "name": "VCPD Metro Police Uniform Disguise",
            "category": "Tactical Disguises",
            "catKey": "disguise",
            "policeDelay": "+50 Seconds Infiltration Buffer",
            "ballisticTier": "Level II-A (Concealed Kevlar Vest)",
            "concealIndex": "100% Law Enforcement Cover",
            "perk": "Walk through police barricades and restricted evidence lockups without drawing heat.",
            "source": "Police Precinct Infiltration Leak 31",
            "image": "assets/character-vcpd-officer.jpg?v=20261119_v3",
            "stats": {
                  "conceal": 98,
                  "ballistic": 60,
                  "intimidation": 85,
                  "mobility": 90
            },
            "bio": "Authentic Vice City Police Department patrol uniform complete with forged gold badge, duty belt, and radio clip. Allows walking right past perimeter checkpoints."
      },
      "outfit-utility": {
            "id": "outfit-utility",
            "name": "Port Gellhorn Stevedore Coveralls",
            "category": "Tactical Disguises",
            "catKey": "disguise",
            "policeDelay": "+40 Seconds Harbor Buffer",
            "ballisticTier": "Heavy Cotton Drill",
            "concealIndex": "95% Worker Disguise",
            "perk": "Full access to cargo container shipping terminals and industrial docks.",
            "source": "Vice Port Container Yard Gameplay",
            "image": "assets/character-brian-heder.jpg?v=20261119_v3",
            "stats": {
                  "conceal": 92,
                  "ballistic": 25,
                  "intimidation": 60,
                  "mobility": 95
            },
            "bio": "High-visibility reflective maintenance jumpsuit. Renders operatives completely unremarkable in industrial shipping facilities, warehouses, and transit depots."
      },
      "outfit-tuxedo": {
            "id": "outfit-tuxedo",
            "name": "High-Roller Velvet Casino Tuxedo",
            "category": "Tactical Disguises",
            "catKey": "disguise",
            "policeDelay": "+45 Seconds Social Camouflage",
            "ballisticTier": "Silk-Lined Kevlar Weave",
            "concealIndex": "100% VIP Status",
            "perk": "Grants access to high-limit VIP penthouses, private poker lounges, and casino vaults.",
            "source": "Starlet Key Casino Gala Scene",
            "image": "assets/character-drequan-priest.jpg?v=20261119_v3",
            "stats": {
                  "conceal": 96,
                  "ballistic": 35,
                  "intimidation": 70,
                  "mobility": 92
            },
            "bio": "Tailored Italian velvet evening tuxedo with custom silk-lined inner holsters for compact sidearms. Required for social-engineering VIP casino robberies."
      },
      "outfit-tourist": {
            "id": "outfit-tourist",
            "name": "Ocean Drive Tourist Aloha Disguise",
            "category": "Tactical Disguises",
            "catKey": "disguise",
            "policeDelay": "+35 Seconds Crowd Camouflage",
            "ballisticTier": "None",
            "concealIndex": "96% Tourist Blending",
            "perk": "Blend into Ocean Drive pedestrian crowds instantly to drop police stars.",
            "source": "Trailer 1 Vice Beach Hotel Strip",
            "image": "assets/character-cal-hampton.jpg?v=20261119_v3",
            "stats": {
                  "conceal": 94,
                  "ballistic": 10,
                  "intimidation": 40,
                  "mobility": 100
            },
            "bio": "Floral Hawaiian shirt, mirrored sunglasses, and camera strap. Lets operatives blend in with thousands of visiting tourists along Ocean Beach."
      },
      "armor-juggernaut": {
            "id": "armor-juggernaut",
            "name": "Heavy Assault EOD Plate Carrier",
            "category": "Ballistic Protection",
            "catKey": "ballistic",
            "policeDelay": "+15 Seconds (Heavy Profile)",
            "ballisticTier": "Level IV Boron Carbide Ceramic Plates",
            "concealIndex": "0% (Heavy Military Rig)",
            "perk": "Absorbs up to 25 rifle shots; explosive blast damage reduced by 60%.",
            "source": "Trailer 1 Tactical Armor & Leaks",
            "image": "assets/gear-juggernaut-armor.jpg?v=20261119_v3",
            "stats": {
                  "conceal": 20,
                  "ballistic": 100,
                  "intimidation": 99,
                  "mobility": 55
            },
            "bio": "Military bomb-disposal derived heavy chest rig with neck guard, shoulder pauldrons, and groin protector. Turns operatives into walking tanks during bank breakouts."
      },
      "gear-nvg-helmet": {
            "id": "gear-nvg-helmet",
            "name": "High-Cut Ballistic Helmet with Quad-NVGs",
            "category": "Ballistic Protection",
            "catKey": "ballistic",
            "policeDelay": "+30 Seconds Infiltration Bonus",
            "ballisticTier": "Level III-A High-Cut Aramid",
            "concealIndex": "Special Ops Tactical",
            "perk": "Full green-phosphor night vision; reveals sentry positions in blackout conditions.",
            "source": "Power Grid Blackout Bank Infiltration Sequence",
            "image": "assets/gear-nvg-helmet.jpg?v=20261119_v3",
            "stats": {
                  "conceal": 80,
                  "ballistic": 90,
                  "intimidation": 95,
                  "mobility": 86
            },
            "bio": "Equipped with panoramic GPNVG-18 quad-tube night vision goggles. Essential for heists executed under total darkness after cutting main substation power lines."
      },
      "gear-gloves": {
            "id": "gear-gloves",
            "name": "Carbon Knuckle Operator Assault Gloves",
            "category": "Tactical Disguises",
            "catKey": "stealth",
            "policeDelay": "Zero Fingerprint Evidence",
            "ballisticTier": "Molded Carbon Fiber Knuckles",
            "concealIndex": "100% Forensic Protection",
            "perk": "Leaves zero forensic fingerprint evidence; +25% melee punch damage.",
            "source": "Trailer 1 Weapon Handling & Leaks",
            "image": "assets/character-jason.jpg?v=20261119_v3",
            "stats": {
                  "conceal": 100,
                  "ballistic": 40,
                  "intimidation": 85,
                  "mobility": 98
            },
            "bio": "Tactical assault gloves with molded carbon-fiber knuckle protectors. Completely prevents fingerprint transfer on vault dials, lockpicks, and weapon handguards."
      },
      "gear-thermal-goggles": {
            "id": "gear-thermal-goggles",
            "name": "Tactical FLIR Thermal Recon Goggles",
            "category": "Environmental Suits",
            "catKey": "stealth",
            "policeDelay": "Overwatch Threat Detection",
            "ballisticTier": "Polycarbonate Eye Protection",
            "concealIndex": "Tactical Recon",
            "perk": "Highlights guard heat signatures through smoke clouds, fog, and thin drywall.",
            "source": "Vice City Bank Vault Heist Blueprint",
            "image": "assets/item-thermal-lance.jpg?v=20261119_v3",
            "stats": {
                  "conceal": 85,
                  "ballistic": 35,
                  "intimidation": 90,
                  "mobility": 92
            },
            "bio": "High-resolution thermal imaging headset that highlights guard body heat signatures through drywall, bank vaults, and heavy smoke screens."
      }
},

    VehicleModal: {
      open(id) {
        let key = (id || 'declasse-tulip').toLowerCase().trim();
        key = key.replace('vehicle-', '');
        const data = GTA6.VehicleData[key] || GTA6.VehicleData['declasse-tulip'];
        if (GTA6.playBeep) GTA6.playBeep(480, 'triangle', 0.05);

        let backdrop = document.getElementById('charModalBackdrop');
        if (!backdrop) {
          backdrop = document.createElement('div');
          backdrop.id = 'charModalBackdrop';
          backdrop.className = 'char-modal-backdrop';
          document.body.appendChild(backdrop);
          backdrop.addEventListener('click', (e) => {
            if (e.target === backdrop) GTA6.VehicleModal.close();
          });
          document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && backdrop.classList.contains('active')) GTA6.VehicleModal.close();
          });
        }

        backdrop.innerHTML = `
          <div class="char-modal-box">
            <button type="button" class="char-modal-close" onclick="GTA6.VehicleModal.close()" title="Close Dossier" aria-label="Close Dossier" style="display:inline-flex;align-items:center;justify-content:center;">${GTA6.Icons.close(16)}</button>
            <div style="display:flex; flex-wrap:wrap; background:#070b14; border-bottom:1px solid rgba(0,240,255,0.25);">
              <div style="flex:1 1 280px; max-height:340px; overflow:hidden; position:relative; background:#04070e;">
                <img src="${data.image && data.image.startsWith('http') ? data.image : '/' + String(data.image || 'assets/character-lucia.jpg').replace(/^\/+/, '')}" alt="${data.name}" style="width:100%; height:100%; object-fit:cover; display:block;">
                <span class="user-badge" style="position:absolute; top:12px; left:12px; background:rgba(0,0,0,0.85); border-color:var(--neon-cyan); color:var(--neon-cyan); font-size:0.72rem; font-weight:800;">CONFIRMED GTA 6 FLEET</span>
                <span class="user-badge" style="position:absolute; bottom:12px; left:12px; background:rgba(0,0,0,0.85); border-color:var(--neon-yellow); color:var(--neon-yellow); font-size:0.72rem; font-family:var(--font-mono);">${data.category.toUpperCase()}</span>
              </div>
              <div style="flex:1 1 360px; padding:1.5rem; display:flex; flex-direction:column; justify-content:space-between;">
                <div>
                  <div style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom:0.35rem;">
                    <h2 style="color:#fff; font-size:1.5rem; margin:0; line-height:1.2;">${data.name}</h2>
                  </div>
                  <div style="color:var(--neon-cyan); font-size:0.85rem; font-weight:800; margin-bottom:0.85rem;">${data.realName}</div>
                  <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.5rem; font-size:0.78rem; font-family:var(--font-mono); margin-bottom:1rem; padding:0.6rem; background:rgba(255,255,255,0.03); border-radius:6px; border:1px solid rgba(255,255,255,0.06);">
                    <div><span style="color:#64748b;">TOP SPEED:</span> <span style="color:var(--neon-green); font-weight:700;">${data.speed}</span></div>
                    <div><span style="color:#64748b;">DRIVETRAIN:</span> <span style="color:#fff;">${data.driveType}</span></div>
                    <div><span style="color:#64748b;">ACCELERATION:</span> <span style="color:#fff;">${data.accel}</span></div>
                    <div><span style="color:#64748b;">HANDLING:</span> <span style="color:#fff;">${data.handling}</span></div>
                    <div style="grid-column:1/-1;"><span style="color:#64748b;">TRUNK CAPACITY:</span> <span style="color:var(--neon-yellow); font-weight:700;">${data.capacity}</span></div>
                    <div style="grid-column:1/-1;"><span style="color:#64748b;">BALLISTIC RATING:</span> <span style="color:#38bdf8;">${data.bulletproof}</span></div>
                  </div>
                </div>
                <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
                  <button type="button" class="btn btn-primary" onclick="GTA6.toggleBookmark('veh-${data.id}', '${data.name}'); GTA6.showToast('Vehicle bookmarked to Syndicate HUD!');" style="flex:1; text-align:center; padding:0.45rem; font-size:0.78rem;">⭐ Bookmark</button>
                  <a href="/heist-planner" class="btn" style="flex:1; text-align:center; padding:0.45rem; font-size:0.78rem; background:rgba(0,240,255,0.15); border-color:var(--neon-cyan); color:var(--neon-cyan);">📲 Second-Screen HUD</a>
                </div>
              </div>
            </div>
            <div style="padding:1.5rem; max-height:48vh; overflow-y:auto;">
              <div style="margin-bottom:1.25rem;">
                <h4 style="color:var(--neon-cyan); font-size:0.85rem; text-transform:uppercase; letter-spacing:1px; margin-bottom:0.5rem;">📋 Vehicle Overview & Classified Lore</h4>
                <p style="color:#cbd5e1; font-size:0.88rem; line-height:1.6; margin:0;">${data.bio}</p>
              </div>

              <!-- Stat Bars -->
              <div style="margin-bottom:1.25rem; background:rgba(0,0,0,0.4); padding:1rem; border-radius:8px; border:1px solid rgba(255,255,255,0.08);">
                <h4 style="color:var(--neon-yellow); font-size:0.82rem; text-transform:uppercase; letter-spacing:1px; margin-bottom:0.75rem;">⚡ Performance Benchmark Telemetry</h4>
                <div style="display:grid; gap:0.5rem; font-size:0.75rem; font-family:var(--font-mono);">
                  <div>
                    <div style="display:flex; justify-content:space-between; margin-bottom:2px;"><span style="color:#94a3b8;">TOP SPEED</span><span style="color:var(--neon-green);">${data.stats.speed}/100</span></div>
                    <div style="height:6px; background:rgba(255,255,255,0.1); border-radius:3px; overflow:hidden;"><div style="height:100%; width:${data.stats.speed}%; background:linear-gradient(90deg, #10b981, #00f0ff); border-radius:3px;"></div></div>
                  </div>
                  <div>
                    <div style="display:flex; justify-content:space-between; margin-bottom:2px;"><span style="color:#94a3b8;">ACCELERATION</span><span style="color:var(--neon-cyan);">${data.stats.accel}/100</span></div>
                    <div style="height:6px; background:rgba(255,255,255,0.1); border-radius:3px; overflow:hidden;"><div style="height:100%; width:${data.stats.accel}%; background:linear-gradient(90deg, #00f0ff, #ffb800); border-radius:3px;"></div></div>
                  </div>
                  <div>
                    <div style="display:flex; justify-content:space-between; margin-bottom:2px;"><span style="color:#94a3b8;">HANDLING & TRACTION</span><span style="color:var(--neon-yellow);">${data.stats.handling}/100</span></div>
                    <div style="height:6px; background:rgba(255,255,255,0.1); border-radius:3px; overflow:hidden;"><div style="height:100%; width:${data.stats.handling}%; background:linear-gradient(90deg, #ffb800, #ff2a8d); border-radius:3px;"></div></div>
                  </div>
                  <div>
                    <div style="display:flex; justify-content:space-between; margin-bottom:2px;"><span style="color:#94a3b8;">ARMOR / RAMMING WEIGHT</span><span style="color:var(--neon-pink);">${data.stats.armor}/100</span></div>
                    <div style="height:6px; background:rgba(255,255,255,0.1); border-radius:3px; overflow:hidden;"><div style="height:100%; width:${data.stats.armor}%; background:linear-gradient(90deg, #ff2a8d, #a855f7); border-radius:3px;"></div></div>
                  </div>
                </div>
              </div>

              <!-- Heist Advantage -->
              <div style="background:rgba(0,240,255,0.06); border:1px solid rgba(0,240,255,0.3); border-radius:8px; padding:0.85rem; margin-bottom:1rem;">
                <strong style="color:var(--neon-cyan); font-size:0.82rem; display:block; margin-bottom:0.35rem;">🚗 TACTICAL HEIST UTILITY & GETAWAY ROLE</strong>
                <span style="color:#fff; font-size:0.85rem; display:block; line-height:1.45;">${data.heistRole}</span>
                <span style="display:block; margin-top:0.4rem; font-size:0.75rem; color:#94a3b8; font-family:var(--font-mono);">CONFIRMATION SOURCE: ${data.source}</span>
              </div>
            </div>
          </div>
        `;

        backdrop.classList.add('active');
        document.body.style.overflow = 'hidden';
      },
      close() {
        const backdrop = document.getElementById('charModalBackdrop');
        if (backdrop) backdrop.classList.remove('active');
        document.body.style.overflow = '';
      }
    },

    WeaponModal: {
      open(id) {
        const rawKey = (id || 'polymer').toLowerCase().trim();
        const strippedKey = rawKey.replace(/^weapon-/, '').replace(/^item-/, '').replace(/^gear-/, '');
        const data = GTA6.WeaponData[rawKey] || GTA6.WeaponData[strippedKey] || GTA6.WeaponData['weapon-' + strippedKey] || GTA6.WeaponData['polymer'];
        if (GTA6.playBeep) GTA6.playBeep(520, 'triangle', 0.05);

        let backdrop = document.getElementById('charModalBackdrop');
        if (!backdrop) {
          backdrop = document.createElement('div');
          backdrop.id = 'charModalBackdrop';
          backdrop.className = 'char-modal-backdrop';
          document.body.appendChild(backdrop);
          backdrop.addEventListener('click', (e) => {
            if (e.target === backdrop) GTA6.WeaponModal.close();
          });
          document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && backdrop.classList.contains('active')) GTA6.WeaponModal.close();
          });
        }

        backdrop.innerHTML = `
          <div class="char-modal-box">
            <button type="button" class="char-modal-close" onclick="GTA6.WeaponModal.close()" title="Close Dossier" aria-label="Close Dossier" style="display:inline-flex;align-items:center;justify-content:center;">${GTA6.Icons.close(16)}</button>
            <div style="display:flex; flex-wrap:wrap; background:#070b14; border-bottom:1px solid rgba(255,184,0,0.25);">
              <div style="flex:1 1 280px; max-height:340px; overflow:hidden; position:relative; background:#04070e;">
                <img src="${data.image && data.image.startsWith('http') ? data.image : '/' + String(data.image || 'assets/character-lucia.jpg').replace(/^\/+/, '')}" alt="${data.name}" style="width:100%; height:100%; object-fit:cover; display:block;">
                <span class="user-badge" style="position:absolute; top:12px; left:12px; background:rgba(0,0,0,0.85); border-color:var(--neon-yellow); color:var(--neon-yellow); font-size:0.72rem; font-weight:800;">CONFIRMED ARSENAL</span>
                <span class="user-badge" style="position:absolute; bottom:12px; left:12px; background:rgba(0,0,0,0.85); border-color:var(--neon-cyan); color:var(--neon-cyan); font-size:0.72rem; font-family:var(--font-mono);">${data.category.toUpperCase()}</span>
              </div>
              <div style="flex:1 1 360px; padding:1.5rem; display:flex; flex-direction:column; justify-content:space-between;">
                <div>
                  <div style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom:0.35rem;">
                    <h2 style="color:#fff; font-size:1.5rem; margin:0; line-height:1.2;">${data.name}</h2>
                  </div>
                  <div style="color:var(--neon-yellow); font-size:0.85rem; font-weight:800; margin-bottom:0.85rem;">${data.realName}</div>
                  <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.5rem; font-size:0.78rem; font-family:var(--font-mono); margin-bottom:1rem; padding:0.6rem; background:rgba(255,255,255,0.03); border-radius:6px; border:1px solid rgba(255,255,255,0.06);">
                    <div><span style="color:#64748b;">CALIBER:</span> <span style="color:#fff; font-weight:700;">${data.caliber}</span></div>
                    <div><span style="color:#64748b;">CAPACITY:</span> <span style="color:var(--neon-green);">${data.magSize}</span></div>
                    <div><span style="color:#64748b;">FIRE RATE:</span> <span style="color:#fff;">${data.fireRate}</span></div>
                    <div><span style="color:#64748b;">NOISE:</span> <span style="color:#38bdf8;">${data.noise}</span></div>
                    <div style="grid-column:1/-1;"><span style="color:#64748b;">CONCEALMENT:</span> <span style="color:var(--neon-yellow); font-weight:700;">${data.conceal}</span></div>
                    <div style="grid-column:1/-1;"><span style="color:#64748b;">MAX RANGE:</span> <span style="color:#fff;">${data.range}</span></div>
                  </div>
                </div>
                <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
                  <button type="button" class="btn btn-primary" onclick="GTA6.toggleBookmark('wpn-${data.id}', '${data.name}'); GTA6.showToast('Weapon added to Loadout Locker!');" style="flex:1; text-align:center; padding:0.45rem; font-size:0.78rem; background:linear-gradient(135deg,#ffb800,#ff8800); border-color:var(--neon-yellow); color:#000; font-weight:800;">⭐ Equip in Loadout</button>
                  <a href="/crew-database" class="btn" style="flex:1; text-align:center; padding:0.45rem; font-size:0.78rem; background:rgba(255,184,0,0.15); border-color:var(--neon-yellow); color:var(--neon-yellow);">👥 Crew Synergy</a>
                </div>
              </div>
            </div>
            <div style="padding:1.5rem; max-height:48vh; overflow-y:auto;">
              <div style="margin-bottom:1.25rem;">
                <h4 style="color:var(--neon-yellow); font-size:0.85rem; text-transform:uppercase; letter-spacing:1px; margin-bottom:0.5rem;">📋 Ballistics Dossier & Field Performance</h4>
                <p style="color:#cbd5e1; font-size:0.88rem; line-height:1.6; margin:0;">${data.bio}</p>
              </div>

              <!-- Stat Bars -->
              <div style="margin-bottom:1.25rem; background:rgba(0,0,0,0.4); padding:1rem; border-radius:8px; border:1px solid rgba(255,255,255,0.08);">
                <h4 style="color:var(--neon-cyan); font-size:0.82rem; text-transform:uppercase; letter-spacing:1px; margin-bottom:0.75rem;">🎯 Combat Performance Profile</h4>
                <div style="display:grid; gap:0.5rem; font-size:0.75rem; font-family:var(--font-mono);">
                  <div>
                    <div style="display:flex; justify-content:space-between; margin-bottom:2px;"><span style="color:#94a3b8;">STOPPING POWER / DAMAGE</span><span style="color:var(--neon-pink);">${data.stats.damage}/100</span></div>
                    <div style="height:6px; background:rgba(255,255,255,0.1); border-radius:3px; overflow:hidden;"><div style="height:100%; width:${data.stats.damage}%; background:linear-gradient(90deg, #ff2a8d, #ef4444); border-radius:3px;"></div></div>
                  </div>
                  <div>
                    <div style="display:flex; justify-content:space-between; margin-bottom:2px;"><span style="color:#94a3b8;">RATE OF FIRE</span><span style="color:var(--neon-yellow);">${data.stats.fireRate}/100</span></div>
                    <div style="height:6px; background:rgba(255,255,255,0.1); border-radius:3px; overflow:hidden;"><div style="height:100%; width:${data.stats.fireRate}%; background:linear-gradient(90deg, #ffb800, #10b981); border-radius:3px;"></div></div>
                  </div>
                  <div>
                    <div style="display:flex; justify-content:space-between; margin-bottom:2px;"><span style="color:#94a3b8;">EFFECTIVE RANGE</span><span style="color:var(--neon-cyan);">${data.stats.range}/100</span></div>
                    <div style="height:6px; background:rgba(255,255,255,0.1); border-radius:3px; overflow:hidden;"><div style="height:100%; width:${data.stats.range}%; background:linear-gradient(90deg, #00f0ff, #38bdf8); border-radius:3px;"></div></div>
                  </div>
                  <div>
                    <div style="display:flex; justify-content:space-between; margin-bottom:2px;"><span style="color:#94a3b8;">ACCURACY & RECOIL CONTROL</span><span style="color:var(--neon-green);">${data.stats.accuracy}/100</span></div>
                    <div style="height:6px; background:rgba(255,255,255,0.1); border-radius:3px; overflow:hidden;"><div style="height:100%; width:${data.stats.accuracy}%; background:linear-gradient(90deg, #10b981, #00f0ff); border-radius:3px;"></div></div>
                  </div>
                </div>
              </div>

              <!-- Attachments -->
              <div style="background:rgba(255,184,0,0.06); border:1px solid rgba(255,184,0,0.3); border-radius:8px; padding:0.85rem; margin-bottom:1rem;">
                <strong style="color:var(--neon-yellow); font-size:0.82rem; display:block; margin-bottom:0.35rem;">🔧 COMPATIBLE TACTICAL ATTACHMENTS</strong>
                <span style="color:#fff; font-size:0.82rem; display:block; line-height:1.45; font-family:var(--font-mono);">${data.attachments}</span>
                <span style="display:block; margin-top:0.4rem; font-size:0.75rem; color:#94a3b8; font-family:var(--font-mono);">INTEL SOURCE: ${data.source}</span>
              </div>
            </div>
          </div>
        `;

        backdrop.classList.add('active');
        document.body.style.overflow = 'hidden';
      },
      close() {
        const backdrop = document.getElementById('charModalBackdrop');
        if (backdrop) backdrop.classList.remove('active');
        document.body.style.overflow = '';
      }
    },

    GearModal: {
      open(id) {
        let key = (id || 'mask-skull').toLowerCase().trim();
        const data = GTA6.GearData[key] || GTA6.GearData['mask-skull'];
        if (GTA6.playBeep) GTA6.playBeep(450, 'triangle', 0.05);

        let backdrop = document.getElementById('charModalBackdrop');
        if (!backdrop) {
          backdrop = document.createElement('div');
          backdrop.id = 'charModalBackdrop';
          backdrop.className = 'char-modal-backdrop';
          document.body.appendChild(backdrop);
          backdrop.addEventListener('click', (e) => {
            if (e.target === backdrop) GTA6.GearModal.close();
          });
          document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && backdrop.classList.contains('active')) GTA6.GearModal.close();
          });
        }

        backdrop.innerHTML = `
          <div class="char-modal-box">
            <button type="button" class="char-modal-close" onclick="GTA6.GearModal.close()" title="Close Dossier" aria-label="Close Dossier" style="display:inline-flex;align-items:center;justify-content:center;">${GTA6.Icons.close(16)}</button>
            <div style="display:flex; flex-wrap:wrap; background:#070b14; border-bottom:1px solid rgba(255,42,141,0.25);">
              <div style="flex:1 1 280px; max-height:340px; overflow:hidden; position:relative; background:#04070e;">
                <img src="${data.image && data.image.startsWith('http') ? data.image : '/' + String(data.image || 'assets/character-lucia.jpg').replace(/^\/+/, '')}" alt="${data.name}" style="width:100%; height:100%; object-fit:cover; display:block;">
                <span class="user-badge" style="position:absolute; top:12px; left:12px; background:rgba(0,0,0,0.85); border-color:var(--neon-pink); color:var(--neon-pink); font-size:0.72rem; font-weight:800;">HEIST INFILTRATION RIG</span>
                <span class="user-badge" style="position:absolute; bottom:12px; left:12px; background:rgba(0,0,0,0.85); border-color:var(--neon-yellow); color:var(--neon-yellow); font-size:0.72rem; font-family:var(--font-mono);">${data.category.toUpperCase()}</span>
              </div>
              <div style="flex:1 1 360px; padding:1.5rem; display:flex; flex-direction:column; justify-content:space-between;">
                <div>
                  <div style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom:0.35rem;">
                    <h2 style="color:#fff; font-size:1.5rem; margin:0; line-height:1.2;">${data.name}</h2>
                  </div>
                  <div style="color:var(--neon-pink); font-size:0.85rem; font-weight:800; margin-bottom:0.85rem;">${data.category}</div>
                  <div style="display:grid; grid-template-columns:1fr; gap:0.5rem; font-size:0.78rem; font-family:var(--font-mono); margin-bottom:1rem; padding:0.6rem; background:rgba(255,255,255,0.03); border-radius:6px; border:1px solid rgba(255,255,255,0.06);">
                    <div><span style="color:#64748b;">POLICE DISPATCH DELAY:</span> <span style="color:var(--neon-green); font-weight:700;">${data.policeDelay}</span></div>
                    <div><span style="color:#64748b;">BALLISTIC PROTECTION:</span> <span style="color:#fff;">${data.ballisticTier}</span></div>
                    <div><span style="color:#64748b;">CCTV CONCEALMENT:</span> <span style="color:var(--neon-cyan); font-weight:700;">${data.concealIndex}</span></div>
                  </div>
                </div>
                <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
                  <button type="button" class="btn btn-primary" onclick="GTA6.toggleBookmark('gear-${data.id}', '${data.name}'); GTA6.showToast('Gear equipped to Infiltration Plan!');" style="flex:1; text-align:center; padding:0.45rem; font-size:0.78rem; background:linear-gradient(135deg,#ff2a8d,#ff0066); border-color:var(--neon-pink); color:#fff; font-weight:800;">⭐ Equip Infiltration Gear</button>
                  <a href="/heist-planner" class="btn" style="flex:1; text-align:center; padding:0.45rem; font-size:0.78rem; background:rgba(255,42,141,0.15); border-color:var(--neon-pink); color:var(--neon-pink);">📲 HUD Companion</a>
                </div>
              </div>
            </div>
            <div style="padding:1.5rem; max-height:48vh; overflow-y:auto;">
              <div style="margin-bottom:1.25rem;">
                <h4 style="color:var(--neon-pink); font-size:0.85rem; text-transform:uppercase; letter-spacing:1px; margin-bottom:0.5rem;">📋 Tactical Specifications & Infiltration Lore</h4>
                <p style="color:#cbd5e1; font-size:0.88rem; line-height:1.6; margin:0;">${data.bio}</p>
              </div>

              <!-- Stat Bars -->
              <div style="margin-bottom:1.25rem; background:rgba(0,0,0,0.4); padding:1rem; border-radius:8px; border:1px solid rgba(255,255,255,0.08);">
                <h4 style="color:var(--neon-yellow); font-size:0.82rem; text-transform:uppercase; letter-spacing:1px; margin-bottom:0.75rem;">🎭 Infiltration & Evasion Telemetry</h4>
                <div style="display:grid; gap:0.5rem; font-size:0.75rem; font-family:var(--font-mono);">
                  <div>
                    <div style="display:flex; justify-content:space-between; margin-bottom:2px;"><span style="color:#94a3b8;">FACIAL CONCEALMENT</span><span style="color:var(--neon-green);">${data.stats.conceal}/100</span></div>
                    <div style="height:6px; background:rgba(255,255,255,0.1); border-radius:3px; overflow:hidden;"><div style="height:100%; width:${data.stats.conceal}%; background:linear-gradient(90deg, #10b981, #00f0ff); border-radius:3px;"></div></div>
                  </div>
                  <div>
                    <div style="display:flex; justify-content:space-between; margin-bottom:2px;"><span style="color:#94a3b8;">BALLISTIC PROTECTION</span><span style="color:var(--neon-cyan);">${data.stats.ballistic}/100</span></div>
                    <div style="height:6px; background:rgba(255,255,255,0.1); border-radius:3px; overflow:hidden;"><div style="height:100%; width:${data.stats.ballistic}%; background:linear-gradient(90deg, #00f0ff, #ffb800); border-radius:3px;"></div></div>
                  </div>
                  <div>
                    <div style="display:flex; justify-content:space-between; margin-bottom:2px;"><span style="color:#94a3b8;">MOB INTIMIDATION</span><span style="color:var(--neon-yellow);">${data.stats.intimidation}/100</span></div>
                    <div style="height:6px; background:rgba(255,255,255,0.1); border-radius:3px; overflow:hidden;"><div style="height:100%; width:${data.stats.intimidation}%; background:linear-gradient(90deg, #ffb800, #ff2a8d); border-radius:3px;"></div></div>
                  </div>
                  <div>
                    <div style="display:flex; justify-content:space-between; margin-bottom:2px;"><span style="color:#94a3b8;">MOBILITY / SPRINT SPEED</span><span style="color:var(--neon-pink);">${data.stats.mobility}/100</span></div>
                    <div style="height:6px; background:rgba(255,255,255,0.1); border-radius:3px; overflow:hidden;"><div style="height:100%; width:${data.stats.mobility}%; background:linear-gradient(90deg, #ff2a8d, #a855f7); border-radius:3px;"></div></div>
                  </div>
                </div>
              </div>

              <!-- Heist Advantage -->
              <div style="background:rgba(255,42,141,0.08); border:1px solid rgba(255,42,141,0.3); border-radius:8px; padding:0.85rem; margin-bottom:1rem;">
                <strong style="color:var(--neon-pink); font-size:0.82rem; display:block; margin-bottom:0.35rem;">🎭 TACTICAL INFILTRATION ADVANTAGE</strong>
                <span style="color:#fff; font-size:0.85rem; display:block; line-height:1.45;">${data.perk}</span>
                <span style="display:block; margin-top:0.4rem; font-size:0.75rem; color:#94a3b8; font-family:var(--font-mono);">SOURCE: ${data.source}</span>
              </div>
            </div>
          </div>
        `;

        backdrop.classList.add('active');
        document.body.style.overflow = 'hidden';
      },
      close() {
        const backdrop = document.getElementById('charModalBackdrop');
        if (backdrop) backdrop.classList.remove('active');
        document.body.style.overflow = '';
      }
    },
CharacterModal: {
      open(id) {
        let key = (id || 'lucia-caminos').toLowerCase().trim();
        key = key.replace('character-', '');

        const aliases = {
          'lucia': 'lucia-caminos',
          'lucia-caminos': 'lucia-caminos',
          'jason': 'jason-duval',
          'jason-duval': 'jason-duval',
          'stefanie': 'stefanie',
          'cal': 'cal-hampton',
          'cal-hampton': 'cal-hampton',
          'boobie': 'boobie-ike',
          'boobie-ike': 'boobie-ike',
          'brian': 'brian-heder',
          'brian-heder': 'brian-heder',
          'lori': 'lori-heder',
          'lori-heder': 'lori-heder',
          'drequan': 'drequan-priest',
          'drequan-priest': 'drequan-priest',
          'raul': 'raul-bautista',
          'raul-bautista': 'raul-bautista',
          'baeluxe': 'baeluxe',
          'bae-luxe': 'baeluxe',
          'roxy': 'roxy',
          'petra': 'petra-navarro',
          'petra-navarro': 'petra-navarro',
          'phil': 'phil',
          'joker': 'leonida-joker',
          'leonida-joker': 'leonida-joker',
          'valentina': 'valentina',
          'aunt-tee': 'aunt-tee'
        };

        key = aliases[key] || key;
        const data = GTA6.CharacterData[key] || GTA6.CharacterData['lucia-caminos'];
        if (GTA6.playSound) GTA6.playSound('click');

        let backdrop = document.getElementById('charModalBackdrop');
        if (!backdrop) {
          backdrop = document.createElement('div');
          backdrop.id = 'charModalBackdrop';
          backdrop.className = 'char-modal-backdrop';
          document.body.appendChild(backdrop);

          backdrop.addEventListener('click', (e) => {
            if (e.target === backdrop) GTA6.CharacterModal.close();
          });
          document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && backdrop.classList.contains('active')) {
              GTA6.CharacterModal.close();
            }
          });
        }

        backdrop.innerHTML = `
          <div class="char-modal-box">
            <button type="button" class="char-modal-close" onclick="GTA6.CharacterModal.close()" title="Close Dossier" aria-label="Close Dossier" style="display:inline-flex;align-items:center;justify-content:center;">${GTA6.Icons.close(16)}</button>
            <div style="display:flex; flex-wrap:wrap; background:#070b14; border-bottom:1px solid rgba(0,240,255,0.25);">
              <div style="flex:1 1 280px; max-height:360px; overflow:hidden; position:relative; background:#04070e;">
                <img src="${data.image && data.image.startsWith('http') ? data.image : '/' + String(data.image || 'assets/character-lucia.jpg').replace(/^\/+/, '')}" alt="${data.name}" style="width:100%; height:100%; object-fit:cover; object-position:center 20%; display:block;">
                <span class="user-badge" style="position:absolute; top:12px; left:12px; background:rgba(0,0,0,0.85); border-color:var(--neon-cyan); color:var(--neon-cyan); font-size:0.72rem; font-weight:800;">TOP SECRET // DOSSIER</span>
                <span class="user-badge" style="position:absolute; bottom:12px; left:12px; background:rgba(0,0,0,0.85); border-color:var(--neon-pink); color:var(--neon-pink); font-size:0.72rem; font-family:var(--font-mono);">${data.category.toUpperCase()}</span>
              </div>
              <div style="flex:1 1 360px; padding:1.5rem; display:flex; flex-direction:column; justify-content:space-between;">
                <div>
                  <div style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom:0.35rem;">
                    <h2 style="color:#fff; font-size:1.6rem; margin:0; line-height:1.2;">${data.name}</h2>
                    <span style="color:var(--neon-yellow); font-size:0.75rem; font-weight:800; font-family:var(--font-mono);">${data.alias}</span>
                  </div>
                  <div style="color:var(--neon-cyan); font-size:0.85rem; font-weight:800; margin-bottom:0.85rem;">${data.role}</div>
                  <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.5rem; font-size:0.78rem; font-family:var(--font-mono); margin-bottom:1rem; padding:0.6rem; background:rgba(255,255,255,0.03); border-radius:6px; border:1px solid rgba(255,255,255,0.06);">
                    <div><span style="color:#64748b;">SOURCE:</span> <span style="color:#fff;">${data.source}</span></div>
                    <div><span style="color:#64748b;">DISTRICT:</span> <span style="color:#fff;">${data.district}</span></div>
                    <div style="grid-column:1 / -1;"><span style="color:#64748b;">ACTOR / CAST:</span> <span style="color:var(--neon-green);">${data.actor}</span></div>
                  </div>
                </div>
                <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
                  <a href="/crew-database#character-${key}" class="btn btn-primary" style="flex:1; text-align:center; padding:0.45rem; font-size:0.8rem;">Open in Crew Database &rarr;</a>
                  <button type="button" class="btn btn-secondary" onclick="GTA6.CharacterModal.close()" style="padding:0.45rem 1rem; font-size:0.8rem;">Close (ESC)</button>
                </div>
              </div>
            </div>
            
            <div style="padding:1.5rem;">
              <h4 style="color:var(--neon-cyan); font-size:0.85rem; letter-spacing:1px; text-transform:uppercase; margin:0 0 0.5rem; font-family:var(--font-mono);">📁 Character Bio &amp; Verification Context</h4>
              <p style="color:#cbd5e1; font-size:0.88rem; line-height:1.6; margin:0 0 1.25rem;">${data.bio}</p>

              <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:1rem; margin-bottom:1.25rem;">
                <div style="background:rgba(255,184,0,0.08); border:1px solid rgba(255,184,0,0.3); border-radius:8px; padding:0.85rem;">
                  <strong style="color:var(--neon-yellow); font-size:0.8rem; display:block; margin-bottom:0.35rem;">🎒 TRAILER &amp; SIMULATOR LOADOUT</strong>
                  <span style="color:#fff; font-size:0.84rem; display:block; margin-bottom:0.45rem;">${data.weapon}</span>
                  <a href="${data.weaponLink}" style="color:var(--neon-cyan); font-size:0.75rem; text-decoration:none; font-weight:700;">Inspect Loadout in Arsenal Database &rarr;</a>
                </div>
                <div style="background:rgba(255,42,141,0.08); border:1px solid rgba(255,42,141,0.3); border-radius:8px; padding:0.85rem;">
                  <strong style="color:var(--neon-pink); font-size:0.8rem; display:block; margin-bottom:0.35rem;">⚡ FAN-MADE HEIST SIMULATOR ROLE (UNCONFIRMED BY ROCKSTAR)</strong>
                  <span style="color:#cbd5e1; font-size:0.82rem; line-height:1.4; display:block;">${data.perk}</span>
                </div>
              </div>

              <h4 style="color:var(--neon-amber); font-size:0.82rem; letter-spacing:0.5px; text-transform:uppercase; margin:0 0 0.65rem; font-family:var(--font-mono);">📊 Fan-Made Heist Planner Role Profile (Simulated Estimates — Not Official Rockstar Stats)</h4>
              <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:0.75rem; font-size:0.78rem; font-family:var(--font-mono);">
                <div>
                  <div style="display:flex; justify-content:space-between; margin-bottom:0.25rem;">
                    <span>Infiltration / Tech (Sim)</span>
                    <span style="color:var(--neon-green);">${data.stats.decryption}/100 Est.</span>
                  </div>
                  <div style="height:6px; background:rgba(255,255,255,0.1); border-radius:3px; overflow:hidden;">
                    <div style="width:${data.stats.decryption}%; height:100%; background:var(--neon-green);"></div>
                  </div>
                </div>
                <div>
                  <div style="display:flex; justify-content:space-between; margin-bottom:0.25rem;">
                    <span>Crowd / Street Presence (Sim)</span>
                    <span style="color:var(--neon-pink);">${data.stats.intimidation}/100 Est.</span>
                  </div>
                  <div style="height:6px; background:rgba(255,255,255,0.1); border-radius:3px; overflow:hidden;">
                    <div style="width:${data.stats.intimidation}%; height:100%; background:var(--neon-pink);"></div>
                  </div>
                </div>
                <div>
                  <div style="display:flex; justify-content:space-between; margin-bottom:0.25rem;">
                    <span>Combat / Overwatch (Sim)</span>
                    <span style="color:var(--neon-yellow);">${data.stats.combat}/100 Est.</span>
                  </div>
                  <div style="height:6px; background:rgba(255,255,255,0.1); border-radius:3px; overflow:hidden;">
                    <div style="width:${data.stats.combat}%; height:100%; background:var(--neon-yellow);"></div>
                  </div>
                </div>
                <div>
                  <div style="display:flex; justify-content:space-between; margin-bottom:0.25rem;">
                    <span>Getaway / Mobility (Sim)</span>
                    <span style="color:var(--neon-cyan);">${data.stats.wheelman}/100 Est.</span>
                  </div>
                  <div style="height:6px; background:rgba(255,255,255,0.1); border-radius:3px; overflow:hidden;">
                    <div style="width:${data.stats.wheelman}%; height:100%; background:var(--neon-cyan);"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `;

        backdrop.classList.add('active');
        document.body.style.overflow = 'hidden';
      },
      close() {
        const backdrop = document.getElementById('charModalBackdrop');
        if (backdrop) {
          backdrop.classList.remove('active');
          document.body.style.overflow = '';
        }
        if (GTA6.playSound) GTA6.playSound('click');
      }
    },

    // --------------------------------------------------------------------------
    // STICKY BOTTOM TICKER RETIRED — REPLACED BY NATIVE AFFILIATE CARD SYSTEM
    // --------------------------------------------------------------------------
    DealTicker: {
      timer: null,
      currentIndex: 0,
      messages: [],
      buildMessages() { return []; },
      init() {
        // Retired in favor of contextual, session-stable Native Affiliate Cards
        document.body.classList.remove('has-ticker');
      },
      next() {},
      dismiss() {
        const bar = document.getElementById('dealTickerBar');
        if (bar) bar.remove();
        document.body.classList.remove('has-ticker');
      }
    },

    
  // --------------------------------------------------------------------------
  // VIRAL HTML5 CANVAS FLEX CARD & CHALLENGE LINK ENGINE
  // --------------------------------------------------------------------------
  FlexCard: {
    downloadCanvas(canvas, filename) {
      const link = document.createElement('a');
      link.download = filename;
      link.href = canvas.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      link.remove();
      GTA6.playSuccess();
      GTA6.showToast('📸 Flex Card PNG Downloaded! Flex your score on Discord or X.');
    },

    downloadKeypadCard() {
      const bestMs = GTA6.KeypadTrainer.lastElapsedMs || Number(localStorage.getItem('gta6_keypad_best_ms') || 11420);
      const timeSecs = (bestMs / 1000).toFixed(3) + 's';
      const rank = GTA6.KeypadTrainer.lastRank || (bestMs <= 6000 ? 'Mastermind Ghost Hacker (S-Tier)' : bestMs <= 15000 ? 'Mastermind Ghost Hacker' : 'Field Decryptor');
      const diff = (GTA6.KeypadTrainer.difficulty || 'normal').toUpperCase();

      const canvas = document.createElement('canvas');
      canvas.width = 1200;
      canvas.height = 630;
      const ctx = canvas.getContext('2d');

      // Dark Cyberpunk Background
      const bg = ctx.createLinearGradient(0, 0, 1200, 630);
      bg.addColorStop(0, '#050811');
      bg.addColorStop(0.5, '#0b1325');
      bg.addColorStop(1, '#060a14');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, 1200, 630);

      // Grid Pattern
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.05)';
      ctx.lineWidth = 1;
      for (let x = 40; x < 1200; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 630);
        ctx.stroke();
      }
      for (let y = 40; y < 630; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(1200, y);
        ctx.stroke();
      }

      // Glowing Neon Cyan Outer Frame
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 3;
      ctx.shadowColor = 'rgba(0, 240, 255, 0.6)';
      ctx.shadowBlur = 20;
      ctx.strokeRect(30, 30, 1140, 570);
      ctx.shadowBlur = 0;

      // Header Brand Pill
      ctx.fillStyle = 'rgba(0, 240, 255, 0.12)';
      ctx.fillRect(60, 55, 430, 36);
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.5)';
      ctx.lineWidth = 1;
      ctx.strokeRect(60, 55, 430, 36);
      ctx.font = 'bold 14px monospace';
      ctx.fillStyle = '#00f0ff';
      ctx.fillText('⚡ GTA 6 HEIST SYNDICATE // VERIFIED RECORD', 75, 78);

      // Mode Badge (Right)
      ctx.fillStyle = 'rgba(255, 42, 141, 0.14)';
      ctx.fillRect(840, 55, 300, 36);
      ctx.strokeStyle = 'rgba(255, 42, 141, 0.5)';
      ctx.strokeRect(840, 55, 300, 36);
      ctx.font = 'bold 14px monospace';
      ctx.fillStyle = '#ff2a8d';
      ctx.fillText(`MODE: ${diff} (15.000s LOCKDOWN)`, 855, 78);

      // Title
      ctx.font = '900 38px sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('15s BIOMETRIC KEYPAD BYPASS RECORD', 60, 150);

      ctx.font = '18px monospace';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('LEONIDA STATE HIGH-SECURITY VAULT LOCKDOWN DEFENSE // ELITE S-TIER RUN', 60, 185);

      // Score Center Box
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(60, 220, 1080, 220);
      ctx.strokeStyle = 'rgba(0, 255, 157, 0.3)';
      ctx.lineWidth = 2;
      ctx.strokeRect(60, 220, 1080, 220);

      ctx.font = 'bold 20px monospace';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('FASTEST BYPASS TIME', 95, 265);

      ctx.font = '900 96px monospace';
      ctx.fillStyle = '#00ff9d';
      ctx.shadowColor = 'rgba(0, 255, 157, 0.5)';
      ctx.shadowBlur = 25;
      ctx.fillText(timeSecs, 95, 365);
      ctx.shadowBlur = 0;

      // Rank Pill inside box
      ctx.fillStyle = 'rgba(0, 240, 255, 0.18)';
      ctx.fillRect(640, 260, 460, 50);
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(640, 260, 460, 50);
      ctx.font = 'bold 18px monospace';
      ctx.fillStyle = '#00f0ff';
      ctx.fillText(`RANK: ${rank.toUpperCase()}`, 660, 292);

      // Stats inside box
      ctx.font = '16px monospace';
      ctx.fillStyle = '#cbd5e1';
      ctx.fillText('✓ BIOMETRIC SCAN: PASSED', 645, 345);
      ctx.fillText('✓ ALARM SUPPRESSION: ACTIVE', 645, 375);
      ctx.fillText('✓ SQUAD POT PROTECTION: 100%', 645, 405);

      // Prominent Bottom Watermark Banner
      ctx.fillStyle = '#0a101f';
      ctx.fillRect(60, 480, 1080, 80);
      ctx.strokeStyle = '#ff2a8d';
      ctx.lineWidth = 2;
      ctx.strokeRect(60, 480, 1080, 80);

      ctx.font = '900 26px sans-serif';
      ctx.fillStyle = '#fff';
      ctx.fillText('CAN YOU BEAT THIS TIME?', 95, 530);

      ctx.font = '900 28px monospace';
      ctx.fillStyle = '#00f0ff';
      ctx.shadowColor = 'rgba(0, 240, 255, 0.6)';
      ctx.shadowBlur = 12;
      ctx.fillText('BEAT MY SCORE AT GTA6HEISTGUIDE.COM', 460, 530);
      ctx.shadowBlur = 0;

      this.downloadCanvas(canvas, `gta6-keypad-record-${timeSecs.replace('.', '_')}.png`);
    },

    copyKeypadChallenge() {
      const bestMs = GTA6.KeypadTrainer.lastElapsedMs || Number(localStorage.getItem('gta6_keypad_best_ms') || 11420);
      const timeSecs = (bestMs / 1000).toFixed(2);
      const url = `${window.location.origin}/save-planner.html?challenge=${timeSecs}&vault=gold-reserve`;
      GTA6.copyText(url, 'Challenge Link');
      GTA6.showToast(`🎯 Challenge Link Copied (${timeSecs}s)! Send it to your squad on Discord/X.`);
    },

    downloadCalcCard() {
      const targetEl = document.getElementById('approachSelect') || document.getElementById('vaultTarget') || document.getElementById('fcVault');
      const vaultName = (targetEl && targetEl.selectedOptions && targetEl.selectedOptions[0] ? targetEl.selectedOptions[0].text : 'The Cartel Heist: Sinfrontera Bank').replace(/ *\([^)]*\) */g, '');
      const netPerHr = document.getElementById('netPerHourDisplay')?.innerText || '$4,280,000/hr';
      const perPlayer = document.getElementById('perPlayerDisplay')?.innerText || '$4,687,500';
      const squadPot = document.getElementById('squadPotDisplay')?.innerText || '$18,750,000';
      const gross = document.getElementById('targetPayoutDisplay')?.innerText || '$120,000';

      const canvas = document.createElement('canvas');
      canvas.width = 1200;
      canvas.height = 630;
      const ctx = canvas.getContext('2d');

      // Background
      const bg = ctx.createLinearGradient(0, 0, 1200, 630);
      bg.addColorStop(0, '#050811');
      bg.addColorStop(0.5, '#0c1629');
      bg.addColorStop(1, '#060a14');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, 1200, 630);

      // Grid
      ctx.strokeStyle = 'rgba(0, 255, 157, 0.05)';
      ctx.lineWidth = 1;
      for (let x = 40; x < 1200; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 630);
        ctx.stroke();
      }
      for (let y = 40; y < 630; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(1200, y);
        ctx.stroke();
      }

      // Outer Frame
      ctx.strokeStyle = '#00ff9d';
      ctx.lineWidth = 3;
      ctx.shadowColor = 'rgba(0, 255, 157, 0.5)';
      ctx.shadowBlur = 20;
      ctx.strokeRect(30, 30, 1140, 570);
      ctx.shadowBlur = 0;

      // Header Pill
      ctx.fillStyle = 'rgba(0, 255, 157, 0.12)';
      ctx.fillRect(60, 55, 470, 36);
      ctx.strokeStyle = 'rgba(0, 255, 157, 0.5)';
      ctx.lineWidth = 1;
      ctx.strokeRect(60, 55, 470, 36);
      ctx.font = 'bold 14px monospace';
      ctx.fillStyle = '#00ff9d';
      ctx.fillText('⚡ GTA 6 HEIST SYNDICATE // SQUAD NET PAYOUT DOSSIER', 75, 78);

      // Title
      ctx.font = '900 38px sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(vaultName.toUpperCase(), 60, 150);

      ctx.font = '18px monospace';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(`GROSS: ${gross} // TOTAL SQUAD POT: ${squadPot}`, 60, 185);

      // Net Per Hour Big Box
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(60, 220, 1080, 220);
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.3)';
      ctx.lineWidth = 2;
      ctx.strokeRect(60, 220, 1080, 220);

      ctx.font = 'bold 20px monospace';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('REALISTIC NET $/HOUR (PREP + FINALE)', 95, 265);

      ctx.font = '900 86px monospace';
      ctx.fillStyle = '#00f0ff';
      ctx.shadowColor = 'rgba(0, 240, 255, 0.5)';
      ctx.shadowBlur = 25;
      ctx.fillText(netPerHr, 95, 365);
      ctx.shadowBlur = 0;

      // Player Share Box
      ctx.fillStyle = 'rgba(245, 158, 11, 0.15)';
      ctx.fillRect(640, 260, 460, 140);
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(640, 260, 460, 140);

      ctx.font = 'bold 15px monospace';
      ctx.fillStyle = '#f59e0b';
      ctx.fillText('PER OPERATIVE TAKE-HOME', 665, 295);

      ctx.font = '900 48px monospace';
      ctx.fillStyle = '#fff';
      ctx.fillText(perPlayer, 665, 355);

      // Prominent Watermark Banner
      ctx.fillStyle = '#0a101f';
      ctx.fillRect(60, 480, 1080, 80);
      ctx.strokeStyle = '#00ff9d';
      ctx.lineWidth = 2;
      ctx.strokeRect(60, 480, 1080, 80);

      ctx.font = '900 28px sans-serif';
      ctx.fillStyle = '#fff';
      ctx.fillText('BEAT MY SCORE AT', 95, 530);

      ctx.font = '900 28px monospace';
      ctx.fillStyle = '#00ff9d';
      ctx.shadowColor = 'rgba(0, 255, 157, 0.6)';
      ctx.shadowBlur = 12;
      ctx.fillText('GTA6HEISTGUIDE.COM', 420, 530);
      ctx.shadowBlur = 0;

      this.downloadCanvas(canvas, 'gta6-heist-payout-split.png');
    },

    copyCalcChallenge() {
      const netPerHr = document.getElementById('netPerHourDisplay')?.innerText || '$4,280,000/hr';
      const cleanNum = netPerHr.replace(/[^0-9]/g, '');
      const url = `${window.location.origin}/calculator.html?challenge=${cleanNum}&vault=gold-reserve`;
      GTA6.copyText(url, 'Challenge Link');
      GTA6.showToast(`🎯 Challenge Link Copied (${netPerHr})! Share it with your crew.`);
    },

    initChallengeBanner() {
      const params = new URLSearchParams(window.location.search);
      const challengeVal = params.get('challenge');
      if (!challengeVal) return;

      const isTime = !isNaN(Number(challengeVal)) && Number(challengeVal) < 60;
      const label = isTime ? `${challengeVal}s` : `${Number(challengeVal).toLocaleString()}/hr`;

      const banner = document.createElement('div');
      banner.id = 'challengeBanner';
      banner.className = 'challenge-top-banner';
      banner.innerHTML = `
        <div class="challenge-banner-content">
          <span class="challenge-icon">🎯</span>
          <span><strong>SYNDICATE CHALLENGE:</strong> Your friend cracked the vault in <strong style="color:var(--neon-green);">${label}</strong> — Can you beat them?</span>
          <button type="button" class="btn btn-amber" onclick="GTA6.FlexCard.acceptChallenge('${challengeVal}')" style="padding:0.25rem 0.75rem; font-size:0.75rem; margin-left:0.5rem;">⚡ Accept Challenge &amp; Bypass Vault</button>
        </div>
        <button type="button" class="challenge-close-btn" onclick="this.parentElement.remove()" aria-label="Close Banner">${GTA6.Icons.close(14)}</button>
      `;
      document.body.prepend(banner);
      if (window.location.pathname.includes('save-planner') || window.location.pathname.includes('save-planner')) {
        setTimeout(() => {
          const t = document.getElementById('syndicate-save-planner') || document.getElementById('keypadTrainerBox');
          if (t) t.scrollIntoView({ behavior: 'smooth' });
        }, 500);
      }
    },

    acceptChallenge(val) {
      const target = document.getElementById('syndicate-save-planner') || document.getElementById('keypadTrainerBox') || document.querySelector('.keypad-trainer');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
        setTimeout(() => {
          if (GTA6.KeypadTrainer && typeof GTA6.KeypadTrainer.start === 'function') {
            GTA6.KeypadTrainer.start();
          }
        }, 600);
      } else {
        window.location.href = '/save-planner.html?challenge=' + encodeURIComponent(val) + '#syndicate-save-planner';
      }
    }
  },

  // --------------------------------------------------------------------------
  // FREE EMBED MODAL (OBS BROWSER SOURCE & IFRAME GENERATOR)
  // --------------------------------------------------------------------------
  openEmbedModal(type = 'clock') {
    const isClock = type === 'clock';
    const title = isClock ? 'Live Leonida 48m Clock &amp; Night Stealth Window' : 'Compact Heist Cut Splitter';
    const embedPath = isClock ? '/embed/clock.html' : '/embed/calculator.html';
    const embedUrl = `https://www.gta6heistguide.com${embedPath}`;
    const obsUrl = `${embedUrl}?obs=1`;
    const iframeCode = `<iframe src="${embedUrl}" width="460" height="${isClock ? '180' : '230'}" frameborder="0" style="border:none; border-radius:10px; overflow:hidden;" scrolling="no"></iframe>`;

    let overlay = document.getElementById('embedModalOverlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'embedModalOverlay';
      overlay.className = 'embed-modal-overlay';
      document.body.appendChild(overlay);
      overlay.addEventListener('click', (ev) => {
        if (ev.target === overlay) GTA6.closeEmbedModal();
      });
    }

    overlay.innerHTML = `
      <div class="embed-modal-box" role="dialog" aria-modal="true">
        <button type="button" class="exit-intent-close" onclick="GTA6.closeEmbedModal()" aria-label="Close Modal">${GTA6.Icons.close(16)}</button>
        <div style="font-family:var(--font-mono); font-size:0.75rem; color:var(--neon-cyan); letter-spacing:1.5px; font-weight:800; text-transform:uppercase; margin-bottom:0.4rem;">&lt;/&gt; FREE SYNDICATE WIDGET EMBED</div>
        <h3 style="color:#fff; font-size:1.35rem; margin-bottom:0.4rem;">Embed ${title}</h3>
        <p style="color:var(--text-muted); font-size:0.85rem; margin-bottom:1.15rem;">Free, auto-updating widget for your gaming blog, crew site, or Twitch / Kick / TikTok Live OBS Browser Source.</p>

        <div style="margin-bottom:1rem;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.25rem;">
            <strong style="color:#fff; font-size:0.82rem;">1. Web iFrame Embed (For Blogs &amp; Websites)</strong>
            <button type="button" class="btn btn-secondary" style="padding:0.2rem 0.6rem; font-size:0.72rem;" onclick="GTA6.copyText('${iframeCode.replace(/"/g, '&quot;')}', 'iFrame Code')">📋 Copy iFrame</button>
          </div>
          <div class="embed-code-block">${iframeCode.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
        </div>

        <div style="margin-bottom:1.15rem;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.25rem;">
            <strong style="color:var(--neon-green); font-size:0.82rem;">2. OBS Browser Source URL (Twitch / Kick / TikTok Live)</strong>
            <button type="button" class="btn btn-primary" style="padding:0.2rem 0.6rem; font-size:0.72rem;" onclick="GTA6.copyText('${obsUrl}', 'OBS Source URL')">📋 Copy OBS URL</button>
          </div>
          <div class="embed-code-block" style="color:var(--neon-cyan);">${obsUrl}</div>
          <div style="font-size:0.75rem; color:#94a3b8; font-family:var(--font-mono);">💡 OBS Tip: Add Browser Source &rarr; Paste URL &rarr; Width: 460, Height: ${isClock ? '180' : '230'} &bull; Background is 100% transparent with ?obs=1</div>
        </div>

        <div style="display:flex; justify-content:flex-end;">
          <button type="button" class="btn btn-secondary" onclick="GTA6.closeEmbedModal()" style="padding:0.45rem 1rem; font-size:0.8rem;">Done</button>
        </div>
      </div>
    `;

    setTimeout(() => overlay.classList.add('active'), 20);
  },

  closeEmbedModal() {
    const overlay = document.getElementById('embedModalOverlay');
    if (overlay) overlay.classList.remove('active');
  },

  // --------------------------------------------------------------------------
  // PWA REGISTRATION & MOBILE ADD TO HOME SCREEN PROMPT
  // --------------------------------------------------------------------------
  _deferredPwaPrompt: null,
  initPwa() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(() => {});
      });
    }
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this._deferredPwaPrompt = e;
      document.documentElement.classList.add('pwa-installable');
      document.querySelectorAll('.btn-pwa-top').forEach((btn) => {
        btn.classList.add('is-installable');
      });
    });
    window.addEventListener('appinstalled', () => {
      this._deferredPwaPrompt = null;
      document.documentElement.classList.remove('pwa-installable');
      document.querySelectorAll('.btn-pwa-top').forEach((btn) => {
        btn.classList.remove('is-installable');
      });
    });
  },

  async triggerPwaPrompt() {
    if (this._deferredPwaPrompt) {
      this._deferredPwaPrompt.prompt();
      try {
        const res = await this._deferredPwaPrompt.userChoice;
        if (res && res.outcome === 'accepted') {
          document.documentElement.classList.remove('pwa-installable');
        }
      } catch (e) {}
      this._deferredPwaPrompt = null;
      return;
    }
    this.showToast('📱 Tap your browser menu or Share icon → Add to Home Screen to install GTA 6 Second Screen!');
  },

  dismissPwa() {
    const b = document.getElementById('pwaInstallBanner');
    if (b) b.remove();
    try {
      localStorage.setItem('gta6_pwa_dismissed', '1');
    } catch (e) {}
  },
DealRotator: {
      deals: [],
      buildDeals() {
        const cfg = GTA6.SiteConfig ? GTA6.SiteConfig.get() : {};
        const bAmz = (u) => (GTA6.SiteConfig ? GTA6.SiteConfig.buildAmazonUrl(u) : u);
        return [
          {
            id: "dualsense-edge",
            title: "Sony DualSense Edge Wireless Controller",
            badgeVerified: "PS5 PRO CONTROLLER",
            badgeMerchant: "AMAZON",
            desc: "Official PS5 pro controller with remappable rear paddles, trigger stops, and swappable stick modules.",
            priceLabel: "Paid Amazon Link",
            price: "Check Live Price",
            pillDiscount: "PS5 & PC",
            img: "",
            ctaPrimary: { text: "View on Amazon →", href: bAmz("https://www.amazon.com/dp/B0BS5V7T65?tag=gta6heistguid-20"), partner: "amazon", cls: "btn-deal-amazon" }
          },
          {
            id: "samsung-990",
            title: "Samsung 990 PRO 2TB with Heatsink",
            badgeVerified: "PS5 M.2 NVME SSD",
            badgeMerchant: "7,450 MB/s",
            desc: "PCIe Gen4 M.2 NVMe expansion SSD with factory slim heatsink built for PlayStation 5 and PC.",
            priceLabel: "Paid Amazon Link",
            price: "Check Live Price",
            pillDiscount: "PS5 & PC",
            img: "",
            ctaPrimary: { text: "View on Amazon →", href: bAmz("https://www.amazon.com/dp/B0BHJDY57J?tag=gta6heistguid-20"), partner: "amazon", cls: "btn-deal-amazon" }
          },
          {
            id: "wd-black-sn850p",
            title: "WD_BLACK 2TB SN850P NVMe SSD for PS5",
            badgeVerified: "OFFICIAL PS5 LICENSED",
            badgeMerchant: "WESTERN DIGITAL",
            desc: "Officially licensed PlayStation 5 internal M.2 NVMe drive with a custom low-profile heatsink.",
            priceLabel: "Paid Amazon Link",
            price: "Check Live Price",
            pillDiscount: "PS5 & PC",
            img: "",
            ctaPrimary: { text: "View on Amazon →", href: bAmz("https://www.amazon.com/dp/B0C47ZX1WB?tag=gta6heistguid-20"), partner: "amazon", cls: "btn-deal-amazon" }
          },
          {
            id: "g2a-gamepass",
            title: "G2A PSN & Xbox Gift Cards",
            badgeVerified: "DIGITAL MARKETPLACE",
            badgeMerchant: "GLOBAL KEYS",
            desc: "Browse digital gift cards, console subscriptions, and game keys across verified marketplace sellers.",
            priceLabel: "G2A Marketplace",
            price: "Live Listings",
            pillDiscount: "DIGITAL KEYS",
            img: "",
            ctaPrimary: { text: "Browse G2A Marketplace →", href: cfg.g2aUrl || "https://www.g2a.com/n/reflink-4094b9aab5", partner: "g2a", cls: "btn-deal-g2a" }
          }
        ];
      },
      currentIndex: 0,
      timer: null,
      init() {
        const container = document.getElementById('dealSpotlightGrid');
        if (!container) return;
        const cfg = GTA6.SiteConfig ? GTA6.SiteConfig.get() : (window.SITE_CONFIG || {});
        const allowAmazon = cfg.enableAmazonProductPlacements === true;
        this.deals = this.buildDeals().filter((d) => allowAmazon || (d.ctaPrimary && d.ctaPrimary.partner !== 'amazon'));
        if (!allowAmazon || !this.deals.length) {
          container.innerHTML = '';
          container.hidden = true;
          container.style.display = 'none';
          return;
        }

        // Stable session-based selection (no random jump on refresh)
        const seed = (window.GTA6AffiliateCards && window.GTA6AffiliateCards.getSessionSeed)
          ? window.GTA6AffiliateCards.getSessionSeed()
          : 0;
        this.currentIndex = seed % Math.max(1, this.deals.length);
        this.render();
      },
      next() {
        if (!this.deals.length) return;
        this.currentIndex = (this.currentIndex + 1) % this.deals.length;
        this.render();
      },
      prev() {
        if (!this.deals.length) return;
        this.currentIndex = (this.currentIndex - 1 + this.deals.length) % this.deals.length;
        this.render();
      },
      render() {
        const container = document.getElementById('dealSpotlightGrid');
        if (!container || !this.deals.length) return;

        const items = [];
        for (let i = 0; i < 4; i++) {
          const idx = (this.currentIndex + i) % this.deals.length;
          items.push(this.deals[idx]);
        }

        container.style.opacity = '0.5';
        setTimeout(() => {
          container.innerHTML = items.map(d => `
            <div class="deal-card-premium">
              <div>
                <div class="deal-img-stage">
                  <img src="${d.img}" alt="${d.title}" loading="lazy">
                  <span class="deal-badge-verified">${d.badgeVerified}</span>
                  <span class="deal-badge-merchant">${d.badgeMerchant}</span>
                </div>
                <div class="deal-body-premium">
                  <h4 class="deal-title-premium">${d.title}</h4>
                  <div class="deal-rating-row">
                    <span class="deal-stars">${d.stars}</span>
                    <span style="color:#fff; font-weight:800;">${d.rating}</span>
                    <span>(${d.ratingCount})</span>
                  </div>
                  <p class="deal-desc-premium">${d.desc}</p>
                  <div class="deal-price-bar">
                    <div>
                      <span style="font-size:0.72rem; color:#94a3b8; display:block;">${d.priceLabel}</span>
                      <span class="deal-price-current" style="color:var(--neon-green);">${d.price}</span>
                    </div>
                    <span class="deal-pill-discount">${d.pillDiscount}</span>
                  </div>
                </div>
              </div>
              <div style="padding:0 1.15rem 1.15rem; display:grid; gap:0.4rem;">
                <a href="${d.ctaPrimary.href}" target="_blank" rel="sponsored nofollow noopener" data-aff-partner="${d.ctaPrimary.partner}" data-aff-placement="deal-rotator-${d.id}" class="${d.ctaPrimary.cls}" ${d.ctaPrimary.style ? 'style="' + d.ctaPrimary.style + '"' : ''}>${d.ctaPrimary.text}</a>
                ${d.ctaSecondary ? `<a href="${d.ctaSecondary.href}" target="_blank" rel="sponsored nofollow noopener" data-aff-partner="${d.ctaSecondary.partner}" data-aff-placement="deal-rotator-${d.id}-sec" class="${d.ctaSecondary.cls}">${d.ctaSecondary.text}</a>` : ''}
              </div>
            </div>
          `).join('');
          container.style.opacity = '1';
        }, 180);
      }
    },

    // --------------------------------------------------------------------------
    // INTERACTIVE ENTERTAINMENT: ROLL HEIST CREW MINI-GAME
    // --------------------------------------------------------------------------
    SquadRoll: {
      leads: [
        { id: "lucia-caminos", name: "Lucia Caminos", role: "Mastermind Lead", perk: "+22% Decryption & Line-of-Sight", img: "assets/character-lucia.jpg?v=20261118_v5" },
        { id: "jason-duval", name: "Jason Duval", role: "Tactical Marksman Lead", perk: "Eagle-Eye Radar & Wet Traction", img: "assets/character-jason.jpg?v=20261118_v5" }
      ],
      specialists: [
        { id: "cal-hampton", name: "Cal Hampton", role: "Signals Intel Contact", perk: "+30s Police Response Delay", img: "assets/character-cal-hampton.jpg?v=20261118_v4" },
        { id: "stefanie", name: "Stefanie", role: "Correctional Counselor", perk: "Legal Clearance & Low Alert", img: "assets/character-stefanie.jpg?v=20261118_v4" },
        { id: "brian-heder", name: "Brian Heder", role: "Armor Fabricator", perk: "+35% Chassis Bulletproofing", img: "assets/character-brian-heder.jpg?v=20261118_v4" },
        { id: "drequan-priest", name: "Dre'Quan Priest", role: "Offshore Wheelman", perk: "Radar-Ghost Water Exfil", img: "assets/character-drequan-priest.jpg?v=20261118_v4" },
        { id: "raul-bautista", name: "Raul Bautista", role: "Thermal Breacher", perk: "Sub-45s Vault Wall Detonation", img: "assets/character-raul-bautista.jpg?v=20261118_v4" }
      ],
      fences: [
        { id: "petra-navarro", name: "Petra Navarro", role: "Museum Art Fence", perk: "+15% Take on Rare Artifacts", img: "assets/character-petra.jpg" },
        { id: "boobie-ike", name: "Boobie Ike", role: "Luxury Club Kingpin", perk: "-4% Cash Laundering Fee", img: "assets/character-boobie-ike.jpg?v=20261118_v4" },
        { id: "phil", name: "Phil", role: "Gator Keys Gunrunner", perk: "Ordnance Surplus: +2 Vests", img: "assets/character-phil.jpg" },
        { id: "leonida-joker", name: "Leonida Joker", role: "Viral Decoy Contact", perk: "-1 Star Level Outside Bank", img: "assets/character-leonida-joker.jpg?v=20261118_v4" }
      ],
      spin() {
        if (GTA6.playSound) GTA6.playSound('click');
        const btn = document.getElementById('spinSquadBtn');
        const container = document.getElementById('squadRollResults');
        if (!container) return;

        if (btn) {
          btn.disabled = true;
          btn.innerHTML = '🎲 Calculating Syndicate Synergy...';
        }

        let rolls = 0;
        const interval = setInterval(() => {
          rolls++;
          const tempLead = this.leads[Math.floor(Math.random() * this.leads.length)];
          const tempSpec = this.specialists[Math.floor(Math.random() * this.specialists.length)];
          const tempFence = this.fences[Math.floor(Math.random() * this.fences.length)];

          container.innerHTML = `
            <div class="squad-slot-card" style="border-color:var(--neon-pink);">
              <img src="/${tempLead.img.replace(/^\/+/, '')}" alt="${tempLead.name}" width="54" height="54" style="width:54px; height:54px; border-radius:50%; object-fit:cover; border:2px solid var(--neon-pink);">
              <div>
                <span style="font-size:0.7rem; color:var(--neon-pink); font-family:var(--font-mono); font-weight:800;">LEAD OPERATIVE</span>
                <div style="font-weight:900; color:#fff; font-size:0.95rem;">${tempLead.name}</div>
                <div style="font-size:0.75rem; color:#94a3b8;">${tempLead.role}</div>
              </div>
            </div>
            <div class="squad-slot-card" style="border-color:var(--neon-cyan);">
              <img src="/${tempSpec.img.replace(/^\/+/, '')}" alt="${tempSpec.name}" width="54" height="54" style="width:54px; height:54px; border-radius:50%; object-fit:cover; border:2px solid var(--neon-cyan);">
              <div>
                <span style="font-size:0.7rem; color:var(--neon-cyan); font-family:var(--font-mono); font-weight:800;">SPECIALIST</span>
                <div style="font-weight:900; color:#fff; font-size:0.95rem;">${tempSpec.name}</div>
                <div style="font-size:0.75rem; color:#94a3b8;">${tempSpec.role}</div>
              </div>
            </div>
            <div class="squad-slot-card" style="border-color:var(--neon-yellow);">
              <img src="/${tempFence.img.replace(/^\/+/, '')}" alt="${tempFence.name}" width="54" height="54" style="width:54px; height:54px; border-radius:50%; object-fit:cover; border:2px solid var(--neon-yellow);">
              <div>
                <span style="font-size:0.7rem; color:var(--neon-yellow); font-family:var(--font-mono); font-weight:800;">GETAWAY / FENCE</span>
                <div style="font-weight:900; color:#fff; font-size:0.95rem;">${tempFence.name}</div>
                <div style="font-size:0.75rem; color:#94a3b8;">${tempFence.role}</div>
              </div>
            </div>
          `;

          if (rolls >= 6) {
            clearInterval(interval);
            const finalLead = this.leads[Math.floor(Math.random() * this.leads.length)];
            const finalSpec = this.specialists[Math.floor(Math.random() * this.specialists.length)];
            const finalFence = this.fences[Math.floor(Math.random() * this.fences.length)];
            const synergy = 92 + Math.floor(Math.random() * 8); // 92% to 99%
            const bonusTake = (1.1 + (Math.random() * 0.4)).toFixed(2); // $1.10M to $1.50M

            container.innerHTML = `
              <div class="squad-slot-card" style="border-color:var(--neon-pink); cursor:pointer;" onclick="GTA6.CharacterModal.open('${finalLead.id}')" title="Click to view full dossier">
                <img src="/${finalLead.img.replace(/^\/+/, '')}" alt="${finalLead.name}" width="58" height="58" style="width:58px; height:58px; border-radius:50%; object-fit:cover; border:2px solid var(--neon-pink);">
                <div style="flex:1;">
                  <span style="font-size:0.7rem; color:var(--neon-pink); font-family:var(--font-mono); font-weight:800;">LEAD OPERATIVE</span>
                  <div style="font-weight:900; color:#fff; font-size:0.95rem;">${finalLead.name} 📂</div>
                  <div style="font-size:0.75rem; color:var(--neon-green);">${finalLead.perk}</div>
                </div>
              </div>
              <div class="squad-slot-card" style="border-color:var(--neon-cyan); cursor:pointer;" onclick="GTA6.CharacterModal.open('${finalSpec.id}')" title="Click to view full dossier">
                <img src="/${finalSpec.img.replace(/^\/+/, '')}" alt="${finalSpec.name}" width="58" height="58" style="width:58px; height:58px; border-radius:50%; object-fit:cover; border:2px solid var(--neon-cyan);">
                <div style="flex:1;">
                  <span style="font-size:0.7rem; color:var(--neon-cyan); font-family:var(--font-mono); font-weight:800;">SPECIALIST</span>
                  <div style="font-weight:900; color:#fff; font-size:0.95rem;">${finalSpec.name} 📂</div>
                  <div style="font-size:0.75rem; color:var(--neon-cyan);">${finalSpec.perk}</div>
                </div>
              </div>
              <div class="squad-slot-card" style="border-color:var(--neon-yellow); cursor:pointer;" onclick="GTA6.CharacterModal.open('${finalFence.id}')" title="Click to view full dossier">
                <img src="/${finalFence.img.replace(/^\/+/, '')}" alt="${finalFence.name}" width="58" height="58" style="width:58px; height:58px; border-radius:50%; object-fit:cover; border:2px solid var(--neon-yellow);">
                <div style="flex:1;">
                  <span style="font-size:0.7rem; color:var(--neon-yellow); font-family:var(--font-mono); font-weight:800;">GETAWAY / FENCE</span>
                  <div style="font-weight:900; color:#fff; font-size:0.95rem;">${finalFence.name} 📂</div>
                  <div style="font-size:0.75rem; color:var(--neon-yellow);">${finalFence.perk}</div>
                </div>
              </div>
            `;

            const synergyBanner = document.createElement('div');
            synergyBanner.style.cssText = 'grid-column: 1 / -1; margin-top: 0.65rem; background: rgba(0, 240, 255, 0.12); border: 1px solid var(--neon-cyan); border-radius: 8px; padding: 0.65rem 1rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;';
            synergyBanner.innerHTML = `
              <div style="font-size:0.85rem; color:#fff;">
                ⭐ <strong style="color:var(--neon-green);">${synergy}% ELITE SYNDICATE SYNERGY</strong> &bull; Estimated Payout Bonus: <strong style="color:var(--neon-yellow);">+$${bonusTake}M Cash</strong>
              </div>
              <a href="/heist-planner" class="btn btn-primary" style="padding:0.3rem 0.75rem; font-size:0.75rem;">Load Into Squad Planner &rarr;</a>
            `;
            container.appendChild(synergyBanner);

            if (btn) {
              btn.disabled = false;
              btn.innerHTML = '🎲 Re-Roll Heist Crew';
            }
          }
        }, 150);
      }
    },
    toggleTacticalPeek(id) {
      const el = document.getElementById(id);
      if (!el) return;
      const isHidden = el.style.display === 'none' || !el.style.display;
      el.style.display = isHidden ? 'block' : 'none';
      if (isHidden) {
        this.playBeep(580, 'triangle', 0.05);
      } else {
        this.playBeep(420, 'sine', 0.04);
      }
      const btn = document.querySelector(`[data-peek-target="${id}"]`);
      if (btn) {
        btn.innerHTML = isHidden ? '▲ Close Tactical Peek' : '⚡ Quick Tactical Peek &bull; Approaches &amp; Splits';
      }
    },
    toggleAllTargets(btn) {
      const extraCards = document.querySelectorAll('.heist-extra-target');
      if (!extraCards.length) return;
      const isCurrentlyHidden = extraCards[0].style.display === 'none';
      extraCards.forEach((c) => {
        c.style.display = isCurrentlyHidden ? 'block' : 'none';
      });
      if (btn) {
        btn.innerHTML = isCurrentlyHidden ? 'Show Less Jobs &uarr;' : 'Show All 10 Story Heists &amp; Planned Jobs &darr;';
      }
      if (isCurrentlyHidden) {
        this.playBeep(520, 'triangle', 0.06);
      } else {
        this.playBeep(380, 'sine', 0.05);
      }
    },
    LiveIntelSync: {
      latestCounts: { characters: 25, weapons: 47, vehicles: 186, properties: 12, masks: 16 },
      normName(s) {
        return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
      },
      normalizeWeaponCategory(cat) {
        const raw = String(cat || '').toLowerCase();
        if (raw.includes('sniper')) return 'snipers';
        if (raw.includes('sidearm') || raw.includes('pistol') || raw.includes('revolver')) return 'sidearms';
        if (raw.includes('smg') || raw.includes('submachine')) return 'smg';
        if (raw.includes('shotgun')) return 'shotguns';
        if (raw.includes('heavy') || raw.includes('launcher')) return 'heavy';
        if (raw.includes('melee') || raw.includes('entry')) return 'melee';
        if (raw.includes('gear') || raw.includes('tactical') || raw.includes('tool')) return 'gear';
        if (raw.includes('primary') || raw.includes('rifle') || raw.includes('carbine')) return 'rifles';
        return raw || 'rifles';
      },
      assetPath(img, fallback) {
        const clean = String(img || fallback || '').replace(/^\/+/, '');
        return clean.startsWith('http') ? clean : '/' + clean;
      },
      esc(s) {
        return String(s || '')
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      },
      updateCountDisplays() {
        const c = this.latestCounts;
        document.querySelectorAll('.live-sync-badge').forEach((el) => {
          el.innerHTML = `⚡ LIVE SYNC: ${c.characters} Operatives &bull; ${c.weapons} Weapons &amp; Gear &bull; ${c.vehicles} Vehicles &bull; ${c.properties} Safehouses &bull; ${c.masks || 16} Masks`;
        });
        const timeEl = document.getElementById('liveSyncTimestamp');
        if (timeEl) {
          timeEl.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        const setTxt = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = String(val); };
        setTxt('syncCharsCount', c.characters);
        setTxt('syncWeaponsCount', c.weapons);
        setTxt('syncVehiclesCount', c.vehicles);
        setTxt('syncMasksCount', c.masks || 16);
        setTxt('syncPropsCount', c.properties);
        document.querySelectorAll('.sync-chars-total').forEach((el) => { el.textContent = String(c.characters); });
        document.querySelectorAll('.sync-weapons-total').forEach((el) => { el.textContent = String(c.weapons); });
        document.querySelectorAll('.sync-vehicles-total').forEach((el) => { el.textContent = String(c.vehicles); });
        document.querySelectorAll('.sync-props-total').forEach((el) => { el.textContent = String(c.properties); });
      },
      async poll() {
        try {
          const masterRes = await fetch('/data/gta6_master_intel.json?t=' + Math.floor(Date.now() / 60000));
          if (masterRes.ok) {
            const master = await masterRes.json();
            const ct = master.catalogTotals || {};
            this.latestCounts = {
              characters: ct.characters || (master.characters || []).length || 25,
              weapons: ct.weapons || (master.weapons || []).length || 47,
              vehicles: ct.vehicles || (master.vehicles || []).length || 186,
              properties: ct.properties || (master.properties || []).length || 12,
              masks: ct.masks || 16
            };
            this.hydrateAndRender(master);
          }

          const res = await fetch('/api/sync-feed?t=' + Date.now());
          if (res.ok) {
            const feed = await res.json();
            if (feed.ok && feed.counts) {
              if (feed.counts.characters) this.latestCounts.characters = Math.max(this.latestCounts.characters, feed.counts.characters);
              if (feed.counts.weapons) this.latestCounts.weapons = Math.max(this.latestCounts.weapons, feed.counts.weapons);
              if (feed.counts.vehicles) this.latestCounts.vehicles = Math.max(this.latestCounts.vehicles, feed.counts.vehicles);
              if (feed.counts.properties) this.latestCounts.properties = Math.max(this.latestCounts.properties, feed.counts.properties);
              if (feed.counts.masks) this.latestCounts.masks = feed.counts.masks;
            }
          }
          this.updateCountDisplays();
        } catch (e) {
          this.updateCountDisplays();
        }
      },
      hydrateAndRender(master) {
        if (Array.isArray(master.vehicles) && GTA6.VehicleData) {
          const vehGrid = document.getElementById('vehGrid');
          const seenVehIds = new Set();
          const seenVehNames = new Set();
          if (vehGrid) {
            vehGrid.querySelectorAll('.veh-card').forEach((card) => {
              const oc = card.getAttribute('onclick') || '';
              const m = oc.match(/VehicleModal\.open\(['"]([^'"]+)['"]\)/);
              if (m) seenVehIds.add(this.normName(m[1].replace(/^vehicle-/, '')));
              const h3 = card.querySelector('h3');
              if (h3) seenVehNames.add(this.normName(h3.textContent));
            });
          }
          master.vehicles.forEach((v) => {
            const key = v.id.toLowerCase().replace(/^vehicle-/, '');
            const normKey = this.normName(key);
            const normTitle = this.normName(v.name);
            const imgSrc = this.assetPath(v.image, 'assets/vehicle-tulip.jpg');
            const st = v.stats || {};
            const vehObj = {
              id: v.id,
              name: v.name,
              realName: v.realName || 'Confirmed GTA VI Vehicle',
              category: v.category || 'muscle',
              speed: v.speed || '148 MPH',
              accel: v.accel || '4.2s (0-60)',
              handling: v.handling || '82/100',
              driveType: v.driveType || 'RWD / Performance',
              capacity: v.capacity || '4 Duffel Bags',
              bulletproof: v.bulletproof || 'Reinforced Chassis (Grade B)',
              heistRole: v.heistRole || `Leonida ${(v.category || 'getaway').toUpperCase()} Escape Platform`,
              source: v.source || 'GTA Wiki & Official Rockstar Reveals',
              image: imgSrc,
              bio: v.bio || 'Confirmed GTA VI vehicle indexed by SATCOM Auto-Sync.',
              stats: {
                speed: st.speed || 80,
                accel: st.accel || 78,
                handling: st.handling || 82,
                armor: st.armor || (v.category === 'pursuit' || v.category === 'suv' ? 84 : 72)
              }
            };
            if (!GTA6.VehicleData[v.id]) GTA6.VehicleData[v.id] = vehObj;
            if (!GTA6.VehicleData[key]) GTA6.VehicleData[key] = vehObj;

            if (vehGrid && !seenVehIds.has(normKey) && !seenVehIds.has(this.normName(v.id)) && !seenVehNames.has(normTitle)) {
              seenVehIds.add(normKey);
              seenVehIds.add(this.normName(v.id));
              seenVehNames.add(normTitle);
              let uiCat = v.category || 'muscle';
              if (uiCat === 'police') uiCat = 'pursuit';
              if (uiCat === 'offroad') uiCat = 'suv';
              const card = document.createElement('div');
              card.className = 'veh-card';
              card.setAttribute('data-category', uiCat);
              card.setAttribute('data-keywords', `${v.name} ${v.realName || ''} ${uiCat} ${v.bio || ''}`.toLowerCase());
              card.setAttribute('onclick', `GTA6.VehicleModal.open('${v.id}')`);
              card.setAttribute('title', 'Click to view full vehicle dossier & trunk specs');
              card.innerHTML = `
                <div class="veh-img-stage">
                  <img src="${imgSrc}" alt="${this.esc(v.name)}" width="320" height="180" loading="lazy" decoding="async">
                  <span class="veh-badge-class">${this.esc(uiCat.toUpperCase())} // VERIFIED</span>
                  <span class="veh-badge-speed">⚡ ${this.esc(vehObj.speed)}</span>
                </div>
                <div class="veh-content" style="padding:1.15rem; display:flex; flex-direction:column; flex:1; justify-content:space-between;">
                  <div>
                    <h3 style="color:#fff; font-size:1.05rem; margin:0 0 0.15rem; font-weight:900;">${this.esc(v.name)}</h3>
                    <div style="color:var(--neon-cyan); font-size:0.75rem; font-family:var(--font-mono); font-weight:700;">${this.esc(vehObj.realName)}</div>
                    <div class="veh-stat-row" style="display:grid; grid-template-columns:1fr 1fr; gap:0.4rem; margin:0.6rem 0; font-size:0.75rem; font-family:var(--font-mono); background:rgba(0,0,0,0.4); padding:0.45rem; border-radius:6px; border:1px solid rgba(255,255,255,0.06);">
                      <div><span>Drive:</span> <strong style="color:#fff;">${this.esc(vehObj.driveType.split('/')[0])}</strong></div>
                      <div><span>Trunk:</span> <strong style="color:var(--neon-yellow);">${this.esc(vehObj.capacity.split('(')[0])}</strong></div>
                      <div><span>Armor:</span> <strong style="color:var(--neon-green);">${vehObj.stats.armor}/100</strong></div>
                      <div><span>Accel:</span> <strong style="color:var(--neon-cyan);">${this.esc(vehObj.accel.split(' ')[0])}</strong></div>
                    </div>
                    <p style="color:var(--text-muted); font-size:0.78rem; line-height:1.4; margin:0;">${this.esc((v.bio || '').slice(0, 110))}...</p>
                  </div>
                  <span class="veh-click-hint" style="display:block; font-size:0.72rem; color:var(--neon-cyan); font-family:var(--font-mono); font-weight:700; margin-top:0.65rem; border-top:1px solid rgba(255,255,255,0.08); padding-top:0.45rem;">📂 CLICK FOR DOSSIER &amp; TRUNK SPECS &rarr;</span>
                </div>
              `;
              vehGrid.appendChild(card);
            }
          });
          if (vehGrid) {
            const totalCards = vehGrid.querySelectorAll('.veh-card').length;
            this.latestCounts.vehicles = totalCards;
            if (typeof window.syncVehicleCounts === 'function') {
              window.syncVehicleCounts();
            } else {
              const resCount = document.getElementById('vehResultCount');
              if (resCount) resCount.textContent = `Showing ${totalCards} Confirmed Vehicles • Click any vehicle for full dossier & trunk specs`;
              const allBtn = document.querySelector('.veh-filter-pill[onclick*="\'all\'"]');
              if (allBtn) allBtn.textContent = `All Confirmed (${totalCards})`;
            }
          }
        }

        if (Array.isArray(master.weapons) && GTA6.WeaponData) {
          const gearGrid = document.getElementById('gearGrid');
          const seenWeapKeys = new Set();
          const seenWeapNames = new Set();
          if (gearGrid) {
            gearGrid.querySelectorAll('.item-card').forEach((card) => {
              if (card.id) seenWeapKeys.add(this.normName(card.id.replace(/^item-/, '')));
              const oc = card.getAttribute('onclick') || '';
              if (oc) {
                const m = oc.match(/['"]([^'"]+)['"]/);
                if (m) seenWeapKeys.add(this.normName(m[1].replace(/^weapon-|^gear-/, '')));
              }
              const h3 = card.querySelector('h3');
              if (h3) seenWeapNames.add(this.normName(h3.textContent));
            });
          }
          master.weapons.forEach((w) => {
            const key = w.id.toLowerCase().replace(/^weapon-/, '').replace(/^gear-/, '');
            const normKey = this.normName(key);
            const normId = this.normName(w.id);
            const normTitle = this.normName(w.name);
            const uiCat = this.normalizeWeaponCategory(w.category);
            const imgSrc = this.assetPath(w.image, 'assets/weapon-carbine.jpg');
            const wObj = {
              id: w.id,
              name: w.name,
              realName: w.caliber || w.type || 'Confirmed GTA VI Ordnance',
              category: uiCat,
              type: w.type || 'Tactical Weapon',
              caliber: w.caliber || 'NATO Standard',
              magSize: uiCat === 'melee' || uiCat === 'gear' ? 'Reusable Utility' : 'Extended / Factory Mag',
              fireRate: uiCat === 'smg' || uiCat === 'rifles' ? 'Full-Auto / Burst' : 'Precision Semi-Auto',
              noise: (w.stealth || 50) >= 75 ? 'Silent / Suppressible' : 'Standard Ballistic Report',
              conceal: (w.stealth || 50) >= 70 ? 'High (Under Jacket)' : 'Sling / Duffel Bag Required',
              range: `${w.range || 75}m Effective`,
              attachments: w.perk || 'Suppressor, Optic, Extended Mag Ready',
              source: 'Official GTA VI Wiki & Armory Intel',
              image: imgSrc,
              bio: w.bio || 'Confirmed GTA VI tactical loadout item.',
              stats: {
                damage: w.damage || 80,
                fireRate: uiCat === 'smg' ? 88 : (uiCat === 'rifles' ? 82 : 68),
                range: w.range || 75,
                accuracy: Math.max(60, Math.round(((w.range || 75) + (w.stealth || 60)) / 2))
              }
            };
            if (!GTA6.WeaponData[w.id]) GTA6.WeaponData[w.id] = wObj;
            if (!GTA6.WeaponData[key]) GTA6.WeaponData[key] = wObj;

            if (gearGrid && !seenWeapKeys.has(normKey) && !seenWeapKeys.has(normId) && !seenWeapNames.has(normTitle)) {
              seenWeapKeys.add(normKey);
              seenWeapKeys.add(normId);
              seenWeapNames.add(normTitle);
              const card = document.createElement('div');
              card.className = 'item-card';
              card.setAttribute('data-category', uiCat);
              card.setAttribute('data-keywords', `${w.name} ${w.type || ''} ${w.caliber || ''} ${uiCat} ${w.bio || ''}`.toLowerCase());
              card.setAttribute('onclick', `GTA6.WeaponModal.open('${w.id}')`);
              card.style.cursor = 'pointer';
              card.innerHTML = `
                <div class="item-img-stage">
                  <img src="${imgSrc}" alt="${this.esc(w.name)}" width="320" height="175" loading="lazy" decoding="async">
                  <span class="item-badge-cat">${this.esc((w.type || uiCat || 'TACTICAL').toUpperCase())}</span>
                </div>
                <div class="item-body">
                  <h3>${this.esc(w.name)}</h3>
                  <div class="item-subtitle">${this.esc(w.caliber || 'Confirmed Spec')}</div>
                  <p style="color:var(--text-muted); font-size:0.8rem; line-height:1.45; margin-bottom:0.75rem;">${this.esc((w.bio || '').slice(0, 110))}...</p>
                  <div class="item-stats-table" style="display:grid; grid-template-columns:1fr 1fr; gap:0.4rem; font-size:0.74rem; font-family:var(--font-mono); background:rgba(0,0,0,0.5); padding:0.5rem; border-radius:6px; border:1px solid rgba(255,255,255,0.06);">
                    <div>DMG: <strong style="color:var(--neon-pink);">${w.damage || 80}</strong></div>
                    <div>RNG: <strong style="color:var(--neon-green);">${w.range || 75}</strong></div>
                  </div>
                </div>
              `;
              gearGrid.appendChild(card);
            }
          });
          if (gearGrid) {
            const totalItems = gearGrid.querySelectorAll('.item-card').length;
            this.latestCounts.weapons = totalItems;
            if (typeof window.syncWeaponCounts === 'function') {
              window.syncWeaponCounts();
            } else {
              const cnt = document.getElementById('itemCountDisplay');
              if (cnt) cnt.innerText = `Showing ${totalItems} of ${totalItems}`;
            }
          }
        }

        if (Array.isArray(master.characters)) {
          const charGrid = document.getElementById('characterGrid');
          const seenCharIds = new Set();
          const seenCharNames = new Set();
          if (charGrid) {
            charGrid.querySelectorAll('.char-card').forEach((card) => {
              if (card.id) {
                seenCharIds.add(this.normName(card.id));
                seenCharIds.add(this.normName(card.id.replace(/^character-/, '')));
              }
              const h2 = card.querySelector('h2, h3');
              if (h2) {
                seenCharNames.add(this.normName(h2.textContent));
                seenCharNames.add(this.normName(h2.textContent.replace(/\([^)]*\)/g, '')));
              }
            });
          }
          master.characters.forEach((c) => {
            const imgSrc = this.assetPath(c.image, 'assets/character-lucia.jpg');
            const charCat = c.category || 'story';
            if (GTA6.CharacterData && !GTA6.CharacterData[c.id]) {
              GTA6.CharacterData[c.id] = {
                id: c.id,
                name: c.name,
                alias: c.cut || 'COMMUNITY / WIKI DOSSIER',
                category: charCat + ' (Community / Fan Dossier)',
                role: c.role || 'Community-Catalogued Contact',
                specialty: c.specialty || 'Simulated Underworld Role',
                cut: c.cut || 'Story / Contact (Sim)',
                district: c.district || 'State of Leonida',
                actor: 'Undisclosed / Community Wiki Reference',
                source: c.source || 'Community GTA Wiki & Fan Simulator Dossier (Not Confirmed by Rockstar)',
                weapon: 'Compact Sidearm (Simulated Loadout)',
                weaponLink: '/weapons',
                perk: `Fan-Made Heist Simulator Role (Not an Official Rockstar Perk): ${c.specialty || 'Simulated regional contact in squad planning.'}`,
                image: imgSrc,
                bio: `Community / Wiki Dossier & Fan Simulator Profile: ${c.role}. ${c.specialty}. Active across ${c.district}. Note: This entry is a community-tracked / fan-simulator dossier and is not an officially featured Rockstar Games main cast bio.`,
                stats: { decryption: 78, intimidation: 80, combat: 82, wheelman: 76 }
              };
            }
            if (charGrid && !seenCharIds.has(this.normName(c.id)) && !seenCharNames.has(this.normName(c.name))) {
              seenCharIds.add(this.normName(c.id));
              seenCharNames.add(this.normName(c.name));
              const card = document.createElement('div');
              card.className = 'char-card';
              card.id = c.id;
              card.setAttribute('data-category', charCat);
              card.setAttribute('data-keywords', `${c.name} ${c.role} ${c.district} ${c.specialty} ${charCat}`.toLowerCase());
              card.setAttribute('onclick', `GTA6.CharacterModal.open('${c.id}')`);
              card.style.cursor = 'pointer';
              card.innerHTML = `
                <div style="height:230px; overflow:hidden; position:relative; background:#080e18;">
                  <img src="${imgSrc}" alt="${this.esc(c.name)}" width="320" height="230" loading="lazy" decoding="async" style="width:100%; height:100%; object-fit:cover; object-position:center 20%;">
                  <span class="user-badge" style="position:absolute; top:10px; left:10px; background:rgba(0,0,0,0.85); border-color:var(--neon-amber); color:var(--neon-amber); font-size:0.72rem; font-weight:800;">${this.esc(c.badge || 'COMMUNITY / WIKI DOSSIER')}</span>
                </div>
                <div style="padding:1.25rem;">
                  <div style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom:0.35rem;">
                    <h2 style="color:#fff; font-size:1.35rem; margin:0;">${this.esc(c.name)}</h2>
                    <span style="color:var(--neon-amber); font-size:0.78rem; font-weight:800; font-family:var(--font-mono);">${this.esc((c.cut || 'CONTACT').toUpperCase())} (SIM)</span>
                  </div>
                  <p style="color:var(--text-muted); font-size:0.84rem; line-height:1.5; margin-bottom:0.85rem;"><strong>Community / Fan Simulator Profile:</strong> ${this.esc(c.role)} &bull; ${this.esc(c.specialty)} (${this.esc(c.district)})</p>
                </div>
              `;
              charGrid.appendChild(card);
            }
          });
          if (charGrid) {
            const totalChars = charGrid.querySelectorAll('.char-card').length;
            this.latestCounts.characters = totalChars;
            if (typeof window.syncCrewCounts === 'function') {
              window.syncCrewCounts();
            } else {
              const cnt = document.getElementById('charCountDisplay');
              if (cnt) cnt.innerText = `Showing ${totalChars} of ${totalChars}`;
            }
          }
        }

        if (Array.isArray(master.properties)) {
          const propGrid = document.getElementById('propertiesCatalogGrid');
          if (propGrid) {
            const seenPropIds = new Set();
            const seenPropNames = new Set();
            propGrid.querySelectorAll('.prop-card').forEach((card) => {
              if (card.id) seenPropIds.add(this.normName(card.id));
              const h3 = card.querySelector('h3');
              if (h3) seenPropNames.add(this.normName(h3.textContent));
            });
            master.properties.forEach((p) => {
              if (!p || seenPropIds.has(this.normName(p.id)) || seenPropNames.has(this.normName(p.name))) return;
              seenPropIds.add(this.normName(p.id));
              seenPropNames.add(this.normName(p.name));
              const cat = p.cat || 'front';
              const imgSrc = this.assetPath(p.image, 'assets/prop-venetian-mansion.webp');
              const card = document.createElement('div');
              card.className = 'card prop-card';
              card.id = p.id;
              card.setAttribute('data-cat', cat);
              card.style.cssText = 'border:1px solid rgba(0,240,255,0.3); background:rgba(10,16,26,0.95); display:flex; flex-direction:column; justify-content:space-between;';
              card.innerHTML = `
                <div>
                  <div class="prop-img-stage" style="height:175px; overflow:hidden; border-radius:8px; margin-bottom:0.85rem; position:relative; background:#080e18;">
                    <img src="${imgSrc}" alt="${this.esc(p.name)}" width="640" height="360" loading="lazy" decoding="async" style="width:100%; height:100%; object-fit:cover; display:block;">
                    <span class="card-tag tag-intermediate" style="position:absolute; top:10px; left:10px; margin:0; background:rgba(6,11,20,0.88);">${this.esc((p.tier || cat).toUpperCase())}</span>
                  </div>
                  <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:0.5rem; margin-bottom:0.5rem;">
                    <span style="font-size:0.74rem; color:var(--neon-cyan); font-family:var(--font-mono);">${this.esc(p.type || 'Syndicate Front Concept')}</span>
                    <span style="font-family:var(--font-mono); font-size:1.05rem; font-weight:900; color:var(--neon-amber);" title="Fan-Made Simulator Estimate">${this.esc(p.price || '$1,500,000 (Sim)')}</span>
                  </div>
                  <h3 class="card-title" style="margin-bottom:0.35rem;">${this.esc(p.name)}</h3>
                  <div style="font-size:0.76rem; color:var(--neon-cyan); font-family:var(--font-mono); margin-bottom:0.85rem;">📍 ${this.esc(p.district || 'State of Leonida')}</div>
                  <div style="background:rgba(0,0,0,0.4); border-radius:6px; padding:0.65rem 0.85rem; margin-bottom:0.85rem; font-size:0.8rem; font-family:var(--font-mono);">
                    <div style="color:#fff; margin-bottom:0.25rem;">🚗 <strong>Garage / Staging:</strong> ${this.esc(p.garage || 'Secure Vehicle Staging (Sim)')}</div>
                    <div style="color:var(--neon-amber);">💼 <strong>Simulated Laundering:</strong> ${this.esc(p.laundering || 'Front Escrow Model (Sim)')}</div>
                  </div>
                  <p style="color:var(--text-muted); font-size:0.85rem; line-height:1.45; margin-bottom:0.85rem;">${this.esc(Array.isArray(p.features) ? p.features.join(' • ') : (p.features || p.bio || ''))}</p>
                  <div style="font-size:0.78rem; color:var(--text-muted); margin-bottom:1rem; border-top:1px solid rgba(255,255,255,0.08); padding-top:0.65rem;">
                    <strong style="color:#fff;">🎯 Lore &amp; Simulator Note:</strong> ${this.esc(p.heistSynergy || 'Strategic regional getaway & wash hub.')}
                  </div>
                </div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.5rem;">
                  <a href="#launderCalcAnchor" class="btn btn-secondary" onclick="setLaunderPipeline('marina', 3.4)" style="padding:0.45rem; font-size:0.75rem; text-align:center;">Simulate Laundering</a>
                  <a href="/map.html" class="btn btn-primary" style="padding:0.45rem; font-size:0.75rem; text-align:center;">Locate on Map &rarr;</a>
                </div>
              `;
              propGrid.appendChild(card);
            });
            const totalProps = propGrid.querySelectorAll('.prop-card').length;
            this.latestCounts.properties = totalProps;
            if (typeof window.syncPropertyCounts === 'function') {
              window.syncPropertyCounts();
            }
          }
        }

        if (Array.isArray(master.youtubeWire) && master.youtubeWire.length) {
          const ytGrid = document.getElementById('youtubeWireGrid');
          if (ytGrid) {
            ytGrid.innerHTML = master.youtubeWire.slice(0, 8).map((v) => {
              const pubDate = v.published ? String(v.published).slice(0, 10) : '';
              const vidMatch = String(v.url || '').match(/[?&]v=([A-Za-z0-9_-]{6,})/);
              const thumbUrl = v.thumbnail || (vidMatch ? `https://i.ytimg.com/vi/${vidMatch[1]}/hqdefault.jpg` : '');
              return `
                <a href="${this.esc(v.url)}" target="_blank" rel="noopener noreferrer" class="card" style="text-decoration:none; padding:0; overflow:hidden; border:1px solid rgba(0,240,255,0.22); background:rgba(10,16,26,0.92); display:flex; flex-direction:column; justify-content:space-between;">
                  <div>
                    ${thumbUrl ? `<div style="height:168px; overflow:hidden; background:#050811; position:relative;"><img src="${this.esc(thumbUrl)}" alt="${this.esc(v.title)}" width="320" height="180" loading="lazy" decoding="async" style="width:100%; height:100%; object-fit:cover; display:block;"></div>` : ''}
                    <div style="padding:1rem;">
                      <div style="display:flex; justify-content:space-between; align-items:center; gap:0.5rem; margin-bottom:0.4rem;">
                        <span class="user-badge" style="font-size:0.66rem; background:rgba(239,68,68,0.16); border-color:#ef4444; color:#fca5a5;">▶ ${this.esc(v.channel)}</span>
                        <span style="font-size:0.7rem; color:#94a3b8; font-family:var(--font-mono);">${this.esc(pubDate)}</span>
                      </div>
                      <h3 style="color:#fff; font-size:0.95rem; line-height:1.35; margin:0;">${this.esc(v.title)}</h3>
                    </div>
                  </div>
                  <div style="padding:0 1rem 0.9rem; font-size:0.75rem; color:var(--neon-cyan); font-family:var(--font-mono); font-weight:700;">Watch Broadcast on YouTube &rarr;</div>
                </a>
              `;
            }).join('');
          }
        }
      },
      async manualPing(btn) {
        if (GTA6.playBeep) {
          GTA6.playBeep(440, 'sine', 0.05);
          setTimeout(() => GTA6.playBeep(880, 'triangle', 0.08), 75);
        }
        if (btn) {
          const orig = btn.innerHTML;
          btn.disabled = true;
          btn.innerHTML = '⚡ Scanning Master Intel...';
          await this.poll();
          const c = this.latestCounts;
          setTimeout(() => {
            btn.innerHTML = '✓ Database Synchronized';
            btn.style.borderColor = 'var(--neon-green)';
            btn.style.color = 'var(--neon-green)';
            if (GTA6.showToast) {
              GTA6.showToast(`🛰️ Live Sync Complete: ${c.characters} Characters, ${c.vehicles} Vehicles, ${c.weapons} Weapons & ${c.properties} Safehouses active!`);
            }
            setTimeout(() => {
              btn.innerHTML = orig;
              btn.disabled = false;
              btn.style.borderColor = '';
              btn.style.color = '';
            }, 3000);
          }, 500);
        } else {
          await this.poll();
        }
      },
      init() {
        this.poll();
        setInterval(() => this.poll(), 10 * 60 * 1000);
      }
    },

    OwnerDrawer: {
      isOpen: false,
      getLocalClickCounts() {
        const counts = { amazon: 0, g2a: 0, exitlag: 0, gumroad: 0, getapexlocal: 0 };
        try {
          const arr = JSON.parse(localStorage.getItem('gta6_aff_clicks') || '[]');
          arr.forEach((item) => {
            const p = String(item.partner || '').toLowerCase();
            if (p in counts) counts[p] += 1;
          });
        } catch (e) {}
        return counts;
      },
      ensureDom() {
        if (document.getElementById('ownerCommandDrawer')) return;
        const wrap = document.createElement('div');
        wrap.innerHTML = `
          <aside class="bookmarks-drawer" id="ownerCommandDrawer" aria-label="Protected Owner Command Drawer" style="border-left-color:var(--neon-yellow);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; border-bottom:1px solid var(--border-card); padding-bottom:0.75rem;">
              <div>
                <span class="user-badge badge-mastermind" style="font-size:0.65rem;">OWNER COMMAND DRAWER</span>
                <h3 style="color:var(--neon-yellow); font-size:1.08rem; margin:0.25rem 0 0;">📊 Click Proof &amp; CSV Export</h3>
              </div>
              <button type="button" class="modal-close-btn" style="position:static;" onclick="GTA6.OwnerDrawer.closeDrawer()" aria-label="Close Owner Drawer">${GTA6.Icons.close(15)}</button>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; gap:0.5rem; margin-bottom:0.85rem;">
              <span style="font-size:0.76rem; color:var(--neon-cyan);">🔒 Cloudflare Access Protected</span>
              <button type="button" class="btn btn-secondary" onclick="GTA6.OwnerDrawer.refreshAll()" style="padding:0.4rem 0.75rem; font-size:0.76rem; white-space:nowrap;">🔄 Refresh All</button>
            </div>
            <div id="ownerDrawerStatus" style="font-size:0.78rem; color:var(--text-muted); margin-bottom:0.85rem;">Syncing live Cloudflare D1 proof via Cloudflare Access...</div>

            <div class="bookmark-item" style="border-color:rgba(0,240,255,0.35);">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.55rem;">
                <strong style="color:#fff; font-size:0.9rem;">📊 Affiliate Click Counts by Partner</strong>
                <span id="ownerD1TotalClicks" style="font-family:var(--font-mono); font-size:0.78rem; color:var(--neon-green);">-- total</span>
              </div>
              <div id="ownerPartnerClickGrid" style="display:grid; grid-template-columns:1fr 1fr; gap:0.45rem; font-size:0.78rem; font-family:var(--font-mono);"></div>
              <div id="ownerRecentClicksList" style="margin-top:0.65rem; font-size:0.72rem; color:var(--text-muted);"></div>
              <button type="button" class="btn btn-secondary" onclick="GTA6.OwnerDrawer.refreshClicks()" style="width:100%; margin-top:0.65rem; padding:0.45rem; font-size:0.78rem;">🔄 Refresh Click Proof</button>
            </div>

            <div class="bookmark-item" style="border-color:rgba(0,255,136,0.35);">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
                <strong style="color:#fff; font-size:0.9rem;">📥 Launch Alert Subscribers (D1)</strong>
                <span id="ownerD1SubCount" style="font-family:var(--font-mono); font-size:0.8rem; color:var(--neon-cyan);">--</span>
              </div>
              <p style="font-size:0.76rem; color:var(--text-muted); margin:0 0 0.65rem;">1-click CSV download directly from Cloudflare D1 for newsletter blasts or buyer handover verification.</p>
              <button type="button" class="btn btn-primary" onclick="GTA6.OwnerDrawer.exportSubscribersCsv()" style="width:100%; padding:0.55rem; font-size:0.82rem;">📥 Export Alert Subscribers (.CSV)</button>
            </div>

            <div style="display:flex; gap:0.5rem; flex-wrap:wrap; margin-top:0.75rem;">
              <a href="/syndicate-command.html" class="btn btn-secondary" style="flex:1; text-align:center; padding:0.45rem; font-size:0.76rem;">🎛️ Full Command Center</a>
            </div>
          </aside>
        `;
        document.body.appendChild(wrap);
      },
      openDrawer() {
        this.ensureDom();
        const drawer = document.getElementById('ownerCommandDrawer');
        if (drawer) {
          drawer.classList.add('open');
          this.isOpen = true;
          this.renderLocalFallback();
          this.refreshAll();
        }
      },
      closeDrawer() {
        const drawer = document.getElementById('ownerCommandDrawer');
        if (drawer) drawer.classList.remove('open');
        this.isOpen = false;
      },
      toggleDrawer() {
        if (this.isOpen) this.closeDrawer();
        else this.openDrawer();
      },
      renderLocalFallback() {
        const grid = document.getElementById('ownerPartnerClickGrid');
        if (!grid) return;
        const local = this.getLocalClickCounts();
        const labels = [
          ['amazon', 'Amazon'],
          ['g2a', 'G2A'],
          ['exitlag', 'ExitLag'],
          ['gumroad', 'Gumroad'],
          ['getapexlocal', 'GetApexLocal'],
        ];
        grid.innerHTML = labels.map(([k, label]) => `
          <div style="background:rgba(0,0,0,0.45); border:1px solid rgba(255,255,255,0.1); border-radius:6px; padding:0.45rem 0.6rem; display:flex; justify-content:space-between;">
            <span style="color:#cbd5e1;">${label}</span>
            <strong style="color:var(--neon-cyan);">${local[k] || 0} (local)</strong>
          </div>
        `).join('');
      },
      async refreshClicks() {
        const statusEl = document.getElementById('ownerDrawerStatus');
        try {
          const res = await fetch('/api/cd-admin/affiliate-report', { credentials: 'same-origin' });
          const data = await res.json().catch(() => ({}));
          if (!res.ok || !data.ok) {
            if (statusEl) statusEl.innerHTML = `<span style="color:var(--neon-pink);">Cloudflare Access required (${res.status}): ${data.error || 'Unauthorized.'}</span>`;
            this.renderLocalFallback();
            return;
          }
          const byP = data.byPartner || {};
          const d7 = data.last7DaysByPartner || {};
          const totalEl = document.getElementById('ownerD1TotalClicks');
          if (totalEl) totalEl.textContent = `${Number(data.totalClicks || 0).toLocaleString()} D1 clicks`;
          const labels = [
            ['amazon', 'Amazon'],
            ['g2a', 'G2A'],
            ['exitlag', 'ExitLag'],
            ['gumroad', 'Gumroad'],
            ['getapexlocal', 'GetApexLocal'],
          ];
          const grid = document.getElementById('ownerPartnerClickGrid');
          if (grid) {
            grid.innerHTML = labels.map(([k, label]) => `
              <div style="background:rgba(0,0,0,0.45); border:1px solid rgba(0,240,255,0.22); border-radius:6px; padding:0.45rem 0.6rem;">
                <div style="display:flex; justify-content:space-between;">
                  <span style="color:#cbd5e1;">${label}</span>
                  <strong style="color:var(--neon-green);">${Number(byP[k] || 0).toLocaleString()}</strong>
                </div>
                <div style="font-size:0.66rem; color:#94a3b8; margin-top:2px;">7d: ${Number(d7[k] || 0).toLocaleString()}</div>
              </div>
            `).join('');
          }
          const recentEl = document.getElementById('ownerRecentClicksList');
          if (recentEl && Array.isArray(data.recent)) {
            recentEl.innerHTML = data.recent.length
              ? `Recent: ${data.recent.slice(0, 3).map((r) => `${r.partner} (${r.placement || 'site'})`).join(' • ')}`
              : 'No outbound clicks recorded in D1 yet.';
          }
          if (statusEl) statusEl.innerHTML = '<span style="color:var(--neon-green);">✅ Synced live Cloudflare D1 affiliate clicks &amp; subscribers.</span>';
        } catch (err) {
          if (statusEl) statusEl.innerHTML = `<span style="color:var(--neon-pink);">Click API error: ${err.message}</span>`;
        }
      },
      async refreshSubscribers() {
        try {
          const res = await fetch('/api/cd-admin/subscribers', { credentials: 'same-origin' });
          const data = await res.json().catch(() => ({}));
          const el = document.getElementById('ownerD1SubCount');
          if (el && res.ok && data.ok) {
            el.textContent = `${Number(data.rawCount || 0).toLocaleString()} subscribers`;
          }
        } catch (e) {}
      },
      async refreshAll() {
        await Promise.all([this.refreshClicks(), this.refreshSubscribers()]);
      },
      exportSubscribersCsv() {
        window.location.href = '/api/cd-admin/subscribers?export=csv';
      },
      init() {
        document.addEventListener('keydown', (e) => {
          if (e.ctrlKey && e.shiftKey && e.key && e.key.toLowerCase() === 'o') {
            e.preventDefault();
            this.toggleDrawer();
          }
        });
        try {
          const params = new URLSearchParams(window.location.search);
          if (params.get('owner') === '1') {
            this.openDrawer();
          }
        } catch (e) {}
      }
    }
  };

  window.GTA6 = GTA6;

  document.addEventListener('DOMContentLoaded', () => {
    GTA6.SiteConfig.init();
    GTA6.initMobileNav();
    GTA6.ExitIntent.init();
    GTA6.initCountdown();
    GTA6.initFAQ();
    GTA6.initChecklists();
    GTA6.Bookmarks.init();
    GTA6.Auth.init();
    GTA6.initIntelFeed();
    GTA6.initForum();
    GTA6.injectCommunityPulse();
    if (document.getElementById('profileEditForm')) GTA6.initProfilePage();
    
    GTA6.PromoVideo.init();
    GTA6.CompanionHUD.init();
    GTA6.MasteryAndStreak.init();
    GTA6.LiveIntelSync.init();
    GTA6.DealRotator.init();
    GTA6.DealTicker.init();
    GTA6.initAffiliateTracking();
    GTA6.FlexCard.initChallengeBanner();
    GTA6.initPwa();
    GTA6.SiteConfig.applyToDom();
    GTA6.OwnerDrawer.init();
    if (document.getElementById('squadRollResults')) {
      GTA6.SquadRoll.spin();
    }
  });
