#!/usr/bin/env python3
"""Phase 33 — Multi-Viewport Visual QA & Before/After Screenshot Capture."""
import json
import os
from pathlib import Path
from playwright.sync_api import sync_playwright

PROD_URL = "https://www.gta6heistguide.com"
PREVIEW_URL = "https://2f624adc.gta6heistguide.pages.dev"
SHOT_DIR = Path("verification-screenshots/phase33")
SHOT_DIR.mkdir(parents=True, exist_ok=True)

VIEWPORTS = [
    ("desktop_1440x900", 1440, 900),
    ("desktop_1280x800", 1280, 800),
    ("tablet_768x1024", 768, 1024),
    ("mobile_390x844", 390, 844),
    ("mobile_360x800", 360, 800),
]

results = []

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)

    # 1. BEFORE screenshot on current production homepage
    ctx_before = browser.new_context(viewport={"width": 1440, "height": 900})
    page_b = ctx_before.new_page()
    page_b.goto(PROD_URL + "/", wait_until="networkidle", timeout=45000)
    box_b = page_b.locator("#officialDealsBox")
    if box_b.count() > 0:
        box_b.scroll_into_view_if_needed()
        page_b.wait_for_timeout(400)
        box_b.screenshot(path=str(SHOT_DIR / "BEFORE_prod_homepage_1440x900.png"))
        print("Captured BEFORE_prod_homepage_1440x900.png")
    ctx_before.close()

    # 2. AFTER Homepage across all 5 required viewports
    for vp_name, w, h in VIEWPORTS:
        ctx = browser.new_context(viewport={"width": w, "height": h})
        page = ctx.new_page()
        console_errors = []
        page.on("console", lambda m: console_errors.append(m.text) if m.type == "error" else None)
        page.on("pageerror", lambda e: console_errors.append(str(e)))
        page.goto(PREVIEW_URL + "/", wait_until="networkidle", timeout=45000)
        page.wait_for_timeout(500)

        metrics = page.evaluate("""() => {
            const box = document.getElementById('officialDealsBox');
            const imgs = box ? Array.from(box.querySelectorAll('img.aff-stage-img')) : [];
            const broken = imgs.filter(i => !i.complete || i.naturalWidth === 0).length;
            const oldBlackBoxes = document.querySelectorAll('.aff-info-header').length;
            const links = box ? Array.from(box.querySelectorAll('a[href*="amazon.com"]')) : [];
            const badLinks = links.filter(a => !a.href.includes('tag=gta6heistguid-20') || !(a.rel || '').includes('sponsored')).length;
            const overflow = document.documentElement.scrollWidth > window.innerWidth + 1;
            const imgWidths = imgs.map(i => Math.round(i.getBoundingClientRect().width));
            return {
                cards: box ? box.querySelectorAll('.aff-card').length : 0,
                imgs: imgs.length,
                brokenImgs: broken,
                imgWidths,
                oldBlackBoxes,
                amzLinks: links.length,
                badLinks,
                overflow,
                scrollWidth: document.documentElement.scrollWidth,
                innerWidth: window.innerWidth
            };
        }""")
        box = page.locator("#officialDealsBox")
        if box.count() > 0:
            box.scroll_into_view_if_needed()
            page.wait_for_timeout(300)
            box.screenshot(path=str(SHOT_DIR / f"AFTER_home_{vp_name}.png"))

        results.append({"page": "/", "viewport": vp_name, "console_errors": len(console_errors), **metrics})
        print(f"HOME {vp_name}: cards={metrics['cards']} imgs={metrics['imgs']} broken={metrics['brokenImgs']} oldBoxes={metrics['oldBlackBoxes']} overflow={metrics['overflow']} errors={len(console_errors)} imgW={metrics['imgWidths']}")
        ctx.close()

    # 3. /gaming-gear/ hub (desktop + mobile)
    for vp_name, w, h in [("desktop_1440x900", 1440, 900), ("mobile_390x844", 390, 844)]:
        ctx = browser.new_context(viewport={"width": w, "height": h})
        page = ctx.new_page()
        console_errors = []
        page.on("console", lambda m: console_errors.append(m.text) if m.type == "error" else None)
        page.goto(PREVIEW_URL + "/gaming-gear/", wait_until="networkidle", timeout=45000)
        page.wait_for_timeout(500)
        metrics = page.evaluate("""() => {
            const cards = document.querySelectorAll('.aff-card--visual').length;
            const imgs = Array.from(document.querySelectorAll('img.aff-stage-img'));
            const broken = imgs.filter(i => !i.complete || i.naturalWidth === 0).length;
            const oldBlackBoxes = document.querySelectorAll('.aff-info-header').length;
            const overflow = document.documentElement.scrollWidth > window.innerWidth + 1;
            return { cards, imgs: imgs.length, brokenImgs: broken, oldBlackBoxes, overflow };
        }""")
        page.screenshot(path=str(SHOT_DIR / f"AFTER_gaming_gear_{vp_name}.png"), full_page=False)
        if vp_name == "desktop_1440x900":
            page.locator("#controller-accessories").scroll_into_view_if_needed()
            page.wait_for_timeout(250)
            page.screenshot(path=str(SHOT_DIR / "AFTER_gaming_gear_cards_1440x900.png"), full_page=False)
        results.append({"page": "/gaming-gear/", "viewport": vp_name, "console_errors": len(console_errors), **metrics})
        print(f"GEAR HUB {vp_name}: cards={metrics['cards']} imgs={metrics['imgs']} broken={metrics['brokenImgs']} overflow={metrics['overflow']} errors={len(console_errors)}")
        ctx.close()

    # 4. Contextual & Forbidden Pages Check (desktop 1440x900)
    CHECK_PAGES = [
        ("/vehicles", True),
        ("/weapons", True),
        ("/properties", True),
        ("/heist-command-center/", True),
        ("/animals", False),
        ("/map", False),
    ]
    for path, expect_cards in CHECK_PAGES:
        ctx = browser.new_context(viewport={"width": 1440, "height": 900})
        page = ctx.new_page()
        console_errors = []
        page.on("console", lambda m: console_errors.append(m.text) if m.type == "error" else None)
        page.goto(PREVIEW_URL + path, wait_until="networkidle", timeout=45000)
        page.wait_for_timeout(500)
        metrics = page.evaluate("""() => {
            const cards = document.querySelectorAll('.aff-card--visual').length;
            const imgs = Array.from(document.querySelectorAll('img.aff-stage-img'));
            const broken = imgs.filter(i => !i.complete || i.naturalWidth === 0).length;
            const overflow = document.documentElement.scrollWidth > window.innerWidth + 1;
            return { cards, imgs: imgs.length, brokenImgs: broken, overflow };
        }""")
        status_ok = (metrics["cards"] > 0) if expect_cards else (metrics["cards"] == 0)
        results.append({"page": path, "viewport": "desktop_1440x900", "console_errors": len(console_errors), "expect_cards": expect_cards, "ok": status_ok, **metrics})
        print(f"PAGE {path}: cards={metrics['cards']} (expected>{0 if expect_cards else '==0'}) ok={status_ok} broken={metrics['brokenImgs']} overflow={metrics['overflow']} errors={len(console_errors)}")
        ctx.close()

    browser.close()

(SHOT_DIR / "qa_results.json").write_text(json.dumps(results, indent=2), encoding="utf-8")
print("Visual QA complete. Results saved to verification-screenshots/phase33/qa_results.json")
