// Canonical URL permanent redirect (301) and retired-page (410 Gone) middleware.
// Explicitly allowlists only canonical redirects and retired URLs so /api/*,
// /cd-admin/*, /google*.html, and active static assets are never altered.

const GONE_ROUTES = new Set([
  "/compare/g2a-verified-keys-vs-eneba-store-gta6-deals",
  "/compare/g2a-verified-keys-vs-eneba-store-gta6-deals.html",
]);

const CANONICAL_REDIRECTS = new Map([
  // Extensionless canonicalization for active pages
  ["/port-gellhorn.html", "/port-gellhorn"],
  ["/weapons.html", "/weapons"],
  ["/weapons-gear", "/weapons"],
  ["/weapons-gear.html", "/weapons"],
  ["/weapons-bonuses.html", "/weapons-bonuses"],
  ["/lucia-jason-skills.html", "/lucia-jason-skills"],
  ["/map.html", "/map"],
  ["/cheats.html", "/cheats"],
  ["/secrets.html", "/secrets"],
  ["/properties.html", "/properties"],
  ["/animals.html", "/animals"],
  ["/vehicles.html", "/vehicles"],
  ["/radio.html", "/radio"],
  ["/heist-planner.html", "/heist-planner"],
  ["/heist-payout-calculator.html", "/heist-payout-calculator"],
  ["/leonida-wanted-system.html", "/leonida-wanted-system"],
  ["/escape-routes.html", "/escape-routes"],
  ["/gameplay-mechanics.html", "/gameplay-mechanics"],
  ["/crew-database.html", "/crew-database"],
  ["/safehouses-laundering.html", "/safehouses-laundering"],
  ["/live-intel.html", "/live-intel"],
  ["/live.html", "/live"],
  ["/drops.html", "/drops"],
  ["/giveaways.html", "/giveaways"],
  ["/about.html", "/about"],
  ["/contact.html", "/contact"],
  ["/privacy-policy.html", "/privacy-policy"],
  ["/terms.html", "/terms"],
  ["/guides/gta-6-safe-codes.html", "/guides/gta-6-safe-codes"],
  ["/guides/vice-city-portal-easter-egg.html", "/guides/vice-city-portal-easter-egg"],
  ["/heists/the-cartel-heist.html", "/heists/the-cartel-heist"],
  ["/heists/vcia-takedown.html", "/heists/vcia-takedown"],
  ["/heists/shops-and-stickups.html", "/heists/shops-and-stickups"],
  ["/heists/pawn-shops.html", "/heists/pawn-shops"],
  ["/heists/jewelry-stores.html", "/heists/jewelry-stores"],
  ["/heists/small-banks-payday-loans.html", "/heists/small-banks-payday-loans"],
  ["/heists/large-bank-vaults.html", "/heists/large-bank-vaults"],
  ["/heists/armored-trucks-gang-ops.html", "/heists/armored-trucks-gang-ops"],
  ["/articles/every-leonida-region-in-gta-6-mapped-escape-coordinates.html", "/articles/every-leonida-region-in-gta-6-mapped-escape-coordinates"],
  ["/articles/gta-6-heist-payout-math-true-net-dollar-per-hour.html", "/articles/gta-6-heist-payout-math-true-net-dollar-per-hour"],
  // Phase 2 consolidated legacy guides (5)
  ["/guides/port-gellhorn-container-terminal-crane-heist", "/port-gellhorn"],
  ["/guides/port-gellhorn-container-terminal-crane-heist.html", "/port-gellhorn"],
  ["/guides/fast-cash-laundering-fences-safehouses-guide", "/gta-6-money-guide/"],
  ["/guides/fast-cash-laundering-fences-safehouses-guide.html", "/gta-6-money-guide/"],
  ["/guides/vehicle-trunk-weapon-storage-armory-guide", "/gta-6-vehicles-guide/"],
  ["/guides/vehicle-trunk-weapon-storage-armory-guide.html", "/gta-6-vehicles-guide/"],
  ["/guides/best-2-player-lucia-jason-co-op-heist-loadouts", "/lucia-jason-skills"],
  ["/guides/best-2-player-lucia-jason-co-op-heist-loadouts.html", "/lucia-jason-skills"],
  ["/guides/raul-bautista-bank-robbery-mastermind-playbooks", "/heists/the-cartel-heist"],
  ["/guides/raul-bautista-bank-robbery-mastermind-playbooks.html", "/heists/the-cartel-heist"],
  // Phase 2 consolidated duplicate/merged root pages
  ["/settings", "/gta-6-settings/"],
  ["/settings.html", "/gta-6-settings/"],
  ["/settings-picker", "/gta-6-settings/"],
  ["/settings-picker.html", "/gta-6-settings/"],
  ["/vice-city-yacht-heist", "/missions/#walk-day-release"],
  ["/vice-city-yacht-heist.html", "/missions/#walk-day-release"],
  ["/sinfrontera-bank", "/heists/the-cartel-heist"],
  ["/sinfrontera-bank.html", "/heists/the-cartel-heist"],
  ["/leonida-reserve", "/"],
  ["/leonida-reserve.html", "/"],
  ["/everglades-smuggler-run", "/gta-6-money-guide/"],
  ["/everglades-smuggler-run.html", "/gta-6-money-guide/"],
  ["/ocean-drive-armored-convoy", "/gta-6-money-guide/"],
  ["/ocean-drive-armored-convoy.html", "/gta-6-money-guide/"],
  ["/interactive-map", "/map"],
  ["/interactive-map.html", "/map"],
  ["/leonida-interactive-map", "/map"],
  ["/leonida-interactive-map.html", "/map"],
  ["/vehicles-getaway-cars", "/vehicles"],
  ["/vehicles-getaway-cars.html", "/vehicles"],
  ["/money-guide", "/gta-6-money-guide/"],
  ["/money-guide.html", "/gta-6-money-guide/"],
  ["/save-planner.html", "/save-planner/"],
  ["/free.html", "/free/"],
  // Phase 6 extensionless canonical redirects (32)
  ["/missions/buck-me.html", "/missions/buck-me"],
  ["/missions/lab-fees.html", "/missions/lab-fees"],
  ["/missions/coming-home.html", "/missions/coming-home"],
  ["/missions/swamped.html", "/missions/swamped"],
  ["/missions/day-release.html", "/missions/day-release"],
  ["/missions/tourist-trap.html", "/missions/tourist-trap"],
  ["/missions/girls-trip.html", "/missions/girls-trip"],
  ["/missions/moses.html", "/missions/moses"],
  ["/missions/slam-dunk.html", "/missions/slam-dunk"],
  ["/missions/coffee-break.html", "/missions/coffee-break"],
  ["/missions/checking-out.html", "/missions/checking-out"],
  ["/missions/credit-check.html", "/missions/credit-check"],
  ["/locations/vice-city.html", "/locations/vice-city"],
  ["/locations/leonida-keys.html", "/locations/leonida-keys"],
  ["/locations/grassrivers.html", "/locations/grassrivers"],
  ["/locations/mount-kalaga.html", "/locations/mount-kalaga"],
  ["/locations/ambrosia.html", "/locations/ambrosia"],
  ["/locations/lake-leonida.html", "/locations/lake-leonida"],
  ["/guides/bret-vogel-hunting-target-decks.html", "/guides/bret-vogel-hunting-target-decks"],
  ["/guides/legendary-hunter-animals-guide.html", "/guides/legendary-hunter-animals-guide"],
  ["/guides/secret-radio-stations-poster-scans.html", "/guides/secret-radio-stations-poster-scans"],
  ["/guides/playable-arcade-retro-minigames.html", "/guides/playable-arcade-retro-minigames"],
  ["/guides/cocaine-flamingos-cards-collectibles.html", "/guides/cocaine-flamingos-cards-collectibles"],
  ["/guides/jason-duval-character-guide.html", "/guides/jason-duval-character-guide"],
  ["/guides/lucia-caminos-character-guide.html", "/guides/lucia-caminos-character-guide"],
  ["/guides/raul-bautista-crew-guide.html", "/guides/raul-bautista-crew-guide"],
  ["/guides/all-7-fences-and-vehicle-buyers.html", "/guides/all-7-fences-and-vehicle-buyers"],
  ["/guides/wank-app-slim-jim-vehicle-theft.html", "/guides/wank-app-slim-jim-vehicle-theft"],
  ["/guides/best-weapons-and-unique-variants.html", "/guides/best-weapons-and-unique-variants"],
  ["/guides/best-getaway-vehicles-and-trunk-storage.html", "/guides/best-getaway-vehicles-and-trunk-storage"],
  ["/guides/how-to-escape-police-wanted-levels.html", "/guides/how-to-escape-police-wanted-levels"],
  ["/guides/apollo-aggregates-red-barn-money-loop.html", "/guides/apollo-aggregates-red-barn-money-loop"],
]);

export async function onRequest(context) {
  const { request } = context;
  if (request.method !== "GET" && request.method !== "HEAD") {
    return context.next();
  }

  const url = new URL(request.url);
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/cd-admin")) {
    return context.next();
  }

  if (GONE_ROUTES.has(url.pathname)) {
    return new Response("410 Gone — This obsolete comparison page has been permanently retired.", {
      status: 410,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Robots-Tag": "noindex, nofollow",
        "Cache-Control": "public, max-age=3600",
      },
    });
  }

  const target = CANONICAL_REDIRECTS.get(url.pathname);
  if (target) {
    const hashIdx = target.indexOf("#");
    if (hashIdx !== -1) {
      url.pathname = target.slice(0, hashIdx);
      url.hash = target.slice(hashIdx);
    } else {
      url.pathname = target;
    }
    return Response.redirect(url.toString(), 301);
  }

  return context.next();
}
