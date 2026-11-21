const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const SEED_DISCOVERIES = [
  {
    id: 1,
    type: "cheat",
    title: "$250,000 Instant Cash",
    code_or_location: "↑ → ↓ ← ↑ ← ↓ →",
    unlock_condition: "Finish story campaign",
    upvotes: 42,
    verified: 1,
    submitted_by: "SyndicateRecon",
    created_at: "2026-11-20 00:00:00"
  },
  {
    id: 2,
    type: "cheat",
    title: "Raise Wanted Level (+1 Star)",
    code_or_location: "← ↓ → ↓ ↑ → ↑",
    unlock_condition: "Lose 3-star wanted level 50 times",
    upvotes: 28,
    verified: 1,
    submitted_by: "ViceRunner",
    created_at: "2026-11-20 00:05:00"
  },
  {
    id: 3,
    type: "cheat",
    title: "Max Body Armor",
    code_or_location: "↓ ↑ ← ↑ ↑ ↑ ↑ ↑ ↓ ↓",
    unlock_condition: "Complete 100 workouts at Vice City Muscle Gym",
    upvotes: 35,
    verified: 1,
    submitted_by: "Enforcer99",
    created_at: "2026-11-20 00:10:00"
  },
  {
    id: 4,
    type: "cheat",
    title: "Vehicle Ramming Force Multiplier",
    code_or_location: "↓ ↑ ← ← → ↓ ← ↑ ↓",
    unlock_condition: "Kill 25 cartel enemies with vehicles",
    upvotes: 19,
    verified: 1,
    submitted_by: "WheelmanPro",
    created_at: "2026-11-20 00:15:00"
  },
  {
    id: 5,
    type: "cheat",
    title: "1986 Retro CRT Filter",
    code_or_location: "↓ ↓ ↑ → → ↑ ← ← ← →",
    unlock_condition: "Rob 50 convenience stores with partner",
    upvotes: 23,
    verified: 1,
    submitted_by: "ViceNostalgia",
    created_at: "2026-11-20 00:20:00"
  },
  {
    id: 6,
    type: "cheat",
    title: "Spawn HVY Bulldozer",
    code_or_location: "← ↑ → ↓ ← → → ↑",
    unlock_condition: "Discover in Progress menu in Port Gellhorn industrial yard",
    upvotes: 31,
    verified: 1,
    submitted_by: "HeavyOperator",
    created_at: "2026-11-20 00:25:00"
  },
  {
    id: 7,
    type: "cash_spot",
    title: "Fishing Shacks Secret Safe",
    code_or_location: "North Grassrivers Basin Dock #3",
    unlock_condition: "Chapter 1: Crack lockbox behind fish cleaning bench ($4,200 cash)",
    upvotes: 17,
    verified: 1,
    submitted_by: "SwampRat",
    created_at: "2026-11-20 01:00:00"
  },
  {
    id: 8,
    type: "cash_spot",
    title: "Exotic Animals Front Smuggler Crate",
    code_or_location: "Kelly County Reptile Farm Shed",
    unlock_condition: "Chapter 1: Pick rear padlock for bearer bonds ($6,800 cash)",
    upvotes: 14,
    verified: 1,
    submitted_by: "AlligatorAl",
    created_at: "2026-11-20 01:15:00"
  },
  {
    id: 9,
    type: "cash_spot",
    title: "Sunrise RV Park Hidden Floorboard",
    code_or_location: "Trailer #14 (Lot B), Ambrosia Border",
    unlock_condition: "Chapter 2: Pry up loose floorboards under bed ($8,500 cash)",
    upvotes: 11,
    verified: 1,
    submitted_by: "TrailerKing",
    created_at: "2026-11-20 02:00:00"
  },
  {
    id: 10,
    type: "cash_spot",
    title: "June Warehouse Stash Locker",
    code_or_location: "Port Gellhorn Industrial Sector Pier 2",
    unlock_condition: "Chapter 2: Bolt-cutter rear roll-up door ($12,000 cash)",
    upvotes: 9,
    verified: 1,
    submitted_by: "DockMaster",
    created_at: "2026-11-20 02:30:00"
  },
  {
    id: 11,
    type: "weapon_bonus",
    title: "Vice City Firearms Custom Suppressors",
    code_or_location: "Downtown Vice City (corner 4th & Biscayne)",
    unlock_condition: "Open Day-1; discounted 9mm & 5.56 tactical suppressors",
    upvotes: 16,
    verified: 1,
    submitted_by: "SilentGunner",
    created_at: "2026-11-20 03:00:00"
  },
  {
    id: 12,
    type: "weapon_bonus",
    title: "Jason Duval Signature ES9 Claim",
    code_or_location: "Any Safehouse Weapon Trunk",
    unlock_condition: "Ultimate Edition claim: check personal duffle bag in trunk armory",
    upvotes: 25,
    verified: 1,
    submitted_by: "MastermindHQ",
    created_at: "2026-11-20 03:30:00"
  }
];

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...CORS_HEADERS,
    },
  });
}

async function ensureTable(db) {
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS live_discoveries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        code_or_location TEXT NOT NULL,
        unlock_condition TEXT NOT NULL,
        upvotes INTEGER DEFAULT 1,
        verified INTEGER DEFAULT 0,
        submitted_by TEXT DEFAULT 'ViceOperative',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`
    )
    .run();
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function onRequestGet({ request, env }) {
  try {
    const url = new URL(request.url);
    const filterType = url.searchParams.get("type");

    if (!env || !env.DB) {
      let filtered = SEED_DISCOVERIES;
      if (filterType) {
        filtered = SEED_DISCOVERIES.filter((d) => d.type === filterType);
      }
      return jsonResponse({
        ok: true,
        fallback: true,
        verified: filtered.filter((d) => d.verified === 1 || d.upvotes >= 3),
        community: filtered.filter((d) => d.verified === 0 && d.upvotes < 3),
      });
    }

    await ensureTable(env.DB);

    let query = "SELECT id, type, title, code_or_location, unlock_condition, upvotes, verified, submitted_by, created_at FROM live_discoveries";
    let params = [];
    if (filterType) {
      query += " WHERE type = ?1";
      params.push(filterType);
    }
    query += " ORDER BY upvotes DESC, id DESC LIMIT 100";

    const stmt = env.DB.prepare(query);
    const { results } = params.length > 0 ? await stmt.bind(...params).all() : await stmt.all();

    let list = results || [];
    if (list.length === 0) {
      // Seed if empty
      for (const item of SEED_DISCOVERIES) {
        await env.DB.prepare(
          `INSERT INTO live_discoveries (type, title, code_or_location, unlock_condition, upvotes, verified, submitted_by)
           VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)`
        )
          .bind(item.type, item.title, item.code_or_location, item.unlock_condition, item.upvotes, item.verified, item.submitted_by)
          .run();
      }
      const refetch = await env.DB.prepare(query).all();
      list = refetch.results || [];
    }

    const verified = list.filter((r) => r.verified === 1 || Number(r.upvotes) >= 3);
    const community = list.filter((r) => r.verified === 0 && Number(r.upvotes) < 3);

    return jsonResponse({
      ok: true,
      total: list.length,
      verified,
      community,
    });
  } catch (err) {
    return jsonResponse({ ok: false, error: err.message }, 500);
  }
}

export async function onRequestPost({ request, env }) {
  try {
    const rawText = await request.text();
    let body = {};
    try {
      body = rawText ? JSON.parse(rawText) : {};
    } catch (e) {
      return jsonResponse({ ok: false, error: "Invalid JSON payload." }, 400);
    }

    if (!env || !env.DB) {
      return jsonResponse({ ok: true, fallback: true, message: "Saved in client preview mode." });
    }

    await ensureTable(env.DB);

    // Vote action
    if (body.action === "vote" || body.voteId) {
      const voteId = Number(body.voteId || body.id);
      if (!voteId) {
        return jsonResponse({ ok: false, error: "Missing discovery voteId." }, 400);
      }

      await env.DB.prepare(
        `UPDATE live_discoveries
         SET upvotes = upvotes + 1,
             verified = CASE WHEN upvotes + 1 >= 3 THEN 1 ELSE verified END
         WHERE id = ?1`
      )
        .bind(voteId)
        .run();

      const updated = await env.DB.prepare(
        "SELECT id, type, title, code_or_location, unlock_condition, upvotes, verified, submitted_by FROM live_discoveries WHERE id = ?1"
      )
        .bind(voteId)
        .first();

      return jsonResponse({
        ok: true,
        action: "voted",
        item: updated,
      });
    }

    // New discovery submission (supports cheats, cash_spot, hidden_feature, vehicle_control, location, easter_egg, money_tip, glitch, discovery)
    const type = String(body.type || "discovery").trim().toLowerCase().slice(0, 40);
    const title = String(body.title || "").trim().slice(0, 140);
    const code_or_location = String(body.code_or_location || body.code || body.location || "").trim().slice(0, 200);
    const unlock_condition = String(body.unlock_condition || body.unlock || body.details || body.controls || "").trim().slice(0, 320);
    const submitted_by = String(body.submitted_by || "ViceOperative").trim().slice(0, 40);

    if (!title || !code_or_location) {
      return jsonResponse({ ok: false, error: "Title and Location / Code details are required." }, 400);
    }

    const res = await env.DB.prepare(
      `INSERT INTO live_discoveries (type, title, code_or_location, unlock_condition, upvotes, verified, submitted_by)
       VALUES (?1, ?2, ?3, ?4, 1, 0, ?5)`
    )
      .bind(type, title, code_or_location, unlock_condition || "Community Discovery", submitted_by)
      .run();

    return jsonResponse({
      ok: true,
      message: "Discovery submitted to the Cloudflare D1 Community Queue. It auto-promotes to Verified Live once 3+ players confirm it works!",
      id: res.meta?.last_row_id || null,
      type,
      title,
      code_or_location,
      unlock_condition: unlock_condition || "Community Discovery",
      submitted_by,
    });
  } catch (err) {
    return jsonResponse({ ok: false, error: err.message }, 500);
  }
}
