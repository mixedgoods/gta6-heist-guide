#!/usr/bin/env python3
"""
IndexNow Instant Crawler Ping Engine for GTA6HeistGuide.com
Submits all sitemap URLs to IndexNow (Bing, Yahoo, DuckDuckGo, Yandex, Naver)
"""

import os
import sys
import re
import json
import urllib.request
import urllib.error

INDEXNOW_KEY = "df9198ac34c2f27023754589395a56d0"
HOST = "www.gta6heistguide.com"
KEY_LOCATION = f"https://{HOST}/{INDEXNOW_KEY}.txt"
ENDPOINTS = [
    "https://api.indexnow.org/indexnow",
    "https://www.bing.com/indexnow"
]

def find_sitemap():
    candidates = [
        os.path.join(os.path.dirname(__file__), "public", "sitemap.xml"),
        os.path.join(os.path.dirname(__file__), "sitemap.xml"),
        "public/sitemap.xml",
        "sitemap.xml"
    ]
    for p in candidates:
        if os.path.isfile(p):
            return p
    return None

def extract_urls(sitemap_path):
    with open(sitemap_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Extract all <loc>...</loc> URLs
    urls = re.findall(r"<loc>(https?://[^<]+)</loc>", content)
    # Deduplicate while preserving order
    seen = set()
    deduped = []
    for u in urls:
        u_clean = u.strip()
        if u_clean not in seen:
            seen.add(u_clean)
            deduped.append(u_clean)
    return deduped

def ping_indexnow(urls):
    if not urls:
        print("[!] No URLs found in sitemap.")
        return False

    payload = {
        "host": HOST,
        "key": INDEXNOW_KEY,
        "keyLocation": KEY_LOCATION,
        "urlList": urls
    }

    json_data = json.dumps(payload, indent=2).encode("utf-8")
    headers = {
        "Content-Type": "application/json; charset=utf-8",
        "User-Agent": "GTA6HeistGuide-IndexNow/1.0"
    }

    print(f"[*] Submitting {len(urls)} URLs to IndexNow engines...")
    print(f"[*] Host: {HOST}")
    print(f"[*] Key: {INDEXNOW_KEY}")
    print(f"[*] Key Location: {KEY_LOCATION}")

    success = False
    for endpoint in ENDPOINTS:
        try:
            req = urllib.request.Request(endpoint, data=json_data, headers=headers, method="POST")
            with urllib.request.urlopen(req, timeout=15) as response:
                status = response.getcode()
                body = response.read().decode("utf-8")
                print(f"[✓] {endpoint} -> Status {status} (Success: URLs submitted for rapid crawler indexing)")
                if body:
                    print(f"    Response: {body[:200]}")
                success = True
        except urllib.error.HTTPError as e:
            status = e.code
            body = e.read().decode("utf-8")
            if status in (200, 202):
                print(f"[✓] {endpoint} -> Status {status} (Accepted for crawling)")
                success = True
            else:
                print(f"[!] {endpoint} -> HTTP Error {status}: {e.reason}")
                if body:
                    print(f"    Details: {body[:300]}")
        except Exception as ex:
            print(f"[!] {endpoint} -> Connection Error: {ex}")

    return success

def main():
    print("==================================================")
    print("  GTA 6 HEIST GUIDE — INDEXNOW CRAWLER PING ENGINE")
    print("==================================================")
    
    sitemap_path = find_sitemap()
    if not sitemap_path:
        print("[!] Error: Could not locate sitemap.xml in public/ or root.")
        sys.exit(1)

    print(f"[*] Loaded sitemap: {sitemap_path}")
    urls = extract_urls(sitemap_path)
    print(f"[*] Extracted {len(urls)} unique URLs.")

    ok = ping_indexnow(urls)
    if ok:
        print("==================================================")
        print("  [SUCCESS] All URLs broadcasted to IndexNow!")
        print("==================================================")
    else:
        print("==================================================")
        print("  [NOTICE] Submission attempted. Check network / key.")
        print("==================================================")

if __name__ == "__main__":
    main()
