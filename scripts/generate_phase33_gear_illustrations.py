#!/usr/bin/env python3
"""Generate 12 clean studio-grade hardware category illustrations (SVG) for Phase 33.
All assets are original publisher-owned vector illustrations explicitly labeled as
Category Illustrations in the UI (never misrepresented as product photographs).
"""
import os

OUT_DIR = os.path.join("public", "assets", "gear-illustrations")
os.makedirs(OUT_DIR, exist_ok=True)

def wrap_svg(title, accent_bg, body):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" role="img" aria-label="{title}">
  <defs>
    <radialGradient id="studioBg" cx="50%" cy="42%" r="65%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="68%" stop-color="#f1f5f9"/>
      <stop offset="100%" stop-color="{accent_bg}"/>
    </radialGradient>
    <linearGradient id="metalDark" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#334155"/>
      <stop offset="50%" stop-color="#1e293b"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
    <linearGradient id="shellWhite" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#cbd5e1"/>
    </linearGradient>
    <linearGradient id="cyanGlow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="100%" stop-color="#0284c7"/>
    </linearGradient>
    <linearGradient id="pinkGlow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ff2a8d"/>
      <stop offset="100%" stop-color="#be185d"/>
    </linearGradient>
    <linearGradient id="xboxGreen" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#22c55e"/>
      <stop offset="100%" stop-color="#15803d"/>
    </linearGradient>
    <filter id="dropShadow" x="-15%" y="-15%" width="130%" height="140%">
      <feDropShadow dx="0" dy="10" stdDeviation="8" flood-color="#0f172a" flood-opacity="0.18"/>
    </filter>
  </defs>
  <rect width="400" height="300" fill="url(#studioBg)"/>
  <ellipse cx="200" cy="252" rx="128" ry="16" fill="#0f172a" opacity="0.10"/>
  {body}
</svg>
'''

SVGS = {
    "ps5-charging-dock.svg": wrap_svg(
        "PS5 Twin Controller Charging Dock Category Illustration",
        "#e0f2fe",
        '''
  <g filter="url(#dropShadow)">
    <!-- Charging Dock Base -->
    <path d="M96 196 L304 196 L288 236 L112 236 Z" fill="url(#metalDark)" stroke="#475569" stroke-width="2"/>
    <rect x="108" y="182" width="184" height="22" rx="10" fill="url(#shellWhite)" stroke="#94a3b8" stroke-width="2"/>
    <!-- LED Charging Strip -->
    <rect x="165" y="212" width="70" height="5" rx="2.5" fill="url(#cyanGlow)"/>
    <!-- Left Cradle Controller Silhouette -->
    <g transform="translate(115, 78)">
      <path d="M22 40 C8 40 2 70 8 98 C12 114 26 112 34 94 L46 76 L92 76 L104 94 C112 112 126 114 130 98 C136 70 130 40 116 40 L94 34 L44 34 Z" fill="url(#shellWhite)" stroke="#64748b" stroke-width="2"/>
      <rect x="48" y="37" width="42" height="20" rx="4" fill="#1e293b"/>
      <circle cx="52" cy="68" r="9" fill="#0f172a" stroke="#38bdf8" stroke-width="2"/>
      <circle cx="86" cy="68" r="9" fill="#0f172a" stroke="#38bdf8" stroke-width="2"/>
      <rect x="24" y="48" width="14" height="5" rx="2" fill="#475569"/>
      <rect x="28.5" y="43.5" width="5" height="14" rx="2" fill="#475569"/>
      <circle cx="107" cy="46" r="3" fill="#38bdf8"/>
      <circle cx="115" cy="52" r="3" fill="#ff2a8d"/>
      <circle cx="107" cy="58" r="3" fill="#22c55e"/>
      <circle cx="99" cy="52" r="3" fill="#a855f7"/>
    </g>
    <!-- Second Docked Controller Outline Behind -->
    <g transform="translate(148, 42)" opacity="0.92">
      <path d="M22 36 C10 36 6 60 11 82 C15 95 27 93 33 78 L44 64 L84 64 L95 78 C101 93 113 95 117 82 C122 60 118 36 106 36 L86 30 L42 30 Z" fill="url(#shellWhite)" stroke="#94a3b8" stroke-width="2"/>
      <rect x="46" y="34" width="36" height="16" rx="3" fill="#334155"/>
      <circle cx="50" cy="58" r="7" fill="#1e293b"/>
      <circle cx="78" cy="58" r="7" fill="#1e293b"/>
    </g>
    <!-- Dual Charge Badge -->
    <rect x="292" y="44" width="76" height="26" rx="13" fill="#0284c7"/>
    <text x="330" y="61" text-anchor="middle" font-family="system-ui,sans-serif" font-size="11" font-weight="800" fill="#ffffff">2x DOCK</text>
  </g>
'''
    ),
    "xbox-charging-dock.svg": wrap_svg(
        "Xbox Series X|S Duo Controller Charging Station Category Illustration",
        "#dcfce7",
        '''
  <g filter="url(#dropShadow)">
    <!-- White Matte Base -->
    <rect x="92" y="186" width="216" height="44" rx="12" fill="url(#shellWhite)" stroke="#94a3b8" stroke-width="2"/>
    <rect x="112" y="218" width="176" height="8" rx="4" fill="#1e293b"/>
    <circle cx="150" cy="204" r="5" fill="#22c55e"/>
    <circle cx="250" cy="204" r="5" fill="#22c55e"/>
    <!-- Left Xbox Controller -->
    <g transform="translate(96, 68)">
      <path d="M24 38 C8 42 4 74 10 100 C15 114 28 112 36 94 L48 78 L92 78 L104 94 C112 112 125 114 130 100 C136 74 132 42 116 38 L94 32 L46 32 Z" fill="url(#metalDark)" stroke="#475569" stroke-width="2"/>
      <circle cx="70" cy="46" r="8" fill="#f8fafc"/>
      <path d="M66 42 L74 50 M74 42 L66 50" stroke="#15803d" stroke-width="2.2" stroke-linecap="round"/>
      <circle cx="38" cy="54" r="9" fill="#0f172a" stroke="#22c55e" stroke-width="2"/>
      <circle cx="88" cy="68" r="9" fill="#0f172a" stroke="#64748b" stroke-width="2"/>
      <circle cx="52" cy="70" r="7" fill="#334155"/>
      <circle cx="106" cy="48" r="3" fill="#eab308"/>
      <circle cx="114" cy="55" r="3" fill="#ef4444"/>
      <circle cx="106" cy="62" r="3" fill="#22c55e"/>
      <circle cx="98" cy="55" r="3" fill="#3b82f6"/>
    </g>
    <!-- Right Rechargeable Battery Pack Icon -->
    <g transform="translate(242, 84)">
      <rect x="0" y="10" width="54" height="82" rx="10" fill="url(#metalDark)" stroke="#22c55e" stroke-width="2.5"/>
      <rect x="16" y="2" width="22" height="10" rx="3" fill="#22c55e"/>
      <path d="M30 30 L18 54 L28 54 L24 76 L38 48 L28 48 Z" fill="#22c55e"/>
    </g>
    <rect x="274" y="40" width="96" height="26" rx="13" fill="url(#xboxGreen)"/>
    <text x="322" y="57" text-anchor="middle" font-family="system-ui,sans-serif" font-size="11" font-weight="800" fill="#ffffff">XBOX DUO</text>
  </g>
'''
    ),
    "thumbsticks-heist.svg": wrap_svg(
        "Heist Edition Pink and Blue Performance Thumbsticks Category Illustration",
        "#fce7f3",
        '''
  <g filter="url(#dropShadow)">
    <!-- Left Stick (Mid-Rise Cyan/Blue) -->
    <g transform="translate(86, 78)">
      <ellipse cx="64" cy="126" rx="44" ry="18" fill="#1e293b"/>
      <rect x="44" y="84" width="40" height="44" rx="6" fill="#0f172a"/>
      <ellipse cx="64" cy="74" rx="54" ry="44" fill="url(#cyanGlow)" stroke="#0369a1" stroke-width="3"/>
      <ellipse cx="64" cy="74" rx="40" ry="31" fill="none" stroke="#e0f2fe" stroke-width="2.5" stroke-dasharray="6 4"/>
      <circle cx="64" cy="74" r="16" fill="#0284c7" stroke="#ffffff" stroke-width="2"/>
      <path d="M52 74 L76 74 M64 62 L64 86" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round"/>
    </g>
    <!-- Right Stick (High-Rise Neon Pink) -->
    <g transform="translate(198, 56)">
      <ellipse cx="68" cy="148" rx="46" ry="18" fill="#1e293b"/>
      <rect x="48" y="88" width="40" height="62" rx="6" fill="#0f172a"/>
      <ellipse cx="68" cy="76" rx="58" ry="46" fill="url(#pinkGlow)" stroke="#9d174d" stroke-width="3"/>
      <ellipse cx="68" cy="76" rx="43" ry="33" fill="none" stroke="#fbcfe8" stroke-width="2.5" stroke-dasharray="6 4"/>
      <circle cx="68" cy="76" r="18" fill="#db2777" stroke="#ffffff" stroke-width="2"/>
      <path d="M56 76 L80 76 M68 64 L68 88" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round"/>
    </g>
    <rect x="134" y="24" width="132" height="26" rx="13" fill="#0f172a"/>
    <text x="200" y="41" text-anchor="middle" font-family="system-ui,sans-serif" font-size="11" font-weight="800" fill="#f472b6">HEIST EDITION</text>
  </g>
'''
    ),
    "thumbsticks-galaxy.svg": wrap_svg(
        "Galaxy Black Performance Thumbsticks Category Illustration",
        "#ede9fe",
        '''
  <g filter="url(#dropShadow)">
    <!-- Left Mid-Rise Galaxy Black -->
    <g transform="translate(88, 82)">
      <ellipse cx="62" cy="122" rx="42" ry="16" fill="#334155"/>
      <rect x="44" y="84" width="36" height="40" rx="6" fill="#0f172a"/>
      <ellipse cx="62" cy="72" rx="52" ry="42" fill="url(#metalDark)" stroke="#6366f1" stroke-width="3"/>
      <path d="M36 72 C46 52 78 52 88 72 C78 92 46 92 36 72 Z" fill="none" stroke="#a5b4fc" stroke-width="2.2"/>
      <circle cx="62" cy="72" r="12" fill="#4f46e5"/>
    </g>
    <!-- Right High-Rise Galaxy Black -->
    <g transform="translate(200, 56)">
      <ellipse cx="66" cy="148" rx="44" ry="16" fill="#334155"/>
      <rect x="48" y="86" width="36" height="64" rx="6" fill="#0f172a"/>
      <ellipse cx="66" cy="74" rx="56" ry="44" fill="url(#metalDark)" stroke="#818cf8" stroke-width="3"/>
      <path d="M38 74 C50 52 82 52 94 74 C82 96 50 96 38 74 Z" fill="none" stroke="#c7d2fe" stroke-width="2.2"/>
      <circle cx="66" cy="74" r="14" fill="#6366f1"/>
    </g>
    <rect x="132" y="24" width="136" height="26" rx="13" fill="#312e81"/>
    <text x="200" y="41" text-anchor="middle" font-family="system-ui,sans-serif" font-size="11" font-weight="800" fill="#e0e7ff">HIGH + MID RISE</text>
  </g>
'''
    ),
    "headset-multiplatform.svg": wrap_svg(
        "Multiplatform Wired Gaming Headset Category Illustration",
        "#e0f2fe",
        '''
  <g filter="url(#dropShadow)">
    <!-- Headband -->
    <path d="M116 154 C116 74 148 48 200 48 C252 48 284 74 284 154" fill="none" stroke="url(#metalDark)" stroke-width="20" stroke-linecap="round"/>
    <path d="M132 104 C146 66 170 54 200 54 C230 54 254 66 268 104" fill="none" stroke="#38bdf8" stroke-width="4" stroke-linecap="round"/>
    <!-- Left Earcup -->
    <rect x="92" y="136" width="44" height="84" rx="22" fill="url(#metalDark)" stroke="#475569" stroke-width="2.5"/>
    <rect x="122" y="144" width="16" height="68" rx="8" fill="#0f172a"/>
    <ellipse cx="109" cy="178" rx="9" ry="22" fill="#0284c7" opacity="0.85"/>
    <!-- Right Earcup -->
    <rect x="264" y="136" width="44" height="84" rx="22" fill="url(#metalDark)" stroke="#475569" stroke-width="2.5"/>
    <rect x="262" y="144" width="16" height="68" rx="8" fill="#0f172a"/>
    <ellipse cx="291" cy="178" rx="9" ry="22" fill="#0284c7" opacity="0.85"/>
    <!-- Flip-to-Mute Boom Mic -->
    <path d="M108 204 Q118 242 178 240" fill="none" stroke="#334155" stroke-width="7" stroke-linecap="round"/>
    <ellipse cx="182" cy="240" rx="12" ry="7" fill="#0f172a" stroke="#38bdf8" stroke-width="2"/>
    <!-- 3.5mm Badge -->
    <rect x="278" y="34" width="94" height="26" rx="13" fill="#0f172a"/>
    <text x="325" y="51" text-anchor="middle" font-family="system-ui,sans-serif" font-size="11" font-weight="800" fill="#38bdf8">3.5MM MULTI</text>
  </g>
'''
    ),
    "headset-playstation.svg": wrap_svg(
        "PlayStation White Wired Gaming Headset Category Illustration",
        "#dbeafe",
        '''
  <g filter="url(#dropShadow)">
    <!-- White Headband -->
    <path d="M118 154 C118 76 150 50 200 50 C250 50 282 76 282 154" fill="none" stroke="url(#shellWhite)" stroke-width="20" stroke-linecap="round"/>
    <path d="M118 154 C118 76 150 50 200 50 C250 50 282 76 282 154" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round"/>
    <path d="M142 74 C160 58 240 58 258 74" fill="none" stroke="#2563eb" stroke-width="5" stroke-linecap="round"/>
    <!-- Left Earcup -->
    <rect x="94" y="138" width="44" height="82" rx="20" fill="url(#shellWhite)" stroke="#94a3b8" stroke-width="2"/>
    <rect x="124" y="146" width="16" height="66" rx="8" fill="#1e293b"/>
    <rect x="103" y="160" width="12" height="38" rx="6" fill="#2563eb"/>
    <!-- Right Earcup -->
    <rect x="262" y="138" width="44" height="82" rx="20" fill="url(#shellWhite)" stroke="#94a3b8" stroke-width="2"/>
    <rect x="260" y="146" width="16" height="66" rx="8" fill="#1e293b"/>
    <rect x="285" y="160" width="12" height="38" rx="6" fill="#2563eb"/>
    <!-- Swivel-to-Mute Mic -->
    <path d="M110 204 Q124 238 182 236" fill="none" stroke="#475569" stroke-width="7" stroke-linecap="round"/>
    <ellipse cx="186" cy="236" rx="11" ry="7" fill="#1e293b" stroke="#2563eb" stroke-width="2"/>
    <rect x="282" y="34" width="90" height="26" rx="13" fill="#1d4ed8"/>
    <text x="327" y="51" text-anchor="middle" font-family="system-ui,sans-serif" font-size="11" font-weight="800" fill="#ffffff">PS5 / PS4</text>
  </g>
'''
    ),
    "ps5-nvme-1tb.svg": wrap_svg(
        "1TB PS5 NVMe M.2 SSD with Integrated Heatsink Category Illustration",
        "#dcfce7",
        '''
  <g filter="url(#dropShadow)">
    <!-- M.2 Heatsink Body -->
    <g transform="translate(48, 100)">
      <!-- Gold M.2 Connector Pins -->
      <rect x="0" y="22" width="24" height="56" rx="3" fill="#15803d"/>
      <rect x="2" y="26" width="16" height="6" fill="#facc15"/>
      <rect x="2" y="36" width="16" height="6" fill="#facc15"/>
      <rect x="2" y="46" width="16" height="6" fill="#facc15"/>
      <rect x="2" y="60" width="16" height="6" fill="#facc15"/>
      <rect x="2" y="70" width="16" height="6" fill="#facc15"/>
      <!-- Heatsink Finned Chassis -->
      <rect x="22" y="10" width="282" height="80" rx="8" fill="url(#metalDark)" stroke="#475569" stroke-width="2.5"/>
      <line x1="36" y1="24" x2="290" y2="24" stroke="#475569" stroke-width="3"/>
      <line x1="36" y1="36" x2="290" y2="36" stroke="#475569" stroke-width="3"/>
      <line x1="36" y1="64" x2="290" y2="64" stroke="#475569" stroke-width="3"/>
      <line x1="36" y1="76" x2="290" y2="76" stroke="#475569" stroke-width="3"/>
      <rect x="52" y="38" width="222" height="24" rx="4" fill="#0f172a" stroke="#22c55e" stroke-width="1.5"/>
      <text x="163" y="54" text-anchor="middle" font-family="monospace" font-size="13" font-weight="800" fill="#4ade80">PCIe 4.0 NVMe · 1TB + HEATSINK</text>
      <!-- Mounting Notch -->
      <circle cx="304" cy="50" r="7" fill="#f1f5f9"/>
    </g>
    <rect x="130" y="42" width="140" height="26" rx="13" fill="#15803d"/>
    <text x="200" y="59" text-anchor="middle" font-family="system-ui,sans-serif" font-size="11" font-weight="800" fill="#ffffff">PS5 M.2 2280 READY</text>
  </g>
'''
    ),
    "ps5-nvme-2tb.svg": wrap_svg(
        "2TB Officially Licensed PS5 NVMe M.2 SSD with Heatsink Category Illustration",
        "#e0f2fe",
        '''
  <g filter="url(#dropShadow)">
    <g transform="translate(48, 100)">
      <rect x="0" y="22" width="24" height="56" rx="3" fill="#0f172a"/>
      <rect x="2" y="26" width="16" height="6" fill="#fbbf24"/>
      <rect x="2" y="36" width="16" height="6" fill="#fbbf24"/>
      <rect x="2" y="46" width="16" height="6" fill="#fbbf24"/>
      <rect x="2" y="60" width="16" height="6" fill="#fbbf24"/>
      <rect x="2" y="70" width="16" height="6" fill="#fbbf24"/>
      <rect x="22" y="8" width="282" height="84" rx="8" fill="#0f172a" stroke="#0284c7" stroke-width="2.5"/>
      <line x1="36" y1="22" x2="290" y2="22" stroke="#1e293b" stroke-width="4"/>
      <line x1="36" y1="78" x2="290" y2="78" stroke="#1e293b" stroke-width="4"/>
      <rect x="44" y="34" width="238" height="32" rx="5" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
      <text x="163" y="54" text-anchor="middle" font-family="monospace" font-size="13" font-weight="800" fill="#38bdf8">PS5 LICENSED · 2TB HEATSINK</text>
      <circle cx="304" cy="50" r="7" fill="#f1f5f9"/>
    </g>
    <rect x="122" y="42" width="156" height="26" rx="13" fill="#0369a1"/>
    <text x="200" y="59" text-anchor="middle" font-family="system-ui,sans-serif" font-size="11" font-weight="800" fill="#ffffff">7,300 MB/S GEN4 SSD</text>
  </g>
'''
    ),
    "headset-stand.svg": wrap_svg(
        "Aluminum Desktop Headphone Stand Category Illustration",
        "#e2e8f0",
        '''
  <g filter="url(#dropShadow)">
    <!-- Weighted Base -->
    <ellipse cx="200" cy="236" rx="74" ry="16" fill="url(#metalDark)" stroke="#475569" stroke-width="2"/>
    <ellipse cx="200" cy="232" rx="64" ry="11" fill="#334155"/>
    <!-- Anodized Aluminum Pole -->
    <rect x="192" y="74" width="16" height="158" rx="4" fill="url(#shellWhite)" stroke="#64748b" stroke-width="1.5"/>
    <!-- Curved TPU Headband Rest -->
    <path d="M150 82 Q200 48 250 82 L242 96 Q200 68 158 96 Z" fill="url(#metalDark)" stroke="#0284c7" stroke-width="2"/>
    <!-- Resting Headset Outline -->
    <path d="M148 128 C148 74 170 62 200 62 C230 62 252 74 252 128" fill="none" stroke="#38bdf8" stroke-width="5" stroke-dasharray="6 4" opacity="0.8"/>
    <rect x="134" y="122" width="24" height="52" rx="12" fill="#1e293b" opacity="0.32"/>
    <rect x="242" y="122" width="24" height="52" rx="12" fill="#1e293b" opacity="0.32"/>
    <rect x="274" y="34" width="98" height="26" rx="13" fill="#334155"/>
    <text x="323" y="51" text-anchor="middle" font-family="system-ui,sans-serif" font-size="11" font-weight="800" fill="#f8fafc">DESK STAND</text>
  </g>
'''
    ),
    "cable-clips.svg": wrap_svg(
        "16-Pack Desktop Adhesive Cable Clips Category Illustration",
        "#dcfce7",
        '''
  <g filter="url(#dropShadow)">
    <!-- Desk Surface Strip -->
    <rect x="54" y="186" width="292" height="26" rx="6" fill="#cbd5e1" stroke="#94a3b8" stroke-width="1.5"/>
    <!-- Multi-Slot Silicone Cable Clips -->
    <g transform="translate(80, 128)">
      <!-- Clip 1 (Single) -->
      <rect x="0" y="24" width="44" height="34" rx="12" fill="url(#metalDark)"/>
      <circle cx="22" cy="34" r="7" fill="#38bdf8"/>
      <path d="M22 34 L22 -24" stroke="#0284c7" stroke-width="5" stroke-linecap="round"/>
      <!-- Clip 2 (Triple) -->
      <rect x="64" y="18" width="96" height="40" rx="12" fill="url(#metalDark)"/>
      <circle cx="88" cy="30" r="7" fill="#22c55e"/>
      <circle cx="112" cy="30" r="7" fill="#f43f5e"/>
      <circle cx="136" cy="30" r="7" fill="#f59e0b"/>
      <path d="M88 30 C88 0 78 -10 78 -34" fill="none" stroke="#16a34a" stroke-width="5" stroke-linecap="round"/>
      <path d="M112 30 L112 -38" fill="none" stroke="#e11d48" stroke-width="5" stroke-linecap="round"/>
      <path d="M136 30 C136 0 148 -10 148 -34" fill="none" stroke="#d97706" stroke-width="5" stroke-linecap="round"/>
      <!-- Clip 3 (Double) -->
      <rect x="180" y="22" width="64" height="36" rx="12" fill="url(#metalDark)"/>
      <circle cx="200" cy="34" r="7" fill="#a855f7"/>
      <circle cx="224" cy="34" r="7" fill="#38bdf8"/>
      <path d="M200 34 L200 -28" stroke="#9333ea" stroke-width="5" stroke-linecap="round"/>
      <path d="M224 34 L224 -20" stroke="#0284c7" stroke-width="5" stroke-linecap="round"/>
    </g>
    <rect x="134" y="34" width="132" height="26" rx="13" fill="#15803d"/>
    <text x="200" y="51" text-anchor="middle" font-family="system-ui,sans-serif" font-size="11" font-weight="800" fill="#ffffff">16-PACK CLIPS</text>
  </g>
'''
    ),
    "ps-icons-light.svg": wrap_svg(
        "PlayStation Controller Icons Desk Light Category Illustration",
        "#e0e7ff",
        '''
  <g filter="url(#dropShadow)">
    <!-- Dark Ambient Glow Halo Behind Light -->
    <rect x="52" y="96" width="296" height="124" rx="18" fill="#0f172a" stroke="#334155" stroke-width="2"/>
    <!-- Light Bar Base -->
    <rect x="74" y="182" width="252" height="22" rx="6" fill="#1e293b" stroke="#475569" stroke-width="2"/>
    <!-- Glowing Controller Icons -->
    <!-- Triangle (Green) -->
    <polygon points="116,120 96,158 136,158" fill="none" stroke="#22c55e" stroke-width="7" stroke-linejoin="round"/>
    <!-- Circle (Red/Pink) -->
    <circle cx="172" cy="140" r="19" fill="none" stroke="#f43f5e" stroke-width="7"/>
    <!-- Cross (Blue) -->
    <path d="M214 123 L244 157 M244 123 L214 157" stroke="#38bdf8" stroke-width="7" stroke-linecap="round"/>
    <!-- Square (Pink/Violet) -->
    <rect x="268" y="122" width="34" height="34" rx="3" fill="none" stroke="#e879f9" stroke-width="7"/>
    <rect x="122" y="38" width="156" height="26" rx="13" fill="#4f46e5"/>
    <text x="200" y="55" text-anchor="middle" font-family="system-ui,sans-serif" font-size="11" font-weight="800" fill="#ffffff">3-MODE DESK LIGHT</text>
  </g>
'''
    ),
    "controller-holder-figure.svg": wrap_svg(
        "Novelty Gaming Controller and Phone Holder Stand Category Illustration",
        "#fef3c7",
        '''
  <g filter="url(#dropShadow)">
    <!-- Circular Display Pedestal -->
    <ellipse cx="200" cy="236" rx="76" ry="18" fill="url(#metalDark)" stroke="#f59e0b" stroke-width="2.5"/>
    <ellipse cx="200" cy="230" rx="62" ry="12" fill="#334155"/>
    <!-- Stylized Figure Silhouette -->
    <rect x="166" y="122" width="68" height="106" rx="20" fill="url(#metalDark)" stroke="#475569" stroke-width="2"/>
    <circle cx="200" cy="92" r="32" fill="#334155" stroke="#f59e0b" stroke-width="2.5"/>
    <circle cx="189" cy="88" r="5" fill="#fbbf24"/>
    <circle cx="211" cy="88" r="5" fill="#fbbf24"/>
    <!-- Outstretched Arms Holding Gamepad -->
    <path d="M166 150 L132 162 L144 176 L172 168 Z" fill="#475569"/>
    <path d="M234 150 L268 162 L256 176 L228 168 Z" fill="#475569"/>
    <!-- Cradle Gamepad -->
    <rect x="148" y="148" width="104" height="40" rx="18" fill="url(#shellWhite)" stroke="#0f172a" stroke-width="2.5"/>
    <circle cx="176" cy="168" r="7" fill="#0f172a"/>
    <circle cx="224" cy="168" r="7" fill="#0f172a"/>
    <rect x="126" y="28" width="148" height="26" rx="13" fill="#d97706"/>
    <text x="200" y="45" text-anchor="middle" font-family="system-ui,sans-serif" font-size="11" font-weight="800" fill="#ffffff">CONTROLLER STAND</text>
  </g>
'''
    ),
}

for fname, content in SVGS.items():
    path = os.path.join(OUT_DIR, fname)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Wrote {path} ({len(content)} bytes)")
print(f"Generated {len(SVGS)} studio hardware category illustrations.")
