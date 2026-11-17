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
    const [recentRes, consensusRes] = await Promise.all([
      env.DB.prepare(
        "SELECT id, vault_slug, reported_payout, reported_cooldown_mins, patch_note, reporter_alias, created_at FROM payout_reports ORDER BY id DESC LIMIT 30"
      ).all(),
      env.DB.prepare(
        `SELECT vault_slug, reported_payout, reported_cooldown_mins, COUNT(*) AS report_count
         FROM payout_reports
         GROUP BY vault_slug, reported_payout, reported_cooldown_mins
         HAVING COUNT(*) >= 3
         ORDER BY report_count DESC`
      ).all(),
    ]);

    return jsonResponse({
      ok: true,
      reports: recentRes.results || [],
      verifiedAdjustments: consensusRes.results || [],
    });
  } catch (err) {
    return jsonResponse({ ok: false, error: err.message, reports: [], verifiedAdjustments: [] }, 500);
  }
}

export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json();
    const vault_slug = String(body.vault_slug || "leonida-reserve").trim().slice(0, 80);
    const reported_payout = Math.max(50000, Math.min(200000000, Math.round(Number(body.reported_payout) || 25000000)));
    const reported_cooldown_mins = Math.max(5, Math.min(720, Math.round(Number(body.reported_cooldown_mins) || 48)));
    const patch_note = String(body.patch_note || "Day-1 Live Lobby Verification").trim().slice(0, 300);
    const reporter_alias = String(body.reporter_alias || "VerifiedOperative").trim().slice(0, 40);

    await env.DB.prepare(
      `INSERT INTO payout_reports (vault_slug, reported_payout, reported_cooldown_mins, patch_note, reporter_alias)
       VALUES (?1, ?2, ?3, ?4, ?5)`
    )
      .bind(vault_slug, reported_payout, reported_cooldown_mins, patch_note, reporter_alias)
      .run();

    const matchRow = await env.DB.prepare(
      `SELECT COUNT(*) AS count FROM payout_reports
       WHERE vault_slug = ?1 AND reported_payout = ?2 AND reported_cooldown_mins = ?3`
    )
      .bind(vault_slug, reported_payout, reported_cooldown_mins)
      .first();

    const count = matchRow?.count || 1;
    const consensusVerified = count >= 3;

    return jsonResponse({
      ok: true,
      consensusVerified,
      count,
      repAwarded: consensusVerified ? 500 : 150,
      report: {
        vault_slug,
        reported_payout,
        reported_cooldown_mins,
        patch_note,
        reporter_alias,
      },
    });
  } catch (err) {
    return jsonResponse({ ok: false, error: err.message }, 500);
  }
}
