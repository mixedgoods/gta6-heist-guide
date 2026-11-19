const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function onRequestGet({ request, env }) {
  try {
    const url = new URL(request.url);
    const type = url.searchParams.get("type"); // characters, weapons, vehicles

    // Fetch the bundled static master intel
    const origin = url.origin;
    const res = await fetch(`${origin}/data/gta6_master_intel.json`);
    
    if (!res.ok) {
      return new Response(JSON.stringify({ ok: false, error: "Intel database unreachable" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...CORS_HEADERS },
      });
    }

    const data = await res.json();

    if (type && data[type]) {
      return new Response(JSON.stringify({
        ok: true,
        type,
        count: data[type].length,
        items: data[type],
        lastSynced: data.lastSynced,
      }), {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=60, s-maxage=60",
          ...CORS_HEADERS,
        },
      });
    }

    // High-frequency live check: fetch real-time YouTube RSS feed for Rockstar Games
    let liveAlert = null;
    try {
      const rockstarFeed = await fetch("https://www.youtube.com/feeds/videos.xml?channel_id=UCULwHhkI31JHAKe57LZdzcA", {
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) GTA6LiveEdgeBot/1.0" },
        cf: { cacheTtl: 60 }
      });
      if (rockstarFeed.ok) {
        const text = await rockstarFeed.text();
        const titleMatch = text.match(/<title>([^<]+)<\/title>/g);
        const linkMatch = text.match(/<link rel=['"]alternate['"] href=['"]([^'"]+)['"]/);
        if (titleMatch && titleMatch.length > 1) {
          const latestTitle = titleMatch[1].replace(/<\/?title>/g, "");
          const latestLink = linkMatch ? linkMatch[1] : "https://www.youtube.com/@RockstarGames";
          liveAlert = {
            channel: "Rockstar Games (Official)",
            title: latestTitle,
            url: latestLink,
            liveChecked: new Date().toISOString()
          };
        }
      }
    } catch (e) {}

    return new Response(JSON.stringify({
      ok: true,
      lastSynced: data.lastSynced,
      edgeCheckedAt: new Date().toISOString(),
      liveAlert,
      version: data.version,
      counts: {
        characters: data.characters ? data.characters.length : 18,
        weapons: data.weaponCatalog ? Object.keys(data.weaponCatalog).length : (data.weapons ? data.weapons.length : 24),
        vehicles: data.vehicleCatalog ? Object.keys(data.vehicleCatalog).length : (data.vehicles ? data.vehicles.length : 56),
        masks: data.gearCatalog ? Object.keys(data.gearCatalog).length : 16,
        properties: data.properties ? data.properties.length : 8,
      },
      data,
    }), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=60, s-maxage=60",
        ...CORS_HEADERS,
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }
}
