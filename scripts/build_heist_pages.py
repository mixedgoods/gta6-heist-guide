#!/usr/bin/env python3
"""
Generates all 8 verified GTA 6 Heist & Robbery walkthrough pages under public/heists/.
Uses ONLY local official Rockstar screenshots from /assets/images/heists/,
includes Quick-Answer Featured Snippet boxes, Duo Tactics, Stealth vs. Loud,
Fencing/ATM Banking mechanics, FAQPage JSON-LD schema, and the Recommended Heist Setup & Fuel bar.
"""
import os
import json

ROOT = r"C:\Users\Shawn\Desktop\gta6heistguide"
OUT_DIR = os.path.join(ROOT, "public", "heists")
os.makedirs(OUT_DIR, exist_ok=True)

HEISTS = [
    {
        "slug": "the-cartel-heist",
        "title": "The Cartel Heist Walkthrough (Chapter 3 — Story Heist #1)",
        "short_title": "The Cartel Heist",
        "badge": "CHAPTER 3 • STORY HEIST #1",
        "image": "/assets/images/heists/cartel-heist.jpg",
        "meta_desc": "Complete 10-step walkthrough for GTA 6's Chapter 3 Story Heist #1: The Cartel Heist (Mission #71, Raul Bautista, Sinfrontera National Bank, $120,000 payout).",
        "quick_answer": "The Cartel Heist (Mission #71) is GTA 6's first major Story Heist in Chapter 3, given by Raul Bautista against Sinfrontera National Bank for a $120,000 payout. Complete all 5 setups (Security Expert, Heist Planning, Ride or Die, Safe Word, Hidden Charges), rig the cell towers to buy ~11 minutes before VCPD arrives, shoot guns out of guards' hands in the lobby for Professional rating, bag the big stacks of bills first, and defend the bus to the freeway escape.",
        "stats": [
            ("Mission", "#71 (Story Heist #1)"),
            ("Giver", "Raul Bautista"),
            ("Target", "Sinfrontera National Bank"),
            ("Reward", "$120,000"),
            ("Setups", "5 Mandatory Prep Missions"),
            ("Vault Window", "~11 Min (Cell Towers Rigged)"),
        ],
        "setups": [
            ("Security Expert", "Recruit and brief your bank security insider so you get floor layouts and silent alarm bypass timings."),
            ("Heist Planning", "Lock in your entry approach, vault floor roles for Jason & Lucia, and bus extraction corridor with Raul Bautista."),
            ("Ride or Die", "Acquire and stage the heavy getaway transport and backup freeway intercept vehicles."),
            ("Safe Word", "Secure the vault override credentials and comms jammer triggers needed for the Sinfrontera lower level."),
            ("Hidden Charges", "Plant remote explosives on the surrounding cell towers so you can trigger the ~11-minute police comms blackout."),
        ],
        "steps": [
            ("1. Blow the Cell Towers (~11 Min Timer)", "Trigger the pre-planted charges from Hidden Charges to knock out local cell towers. This starts your ~11-minute blackout window before VCPD dispatch can coordinate a full perimeter."),
            ("2. Take the Lobby (Keep Professional Rating)", "Enter Sinfrontera National Bank fast. To preserve your Professional rating and avoid lethal civilian escalation, shoot weapons directly out of the security guards' hands rather than executing them."),
            ("3. Push Down to the Vault Floor", "Move Jason and Lucia down the stairwell to the basement vault corridor. Watch the corner sightlines and neutralize the armored vault guard quickly."),
            ("4. Clear Building & Roof", "Sweep the upper mezzanine and roof access to stop snipers and security spotters from calling in early helicopter support."),
            ("5. Crack the Vault (Bag Big Stacks First)", "Breach the main Sinfrontera vault door. Always prioritize the large high-denomination stacks of bills on the center tables first before grabbing loose bundles to maximize your $120,000 take."),
            ("6. Hold Off Police", "When VCPD breaches the front doors, hold the lobby choke points using cover. Switch between Jason (heavy rifle suppression) and Lucia (flanking & revive cover)."),
            ("7. Smoke Out the Street", "Deploy smoke canisters across the main bank steps to blind VCPD cruisers and break sniper line-of-sight before stepping onto the asphalt."),
            ("8. Get Nicole Out", "Escort Nicole through the smoke screen toward the extraction vehicle. Keep her shielded on the far side of parked police cruisers."),
            ("9. Defend the Bus", "Board the armored extraction bus and man the firing ports. Focus fire on police cruiser tires and engine blocks to prevent PIT maneuvers."),
            ("10. Escape on the Freeway", "Hit the Vice City freeway interchange, ditch the tailing interceptors using overpass exits, and cool down your wanted stars to bank your $120,000 payout."),
        ],
        "duo_tactics": "Keep Jason on primary vault-corridor suppression and heavy rifle fire while Lucia handles precision hand-shots in the lobby, rapid bag-filling, and flanking VCPD breach teams.",
        "stealth_vs_loud": "Shooting guns out of guards' hands in Step 2 preserves the Professional rating and delays heavy SWAT escalation. Going loud too early burns your ~11-minute cell tower timer before the big stacks are bagged.",
        "fencing_banking": "After escaping on the freeway, deposit your $120,000 share at a physical ATM or BuckMe safehouse terminal immediately. Remember loose pocket cash is capped at $20,000 in free-roam—never carry unbanked heist cash into side missions.",
        "faqs": [
            ("How much does The Cartel Heist pay in GTA 6?", "The Cartel Heist (Mission #71) pays $120,000 when you clear the big stacks of bills inside Sinfrontera National Bank before the police blackout timer expires."),
            ("How do you keep the Professional rating in The Cartel Heist?", "During Step 2 (Take the Lobby), shoot the guns directly out of the security guards' hands instead of killing guards or harming hostages."),
            ("What are the 5 setup missions for The Cartel Heist?", "The 5 setups given by Raul Bautista are Security Expert, Heist Planning, Ride or Die, Safe Word, and Hidden Charges."),
        ]
    },
    {
        "slug": "vcia-takedown",
        "title": "VCIA Takedown Walkthrough (Chapter 4 — Story Heist #2)",
        "short_title": "VCIA Takedown",
        "badge": "CHAPTER 4 • STORY HEIST #2",
        "image": "/assets/images/heists/vcia-takedown.jpg",
        "meta_desc": "Complete walkthrough for GTA 6 Chapter 4 Story Heist #2: VCIA Takedown at Vice City International Airport. All 4 setups, stealth vs loud tradeoffs, and ATM deposit tips.",
        "quick_answer": "VCIA Takedown is GTA 6's second major Story Heist in Chapter 4, targeting Vice City International Airport's high-security cargo & cash vault. Complete all 4 setups (Close Surveillance, Delivery Method, Team Building, Heist Plans in Place), choose a stealth roof infiltration to delay the 4-star tarmac lockdown, extract via the runway corridor, and immediately deposit your score at a physical ATM.",
        "stats": [
            ("Chapter", "Chapter 4 (Story Heist #2)"),
            ("Target", "Vice City International Airport"),
            ("Reward", "$250,000 Story Score"),
            ("Setups", "4 Mandatory Prep Missions"),
            ("Wanted Peak", "4-Star Tarmac Lockdown"),
            ("Unlocks", "Endgame Large Bank Vaults"),
        ],
        "setups": [
            ("Close Surveillance", "Scout VCIA cargo terminals, security camera cones, and airport patrol shift changes to identify blind spots."),
            ("Delivery Method", "Secure your airport-disguised infiltration transport or cargo ramp access vehicle."),
            ("Team Building", "Finalize your heist crew roster and assign tarmac suppression vs. vault breach responsibilities."),
            ("Heist Plans in Place", "Lock in your stealth vs. loud entry plan and secondary runway getaway staging before launching the finale."),
        ],
        "steps": [
            ("1. Lock a Manual Save Slot Before Starting", "GTA 6 has no mission replay menu at launch. Save in a dedicated manual slot (Slot 8–10) before launching VCIA Takedown so you can replay both stealth and loud approaches."),
            ("2. Infiltrate the VCIA Terminal Perimeter", "Use your Close Surveillance blind spots to slip past the outer airport gate. Suppress exterior cameras before crossing the apron."),
            ("3. Breach the Airport Cargo Vault", "Coordinate Jason and Lucia to bypass the terminal keypad and secure the high-value international currency pallets."),
            ("4. Hold the Tarmac Against VCPD & Airport Security", "Once the alarm triggers, move between luggage tugs and cargo containers for hard cover. Prioritize patrol choppers and armored SUVs."),
            ("5. Execute the Runway Extraction", "Fight to your pre-staged Delivery Method getaway craft/vehicle and clear the VCIA perimeter via the coastal flight path or southern highway tunnel."),
            ("6. Clear Heat & Bank the Payout", "Swap vehicles outside the airport search zone, drop your wanted stars, and deposit your cash at the nearest physical ATM to avoid the $20,000 pocket cash cap."),
        ],
        "duo_tactics": "Use Lucia for silent terminal camera takedowns and terminal keypad overrides while Jason anchors heavy cover on the cargo ramp with an armor-piercing rifle for incoming airport security trucks.",
        "stealth_vs_loud": "Stealth roof/service infiltration gives you extra uninterrupted looting time inside the cargo vault and delays the 4-star tarmac response. Going loud upfront triggers immediate airport lockdown and armored VCPD barricades on the runway.",
        "fencing_banking": "Split loose bills from marked contraband. Fence any high-value cargo items at Brian's Lockup (Code 7700) or Yasmani's, and deposit all clean cash at physical ATMs right after losing heat.",
        "faqs": [
            ("What are the setup missions for VCIA Takedown in GTA 6?", "The 4 setup missions are Close Surveillance, Delivery Method, Team Building, and Heist Plans in Place."),
            ("What does completing VCIA Takedown unlock?", "Completing Chapter 4's VCIA Takedown progresses you toward 'That's Where The Money Is...', unlocking the 8 repeatable Large Bank Vaults across Leonida."),
            ("Is stealth better than loud for VCIA Takedown?", "Yes—entering stealthily buys critical minutes inside the VCIA vault before the 4-star tarmac response spawns."),
        ]
    },
    {
        "slug": "shops-and-stickups",
        "title": "GTA 6 Shops & Stick-Ups Guide (72 Locations + Fast Cash Loop)",
        "short_title": "Shops & Stick-Ups",
        "badge": "UNLOCKED FROM START • 72 LOCATIONS",
        "image": "/assets/images/heists/shops.jpg",
        "meta_desc": "How to rob all 72 convenience stores, gas stations, and fast-food spots in GTA 6. Duo crowd-control tactics, early Chapter 1 BuckMe savings loop, and ATM deposits.",
        "quick_answer": "Shops & Stick-ups are unlocked from the very start of GTA 6 across 72 convenience stores, gas stations, and fast-food spots in Leonida. Keep your getaway car running at the door, use Jason and Lucia to control the clerk and bystanders without firing a shot, grab the register and back-office cash box, and deposit your haul at a physical ATM to hit your $5,000 Chapter 1 BuckMe Family Savings goal fast.",
        "stats": [
            ("Unlock", "Available From Chapter 1 Start"),
            ("Locations", "72 Stores Across Leonida"),
            ("Targets", "Convenience, Gas & Fast Food"),
            ("Payout", "$400 – $1,800 Per Hit"),
            ("Heat Level", "1–2 Stars (Low Risk)"),
            ("Best Use", "Ch. 1 $5,000 BuckMe Goal"),
        ],
        "setups": [
            ("Stage a Fast Escape Car", "Park facing the road with the driver door clear—never trap yourself in a tight gas station pump bay."),
            ("Equip a Mask & Switch Plates", "Put on a bandana or mask before entering so witnesses don't tag your identity on VCPD dispatch."),
        ],
        "steps": [
            ("1. Scout for Cameras & Armed Clerks", "Glance above the counter for a CCTV dome and check if any customers are holding phones before drawing your weapon."),
            ("2. Intimidate Without Shooting", "Aim at the clerk and use intimidation commands to speed up register emptying. Firing shots escalates from 1-star to 2-star VCPD response instantly."),
            ("3. Duo Crowd Control", "Have your partner watch the entrance and keep patrons down while you empty the cash drawer and check the back office for a second safe box."),
            ("4. Clean Exit & Line-of-Sight Break", "Exit immediately, duck into side alleys or Port Gellhorn backroads, and remove your mask once out of police sight to drop a star."),
            ("5. Hit Physical ATMs Every 2–3 Stores", "Bank your wallet cash at physical ATMs regularly—especially in Chapter 1 so you secure the $5,000 BuckMe Family Savings target before Tourist Trap."),
        ],
        "duo_tactics": "One protagonist intimidates the clerk and bags the till while the second protagonist watches the door, deters heroic armed customers, and calls out incoming VCPD cruisers.",
        "stealth_vs_loud": "Silent intimidation (no gunfire) keeps police response minimal and lets you chain 3–4 nearby shops in Port Gellhorn or Vice City suburbs before laying low.",
        "fencing_banking": "Register cash is clean wallet cash—deposit it directly at physical ATMs or safehouse BuckMe terminals. Keep loose cash well below the $20,000 pocket cap.",
        "faqs": [
            ("How many shops can you rob in GTA 6?", "There are 72 robbable convenience stores, gas stations, and fast-food spots across Leonida, available right from the start of Chapter 1."),
            ("Do masks actually help during store robberies in GTA 6?", "Yes—wearing a mask prevents instant identity recognition, and removing it after breaking line-of-sight speeds up wanted-level cooldown."),
        ]
    },
    {
        "slug": "pawn-shops",
        "title": "GTA 6 Pawn Shops Robbery Guide (Unlocks Ch. 2 After Coffee Break)",
        "short_title": "Pawn Shops",
        "badge": "CHAPTER 2 • AFTER COFFEE BREAK",
        "image": "/assets/images/heists/pawn-shops.jpg",
        "meta_desc": "GTA 6 Pawn Shop robbery guide unlocked in Chapter 2 after Coffee Break. How to smash display cases, dodge silent alarms, and fence mid-tier valuables for maximum cash.",
        "quick_answer": "Pawn Shop robberies unlock in Chapter 2 after completing the mission Coffee Break. Unlike basic convenience stores, pawn shops hold mid-tier valuables (watches, electronics, vintage firearms, and back-room cash) that must be carried out in duffel bags and sold to Leonida's fences like Brian's Lockup (Code 7700) or Randy for clean cash.",
        "stats": [
            ("Unlock", "Ch. 2 After 'Coffee Break'"),
            ("Loot Type", "Mid-Tier Valuables & Cash"),
            ("Payout", "$2,500 – $6,500 Fenced"),
            ("Key Gear", "Duffel Bag + Mask"),
            ("Best Fences", "Brian's Lockup (7700) / Randy"),
            ("Heat Level", "2 Stars"),
        ],
        "setups": [
            ("Complete 'Coffee Break' (Ch. 2)", "Finish this Chapter 2 story mission to unlock pawn shop interior robbery prompts and fencing values."),
            ("Bring a Trunk-Equipped Car", "Use a 4-door sedan or SUV with trunk storage so you can stash extra duffel bags and swap weapons quickly."),
        ],
        "steps": [
            ("1. Disable the Under-Counter Alarm First", "Pawn shop owners frequently reach for a silent panic button. Control the clerk immediately upon entry before smashing any glass cases."),
            ("2. Prioritize High-Value Cases", "Target luxury watch trays, gold chains, and locked firearm displays first—they give the highest dollar-per-slot value in your duffel bag."),
            ("3. Check the Back-Room Safe", "Most Port Gellhorn and Vice City pawn shops have a small manager's office safe or lockbox behind the curtain."),
            ("4. Escape & Avoid Roadblocks", "Stash your duffel bag in the getaway car trunk if needed and use alleyways to break 2-star pursuit."),
            ("5. Fence Stolen Goods & Bank the Cash", "Drive your stolen pawn goods to an active fence (such as Brian's Lockup, code 7700, or Randy) to convert them into spendable cash, then deposit at an ATM."),
        ],
        "duo_tactics": "Assign one protagonist strictly to clerk/alarm control and door watch while the other systematically clears the highest-value glass cases and back-room office.",
        "stealth_vs_loud": "Controlled smash-and-grab without shooting keeps heat at 2 stars. Firing shotguns or explosives inside triggers immediate VCPD tactical units.",
        "fencing_banking": "Stolen pawn valuables cannot be deposited at ATMs directly—you must sell them to one of Leonida's 7 fences first, then deposit the fence payout at a physical ATM.",
        "faqs": [
            ("When do Pawn Shop robberies unlock in GTA 6?", "Pawn shops unlock for full robbery and fencing in Chapter 2 after completing the story mission Coffee Break."),
            ("Where do you sell stolen pawn shop items in GTA 6?", "Sell stolen watches, jewelry, and electronics to Leonida's fences—including Brian's Lockup (keypad code 7700) and Randy."),
        ]
    },
    {
        "slug": "jewelry-stores",
        "title": "GTA 6 Jewelry Stores Robbery Guide (20 Locations — Unlocks Ch. 3)",
        "short_title": "Jewelry Stores",
        "badge": "CHAPTER 3 • 20 LOCATIONS",
        "image": "/assets/images/heists/jewelry-stores.jpg",
        "meta_desc": "GTA 6 Jewelry Store heist guide covering all 20 locations unlocked in Chapter 3 after Yasmani's Jewelry Jobs. Stealth entry, safe combos, erasing CCTV, and duffel bag fencing.",
        "quick_answer": "Jewelry Store robberies unlock in Chapter 3 after completing Yasmani's Jewelry Jobs, opening 20 high-end boutiques across Leonida. For maximum payout and zero lingering heat, use stealth entry, crack the back-room safe combo, erase the CCTV server before leaving, haul the full duffel bags to your trunk, and fence the gems through Yasmani or Brian's Lockup (7700).",
        "stats": [
            ("Unlock", "Ch. 3 After 'Yasmani's Jewelry Jobs'"),
            ("Locations", "20 Jewelry Boutiques"),
            ("Payout", "$15,000 – $35,000 Fenced"),
            ("Key Steps", "Safe Combos + Erase CCTV"),
            ("Transport", "Duffel Bags -> Fence"),
            ("Heat Level", "2–3 Stars"),
        ],
        "setups": [
            ("Complete 'Yasmani's Jewelry Jobs'", "Unlocks full jewelry store heist mechanics and establishes Yasmani as a top-tier low-cut gem fence."),
            ("Bring Glass Cutters / Silenced Sidearm", "Keep a suppressed pistol to shoot out interior security cameras without alerting the street."),
        ],
        "steps": [
            ("1. Stealth Entry & Camera Sweep", "Enter during low-foot-traffic hours (late evening) and disable or avoid interior CCTV cones before drawing weapons."),
            ("2. Pacify Security & Staff", "Neutralize the boutique guard quietly and secure the clerk so the silent alarm isn't tripped."),
            ("3. Crack the Back-Office Safe Combo", "Search the manager's desk/clipboard for the safe combination to claim loose diamonds and high-carat watches."),
            ("4. Sweep Display Cases Into Duffel Bags", "Fill both Jason's and Lucia's duffel bags with the highest-tier diamond cases first."),
            ("5. Erase the CCTV Server", "Before exiting, interact with the back-room security terminal to wipe CCTV footage—this prevents delayed VCPD heat and vehicle plate flags."),
            ("6. Transport Duffel Bags to Fence & Bank", "Load duffel bags cleanly into your getaway car, lose any pursuit, sell the jewels at Yasmani's or Brian's Lockup (7700), and deposit the cash at an ATM."),
        ],
        "duo_tactics": "Split the floor: Lucia clears the back-room safe combo and wipes the CCTV terminal while Jason controls the showroom floor and bags the front diamond displays.",
        "stealth_vs_loud": "Stealth + CCTV erasure is vastly superior—it lets you walk out with 100% of the display cases and safe diamonds before VCPD even rolls a unit.",
        "fencing_banking": "Always transport duffel bags straight to Yasmani (lowest cut for gems) or Brian's Lockup (Code 7700). Deposit payouts at physical ATMs immediately so you stay under the $20,000 pocket cash cap.",
        "faqs": [
            ("How many jewelry stores can you rob in GTA 6?", "There are 20 robbable jewelry store locations across Leonida, unlocked in Chapter 3 after completing Yasmani's Jewelry Jobs."),
            ("Why should you erase CCTV footage during jewelry store robberies?", "Wiping the back-room CCTV server stops VCPD from tracking your getaway plates and drastically lowers post-heist heat."),
        ]
    },
    {
        "slug": "small-banks-payday-loans",
        "title": "GTA 6 Small Banks & Payday Loans Guide (14 Locations + Dye Pack Jammer)",
        "short_title": "Small Banks & Payday Loans",
        "badge": "CHAPTER 3 • 14 SMALL BANKS",
        "image": "/assets/images/heists/small-banks.jpg",
        "meta_desc": "GTA 6 Small Banks & Payday Loans robbery guide unlocked in Chapter 3 after Credit Check. All 14 small banks, how to unlock and use the Dye Pack Jammer, and ATM deposit strategy.",
        "quick_answer": "Small Banks & Payday Loans unlock in Chapter 3 after completing the mission Credit Check, opening 14 regional branches across Leonida. The single most important tool for these hits is the Dye Pack Jammer—activate it before bagging teller stacks and mini-vault bundles so exploding dye packs don't ruin your stolen cash.",
        "stats": [
            ("Unlock", "Ch. 3 After 'Credit Check'"),
            ("Locations", "14 Small Banks & Payday Shops"),
            ("Payout", "$25,000 – $55,000 Clean"),
            ("Critical Tool", "Dye Pack Jammer"),
            ("Heat Level", "3 Stars"),
            ("Banking", "Physical ATM Deposit"),
        ],
        "setups": [
            ("Complete 'Credit Check' (Ch. 3)", "Unlocks all 14 Small Banks & Payday Loan robbery nodes and introduces the Dye Pack Jammer mechanic."),
            ("Equip the Dye Pack Jammer", "Verify your Dye Pack Jammer is in your active heist loadout before stepping through the bank doors—without it, up to 50% of your cash can be ruined by dye packs."),
        ],
        "steps": [
            ("1. Park a High-Torque Getaway Vehicle Outside", "Small banks trigger a fast 3-star VCPD response. Face your car toward the nearest highway on-ramp or alleyway."),
            ("2. Control Tellers & Lobby Security", "Neutralize the lone branch guard quickly and keep tellers away from the under-desk silent alarm."),
            ("3. Activate Your Dye Pack Jammer", "Trigger the Dye Pack Jammer before grabbing teller drawer stacks or mini-vault bundles. Keep it active until every stack is safely inside your duffel bag."),
            ("4. Crack the Branch Mini-Vault", "Drill or override the rear cash room door while your partner holds the lobby glass against early VCPD arrivals."),
            ("5. Break 3-Star Pursuit & Deposit at ATMs", "Break sightlines via alleys or storm drains, swap vehicles if your plates were scanned, and deposit your clean cash at physical ATMs."),
        ],
        "duo_tactics": "Jason holds the front lobby and suppresses arriving VCPD cruisers while Lucia runs the Dye Pack Jammer, drills the branch mini-vault, and bags the clean bills.",
        "stealth_vs_loud": "Silent entry delays the 3-star countdown long enough to empty both teller drawers and the rear mini-vault cleanly. Loud entry forces you to fight VCPD inside the lobby while still bagging.",
        "fencing_banking": "Clean jammed bills can be deposited straight into physical ATMs. If any bundle gets ink-stained because the jammer lapsed, take those marked bills to Brian's Lockup (Code 7700) to fence at a discount.",
        "faqs": [
            ("How do you stop dye packs from ruining cash in GTA 6 small banks?", "Unlock and equip the Dye Pack Jammer (introduced after Chapter 3's Credit Check) and activate it before bagging teller and vault stacks."),
            ("How many small banks are in GTA 6?", "There are 14 small banks and payday loan locations across Leonida."),
        ]
    },
    {
        "slug": "large-bank-vaults",
        "title": "GTA 6 Large Bank Vaults Guide (8 Major Vaults — Up to ~$205,000)",
        "short_title": "Large Bank Vaults",
        "badge": "END OF CHAPTER 4 • 8 MAJOR VAULTS",
        "image": "/assets/images/heists/large-bank-vaults.jpg",
        "meta_desc": "GTA 6 Large Bank Vaults endgame guide unlocked at the end of Chapter 4 after That's Where The Money Is... All 8 major vaults paying up to ~$205,000, stealth vs explosives, CCTV wipe & trunk swap.",
        "quick_answer": "Large Bank Vaults are GTA 6's highest-paying repeatable free-roam heists, unlocking at the end of Chapter 4 after completing 'That's Where The Money Is...'. There are 8 major bank vaults across Leonida paying up to ~$205,000 per score. Wipe the CCTV room, choose silent thermal drilling over explosives to buy extra vault time, and stage a trunk-equipped disguise swap car two blocks away.",
        "stats": [
            ("Unlock", "End of Ch. 4 ('That's Where The Money Is...')"),
            ("Locations", "8 Major Bank Vaults"),
            ("Max Payout", "Up to ~$205,000 Repeatable"),
            ("Approach", "Stealth Drill vs. Explosives"),
            ("Key Escape", "CCTV Wipe + Disguise/Trunk Swap"),
            ("Heat Level", "4–5 Stars (SWAT Response)"),
        ],
        "setups": [
            ("Complete 'That's Where The Money Is...'", "Unlocks all 8 repeatable Large Bank Vault targets across Vice City, Port Gellhorn, and Ambrosia."),
            ("Stage a Clean Swap Vehicle", "Park a second clean vehicle with disguises in the trunk 2–3 blocks away in an underground garage or alley."),
            ("Bring Dye Pack Jammer + Thermal/Drill Kit", "Pack both your Dye Pack Jammer and heavy vault breach tools in your primary car trunk."),
        ],
        "steps": [
            ("1. Recon Guard Rotations & CCTV Room", "Identify the rear security office first—wiping CCTV prevents VCPD from locking onto your getaway vehicle description."),
            ("2. Choose Stealth Drill vs. Explosives", "Silent thermal drilling takes longer to open the vault door but keeps SWAT off your back for precious minutes. Explosives blow the door instantly but trigger an immediate 4–5 star perimeter lockdown."),
            ("3. Deploy Dye Pack Jammer & Clear High-Value Stacks", "Once inside the main vault, trigger your Dye Pack Jammer and prioritize gold/bearer-bond trays and high-denomination cash pallets to approach the ~$205,000 cap."),
            ("4. Wipe CCTV Before Extraction", "Ensure the security room server is wiped so your identity and initial getaway car aren't permanently flagged."),
            ("5. Execute the Disguise & Trunk Swap", "Break initial line-of-sight using tunnels or storm drains, pull into your staged parking garage, swap outfits from the trunk, and switch into your clean getaway car."),
            ("6. Bank Your $205K Score Immediately", "Hit physical ATMs or a safehouse terminal right after dropping your stars—never roam with $205K exposed above the $20,000 loose pocket cash cap."),
        ],
        "duo_tactics": "Coordinate tightly: Jason brings heavy armor and holds the vault foyer choke point against SWAT breachers while Lucia operates the thermal drill, runs the Dye Pack Jammer, and empties the highest-value vault trays.",
        "stealth_vs_loud": "Stealth drilling + CCTV wipe maximizes net payout (~$205,000) with minimal armor cost. Explosives are faster to breach but immediately summon 4–5 star SWAT vans and police helicopters.",
        "fencing_banking": "Deposit clean bills at physical ATMs immediately and fence any marked bills, bonds, or bullion at Brian's Lockup (7700) or Yasmani's.",
        "faqs": [
            ("How much do Large Bank Vaults pay in GTA 6?", "The 8 repeatable Large Bank Vaults pay up to ~$205,000 per successful run when you clear the top-tier stacks with a Dye Pack Jammer."),
            ("When do Large Bank Vaults unlock in GTA 6?", "They unlock at the end of Chapter 4 after completing the story mission 'That's Where The Money Is...'."),
            ("Is stealth or explosives better for Large Bank Vaults?", "Stealth thermal drilling paired with a CCTV wipe gives you much more time inside the vault before SWAT arrives, making it easier to hit the full ~$205,000 payout."),
        ]
    },
    {
        "slug": "armored-trucks-gang-ops",
        "title": "GTA 6 Armored Trucks & Gang Ops Guide (Mobile Cash + 40 Gang Hideouts)",
        "short_title": "Armored Trucks & Gang Ops",
        "badge": "FREE-ROAM • 40 GANG HIDEOUTS",
        "image": "/assets/images/heists/armored-trucks.jpg",
        "meta_desc": "How to intercept mobile Armored Cash Trucks and clear all 40 Gang Hideouts in GTA 6. Rear-door breach tips, contraband fencing, and physical ATM banking.",
        "quick_answer": "Armored Trucks & Gang Ops are repeatable free-roam combat scores across Leonida, combining roaming Gruppe-style cash trucks with 40 fortified Gang Hideouts. Intercept armored trucks away from downtown VCPD precincts, blow the rear doors cleanly without destroying the truck, loot gang contraband stashes, fence marked goods at Brian's Lockup (7700), and bank your wallet cash at physical ATMs.",
        "stats": [
            ("Unlock", "Free-Roam Dynamic & Progressive"),
            ("Targets", "Mobile Cash Trucks + 40 Hideouts"),
            ("Payout", "$8,000 – $30,000 Per Op"),
            ("Best Gear", "Sticky Bombs + Heavy Rifle"),
            ("Contraband Fence", "Brian's Lockup (Code 7700)"),
            ("Heat Level", "2–3 Stars (Trucks) / Gang Heat"),
        ],
        "setups": [
            ("Carry Sticky Bombs or Heavy Shotgun", "Needed to pop armored truck rear doors fast without detonating the entire vehicle."),
            ("Use an Armored SUV or Fast Coupe", "Gives you cover during gang hideout firefights and quick off-road escape in Grassrivers or Port Gellhorn."),
        ],
        "steps": [
            ("1. Ambush Armored Trucks in Low-Traffic Zones", "Wait until a roaming cash truck enters a highway shoulder, industrial zone, or Port Gellhorn backroad before boxing it in."),
            ("2. Blow the Rear Doors Cleanly", "Place a single sticky bomb directly on the rear lock seam (never on the cab or fuel tank) to pop the doors and spill the cash cases."),
            ("3. Clear 40 Gang Hideouts for Contraband & Cash", "Approach gang compounds from high ground or flanking cover. Clear lookouts first to prevent reinforcements, then sweep the stash room for cash boxes and contraband."),
            ("4. Load Contraband & Break Pursuit", "Grab both cash and fenceable contraband crates before VCPD or rival gang backup arrives."),
            ("5. Fence Contraband & Deposit Wallet Cash at ATMs", "Sell drugs, jewelry, and marked bills at Brian's Lockup (Code 7700), then deposit all clean wallet cash at physical ATMs."),
        ],
        "duo_tactics": "For armored trucks, one protagonist blocks the cab and suppresses the guards while the other plants the rear-door charge and bags the cash cases. In gang hideouts, crossfire from opposite flanks to flush enemies out of cover.",
        "stealth_vs_loud": "Gang hideouts reward stealth takedowns on outer sentries before going loud on the main stash house. Armored trucks are inherently loud—speed of breach and immediate off-road escape are everything.",
        "fencing_banking": "Gang hideouts drop a mix of clean bills and illegal contraband. Always swing by Brian's Lockup (Code 7700) to liquidate contraband, then hit a physical ATM before starting your next op.",
        "faqs": [
            ("How many gang hideouts are in GTA 6?", "There are 40 gang hideouts scattered across Leonida's regions that reward cash, weapons, and fenceable contraband."),
            ("How do you open armored trucks in GTA 6 without blowing them up?", "Place a single sticky bomb directly on the rear lock seam (or shoot the rear door lock with high-caliber rounds) rather than using grenades or RPGs."),
        ]
    }
]

def render_page(h):
    canonical = f"https://www.gta6heistguide.com/heists/{h['slug']}.html"
    og_img = f"https://www.gta6heistguide.com{h['image']}"
    faq_entities = [
        {
            "@type": "Question",
            "name": q,
            "acceptedAnswer": {"@type": "Answer", "text": a}
        } for q, a in h["faqs"]
    ]
    schema = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "Article",
                "headline": h["title"],
                "description": h["meta_desc"],
                "image": og_img,
                "url": canonical,
                "datePublished": "2026-11-19",
                "dateModified": "2026-11-21",
                "publisher": {"@type": "Organization", "name": "GTA6HeistGuide.com"}
            },
            {
                "@type": "FAQPage",
                "mainEntity": faq_entities
            },
            {
                "@type": "BreadcrumbList",
                "itemListElement": [
                    {"@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.gta6heistguide.com/"},
                    {"@type": "ListItem", "position": 2, "name": "Heists", "item": "https://www.gta6heistguide.com/#all-heists"},
                    {"@type": "ListItem", "position": 3, "name": h["short_title"], "item": canonical}
                ]
            }
        ]
    }
    stats_html = "\n".join(
        f'''<div style="background:rgba(15,23,42,0.85); border:1px solid rgba(0,240,255,0.22); border-radius:8px; padding:0.7rem 0.85rem;">
            <div style="font-size:0.7rem; text-transform:uppercase; letter-spacing:0.8px; color:#94a3b8; font-family:var(--font-mono);">{k}</div>
            <div style="font-size:0.95rem; font-weight:800; color:#fff; margin-top:0.2rem;">{v}</div>
        </div>''' for k, v in h["stats"]
    )
    setups_html = "\n".join(
        f'''<li style="margin-bottom:0.65rem; padding:0.65rem 0.85rem; background:rgba(12,20,34,0.75); border-left:3px solid var(--neon-pink); border-radius:0 6px 6px 0;">
            <strong style="color:#fff;">{name}:</strong> <span style="color:#cbd5e1;">{desc}</span>
        </li>''' for name, desc in h["setups"]
    )
    steps_html = "\n".join(
        f'''<div style="background:rgba(10,16,28,0.88); border:1px solid rgba(0,240,255,0.2); border-radius:10px; padding:1rem 1.15rem; margin-bottom:0.75rem;">
            <h3 style="margin:0 0 0.35rem; font-size:1.05rem; color:var(--neon-cyan);">{st}</h3>
            <p style="margin:0; color:#e2e8f0; font-size:0.92rem; line-height:1.55;">{desc}</p>
        </div>''' for st, desc in h["steps"]
    )
    faqs_html = "\n".join(
        f'''<div style="background:rgba(10,16,28,0.85); border:1px solid rgba(255,255,255,0.08); border-radius:8px; padding:0.9rem 1.1rem; margin-bottom:0.6rem;">
            <h3 style="margin:0 0 0.35rem; font-size:0.98rem; color:#fff;">{q}</h3>
            <p style="margin:0; font-size:0.88rem; color:#cbd5e1; line-height:1.5;">{a}</p>
        </div>''' for q, a in h["faqs"]
    )
    other_links = "\n".join(
        f'''<a href="/heists/{o['slug']}.html" style="display:block; padding:0.6rem 0.85rem; background:rgba(15,23,42,0.85); border:1px solid rgba(0,240,255,0.25); border-radius:8px; color:#e2e8f0; text-decoration:none; font-size:0.84rem; font-weight:700;">&rarr; {o['short_title']}</a>'''
        for o in HEISTS if o["slug"] != h["slug"]
    )

    return f'''<!DOCTYPE html>
<html lang="en">
<head>
    <link rel="icon" type="image/svg+xml" href="/favicon.svg">
    <meta charset="UTF-8">
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{h['title']} | GTA6HeistGuide.com</title>
    <meta name="description" content="{h['meta_desc']}">
    <link rel="canonical" href="{canonical}">
    <meta property="og:title" content="{h['title']} | GTA6HeistGuide.com">
    <meta property="og:description" content="{h['meta_desc']}">
    <meta property="og:type" content="article">
    <meta property="og:url" content="{canonical}">
    <meta property="og:image" content="{og_img}">
    <meta name="twitter:card" content="summary_large_image">
    <link rel="stylesheet" href="/assets/style.css?v=20261121_v7">
    <script type="application/ld+json">
{json.dumps(schema, indent=2)}
    </script>
</head>
<body>
<div class="countdown-strip">
    <div class="countdown-strip-inner">
        <div class="strip-left-items">
            <span class="strip-pill" style="background:rgba(0,255,136,0.15); border:1px solid var(--neon-green); color:var(--neon-green); font-weight:900;">
                <span class="strip-pulse" style="background:var(--neon-green);"></span>
                <span class="launch-mode-label" data-launch-banner>🔥 GTA 6 IS LIVE — DAY-3 HEISTS, CHEATS, MAPS &amp; DROPS</span>
            </span>
            <span class="strip-divider">|</span>
            <span class="strip-pill" style="color:#94a3b8;">GTA 6 Online: <span style="color:var(--neon-amber); font-weight:700;">No official release date announced</span></span>
        </div>
    </div>
</div>

<nav class="navbar">
    <div class="nav-container">
        <a href="/" class="brand-logo">
            <span>GTA 6</span>
            <span class="vi">HEIST GUIDE</span>
            <span class="brand-badge">Syndicate v3.3</span>
        </a>
        <ul class="nav-links">
            <li><a href="/" class="nav-pill active">Heists</a></li>
            <li><a href="/interactive-map" class="nav-pill">Map</a></li>
            <li><a href="/properties.html" class="nav-pill" style="color:var(--neon-cyan); font-weight:800;">🏠 Properties</a></li>
            <li><a href="/animals.html" class="nav-pill" style="color:var(--neon-green); font-weight:800;">🐊 Animals</a></li>
            <li><a href="/save-planner" class="nav-pill">💾 Save Planner</a></li>
            <li><a href="/cheats" class="nav-pill">⚡ Cheats</a></li>
            <li><a href="/cash-guide" class="nav-pill">💰 Cash Guide</a></li>
        </ul>
        <div class="nav-actions">
            <a href="/" class="btn btn-secondary" style="padding:0.38rem 0.85rem; font-size:0.78rem;">&larr; All Heists</a>
        </div>
    </div>
</nav>

<main class="container" style="max-width: 1040px; margin: 0 auto; padding: 1.25rem 1rem 2.5rem;">
    <div style="font-size:0.8rem; color:#94a3b8; margin-bottom:0.75rem; font-family:var(--font-mono);">
        <a href="/" style="color:var(--neon-cyan); text-decoration:none;">Home</a> / <a href="/#all-heists" style="color:var(--neon-cyan); text-decoration:none;">Heists</a> / <span style="color:#fff;">{h['short_title']}</span>
    </div>

    <header style="margin-bottom:1.5rem;">
        <span class="user-badge" style="background:rgba(255,42,133,0.18); border:1px solid var(--neon-pink); color:var(--neon-pink); font-size:0.72rem; padding:0.2rem 0.55rem; font-weight:800;">{h['badge']}</span>
        <h1 style="font-size:clamp(1.5rem, 3vw, 2.25rem); font-weight:1000; color:#fff; margin:0.55rem 0 0.75rem; line-height:1.2;">{h['title']}</h1>

        <div style="width:100%; aspect-ratio:16/9; overflow:hidden; border-radius:12px; border:1px solid rgba(0,240,255,0.3); margin-bottom:1.1rem; background:#090e18;">
            <img src="{h['image']}" alt="{h['title']} — Official Rockstar GTA 6 Screenshot" class="aspect-video object-cover" style="width:100%; height:100%; object-fit:cover; display:block;">
        </div>

        <!-- QUICK-ANSWER FEATURED SNIPPET BOX -->
        <div class="quick-answer-box" style="background:rgba(10,18,32,0.94); border-left:4px solid var(--neon-cyan); border-radius:0 10px 10px 0; padding:1rem 1.2rem; margin-bottom:1.15rem;">
            <div style="font-size:0.72rem; font-weight:900; color:var(--neon-cyan); text-transform:uppercase; letter-spacing:1px; font-family:var(--font-mono); margin-bottom:0.35rem;">⚡ QUICK-ANSWER WALKTHROUGH SUMMARY</div>
            <p style="margin:0; color:#e2e8f0; font-size:0.95rem; line-height:1.6;">{h['quick_answer']}</p>
        </div>

        <!-- KEY INTEL STATS -->
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(160px, 1fr)); gap:0.65rem;">
            {stats_html}
        </div>
    </header>

    <!-- RECOMMENDED HEIST SETUP & FUEL BAR -->
    <section style="background:rgba(10,16,28,0.92); border:1px solid rgba(0,255,136,0.3); border-radius:10px; padding:0.95rem 1.15rem; margin-bottom:1.5rem;">
        <div style="font-size:0.74rem; font-weight:900; color:var(--neon-green); text-transform:uppercase; letter-spacing:1px; font-family:var(--font-mono); margin-bottom:0.5rem;">⚡ RECOMMENDED HEIST SETUP &amp; FUEL</div>
        <div style="display:flex; flex-wrap:wrap; gap:0.6rem; align-items:center;">
            <a href="YOUR_GFUEL_TRACKING_LINK" data-aff-link="gfuel" target="_blank" rel="sponsored noopener noreferrer" data-aff-partner="gfuel" data-aff-placement="heist-setup-bar" class="btn btn-primary" style="padding:0.42rem 0.85rem; font-size:0.78rem; font-weight:800; background:linear-gradient(135deg, #00ff88, #00c2ff); color:#000;">⚡ G FUEL Gaming Energy &rarr;</a>
            <a href="https://www.amazon.com/s?k=PlayStation+Pulse+Elite+Wireless+Headset&tag=gta6heistguid-20" data-aff-link="pulseElite" target="_blank" rel="sponsored noopener noreferrer" data-aff-partner="amazon" data-aff-placement="heist-setup-bar" class="btn btn-secondary" style="padding:0.42rem 0.85rem; font-size:0.78rem;">🎧 PULSE Elite Headset (Amazon)</a>
            <a href="https://www.amazon.com/s?k=DualSense+Edge+Wireless+Controller&tag=gta6heistguid-20" data-aff-link="dualsenseEdge" target="_blank" rel="sponsored noopener noreferrer" data-aff-partner="amazon" data-aff-placement="heist-setup-bar" class="btn btn-secondary" style="padding:0.42rem 0.85rem; font-size:0.78rem;">🎮 DualSense Edge (Amazon)</a>
            <a href="https://apexlocallabs.gumroad.com/l/cutflow-pro" data-aff-link="cutflow" target="_blank" rel="sponsored noopener noreferrer" data-aff-partner="gumroad" data-aff-placement="heist-setup-bar" class="btn btn-secondary" style="padding:0.42rem 0.85rem; font-size:0.78rem; border-color:var(--neon-pink); color:var(--neon-pink);">🎬 CutFlow Pro Clip Editor</a>
            <a href="https://www.exitlag.com/refer/10386953" data-aff-link="exitlag" target="_blank" rel="sponsored noopener noreferrer" data-aff-partner="exitlag" data-aff-placement="heist-setup-bar" class="btn btn-secondary" style="padding:0.42rem 0.85rem; font-size:0.78rem; border-color:#c084fc; color:#c084fc;">🚀 Activate ExitLag (Free Trial)</a>
        </div>
    </section>

    <!-- SETUPS & PREPARATION -->
    <section style="margin-bottom:1.75rem;">
        <h2 style="font-size:1.35rem; color:#fff; margin-bottom:0.75rem; border-bottom:1px solid rgba(0,240,255,0.2); padding-bottom:0.4rem;">Mandatory Setups &amp; Prep Checklist</h2>
        <ul style="list-style:none; padding:0; margin:0;">
            {setups_html}
        </ul>
    </section>

    <!-- STEP-BY-STEP WALKTHROUGH -->
    <section style="margin-bottom:1.75rem;">
        <h2 style="font-size:1.35rem; color:#fff; margin-bottom:0.75rem; border-bottom:1px solid rgba(0,240,255,0.2); padding-bottom:0.4rem;">Step-by-Step Tactical Walkthrough</h2>
        {steps_html}
    </section>

    <!-- DUO TACTICS, STEALTH VS LOUD & FENCING/ATM MECHANICS -->
    <section style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:0.85rem; margin-bottom:1.75rem;">
        <div style="background:rgba(12,20,34,0.9); border:1px solid rgba(0,240,255,0.3); border-radius:10px; padding:1rem;">
            <h3 style="margin:0 0 0.4rem; color:var(--neon-cyan); font-size:1rem;">🤝 Jason &amp; Lucia Duo Tactics</h3>
            <p style="margin:0; color:#cbd5e1; font-size:0.88rem; line-height:1.55;">{h['duo_tactics']}</p>
        </div>
        <div style="background:rgba(12,20,34,0.9); border:1px solid rgba(255,42,133,0.3); border-radius:10px; padding:1rem;">
            <h3 style="margin:0 0 0.4rem; color:var(--neon-pink); font-size:1rem;">🔇 Stealth vs. Loud Tradeoffs</h3>
            <p style="margin:0; color:#cbd5e1; font-size:0.88rem; line-height:1.55;">{h['stealth_vs_loud']}</p>
        </div>
        <div style="background:rgba(12,20,34,0.9); border:1px solid rgba(0,255,136,0.3); border-radius:10px; padding:1rem;">
            <h3 style="margin:0 0 0.4rem; color:var(--neon-green); font-size:1rem;">🏧 Fencing &amp; Physical ATM Banking</h3>
            <p style="margin:0; color:#cbd5e1; font-size:0.88rem; line-height:1.55;">{h['fencing_banking']}</p>
        </div>
    </section>

    <!-- FAQ SECTION -->
    <section style="margin-bottom:1.75rem;">
        <h2 style="font-size:1.3rem; color:#fff; margin-bottom:0.75rem;">Frequently Asked Questions</h2>
        {faqs_html}
    </section>

    <!-- MORE GTA 6 HEIST WALKTHROUGHS -->
    <section>
        <h2 style="font-size:1.15rem; color:#fff; margin-bottom:0.7rem;">Explore All 8 GTA 6 Heist &amp; Robbery Guides</h2>
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:0.6rem;">
            {other_links}
        </div>
    </section>
</main>

<footer style="border-top:1px solid rgba(255,255,255,0.08); padding:1.5rem 1rem; text-align:center; color:#64748b; font-size:0.8rem;">
    <div style="margin-bottom:0.65rem; display:flex; justify-content:center; gap:1rem; flex-wrap:wrap;">
        <a href="/" style="color:#94a3b8; text-decoration:none;">Home</a>
        <a href="/properties.html" style="color:var(--neon-cyan); text-decoration:none;">🏠 Properties</a>
        <a href="/animals.html" style="color:var(--neon-green); text-decoration:none;">🐊 Animals</a>
        <a href="/save-planner" style="color:#94a3b8; text-decoration:none;">Save Planner</a>
        <a href="/cheats" style="color:#94a3b8; text-decoration:none;">Cheats</a>
        <a href="/settings" style="color:#94a3b8; text-decoration:none;">Settings</a>
        <a href="/cash-guide" style="color:#94a3b8; text-decoration:none;">Cash Guide</a>
    </div>
    <p style="margin:0;">GTA6HeistGuide.com is an independent fan guide. As an Amazon Associate (tag: <code>gta6heistguid-20</code>), G FUEL (ID: 3162838), ExitLag, Gumroad, G2A, and Eneba partner, this site earns commissions on qualifying purchases.</p>
</footer>
<script src="/js/affiliates.js"></script>
<script src="/site-config.js"></script>
<script src="/assets/main.js" defer></script>
</body>
</html>
'''

def main():
    for h in HEISTS:
        out_path = os.path.join(OUT_DIR, f"{h['slug']}.html")
        with open(out_path, "w", encoding="utf-8", newline="\n") as f:
            f.write(render_page(h))
        print(f"[OK] Built {out_path}")

if __name__ == "__main__":
    main()
