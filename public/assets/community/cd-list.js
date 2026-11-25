(function () {
  'use strict';
  // All server data is rendered with textContent / setAttribute only. No HTML string sinks.
  var grid = document.getElementById('cdGrid');
  if (!grid) return;
  var featSection = document.getElementById('cdFeaturedSection');
  var featGrid = document.getElementById('cdFeaturedGrid');
  var q = document.getElementById('cdSearch'), cat = document.getElementById('cdCat'), reg = document.getElementById('cdReg'),
      st = document.getElementById('cdStatus'), sort = document.getElementById('cdSort'), count = document.getElementById('cdCount'),
      empty = document.getElementById('cdEmpty');
  var timer = null;

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  }
  function fmt(d) { return d ? String(d).slice(0, 10) : ''; }
  function track(ev, params) {
    try { if (typeof window.GTA6Track === 'function') window.GTA6Track(ev, params || {}); } catch (e) {}
  }

  function toggleBookmark(it, btn) {
    if (!window.GTA6Progress) return;
    var key = 'cd-saved:' + it.ref;
    var next = !window.GTA6Progress.isCompleted(key);
    window.GTA6Progress.setCompleted(key, next);
    try {
      var store = window.GTA6Progress.getStore();
      var bag = (store.toolStates && store.toolStates.savedDiscoveries && typeof store.toolStates.savedDiscoveries === 'object')
        ? Object.assign({}, store.toolStates.savedDiscoveries)
        : {};
      if (next) {
        bag[it.ref] = {
          ref: it.ref,
          title: String(it.title || '').slice(0, 120),
          category: it.category,
          region: it.region,
          evidence_status: it.evidence_status,
          is_verified: Boolean(it.is_verified),
          map_pin_id: it.map_pin_id || null,
          url: it.detail_url || ('/community-discoveries/d/' + encodeURIComponent(it.ref)),
          savedAt: new Date().toISOString()
        };
      } else {
        delete bag[it.ref];
      }
      window.GTA6Progress.setToolState('savedDiscoveries', bag);
    } catch (e) {}
    btn.textContent = next ? '★ Saved' : '☆ Save';
    btn.setAttribute('aria-pressed', next ? 'true' : 'false');
    track('discovery_bookmark', { category: it.category, region: it.region, saved: next });
  }

  function card(it) {
    var a = el('article', 'disc-card');
    var top = el('div');
    var meta = el('div', 'disc-meta-row');
    var isVer = it.evidence_status === 'INDEPENDENTLY_VERIFIED' || it.evidence_status === 'OFFICIALLY_CONFIRMED';
    var badgeCls = isVer ? 'verify-confirmed' : it.evidence_status === 'CORROBORATED' ? 'verify-testing' : 'verify-community';
    meta.appendChild(el('span', 'verify-badge ' + badgeCls, it.evidence_label));
    meta.appendChild(el('span', 'cd-meta', fmt(it.published_at) + ' • ' + it.category_label + ' • ' + it.region));
    top.appendChild(meta);

    var h2 = el('h2', 'cd-title');
    var detailUrl = it.detail_url || ('/community-discoveries/d/' + encodeURIComponent(it.ref));
    var titleLink = el('a', null, it.title);
    titleLink.href = detailUrl;
    titleLink.style.color = '#fff';
    titleLink.style.textDecoration = 'none';
    titleLink.addEventListener('click', function () {
      track('discovery_detail_open', { category: it.category, region: it.region, evidence_status: it.evidence_status });
    });
    h2.appendChild(titleLink);
    top.appendChild(h2);

    top.appendChild(el('p', 'cd-text', it.short_explanation));
    var how = el('p', 'cd-how');
    how.appendChild(el('strong', null, 'How to find it: '));
    how.appendChild(document.createTextNode(it.finding_instructions));
    top.appendChild(how);
    top.appendChild(el('div', 'cd-notice', it.evidence_notice));
    a.appendChild(top);

    var foot = el('div', 'cd-foot');
    var creditStr = it.credit ? (' • Credit: ' + it.credit) : '';
    var updStr = (it.updated_at && fmt(it.updated_at) !== fmt(it.published_at)) ? (' • Updated ' + fmt(it.updated_at)) : '';
    foot.appendChild(el('span', 'cd-meta', 'Ref ' + it.ref + creditStr + updStr));

    var links = el('div', 'cd-links');
    var det = el('a', null, 'Full details →');
    det.href = detailUrl;
    det.addEventListener('click', function () {
      track('discovery_detail_open', { category: it.category, region: it.region, evidence_status: it.evidence_status });
    });
    links.appendChild(det);

    if (it.on_map) {
      var m = el('a', null, 'View on map');
      m.href = '/map?pin=' + encodeURIComponent(it.map_pin_id || ('community-' + it.ref));
      m.addEventListener('click', function () {
        track('discovery_map_open', { category: it.category, region: it.region, evidence_status: it.evidence_status });
      });
      links.appendChild(m);
    }

    var saveBtn = el('button', 'disc-pill', (window.GTA6Progress && window.GTA6Progress.isCompleted('cd-saved:' + it.ref)) ? '★ Saved' : '☆ Save');
    saveBtn.type = 'button';
    saveBtn.setAttribute('aria-pressed', (window.GTA6Progress && window.GTA6Progress.isCompleted('cd-saved:' + it.ref)) ? 'true' : 'false');
    saveBtn.addEventListener('click', function () { toggleBookmark(it, saveBtn); });
    links.appendChild(saveBtn);

    (it.links || []).forEach(function (l) {
      var x = el('a', null, l.label);
      x.href = l.url; x.target = '_blank'; x.rel = 'nofollow ugc noopener noreferrer';
      links.appendChild(x);
    });
    (it.related_guides || []).forEach(function (p) { var x = el('a', null, 'Related guide'); x.href = p; links.appendChild(x); });
    foot.appendChild(links);
    a.appendChild(foot);
    return a;
  }

  function renderEmptyState(filtered) {
    empty.textContent = '';
    empty.style.display = 'block';
    if (filtered) {
      empty.appendChild(el('p', null, 'No approved discoveries match your current filters. Try clearing your search or selecting another region.'));
      return;
    }
    var h = el('h2', null, 'No approved community discoveries yet');
    h.style.color = '#fff';
    h.style.fontSize = '1.15rem';
    h.style.margin = '0 0 .5rem';
    empty.appendChild(h);
    var p = el('p', null, 'We only publish genuine player findings after human editorial review — never fabricated updates or unverified rumors. Found a hidden spot, secret area, safe code, vehicle, or mission tip in Leonida?');
    p.style.maxWidth = '560px';
    p.style.margin = '0 auto 1rem';
    p.style.lineHeight = '1.55';
    empty.appendChild(p);
    var cta = el('a', 'btn btn-primary', 'Submit the First Discovery →');
    cta.href = '/community-discoveries/submit/';
    cta.style.padding = '.6rem 1.2rem';
    empty.appendChild(cta);
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
      if (featGrid) featGrid.textContent = '';
      if (featSection) featSection.style.display = 'none';
      var filtered = !!(q.value.trim() || cat.value || reg.value || st.value);
      if (!d.ok) { count.textContent = 'Unable to load.'; return; }
      count.textContent = d.total + ' approved ' + (d.total === 1 ? 'discovery' : 'discoveries');
      if (d.total === 0) {
        renderEmptyState(filtered);
        return;
      }
      empty.style.display = 'none';
      var featured = !filtered ? d.items.filter(function (x) { return x.featured; }).slice(0, 3) : [];
      if (featured.length && featSection && featGrid) {
        featSection.style.display = 'block';
        featured.forEach(function (it) { featGrid.appendChild(card(it)); });
      }
      d.items.forEach(function (it) { grid.appendChild(card(it)); });
    }).catch(function () { count.textContent = 'Unable to load.'; });
  }
  [cat, reg, st, sort].forEach(function (n) { n.addEventListener('change', load); });
  q.addEventListener('input', function () { clearTimeout(timer); timer = setTimeout(load, 250); });
  load();
})();
