// ==========================================================================
// GTA6HEISTGUIDE.COM — SHARED VERSIONED PROGRESS ENGINE (v1)
// Storage Key: "gta6hg_progress_v1" (schemaVersion: 1)
// Safe non-destructive migration from legacy per-tool keys + prior unified store.
// Connects: Tools Hub, Heist Planner, Heist Payout Calculator, Save Progress
//           Planner, Interactive Map Checklist, Cheat Tracker, Free Tools Suite,
//           Money Guide Operations, and Secrets Checklist.
// ==========================================================================
(function (global) {
  'use strict';

  if (global.GTA6Progress && global.GTA6Progress.__engineVersion === 'gta6hg_progress_v1') {
    return;
  }

  var STORAGE_KEY = 'gta6hg_progress_v1';
  var LEGACY_UNIFIED_KEY = 'gta6_unified_progress_v1';
  var LEGACY_SAVE_PLANNER_PRIMARY = 'gta6heistguide_15slot_planner_v1';
  var LEGACY_SAVE_PLANNER_ALT = 'gta6_15slot_save_planner_v1';
  var SCHEMA_VERSION = 1;
  var APP_ID = 'gta6heistguide_progress_v1';
  var MAX_IMPORT_BYTES = 524288; // 512 KB safety cap

  // Legacy canonical ID aliases -> upgraded canonical IDs
  var LEGACY_ID_ALIASES = {
    'preflight:pf-family-savings': 'preflight:pf-1',
    'preflight:pf-donnie-fence': 'preflight:pf-3',
    'preflight:pf-jasons-house': 'preflight:pf-5',
    'pin:heist-large-banks': 'pin:heist-large-vaults',
    'pin:heist-trucks': 'pin:heist-armored-trucks'
  };

  // Verified bidirectional cross-tool sync groups:
  // Checking off ANY ID in a group syncs every linked peer across tools.
  var LINK_GROUPS = [
    ['heist:the-cartel-heist', 'pin:heist-cartel', 'pin:vault-sinfrontera-downtown', 'slot:09'],
    ['heist:vcia-takedown', 'pin:heist-vcia', 'slot:11'],
    ['heist:large-bank-vaults', 'pin:heist-large-vaults', 'slot:12'],
    ['heist:jewelry-stores', 'pin:heist-jewelry'],
    ['heist:small-banks-payday-loans', 'pin:heist-small-banks'],
    ['heist:pawn-shops', 'pin:heist-pawn'],
    ['heist:shops-and-stickups', 'pin:heist-shops'],
    ['heist:armored-trucks-gang-ops', 'pin:heist-armored-trucks'],
    ['preflight:pf-1', 'pin:safe-buckme'],
    ['preflight:pf-3', 'pin:fence-donnie'],
    ['preflight:pf-5', 'slot:01', 'pin:sh-jasons-house'],
    ['slot:06', 'pin:sh-ch2-motel'],
    ['slot:10', 'pin:sh-vc-safehouse-4'],
    ['op:1', 'pin:op-fishing-shacks'],
    ['op:2', 'pin:op-exotic-animals'],
    ['op:3', 'pin:op-backroom-weed'],
    ['op:4', 'pin:op-industrial-grow'],
    ['op:5', 'pin:op-manatee-motel'],
    ['op:6', 'pin:op-sunrise-rv'],
    ['op:7', 'pin:op-brooks-boatworks'],
    ['op:8', 'pin:op-june-warehouse'],
    ['op:9', 'pin:op-kingpin-bowling'],
    ['op:10', 'pin:op-la-cascara-motel'],
    ['op:11', 'pin:op-downtown-stash'],
    ['op:12', 'pin:op-nova-auto-junkyard'],
    ['fence:brians-lockup', 'pin:fence-brians-lockup'],
    ['glitch:apollo-red-barn', 'pin:glitch-apollo-red-barn']
  ];

  var LINK_MAP = Object.create(null);
  LINK_GROUPS.forEach(function (group) {
    group.forEach(function (id) {
      if (!LINK_MAP[id]) LINK_MAP[id] = [];
      group.forEach(function (peer) {
        if (peer !== id && LINK_MAP[id].indexOf(peer) === -1) {
          LINK_MAP[id].push(peer);
        }
      });
    });
  });

  function canonicalizeId(id) {
    var s = String(id || '').trim();
    return LEGACY_ID_ALIASES[s] || s;
  }

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

  function formatStamp(isoStr) {
    try {
      var d = isoStr ? new Date(isoStr) : new Date();
      if (isNaN(d.getTime())) return 'Just now';
      var hh = d.getHours();
      var mm = String(d.getMinutes()).padStart(2, '0');
      var ampm = hh >= 12 ? 'PM' : 'AM';
      hh = hh % 12 || 12;
      return hh + ':' + mm + ' ' + ampm;
    } catch (e) {
      return 'Just now';
    }
  }

  function formatSlotStamp() {
    var d = new Date();
    return (
      d.getFullYear() + '-' +
      String(d.getMonth() + 1).padStart(2, '0') + '-' +
      String(d.getDate()).padStart(2, '0') + ' ' +
      String(d.getHours()).padStart(2, '0') + ':' +
      String(d.getMinutes()).padStart(2, '0')
    );
  }

  function createEmptyStore() {
    return {
      schemaVersion: SCHEMA_VERSION,
      app: APP_ID,
      updatedAt: new Date().toISOString(),
      completed: {},          // canonicalId -> true (slots, preflight, pins, heists, cheats, cheat-tested, ops, secrets)
      savePlanner: null,      // full 15-slot planner state { spoilerFree, preflightCollapsed, checklist, slots }
      mapCustomPins: [],      // user-dropped map pins
      heistBuilds: [],        // saved heist planner / calculator configs
      toolStates: {},         // per-tool form settings { heistPlanner, payoutCalculator, freeTools }
      notes: {}
    };
  }

  function normalizeStoreShape(parsed) {
    var out = createEmptyStore();
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return out;

    if (typeof parsed.updatedAt === 'string' && parsed.updatedAt) {
      out.updatedAt = parsed.updatedAt;
    }
    if (parsed.completed && typeof parsed.completed === 'object' && !Array.isArray(parsed.completed)) {
      Object.keys(parsed.completed).forEach(function (k) {
        if (parsed.completed[k] === true && typeof k === 'string' && k.trim() && k.length <= 140) {
          out.completed[canonicalizeId(k)] = true;
        }
      });
    }
    if (parsed.savePlanner && typeof parsed.savePlanner === 'object' && !Array.isArray(parsed.savePlanner)) {
      out.savePlanner = parsed.savePlanner;
    }
    if (Array.isArray(parsed.mapCustomPins)) {
      out.mapCustomPins = parsed.mapCustomPins.filter(function (p) {
        return p && typeof p === 'object' && typeof p.id === 'string' && typeof p.title === 'string';
      }).slice(0, 200);
    }
    if (Array.isArray(parsed.heistBuilds)) {
      out.heistBuilds = parsed.heistBuilds.filter(function (b) {
        return b && typeof b === 'object';
      }).slice(0, 50);
    }
    if (parsed.toolStates && typeof parsed.toolStates === 'object' && !Array.isArray(parsed.toolStates)) {
      out.toolStates = parsed.toolStates;
    }
    if (parsed.notes && typeof parsed.notes === 'object' && !Array.isArray(parsed.notes)) {
      out.notes = parsed.notes;
    }
    return out;
  }

  function ensureSavePlannerSync(store, peerId, isDone) {
    if (!store.savePlanner || typeof store.savePlanner !== 'object') return;
    if (peerId.indexOf('slot:') === 0 && store.savePlanner.slots && typeof store.savePlanner.slots === 'object') {
      var slotNum = parseInt(peerId.slice(5), 10);
      if (isNaN(slotNum)) return;
      var slotObj = store.savePlanner.slots[slotNum] || store.savePlanner.slots[String(slotNum)];
      if (slotObj && !slotObj.locked) {
        slotObj.saved = Boolean(isDone);
        if (isDone && !slotObj.timestamp) {
          slotObj.timestamp = formatSlotStamp();
        } else if (!isDone) {
          slotObj.timestamp = '';
        }
      }
    } else if (peerId.indexOf('preflight:') === 0 && store.savePlanner.checklist && typeof store.savePlanner.checklist === 'object') {
      var pfId = peerId.slice(10);
      store.savePlanner.checklist[pfId] = Boolean(isDone);
    }
  }

  function applyLinkedSync(store, rawId, isDone) {
    var id = canonicalizeId(rawId);
    ensureSavePlannerSync(store, id, Boolean(isDone));
    var peers = LINK_MAP[id];
    if (!peers || !peers.length) return;
    peers.forEach(function (peerId) {
      if (isDone) {
        store.completed[peerId] = true;
      } else {
        delete store.completed[peerId];
      }
      ensureSavePlannerSync(store, peerId, Boolean(isDone));
    });
  }

  function hydrateFromLegacy(store) {
    // 0. Prior unified store (gta6_unified_progress_v1)
    var rawPrevUnified = safeReadLS(LEGACY_UNIFIED_KEY);
    if (rawPrevUnified) {
      try {
        var prev = JSON.parse(rawPrevUnified);
        if (prev && typeof prev === 'object') {
          var norm = normalizeStoreShape(prev);
          Object.keys(norm.completed).forEach(function (k) {
            store.completed[k] = true;
          });
          if (norm.savePlanner) store.savePlanner = norm.savePlanner;
          if (norm.mapCustomPins.length) store.mapCustomPins = norm.mapCustomPins;
          if (norm.heistBuilds.length) store.heistBuilds = norm.heistBuilds;
          if (Object.keys(norm.toolStates).length) store.toolStates = norm.toolStates;
          if (Object.keys(norm.notes).length) store.notes = norm.notes;
        }
      } catch (e) {}
    }

    // 1. Legacy 15-slot Save Progress Planner (primary + alternate key)
    var rawSP = safeReadLS(LEGACY_SAVE_PLANNER_PRIMARY) || safeReadLS(LEGACY_SAVE_PLANNER_ALT);
    if (rawSP) {
      try {
        var sp = JSON.parse(rawSP);
        if (sp && typeof sp === 'object') {
          if (!store.savePlanner) store.savePlanner = sp;
          if (sp.slots && typeof sp.slots === 'object') {
            Object.keys(sp.slots).forEach(function (k) {
              if (sp.slots[k] && sp.slots[k].saved) {
                store.completed['slot:' + String(k).padStart(2, '0')] = true;
              }
            });
          }
          if (sp.checklist && typeof sp.checklist === 'object') {
            Object.keys(sp.checklist).forEach(function (cid) {
              if (sp.checklist[cid]) {
                store.completed[canonicalizeId('preflight:' + cid)] = true;
              }
            });
          }
        }
      } catch (e) {}
    }

    // 2. Legacy Interactive Map found pins
    var rawPins = safeReadLS('gta6_found_pins');
    if (rawPins) {
      try {
        var pins = JSON.parse(rawPins);
        if (Array.isArray(pins)) {
          pins.forEach(function (pid) {
            if (typeof pid === 'string' && pid.trim()) {
              store.completed[canonicalizeId('pin:' + pid.trim())] = true;
            }
          });
        }
      } catch (e) {}
    }

    // 3. Legacy custom map pins
    var rawCustomPins = safeReadLS('gta6_custom_user_pins');
    if (rawCustomPins && (!store.mapCustomPins || !store.mapCustomPins.length)) {
      try {
        var cpins = JSON.parse(rawCustomPins);
        if (Array.isArray(cpins)) store.mapCustomPins = cpins;
      } catch (e) {}
    }

    // 4. Legacy unlocked & tested cheats
    var rawCheats = safeReadLS('gta6_unlocked_cheats');
    if (rawCheats) {
      try {
        var cheats = JSON.parse(rawCheats);
        if (Array.isArray(cheats)) {
          cheats.forEach(function (cid) {
            var n = Number(cid);
            if (!isNaN(n) && n >= 1) {
              store.completed['cheat:' + String(n).padStart(2, '0')] = true;
            }
          });
        }
      } catch (e) {}
    }

    var rawTestedCheats = safeReadLS('gta6_tested_cheats');
    if (rawTestedCheats) {
      try {
        var tcheats = JSON.parse(rawTestedCheats);
        if (Array.isArray(tcheats)) {
          tcheats.forEach(function (cid) {
            var n = Number(cid);
            if (!isNaN(n) && n >= 1) {
              store.completed['cheat-tested:' + String(n).padStart(2, '0')] = true;
            }
          });
        }
      } catch (e) {}
    }

    // 5. Legacy early cash operations
    var rawOps = safeReadLS('gta6_completed_ops');
    if (rawOps) {
      try {
        var ops = JSON.parse(rawOps);
        if (Array.isArray(ops)) {
          ops.forEach(function (oid) {
            var n = Number(oid);
            if (!isNaN(n) && n >= 1) {
              store.completed['op:' + n] = true;
            }
          });
        }
      } catch (e) {}
    }

    // 6. Legacy secrets progress
    var rawSec = safeReadLS('gta6_secrets_progress');
    if (rawSec) {
      try {
        var sec = JSON.parse(rawSec);
        if (sec && typeof sec === 'object') {
          Object.keys(sec).forEach(function (sid) {
            if (sec[sid]) store.completed['secret:' + sid] = true;
          });
        }
      } catch (e) {}
    }

    // 7. Legacy bookmarked heist builds
    var rawBuilds = safeReadLS('gta6_saved_blueprints');
    if (rawBuilds && (!store.heistBuilds || !store.heistBuilds.length)) {
      try {
        var builds = JSON.parse(rawBuilds);
        if (Array.isArray(builds)) store.heistBuilds = builds.slice(0, 50);
      } catch (e) {}
    }

    // 8. Legacy Properties & Animals per-page trackers -> non-destructive World DB IDs
    var rawPropOwned = safeReadLS('gta6_properties_owned_v1');
    if (rawPropOwned) {
      try {
        var po = JSON.parse(rawPropOwned);
        if (po && typeof po === 'object') {
          Object.keys(po).forEach(function (pid) {
            if (po[pid]) store.completed['db:owned:properties:' + pid] = true;
          });
        }
      } catch (e) {}
    }

    var rawAnimStudied = safeReadLS('gta6_animals_studied_v1');
    if (rawAnimStudied) {
      try {
        var an = JSON.parse(rawAnimStudied);
        if (an && typeof an === 'object') {
          Object.keys(an).forEach(function (aid) {
            if (an[aid]) store.completed['db:owned:animals:' + aid] = true;
          });
        }
      } catch (e) {}
    }

    // Propagate linked peers across migrated entries (non-destructive union)
    Object.keys(store.completed).slice().forEach(function (id) {
      if (store.completed[id]) {
        applyLinkedSync(store, id, true);
      }
    });

    return store;
  }

  function loadStore() {
    var raw = safeReadLS(STORAGE_KEY);
    if (!raw) {
      var migrated = hydrateFromLegacy(createEmptyStore());
      saveStore(migrated, true);
      return migrated;
    }
    try {
      var parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && parsed.completed && typeof parsed.completed === 'object') {
        return normalizeStoreShape(parsed);
      }
    } catch (e) {}
    var fresh = hydrateFromLegacy(createEmptyStore());
    saveStore(fresh, true);
    return fresh;
  }

  function mirrorToLegacy(store) {
    // Mirror ONLY progress keys owned by connected tools; never touch unrelated keys.
    var foundPins = [];
    var cheats = [];
    var testedCheats = [];
    var ops = [];
    var secrets = {};
    var propOwned = {};
    var animStudied = {};

    Object.keys(store.completed).forEach(function (id) {
      if (!store.completed[id]) return;
      if (id.indexOf('pin:') === 0) {
        foundPins.push(id.slice(4));
      } else if (id.indexOf('cheat:') === 0) {
        var cn = parseInt(id.slice(6), 10);
        if (!isNaN(cn)) cheats.push(cn);
      } else if (id.indexOf('cheat-tested:') === 0) {
        var tn = parseInt(id.slice(13), 10);
        if (!isNaN(tn)) testedCheats.push(tn);
      } else if (id.indexOf('op:') === 0) {
        var on = parseInt(id.slice(3), 10);
        if (!isNaN(on)) ops.push(on);
      } else if (id.indexOf('secret:') === 0) {
        secrets[id.slice(7)] = true;
      } else if (id.indexOf('db:owned:properties:') === 0) {
        propOwned[id.slice(20)] = true;
      } else if (id.indexOf('db:owned:animals:') === 0) {
        animStudied[id.slice(17)] = true;
      }
    });

    safeWriteLS('gta6_found_pins', JSON.stringify(foundPins));
    safeWriteLS('gta6_custom_user_pins', JSON.stringify(store.mapCustomPins || []));
    safeWriteLS('gta6_unlocked_cheats', JSON.stringify(cheats));
    safeWriteLS('gta6_tested_cheats', JSON.stringify(testedCheats));
    safeWriteLS('gta6_completed_ops', JSON.stringify(ops));
    safeWriteLS('gta6_secrets_progress', JSON.stringify(secrets));
    safeWriteLS('gta6_properties_owned_v1', JSON.stringify(propOwned));
    safeWriteLS('gta6_animals_studied_v1', JSON.stringify(animStudied));

    if (store.savePlanner && typeof store.savePlanner === 'object') {
      safeWriteLS(LEGACY_SAVE_PLANNER_PRIMARY, JSON.stringify(store.savePlanner));
    }
    if (Array.isArray(store.heistBuilds)) {
      safeWriteLS('gta6_saved_blueprints', JSON.stringify(store.heistBuilds));
    }
  }

  function saveStore(store, silent) {
    store.schemaVersion = SCHEMA_VERSION;
    store.app = APP_ID;
    store.updatedAt = new Date().toISOString();
    safeWriteLS(STORAGE_KEY, JSON.stringify(store));
    mirrorToLegacy(store);
    if (!silent) {
      try {
        global.dispatchEvent(new CustomEvent('gta6-progress-updated', { detail: { store: store } }));
      } catch (e) {}
    }
  }

  function summarizeStore(st) {
    var completed = (st && st.completed) || {};
    var keys = Object.keys(completed).filter(function (k) { return completed[k] === true; });
    var slots = keys.filter(function (k) { return k.indexOf('slot:') === 0; }).length;
    var preflight = keys.filter(function (k) { return k.indexOf('preflight:') === 0; }).length;
    var pins = keys.filter(function (k) { return k.indexOf('pin:') === 0; }).length;
    var cheats = keys.filter(function (k) { return k.indexOf('cheat:') === 0; }).length;
    var cheatsTested = keys.filter(function (k) { return k.indexOf('cheat-tested:') === 0; }).length;
    var heists = keys.filter(function (k) { return k.indexOf('heist:') === 0; }).length;
    var ops = keys.filter(function (k) { return k.indexOf('op:') === 0; }).length;
    var secrets = keys.filter(function (k) { return k.indexOf('secret:') === 0; }).length;
    var dbOwned = keys.filter(function (k) { return k.indexOf('db:owned:') === 0; }).length;
    var dbFavs = keys.filter(function (k) { return k.indexOf('db:fav:') === 0; }).length;
    var customPins = Array.isArray(st && st.mapCustomPins) ? st.mapCustomPins.length : 0;
    var heistBuilds = Array.isArray(st && st.heistBuilds) ? st.heistBuilds.length : 0;
    return {
      slots: slots,
      preflight: preflight,
      pins: pins,
      customPins: customPins,
      cheats: cheats,
      cheatsTested: cheatsTested,
      heists: heists,
      ops: ops,
      secrets: secrets,
      dbOwned: dbOwned,
      dbFavs: dbFavs,
      heistBuilds: heistBuilds,
      total: keys.length,
      updatedAt: (st && st.updatedAt) || null
    };
  }

  // Strict schema validator for JSON backup imports
  function validateImportPayload(parsed) {
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return { ok: false, error: 'Backup file must contain a valid JSON object.' };
    }

    // 1. Current or previous unified progress backup format
    var isUnifiedApp = (
      parsed.app === APP_ID ||
      parsed.app === 'gta6heistguide_unified_progress' ||
      (typeof parsed.schemaVersion === 'number' && parsed.completed && typeof parsed.completed === 'object')
    );

    if (isUnifiedApp) {
      if (parsed.schemaVersion !== undefined) {
        if (typeof parsed.schemaVersion !== 'number' || !isFinite(parsed.schemaVersion) || parsed.schemaVersion < 1 || parsed.schemaVersion > SCHEMA_VERSION) {
          return { ok: false, error: 'Unsupported backup schemaVersion (' + parsed.schemaVersion + '). Expected version 1.' };
        }
      }
      if (!parsed.completed || typeof parsed.completed !== 'object' || Array.isArray(parsed.completed)) {
        return { ok: false, error: 'Invalid or missing "completed" map in backup JSON.' };
      }
      if (parsed.mapCustomPins !== undefined && !Array.isArray(parsed.mapCustomPins)) {
        return { ok: false, error: 'Invalid "mapCustomPins" field (expected array).' };
      }
      if (parsed.heistBuilds !== undefined && !Array.isArray(parsed.heistBuilds)) {
        return { ok: false, error: 'Invalid "heistBuilds" field (expected array).' };
      }
      if (parsed.savePlanner !== undefined && parsed.savePlanner !== null && (typeof parsed.savePlanner !== 'object' || Array.isArray(parsed.savePlanner))) {
        return { ok: false, error: 'Invalid "savePlanner" field (expected object or null).' };
      }
      if (parsed.toolStates !== undefined && (typeof parsed.toolStates !== 'object' || Array.isArray(parsed.toolStates) || parsed.toolStates === null)) {
        return { ok: false, error: 'Invalid "toolStates" field (expected object).' };
      }

      var clean = normalizeStoreShape(parsed);
      // Re-sync savePlanner slots/checklist & linked IDs cleanly
      if (clean.savePlanner) {
        if (clean.savePlanner.slots && typeof clean.savePlanner.slots === 'object') {
          Object.keys(clean.savePlanner.slots).forEach(function (k) {
            var sid = 'slot:' + String(k).padStart(2, '0');
            if (clean.savePlanner.slots[k] && clean.savePlanner.slots[k].saved) {
              clean.completed[sid] = true;
            }
          });
        }
        if (clean.savePlanner.checklist && typeof clean.savePlanner.checklist === 'object') {
          Object.keys(clean.savePlanner.checklist).forEach(function (cid) {
            var pid = canonicalizeId('preflight:' + cid);
            if (clean.savePlanner.checklist[cid]) {
              clean.completed[pid] = true;
            }
          });
        }
      }
      Object.keys(clean.completed).slice().forEach(function (id) {
        if (clean.completed[id]) applyLinkedSync(clean, id, true);
      });

      return { ok: true, mode: 'unified', data: clean, preview: summarizeStore(clean) };
    }

    // 2. Legacy 15-Slot Save Planner backup format
    if (parsed.app === 'gta6heistguide_15slot_planner_v1' && parsed.state && typeof parsed.state === 'object' && !Array.isArray(parsed.state)) {
      if (!parsed.state.slots && !parsed.state.checklist) {
        return { ok: false, error: 'Legacy Save Planner backup is missing slots/checklist data.' };
      }
      var merged = loadStore();
      merged.savePlanner = parsed.state;
      if (parsed.state.slots) {
        Object.keys(parsed.state.slots).forEach(function (k) {
          var sid = 'slot:' + String(k).padStart(2, '0');
          if (parsed.state.slots[k] && parsed.state.slots[k].saved) {
            merged.completed[sid] = true;
            applyLinkedSync(merged, sid, true);
          } else {
            delete merged.completed[sid];
          }
        });
      }
      if (parsed.state.checklist) {
        Object.keys(parsed.state.checklist).forEach(function (cid) {
          var pid = canonicalizeId('preflight:' + cid);
          if (parsed.state.checklist[cid]) {
            merged.completed[pid] = true;
            applyLinkedSync(merged, pid, true);
          } else {
            delete merged.completed[pid];
          }
        });
      }
      return { ok: true, mode: 'legacy-save-planner', data: merged, preview: summarizeStore(merged) };
    }

    return {
      ok: false,
      error: 'Unrecognized backup schema. Expected a GTA6HeistGuide progress backup (.json) file.'
    };
  }

  function showProgressToast(msg, isError) {
    if (typeof document === 'undefined' || !document.body) return;
    var existing = document.getElementById('gtaProgressToast');
    if (!existing) {
      existing = document.createElement('div');
      existing.id = 'gtaProgressToast';
      existing.className = 'gta-progress-toast';
      existing.setAttribute('role', 'status');
      existing.setAttribute('aria-live', 'polite');
      document.body.appendChild(existing);
    }
    existing.textContent = msg;
    existing.classList.toggle('is-error', Boolean(isError));
    existing.classList.add('is-visible');
    clearTimeout(existing._timer);
    existing._timer = setTimeout(function () {
      existing.classList.remove('is-visible');
    }, 3600);
  }

  function hasExistingProgress(summary) {
    return (
      summary.total > 0 ||
      summary.customPins > 0 ||
      summary.heistBuilds > 0
    );
  }

  var GTA6Progress = {
    __engineVersion: STORAGE_KEY,
    STORAGE_KEY: STORAGE_KEY,
    SCHEMA_VERSION: SCHEMA_VERSION,
    APP_ID: APP_ID,
    LINK_GROUPS: LINK_GROUPS,

    canonicalizeId: canonicalizeId,

    getState: function () {
      return loadStore();
    },

    isDone: function (id) {
      var st = loadStore();
      return Boolean(st.completed[canonicalizeId(id)]);
    },

    setDone: function (id, isDone) {
      var cid = canonicalizeId(id);
      var st = loadStore();
      if (isDone) {
        st.completed[cid] = true;
      } else {
        delete st.completed[cid];
      }
      applyLinkedSync(st, cid, Boolean(isDone));
      saveStore(st, false);
      return st;
    },

    toggle: function (id) {
      return this.setDone(id, !this.isDone(id));
    },

    isDbOwned: function (category, itemId) {
      if (!category || !itemId) return false;
      return this.isDone('db:owned:' + category + ':' + itemId);
    },

    setDbOwned: function (category, itemId, isOwned) {
      if (!category || !itemId) return loadStore();
      return this.setDone('db:owned:' + category + ':' + itemId, Boolean(isOwned));
    },

    toggleDbOwned: function (category, itemId) {
      return this.setDbOwned(category, itemId, !this.isDbOwned(category, itemId));
    },

    isDbFavorite: function (category, itemId) {
      if (!category || !itemId) return false;
      return this.isDone('db:fav:' + category + ':' + itemId);
    },

    setDbFavorite: function (category, itemId, isFav) {
      if (!category || !itemId) return loadStore();
      return this.setDone('db:fav:' + category + ':' + itemId, Boolean(isFav));
    },

    toggleDbFavorite: function (category, itemId) {
      return this.setDbFavorite(category, itemId, !this.isDbFavorite(category, itemId));
    },

    getDbCategoryCounts: function (category) {
      if (!category) return { owned: 0, favorites: 0 };
      return {
        owned: this.getCompletedByPrefix('db:owned:' + category + ':').length,
        favorites: this.getCompletedByPrefix('db:fav:' + category + ':').length
      };
    },

    isCheatTested: function (cheatId) {
      var n = parseInt(cheatId, 10);
      if (isNaN(n)) return false;
      return this.isDone('cheat-tested:' + String(n).padStart(2, '0'));
    },

    setCheatTested: function (cheatId, isTested) {
      var n = parseInt(cheatId, 10);
      if (isNaN(n)) return loadStore();
      return this.setDone('cheat-tested:' + String(n).padStart(2, '0'), Boolean(isTested));
    },

    getTestedCheats: function () {
      return this.getCompletedByPrefix('cheat-tested:').map(function (s) {
        return parseInt(s, 10);
      }).filter(function (n) { return !isNaN(n); });
    },

    getCompletedByPrefix: function (prefix) {
      var st = loadStore();
      var out = [];
      Object.keys(st.completed).forEach(function (k) {
        if (st.completed[k] && k.indexOf(prefix) === 0) {
          out.push(k.slice(prefix.length));
        }
      });
      return out;
    },

    getToolState: function (toolKey) {
      var st = loadStore();
      if (!st.toolStates || typeof st.toolStates !== 'object') return null;
      return st.toolStates[toolKey] || null;
    },

    setToolState: function (toolKey, dataObj, silent) {
      if (!toolKey || !dataObj || typeof dataObj !== 'object') return loadStore();
      var st = loadStore();
      if (!st.toolStates || typeof st.toolStates !== 'object') st.toolStates = {};
      st.toolStates[toolKey] = Object.assign({}, st.toolStates[toolKey] || {}, dataObj);
      saveStore(st, Boolean(silent));
      return st;
    },

    getHeistBuilds: function () {
      return loadStore().heistBuilds || [];
    },

    setHeistBuilds: function (builds) {
      var st = loadStore();
      st.heistBuilds = Array.isArray(builds) ? builds.slice(0, 50) : [];
      saveStore(st, false);
      return st;
    },

    setSavePlannerState: function (spState) {
      var st = loadStore();
      st.savePlanner = spState;
      if (spState && spState.slots) {
        Object.keys(spState.slots).forEach(function (k) {
          var sid = 'slot:' + String(k).padStart(2, '0');
          var isSaved = Boolean(spState.slots[k] && spState.slots[k].saved);
          var prev = Boolean(st.completed[sid]);
          if (isSaved) st.completed[sid] = true;
          else delete st.completed[sid];
          if (isSaved !== prev) applyLinkedSync(st, sid, isSaved);
        });
      }
      if (spState && spState.checklist) {
        Object.keys(spState.checklist).forEach(function (cid) {
          var pid = canonicalizeId('preflight:' + cid);
          var checked = Boolean(spState.checklist[cid]);
          var prev = Boolean(st.completed[pid]);
          if (checked) st.completed[pid] = true;
          else delete st.completed[pid];
          if (checked !== prev) applyLinkedSync(st, pid, checked);
        });
      }
      saveStore(st, false);
      return st;
    },

    getSavePlannerState: function () {
      var st = loadStore();
      return st.savePlanner;
    },

    setMapCustomPins: function (pins) {
      var st = loadStore();
      st.mapCustomPins = Array.isArray(pins) ? pins.slice(0, 200) : [];
      saveStore(st, false);
      return st;
    },

    getMapCustomPins: function () {
      return loadStore().mapCustomPins || [];
    },

    getSummary: function () {
      return summarizeStore(loadStore());
    },

    validateJSONString: function (rawText) {
      var txt = String(rawText || '');
      if (!txt.trim()) {
        return { ok: false, error: 'Backup file is empty.' };
      }
      if (txt.length > MAX_IMPORT_BYTES) {
        return { ok: false, error: 'Backup file exceeds the 512 KB safety limit.' };
      }
      try {
        var parsed = JSON.parse(txt);
        return validateImportPayload(parsed);
      } catch (e) {
        return { ok: false, error: 'Invalid JSON file: could not parse backup.' };
      }
    },

    exportJSON: function () {
      var st = loadStore();
      var json = JSON.stringify(st, null, 2);
      try {
        var dateTag = new Date().toISOString().slice(0, 10);
        var blob = new Blob([json], { type: 'application/json' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'gta6-heist-guide-progress-backup-' + dateTag + '.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showProgressToast('Exported progress backup (.json) for all GTA 6 tools.', false);
      } catch (e) {
        showProgressToast('Unable to trigger file download in this browser.', true);
      }
      return json;
    },

    importJSONString: function (rawText) {
      var check = this.validateJSONString(rawText);
      if (!check.ok) {
        showProgressToast(check.error, true);
        return { ok: false, error: check.error };
      }
      saveStore(check.data, false);
      showProgressToast('Backup restored & synced across all GTA 6 tools!', false);
      return { ok: true, mode: check.mode, summary: this.getSummary() };
    },

    openImportConfirmModal: function (rawText, options) {
      options = options || {};
      var onSuccess = typeof options.onSuccess === 'function' ? options.onSuccess : null;
      var check = this.validateJSONString(rawText);
      if (!check.ok) {
        showProgressToast(check.error, true);
        return { ok: false, error: check.error };
      }

      var currentSummary = this.getSummary();
      var incoming = check.preview;

      // Always show confirmation warning when overwriting existing progress (or confirm schema preview)
      var backdrop = document.getElementById('gtaUnifiedImportModal');
      if (!backdrop) {
        backdrop = document.createElement('div');
        backdrop.id = 'gtaUnifiedImportModal';
        backdrop.className = 'gta-reset-modal-backdrop';
        backdrop.setAttribute('role', 'dialog');
        backdrop.setAttribute('aria-modal', 'true');
        backdrop.setAttribute('aria-labelledby', 'gtaImportModalTitle');
        backdrop.innerHTML =
          '<div class="gta-reset-modal-card gta-import-modal-card">' +
            '<div class="gta-reset-modal-head">' +
              '<h3 id="gtaImportModalTitle">Confirm Backup Import &amp; Overwrite</h3>' +
              '<button type="button" class="gta-reset-close" id="gtaImportModalClose" aria-label="Close">&times;</button>' +
            '</div>' +
            '<p class="gta-reset-modal-desc" id="gtaImportModalDesc"></p>' +
            '<div class="gta-import-compare" id="gtaImportCompare"></div>' +
            '<p class="gta-reset-modal-note" style="border-left-color:var(--neon-amber,#ffb800); background:rgba(255,184,0,0.08); color:#fde68a;">' +
              '⚠️ <strong>Overwrite Warning:</strong> Importing this backup will replace your current locally saved progress across connected GTA 6 tools on this browser.' +
            '</p>' +
            '<div class="gta-reset-modal-actions">' +
              '<button type="button" class="btn btn-secondary" id="gtaImportCancelBtn">Cancel</button>' +
              '<button type="button" class="btn btn-primary" id="gtaImportConfirmBtn">Confirm Overwrite &amp; Restore</button>' +
            '</div>' +
          '</div>';
        document.body.appendChild(backdrop);

        backdrop.addEventListener('click', function (e) {
          if (e.target === backdrop) backdrop.classList.remove('is-open');
        });
        document.addEventListener('keydown', function (e) {
          if (e.key === 'Escape' && backdrop.classList.contains('is-open')) {
            backdrop.classList.remove('is-open');
          }
        });
      }

      var descEl = document.getElementById('gtaImportModalDesc');
      var cmpEl = document.getElementById('gtaImportCompare');
      var confirmBtn = document.getElementById('gtaImportConfirmBtn');
      var cancelBtn = document.getElementById('gtaImportCancelBtn');
      var closeBtn = document.getElementById('gtaImportModalClose');

      descEl.textContent = hasExistingProgress(currentSummary)
        ? 'Valid GTA 6 progress backup detected (' + (check.mode === 'legacy-save-planner' ? 'Legacy Save Planner' : 'Unified Schema v' + SCHEMA_VERSION) + '). Review the summary below before overwriting your existing browser progress.'
        : 'Valid GTA 6 progress backup detected. Confirm below to load this progress into your browser.';

      cmpEl.innerHTML =
        '<div class="gta-import-col">' +
          '<div class="gta-import-col-title">Current Browser</div>' +
          '<div>💾 Slots: <strong>' + currentSummary.slots + '</strong>/15</div>' +
          '<div>🗺️ Map Pins: <strong>' + currentSummary.pins + '</strong> (+' + currentSummary.customPins + ' custom)</div>' +
          '<div>🎯 Heists: <strong>' + currentSummary.heists + '</strong>/8</div>' +
          '<div>⚡ Cheats: <strong>' + currentSummary.cheats + '</strong> unlocked / <strong>' + currentSummary.cheatsTested + '</strong> tested</div>' +
          '<div>📚 Database: <strong>' + currentSummary.dbOwned + '</strong> owned &bull; <strong>' + currentSummary.dbFavs + '</strong> favorites</div>' +
        '</div>' +
        '<div class="gta-import-col is-incoming">' +
          '<div class="gta-import-col-title">Backup File (.json)</div>' +
          '<div>💾 Slots: <strong>' + incoming.slots + '</strong>/15</div>' +
          '<div>🗺️ Map Pins: <strong>' + incoming.pins + '</strong> (+' + incoming.customPins + ' custom)</div>' +
          '<div>🎯 Heists: <strong>' + incoming.heists + '</strong>/8</div>' +
          '<div>⚡ Cheats: <strong>' + incoming.cheats + '</strong> unlocked / <strong>' + incoming.cheatsTested + '</strong> tested</div>' +
          '<div>📚 Database: <strong>' + incoming.dbOwned + '</strong> owned &bull; <strong>' + incoming.dbFavs + '</strong> favorites</div>' +
        '</div>';

      confirmBtn.onclick = function () {
        saveStore(check.data, false);
        backdrop.classList.remove('is-open');
        showProgressToast('Backup restored & synced across all GTA 6 tools!', false);
        if (onSuccess) onSuccess({ ok: true, mode: check.mode, summary: GTA6Progress.getSummary() });
      };
      cancelBtn.onclick = function () { backdrop.classList.remove('is-open'); };
      closeBtn.onclick = function () { backdrop.classList.remove('is-open'); };

      backdrop.classList.add('is-open');
      return { ok: true, pendingConfirmation: true, preview: incoming };
    },

    resetScope: function (scope) {
      var st = loadStore();
      if (!scope || scope === 'all') {
        st = createEmptyStore();
        saveStore(st, false);
        showProgressToast('All locally saved GTA 6 progress cleared.', false);
        return st;
      }
      if (scope.indexOf('db:') === 0) {
        var dbCat = scope.slice(3);
        if (dbCat) {
          var ownedPref = 'db:owned:' + dbCat + ':';
          var favPref = 'db:fav:' + dbCat + ':';
          Object.keys(st.completed).forEach(function (k) {
            if (k.indexOf(ownedPref) === 0 || k.indexOf(favPref) === 0) {
              delete st.completed[k];
            }
          });
          saveStore(st, false);
          showProgressToast('Reset ' + dbCat + ' owned & favorites.', false);
          return st;
        }
      }
      var prefixMap = {
        cheats: ['cheat:', 'cheat-tested:'],
        pins: ['pin:'],
        heists: ['heist:'],
        ops: ['op:'],
        secrets: ['secret:'],
        slots: ['slot:', 'preflight:'],
        calculator: []
      };
      var prefixes = prefixMap[scope];
      if (prefixes) {
        Object.keys(st.completed).forEach(function (k) {
          for (var i = 0; i < prefixes.length; i++) {
            if (k.indexOf(prefixes[i]) === 0) {
              delete st.completed[k];
              break;
            }
          }
        });
        if (scope === 'pins') st.mapCustomPins = [];
        if (scope === 'slots') st.savePlanner = null;
        if (scope === 'heists' && st.toolStates) delete st.toolStates.heistPlanner;
        if (scope === 'calculator' && st.toolStates) {
          delete st.toolStates.payoutCalculator;
          delete st.toolStates.freeTools;
        }
        saveStore(st, false);
        showProgressToast('Reset ' + scope + ' progress.', false);
      }
      return st;
    },

    openResetModal: function (options) {
      options = options || {};
      var scope = options.scope || 'all';
      var scopeLabel = options.scopeLabel || 'this tool';
      var onReset = typeof options.onReset === 'function' ? options.onReset : null;

      var backdrop = document.getElementById('gtaUnifiedResetModal');
      if (!backdrop) {
        backdrop = document.createElement('div');
        backdrop.id = 'gtaUnifiedResetModal';
        backdrop.className = 'gta-reset-modal-backdrop';
        backdrop.setAttribute('role', 'dialog');
        backdrop.setAttribute('aria-modal', 'true');
        backdrop.setAttribute('aria-labelledby', 'gtaResetModalTitle');
        backdrop.innerHTML =
          '<div class="gta-reset-modal-card">' +
            '<div class="gta-reset-modal-head">' +
              '<h3 id="gtaResetModalTitle">Confirm Progress Reset</h3>' +
              '<button type="button" class="gta-reset-close" id="gtaResetModalClose" aria-label="Close">&times;</button>' +
            '</div>' +
            '<p class="gta-reset-modal-desc" id="gtaResetModalDesc"></p>' +
            '<p class="gta-reset-modal-note">Tip: Export a <code>.json</code> backup first if you want a snapshot before clearing browser storage.</p>' +
            '<div class="gta-reset-modal-actions">' +
              '<button type="button" class="btn btn-secondary" id="gtaResetCancelBtn">Cancel</button>' +
              '<button type="button" class="btn btn-amber" id="gtaResetScopeBtn" style="display:none;"></button>' +
              '<button type="button" class="btn btn-primary" id="gtaResetAllBtn">Reset All Synced Progress</button>' +
            '</div>' +
          '</div>';
        document.body.appendChild(backdrop);

        backdrop.addEventListener('click', function (e) {
          if (e.target === backdrop) backdrop.classList.remove('is-open');
        });
        document.addEventListener('keydown', function (e) {
          if (e.key === 'Escape' && backdrop.classList.contains('is-open')) {
            backdrop.classList.remove('is-open');
          }
        });
      }

      var descEl = document.getElementById('gtaResetModalDesc');
      var scopeBtn = document.getElementById('gtaResetScopeBtn');
      var allBtn = document.getElementById('gtaResetAllBtn');
      var cancelBtn = document.getElementById('gtaResetCancelBtn');
      var closeBtn = document.getElementById('gtaResetModalClose');

      descEl.textContent = scope !== 'all'
        ? 'Choose whether to clear only ' + scopeLabel + ' or wipe all synced progress across Save Planner, Interactive Map, Heist Planner, Payout Calculator, and Cheat Tracker.'
        : 'This will permanently clear all locally stored progress across Save Planner, Interactive Map Checklist, Heist Planner, Payout Calculator, and Cheat Tracker in this browser.';

      if (scope !== 'all') {
        scopeBtn.style.display = 'inline-flex';
        scopeBtn.textContent = 'Reset ' + scopeLabel + ' Only';
        scopeBtn.onclick = function () {
          GTA6Progress.resetScope(scope);
          backdrop.classList.remove('is-open');
          if (onReset) onReset(scope);
        };
      } else {
        scopeBtn.style.display = 'none';
      }

      allBtn.onclick = function () {
        GTA6Progress.resetScope('all');
        backdrop.classList.remove('is-open');
        if (onReset) onReset('all');
      };
      cancelBtn.onclick = function () { backdrop.classList.remove('is-open'); };
      closeBtn.onclick = function () { backdrop.classList.remove('is-open'); };

      backdrop.classList.add('is-open');
    },

    mountToolbar: function (selector, options) {
      var el = typeof selector === 'string' ? document.querySelector(selector) : selector;
      if (!el) return;
      options = options || {};
      var scope = options.scope || 'all';
      var scopeLabel = options.scopeLabel || 'Current Tool';
      var compact = Boolean(options.compact);

      if (compact) {
        el.innerHTML =
          '<div class="gta-progress-bar-widget is-compact">' +
            '<div class="gta-pb-compact-top">' +
              '<span class="gta-pb-autosave" data-pb-autosave><span class="gta-pb-dot"></span> <span data-pb-autosave-text>Auto-saved</span></span>' +
              '<span class="gta-pb-compact-sync" data-pb-compact-stats>💾 0/15 &bull; 🎯 0/8</span>' +
            '</div>' +
            '<div class="gta-pb-actions gta-pb-compact-actions">' +
              '<button type="button" class="gta-pb-btn gta-pb-btn-cyan" data-pb-export>⬇ Export .json</button>' +
              '<button type="button" class="gta-pb-btn gta-pb-btn-green" data-pb-import>⬆ Import .json</button>' +
              '<input type="file" accept=".json,application/json" style="display:none;" data-pb-file>' +
              '<button type="button" class="gta-pb-btn gta-pb-btn-danger" data-pb-reset>↺ Reset</button>' +
            '</div>' +
            '<div class="gta-pb-note">' +
              'Stored locally in this browser/device unless exported. Syncs live with Save Planner, Heist Planner &amp; Cheats.' +
            '</div>' +
          '</div>';
      } else {
        el.innerHTML =
          '<div class="gta-progress-bar-widget">' +
            '<div class="gta-pb-top">' +
              '<div class="gta-pb-stats" data-pb-stats>' +
                '<span class="gta-pb-badge">💾 SAVE &amp; BACKUP PROGRESS</span>' +
                '<span class="gta-pb-autosave" data-pb-autosave><span class="gta-pb-dot"></span> <span data-pb-autosave-text>Auto-saved</span></span>' +
                '<span class="gta-pb-stat">💾 Slots: <strong data-pb-slots>0</strong>/15</span>' +
                '<span class="gta-pb-stat">🗺️ Map Pins: <strong data-pb-pins>0</strong></span>' +
                '<span class="gta-pb-stat">🎯 Heists: <strong data-pb-heists>0</strong>/8</span>' +
                '<span class="gta-pb-stat">⚡ Cheats: <strong data-pb-cheats>0</strong>/61<span data-pb-cheats-tested style="color:var(--neon-cyan); margin-left:3px;"></span></span>' +
              '</div>' +
              '<div class="gta-pb-actions">' +
                '<button type="button" class="gta-pb-btn gta-pb-btn-cyan" data-pb-export>⬇ Export Backup (.json)</button>' +
                '<button type="button" class="gta-pb-btn gta-pb-btn-green" data-pb-import>⬆ Import Backup (.json)</button>' +
                '<input type="file" accept=".json,application/json" style="display:none;" data-pb-file>' +
                '<button type="button" class="gta-pb-btn gta-pb-btn-danger" data-pb-reset>↺ Reset Progress</button>' +
              '</div>' +
            '</div>' +
            '<div class="gta-pb-note">' +
              '🔒 <strong>Auto-Saved Locally:</strong> Your progress is stored locally in this browser/device only (no login needed) unless you export a <code>.json</code> backup. Changes sync automatically across all connected GTA 6 tools &amp; open tabs.' +
            '</div>' +
          '</div>';
      }

      function refreshStats(flashSaved) {
        var s = GTA6Progress.getSummary();
        var sEl = el.querySelector('[data-pb-slots]');
        var pEl = el.querySelector('[data-pb-pins]');
        var hEl = el.querySelector('[data-pb-heists]');
        var cEl = el.querySelector('[data-pb-cheats]');
        var ctEl = el.querySelector('[data-pb-cheats-tested]');
        var compactStatsEl = el.querySelector('[data-pb-compact-stats]');
        var autoText = el.querySelector('[data-pb-autosave-text]');
        var autoWrap = el.querySelector('[data-pb-autosave]');

        if (sEl) sEl.textContent = String(s.slots);
        if (pEl) pEl.textContent = String(s.pins);
        if (hEl) hEl.textContent = String(s.heists);
        if (cEl) cEl.textContent = String(s.cheats);
        if (ctEl) ctEl.textContent = s.cheatsTested > 0 ? '(' + s.cheatsTested + ' tested)' : '';
        if (compactStatsEl) {
          compactStatsEl.textContent = '💾 ' + s.slots + '/15 • 🎯 ' + s.heists + '/8 • ⚡ ' + s.cheats + '/61';
        }
        if (autoText) {
          autoText.textContent = 'Auto-saved · ' + formatStamp(s.updatedAt);
        }
        if (flashSaved && autoWrap) {
          autoWrap.classList.add('is-flashing');
          clearTimeout(autoWrap._flashTimer);
          autoWrap._flashTimer = setTimeout(function () {
            autoWrap.classList.remove('is-flashing');
          }, 900);
        }
      }

      el.querySelector('[data-pb-export]').addEventListener('click', function () {
        GTA6Progress.exportJSON();
      });

      var fileInput = el.querySelector('[data-pb-file]');
      el.querySelector('[data-pb-import]').addEventListener('click', function () {
        fileInput.value = '';
        fileInput.click();
      });
      fileInput.addEventListener('change', function (e) {
        var f = e.target.files && e.target.files[0];
        if (!f) return;
        var reader = new FileReader();
        reader.onload = function (evt) {
          GTA6Progress.openImportConfirmModal(evt.target.result, {
            onSuccess: function () {
              refreshStats(true);
              if (typeof options.onSync === 'function') options.onSync();
            }
          });
        };
        reader.readAsText(f);
      });

      el.querySelector('[data-pb-reset]').addEventListener('click', function () {
        GTA6Progress.openResetModal({
          scope: scope,
          scopeLabel: scopeLabel,
          onReset: function () {
            refreshStats(true);
            if (typeof options.onSync === 'function') options.onSync();
          }
        });
      });

      refreshStats(false);
      global.addEventListener('gta6-progress-updated', function () {
        refreshStats(true);
      });
      global.addEventListener('storage', function (e) {
        if (e.key === STORAGE_KEY) {
          refreshStats(true);
          if (typeof options.onSync === 'function') options.onSync();
        }
      });
    }
  };

  // Cross-tab live sync via storage event
  global.addEventListener('storage', function (e) {
    if (e.key === STORAGE_KEY) {
      try {
        global.dispatchEvent(new CustomEvent('gta6-progress-updated', { detail: { store: loadStore(), source: 'storage' } }));
      } catch (err) {}
    }
  });

  // Safe initial migration & hydration on first load
  loadStore();

  global.GTA6Progress = GTA6Progress;
})(window);
