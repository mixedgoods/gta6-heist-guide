#!/usr/bin/env python3
"""
Six-viewport Playwright verification for GTA6HeistGuide /gaming-gear/
and Phase 35.1C homepage Amazon Placement Pause guardrail.

Usage:
  python scripts/verify_gaming_gear_playwright.py --local --out verification-screenshots/phase47
  python scripts/verify_gaming_gear_playwright.py --url https://<preview>.gta6heistguide.pages.dev --out verification-screenshots/phase47-preview
"""
import argparse
import http.server
import json
import os
import re
import socketserver
import sys
import threading
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright

VIEWPORTS = [
    ("360x800", 360, 800),
    ("375x667", 375, 667),
    ("390x844", 390, 844),
    ("430x932", 430, 932),
    ("768x1024", 768, 1024),
    ("1440x900", 1440, 900),
]

EXPECTED_SECTIONS = [
    "controllers",
    "charging-solutions",
    "affordable-headsets",
    "ps5-storage",
    "gaming-room",
    "funny-gear",
]


def start_local_server(public_dir: str):
    class QuietHandler(http.server.SimpleHTTPRequestHandler):
        def __init__(self, *args, **kwargs):
            super().__init__(*args, directory=public_dir, **kwargs)

        def log_message(self, format, *args):
            pass

    httpd = socketserver.TCPServer(("127.0.0.1", 0), QuietHandler)
    port = httpd.server_address[1]
    t = threading.Thread(target=httpd.serve_forever, daemon=True)
    t.start()
    return httpd, f"http://127.0.0.1:{port}"


def run_suite(base_url: str, out_dir: str, prefix: str):
    os.makedirs(out_dir, exist_ok=True)
    origin_host = urlparse(base_url).netloc
    results = []
    failures = []

    with sync_playwright() as p:
        browser = p.chromium.launch()
        try:
            # 1. Six-viewport sweep on /gaming-gear/
            for label, w, h in VIEWPORTS:
                page = browser.new_page(viewport={"width": w, "height": h})
                js_errors = []
                first_party_errors = []

                page.on("pageerror", lambda exc: js_errors.append(str(exc)))

                def on_response(resp):
                    try:
                        u = urlparse(resp.url)
                        if u.netloc == origin_host and resp.status >= 400:
                            first_party_errors.append(f"{resp.status} {u.path}")
                    except Exception:
                        pass

                page.on("response", on_response)

                target = f"{base_url.rstrip('/')}/gaming-gear/"
                page.goto(target, wait_until="domcontentloaded")
                page.wait_for_selector('#leonidaEditorsPickMount[data-rendered="dynamic"]', timeout=10000)
                page.wait_for_timeout(400)

                # Capture above-the-fold screenshot for all 6 viewports
                shot_path = os.path.join(out_dir, f"{prefix}_gaming_gear_{label}.png")
                page.screenshot(path=shot_path, full_page=False)

                # Scroll to trigger all lazy images so we can verify every product image loads
                page.evaluate("""async () => {
                    const h = document.body.scrollHeight;
                    for (let y = 0; y <= h; y += 500) {
                        window.scrollTo(0, y);
                        await new Promise(r => setTimeout(r, 40));
                    }
                    window.scrollTo(0, 0);
                }""")
                page.wait_for_timeout(600)
                if label in ("1440x900", "390x844"):
                    full_shot = os.path.join(out_dir, f"{prefix}_gaming_gear_{label}_full.png")
                    page.screenshot(path=full_shot, full_page=True)

                pick_id_1 = page.get_attribute("#leonidaEditorsPickMount .lep-card", "data-daily-pick-id")
                pick_date = page.get_attribute("#leonidaEditorsPickMount .lep-card", "data-daily-date")
                cta_text = (page.text_content(".lep-cta-btn") or "").strip()
                cta_href = page.get_attribute(".lep-cta-btn", "href") or ""
                cta_rel = page.get_attribute(".lep-cta-btn", "rel") or ""

                # Check reload stability
                page.reload(wait_until="domcontentloaded")
                page.wait_for_selector('#leonidaEditorsPickMount[data-rendered="dynamic"]', timeout=10000)
                page.wait_for_timeout(300)
                pick_id_2 = page.get_attribute("#leonidaEditorsPickMount .lep-card", "data-daily-pick-id")

                # Scroll again after reload before image check
                page.evaluate("""async () => {
                    const h = document.body.scrollHeight;
                    for (let y = 0; y <= h; y += 600) {
                        window.scrollTo(0, y);
                        await new Promise(r => setTimeout(r, 35));
                    }
                    window.scrollTo(0, 0);
                }""")
                page.wait_for_timeout(400)

                metrics = page.evaluate("""(expectedSections) => {
                    const overflow = document.documentElement.scrollWidth > window.innerWidth;
                    const imgs = Array.from(document.querySelectorAll('main img'));
                    const brokenImgs = imgs.filter(i => !i.complete || i.naturalWidth === 0).map(i => i.getAttribute('src'));
                    const forbiddenGeneratedImgs = imgs
                        .map(i => i.getAttribute('src') || '')
                        .filter(src => src.includes('gear-illustrations') || /\\.svg(?:$|\\?)/i.test(src) || !src.startsWith('/assets/gear-photos/'));
                    const distortedOrCroppedImgs = imgs.filter(i => {
                        const cs = window.getComputedStyle(i);
                        return cs.objectFit !== 'contain';
                    }).map(i => i.getAttribute('src'));
                    const dailyImg = document.querySelector('#leonidaEditorsPickMount .lep-media-stage img');
                    const dailyHasRealPhoto = Boolean(
                        dailyImg
                        && dailyImg.complete
                        && dailyImg.naturalWidth > 0
                        && (dailyImg.getAttribute('src') || '').startsWith('/assets/gear-photos/')
                    );
                    const sectionsPresent = expectedSections.filter(id => Boolean(document.getElementById(id)));
                    const cardsCount = document.querySelectorAll('.gg-card').length;
                    const photoCardsCount = document.querySelectorAll('.gg-card[data-media-mode="photo"]').length;
                    const textOnlyCards = Array.from(document.querySelectorAll('.gg-card[data-media-mode="text-only"]'));
                    const textOnlyCardsWithImages = textOnlyCards.filter(c => c.querySelector('img, svg')).length;
                    const amazonLinks = Array.from(document.querySelectorAll('main a[href*="amazon.com"]'));
                    const invalidLinks = amazonLinks.filter(a => {
                        const h = a.getAttribute('href') || '';
                        const rel = a.getAttribute('rel') || '';
                        return !/^https:\\/\\/www\\.amazon\\.com\\/dp\\/[A-Z0-9]{10}\\?tag=gta6heistguid-20$/.test(h)
                            || !rel.includes('sponsored') || !rel.includes('nofollow') || !rel.includes('noopener');
                    }).map(a => a.getAttribute('href'));
                    const bodyText = document.body.innerText || '';
                    const hasDisclosure = bodyText.includes('As an Amazon Associate I earn from qualifying purchases.');
                    const hasIllustrationLeak = /Category Illustration/i.test(bodyText);
                    const hasPriceLeak = /\\$\\d+(?:\\.\\d{2})?/.test(bodyText);
                    const hasRatingLeak = /\\b\\d\\.\\d\\s*out of 5\\s*stars?\\b/i.test(bodyText);
                    const hasMobileBtn = Boolean(document.querySelector('#mobileMenuBtn.mobile-menu-btn[aria-label="Toggle Navigation Menu"]'));
                    return {
                        overflow,
                        imgCount: imgs.length,
                        brokenImgs,
                        forbiddenGeneratedImgs,
                        distortedOrCroppedImgs,
                        dailyHasRealPhoto,
                        sectionsPresentCount: sectionsPresent.length,
                        cardsCount,
                        photoCardsCount,
                        textOnlyCardsCount: textOnlyCards.length,
                        textOnlyCardsWithImages,
                        amazonLinkCount: amazonLinks.length,
                        invalidLinks,
                        hasDisclosure,
                        hasIllustrationLeak,
                        hasPriceLeak,
                        hasRatingLeak,
                        hasMobileBtn,
                    };
                }""", EXPECTED_SECTIONS)

                # Test platform filter interaction on 1440x900 and 390x844
                filter_ok = True
                if label in ("1440x900", "390x844"):
                    page.click('button[data-platform-filter="ps5"]')
                    ps5_count = page.locator(".gg-card").count()
                    page.click('button[data-platform-filter="all"]')
                    all_count = page.locator(".gg-card").count()
                    filter_ok = (0 < ps5_count < all_count)

                # Test click analytics event firing (prevent actual navigation in test)
                analytics_ok = True
                if label == "1440x900":
                    ev = page.evaluate("""() => {
                        const btn = document.querySelector('.lep-cta-btn');
                        if (!btn) return null;
                        btn.addEventListener('click', (e) => e.preventDefault(), { once: true });
                        btn.click();
                        const list = (window.GTA6Track && window.GTA6Track.getEvents) ? window.GTA6Track.getEvents() : [];
                        return list.filter(x => x.event === 'affiliate_click').pop() || null;
                    }""")
                    analytics_ok = bool(
                        ev
                        and ev.get("params", {}).get("feature_placement") == "editors_pick_daily"
                        and ev.get("params", {}).get("destination_host") == "www.amazon.com"
                        and str(ev.get("params", {}).get("daily_editorial_slot", "")).startswith("daily_")
                    )

                vp_res = {
                    "viewport": label,
                    "dailyPickId": pick_id_1,
                    "dailyPickStableOnReload": pick_id_1 == pick_id_2 and bool(pick_id_1),
                    "dailyDate": pick_date,
                    "ctaText": cta_text,
                    "ctaValid": bool(re.match(r"^https://www\.amazon\.com/dp/[A-Z0-9]{10}\?tag=gta6heistguid-20$", cta_href))
                                and "sponsored" in cta_rel and "nofollow" in cta_rel and "noopener" in cta_rel,
                    "filterOk": filter_ok,
                    "analyticsOk": analytics_ok,
                    "jsErrors": js_errors,
                    "firstPartyErrors": first_party_errors,
                    **metrics,
                }
                results.append(vp_res)

                if (
                    not vp_res["dailyPickStableOnReload"]
                    or not vp_res["dailyHasRealPhoto"]
                    or not vp_res["ctaValid"]
                    or "CHECK IT OUT ON AMAZON" not in cta_text
                    or vp_res["overflow"]
                    or vp_res["brokenImgs"]
                    or vp_res["forbiddenGeneratedImgs"]
                    or vp_res["distortedOrCroppedImgs"]
                    or vp_res["hasIllustrationLeak"]
                    or vp_res["textOnlyCardsWithImages"] != 0
                    or vp_res["photoCardsCount"] != 8
                    or vp_res["textOnlyCardsCount"] != 27
                    or vp_res["sectionsPresentCount"] != len(EXPECTED_SECTIONS)
                    or vp_res["cardsCount"] < 25
                    or vp_res["invalidLinks"]
                    or not vp_res["hasDisclosure"]
                    or vp_res["hasPriceLeak"]
                    or vp_res["hasRatingLeak"]
                    or not vp_res["hasMobileBtn"]
                    or not vp_res["filterOk"]
                    or not vp_res["analyticsOk"]
                    or vp_res["jsErrors"]
                    or vp_res["firstPartyErrors"]
                ):
                    failures.append(vp_res)

                page.close()

            # 2. Verify Homepage Phase 35.1C Amazon Placement Pause remains untouched
            home_page = browser.new_page(viewport={"width": 1440, "height": 900})
            home_page.goto(f"{base_url.rstrip('/')}/", wait_until="domcontentloaded")
            home_page.wait_for_timeout(600)
            home_check = home_page.evaluate("""() => {
                const visibleAmzCards = Array.from(document.querySelectorAll('.aff-card, [data-amazon-placement-module="1"]'))
                    .filter(el => el.offsetParent !== null).length;
                const pauseFlag = window.SITE_CONFIG ? window.SITE_CONFIG.enableAmazonProductPlacements : null;
                return { visibleAmzCards, pauseFlag };
            }""")
            home_page.close()

        finally:
            browser.close()

    summary = {
        "baseUrl": base_url,
        "viewportsTested": len(results),
        "viewportsPassed": len(results) - len(failures),
        "homepagePauseCheck": home_check,
        "results": results,
    }
    report_path = os.path.join(out_dir, f"{prefix}_playwright_results.json")
    with open(report_path, "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2)

    print(json.dumps(summary, indent=2))
    if failures or home_check.get("visibleAmzCards", 1) != 0 or home_check.get("pauseFlag") is not False:
        sys.exit(1)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--local", action="store_true")
    parser.add_argument("--url", default="")
    parser.add_argument("--out", default="verification-screenshots/phase47")
    parser.add_argument("--prefix", default="AFTER")
    args = parser.parse_args()

    if args.local:
        httpd, url = start_local_server("public")
        try:
            run_suite(url, args.out, args.prefix)
        finally:
            httpd.shutdown()
    else:
        if not args.url:
            print("Provide --local or --url", file=sys.stderr)
            sys.exit(2)
        run_suite(args.url, args.out, args.prefix)


if __name__ == "__main__":
    main()
