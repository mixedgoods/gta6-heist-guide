import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import { onRequestPost as clicksPost } from "../functions/api/clicks.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const SITE_CONFIG_SRC = fs.readFileSync(path.join(ROOT, "public", "site-config.js"), "utf8");
const AFFILIATES_SRC = fs.readFileSync(path.join(ROOT, "public", "js", "affiliates.js"), "utf8");
const MAIN_SRC = fs.readFileSync(path.join(ROOT, "public", "assets", "main.js"), "utf8");

function createMockD1() {
  const rows = [];
  return {
    rows,
    prepare(sql) {
      let bound = [];
      return {
        bind(...args) {
          bound = args;
          return this;
        },
        async run() {
          if (/INSERT INTO affiliate_clicks/i.test(sql)) {
            rows.push({
              id: rows.length + 1,
              partner: bound[0],
              placement: bound[1],
              page_path: bound[2],
              target_url: bound[3],
            });
          }
          return { success: true };
        },
      };
    },
  };
}

function createLink(attrs = {}) {
  const map = Object.assign({}, attrs);
  return {
    href: map.href || "",
    getAttribute(name) {
      return Object.prototype.hasOwnProperty.call(map, name) ? map[name] : null;
    },
    setAttribute(name, val) {
      map[name] = String(val);
      if (name === "href") this.href = String(val);
    },
    hasAttribute(name) {
      return Object.prototype.hasOwnProperty.call(map, name);
    },
    closest(selector) {
      const parts = selector.split(",").map((s) => s.trim());
      for (const p of parts) {
        if (p === "a[href]" && map.href) return this;
        if (p === "[data-aff-partner]" && map["data-aff-partner"]) return this;
        if (p === "a[data-aff-partner]" && map["data-aff-partner"]) return this;
        if (p === 'a[href*="amazon.com"]' && String(map.href || "").includes("amazon.com")) return this;
        if (p === 'a[href*="amzn.to"]' && String(map.href || "").includes("amzn.to")) return this;
      }
      return null;
    },
  };
}

function createBrowserSandbox({
  pathname = "/",
  readyState = "loading",
  enableTracking = true,
  useSendBeacon = true,
} = {}) {
  const docListeners = new Map();
  const trackEvents = [];
  const beacons = [];
  const fetches = [];
  const storage = new Map();
  const pendingTimers = [];

  const document = {
    readyState,
    head: { appendChild() {} },
    body: { classList: { add() {}, remove() {}, toggle() {} }, appendChild() {} },
    documentElement: { classList: { add() {}, remove() {} } },
    addEventListener(type, fn) {
      if (!docListeners.has(type)) docListeners.set(type, []);
      docListeners.get(type).push(fn);
    },
    querySelector() { return null; },
    querySelectorAll() { return []; },
    getElementById() { return null; },
    createElement() {
      return {
        setAttribute() {},
        appendChild() {},
        classList: { add() {}, remove() {} },
        style: {},
      };
    },
  };

  const localStorage = {
    getItem(k) { return storage.has(k) ? storage.get(k) : null; },
    setItem(k, v) { storage.set(k, String(v)); },
    removeItem(k) { storage.delete(k); },
  };

  class MockBlob {
    constructor(parts, opts = {}) {
      this._text = parts.join("");
      this.type = opts.type || "";
    }
    text() { return Promise.resolve(this._text); }
  }

  const navigatorObj = {
    userAgent: "TestAgent",
    clipboard: {},
  };
  if (useSendBeacon) {
    navigatorObj.sendBeacon = (url, blob) => {
      beacons.push({ url, raw: blob && blob._text ? blob._text : String(blob) });
      return true;
    };
  }

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
    Blob: MockBlob,
    document,
    localStorage,
    sessionStorage: localStorage,
    navigator: navigatorObj,
    location: { pathname, origin: "https://www.gta6heistguide.com", href: "https://www.gta6heistguide.com" + pathname, search: "", hash: "" },
    addEventListener() {},
    removeEventListener() {},
    matchMedia: () => ({ matches: false, addEventListener() {} }),
    requestAnimationFrame: (cb) => cb(),
    setTimeout(fn) {
      pendingTimers.push(fn);
      return pendingTimers.length;
    },
    clearTimeout() {},
    setInterval() { return 0; },
    clearInterval() {},
    fetch(url, opts = {}) {
      fetches.push({ url, method: opts.method || "GET", body: opts.body || "" });
      return Promise.resolve({ ok: true, json: async () => ({ ok: true }) });
    },
  };
  sandbox.window = sandbox;
  sandbox.self = sandbox;
  sandbox.globalThis = sandbox;

  const ctx = vm.createContext(sandbox);

  function loadSiteConfig() {
    vm.runInContext(SITE_CONFIG_SRC, ctx, { filename: "site-config.js" });
    if (enableTracking === false) {
      ctx.SITE_CONFIG = Object.freeze(Object.assign({}, ctx.SITE_CONFIG, { enableAffiliateClickTracking: false }));
    }
    const origTrack = ctx.GTA6Track;
    ctx.GTA6Track = (name, params) => {
      trackEvents.push({ name, params });
      return origTrack ? origTrack(name, params) : undefined;
    };
  }

  function loadAffiliates() {
    vm.runInContext(AFFILIATES_SRC, ctx, { filename: "affiliates.js" });
  }

  function loadMain() {
    vm.runInContext(MAIN_SRC, ctx, { filename: "main.js" });
  }

  function fireDomContentLoaded() {
    document.readyState = "interactive";
    for (const fn of docListeners.get("DOMContentLoaded") || []) {
      try { fn(); } catch (_) {}
    }
    flushTimers();
  }

  function flushTimers() {
    while (pendingTimers.length > 0) {
      const fn = pendingTimers.shift();
      try { fn(); } catch (_) {}
    }
  }

  function clickLink(link) {
    const evt = { target: link };
    for (const fn of docListeners.get("click") || []) {
      fn(evt);
    }
  }

  async function replayBeaconsToD1(db) {
    const posts = [
      ...beacons.map((b) => ({ url: b.url, body: b.raw })),
      ...fetches.filter((f) => f.url === "/api/clicks" && f.method === "POST").map((f) => ({ url: f.url, body: f.body })),
    ];
    for (const p of posts) {
      if (p.url !== "/api/clicks") continue;
      const req = new Request("https://www.gta6heistguide.com/api/clicks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: p.body,
      });
      const res = await clicksPost({ request: req, env: { DB: db } });
      assert.equal(res.status, 200);
    }
    return posts;
  }

  return {
    ctx,
    docListeners,
    trackEvents,
    beacons,
    fetches,
    loadSiteConfig,
    loadAffiliates,
    loadMain,
    fireDomContentLoaded,
    flushTimers,
    clickLink,
    replayBeaconsToD1,
  };
}

test("A1: Page loads affiliates.js then site-config.js then main.js (production order) => exactly 1 track, 1 POST, 1 D1 row", async () => {
  const sb = createBrowserSandbox({ pathname: "/" });
  sb.loadAffiliates();
  sb.loadSiteConfig();
  sb.loadMain();
  sb.fireDomContentLoaded();

  const link = createLink({
    href: "https://www.amazon.com/dp/B0FY6X2XXY?tag=gta6heistguid-20",
    "data-aff-partner": "amazon",
    "data-aff-product": "dualsenseWhite",
    "data-aff-placement": "home-setup-picks",
  });
  sb.clickLink(link);

  const db = createMockD1();
  const posts = await sb.replayBeaconsToD1(db);

  assert.equal(sb.ctx._gta6MainAffTrackingBound, true, "main.js tracker should be marked bound");
  assert.equal(Boolean(sb.ctx._gta6AffClickBound), false, "affiliates.js must not bind a duplicate click listener");
  assert.equal(sb.trackEvents.filter((e) => e.name === "affiliate_click").length, 1);
  assert.equal(posts.length, 1);
  assert.equal(db.rows.length, 1);
  assert.equal(db.rows[0].partner, "amazon");
  assert.equal(db.rows[0].page_path, "/");
});

test("A2: Page loads main.js before affiliates.js => still exactly 1 track, 1 POST, 1 D1 row", async () => {
  const sb = createBrowserSandbox({ pathname: "/vehicles" });
  sb.loadSiteConfig();
  sb.loadMain();
  sb.loadAffiliates();
  sb.fireDomContentLoaded();

  const link = createLink({
    href: "https://www.amazon.com/dp/B0CHGT1KFJ?tag=gta6heistguid-20",
    "data-aff-partner": "amazon",
    "data-aff-product": "samsung990Pro4tb",
    "data-aff-placement": "vehicles-inline",
  });
  sb.clickLink(link);

  const db = createMockD1();
  const posts = await sb.replayBeaconsToD1(db);

  assert.equal(sb.ctx._gta6MainAffTrackingBound, true);
  assert.equal(Boolean(sb.ctx._gta6AffClickBound), false);
  assert.equal(sb.trackEvents.filter((e) => e.name === "affiliate_click").length, 1);
  assert.equal(posts.length, 1);
  assert.equal(db.rows.length, 1);
});

test("A3: GTA6.initAffiliateTracking exists as a function but is NEVER called => affiliates.js fallback activates once", async () => {
  const sb = createBrowserSandbox({ pathname: "/custom-page" });
  sb.loadSiteConfig();
  sb.ctx.GTA6 = {
    initAffiliateTracking() {
      // Never called in this test
    },
  };
  sb.loadAffiliates();
  sb.fireDomContentLoaded();

  const link = createLink({
    href: "https://www.amazon.com/dp/B00001P4ZH?tag=gta6heistguid-20",
    "data-aff-partner": "amazon",
    "data-aff-product": "kossPortaPro",
    "data-aff-placement": "custom-slot",
  });
  sb.clickLink(link);

  assert.equal(sb.ctx._gta6AffClickBound, true, "affiliates.js fallback should bind when main.js never initialized");
  assert.equal(sb.trackEvents.filter((e) => e.name === "affiliate_click").length, 1);
  assert.equal(sb.beacons.length, 1);
});

test("B: Page loads affiliates.js only (/gaming-gear/) => exactly 1 track, 1 POST, 1 D1 row", async () => {
  const sb = createBrowserSandbox({ pathname: "/gaming-gear/" });
  sb.loadSiteConfig();
  sb.loadAffiliates();
  sb.fireDomContentLoaded();

  const link = createLink({
    href: "https://www.amazon.com/dp/B0FY6X2XXY?tag=gta6heistguid-20",
    "data-aff-partner": "amazon",
    "data-aff-product": "dualsenseWhite",
    "data-aff-placement": "gear-hub-controllers",
  });
  sb.clickLink(link);

  const db = createMockD1();
  const posts = await sb.replayBeaconsToD1(db);

  assert.equal(sb.ctx._gta6AffClickBound, true);
  assert.equal(Boolean(sb.ctx._gta6MainAffTrackingBound), false);
  assert.equal(sb.trackEvents.filter((e) => e.name === "affiliate_click").length, 1);
  assert.equal(posts.length, 1);
  assert.equal(db.rows.length, 1);
  assert.equal(db.rows[0].page_path, "/gaming-gear/");
  assert.equal(db.rows[0].placement, "gear-hub-controllers:dualsenseWhite");
});

test("C: Page loads main.js only => exactly 1 track, 1 POST", async () => {
  const sb = createBrowserSandbox({ pathname: "/port-gellhorn" });
  sb.loadSiteConfig();
  sb.loadMain();
  sb.fireDomContentLoaded();

  const link = createLink({
    href: "https://www.amazon.com/dp/B09B1XX1PN?tag=gta6heistguid-20",
    "data-aff-partner": "amazon",
    "data-aff-placement": "port-gellhorn-card",
  });
  sb.clickLink(link);

  assert.equal(sb.trackEvents.filter((e) => e.name === "affiliate_click").length, 1);
  assert.equal(sb.beacons.length, 1);
});

test("D: Tracking disabled (SITE_CONFIG.enableAffiliateClickTracking === false) => 0 events, 0 POSTs (both scripts & affiliates-only)", async () => {
  // Both scripts
  const sbBoth = createBrowserSandbox({ pathname: "/", enableTracking: false });
  sbBoth.loadAffiliates();
  sbBoth.loadSiteConfig();
  sbBoth.loadMain();
  sbBoth.fireDomContentLoaded();
  assert.equal(Boolean(sbBoth.ctx._gta6AffClickBound), false, "affiliates.js must not bind listener when disabled");
  sbBoth.clickLink(createLink({
    href: "https://www.amazon.com/dp/B0FY6X2XXY?tag=gta6heistguid-20",
    "data-aff-partner": "amazon",
  }));
  assert.equal(sbBoth.trackEvents.filter((e) => e.name === "affiliate_click").length, 0);
  assert.equal(sbBoth.beacons.length, 0);
  assert.equal(sbBoth.fetches.filter((f) => f.url === "/api/clicks").length, 0);

  // affiliates.js only
  const sbAff = createBrowserSandbox({ pathname: "/gaming-gear/", enableTracking: false });
  sbAff.loadSiteConfig();
  sbAff.loadAffiliates();
  sbAff.fireDomContentLoaded();
  assert.equal(Boolean(sbAff.ctx._gta6AffClickBound), false, "Should not register listener when tracking is disabled");
  sbAff.clickLink(createLink({
    href: "https://www.amazon.com/dp/B0FY6X2XXY?tag=gta6heistguid-20",
    "data-aff-partner": "amazon",
  }));
  assert.equal(sbAff.trackEvents.filter((e) => e.name === "affiliate_click").length, 0);
  assert.equal(sbAff.beacons.length, 0);
});

test("E: Different affiliate merchants (Amazon + future merchants via data-aff-partner)", async () => {
  const sb = createBrowserSandbox({ pathname: "/gaming-gear/" });
  sb.loadSiteConfig();
  sb.loadAffiliates();
  sb.fireDomContentLoaded();

  sb.clickLink(createLink({
    href: "https://www.amazon.com/dp/B000AJIF4E?tag=gta6heistguid-20",
    "data-aff-partner": "amazon",
    "data-aff-product": "sonyMdr7506",
    "data-aff-placement": "gear-hub-headsets",
  }));
  sb.clickLink(createLink({
    href: "https://www.exitlag.com/refer/10386953",
    "data-aff-partner": "exitlag",
    "data-aff-product": "exitlag-routing",
    "data-aff-placement": "network-guide",
  }));
  sb.clickLink(createLink({
    href: "https://www.logitechg.com/en-us/example",
    "data-aff-partner": "logitech",
    "data-aff-product": "g-pro-x",
    "data-aff-placement": "future-partner-slot",
  }));

  assert.equal(sb.beacons.length, 3);
  const payloads = sb.beacons.map((b) => JSON.parse(b.raw));
  assert.deepEqual(payloads.map((p) => p.partner), ["amazon", "exitlag", "logitech"]);
  for (const p of payloads) {
    assert.deepEqual(Object.keys(p).sort(), ["page_path", "partner", "placement", "target_url"], "Only anonymous fields permitted");
  }
});

test("F: Multiple clicks & idempotent re-initialization => each click counted once, zero duplicate listeners", async () => {
  const sb = createBrowserSandbox({ pathname: "/" });
  sb.loadAffiliates();
  sb.loadSiteConfig();
  sb.loadMain();
  sb.fireDomContentLoaded();
  const listenersAfterInit = (sb.docListeners.get("click") || []).length;
  // Simulate repeated initialization attempts
  sb.ctx.GTA6.initAffiliateTracking();
  sb.ctx.GTA6.initAffiliateTracking();
  assert.equal((sb.docListeners.get("click") || []).length, listenersAfterInit, "Repeated init must not add duplicate listeners");

  const link = createLink({
    href: "https://www.amazon.com/dp/B0F1HX3WXX?tag=gta6heistguid-20",
    "data-aff-partner": "amazon",
    "data-aff-placement": "home-setup-picks",
  });
  sb.clickLink(link);
  sb.clickLink(link);
  sb.clickLink(link);

  assert.equal(sb.trackEvents.filter((e) => e.name === "affiliate_click").length, 3);
  assert.equal(sb.beacons.length, 3);
});
