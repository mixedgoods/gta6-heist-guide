#!/usr/bin/env python3
"""
Daily $0/Month Auto-Sync for GTA6HeistGuide.com:
1. Mirrors canonical public/data/*.json -> data/*.json ONLY when file contents differ.
2. Refreshes launch_day, banner, and database counts in public/data/live-feed.json
   and data/live-feed.json while STRICTLY PRESERVING existing dispatches, build_version,
   and all custom fields.
3. ZERO-CHANGE COMMIT PROTECTION: Compares meaningful fields (excluding updated_utc)
   before writing. If nothing changed, leaves live-feed.json and sitemap.xml untouched.
"""
import os
import json
import re
from datetime import datetime, timezone

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(ROOT, "data")
PUB_DIR = os.path.join(ROOT, "public")
PUB_DATA_DIR = os.path.join(PUB_DIR, "data")

os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(PUB_DATA_DIR, exist_ok=True)

now_utc = datetime.now(timezone.utc)
launch_utc = datetime(2026, 11, 19, 0, 0, 0, tzinfo=timezone.utc)
launch_day = max(1, (now_utc - launch_utc).days + 1)


def copy_if_different(src, dst):
    if not os.path.exists(src):
        return False
    src_bytes = open(src, "rb").read()
    if os.path.exists(dst):
        dst_bytes = open(dst, "rb").read()
        if src_bytes == dst_bytes:
            return False
    with open(dst, "wb") as f:
        f.write(src_bytes)
    return True


def count_items(path):
    if not os.path.exists(path):
        return 0
    with open(path, "r", encoding="utf-8") as f:
        d = json.load(f)
    return len(d.get("items", [])) if isinstance(d, dict) else len(d)


def strip_volatile(obj):
    if isinstance(obj, dict):
        return {k: strip_volatile(v) for k, v in obj.items() if k != "updated_utc"}
    if isinstance(obj, list):
        return [strip_volatile(x) for x in obj]
    return obj


# 1. Mirror public/data/*.json -> data/*.json ONLY when bytes differ (public/data is canonical)
mirrored = []
for fname in ("properties.json", "animals.json", "discoveries.json", "vehicles.json", "weapons.json", "gun-stores.json", "radio.json"):
    pub_file = os.path.join(PUB_DATA_DIR, fname)
    root_file = os.path.join(DATA_DIR, fname)
    if os.path.exists(pub_file):
        if copy_if_different(pub_file, root_file):
            mirrored.append(fname)
    elif os.path.exists(root_file):
        if copy_if_different(root_file, pub_file):
            mirrored.append(fname)

# 2. Refresh live-feed.json while preserving dispatches & existing schema (zero-change safe)
pub_live_path = os.path.join(PUB_DATA_DIR, "live-feed.json")
root_live_path = os.path.join(DATA_DIR, "live-feed.json")

existing_pub_live = {}
if os.path.exists(pub_live_path):
    try:
        with open(pub_live_path, "r", encoding="utf-8") as f:
            existing_pub_live = json.load(f)
    except Exception:
        existing_pub_live = {}

next_pub_live = json.loads(json.dumps(existing_pub_live)) if isinstance(existing_pub_live, dict) else {}
next_pub_live["site"] = next_pub_live.get("site") or "GTA6HeistGuide.com"
next_pub_live["launch_date_utc"] = next_pub_live.get("launch_date_utc") or "2026-11-19T00:00:00Z"
next_pub_live["launch_day"] = launch_day
next_pub_live["banner"] = f"🔥 GTA 6 Story Mode: LIVE (Day-{launch_day}) · GTA 6 Online: No official release date announced"
next_pub_live["online_status"] = next_pub_live.get("online_status") or "No official release date announced"

counts = dict(next_pub_live.get("counts") or {})
counts["heist_walkthroughs"] = counts.get("heist_walkthroughs", 8)
counts["properties_entries"] = count_items(os.path.join(PUB_DATA_DIR, "properties.json"))
counts["animals_entries"] = count_items(os.path.join(PUB_DATA_DIR, "animals.json"))
counts["wildlife_total_species"] = counts.get(
    "wildlife_total_species",
    "170+ (62 bird species Rockstar developer figure; 60 Birds-tab entries in-game Progress tracker)",
)
next_pub_live["counts"] = counts

live_changed = strip_volatile(existing_pub_live) != strip_volatile(next_pub_live)
if live_changed:
    next_pub_live["updated_utc"] = now_utc.strftime("%Y-%m-%dT%H:%M:%SZ")
    with open(pub_live_path, "w", encoding="utf-8", newline="\n") as f:
        json.dump(next_pub_live, f, indent=2, ensure_ascii=False)
        f.write("\n")

# Keep lightweight mirror in data/live-feed.json synced ONLY if its meaningful summary changed
existing_root_live = {}
if os.path.exists(root_live_path):
    try:
        with open(root_live_path, "r", encoding="utf-8") as f:
            existing_root_live = json.load(f)
    except Exception:
        existing_root_live = {}

next_root_live = {
    "site": next_pub_live["site"],
    "updated_utc": existing_root_live.get("updated_utc") or now_utc.strftime("%Y-%m-%dT%H:%M:%SZ"),
    "launch_date_utc": next_pub_live["launch_date_utc"],
    "launch_day": launch_day,
    "banner": f"🔥 GTA 6 IS LIVE — DAY-{launch_day} HEISTS, CHEATS, MAPS & DROPS",
    "online_status": next_pub_live["online_status"],
    "counts": {
        "heist_walkthroughs": counts["heist_walkthroughs"],
        "properties_entries": counts["properties_entries"],
        "animals_entries": counts["animals_entries"],
        "wildlife_total_species": counts["wildlife_total_species"],
    },
}

root_live_changed = strip_volatile(existing_root_live) != strip_volatile(next_root_live)
if root_live_changed:
    next_root_live["updated_utc"] = now_utc.strftime("%Y-%m-%dT%H:%M:%SZ")
    with open(root_live_path, "w", encoding="utf-8", newline="\n") as f:
        json.dump(next_root_live, f, indent=2, ensure_ascii=False)
        f.write("\n")

# 3. Preserve accurate per-URL <lastmod> dates in public/sitemap.xml (never fake freshness)
sitemap_path = os.path.join(PUB_DIR, "sitemap.xml")
if os.path.exists(sitemap_path):
    with open(sitemap_path, "r", encoding="utf-8") as f:
        sm_xml = f.read()
    url_count = len(re.findall(r"<loc>", sm_xml))
    status = "UPDATED" if (live_changed or root_live_changed or mirrored) else "NO CHANGES"
    print(f"[OK] Daily launch sync complete ({status}; DAY-{launch_day}, mirrored={len(mirrored)}, {url_count} sitemap URLs preserved)")
else:
    print(f"[WARN] public/sitemap.xml not found at {sitemap_path}")
