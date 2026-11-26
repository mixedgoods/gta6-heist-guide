(function () {
  'use strict';
  // Renders exclusively via safe DOM nodes and textContent (zero innerHTML sinks).
  // Protected behind Cloudflare Access via /cd-admin/_middleware.js and /api/cd-admin/_middleware.js.

  function $(id) { return document.getElementById(id); }
  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text !== undefined && text !== null) node.textContent = String(text);
    return node;
  }

  function renderKpis(data) {
    var grid = $('kpiGrid');
    grid.textContent = '';
    var rev = data.revenueSummary || {};
    var cards = [
      { label: 'Total Actual Clicks', val: String(data.totalClicks || 0), sub: 'All-time D1 outbound clicks (' + (rev.qaProbeClicks || 0) + ' QA/probe)' },
      { label: 'Last 7 Days Clicks', val: String(data.totalClicks7d || 0), sub: 'Rolling 7-day actual clicks' },
      { label: 'Last 30 Days Clicks', val: String(data.totalClicks30d || 0), sub: 'Rolling 30-day actual clicks' },
      { label: 'Confirmed Purchases', val: rev.confirmedPurchases === null || rev.confirmedPurchases === undefined ? 'Awaiting merchant report' : String(rev.confirmedPurchases), sub: 'Never inferred from clicks', pending: rev.confirmedPurchases == null },
      { label: 'Confirmed Commissions', val: rev.confirmedCommissionsUsd === null || rev.confirmedCommissionsUsd === undefined ? 'Awaiting merchant report' : ('$' + Number(rev.confirmedCommissionsUsd).toFixed(2)), sub: 'Verified merchant payouts only', pending: rev.confirmedCommissionsUsd == null },
      { label: 'Estimated Revenue', val: rev.estimatedRevenueUsd === null || rev.estimatedRevenueUsd === undefined ? 'Not fabricated' : ('$' + Number(rev.estimatedRevenueUsd).toFixed(2)), sub: 'Requires verified conversion rate', pending: rev.estimatedRevenueUsd == null }
    ];
    cards.forEach(function (c) {
      var box = el('div', 'kpi');
      box.appendChild(el('div', 'kpi-label', c.label));
      box.appendChild(el('div', c.pending ? 'kpi-val pending' : 'kpi-val', c.val));
      box.appendChild(el('div', 'kpi-sub', c.sub));
      grid.appendChild(box);
    });
  }

  function renderTable(containerId, headers, rows) {
    var host = $(containerId);
    host.textContent = '';
    if (!rows || !rows.length) {
      host.appendChild(el('div', 'empty', 'No recorded click data in this window.'));
      return;
    }
    var table = el('table');
    var thead = el('thead');
    var htr = el('tr');
    headers.forEach(function (h) {
      var th = el('th', h.num ? 'num' : '', h.label);
      htr.appendChild(th);
    });
    thead.appendChild(htr);
    table.appendChild(thead);

    var tbody = el('tbody');
    rows.forEach(function (r) {
      var tr = el('tr');
      headers.forEach(function (h, idx) {
        var td = el('td', h.num ? 'num' : '', r[idx]);
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    host.appendChild(table);
  }

  function loadDashboard() {
    var status = $('statusBanner');
    status.textContent = 'Loading protected affiliate click report...';
    status.className = '';

    fetch('/api/cd-admin/affiliate-report', { credentials: 'same-origin' })
      .then(function (res) {
        return res.text().then(function (txt) {
          var parsed = null;
          try { parsed = JSON.parse(txt); } catch (e) { parsed = null; }
          if (!res.ok || !parsed || !parsed.ok) {
            throw new Error((parsed && parsed.error) || ('HTTP ' + res.status + ' — Unauthorized or unavailable.'));
          }
          return parsed;
        });
      })
      .then(function (data) {
        status.textContent = 'Loaded D1 affiliate click report (' + (data.totalClicks || 0) + ' total clicks).';
        renderKpis(data);

        var partners = Object.keys(data.byPartner || {}).sort(function (a, b) {
          return (data.byPartner[b] || 0) - (data.byPartner[a] || 0);
        });
        renderTable(
          'merchantTable',
          [{ label: 'Merchant' }, { label: 'All-Time', num: true }, { label: '7d', num: true }, { label: '30d', num: true }],
          partners.map(function (p) {
            return [p, data.byPartner[p] || 0, (data.last7DaysByPartner && data.last7DaysByPartner[p]) || 0, (data.last30DaysByPartner && data.last30DaysByPartner[p]) || 0];
          })
        );

        renderTable(
          'pageTable',
          [{ label: 'Landing Page' }, { label: 'Actual Clicks', num: true }],
          (data.byPage || []).map(function (x) { return [x.page_path, x.clicks]; })
        );

        renderTable(
          'productTable',
          [{ label: 'Product / Identifier' }, { label: 'Merchant' }, { label: 'Actual Clicks', num: true }],
          (data.byProduct || []).map(function (x) { return [x.product_id, x.partner, x.clicks]; })
        );

        renderTable(
          'placementTable',
          [{ label: 'Placement' }, { label: 'Actual Clicks', num: true }],
          (data.byPlacement || []).map(function (x) { return [x.placement, x.clicks]; })
        );

        renderTable(
          'dailyTable',
          [{ label: 'Date (UTC)' }, { label: 'Actual Clicks', num: true }],
          (data.dailyTrend || []).map(function (x) { return [x.date, x.clicks]; })
        );

        renderTable(
          'weeklyTable',
          [{ label: 'Week' }, { label: 'Actual Clicks', num: true }],
          (data.weeklyTrend || []).map(function (x) { return [x.week, x.clicks]; })
        );

        renderTable(
          'recentTable',
          [{ label: 'Timestamp (UTC)' }, { label: 'Merchant' }, { label: 'Placement' }, { label: 'Source Page' }],
          (data.recent || []).map(function (x) { return [x.created_at || '', x.partner || '', x.placement || '', x.page_path || '/']; })
        );
      })
      .catch(function (err) {
        status.textContent = err && err.message ? err.message : 'Unable to load affiliate click report.';
        status.className = 'err';
      });
  }

  var btn = $('refreshBtn');
  if (btn) btn.addEventListener('click', loadDashboard);
  loadDashboard();
})();
