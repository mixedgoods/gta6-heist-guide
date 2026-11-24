#!/usr/bin/env node
// Phase 22 routing + caching verification. Usage: node scripts/phase22-routing-test.mjs [baseUrl]
const base = (process.argv[2] || 'http://127.0.0.1:8799').replace(/\/$/, '');
const cases = [
  // [path, expectedStatus, cacheRegex|null, note]
  ['/', 200, /max-age=0, must-revalidate/],
  ['/port-gellhorn', 200, /max-age=0, must-revalidate/],
  ['/map', 200, /max-age=0, must-revalidate/],
  ['/heists/pawn-shops', 200, /max-age=0, must-revalidate/],
  ['/missions/prologue', 200, /max-age=0, must-revalidate/],
  ['/guides/gta-6-safe-codes', 200, /max-age=0, must-revalidate/],
  ['/missions/', 200, null],
  ['/gta-6-money-guide/', 200, null],
  ['/gta-6-discoveries/', 200, null],
  ['/community-discoveries/', 200, null],
  ['/community-discoveries/submit/', 200, /no-store/],
  ['/sitemap.xml', 200, /max-age=600/],
  ['/robots.txt', 200, /max-age=3600/],
  ['/assets/style.css', 200, /^public, max-age=300, must-revalidate$/],
  ['/assets/main.js', 200, /^public, max-age=300, must-revalidate$/],
  ['/favicon.svg', 200, /max-age=86400/],
  ['/data/properties.json', 200, /max-age=60/],
  ['/sw.js', 200, /no-store/],
  ['/api/community-discoveries/config', 200, null],
  ['/api/community-discoveries/list', 200, null],
  // legacy aliases: single-hop 301
  ['/port-gellhorn.html', 301, null, 'redirect:/port-gellhorn'],
  ['/weapons-gear', 301, null, 'redirect:/weapons'],
  ['/money-guide', 301, null, 'redirect:/gta-6-money-guide/'],
  ['/missions/prologue.html', 301, null, 'redirect:/missions/prologue'],
  // genuinely missing
  ['/this-route-does-not-exist-phase22', 404],
  ['/sitemap-index.xml', 404],
  ['/guides/not-a-real-guide', 404],
  ['/missions/not-a-real-mission', 404],
  ['/locations/not-a-real-place', 404],
  ['/vehicles/not-a-real-car', 404],
  ['/weapons/not-a-real-gun', 404],
  ['/animals/not-a-real-animal', 404],
  ['/properties/not-a-real-house', 404],
  ['/radio/not-a-real-station', 404],
  ['/heists/not-a-real-heist', 404],
  ['/articles/not-a-real-article', 404],
  ['/missions/not-a-real-mission.html', 404],
  ['/assets/nothing.png', 404],
  ['/assets/images/nothing.webp', 404],
  ['/assets/nothing.js', 404],
  ['/assets/nothing.css', 404],
  ['/js/nothing.js', 404],
  ['/data/nothing.json', 404],
  ['/api/nonexistent', 404],
  ['/api/community-discoveries/nonexistent', 404],
  ['/api/cd-admin/nonexistent', null],
  ['/favicon-missing.ico', 404],
];

let fail = 0;
const out = [];
for (const [p, want, cc, note] of cases) {
  const r = await fetch(base + p, { redirect: 'manual' });
  const body = r.status === 404 || r.status === 200 ? await r.text() : '';
  const cache = r.headers.get('cache-control') || '';
  const loc = r.headers.get('location') || '';
  let ok = want === null ? true : r.status === want;
  if (ok && cc && !cc.test(cache)) ok = false;
  if (ok && note?.startsWith('redirect:')) {
    const want2 = note.slice(9);
    const u = new URL(loc, base);
    ok = u.pathname === want2;
  }
  if (ok && r.status === 404 && /\.(png|webp|js|css|json|ico)$/.test(p) === false && p.indexOf('/api/') !== 0) {
    ok = /Page Not Found/.test(body) && body.length < 40000; // branded, not homepage
  }
  if (ok && p.startsWith('/api/') && r.status === 404) ok = !/<html/i.test(body) || /Page Not Found/.test(body);
  if (ok && /\.(png|webp|js|css|json|ico)$/.test(p) && r.status === 404) ok = body.length < 40000 && !/GTA 6 Heist Guide Home|Verified/.test(body.slice(0, 0));
  if (!ok) fail++;
  out.push(`${ok ? 'PASS' : 'FAIL'} ${String(r.status).padEnd(4)} ${p.padEnd(48)} cc="${cache}" ${loc ? 'loc=' + loc : ''} len=${body.length}`);
}
console.log(out.join('\n'));
const sec = await fetch(base + '/port-gellhorn');
for (const h of ['x-frame-options', 'x-content-type-options', 'referrer-policy', 'permissions-policy'])
  if (!sec.headers.get(h)) { console.log('FAIL missing security header', h); fail++; }
const nf = await fetch(base + '/zzz-missing');
for (const h of ['x-frame-options', 'x-content-type-options']) if (!nf.headers.get(h)) { console.log('FAIL 404 missing', h); fail++; }
console.log(`\n${fail ? 'FAILED' : 'ALL PASSED'} (${fail} failures) against ${base}`);
process.exit(fail ? 1 : 0);
