import glob
import os
import re

PUBLIC_DIR = r"C:\Users\Shawn\Desktop\gta6heistguide\public"

NAV_RADIO = '<li><a href="/radio" class="nav-pill" style="color:var(--neon-cyan); font-weight:800;">📻 Radio</a></li>'
NAV_SECRETS = '<li><a href="/secrets" class="nav-pill" style="color:var(--neon-pink); font-weight:800;">🥚 Secrets</a></li>'

FOOTER_COL_RADIO = '<li><a href="/radio" style="color:var(--neon-cyan); font-weight:700;">📻 Radio Stations &amp; Music</a></li>'
FOOTER_COL_SECRETS = '<li><a href="/secrets" style="color:var(--neon-pink); font-weight:700;">🥚 Secrets &amp; Cryptids</a></li>'

FOOTER_STRIP_LINKS = '<a href="/radio" style="color:var(--neon-cyan); text-decoration:none; font-weight:700;">📻 Radio</a>\n                  <a href="/secrets" style="color:var(--neon-pink); text-decoration:none; font-weight:700;">🥚 Secrets</a>'

def update_file(filepath):
    filename = os.path.basename(filepath)
    if "interactive-map" in filename:
        print(f"Skipping {filename} (DO NOT MODIFY /interactive-map rule)")
        return
    if filename.startswith("google"):
        return

    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    changed = False

    # 1. Update nav-links if present and not already having radio/secrets
    if 'class="nav-links"' in content:
        has_radio = 'href="/radio.html"' in content or 'href="/radio"' in content
        has_secrets = 'href="/secrets.html"' in content or 'href="/secrets"' in content

        if not (has_radio and has_secrets):
            # Target to insert after cheats.html or after vaults
            target = re.search(r'(<li><a href=["\']/cheats\.html["\'][^>]*>.*?</a></li>)', content, re.DOTALL)
            if target:
                items_to_add = []
                if not has_secrets:
                    items_to_add.append(NAV_SECRETS)
                if not has_radio:
                    items_to_add.append(NAV_RADIO)
                insertion = "\n            " + "\n            ".join(items_to_add)
                content = content[:target.end()] + insertion + content[target.end():]
                changed = True
            else:
                # Alternative: insert after <ul class="nav-links">
                ul_match = re.search(r'(<ul class=["\']nav-links["\']>\s*)', content)
                if ul_match:
                    items_to_add = []
                    if not has_secrets:
                        items_to_add.append(NAV_SECRETS)
                    if not has_radio:
                        items_to_add.append(NAV_RADIO)
                    insertion = "\n            " + "\n            ".join(items_to_add)
                    content = content[:ul_match.end()] + insertion + content[ul_match.end():]
                    changed = True

    # 2. Update footer column links
    if 'footer-links-grid' in content or 'footer-col-links' in content:
        if 'href="/radio.html"' not in content and 'href="/radio"' not in content:
            # Insert into Tactical Tools column
            col_target = re.search(r'(<span class=["\']footer-col-title["\'][^>]*>.*?Tactical Tools</span>\s*<ul class=["\']footer-col-links["\']>\s*)', content, re.DOTALL | re.IGNORECASE)
            if col_target:
                content = content[:col_target.end()] + f"\n                      {FOOTER_COL_RADIO}\n                      {FOOTER_COL_SECRETS}" + content[col_target.end():]
                changed = True
            else:
                # Insert into first footer-col-links
                first_col = re.search(r'(<ul class=["\']footer-col-links["\']>\s*)', content)
                if first_col:
                    content = content[:first_col.end()] + f"\n                      {FOOTER_COL_RADIO}\n                      {FOOTER_COL_SECRETS}" + content[first_col.end():]
                    changed = True

    # 3. Update footer secondary strip if present
    if 'footer-secondary-strip' in content:
        has_radio_strip = 'href="/radio.html"' in content or 'href="/radio"' in content
        has_secrets_strip = 'href="/secrets.html"' in content or 'href="/secrets"' in content
        if not (has_radio_strip and has_secrets_strip):
            strip_match = re.search(r'(<a href=["\']/cheats\.html["\'][^>]*>.*?</a>\s*)', content, re.DOTALL)
            if strip_match:
                content = content[:strip_match.end()] + f"\n                  {FOOTER_STRIP_LINKS}\n                  " + content[strip_match.end():]
                changed = True

    if changed:
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Updated nav & footer in {filename}")
    else:
        print(f"No changes needed or already present in {filename}")

def main():
    files = glob.glob(os.path.join(PUBLIC_DIR, "*.html"))
    # Also check subfolders
    sub_files = glob.glob(os.path.join(PUBLIC_DIR, "**", "*.html"), recursive=True)
    all_files = sorted(list(set(files + sub_files)))
    print(f"Found {len(all_files)} total HTML files to inspect.")
    for f in all_files:
        update_file(f)

if __name__ == "__main__":
    main()
