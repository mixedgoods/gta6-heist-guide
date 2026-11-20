import glob
import re

files = glob.glob("public/*.html")
total_with_pill = 0
missing = []

for f in files:
    filename = f.split("\\")[-1]
    if filename.startswith("google") or filename == "dossier.html":
        continue
    with open(f, "r", encoding="utf-8") as fp:
        c = fp.read()
    if 'class="btn-live-pill"' in c and 'href="/live"' in c:
        total_with_pill += 1
    else:
        missing.append(f)

print(f"Total verified pages with glowing red Live pill button: {total_with_pill} / 40")
if missing:
    print("Missing in:", missing)
else:
    print("ALL 40 pages with navbar have the glowing red Live pill button!")

# Print snippet from index.html
with open("public/index.html", "r", encoding="utf-8") as fp:
    c = fp.read()
m = re.search(r'<div class=["\']nav-actions["\']>.*?</div>', c, re.DOTALL)
if m:
    print("\nSnippet from index.html nav-actions:\n", m.group(0))
