#!/usr/bin/env python3
"""
Free Local SEO Keyword Discovery & Competitor Gap Engine (Zero API Keys)
- Pulls public Google Autocomplete suggestions for core GTA 6 launch seeds.
- Fetches public headings (<title>, h1, h2, h3) from gtabase.com, gtaboom.com,
  leonidaverse.com, and gtaheistinfo.com (no CAPTCHA bypass).
- Runs pure-Python TF-IDF comparison against local public/**/*.html corpus.
- Saves the top 25 missing / under-covered launch keywords to seo_reports/keyword_gaps.csv.
"""

from __future__ import annotations

import collections
import csv
import json
import math
import os
import re
import time
import urllib.parse
from pathlib import Path

import requests
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parent
PUBLIC_DIR = ROOT / "public"
REPORT_DIR = ROOT / "seo_reports"
REPORT_CSV = REPORT_DIR / "keyword_gaps.csv"
STATUS_JSON = REPORT_DIR / "competitor_scan_status.json"

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "en-US,en;q=0.9",
}

SEEDS = [
    "gta 6 heist",
    "gta 6 interactive map",
    "gta 6 payout calculator",
    "gta 6 twitch drops",
    "gta 6 best ps5 ssd",
]

MODIFIERS = ["", "solo", "how to", "best", "ps5", "2026", "guide", "rewards", "setup"]

COMPETITORS = [
    "https://www.gtabase.com",
    "https://www.gtaboom.com",
    "https://leonidaverse.com",
    "https://gtaheistinfo.com",
]

STOPWORDS = {
    "a", "an", "and", "are", "as", "at", "be", "by", "can", "do", "for", "from",
    "get", "how", "i", "if", "in", "into", "is", "it", "its", "of", "on", "or",
    "out", "that", "the", "their", "this", "to", "use", "using", "via", "vs",
    "what", "when", "where", "which", "who", "with", "you", "your", "all", "new",
    "full", "list", "guide", "gta", "vi", "6", "grand", "theft", "auto", "com",
    "www", "http", "https", "news", "articles", "videos", "more", "home",
}


def tokenize(text: str) -> list[str]:
    cleaned = re.sub(r"[^a-z0-9\s]+", " ", text.lower())
    return [t for t in cleaned.split() if len(t) > 1 and t not in STOPWORDS]


def normalize_phrase(text: str) -> str:
    text = re.sub(r"\s+", " ", re.sub(r"[^\w\s\-/+$]", " ", text.lower())).strip()
    return text[:95]


def fetch_google_autocomplete() -> tuple[list[tuple[str, str]], dict]:
    found: dict[str, str] = {}
    stats = {"queries": 0, "ok": 0, "failed": 0, "suggestions": 0}
    session = requests.Session()
    session.headers.update(HEADERS)

    for seed in SEEDS:
        for mod in MODIFIERS:
            q = f"{seed} {mod}".strip()
            stats["queries"] += 1
            url = (
                "https://suggestqueries.google.com/complete/search?client=firefox&q="
                + urllib.parse.quote_plus(q)
            )
            try:
                resp = session.get(url, timeout=8)
                if resp.status_code == 200:
                    data = resp.json()
                    suggestions = data[1] if isinstance(data, list) and len(data) > 1 else []
                    stats["ok"] += 1
                    for s in suggestions:
                        norm = normalize_phrase(str(s))
                        if norm and ("gta" in norm or "leonida" in norm or "vice city" in norm or "heist" in norm):
                            found.setdefault(norm, f"google_autocomplete:{seed}")
                else:
                    stats["failed"] += 1
            except Exception:
                stats["failed"] += 1
            time.sleep(0.15)

    stats["suggestions"] = len(found)
    return [(k, v) for k, v in found.items()], stats


def is_challenge_page(html: str) -> bool:
    low = html.lower()
    markers = ("cf-challenge", "just a moment...", "g-recaptcha", "hcaptcha", "turnstile", "captcha")
    return any(m in low for m in markers)


def fetch_competitor_headings() -> tuple[list[tuple[str, str]], list[dict]]:
    candidates: dict[str, str] = {}
    statuses: list[dict] = []
    session = requests.Session()
    session.headers.update(HEADERS)

    for url in COMPETITORS:
        domain = urllib.parse.urlparse(url).netloc
        entry = {"domain": domain, "url": url, "status": None, "headings_found": 0, "note": "ok"}
        try:
            resp = session.get(url, timeout=10, allow_redirects=True)
            entry["status"] = resp.status_code
            if resp.status_code != 200:
                entry["note"] = f"http_{resp.status_code}"
                statuses.append(entry)
                continue
            if is_challenge_page(resp.text):
                entry["note"] = "anti_bot_challenge_skipped"
                statuses.append(entry)
                continue
            soup = BeautifulSoup(resp.text, "lxml")
            texts = []
            if soup.title and soup.title.string:
                texts.append(soup.title.string.strip())
            for tag in soup.find_all(["h1", "h2", "h3"]):
                t = tag.get_text(" ", strip=True)
                if 10 <= len(t) <= 110:
                    texts.append(t)
            for t in texts:
                for chunk in re.split(r"[|•—–]+", t):
                    norm = normalize_phrase(chunk)
                    words = norm.split()
                    low_norm = norm.lower()
                    exclude = ("gtaboom", "gtabase", "leonidaverse", "gtaheistinfo", "san andreas", "gta 5", "gta v ", "gta iv", "congress")
                    if any(ex in low_norm for ex in exclude):
                        continue
                    if 3 <= len(words) <= 10 and any(w in low_norm for w in ("gta 6", "gta6", "leonida", "vice city", "heist", "twitch", "ps5", "map", "payout", "outfit", "souvenir")):
                        candidates.setdefault(norm, f"competitor:{domain}")
                        entry["headings_found"] += 1
        except Exception as exc:
            entry["note"] = f"error:{type(exc).__name__}"
        statuses.append(entry)
    return [(k, v) for k, v in candidates.items()], statuses


def collect_local_site_corpus() -> tuple[list[list[str]], str]:
    docs: list[list[str]] = []
    joined_parts: list[str] = []
    for root, _, files in os.walk(PUBLIC_DIR):
        rel_dir = os.path.relpath(root, PUBLIC_DIR)
        if "pins" in rel_dir.split(os.sep) or "embed" in rel_dir.split(os.sep):
            continue
        for fn in files:
            if not fn.endswith(".html") or fn.startswith("google"):
                continue
            p = os.path.join(root, fn)
            try:
                html = open(p, "r", encoding="utf-8", errors="ignore").read()
            except Exception:
                continue
            soup = BeautifulSoup(html, "lxml")
            parts = []
            if soup.title and soup.title.string:
                parts.append(soup.title.string)
            meta_desc = soup.find("meta", attrs={"name": "description"})
            if meta_desc and meta_desc.get("content"):
                parts.append(meta_desc["content"])
            for tag in soup.find_all(["h1", "h2", "h3", "div", "p"]):
                if tag.name == "div" and not any(c in (tag.get("class") or []) for c in ("faq-question", "faq-answer")):
                    continue
                t = tag.get_text(" ", strip=True)
                if t:
                    parts.append(t)
            doc_str = " ".join(parts).lower()
            joined_parts.append(doc_str)
            toks = tokenize(doc_str)
            if toks:
                docs.append(toks)
    return docs, " \n ".join(joined_parts)


def suggest_target_page(kw: str) -> str:
    low = kw.lower()
    if any(w in low for w in ("drop", "twitch", "giveaway", "prime", "free reward")):
        return "/giveaways.html"
    if any(w in low for w in ("ssd", "storage", "heatsink", "ps5 pro", "nvme", "gear", "controller")):
        return "/affiliates-gear.html & /"
    if any(w in low for w in ("map", "region", "location", "collectible", "vice city", "leonida")):
        return "/interactive-map.html & /"
    if any(w in low for w in ("calculator", "hack", "keypad", "trainer", "split", "cut", "per hour")):
        return "/free/ & /heist-payout-calculator.html"
    if any(w in low for w in ("bank", "reserve", "yacht", "convoy", "port", "airstrip", "vault", "solo")):
        return "/ (Home FAQs) & Vault Guides"
    return "/ & /free/"


def run_keyword_gap() -> list[dict]:
    REPORT_DIR.mkdir(parents=True, exist_ok=True)
    ac_items, ac_stats = fetch_google_autocomplete()
    comp_items, comp_statuses = fetch_competitor_headings()
    site_docs, site_blob = collect_local_site_corpus()

    # Merge unique candidate phrases
    merged: dict[str, str] = {}
    for kw, src in ac_items + comp_items:
        if kw not in merged:
            merged[kw] = src

    # Add curated fallback subtopics tied strictly to our 5 seed categories in case network limits candidates
    seed_subtopics = [
        ("gta 6 heist payout calculator solo vs co op", "seed_taxonomy:payout"),
        ("gta 6 twitch drops link rockstar social club", "seed_taxonomy:drops"),
        ("gta 6 giveaways prime gaming free monthly cash", "seed_taxonomy:drops"),
        ("gta 6 best ps5 ssd heatsink storage size", "seed_taxonomy:hardware"),
        ("gta 6 interactive map all collectibles and vaults", "seed_taxonomy:map"),
        ("gta 6 highest paying heist solo per hour", "seed_taxonomy:heist"),
        ("gta 6 biometric keypad hack 15 second trainer", "seed_taxonomy:heist"),
        ("gta 6 co op 4 player heist crew cut split", "seed_taxonomy:payout"),
    ]
    for kw, src in seed_subtopics:
        merged.setdefault(kw, src)

    # Pure-Python TF-IDF over site corpus + external candidate docs
    all_docs = site_docs + [tokenize(k) for k in merged.keys() if tokenize(k)]
    n_docs = max(1, len(all_docs))
    df = collections.Counter()
    for doc in all_docs:
        for term in set(doc):
            df[term] += 1

    # Site token coverage frequency across HTML docs
    site_term_docs = collections.Counter()
    for doc in site_docs:
        for term in set(doc):
            site_term_docs[term] += 1
    n_site = max(1, len(site_docs))

    scored: list[dict] = []
    for kw, src in merged.items():
        toks = tokenize(kw)
        if not toks:
            continue
        exact_present = kw in site_blob
        # Average inverse site coverage + TF-IDF specificity
        term_scores = []
        missing_terms = 0
        for t in toks:
            idf = math.log((n_docs + 1) / (df[t] + 1)) + 1.0
            site_ratio = site_term_docs[t] / n_site
            if site_ratio < 0.08:
                missing_terms += 1
            # Higher score when keyword phrase is absent verbatim and terms have lower coverage
            gap_weight = (1.0 - min(1.0, site_ratio)) * idf
            term_scores.append(gap_weight)

        base_tfidf = sum(term_scores) / max(1, len(toks))
        if not exact_present:
            base_tfidf *= 1.45
        if src.startswith("google_autocomplete:"):
            base_tfidf *= 1.15
        elif src.startswith("competitor:"):
            base_tfidf *= 1.10

        scored.append(
            {
                "keyword": kw,
                "source": src,
                "tfidf_gap_score": round(base_tfidf, 4),
                "suggested_target_page": suggest_target_page(kw),
                "covered_in_site": "partial" if (exact_present or missing_terms == 0) else "gap",
            }
        )

    # Prefer true gaps first, then highest TF-IDF gap score, deduplicating near-identical phrases
    scored.sort(key=lambda r: (0 if r["covered_in_site"] == "gap" else 1, -r["tfidf_gap_score"], r["keyword"]))
    top25 = []
    seen_sigs = set()
    for row in scored:
        sig = " ".join(sorted(tokenize(row["keyword"])[:4]))
        if not sig or sig in seen_sigs:
            continue
        seen_sigs.add(sig)
        top25.append(row)
        if len(top25) >= 25:
            break

    with open(REPORT_CSV, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(
            f,
            fieldnames=["rank", "keyword", "source", "tfidf_gap_score", "suggested_target_page", "covered_in_site"],
        )
        writer.writeheader()
        for idx, row in enumerate(top25, 1):
            writer.writerow({"rank": idx, **row})

    with open(STATUS_JSON, "w", encoding="utf-8") as f:
        json.dump(
            {
                "autocomplete": ac_stats,
                "competitors": comp_statuses,
                "total_candidates": len(merged),
                "top_25_csv": str(REPORT_CSV.relative_to(ROOT)),
            },
            f,
            indent=2,
        )

    print(f"[+] Autocomplete: {ac_stats['ok']}/{ac_stats['queries']} queries ok -> {ac_stats['suggestions']} unique phrases")
    for st in comp_statuses:
        print(f"    Competitor {st['domain']}: HTTP {st['status']} ({st['note']}), headings={st['headings_found']}")
    print(f"[+] Wrote Top {len(top25)} missing launch keywords -> {REPORT_CSV}")
    return top25


if __name__ == "__main__":
    run_keyword_gap()
