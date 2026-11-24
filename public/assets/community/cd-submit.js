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
    Object.keys(fields || {}).forEach(function (k) {
      var el = form.elements[k] || form.elements[k === 'coords' ? 'coord_xpct' : k];
      var msg = document.createElement('div');
      msg.className = 'cd-err';
      msg.textContent = fields[k];
      if (el && el instanceof Element) {
        el.classList.add('invalid');
        (el.closest('label') || el.parentNode).appendChild(msg);
      } else if (el && el.length && el[0] instanceof Element) {
        (el[0].closest('div') || el[0].parentNode).appendChild(msg);
      } else { errBox.textContent += ' ' + fields[k]; errBox.style.display = 'block'; }
    });
  }

  function val(n) { var e = form.elements[n]; return e ? String(e.value || '').trim() : ''; }

  function collect() {
    var wit = form.querySelector('input[name=witnessed]:checked');
    var urls = val('source_urls').split(/\n+/).map(function (s) { return s.trim(); }).filter(Boolean);
    var named = form.elements.credit_named.checked;
    return {
      title: val('title'), category: val('category'), short_description: val('short_description'),
      detailed_explanation: val('detailed_explanation'), region: val('region'),
      location_description: val('location_description'), directions: val('directions'),
      coord_xpct: val('coord_xpct'), coord_ypct: val('coord_ypct'),
      platform: val('platform'), game_version: val('game_version'), discovered_on: val('discovered_on'),
      witnessed: wit ? wit.value : '', evidence_description: val('evidence_description'),
      sources_text: val('sources_text'), source_urls: urls, screenshot_url: val('screenshot_url'), video_url: val('video_url'),
      display_name: val('display_name'), credit_pref: named ? 'named' : 'anonymous', contact_email: val('contact_email'),
      originality_ack: form.elements.originality_ack.checked, license_ack: form.elements.license_ack.checked,
      image_rights_ack: form.elements.image_rights_ack.checked, website: val('website'),
      turnstile_token: tsToken || undefined
    };
  }

  // Light client checks only for convenience; the server is the authority.
  function quickCheck(b) {
    var f = {};
    if (b.title.length < 5) f.title = 'Enter a title (at least 5 characters).';
    if (!b.category) f.category = 'Choose a category.';
    if (b.short_description.length < 20) f.short_description = 'At least 20 characters.';
    if (b.detailed_explanation.length < 50) f.detailed_explanation = 'At least 50 characters.';
    if (!b.region) f.region = 'Choose a region.';
    if (b.location_description.length < 10) f.location_description = 'At least 10 characters.';
    if (b.directions.length < 20) f.directions = 'At least 20 characters.';
    if (!b.platform) f.platform = 'Choose a platform.';
    if (!b.discovered_on) f.discovered_on = 'Enter the date.';
    if (!b.witnessed) f.witnessed = 'Please answer this question.';
    if (b.evidence_description.length < 20) f.evidence_description = 'At least 20 characters.';
    if (!b.originality_ack) f.originality_ack = 'This confirmation is required.';
    if (!b.license_ack) f.license_ack = 'This confirmation is required.';
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
