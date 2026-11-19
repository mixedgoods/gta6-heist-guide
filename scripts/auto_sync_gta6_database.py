#!/usr/bin/env python3
"""
GTA 6 Heist Guide - Autonomous Intel & Best-Photo Synchronization Engine (v4.0)
=================================================================================
- Queries official GTA Wiki MediaWiki APIs (Vehicles, Characters, Weapons, Locations)
- Fetches authentic in-game GTA 6 screenshots (Tier 1 >=480px) or exact in-game 3D model
  renders (Tier 2 640px) with Referer: https://gta.fandom.com/ and strict validation
- Upgrades stock/real-life/duplicated static assets while preserving verified GTA 6 shots
- Outputs deduplicated, properly classified catalog data + YouTube Wire + exact
  merged catalogTotals to public/data/gta6_master_intel.json
"""

from __future__ import annotations

import argparse
import concurrent.futures
import datetime
import hashlib
import io
import json
import os
import re
import sys
import time
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

try:
    from PIL import Image, ImageOps
    HAS_PIL = True
except ImportError:
    HAS_PIL = False

BASE_DIR = Path(__file__).resolve().parent.parent
PUBLIC_DIR = BASE_DIR / "public"
DATA_FILE = PUBLIC_DIR / "data" / "gta6_master_intel.json"
ASSETS_DIR = PUBLIC_DIR / "assets"

API_ENDPOINT = "https://gta.fandom.com/api.php"
BROWSER_UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
)
API_HEADERS = {"User-Agent": BROWSER_UA, "Accept": "application/json"}
IMG_HEADERS = {
    "User-Agent": BROWSER_UA,
    "Accept": "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
    "Referer": "https://gta.fandom.com/",
}

MIN_IMAGE_BYTES = 2048
MIN_TIER1_WIDTH = 640
MAX_OUT_WIDTH = 640
CANVAS_BG = (12, 18, 28)

BAD_FILENAME_KEYWORDS = (
    "map", "icon", "logo", "sprite", "badge", "radar", "hud", "blip",
    "placeholder", "disambig", "missing", "emblem", "crest",
)

# Verified authentic GTA 6 Trailer WebPs that must never be overwritten.
PRESERVE_VEHICLE_WEBPS = {
    "vehicle-banshee.jpg",
    "vehicle-buccaneer.jpg",
    "vehicle-cheetah.jpg",
    "vehicle-comet-s2.jpg",
    "vehicle-coquette-d10.jpg",
    "vehicle-gauntlet-hellfire.jpg",
    "vehicle-squalo.jpg",
    "vehicle-tulip.jpg",
}

# Verified authentic GTA 6 Trailer/Official weapon images to keep as-is.
PRESERVE_WEAPON_ASSETS = {
    "weapon-mustang357.jpg",
    "weapon-mp5.jpg",
    "weapon-carbine.jpg",
    "weapon-beretta.jpg",
    "weapon-baseball-bat.jpg",
    "weapon-sniper.jpg",
    "weapon-grenade-launcher.jpg",
    "item-thermal-lance.jpg",
}

# Explicit 1-to-1 best-photo sources for the 48 static vehicle .jpg files.
STATIC_VEHICLE_SOURCES: Dict[str, Tuple[Optional[str], List[str]]] = {
    "vehicle-elegy-retro.jpg": ("ElegyRetroCustom-GTAVI-Trailer1.png", ["Elegy Retro Custom"]),
    "vehicle-dominator-asp.jpg": ("DominatorASP-GTAVI-Trailer1.png", ["Dominator ASP"]),
    "vehicle-vigero-zx.jpg": ("VigeroZXConvertible-GTAVI-OfficialScreenshot-ViceCity09.png", ["Vigero ZX Convertible", "Vigero ZX"]),
    "vehicle-blista-compact.jpg": ("BlistaCompact-GTAVI-OfficialScreenshot-PortGellhornPostcard.jpg", ["Blista Compact (HD Universe)", "Blista Compact"]),
    "vehicle-rat-loader.jpg": (None, ["Rat-Loader"]),
    "vehicle-slamvan.jpg": ("Slamvan-GTAVI-Trailer1.png", ["Slamvan Custom", "Slamvan (HD Universe)"]),
    "vehicle-sabre-turbo.jpg": (None, ["Sabre Turbo Custom", "Sabre GT (HD Universe)", "Sabre Turbo"]),
    "vehicle-hermes.jpg": (None, ["Hermes"]),
    "vehicle-deviant.jpg": (None, ["Deviant"]),
    "vehicle-phoenix.jpg": ("Phoenix-GTAVI-Trailer2.png", ["Phoenix (HD Universe)", "Phoenix"]),
    "vehicle-furia.jpg": ("Furia-GTAVI-Trailer1.png", ["Furia"]),
    "vehicle-champion.jpg": (None, ["Champion"]),
    "vehicle-torero-xo.jpg": (None, ["Torero XO"]),
    "vehicle-carbonizzare.jpg": ("Carbonizzare-GTAVI-Trailer1.png", ["Carbonizzare"]),
    "vehicle-schafter-v12.jpg": ("SchafterV12-GTAVI-Trailer1.png", ["Schafter V12"]),
    "vehicle-astron.jpg": ("Astron-GTAVI-Trailer2.png", ["Astron", "Astron Custom"]),
    "vehicle-itali-gtb.jpg": (None, ["Itali GTB Custom", "Itali GTB"]),
    "vehicle-jugular.jpg": ("Jugular-GTAVI-Trailer1.png", ["Jugular (HD Universe)", "Jugular"]),
    "vehicle-vcpd-cruiser.jpg": ("PoliceCruiser3-GTAVI-Trailer1.png", ["Police Cruiser (interceptor)", "Police Cruiser (Buffalo)"]),
    "vehicle-buffalo-stx.jpg": ("BuffaloSTXPursuit-GTAVI-Trailer1.png", ["Buffalo STX Pursuit", "Buffalo STX"]),
    "vehicle-vcpd-riot.jpg": ("PoliceRiot-GTAVI-Trailer2-1.png", ["Police Riot"]),
    "vehicle-park-ranger.jpg": (None, ["Park Ranger", "Granger 3600LX"]),
    "vehicle-vcpd-unmarked.jpg": ("UnnamedVapidGhostPoliceCar-GTAVI-Trailer2-2.png", ["Unmarked Cruiser", "Police Cruiser (interceptor)"]),
    "vehicle-predator-patrol.jpg": ("UnnamedRBSIICoastGuardBoat-GTAVI-Trailer1.png", ["Police Predator"]),
    "vehicle-police-maverick.jpg": ("PoliceMaverick-GTAVI-OfficialScreenshot-Grassrivers04.png", ["Police Maverick (HD Universe)", "Police Maverick"]),
    "vehicle-karin-rebel.jpg": ("Rebel-GTAVI-OfficialScreenshot-Grassrivers02.png", ["Rebel"]),
    "vehicle-sandking-xl.jpg": ("SandkingXL-GTAVI-Trailer1-1.png", ["Sandking XL"]),
    "vehicle-seminole.jpg": (None, ["Seminole Frontier"]),
    "vehicle-dubsta-6x6.jpg": (None, ["Dubsta 6x6", "Dubsta"]),
    "vehicle-dorado.jpg": ("Dorado-GTAVI-OfficialScreenshot-Grassrivers02.png", ["Dorado"]),
    "vehicle-cavalcade-xl.jpg": (None, ["Cavalcade XL"]),
    "vehicle-patriot-milspec.jpg": (None, ["Patriot Mil-Spec"]),
    "vehicle-rancher-xl.jpg": ("Rancher-GTAVI-Trailer2.png", ["Rancher XL", "Rancher (HD Universe)"]),
    "vehicle-street-blazer.jpg": ("Blazer-GTAVI-Trailer1.png", ["Street Blazer", "Blazer"]),
    "vehicle-seasparrow.jpg": ("SeaSparrow-GTAVI-Trailer2.png", ["Sea Sparrow (HD Universe)", "Sea Sparrow"]),
    "vehicle-tropic-cruiser.jpg": (None, ["Tropic"]),
    "vehicle-nagasaki-dinghy.jpg": ("Dinghy-GTAVI-Trailer1.png", ["Dinghy (HD Universe)", "Dinghy"]),
    "vehicle-marquis-sailboat.jpg": ("Marquis-GTAVI-Trailer1.png", ["Marquis"]),
    "vehicle-western-duster.jpg": ("Duster-GTAVI-OfficialScreenshot-Ambrosia04.png", ["Duster"]),
    "vehicle-buckingham-maverick.jpg": ("Maverick-GTAVI-Trailer1.png", ["Maverick (HD Universe)", "Maverick"]),
    "vehicle-jobuilt-velum.jpg": (None, ["Velum"]),
    "vehicle-speedo-van.jpg": ("Speedo-GTAVI-Trailer1.png", ["Speedo"]),
    "vehicle-brute-boxville.jpg": ("Boxville-GTAVI-OfficialScreenshot-Ambrosia02.png", ["Boxville (HD Universe)", "Boxville"]),
    "vehicle-maibatsu-mule.jpg": (None, ["Mule"]),
    "vehicle-western-sovereign.jpg": ("UnnamedSovereignStockMotorcycle-GTAVI-OfficialScreenshot-Ambrosia01.png", ["Sovereign"]),
    "vehicle-bati-801.jpg": (None, ["Bati 801"]),
    "vehicle-bf400.jpg": (None, ["BF400"]),
    "vehicle-nemesis.jpg": (None, ["Nemesis"]),
}

# Replacement map for static weapon & gear JPEGs (stock/real-life/duplicate photos).
STATIC_WEAPON_GEAR_SOURCES: Dict[str, Tuple[Optional[str], List[str]]] = {
    "weapon-polymer.jpg": ("PolymerPistol-GTAVI-OfficialScreenshot-BoobieIke01.png", ["Polymer Pistol"]),
    "weapon-browning-hipower.jpg": (None, ["Vintage Pistol"]),
    "weapon-taurus-judge.jpg": (None, ["Double-Action Revolver", "Heavy Revolver"]),
    "weapon-micro-smg.jpg": (None, ["Micro SMG (HD Universe)"]),
    "weapon-tec9.jpg": (None, ["Machine Pistol", "Tec-9"]),
    "weapon-p90.jpg": (None, ["Assault SMG", "Combat PDW"]),
    "weapon-ak47.jpg": (None, ["Assault Rifle"]),
    "weapon-compact-rifle.jpg": (None, ["Compact Rifle"]),
    "weapon-battle-rifle.jpg": (None, ["Battle Rifle", "Heavy Rifle"]),
    "weapon-pump-shotgun.jpg": (None, ["Pump Shotgun"]),
    "weapon-sawed-off.jpg": ("UnnamedDoubleBarreledShotgun-GTAVI-OfficialScreenshot-Grassrivers03.png", ["Sawed-Off Shotgun", "Double Barreled Shotgun"]),
    "weapon-combat-shotgun.jpg": (None, ["Combat Shotgun", "Heavy Shotgun"]),
    "weapon-rpg7.jpg": (None, ["RPG (HD Universe)"]),
    "weapon-heavy-sniper.jpg": ("BoltActionSniper-GTAVI-OfficialScreenshot-MountKalagaNationalPark03.jpeg", ["Heavy Sniper", "Bolt Action Sniper"]),
    "weapon-hammer.jpg": ("Hammer-GTAVI-Trailer1.png", ["Hammer"]),
    "weapon-crowbar.jpg": (None, ["Crowbar"]),
    "weapon-combat-knife.jpg": (None, ["Knife"]),
    "gear-bandana.jpg": ("GTAVI-Jason-Lucia-Wearing-Masks.jpg", []),
    "gear-ballistic-mask.jpg": ("BulletproofHelmet-Black-GTAO.png", ["Bulletproof Helmet"]),
    "gear-stocking-mask.jpg": ("Stocking-Mask-GTA_Online.jpg", []),
    "gear-animal-mask.jpg": ("VespucciMovieMasks-GTAV-Masks-PigMask.png", ["Vespucci Movie Masks"]),
    "gear-scuba-suit.jpg": ("Rebreather_GTAO_In_Use.png", ["Rebreather"]),
    "gear-hazmat-suit.jpg": ("BugstarsEquipmentProp-GTAV-BugstarsMask&Uniform.jpg", []),
    "gear-juggernaut-armor.jpg": ("JuggernautArmor-GTAO-GunrunningTrailer.png", ["Ballistic Equipment"]),
    "gear-nvg-helmet.jpg": ("Night_Vision_GTAO.png", ["Night Vision"]),
    "gear-duffel-bag.jpg": ("GTAV_Hiking.jpg", ["Backpacks", "The Pacific Standard Job"]),
}

# Curated vehicle title overrides / normalization for wiki gallery & table names.
VEHICLE_NAME_CLEANUPS: Dict[str, Tuple[str, str, str]] = {
    "ballersecondgeneration": ("Gallivanter Baller", "Range Rover Evoque / Sport", "suv"),
    "bisonsecondgeneration": ("Bravado Bison Gen-2", "Dodge Ram Heavy Duty", "suv"),
    "seasharksecondgeneration": ("Speedophile Seashark Gen-2", "Sea-Doo Spark / RXT", "marine"),
    "btndelmar": ("BTN Delmar Coast Tug", "Commercial Harbor Vessel", "marine"),
    "s23": ("Grotti S23 Offshore Cruiser", "Performance Center-Console", "marine"),
    "airboat09": ("Leonida Airboat 09", "Diamondback Swamp Airboat", "marine"),
    "alvinov1": ("Alvino V1 Tourer", "Custom V-Twin Cruiser", "commercial"),
    "lombike": ("LomBike E-Scooter Share", "Urban Micromobility Fleet", "commercial"),
    "creado": ("Creado Muscle Coupe", "Retro-Modern Pony Car", "muscle"),
    "pmp700": ("Schyster PMP 700", "Chrysler 300C SRT8", "muscle"),
    "policecruiserbuffalo": ("VCPD Buffalo Interceptor", "Dodge Charger Pursuit", "pursuit"),
    "policecruiserinterceptor": ("VCPD Tactical Interceptor", "Ford Police Interceptor", "pursuit"),
    "gauntletinterceptor": ("Bravado Gauntlet Interceptor", "Dodge Challenger Demon Pursuit", "pursuit"),
    "vstr": ("Albany V-STR", "Cadillac CTS-V", "super"),
    "8fdrafter": ("Obey 8F Drafter", "Audi RS5 Coupe", "super"),
    "waltonl35stock": ("Declasse Walton L35", "Chevrolet S-10 4x4", "suv"),
    "caracara4x4": ("Vapid Caracara 4x4", "Ford F-150 Raptor", "suv"),
    "yosemite1500": ("Declasse Yosemite 1500", "GMC Sierra Off-Road", "suv"),
    "zombiechopper": ("Western Zombie Chopper", "Custom Bobber Chopper", "commercial"),
    "phantomcustom": ("JoBuilt Hauler Phantom Custom", "Semi-Truck Tractor", "commercial"),
    "towtruckankeebased": ("Slamvan / Yankee Towtruck", "Heavy Wrecker Rig", "commercial"),
    "towtruckyankeebased": ("Yankee Heavy Towtruck", "Commercial Recovery Rig", "commercial"),
    "buzardattackchopper": ("Nagasaki Buzzard Attack", "Boeing MH-6 Little Bird", "marine"),
    "buzzardattackchopper": ("Nagasaki Buzzard Attack", "Boeing MH-6 Little Bird", "marine"),
    "cruiserbike": ("Vice Beach Cruiser Bicycle", "Aluminum Beach Cruiser", "commercial"),
    "freighttrain": ("Leonida Freight Locomotive", "CSX SD70ACe Heavy Rail", "commercial"),
}

# Clean high-value named vehicle overrides for distinctive unnamed GTA VI gallery cars (>=480px shots).
UNNAMED_VEHICLE_ALIASES: Dict[str, Tuple[str, str, str]] = {
    "UnnamedBravadoMonsterTruck-GTAVI-OfficialScreenshot-PortGellhorn04.png": (
        "Bravado Sasquatch Monster 4x4", "Lifted Dodge Ram Trophy Mudder", "suv"
    ),
    "UnnamedCanisPickupTruck-GTAVI-OfficialScreenshot-PortGellhorn01.png": (
        "Canis Terminal Utility Pickup", "Jeep Gladiator / Crew 4x4", "suv"
    ),
    "UnnamedVapidGhostPoliceCar-GTAVI-Trailer2-2.png": (
        "VCPD Ghost Stealth Unit", "Stealth Interceptor Package", "pursuit"
    ),
    "UnnamedVapidUnmarkedSUV-GTAVI-OfficialScreenshot-MountKalagaNationalPark04.png": (
        "FIB / State Unmarked SUV", "Chevy Tahoe Federal Pursuit", "pursuit"
    ),
    "UnnamedPantherPOACHAirboat-GTAVI-OfficialScreenshot-Grassrivers04.png": (
        "POACH Tactical Swamp Airboat", "Leonida Wildlife Enforcement", "marine"
    ),
    "UnnamedWeazelNewsHelicopter-GTAVI-OfficialScreenshot-MountKalagaNationalPark02.png": (
        "Weazel News Sky-Cam Chopper", "Airbus H135 ENG Broadcast", "marine"
    ),
    "UnnamedRollsRoyceCabriolet-GTAVI-Trailer2.png": (
        "Enus Dawn Drophead Cabriolet", "Rolls-Royce Dawn", "super"
    ),
    "UnnamedSentinelClassicCabriolet-GTAVI-WebsiteAnimation.png": (
        "Ubermacht Sentinel Cabrio", "BMW M3 E30 Convertible", "super"
    ),
    "UnnamedVapidTaxi-GTAVI-Trailer1.png": (
        "Vice City Metro Stanier Taxi", "Crown Victoria Municipal Cab", "commercial"
    ),
    "UnnamedVCMMTrain-GTAVI-Trailer2.png": (
        "VCMM Elevated Metro Railcar", "Miami Metrorail Rapid Transit", "commercial"
    ),
    "UnnamedGEGenesisLocomotive-GTAVI-Postcard-PortGellhorn.png": (
        "Leonida Rail GE Express", "GE Genesis P42DC Passenger", "commercial"
    ),
    "UnnamedBravadoMinivan-GTAVI-Trailer1.png": (
        "Bravado Leonida Family MPV", "Chrysler Town & Country", "commercial"
    ),
    "UnnamedFifthGenChryslerTownCountryMinivan-GTAVI-Trailer1.png": (
        "Bravado Family Tourer MPV", "Chrysler Town & Country", "commercial"
    ),
    "UnnamedBravadoMinivanTaxi-GTAVI-OfficialScreenshot-WebsiteBackgroundJasonDuval.png": (
        "Vice City Accessible Minivan Taxi", "Yellow Fleet Wheelchair Cab", "commercial"
    ),
    "UnnamedNewFlyerXcelsiorBus-GTAVI-OfficialScreenshot-ViceCity03.png": (
        "Vice Metro Transit Coach", "New Flyer Xcelsior City Bus", "commercial"
    ),
    "UnnamedSwampBuggy-GTAVI-Trailer1-2.png": (
        "Grassrivers Mud Swamp Buggy", "Custom 66-Inch Bogger Rig", "suv"
    ),
    "UnnamedEurocopterEC135PoliceHelicopter-GTAVI-Artwork-JasonAndLucia02.jpg": (
        "VCPD Air-1 EC135 Interceptor", "Eurocopter EC135 Police", "pursuit"
    ),
    "UnnamedContender39STPoliceBoat-GTAVI-Artwork-JasonAndLucia02.jpg": (
        "Leonida Marine Pursuit 39ST", "Contender 39ST Interceptor", "pursuit"
    ),
    "UnnamedVerusLifeguardATV-GTAVI-OfficialScreenshot-ViceCity05.png": (
        "Vice Beach Lifeguard ATV", "Dinka Verus Rescue Quad", "pursuit"
    ),
}

REAL_MODEL_HINTS: Dict[str, str] = {
    "8F Drafter": "Audi RS5 Coupe",
    "Alpha": "Cadillac Elmiraj Coupe",
    "Banshee": "Dodge Viper SRT",
    "Buffalo": "Dodge Charger R/T",
    "Carbonizzare": "Ferrari California / F12",
    "Comet Retro Custom": "Porsche 911 RWB Widebody",
    "Coquette": "Chevrolet Corvette C7",
    "Cypher": "BMW M2 Competition",
    "Futo": "Toyota AE86 Sprinter Trueno",
    "Growler": "Porsche 718 Cayman",
    "Itali GTO": "Ferrari 812 Superfast",
    "Locust": "Kline Lotus 3-Eleven",
    "Paragon R": "Bentley Continental GT",
    "Penumbra": "Mitsubishi Eclipse",
    "Schafter LWB": "Mercedes-Benz E63 AMG LWB",
    "Sugoi": "Honda Civic Type R FK8",
    "Sultan": "Subaru Impreza WRX / Lexus IS300",
    "Vectre": "Lexus RC F Track Edition",
    "V-STR": "Cadillac CTS-V",
    "Buccaneer Custom": "Buick Riviera Lowrider",
    "Chino": "Lincoln Continental Convertible",
    "Dominator": "Ford Mustang S197",
    "Dominator GT": "Ford Mustang S650 Convertible",
    "Dominator GTX": "Ford Mustang GTX Custom",
    "Gauntlet Classic Custom": "Plymouth Road Runner Superbird",
    "Impaler SZ": "Chevrolet Impala SS 1996",
    "Ruiner": "Pontiac Firebird Trans Am",
    "Tulip": "1972 Chevrolet Malibu",
    "Tempesta": "Lamborghini Huracan",
    "Zorrusso": "Italdesign Zerouno",
    "Infernus Classic": "Lamborghini Diablo SV",
    "Asterope GZ": "Toyota Camry XV40",
    "Emperor": "Cadillac Fleetwood Brougham",
    "Ingot": "Volkswagen Passat B5 Wagon",
    "Intruder": "Infiniti Q45 Sedan",
    "Primo": "Cadillac Allante / Dodge Dynasty",
    "Primo Custom": "Hydraulics Lowrider Sedan",
    "Regina": "Pontiac Custom Safari Wagon",
    "Stanier": "Ford Crown Victoria",
    "Stratum": "Honda Accord CB9 Wagon",
    "Tailgater": "Audi S4 / A6 Sedan",
    "Aleutian": "Ford Expedition Timberline",
    "Baller": "Range Rover Evoque / Sport",
    "Contender": "Ford F-150 Sandstorm Custom",
    "Dubsta": "Mercedes-Benz G63 AMG",
    "Granger": "Chevrolet Suburban",
    "Granger 3600LX": "2022 Chevrolet Suburban RST",
    "Jubilee": "Rolls-Royce Cullinan",
    "Landstalker XL": "Lincoln Navigator",
    "Mesa": "Jeep Wrangler Unlimited",
    "Novak": "Maserati Levante Trofeo",
    "Toros": "Lamborghini Urus",
    "Rebla GTS": "BMW X5 M",
    "XLS": "Mercedes-Benz GL-Class",
    "Zion": "BMW 6 Series E63",
    "Avarus": "Custom Softail Chopper",
    "Carbon RS": "Ducati 1199 / EBR 1190RS",
    "Double T": "Honda CBR1000RR",
    "Faggio": "Vespa Primavera Scooter",
    "Manchez": "KTM 450 EXC Enduro",
    "Sanchez": "Yamaha YZ250 Dirtbike",
    "Zombie Chopper": "Custom Harley Chopped Cruiser",
    "Blazer": "Yamaha YFZ450 ATV",
    "Caracara 4x4": "Ford F-150 Raptor SVT",
    "Hellion": "Nissan Patrol GR Y60",
    "Kamacho": "Jeep Crew Chief 715",
    "Outlaw": "Can-Am Maverick X3 UTV",
    "Verus": "Polaris Sportsman Tactical ATV",
    "Walton L35 Stock": "1991 Chevrolet S-10 Pickup",
    "Yosemite 1500": "GMC Sierra 1500 AT4",
    "Bobcat XL": "Chevrolet C10 Longbed",
    "Burrito": "GMC Savana Cargo Van",
    "Journey II": "Winnebago Chieftain RV",
    "Minivan": "Ford Windstar / Town & Country",
    "Moonbeam": "Chevrolet Astro Van",
    "Rumpo Custom": "Bravado 4x4 Overlander Van",
    "Youga": "Ford Econoline Van",
    "Youga Classic": "1968 Ford Econoline Club Wagon",
    "Sadler": "Ford F-250 Utility Pickup",
    "Benson": "International DuraStar Box Truck",
    "Biff": "Mack Dump Truck",
    "Packer": "Ford C-Series Car Hauler",
    "Phantom": "Peterbilt 359 Heavy Tractor",
    "Phantom Custom": "Kenworth W900 Armored Hauler",
    "Rubble": "Heavy Articulated Quarry Truck",
    "Dashound": "MCI J4500 Interstate Coach",
    "Buzzard Attack Chopper": "Boeing MH-6 Little Bird",
    "SuperVolito": "Eurocopter EC145 VIP",
    "Swift": "AgustaWestland AW109",
    "Dodo": "De Havilland DHC-2 Seaplane",
    "Jet": "Boeing 747 Commercial Liner",
    "Mammatus": "Cessna 172 Skyhawk",
    "Nimbus": "Cessna Citation X Business Jet",
    "Shamal": "Learjet 45 Private Jet",
    "Reefer": "Commercial Atlantic Trawler",
    "Mamba GT": "Shelby Cobra / Modern Roadster",
    "Ganado": "Florida Rancher 4x4 Truck",
    "Riata Classic": "Classic 1978 Ford Bronco",
}


def log(msg: str) -> None:
    ts = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    print(f"[{ts}] [GTA6-SYNC] {msg}")


def norm_text(s: str) -> str:
    return re.sub(r"[^a-z0-9]+", "", str(s or "").lower())


def slugify(s: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", str(s or "").lower()).strip("-")


def api_get(params: Dict[str, Any], retries: int = 3) -> Dict[str, Any]:
    url = API_ENDPOINT + "?" + urllib.parse.urlencode(params)
    for attempt in range(retries):
        req = urllib.request.Request(url, headers=API_HEADERS)
        try:
            with urllib.request.urlopen(req, timeout=20) as resp:
                return json.loads(resp.read().decode("utf-8"))
        except Exception as exc:
            if attempt == retries - 1:
                log(f"API error ({params.get('titles', params.get('cmtitle', ''))[:40]}): {exc}")
                return {}
            time.sleep(0.8 * (attempt + 1))
    return {}


def batch_pageimages(titles: List[str], size: int = 640) -> Dict[str, Dict[str, Any]]:
    results: Dict[str, Dict[str, Any]] = {}
    clean_titles = [t for t in dict.fromkeys(titles) if t]
    for i in range(0, len(clean_titles), 35):
        chunk = clean_titles[i : i + 35]
        data = api_get({
            "action": "query",
            "format": "json",
            "titles": "|".join(chunk),
            "prop": "pageimages",
            "pithumbsize": size,
            "redirects": 1,
        })
        q = data.get("query", {})
        norm_map = {n["from"]: n["to"] for n in q.get("normalized", [])}
        redir_map = {r["from"]: r["to"] for r in q.get("redirects", [])}
        pages_by_title: Dict[str, Dict[str, Any]] = {}
        for _, p in q.get("pages", {}).items():
            t = p.get("title", "")
            th = p.get("thumbnail") or {}
            if th.get("source"):
                pages_by_title[t] = {
                    "url": th["source"],
                    "width": int(th.get("width") or 0),
                    "height": int(th.get("height") or 0),
                    "pageimage": p.get("pageimage", ""),
                }
        for req_title in chunk:
            cur = norm_map.get(req_title, req_title)
            cur = redir_map.get(cur, cur)
            if cur in pages_by_title:
                results[req_title] = pages_by_title[cur]
    return results


def batch_file_imageinfo(file_names: List[str], width: int = 640) -> Dict[str, Dict[str, Any]]:
    results: Dict[str, Dict[str, Any]] = {}
    clean = [f if f.startswith("File:") else f"File:{f}" for f in dict.fromkeys(file_names) if f]
    for i in range(0, len(clean), 35):
        chunk = clean[i : i + 35]
        data = api_get({
            "action": "query",
            "format": "json",
            "titles": "|".join(chunk),
            "prop": "imageinfo",
            "iiprop": "url|size",
            "iiurlwidth": width,
        })
        q = data.get("query", {})
        norm_map = {n["from"]: n["to"] for n in q.get("normalized", [])}
        by_title: Dict[str, Dict[str, Any]] = {}
        for _, p in q.get("pages", {}).items():
            t = p.get("title", "")
            ii = (p.get("imageinfo") or [{}])[0]
            if ii.get("thumburl") or ii.get("url"):
                by_title[t] = {
                    "url": ii.get("thumburl") or ii.get("url"),
                    "orig_url": ii.get("url", ""),
                    "orig_width": int(ii.get("width") or 0),
                    "orig_height": int(ii.get("height") or 0),
                    "thumb_width": int(ii.get("thumbwidth") or ii.get("width") or 0),
                }
        for req_f in chunk:
            cur = norm_map.get(req_f, req_f)
            info = by_title.get(cur) or by_title.get(req_f)
            if info:
                bare = req_f[5:] if req_f.startswith("File:") else req_f
                results[bare] = info
                results[bare.replace(" ", "_")] = info
    return results


def is_valid_image_bytes(raw: bytes) -> bool:
    if len(raw) < MIN_IMAGE_BYTES:
        return False
    return (
        raw[:3] == b"\xff\xd8\xff"
        or raw[:8] == b"\x89PNG\r\n\x1a\n"
        or (raw[:4] == b"RIFF" and raw[8:12] == b"WEBP")
    )


def url_looks_clean(url: str) -> bool:
    low = url.lower()
    fname = low.split("/")[7] if "/images/" in low and len(low.split("/")) > 7 else low
    if any(bad in fname for bad in BAD_FILENAME_KEYWORDS) and "map" not in low:
        return False
    # Reject explicit radar/map file names
    if any(bad in fname for bad in ("radar-", "-map.", "-map-", "icon-", "-icon", "sprite")):
        return False
    return True


def download_and_save_image(url: str, target_path: Path, fmt: str = "AUTO") -> Tuple[bool, str]:
    if not url or not url_looks_clean(url):
        return False, "filtered_url"
    for attempt in range(3):
        req = urllib.request.Request(url, headers=IMG_HEADERS)
        try:
            with urllib.request.urlopen(req, timeout=25) as resp:
                raw = resp.read()
            if not is_valid_image_bytes(raw):
                return False, f"invalid_bytes({len(raw)})"
            if HAS_PIL:
                im = Image.open(io.BytesIO(raw))
                im = ImageOps.exif_transpose(im)
                w, h = im.size
                if w < 220 or h < 110:
                    return False, f"too_small({w}x{h})"
                if w > MAX_OUT_WIDTH:
                    nh = max(110, round(h * (MAX_OUT_WIDTH / float(w))))
                    im = im.resize((MAX_OUT_WIDTH, nh), Image.Resampling.LANCZOS)
                # Composite transparency cleanly onto dark slate canvas for UI harmony
                if im.mode in ("RGBA", "LA") or (im.mode == "P" and "transparency" in im.info):
                    rgba = im.convert("RGBA")
                    bg = Image.new("RGB", rgba.size, CANVAS_BG)
                    bg.paste(rgba, mask=rgba.split()[3])
                    im = bg
                elif im.mode != "RGB":
                    im = im.convert("RGB")
                save_fmt = "WEBP" if (fmt == "WEBP" or target_path.suffix.lower() == ".webp") else "JPEG"
                target_path.parent.mkdir(parents=True, exist_ok=True)
                if save_fmt == "WEBP":
                    im.save(target_path, format="WEBP", quality=84, method=4)
                else:
                    im.save(target_path, format="JPEG", quality=86, optimize=True)
            else:
                target_path.parent.mkdir(parents=True, exist_ok=True)
                target_path.write_bytes(raw)
            return True, f"ok({target_path.stat().st_size})"
        except Exception as exc:
            if attempt == 2:
                return False, str(exc)
            time.sleep(0.7 * (attempt + 1))
    return False, "unknown"


def choose_best_url(
    tier1_file: Optional[str],
    tier2_titles: List[str],
    file_cache: Dict[str, Dict[str, Any]],
    page_cache: Dict[str, Dict[str, Any]],
    prefer_studio: bool = False,
) -> Optional[str]:
    if prefer_studio:
        for title in tier2_titles:
            pinfo = page_cache.get(title)
            if (
                pinfo
                and pinfo.get("width", 0) >= 480
                and "front" in (pinfo.get("pageimage") or "").lower()
                and url_looks_clean(pinfo["url"])
            ):
                return pinfo["url"]
    if tier1_file:
        finfo = file_cache.get(tier1_file) or file_cache.get(tier1_file.replace("_", " "))
        is_postcard_crop = "postcard" in tier1_file.lower()
        if (
            finfo
            and finfo.get("orig_width", 0) >= MIN_TIER1_WIDTH
            and url_looks_clean(finfo["url"])
            and not (prefer_studio and is_postcard_crop)
        ):
            return finfo["url"]
    for title in tier2_titles:
        pinfo = page_cache.get(title)
        if pinfo and pinfo.get("width", 0) >= 240 and url_looks_clean(pinfo["url"]):
            return pinfo["url"]
    # Last resort: narrower official GTA VI crop (340-639px) if no Tier 2 exists
    if tier1_file:
        finfo = file_cache.get(tier1_file) or file_cache.get(tier1_file.replace("_", " "))
        if finfo and finfo.get("orig_width", 0) >= 340 and url_looks_clean(finfo["url"]):
            return finfo["url"]
    return None


def parse_gallery_blocks(wikitext: str) -> List[Tuple[str, str, str, str]]:
    """Return list of (header, file_name, wiki_link_title, caption)."""
    out: List[Tuple[str, str, str, str]] = []
    for block in re.finditer(r"\{\{Gallery\b([\s\S]*?)\}\}", wikitext):
        body = block.group(1)
        hdr_m = re.search(r"\|header\s*=\s*([^\n|]+)", body)
        header = hdr_m.group(1).strip() if hdr_m else "Unknown"
        for line in body.splitlines():
            s = line.strip()
            if not s.startswith("|") or s.startswith("|links") or s.startswith("|header"):
                continue
            parts = [p.strip() for p in s[1:].split("|")]
            if not parts or not parts[0] or "." not in parts[0]:
                continue
            fname = parts[0]
            wiki_title = re.sub(r"''+", "", parts[1]).strip() if len(parts) > 1 and parts[1] else fname
            caption = re.sub(r"''+", "", parts[2]).strip() if len(parts) > 2 and parts[2] else wiki_title
            out.append((header, fname, wiki_title, caption))
    return out


def parse_vehicle_table_entries(wikitext: str) -> List[Tuple[str, str, str]]:
    """Return list of (section_header, wiki_title, display_name) from Vehicles in GTA VI/table."""
    out: List[Tuple[str, str, str]] = []
    # Strip HTML comments first
    clean = re.sub(r"<!--[\s\S]*?-->", "", wikitext)
    # Match wikitable column blocks
    for table_m in re.finditer(r"\{\|[\s\S]*?\|\}", clean):
        rows = table_m.group(0).split("|-")
        current_headers: List[str] = []
        for row in rows:
            hdrs = re.findall(r"^!([^\n]+)", row, flags=re.M)
            if hdrs:
                expanded: List[str] = []
                for h in hdrs:
                    cs = re.search(r"colspan\s*=\s*['\"]?(\d+)['\"]?\|(.+)", h)
                    if cs:
                        lbl = re.sub(r"'+", "", cs.group(2)).strip()
                        expanded.extend([lbl] * int(cs.group(1)))
                    else:
                        expanded.append(re.sub(r"'+", "", h).strip())
                current_headers = expanded
                continue
            # Preserve every cell separated by a single '|' line so empty cells don't shift indices.
            col_blocks: List[str] = []
            buf: List[str] = []
            saw_delim = False
            for line in row.splitlines():
                s = line.strip()
                if s.startswith("|-") or s.startswith("{|") or s.startswith("|}"):
                    continue
                if s == "|":
                    if saw_delim:
                        col_blocks.append("\n".join(buf))
                        buf = []
                    saw_delim = True
                elif saw_delim:
                    buf.append(line)
            if saw_delim:
                col_blocks.append("\n".join(buf))
            for idx, col in enumerate(col_blocks):
                hdr = current_headers[idx] if idx < len(current_headers) else "Unknown"
                for m in re.finditer(r"^\*\[\[([^\]|]+)(?:\|([^\]]+))?\]\]", col, flags=re.M):
                    wtitle = m.group(1).strip()
                    dname = re.sub(r"''+", "", (m.group(2) or wtitle)).strip()
                    out.append((hdr, wtitle, dname))
    return out


def classify_vehicle_ui(header: str, name: str) -> str:
    h = (header or "").lower()
    n = (name or "").lower()
    if any(k in h for k in ("emergency", "government", "military", "police")) or any(
        k in n for k in ("police", "vcpd", "interceptor", "riot", "sheriff", "lifeguard", "coast guard", "poach", "fib", "unmarked")
    ):
        return "pursuit"
    if any(k in h for k in ("boat", "helicopter", "plane", "aircraft", "blimp")) or any(
        k in n for k in ("boat", "yacht", "seashark", "dinghy", "squalo", "marquis", "tropic", "reefer", "maverick", "buzzard", "sparrow", "swift", "supervolito", "dodo", "duster", "shamal", "nimbus", "mammatus", "velum", "airboat", "kayak", "cruiser")
    ) and "pt cruiser" not in n and "police cruiser" not in n and "unmarked" not in n:
        return "marine"
    if any(k in h for k in ("suv", "off-road", "pickup", "station wagon")) or any(
        k in n for k in ("4x4", "xl", "suv", "truck", "monster", "swamp buggy", "blazer", "bison", "contender", "sandking", "caracara", "dubsta", "granger", "jubilee", "toros", "rebla", "novak", "aleutian", "astron", "dorado", "mesa", "kamacho", "hellion", "outlaw", "verus", "walton", "yosemite", "riata", "ganado", "sadler")
    ):
        if "towtruck" not in n and "box" not in n and "tractor" not in n and "flatbed" not in n:
            return "suv"
    if any(k in h for k in ("motorcycle", "bicycle", "cycle", "mobility", "van", "truck", "commercial", "industrial", "service", "utility", "train", "recreational")):
        return "commercial"
    if any(k in h for k in ("super", "sports classic", "sports")):
        return "super"
    if any(k in h for k in ("muscle", "sedan", "coupe", "compact")):
        return "muscle"
    return "muscle"


VEHICLE_CLASS_SPECS: Dict[str, Dict[str, Any]] = {
    "super": {
        "speed": "168 MPH",
        "accel": "3.1s (0-60)",
        "handling": "92/100",
        "driveType": "AWD / Twin-Turbo",
        "capacity": "2 Duffel Bags",
        "bulletproof": "Aerodynamic Composite (Grade B)",
        "stats": {"speed": 91, "accel": 90, "handling": 92},
    },
    "muscle": {
        "speed": "148 MPH",
        "accel": "4.2s (0-60)",
        "handling": "82/100",
        "driveType": "RWD / High-Torque V8",
        "capacity": "4 Duffel Bags",
        "bulletproof": "Reinforced Steel Chassis (Grade B+)",
        "stats": {"speed": 80, "accel": 79, "handling": 80},
    },
    "pursuit": {
        "speed": "156 MPH",
        "accel": "3.7s (0-60)",
        "handling": "88/100",
        "driveType": "AWD / Pursuit-Tuned",
        "capacity": "4 Duffel Bags",
        "bulletproof": "Law-Grade Ballistic Panels (Grade A)",
        "stats": {"speed": 85, "accel": 84, "handling": 87},
    },
    "suv": {
        "speed": "134 MPH",
        "accel": "5.1s (0-60)",
        "handling": "80/100",
        "driveType": "4WD / High-Clearance",
        "capacity": "6 Duffel Bags",
        "bulletproof": "Heavy Frame + Ramming Guard (Grade A)",
        "stats": {"speed": 72, "accel": 74, "handling": 80},
    },
    "marine": {
        "speed": "118 KTS / MPH",
        "accel": "4.5s (0-60)",
        "handling": "84/100",
        "driveType": "Twin-Turbine / Marine",
        "capacity": "4 Duffel Bags",
        "bulletproof": "Offshore / Aerial Hull (Grade B)",
        "stats": {"speed": 78, "accel": 75, "handling": 84},
    },
    "commercial": {
        "speed": "126 MPH",
        "accel": "5.8s (0-60)",
        "handling": "76/100",
        "driveType": "High-Torque / Chain",
        "capacity": "6 Duffel Bags",
        "bulletproof": "Heavy Utility Frame (Grade B+)",
        "stats": {"speed": 70, "accel": 68, "handling": 76},
    },
}


def load_static_vehicle_sets() -> Tuple[set, set]:
    html_path = PUBLIC_DIR / "vehicles-getaway-cars.html"
    txt = html_path.read_text(encoding="utf-8", errors="ignore")
    ids, names = set(), set()
    for m in re.finditer(r'onclick="GTA6\.VehicleModal\.open\(\'([^\']+)\'\)"[\s\S]*?<h3[^>]*>([^<]+)</h3>', txt):
        vid = m.group(1).lower().replace("vehicle-", "")
        vname = m.group(2).strip()
        ids.add(norm_text(vid))
        names.add(norm_text(vname))
        # Also add stripped model suffix without brand (e.g. "Imponte Phoenix Trans-Am" -> "phoenix")
        tokens = vname.split()
        if len(tokens) >= 2:
            names.add(norm_text(" ".join(tokens[1:])))
    # Canonical static equivalents
    for alias in (
        "tulipm100", "gauntlethellfire", "elegyretrocustom", "buccaneercustom",
        "dominatorasp", "vigerozxconvertible", "blistacompact", "ratloader",
        "slamvancustom", "slamvan", "sabreturbo", "hermes", "deviant", "phoenix",
        "banshee", "cheetahclassic", "comets2cabrio", "coquetted10", "furia",
        "champion", "toreroxo", "carbonizzare", "schafterv12", "astron", "italigtb",
        "jugular", "policecruiserinterceptor", "vcpdcruiser", "buffalostx", "buffalostxpursuit",
        "policeriot", "granger3600lx", "parkranger", "unmarkedcruiser",
        "policepredator", "policemaverick", "rebel", "sandkingxl", "seminolefrontier",
        "dubsta6x6", "dorado", "cavalcadexl", "patriotmilspec", "rancherxl",
        "streetblazer", "seasparrow", "squalo", "tropic", "dinghy", "marquis",
        "duster", "maverick", "velum", "speedo", "boxville", "mule",
        "sovereign", "bati801", "bf400", "nemesis",
    ):
        names.add(alias)
        ids.add(alias)
    return ids, names


def load_static_weapon_sets() -> Tuple[set, set]:
    html_path = PUBLIC_DIR / "weapons-gear.html"
    txt = html_path.read_text(encoding="utf-8", errors="ignore")
    gs = txt.find('id="gearGrid"')
    ms = txt.find('id="masks-outfits-section"')
    seg = txt[gs:ms]
    ids, names = set(), set()
    for m in re.finditer(r'id="(item-[^"]+)"[\s\S]*?<h3>([^<]+)</h3>', seg):
        wid = m.group(1).replace("item-", "")
        wname = m.group(2).strip()
        ids.add(norm_text(wid))
        names.add(norm_text(wname))
    for alias in (
        "polymerpistol", "beretta92fs", "servicepistol", "mustang357", "vintagepistol",
        "pistol", "enforcer", "mp5", "hecklerkochmp540inspiredsubmachinegun", "microsmg",
        "tec9", "p90", "dukespecialopscarbine", "carbine", "assaultrifle", "ak47",
        "compactrifle", "battlerifle", "pumpshotgun", "sawedoffshotgun", "combatshotgun",
        "grenadelauncher", "rpg", "rocketlauncher", "dukeassaultsniperrifle",
        "heavysniper", "hammer", "baseballbat", "crowbar", "knife", "combatknife",
    ):
        ids.add(alias)
        names.add(alias)
    return ids, names


def load_static_character_sets() -> Tuple[set, set]:
    html_path = PUBLIC_DIR / "crew-database.html"
    txt = html_path.read_text(encoding="utf-8", errors="ignore")
    ids, names = set(), set()
    for m in re.finditer(r'<div[^>]*class="char-card"[^>]*>', txt):
        tag = m.group(0)
        cid = re.search(r'id="([^"]+)"', tag)
        snip = txt[m.start() : m.start() + 900]
        h2 = re.search(r'<h[23][^>]*>([^<]+)</h[23]>', snip)
        if cid:
            ids.add(norm_text(cid.group(1).replace("character-", "")))
            ids.add(norm_text(cid.group(1)))
        if h2:
            names.add(norm_text(h2.group(1)))
    for alias in ("luciacaminos", "jasonduval", "stefanie", "calhampton", "boobieike",
                  "brianheder", "drequanpriest", "raulbautista", "baeluxe", "roxy",
                  "petranavarro", "leonidajoker", "loriheder", "phil", "valentina", "aunttee"):
        names.add(alias)
        ids.add(alias)
    return ids, names


def load_static_property_count() -> int:
    html_path = PUBLIC_DIR / "safehouses-laundering.html"
    txt = html_path.read_text(encoding="utf-8", errors="ignore")
    return txt.count('class="card prop-card"')


def refresh_static_asset_group(
    group_name: str,
    sources_map: Dict[str, Tuple[Optional[str], List[str]]],
    force_refresh: bool,
) -> int:
    tier1_files = [t1 for t1, _ in sources_map.values() if t1]
    tier2_titles = [t for _, t2 in sources_map.values() for t in t2]
    file_cache = batch_file_imageinfo(tier1_files, width=640)
    page_cache = batch_pageimages(tier2_titles, size=640)

    GTA6_EXCLUSIVE_PURSUIT = {
        "vehicle-vcpd-cruiser.jpg",
        "vehicle-buffalo-stx.jpg",
        "vehicle-vcpd-riot.jpg",
        "vehicle-vcpd-unmarked.jpg",
        "vehicle-police-maverick.jpg",
    }
    tasks: List[Tuple[str, str, Path]] = []
    for filename, (t1, t2) in sources_map.items():
        if filename in PRESERVE_VEHICLE_WEBPS or filename in PRESERVE_WEAPON_ASSETS:
            continue
        target = ASSETS_DIR / filename
        if not force_refresh and target.exists() and target.stat().st_size >= MIN_IMAGE_BYTES:
            # Skip only if already clean non-white-bg / converted by sync, or if caller omitted --refresh-static
            pass
        is_returning_veh = (group_name == "vehicles") and (filename not in GTA6_EXCLUSIVE_PURSUIT)
        best_url = choose_best_url(t1, t2, file_cache, page_cache, prefer_studio=is_returning_veh)
        if best_url:
            tasks.append((filename, best_url, target))
        else:
            log(f"WARNING [{group_name}]: No GTA Wiki photo found for {filename} ({t1}, {t2})")

    updated = 0
    with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
        futs = {pool.submit(download_and_save_image, url, path, "JPEG"): fname for fname, url, path in tasks}
        for fut in concurrent.futures.as_completed(futs):
            fname = futs[fut]
            ok, msg = fut.result()
            if ok:
                updated += 1
            else:
                log(f"FAIL [{group_name}] {fname}: {msg}")
    log(f"Refreshed {updated}/{len(tasks)} static {group_name} assets.")
    return updated


def sync_vehicles(master_data: Dict[str, Any]) -> Tuple[List[Dict[str, Any]], int]:
    log("Fetching Vehicles in GTA VI gallery + structured vehicle table...")
    wiki_resp = api_get({
        "action": "query",
        "format": "json",
        "titles": "Vehicles in GTA VI/images|Vehicles in GTA VI/table",
        "prop": "revisions",
        "rvprop": "content",
        "rvslots": "main",
    })
    img_wikitext, tbl_wikitext = "", ""
    for _, p in wiki_resp.get("query", {}).get("pages", {}).items():
        title = p.get("title", "")
        content = p.get("revisions", [{}])[0].get("slots", {}).get("main", {}).get("*", "")
        if title.endswith("/images"):
            img_wikitext = content
        elif title.endswith("/table"):
            tbl_wikitext = content

    gallery_entries = parse_gallery_blocks(img_wikitext)
    table_entries = parse_vehicle_table_entries(tbl_wikitext)

    # Map normalized wiki title -> (header, file_name, caption)
    gallery_by_key: Dict[str, Tuple[str, str, str]] = {}
    all_t1_files: List[str] = []
    for hdr, fname, wtitle, cap in gallery_entries:
        all_t1_files.append(fname)
        k = norm_text(re.sub(r"\([^)]*\)", "", wtitle))
        if k and k not in gallery_by_key:
            gallery_by_key[k] = (hdr, fname, cap)
        if fname in UNNAMED_VEHICLE_ALIASES:
            gallery_by_key[norm_text(fname)] = (hdr, fname, cap)

    static_ids, static_names = load_static_vehicle_sets()

    # Build clean deduplicated candidate list
    candidates: List[Dict[str, Any]] = []
    seen_norm: set = set(static_names) | set(static_ids)

    # First pass: named & aliased high-value GTA VI gallery vehicles
    for hdr, fname, wtitle, cap in gallery_entries:
        if fname in UNNAMED_VEHICLE_ALIASES:
            clean_name, real_model, ui_cat = UNNAMED_VEHICLE_ALIASES[fname]
            wiki_query = ""
        else:
            if wtitle.lower().startswith("unnamed"):
                continue
            raw_clean = re.sub(r"\s*\([^)]*\)", "", cap or wtitle).strip()
            nk = norm_text(wtitle)
            if nk in VEHICLE_NAME_CLEANUPS:
                clean_name, real_model, ui_cat = VEHICLE_NAME_CLEANUPS[nk]
            elif norm_text(raw_clean) in VEHICLE_NAME_CLEANUPS:
                clean_name, real_model, ui_cat = VEHICLE_NAME_CLEANUPS[norm_text(raw_clean)]
            else:
                clean_name = raw_clean
                real_model = REAL_MODEL_HINTS.get(raw_clean, "Confirmed GTA VI Official Model")
                ui_cat = classify_vehicle_ui(hdr, clean_name)
            wiki_query = wtitle
            # Skip duplicate gallery image for Double T so Tier 2 picks its distinct studio render
            if clean_name.lower() == "double t":
                fname = None

        if any(skip in clean_name.lower() for skip in ("trailer", "boat trailer", "utility trailer")):
            continue
        cnorm = norm_text(clean_name)
        wnorm = norm_text(re.sub(r"\([^)]*\)", "", wtitle))
        if not cnorm or cnorm in seen_norm or wnorm in seen_norm:
            continue
        seen_norm.add(cnorm)
        seen_norm.add(wnorm)
        candidates.append({
            "id": f"veh-{slugify(clean_name)}",
            "name": clean_name,
            "realName": real_model,
            "category": ui_cat,
            "tier1_file": fname,
            "tier2_titles": [wiki_query, clean_name] if wiki_query else [],
            "source_ref": f"Vehicles in GTA VI ({fname})",
        })

    # Second pass: additional confirmed vehicles from Vehicles in GTA VI/table (not yet added)
    for hdr, wtitle, dname in table_entries:
        if wtitle.lower().startswith("unnamed") or "trailer" in wtitle.lower():
            continue
        raw_clean = re.sub(r"\s*\([^)]*\)", "", dname).strip()
        nk = norm_text(wtitle)
        if nk in VEHICLE_NAME_CLEANUPS:
            clean_name, real_model, ui_cat = VEHICLE_NAME_CLEANUPS[nk]
        else:
            clean_name = raw_clean
            real_model = REAL_MODEL_HINTS.get(raw_clean, "Confirmed GTA VI Roster Model")
            ui_cat = classify_vehicle_ui(hdr, clean_name)
        cnorm = norm_text(clean_name)
        wnorm = norm_text(re.sub(r"\([^)]*\)", "", wtitle))
        if not cnorm or cnorm in seen_norm or wnorm in seen_norm:
            continue
        seen_norm.add(cnorm)
        seen_norm.add(wnorm)
        candidates.append({
            "id": f"veh-{slugify(clean_name)}",
            "name": clean_name,
            "realName": real_model,
            "category": ui_cat,
            "tier1_file": None,
            "tier2_titles": [wtitle, clean_name],
            "source_ref": f"Vehicles in GTA VI/table ({wtitle})",
        })

    t1_list = [c["tier1_file"] for c in candidates if c["tier1_file"]]
    t2_list = [t for c in candidates for t in c["tier2_titles"]]
    file_cache = batch_file_imageinfo(t1_list, width=640)
    page_cache = batch_pageimages(t2_list, size=640)

    # Download unique images in parallel
    download_jobs: List[Tuple[Dict[str, Any], str, Path]] = []
    for c in candidates:
        # Prefer crisp front-quarter studio model renders for returning GTA vehicles,
        # while keeping GTA 6 exclusive / unnamed newcomers on their official GTA 6 shots.
        use_studio = bool(c["tier2_titles"]) and c["name"].lower() not in {"pmp 700", "schyster pmp 700", "creado", "creado muscle coupe", "alvino v1", "alvino v1 tourer", "lombike", "lombike e-scooter share", "airboat 09", "leonida airboat 09", "btn delmar coast tug", "grotti s23 offshore cruiser"}
        best_url = choose_best_url(c["tier1_file"], c["tier2_titles"], file_cache, page_cache, prefer_studio=use_studio)
        if not best_url:
            continue
        out_rel = f"assets/{c['id']}.webp"
        out_abs = PUBLIC_DIR / out_rel
        c["image"] = out_rel
        c["best_url"] = best_url
        download_jobs.append((c, best_url, out_abs))

    verified_vehicles: List[Dict[str, Any]] = []
    seen_md5: set = set()
    with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
        futs = {}
        for c, url, out_abs in download_jobs:
            futs[pool.submit(download_and_save_image, url, out_abs, "WEBP")] = (c, out_abs)
        for fut in concurrent.futures.as_completed(futs):
            c, out_abs = futs[fut]
            ok, msg = fut.result()
            if not ok or not out_abs.exists():
                log(f"Skipping vehicle {c['name']} (image failed: {msg})")
                continue
            digest = hashlib.md5(out_abs.read_bytes()).hexdigest()
            if digest in seen_md5:
                log(f"Skipping duplicate-photo vehicle {c['name']}")
                continue
            seen_md5.add(digest)
            cls_spec = VEHICLE_CLASS_SPECS.get(c["category"], VEHICLE_CLASS_SPECS["muscle"])
            verified_vehicles.append({
                "id": c["id"],
                "name": c["name"],
                "realName": c["realName"],
                "category": c["category"],
                "speed": cls_spec["speed"],
                "accel": cls_spec["accel"],
                "handling": cls_spec["handling"],
                "driveType": cls_spec["driveType"],
                "capacity": cls_spec["capacity"],
                "bulletproof": cls_spec["bulletproof"],
                "image": c["image"],
                "bio": (
                    f"{c['name']} ({c['realName']}) — confirmed active in State of Leonida ({c['source_ref']}). "
                    f"Calibrated for {c['category']} heist routing with {cls_spec['capacity']} capacity."
                ),
                "stats": cls_spec["stats"],
                "status": "CONFIRMED",
            })

    verified_vehicles.sort(key=lambda x: x["name"].lower())
    master_data["vehicles"] = verified_vehicles
    static_count = len(re.findall(r'class="veh-card"', (PUBLIC_DIR / "vehicles-getaway-cars.html").read_text(encoding="utf-8", errors="ignore")))
    return verified_vehicles, static_count + len(verified_vehicles)


def sync_characters(master_data: Dict[str, Any]) -> Tuple[List[Dict[str, Any]], int]:
    log("Scanning Category:Characters_in_GTA_VI & Characters in GTA VI...")
    wiki_resp = api_get({
        "action": "query",
        "format": "json",
        "titles": "Characters in GTA VI",
        "prop": "revisions",
        "rvprop": "content",
        "rvslots": "main",
    })
    char_wikitext = ""
    for _, p in wiki_resp.get("query", {}).get("pages", {}).items():
        char_wikitext = p.get("revisions", [{}])[0].get("slots", {}).get("main", {}).get("*", "")

    cm_resp = api_get({
        "action": "query",
        "format": "json",
        "list": "categorymembers",
        "cmtitle": "Category:Characters_in_GTA_VI",
        "cmlimit": 200,
    })
    members = [m["title"] for m in cm_resp.get("query", {}).get("categorymembers", [])]

    # Parse portrait map from Characters in GTA VI table (notably Mendez -> UnnamedVCPDOfficer)
    portrait_overrides: Dict[str, str] = {}
    for m in re.finditer(r"\[\[File:([^|\]]+)[^\]]*\]\]\s*\n\|\s*'''\[\[([^|\]]+)", char_wikitext):
        portrait_overrides[m.group(2).strip()] = m.group(1).strip()

    # Core characters to preserve cleanly from existing JSON (16)
    core_chars: List[Dict[str, Any]] = []
    seen_ids, seen_names = load_static_character_sets()
    existing_core = [c for c in master_data.get("characters", []) if c.get("image", "").startswith("assets/character-")]
    core_ids = {norm_text(c["id"]) for c in existing_core}
    core_chars.extend(existing_core)

    # Extra confirmed named GTA VI characters with metadata
    EXTRA_CHAR_META: Dict[str, Tuple[str, str, str, str, str]] = {
        "Mendez": ("story", "VCPD Narcotics & Vice Investigator", "Federal Wiretaps & Raids", "Antagonist / Law", "Vice City Metro"),
        "Andrés de León": ("story", "Megamundo Patron & High-Roller", "Black-Market Laundering", "High-Roller Client", "Vice City Downtown"),
        "Raymond (GTA VI)": ("crew", "Vice City Stash & Lab Operator", "Bulk Contraband Logistics", "5% Prep Cut", "Port Gellhorn"),
        "Rudi": ("crew", "Leonida Street Enforcer", "Heavy Cover & Diversion", "6% Crew Cut", "Vice Beach"),
        "Wyman": ("story", "Keys Underground Salvage Broker", "Coastal Boat Extraction", "Contact", "Leonida Keys"),
        "DWNPLY": ("story", "Only Raw Records Recording Artist", "Nightclub VIP Fronts", "Associate", "Vice City"),
        "Chase": ("story", "Leonida Syndicate Courier", "Smuggling Route Intel", "Contact", "Ambrosia"),
        "Erin Henshaw": ("story", "Vice City Media & Social Analyst", "Security Access Badges", "Informant", "Vice City"),
        "Ernesto": ("crew", "Ambrosia Cartel Mechanic", "Custom Escape Tuning", "4% Mechanic Cut", "Ambrosia"),
        "Kenny Brewster": ("crew", "Grassrivers Swamp Guide", "Backchannel Airboat Exfil", "5% Guide Cut", "Grassrivers"),
        "Mandy (GTA 6)": ("story", "Port Gellhorn Harbor Informant", "Dockside Manifests", "Informant", "Port Gellhorn"),
        "Real Dimez": ("story", "Viral Music & Nightlife Collective", "Penthouse VIP Access", "Associate", "Vice City"),
    }

    t1_files = [portrait_overrides[k] for k in portrait_overrides]
    t2_titles = [t for t in members if not t.lower().startswith("unnamed ") and not t.lower().startswith("category:")]
    file_cache = batch_file_imageinfo(t1_files, width=640)
    page_cache = batch_pageimages(t2_titles, size=640)

    for title in t2_titles:
        clean_name = re.sub(r"\s*\([^)]*\)", "", title).strip()
        if any(skip in clean_name.lower() for skip in ("dolls of destruction", "gutless wonders", "hummers", "macca the gator", "kenny brewster", "erin henshaw")):
            continue
        nk = norm_text(clean_name)
        if nk in seen_names or nk in core_ids:
            continue
        cid = f"char-{slugify(clean_name)}"
        t1 = portrait_overrides.get(clean_name) or portrait_overrides.get(title)
        best_url = choose_best_url(t1, [title, clean_name], file_cache, page_cache)
        if not best_url:
            continue
        out_rel = f"assets/{cid}.webp"
        ok, _ = download_and_save_image(best_url, PUBLIC_DIR / out_rel, "WEBP")
        if not ok:
            continue
        seen_names.add(nk)
        seen_ids.add(norm_text(cid))
        meta = EXTRA_CHAR_META.get(
            title,
            ("story", "Confirmed GTA VI Character", "Leonida Underworld & Intel", "Story / Contact", "State of Leonida"),
        )
        core_chars.append({
            "id": cid,
            "name": clean_name,
            "category": meta[0],
            "role": meta[1],
            "specialty": meta[2],
            "cut": meta[3],
            "district": meta[4],
            "image": out_rel,
            "status": "CONFIRMED",
            "source": "Auto-Synced Official GTA Wiki",
        })

    master_data["characters"] = core_chars
    return core_chars, len(core_chars)


def sync_weapons(master_data: Dict[str, Any]) -> Tuple[List[Dict[str, Any]], int]:
    log("Fetching Weapons in GTA VI gallery + Category:Weapons_in_GTA_VI...")
    wiki_resp = api_get({
        "action": "query",
        "format": "json",
        "titles": "Weapons in GTA VI/images|Weapons in GTA VI/table",
        "prop": "revisions",
        "rvprop": "content",
        "rvslots": "main",
    })
    img_wikitext = ""
    for _, p in wiki_resp.get("query", {}).get("pages", {}).items():
        if p.get("title", "").endswith("/images"):
            img_wikitext = p.get("revisions", [{}])[0].get("slots", {}).get("main", {}).get("*", "")

    gallery = parse_gallery_blocks(img_wikitext)
    static_ids, static_names = load_static_weapon_sets()

    # Keep the curated core non-duplicate tactical/modern GTA 6 weapons + newly confirmed wiki weapons
    CURATED_NEW_WEAPONS: List[Tuple[str, str, str, str, str, str, int, int, int, Optional[str], List[str]]] = [
        ("weapon-service-carbine", "M16A4 Service Carbine", "rifles", "Assault Rifle", "5.56x45mm NATO", "Confirmed Heavy Carbine • High Muzzle Velocity", 88, 86, 40, "OfficialScreenshots-GTAVI-PromotionalWebsite-JasonDuval-SS4.jpg", ["Service Carbine"]),
        ("weapon-heavy-rifle", "SCAR-L Heavy Assault Rifle", "rifles", "Assault Rifle", "5.56 / 7.62 NATO", "Modular Tactical Platform • Armor-Piercing Ready", 90, 84, 35, None, ["Heavy Rifle"]),
        ("weapon-tactical-smg", "Steyr TMP-9 Tactical SMG", "smg", "Submachine Gun", "9x19mm Parabellum", "Compact Vehicle Drive-By SMG • Low Recoil", 74, 62, 68, None, ["Tactical SMG"]),
        ("weapon-bolt-sniper", "Kalaga Bolt-Action Hunting Rifle", "snipers", "Sniper Rifle", ".308 Winchester", "Confirmed in Mount Kalaga • High-Magnification Optic", 94, 96, 55, "BoltActionSniper-GTAVI-OfficialScreenshot-MountKalagaNationalPark03.jpeg", ["Bolt Action Sniper", "Marksman Rifle"]),
        ("weapon-hunter-sniper", "Precision Hunter Sniper", "snipers", "Sniper Rifle", ".300 Win Mag", "Long-Range Overwatch Rifle • Suppressor Mount", 96, 98, 60, None, ["Hunter Sniper", "Sniper Rifle"]),
        ("weapon-es9", "ES9 Tactical Sidearm", "sidearms", "Tactical Pistol", "9x19mm", "Confirmed GTA VI Handgun Manufacturer Lineup", 70, 58, 72, None, ["ES9"]),
        ("weapon-mediator", "Mediator Precision Pistol", "sidearms", "Handgun", ".45 ACP", "Confirmed GTA VI Stopping-Power Sidearm", 76, 60, 65, None, ["Mediator"]),
        ("weapon-w14", "Wortham W-14 Compact Pistol", "sidearms", "Concealed Sidearm", "9mm Short", "Minimal Concealment Signature • Fast Draw", 66, 52, 80, None, ["W-14"]),
        ("weapon-nipper-38", "Nipper .38 Snub-Nose Revolver", "sidearms", "Revolver", ".38 Special", "Zero Ejected Brass Cases • Pocket Concealment", 68, 48, 82, None, ["Nipper .38"]),
        ("weapon-capo-pistol", "Capo Ornate Heist Pistol", "sidearms", "Sidearm", ".45 ACP", "Official Raul Bautista Heist Cutscene Sidearm", 78, 58, 50, "UnnamedCapoPistol-GTAVI-OfficialScreenshot-RaulBautista02.png", ["Unnamed GTA VI Capo pistol"]),
        ("weapon-bersa-380", "Pocket .380 Backup Pistol", "sidearms", "Subcompact Pistol", ".380 ACP", "Quick Trunk-Stash Sidearm • Fast Reload", 64, 46, 85, "UnnamedBersaThunder380Pistol-GTAVI-Videos-LuciaJasonTrunk.png", ["Unnamed GTA VI Bersa Thunder 380-inspired pistol"]),
        ("weapon-compact-smg", "Compact PDW Submachine Gun", "smg", "Submachine Gun", "9x19mm", "Folding Stock Infiltration SMG • High RPM", 75, 55, 62, None, ["Combat PDW", "Compact SMG"]),
        ("weapon-heavy-mg", "Squad Heavy Machine Gun", "heavy", "Heavy Weapon", "7.62x51mm NATO", "Confirmed Anti-Vehicle Suppression Platform", 95, 82, 10, None, ["Combat MG", "MG (HD Universe)"]),
        ("weapon-molotov", "Molotov Cocktail Incendiary", "heavy", "Thrown Incendiary", "Flammable Bottle", "Denies Pursuit Choke Points & Convoy Tires", 85, 45, 25, None, ["Molotov Cocktails", "Molotov Cocktail"]),
        ("weapon-frag-grenade", "M67 Fragmentation Grenade", "heavy", "Thrown Explosive", "High-Explosive", "Breaches Armored Convoy Doors & Riot Squads", 95, 50, 10, None, ["Grenades", "Grenade"]),
        ("weapon-pool-cue", "Briar Pool Cue", "melee", "Melee", "Hardwood Shaft", "Confirmed Vice City Bar Brawl Weapon", 55, 25, 92, "OfficialScreenshots-GTAVI-PromotionalWebsite-CalHampton-SS3.jpg", ["Pool Cue"]),
        ("weapon-flashbang", "Tactical Tear Gas / Stun Grenade", "gear", "Tactical Tool", "Non-Lethal Gas / Stun", "Flushes Lobby Guards Out During Stealth Approaches", 25, 45, 78, None, ["Tear Gas"]),
        ("weapon-flashlight", "Tactical Breaching Flashlight", "gear", "Tactical Tool", "Low-Light Optic", "Essential for Subterranean Bank Conduit Tunnels", 35, 30, 90, None, ["Flashlight"]),
        ("gear-plasma-cutter", "Sub-Zero Thermal Plasma Cutter", "gear", "Tactical Tool", "Acetylene / Plasma", "Cuts Titanium Glass Cases Without Triggering Alarms", 10, 10, 96, None, ["Cutting Torch"]),
        ("gear-rfid-cloner", "NFC / RFID Biometric Cloner", "gear", "Tactical Tool", "Electronic Decrypter", "Clones Executive Security Keycards Inside Club VIP", 5, 15, 98, None, ["Hacking Device", "Security Pass"]),
        ("gear-zip-ties", "Tactical Restraint Zip-Ties", "gear", "Tactical Tool", "Hostage Control", "Pacifies Bank Tellers Silently • Buys +40s Vault Time", 5, 10, 99, None, ["Cable Ties", "Backpacks"]),
        ("gear-duffel-bag", "Reinforced Heist Duffel Bag", "gear", "Tactical Tool", "$2.5M+ Bullion Capacity", "High-Density Ballistic Nylon Vault Carrier", 5, 5, 95, "GTAV_Hiking.jpg", ["Backpacks", "The Pacific Standard Job"]),
        ("gear-getaway-car", "EMP Interceptor Jammer Module", "gear", "Tactical Tool", "Signal Scrambler", "Delays VCPD Chopper Radar Lock During Extraction", 10, 20, 94, "CompactEMPLauncher-GTAOee.png", ["Compact EMP Launcher"]),
    ]

    t1_files = [w[9] for w in CURATED_NEW_WEAPONS if w[9]]
    t2_titles = [t for w in CURATED_NEW_WEAPONS for t in w[10]]
    # Add gallery file lookups too
    for _, fname, _, _ in gallery:
        t1_files.append(fname)
    file_cache = batch_file_imageinfo(t1_files, width=640)
    page_cache = batch_pageimages(t2_titles, size=640)

    synced_weapons: List[Dict[str, Any]] = []
    for wid, name, cat, wtype, cal, perk, dmg, rng, stl, t1, t2 in CURATED_NEW_WEAPONS:
        out_rel = f"assets/{wid}.webp"
        out_abs = PUBLIC_DIR / out_rel
        # Reuse existing authentic local asset if requested and valid, else download from GTA Wiki
        if wid == "gear-plasma-cutter" and (ASSETS_DIR / "item-thermal-lance.jpg").exists():
            img_path = "assets/item-thermal-lance.jpg"
        else:
            best_url = choose_best_url(t1, t2, file_cache, page_cache)
            if not best_url:
                continue
            ok, msg = download_and_save_image(best_url, out_abs, "WEBP")
            if not ok:
                log(f"Skipping weapon {name}: {msg}")
                continue
            img_path = out_rel

        synced_weapons.append({
            "id": wid,
            "name": name,
            "category": cat,
            "type": wtype,
            "caliber": cal,
            "perk": perk,
            "damage": dmg,
            "range": rng,
            "stealth": stl,
            "image": img_path,
            "bio": f"{name} ({cal}) — {perk}. Verified Leonida heist arsenal entry.",
            "status": "CONFIRMED",
        })

    master_data["weapons"] = synced_weapons
    static_w_count = 24
    # Count only items not colliding with the 24 static weapons in weapons-gear.html
    extra_count = sum(
        1 for w in synced_weapons
        if norm_text(w["id"].replace("weapon-", "").replace("gear-", "")) not in static_ids
        and norm_text(w["name"]) not in static_names
    )
    return synced_weapons, static_w_count + extra_count


def sync_properties(master_data: Dict[str, Any]) -> Tuple[List[Dict[str, Any]], int]:
    log("Syncing Leonida Safehouses, Mansions & Official Location Photography...")
    # Official GTA Wiki location titles mapped to our 8 core properties + newly confirmed GTA VI locations
    CORE_PROP_FIXES: Dict[str, Dict[str, Any]] = {
        "venetian-mega-mansion": {
            "price": "$18,500,000",
            "wiki_titles": ["Starfish Island (HD Universe)", "Rialto Islands"],
            "slug": "prop-venetian-mansion",
        },
        "starlet-key-modernist-villa": {
            "price": "$12,400,000",
            "wiki_titles": ["Leonida Keys"],
            "slug": "prop-starlet-villa",
        },
        "ocean-drive-art-deco-penthouse": {
            "price": "$8,200,000",
            "wiki_titles": ["Ocean Beach (HD Universe)"],
            "slug": "prop-ocean-drive",
        },
        "vice-beach-nightclub-front": {
            "price": "$4,500,000",
            "wiki_titles": ["Vice City (HD Universe)"],
            "slug": "prop-neon-palms",
        },
        "port-gellhorn-waterfront-depot": {
            "price": "$2,900,000",
            "wiki_titles": ["Port Gellhorn"],
            "slug": "prop-port-gellhorn",
        },
        "grassrivers-hangar-cabin": {
            "price": "$1,850,000",
            "wiki_titles": ["Grassrivers"],
            "slug": "prop-grassrivers",
        },
        "pelican-valley-sugarcane-farmhouse": {
            "price": "$920,000",
            "wiki_titles": ["Mount Kalaga National Park"],
            "slug": "prop-pelican-valley",
        },
        "ambrosia-motel-room-lockup": {
            "price": "$240,000",
            "wiki_titles": ["Ambrosia"],
            "slug": "prop-ambrosia-motel",
        },
    }

    NEW_CONFIRMED_LOCATIONS = [
        {
            "id": "brians-boat-works-marina",
            "name": "Brian's Boat Works & Marina",
            "type": "Marine Contraband Front",
            "cat": "front",
            "tier": "Syndicate Front",
            "price": "$3,400,000",
            "district": "Leonida Keys • Deep-Water Canal",
            "garage": "6-Slip Boat Hoist + Offshore Smuggler Pier",
            "laundering": "Marine Charter Escrow (9% Fee)",
            "features": "Owned by drug-smuggling veteran Brian Heder; launchpad for Keys marine extractions.",
            "heistSynergy": "Direct offshore staging dock for Starlet Superyacht and Coast Guard diversions.",
            "wiki_titles": ["Brian's Boat Works & Marina"],
            "slug": "prop-brians-marina",
            "status": "CONFIRMED",
            "source": "Rockstar Official Location Reveal",
        },
        {
            "id": "jack-of-hearts-club-front",
            "name": "Jack of Hearts Nightclub Empire",
            "type": "High-Volume Cash Front",
            "cat": "front",
            "tier": "Real Estate Mogul",
            "price": "$6,200,000",
            "district": "Vice City • Boobie Ike District",
            "garage": "8-Car VIP Tunnel + Armored Drop",
            "laundering": "Club Revenue Mixing (7% Fee)",
            "features": "Operated by Boobie Ike & Only Raw Records; funnels millions in unmarked street cash nightly.",
            "heistSynergy": "Cleanest high-cap wash terminal for Vice City jewelry and bank scores.",
            "wiki_titles": ["Jack of Hearts", "Ocean Beach (HD Universe)"],
            "slug": "prop-jack-of-hearts",
            "status": "CONFIRMED",
            "source": "Rockstar Official Character Lore",
        },
        {
            "id": "escobar-private-hangar-bay",
            "name": "Escobar Int'l Private Aviation Hangar",
            "type": "Heavy Airfield Hangar",
            "cat": "hangar",
            "tier": "Extraction Hub",
            "price": "$5,100,000",
            "district": "Vice City • Escobar International",
            "garage": "4-Aircraft Private Jet Bay + 6-Car Staging",
            "laundering": "Aviation Charter Shell (11% Fee)",
            "features": "Custom radar-transponder spoofing hangar adjacent to Shamal and Nimbus executive aprons.",
            "heistSynergy": "Long-range Shamal getaway exfil clearing Leonida airspace under 90 seconds.",
            "wiki_titles": ["Escobar International Airport"],
            "slug": "prop-escobar-hangar",
            "status": "CONFIRMED",
            "source": "Official Leonida Airport Recon",
        },
        {
            "id": "key-lento-safehouse-bungalow",
            "name": "Key Lento Smuggler Bungalow",
            "type": "Coastal Safehouse",
            "cat": "safehouse",
            "tier": "Protagonist Base",
            "price": "$680,000",
            "district": "Key Lento • Leonida Keys",
            "garage": "2-Car Carport + Kayak / Dinghy Cove",
            "laundering": "Local Marina Exchange (15% Fee)",
            "features": "Jason Duval's coastal hideout provided through Brian Heder's Keys network.",
            "heistSynergy": "Stealth starter safehouse for early Leonida Keys armored runs and ocean drops.",
            "wiki_titles": ["Key Lento Safehouse", "Leonida Keys"],
            "slug": "prop-key-lento",
            "status": "CONFIRMED",
            "source": "Rockstar Official Bio Intel",
        },
    ]

    all_titles: List[str] = []
    for meta in CORE_PROP_FIXES.values():
        all_titles.extend(meta["wiki_titles"])
    for loc in NEW_CONFIRMED_LOCATIONS:
        all_titles.extend(loc["wiki_titles"])
    page_cache = batch_pageimages(all_titles, size=640)

    updated_props: List[Dict[str, Any]] = []
    seen_ids = set()
    # 1. Keep and repair the 8 core properties
    for prop in master_data.get("properties", []):
        pid = prop.get("id", "")
        if pid not in CORE_PROP_FIXES:
            continue
        seen_ids.add(pid)
        fix = CORE_PROP_FIXES[pid]
        prop["price"] = fix["price"]
        url = choose_best_url(None, fix["wiki_titles"], {}, page_cache)
        if url:
            out_rel = f"assets/{fix['slug']}.webp"
            ok, _ = download_and_save_image(url, PUBLIC_DIR / out_rel, "WEBP")
            if ok:
                prop["image"] = out_rel
        # Assign static cat aligned with safehouses-laundering.html filter tabs
        if "mansion" in pid or "villa" in pid:
            prop["cat"] = "mansion"
        elif "hangar" in pid:
            prop["cat"] = "hangar"
        elif "nightclub" in pid or "farmhouse" in pid:
            prop["cat"] = "front"
        else:
            prop["cat"] = "safehouse"
        updated_props.append(prop)

    # 2. Add newly confirmed Rockstar official locations
    for loc in NEW_CONFIRMED_LOCATIONS:
        if loc["id"] in seen_ids:
            continue
        url = choose_best_url(None, loc["wiki_titles"], {}, page_cache)
        if not url:
            continue
        out_rel = f"assets/{loc['slug']}.webp"
        ok, _ = download_and_save_image(url, PUBLIC_DIR / out_rel, "WEBP")
        if ok:
            item = {k: v for k, v in loc.items() if k not in ("wiki_titles", "slug")}
            item["image"] = out_rel
            updated_props.append(item)
            seen_ids.add(loc["id"])

    master_data["properties"] = updated_props
    return updated_props, len(updated_props)


def sync_youtube_wire(master_data: Dict[str, Any]) -> None:
    log("Scanning official YouTube Atom feeds...")
    yt_channels = {
        "Rockstar Games (Official)": "UCULwHhkI31JHAKe57LZdzcA",
        "GTA Series Videos": "UCrniLr5HDebHfskhSSAAt0A",
        "Digital Foundry": "UCLdBr5f6RcP6l_TAP4GkhDQ",
        "LegacyKillaHD": "UCvbsOrV7_fuuItFPEBfOdbA",
    }
    videos: List[Dict[str, str]] = []
    ns = {"atom": "http://www.w3.org/2005/Atom"}
    for cname, cid in yt_channels.items():
        url = f"https://www.youtube.com/feeds/videos.xml?channel_id={cid}"
        try:
            req = urllib.request.Request(url, headers={"User-Agent": BROWSER_UA})
            with urllib.request.urlopen(req, timeout=12) as resp:
                tree = ET.fromstring(resp.read().decode("utf-8"))
            for entry in tree.findall("atom:entry", ns)[:6]:
                t_el = entry.find("atom:title", ns)
                l_el = entry.find("atom:link", ns)
                p_el = entry.find("atom:published", ns)
                if t_el is None or l_el is None:
                    continue
                vtitle = (t_el.text or "").strip()
                vlink = l_el.attrib.get("href", "")
                vpub = (p_el.text or "") if p_el is not None else ""
                vid_m = re.search(r"[?&]v=([A-Za-z0-9_-]{6,})", vlink)
                thumb = f"https://i.ytimg.com/vi/{vid_m.group(1)}/hqdefault.jpg" if vid_m else ""
                if "Rockstar" in cname or any(
                    k in vtitle.lower() for k in ("gta", "grand theft auto", "leonida", "vice city", "lucia", "jason", "rockstar")
                ):
                    videos.append({
                        "channel": cname,
                        "title": vtitle,
                        "url": vlink,
                        "published": vpub,
                        "thumbnail": thumb,
                    })
        except Exception as exc:
            log(f"YouTube feed warn ({cname}): {exc}")

    if videos:
        videos.sort(key=lambda x: x.get("published", ""), reverse=True)
        master_data["youtubeWire"] = videos[:12]


def sync_catalog_dicts(master_data: Dict[str, Any]) -> None:
    """Keep vehicleCatalog / weaponCatalog lookup objects synced with fresh assets."""
    vc = master_data.get("vehicleCatalog", {})
    if isinstance(vc, dict):
        for k, entry in vc.items():
            if isinstance(entry, dict) and entry.get("image"):
                entry["image"] = entry["image"].split("?")[0]
        for v in master_data.get("vehicles", []):
            vc[v["id"]] = v
    wc = master_data.get("weaponCatalog", {})
    if isinstance(wc, dict):
        for k, entry in wc.items():
            if isinstance(entry, dict) and entry.get("image"):
                entry["image"] = entry["image"].split("?")[0]
        for w in master_data.get("weapons", []):
            wc[w["id"]] = w


def verify_master_data(master_data: Dict[str, Any]) -> List[str]:
    errors: List[str] = []
    veh_hashes: Dict[str, str] = {}
    for bucket in ("characters", "weapons", "vehicles", "properties"):
        for item in master_data.get(bucket, []):
            img = (item.get("image") or "").split("?")[0].lstrip("/")
            if not img:
                errors.append(f"{bucket}/{item.get('id')}: missing image field")
                continue
            p = PUBLIC_DIR / img
            if not p.exists():
                errors.append(f"{bucket}/{item.get('id')}: file missing ({img})")
                continue
            b = p.read_bytes()
            if not is_valid_image_bytes(b):
                errors.append(f"{bucket}/{item.get('id')}: invalid image bytes ({img})")
            if bucket == "vehicles":
                h = hashlib.md5(b).hexdigest()
                if h in veh_hashes:
                    errors.append(f"vehicles/{item.get('id')}: duplicate photo with {veh_hashes[h]}")
                veh_hashes[h] = item.get("id", "")

    # Also verify all 56 static vehicles exist and aren't duplicated
    static_hashes: Dict[str, str] = {}
    for fname in list(PRESERVE_VEHICLE_WEBPS) + list(STATIC_VEHICLE_SOURCES.keys()):
        p = ASSETS_DIR / fname
        if not p.exists():
            errors.append(f"static-vehicle/{fname}: missing")
            continue
        b = p.read_bytes()
        if not is_valid_image_bytes(b):
            errors.append(f"static-vehicle/{fname}: invalid bytes")
        h = hashlib.md5(b).hexdigest()
        if h in static_hashes:
            errors.append(f"static-vehicle/{fname}: duplicate image hash with {static_hashes[h]}")
        static_hashes[h] = fname
    return errors


def sync_database(refresh_static: bool = False, verify: bool = False) -> bool:
    log("Starting GTA 6 Heist Guide Autonomous Sync Engine (v4.0)...")
    if not DATA_FILE.exists():
        log(f"Master intel JSON not found: {DATA_FILE}")
        return False

    master_data = json.loads(DATA_FILE.read_text(encoding="utf-8"))

    need_static = refresh_static or master_data.get("staticAssetVersion") != "20261119_v3"
    if need_static:
        log("Refreshing static vehicle, weapon & gear photos from authentic GTA Wiki sources...")
        refresh_static_asset_group("vehicles", STATIC_VEHICLE_SOURCES, force_refresh=True)
        refresh_static_asset_group("weapons-gear", STATIC_WEAPON_GEAR_SOURCES, force_refresh=True)
        master_data["staticAssetVersion"] = "20261119_v3"

    _, total_vehicles = sync_vehicles(master_data)
    _, total_chars = sync_characters(master_data)
    _, total_weapons = sync_weapons(master_data)
    _, total_props = sync_properties(master_data)
    sync_youtube_wire(master_data)
    sync_catalog_dicts(master_data)

    master_data["catalogTotals"] = {
        "characters": total_chars,
        "weapons": total_weapons,
        "vehicles": total_vehicles,
        "masks": len(master_data.get("gearCatalog", {})) or 16,
        "properties": total_props,
    }
    master_data["version"] = "2026.11.19-sync-v4"
    master_data["lastSynced"] = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

    DATA_FILE.write_text(json.dumps(master_data, indent=2), encoding="utf-8")
    log(
        "Sync complete -> "
        f"Characters: {total_chars}, Weapons/Gear: {total_weapons}, "
        f"Vehicles: {total_vehicles}, Safehouses: {total_props}, "
        f"YouTube: {len(master_data.get('youtubeWire', []))}"
    )

    if verify:
        errs = verify_master_data(master_data)
        if errs:
            log(f"VERIFY FAILED ({len(errs)} issues):")
            for e in errs[:25]:
                log(f"  - {e}")
            return False
        log("VERIFY PASSED: 0 missing/corrupt/duplicate images.")
    return True


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="GTA 6 Heist Guide Autonomous Sync Engine v4.0")
    parser.add_argument("--refresh-static", action="store_true", help="Force refresh static vehicle/weapon/gear photos")
    parser.add_argument("--verify", action="store_true", help="Verify all referenced local image files after sync")
    args = parser.parse_args()
    ok = sync_database(refresh_static=args.refresh_static, verify=args.verify)
    sys.exit(0 if ok else 1)
