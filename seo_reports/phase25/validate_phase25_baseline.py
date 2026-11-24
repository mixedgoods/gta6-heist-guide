#!/usr/bin/env python3
"""
Phase 25.1 Reproducible Search Console Baseline & Reconciliation Validator.

Strictly read-only: reads raw GSC CSV exports in seo_reports/phase25/,
public/sitemap.xml, and local HTML directories to verify all headline metrics,
canonical/legacy splits, cohort totals, and internal-link counts.
"""

from __future__ import annotations

import csv
import re
import sys
import xml.etree.ElementTree as ET
from collections import Counter, defaultdict
from pathlib import Path
from urllib.parse import urlparse


SCRIPT_DIR = Path(__file__).resolve().parent
REPO_ROOT = SCRIPT_DIR.parent.parent
SITEMAP_PATH = REPO_ROOT / "public" / "sitemap.xml"


def read_csv(filename: str) -> list[dict[str, str]]:
    with (SCRIPT_DIR / filename).open("r", encoding="utf-8-sig", newline="") as fh:
        return list(csv.DictReader(fh))


def load_sitemap_urls(path: Path) -> list[str]:
    tree = ET.parse(path)
    ns = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    return [el.text.strip() for el in tree.findall(".//sm:loc", ns) if el.text]


def sum_metrics(rows: list[dict[str, str]]) -> tuple[int, int, float]:
    clicks = sum(int(r["Clicks"]) for r in rows)
    impr = sum(int(r["Impressions"]) for r in rows)
    ctr = (clicks / impr * 100.0) if impr else 0.0
    return clicks, impr, ctr


def main() -> int:
    errors: list[str] = []

    def check(cond: bool, msg: str) -> None:
        if not cond:
            errors.append(msg)

    filters = read_csv("Filters.csv")
    chart = read_csv("Chart.csv")
    devices = read_csv("Devices.csv")
    countries = read_csv("Countries.csv")
    pages = read_csv("Pages.csv")
    queries = read_csv("Queries.csv")
    search_appearance = read_csv("Search appearance.csv")
    cohorts = read_csv("phase25_cohort_performance.csv")
    links = read_csv("phase25_internal_link_verification.csv")

    sitemap_urls = load_sitemap_urls(SITEMAP_PATH)
    sitemap_set = set(sitemap_urls)

    print("=== 1. Export Filters & Date Window ===")
    filter_map = {r["Filter"]: r["Value"] for r in filters}
    print(f"Search type : {filter_map.get('Search type')}")
    print(f"Date filter : {filter_map.get('Date')}")
    check(filter_map.get("Search type") == "Web (text-based)", "Unexpected Search type filter")
    check(filter_map.get("Date") == "Oct 27, 2026-Nov 23, 2026", "Unexpected Date filter")

    active_days = [r for r in chart if int(r["Impressions"]) > 0 or int(r["Clicks"]) > 0]
    zero_days = [r["Date"] for r in chart if int(r["Impressions"]) == 0 and int(r["Clicks"]) == 0]
    print(f"Chart rows  : {len(chart)} ({len(active_days)} active days: {active_days[0]['Date']} to {active_days[-1]['Date']}; zero-data rows: {zero_days})")
    check(len(active_days) == 7, f"Expected 7 active days, got {len(active_days)}")
    check(active_days[0]["Date"] == "2026-11-17" and active_days[-1]["Date"] == "2026-11-23", "Unexpected active day span")

    print("\n=== 2. Cross-Dimension Metric Reconciliation ===")
    dims = {
        "Chart.csv": chart,
        "Devices.csv": devices,
        "Countries.csv": countries,
        "Pages.csv": pages,
        "Queries.csv": queries,
        "Search appearance.csv": search_appearance,
    }
    totals = {}
    for name, rows in dims.items():
        c, i, ctr = sum_metrics(rows)
        totals[name] = (len(rows), c, i, ctr)
        print(f"  {name:22s} | rows={len(rows):4d} | clicks={c:4d} | impressions={i:6d} | ctr={ctr:.2f}%")

    check(totals["Chart.csv"][1:3] == (200, 22117), "Chart.csv headline mismatch")
    check(totals["Devices.csv"][1:3] == (200, 22117), "Devices.csv headline mismatch")
    check(totals["Countries.csv"][1:3] == (200, 22117), "Countries.csv headline mismatch")
    check(totals["Pages.csv"][1:3] == (201, 22057), "Pages.csv row-sum mismatch")
    check(totals["Queries.csv"][1:3] == (29, 3521), "Queries.csv row-sum mismatch")

    print("\n=== 3. Pages.csv Hygiene & Canonical/Legacy Split ===")
    page_urls = [r["Top pages"] for r in pages]
    schemes = Counter(urlparse(u).scheme for u in page_urls)
    hosts = Counter(urlparse(u).netloc for u in page_urls)
    fragments = [u for u in page_urls if urlparse(u).fragment]
    check(len(page_urls) == len(set(page_urls)) == 117, "Duplicate or unexpected row count in Pages.csv")
    check(dict(schemes) == {"https": 117}, f"Unexpected schemes: {dict(schemes)}")
    check(dict(hosts) == {"www.gta6heistguide.com": 117}, f"Unexpected hosts: {dict(hosts)}")
    check(len(fragments) == 0, f"Unexpected fragments: {fragments}")
    check(len(page_urls) < 1000, "Pages.csv hit 1,000-row GSC export cap")

    canon_rows = [r for r in pages if r["Top pages"] in sitemap_set]
    legacy_rows = [r for r in pages if r["Top pages"] not in sitemap_set]
    c_cl, c_im, c_ctr = sum_metrics(canon_rows)
    l_cl, l_im, l_ctr = sum_metrics(legacy_rows)
    print(f"  Canonical (exact sitemap match): {len(canon_rows):2d} URLs | clicks={c_cl:3d} | impressions={c_im:5d} | ctr={c_ctr:.2f}%")
    print(f"  Legacy (non-canonical URLs)    : {len(legacy_rows):2d} URLs | clicks={l_cl:3d} | impressions={l_im:5d} | ctr={l_ctr:.2f}%")
    print(f"  Combined Pages.csv total       : {len(pages):2d} URLs | clicks={c_cl + l_cl:3d} | impressions={c_im + l_im:5d} | delta vs Chart = ({(c_cl + l_cl) - 200:+d} clicks, {(c_im + l_im) - 22117:+d} impr)")

    check((len(canon_rows), c_cl, c_im) == (43, 83, 13457), "Canonical split mismatch")
    check((len(legacy_rows), l_cl, l_im) == (74, 118, 8600), "Legacy split mismatch")

    sitemap_no_slash = {u.rstrip("/"): u for u in sitemap_set}
    trailing_slash_variants = [
        (r["Top pages"], int(r["Clicks"]), int(r["Impressions"]))
        for r in legacy_rows
        if r["Top pages"].rstrip("/") in sitemap_no_slash
    ]
    query_variants = [
        (r["Top pages"], int(r["Clicks"]), int(r["Impressions"]))
        for r in legacy_rows
        if "?" in r["Top pages"] and r["Top pages"].split("?")[0] in sitemap_set
    ]
    print(f"  Trailing-slash non-canonical variants ({len(trailing_slash_variants)}): {trailing_slash_variants}")
    print(f"  Query-param variants of canonicals    ({len(query_variants)}): {query_variants}")

    print("\n=== 4. Cohort Verification (55 Unique Canonical URLs) ===")
    pages_lookup = {
        r["Top pages"]: (int(r["Clicks"]), int(r["Impressions"]), r["Position"])
        for r in pages
    }
    cohort_urls = [r["canonical_url"] for r in cohorts]
    check(len(cohort_urls) == len(set(cohort_urls)) == 55, "Expected 55 unique canonical URLs")
    check(all(u in sitemap_set for u in cohort_urls), "Not all 55 cohort URLs exist in public/sitemap.xml")

    for r in cohorts:
        u = r["canonical_url"]
        exp_c, exp_i, exp_pos = pages_lookup.get(u, (0, 0, ""))
        check(int(r["clicks_oct27_nov23"]) == exp_c, f"Click mismatch for {u}")
        check(int(r["impressions_oct27_nov23"]) == exp_i, f"Impression mismatch for {u}")
        check(r["avg_position"] == exp_pos, f"Position mismatch for {u}")

    dedup_c = sum(int(r["clicks_oct27_nov23"]) for r in cohorts)
    dedup_i = sum(int(r["impressions_oct27_nov23"]) for r in cohorts)
    dedup_active = sum(1 for r in cohorts if int(r["impressions_oct27_nov23"]) > 0)
    overlaps = [r["path"] for r in cohorts if "|" in r["cohorts"]]
    print(f"  Deduplicated 55 URLs: active={dedup_active}/55 | clicks={dedup_c} | impressions={dedup_i} | ctr={dedup_c / dedup_i * 100:.2f}% | overlapping_urls={len(overlaps)}")
    check((dedup_active, dedup_c, dedup_i) == (14, 64, 11698), "Deduplicated cohort total mismatch")
    check(len(overlaps) == 6, f"Expected 6 overlapping URLs, got {len(overlaps)}")

    expected_cohorts = {
        "A": (7, 6, 40, 8971),
        "B": (4, 3, 2, 901),
        "C": (8, 8, 55, 10432),
        "D": (39, 2, 13, 435),
        "E": (4, 2, 21, 6412),
    }
    by_cohort: dict[str, list[dict[str, str]]] = defaultdict(list)
    for r in cohorts:
        for cid in r["cohorts"].split("|"):
            by_cohort[cid].append(r)

    for cid in ("A", "B", "C", "D", "E"):
        rows = by_cohort[cid]
        cl = sum(int(r["clicks_oct27_nov23"]) for r in rows)
        im = sum(int(r["impressions_oct27_nov23"]) for r in rows)
        act = sum(1 for r in rows if int(r["impressions_oct27_nov23"]) > 0)
        ctr = (cl / im * 100.0) if im else 0.0
        print(f"  Cohort {cid}: urls={len(rows):2d} | active={act:2d} | clicks={cl:3d} | impressions={im:5d} | ctr={ctr:.2f}%")
        check((len(rows), act, cl, im) == expected_cohorts[cid], f"Cohort {cid} mismatch")

    print("\n=== 5. Internal-Link Verification Totals ===")
    present = sum(1 for r in links if r["present_in_live_html"] == "True")
    http200 = sum(1 for r in links if r["destination_http_status"] == "200")
    in_sm = sum(1 for r in links if r["destination_in_sitemap"] == "True")
    unique_dests = len({r["destination"] for r in links})
    radio_links = set(re.findall(r'href="(/radio/[a-z0-9-]+)"', (REPO_ROOT / "public" / "radio.html").read_text(encoding="utf-8")))
    animal_links = set(re.findall(r'href="(/animals/[a-z0-9-]+)"', (REPO_ROOT / "public" / "animals.html").read_text(encoding="utf-8")))
    print(f"  Hub-matrix links : {present}/{len(links)} live HTML, {http200}/{len(links)} HTTP 200, {in_sm}/{len(links)} in sitemap ({unique_dests} unique destinations)")
    print(f"  /radio spokes    : {len(radio_links)} unique /radio/* hrefs in public/radio.html")
    print(f"  /animals profiles: {len(animal_links)} unique /animals/* hrefs in public/animals.html")
    check((len(links), present, http200, in_sm, unique_dests) == (29, 29, 29, 29, 25), "Hub-matrix link verification mismatch")
    check(len(radio_links) == 23, f"Expected 23 /radio/* links, got {len(radio_links)}")
    check(len(animal_links) == 24, f"Expected 24 /animals/* links, got {len(animal_links)}")

    if errors:
        print("\nVALIDATION FAILED:")
        for e in errors:
            print(f"  - {e}")
        return 1

    print("\nALL PHASE 25.1 RECONCILIATION CHECKS PASSED.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
