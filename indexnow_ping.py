#!/usr/bin/env python3
"""
IndexNow Instant Batch Submission Script for https://www.gta6heistguide.com
Pushes all 87+ canonical + pSEO URLs to IndexNow (Bing, Yahoo, DuckDuckGo, Yandex).
"""
import json
import sys
import urllib.request
sys.path.insert(0, r"C:\Users\Shawn\Desktop\gta6heistguide")
from generate_pseo_pages import ALTERNATIVE_PAGES, HEAD_TO_HEAD_PAGES, GUIDE_PAGES

HOST = "www.gta6heistguide.com"
KEY = "gta6indexnow2026key"
KEY_LOCATION = f"https://{HOST}/{KEY}.txt"

urls = [
    f"https://{HOST}/",
    f"https://{HOST}/free/",
    f"https://{HOST}/heist-payout-calculator",
    f"https://{HOST}/leonida-interactive-map",
    f"https://{HOST}/vault-hack-trainer",
    f"https://{HOST}/compare/",
    f"https://{HOST}/guides/",
    f"https://{HOST}/lucia-jason-skills",
    f"https://{HOST}/vehicles-getaway-cars",
    f"https://{HOST}/safehouses-laundering",
    f"https://{HOST}/leonida-wanted-system",
    f"https://{HOST}/leonida-reserve",
    f"https://{HOST}/sinfrontera-bank",
    f"https://{HOST}/vice-city-yacht-heist",
    f"https://{HOST}/port-gellhorn",
    f"https://{HOST}/ocean-drive-armored-convoy",
    f"https://{HOST}/everglades-smuggler-run",
    f"https://{HOST}/heist-planner",
    f"https://{HOST}/interactive-map",
    f"https://{HOST}/crew-database",
    f"https://{HOST}/gameplay-mechanics",
    f"https://{HOST}/live-intel",
    f"https://{HOST}/forum",
    f"https://{HOST}/affiliates-gear",
    f"https://{HOST}/faq",
    f"https://{HOST}/about",
    f"https://{HOST}/legal",
]

for item in ALTERNATIVE_PAGES + HEAD_TO_HEAD_PAGES:
    urls.append(f"https://{HOST}/compare/{item[0]}.html")
for item in GUIDE_PAGES:
    urls.append(f"https://{HOST}/guides/{item[0]}.html")

urls.extend([
    f"https://{HOST}/articles/",
    f"https://{HOST}/articles/gta-6-heist-payout-math-true-net-dollar-per-hour.html",
    f"https://{HOST}/articles/every-leonida-region-in-gta-6-mapped-escape-coordinates.html",
    f"https://{HOST}/articles/how-to-beat-15-second-biometric-vault-keypad-hack-gta-6.html",
    f"https://{HOST}/articles/solo-vs-4-player-co-op-heist-splits-gta-6-loot-weight.html",
    f"https://{HOST}/articles/protecting-gta-6-online-heist-lobby-ip-sniffing-texture-pop-in.html",
    f"https://{HOST}/articles/how-to-clip-auto-edit-916-vertical-gta-6-heist-highlights-offline.html",
    f"https://{HOST}/cloud-mirrors/",
    f"https://{HOST}/cloud-mirrors/heist-payout-calculator.html",
    f"https://{HOST}/cloud-mirrors/vault-keypad-hack-trainer.html",
])

payload = {
    "host": HOST,
    "key": KEY,
    "keyLocation": KEY_LOCATION,
    "urlList": urls,
}

endpoints = [
    "https://api.indexnow.org/indexnow",
    "https://www.bing.com/indexnow",
    "https://yandex.com/indexnow",
]

for ep in endpoints:
    try:
        req = urllib.request.Request(
            ep,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json; charset=utf-8", "User-Agent": "GTA6IndexNowBot/3.0"},
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=15) as resp:
            print(f"[IndexNow] {ep} -> HTTP {resp.status} ({len(urls)} URLs pushed)")
    except Exception as e:
        print(f"[IndexNow] {ep} -> {e}")
