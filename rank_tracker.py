#!/usr/bin/env python3
"""
Reusable Zero-API-Key Live Latency (TTFB) & Indexing Tracker for GTA6HeistGuide.com
Logs HTTP status, TTFB ms, indexability, canonical check, and lightweight
public search indexing checks into seo_reports/seo_rankings_log.csv.
"""

from __future__ import annotations

import argparse
import csv
import re
import time
import urllib.parse
from datetime import datetime, timezone
from pathlib import Path

import requests
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parent
SITEMAP_PATH = ROOT / "public" / "sitemap.xml"
LOG_CSV = ROOT / "seo_reports" / "seo_rankings_log.csv"

CORE_SEARCH_CHECK_PATHS = {
    "/",
    "/free/",
    "/cheats",
    "/settings",
    "/money-guide",
    "/weapons-bonuses",
    "/heist-payout-calculator",
    "/interactive-map",
    "/vault-hack-trainer",
    "/giveaways",
    "/about",
    "/privacy-policy",
}

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "en-US,en;q=0.9",
}


def extract_sitemap_urls() -> list[str]:
    txt = SITEMAP_PATH.read_text(encoding="utf-8")
    seen = set()
    urls = []
    for u in re.findall(r"<loc>\s*([^<\s]+)\s*</loc>", txt):
        if u not in seen:
            seen.add(u)
            urls.append(u)
    return urls


def check_public_index_status(session: requests.Session, url: str) -> str:
    """Polite single check on Bing public SERP without any CAPTCHA/anti-bot bypass."""
    q = f"site:{url.replace('https://', '').rstrip('/')}"
    serp_url = f"https://www.bing.com/search?q={urllib.parse.quote_plus(q)}"
    try:
        r = session.get(serp_url, timeout=10)
        low = r.text.lower()
        if r.status_code != 200 or any(m in low for m in ("captcha", "verify you are human", "unusual traffic")):
            return "manual_gsc_check"
        if "gta6heistguide.com" in low and ("there are no results" not in low and "no results found" not in low):
            return "indexed_bing"
        return "pending_bing_crawl"
    except Exception:
        return "manual_gsc_check"


def main() -> None:
    parser = argparse.ArgumentParser(description="Live URL latency & indexability logger for GTA6HeistGuide.com")
    parser.add_argument("--limit", type=int, default=0, help="Limit number of URLs checked (0 = all)")
    parser.add_argument("--skip-serp", action="store_true", help="Skip polite search engine lookup checks")
    args = parser.parse_args()

    LOG_CSV.parent.mkdir(parents=True, exist_ok=True)
    urls = extract_sitemap_urls()
    if args.limit and args.limit > 0:
        urls = urls[: args.limit]

    run_ts = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    session = requests.Session()
    session.headers.update(HEADERS)

    file_exists = LOG_CSV.is_file() and LOG_CSV.stat().st_size > 0
    rows_written = 0
    ok_200 = 0
    ttfb_samples = []

    with open(LOG_CSV, "a", newline="", encoding="utf-8") as f:
        fieldnames = [
            "timestamp_utc",
            "url",
            "http_status",
            "ttfb_ms",
            "total_ms",
            "indexable",
            "canonical_ok",
            "robots_meta",
            "title_len",
            "h1_ok",
            "serp_index_status",
        ]
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        if not file_exists:
            writer.writeheader()

        for url in urls:
            path = urllib.parse.urlparse(url).path or "/"
            status = 0
            ttfb_ms = 0.0
            total_ms = 0.0
            indexable = "no"
            canonical_ok = "no"
            robots_meta = ""
            title_len = 0
            h1_ok = "no"
            serp_status = "not_checked"

            try:
                t0 = time.perf_counter()
                r = session.get(url, timeout=15, stream=True)
                ttfb_ms = round((r.elapsed.total_seconds() or (time.perf_counter() - t0)) * 1000, 1)
                body = r.content.decode("utf-8", errors="ignore")
                total_ms = round((time.perf_counter() - t0) * 1000, 1)
                status = r.status_code
                if status == 200:
                    ok_200 += 1
                    ttfb_samples.append(ttfb_ms)

                x_robots = (r.headers.get("X-Robots-Tag") or "").lower()
                if url.endswith(".xml"):
                    indexable = "xml"
                    canonical_ok = "na"
                    h1_ok = "na"
                else:
                    soup = BeautifulSoup(body, "lxml")
                    rm = soup.find("meta", attrs={"name": re.compile(r"^robots$", re.I)})
                    robots_meta = (rm.get("content") or "").strip() if rm else ""
                    noindex = "noindex" in robots_meta.lower() or "noindex" in x_robots
                    indexable = "yes" if (status == 200 and not noindex) else "no"
                    canon = soup.find("link", attrs={"rel": lambda v: v and "canonical" in [x.lower() for x in (v if isinstance(v, list) else [v])]})
                    canonical_ok = "yes" if (canon and (canon.get("href") or "").strip()) else "no"
                    title_len = len(soup.title.string.strip()) if (soup.title and soup.title.string) else 0
                    h1_ok = "yes" if len(soup.find_all("h1")) == 1 else "no"
            except Exception:
                status = 0

            if not args.skip_serp and path in CORE_SEARCH_CHECK_PATHS and status == 200:
                serp_status = check_public_index_status(session, url)
                time.sleep(0.35)

            writer.writerow(
                {
                    "timestamp_utc": run_ts,
                    "url": url,
                    "http_status": status,
                    "ttfb_ms": ttfb_ms,
                    "total_ms": total_ms,
                    "indexable": indexable,
                    "canonical_ok": canonical_ok,
                    "robots_meta": robots_meta,
                    "title_len": title_len,
                    "h1_ok": h1_ok,
                    "serp_index_status": serp_status,
                }
            )
            rows_written += 1

    avg_ttfb = round(sum(ttfb_samples) / len(ttfb_samples), 1) if ttfb_samples else 0.0
    print(f"[+] Logged {rows_written} URLs -> {LOG_CSV} (HTTP 200: {ok_200}/{rows_written}, avg TTFB: {avg_ttfb} ms)")


if __name__ == "__main__":
    main()
