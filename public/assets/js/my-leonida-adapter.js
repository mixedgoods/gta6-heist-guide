// ==========================================================================
// GTA6HEISTGUIDE.COM — MY LEONIDA UNIFIED PROGRESS ADAPTER (Phase 28)
// Backward-compatible adapter over existing browser-local stores:
//   - window.GTA6Progress (gta6hg_progress_v1 + legacy gta6_unified_progress_v1)
//   - gta6_heist_command_v1 (Phase 27 Heist Command Center checklists)
//   - gta6_recent_pages_v1 (Phase 26 Continue Where You Left Off)
// Does NOT create a competing store. Preserves all existing user data and
// captures recoverable copies if any stored JSON value is malformed.
// ==========================================================================
(function (global) {
  'use strict';

  if (global.GTA6MyLeonida && global.GTA6MyLeonida.__version === '28.1') {
    return;
  }

  var SCHEMA_VERSION = 2;
  var APP_ID = 'gta6heistguide_my_leonida_v2';
  var HEIST_CMD_KEY = 'gta6_heist_command_v1';
  var RECENT_PAGES_KEY = 'gta6_recent_pages_v1';
  var CORRUPT_RECOVERY_KEY = 'gta6_progress_corrupt_recovery_v1';
  var PRE_IMPORT_BACKUP_KEY = 'gta6_my_leonida_pre_import_backup_v1';
  var MAX_IMPORT_BYTES = 524288; // 512 KB safety cap

  var FORBIDDEN_KEYS = {
    '__proto__': true,
    'constructor': true,
    'prototype': true
  };

  // Reject HTML, script tags, event handlers, or executable URI schemes in imports
  var DANGEROUS_CONTENT_RE = /<\s*\/?\s*(script|iframe|object|embed|svg|style|link|meta|form|img|body|html)\b|javascript\s*:|vbscript\s*:|data\s*:\s*text\/html|\bon(error|load|click|mouseover|focus|blur|input|submit)\s*=|\beval\s*\(|\bFunction\s*\(/i;

  var CORE_HEIST_SYNC_MAP = {
    'the-cartel-heist': 'heist:the-cartel-heist',
    'vcia-takedown': 'heist:vcia-takedown',
    'shops-and-stickups': 'heist:shops-and-stickups',
    'pawn-shops': 'heist:pawn-shops',
    'jewelry-stores': 'heist:jewelry-stores',
    'small-banks-payday-loans': 'heist:small-banks-payday-loans',
    'large-bank-vaults': 'heist:large-bank-vaults',
    'armored-trucks-gang-ops': 'heist:armored-trucks-gang-ops'
  };

  function safeReadLS(key) {
    try {
      return global.localStorage ? global.localStorage.getItem(key) : null;
    } catch (e) {
      return null;
    }
  }

  function safeWriteLS(key, val) {
    try {
      if (global.localStorage) {
        global.localStorage.setItem(key, val);
        return true;
      }
    } catch (e) {}
    return false;
  }

  function safeRemoveLS(key) {
    try {
      if (global.localStorage) {
        global.localStorage.removeItem(key);
        return true;
      }
    } catch (e) {}
    return false;
  }

  function preserveCorruptCopy(sourceKey, rawValue) {
    if (typeof rawValue !== 'string' || !rawValue.length) return;
    try {
      var existing = safeReadLS(CORRUPT_RECOVERY_KEY);
      var bag = existing ? JSON.parse(existing) : {};
      if (!bag || typeof bag !== 'object' || Array.isArray(bag)) bag = {};
      bag[sourceKey] = {
        capturedAt: new Date().toISOString(),
        raw: rawValue.slice(0, 65536)
      };
      safeWriteLS(CORRUPT_RECOVERY_KEY, JSON.stringify(bag));
    } catch (e) {}
  }

  function getRecoveryInfo() {
    try {
      var raw = safeReadLS(CORRUPT_RECOVERY_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;
      var keys = Object.keys(parsed);
      return keys.length ? parsed : null;
    } catch (e) {
      return null;
    }
  }

  function hasDangerousContent(value, depth) {
    if (depth > 12) return true;
    if (typeof value === 'string') {
      return DANGEROUS_CONTENT_RE.test(value);
    }
    if (Array.isArray(value)) {
      for (var i = 0; i < value.length; i++) {
        if (hasDangerousContent(value[i], depth + 1)) return true;
      }
      return false;
    }
    if (value && typeof value === 'object') {
      var keys = Object.keys(value);
      for (var k = 0; k < keys.length; k++) {
        var key = keys[k];
        if (FORBIDDEN_KEYS[key] || DANGEROUS_CONTENT_RE.test(key)) return true;
        if (hasDangerousContent(value[key], depth + 1)) return true;
      }
    }
    return false;
  }

  function emitUpdate(category, source) {
    try {
      global.dispatchEvent(new CustomEvent('gta6-my-leonida-updated', {
        detail: { category: category || 'all', source: source || 'adapter' }
      }));
    } catch (e) {}
  }

  // ---- Phase 27 Heist Command Center Adapter (gta6_heist_command_v1) ----
  function createEmptyHeistCommand() {
    return {
      version: 1,
      activeJobId: null,
      checklists: {},
      recentJobIds: [],
      updatedAt: null
    };
  }

  function sanitizeHeistCommand(raw) {
    var out = createEmptyHeistCommand();
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
    if (raw.version !== undefined && raw.version !== 1) return null;
    if (typeof raw.activeJobId === 'string' && raw.activeJobId.trim() && raw.activeJobId.length <= 80) {
      out.activeJobId = raw.activeJobId.trim();
    }
    if (raw.checklists && typeof raw.checklists === 'object' && !Array.isArray(raw.checklists)) {
      Object.keys(raw.checklists).forEach(function (jobId) {
        if (FORBIDDEN_KEYS[jobId] || typeof jobId !== 'string' || jobId.length > 80) return;
        var steps = raw.checklists[jobId];
        if (!steps || typeof steps !== 'object' || Array.isArray(steps)) return;
        var cleanSteps = {};
        Object.keys(steps).forEach(function (stepId) {
          if (FORBIDDEN_KEYS[stepId] || typeof stepId !== 'string' || stepId.length > 80) return;
          if (typeof steps[stepId] === 'boolean') {
            cleanSteps[stepId] = steps[stepId];
          }
        });
        out.checklists[jobId] = cleanSteps;
      });
    }
    if (Array.isArray(raw.recentJobIds)) {
      out.recentJobIds = raw.recentJobIds.filter(function (id) {
        return typeof id === 'string' && id.trim() && id.length <= 80;
      }).slice(0, 6);
    }
    if (typeof raw.updatedAt === 'string') {
      out.updatedAt = raw.updatedAt;
    }
    return out;
  }

  function getHeistCommandState() {
    var raw = safeReadLS(HEIST_CMD_KEY);
    if (!raw) return createEmptyHeistCommand();
    try {
      var parsed = JSON.parse(raw);
      var clean = sanitizeHeistCommand(parsed);
      if (clean) return clean;
      preserveCorruptCopy(HEIST_CMD_KEY, raw);
    } catch (e) {
      preserveCorruptCopy(HEIST_CMD_KEY, raw);
    }
    return createEmptyHeistCommand();
  }

  function saveHeistCommandState(nextState) {
    var clean = sanitizeHeistCommand(nextState) || createEmptyHeistCommand();
    clean.updatedAt = new Date().toISOString();
    safeWriteLS(HEIST_CMD_KEY, JSON.stringify(clean));
    emitUpdate('heists', 'heist_command');
    return clean;
  }

  // ---- Phase 26 Recent Pages Adapter (gta6_recent_pages_v1) ----
  function sanitizeRecentPages(raw) {
    if (!Array.isArray(raw)) return null;
    var seen = Object.create(null);
    var out = [];
    for (var i = 0; i < raw.length && out.length < 12; i++) {
      var item = raw[i];
      if (!item || typeof item !== 'object' || Array.isArray(item)) continue;
      var p = typeof item.path === 'string' ? item.path.trim() : '';
      var t = typeof item.title === 'string' ? item.title.trim() : '';
      if (!p || p.charAt(0) !== '/' || p.indexOf('//') === 0 || p.indexOf('/my-leonida') === 0 || p.length > 180) continue;
      if (seen[p]) continue;
      seen[p] = true;
      out.push({
        path: p,
        title: (t || p).slice(0, 80),
        ts: typeof item.ts === 'number' && isFinite(item.ts) ? item.ts : Date.now()
      });
    }
    return out;
  }

  function getRecentPages() {
    var raw = safeReadLS(RECENT_PAGES_KEY);
    if (!raw) return [];
    try {
      var parsed = JSON.parse(raw);
      var clean = sanitizeRecentPages(parsed);
      if (clean) return clean;
      preserveCorruptCopy(RECENT_PAGES_KEY, raw);
    } catch (e) {
      preserveCorruptCopy(RECENT_PAGES_KEY, raw);
    }
    return [];
  }

  function saveRecentPages(list) {
    var clean = sanitizeRecentPages(list) || [];
    safeWriteLS(RECENT_PAGES_KEY, JSON.stringify(clean.slice(0, 6)));
    emitUpdate('recent', 'recent_pages');
    return clean;
  }

  // ---- Core Progress Helpers (delegating to window.GTA6Progress) ----
  function getProgressStore() {
    if (global.GTA6Progress && typeof global.GTA6Progress.getState === 'function') {
      return global.GTA6Progress.getState();
    }
    return {
      schemaVersion: 1,
      app: 'gta6heistguide_progress_v1',
      updatedAt: null,
      completed: {},
      savePlanner: null,
      mapCustomPins: [],
      heistBuilds: [],
      toolStates: {},
      notes: {}
    };
  }

  function getLoadout() {
    var st = getProgressStore();
    var raw = (st.toolStates && st.toolStates.myLeonidaLoadout) || {};
    return {
      sidearm: typeof raw.sidearm === 'string' ? raw.sidearm : '',
      primary: typeof raw.primary === 'string' ? raw.primary : '',
      heavy: typeof raw.heavy === 'string' ? raw.heavy : '',
      utility: typeof raw.utility === 'string' ? raw.utility : ''
    };
  }

  function setLoadoutSlot(slot, weaponId) {
    if (['sidearm', 'primary', 'heavy', 'utility'].indexOf(slot) === -1) return getLoadout();
    var cur = getLoadout();
    cur[slot] = typeof weaponId === 'string' ? weaponId.trim() : '';
    if (global.GTA6Progress && typeof global.GTA6Progress.setToolState === 'function') {
      global.GTA6Progress.setToolState('myLeonidaLoadout', cur, false);
    }
    emitUpdate('weapons', 'loadout');
    return cur;
  }

  function isPinDone(pinId) {
    return Boolean(global.GTA6Progress && global.GTA6Progress.isDone('pin:' + pinId));
  }

  function togglePinComplete(pinId) {
    if (!pinId || !global.GTA6Progress) return false;
    var next = !isPinDone(pinId);
    global.GTA6Progress.setDone('pin:' + pinId, next);
    emitUpdate('pins', 'pin_toggle');
    return next;
  }

  function isPinFavorite(pinId) {
    return Boolean(global.GTA6Progress && global.GTA6Progress.isDone('pin-fav:' + pinId));
  }

  function togglePinFavorite(pinId) {
    if (!pinId || !global.GTA6Progress) return false;
    var next = !isPinFavorite(pinId);
    global.GTA6Progress.setDone('pin-fav:' + pinId, next);
    emitUpdate('pins', 'pin_favorite');
    return next;
  }

  function toggleHeistStep(jobId, stepId, checked, jobObj) {
    if (!jobId || !stepId) return null;
    var hState = getHeistCommandState();
    if (!hState.checklists[jobId]) hState.checklists[jobId] = {};
    hState.checklists[jobId][stepId] = Boolean(checked);
    hState.activeJobId = jobId;
    hState.recentJobIds = [jobId].concat(hState.recentJobIds.filter(function (id) { return id !== jobId; })).slice(0, 6);
    var saved = saveHeistCommandState(hState);

    // Sync 100% completion to window.GTA6Progress for the 8 core heist/robbery tiers
    if (jobObj && Array.isArray(jobObj.checklist) && jobObj.checklist.length > 0 && CORE_HEIST_SYNC_MAP[jobId]) {
      var doneCount = 0;
      for (var i = 0; i < jobObj.checklist.length; i++) {
        if (saved.checklists[jobId] && saved.checklists[jobId][jobObj.checklist[i].id] === true) {
          doneCount++;
        }
      }
      if (global.GTA6Progress && typeof global.GTA6Progress.setDone === 'function') {
        global.GTA6Progress.setDone(CORE_HEIST_SYNC_MAP[jobId], doneCount === jobObj.checklist.length);
      }
    }
    return saved;
  }

  function toggleDbOwned(category, itemId) {
    if (!global.GTA6Progress || !category || !itemId) return false;
    var next = !global.GTA6Progress.isDbOwned(category, itemId);
    global.GTA6Progress.setDbOwned(category, itemId, next);
    emitUpdate(category, 'db_owned');
    return next;
  }

  function toggleDbFavorite(category, itemId) {
    if (!global.GTA6Progress || !category || !itemId) return false;
    var next = !global.GTA6Progress.isDbFavorite(category, itemId);
    global.GTA6Progress.setDbFavorite(category, itemId, next);
    emitUpdate(category, 'db_fav');
    return next;
  }

  // ---- Wildlife Verified vs. Reference Photo Helper ----
  function isVerifiedInGameAnimal(animal) {
    if (!animal || typeof animal !== 'object') return false;
    if (animal.isRealWorldReference === true) return false;
    if (animal.countsTowardCompletion === false) return false;
    return animal.gta6PresenceConfirmed === true && animal.countsTowardCompletion === true;
  }

  // ---- Unified Snapshot Builder (Real Data Only, Zero Fabrication) ----
  function computeSnapshot(datasets) {
    datasets = datasets || {};
    var pins = Array.isArray(datasets.pins) ? datasets.pins : [];
    var jobs = Array.isArray(datasets.jobs) ? datasets.jobs : [];
    var vehicles = Array.isArray(datasets.vehicles) ? datasets.vehicles : [];
    var weapons = Array.isArray(datasets.weapons) ? datasets.weapons : [];
    var properties = Array.isArray(datasets.properties) ? datasets.properties : [];
    var animals = Array.isArray(datasets.animals) ? datasets.animals : [];
    var gunStores = Array.isArray(datasets.gunStores) ? datasets.gunStores : [];

    var pStore = getProgressStore();
    var completed = pStore.completed || {};
    var hState = getHeistCommandState();
    var recentPages = getRecentPages();
    var loadout = getLoadout();

    // 1. Map Exploration (only counting verified pin IDs from map-pins.json)
    var pinById = Object.create(null);
    var catStats = Object.create(null);
    var completedPins = [];
    var unvisitedPins = [];
    var favoritePins = [];

    pins.forEach(function (pin) {
      if (!pin || !pin.id) return;
      pinById[pin.id] = pin;
      var catName = pin.categoryName || pin.category || 'Other';
      if (!catStats[catName]) {
        catStats[catName] = { name: catName, total: 0, done: 0, remaining: 0 };
      }
      catStats[catName].total++;
      var isDone = completed['pin:' + pin.id] === true;
      var isFav = completed['pin-fav:' + pin.id] === true;
      if (isDone) {
        completedPins.push(pin);
        catStats[catName].done++;
      } else {
        unvisitedPins.push(pin);
        catStats[catName].remaining++;
      }
      if (isFav) favoritePins.push(pin);
    });

    var mapTotal = pins.length;
    var mapDone = completedPins.length;
    var mapPct = mapTotal > 0 ? Math.round((mapDone / mapTotal) * 100) : 0;
    var categoriesRemaining = Object.keys(catStats)
      .map(function (k) { return catStats[k]; })
      .filter(function (c) { return c.remaining > 0; })
      .sort(function (a, b) { return b.remaining - a.remaining; });

    // 2. Heists (Phase 27 checklists + GTA6Progress heist:*)
    var heistItems = jobs.map(function (job) {
      var steps = Array.isArray(job.checklist) ? job.checklist : [];
      var stepMap = (hState.checklists && hState.checklists[job.id]) || {};
      var doneSteps = 0;
      var incompleteSteps = [];
      steps.forEach(function (st) {
        if (stepMap[st.id] === true) {
          doneSteps++;
        } else {
          incompleteSteps.push(st);
        }
      });
      var globalDone = completed['heist:' + job.id] === true;
      if (globalDone && steps.length > 0 && doneSteps === 0) {
        // User marked heist complete in Heist Planner / Save Planner before Phase 27 checklists
        doneSteps = steps.length;
        incompleteSteps = [];
      }
      var pct = steps.length > 0 ? Math.round((doneSteps / steps.length) * 100) : (globalDone ? 100 : 0);
      var isCompleted = (steps.length > 0 && doneSteps === steps.length) || globalDone;
      var isActive = !isCompleted && (doneSteps > 0 || hState.activeJobId === job.id);
      return {
        job: job,
        doneSteps: doneSteps,
        totalSteps: steps.length,
        pct: pct,
        incompleteSteps: incompleteSteps,
        isCompleted: isCompleted,
        isActive: isActive,
        inProgress: !isCompleted && doneSteps > 0
      };
    });

    var completedJobs = heistItems.filter(function (h) { return h.isCompleted; });
    var activeJobs = heistItems.filter(function (h) { return h.inProgress; });
    var totalChecklistSteps = heistItems.reduce(function (acc, h) { return acc + h.totalSteps; }, 0);
    var doneChecklistSteps = heistItems.reduce(function (acc, h) { return acc + h.doneSteps; }, 0);
    var heistPrepPct = totalChecklistSteps > 0 ? Math.round((doneChecklistSteps / totalChecklistSteps) * 100) : 0;

    // 3. Garage (33 Vehicles)
    var ownedVehicles = vehicles.filter(function (v) { return completed['db:owned:vehicles:' + v.id] === true; });
    var favVehicles = vehicles.filter(function (v) { return completed['db:fav:vehicles:' + v.id] === true; });

    // 4. Armory (25 Weapons)
    var ownedWeapons = weapons.filter(function (w) { return completed['db:owned:weapons:' + w.id] === true; });
    var favWeapons = weapons.filter(function (w) { return completed['db:fav:weapons:' + w.id] === true; });
    var loadoutCount = ['sidearm', 'primary', 'heavy', 'utility'].filter(function (k) { return Boolean(loadout[k]); }).length;

    // 5. Properties (27), Wildlife (49 = 7 Verified + 42 Reference), Gun Stores (24)
    var ownedProperties = properties.filter(function (p) { return completed['db:owned:properties:' + p.id] === true; });
    var favProperties = properties.filter(function (p) { return completed['db:fav:properties:' + p.id] === true; });

    var verifiedAnimals = animals.filter(isVerifiedInGameAnimal);
    var referenceAnimals = animals.filter(function (a) { return !isVerifiedInGameAnimal(a); });
    // Only verified in-game animals count toward confirmed wildlife discoveries!
    var discoveredVerifiedAnimals = verifiedAnimals.filter(function (a) {
      return completed['db:owned:animals:' + a.id] === true;
    });
    var bookmarkedVerifiedAnimals = verifiedAnimals.filter(function (a) {
      return completed['db:fav:animals:' + a.id] === true;
    });
    var viewedReferenceAnimals = referenceAnimals.filter(function (a) {
      return completed['db:owned:animals:' + a.id] === true;
    });
    var bookmarkedReferenceAnimals = referenceAnimals.filter(function (a) {
      return completed['db:fav:animals:' + a.id] === true;
    });

    var visitedGunStores = gunStores.filter(function (g) { return completed['db:owned:gun-stores:' + g.id] === true; });
    var favGunStores = gunStores.filter(function (g) { return completed['db:fav:gun-stores:' + g.id] === true; });

    // 6. Save Planner (15 Slots)
    var savedSlots = Object.keys(completed).filter(function (k) { return completed[k] === true && k.indexOf('slot:') === 0; }).length;
    var preflightDone = Object.keys(completed).filter(function (k) { return completed[k] === true && k.indexOf('preflight:') === 0; }).length;

    // 7. Overall Verified Exploration Progress (strictly real verified trackables:
    //    185 map pins + total heist checklist steps + 7 confirmed GTA VI wildlife + 27 properties + 24 gun outlets)
    //    Reference photos are EXCLUDED from overall verified completion!
    var overallDenom = mapTotal + totalChecklistSteps + verifiedAnimals.length + properties.length + gunStores.length;
    var overallNum = mapDone + doneChecklistSteps + discoveredVerifiedAnimals.length + ownedProperties.length + visitedGunStores.length;
    var overallPct = overallDenom > 0 ? Math.round((overallNum / overallDenom) * 100) : 0;

    var hasAnyActivity = (
      mapDone > 0 ||
      favoritePins.length > 0 ||
      (pStore.mapCustomPins && pStore.mapCustomPins.length > 0) ||
      doneChecklistSteps > 0 ||
      completedJobs.length > 0 ||
      ownedVehicles.length > 0 ||
      favVehicles.length > 0 ||
      ownedWeapons.length > 0 ||
      favWeapons.length > 0 ||
      loadoutCount > 0 ||
      ownedProperties.length > 0 ||
      favProperties.length > 0 ||
      discoveredVerifiedAnimals.length > 0 ||
      bookmarkedVerifiedAnimals.length > 0 ||
      viewedReferenceAnimals.length > 0 ||
      bookmarkedReferenceAnimals.length > 0 ||
      visitedGunStores.length > 0 ||
      favGunStores.length > 0 ||
      savedSlots > 0 ||
      recentPages.length > 0
    );

    return {
      hasAnyActivity: hasAnyActivity,
      updatedAt: pStore.updatedAt || hState.updatedAt || null,
      overall: {
        completed: overallNum,
        total: overallDenom,
        pct: overallPct
      },
      map: {
        total: mapTotal,
        completed: mapDone,
        unvisited: unvisitedPins.length,
        pct: mapPct,
        categoriesRemaining: categoriesRemaining,
        favoritePins: favoritePins,
        completedPins: completedPins,
        unvisitedPins: unvisitedPins,
        customPins: pStore.mapCustomPins || []
      },
      heists: {
        items: heistItems,
        totalJobs: jobs.length,
        activeJobs: activeJobs,
        completedJobs: completedJobs,
        activeJobId: hState.activeJobId,
        recentJobIds: hState.recentJobIds || [],
        doneSteps: doneChecklistSteps,
        totalSteps: totalChecklistSteps,
        prepPct: heistPrepPct
      },
      garage: {
        total: vehicles.length,
        owned: ownedVehicles,
        favorites: favVehicles
      },
      armory: {
        total: weapons.length,
        owned: ownedWeapons,
        favorites: favWeapons,
        loadout: loadout,
        loadoutCount: loadoutCount
      },
      properties: {
        total: properties.length,
        explored: ownedProperties,
        bookmarked: favProperties
      },
      wildlife: {
        totalCatalog: animals.length,
        verifiedTotal: verifiedAnimals.length,
        verifiedDiscovered: discoveredVerifiedAnimals,
        verifiedBookmarked: bookmarkedVerifiedAnimals,
        referenceTotal: referenceAnimals.length,
        referenceViewed: viewedReferenceAnimals,
        referenceBookmarked: bookmarkedReferenceAnimals
      },
      gunStores: {
        total: gunStores.length,
        explored: visitedGunStores,
        bookmarked: favGunStores
      },
      savePlanner: {
        slots: savedSlots,
        totalSlots: 15,
        preflight: preflightDone
      },
      recentPages: recentPages
    };
  }

  // ---- Unified Export (Schema v2) ----
  function buildExportPayload() {
    return {
      schemaVersion: SCHEMA_VERSION,
      app: APP_ID,
      exportedAt: new Date().toISOString(),
      progress: getProgressStore(),
      heistCommand: getHeistCommandState(),
      recentPages: getRecentPages()
    };
  }

  function exportJSON() {
    var payload = buildExportPayload();
    var json = JSON.stringify(payload, null, 2);
    try {
      var dateTag = new Date().toISOString().slice(0, 10);
      var blob = new Blob([json], { type: 'application/json' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'my-leonida-progress-backup-' + dateTag + '.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {}
    return json;
  }

  // ---- Strict Import Validation (Schema v2 + backward-compatible v1) ----
  function validateImportJSON(rawText) {
    if (typeof rawText !== 'string' || !rawText.trim()) {
      return { ok: false, error: 'Backup file is empty.' };
    }
    var byteLen = rawText.length;
    try {
      if (typeof Blob === 'function') {
        byteLen = new Blob([rawText]).size;
      }
    } catch (e) {}
    if (byteLen > MAX_IMPORT_BYTES) {
      return { ok: false, error: 'Backup file exceeds the 512 KB maximum size limit.' };
    }
    if (DANGEROUS_CONTENT_RE.test(rawText)) {
      return { ok: false, error: 'Rejected: backup contains disallowed HTML, script, or executable content.' };
    }

    var parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch (e) {
      return { ok: false, error: 'Malformed JSON: unable to parse backup file.' };
    }

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return { ok: false, error: 'Invalid backup structure: root value must be a JSON object.' };
    }
    if (hasDangerousContent(parsed, 0)) {
      return { ok: false, error: 'Rejected: backup contains forbidden keys or unsafe content.' };
    }

    // Format A: Phase 28 My Leonida Unified Backup (schemaVersion: 2)
    if (parsed.app === APP_ID || parsed.schemaVersion === SCHEMA_VERSION) {
      if (parsed.schemaVersion !== SCHEMA_VERSION) {
        return { ok: false, error: 'Unsupported My Leonida schemaVersion (expected version ' + SCHEMA_VERSION + ').' };
      }
      if (!parsed.progress || typeof parsed.progress !== 'object' || Array.isArray(parsed.progress)) {
        return { ok: false, error: 'Missing or invalid "progress" section in My Leonida backup.' };
      }
      var progCheck = global.GTA6Progress && typeof global.GTA6Progress.validateJSONString === 'function'
        ? global.GTA6Progress.validateJSONString(JSON.stringify(parsed.progress))
        : { ok: true, data: parsed.progress };
      if (!progCheck.ok) {
        return { ok: false, error: 'Invalid progress section: ' + progCheck.error };
      }
      var cleanHeist = parsed.heistCommand !== undefined ? sanitizeHeistCommand(parsed.heistCommand) : createEmptyHeistCommand();
      if (parsed.heistCommand !== undefined && !cleanHeist) {
        return { ok: false, error: 'Invalid "heistCommand" section in My Leonida backup.' };
      }
      var cleanRecent = parsed.recentPages !== undefined ? sanitizeRecentPages(parsed.recentPages) : [];
      if (parsed.recentPages !== undefined && !cleanRecent) {
        return { ok: false, error: 'Invalid "recentPages" section in My Leonida backup.' };
      }
      return {
        ok: true,
        format: 'my-leonida-v2',
        progressJSON: JSON.stringify(parsed.progress),
        heistCommand: cleanHeist,
        recentPages: cleanRecent,
        summary: {
          completedKeys: Object.keys((progCheck.data && progCheck.data.completed) || {}).length,
          heistJobsTracked: Object.keys(cleanHeist.checklists || {}).length,
          recentPages: cleanRecent.length
        }
      };
    }

    // Format B: Phase 27 Heist Command Center backup (version: 1, checklists)
    if (parsed.version === 1 && parsed.checklists && typeof parsed.checklists === 'object' && !parsed.completed) {
      var cleanH = sanitizeHeistCommand(parsed);
      if (!cleanH) {
        return { ok: false, error: 'Invalid Heist Command Center backup structure.' };
      }
      return {
        ok: true,
        format: 'heist-command-v1',
        progressJSON: null,
        heistCommand: cleanH,
        recentPages: null,
        summary: {
          completedKeys: 0,
          heistJobsTracked: Object.keys(cleanH.checklists || {}).length,
          recentPages: 0
        }
      };
    }

    // Format C: Legacy GTA6Progress v1 or 15-Slot Save Planner backup
    if (global.GTA6Progress && typeof global.GTA6Progress.validateJSONString === 'function') {
      var legacyCheck = global.GTA6Progress.validateJSONString(rawText);
      if (legacyCheck.ok) {
        return {
          ok: true,
          format: 'progress-v1',
          progressJSON: rawText,
          heistCommand: null,
          recentPages: null,
          summary: {
            completedKeys: Object.keys((legacyCheck.data && legacyCheck.data.completed) || {}).length,
            heistJobsTracked: 0,
            recentPages: 0
          }
        };
      }
      return { ok: false, error: legacyCheck.error };
    }

    return { ok: false, error: 'Unrecognized backup file format. Expected a My Leonida or GTA6HeistGuide JSON backup.' };
  }

  function applyImportJSON(rawText) {
    var check = validateImportJSON(rawText);
    if (!check.ok) return check;

    // Preserve recoverable pre-import snapshot of current state before writing
    try {
      safeWriteLS(PRE_IMPORT_BACKUP_KEY, JSON.stringify({
        backedUpAt: new Date().toISOString(),
        payload: buildExportPayload()
      }));
    } catch (e) {}

    if (check.progressJSON && global.GTA6Progress && typeof global.GTA6Progress.importJSONString === 'function') {
      var res = global.GTA6Progress.importJSONString(check.progressJSON);
      if (!res.ok) return res;
    }
    if (check.heistCommand) {
      saveHeistCommandState(check.heistCommand);
    }
    if (check.recentPages) {
      saveRecentPages(check.recentPages);
    }

    emitUpdate('all', 'import');
    return { ok: true, format: check.format, summary: check.summary };
  }

  // ---- Granular & Full Reset ----
  function resetCategory(category) {
    if (!category) return false;
    if (category === 'all') {
      if (global.GTA6Progress && typeof global.GTA6Progress.resetScope === 'function') {
        global.GTA6Progress.resetScope('all');
      }
      safeRemoveLS(HEIST_CMD_KEY);
      safeRemoveLS(RECENT_PAGES_KEY);
      emitUpdate('all', 'reset_all');
      return true;
    }
    if (category === 'pins') {
      if (global.GTA6Progress) global.GTA6Progress.resetScope('pins');
      emitUpdate('pins', 'reset_category');
      return true;
    }
    if (category === 'heists') {
      if (global.GTA6Progress) global.GTA6Progress.resetScope('heists');
      safeRemoveLS(HEIST_CMD_KEY);
      emitUpdate('heists', 'reset_category');
      return true;
    }
    if (category === 'vehicles') {
      if (global.GTA6Progress) global.GTA6Progress.resetScope('db:vehicles');
      emitUpdate('vehicles', 'reset_category');
      return true;
    }
    if (category === 'weapons') {
      if (global.GTA6Progress) {
        global.GTA6Progress.resetScope('db:weapons');
        global.GTA6Progress.setToolState('myLeonidaLoadout', { sidearm: '', primary: '', heavy: '', utility: '' }, false);
      }
      emitUpdate('weapons', 'reset_category');
      return true;
    }
    if (category === 'properties') {
      if (global.GTA6Progress) global.GTA6Progress.resetScope('db:properties');
      emitUpdate('properties', 'reset_category');
      return true;
    }
    if (category === 'animals') {
      if (global.GTA6Progress) global.GTA6Progress.resetScope('db:animals');
      emitUpdate('animals', 'reset_category');
      return true;
    }
    if (category === 'gun-stores') {
      if (global.GTA6Progress) global.GTA6Progress.resetScope('db:gun-stores');
      emitUpdate('gun-stores', 'reset_category');
      return true;
    }
    if (category === 'recent') {
      safeRemoveLS(RECENT_PAGES_KEY);
      emitUpdate('recent', 'reset_category');
      return true;
    }
    if (category === 'slots') {
      if (global.GTA6Progress) global.GTA6Progress.resetScope('slots');
      emitUpdate('slots', 'reset_category');
      return true;
    }
    return false;
  }

  // Listen for cross-tab storage updates on all three keys
  global.addEventListener('storage', function (e) {
    if (e.key === 'gta6hg_progress_v1' || e.key === HEIST_CMD_KEY || e.key === RECENT_PAGES_KEY) {
      emitUpdate('all', 'storage');
    }
  });

  global.GTA6MyLeonida = {
    __version: '28.1',
    SCHEMA_VERSION: SCHEMA_VERSION,
    APP_ID: APP_ID,
    MAX_IMPORT_BYTES: MAX_IMPORT_BYTES,
    getProgressStore: getProgressStore,
    getHeistCommandState: getHeistCommandState,
    saveHeistCommandState: saveHeistCommandState,
    getRecentPages: getRecentPages,
    saveRecentPages: saveRecentPages,
    getLoadout: getLoadout,
    setLoadoutSlot: setLoadoutSlot,
    isPinDone: isPinDone,
    togglePinComplete: togglePinComplete,
    isPinFavorite: isPinFavorite,
    togglePinFavorite: togglePinFavorite,
    toggleHeistStep: toggleHeistStep,
    toggleDbOwned: toggleDbOwned,
    toggleDbFavorite: toggleDbFavorite,
    isVerifiedInGameAnimal: isVerifiedInGameAnimal,
    computeSnapshot: computeSnapshot,
    buildExportPayload: buildExportPayload,
    exportJSON: exportJSON,
    validateImportJSON: validateImportJSON,
    applyImportJSON: applyImportJSON,
    resetCategory: resetCategory,
    getRecoveryInfo: getRecoveryInfo
  };
})(window);
