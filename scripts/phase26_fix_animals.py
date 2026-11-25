#!/usr/bin/env python3
"""
Phase 26 — Section 3: Fix Animals Database Images & Evidence Accuracy
- Creates a clean alligator-focused 16:9 crop from official Rockstar 4K Grassrivers_01.jpg
  (preserving original gtavi-american-alligator-grassrivers-dock.jpg untouched).
- Corrects an-snake (Marsh Snake / Leonida Viper -> Unidentified Leonida Snake),
  removing unsupported taxonomy (Agkistrodon / Crotalus sp.), venom, rattle,
  Mount Kalaga habitat, and target-deck claims.
- Records exact official Rockstar screenshot filenames in provenance fields for all 7 Tier A entries.
- Synchronizes public/data/animals.json, data/animals.json, and SSR cards in public/animals.html.
"""

import html
import io
import json
import re
import zipfile
from pathlib import Path
from PIL import Image

REPO = Path(r"C:\Users\Shawn\Desktop\gta6heistguide")
ANIM_DIR = REPO / "public" / "assets" / "images" / "animals"
ZIP_PATH = REPO / "GTA6-ROCKSTAR-HIGH-QUALITY-LIBRARY" / "GTAVI_Screenshots.zip"


def build_alligator_closeup():
    """Extract 4K Grassrivers_01.jpg in memory and save a 16:9 alligator-focused crop."""
    with zipfile.ZipFile(ZIP_PATH, "r") as zf:
        data = zf.read("Places/Grassrivers/Grassrivers_01.jpg")
    im = Image.open(io.BytesIO(data)).convert("RGB")
    w, h = im.size  # 3840 x 2160
    # Alligator spans roughly x: 5%..62%, y: 48%..100% (16:9 box: 2240 x 1260)
    cw = int(w * 0.60)
    ch = int(cw * 9 / 16)
    left = int(w * 0.02)
    top = h - ch
    crop = im.crop((left, top, left + cw, h))

    base_name = "gtavi-american-alligator-grassrivers-closeup"
    # Save 1600x900 JPG + 800/1200/1600 WebP
    im1600 = crop.resize((1600, 900), Image.Resampling.LANCZOS)
    im1600.save(ANIM_DIR / f"{base_name}.jpg", "JPEG", quality=88, optimize=True)
    for width in (800, 1200, 1600):
        height = int(width * 9 / 16)
        resized = crop.resize((width, height), Image.Resampling.LANCZOS)
        resized.save(ANIM_DIR / f"{base_name}-{width}.webp", "WEBP", quality=85)
    print(f"Generated alligator closeup derivatives from official Grassrivers_01.jpg ({w}x{h} -> crop {cw}x{ch})")


def update_animals_json():
    pub_path = REPO / "public" / "data" / "animals.json"
    data_path = REPO / "data" / "animals.json"

    with open(pub_path, encoding="utf-8") as f:
        doc = json.load(f)

    doc["updated"] = "2026-11-24"
    doc["note"] = (
        "49 catalogued wildlife entries: 7 VERIFIED GTA VI GAMEPLAY entries "
        "(authenticated against Rockstar Games official GTA VI Press Kit screenshots) "
        "and 42 REAL-WORLD SPECIES REFERENCE entries (licensed Wikimedia wildlife photographs; "
        "GTA VI presence unconfirmed). Only independently verified in-game entries count toward "
        "the verified gameplay tier."
    )

    provenance_map = {
        "an-alligator": "Official Rockstar Games GTA VI Screenshot (Grassrivers_01.jpg)",
        "an-panther": "Official Rockstar Games GTA VI Screenshot (Mount_Kalaga_National_Park_05.jpg)",
        "an-green-iguana": "Official Rockstar Games GTA VI Screenshot (Leonida_Keys_06.jpg)",
        "an-snake": "Official Rockstar Games GTA VI Screenshot (Grassrivers_07.jpg)",
        "an-dolphin": "Official Rockstar Games GTA VI Screenshot (Leonida_Keys_05.jpg)",
        "an-sea-turtle": "Official Rockstar Games GTA VI Screenshot (Leonida_Keys_04.jpg)",
        "an-lionfish": "Official Rockstar Games GTA VI Screenshot (Leonida_Keys_07.jpg)",
    }

    for item in doc["items"]:
        aid = item.get("id")
        if aid in provenance_map:
            item["imageSource"] = provenance_map[aid]
            item["lastUpdated"] = "2026-11-24"

        if aid == "an-alligator":
            base = "/assets/images/animals/gtavi-american-alligator-grassrivers-closeup"
            item["image"] = f"{base}.jpg"
            item["imageWebp"] = f"{base}-1600.webp"
            item["imageWebpSrcset"] = f"{base}-800.webp 800w, {base}-1200.webp 1200w, {base}-1600.webp 1600w"
            item.pop("imageAvifSrcset", None)
            item["imageAlt"] = (
                "Close-up of an American Alligator resting on a wooden airboat deck in Grassrivers "
                "(cropped from official Rockstar Games GTA VI screenshot Grassrivers_01.jpg)"
            )
            item["imageCaption"] = (
                "American Alligator on a Grassrivers airboat deck — official Rockstar Games GTA VI "
                "screenshot (Grassrivers_01.jpg)."
            )
            item["focalPosition"] = "50% 60%"

        elif aid == "an-panther":
            item["imageAlt"] = (
                "Florida Panther stalking across a sunlit creek in Mount Kalaga National Park with "
                "deer on the opposite bank (official Rockstar Games GTA VI screenshot Mount_Kalaga_National_Park_05.jpg)"
            )
            item["imageCaption"] = (
                "Florida Panther crossing a Mount Kalaga National Park stream — official Rockstar Games "
                "GTA VI screenshot (Mount_Kalaga_National_Park_05.jpg)."
            )
            item["focalPosition"] = "25% 70%"

        elif aid == "an-green-iguana":
            item["imageAlt"] = (
                "Green Iguana clinging to coastal rocks overlooking turquoise Leonida Keys water "
                "(official Rockstar Games GTA VI screenshot Leonida_Keys_06.jpg)"
            )
            item["imageCaption"] = (
                "Green Iguana on Leonida Keys coastal rocks — official Rockstar Games GTA VI "
                "screenshot (Leonida_Keys_06.jpg)."
            )
            item["focalPosition"] = "60% 40%"

        elif aid == "an-snake":
            item["name"] = "Unidentified Leonida Snake"
            item["scientificName"] = "Unidentified species (Serpentes)"
            item["region"] = "Grassrivers"
            item["habitat"] = "Observed at a Grassrivers wetlands camp (wild spawn habitats unconfirmed)"
            item["danger"] = "Unconfirmed (Venom & wild behavior unverified)"
            item["tags"] = []
            item["notes"] = (
                "Large patterned snake seen draped over a resident's shoulder at a Grassrivers wetlands camp "
                "in official Rockstar Games GTA VI media (Grassrivers_07.jpg). Exact species taxonomy, "
                "venom classification, rattling behavior, and wild spawn habitats are not independently confirmed."
            )
            item["imageAlt"] = (
                "Large patterned unidentified Leonida snake draped over a resident's shoulder at a "
                "Grassrivers wetlands camp (official Rockstar Games GTA VI screenshot Grassrivers_07.jpg)"
            )
            item["imageCaption"] = (
                "Unidentified patterned snake at a Grassrivers camp — official Rockstar Games GTA VI "
                "screenshot (Grassrivers_07.jpg). Species taxonomy and venom status unconfirmed."
            )
            item["huntingStatus"] = "Observed in Rockstar GTA VI Press Kit (Grassrivers_07.jpg; species & hunting status unconfirmed)"
            item["focalPosition"] = "28% 45%"

    with open(pub_path, "w", encoding="utf-8") as f:
        json.dump(doc, f, indent=2, ensure_ascii=False)
    if data_path.exists():
        with open(data_path, "w", encoding="utf-8") as f:
            json.dump(doc, f, indent=2, ensure_ascii=False)
    print(f"Updated {pub_path} and {data_path}")
    return doc


def render_ssr_card(a: dict) -> str:
    aid = html.escape(a.get("id", ""))
    tier = a.get("imageTier", "C")
    is_ref = bool(a.get("isRealWorldReference", tier != "A"))
    verified_attr = "false" if is_ref else "true"
    img = html.escape(a.get("image", ""))
    alt = html.escape(a.get("imageAlt", a.get("name", "")))
    focal = a.get("focalPosition", "50% 50%")
    sources = []
    if a.get("imageAvifSrcset"):
        sources.append(
            f'<source type="image/avif" srcset="{html.escape(a["imageAvifSrcset"])}" '
            f'sizes="(max-width: 640px) 92vw, (max-width: 1100px) 46vw, 360px">'
        )
    if a.get("imageWebpSrcset"):
        sources.append(
            f'<source type="image/webp" srcset="{html.escape(a["imageWebpSrcset"])}" '
            f'sizes="(max-width: 640px) 92vw, (max-width: 1100px) 46vw, 360px">'
        )
    pic_html = (
        f'<picture>{"".join(sources)}'
        f'<img src="{img}" alt="{alt}" width="1600" height="900" loading="lazy" decoding="async" '
        f'style="object-position:{html.escape(focal)};"></picture>'
    )
    if is_ref:
        badge = (
            '<span class="db-card-verified-shot db-card-tier-c-ref" data-tier="C" '
            'title="Real-World Species Reference — GTA VI Presence Unconfirmed">'
            '&#128247; Real-World Reference</span>'
        )
        lic = a.get("tierCLicense") or {}
        creator = lic.get("creatorName", "")
        lic_name = lic.get("licenseName", "")
        cap = (
            f"Real-World Species Reference &mdash; GTA VI Presence Unconfirmed &middot; "
            f"Photo: {html.escape(creator)} ({html.escape(lic_name)})"
            if creator else html.escape(a.get("imageCaption", ""))
        )
    else:
        badge = '<span class="db-card-verified-shot" data-tier="A">&#10003; Verified GTA VI Screenshot</span>'
        cap = html.escape(a.get("imageCaption", ""))

    cat = html.escape(a.get("category", ""))
    region = html.escape(a.get("region", ""))
    name = html.escape(a.get("name", ""))
    sci = html.escape(a.get("scientificName", ""))
    danger = html.escape(a.get("danger", ""))
    notes = html.escape(a.get("notes", ""))

    tag_pills = []
    if is_ref:
        tag_pills.append(
            '<span class="species-tag-badge" style="background:rgba(255,184,0,0.14); '
            'border-color:rgba(255,184,0,0.45); color:#fbbf24;">&#9888; GTA VI Presence Unconfirmed</span>'
        )
    else:
        for t in a.get("tags", []):
            if t == "target-deck":
                tag_pills.append('<span class="species-tag-badge species-tag-deck">&#127919; Target Deck</span>')
            elif t == "legendary-hunter":
                tag_pills.append('<span class="species-tag-badge species-tag-legendary">&#128081; Legendary Hunter</span>')

    tags_html = (
        f'<div style="display:flex; flex-wrap:wrap; gap:0.28rem; margin-bottom:0.35rem;">{"".join(tag_pills)}</div>'
        if tag_pills else ""
    )

    map_link = ""
    if a.get("mapPinId") and not is_ref:
        pin = html.escape(a["mapPinId"])
        map_link = (
            f'<div style="margin-top:0.4rem;">'
            f'<a href="/map?pin={pin}" onclick="event.stopPropagation();" '
            f'style="font-size:0.74rem; color:var(--neon-cyan); font-weight:800; text-decoration:none;">'
            f'&#128205; View on Leonida Map &rarr;</a></div>'
        )

    return (
        f'        <article class="db-card" data-ssr-card="animal" data-id="{aid}" '
        f'data-image-tier="{html.escape(tier)}" data-verified-gta6="{verified_attr}">'
        f'<figure style="margin:0;"><div class="db-card-img">{pic_html}{badge}'
        f'<span class="db-card-chip">{cat}</span>'
        f'<span class="db-card-region">&#128205; {region}</span></div>'
        f'<figcaption class="db-card-source-caption" style="font-size:0.68rem; color:#94a3b8; '
        f'padding:0.32rem 0.75rem; background:rgba(6,10,20,0.78); border-top:1px solid rgba(255,255,255,0.06); '
        f'line-height:1.35;">{cap}</figcaption></figure>'
        f'<div class="db-card-body">'
        f'<h3 style="margin:0 0 0.1rem; font-size:0.95rem; color:#fff;">{name}</h3>'
        f'<div style="font-size:0.73rem; color:#94a3b8; font-style:italic; margin-bottom:0.28rem;">{sci}</div>'
        f'{tags_html}'
        f'<div style="font-size:0.74rem; color:var(--neon-amber); font-weight:700; margin-bottom:0.25rem;">Status: {danger}</div>'
        f'<p style="margin:0 0 0.5rem; font-size:0.78rem; color:#94a3b8; line-height:1.45;">{notes}</p>'
        f'{map_link}'
        f'</div></article>'
    )


def update_animals_html(doc: dict):
    html_path = REPO / "public" / "animals.html"
    txt = html_path.read_text(encoding="utf-8")

    # Replace SSR grid content between <div id="animGrid" ...> and </div>\n\n<section
    cards_html = "\n".join(render_ssr_card(a) for a in doc["items"])
    pattern = re.compile(
        r'(<div id="animGrid"[^>]*>)\s*.*?\s*(</div>\s*\n\s*<section class="g-section" id="phase10-wildlife-profiles")',
        re.S,
    )
    new_txt, count = pattern.subn(rf'\1\n{cards_html}\n    \2', txt, count=1)
    if count != 1:
        raise RuntimeError(f"Failed to replace animGrid in animals.html (matches={count})")

    # Also update og:image / twitter:image to the alligator closeup for better social preview
    new_txt = new_txt.replace(
        "gtavi-american-alligator-grassrivers-dock.jpg",
        "gtavi-american-alligator-grassrivers-closeup.jpg",
    )
    new_txt = new_txt.replace('"dateModified": "2026-11-23"', '"dateModified": "2026-11-24"')

    # Ensure client-side renderer respects focalPosition if present
    if "a.focalPosition" not in new_txt:
        new_txt = new_txt.replace(
            'loading="lazy" decoding="async">',
            'loading="lazy" decoding="async" style="object-position:${a.focalPosition || \'50% 50%\'};">',
        )

    html_path.write_text(new_txt, encoding="utf-8")
    print(f"Updated {html_path} ({len(doc['items'])} SSR cards synchronized)")


if __name__ == "__main__":
    build_alligator_closeup()
    doc = update_animals_json()
    update_animals_html(doc)
