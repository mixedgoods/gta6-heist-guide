import os
import re

BASE_DIR = r"C:\Users\Shawn\Desktop\gta6heistguide"
PUBLIC_DIR = os.path.join(BASE_DIR, "public")

def upgrade_weapons_gear():
    filepath = os.path.join(PUBLIC_DIR, "weapons-gear.html")
    with open(filepath, "r", encoding="utf-8") as f:
        html = f.read()

    # 1. Update <title>
    html = re.sub(
        r"<title>.*?</title>",
        r"<title>GTA 6 Tactical Gear, Weapons & Heist Loadout Guide (2026) | GTA 6 Heist Guide</title>",
        html,
        count=1
    )

    # 2. Update meta description and keywords
    html = re.sub(
        r'<meta name="description" content=".*?">',
        r'<meta name="description" content="Explore verified GTA 6 tactical gear, heavy body armor unlock codes, 24 Ammu-Nation gun store locations, pro console hardware setups, and heist loadout simulators.">',
        html,
        count=1
    )
    html = re.sub(
        r'<meta name="keywords" content=".*?">',
        r'<meta name="keywords" content="gta 6 tactical gear, gta 6 body armor, best ps5 tactical gear for gta 6, gta 6 weapons, confirmed gta 6 weapons, gta 6 heist gear, ammu-nation vice city, duval signature es9, heist loadout simulator">',
        html,
        count=1
    )

    # 3. Update OpenGraph and Twitter title / description
    html = re.sub(
        r'<meta property="og:title" content=".*?">',
        r'<meta property="og:title" content="GTA 6 Tactical Gear, Weapons & Heist Loadout Guide (2026) | GTA 6 Heist Guide">',
        html,
        count=1
    )
    html = re.sub(
        r'<meta property="og:description" content=".*?">',
        r'<meta property="og:description" content="Explore verified GTA 6 tactical gear, heavy body armor unlock codes, 24 Ammu-Nation gun store locations, pro console hardware setups, and heist loadout simulators.">',
        html,
        count=1
    )
    html = re.sub(
        r'<meta name="twitter:title" content=".*?">',
        r'<meta name="twitter:title" content="GTA 6 Tactical Gear, Weapons & Heist Loadout Guide (2026) | GTA 6 Heist Guide">',
        html,
        count=1
    )
    html = re.sub(
        r'<meta name="twitter:description" content=".*?">',
        r'<meta name="twitter:description" content="Explore verified GTA 6 tactical gear, heavy body armor unlock codes, 24 Ammu-Nation gun store locations, pro console hardware setups, and heist loadout simulators.">',
        html,
        count=1
    )

    # 4. Update JSON-LD schema with FAQPage + Product schemas
    new_schema = """    <script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "name": "GTA 6 Tactical Gear & Specialized Infiltration Loadouts",
      "url": "https://www.gta6heistguide.com/weapons-gear.html",
      "description": "Exhaustive database of confirmed GTA 6 weapons, tactical gear, body armor cheat unlocks, 24 Ammu-Nation stores, and pro console hardware setups.",
      "publisher": {
        "@type": "Organization",
        "name": "gta6heistguide.com"
      },
      "applicationCategory": "GameApplication",
      "operatingSystem": "All",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      }
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is the best tactical gear for GTA 6 heists?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "The best tactical gear for GTA 6 heists includes the Heavy Assault EOD Plate Carrier (absorbs up to 25 rifle rounds and reduces explosive blast damage by 60%), High-Cut Ballistic Helmet with Quad-NVGs for night sentry visibility, Carbon Knuckle Operator Assault Gloves for zero forensic fingerprint evidence, and Tactical FLIR Thermal Recon Goggles to highlight guard heat signatures through smoke and thin walls."
          }
        },
        {
          "@type": "Question",
          "name": "How do you unlock and get GTA 6 body armor?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "You can obtain Heavy Body Armor legitimately in GTA 6 by completing 100 gym workouts or purchasing it at Ammu-Nation stores (such as Black Eagle in Vice-Dale County). Alternatively, unlock instant full body armor via the D-Pad cheat: open your phone (Up D-Pad), hold L1/LB + press R1/RB, and enter: Down, Up, Left, Up, Up, Up, Up, Up, Down, Down."
          }
        },
        {
          "@type": "Question",
          "name": "What is the best PS5 tactical gear and hardware setup for GTA 6?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "For competitive 30 FPS GTA 6 console play, the top recommended pro gear includes KontrolFreek Performance Thumbsticks for micro-aim precision, the PlayStation DualSense Edge Pro Controller for hair-trigger stops and back paddles, PlayStation PULSE Elite Wireless Headset with planar magnetic drivers for squad comms and footsteps, a Samsung 990 PRO 2TB Heatsink SSD to eliminate open-world streaming stutter, and ExitLag for low-ping traffic routing."
          }
        },
        {
          "@type": "Question",
          "name": "Where are the best Ammu-Nation and tactical gun stores in Vice City?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "The premier tactical firearm dealers in GTA 6 include Black Eagle (Vice-Dale County — Expanded Stock), Vice City Firearms (Downtown Vice City), Martez Empenos (Little Haiti pawn & guns), Jackson Firearms (Port Gellhorn), Vice City Gun & Pawn, Pawn & Gun Crosstown, and Quickscope."
          }
        }
      ]
    },
    {
      "@type": "Product",
      "name": "KontrolFreek Performance Thumbsticks for PS5",
      "description": "High-rise tactical analog stick extensions designed for precision aim sensitivity and faster target acquisition in GTA 6 heists.",
      "brand": {
        "@type": "Brand",
        "name": "KontrolFreek"
      },
      "offers": {
        "@type": "Offer",
        "url": "https://www.amazon.com/s?k=KontrolFreek+Performance+Thumbsticks+PS5&tag=gta6heistguid-20",
        "priceCurrency": "USD",
        "price": "16.99",
        "availability": "https://schema.org/InStock"
      }
    },
    {
      "@type": "Product",
      "name": "PlayStation DualSense Edge Wireless Controller",
      "description": "Pro-tier customizable PS5 controller with remappable back paddles and adjustable trigger stops for GTA 6 shootouts.",
      "brand": {
        "@type": "Brand",
        "name": "PlayStation"
      },
      "offers": {
        "@type": "Offer",
        "url": "https://www.amazon.com/dp/B0BS5V7T65?tag=gta6heistguid-20",
        "priceCurrency": "USD",
        "price": "199.99",
        "availability": "https://schema.org/InStock"
      }
    },
    {
      "@type": "Product",
      "name": "Samsung 990 PRO 2TB NVMe SSD with Heatsink",
      "description": "Blistering 7,450 MB/s read speed PCIe 4.0 M.2 SSD engineered for 212GB GTA 6 install and seamless Vice City open-world streaming.",
      "brand": {
        "@type": "Brand",
        "name": "Samsung"
      },
      "offers": {
        "@type": "Offer",
        "url": "https://www.amazon.com/dp/B0BHJJ9Y77?tag=gta6heistguid-20",
        "priceCurrency": "USD",
        "price": "169.99",
        "availability": "https://schema.org/InStock"
      }
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://www.gta6heistguide.com/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "GTA 6 Tactical Gear",
          "item": "https://www.gta6heistguide.com/weapons-gear.html"
        }
      ]
    }
  ]
}
    </script>"""

    html = re.sub(
        r'<script type="application/ld\+json">.*?</script>',
        new_schema,
        html,
        flags=re.DOTALL,
        count=1
    )

    # 5. Update <h1> tag
    html = re.sub(
        r'<h1 style="[^"]*">\s*CONFIRMED GTA 6 <span style="[^"]*">WEAPONS, GEAR &amp; HEIST ITEMS</span>\s*</h1>',
        r'<h1 style="color:#fff; font-size:1.35rem; font-weight:1000; margin:0; line-height:1.2;">GTA 6 <span style="color:var(--neon-yellow);">Tactical Gear &amp; Specialized Infiltration Loadouts</span></h1>',
        html,
        count=1
    )

    # 6. Replace old deal showcase with:
    # A) Day-2 Verified GTA 6 Tactical Gear & Gun Stores
    # B) Pro Console Tactical Gear — Upgrade Your Real-World GTA 6 Setup
    # C) 15-Second Vault Keypad & Laser Hack Trainer
    
    new_sections = """    <!-- ========================================================================= -->
    <!-- SECTION: DAY-2 VERIFIED GTA 6 TACTICAL GEAR & GUN STORES -->
    <!-- ========================================================================= -->
    <section id="day2TacticalStores" style="margin-top:3rem; background:rgba(12,18,28,0.95); border:2px solid var(--neon-cyan); border-radius:12px; padding:1.5rem; box-shadow:0 0 30px rgba(0,240,255,0.15);">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem; margin-bottom:1.25rem; border-bottom:1px solid rgba(0,240,255,0.25); padding-bottom:0.75rem;">
            <div>
                <div style="display:flex; gap:0.5rem; align-items:center; flex-wrap:wrap; margin-bottom:0.25rem;">
                    <span class="user-badge" style="background:var(--neon-cyan); color:#000; font-weight:900; font-size:0.72rem;">🔥 DAY-2 VERIFIED</span>
                    <span style="color:var(--neon-pink); font-size:0.78rem; font-weight:800; font-family:var(--font-mono);">IN-GAME ARSENAL &amp; UNLOCKS</span>
                </div>
                <h2 style="color:#fff; font-size:1.45rem; margin:0 0 0.25rem; font-weight:900;">Day-2 Verified GTA 6 Tactical Gear &amp; Gun Stores</h2>
                <p style="color:var(--text-muted); font-size:0.85rem; margin:0;">Essential in-game ballistic protection, cheat unlock sequences, 7 verified Leonida armories, and Jason's Duval signature sidearm.</p>
            </div>
            <a href="/weapons-bonuses.html" class="btn btn-secondary" style="font-size:0.78rem; padding:0.4rem 0.9rem; border-color:var(--neon-yellow); color:var(--neon-yellow);">🔫 All 24 Ammu-Nation Locations &rarr;</a>
        </div>

        <!-- 3 Feature Columns: Body Armor Unlock | Ammu-Nation Stores | Duval Signature ES9 -->
        <div class="grid" style="grid-template-columns:repeat(auto-fit, minmax(min(100%, 340px), 1fr)); gap:1.25rem;">
            
            <!-- Box 1: Body Armor Cheat & Unlock -->
            <div style="background:rgba(18,26,40,0.9); border:1px solid rgba(0,255,136,0.35); border-radius:10px; padding:1.25rem; display:flex; flex-direction:column; justify-content:space-between; position:relative; overflow:hidden;">
                <div style="position:absolute; top:0; left:0; width:4px; height:100%; background:var(--neon-green);"></div>
                <div>
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
                        <span class="user-badge" style="background:rgba(0,255,136,0.18); border-color:var(--neon-green); color:var(--neon-green); font-size:0.7rem; font-weight:800;">ARMOR UNLOCK SYSTEM</span>
                        <span style="font-family:var(--font-mono); font-size:0.74rem; color:var(--neon-green); font-weight:800;">MAX PROTECTION</span>
                    </div>
                    <h3 style="color:#fff; font-size:1.15rem; margin:0 0 0.4rem; font-weight:900;">🛡️ Full Body Armor Cheat &amp; Legit Unlock</h3>
                    <p style="color:var(--text-muted); font-size:0.82rem; line-height:1.45; margin:0 0 0.85rem;">
                        Equipping Level 3 heavy composite kevlar absorbs up to 25 assault rifle rounds and provides 60% blast reduction during bank vault fire fights.
                    </p>
                    
                    <div style="background:rgba(0,0,0,0.55); border:1px solid rgba(255,255,255,0.08); border-radius:6px; padding:0.65rem 0.85rem; margin-bottom:0.85rem;">
                        <div style="font-size:0.75rem; color:var(--neon-cyan); font-weight:800; font-family:var(--font-mono); margin-bottom:0.3rem;">LEGIT IN-GAME UNLOCK:</div>
                        <div style="font-size:0.82rem; color:#fff;">Complete <strong>100 workouts</strong> across Vice City gyms to max Lucia &amp; Jason's conditioning bar and unlock heavy carrier purchase rights.</div>
                    </div>

                    <div style="background:rgba(0,0,0,0.55); border:1px solid rgba(0,240,255,0.25); border-radius:6px; padding:0.65rem 0.85rem; margin-bottom:0.85rem;">
                        <div style="font-size:0.75rem; color:var(--neon-yellow); font-weight:800; font-family:var(--font-mono); margin-bottom:0.35rem;">⚡ PHONE D-PAD CHEAT SEQUENCE:</div>
                        <div style="font-size:0.76rem; color:#94a3b8; margin-bottom:0.4rem;">Open Phone (<strong>Up</strong> D-Pad) &gt; Hold <strong>L1/LB</strong> + Press <strong>R1/RB</strong> &gt; Enter:</div>
                        <div style="display:flex; gap:0.25rem; flex-wrap:wrap; align-items:center;">
                            <span class="cheat-key" style="background:#111; color:var(--neon-yellow); border:1px solid var(--neon-yellow); padding:0.2rem 0.45rem; border-radius:4px; font-weight:900; font-family:var(--font-mono);">↓</span>
                            <span class="cheat-key" style="background:#111; color:var(--neon-yellow); border:1px solid var(--neon-yellow); padding:0.2rem 0.45rem; border-radius:4px; font-weight:900; font-family:var(--font-mono);">↑</span>
                            <span class="cheat-key" style="background:#111; color:var(--neon-yellow); border:1px solid var(--neon-yellow); padding:0.2rem 0.45rem; border-radius:4px; font-weight:900; font-family:var(--font-mono);">←</span>
                            <span class="cheat-key" style="background:#111; color:var(--neon-yellow); border:1px solid var(--neon-yellow); padding:0.2rem 0.45rem; border-radius:4px; font-weight:900; font-family:var(--font-mono);">↑</span>
                            <span class="cheat-key" style="background:#111; color:var(--neon-yellow); border:1px solid var(--neon-yellow); padding:0.2rem 0.45rem; border-radius:4px; font-weight:900; font-family:var(--font-mono);">↑</span>
                            <span class="cheat-key" style="background:#111; color:var(--neon-yellow); border:1px solid var(--neon-yellow); padding:0.2rem 0.45rem; border-radius:4px; font-weight:900; font-family:var(--font-mono);">↑</span>
                            <span class="cheat-key" style="background:#111; color:var(--neon-yellow); border:1px solid var(--neon-yellow); padding:0.2rem 0.45rem; border-radius:4px; font-weight:900; font-family:var(--font-mono);">↑</span>
                            <span class="cheat-key" style="background:#111; color:var(--neon-yellow); border:1px solid var(--neon-yellow); padding:0.2rem 0.45rem; border-radius:4px; font-weight:900; font-family:var(--font-mono);">↑</span>
                            <span class="cheat-key" style="background:#111; color:var(--neon-yellow); border:1px solid var(--neon-yellow); padding:0.2rem 0.45rem; border-radius:4px; font-weight:900; font-family:var(--font-mono);">↓</span>
                            <span class="cheat-key" style="background:#111; color:var(--neon-yellow); border:1px solid var(--neon-yellow); padding:0.2rem 0.45rem; border-radius:4px; font-weight:900; font-family:var(--font-mono);">↓</span>
                        </div>
                    </div>
                </div>
                <div style="display:flex; gap:0.5rem; margin-top:0.5rem;">
                    <button type="button" class="btn btn-secondary" onclick="navigator.clipboard.writeText('↓ ↑ ← ↑ ↑ ↑ ↑ ↑ ↓ ↓'); if(window.GTA6&&GTA6.showToast) GTA6.showToast('Copied Body Armor Cheat Sequence!'); if(window.GTA6&&GTA6.playBeep) GTA6.playBeep(640,'triangle',0.06);" style="flex:1; font-size:0.75rem; padding:0.45rem;">📋 Copy Cheat Sequence</button>
                    <a href="/cheats.html" class="btn btn-primary" style="flex:1; text-align:center; font-size:0.75rem; padding:0.45rem;">⚡ 61 Cheats Hub &rarr;</a>
                </div>
            </div>

            <!-- Box 2: 7 Verified Ammu-Nation & Gun Stores -->
            <div style="background:rgba(18,26,40,0.9); border:1px solid rgba(244,63,94,0.35); border-radius:10px; padding:1.25rem; display:flex; flex-direction:column; justify-content:space-between; position:relative; overflow:hidden;">
                <div style="position:absolute; top:0; left:0; width:4px; height:100%; background:#f43f5e;"></div>
                <div>
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
                        <span class="user-badge" style="background:rgba(244,63,94,0.18); border-color:#f43f5e; color:#f43f5e; font-size:0.7rem; font-weight:800;">ARMORY LOCATIONS</span>
                        <span style="font-family:var(--font-mono); font-size:0.74rem; color:#f43f5e; font-weight:800;">7 KEY STORES</span>
                    </div>
                    <h3 style="color:#fff; font-size:1.15rem; margin:0 0 0.4rem; font-weight:900;">🏪 Ammu-Nation &amp; Tactical Gun Stores</h3>
                    <p style="color:var(--text-muted); font-size:0.82rem; line-height:1.45; margin:0 0 0.75rem;">
                        Verified firearm dealers and black-market pawn shops stocking specialized suppressors, armor plates, and heavy ordnance:
                    </p>
                    
                    <div style="display:grid; gap:0.4rem; font-size:0.78rem; font-family:var(--font-mono); margin-bottom:0.75rem;">
                        <div style="display:flex; justify-content:space-between; background:rgba(0,0,0,0.45); padding:0.35rem 0.55rem; border-radius:4px; border:1px solid rgba(255,255,255,0.06);">
                            <span style="color:#fff; font-weight:700;">🦅 Black Eagle</span>
                            <span style="color:var(--neon-green);">Vice-Dale Co. (Tier 4 Expanded)</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; background:rgba(0,0,0,0.45); padding:0.35rem 0.55rem; border-radius:4px; border:1px solid rgba(255,255,255,0.06);">
                            <span style="color:#fff; font-weight:700;">🏙️ Vice City Firearms</span>
                            <span style="color:var(--neon-cyan);">Downtown (Rifles &amp; Carbines)</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; background:rgba(0,0,0,0.45); padding:0.35rem 0.55rem; border-radius:4px; border:1px solid rgba(255,255,255,0.06);">
                            <span style="color:#fff; font-weight:700;">🪙 Martez Empenos</span>
                            <span style="color:var(--neon-yellow);">Little Haiti (Pawn Sidearms)</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; background:rgba(0,0,0,0.45); padding:0.35rem 0.55rem; border-radius:4px; border:1px solid rgba(255,255,255,0.06);">
                            <span style="color:#fff; font-weight:700;">⚓ Jackson Firearms</span>
                            <span style="color:#c084fc;">Port Gellhorn (Industrial Shotguns)</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; background:rgba(0,0,0,0.45); padding:0.35rem 0.55rem; border-radius:4px; border:1px solid rgba(255,255,255,0.06);">
                            <span style="color:#fff; font-weight:700;">🔫 Vice City Gun &amp; Pawn</span>
                            <span style="color:#94a3b8;">Crosstown Strip (Used Vests)</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; background:rgba(0,0,0,0.45); padding:0.35rem 0.55rem; border-radius:4px; border:1px solid rgba(255,255,255,0.06);">
                            <span style="color:#fff; font-weight:700;">📦 Pawn &amp; Gun &ndash; Crosstown</span>
                            <span style="color:#94a3b8;">Leonida Metro (Surplus SMGs)</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; background:rgba(0,0,0,0.45); padding:0.35rem 0.55rem; border-radius:4px; border:1px solid rgba(255,255,255,0.06);">
                            <span style="color:#fff; font-weight:700;">🎯 Quickscope</span>
                            <span style="color:var(--neon-pink);">Bayshore (Sniper Optics &amp; Cans)</span>
                        </div>
                    </div>
                </div>
                <div style="margin-top:0.5rem;">
                    <a href="/weapons-bonuses.html" class="btn btn-secondary" style="display:block; text-align:center; font-size:0.75rem; padding:0.45rem; border-color:#f43f5e; color:#f43f5e;">🔍 Search All 24 Stores &amp; Prices &rarr;</a>
                </div>
            </div>

            <!-- Box 3: Ultimate Edition Weapon Bonus -->
            <div style="background:rgba(18,26,40,0.9); border:1px solid rgba(255,184,0,0.35); border-radius:10px; padding:1.25rem; display:flex; flex-direction:column; justify-content:space-between; position:relative; overflow:hidden;">
                <div style="position:absolute; top:0; left:0; width:4px; height:100%; background:var(--neon-yellow);"></div>
                <div>
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
                        <span class="user-badge" style="background:rgba(255,184,0,0.18); border-color:var(--neon-yellow); color:var(--neon-yellow); font-size:0.7rem; font-weight:800;">ULTIMATE BONUS</span>
                        <span style="font-family:var(--font-mono); font-size:0.74rem; color:var(--neon-yellow); font-weight:800;">EXCLUSIVE VARIANT</span>
                    </div>
                    <h3 style="color:#fff; font-size:1.15rem; margin:0 0 0.4rem; font-weight:900;">🎁 Jason's Duval Signature ES9 &amp; Inks</h3>
                    <div style="height:110px; background:radial-gradient(circle at center, rgba(255,184,0,0.12) 0%, rgba(5,8,14,0.9) 75%); border-radius:6px; display:flex; align-items:center; justify-content:center; margin-bottom:0.75rem; overflow:hidden; border:1px solid rgba(255,255,255,0.06);">
                        <img src="/assets/weapon-es9.webp" alt="Jason Duval Signature ES9 Pistol Variant" style="max-height:90%; max-width:90%; object-fit:contain;" loading="lazy">
                    </div>
                    <p style="color:var(--text-muted); font-size:0.82rem; line-height:1.45; margin:0 0 0.75rem;">
                        The Duval Signature ES9 features custom nickel slide engraving, pre-threaded suppressor barrel, elevated night sights, and improved hip-fire recovery.
                    </p>
                    <div style="background:rgba(0,0,0,0.55); border:1px solid rgba(255,255,255,0.08); border-radius:6px; padding:0.65rem 0.85rem; font-size:0.78rem; margin-bottom:0.75rem;">
                        <strong style="color:var(--neon-cyan);">HOW TO CLAIM:</strong> Visit any Ammu-Nation store clerk or access your safehouse armory locker after completing the Chapter 1 prologue. Pairs with Jason's Duval Family chest/sleeve ink at Martez Body Art in Little Haiti.
                    </div>
                </div>
                <div style="display:flex; gap:0.5rem; margin-top:0.5rem;">
                    <a href="/weapons-bonuses.html#ultimate-edition" class="btn btn-primary" style="flex:1; text-align:center; font-size:0.75rem; padding:0.45rem;">📖 Claim Tutorial &rarr;</a>
                    <a href="https://www.amazon.com/s?k=GTA+6+Ultimate+Edition&tag=gta6heistguid-20" target="_blank" rel="sponsored noopener noreferrer" class="btn btn-secondary" style="flex:1; text-align:center; font-size:0.75rem; padding:0.45rem; border-color:var(--neon-yellow); color:var(--neon-yellow);">📦 Buy Key [Amazon] &rarr;</a>
                </div>
            </div>

        </div>
    </section>

    <!-- ========================================================================= -->
    <!-- SECTION: PRO CONSOLE TACTICAL GEAR — REAL-WORLD SETUP UPGRADE -->
    <!-- ========================================================================= -->
    <section id="proConsoleGear" style="margin-top:3rem; background:rgba(10,16,26,0.96); border:2px solid var(--neon-pink); border-radius:12px; padding:1.5rem; box-shadow:0 0 30px rgba(255,42,141,0.18);">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem; margin-bottom:1.25rem; border-bottom:1px solid rgba(255,42,141,0.25); padding-bottom:0.75rem;">
            <div>
                <div style="display:flex; gap:0.5rem; align-items:center; flex-wrap:wrap; margin-bottom:0.25rem;">
                    <span class="user-badge" style="background:var(--neon-pink); color:#fff; font-weight:900; font-size:0.72rem;">🔥 COMPETITIVE EDGE</span>
                    <span style="color:var(--neon-yellow); font-size:0.78rem; font-weight:800; font-family:var(--font-mono);">REAL-WORLD PS5 &amp; XBOX HARDWARE</span>
                </div>
                <h2 style="color:#fff; font-size:1.45rem; margin:0 0 0.25rem; font-weight:900;">Pro Console Tactical Gear — Upgrade Your Real-World GTA 6 Setup</h2>
                <p style="color:var(--text-muted); font-size:0.85rem; margin:0;">Maximize frame pacing, eliminate stick deadzones, secure squad comms, and expand high-speed storage for GTA 6's 212GB footprint.</p>
            </div>
            <span style="font-size:0.76rem; color:var(--neon-green); font-weight:800; font-family:var(--font-mono);">✓ Official Amazon Prime Lowest Price &bull; Verified ExitLag &amp; Key Partners</span>
        </div>

        <div class="grid" style="grid-template-columns:repeat(auto-fit, minmax(min(100%, 260px), 1fr)); gap:1.25rem;">
            
            <!-- Card 1: KontrolFreek Thumbsticks -->
            <div class="deal-card-premium">
                <div>
                    <div class="deal-img-stage">
                        <img src="/assets/kontrolfreek-thumbsticks.jpg" alt="KontrolFreek Performance Thumbsticks for PS5 &amp; Xbox" loading="lazy" width="800" height="600">
                        <span class="deal-badge-verified">✓ BESTSELLER</span>
                        <span class="deal-badge-merchant">AMAZON PRIME</span>
                    </div>
                    <div class="deal-body-premium">
                        <h4 class="deal-title-premium">KontrolFreek Heist Edition Sticks</h4>
                        <div class="deal-rating-row">
                            <span class="deal-stars">★★★★★</span>
                            <span style="color:#fff; font-weight:800;">4.9</span>
                            <span>(34,000+ ratings)</span>
                        </div>
                        <p class="deal-desc-premium">Adds +10.2mm high-rise arc distance for sub-millimeter headshot tracking at 30 FPS console lock, plus mid-rise left grip for sprint agility.</p>
                        <div class="deal-price-bar">
                            <div>
                                <span style="font-size:0.72rem; color:#94a3b8; display:block;">Impulse Pick</span>
                                <span class="deal-price-current" style="color:var(--neon-green);">$16.99</span>
                            </div>
                            <span class="deal-pill-discount">TOP PICK</span>
                        </div>
                    </div>
                </div>
                <div style="padding:0 1.15rem 1.15rem;">
                    <a href="https://www.amazon.com/s?k=KontrolFreek+Performance+Thumbsticks+PS5&tag=gta6heistguid-20" target="_blank" rel="sponsored noopener noreferrer" class="btn-deal-amazon">📦 Grab on Amazon ($16.99) &rarr;</a>
                </div>
            </div>

            <!-- Card 2: DualSense Edge Pro Controller -->
            <div class="deal-card-premium">
                <div>
                    <div class="deal-img-stage">
                        <img src="/assets/dualsense-edge-controller.jpg?v=20261118_clean_v1" alt="PlayStation DualSense Edge Pro Wireless Controller" loading="lazy" width="1500" height="1000">
                        <span class="deal-badge-verified">✓ SONY OFFICIAL</span>
                        <span class="deal-badge-merchant">FREE 1-DAY</span>
                    </div>
                    <div class="deal-body-premium">
                        <h4 class="deal-title-premium">DualSense Edge Pro Controller</h4>
                        <div class="deal-rating-row">
                            <span class="deal-stars">★★★★★</span>
                            <span style="color:#fff; font-weight:800;">4.8</span>
                            <span>(6,200+ ratings)</span>
                        </div>
                        <p class="deal-desc-premium">Remappable rear paddles for jump/crouch sliding without thumb fatigue, adjustable trigger stops for hair-trigger shootouts, and swappable modules.</p>
                        <div class="deal-price-bar">
                            <div>
                                <span style="font-size:0.72rem; color:#94a3b8; display:block;">Official Retail</span>
                                <span class="deal-price-current" style="color:var(--neon-cyan);">$199.99</span>
                            </div>
                            <span class="deal-pill-discount">PRO GEAR</span>
                        </div>
                    </div>
                </div>
                <div style="padding:0 1.15rem 1.15rem;">
                    <a href="https://www.amazon.com/dp/B0BS5V7T65?tag=gta6heistguid-20" target="_blank" rel="sponsored noopener noreferrer" class="btn-deal-amazon">🎮 Check Edge on Amazon &rarr;</a>
                </div>
            </div>

            <!-- Card 3: PlayStation PULSE Elite Wireless Headset -->
            <div class="deal-card-premium">
                <div>
                    <div class="deal-img-stage">
                        <img src="/assets/pulse-elite-headset.jpg" alt="PlayStation PULSE Elite Wireless Headset" loading="lazy" width="800" height="600">
                        <span class="deal-badge-verified">✓ PLANAR DRIVERS</span>
                        <span class="deal-badge-merchant">PLAYSTATION</span>
                    </div>
                    <div class="deal-body-premium">
                        <h4 class="deal-title-premium">PlayStation PULSE Elite Headset</h4>
                        <div class="deal-rating-row">
                            <span class="deal-stars">★★★★★</span>
                            <span style="color:#fff; font-weight:800;">4.8</span>
                            <span>(9,800+ ratings)</span>
                        </div>
                        <p class="deal-desc-premium">Planar magnetic drivers recreate realistic directional footsteps, vault alarm reverberation, and AI noise-rejecting retractable co-op comms.</p>
                        <div class="deal-price-bar">
                            <div>
                                <span style="font-size:0.72rem; color:#94a3b8; display:block;">Audiophile 3D</span>
                                <span class="deal-price-current" style="color:var(--neon-yellow);">$149.99</span>
                            </div>
                            <span class="deal-pill-discount">3D AUDIO</span>
                        </div>
                    </div>
                </div>
                <div style="padding:0 1.15rem 1.15rem;">
                    <a href="https://www.amazon.com/s?k=PlayStation+PULSE+Elite+Wireless+Headset&tag=gta6heistguid-20" target="_blank" rel="sponsored noopener noreferrer" class="btn-deal-amazon">🎧 View PULSE on Amazon &rarr;</a>
                </div>
            </div>

            <!-- Card 4: Samsung 990 PRO 2TB Heatsink SSD -->
            <div class="deal-card-premium">
                <div>
                    <div class="deal-img-stage">
                        <img src="/assets/samsung-990-pro.jpg?v=20261118_clean_v1" alt="Samsung 990 PRO 2TB NVMe SSD with Heatsink" loading="lazy" width="1500" height="459">
                        <span class="deal-badge-verified">✓ 212GB READY</span>
                        <span class="deal-badge-merchant">7,450 MB/s</span>
                    </div>
                    <div class="deal-body-premium">
                        <h4 class="deal-title-premium">Samsung 990 PRO 2TB Heatsink</h4>
                        <div class="deal-rating-row">
                            <span class="deal-stars">★★★★★</span>
                            <span style="color:#fff; font-weight:800;">4.9</span>
                            <span>(21,000+ ratings)</span>
                        </div>
                        <p class="deal-desc-premium">Blistering 7,450 MB/s read speed with integrated aluminum heatsink eliminates 160 MPH highway texture pop-in for GTA 6's 200GB+ install.</p>
                        <div class="deal-price-bar">
                            <div>
                                <span style="font-size:0.72rem; color:#94a3b8; display:block;">Sale Deal</span>
                                <span class="deal-price-current" style="color:var(--neon-green);">$169.99</span>
                            </div>
                            <span class="deal-pill-discount">SAVE $50</span>
                        </div>
                    </div>
                </div>
                <div style="padding:0 1.15rem 1.15rem;">
                    <a href="https://www.amazon.com/dp/B0BHJJ9Y77?tag=gta6heistguid-20" target="_blank" rel="sponsored noopener noreferrer" class="btn-deal-amazon">⚡ Upgrade Storage on Amazon &rarr;</a>
                </div>
            </div>

            <!-- Card 5: DualSense Twin Charging Station -->
            <div class="deal-card-premium">
                <div>
                    <div class="deal-img-stage">
                        <img src="/assets/dualsense-charging-station.jpg" alt="PlayStation DualSense Charging Station Dock" loading="lazy" width="800" height="600">
                        <span class="deal-badge-verified">✓ SONY OFFICIAL</span>
                        <span class="deal-badge-merchant">CLICK-IN DOCK</span>
                    </div>
                    <div class="deal-body-premium">
                        <h4 class="deal-title-premium">DualSense Twin Charging Dock</h4>
                        <div class="deal-rating-row">
                            <span class="deal-stars">★★★★★</span>
                            <span style="color:#fff; font-weight:800;">4.9</span>
                            <span>(68,000+ ratings)</span>
                        </div>
                        <p class="deal-desc-premium">Frees up PS5 front USB ports, keeping both duo controllers ready for 8+ hour marathon co-op sessions with click-in ease.</p>
                        <div class="deal-price-bar">
                            <div>
                                <span style="font-size:0.72rem; color:#94a3b8; display:block;">Official Dock</span>
                                <span class="deal-price-current" style="color:var(--neon-cyan);">$29.99</span>
                            </div>
                            <span class="deal-pill-discount">MUST HAVE</span>
                        </div>
                    </div>
                </div>
                <div style="padding:0 1.15rem 1.15rem;">
                    <a href="https://www.amazon.com/s?k=DualSense+Charging+Station+PS5&tag=gta6heistguid-20" target="_blank" rel="sponsored noopener noreferrer" class="btn-deal-amazon">🔋 Grab Dock on Amazon ($29.99) &rarr;</a>
                </div>
            </div>

            <!-- Card 6: ExitLag Low-Ping Gaming Tunnel -->
            <div class="deal-card-premium">
                <div>
                    <div class="deal-img-stage" style="background:radial-gradient(circle at center, rgba(168,85,247,0.2) 0%, rgba(6,10,20,0.98) 78%); display:flex; flex-direction:column; align-items:center; justify-content:center; padding:1rem;">
                        <span style="font-size:2.8rem;">🛡️</span>
                        <span style="font-family:var(--font-mono); font-size:1.1rem; color:#c084fc; font-weight:900; margin-top:0.4rem;">EXITLAG SHIELD</span>
                        <span class="deal-badge-verified">✓ MULTIPATH</span>
                        <span class="deal-badge-merchant" style="color:#c084fc; border-color:#c084fc;">Free Trial Active</span>
                    </div>
                    <div class="deal-body-premium">
                        <h4 class="deal-title-premium">ExitLag Low-Ping Gaming Tunnel</h4>
                        <div class="deal-rating-row">
                            <span class="deal-stars">★★★★★</span>
                            <span style="color:#fff; font-weight:800;">4.9</span>
                            <span>(Verified Co-Op Anti-Lag)</span>
                        </div>
                        <p class="deal-desc-premium">Multi-path packet routing stabilizes 4-player co-op heists, prevents public lobby DDoS host drops, and drops jitter to near-zero.</p>
                        <div class="deal-price-bar">
                            <div>
                                <span style="font-size:0.72rem; color:#94a3b8; display:block;">Special Partner Promo</span>
                                <span class="deal-price-current" style="color:#c084fc;">3-Day Free + 15% Off</span>
                            </div>
                            <span class="deal-pill-discount" style="background:#a855f7; color:#fff;">Free Trial</span>
                        </div>
                    </div>
                </div>
                <div style="padding:0 1.15rem 1.15rem; display:grid; gap:0.4rem;">
                    <a href="https://www.exitlag.com/refer/10386953" target="_blank" rel="sponsored noopener noreferrer" class="btn-deal-g2a" style="background:linear-gradient(135deg, #a855f7, #7c3aed); border-color:#c084fc;">🚀 Activate ExitLag (Free Trial) &rarr;</a>
                    <button type="button" class="btn btn-secondary" onclick="navigator.clipboard.writeText('10386953'); if(window.GTA6&&GTA6.showToast) GTA6.showToast('Copied ExitLag Discount Free Trial Active!'); if(window.GTA6&&GTA6.playBeep) GTA6.playBeep(700,'triangle',0.06);" style="font-size:0.74rem; padding:0.35rem; color:#c084fc; border-color:#c084fc;">📋 Copy Promo Free Trial Active</button>
                </div>
            </div>

            <!-- Card 7: G2A & Eneba Keys + CutFlow Pro -->
            <div class="deal-card-premium">
                <div>
                    <div class="deal-img-stage">
                        <img src="/assets/eneba-gift-cards.jpg?v=20261118_clean_v1" alt="PlayStation &amp; Xbox Digital Store Gift Cards" loading="lazy" width="800" height="600">
                        <span class="deal-badge-verified">✓ INSTANT CODE</span>
                        <span class="deal-badge-merchant">G2A &bull; ENEBA &bull; WHOP</span>
                    </div>
                    <div class="deal-body-premium">
                        <h4 class="deal-title-premium">Keys &amp; ClipBounty Studio</h4>
                        <div class="deal-rating-row">
                            <span class="deal-stars">★★★★★</span>
                            <span style="color:#fff; font-weight:800;">4.9</span>
                            <span>(Creator &amp; Key Suite)</span>
                        </div>
                        <p class="deal-desc-premium">Discounted PSN &amp; Xbox gift cards (-20%), plus <strong>CutFlow Pro / ClipBounty Studio ($49)</strong> to turn 4K heist gameplay into viral TikTok/Shorts clips in 60s.</p>
                        <div class="deal-price-bar">
                            <div>
                                <span style="font-size:0.72rem; color:#94a3b8; display:block;">Digital Suite</span>
                                <span class="deal-price-current" style="color:var(--neon-yellow);">Save 20% &bull; $49 Suite</span>
                            </div>
                            <span class="deal-pill-discount">DIGITAL</span>
                        </div>
                    </div>
                </div>
                <div style="padding:0 1.15rem 1.15rem; display:grid; gap:0.4rem;">
                    <div style="display:flex; gap:0.35rem;">
                        <a href="https://www.g2a.com/n/reflink-4094b9aab5" target="_blank" rel="sponsored noopener noreferrer" class="btn-deal-g2a" style="flex:1; padding:0.45rem; font-size:0.75rem;">⚡ G2A Keys</a>
                        <a href="https://www.eneba.com/store/all?q=gta&af_id=gta6heistguide" target="_blank" rel="sponsored noopener noreferrer" class="btn-deal-g2a" style="flex:1; padding:0.45rem; font-size:0.75rem; background:linear-gradient(135deg, #10b981, #059669); border-color:var(--neon-green);">💳 Eneba</a>
                    </div>
                    <a href="https://apexlocallabs.gumroad.com/l/apex-pro-bundle" target="_blank" rel="sponsored noopener noreferrer" class="btn btn-secondary" style="font-size:0.75rem; padding:0.45rem; border-color:var(--neon-yellow); color:var(--neon-yellow); text-align:center;">🎬 CutFlow Pro Creator Suite ($49) &rarr;</a>
                </div>
            </div>

        </div>
    </section>

    <!-- ========================================================================= -->
    <!-- SECTION: INTERACTIVE 15S BIOMETRIC & LASER VAULT KEYPAD SIMULATOR -->
    <!-- ========================================================================= -->
    <section id="vaultKeypadSimulatorSection" style="margin-top:3rem; background:linear-gradient(135deg, rgba(8,16,28,0.96), rgba(4,10,18,0.98)); border:2px solid var(--neon-cyan); border-radius:12px; padding:1.5rem; box-shadow:0 0 30px rgba(0,240,255,0.18);">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem; margin-bottom:1.25rem; border-bottom:1px solid rgba(0,240,255,0.25); padding-bottom:0.75rem;">
            <div>
                <div style="display:flex; gap:0.5rem; align-items:center; margin-bottom:0.25rem;">
                    <span class="user-badge" style="background:rgba(0,240,255,0.2); border-color:var(--neon-cyan); color:var(--neon-cyan); font-size:0.72rem; font-weight:800; font-family:var(--font-mono);">🔐 BIOMETRIC OVERRIDE DRILL</span>
                    <span style="color:var(--neon-yellow); font-size:0.78rem; font-weight:800;">5 &amp; 7-NODE SPEED SIMULATOR</span>
                </div>
                <h2 style="color:#fff; font-size:1.45rem; margin:0 0 0.2rem; font-weight:900;">15-Second Vault Keypad &amp; Laser Hack Trainer</h2>
                <p style="color:var(--text-muted); font-size:0.84rem; margin:0;">Practice the high-stress biometric keypad minigame before setting foot inside the Leonida Gold Reserve or Sinfrontera National Bank.</p>
            </div>
            <a href="/vault-hack-trainer.html" class="btn btn-secondary" style="font-size:0.76rem; padding:0.35rem 0.85rem; border-color:var(--neon-cyan); color:var(--neon-cyan);">Full 3D Trainer &rarr;</a>
        </div>
        
        <div id="keypadTrainerBox"></div>
    </section>"""

    # Replace the old PRE-ORDER & PRO HARDWARE DEALS SHOWCASE
    old_showcase_pattern = re.compile(
        r'<!-- PRE-ORDER & PRO HARDWARE DEALS SHOWCASE -->.*?</div>\s*</div>\s*</div>\s*(?=</main>)',
        re.DOTALL
    )
    if old_showcase_pattern.search(html):
        html = old_showcase_pattern.sub(new_sections + "\n\n", html)
        print("Replaced old deals showcase with Day-2 In-Game Gear, Pro Console Tactical Gear, and Keypad Simulator!")
    else:
        # Fallback: replace just before </main>
        idx = html.find('</main>')
        if idx != -1:
            html = html[:idx] + new_sections + "\n" + html[idx:]
            print("Appended new sections before </main>")

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(html)
    print("Successfully updated weapons-gear.html!")


def update_internal_links():
    # 1. Update index.html
    idx_path = os.path.join(PUBLIC_DIR, "index.html")
    with open(idx_path, "r", encoding="utf-8") as f:
        idx_html = f.read()

    # Link in day2Hub card 4
    if "GTA 6 Tactical Gear" not in idx_html:
        # Update Hub card 4 description or button
        idx_html = idx_html.replace(
            "Searchable 24-store table (Vice City Firearms, Martez Empenos, Black Eagle) + Jason's Duval Signature ES9 pistol &amp; ink unlock guide.",
            "Searchable 24-store table (Vice City Firearms, Martez Empenos, Black Eagle) + Jason's Duval Signature ES9 pistol unlock guide and in-game <a href=\"/weapons-gear.html\" style=\"color:var(--neon-yellow); font-weight:800; text-decoration:underline;\">GTA 6 Tactical Gear</a> loadouts."
        )
        # Also in Weapons Showcase header
        idx_html = idx_html.replace(
            '<a href="weapons-gear.html" class="btn btn-primary" style="font-size:0.78rem; padding:0.35rem 0.85rem; background:rgba(255,184,0,0.25); border-color:var(--neon-yellow); color:#fff;">Explore All 40+ Weapons, Masks &amp; Outfits &rarr;</a>',
            '<a href="/weapons-gear.html" class="btn btn-primary" style="font-size:0.78rem; padding:0.35rem 0.85rem; background:rgba(255,184,0,0.25); border-color:var(--neon-yellow); color:#fff;">⚡ GTA 6 Tactical Gear &amp; Weapons (40+) &rarr;</a>'
        )
        with open(idx_path, "w", encoding="utf-8") as f:
            f.write(idx_html)
        print("Updated internal link in index.html!")
    else:
        print("Internal link already present in index.html")

    # 2. Update cheats.html
    cheats_path = os.path.join(PUBLIC_DIR, "cheats.html")
    with open(cheats_path, "r", encoding="utf-8") as f:
        cheats_html = f.read()

    if "GTA 6 Tactical Gear" not in cheats_html:
        target_str = "Activating any D-Pad cheat disables achievements, trophies, and autosaving."
        replacement = "Activating any D-Pad cheat disables achievements, trophies, and autosaving. For legitimate, trophy-safe heist defense, equip confirmed in-game <a href=\"/weapons-gear.html\" style=\"color:var(--neon-yellow); font-weight:800; text-decoration:underline;\">GTA 6 Tactical Gear</a> and body armor."
        if target_str in cheats_html:
            cheats_html = cheats_html.replace(target_str, replacement)
        else:
            # Place in caution box
            cheats_html = cheats_html.replace(
                "CAUTION: SAVES &amp; TROPHIES DISABLED",
                "CAUTION: SAVES &amp; TROPHIES DISABLED</div>\n                <div style=\"font-size:0.78rem; color:#d1d5db; margin-top:0.35rem;\">Looking for unbanned heist armor? Equip confirmed in-game <a href=\"/weapons-gear.html\" style=\"color:var(--neon-yellow); font-weight:800; text-decoration:underline;\">GTA 6 Tactical Gear</a>."
            )
        with open(cheats_path, "w", encoding="utf-8") as f:
            f.write(cheats_html)
        print("Updated internal link in cheats.html!")
    else:
        print("Internal link already present in cheats.html")

    # 3. Update settings.html
    settings_path = os.path.join(PUBLIC_DIR, "settings.html")
    with open(settings_path, "r", encoding="utf-8") as f:
        settings_html = f.read()

    if "GTA 6 Tactical Gear" not in settings_html:
        target_kf = "sub-millimeter headshot accuracy at 30 FPS."
        replacement_kf = "sub-millimeter headshot accuracy at 30 FPS. Pair with verified in-game <a href=\"/weapons-gear.html\" style=\"color:var(--neon-pink); font-weight:800; text-decoration:underline;\">GTA 6 Tactical Gear</a> and suppressed weapon builds."
        if target_kf in settings_html:
            settings_html = settings_html.replace(target_kf, replacement_kf)
        with open(settings_path, "w", encoding="utf-8") as f:
            f.write(settings_html)
        print("Updated internal link in settings.html!")
    else:
        print("Internal link already present in settings.html")

if __name__ == "__main__":
    upgrade_weapons_gear()
    update_internal_links()
