#!/usr/bin/env python3
"""
Phase 26 — Complete Image Inventory & Contact Sheet Generator
Scans all three GTA image folders without modifying or deleting any original files:
  1. GTA6-ROCKSTAR-HIGH-QUALITY-LIBRARY/ (ZIP archives inspected non-destructively)
  2. GTA6_APPROVED_IMAGE_LIBRARY/
  3. public/assets/ (and assets/)

Outputs:
  - seo_reports/phase26/phase26-image-asset-audit.csv
  - seo_reports/phase26/contact_sheets/*.jpg
"""

import csv
import hashlib
import io
import json
import math
import os
import zipfile
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

REPO = Path(r"C:\Users\Shawn\Desktop\gta6heistguide")
OUT_DIR = REPO / "seo_reports" / "phase26"
CS_DIR = OUT_DIR / "contact_sheets"
OUT_DIR.mkdir(parents=True, exist_ok=True)
CS_DIR.mkdir(parents=True, exist_ok=True)

IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif", ".svg"}


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def get_dims_from_bytes(data: bytes, ext: str):
    if ext == ".svg":
        return (0, 0, "vector")
    try:
        with Image.open(io.BytesIO(data)) as im:
            w, h = im.size
            ar = f"{w/h:.2f}:1" if h else ""
            return (w, h, ar)
    except Exception:
        return (0, 0, "unreadable")


def classify_subject_and_pages(rel_path: str, fname: str):
    lp = rel_path.lower().replace("\\", "/")
    fn = fname.lower()
    if "gta6-rockstar-high-quality-library" in lp:
        prov = "Official Rockstar Games Press Kit (ZIP)"
        status = "Official Rockstar"
    elif "review_candidates_unverified" in lp:
        prov = "GTA6_APPROVED_IMAGE_LIBRARY/review_candidates_unverified"
        status = "Unverified Candidate"
    elif "gta6_approved_image_library" in lp:
        prov = "GTA6_APPROVED_IMAGE_LIBRARY"
        status = "Approved Library"
    elif "public/assets/gear" in lp or "assets/gear" in lp:
        prov = "Local Gear Asset"
        status = "Product / Reference"
    else:
        prov = "Live Site Asset (public/assets)"
        status = "Live Site Asset"

    # Subject & region inference
    if "animal" in lp or fn.startswith("an-"):
        cat = "Animals & Wildlife"
        pages = "/animals"
    elif "vehicle" in lp or any(k in fn for k in ["cheetah", "stanier", "squalo", "buggy", "ganado", "wyman", "rideout", "car_collection"]):
        cat = "Cars, Trucks, Boats & Aircraft"
        pages = "/vehicles"
    elif "weapon" in lp or "revolver" in fn or "goodtime_gear" in fn:
        cat = "Weapons & Attachments"
        pages = "/weapons"
    elif "gun-store" in lp or "ammu-nation" in fn or "ptt_store" in fn:
        cat = "Gun Stores & Businesses"
        pages = "/weapons#gun-stores, /gta-6-database"
    elif "propert" in lp or "safehouse" in fn or "saras_salon" in fn or "stock_305" in fn or "one_eyed_willie" in fn:
        cat = "Properties & Buildings"
        pages = "/properties"
    elif "heist" in lp or "raul_bautista" in fn:
        cat = "Characters & Heists"
        pages = "/, /heists, /heist-planner"
    elif "radio" in lp:
        cat = "Radio Stations"
        pages = "/radio"
    elif "vice_city" in fn or "vice-city" in fn:
        cat = "Vice City & Leonida Regions"
        pages = "/, /locations/vice-city, /map"
    elif "leonida_keys" in fn or "leonida-keys" in fn:
        cat = "Vice City & Leonida Regions"
        pages = "/locations/leonida-keys, /animals, /map"
    elif "grassrivers" in fn:
        cat = "Vice City & Leonida Regions"
        pages = "/locations/grassrivers, /animals, /map"
    elif "mount_kalaga" in fn or "kalaga" in fn:
        cat = "Vice City & Leonida Regions"
        pages = "/locations/mount-kalaga, /animals, /map"
    elif "port_gellhorn" in fn or "gellhorn" in fn:
        cat = "Vice City & Leonida Regions"
        pages = "/port-gellhorn, /properties, /map"
    elif "ambrosia" in fn:
        cat = "Vice City & Leonida Regions"
        pages = "/locations/ambrosia, /properties, /map"
    elif "people/" in lp or fn.startswith("char-"):
        cat = "Characters & Heists"
        pages = "/crew-database, /heists, /"
    elif "gear" in lp:
        cat = "Affiliate Gear & Accessories"
        pages = "/affiliates-gear, /"
    elif "map" in lp or "pins" in lp:
        cat = "Map & Pins"
        pages = "/map"
    else:
        cat = "Other GTA VI Imagery"
        pages = "/, /guides"

    return cat, prov, status, pages


def make_contact_sheet(title: str, items: list, out_path: Path, cols: int = 5, thumb_w: int = 320, thumb_h: int = 180):
    """items: list of (label, PIL.Image)"""
    if not items:
        return
    pad = 12
    label_h = 34
    header_h = 46
    rows = math.ceil(len(items) / cols)
    W = pad + cols * (thumb_w + pad)
    H = header_h + pad + rows * (thumb_h + label_h + pad)
    sheet = Image.new("RGB", (W, H), (18, 20, 28))
    draw = ImageDraw.Draw(sheet)
    try:
        font_hdr = ImageFont.truetype("arial.ttf", 22)
        font_lbl = ImageFont.truetype("arial.ttf", 12)
    except Exception:
        font_hdr = ImageFont.load_default()
        font_lbl = ImageFont.load_default()

    draw.text((pad, 12), f"{title} ({len(items)} images)", fill=(255, 220, 120), font=font_hdr)

    for idx, (label, img) in enumerate(items):
        r = idx // cols
        c = idx % cols
        x = pad + c * (thumb_w + pad)
        y = header_h + pad + r * (thumb_h + label_h + pad)
        # Fit inside thumb_w x thumb_h preserving aspect ratio
        im = img.convert("RGB")
        im.thumbnail((thumb_w, thumb_h), Image.Resampling.LANCZOS)
        ox = x + (thumb_w - im.width) // 2
        oy = y + (thumb_h - im.height) // 2
        draw.rectangle([x, y, x + thumb_w, y + thumb_h], fill=(8, 10, 14), outline=(55, 65, 85))
        sheet.paste(im, (ox, oy))
        # Wrap label to 2 lines max
        lbl = label
        if len(lbl) > 42:
            lbl = lbl[:42] + "\n" + lbl[42:82]
        draw.text((x + 2, y + thumb_h + 4), lbl, fill=(225, 232, 240), font=font_lbl)

    sheet.save(out_path, "JPEG", quality=85)
    print(f"Saved contact sheet: {out_path.name} ({len(items)} items, {W}x{H})")


def main():
    rows = []

    # 1. Folder 1: GTA6-ROCKSTAR-HIGH-QUALITY-LIBRARY (ZIPs)
    rockstar_dir = REPO / "GTA6-ROCKSTAR-HIGH-QUALITY-LIBRARY"
    rockstar_places = []
    rockstar_people = []
    rockstar_packs = []

    for zpath in sorted(rockstar_dir.glob("*.zip")):
        with zipfile.ZipFile(zpath, "r") as zf:
            for info in sorted(zf.infolist(), key=lambda i: i.filename):
                if info.is_dir():
                    continue
                ext = Path(info.filename).suffix.lower()
                if ext not in IMAGE_EXTS:
                    continue
                data = zf.read(info.filename)
                w, h, ar = get_dims_from_bytes(data, ext)
                rel = f"GTA6-ROCKSTAR-HIGH-QUALITY-LIBRARY/{zpath.name}::{info.filename}"
                fname = Path(info.filename).name
                cat, prov, status, pages = classify_subject_and_pages(rel, fname)
                rows.append({
                    "folder_group": "1_GTA6-ROCKSTAR-HIGH-QUALITY-LIBRARY",
                    "filename": fname,
                    "relative_path": rel,
                    "width": w,
                    "height": h,
                    "aspect_ratio": ar,
                    "file_size_bytes": len(data),
                    "format": ext.lstrip(".").upper(),
                    "sha256": sha256_bytes(data),
                    "category": cat,
                    "provenance": prov,
                    "verification_tier": status,
                    "intended_pages": pages,
                })
                try:
                    im = Image.open(io.BytesIO(data))
                    im.load()
                    if zpath.name == "GTAVI_Screenshots.zip":
                        if info.filename.startswith("Places/"):
                            rockstar_places.append((info.filename.replace("Places/", ""), im))
                        else:
                            rockstar_people.append((info.filename.replace("People/", ""), im))
                    else:
                        rockstar_packs.append((f"{zpath.stem}/{fname}", im))
                except Exception:
                    pass

    # 2. Folder 2: GTA6_APPROVED_IMAGE_LIBRARY
    approved_dir = REPO / "GTA6_APPROVED_IMAGE_LIBRARY"
    for p in sorted(approved_dir.rglob("*")):
        if not p.is_file():
            continue
        ext = p.suffix.lower()
        if ext not in IMAGE_EXTS:
            continue
        if "contact_sheets" in p.parts:
            continue
        data = p.read_bytes()
        w, h, ar = get_dims_from_bytes(data, ext)
        rel = str(p.relative_to(REPO)).replace("\\", "/")
        cat, prov, status, pages = classify_subject_and_pages(rel, p.name)
        rows.append({
            "folder_group": "2_GTA6_APPROVED_IMAGE_LIBRARY",
            "filename": p.name,
            "relative_path": rel,
            "width": w,
            "height": h,
            "aspect_ratio": ar,
            "file_size_bytes": len(data),
            "format": ext.lstrip(".").upper(),
            "sha256": sha256_bytes(data),
            "category": cat,
            "provenance": prov,
            "verification_tier": status,
            "intended_pages": pages,
        })

    # 3. Folder 3: public/assets (and root assets/)
    for root_name in ["public/assets", "assets"]:
        d = REPO / root_name
        if not d.exists():
            continue
        for p in sorted(d.rglob("*")):
            if not p.is_file():
                continue
            ext = p.suffix.lower()
            if ext not in IMAGE_EXTS:
                continue
            data = p.read_bytes()
            w, h, ar = get_dims_from_bytes(data, ext)
            rel = str(p.relative_to(REPO)).replace("\\", "/")
            cat, prov, status, pages = classify_subject_and_pages(rel, p.name)
            rows.append({
                "folder_group": f"3_{root_name}",
                "filename": p.name,
                "relative_path": rel,
                "width": w,
                "height": h,
                "aspect_ratio": ar,
                "file_size_bytes": len(data),
                "format": ext.lstrip(".").upper(),
                "sha256": sha256_bytes(data),
                "category": cat,
                "provenance": prov,
                "verification_tier": status,
                "intended_pages": pages,
            })

    # Write CSV
    csv_path = OUT_DIR / "phase26-image-asset-audit.csv"
    fieldnames = [
        "folder_group", "filename", "relative_path", "width", "height",
        "aspect_ratio", "file_size_bytes", "format", "sha256",
        "category", "provenance", "verification_tier", "intended_pages"
    ]
    with open(csv_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    print(f"Wrote {len(rows)} image records to {csv_path}")

    # Build Contact Sheets
    make_contact_sheet("Folder 1: Rockstar Official — Leonida Places", rockstar_places, CS_DIR / "01_rockstar_places_leonida.jpg", cols=5)
    make_contact_sheet("Folder 1: Rockstar Official — People & Characters (Part 1)", rockstar_people[:40], CS_DIR / "02a_rockstar_people_part1.jpg", cols=5)
    make_contact_sheet("Folder 1: Rockstar Official — People & Characters (Part 2)", rockstar_people[40:], CS_DIR / "02b_rockstar_people_part2.jpg", cols=5)
    make_contact_sheet("Folder 1: Rockstar Official — Ultimate Edition & Vintage Vice City", rockstar_packs, CS_DIR / "03_rockstar_ultimate_and_vintage.jpg", cols=5)

    # Current Animals Tier A + properties + weapons
    with open(REPO / "public/data/animals.json", encoding="utf-8") as f:
        animals_data = json.load(f)["items"]
    tier_a_imgs = []
    for idx, a in enumerate(animals_data):
        if a.get("imageTier") == "A" or not a.get("isRealWorldReference", True) or idx < 8:
            img_rel = (a.get("image") or "").lstrip("/")
            p = REPO / "public" / img_rel
            if p.exists():
                try:
                    im = Image.open(p)
                    im.load()
                    tier_a_imgs.append((f"#{idx+1} {a['name']} ({p.name})", im))
                except Exception:
                    pass
    make_contact_sheet("Animals Current Tier A / First 8 Entries", tier_a_imgs, CS_DIR / "04_animals_tier_a_current.jpg", cols=4, thumb_w=380, thumb_h=220)

    # Properties current
    prop_imgs = []
    for p in sorted((REPO / "public/assets/images/properties").glob("*")):
        if p.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp"}:
            try:
                im = Image.open(p); im.load()
                prop_imgs.append((p.name, im))
            except Exception:
                pass
    make_contact_sheet("Current Properties Images (public/assets/images/properties)", prop_imgs, CS_DIR / "05_properties_current.jpg", cols=4, thumb_w=340, thumb_h=190)

    # Weapons current
    weap_imgs = []
    for p in sorted((REPO / "public/assets/images/weapons").glob("*")):
        if p.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp"}:
            try:
                im = Image.open(p); im.load()
                weap_imgs.append((p.name, im))
            except Exception:
                pass
    make_contact_sheet("Current Weapons Images (public/assets/images/weapons)", weap_imgs, CS_DIR / "06_weapons_current.jpg", cols=3, thumb_w=360, thumb_h=200)


if __name__ == "__main__":
    main()
