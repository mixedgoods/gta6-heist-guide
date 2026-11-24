// Canonical URL permanent redirect middleware for extensionless canonical pages.
// Explicitly allowlists only canonical extensionless routes so legacy .html pages,
// /guides/*.html, /compare/*.html, /google*.html, /api/*, and /cd-admin/* are never altered.

const CANONICAL_REDIRECTS = new Map([
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
  ["/articles/how-to-beat-15-second-biometric-vault-keypad-hack-gta-6.html", "/articles/how-to-beat-15-second-biometric-vault-keypad-hack-gta-6"],
  ["/articles/how-to-clip-auto-edit-916-vertical-gta-6-heist-highlights-offline.html", "/articles/how-to-clip-auto-edit-916-vertical-gta-6-heist-highlights-offline"],
  ["/articles/leaked-leonida-collectors-map-lummox-pelican-valley-key-lento.html", "/articles/leaked-leonida-collectors-map-lummox-pelican-valley-key-lento"],
  ["/articles/protecting-gta-6-online-heist-lobby-ip-sniffing-texture-pop-in.html", "/articles/protecting-gta-6-online-heist-lobby-ip-sniffing-texture-pop-in"],
  ["/articles/solo-vs-4-player-co-op-heist-splits-gta-6-loot-weight.html", "/articles/solo-vs-4-player-co-op-heist-splits-gta-6-loot-weight"],
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

  const target = CANONICAL_REDIRECTS.get(url.pathname);
  if (target) {
    url.pathname = target;
    return Response.redirect(url.toString(), 301);
  }

  return context.next();
}
