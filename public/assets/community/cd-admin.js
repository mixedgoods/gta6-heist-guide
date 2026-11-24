(function () {
  'use strict';
  // Renders ONLY with textContent and DOM nodes. No HTML string sinks. Auth is enforced by Cloudflare Access.
  var TABS = [
    ['PENDING', 'Pending'],
    ['APPROVED', 'Approved'],
    ['REJECTED', 'Rejected'],
    ['ALL', 'All']
  ];
  var REJECT_REASONS = [
    'Does not meet submission guidelines',
    'Insufficient or unverifiable evidence',
    'Duplicate submission',
    'Spam or test submission',
    'Inaccurate or misleading claim'
  ];
  var STATUS_LABELS = {
    PENDING_REVIEW: 'Pending review',
    NEEDS_MORE_EVIDENCE: 'Needs more evidence',
    COMMUNITY_REPORTED: 'Community reported',
    CORROBORATED: 'Corroborated',
    INDEPENDENTLY_VERIFIED: 'Independently verified',
    REJECTED: 'Rejected'
  };
  var REGIONS = [
    'Vice City', 'Vice Beach', 'Grassrivers', 'Leonida Keys',
    'Mt. Kalaga', 'Port Gellhorn', 'Lake Leonida', 'Ambrosia', 'Other / not sure'
  ];

  var curTab = 'PENDING';
  var curRef = null;
  var counts = {};
  var currentItems = [];
  var inFlight = false;
  var activeMoreMenu = null;

  var $ = function (id) { return document.getElementById(id); };
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined && text !== null) n.textContent = text;
    return n;
  }
  function msg(text, ok) {
    var m = $('msg');
    m.textContent = text || '';
    m.className = text ? (ok ? 'ok' : 'bad') : '';
  }
  function closeMoreMenus() {
    if (activeMoreMenu) {
      activeMoreMenu.hidden = true;
      activeMoreMenu = null;
    }
  }
  document.addEventListener('click', function (e) {
    if (activeMoreMenu && !activeMoreMenu.parentNode.contains(e.target)) {
      closeMoreMenus();
    }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeMoreMenus();
      var bd = $('modal-backdrop');
      if (bd && !bd.hidden && !inFlight) closeModal();
    }
  });

  function api(path, opts) {
    return fetch(path, Object.assign({ credentials: 'same-origin' }, opts || {}))
      .then(function (r) {
        return r.text().then(function (txt) {
          var parsed = null;
          try { parsed = JSON.parse(txt); } catch (e) { parsed = null; }
          if (parsed && typeof parsed === 'object') {
            parsed._status = r.status;
            return parsed;
          }
          if (r.status === 401 || r.status === 403) {
            return { ok: false, _status: r.status, error: 'Session expired or unauthorized. Refresh the page to sign in again.' };
          }
          return { ok: false, _status: r.status, error: 'Unexpected server response (HTTP ' + r.status + ').' };
        });
      })
      .catch(function () {
        return { ok: false, _status: 0, error: 'Network error. Could not reach the moderation API.' };
      });
  }

  function postAction(body) {
    return api('/api/cd-admin/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
  }

  function closeModal() {
    var bd = $('modal-backdrop');
    var card = $('modal-card');
    if (bd) bd.hidden = true;
    if (card) card.textContent = '';
  }

  // Single non-nested confirmation modal supporting optional inputs, disabled loading state, and inline error display.
  function openModal(opts) {
    var bd = $('modal-backdrop');
    var card = $('modal-card');
    card.textContent = '';

    var h = el('h2', null, opts.title);
    h.id = 'modal-title';
    card.appendChild(h);

    if (opts.description) {
      card.appendChild(el('p', 'modal-desc', opts.description));
    }

    var bodyWrap = el('div', 'acts');
    var controls = opts.buildBody ? opts.buildBody(bodyWrap) : {};
    if (bodyWrap.childNodes.length) card.appendChild(bodyWrap);

    var errBox = el('div', 'modal-err');
    errBox.hidden = true;
    card.appendChild(errBox);

    var acts = el('div', 'modal-actions');
    var cancelBtn = el('button', 'btn-neutral', opts.cancelLabel || 'Cancel');
    cancelBtn.type = 'button';
    var okBtn = el('button', opts.confirmClass || 'btn-approve', opts.confirmLabel || 'OK');
    okBtn.type = 'button';
    acts.appendChild(cancelBtn);
    acts.appendChild(okBtn);
    card.appendChild(acts);

    function showErr(text) {
      errBox.textContent = text;
      errBox.hidden = false;
    }

    cancelBtn.onclick = function () {
      if (inFlight) return;
      closeModal();
    };

    bd.onclick = function (e) {
      if (e.target === bd && !inFlight) closeModal();
    };

    okBtn.onclick = function () {
      if (inFlight) return;
      errBox.hidden = true;
      var payload;
      try {
        payload = opts.getPayload ? opts.getPayload(controls) : opts.payload;
      } catch (validationErr) {
        showErr(validationErr.message || 'Please check the required fields.');
        return;
      }
      if (!payload) return;

      inFlight = true;
      okBtn.disabled = true;
      cancelBtn.disabled = true;
      okBtn.textContent = opts.busyLabel || 'Working...';

      postAction(payload).then(function (r) {
        inFlight = false;
        if (r && r.ok) {
          closeModal();
          if (opts.onSuccess) opts.onSuccess(r, payload);
        } else {
          okBtn.disabled = false;
          cancelBtn.disabled = false;
          okBtn.textContent = opts.confirmLabel || 'OK';
          var errText = (r && r.error) || 'Action failed.';
          if (r && r.nearest) {
            errText += ' Nearest pin: ' + r.nearest.title + ' (' + r.nearest.id + ').';
          }
          showErr(errText);
          msg(errText, false);
        }
      });
    };

    bd.hidden = false;
    if (controls && controls.focusEl) controls.focusEl.focus();
    else okBtn.focus();
  }

  function renderTabs() {
    var t = $('tabs');
    t.textContent = '';
    TABS.forEach(function (x) {
      var countText = counts[x[0]] !== undefined ? ' (' + counts[x[0]] + ')' : '';
      var b = el('button', curTab === x[0] ? 'on' : '', x[1] + countText);
      b.type = 'button';
      b.onclick = function () {
        if (inFlight) return;
        curTab = x[0];
        curRef = null;
        $('detail').textContent = '';
        $('detail').appendChild(el('div', 'sec', 'Select a submission from the list to review it.'));
        loadList({ keepMsg: false });
      };
      t.appendChild(b);
    });
  }

  function renderListItems() {
    var l = $('list');
    l.textContent = '';
    if (!currentItems.length) {
      l.appendChild(el('div', 'sec', 'No submissions in this queue.'));
      return;
    }
    currentItems.forEach(function (it) {
      var r = el('div', 'row' + (it.ref === curRef ? ' on' : ''));
      r.tabIndex = 0;
      r.setAttribute('data-ref', it.ref);
      r.appendChild(el('div', 'row-title', it.title));
      r.appendChild(el('small', null, it.ref + ' | ' + it.category + ' | ' + (it.region || 'Region not specified')));
      var stText = STATUS_LABELS[it.evidence_status] || it.evidence_status;
      if (it.is_published) stText += ' | Published';
      r.appendChild(el('small', null, stText));
      if (it.warnings) {
        r.appendChild(el('small', 'warn', 'Warning: ' + it.warnings + ' duplicate/provenance flag(s)'));
      }
      var open = function () {
        if (inFlight) return;
        curRef = it.ref;
        renderListItems();
        loadDetail(it.ref);
      };
      r.onclick = open;
      r.onkeydown = function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } };
      l.appendChild(r);
    });
  }

  function loadList(opts) {
    var keepMsg = opts && opts.keepMsg;
    return api('/api/cd-admin/queue?status=' + encodeURIComponent(curTab)).then(function (d) {
      if (!d.ok) {
        msg(d.error || 'Failed to load queue.', false);
        return;
      }
      if (!keepMsg) msg('', true);
      counts = d.counts || {};
      var totalAll = ['PENDING_REVIEW', 'NEEDS_MORE_EVIDENCE', 'COMMUNITY_REPORTED', 'CORROBORATED', 'INDEPENDENTLY_VERIFIED', 'REJECTED']
        .reduce(function (sum, k) { return sum + (counts[k] || 0); }, 0);
      counts.ALL = totalAll;
      if (counts.PENDING === undefined) counts.PENDING = (counts.PENDING_REVIEW || 0) + (counts.NEEDS_MORE_EVIDENCE || 0);
      if (counts.APPROVED === undefined) counts.APPROVED = (counts.COMMUNITY_REPORTED || 0) + (counts.CORROBORATED || 0) + (counts.INDEPENDENTLY_VERIFIED || 0);
      currentItems = d.items || [];
      renderTabs();
      renderListItems();
    });
  }

  function kv(parent, pairs) {
    var g = el('div', 'kv');
    pairs.forEach(function (p) {
      g.appendChild(el('span', null, p[0]));
      var val = (p[1] === null || p[1] === undefined || p[1] === '') ? 'Not provided' : String(p[1]);
      g.appendChild(el('span', null, val));
    });
    parent.appendChild(g);
  }

  function field(parent, label, name, type, opts) {
    var l = el('label', null, label);
    var i;
    if (type === 'textarea') {
      i = el('textarea');
      i.rows = 3;
    } else if (type === 'select') {
      i = el('select');
      opts.forEach(function (o) {
        var op = el('option', null, Array.isArray(o) ? o[1] : o);
        op.value = Array.isArray(o) ? o[0] : o;
        i.appendChild(op);
      });
    } else {
      i = el('input');
      i.type = type || 'text';
    }
    i.name = name;
    l.appendChild(i);
    parent.appendChild(l);
    return i;
  }

  function removeItemFromCurrentQueue(ref) {
    currentItems = currentItems.filter(function (x) { return x.ref !== ref; });
    renderListItems();
  }

  function openRejectModal(s) {
    openModal({
      title: 'Reject submission?',
      description: s.title + ' (' + s.ref + '). Rejected submissions are removed from the pending queue and never appear publicly.',
      confirmLabel: 'OK',
      busyLabel: 'Rejecting...',
      confirmClass: 'btn-reject',
      buildBody: function (wrap) {
        var preset = field(wrap, 'Quick reason', 'preset', 'select', REJECT_REASONS.concat(['Custom reason...']));
        var reason = field(wrap, 'Rejection reason (recorded in audit log)', 'reason', 'textarea');
        reason.rows = 2;
        reason.value = REJECT_REASONS[0];
        preset.onchange = function () {
          if (preset.value === 'Custom reason...') {
            reason.value = '';
            reason.focus();
          } else {
            reason.value = preset.value;
          }
        };
        return { reason: reason, focusEl: reason };
      },
      getPayload: function (c) {
        var note = c.reason.value.trim();
        if (!note) throw new Error('Please enter a rejection reason.');
        return { action: 'reject', ref: s.ref, note: note };
      },
      onSuccess: function () {
        msg('Submission rejected.', true);
        if (curTab === 'PENDING' || curTab === 'APPROVED') {
          removeItemFromCurrentQueue(s.ref);
          curRef = null;
          var box = $('detail');
          box.textContent = '';
          box.appendChild(el('div', 'sec', 'Select a submission from the list to review it.'));
        } else {
          loadDetail(s.ref);
        }
        loadList({ keepMsg: true });
      }
    });
  }

  function openApproveModal(s) {
    openModal({
      title: 'Approve submission?',
      description: 'Approve "' + s.title + '" (' + s.ref + ') as a Community Report draft. It will remain private until you choose to publish it.',
      confirmLabel: 'Approve',
      busyLabel: 'Approving...',
      confirmClass: 'btn-approve',
      buildBody: function (wrap) {
        var note = field(wrap, 'Internal note (optional)', 'note', 'textarea');
        note.rows = 2;
        return { note: note };
      },
      getPayload: function (c) {
        return { action: 'approve_report', ref: s.ref, note: c.note.value.trim() };
      },
      onSuccess: function () {
        msg('Submission approved as draft.', true);
        if (curTab === 'PENDING') {
          removeItemFromCurrentQueue(s.ref);
        }
        loadDetail(s.ref);
        loadList({ keepMsg: true });
      }
    });
  }

  function openPublishModal(s, isPublished) {
    openModal({
      title: isPublished ? 'Unpublish submission?' : 'Publish submission?',
      description: isPublished
        ? 'Remove "' + s.title + '" (' + s.ref + ') from the public Community Discoveries feed and map.'
        : 'Publish "' + s.title + '" (' + s.ref + ') publicly with its "' + (STATUS_LABELS[s.evidence_status] || s.evidence_status) + '" label.',
      confirmLabel: isPublished ? 'Unpublish' : 'Publish',
      busyLabel: isPublished ? 'Unpublishing...' : 'Publishing...',
      confirmClass: isPublished ? 'btn-neutral' : 'btn-approve',
      getPayload: function () {
        return { action: isPublished ? 'unpublish' : 'publish', ref: s.ref, note: '' };
      },
      onSuccess: function () {
        msg(isPublished ? 'Submission unpublished.' : 'Submission published.', true);
        loadDetail(s.ref);
        loadList({ keepMsg: true });
      }
    });
  }

  function openRequestEvidenceModal(s) {
    openModal({
      title: 'Request more evidence',
      description: 'Move "' + s.title + '" (' + s.ref + ') to Needs More Evidence with an internal note.',
      confirmLabel: 'Save',
      busyLabel: 'Saving...',
      confirmClass: 'btn-approve',
      buildBody: function (wrap) {
        var note = field(wrap, 'What evidence is needed? (required)', 'note', 'textarea');
        return { note: note, focusEl: note };
      },
      getPayload: function (c) {
        var n = c.note.value.trim();
        if (!n) throw new Error('Describe what evidence is needed.');
        return { action: 'request_evidence', ref: s.ref, note: n };
      },
      onSuccess: function () {
        msg('Marked as needing more evidence.', true);
        loadDetail(s.ref);
        loadList({ keepMsg: true });
      }
    });
  }

  function openAddNoteModal(s) {
    openModal({
      title: 'Add internal note',
      description: 'Internal notes are private and never shown publicly.',
      confirmLabel: 'Save note',
      busyLabel: 'Saving...',
      confirmClass: 'btn-approve',
      buildBody: function (wrap) {
        var note = field(wrap, 'Internal note (required)', 'note', 'textarea');
        return { note: note, focusEl: note };
      },
      getPayload: function (c) {
        var n = c.note.value.trim();
        if (!n) throw new Error('Enter a note first.');
        return { action: 'add_note', ref: s.ref, note: n };
      },
      onSuccess: function () {
        msg('Internal note saved.', true);
        loadDetail(s.ref);
      }
    });
  }

  function openDuplicateModal(s) {
    openModal({
      title: 'Flag as duplicate and reject',
      description: 'Links "' + s.ref + '" as a confirmed duplicate of another submission and rejects it.',
      confirmLabel: 'Flag & Reject',
      busyLabel: 'Rejecting...',
      confirmClass: 'btn-reject',
      buildBody: function (wrap) {
        var dref = field(wrap, 'Original submission reference (CD-XXXXX-XXXXX)', 'dref', 'text');
        var note = field(wrap, 'Internal note (optional)', 'note', 'textarea');
        note.rows = 2;
        return { dref: dref, note: note, focusEl: dref };
      },
      getPayload: function (c) {
        var ref = c.dref.value.trim().toUpperCase();
        if (!ref) throw new Error('Enter the original submission reference.');
        return { action: 'flag_duplicate', ref: s.ref, duplicate_ref: ref, note: c.note.value.trim() };
      },
      onSuccess: function () {
        msg('Submission flagged as duplicate and rejected.', true);
        if (curTab === 'PENDING' || curTab === 'APPROVED') {
          removeItemFromCurrentQueue(s.ref);
          curRef = null;
          var box = $('detail');
          box.textContent = '';
          box.appendChild(el('div', 'sec', 'Select a submission from the list to review it.'));
        } else {
          loadDetail(s.ref);
        }
        loadList({ keepMsg: true });
      }
    });
  }

  function openLinkModal(s) {
    openModal({
      title: 'Link related submission',
      description: 'Record a provenance or independent confirmation link for ' + s.ref + '.',
      confirmLabel: 'Link',
      busyLabel: 'Linking...',
      confirmClass: 'btn-approve',
      buildBody: function (wrap) {
        var rref = field(wrap, 'Related submission reference (CD-XXXXX-XXXXX)', 'rref', 'text');
        var kind = field(wrap, 'Relationship', 'kind', 'select', [
          ['independent_confirmation', 'Independent confirmation'],
          ['same_origin', 'Same origin'],
          ['confirmed_duplicate', 'Confirmed duplicate']
        ]);
        var note = field(wrap, 'Explanation (required)', 'note', 'textarea');
        note.rows = 2;
        return { rref: rref, kind: kind, note: note, focusEl: rref };
      },
      getPayload: function (c) {
        var ref = c.rref.value.trim().toUpperCase();
        var note = c.note.value.trim();
        if (!ref) throw new Error('Enter a related submission reference.');
        if (!note) throw new Error('Enter a short explanation.');
        return { action: 'link', ref: s.ref, related_ref: ref, kind: c.kind.value, note: note };
      },
      onSuccess: function () {
        msg('Submission link saved.', true);
        loadDetail(s.ref);
      }
    });
  }

  function openStatusModal(s) {
    openModal({
      title: 'Change verification status',
      description: 'Update the evidence verification tier for ' + s.ref + '.',
      confirmLabel: 'Update status',
      busyLabel: 'Updating...',
      confirmClass: 'btn-approve',
      buildBody: function (wrap) {
        var st = field(wrap, 'Evidence status', 'status', 'select', [
          ['COMMUNITY_REPORTED', 'Community reported'],
          ['CORROBORATED', 'Corroborated'],
          ['INDEPENDENTLY_VERIFIED', 'Independently verified'],
          ['NEEDS_MORE_EVIDENCE', 'Needs more evidence']
        ]);
        st.value = s.evidence_status;
        var basis = field(wrap, 'Corroboration basis (required for Corroborated, >= 20 chars)', 'basis', 'textarea');
        basis.rows = 2;
        var note = field(wrap, 'Reviewer note (required >= 20 chars for Independently verified)', 'note', 'textarea');
        note.rows = 2;
        var ext = el('label', 'chk');
        var extc = el('input'); extc.type = 'checkbox';
        ext.appendChild(extc);
        ext.appendChild(document.createTextNode('External credible evidence (no linked submission)'));
        wrap.appendChild(ext);
        var ver = el('label', 'chk');
        var verc = el('input'); verc.type = 'checkbox';
        ver.appendChild(verc);
        ver.appendChild(document.createTextNode('I reproduced this myself (Independently verified)'));
        wrap.appendChild(ver);
        return { st: st, basis: basis, note: note, extc: extc, verc: verc };
      },
      getPayload: function (c) {
        return {
          action: 'set_status',
          ref: s.ref,
          status: c.st.value,
          note: c.note.value.trim(),
          basis: c.basis.value.trim(),
          external_evidence_ack: c.extc.checked,
          confirm_verified: c.verc.checked
        };
      },
      onSuccess: function () {
        msg('Verification status updated.', true);
        loadDetail(s.ref);
        loadList({ keepMsg: true });
      }
    });
  }

  function renderSecondaryPanel(container, kind, s, p) {
    container.textContent = '';
    if (kind === 'edit' && p) {
      var sec = el('div', 'sec');
      sec.appendChild(el('h3', null, 'Edit published copy'));
      var g = el('div', 'acts');
      var t = field(g, 'Title', 't', 'text'); t.value = p.title; t.maxLength = 120;
      var sh = field(g, 'Short explanation', 'sh', 'textarea'); sh.rows = 2; sh.value = p.short_explanation;
      var fi = field(g, 'Finding instructions', 'fi', 'textarea'); fi.rows = 4; fi.value = p.finding_instructions;
      var rg = field(g, 'Region', 'rg', 'select', REGIONS); rg.value = p.region;
      var cr = el('label', 'chk');
      var crc = el('input'); crc.type = 'checkbox'; crc.checked = !!p.credit_name; crc.disabled = s.credit_pref !== 'named';
      cr.appendChild(crc);
      cr.appendChild(document.createTextNode(s.credit_pref === 'named' ? 'Show contributor credit (' + s.display_name + ')' : 'Contributor chose anonymous'));
      g.appendChild(cr);
      var gl = field(g, 'Related guide paths (one per line)', 'gl', 'textarea'); gl.rows = 2;
      try { gl.value = JSON.parse(p.related_guides || '[]').join('\n'); } catch (e) { /* ignore */ }
      var pl = field(g, 'Public reference links (label | https://url)', 'pl', 'textarea'); pl.rows = 2;
      try { pl.value = JSON.parse(p.public_links || '[]').map(function (x) { return x.label + ' | ' + x.url; }).join('\n'); } catch (e) { /* ignore */ }
      var btns = el('div', 'btns');
      var saveBtn = el('button', 'btn-approve', 'Save edits');
      saveBtn.type = 'button';
      saveBtn.onclick = function () {
        if (inFlight) return;
        var links = pl.value.split('\n').map(function (x) { return x.trim(); }).filter(Boolean).map(function (x) {
          var idx = x.lastIndexOf('|');
          return idx < 0 ? { label: 'Reference', url: x } : { label: x.slice(0, idx).trim(), url: x.slice(idx + 1).trim() };
        });
        inFlight = true;
        saveBtn.disabled = true;
        saveBtn.textContent = 'Saving...';
        postAction({
          action: 'edit_published',
          ref: s.ref,
          title: t.value,
          short_explanation: sh.value,
          finding_instructions: fi.value,
          region: rg.value,
          credit_name: crc.checked ? s.display_name : null,
          related_guides: gl.value.split('\n').map(function (x) { return x.trim(); }).filter(Boolean),
          public_links: links,
          note: ''
        }).then(function (r) {
          inFlight = false;
          if (r.ok) {
            msg('Published copy saved.', true);
            loadDetail(s.ref);
          } else {
            saveBtn.disabled = false;
            saveBtn.textContent = 'Save edits';
            msg(r.error || 'Failed to save edits.', false);
          }
        });
      };
      var closeBtn = el('button', 'btn-neutral', 'Close');
      closeBtn.type = 'button';
      closeBtn.onclick = function () { container.textContent = ''; };
      btns.appendChild(saveBtn);
      btns.appendChild(closeBtn);
      g.appendChild(btns);
      sec.appendChild(g);
      container.appendChild(sec);
    } else if (kind === 'pin' && p) {
      var mSec = el('div', 'sec');
      mSec.appendChild(el('h3', null, 'Map pin (community feed only)'));
      var mg = el('div', 'acts');
      var mt = field(mg, 'Pin title', 'mt', 'text'); mt.value = p.title;
      var mc = field(mg, 'Pin category', 'mc', 'select', [['live-discovery', 'Live discovery'], ['easter-egg', 'Easter egg']]);
      var mr = field(mg, 'Pin region', 'mr', 'select', REGIONS.slice(0, 8));
      if (s.region && s.region !== 'Other / not sure') mr.value = s.region;
      var mx = field(mg, 'xPct (0-1)', 'mx', 'text');
      var my = field(mg, 'yPct (0-1)', 'my', 'text');
      if (s.coord_xpct !== null) { mx.value = s.coord_xpct; my.value = s.coord_ypct; }
      var md = field(mg, 'Pin description (20-500 chars)', 'md', 'textarea'); md.rows = 2; md.value = p.short_explanation;
      var checks = {};
      [
        ['no_duplicate', 'No duplicate location'],
        ['category_ok', 'Category accurate'],
        ['coordinates_ok', 'Coordinates accurate'],
        ['description_ok', 'Description accurate'],
        ['evidence_ok', 'Evidence sufficient'],
        ['specific_enough', 'Specific enough to pin']
      ].forEach(function (c) {
        var l = el('label', 'chk');
        var cb = el('input'); cb.type = 'checkbox';
        l.appendChild(cb);
        l.appendChild(document.createTextNode(c[1]));
        mg.appendChild(l);
        checks[c[0]] = cb;
      });
      var ov = el('label', 'chk');
      var ovc = el('input'); ovc.type = 'checkbox';
      ov.appendChild(ovc);
      ov.appendChild(document.createTextNode('Override nearby-pin warning'));
      mg.appendChild(ov);
      var mb = el('div', 'btns');
      var addPinBtn = el('button', 'btn-approve', 'Approve map pin');
      addPinBtn.type = 'button';
      addPinBtn.onclick = function () {
        if (inFlight) return;
        var c = {};
        Object.keys(checks).forEach(function (k) { c[k] = checks[k].checked; });
        inFlight = true;
        addPinBtn.disabled = true;
        postAction({
          action: 'approve_map_pin',
          ref: s.ref,
          note: '',
          checks: c,
          override_nearby: ovc.checked,
          pin: { title: mt.value, category: mc.value, region: mr.value, xPct: mx.value, yPct: my.value, description: md.value }
        }).then(function (r) {
          inFlight = false;
          addPinBtn.disabled = false;
          if (r.ok) { msg('Map pin approved.', true); loadDetail(s.ref); }
          else msg((r.error || 'Failed') + (r.nearest ? ' Nearest pin: ' + r.nearest.title + ' (' + r.nearest.id + ')' : ''), false);
        });
      };
      mb.appendChild(addPinBtn);
      if (p.map_approved) {
        var rmPinBtn = el('button', 'btn-reject', 'Remove map pin');
        rmPinBtn.type = 'button';
        rmPinBtn.onclick = function () {
          if (inFlight) return;
          inFlight = true;
          rmPinBtn.disabled = true;
          postAction({ action: 'remove_map_pin', ref: s.ref, note: '' }).then(function (r) {
            inFlight = false;
            rmPinBtn.disabled = false;
            if (r.ok) { msg('Map pin removed.', true); loadDetail(s.ref); }
            else msg(r.error || 'Failed to remove map pin.', false);
          });
        };
        mb.appendChild(rmPinBtn);
      }
      var closePinBtn = el('button', 'btn-neutral', 'Close');
      closePinBtn.type = 'button';
      closePinBtn.onclick = function () { container.textContent = ''; };
      mb.appendChild(closePinBtn);
      mg.appendChild(mb);
      mSec.appendChild(mg);
      container.appendChild(mSec);
    }
  }

  function loadDetail(ref) {
    closeMoreMenus();
    api('/api/cd-admin/detail?ref=' + encodeURIComponent(ref)).then(function (d) {
      var box = $('detail');
      box.textContent = '';
      if (!d.ok) {
        box.appendChild(el('div', 'sec bad', d.error || 'Failed to load submission.'));
        return;
      }
      var s = d.submission;
      var p = d.published;
      var isPending = s.evidence_status === 'PENDING_REVIEW' || s.evidence_status === 'NEEDS_MORE_EVIDENCE';
      var isRejected = s.evidence_status === 'REJECTED';

      // Top summary & primary actions card
      var top = el('div', 'sec');
      top.appendChild(el('h2', null, s.title));
      var metaRow = el('div', null);
      var statusPill = el('span', 'status-pill' + (isRejected ? ' rej' : (p && p.is_published ? ' pub' : '')), STATUS_LABELS[s.evidence_status] || s.evidence_status);
      metaRow.appendChild(statusPill);
      if (p && p.is_published) metaRow.appendChild(el('span', 'status-pill pub', 'Published'));
      if (p && p.map_approved) metaRow.appendChild(el('span', 'status-pill pub', 'On Map'));
      metaRow.appendChild(el('small', null, s.ref + ' | Received ' + s.created_at));
      top.appendChild(metaRow);

      var secondarySlot = el('div', null);

      var bar = el('div', 'action-bar');
      if (isPending) {
        var appBtn = el('button', 'btn-approve', 'Approve');
        appBtn.type = 'button';
        appBtn.onclick = function () { openApproveModal(s); };
        bar.appendChild(appBtn);

        var rejBtn = el('button', 'btn-reject', 'Reject');
        rejBtn.type = 'button';
        rejBtn.onclick = function () { openRejectModal(s); };
        bar.appendChild(rejBtn);
      } else if (!isRejected) {
        var pubBtn = el('button', p && p.is_published ? 'btn-neutral' : 'btn-approve', p && p.is_published ? 'Unpublish' : 'Publish');
        pubBtn.type = 'button';
        pubBtn.onclick = function () { openPublishModal(s, Boolean(p && p.is_published)); };
        bar.appendChild(pubBtn);

        var rejBtn2 = el('button', 'btn-reject', 'Reject');
        rejBtn2.type = 'button';
        rejBtn2.onclick = function () { openRejectModal(s); };
        bar.appendChild(rejBtn2);
      }

      // Small More menu for genuinely necessary secondary actions
      var moreWrap = el('div', 'more-wrap');
      var moreBtn = el('button', 'btn-neutral', 'More');
      moreBtn.type = 'button';
      moreBtn.setAttribute('aria-haspopup', 'menu');
      var menu = el('div', 'more-menu');
      menu.setAttribute('role', 'menu');
      menu.hidden = true;

      function addMoreItem(label, fn) {
        var item = el('button', null, label);
        item.type = 'button';
        item.setAttribute('role', 'menuitem');
        item.onclick = function () {
          closeMoreMenus();
          fn();
        };
        menu.appendChild(item);
      }

      if (isPending) {
        addMoreItem('Request more evidence', function () { openRequestEvidenceModal(s); });
        addMoreItem('Flag as duplicate', function () { openDuplicateModal(s); });
      } else if (!isRejected && p) {
        addMoreItem('Edit published copy', function () { renderSecondaryPanel(secondarySlot, 'edit', s, p); });
        addMoreItem('Change verification status', function () { openStatusModal(s); });
        if (p.is_published) {
          addMoreItem('Manage map pin', function () { renderSecondaryPanel(secondarySlot, 'pin', s, p); });
        }
        addMoreItem('Link related submission', function () { openLinkModal(s); });
      }
      addMoreItem('Add internal note', function () { openAddNoteModal(s); });

      moreBtn.onclick = function (e) {
        e.stopPropagation();
        var willOpen = menu.hidden;
        closeMoreMenus();
        if (willOpen) {
          menu.hidden = false;
          activeMoreMenu = menu;
        }
      };
      moreWrap.appendChild(moreBtn);
      moreWrap.appendChild(menu);
      bar.appendChild(moreWrap);
      top.appendChild(bar);
      box.appendChild(top);
      box.appendChild(secondarySlot);

      // Submission details card
      var orig = el('div', 'sec');
      orig.appendChild(el('h3', null, 'Submission details'));
      var witLabel = s.witnessed === 1 ? 'Yes' : (s.witnessed === 0 ? 'No (second-hand)' : 'Not specified');
      if (s.witnessed !== 1 && !s.sources_text && !d.sources.length && !d.evidence.length) {
        orig.appendChild(el('div', 'warn', 'Note: No firsthand observation or external source was provided.'));
      }
      var pairs = [
        ['Category', s.category],
        ['Description', s.detailed_explanation],
        ['Region', s.region],
        ['Location', s.location_description],
        ['Directions', s.directions],
        ['Platform', s.platform],
        ['Personally witnessed', witLabel],
        ['Evidence', s.evidence_description],
        ['Sources', s.sources_text],
        ['Credit', s.credit_pref === 'named' ? s.display_name : 'Anonymous'],
        ['Private email', s.contact_email]
      ];
      if (s.coord_xpct !== null) pairs.push(['Coordinates', s.coord_xpct + ', ' + s.coord_ypct]);
      if (s.duplicate_of_ref) pairs.push(['Duplicate of', s.duplicate_of_ref]);
      kv(orig, pairs);
      box.appendChild(orig);

      if (d.evidence.length || d.sources.length) {
        var ev = el('div', 'sec');
        ev.appendChild(el('h3', null, 'External links (not clickable)'));
        d.evidence.forEach(function (e) { ev.appendChild(el('div', null, e.kind + ': ' + e.url)); });
        d.sources.forEach(function (e) { ev.appendChild(el('div', null, 'source: ' + e.url)); });
        box.appendChild(ev);
      }

      if (d.relations.length) {
        var rel = el('div', 'sec');
        rel.appendChild(el('h3', null, 'Duplicate / provenance flags'));
        d.relations.forEach(function (r) {
          rel.appendChild(el('div', /dup|shared|nearby/.test(r.kind) && r.created_by === 'system' ? 'warn' : null,
            r.kind + ' -> ' + r.related_ref + ' "' + r.related_title + '" [' + r.related_status + ']' + (r.score ? ' (score ' + r.score + ')' : '') + ' by ' + r.created_by));
        });
        box.appendChild(rel);
      }

      // Collapsible audit & decision history
      var hist = el('details', 'sec-fold');
      hist.appendChild(el('summary', null, 'Audit & decision history (' + d.decisions.length + ' decisions, ' + d.audit.length + ' audit entries)'));
      var hBody = el('div', 'fold-body');
      if (!d.decisions.length && !d.audit.length) {
        hBody.appendChild(el('div', null, 'No moderation history yet.'));
      }
      d.decisions.forEach(function (x) {
        hBody.appendChild(el('div', null,
          x.created_at + ' | ' + x.reviewer + ' | ' + x.action + ' | ' + (x.from_status || '') + ' -> ' + (x.to_status || '') + (x.internal_note ? ' | "' + x.internal_note + '"' : '')));
      });
      d.audit.forEach(function (x) {
        hBody.appendChild(el('pre', null, x.at + ' ' + x.actor + ' ' + x.action + ' ' + (x.before_json || '') + ' -> ' + (x.after_json || '')));
      });
      hist.appendChild(hBody);
      box.appendChild(hist);
    });
  }

  renderTabs();
  loadList({ keepMsg: false });
})();
