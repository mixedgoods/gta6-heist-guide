#!/usr/bin/env python3
"""
GTA6HeistGuide.com — Complete Day-2 Site-Wide Synchronizer
Flips pre-order/countdown banners, updates navbars & footers across all 43 HTML pages,
and injects the Day-2 Launch & Intel Hub on index.html.
"""

import os
import glob
import re

PUBLIC_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "public")

DAY2_STRIP_HTML = """<div class="countdown-strip">
    <div class="countdown-strip-inner">
        <div class="strip-left-items">
            <a href="/cheats.html" class="strip-pill countdown-pill-link" title="🔥 GTA 6 IS LIVE NOW — DAY-2 CHEATS, MAPS & DROPS">
                <span class="strip-pulse"></span>
                <span class="launch-mode-label" style="color:var(--neon-pink); font-weight:900;">🔥 GTA 6 IS LIVE NOW — DAY-2 CHEATS, MAPS &amp; DROPS</span>
            </a>
            <span class="strip-divider">|</span>
            <span class="strip-pill">Weekly Meta Reset: <span class="highlight" id="weeklyResetTimer">Loading...</span></span>
            <span class="strip-divider">|</span>
            <a href="/giveaways.html" class="strip-pill" style="color:#c084fc; text-decoration:none; font-weight:800;">🎁 Twitch Drops &amp; Kick 10K</a>
        </div>
        <div class="strip-right-actions">
            <a href="/cheats.html" class="strip-pill" style="color:var(--neon-yellow); text-decoration:none; font-size:0.75rem;">⚡ 61 Cheats</a>
            <a href="/settings.html" class="strip-pill" style="color:var(--neon-cyan); text-decoration:none; font-size:0.75rem;">⚙️ Settings</a>
            <a href="/money-guide.html" class="strip-pill" style="color:var(--neon-green); text-decoration:none; font-size:0.75rem;">💰 Fast Cash</a>
            <a href="/weapons-bonuses.html" class="strip-pill" style="color:#f43f5e; text-decoration:none; font-size:0.75rem;">🔫 Gun Stores</a>
        </div>
    </div>
</div>"""

DAY2_HOMEPAGE_HUB_HTML = """    <!-- DAY-2 LAUNCH & INTEL HUB -->
    <section class="tool-box pink-glow" id="day2Hub" style="margin-bottom:1.75rem; border-color:var(--neon-yellow); background:linear-gradient(135deg, rgba(25,18,35,0.95), rgba(12,10,22,0.98)); box-shadow:0 0 30px rgba(255,184,0,0.18);">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem; margin-bottom:1.25rem;">
            <div>
                <div style="display:flex; gap:0.5rem; align-items:center; flex-wrap:wrap; margin-bottom:0.35rem;">
                    <span class="user-badge" style="background:var(--neon-yellow); color:#000; font-weight:900; font-size:0.75rem;">🔥 DAY-2 LAUNCH HUB</span>
                    <span style="color:var(--neon-pink); font-size:0.82rem; font-weight:800;">GTA 6 IS LIVE NOW ACROSS PS5, PS5 PRO &amp; XBOX</span>
                </div>
                <h2 style="color:#fff; font-size:clamp(1.35rem, 2.5vw, 1.85rem); margin:0 0 0.25rem;">
                    Day-2 Tactical Intel: Cheats, 30 FPS Settings, Fast Cash &amp; 24 Gun Stores
                </h2>
                <p style="color:var(--text-muted); font-size:0.9rem; margin:0;">
                    Jump directly into our four high-traffic Day-2 tactical tools equipped with browser-saved progress tracking and Cloudflare D1 auto-verification:
                </p>
            </div>
            <a href="/cheats.html" class="btn btn-primary" style="background:linear-gradient(135deg, #eab308, #ca8a04); color:#000; font-weight:900; padding:0.6rem 1.25rem; font-size:0.88rem; box-shadow:0 0 15px rgba(234,179,8,0.4);">
                ⚡ Open 61 Cheats Tracker &rarr;
            </a>
        </div>

        <div class="grid" style="grid-template-columns:repeat(auto-fit, minmax(min(100%, 240px), 1fr)); gap:1rem;">
            <!-- Hub Card 1: Cheats -->
            <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,184,0,0.3); border-radius:8px; padding:1.15rem; display:flex; flex-direction:column; justify-content:space-between;">
                <div>
                    <span class="user-badge" style="background:rgba(255,184,0,0.15); color:var(--neon-yellow); font-size:0.7rem; border-color:var(--neon-yellow);">PHONE TERMINAL</span>
                    <h3 style="color:#fff; font-size:1.1rem; margin:0.4rem 0 0.25rem;">Interactive 61 Cheats Tracker</h3>
                    <p style="color:var(--text-muted); font-size:0.82rem; line-height:1.45; margin:0 0 0.75rem;">
                        Open phone (Up D-Pad) &gt; hold L1/LB + R1/RB &gt; enter D-Pad arrow sequence. Includes $250k cash, bulldozer, armor, and 61 milestone trackers.
                    </p>
                </div>
                <a href="/cheats.html" class="btn btn-secondary" style="color:var(--neon-yellow); border-color:var(--neon-yellow); text-align:center; font-size:0.8rem; padding:0.45rem;">
                    Launch Cheats Tracker &rarr;
                </a>
            </div>

            <!-- Hub Card 2: Settings -->
            <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(0,240,255,0.3); border-radius:8px; padding:1.15rem; display:flex; flex-direction:column; justify-content:space-between;">
                <div>
                    <span class="user-badge" style="background:rgba(0,240,255,0.15); color:var(--neon-cyan); font-size:0.7rem; border-color:var(--neon-cyan);">30 FPS CALIBRATION</span>
                    <h3 style="color:#fff; font-size:1.1rem; margin:0.4rem 0 0.25rem;">Best PS5 &amp; Xbox Settings</h3>
                    <p style="color:var(--text-muted); font-size:0.82rem; line-height:1.45; margin:0 0 0.75rem;">
                        Aim Sensitivity 7–8, Standard Response Curve, lowest deadzones, TV Game Mode &amp; HGiG HDR, plus KontrolFreek &amp; Samsung 990 PRO gear matching.
                    </p>
                </div>
                <a href="/settings.html" class="btn btn-secondary" style="color:var(--neon-cyan); border-color:var(--neon-cyan); text-align:center; font-size:0.8rem; padding:0.45rem;">
                    View Settings Cheat Sheet &rarr;
                </a>
            </div>

            <!-- Hub Card 3: Money Guide -->
            <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(0,255,136,0.3); border-radius:8px; padding:1.15rem; display:flex; flex-direction:column; justify-content:space-between;">
                <div>
                    <span class="user-badge" style="background:rgba(0,255,136,0.15); color:var(--neon-green); font-size:0.7rem; border-color:var(--neon-green);">BUCKME SAVINGS</span>
                    <h3 style="color:#fff; font-size:1.1rem; margin:0.4rem 0 0.25rem;">Chapter 1 &amp; 2 Fast Cash</h3>
                    <p style="color:var(--text-muted); font-size:0.82rem; line-height:1.45; margin:0 0 0.75rem;">
                        Interactive checklist for Fishing Shacks, Exotic Animals, Weed Grows, Brooks Boatworks, and Junkyards to fund early syndicate setups.
                    </p>
                </div>
                <a href="/money-guide.html" class="btn btn-secondary" style="color:var(--neon-green); border-color:var(--neon-green); text-align:center; font-size:0.8rem; padding:0.45rem;">
                    Open Cash Checklist &rarr;
                </a>
            </div>

            <!-- Hub Card 4: Weapons & Bonuses -->
            <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(244,63,94,0.3); border-radius:8px; padding:1.15rem; display:flex; flex-direction:column; justify-content:space-between;">
                <div>
                    <span class="user-badge" style="background:rgba(244,63,94,0.15); color:#f43f5e; font-size:0.7rem; border-color:#f43f5e;">24 GUN STORES</span>
                    <h3 style="color:#fff; font-size:1.1rem; margin:0.4rem 0 0.25rem;">Ammu-Nation &amp; Weapon Bonuses</h3>
                    <p style="color:var(--text-muted); font-size:0.82rem; line-height:1.45; margin:0 0 0.75rem;">
                        Searchable 24-store table (Vice City Firearms, Martez Empenos, Black Eagle) + Jason's Duval Signature ES9 pistol &amp; ink unlock guide.
                    </p>
                </div>
                <a href="/weapons-bonuses.html" class="btn btn-secondary" style="color:#f43f5e; border-color:#f43f5e; text-align:center; font-size:0.8rem; padding:0.45rem;">
                    Explore 24 Stores &rarr;
                </a>
            </div>
        </div>
    </section>

"""

def build_nav_links(current_file):
    is_home = current_file == "index.html"
    is_cheats = current_file == "cheats.html"
    is_settings = current_file == "settings.html"
    is_money = current_file == "money-guide.html"
    is_weapons_bonuses = current_file == "weapons-bonuses.html"
    is_giveaways = current_file == "giveaways.html"
    is_map = "map" in current_file
    is_planner = "planner" in current_file
    is_weapons = current_file == "weapons-gear.html"
    is_vehicles = current_file == "vehicles-getaway-cars.html"
    is_intel = current_file == "live-intel.html"

    return f"""<ul class="nav-links">
            <li><a href="/" class="nav-pill{' active' if is_home else ''}">Vaults</a></li>
            <li><a href="/cheats.html" class="nav-pill{' active' if is_cheats else ''}" style="color:var(--neon-yellow); font-weight:800;">⚡ Cheats</a></li>
            <li><a href="/settings.html" class="nav-pill{' active' if is_settings else ''}" style="color:var(--neon-cyan); font-weight:800;">⚙️ Settings</a></li>
            <li><a href="/money-guide.html" class="nav-pill{' active' if is_money else ''}" style="color:var(--neon-green); font-weight:800;">💰 Cash Guide</a></li>
            <li><a href="/weapons-bonuses.html" class="nav-pill{' active' if is_weapons_bonuses else ''}" style="color:#f43f5e; font-weight:800;">🔫 Gun Stores</a></li>
            <li><a href="/giveaways.html" class="nav-pill{' active' if is_giveaways else ''}" style="color:#c084fc; font-weight:800;">🎁 Drops</a></li>
            <li><a href="/interactive-map.html" class="nav-pill{' active' if is_map else ''}">Radar Map</a></li>
            <li><a href="/heist-planner.html" class="nav-pill{' active' if is_planner else ''}">Planner</a></li>
            <li><a href="/weapons-gear.html" class="nav-pill{' active' if is_weapons else ''}" style="color:var(--neon-yellow);">Weapons</a></li>
            <li><a href="/vehicles-getaway-cars.html" class="nav-pill{' active' if is_vehicles else ''}" style="color:var(--neon-pink);">Vehicles</a></li>
            <li><a href="/live-intel.html" class="nav-pill{' active' if is_intel else ''}">Live Meta</a></li>
            <li><a href="/free" class="nav-pill pill-highlight" style="color:var(--neon-amber); font-weight:800;">⚡ Free Suite</a></li>
        </ul>"""

def update_html_file(file_path):
    fname = os.path.basename(file_path)
    with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
        content = f.read()

    orig = content

    # 1. Update countdown strip
    content = re.sub(
        r'<div class="countdown-strip">.*?</div>\s*</div>\s*</div>',
        DAY2_STRIP_HTML,
        content,
        flags=re.DOTALL
    )

    # 2. Update nav-links
    new_nav = build_nav_links(fname)
    content = re.sub(
        r'<ul class="nav-links">.*?</ul>',
        new_nav,
        content,
        flags=re.DOTALL
    )

    # 3. Flips across site
    content = content.replace("🔥 Amazon PS5 Pre-Order", "🔥 Amazon PS5 Day-2 Delivery")
    content = content.replace("Amazon PS5 Pre-Order", "Amazon PS5 Day-2 Delivery")
    content = content.replace("Pre-Order Game Key", "Order Game Key (Instant Delivery)")
    content = content.replace("Pre-Order Day-1 Amazon PS5", "Order Day-2 Amazon PS5")
    content = content.replace("🛒 PRE-ORDER ON AMAZON &rarr;", "🛒 ORDER ON AMAZON (DAY-2 DELIVERY) &rarr;")
    content = content.replace("🛒 PRE-ORDER ON AMAZON", "🛒 ORDER ON AMAZON (DAY-2 DELIVERY)")
    content = content.replace("(Pre-Order Price Match)", "(Day-2 Delivery Price Match)")
    content = content.replace("<!-- Column 4: Syndicate & Pre-Orders -->", "<!-- Column 4: Syndicate & Day-2 Deals -->")
    content = content.replace("Column 4: Syndicate & Pre-Orders", "Column 4: Syndicate & Day-2 Deals")
    content = content.replace("🎁 Pre-Orders &amp; Gear", "🎁 Day-2 Deals")
    content = content.replace("Pre-Orders &amp; Gear", "Day-2 Deals")
    content = content.replace("Pre-Order GTA 6 &amp; Official Pro Gear Under Retail", "🔥 GTA 6 IS LIVE NOW — DAY-2 CHEATS, MAPS &amp; DROPS")
    content = content.replace("Pre-Order GTA 6 &amp; Tested Low-Latency Hardware", "🔥 GTA 6 IS LIVE NOW — DAY-2 CHEATS, MAPS &amp; DROPS")
    content = content.replace("Lock in pre-orders and PSN/Xbox wallet cards under retail now before launch-window demand causes digital store queues.", "Lock in Day-2 game keys and PSN/Xbox wallet cards under retail now for instant digital delivery.")
    content = content.replace("Compare discounted GTA 6 pre-orders and PSN", "Compare discounted GTA 6 game keys and PSN")
    content = content.replace("verified digital pre-order game keys", "verified digital game keys")

    # 4. Inject Day-2 Hub on index.html if not already present
    if fname == "index.html" and 'id="day2Hub"' not in content:
        # Place right before id="featuredVaultBanner"
        target = '<section class="weekly-meta-board" id="featuredVaultBanner">'
        if target in content:
            content = content.replace(target, DAY2_HOMEPAGE_HUB_HTML + target)
        else:
            # fallback: before </main>
            content = content.replace("</main>", DAY2_HOMEPAGE_HUB_HTML + "</main>")

    # 5. Ensure secondary footer links have the 4 day-2 pages
    if '<div class="footer-secondary-strip">' in content:
        sec_links = """<div class="footer-secondary-strip">
            <div style="display: flex; gap: 1.5rem; flex-wrap: wrap;">
                <a href="/cheats.html" style="color: var(--neon-yellow); text-decoration: none; font-weight: 700;">⚡ Cheats</a>
                <a href="/settings.html" style="color: var(--neon-cyan); text-decoration: none; font-weight: 700;">⚙️ Settings</a>
                <a href="/money-guide.html" style="color: var(--neon-green); text-decoration: none; font-weight: 700;">💰 Cash Guide</a>
                <a href="/weapons-bonuses.html" style="color: #f43f5e; text-decoration: none; font-weight: 700;">🔫 Gun Stores</a>
                <a href="/giveaways.html" style="color: #c084fc; text-decoration: none; font-weight: 700;">🎁 Giveaways</a>
                <a href="/about.html" style="color: #94a3b8; text-decoration: none;">About</a>
                <a href="/contact.html" style="color: #94a3b8; text-decoration: none;">Contact</a>
                <a href="/privacy-policy.html" style="color: #94a3b8; text-decoration: none;">Privacy Policy</a>
                <a href="/terms.html" style="color: #94a3b8; text-decoration: none;">Terms &amp; DMCA</a>
            </div>"""
        content = re.sub(
            r'<div class="footer-secondary-strip">\s*<div style="display:\s*flex;[^"]*">.*?</div>',
            sec_links,
            content,
            flags=re.DOTALL
        )

    if content != orig:
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"[✓] Updated {fname}")
    else:
        print(f"[-] No changes needed for {fname}")

def main():
    print(f"[*] Processing HTML files in {PUBLIC_DIR}...")
    files = glob.glob(os.path.join(PUBLIC_DIR, "*.html"))
    for f in sorted(files):
        update_html_file(f)
    print(f"[✓] Successfully processed {len(files)} files.")

if __name__ == "__main__":
    main()
