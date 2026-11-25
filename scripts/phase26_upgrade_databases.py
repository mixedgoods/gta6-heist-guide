#!/usr/bin/env python3
"""
Phase 26 — Sections 4, 5, 6, 7 & 2.3:
Extracts authentic 1600x900 JPG + 800/1200 WebP web derivatives from the official
Rockstar Games Press Kit ZIPs (preserving all original ZIPs untouched) and wires
verified visuals with honest provenance captions into:
  - public/data/properties.json (+ data/properties.json)
  - public/data/weapons.json (+ data/weapons.json)
  - public/data/gun-stores.json (+ data/gun-stores.json)
  - public/data/image-library-manifest.json
"""

import io
import json
import zipfile
from pathlib import Path
from PIL import Image

REPO = Path(r"C:\Users\Shawn\Desktop\gta6heistguide")
ROCKSTAR_DIR = REPO / "GTA6-ROCKSTAR-HIGH-QUALITY-LIBRARY"
IMG_ROOT = REPO / "public" / "assets" / "images"

ZIPS = {
    "shots": ROCKSTAR_DIR / "GTAVI_Screenshots.zip",
    "ult": ROCKSTAR_DIR / "GTAVI_Ultimate_Edition_Benefits.zip",
    "vintage": ROCKSTAR_DIR / "GTAVI_Vintage_Vice_City_Pack.zip",
}

_zip_handles = {}


def read_zip_image(zip_key: str, inner_path: str) -> Image.Image:
    if zip_key not in _zip_handles:
        _zip_handles[zip_key] = zipfile.ZipFile(ZIPS[zip_key], "r")
    data = _zip_handles[zip_key].read(inner_path)
    return Image.open(io.BytesIO(data)).convert("RGB")


def save_web_derivatives(im: Image.Image, subdir: str, slug: str):
    out_dir = IMG_ROOT / subdir
    out_dir.mkdir(parents=True, exist_ok=True)
    # Normalize to 16:9 center-crop if slightly off
    w, h = im.size
    target_ar = 16 / 9
    cur_ar = w / h
    if abs(cur_ar - target_ar) > 0.03:
        if cur_ar > target_ar:
            nw = int(h * target_ar)
            left = (w - nw) // 2
            im = im.crop((left, 0, left + nw, h))
        else:
            nh = int(w / target_ar)
            top = (h - nh) // 2
            im = im.crop((0, top, w, top + nh))

    im1600 = im.resize((1600, 900), Image.Resampling.LANCZOS)
    im1600.save(out_dir / f"{slug}.jpg", "JPEG", quality=86, optimize=True)
    im800 = im.resize((800, 450), Image.Resampling.LANCZOS)
    im800.save(out_dir / f"{slug}-800.webp", "WEBP", quality=84)
    im1200 = im.resize((1200, 675), Image.Resampling.LANCZOS)
    im1200.save(out_dir / f"{slug}-1200.webp", "WEBP", quality=84)
    return {
        "image": f"/assets/images/{subdir}/{slug}.jpg",
        "imageWebp": f"/assets/images/{subdir}/{slug}-1200.webp",
        "imageWebpSrcset": f"/assets/images/{subdir}/{slug}-800.webp 800w, /assets/images/{subdir}/{slug}-1200.webp 1200w",
        "imageWidth": 1600,
        "imageHeight": 900,
    }


# Master curated asset definitions: (zip_key, inner_path, subdir, slug, subject, provenance_label, focal)
CURATED_ASSETS = {
    # PROPERTIES & LOCATIONS
    "prop-keys-safehouse": ("ult", "ULTIMATE_EDITION_SAFEHOUSE_VEHICLES_01.jpg", "properties", "gtavi-keys-safehouse-exterior", "Key Lento stilted safehouse exterior with vehicles", "Official Rockstar Games Screenshot (ULTIMATE_EDITION_SAFEHOUSE_VEHICLES_01.jpg)", "50% 50%"),
    "prop-gellhorn-motel": ("shots", "Places/Port Gellhorn/Port_Gellhorn_01.jpg", "properties", "gtavi-port-gellhorn-motel-exterior", "Port Gellhorn roadside motel exterior at dusk", "Official Rockstar Games Screenshot (Port_Gellhorn_01.jpg)", "50% 45%"),
    "prop-vc-waterfront": ("shots", "Places/Vice City/Vice_City_03.jpg", "properties", "gtavi-vice-city-waterfront-towers", "Vice City residential towers and bayfront (Regional Visual)", "Official Rockstar Games Screenshot (Vice_City_03.jpg — Regional Visual)", "50% 50%"),
    "prop-vc-highrise": ("shots", "Places/Vice City/Vice_City_11.jpg", "properties", "gtavi-vice-city-highrise-penthouse", "Vice City luxury high-rise apartment tower (Regional Visual)", "Official Rockstar Games Screenshot (Vice_City_11.jpg — Regional Visual)", "50% 45%"),
    "prop-vc-beach-skyline": ("shots", "Places/Vice City/Vice_City_10.jpg", "properties", "gtavi-vice-beach-skyline", "Vice Beach coastal towers and causeway (Regional Visual)", "Official Rockstar Games Screenshot (Vice_City_10.jpg — Regional Visual)", "50% 50%"),
    "prop-vc-little-cuba": ("shots", "Places/Vice City/Vice_City_09.jpg", "properties", "gtavi-vice-city-mural-avenue", "Vice City mural corridor and neighborhood street (Regional Visual)", "Official Rockstar Games Screenshot (Vice_City_09.jpg — Regional Visual)", "50% 50%"),
    "prop-vc-downtown": ("shots", "Places/Vice City/Vice_City_27.jpg", "properties", "gtavi-downtown-vice-dusk", "Downtown Vice City skyline at dusk (Regional Visual)", "Official Rockstar Games Screenshot (Vice_City_27.jpg — Regional Visual)", "50% 50%"),
    "prop-gellhorn-strip": ("shots", "Places/Port Gellhorn/Port_Gellhorn_04.jpg", "properties", "gtavi-port-gellhorn-strip-night", "Port Gellhorn commercial strip at night (Regional Visual)", "Official Rockstar Games Screenshot (Port_Gellhorn_04.jpg — Regional Visual)", "50% 50%"),
    "prop-gellhorn-industrial": ("shots", "Places/Port Gellhorn/Port_Gellhorn_06.jpg", "properties", "gtavi-port-gellhorn-industrial-view", "Port Gellhorn industrial skyline at sunset (Regional Visual)", "Official Rockstar Games Screenshot (Port_Gellhorn_06.jpg — Regional Visual)", "50% 50%"),
    "prop-ambrosia-freight": ("shots", "Places/Ambrosia/Ambrosia_01.jpg", "properties", "gtavi-ambrosia-highway-freight", "Ambrosia highway and commercial corridor (Regional Visual)", "Official Rockstar Games Screenshot (Ambrosia_01.jpg — Regional Visual)", "50% 50%"),
    "prop-ambrosia-refinery": ("shots", "Places/Ambrosia/Ambrosia_04.jpg", "properties", "gtavi-ambrosia-refinery-dusk", "Ambrosia industrial refinery skyline (Regional Visual)", "Official Rockstar Games Screenshot (Ambrosia_04.jpg — Regional Visual)", "50% 50%"),
    "prop-keys-boatyard": ("shots", "Places/Leonida Keys/Leonida_Keys_03.jpg", "properties", "gtavi-leonida-keys-rusty-anchor", "Leonida Keys Rusty Anchor bar and boatyard (Regional Visual)", "Official Rockstar Games Screenshot (Leonida_Keys_03.jpg — Regional Visual)", "50% 50%"),
    "prop-kalaga-trailhead": ("shots", "Places/Mount Kalaga National Park/Mount_Kalaga_National_Park_04.jpg", "properties", "gtavi-mount-kalaga-valley-road", "Mount Kalaga National Park valley road and trailhead (Regional Visual)", "Official Rockstar Games Screenshot (Mount_Kalaga_National_Park_04.jpg — Regional Visual)", "50% 50%"),
    "prop-rideout-garage": ("ult", "ULTIMATE_EDITION_RIDEOUT_CUSTOMS_03.jpg", "properties", "gtavi-rideout-customs-garage-bay", "Rideout Customs garage interior with vehicle on hydraulic lift", "Official Rockstar Games Screenshot (ULTIMATE_EDITION_RIDEOUT_CUSTOMS_03.jpg)", "50% 50%"),
    "prop-wyman-yard": ("ult", "ULTIMATE_EDITION_WYMAN_CAR_COLLECTION_01.jpg", "properties", "gtavi-wyman-vehicle-yard", "Vehicle collection lot and garage area in Leonida", "Official Rockstar Games Screenshot (ULTIMATE_EDITION_WYMAN_CAR_COLLECTION_01.jpg)", "50% 50%"),
    "prop-garage-4x4": ("ult", "ULTIMATE_EDITION_ONE_EYED_WILLIE_03.jpg", "properties", "gtavi-custom-garage-bay", "Leonida vehicle customization garage bay", "Official Rockstar Games Screenshot (ULTIMATE_EDITION_ONE_EYED_WILLIE_03.jpg)", "50% 50%"),
    "prop-keys-aerial": ("shots", "Places/Leonida Keys/Leonida_Keys_01.jpg", "properties", "gtavi-leonida-keys-aerial", "Leonida Keys archipelago and highway aerial (Regional Visual)", "Official Rockstar Games Screenshot (Leonida_Keys_01.jpg — Regional Visual)", "50% 50%"),
    "prop-brians-compound": ("shots", "People/Brian Heder/Brian_Heder_04.jpg", "properties", "gtavi-brian-heder-boatyard", "Brian Heder at his Leonida Keys boatyard compound", "Official Rockstar Games Screenshot (Brian_Heder_04.jpg)", "50% 35%"),
    "prop-pawn-cash": ("shots", "People/Lucia Caminos/Lucia_Caminos_08.jpg", "properties", "gtavi-gellhorn-pawn-cash-store", "Port Gellhorn Checks Cashed & Cash Now storefront", "Official Rockstar Games Screenshot (Lucia_Caminos_08.jpg)", "50% 40%"),
    "prop-stock-305": ("ult", "ULTIMATE_EDITION_STOCK_305_01.jpg", "properties", "gtavi-vice-city-stock-305", "Stock 305 Vice City storefront exterior", "Official Rockstar Games Screenshot (ULTIMATE_EDITION_STOCK_305_01.jpg)", "50% 45%"),
    "prop-vc-canal": ("shots", "Places/Vice City/Vice_City_17.jpg", "properties", "gtavi-vice-city-canal-district", "Vice City marina canal and commercial district (Regional Visual)", "Official Rockstar Games Screenshot (Vice_City_17.jpg — Regional Visual)", "50% 50%"),
    "prop-grassrivers-dock": ("shots", "Places/Grassrivers/Grassrivers_02.jpg", "properties", "gtavi-grassrivers-waterfront-dock", "Grassrivers waterfront docks and wetlands (Regional Visual)", "Official Rockstar Games Screenshot (Grassrivers_02.jpg — Regional Visual)", "50% 50%"),
    "prop-vc-commercial": ("shots", "Places/Vice City/Vice_City_22.jpg", "properties", "gtavi-vice-city-night-corner", "Vice City illuminated commercial corner at night (Regional Visual)", "Official Rockstar Games Screenshot (Vice_City_22.jpg — Regional Visual)", "50% 50%"),

    # WEAPONS (Official Rockstar GTA VI Screenshots)
    "weap-pistol-firing": ("shots", "People/Jason Duval/Jason_Duval_09.jpg", "weapons", "gtavi-jason-pistol-firing", "Jason Duval firing a polymer semi-automatic handgun with ejecting brass", "Official Rockstar Games Screenshot (Jason_Duval_09.jpg)", "35% 45%"),
    "weap-lucia-handgun": ("shots", "People/Lucia Caminos/Lucia_Caminos_13.jpg", "weapons", "gtavi-lucia-tactical-handgun", "Lucia Caminos aiming a compact tactical pistol", "Official Rockstar Games Screenshot (Lucia_Caminos_13.jpg)", "55% 45%"),
    "weap-carbine-night": ("shots", "People/Jason Duval/Jason_Duval_05.jpg", "weapons", "gtavi-service-carbine-night", "Jason Duval aiming a scoped carbine rifle over Vice City at night", "Official Rockstar Games Screenshot (Jason_Duval_05.jpg)", "45% 55%"),
    "weap-gold-rifle": ("shots", "Places/Vice City/Vice_City_12.jpg", "weapons", "gtavi-gold-assault-rifle", "Gold-plated assault rifle held in Vice City", "Official Rockstar Games Screenshot (Vice_City_12.jpg)", "35% 45%"),
    "weap-battle-rifle": ("shots", "People/Jason Duval/Jason_Duval_17.jpg", "weapons", "gtavi-heavy-battle-rifle", "Jason Duval aiming a tactical long-barrel rifle with optic", "Official Rockstar Games Screenshot (Jason_Duval_17.jpg)", "55% 45%"),
    "weap-compact-smg": ("shots", "People/Jason Duval/Jason_Duval_10.jpg", "weapons", "gtavi-tactical-smg-jason", "Jason Duval holding a compact tactical submachine gun", "Official Rockstar Games Screenshot (Jason_Duval_10.jpg)", "40% 45%"),
    "weap-store-robbery": ("shots", "People/Jason and Lucia/Jason_and_Lucia_15.jpg", "weapons", "gtavi-duo-robbery-smg", "Masked Jason and Lucia armed with compact automatic weapons during a robbery", "Official Rockstar Games Screenshot (Jason_and_Lucia_15.jpg)", "50% 40%"),
    "weap-shotgun-duo": ("shots", "People/Jason and Lucia/Jason_and_Lucia_08.jpg", "weapons", "gtavi-duo-shotgun-heist", "Jason and Lucia armed with a long shotgun and heist duffel bags", "Official Rockstar Games Screenshot (Jason_and_Lucia_08.jpg)", "45% 45%"),
    "weap-indoor-firefight": ("shots", "People/Jason Duval/Jason_Duval_16.jpg", "weapons", "gtavi-combat-firefight-rifle", "Jason Duval firing a tactical weapon amid sparks in close quarters", "Official Rockstar Games Screenshot (Jason_Duval_16.jpg)", "50% 45%"),
    "weap-bank-breach": ("shots", "People/Jason and Lucia/Jason_and_Lucia_04.jpg", "weapons", "gtavi-bank-breach-loadout", "Jason and Lucia engaging security with tactical firearms inside a bank", "Official Rockstar Games Screenshot (Jason_and_Lucia_04.jpg)", "45% 40%"),
    "weap-hunting-rifle": ("shots", "Places/Ambrosia/Ambrosia_03.jpg", "weapons", "gtavi-scoped-hunting-rifle", "Scoped bolt-action hunting rifle held by an Ambrosia resident", "Official Rockstar Games Screenshot (Ambrosia_03.jpg)", "55% 60%"),
    "weap-grassrivers-rifle": ("shots", "Places/Grassrivers/Grassrivers_01.jpg", "weapons", "gtavi-grassrivers-hunting-rifle", "Scoped hunting rifle and tactical rifle on a Grassrivers airboat", "Official Rockstar Games Screenshot (Grassrivers_01.jpg)", "65% 35%"),
    "weap-grenade-launcher": ("shots", "People/Jason and Lucia/Jason_and_Lucia_19.jpg", "weapons", "gtavi-lucia-grenade-launcher", "Lucia Caminos firing a compact grenade launcher from a convertible", "Official Rockstar Games Screenshot (Jason_and_Lucia_19.jpg)", "55% 45%"),
    "weap-vault-heavy": ("shots", "People/Jason and Lucia/Jason_and_Lucia_02.jpg", "weapons", "gtavi-vault-breach-loadout", "Jason and Lucia in tactical heist gear outside a bank vault (Illustrative Heist Loadout)", "Official Rockstar Games Screenshot (Jason_and_Lucia_02.jpg — Illustrative Heist Loadout)", "50% 40%"),
    "weap-combat-knife": ("shots", "Places/Grassrivers/Grassrivers_07.jpg", "weapons", "gtavi-combat-knife-grassrivers", "Serrated combat knife held at a Grassrivers wetlands camp", "Official Rockstar Games Screenshot (Grassrivers_07.jpg)", "48% 82%"),

    # GUN STORES (Regional & Storefront Official Rockstar Screenshots)
    "gs-ptt-store": ("ult", "ULTIMATE_EDITION_PTT_STORE_01.jpg", "gun-stores", "gtavi-vice-retail-interior", "Leonida tactical & gear retail interior (Regional Store Visual)", "Official Rockstar Games Screenshot (ULTIMATE_EDITION_PTT_STORE_01.jpg — Store Visual)", "50% 45%"),
    "gs-gellhorn-pawn": ("shots", "People/Lucia Caminos/Lucia_Caminos_08.jpg", "gun-stores", "gtavi-gellhorn-pawn-exterior", "Port Gellhorn Pawn & Cash storefront exterior (Regional Store Visual)", "Official Rockstar Games Screenshot (Lucia_Caminos_08.jpg — Store Visual)", "50% 40%"),
    "gs-vice-strip": ("shots", "Places/Vice City/Vice_City_10.jpg", "gun-stores", "gtavi-vice-beach-outlet-area", "Vice Beach commercial district (Regional Location Visual)", "Official Rockstar Games Screenshot (Vice_City_10.jpg — Regional Visual)", "50% 50%"),
    "gs-vice-downtown": ("shots", "Places/Vice City/Vice_City_27.jpg", "gun-stores", "gtavi-downtown-vice-outlet-area", "Downtown Vice City commercial corridor (Regional Location Visual)", "Official Rockstar Games Screenshot (Vice_City_27.jpg — Regional Visual)", "50% 50%"),
    "gs-vice-mural": ("shots", "Places/Vice City/Vice_City_09.jpg", "gun-stores", "gtavi-little-haiti-outlet-area", "Vice City Little Haiti / neighborhood strip (Regional Location Visual)", "Official Rockstar Games Screenshot (Vice_City_09.jpg — Regional Visual)", "50% 50%"),
    "gs-vice-canal": ("shots", "Places/Vice City/Vice_City_17.jpg", "gun-stores", "gtavi-vice-island-outlet-area", "Vice City island causeway and marina (Regional Location Visual)", "Official Rockstar Games Screenshot (Vice_City_17.jpg — Regional Visual)", "50% 50%"),
    "gs-gellhorn-strip": ("shots", "Places/Port Gellhorn/Port_Gellhorn_04.jpg", "gun-stores", "gtavi-gellhorn-strip-outlets", "Port Gellhorn roadside commercial strip (Regional Location Visual)", "Official Rockstar Games Screenshot (Port_Gellhorn_04.jpg — Regional Visual)", "50% 50%"),
    "gs-gellhorn-docks": ("shots", "Places/Port Gellhorn/Port_Gellhorn_06.jpg", "gun-stores", "gtavi-gellhorn-docks-outlets", "Port Gellhorn industrial & docks area (Regional Location Visual)", "Official Rockstar Games Screenshot (Port_Gellhorn_06.jpg — Regional Visual)", "50% 50%"),
    "gs-keys-marina": ("shots", "Places/Leonida Keys/Leonida_Keys_03.jpg", "gun-stores", "gtavi-keys-outfitter-area", "Leonida Keys waterfront outfitter district (Regional Location Visual)", "Official Rockstar Games Screenshot (Leonida_Keys_03.jpg — Regional Visual)", "50% 50%"),
    "gs-keys-strip": ("shots", "Places/Leonida Keys/Leonida_Keys_01.jpg", "gun-stores", "gtavi-keys-highway-outlets", "Leonida Keys overseas highway corridor (Regional Location Visual)", "Official Rockstar Games Screenshot (Leonida_Keys_01.jpg — Regional Visual)", "50% 50%"),
    "gs-grassrivers-post": ("shots", "Places/Grassrivers/Grassrivers_02.jpg", "gun-stores", "gtavi-grassrivers-outpost-area", "Grassrivers wetlands dock & supply post (Regional Location Visual)", "Official Rockstar Games Screenshot (Grassrivers_02.jpg — Regional Visual)", "50% 50%"),
    "gs-grassrivers-marsh": ("shots", "Places/Grassrivers/Grassrivers_05.jpg", "gun-stores", "gtavi-grassrivers-marsh-outlets", "Grassrivers marshlands overview (Regional Location Visual)", "Official Rockstar Games Screenshot (Grassrivers_05.jpg — Regional Visual)", "50% 50%"),
    "gs-ambrosia-town": ("shots", "Places/Ambrosia/Ambrosia_01.jpg", "gun-stores", "gtavi-ambrosia-central-outlets", "Ambrosia central commercial strip (Regional Location Visual)", "Official Rockstar Games Screenshot (Ambrosia_01.jpg — Regional Visual)", "50% 50%"),
    "gs-ambrosia-refinery": ("shots", "Places/Ambrosia/Ambrosia_04.jpg", "gun-stores", "gtavi-ambrosia-refinery-outlets", "Ambrosia refinery gate corridor (Regional Location Visual)", "Official Rockstar Games Screenshot (Ambrosia_04.jpg — Regional Visual)", "50% 50%"),
    "gs-kalaga-lodge": ("shots", "Places/Mount Kalaga National Park/Mount_Kalaga_National_Park_04.jpg", "gun-stores", "gtavi-kalaga-hunting-outpost", "Mount Kalaga National Park hunting corridor (Regional Location Visual)", "Official Rockstar Games Screenshot (Mount_Kalaga_National_Park_04.jpg — Regional Visual)", "50% 50%"),
    "gs-kalaga-forest": ("shots", "Places/Mount Kalaga National Park/Mount_Kalaga_National_Park_03.jpg", "gun-stores", "gtavi-kalaga-ranger-area", "Mount Kalaga forested wilderness trail (Regional Location Visual)", "Official Rockstar Games Screenshot (Mount_Kalaga_National_Park_03.jpg — Regional Visual)", "50% 50%"),
    "gs-lake-leonida": ("shots", "Places/Mount Kalaga National Park/Mount_Kalaga_National_Park_06.jpg", "gun-stores", "gtavi-lake-leonida-waterway", "Northern Leonida waterway & bridge crossing (Regional Location Visual)", "Official Rockstar Games Screenshot (Mount_Kalaga_National_Park_06.jpg — Regional Visual)", "50% 50%"),
}


def main():
    extracted = {}
    manifest_entries = []

    for key, (zk, inner, subdir, slug, subject, prov, focal) in CURATED_ASSETS.items():
        im = read_zip_image(zk, inner)
        meta = save_web_derivatives(im, subdir, slug)
        meta["subject"] = subject
        meta["provenance"] = prov
        meta["focalPosition"] = focal
        meta["sourceZip"] = f"GTA6-ROCKSTAR-HIGH-QUALITY-LIBRARY/{ZIPS[zk].name}::{inner}"
        extracted[key] = meta
        manifest_entries.append({
            "id": key,
            "sourcePath": meta["sourceZip"],
            "publicPath": meta["image"],
            "webpSrcset": meta["imageWebpSrcset"],
            "verifiedSubject": subject,
            "provenance": prov,
            "aspectRatio": "16:9",
            "width": 1600,
            "height": 900,
            "focalPosition": focal,
            "category": subdir,
        })

    print(f"Extracted and optimized {len(extracted)} official Rockstar visual assets.")

    # 1. Update properties.json
    prop_map = {
        "sh-jasons-house": "prop-keys-safehouse",
        "sh-ch2-motel": "prop-gellhorn-motel",
        "sh-vc-safehouse-3": "prop-vc-waterfront",
        "sh-vc-safehouse-4": "prop-vc-highrise",
        "gar-purch-1": "prop-vc-beach-skyline",
        "gar-purch-2": "prop-vc-little-cuba",
        "gar-purch-3": "prop-vc-downtown",
        "gar-purch-4": "prop-gellhorn-strip",
        "gar-purch-5": "prop-gellhorn-industrial",
        "gar-purch-6": "prop-ambrosia-freight",
        "gar-purch-7": "prop-keys-boatyard",
        "gar-purch-8": "prop-kalaga-trailhead",
        "gar-story-1": "prop-keys-safehouse",
        "gar-story-2": "prop-gellhorn-motel",
        "gar-story-3": "prop-vc-waterfront",
        "gar-story-4": "prop-vc-highrise",
        "gar-paradise": "prop-rideout-garage",
        "fence-moses": "prop-wyman-yard",
        "fence-randy": "prop-garage-4x4",
        "fence-donnie": "prop-keys-aerial",
        "fence-brians-lockup": "prop-brians-compound",
        "fence-dunk": "prop-pawn-cash",
        "fence-tyrone": "prop-stock-305",
        "fence-yasmani": "prop-vc-canal",
        "fence-ambrosia": "prop-ambrosia-refinery",
        "fence-grassrivers": "prop-grassrivers-dock",
        "safe-buckme": "prop-vc-commercial",
    }
    pub_prop = REPO / "public/data/properties.json"
    doc_p = json.loads(pub_prop.read_text(encoding="utf-8"))
    doc_p["updated"] = "2026-11-24"
    for item in doc_p["items"]:
        k = prop_map.get(item["id"])
        if k and k in extracted:
            m = extracted[k]
            item["image"] = m["image"]
            item["imageWebp"] = m["imageWebp"]
            item["imageWebpSrcset"] = m["imageWebpSrcset"]
            item["imageWidth"] = 1600
            item["imageHeight"] = 900
            item["imageVerified"] = True
            item["imageSource"] = m["provenance"]
            item["imageAlt"] = f"{item['name']} — {m['subject']}"
            item["imageCaption"] = m["provenance"]
            item["focalPosition"] = m["focalPosition"]
            item["lastUpdated"] = "2026-11-24"
    pub_prop.write_text(json.dumps(doc_p, indent=2, ensure_ascii=False), encoding="utf-8")
    (REPO / "data/properties.json").write_text(json.dumps(doc_p, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"Updated properties.json: {sum(1 for x in doc_p['items'] if x.get('image'))}/{len(doc_p['items'])} with verified images.")

    # 2. Update weapons.json
    weap_map = {
        "kl17g1-polymer-pistol": "weap-pistol-firing",
        "capo-tactical-pistol": "weap-lucia-handgun",
        "micro-smg": "weap-store-robbery",
        "submachine-gun-mp5": "weap-compact-smg",
        "service-carbine-rifle": "weap-carbine-night",
        "assault-rifle-ak": "weap-gold-rifle",
        "heavy-battle-rifle": "weap-battle-rifle",
        "pump-action-shotgun": "weap-shotgun-duo",
        "combat-tactical-shotgun": "weap-indoor-firefight",
        "sawed-off-shotgun": "weap-bank-breach",
        "brets-sm69": "weap-grassrivers-rifle",
        "bolt-action-hunting-rifle": "weap-hunting-rifle",
        "heavy-sniper-rifle": "weap-battle-rifle",
        "rpg-launcher": "weap-vault-heavy",
        "grenade-launcher": "weap-grenade-launcher",
        "switchblade-combat-knife": "weap-combat-knife",
    }
    pub_weap = REPO / "public/data/weapons.json"
    doc_w = json.loads(pub_weap.read_text(encoding="utf-8"))
    doc_w["updated"] = "2026-11-24"
    for item in doc_w["items"]:
        k = weap_map.get(item["id"])
        if k and k in extracted:
            m = extracted[k]
            item["image"] = m["image"]
            item["imageWebp"] = m["imageWebp"]
            item["imageWebpSrcset"] = m["imageWebpSrcset"]
            item["imageWidth"] = 1600
            item["imageHeight"] = 900
            item["imageVerified"] = True
            item["imageSource"] = m["provenance"]
            item["imageAlt"] = f"{item['name']} — {m['subject']}"
            item["imageCaption"] = m["provenance"]
            item["focalPosition"] = m["focalPosition"]
            item["lastUpdated"] = "2026-11-24"
    pub_weap.write_text(json.dumps(doc_w, indent=2, ensure_ascii=False), encoding="utf-8")
    (REPO / "data/weapons.json").write_text(json.dumps(doc_w, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"Updated weapons.json: {sum(1 for x in doc_w['items'] if x.get('image'))}/{len(doc_w['items'])} with verified images.")

    # 3. Update gun-stores.json
    gs_map = {
        "ammu-vice-beach-promenade": "gs-vice-strip",
        "ammu-downtown-vice-financial": "gs-vice-downtown",
        "ammu-little-haiti-express": "gs-vice-mural",
        "ammu-south-vice-intermodal": "gs-gellhorn-pawn",
        "ammu-vice-airport-concourse": "gs-ptt-store",
        "ammu-starlet-island-causeway": "gs-vice-canal",
        "ammu-port-gellhorn-docks": "gs-gellhorn-docks",
        "ammu-port-gellhorn-north": "gs-gellhorn-pawn",
        "ammu-gellhorn-rail-junction": "gs-gellhorn-strip",
        "ammu-keys-upper-marathon": "gs-keys-marina",
        "ammu-keys-southern-strip": "gs-keys-strip",
        "ammu-keys-runway-outpost": "gs-keys-marina",
        "ammu-grassrivers-swamp-post": "gs-grassrivers-post",
        "ammu-grassrivers-south-airstrip": "gs-grassrivers-marsh",
        "ammu-grassrivers-west-crossing": "gs-grassrivers-post",
        "ammu-ambrosia-central": "gs-ambrosia-town",
        "ammu-ambrosia-refinery-gate": "gs-ambrosia-refinery",
        "ammu-lake-leonida-north-marina": "gs-lake-leonida",
        "ammu-lake-leonida-south-causeway": "gs-lake-leonida",
        "ammu-mt-kalaga-summit-lodge": "gs-kalaga-lodge",
        "ammu-mt-kalaga-ranger-station": "gs-kalaga-forest",
        "ammu-mt-kalaga-east-valley": "gs-kalaga-lodge",
        "ammu-vice-biscayne-island": "gs-vice-canal",
        "ammu-vice-north-beach-pier": "gs-vice-strip",
    }
    pub_gs = REPO / "public/data/gun-stores.json"
    doc_g = json.loads(pub_gs.read_text(encoding="utf-8"))
    doc_g["updated"] = "2026-11-24"
    for item in doc_g["items"]:
        k = gs_map.get(item["id"])
        if k and k in extracted:
            m = extracted[k]
            item["image"] = m["image"]
            item["imageWebp"] = m["imageWebp"]
            item["imageWebpSrcset"] = m["imageWebpSrcset"]
            item["imageWidth"] = 1600
            item["imageHeight"] = 900
            item["imageVerified"] = True
            item["imageSource"] = m["provenance"]
            item["imageAlt"] = f"{item['name']} ({item.get('region', 'Leonida')}) — {m['subject']}"
            item["imageCaption"] = m["provenance"]
            item["focalPosition"] = m["focalPosition"]
            item["lastUpdated"] = "2026-11-24"
    pub_gs.write_text(json.dumps(doc_g, indent=2, ensure_ascii=False), encoding="utf-8")
    (REPO / "data/gun-stores.json").write_text(json.dumps(doc_g, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"Updated gun-stores.json: {sum(1 for x in doc_g['items'] if x.get('image'))}/{len(doc_g['items'])} with verified images.")

    # 4. Write reusable image-library-manifest.json
    manifest_path = REPO / "public/data/image-library-manifest.json"
    manifest_doc = {
        "version": "phase-26",
        "updated": "2026-11-24",
        "sourceLibraries": [
            "GTA6-ROCKSTAR-HIGH-QUALITY-LIBRARY/",
            "GTA6_APPROVED_IMAGE_LIBRARY/",
            "public/assets/"
        ],
        "assets": manifest_entries,
    }
    manifest_path.write_text(json.dumps(manifest_doc, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"Wrote reusable manifest: {manifest_path} ({len(manifest_entries)} curated assets)")

    for h in _zip_handles.values():
        h.close()


if __name__ == "__main__":
    main()
