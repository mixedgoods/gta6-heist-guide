(function () {
  'use strict';
  // Uses textContent only — no raw HTML string sinks. Connects to window.GTA6Progress and window.GTA6Track.
  var root = document.getElementById('cdDetailRoot');
  if (!root) return;

  var ref = root.getAttribute('data-ref') || '';
  var title = root.getAttribute('data-title') || '';
  var category = root.getAttribute('data-category') || '';
  var region = root.getAttribute('data-region') || '';
  var status = root.getAttribute('data-status') || '';
  var isVerified = root.getAttribute('data-verified') === '1';
  var mapPinId = root.getAttribute('data-map-pin-id') || '';

  function track(ev, params) {
    try {
      if (typeof window.GTA6Track === 'function') window.GTA6Track(ev, params || {});
    } catch (e) {}
  }

  // Track discovery detail open (non-personal params only)
  track('discovery_detail_open', {
    category: category,
    region: region,
    evidence_status: status
  });

  // Record in unified GTA6Progress store (toolStates.recentDiscoveries) — no competing storage
  function recordRecentDiscovery() {
    try {
      if (!window.GTA6Progress || !ref) return;
      var store = window.GTA6Progress.getStore ? window.GTA6Progress.getStore() : null;
      if (!store) return;
      var list = (store.toolStates && Array.isArray(store.toolStates.recentDiscoveries))
        ? store.toolStates.recentDiscoveries.slice()
        : [];
      list = list.filter(function (item) { return item && item.ref !== ref; });
      list.unshift({
        ref: ref,
        title: title.slice(0, 120),
        category: category,
        region: region,
        evidence_status: status,
        is_verified: isVerified,
        map_pin_id: mapPinId || null,
        url: '/community-discoveries/d/' + encodeURIComponent(ref),
        viewedAt: new Date().toISOString()
      });
      if (list.length > 15) list = list.slice(0, 15);
      if (typeof window.GTA6Progress.setToolState === 'function') {
        window.GTA6Progress.setToolState('recentDiscoveries', list);
      }
    } catch (e) {}
  }
  recordRecentDiscovery();

  var saveBtn = document.getElementById('cdSaveBtn');
  var pinBtn = document.getElementById('cdBookmarkPinBtn');
  var foundBtn = document.getElementById('cdFoundBtn');
  var syncMsg = document.getElementById('cdSyncMsg');

  var saveKey = 'cd-saved:' + ref;
  var foundKey = 'cd-verified-found:' + ref;
  var pinFavKey = mapPinId ? ('pin-fav:' + mapPinId) : '';

  function setStatusText(text) {
    if (syncMsg) syncMsg.textContent = text;
  }

  function refreshButtons() {
    if (!window.GTA6Progress) return;
    var isSaved = window.GTA6Progress.isCompleted(saveKey);
    if (saveBtn) {
      saveBtn.classList.toggle('is-active', isSaved);
      saveBtn.textContent = isSaved ? '★ Saved in My Leonida' : '☆ Save to My Leonida';
    }
    if (pinBtn && pinFavKey) {
      var isPinSaved = window.GTA6Progress.isCompleted(pinFavKey);
      pinBtn.classList.toggle('is-active', isPinSaved);
      pinBtn.textContent = isPinSaved ? '📌 Map Location Bookmarked' : '📌 Bookmark Map Location';
    }
    if (foundBtn && isVerified) {
      var isFound = window.GTA6Progress.isCompleted(foundKey);
      foundBtn.classList.toggle('is-verified-found', isFound);
      foundBtn.textContent = isFound ? '✓ Verified Discovery Found' : '✓ Mark Verified Discovery Found';
    }
  }

  if (saveBtn) {
    saveBtn.addEventListener('click', function () {
      if (!window.GTA6Progress) return;
      var next = !window.GTA6Progress.isCompleted(saveKey);
      window.GTA6Progress.setCompleted(saveKey, next);
      // Save lightweight metadata in toolStates.savedDiscoveries for My Leonida display
      try {
        var store = window.GTA6Progress.getStore();
        var bag = (store.toolStates && store.toolStates.savedDiscoveries && typeof store.toolStates.savedDiscoveries === 'object')
          ? Object.assign({}, store.toolStates.savedDiscoveries)
          : {};
        if (next) {
          bag[ref] = {
            ref: ref,
            title: title.slice(0, 120),
            category: category,
            region: region,
            evidence_status: status,
            is_verified: isVerified,
            map_pin_id: mapPinId || null,
            url: '/community-discoveries/d/' + encodeURIComponent(ref),
            savedAt: new Date().toISOString()
          };
        } else {
          delete bag[ref];
        }
        window.GTA6Progress.setToolState('savedDiscoveries', bag);
      } catch (e) {}
      refreshButtons();
      setStatusText(next ? 'Saved to My Leonida.' : 'Removed from My Leonida bookmarks.');
      track('discovery_bookmark', { category: category, region: region, saved: next });
    });
  }

  if (pinBtn && pinFavKey) {
    pinBtn.addEventListener('click', function () {
      if (!window.GTA6Progress) return;
      var next = !window.GTA6Progress.isCompleted(pinFavKey);
      window.GTA6Progress.setCompleted(pinFavKey, next);
      refreshButtons();
      setStatusText(next ? 'Map location bookmarked in My Leonida.' : 'Map location bookmark removed.');
      track('discovery_bookmark', { category: category, region: region, saved: next, interaction_type: 'map_location_bookmark' });
    });
  }

  if (foundBtn && isVerified) {
    foundBtn.addEventListener('click', function () {
      if (!window.GTA6Progress) return;
      var next = !window.GTA6Progress.isCompleted(foundKey);
      window.GTA6Progress.setCompleted(foundKey, next);
      refreshButtons();
      setStatusText(next ? 'Marked verified discovery as found in My Leonida.' : 'Unmarked verified discovery.');
      track('progress_category_update', { category: 'community_discovery', completed: next });
    });
  }

  document.querySelectorAll('#cdOpenMapBtn, [data-cd-map-link="1"]').forEach(function (a) {
    a.addEventListener('click', function () {
      track('discovery_map_open', { category: category, region: region, evidence_status: status });
    });
  });

  // Report issue form
  var reportForm = document.getElementById('cdReportForm');
  var reportMsg = document.getElementById('cdReportMsg');
  var reportBtn = document.getElementById('cdReportSubmit');
  if (reportForm) {
    reportForm.addEventListener('submit', function (ev) {
      ev.preventDefault();
      if (reportBtn) reportBtn.disabled = true;
      if (reportMsg) { reportMsg.textContent = 'Sending...'; reportMsg.style.color = '#94a3b8'; }
      var reason = reportForm.elements.reason ? reportForm.elements.reason.value : '';
      var details = reportForm.elements.details ? reportForm.elements.details.value.trim() : '';
      fetch('/api/community-discoveries/report', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ref: ref, reason: reason, details: details })
      }).then(function (r) { return r.json().catch(function () { return { ok: false, error: 'Unexpected response.' }; }); })
        .then(function (res) {
          if (res.ok) {
            if (reportMsg) { reportMsg.textContent = res.message || 'Report submitted.'; reportMsg.style.color = '#4ade80'; }
            reportForm.reset();
            track('discovery_report', { category: category, region: region, reason: reason });
          } else {
            if (reportMsg) { reportMsg.textContent = res.error || 'Could not submit report.'; reportMsg.style.color = '#f87171'; }
          }
          if (reportBtn) reportBtn.disabled = false;
        }).catch(function () {
          if (reportMsg) { reportMsg.textContent = 'Network error. Please try again.'; reportMsg.style.color = '#f87171'; }
          if (reportBtn) reportBtn.disabled = false;
        });
    });
  }

  refreshButtons();
})();
