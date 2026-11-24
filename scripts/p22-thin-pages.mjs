#!/usr/bin/env node
// Phase 22: crawlable explanatory content for thin / client-rendered pages.
// Idempotent: each block is wrapped in <!--p22:NAME--> ... <!--/p22:NAME--> and replaced on re-run.
// Data-driven tables read public/data/*.json at build time (editorial, already-public data only).
// NEVER reads or renders community submissions: pending/rejected items are not touched by this script.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pub = p => path.join(root, 'public', p);
const read = p => fs.readFileSync(pub(p), 'utf8');
const json = p => JSON.parse(read(p));
const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const A = (href, text) => `<a href="${href}" style="color:var(--neon-cyan); font-weight:700;">${text}</a>`;
const P = s => `<p style="color:#cbd5e1; line-height:1.65; margin:0 0 0.85rem;">${s}</p>`;
const H2 = s => `<h2 style="color:#fff; font-size:1.35rem; margin:0 0 0.7rem;">${s}</h2>`;
const H3 = s => `<h3 style="color:var(--neon-cyan); font-size:1.05rem; margin:1.1rem 0 0.45rem;">${s}</h3>`;
const UL = items => `<ul style="color:#cbd5e1; line-height:1.7; padding-left:1.2rem; margin:0 0 0.85rem;">${items.map(i => `<li>${i}</li>`).join('')}</ul>`;
const section = (id, inner) => `<section class="tool-box" id="${id}" style="margin:2rem 0 0;">\n${inner}\n</section>`;
const TD = 'style="padding:0.4rem 0.6rem; border-bottom:1px solid rgba(148,163,184,0.2); vertical-align:top;"';
const TH = 'style="padding:0.4rem 0.6rem; text-align:left; color:#fff; border-bottom:1px solid rgba(148,163,184,0.45);"';
const table = (head, rows) => `<div style="overflow-x:auto;"><table style="width:100%; border-collapse:collapse; font-size:0.88rem; color:#cbd5e1;"><thead><tr>${head.map(h => `<th ${TH}>${h}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map(c => `<td ${TD}>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;

function inject(file, name, html, anchorFn) {
  let h = read(file);
  const start = `<!--p22:${name}-->`, end = `<!--/p22:${name}-->`;
  const block = `${start}\n${html}\n${end}`;
  const re = new RegExp(`${start}[\\s\\S]*?${end.replace('/', '\\/')}`);
  if (re.test(h)) h = h.replace(re, () => block);
  else {
    const idx = anchorFn(h);
    if (idx < 0) throw new Error(`anchor not found for ${name} in ${file}`);
    h = h.slice(0, idx) + block + '\n' + h.slice(idx);
  }
  fs.writeFileSync(pub(file), h, 'utf8');
  console.log('injected', name, '->', file);
}
const beforeMainEnd = h => h.lastIndexOf('</main>');
function addJsonLd(file, id, obj) {
  let h = read(file);
  const tag = `<script type="application/ld+json" id="${id}">\n${JSON.stringify(obj, null, 2)}\n</script>`;
  const re = new RegExp(`<script type="application/ld\\+json" id="${id}">[\\s\\S]*?</script>`);
  if (re.test(h)) h = h.replace(re, () => tag);
  else h = h.replace('</head>', () => tag + '\n</head>');
  fs.writeFileSync(pub(file), h, 'utf8');
  console.log('jsonld', id, '->', file);
}
const ORIGIN = 'https://www.gta6heistguide.com';
const crumbs = list => ({ '@type': 'BreadcrumbList', itemListElement: list.map(([name, url], i) => ({ '@type': 'ListItem', position: i + 1, name, item: ORIGIN + url })) });

// ───────────────────────── /properties ─────────────────────────
{
  const d = json('data/properties.json');
  const slugs = fs.readdirSync(pub('properties')).filter(f => f.endsWith('.html')).map(f => f.slice(0, -5));
  const slugify = s => s.toLowerCase().replace(/\(.*?\)/g, '').replace(/['’]/g, '').replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const match = it => {
    const s = slugify(it.name);
    return slugs.find(x => x === s) || slugs.find(x => s.startsWith(x) || x.startsWith(s)) || null;
  };
  const rows = d.items.map(it => {
    const m = match(it);
    const name = m ? A('/properties/' + m, esc(it.name)) : esc(it.name);
    return [name, esc(it.propertyType), esc(it.region), esc(it.purchaseAvailability), esc(String(it.unlockRequirement || '').slice(0, 140))];
  });
  const c = d.counts;
  const html = section('property-database-guide', [
    H2('How the GTA 6 Property Database Works'),
    P(`This database separates what you can actually <strong>own</strong> from what you can only <strong>use</strong>. In GTA 6 Story Mode the ${c.storySafehouses} safehouses are unlocked by story progression and cannot be purchased, the ${c.purchasableGarages} purchasable garages are the only real estate you can buy (prices are not yet confirmed), and the ${c.fenceContacts} fence contacts are the characters who buy stolen goods and vehicles. Each record shows its region, how it is acquired, and whether it has a verified pin on the ${A('/map', 'interactive Leonida map')}.`),
    H3('How to use the database'),
    UL([
      'Use the search box and category filters in the database above to narrow the list by record type (Story Safehouse, Purchasable Garage, Story Garage, Bonus Garage, Fence, Vehicle Buyer) or by region.',
      'Open a record to see its unlock requirement, parking capacity, interior features, any missable warning and its verification status.',
      'Records with a map pin open directly on the interactive map so you can plan a route between a garage and a fence before a heist.',
      `Unverified regional leads (currently ${c.unverifiedLeads}) are listed for transparency but are <strong>not</strong> counted as fence contacts.`
    ]),
    H3('All property records at a glance'),
    P(`Every record in the database (${d.items.length} total), with its acquisition route. Individual guide pages are linked where they exist. Data updated ${esc(d.updated)}.`),
    table(['Record', 'Type', 'Region', 'Availability', 'Unlock requirement'], rows),
    H3('Acquisition rules worth knowing'),
    UL([
      'Houses cannot be bought in Story Mode; the four story safehouses unlock through Chapters 1 to 4. The Chapter 2 motel base closes after the &ldquo;Checking Out&rdquo; mission.',
      `The Paradise Garage in Watson Bay is a bonus garage included with the Ultimate Edition; see the ${A('/guides/ultimate-edition-bonuses-guide', 'Ultimate Edition bonuses guide')} for when it unlocks.`,
      `Brian&rsquo;s Lockup is a keypad-gated fence; its code is covered in the ${A('/guides/gta-6-safe-codes', 'safe codes guide')}.`,
      `Five fences buy stolen goods (Brian, Donnie, Dunk, Tyrone, Yasmani) and two buy vehicles (Moses, Randy). Compare their payouts in the ${A('/guides/fence-payout-comparison', 'fence payout comparison')}.`
    ]),
    H3('Related guides'),
    UL([
      A('/guides/all-story-safehouses', 'All story safehouses') + ' &mdash; unlock chapter and location of each safehouse.',
      A('/guides/all-gta-6-garages', 'All GTA 6 garages') + ' &mdash; purchasable, story and bonus garages compared.',
      A('/guides/all-7-fences-and-vehicle-buyers', 'All 7 fences and vehicle buyers') + ' &mdash; who buys what, and where.',
      A('/gta-6-property-ownership/', 'Property ownership guide') + ' &mdash; what you can and cannot buy in Story Mode.',
      A('/guides/protect-your-money-gta-6', 'Protect your money') + ' &mdash; banking and stash safety after a heist.'
    ])
  ].join('\n'));
  inject('properties.html', 'property-guide', html, beforeMainEnd);
}

// ───────────────────────── /gta-6-glitches/ ─────────────────────────
{
  const d = json('data/glitches.json');
  const rows = d.items.filter(i => i.type === 'glitch').map(i => [
    `<a href="#${esc(i.id)}" style="color:var(--neon-cyan); font-weight:700;">${esc(i.title.replace(/^\d+\.\s*/, ''))}</a>`, esc(i.status), esc(i.platform), esc(i.gameVersion), esc(i.lastTestedDate)
  ]);
  const html = section('glitch-tracker-guide', [
    H2('How to Read the GTA 6 Glitch &amp; Patch Status Tracker'),
    P('GTA 6 glitches change with every update, so this page tracks each one as a status rather than a one-off guide. Every entry names the platform, the game build it was tested on, the last test date and the evidence behind the status. A glitch is never marked patched or working without observed version evidence.'),
    H3('What the four statuses mean'),
    UL([
      '<strong>Confirmed Working</strong> &mdash; reproduced on the listed platform and build.',
      '<strong>Testing</strong> &mdash; under active testing; results may be inconsistent or hardware-dependent.',
      '<strong>Confirmed Patched</strong> &mdash; reproduced earlier but no longer works after an update (the status history records the build).',
      '<strong>Unverified</strong> &mdash; reported by players but not reproduced; treat as a rumor until upgraded.'
    ]),
    H3('How to use the tracker'),
    UL([
      'Use the search box to find a glitch by name, location or money amount, and the status buttons to show only working or patched entries.',
      'Switch on <em>Platform Specific Only</em> to show glitches that apply to a single console.',
      'Open an entry for step-by-step instructions, source evidence and its status history before you attempt it.'
    ]),
    H3('Current glitch ledger (static summary)'),
    P(`A plain-text summary of the tracked glitches from the data file, last synced ${esc(String(d.last_synced).slice(0, 10))}. The live tracker above is authoritative if the two ever differ.`),
    table(['Glitch', 'Status', 'Platform', 'Build', 'Last tested'], rows),
    H3('Before you test anything'),
    UL([
      `Make a manual save in an unused slot first. The ${A('/save-planner/', '15-slot save planner')} explains how to keep slot 15 for experiments.`,
      `Prefer legitimate high-payout routes? See the ${A('/gta-6-money-guide/', 'money and safe codes hub')} or the ${A('/guides/apollo-aggregates-red-barn-money-loop', 'Apollo Aggregates loop')}.`,
      `Looking for phone-dialer codes? They live on the ${A('/cheats', 'cheats page')}.`,
      `Found a glitch we have not listed? Send it through the ${A('/community-discoveries/submit/', 'discovery submission form')}; submissions are reviewed before anything is published.`
    ])
  ].join('\n'));
  inject('gta-6-glitches/index.html', 'glitch-guide', html, beforeMainEnd);
}

// ───────────────────────── /gta-6-discoveries/ ─────────────────────────
{
  const d = json('data/discoveries.json');
  const rows = d.items.map(i => [
    esc(i.title), esc(i.verificationStatus), esc(i.category), esc(i.location || ''), esc(i.date)
  ]);
  const html = section('discovery-process', [
    H2('How GTA 6 Discoveries Are Submitted and Verified'),
    P('This hub is a curated log, not an open comment feed. Entries above come from our editorial verification log. Player finds follow a separate, moderated route so nothing unreviewed ever appears on this page.'),
    H3('How to submit a discovery'),
    UL([
      `Open the ${A('/community-discoveries/submit/', 'submission form')}. Four fields are required: a title, a category, a description of what you found, where it is and how to reproduce it (20 to 4,000 characters), and a confirmation that it is your own observation.`,
      'Optional details help reviewers: region, platform, game version, exact location, map coordinates, and external screenshot or video links. File uploads are disabled; links are reviewed privately and never embedded automatically.',
      'You receive a reference number on submission. Keep it to ask for a correction or removal through the ' + A('/contact', 'contact page') + '.'
    ]),
    H3('What happens after you submit'),
    UL([
      'Every submission is reviewed by a person. Pending, rejected and &ldquo;needs more evidence&rdquo; submissions stay private and are never listed publicly, shown on the map or counted toward 100% completion.',
      `Approved entries are published on the ${A('/community-discoveries/', 'Community Discoveries page')} with an evidence label.`,
      'Your contact email, if you give one, is never shown publicly. Credit is shown only if you choose it.'
    ]),
    H3('Evidence levels'),
    UL([
      '<strong>Community Reported</strong> &mdash; accepted for publication, not independently verified by us.',
      '<strong>Corroborated</strong> &mdash; supported by multiple genuinely independent observations or credible evidence. Several sites repeating one original find do not count as independent.',
      '<strong>Independently Verified</strong> &mdash; reproduced by an authorized GTA6HeistGuide reviewer.'
    ]),
    P(`Our editorial standards are explained on the ${A('/about', 'About page')}. Looking for tested exploits instead? Check the ${A('/gta-6-glitches/', 'glitch and patch tracker')}.`),
    H3('Curated discoveries at a glance'),
    P(`Text index of the curated entries in the feed above (updated ${esc(d.updated)}).`),
    table(['Discovery', 'Status', 'Category', 'Location', 'Date'], rows)
  ].join('\n'));
  inject('gta-6-discoveries/index.html', 'discovery-process', html, beforeMainEnd);
}

// ───────────────────────── /live-intel ─────────────────────────
{
  const html = section('live-intel-guide', [
    H2('What Live Launch Intel Covers and How to Use It'),
    P('Live Launch Intel is the running log of verified GTA 6 launch news: patch and build notes, working exploits, safe codes, economy changes and radio or drops updates. Each dispatch above carries a date, a category and a verification badge, and the &ldquo;Last Verified&rdquo; stamp reflects the most recent editorial check of the whole feed.'),
    H3('How to use the dispatch feed'),
    UL([
      'Use the category buttons to filter dispatches: Glitches &amp; Cash, Patches &amp; Tech, Economy &amp; Safes, Story Progression, Cheats &amp; Exploits, and Radio &amp; Drops.',
      'Open any dispatch card for the full details and a direct jump to its pin on the interactive map where one exists.',
      'Check the build number at the top before trying an exploit: a newer patch can change or remove it.'
    ]),
    H3('Where to go next'),
    UL([
      A('/gta-6-glitches/', 'Glitch &amp; patch status tracker') + ' &mdash; every tracked glitch with its status, platform and build.',
      A('/cheats', 'Cheats') + ' &mdash; phone-dialer codes and their verification state.',
      A('/guides/gta-6-safe-codes', 'Safe codes guide') + ' &mdash; every verified safe and keypad code.',
      A('/gta-6-troubleshooting/', 'Troubleshooting center') + ' &mdash; fixes for crashes, downloads and performance.',
      A('/drops', 'Twitch drops') + ' and ' + A('/giveaways', 'giveaway tracker') + ' &mdash; reward campaigns tied to launch.',
      A('/live', 'Live companion HUD') + ' &mdash; the in-session companion view.',
      A('/map', 'Interactive Leonida map') + ' &mdash; every verified pin referenced in the feed.'
    ]),
    P(`How we verify claims is described on the ${A('/about', 'About page')}. To report a correction or a new find, use the ${A('/contact', 'contact page')} or the ${A('/community-discoveries/submit/', 'discovery submission form')}.`)
  ].join('\n'));
  inject('live-intel.html', 'live-intel-guide', html, beforeMainEnd);
  addJsonLd('live-intel.html', 'p22-ld-live-intel', {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'CollectionPage', '@id': ORIGIN + '/live-intel#page', name: 'GTA 6 Live Launch Intel & Patch Wire', url: ORIGIN + '/live-intel', description: 'Verified GTA 6 launch dispatches: patch and build notes, working exploits, safe codes and economy updates, each with a date and verification badge.', isPartOf: { '@type': 'WebSite', name: 'GTA6HeistGuide.com', url: ORIGIN + '/' }, inLanguage: 'en' },
      crumbs([['Home', '/'], ['Live Launch Intel', '/live-intel']])
    ]
  });
}

// ───────────────────────── /contact ─────────────────────────
{
  const html = section('contact-routing', [
    H2('Before You Write: Where Each Request Goes'),
    P('One inbox handles several kinds of requests. A few details in your first message let us act on it faster.'),
    UL([
      '<strong>Data correction:</strong> include the page URL, what is wrong, and the in-game evidence (build number, platform, screenshot link).',
      `<strong>New discovery:</strong> use the ${A('/community-discoveries/submit/', 'discovery submission form')} instead; it is reviewed before anything is published.`,
      `<strong>Privacy or removal request:</strong> see the ${A('/privacy-policy', 'Privacy Policy')} for what we store, then tell us which email or submission reference to remove.`,
      `<strong>DMCA or copyright notice:</strong> follow the process in the ${A('/terms', 'Terms of Service &amp; DMCA policy')}.`,
      `<strong>Sponsorship or partnership:</strong> read ${A('/about', 'how we work and disclose partners')} first.`
    ])
  ].join('\n'));
  inject('contact.html', 'contact-routing', html, h => h.lastIndexOf('</main>'));
}

// ───────────────────────── /map ─────────────────────────
{
  const m = json('data/map-pins.json');
  const html = section('map-guide', [
    H2('About the GTA 6 Interactive Leonida Map'),
    P(`This is a free interactive map of Leonida, the state in Grand Theft Auto VI, with ${m.total_pins} pins across heist targets, banks and vaults, jewelry and pawn shops, Ammu-Nation stores, properties and fences, wildlife habitats and Easter eggs. Pins link to the full guide for each location, and your progress is saved in your own browser.`),
    H3('How to use the map'),
    UL([
      'Search by name or code (for example a safe code, a fence or an animal) in the sidebar search box.',
      'Use the category rows to show or hide pin types; &ldquo;All&rdquo; and &ldquo;None&rdquo; toggle every category at once.',
      'Jump to a region with the region buttons above the map, or press &ldquo;Full Map&rdquo; to reset the view.',
      'Click a pin for its payout, difficulty, security notes, tips and escape route where known, then mark it as found. &ldquo;Next Unfound&rdquo; flies to the nearest pin you have not ticked and &ldquo;Hide Found&rdquo; clears completed pins.',
      'Drop your own custom pins and export or import a JSON backup from the Backup button. Personal pins and progress never leave your browser.'
    ]),
    H3('Map regions and their guides'),
    UL([
      A('/locations/vice-city', 'Vice City') + ' and ' + A('/locations/vice-beach', 'Vice Beach') + ' &mdash; the main city and its beachfront.',
      A('/port-gellhorn', 'Port Gellhorn') + ' &mdash; docks, ATMs, fences and the shipyard.',
      A('/locations/leonida-keys', 'Leonida Keys') + ' &mdash; the island chain, including Key Lento.',
      A('/locations/grassrivers', 'Grassrivers') + ' &mdash; swamp wetlands and airboat routes.',
      A('/locations/mount-kalaga', 'Mount Kalaga') + ' &mdash; mountain and national park hunting grounds.',
      A('/locations/lake-leonida', 'Lake Leonida') + ' and ' + A('/locations/ambrosia', 'Ambrosia') + ' &mdash; the inland lake and industrial district.'
    ]),
    H3('Related tools and guides'),
    UL([
      A('/gta-6-100-completion-tracker/', '100% completion tracker') + ' &mdash; track collectibles and milestones alongside map pins.',
      A('/articles/every-leonida-region-in-gta-6-mapped-escape-coordinates', 'Every Leonida region mapped') + ' &mdash; coordinates and escape routes by region.',
      A('/guides/gta-6-safe-codes', 'Safe codes guide') + ' &mdash; codes referenced by safe pins.',
      A('/guides/random-world-events', 'Random world events') + ' &mdash; dynamic encounters across the map.',
      A('/locations/apollo-aggregates-red-barn', 'Apollo Aggregates Red Barn') + ' &mdash; a popular pin with a repeatable cash loop.'
    ])
  ].join('\n'));
  inject('map.html', 'map-guide', html, h => h.indexOf('<div id="hudToast"'));
  // visible, descriptive H1 inside the sidebar badge (same box, same styling)
  let h = read('map.html');
  const oldBadge = '<span class="sidebar-title-badge">🗺️ LEONIDA MAP v4.5</span>';
  const newBadge = '<h1 class="sidebar-title-badge" style="margin:0; font-size:inherit; font-weight:inherit; line-height:inherit; letter-spacing:inherit;">🗺️ GTA 6 Interactive Leonida Map <span style="opacity:0.7;">v4.5</span></h1>';
  if (h.includes(oldBadge)) { h = h.replace(oldBadge, newBadge); fs.writeFileSync(pub('map.html'), h, 'utf8'); console.log('map h1 added'); }
  else if (!h.includes('<h1 class="sidebar-title-badge"')) throw new Error('map badge anchor missing');
  addJsonLd('map.html', 'p22-ld-map', {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'WebApplication', '@id': ORIGIN + '/map#app', name: 'GTA 6 Interactive Leonida Map', url: ORIGIN + '/map', description: 'Free interactive map of Leonida for Grand Theft Auto VI with searchable pins for heists, banks, safes, fences, properties, Ammu-Nation stores, wildlife and Easter eggs, plus a local progress tracker.', applicationCategory: 'GameApplication', operatingSystem: 'Any (web browser)', browserRequirements: 'Requires JavaScript', inLanguage: 'en', isAccessibleForFree: true, offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }, isPartOf: { '@type': 'WebSite', name: 'GTA6HeistGuide.com', url: ORIGIN + '/' } },
      crumbs([['Home', '/'], ['Interactive Leonida Map', '/map']])
    ]
  });
}
