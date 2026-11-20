import glob
import re

files = glob.glob('public/*.html')
patterns = {}

for f in files:
    with open(f, 'r', encoding='utf-8') as fp:
        c = fp.read()
    m = re.search(r'<div class=["\']nav-actions["\']>.*?</div>', c, re.DOTALL)
    if m:
        norm = re.sub(r'\s+', ' ', m.group(0))
        patterns.setdefault(norm, []).append(f)

print(f"Distinct nav-actions patterns found: {len(patterns)}")
for i, (p, flist) in enumerate(patterns.items(), 1):
    print(f"\n--- Pattern {i} ({len(flist)} files) ---")
    print(p)
    print("Files:", flist[:3])
