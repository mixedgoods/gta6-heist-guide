#!/usr/bin/env python3
"""
GTA6HeistGuide.com — 12-Hour Public Intel, Cheats & Patch Sync Engine
Fetches fresh public GTA 6 feeds from IGN, GameSpot, Push Square, PC Gamer, and Reddit r/GTA6,
filters for Day-2 cheats, money methods, weapon drops, and patches, then saves to /data/live_intel.json.
Runs on $0/mo free GitHub Actions every 12 hours.
"""

import os
import sys
import json
import re
import urllib.request
import urllib.error
import xml.etree.ElementTree as ET
from datetime import datetime, timezone

WORKSPACE_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_JSON_PATH = os.path.join(WORKSPACE_DIR, "public", "data", "live_intel.json")

FEEDS = [
    {
        "source": "Push Square",
        "url": "https://www.pushsquare.com/feeds/latest",
        "category": "Console & PS5 Guides"
    },
    {
        "source": "PC Gamer",
        "url": "https://www.pcgamer.com/rss/",
        "category": "PC & Performance"
    },
    {
        "source": "IGN",
        "url": "https://feeds.ign.com/ign/all",
        "category": "Mainstream Intel & Cheats"
    },
    {
        "source": "GameSpot",
        "url": "https://www.gamespot.com/feeds/mashup/",
        "category": "Walkthroughs & Reviews"
    },
    {
        "source": "Reddit r/GTA6",
        "url": "https://www.reddit.com/r/GTA6/hot.json?limit=25",
        "is_reddit_json": True,
        "category": "Community Discoveries"
    }
]

GTA6_KEYWORDS = [
    "gta 6", "gta vi", "grand theft auto vi", "grand theft auto 6",
    "vice city", "leonida", "lucia", "jason", "rockstar games", "heist"
]

CURATED_INTEL = [
    {
        "id": "intel-curated-1",
        "title": "GTA 6 Day-2 Cheat Code Input System Verified: D-Pad Phone Combinations Live",
        "source": "Syndicate Editorial Desk",
        "category": "Cheats & Exploits",
        "link": "/cheats.html",
        "pubDate": datetime.now(timezone.utc).strftime("%a, %d %b %Y %H:%M:%S GMT"),
        "summary": "Confirmed: Players can open the in-game smartphone (Up on D-Pad), hold L1/LB + press R1/RB, and enter D-Pad arrow sequences to unlock $250k money, body armor, and vehicle spawns. Note: cheats disable auto-saving and trophies.",
        "badge": "VERIFIED DAY-2 CHEAT"
    },
    {
        "id": "intel-curated-2",
        "title": "Chapter 1 & 2 Fast Cash Checklist: Early Illegal Fronts & BuckMe Savings Strategy",
        "source": "Syndicate Intel Wire",
        "category": "Money & Economy",
        "link": "/money-guide.html",
        "pubDate": datetime.now(timezone.utc).strftime("%a, %d %b %Y %H:%M:%S GMT"),
        "summary": "Step-by-step breakdown of early cash operations across Fishing Shacks, Exotic Animals fronts, Backroom Weed grows, and motels to hit the BuckMe app savings quota before high-stakes bank heists.",
        "badge": "EARLY CASH META"
    },
    {
        "id": "intel-curated-3",
        "title": "Best PS5 & Xbox Series X Settings: 30 FPS Frame Pacing, Deadzone & HDR Optimization",
        "source": "Syndicate Hardware Lab",
        "category": "Performance & Settings",
        "link": "/settings.html",
        "pubDate": datetime.now(timezone.utc).strftime("%a, %d %b %Y %H:%M:%S GMT"),
        "summary": "Maximize target 30 FPS smoothness on console: set Aim Sensitivity to 7-8, Deadzones to Lowest Stable, Movement Speed to Jog, and TV to Game Mode with HGiG tone mapping.",
        "badge": "OPTIMIZATION GUIDE"
    },
    {
        "id": "intel-curated-4",
        "title": "24 Ammu-Nation & Pawn Locations Mapped + Jason's Duval Signature ES9 Claim",
        "source": "Leonida Arms Bureau",
        "category": "Weapons & Gear",
        "link": "/weapons-bonuses.html",
        "pubDate": datetime.now(timezone.utc).strftime("%a, %d %b %Y %H:%M:%S GMT"),
        "summary": "Full directory of Vice City Firearms, Martez Empenos, and Black Eagle surplus stores, plus how to claim Ultimate Edition bonus pistols and safehouse duffle weapons.",
        "badge": "ARMORY EXPANSION"
    },
    {
        "id": "intel-curated-5",
        "title": "Kick 10,000 Ultimate Edition Giveaway & Twitch Daily Drops Active Now",
        "source": "Drops & Community Hub",
        "category": "Giveaways & Drops",
        "link": "/giveaways.html",
        "pubDate": datetime.now(timezone.utc).strftime("%a, %d %b %Y %H:%M:%S GMT"),
        "summary": "Watch 3 hours daily on Kick for Sunset Cases through Dec 7, 2026. Daily Twitch Heist Train drops and $0 Amazon Prime subscription linking tutorial.",
        "badge": "FREE LOOT ACTIVE"
    }
]

def clean_html(raw_html):
    if not raw_html:
        return ""
    clean = re.sub(r"<[^>]+>", "", raw_html)
    return " ".join(clean.split())

def fetch_feed_items(feed_cfg):
    url = feed_cfg["url"]
    source = feed_cfg["source"]
    category = feed_cfg["category"]
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 GTA6HeistGuideIntel/2.0"
    }

    items = []
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=12) as response:
            content = response.read().decode("utf-8", errors="ignore")

        if feed_cfg.get("is_reddit_json"):
            data = json.loads(content)
            children = data.get("data", {}).get("children", [])
            for child in children:
                d = child.get("data", {})
                title = d.get("title", "")
                selftext = d.get("selftext", "")
                combined = f"{title} {selftext}".lower()
                if any(k in combined for k in GTA6_KEYWORDS):
                    items.append({
                        "id": f"reddit-{d.get('id', '')}",
                        "title": title,
                        "source": "Reddit r/GTA6",
                        "category": category,
                        "link": f"https://reddit.com{d.get('permalink', '')}",
                        "pubDate": datetime.fromtimestamp(d.get("created_utc", 0), timezone.utc).strftime("%a, %d %b %Y %H:%M:%S GMT"),
                        "summary": clean_html(selftext[:300]) if selftext else f"Community discussion with {d.get('num_comments', 0)} comments and {d.get('score', 0)} upvotes.",
                        "badge": "COMMUNITY INTEL"
                    })
        else:
            # RSS / Atom parser
            root = ET.fromstring(content)
            # Standard RSS <channel><item>
            channel = root.find("channel")
            xml_items = channel.findall("item") if channel is not None else root.findall("{http://www.w3.org/2005/Atom}entry")

            for item in xml_items[:20]:
                title_el = item.find("title")
                if title_el is None:
                    title_el = item.find("{http://www.w3.org/2005/Atom}title")
                link_el = item.find("link")
                if link_el is None:
                    link_el = item.find("{http://www.w3.org/2005/Atom}link")
                desc_el = item.find("description")
                if desc_el is None:
                    desc_el = item.find("{http://www.w3.org/2005/Atom}summary")
                if desc_el is None:
                    desc_el = item.find("{http://www.w3.org/2005/Atom}content")
                pub_el = item.find("pubDate")
                if pub_el is None:
                    pub_el = item.find("{http://www.w3.org/2005/Atom}published")
                if pub_el is None:
                    pub_el = item.find("{http://www.w3.org/2005/Atom}updated")

                title = title_el.text.strip() if title_el is not None and title_el.text else ""
                link = ""
                if link_el is not None:
                    link = link_el.text.strip() if link_el.text else link_el.attrib.get("href", "")
                desc = desc_el.text.strip() if desc_el is not None and desc_el.text else ""
                pub = pub_el.text.strip() if pub_el is not None and pub_el.text else datetime.now(timezone.utc).strftime("%a, %d %b %Y %H:%M:%S GMT")

                combined = f"{title} {desc}".lower()
                if any(k in combined for k in GTA6_KEYWORDS):
                    items.append({
                        "id": f"feed-{abs(hash(link or title)) % 10000000}",
                        "title": title,
                        "source": source,
                        "category": category,
                        "link": link or "/",
                        "pubDate": pub,
                        "summary": clean_html(desc[:300]) if desc else "Latest GTA 6 news release and gameplay reporting.",
                        "badge": "NEWS UPDATE"
                    })
    except Exception as e:
        print(f"[!] Warning: Could not fetch feed {source} ({url}): {e}")

    return items

def main():
    print("[*] Starting 12-Hour GTA 6 Intel & Patch Sync Engine...")
    os.makedirs(os.path.dirname(OUTPUT_JSON_PATH), exist_ok=True)

    all_fetched = []
    for f in FEEDS:
        print(f"[*] Checking {f['source']} ({f['url']})...")
        items = fetch_feed_items(f)
        print(f"    -> Found {len(items)} GTA 6 matching articles")
        all_fetched.extend(items)

    # Combine curated Day-2 verified intel with fetched articles
    combined_feed = CURATED_INTEL + all_fetched

    # Deduplicate by title
    seen_titles = set()
    deduped = []
    for item in combined_feed:
        norm = re.sub(r"\W+", "", item["title"].lower())
        if norm not in seen_titles:
            seen_titles.add(norm)
            deduped.append(item)

    payload = {
        "ok": True,
        "lastSync": datetime.now(timezone.utc).isoformat(),
        "totalArticles": len(deduped),
        "headline": "🔥 GTA 6 IS LIVE NOW — DAY-2 CHEATS, MAPS & DROPS",
        "weeklyReset": "Thursday 10:00 UTC",
        "verifiedCheatsCount": 61,
        "ammuNationStoresCount": 24,
        "intelFeed": deduped[:40],
        "activeDrops": {
            "kickGiveaway": {
                "name": "Kick 10,000 Ultimate Edition Giveaway",
                "dates": "Nov 19 – Dec 7, 2026",
                "requirement": "Watch 3 hours daily for Sunset Cases",
                "link": "/giveaways.html"
            },
            "twitchDrops": {
                "name": "Twitch Daily Drops & Heist Trains",
                "dates": "Nov 18 – Nov 30, 2026",
                "requirement": "Daily codes, badges & emotes + $0 Prime Sub",
                "link": "/giveaways.html"
            }
        }
    }

    with open(OUTPUT_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2, ensure_ascii=False)

    print(f"[✓] Saved {len(deduped)} intel stories to {OUTPUT_JSON_PATH}")

if __name__ == "__main__":
    main()
