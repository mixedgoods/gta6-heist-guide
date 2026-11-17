// ==========================================================================
// GTA 6 HEIST GUIDE v3.0 - LIVE CLIENT ENGINE, D1 SYNC, BOOKMARKS, VIP & VIDEO
// ==========================================================================
const GTA6 = {
  audioCtx: null,
  soundEnabled: true,
  synthRadio: null,
  radioPlaying: false,
  intelData: null,
  currentIntelFilter: 'all',
  currentThreadFilter: 'all',
  cachedThreads: [],
  cachedSquads: [],

  // --------------------------------------------------------------------------
  // SOUND & TOAST ENGINE
  // --------------------------------------------------------------------------
  initSound() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContext();
    } catch (e) {}
  },

  playBeep(freq = 440, type = 'sine', duration = 0.08) {
    if (!this.soundEnabled) return;
    if (!this.audioCtx) this.initSound();
    if (!this.audioCtx) return;
    if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + duration);
    } catch (e) {}
  },

  playSuccess() {
    this.playBeep(523.25, 'triangle', 0.06);
    setTimeout(() => this.playBeep(659.25, 'triangle', 0.06), 60);
    setTimeout(() => this.playBeep(783.99, 'triangle', 0.12), 120);
  },

  toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    const btn = document.getElementById('soundBtn');
    if (btn) btn.innerText = this.soundEnabled ? '🔊 Audio FX: ON' : '🔇 Audio FX: OFF';
    if (this.soundEnabled) this.playSuccess();
  },

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
    const slug = String((v && v.slug) || '').replace(/\.html$/, '').replace(/^\//, '');
    document.querySelectorAll('.bonus-badge[data-vault-slug]').forEach((b) => {
      const on = b.dataset.vaultSlug === slug;
      b.style.display = on ? 'block' : 'none';
      const amt = b.querySelector('.bonus-amt');
      if (on && amt && v.bonusPayout) amt.textContent = v.bonusPayout;
    });
  },

  heistTier(target) {
    const t = String(target || '');
    if (/Leonida State|Ocean Drive/i.test(t)) return 'Mastermind';
    if (/Sinfrontera|Starlet/i.test(t)) return 'Expert';
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
    lines.push('🔗 Find or post squads: https://www.gta6heistguide.com/forum#lfg-hub');
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
      window.location.href = '/forum#lfg-hub';
    }
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
    const launchTarget = Date.UTC(2026, 10, 19, 0, 0, 0); // Nov 19, 2026 00:00 UTC
    const launchEl = document.getElementById('countdownTimer');
    const weeklyEl = document.getElementById('weeklyResetTimer');

    const update = () => {
      const now = Date.now();
      const diff = launchTarget - now;
      if (launchEl) {
        launchEl.innerText = diff <= 0 ? 'LIVE DAY-1 LEONIDA META ACTIVE' : this.formatDiff(diff);
      }
      if (diff <= 0) {
        document.querySelectorAll('.launch-mode-label').forEach((el) => {
          el.innerText = 'LIVE DAY-1 LEONIDA META ACTIVE';
        });
      }
      if (weeklyEl) {
        const nextReset = this.getNextThursdayUTC(new Date(now));
        weeklyEl.innerText = this.formatDiff(nextReset - now);
      }
    };

    update();
    setInterval(update, 1000);
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
      slug, name, bonusTag: '1.5X FEATURED WEEKLY SCORE', basePayout: base, bonusPayout: bonus,
      recommendedApproach: approach, specialistSpotlight: spot, summary,
    });
    const rotation = [
      V('leonida-reserve', 'Leonida State Gold Reserve Infiltration', '$25,000,000', '$37,500,000', 'Silent Sewer Intake + Thermal Lance', 'Zero-Delay Ghost Hacker (-3% Cut Discount This Week)', 'Priority focus this week on subterranean access routes and dual-keycard vaults.'),
      V('sinfrontera-bank', 'Sinfrontera National Bank Vault Raid', '$14,500,000', '$21,750,000', 'Sub-floor Drainage + EMP Transformer', 'Precision Laser Drill Tech (2x Vault Door Speed)', 'Downtown Vice City safety deposit boxes show elevated bearer-bond drops this rotation.'),
      V('vice-city-yacht-heist', 'Starlet Superyacht Offshore Heist', '$11,800,000', '$17,700,000', 'Sub-Aquatic Rebreather Hull Breach', 'Offshore Boat Wheelman (+15% Coastal Escape Speed)', 'VIP stateroom keys rotate every 90 seconds; scuba exfiltration stays radar-immune.'),
      V('port-gellhorn', 'Port Gellhorn Container Terminal Heist', '$8,200,000', '$12,300,000', 'Nighttime Crane Terminal Hijack', 'Canal Demolitionist (Silent Container Breaching)', 'Cartel manifest containers on Pier 4 carry triple bearer-share electronics crates this week.'),
      V('ocean-drive-armored-convoy', 'Ocean Drive Armored Depository Ambush', '$9,400,000', '$14,100,000', 'Magnetic EMP + Metro Subway Escape', 'Signal Gridlock Hacker (Extended 45s Dispatch Blindness)', 'Peak coastal traffic rewards coordinated dual-EMP truck stops and subway exfiltration.'),
      V('everglades-smuggler-run', 'Grassrivers Cartel Airstrip Raid', '$6,500,000', '$9,750,000', 'Thermal Night-Vision Airboat Ingress', 'Swamp Bush Pilot (Zero Radar Altitude Flight)', 'A low-ceiling storm front reduces patrol helicopter sweeps across the Grassrivers corridor.'),
    ];
    const now = new Date();
    const cycle = Math.floor((now.getTime() - 10 * 3600 * 1000) / (7 * 86400 * 1000));
    const weekNum = cycle;
    const vault = rotation[(((cycle + 2) % 6) + 6) % 6];
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
          summary: 'Ensure 7,000+ MB/s Gen4 NVMe storage and verify 4-player squad roles before tackling high-value depositories.',
          link: 'gameplay-mechanics.html',
        },
        {
          id: 'intel-meta',
          category: 'meta',
          badge: 'WEEKLY META',
          title: `Featured Vault Rotation: ${vault.name} (${vault.bonusPayout} Potential)`,
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
          link: 'interactive-map.html',
        },
      ],
    };
  },

  async initIntelFeed() {
    let data = null;
    try {
      const res = await fetch('/api/intel');
      if (res.ok) data = await res.json();
    } catch (e) {}

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
            <button type="button" class="modal-close-btn" onclick="GTA6.closeDynamicGuide()">✕</button>
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
      badgeEl.innerText = profile.vipVerified ? `${profile.role} ★ VIP` : profile.role;
      badgeEl.className = `user-badge ${profile.badgeClass}`;
    }

    const buildsCount = this.Bookmarks.getAll().length;
    bindText('statPlanned', String((profile.heistsPlanned || 12) + buildsCount));
    bindText('statPayout', profile.totalPayout || '$148.5M');
    bindText('statRep', Number(profile.syndicateRep || 1240).toLocaleString());
    bindText('statPlatform', profile.platform || 'PS5 Pro & PC');

    const vipBadgeBox = document.getElementById('profileVipStatusBox');
    if (vipBadgeBox) {
      if (profile.vipVerified) {
        vipBadgeBox.innerHTML = `<span class="user-badge badge-mastermind" style="font-size:0.85rem;">✅ VERIFIED FOUNDER // VIP EMAIL UNLOCKED (${profile.email})</span>
        <button type="button" class="btn btn-secondary" style="padding:0.4rem 0.9rem; font-size:0.78rem; margin-left:0.5rem;" onclick="GTA6.Auth.openCheatSheet()">Download VIP Blueprints</button>`;
      } else {
        vipBadgeBox.innerHTML = `<button type="button" class="btn btn-primary" style="padding:0.5rem 1.2rem; font-size:0.82rem;" onclick="GTA6.Auth.openModal()">🎁 Verify Email for Founder Badge & +2,500 Rep</button>`;
      }
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
    init() {
      this.updateNavButton();
      this.fetchSubscriberCount();

      const inlineForm = document.getElementById('vipUnlockForm');
      if (inlineForm) {
        inlineForm.addEventListener('submit', (e) => {
          e.preventDefault();
          this.handleSubmit({
            email: document.getElementById('vipEmailInline')?.value,
            callsign: document.getElementById('vipAliasInline')?.value,
            platform: document.getElementById('vipPlatformInline')?.value || 'PS5 Pro & PC',
            role: document.getElementById('vipRoleInline')?.value || 'Mastermind',
            discord_tag: document.getElementById('vipDiscordInline')?.value || '',
            statusElId: 'vipInlineStatus',
          });
        });
      }
    },

    async fetchSubscriberCount() {
      try {
        const res = await fetch('/api/subscribe');
        if (!res.ok) return;
        const data = await res.json();
        const raw = Number(data.totalSubscribers || 0);
        document.querySelectorAll('.verified-members-count').forEach((el) => {
          el.innerText = raw > 0 ? `${raw.toLocaleString()} Verified Operatives` : '6 Leonida Regions Mapped';
        });
      } catch (e) {}
    },

    updateNavButton() {
      const profile = GTA6.getProfile();
      const actionsEl = document.querySelector('.nav-actions');
      if (!actionsEl) return;

      let vipBtn = document.getElementById('navVipBtn');
      if (!vipBtn) {
        vipBtn = document.createElement('button');
        vipBtn.id = 'navVipBtn';
        vipBtn.className = 'btn-vip-nav';
        vipBtn.onclick = () => this.openModal();
        actionsEl.insertBefore(vipBtn, actionsEl.firstChild);
      }

      if (profile.vipVerified) {
        vipBtn.classList.add('verified');
        vipBtn.innerText = `★ ${profile.alias} (VIP)`;
      } else {
        vipBtn.classList.remove('verified');
        vipBtn.innerText = '🎁 VIP Login / Blueprints';
      }
    },

    injectModals() {
      if (document.getElementById('vipLoginModal')) return;
      const profile = GTA6.getProfile();
      const wrap = document.createElement('div');
      wrap.innerHTML = `
        <div class="modal-backdrop" id="vipLoginModal">
          <div class="modal-box">
            <button type="button" class="modal-close-btn" onclick="GTA6.Auth.closeModal()">✕</button>
            <div style="text-align:center; margin-bottom:1.25rem;">
              <span class="user-badge badge-mastermind" style="margin-bottom:0.6rem;">FOUNDER SYNDICATE ACCESS</span>
              <h2 style="color:#fff; font-size:1.55rem; margin-bottom:0.4rem;">Unlock Free VIP Vault Blueprints & +2,500 Rep</h2>
              <p style="color:var(--text-muted); font-size:0.88rem;">Back up your Leonida Criminal Enterprise Mastery %, receive weekly GTA 6 heist meta alerts, Thursday 1.5X payout rotations, and unlock free VIP strategy blueprints (<strong style="color:var(--neon-cyan);">6 Leonida Regions Mapped &bull; 100% Free Tools</strong>).</p>
            </div>
            <div class="vip-pack-preview">
              <img src="assets/vip-blueprint-pack.png" alt="VIP Holographic Vault Blueprint Pack">
            </div>
            <form id="modalVipForm">
              <div class="grid" style="grid-template-columns:1fr 1fr; gap:0.8rem;">
                <div class="form-group">
                  <label>Operative Callsign</label>
                  <input type="text" class="form-input" id="vipAliasModal" value="${profile.alias}" required>
                </div>
                <div class="form-group">
                  <label>Preferred Platform</label>
                  <select class="form-select" id="vipPlatformModal">
                    <option value="PS5 Pro">PS5 Pro</option>
                    <option value="Xbox Series X|S">Xbox Series X|S</option>
                    <option value="PC">PC</option>
                  </select>
                </div>
              </div>
              <div class="form-group">
                <label>Email Address (Delivers Weekly Meta & Blueprint Pack)</label>
                <input type="email" class="form-input" id="vipEmailModal" value="${profile.email || ''}" placeholder="operative@email.com" required>
              </div>
              <div class="grid" style="grid-template-columns:1fr 1fr; gap:0.8rem;">
                <div class="form-group">
                  <label>Crew Role Badge</label>
                  <select class="form-select" id="vipRoleModal">
                    <option value="Mastermind">Mastermind</option>
                    <option value="Hacker">Ghost Hacker</option>
                    <option value="Wheelman">Wheelman</option>
                    <option value="Enforcer">Enforcer</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Discord / PSN / Gamertag (Optional LFG)</label>
                  <input type="text" class="form-input" id="vipDiscordModal" value="${profile.discordTag || ''}" placeholder="e.g. ViceBoss#1024">
                </div>
              </div>
              <label style="display:flex; align-items:flex-start; gap:0.5rem; font-size:0.78rem; color:var(--text-muted); margin-bottom:1rem; cursor:pointer;">
                <input type="checkbox" id="vipOptInModal" checked style="margin-top:3px;">
                <span>Send me weekly GTA 6 heist patch updates, 1.5X payout alerts, and vetted partner gear deals (Unsubscribe anytime).</span>
              </label>
              <button type="submit" class="btn btn-primary" style="width:100%;">🔓 Unlock VIP Blueprint Pack & Verify Profile</button>
              <div id="vipModalStatus" style="margin-top:0.75rem; font-size:0.85rem; text-align:center;"></div>
            </form>
            <div id="vipUnlockedActions" style="display:${profile.vipVerified ? 'block' : 'none'}; margin-top:1.2rem; padding:1rem; background:rgba(0,255,136,0.08); border:1px solid var(--neon-green); border-radius:8px; text-align:center;">
              <div style="color:var(--neon-green); font-weight:800; margin-bottom:0.5rem;">✅ VIP ACCESS ACTIVE // CODE: FOUNDER-VIP-2026</div>
              <button type="button" class="btn btn-secondary" style="width:100%;" onclick="GTA6.Auth.downloadVipPack()">📥 Download VIP Tactical Vault Cheat Sheet (.TXT)</button>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(wrap);

      const modalForm = document.getElementById('modalVipForm');
      if (modalForm) {
        modalForm.addEventListener('submit', (e) => {
          e.preventDefault();
          this.handleSubmit({
            email: document.getElementById('vipEmailModal')?.value,
            callsign: document.getElementById('vipAliasModal')?.value,
            platform: document.getElementById('vipPlatformModal')?.value || 'PS5 Pro',
            role: document.getElementById('vipRoleModal')?.value || 'Mastermind',
            discord_tag: document.getElementById('vipDiscordModal')?.value || '',
            marketing_opt_in: document.getElementById('vipOptInModal')?.checked !== false,
            statusElId: 'vipModalStatus',
          });
        });
      }
    },

    openModal() {
      if (!document.getElementById('vipLoginModal')) {
        this.injectModals();
        this.fetchSubscriberCount();
      }
      const m = document.getElementById('vipLoginModal');
      if (m) m.classList.add('open');
      GTA6.playBeep(520, 'triangle', 0.05);
    },

    closeModal() {
      const m = document.getElementById('vipLoginModal');
      if (m) m.classList.remove('open');
    },

    openCheatSheet() {
      this.openModal();
    },

    async handleSubmit({ email, callsign, platform, role, discord_tag, marketing_opt_in = true, statusElId }) {
      const cleanEmail = String(email || '').trim();
      const cleanAlias = String(callsign || '').trim() || 'ViceOperative';
      const statusEl = statusElId ? document.getElementById(statusElId) : null;

      if (!cleanEmail || !cleanEmail.includes('@')) {
        if (statusEl) statusEl.innerHTML = `<span style="color:var(--neon-pink);">Please enter a valid email address.</span>`;
        return;
      }
      if (statusEl) statusEl.innerHTML = `<span style="color:var(--neon-cyan);">Encrypting Operative Credentials...</span>`;

      let apiRes = { ok: true, perkCode: 'FOUNDER-VIP-2026', repBonus: 2500 };
      try {
        const res = await fetch('/api/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: cleanEmail, callsign: cleanAlias, platform, role, discord_tag, marketing_opt_in }),
        });
        if (res.ok) apiRes = await res.json();
      } catch (e) {}

      const profile = GTA6.getProfile();
      profile.alias = cleanAlias;
      profile.email = cleanEmail;
      profile.platform = platform;
      profile.role = role;
      profile.discordTag = discord_tag;
      if (!profile.vipVerified) {
        profile.syndicateRep = (Number(profile.syndicateRep) || 1240) + 2500;
      }
      profile.vipVerified = true;
      profile.perkCode = apiRes.perkCode || 'FOUNDER-VIP-2026';
      if (role === 'Mastermind') profile.badgeClass = 'badge-mastermind';
      else if (role === 'Hacker') profile.badgeClass = 'badge-hacker';
      else if (role === 'Wheelman') profile.badgeClass = 'badge-wheelman';
      else if (role === 'Enforcer') profile.badgeClass = 'badge-enforcer';

      GTA6.saveProfile(profile);
      this.updateNavButton();
      this.fetchSubscriberCount();
      GTA6.playSuccess();

      const unlockedBox = document.getElementById('vipUnlockedActions');
      if (unlockedBox) unlockedBox.style.display = 'block';

      if (statusEl) {
        statusEl.innerHTML = `<span style="color:var(--neon-green);">✅ Welcome, ${cleanAlias}! Founder VIP Badge & +2,500 Rep unlocked!</span>`;
      }
      GTA6.showToast(`🎉 VIP Unlocked for ${cleanAlias}! Downloading Cheat Sheet Ready.`);
    },

    downloadVipPack() {
      const profile = GTA6.getProfile();
      const content = `======================================================================
GTA6HEISTGUIDE.COM - VIP FOUNDER TACTICAL VAULT BLUEPRINT PACK (v3.0)
Operative: ${profile.alias} | Code: FOUNDER-VIP-2026 | Verified VIP
======================================================================

1. HIGHEST PAYOUT HEIST TIER LIST & OPTIMAL SPLITS
----------------------------------------------------------------------
- Leonida State Gold Reserve ($25,000,000 Base / $37.5M Featured 1.5X)
  * Approach: Silent Sewer Intake + Thermal Lance (+5% Stealth Integrity Bonus)
  * Crew Split Recommendation: 10% Hacker / 15% Gunner / 8% Wheelman -> 67% Squad Pot

- Sinfrontera National Bank ($14,500,000 Base)
  * Approach: Ocean Blvd Storm Drain + Electrical Transformer EMP
  * Tip: Keep thermal drill under 800C to prevent silent lockdown.

- Starlet Superyacht Offshore ($11,800,000 Base)
  * Approach: Sub-Aquatic Scuba Hull Breach + Rebreather Escape (0 Coast Guard Heat)

2. ONLINE HEIST SECURITY & HARDWARE CHECKLIST
----------------------------------------------------------------------
- Shield Host IP in Public Lobbies (NordVPN Low-Ping Gaming Routing):
  https://www.gta6heistguide.com/affiliates-gear.html
- Verify Pre-Order Keys (G2A & Eneba Global Compare):
  https://www.g2a.com/n/reflink-4094b9aab5
  https://www.eneba.com/store/all?q=gta&af_id=gta6heistguide
- Creator Growth Software (50% Affiliate Partner Program):
  https://getapexlocal.com/partners

3. BOOKMARK THE LIVE CREW FINDER & WEEKLY META BOARD:
----------------------------------------------------------------------
- Live Meta & Patch Intel: https://www.gta6heistguide.com/live-intel.html
- LFG Crew Matchmaker: https://www.gta6heistguide.com/forum.html
- Interactive Cut Calculator: https://www.gta6heistguide.com/heist-planner.html
`;
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `GTA6HeistGuide_VIP_Blueprints_${profile.alias}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      GTA6.playSuccess();
      GTA6.showToast('📥 Downloaded VIP Tactical Vault Cheat Sheet!');
    },
  },

  // --------------------------------------------------------------------------
  // CALCULATOR & GUIDE BOOKMARKING + URL STATE SHARING
  // --------------------------------------------------------------------------
  Bookmarks: {
    STORAGE_KEY: 'gta6_saved_blueprints',

    getAll() {
      try {
        return JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
      } catch (e) {
        return [];
      }
    },

    saveAll(list) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(list));
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
              <button type="button" class="modal-close-btn" style="position:static;" onclick="GTA6.Bookmarks.toggleDrawer()">✕</button>
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
            <button type="button" onclick="GTA6.Bookmarks.removeItem('${item.id}')" style="background:none; border:none; color:var(--neon-pink); cursor:pointer; font-weight:800;">✕</button>
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
    return `heist-planner.html?target=${encodeURIComponent(t)}&approach=${encodeURIComponent(a)}&players=${encodeURIComponent(p)}&g=${g}&h=${h}&d=${d}`;
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
        title: '[SYNDICATE TACTICAL BRIEFING • PRE-LAUNCH META] Leonida Reserve: Subterranean Sewer Intake & 4-Player Stealth Blueprint',
        content: 'Pre-launch tactical analysis of the Pelican Valley northern canal intake conduit. Disabling Grid 4 within the 15-second biometric window lets a 4-player squad bypass exterior courtyard cameras and preserve the +5% Stealth Integrity bonus.',
        votes: 142,
        tag: 'StealthMeta',
      },
      {
        id: 'thread-2',
        author: 'Syndicate Editorial Desk',
        badge: 'badge-hacker',
        badgeName: 'EDITORIAL STRATEGY NOTE',
        avatar: '/assets/avatar-mastermind.png',
        time: 'Pre-Launch Briefing',
        title: '[EDITORIAL STRATEGY NOTE] Sinfrontera National Bank: Dual-Key Biometric Keypad & Laser Drill Pacing',
        content: 'Editorial breakdown of high-roller vault security mechanics: keep thermal drill core temperatures below 800C while the Ghost Hacker completes the 15-second frequency node sequence to avoid triggering nerve-gas lockdown.',
        votes: 89,
        tag: 'VaultIntel',
      },
      {
        id: 'thread-3',
        author: 'Syndicate Editorial Desk',
        badge: 'badge-wheelman',
        badgeName: 'SYNDICATE TACTICAL BRIEFING • PRE-LAUNCH META',
        avatar: '/assets/avatar-mastermind.png',
        time: 'Pre-Launch Briefing',
        title: '[SYNDICATE TACTICAL BRIEFING • PRE-LAUNCH META] Port Gellhorn Container Terminal: 4-Player Role Split & Swamp Canal Exfil',
        content: 'Recommended Day-1 crew composition for Pier 4 freight operations: pair an overhead crane spotter with a high-clearance off-road Wheelman and split 25% evenly across all 4 human operatives to maximize Net $/Hour.',
        votes: 64,
        tag: 'CrewRecruit',
      },
      {
        id: 'thread-4',
        author: 'Syndicate Editorial Desk',
        badge: 'badge-enforcer',
        badgeName: 'EDITORIAL STRATEGY NOTE',
        avatar: '/assets/avatar-mastermind.png',
        time: 'Pre-Launch Briefing',
        title: '[EDITORIAL STRATEGY NOTE] Starlet Superyacht Offshore: Sub-Aquatic Scuba Exfiltration vs. Helipad Heat',
        content: 'Tactical comparison of offshore exfiltration routes: rooftop helicopter extraction triggers immediate 4-star Coast Guard radar locks, whereas diving via the coral dropoff with scuba rebreathers clears coastal heat undetected.',
        votes: 118,
        tag: 'EscapeRoute',
      },
      {
        id: 'thread-5',
        author: 'Syndicate Security Advisory',
        badge: 'badge-mastermind',
        badgeName: 'SYNDICATE SECURITY ADVISORY • PARTNER TIP',
        avatar: '/assets/avatar-mastermind.png',
        time: 'Partner Security Note',
        title: '[SYNDICATE SECURITY ADVISORY • PARTNER TIP] Protecting Peer-to-Peer Co-Op Heist Finales from Lobby DDoS Drops',
        content: 'Transparency & Security Note: Peer-to-peer session drops during multi-million-dollar finales wipe out your Elite Challenge bonus. Our editorial desk recommends routing host traffic through an encrypted low-ping tunnel (see our verified NordVPN partner link) before hosting public LFG lobbies.',
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
        id: 'tpl-gold-reserve',
        isTemplate: true,
        templateTitle: '4-Player Gold Reserve Stealth Squad Template',
        callsign: 'OPEN DAY-1 ARCHETYPE',
        platform: 'PS5 Pro / Xbox Series X|S / PC',
        role: 'Mastermind + Ghost Hacker + Wheelman + Enforcer',
        roleNeeded: '1 Ghost Hacker (Sub-15s) + 1 Canal Wheelman',
        targetHeist: 'Leonida State Gold Reserve ($25.0M)',
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
            <img src="${t.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}" style="width: 32px; height: 32px; border-radius: 50%; border: 1px solid var(--neon-cyan); object-fit: cover;">
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
    const file = (window.location.pathname.split('/').pop() || 'index').replace(/\.html$/, '');
    if (file === 'forum' || file === 'syndicate-command') return;
    if (document.querySelector('.community-pulse-strip')) return;

    const mainEl = document.querySelector('main.container');
    if (!mainEl) return;

    const pulse = document.createElement('section');
    pulse.className = 'community-pulse-strip';
    pulse.innerHTML = `
      <div>
        <div style="color:var(--neon-cyan); font-size:0.78rem; font-weight:800; letter-spacing:1.2px; text-transform:uppercase;">
          <span class="strip-pulse" style="margin-right:6px;"></span> NEED CO-OP HEIST FRIENDS OR STEALTH INTEL?
        </div>
        <div style="color:#fff; font-weight:800; font-size:1.1rem; margin-top:0.2rem;">
          Join the Heist Crew Lounge &bull; Save Builds, Match PS5/Xbox/PC Squads & Unlock VIP Blueprints
        </div>
      </div>
      <div style="display:flex; gap:0.75rem; flex-wrap:wrap;">
        <button type="button" class="btn btn-secondary" style="padding:0.55rem 1rem; font-size:0.82rem;" onclick="GTA6.bookmarkCurrentPage()">⭐ Bookmark Guide</button>
        <a href="forum.html#lfg-hub" class="btn btn-primary" style="padding:0.55rem 1rem; font-size:0.82rem;">🤝 Find Squad & Make Friends &rarr;</a>
      </div>
    `;
    mainEl.insertBefore(pulse, mainEl.firstElementChild);
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
        { k: 'STOP GUESSING CREW CUTS', v: '$25,000,000+ VAULTS', s: 'INTERACTIVE PAYOUT OPTIMIZER' },
        { k: 'LIVE CO-OP LFG CREW FINDER', v: 'PS5 PRO • XBOX • PC', s: 'MATCH VERIFIED HEIST SQUADS' },
        { k: 'WEEKLY AUTO-UPDATING META', v: '1.5X BONUS TARGETS', s: 'THURSDAY RESET & SAFE GUIDES' },
        { k: 'UNLOCK VIP BLUEPRINTS FREE', v: 'GTA6HEISTGUIDE.COM', s: 'BOOKMARK & JOIN THE SYNDICATE' },
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
  KeypadTrainer: {
    seq: [],
    step: 0,
    active: false,
    locking: false,
    difficulty: 'normal',
    startTime: 0,
    lastElapsedMs: 0,
    lastRank: 'Unranked Operative',
    timerInterval: null,

    init() {
      const box = document.getElementById('keypadTrainerBox');
      if (!box) return;
      const bestMs = localStorage.getItem('gta6_keypad_best_ms');
      const bestText = bestMs ? `${Number(bestMs).toLocaleString()} ms (${(Number(bestMs) / 1000).toFixed(3)}s)` : 'No Record Yet';

      box.innerHTML = `
        <div class="keypad-trainer" id="syndicate-hack-trainer">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:1rem;">
            <div>
              <span class="user-badge badge-hacker" style="margin-bottom:0.45rem;">100% FREE INTERACTIVE MINI-GAME</span>
              <h2 style="color:#fff; font-size:1.55rem;">🔐 Syndicate Vault Hack Trainer (15s Biometric &amp; Laser Bypass)</h2>
              <p style="color:var(--text-muted); font-size:0.9rem;">Memorize the glowing biometric frequency nodes and input the sequence before the <strong>15.000s</strong> vault lockdown timer expires.</p>
            </div>
            <div style="text-align:right;">
              <div style="font-size:0.75rem; color:var(--text-muted); text-transform:uppercase;">Fastest Bypass Record</div>
              <div id="keypadBestDisplay" style="font-size:1.25rem; font-weight:900; color:var(--neon-green); font-family:var(--font-mono);">${bestText}</div>
              <div id="keypadRankDisplay" style="font-size:0.8rem; color:var(--neon-cyan); font-weight:800; margin-top:0.2rem;">Rank: Ready</div>
            </div>
          </div>

          <div style="display:flex; justify-content:center; gap:0.75rem; flex-wrap:wrap; margin-top:1rem;">
            <button type="button" class="tab-btn active" id="kpDiffNormal" onclick="GTA6.KeypadTrainer.setDifficulty('normal')">Normal Mode (5 Nodes &bull; 15s)</button>
            <button type="button" class="tab-btn" id="kpDiffHardcore" onclick="GTA6.KeypadTrainer.setDifficulty('hardcore')">💀 Hardcore Mode (7 Nodes + Laser Speed &bull; 15s)</button>
          </div>

          <div style="text-align:center; margin-top:1rem;">
            <div id="keypadTimerBar" style="font-family:var(--font-mono); font-size:1.35rem; color:var(--neon-amber); font-weight:900; margin-bottom:0.35rem;">⏱️ 15.000s REMAINING</div>
            <div id="keypadStatus" style="font-family:var(--font-mono); color:var(--neon-cyan); font-weight:700; min-height:24px;">Select difficulty and click "Start 15s Biometric Bypass"</div>
            <div class="keypad-grid">
              ${[1, 2, 3, 4, 5, 6, 7, 8, 9]
                .map((n) => `<button type="button" class="keypad-btn" id="kp-${n}" onclick="GTA6.KeypadTrainer.press(${n})">${n}</button>`)
                .join('')}
            </div>
            <div style="display:flex; justify-content:center; gap:0.75rem; flex-wrap:wrap; margin-top:0.5rem;">
              <button type="button" class="btn btn-primary" onclick="GTA6.KeypadTrainer.start()">⚡ Start 15s Biometric Bypass</button>
              <button type="button" class="btn btn-secondary" onclick="GTA6.KeypadTrainer.copyDiscordScore()">📋 Copy Score for Discord / LFG</button>
            </div>
            <div style="margin-top:0.9rem; font-size:0.82rem; color:var(--text-muted);">
              🎬 Clipping your squad's heist run for TikTok/Shorts? Auto-cut dead air offline &rarr; <a href="https://getapexlocal.com/partners" target="_blank" rel="noopener" style="color:var(--neon-green); font-weight:800;">Get CutFlow Pro &amp; ClipBounty Studio</a>
            </div>
          </div>
        </div>
      `;
    },

    setDifficulty(mode) {
      if (this.locking || this.active) return;
      this.difficulty = mode === 'hardcore' ? 'hardcore' : 'normal';
      document.getElementById('kpDiffNormal')?.classList.toggle('active', this.difficulty === 'normal');
      document.getElementById('kpDiffHardcore')?.classList.toggle('active', this.difficulty === 'hardcore');
      GTA6.playBeep(this.difficulty === 'hardcore' ? 620 : 440, 'triangle', 0.05);
    },

    start() {
      if (this.locking) return;
      this.locking = true;
      this.active = false;
      this.step = 0;
      const nodeCount = this.difficulty === 'hardcore' ? 7 : 5;
      const flashStepMs = this.difficulty === 'hardcore' ? 310 : 430;
      this.seq = Array.from({ length: nodeCount }, () => Math.floor(Math.random() * 9) + 1);
      clearInterval(this.timerInterval);

      const st = document.getElementById('keypadStatus');
      const tm = document.getElementById('keypadTimerBar');
      if (tm) tm.innerText = '⏱️ 15.000s REMAINING';
      if (st) st.innerText = `📡 TRANSMITTING ${nodeCount}-NODE BIOMETRIC PATTERN (${this.difficulty.toUpperCase()})...`;

      this.seq.forEach((digit, idx) => {
        setTimeout(() => {
          const btn = document.getElementById(`kp-${digit}`);
          if (btn) {
            btn.classList.add('lit');
            GTA6.playBeep(360 + digit * 45, 'triangle', 0.12);
            setTimeout(() => btn.classList.remove('lit'), Math.round(flashStepMs * 0.65));
          }
          if (idx === this.seq.length - 1) {
            setTimeout(() => {
              this.locking = false;
              this.active = true;
              this.startTime = performance.now();
              if (st) st.innerText = `🔓 INPUT ${this.seq.length} NODES BEFORE 15.000s LOCKDOWN!`;
              this.timerInterval = setInterval(() => {
                if (!this.active) return;
                const elapsed = performance.now() - this.startTime;
                const rem = Math.max(0, 15000 - elapsed);
                if (tm) tm.innerText = `⏱️ ${(rem / 1000).toFixed(3)}s REMAINING`;
                if (rem <= 0) {
                  this.active = false;
                  clearInterval(this.timerInterval);
                  GTA6.playBeep(130, 'sawtooth', 0.3);
                  if (st) st.innerHTML = `<span style="color:var(--neon-pink);">🚨 15.000s EXPIRED — VAULT ALARM TRIGGERED! Try again.</span>`;
                }
              }, 35);
            }, 300);
          }
        }, idx * flashStepMs + 220);
      });
    },

    press(digit) {
      if (!this.active || this.locking) return;
      const btn = document.getElementById(`kp-${digit}`);
      const expected = this.seq[this.step];
      if (digit === expected) {
        if (btn) {
          btn.classList.add('hit');
          setTimeout(() => btn.classList.remove('hit'), 180);
        }
        GTA6.playBeep(520 + this.step * 65, 'triangle', 0.06);
        this.step++;

        if (this.step >= this.seq.length) {
          this.active = false;
          clearInterval(this.timerInterval);
          const elapsedMs = Math.round(performance.now() - this.startTime);
          this.lastElapsedMs = elapsedMs;
          const secsStr = (elapsedMs / 1000).toFixed(3) + 's';
          const rank = elapsedMs <= 6000 ? 'Mastermind Ghost Hacker (S-Tier)' : elapsedMs <= 15000 ? 'Mastermind Ghost Hacker' : 'Field Decryptor';
          this.lastRank = rank;

          const prevBest = localStorage.getItem('gta6_keypad_best_ms');
          if (!prevBest || elapsedMs < Number(prevBest)) {
            localStorage.setItem('gta6_keypad_best_ms', String(elapsedMs));
            const bEl = document.getElementById('keypadBestDisplay');
            if (bEl) bEl.innerText = `${elapsedMs.toLocaleString()} ms (${secsStr})`;
          }
          const rkEl = document.getElementById('keypadRankDisplay');
          if (rkEl) rkEl.innerText = `Rank: ${rank}`;
          const st = document.getElementById('keypadStatus');
          if (st) st.innerHTML = `<span style="color:var(--neon-green);">✅ BYPASSED IN ${elapsedMs.toLocaleString()} ms (${secsStr}) &bull; RANK: ${rank.toUpperCase()}!</span>`;
          const p = GTA6.getProfile();
          p.syndicateRep = (Number(p.syndicateRep) || 1240) + (this.difficulty === 'hardcore' ? 300 : 150);
          GTA6.saveProfile(p);
          if (GTA6.MasteryAndStreak && typeof GTA6.MasteryAndStreak.refresh === 'function') {
            GTA6.MasteryAndStreak.refresh();
          }
          GTA6.playSuccess();
          GTA6.showToast(`🔓 Hack Cleared in ${elapsedMs} ms! Rank: ${rank}`);
        }
      } else {
        this.active = false;
        clearInterval(this.timerInterval);
        if (btn) {
          btn.classList.add('miss');
          setTimeout(() => btn.classList.remove('miss'), 350);
        }
        GTA6.playBeep(140, 'sawtooth', 0.25);
        const st = document.getElementById('keypadStatus');
        if (st) st.innerHTML = `<span style="color:var(--neon-pink);">🚨 LASER LOCKDOWN! Wrong node (${digit}). Click Start to retry!</span>`;
      }
    },

    copyDiscordScore() {
      const bestMs = this.lastElapsedMs || Number(localStorage.getItem('gta6_keypad_best_ms') || 0);
      const timeStr = bestMs ? `${bestMs.toLocaleString()} ms (${(bestMs / 1000).toFixed(3)}s)` : 'Sub-15s Practice Ready';
      const rank = this.lastRank || 'Mastermind Ghost Hacker';
      const msg = [
        '🔐 **SYNDICATE VAULT HACK TRAINER — VERIFIED SCORE**',
        `⚡ **Bypass Time:** ${timeStr} (${this.difficulty.toUpperCase()} Mode)`,
        `🏅 **Rank Earned:** ${rank}`,
        '🎯 **Beat my time & find a GTA 6 Heist Squad:** https://www.gta6heistguide.com/vault-hack-trainer',
      ].join('\n');
      GTA6.copyText(msg, 'Discord Hack Score');
    },
  },

  // --------------------------------------------------------------------------
  // MOBILE HAMBURGER MENU INJECTOR
  // --------------------------------------------------------------------------
  initMobileNav() {
    const navContainer = document.querySelector('.nav-container');
    const navLinks = document.querySelector('.nav-links');
    if (!navContainer || !navLinks) return;

    if (!document.getElementById('mobileMenuBtn')) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.id = 'mobileMenuBtn';
      btn.className = 'mobile-menu-btn';
      btn.setAttribute('aria-label', 'Toggle Navigation Menu');
      btn.setAttribute('aria-expanded', 'false');
      btn.innerText = '☰ Menu';
      btn.onclick = () => {
        const isOpen = navLinks.classList.toggle('open');
        btn.innerText = isOpen ? '✕ Close' : '☰ Menu';
        btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        this.playBeep(isOpen ? 540 : 380, 'sine', 0.04);
      };
      const actions = navContainer.querySelector('.nav-actions');
      if (actions) navContainer.insertBefore(btn, actions);
      else navContainer.appendChild(btn);
    }

      navLinks.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => {
          navLinks.classList.remove('open');
          const btn = document.getElementById('mobileMenuBtn');
          if (btn) {
            btn.innerText = '☰ Menu';
            btn.setAttribute('aria-expanded', 'false');
          }
        });
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
    openPayoutReportModal(vaultSlug = 'leonida-reserve', vaultName = 'Leonida State Gold Reserve') {
      let modal = document.getElementById('payoutReportModal');
      if (!modal) {
        const wrap = document.createElement('div');
        wrap.innerHTML = `
          <div class="modal-backdrop" id="payoutReportModal">
            <div class="modal-box" style="max-width:540px; border-color:var(--neon-amber);">
              <button type="button" class="modal-close-btn" onclick="document.getElementById('payoutReportModal').classList.remove('open')">✕</button>
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
      shown: false,

      init() {
        this.injectFreeNavLink();
        if (sessionStorage.getItem('gta6_exit_intent_shown') === '1') return;

        document.addEventListener('mouseout', (e) => {
          if (this.shown) return;
          if (!e.relatedTarget && !e.toElement && e.clientY <= 12) {
            this.trigger();
          }
        });
      },

      injectFreeNavLink() {
        document.querySelectorAll('.nav-links').forEach((ul) => {
          if (ul.querySelector('a[href*="/free"]')) return;
          const li = document.createElement('li');
          const isFreePage = window.location.pathname.startsWith('/free');
          li.innerHTML = `<a href="/free" class="${isFreePage ? 'active' : ''}" style="color: var(--neon-amber); font-weight: 900;">⚡ Free Calculator &amp; Hack Trainer</a>`;
          if (ul.children.length > 1) {
            ul.insertBefore(li, ul.children[1]);
          } else {
            ul.appendChild(li);
          }
        });
      },

      trigger() {
        if (this.shown || sessionStorage.getItem('gta6_exit_intent_shown') === '1') return;
        if (document.querySelector('.modal-backdrop.open')) return;
        this.shown = true;
        sessionStorage.setItem('gta6_exit_intent_shown', '1');

        let modal = document.getElementById('exitIntentModal');
        if (!modal) {
          const wrap = document.createElement('div');
          wrap.innerHTML = `
            <div class="modal-backdrop" id="exitIntentModal">
              <div class="modal-box" style="max-width:620px; border:2px solid var(--neon-cyan); box-shadow:0 0 40px rgba(0,240,255,0.35);">
                <button type="button" class="modal-close-btn" onclick="document.getElementById('exitIntentModal').classList.remove('open')">✕</button>
                <div style="text-align:center; margin-bottom:1.1rem;">
                  <span class="user-badge badge-mastermind" style="margin-bottom:0.5rem;">⚡ BEFORE YOU EXFILTRATE LEONIDA...</span>
                  <h2 style="color:#fff; font-size:1.55rem; line-height:1.25; margin-bottom:0.45rem;">Grab the Free Heist $/Hour Suite &amp; VIP Vault Blueprints</h2>
                  <p style="color:var(--text-muted); font-size:0.9rem;">
                    Test your crew split in our 100% free browser utility suite, practice the 15-second Biometric Keypad Hack, or download the offline VIP Vault Cheat Sheet.
                  </p>
                </div>
                <div style="display:grid; gap:0.65rem; margin-bottom:1.1rem;">
                  <a href="/free" class="btn btn-primary" style="width:100%; padding:0.75rem 1rem; font-size:0.9rem;">⚡ Launch Free Heist $/Hour &amp; 15s Vault Hack Trainer (/free) &rarr;</a>
                  <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.65rem;">
                    <button type="button" class="btn btn-secondary" style="padding:0.6rem 0.8rem; font-size:0.8rem;" onclick="document.getElementById('exitIntentModal').classList.remove('open'); GTA6.Auth.downloadVipPack();">📥 Download VIP Vault Cheat Sheet (.TXT)</button>
                    <button type="button" class="btn btn-amber" style="padding:0.6rem 0.8rem; font-size:0.8rem;" onclick="document.getElementById('exitIntentModal').classList.remove('open'); GTA6.Auth.openModal();">🎁 Unlock Founder VIP +2,500 Rep</button>
                  </div>
                </div>
                <div style="background:rgba(255,255,255,0.03); border:1px solid var(--border-card); border-radius:8px; padding:0.9rem; font-size:0.82rem;">
                  <div style="color:var(--neon-cyan); font-weight:800; margin-bottom:0.45rem; text-transform:uppercase; letter-spacing:0.8px;">Verified Launch Gear &amp; Creator Deals:</div>
                  <div style="display:flex; gap:0.5rem; flex-wrap:wrap; margin-bottom:0.55rem;">
                    <a href="https://nordvpn.com/" target="_blank" rel="nofollow noopener" class="btn btn-secondary" style="padding:0.35rem 0.7rem; font-size:0.74rem;">🛡️ NordVPN DDoS Shield</a>
                    <a href="https://www.amazon.com/s?k=Samsung+990+PRO+2TB+PCIe+4.0+M.2&tag=gta6heistguid-20" target="_blank" rel="nofollow noopener" class="btn btn-amber" style="padding:0.35rem 0.7rem; font-size:0.74rem;">⚡ 990 PRO Gen4 SSD</a>
                    <a href="https://www.g2a.com/n/reflink-4094b9aab5" target="_blank" rel="nofollow noopener" class="btn btn-primary" style="padding:0.35rem 0.7rem; font-size:0.74rem;">🔑 G2A Keys</a>
                    <a href="https://www.eneba.com/store/all?q=gta&af_id=gta6heistguide" target="_blank" rel="nofollow noopener" class="btn btn-secondary" style="padding:0.35rem 0.7rem; font-size:0.74rem;">🎮 Eneba Deals</a>
                  </div>
                  <div style="color:var(--text-muted); border-top:1px solid var(--border-card); padding-top:0.45rem;">
                    🎬 <strong style="color:#fff;">Recording GTA 6 Clips?</strong> Auto-cut dead air &amp; export 9:16 vertical shorts offline &rarr; <a href="https://getapexlocal.com" target="_blank" rel="noopener" style="color:var(--neon-green); font-weight:800;">CutFlow Pro &amp; ClipBounty Studio</a> (<a href="https://whop.com/apexlocallabs/products/" target="_blank" rel="noopener" style="color:var(--neon-cyan); font-weight:700;">Whop Store</a>)
                  </div>
                </div>
              </div>
            </div>
          `;
          document.body.appendChild(wrap);
          modal = document.getElementById('exitIntentModal');
        }
        modal.classList.add('open');
        GTA6.playBeep(540, 'triangle', 0.06);
      },
    },
  };

  document.addEventListener('DOMContentLoaded', () => {
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
    GTA6.KeypadTrainer.init();
    GTA6.PromoVideo.init();
    GTA6.CompanionHUD.init();
    GTA6.MasteryAndStreak.init();
  });
