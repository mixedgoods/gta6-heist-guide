#!/usr/bin/env node
// Phase 22 internal-link planner/applier.
// For every canonical page with <= 2 inbound content links (excluding /about and legal pages, handled by hand),
// choose genuinely related source pages and append a contextual <li> to the source's "Related" list.
// Relevance signals: the target already links to the source (reciprocal), shared topical title tokens,
// same section directory. A per-source cap prevents link dumping. Idempotent via data-p22 marker.
// Usage: node scripts/p22-internal-links.mjs [--apply] [--json plan.json]
import fs from 'node:fs';
import { buildGraph } from './link-graph.mjs';

const APPLY = process.argv.includes('--apply');
const TARGET_MIN = 3;
const PER_SOURCE_CAP = 6;
const EXCLUDE_TARGET = new Set(['/about', '/privacy-policy', '/terms', '/contact', '/drops', '/giveaways']); // handled by hand on the utility pages
const RADIO_GROUPS = [
  ['/radio/cocoteo-fm', '/radio/radio-la-ola', '/radio/afrobank-fm', '/radio/radio-on-u'],
  ['/radio/leonida-jazz-radio', '/radio/worldwide-fm', '/radio/honey-fm', '/radio/gloriana-blues-radio', '/radio/emotion-98-3', '/radio/symphony-fm'],
  ['/radio/circoloco-records-radio', '/radio/stockyard-fm', '/radio/kaleidoscope-fm', '/radio/flash-fm', '/radio/vice-city-fm'],
  ['/radio/the-chamber-106-6', '/radio/v-rock', '/radio/back-country-radio', '/radio/wktt', '/radio/the-wipe-99-9'],
];
const STOP = new Set('gta 6 guide guides location locations walkthrough specs spec class heist best and the of in to for a vs how all complete your with is are what where when ch chapter radio station station guide amp quot x27 mission missions q a qa unlock rewards verified status reference'.split(' '));

const decode = s => s.replace(/&amp;/g, '&').replace(/&#x27;|&#39;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/&rsquo;/g, "'").replace(/&mdash;/g, '-');
const tokens = t => new Set(decode(t).toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').split(/\s+/).filter(w => w.length > 2 && !STOP.has(w) && !/^\d+$/.test(w)));
const dir = p => p.split('/')[1] || '';

const g = buildGraph();
const { paths, inbound, outbound, info } = g;
const tok = new Map(paths.map(p => [p, tokens((info.get(p).title || '').split('|')[0] + ' ' + (info.get(p).h1 || ''))]));
const metaDesc = p => {
  const h = fs.readFileSync(info.get(p).file, 'utf8');
  return decode((h.match(/<meta name="description" content="([^"]*)"/i) || [])[1] || '');
};
const label = p => {
  const i = info.get(p);
  let t = decode(i.title.split('|')[0]).trim();
  if (t.length > 80 && i.h1) t = decode(i.h1).replace(/<[^>]+>/g, '').trim();
  return t.replace(/\s+/g, ' ');
};
const blurb = p => {
  const d = metaDesc(p);
  const first = d.split(/(?<=[.!?])\s/)[0] || '';
  return first.length >= 30 && first.length <= 140 ? first : '';
};

const added = new Map(paths.map(p => [p, 0]));
const plan = [];
const targets = paths.filter(p => inbound.get(p).size < TARGET_MIN && !EXCLUDE_TARGET.has(p))
  .sort((a, b) => inbound.get(a).size - inbound.get(b).size);

for (const T of targets) {
  const need = TARGET_MIN - inbound.get(T).size;
  const tt = tok.get(T);
  const cands = [];
  for (const S of paths) {
    if (S === T || S === '/' || S === '/map' || inbound.get(T).has(S) || EXCLUDE_TARGET.has(S) || ['/drops', '/giveaways'].includes(S)) continue;
    let overlap = 0;
    for (const w of tt) if (tok.get(S).has(w)) overlap++;
    const recip = outbound.get(T).has(S) ? 1 : 0;
    const same = dir(S) === dir(T) ? 1 : 0;
    const score = recip * 4 + Math.min(overlap, 4) * 2.2 + same * 1.4 + Math.min(inbound.get(S).size, 12) * 0.05;
    // relevance gate: need reciprocal or topical overlap (same-directory alone is not enough)
    if (recip || overlap >= 1) cands.push({ S, score, recip, overlap, same });
  }
  cands.sort((a, b) => b.score - a.score);
  const picks = [];
  const grp = RADIO_GROUPS.find(gp => gp.includes(T));
  if (grp) {
    // Radio stations: genre-sibling ring (each station links to the next two stations in its genre cluster)
    const i = grp.indexOf(T);
    for (let k = 1; k < grp.length && picks.length < need; k++) {
      const S = grp[(i - k + grp.length) % grp.length];
      if (!inbound.get(T).has(S) && paths.includes(S)) { picks.push({ S, score: 20, recip: 0, overlap: 0 }); added.set(S, added.get(S) + 1); }
    }
    plan.push({ target: T, before: inbound.get(T).size, need, picks: picks.map(c => ({ source: c.S, score: 20, recip: 0, overlap: 0, ring: 'radio-genre' })), unmet: need - picks.length });
    continue;
  }
  for (const c of cands) {
    if (picks.length >= need) break;
    if (added.get(c.S) >= PER_SOURCE_CAP) continue;
    // minimum bar: reciprocal, or >=2 overlapping topical tokens, or same-dir + 1 overlapping token
    if (!(c.recip || c.overlap >= 2 || (c.same && c.overlap >= 1))) continue;
    picks.push(c);
    added.set(c.S, added.get(c.S) + 1);
  }
  plan.push({ target: T, before: inbound.get(T).size, need, picks: picks.map(c => ({ source: c.S, score: +c.score.toFixed(1), recip: c.recip, overlap: c.overlap })), unmet: need - picks.length });
}

const unmet = plan.filter(p => p.unmet > 0);
console.log(`targets=${plan.length} links planned=${plan.reduce((a, p) => a + p.picks.length, 0)} targets still short=${unmet.length}`);
if (process.argv.includes('--verbose')) for (const p of plan) console.log(p.before, p.target, '<-', p.picks.map(x => `${x.source}[${x.score}${x.recip ? 'R' : ''}]`).join(' '), p.unmet ? `SHORT ${p.unmet}` : '');
const j = process.argv.indexOf('--json');
if (j > 0) fs.writeFileSync(process.argv[j + 1], JSON.stringify(plan, null, 1));

if (APPLY) {
  const bySource = new Map();
  for (const p of plan) for (const pk of p.picks) {
    if (!bySource.has(pk.source)) bySource.set(pk.source, []);
    bySource.get(pk.source).push(p.target);
  }
  let files = 0, links = 0;
  for (const [S, ts] of bySource) {
    const f = info.get(S).file;
    let html = fs.readFileSync(f, 'utf8');
    const items = ts.filter(T => !html.includes(`data-p22="${T}"`)).map(T => {
      const b = blurb(T);
      return `<li data-p22="${T}"><a href="${T}">${label(T).replace(/&/g, '&amp;')}</a>${b ? ' &mdash; ' + b.replace(/&/g, '&amp;') : ''}</li>`;
    });
    if (!items.length) continue;
    const m = html.match(/(<section[^>]*id="related"[\s\S]*?<ul[^>]*>)([\s\S]*?)(<\/ul>)/i);
    if (m) {
      const idx = m.index + m[1].length + m[2].length;
      html = html.slice(0, idx) + items.join('') + html.slice(idx);
    } else {
      const guideMain = /<main[^>]*class="g-wrap"/.test(html);
      const block = guideMain
        ? `
    <section class="g-section" id="related-p22" aria-labelledby="rel-p22-h">
        <h2 id="rel-p22-h">Related GTA 6 Guides</h2>
        <ul>${items.join('')}</ul>
    </section>
`
        : `
    <section class="tool-box" id="related-p22" aria-labelledby="rel-p22-h" style="margin:2rem auto 0; max-width:1100px;">
        <h2 id="rel-p22-h" style="font-size:1.25rem; margin:0 0 0.6rem;">Related GTA 6 Guides</h2>
        <ul style="line-height:1.8; padding-left:1.2rem; margin:0;">${items.join('')}</ul>
    </section>
`;
      const k = html.lastIndexOf('</main>');
      if (k < 0) { console.log('NO <main> in', S); continue; }
      html = html.slice(0, k) + block + html.slice(k);
    }
    fs.writeFileSync(f, html, 'utf8');
    files++; links += items.length;
  }
  console.log(`applied: ${links} links across ${files} source files`);
}
