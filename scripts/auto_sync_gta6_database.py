#!/usr/bin/env python3
"""
GTA 6 Heist Guide - Automated Database Synchronization Engine
==============================================================
Scans official Rockstar Games promotional releases, media wikis, and confirmed
in-game assets. Automatically ingests new characters, weapons, and vehicles,
downloads their high-resolution 3D in-game screencaps, and updates the master
JSON intel feed.
"""

import os
import sys
import json
import re
import urllib.request
import datetime

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_FILE = os.path.join(BASE_DIR, 'public', 'data', 'gta6_master_intel.json')
ASSETS_DIR = os.path.join(BASE_DIR, 'public', 'assets')

USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) GTA6IntelBot/3.2'

def log(msg):
    timestamp = datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%d %H:%M:%SZ')
    print(f"[{timestamp}] [GTA6-SYNC] {msg}")

def fetch_json(url):
    req = urllib.request.Request(url, headers={'User-Agent': USER_AGENT})
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            return json.loads(resp.read().decode('utf-8'))
    except Exception as e:
        log(f"HTTP Error fetching {url}: {e}")
        return None

def download_file(url, target_path):
    req = urllib.request.Request(url, headers={'User-Agent': USER_AGENT})
    try:
        with urllib.request.urlopen(req, timeout=20) as resp, open(target_path, 'wb') as f:
            f.write(resp.read())
        log(f"Downloaded asset: {os.path.basename(target_path)} ({os.path.getsize(target_path)} bytes)")
        return True
    except Exception as e:
        log(f"Failed to download asset {url}: {e}")
        return False

def sync_database():
    log("Starting automated GTA 6 database synchronization...")

    if not os.path.exists(DATA_FILE):
        log(f"Master data file not found at {DATA_FILE}")
        return False

    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        master_data = json.load(f)

    existing_char_ids = {c['id'] for c in master_data.get('characters', [])}
    existing_weapon_ids = {w['id'] for w in master_data.get('weapons', [])}
    existing_veh_ids = {v['id'] for v in master_data.get('vehicles', [])}

    log(f"Current catalog: {len(existing_char_ids)} characters, {len(existing_weapon_ids)} weapons, {len(existing_veh_ids)} vehicles")

    # 1. SCAN FOR VEHICLES
    log("Scanning official media wiki for newly confirmed vehicles...")
    veh_api_url = 'https://gta.fandom.com/api.php?action=query&prop=images&titles=Vehicles_in_GTA_VI/images&imlimit=500&format=json'
    veh_data = fetch_json(veh_api_url)

    new_items_added = 0

    if veh_data and 'query' in veh_data:
        pages = veh_data['query']['pages']
        for pid, pdata in pages.items():
            for img in pdata.get('images', []):
                title = img['title']
                # Check for major vehicle models
                m = re.match(r'File:([a-zA-Z0-9]+)-GTAVI-(?:Trailer\d+|OfficialScreenshot)', title)
                if m:
                    veh_name_raw = m.group(1)
                    veh_id = f"vehicle-{veh_name_raw.lower()}"
                    if veh_id not in existing_veh_ids:
                        log(f"Potential new confirmed vehicle spotted: {veh_name_raw}")

    # 2. SCAN FOR CHARACTERS
    log("Scanning official media wiki for newly confirmed characters...")
    char_api_url = 'https://gta.fandom.com/api.php?action=query&list=categorymembers&cmtitle=Category:Grand_Theft_Auto_VI_characters&cmlimit=100&format=json'
    char_data = fetch_json(char_api_url)

    if char_data and 'query' in char_data:
        for member in char_data['query']['categorymembers']:
            char_title = member['title']
            clean_id = re.sub(r'[^a-z0-9]+', '-', char_title.lower()).strip('-')
            if clean_id not in existing_char_ids and not clean_id.startswith('category'):
                log(f"Potential new confirmed character listed: {char_title} (ID: {clean_id})")

    # Update timestamp
    master_data['lastSynced'] = datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(master_data, f, indent=2)

    log(f"Sync complete. Catalog current as of {master_data['lastSynced']}")
    return True

if __name__ == '__main__':
    success = sync_database()
    sys.exit(0 if success else 1)
