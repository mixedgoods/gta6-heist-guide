#!/usr/bin/env python3
"""Builds the six new guide pages under public/ using the site's existing header/nav/footer (taken from about.html).

Run:  python scripts/build_guides.py
Idempotent: regenerates public/{missions,gta-6-controls,gta-6-troubleshooting,gta-6-collectibles,gta-6-vehicles-guide,gta-6-property-ownership}/index.html

Evidence policy: nothing here is labelled IN-GAME VERIFIED. Facts are labelled per GTA6-CONTENT-SOURCE-REGISTER.md.
"""
import html, json, os, re, sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
PUB = os.path.join(ROOT, 'public')
ORIGIN = 'https://www.gta6heistguide.com'
VERIFIED = '2026-11-23'
VERIFIED_LONG = 'November 23, 2026'
BUILD = 'launch build 01.002.001'
CSS_VER = '20261123_g1'
e = html.escape


def read(p):
    with open(os.path.join(PUB, p), encoding='utf-8', newline='') as f:
        return f.read()


def load(p):
    return json.loads(read(p))


ABOUT = read('about.html').replace('\r\n', '\n')
NAV = ABOUT[ABOUT.index('<div class="countdown-strip"'):ABOUT.index('</nav>') + 6]
FOOTER = ABOUT[ABOUT.index('<footer>'):ABOUT.index('</footer>') + 9]
STYLE_HREF = re.search(r'<link rel="stylesheet" href="(/assets/style\.css[^"]*)"', ABOUT).group(1)

BADGES = {
    'conf': ('g-b-conf', 'ROCKSTAR CONFIRMED'),
    'ind': ('g-b-ind', 'INDEPENDENTLY REPORTED'),
    'com': ('g-b-com', 'COMMUNITY REPORTED'),
    'unv': ('g-b-unv', 'UNVERIFIED / UNRESOLVED'),
    'sim': ('g-b-sim', 'FAN-MADE SIMULATION'),
    'site': ('g-b-site', 'EXISTING SITE DATA'),
}


def badge(k, text=None):
    c, t = BADGES[k]
    return f'<span class="g-badge {c}">{e(text or t)}</span>'


def evidence(extra=''):
    return (f'<div class="g-evidence"><strong>Evidence status.</strong> Last verified {VERIFIED_LONG} · {BUILD} · PlayStation 5 and Xbox Series X|S. '
            'This site has <strong>not</strong> run in-game tests for this page; nothing here is labelled "in-game verified". '
            'Each fact carries a label and the full ledger is kept in the project\'s source register. '
            f'{extra}</div>')


def faq_html(faqs):
    out = ['<section class="g-section g-faq" aria-labelledby="faqh"><h2 id="faqh">Frequently asked questions</h2>']
    for q, a in faqs:
        out.append(f'<h3>{e(q)}</h3><p>{a}</p>')
    out.append('</section>')
    return '\n'.join(out)


def strip_tags(s):
    return html.unescape(re.sub(r'<[^>]+>', '', s))


def page(slug, title, desc, h1, lead, body, crumbs_name, faqs=None, extra_head='', body_end='', ogimg='/assets/images/intel/intel-vc-launch.jpg', article_type='Article', hero_badges=''):
    url = f'{ORIGIN}/{slug}/'
    graph = [
        {"@type": article_type, "headline": h1, "url": url, "mainEntityOfPage": url, "description": desc,
         "datePublished": VERIFIED, "dateModified": VERIFIED, "inLanguage": "en",
         "author": {"@type": "Organization", "name": "GTA6HeistGuide.com", "url": ORIGIN + "/"},
         "publisher": {"@type": "Organization", "name": "GTA6HeistGuide.com", "url": ORIGIN + "/"}},
        {"@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Home", "item": ORIGIN + "/"},
            {"@type": "ListItem", "position": 2, "name": crumbs_name, "item": url}]}]
    if faqs:
        graph.append({"@type": "FAQPage", "mainEntity": [
            {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": strip_tags(a)}} for q, a in faqs]})
    ld = json.dumps({"@context": "https://schema.org", "@graph": graph}, ensure_ascii=False, indent=2)
    faq_block = faq_html(faqs) if faqs else ''
    doc = f'''<!DOCTYPE html>
<html lang="en">
<head>
    <link rel="icon" type="image/svg+xml" href="/favicon.svg">
    <meta charset="UTF-8">
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{e(title)}</title>
    <meta name="description" content="{e(desc)}">
    <link rel="canonical" href="{url}">
    <link rel="manifest" href="/manifest.json">
    <meta property="og:title" content="{e(title)}">
    <meta property="og:description" content="{e(desc)}">
    <meta property="og:type" content="article">
    <meta property="og:url" content="{url}">
    <meta property="og:site_name" content="GTA6HeistGuide.com">
    <meta property="og:image" content="{ORIGIN}{ogimg}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:image" content="{ORIGIN}{ogimg}">
    <link rel="stylesheet" href="{STYLE_HREF}">
    <link rel="stylesheet" href="/assets/guides.css?v={CSS_VER}">
    <script>document.documentElement.classList.add('g-js');</script>
    <script type="application/ld+json">
{ld}
    </script>
{extra_head}</head>
<body>
{NAV}

<main class="g-wrap">
    <nav class="g-crumbs" aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span><span style="color:#e2e8f0;font-weight:700;">{e(crumbs_name)}</span></nav>
    <header class="g-hero">
        <div>{hero_badges}</div>
        <h1>{e(h1)}</h1>
        <p class="g-lead">{lead}</p>
    </header>
{body}
{faq_block}
</main>

{FOOTER}

<script src="/js/affiliates.js?v=20261122_v23"></script>
<script src="/site-config.js"></script>
<script src="/assets/main.js" defer></script>
<script src="/assets/js/site-status.js" defer></script>
<script src="/assets/js/guides.js?v={CSS_VER}" defer></script>
{body_end}</body>
</html>
'''
    d = os.path.join(PUB, slug)
    os.makedirs(d, exist_ok=True)
    with open(os.path.join(d, 'index.html'), 'w', encoding='utf-8', newline='\n') as f:
        f.write(doc)
    print('wrote', slug, len(doc))


def table(headers, rows, cls=''):
    h = ''.join(f'<th scope="col">{x}</th>' for x in headers)
    r = ''.join('<tr>' + ''.join(f'<td>{c}</td>' for c in row) + '</tr>' for row in rows)
    return f'<div class="g-tablewrap"><table class="g-table {cls}"><thead><tr>{h}</tr></thead><tbody>{r}</tbody></table></div>'


def slugify(s):
    return re.sub(r'[^a-z0-9]+', '-', s.lower()).strip('-')


PROPS = load('data/properties.json')
VEH = load('data/vehicles.json')
PIN_COUNT = len(load('data/map-pins.json')['pins'])
REC = PROPS['items']
by_type = {}
for it in REC:
    by_type.setdefault(it['propertyType'], []).append(it)

# =====================================================================================================
# 1. MISSIONS
# =====================================================================================================
CHAPTERS = [
    # key, title, reported count, titles documented (name, optional)
    (1, 'Just Like Paradise', 22, [
        'Buck Me', 'Clean Up After Donnie', 'Coming Home', 'Feng Shui', 'Gear Up', 'Gone Fishing', 'Hey Arnold!', 'Island Dreams',
        'Just a Scratch', 'Lab Fees', 'Pipework', 'Swamped', 'Tourist Trap', 'Unwanted Attention']),
    (2, 'Paradise Lost', 11, [
        'Afternoon Delight', 'Ambulance Chaser', 'Breakfast Run', 'Checking Out', 'Coffee Break', "Girls' Trip", 'Just Moved In', 'Moses', 'Slam Dunk']),
    (3, 'Tits, Ass, Drug Money', 26, [
        'Boobie Time', "Dealer's Choice", 'Dubious Provenance', 'Here, Kitty Kitty', 'Mami', 'Meet the Heders', 'Welcome to Vice City',
        "Yasmani's Jewelry Jobs", 'The Cartel Heist']),
    (4, 'Vice City, Baby', 25, ['VCIA Takedown']),
    (5, 'Top of the World, Ma', 7, []),
]
OPTIONAL = ['Thrillbillies and Twist Wrist', 'Smash, Grab']  # reported as optional / borderline Chapter 2 entries


def missions():
    sum_rep = sum(c[2] for c in CHAPTERS)
    doc_n = sum(len(c[3]) for c in CHAPTERS)
    rows = []
    for k, t, n, names in CHAPTERS:
        rows.append([f'Chapter {k}', f'<span class="g-name">{e(t)}</span>' if k > 1 else e(t), str(n), f'{len(names)} titles', '0'])
    chap_table = table(['Chapter', 'Title (reported)', 'Reported story missions', 'Titles listed on this page', 'Full walkthroughs published'], rows)
    chapters_html = []
    for k, t, n, names in CHAPTERS:
        lis = []
        for nm in names:
            mid = f'c{k}-{slugify(nm)}'
            lis.append(f'<li data-mission="{mid}" data-chapter-label="Chapter {k}" data-optional="0"><label><input type="checkbox"><span class="g-name">{e(nm)}</span></label><button type="button" class="g-reveal" aria-label="Reveal this mission title">reveal</button></li>')
        if k == 2:
            for nm in OPTIONAL:
                mid = f'c2-opt-{slugify(nm)}'
                lis.append(f'<li data-mission="{mid}" data-chapter-label="Chapter 2 (optional)" data-optional="1"><label><input type="checkbox"><span class="g-name">{e(nm)}</span><span class="g-badge g-b-com" style="margin:0 0 0 .3rem">OPTIONAL?</span></label><button type="button" class="g-reveal" aria-label="Reveal this mission title">reveal</button></li>')
        listing = ''.join(lis) if lis else '<li style="color:#94a3b8;font-size:.88rem">No titles are documented on this site for this chapter yet. Titles are only added when they can be attributed to a source.</li>'
        chapters_html.append(
            f'<div class="g-chapter" data-chapter-card id="chapter-{k}" data-g-group><h3>Chapter {k}: <span class="g-name">{e(t)}</span> '
            f'<span style="color:#94a3b8;font-weight:400;font-size:.8rem">· reported {n} story missions · tracked here <span data-chapter-done>0 / {len(names) + (len(OPTIONAL) if k == 2 else 0)}</span></span></h3>'
            f'<ul class="g-mlist">{listing}</ul></div>')
    body = f'''
{evidence('Mission titles below are attributed to published guides (see the source register); their <em>order within each chapter is not verified</em>, so they are listed alphabetically.')}

<section class="g-section" aria-labelledby="count">
  <h2 id="count">How many missions are in GTA 6? 91 vs 93 explained</h2>
  <p>{badge('ind')} <strong>PC Gamer's published mission list reports 91 story missions across five chapters</strong>, and <strong>Press Start separately reports 93 entries</strong> from the in-game Story Recap. Rockstar has not published an official mission count that this site could cite, so neither number is labelled Rockstar-confirmed.</p>
  <p>Why the numbers can differ (as attributed by the reporting, <em>not reproduced in-game by this site</em>): a recap that lists every intermediate story entry will count more than a guide that only counts missions required to advance the story, and some Chapter 2 jobs are treated as optional by one count and as story entries by another. The reported chapter split adds up to {sum_rep} (22 + 11 + 26 + 25 + 7).</p>
  {chap_table}
  <p style="margin-top:.6rem">{badge('unv','NOT YET CHECKED IN-GAME')} Until the Story Recap is checked on a real save, treat "91" as <em>the PC Gamer count</em> and "93" as <em>the Press Start recap count</em>. Our 100% completion tracker also uses the "all 91 story missions" requirement phrasing — see the <a href="/gta-6-100-completion-tracker/">100% completion tracker</a>.</p>
</section>

<section class="g-section" id="missionApp" aria-labelledby="tracker">
  <h2 id="tracker">GTA 6 mission list and tracker ({doc_n + len(OPTIONAL)} documented titles)</h2>
  <p>This is a <strong>partial</strong> list: only titles we can attribute to a source are shown ({doc_n + len(OPTIONAL)} of the reported 91–93). Titles are hidden by default so you can keep a checklist without seeing future story beats. Checkmarks are saved only in this browser under their own storage key and <strong>do not change</strong> your Save Planner, map progress or 100% tracker.</p>
  <div class="g-toolbar">
    <button type="button" class="g-pill" id="spoilerToggle" aria-pressed="true">Spoiler-free mode: ON (titles hidden)</button>
    <button type="button" class="g-pill" id="revealAll">Reveal all titles</button>
    <button type="button" class="g-pill" id="hideAll">Hide all again</button>
    <label style="color:#cbd5e1;font-size:.85rem;display:flex;gap:.4rem;align-items:center"><input type="checkbox" id="optToggle" checked> Show optional / borderline entries</label>
    <input class="g-input" type="search" id="missionSearch" data-g-filter="missionList" placeholder="Search mission titles (works even while hidden)" aria-label="Search mission titles">
    <button type="button" class="g-pill" id="resetMissions">Reset mission checks</button>
  </div>
  <div aria-live="polite"><div id="missionProgressText" style="color:#fff;font-weight:700;font-size:.9rem"></div><div class="g-progress"><i id="missionProgressBar"></i></div></div>
  <div id="missionList">
    {''.join(chapters_html)}
  </div>
</section>

<section class="g-section" aria-labelledby="optional">
  <h2 id="optional">Optional missions, "Strangers and Freaks" and missable missions</h2>
  <p>{badge('com')} Guides report a small number of optional or borderline Chapter 2 entries (for example the two marked "optional?" above). One summary we reviewed applied GTA V's <em>Strangers and Freaks</em> label to GTA VI; <strong>we found no Rockstar or in-game evidence for that label</strong> and therefore use the neutral term "optional missions". Optional-mission rewards and unlock requirements are not published here because none could be verified.</p>
  <p>Mission replay: this site's Save Planner and homepage FAQ state there is no mission-replay menu at launch ({badge('site')}), which is why the guide recommends manual saves before points of no return.</p>
  <h3>Story points the existing site data flags as time-limited</h3>
  <ul>
    <li><strong>Donnie's fence</strong> — site data says it closes after the mission "Swamped" ({badge('site')}). See the <a href="/properties.html?item=fence-donnie">Donnie record</a>.</li>
    <li><strong>Chapter 2 Motel Base</strong> — site data says it closes after "Checking Out" ({badge('site')}). See the <a href="/properties.html?item=sh-ch2-motel">motel record</a>.</li>
    <li><strong>BuckMe savings</strong> — site data says to protect Family Savings before "Tourist Trap" ({badge('site')}). See the <a href="/properties.html?item=safe-buckme">BuckMe record</a>.</li>
  </ul>
  <p>Use the <a href="/save-planner/">15-slot Save Planner</a> to place manual saves around these.</p>
</section>

<section class="g-section" aria-labelledby="walk">
  <h2 id="walk">Mission walkthroughs: what is and is not published</h2>
  <p>Individual walkthroughs require the starting location, unlock requirements, objectives, steps, rewards and decisions to be checked against a real playthrough. <strong>That has not been done for any mission yet, so no walkthrough pages are published.</strong> We are not publishing 91 or 93 empty pages; a mission page will appear only when all of its sections can be filled from verified evidence.</p>
  <p>Already documented on this site: the <a href="/heists/the-cartel-heist">Cartel Heist</a> and <a href="/heists/vcia-takedown">VCIA Takedown</a> heist guides, the <a href="/gta-6-endings-guide/">endings guide</a>, and the <a href="/gta-6-relationship-guide/">relationship guide</a>.</p>
  <h3>Related locations and tools</h3>
  <div class="g-grid">
    <a class="g-card" href="/map.html"><strong>Interactive Leonida Map</strong><span>{PIN_COUNT} pins including safehouses, fences and heists.</span></a>
    <a class="g-card" href="/properties.html"><strong>Properties database</strong><span>Safehouses, garages and the 7 fence contacts.</span></a>
    <a class="g-card" href="/gta-6-collectibles/"><strong>Collectibles &amp; 100%</strong><span>Counters for flamingos, cards, WAiNK scans and more.</span></a>
    <a class="g-card" href="/gta-6-troubleshooting/"><strong>Mission won't start?</strong><span>Troubleshooting center with safe checks.</span></a>
  </div>
</section>'''
    faqs = [
        ('How many missions are in GTA 6?',
         'PC Gamer\'s published list reports 91 story missions across five chapters, while Press Start reports 93 entries from the in-game Story Recap. Rockstar has not published an official count that this site can cite, and we have not yet reproduced either number in-game.'),
        ('What are the GTA 6 chapters?',
         'Reporting names five chapters: Just Like Paradise, Paradise Lost, Tits, Ass, Drug Money, Vice City, Baby, and Top of the World, Ma. This is independently reported, not confirmed by a Rockstar page we could cite.'),
        ('Does GTA 6 have Strangers and Freaks missions?',
         'We could not verify that label. Guides describe a few optional or borderline Chapter 2 missions, so this site calls them optional missions until the in-game classification is checked.'),
        ('Can you replay missions in GTA 6?',
         'This site\'s existing guidance is that there is no mission-replay menu at launch, so use manual save slots before points of no return. Check the Save Planner for a slot plan.'),
        ('Can I track missions without spoilers?',
         'Yes. Spoiler-free mode is on by default: mission titles are blurred and can be revealed one at a time or all at once, while the checkboxes still save in your browser.'),
    ]
    page('missions', 'GTA 6 Mission List: Chapters, 91 vs 93 Missions & Spoiler-Free Tracker | GTA6HeistGuide.com',
         'GTA 6 mission list by chapter: why PC Gamer counts 91 missions and Press Start 93, a spoiler-free checklist with saved progress, and what is verified.',
         'GTA 6 Mission List: Chapters, Mission Count and Spoiler-Free Tracker',
         'Browse the reported chapter structure, understand the 91 vs 93 mission-count difference, and keep a spoiler-free completion checklist. Every mission title is labelled by how well it is sourced.',
         body, 'Mission Walkthrough Hub', faqs, hero_badges=badge('ind') + badge('unv', 'PARTIAL LIST'))


# =====================================================================================================
# 2. CONTROLS
# =====================================================================================================
CTRL = [
    ('On foot', [
        ('Move', 'Left stick', 'Left stick', 'ind'),
        ('Camera / look', 'Right stick', 'Right stick', 'ind'),
        ('Sprint (reported as click-to-toggle, not tap)', 'Click left stick (L3)', 'Click left stick (LS)', 'ind'),
        ('Jump / climb', '✕', 'A', 'com'),
        ('Crouch', '○', 'B', 'com'),
        ('Rest (hold near objects, per one report)', 'Hold ○', 'Hold B', 'com'),
        ('Take cover', 'R1', 'RB', 'com'),
        ('Melee attack', '□', 'X', 'com'),
        ('Interact / context action', '△', 'Y', 'com'),
        ('Look behind', 'Click right stick (R3)', 'Click right stick (RS)', 'com'),
    ]),
    ('Aiming, shooting & weapons', [
        ('Aim', 'Hold L2', 'Hold LT', 'ind'),
        ('Shoot', 'R2', 'RT', 'ind'),
        ('Weapon wheel / equipment (tap reported to holster)', 'Hold L1', 'Hold LB', 'ind'),
    ]),
    ('Phone, map & menus', [
        ('Open phone (also WAiNK app access)', 'D-pad Up', 'D-pad Up', 'ind'),
        ('Cheat terminal (existing site guide)', 'D-pad Up, then hold L1 + tap R1', 'D-pad Up, then hold LB + tap RB', 'site'),
        ('Open map (one report)', 'Touchpad', 'View button', 'com'),
    ]),
    ('Vehicles (lower confidence)', [
        ('Steer', 'Left stick', 'Left stick', 'com'),
        ('Accelerate', 'R2', 'RT', 'com'),
        ('Brake / reverse', 'L2', 'LT', 'com'),
        ('Turn signals (one report)', 'D-pad Left / Right', 'D-pad Left / Right', 'com'),
        ('Leave engine running when exiting (one report)', 'Double-tap △ when exiting', 'Double-tap Y when exiting', 'com'),
    ]),
]
UNPUBLISHED_CTRL = [
    ('Switching between Jason and Lucia', 'Two sources disagreed and nothing else on the site corroborates a binding.'),
    ('Jason and Lucia partner interactions', 'No binding source found.'),
    ('Aircraft (planes and helicopters)', 'Source text was vague about bindings.'),
    ('Boats and jet skis', 'No specific binding source found.'),
    ('Bicycles', 'Source text described behavior, not buttons.'),
    ('Swimming and diving', 'Source text described behavior, not buttons.'),
    ('Parachuting', 'Source text was vague.'),
    ('Cinematic camera and camera change', 'Sources gave conflicting bindings (the same button was listed for both map and camera).'),
    ('Sitting and resting beyond the hold-to-rest report', 'No further source.'),
    ('Radio controls', 'No binding source found.'),
    ('"Hidden" or special combinations', 'None verified. We do not publish unverified combinations.'),
]


def controls():
    secs = []
    for grp, rows in CTRL:
        trs = []
        for f, ps, xb, k in rows:
            trs.append(f'<tr data-g-item data-g-text="{e((grp + " " + f + " " + ps + " " + xb).lower())}"><td>{e(f)}</td>'
                       f'<td class="g-col-ps5"><span class="g-kbd">{e(ps)}</span></td><td class="g-col-xbox"><span class="g-kbd">{e(xb)}</span></td><td>{badge(k)}</td></tr>')
        secs.append(f'<div data-g-group><h3>{e(grp)}</h3><div class="g-tablewrap"><table class="g-table"><thead><tr><th scope="col">Feature</th><th scope="col" class="g-col-ps5">PS5</th><th scope="col" class="g-col-xbox">Xbox</th><th scope="col">Status</th></tr></thead><tbody>{"".join(trs)}</tbody></table></div></div>')
    unp = table(['Control', 'Why it is not published'], [[e(a), e(b)] for a, b in UNPUBLISHED_CTRL])
    body = f'''
{evidence('Bindings come from published guides, not from this site\'s own in-game controls screen.')}
<div class="g-evidence g-warn"><strong>Always confirm on your own screen.</strong> In-game, open <span class="g-kbd">Pause Menu › Settings › Control Scheme</span> (the path reported by guides) to see the exact bindings for the preset you are using. Presets change bindings, so a guide for one preset can be wrong for another. This page describes the <strong>Default</strong> scheme only.</div>
<div class="g-evidence"><strong>Platforms.</strong> Rockstar currently lists PlayStation 5 and Xbox Series X|S as the platforms for Grand Theft Auto VI. This site works in any browser, but no PC game control layout exists to document.</div>

<section class="g-section g-ctl" id="ctlApp" data-platform="ps5" aria-labelledby="table">
  <h2 id="table">GTA 6 controls: PS5 and Xbox (Default scheme, reported)</h2>
  <div class="g-toolbar" role="group" aria-label="Choose controller layout">
    <button type="button" class="g-pill" data-plat-btn="ps5" aria-pressed="true">PS5 (DualSense)</button>
    <button type="button" class="g-pill" data-plat-btn="xbox" aria-pressed="false">Xbox Series X|S</button>
    <input class="g-input" type="search" data-g-filter="ctlList" placeholder="Search a button or action (sprint, phone, rest…)" aria-label="Search controls">
    <span style="color:#94a3b8;font-size:.8rem"><span data-g-count="ctlList">0</span> bindings shown</span>
  </div>
  <div id="ctlList">{''.join(secs)}</div>
  <p style="margin-top:.6rem;font-size:.82rem;color:#94a3b8">Status labels: {badge('ind')} corroborated across more than one attributed guide · {badge('com')} reported by a single or lower-quality source · {badge('site')} from this site's existing cheat guide. None are in-game verified by this site.</p>
</section>

<section class="g-section" aria-labelledby="presets">
  <h2 id="presets">Control presets: Default, Classic and Left-Handed</h2>
  <p>{badge('com')} Guides report that the control scheme setting offers <strong>Default</strong>, <strong>Classic</strong> and <strong>Left-Handed</strong> presets. We have not documented what each preset changes, because the bindings differ and no preset-by-preset in-game source is available. If a button above does not match your game, check your preset first.</p>
</section>

<section class="g-section" aria-labelledby="unp">
  <h2 id="unp">Controls we are deliberately not publishing yet</h2>
  <p>These sections of the controls reference are left out until a reliable binding is available.</p>
  {unp}
</section>

<section class="g-section" aria-labelledby="rel">
  <h2 id="rel">Related guides</h2>
  <div class="g-grid">
    <a class="g-card" href="/cheats.html"><strong>Cheats tracker</strong><span>Phone cheat entry and trophy rules.</span></a>
    <a class="g-card" href="/gta-6-settings/"><strong>Settings &amp; hardware hub</strong><span>30 FPS pacing, HDR and aim deadzone settings.</span></a>
    <a class="g-card" href="/gta-6-tips-and-tricks/"><strong>Tips &amp; tricks</strong><span>Gameplay tutorials and money tips.</span></a>
    <a class="g-card" href="/gta-6-troubleshooting/"><strong>Controller or input problems?</strong><span>Troubleshooting center.</span></a>
  </div>
</section>'''
    faqs = [
        ('How do you sprint in GTA 6?', 'Guides report that sprinting is done by clicking the left stick (L3 on PS5, LS on Xbox) in the Default scheme, rather than tapping a button repeatedly. Confirm in Settings › Control Scheme.'),
        ('How do you open the weapon wheel in GTA 6?', 'Guides report holding L1 on PS5 or LB on Xbox. This is labelled reported, not in-game verified by this site.'),
        ('How do you use the phone in GTA 6?', 'Guides report D-pad Up opens the phone. This site\'s cheat guide uses the same entry point before holding L1/LB and tapping R1/RB for the cheat terminal.'),
        ('How do you switch between Jason and Lucia?', 'We are not publishing a binding: two sources disagreed and nothing corroborated them. Check your own Control Scheme screen.'),
        ('Are there hidden controls in GTA 6?', 'None are verified and we do not publish unverified combinations.'),
        ('Does GTA 6 have a PC control layout?', 'No. Rockstar currently lists only PlayStation 5 and Xbox Series X|S as platforms.'),
    ]
    page('gta-6-controls', 'GTA 6 Controls Guide: PS5 and Xbox Buttons, Reported Bindings | GTA6HeistGuide.com',
         'Searchable GTA 6 controller reference with a PS5/Xbox switch for sprint, phone, weapon wheel and driving, labeled by source quality and what is not yet verified.',
         'GTA 6 Controls Guide: Every PS5 and Xbox Button Explained',
         'A searchable controller reference with a PS5 / Xbox switch. Bindings are labelled by how well they are sourced, and anything that could not be backed up is listed separately instead of guessed.',
         body, 'Controls Guide', faqs, hero_badges=badge('ind') + badge('com') + badge('unv', 'NOT IN-GAME VERIFIED'))


# =====================================================================================================
# 3. TROUBLESHOOTING
# =====================================================================================================
RS = 'https://support.rockstargames.com/'
SONY = 'https://www.playstation.com/support/'
MS = 'https://support.xbox.com/'
ALL = 'ps5 ps5pro xsx xss'
PS = 'ps5 ps5pro'
XB = 'xsx xss'
CATS = {'save': 'Save and progress', 'weapons': 'Weapons and equipment', 'performance': 'Performance and technical',
        'mission': 'Missions and progression', 'install': 'Installation and updates'}
STATUS = {
    'official': ('conf', 'OFFICIAL FIX'),
    'tested': ('ind', 'INDEPENDENTLY TESTED FIX'),
    'workaround': ('com', 'TEMPORARY WORKAROUND'),
    'community': ('com', 'COMMUNITY-REPORTED'),
    'unresolved': ('unv', 'UNRESOLVED PROBLEM'),
}
SAFE = {
    'save': ['Stop and look: open the load menu and check every listed slot (autosave and manual slots are shown separately) before saving over anything.',
             'Close the game fully from the console home screen (not Rest Mode), then relaunch and check again.',
             'Confirm you are signed in to the same PlayStation Network / Xbox profile and Rockstar account as before.',
             'Check free storage on the console drive. Do not delete saved data to "fix" a save problem.'],
    'weapons': ['Check which character you are playing; Jason and Lucia are separate playable characters.',
                'Re-check after loading your last manual save and restarting the game.',
                'Check whether the item was only issued for a mission loadout before assuming it is lost.'],
    'performance': ['Confirm the console system software and the game are fully updated.',
                    'Fully close and relaunch the game; avoid resuming from Rest Mode.',
                    'Keep some free space on the console drive.'],
    'mission': ['Reload your last manual save and approach the marker again.',
                'Fully close and relaunch the game rather than resuming from Rest Mode.',
                'Check the mission requirements shown in the in-game phone/mission menu for the exact unlock.'],
    'install': ['Check your connection and the console\'s network status page.',
                'Check free storage against the size shown in the store before retrying.',
                'Pause and resume the download from the console download queue before taking any drastic step.'],
}
CAUTION = ('<div class="g-evidence g-danger"><strong>Data safety.</strong> Do not delete saved data, reset or initialize a console, or reinstall the game as a first step. '
           'Each can permanently remove saves not backed up to the cloud. If a step below mentions one of these, it is only to warn you; follow the official PlayStation, Xbox or Rockstar instructions and back up first.</div>')

T = []


def add(id_, cat, title, plats, status, causes, extra_checks=(), storage=(), community=(), note='', official_extra=()):
    T.append(dict(id=id_, cat=cat, title=title, plats=plats, status=status, causes=causes, extra=list(extra_checks), storage=list(storage),
                  community=list(community), note=note, official_extra=list(official_extra)))


SAVE_STORAGE = ['Saved data location: your console\'s saved-data settings (menu names vary with system software version) and, where enabled, the platform cloud. Check both before concluding that a save is gone.']
add('save-not-working', 'save', 'Save game not working', ALL, 'community',
    ['A save may fail or appear to not complete if the game, console software or storage is in a bad state (reported by players; not a documented Rockstar cause).'],
    ['Make a save to a different manual slot and load it to confirm it worked.'], SAVE_STORAGE,
    ['Players recommend rotating between several manual slots instead of relying on autosave alone.'])
add('autosave-missing', 'save', 'Autosave not showing', ALL, 'community',
    ['Per this site\'s Save Planner guidance, the game has a single autosave that is overwritten, so an older autosave will not be listed (existing site content, not Rockstar-confirmed).'],
    ['Look for the save under the autosave entry and the manual slots separately.', 'See the Save Planner for a slot strategy.'], SAVE_STORAGE)
add('lost-progress', 'save', 'Lost saved progress', ALL, 'unresolved',
    ['Causes are not documented. Reports exist of progress appearing lost after crashes; we have not reproduced one.'],
    ['Check every slot and the cloud/profile before assuming loss.'], SAVE_STORAGE,
    note='Contact Rockstar Support with your platform, profile, last mission and time of loss.')
add('save-slots-missing', 'save', 'Save slots missing', ALL, 'community',
    ['The load screen may list the autosave and manual slots in separate groups; a slot can look "missing" if you are looking in the wrong group or on a different profile.'],
    [], SAVE_STORAGE)
add('progress-disappeared', 'save', 'Progress disappeared after a crash or update', ALL, 'unresolved',
    ['No official cause is documented. Do not assume a patch deleted saves; check the profile, cloud and every slot first.'],
    ['Note the exact build number shown in the game and the time of the issue.'], SAVE_STORAGE)
add('load-older-save', 'save', 'Game loaded an older save', ALL, 'community',
    ['Because the autosave is overwritten and manual saves are separate, the "continue" option may load a different save than you expect (this site\'s Save Planner guidance).'],
    ['Load from the explicit slot list instead of "continue".'], SAVE_STORAGE)

add('weapons-disappeared', 'weapons', 'Weapons disappeared', ALL, 'community',
    ['Some missions may issue a temporary loadout and remove your own weapons for story reasons (community-reported explanation, not confirmed).'],
    ['Wait until the mission ends and check again before assuming loss.'], ['Where weapons live: the weapon wheel and any vehicle trunk or safehouse locker you stored them in.'])
add('trunk-missing', 'weapons', 'Gun missing from the vehicle trunk', ALL, 'community',
    ['Trunk contents may not persist if the vehicle was not registered/stored or was destroyed or replaced (community-reported; vehicle-registration details are unconfirmed — see the vehicle guide).'],
    ['Check the exact vehicle you stored it in.'], ['Possible locations: the specific vehicle trunk, then safehouse locker.'])
add('missing-after-mission', 'weapons', 'Missing weapons after a mission', ALL, 'community',
    ['Story missions can end with a changed loadout. This looks like intended behavior in some reports, but no mission-by-mission list exists here.'],
    ['Check the safehouse locker and the trunk of vehicles you used before the mission.'])
add('weapon-locker', 'weapons', 'Weapon locker problems', ALL, 'unresolved',
    ['No documented cause. Safehouse features differ by safehouse in the existing properties data (for example the Vice City safehouses list a weapon locker and gun cabinet).'],
    ['Check you are at the correct safehouse.'], ['See the Properties database for which safehouses list locker features.'])
add('equipment-not-appearing', 'weapons', 'Equipment not appearing', ALL, 'community',
    ['Equipment may be tied to a specific character, a mission loadout or a purchase not yet completed.'],
    ['Check the other character and the relevant shop purchase.'])

PERF_NOTE = 'Rockstar Support is the primary authority; use it for error codes and ticket submission.'
add('crashing-ps5', 'performance', 'GTA 6 crashing on PS5', PS, 'community',
    ['Reported crashes have no documented single cause.'],
    ['Note the error code if one appears and report it to Rockstar Support.', 'Sony documents Safe Mode and cache options for the PS5; use only the cache option and avoid any option that resets or initializes the console.'],
    [], ['Some players report that clearing the PS5 system cache from Safe Mode helped. This is community-reported and does not delete saves; check Sony\'s instructions for your system software.'], PERF_NOTE)
add('xbox-problems', 'performance', 'GTA 6 problems on Xbox', XB, 'community',
    ['No documented single cause.'],
    ['Fully restart the console from the power menu.'], [],
    ['Players report a full power cycle (hold the console power button, unplug briefly, restart) as a general fix; this is community-reported.'], PERF_NOTE)
add('stuck-loading', 'performance', 'Stuck on a loading screen', ALL, 'community',
    ['Loading hangs are reported after resuming from Rest Mode and after large updates.'],
    ['Wait a few minutes first; then fully close and relaunch.'], [], [], PERF_NOTE)
add('freezing', 'performance', 'Game freezing', ALL, 'community',
    ['No documented cause. Note when it freezes (after a cutscene, when loading a region) because Rockstar Support will ask.'],
    ['Make a manual save before testing again.'], [], [], PERF_NOTE)
add('performance-problems', 'performance', 'Performance problems (low frame rate)', ALL, 'site',
    ['This site\'s settings guide states the launch build targets 30 FPS on PS5 and Xbox Series X|S with no 60 FPS performance mode (existing site content, not re-verified). A steady 30 FPS may therefore be normal.'],
    ['See the Settings & hardware hub for HDR, motion-blur and deadzone suggestions.'], [], [], PERF_NOTE)
add('update-problems', 'performance', 'Problems after an update', ALL, 'unresolved',
    ['A newer build (PS5 01.002.002 / Xbox 1.0.2.2) was reported on November 23, 2026 with no official patch notes. This site has not confirmed it, so we cannot tell you what changed.'],
    ['Check Rockstar Support and Rockstar Newswire for notes before assuming a bug.'], [], [], PERF_NOTE)

add('mission-wont-start', 'mission', "Mission won't start", ALL, 'community',
    ['The start marker may be gated by a story unlock, the active character or time of day; the exact requirements per mission are not verified here.'],
    ['Check the in-game phone/mission menu for the start requirement.'], [],
    ['Players report that switching characters, reloading a manual save, or fully restarting the game (not resuming from Rest Mode) can reset a stuck trigger.'])
add('objective-not-updating', 'mission', 'Mission objective not updating', ALL, 'community',
    ['Reported as a script-state problem; no documented cause.'],
    ['Reload your last manual save before the objective and repeat the step.'], [], [], 'Make a manual save in a separate slot before retrying so you do not lose later progress.')
add('character-unavailable', 'mission', 'Character unavailable (Jason or Lucia)', ALL, 'unresolved',
    ['This site could not verify when each character becomes freely switchable; guides describe character switching opening up around Chapter 2 (community-reported).'],
    ['Check the current chapter and mission requirements.'])
add('progression-stuck', 'mission', 'Progression stuck', ALL, 'unresolved',
    ['No documented cause. A mission that cannot proceed after a reload should be reported with the mission name and chapter to Rockstar Support.'],
    ['Keep an earlier manual save from before the mission.'])
add('unlock-requirements', 'mission', 'Mission unlock requirements', ALL, 'unresolved',
    ['This site does not publish mission unlock requirements because none could be verified. Existing data does flag a few story gates; see the Mission hub.'],
    ['Check the in-game mission menu for the exact requirement.'])

add('install-errors', 'install', 'Installation errors', ALL, 'community',
    ['Common general causes: not enough free space, interrupted download, or console software out of date.'],
    ['Note the exact error code for Rockstar Support and your platform\'s support site.'], [], [],
    'Do not reinstall as a first step; if you do, back up your saved data to the cloud first.')
add('update-failed', 'install', 'Update failed', ALL, 'community',
    ['Failed updates are usually network, storage or server-load related. A staggered rollout was reported for a newer build (unconfirmed).'],
    ['Retry later; keep the game installed.'])
add('patch-notes', 'install', 'Patch notes', ALL, 'unresolved',
    ['Launch build on this site: 01.002.001. A newer build (PS5 01.002.002 / Xbox 1.0.2.2) has been independently reported with no official notes. See Live Launch Intel for the current state.'],
    ['Check Rockstar Newswire and Rockstar Support for any official notes.'])
add('download-problems', 'install', 'Download problems', ALL, 'community',
    ['Large downloads can stall under heavy network load.'],
    ['Pause and resume the download; check the console\'s network connection test.'])


def troubleshoot():
    groups = []
    for cat, name in CATS.items():
        ents = [t for t in T if t['cat'] == cat]
        items = []
        for t in ents:
            sk, slabel = STATUS.get(t['status'], ('site', 'EXISTING SITE DATA'))
            checks = SAFE[cat] + t['extra']
            official = [f'<a href="{RS}" rel="noopener">Rockstar Games Support</a> (primary authority for GTA VI troubleshooting)']
            if set(t['plats'].split()) & {'ps5', 'ps5pro'}:
                official.append(f'<a href="{SONY}" rel="noopener">PlayStation Support</a> for console steps')
            if set(t['plats'].split()) & {'xsx', 'xss'}:
                official.append(f'<a href="{MS}" rel="noopener">Xbox Support</a> for console steps')
            lis = lambda xs: '<ul>' + ''.join(f'<li>{x}</li>' for x in xs) + '</ul>'
            sections = [
                ('Possible documented causes', lis([e(c) if '<' not in c else c for c in t['causes']])),
                ('Safe first checks', lis([e(c) for c in checks])),
            ]
            if t['storage']:
                sections.append(('Relevant storage locations', lis([e(s) for s in t['storage']])))
            if t['community']:
                sections.append(('Community-reported workarounds (not confirmed fixes)', lis([e(c) for c in t['community']])))
            sections.append(('Official support', lis(official)))
            if t['note']:
                sections.append(('Note', f'<p>{e(t["note"])}</p>'))
            if t['id'] in ('save-not-working', 'autosave-missing', 'load-older-save', 'save-slots-missing', 'lost-progress', 'progress-disappeared'):
                sections.append(('Related tool', '<p><a href="/save-planner/">15-slot Save Planner</a> — plan manual slots so one overwritten autosave cannot cost you progress.</p>'))
            if t['id'] in ('mission-wont-start', 'unlock-requirements', 'progression-stuck', 'objective-not-updating', 'character-unavailable'):
                sections.append(('Related guide', '<p><a href="/missions/">Mission hub</a> and <a href="/save-planner/">Save Planner</a>.</p>'))
            if t['id'] in ('patch-notes', 'update-problems', 'update-failed'):
                sections.append(('Related page', '<p><a href="/live-intel">Live Launch Intel</a> (last verified ' + VERIFIED_LONG + ').</p>'))
            if t['id'] == 'performance-problems':
                sections.append(('Related page', '<p><a href="/gta-6-settings/">Settings &amp; hardware hub</a>.</p>'))
            if t['id'] in ('weapons-disappeared', 'trunk-missing', 'weapon-locker', 'equipment-not-appearing', 'missing-after-mission'):
                sections.append(('Related pages', '<p><a href="/weapons.html">Weapons database</a> · <a href="/properties.html">Properties database</a> · <a href="/gta-6-vehicles-guide/#storage">Vehicle storage guide</a></p>'))
            inner = ''.join(f'<h4>{h}</h4>{b}' for h, b in sections)
            items.append(
                f'<details class="g-d" id="{t["id"]}" data-ts data-cat="{cat}" data-plats="{t["plats"]}"><summary>{e(t["title"])} {badge(sk, slabel)}</summary>'
                f'<div class="g-d-body">{inner}</div></details>')
        groups.append(f'<div data-ts-group><h3>{e(name)}</h3>{"".join(items)}</div>')
    cat_opts = ''.join(f'<option value="{k}">{v}</option>' for k, v in CATS.items())
    body = f'''
{evidence('No problem on this page is claimed to affect every player, and no fix is labelled an official Rockstar fix unless it is Rockstar Support itself.')}
{CAUTION}
<section class="g-section" id="tsApp" aria-labelledby="finder">
  <h2 id="finder">Find your problem</h2>
  <p>Pick your platform and problem type, or search for a symptom. Every entry shows how well the advice is sourced. <strong>Last updated {VERIFIED_LONG}.</strong></p>
  <div class="g-toolbar">
    <label class="g-sr" for="tsPlatform">Platform</label>
    <select class="g-select" id="tsPlatform"><option value="">Any platform</option><option value="ps5">PS5</option><option value="ps5pro">PS5 Pro</option><option value="xsx">Xbox Series X</option><option value="xss">Xbox Series S</option></select>
    <label class="g-sr" for="tsCategory">Problem category</label>
    <select class="g-select" id="tsCategory"><option value="">All categories</option>{cat_opts}</select>
    <label class="g-sr" for="tsSearch">Search symptoms</label>
    <input class="g-input" type="search" id="tsSearch" placeholder="Search a symptom (weapons missing, autosave, stuck loading…)">
    <span style="color:#94a3b8;font-size:.8rem"><span id="tsCount">{len(T)}</span> matching entries</span>
  </div>
  <p id="tsEmpty" class="g-hidden g-evidence g-warn">No entry matches. Try fewer words, or contact <a href="{RS}" rel="noopener">Rockstar Games Support</a>.</p>
  {''.join(groups)}
</section>

<section class="g-section" aria-labelledby="levels">
  <h2 id="levels">How we label fixes</h2>
  {table(['Label', 'Meaning', 'Used on this page?'], [
      [badge('conf', 'OFFICIAL FIX'), 'A step documented by Rockstar Support.', 'Only the pointer to Rockstar Support itself.'],
      [badge('ind', 'INDEPENDENTLY TESTED FIX'), 'Reproduced by an identifiable outlet or by us with notes.', 'None yet.'],
      [badge('com', 'TEMPORARY WORKAROUND'), 'May help but is not a proper fix.', 'Not currently used.'],
      [badge('com', 'COMMUNITY-REPORTED'), 'Reported by players, not reproduced.', 'Most entries.'],
      [badge('unv', 'UNRESOLVED PROBLEM'), 'No documented cause or fix.', 'Several entries.'],
  ])}
  <p style="margin-top:.7rem">To keep from losing progress, plan your saves with the <a href="/save-planner/">15-slot Save Planner</a>.</p>
</section>'''
    faqs = [
        ('Should I delete my save data to fix GTA 6 problems?', 'No. Deleting saved data, resetting a console or reinstalling the game can permanently remove saves that are not backed up to the cloud. Use the safe checks first and follow official PlayStation, Xbox or Rockstar instructions.'),
        ('Where do I get official help for GTA 6?', 'Rockstar Games Support is the primary authority for GTA VI technical help. Use PlayStation Support or Xbox Support for console-level steps.'),
        ('Why did my weapons disappear in GTA 6?', 'Some players report that certain missions issue temporary loadouts. This is community-reported, not confirmed. Check the active character, the safehouse locker and the vehicle trunk before assuming loss.'),
        ('Is there an official GTA 6 patch note for the latest build?', 'A newer build (PS5 01.002.002, Xbox 1.0.2.2) was independently reported on November 23, 2026, but no official Rockstar notes had been published at that time.'),
    ]
    page('gta-6-troubleshooting', 'GTA 6 Troubleshooting: Save, Weapon, Crash and Mission Problems | GTA6HeistGuide.com',
         'Searchable GTA 6 troubleshooting center for PS5 and Xbox: saves, missing weapons, crashes, mission bugs and installs, with safe first checks and honest source labels.',
         'GTA 6 Troubleshooting Guide: Common Problems and Solutions',
         'Choose your platform and problem to get safe first checks, where to look, and the official support route. Advice is labelled by evidence level, and nothing here asks you to delete data casually.',
         body, 'Troubleshooting Center', faqs, hero_badges=badge('com') + badge('unv', 'COMMUNITY-SOURCED'))


# =====================================================================================================
# 4. COLLECTIBLES
# =====================================================================================================
COLLECT = [
    ('cocaine-flamingos', 'Cocaine Flamingos', 125, 100, 'Shooting valid flamingos is reported to drop a cocaine package; guides say look for flamingos with black-and-white beaks.', 'Exploration & Activities'),
    ('card-sets', 'Collectible Card Sets', 18, 15, '480 cards across 18 sets are reported; 15 of 18 sets are required. Spare duplicates are reported to be sellable.', 'Exploration & Activities'),
    ('waink-scans', 'WAiNK scans', 112, 100, 'Phone notification near a scannable point; about 112 are reported and 100 are required.', 'Exploration & Activities'),
    ('underwater', 'Underwater Discoveries', 33, 33, 'All 33 are required per the tracker.', 'Exploration & Activities'),
    ('kenton-shipwrecks', 'Kenton shipwreck sets', 7, 5, '5 of 7 shipwreck sets are required per the tracker.', 'Exploration & Activities'),
    ('stunts', 'Stunts (all types)', 397, 300, '397 stunts reported (130 Stunt Jumps, 202 Under the Bridges, 40 Knife Flights, 25 Base Jumps); 300 required for 100%, 250 for the Cunning Stunts trophy.', 'Exploration & Activities'),
    ('animals', 'Animals studied', 255, 100, '100 of 255 required; the site database indexes 49 species.', 'Discovery'),
    ('vehicles-scanned', 'Vehicle models scanned', 277, 200, '200 of 277 base models required; the site database indexes 33.', 'Discovery'),
]


def collectibles():
    cards = []
    for cid, name, total, req, desc, grp in COLLECT:
        qty = f'{req} of {total}' if req != total else f'{total} of {total}'
        step = '<button type="button" class="g-pill" data-step="1">+1</button><button type="button" class="g-pill" data-step="-1">−1</button>'
        if cid == 'waink-scans':
            qty = '100 of about 112'
        cards.append(
            f'<div class="g-chapter" id="{cid}"><h3>{e(name)} <span style="color:#94a3b8;font-weight:400;font-size:.8rem">· required {e(qty)}</span></h3>'
            f'<p>{badge("site")}{badge("ind")} {e(desc)}</p>'
            f'<div class="g-counter" data-counter="{cid}" data-total="{total}" data-req="{req}"><label>Found: <input class="g-input" type="number" min="0" inputmode="numeric" aria-label="{e(name)} found"></label>{step}'
            f'<span data-out style="color:#e2e8f0;font-size:.85rem"></span></div><div class="g-progress"><i></i></div>'
            f'<p style="font-size:.82rem;color:#94a3b8">Individual locations: {badge("unv","NOT PUBLISHED")} no verified coordinates, directions or screenshots exist for these yet, so none are listed.</p></div>')
    body = f'''
{evidence('The quantities below are the ones already used by this site\'s 100% completion tracker, cross-attributed to IGN, Mobalytics, GTABase and PowerPyx. Locations are not published because none are verified.')}
<div class="g-evidence g-warn"><strong>Not replacing the tracker.</strong> The counters on this page store only in their own browser key and <strong>do not change</strong> your 100% tracker, map pins or Save Planner. Use the <a href="/gta-6-100-completion-tracker/"><strong>100% Completion Tracker</strong></a> for full progress, trophies and the dual 250/300 stunt bars, and the <a href="/map.html"><strong>Interactive Map</strong></a> ({PIN_COUNT} pins) for locations we already pin.</div>

<section class="g-section" id="collectApp" aria-labelledby="cats">
  <h2 id="cats">GTA 6 collectibles and what 100% requires</h2>
  <p>In-game, the official 100% checklist is reported to appear under <strong>Progress › Stats › 100% Completion</strong> after Chapter 5 (existing tracker text). Guides also point to <strong>Map › Progress</strong> for collection counts. Nothing in the 35-requirement checklist is described as missable on the tracker.</p>
  <div class="g-toolbar"><a class="btn btn-primary" href="/gta-6-100-completion-tracker/">Open 100% Completion Tracker →</a><a class="btn btn-secondary" href="/map.html">Open Interactive Map →</a></div>
  {''.join(cards)}
</section>

<section class="g-section" aria-labelledby="notyet">
  <h2 id="notyet">What is not covered yet</h2>
  <ul>
    <li><strong>Per-collectible location pages</strong> (individual flamingos, cards, WAiNK points) — not published: no verified location data in the project.</li>
    <li><strong>Pre-release rumors</strong> (for example "Selfridges" collector boxes from older content) — not treated as released collectibles.</li>
    <li><strong>Hidden items</strong> — no verified list.</li>
  </ul>
  <p>Related: <a href="/animals.html">Animals database</a> · <a href="/vehicles.html">Vehicles database</a> · <a href="/secrets.html">Secrets</a> · <a href="/save-planner/">Save Planner</a></p>
</section>'''
    faqs = [
        ('How many Cocaine Flamingos do you need for 100%?', 'The tracker lists 100 of 125 as required. Guides say valid flamingos have black-and-white beaks. This is independently reported, not in-game verified by this site.'),
        ('How many collectible card sets are required?', '15 of 18 card sets are required, with 480 cards reported across the 18 sets.'),
        ('How many WAiNK scans are needed?', '100 WAiNK scans are required out of roughly 112 reported scannable points.'),
        ('Where do I check collectible progress in the game?', 'The tracker states the official 100% checklist is under Progress › Stats › 100% Completion after Chapter 5; guides also reference Map › Progress.'),
        ('Do these counters change my 100% tracker?', 'No. These counters use their own browser storage so they cannot overwrite your tracker or map progress.'),
    ]
    page('gta-6-collectibles', 'GTA 6 Collectibles & 100%: Flamingos, Cards, WAiNK Scans, Stunts | GTA6HeistGuide.com',
         'GTA 6 collectibles hub: required totals for Cocaine Flamingos, card sets, WAiNK scans, underwater discoveries and stunts, with counters linked to the 100% tracker and map.',
         'GTA 6 Collectibles and 100% Completion Guide',
         'Required totals for each collectible category, simple found/needed counters, and clear links to the 100% Completion Tracker and the Interactive Map.',
         body, 'Collectibles & 100%', faqs, hero_badges=badge('ind') + badge('unv', 'LOCATIONS NOT PUBLISHED'))


# =====================================================================================================
# 5. VEHICLES
# =====================================================================================================
VCLASS_ORDER = ['Super', 'Sports', 'Muscle', 'SUVs & Pickups', 'Motorcycles', 'Boats & Airboats', 'Aircraft']


def vrows(cls):
    rows = []
    for v in VEH['items']:
        if v['vehicleClass'] != cls:
            continue
        regs = ', '.join(v['spawnRegions'])
        acq = v['priceOrAcquisition']
        rows.append(f'<tr data-g-item data-g-class="{e(cls)}" data-g-text="{e((v["name"] + " " + cls + " " + regs + " " + v["manufacturer"]).lower())}">'
                    f'<td><a href="/vehicles.html?item={e(v["id"])}">{e(v["name"])}</a></td><td>{e(v["manufacturer"])}</td><td>{e(regs)}</td><td>{e(acq)}</td><td>Not tested</td></tr>')
    return ''.join(rows)


def vehicles():
    n_classes = {}
    for v in VEH['items']:
        n_classes[v['vehicleClass']] = n_classes.get(v['vehicleClass'], 0) + 1
    tables = []
    for cls in VCLASS_ORDER:
        if cls not in n_classes:
            continue
        tables.append(f'<div data-g-group><h3 id="{slugify(cls)}">{e(cls)} ({n_classes[cls]})</h3><div class="g-tablewrap"><table class="g-table"><thead><tr><th scope="col">Vehicle</th><th scope="col">Maker</th><th scope="col">Reported regions</th><th scope="col">Acquisition</th><th scope="col">Top speed</th></tr></thead><tbody>{vrows(cls)}</tbody></table></div></div>')
    opts = ''.join(f'<option value="{e(c)}">{e(c)}</option>' for c in VCLASS_ORDER if c in n_classes)
    body = f'''
{evidence('Every one of the {len(VEH["items"])} vehicles in the database still lists top speed, acceleration and handling as "Not yet confirmed". <strong>This page therefore publishes no speed numbers and no "fastest" ranking.</strong>')}
<div class="g-evidence g-warn"><strong>Why there is no top-10 list.</strong> A fair ranking needs repeatable in-game runs: the same route, game build, upgrade state and several repetitions. None have been run by this site, so ranking cars would be guessing. When testing happens, the method, build number and results will be recorded here before any ranking is shown.</div>

<section class="g-section" aria-labelledby="fast">
  <h2 id="fast">Fastest cars and best sports cars in GTA 6</h2>
  <p>{badge('unv','NOT RANKED')} No top speeds have been measured, so we do not name a fastest car. What we can say from the database is which cars are in the performance-oriented classes and where they were reported: the <a href="#super">Super</a> class ({n_classes.get('Super',0)} vehicles) and the <a href="#sports">Sports</a> class ({n_classes.get('Sports',0)}). Class membership is a database label, not a performance result.</p>
  <h3>Supercar and rare-car locations</h3>
  <p>Regions are <em>reported spawn regions</em> from the database, not exact coordinates. The reported Super-class locations are Vice City and Vice Beach luxury districts. One report mentions high-end cars around the Chatfield Storage and Logistics area on Waxman Island ({badge('com')}); that place is not confirmed by this site. Pegassi Tempesta is marked "Community Discovered" in the database.</p>
</section>

<section class="g-section" aria-labelledby="best">
  <h2 id="best">Best getaway, off-road, motorcycle and boat picks</h2>
  <p>{badge('unv','SUBJECTIVE · UNTESTED')} Picks below are class-based starting points, <strong>not test results</strong>. Pick by terrain and region rather than by an unmeasured speed.</p>
  {table(['Need','Where to look in the database','Why this is only a starting point'], [
      ['Getaway cars', '<a href="#sports">Sports</a> and <a href="#super">Super</a> classes (Vice City, Vice Beach).', 'No handling or speed data; police pursuit behavior is untested here.'],
      ['Off-road', '<a href="#suvs-pickups">SUVs &amp; Pickups</a> (reported around Grassrivers, Ambrosia and Mount Kalaga).', 'Terrain grip is untested; regions are reported spawn areas.'],
      ['Motorcycles', '<a href="#motorcycles">Motorcycles</a> (Dinka Enduro is listed as an Ultimate Edition spawn at Jason&#39;s House).', 'Three bikes only; none measured.'],
      ['Boats', '<a href="#boats-airboats">Boats &amp; Airboats</a> (Crest Kayak spawns at Jason&#39;s House dock; Grassrivers airboat is Grassrivers-only).', 'Speeds untested.'],
  ])}
</section>

<section class="g-section" aria-labelledby="db">
  <h2 id="db">All {len(VEH["items"])} vehicles by class</h2>
  <p>This is the same data as the <a href="/vehicles.html">Vehicles database</a> in crawlable form; open any vehicle there for its image, map link and scan tracking.</p>
  <div class="g-toolbar">
    <input class="g-input" type="search" data-g-filter="vehTables" placeholder="Search by name, class, region or maker" aria-label="Search vehicles">
    <select class="g-select" data-g-filter-select="vehTables" aria-label="Vehicle class"><option value="">All classes</option>{opts}</select>
    <span style="color:#94a3b8;font-size:.8rem"><span data-g-count="vehTables">0</span> vehicles shown</span>
  </div>
  <div id="vehTables">{''.join(tables)}</div>
</section>

<section class="g-section" id="storage" aria-labelledby="stor">
  <h2 id="stor">How to store and keep vehicles in GTA 6</h2>
  <p>{badge('com')} {badge('unv','REPORTS CONFLICT')} Reports disagree on the details, so treat this as a summary of what is reported, not a how-to.</p>
  <ul>
    <li>Reports say early-game cars can be parked at safehouse spaces but may be lost if heavily damaged, abandoned during a mission or after you are busted or wasted.</li>
    <li>One set of reports says stolen vehicles can be <strong>registered</strong> (for example via a Pay 'n' Spray or a contact unlocked after the Chapter 2 mission "Moses") to become personal vehicles that can be recovered and summoned with the ScooterBros phone app; another set talks only about garages. We could not confirm either in-game.</li>
    <li>Purchasable garages: the properties data lists 8 purchasable garages (prices not confirmed) plus 4 story garages and the Ultimate Edition Paradise Garage. See the <a href="/gta-6-property-ownership/">property ownership guide</a> and the <a href="/properties.html">Properties database</a>.</li>
    <li>Selling cars: Moses and Randy are the two vehicle buyers. Moses is reported to accept only untracked vehicles; Randy is reported to buy from a wish list of high-end vehicles. See the <a href="/gta-6-money-guide/">money guide</a>.</li>
  </ul>
</section>

<section class="g-section" aria-labelledby="cust">
  <h2 id="cust">Vehicle customization</h2>
  <p>{badge('com')} Guides name the customization shops Rideout Customs and One-Eyed Willie's and describe paint, rims, spoilers and performance parts. No prices, part lists or performance effects are confirmed here, so none are listed.</p>
  <p>Plan your collection with the <a href="/map.html">map</a>, the <a href="/vehicles.html">vehicle database</a> and the <a href="/gta-6-100-completion-tracker/">100% tracker</a> (200 of 277 base models must be scanned).</p>
</section>'''
    faqs = [
        ('What is the fastest car in GTA 6?', 'This site has not measured top speeds, so it does not name one. Every vehicle in the database lists top speed as "Not yet confirmed". Rankings will be added only after repeatable in-game tests with a recorded build number.'),
        ('Where can I find supercars in GTA 6?', 'The database reports Vice City and Vice Beach luxury districts for the Super class. These are regions, not exact coordinates, and are not in-game verified here.'),
        ('How do I store stolen cars in GTA 6?', 'Reports disagree: some describe registering stolen vehicles to make them recoverable personal vehicles, others describe parking at safehouses or garages. We could not verify either, so check in-game and see the property guide for garages.'),
        ('Can you customize vehicles in GTA 6?', 'Guides report customization shops such as Rideout Customs and One-Eyed Willie\'s. Prices and performance effects are not confirmed here.'),
    ]
    page('gta-6-vehicles-guide', 'GTA 6 Vehicle Guides: Cars, Bikes, Boats, Storage & Customization | GTA6HeistGuide.com',
         'GTA 6 vehicle guide built on our 33-vehicle database: classes, reported spawn regions, storage and customization reports, and an honest note on untested top speeds.',
         'GTA 6 Vehicle Guides: Fastest Cars, Getaway Picks, Storage and Customization',
         f'A search-focused guide built on the existing {len(VEH["items"])}-vehicle database. It separates what is reported from what is tested, and it will not name a "fastest" car until that has been measured.',
         body, 'Vehicle Guides', faqs, hero_badges=badge('site') + badge('unv', 'NO TOP SPEEDS TESTED'))


# =====================================================================================================
# 6. PROPERTY OWNERSHIP
# =====================================================================================================
def prop_rows(types, cols):
    rows = []
    for t in types:
        for it in by_type.get(t, []):
            pin = (f'<a href="/map.html?pin={e(it["mapPinId"])}">map pin</a>' if it.get('mapPinId') else 'no pin yet')
            rows.append([f'<a href="/properties.html?item={e(it["id"])}">{e(it["name"])}</a>'] + [c(it) if callable(c) else e(str(it.get(c, ''))) for c in cols] + [pin])
    return rows


def properties():
    n = len(REC)
    pins = sum(1 for i in REC if i.get('mapPinId'))
    safe = prop_rows(['Story Safehouse'], ['region', 'unlockRequirement', lambda i: e(i.get('missableWarning') or '—')])
    gar = prop_rows(['Purchasable Garage'], ['region', 'purchaseAvailability'])
    sgar = prop_rows(['Story Garage', 'Bonus Garage'], ['region', 'purchaseAvailability'])
    fences = prop_rows(['Fence', 'Vehicle Buyer'], ['propertyType', 'region', 'unlockRequirement'])
    body = f'''
{evidence('Counts come from the site\'s own properties database (unique records), not from adding unrelated category totals.')}

<section class="g-section" aria-labelledby="quick">
  <h2 id="quick">Quick answers: what can you buy in GTA 6?</h2>
  {table(['Question','Answer','Status'], [
      ['Can you buy houses?', 'No. Safehouses are unlocked through the story: this site\'s data lists 4 story safehouses and 0 purchasable houses.', badge('site') + badge('ind', 'ATTRIBUTED: TIMESAVER')],
      ['Can you buy businesses?', 'No passive-income businesses are reported to be buyable in Story Mode.', badge('com')],
      ['Can you buy garages?', 'Yes. 8 purchasable garages are listed (prices not confirmed), plus 4 story garages and 1 Ultimate Edition bonus garage. A real-estate phone app is reported to be the way to buy them.', badge('site') + badge('com', 'APP DETAILS REPORTED')],
      ['Can you buy boats?', 'No evidence of a boat-purchase system was found either way. Treat as unconfirmed.', badge('unv')],
      ['What can you spend money on?', 'Reports name weapons and gear (see the 24 gun stores), clothes, tattoos and hairstyles, and vehicle registration and customization.', badge('com')],
      ['What can you not buy?', 'Houses, and (reportedly) passive-income businesses. Anything else is unknown.', badge('com')],
  ])}
  <p style="margin-top:.6rem">Ownership is different from the <a href="/safehouses-laundering">Safehouses &amp; Laundering simulator</a>, which prices fan-made properties and is a {badge('sim')} — not how the game works.</p>
</section>

<section class="g-section" aria-labelledby="safe">
  <h2 id="safe">All GTA 6 safehouse locations (story safehouses)</h2>
  <p>{badge('site')} Four story safehouses, unlocked through chapters. Two have limited availability noted in the data. Open each record in the <a href="/properties.html">Properties database</a>.</p>
  {table(['Safehouse','Region','Unlock','Missable warning','Map'], safe)}
</section>

<section class="g-section" aria-labelledby="garages">
  <h2 id="garages">Garages: how to buy one and what is purchasable</h2>
  <p>{badge('site')} {badge('com', 'PURCHASE FLOW REPORTED')} Guides say a real-estate app becomes available early (after a mission called "Daily Driver") and lets you buy garages. <strong>Prices are not confirmed</strong> and garage slot counts are not confirmed, so none are listed.</p>
  <h3>8 purchasable garages</h3>
  {table(['Garage','Region','Availability','Map'], gar)}
  <h3>Story garages and the Ultimate Edition bonus garage</h3>
  {table(['Garage','Region','Availability','Map'], sgar)}
  <p>Edition note: the Paradise Garage is listed as an Ultimate Edition bonus. The Ultimate Edition also lists a Dinka Enduro and Crest Kayak spawning at Jason's House (existing data). More on what you can store in the <a href="/gta-6-vehicles-guide/#storage">vehicle storage guide</a>.</p>
</section>

<section class="g-section" aria-labelledby="fences">
  <h2 id="fences">Fence contacts and vehicle buyers</h2>
  <p>{badge('conf','SITE CLASSIFICATION')} There are <strong>seven fence contacts in total</strong>: five stolen-goods fences (Brian, Donnie, Dunk, Tyrone, Yasmani) and two vehicle buyers (Moses, Randy). Ambrosia and Grassrivers are <strong>not</strong> fence contacts; they remain in the database only as unverified regional leads.</p>
  {table(['Contact','Type','Region','Unlock','Map'], fences)}
  <p style="margin-top:.5rem">Dunk and Tyrone have no map pin because no verified coordinates exist. Donnie is flagged as closing after the mission "Swamped". See the <a href="/gta-6-money-guide/">money guide</a> for payout notes.</p>
</section>

<section class="g-section" aria-labelledby="count">
  <h2 id="count">How the database counts add up</h2>
  <p>The Properties database holds <strong data-property-record-count>{n}</strong> unique records, of which {pins} have a map pin:</p>
  {table(['Group','Records'], [
      ['Story safehouses', '4'], ['Purchasable garages', '8'], ['Story garages', '4'], ['Ultimate Edition bonus garage', '1'],
      ['Fence contacts (5 goods fences + 2 vehicle buyers)', '7'], ['BuckMe Family Savings (money safe)', '1'], ['Unverified regional leads (Ambrosia, Grassrivers)', '2'],
      ['<strong>Total unique records</strong>', f'<strong>{n}</strong>']])}
  <p>"13 garages" on other pages means 8 + 4 + 1. The two unverified leads are excluded from the fence count of 7.</p>
  <h3>Money and spending related tools</h3>
  <div class="g-grid">
    <a class="g-card" href="/properties.html"><strong>Properties database</strong><span>Every record, compare and owned/favorite tracking.</span></a>
    <a class="g-card" href="/gta-6-money-guide/"><strong>Money guide</strong><span>Fences, safe codes, BuckMe savings.</span></a>
    <a class="g-card" href="/weapons-bonuses.html"><strong>Gun stores</strong><span>24 stores to spend cash on weapons.</span></a>
    <a class="g-card" href="/gta-6-vehicles-guide/"><strong>Vehicle guides</strong><span>Storage and customization reports.</span></a>
  </div>
</section>'''
    faqs = [
        ('Can you buy houses in GTA 6?', 'No. This site\'s data lists 4 story safehouses unlocked through the story and 0 purchasable houses.'),
        ('Can you buy businesses in GTA 6?', 'No passive-income businesses are reported to be buyable in Story Mode. This is a report, not a Rockstar statement.'),
        ('Can you buy garages in GTA 6?', 'Yes. The database lists 8 purchasable garages, 4 story garages and 1 Ultimate Edition bonus garage. Prices are not confirmed.'),
        ('Can you buy boats in GTA 6?', 'We found no evidence either way, so it is unconfirmed.'),
        ('What are the seven fence contacts in GTA 6?', 'Five stolen-goods fences (Brian, Donnie, Dunk, Tyrone, Yasmani) and two vehicle buyers (Moses and Randy).'),
        ('How do I buy a garage in GTA 6?', 'Guides report that a real-estate phone app unlocks early in the story and lets you buy garages. Exact steps and prices are not confirmed.'),
    ]
    page('gta-6-property-ownership', 'Can You Buy Houses, Businesses & Garages in GTA 6? Ownership Guide | GTA6HeistGuide.com',
         'GTA 6 ownership FAQ: houses, businesses, garages and boats, all four story safehouses, the 7 fence contacts, and what you can spend money on, with source labels.',
         'GTA 6 Property Ownership Guide: What You Can Buy and Spend Money On',
         'Quick answers on houses, businesses, garages and boats, plus the safehouse, garage and fence tables from the properties database. Confirmed gameplay is separated from fan-made simulations.',
         body, 'Property Ownership Guide', faqs, hero_badges=badge('site') + badge('com'))


if __name__ == '__main__':
    missions(); controls(); troubleshoot(); collectibles(); vehicles(); properties()
