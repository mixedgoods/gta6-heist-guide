#!/usr/bin/env python3
"""
Phase 34.2 — Google AdSense Site Verification Automated Audit Script

Audits all HTML documents under public/ to verify:
1. Exact publisher ID (ca-pub-9556158063903839) present.
2. Exact Google AdSense script URL present.
3. async attribute present.
4. crossorigin="anonymous" present.
5. Script placed inside <head>...</head>.
6. Exactly one AdSense script per eligible HTML document.
7. Zero duplicate AdSense script references or conflicting publisher IDs.
8. Zero AdSense scripts injected into excluded documents.
9. Valid <head> and </html> structure preserved.
10. Impact.com verification meta tag preserved in public/index.html.
"""

import argparse
import json
import os
import re
import sys

EXPECTED_PUB_ID = "ca-pub-9556158063903839"
EXPECTED_SRC = f"https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client={EXPECTED_PUB_ID}"
EXPECTED_IMPACT_TAG = "<meta name='impact-site-verification' value='f69da5d8-ba34-4487-a5d9-2985b3e4c47d'>"

EXCLUDED_HTML = {
    "404.html": "Error-only 404 Not Found document (noindex, nofollow); AdSense prohibits ads on error pages.",
    "google29e7fdcf68272179.html": "Google Search Console HTML ownership verification file (no <head> element).",
    "googlec63f7e8032408675.html": "Google Search Console HTML ownership verification file (no <head> element).",
    "cd-admin/index.html": "Protected administrative moderation interface (Cloudflare Access + noindex, nofollow, noarchive).",
    "syndicate-command.html": "Internal owner-only email and marketing command console (noindex, nofollow).",
    "community-discoveries/submit/index.html": "Community discovery submission form (noindex, nofollow); explicitly excluded from monetization.",
    "embed/calculator.html": "Third-party embeddable iframe widget (X-Frame-Options: ALLOWALL, noindex).",
    "embed/clock.html": "Third-party embeddable stream/iframe widget (X-Frame-Options: ALLOWALL, noindex).",
}

SCRIPT_TAG_RE = re.compile(
    r"<script\b[^>]*googlesyndication\.com[^>]*>\s*</script>",
    re.IGNORECASE | re.DOTALL,
)
ANY_ADSENSE_RE = re.compile(r"adsbygoogle|googlesyndication\.com|ca-pub-\d+", re.IGNORECASE)
PUB_ID_RE = re.compile(r"ca-pub-\d+", re.IGNORECASE)
HEAD_RE = re.compile(r"<head\b[^>]*>(.*?)</head>", re.IGNORECASE | re.DOTALL)


def audit_public_dir(public_dir: str) -> dict:
    html_files = []
    for root, _, files in os.walk(public_dir):
        for fname in files:
            if fname.lower().endswith(".html"):
                rel = os.path.relpath(os.path.join(root, fname), public_dir).replace(os.sep, "/")
                html_files.append(rel)
    html_files.sort()

    eligible_files = []
    excluded_found = {}
    passed_files = []
    errors = []
    duplicate_files = []
    conflicting_pub_ids = []

    for rel in html_files:
        full_path = os.path.join(public_dir, rel)
        with open(full_path, "r", encoding="utf-8", errors="replace") as f:
            content = f.read()

        if rel in EXCLUDED_HTML:
            excluded_found[rel] = EXCLUDED_HTML[rel]
            if ANY_ADSENSE_RE.search(content):
                errors.append(f"EXCLUDED_HAS_ADSENSE: {rel}")
            continue

        eligible_files.append(rel)

        # Structural checks
        head_matches = HEAD_RE.findall(content)
        if len(head_matches) != 1:
            errors.append(f"INVALID_HEAD_COUNT ({len(head_matches)}): {rel}")
            continue

        if "</html>" not in content.lower():
            errors.append(f"MISSING_CLOSING_HTML: {rel}")

        head_html = head_matches[0]
        body_or_outside = HEAD_RE.sub("", content)

        # Check for wrong publisher IDs anywhere in file
        found_pub_ids = set(PUB_ID_RE.findall(content))
        wrong_ids = {pid for pid in found_pub_ids if pid != EXPECTED_PUB_ID}
        if wrong_ids:
            conflicting_pub_ids.append((rel, sorted(wrong_ids)))
            errors.append(f"CONFLICTING_PUB_ID ({sorted(wrong_ids)}): {rel}")

        # Check for AdSense references outside <head>
        if ANY_ADSENSE_RE.search(body_or_outside):
            errors.append(f"ADSENSE_OUTSIDE_HEAD: {rel}")

        # Check script tags inside <head>
        scripts_in_head = SCRIPT_TAG_RE.findall(head_html)
        if len(scripts_in_head) == 0:
            errors.append(f"MISSING_ADSENSE_SCRIPT: {rel}")
            continue
        if len(scripts_in_head) > 1:
            duplicate_files.append(rel)
            errors.append(f"DUPLICATE_ADSENSE_SCRIPT ({len(scripts_in_head)}): {rel}")
            continue

        tag = scripts_in_head[0]
        tag_ok = True
        if EXPECTED_SRC not in tag:
            errors.append(f"INCORRECT_SRC: {rel}")
            tag_ok = False
        if not re.search(r"\basync\b", tag, re.IGNORECASE):
            errors.append(f"MISSING_ASYNC: {rel}")
            tag_ok = False
        if 'crossorigin="anonymous"' not in tag:
            errors.append(f"MISSING_CROSSORIGIN_ANONYMOUS: {rel}")
            tag_ok = False

        # Ensure no stray second reference to adsbygoogle inside <head>
        if len(re.findall(r"adsbygoogle", head_html, re.IGNORECASE)) != 1:
            duplicate_files.append(rel)
            errors.append(f"DUPLICATE_ADSBYGOOGLE_REF: {rel}")
            tag_ok = False

        if tag_ok:
            passed_files.append(rel)

    # Check Impact.com verification tag in public/index.html
    index_path = os.path.join(public_dir, "index.html")
    impact_ok = False
    if os.path.exists(index_path):
        with open(index_path, "r", encoding="utf-8", errors="replace") as f:
            index_content = f.read()
        head_match = HEAD_RE.search(index_content)
        if head_match and EXPECTED_IMPACT_TAG in head_match.group(1):
            impact_ok = True
        else:
            errors.append("MISSING_IMPACT_VERIFICATION_TAG: index.html")
    else:
        errors.append("MISSING_INDEX_HTML")

    return {
        "publisher_id": EXPECTED_PUB_ID,
        "expected_src": EXPECTED_SRC,
        "total_html_discovered": len(html_files),
        "total_eligible": len(eligible_files),
        "eligible_passed": len(passed_files),
        "excluded_count": len(excluded_found),
        "excluded_documents": excluded_found,
        "duplicate_count": len(duplicate_files),
        "duplicate_files": duplicate_files,
        "conflicting_pub_ids": conflicting_pub_ids,
        "impact_verification_intact": impact_ok,
        "error_count": len(errors),
        "errors": errors,
        "status": "PASS" if (len(errors) == 0 and len(passed_files) == len(eligible_files) and impact_ok) else "FAIL",
    }


def main():
    parser = argparse.ArgumentParser(description="Audit Google AdSense site verification code coverage.")
    parser.add_argument(
        "--public-dir",
        default=os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "public"),
        help="Path to the public/ directory.",
    )
    parser.add_argument("--json", action="store_true", help="Output JSON report.")
    args = parser.parse_args()

    result = audit_public_dir(args.public_dir)
    if args.json:
        print(json.dumps(result, indent=2))
    else:
        print(f"AdSense Verification Audit: {result['status']}")
        print(f"  Publisher ID:              {result['publisher_id']}")
        print(f"  Total HTML discovered:     {result['total_html_discovered']}")
        print(f"  Total eligible documents:  {result['total_eligible']}")
        print(f"  Eligible passed:           {result['eligible_passed']}/{result['total_eligible']}")
        print(f"  Excluded documents:        {result['excluded_count']}")
        print(f"  Duplicate script files:    {result['duplicate_count']}")
        print(f"  Conflicting pub IDs:       {len(result['conflicting_pub_ids'])}")
        print(f"  Impact.com tag intact:     {result['impact_verification_intact']}")
        print(f"  Errors:                    {result['error_count']}")
        if result["errors"]:
            for err in result["errors"][:30]:
                print(f"    - {err}")

    sys.exit(0 if result["status"] == "PASS" else 1)


if __name__ == "__main__":
    main()
