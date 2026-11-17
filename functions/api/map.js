const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

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

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function onRequestGet({ env }) {
  try {
    const { results } = await env.DB.prepare(
      "SELECT id, title, category, region, x, y, payout_or_perk, description, link, status, votes, submitted_by, created_at FROM map_markers ORDER BY CASE WHEN status = 'verified' THEN 0 ELSE 1 END ASC, votes DESC, rowid ASC"
    ).all();

    return jsonResponse({
      ok: true,
      markers: results || [],
    });
  } catch (err) {
    return jsonResponse({ ok: false, error: err.message, markers: [] }, 500);
  }
}

export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json();
    const action = String(body.action || "submit").trim();

    if (action === "confirm") {
      const id = String(body.id || "").trim();
      if (!id) {
        return jsonResponse({ ok: false, error: "Marker ID is required." }, 400);
      }

      await env.DB.prepare(
        "UPDATE map_markers SET votes = votes + 1 WHERE id = ?1"
      )
        .bind(id)
        .run();

      const row = await env.DB.prepare(
        "SELECT id, title, category, region, x, y, payout_or_perk, description, link, status, votes, submitted_by FROM map_markers WHERE id = ?1"
      )
        .bind(id)
        .first();

      if (!row) {
        return jsonResponse({ ok: false, error: "Marker not found." }, 404);
      }

      let promoted = false;
      if (row.votes >= 3 && row.status !== "verified") {
        await env.DB.prepare(
          "UPDATE map_markers SET status = 'verified' WHERE id = ?1"
        )
          .bind(id)
          .run();
        row.status = "verified";
        promoted = true;
      }

      return jsonResponse({
        ok: true,
        promoted,
        repAwarded: promoted ? 500 : 100,
        marker: row,
      });
    }

    // Default action: submit new discovery pin
    const title = String(body.title || "").trim().slice(0, 100);
    const category = ["vault", "crew", "escape", "safehouse", "fence", "scanner", "stash"].includes(body.category)
      ? body.category
      : "stash";
    const region = [
      "Vice City",
      "Leonida Keys",
      "Grassrivers",
      "Port Gellhorn",
      "Ambrosia",
      "Mount Kalaga National Park",
    ].includes(body.region)
      ? body.region
      : "Vice City";
    const x = Math.max(40, Math.min(960, Math.round(Number(body.x) || 500)));
    const y = Math.max(40, Math.min(540, Math.round(Number(body.y) || 290)));
    const payout_or_perk = String(body.payout_or_perk || "Community Intel Discovery").trim().slice(0, 80);
    const description = String(body.description || "").trim().slice(0, 500);
    const submitted_by = String(body.submitted_by || "VerifiedOperative").trim().slice(0, 40);

    if (!title || !description) {
      return jsonResponse({ ok: false, error: "Pin title and tactical notes are required." }, 400);
    }

    // Auto-Verification Consensus Check: see if a community pin in the same category already exists nearby (within 35px)
    const nearby = await env.DB.prepare(
      "SELECT id, title, category, region, x, y, payout_or_perk, description, link, status, votes, submitted_by FROM map_markers WHERE category = ?1 AND ABS(x - ?2) <= 35 AND ABS(y - ?3) <= 35 LIMIT 1"
    )
      .bind(category, x, y)
      .first();

    if (nearby) {
      const newVotes = (nearby.votes || 1) + 1;
      const newStatus = newVotes >= 3 ? "verified" : nearby.status;
      const promoted = newVotes >= 3 && nearby.status !== "verified";

      await env.DB.prepare(
        "UPDATE map_markers SET votes = ?1, status = ?2 WHERE id = ?3"
      )
        .bind(newVotes, newStatus, nearby.id)
        .run();

      nearby.votes = newVotes;
      nearby.status = newStatus;

      return jsonResponse({
        ok: true,
        mergedWithExisting: true,
        promoted,
        repAwarded: promoted ? 500 : 150,
        marker: nearby,
      });
    }

    const id = `pin-comm-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`;
    const link = "interactive-map.html";

    await env.DB.prepare(
      `INSERT INTO map_markers (id, title, category, region, x, y, payout_or_perk, description, link, status, votes, submitted_by)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, 'community', 1, ?10)`
    )
      .bind(id, title, category, region, x, y, payout_or_perk, description, link, submitted_by)
      .run();

    return jsonResponse({
      ok: true,
      promoted: false,
      repAwarded: 200,
      marker: {
        id,
        title,
        category,
        region,
        x,
        y,
        payout_or_perk,
        description,
        link,
        status: "community",
        votes: 1,
        submitted_by,
      },
    });
  } catch (err) {
    return jsonResponse({ ok: false, error: err.message }, 500);
  }
}
