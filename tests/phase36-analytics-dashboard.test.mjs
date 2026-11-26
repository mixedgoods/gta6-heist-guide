import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

import { getAffiliateClickReport } from "../functions/_lib/affiliate-clicks.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const SITE_CONFIG_SRC = fs.readFileSync(path.join(ROOT, "public", "site-config.js"), "utf8");
const AFFILIATES_SRC = fs.readFileSync(path.join(ROOT, "public", "js", "affiliates.js"), "utf8");
const MAIN_SRC = fs.readFileSync(path.join(ROOT, "public", "assets", "main.js"), "utf8");

function makeBrowser({ pathname = "/port-gellhorn", search = "?token=secret123&email=test@example.com", dnt = null, gpc = false, optOutStored = null } = {}) {
  const docListeners = new Map();
  const appendedScripts = [];
  const storage = new Map();
  if (optOutStored !== null) storage.set("gta6_analytics_opt_out", optOutStored);

  const document = {
    readyState: "interactive",
    head: {
      appendChild(el) {
        appendedScripts.push(el);
      },
    },
    body: { classList: { add() {}, remove() {}, toggle() {} }, appendChild() {} },
    documentElement: { classList: { add() {}, remove() {} } },
    addEventListener(type, fn) {
      if (!docListeners.has(type)) docListeners.set(type, []);
      docListeners.get(type).push(fn);
    },
    querySelector(sel) {
      if (sel === "script[data-gta6-ga4]") {
        return appendedScripts.find((s) => s._attrs && s._attrs["data-gta6-ga4"]) || null;
      }
      return null;
    },
    querySelectorAll() { return []; },
    getElementById() { return null; },
    createElement(tag) {
      const attrs = {};
      return {
        tagName: tag.toUpperCase(),
        _attrs: attrs,
        setAttribute(k, v) { attrs[k] = String(v); },
        getAttribute(k) { return attrs[k] || null; },
        appendChild() {},
        classList: { add() {}, remove() {} },
        style: {},
      };
    },
  };

  const sandbox = {
    console,
    URL,
    URLSearchParams,
    Date,
    Math,
    JSON,
    Object,
    Array,
    String,
    Number,
    Boolean,
    RegExp,
    Error,
    Promise,
    Blob: class { constructor(p) { this._text = p.join(""); } },
    document,
    localStorage: {
      getItem(k) { return storage.has(k) ? storage.get(k) : null; },
      setItem(k, v) { storage.set(k, String(v)); },
      removeItem(k) { storage.delete(k); },
    },
    sessionStorage: { getItem() { return null; }, setItem() {}, removeItem() {} },
    navigator: {
      userAgent: "Phase36Test",
      doNotTrack: dnt,
      globalPrivacyControl: gpc,
      sendBeacon: () => true,
    },
    location: {
      pathname,
      search,
      origin: "https://www.gta6heistguide.com",
      href: `https://www.gta6heistguide.com${pathname}${search}`,
      hash: "",
    },
    addEventListener() {},
    removeEventListener() {},
    matchMedia: () => ({ matches: false, addEventListener() {} }),
    requestAnimationFrame: (cb) => cb(),
    setTimeout() { return 1; },
    clearTimeout() {},
    setInterval() { return 1; },
    clearInterval() {},
    fetch: () => Promise.resolve({ ok: true, json: async () => ({ ok: true }) }),
  };
  sandbox.window = sandbox;
  sandbox.self = sandbox;
  sandbox.globalThis = sandbox;
  const ctx = vm.createContext(sandbox);

  vm.runInContext(SITE_CONFIG_SRC, ctx, { filename: "site-config.js" });
  vm.runInContext(AFFILIATES_SRC, ctx, { filename: "affiliates.js" });
  vm.runInContext(MAIN_SRC, ctx, { filename: "main.js" });
  for (const fn of docListeners.get("DOMContentLoaded") || []) {
    try { fn(); } catch (_) {}
  }
  return { ctx, docListeners, appendedScripts };
}

test("P36-GA1: GA4 loads exactly once with G-DG7REYHR80, strips query params, and disables Google Signals & Ads Personalization", () => {
  const { ctx, appendedScripts } = makeBrowser();
  const gaScripts = appendedScripts.filter((s) => s._attrs && s._attrs["data-gta6-ga4"]);
  assert.equal(gaScripts.length, 1);
  assert.equal(gaScripts[0]._attrs["data-gta6-ga4"], "G-DG7REYHR80");
  assert.equal(ctx.SITE_CONFIG.enableAmazonProductPlacements, false);

  const configCall = (ctx.dataLayer || []).find((args) => args[0] === "config" && args[1] === "G-DG7REYHR80");
  assert.ok(configCall, "gtag config call should exist");
  assert.equal(configCall[2].anonymize_ip, true);
  assert.equal(configCall[2].allow_google_signals, false);
  assert.equal(configCall[2].allow_ad_personalization_signals, false);
  assert.equal(configCall[2].page_location, "https://www.gta6heistguide.com/port-gellhorn");
  assert.equal(configCall[2].page_location.includes("secret123"), false);
});

test("P36-GA2: GA4 does not load when DNT=1, GPC=true, local opt-out=1, or on /cd-admin/*", () => {
  assert.equal(makeBrowser({ dnt: "1" }).appendedScripts.filter((s) => s._attrs["data-gta6-ga4"]).length, 0);
  assert.equal(makeBrowser({ gpc: true }).appendedScripts.filter((s) => s._attrs["data-gta6-ga4"]).length, 0);
  assert.equal(makeBrowser({ optOutStored: "1" }).appendedScripts.filter((s) => s._attrs["data-gta6-ga4"]).length, 0);
  assert.equal(makeBrowser({ pathname: "/cd-admin/affiliate-dashboard.html" }).appendedScripts.filter((s) => s._attrs["data-gta6-ga4"]).length, 0);
});

test("P36-GA3: Affiliate link click fires affiliate_click once and does NOT double-fire outbound_click", () => {
  const { ctx, docListeners } = makeBrowser({ pathname: "/gaming-gear/" });
  const link = {
    href: "https://www.amazon.com/dp/B0FY6X2XXY?tag=gta6heistguid-20",
    getAttribute(k) {
      const m = {
        href: "https://www.amazon.com/dp/B0FY6X2XXY?tag=gta6heistguid-20",
        "data-aff-partner": "amazon",
        "data-aff-product": "dualsenseWhite",
        "data-aff-placement": "gear-hub",
      };
      return m[k] || null;
    },
    closest(sel) { return sel.includes("a") || sel.includes("data-aff-partner") ? this : null; },
    matches() { return false; },
  };
  for (const fn of docListeners.get("click") || []) fn({ target: link });
  const events = ctx.GTA6Track.getEvents();
  const affEvents = events.filter((e) => e.event === "affiliate_click");
  const outEvents = events.filter((e) => e.event === "outbound_click");
  assert.equal(affEvents.length, 1);
  assert.equal(outEvents.length, 0);
  assert.equal(affEvents[0].params.merchant, "amazon");
  assert.equal(affEvents[0].params.product_id, "dualsenseWhite");
  assert.equal(affEvents[0].params.source_page, "/gaming-gear/");
  assert.ok(affEvents[0].params.event_timestamp);
});

test("P36-GA4: Non-affiliate external link fires outbound_click once; PII keys are stripped from all events", () => {
  const { ctx, docListeners } = makeBrowser({ pathname: "/port-gellhorn" });
  const extLink = {
    href: "https://www.rockstargames.com/VI",
    getAttribute(k) { return k === "href" ? "https://www.rockstargames.com/VI" : null; },
    closest(sel) { return sel.includes("a[href]") ? this : null; },
    matches() { return false; },
  };
  for (const fn of docListeners.get("click") || []) fn({ target: extLink });
  const outEvents = ctx.GTA6Track.getEvents().filter((e) => e.event === "outbound_click");
  assert.equal(outEvents.length, 1);
  assert.equal(outEvents[0].params.destination_host, "www.rockstargames.com");

  ctx.GTA6Track("search_interaction", {
    search_surface: "map_search",
    email: "user@example.com",
    token: "abc",
    query: "private text",
    phone: "555-1234",
  });
  const searchEvt = ctx.GTA6Track.getEvents().find((e) => e.event === "search_interaction");
  assert.ok(searchEvt);
  assert.equal(searchEvt.params.search_surface, "map_search");
  assert.equal("email" in searchEvt.params, false);
  assert.equal("token" in searchEvt.params, false);
  assert.equal("query" in searchEvt.params, false);
  assert.equal("phone" in searchEvt.params, false);
});

test("P36-DASH1: getAffiliateClickReport returns 7d/30d, byPage, byProduct, byPlacement, daily/weekly trends, and unconfirmed revenue separation", async () => {
  const rows = [
    { id: 1, partner: "amazon", placement: "gear-hub:dualsenseWhite", page_path: "/gaming-gear/", target_url: "https://www.amazon.com/dp/B0FY6X2XXY?tag=gta6heistguid-20", created_at: "2026-11-25 10:00:00" },
    { id: 2, partner: "amazon", placement: "http_smoke", page_path: "/", target_url: "https://www.amazon.com/dp/B0FY6X2XXY?tag=gta6heistguid-20", created_at: "2026-11-25 11:00:00" },
    { id: 3, partner: "gumroad", placement: "live-toolkit-cutflow", page_path: "/live", target_url: "https://apexlocallabs.gumroad.com/l/cutflow-pro", created_at: "2026-11-24 12:00:00" },
  ];
  const mockDb = {
    prepare(sql) {
      return {
        async run() { return { success: true }; },
        async all() {
          if (/GROUP BY partner ORDER BY clicks DESC/i.test(sql)) return { results: [{ partner: "amazon", clicks: 2 }, { partner: "gumroad", clicks: 1 }] };
          if (/clicks_7d/i.test(sql)) return { results: [{ partner: "amazon", clicks_7d: 2 }, { partner: "gumroad", clicks_7d: 1 }] };
          if (/clicks_30d/i.test(sql)) return { results: [{ partner: "amazon", clicks_30d: 2 }, { partner: "gumroad", clicks_30d: 1 }] };
          if (/GROUP BY page_path/i.test(sql)) return { results: [{ page_path: "/gaming-gear/", clicks: 1 }, { page_path: "/", clicks: 1 }, { page_path: "/live", clicks: 1 }] };
          if (/GROUP BY placement ORDER BY/i.test(sql)) return { results: [{ placement: "gear-hub:dualsenseWhite", clicks: 1 }, { placement: "http_smoke", clicks: 1 }, { placement: "live-toolkit-cutflow", clicks: 1 }] };
          if (/GROUP BY partner, placement, target_url/i.test(sql)) return { results: rows.map((r) => ({ ...r, clicks: 1 })) };
          if (/AS day/i.test(sql)) return { results: [{ day: "2026-11-24", clicks: 1 }, { day: "2026-11-25", clicks: 2 }] };
          if (/AS week/i.test(sql)) return { results: [{ week: "2026-W47", clicks: 3 }] };
          if (/ORDER BY id DESC LIMIT 20/i.test(sql)) return { results: [...rows].reverse() };
          return { results: [] };
        },
      };
    },
  };

  const report = await getAffiliateClickReport(mockDb);
  assert.equal(report.totalClicks, 3);
  assert.equal(report.totalClicks7d, 3);
  assert.equal(report.totalClicks30d, 3);
  assert.equal(report.byPage.length, 3);
  assert.equal(report.byProduct.length, 3);
  assert.equal(report.byPlacement.length, 3);
  assert.equal(report.dailyTrend.length, 2);
  assert.equal(report.weeklyTrend.length, 1);
  assert.equal(report.revenueSummary.actualClicks, 3);
  assert.equal(report.revenueSummary.qaProbeClicks, 1);
  assert.equal(report.revenueSummary.organicClicksExcludingProbes, 2);
  assert.equal(report.revenueSummary.confirmedPurchases, null);
  assert.equal(report.revenueSummary.confirmedCommissionsUsd, null);
  assert.equal(report.revenueSummary.estimatedRevenueUsd, null);
});
