import {
  MAX_CLICK_BODY_BYTES,
  ensureClicksTable,
  normalizePartner,
  sanitizeTargetUrl,
} from "../_lib/affiliate-clicks.js";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function jsonResponse(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      "X-Robots-Tag": "noindex, nofollow",
      ...CORS_HEADERS,
      ...extraHeaders,
    },
  });
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

// Public /api/clicks is strictly anonymous click ingestion (POST only).
// Privileged affiliate analytics reporting is served exclusively behind Cloudflare Access at /api/cd-admin/affiliate-report.
export async function onRequestGet() {
  return jsonResponse({ ok: false, error: "Method not allowed." }, 405, {
    Allow: "POST, OPTIONS",
  });
}

export async function onRequestPost({ request, env }) {
  try {
    if (!env || !env.DB) {
      return jsonResponse({ ok: false, error: "Database unavailable." }, 500);
    }

    const contentLength = Number(request.headers.get("content-length") || 0);
    if (Number.isFinite(contentLength) && contentLength > MAX_CLICK_BODY_BYTES) {
      return jsonResponse({ ok: false, error: "Payload too large." }, 413);
    }

    const rawText = await request.text();
    if (new TextEncoder().encode(rawText).byteLength > MAX_CLICK_BODY_BYTES) {
      return jsonResponse({ ok: false, error: "Payload too large." }, 413);
    }

    let body = {};
    if (rawText) {
      try {
        body = JSON.parse(rawText);
      } catch {
        return jsonResponse({ ok: false, error: "Invalid JSON payload." }, 400);
      }
      if (!body || typeof body !== "object" || Array.isArray(body)) {
        return jsonResponse({ ok: false, error: "Invalid JSON payload." }, 400);
      }
    }

    await ensureClicksTable(env.DB);

    const targetUrl = sanitizeTargetUrl(body.target_url);
    const partner = normalizePartner(body.partner, targetUrl);
    const placement = String(body.placement || "general").trim().slice(0, 80) || "general";
    const pagePath = String(body.page_path || "/").trim().slice(0, 200) || "/";

    await env.DB.prepare(
      `INSERT INTO affiliate_clicks (partner, placement, page_path, target_url)
       VALUES (?1, ?2, ?3, ?4)`
    )
      .bind(partner, placement, pagePath, targetUrl)
      .run();

    return jsonResponse({ ok: true, partner, placement });
  } catch {
    return jsonResponse({ ok: false, error: "Unable to record click." }, 500);
  }
}

export async function onRequest() {
  return jsonResponse({ ok: false, error: "Method not allowed." }, 405, {
    Allow: "POST, OPTIONS",
  });
}
