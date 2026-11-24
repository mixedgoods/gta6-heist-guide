(function () {
  'use strict';
  var form = document.getElementById('cdForm');
  if (!form) return;
  var errBox = document.getElementById('cdFormError');
  var btn = document.getElementById('cdSubmit');
  var tsToken = null;
  var cfg = { turnstile: null, submissionsOpen: true };

  // Max date = today
  var d = form.elements.discovered_on;
  if (d) d.max = new Date().toISOString().slice(0, 10);

  function clearErrors() {
    errBox.style.display = 'none';
    errBox.textContent = '';
    form.querySelectorAll('.cd-err').forEach(function (n) { n.remove(); });
    form.querySelectorAll('.invalid').forEach(function (n) { n.classList.remove('invalid'); });
  }
  function showFieldErrors(fields) {
    var more = document.getElementById('cdMore');
    Object.keys(fields || {}).forEach(function (k) {
      var el = form.elements[k] || form.elements[k === 'coords' ? 'coord_xpct' : k];
      var msg = document.createElement('div');
      msg.className = 'cd-err';
      msg.textContent = fields[k];
      if (el && el instanceof Element) {
        el.classList.add('invalid');
        if (more && more.contains(el)) more.open = true;
        (el.closest('label') || el.parentNode).appendChild(msg);
      } else if (el && el.length && el[0] instanceof Element) {
        if (more && more.contains(el[0])) more.open = true;
        (el[0].closest('div') || el[0].parentNode).appendChild(msg);
      } else { errBox.textContent += ' ' + fields[k]; errBox.style.display = 'block'; }
    });
  }

  function val(n) { var e = form.elements[n]; return e ? String(e.value || '').trim() : ''; }

  function collect() {
    var urls = val('source_urls').split(/\n+/).map(function (s) { return s.trim(); }).filter(Boolean);
    var named = form.elements.credit_named && form.elements.credit_named.checked;
    var perm = !!(form.elements.permission_ack && form.elements.permission_ack.checked);
    return {
      title: val('title'),
      category: val('category'),
      description: val('description'),
      region: val('region') || undefined,
      location_description: val('location_description') || undefined,
      directions: val('directions') || undefined,
      coord_xpct: val('coord_xpct') || undefined,
      coord_ypct: val('coord_ypct') || undefined,
      platform: val('platform') || undefined,
      game_version: val('game_version') || undefined,
      discovered_on: val('discovered_on') || undefined,
      witnessed: val('witnessed') || undefined,
      evidence_description: val('evidence_description') || undefined,
      sources_text: val('sources_text') || undefined,
      source_urls: urls.length ? urls : undefined,
      screenshot_url: val('screenshot_url') || undefined,
      video_url: val('video_url') || undefined,
      display_name: val('display_name') || undefined,
      credit_pref: named ? 'named' : 'anonymous',
      contact_email: val('contact_email') || undefined,
      permission_ack: perm,
      image_rights_ack: !!(form.elements.image_rights_ack && form.elements.image_rights_ack.checked),
      website: val('website'),
      turnstile_token: tsToken || undefined
    };
  }

  // Light client checks only for convenience; the server is the authority.
  function quickCheck(b) {
    var f = {};
    if (b.title.length < 5) f.title = 'Enter a title (at least 5 characters).';
    if (!b.category) f.category = 'Choose a category.';
    if (b.description.length < 20) f.description = 'Describe what you found and where to find it (at least 20 characters).';
    if (!b.permission_ack) f.permission_ack = 'Please confirm originality and display permission.';
    if ((b.screenshot_url || b.video_url) && !b.image_rights_ack) {
      f.image_rights_ack = 'Confirm you captured the linked media or have permission to share it.';
    }
    if (b.witnessed === 'no' && !b.sources_text && (!b.source_urls || !b.source_urls.length)) {
      f.sources_text = 'If you did not witness this yourself, tell us where the information came from.';
    }
    return f;
  }

  fetch('/api/community-discoveries/config', { credentials: 'omit' }).then(function (r) { return r.json(); }).then(function (c) {
    cfg = c;
    if (!c.submissionsOpen) { document.getElementById('cdClosed').style.display = 'block'; btn.disabled = true; }
    if (c.turnstile && c.turnstile.siteKey) {
      var s = document.createElement('script');
      s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      s.async = true;
      s.onload = function () {
        window.turnstile.render('#cdTurnstile', { sitekey: c.turnstile.siteKey, callback: function (t) { tsToken = t; }, 'expired-callback': function () { tsToken = null; } });
      };
      document.head.appendChild(s);
    }
  }).catch(function () { /* form still usable; server decides */ });

  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    clearErrors();
    var b = collect();
    var f = quickCheck(b);
    if (Object.keys(f).length) { showFieldErrors(f); errBox.textContent = 'Please correct the highlighted fields.'; errBox.style.display = 'block'; return; }
    btn.disabled = true; btn.textContent = 'Submitting…';
    fetch('/api/community-discoveries/submit', {
      method: 'POST', credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b)
    }).then(function (r) { return r.json().catch(function () { return { ok: false, error: 'Unexpected response.' }; }); })
      .then(function (res) {
        if (res.ok) {
          document.getElementById('cdRef').textContent = res.ref;
          form.style.display = 'none';
          var s = document.getElementById('cdSuccess');
          s.style.display = 'block'; s.focus(); s.scrollIntoView({ behavior: 'smooth', block: 'start' });
          return;
        }
        errBox.textContent = res.error || 'Submission failed.';
        errBox.style.display = 'block';
        if (res.fields) showFieldErrors(res.fields);
        if (window.turnstile && cfg.turnstile) { try { window.turnstile.reset(); tsToken = null; } catch (e) {} }
        btn.disabled = false; btn.textContent = 'Submit for review';
        errBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }).catch(function () {
        errBox.textContent = 'Network error. Please try again.'; errBox.style.display = 'block';
        btn.disabled = false; btn.textContent = 'Submit for review';
      });
  });
})();
