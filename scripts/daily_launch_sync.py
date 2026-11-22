#!/usr/bin/env python3
"""
Daily $0/Month Auto-Sync for GTA6HeistGuide.com:
1. Refreshes data/live-feed.json and public/data/live-feed.json with live Launch Day counter.
2. Syncs data/properties.json and data/animals.json <-> public/data/.
3. Regenerates public/sitemap.xml with today's <lastmod> dates covering all live pages,
   all 8 /heists/*.html walkthroughs, /properties.html, /animals.html, /save-planner,
   /cheats, /settings, and /cash-guide.
"""
import os
import json
import shutil
from datetime import datetime, timezone

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(ROOT, "data")
PUB_DIR = os.path.join(ROOT, "public")
PUB_DATA_DIR = os.path.join(PUB_DIR, "data")
BASE_URL = "https://www.gta6heistguide.com"

os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(PUB_DATA_DIR, exist_ok=True)

now_utc = datetime.now(timezone.utc)
today_str = now_utc.strftime("%Y-%m-%d")
launch_utc = datetime(2026, 11, 19, 0, 0, 0, tzinfo=timezone.utc)
launch_day = max(1, (now_utc - launch_utc).days + 1)

# 1. Sync public/data/*.json -> data/*.json (public/data is canonical source of truth; NEVER overwrite verified animals.json with stale data/)
for fname in ("properties.json", "animals.json", "discoveries.json"):
    pub_file = os.path.join(PUB_DATA_DIR, fname)
    root_file = os.path.join(DATA_DIR, fname)
    if os.path.exists(pub_file):
        shutil.copy2(pub_file, root_file)
    elif os.path.exists(root_file):
        shutil.copy2(root_file, pub_file)

def count_items(path):
    if not os.path.exists(path):
        return 0
    with open(path, "r", encoding="utf-8") as f:
        d = json.load(f)
    return len(d.get("items", [])) if isinstance(d, dict) else len(d)

# 2. Refresh live-feed.json
live_feed = {
    "site": "GTA6HeistGuide.com",
    "updated_utc": now_utc.strftime("%Y-%m-%dT%H:%M:%SZ"),
    "launch_date_utc": "2026-11-19T00:00:00Z",
    "launch_day": launch_day,
    "banner": f"🔥 GTA 6 IS LIVE — DAY-{launch_day} HEISTS, CHEATS, MAPS & DROPS",
    "online_status": "No official release date announced",
    "counts": {
        "heist_walkthroughs": 8,
        "properties_entries": count_items(os.path.join(PUB_DATA_DIR, "properties.json")),
        "animals_entries": count_items(os.path.join(PUB_DATA_DIR, "animals.json")),
        "wildlife_total_species": "170+ (62 bird species Rockstar developer figure; 60 Birds-tab entries in-game Progress tracker)"
    }
}
for target in (os.path.join(DATA_DIR, "live-feed.json"), os.path.join(PUB_DATA_DIR, "live-feed.json")):
    with open(target, "w", encoding="utf-8", newline="\n") as f:
        json.dump(live_feed, f, indent=2, ensure_ascii=False)

# 3. Preserve accurate per-URL <lastmod> dates in public/sitemap.xml (NEVER fake freshness when content didn't change)
import re
sitemap_path = os.path.join(PUB_DIR, "sitemap.xml")
if os.path.exists(sitemap_path):
    with open(sitemap_path, "r", encoding="utf-8") as f:
        sm_xml = f.read()
    url_count = len(re.findall(r"<loc>", sm_xml))
    print(f"[OK] Daily sync complete (DAY-{launch_day}, {url_count} sitemap URLs preserved without fake lastmod churn)")
else:
    print(f"[WARN] public/sitemap.xml not found at {sitemap_path}")
