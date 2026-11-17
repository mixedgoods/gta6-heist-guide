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
    const [threadsRes, squadsRes, subCountRow] = await Promise.all([
      env.DB.prepare(
        "SELECT id, author, badge, badge_name AS badgeName, avatar, title, content, tag, votes, created_at FROM forum_threads ORDER BY rowid DESC LIMIT 60"
      ).all(),
      env.DB.prepare(
        "SELECT id, callsign, platform, role, target_heist AS targetHeist, mic_required AS micRequired, cut_offered AS cutOffered, contact_tag AS contactTag, notes, created_at FROM lfg_squads ORDER BY rowid DESC LIMIT 60"
      ).all(),
      env.DB.prepare("SELECT COUNT(*) AS count FROM subscribers").first(),
    ]);

    return jsonResponse({
      ok: true,
      threads: threadsRes.results || [],
      squads: squadsRes.results || [],
      totalOperatives: subCountRow?.count || 0,
      regionsMapped: 6,
    });
  } catch (err) {
    return jsonResponse({ ok: false, error: err.message }, 500);
  }
}

export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json();
    const type = String(body.type || "").trim();

    if (type === "thread") {
      const author = String(body.author || "ViceOperative").trim().slice(0, 40);
      const badge = String(body.badge || "badge-rookie").trim().slice(0, 32);
      const badgeName = String(body.badgeName || "Verified Player").trim().slice(0, 48);
      const avatar = String(
        body.avatar || "/assets/avatar-mastermind.png"
      ).trim().slice(0, 300);
      const title = String(body.title || "").trim().slice(0, 180);
      const content = String(body.content || "").trim().slice(0, 2000);
      const tag = String(body.tag || "StealthMeta").trim().slice(0, 40);

      if (!title || !content) {
        return jsonResponse({ ok: false, error: "Title and intel content are required." }, 400);
      }

      const id = `thread-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      await env.DB.prepare(
        `INSERT INTO forum_threads (id, author, badge, badge_name, avatar, title, content, tag, votes)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, 1)`
      )
        .bind(id, author, badge, badgeName, avatar, title, content, tag)
        .run();

      return jsonResponse({
        ok: true,
        thread: { id, author, badge, badgeName, avatar, title, content, tag, votes: 1, time: "Just now" },
      });
    }

    if (type === "upvote") {
      const id = String(body.id || "").trim();
      if (!id) return jsonResponse({ ok: false, error: "Missing thread id" }, 400);

      await env.DB.prepare("UPDATE forum_threads SET votes = votes + 1 WHERE id = ?1").bind(id).run();
      const row = await env.DB.prepare("SELECT votes FROM forum_threads WHERE id = ?1").bind(id).first();
      return jsonResponse({ ok: true, id, votes: row?.votes ?? 1 });
    }

    if (type === "lfg") {
      const callsign = String(body.callsign || "ViceOperative").trim().slice(0, 40);
      const platform = String(body.platform || "PS5 Pro").trim().slice(0, 40);
      const role = String(body.role || "Mastermind").trim().slice(0, 40);
      const targetHeist = String(body.targetHeist || "Leonida State Gold Reserve ($25.0M)").trim().slice(0, 100);
      const micRequired = String(body.micRequired || "Mic Required").trim().slice(0, 30);
      const cutOffered = String(body.cutOffered || "25% Equal Split").trim().slice(0, 40);
      const contactTag = String(body.contactTag || "").trim().slice(0, 100);
      const notes = String(body.notes || "").trim().slice(0, 400);

      if (!contactTag) {
        return jsonResponse({ ok: false, error: "Discord / PSN / Xbox friend tag is required." }, 400);
      }

      const id = `lfg-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      await env.DB.prepare(
        `INSERT INTO lfg_squads (id, callsign, platform, role, target_heist, mic_required, cut_offered, contact_tag, notes)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)`
      )
        .bind(id, callsign, platform, role, targetHeist, micRequired, cutOffered, contactTag, notes)
        .run();

      return jsonResponse({
        ok: true,
        squad: { id, callsign, platform, role, targetHeist, micRequired, cutOffered, contactTag, notes, verifiedPlayer: true },
      });
    }

    return jsonResponse({ ok: false, error: "Invalid action type." }, 400);
  } catch (err) {
    return jsonResponse({ ok: false, error: err.message }, 500);
  }
}
