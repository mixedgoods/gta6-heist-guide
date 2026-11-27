#!/usr/bin/env node
/**
 * Phase 48 — Sanitized Monthly Monetization Scorecard Generator
 *
 * Reads an optional sanitized JSON data export (never credentials, never PII)
 * and generates a standardized Markdown monthly revenue scorecard separating:
 *   - Google AdSense (estimated vs. finalized earnings, never conflated)
 *   - Affiliate Partners (clicks vs. confirmed orders vs. confirmed commissions)
 *   - Direct Sponsorships (inquiries vs. signed/paid agreements)
 *   - Overall traffic & commercial-intent KPIs (GA4 & Search Console)
 *
 * Usage:
 *   node scripts/generate-monetization-scorecard.mjs
 *   node scripts/generate-monetization-scorecard.mjs --input path/to/monthly-export.json --output MONETIZATION-MONTHLY-SCORECARD.md
 */
import fs from 'node:fs';
import path from 'node:path';

const FORBIDDEN_SECRET_KEYS = /(?:password|secret|token|api[_-]?key|tax|ssn|ein|bank|routing|account[_-]?number|iban|swift|cookie|jwt|authorization)/i;

export function sanitizeExportObject(obj) {
  if (Array.isArray(obj)) return obj.map(sanitizeExportObject);
  if (!obj || typeof obj !== 'object') return obj;
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (FORBIDDEN_SECRET_KEYS.test(k)) continue;
    out[k] = sanitizeExportObject(v);
  }
  return out;
}

function fmtNum(val) {
  if (val === null || val === undefined || val === '') return 'Unavailable';
  const n = Number(val);
  return Number.isFinite(n) ? n.toLocaleString('en-US') : String(val);
}

function fmtUsd(val) {
  if (val === null || val === undefined || val === '') return 'Unavailable';
  const n = Number(val);
  return Number.isFinite(n) ? `$${n.toFixed(2)}` : String(val);
}

function fmtPct(val) {
  if (val === null || val === undefined || val === '') return 'Unavailable';
  const n = Number(val);
  return Number.isFinite(n) ? `${n.toFixed(2)}%` : String(val);
}

export function renderMonthlyScorecardMarkdown(rawData = {}) {
  const data = sanitizeExportObject(rawData || {});
  const period = data.period || new Date().toISOString().slice(0, 7);
  const generatedAt = data.generatedAt || new Date().toISOString().slice(0, 10);
  const ads = data.adsense || {};
  const aff = Array.isArray(data.affiliates) ? data.affiliates : [];
  const sponsors = data.sponsorships || {};
  const traffic = data.traffic || {};

  const confirmedAffUsd = aff.reduce((acc, row) => {
    const n = Number(row.confirmedCommissionsUsd);
    return Number.isFinite(n) ? acc + n : acc;
  }, 0);
  const hasAnyConfirmedAff = aff.some((row) => row.confirmedCommissionsUsd !== null && row.confirmedCommissionsUsd !== undefined);
  const adsFinalized = Number(ads.finalizedEarningsUsd);
  const sponsorPaid = Number(sponsors.paidRevenueUsd);
  const totalConfirmed =
    (Number.isFinite(adsFinalized) ? adsFinalized : 0) +
    (hasAnyConfirmedAff ? confirmedAffUsd : 0) +
    (Number.isFinite(sponsorPaid) ? sponsorPaid : 0);

  const lines = [
    `# GTA6HeistGuide — Monthly Monetization Scorecard (${period})`,
    '',
    `- **Reporting Period:** ${period}`,
    `- **Generated:** ${generatedAt}`,
    `- **Data Integrity Policy:** Estimated AdSense earnings are never mixed with finalized payments. Affiliate clicks are never counted as orders or revenue. Unavailable metrics are explicitly marked \`Unavailable\`.`,
    '',
    '## 1. Google AdSense Summary',
    '',
    '| Metric | Value | Classification |',
    '|---|---:|---|',
    `| Site Approval Status | ${ads.siteStatus || 'Unavailable'} | Account status |`,
    `| Estimated Earnings (USD) | ${fmtUsd(ads.estimatedEarningsUsd)} | Estimated (unfinalized) |`,
    `| Finalized Payments (USD) | ${fmtUsd(ads.finalizedEarningsUsd)} | Finalized revenue |`,
    `| Page Views | ${fmtNum(ads.pageViews)} | AdSense report |`,
    `| Ad Requests | ${fmtNum(ads.adRequests)} | AdSense report |`,
    `| Matched Requests | ${fmtNum(ads.matchedRequests)} | AdSense report |`,
    `| Ad Impressions | ${fmtNum(ads.impressions)} | AdSense report |`,
    `| Ad Coverage | ${fmtPct(ads.coveragePct)} | AdSense report |`,
    `| Page RPM (USD) | ${fmtUsd(ads.pageRpmUsd)} | AdSense report |`,
    `| Impression RPM (USD) | ${fmtUsd(ads.impressionRpmUsd)} | AdSense report |`,
    '',
    '## 2. Affiliate Partner Performance',
    '',
    '| Partner | Outbound Clicks | Confirmed Orders | Conversion Rate | Confirmed Commissions (USD) | EPC (USD) |',
    '|---|---:|---:|---:|---:|---:|',
  ];

  if (aff.length === 0) {
    lines.push('| *(No merchant export provided)* | Unavailable | Unavailable | Unavailable | Unavailable | Unavailable |');
  } else {
    for (const row of aff) {
      const clicks = Number(row.clicks);
      const comm = Number(row.confirmedCommissionsUsd);
      const epc = Number.isFinite(clicks) && clicks > 0 && Number.isFinite(comm) ? fmtUsd(comm / clicks) : 'Unavailable';
      lines.push(
        `| ${row.partner || 'Unknown'} | ${fmtNum(row.clicks)} | ${fmtNum(row.confirmedOrders)} | ${fmtPct(row.conversionRatePct)} | ${fmtUsd(row.confirmedCommissionsUsd)} | ${epc} |`
      );
    }
  }

  lines.push(
    '',
    '## 3. Direct Sponsorships',
    '',
    '| Metric | Value |',
    '|---|---:|',
    `| Inbound Sponsor Inquiries | ${fmtNum(sponsors.inquiries)} |`,
    `| Active Signed Agreements | ${fmtNum(sponsors.activeAgreements)} |`,
    `| Paid Sponsorship Revenue (USD) | ${fmtUsd(sponsors.paidRevenueUsd)} |`,
    '',
    '## 4. Traffic & Overall Revenue Summary',
    '',
    '| Metric | Value |',
    '|---|---:|',
    `| GA4 Active Users | ${fmtNum(traffic.activeUsers)} |`,
    `| GA4 Sessions | ${fmtNum(traffic.sessions)} |`,
    `| GA4 Page Views | ${fmtNum(traffic.pageViews)} |`,
    `| GSC Organic Clicks | ${fmtNum(traffic.gscClicks)} |`,
    `| GSC Organic Impressions | ${fmtNum(traffic.gscImpressions)} |`,
    `| **Total Confirmed Revenue (USD)** | **${fmtUsd(totalConfirmed)}** |`,
    ''
  );

  return lines.join('\n');
}

// CLI execution
const isMain = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
if (isMain) {
  const args = process.argv.slice(2);
  let inputPath = '';
  let outputPath = '';
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--input' && args[i + 1]) inputPath = args[++i];
    if (args[i] === '--output' && args[i + 1]) outputPath = args[++i];
  }
  let payload = {};
  if (inputPath) {
    payload = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  }
  const md = renderMonthlyScorecardMarkdown(payload);
  if (outputPath) {
    fs.writeFileSync(outputPath, md, 'utf8');
    console.log(`Wrote sanitized scorecard to ${outputPath}`);
  } else {
    process.stdout.write(md);
  }
}
