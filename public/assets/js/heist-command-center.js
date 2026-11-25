/* ==========================================================================
   GTA6HEISTGUIDE — HEIST COMMAND CENTER ENGINE (Phase 27)
   Persistence Key: gta6_heist_command_v1
   ========================================================================== */
(function () {
  'use strict';

  var STORAGE_KEY = 'gta6_heist_command_v1';
  var SCHEMA_VERSION = 1;
  var MAX_IMPORT_BYTES = 32768;
  var FORBIDDEN_KEYS = { '__proto__': true, 'constructor': true, 'prototype': true };

  var jobs = [];
  var jobsById = Object.create(null);
  var state = {
    version: SCHEMA_VERSION,
    activeJobId: 'the-cartel-heist',
    checklists: Object.create(null),
    recentJobIds: [],
    updatedAt: null
  };

  var filters = {
    search: '',
    type: 'all',
    region: 'all',
    onlyWalkthrough: false,
    onlyConfirmed: false
  };

  var modalMode = 'export';
  var lastModalTrigger = null;

  function escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function trackEvent(name, params) {
    try {
      if (typeof window.GTA6Track === 'function') {
        window.GTA6Track(name, params || {});
      }
    } catch (e) {}
  }

  function showStatus(message, isError) {
    var banner = document.getElementById('hccStatusBanner');
    if (!banner) return;
    banner.textContent = message;
    banner.className = 'hcc-status-banner is-visible ' + (isError ? 'is-err' : 'is-ok');
  }

  function getJobChecklistStats(job) {
    if (!job || !Array.isArray(job.checklist) || job.checklist.length === 0) {
      return { done: 0, total: 0, pct: 0, remaining: 0 };
    }
    var map = state.checklists[job.id] || {};
    var done = 0;
    for (var i = 0; i < job.checklist.length; i++) {
      if (map[job.checklist[i].id] === true) done++;
    }
    var total = job.checklist.length;
    var pct = Math.round((done / total) * 100);
    return { done: done, total: total, pct: pct, remaining: total - done };
  }

  function saveState() {
    try {
      state.updatedAt = new Date().toISOString();
      var payload = {
        version: SCHEMA_VERSION,
        activeJobId: state.activeJobId,
        checklists: state.checklists,
        recentJobIds: state.recentJobIds.slice(0, 6),
        updatedAt: state.updatedAt
      };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {}
  }

  function sanitizeLoadedState(raw) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
      return { ok: false, error: 'Backup must be a valid JSON object.' };
    }
    if (raw.version !== SCHEMA_VERSION) {
      return { ok: false, error: 'Unsupported backup schema version (expected version 1).' };
    }
    if (raw.checklists !== undefined && (typeof raw.checklists !== 'object' || raw.checklists === null || Array.isArray(raw.checklists))) {
      return { ok: false, error: 'Invalid checklists structure in JSON backup.' };
    }

    var cleanChecklists = Object.create(null);
    var srcChecklists = raw.checklists || {};
    var jobKeys = Object.keys(srcChecklists);
    for (var i = 0; i < jobKeys.length; i++) {
      var jId = jobKeys[i];
      if (FORBIDDEN_KEYS[jId] || !jobsById[jId]) continue;
      var stepMap = srcChecklists[jId];
      if (!stepMap || typeof stepMap !== 'object' || Array.isArray(stepMap)) continue;
      var validSteps = Object.create(null);
      var jobSteps = jobsById[jId].checklist || [];
      for (var s = 0; s < jobSteps.length; s++) {
        validSteps[jobSteps[s].id] = true;
      }
      var cleanSteps = Object.create(null);
      var sKeys = Object.keys(stepMap);
      for (var k = 0; k < sKeys.length; k++) {
        var stepId = sKeys[k];
        if (FORBIDDEN_KEYS[stepId] || !validSteps[stepId]) continue;
        if (typeof stepMap[stepId] === 'boolean') {
          cleanSteps[stepId] = stepMap[stepId];
        }
      }
      cleanChecklists[jId] = cleanSteps;
    }

    var cleanRecent = [];
    if (Array.isArray(raw.recentJobIds)) {
      for (var r = 0; r < raw.recentJobIds.length && cleanRecent.length < 6; r++) {
        var rid = raw.recentJobIds[r];
        if (typeof rid === 'string' && jobsById[rid] && cleanRecent.indexOf(rid) === -1) {
          cleanRecent.push(rid);
        }
      }
    }

    var cleanActive = (typeof raw.activeJobId === 'string' && jobsById[raw.activeJobId])
      ? raw.activeJobId
      : (jobs[0] ? jobs[0].id : 'the-cartel-heist');

    return {
      ok: true,
      data: {
        version: SCHEMA_VERSION,
        activeJobId: cleanActive,
        checklists: cleanChecklists,
        recentJobIds: cleanRecent,
        updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : new Date().toISOString()
      }
    };
  }

  function loadState() {
    try {
      var rawStr = window.localStorage.getItem(STORAGE_KEY);
      if (!rawStr) return;
      var parsed = JSON.parse(rawStr);
      var res = sanitizeLoadedState(parsed);
      if (res.ok) {
        state = res.data;
      }
    } catch (e) {}
  }

  function recordRecent(jobId) {
    if (!jobsById[jobId]) return;
    state.recentJobIds = [jobId].concat(state.recentJobIds.filter(function (id) { return id !== jobId; })).slice(0, 6);
  }

  function syncWithGlobalProgress(job) {
    try {
      if (!window.GTA6Progress || typeof window.GTA6Progress.setDone !== 'function') return;
      var coreMap = {
        'the-cartel-heist': 'heist:the-cartel-heist',
        'vcia-takedown': 'heist:vcia-takedown',
        'shops-and-stickups': 'heist:shops-and-stickups',
        'pawn-shops': 'heist:pawn-shops',
        'jewelry-stores': 'heist:jewelry-stores',
        'small-banks-payday-loans': 'heist:small-banks-payday-loans',
        'large-bank-vaults': 'heist:large-bank-vaults',
        'armored-trucks-gang-ops': 'heist:armored-trucks-gang-ops'
      };
      if (!coreMap[job.id]) return;
      var stats = getJobChecklistStats(job);
      if (stats.total > 0) {
        window.GTA6Progress.setDone(coreMap[job.id], stats.pct === 100);
      }
    } catch (e) {}
  }

  function selectJob(jobId, options) {
    options = options || {};
    var job = jobsById[jobId];
    if (!job) return;
    state.activeJobId = job.id;
    recordRecent(job.id);
    saveState();

    if (!options.skipHistory && window.history && typeof window.history.pushState === 'function') {
      try {
        var url = new URL(window.location.href);
        url.searchParams.set('job', job.id);
        window.history.pushState({ jobId: job.id }, '', url.pathname + url.search);
      } catch (e) {}
    }

    renderAll();

    if (!options.silentTrack) {
      trackEvent('heist_selected', {
        job_id: job.id,
        classification: job.classification,
        region: job.region,
        interaction_type: options.source || 'directory_card'
      });
    }

    if (options.scrollToView) {
      var section = document.getElementById('commandViewSection');
      if (section && typeof section.scrollIntoView === 'function') {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }

  function toggleStep(jobId, stepId, checked) {
    var job = jobsById[jobId];
    if (!job) return;
    if (!state.checklists[jobId]) {
      state.checklists[jobId] = Object.create(null);
    }
    state.checklists[jobId][stepId] = Boolean(checked);
    saveState();
    syncWithGlobalProgress(job);

    var stats = getJobChecklistStats(job);
    trackEvent('heist_checklist_toggle', {
      job_id: job.id,
      classification: job.classification,
      step_checked: Boolean(checked),
      completion_pct: stats.pct,
      interaction_type: 'checklist_toggle'
    });

    renderAll();
  }

  function resetJob(jobId) {
    var job = jobsById[jobId];
    if (!job) return;
    delete state.checklists[jobId];
    saveState();
    syncWithGlobalProgress(job);
    showStatus('Reset preparation checklist for ' + job.title + '.', false);
    renderAll();
  }

  function resetAllProgress() {
    state.checklists = Object.create(null);
    state.recentJobIds = state.activeJobId ? [state.activeJobId] : [];
    saveState();
    showStatus('All local Heist Command Center checklists have been reset.', false);
    renderAll();
  }

  function getFilteredJobs() {
    var q = filters.search.trim().toLowerCase();
    return jobs.filter(function (job) {
      if (filters.type !== 'all' && job.classification !== filters.type) return false;
      if (filters.region !== 'all' && job.region !== filters.region) return false;
      if (filters.onlyWalkthrough && !job.hasWalkthrough) return false;
      if (filters.onlyConfirmed && job.evidenceTier !== 'confirmed') return false;
      if (q) {
        var hay = [job.title, job.subtitle, job.classification, job.region, job.chapter, job.summary].join(' ').toLowerCase();
        if (hay.indexOf(q) === -1) return false;
      }
      return true;
    });
  }

  function renderActivePanel() {
    var activeJob = jobsById[state.activeJobId] || jobs[0];
    var completedJobs = [];
    for (var i = 0; i < jobs.length; i++) {
      var st = getJobChecklistStats(jobs[i]);
      if (st.total > 0 && st.pct === 100) completedJobs.push(jobs[i]);
    }

    var kpiJobs = document.getElementById('hccKpiJobs');
    var kpiCompleted = document.getElementById('hccKpiCompleted');
    var kpiSteps = document.getElementById('hccKpiSteps');
    if (kpiJobs) kpiJobs.textContent = String(jobs.length);
    if (kpiCompleted) kpiCompleted.textContent = completedJobs.length + ' / ' + jobs.length;

    if (activeJob) {
      var aStats = getJobChecklistStats(activeJob);
      if (kpiSteps) kpiSteps.textContent = aStats.pct + '%';
      var titleEl = document.getElementById('hccActiveJobTitle');
      var fillEl = document.getElementById('hccActiveProgressFill');
      var wrapEl = document.getElementById('hccActiveProgressBarWrap');
      var textEl = document.getElementById('hccActiveProgressText');
      if (titleEl) titleEl.textContent = activeJob.title;
      if (fillEl) fillEl.style.width = aStats.pct + '%';
      if (wrapEl) wrapEl.setAttribute('aria-valuenow', String(aStats.pct));
      if (textEl) {
        textEl.textContent = aStats.pct + '% complete · ' + aStats.remaining + ' ' + (aStats.remaining === 1 ? 'step' : 'steps') + ' remaining';
      }
    }

    var recentEl = document.getElementById('hccRecentList');
    if (recentEl) {
      var recentValid = state.recentJobIds.filter(function (id) { return Boolean(jobsById[id]); }).slice(0, 4);
      if (recentValid.length === 0) {
        recentEl.innerHTML = '<li><p class="hcc-empty-hint">Select any heist or guide below to build your recent operations list.</p></li>';
      } else {
        recentEl.innerHTML = recentValid.map(function (id) {
          var j = jobsById[id];
          var st = getJobChecklistStats(j);
          return '<li><button type="button" data-select-job="' + escapeHtml(j.id) + '" data-select-source="recent_list">' +
            '<span>' + escapeHtml(j.title) + '</span>' +
            '<span style="color:var(--neon-cyan); font-family:var(--font-mono); font-size:0.72rem;">' + st.pct + '%</span>' +
            '</button></li>';
        }).join('');
      }
    }

    var compEl = document.getElementById('hccCompletedList');
    if (compEl) {
      if (completedJobs.length === 0) {
        compEl.innerHTML = '<li><p class="hcc-empty-hint">No checklists completed yet. Check off steps inside any job below.</p></li>';
      } else {
        compEl.innerHTML = completedJobs.slice(0, 4).map(function (j) {
          return '<li><button type="button" data-select-job="' + escapeHtml(j.id) + '" data-select-source="completed_list">' +
            '<span>✓ ' + escapeHtml(j.title) + '</span>' +
            '<span style="color:var(--neon-green); font-family:var(--font-mono); font-size:0.72rem;">100%</span>' +
            '</button></li>';
        }).join('');
      }
    }
  }

  function renderDirectory() {
    var grid = document.getElementById('hccDirectoryGrid');
    var countEl = document.getElementById('hccResultCount');
    if (!grid) return;

    var list = getFilteredJobs();
    if (countEl) {
      countEl.textContent = 'Showing ' + list.length + ' of ' + jobs.length + ' records';
    }

    if (list.length === 0) {
      grid.innerHTML = '<div class="hcc-panel" style="grid-column:1/-1; text-align:center; padding:2rem;">' +
        '<h3 style="justify-content:center; margin-bottom:0.4rem;">No matching missions or guides found</h3>' +
        '<p>Try clearing your search term or switching the classification and region filters.</p>' +
        '<button type="button" class="hcc-btn hcc-btn-primary hcc-btn-sm" id="hccEmptyResetBtn">Reset Directory Filters</button>' +
        '</div>';
      var emptyBtn = document.getElementById('hccEmptyResetBtn');
      if (emptyBtn) emptyBtn.addEventListener('click', clearFilters);
      return;
    }

    grid.innerHTML = list.map(function (job) {
      var stats = getJobChecklistStats(job);
      var isSelected = job.id === state.activeJobId;
      var badgeCls = job.evidenceTier === 'confirmed' ? 'hcc-badge-confirmed' : 'hcc-badge-mixed';
      var mapHref = job.mapPinId ? ('/map?pin=' + encodeURIComponent(job.mapPinId)) : '/map';

      return '<article class="hcc-card' + (isSelected ? ' is-selected' : '') + '">' +
        '<div class="hcc-card-media">' +
          '<img src="' + escapeHtml(job.image) + '" alt="' + escapeHtml(job.imageAlt || job.title) + '" loading="lazy" width="640" height="360">' +
          '<div class="hcc-card-badges">' +
            '<span class="hcc-badge hcc-badge-type">' + escapeHtml(job.classification) + '</span>' +
            '<span class="hcc-badge ' + badgeCls + '">' + escapeHtml(job.evidenceStatus) + '</span>' +
          '</div>' +
        '</div>' +
        '<div class="hcc-card-body">' +
          '<div class="hcc-card-meta"><span>📍 ' + escapeHtml(job.region) + '</span><span>' + escapeHtml(job.chapter) + '</span></div>' +
          '<h3 class="hcc-card-title">' + escapeHtml(job.title) + '</h3>' +
          '<p class="hcc-card-desc">' + escapeHtml(job.summary) + '</p>' +
          '<div class="hcc-card-payout">' + escapeHtml(job.payoutConfirmed) + '</div>' +
          (stats.done > 0 ? '<div class="hcc-card-progress">Checklist: ' + stats.done + '/' + stats.total + ' (' + stats.pct + '%)</div>' : '') +
          '<div class="hcc-card-actions">' +
            '<button type="button" class="hcc-btn hcc-btn-primary hcc-btn-sm" data-select-job="' + escapeHtml(job.id) + '" data-select-source="directory_card">' + (isSelected ? 'Active View' : 'Command View') + '</button>' +
            '<a href="' + escapeHtml(job.canonicalUrl) + '" class="hcc-btn hcc-btn-secondary hcc-btn-sm" data-hcc-resource="walkthrough" data-job-id="' + escapeHtml(job.id) + '">' + (job.hasWalkthrough ? 'Walkthrough' : 'Full Guide') + '</a>' +
            '<a href="' + escapeHtml(mapHref) + '" class="hcc-btn hcc-btn-secondary hcc-btn-sm" data-hcc-map-pin="' + escapeHtml(job.mapPinId || '') + '" data-job-id="' + escapeHtml(job.id) + '">Map Pin</a>' +
          '</div>' +
        '</div>' +
      '</article>';
    }).join('');
  }

  function renderCommandView() {
    var container = document.getElementById('hccCommandViewBody');
    if (!container) return;
    var job = jobsById[state.activeJobId] || jobs[0];
    if (!job) return;

    var stats = getJobChecklistStats(job);
    var mapHref = job.mapPinId ? ('/map?pin=' + encodeURIComponent(job.mapPinId)) : '/map';
    var secondaryMapHref = job.secondaryPinId ? ('/map?pin=' + encodeURIComponent(job.secondaryPinId)) : null;
    var badgeCls = job.evidenceTier === 'confirmed' ? 'hcc-badge-confirmed' : 'hcc-badge-mixed';
    var checkedMap = state.checklists[job.id] || {};

    var checklistHtml = (job.checklist || []).map(function (step) {
      var isDone = checkedMap[step.id] === true;
      return '<label class="hcc-check-item' + (isDone ? ' is-done' : '') + '">' +
        '<input type="checkbox" data-check-job="' + escapeHtml(job.id) + '" data-check-step="' + escapeHtml(step.id) + '"' + (isDone ? ' checked' : '') + '>' +
        '<span>' + escapeHtml(step.label) + '</span>' +
      '</label>';
    }).join('');

    var completeBanner = '';
    if (stats.total > 0 && stats.pct === 100) {
      var nextSug = (job.nextActivities && job.nextActivities[0]) ? job.nextActivities[0] : null;
      completeBanner = '<div class="hcc-complete-banner">' +
        '<strong>✓ Checklist Complete (' + escapeHtml(job.title) + ')</strong> — ' +
        (nextSug
          ? (nextSug.jobId
              ? 'Suggested next activity: <button type="button" class="hcc-btn hcc-btn-primary hcc-btn-sm" style="margin-left:0.4rem;" data-select-job="' + escapeHtml(nextSug.jobId) + '" data-select-source="post_complete_suggestion">' + escapeHtml(nextSug.label) + ' →</button>'
              : 'Suggested next guide: <a href="' + escapeHtml(nextSug.url) + '" class="hcc-btn hcc-btn-primary hcc-btn-sm" style="margin-left:0.4rem;" data-hcc-resource="post_complete_next">' + escapeHtml(nextSug.label) + ' →</a>')
          : 'Select another operation from the directory to continue.') +
      '</div>';
    }

    var weaponsHtml = (job.weapons && job.weapons.length > 0)
      ? '<div class="hcc-equip-grid">' + job.weapons.map(function (w) {
          return '<a href="' + escapeHtml(w.url) + '" class="hcc-equip-card" data-hcc-resource="weapon_card" data-job-id="' + escapeHtml(job.id) + '">' +
            '<img src="' + escapeHtml(w.image) + '" alt="' + escapeHtml(w.name) + '" loading="lazy" width="480" height="270">' +
            '<div class="hcc-equip-body">' +
              '<span class="hcc-equip-name">' + escapeHtml(w.name) + '</span>' +
              '<span class="hcc-equip-reason">' + escapeHtml(w.reason) + '</span>' +
              '<span class="hcc-equip-cta">Open Weapon Guide →</span>' +
            '</div>' +
          '</a>';
        }).join('') + '</div>'
      : '<p>No weapon-specific restriction is required for this guide. Browse the <a href="/weapons" style="color:var(--neon-cyan);" data-hcc-resource="weapons_fallback">Weapons Database</a> or <a href="/weapons-bonuses" style="color:var(--neon-cyan);" data-hcc-resource="gun_stores_fallback">24 Gun Stores</a> for regional loadouts.</p>';

    var vehiclesHtml = (job.vehicles && job.vehicles.length > 0)
      ? '<div class="hcc-equip-grid">' + job.vehicles.map(function (v) {
          return '<a href="' + escapeHtml(v.url) + '" class="hcc-equip-card" data-hcc-resource="vehicle_card" data-job-id="' + escapeHtml(job.id) + '">' +
            '<img src="' + escapeHtml(v.image) + '" alt="' + escapeHtml(v.name) + '" loading="lazy" width="480" height="270">' +
            '<div class="hcc-equip-body">' +
              '<span class="hcc-equip-name">' + escapeHtml(v.name) + '</span>' +
              '<span class="hcc-equip-reason">' + escapeHtml(v.reason) + '</span>' +
              '<span class="hcc-equip-cta">Open Vehicle Profile →</span>' +
            '</div>' +
          '</a>';
        }).join('') + '</div>'
      : '<p>No single vehicle is locked for this guide. Compare getaway cars and trunk specs in the <a href="/vehicles" style="color:var(--neon-cyan);" data-hcc-resource="vehicles_fallback">Vehicles Database</a>.</p>';

    var setupLinksHtml = (job.setupLinks || []).map(function (sl) {
      return '<a href="' + escapeHtml(sl.url) + '" class="hcc-link-row" data-hcc-resource="setup_link" data-job-id="' + escapeHtml(job.id) + '">' +
        '<span>' + escapeHtml(sl.label) + '</span><span aria-hidden="true">→</span></a>';
    }).join('');

    var nextLinksHtml = (job.nextActivities || []).map(function (na) {
      if (na.jobId && jobsById[na.jobId]) {
        return '<button type="button" class="hcc-link-row" data-select-job="' + escapeHtml(na.jobId) + '" data-select-source="next_activity">' +
          '<span>' + escapeHtml(na.label) + '</span><span style="color:var(--neon-cyan); font-size:0.74rem;">' + escapeHtml(na.type || 'Next') + ' →</span></button>';
      }
      return '<a href="' + escapeHtml(na.url) + '" class="hcc-link-row" data-hcc-resource="next_activity" data-job-id="' + escapeHtml(job.id) + '">' +
        '<span>' + escapeHtml(na.label) + '</span><span style="color:var(--neon-cyan); font-size:0.74rem;">' + escapeHtml(na.type || 'Guide') + ' →</span></a>';
    }).join('');

    container.innerHTML =
      '<div class="hcc-cv-hero">' +
        '<div>' +
          '<div style="display:flex; flex-wrap:wrap; gap:0.45rem; align-items:center;">' +
            '<span class="hcc-badge hcc-badge-type">' + escapeHtml(job.classification) + '</span>' +
            '<span class="hcc-badge ' + badgeCls + '">' + escapeHtml(job.evidenceStatus) + '</span>' +
            '<span style="font-family:var(--font-mono); font-size:0.75rem; color:#94a3b8;">📍 ' + escapeHtml(job.region) + ' · ' + escapeHtml(job.chapter) + '</span>' +
          '</div>' +
          '<h2 class="hcc-cv-title" id="hccCvTitle">' + escapeHtml(job.title) + '</h2>' +
          '<p class="hcc-cv-subtitle">' + escapeHtml(job.subtitle) + '</p>' +
          '<div class="hcc-hero-actions" style="margin-bottom:0;">' +
            '<a href="' + escapeHtml(job.canonicalUrl) + '" class="hcc-btn hcc-btn-primary" data-hcc-resource="canonical_walkthrough" data-job-id="' + escapeHtml(job.id) + '">' + (job.hasWalkthrough ? '📖 Open Full Walkthrough' : '📖 Open Canonical Guide') + '</a>' +
            '<a href="' + escapeHtml(mapHref) + '" class="hcc-btn hcc-btn-secondary" data-hcc-map-pin="' + escapeHtml(job.mapPinId || '') + '" data-job-id="' + escapeHtml(job.id) + '">🗺️ Open Verified Map Pin</a>' +
            (job.plannerUrl ? '<a href="' + escapeHtml(job.plannerUrl) + '" class="hcc-btn hcc-btn-pink" data-hcc-resource="heist_planner_deep" data-job-id="' + escapeHtml(job.id) + '">💰 Open in Heist Planner</a>' : '') +
          '</div>' +
        '</div>' +
        '<div>' +
          '<img src="' + escapeHtml(job.image) + '" alt="' + escapeHtml(job.imageAlt || job.title) + '" class="hcc-cv-hero-img" width="640" height="360">' +
        '</div>' +
      '</div>' +

      '<div class="hcc-cv-body">' +
        '<div class="hcc-cv-col">' +
          /* 1. MISSION OVERVIEW */
          '<section class="hcc-panel" aria-label="Mission Overview">' +
            '<h3>🎯 1. Mission Overview</h3>' +
            '<p><strong>Objective:</strong> ' + escapeHtml(job.overview.objective) + '</p>' +
            '<p><strong>Location:</strong> ' + escapeHtml(job.overview.location) + '</p>' +
            (job.overview.approaches && job.overview.approaches.length
              ? '<p style="margin-bottom:0.35rem;"><strong>Supported Approaches:</strong></p><ul>' +
                job.overview.approaches.map(function (a) { return '<li>' + escapeHtml(a) + '</li>'; }).join('') + '</ul>'
              : '') +
            (job.overview.requirements && job.overview.requirements.length
              ? '<p style="margin-bottom:0.35rem;"><strong>Confirmed Requirements:</strong></p><ul>' +
                job.overview.requirements.map(function (r) { return '<li>' + escapeHtml(r) + '</li>'; }).join('') + '</ul>'
              : '') +
          '</section>' +

          /* 2. WALKTHROUGH INTELLIGENCE */
          '<section class="hcc-panel" aria-label="Walkthrough Intelligence">' +
            '<h3>📖 2. Walkthrough &amp; Tactical Stages</h3>' +
            '<ol>' + (job.walkthroughStages || []).map(function (s) { return '<li>' + escapeHtml(s) + '</li>'; }).join('') + '</ol>' +
            (job.commonMistakes && job.commonMistakes.length
              ? '<p style="margin-bottom:0.3rem; color:#fca5a5;"><strong>Documented Common Mistakes:</strong></p><ul>' +
                job.commonMistakes.map(function (m) { return '<li>' + escapeHtml(m) + '</li>'; }).join('') + '</ul>'
              : '') +
            '<div style="margin-top:0.75rem;">' +
              '<a href="' + escapeHtml(job.canonicalUrl) + '" class="hcc-btn hcc-btn-secondary hcc-btn-sm" data-hcc-resource="walkthrough_detail" data-job-id="' + escapeHtml(job.id) + '">Read Complete Canonical Guide →</a>' +
            '</div>' +
          '</section>' +

          /* 3. CONNECTED WEAPONS & VEHICLES */
          '<section class="hcc-panel" aria-label="Connected Weapons and Vehicles">' +
            '<h3>⚔️ 3. Connected Weapons &amp; Vehicles</h3>' +
            '<p style="margin-bottom:0.55rem;"><strong>Relevant Weapons:</strong></p>' +
            weaponsHtml +
            '<p style="margin:0.95rem 0 0.55rem;"><strong>Relevant Vehicles:</strong></p>' +
            vehiclesHtml +
          '</section>' +
        '</div>' +

        '<div class="hcc-cv-col">' +
          /* 4. INTERACTIVE PREPARATION CHECKLIST */
          '<section class="hcc-panel" aria-label="Interactive Preparation Checklist">' +
            '<h3>' +
              '<span>✅ 4. Preparation Checklist</span>' +
              '<span style="font-family:var(--font-mono); font-size:0.82rem; color:var(--neon-green);">' + stats.done + '/' + stats.total + ' (' + stats.pct + '%)</span>' +
            '</h3>' +
            '<div class="hcc-progress-bar-wrap" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + stats.pct + '">' +
              '<div class="hcc-progress-bar-fill" style="width:' + stats.pct + '%"></div>' +
            '</div>' +
            '<div class="hcc-checklist-items">' + checklistHtml + '</div>' +
            '<div style="display:flex; flex-wrap:wrap; gap:0.5rem; justify-content:space-between; align-items:center; margin-top:0.65rem;">' +
              '<button type="button" class="hcc-btn hcc-btn-danger hcc-btn-sm" data-reset-job="' + escapeHtml(job.id) + '">↺ Reset This Job</button>' +
              '<span style="font-size:0.74rem; color:#94a3b8;">Saved locally in browser</span>' +
            '</div>' +
            completeBanner +
            (setupLinksHtml
              ? '<div style="margin-top:1rem;"><p style="margin-bottom:0.45rem;"><strong>Preparation &amp; Setup Guides:</strong></p><div class="hcc-link-list">' + setupLinksHtml + '</div></div>'
              : '') +
          '</section>' +

          /* 5. ESCAPE & LOCATION INTELLIGENCE */
          '<section class="hcc-panel" aria-label="Escape and Location Intelligence">' +
            '<h3>🗺️ 5. Escape &amp; Location Intelligence</h3>' +
            '<div class="hcc-link-list">' +
              '<a href="' + escapeHtml(mapHref) + '" class="hcc-link-row" data-hcc-map-pin="' + escapeHtml(job.mapPinId || '') + '" data-job-id="' + escapeHtml(job.id) + '">' +
                '<span>📍 ' + escapeHtml(job.mapPinLabel || 'Open Primary Map Pin') + '</span><span style="color:var(--neon-cyan);">Map →</span></a>' +
              (secondaryMapHref
                ? '<a href="' + escapeHtml(secondaryMapHref) + '" class="hcc-link-row" data-hcc-map-pin="' + escapeHtml(job.secondaryPinId || '') + '" data-job-id="' + escapeHtml(job.id) + '">' +
                  '<span>📍 ' + escapeHtml(job.secondaryPinLabel || 'Secondary Location Pin') + '</span><span style="color:var(--neon-cyan);">Map →</span></a>'
                : '') +
              (job.escapeUrl
                ? '<a href="' + escapeHtml(job.escapeUrl) + '" class="hcc-link-row" data-hcc-resource="escape_guide" data-job-id="' + escapeHtml(job.id) + '">' +
                  '<span>🚨 ' + escapeHtml(job.escapeLabel || 'Escape Route Guide') + '</span><span>Guide →</span></a>'
                : '') +
              (job.locationGuideUrl && job.locationGuideUrl !== job.canonicalUrl
                ? '<a href="' + escapeHtml(job.locationGuideUrl) + '" class="hcc-link-row" data-hcc-resource="location_guide" data-job-id="' + escapeHtml(job.id) + '">' +
                  '<span>🏛️ ' + escapeHtml(job.locationGuideLabel || 'Location Guide') + '</span><span>Guide →</span></a>'
                : '') +
            '</div>' +
          '</section>' +

          /* 6. REWARDS & NEXT ACTIVITIES */
          '<section class="hcc-panel" aria-label="Rewards and Next Activity">' +
            '<h3>💰 6. Rewards &amp; Next Activity</h3>' +
            '<div class="hcc-payout-box">' +
              '<div class="hcc-payout-row hcc-payout-confirmed">' +
                '<span class="hcc-payout-tag">Confirmed / Verified Status</span>' +
                escapeHtml(job.payoutConfirmed) +
              '</div>' +
              '<div class="hcc-payout-row hcc-payout-reported">' +
                '<span class="hcc-payout-tag">Reported / Variable Range</span>' +
                escapeHtml(job.payoutReported) +
              '</div>' +
            '</div>' +
            '<div style="display:flex; flex-wrap:wrap; gap:0.5rem; margin:0.8rem 0 1rem;">' +
              '<a href="' + escapeHtml(job.plannerUrl || '/heist-planner') + '" class="hcc-btn hcc-btn-secondary hcc-btn-sm" data-hcc-resource="planner_btn">🎯 Heist Planner</a>' +
              '<a href="/heist-payout-calculator" class="hcc-btn hcc-btn-secondary hcc-btn-sm" data-hcc-resource="payout_calc_btn">🧮 Payout Calculator</a>' +
            '</div>' +
            (nextLinksHtml
              ? '<p style="margin-bottom:0.45rem;"><strong>Continue to Next Activity:</strong></p><div class="hcc-link-list">' + nextLinksHtml + '</div>'
              : '') +
          '</section>' +
        '</div>' +
      '</div>';
  }

  function renderAll() {
    renderActivePanel();
    renderDirectory();
    renderCommandView();
  }

  function clearFilters() {
    filters.search = '';
    filters.type = 'all';
    filters.region = 'all';
    filters.onlyWalkthrough = false;
    filters.onlyConfirmed = false;

    var searchInput = document.getElementById('hccSearchInput');
    var regionSelect = document.getElementById('hccRegionFilter');
    var wtCheck = document.getElementById('hccOnlyWalkthrough');
    var confCheck = document.getElementById('hccOnlyConfirmed');
    if (searchInput) searchInput.value = '';
    if (regionSelect) regionSelect.value = 'all';
    if (wtCheck) wtCheck.checked = false;
    if (confCheck) confCheck.checked = false;

    document.querySelectorAll('.hcc-chip[data-filter-type]').forEach(function (btn) {
      var active = btn.getAttribute('data-filter-type') === 'all';
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
    renderDirectory();
  }

  function openModal(mode, triggerEl) {
    modalMode = mode;
    lastModalTrigger = triggerEl || document.activeElement;
    var backdrop = document.getElementById('hccModalBackdrop');
    var titleEl = document.getElementById('hccModalTitle');
    var descEl = document.getElementById('hccModalDesc');
    var ta = document.getElementById('hccModalTextarea');
    var copyBtn = document.getElementById('hccModalCopyBtn');
    var applyBtn = document.getElementById('hccModalApplyBtn');
    var errEl = document.getElementById('hccModalError');
    if (!backdrop || !ta) return;

    if (errEl) { errEl.style.display = 'none'; errEl.textContent = ''; }

    if (mode === 'export') {
      if (titleEl) titleEl.textContent = 'Export Heist Command Center Progress (JSON)';
      if (descEl) descEl.textContent = 'Copy this local JSON snapshot to back up or transfer your website checklist progress.';
      ta.readOnly = true;
      ta.value = JSON.stringify({
        version: SCHEMA_VERSION,
        activeJobId: state.activeJobId,
        checklists: state.checklists,
        recentJobIds: state.recentJobIds,
        updatedAt: state.updatedAt || new Date().toISOString()
      }, null, 2);
      if (copyBtn) copyBtn.style.display = '';
      if (applyBtn) applyBtn.style.display = 'none';
      trackEvent('heist_progress_export', {
        interaction_type: 'export_open',
        jobs_tracked: Object.keys(state.checklists).length
      });
    } else {
      if (titleEl) titleEl.textContent = 'Restore Heist Command Center Progress (JSON)';
      if (descEl) descEl.textContent = 'Paste a previously exported gta6_heist_command_v1 JSON backup below. Strict schema validation is enforced.';
      ta.readOnly = false;
      ta.value = '';
      if (copyBtn) copyBtn.style.display = 'none';
      if (applyBtn) applyBtn.style.display = '';
    }

    backdrop.classList.add('is-open');
    ta.focus();
  }

  function closeModal() {
    var backdrop = document.getElementById('hccModalBackdrop');
    if (backdrop) backdrop.classList.remove('is-open');
    if (lastModalTrigger && typeof lastModalTrigger.focus === 'function') {
      lastModalTrigger.focus();
    }
  }

  function applyImportJson() {
    var ta = document.getElementById('hccModalTextarea');
    var errEl = document.getElementById('hccModalError');
    if (!ta) return;

    var rawText = ta.value.trim();
    if (!rawText) {
      if (errEl) { errEl.textContent = 'Please paste a JSON backup payload first.'; errEl.style.display = 'block'; }
      return;
    }
    if (rawText.length > MAX_IMPORT_BYTES) {
      if (errEl) { errEl.textContent = 'Backup payload exceeds the 32KB safety limit.'; errEl.style.display = 'block'; }
      return;
    }
    var parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch (e) {
      if (errEl) { errEl.textContent = 'Invalid JSON syntax. Please check your backup text.'; errEl.style.display = 'block'; }
      return;
    }

    var validated = sanitizeLoadedState(parsed);
    if (!validated.ok) {
      if (errEl) { errEl.textContent = validated.error; errEl.style.display = 'block'; }
      return;
    }

    state = validated.data;
    saveState();
    renderAll();
    closeModal();
    showStatus('Progress backup validated and restored successfully.', false);
    trackEvent('heist_progress_export', {
      interaction_type: 'import_restore',
      jobs_tracked: Object.keys(state.checklists).length
    });
  }

  function bindEvents() {
    var searchInput = document.getElementById('hccSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', function () {
        filters.search = searchInput.value;
        renderDirectory();
      });
    }

    var regionSelect = document.getElementById('hccRegionFilter');
    if (regionSelect) {
      regionSelect.addEventListener('change', function () {
        filters.region = regionSelect.value;
        renderDirectory();
      });
    }

    var wtCheck = document.getElementById('hccOnlyWalkthrough');
    if (wtCheck) {
      wtCheck.addEventListener('change', function () {
        filters.onlyWalkthrough = wtCheck.checked;
        renderDirectory();
      });
    }

    var confCheck = document.getElementById('hccOnlyConfirmed');
    if (confCheck) {
      confCheck.addEventListener('change', function () {
        filters.onlyConfirmed = confCheck.checked;
        renderDirectory();
      });
    }

    document.querySelectorAll('.hcc-chip[data-filter-type]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        filters.type = btn.getAttribute('data-filter-type') || 'all';
        document.querySelectorAll('.hcc-chip[data-filter-type]').forEach(function (other) {
          var active = other === btn;
          other.classList.toggle('is-active', active);
          other.setAttribute('aria-pressed', active ? 'true' : 'false');
        });
        renderDirectory();
      });
    });

    var clearBtn = document.getElementById('hccClearFiltersBtn');
    if (clearBtn) clearBtn.addEventListener('click', clearFilters);

    var resumeBtn = document.getElementById('hccResumeActiveBtn');
    if (resumeBtn) {
      resumeBtn.addEventListener('click', function () {
        var section = document.getElementById('commandViewSection');
        if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }

    var exportBtn = document.getElementById('hccExportBtn');
    if (exportBtn) exportBtn.addEventListener('click', function () { openModal('export', exportBtn); });

    var importBtn = document.getElementById('hccImportBtn');
    if (importBtn) importBtn.addEventListener('click', function () { openModal('import', importBtn); });

    var resetAllBtn = document.getElementById('hccResetAllBtn');
    if (resetAllBtn) resetAllBtn.addEventListener('click', resetAllProgress);

    var modalCloseBtn = document.getElementById('hccModalCloseBtn');
    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);

    var modalBackdrop = document.getElementById('hccModalBackdrop');
    if (modalBackdrop) {
      modalBackdrop.addEventListener('click', function (e) {
        if (e.target === modalBackdrop) closeModal();
      });
    }

    var modalCopyBtn = document.getElementById('hccModalCopyBtn');
    if (modalCopyBtn) {
      modalCopyBtn.addEventListener('click', function () {
        var ta = document.getElementById('hccModalTextarea');
        if (!ta) return;
        ta.select();
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(ta.value).catch(function () {});
        }
        showStatus('Copied local checklist JSON backup to clipboard.', false);
      });
    }

    var modalApplyBtn = document.getElementById('hccModalApplyBtn');
    if (modalApplyBtn) modalApplyBtn.addEventListener('click', applyImportJson);

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        var bd = document.getElementById('hccModalBackdrop');
        if (bd && bd.classList.contains('is-open')) {
          closeModal();
        }
      }
    });

    // Delegated click & change events inside app root
    var root = document.getElementById('heistCommandApp');
    if (root) {
      root.addEventListener('click', function (e) {
        var selectBtn = e.target.closest('[data-select-job]');
        if (selectBtn) {
          var jId = selectBtn.getAttribute('data-select-job');
          var src = selectBtn.getAttribute('data-select-source') || 'directory_card';
          selectJob(jId, { scrollToView: true, source: src });
          return;
        }

        var resetBtn = e.target.closest('[data-reset-job]');
        if (resetBtn) {
          resetJob(resetBtn.getAttribute('data-reset-job'));
          return;
        }

        var mapLink = e.target.closest('[data-hcc-map-pin]');
        if (mapLink) {
          trackEvent('heist_map_open', {
            job_id: mapLink.getAttribute('data-job-id') || state.activeJobId,
            pin_id: mapLink.getAttribute('data-hcc-map-pin') || 'map_root',
            interaction_type: 'map_deep_link'
          });
          return;
        }

        var resLink = e.target.closest('[data-hcc-resource]');
        if (resLink) {
          trackEvent('heist_resource_click', {
            resource_type: resLink.getAttribute('data-hcc-resource') || 'resource',
            job_id: resLink.getAttribute('data-job-id') || state.activeJobId,
            interaction_type: 'resource_click'
          });
        }
      });

      root.addEventListener('change', function (e) {
        var cb = e.target.closest('input[data-check-job][data-check-step]');
        if (!cb) return;
        toggleStep(cb.getAttribute('data-check-job'), cb.getAttribute('data-check-step'), cb.checked);
      });
    }

    window.addEventListener('popstate', function () {
      var params = new URLSearchParams(window.location.search);
      var jobParam = params.get('job');
      if (jobParam && jobsById[jobParam]) {
        selectJob(jobParam, { skipHistory: true, silentTrack: true });
      }
    });
  }

  function init() {
    fetch('/data/heist-command-center.json')
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (payload) {
        jobs = Array.isArray(payload && payload.jobs) ? payload.jobs : [];
        jobsById = Object.create(null);
        for (var i = 0; i < jobs.length; i++) {
          jobsById[jobs[i].id] = jobs[i];
        }

        loadState();

        var params = new URLSearchParams(window.location.search);
        var requestedJob = params.get('job');
        if (requestedJob && jobsById[requestedJob]) {
          state.activeJobId = requestedJob;
        } else if (!jobsById[state.activeJobId] && jobs[0]) {
          state.activeJobId = jobs[0].id;
        }
        recordRecent(state.activeJobId);
        saveState();

        bindEvents();
        renderAll();

        // Cross-tab live sync with My Leonida dashboard
        window.addEventListener('storage', function (e) {
          if (e.key === STORAGE_KEY) {
            loadState();
            renderAll();
          }
        });

        trackEvent('heist_command_open', {
          active_job_id: state.activeJobId,
          total_jobs: jobs.length,
          interaction_type: 'page_load'
        });
      })
      .catch(function () {
        var cv = document.getElementById('hccCommandViewBody');
        if (cv) {
          cv.innerHTML = '<div style="padding:1.5rem; color:#fca5a5;">Unable to load mission data right now. All canonical walkthrough links in the directory above remain directly accessible.</div>';
        }
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
