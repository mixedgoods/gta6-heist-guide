#!/usr/bin/env python3
"""
Phase 48 — Six-Viewport Playwright QA Suite (Local HTTP & Cloudflare Pages Preview)
Covers all 10 required page categories across 6 viewports:
  360x800, 375x667, 390x844, 430x932, 768x1024, 1440x900

STRICT SAFETY:
- NEVER clicks any advertisements or triggers artificial ad impressions/clicks.
- Verifies AdSense script integrity, zero fabricated ad slots, Amazon compact cards,
  Phase 35.1C homepage guardrail, Sponsorship Prospectus, interactive tool integrity,
  0 horizontal overflow, 0 broken images, 0 console pageerrors, 0 first-party HTTP errors.
"""
import argparse
import http.server
import json
import os
import socketserver
import sys
import threading
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright

VIEWPORTS = [
    (360, 800),
    (375, 667),
    (390, 844),
    (430, 932),
    (768, 1024),
    (1440, 900),
]

ROUTES = [
    {"path": "/", "name": "homepage", "expect_amz_cards": 0, "check_pause": True},
    {"path": "/gaming-gear/", "name": "gaming_gear", "expect_amz_cards_min": 50},
    {"path": "/gta-6-settings/", "name": "settings_hw", "expect_amz_cards_min": 14, "expect_gear_link": True},
    {"path": "/missions/", "name": "mission_hub"},
    {"path": "/heists/the-cartel-heist", "name": "heist_guide"},
    {"path": "/vehicles", "name": "vehicles_db"},
    {"path": "/map", "name": "leonida_map", "protected_tool": True},
    {"path": "/my-leonida/", "name": "my_leonida", "protected_tool": True},
    {"path": "/heist-payout-calculator", "name": "heist_calc", "protected_tool": True},
    {"path": "/gta-6-discoveries/", "name": "community_discoveries"},
    {"path": "/acquisitions", "name": "sponsorship_prospectus"},
    {"path": "/cheats", "name": "cheats_cleaned"},
]


class CleanUrlHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        pass

    def translate_path(self, path_str):
        parsed = urlparse(path_str).path
        rel = parsed.lstrip("/")
        base = self.directory
        candidate = os.path.join(base, rel)
        if os.path.isfile(candidate):
            return candidate
        if os.path.isdir(candidate):
            idx = os.path.join(candidate, "index.html")
            if os.path.isfile(idx):
                return idx
        html_cand = candidate + ".html"
        if os.path.isfile(html_cand):
            return html_cand
        return candidate


def start_local_server(public_dir: str):
    handler = lambda *args, **kwargs: CleanUrlHandler(*args, directory=public_dir, **kwargs)
    httpd = socketserver.TCPServer(("127.0.0.1", 0), handler)
    port = httpd.server_address[1]
    t = threading.Thread(target=httpd.serve_forever, daemon=True)
    t.start()
    return httpd, port


def run_qa(base_url: str, out_dir: str, label: str):
    os.makedirs(out_dir, exist_ok=True)
    origin_host = urlparse(base_url).hostname
    results = []
    failures = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        for vw, vh in VIEWPORTS:
            context = browser.new_context(viewport={"width": vw, "height": vh})
            page = context.new_page()
            # Block third-party ad network fetches during local/preview QA so we never generate artificial impressions
            page.route(
                "**/*",
                lambda route: route.abort()
                if any(
                    d in route.request.url
                    for d in (
                        "pagead2.googlesyndication.com",
                        "googleads.g.doubleclick.net",
                        "googletagmanager.com",
                        "google-analytics.com",
                    )
                )
                else route.continue_(),
            )

            for r in ROUTES:
                url = base_url.rstrip("/") + r["path"]
                page_errors = []
                first_party_errors = []

                def on_pageerror(err):
                    page_errors.append(str(err))

                def on_response(resp):
                    try:
                        u = urlparse(resp.url)
                        if u.hostname == origin_host and resp.status >= 400:
                            # Ignore expected /api/* 404/503 on static local server
                            if not u.path.startswith("/api/"):
                                first_party_errors.append(f"{resp.status} {u.path}")
                    except Exception:
                        pass

                page.on("pageerror", on_pageerror)
                page.on("response", on_response)

                resp = page.goto(url, wait_until="domcontentloaded", timeout=30000)
                page.wait_for_timeout(450)
                status = resp.status if resp else 0

                metrics = page.evaluate(
                    """() => {
                        const overflow = Math.max(0, document.documentElement.scrollWidth - window.innerWidth);
                        const adsScripts = document.querySelectorAll('script[src*="pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]').length;
                        const fakeSlots = Array.from(document.querySelectorAll('[data-ad-slot]'))
                            .map(el => el.getAttribute('data-ad-slot') || '')
                            .filter(v => !/^\\d{6,}$/.test(v.trim()));
                        const manualIns = document.querySelectorAll('ins.adsbygoogle').length;
                        const visibleAmzCards = Array.from(document.querySelectorAll('.amz-card')).filter(el => {
                            const cs = window.getComputedStyle(el);
                            const r = el.getBoundingClientRect();
                            return cs.display !== 'none' && cs.visibility !== 'hidden' && r.width > 0 && r.height > 0;
                        }).length;
                        const pauseFlag = window.SITE_CONFIG ? window.SITE_CONFIG.enableAmazonProductPlacements : null;
                        const brokenImgs = Array.from(document.querySelectorAll('img')).filter(img => {
                            const cs = window.getComputedStyle(img);
                            if (cs.display === 'none' || cs.visibility === 'hidden') return false;
                            return img.complete && img.naturalWidth === 0;
                        }).map(img => img.getAttribute('src'));
                        const badAmzLinks = Array.from(document.querySelectorAll('a[href*="amazon.com"]')).filter(a => {
                            const h = a.getAttribute('href') || '';
                            const rel = (a.getAttribute('rel') || '').toLowerCase();
                            return !h.includes('tag=gta6heistguid-20') || !rel.includes('sponsored');
                        }).length;
                        const gearBodyLink = Boolean(document.querySelector('main a[href*="/gaming-gear/"]'));
                        return {
                            overflow,
                            adsScripts,
                            fakeSlots,
                            manualIns,
                            visibleAmzCards,
                            pauseFlag,
                            brokenImgs,
                            badAmzLinks,
                            gearBodyLink,
                        };
                    }"""
                )

                page.remove_listener("pageerror", on_pageerror)
                page.remove_listener("response", on_response)

                route_fails = []
                if status != 200:
                    route_fails.append(f"HTTP {status}")
                if metrics["overflow"] > 1:
                    route_fails.append(f"overflow={metrics['overflow']}px")
                if metrics["adsScripts"] != 1:
                    route_fails.append(f"adsScripts={metrics['adsScripts']}")
                if metrics["fakeSlots"]:
                    route_fails.append(f"fakeSlots={metrics['fakeSlots']}")
                if r.get("protected_tool") and metrics["manualIns"] > 0:
                    route_fails.append(f"manualIns={metrics['manualIns']}")
                if r.get("check_pause"):
                    if metrics["pauseFlag"] is not False:
                        route_fails.append(f"pauseFlag={metrics['pauseFlag']}")
                    if metrics["visibleAmzCards"] != 0:
                        route_fails.append(f"homeVisibleAmzCards={metrics['visibleAmzCards']}")
                if "expect_amz_cards_min" in r and metrics["visibleAmzCards"] < r["expect_amz_cards_min"]:
                    route_fails.append(f"visibleAmzCards={metrics['visibleAmzCards']} < {r['expect_amz_cards_min']}")
                if r.get("expect_gear_link") and not metrics["gearBodyLink"]:
                    route_fails.append("missing body /gaming-gear/ link")
                if metrics["brokenImgs"]:
                    route_fails.append(f"brokenImgs={metrics['brokenImgs'][:5]}")
                if metrics["badAmzLinks"] > 0:
                    route_fails.append(f"badAmzLinks={metrics['badAmzLinks']}")
                if page_errors:
                    route_fails.append(f"pageErrors={page_errors[:2]}")
                if first_party_errors:
                    route_fails.append(f"httpErrors={first_party_errors[:3]}")

                # Capture representative screenshots on 1440x900 and 390x844
                if (vw, vh) in ((1440, 900), (390, 844)) and r["name"] in ("homepage", "gaming_gear", "settings_hw", "sponsorship_prospectus", "leonida_map"):
                    shot = os.path.join(out_dir, f"{label}_{r['name']}_{vw}x{vh}.png")
                    page.screenshot(path=shot, full_page=False)

                rec = {
                    "viewport": f"{vw}x{vh}",
                    "route": r["path"],
                    "status": status,
                    "metrics": metrics,
                    "page_errors": page_errors,
                    "first_party_errors": first_party_errors,
                    "pass": len(route_fails) == 0,
                    "failures": route_fails,
                }
                results.append(rec)
                if route_fails:
                    failures.append(rec)

            context.close()
        browser.close()

    summary = {
        "label": label,
        "base_url": base_url,
        "total_checks": len(results),
        "passed": sum(1 for x in results if x["pass"]),
        "failed": len(failures),
        "viewports": [f"{w}x{h}" for w, h in VIEWPORTS],
        "routes": [r["path"] for r in ROUTES],
        "failures": failures,
        "results": results,
    }
    out_json = os.path.join(out_dir, f"{label}_phase48_playwright_results.json")
    with open(out_json, "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2)

    print(f"=== PHASE 48 PLAYWRIGHT QA ({label}) ===")
    print(f"Checks: {summary['passed']}/{summary['total_checks']} PASS | Failures: {summary['failed']}")
    for fl in failures[:20]:
        print(f"  FAIL {fl['viewport']} {fl['route']}: {fl['failures']}")
    return summary["failed"] == 0


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--base-url", default="", help="Base URL (if omitted, starts local static server for public/)")
    parser.add_argument("--out-dir", default="verification-screenshots/phase48-global-monetization")
    parser.add_argument("--label", default="LOCAL")
    args = parser.parse_args()

    repo_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    public_dir = os.path.join(repo_root, "public")
    out_dir = args.out_dir if os.path.isabs(args.out_dir) else os.path.join(repo_root, args.out_dir)

    httpd = None
    base_url = args.base_url
    if not base_url:
        httpd, port = start_local_server(public_dir)
        base_url = f"http://127.0.0.1:{port}"
    try:
        ok = run_qa(base_url, out_dir, args.label)
    finally:
        if httpd:
            httpd.shutdown()
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
