import csv
import os
from datetime import datetime, timedelta
from PIL import Image, ImageDraw, ImageFont

BASE_DIR = r"C:\Users\Shawn\Desktop\gta6heistguide"
PINS_DIR = os.path.join(BASE_DIR, "public", "pins")
CSV_PATH = os.path.join(BASE_DIR, "gta6_pinterest_bulk_upload.csv")
SHOTS_DIR = r"C:\Users\Shawn\.gemini\antigravity\brain\1ccada3c-a013-4d4d-a5e7-b3531bb36366\browser_sandbox\screenshots"

os.makedirs(PINS_DIR, exist_ok=True)

FONT_BOLD = r"C:\Windows\Fonts\segoeuib.ttf"
FONT_REG = r"C:\Windows\Fonts\segoeui.ttf"
FONT_MONO = r"C:\Windows\Fonts\consolab.ttf"

WIDTH, HEIGHT = 1000, 1500

THEMES = {
    "Maps & Vault Blueprints": {
        "badge": "MAPS & VAULT BLUEPRINTS",
        "board": "GTA 6 Heist Maps & Blueprints",
        "accent": (0, 240, 255),      # Neon Cyan
        "secondary": (255, 42, 133),  # Neon Magenta
        "cta_text": (7, 11, 20),
    },
    "Payout Guides & Calculators": {
        "badge": "PAYOUT GUIDES & CALCULATORS",
        "board": "GTA 6 Payout Guides & Calculators",
        "accent": (0, 255, 157),      # Neon Green
        "secondary": (0, 240, 255),   # Neon Cyan
        "cta_text": (7, 11, 20),
    },
    "Gaming Gear & Setup Deals": {
        "badge": "GAMING GEAR & SETUP DEALS",
        "board": "GTA 6 Gaming Gear & Setup Deals",
        "accent": (255, 184, 0),      # Amber Gold
        "secondary": (0, 240, 255),   # Neon Cyan
        "cta_text": (7, 11, 20),
    },
}

PINS = [
    # --- Category 1: Maps & Vault Blueprints (6) ---
    {
        "filename": "leonida-radar-map.png",
        "category": "Maps & Vault Blueprints",
        "headline": "Interactive Leonida\nHeist Radar Map",
        "subtitle": "Pinpoint vaults, safehouses, escape tunnels & fuel stops across all 6 regions.",
        "bullets": [
            "18+ trackable vaults & safehouses",
            "Filterable escape corridors & airfields",
            "Save custom personal & squad pins",
        ],
        "cta": "EXPLORE RADAR MAP →",
        "shot": "step_12_shot_1.png",
        "crop": (10, 14, 1002, 560),
        "title": "GTA 6 Interactive Leonida Radar Map & Vault Locations",
        "description": "Explore the free interactive GTA 6 Leonida Radar Map. Locate bank vaults, safehouses, escape tunnels, airfields, and fuel stops across all 6 regions with custom squad pins.",
        "link": "https://www.gta6heistguide.com/interactive-map",
        "keywords": "gta 6 map, leonida radar map, gta 6 vault locations, gta 6 heist map, vice city map",
    },
    {
        "filename": "sinfrontera-bank-blueprint.png",
        "category": "Maps & Vault Blueprints",
        "headline": "Sinfrontera Bank\nVault Blueprint",
        "subtitle": "Silent infiltration vs. heavy breach routes for the $14.5M Vice City vault.",
        "bullets": [
            "Optimal 3-operative crew split",
            "Underground aqueduct escape path",
            "15-second keypad bypass timing",
        ],
        "cta": "VIEW BANK BLUEPRINT →",
        "shot": "step_59_shot_2.png",
        "crop": (28, 95, 985, 640),
        "title": "Sinfrontera Bank Vault Blueprint & Stealth Route (GTA 6)",
        "description": "Master the Sinfrontera National Bank heist in GTA 6. Compare silent infiltration vs. heavy breach approaches, crew specialists, and underground aqueduct escape routes.",
        "link": "https://www.gta6heistguide.com/sinfrontera-bank",
        "keywords": "gta 6 sinfrontera bank, gta 6 bank heist, gta 6 vault blueprint, gta 6 stealth guide",
    },
    {
        "filename": "state-gold-reserve-blueprint.png",
        "category": "Maps & Vault Blueprints",
        "headline": "State Gold Reserve\nLaser Grid Guide",
        "subtitle": "Crack the $25M Leonida Gold Reserve with zero-alert laser timing.",
        "bullets": [
            "Silent sewer intake + thermal lance",
            "48-minute global vault cooldown",
            "Max squad payout breakdown",
        ],
        "cta": "OPEN RESERVE GUIDE →",
        "shot": "step_59_shot_1.png",
        "crop": (28, 95, 985, 640),
        "title": "Leonida State Gold Reserve Heist Blueprint ($25M Vault)",
        "description": "Plan the $25M Leonida State Gold Reserve infiltration. Includes laser grid bypass timing, sewer intake entry, thermal lance setup, and full 4-player payout splits.",
        "link": "https://www.gta6heistguide.com/leonida-reserve",
        "keywords": "gta 6 gold reserve, leonida reserve heist, gta 6 laser grid, gta 6 max payout",
    },
    {
        "filename": "starlet-superyacht-heist.png",
        "category": "Maps & Vault Blueprints",
        "headline": "Starlet Superyacht\nOffshore Raid",
        "subtitle": "Submersible approach, deck guard patrol loops & speedboat exfiltration.",
        "bullets": [
            "Zero-splash scuba infiltration",
            "VIP cabin safe & bearer bonds",
            "Offshore speedboat escape vectors",
        ],
        "cta": "VIEW YACHT BLUEPRINT →",
        "shot": "step_59_shot_3.png",
        "crop": (28, 95, 985, 640),
        "title": "Starlet Superyacht Offshore Heist Blueprint (Vice City)",
        "description": "Infiltrate the Starlet Superyacht off Vice City. Compare silent scuba boarding vs. deck assault, locate the VIP cabin safe, and map your offshore speedboat escape.",
        "link": "https://www.gta6heistguide.com/vice-city-yacht-heist",
        "keywords": "gta 6 yacht heist, starlet superyacht, vice city offshore heist, gta 6 stealth raid",
    },
    {
        "filename": "grassrivers-airstrip-raid.png",
        "category": "Maps & Vault Blueprints",
        "headline": "Grassrivers Airstrip\nSmuggler Run",
        "subtitle": "Night-window cartel runway ambush & airboat swamp extraction routes.",
        "bullets": [
            "Flat-bottom airboat reed escape",
            "Runway radar blind-spot entry",
            "High-value contraband crate map",
        ],
        "cta": "PLAN AIRSTRIP RAID →",
        "shot": "step_59_shot_4.png",
        "crop": (28, 95, 985, 640),
        "title": "Grassrivers Cartel Airstrip Raid & Swamp Escape Map",
        "description": "Tackle the Grassrivers Airstrip Smuggler Run in GTA 6. Use radar blind spots, time night-window runway ambushes, and escape through swamp reed beds via airboat.",
        "link": "https://www.gta6heistguide.com/everglades-smuggler-run",
        "keywords": "gta 6 grassrivers, everglades smuggler run, gta 6 airstrip heist, gta 6 airboat escape",
    },
    {
        "filename": "pelican-valley-credit-union.png",
        "category": "Maps & Vault Blueprints",
        "headline": "Pelican Valley\nCredit Union Plan",
        "subtitle": "Fast $3.8M duo cash grab along the sugarcane railway & canal reeds.",
        "bullets": [
            "Duo run split: $1.9M per player",
            "Sugarcane railway cut vs. night raid",
            "Canal airboat exfiltration route",
        ],
        "cta": "VIEW VAULT TARGETS →",
        "shot": "step_78_shot_4_pelican_valley_blueprint.png",
        "crop": (12, 0, 305, 642),
        "title": "Pelican Valley Credit Union Heist Blueprint ($3.8M Duo)",
        "description": "Hit the Pelican Valley Agricultural Credit Union for a fast $3.8M duo split ($1.9M each). Includes sugarcane railway approaches and canal airboat exfiltration routes.",
        "link": "https://www.gta6heistguide.com/#all-heists",
        "keywords": "pelican valley credit union, gta 6 duo heist, gta 6 map leak, gta 6 quick cash",
    },

    # --- Category 2: Payout Guides & Calculators (6) ---
    {
        "filename": "heist-payout-calculator.png",
        "category": "Payout Guides & Calculators",
        "headline": "GTA 6 Heist Payout\n& Cut Calculator",
        "subtitle": "Simulate gross take, specialist cuts & net $/hour before you breach.",
        "bullets": [
            "Supports all major Leonida vaults",
            "Includes stealth & weekly 1.5x bonus",
            "Shareable squad build links",
        ],
        "cta": "CALCULATE PAYOUT →",
        "shot": "step_14_shot_1.png",
        "crop": (14, 250, 995, 642),
        "title": "Free GTA 6 Heist Payout Calculator & Net $/Hour Tool",
        "description": "Optimize every GTA 6 heist with our free interactive Payout Calculator. Test target vaults, infiltration approaches, specialist cuts, and net $/hour before launching.",
        "link": "https://www.gta6heistguide.com/heist-planner",
        "keywords": "gta 6 payout calculator, gta 6 heist planner, gta 6 money guide, heist cut calculator",
    },
    {
        "filename": "four-player-cut-splits.png",
        "category": "Payout Guides & Calculators",
        "headline": "4-Player Heist Cut\nSplit Optimizer",
        "subtitle": "Maximize per-player net take after fence fees & specialist percentages.",
        "bullets": [
            "2P / 3P / 4P grab time & speed math",
            "Safehouse laundering fee slider",
            "Instant $/minute grind benchmark",
        ],
        "cta": "OPTIMIZE CUT SPLITS →",
        "shot": "step_18_shot_1.png",
        "crop": (12, 8, 995, 632),
        "title": "GTA 6 4-Player Cut Split & Net $/Hour Optimizer",
        "description": "See exact 4-player net payouts, specialist cuts, safehouse laundering fees, and $/minute grind efficiency with the free GTA 6 Cut Split Optimizer.",
        "link": "https://www.gta6heistguide.com/calculator",
        "keywords": "gta 6 4 player cut, gta 6 heist split, gta 6 money per hour, gta 6 calculator",
    },
    {
        "filename": "lucia-jason-synergy.png",
        "category": "Payout Guides & Calculators",
        "headline": "Lucia & Jason\nSynergy Simulator",
        "subtitle": "Balance stealth efficiency, combat suppression & co-op extraction speed.",
        "bullets": [
            "Test Point Lead & approach combos",
            "Live Co-Op Trust & Sync slider",
            "Optimal keypad vs. overwatch roles",
        ],
        "cta": "TEST SYNERGY BUILD →",
        "shot": "step_48_shot_1.png",
        "crop": (12, 85, 995, 608),
        "title": "Lucia & Jason Co-Op Synergy Simulator (GTA 6 Skills)",
        "description": "Test how switching Lucia and Jason's lead roles, approach strategies, and Co-Op Trust levels boosts stealth efficiency and extraction speed (+11% loot bonus).",
        "link": "https://www.gta6heistguide.com/lucia-jason-skills#synergy-calculator",
        "keywords": "lucia and jason gta 6, gta 6 synergy simulator, gta 6 co-op skills, gta 6 stealth build",
    },
    {
        "filename": "bag-weight-simulator.png",
        "category": "Payout Guides & Calculators",
        "headline": "Heist Bag Weight\n& Stealth Simulator",
        "subtitle": "Track duffel kg, sprint penalty, acoustic dB & max cash capacity.",
        "bullets": [
            "1-click Stealth & Heavy presets",
            "Live 40kg bag weight & dB meter",
            "Export loadout directly to Planner",
        ],
        "cta": "BUILD LOADOUT →",
        "shot": "step_28_shot_1.png",
        "crop": (12, 208, 995, 545),
        "title": "GTA 6 Heist Bag Weight, Acoustic dB & Loadout Simulator",
        "description": "Balance firepower and mobility with the GTA 6 Bag Weight Simulator. Calculate duffel kg, sprint speed penalties, acoustic dB footprint, and max cash capacity.",
        "link": "https://www.gta6heistguide.com/weapons-gear#loadoutSimulator",
        "keywords": "gta 6 loadout simulator, gta 6 bag weight, gta 6 stealth weapons, gta 6 gear guide",
    },
    {
        "filename": "five-star-evasion-timer.png",
        "category": "Payout Guides & Calculators",
        "headline": "5-Star Evasion &\nVault Cooldown HUD",
        "subtitle": "Second-screen live Leonida clock, 48m cooldown chime & 90s panic timer.",
        "bullets": [
            "Real-time 48-min Leonida day/night",
            "One-click 90s police evasion timer",
            "Built-in tactical alert audio FX",
        ],
        "cta": "LAUNCH LIVE HUD →",
        "shot": "step_68_shot_1_evasion_timer.png",
        "crop": (12, 162, 995, 642),
        "title": "GTA 6 5-Star Evasion Timer & Live Vault Cooldown HUD",
        "description": "Keep this free second-screen companion HUD open while playing: live Leonida 48-min clock, global vault cooldown chime, and 90-second 5-Star police evasion panic timer.",
        "link": "https://www.gta6heistguide.com/#panicTimerDisplay",
        "keywords": "gta 6 evasion timer, 5 star wanted gta 6, gta 6 vault cooldown, second screen hud",
    },
    {
        "filename": "free-day1-tactical-dossier.png",
        "category": "Payout Guides & Calculators",
        "headline": "Free Day-1 Vice City\nTactical Dossier",
        "subtitle": "Police scanner delays, trunk weapon rules & top 3 speedrun targets.",
        "bullets": [
            "+30s dispatch delay crew strat",
            "Concealed sidearm vs. trunk rifle",
            "Printable / save-as-PDF briefing",
        ],
        "cta": "GET FREE DOSSIER →",
        "shot": "step_28_shot_3.png",
        "crop": (72, 90, 938, 642),
        "title": "Free GTA 6 Day-1 Tactical Survival Dossier (PDF Guide)",
        "description": "Download or print the free GTA 6 Day-1 Tactical Survival Dossier. Covers VCPD dispatch delays, trunk weapon stash rules, radar scramblers, and top speedrun targets.",
        "link": "https://www.gta6heistguide.com/dossier",
        "keywords": "gta 6 day 1 guide, gta 6 survival dossier, gta 6 speedrun targets, gta 6 tips",
    },

    # --- Category 3: Gaming Gear & Setup Deals (6) ---
    {
        "filename": "ps5-nvme-ssd-210gb-guide.png",
        "category": "Gaming Gear & Setup Deals",
        "headline": "PS5 210GB+ NVMe\nSSD Upgrade Guide",
        "subtitle": "Eliminate Vice City texture pop-in with 7,450 MB/s Gen4 storage.",
        "bullets": [
            "Samsung 990 PRO 2TB w/ heatsink",
            "Built for 210GB+ Day-1 install",
            "Verified Syndicate hardware deal",
        ],
        "cta": "CHECK SSD DEAL →",
        "shot": "step_43_shot_2.png",
        "crop": (254, 4, 496, 605),
        "title": "PS5 210GB+ NVMe SSD Upgrade Guide for GTA 6 (Samsung 990 PRO)",
        "description": "Prepare your PS5 for GTA 6's massive install size. Upgrade to a 7,450 MB/s Gen4 NVMe SSD with integrated heatsink to eliminate open-world texture pop-in.",
        "link": "https://www.gta6heistguide.com/#verified-gear",
        "keywords": "ps5 ssd upgrade gta 6, samsung 990 pro ps5, gta 6 storage size, ps5 nvme deal",
    },
    {
        "filename": "best-coop-headsets-gta6.png",
        "category": "Gaming Gear & Setup Deals",
        "headline": "Best Co-Op Heist\nHeadset Setup",
        "subtitle": "Planar magnetic drivers & AI mic noise rejection for squad callouts.",
        "bullets": [
            "PULSE Elite wireless low-latency",
            "Crystal-clear stealth comms",
            "Verified seasonal deal tracker",
        ],
        "cta": "VIEW HEADSET DEAL →",
        "shot": "step_43_shot_2.png",
        "crop": (502, 4, 744, 605),
        "title": "Best Co-Op Gaming Headset for GTA 6 Heist Comms (PULSE Elite)",
        "description": "Hear every footstep and keep squad callouts crisp with planar magnetic drivers and AI noise-rejection boom mic. Check the verified PULSE Elite co-op headset deal.",
        "link": "https://www.gta6heistguide.com/#verified-gear",
        "keywords": "best ps5 headset gta 6, pulse elite headset, co-op gaming headset, gta 6 audio setup",
    },
    {
        "filename": "dualsense-edge-thumbsticks.png",
        "category": "Gaming Gear & Setup Deals",
        "headline": "DualSense Edge &\nPro Aim Grips",
        "subtitle": "Remappable rear paddles & trigger stops for sub-15s vault shootouts.",
        "bullets": [
            "Instant hair-trigger lock switches",
            "Swappable stick caps & modules",
            "Pair with high-rise FPS grips",
        ],
        "cta": "SEE PRO CONTROLLER →",
        "shot": "step_48_shot_3.png",
        "crop": (254, 90, 496, 642),
        "title": "DualSense Edge Pro Controller & Precision Thumbstick Setup",
        "description": "Gain an edge in GTA 6 firefights with remappable rear paddles, adjustable trigger stops, and interchangeable stick caps on the DualSense Edge Pro.",
        "link": "https://www.gta6heistguide.com/#verified-gear",
        "keywords": "dualsense edge ps5, pro controller gta 6, kontrolfreek thumbsticks, ps5 controller setup",
    },
    {
        "filename": "dualsense-charging-dock-setup.png",
        "category": "Gaming Gear & Setup Deals",
        "headline": "Marathon Heist\nCharging Dock Setup",
        "subtitle": "Click-in dual controller charging without occupying console USB ports.",
        "bullets": [
            "Charges 2 DualSense pads at once",
            "Zero-cable click-in cradle",
            "Under-$30 Day-1 essentials pick",
        ],
        "cta": "GRAB CHARGING DOCK →",
        "shot": "step_48_shot_3.png",
        "crop": (10, 90, 248, 642),
        "title": "PS5 DualSense Charging Dock Setup for Marathon Heist Sessions",
        "description": "Keep two DualSense controllers topped off for all-night Vice City heist runs without tying up console USB ports. Check our verified under-$30 dock pick.",
        "link": "https://www.gta6heistguide.com/#verified-gear",
        "keywords": "dualsense charging dock, ps5 setup accessories, gta 6 marathon setup, ps5 controller dock",
    },
    {
        "filename": "low-ping-exitlag-guide.png",
        "category": "Gaming Gear & Setup Deals",
        "headline": "Low-Ping Routing &\nDDoS Lobby Shield",
        "subtitle": "Stabilize co-op heist connections across 6,000+ optimized game servers.",
        "bullets": [
            "Reduces packet loss & ping spikes",
            "Threat protection in public lobbies",
            "Save with Syndicate partner code",
        ],
        "cta": "CHECK EXITLAG DEAL →",
        "shot": "step_74_shot_2_affiliates_exitlag.png",
        "crop": (10, 140, 326, 512),
        "title": "Low-Ping ExitLag Routing & Lobby Protection Guide for GTA",
        "description": "Cut lag spikes and protect against lobby IP grabbing in online co-op sessions with ExitLag's 6,000+ gaming routing servers.",
        "link": "https://www.gta6heistguide.com/affiliates-gear#hardware-grid",
        "keywords": "exitlag gaming vpn, low ping gta online, gta 6 co-op lag fix, ddos protection gaming",
    },
    {
        "filename": "discounted-psn-xbox-cards.png",
        "category": "Gaming Gear & Setup Deals",
        "headline": "Discounted PSN &\nXbox Gift Cards",
        "subtitle": "Save up to 20% on PlayStation Store & Xbox Live digital wallet codes.",
        "bullets": [
            "Instant digital code delivery",
            "Zero hidden service markups",
            "Stack savings on Day-1 pre-orders",
        ],
        "cta": "COMPARE CARD DEALS →",
        "shot": "step_48_shot_3.png",
        "crop": (502, 90, 744, 642),
        "title": "Discounted PSN & Xbox Gift Cards (Save Up to 20% Digital)",
        "description": "Save up to 20% on PlayStation Store and Xbox Live digital gift cards with instant code delivery for GTA 6 pre-orders and in-game bundles.",
        "link": "https://www.gta6heistguide.com/#verified-gear",
        "keywords": "discounted psn cards, cheap xbox gift cards, gta 6 preorder deal, digital game keys",
    },
]


def draw_rounded_rect(draw, xy, radius, fill=None, outline=None, width=1):
    draw.rounded_rectangle(xy, radius=radius, fill=fill, outline=outline, width=width)


def draw_grid_background(img):
    draw = ImageDraw.Draw(img)
    grid_color = (14, 23, 42)
    for x in range(0, WIDTH, 50):
        draw.line([(x, 0), (x, HEIGHT)], fill=grid_color, width=1)
    for y in range(0, HEIGHT, 50):
        draw.line([(0, y), (WIDTH, y)], fill=grid_color, width=1)
    return draw


def draw_corner_brackets(draw, box, color, length=24, width=3):
    x1, y1, x2, y2 = box
    # Top-left
    draw.line([(x1, y1 + length), (x1, y1), (x1 + length, y1)], fill=color, width=width)
    # Top-right
    draw.line([(x2 - length, y1), (x2, y1), (x2, y1 + length)], fill=color, width=width)
    # Bottom-left
    draw.line([(x1, y2 - length), (x1, y2), (x1 + length, y2)], fill=color, width=width)
    # Bottom-right
    draw.line([(x2 - length, y2), (x2, y2), (x2, y2 - length)], fill=color, width=width)


def wrap_text(draw, text, font, max_width):
    words = text.split()
    lines = []
    cur = []
    for w in words:
        test = " ".join(cur + [w])
        bbox = draw.textbbox((0, 0), test, font=font)
        if bbox[2] - bbox[0] <= max_width:
            cur.append(w)
        else:
            if cur:
                lines.append(" ".join(cur))
            cur = [w]
    if cur:
        lines.append(" ".join(cur))
    return lines


def generate_pin(pin):
    theme = THEMES[pin["category"]]
    accent = theme["accent"]
    secondary = theme["secondary"]

    img = Image.new("RGB", (WIDTH, HEIGHT), (7, 11, 20))
    draw = draw_grid_background(img)

    # Top accent bar
    draw.rectangle([0, 0, WIDTH, 8], fill=accent)
    draw.rectangle([WIDTH // 2, 0, WIDTH, 8], fill=secondary)

    # Subtle top glow strip
    draw.rectangle([0, 8, WIDTH, 11], fill=(accent[0] // 4, accent[1] // 4, accent[2] // 4))

    # --- TOP 30% (y = 0..450) ---
    f_badge = ImageFont.truetype(FONT_MONO, 21)
    f_head = ImageFont.truetype(FONT_BOLD, 60)
    f_sub = ImageFont.truetype(FONT_REG, 27)

    # Category Badge
    badge_text = f"//  {theme['badge']}"
    bb = draw.textbbox((0, 0), badge_text, font=f_badge)
    bw = bb[2] - bb[0] + 44
    bh = 44
    bx1 = (WIDTH - bw) // 2
    by1 = 40
    badge_bg = (accent[0] // 8 + 8, accent[1] // 8 + 10, accent[2] // 8 + 18)
    draw_rounded_rect(draw, [bx1, by1, bx1 + bw, by1 + bh], radius=22, fill=badge_bg, outline=accent, width=2)
    draw.text((bx1 + 22, by1 + 10), badge_text, font=f_badge, fill=accent)

    # Bold Hook Headline (centered, 2 lines)
    y_cursor = 112
    for line in pin["headline"].split("\n"):
        lb = draw.textbbox((0, 0), line, font=f_head)
        lw = lb[2] - lb[0]
        lx = (WIDTH - lw) // 2
        draw.text((lx + 2, y_cursor + 3), line, font=f_head, fill=(0, 0, 0))
        draw.text((lx, y_cursor), line, font=f_head, fill=(255, 255, 255))
        y_cursor += 72

    # Short Value Subtitle (centered, wrapped)
    y_cursor += 16
    sub_lines = wrap_text(draw, pin["subtitle"], f_sub, 860)[:2]
    for line in sub_lines:
        sb = draw.textbbox((0, 0), line, font=f_sub)
        sw = sb[2] - sb[0]
        draw.text(((WIDTH - sw) // 2, y_cursor), line, font=f_sub, fill=(180, 198, 220))
        y_cursor += 38

    # Divider line before middle section
    draw.line([(60, 434), (WIDTH - 60, 434)], fill=(30, 45, 70), width=2)

    # --- MIDDLE 55% (y = 450..1275) ---
    frame_box = (42, 454, WIDTH - 42, 1266)
    draw_rounded_rect(draw, frame_box, radius=18, fill=(11, 17, 32), outline=accent, width=2)
    draw_corner_brackets(draw, (34, 446, WIDTH - 34, 1274), secondary, length=28, width=4)

    shot_path = os.path.join(SHOTS_DIR, pin["shot"])
    src = Image.open(shot_path).convert("RGB")
    cropped = src.crop(pin["crop"])

    inner_pad = 16
    max_w = (frame_box[2] - frame_box[0]) - inner_pad * 2
    max_h = (frame_box[3] - frame_box[1]) - inner_pad * 2
    cw, ch = cropped.size
    scale = min(max_w / cw, max_h / ch)
    new_w, new_h = int(cw * scale), int(ch * scale)
    resized = cropped.resize((new_w, new_h), Image.Resampling.LANCZOS)

    paste_x = frame_box[0] + inner_pad + (max_w - new_w) // 2
    paste_y = frame_box[1] + inner_pad + (max_h - new_h) // 2
    img.paste(resized, (paste_x, paste_y))
    draw.rectangle([paste_x - 1, paste_y - 1, paste_x + new_w, paste_y + new_h], outline=(35, 55, 85), width=1)

    # --- BOTTOM 15% (y = 1275..1500) ---
    f_bullet = ImageFont.truetype(FONT_REG, 22)
    f_cta = ImageFont.truetype(FONT_BOLD, 24)
    f_foot = ImageFont.truetype(FONT_MONO, 19)

    # Left: 3 quick bullet highlights
    by = 1296
    for b in pin["bullets"][:3]:
        draw.ellipse([54, by + 9, 64, by + 19], fill=accent)
        draw.text((78, by), b, font=f_bullet, fill=(226, 232, 240))
        by += 36

    # Right: Glowing CTA button
    cta_text = pin["cta"]
    cb = draw.textbbox((0, 0), cta_text, font=f_cta)
    cw_btn = (cb[2] - cb[0]) + 46
    ch_btn = 64
    cx2 = WIDTH - 48
    cx1 = cx2 - cw_btn
    cy1 = 1316
    cy2 = cy1 + ch_btn
    # Outer glow
    draw_rounded_rect(draw, [cx1 - 4, cy1 - 4, cx2 + 4, cy2 + 4], radius=14, outline=(accent[0] // 2, accent[1] // 2, accent[2] // 2), width=3)
    draw_rounded_rect(draw, [cx1, cy1, cx2, cy2], radius=12, fill=accent)
    draw.text((cx1 + 23, cy1 + 16), cta_text, font=f_cta, fill=theme["cta_text"])

    # Footer bar
    draw.line([(48, 1432), (WIDTH - 48, 1432)], fill=(30, 45, 70), width=1)
    footer_text = "GTA6HeistGuide.com • Free Interactive Planner & Radar"
    fb = draw.textbbox((0, 0), footer_text, font=f_foot)
    fw = fb[2] - fb[0]
    draw.text(((WIDTH - fw) // 2, 1450), footer_text, font=f_foot, fill=(148, 163, 184))

    out_path = os.path.join(PINS_DIR, pin["filename"])
    img.save(out_path, "PNG", optimize=True)
    return out_path


def generate_csv():
    # Schedule 3 pins/day (14:00, 18:00, 22:00 UTC) starting tomorrow (2026-11-20) for 6 days
    start_date = datetime(2026, 11, 20)
    slots = ["14:00:00", "18:00:00", "22:00:00"]

    # Interleave 1 pin from each of the 3 categories per day (6 days x 3 = 18 pins)
    maps = [p for p in PINS if p["category"] == "Maps & Vault Blueprints"]
    payouts = [p for p in PINS if p["category"] == "Payout Guides & Calculators"]
    gear = [p for p in PINS if p["category"] == "Gaming Gear & Setup Deals"]

    ordered = []
    for day in range(6):
        ordered.append((day, slots[0], maps[day]))
        ordered.append((day, slots[1], payouts[day]))
        ordered.append((day, slots[2], gear[day]))

    headers = ["Title", "Media URL", "Pinterest board", "Thumbnail", "Description", "Link", "Publish date", "Keywords"]
    with open(CSV_PATH, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(headers)
        for day, slot, pin in ordered:
            assert len(pin["title"]) < 80, f"Title too long ({len(pin['title'])}): {pin['title']}"
            assert len(pin["description"]) < 450, f"Desc too long ({len(pin['description'])}): {pin['description']}"
            pub_dt = (start_date + timedelta(days=day)).strftime("%Y-%m-%d") + f"T{slot}"
            media_url = f"https://www.gta6heistguide.com/pins/{pin['filename']}"
            board = THEMES[pin["category"]]["board"]
            writer.writerow([
                pin["title"],
                media_url,
                board,
                "",
                pin["description"],
                pin["link"],
                pub_dt,
                pin["keywords"],
            ])


if __name__ == "__main__":
    for idx, pin in enumerate(PINS, 1):
        out = generate_pin(pin)
        print(f"[{idx:02d}/18] Generated {out}")
    generate_csv()
    print(f"CSV generated at {CSV_PATH}")
