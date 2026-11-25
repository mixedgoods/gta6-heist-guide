#!/usr/bin/env python3
"""Phase 33 — Apply homepage visual showcase, contextual placements, and dead-ASIN migration."""
import os
import re
from pathlib import Path

ROOT = Path("public")

# 1. Update Homepage #officialDealsBox -> GEAR FOR YOUR NEXT RUN (4 verified visual cards)
HOMEPAGE_SECTION = '''    <!-- 7. GEAR FOR YOUR NEXT RUN (PHASE 33 VISUAL COMMERCE — 4 VERIFIED PICKS) -->
    <section id="officialDealsBox" class="aff-card-module aff-setup-picks-section" style="margin:1.65rem auto 1.95rem; max-width:1160px; box-sizing:border-box;">
        <div class="aff-module-head">
            <div>
                <span class="aff-module-eyebrow">Verified Console Gear &middot; PS5 &amp; Xbox</span>
                <h2 class="aff-module-title">GEAR FOR YOUR NEXT RUN</h2>
                <p class="aff-module-sub">Affordable, verified controller charging, thumbstick grips, wired audio, and desk essentials. <a href="/gaming-gear/" class="aff-hub-inline-link">Explore Full Gaming Gear Guide &rarr;</a></p>
            </div>
            <span class="aff-disclosure-tag aff-disclosure-tag--sponsored">Sponsored Recommendations</span>
        </div>

        <div id="homeSetupPicks"
             data-aff-slot="home-setup-picks"
             data-aff-context="homepage-setup"
             data-aff-variant="setup-picks-4"
             data-aff-count="4">
            <div class="aff-grid-4">
                <article class="aff-card aff-card--standard aff-card--visual aff-accent-cyan" aria-label="PowerA Twin Charging Station for DualSense Controllers">
                    <a href="https://www.amazon.com/dp/B09B1XX1PN?tag=gta6heistguid-20" data-amazon-link="poweraPs5Dock" data-aff-asin="B09B1XX1PN" target="_blank" rel="sponsored nofollow noopener" data-aff-partner="amazon" data-aff-product="poweraPs5Dock" data-aff-category="Controllers &amp; Charging" data-aff-placement="home-setup-picks-1" data-aff-area="image" class="aff-stage aff-stage--illus" aria-label="View PowerA Twin Charging Station on Amazon">
                        <img class="aff-stage-img" src="/assets/gear-illustrations/ps5-charging-dock.svg" alt="Category illustration of a dual PlayStation 5 controller charging station" width="400" height="300" loading="lazy" decoding="async">
                        <span class="aff-stage-badge aff-stage-badge--illus">Category Illustration</span>
                    </a>
                    <div class="aff-card-body">
                        <div class="aff-meta-row">
                            <span class="aff-brand-eyebrow">PowerA</span>
                            <span class="aff-badge-pill">PS5 Charging Dock</span>
                            <span class="aff-disclosure-tag aff-disclosure-tag--sponsored">Sponsored &middot; Paid link</span>
                        </div>
                        <h3 class="aff-card-title">PowerA Twin Charging Station for DualSense Controllers</h3>
                        <p class="aff-card-desc">Officially licensed click-down dual charging cradle that charges two PS5 DualSense controllers simultaneously without using console USB ports.</p>
                        <div class="aff-card-compat"><span class="aff-compat-label">Fits:</span> <span class="aff-compat-val">PlayStation 5 (DualSense Wireless Controllers)</span></div>
                        <div class="aff-card-why"><span class="aff-why-dot" aria-hidden="true">&#10003;</span> Keeps a charged controller ready between long Leonida story runs.</div>
                    </div>
                    <div class="aff-card-foot">
                        <div class="aff-price-note">Check current price and availability on Amazon.</div>
                        <a href="https://www.amazon.com/dp/B09B1XX1PN?tag=gta6heistguid-20" data-amazon-link="poweraPs5Dock" data-aff-asin="B09B1XX1PN" target="_blank" rel="sponsored nofollow noopener" data-aff-partner="amazon" data-aff-product="poweraPs5Dock" data-aff-category="Controllers &amp; Charging" data-aff-placement="home-setup-picks-1" data-aff-area="cta" class="aff-cta aff-cta--amazon">View on Amazon &rarr;</a>
                    </div>
                </article>

                <article class="aff-card aff-card--standard aff-card--visual aff-accent-pink" aria-label="KontrolFreek Action Adventure Thumbsticks — Heist Edition">
                    <a href="https://www.amazon.com/dp/B0GNNTYQGH?tag=gta6heistguid-20" data-amazon-link="kontrolfreekHeist" data-aff-asin="B0GNNTYQGH" target="_blank" rel="sponsored nofollow noopener" data-aff-partner="amazon" data-aff-product="kontrolfreekHeist" data-aff-category="Thumbsticks &amp; Grips" data-aff-placement="home-setup-picks-2" data-aff-area="image" class="aff-stage aff-stage--illus" aria-label="View KontrolFreek Heist Edition Thumbsticks on Amazon">
                        <img class="aff-stage-img" src="/assets/gear-illustrations/thumbsticks-heist.svg" alt="Category illustration of pink and blue performance controller thumbstick grips" width="400" height="300" loading="lazy" decoding="async">
                        <span class="aff-stage-badge aff-stage-badge--illus">Category Illustration</span>
                    </a>
                    <div class="aff-card-body">
                        <div class="aff-meta-row">
                            <span class="aff-brand-eyebrow">KontrolFreek</span>
                            <span class="aff-badge-pill">Aim &amp; Grip Extenders</span>
                            <span class="aff-disclosure-tag aff-disclosure-tag--sponsored">Sponsored &middot; Paid link</span>
                        </div>
                        <h3 class="aff-card-title">KontrolFreek Action Adventure Thumbsticks &mdash; Heist Edition</h3>
                        <p class="aff-card-desc">Slip-on performance thumbstick grips in pink and blue designed to add stick height and textured thumb grip for driving and gunplay.</p>
                        <div class="aff-card-compat"><span class="aff-compat-label">Fits:</span> <span class="aff-compat-val">PlayStation 5 &amp; PlayStation 4 Controllers</span></div>
                        <div class="aff-card-why"><span class="aff-why-dot" aria-hidden="true">&#10003;</span> Affordable controller comfort and grip upgrade with Vice-inspired colors.</div>
                    </div>
                    <div class="aff-card-foot">
                        <div class="aff-price-note">Check current price and availability on Amazon.</div>
                        <a href="https://www.amazon.com/dp/B0GNNTYQGH?tag=gta6heistguid-20" data-amazon-link="kontrolfreekHeist" data-aff-asin="B0GNNTYQGH" target="_blank" rel="sponsored nofollow noopener" data-aff-partner="amazon" data-aff-product="kontrolfreekHeist" data-aff-category="Thumbsticks &amp; Grips" data-aff-placement="home-setup-picks-2" data-aff-area="cta" class="aff-cta aff-cta--amazon">View on Amazon &rarr;</a>
                    </div>
                </article>

                <article class="aff-card aff-card--standard aff-card--visual aff-accent-cyan" aria-label="Turtle Beach Recon 70 Wired Multiplatform Gaming Headset">
                    <a href="https://www.amazon.com/dp/B0CWS6WV23?tag=gta6heistguid-20" data-amazon-link="turtleBeachRecon70" data-aff-asin="B0CWS6WV23" target="_blank" rel="sponsored nofollow noopener" data-aff-partner="amazon" data-aff-product="turtleBeachRecon70" data-aff-category="Affordable Headsets" data-aff-placement="home-setup-picks-3" data-aff-area="image" class="aff-stage aff-stage--illus" aria-label="View Turtle Beach Recon 70 Headset on Amazon">
                        <img class="aff-stage-img" src="/assets/gear-illustrations/headset-multiplatform.svg" alt="Category illustration of a wired multiplatform over-ear gaming headset" width="400" height="300" loading="lazy" decoding="async">
                        <span class="aff-stage-badge aff-stage-badge--illus">Category Illustration</span>
                    </a>
                    <div class="aff-card-body">
                        <div class="aff-meta-row">
                            <span class="aff-brand-eyebrow">Turtle Beach</span>
                            <span class="aff-badge-pill">Multiplatform 3.5mm</span>
                            <span class="aff-disclosure-tag aff-disclosure-tag--sponsored">Sponsored &middot; Paid link</span>
                        </div>
                        <h3 class="aff-card-title">Turtle Beach Recon 70 Wired Multiplatform Gaming Headset</h3>
                        <p class="aff-card-desc">Lightweight wired 3.5mm gaming headset with 40mm speakers, cushioned earpads, and a flip-to-mute boom microphone.</p>
                        <div class="aff-card-compat"><span class="aff-compat-label">Fits:</span> <span class="aff-compat-val">PS5, PS4, Xbox Series X|S, Xbox One, PC, Switch &amp; Mobile</span></div>
                        <div class="aff-card-why"><span class="aff-why-dot" aria-hidden="true">&#10003;</span> Plugs straight into PS5 or Xbox controllers with zero battery charging.</div>
                    </div>
                    <div class="aff-card-foot">
                        <div class="aff-price-note">Check current price and availability on Amazon.</div>
                        <a href="https://www.amazon.com/dp/B0CWS6WV23?tag=gta6heistguid-20" data-amazon-link="turtleBeachRecon70" data-aff-asin="B0CWS6WV23" target="_blank" rel="sponsored nofollow noopener" data-aff-partner="amazon" data-aff-product="turtleBeachRecon70" data-aff-category="Affordable Headsets" data-aff-placement="home-setup-picks-3" data-aff-area="cta" class="aff-cta aff-cta--amazon">View on Amazon &rarr;</a>
                    </div>
                </article>

                <article class="aff-card aff-card--standard aff-card--visual aff-accent-cyan" aria-label="New Bee Aluminum Desktop Headphone Stand">
                    <a href="https://www.amazon.com/dp/B01GJQ7N94?tag=gta6heistguid-20" data-amazon-link="headsetStand" data-aff-asin="B01GJQ7N94" target="_blank" rel="sponsored nofollow noopener" data-aff-partner="amazon" data-aff-product="headsetStand" data-aff-category="Gaming Setup Accessories" data-aff-placement="home-setup-picks-4" data-aff-area="image" class="aff-stage aff-stage--illus" aria-label="View New Bee Aluminum Headphone Stand on Amazon">
                        <img class="aff-stage-img" src="/assets/gear-illustrations/headset-stand.svg" alt="Category illustration of an aluminum desktop gaming headphone stand" width="400" height="300" loading="lazy" decoding="async">
                        <span class="aff-stage-badge aff-stage-badge--illus">Category Illustration</span>
                    </a>
                    <div class="aff-card-body">
                        <div class="aff-meta-row">
                            <span class="aff-brand-eyebrow">New Bee</span>
                            <span class="aff-badge-pill">Desk Organizer</span>
                            <span class="aff-disclosure-tag aff-disclosure-tag--sponsored">Sponsored &middot; Paid link</span>
                        </div>
                        <h3 class="aff-card-title">New Bee Aluminum Desktop Headphone Stand</h3>
                        <p class="aff-card-desc">Compact weighted desktop stand with an anodized aluminum pole and flexible TPU headrest that protects headset headbands.</p>
                        <div class="aff-card-compat"><span class="aff-compat-label">Fits:</span> <span class="aff-compat-val">Universal (All Over-Ear Gaming Headsets)</span></div>
                        <div class="aff-card-why"><span class="aff-why-dot" aria-hidden="true">&#10003;</span> Keeps your headset off the desk surface and safe from spills.</div>
                    </div>
                    <div class="aff-card-foot">
                        <div class="aff-price-note">Check current price and availability on Amazon.</div>
                        <a href="https://www.amazon.com/dp/B01GJQ7N94?tag=gta6heistguid-20" data-amazon-link="headsetStand" data-aff-asin="B01GJQ7N94" target="_blank" rel="sponsored nofollow noopener" data-aff-partner="amazon" data-aff-product="headsetStand" data-aff-category="Gaming Setup Accessories" data-aff-placement="home-setup-picks-4" data-aff-area="cta" class="aff-cta aff-cta--amazon">View on Amazon &rarr;</a>
                    </div>
                </article>
            </div>
        </div>
        <p class="aff-disclosure-note" style="margin:0.75rem 0 0; text-align:center;">
            <strong>Affiliate Disclosure:</strong> As an Amazon Associate I earn from qualifying purchases. Tracking ID: <code>gta6heistguid-20</code>. Check current price and availability on Amazon.
        </p>
    </section>'''

idx_path = ROOT / "index.html"
idx_text = idx_path.read_text(encoding="utf-8")
new_idx, n = re.subn(
    r'<!-- 7\. DEDICATED GAMING SETUP PICKS.*?<section id="officialDealsBox".*?</section>',
    HOMEPAGE_SECTION,
    idx_text,
    count=1,
    flags=re.S,
)
assert n == 1, "Failed to match #officialDealsBox in public/index.html"
idx_path.write_text(new_idx, encoding="utf-8")
print("Updated public/index.html (#officialDealsBox -> GEAR FOR YOUR NEXT RUN, 4 cards)")

# 2. Contextual placements on Vehicles, Weapons, Properties
CONTEXTUAL_INSERTS = {
    "vehicles.html": (
        'id="vehiclesGearSlot"',
        '''    <div id="vehiclesGearSlot" style="max-width:1160px; margin:2rem auto 1rem;"
         data-aff-slot="vehicles-driving-essentials"
         data-aff-context="vehicles"
         data-aff-variant="card-grid-2"
         data-aff-count="2"
         data-aff-eyebrow="Optional Console Controller Gear"
         data-aff-heading="Driving Setup Essentials"
         data-aff-subheading="Controller grips and charging docks for long highway chases across Leonida."></div>\n'''
    ),
    "weapons.html": (
        'id="weaponsGearSlot"',
        '''    <div id="weaponsGearSlot" style="max-width:1160px; margin:2rem auto 1rem;"
         data-aff-slot="weapons-audio-controller"
         data-aff-context="weapons"
         data-aff-variant="card-grid-2"
         data-aff-count="2"
         data-aff-eyebrow="Console Audio &amp; Controller Accessories"
         data-aff-heading="Gaming Audio &amp; Controller Setup"
         data-aff-subheading="Optional wired gaming headsets and thumbstick grips for in-game audio cues and aiming comfort (console accessories only)."></div>\n'''
    ),
    "properties.html": (
        'id="propertiesGearSlot"',
        '''    <div id="propertiesGearSlot" style="max-width:1160px; margin:2rem auto 1rem;"
         data-aff-slot="properties-room-setup"
         data-aff-context="properties"
         data-aff-variant="card-grid-2"
         data-aff-count="2"
         data-aff-eyebrow="Optional Setup Upgrades"
         data-aff-heading="Gaming Room &amp; Desk Setup Accessories"
         data-aff-subheading="Clean desk organizers and licensed gaming room lighting for your console station."></div>\n'''
    ),
}

for fname, (marker, snippet) in CONTEXTUAL_INSERTS.items():
    p = ROOT / fname
    txt = p.read_text(encoding="utf-8")
    if marker not in txt:
        txt = txt.replace("</main>", snippet + "</main>", 1)
        p.write_text(txt, encoding="utf-8")
        print(f"Added contextual visual gear slot to public/{fname}")

# 3. Upgrade Heist Command Center optional gear section (outside checklist/walkthroughs)
hcc_path = ROOT / "heist-command-center" / "index.html"
hcc_txt = hcc_path.read_text(encoding="utf-8")
HCC_REPLACEMENT = '''    <!-- CONTEXTUAL AFFILIATE HARDWARE SECTION (VISUALLY SEPARATED FROM CHECKLISTS & CONTROLS) -->
    <section class="hcc-affiliate-section" aria-labelledby="hccGearHeading">
        <div id="hccGearSlot"
             data-aff-slot="heist-command-gear"
             data-aff-context="heist-command"
             data-aff-variant="card-grid-2"
             data-aff-count="2"
             data-aff-eyebrow="Optional Setup Gear · Outside Mission Checklists"
             data-aff-heading="Gear for Long Gaming Sessions"
             data-aff-subheading="Optional controller charging and wired headset picks kept separate from active heist walkthroughs."></div>
    </section>'''

new_hcc, n_hcc = re.subn(
    r'<!-- CONTEXTUAL AFFILIATE HARDWARE SECTION.*?</section>',
    HCC_REPLACEMENT,
    hcc_txt,
    count=1,
    flags=re.S,
)
assert n_hcc == 1, "Failed to match hcc-affiliate-section in heist-command-center/index.html"
if "/js/affiliates.js" not in new_hcc:
    new_hcc = new_hcc.replace("</body>", '<script src="/js/affiliates.js?v=20261125_p33"></script>\n</body>', 1)
hcc_path.write_text(new_hcc, encoding="utf-8")
print("Updated public/heist-command-center/index.html (replaced 4 dead text boxes with 2 verified visual cards)")

# 4. Migrate ALL remaining hardcoded dead / mismatched Amazon ASINs across ALL HTML files
ASIN_REPLACEMENTS = {
    "B0CK39YR41": "B0CGKPPZY9",  # Dead Crucial T500 -> Lexar 1TB NM790 w/ Heatsink (In Stock)
    "B08DP7Z725": "B0GNNTYQGH",  # Dead KontrolFreek -> KontrolFreek Heist Edition PS5/PS4 (In Stock)
    "B08FC6Y4VG": "B09B1XX1PN",  # Unavailable Sony Dock -> PowerA Twin Charging Station PS5 (In Stock)
    "B08FC6C75B": "B09B1XX1PN",  # Dead DualSense -> PowerA Twin Charging Station PS5 (In Stock)
    "B08DF248HZ": "B09FZ4K8FQ",  # Dead Xbox Controller -> PowerA Duo Charging Station Xbox (In Stock)
    "B08J845875": "B09FZ4K8FQ",  # Dead PowerA Xbox -> PowerA Duo Charging Station Xbox (In Stock)
    "B0B1647BD7": "B0BDGMNF6V",  # Dead Nova 7P -> HyperX Cloud Stinger 2 Core PlayStation (In Stock)
    "B0B161B1YQ": "B0CWS6WV23",  # Dead Nova 7X -> Turtle Beach Recon 70 Multiplatform (In Stock)
    "B0BHJJ9Y77": "B0C47ZX1WB",  # Bare non-heatsink 990 PRO -> WD_BLACK SN850P 2TB w/ Heatsink (In Stock)
    "B0BS5V7T65": "B0GNNTYQGH",  # Dead DualSense Edge -> KontrolFreek Heist Edition (In Stock)
    "B0CPKDFF2D": "B01GJQ7N94",  # Dead Elgato 4K X -> New Bee Headphone Stand (In Stock)
    "B0888746SZ": "B0CWS6WV23",  # Dead Elgato Wave:3 -> Turtle Beach Recon 70 (In Stock)
    "B08K3S6WJM": "B09FZ4K8FQ",  # Unavailable Seagate Xbox Card -> PowerA Duo Xbox Dock (In Stock)
    "B09V1KJ3J4": "B01GJQ7N94",  # Out-of-stock Elgato HD60 X -> New Bee Headphone Stand (In Stock)
}

migrated_files = 0
migrated_hits = 0
cache_bumped = 0

for html_file in ROOT.rglob("*.html"):
    txt = html_file.read_text(encoding="utf-8", errors="ignore")
    orig = txt
    for old_asin, new_asin in ASIN_REPLACEMENTS.items():
        if old_asin in txt:
            c = txt.count(old_asin)
            txt = txt.replace(old_asin, new_asin)
            migrated_hits += c

    # Ensure cache-busted style.css and affiliates.js on key updated pages
    txt = re.sub(r'(/assets/style\.css)\?v=[0-9A-Za-z_]+', r'\1?v=20261125_p33', txt)
    txt = re.sub(r'(/js/affiliates\.js)\?v=[0-9A-Za-z_]+', r'\1?v=20261125_p33', txt)
    txt = re.sub(r'(/site-config\.js)\?v=[0-9A-Za-z_]+', r'\1?v=20261125_p33', txt)

    if txt != orig:
        html_file.write_text(txt, encoding="utf-8")
        migrated_files += 1

print(f"Migrated {migrated_hits} dead/mismatched ASIN occurrences and bumped cache-busters across {migrated_files} HTML files.")

# 5. Add /gaming-gear/ to sitemap.xml if present
sm = ROOT / "sitemap.xml"
if sm.exists():
    sm_txt = sm.read_text(encoding="utf-8")
    if "https://www.gta6heistguide.com/gaming-gear/" not in sm_txt:
        entry = "  <url>\n    <loc>https://www.gta6heistguide.com/gaming-gear/</loc>\n    <lastmod>2026-11-25</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n</urlset>"
        sm_txt = sm_txt.replace("</urlset>", entry, 1)
        sm.write_text(sm_txt, encoding="utf-8")
        print("Added https://www.gta6heistguide.com/gaming-gear/ to public/sitemap.xml")
