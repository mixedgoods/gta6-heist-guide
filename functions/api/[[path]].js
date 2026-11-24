// Catch-all for unknown /api/* routes: return a JSON 404 (never the homepage or an HTML page).
// Pages routes more specific Functions (e.g. /api/map, /api/community-discoveries/list) first, so this only
// handles paths that no real API route claims. Scoped middleware (e.g. /api/cd-admin/_middleware.js)
// still runs before this handler for its own prefix, so admin routes stay fail-closed.
export async function onRequest() {
  return new Response(JSON.stringify({ ok: false, error: "not_found" }), {
    status: 404,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
