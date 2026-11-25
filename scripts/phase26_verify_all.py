#!/usr/bin/env python3
"""
Phase 26 — Automated Integrity, Image Path, Affiliate Tag & SEO Safeguard Check
"""
import json
import re
from pathlib import Path

REPO = Path(r"C:\Users\Shawn\Desktop\gta6heistguide")
PUB = REPO / "public"


def main():
    missing = []
    counts = {}
    for fn in [
        "animals.json", "properties.json", "vehicles.json",
        "weapons.json", "gun-stores.json", "radio.json",
        "image-library-manifest.json",
    ]:
        d = json.loads((PUB / "data" / fn).read_text(encoding="utf-8"))
        items = d.get("items") or d.get("assets") or []
        with_img = sum(1 for x in items if x.get("image") or x.get("publicPath"))
        counts[fn] = (with_img, len(items))
        for it in items:
            for k in ("image", "imageWebp", "publicPath"):
                v = it.get(k)
                if v and v.startswith("/"):
                    p = PUB / v.lstrip("/").split("?")[0]
                    if not p.exists():
                        missing.append((fn, it.get("id"), k, v))
            for k in ("imageWebpSrcset", "imageAvifSrcset", "webpSrcset"):
                v = it.get(k) or ""
                for part in v.split(","):
                    u = part.strip().split(" ")[0]
                    if u.startswith("/"):
                        p = PUB / u.lstrip("/").split("?")[0]
                        if not p.exists():
                            missing.append((fn, it.get("id"), k, u))

    print("=== DATABASE IMAGE COVERAGE ===")
    for fn, (wi, tot) in counts.items():
        print(f"  {fn}: {wi}/{tot}")
    print(f"Missing JSON image files: {len(missing)}")
    for m in missing[:10]:
        print("  MISSING:", m)

    # Check HTML img src across core pages + enriched guides
    html_missing = []
    core = [
        "index.html", "animals.html", "properties.html", "vehicles.html",
        "weapons.html", "weapons-bonuses.html", "radio.html", "map.html",
        "gta-6-database/index.html", "port-gellhorn.html",
        "gta-6-money-guide/index.html", "gta-6-property-ownership/index.html",
        "gta-6-vehicles-guide/index.html",
    ]
    for rel in core:
        p = PUB / rel
        if not p.exists():
            continue
        t = p.read_text(encoding="utf-8", errors="ignore")
        for m in re.finditer(r'<img[^>]+src=["\'](/[^"\']+)["\']', t):
            u = m.group(1).split("?")[0]
            if not (PUB / u.lstrip("/")).exists():
                html_missing.append((rel, u))
    print(f"Missing HTML <img> files on core pages: {len(html_missing)}")
    for m in html_missing[:10]:
        print("  HTML MISSING:", m)

    # Verify Amazon links on index.html
    idx = (PUB / "index.html").read_text(encoding="utf-8")
    amz = re.findall(r'https://www\.amazon\.com/[^\s"\'<>]+', idx)
    bad_tag = [u for u in amz if "tag=gta6heistguid-20" not in u]
    print(f"Homepage Amazon links: {len(amz)} | missing tag: {len(bad_tag)}")
    for u in amz:
        print("  AMZ:", u)

    # Verify snake fix in animals.json and animals.html
    anim_txt = (PUB / "animals.html").read_text(encoding="utf-8")
    assert "Agkistrodon" not in anim_txt, "Unsupported snake taxonomy still in animals.html!"
    assert "Unidentified Leonida Snake" in anim_txt, "Unidentified Leonida Snake missing from animals.html!"
    assert "gtavi-american-alligator-grassrivers-closeup.jpg" in anim_txt, "Alligator closeup missing!"
    assert "VERIFIED NOV 23, 2026" not in idx, "Stale VERIFIED NOV 23, 2026 date still on homepage!"
    assert "UPDATED DAILY" not in idx, "Stale UPDATED DAILY claim still on homepage!"
    print("ALL ASSERTIONS PASSED!")

    if missing or html_missing or bad_tag:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
