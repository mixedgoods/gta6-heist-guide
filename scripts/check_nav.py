import glob
import os

files = glob.glob('public/*.html')
nav_actions_files = []
vip_btn_files = []

for f in files:
    with open(f, 'r', encoding='utf-8') as fp:
        c = fp.read()
    if 'nav-actions' in c:
        nav_actions_files.append(f)
    if 'id="navVipBtn"' in c or 'btn-vip-nav' in c:
        vip_btn_files.append(f)

print(f"Total HTML files: {len(files)}")
print(f"Files with nav-actions: {len(nav_actions_files)}")
print(f"Files with vip btn: {len(vip_btn_files)}")

diff = set(files) - set(vip_btn_files)
if diff:
    print("Files missing vip btn:", diff)
