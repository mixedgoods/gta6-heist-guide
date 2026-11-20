import glob
import os
import re

BASE_DIR = r"C:\Users\Shawn\Desktop\gta6heistguide"
PUBLIC_DIR = os.path.join(BASE_DIR, "public")
CSS_FILE = os.path.join(PUBLIC_DIR, "assets", "style.css")

def update_css():
    with open(CSS_FILE, "r", encoding="utf-8") as f:
        css = f.read()

    live_css = """
/* GLOWING RED LIVE PILL BUTTON */
.btn-live-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.28rem;
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.95), rgba(185, 28, 28, 0.98));
  border: 1px solid rgba(255, 255, 255, 0.35);
  color: #fff;
  padding: 0.42rem 0.8rem;
  border-radius: 9999px;
  text-decoration: none;
  font-size: 0.8rem;
  font-weight: 900;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  font-family: var(--font-mono, monospace);
  white-space: nowrap;
  cursor: pointer;
  line-height: 1;
  transition: all 0.2s ease;
  box-shadow: 0 0 14px rgba(239, 68, 68, 0.65), inset 0 0 6px rgba(255, 255, 255, 0.25);
  animation: livePillPulse 2s infinite alternate ease-in-out;
}

.btn-live-pill:hover {
  transform: translateY(-1px) scale(1.03);
  background: linear-gradient(135deg, #f87171, #dc2626);
  border-color: #ff8585;
  box-shadow: 0 0 22px rgba(239, 68, 68, 0.95), 0 0 35px rgba(239, 68, 68, 0.5);
  color: #fff;
}

@keyframes livePillPulse {
  0% {
    box-shadow: 0 0 10px rgba(239, 68, 68, 0.55), inset 0 0 4px rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 120, 120, 0.5);
  }
  100% {
    box-shadow: 0 0 20px rgba(239, 68, 68, 0.95), 0 0 32px rgba(239, 68, 68, 0.4), inset 0 0 8px rgba(255, 255, 255, 0.45);
    border-color: #ff4d4d;
  }
}
"""

    if ".btn-live-pill" not in css:
        # Insert before .btn-vip-nav
        css = css.replace(".btn-vip-nav {", live_css + "\n.btn-vip-nav {", 1)

    # Update mobile media queries:
    # 768px
    if ".btn-live-pill" not in css[css.find("@media (max-width: 768px)"):css.find("@media (max-width: 480px)")]:
        css = css.replace(
            "  .btn-vip-nav,\n  .btn-sound {",
            "  .btn-live-pill,\n  .btn-vip-nav,\n  .btn-sound {"
        )

    # 480px
    after_480 = css.find("@media (max-width: 480px)")
    if after_480 != -1 and ".btn-live-pill" not in css[after_480:]:
        css = css.replace(
            "  .btn-vip-nav, .btn-sound {\n    padding: 0.28rem 0.5rem;",
            "  .btn-live-pill, .btn-vip-nav, .btn-sound {\n    padding: 0.26rem 0.45rem;"
        )

    with open(CSS_FILE, "w", encoding="utf-8") as f:
        f.write(css)
    print("Updated style.css with .btn-live-pill styling and responsive rules!")


def update_html_files():
    html_files = glob.glob(os.path.join(PUBLIC_DIR, "*.html"))
    pill_html = '<a href="/live" class="btn-live-pill" title="Live GTA 6 Drops, Streams &amp; Radio Hub">🔴 Live</a>\n            '

    count = 0
    for filepath in html_files:
        filename = os.path.basename(filepath)
        if filename.startswith("google") or filename == "dossier.html":
            continue

        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()

        if "btn-live-pill" in content:
            print(f"Skipping {filename}: already has btn-live-pill")
            continue

        # Regex replace before id="navVipBtn" or class="btn-vip-nav" inside nav-actions
        # Matches: <div class="nav-actions">\s*(<button[^>]*class="[^"]*btn-vip-nav[^"]*"[^>]*>)
        new_content, n = re.subn(
            r'(<div class=["\']nav-actions["\']>\s*)(<button[^>]*class=["\'][^"\']*btn-vip-nav)',
            r'\1' + pill_html + r'\2',
            content,
            count=1
        )

        if n > 0:
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(new_content)
            count += 1
        else:
            print(f"Warning: pattern not matched in {filename}")

    print(f"Successfully added glowing red Live pill button to {count} HTML pages!")

if __name__ == "__main__":
    update_css()
    update_html_files()
