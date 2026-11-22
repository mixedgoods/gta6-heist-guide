// ==========================================================================
// GTA6HEISTGUIDE.COM — /gta-6-settings/ INTERACTIVE ENGINE (PASS 6)
// Powers:
//   1. Platform-Specific Storage Calculator (PS5/PS5 Pro vs. Xbox Series X|S)
//   2. Console Settings & HDR Checklist (PS5 & Xbox, synced to gta6hg_progress_v1)
//   3. Capture Card Selector (3-layer FPS reality + honest latency/artifact trade-offs)
//   4. PC Specifications Saver (local-only profile; official PC specs unannounced)
//   5. Amazon-Compliant Hardware Comparison Filter (ZERO hardcoded prices)
// ==========================================================================
(function (global) {
  'use strict';

  var GTA6_OFFICIAL_MAX_GB = 212; // Rockstar official: "up to 212 GB of available storage depending on device"

  function escHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function getProgress() {
    return global.GTA6Progress || null;
  }

  // ------------------------------------------------------------------------
  // 1. PLATFORM-SPECIFIC STORAGE CALCULATOR
  // ------------------------------------------------------------------------
  var PS5_MODELS = {
    'ps5-og': { name: 'PS5 Launch / Standard / Digital (825 GB raw)', usableGb: 667 },
    'ps5-slim': { name: 'PS5 Slim (1 TB raw)', usableGb: 848 },
    'ps5-pro': { name: 'PS5 Pro (2 TB raw)', usableGb: 1890 }
  };

  var PS5_M2_OPTIONS = {
    'none': { name: 'No M.2 SSD Installed (Internal Only)', usableGb: 0 },
    '1tb': { name: '1 TB PCIe Gen4 M.2 NVMe (~931 GB usable)', usableGb: 931 },
    '2tb': { name: '2 TB PCIe Gen4 M.2 NVMe (~1,862 GB usable)', usableGb: 1862 },
    '4tb': { name: '4 TB PCIe Gen4 M.2 NVMe (~3,725 GB usable)', usableGb: 3725 }
  };

  var XBOX_MODELS = {
    'xss-512': { name: 'Xbox Series S 512 GB', usableGb: 364 },
    'xss-1tb': { name: 'Xbox Series S 1 TB (Carbon Black / Robot White)', usableGb: 802 },
    'xsx-1tb': { name: 'Xbox Series X 1 TB', usableGb: 802 },
    'xsx-2tb': { name: 'Xbox Series X 2 TB (Galaxy Black Special Edition)', usableGb: 1790 }
  };

  var XBOX_TARGETS = {
    'internal': { name: 'Internal Custom NVMe SSD (Runs GTA 6 Natively)', canPlay: true, usableCap: null },
    'card-512': { name: 'Official 512 GB Storage Expansion Card (~460 GB usable)', canPlay: true, usableCap: 460 },
    'card-1tb': { name: 'Official 1 TB Storage Expansion Card (~920 GB usable)', canPlay: true, usableCap: 920 },
    'card-2tb': { name: 'Official 2 TB Storage Expansion Card (~1,840 GB usable)', canPlay: true, usableCap: 1840 },
    'usb-cold': { name: 'External USB 3.1+ HDD / USB SSD (COLD STORAGE ONLY)', canPlay: false, usableCap: null }
  };

  var storageState = {
    platform: 'ps5',
    ps5Model: 'ps5-slim',
    ps5M2: 'none',
    ps5FreeGb: 260,
    ps5BufferGb: 30,
    xboxModel: 'xsx-1tb',
    xboxTarget: 'internal',
    xboxFreeGb: 220,
    xboxBufferGb: 30
  };

  function loadStorageState() {
    var gp = getProgress();
    if (!gp) return;
    var saved = gp.getToolState('settingsStorage');
    if (saved && typeof saved === 'object') {
      Object.assign(storageState, saved);
    }
  }

  function saveStorageState() {
    var gp = getProgress();
    if (gp) gp.setToolState('settingsStorage', storageState, true);
  }

  function renderStorageCalculator() {
    var isPs5 = storageState.platform === 'ps5';
    document.querySelectorAll('[data-storage-platform]').forEach(function (btn) {
      var active = btn.getAttribute('data-storage-platform') === storageState.platform;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-selected', active ? 'true' : 'false');
    });

    var ps5Panel = document.getElementById('storageFlowPs5');
    var xboxPanel = document.getElementById('storageFlowXbox');
    if (ps5Panel) ps5Panel.style.display = isPs5 ? 'block' : 'none';
    if (xboxPanel) xboxPanel.style.display = isPs5 ? 'none' : 'block';

    // Hydrate form inputs
    var el;
    if ((el = document.getElementById('ps5ModelSelect'))) el.value = storageState.ps5Model;
    if ((el = document.getElementById('ps5M2Select'))) el.value = storageState.ps5M2;
    if ((el = document.getElementById('ps5FreeInput'))) el.value = storageState.ps5FreeGb;
    if ((el = document.getElementById('ps5BufferSelect'))) el.value = String(storageState.ps5BufferGb);
    if ((el = document.getElementById('xboxModelSelect'))) el.value = storageState.xboxModel;
    if ((el = document.getElementById('xboxTargetSelect'))) el.value = storageState.xboxTarget;
    if ((el = document.getElementById('xboxFreeInput'))) el.value = storageState.xboxFreeGb;
    if ((el = document.getElementById('xboxBufferSelect'))) el.value = String(storageState.xboxBufferGb);

    var outEl = document.getElementById('storageCalcOutput');
    if (!outEl) return;

    if (isPs5) {
      var model = PS5_MODELS[storageState.ps5Model] || PS5_MODELS['ps5-slim'];
      var m2 = PS5_M2_OPTIONS[storageState.ps5M2] || PS5_M2_OPTIONS['none'];
      var freeGb = Math.max(0, Number(storageState.ps5FreeGb) || 0);
      var bufferGb = Math.max(0, Number(storageState.ps5BufferGb) || 0);
      var requiredGb = GTA6_OFFICIAL_MAX_GB + bufferGb;
      var remainingAfter = freeGb - requiredGb;
      var totalPool = model.usableGb + m2.usableGb;
      var gtaSharePct = Math.min(100, Math.round((GTA6_OFFICIAL_MAX_GB / Math.max(1, model.usableGb)) * 100));

      var statusBadge, statusColor, headline, advice;
      if (freeGb >= requiredGb) {
        statusBadge = 'READY TO INSTALL';
        statusColor = 'var(--neon-green)';
        headline = 'You have ' + Math.round(remainingAfter) + ' GB free headroom left after GTA 6 + buffer.';
        advice = m2.usableGb > 0
          ? 'Your PS5 + ' + m2.name + ' (' + totalPool + ' GB combined usable space) easily accommodates Rockstar\'s up to 212 GB requirement plus future updates.'
          : 'Your PS5 internal storage fits GTA 6 now, though GTA 6 alone occupies ~' + gtaSharePct + '% of your ' + model.usableGb + ' GB usable internal drive. If you keep multiple large games installed, a PCIe Gen4 x4 M.2 NVMe SSD (5,500+ MB/s with heatsink) adds playable capacity.';
      } else if (freeGb >= GTA6_OFFICIAL_MAX_GB) {
        statusBadge = 'TIGHT FIT — CLEAR BUFFER SPACE';
        statusColor = 'var(--neon-yellow)';
        headline = 'Fits the up to 212 GB base install, but you are ' + Math.round(requiredGb - freeGb) + ' GB short of your ' + bufferGb + ' GB patch/capture buffer.';
        advice = 'PS5 requires extra free staging space when copying patches and saving 4K clips. Free up at least ' + Math.round(requiredGb - freeGb) + ' GB or install a PS5-compatible PCIe Gen4 x4 M.2 SSD with heatsink.';
      } else {
        var needed = Math.round(GTA6_OFFICIAL_MAX_GB - freeGb);
        var neededWithBuf = Math.round(requiredGb - freeGb);
        statusBadge = 'INSUFFICIENT FREE SPACE';
        statusColor = 'var(--neon-pink)';
        headline = 'You need at least ' + needed + ' GB more free space for GTA 6 (or ' + neededWithBuf + ' GB including your ' + bufferGb + ' GB patch buffer).';
        advice = 'Delete/archive older games, move PS4 titles to an external USB drive, or add an internal PCIe Gen4 x4 M.2 NVMe SSD (5,500+ MB/s read speed + integrated heatsink) inside the PS5 expansion bay. Do NOT buy an Xbox Storage Expansion Card—it will not fit PS5.';
      }

      var barPct = Math.min(100, Math.round((Math.min(freeGb, requiredGb) / requiredGb) * 100));
      outEl.innerHTML =
        '<div class="calc-verdict-head">' +
          '<span class="verify-badge" style="background:rgba(0,0,0,0.5); border:1px solid ' + statusColor + '; color:' + statusColor + ';">' + statusBadge + '</span>' +
          '<span style="font-family:var(--font-mono); font-size:0.75rem; color:#94a3b8;">PS5 / PS5 Pro Flow &bull; Rockstar Official Max: up to 212 GB</span>' +
        '</div>' +
        '<h3 style="color:#fff; font-size:1.05rem; margin:0.45rem 0 0.35rem;">' + escHtml(headline) + '</h3>' +
        '<div class="storage-meter-track"><div class="storage-meter-fill" style="width:' + barPct + '%; background:' + statusColor + ';"></div></div>' +
        '<div class="storage-kpi-row">' +
          '<div><span>GTA 6 Official Max</span><strong>Up to 212 GB</strong></div>' +
          '<div><span>Your Buffer</span><strong>+' + bufferGb + ' GB</strong></div>' +
          '<div><span>Total Target</span><strong>' + requiredGb + ' GB</strong></div>' +
          '<div><span>Your Free Space</span><strong style="color:' + statusColor + ';">' + freeGb + ' GB</strong></div>' +
        '</div>' +
        '<p style="color:#cbd5e1; font-size:0.84rem; line-height:1.55; margin:0.65rem 0 0;">' + escHtml(advice) + '</p>' +
        '<div style="margin-top:0.7rem; display:flex; gap:0.65rem; flex-wrap:wrap;">' +
          '<a href="#guide-storage" class="btn btn-secondary" style="padding:0.4rem 0.85rem; font-size:0.78rem;">Read PS5 M.2 Specs &amp; Install Steps</a>' +
          '<a href="#hardware-comparison" onclick="window.GTA6SettingsHub && window.GTA6SettingsHub.filterHardware(\'ps5-ssd\')" class="btn btn-primary" style="padding:0.4rem 0.85rem; font-size:0.78rem;">Compare PS5 M.2 SSDs &rarr;</a>' +
        '</div>';
    } else {
      var xModel = XBOX_MODELS[storageState.xboxModel] || XBOX_MODELS['xsx-1tb'];
      var xTarget = XBOX_TARGETS[storageState.xboxTarget] || XBOX_TARGETS['internal'];
      var xFreeGb = Math.max(0, Number(storageState.xboxFreeGb) || 0);
      var xBufGb = Math.max(0, Number(storageState.xboxBufferGb) || 0);
      var xReqGb = GTA6_OFFICIAL_MAX_GB + xBufGb;
      var xRem = xFreeGb - xReqGb;
      var xPctOfInternal = Math.min(100, Math.round((GTA6_OFFICIAL_MAX_GB / Math.max(1, xModel.usableGb)) * 100));

      var xBadge, xColor, xHead, xAdv;
      if (!xTarget.canPlay) {
        xBadge = 'COLD STORAGE ONLY — CANNOT LAUNCH GTA 6';
        xColor = 'var(--neon-pink)';
        xHead = 'External USB drives CANNOT play Xbox Series X|S Optimized games like GTA 6.';
        xAdv = (xFreeGb >= GTA6_OFFICIAL_MAX_GB
          ? 'Your USB drive has enough room (' + xFreeGb + ' GB free) to ARCHIVE GTA 6 (up to 212 GB) so you avoid re-downloading it, but you MUST copy it back to your Internal SSD or an Official Seagate / WD_BLACK C50 Storage Expansion Card before you can launch the game.'
          : 'Not only can external USB drives not launch GTA 6 natively, your USB drive also needs ' + Math.round(GTA6_OFFICIAL_MAX_GB - xFreeGb) + ' GB more space even for cold archiving. To play directly from expanded storage, use an Official Storage Expansion Card (Seagate or WD_BLACK C50).');
      } else if (xFreeGb >= xReqGb) {
        xBadge = 'PLAYABLE & READY TO INSTALL';
        xColor = 'var(--neon-green)';
        xHead = 'You have ' + Math.round(xRem) + ' GB free headroom left on playable Velocity Architecture storage.';
        xAdv = xModel.usableGb <= 400 && storageState.xboxTarget === 'internal'
          ? 'Note for Xbox Series S (512 GB): GTA 6 (up to 212 GB) consumes roughly ~' + xPctOfInternal + '% of your ~364 GB usable internal SSD. An Official Storage Expansion Card (Seagate or WD_BLACK C50) is strongly recommended if you play multiple modern titles.'
          : 'Selected storage (' + xTarget.name + ') supports full native Xbox Series X|S gameplay and Quick Resume. Remember: PS5 M.2 NVMe SSDs are NOT compatible with Xbox.';
      } else if (xFreeGb >= GTA6_OFFICIAL_MAX_GB) {
        xBadge = 'TIGHT FIT — LOW PATCH HEADROOM';
        xColor = 'var(--neon-yellow)';
        xHead = 'Fits Rockstar\'s up to 212 GB install, but ' + Math.round(xReqGb - xFreeGb) + ' GB shy of your ' + xBufGb + ' GB update buffer.';
        xAdv = 'Archive older titles onto an inexpensive USB drive for cold storage, or plug an Official Xbox Storage Expansion Card (Seagate or WD_BLACK C50) into the rear slot for instant playable space.';
      } else {
        var xNeed = Math.round(GTA6_OFFICIAL_MAX_GB - xFreeGb);
        var xNeedBuf = Math.round(xReqGb - xFreeGb);
        xBadge = 'INSUFFICIENT PLAYABLE STORAGE';
        xColor = 'var(--neon-pink)';
        xHead = 'You need ' + xNeed + ' GB more free playable space for GTA 6 (' + xNeedBuf + ' GB with your ' + xBufGb + ' GB buffer).';
        xAdv = 'Free up internal space by moving non-active games to a USB drive (cold storage), or expand playable capacity immediately with an Official Seagate or WD_BLACK C50 Storage Expansion Card. Standard PCIe M.2 SSDs for PS5 do NOT work in Xbox consoles.';
      }

      var xBarPct = xTarget.canPlay ? Math.min(100, Math.round((Math.min(xFreeGb, xReqGb) / xReqGb) * 100)) : 100;
      outEl.innerHTML =
        '<div class="calc-verdict-head">' +
          '<span class="verify-badge" style="background:rgba(0,0,0,0.5); border:1px solid ' + xColor + '; color:' + xColor + ';">' + xBadge + '</span>' +
          '<span style="font-family:var(--font-mono); font-size:0.75rem; color:#94a3b8;">Xbox Series X|S Flow &bull; Rockstar Official Max: up to 212 GB</span>' +
        '</div>' +
        '<h3 style="color:#fff; font-size:1.05rem; margin:0.45rem 0 0.35rem;">' + escHtml(xHead) + '</h3>' +
        '<div class="storage-meter-track"><div class="storage-meter-fill" style="width:' + xBarPct + '%; background:' + xColor + ';"></div></div>' +
        '<div class="storage-kpi-row">' +
          '<div><span>GTA 6 Official Max</span><strong>Up to 212 GB</strong></div>' +
          '<div><span>Target Playable?</span><strong style="color:' + (xTarget.canPlay ? 'var(--neon-green)' : 'var(--neon-pink)') + ';">' + (xTarget.canPlay ? 'Yes (Native)' : 'No (Cold Archive)') + '</strong></div>' +
          '<div><span>Total Target</span><strong>' + xReqGb + ' GB</strong></div>' +
          '<div><span>Your Free Space</span><strong style="color:' + xColor + ';">' + xFreeGb + ' GB</strong></div>' +
        '</div>' +
        '<p style="color:#cbd5e1; font-size:0.84rem; line-height:1.55; margin:0.65rem 0 0;">' + escHtml(xAdv) + '</p>' +
        '<div style="margin-top:0.7rem; display:flex; gap:0.65rem; flex-wrap:wrap;">' +
          '<a href="#guide-storage" class="btn btn-secondary" style="padding:0.4rem 0.85rem; font-size:0.78rem;">Read Xbox Expansion vs. USB Rules</a>' +
          '<a href="#hardware-comparison" onclick="window.GTA6SettingsHub && window.GTA6SettingsHub.filterHardware(\'xbox-card\')" class="btn btn-primary" style="padding:0.4rem 0.85rem; font-size:0.78rem;">Compare Xbox Expansion Cards &rarr;</a>' +
        '</div>';
    }
  }

  // ------------------------------------------------------------------------
  // 2. CONSOLE SETTINGS & HDR CHECKLIST (SYNCED TO gta6-progress-store.js)
  // ------------------------------------------------------------------------
  var CHECKLIST_ITEMS = {
    ps5: [
      { id: 'settings:ps5:hdmi21', title: 'Use Ultra High Speed HDMI 2.1 Cable & Port', desc: 'Connect PS5 / PS5 Pro directly to an HDMI 2.1 input on your TV/monitor and enable Enhanced Format / HDMI Deep Color on that port.' },
      { id: 'settings:ps5:gamemode', title: 'Enable TV Game Mode & PS5 ALLM (Automatic)', desc: 'Settings > Screen and Video > Video Output > ALLM: Automatic, and verify TV is locked into Game Mode to minimize 30 FPS input latency.' },
      { id: 'settings:ps5:motion-off', title: 'Turn OFF TV Motion Smoothing & AI Enhancements', desc: 'Disable TruMotion / Motionflow / Auto Motion Plus, Noise Reduction, and AI Sharpness on your TV to prevent heavy buffering lag and UI halo artifacts.' },
      { id: 'settings:ps5:hgig-hdr', title: 'Set TV Tone Mapping to HGiG & Run PS5 Adjust HDR', desc: 'Switch TV HDR Tone Mapping to HGiG (Dynamic Tone Mapping Off), then complete Settings > Screen and Video > Video Output > Adjust HDR.' },
      { id: 'settings:ps5:120hz-vrr', title: 'Set 120 Hz Output & VRR to Automatic', desc: 'Settings > Screen and Video > Video Output > 120 Hz Output: Automatic and VRR: Automatic (on supported HDMI 2.1 displays).' },
      { id: 'settings:ps5:storage-212', title: 'Verify Up to 212 GB Free on Internal SSD or PCIe Gen4 M.2', desc: 'Confirm free capacity + patch headroom on internal storage or a 5,500+ MB/s PCIe Gen4 x4 M.2 SSD with heatsink.' },
      { id: 'settings:ps5:controller', title: 'Configure DualSense Trigger Effects & Wired/Wireless Mode', desc: 'Settings > Accessories > Controller (General): choose preferred Trigger Effect & Vibration Intensity (and configure DualSense Edge hardware profiles if owned).' },
      { id: 'settings:ps5:tempest-3d', title: 'Calibrate Tempest 3D Audio Profile', desc: 'Settings > Sound > 3D Audio for Headphones (or TV Speakers) to select your clearest directional HRTF profile for Vice City audio cues.' },
      { id: 'settings:ps5:ingame-display', title: 'Verify In-Game Display, Brightness & Subtitles/Audio Mix', desc: 'After launching GTA 6, adjust only the verified in-game brightness/HDR, subtitle size, and audio output mix options to match your room.' },
      { id: 'settings:ps5:hdcp-capture', title: 'Disable HDCP If Using an External Capture Card', desc: 'Optional for creators: Settings > System > HDMI > Enable HDCP: OFF so HDMI capture cards receive an unencrypted gameplay signal.' }
    ],
    xbox: [
      { id: 'settings:xbox:hdmi21', title: 'Use Ultra High Speed HDMI 2.1 Cable & Port', desc: 'Connect Xbox Series X|S directly to an HDMI 2.1 input on your TV/monitor and enable Enhanced HDMI / Input Signal Plus on that port.' },
      { id: 'settings:xbox:gamemode', title: 'Enable TV Game Mode & Xbox ALLM', desc: 'Settings > General > TV & display options > Video modes > Allow auto low-latency mode (ALLM) ON and confirm TV Game Mode is active.' },
      { id: 'settings:xbox:motion-off', title: 'Turn OFF TV Motion Smoothing & AI Processing', desc: 'Disable TruMotion / Auto Motion Plus / Motionflow and AI Picture Enhancers so frame interpolation does not inflate controller latency.' },
      { id: 'settings:xbox:hgig-hdr', title: 'Set TV to HGiG & Run Xbox "Calibrate HDR for Games"', desc: 'Enable HGiG on your TV, then run Settings > General > TV & display options > Calibrate HDR for games to prevent clipped Vice City highlights.' },
      { id: 'settings:xbox:120hz-vrr', title: 'Enable 120 Hz Refresh & Allow Variable Refresh Rate (VRR)', desc: 'Under TV & display options, set Refresh rate to 120 Hz (if supported) and check Allow variable refresh rate for smooth frame presentation.' },
      { id: 'settings:xbox:storage-212', title: 'Verify Up to 212 GB Free on Internal SSD or Official Expansion Card', desc: 'Ensure GTA 6 installs on the Internal SSD or an Official Seagate / WD_BLACK C50 Expansion Card (NOT an external USB drive, which is cold storage only).' },
      { id: 'settings:xbox:controller', title: 'Update Firmware & Configure Xbox Accessories App', desc: 'Settings > Devices & connections > Controllers & headsets: update controller firmware and configure any Elite Series 2 hardware curves/paddles.' },
      { id: 'settings:xbox:spatial-audio', title: 'Select Spatial Audio Format (Windows Sonic / Atmos / DTS)', desc: 'Settings > General > Volume & audio output > Headset format for clear directional positioning in busy urban soundscapes.' },
      { id: 'settings:xbox:ingame-display', title: 'Verify In-Game Display, Brightness & Subtitles/Audio Mix', desc: 'Inside GTA 6, dial in verified in-game brightness/HDR, audio balance, and accessibility/subtitle settings to match your display.' },
      { id: 'settings:xbox:capture-audio', title: 'Configure Party Chat Audio Routing for Capture (Creators)', desc: 'Optional for creators: Settings > General > Volume & audio output > Additional options > Party chat output: Headset & speakers if capturing party chat via HDMI.' }
    ]
  };

  var checklistPlatform = 'ps5';

  function loadChecklistState() {
    var gp = getProgress();
    if (!gp) return;
    var saved = gp.getToolState('settingsChecklist');
    if (saved && (saved.platform === 'ps5' || saved.platform === 'xbox')) {
      checklistPlatform = saved.platform;
    }
  }

  function renderChecklist() {
    var gp = getProgress();
    document.querySelectorAll('[data-checklist-platform]').forEach(function (btn) {
      var active = btn.getAttribute('data-checklist-platform') === checklistPlatform;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-selected', active ? 'true' : 'false');
    });

    var items = CHECKLIST_ITEMS[checklistPlatform] || CHECKLIST_ITEMS.ps5;
    var doneCount = 0;
    items.forEach(function (item) {
      if (gp && gp.isDone(item.id)) doneCount++;
    });

    var pct = Math.round((doneCount / items.length) * 100);
    var countEl = document.getElementById('checklistCountBadge');
    var barEl = document.getElementById('checklistProgressFill');
    if (countEl) {
      countEl.textContent = (checklistPlatform === 'ps5' ? 'PS5 / PS5 Pro: ' : 'Xbox Series X|S: ') + doneCount + ' / ' + items.length + ' Complete (' + pct + '%)';
    }
    if (barEl) barEl.style.width = pct + '%';

    var listEl = document.getElementById('settingsChecklistList');
    if (!listEl) return;

    listEl.innerHTML = items.map(function (item, idx) {
      var checked = gp ? gp.isDone(item.id) : false;
      return (
        '<label class="settings-check-row' + (checked ? ' is-checked' : '') + '">' +
          '<input type="checkbox" data-settings-check="' + escHtml(item.id) + '"' + (checked ? ' checked' : '') + '>' +
          '<div class="settings-check-body">' +
            '<div class="settings-check-title"><span class="settings-check-num">' + String(idx + 1).padStart(2, '0') + '</span> ' + escHtml(item.title) + '</div>' +
            '<div class="settings-check-desc">' + escHtml(item.desc) + '</div>' +
          '</div>' +
        '</label>'
      );
    }).join('');

    listEl.querySelectorAll('input[data-settings-check]').forEach(function (cb) {
      cb.addEventListener('change', function () {
        var progress = getProgress();
        if (progress) {
          progress.setDone(cb.getAttribute('data-settings-check'), cb.checked);
        }
        renderChecklist();
      });
    });
  }

  // ------------------------------------------------------------------------
  // 3. CAPTURE CARD SELECTOR
  // ------------------------------------------------------------------------
  var captureState = {
    console: 'ps5-pro',
    goal: '4k60-record',
    pcInterface: 'usb32'
  };

  function loadCaptureState() {
    var gp = getProgress();
    if (!gp) return;
    var saved = gp.getToolState('settingsCapture');
    if (saved && typeof saved === 'object') {
      Object.assign(captureState, saved);
    }
  }

  function saveCaptureState() {
    var gp = getProgress();
    if (gp) gp.setToolState('settingsCapture', captureState, true);
  }

  function renderCaptureSelector() {
    var cEl = document.getElementById('capConsoleSelect');
    var gEl = document.getElementById('capGoalSelect');
    var iEl = document.getElementById('capInterfaceSelect');
    if (cEl) cEl.value = captureState.console;
    if (gEl) gEl.value = captureState.goal;
    if (iEl) iEl.value = captureState.pcInterface;

    var outEl = document.getElementById('captureSelectorOutput');
    if (!outEl) return;

    var isPs5 = captureState.console === 'ps5' || captureState.console === 'ps5-pro';
    var platformNote = isPs5
      ? 'PS5 Reminder: Turn OFF HDCP (Settings > System > HDMI > Enable HDCP: Off) before connecting an HDMI capture card. If using a wired headset, add a Chat Link Pro cable to capture party chat.'
      : 'Xbox Reminder: Xbox disables HDCP automatically during games (turn off streaming video apps first). Set Party Chat output to "Headset & speakers" to capture voice chat over HDMI.';

    var rec = {
      primary: '',
      alt: '',
      nativeFps: '30 FPS Target (Console Game Engine)',
      captureFeed: '',
      displayOut: '',
      latencyLevel: '',
      latencyColor: 'var(--neon-green)',
      artifactsNote: '',
      summary: ''
    };

    if (captureState.pcInterface === 'none') {
      rec.primary = isPs5 ? 'PS5 Built-In Create Button Capture (No Card Needed)' : 'Xbox Built-In Capture + External NTFS USB 3.0 Drive';
      rec.alt = 'Upgrade later to Elgato HD60 X or 4K X when adding a streaming PC';
      rec.captureFeed = 'Internal Console Encoder (No External HDMI Hop)';
      rec.displayOut = 'Native Console Output to TV/Monitor (30 FPS Target)';
      rec.latencyLevel = 'Lowest Possible (Zero Capture Hop)';
      rec.latencyColor = 'var(--neon-green)';
      rec.artifactsNote = 'None from interpolation. Standard console H.264/HEVC video compression applies to saved clips.';
      rec.summary = 'Best zero-cost, zero-added-latency workflow if you only want gameplay clips or direct console-to-Twitch/YouTube streams without PC overlays or frame generation.';
    } else if (captureState.goal === 'framegen') {
      if (captureState.pcInterface === 'pcie') {
        rec.primary = 'Elgato 4K Pro (Internal PCIe x4 — HDMI 2.1)';
        rec.alt = 'Requires Windows PC + Dedicated GPU (RTX 3060 / RX 6700 XT+ class recommended for real-time interpolation)';
      } else {
        rec.primary = 'Elgato 4K X or AVerMedia Live Gamer ULTRA 2.1 (USB 3.2 Gen 2 10 Gbps)';
        rec.alt = 'Must connect to a true 10 Gbps USB 3.2 Gen 2 port with uncompressed NV12/YUY2 preview';
      }
      rec.captureFeed = '60 Hz / 120 Hz HDMI Video Feed Carrying 30 Unique Game Frames/Sec';
      rec.displayOut = 'PC-Generated 60 FPS (2x) or 120 FPS (4x) Interpolated Preview on PC Monitor';
      rec.latencyLevel = 'HIGH (+25 to +70+ ms Added Delay)';
      rec.latencyColor = 'var(--neon-pink)';
      rec.artifactsNote = 'Optical-flow frame generation does NOT make GTA 6 run natively at 60 FPS. Expect noticeable input lag (must buffer at least one real frame), plus HUD/minimap shimmering, subtitle/crosshair distortion, and ghosting around fast vehicles and neon signs.';
      rec.summary = 'IMPORTANT REALITY CHECK: Capture-based PC frame generation is strictly visual display interpolation—NEVER a native 60 FPS unlock. Use an internal PCIe card (Elgato 4K Pro) or 10 Gbps USB 3.2 card (Elgato 4K X / AVerMedia GC553G2) to keep decode overhead as low as possible, and switch back to direct HDMI passthrough for gunfights or precision driving.';
    } else if (captureState.goal === '1080p60-stream') {
      rec.primary = captureState.pcInterface === 'pcie' ? 'Elgato 4K Pro (Internal PCIe x4)' : 'Elgato HD60 X (External USB 3.0) or Elgato 4K X';
      rec.alt = 'AVerMedia Live Gamer ULTRA 2.1 if you want built-in dual 3.5mm headset/party-chat jacks';
      rec.captureFeed = '1080p60 Uncompressed Capture into OBS Studio';
      rec.displayOut = 'Zero-Latency HDMI Passthrough to Your Gaming TV/Monitor (Native 30 FPS Game)';
      rec.latencyLevel = 'Zero Added Gaming Latency (Via HDMI Passthrough)';
      rec.latencyColor = 'var(--neon-green)';
      rec.artifactsNote = 'No interpolation artifacts. Keep OBS output at 1080p60 CBR 6,000–8,000 kbps (Twitch) so UI overlays, facecam, and transitions stay silky smooth while your game runs natively on your TV/monitor.';
      rec.summary = 'Play on your TV/monitor via the card\'s zero-latency HDMI passthrough while your PC encodes a clean 1080p60 Twitch/Kick stream in OBS.';
    } else if (captureState.goal === '4k120-passthrough') {
      rec.primary = captureState.pcInterface === 'pcie' ? 'Elgato 4K Pro (Internal PCIe x4 — HDMI 2.1)' : 'Elgato 4K X or AVerMedia Live Gamer ULTRA 2.1 (HDMI 2.1 USB 3.2)';
      rec.alt = 'Requires Ultra High Speed HDMI 2.1 cables on BOTH Input and Passthrough Output';
      rec.captureFeed = 'Up to 4K60 HDR10 Capture (USB 3.2 Gen 2 / PCIe)';
      rec.displayOut = 'Full 4K120 VRR + HDR10 Zero-Latency Passthrough to HDMI 2.1 TV/Monitor';
      rec.latencyLevel = 'Zero Added Gaming Latency (HDMI 2.1 Passthrough)';
      rec.latencyColor = 'var(--neon-green)';
      rec.artifactsNote = 'Preserves full 120Hz VRR + HGiG HDR10 passthrough to your OLED TV/monitor with zero interpolation artifacts. Older HDMI 2.0 cards (like HD60 X) cap 4K passthrough at 60Hz.';
      rec.summary = 'Essential if you own an HDMI 2.1 4K120 TV or monitor and do not want your capture card downgrading your console\'s 120Hz VRR output container.';
    } else {
      // 4k60-record
      rec.primary = captureState.pcInterface === 'pcie' ? 'Elgato 4K Pro (Internal PCIe x4 — True 4K60 HDR10)' : 'Elgato 4K X (USB 3.2 Gen 2 — 4K60 HDR10 Capture)';
      rec.alt = 'AVerMedia Live Gamer ULTRA 2.1 (GC553G2) for external 4K60 capture + built-in party chat mixer';
      rec.captureFeed = '4K60 HDR10 / SDR Master Recording (OBS NVENC HEVC/AV1 CQP 18)';
      rec.displayOut = 'Zero-Latency 4K120/4K60 VRR HDMI Passthrough to Your Display';
      rec.latencyLevel = 'Zero Added Gaming Latency (Via HDMI Passthrough)';
      rec.latencyColor = 'var(--neon-green)';
      rec.artifactsNote = 'No interpolation artifacts. Recording in 4K60 HEVC/AV1 triggers YouTube\'s higher-bitrate VP9/AV1 transcode for sharper Vice City foliage and night neon clarity.';
      rec.summary = 'Best setup for crisp 4K YouTube walkthroughs, Boss/Heist guides, and offline 9:16 vertical short clipping without adding any play latency.';
    }

    outEl.innerHTML =
      '<div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem; margin-bottom:0.55rem;">' +
        '<span class="verify-badge verify-confirmed">MATCHED CAPTURE WORKFLOW</span>' +
        '<span class="verify-badge" style="background:rgba(0,0,0,0.45); border:1px solid ' + rec.latencyColor + '; color:' + rec.latencyColor + ';">LATENCY: ' + escHtml(rec.latencyLevel) + '</span>' +
      '</div>' +
      '<h3 style="color:#fff; font-size:1.1rem; margin:0 0 0.25rem;">Recommended Hardware: <span style="color:var(--neon-cyan);">' + escHtml(rec.primary) + '</span></h3>' +
      '<div style="font-size:0.8rem; color:#94a3b8; margin-bottom:0.75rem;">Alternative / Note: ' + escHtml(rec.alt) + '</div>' +
      '<div class="capture-layers-grid">' +
        '<div class="capture-layer-box"><span>1. Native Console Game FPS</span><strong>' + escHtml(rec.nativeFps) + '</strong></div>' +
        '<div class="capture-layer-box"><span>2. Captured Input Feed</span><strong>' + escHtml(rec.captureFeed) + '</strong></div>' +
        '<div class="capture-layer-box"><span>3. Display Output</span><strong>' + escHtml(rec.displayOut) + '</strong></div>' +
      '</div>' +
      '<p style="color:#cbd5e1; font-size:0.84rem; line-height:1.55; margin:0.75rem 0 0.5rem;">' + escHtml(rec.summary) + '</p>' +
      '<div style="background:rgba(255,42,141,0.08); border-left:3px solid ' + rec.latencyColor + '; padding:0.55rem 0.75rem; border-radius:0 6px 6px 0; font-size:0.81rem; color:#e2e8f0; line-height:1.5; margin-bottom:0.55rem;">' +
        '<strong>Artifacts &amp; Trade-Offs:</strong> ' + escHtml(rec.artifactsNote) +
      '</div>' +
      '<div style="background:rgba(0,240,255,0.06); border:1px solid rgba(0,240,255,0.2); padding:0.5rem 0.75rem; border-radius:6px; font-size:0.79rem; color:#cbd5e1; line-height:1.5;">' +
        '<strong>Platform Setup Note:</strong> ' + escHtml(platformNote) +
      '</div>' +
      '<div style="margin-top:0.75rem; display:flex; gap:0.6rem; flex-wrap:wrap;">' +
        '<a href="#hardware-comparison" onclick="window.GTA6SettingsHub && window.GTA6SettingsHub.filterHardware(\'capture-card\')" class="btn btn-primary" style="padding:0.42rem 0.9rem; font-size:0.78rem;">Compare Capture Cards Below &rarr;</a>' +
        '<a href="#guide-capture" class="btn btn-secondary" style="padding:0.42rem 0.9rem; font-size:0.78rem;">Read Full Frame-Gen Trade-Off Guide</a>' +
      '</div>';
  }

  // ------------------------------------------------------------------------
  // 4. PC SPECIFICATIONS SAVER (NO INVENTED PC REQUIREMENTS)
  // ------------------------------------------------------------------------
  var pcSpecsState = {
    cpu: '',
    gpu: '',
    ramGb: '',
    vramGb: '',
    ssdCapacity: '',
    freeStorageGb: '',
    notes: '',
    savedAt: null
  };

  function loadPcSpecsState() {
    var gp = getProgress();
    if (!gp) return;
    var saved = gp.getToolState('settingsPcSpecs');
    if (saved && typeof saved === 'object') {
      Object.assign(pcSpecsState, saved);
    }
  }

  function hydratePcSpecsForm() {
    var map = {
      pcCpuInput: 'cpu',
      pcGpuInput: 'gpu',
      pcRamInput: 'ramGb',
      pcVramInput: 'vramGb',
      pcSsdCapInput: 'ssdCapacity',
      pcFreeStorageInput: 'freeStorageGb',
      pcNotesInput: 'notes'
    };
    Object.keys(map).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.value = pcSpecsState[map[id]] || '';
    });
  }

  function renderPcSpecsSummary() {
    var outEl = document.getElementById('pcSpecsSavedCard');
    if (!outEl) return;

    var hasAny = Boolean(pcSpecsState.cpu || pcSpecsState.gpu || pcSpecsState.ramGb || pcSpecsState.vramGb || pcSpecsState.ssdCapacity || pcSpecsState.freeStorageGb);
    if (!hasAny) {
      outEl.innerHTML =
        '<div style="color:#94a3b8; font-size:0.84rem; padding:0.75rem; background:rgba(255,255,255,0.02); border:1px dashed rgba(255,255,255,0.14); border-radius:8px;">' +
          'No PC hardware profile saved yet. Enter your specs above and click <strong>Save My PC Specs Locally</strong> to store your rig inside your browser\'s <code>gta6hg_progress_v1</code> JSON backup for when Rockstar announces official PC requirements.' +
        '</div>';
      return;
    }

    var freeNum = parseFloat(pcSpecsState.freeStorageGb);
    var storageRefNote = !isNaN(freeNum) && freeNum > 0
      ? 'Saved Free Storage: <strong>' + escHtml(String(freeNum)) + ' GB</strong> (for context only: console versions require up to 212 GB depending on device; official GTA VI PC storage requirements remain unannounced).'
      : 'Enter available free storage above if you want to keep a local storage note alongside your rig profile.';

    outEl.innerHTML =
      '<div class="pc-saved-profile">' +
        '<div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.45rem; margin-bottom:0.55rem;">' +
          '<span class="verify-badge verify-confirmed">💾 SAVED IN LOCAL PROGRESS STORE</span>' +
          '<span style="font-family:var(--font-mono); font-size:0.72rem; color:#94a3b8;">' + (pcSpecsState.savedAt ? 'Saved: ' + escHtml(pcSpecsState.savedAt) : 'Stored locally') + '</span>' +
        '</div>' +
        '<div class="pc-spec-pills">' +
          '<div><span>CPU</span><strong>' + escHtml(pcSpecsState.cpu || '—') + '</strong></div>' +
          '<div><span>GPU</span><strong>' + escHtml(pcSpecsState.gpu || '—') + '</strong></div>' +
          '<div><span>System RAM</span><strong>' + (pcSpecsState.ramGb ? escHtml(pcSpecsState.ramGb) + ' GB' : '—') + '</strong></div>' +
          '<div><span>GPU VRAM</span><strong>' + (pcSpecsState.vramGb ? escHtml(pcSpecsState.vramGb) + ' GB' : '—') + '</strong></div>' +
          '<div><span>SSD Capacity</span><strong>' + escHtml(pcSpecsState.ssdCapacity || '—') + '</strong></div>' +
          '<div><span>Available Storage</span><strong>' + (pcSpecsState.freeStorageGb ? escHtml(pcSpecsState.freeStorageGb) + ' GB' : '—') + '</strong></div>' +
        '</div>' +
        (pcSpecsState.notes ? '<div style="margin-top:0.55rem; font-size:0.8rem; color:#cbd5e1;"><strong>Notes:</strong> ' + escHtml(pcSpecsState.notes) + '</div>' : '') +
        '<div style="margin-top:0.6rem; padding:0.55rem 0.75rem; border-radius:6px; background:rgba(255,184,0,0.08); border:1px solid rgba(255,184,0,0.35); color:#fde68a; font-size:0.79rem; line-height:1.5;">' +
          '<strong>Compatibility Status: Pending Official Announcement.</strong> Rockstar Games has not announced official GTA VI PC requirements or a PC release date — official compatibility cannot yet be determined. ' + storageRefNote +
        '</div>' +
      '</div>';
  }

  function handleSavePcSpecs(e) {
    if (e && e.preventDefault) e.preventDefault();
    pcSpecsState.cpu = (document.getElementById('pcCpuInput').value || '').trim().slice(0, 80);
    pcSpecsState.gpu = (document.getElementById('pcGpuInput').value || '').trim().slice(0, 80);
    pcSpecsState.ramGb = (document.getElementById('pcRamInput').value || '').trim().slice(0, 16);
    pcSpecsState.vramGb = (document.getElementById('pcVramInput').value || '').trim().slice(0, 16);
    pcSpecsState.ssdCapacity = (document.getElementById('pcSsdCapInput').value || '').trim().slice(0, 32);
    pcSpecsState.freeStorageGb = (document.getElementById('pcFreeStorageInput').value || '').trim().slice(0, 16);
    pcSpecsState.notes = (document.getElementById('pcNotesInput').value || '').trim().slice(0, 180);
    pcSpecsState.savedAt = new Date().toISOString().slice(0, 16).replace('T', ' ') + ' UTC';

    var gp = getProgress();
    if (gp) {
      gp.setToolState('settingsPcSpecs', pcSpecsState, false);
    }
    renderPcSpecsSummary();
    var stEl = document.getElementById('pcSpecsStatusMsg');
    if (stEl) {
      stEl.textContent = '✓ PC specs saved locally in gta6hg_progress_v1 (included in JSON backup).';
      stEl.style.color = 'var(--neon-green)';
    }
  }

  function handleClearPcSpecs() {
    pcSpecsState = { cpu: '', gpu: '', ramGb: '', vramGb: '', ssdCapacity: '', freeStorageGb: '', notes: '', savedAt: null };
    var gp = getProgress();
    if (gp) gp.setToolState('settingsPcSpecs', pcSpecsState, false);
    hydratePcSpecsForm();
    renderPcSpecsSummary();
    var stEl = document.getElementById('pcSpecsStatusMsg');
    if (stEl) {
      stEl.textContent = 'Cleared saved PC specs from local storage.';
      stEl.style.color = '#94a3b8';
    }
  }

  function handleCopyPcSpecs() {
    var lines = [
      'My Saved PC Specs (GTA6HeistGuide.com — Pending Official GTA VI PC Requirements):',
      'CPU: ' + (pcSpecsState.cpu || 'Not set'),
      'GPU: ' + (pcSpecsState.gpu || 'Not set'),
      'RAM: ' + (pcSpecsState.ramGb ? pcSpecsState.ramGb + ' GB' : 'Not set'),
      'VRAM: ' + (pcSpecsState.vramGb ? pcSpecsState.vramGb + ' GB' : 'Not set'),
      'SSD Capacity: ' + (pcSpecsState.ssdCapacity || 'Not set'),
      'Available Storage: ' + (pcSpecsState.freeStorageGb ? pcSpecsState.freeStorageGb + ' GB' : 'Not set')
    ];
    if (pcSpecsState.notes) lines.push('Notes: ' + pcSpecsState.notes);
    var text = lines.join('\n');
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        var stEl = document.getElementById('pcSpecsStatusMsg');
        if (stEl) {
          stEl.textContent = '✓ Copied your PC specs summary to clipboard.';
          stEl.style.color = 'var(--neon-cyan)';
        }
      }).catch(function () {});
    }
  }

  // ------------------------------------------------------------------------
  // 5. AMAZON-COMPLIANT HARDWARE COMPARISON FILTER (ZERO HARDCODED PRICES)
  // ------------------------------------------------------------------------
  var activeHwCat = 'all';
  var activeHwPlatform = 'all';

  function applyHardwareFilters() {
    document.querySelectorAll('[data-hw-cat-btn]').forEach(function (btn) {
      btn.classList.toggle('active', btn.getAttribute('data-hw-cat-btn') === activeHwCat);
    });
    var platSel = document.getElementById('hwPlatformFilter');
    if (platSel) platSel.value = activeHwPlatform;

    var shown = 0;
    document.querySelectorAll('.hw-card').forEach(function (card) {
      var cat = card.getAttribute('data-hw-cat') || '';
      var plat = card.getAttribute('data-hw-platform') || 'all';
      var catOk = activeHwCat === 'all' || cat === activeHwCat;
      var platOk = activeHwPlatform === 'all' || plat === 'both' || plat === activeHwPlatform;
      var vis = catOk && platOk;
      card.style.display = vis ? 'flex' : 'none';
      if (vis) shown++;
    });

    var countEl = document.getElementById('hwResultCount');
    if (countEl) countEl.textContent = 'Showing ' + shown + ' verified hardware model' + (shown === 1 ? '' : 's');
  }

  function filterHardware(cat) {
    activeHwCat = cat || 'all';
    activeHwPlatform = 'all';
    applyHardwareFilters();
  }

  // ------------------------------------------------------------------------
  // INIT & EVENT WIRING
  // ------------------------------------------------------------------------
  function syncAllFromStore() {
    loadStorageState();
    loadChecklistState();
    loadCaptureState();
    loadPcSpecsState();
    renderStorageCalculator();
    renderChecklist();
    renderCaptureSelector();
    hydratePcSpecsForm();
    renderPcSpecsSummary();
  }

  document.addEventListener('DOMContentLoaded', function () {
    var gp = getProgress();
    if (gp) {
      gp.mountToolbar('#settingsProgressBar', {
        scope: 'settings',
        scopeLabel: 'Settings Hub',
        onSync: syncAllFromStore
      });
    }

    syncAllFromStore();
    applyHardwareFilters();

    // Storage Calculator bindings
    document.querySelectorAll('[data-storage-platform]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        storageState.platform = btn.getAttribute('data-storage-platform');
        saveStorageState();
        renderStorageCalculator();
      });
    });

    [
      ['ps5ModelSelect', 'ps5Model', 'change'],
      ['ps5M2Select', 'ps5M2', 'change'],
      ['ps5FreeInput', 'ps5FreeGb', 'input'],
      ['ps5BufferSelect', 'ps5BufferGb', 'change'],
      ['xboxModelSelect', 'xboxModel', 'change'],
      ['xboxTargetSelect', 'xboxTarget', 'change'],
      ['xboxFreeInput', 'xboxFreeGb', 'input'],
      ['xboxBufferSelect', 'xboxBufferGb', 'change']
    ].forEach(function (cfg) {
      var el = document.getElementById(cfg[0]);
      if (!el) return;
      el.addEventListener(cfg[2], function () {
        var val = el.value;
        storageState[cfg[1]] = (cfg[1].indexOf('Gb') !== -1) ? Number(val) : val;
        saveStorageState();
        renderStorageCalculator();
      });
    });

    // Checklist bindings
    document.querySelectorAll('[data-checklist-platform]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        checklistPlatform = btn.getAttribute('data-checklist-platform');
        var progress = getProgress();
        if (progress) progress.setToolState('settingsChecklist', { platform: checklistPlatform }, true);
        renderChecklist();
      });
    });

    var resetPlatformCheckBtn = document.getElementById('resetCurrentChecklistBtn');
    if (resetPlatformCheckBtn) {
      resetPlatformCheckBtn.addEventListener('click', function () {
        var progress = getProgress();
        var items = CHECKLIST_ITEMS[checklistPlatform] || [];
        if (progress) {
          items.forEach(function (item) {
            progress.setDone(item.id, false);
          });
        }
        renderChecklist();
      });
    }

    // Capture Card Selector bindings
    [
      ['capConsoleSelect', 'console'],
      ['capGoalSelect', 'goal'],
      ['capInterfaceSelect', 'pcInterface']
    ].forEach(function (cfg) {
      var el = document.getElementById(cfg[0]);
      if (!el) return;
      el.addEventListener('change', function () {
        captureState[cfg[1]] = el.value;
        saveCaptureState();
        renderCaptureSelector();
      });
    });

    // PC Specs Saver bindings
    var pcForm = document.getElementById('pcSpecsForm');
    if (pcForm) pcForm.addEventListener('submit', handleSavePcSpecs);
    var pcClearBtn = document.getElementById('pcSpecsClearBtn');
    if (pcClearBtn) pcClearBtn.addEventListener('click', handleClearPcSpecs);
    var pcCopyBtn = document.getElementById('pcSpecsCopyBtn');
    if (pcCopyBtn) pcCopyBtn.addEventListener('click', handleCopyPcSpecs);
    var pcExportBtn = document.getElementById('pcSpecsExportBtn');
    if (pcExportBtn) {
      pcExportBtn.addEventListener('click', function () {
        var progress = getProgress();
        if (progress) progress.exportJSON();
      });
    }

    // Hardware comparison bindings
    document.querySelectorAll('[data-hw-cat-btn]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        activeHwCat = btn.getAttribute('data-hw-cat-btn') || 'all';
        applyHardwareFilters();
      });
    });
    var hwPlatSel = document.getElementById('hwPlatformFilter');
    if (hwPlatSel) {
      hwPlatSel.addEventListener('change', function () {
        activeHwPlatform = hwPlatSel.value || 'all';
        applyHardwareFilters();
      });
    }

    global.addEventListener('gta6-progress-updated', function () {
      renderChecklist();
    });
  });

  global.GTA6SettingsHub = {
    filterHardware: filterHardware,
    syncAllFromStore: syncAllFromStore
  };
})(window);
