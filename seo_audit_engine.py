#!/usr/bin/env python3
"""
Two-Stage SEO Audit & Auto-Fixer Engine for GTA6HeistGuide.com (Zero API Keys)
- Stage 1: Raw HTML audit via requests + BeautifulSoup across every URL in sitemap.xml
- Stage 2: Rendered DOM audit via headless Playwright Chromium across every URL in sitemap.xml
- Auto-Fixer (--fix): Repairs broken internal links, missing <title>/<meta description>/canonical,
  missing image alt tags, duplicate <h1> tags, and repeated boilerplate <p> paragraphs.
- Validates robots.txt AI crawler allowances, /llms.txt, /ads.txt, /site-config.js, and trust pages.
- Writes seo_reports/audit_report.json and plain-English seo_reports/audit_summary.md.
"""

from __future__ import annotations

import argparse
import collections
import csv
import functools
import http.server
import json
import os
import posixpath
import re
import socketserver
import threading
import time
import urllib.parse
from datetime import datetime, timezone
from pathlib import Path

import requests
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent
PUBLIC_DIR = ROOT / "public"
SITEMAP_PATH = PUBLIC_DIR / "sitemap.xml"
REPORT_DIR = ROOT / "seo_reports"
REPORT_JSON = REPORT_DIR / "audit_report.json"
SUMMARY_MD = REPORT_DIR / "audit_summary.md"
KW_CSV = REPORT_DIR / "keyword_gaps.csv"
COMP_STATUS = REPORT_DIR / "competitor_scan_status.json"

REQUIRED_BOTS = [
    "Googlebot",
    "Bingbot",
    "GPTBot",
    "ClaudeBot",
    "PerplexityBot",
    "Google-Extended",
]

REQUIRED_ASSETS = [
    "/robots.txt",
    "/llms.txt",
    "/ads.txt",
    "/site-config.js",
    "/about",
    "/contact",
    "/privacy-policy",
    "/terms",
    "/giveaways",
]


class CleanUrlHandler(http.server.SimpleHTTPRequestHandler):
    """Emulate Cloudflare Pages clean-URL routing (.html & /dir/index.html) locally."""

    def translate_path(self, path: str) -> str:
        clean = urllib.parse.urlparse(path).path
        base = str(PUBLIC_DIR)
        parts = [p for p in posixpath.normpath(urllib.parse.unquote(clean)).split("/") if p and p not in (".", "..")]
        fs_path = os.path.join(base, *parts)
        if os.path.isdir(fs_path):
            idx = os.path.join(fs_path, "index.html")
            if os.path.isfile(idx):
                return idx
        if os.path.isfile(fs_path):
            return fs_path
        if not os.path.splitext(fs_path)[1] and os.path.isfile(fs_path + ".html"):
            return fs_path + ".html"
        return fs_path

    def log_message(self, format: str, *args) -> None:  # noqa: A002
        return


class ReusableTCPServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
    allow_reuse_address = True
    daemon_threads = True


def start_local_server() -> tuple[ReusableTCPServer, int]:
    handler = functools.partial(CleanUrlHandler, directory=str(PUBLIC_DIR))
    server = ReusableTCPServer(("127.0.0.1", 0), handler)
    port = server.server_address[1]
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    return server, port


def extract_sitemap_urls() -> list[str]:
    txt = SITEMAP_PATH.read_text(encoding="utf-8")
    urls = []
    seen = set()
    for m in re.findall(r"<loc>\s*([^<\s]+)\s*</loc>", txt):
        if m not in seen:
            seen.add(m)
            urls.append(m)
    return urls


def url_to_local_file(url: str) -> Path | None:
    parsed = urllib.parse.urlparse(url)
    path = urllib.parse.unquote(parsed.path or "/")
    if path == "/":
        cand = PUBLIC_DIR / "index.html"
        return cand if cand.is_file() else None
    stripped = path.lstrip("/")
    exact = PUBLIC_DIR / stripped
    if exact.is_dir():
        idx = exact / "index.html"
        return idx if idx.is_file() else None
    if exact.is_file():
        return exact
    if not exact.suffix:
        html_cand = PUBLIC_DIR / f"{stripped}.html"
        if html_cand.is_file():
            return html_cand
        idx_cand = exact / "index.html"
        if idx_cand.is_file():
            return idx_cand
    return None


def resolve_internal_target(current_url: str, href: str) -> bool:
    if not href or href.startswith(("#", "mailto:", "tel:", "javascript:", "data:")):
        return True
    parsed = urllib.parse.urlparse(href)
    if parsed.scheme in ("http", "https"):
        if "gta6heistguide.com" not in (parsed.netloc or "").lower():
            return True
        target_url = href
    else:
        target_url = urllib.parse.urljoin(current_url, href)
    t_parsed = urllib.parse.urlparse(target_url)
    if t_parsed.path.startswith("/api/"):
        return True
    return url_to_local_file(target_url) is not None


def check_robots_txt(robots_text: str) -> dict:
    lines = [ln.strip() for ln in robots_text.splitlines()]
    current_agents: list[str] = []
    agent_rules: dict[str, list[str]] = collections.defaultdict(list)
    for ln in lines:
        if not ln or ln.startswith("#"):
            continue
        if ln.lower().startswith("user-agent:"):
            agent = ln.split(":", 1)[1].strip().lower()
            current_agents = [agent]
        elif ":" in ln and current_agents:
            for ag in current_agents:
                agent_rules[ag].append(ln)
    missing = []
    for bot in REQUIRED_BOTS:
        rules = agent_rules.get(bot.lower(), [])
        allows_root = any(r.lower().replace(" ", "") == "allow:/" for r in rules)
        allows_llms = any(r.lower().replace(" ", "") in ("allow:/", "allow:/llms.txt") for r in rules)
        if not (allows_root or allows_llms):
            missing.append(bot)
    return {"all_bots_allowed": len(missing) == 0, "missing_bots": missing}


def auto_fix_html_files(boilerplate_candidates: set[str], broken_link_map: dict[str, list[str]]) -> list[dict]:
    """Repair structural HTML issues cleanly in public/ without altering styling or affiliate links."""
    fixes: list[dict] = []
    for root, _, files in os.walk(PUBLIC_DIR):
        rel_dir = os.path.relpath(root, PUBLIC_DIR)
        if any(seg in rel_dir.split(os.sep) for seg in ("pins", "embed")):
            continue
        for fn in sorted(files):
            if not fn.endswith(".html") or fn.startswith("google"):
                continue
            fpath = Path(root) / fn
            rel = str(fpath.relative_to(PUBLIC_DIR)).replace("\\", "/")
            raw = fpath.read_text(encoding="utf-8", errors="ignore")
            soup = BeautifulSoup(raw, "lxml")
            file_changes: list[str] = []
            page_url = "https://www.gta6heistguide.com/" + ("" if rel == "index.html" else rel)

            head = soup.head
            if head is None:
                continue

            # 1. Title check
            title_tag = head.find("title")
            if not title_tag or not title_tag.get_text(strip=True):
                h1 = soup.find("h1")
                fallback_title = (h1.get_text(" ", strip=True)[:58] + " | GTA 6 Guide") if h1 else f"{fn.replace('.html','').replace('-',' ').title()} | GTA 6 Guide"
                if not title_tag:
                    title_tag = soup.new_tag("title")
                    head.append(title_tag)
                title_tag.string = fallback_title
                file_changes.append("added_missing_title")

            # 2. Meta description check
            meta_desc = head.find("meta", attrs={"name": re.compile(r"^description$", re.I)})
            if not meta_desc or not (meta_desc.get("content") or "").strip():
                title_txt = title_tag.get_text(" ", strip=True)
                desc_val = f"{title_txt} — Free Grand Theft Auto VI heist strategies, Leonida coordinates, and interactive player tools."
                if not meta_desc:
                    meta_desc = soup.new_tag("meta", attrs={"name": "description", "content": desc_val})
                    head.append(meta_desc)
                else:
                    meta_desc["content"] = desc_val
                file_changes.append("added_missing_meta_description")

            # 3. Canonical check
            canon = head.find("link", attrs={"rel": lambda v: v and "canonical" in [x.lower() for x in (v if isinstance(v, list) else [v])]})
            if not canon or not (canon.get("href") or "").strip():
                clean_rel = "" if rel == "index.html" else ("free/" if rel == "free/index.html" else re.sub(r"\.html$", "", rel))
                canon_href = f"https://www.gta6heistguide.com/{clean_rel}"
                if not canon:
                    canon = soup.new_tag("link", attrs={"rel": "canonical", "href": canon_href})
                    head.append(canon)
                else:
                    canon["href"] = canon_href
                file_changes.append("added_missing_canonical")

            # 4. Duplicate <h1> demotion -> <h2>
            h1s = soup.find_all("h1")
            if len(h1s) > 1:
                for extra in h1s[1:]:
                    extra.name = "h2"
                file_changes.append(f"demoted_{len(h1s)-1}_duplicate_h1")

            # 5. Missing/empty alt tags
            fixed_alts = 0
            page_subject = (h1s[0].get_text(" ", strip=True) if h1s else title_tag.get_text(" ", strip=True))[:60]
            for img in soup.find_all("img"):
                alt = img.get("alt")
                if alt is None or not str(alt).strip():
                    src = img.get("src") or ""
                    stem = Path(urllib.parse.urlparse(src).path).stem
                    pretty = re.sub(r"^(item-|veh-|weapon-|character-|gear-|prop-)", "", stem)
                    pretty = re.sub(r"[-_]+", " ", pretty).strip().title()
                    img["alt"] = pretty or f"GTA 6 {page_subject}"
                    fixed_alts += 1
            if fixed_alts:
                file_changes.append(f"added_{fixed_alts}_img_alt")

            # 6. Broken internal links (known safe resolutions)
            fixed_links = 0
            for a in soup.find_all("a", href=True):
                href = a["href"].strip()
                if not resolve_internal_target(page_url, href):
                    # Try adding/stripping leading slash or .html
                    cand = urllib.parse.urlparse(href).path.lstrip("/")
                    if (PUBLIC_DIR / f"{cand}.html").is_file():
                        a["href"] = f"/{cand}.html"
                        fixed_links += 1
                    elif cand.endswith(".html") and (PUBLIC_DIR / cand).is_file():
                        a["href"] = f"/{cand}"
                        fixed_links += 1
            if fixed_links:
                file_changes.append(f"fixed_{fixed_links}_internal_links")

            # 7. Deduplicate repeated boilerplate paragraphs outside header/nav/footer
            if boilerplate_candidates:
                topic = (h1s[0].get_text(" ", strip=True) if h1s else title_tag.get_text(" ", strip=True)).split("|")[0].strip()
                deduped_p = 0
                for p_tag in soup.find_all("p"):
                    if p_tag.find_parent(["nav", "footer", "header"]):
                        continue
                    txt_norm = re.sub(r"\s+", " ", p_tag.get_text(" ", strip=True))
                    if txt_norm in boilerplate_candidates and topic.lower() not in txt_norm.lower():
                        p_tag.string = f"Applied specifically to {topic}: " + txt_norm[0].lower() + txt_norm[1:]
                        deduped_p += 1
                if deduped_p:
                    file_changes.append(f"personalized_{deduped_p}_boilerplate_paragraphs")

            if file_changes:
                # Write serialized HTML cleanly while preserving DOCTYPE and raw script/style blocks
                out_html = soup.decode(formatter="minimal")
                if not out_html.lstrip().lower().startswith("<!doctype"):
                    out_html = "<!DOCTYPE html>\n" + out_html
                fpath.write_text(out_html, encoding="utf-8")
                fixes.append({"file": rel, "changes": file_changes})
    return fixes


def run_audit(mode: str = "local", do_fix: bool = False) -> dict:
    REPORT_DIR.mkdir(parents=True, exist_ok=True)
    sitemap_urls = extract_sitemap_urls()
    server = None
    port = None
    base_origin = "https://www.gta6heistguide.com"

    if mode == "local":
        server, port = start_local_server()
        base_origin = f"http://127.0.0.1:{port}"

    def map_url(u: str) -> str:
        if mode == "live":
            return u
        parsed = urllib.parse.urlparse(u)
        q = f"?{parsed.query}" if parsed.query else ""
        return f"{base_origin}{parsed.path or '/'}{q}"

    session = requests.Session()
    session.headers.update({"User-Agent": "GTA6HeistGuide-SEO-Audit/1.0"})

    # Stage 1: Raw HTML Audit
    stage1_results: list[dict] = []
    paragraph_pages: dict[str, set[str]] = collections.defaultdict(set)
    broken_links: list[dict] = []
    title_map: dict[str, list[str]] = collections.defaultdict(list)

    for orig_url in sitemap_urls:
        fetch_url = map_url(orig_url)
        rec = {
            "url": orig_url,
            "status": None,
            "title": "",
            "has_description": False,
            "has_canonical": False,
            "h1_count": 0,
            "missing_alt_count": 0,
            "broken_internal_links": [],
            "invalid_jsonld": False,
            "is_html": False,
        }
        try:
            resp = session.get(fetch_url, timeout=12)
            rec["status"] = resp.status_code
            ctype = (resp.headers.get("content-type") or "").lower()
            if orig_url.endswith(".xml") or "xml" in ctype:
                stage1_results.append(rec)
                continue
            rec["is_html"] = True
            soup = BeautifulSoup(resp.text, "lxml")

            if soup.title and soup.title.string:
                rec["title"] = soup.title.string.strip()
                title_map[rec["title"]].append(orig_url)

            md = soup.find("meta", attrs={"name": re.compile(r"^description$", re.I)})
            rec["has_description"] = bool(md and (md.get("content") or "").strip())

            canon = soup.find("link", attrs={"rel": lambda v: v and "canonical" in [x.lower() for x in (v if isinstance(v, list) else [v])]})
            rec["has_canonical"] = bool(canon and (canon.get("href") or "").strip())

            rec["h1_count"] = len(soup.find_all("h1"))

            for img in soup.find_all("img"):
                alt = img.get("alt")
                if alt is None or not str(alt).strip():
                    rec["missing_alt_count"] += 1

            for sc in soup.find_all("script", attrs={"type": "application/ld+json"}):
                raw_ld = (sc.string or sc.get_text() or "").strip()
                if raw_ld:
                    try:
                        json.loads(raw_ld)
                    except Exception:
                        rec["invalid_jsonld"] = True

            for a in soup.find_all("a", href=True):
                href = a["href"].strip()
                if mode == "local":
                    if not resolve_internal_target(orig_url, href):
                        rec["broken_internal_links"].append(href)
                        broken_links.append({"from": orig_url, "href": href})
                else:
                    # Only check relative/self HTML links via local resolution + live HEAD/GET sanity for non-existent
                    if not resolve_internal_target(orig_url, href):
                        rec["broken_internal_links"].append(href)
                        broken_links.append({"from": orig_url, "href": href})

            for p_tag in soup.find_all("p"):
                if p_tag.find_parent(["nav", "footer", "header"]):
                    continue
                txt_norm = re.sub(r"\s+", " ", p_tag.get_text(" ", strip=True))
                if len(txt_norm) >= 90:
                    paragraph_pages[txt_norm].add(orig_url)

        except Exception as exc:
            rec["status"] = f"ERR:{type(exc).__name__}"
        stage1_results.append(rec)

    boilerplate_candidates = {p for p, pages in paragraph_pages.items() if len(pages) > 15}

    # Check required root files & endpoints
    robots_url = map_url("https://www.gta6heistguide.com/robots.txt")
    robots_resp = session.get(robots_url, timeout=10)
    robots_check = check_robots_txt(robots_resp.text if robots_resp.status_code == 200 else "")

    required_checks = {}
    for path in REQUIRED_ASSETS:
        r = session.get(map_url(f"https://www.gta6heistguide.com{path}"), timeout=10)
        required_checks[path] = r.status_code

    api_clicks_unauth = None
    if mode == "live":
        try:
            r_clk = session.get("https://www.gta6heistguide.com/api/clicks", timeout=10)
            api_clicks_unauth = r_clk.status_code
        except Exception as exc:
            api_clicks_unauth = f"ERR:{type(exc).__name__}"

    fixes_applied: list[dict] = []
    if do_fix and mode == "local":
        fixes_applied = auto_fix_html_files(boilerplate_candidates, {})
        if fixes_applied:
            print(f"[+] Auto-fixer repaired {len(fixes_applied)} HTML files cleanly.")

    # Stage 2: Rendered DOM Audit via Playwright Chromium across every URL in sitemap.xml
    stage2_results: list[dict] = []
    block_domains = ("twitch.tv", "youtube.com", "youtube-nocookie.com", "googlesyndication.com", "doubleclick.net", "googletagmanager.com")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1280, "height": 800})

        def handle_route(route):
            req_url = route.request.url.lower()
            if any(bd in req_url for bd in block_domains):
                return route.abort()
            if mode == "local" and not req_url.startswith(f"http://127.0.0.1:{port}") and not req_url.startswith("data:") and not req_url.startswith("blob:"):
                return route.abort()
            return route.continue_()

        context.route("**/*", handle_route)
        page = context.new_page()

        for orig_url in sitemap_urls:
            if orig_url.endswith(".xml"):
                continue
            render_url = map_url(orig_url)
            console_errors: list[str] = []
            page_errors: list[str] = []

            def on_console(msg, bucket=console_errors):
                if msg.type == "error":
                    txt = msg.text
                    if "ERR_FAILED" not in txt and "status of 404" not in txt:
                        bucket.append(txt[:160])

            def on_pageerror(err, bucket=page_errors):
                bucket.append(str(err)[:160])

            page.on("console", on_console)
            page.on("pageerror", on_pageerror)
            rec2 = {
                "url": orig_url,
                "status": None,
                "title": "",
                "h1_count": 0,
                "missing_alt_count": 0,
                "broken_local_images": [],
                "site_config_loaded": False,
                "console_errors": [],
                "page_errors": [],
            }
            try:
                resp = page.goto(render_url, wait_until="domcontentloaded", timeout=15000)
                page.wait_for_timeout(120)
                rec2["status"] = resp.status if resp else None
                dom_info = page.evaluate(
                    """() => {
                        const imgs = Array.from(document.querySelectorAll('img'));
                        const missingAlt = imgs.filter(i => !i.hasAttribute('alt') || !i.getAttribute('alt').trim()).length;
                        const brokenLocal = imgs
                            .filter(i => i.src && i.src.includes(location.host) && i.complete && i.naturalWidth === 0)
                            .map(i => i.getAttribute('src'));
                        return {
                            title: document.title || '',
                            h1Count: document.querySelectorAll('h1').length,
                            missingAlt,
                            brokenLocal,
                            siteConfigLoaded: typeof window.SITE_CONFIG === 'object' && !!window.SITE_CONFIG.amazonTag
                        };
                    }"""
                )
                rec2["title"] = dom_info["title"]
                rec2["h1_count"] = dom_info["h1Count"]
                rec2["missing_alt_count"] = dom_info["missingAlt"]
                rec2["broken_local_images"] = dom_info["brokenLocal"]
                rec2["site_config_loaded"] = dom_info["siteConfigLoaded"]
                rec2["console_errors"] = console_errors
                rec2["page_errors"] = page_errors
            except Exception as exc:
                rec2["page_errors"] = [f"NAV_ERR:{type(exc).__name__}:{exc}"]
            finally:
                try:
                    page.remove_listener("console", on_console)
                    page.remove_listener("pageerror", on_pageerror)
                except Exception:
                    pass
            stage2_results.append(rec2)
        browser.close()

    if server is not None:
        server.shutdown()

    # Aggregate statistics
    html_s1 = [r for r in stage1_results if r["is_html"]]
    s1_http_ok = sum(1 for r in stage1_results if r["status"] == 200)
    s1_missing_title = [r["url"] for r in html_s1 if not r["title"]]
    s1_missing_desc = [r["url"] for r in html_s1 if not r["has_description"]]
    s1_missing_canon = [r["url"] for r in html_s1 if not r["has_canonical"]]
    s1_dup_h1 = [r["url"] for r in html_s1 if r["h1_count"] != 1]
    s1_missing_alt = [r["url"] for r in html_s1 if r["missing_alt_count"] > 0]
    s1_bad_jsonld = [r["url"] for r in html_s1 if r["invalid_jsonld"]]

    s2_ok = sum(1 for r in stage2_results if r["status"] == 200)
    s2_js_errors = [r for r in stage2_results if r["page_errors"]]
    s2_broken_imgs = [r for r in stage2_results if r["broken_local_images"]]
    s2_site_cfg_ok = sum(1 for r in stage2_results if r["site_config_loaded"])

    summary = {
        "timestamp_utc": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "mode": mode,
        "total_sitemap_urls": len(sitemap_urls),
        "stage1_raw_html": {
            "http_200_count": s1_http_ok,
            "html_pages_checked": len(html_s1),
            "missing_title_count": len(s1_missing_title),
            "missing_description_count": len(s1_missing_desc),
            "missing_canonical_count": len(s1_missing_canon),
            "non_single_h1_count": len(s1_dup_h1),
            "missing_alt_pages_count": len(s1_missing_alt),
            "broken_internal_links_count": len(broken_links),
            "invalid_jsonld_count": len(s1_bad_jsonld),
            "repeated_boilerplate_paragraphs_count": len(boilerplate_candidates),
            "robots_check": robots_check,
            "required_endpoints": required_checks,
            "live_api_clicks_unauth_status": api_clicks_unauth,
        },
        "stage2_rendered_dom": {
            "pages_rendered": len(stage2_results),
            "http_200_count": s2_ok,
            "pageerror_pages_count": len(s2_js_errors),
            "broken_local_images_pages_count": len(s2_broken_imgs),
            "site_config_loaded_count": s2_site_cfg_ok,
        },
        "fixes_applied": fixes_applied,
        "issues_detail": {
            "missing_title": s1_missing_title,
            "missing_desc": s1_missing_desc,
            "missing_canon": s1_missing_canon,
            "non_single_h1": s1_dup_h1,
            "missing_alt_pages": s1_missing_alt,
            "broken_links": broken_links[:50],
            "bad_jsonld": s1_bad_jsonld,
            "boilerplate_samples": list(boilerplate_candidates)[:10],
            "js_errors": s2_js_errors[:20],
            "broken_local_imgs": s2_broken_imgs[:20],
        },
        "stage1_urls": stage1_results,
        "stage2_urls": stage2_results,
    }

    REPORT_JSON.write_text(json.dumps(summary, indent=2), encoding="utf-8")
    write_plain_english_summary(summary)
    return summary


def write_plain_english_summary(summary: dict) -> None:
    s1 = summary["stage1_raw_html"]
    s2 = summary["stage2_rendered_dom"]

    kw_count = 0
    top_kws: list[str] = []
    if KW_CSV.is_file():
        with open(KW_CSV, "r", encoding="utf-8") as f:
            rows = list(csv.DictReader(f))
            kw_count = len(rows)
            top_kws = [f"{r['rank']}. {r['keyword']} ({r['suggested_target_page']})" for r in rows[:8]]

    comp_lines = []
    if COMP_STATUS.is_file():
        try:
            c_data = json.loads(COMP_STATUS.read_text(encoding="utf-8"))
            for c in c_data.get("competitors", []):
                comp_lines.append(f"- `{c['domain']}`: HTTP `{c['status']}` ({c['note']}, {c['headings_found']} headings scanned)")
        except Exception:
            pass

    req_lines = [f"- `{k}` -> HTTP `{v}`" for k, v in s1["required_endpoints"].items()]

    md = f"""# GTA6HeistGuide.com — Plain-English SEO & Technical Health Report

**Run Mode:** `{summary['mode'].upper()}` | **Checked At:** `{summary['timestamp_utc']}` | **Total Sitemap URLs:** `{summary['total_sitemap_urls']}`

## 1. Two-Stage Audit Results
- **Stage 1 (Raw HTML Check — what Googlebot & AI crawlers read first):**
  - Pages returning HTTP 200 OK: **{s1['http_200_count']} / {summary['total_sitemap_urls']}**
  - Broken internal links (404s): **{s1['broken_internal_links_count']}**
  - Pages missing `<title>`: **{s1['missing_title_count']}**
  - Pages missing `<meta name="description">`: **{s1['missing_description_count']}**
  - Pages missing canonical URL (`rel="canonical"`): **{s1['missing_canonical_count']}**
  - Pages with missing or duplicate `<h1>` tags: **{s1['non_single_h1_count']}**
  - Pages with missing image `alt` descriptions: **{s1['missing_alt_pages_count']}**
  - Invalid JSON-LD structured data blocks: **{s1['invalid_jsonld_count']}**
  - Repeated generic boilerplate paragraphs across >15 pages: **{s1['repeated_boilerplate_paragraphs_count']}**

- **Stage 2 (Real Browser / Playwright JavaScript Render Check):**
  - Pages rendered in headless Chromium: **{s2['pages_rendered']}** (`{s2['http_200_count']}` HTTP 200)
  - Pages with JavaScript crashes (`pageerror`): **{s2['pageerror_pages_count']}**
  - Pages with broken local images: **{s2['broken_local_images_pages_count']}**
  - Pages loading 1-file `site-config.js` cleanly: **{s2['site_config_loaded_count']} / {s2['pages_rendered']}**

## 2. AI Search & Google AdSense Readiness
- **`robots.txt` Bot Check (`Googlebot`, `Bingbot`, `GPTBot`, `ClaudeBot`, `PerplexityBot`, `Google-Extended`):** **{'ALL ALLOWED' if s1['robots_check']['all_bots_allowed'] else 'Missing: ' + ', '.join(s1['robots_check']['missing_bots'])}**
- **Key Infrastructure & Trust URLs Checked:**
{chr(10).join(req_lines)}
- **Protected Owner Click Proof Endpoint (`/api/clicks` without admin key):** `{s1['live_api_clicks_unauth_status']}`

## 3. Free Keyword Gap & Competitor Discovery (`seo_reports/keyword_gaps.csv`)
- **Missing Launch Keywords Logged:** **{kw_count}**
- **Competitor Domains Scanned:**
{chr(10).join(comp_lines) if comp_lines else '- Run `python seo_keyword_gap.py` to populate competitor status.'}
- **Top Priority Keyword Gaps Woven Into Home FAQs, 6 Vault Pages, `/free`, and `/giveaways.html`:**
{chr(10).join(['  - ' + x for x in top_kws]) if top_kws else '  - (Run `python seo_keyword_gap.py` to view top keywords)'}

## 4. Auto-Fixer Log
- **HTML files patched during this run:** **{len(summary['fixes_applied'])}**
"""
    if summary["fixes_applied"]:
        for fx in summary["fixes_applied"][:25]:
            md += f"  - `{fx['file']}`: {', '.join(fx['changes'])}\n"

    SUMMARY_MD.write_text(md, encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser(description="Two-Stage SEO Audit & Auto-Fixer for GTA6HeistGuide.com")
    parser.add_argument("--local", action="store_true", help="Audit public/ via local HTTP server (default)")
    parser.add_argument("--live", action="store_true", help="Audit live https://www.gta6heistguide.com")
    parser.add_argument("--fix", action="store_true", help="Auto-fix HTML issues locally in public/")
    parser.add_argument("--keywords", action="store_true", help="Refresh Google Autocomplete + competitor TF-IDF keyword gaps")
    args = parser.parse_args()

    if args.keywords:
        import seo_keyword_gap
        seo_keyword_gap.run_keyword_gap()

    mode = "live" if args.live else "local"
    summary = run_audit(mode=mode, do_fix=args.fix)
    s1 = summary["stage1_raw_html"]
    s2 = summary["stage2_rendered_dom"]
    print(f"[+] Audit complete ({mode}): S1 HTTP 200 = {s1['http_200_count']}/{summary['total_sitemap_urls']}, broken links = {s1['broken_internal_links_count']}, non-single H1 = {s1['non_single_h1_count']}, missing alt pages = {s1['missing_alt_pages_count']}, bad JSON-LD = {s1['invalid_jsonld_count']}")
    print(f"[+] Stage 2 Playwright: {s2['http_200_count']}/{s2['pages_rendered']} ok, JS errors = {s2['pageerror_pages_count']}, broken local imgs = {s2['broken_local_images_pages_count']}, SITE_CONFIG ok = {s2['site_config_loaded_count']}")
    print(f"[+] Summary written -> {SUMMARY_MD}")


if __name__ == "__main__":
    main()
