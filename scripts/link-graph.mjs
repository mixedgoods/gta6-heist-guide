#!/usr/bin/env node
// Internal link graph analysis for the 500 canonical sitemap URLs.
// "Content links" = anchors inside <main> (or the body minus nav/footer) pointing to another canonical page. Unique source pages only.
// Usage: node scripts/link-graph.mjs [--json out.json]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pub = path.join(root, 'public');
const ORIGIN = 'https://www.gta6heistguide.com';

export function sitemapPaths() {
  const x = fs.readFileSync(path.join(pub, 'sitemap.xml'), 'utf8');
  return [...x.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => new URL(m[1]).pathname);
}
export function fileFor(p) {
  const rel = p === '/' ? 'index.html' : p.endsWith('/') ? p.slice(1) + 'index.html' : p.slice(1) + '.html';
  const f = path.join(pub, rel);
  if (fs.existsSync(f)) return f;
  const g = path.join(pub, p.slice(1), 'index.html');
  return fs.existsSync(g) ? g : null;
}
export function contentRegion(html) {
  let h = html.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<!--[\s\S]*?-->/g, '');
  const m = h.match(/<main[\s\S]*?<\/main>/i);
  if (m) return m[0];
  h = h.replace(/<nav[\s\S]*?<\/nav>/gi, '').replace(/<footer[\s\S]*?<\/footer>/gi, '').replace(/<header[\s\S]*?<\/header>/gi, '');
  return h;
}
export function normalize(href, from) {
  if (!href || /^(mailto:|tel:|javascript:|#)/i.test(href)) return null;
  let u;
  try { u = new URL(href, ORIGIN + from); } catch { return null; }
  if (u.origin !== ORIGIN) return null;
  let p = u.pathname;
  if (p.endsWith('.html')) p = p.slice(0, -5);
  if (p === '/index') p = '/';
  return p;
}
export function buildGraph() {
  const paths = sitemapPaths();
  const set = new Set(paths);
  // canonical form lookup: sitemap uses trailing slash for some
  const canon = new Map();
  for (const p of paths) { canon.set(p, p); canon.set(p.replace(/\/$/, '') || '/', p); }
  const inbound = new Map(paths.map(p => [p, new Set()]));
  const outbound = new Map(paths.map(p => [p, new Set()]));
  const info = new Map();
  for (const p of paths) {
    const f = fileFor(p);
    if (!f) { info.set(p, { missing: true }); continue; }
    const html = fs.readFileSync(f, 'utf8');
    const title = (html.match(/<title>([^<]*)<\/title>/i) || [])[1] || '';
    const h1 = ((html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || [])[1] || '').replace(/<[^>]+>/g, '').trim();
    info.set(p, { file: f, title, h1 });
    const region = contentRegion(html);
    for (const m of region.matchAll(/<a\s[^>]*href=["']([^"']+)["']/gi)) {
      const n = normalize(m[1], p);
      if (!n) continue;
      const c = canon.get(n);
      if (!c || c === p) continue;
      inbound.get(c).add(p);
      outbound.get(p).add(c);
    }
  }
  return { paths, inbound, outbound, info };
}

if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}` || process.argv[1]?.endsWith('link-graph.mjs')) {
  const { paths, inbound, info } = buildGraph();
  const rows = paths.map(p => ({ path: p, inbound: inbound.get(p).size, title: info.get(p)?.title || '' }));
  const hist = {};
  for (const r of rows) hist[Math.min(r.inbound, 5)] = (hist[Math.min(r.inbound, 5)] || 0) + 1;
  console.log('pages', rows.length, 'missing files', paths.filter(p => info.get(p)?.missing).length);
  console.log('inbound histogram (5 = 5+):', JSON.stringify(hist));
  console.log('<=2:', rows.filter(r => r.inbound <= 2).length, ' ==1:', rows.filter(r => r.inbound === 1).length, ' ==0:', rows.filter(r => r.inbound === 0).map(r => r.path).join(','));
  const j = process.argv.indexOf('--json');
  if (j > 0) fs.writeFileSync(process.argv[j + 1], JSON.stringify(rows, null, 1));
}
