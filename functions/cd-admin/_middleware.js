import { verifyAccess } from "../_lib/cd-access.js";

// Independent server-side Cloudflare Access JWT verification for the moderation dashboard (/cd-admin and /cd-admin/*).
// Fails closed so the admin HTML shell is never exposed publicly even if edge Access rules are misconfigured.
export async function onRequest(context) {
  const { request, env, next } = context;
  const auth = await verifyAccess(request, env);
  if (!auth.ok) {
    return new Response(
      auth.status === 503 ? "Admin access is not configured." : "Unauthorized.",
      {
        status: auth.status,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-store",
          "X-Content-Type-Options": "nosniff",
          "X-Robots-Tag": "noindex, nofollow, noarchive",
        },
      }
    );
  }
  const res = await next();
  const headers = new Headers(res.headers);
  headers.set("Cache-Control", "no-store");
  headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers });
}
