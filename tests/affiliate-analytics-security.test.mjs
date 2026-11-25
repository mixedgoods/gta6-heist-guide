import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import * as clicksRoute from "../functions/api/clicks.js";
import * as adminMiddleware from "../functions/api/cd-admin/_middleware.js";
import * as affiliateReportRoute from "../functions/api/cd-admin/affiliate-report.js";
import * as contactRoute from "../functions/api/contact.js";
import * as subscribeRoute from "../functions/api/subscribe.js";
import { resetJwksCache } from "../functions/_lib/cd-access.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const TEAM = "owner-test.cloudflareaccess.com";
const AUD = "aud-affiliate-report-test-123";
const ADMIN_EMAIL = "owner@gta6heistguide.com";

// Generate an ephemeral RS256 keypair for testing real Cloudflare Access JWT verification
const keyPair = await crypto.subtle.generateKey(
  { name: "RSASSA-PKCS1-v1_5", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" },
  true,
  ["sign", "verify"]
);
const pubJwk = { ...(await crypto.subtle.exportKey("jwk", keyPair.publicKey)), kid: "test-kid-1", use: "sig", alg: "RS256" };

function b64u(input) {
  const bytes = typeof input === "string" ? new TextEncoder().encode(input) : new Uint8Array(input);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function mintAccessJwt(overrides = {}) {
  const header = b64u(JSON.stringify({ alg: "RS256", kid: "test-kid-1", typ: "JWT" }));
  const now = Math.floor(Date.now() / 1000);
  const payload = b64u(
    JSON.stringify({
      aud: [AUD],
      iss: `https://${TEAM}`,
      sub: "sub-owner-1",
      email: ADMIN_EMAIL,
      iat: now - 10,
      exp: now + 3600,
      ...overrides,
    })
  );
  const sig = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    keyPair.privateKey,
    new TextEncoder().encode(`${header}.${payload}`)
  );
  return `${header}.${payload}.${b64u(sig)}`;
}

// Intercept JWKS fetches for TEAM during tests
const origFetch = globalThis.fetch;
globalThis.fetch = async (url, init) => {
  if (String(url) === `https://${TEAM}/cdn-cgi/access/certs`) {
    return new Response(JSON.stringify({ keys: [pubJwk] }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
  return origFetch(url, init);
};

function createMockD1() {
  const clicks = [];
  const subscribers = [{ id: 1, email: "vip@example.com", callsign: "Lucia", platform: "PS5", role: "Mastermind", discord_tag: "", marketing_opt_in: 1, created_at: "2026-11-25 12:00:00" }];
  const inquiries = [{ id: 1, name: "Sponsor", email: "sponsor@example.com", inquiry_type: "sponsor", budget: "$5k", message: "Hello", source_page: "/contact.html", created_at: "2026-11-25 12:00:00" }];

  return {
    clicks,
    prepare(sql) {
      let bound = [];
      return {
        bind(...args) {
          bound = args;
          return this;
        },
        async run() {
          if (/INSERT INTO affiliate_clicks/i.test(sql)) {
            clicks.push({
              id: clicks.length + 1,
              partner: bound[0],
              placement: bound[1],
              page_path: bound[2],
              target_url: bound[3],
              created_at: new Date().toISOString().slice(0, 19).replace("T", " "),
            });
          }
          return { success: true };
        },
        async first() {
          if (/COUNT\(\*\) AS count FROM subscribers/i.test(sql)) {
            return { count: subscribers.length };
          }
          return null;
        },
        async all() {
          if (/GROUP BY partner ORDER BY clicks DESC/i.test(sql)) {
            const map = new Map();
            for (const c of clicks) map.set(c.partner, (map.get(c.partner) || 0) + 1);
            return { results: [...map.entries()].map(([partner, cnt]) => ({ partner, clicks: cnt })) };
          }
          if (/clicks_7d/i.test(sql)) {
            const map = new Map();
            for (const c of clicks) map.set(c.partner, (map.get(c.partner) || 0) + 1);
            return { results: [...map.entries()].map(([partner, cnt]) => ({ partner, clicks_7d: cnt })) };
          }
          if (/FROM affiliate_clicks ORDER BY id DESC LIMIT 20/i.test(sql)) {
            return { results: [...clicks].reverse().slice(0, 20) };
          }
          if (/FROM contact_inquiries/i.test(sql)) {
            return { results: inquiries };
          }
          if (/FROM subscribers ORDER BY id DESC/i.test(sql)) {
            return { results: subscribers };
          }
          return { results: [] };
        },
      };
    },
  };
}

async function callAdminAffiliateReport(request, env) {
  const data = {};
  const handler =
    request.method === "GET"
      ? affiliateReportRoute.onRequestGet
      : affiliateReportRoute.onRequest;
  return adminMiddleware.onRequest({
    request,
    env,
    data,
    next: () => handler({ request, env, data }),
  });
}

test("SEC-A: GET /api/clicks?key=syndicateadmin cannot access reports (405)", async () => {
  const db = createMockD1();
  const req = new Request("https://www.gta6heistguide.com/api/clicks?key=syndicateadmin", { method: "GET" });
  const res = await clicksRoute.onRequestGet({ request: req, env: { DB: db } });
  assert.equal(res.status, 405);
  assert.equal(res.headers.get("Cache-Control"), "no-store");
  const body = await res.json();
  assert.equal(body.ok, false);
  assert.equal("totalClicks" in body, false);
  assert.equal("recent" in body, false);
});

test("SEC-B: GET /api/clicks without credentials cannot access reports (405)", async () => {
  const db = createMockD1();
  const req = new Request("https://www.gta6heistguide.com/api/clicks", { method: "GET" });
  const res = await clicksRoute.onRequestGet({ request: req, env: { DB: db } });
  assert.equal(res.status, 405);
  assert.match(res.headers.get("Allow") || "", /POST/);
  const body = await res.json();
  assert.equal(body.ok, false);
});

test("SEC-C: GET /api/clicks with arbitrary query-string credentials cannot access reports (405)", async () => {
  const db = createMockD1();
  for (const qs of ["?key=test", "?key=supersecret", "?admin=1", "?token=abc"]) {
    const req = new Request(`https://www.gta6heistguide.com/api/clicks${qs}`, { method: "GET" });
    const res = await clicksRoute.onRequestGet({ request: req, env: { DB: db, ADMIN_KEY: "supersecret" } });
    assert.equal(res.status, 405);
    const body = await res.json();
    assert.equal(body.ok, false);
  }
});

test("SEC-D: Missing ADMIN_KEY never grants access on /api/clicks, /api/contact, or /api/subscribe privileged modes", async () => {
  const db = createMockD1();
  const envNoKey = { DB: db }; // ADMIN_KEY intentionally undefined

  const rClicks = await clicksRoute.onRequestGet({
    request: new Request("https://www.gta6heistguide.com/api/clicks?key=syndicateadmin"),
    env: envNoKey,
  });
  assert.equal(rClicks.status, 405);

  const rContactFallback = await contactRoute.onRequestGet({
    request: new Request("https://www.gta6heistguide.com/api/contact?key=syndicateadmin"),
    env: envNoKey,
  });
  assert.equal(rContactFallback.status, 503);
  const contactBody = await rContactFallback.json();
  assert.equal(contactBody.ok, false);
  assert.equal("inquiries" in contactBody, false);

  const rSubList = await subscribeRoute.onRequestGet({
    request: new Request("https://www.gta6heistguide.com/api/subscribe?list=1&key=syndicateadmin"),
    env: envNoKey,
  });
  assert.equal(rSubList.status, 503);
  const subListBody = await rSubList.json();
  assert.equal(subListBody.ok, false);
  assert.equal("subscribers" in subListBody, false);

  const rSubCsv = await subscribeRoute.onRequestGet({
    request: new Request("https://www.gta6heistguide.com/api/subscribe?export=csv&key=syndicateadmin"),
    env: envNoKey,
  });
  assert.equal(rSubCsv.status, 503);

  // Public count on /api/subscribe (no list/export) still works safely without exposing emails
  const rSubPublic = await subscribeRoute.onRequestGet({
    request: new Request("https://www.gta6heistguide.com/api/subscribe"),
    env: envNoKey,
  });
  assert.equal(rSubPublic.status, 200);
  const subPubBody = await rSubPublic.json();
  assert.equal(subPubBody.ok, true);
  assert.equal("subscribers" in subPubBody, false);
});

test("SEC-E: /api/cd-admin/affiliate-report rejects unauthenticated, misconfigured, forged, and non-allowlisted requests", async () => {
  resetJwksCache();
  const db = createMockD1();

  // Unconfigured Access -> 503 fail closed
  const r503 = await callAdminAffiliateReport(
    new Request("https://www.gta6heistguide.com/api/cd-admin/affiliate-report"),
    { DB: db }
  );
  assert.equal(r503.status, 503);
  assert.equal(r503.headers.get("Cache-Control"), "no-store");

  const configuredEnv = {
    DB: db,
    CF_ACCESS_TEAM_DOMAIN: TEAM,
    CF_ACCESS_AUD: AUD,
    CD_ADMIN_EMAILS: ADMIN_EMAIL,
  };

  // No token -> 401
  const rNoTok = await callAdminAffiliateReport(
    new Request("https://www.gta6heistguide.com/api/cd-admin/affiliate-report"),
    configuredEnv
  );
  assert.equal(rNoTok.status, 401);

  // Legacy query key without Access JWT -> 401
  const rLegacyKey = await callAdminAffiliateReport(
    new Request("https://www.gta6heistguide.com/api/cd-admin/affiliate-report?key=syndicateadmin"),
    configuredEnv
  );
  assert.equal(rLegacyKey.status, 401);

  // Forged unsigned / alg=none token -> 401
  const fakeHeader = b64u(JSON.stringify({ alg: "none", kid: "test-kid-1" }));
  const fakePayload = b64u(JSON.stringify({ aud: [AUD], iss: `https://${TEAM}`, email: ADMIN_EMAIL, exp: 9999999999 }));
  const rForged = await callAdminAffiliateReport(
    new Request("https://www.gta6heistguide.com/api/cd-admin/affiliate-report", {
      headers: { "Cf-Access-Jwt-Assertion": `${fakeHeader}.${fakePayload}.` },
    }),
    configuredEnv
  );
  assert.equal(rForged.status, 401);

  // Valid signature but non-allowlisted email -> 403
  const intruderJwt = await mintAccessJwt({ email: "intruder@example.com" });
  const rForbidden = await callAdminAffiliateReport(
    new Request("https://www.gta6heistguide.com/api/cd-admin/affiliate-report", {
      headers: { "Cf-Access-Jwt-Assertion": intruderJwt },
    }),
    configuredEnv
  );
  assert.equal(rForbidden.status, 403);
  const bodyForbidden = await rForbidden.json();
  assert.equal(bodyForbidden.ok, false);
  assert.equal("totalClicks" in bodyForbidden, false);
});

test("SEC-F: Cloudflare Access-authorized owner retrieves affiliate report with no-store headers and no PII", async () => {
  resetJwksCache();
  const db = createMockD1();
  const env = {
    DB: db,
    CF_ACCESS_TEAM_DOMAIN: TEAM,
    CF_ACCESS_AUD: AUD,
    CD_ADMIN_EMAILS: ADMIN_EMAIL,
  };

  // Seed two anonymous clicks via POST /api/clicks
  for (const payload of [
    { partner: "amazon", placement: "hero_card", page_path: "/gaming-gear/", target_url: "https://www.amazon.com/dp/B0BHJJ9Y77?tag=gta6heist-20" },
    { partner: "g2a", placement: "sidebar", page_path: "/", target_url: "https://www.g2a.com/n/reflink-4094b9aab5" },
  ]) {
    const postRes = await clicksRoute.onRequestPost({
      request: new Request("https://www.gta6heistguide.com/api/clicks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
      env,
    });
    assert.equal(postRes.status, 200);
  }

  const ownerJwt = await mintAccessJwt();
  const res = await callAdminAffiliateReport(
    new Request("https://www.gta6heistguide.com/api/cd-admin/affiliate-report", {
      headers: { "Cf-Access-Jwt-Assertion": ownerJwt },
    }),
    env
  );
  assert.equal(res.status, 200);
  assert.equal(res.headers.get("Cache-Control"), "no-store");
  assert.match(res.headers.get("X-Robots-Tag") || "", /noindex/);

  const data = await res.json();
  assert.equal(data.ok, true);
  assert.equal(data.totalClicks, 2);
  assert.equal(data.totalClicks7d, 2);
  assert.equal(data.byPartner.amazon, 1);
  assert.equal(data.byPartner.g2a, 1);
  assert.equal(data.recent.length, 2);

  const serialized = JSON.stringify(data);
  assert.equal(/syndicateadmin|ADMIN_KEY|email|ip_hash/i.test(serialized), false);
});

test("SEC-G & SEC-H: Anonymous POST /api/clicks works and enforces payload/validation restrictions", async () => {
  const db = createMockD1();
  const env = { DB: db };

  // Valid anonymous click
  const okRes = await clicksRoute.onRequestPost({
    request: new Request("https://www.gta6heistguide.com/api/clicks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        partner: "amazon",
        placement: "gear_card",
        page_path: "/gaming-gear/",
        target_url: "https://www.amazon.com/dp/B0BHJJ9Y77?tag=gta6heist-20",
      }),
    }),
    env,
  });
  assert.equal(okRes.status, 200);
  const okBody = await okRes.json();
  assert.deepEqual(okBody, { ok: true, partner: "amazon", placement: "gear_card" });
  assert.equal(db.clicks.length, 1);

  // Invalid JSON -> 400
  const badJson = await clicksRoute.onRequestPost({
    request: new Request("https://www.gta6heistguide.com/api/clicks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{not-json",
    }),
    env,
  });
  assert.equal(badJson.status, 400);

  // Oversized body (> 4096 bytes) -> 413
  const bigRes = await clicksRoute.onRequestPost({
    request: new Request("https://www.gta6heistguide.com/api/clicks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ partner: "amazon", target_url: "https://amazon.com/" + "a".repeat(5000) }),
    }),
    env,
  });
  assert.equal(bigRes.status, 413);

  // Dangerous target_url scheme stripped & unknown partner normalized to "other"
  const xssRes = await clicksRoute.onRequestPost({
    request: new Request("https://www.gta6heistguide.com/api/clicks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        partner: "unknown_merchant",
        placement: "p".repeat(200),
        page_path: "/".repeat(300),
        target_url: "javascript:alert(1)",
      }),
    }),
    env,
  });
  assert.equal(xssRes.status, 200);
  const lastRow = db.clicks[db.clicks.length - 1];
  assert.equal(lastRow.partner, "other");
  assert.equal(lastRow.target_url, "");
  assert.equal(lastRow.placement.length, 80);
  assert.equal(lastRow.page_path.length, 200);

  // OPTIONS -> 204
  const optRes = await clicksRoute.onRequestOptions();
  assert.equal(optRes.status, 204);
});

test("SEC-J: No hardcoded syndicateadmin secret exists in functions/ or public/ reporting files", () => {
  const checkedFiles = [
    "functions/api/clicks.js",
    "functions/api/cd-admin/affiliate-report.js",
    "functions/_lib/affiliate-clicks.js",
    "functions/api/contact.js",
    "functions/api/subscribe.js",
    "public/syndicate-command.html",
    "public/assets/main.js",
    "public/js/affiliates.js",
  ];
  for (const rel of checkedFiles) {
    const src = fs.readFileSync(path.join(ROOT, rel), "utf8");
    assert.equal(/syndicateadmin/i.test(src), false, `Found hardcoded fallback in ${rel}`);
  }
});
