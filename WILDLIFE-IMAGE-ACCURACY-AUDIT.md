# WILDLIFE IMAGE ACCURACY & TAXONOMY AUDIT

- **Site:** GTA6HeistGuide.com (`/animals.html` & `/data/animals.json`)
- **Audit Date:** 2026-11-23
- **Baseline Commit Preserved:** `f7cbebc`
- **Total Entries Audited:** 49 of 49
- **Verified GTA VI Gameplay Screenshots:** 7 (Official Rockstar Games GTA VI Press Kit)
- **Real-World Species Reference Photographs (GTA VI Presence Unconfirmed):** 42 (Licensed Wikimedia Commons / Public Domain)
- **Missing Local Image Files:** 0

## Summary of Critical Corrections

1. **White River Otter (`an-river-otter`) -> North American River Otter (*Lontra canadensis*):** Renamed to match taxonomy and the Wikimedia Commons reference photograph (`File:River_Otter_(Lontra_canadensis).jpg`, Neal Herbert, Public Domain).
2. **Stingray / Manta Ray (`an-stingray`) -> Southern Stingray (*Hypanus americanus*):** Removed Manta Ray (*Mobula birostris*) from this record because the Wikimedia Commons photograph (`File:Hypanus_americanus_447371699.jpg`, Dan Schofield, CC BY 4.0) depicts a Southern Stingray.
3. **Generic Common Names Tightened to Exact Photographed Species:** Updated `Seagull` -> `Laughing Gull`, `Woodpecker` -> `Pileated Woodpecker`, `Duck` -> `Mallard Duck`, `Pelican` -> `Brown Pelican`, `Pigeon` -> `Rock Pigeon`, `Hammerhead Shark` -> `Scalloped Hammerhead Shark`, `Eel` -> `Green Moray Eel`, `Jellyfish` -> `Moon Jellyfish`, `Crayfish` -> `Red Swamp Crayfish`, `Alligator` -> `American Alligator`, `Black Bear` -> `American Black Bear`, `Raccoon` -> `Northern Raccoon`, `Beaver` -> `North American Beaver`, `Skunk` -> `Striped Skunk`, `Squirrel` -> `Eastern Gray Squirrel`, `Manatee` -> `West Indian Manatee`, `Dolphin` -> `Bottlenose Dolphin`, `Sea Turtle` -> `Green Sea Turtle`, `Lionfish` -> `Red Lionfish`, `Doberman` -> `Doberman Pinscher`, and added `scientificName` to all 49 entries.
4. **Three-Tier Evidence Separation Implemented:** Every entry now carries explicit `evidenceClass` (`VERIFIED GTA VI GAMEPLAY` vs. `GTA VI PRESENCE UNCONFIRMED`), `photoClassification` (`VERIFIED GTA VI GAMEPLAY` vs. `REAL-WORLD SPECIES REFERENCE`), `gta6PresenceConfirmed`, and `countsTowardCompletion` fields. Unverified `target-deck`, `legendary-hunter`, in-game region claims, and unverified `mapPinId` links were stripped from all 42 unconfirmed real-world reference entries.
5. **100% Completion Tracker Protection (Non-Destructive):** Reference browsing on `/animals.html` now saves to `gta6_animals_ref_browsed_v1` and never writes to `db:owned:animals:<id>`. On `/gta-6-100-completion-tracker/`, `getIndexedAnimalsStudiedCount()` filters strictly to `gta6PresenceConfirmed === true && countsTowardCompletion === true` (the 7 verified species), preserving existing user LocalStorage non-destructively.
6. **Zero Unrelated Affiliate Ads on `/animals.html`:** Confirmed 0 affiliate slots or Amazon links on `/animals.html`, plus a hard pathname guard in `public/js/affiliates.js`.

## Complete 49-Entry Audit Table

| # | ID | Common Name | Scientific Name | Evidence Class | Photo Classification | Counts to 100%? | Photographer / Source | License | Status |
|---|---|---|---|---|---|---|---|---|---|
| 01 | `an-alligator` | American Alligator | *Alligator mississippiensis* | `VERIFIED GTA VI GAMEPLAY` | `VERIFIED GTA VI GAMEPLAY` | YES | Official Rockstar Games GTA VI Press Kit (Grassrivers) | Official Press Kit | PASS |
| 02 | `an-panther` | Florida Panther | *Puma concolor coryi* | `VERIFIED GTA VI GAMEPLAY` | `VERIFIED GTA VI GAMEPLAY` | YES | Official Rockstar Games GTA VI Press Kit (Mount Kalaga) | Official Press Kit | PASS |
| 03 | `an-black-bear` | American Black Bear | *Ursus americanus* | `GTA VI PRESENCE UNCONFIRMED` | `REAL-WORLD SPECIES REFERENCE` | NO (Ref Only) | Charles J. Sharp | CC BY-SA 4.0 | PASS |
| 04 | `an-bobcat` | Bobcat | *Lynx rufus* | `GTA VI PRESENCE UNCONFIRMED` | `REAL-WORLD SPECIES REFERENCE` | NO (Ref Only) | Letartean | CC BY 3.0 | PASS |
| 05 | `an-whitetail-buck` | White-tailed Deer (Buck) | *Odocoileus virginianus* | `GTA VI PRESENCE UNCONFIRMED` | `REAL-WORLD SPECIES REFERENCE` | NO (Ref Only) | Tyler Savitski | CC BY-SA 4.0 | PASS |
| 06 | `an-whitetail-doe` | White-tailed Deer (Doe) | *Odocoileus virginianus* | `GTA VI PRESENCE UNCONFIRMED` | `REAL-WORLD SPECIES REFERENCE` | NO (Ref Only) | USFWS Mountain-Prairie | Public Domain | PASS |
| 07 | `an-wild-boar` | Wild Boar | *Sus scrofa* | `GTA VI PRESENCE UNCONFIRMED` | `REAL-WORLD SPECIES REFERENCE` | NO (Ref Only) | Byrdyak | CC BY-SA 4.0 | PASS |
| 08 | `an-armadillo` | Nine-Banded Armadillo | *Dasypus novemcinctus* | `GTA VI PRESENCE UNCONFIRMED` | `REAL-WORLD SPECIES REFERENCE` | NO (Ref Only) | MartinKlippel | CC BY-SA 4.0 | PASS |
| 09 | `an-river-otter` | North American River Otter | *Lontra canadensis* | `GTA VI PRESENCE UNCONFIRMED` | `REAL-WORLD SPECIES REFERENCE` | NO (Ref Only) | Neal Herbert | Public Domain | PASS |
| 10 | `an-macaque` | Rhesus Macaque | *Macaca mulatta* | `GTA VI PRESENCE UNCONFIRMED` | `REAL-WORLD SPECIES REFERENCE` | NO (Ref Only) | Giles Laurent | CC BY-SA 4.0 | PASS |
| 11 | `an-green-iguana` | Green Iguana | *Iguana iguana* | `VERIFIED GTA VI GAMEPLAY` | `VERIFIED GTA VI GAMEPLAY` | YES | Official Rockstar Games GTA VI Press Kit (Leonida Keys) | Official Press Kit | PASS |
| 12 | `an-cane-toad` | Cane Toad | *Rhinella marina* | `GTA VI PRESENCE UNCONFIRMED` | `REAL-WORLD SPECIES REFERENCE` | NO (Ref Only) | Wilfredor | CC0 1.0 Universal | PASS |
| 13 | `an-raccoon` | Northern Raccoon | *Procyon lotor* | `GTA VI PRESENCE UNCONFIRMED` | `REAL-WORLD SPECIES REFERENCE` | NO (Ref Only) | Rhododendrites | CC BY-SA 4.0 | PASS |
| 14 | `an-red-fox` | Red Fox | *Vulpes vulpes* | `GTA VI PRESENCE UNCONFIRMED` | `REAL-WORLD SPECIES REFERENCE` | NO (Ref Only) | Manojkiri photography | CC BY-SA 4.0 | PASS |
| 15 | `an-beaver` | North American Beaver | *Castor canadensis* | `GTA VI PRESENCE UNCONFIRMED` | `REAL-WORLD SPECIES REFERENCE` | NO (Ref Only) | DogsRNice | CC BY-SA 4.0 | PASS |
| 16 | `an-skunk` | Striped Skunk | *Mephitis mephitis* | `GTA VI PRESENCE UNCONFIRMED` | `REAL-WORLD SPECIES REFERENCE` | NO (Ref Only) | GoToVan | CC BY 2.0 | PASS |
| 17 | `an-squirrel` | Eastern Gray Squirrel | *Sciurus carolinensis* | `GTA VI PRESENCE UNCONFIRMED` | `REAL-WORLD SPECIES REFERENCE` | NO (Ref Only) | Wilfredor | CC0 1.0 Universal | PASS |
| 18 | `an-snake` | Marsh Snake (Leonida Viper) | *Agkistrodon / Crotalus sp.* | `VERIFIED GTA VI GAMEPLAY` | `VERIFIED GTA VI GAMEPLAY` | YES | Official Rockstar Games GTA VI Press Kit (Grassrivers) | Official Press Kit | PASS |
| 19 | `an-flamingo` | American Flamingo | *Phoenicopterus ruber* | `GTA VI PRESENCE UNCONFIRMED` | `REAL-WORLD SPECIES REFERENCE` | NO (Ref Only) | Wilfredor | CC0 1.0 Universal | PASS |
| 20 | `an-pelican` | Brown Pelican | *Pelecanus occidentalis* | `GTA VI PRESENCE UNCONFIRMED` | `REAL-WORLD SPECIES REFERENCE` | NO (Ref Only) | Frank Schulenburg | CC BY-SA 4.0 | PASS |
| 21 | `an-blue-heron` | Great Blue Heron | *Ardea herodias* | `GTA VI PRESENCE UNCONFIRMED` | `REAL-WORLD SPECIES REFERENCE` | NO (Ref Only) | Diego Delso | CC BY-SA 4.0 | PASS |
| 22 | `an-osprey` | Osprey | *Pandion haliaetus* | `GTA VI PRESENCE UNCONFIRMED` | `REAL-WORLD SPECIES REFERENCE` | NO (Ref Only) | El Golli Mohamed | CC BY-SA 4.0 | PASS |
| 23 | `an-spoonbill` | Roseate Spoonbill | *Platalea ajaja* | `GTA VI PRESENCE UNCONFIRMED` | `REAL-WORLD SPECIES REFERENCE` | NO (Ref Only) | Gordon Leggett | CC BY-SA 4.0 | PASS |
| 24 | `an-whooping-crane` | Whooping Crane | *Grus americana* | `GTA VI PRESENCE UNCONFIRMED` | `REAL-WORLD SPECIES REFERENCE` | NO (Ref Only) | Don Faulkner | CC BY-SA 2.0 | PASS |
| 25 | `an-cormorant` | Double-Crested Cormorant | *Nannopterum auritum* | `GTA VI PRESENCE UNCONFIRMED` | `REAL-WORLD SPECIES REFERENCE` | NO (Ref Only) | Paul Danese | CC BY-SA 4.0 | PASS |
| 26 | `an-duck` | Mallard Duck | *Anas platyrhynchos* | `GTA VI PRESENCE UNCONFIRMED` | `REAL-WORLD SPECIES REFERENCE` | NO (Ref Only) | Calibas (edit by Aqwis ) | CC BY-SA 3.0 | PASS |
| 27 | `an-seagull` | Laughing Gull | *Leucophaeus atricilla* | `GTA VI PRESENCE UNCONFIRMED` | `REAL-WORLD SPECIES REFERENCE` | NO (Ref Only) | Giles Laurent | CC BY-SA 4.0 | PASS |
| 28 | `an-bald-eagle` | Bald Eagle | *Haliaeetus leucocephalus* | `GTA VI PRESENCE UNCONFIRMED` | `REAL-WORLD SPECIES REFERENCE` | NO (Ref Only) | YellowstoneNPS | Public Domain | PASS |
| 29 | `an-woodpecker` | Pileated Woodpecker | *Dryocopus pileatus* | `GTA VI PRESENCE UNCONFIRMED` | `REAL-WORLD SPECIES REFERENCE` | NO (Ref Only) | Andy Reago & Chrissy McClarren | CC BY 2.0 | PASS |
| 30 | `an-pigeon` | Rock Pigeon | *Columba livia* | `GTA VI PRESENCE UNCONFIRMED` | `REAL-WORLD SPECIES REFERENCE` | NO (Ref Only) | Grendelkhan | CC BY-SA 4.0 | PASS |
| 31 | `an-manatee` | West Indian Manatee | *Trichechus manatus* | `GTA VI PRESENCE UNCONFIRMED` | `REAL-WORLD SPECIES REFERENCE` | NO (Ref Only) | Ramos Keith, U.S. Fish and Wildlife Service | Public Domain | PASS |
| 32 | `an-hammerhead` | Scalloped Hammerhead Shark | *Sphyrna lewini* | `GTA VI PRESENCE UNCONFIRMED` | `REAL-WORLD SPECIES REFERENCE` | NO (Ref Only) | Diego Delso | CC BY-SA 4.0 | PASS |
| 33 | `an-great-white` | Great White Shark | *Carcharodon carcharias* | `GTA VI PRESENCE UNCONFIRMED` | `REAL-WORLD SPECIES REFERENCE` | NO (Ref Only) | Pterantula (Terry Goss) at en.wikipedia | CC BY 2.5 | PASS |
| 34 | `an-dolphin` | Bottlenose Dolphin | *Tursiops truncatus* | `VERIFIED GTA VI GAMEPLAY` | `VERIFIED GTA VI GAMEPLAY` | YES | Official Rockstar Games GTA VI Press Kit (Vice Bay) | Official Press Kit | PASS |
| 35 | `an-sea-turtle` | Green Sea Turtle | *Chelonia mydas* | `VERIFIED GTA VI GAMEPLAY` | `VERIFIED GTA VI GAMEPLAY` | YES | Official Rockstar Games GTA VI Press Kit (Leonida Keys) | Official Press Kit | PASS |
| 36 | `an-stingray` | Southern Stingray | *Hypanus americanus* | `GTA VI PRESENCE UNCONFIRMED` | `REAL-WORLD SPECIES REFERENCE` | NO (Ref Only) | Dan Schofield | CC BY 4.0 | PASS |
| 37 | `an-lionfish` | Red Lionfish | *Pterois volitans* | `VERIFIED GTA VI GAMEPLAY` | `VERIFIED GTA VI GAMEPLAY` | YES | Official Rockstar Games GTA VI Press Kit (Leonida Keys) | Official Press Kit | PASS |
| 38 | `an-killer-whale` | Killer Whale (Orca) | *Orcinus orca* | `GTA VI PRESENCE UNCONFIRMED` | `REAL-WORLD SPECIES REFERENCE` | NO (Ref Only) | mliu92 from San Mateo | CC BY-SA 2.0 | PASS |
| 39 | `an-eel` | Green Moray Eel | *Gymnothorax funebris* | `GTA VI PRESENCE UNCONFIRMED` | `REAL-WORLD SPECIES REFERENCE` | NO (Ref Only) | P.Lindgren | CC BY-SA 3.0 | PASS |
| 40 | `an-jellyfish` | Moon Jellyfish | *Aurelia aurita* | `GTA VI PRESENCE UNCONFIRMED` | `REAL-WORLD SPECIES REFERENCE` | NO (Ref Only) | Luc Viatour | CC BY-SA 3.0 | PASS |
| 41 | `an-crayfish` | Red Swamp Crayfish | *Procambarus clarkii* | `GTA VI PRESENCE UNCONFIRMED` | `REAL-WORLD SPECIES REFERENCE` | NO (Ref Only) | Miquel Pujol Palol | CC BY-SA 3.0 | PASS |
| 42 | `an-aussie-shepherd` | Australian Shepherd | *Canis lupus familiaris* | `GTA VI PRESENCE UNCONFIRMED` | `REAL-WORLD SPECIES REFERENCE` | NO (Ref Only) | Joselodos | CC0 1.0 Universal | PASS |
| 43 | `an-chihuahua` | Chihuahua | *Canis lupus familiaris* | `GTA VI PRESENCE UNCONFIRMED` | `REAL-WORLD SPECIES REFERENCE` | NO (Ref Only) | Joselodos | CC0 1.0 Universal | PASS |
| 44 | `an-doberman` | Doberman Pinscher | *Canis lupus familiaris* | `GTA VI PRESENCE UNCONFIRMED` | `REAL-WORLD SPECIES REFERENCE` | NO (Ref Only) | Volaviaja | CC BY-SA 4.0 | PASS |
| 45 | `an-german-shepherd` | German Shepherd | *Canis lupus familiaris* | `GTA VI PRESENCE UNCONFIRMED` | `REAL-WORLD SPECIES REFERENCE` | NO (Ref Only) | Hans Kemperman | CC0 1.0 Universal | PASS |
| 46 | `an-labrador` | Labrador Retriever | *Canis lupus familiaris* | `GTA VI PRESENCE UNCONFIRMED` | `REAL-WORLD SPECIES REFERENCE` | NO (Ref Only) | IDS.photos from Tiverton, UK | CC BY-SA 2.0 | PASS |
| 47 | `an-rottweiler` | Rottweiler | *Canis lupus familiaris* | `GTA VI PRESENCE UNCONFIRMED` | `REAL-WORLD SPECIES REFERENCE` | NO (Ref Only) | Phil Sangwell from United Kingdom | CC BY 2.0 | PASS |
| 48 | `an-poodle` | Poodle | *Canis lupus familiaris* | `GTA VI PRESENCE UNCONFIRMED` | `REAL-WORLD SPECIES REFERENCE` | NO (Ref Only) | 7elteven | CC BY-SA 3.0 | PASS |
| 49 | `an-domestic-cat` | Domestic Cat | *Felis catus* | `GTA VI PRESENCE UNCONFIRMED` | `REAL-WORLD SPECIES REFERENCE` | NO (Ref Only) | W.carter | CC0 1.0 Universal | PASS |

## Subspecies Photography Notes (Transparency)

- `an-black-bear` (*Ursus americanus*): Licensed photo depicts the Vancouver Island subspecies (*U. a. vancouveri*), same species as the Florida Black Bear (*U. a. floridanus*). Noted in entry description.
- `an-red-fox` (*Vulpes vulpes*): Licensed photo depicts the Arabian subspecies (*V. v. arabica*), same species *Vulpes vulpes*. Noted in entry description.

## Verification Checks

- All 49 entries individually audited with scientific names: **PASS**
- `White River Otter` corrected to `North American River Otter`: **PASS**
- `Stingray / Manta Ray` corrected to `Southern Stingray`: **PASS**
- All 49 local image files verified present on disk: **PASS**
- Real-world reference-only entries excluded from 100% Completion Tracker: **PASS**
- Existing user LocalStorage preserved non-destructively: **PASS**
- Live browser visual inspection of all 49 cards on desktop/tablet/mobile: **NOT VERIFIED** (static/DOM/JS checks completed; visual browser run recommended before deploy)
