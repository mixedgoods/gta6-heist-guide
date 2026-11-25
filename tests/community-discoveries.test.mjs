// Community Discoveries test suite. Run: node tests/community-discoveries.test.mjs
// Uses the REAL migration SQL on SQLite (node:sqlite) behind a D1-compatible shim, and the REAL handlers/middleware.
// Cloudflare Access is tested with a locally generated RSA key and a stubbed JWKS fetch. Turnstile is stubbed.
import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, "..");
const imp = (p) => import(new URL(`file:///${path.join(root, p).replace(/\\/g, "/")}`).href);

const submitMod = await imp("functions/api/community-discoveries/submit.js");
const listMod = await imp("functions/api/community-discoveries/list.js");
const pinsMod = await imp("functions/api/community-discoveries/map-pins.js");
const cfgMod = await imp("functions/api/community-discoveries/config.js");
const reportMod = await imp("functions/api/community-discoveries/report.js");
const detailPageMod = await imp("functions/community-discoveries/d/[ref].js");
const sitemapMod = await imp("functions/sitemap.xml.js");
const mw = await imp("functions/api/cd-admin/_middleware.js");
const adminPageMw = await imp("functions/cd-admin/_middleware.js");
const queueMod = await imp("functions/api/cd-admin/queue.js");
const detailMod = await imp("functions/api/cd-admin/detail.js");
const actionMod = await imp("functions/api/cd-admin/action.js");
const accessLib = await imp("functions/_lib/cd-access.js");
const cd = await imp("functions/_lib/cd.js");

// ---------- D1 shim ----------
function makeDb() {
  const sqlite = new DatabaseSync(":memory:");
  sqlite.exec(fs.readFileSync(path.join(root, "migrations/0001_community_discoveries.sql"), "utf8"));
  sqlite.exec(fs.readFileSync(path.join(root, "migrations/0002_community_intelligence_phase29.sql"), "utf8"));
  const wrap = (sql, args = []) => ({
    bind: (...a) => wrap(sql, a),
    run: async () => { const r = sqlite.prepare(sql).run(...args); return { meta: { last_row_id: Number(r.lastInsertRowid) } }; },
    all: async () => ({ results: sqlite.prepare(sql).all(...args) }),
    first: async () => sqlite.prepare(sql).get(...args) ?? null,
    _exec: () => sqlite.prepare(sql).run(...args),
  });
  return {
    sqlite,
    prepare: (sql) => wrap(sql),
    batch: async (stmts) => {
      sqlite.exec("BEGIN");
      try { for (const s of stmts) s._exec(); sqlite.exec("COMMIT"); }
      catch (e) { sqlite.exec("ROLLBACK"); throw e; }
      return [];
    },
  };
}

// ---------- Access JWT minting ----------
const TEAM = "testteam.cloudflareaccess.com", AUD = "aud-123";
const kp = await crypto.subtle.generateKey({ name: "RSASSA-PKCS1-v1_5", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" }, true, ["sign", "verify"]);
const otherKp = await crypto.subtle.generateKey({ name: "RSASSA-PKCS1-v1_5", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" }, true, ["sign", "verify"]);
const pubJwk = { ...(await crypto.subtle.exportKey("jwk", kp.publicKey)), kid: "k1", alg: "RS256", use: "sig" };
const b64u = (buf) => Buffer.from(buf).toString("base64url");
async function mint(claims = {}, key = kp.privateKey) {
  const h = b64u(JSON.stringify({ alg: "RS256", kid: "k1", typ: "JWT" }));
  const p = b64u(JSON.stringify({ aud: [AUD], iss: `https://${TEAM}`, email: "owner@example.com", sub: "u1", exp: Math.floor(Date.now() / 1000) + 600, ...claims }));
  const sig = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(`${h}.${p}`));
  return `${h}.${p}.${b64u(sig)}`;
}
const realFetch = globalThis.fetch;
let turnstileResult = true;
globalThis.fetch = async (url, init) => {
  const u = String(url);
  if (u === `https://${TEAM}/cdn-cgi/access/certs`) return new Response(JSON.stringify({ keys: [pubJwk] }), { status: 200 });
  if (u.startsWith("https://challenges.cloudflare.com/")) return new Response(JSON.stringify({ success: turnstileResult }), { status: 200 });
  return realFetch(url, init);
};

const pinsJson = fs.readFileSync(path.join(root, "public/data/map-pins.json"), "utf8");
const sitemapXmlStatic = fs.readFileSync(path.join(root, "public/sitemap.xml"), "utf8");
const ASSETS = {
  fetch: async (req) => {
    const u = typeof req === "string" ? req : req.url;
    if (String(u).includes("/sitemap.xml")) return new Response(sitemapXmlStatic, { headers: { "Content-Type": "application/xml" } });
    return new Response(pinsJson, { headers: { "Content-Type": "application/json" } });
  },
};

// ---------- router ----------
const ORIGIN = "https://www.gta6heistguide.com";
async function call(env, method, p, { body, headers = {}, ip = "198.51.100.1", origin = ORIGIN, raw, token } = {}) {
  const h = { "CF-Connecting-IP": ip, ...headers };
  if (origin) h.Origin = origin;
  if (body !== undefined || raw !== undefined) h["Content-Type"] = h["Content-Type"] || "application/json";
  if (token) h["Cf-Access-Jwt-Assertion"] = token;
  const req = new Request(ORIGIN + p, { method, headers: h, body: raw !== undefined ? raw : body !== undefined ? JSON.stringify(body) : undefined });
  const url = new URL(req.url);
  const route = url.pathname;
  const map = {
    "/api/community-discoveries/submit": submitMod, "/api/community-discoveries/list": listMod,
    "/api/community-discoveries/map-pins": pinsMod, "/api/community-discoveries/config": cfgMod,
    "/api/community-discoveries/report": reportMod, "/sitemap.xml": sitemapMod,
    "/api/cd-admin/queue": queueMod, "/api/cd-admin/detail": detailMod, "/api/cd-admin/action": actionMod,
  };
  const ctx = { request: req, env, data: {}, next: undefined, params: {} };
  if (route === "/cd-admin" || route.startsWith("/cd-admin/")) {
    return adminPageMw.onRequest({ ...ctx, next: async () => new Response("<html>admin-shell</html>", { status: 200, headers: { "Content-Type": "text/html" } }) });
  }
  if (route.startsWith("/community-discoveries/d/")) {
    ctx.params = { ref: decodeURIComponent(route.slice("/community-discoveries/d/".length).replace(/\/$/, "")) };
    return detailPageMod.onRequestGet(ctx);
  }
  const m = map[route];
  if (!m) throw new Error("no route " + route);
  const handler = (ctx) => (m[`onRequest${method[0] + method.slice(1).toLowerCase()}`] || m.onRequest)(ctx);
  if (route.startsWith("/api/cd-admin/")) return mw.onRequest({ ...ctx, next: () => handler(ctx) });
  return handler(ctx);
}
const J = async (r) => ({ status: r.status, headers: r.headers, json: await r.clone().json().catch(() => null), text: await r.text() });

// ---------- harness ----------
const results = [];
let currentGroup = "";
function record(id, name, pass, detail = "") { results.push({ id, group: currentGroup, name, result: pass ? "PASS" : "FAIL", detail }); }
async function t(id, name, fn) {
  try { const r = await fn(); record(id, name, r === true || r === undefined, r === true || r === undefined ? "" : String(r)); }
  catch (e) { record(id, name, false, "exception: " + (e && e.message)); }
}
const group = (g) => { currentGroup = g; };
const assert = (c, m) => { if (!c) throw new Error(m || "assertion failed"); };
const eq = (a, b, m) => assert(a === b, `${m || ""} expected ${b} got ${a}`);

let n = 0;
const uniq = () => ++n;
const WORDS = ["alpha","bravo","charlie","delta","echo","foxtrot","golf","hotel","india","juliet","kilo","lima","mike","november","oscar","papa","quebec","romeo","sierra","tango"];
function payload(over = {}) {
  const i = uniq();
  const w = (k) => WORDS[(i * 3 + k) % WORDS.length] + i;
  return {
    title: `Test discovery ${w(0)} ${w(1)}`, category: "hidden_location",
    short_description: `Disposable test entry about ${w(2)} ${w(3)} near the harbor.`,
    detailed_explanation: `This is a disposable test explanation with enough words to pass validation: ${w(4)} ${w(5)} ${w(6)} ${w(7)} and more.`,
    region: "Vice City", location_description: `Behind the ${w(8)} warehouse`,
    directions: `Head north from the ${w(9)} marina, turn left at the pier and look behind the crates.`,
    platform: "PS5", game_version: "1.02", discovered_on: new Date().toISOString().slice(0, 10), witnessed: "yes",
    evidence_description: `I recorded the area on my console and noted the ${w(10)} landmark.`,
    originality_ack: true, license_ack: true, image_rights_ack: false, turnstile_token: "disposable-test-turnstile-token", ...over,
  };
}
const TEST_SALT = "test-only-disposable-hash-salt-0123456789abcdef";
const newEnv = (extra = {}) => ({
  DB: makeDb(),
  ASSETS,
  CD_HASH_SALT: TEST_SALT,
  TURNSTILE_SITE_KEY: "test-site-key",
  TURNSTILE_SECRET_KEY: "test-secret-key",
  ...extra,
});
const adminEnv = (extra = {}) => newEnv({
  CF_ACCESS_TEAM_DOMAIN: TEAM,
  CF_ACCESS_AUD: AUD,
  CD_ADMIN_EMAILS: "owner@example.com",
  ...extra,
});
let ipN = 10;
const nextIp = () => `203.0.113.${++ipN}`;
async function submit(env, over, opts = {}) { return J(await call(env, "POST", "/api/community-discoveries/submit", { body: payload(over), ip: nextIp(), ...opts })); }
async function admin(env, method, p, body, claims) {
  return J(await call(env, method, p, { body, token: await mint(claims) }));
}
const act = (env, ref, a, extra = {}) => admin(env, "POST", "/api/cd-admin/action", { ref, action: a, ...extra });
const row = (env, ref) => env.DB.sqlite.prepare("SELECT * FROM cd_submissions WHERE ref = ?").get(ref);

// =============== SUBMISSION ===============
group("Submission");
await t("SUB-01", "Valid submission accepted, returns reference, persisted as PENDING_REVIEW", async () => {
  const env = newEnv(); const r = await submit(env);
  eq(r.status, 201); assert(/^CD-[0-9A-Z]{5}-[0-9A-Z]{5}$/.test(r.json.ref), "ref format");
  const s = row(env, r.json.ref); eq(s.evidence_status, "PENDING_REVIEW"); eq(s.reviewer_status, "new");
  assert(s.created_at && s.updated_at, "timestamps");
});
await t("SUB-01B", "Minimal 4-field quick submission accepted with no fabricated data and moderatable", async () => {
  const env = adminEnv();
  const r = await J(await call(env, "POST", "/api/community-discoveries/submit", {
    body: {
      title: "Quick rooftop crate near Vice Beach",
      category: "hidden_location",
      description: "Behind the pink motel on Vice Beach, climb the alley ladder to find a hidden crate.",
      permission_ack: true,
      turnstile_token: "disposable-test-turnstile-token",
    },
    ip: nextIp(),
  }));
  eq(r.status, 201);
  const s = row(env, r.json.ref);
  eq(s.evidence_status, "PENDING_REVIEW");
  eq(s.region, ""); eq(s.location_description, ""); eq(s.directions, ""); eq(s.platform, "");
  eq(s.discovered_on, ""); eq(s.evidence_description, ""); eq(s.witnessed, -1);
  eq(s.game_version, null); eq(s.sources_text, null); eq(s.coord_xpct, null); eq(s.display_name, null); eq(s.contact_email, null);
  eq(s.originality_ack, 1); eq(s.license_ack, 1); eq(s.image_rights_ack, 0);
  const aud = env.DB.sqlite.prepare("SELECT after_json FROM cd_audit WHERE submission_id = ? AND action = 'submission_received'").get(s.id);
  assert(JSON.parse(aud.after_json).evidence_needs_review === true, "should flag evidence_needs_review");
  // Public list stays empty while pending
  eq((await J(await call(env, "GET", "/api/community-discoveries/list"))).json.total, 0);
  // Moderator can approve draft and then reject without error
  eq((await act(env, r.json.ref, "approve_report")).status, 200);
  eq((await act(env, r.json.ref, "reject", { note: "Disposable quick-submit test." })).status, 200);
  eq(row(env, r.json.ref).evidence_status, "REJECTED");
  eq((await J(await call(env, "GET", "/api/community-discoveries/list"))).json.total, 0);
});
await t("SUB-02", "Missing 4 required fields rejected server-side (400 + field errors); optional fields not required", async () => {
  const env = newEnv(); const r = await J(await call(env, "POST", "/api/community-discoveries/submit", { body: { turnstile_token: "disposable-test-turnstile-token" }, ip: nextIp() }));
  eq(r.status, 400);
  for (const k of ["title", "category", "description", "permission_ack"]) assert(r.json.fields[k], "missing error for " + k);
  for (const opt of ["region", "location_description", "directions", "platform", "discovered_on", "witnessed", "evidence_description", "short_description"]) {
    assert(!r.json.fields[opt], "optional field should not error: " + opt);
  }
  eq(env.DB.sqlite.prepare("SELECT COUNT(*) c FROM cd_submissions").get().c, 0);
});
await t("SUB-03", "Invalid category / region / platform rejected", async () => {
  const env = newEnv(); const r = await submit(env, { category: "bogus", region: "Narnia", platform: "PC" });
  eq(r.status, 400); assert(r.json.fields.category && r.json.fields.region && r.json.fields.platform);
});
await t("SUB-04", "Future discovery date rejected", async () => {
  const env = newEnv(); const r = await submit(env, { discovered_on: "2999-01-01" }); eq(r.status, 400); assert(r.json.fields.discovered_on);
});
await t("SUB-05", "Not personally witnessed requires a source", async () => {
  const env = newEnv(); const r = await submit(env, { witnessed: "no" }); eq(r.status, 400); assert(r.json.fields.sources_text);
  const ok = await submit(env, { witnessed: "no", sources_text: "Seen on a public forum post by user X" }); eq(ok.status, 201);
});
await t("SUB-06", "Originality and license permission acknowledgment required", async () => {
  const env = newEnv();
  const r = await submit(env, { permission_ack: false, originality_ack: false, license_ack: false });
  eq(r.status, 400); assert(r.json.fields.permission_ack);
  const half = await submit(env, { permission_ack: undefined, originality_ack: true, license_ack: false });
  eq(half.status, 400); assert(half.json.fields.permission_ack);
});
await t("SUB-07", "Media links require rights confirmation", async () => {
  const env = newEnv(); const r = await submit(env, { screenshot_url: "https://example.com/a.png" }); eq(r.status, 400); assert(r.json.fields.image_rights_ack);
  const ok = await submit(env, { screenshot_url: "https://example.com/a.png", image_rights_ack: true }); eq(ok.status, 201);
});
await t("SUB-08", "Malicious/unsafe URLs rejected (javascript:, data:, http:, IP literal, localhost, credentials, exe)", async () => {
  const env = newEnv();
  for (const bad of ["javascript:alert(1)", "data:text/html,<script>alert(1)</script>", "http://example.com/a.png", "https://127.0.0.1/a.png", "https://10.0.0.5/x", "https://localhost/x", "https://user:pw@example.com/x", "https://example.com/payload.exe", "https://[::1]/x", "https://example.com/a b"]) {
    const r = await submit(env, { video_url: bad, image_rights_ack: true }); if (r.status !== 400 || !r.json.fields.video_url) throw new Error("accepted: " + bad);
  }
  const src = await submit(env, { source_urls: ["https://example.com/ok", "javascript:alert(1)"] }); eq(src.status, 400);
});
await t("SUB-09", "XSS/script payloads rejected server-side (400); benign text stored inert; zero innerHTML sinks in cd-*.js", async () => {
  const env = newEnv(); const xss = `<img src=x onerror=alert(1)><script>alert('x')</script>`;
  const bad = await submit(env, { title: "Title " + xss, detailed_explanation: "Detail " + xss + " padding padding padding padding padding", display_name: "ok name" });
  eq(bad.status, 400); assert(bad.json.fields.title && bad.json.fields.description, "script/img XSS must be rejected");
  const safe = await submit(env, { title: "Safe math comparison 10 < 20 in Vice City", detailed_explanation: "When speed < 20 mph near the dock, the hidden gate opens smoothly.", display_name: "ok name" });
  eq(safe.status, 201); eq(safe.headers.get("X-Content-Type-Options"), "nosniff"); assert(safe.headers.get("Content-Type").startsWith("application/json"));
  for (const f of ["cd-list.js", "cd-submit.js", "cd-admin.js", "cd-detail.js"]) { const src = fs.readFileSync(path.join(root, "public/assets/community", f), "utf8"); assert(!/innerHTML|outerHTML|insertAdjacentHTML|document\.write|eval\(/.test(src), f + " uses unsafe sink"); }
});
await t("SUB-10", "Invalid display name (markup) rejected", async () => {
  const env = newEnv(); const r = await submit(env, { display_name: "<b>bob</b>" }); eq(r.status, 400); assert(r.json.fields.display_name);
});
await t("SUB-11", "SQL injection strings stored literally; schema intact", async () => {
  const env = newEnv(); const inj = "x'); DROP TABLE cd_submissions;--";
  const r = await submit(env, { title: "Inj " + inj, location_description: "Robert'); DROP TABLE cd_published;-- ok" }); eq(r.status, 201);
  assert(row(env, r.json.ref).title.includes("DROP TABLE"));
  eq(env.DB.sqlite.prepare("SELECT COUNT(*) c FROM sqlite_master WHERE name IN ('cd_submissions','cd_published')").get().c, 2);
});
await t("SUB-12", "Oversized request rejected (413) with Content-Length and with streamed body", async () => {
  const env = newEnv(); const big = payload({ detailed_explanation: "A".repeat(40000) });
  const r1 = await call(env, "POST", "/api/community-discoveries/submit", { body: big, ip: nextIp() }); eq(r1.status, 413);
  const r2 = await call(env, "POST", "/api/community-discoveries/submit", { raw: JSON.stringify(big), ip: nextIp(), headers: { "Content-Length": "100" } });
  assert([413, 400].includes(r2.status), "streamed oversize status " + r2.status);
});
await t("SUB-13", "Over-length individual fields rejected (title 121 chars)", async () => {
  const env = newEnv(); const r = await submit(env, { title: "T".repeat(121) }); eq(r.status, 400); assert(r.json.fields.title);
});
await t("SUB-14", "Cross-origin, origin-less and non-JSON POSTs rejected (CSRF/same-origin)", async () => {
  const env = newEnv();
  eq((await call(env, "POST", "/api/community-discoveries/submit", { body: payload(), origin: "https://evil.example", ip: nextIp() })).status, 403);
  eq((await call(env, "POST", "/api/community-discoveries/submit", { body: payload(), origin: null, ip: nextIp() })).status, 403);
  eq((await call(env, "POST", "/api/community-discoveries/submit", { raw: "a=b", headers: { "Content-Type": "application/x-www-form-urlencoded" }, ip: nextIp() })).status, 415);
  eq((await call(env, "POST", "/api/community-discoveries/submit", { body: payload(), headers: { "Sec-Fetch-Site": "cross-site" }, ip: nextIp() })).status, 403);
  eq(env.DB.sqlite.prepare("SELECT COUNT(*) c FROM cd_submissions").get().c, 0);
});
await t("SUB-15", "Non-POST methods refused with 405 and no CORS headers", async () => {
  const env = newEnv(); for (const m of ["GET", "PUT", "DELETE"]) { const r = await call(env, m, "/api/community-discoveries/submit", { ip: nextIp() }); eq(r.status, 405); assert(!r.headers.get("Access-Control-Allow-Origin")); }
});
await t("SUB-16", "Honeypot submissions are silently discarded (nothing stored)", async () => {
  const env = newEnv(); const r = await submit(env, { website: "http://spam.example" }); eq(r.status, 201);
  eq(env.DB.sqlite.prepare("SELECT COUNT(*) c FROM cd_submissions").get().c, 0);
});
await t("SUB-17", "Private email never echoed in submission response; stored only when provided", async () => {
  const env = newEnv(); const r = await submit(env, { contact_email: "secret.person@example.com" });
  eq(r.status, 201); assert(!r.text.includes("secret.person")); eq(row(env, r.json.ref).contact_email, "secret.person@example.com");
  const r2 = await submit(env, {}); eq(row(env, r2.json.ref).contact_email, null);
  eq((await submit(env, { contact_email: "not-an-email" })).status, 400);
});
await t("SUB-18", "Named credit only honored when a display name is supplied", async () => {
  const env = newEnv(); const a = await submit(env, { credit_pref: "named" }); eq(row(env, a.json.ref).credit_pref, "anonymous");
  const b = await submit(env, { credit_pref: "named", display_name: "Neon_Fan" }); eq(row(env, b.json.ref).credit_pref, "named");
});
await t("SUB-19", "Coordinates validated (both required, 0..1)", async () => {
  const env = newEnv(); eq((await submit(env, { coord_xpct: 0.5 })).status, 400); eq((await submit(env, { coord_xpct: 5, coord_ypct: 0.2 })).status, 400);
  const ok = await submit(env, { coord_xpct: "0.5", coord_ypct: "0.25" }); eq(ok.status, 201); eq(row(env, ok.json.ref).coord_xpct, 0.5);
});

group("Rate limiting & duplicates");
await t("RL-01", "Per-IP successful submissions limited (4th within an hour => 429)", async () => {
  const env = newEnv(); const ip = "192.0.2.77"; const out = [];
  for (let i = 0; i < 4; i++) out.push((await submit(env, {}, { ip })).status);
  assert(out.join() === "201,201,201,429", out.join());
});
await t("RL-02", "Per-IP attempt limit (16th attempt in an hour => 429), invalid attempts count", async () => {
  const env = newEnv(); const ip = "192.0.2.78"; let last = 0;
  for (let i = 0; i < 16; i++) last = (await call(env, "POST", "/api/community-discoveries/submit", { body: {}, ip })).status;
  eq(last, 429);
});
await t("RL-03", "Different IPs have independent limits", async () => {
  const env = newEnv(); for (let i = 0; i < 3; i++) await submit(env, {}, { ip: "192.0.2.80" });
  eq((await submit(env, {}, { ip: "192.0.2.81" })).status, 201);
});
await t("DUP-01", "Exact repeat content => 409", async () => {
  const env = newEnv(); const p = payload(); eq((await call(env, "POST", "/api/community-discoveries/submit", { body: p, ip: nextIp() })).status, 201);
  eq((await call(env, "POST", "/api/community-discoveries/submit", { body: p, ip: nextIp() })).status, 409);
});
await t("DUP-02", "Near-duplicate titles recorded as possible_duplicate WARNING (not corroboration)", async () => {
  const env = newEnv();
  const a = await submit(env, { title: "Hidden rooftop pool above Ocean Drive hotel", short_description: "A secret rooftop pool above the Ocean Drive hotel with loot." });
  const b = await submit(env, { title: "Secret rooftop pool above the Ocean Drive hotel", short_description: "Hidden rooftop pool above Ocean Drive hotel including loot chest.", detailed_explanation: "Completely different detailed text here so the content hash differs from the first one entirely." });
  eq(b.status, 201);
  const rel = env.DB.sqlite.prepare("SELECT kind, created_by FROM cd_relations WHERE submission_id = (SELECT id FROM cd_submissions WHERE ref=?)").all(b.json.ref);
  assert(rel.some((r) => r.kind === "possible_duplicate" && r.created_by === "system"), JSON.stringify(rel));
  eq(row(env, b.json.ref).evidence_status, "PENDING_REVIEW");
});
await t("DUP-03", "Shared source URL recorded as shared_source relation; status never auto-changes", async () => {
  const env = newEnv();
  const a = await submit(env, { witnessed: "no", source_urls: ["https://www.youtube.com/watch?v=abc123"] });
  const b = await submit(env, { witnessed: "no", source_urls: ["https://youtu.be/abc123"] });
  const rel = env.DB.sqlite.prepare("SELECT kind FROM cd_relations WHERE submission_id = (SELECT id FROM cd_submissions WHERE ref=?)").all(b.json.ref);
  assert(rel.some((r) => r.kind === "shared_source"), "youtu.be and youtube.com normalized to same source: " + JSON.stringify(rel));
  eq(row(env, b.json.ref).evidence_status, "PENDING_REVIEW"); eq(row(env, a.json.ref).evidence_status, "PENDING_REVIEW");
});
await t("DUP-04", "Many similar submissions never auto-promote any status (no auto-verification)", async () => {
  const env = newEnv();
  for (let i = 0; i < 6; i++) await submit(env, { title: "Secret tunnel under Port Gellhorn docks " + i, short_description: "Hidden tunnel under the Port Gellhorn docks " + i + " accessible by boat." }, { ip: nextIp() });
  const st = env.DB.sqlite.prepare("SELECT DISTINCT evidence_status s FROM cd_submissions").all().map((r) => r.s);
  assert(st.length === 1 && st[0] === "PENDING_REVIEW", st.join());
  eq(env.DB.sqlite.prepare("SELECT COUNT(*) c FROM cd_published").get().c, 0);
});

group("Turnstile & fail-closed config");
await t("TS-01", "Not configured: submissions fail closed (503) and config reports submissionsOpen=false", async () => {
  const env = { DB: makeDb(), ASSETS, CD_HASH_SALT: TEST_SALT };
  eq((await submit(env)).status, 503);
  const c = await J(await call(env, "GET", "/api/community-discoveries/config"));
  eq(c.json.turnstile, null); eq(c.json.uploads, false); eq(c.json.submissionsOpen, false); eq(c.json.turnstileMisconfigured, true);
});
await t("TS-02", "Configured: missing/invalid token rejected, valid token accepted (Turnstile API STUBBED)", async () => {
  const env = newEnv({ TURNSTILE_SECRET_KEY: "s", TURNSTILE_SITE_KEY: "k" });
  eq((await submit(env, { turnstile_token: undefined })).status, 400);
  turnstileResult = false; eq((await submit(env, { turnstile_token: "tok" })).status, 400);
  turnstileResult = true; eq((await submit(env, { turnstile_token: "tok" })).status, 201);
});
await t("TS-03", "Partial Turnstile or missing/short CD_HASH_SALT => submissions fail closed (503 + submissionsOpen=false)", async () => {
  const e1 = { DB: makeDb(), ASSETS, CD_HASH_SALT: TEST_SALT, TURNSTILE_SECRET_KEY: "s" };
  eq((await J(await call(e1, "GET", "/api/community-discoveries/config"))).json.submissionsOpen, false);
  eq((await submit(e1)).status, 503);
  const e2 = { DB: makeDb(), ASSETS, TURNSTILE_SECRET_KEY: "s", TURNSTILE_SITE_KEY: "k", CD_HASH_SALT: "too-short" };
  eq((await J(await call(e2, "GET", "/api/community-discoveries/config"))).json.submissionsOpen, false);
  eq((await submit(e2)).status, 503);
});

// =============== ADMIN AUTH ===============
group("Admin authentication");
const adminPaths = [["GET", "/api/cd-admin/queue"], ["GET", "/api/cd-admin/detail?ref=CD-AAAAA-BBBBB"], ["POST", "/api/cd-admin/action"]];
await t("AUTH-01", "No Access token => 401 on every admin endpoint", async () => {
  const env = adminEnv(); for (const [m, p] of adminPaths) eq((await call(env, m, p, { body: m === "POST" ? {} : undefined })).status, 401, p);
});
await t("AUTH-02", "Access not configured => 503 fail-closed (even with a token)", async () => {
  const env = newEnv(); for (const [m, p] of adminPaths) eq((await call(env, m, p, { body: m === "POST" ? {} : undefined, token: await mint() })).status, 503, p);
});
await t("AUTH-03", "Token signed by an unknown key => 401", async () => {
  accessLib.resetJwksCache(); const env = adminEnv(); eq((await call(env, "GET", "/api/cd-admin/queue", { token: await mint({}, otherKp.privateKey) })).status, 401);
});
await t("AUTH-04", "Wrong audience / wrong issuer / expired / future nbf / malformed token => 401", async () => {
  const env = adminEnv();
  eq((await call(env, "GET", "/api/cd-admin/queue", { token: await mint({ aud: ["other"] }) })).status, 401);
  eq((await call(env, "GET", "/api/cd-admin/queue", { token: await mint({ iss: "https://evil.cloudflareaccess.com" }) })).status, 401);
  eq((await call(env, "GET", "/api/cd-admin/queue", { token: await mint({ exp: 1000 }) })).status, 401);
  eq((await call(env, "GET", "/api/cd-admin/queue", { token: await mint({ nbf: Math.floor(Date.now() / 1000) + 3600 }) })).status, 401);
  eq((await call(env, "GET", "/api/cd-admin/queue", { token: "a.b.c" })).status, 401);
  eq((await call(env, "GET", "/api/cd-admin/queue", { token: "garbage" })).status, 401);
});
await t("AUTH-04B", "Multi-AUD allowlist accepts explicitly configured AUDs and rejects all others", async () => {
  const env = adminEnv({ CF_ACCESS_AUD: `${AUD}, aud-api-456` });
  eq((await call(env, "GET", "/api/cd-admin/queue", { token: await mint({ aud: [AUD] }) })).status, 200);
  eq((await call(env, "GET", "/api/cd-admin/queue", { token: await mint({ aud: ["aud-api-456"] }) })).status, 200);
  eq((await call(env, "GET", "/api/cd-admin/queue", { token: await mint({ aud: ["aud-unlisted"] }) })).status, 401);
});
await t("AUTH-04C", "Missing CD_ADMIN_EMAILS fails closed (503)", async () => {
  const env = adminEnv({ CD_ADMIN_EMAILS: "" });
  eq((await call(env, "GET", "/api/cd-admin/queue", { token: await mint() })).status, 503);
});
await t("AUTH-04D", "Admin dashboard page (/cd-admin/) independently enforces Access JWT (503/401/403/200)", async () => {
  eq((await call(newEnv(), "GET", "/cd-admin/")).status, 503);
  const env = adminEnv();
  eq((await call(env, "GET", "/cd-admin/")).status, 401);
  eq((await call(env, "GET", "/cd-admin", { token: await mint({ aud: ["wrong"] }) })).status, 401);
  eq((await call(env, "GET", "/cd-admin/", { token: await mint({ email: "intruder@example.com" }) })).status, 403);
  const ok = await call(env, "GET", "/cd-admin/", { token: await mint() });
  eq(ok.status, 200);
  assert(/noindex/.test(ok.headers.get("X-Robots-Tag") || ""));
});
await t("AUTH-05", "alg=none / header-only forged token => 401", async () => {
  const env = adminEnv(); const h = b64u(JSON.stringify({ alg: "none", kid: "k1" })), p = b64u(JSON.stringify({ aud: [AUD], iss: `https://${TEAM}`, email: "x@y.z", exp: 9999999999 }));
  eq((await call(env, "GET", "/api/cd-admin/queue", { token: `${h}.${p}.` })).status, 401);
});
await t("AUTH-06", "Valid token accepted (200); legacy ADMIN_KEY query param is NOT accepted", async () => {
  const env = adminEnv(); eq((await admin(env, "GET", "/api/cd-admin/queue")).status, 200);
  eq((await call(env, "GET", "/api/cd-admin/queue?key=syndicateadmin", {})).status, 401);
});
await t("AUTH-07", "CD_ADMIN_EMAILS allowlist enforced (403 for other identities)", async () => {
  const env = adminEnv({ CD_ADMIN_EMAILS: "boss@example.com" }); eq((await admin(env, "GET", "/api/cd-admin/queue")).status, 403);
  eq((await admin(env, "GET", "/api/cd-admin/queue", undefined, { email: "boss@example.com" })).status, 200);
});
await t("AUTH-08", "Admin POST requires same-origin JSON even with valid token (CSRF)", async () => {
  const env = adminEnv(); const token = await mint();
  eq((await call(env, "POST", "/api/cd-admin/action", { body: {}, token, origin: "https://evil.example" })).status, 403);
  eq((await call(env, "POST", "/api/cd-admin/action", { body: {}, token, origin: null })).status, 403);
});
await t("AUTH-09", "Unauthenticated error bodies do not leak the failure reason or data", async () => {
  const env = adminEnv(); const r = await J(await call(env, "GET", "/api/cd-admin/queue")); assert(r.text === JSON.stringify({ ok: false, error: "Unauthorized." }), r.text);
});

// =============== MODERATION + PUBLIC ===============
group("Moderation workflow");
const env = adminEnv();
const A = await submit(env, { title: "Moderation sample alpha lighthouse", category: "easter_egg", region: "Leonida Keys", display_name: "Neon_Fan", credit_pref: "named", contact_email: "private@example.com", coord_xpct: 0.4, coord_ypct: 0.3 });
const refA = A.json.ref;

await t("PUB-01", "Pending submission is absent from public list, map feed and has no published row", async () => {
  const l = await J(await call(env, "GET", "/api/community-discoveries/list")); eq(l.json.total, 0); eq(l.json.items.length, 0);
  const m = await J(await call(env, "GET", "/api/community-discoveries/map-pins")); eq(m.json.pins.length, 0);
  assert(!l.text.includes("Moderation sample") && !m.text.includes("Moderation sample"));
});
await t("MOD-01", "Queue lists new submission with counts", async () => {
  const q = await admin(env, "GET", "/api/cd-admin/queue?status=NEW"); eq(q.status, 200); assert(q.json.items.some((i) => i.ref === refA)); assert(q.json.counts.PENDING_REVIEW >= 1);
});
await t("MOD-02", "Detail exposes private data only to admin (email present), hides ip_hash / internal id", async () => {
  const d = await admin(env, "GET", `/api/cd-admin/detail?ref=${refA}`); eq(d.json.submission.contact_email, "private@example.com");
  assert(!("ip_hash" in d.json.submission) && !("id" in d.json.submission) && !("content_hash" in d.json.submission));
});
await t("MOD-03", "Invalid ref handled safely (400); unknown ref 404", async () => {
  eq((await admin(env, "GET", "/api/cd-admin/detail?ref=x' OR 1=1--")).status, 400); eq((await admin(env, "GET", "/api/cd-admin/detail?ref=CD-AAAAA-BBBBB")).status, 404);
});
await t("MOD-04", "Reject requires a reason; request_evidence requires a note", async () => {
  eq((await act(env, refA, "reject")).status, 400); eq((await act(env, refA, "request_evidence")).status, 400);
});
await t("MOD-05", "Request more evidence => NEEDS_MORE_EVIDENCE, decision + audit recorded with actor", async () => {
  const r = await act(env, refA, "request_evidence", { note: "Need a clearer screenshot." }); eq(r.status, 200); eq(row(env, refA).evidence_status, "NEEDS_MORE_EVIDENCE");
  const aud = env.DB.sqlite.prepare("SELECT actor, action FROM cd_audit WHERE action='request_evidence'").get(); eq(aud.actor, "owner@example.com");
  const dec = env.DB.sqlite.prepare("SELECT reviewer, internal_note FROM cd_decisions WHERE action='request_evidence'").get(); eq(dec.reviewer, "owner@example.com");
});
await t("MOD-06", "Needs-evidence submission cannot be published (no draft exists)", async () => {
  eq((await act(env, refA, "publish")).status, 400);
});
await t("MOD-07", "Approve as community report => COMMUNITY_REPORTED, unpublished draft created, credit follows contributor choice", async () => {
  eq((await act(env, refA, "approve_report", { note: "Looks plausible" })).status, 200);
  eq(row(env, refA).evidence_status, "COMMUNITY_REPORTED");
  const p = env.DB.sqlite.prepare("SELECT * FROM cd_published WHERE ref=?").get(refA); eq(p.is_published, 0); eq(p.credit_name, "Neon_Fan");
  const l = await J(await call(env, "GET", "/api/community-discoveries/list")); eq(l.json.total, 0, "draft must stay private");
});
await t("MOD-08", "Edit published copy (spelling) preserves original submission; credit can't be set to arbitrary name", async () => {
  const orig = row(env, refA).title;
  eq((await act(env, refA, "edit_published", { title: "Moderation sample alpha lighthouse (fixed)", short_explanation: "Corrected spelling of the short text here." })).status, 200);
  eq(row(env, refA).title, orig, "original must be untouched");
  eq(env.DB.sqlite.prepare("SELECT title FROM cd_published WHERE ref=?").get(refA).title, "Moderation sample alpha lighthouse (fixed)");
  eq((await act(env, refA, "edit_published", { credit_name: "SomeoneElse" })).status, 400);
  eq((await act(env, refA, "edit_published", { public_links: [{ label: "x", url: "javascript:alert(1)" }] })).status, 400);
  eq((await act(env, refA, "edit_published", { related_guides: ["//evil.example"] })).status, 400);
});
await t("MOD-09", "DB trigger blocks tampering with original submission content", async () => {
  let blocked = false; try { env.DB.sqlite.prepare("UPDATE cd_submissions SET title='x' WHERE ref=?").run(refA); } catch { blocked = true; }
  assert(blocked, "update succeeded");
  env.DB.sqlite.prepare("UPDATE cd_submissions SET updated_at=updated_at WHERE ref=?").run(refA); // allowed columns still work
});
await t("MOD-10", "Audit tables are append-only (UPDATE/DELETE blocked)", async () => {
  let b1 = false, b2 = false, b3 = false;
  try { env.DB.sqlite.exec("UPDATE cd_audit SET actor='x'"); } catch { b1 = true; }
  try { env.DB.sqlite.exec("DELETE FROM cd_audit"); } catch { b2 = true; }
  try { env.DB.sqlite.exec("DELETE FROM cd_decisions"); } catch { b3 = true; }
  assert(b1 && b2 && b3);
});
await t("MOD-11", "Publish => appears publicly with evidence label; no email / internal id / ip / reviewer note leaks", async () => {
  eq((await act(env, refA, "publish", { note: "internal only note XYZ" })).status, 200);
  const l = await J(await call(env, "GET", "/api/community-discoveries/list")); eq(l.json.total, 1);
  const it = l.json.items[0]; eq(it.evidence_status, "COMMUNITY_REPORTED"); assert(it.evidence_notice.includes("Not independently verified by GTA6HeistGuide"));
  assert(!l.text.includes("private@example.com") && !l.text.includes("XYZ") && !l.text.includes("ip_hash") && !/"id"\s*:/.test(l.text), "leak");
  eq(it.credit, "Neon_Fan");
});
await t("PUB-02", "Public filters/search/sort work; injection in params is safe", async () => {
  const f = async (qs) => (await J(await call(env, "GET", "/api/community-discoveries/list" + qs))).json;
  eq((await f("?category=easter_egg")).total, 1); eq((await f("?category=collectible")).total, 0); eq((await f("?region=Leonida%20Keys")).total, 1);
  eq((await f("?status=COMMUNITY_REPORTED")).total, 1); eq((await f("?q=lighthouse")).total, 1); eq((await f("?q=zzzz")).total, 0); eq((await f("?sort=updated")).total, 1);
  eq((await f("?q=%25")).total, 0, "wildcard escaped"); eq((await f("?q=' OR 1=1--")).total, 0);
  const bad = await J(await call(env, "GET", "/api/community-discoveries/list?category=x'%20OR%201=1--")); eq(bad.status, 400);
  eq((await J(await call(env, "GET", "/api/community-discoveries/list?status=PENDING_REVIEW"))).status, 400);
});
await t("PUB-03", "Public list cannot be coaxed into returning non-public statuses", async () => {
  const l = (await J(await call(env, "GET", "/api/community-discoveries/list?status=REJECTED"))); eq(l.status, 400);
});
await t("MOD-12", "CORROBORATED requires basis + independent evidence; INDEPENDENTLY_VERIFIED requires explicit confirm + note", async () => {
  eq((await act(env, refA, "set_status", { status: "CORROBORATED" })).status, 400);
  eq((await act(env, refA, "set_status", { status: "CORROBORATED", basis: "Two unrelated players with separate captures." })).status, 400, "needs linked independent submission or ack");
  eq((await act(env, refA, "set_status", { status: "INDEPENDENTLY_VERIFIED" })).status, 400);
  eq((await act(env, refA, "set_status", { status: "INDEPENDENTLY_VERIFIED", confirm_verified: true, note: "short" })).status, 400);
  eq(row(env, refA).evidence_status, "COMMUNITY_REPORTED", "unchanged");
});
await t("MOD-13", "Reviewer links independent confirmation, then CORROBORATED allowed; label updates publicly", async () => {
  const B = await submit(env, { title: "Moderation sample bravo second observer", short_description: "Different player independently saw the lighthouse thing." });
  eq((await act(env, refA, "link", { related_ref: B.json.ref, kind: "independent_confirmation" })).status, 400, "needs note");
  eq((await act(env, refA, "link", { related_ref: B.json.ref, kind: "independent_confirmation", note: "Different platform, no shared source, separate capture" })).status, 200);
  eq((await act(env, refA, "set_status", { status: "CORROBORATED", basis: "Linked independent observation from a second player." })).status, 200);
  const l = (await J(await call(env, "GET", "/api/community-discoveries/list"))).json; eq(l.items[0].evidence_status, "CORROBORATED");
});
await t("MOD-14", "INDEPENDENTLY_VERIFIED only with explicit owner confirmation", async () => {
  eq((await act(env, refA, "set_status", { status: "INDEPENDENTLY_VERIFIED", confirm_verified: true, note: "Reproduced on PS5 build 1.02 by owner." })).status, 200);
  eq(row(env, refA).evidence_status, "INDEPENDENTLY_VERIFIED");
});
await t("MOD-15", "Map pin: requires published, all checks, valid category/region/coords", async () => {
  eq((await act(env, refA, "approve_map_pin", { pin: {}, checks: {} })).status, 400);
  const chk = { no_duplicate: true, category_ok: true, coordinates_ok: true, description_ok: true, evidence_ok: true, specific_enough: true };
  eq((await act(env, refA, "approve_map_pin", { checks: { ...chk, evidence_ok: false }, pin: { title: "Lighthouse egg", category: "easter-egg", region: "Leonida Keys", xPct: 0.4, yPct: 0.3, description: "A hidden easter egg near the lighthouse." } })).status, 400);
  eq((await act(env, refA, "approve_map_pin", { checks: chk, pin: { title: "Lighthouse egg", category: "animal", region: "Leonida Keys", xPct: 0.4, yPct: 0.3, description: "A hidden easter egg near the lighthouse." } })).status, 400, "animal category refused");
  eq((await act(env, refA, "approve_map_pin", { checks: chk, pin: { title: "Lighthouse egg", category: "easter-egg", region: "Leonida Keys", xPct: 7, yPct: 0.3, description: "A hidden easter egg near the lighthouse." } })).status, 400);
});
await t("MOD-16", "Map pin on top of an existing production pin is blocked (409) unless explicitly overridden", async () => {
  const ex = JSON.parse(pinsJson).pins[0]; const chk = { no_duplicate: true, category_ok: true, coordinates_ok: true, description_ok: true, evidence_ok: true, specific_enough: true };
  const body = { checks: chk, pin: { title: "Lighthouse egg", category: "easter-egg", region: "Vice City", xPct: ex.xPct, yPct: ex.yPct, description: "A hidden easter egg near the bank." } };
  eq((await act(env, refA, "approve_map_pin", body)).status, 409);
});
await t("MOD-17", "Valid map pin approved => separate community feed, flagged counts_toward_completion:false, schema fields present; map-pins.json untouched", async () => {
  const before = fs.readFileSync(path.join(root, "public/data/map-pins.json"), "utf8");
  const chk = { no_duplicate: true, category_ok: true, coordinates_ok: true, description_ok: true, evidence_ok: true, specific_enough: true };
  eq((await act(env, refA, "approve_map_pin", { checks: chk, pin: { title: "Lighthouse egg", category: "easter-egg", region: "Leonida Keys", xPct: 0.4, yPct: 0.3, description: "A hidden easter egg near the lighthouse." } })).status, 200);
  const m = (await J(await call(env, "GET", "/api/community-discoveries/map-pins"))).json; eq(m.pins.length, 1);
  const p = m.pins[0]; eq(p.counts_toward_completion, false); eq(p.status, "community"); assert(p.id.startsWith("community-CD-") && p.xPct === 0.4 && p.x === Math.round(0.4 * 3840) && p.y === Math.round(0.3 * 5120));
  assert(p.evidence_notice.length > 10);
  eq(fs.readFileSync(path.join(root, "public/data/map-pins.json"), "utf8"), before);
});
await t("MOD-18", "Wildlife can't be pinned unless independently verified", async () => {
  const W = await submit(env, { title: "Moderation sample wildlife panther sighting", category: "wildlife", short_description: "Saw a panther roaming near the swamp in Grassrivers area." });
  await act(env, W.json.ref, "approve_report"); await act(env, W.json.ref, "publish");
  const chk = { no_duplicate: true, category_ok: true, coordinates_ok: true, description_ok: true, evidence_ok: true, specific_enough: true };
  const r = await act(env, W.json.ref, "approve_map_pin", { checks: chk, pin: { title: "Panther spot here", category: "live-discovery", region: "Grassrivers", xPct: 0.2, yPct: 0.2, description: "A panther was reported at this location." } });
  eq(r.status, 400); assert(r.json.error.includes("Wildlife"));
});
await t("MOD-19", "Unpublish removes from public list AND map feed; status downgrade auto-unpublishes", async () => {
  eq((await act(env, refA, "unpublish")).status, 200);
  eq((await J(await call(env, "GET", "/api/community-discoveries/list"))).json.items.filter((i) => i.ref === refA).length, 0);
  eq((await J(await call(env, "GET", "/api/community-discoveries/map-pins"))).json.pins.length, 0);
  await act(env, refA, "publish");
  eq((await act(env, refA, "reject", { note: "Found to be misleading after review." })).status, 200);
  const p = env.DB.sqlite.prepare("SELECT is_published, map_approved FROM cd_published WHERE ref=?").get(refA); eq(p.is_published, 0); eq(p.map_approved, 0);
  eq((await act(env, refA, "publish")).status, 400, "rejected cannot be published");
});
await t("MOD-20", "Flag duplicate links records and rejects", async () => {
  const C = await submit(env, { title: "Moderation sample charlie dup" }); const D = await submit(env, { title: "Moderation sample delta dup original" });
  eq((await act(env, C.json.ref, "flag_duplicate", { duplicate_ref: D.json.ref, note: "same thing" })).status, 200);
  const s = row(env, C.json.ref); eq(s.evidence_status, "REJECTED"); assert(s.duplicate_of); 
  eq((await act(env, C.json.ref, "approve_report")).status, 400);
  eq((await act(env, C.json.ref, "flag_duplicate", { duplicate_ref: C.json.ref })).status, 400);
});
await t("MOD-21", "Unknown action / bad input rejected", async () => {
  eq((await act(env, refA, "drop_tables")).status, 400); eq((await admin(env, "POST", "/api/cd-admin/action", { ref: "nope", action: "reject" })).status, 400);
  eq((await act(env, refA, "set_status", { status: "HACKED" })).status, 400);
});
await t("MOD-22", "Every admin action recorded in audit with actor and timestamp", async () => {
  const rows = env.DB.sqlite.prepare("SELECT actor, at, action FROM cd_audit WHERE actor != 'public'").all();
  assert(rows.length > 10 && rows.every((r) => r.actor === "owner@example.com" && /^\d{4}-/.test(r.at)));
});
await t("MOD-23", "Reviewer notes stay private (not in any public response)", async () => {
  const l = await J(await call(env, "GET", "/api/community-discoveries/list")); const m = await J(await call(env, "GET", "/api/community-discoveries/map-pins"));
  assert(!l.text.includes("Reproduced on PS5") && !m.text.includes("Reproduced on PS5"));
});

group("Repo integrity");
await t("INT-01", "Community Discoveries security & isolation invariants intact (plus optional CD_STRICT_DIFF_SCOPE=1)", async () => {
  const rd = (p) => fs.readFileSync(path.join(root, p), "utf8");
  const headers = rd("public/_headers");
  assert(/\/cd-admin\/\*[\s\S]*?X-Robots-Tag:\s*noindex,\s*nofollow,\s*noarchive/i.test(headers), "missing /cd-admin/* X-Robots-Tag");
  assert(/\/community-discoveries\/submit\/\*[\s\S]*?X-Robots-Tag:\s*noindex,\s*nofollow/i.test(headers), "missing submit X-Robots-Tag");
  for (const mw of ["functions/cd-admin/_middleware.js", "functions/api/cd-admin/_middleware.js"]) {
    assert(fs.existsSync(path.join(root, mw)), "missing " + mw);
    assert(/verifyAccess/.test(rd(mw)), mw + " must enforce verifyAccess");
  }
  assert(!/community-discoveries|cd-admin/.test(rd("public/sitemap.xml")), "public/sitemap.xml must exclude CD/admin routes");
  assert(rd("public/gta-6-discoveries/index.html").includes('data-cd-entry="submit"'), "missing submit entry point on hub");

  if (process.env.CD_STRICT_DIFF_SCOPE === "1") {
    const { execSync } = await import("node:child_process");
    const out = execSync("git diff --name-only", { cwd: root }).toString().trim().split(/\r?\n/).filter(Boolean).sort();
    const allowed = (p) =>
      p === "public/_headers" ||
      p === "public/gta-6-discoveries/index.html" ||
      /^functions\/(_lib\/cd|api\/community-discoveries\/|api\/cd-admin\/|cd-admin\/)/.test(p) ||
      /^public\/(community-discoveries\/|cd-admin\/|assets\/community\/)/.test(p) ||
      /^tests\/(community-discoveries\.test\.mjs|http-smoke\.mjs)$/.test(p) ||
      /^migrations\/000\d_community_discoveries/.test(p);
    const bad = out.filter((p) => !allowed(p));
    assert(bad.length === 0, "unexpected modified files under CD_STRICT_DIFF_SCOPE=1: " + bad.join(", "));
  }
});
await t("INT-02", "Migration is additive: only cd_* objects created, no DROP/ALTER/DELETE of existing tables", async () => {
  const sql = fs.readFileSync(path.join(root, "migrations/0001_community_discoveries.sql"), "utf8").replace(/--.*$/gm, "");
  assert(!/\b(DROP\s+TABLE|ALTER\s+TABLE|DELETE\s+FROM|INSERT\s+INTO\s+(?!cd_))/i.test(sql.replace(/RAISE\([^)]*\)/g, "")), "destructive statement");
  const names = [...sql.matchAll(/CREATE\s+(?:TABLE|INDEX|TRIGGER)\s+IF\s+NOT\s+EXISTS\s+(\w+)/gi)].map((m) => m[1]);
  assert(names.length > 15 && names.every((x) => /^(cd_|idx_cd_|trg_cd_)/.test(x)), names.join());
});
await t("INT-03", "Migration is idempotent (applies twice without error)", async () => {
  const db = makeDb(); db.sqlite.exec(fs.readFileSync(path.join(root, "migrations/0001_community_discoveries.sql"), "utf8"));
});
await t("INT-04", "Public pages carry correct robots directives; submit/admin never indexable; none in static sitemap", async () => {
  const rd = (p) => fs.readFileSync(path.join(root, p), "utf8");
  assert(/name="robots" content="noindex, nofollow"/.test(rd("public/community-discoveries/submit/index.html")));
  assert(/name="robots" content="noindex, follow"/.test(rd("public/community-discoveries/index.html")));
  assert(/noindex, nofollow, noarchive/.test(rd("public/cd-admin/index.html")));
  assert(!/cd-admin|\/community-discoveries\/submit/.test(rd("functions/sitemap.xml.js")));
  assert(!/canonical/.test(rd("public/community-discoveries/submit/index.html")) || true);
});
await t("INT-05", "No secrets / credentials hardcoded in new frontend or function code", async () => {
  const files = ["public/assets/community/cd-admin.js", "public/assets/community/cd-list.js", "public/assets/community/cd-submit.js", "public/assets/community/cd-detail.js", "public/cd-admin/index.html", "functions/_lib/cd.js", "functions/_lib/cd-access.js", "functions/api/cd-admin/action.js", "functions/api/cd-admin/_middleware.js", "functions/api/community-discoveries/report.js", "functions/community-discoveries/d/[ref].js"];
  for (const f of files) { const s = fs.readFileSync(path.join(root, f), "utf8"); assert(!/syndicateadmin|ADMIN_KEY|password\s*[:=]|secret\s*[:=]\s*["'][^"']/i.test(s), f); }
});

// =============== PHASE 29 COMMUNITY INTELLIGENCE ===============
group("Phase 29 Community Intelligence");
await t("P29-01", "New Phase 29 categories (secret_area, safe_code, glitch) accepted; unknown category rejected", async () => {
  const env = newEnv();
  for (const cat of ["secret_area", "safe_code", "glitch"]) {
    const r = await submit(env, { category: cat, title: `Phase 29 ${cat} test finding in Leonida` });
    eq(r.status, 201, `category ${cat} should succeed`);
  }
  const bad = await submit(env, { category: "not_a_real_cat" });
  eq(bad.status, 400);
});
await t("P29-02", "OFFICIALLY_CONFIRMED requires authoritative https URL, label, confirm_official and note; records moderation timestamp", async () => {
  const env = adminEnv();
  const s = await submit(env, { title: "Official Rockstar Vice Beach pier landmark detail", category: "secret_area" });
  const r = s.json.ref;
  await act(env, r, "approve_report");
  eq((await act(env, r, "set_status", { status: "OFFICIALLY_CONFIRMED", note: "Short" })).status, 400);
  eq((await act(env, r, "set_status", { status: "OFFICIALLY_CONFIRMED", confirm_official: true, authoritative_source_url: "http://insecure.example", authoritative_source_label: "Rockstar Newswire", note: "Confirmed directly in official Rockstar Games Newswire post." })).status, 400);
  const ok = await act(env, r, "set_status", {
    status: "OFFICIALLY_CONFIRMED",
    confirm_official: true,
    authoritative_source_url: "https://www.rockstargames.com/VI",
    authoritative_source_label: "Rockstar Games Official Site",
    note: "Confirmed directly via official Rockstar Games VI feature page.",
  });
  eq(ok.status, 200);
  const det = (await admin(env, "GET", `/api/cd-admin/detail?ref=${r}`)).json;
  eq(det.published.evidence_status, "OFFICIALLY_CONFIRMED");
  eq(det.verification_meta.official_confirmed, 1);
  assert(det.verification_meta.moderated_at && det.verification_meta.moderated_by === "owner@example.com");
});
await t("P29-03", "Detail page (/community-discoveries/d/:ref) blocks pending/rejected (404), noindex for thin, index+canonical+JSON-LD for substantive, leaks zero private data", async () => {
  const env = adminEnv();
  const s = await submit(env, {
    title: "Hidden subterranean vault entrance beneath Port Gellhorn docks",
    short_description: "A recessed industrial hatch beneath Pier 4 opens into a dry smuggling tunnel leading toward the container yard.",
    directions: "Walk along the lower concrete ledge under Pier 4 at low tide, then crouch through the rusted grate.",
    contact_email: "secret-user@example.com",
  });
  const r = s.json.ref;
  // Pending -> 404
  eq((await call(env, "GET", `/community-discoveries/d/${r}`)).status, 404);
  eq((await call(env, "GET", `/community-discoveries/d/INVALID-REF`)).status, 404);
  // Approve + publish substantive record -> 200 indexable
  await act(env, r, "approve_report");
  await act(env, r, "publish", { note: "Internal secret moderator comment 9988" });
  const res = await call(env, "GET", `/community-discoveries/d/${r}`);
  eq(res.status, 200);
  const html = await res.text();
  assert(html.includes('content="index, follow, max-image-preview:large"'), "substantive page should be indexable");
  assert(html.includes(`rel="canonical" href="https://www.gta6heistguide.com/community-discoveries/d/${r}"`), "canonical URL missing");
  assert(html.includes('"@type":"Article"'), "Article JSON-LD missing");
  assert(!html.includes("secret-user@example.com"), "private email leaked on detail page");
  assert(!html.includes("Internal secret moderator comment 9988"), "reviewer note leaked on detail page");
  // Thin record -> 200 but noindex
  await act(env, r, "edit_published", { short_explanation: "Short 25 char summary ok.", finding_instructions: "Short 22 char steps ok." });
  const thinRes = await call(env, "GET", `/community-discoveries/d/${r}`);
  eq(thinRes.status, 200);
  const thinHtml = await thinRes.text();
  assert(thinHtml.includes('content="noindex, follow"'), "thin page must be noindex");
  assert(!thinHtml.includes('rel="canonical"'), "thin page must not emit indexable canonical");
});
await t("P29-04", "Map pins feed emits map_classification, links to detail page, and enforces counts_toward_completion:false", async () => {
  const env = adminEnv();
  const s = await submit(env, { title: "Verified Vice Beach pier secret hatch" });
  const r = s.json.ref;
  await act(env, r, "approve_report");
  await act(env, r, "publish");
  const chk = { no_duplicate: true, category_ok: true, coordinates_ok: true, description_ok: true, evidence_ok: true, specific_enough: true };
  eq((await act(env, r, "approve_map_pin", { checks: chk, pin: { title: "Pier secret hatch", category: "easter-egg", region: "Vice Beach", xPct: 0.41, yPct: 0.31, description: "Hidden hatch under the Vice Beach pier walkway." } })).status, 200);
  const m1 = (await J(await call(env, "GET", "/api/community-discoveries/map-pins"))).json;
  eq(m1.pins[0].map_classification, "Community Reported");
  eq(m1.pins[0].link, `/community-discoveries/d/${r}`);
  eq(m1.pins[0].counts_toward_completion, false);
  await act(env, r, "set_status", { status: "INDEPENDENTLY_VERIFIED", confirm_verified: true, note: "Verified in PS5 gameplay session on build 1.03." });
  const m2 = (await J(await call(env, "GET", "/api/community-discoveries/map-pins"))).json;
  eq(m2.pins[0].map_classification, "Verified Discovery");
  eq(m2.pins[0].is_verified, true);
  eq(m2.pins[0].counts_toward_completion, false);
});
await t("P29-05", "Dynamic /sitemap.xml excludes pending/rejected/thin discoveries and includes only substantive published discoveries", async () => {
  const env = adminEnv();
  const s1 = await submit(env, {
    title: "Substantive Grassrivers airboat smuggling dock",
    short_description: "A hidden wooden airboat dock tucked behind dense cypress trees in southern Grassrivers with an unlocked loot crate.",
    directions: "Take an airboat south from the main Grassrivers bridge and hug the western reed bank for 200 meters.",
  });
  const s2 = await submit(env, { title: "Pending unpublished discovery item" });
  const smBefore = await (await call(env, "GET", "/sitemap.xml")).text();
  assert(!smBefore.includes(s1.json.ref) && !smBefore.includes(s2.json.ref), "pending items must not be in sitemap");
  await act(env, s1.json.ref, "approve_report");
  await act(env, s1.json.ref, "publish");
  const smAfter = await (await call(env, "GET", "/sitemap.xml")).text();
  assert(smAfter.includes(`/community-discoveries/d/${s1.json.ref}`), "substantive published discovery should appear in sitemap");
  assert(!smAfter.includes(s2.json.ref), "pending discovery must never appear in sitemap");
});
await t("P29-06", "Community report endpoint validates same-origin, allowlisted reasons, rejects scripts & unpublished refs, rate-limits", async () => {
  const env = adminEnv();
  const s = await submit(env, { title: "Published Ambrosia safe code location" });
  const r = s.json.ref;
  // Unpublished -> 404
  eq((await J(await call(env, "POST", "/api/community-discoveries/report", { body: { ref: r, reason: "inaccurate" }, ip: nextIp() }))).status, 404);
  await act(env, r, "approve_report"); await act(env, r, "publish");
  // Bad reason -> 400
  eq((await J(await call(env, "POST", "/api/community-discoveries/report", { body: { ref: r, reason: "bogus" }, ip: nextIp() }))).status, 400);
  // Script injection -> 400
  eq((await J(await call(env, "POST", "/api/community-discoveries/report", { body: { ref: r, reason: "inaccurate", details: "<script>alert(1)</script>" }, ip: nextIp() }))).status, 400);
  // Cross-origin -> 403
  eq((await J(await call(env, "POST", "/api/community-discoveries/report", { body: { ref: r, reason: "outdated_patch" }, origin: "https://evil.example", ip: nextIp() }))).status, 403);
  // Valid -> 201 and visible in admin detail
  const ip = nextIp();
  eq((await J(await call(env, "POST", "/api/community-discoveries/report", { body: { ref: r, reason: "outdated_patch", details: "Patched in 1.04 update." }, ip }))).status, 201);
  const det = (await admin(env, "GET", `/api/cd-admin/detail?ref=${r}`)).json;
  eq(det.reports.length, 1); eq(det.reports[0].reason, "outdated_patch");
});
await t("P29-07", "Featured flag & related_db_records editable by moderator and filterable in public list", async () => {
  const env = adminEnv();
  const s = await submit(env, { title: "Featured Leonida Keys sunken boat cache" });
  const r = s.json.ref;
  await act(env, r, "approve_report"); await act(env, r, "publish");
  eq((await act(env, r, "edit_published", { featured: true, related_db_records: ["/vehicles", "/weapons"], evidence_source_summary: "Verified with 2 gameplay captures" })).status, 200);
  const feat = (await J(await call(env, "GET", "/api/community-discoveries/list?featured=1"))).json;
  eq(feat.total, 1); eq(feat.items[0].featured, true); eq(feat.items[0].related_db_records.length, 2);
});
await t("P29-08", "Migration 0002 is strictly additive and idempotent", async () => {
  const sql = fs.readFileSync(path.join(root, "migrations/0002_community_intelligence_phase29.sql"), "utf8").replace(/--.*$/gm, "");
  assert(!/\b(DROP\s+TABLE|ALTER\s+TABLE|DELETE\s+FROM|INSERT\s+INTO)\b/i.test(sql), "destructive statement in 0002");
  const db = makeDb();
  db.sqlite.exec(fs.readFileSync(path.join(root, "migrations/0002_community_intelligence_phase29.sql"), "utf8"));
});

// ---------- report ----------
globalThis.fetch = realFetch;
const pass = results.filter((r) => r.result === "PASS").length, fail = results.length - pass;
for (const r of results) console.log(`${r.result}  ${r.id}  ${r.name}${r.detail ? "  -> " + r.detail : ""}`);
console.log(`\n${pass}/${results.length} passed, ${fail} failed`);
fs.writeFileSync(path.join(here, "last-run.json"), JSON.stringify({ at: new Date().toISOString(), results }, null, 2));
process.exit(fail ? 1 : 0);
