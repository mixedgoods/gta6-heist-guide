#!/usr/bin/env python3
"""
Phase 26 — Sections 8 & 9:
- Fixes stale/mismatched image references across World Database Hub and site pages
- Adds editorial 16:9 verified Rockstar GTA VI visual breaks to long-form guides & location pages
  (placed AFTER the opening intro/quick-answer so direct answers stay above the fold)
- Updates cache-busting query strings on core database & hub pages
"""

import re
from pathlib import Path

REPO = Path(r"C:\Users\Shawn\Desktop\gta6heistguide")
PUB = REPO / "public"

# Verified editorial visuals for key pages (path, alt, caption, focal)
EDITORIAL_VISUALS = {
    "port-gellhorn.html": [
        ("/assets/images/properties/gtavi-port-gellhorn-motel-exterior.jpg",
         "Port Gellhorn roadside motel exterior at dusk in Grand Theft Auto VI",
         "Port Gellhorn roadside motel district — Official Rockstar Games GTA VI Screenshot (Port_Gellhorn_01.jpg).",
         "50% 45%"),
        ("/assets/images/properties/gtavi-port-gellhorn-industrial-view.jpg",
         "Port Gellhorn industrial docks and sunset skyline in Grand Theft Auto VI",
         "Port Gellhorn industrial skyline & freight corridor — Official Rockstar Games GTA VI Screenshot (Port_Gellhorn_06.jpg).",
         "50% 50%"),
    ],
    "locations/vice-city.html": [
        ("/assets/images/properties/gtavi-downtown-vice-dusk.jpg",
         "Downtown Vice City skyline at dusk in Grand Theft Auto VI",
         "Downtown Vice City skyline — Official Rockstar Games GTA VI Screenshot (Vice_City_27.jpg).",
         "50% 50%"),
        ("/assets/images/properties/gtavi-vice-city-canal-district.jpg",
         "Vice City marina canal and commercial waterfront in Grand Theft Auto VI",
         "Vice City canals & waterfront district — Official Rockstar Games GTA VI Screenshot (Vice_City_17.jpg).",
         "50% 50%"),
    ],
    "locations/vice-beach.html": [
        ("/assets/images/properties/gtavi-vice-beach-skyline.jpg",
         "Vice Beach coastal towers and causeway in Grand Theft Auto VI",
         "Vice Beach skyline and causeway — Official Rockstar Games GTA VI Screenshot (Vice_City_10.jpg).",
         "50% 50%"),
    ],
    "locations/leonida-keys.html": [
        ("/assets/images/properties/gtavi-leonida-keys-aerial.jpg",
         "Leonida Keys archipelago and overseas highway aerial view in Grand Theft Auto VI",
         "Leonida Keys island chain & highway — Official Rockstar Games GTA VI Screenshot (Leonida_Keys_01.jpg).",
         "50% 50%"),
        ("/assets/images/properties/gtavi-leonida-keys-rusty-anchor.jpg",
         "Rusty Anchor bar and marina docks in the Leonida Keys in Grand Theft Auto VI",
         "Leonida Keys Rusty Anchor marina — Official Rockstar Games GTA VI Screenshot (Leonida_Keys_03.jpg).",
         "50% 50%"),
    ],
    "locations/grassrivers.html": [
        ("/assets/images/properties/gtavi-grassrivers-waterfront-dock.jpg",
         "Grassrivers waterfront docks and swamp channels in Grand Theft Auto VI",
         "Grassrivers wetlands & docks — Official Rockstar Games GTA VI Screenshot (Grassrivers_02.jpg).",
         "50% 50%"),
        ("/assets/images/animals/gtavi-american-alligator-grassrivers-closeup.jpg",
         "American Alligator resting on an airboat deck in Grassrivers in Grand Theft Auto VI",
         "Grassrivers wildlife: American Alligator — Official Rockstar Games GTA VI Screenshot (Grassrivers_01.jpg).",
         "50% 60%"),
    ],
    "locations/ambrosia.html": [
        ("/assets/images/properties/gtavi-ambrosia-highway-freight.jpg",
         "Ambrosia commercial highway and industrial corridor in Grand Theft Auto VI",
         "Ambrosia highway corridor — Official Rockstar Games GTA VI Screenshot (Ambrosia_01.jpg).",
         "50% 50%"),
        ("/assets/images/properties/gtavi-ambrosia-refinery-dusk.jpg",
         "Ambrosia industrial refinery at sunset in Grand Theft Auto VI",
         "Ambrosia industrial refinery — Official Rockstar Games GTA VI Screenshot (Ambrosia_04.jpg).",
         "50% 50%"),
    ],
    "locations/mount-kalaga.html": [
        ("/assets/images/properties/gtavi-mount-kalaga-valley-road.jpg",
         "Mount Kalaga National Park valley road and pine ridges in Grand Theft Auto VI",
         "Mount Kalaga National Park valley — Official Rockstar Games GTA VI Screenshot (Mount_Kalaga_National_Park_04.jpg).",
         "50% 50%"),
        ("/assets/images/animals/gtavi-florida-panther-mount-kalaga-stream.jpg",
         "Florida Panther stalking across a sunlit creek in Mount Kalaga National Park in Grand Theft Auto VI",
         "Mount Kalaga apex predator: Florida Panther — Official Rockstar Games GTA VI Screenshot (Mount_Kalaga_National_Park_05.jpg).",
         "25% 70%"),
    ],
    "locations/lake-leonida.html": [
        ("/assets/images/gun-stores/gtavi-lake-leonida-waterway.jpg",
         "Northern Leonida waterway and bridge crossing in Grand Theft Auto VI",
         "Northern Leonida waterway & bridge — Official Rockstar Games GTA VI Screenshot (Mount_Kalaga_National_Park_06.jpg).",
         "50% 50%"),
    ],
    "gta-6-property-ownership/index.html": [
        ("/assets/images/properties/gtavi-keys-safehouse-exterior.jpg",
         "Key Lento stilted story safehouse exterior in Grand Theft Auto VI",
         "Story Mode Safehouse: Key Lento stilted house — Official Rockstar Games GTA VI Screenshot.",
         "50% 50%"),
        ("/assets/images/properties/gtavi-rideout-customs-garage-bay.jpg",
         "Rideout Customs garage interior with vehicle on lift in Grand Theft Auto VI",
         "Leonida garage bay — Official Rockstar Games GTA VI Screenshot (Rideout Customs).",
         "50% 50%"),
    ],
    "gta-6-vehicles-guide/index.html": [
        ("/assets/images/vehicles/gtavi-grotti-cheetah-classic-vice-city.jpg",
         "Grotti Cheetah Classic supercar parked in Vice City in Grand Theft Auto VI",
         "Grotti Cheetah Classic — Official Rockstar Games GTA VI Screenshot.",
         "50% 50%"),
        ("/assets/images/vehicles/gtavi-shitzu-squalo-speedboat-vice-bay.jpg",
         "Shitzu Squalo speedboat cutting across Vice Bay in Grand Theft Auto VI",
         "Shitzu Squalo watercraft — Official Rockstar Games GTA VI Screenshot.",
         "50% 50%"),
    ],
    "gta-6-money-guide/index.html": [
        ("/assets/images/weapons/gtavi-vault-breach-loadout.jpg",
         "Jason and Lucia in tactical heist gear outside a bank vault in Grand Theft Auto VI",
         "Bank vault heist preparation — Official Rockstar Games GTA VI Screenshot (Jason_and_Lucia_02.jpg).",
         "50% 40%"),
        ("/assets/images/properties/gtavi-gellhorn-pawn-cash-store.jpg",
         "Port Gellhorn Pawn and Cash storefront exterior in Grand Theft Auto VI",
         "Fencing & cash conversion in Port Gellhorn — Official Rockstar Games GTA VI Screenshot (Lucia_Caminos_08.jpg).",
         "50% 40%"),
    ],
    "guides/all-story-safehouses.html": [
        ("/assets/images/properties/gtavi-keys-safehouse-exterior.jpg",
         "Key Lento stilted safehouse exterior in Grand Theft Auto VI",
         "Chapter 1 Safehouse: Jason's House in Key Lento — Official Rockstar Games GTA VI Screenshot.",
         "50% 50%"),
    ],
    "guides/all-gta-6-garages.html": [
        ("/assets/images/properties/gtavi-rideout-customs-garage-bay.jpg",
         "Leonida vehicle garage bay with hydraulic lift in Grand Theft Auto VI",
         "Leonida garage & customization bay — Official Rockstar Games GTA VI Screenshot.",
         "50% 50%"),
    ],
    "guides/all-7-fences-and-vehicle-buyers.html": [
        ("/assets/images/properties/gtavi-gellhorn-pawn-cash-store.jpg",
         "Port Gellhorn Pawn and Cash storefront in Grand Theft Auto VI",
         "Port Gellhorn storefront & stolen-goods drop — Official Rockstar Games GTA VI Screenshot.",
         "50% 40%"),
    ],
    "guides/ultimate-edition-bonuses-guide.html": [
        ("/assets/images/vehicles/gtavi-grotti-cheetah-classic-vice-city.jpg",
         "Grotti Cheetah Classic Ultimate Edition vehicle in Grand Theft Auto VI",
         "Ultimate Edition Vehicle: Grotti Cheetah Classic — Official Rockstar Games GTA VI Screenshot.",
         "50% 50%"),
    ],
    "guides/bank-vault-hacking-guide.html": [
        ("/assets/images/weapons/gtavi-vault-breach-loadout.jpg",
         "Jason and Lucia outside a bank vault door in Grand Theft Auto VI",
         "Vault breach loadout — Official Rockstar Games GTA VI Screenshot (Jason_and_Lucia_02.jpg).",
         "50% 40%"),
    ],
}


def build_figure(src: str, alt: str, caption: str, focal: str) -> str:
    return (
        f'\n<!--p26:visual-->\n'
        f'<figure class="p26-editorial-fig" style="margin:1.25rem 0; background:rgba(9,14,26,0.92); '
        f'border:1px solid rgba(0,240,255,0.22); border-radius:11px; overflow:hidden;">'
        f'<div style="width:100%; aspect-ratio:16/9; max-height:420px; overflow:hidden; background:#060a14;">'
        f'<img src="{src}" alt="{alt}" width="1600" height="900" loading="lazy" decoding="async" '
        f'style="width:100%; height:100%; object-fit:cover; object-position:{focal}; display:block;">'
        f'</div>'
        f'<figcaption style="padding:0.48rem 0.85rem; font-size:0.75rem; color:#94a3b8; '
        f'border-top:1px solid rgba(255,255,255,0.06); line-height:1.4;">{caption}</figcaption>'
        f'</figure>\n'
    )


def inject_editorial_visuals():
    updated = 0
    for rel, visuals in EDITORIAL_VISUALS.items():
        p = PUB / rel
        if not p.exists():
            continue
        txt = p.read_text(encoding="utf-8", errors="ignore")
        if "<!--p26:visual-->" in txt:
            continue
        # Insert first visual before the 2nd <h2> inside <main>, and second visual (if any) before the 4th <h2>
        h2_matches = list(re.finditer(r'<h2\b[^>]*>', txt))
        if not h2_matches:
            continue
        insertions = []
        if len(visuals) >= 1:
            target_idx = 1 if len(h2_matches) > 1 else 0
            insertions.append((h2_matches[target_idx].start(), build_figure(*visuals[0])))
        if len(visuals) >= 2 and len(h2_matches) >= 4:
            insertions.append((h2_matches[3].start(), build_figure(*visuals[1])))

        # Apply in reverse order so offsets stay valid
        for pos, snippet in sorted(insertions, key=lambda x: x[0], reverse=True):
            txt = txt[:pos] + snippet + txt[pos:]
        p.write_text(txt, encoding="utf-8")
        updated += 1
        print(f"Injected {len(insertions)} verified editorial visual(s) into {rel}")
    print(f"Total long-form pages enriched: {updated}")


def fix_hub_and_db_cache_busters():
    # Fix World Database Hub thumbnails & cache busters on core DB pages
    hub = PUB / "gta-6-database" / "index.html"
    if hub.exists():
        t = hub.read_text(encoding="utf-8")
        t = t.replace("/assets/images/weapons/weapon-jason-rifle.jpg", "/assets/images/weapons/gtavi-service-carbine-night.jpg")
        t = t.replace("/assets/images/weapons/weapon-goodtime-gear.jpg", "/assets/images/gun-stores/gtavi-gellhorn-pawn-exterior.jpg")
        t = t.replace("/assets/images/animals/gtavi-american-alligator-grassrivers-dock.jpg", "/assets/images/animals/gtavi-american-alligator-grassrivers-closeup.jpg")
        t = t.replace("/assets/images/properties/vice-city-penthouse.jpg", "/assets/images/properties/gtavi-keys-safehouse-exterior.jpg")
        hub.write_text(t, encoding="utf-8")
        print("Updated World Database Hub thumbnails in gta-6-database/index.html")

    # Cache-bust world-db-engine.js, style.css, site-config.js, and JSON URLs on all core pages
    core_pages = [
        "properties.html", "vehicles.html", "weapons.html", "weapons-bonuses.html",
        "radio.html", "animals.html", "map.html", "gta-6-database/index.html",
        "index.html", "heist-planner.html", "affiliates-gear.html",
    ]
    for rel in core_pages:
        p = PUB / rel
        if not p.exists():
            continue
        t = p.read_text(encoding="utf-8")
        t = re.sub(r'world-db-engine\.js(?:\?v=[^"\']+)?', 'world-db-engine.js?v=20261124_p26', t)
        t = re.sub(r'/assets/style\.css(?:\?v=[^"\']+)?', '/assets/style.css?v=20261124_p26', t)
        t = re.sub(r'/site-config\.js(?:\?v=[^"\']+)?', '/site-config.js?v=20261124_p26', t)
        t = re.sub(r'(/data/(?:properties|vehicles|weapons|gun-stores|radio|animals)\.json)(?:\?v=[^"\']+)?', r'\1?v=20261124_p26', t)
        p.write_text(t, encoding="utf-8")
    print(f"Cache-busted {len(core_pages)} core pages to v=20261124_p26")


if __name__ == "__main__":
    inject_editorial_visuals()
    fix_hub_and_db_cache_busters()
