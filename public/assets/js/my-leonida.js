/* ==========================================================================
   GTA6HEISTGUIDE — MY LEONIDA DASHBOARD CONTROLLER (Phase 28)
   Connects Map (188 pins), Heist Command Center (16 jobs), Garage (33 vehicles),
   Armory (25 weapons), Properties (27), Wildlife (49 = 7 verified + 42 ref),
   Gun Outlets (24), Save Planner (15 slots), and Recently Viewed Pages.
   ========================================================================== */
(function () {
  'use strict';

  var datasets = {
    pins: [],
    jobs: [],
    vehicles: [],
    weapons: [],
    properties: [],
    animals: [],
    gunStores: []
  };

  var pinById = Object.create(null);
  var jobById = Object.create(null);
  var weaponHeistMap = Object.create(null);

  var activeTab = 'overview';
  var selectedVehicleCompare = [];
  var selectedWeaponCompare = [];
  var pinPageLimit = 40;

  // Verified slug overrides where JSON item id differs from /vehicles/<slug> or /weapons/<slug>
  var VEHICLE_SLUG_MAP = {
    'sirius-muscle-coupe': 'sirius-classic-muscle-coupe',
    'canis-offroad-4x4': 'canis-lifted-4x4-pickup',
    'vapid-mud-buggy': 'vapid-6-off-road-mud-coupe',
    'grassrivers-airboat': 'grassrivers-swamp-airboat',
    'buckingham-shamal-jet': 'buckingham-private-jet',
    'weazel-news-maverick': 'weazel-news-helicopter',
    'declasse-tulip-m100': 'declasse-tulip',
    'vapid-dominator-gt': 'vapid-dominator',
    'pfister-comet-s2': 'pfister-comet',
    'vcpd-buffalo-interceptor': 'vcpd-cruiser-pursuit-interceptor',
    'western-cruiser-motorcycle': 'western-final-chapter-cruiser',
    'pegassi-bati-sportbike': 'sportbike',
    'vcpd-air-one-helicopter': 'vcpd-air-support-helicopter'
  };

  var WEAPON_SLUG_MAP = {
    'kl17g1-polymer-pistol': 'kl17g1-polymer-9mm-pistol',
    'custom-duo-revolvers': 'ride-free-revolver',
    'submachine-gun-mp5': 'tactical-9mm-smg',
    'assault-rifle-ak': 'classic-assault-rifle',
    'brets-sm69': 'brets-sm-69',
    'heavy-sniper-rifle': 'heavy-anti-materiel-sniper-rifle',
    'rpg-launcher': 'rpg-rocket-launcher',
    'grenade-launcher': 'compact-grenade-launcher',
    'crowbar': 'heavy-crowbar',
    'frag-grenade': 'fragmentation-grenade'
  };

  function esc(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function track(eventName, params) {
    try {
      if (typeof window.GTA6Track === 'function') {
        window.GTA6Track(eventName, params || {});
      }
    } catch (e) {}
  }

  function showStatus(msg, isErr) {
    var el = document.getElementById('mlStatusBanner');
    if (!el) return;
    el.textContent = msg;
    el.className = 'ml-status-banner is-visible ' + (isErr ? 'is-err' : 'is-ok');
  }

  function getVehicleDetailUrl(v) {
    if (!v || !v.id) return '/vehicles';
    var slug = VEHICLE_SLUG_MAP[v.id] || v.id;
    return '/vehicles/' + encodeURIComponent(slug);
  }

  function getWeaponDetailUrl(w) {
    if (!w || !w.id) return '/weapons';
    var slug = WEAPON_SLUG_MAP[w.id] || w.id;
    return '/weapons/' + encodeURIComponent(slug);
  }

  function getVerifiedPinUrl(pinId) {
    if (!pinId || !pinById[pinId]) return null;
    return '/map?pin=' + encodeURIComponent(pinId);
  }

  function openConfirmModal(title, description, confirmLabel, isDanger, onConfirm) {
    var modal = document.getElementById('mlConfirmModal');
    var titleEl = document.getElementById('mlConfirmModalTitle');
    var descEl = document.getElementById('mlConfirmModalDesc');
    var okBtn = document.getElementById('mlConfirmOkBtn');
    var cancelBtn = document.getElementById('mlConfirmCancelBtn');
    if (!modal || !okBtn) return;

    titleEl.textContent = title;
    descEl.textContent = description;
    okBtn.textContent = confirmLabel || 'Confirm';
    okBtn.className = 'ml-btn ' + (isDanger ? 'ml-btn-danger' : 'ml-btn-primary');

    function close() {
      modal.classList.remove('is-open');
    }
    okBtn.onclick = function () {
      close();
      if (typeof onConfirm === 'function') onConfirm();
    };
    cancelBtn.onclick = close;
    modal.onclick = function (e) {
      if (e.target === modal) close();
    };
    modal.classList.add('is-open');
  }

  function switchTab(tabName, silentTrack) {
    var valid = ['overview', 'exploration', 'heists', 'garage', 'armory', 'world', 'backup'];
    if (valid.indexOf(tabName) === -1) tabName = 'overview';
    activeTab = tabName;

    document.querySelectorAll('.ml-tab').forEach(function (btn) {
      var isAct = btn.getAttribute('data-ml-tab') === tabName;
      btn.classList.toggle('is-active', isAct);
      btn.setAttribute('aria-selected', isAct ? 'true' : 'false');
    });
    document.querySelectorAll('.ml-panel').forEach(function (panel) {
      panel.classList.toggle('is-active', panel.id === 'panel-' + tabName);
    });

    if (!silentTrack) {
      track('my_leonida_category_open', {
        category: tabName,
        interaction_type: 'tab_switch'
      });
    }
  }

  function buildNextActivities(snap) {
    var recs = [];

    // 1. Unfinished active heist checklist
    if (snap.heists.activeJobs.length > 0) {
      var activeH = snap.heists.activeJobs[0];
      recs.push({
        tag: 'Resume Heist Checklist',
        type: 'heist_resume',
        title: activeH.job.title + ' (' + activeH.pct + '% prepared)',
        desc: activeH.incompleteSteps.length + ' preparation step' + (activeH.incompleteSteps.length === 1 ? '' : 's') + ' remaining in your checklist.',
        href: '/heist-command-center/?job=' + encodeURIComponent(activeH.job.id),
        cta: 'Resume Checklist →'
      });
    } else if (snap.heists.items.length > 0) {
      var nextJob = snap.heists.items.find(function (h) { return !h.isCompleted; });
      if (nextJob) {
        recs.push({
          tag: 'Start Heist Prep',
          type: 'heist_start',
          title: nextJob.job.title,
          desc: 'Open the canonical walkthrough, preparation checklist (' + nextJob.totalSteps + ' steps), and map pin.',
          href: '/heist-command-center/?job=' + encodeURIComponent(nextJob.job.id),
          cta: 'Open Command View →'
        });
      }
    }

    // 2. Unvisited map pin
    if (snap.map.unvisitedPins.length > 0) {
      var nextPin = snap.map.unvisitedPins.find(function (p) { return p.id && p.id.indexOf('heist-') === 0; }) || snap.map.unvisitedPins[0];
      recs.push({
        tag: 'Unvisited Map Pin',
        type: 'map_pin',
        title: nextPin.title + ' (' + (nextPin.region || 'Leonida') + ')',
        desc: snap.map.unvisited + ' verified pins left to explore across ' + snap.map.categoriesRemaining.length + ' map categories.',
        href: '/map?pin=' + encodeURIComponent(nextPin.id),
        cta: 'Open on Map →'
      });
    }

    // 3. Compare vehicles not yet owned
    var unownedVeh = datasets.vehicles.filter(function (v) {
      return !snap.garage.owned.some(function (o) { return o.id === v.id; });
    });
    if (unownedVeh.length >= 2) {
      recs.push({
        tag: 'Compare Vehicles',
        type: 'vehicle_compare',
        title: 'Compare ' + unownedVeh[0].name + ' vs. ' + unownedVeh[1].name,
        desc: 'Review verified getaway specs, classes, and spawn regions side-by-side.',
        href: '/vehicles?compare=' + encodeURIComponent(unownedVeh[0].id + ',' + unownedVeh[1].id),
        cta: 'Compare Specs →'
      });
    }

    // 4. Verified wildlife or properties or save planner
    var nextAnimal = datasets.animals.find(function (a) {
      return window.GTA6MyLeonida.isVerifiedInGameAnimal(a) &&
        !snap.wildlife.verifiedDiscovered.some(function (d) { return d.id === a.id; });
    });
    if (nextAnimal) {
      recs.push({
        tag: 'Verified GTA VI Wildlife',
        type: 'wildlife_verified',
        title: 'Track ' + nextAnimal.name + ' (' + (nextAnimal.region || 'Leonida') + ')',
        desc: snap.wildlife.verifiedDiscovered.length + ' of ' + snap.wildlife.verifiedTotal + ' confirmed in-game GTA VI species discovered.',
        href: nextAnimal.mapPinId && pinById[nextAnimal.mapPinId]
          ? '/map?pin=' + encodeURIComponent(nextAnimal.mapPinId)
          : '/animals',
        cta: 'Explore Wildlife →'
      });
    } else if (snap.savePlanner.slots < 15) {
      recs.push({
        tag: 'Save Strategy',
        type: 'save_planner',
        title: 'Plan Your 15 Story Mode Save Slots',
        desc: snap.savePlanner.slots + ' / 15 strategic save slots marked so far.',
        href: '/save-planner/',
        cta: 'Open Save Planner →'
      });
    }

    return recs.slice(0, 4);
  }

  function renderAll() {
    if (!window.GTA6MyLeonida) return;
    var snap = window.GTA6MyLeonida.computeSnapshot(datasets);

    // Recovery notice if any corrupt legacy key was preserved
    var recInfo = window.GTA6MyLeonida.getRecoveryInfo();
    var recEl = document.getElementById('mlRecoveryNotice');
    if (recEl) {
      if (recInfo) {
        recEl.style.display = 'inline';
        recEl.textContent = 'Recovered safely from malformed stored data (' + Object.keys(recInfo).join(', ') + '). Original raw copy preserved locally.';
      } else {
        recEl.style.display = 'none';
      }
    }

    // Hero KPIs
    document.getElementById('mlKpiOverallPct').textContent = snap.overall.pct + '%';
    document.getElementById('mlKpiOverallSub').textContent = snap.overall.completed + ' / ' + snap.overall.total + ' verified items';
    document.getElementById('mlKpiOverallBar').style.width = snap.overall.pct + '%';

    document.getElementById('mlKpiMapVal').textContent = snap.map.completed + ' / ' + snap.map.total;
    document.getElementById('mlKpiMapSub').textContent = snap.map.pct + '% · ' + snap.map.unvisited + ' unvisited';
    document.getElementById('mlKpiMapBar').style.width = snap.map.pct + '%';

    document.getElementById('mlKpiHeistVal').textContent = snap.heists.prepPct + '%';
    document.getElementById('mlKpiHeistSub').textContent = snap.heists.activeJobs.length + ' active · ' + snap.heists.completedJobs.length + ' completed';
    document.getElementById('mlKpiHeistBar').style.width = snap.heists.prepPct + '%';

    document.getElementById('mlKpiGearVal').textContent = snap.garage.owned.length + ' / ' + snap.armory.favorites.length;
    document.getElementById('mlKpiGearSub').textContent = snap.garage.owned.length + ' owned vehicles · ' + snap.armory.favorites.length + ' fav weapons';

    document.getElementById('mlKpiWorldVal').textContent = snap.properties.explored.length + ' / ' + snap.wildlife.verifiedDiscovered.length;
    document.getElementById('mlKpiWorldSub').textContent = snap.properties.explored.length + '/' + snap.properties.total + ' properties · ' + snap.wildlife.verifiedDiscovered.length + '/' + snap.wildlife.verifiedTotal + ' verified animals';

    // Tab badges
    document.getElementById('badge-exploration').textContent = String(snap.map.completed);
    document.getElementById('badge-heists').textContent = String(snap.heists.completedJobs.length + snap.heists.activeJobs.length);
    document.getElementById('badge-garage').textContent = String(snap.garage.owned.length + snap.garage.favorites.length);
    document.getElementById('badge-armory').textContent = String(snap.armory.favorites.length + snap.armory.owned.length);
    document.getElementById('badge-world').textContent = String(
      snap.properties.explored.length + snap.wildlife.verifiedDiscovered.length + snap.gunStores.explored.length
    );

    // Hero Resume Heist button deep-link to active job if present
    var resumeHeistBtn = document.getElementById('mlResumeHeistHeroBtn');
    if (resumeHeistBtn) {
      if (snap.heists.activeJobId && jobById[snap.heists.activeJobId]) {
        resumeHeistBtn.href = '/heist-command-center/?job=' + encodeURIComponent(snap.heists.activeJobId);
        resumeHeistBtn.textContent = '🛰️ Resume: ' + jobById[snap.heists.activeJobId].title;
      } else {
        resumeHeistBtn.href = '/heist-command-center/';
        resumeHeistBtn.textContent = '🛰️ Open Heist Command Center';
      }
    }

    // Empty welcome banner for brand-new visitors
    var welcomeEl = document.getElementById('mlEmptyWelcome');
    if (welcomeEl) {
      welcomeEl.style.display = snap.hasAnyActivity ? 'none' : 'block';
    }

    renderOverview(snap);
    renderCommunityDiscoveries();
    renderExploration(snap);
    renderHeists(snap);
    renderGarage(snap);
    renderArmory(snap);
    renderWorld(snap);
    renderBackupPreview();
  }

  function renderCommunityDiscoveries() {
    var savedEl = document.getElementById('mlCommunitySavedList');
    var recentEl = document.getElementById('mlCommunityRecentList');
    if (!savedEl || !recentEl || !window.GTA6Progress) return;
    var rawSaved = window.GTA6Progress.getToolState('savedDiscoveries');
    var savedBag = (rawSaved && typeof rawSaved === 'object' && !Array.isArray(rawSaved)) ? rawSaved : {};
    var savedItems = Object.keys(savedBag).map(function (k) { return savedBag[k]; }).filter(function (x) {
      return x && x.ref && window.GTA6Progress.isDone('cd-saved:' + x.ref);
    });
    var rawRecent = window.GTA6Progress.getToolState('recentDiscoveries');
    var recentItems = Array.isArray(rawRecent) ? rawRecent.slice(0, 6) : [];

    if (!savedItems.length) {
      savedEl.innerHTML = '<div class="ml-empty-box">No saved community discoveries yet. Save any approved discovery from the <a href="/community-discoveries/" style="color:var(--neon-cyan);">Community Intelligence Network</a> to track it here.</div>';
    } else {
      savedEl.innerHTML = savedItems.map(function (it) {
        var foundKey = 'cd-verified-found:' + it.ref;
        var isFound = Boolean(it.is_verified && window.GTA6Progress.isDone(foundKey));
        var mapBtn = it.map_pin_id
          ? '<a href="/map?pin=' + encodeURIComponent(it.map_pin_id) + '" class="ml-btn ml-btn-secondary ml-btn-sm">Map →</a>'
          : '';
        var foundBtn = it.is_verified
          ? '<button type="button" class="ml-btn ml-btn-sm ' + (isFound ? 'ml-btn-primary' : 'ml-btn-secondary') + '" data-cd-found="' + esc(it.ref) + '">' + (isFound ? '✓ Found' : 'Mark Found') + '</button>'
          : '<span class="ml-pill" title="Only Verified in Gameplay or Officially Confirmed discoveries can be marked found.">Unverified Report</span>';
        return '<div class="ml-row">' +
          '<div class="ml-row-main"><strong>' + esc(it.title) + '</strong><span>' + esc(it.region || 'Leonida') + ' · ' + esc(it.evidence_status || 'COMMUNITY_REPORTED') + '</span></div>' +
          '<div class="ml-row-actions">' +
            foundBtn +
            mapBtn +
            '<a href="' + esc(it.url || ('/community-discoveries/d/' + encodeURIComponent(it.ref))) + '" class="ml-btn ml-btn-secondary ml-btn-sm">Open →</a>' +
            '<button type="button" class="ml-btn ml-btn-secondary ml-btn-sm" data-cd-unsave="' + esc(it.ref) + '" aria-label="Remove saved discovery">✕</button>' +
          '</div>' +
        '</div>';
      }).join('');

      savedEl.querySelectorAll('[data-cd-found]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var r = btn.getAttribute('data-cd-found');
          if (!r) return;
          var key = 'cd-verified-found:' + r;
          var next = !window.GTA6Progress.isDone(key);
          window.GTA6Progress.setDone(key, next);
          track('progress_category_update', { category: 'community_discovery', completed: next });
          renderCommunityDiscoveries();
        });
      });
      savedEl.querySelectorAll('[data-cd-unsave]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var r = btn.getAttribute('data-cd-unsave');
          if (!r) return;
          window.GTA6Progress.setDone('cd-saved:' + r, false);
          var existing = window.GTA6Progress.getToolState('savedDiscoveries');
          var bag = Object.assign({}, (existing && typeof existing === 'object' && !Array.isArray(existing)) ? existing : {});
          delete bag[r];
          window.GTA6Progress.setToolState('savedDiscoveries', bag);
          track('discovery_bookmark', { saved: false });
          renderCommunityDiscoveries();
        });
      });
    }

    if (!recentItems.length) {
      recentEl.innerHTML = '';
    } else {
      recentEl.innerHTML = '<div style="font-size:0.78rem; color:#94a3b8; font-weight:700; margin-bottom:0.35rem;">Recently Viewed Discoveries</div>' +
        recentItems.map(function (it) {
          return '<div class="ml-row">' +
            '<div class="ml-row-main"><strong>' + esc(it.title) + '</strong><span>' + esc(it.region || 'Leonida') + ' · Ref ' + esc(it.ref) + '</span></div>' +
            '<div class="ml-row-actions"><a href="' + esc(it.url || ('/community-discoveries/d/' + encodeURIComponent(it.ref))) + '" class="ml-btn ml-btn-secondary ml-btn-sm">Resume →</a></div>' +
          '</div>';
        }).join('');
    }
  }

  function renderOverview(snap) {
    // Next Activity
    var nextEl = document.getElementById('mlNextActivityList');
    var recs = buildNextActivities(snap);
    if (!recs.length) {
      nextEl.innerHTML = '<div class="ml-empty-box">All tracked checklists and map pins are complete. Explore any database or export a backup snapshot.</div>';
    } else {
      nextEl.innerHTML = recs.map(function (r) {
        return (
          '<article class="ml-next-card">' +
            '<div>' +
              '<span class="ml-next-tag">' + esc(r.tag) + '</span>' +
              '<h3 class="ml-next-title">' + esc(r.title) + '</h3>' +
              '<p class="ml-next-desc">' + esc(r.desc) + '</p>' +
            '</div>' +
            '<div><a href="' + esc(r.href) + '" class="ml-btn ml-btn-secondary ml-btn-sm" data-ml-next-type="' + esc(r.type) + '">' + esc(r.cta) + '</a></div>' +
          '</article>'
        );
      }).join('');
    }

    // Recently Viewed Pages
    var recEl = document.getElementById('mlRecentPagesList');
    if (!snap.recentPages.length) {
      recEl.innerHTML = '<div class="ml-empty-box">No recently viewed guides yet. Pages you read across GTA6HeistGuide.com will appear here automatically.</div>';
    } else {
      recEl.innerHTML = snap.recentPages.slice(0, 6).map(function (item) {
        return (
          '<div class="ml-row">' +
            '<div class="ml-row-main">' +
              '<div class="ml-row-title">' + esc(item.title) + '</div>' +
              '<div class="ml-row-sub">' + esc(item.path) + '</div>' +
            '</div>' +
            '<div class="ml-row-actions"><a href="' + esc(item.path) + '" class="ml-chip-btn">Resume →</a></div>' +
          '</div>'
        );
      }).join('');
    }

    // Save Planner & Saved Locations
    var savedEl = document.getElementById('mlOverviewSavedSummary');
    var savedRows = [
      '<div class="ml-row">' +
        '<div class="ml-row-main"><div class="ml-row-title">💾 15-Slot Save Planner</div><div class="ml-row-sub">' + snap.savePlanner.slots + ' / 15 strategic save slots marked · ' + snap.savePlanner.preflight + ' preflight steps</div></div>' +
        '<div class="ml-row-actions"><a href="/save-planner/" class="ml-chip-btn">Open →</a></div>' +
      '</div>',
      '<div class="ml-row">' +
        '<div class="ml-row-main"><div class="ml-row-title">⭐ Favorited Map Pins</div><div class="ml-row-sub">' + snap.map.favoritePins.length + ' saved locations · ' + snap.map.customPins.length + ' custom user pins</div></div>' +
        '<div class="ml-row-actions"><button type="button" class="ml-chip-btn" data-ml-jump="exploration">View Pins →</button></div>' +
      '</div>'
    ];
    snap.map.favoritePins.slice(0, 3).forEach(function (pin) {
      savedRows.push(
        '<div class="ml-row">' +
          '<div class="ml-row-main"><div class="ml-row-title">📍 ' + esc(pin.title) + '</div><div class="ml-row-sub">' + esc(pin.region || 'Leonida') + ' · ' + esc(pin.categoryName || pin.category) + '</div></div>' +
          '<div class="ml-row-actions"><a href="/map?pin=' + encodeURIComponent(pin.id) + '" class="ml-chip-btn">Map →</a></div>' +
        '</div>'
      );
    });
    savedEl.innerHTML = savedRows.join('');

    // Active Heists snapshot
    var ovHeistsEl = document.getElementById('mlOverviewHeists');
    var showHeists = snap.heists.activeJobs.length ? snap.heists.activeJobs : snap.heists.completedJobs.slice(0, 3);
    if (!showHeists.length) {
      ovHeistsEl.innerHTML = '<div class="ml-empty-box">No active heist checklists yet. Open My Heists or Heist Command Center to begin tracking preparation steps.</div>';
    } else {
      ovHeistsEl.innerHTML = showHeists.slice(0, 4).map(function (h) {
        return (
          '<div class="ml-row' + (h.isCompleted ? ' is-done' : '') + '">' +
            '<div class="ml-row-main">' +
              '<div class="ml-row-title">' + esc(h.job.title) + '</div>' +
              '<div class="ml-row-sub">' + h.doneSteps + '/' + h.totalSteps + ' steps (' + h.pct + '%) · ' + esc(h.job.region) + '</div>' +
            '</div>' +
            '<div class="ml-row-actions"><a href="/heist-command-center/?job=' + encodeURIComponent(h.job.id) + '" class="ml-chip-btn">Resume →</a></div>' +
          '</div>'
        );
      }).join('');
    }

    // Saved Favorites Snapshot
    var ovFavsEl = document.getElementById('mlOverviewFavorites');
    var favItems = [];
    snap.garage.favorites.slice(0, 2).forEach(function (v) {
      favItems.push({ label: '🏎️ ' + v.name, sub: v.vehicleClass || 'Vehicle', href: getVehicleDetailUrl(v) });
    });
    snap.armory.favorites.slice(0, 2).forEach(function (w) {
      favItems.push({ label: '⚔️ ' + w.name, sub: w.weaponClass || 'Weapon', href: getWeaponDetailUrl(w) });
    });
    snap.properties.bookmarked.slice(0, 2).forEach(function (p) {
      favItems.push({ label: '🏠 ' + p.name, sub: p.region || 'Property', href: '/properties' });
    });
    if (!favItems.length) {
      ovFavsEl.innerHTML = '<div class="ml-empty-box">Favorite any vehicle, weapon, property, or wildlife entry to pin it here for quick access.</div>';
    } else {
      ovFavsEl.innerHTML = favItems.slice(0, 5).map(function (f) {
        return (
          '<div class="ml-row">' +
            '<div class="ml-row-main"><div class="ml-row-title">' + esc(f.label) + '</div><div class="ml-row-sub">' + esc(f.sub) + '</div></div>' +
            '<div class="ml-row-actions"><a href="' + esc(f.href) + '" class="ml-chip-btn">Open →</a></div>' +
          '</div>'
        );
      }).join('');
    }
  }

  function renderExploration(snap) {
    var sumEl = document.getElementById('mlMapSummaryLine');
    if (sumEl) {
      sumEl.textContent = snap.map.completed + ' of ' + snap.map.total + ' verified pins completed (' + snap.map.pct + '%) · ' + snap.map.unvisited + ' unvisited · ' + snap.map.categoriesRemaining.length + ' categories remaining · ' + snap.map.favoritePins.length + ' favorites.';
    }

    // Categories remaining
    var catGrid = document.getElementById('mlMapCategoriesGrid');
    if (catGrid) {
      catGrid.innerHTML = snap.map.categoriesRemaining.slice(0, 6).map(function (c) {
        var pct = c.total > 0 ? Math.round((c.done / c.total) * 100) : 0;
        return (
          '<div class="ml-kpi-card">' +
            '<span class="ml-kpi-label">' + esc(c.name) + '</span>' +
            '<span class="ml-kpi-val" style="font-size:1rem;">' + c.done + ' / ' + c.total + '</span>' +
            '<span class="ml-kpi-sub">' + c.remaining + ' remaining</span>' +
            '<div class="ml-bar-track"><div class="ml-bar-fill" style="width:' + pct + '%"></div></div>' +
          '</div>'
        );
      }).join('');
    }

    // Populate region dropdown once
    var regSelect = document.getElementById('mlPinFilterRegion');
    if (regSelect && regSelect.options.length <= 1 && datasets.pins.length) {
      var regions = Array.from(new Set(datasets.pins.map(function (p) { return p.region; }).filter(Boolean))).sort();
      regions.forEach(function (r) {
        var opt = document.createElement('option');
        opt.value = r;
        opt.textContent = r;
        regSelect.appendChild(opt);
      });
    }

    var q = (document.getElementById('mlPinSearch').value || '').trim().toLowerCase();
    var statusFilter = document.getElementById('mlPinFilterStatus').value;
    var regionFilter = regSelect ? regSelect.value : 'all';

    var filtered = datasets.pins.filter(function (pin) {
      var isDone = window.GTA6MyLeonida.isPinDone(pin.id);
      var isFav = window.GTA6MyLeonida.isPinFavorite(pin.id);
      if (statusFilter === 'completed' && !isDone) return false;
      if (statusFilter === 'unvisited' && isDone) return false;
      if (statusFilter === 'favorites' && !isFav) return false;
      if (regionFilter !== 'all' && pin.region !== regionFilter) return false;
      if (q) {
        var hay = (pin.title + ' ' + (pin.region || '') + ' ' + (pin.categoryName || pin.category || '')).toLowerCase();
        if (hay.indexOf(q) === -1) return false;
      }
      return true;
    });

    var listEl = document.getElementById('mlPinsList');
    if (!filtered.length) {
      listEl.innerHTML = '<div class="ml-empty-box">No verified map pins match the current filters.</div>';
      return;
    }

    var visible = filtered.slice(0, pinPageLimit);
    var html = visible.map(function (pin) {
      var isDone = window.GTA6MyLeonida.isPinDone(pin.id);
      var isFav = window.GTA6MyLeonida.isPinFavorite(pin.id);
      return (
        '<div class="ml-row' + (isDone ? ' is-done' : '') + '">' +
          '<div class="ml-row-main">' +
            '<div class="ml-row-title">' + esc(pin.title) + '</div>' +
            '<div class="ml-row-sub">' + esc(pin.region || 'Leonida') + ' · ' + esc(pin.categoryName || pin.category || 'Map Pin') + '</div>' +
          '</div>' +
          '<div class="ml-row-actions">' +
            '<button type="button" class="ml-chip-btn' + (isDone ? ' is-active-green' : '') + '" data-ml-pin-done="' + esc(pin.id) + '">' + (isDone ? '✅ Completed' : '☐ Mark Done') + '</button>' +
            '<button type="button" class="ml-chip-btn' + (isFav ? ' is-active-amber' : '') + '" data-ml-pin-fav="' + esc(pin.id) + '">' + (isFav ? '★ Favorited' : '☆ Favorite') + '</button>' +
            '<a href="/map?pin=' + encodeURIComponent(pin.id) + '" class="ml-chip-btn">🗺️ Open Pin</a>' +
          '</div>' +
        '</div>'
      );
    }).join('');

    if (filtered.length > pinPageLimit) {
      html += '<div style="text-align:center; margin-top:0.6rem;"><button type="button" class="ml-btn ml-btn-secondary ml-btn-sm" id="mlPinsShowMoreBtn">Show More Pins (' + (filtered.length - pinPageLimit) + ' remaining)</button></div>';
    }
    listEl.innerHTML = html;
  }

  function renderHeists(snap) {
    var sumEl = document.getElementById('mlHeistSummaryLine');
    if (sumEl) {
      sumEl.textContent = snap.heists.activeJobs.length + ' active · ' + snap.heists.completedJobs.length + ' completed · ' + snap.heists.doneSteps + '/' + snap.heists.totalSteps + ' preparation steps (' + snap.heists.prepPct + '%). Website-side checklist only.';
    }

    var filter = document.getElementById('mlHeistFilter').value;
    var items = snap.heists.items.filter(function (h) {
      if (filter === 'active') return h.inProgress;
      if (filter === 'completed') return h.isCompleted;
      if (filter === 'not-started') return !h.isCompleted && h.doneSteps === 0;
      return true;
    });

    var listEl = document.getElementById('mlHeistsList');
    if (!items.length) {
      listEl.innerHTML = '<div class="ml-empty-box">No heist jobs match this filter yet.</div>';
      return;
    }

    var hState = window.GTA6MyLeonida.getHeistCommandState();
    listEl.innerHTML = items.map(function (h) {
      var job = h.job;
      var stepMap = (hState.checklists && hState.checklists[job.id]) || {};
      var pinLink = (job.mapPins && job.mapPins[0] && pinById[job.mapPins[0].id])
        ? '<a href="/map?pin=' + encodeURIComponent(job.mapPins[0].id) + '" class="ml-chip-btn">🗺️ Map Pin</a>'
        : '';
      var stepsHtml = (job.checklist || []).map(function (st) {
        var checked = stepMap[st.id] === true || (h.isCompleted && Object.keys(stepMap).length === 0);
        return (
          '<label class="ml-step-item">' +
            '<input type="checkbox" data-ml-heist-step="' + esc(job.id) + '::' + esc(st.id) + '"' + (checked ? ' checked' : '') + '>' +
            '<span>' + esc(st.label) + '</span>' +
          '</label>'
        );
      }).join('');

      return (
        '<article class="ml-heist-card">' +
          '<div class="ml-row" style="background:none; border:none; padding:0;">' +
            '<div class="ml-row-main">' +
              '<div class="ml-row-title">' + esc(job.title) + ' <span style="color:#00f0ff; font-size:0.76rem; font-weight:700;">(' + esc(job.classification) + ')</span></div>' +
              '<div class="ml-row-sub">' + esc(job.region) + ' · ' + h.doneSteps + '/' + h.totalSteps + ' steps (' + h.pct + '%) · ' + esc(job.payout || '') + '</div>' +
            '</div>' +
            '<div class="ml-row-actions">' +
              '<a href="/heist-command-center/?job=' + encodeURIComponent(job.id) + '" class="ml-chip-btn is-active-pink">🛰️ Resume Command View</a>' +
              (job.canonicalUrl ? '<a href="' + esc(job.canonicalUrl) + '" class="ml-chip-btn">📖 Walkthrough</a>' : '') +
              pinLink +
            '</div>' +
          '</div>' +
          '<div class="ml-bar-track"><div class="ml-bar-fill is-pink" style="width:' + h.pct + '%"></div></div>' +
          '<div class="ml-heist-steps">' + stepsHtml + '</div>' +
        '</article>'
      );
    }).join('');
  }

  function renderVehicleCompareBar() {
    var bar = document.getElementById('mlVehicleCompareBar');
    var txt = document.getElementById('mlVehicleCompareText');
    var go = document.getElementById('mlVehicleCompareGo');
    if (!bar) return;
    if (selectedVehicleCompare.length > 0) {
      bar.classList.add('is-visible');
      txt.textContent = 'Selected for comparison (' + selectedVehicleCompare.length + '/3): ' + selectedVehicleCompare.join(', ');
      go.href = selectedVehicleCompare.length >= 2
        ? '/vehicles?compare=' + encodeURIComponent(selectedVehicleCompare.join(','))
        : '/vehicles?item=' + encodeURIComponent(selectedVehicleCompare[0]);
      go.textContent = selectedVehicleCompare.length >= 2 ? '⚖️ Compare ' + selectedVehicleCompare.length + ' Vehicles →' : 'Select 1 More to Compare';
    } else {
      bar.classList.remove('is-visible');
    }
  }

  function renderGarage(snap) {
    var sumEl = document.getElementById('mlGarageSummaryLine');
    if (sumEl) {
      sumEl.textContent = snap.garage.owned.length + ' / ' + snap.garage.total + ' vehicles owned · ' + snap.garage.favorites.length + ' saved favorites.';
    }
    renderVehicleCompareBar();

    var q = (document.getElementById('mlVehicleSearch').value || '').trim().toLowerCase();
    var filter = document.getElementById('mlVehicleFilter').value;

    var items = datasets.vehicles.filter(function (v) {
      var isOwned = window.GTA6Progress && window.GTA6Progress.isDbOwned('vehicles', v.id);
      var isFav = window.GTA6Progress && window.GTA6Progress.isDbFavorite('vehicles', v.id);
      if (filter === 'owned' && !isOwned) return false;
      if (filter === 'favorites' && !isFav) return false;
      if (filter === 'unowned' && isOwned) return false;
      if (q) {
        var hay = (v.name + ' ' + (v.vehicleClass || '') + ' ' + (v.manufacturer || '')).toLowerCase();
        if (hay.indexOf(q) === -1) return false;
      }
      return true;
    });

    var grid = document.getElementById('mlVehiclesGrid');
    if (!items.length) {
      grid.innerHTML = '<div class="ml-empty-box" style="grid-column:1/-1;">No vehicles match your filter.</div>';
      return;
    }

    grid.innerHTML = items.map(function (v) {
      var isOwned = window.GTA6Progress && window.GTA6Progress.isDbOwned('vehicles', v.id);
      var isFav = window.GTA6Progress && window.GTA6Progress.isDbFavorite('vehicles', v.id);
      var isCmp = selectedVehicleCompare.indexOf(v.id) !== -1;
      var pinUrl = getVerifiedPinUrl(v.mapPinId);
      var imgHtml = v.image
        ? '<img src="' + esc(v.image) + '" alt="' + esc(v.name) + '" loading="lazy">'
        : '';
      return (
        '<article class="ml-item-card' + (isOwned ? ' is-done' : '') + (isFav ? ' is-fav' : '') + '">' +
          '<div class="ml-item-media">' + imgHtml + '<span class="ml-item-badge">' + esc(v.vehicleClass || 'Vehicle') + '</span></div>' +
          '<div class="ml-item-body">' +
            '<h3 class="ml-item-title">' + esc(v.name) + '</h3>' +
            '<div class="ml-item-meta">' + esc(v.manufacturer || 'Manufacturer unconfirmed') + (v.priceOrAcquisition ? ' · ' + esc(v.priceOrAcquisition) : '') + '</div>' +
            '<div class="ml-item-actions">' +
              '<button type="button" class="ml-chip-btn' + (isOwned ? ' is-active-green' : '') + '" data-ml-db-owned="vehicles::' + esc(v.id) + '">' + (isOwned ? '✅ Owned' : '☐ Own') + '</button>' +
              '<button type="button" class="ml-chip-btn' + (isFav ? ' is-active-amber' : '') + '" data-ml-db-fav="vehicles::' + esc(v.id) + '">' + (isFav ? '★ Fav' : '☆ Fav') + '</button>' +
              '<button type="button" class="ml-chip-btn' + (isCmp ? ' is-active-pink' : '') + '" data-ml-cmp-veh="' + esc(v.id) + '">' + (isCmp ? '⚖️ Added' : '⚖️ Compare') + '</button>' +
              '<a href="' + esc(getVehicleDetailUrl(v)) + '" class="ml-chip-btn">Specs →</a>' +
              (pinUrl ? '<a href="' + esc(pinUrl) + '" class="ml-chip-btn">🗺️ Pin</a>' : '') +
            '</div>' +
          '</div>' +
        '</article>'
      );
    }).join('');
  }

  function renderWeaponCompareBar() {
    var bar = document.getElementById('mlWeaponCompareBar');
    var txt = document.getElementById('mlWeaponCompareText');
    var go = document.getElementById('mlWeaponCompareGo');
    if (!bar) return;
    if (selectedWeaponCompare.length > 0) {
      bar.classList.add('is-visible');
      txt.textContent = 'Selected for comparison (' + selectedWeaponCompare.length + '/3): ' + selectedWeaponCompare.join(', ');
      go.href = selectedWeaponCompare.length >= 2
        ? '/weapons?compare=' + encodeURIComponent(selectedWeaponCompare.join(','))
        : '/weapons?item=' + encodeURIComponent(selectedWeaponCompare[0]);
      go.textContent = selectedWeaponCompare.length >= 2 ? '⚖️ Compare ' + selectedWeaponCompare.length + ' Weapons →' : 'Select 1 More to Compare';
    } else {
      bar.classList.remove('is-visible');
    }
  }

  function renderLoadoutSelectors(loadout) {
    var slots = ['sidearm', 'primary', 'heavy', 'utility'];
    slots.forEach(function (slot) {
      var sel = document.querySelector('[data-loadout-slot="' + slot + '"]');
      if (!sel) return;
      if (sel.options.length <= 1 && datasets.weapons.length) {
        sel.innerHTML = '<option value="">— None Selected —</option>' + datasets.weapons.map(function (w) {
          return '<option value="' + esc(w.id) + '">' + esc(w.name) + ' (' + esc(w.weaponClass || 'Weapon') + ')</option>';
        }).join('');
      }
      sel.value = loadout[slot] || '';
    });
  }

  function renderArmory(snap) {
    var sumEl = document.getElementById('mlArmorySummaryLine');
    if (sumEl) {
      sumEl.textContent = snap.armory.favorites.length + ' favorite weapons · ' + snap.armory.owned.length + ' owned · ' + snap.armory.loadoutCount + '/4 loadout slots assigned.';
    }
    renderLoadoutSelectors(snap.armory.loadout);
    renderWeaponCompareBar();

    var q = (document.getElementById('mlWeaponSearch').value || '').trim().toLowerCase();
    var filter = document.getElementById('mlWeaponFilter').value;

    var items = datasets.weapons.filter(function (w) {
      var isOwned = window.GTA6Progress && window.GTA6Progress.isDbOwned('weapons', w.id);
      var isFav = window.GTA6Progress && window.GTA6Progress.isDbFavorite('weapons', w.id);
      if (filter === 'owned' && !isOwned) return false;
      if (filter === 'favorites' && !isFav) return false;
      if (q) {
        var hay = (w.name + ' ' + (w.weaponClass || '') + ' ' + (w.bestUseCase || '')).toLowerCase();
        if (hay.indexOf(q) === -1) return false;
      }
      return true;
    });

    var grid = document.getElementById('mlWeaponsGrid');
    if (!items.length) {
      grid.innerHTML = '<div class="ml-empty-box" style="grid-column:1/-1;">No weapons match your filter.</div>';
      return;
    }

    grid.innerHTML = items.map(function (w) {
      var isOwned = window.GTA6Progress && window.GTA6Progress.isDbOwned('weapons', w.id);
      var isFav = window.GTA6Progress && window.GTA6Progress.isDbFavorite('weapons', w.id);
      var isCmp = selectedWeaponCompare.indexOf(w.id) !== -1;
      var relatedHeist = weaponHeistMap[w.name.toLowerCase()] || weaponHeistMap[w.id];
      var imgHtml = w.image ? '<img src="' + esc(w.image) + '" alt="' + esc(w.name) + '" loading="lazy">' : '';
      return (
        '<article class="ml-item-card' + (isOwned ? ' is-done' : '') + (isFav ? ' is-fav' : '') + '">' +
          '<div class="ml-item-media">' + imgHtml + '<span class="ml-item-badge">' + esc(w.weaponClass || 'Weapon') + '</span></div>' +
          '<div class="ml-item-body">' +
            '<h3 class="ml-item-title">' + esc(w.name) + '</h3>' +
            '<div class="ml-item-meta">' + esc(w.bestUseCase || w.howToObtain || 'Verified weapon database entry') + '</div>' +
            '<div class="ml-item-actions">' +
              '<button type="button" class="ml-chip-btn' + (isFav ? ' is-active-amber' : '') + '" data-ml-db-fav="weapons::' + esc(w.id) + '">' + (isFav ? '★ Fav' : '☆ Fav') + '</button>' +
              '<button type="button" class="ml-chip-btn' + (isOwned ? ' is-active-green' : '') + '" data-ml-db-owned="weapons::' + esc(w.id) + '">' + (isOwned ? '✅ Owned' : '☐ Own') + '</button>' +
              '<button type="button" class="ml-chip-btn' + (isCmp ? ' is-active-pink' : '') + '" data-ml-cmp-wep="' + esc(w.id) + '">' + (isCmp ? '⚖️ Added' : '⚖️ Compare') + '</button>' +
              '<a href="' + esc(getWeaponDetailUrl(w)) + '" class="ml-chip-btn">Details →</a>' +
              (relatedHeist ? '<a href="/heist-command-center/?job=' + encodeURIComponent(relatedHeist.id) + '" class="ml-chip-btn">🎯 ' + esc(relatedHeist.short) + '</a>' : '') +
              '<a href="/weapons-bonuses" class="ml-chip-btn">🔫 Stores</a>' +
            '</div>' +
          '</div>' +
        '</article>'
      );
    }).join('');
  }

  function renderWorld(snap) {
    var sumEl = document.getElementById('mlWorldSummaryLine');
    if (sumEl) {
      sumEl.textContent =
        snap.properties.explored.length + '/' + snap.properties.total + ' properties · ' +
        snap.wildlife.verifiedDiscovered.length + '/' + snap.wildlife.verifiedTotal + ' verified GTA VI animals discovered (' +
        snap.wildlife.referenceViewed.length + '/' + snap.wildlife.referenceTotal + ' real-world references viewed, excluded from discoveries) · ' +
        snap.gunStores.explored.length + '/' + snap.gunStores.total + ' gun outlets.';
    }

    var section = document.getElementById('mlWorldSection').value;
    var q = (document.getElementById('mlWorldSearch').value || '').trim().toLowerCase();
    var statusFilter = document.getElementById('mlWorldStatusFilter').value;
    var noticeEl = document.getElementById('mlWildlifeNotice');

    var dbCat = 'properties';
    var sourceList = [];
    var isReferenceMode = false;

    if (section === 'properties') {
      dbCat = 'properties';
      sourceList = datasets.properties;
      noticeEl.style.display = 'none';
    } else if (section === 'animals-verified') {
      dbCat = 'animals';
      sourceList = datasets.animals.filter(window.GTA6MyLeonida.isVerifiedInGameAnimal);
      noticeEl.style.display = 'flex';
      noticeEl.innerHTML = '<span>🐊 <strong>Verified GTA VI Wildlife (7 Species):</strong> These entries are confirmed from official GTA VI gameplay/press screenshots and count toward your confirmed in-game wildlife discoveries.</span>';
    } else if (section === 'animals-reference') {
      dbCat = 'animals';
      isReferenceMode = true;
      sourceList = datasets.animals.filter(function (a) { return !window.GTA6MyLeonida.isVerifiedInGameAnimal(a); });
      noticeEl.style.display = 'flex';
      noticeEl.innerHTML = '<span>📷 <strong>Real-World Species References (42 Entries — Not GTA VI Gameplay):</strong> You can bookmark or mark these reference photographs as reviewed for field identification, but they are <strong>never</strong> counted as confirmed in-game GTA VI discoveries.</span>';
    } else if (section === 'gun-stores') {
      dbCat = 'gun-stores';
      sourceList = datasets.gunStores;
      noticeEl.style.display = 'none';
    }

    var filtered = sourceList.filter(function (it) {
      var isExplored = window.GTA6Progress && window.GTA6Progress.isDbOwned(dbCat, it.id);
      var isBookmarked = window.GTA6Progress && window.GTA6Progress.isDbFavorite(dbCat, it.id);
      if (statusFilter === 'explored' && !isExplored) return false;
      if (statusFilter === 'bookmarked' && !isBookmarked) return false;
      if (q) {
        var hay = (it.name + ' ' + (it.region || '') + ' ' + (it.category || it.propertyType || it.storeType || '')).toLowerCase();
        if (hay.indexOf(q) === -1) return false;
      }
      return true;
    });

    var grid = document.getElementById('mlWorldGrid');
    if (!filtered.length) {
      grid.innerHTML = '<div class="ml-empty-box" style="grid-column:1/-1;">No entries match your filter.</div>';
      return;
    }

    grid.innerHTML = filtered.map(function (it) {
      var isExplored = window.GTA6Progress && window.GTA6Progress.isDbOwned(dbCat, it.id);
      var isBookmarked = window.GTA6Progress && window.GTA6Progress.isDbFavorite(dbCat, it.id);
      var pinUrl = getVerifiedPinUrl(it.mapPinId || it.pinId);
      var badgeClass = isReferenceMode ? 'is-reference' : (dbCat === 'animals' ? 'is-verified' : '');
      var badgeLabel = isReferenceMode
        ? 'Real-World Reference Photo'
        : (dbCat === 'animals' ? 'Verified GTA VI Animal' : (it.propertyType || it.storeType || it.region || 'Leonida'));
      var exploreLabel = isReferenceMode
        ? (isExplored ? '✅ Ref Reviewed' : '☐ Mark Reviewed')
        : (dbCat === 'animals' ? (isExplored ? '✅ Discovered' : '☐ Mark Discovered') : (isExplored ? '✅ Explored' : '☐ Mark Explored'));
      var imgHtml = it.image ? '<img src="' + esc(it.image) + '" alt="' + esc(it.imageAlt || it.name) + '" loading="lazy">' : '';

      return (
        '<article class="ml-item-card' + (isExplored ? ' is-done' : '') + (isBookmarked ? ' is-fav' : '') + '">' +
          '<div class="ml-item-media">' + imgHtml + '<span class="ml-item-badge ' + badgeClass + '">' + esc(badgeLabel) + '</span></div>' +
          '<div class="ml-item-body">' +
            '<h3 class="ml-item-title">' + esc(it.name) + '</h3>' +
            '<div class="ml-item-meta">' + esc(it.region || 'Leonida') + (it.habitat ? ' · ' + esc(it.habitat).slice(0, 85) : (it.locationDetail ? ' · ' + esc(it.locationDetail) : '')) + '</div>' +
            '<div class="ml-item-actions">' +
              '<button type="button" class="ml-chip-btn' + (isExplored ? ' is-active-green' : '') + '" data-ml-db-owned="' + esc(dbCat) + '::' + esc(it.id) + '">' + exploreLabel + '</button>' +
              '<button type="button" class="ml-chip-btn' + (isBookmarked ? ' is-active-amber' : '') + '" data-ml-db-fav="' + esc(dbCat) + '::' + esc(it.id) + '">' + (isBookmarked ? '★ Bookmarked' : '☆ Bookmark') + '</button>' +
              (pinUrl ? '<a href="' + esc(pinUrl) + '" class="ml-chip-btn">🗺️ Map Pin</a>' : '') +
            '</div>' +
          '</div>' +
        '</article>'
      );
    }).join('');
  }

  function renderBackupPreview() {
    var prev = document.getElementById('mlExportPreview');
    if (prev && window.GTA6MyLeonida) {
      prev.value = JSON.stringify(window.GTA6MyLeonida.buildExportPayload(), null, 2);
    }
  }

  function handleImportText(rawText) {
    var fb = document.getElementById('mlImportFeedback');
    var check = window.GTA6MyLeonida.validateImportJSON(rawText);
    if (!check.ok) {
      if (fb) {
        fb.style.color = '#fca5a5';
        fb.textContent = '❌ ' + check.error;
      }
      showStatus(check.error, true);
      return;
    }

    openConfirmModal(
      'Confirm Backup Restore (' + check.format + ')',
      'Valid backup detected (' + check.summary.completedKeys + ' progress items, ' + check.summary.heistJobsTracked + ' heist checklists, ' + check.summary.recentPages + ' recent pages). Your current browser progress will be automatically backed up before restoring.',
      'Restore Backup',
      false,
      function () {
        var res = window.GTA6MyLeonida.applyImportJSON(rawText);
        if (!res.ok) {
          if (fb) {
            fb.style.color = '#fca5a5';
            fb.textContent = '❌ ' + res.error;
          }
          showStatus(res.error, true);
          return;
        }
        if (fb) {
          fb.style.color = '#86efac';
          fb.textContent = '✅ Backup restored cleanly (' + res.format + '). Pre-import safety snapshot preserved.';
        }
        showStatus('My Leonida backup restored & synchronized across connected tools.', false);
        track('progress_backup_import', {
          backup_format: res.format,
          interaction_type: 'backup_restore'
        });
        renderAll();
      }
    );
  }

  function bindEvents() {
    // Tabs
    document.querySelectorAll('.ml-tab').forEach(function (btn) {
      btn.addEventListener('click', function () {
        switchTab(btn.getAttribute('data-ml-tab'), false);
      });
    });

    // Delegated clicks inside main app
    var app = document.getElementById('myLeonidaApp');
    app.addEventListener('click', function (e) {
      var jump = e.target.closest('[data-ml-jump]');
      if (jump) {
        switchTab(jump.getAttribute('data-ml-jump'), false);
        return;
      }

      var nextLink = e.target.closest('[data-ml-next-type]');
      if (nextLink) {
        track('my_next_activity_click', {
          activity_type: nextLink.getAttribute('data-ml-next-type'),
          interaction_type: 'next_activity'
        });
        return;
      }

      var pinDoneBtn = e.target.closest('[data-ml-pin-done]');
      if (pinDoneBtn) {
        var pid = pinDoneBtn.getAttribute('data-ml-pin-done');
        var nextState = window.GTA6MyLeonida.togglePinComplete(pid);
        track('progress_category_update', { category: 'map_pins', action: nextState ? 'complete' : 'uncomplete' });
        renderAll();
        return;
      }

      var pinFavBtn = e.target.closest('[data-ml-pin-fav]');
      if (pinFavBtn) {
        var fpid = pinFavBtn.getAttribute('data-ml-pin-fav');
        var nextFav = window.GTA6MyLeonida.togglePinFavorite(fpid);
        track('progress_category_update', { category: 'map_pins', action: nextFav ? 'favorite' : 'unfavorite' });
        renderAll();
        return;
      }

      if (e.target.id === 'mlPinsShowMoreBtn') {
        pinPageLimit += 50;
        renderAll();
        return;
      }

      var dbOwnedBtn = e.target.closest('[data-ml-db-owned]');
      if (dbOwnedBtn) {
        var parts = dbOwnedBtn.getAttribute('data-ml-db-owned').split('::');
        var nOwned = window.GTA6MyLeonida.toggleDbOwned(parts[0], parts[1]);
        track('progress_category_update', { category: parts[0], action: nOwned ? 'owned_or_explored' : 'cleared' });
        renderAll();
        return;
      }

      var dbFavBtn = e.target.closest('[data-ml-db-fav]');
      if (dbFavBtn) {
        var fparts = dbFavBtn.getAttribute('data-ml-db-fav').split('::');
        var nFav = window.GTA6MyLeonida.toggleDbFavorite(fparts[0], fparts[1]);
        track('progress_category_update', { category: fparts[0], action: nFav ? 'favorite' : 'unfavorite' });
        renderAll();
        return;
      }

      var cmpVeh = e.target.closest('[data-ml-cmp-veh]');
      if (cmpVeh) {
        var vid = cmpVeh.getAttribute('data-ml-cmp-veh');
        var idx = selectedVehicleCompare.indexOf(vid);
        if (idx >= 0) selectedVehicleCompare.splice(idx, 1);
        else if (selectedVehicleCompare.length < 3) selectedVehicleCompare.push(vid);
        else showStatus('You can compare up to 3 vehicles at a time.', true);
        renderAll();
        return;
      }

      var cmpWep = e.target.closest('[data-ml-cmp-wep]');
      if (cmpWep) {
        var wid = cmpWep.getAttribute('data-ml-cmp-wep');
        var widx = selectedWeaponCompare.indexOf(wid);
        if (widx >= 0) selectedWeaponCompare.splice(widx, 1);
        else if (selectedWeaponCompare.length < 3) selectedWeaponCompare.push(wid);
        else showStatus('You can compare up to 3 weapons at a time.', true);
        renderAll();
        return;
      }

      var resetCatBtn = e.target.closest('[data-ml-reset-cat]');
      if (resetCatBtn) {
        var cat = resetCatBtn.getAttribute('data-ml-reset-cat');
        openConfirmModal(
          'Reset ' + cat + ' Progress?',
          'This clears only your locally saved "' + cat + '" progress in this browser without affecting other categories.',
          'Reset ' + cat,
          true,
          function () {
            window.GTA6MyLeonida.resetCategory(cat);
            track('progress_category_update', { category: cat, action: 'reset_category' });
            showStatus('Cleared "' + cat + '" progress locally.', false);
            renderAll();
          }
        );
      }
    });

    // Heist checklist checkboxes & loadout selectors
    app.addEventListener('change', function (e) {
      var stepAttr = e.target.getAttribute('data-ml-heist-step');
      if (stepAttr) {
        var sp = stepAttr.split('::');
        window.GTA6MyLeonida.toggleHeistStep(sp[0], sp[1], e.target.checked, jobById[sp[0]]);
        track('progress_category_update', { category: 'heists', action: e.target.checked ? 'step_complete' : 'step_uncomplete' });
        renderAll();
        return;
      }
      var loadoutSlot = e.target.getAttribute('data-loadout-slot');
      if (loadoutSlot) {
        window.GTA6MyLeonida.setLoadoutSlot(loadoutSlot, e.target.value);
        track('progress_category_update', { category: 'armory_loadout', action: 'slot_updated' });
        renderAll();
      }
    });

    // Filters & searches
    ['mlPinSearch', 'mlPinFilterStatus', 'mlPinFilterRegion', 'mlHeistFilter',
      'mlVehicleSearch', 'mlVehicleFilter', 'mlWeaponSearch', 'mlWeaponFilter',
      'mlWorldSection', 'mlWorldSearch', 'mlWorldStatusFilter'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', renderAll);
        el.addEventListener('change', renderAll);
      }
    });

    // Compare clear buttons
    document.getElementById('mlVehicleCompareClear').addEventListener('click', function () {
      selectedVehicleCompare = [];
      renderAll();
    });
    document.getElementById('mlWeaponCompareClear').addEventListener('click', function () {
      selectedWeaponCompare = [];
      renderAll();
    });

    // Export buttons
    function doExport() {
      window.GTA6MyLeonida.exportJSON();
      track('progress_backup_export', { schema_version: 2, interaction_type: 'export_download' });
      showStatus('Exported My Leonida backup JSON (schemaVersion: 2).', false);
    }
    document.getElementById('mlQuickExportBtn').addEventListener('click', doExport);
    document.getElementById('mlExportDownloadBtn').addEventListener('click', doExport);
    document.getElementById('mlExportCopyBtn').addEventListener('click', function () {
      var json = JSON.stringify(window.GTA6MyLeonida.buildExportPayload(), null, 2);
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(json).then(function () {
          track('progress_backup_export', { schema_version: 2, interaction_type: 'export_copy' });
          showStatus('Copied My Leonida backup JSON to clipboard.', false);
        }).catch(function () {});
      }
    });

    // Import file & paste
    var fileInput = document.getElementById('mlImportFileInput');
    document.getElementById('mlImportFileBtn').addEventListener('click', function () {
      fileInput.value = '';
      fileInput.click();
    });
    fileInput.addEventListener('change', function (e) {
      var f = e.target.files && e.target.files[0];
      if (!f) return;
      if (f.size > window.GTA6MyLeonida.MAX_IMPORT_BYTES) {
        var errMsg = 'Backup file exceeds the 512 KB maximum size limit.';
        var fb = document.getElementById('mlImportFeedback');
        if (fb) { fb.style.color = '#fca5a5'; fb.textContent = '❌ ' + errMsg; }
        showStatus(errMsg, true);
        return;
      }
      var reader = new FileReader();
      reader.onload = function (evt) {
        handleImportText(String(evt.target.result || ''));
      };
      reader.readAsText(f);
    });
    document.getElementById('mlImportPasteBtn').addEventListener('click', function () {
      var txt = document.getElementById('mlImportTextarea').value;
      handleImportText(txt);
    });

    // Reset All with explicit confirmation
    document.getElementById('mlResetAllTriggerBtn').addEventListener('click', function () {
      openConfirmModal(
        'Reset ALL Website Progress?',
        'This will permanently clear all locally saved progress across My Leonida, Interactive Map, Heist Command Center, Garage, Armory, Properties, Wildlife, Save Planner, and Recent Pages in this browser. Export a backup first if you want to keep a copy.',
        'Yes, Reset All Progress',
        true,
        function () {
          window.GTA6MyLeonida.resetCategory('all');
          track('progress_category_update', { category: 'all', action: 'reset_all' });
          showStatus('All browser-local website progress has been reset.', false);
          renderAll();
        }
      );
    });

    // Live sync from other tabs or tools
    window.addEventListener('gta6-progress-updated', renderAll);
    window.addEventListener('gta6-my-leonida-updated', renderAll);
  }

  function loadAllDatasets() {
    var urls = [
      '/data/map-pins.json',
      '/data/heist-command-center.json',
      '/data/vehicles.json',
      '/data/weapons.json',
      '/data/properties.json',
      '/data/animals.json',
      '/data/gun-stores.json'
    ];
    return Promise.all(urls.map(function (u) {
      return fetch(u).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; });
    })).then(function (res) {
      datasets.pins = (res[0] && Array.isArray(res[0].pins)) ? res[0].pins : [];
      datasets.jobs = (res[1] && Array.isArray(res[1].jobs)) ? res[1].jobs : [];
      datasets.vehicles = (res[2] && Array.isArray(res[2].items)) ? res[2].items : [];
      datasets.weapons = (res[3] && Array.isArray(res[3].items)) ? res[3].items : [];
      datasets.properties = (res[4] && Array.isArray(res[4].items)) ? res[4].items : [];
      datasets.animals = (res[5] && Array.isArray(res[5].items)) ? res[5].items : [];
      datasets.gunStores = (res[6] && Array.isArray(res[6].items)) ? res[6].items : [];

      datasets.pins.forEach(function (p) { if (p && p.id) pinById[p.id] = p; });
      datasets.jobs.forEach(function (j) {
        if (!j || !j.id) return;
        jobById[j.id] = j;
        (j.recommendedWeapons || []).forEach(function (rw) {
          if (rw && rw.name && !weaponHeistMap[rw.name.toLowerCase()]) {
            weaponHeistMap[rw.name.toLowerCase()] = { id: j.id, short: j.title.split(' ')[0] + ' Heist' };
          }
        });
      });
    });
  }

  function init() {
    bindEvents();
    loadAllDatasets().then(function () {
      renderAll();
      var snap = window.GTA6MyLeonida.computeSnapshot(datasets);
      track('my_leonida_open', {
        has_progress: snap.hasAnyActivity,
        overall_pct: snap.overall.pct,
        interaction_type: 'page_load'
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
