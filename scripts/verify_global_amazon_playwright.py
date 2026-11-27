#!/usr/bin/env python3
"""
Global Site-Wide Amazon Product Display Redesign — 6-Viewport Playwright QA
Supports both local static server mode (no URL arg) and live Preview URL mode (argv[1]).
"""
import json
import sys
import threading
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
PUBLIC_DIR = ROOT / "public"

VIEWPORTS = [
    ("360x800", 360, 800),
    ("375x667", 375, 667),
    ("390x844", 390, 844),
    ("430x932", 430, 932),
    ("768x1024", 768, 1024),
    ("1440x900", 1440, 900),
]

CORE_ROUTES = [
    ("gaming_gear", "/gaming-gear/"),
    ("gta6_settings", "/gta-6-settings/"),
]

SECONDARY_ROUTES = [
    ("home", "/"),
    ("affiliates_gear", "/affiliates-gear.html"),
    ("gameplay_mechanics", "/gameplay-mechanics.html"),
    ("heist_payout_calc", "/heist-payout-calculator.html"),
    ("drops", "/drops.html"),
    ("cheats", "/cheats.html"),
    ("secrets", "/secrets.html"),
    ("free_tools", "/free/"),
]


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        pass


def start_server():
    handler = partial(QuietHandler, directory=str(PUBLIC_DIR))
    server = ThreadingHTTPServer(("127.0.0.1", 0), handler)
    port = server.server_address[1]
    t = threading.Thread(target=server.serve_forever, daemon=True)
    t.start()
    return server, port


def inspect_page_metrics(page, route):
    return page.evaluate(
        """(route) => {
            const overflowPx = Math.max(0, document.documentElement.scrollWidth - window.innerWidth);
            const brokenImgs = Array.from(document.querySelectorAll('img'))
                .filter(img => {
                    const style = window.getComputedStyle(img);
                    const rect = img.getBoundingClientRect();
                    return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && img.complete && img.naturalWidth === 0;
                })
                .map(img => img.getAttribute('src'));

            const visibleCards = Array.from(document.querySelectorAll('article.amz-card')).filter(el => {
                const st = window.getComputedStyle(el);
                const r = el.getBoundingClientRect();
                return st.display !== 'none' && st.visibility !== 'hidden' && r.width > 0 && r.height > 0;
            });

            const cardHeights = visibleCards.map(el => Math.round(el.getBoundingClientRect().height));
            const maxCardHeight = cardHeights.length ? Math.max(...cardHeights) : 0;
            const minCardHeight = cardHeights.length ? Math.min(...cardHeights) : 0;
            const avgCardHeight = cardHeights.length ? Math.round(cardHeights.reduce((a, b) => a + b, 0) / cardHeights.length) : 0;

            const cardImgs = visibleCards.flatMap(el => Array.from(el.querySelectorAll('img')).map(i => i.getAttribute('src') || ''));
            const cardSvgs = visibleCards.flatMap(el => Array.from(el.querySelectorAll('svg')).map(() => 'svg'));
            const detailsAllClosed = visibleCards.every(el => {
                const d = el.querySelector('details.amz-card__details');
                return d && !d.open;
            });

            const amzLinks = visibleCards.flatMap(el => Array.from(el.querySelectorAll('a.amz-card__cta')));
            const invalidLinks = amzLinks.filter(a => {
                const href = a.href || '';
                const rel = (a.getAttribute('rel') || '').toLowerCase();
                return !href.includes('amazon.com/dp/') || !href.includes('tag=gta6heistguid-20') || !rel.includes('sponsored') || !rel.includes('nofollow') || !rel.includes('noopener');
            }).map(a => a.href);

            const fakeStars = visibleCards.filter(el => /★/.test(el.textContent || '')).length;
            const descWords = visibleCards.map(el => {
                const d = el.querySelector('.amz-card__desc');
                return d ? d.textContent.trim().split(/\\s+/).filter(Boolean).length : 0;
            });
            const maxDescWords = descWords.length ? Math.max(...descWords) : 0;

            // Check Leonida Drop 3-column alignment on desktop
            let dropCols = 0;
            let dropHeights = [];
            const dropCards = Array.from(document.querySelectorAll('.amz-grid--drop > article.amz-card'));
            if (dropCards.length === 3) {
                const tops = dropCards.map(c => Math.round(c.getBoundingClientRect().top));
                dropCols = new Set(tops).size === 1 ? 3 : (new Set(tops).size === 2 ? 2 : 1);
                dropHeights = dropCards.map(c => Math.round(c.getBoundingClientRect().height));
            }

            // Check AdSense script present
            const hasAdSense = Boolean(document.querySelector('script[src*="pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"][src*="ca-pub-9556158063903839"]'));
            const hasDisclosure = /As an Amazon Associate I earn from qualifying purchases\\./i.test(document.body.innerText || '');
            const pauseFlag = window.SITE_CONFIG ? window.SITE_CONFIG.enableAmazonProductPlacements : null;

            return {
                route,
                overflowPx,
                brokenImgs,
                visibleCardCount: visibleCards.length,
                minCardHeight,
                avgCardHeight,
                maxCardHeight,
                cardImgCount: cardImgs.length,
                cardSvgCount: cardSvgs.length,
                detailsAllClosed,
                amzLinkCount: amzLinks.length,
                invalidLinks,
                fakeStars,
                maxDescWords,
                dropCardCount: dropCards.length,
                dropCols,
                dropHeights,
                hasAdSense,
                hasDisclosure,
                pauseFlag,
            };
        }""",
        route,
    )


def main():
    live_base = sys.argv[1].rstrip("/") if len(sys.argv) > 1 else None
    mode = "preview" if live_base else "local"
    out_dir = ROOT / "verification-screenshots" / "phase47-global-amazon-redesign" / f"after_{mode}"
    out_dir.mkdir(parents=True, exist_ok=True)

    server = None
    if live_base:
        base_url = live_base
    else:
        server, port = start_server()
        base_url = f"http://127.0.0.1:{port}"

    report = {"mode": mode, "base_url": base_url, "core_viewports": {}, "interactions": {}, "secondary_routes": {}, "failures": []}

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch()

            # 1. Six-viewport sweep on core active Amazon product pages (/gaming-gear/ & /gta-6-settings/)
            for vp_name, w, h in VIEWPORTS:
                report["core_viewports"][vp_name] = {}
                ctx = browser.new_context(viewport={"width": w, "height": h})
                page = ctx.new_page()
                for slug, route in CORE_ROUTES:
                    page_errors = []
                    page.on("pageerror", lambda err, errs=page_errors: errs.append(str(err)))
                    resp = page.goto(base_url + route, wait_until="networkidle", timeout=30000)
                    page.wait_for_timeout(350)
                    metrics = inspect_page_metrics(page, route)
                    metrics["httpStatus"] = resp.status if resp else 0
                    metrics["pageErrors"] = list(page_errors)
                    report["core_viewports"][vp_name][slug] = metrics

                    # Assertions
                    if metrics["httpStatus"] != 200:
                        report["failures"].append(f"{vp_name} {route}: HTTP {metrics['httpStatus']}")
                    if metrics["overflowPx"] > 1:
                        report["failures"].append(f"{vp_name} {route}: horizontal overflow {metrics['overflowPx']}px")
                    if metrics["brokenImgs"]:
                        report["failures"].append(f"{vp_name} {route}: broken imgs {metrics['brokenImgs']}")
                    if metrics["pageErrors"]:
                        report["failures"].append(f"{vp_name} {route}: JS errors {metrics['pageErrors']}")
                    if metrics["cardImgCount"] > 0 or metrics["cardSvgCount"] > 0:
                        report["failures"].append(f"{vp_name} {route}: unauthorized card images/SVGs ({metrics['cardImgCount']}/{metrics['cardSvgCount']})")
                    if metrics["invalidLinks"]:
                        report["failures"].append(f"{vp_name} {route}: invalid Amazon links {metrics['invalidLinks']}")
                    if metrics["fakeStars"] > 0:
                        report["failures"].append(f"{vp_name} {route}: fake star ratings found")
                    if not metrics["hasAdSense"]:
                        report["failures"].append(f"{vp_name} {route}: AdSense missing")
                    if not metrics["hasDisclosure"]:
                        report["failures"].append(f"{vp_name} {route}: Amazon Associates disclosure missing")
                    if not metrics["detailsAllClosed"]:
                        report["failures"].append(f"{vp_name} {route}: expandable details not collapsed initially")
                    if slug == "gaming_gear":
                        if metrics["visibleCardCount"] != 53:
                            report["failures"].append(f"{vp_name} {route}: expected 53 visible cards (3 drop + 50 catalog), got {metrics['visibleCardCount']}")
                        if w >= 1440 and metrics["dropCols"] != 3:
                            report["failures"].append(f"{vp_name} {route}: expected 3-column Leonida Drop row on desktop, got {metrics['dropCols']}")
                    if slug == "gta6_settings":
                        if metrics["visibleCardCount"] != 14:
                            report["failures"].append(f"{vp_name} {route}: expected 14 hardware cards, got {metrics['visibleCardCount']}")

                    # Capture AFTER screenshots on key viewports
                    if vp_name in ("1440x900", "768x1024", "390x844", "360x800"):
                        if slug == "gaming_gear":
                            page.screenshot(path=str(out_dir / f"AFTER_{slug}_drop_{vp_name}.png"), full_page=False)
                            sec1 = page.locator("#controllers")
                            if sec1.count() > 0:
                                sec1.scroll_into_view_if_needed()
                                page.wait_for_timeout(150)
                                page.screenshot(path=str(out_dir / f"AFTER_{slug}_catalog_{vp_name}.png"), full_page=False)
                            page.evaluate("window.scrollTo(0, 0)")
                        elif slug == "gta6_settings":
                            sec = page.locator("#hardware-comparison")
                            if sec.count() > 0:
                                sec.scroll_into_view_if_needed()
                                page.wait_for_timeout(150)
                                page.screenshot(path=str(out_dir / f"AFTER_{slug}_hw_{vp_name}.png"), full_page=False)
                            page.evaluate("window.scrollTo(0, 0)")
                ctx.close()

            # 2. Interactive behavior checks (1440x900): Leonida Drop rotation, expandable <details>, Settings filters
            ctx = browser.new_context(viewport={"width": 1440, "height": 900})
            page = ctx.new_page()
            page.goto(base_url + "/gaming-gear/", wait_until="networkidle", timeout=30000)
            page.wait_for_timeout(300)
            col1 = page.locator("#leonidaDropMount").get_attribute("data-active-collection")
            # Toggle first expandable details open
            first_summary = page.locator(".amz-grid--drop details.amz-card__details summary").first
            first_summary.click()
            page.wait_for_timeout(100)
            is_open_after_click = page.locator(".amz-grid--drop details.amz-card__details").first.evaluate("el => el.open")
            # Click SHOW ANOTHER DROP
            page.locator("#showAnotherDropBtn").click()
            page.wait_for_timeout(200)
            col2 = page.locator("#leonidaDropMount").get_attribute("data-active-collection")
            # Refresh page to verify refresh rotation
            page.reload(wait_until="networkidle")
            page.wait_for_timeout(300)
            col3 = page.locator("#leonidaDropMount").get_attribute("data-active-collection")
            report["interactions"]["gaming_gear"] = {
                "initialCollection": col1,
                "afterButtonClick": col2,
                "afterPageRefresh": col3,
                "detailsExpandedOnClick": is_open_after_click,
                "allDistinct": len({col1, col2, col3}) == 3,
            }
            if not is_open_after_click:
                report["failures"].append("Interaction: gaming-gear expandable details did not open on click")
            if len({col1, col2, col3}) != 3:
                report["failures"].append(f"Interaction: Leonida Drop failed to rotate across 3 distinct drops ({col1}, {col2}, {col3})")

            # Settings hub filters + expandable details
            page.goto(base_url + "/gta-6-settings/", wait_until="networkidle", timeout=30000)
            page.wait_for_timeout(300)
            page.locator('[data-hw-cat-btn="ps5-ssd"]').click()
            page.wait_for_timeout(100)
            ps5_count = page.evaluate("Array.from(document.querySelectorAll('.hw-card')).filter(c => getComputedStyle(c).display !== 'none').length")
            page.locator('[data-hw-cat-btn="xbox-card"]').click()
            page.wait_for_timeout(100)
            xbox_count = page.evaluate("Array.from(document.querySelectorAll('.hw-card')).filter(c => getComputedStyle(c).display !== 'none').length")
            page.locator('[data-hw-cat-btn="all"]').click()
            page.wait_for_timeout(100)
            hw_summary = page.locator("#hardwareComparisonGrid details.amz-card__details summary").first
            hw_summary.click()
            page.wait_for_timeout(100)
            hw_open = page.locator("#hardwareComparisonGrid details.amz-card__details").first.evaluate("el => el.open")
            report["interactions"]["gta6_settings"] = {
                "ps5SsdCount": ps5_count,
                "xboxCardCount": xbox_count,
                "detailsExpandedOnClick": hw_open,
            }
            if ps5_count != 3 or xbox_count != 2 or not hw_open:
                report["failures"].append(f"Interaction: gta-6-settings filter/details failed (ps5={ps5_count}, xbox={xbox_count}, open={hw_open})")

            # 3. Secondary routes check (Homepage pause, paused card pages, AdSense, overflow, AFTER screenshots)
            for vp_name, w, h in [("1440x900", 1440, 900), ("390x844", 390, 844)]:
                ctx2 = browser.new_context(viewport={"width": w, "height": h})
                p2 = ctx2.new_page()
                for slug, route in SECONDARY_ROUTES:
                    errs = []
                    p2.on("pageerror", lambda err, e=errs: e.append(str(err)))
                    resp = p2.goto(base_url + route, wait_until="networkidle", timeout=30000)
                    p2.wait_for_timeout(250)
                    m = inspect_page_metrics(p2, route)
                    m["httpStatus"] = resp.status if resp else 0
                    m["pageErrors"] = list(errs)
                    report["secondary_routes"].setdefault(vp_name, {})[slug] = m
                    if m["httpStatus"] != 200:
                        report["failures"].append(f"Secondary {vp_name} {route}: HTTP {m['httpStatus']}")
                    if m["overflowPx"] > 1:
                        report["failures"].append(f"Secondary {vp_name} {route}: overflow {m['overflowPx']}px")
                    if m["pageErrors"]:
                        report["failures"].append(f"Secondary {vp_name} {route}: JS errors {m['pageErrors']}")
                    if m["visibleCardCount"] != 0:
                        report["failures"].append(f"Secondary {vp_name} {route}: Phase 35.1C pause violated ({m['visibleCardCount']} visible Amazon cards)")
                    if slug == "home" and m["pauseFlag"] is not False:
                        report["failures"].append(f"Homepage pause flag altered: {m['pauseFlag']}")
                    p2.screenshot(path=str(out_dir / f"AFTER_{slug}_{vp_name}.png"), full_page=False)
                ctx2.close()

            ctx.close()
            browser.close()
    finally:
        if server:
            server.shutdown()

    res_path = out_dir / f"{mode.upper()}_global_amazon_playwright_results.json"
    res_path.write_text(json.dumps(report, indent=2), encoding="utf-8")
    print("Results written to:", res_path)
    print("Failures count:", len(report["failures"]))
    for f in report["failures"]:
        print("  FAIL:", f)
    if report["failures"]:
        sys.exit(1)


if __name__ == "__main__":
    main()
