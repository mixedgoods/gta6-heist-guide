// ==========================================================================
// GTA6HEISTGUIDE.COM — UNIFIED LOCAL PROGRESS STORE & CROSS-TOOL SYNC (v1.0)
// Shared client-side localStorage engine (try/catch safe, zero account needed)
// Connects: Save Progress Planner, Interactive Map Checklist, Heist Planner,
//           Cheat Tracker, Money Guide Operations, and Tips/Secrets Checklist.
// ==========================================================================
(function (global) {
  'use strict';

  var STORAGE_KEY = 'gta6_unified_progress_v1';
  var SCHEMA_VERSION = 1;

  // Bidirectional cross-tool link groups: checking off ANY ID in a group syncs all linked IDs
  var LINK_GROUPS = [
    ['heist:the-cartel-heist', 'pin:heist-cartel', 'pin:vault-sinfrontera-downtown', 'slot:08'],
    ['heist:vcia-takedown', 'pin:heist-vcia', 'slot:11'],
    ['heist:large-bank-vaults', 'pin:heist-large-banks', 'slot:12'],
    ['heist:jewelry-stores', 'pin:heist-jewelry'],
    ['heist:small-banks-payday-loans', 'pin:heist-small-banks'],
    ['heist:pawn-shops', 'pin:heist-pawn'],
    ['heist:shops-and-stickups', 'pin:heist-shops'],
    ['heist:armored-trucks-gang-ops', 'pin:heist-trucks'],
    ['preflight:pf-family-savings', 'pin:safe-buckme'],
    ['preflight:pf-donnie-fence', 'pin:fence-donnie'],
    ['preflight:pf-jasons-house', 'pin:sh-jasons-house'],
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
    ['fence:brians-lockup', 'pin:fence-brians-lockup']
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

  function createEmptyStore() {
    return {
      schemaVersion: SCHEMA_VERSION,
      app: 'gta6heistguide_unified_progress',
      updatedAt: new Date().toISOString(),
      completed: {},          // map of canonicalId -> true
      savePlanner: null,      // full 15-slot planner object { spoilerFree, preflightCollapsed, checklist, slots }
      mapCustomPins: [],      // user-dropped map pins
      heistBuilds: [],        // saved heist planner configs
      notes: {}
    };
  }

  function hydrateFromLegacy(store) {
    // 1. Legacy 15-slot save planner
    var rawSP = safeReadLS('gta6_15slot_save_planner_v1');
    if (rawSP) {
      try {
        var sp = JSON.parse(rawSP);
        if (sp && typeof sp === 'object') {
          store.savePlanner = sp;
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
                store.completed['preflight:' + cid] = true;
              }
            });
          }
        }
      } catch (e) {}
    }

    // 2. Legacy map found pins
    var rawPins = safeReadLS('gta6_found_pins');
    if (rawPins) {
      try {
        var pins = JSON.parse(rawPins);
        if (Array.isArray(pins)) {
          pins.forEach(function (pid) {
            if (typeof pid === 'string' && pid.trim()) {
              store.completed['pin:' + pid.trim()] = true;
            }
          });
        }
      } catch (e) {}
    }

    // 3. Legacy custom map pins
    var rawCustomPins = safeReadLS('gta6_custom_user_pins');
    if (rawCustomPins) {
      try {
        var cpins = JSON.parse(rawCustomPins);
        if (Array.isArray(cpins)) store.mapCustomPins = cpins;
      } catch (e) {}
    }

    // 4. Legacy cheats
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
        if (!Array.isArray(parsed.mapCustomPins)) parsed.mapCustomPins = [];
        if (!Array.isArray(parsed.heistBuilds)) parsed.heistBuilds = [];
        if (!parsed.notes || typeof parsed.notes !== 'object') parsed.notes = {};
        return parsed;
      }
    } catch (e) {}
    var fresh = hydrateFromLegacy(createEmptyStore());
    saveStore(fresh, true);
    return fresh;
  }

  function mirrorToLegacy(store) {
    // Mirror found map pins
    var foundPins = [];
    var cheats = [];
    var ops = [];
    var secrets = {};

    Object.keys(store.completed).forEach(function (id) {
      if (!store.completed[id]) return;
      if (id.indexOf('pin:') === 0) {
        foundPins.push(id.slice(4));
      } else if (id.indexOf('cheat:') === 0) {
        var cn = parseInt(id.slice(6), 10);
        if (!isNaN(cn)) cheats.push(cn);
      } else if (id.indexOf('op:') === 0) {
        var on = parseInt(id.slice(3), 10);
        if (!isNaN(on)) ops.push(on);
      } else if (id.indexOf('secret:') === 0) {
        secrets[id.slice(7)] = true;
      }
    });

    safeWriteLS('gta6_found_pins', JSON.stringify(foundPins));
    safeWriteLS('gta6_custom_user_pins', JSON.stringify(store.mapCustomPins || []));
    safeWriteLS('gta6_unlocked_cheats', JSON.stringify(cheats));
    safeWriteLS('gta6_completed_ops', JSON.stringify(ops));
    safeWriteLS('gta6_secrets_progress', JSON.stringify(secrets));

    if (store.savePlanner && typeof store.savePlanner === 'object') {
      safeWriteLS('gta6_15slot_save_planner_v1', JSON.stringify(store.savePlanner));
    }
  }

  function saveStore(store, silent) {
    store.schemaVersion = SCHEMA_VERSION;
    store.app = 'gta6heistguide_unified_progress';
    store.updatedAt = new Date().toISOString();
    safeWriteLS(STORAGE_KEY, JSON.stringify(store));
    mirrorToLegacy(store);
    if (!silent) {
      try {
        global.dispatchEvent(new CustomEvent('gta6-progress-updated', { detail: { store: store } }));
      } catch (e) {}
    }
  }

  function applyLinkedSync(store, id, isDone) {
    var peers = LINK_MAP[id];
    if (!peers || !peers.length) return;
    peers.forEach(function (peerId) {
      if (isDone) {
        store.completed[peerId] = true;
      } else {
        delete store.completed[peerId];
      }
      // Also reflect into savePlanner object if present
      if (store.savePlanner && typeof store.savePlanner === 'object') {
        if (peerId.indexOf('slot:') === 0 && store.savePlanner.slots) {
          var slotNum = parseInt(peerId.slice(5), 10);
          var slotObj = store.savePlanner.slots[slotNum] || store.savePlanner.slots[String(slotNum)];
          if (slotObj && !slotObj.locked) {
            slotObj.saved = Boolean(isDone);
            if (isDone && !slotObj.timestamp) {
              slotObj.timestamp = new Date().toISOString().slice(0, 16).replace('T', ' ');
            }
          }
        } else if (peerId.indexOf('preflight:') === 0 && store.savePlanner.checklist) {
          var pfId = peerId.slice(10);
          store.savePlanner.checklist[pfId] = Boolean(isDone);
        }
      }
    });
  }

  // Schema validator for JSON imports
  function validateImportPayload(parsed) {
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return { ok: false, error: 'Backup file must contain a valid JSON object.' };
    }

    // Support unified format
    if (parsed.app === 'gta6heistguide_unified_progress' || (parsed.schemaVersion && parsed.completed && typeof parsed.completed === 'object')) {
      if (typeof parsed.completed !== 'object' || Array.isArray(parsed.completed)) {
        return { ok: false, error: 'Invalid "completed" map in backup JSON.' };
      }
      var clean = createEmptyStore();
      Object.keys(parsed.completed).forEach(function (k) {
        if (typeof k === 'string' && k.length > 0 && k.length <= 120 && parsed.completed[k] === true) {
          clean.completed[k] = true;
        }
      });
      if (parsed.savePlanner && typeof parsed.savePlanner === 'object' && !Array.isArray(parsed.savePlanner)) {
        clean.savePlanner = parsed.savePlanner;
      }
      if (Array.isArray(parsed.mapCustomPins)) {
        clean.mapCustomPins = parsed.mapCustomPins.filter(function (p) {
          return p && typeof p === 'object' && typeof p.id === 'string' && typeof p.title === 'string';
        }).slice(0, 200);
      }
      if (Array.isArray(parsed.heistBuilds)) {
        clean.heistBuilds = parsed.heistBuilds.slice(0, 50);
      }
      if (parsed.notes && typeof parsed.notes === 'object' && !Array.isArray(parsed.notes)) {
        clean.notes = parsed.notes;
      }
      return { ok: true, mode: 'unified', data: clean };
    }

    // Support legacy Save Planner backup format
    if (parsed.app === 'gta6heistguide_15slot_planner_v1' && parsed.state && typeof parsed.state === 'object') {
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
          var pid = 'preflight:' + cid;
          if (parsed.state.checklist[cid]) {
            merged.completed[pid] = true;
            applyLinkedSync(merged, pid, true);
          } else {
            delete merged.completed[pid];
          }
        });
      }
      return { ok: true, mode: 'legacy-save-planner', data: merged };
    }

    return {
      ok: false,
      error: 'Unrecognized backup schema. Expected a GTA6HeistGuide progress backup (.json) file.'
    };
  }

  function showProgressToast(msg, isError) {
    var existing = document.getElementById('gtaProgressToast');
    if (!existing) {
      existing = document.createElement('div');
      existing.id = 'gtaProgressToast';
      existing.className = 'gta-progress-toast';
      document.body.appendChild(existing);
    }
    existing.textContent = msg;
    existing.classList.toggle('is-error', Boolean(isError));
    existing.classList.add('is-visible');
    clearTimeout(existing._timer);
    existing._timer = setTimeout(function () {
      existing.classList.remove('is-visible');
    }, 3400);
  }

  var GTA6Progress = {
    STORAGE_KEY: STORAGE_KEY,
    SCHEMA_VERSION: SCHEMA_VERSION,
    LINK_GROUPS: LINK_GROUPS,

    getState: function () {
      return loadStore();
    },

    isDone: function (id) {
      var st = loadStore();
      return Boolean(st.completed[id]);
    },

    setDone: function (id, isDone) {
      var st = loadStore();
      if (isDone) {
        st.completed[id] = true;
      } else {
        delete st.completed[id];
      }
      applyLinkedSync(st, id, Boolean(isDone));
      saveStore(st, false);
      return st;
    },

    toggle: function (id) {
      return this.setDone(id, !this.isDone(id));
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

    setSavePlannerState: function (spState) {
      var st = loadStore();
      st.savePlanner = spState;
      // Sync slots & checklist into completed map + cross-tool links
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
          var pid = 'preflight:' + cid;
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
      st.mapCustomPins = Array.isArray(pins) ? pins : [];
      saveStore(st, false);
      return st;
    },

    getMapCustomPins: function () {
      return loadStore().mapCustomPins || [];
    },

    getSummary: function () {
      var st = loadStore();
      var keys = Object.keys(st.completed).filter(function (k) { return st.completed[k]; });
      var slots = keys.filter(function (k) { return k.indexOf('slot:') === 0; }).length;
      var pins = keys.filter(function (k) { return k.indexOf('pin:') === 0; }).length;
      var cheats = keys.filter(function (k) { return k.indexOf('cheat:') === 0; }).length;
      var heists = keys.filter(function (k) { return k.indexOf('heist:') === 0; }).length;
      var ops = keys.filter(function (k) { return k.indexOf('op:') === 0; }).length;
      var secrets = keys.filter(function (k) { return k.indexOf('secret:') === 0; }).length;
      return {
        slots: slots,
        pins: pins,
        cheats: cheats,
        heists: heists,
        ops: ops,
        secrets: secrets,
        total: keys.length,
        updatedAt: st.updatedAt
      };
    },

    exportJSON: function () {
      var st = loadStore();
      var json = JSON.stringify(st, null, 2);
      try {
        var blob = new Blob([json], { type: 'application/json' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'gta6-heist-guide-progress-backup.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showProgressToast('Exported unified progress backup (.json).', false);
      } catch (e) {
        showProgressToast('Unable to trigger file download in this browser.', true);
      }
      return json;
    },

    importJSONString: function (rawText) {
      try {
        var parsed = JSON.parse(String(rawText || ''));
        var check = validateImportPayload(parsed);
        if (!check.ok) {
          showProgressToast(check.error, true);
          return { ok: false, error: check.error };
        }
        saveStore(check.data, false);
        showProgressToast('Backup imported and synced across all GTA 6 tools!', false);
        return { ok: true, mode: check.mode, summary: this.getSummary() };
      } catch (e) {
        var errMsg = 'Invalid JSON file: could not parse backup.';
        showProgressToast(errMsg, true);
        return { ok: false, error: errMsg };
      }
    },

    resetScope: function (scope) {
      var st = loadStore();
      if (!scope || scope === 'all') {
        st = createEmptyStore();
        saveStore(st, false);
        showProgressToast('All unified local progress cleared.', false);
        return st;
      }
      var prefixMap = {
        cheats: 'cheat:',
        pins: 'pin:',
        heists: 'heist:',
        ops: 'op:',
        secrets: 'secret:',
        slots: 'slot:'
      };
      var pfx = prefixMap[scope];
      if (pfx) {
        Object.keys(st.completed).forEach(function (k) {
          if (k.indexOf(pfx) === 0) delete st.completed[k];
        });
        if (scope === 'pins') st.mapCustomPins = [];
        if (scope === 'slots') st.savePlanner = null;
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
        ? 'Choose whether to clear only ' + scopeLabel + ' or wipe all synced progress across Save Planner, Map, Heist Planner, and Cheats.'
        : 'This will permanently clear all locally stored progress across Save Planner, Interactive Map Checklist, Heist Planner, and Cheat Tracker in this browser.';

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

      el.innerHTML =
        '<div class="gta-progress-bar-widget">' +
          '<div class="gta-pb-top">' +
            '<div class="gta-pb-stats" data-pb-stats>' +
              '<span class="gta-pb-badge">🔄 SYNCED PROGRESS</span>' +
              '<span class="gta-pb-stat">💾 Slots: <strong data-pb-slots>0</strong>/15</span>' +
              '<span class="gta-pb-stat">🗺️ Map Pins: <strong data-pb-pins>0</strong></span>' +
              '<span class="gta-pb-stat">🎯 Heists: <strong data-pb-heists>0</strong>/8</span>' +
              '<span class="gta-pb-stat">⚡ Cheats: <strong data-pb-cheats>0</strong>/61</span>' +
            '</div>' +
            '<div class="gta-pb-actions">' +
              '<button type="button" class="gta-pb-btn gta-pb-btn-cyan" data-pb-export>⬇ Export Backup (.json)</button>' +
              '<button type="button" class="gta-pb-btn gta-pb-btn-green" data-pb-import>⬆ Import Backup (.json)</button>' +
              '<input type="file" accept=".json,application/json" style="display:none;" data-pb-file>' +
              '<button type="button" class="gta-pb-btn gta-pb-btn-danger" data-pb-reset>↺ Reset</button>' +
            '</div>' +
          '</div>' +
          '<div class="gta-pb-note">' +
            'Progress is stored locally in this browser (no account required) and syncs automatically across Save Planner, Map, Heist Planner &amp; Cheats unless exported.' +
          '</div>' +
        '</div>';

      function refreshStats() {
        var s = GTA6Progress.getSummary();
        var sEl = el.querySelector('[data-pb-slots]');
        var pEl = el.querySelector('[data-pb-pins]');
        var hEl = el.querySelector('[data-pb-heists]');
        var cEl = el.querySelector('[data-pb-cheats]');
        if (sEl) sEl.textContent = String(s.slots);
        if (pEl) pEl.textContent = String(s.pins);
        if (hEl) hEl.textContent = String(s.heists);
        if (cEl) cEl.textContent = String(s.cheats);
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
          var res = GTA6Progress.importJSONString(evt.target.result);
          if (res.ok && typeof options.onSync === 'function') {
            options.onSync();
          }
          refreshStats();
        };
        reader.readAsText(f);
      });

      el.querySelector('[data-pb-reset]').addEventListener('click', function () {
        GTA6Progress.openResetModal({
          scope: scope,
          scopeLabel: scopeLabel,
          onReset: function () {
            refreshStats();
            if (typeof options.onSync === 'function') options.onSync();
          }
        });
      });

      refreshStats();
      global.addEventListener('gta6-progress-updated', refreshStats);
      global.addEventListener('storage', function (e) {
        if (e.key === STORAGE_KEY) {
          refreshStats();
          if (typeof options.onSync === 'function') options.onSync();
        }
      });
    }
  };

  // Listen for cross-tab storage updates
  global.addEventListener('storage', function (e) {
    if (e.key === STORAGE_KEY) {
      try {
        global.dispatchEvent(new CustomEvent('gta6-progress-updated', { detail: { store: loadStore() } }));
      } catch (err) {}
    }
  });

  // Ensure initial migration runs safely once
  loadStore();

  global.GTA6Progress = GTA6Progress;
})(window);
