(function () {
  'use strict';
  // Renders ONLY with textContent. No HTML string sinks. No secrets in this file: auth is Cloudflare Access.
  var TABS = [['NEW', 'New'], ['PENDING_REVIEW', 'Pending'], ['NEEDS_MORE_EVIDENCE', 'Needs evidence'], ['COMMUNITY_REPORTED', 'Community reported'],
    ['CORROBORATED', 'Corroborated'], ['INDEPENDENTLY_VERIFIED', 'Independently verified'], ['REJECTED', 'Rejected'], ['PUBLISHED', 'Published'], ['ALL', 'All']];
  var cur = 'NEW', curRef = null, counts = {};
  var $ = function (id) { return document.getElementById(id); };
  function el(tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text !== undefined && text !== null) n.textContent = text; return n; }
  function msg(t, ok) { var m = $('msg'); m.textContent = t || ''; m.className = ok ? 'ok' : 'bad'; }

  function api(path, opts) {
    return fetch(path, Object.assign({ credentials: 'same-origin' }, opts || {})).then(function (r) {
      return r.json().catch(function () { return { ok: false, error: 'HTTP ' + r.status }; }).then(function (j) { j._status = r.status; return j; });
    });
  }
  function post(body) {
    return api('/api/cd-admin/action', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  }

  function renderTabs() {
    var t = $('tabs'); t.textContent = '';
    TABS.forEach(function (x) {
      var b = el('button', cur === x[0] ? 'on' : '', x[1] + (counts[x[0]] !== undefined ? ' (' + counts[x[0]] + ')' : ''));
      b.type = 'button'; b.onclick = function () { cur = x[0]; loadList(); }; t.appendChild(b);
    });
  }

  function loadList() {
    api('/api/cd-admin/queue?status=' + encodeURIComponent(cur)).then(function (d) {
      if (!d.ok) { msg(d.error || 'Failed', false); return; }
      msg('', true); counts = d.counts; counts.ALL = Object.keys(d.counts).filter(function (k) { return k !== 'NEW'; }).reduce(function (s, k) { return s + d.counts[k]; }, 0);
      renderTabs();
      var l = $('list'); l.textContent = '';
      if (!d.items.length) l.appendChild(el('div', 'sec', 'Nothing here.'));
      d.items.forEach(function (it) {
        var r = el('div', 'row' + (it.ref === curRef ? ' on' : ''));
        r.tabIndex = 0;
        r.appendChild(el('div', null, it.title));
        r.appendChild(el('small', null, it.ref + ' • ' + it.category + ' • ' + (it.region || 'Region not specified')));
        r.appendChild(el('small', null, it.evidence_status + ' • ' + it.reviewer_status + (it.is_published ? ' • PUBLISHED' : '') + (it.witnessed === 1 ? '' : (it.witnessed === 0 ? ' • second-hand' : ' • evidence unconfirmed'))));
        if (it.warnings) r.appendChild(el('small', 'warn', 'âš  ' + it.warnings + ' duplicate/provenance warning(s)'));
        var open = function () { curRef = it.ref; loadDetail(it.ref); };
        r.onclick = open; r.onkeydown = function (e) { if (e.key === 'Enter') open(); };
        l.appendChild(r);
      });
    });
  }

  function kv(parent, pairs) {
    var g = el('div', 'kv');
    pairs.forEach(function (p) { g.appendChild(el('span', null, p[0])); g.appendChild(el('span', null, p[1] === null || p[1] === undefined || p[1] === '' ? 'â€”' : String(p[1]))); });
    parent.appendChild(g);
  }
  function sec(parent, title) { var s = el('div', 'sec'); s.appendChild(el('h3', null, title)); parent.appendChild(s); return s; }

  function field(parent, label, name, type, opts) {
    var l = el('label', null, label); var i;
    if (type === 'textarea') { i = el('textarea'); i.rows = 2; } else if (type === 'select') { i = el('select'); opts.forEach(function (o) { var op = el('option', null, o); op.value = o; i.appendChild(op); }); } else { i = el('input'); i.type = type || 'text'; }
    i.name = name; l.appendChild(i); parent.appendChild(l); return i;
  }
  function btn(parent, label, cls, fn) { var b = el('button', 'btn ' + (cls || 'btn-secondary'), label); b.type = 'button'; b.onclick = fn; parent.appendChild(b); return b; }

  function act(body, confirmText) {
    if (confirmText && !window.confirm(confirmText)) return;
    body.ref = curRef;
    post(body).then(function (r) {
      if (r.ok) { msg('Done: ' + body.action, true); loadDetail(curRef); loadList(); }
      else msg((r.error || 'Failed') + (r.nearest ? ' Nearest pin: ' + r.nearest.title + ' (' + r.nearest.id + ')' : ''), false);
    });
  }

  function loadDetail(ref) {
    api('/api/cd-admin/detail?ref=' + encodeURIComponent(ref)).then(function (d) {
      var box = $('detail'); box.textContent = '';
      if (!d.ok) { box.appendChild(el('div', 'sec bad', d.error || 'Failed')); return; }
      var s = d.submission, p = d.published;

      var a = sec(box, s.ref + ' â€” ' + s.title);
      kv(a, [['Evidence status', s.evidence_status], ['Reviewer status', s.reviewer_status], ['Duplicate of', s.duplicate_of_ref],
        ['Published', p ? (p.is_published ? 'YES (' + p.published_at + ')' : 'no (draft)') : 'no'], ['On map', p && p.map_approved ? 'YES' : 'no']]);

      var o = sec(box, 'Original submission (immutable)');
      var witLabel = s.witnessed === 1 ? 'Yes' : (s.witnessed === 0 ? 'NO (second-hand)' : 'Not specified — review evidence');
      if (s.witnessed !== 1 && !s.sources_text && !d.sources.length && !d.evidence.length) {
        o.appendChild(el('div', 'warn', '⚠ No firsthand observation or external source provided — review evidence carefully before approval.'));
      }
      kv(o, [['Category', s.category], ['Region', s.region], ['Short', s.short_description], ['Description / Detail', s.detailed_explanation],
        ['Location', s.location_description], ['Directions', s.directions], ['Platform', s.platform], ['Game version', s.game_version],
        ['Discovered', s.discovered_on], ['Personally witnessed', witLabel], ['Evidence', s.evidence_description],
        ['Sources text', s.sources_text], ['Coords (x,y)', s.coord_xpct === null ? null : s.coord_xpct + ', ' + s.coord_ypct],
        ['Display name', s.display_name], ['Credit pref', s.credit_pref], ['PRIVATE email', s.contact_email],
        ['Received', s.created_at], ['Rights ack', 'originality=' + s.originality_ack + ' license=' + s.license_ack + ' media=' + s.image_rights_ack]]);

      var ev = sec(box, 'Evidence & sources (external links: treat as untrusted; not clickable here)');
      if (!d.evidence.length && !d.sources.length) ev.appendChild(el('div', null, 'None provided.'));
      d.evidence.forEach(function (e) { ev.appendChild(el('div', null, e.kind + ': ' + e.url)); });
      d.sources.forEach(function (e) { ev.appendChild(el('div', null, 'source: ' + e.url)); });

      var rel = sec(box, 'Duplicate / provenance relationships');
      if (!d.relations.length) rel.appendChild(el('div', null, 'None.'));
      d.relations.forEach(function (r) {
        rel.appendChild(el('div', /dup|shared|nearby/.test(r.kind) && r.created_by === 'system' ? 'warn' : null,
          r.kind + ' â†’ ' + r.related_ref + ' "' + r.related_title + '" [' + r.related_status + ']' + (r.score ? ' score ' + r.score : '') + ' by ' + r.created_by));
      });
      rel.appendChild(el('small', null, 'Automatic warnings are NOT corroboration. Same-source or copied reports do not count as independent.'));

      var ac = sec(box, 'Actions');
      var g = el('div', 'acts'); ac.appendChild(g);
      var note = field(g, 'Internal reviewer note (private)', 'note', 'textarea');
      var b1 = el('div', 'btns'); g.appendChild(b1);
      btn(b1, 'Start review', '', function () { act({ action: 'start_review', note: note.value }); });
      btn(b1, 'Approve as Community Report', 'btn-primary', function () { act({ action: 'approve_report', note: note.value }, 'Approve as COMMUNITY REPORTED (not independently verified)?'); });
      btn(b1, 'Request more evidence', '', function () { act({ action: 'request_evidence', note: note.value }); });
      btn(b1, 'Reject', '', function () { act({ action: 'reject', note: note.value }, 'Reject this submission?'); });
      btn(b1, 'Add note', '', function () { act({ action: 'add_note', note: note.value }); });

      var st = field(g, 'Assign evidence status', 'status', 'select', ['PENDING_REVIEW', 'NEEDS_MORE_EVIDENCE', 'COMMUNITY_REPORTED', 'CORROBORATED', 'INDEPENDENTLY_VERIFIED', 'REJECTED']);
      var basis = field(g, 'Corroboration basis (required for CORROBORATED; explain independence)', 'basis', 'textarea');
      var ext = el('label', null, ''); var extc = el('input'); extc.type = 'checkbox'; ext.appendChild(extc); ext.appendChild(document.createTextNode(' External credible evidence (no linked independent submission)')); g.appendChild(ext);
      var ver = el('label', null, ''); var verc = el('input'); verc.type = 'checkbox'; ver.appendChild(verc); ver.appendChild(document.createTextNode(' I reproduced this myself â€” confirm INDEPENDENTLY VERIFIED (owner only)')); g.appendChild(ver);
      btn(g, 'Apply status', '', function () {
        act({ action: 'set_status', status: st.value, note: note.value, basis: basis.value, external_evidence_ack: extc.checked, confirm_verified: verc.checked },
          'Change evidence status to ' + st.value + '?');
      });

      var lk = sec(box, 'Link / duplicate');
      var lg = el('div', 'acts'); lk.appendChild(lg);
      var rr = field(lg, 'Other submission reference (CD-XXXXX-XXXXX)', 'rref', 'text');
      var kind = field(lg, 'Relationship (reviewer-asserted; requires note above)', 'kind', 'select', ['independent_confirmation', 'same_origin', 'confirmed_duplicate']);
      var lb = el('div', 'btns'); lg.appendChild(lb);
      btn(lb, 'Link submissions', '', function () { act({ action: 'link', related_ref: rr.value.trim(), kind: kind.value, note: note.value }); });
      btn(lb, 'Flag as duplicate of this ref (rejects)', '', function () { act({ action: 'flag_duplicate', duplicate_ref: rr.value.trim(), note: note.value }, 'Flag as duplicate and reject?'); });

      if (p) {
        var pb = sec(box, 'Published copy (editable; original above is preserved)');
        var pg = el('div', 'acts'); pb.appendChild(pg);
        var t = field(pg, 'Title', 't', 'text'); t.value = p.title; t.maxLength = 120;
        var sh = field(pg, 'Short explanation', 'sh', 'textarea'); sh.value = p.short_explanation;
        var fi = field(pg, 'Finding instructions', 'fi', 'textarea'); fi.rows = 4; fi.value = p.finding_instructions;
        var rg = field(pg, 'Region', 'rg', 'select', ['Vice City', 'Vice Beach', 'Grassrivers', 'Leonida Keys', 'Mt. Kalaga', 'Port Gellhorn', 'Lake Leonida', 'Ambrosia', 'Other / not sure']); rg.value = p.region;
        var cr = el('label', null, ''); var crc = el('input'); crc.type = 'checkbox'; crc.checked = !!p.credit_name; cr.appendChild(crc);
        cr.appendChild(document.createTextNode(' Show contributor credit' + (s.credit_pref === 'named' ? ' (' + s.display_name + ')' : ' â€” contributor chose anonymous, disabled'))); crc.disabled = s.credit_pref !== 'named'; pg.appendChild(cr);
        var gl = field(pg, 'Related guide paths (one per line, e.g. /map.html)', 'gl', 'textarea'); try { gl.value = JSON.parse(p.related_guides || '[]').join('\n'); } catch (e) { /* ignore */ }
        var pl = field(pg, 'Public reference links (one per line: label | https://url)', 'pl', 'textarea'); try { pl.value = JSON.parse(p.public_links || '[]').map(function (x) { return x.label + ' | ' + x.url; }).join('\n'); } catch (e) { /* ignore */ }
        var pbtn = el('div', 'btns'); pg.appendChild(pbtn);
        btn(pbtn, 'Save edits', 'btn-primary', function () {
          var links = pl.value.split('\n').map(function (x) { return x.trim(); }).filter(Boolean).map(function (x) { var i = x.lastIndexOf('|'); return i < 0 ? { label: 'Reference', url: x } : { label: x.slice(0, i).trim(), url: x.slice(i + 1).trim() }; });
          act({ action: 'edit_published', title: t.value, short_explanation: sh.value, finding_instructions: fi.value, region: rg.value,
            credit_name: crc.checked ? s.display_name : null, related_guides: gl.value.split('\n').map(function (x) { return x.trim(); }).filter(Boolean), public_links: links, note: note.value });
        });
        btn(pbtn, 'Publish', 'btn-primary', function () { act({ action: 'publish', note: note.value }, 'Publish publicly with its evidence label?'); });
        btn(pbtn, 'Unpublish', '', function () { act({ action: 'unpublish', note: note.value }); });

        var mp = sec(box, 'Map pin (separate community feed; never edits map-pins.json or the completion tracker)');
        var mg = el('div', 'acts'); mp.appendChild(mg);
        var mt = field(mg, 'Pin title', 'mt', 'text'); mt.value = p.title;
        var mc = field(mg, 'Pin category', 'mc', 'select', ['live-discovery', 'easter-egg']);
        var mr = field(mg, 'Pin region', 'mr', 'select', ['Vice City', 'Vice Beach', 'Grassrivers', 'Leonida Keys', 'Mt. Kalaga', 'Port Gellhorn', 'Lake Leonida', 'Ambrosia']);
        if (s.region !== 'Other / not sure') mr.value = s.region;
        var mx = field(mg, 'xPct (0-1)', 'mx', 'text'); var my = field(mg, 'yPct (0-1)', 'my', 'text');
        if (s.coord_xpct !== null) { mx.value = s.coord_xpct; my.value = s.coord_ypct; }
        var md = field(mg, 'Pin description (20-500 chars)', 'md', 'textarea'); md.value = p.short_explanation;
        var checks = {}; [['no_duplicate', 'Checked: no duplicate location'], ['category_ok', 'Checked: category correct'], ['coordinates_ok', 'Checked: coordinates accurate'],
          ['description_ok', 'Checked: description correct'], ['evidence_ok', 'Checked: evidence sufficient'], ['specific_enough', 'Checked: specific enough to pin']].forEach(function (c) {
          var l = el('label', null, ''); var i = el('input'); i.type = 'checkbox'; l.appendChild(i); l.appendChild(document.createTextNode(' ' + c[1])); mg.appendChild(l); checks[c[0]] = i; });
        var ov = el('label', null, ''); var ovc = el('input'); ovc.type = 'checkbox'; ov.appendChild(ovc); ov.appendChild(document.createTextNode(' Override nearby-pin warning (I checked manually)')); mg.appendChild(ov);
        var mb = el('div', 'btns'); mg.appendChild(mb);
        btn(mb, 'Approve map pin', 'btn-primary', function () {
          var c = {}; Object.keys(checks).forEach(function (k) { c[k] = checks[k].checked; });
          act({ action: 'approve_map_pin', note: note.value, checks: c, override_nearby: ovc.checked, pin: { title: mt.value, category: mc.value, region: mr.value, xPct: mx.value, yPct: my.value, description: md.value } });
        });
        btn(mb, 'Remove map pin', '', function () { act({ action: 'remove_map_pin', note: note.value }); });
      }

      var h = sec(box, 'Decisions & audit trail');
      d.decisions.forEach(function (x) { h.appendChild(el('div', null, x.created_at + ' â€¢ ' + x.reviewer + ' â€¢ ' + x.action + ' â€¢ ' + (x.from_status || '') + ' â†’ ' + (x.to_status || '') + (x.internal_note ? ' â€¢ "' + x.internal_note + '"' : ''))); });
      d.audit.forEach(function (x) { var pr = el('pre', null, x.at + ' ' + x.actor + ' ' + x.action + ' ' + (x.before_json || '') + ' â†’ ' + (x.after_json || '')); h.appendChild(pr); });
    });
  }
  renderTabs();
  loadList();
})();
