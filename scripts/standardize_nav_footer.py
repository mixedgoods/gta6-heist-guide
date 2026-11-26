#!/usr/bin/env python3
"""
Phase 43: Standardize sitewide <nav> and <footer> across all canonical sitemap pages.
- Unifies <nav> to a single canonical structure (preserving active pill states).
- Unifies <footer> to a single canonical structure (removing duplicate 15-Slot Save Planner link).
- Preserves each page's existing .footer-disclaimer block verbatim (never alters FTC/affiliate wording).
- Adds the canonical <footer> to public/map.html right after <!--/p22:map-guide-->.
"""
import os
import re
import xml.etree.ElementTree as ET

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUBLIC_DIR = os.path.join(BASE_DIR, 'public')
SITEMAP_PATH = os.path.join(PUBLIC_DIR, 'sitemap.xml')

DEFAULT_DISCLAIMER = (
    '<div class="footer-disclaimer">\n'
    '            <p style="margin:0;">\n'
    '                <strong>EDITORIAL &amp; LEGAL NOTICE:</strong> gta6heistguide.com is an independent fan commentary, '
    'editorial guide, and interactive utility portal. Grand Theft Auto, GTA VI, Rockstar Games, and Vice City are registered '
    'trademarks of Take-Two Interactive Software, Inc. This site is not affiliated with, endorsed by, or sponsored by Rockstar '
    'Games or Take-Two Interactive. Some guide and tool pages across this site may include disclosed partner links at no extra '
    'cost to you. &copy; 2026 gta6heistguide.com. All rights reserved.\n'
    '            </p>\n'
    '        </div>'
)


def build_nav(url_path: str) -> str:
    is_home = url_path in ('/', '/index.html')
    is_map = url_path == '/map'
    is_money = url_path.startswith('/gta-6-money-guide')
    is_guides = url_path.startswith(('/missions', '/guides/', '/gta-6-controls', '/gta-6-troubleshooting', '/gta-6-collectibles', '/gta-6-100-completion-tracker', '/gta-6-vehicles-guide', '/gta-6-property-ownership', '/locations/', '/port-gellhorn', '/heists/', '/articles/'))
    is_tips = url_path.startswith(('/gta-6-tips-and-tricks', '/gta-6-settings', '/gaming-gear', '/cheats', '/secrets', '/gta-6-discoveries', '/drops'))
    is_tools = url_path.startswith(('/live', '/gta-6-tools', '/my-leonida', '/heist-command-center', '/heist-planner', '/heist-payout-calculator', '/save-planner', '/free'))
    is_db = url_path.startswith(('/gta-6-database', '/properties', '/animals', '/vehicles', '/weapons', '/radio'))

    def cls(base: str, active: bool) -> str:
        return f'{base} active' if active else base

    return f'''<nav class="navbar" id="siteNavbar">
    <div class="nav-container">
        <a href="/" class="brand-logo" aria-label="GTA 6 Heist Guide Home"><img src="/assets/images/logo.webp" alt="GTA 6 Heist Guide" class="brand-logo-img" width="688" height="110" decoding="async" fetchpriority="high"></a>
        <ul class="nav-links">
            <li><a href="/" class="{cls('nav-pill', is_home)}">HEISTS</a></li>
            <li><a href="/map" class="{cls('nav-pill', is_map)}">MAP</a></li>
            <li><a href="/gta-6-money-guide/" class="{cls('nav-pill', is_money)}">MONEY</a></li>
            <li class="nav-dropdown">
                <button type="button" class="{cls('nav-pill nav-dropdown-btn', is_guides)}" aria-haspopup="true" aria-expanded="false">GUIDES <span class="nav-arrow">▾</span></button>
                <div class="nav-dropdown-menu">
                    <a href="/missions/" class="nav-dropdown-item">🎯 Mission Walkthrough Hub</a>
                    <a href="/guides/gta-6-safe-codes" class="nav-dropdown-item">🔐 All 19 Safe Codes</a>
                    <a href="/gta-6-controls/" class="nav-dropdown-item">🎮 Controls Guide (PS5 &amp; Xbox)</a>
                    <a href="/gta-6-troubleshooting/" class="nav-dropdown-item">🛠️ Troubleshooting Center</a>
                    <a href="/gta-6-collectibles/" class="nav-dropdown-item">💎 Collectibles &amp; 100%</a>
                    <a href="/gta-6-100-completion-tracker/" class="nav-dropdown-item">✅ 100% Completion Tracker</a>
                    <a href="/gta-6-vehicles-guide/" class="nav-dropdown-item">🏎️ Vehicle Guides</a>
                    <a href="/gta-6-property-ownership/" class="nav-dropdown-item">🏠 Property Ownership Guide</a>
                </div>
            </li>
            <li class="nav-dropdown">
                <button type="button" class="{cls('nav-pill nav-dropdown-btn', is_tips)}" aria-haspopup="true" aria-expanded="false">TIPS <span class="nav-arrow">▾</span></button>
                <div class="nav-dropdown-menu">
                    <a href="/gta-6-tips-and-tricks/" class="nav-dropdown-item">💡 Tips &amp; Tricks</a>
                    <a href="/gta-6-settings/" class="nav-dropdown-item">⚙️ Settings &amp; Hardware Hub</a>
                    <a href="/gaming-gear/" class="nav-dropdown-item">🎮 Gaming Gear Buying Guide</a>
                    <a href="/cheats" class="nav-dropdown-item">⚡ Cheats</a>
                    <a href="/secrets" class="nav-dropdown-item">🥚 Secrets</a>
                    <a href="/gta-6-discoveries/" class="nav-dropdown-item">📡 Discoveries</a>
                </div>
            </li>
            <li class="nav-dropdown">
                <button type="button" class="{cls('nav-pill nav-dropdown-btn', is_tools)}" aria-haspopup="true" aria-expanded="false">TOOLS <span class="nav-arrow">▾</span></button>
                <div class="nav-dropdown-menu">
                    <a href="/live" class="nav-dropdown-item" style="color:var(--neon-pink); font-weight:800;">🔴 LIVE Companion</a>
                    <a href="/gta-6-tools/" class="nav-dropdown-item nav-dropdown-hub">🧰 All GTA 6 Tools Hub</a>
                    <a href="/my-leonida/" class="nav-dropdown-item" style="color:var(--neon-green); font-weight:800;">🌴 My Leonida Dashboard</a>
                    <a href="/heist-command-center/" class="nav-dropdown-item" style="color:var(--neon-cyan); font-weight:800;">🛰️ Heist Command Center</a>
                    <a href="/heist-planner" class="nav-dropdown-item">🎯 Heist Planner</a>
                    <a href="/heist-payout-calculator" class="nav-dropdown-item">💰 Heist Payout Calculator</a>
                    <a href="/save-planner/" class="nav-dropdown-item">💾 15-Slot Save Planner</a>
                    <a href="/free/" class="nav-dropdown-item">🚀 Free Tools Suite</a>
                </div>
            </li>
            <li class="nav-dropdown nav-dropdown-right">
                <button type="button" class="{cls('nav-pill nav-dropdown-btn', is_db)}" aria-haspopup="true" aria-expanded="false">DATABASE <span class="nav-arrow">▾</span></button>
                <div class="nav-dropdown-menu">
                    <a href="/gta-6-database/" class="nav-dropdown-item nav-dropdown-hub">📚 World Database Hub</a>
                    <a href="/properties" class="nav-dropdown-item">🏠 Properties</a>
                    <a href="/animals" class="nav-dropdown-item">🐊 Animals &amp; Wildlife</a>
                    <a href="/vehicles" class="nav-dropdown-item">🏎️ Vehicles</a>
                    <a href="/weapons" class="nav-dropdown-item">⚔️ Weapons</a>
                    <a href="/weapons-bonuses" class="nav-dropdown-item">🔫 Gun Stores</a>
                    <a href="/radio" class="nav-dropdown-item">📻 Radio Stations</a>
                </div>
            </li>
        </ul>
    </div>
</nav>'''


def build_footer(disclaimer_html: str) -> str:
    return f'''<footer>
    <div class="footer-spread-wrap">
        <div class="footer-top-brand">
            <div>
                <a href="/" class="footer-brand-logo" aria-label="GTA 6 Heist Guide Home"><img src="/assets/images/logo.webp" alt="GTA 6 Heist Guide" class="footer-brand-logo-img" width="688" height="110" loading="lazy" decoding="async"></a>
                <p style="color:#64748b; font-size:0.85rem; margin:0.45rem 0 0; max-width:480px; line-height:1.5;">Verified tactical guides, interactive Leonida Map, 15-slot Save Planner, and World Database for Grand Theft Auto VI.</p>
            </div>
            <div style="display:flex; gap:0.75rem; flex-wrap:wrap; align-items:center;">
                <a href="/heist-command-center/" class="btn btn-secondary" style="padding:0.45rem 1rem; font-size:0.8rem;">🛰️ Heist Command Center</a>
                <a href="/map" class="btn btn-primary" style="padding:0.45rem 1rem; font-size:0.8rem;">🗺️ Leonida Map &rarr;</a>
            </div>
        </div>

        <div class="footer-links-grid">
            <div>
                <span class="footer-col-title" style="color:var(--neon-cyan);">🛠️ Launch Tools</span>
                <ul class="footer-col-links">
                    <li><a href="/gta-6-tools/" style="color:var(--neon-cyan); font-weight:700;">🧰 All GTA 6 Tools Hub</a></li>
                    <li><a href="/save-planner/" style="color:var(--neon-green); font-weight:700;">💾 15-Slot Save Planner</a></li>
                    <li><a href="/heist-payout-calculator">💰 Heist Payout Calculator</a></li>
                    <li><a href="/heist-planner">🎯 Squad Heist Planner</a></li>
                    <li><a href="/cheats">⚡ Cheats &amp; Glitches</a></li>
                    <li><a href="/gta-6-settings/">⚙️ 30 FPS Console Settings</a></li>
                    <li><a href="/free/" style="color:var(--neon-amber); font-weight:700;">🚀 Free Tools Suite</a></li>
                </ul>
            </div>
            <div>
                <span class="footer-col-title" style="color:var(--neon-pink);">🗺️ Databases &amp; Map</span>
                <ul class="footer-col-links">
                    <li><a href="/gta-6-database/" style="color:var(--neon-yellow); font-weight:700;">📚 World Database Hub</a></li>
                    <li><a href="/properties">🏠 Properties &amp; Garages</a></li>
                    <li><a href="/animals">🐊 Animals &amp; Wildlife</a></li>
                    <li><a href="/vehicles">🏎️ Vehicles Catalog</a></li>
                    <li><a href="/weapons">⚔️ Weapons Arsenal</a></li>
                    <li><a href="/weapons-bonuses">🔫 24 Gun Stores</a></li>
                    <li><a href="/radio">📻 Radio Stations</a></li>
                </ul>
            </div>
            <div>
                <span class="footer-col-title" style="color:var(--neon-green);">📖 Guides &amp; Story</span>
                <ul class="footer-col-links">
                    <li><a href="/missions/">🎯 Mission Walkthroughs</a></li>
                    <li><a href="/gta-6-money-guide/">💵 GTA 6 Money Guide</a></li>
                    <li><a href="/guides/gta-6-safe-codes">🔐 All 19 Safe Codes</a></li>
                    <li><a href="/gta-6-100-completion-tracker/">✅ 100% Completion Tracker</a></li>
                    <li><a href="/gta-6-tips-and-tricks/">💡 Tips &amp; Tricks</a></li>
                    <li><a href="/secrets">🥚 Secrets &amp; Cryptids</a></li>
                    <li><a href="/gaming-gear/">🎮 Gaming Gear Guide</a></li>
                </ul>
            </div>
            <div>
                <span class="footer-col-title" style="color:#94a3b8;">📡 Live &amp; Trust</span>
                <ul class="footer-col-links">
                    <li><a href="/my-leonida/" style="color:var(--neon-green); font-weight:700;">🌴 My Leonida Dashboard</a></li>
                    <li><a href="/live" style="color:var(--neon-pink); font-weight:700;">🔴 LIVE Companion</a></li>
                    <li><a href="/drops">🎁 Twitch Drops &amp; Rewards</a></li>
                    <li><a href="/gta-6-discoveries/">📡 Community Discoveries</a></li>
                    <li><a href="/about">About</a></li>
                    <li><a href="/contact">Contact</a></li>
                    <li><a href="/privacy-policy">Privacy Policy</a></li>
                    <li><a href="/terms">Terms &amp; DMCA</a></li>
                </ul>
            </div>
        </div>

        {disclaimer_html}
    </div>
</footer>'''


def url_to_file(u: str) -> str:
    p = u.lstrip('/')
    if not p:
        return os.path.join(PUBLIC_DIR, 'index.html')
    idx = os.path.join(PUBLIC_DIR, p, 'index.html')
    if os.path.isfile(idx):
        return idx
    html = os.path.join(PUBLIC_DIR, p + '.html')
    if os.path.isfile(html):
        return html
    return os.path.join(PUBLIC_DIR, p)


def main():
    tree = ET.parse(SITEMAP_PATH)
    urls = [
        el.text.replace('https://www.gta6heistguide.com', '')
        for el in tree.getroot().iter()
        if el.tag.endswith('loc')
    ]
    nav_updated = 0
    footer_updated = 0
    map_footer_added = False

    for u in urls:
        fp = url_to_file(u)
        if not os.path.isfile(fp):
            print(f'WARN missing file for {u}: {fp}')
            continue
        txt = open(fp, encoding='utf-8').read()
        orig = txt

        # 1. Replace <nav ...>...</nav> (first occurrence — top site navbar)
        new_nav = build_nav(u)
        if re.search(r'<nav\b[^>]*>.*?</nav>', txt, re.S):
            txt = re.sub(r'<nav\b[^>]*>.*?</nav>', lambda _: new_nav, txt, count=1, flags=re.S)
            nav_updated += 1

        # 2. Replace <footer>...</footer> preserving existing .footer-disclaimer if present
        fm = re.search(r'<footer\b[^>]*>.*?</footer>', txt, re.S)
        if fm:
            dm = re.search(r'<div class="footer-disclaimer">.*?</div>', fm.group(0), re.S)
            disclaimer = dm.group(0) if dm else DEFAULT_DISCLAIMER
            new_footer = build_footer(disclaimer)
            txt = txt[:fm.start()] + new_footer + txt[fm.end():]
            footer_updated += 1
        elif u == '/map':
            # Add canonical footer right after <!--/p22:map-guide-->
            marker = '<!--/p22:map-guide-->'
            if marker in txt:
                txt = txt.replace(marker, marker + '\n' + build_footer(DEFAULT_DISCLAIMER), 1)
                footer_updated += 1
                map_footer_added = True

        if txt != orig:
            with open(fp, 'w', encoding='utf-8') as f:
                f.write(txt)

    print(f'Processed {len(urls)} canonical pages: nav_updated={nav_updated}, footer_updated={footer_updated}, map_footer_added={map_footer_added}')


if __name__ == '__main__':
    main()
