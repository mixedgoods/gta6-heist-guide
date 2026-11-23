/* GTA6HeistGuide guide-page interactivity. Small, dependency-free.
   Storage: ONLY its own keys (gta6hg_missions_v1, gta6hg_collectibles_v1, gta6hg_controls_v1).
   It never reads or writes the shared gta6hg_progress_v1 store, map pin state, or the Save Planner. */
(function () {
  'use strict';
  function ls(k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }
  function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }

  /* ---------- generic text filter: input[data-g-filter="scopeId"] filters [data-g-item] / [data-mission] ---------- */
  $$('[data-g-filter]').forEach(function (inp) {
    var scope = document.getElementById(inp.getAttribute('data-g-filter'));
    if (!scope) return;
    var sel = $('select[data-g-filter-select="' + scope.id + '"]');
    var countEl = $('[data-g-count="' + scope.id + '"]');
    function run() {
      var q = inp.value.trim().toLowerCase();
      var cls = sel ? sel.value : '';
      var shown = 0;
      $$('[data-g-item], [data-mission]', scope).forEach(function (el) {
        var hay = (el.getAttribute('data-g-text') || el.textContent).toLowerCase();
        var ok = (!q || hay.indexOf(q) !== -1) && (!cls || el.getAttribute('data-g-class') === cls);
        el.classList.toggle('g-hidden', !ok);
        if (ok) shown++;
      });
      if (countEl) countEl.textContent = shown;
      $$('[data-g-group]', scope).forEach(function (g) {
        g.classList.toggle('g-hidden', !$$('[data-g-item]:not(.g-hidden), [data-mission]:not(.g-hidden)', g).length);
      });
    }
    inp.addEventListener('input', run);
    if (sel) sel.addEventListener('change', run);
    run();
  });

  /* ---------- missions: spoiler mode + completion tracking ---------- */
  var mroot = document.getElementById('missionApp');
  if (mroot) {
    var KEY = 'gta6hg_missions_v1';
    var st = ls(KEY, { done: {}, revealed: {}, spoilerFree: true });
    st.done = st.done || {}; st.revealed = st.revealed || {};
    if (typeof st.spoilerFree !== 'boolean') st.spoilerFree = true;
    var items = $$('[data-mission]', mroot);
    var tog = $('#spoilerToggle');
    function save() { lsSet(KEY, st); }
    function paint() {
      var total = items.length, done = 0;
      items.forEach(function (li) {
        var id = li.getAttribute('data-mission');
        var name = $('.g-name', li), cb = $('input', li), btn = $('.g-reveal', li);
        var shown = !st.spoilerFree || st.revealed[id];
        name.classList.toggle('g-shown', shown);
        if (shown) { name.removeAttribute('aria-hidden'); } else { name.setAttribute('aria-hidden', 'true'); }
        cb.setAttribute('aria-label', shown ? name.textContent : 'Hidden mission in ' + li.getAttribute('data-chapter-label'));
        cb.checked = !!st.done[id];
        if (cb.checked) done++;
        btn.hidden = !st.spoilerFree || !!st.revealed[id];
      });
      var pct = total ? Math.round(done * 100 / total) : 0;
      $('#missionProgressText').textContent = done + ' of ' + total + ' documented missions marked complete (' + pct + '%)';
      $('#missionProgressBar').style.width = pct + '%';
      $$('[data-chapter-card]', mroot).forEach(function (c) {
        var lis = $$('[data-mission]', c), d = lis.filter(function (l) { return st.done[l.getAttribute('data-mission')]; }).length;
        var o = $('[data-chapter-done]', c); if (o) o.textContent = d + ' / ' + lis.length;
      });
      if (tog) { tog.setAttribute('aria-pressed', st.spoilerFree ? 'true' : 'false'); tog.textContent = st.spoilerFree ? 'Spoiler-free mode: ON (titles hidden)' : 'Spoiler-free mode: OFF (titles shown)'; }
    }
    mroot.addEventListener('change', function (e) {
      var li = e.target.closest && e.target.closest('[data-mission]'); if (!li || e.target.type !== 'checkbox') return;
      var id = li.getAttribute('data-mission');
      if (e.target.checked) st.done[id] = true; else delete st.done[id];
      save(); paint();
    });
    mroot.addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('.g-reveal'); if (!b) return;
      var id = b.closest('[data-mission]').getAttribute('data-mission'); st.revealed[id] = true; save(); paint();
    });
    if (tog) tog.addEventListener('click', function () { st.spoilerFree = !st.spoilerFree; save(); paint(); });
    var rv = $('#revealAll'); if (rv) rv.addEventListener('click', function () { items.forEach(function (li) { st.revealed[li.getAttribute('data-mission')] = true; }); save(); paint(); });
    var hv = $('#hideAll'); if (hv) hv.addEventListener('click', function () { st.revealed = {}; st.spoilerFree = true; save(); paint(); });
    var rs = $('#resetMissions'); if (rs) rs.addEventListener('click', function () { if (confirm('Clear only the mission checkmarks stored by this page? Your Save Planner, map and 100% tracker are not touched.')) { st.done = {}; save(); paint(); } });
    var opt = $('#optToggle');
    if (opt) opt.addEventListener('change', function () { $$('[data-optional="1"]', mroot).forEach(function (li) { li.classList.toggle('g-hidden', !opt.checked); }); });
    paint();
  }

  /* ---------- controls: platform switch ---------- */
  var ctl = document.getElementById('ctlApp');
  if (ctl) {
    var cs = ls('gta6hg_controls_v1', { platform: 'ps5' });
    function setPlat(p) {
      ctl.setAttribute('data-platform', p); cs.platform = p; lsSet('gta6hg_controls_v1', cs);
      $$('[data-plat-btn]').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-plat-btn') === p ? 'true' : 'false'); });
    }
    $$('[data-plat-btn]').forEach(function (b) { b.addEventListener('click', function () { setPlat(b.getAttribute('data-plat-btn')); }); });
    var hash = (location.hash || '').toLowerCase();
    setPlat(hash === '#xbox' ? 'xbox' : hash === '#ps5' ? 'ps5' : (cs.platform === 'xbox' ? 'xbox' : 'ps5'));
  }

  /* ---------- troubleshooting: platform / category / keyword filter ---------- */
  var tr = document.getElementById('tsApp');
  if (tr) {
    var sp = $('#tsPlatform'), sc = $('#tsCategory'), sq = $('#tsSearch'), cnt = $('#tsCount'), empty = $('#tsEmpty');
    var entries = $$('details[data-ts]', tr);
    function tsRun() {
      var p = sp.value, c = sc.value, q = sq.value.trim().toLowerCase(), n = 0;
      entries.forEach(function (d) {
        var plats = d.getAttribute('data-plats').split(' ');
        var ok = (!p || plats.indexOf(p) !== -1) && (!c || d.getAttribute('data-cat') === c) && (!q || d.textContent.toLowerCase().indexOf(q) !== -1);
        d.classList.toggle('g-hidden', !ok); if (ok) n++;
      });
      $$('[data-ts-group]', tr).forEach(function (g) { g.classList.toggle('g-hidden', !$('details[data-ts]:not(.g-hidden)', g)); });
      cnt.textContent = n; empty.classList.toggle('g-hidden', n !== 0);
    }
    [sp, sc].forEach(function (s) { s.addEventListener('change', tsRun); }); sq.addEventListener('input', tsRun);
    var qs = new URLSearchParams(location.search);
    if (qs.get('platform')) sp.value = qs.get('platform');
    if (qs.get('category')) sc.value = qs.get('category');
    if (location.hash && document.querySelector(location.hash)) { var t = document.querySelector(location.hash); if (t.tagName === 'DETAILS') t.open = true; }
    tsRun();
  }

  /* ---------- collectible counters (own storage only) ---------- */
  var ca = document.getElementById('collectApp');
  if (ca) {
    var CK = 'gta6hg_collectibles_v1', cst = ls(CK, {});
    $$('[data-counter]', ca).forEach(function (box) {
      var id = box.getAttribute('data-counter'), total = +box.getAttribute('data-total'), req = +box.getAttribute('data-req') || total;
      var parent = box.closest('.g-chapter') || box.parentElement;
      var inp = $('input', box), bar = (parent && $('.g-progress>i', parent)) || $('.g-progress>i', box), out = $('[data-out]', box);
      inp.max = total; inp.value = cst[id] || 0;
      function upd() {
        var v = Math.max(0, Math.min(total, parseInt(inp.value, 10) || 0)); inp.value = v; cst[id] = v; lsSet(CK, cst);
        var pct = Math.min(100, Math.round(v * 100 / req));
        if (bar) bar.style.width = pct + '%';
        if (out) out.textContent = v + ' found · ' + (v >= req ? 'requirement met (' + req + ')' : (req - v) + ' more for the ' + req + ' needed');
      }
      inp.addEventListener('input', upd);
      $$('button[data-step]', box).forEach(function (b) { b.addEventListener('click', function () { inp.value = (parseInt(inp.value, 10) || 0) + (+b.getAttribute('data-step')); upd(); }); });
      upd();
    });
  }
})();
