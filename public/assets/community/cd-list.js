(function () {
  'use strict';
  // All server data is rendered with textContent / setAttribute only. No HTML string sinks.
  var grid = document.getElementById('cdGrid');
  if (!grid) return;
  var q = document.getElementById('cdSearch'), cat = document.getElementById('cdCat'), reg = document.getElementById('cdReg'),
      st = document.getElementById('cdStatus'), sort = document.getElementById('cdSort'), count = document.getElementById('cdCount'),
      empty = document.getElementById('cdEmpty'), robots = document.querySelector('meta[name=robots]');
  var timer = null;

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  }
  function fmt(d) { return d ? String(d).slice(0, 10) : ''; }

  function card(it) {
    var a = el('article', 'disc-card');
    var top = el('div');
    var meta = el('div', 'disc-meta-row');
    var badge = el('span', 'verify-badge ' + (it.evidence_status === 'INDEPENDENTLY_VERIFIED' ? 'verify-confirmed' : it.evidence_status === 'CORROBORATED' ? 'verify-testing' : 'verify-community'), it.evidence_label);
    meta.appendChild(badge);
    meta.appendChild(el('span', 'cd-meta', fmt(it.published_at) + ' â€¢ ' + it.category_label + ' â€¢ ' + it.region));
    top.appendChild(meta);
    top.appendChild(el('h2', 'cd-title', it.title));
    top.appendChild(el('p', 'cd-text', it.short_explanation));
    var how = el('p', 'cd-how');
    how.appendChild(el('strong', null, 'How to find it: '));
    how.appendChild(document.createTextNode(it.finding_instructions));
    top.appendChild(how);
    top.appendChild(el('div', 'cd-notice', it.evidence_notice));
    a.appendChild(top);
    var foot = el('div', 'cd-foot');
    foot.appendChild(el('span', 'cd-meta', 'Ref ' + it.ref + (it.credit ? ' â€¢ Credit: ' + it.credit : '') + (it.updated_at && fmt(it.updated_at) !== fmt(it.published_at) ? ' â€¢ Updated ' + fmt(it.updated_at) : '')));
    var links = el('div', 'cd-links');
    (it.links || []).forEach(function (l) {
      var x = el('a', null, l.label);
      x.href = l.url; x.target = '_blank'; x.rel = 'nofollow ugc noopener noreferrer';
      links.appendChild(x);
    });
    (it.related_guides || []).forEach(function (p) { var x = el('a', null, 'Related guide'); x.href = p; links.appendChild(x); });
    if (it.on_map) { var m = el('a', null, 'View on map'); m.href = '/map.html'; links.appendChild(m); }
    foot.appendChild(links);
    a.appendChild(foot);
    return a;
  }

  function load() {
    var p = new URLSearchParams();
    if (q.value.trim()) p.set('q', q.value.trim());
    if (cat.value) p.set('category', cat.value);
    if (reg.value) p.set('region', reg.value);
    if (st.value) p.set('status', st.value);
    p.set('sort', sort.value);
    fetch('/api/community-discoveries/list?' + p.toString()).then(function (r) { return r.json(); }).then(function (d) {
      grid.textContent = '';
      var filtered = !!(q.value.trim() || cat.value || reg.value || st.value);
      if (!d.ok) { count.textContent = 'Unable to load.'; return; }
      count.textContent = d.total + ' approved ' + (d.total === 1 ? 'entry' : 'entries');
      empty.style.display = d.total === 0 ? 'block' : 'none';
      empty.textContent = filtered ? 'No approved discoveries match your filters.' : 'No community discoveries have been approved yet. Be the first to contribute!';
      d.items.forEach(function (it) { grid.appendChild(card(it)); });
    }).catch(function () { count.textContent = 'Unable to load.'; });
  }
  [cat, reg, st, sort].forEach(function (n) { n.addEventListener('change', load); });
  q.addEventListener('input', function () { clearTimeout(timer); timer = setTimeout(load, 250); });
  load();
})();
