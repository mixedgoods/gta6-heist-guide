#!/usr/bin/env python3
"""
Builds verified starter JSON databases (data/properties.json, data/animals.json,
mirrored to public/data/) and GTABase-style interactive HTML pages
(public/properties.html, public/animals.html) with search, category/region filters,
localStorage trackers, official Rockstar region banners, and JSON-LD SEO schema.
"""
import os
import json

ROOT = r"C:\Users\Shawn\Desktop\gta6heistguide"
DATA_DIR = os.path.join(ROOT, "data")
PUB_DATA_DIR = os.path.join(ROOT, "public", "data")
PUB_DIR = os.path.join(ROOT, "public")
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(PUB_DATA_DIR, exist_ok=True)

PROPERTIES = [
    # STORY SAFEHOUSES (4 total — houses cannot be bought in story mode)
    {"id": "sh-jasons-house", "name": "Jason's House (Key Lento)", "category": "Story Safehouses", "region": "Leonida Keys", "chapter": "Chapter 1", "cost": "Story Unlocked", "status": "Active", "features": "Floorboard cash stash, wardrobe, sleep save, Ultimate Edition Enduro & Kayak spawn", "notes": "Mariana County starter safehouse. Houses cannot be purchased in GTA 6 Story Mode."},
    {"id": "sh-ch2-motel", "name": "Chapter 2 Motel Base", "category": "Story Safehouses", "region": "Port Gellhorn", "chapter": "Chapter 2", "cost": "Story Unlocked", "status": "Missable / Closes After 'Checking Out'", "features": "Bed save, trunk staging, proximity to Port Gellhorn pawn shops & Moses", "notes": "WARNING: Permanently closes after completing the mission 'Checking Out'. Clear your stash first."},
    {"id": "sh-vc-safehouse-3", "name": "Vice City Story Safehouse #3", "category": "Story Safehouses", "region": "Vice City", "chapter": "Chapter 3", "cost": "Story Unlocked", "status": "Active", "features": "Central Vice City base, wardrobe, weapon locker, fast access to jewelry & bank targets", "notes": "Unlocks automatically through Chapter 3 story progression."},
    {"id": "sh-vc-safehouse-4", "name": "Vice City Story Safehouse #4", "category": "Story Safehouses", "region": "Vice City", "chapter": "Chapter 4", "cost": "Story Unlocked", "status": "Active", "features": "High-end endgame safehouse, full gun cabinet, planning board, garage link", "notes": "Final story-unlocked safehouse in Vice City chapters."},

    # GARAGES (Ultimate Edition + 8 Purchasable + 4 Story-Unlocked)
    {"id": "gar-paradise", "name": "Paradise Garage (Watson Bay)", "category": "Garages", "region": "Vice City", "chapter": "Ultimate Edition", "cost": "Included (Ultimate Edition)", "status": "Ultimate Edition", "features": "Built-in gun cabinet, multi-vehicle storage, rapid getaway staging", "notes": "Bonus Watson Bay garage unlocked immediately for Ultimate Edition owners."},
    {"id": "gar-purch-1", "name": "Vice Beach Strip Garage", "category": "Garages", "region": "Vice City", "chapter": "Purchasable #1 of 8", "cost": "Purchasable", "status": "Purchasable", "features": "Multi-car storage, quick oceanfront getaway swap", "notes": "One of 8 purchasable garages across Leonida."},
    {"id": "gar-purch-2", "name": "Little Cuba Lockup Garage", "category": "Garages", "region": "Vice City", "chapter": "Purchasable #2 of 8", "cost": "Purchasable", "status": "Purchasable", "features": "Vehicle storage near Yasmani's jewelry fence", "notes": "Ideal staging garage for Chapter 3 jewelry & bank runs."},
    {"id": "gar-purch-3", "name": "Downtown Vice Parking Bay", "category": "Garages", "region": "Vice City", "chapter": "Purchasable #3 of 8", "cost": "Purchasable", "status": "Purchasable", "features": "Underground access for losing 4-star VCPD heat", "notes": "Great disguise/trunk swap point for Large Bank Vaults."},
    {"id": "gar-purch-4", "name": "Port Gellhorn Strip-Mall Garage", "category": "Garages", "region": "Port Gellhorn", "chapter": "Purchasable #4 of 8", "cost": "Purchasable", "status": "Purchasable", "features": "Vehicle storage close to Moses's car fence & pawn shops", "notes": "Convenient for storing untracked cars and duffel-bag haulers."},
    {"id": "gar-purch-5", "name": "Port Gellhorn Industrial Bay", "category": "Garages", "region": "Port Gellhorn", "chapter": "Purchasable #5 of 8", "cost": "Purchasable", "status": "Purchasable", "features": "Heavy SUV & armored truck staging", "notes": "Positioned near western highway corridors."},
    {"id": "gar-purch-6", "name": "Ambrosia Freight Yard Garage", "category": "Garages", "region": "Ambrosia", "chapter": "Purchasable #6 of 8", "cost": "Purchasable", "status": "Purchasable", "features": "Industrial storage near gang ops & highway armored trucks", "notes": "Purchasable garage in Leonida's industrial heartland."},
    {"id": "gar-purch-7", "name": "Leonida Keys Boatyard Garage", "category": "Garages", "region": "Leonida Keys", "chapter": "Purchasable #7 of 8", "cost": "Purchasable", "status": "Purchasable", "features": "Coastal vehicle & water-access staging", "notes": "Quick escape access along the Keys causeway."},
    {"id": "gar-purch-8", "name": "Mount Kalaga Trailhead Garage", "category": "Garages", "region": "Mount Kalaga National Park", "chapter": "Purchasable #8 of 8", "cost": "Purchasable", "status": "Purchasable", "features": "Off-road 4x4 & hunting rig storage", "notes": "Northern Leonida staging point for wildlife & getaway cooling."},
    {"id": "gar-story-1", "name": "Key Lento Safehouse Drive & Shed", "category": "Garages", "region": "Leonida Keys", "chapter": "Story Garage #1 of 4", "cost": "Story Unlocked", "status": "Story Unlocked", "features": "Starter vehicle parking at Jason's House", "notes": "1 of 4 story-unlocked garages."},
    {"id": "gar-story-2", "name": "Port Gellhorn Motel Parking Lot", "category": "Garages", "region": "Port Gellhorn", "chapter": "Story Garage #2 of 4", "cost": "Story Unlocked", "status": "Story Unlocked", "features": "Chapter 2 story vehicle bay", "notes": "2 of 4 story-unlocked garages."},
    {"id": "gar-story-3", "name": "Vice City Chapter 3 Safehouse Garage", "category": "Garages", "region": "Vice City", "chapter": "Story Garage #3 of 4", "cost": "Story Unlocked", "status": "Story Unlocked", "features": "Chapter 3 heist prep vehicle storage", "notes": "3 of 4 story-unlocked garages."},
    {"id": "gar-story-4", "name": "Vice City Chapter 4 Endgame Garage", "category": "Garages", "region": "Vice City", "chapter": "Story Garage #4 of 4", "cost": "Story Unlocked", "status": "Story Unlocked", "features": "Multi-slot endgame getaway garage", "notes": "4 of 4 story-unlocked garages."},

    # FENCES & MONEY SAFES (7 Fences + BuckMe Family Savings)
    {"id": "fence-moses", "name": "Moses (Untracked Car Fence)", "category": "Fences & Money Safes", "region": "Port Gellhorn", "chapter": "Chapter 2", "cost": "Fence #1 of 7", "status": "Active", "features": "Buys untracked stolen cars for $1,000–$2,000 each", "notes": "Best reliable early-to-mid-game car cash loop in Port Gellhorn."},
    {"id": "fence-randy", "name": "Randy (Valuables & Pawn Fence)", "category": "Fences & Money Safes", "region": "Port Gellhorn", "chapter": "Chapter 2", "cost": "Fence #2 of 7", "status": "Active", "features": "Buys stolen watches, electronics, and pawn shop duffel loot", "notes": "Key buyer after unlocking Pawn Shops in 'Coffee Break'."},
    {"id": "fence-donnie", "name": "Donnie's Trailer Fence", "category": "Fences & Money Safes", "region": "Leonida Keys", "chapter": "Chapter 1", "cost": "Fence #3 of 7", "status": "Missable / Closes After 'Swamped'", "features": "Early Chapter 1 stolen goods & contraband buyer", "notes": "WARNING: Closes permanently after completing the mission 'Swamped'."},
    {"id": "fence-brians-lockup", "name": "Brian's Lockup (Keypad Code: 7700)", "category": "Fences & Money Safes", "region": "Leonida Keys", "chapter": "Chapter 1+", "cost": "Fence #4 of 7", "status": "Verified Code: 7700", "features": "Buys drugs, jewelry, and marked bills; keypad safe code 7700", "notes": "One of the highest-utility fences in Leonida—accepts dye-stained/marked bills."},
    {"id": "fence-yasmani", "name": "Yasmani's Jewelry Fence", "category": "Fences & Money Safes", "region": "Vice City", "chapter": "Chapter 3", "cost": "Fence #5 of 7", "status": "Active", "features": "Top payout buyer for stolen diamonds & luxury boutique loot (low cut)", "notes": "Unlocks after 'Yasmani's Jewelry Jobs' in Chapter 3."},
    {"id": "fence-ambrosia", "name": "Ambrosia Industrial Contraband Fence", "category": "Fences & Money Safes", "region": "Ambrosia", "chapter": "Chapter 3–4", "cost": "Fence #6 of 7", "status": "Active", "features": "Liquidates gang hideout crates & heavy contraband", "notes": "Ideal drop-off after clearing Ambrosia gang hideouts."},
    {"id": "fence-grassrivers", "name": "Grassrivers Wetlands Smuggler Fence", "category": "Fences & Money Safes", "region": "Grassrivers", "chapter": "Chapter 3–4", "cost": "Fence #7 of 7", "status": "Active", "features": "Off-grid airboat dock buyer for illicit cargo & cartel goods", "notes": "Low police presence along the Grassrivers channels."},
    {"id": "safe-buckme", "name": "BuckMe Family Savings ($5,000 Ch. 1 Goal)", "category": "Fences & Money Safes", "region": "Leonida Keys", "chapter": "Chapter 1 Critical", "cost": "$5,000 Goal", "status": "Protect Before 'Tourist Trap'", "features": "Protects savings from Chapter 1 -> Chapter 2 pocket cash wipe; $20,000 free-roam pocket cap", "notes": "Deposit your $5,000 Family Savings into BuckMe before triggering 'Tourist Trap' or loose pocket cash is wiped."}
]

ANIMALS = [
    # LAND & PREDATORS
    {"id": "an-alligator", "name": "Alligator", "category": "Land & Predators", "region": "Grassrivers", "danger": "Hostile Predator", "notes": "Common in Grassrivers swamps, waterways, and muddy banks. Lethal ambush bite in shallow water."},
    {"id": "an-panther", "name": "Florida Panther / Cougar", "category": "Land & Predators", "region": "Mount Kalaga National Park", "danger": "Apex Predator", "notes": "Stalks dense pine trails and ridges in Mount Kalaga National Park, especially at dusk and night."},
    {"id": "an-black-bear", "name": "Black Bear", "category": "Land & Predators", "region": "Mount Kalaga National Park", "danger": "Hostile Predator", "notes": "Roams Mount Kalaga forests and riverbanks; charges if provoked or cornered."},
    {"id": "an-bobcat", "name": "Bobcat", "category": "Land & Predators", "region": "Mount Kalaga National Park", "danger": "Cautious Predator", "notes": "Agile wildcat spotted in rocky brush across Mount Kalaga and rural Ambrosia."},
    {"id": "an-whitetail-buck", "name": "Whitetail Buck", "category": "Land & Predators", "region": "Mount Kalaga National Park", "danger": "Docile", "notes": "Antlered male deer grazing in Mount Kalaga meadows; flees quickly when spooked."},
    {"id": "an-whitetail-doe", "name": "Whitetail Doe", "category": "Land & Predators", "region": "Mount Kalaga National Park", "danger": "Docile", "notes": "Found in small herds alongside Whitetail Bucks in northern Leonida."},
    {"id": "an-wild-boar", "name": "Wild Boar", "category": "Land & Predators", "region": "Mount Kalaga National Park", "danger": "Aggressive", "notes": "Spotted across Mount Kalaga National Park & Leonida Keys brush; can charge on foot."},
    {"id": "an-armadillo", "name": "Nine-Banded Armadillo", "category": "Land & Predators", "region": "Port Gellhorn", "danger": "Docile", "notes": "Forages along dirt roadsides and rural scrub in Port Gellhorn and Ambrosia."},
    {"id": "an-river-otter", "name": "White River Otter", "category": "Land & Predators", "region": "Grassrivers", "danger": "Docile", "notes": "Playful wetland mammal found along Grassrivers creeks and clear marsh banks."},
    {"id": "an-macaque", "name": "Rhesus Macaque", "category": "Land & Predators", "region": "Grassrivers", "danger": "Mischievous", "notes": "Invasive primate troops living in Leonida's wooded wetlands and river islands."},
    {"id": "an-green-iguana", "name": "Green Iguana", "category": "Land & Predators", "region": "Leonida Keys", "danger": "Docile", "notes": "Sunbathes on seawalls, docks, and palm trunks throughout the Leonida Keys."},
    {"id": "an-cane-toad", "name": "Cane Toad", "category": "Land & Predators", "region": "Grassrivers", "danger": "Docile", "notes": "Nocturnal amphibian found in damp grass, canals, and suburban lawns after rain."},
    {"id": "an-raccoon", "name": "Raccoon", "category": "Land & Predators", "region": "Port Gellhorn", "danger": "Docile", "notes": "Scavenges alley dumpsters and motel fringes at night across Port Gellhorn & Vice City."},
    {"id": "an-red-fox", "name": "Red Fox", "category": "Land & Predators", "region": "Mount Kalaga National Park", "danger": "Docile", "notes": "Spotted darting across forest clearings at dawn and dusk."},
    {"id": "an-beaver", "name": "Beaver", "category": "Land & Predators", "region": "Mount Kalaga National Park", "danger": "Docile", "notes": "Builds lodges along Mount Kalaga streams and northern river bends."},
    {"id": "an-skunk", "name": "Skunk", "category": "Land & Predators", "region": "Ambrosia", "danger": "Defensive", "notes": "Nocturnal forager around rural Ambrosia farms and roadside brush."},
    {"id": "an-squirrel", "name": "Squirrel", "category": "Land & Predators", "region": "Vice City", "danger": "Docile", "notes": "Common in city parks, palm trees, and wooded trails across Leonida."},
    {"id": "an-snake", "name": "Snake", "category": "Land & Predators", "region": "Grassrivers", "danger": "Venomous / Cautious", "notes": "Slithers through tall marsh grass and rocky ledges in Grassrivers and Mount Kalaga."},

    # BIRDS (Part of 62 bird species)
    {"id": "an-flamingo", "name": "American Flamingo", "category": "Birds", "region": "Leonida Keys", "danger": "Docile", "notes": "Iconic bright-pink wading flocks in Leonida Keys flats and Grassrivers wetlands."},
    {"id": "an-pelican", "name": "Pelican", "category": "Birds", "region": "Leonida Keys", "danger": "Docile", "notes": "Perches on marina pilings and dives for fish along Vice Beach and the Keys."},
    {"id": "an-blue-heron", "name": "Great Blue Heron", "category": "Birds", "region": "Grassrivers", "danger": "Docile", "notes": "Tall coastal wading bird stalking shallow marshes and canals."},
    {"id": "an-osprey", "name": "Osprey", "category": "Birds", "region": "Leonida Keys", "danger": "Docile", "notes": "Fish-hunting raptor nesting on channel markers and coastal towers."},
    {"id": "an-spoonbill", "name": "Roseate Spoonbill", "category": "Birds", "region": "Grassrivers", "danger": "Docile", "notes": "Distinctive pink marsh bird sweeping shallow Grassrivers lagoons."},
    {"id": "an-whooping-crane", "name": "Whooping Crane", "category": "Birds", "region": "Grassrivers", "danger": "Docile", "notes": "Rare tall white wetland crane spotted in open Grassrivers flats."},
    {"id": "an-cormorant", "name": "Double-Crested Cormorant", "category": "Birds", "region": "Leonida Keys", "danger": "Docile", "notes": "Diving waterbird frequently seen drying its wings on docks and buoys."},
    {"id": "an-duck", "name": "Duck", "category": "Birds", "region": "Grassrivers", "danger": "Docile", "notes": "Common across ponds, canals, and calm wetland coves."},
    {"id": "an-seagull", "name": "Seagull", "category": "Birds", "region": "Vice City", "danger": "Docile", "notes": "Flocks over Vice Beach boardwalks, piers, and marinas."},
    {"id": "an-bald-eagle", "name": "Bald Eagle", "category": "Birds", "region": "Mount Kalaga National Park", "danger": "Docile", "notes": "Soars high above Mount Kalaga peaks and northern lakes."},
    {"id": "an-woodpecker", "name": "Woodpecker", "category": "Birds", "region": "Mount Kalaga National Park", "danger": "Docile", "notes": "Heard drumming on pine trunks throughout Mount Kalaga National Park."},
    {"id": "an-pigeon", "name": "Pigeon", "category": "Birds", "region": "Vice City", "danger": "Docile", "notes": "Ubiquitous across Vice City sidewalks, plazas, and rooftops."},

    # MARINE & AQUATIC
    {"id": "an-manatee", "name": "Manatee", "category": "Marine & Aquatic", "region": "Leonida Keys", "danger": "Docile", "notes": "Gentle marine mammal gliding through warm Keys coves and coastal springs."},
    {"id": "an-hammerhead", "name": "Hammerhead Shark", "category": "Marine & Aquatic", "region": "Leonida Keys", "danger": "Hostile Predator", "notes": "Patrols deeper reefs and offshore channels around the Leonida Keys."},
    {"id": "an-great-white", "name": "Great White Shark", "category": "Marine & Aquatic", "region": "Vice City", "danger": "Apex Predator", "notes": "Deep offshore waters beyond the Vice City coastline—lethal to unprotected swimmers."},
    {"id": "an-dolphin", "name": "Dolphin", "category": "Marine & Aquatic", "region": "Vice City", "danger": "Docile", "notes": "Pods leap alongside boats in Vice Bay and the Leonida Keys."},
    {"id": "an-sea-turtle", "name": "Sea Turtle", "category": "Marine & Aquatic", "region": "Leonida Keys", "danger": "Docile", "notes": "Swims around coral reefs and shipwreck dive spots in the Keys."},
    {"id": "an-stingray", "name": "Stingray / Manta Ray", "category": "Marine & Aquatic", "region": "Leonida Keys", "danger": "Cautious", "notes": "Glides over sandy shoals and shallow turquoise reefs."},
    {"id": "an-lionfish", "name": "Lionfish", "category": "Marine & Aquatic", "region": "Leonida Keys", "danger": "Venomous", "notes": "Striped invasive reef fish hovering near sunken wrecks and coral ledges."},
    {"id": "an-killer-whale", "name": "Killer Whale", "category": "Marine & Aquatic", "region": "Vice City", "danger": "Apex Marine", "notes": "Rare deep-ocean sighting far offshore beyond the continental drop-off."},
    {"id": "an-eel", "name": "Eel", "category": "Marine & Aquatic", "region": "Leonida Keys", "danger": "Cautious", "notes": "Hides inside reef crevices and underwater wrecks."},
    {"id": "an-jellyfish", "name": "Jellyfish", "category": "Marine & Aquatic", "region": "Vice City", "danger": "Stinging", "notes": "Drifts in coastal currents off Vice Beach and Keys reefs."},
    {"id": "an-crayfish", "name": "Crayfish", "category": "Marine & Aquatic", "region": "Grassrivers", "danger": "Docile", "notes": "Freshwater crustacean found in muddy Grassrivers creeks and bayous."},

    # DOMESTIC / PETTABLE
    {"id": "an-aussie-shepherd", "name": "Australian Shepherd", "category": "Domestic/Pettable", "region": "Vice City", "danger": "Pettable", "notes": "Friendly herding dog seen on beaches and suburban parks."},
    {"id": "an-chihuahua", "name": "Chihuahua", "category": "Domestic/Pettable", "region": "Vice City", "danger": "Pettable", "notes": "Common along Ocean Beach walkways and boutique sidewalks."},
    {"id": "an-doberman", "name": "Doberman", "category": "Domestic/Pettable", "region": "Vice City", "danger": "Guard / Pettable", "notes": "Sleek guard breed spotted near upscale Vice City estates and yards."},
    {"id": "an-german-shepherd", "name": "German Shepherd", "category": "Domestic/Pettable", "region": "Port Gellhorn", "danger": "Pettable", "notes": "Loyal working dog seen with locals across Port Gellhorn and Ambrosia."},
    {"id": "an-labrador", "name": "Labrador Retriever", "category": "Domestic/Pettable", "region": "Leonida Keys", "danger": "Pettable", "notes": "Friendly retriever frequently spotted on docks and Keys beaches."},
    {"id": "an-rottweiler", "name": "Rottweiler", "category": "Domestic/Pettable", "region": "Ambrosia", "danger": "Guard / Pettable", "notes": "Heavy-set breed seen around industrial yards and residential porches."},
    {"id": "an-poodle", "name": "Poodle", "category": "Domestic/Pettable", "region": "Vice City", "danger": "Pettable", "notes": "Walked along luxury Vice City shopping avenues and resorts."},
    {"id": "an-domestic-cat", "name": "Domestic Cat", "category": "Domestic/Pettable", "region": "Vice City", "danger": "Pettable", "notes": "Lounges on alley steps, porches, and Key Lento docks; can be petted."}
]

def write_json(filename, payload):
    for d in (DATA_DIR, PUB_DATA_DIR):
        with open(os.path.join(d, filename), "w", encoding="utf-8", newline="\n") as f:
            json.dump(payload, f, indent=2, ensure_ascii=False)

write_json("properties.json", {
    "updated": "2026-11-21",
    "note": "Story Safehouses (4 total — houses cannot be bought in Story Mode), Garages (8 Purchasable + 4 Story-Unlocked + Ultimate Edition), and 7 Fences + BuckMe Family Savings.",
    "items": PROPERTIES
})

write_json("animals.json", {
    "updated": "2026-11-21",
    "note": "170+ wildlife species across Leonida's 6 regions (including 62 bird species).",
    "regions": ["Vice City", "Leonida Keys", "Grassrivers", "Port Gellhorn", "Ambrosia", "Mount Kalaga National Park"],
    "categories": ["Land & Predators", "Birds", "Marine & Aquatic", "Domestic/Pettable"],
    "items": ANIMALS
})

NAV_HTML = '''<div class="countdown-strip">
    <div class="countdown-strip-inner">
        <div class="strip-left-items">
            <span class="strip-pill" style="background:rgba(0,255,136,0.15); border:1px solid var(--neon-green); color:var(--neon-green); font-weight:900;">
                <span class="strip-pulse" style="background:var(--neon-green);"></span>
                <span class="launch-mode-label" data-launch-banner>🔥 GTA 6 IS LIVE — DAY-3 HEISTS, CHEATS, MAPS &amp; DROPS</span>
            </span>
            <span class="strip-divider">|</span>
            <span class="strip-pill" style="color:#94a3b8;">GTA 6 Online: <span style="color:var(--neon-amber); font-weight:700;">Expected 2027 — Not Live at Launch</span></span>
        </div>
    </div>
</div>
<nav class="navbar">
    <div class="nav-container">
        <a href="/" class="brand-logo"><span>GTA 6</span><span class="vi">HEIST GUIDE</span><span class="brand-badge">Syndicate v3.3</span></a>
        <ul class="nav-links">
            <li><a href="/" class="nav-pill">Heists</a></li>
            <li><a href="/interactive-map" class="nav-pill">Map</a></li>
            <li><a href="/properties.html" class="nav-pill __PROP_ACT__" style="color:var(--neon-cyan); font-weight:800;">🏠 Properties</a></li>
            <li><a href="/animals.html" class="nav-pill __ANIM_ACT__" style="color:var(--neon-green); font-weight:800;">🐊 Animals</a></li>
            <li><a href="/save-planner" class="nav-pill">💾 Save Planner</a></li>
            <li><a href="/cheats" class="nav-pill">⚡ Cheats</a></li>
            <li><a href="/cash-guide" class="nav-pill">💰 Cash Guide</a></li>
        </ul>
    </div>
</nav>'''

FOOTER_HTML = '''<footer style="border-top:1px solid rgba(255,255,255,0.08); padding:1.5rem 1rem; text-align:center; color:#64748b; font-size:0.8rem;">
    <div style="margin-bottom:0.65rem; display:flex; justify-content:center; gap:1rem; flex-wrap:wrap;">
        <a href="/" style="color:#94a3b8; text-decoration:none;">Home</a>
        <a href="/properties.html" style="color:var(--neon-cyan); text-decoration:none;">🏠 Properties</a>
        <a href="/animals.html" style="color:var(--neon-green); text-decoration:none;">🐊 Animals</a>
        <a href="/save-planner" style="color:#94a3b8; text-decoration:none;">Save Planner</a>
        <a href="/cheats" style="color:#94a3b8; text-decoration:none;">Cheats</a>
        <a href="/settings" style="color:#94a3b8; text-decoration:none;">Settings</a>
        <a href="/cash-guide" style="color:#94a3b8; text-decoration:none;">Cash Guide</a>
    </div>
    <p style="margin:0;">GTA6HeistGuide.com — Independent GTA VI database &amp; tactical companion. As an Amazon Associate (tag: <code>gta6heistguid-20</code>), G FUEL (ID: 3162838), ExitLag, Gumroad, G2A, and Eneba partner, this site earns commissions on qualifying purchases.</p>
</footer>
<script src="/js/affiliates.js"></script>
<script src="/site-config.js"></script>
<script src="/assets/main.js" defer></script>'''

PROPERTIES_HTML = f'''<!DOCTYPE html>
<html lang="en">
<head>
    <link rel="icon" type="image/svg+xml" href="/favicon.svg">
    <meta charset="UTF-8">
    <meta name="robots" content="index, follow, max-image-preview:large">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GTA 6 Properties Database: Safehouses, 12+ Garages &amp; 7 Fences | GTA6HeistGuide.com</title>
    <meta name="description" content="Searchable GTA 6 Properties Database: all 4 Story Safehouses (houses cannot be bought in story mode), 8 Purchasable &amp; 4 Story Garages, Paradise Garage, and all 7 Fences including Brian's Lockup (7700).">
    <link rel="canonical" href="https://www.gta6heistguide.com/properties.html">
    <meta property="og:title" content="GTA 6 Properties Database: Safehouses, Garages &amp; Fences">
    <meta property="og:description" content="Track every GTA 6 Story Safehouse, Purchasable Garage, and Fence across Leonida with owned/unlocked checkboxes.">
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://www.gta6heistguide.com/properties.html">
    <meta property="og:image" content="https://www.gta6heistguide.com/assets/images/regions/vice-city.jpg">
    <link rel="stylesheet" href="/assets/style.css?v=20261121_v7">
    <script type="application/ld+json">
    {{
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {{"@type": "Question", "name": "Can you buy houses in GTA 6 Story Mode?", "acceptedAnswer": {{"@type": "Answer", "text": "No—houses cannot be bought in GTA 6 Story Mode. You unlock 4 Story Safehouses through campaign progression (starting with Jason's House in Key Lento and the Chapter 2 Motel Base), while you can buy 8 Purchasable Garages."}}}},
        {{"@type": "Question", "name": "What is the keypad code for Brian's Lockup fence in GTA 6?", "acceptedAnswer": {{"@type": "Answer", "text": "The verified code for Brian's Lockup is 7700. It buys drugs, jewelry, and marked bills."}}}}
      ]
    }}
    </script>
</head>
<body>
{NAV_HTML.replace("__PROP_ACT__", "active").replace("__ANIM_ACT__", "")}

<main class="container" style="max-width: 1140px; margin: 0 auto; padding: 1.25rem 1rem 2.5rem;">
    <header style="margin-bottom:1.25rem;">
        <span class="user-badge" style="background:rgba(0,240,255,0.16); border:1px solid var(--neon-cyan); color:var(--neon-cyan); font-size:0.72rem; padding:0.2rem 0.55rem; font-weight:800;">GTABASE-STYLE INTERACTIVE DATABASE</span>
        <h1 style="font-size:clamp(1.45rem, 3vw, 2.2rem); color:#fff; margin:0.45rem 0 0.5rem;">GTA 6 Properties, Garages &amp; Fences Database</h1>
        <p style="color:#94a3b8; font-size:0.9rem; margin:0 0 0.85rem;">Track all <strong style="color:#fff;">4 Story Safehouses</strong> (houses cannot be bought in story mode), <strong style="color:#fff;">8 Purchasable + 4 Story Garages + Ultimate Edition Paradise Garage</strong>, and all <strong style="color:#fff;">7 Fences &amp; BuckMe Family Savings</strong>.</p>

        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:0.6rem; margin-bottom:1rem;">
            <div style="border-radius:10px; overflow:hidden; border:1px solid rgba(0,240,255,0.25); background:#0a101d;">
                <img src="/assets/images/regions/vice-city.jpg" alt="Vice City Properties" class="aspect-video object-cover" style="width:100%; aspect-ratio:16/9; object-fit:cover; display:block;">
                <div style="padding:0.4rem 0.6rem; font-size:0.76rem; font-weight:800; color:var(--neon-cyan);">Vice City</div>
            </div>
            <div style="border-radius:10px; overflow:hidden; border:1px solid rgba(0,240,255,0.25); background:#0a101d;">
                <img src="/assets/images/regions/leonida-keys.jpg" alt="Leonida Keys Properties" class="aspect-video object-cover" style="width:100%; aspect-ratio:16/9; object-fit:cover; display:block;">
                <div style="padding:0.4rem 0.6rem; font-size:0.76rem; font-weight:800; color:var(--neon-green);">Leonida Keys</div>
            </div>
            <div style="border-radius:10px; overflow:hidden; border:1px solid rgba(0,240,255,0.25); background:#0a101d;">
                <img src="/assets/images/regions/port-gellhorn.jpg" alt="Port Gellhorn Properties" class="aspect-video object-cover" style="width:100%; aspect-ratio:16/9; object-fit:cover; display:block;">
                <div style="padding:0.4rem 0.6rem; font-size:0.76rem; font-weight:800; color:var(--neon-amber);">Port Gellhorn</div>
            </div>
            <div style="border-radius:10px; overflow:hidden; border:1px solid rgba(0,240,255,0.25); background:#0a101d;">
                <img src="/assets/images/regions/grassrivers.jpg" alt="Grassrivers Properties" class="aspect-video object-cover" style="width:100%; aspect-ratio:16/9; object-fit:cover; display:block;">
                <div style="padding:0.4rem 0.6rem; font-size:0.76rem; font-weight:800; color:var(--neon-pink);">Grassrivers</div>
            </div>
        </div>
    </header>

    <!-- FILTER & PROGRESS BAR -->
    <section style="background:rgba(10,16,28,0.92); border:1px solid rgba(0,240,255,0.25); border-radius:10px; padding:1rem; margin-bottom:1.15rem;">
        <div style="display:flex; flex-wrap:wrap; gap:0.65rem; align-items:center; justify-content:space-between; margin-bottom:0.75rem;">
            <input id="propSearch" type="search" placeholder="Search safehouses, garages, fences, code 7700..." style="flex:1 1 260px; padding:0.55rem 0.85rem; border-radius:8px; border:1px solid rgba(0,240,255,0.35); background:#070c16; color:#fff; font-size:0.88rem;">
            <select id="propCategory" style="padding:0.55rem 0.85rem; border-radius:8px; border:1px solid rgba(0,240,255,0.35); background:#070c16; color:#fff; font-size:0.85rem;">
                <option value="ALL">All Categories</option>
                <option value="Story Safehouses">Story Safehouses (4)</option>
                <option value="Garages">Garages (13)</option>
                <option value="Fences & Money Safes">Fences &amp; Money Safes (8)</option>
            </select>
            <select id="propRegion" style="padding:0.55rem 0.85rem; border-radius:8px; border:1px solid rgba(0,240,255,0.35); background:#070c16; color:#fff; font-size:0.85rem;">
                <option value="ALL">All Regions</option>
                <option value="Vice City">Vice City</option>
                <option value="Leonida Keys">Leonida Keys</option>
                <option value="Port Gellhorn">Port Gellhorn</option>
                <option value="Grassrivers">Grassrivers</option>
                <option value="Ambrosia">Ambrosia</option>
                <option value="Mount Kalaga National Park">Mount Kalaga National Park</option>
            </select>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem; font-size:0.82rem; font-family:var(--font-mono);">
            <span id="propCount" style="color:var(--neon-cyan);">Loading properties...</span>
            <span id="propProgress" style="color:var(--neon-green); font-weight:800;">Owned / Unlocked: 0 / 0</span>
        </div>
    </section>

    <div id="propGrid" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(310px, 1fr)); gap:0.85rem;"></div>
</main>

{FOOTER_HTML}
<script>
(function() {{
  const STORAGE_KEY = 'gta6_properties_owned_v1';
  let items = [];
  let owned = {{}};
  try {{ owned = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{{}}'); }} catch (e) {{ owned = {{}}; }}

  const grid = document.getElementById('propGrid');
  const searchEl = document.getElementById('propSearch');
  const catEl = document.getElementById('propCategory');
  const regEl = document.getElementById('propRegion');
  const countEl = document.getElementById('propCount');
  const progEl = document.getElementById('propProgress');

  function saveOwned() {{
    try {{ localStorage.setItem(STORAGE_KEY, JSON.stringify(owned)); }} catch (e) {{}}
  }}

  function render() {{
    const q = (searchEl.value || '').trim().toLowerCase();
    const cat = catEl.value;
    const reg = regEl.value;
    const filtered = items.filter(it => {{
      if (cat !== 'ALL' && it.category !== cat) return false;
      if (reg !== 'ALL' && it.region !== reg) return false;
      if (q && !(it.name + ' ' + it.region + ' ' + it.category + ' ' + it.features + ' ' + it.notes).toLowerCase().includes(q)) return false;
      return true;
    }});

    const totalOwned = items.filter(i => owned[i.id]).length;
    countEl.textContent = `Showing ${{filtered.length}} of ${{items.length}} verified locations`;
    progEl.textContent = `Owned / Unlocked: ${{totalOwned}} / ${{items.length}}`;

    grid.innerHTML = filtered.map(it => {{
      const isChecked = !!owned[it.id];
      const badgeColor = it.category === 'Story Safehouses' ? 'var(--neon-pink)' : (it.category === 'Garages' ? 'var(--neon-cyan)' : 'var(--neon-green)');
      return `<article style="background:rgba(12,18,32,0.92); border:1px solid ${{isChecked ? 'var(--neon-green)' : 'rgba(255,255,255,0.1)'}}; border-radius:10px; padding:0.95rem; display:flex; flex-direction:column; justify-content:space-between; gap:0.55rem;">
        <div>
          <div style="display:flex; justify-content:space-between; align-items:center; gap:0.4rem; margin-bottom:0.4rem;">
            <span style="font-size:0.68rem; font-weight:800; color:${{badgeColor}}; font-family:var(--font-mono); text-transform:uppercase;">${{it.category}}</span>
            <span style="font-size:0.7rem; color:#94a3b8; font-family:var(--font-mono);">${{it.region}}</span>
          </div>
          <h2 style="font-size:1.02rem; color:#fff; margin:0 0 0.3rem;">${{it.name}}</h2>
          <div style="font-size:0.76rem; color:var(--neon-amber); font-weight:700; margin-bottom:0.35rem;">${{it.chapter}} &bull; ${{it.status}}</div>
          <p style="font-size:0.82rem; color:#cbd5e1; margin:0 0 0.35rem; line-height:1.45;"><strong>Perks:</strong> ${{it.features}}</p>
          <p style="font-size:0.78rem; color:#94a3b8; margin:0; line-height:1.4;">${{it.notes}}</p>
        </div>
        <label style="display:flex; align-items:center; gap:0.5rem; margin-top:0.4rem; padding-top:0.5rem; border-top:1px solid rgba(255,255,255,0.08); cursor:pointer; font-size:0.8rem; color:${{isChecked ? 'var(--neon-green)' : '#e2e8f0'}}; font-weight:700;">
          <input type="checkbox" data-prop-id="${{it.id}}" ${{isChecked ? 'checked' : ''}} style="width:16px; height:16px; accent-color:#00ff88;">
          <span>${{isChecked ? 'Owned / Unlocked' : 'Mark Owned / Unlocked'}}</span>
        </label>
      </article>`;
    }}).join('');

    grid.querySelectorAll('input[data-prop-id]').forEach(cb => {{
      cb.addEventListener('change', () => {{
        owned[cb.getAttribute('data-prop-id')] = cb.checked;
        saveOwned();
        render();
      }});
    }});
  }}

  fetch('/data/properties.json')
    .then(r => r.json())
    .then(data => {{ items = data.items || []; render(); }})
    .catch(() => {{ grid.innerHTML = '<p style="color:#f87171;">Failed to load properties database.</p>'; }});

  searchEl.addEventListener('input', render);
  catEl.addEventListener('change', render);
  regEl.addEventListener('change', render);
}})();
</script>
</body>
</html>
'''

ANIMALS_HTML = f'''<!DOCTYPE html>
<html lang="en">
<head>
    <link rel="icon" type="image/svg+xml" href="/favicon.svg">
    <meta charset="UTF-8">
    <meta name="robots" content="index, follow, max-image-preview:large">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GTA 6 Animals &amp; Wildlife Compendium (170+ Species Across 6 Regions) | GTA6HeistGuide.com</title>
    <meta name="description" content="Searchable GTA 6 Animals &amp; Wildlife Database: 170+ wildlife species across Leonida's 6 regions (including 62 bird species). Filter by region, category, and track spotted/studied animals.">
    <link rel="canonical" href="https://www.gta6heistguide.com/animals.html">
    <meta property="og:title" content="GTA 6 Animals &amp; Wildlife Compendium">
    <meta property="og:description" content="170+ wildlife species across Leonida's 6 regions (including 62 bird species). Interactive Spotted / Studied tracker.">
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://www.gta6heistguide.com/animals.html">
    <meta property="og:image" content="https://www.gta6heistguide.com/assets/images/regions/mount-kalaga.jpg">
    <link rel="stylesheet" href="/assets/style.css?v=20261121_v7">
    <script type="application/ld+json">
    {{
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {{"@type": "Question", "name": "How many animal species are in GTA 6?", "acceptedAnswer": {{"@type": "Answer", "text": "GTA 6 features 170+ wildlife species across Leonida's 6 regions, including 62 bird species, predators like Alligators, Florida Panthers, and Black Bears, marine life like Manatees and Hammerhead Sharks, and pettable dogs and cats."}}}},
        {{"@type": "Question", "name": "Where do you find the Florida Panther and Black Bear in GTA 6?", "acceptedAnswer": {{"@type": "Answer", "text": "Both the Florida Panther (Cougar) and Black Bear roam Mount Kalaga National Park in northern Leonida."}}}}
      ]
    }}
    </script>
</head>
<body>
{NAV_HTML.replace("__PROP_ACT__", "").replace("__ANIM_ACT__", "active")}

<main class="container" style="max-width: 1140px; margin: 0 auto; padding: 1.25rem 1rem 2.5rem;">
    <header style="margin-bottom:1.25rem;">
        <span class="user-badge" style="background:rgba(0,255,136,0.16); border:1px solid var(--neon-green); color:var(--neon-green); font-size:0.72rem; padding:0.2rem 0.55rem; font-weight:800;">LEONIDA WILDLIFE COMPENDIUM</span>
        <h1 style="font-size:clamp(1.45rem, 3vw, 2.2rem); color:#fff; margin:0.45rem 0 0.45rem;">GTA 6 Animals &amp; Wildlife Database</h1>
        <p style="color:var(--neon-cyan); font-weight:700; font-size:0.95rem; margin:0 0 0.85rem;">170+ wildlife species across Leonida's 6 regions (including 62 bird species).</p>

        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:0.6rem; margin-bottom:1rem;">
            <div style="border-radius:10px; overflow:hidden; border:1px solid rgba(0,255,136,0.25); background:#0a101d;">
                <img src="/assets/images/regions/mount-kalaga.jpg" alt="Mount Kalaga National Park Wildlife" class="aspect-video object-cover" style="width:100%; aspect-ratio:16/9; object-fit:cover; display:block;">
                <div style="padding:0.4rem 0.6rem; font-size:0.76rem; font-weight:800; color:var(--neon-green);">Mount Kalaga National Park</div>
            </div>
            <div style="border-radius:10px; overflow:hidden; border:1px solid rgba(0,255,136,0.25); background:#0a101d;">
                <img src="/assets/images/regions/grassrivers.jpg" alt="Grassrivers Alligators & Birds" class="aspect-video object-cover" style="width:100%; aspect-ratio:16/9; object-fit:cover; display:block;">
                <div style="padding:0.4rem 0.6rem; font-size:0.76rem; font-weight:800; color:var(--neon-cyan);">Grassrivers Wetlands</div>
            </div>
            <div style="border-radius:10px; overflow:hidden; border:1px solid rgba(0,255,136,0.25); background:#0a101d;">
                <img src="/assets/images/regions/leonida-keys.jpg" alt="Leonida Keys Marine Life" class="aspect-video object-cover" style="width:100%; aspect-ratio:16/9; object-fit:cover; display:block;">
                <div style="padding:0.4rem 0.6rem; font-size:0.76rem; font-weight:800; color:var(--neon-amber);">Leonida Keys</div>
            </div>
            <div style="border-radius:10px; overflow:hidden; border:1px solid rgba(0,255,136,0.25); background:#0a101d;">
                <img src="/assets/images/regions/vice-city.jpg" alt="Vice City Coastal & Domestic Animals" class="aspect-video object-cover" style="width:100%; aspect-ratio:16/9; object-fit:cover; display:block;">
                <div style="padding:0.4rem 0.6rem; font-size:0.76rem; font-weight:800; color:var(--neon-pink);">Vice City</div>
            </div>
        </div>
    </header>

    <section style="background:rgba(10,16,28,0.92); border:1px solid rgba(0,255,136,0.25); border-radius:10px; padding:1rem; margin-bottom:1.15rem;">
        <div style="display:flex; flex-wrap:wrap; gap:0.65rem; align-items:center; justify-content:space-between; margin-bottom:0.75rem;">
            <input id="animSearch" type="search" placeholder="Search Alligator, Panther, Flamingo, Manatee, Shiba/Labrador..." style="flex:1 1 260px; padding:0.55rem 0.85rem; border-radius:8px; border:1px solid rgba(0,255,136,0.35); background:#070c16; color:#fff; font-size:0.88rem;">
            <select id="animCategory" style="padding:0.55rem 0.85rem; border-radius:8px; border:1px solid rgba(0,255,136,0.35); background:#070c16; color:#fff; font-size:0.85rem;">
                <option value="ALL">All Categories</option>
                <option value="Land & Predators">Land &amp; Predators</option>
                <option value="Birds">Birds</option>
                <option value="Marine & Aquatic">Marine &amp; Aquatic</option>
                <option value="Domestic/Pettable">Domestic / Pettable</option>
            </select>
            <select id="animRegion" style="padding:0.55rem 0.85rem; border-radius:8px; border:1px solid rgba(0,255,136,0.35); background:#070c16; color:#fff; font-size:0.85rem;">
                <option value="ALL">All 6 Regions</option>
                <option value="Vice City">Vice City</option>
                <option value="Leonida Keys">Leonida Keys</option>
                <option value="Grassrivers">Grassrivers</option>
                <option value="Port Gellhorn">Port Gellhorn</option>
                <option value="Ambrosia">Ambrosia</option>
                <option value="Mount Kalaga National Park">Mount Kalaga National Park</option>
            </select>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem; font-size:0.82rem; font-family:var(--font-mono);">
            <span id="animCount" style="color:var(--neon-cyan);">Loading wildlife compendium...</span>
            <span id="animProgress" style="color:var(--neon-green); font-weight:800;">Spotted / Studied: 0 / 0</span>
        </div>
    </section>

    <div id="animGrid" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(290px, 1fr)); gap:0.8rem;"></div>
</main>

{FOOTER_HTML}
<script>
(function() {{
  const STORAGE_KEY = 'gta6_animals_studied_v1';
  let items = [];
  let studied = {{}};
  try {{ studied = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{{}}'); }} catch (e) {{ studied = {{}}; }}

  const grid = document.getElementById('animGrid');
  const searchEl = document.getElementById('animSearch');
  const catEl = document.getElementById('animCategory');
  const regEl = document.getElementById('animRegion');
  const countEl = document.getElementById('animCount');
  const progEl = document.getElementById('animProgress');

  function saveStudied() {{
    try {{ localStorage.setItem(STORAGE_KEY, JSON.stringify(studied)); }} catch (e) {{}}
  }}

  function render() {{
    const q = (searchEl.value || '').trim().toLowerCase();
    const cat = catEl.value;
    const reg = regEl.value;
    const filtered = items.filter(it => {{
      if (cat !== 'ALL' && it.category !== cat) return false;
      if (reg !== 'ALL' && it.region !== reg) return false;
      if (q && !(it.name + ' ' + it.region + ' ' + it.category + ' ' + it.danger + ' ' + it.notes).toLowerCase().includes(q)) return false;
      return true;
    }});

    const totalStudied = items.filter(i => studied[i.id]).length;
    countEl.textContent = `Showing ${{filtered.length}} of ${{items.length}} verified launch species`;
    progEl.textContent = `Spotted / Studied: ${{totalStudied}} / ${{items.length}}`;

    grid.innerHTML = filtered.map(it => {{
      const isChecked = !!studied[it.id];
      const badgeColor = it.category === 'Land & Predators' ? 'var(--neon-pink)' : (it.category === 'Birds' ? 'var(--neon-amber)' : (it.category === 'Marine & Aquatic' ? 'var(--neon-cyan)' : 'var(--neon-green)'));
      return `<article style="background:rgba(12,18,32,0.92); border:1px solid ${{isChecked ? 'var(--neon-green)' : 'rgba(255,255,255,0.1)'}}; border-radius:10px; padding:0.9rem; display:flex; flex-direction:column; justify-content:space-between; gap:0.5rem;">
        <div>
          <div style="display:flex; justify-content:space-between; align-items:center; gap:0.4rem; margin-bottom:0.35rem;">
            <span style="font-size:0.68rem; font-weight:800; color:${{badgeColor}}; font-family:var(--font-mono); text-transform:uppercase;">${{it.category}}</span>
            <span style="font-size:0.7rem; color:#94a3b8; font-family:var(--font-mono);">${{it.region}}</span>
          </div>
          <h2 style="font-size:1rem; color:#fff; margin:0 0 0.25rem;">${{it.name}}</h2>
          <div style="font-size:0.74rem; color:#e2e8f0; margin-bottom:0.35rem;"><strong>Behavior:</strong> ${{it.danger}}</div>
          <p style="font-size:0.8rem; color:#94a3b8; margin:0; line-height:1.45;">${{it.notes}}</p>
        </div>
        <label style="display:flex; align-items:center; gap:0.5rem; margin-top:0.35rem; padding-top:0.45rem; border-top:1px solid rgba(255,255,255,0.08); cursor:pointer; font-size:0.8rem; color:${{isChecked ? 'var(--neon-green)' : '#e2e8f0'}}; font-weight:700;">
          <input type="checkbox" data-anim-id="${{it.id}}" ${{isChecked ? 'checked' : ''}} style="width:16px; height:16px; accent-color:#00ff88;">
          <span>${{isChecked ? 'Spotted / Studied' : 'Mark Spotted / Studied'}}</span>
        </label>
      </article>`;
    }}).join('');

    grid.querySelectorAll('input[data-anim-id]').forEach(cb => {{
      cb.addEventListener('change', () => {{
        studied[cb.getAttribute('data-anim-id')] = cb.checked;
        saveStudied();
        render();
      }});
    }});
  }}

  fetch('/data/animals.json')
    .then(r => r.json())
    .then(data => {{ items = data.items || []; render(); }})
    .catch(() => {{ grid.innerHTML = '<p style="color:#f87171;">Failed to load animals database.</p>'; }});

  searchEl.addEventListener('input', render);
  catEl.addEventListener('change', render);
  regEl.addEventListener('change', render);
}})();
</script>
</body>
</html>
'''

with open(os.path.join(PUB_DIR, "properties.html"), "w", encoding="utf-8", newline="\n") as f:
    f.write(PROPERTIES_HTML)
with open(os.path.join(PUB_DIR, "animals.html"), "w", encoding="utf-8", newline="\n") as f:
    f.write(ANIMALS_HTML)

print(f"[OK] Generated properties.json ({len(PROPERTIES)} items), animals.json ({len(ANIMALS)} items), properties.html, and animals.html!")
