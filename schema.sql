CREATE TABLE IF NOT EXISTS subscribers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    callsign TEXT NOT NULL,
    platform TEXT,
    role TEXT,
    discord_tag TEXT,
    marketing_opt_in INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS forum_threads (
    id TEXT PRIMARY KEY,
    author TEXT NOT NULL,
    badge TEXT,
    badge_name TEXT,
    avatar TEXT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    tag TEXT,
    votes INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lfg_squads (
    id TEXT PRIMARY KEY,
    callsign TEXT NOT NULL,
    platform TEXT NOT NULL,
    role TEXT NOT NULL,
    target_heist TEXT NOT NULL,
    mic_required TEXT,
    cut_offered TEXT,
    contact_tag TEXT NOT NULL,
    notes TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS dynamic_guides (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL,
    badge TEXT NOT NULL,
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    full_guide_html TEXT NOT NULL,
    source_name TEXT,
    source_url TEXT,
    created_date TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS map_markers (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    region TEXT NOT NULL,
    x INTEGER NOT NULL,
    y INTEGER NOT NULL,
    payout_or_perk TEXT,
    description TEXT NOT NULL,
    link TEXT DEFAULT 'leonida-interactive-map.html',
    status TEXT DEFAULT 'community',
    votes INTEGER DEFAULT 1,
    submitted_by TEXT DEFAULT 'Syndicate Recon',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payout_reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vault_slug TEXT NOT NULL,
    reported_payout INTEGER NOT NULL,
    reported_cooldown_mins INTEGER NOT NULL,
    patch_note TEXT,
    reporter_alias TEXT DEFAULT 'Operative',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Remove pre-launch fabricated gamertag LFG entries so only real verified player submissions live in lfg_squads
DELETE FROM lfg_squads WHERE id IN ('lfg-1', 'lfg-2', 'lfg-3', 'lfg-4');

-- Rebrand pre-seeded forum posts as official Syndicate Tactical Briefings & FTC-compliant Partner Advisories
INSERT OR REPLACE INTO forum_threads (id, author, badge, badge_name, avatar, title, content, tag, votes) VALUES
('thread-1', 'Syndicate Editorial Desk', 'badge-mastermind', 'SYNDICATE TACTICAL BRIEFING • PRE-LAUNCH META', '/assets/avatar-mastermind.png',
 'Leonida Reserve: Subterranean maintenance intake conduit & 4-player stealth split analysis',
 'Pre-launch blueprint analysis for the Northern Pelican Valley & Ambrosia canal border: routing a 4-player squad through the intake conduit bypasses exterior cameras if your Ghost Hacker clears grid 4 within 18 seconds.',
 'StealthMeta', 142),
('thread-2', 'Syndicate Editorial Desk', 'badge-hacker', 'EDITORIAL STRATEGY NOTE', '/assets/avatar-mastermind.png',
 'Sinfrontera Bank keypad frequency patterns & 15-second biometric memory drill',
 'High-security vaults use timed multi-node biometric locks. Practice 5-node and 7-node sequences in our free 15s Vault Hack Trainer before assigning your squad hacker cut.',
 'VaultIntel', 89),
('thread-3', 'Syndicate Editorial Desk', 'badge-wheelman', 'SYNDICATE TACTICAL BRIEFING • PRE-LAUNCH META', '/assets/avatar-mastermind.png',
 'Port Gellhorn Container Terminal: Optimal 3-Player & 4-Player Co-Op Role Breakdown',
 'Recommended Day-1 crew composition for industrial dock scores: pair 1 Crane Decryptor with 1 Heavy Gunner and 1 Canal Speedboat Wheelman at a 25% even split.',
 'CrewRecruit', 64),
('thread-4', 'Syndicate Editorial Desk', 'badge-enforcer', 'EDITORIAL STRATEGY NOTE', '/assets/avatar-mastermind.png',
 'Starlet Superyacht offshore extraction: Scuba Rebreathers vs. Helipad Heat Comparison',
 'Tactical heat model: rooftop helicopters trigger coastal radar sweeps immediately, whereas underwater scuba rebreather exfiltration to the Leonida Keys stays off dispatch radar.',
 'EscapeRoute', 118),
('thread-5', 'Syndicate Connection Advisory', 'badge-mastermind', 'SYNDICATE CONNECTION & LAG ADVISORY', '/assets/avatar-mastermind.png',
 '⚡ [SYNDICATE CONNECTION & LAG ADVISORY] Stop Mid-Heist Disconnects & Cut Packet Loss with ExitLag Low-Ping Routing',
 'Syndicate Advisory: Peer-to-peer multiplayer sessions can expose host IPs to packet flooding, route throttling, and disconnects mid-heist. Route game traffic through ExitLag Low-Ping Multipath Routing (Free Trial at https://www.exitlag.com/refer/10386953) to lock in rock-solid connections. Use coupon code: 10386953.',
 'StealthMeta', 95);

-- Seed official verified Leonida map markers across all 6 confirmed regions
INSERT OR IGNORE INTO map_markers (id, title, category, region, x, y, payout_or_perk, description, link, status, votes, submitted_by) VALUES
('sinfrontera', 'Sinfrontera National Bank', 'vault', 'vice-city', 740, 290, 'Max Payout: $14,500,000', 'Downtown Vice City subterranean biometric vault with Ocean Blvd storm drain extraction.', 'sinfrontera-bank.html', 'verified', 12, 'Syndicate Recon'),
('port-gellhorn', 'Port Gellhorn Container Terminal', 'vault', 'port-gellhorn', 620, 430, 'Max Payout: $8,200,000', 'West coast industrial cargo port. Hack gantry crane manifests and escape via canal interceptors.', 'port-gellhorn.html', 'verified', 9, 'Syndicate Recon'),
('leonida-reserve', 'Leonida State Gold Reserve', 'vault', 'ambrosia', 380, 140, 'Max Payout: $25,000,000', 'Primary federal bullion depository near the Ambrosia corridor. Requires thermal lances and EMP sync.', 'leonida-reserve.html', 'verified', 18, 'Syndicate Recon'),
('yacht', 'Starlet Superyacht Offshore', 'vault', 'leonida-keys', 900, 310, 'Max Payout: $11,800,000', 'Offshore luxury megayacht. Sub-aquatic scuba breach and coral reef rebreather escape.', 'vice-city-yacht-heist.html', 'verified', 11, 'Syndicate Recon'),
('smuggler', 'Grassrivers Cartel Airstrip', 'vault', 'grassrivers', 290, 340, 'Max Payout: $6,500,000 (1.5X: $9,750,000)', 'Clandestine wetlands runway in the Grassrivers basin. Airboat ingress and low-altitude plane exit.', 'everglades-smuggler-run.html', 'verified', 14, 'Syndicate Recon'),
('convoy', 'Ocean Drive Armored Convoy', 'vault', 'vice-city', 810, 360, 'Max Payout: $9,400,000', 'Coastal strip armored transport intercept using dual magnetic EMPs and subway tunnel evasion.', 'ocean-drive-armored-convoy.html', 'verified', 10, 'Syndicate Recon'),
('escape-metro', 'Metro Storm Drain Conduit 01', 'escape', 'vice-city', 710, 320, 'Heat Reduction: 100%', 'Underground drainage tunnel beneath Ocean Blvd blocking cruiser pursuit.', 'escape-routes.html', 'verified', 8, 'Syndicate Recon'),
('safehouse-north', 'North Vice Safehouse Alpha', 'safehouse', 'vice-city', 750, 200, 'Safe Recovery & Trunk Garage', 'Pre-equipped safehouse with underground garage and trunk weapon locker.', 'safehouses-laundering.html', 'verified', 7, 'Syndicate Recon'),
('keys-dock', 'Leonida Keys Smuggler Marina', 'fence', 'leonida-keys', 780, 560, '12% Offshore Laundering Broker', 'Southern archipelago boathouse contact for cleaning marked heist proceeds and staging boats.', 'safehouses-laundering.html', 'verified', 6, 'Syndicate Recon'),
('ambrosia-fence', 'Ambrosia Refinery Bullion Fence', 'fence', 'ambrosia', 520, 330, 'Instant Bullion & Plate Swap Yard', 'Heartland industrial yard for fencing heavy gold bars and swapping vehicle plates.', 'safehouses-laundering.html', 'verified', 5, 'Syndicate Recon'),
('kalaga-outpost', 'Mount Kalaga Scanner Jammer Outpost', 'jammer', 'mount-kalaga', 260, 110, '+15s Vault Alarm Delay Relay', 'Northern mountain relay tower and forestry dirt trails where 5-star choppers lose visual lock.', 'leonida-wanted-system.html', 'verified', 6, 'Syndicate Recon');

CREATE TABLE IF NOT EXISTS affiliate_clicks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    partner TEXT NOT NULL,
    placement TEXT DEFAULT 'general',
    page_path TEXT DEFAULT '/',
    target_url TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS contact_inquiries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    inquiry_type TEXT DEFAULT 'general',
    budget TEXT DEFAULT '',
    message TEXT NOT NULL,
    source_page TEXT DEFAULT '/contact.html',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
