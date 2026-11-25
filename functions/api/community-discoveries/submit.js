import {
  CATEGORIES, REGIONS, PLATFORMS, json, nowIso, guardSameOriginJson, readJsonLimited, cleanText, safeUrl,
  containsDangerousMarkup, normalizeUrlForHash, domainOf, sha256Hex, newRef, ipHash, hashSaltConfigured,
  tokens, jaccard, rlCount, rlHit, rlPrune, turnstileConfigured, verifyTurnstile,
} from "../../_lib/cd.js";

const LIMITS = {
  attemptsPerHour: 15,
  successPerHour: 3,
  successPerDay: 8,
  globalPerDay: 300,
};

const NAME_RE = /^[A-Za-z0-9][A-Za-z0-9 _.\-]{1,29}$/;
const EMAIL_RE = /^[^\s@<>"',;]+@[^\s@<>"',;]+\.[A-Za-z]{2,}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function len(s, min, max, label, errors) {
  if (s.length < min) errors[label] = `Must be at least ${min} characters.`;
  else if (s.length > max) errors[label] = `Must be at most ${max} characters.`;
}

/** Pure validator (exported for tests). Returns { errors, value }. */
export function validateSubmission(b, today = new Date()) {
  const errors = {};
  const v = {};

  // 1. Required: Discovery title (5-120 chars)
  v.title = cleanText(b.title);
  len(v.title, 5, 120, "title", errors);

  // 2. Required: Category (allowlisted enum)
  v.category = typeof b.category === "string" ? b.category : "";
  if (!Object.hasOwn(CATEGORIES, v.category)) errors.category = "Choose a valid category.";

  // 3. Required: Combined discovery description (20-4000 chars)
  // Accepts `description` (new quick form) or `detailed_explanation` (legacy/API clients).
  const rawDesc = b.description !== undefined && b.description !== null && String(b.description).trim() !== ""
    ? b.description
    : b.detailed_explanation;
  v.detailed_explanation = cleanText(rawDesc, { multiline: true });
  len(v.detailed_explanation, 20, 4000, "description", errors);

  // Optional: short_description (never fabricated; stored as "" when omitted)
  v.short_description = cleanText(b.short_description || "");
  if (v.short_description.length > 280) errors.short_description = "Must be at most 280 characters.";

  // Optional: region (never fabricated; stored as "" when omitted)
  v.region = typeof b.region === "string" ? b.region.trim() : "";
  if (v.region && !REGIONS.includes(v.region)) errors.region = "Choose a valid region.";

  // Optional: location_description & directions (never fabricated; stored as "" when omitted)
  v.location_description = cleanText(b.location_description || "", { multiline: true });
  if (v.location_description.length > 600) errors.location_description = "Must be at most 600 characters.";
  v.directions = cleanText(b.directions || "", { multiline: true });
  if (v.directions.length > 2000) errors.directions = "Must be at most 2000 characters.";

  // Optional: platform (never fabricated; stored as "" when omitted)
  v.platform = typeof b.platform === "string" ? b.platform.trim() : "";
  if (v.platform && !Object.hasOwn(PLATFORMS, v.platform)) errors.platform = "Choose PS5 or Xbox Series X|S.";

  // Optional: game_version (nullable in D1)
  v.game_version = cleanText(b.game_version || "");
  if (v.game_version.length > 40) errors.game_version = "Must be at most 40 characters.";

  // Optional: discovered_on (never fabricated; stored as "" when omitted)
  v.discovered_on = typeof b.discovered_on === "string" ? b.discovered_on.trim() : "";
  if (v.discovered_on) {
    if (!DATE_RE.test(v.discovered_on) || Number.isNaN(Date.parse(v.discovered_on))) {
      errors.discovered_on = "Enter a valid date.";
    } else {
      const t = Date.parse(v.discovered_on);
      if (t > today.getTime() + 86400000) errors.discovered_on = "Date cannot be in the future.";
      if (t < Date.parse("2024-01-01")) errors.discovered_on = "Date is too far in the past.";
    }
  }

  // Optional: personally witnessed (-1 = not specified, 1 = yes, 0 = no)
  const rawWit = typeof b.witnessed === "string" ? b.witnessed.trim() : "";
  if (rawWit === "") {
    v.witnessed = -1;
  } else if (rawWit === "yes") {
    v.witnessed = 1;
  } else if (rawWit === "no") {
    v.witnessed = 0;
  } else {
    errors.witnessed = "Choose yes, no, or leave blank.";
    v.witnessed = -1;
  }

  // Optional: supporting evidence & sources text (never fabricated)
  v.evidence_description = cleanText(b.evidence_description || "", { multiline: true });
  if (v.evidence_description.length > 2000) errors.evidence_description = "Must be at most 2000 characters.";
  v.sources_text = cleanText(b.sources_text || "", { multiline: true });
  if (v.sources_text.length > 1000) errors.sources_text = "Must be at most 1000 characters.";

  // Reference URLs (external, https only, never fetched or hotlinked by the server)
  v.screenshot_url = null;
  v.video_url = null;
  v.source_urls = [];
  if (b.screenshot_url) {
    v.screenshot_url = safeUrl(String(b.screenshot_url));
    if (!v.screenshot_url) errors.screenshot_url = "Enter a valid https:// link.";
  }
  if (b.video_url) {
    v.video_url = safeUrl(String(b.video_url));
    if (!v.video_url) errors.video_url = "Enter a valid https:// link.";
  }
  if (b.source_urls !== undefined && b.source_urls !== null) {
    if (!Array.isArray(b.source_urls) || b.source_urls.length > 5) errors.source_urls = "At most 5 source links.";
    else {
      for (const raw of b.source_urls) {
        const u = safeUrl(String(raw));
        if (!u) { errors.source_urls = "One or more source links are not valid https:// links."; break; }
        v.source_urls.push(u);
      }
    }
  }
  // Conditional evidence rule: if contributor explicitly says they did NOT witness it, require a source.
  if (v.witnessed === 0 && !v.sources_text && v.source_urls.length === 0) {
    errors.sources_text = "If you did not witness this yourself, tell us where the information came from.";
  }

  // Optional coordinates (existing map uses xPct / yPct in 0..1)
  v.coord_xpct = null;
  v.coord_ypct = null;
  const hasX = b.coord_xpct !== undefined && b.coord_xpct !== null && b.coord_xpct !== "";
  const hasY = b.coord_ypct !== undefined && b.coord_ypct !== null && b.coord_ypct !== "";
  if (hasX || hasY) {
    const x = Number(b.coord_xpct), y = Number(b.coord_ypct);
    if (!hasX || !hasY || !Number.isFinite(x) || !Number.isFinite(y) || x < 0 || x > 1 || y < 0 || y > 1) {
      errors.coords = "Provide both coordinates as numbers between 0 and 1.";
    } else { v.coord_xpct = Math.round(x * 10000) / 10000; v.coord_ypct = Math.round(y * 10000) / 10000; }
  }

  // Optional identity
  v.display_name = cleanText(b.display_name || "");
  if (v.display_name && !NAME_RE.test(v.display_name)) errors.display_name = "2-30 letters, numbers, spaces, . _ - only.";
  v.credit_pref = b.credit_pref === "named" && v.display_name ? "named" : "anonymous";
  v.contact_email = cleanText(b.contact_email || "").toLowerCase();
  if (v.contact_email && (v.contact_email.length > 120 || !EMAIL_RE.test(v.contact_email))) errors.contact_email = "Enter a valid email or leave blank.";

  // 4. Required: Combined originality + limited review/display permission acknowledgment
  // Accepts `permission_ack === true` (quick form) or both `originality_ack === true && license_ack === true` (legacy).
  const permOk = b.permission_ack === true || (b.originality_ack === true && b.license_ack === true);
  if (!permOk) {
    errors.permission_ack = "Please confirm originality/authorization and grant limited review and display permission.";
  }
  v.originality_ack = permOk ? 1 : 0;
  v.license_ack = permOk ? 1 : 0;

  // Conditional rights rule: external screenshot/video links require media rights confirmation.
  v.image_rights_ack = b.image_rights_ack === true ? 1 : 0;
  if ((v.screenshot_url || v.video_url) && !v.image_rights_ack) {
    errors.image_rights_ack = "Confirm you captured the referenced media or have permission to share it.";
  }

  // Script / dangerous HTML rejection across all free-text fields
  const markupChecks = [
    ["title", v.title],
    ["short_description", v.short_description],
    ["description", v.detailed_explanation],
    ["location_description", v.location_description],
    ["directions", v.directions],
    ["game_version", v.game_version],
    ["evidence_description", v.evidence_description],
    ["sources_text", v.sources_text],
  ];
  for (const [fieldName, fieldVal] of markupChecks) {
    if (containsDangerousMarkup(fieldVal)) {
      errors[fieldName] = "HTML tags, scripts, and executable markup are not allowed.";
    }
  }

  // Link-spam heuristic on free text
  const free = [v.title, v.short_description, v.detailed_explanation, v.location_description, v.directions, v.evidence_description].join("\n");
  if ((free.match(/https?:\/\/|www\./gi) || []).length > 3) errors.description = errors.description || "Too many links in the text; put links in the reference fields.";

  // Flag for moderator review when firsthand observation and corroborating sources/media are absent.
  v.evidence_needs_review = v.witnessed !== 1 && !v.sources_text && v.source_urls.length === 0 && !v.screenshot_url && !v.video_url;

  return { errors, value: v };
}

export async function onRequestPost({ request, env }) {
  const bad = guardSameOriginJson(request);
  if (bad) return bad;
  // Fail closed until DB, Turnstile bot protection, and a 32+ char hash salt are all configured.
  if (!env.DB || !turnstileConfigured(env) || !hashSaltConfigured(env)) {
    return json({ ok: false, error: "Submissions are temporarily unavailable." }, 503);
  }

  const hash = await ipHash(request, env);
  try {
    if (Math.random() < 0.02) await rlPrune(env.DB);
    const attempts = await rlHit(env.DB, `att:${hash}`, 3600);
    if (attempts > LIMITS.attemptsPerHour) return json({ ok: false, error: "Too many requests. Please try again later." }, 429, { "Retry-After": "3600" });

    const { body, error } = await readJsonLimited(request);
    if (error) return error;

    // Honeypot: pretend success so bots learn nothing.
    if (typeof body.website === "string" && body.website.trim() !== "") {
      return json({ ok: true, ref: "CD-00000-00000", message: "Submission received." }, 201);
    }

    if (!(await verifyTurnstile(env, body.turnstile_token, request))) {
      return json({ ok: false, error: "Human verification failed. Please retry.", code: "turnstile" }, 400);
    }

    const { errors, value: v } = validateSubmission(body);
    if (Object.keys(errors).length) return json({ ok: false, error: "Please correct the highlighted fields.", fields: errors }, 400);

    if ((await rlCount(env.DB, `ok:${hash}`, 3600)) >= LIMITS.successPerHour || (await rlCount(env.DB, `okd:${hash}`, 86400)) >= LIMITS.successPerDay) {
      return json({ ok: false, error: "Submission limit reached. Please try again later." }, 429, { "Retry-After": "3600" });
    }
    if ((await rlCount(env.DB, "okd:global", 86400)) >= LIMITS.globalPerDay) {
      return json({ ok: false, error: "We are receiving a high volume of submissions. Please try again later." }, 429);
    }

    const contentHash = await sha256Hex([v.category, v.title.toLowerCase(), v.detailed_explanation.toLowerCase()].join("|"));
    const dup = await env.DB.prepare("SELECT id FROM cd_submissions WHERE content_hash = ?1 LIMIT 1").bind(contentHash).first();
    if (dup) return json({ ok: false, error: "A matching submission has already been received. Thank you!", code: "duplicate" }, 409);

    const now = nowIso();
    const ref = newRef();
    const ins = await env.DB.prepare(
      `INSERT INTO cd_submissions (ref, created_at, updated_at, category, title, short_description, detailed_explanation, region,
        location_description, directions, platform, game_version, discovered_on, witnessed, evidence_description, sources_text,
        coord_xpct, coord_ypct, display_name, credit_pref, contact_email, originality_ack, license_ack, image_rights_ack,
        content_hash, ip_hash)
       VALUES (?1,?2,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13,?14,?15,?16,?17,?18,?19,?20,?21,?22,?23,?24,?25) RETURNING id`
    ).bind(
      ref, now, v.category, v.title, v.short_description, v.detailed_explanation, v.region, v.location_description, v.directions,
      v.platform, v.game_version || null, v.discovered_on, v.witnessed, v.evidence_description, v.sources_text || null,
      v.coord_xpct, v.coord_ypct, v.display_name || null, v.credit_pref, v.contact_email || null, 1, 1, v.image_rights_ack,
      contentHash, hash
    ).first();
    const id = ins.id;

    const stmts = [];
    if (v.screenshot_url) stmts.push(env.DB.prepare("INSERT INTO cd_evidence (submission_id, kind, url, domain, created_at) VALUES (?1,'screenshot_url',?2,?3,?4)").bind(id, v.screenshot_url, domainOf(v.screenshot_url), now));
    if (v.video_url) stmts.push(env.DB.prepare("INSERT INTO cd_evidence (submission_id, kind, url, domain, created_at) VALUES (?1,'video_url',?2,?3,?4)").bind(id, v.video_url, domainOf(v.video_url), now));
    const srcHashes = new Set();
    for (const u of [...v.source_urls, ...(v.video_url ? [v.video_url] : [])]) {
      const h = await sha256Hex(normalizeUrlForHash(u));
      if (srcHashes.has(h)) continue;
      srcHashes.add(h);
      stmts.push(env.DB.prepare("INSERT INTO cd_sources (submission_id, url, url_hash, domain, created_at) VALUES (?1,?2,?3,?4,?5)").bind(id, u, h, domainOf(u), now));
    }

    // Duplicate / provenance WARNINGS (never treated as corroboration)
    const mine = tokens(`${v.title} ${v.short_description || v.detailed_explanation.slice(0, 280)}`);
    const { results: cands } = await env.DB.prepare(
      "SELECT id, title, short_description, detailed_explanation, region, coord_xpct, coord_ypct FROM cd_submissions WHERE category = ?1 AND id != ?2 ORDER BY id DESC LIMIT 400"
    ).bind(v.category, id).all();
    for (const c of cands || []) {
      const score = jaccard(mine, tokens(`${c.title} ${c.short_description || String(c.detailed_explanation || "").slice(0, 280)}`));
      if (score >= 0.5) {
        stmts.push(env.DB.prepare("INSERT INTO cd_relations (submission_id, related_id, kind, score, created_by, created_at) VALUES (?1,?2,'possible_duplicate',?3,'system',?4)").bind(id, c.id, Math.round(score * 100) / 100, now));
      } else if (v.coord_xpct !== null && c.coord_xpct !== null && Math.hypot(v.coord_xpct - c.coord_xpct, v.coord_ypct - c.coord_ypct) < 0.01) {
        stmts.push(env.DB.prepare("INSERT INTO cd_relations (submission_id, related_id, kind, score, created_by, created_at) VALUES (?1,?2,'nearby',?3,'system',?4)").bind(id, c.id, null, now));
      }
    }
    for (const h of srcHashes) {
      const { results: shared } = await env.DB.prepare("SELECT DISTINCT submission_id FROM cd_sources WHERE url_hash = ?1 AND submission_id != ?2 LIMIT 20").bind(h, id).all();
      for (const s of shared || []) {
        stmts.push(env.DB.prepare("INSERT INTO cd_relations (submission_id, related_id, kind, score, created_by, created_at) VALUES (?1,?2,'shared_source',NULL,'system',?3)").bind(id, s.submission_id, now));
      }
    }
    stmts.push(env.DB.prepare("INSERT INTO cd_audit (at, actor, action, submission_id, after_json) VALUES (?1,'public','submission_received',?2,?3)").bind(now, id, JSON.stringify({ ref, category: v.category, evidence_needs_review: v.evidence_needs_review })));
    await env.DB.batch(stmts);

    await rlHit(env.DB, `ok:${hash}`, 3600);
    await rlHit(env.DB, `okd:${hash}`, 86400);
    await rlHit(env.DB, "okd:global", 86400);

    return json({
      ok: true,
      ref,
      message: "Submission received. It has not been approved yet and will be reviewed. Approval as a community report does not mean independent verification.",
    }, 201);
  } catch (err) {
    console.error("cd submit error", err && err.message);
    return json({ ok: false, error: "Could not save your submission. Please try again later." }, 500);
  }
}

export async function onRequest({ request }) {
  // Any non-POST method (GET, PUT, DELETE, OPTIONS...) is refused. No CORS headers are emitted.
  return json({ ok: false, error: "Method not allowed." }, 405, { Allow: "POST" });
}
