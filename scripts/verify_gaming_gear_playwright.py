#!/usr/bin/env python3
"""
Six-viewport Playwright verification for GTA6HeistGuide /gaming-gear/ (Phase 47 LEONIDA DROP)
and Phase 35.1C homepage Amazon Placement Pause guardrail.

Usage:
  python scripts/verify_gaming_gear_playwright.py --local --out verification-screenshots/phase47-leonida-drop
  python scripts/verify_gaming_gear_playwright.py --url https://<preview>.gta6heistguide.pages.dev --out verification-screenshots/phase47-leonida-drop-preview
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

        def do_POST(self):
            length = int(self.headers.get("Content-Length", "0") or "0")
            if length > 0:
                self.rfile.read(length)
            if self.path.startswith("/api/clicks"):
                self.send_response(204)
                self.end_headers()
                return
            self.send_response(404)
            self.end_headers()

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
                context = browser.new_context(viewport={"width": w, "height": h})
                page = context.new_page()
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
                page.wait_for_selector('#leonidaDropMount[data-rendered="dynamic"]', timeout=10000)
                page.wait_for_timeout(400)

                # Capture initial LEONIDA DROP above-the-fold screenshot
                shot_path = os.path.join(out_dir, f"{prefix}_gaming_gear_{label}.png")
                page.screenshot(path=shot_path, full_page=False)

                if label in ("1440x900", "768x1024", "390x844", "360x800"):
                    drop_el = page.locator("#leonida-drop")
                    drop_el.screenshot(path=os.path.join(out_dir, f"{prefix}_leonida_drop_card_{label}.png"))

                # Capture Drop #1 identity & check stability while page stays open
                drop_visit_1 = page.get_attribute("#leonidaDropMount .ld-shell", "data-collection-id")
                page.wait_for_timeout(900)
                drop_stable_open = page.get_attribute("#leonidaDropMount .ld-shell", "data-collection-id") == drop_visit_1

                # Scroll to trigger all lazy images in the lower 6 catalog sections
                page.evaluate("""async () => {
                    const h = document.body.scrollHeight;
                    for (let y = 0; y <= h; y += 500) {
                        window.scrollTo(0, y);
                        await new Promise(r => setTimeout(r, 35));
                    }
                    window.scrollTo(0, 0);
                }""")
                page.wait_for_timeout(500)
                if label in ("1440x900", "390x844"):
                    full_shot = os.path.join(out_dir, f"{prefix}_gaming_gear_{label}_full.png")
                    page.screenshot(path=full_shot, full_page=True)

                # Evaluate DOM metrics on Visit #1
                metrics = page.evaluate("""(expectedSections) => {
                    const overflow = document.documentElement.scrollWidth > window.innerWidth;
                    const dropMount = document.getElementById('leonidaDropMount');
                    const dropCards = Array.from(dropMount ? dropMount.querySelectorAll('.ld-card') : []);
                    const dropProductIds = dropCards.map(c => c.getAttribute('data-product-id'));
                    const dropImgs = Array.from(dropMount ? dropMount.querySelectorAll('img') : []);
                    const dropSvgs = Array.from(dropMount ? dropMount.querySelectorAll('svg') : []);
                    const mainCard = dropMount ? dropMount.querySelector('.ld-card--main') : null;
                    const suppCards = Array.from(dropMount ? dropMount.querySelectorAll('.ld-card--supporting') : []);
                    const mainRect = mainCard ? mainCard.getBoundingClientRect() : null;
                    const suppRects = suppCards.map(c => c.getBoundingClientRect());
                    const mainAboveSupporting = Boolean(
                        mainRect && suppRects.length === 2
                        && mainRect.bottom <= suppRects[0].top + 2
                        && mainRect.bottom <= suppRects[1].top + 2
                    );
                    const nextBtn = document.getElementById('showAnotherDropBtn');
                    const nextBtnHeight = nextBtn ? Math.round(nextBtn.getBoundingClientRect().height) : 0;

                    const imgs = Array.from(document.querySelectorAll('main img'));
                    const brokenImgs = imgs.filter(i => !i.complete || i.naturalWidth === 0).map(i => i.getAttribute('src'));
                    const forbiddenGeneratedImgs = imgs
                        .map(i => i.getAttribute('src') || '')
                        .filter(src => src.includes('gear-illustrations') || /\\.svg(?:$|\\?)/i.test(src) || !src.startsWith('/assets/gear-photos/'));
                    const distortedOrCroppedImgs = imgs.filter(i => {
                        const cs = window.getComputedStyle(i);
                        return cs.objectFit !== 'contain';
                    }).map(i => i.getAttribute('src'));

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
                    const hasLeonidaDropHeading = bodyText.includes('LEONIDA DROP');
                    const hasDropSubtitle = bodyText.includes('Three unusual gaming discoveries. A fresh drop every visit.');
                    const hasShowAnotherDropBtn = Boolean(nextBtn && (nextBtn.innerText || '').toUpperCase().includes('SHOW ANOTHER DROP'));
                    const hasDisclosure = bodyText.includes('As an Amazon Associate I earn from qualifying purchases.');
                    const hasIllustrationLeak = /Category Illustration/i.test(bodyText);
                    const hasPriceLeak = /\\$\\d+(?:\\.\\d{2})?/.test(bodyText);
                    const hasRatingLeak = /\\b\\d\\.\\d\\s*out of 5\\s*stars?\\b/i.test(bodyText);
                    const hasMobileBtn = Boolean(document.querySelector('#mobileMenuBtn.mobile-menu-btn[aria-label="Toggle Navigation Menu"]'));
                    const hasAdsense = Boolean(document.querySelector('script[src*="ca-pub-9556158063903839"]'));

                    return {
                        overflow,
                        dropCardCount: dropCards.length,
                        dropUniqueProducts: new Set(dropProductIds).size,
                        dropImgCount: dropImgs.length,
                        dropSvgCount: dropSvgs.length,
                        mainAboveSupporting,
                        nextBtnHeight,
                        imgCount: imgs.length,
                        brokenImgs,
                        forbiddenGeneratedImgs,
                        distortedOrCroppedImgs,
                        sectionsPresentCount: sectionsPresent.length,
                        cardsCount,
                        photoCardsCount,
                        textOnlyCardsCount: textOnlyCards.length,
                        textOnlyCardsWithImages,
                        amazonLinkCount: amazonLinks.length,
                        invalidLinks,
                        hasLeonidaDropHeading,
                        hasDropSubtitle,
                        hasShowAnotherDropBtn,
                        hasDisclosure,
                        hasIllustrationLeak,
                        hasPriceLeak,
                        hasRatingLeak,
                        hasMobileBtn,
                        hasAdsense,
                    };
                }""", EXPECTED_SECTIONS)

                # Test refresh-driven rotation across ALL 6 collections + wrap on 7th load
                refresh_sequence = [drop_visit_1]
                for _ in range(6):
                    page.reload(wait_until="domcontentloaded")
                    page.wait_for_selector('#leonidaDropMount[data-rendered="dynamic"]', timeout=10000)
                    cid = page.get_attribute("#leonidaDropMount .ld-shell", "data-collection-id")
                    refresh_sequence.append(cid)

                refresh_first_6 = refresh_sequence[:6]
                refresh_cycle_unique = len(set(refresh_first_6)) == 6
                refresh_wraps_cleanly = refresh_sequence[6] == refresh_sequence[0]

                # Capture a second refreshed drop screenshot on 1440x900 to visually inspect rotation
                if label == "1440x900":
                    page.click("#showAnotherDropBtn")
                    page.wait_for_timeout(200)
                    shot_drop2 = os.path.join(out_dir, f"{prefix}_gaming_gear_{label}_drop2.png")
                    page.screenshot(path=shot_drop2, full_page=False)

                # Test SHOW ANOTHER DROP button cycles without repeats or redirects
                before_btn_id = page.get_attribute("#leonidaDropMount .ld-shell", "data-collection-id")
                btn_sequence = [before_btn_id]
                url_before_btn = page.url
                for _ in range(5):
                    page.click("#showAnotherDropBtn")
                    page.wait_for_timeout(80)
                    btn_sequence.append(page.get_attribute("#leonidaDropMount .ld-shell", "data-collection-id"))
                show_another_drop_ok = (len(set(btn_sequence)) == 6) and (page.url == url_before_btn)

                # Test platform filter interaction on 1440x900 and 390x844
                filter_ok = True
                if label in ("1440x900", "390x844"):
                    page.click('button[data-platform-filter="ps5"]')
                    ps5_count = page.locator(".gg-card").count()
                    page.click('button[data-platform-filter="all"]')
                    all_count = page.locator(".gg-card").count()
                    filter_ok = (0 < ps5_count < all_count)

                # Test GA4 affiliate_click tracking on Main Pick (#1) & Supporting Pick (#2)
                analytics_ok = True
                if label == "1440x900":
                    ev_pair = page.evaluate("""() => {
                        const mainBtn = document.querySelector('.ld-cta-btn--main');
                        const suppBtn = document.querySelector('.ld-cta-btn--supporting');
                        if (!mainBtn || !suppBtn) return null;
                        mainBtn.addEventListener('click', (e) => e.preventDefault(), { once: true });
                        suppBtn.addEventListener('click', (e) => e.preventDefault(), { once: true });
                        mainBtn.click();
                        suppBtn.click();
                        const list = (window.GTA6Track && window.GTA6Track.getEvents) ? window.GTA6Track.getEvents() : [];
                        const aff = list.filter(x => x.event === 'affiliate_click');
                        return aff.slice(-2);
                    }""")
                    analytics_ok = bool(
                        ev_pair and len(ev_pair) == 2
                        and ev_pair[0].get("params", {}).get("feature_placement") == "leonida_drop_main"
                        and ev_pair[0].get("params", {}).get("product_position") == 1
                        and bool(ev_pair[0].get("params", {}).get("collection_id"))
                        and ev_pair[0].get("params", {}).get("source_page") == "/gaming-gear/"
                        and ev_pair[1].get("params", {}).get("feature_placement") == "leonida_drop_supporting"
                        and ev_pair[1].get("params", {}).get("product_position") == 2
                        and ev_pair[1].get("params", {}).get("collection_id") == ev_pair[0].get("params", {}).get("collection_id")
                    )

                vp_res = {
                    "viewport": label,
                    "initialCollectionId": drop_visit_1,
                    "stableWhileOpen": drop_stable_open,
                    "refreshSequence": refresh_sequence,
                    "refreshCycleUnique6": refresh_cycle_unique,
                    "refreshWrapsCleanly": refresh_wraps_cleanly,
                    "showAnotherDropOk": show_another_drop_ok,
                    "filterOk": filter_ok,
                    "analyticsOk": analytics_ok,
                    "jsErrors": js_errors,
                    "firstPartyErrors": first_party_errors,
                    **metrics,
                }
                results.append(vp_res)

                if (
                    not vp_res["stableWhileOpen"]
                    or not vp_res["refreshCycleUnique6"]
                    or not vp_res["refreshWrapsCleanly"]
                    or not vp_res["showAnotherDropOk"]
                    or vp_res["dropCardCount"] != 3
                    or vp_res["dropUniqueProducts"] != 3
                    or vp_res["dropImgCount"] != 0
                    or vp_res["dropSvgCount"] != 0
                    or not vp_res["mainAboveSupporting"]
                    or vp_res["nextBtnHeight"] < 44
                    or not vp_res["hasLeonidaDropHeading"]
                    or not vp_res["hasDropSubtitle"]
                    or not vp_res["hasShowAnotherDropBtn"]
                    or vp_res["overflow"]
                    or vp_res["brokenImgs"]
                    or vp_res["forbiddenGeneratedImgs"]
                    or vp_res["distortedOrCroppedImgs"]
                    or vp_res["hasIllustrationLeak"]
                    or vp_res["textOnlyCardsWithImages"] != 0
                    or vp_res["photoCardsCount"] != 8
                    or vp_res["textOnlyCardsCount"] != 42
                    or vp_res["sectionsPresentCount"] != len(EXPECTED_SECTIONS)
                    or vp_res["cardsCount"] != 50
                    or vp_res["invalidLinks"]
                    or not vp_res["hasDisclosure"]
                    or vp_res["hasPriceLeak"]
                    or vp_res["hasRatingLeak"]
                    or not vp_res["hasMobileBtn"]
                    or not vp_res["hasAdsense"]
                    or not vp_res["filterOk"]
                    or not vp_res["analyticsOk"]
                    or vp_res["jsErrors"]
                    or vp_res["firstPartyErrors"]
                ):
                    failures.append(vp_res)

                context.close()

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
        print(f"FAILURES DETECTED: {len(failures)}", file=sys.stderr)
        sys.exit(1)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--local", action="store_true")
    parser.add_argument("--url", default="")
    parser.add_argument("--out", default="verification-screenshots/phase47-leonida-drop")
    parser.add_argument("--prefix", default="LOCAL_DROP")
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
