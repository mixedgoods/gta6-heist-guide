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
          "Cache-Control": "public, max-age=300",
          ...CORS_HEADERS,
        },
      });
    }

    return new Response(JSON.stringify({
      ok: true,
      lastSynced: data.lastSynced,
      version: data.version,
      counts: {
        characters: data.characters.length,
        weapons: data.weapons.length,
        vehicles: data.vehicles.length,
      },
      data,
    }), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=300",
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
