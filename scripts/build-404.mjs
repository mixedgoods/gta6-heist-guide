#!/usr/bin/env node
// Builds public/404.html from the site's shared nav/footer (taken from public/contact.html).
// Cloudflare Pages serves /404.html with HTTP 404 for any path with no matching asset or redirect.
// All URLs inside are absolute-path so the page renders correctly at any missing URL depth.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = fs.readFileSync(path.join(root, 'public', 'contact.html'), 'utf8');

const chrome = src.slice(src.indexOf('<div class="countdown-strip"'), src.indexOf('</nav>') + '</nav>'.length);
const footer = src.slice(src.indexOf('<footer>'), src.indexOf('</footer>') + '</footer>'.length);
if (!chrome.includes('siteNavbar') || !footer.includes('footer-spread-wrap')) throw new Error('template extraction failed');

const links = [
  ['/', 'Home: all heists and payouts'],
  ['/map', 'Interactive Leonida map'],
  ['/missions/', 'Mission walkthrough hub'],
  ['/gta-6-money-guide/', 'Money and cash guide'],
  ['/gta-6-database/', 'World database hub'],
  ['/gta-6-collectibles/', 'Collectibles and 100% guide'],
  ['/port-gellhorn', 'Port Gellhorn guide'],
  ['/weapons', 'Weapons database'],
];

const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <link rel="icon" type="image/svg+xml" href="/favicon.svg">
    <meta charset="UTF-8">
    <meta name="robots" content="noindex, nofollow">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Page Not Found (404) | GTA6HeistGuide.com</title>
    <meta name="description" content="This GTA6HeistGuide.com page does not exist or has moved. Use the links to find heist guides, mission walkthroughs, the interactive map and the world database.">
    <link rel="stylesheet" href="/assets/style.css?v=20261122_v23">
</head>
<body>

${chrome}

<main class="container" style="max-width:860px; padding-top:2.5rem; padding-bottom:3.5rem;">
    <section class="tool-box pink-glow" style="margin-bottom:2rem;">
        <span class="user-badge badge-mastermind" style="margin-bottom:0.65rem;">ERROR 404</span>
        <h1 style="color:#fff; font-size:clamp(1.7rem, 3.4vw, 2.3rem); margin:0 0 0.65rem;">Page Not Found</h1>
        <p style="color:var(--text-muted); font-size:0.95rem; line-height:1.6;">
            The page you requested does not exist, was retired, or the address was mistyped. Nothing is wrong on your end. Try one of the main sections below, or head back to the homepage.
        </p>
        <ul style="line-height:2; padding-left:1.2rem; margin:1rem 0 0;">
${links.map(([h, t]) => `            <li><a href="${h}" style="color:var(--neon-cyan); font-weight:700;">${t}</a></li>`).join('\n')}
        </ul>
        <p style="color:var(--text-muted); font-size:0.85rem; margin-top:1.25rem;">
            Think a page is missing that should exist? <a href="/contact" style="color:var(--neon-cyan);">Tell us on the contact page</a>.
        </p>
    </section>
</main>

${footer}

<script src="/site-config.js"></script>
<script src="/assets/main.js" defer></script>
</body>
</html>
`;
fs.writeFileSync(path.join(root, 'public', '404.html'), html, 'utf8');
console.log('wrote public/404.html', html.length, 'bytes');
