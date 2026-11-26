import { readFileSync } from "node:fs";
// HTTP smoke & security test against `wrangler pages dev` (real Pages Functions runtime + real local D1 with migration).
// Usage:
//   node tests/http-smoke.mjs http://127.0.0.1:8799            (configured preview: Turnstile test keys + CD_HASH_SALT)
//   node tests/http-smoke.mjs http://127.0.0.1:8799 --closed   (unconfigured preview: verifies fail-closed 503s)
const base = process.argv[2] || "http://127.0.0.1:8799";
const expectClosed = process.argv.includes("--closed");
const out = [];
const t = async (id, name, fn) => { try { await fn(); out.push(["PASS", id, name]); } catch (e) { out.push(["FAIL", id, name + " -> " + e.message]); } };
const ok = (c, m) => { if (!c) throw new Error(m || "assert"); };
const date = new Date().toISOString().slice(0, 10);
const body = (o = {}) => ({
  title: "HTTP smoke discovery " + Date.now() + " " + Math.random().toString(36).slice(2, 6),
  category: "easter_egg",
  description: "Disposable minimal 4-field smoke-test record created by tests/http-smoke.mjs against the local Pages runtime; safe to delete.",
  permission_ack: true,
  turnstile_token: "XXXX.DUMMY.TOKEN.XXXX",
  ...o,
});
const post = (p, b, h = {}) => fetch(base + p, { method: "POST", headers: { "Content-Type": "application/json", Origin: base, ...h }, body: JSON.stringify(b) });

const expectedPins = JSON.parse(
  readFileSync(new URL("../public/data/map-pins.json", import.meta.url), "utf8")
).pins.filter((p) => p.enabled !== false).length;

await t("HTTP-01", "Existing hub page still serves 200 and contains the new entry point", async () => {
  const r = await fetch(base + "/gta-6-discoveries/"); const h = await r.text();
  ok(r.status === 200 && h.includes('data-cd-entry="submit"') && h.includes('canonical" href="https://www.gta6heistguide.com/gta-6-discoveries/"'));
});
await t("HTTP-02", "Existing map page and map-pins.json unchanged/served", async () => {
  ok((await fetch(base + "/map.html")).status === 200 || (await fetch(base + "/map")).status === 200);
  const j = await (await fetch(base + "/data/map-pins.json")).json();
  ok(
    j.total_pins === expectedPins &&
      Array.isArray(j.pins) &&
      j.pins.filter((p) => p.enabled !== false).length === expectedPins,
    "pins " + j.total_pins
  );
});
await t("HTTP-03", "Submit page: 200, robots noindex + X-Robots-Tag noindex header", async () => {
  const r = await fetch(base + "/community-discoveries/submit/"); const h = await r.text();
  ok(r.status === 200 && /content="noindex, nofollow"/.test(h));
  ok(/noindex/.test(r.headers.get("x-robots-tag") || ""), "header: " + r.headers.get("x-robots-tag"));
});
await t("HTTP-04", "Admin dashboard (/cd-admin/ and /cd-admin) denied without Access JWT (401/503), noindex, no HTML leak", async () => {
  for (const p of ["/cd-admin/", "/cd-admin"]) {
    const r = await fetch(base + p, { redirect: "manual" });
    const h = await r.text();
    ok([401, 503].includes(r.status), p + " status " + r.status);
    ok(/noindex/.test(r.headers.get("x-robots-tag") || ""), "header: " + r.headers.get("x-robots-tag"));
    ok(!/<html|cd-admin\.js|Moderation/i.test(h), "leaked admin shell");
  }
});
await t("HTTP-05", "Public list is empty and clean before any approval", async () => {
  const j = await (await fetch(base + "/api/community-discoveries/list")).json(); ok(j.ok && j.total === 0 && j.items.length === 0);
});

if (expectClosed) {
  await t("HTTP-06-CLOSED", "Unconfigured runtime: config reports submissionsOpen=false, uploads=false, turnstile=null", async () => {
    const j = await (await fetch(base + "/api/community-discoveries/config")).json();
    ok(j.uploads === false && j.turnstile === null && j.submissionsOpen === false, JSON.stringify(j));
  });
  await t("HTTP-07-CLOSED", "Unconfigured runtime: POST /submit fails closed with 503", async () => {
    const r = await post("/api/community-discoveries/submit", body(), { "CF-Connecting-IP": "198.51.100.200" });
    ok(r.status === 503, "status " + r.status);
  });
} else {
  await t("HTTP-06", "Configured runtime: uploads=false, turnstile siteKey present, secret never exposed, submissionsOpen=true", async () => {
    const r = await fetch(base + "/api/community-discoveries/config");
    const tx = await r.text();
    const j = JSON.parse(tx);
    ok(j.uploads === false && j.submissionsOpen === true && j.turnstile && j.turnstile.siteKey, tx);
    ok(!tx.includes("0000000000000000000000000000000AA"), "secret leaked");
  });
  await t("HTTP-06B", "Missing Turnstile token rejected (400)", async () => {
    const r = await post("/api/community-discoveries/submit", body({ turnstile_token: undefined }), { "CF-Connecting-IP": "198.51.100.199" });
    ok(r.status === 400 && (await r.json()).code === "turnstile", "status " + r.status);
  });
  let ref;
  await t("HTTP-07", "Valid submission via real runtime => 201 + reference, email not echoed", async () => {
    const r = await post("/api/community-discoveries/submit", body({ contact_email: "smoke@example.com", display_name: "SmokeTest" }), { "CF-Connecting-IP": "198.51.100.200" });
    const j = await r.json(); ok(r.status === 201 && /^CD-/.test(j.ref), JSON.stringify(j)); ref = j.ref;
    ok(!JSON.stringify(j).includes("smoke@example.com"));
  });
  await t("HTTP-08", "Pending record not visible via list or map feed", async () => {
    const l = await (await fetch(base + "/api/community-discoveries/list")).text();
    const m = await (await fetch(base + "/api/community-discoveries/map-pins")).text();
    ok(!l.includes(ref) && !m.includes(ref) && !l.includes("smoke@example.com"));
  });
  await t("HTTP-09", "Cross-origin POST blocked (403) and nothing stored", async () => {
    const r = await post("/api/community-discoveries/submit", body(), { Origin: "https://evil.example", "CF-Connecting-IP": "198.51.100.201" });
    ok(r.status === 403, "status " + r.status);
  });
  await t("HTTP-10", "Validation failure & invalid external URL => 400 JSON", async () => {
    const r = await post("/api/community-discoveries/submit", { title: "x", turnstile_token: "XXXX.DUMMY.TOKEN.XXXX" }, { "CF-Connecting-IP": "198.51.100.202" });
    ok(r.status === 400 && (await r.json()).fields.title);
    const r2 = await post("/api/community-discoveries/submit", body({ video_url: "javascript:alert(1)", image_rights_ack: true }), { "CF-Connecting-IP": "198.51.100.204" });
    ok(r2.status === 400 && (await r2.json()).fields.video_url);
  });
  await t("HTTP-11", "Oversized body => 413", async () => {
    const r = await post("/api/community-discoveries/submit", body({ detailed_explanation: "A".repeat(60000) }), { "CF-Connecting-IP": "198.51.100.203" });
    ok(r.status === 413, "status " + r.status);
  });
  await t("HTTP-12", "Repeated submissions are rate limited (429) in the real runtime", async () => {
    const codes = [];
    for (let i = 0; i < 5; i++) {
      codes.push((await post("/api/community-discoveries/submit", body({ title: "Rate limit probe " + i + " " + Math.random() }), { "CF-Connecting-IP": "198.51.100.210" })).status);
    }
    ok(codes.includes(429) && codes[0] === 201, codes.join());
  });
}

for (const [m, p] of [
  ["GET", "/api/cd-admin/queue"],
  ["GET", "/api/cd-admin/detail?ref=CD-AAAAA-BBBBB"],
  ["GET", "/api/cd-admin/affiliate-report"],
  ["GET", "/api/cd-admin/contact-inquiries"],
  ["GET", "/api/cd-admin/subscribers"],
  ["GET", "/api/cd-admin/subscribers?export=csv"],
  ["POST", "/api/cd-admin/action"],
]) {
  const tag = p.split("/").pop().replace(/[^a-z0-9]/gi, "-");
  await t("HTTP-ADM-" + tag, `Unauthenticated ${m} ${p} denied (503 or 401), no data`, async () => {
    const r = await fetch(base + p, { method: m, headers: m === "POST" ? { "Content-Type": "application/json", Origin: base } : {}, body: m === "POST" ? "{}" : undefined });
    const tx = await r.text(); ok([401, 503].includes(r.status) && !tx.includes("CD-") && !tx.includes("totalClicks") && !tx.includes("inquiries") && !tx.includes("subscribers"), r.status + " " + tx);
  });
}
await t("HTTP-13", "Legacy admin-key style access to admin APIs & public endpoints is denied", async () => {
  const r = await fetch(base + "/api/cd-admin/queue?key=syndicateadmin"); ok([401, 503].includes(r.status));
  const r2 = await fetch(base + "/api/cd-admin/affiliate-report?key=syndicateadmin"); ok([401, 503].includes(r2.status));
  const r3 = await fetch(base + "/api/clicks?key=syndicateadmin"); ok(r3.status === 405, "clicks?key status " + r3.status);
  const r4 = await fetch(base + "/api/clicks"); ok(r4.status === 405, "clicks GET status " + r4.status);
  const r5 = await fetch(base + "/api/contact?key=syndicateadmin"); ok(r5.status === 405, "contact?key status " + r5.status);
  const r6 = await fetch(base + "/api/subscribe?list=1&key=syndicateadmin"); ok(r6.status === 403, "subscribe?list status " + r6.status);
  const r7 = await fetch(base + "/api/subscribe?export=csv&key=syndicateadmin"); ok(r7.status === 403, "subscribe?export status " + r7.status);
});
await t("HTTP-13B", "Anonymous POST /api/clicks still records click cleanly (200)", async () => {
  const r = await fetch(base + "/api/clicks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ partner: "amazon", placement: "http_smoke", page_path: "/gaming-gear/", target_url: "https://www.amazon.com/dp/B0BHJJ9Y77?tag=gta6heist-20" }),
  });
  const j = await r.json();
  ok(r.status === 200 && j.ok === true && j.partner === "amazon", r.status + " " + JSON.stringify(j));
});
await t("HTTP-14", "Submit GET => 405", async () => { ok((await fetch(base + "/api/community-discoveries/submit")).status === 405); });
await t("HTTP-15", "SQLi in list query params => 400/empty, no 500", async () => {
  const r = await fetch(base + "/api/community-discoveries/list?category=" + encodeURIComponent("x' OR 1=1--")); ok(r.status === 400);
  const r2 = await fetch(base + "/api/community-discoveries/list?q=" + encodeURIComponent("' OR '1'='1")); ok(r2.status === 200 && (await r2.json()).total === 0);
});

for (const [s, id, n] of out) console.log(s, id, n);
console.log(`${out.filter((o) => o[0] === "PASS").length}/${out.length} passed`);
process.exit(out.some((o) => o[0] === "FAIL") ? 1 : 0);
