/**
 * GTA6HeistGuide.com — Server-Side Amazon Recommendations Endpoint
 * Route: /api/amazon-recommendations
 *
 * Security & Compliance:
 * - Preserves exact Amazon Associates partner tag: gta6heistguid-20
 * - Never exposes Amazon Creators API credentials in frontend JS, HTML, Git, or public JSON.
 * - Checks Cloudflare Pages server-side secrets:
 *     AMAZON_CREATORS_CREDENTIAL_ID
 *     AMAZON_CREATORS_CREDENTIAL_SECRET
 *     AMAZON_CREATORS_VERSION (optional, e.g. "2.1")
 * - When approved Creators API credentials are not provisioned, returns an honest
 *   "curated-fallback" response without scraping Amazon or fabricating ASINs/prices/ratings.
 *
 * Official Amazon Creators API Documentation:
 * https://affiliate-program.amazon.com/creatorsapi/docs/
 */

const PARTNER_TAG = "gta6heistguid-20";

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const category = (url.searchParams.get("category") || "all").toLowerCase();

  const hasCreatorsCreds = Boolean(
    env &&
    typeof env.AMAZON_CREATORS_CREDENTIAL_ID === "string" &&
    env.AMAZON_CREATORS_CREDENTIAL_ID.trim() &&
    typeof env.AMAZON_CREATORS_CREDENTIAL_SECRET === "string" &&
    env.AMAZON_CREATORS_CREDENTIAL_SECRET.trim()
  );

  // Load curated fallback catalog from static site assets (no secrets, no fabricated ASINs)
  let catalog = { items: [] };
  try {
    const assetRes = await env.ASSETS.fetch(new URL("/data/amazon-catalog.json", request.url));
    if (assetRes.ok) {
      catalog = await assetRes.json();
    }
  } catch (err) {
    // Fallback to empty list if ASSETS binding unavailable in local test
  }

  let items = Array.isArray(catalog.items) ? catalog.items : [];
  if (category && category !== "all") {
    items = items.filter((item) =>
      String(item.category || "").toLowerCase().includes(category)
    );
  }

  // Deterministic daily index for stable rotation (never randomizes on refresh)
  const dayIndex = Math.floor(Date.now() / 86400000);
  if (items.length > 1) {
    const shift = dayIndex % items.length;
    items = items.slice(shift).concat(items.slice(0, shift));
  }

  return new Response(
    JSON.stringify({
      ok: true,
      partnerTag: PARTNER_TAG,
      mode: hasCreatorsCreds ? "creators-api-ready-fallback" : "curated-fallback",
      creatorsApiAvailable: hasCreatorsCreds,
      creatorsApiDocs: "https://affiliate-program.amazon.com/creatorsapi/docs/",
      note: hasCreatorsCreds
        ? "Creators API credentials detected. Verify mobile-display approval and bind SearchItems/GetItems token cache before switching live."
        : "Amazon Creators API credentials are not configured in Cloudflare Pages secrets. Serving verified Associate fallback links without scraping or invented ASINs/prices.",
      dayIndex,
      count: items.length,
      items
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "public, max-age=3600"
      }
    }
  );
}
