#!/usr/bin/env python3
"""
Downloads 13 distinct, verified, official Rockstar Games GTA VI screenshots
directly from rockstargames.com/VI into:
  - public/assets/images/heists/  (8 heist & robbery cards)
  - public/assets/images/regions/ (5 Leonida region banners)
Verifies every file is a valid JPEG/PNG/WebP > 20 KB.
"""
import os
import re
import urllib.request

ROOT = r"C:\Users\Shawn\Desktop\gta6heistguide"
HEISTS_DIR = os.path.join(ROOT, "public", "assets", "images", "heists")
REGIONS_DIR = os.path.join(ROOT, "public", "assets", "images", "regions")
os.makedirs(HEISTS_DIR, exist_ok=True)
os.makedirs(REGIONS_DIR, exist_ok=True)

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "Referer": "https://www.rockstargames.com/VI",
}

def fetch_text(url):
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=25) as r:
        return r.read().decode("utf-8", errors="ignore")

def download_file(url, dest):
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=30) as r:
        data = r.read()
    if len(data) < 20480:
        raise RuntimeError(f"Downloaded file too small ({len(data)} bytes): {url}")
    # Verify magic bytes (JPEG FF D8, PNG 89 50, WEBP RIFF)
    if not (data[:2] == b"\xff\xd8" or data[:4] == b"\x89PNG" or data[:4] == b"RIFF"):
        raise RuntimeError(f"Invalid image header for {url}: {data[:8]!r}")
    with open(dest, "wb") as f:
        f.write(data)
    return len(data)

def collect_urls():
    urls = set()
    for page in [
        "https://www.rockstargames.com/VI/launch-gallery",
        "https://www.rockstargames.com/VI/only-in-leonida/grassrivers",
        "https://www.rockstargames.com/VI/only-in-leonida/port-gellhorn",
    ]:
        html = fetch_text(page)
        txt = html.replace("\\u002F", "/").replace("\\/", "/").replace('\\"', '"')
        for m in re.findall(r'(?:https://www\.rockstargames\.com)?/VI/_next/static/media/[A-Za-z0-9_.\-~]+\.(?:jpg|jpeg|webp)', txt, re.I):
            if m.startswith("/VI/"):
                m = "https://www.rockstargames.com" + m
            if "GTAVI_FOB_" in m or "Mobile" in m or "meta." in m:
                continue
            urls.add(m)
    return sorted(urls)

def pick(urls, prefixes, used):
    for pref in prefixes:
        for u in urls:
            fname = u.split("/")[-1]
            if fname.lower().startswith(pref.lower()) and u not in used:
                used.add(u)
                return u
    raise RuntimeError(f"Could not find unused screenshot matching {prefixes}")

def main():
    urls = collect_urls()
    print(f"Collected {len(urls)} official Rockstar GTA VI screenshots.")
    by_prefix = {}
    for u in urls:
        base = u.split("/")[-1].split(".")[0]
        key = "_".join(base.split("_")[:-1]) or base
        by_prefix.setdefault(key, []).append(u)
    print("Available groups:", sorted(by_prefix.keys()))

    used = set()
    heist_targets = [
        ("cartel-heist.jpg",       ["Raul_Bautista_01", "Raul_Bautista_02", "Raul_Bautista_"]),
        ("vcia-takedown.jpg",      ["Vice_City_07", "Vice_City_06", "Vice_City_05", "Jason_and_Lucia_18", "Vice_City_"]),
        ("shops.jpg",              ["Port_Gellhorn_01", "Port_Gellhorn_02", "Port_Gellhorn_"]),
        ("pawn-shops.jpg",         ["Port_Gellhorn_03", "Port_Gellhorn_04", "Port_Gellhorn_"]),
        ("jewelry-stores.jpg",     ["Vice_City_02", "Vice_City_03", "Lucia_Caminos_12", "Vice_City_"]),
        ("small-banks.jpg",        ["Raul_Bautista_02", "Raul_Bautista_03", "Jason_and_Lucia_15", "Raul_Bautista_"]),
        ("large-bank-vaults.jpg",  ["Raul_Bautista_04", "Raul_Bautista_03", "Jason_and_Lucia_16", "Jason_and_Lucia_"]),
        ("armored-trucks.jpg",     ["Ambrosia_02", "Ambrosia_01", "Jason_and_Lucia_17", "Port_Gellhorn_05", "Ambrosia_"]),
    ]

    region_targets = [
        ("vice-city.jpg",     ["Vice_City_01", "Vice_City_04", "Vice_City_"]),
        ("leonida-keys.jpg",  ["Leonida_Keys_01", "Leonida_Keys_07", "Leonida_Keys_"]),
        ("grassrivers.jpg",   ["Grassrivers_01", "Grassrivers_07", "Grassrivers_"]),
        ("port-gellhorn.jpg", ["Port_Gellhorn_05", "Port_Gellhorn_06", "Port_Gellhorn_"]),
        ("mount-kalaga.jpg",  ["Mount_Kalaga_01", "Mount_Kalaga_02", "Mount_Kalaga_", "Ambrosia_03", "Grassrivers_08"]),
    ]

    print("\n--- Downloading 8 Heist Screenshots ---")
    for filename, prefs in heist_targets:
        src = pick(urls, prefs, used)
        dest = os.path.join(HEISTS_DIR, filename)
        size = download_file(src, dest)
        print(f"  [OK] {filename:24s} <- {src.split('/')[-1]} ({size:,} bytes)")

    print("\n--- Downloading 5 Region Banners ---")
    for filename, prefs in region_targets:
        src = pick(urls, prefs, used)
        dest = os.path.join(REGIONS_DIR, filename)
        size = download_file(src, dest)
        print(f"  [OK] {filename:24s} <- {src.split('/')[-1]} ({size:,} bytes)")

    print("\nALL 13 OFFICIAL ROCKSTAR SCREENSHOTS DOWNLOADED AND VERIFIED!")

if __name__ == "__main__":
    main()
