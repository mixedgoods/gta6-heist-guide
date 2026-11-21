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

# 1. Sync data/*.json -> public/data/*.json
for fname in ("properties.json", "animals.json"):
    src = os.path.join(DATA_DIR, fname)
    dst = os.path.join(PUB_DATA_DIR, fname)
    if os.path.exists(src):
        shutil.copy2(src, dst)
    elif os.path.exists(dst):
        shutil.copy2(dst, src)

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
    "online_status": "Expected 2027 — Not Live at Launch",
    "counts": {
        "heist_walkthroughs": 8,
        "properties_entries": count_items(os.path.join(PUB_DATA_DIR, "properties.json")),
        "animals_entries": count_items(os.path.join(PUB_DATA_DIR, "animals.json")),
        "wildlife_total_species": "170+ (including 62 bird species)"
    }
}
for target in (os.path.join(DATA_DIR, "live-feed.json"), os.path.join(PUB_DATA_DIR, "live-feed.json")):
    with open(target, "w", encoding="utf-8", newline="\n") as f:
        json.dump(live_feed, f, indent=2, ensure_ascii=False)

# 3. Generate public/sitemap.xml
priority_urls = [
    ("/", "1.0", "daily"),
    ("/heists/the-cartel-heist.html", "0.98", "daily"),
    ("/heists/vcia-takedown.html", "0.98", "daily"),
    ("/heists/shops-and-stickups.html", "0.95", "daily"),
    ("/heists/pawn-shops.html", "0.95", "daily"),
    ("/heists/jewelry-stores.html", "0.95", "daily"),
    ("/heists/small-banks-payday-loans.html", "0.96", "daily"),
    ("/heists/large-bank-vaults.html", "0.98", "daily"),
    ("/heists/armored-trucks-gang-ops.html", "0.95", "daily"),
    ("/properties.html", "0.96", "daily"),
    ("/animals.html", "0.96", "daily"),
    ("/save-planner", "0.98", "daily"),
    ("/cheats", "0.98", "daily"),
    ("/settings", "0.95", "daily"),
    ("/cash-guide", "0.98", "daily"),
    ("/interactive-map", "0.95", "daily"),
    ("/heist-planner", "0.92", "daily"),
    ("/heist-payout-calculator", "0.90", "daily"),
    ("/weapons-gear", "0.90", "daily"),
    ("/weapons-bonuses", "0.88", "daily"),
    ("/vehicles-getaway-cars", "0.88", "daily"),
    ("/secrets", "0.90", "daily"),
    ("/radio", "0.88", "daily"),
    ("/giveaways", "0.88", "daily"),
    ("/live-intel", "0.88", "daily"),
    ("/free", "0.88", "weekly"),
    ("/about.html", "0.50", "monthly"),
    ("/contact.html", "0.50", "monthly"),
    ("/privacy-policy.html", "0.40", "monthly"),
    ("/terms.html", "0.40", "monthly"),
]

seen = set()
entries = []
for path, prio, freq in priority_urls:
    loc = BASE_URL + path
    if loc not in seen:
        seen.add(loc)
        entries.append((loc, today_str, freq, prio))

lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
]
for loc, lm, freq, prio in entries:
    lines.append("  <url>")
    lines.append(f"    <loc>{loc}</loc>")
    lines.append(f"    <lastmod>{lm}</lastmod>")
    lines.append(f"    <changefreq>{freq}</changefreq>")
    lines.append(f"    <priority>{prio}</priority>")
    lines.append("  </url>")
lines.append("</urlset>")

sitemap_path = os.path.join(PUB_DIR, "sitemap.xml")
with open(sitemap_path, "w", encoding="utf-8", newline="\n") as f:
    f.write("\n".join(lines) + "\n")

print(f"[OK] Daily sync complete (DAY-{launch_day}, {len(entries)} sitemap URLs, lastmod={today_str})")
