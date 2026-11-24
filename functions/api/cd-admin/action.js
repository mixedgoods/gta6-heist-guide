import {
  json, STATUSES, PUBLISHABLE, REGIONS, REF_RE, nowIso, readJsonLimited, cleanText, safeUrl,
} from "../../_lib/cd.js";

const MAP_W = 3840, MAP_H = 5120;
const NEARBY_DIST = 0.006; // in xPct/yPct units
const PIN_CATEGORIES = { "live-discovery": "Live Discoveries", "easter-egg": "Easter Eggs" };
const LINK_KINDS = ["independent_confirmation", "same_origin", "confirmed_duplicate"];

const fail = (error, status = 400) => json({ ok: false, error }, status);

export async function onRequestPost(context) {
  const { request, env, data } = context;
  const admin = data?.admin?.email;
  if (!admin) return fail("Unauthorized.", 401); // defense in depth: middleware must have set this

  const { body, error } = await readJsonLimited(request, 16 * 1024);
  if (error) return error;
  const ref = body.ref;
  if (typeof ref !== "string" || !REF_RE.test(ref)) return fail("Invalid reference.");
  const sub = await env.DB.prepare("SELECT * FROM cd_submissions WHERE ref = ?1").bind(ref).first();
  if (!sub) return fail("Not found.", 404);
  const pub = await env.DB.prepare("SELECT * FROM cd_published WHERE submission_id = ?1").bind(sub.id).first();
  const note = cleanText(body.note || "", { multiline: true });
  if (note.length > 1000) return fail("Note too long (max 1000).");

  const now = nowIso();
  const stmts = [];
  const db = env.DB;
  const audit = (action, before, after) =>
    db.prepare("INSERT INTO cd_audit (at, actor, action, submission_id, before_json, after_json) VALUES (?1,?2,?3,?4,?5,?6)")
      .bind(now, admin, action, sub.id, before === undefined ? null : JSON.stringify(before), after === undefined ? null : JSON.stringify(after));
  const decision = (action, from, to, n) =>
    db.prepare("INSERT INTO cd_decisions (submission_id, action, from_status, to_status, internal_note, reviewer, created_at) VALUES (?1,?2,?3,?4,?5,?6,?7)")
      .bind(sub.id, action, from, to, n || null, admin, now);

  const setStatus = (to, action, reviewerStatus = "reviewed") => {
    stmts.push(db.prepare("UPDATE cd_submissions SET evidence_status = ?1, reviewer_status = ?2, updated_at = ?3 WHERE id = ?4").bind(to, reviewerStatus, now, sub.id));
    stmts.push(decision(action, sub.evidence_status, to, note));
    stmts.push(audit(action, { evidence_status: sub.evidence_status }, { evidence_status: to }));
    if (pub) {
      const stillPublic = PUBLISHABLE.includes(to);
      stmts.push(db.prepare(
        `UPDATE cd_published SET evidence_status = ?1, updated_at = ?2,
           is_published = CASE WHEN ?3 = 1 THEN is_published ELSE 0 END,
           map_approved = CASE WHEN ?3 = 1 THEN map_approved ELSE 0 END WHERE submission_id = ?4`
      ).bind(to, now, stillPublic ? 1 : 0, sub.id));
      if (!stillPublic && (pub.is_published || pub.map_approved)) stmts.push(audit("auto_unpublish_on_status_change", { is_published: pub.is_published, map_approved: pub.map_approved }, { is_published: 0, map_approved: 0 }));
    }
  };

  const createDraft = (st) => {
    const shortExp = (sub.short_description && sub.short_description.trim()) || String(sub.detailed_explanation || "").slice(0, 280);
    const findInst = (sub.directions && sub.directions.trim()) || String(sub.detailed_explanation || "").slice(0, 2000);
    const pubRegion = (sub.region && REGIONS.includes(sub.region)) ? sub.region : "Other / not sure";
    stmts.push(db.prepare(
      `INSERT INTO cd_published (submission_id, ref, title, category, short_explanation, finding_instructions, region, evidence_status, credit_name, updated_at)
       VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10)`
    ).bind(sub.id, sub.ref, sub.title, sub.category, shortExp, findInst, pubRegion, st,
      sub.credit_pref === "named" ? sub.display_name : null, now));
  };

  const action = body.action;
  switch (action) {
    case "start_review": {
      if (sub.reviewer_status !== "new") return fail("Already in review.");
      stmts.push(db.prepare("UPDATE cd_submissions SET reviewer_status = 'in_review', updated_at = ?1 WHERE id = ?2").bind(now, sub.id));
      stmts.push(decision("start_review", sub.evidence_status, sub.evidence_status, note));
      stmts.push(audit("start_review", { reviewer_status: "new" }, { reviewer_status: "in_review" }));
      break;
    }
    case "add_note": {
      if (!note) return fail("Note required.");
      stmts.push(decision("note", sub.evidence_status, sub.evidence_status, note));
      stmts.push(audit("note_added", undefined, { length: note.length }));
      break;
    }
    case "request_evidence": {
      if (!note) return fail("Describe what evidence is needed (internal note).");
      setStatus("NEEDS_MORE_EVIDENCE", "request_evidence", "in_review");
      break;
    }
    case "reject": {
      if (sub.evidence_status === "REJECTED") return fail("Submission is already rejected.", 409);
      if (!note) return fail("A reason is required to reject.");
      setStatus("REJECTED", "reject");
      break;
    }
    case "approve_report": {
      if (!["PENDING_REVIEW", "NEEDS_MORE_EVIDENCE"].includes(sub.evidence_status)) return fail("Only pending or needs-evidence submissions can be approved as a community report.");
      if (sub.duplicate_of) return fail("Submission is flagged as a duplicate.");
      setStatus("COMMUNITY_REPORTED", "approve_report");
      if (!pub) createDraft("COMMUNITY_REPORTED");
      break;
    }
    case "set_status": {
      const to = body.status;
      if (!Object.hasOwn(STATUSES, to)) return fail("Unknown status.");
      if (to === sub.evidence_status) return fail("Status unchanged.");
      if (to === "REJECTED" && !note) return fail("A reason is required to reject.");
      if (to === "CORROBORATED") {
        const basis = cleanText(body.basis || "", { multiline: true });
        if (basis.length < 20) return fail("CORROBORATED requires a written basis (>= 20 chars) explaining the independent evidence.");
        const rel = await db.prepare("SELECT COUNT(*) AS n FROM cd_relations WHERE kind = 'independent_confirmation' AND (submission_id = ?1 OR related_id = ?1)").bind(sub.id).first();
        if (rel.n < 1 && body.external_evidence_ack !== true) return fail("CORROBORATED requires a reviewer-linked independent confirmation, or explicit external_evidence_ack with a basis.");
        stmts.push(audit("corroboration_basis", undefined, { basis }));
      }
      if (to === "INDEPENDENTLY_VERIFIED") {
        if (body.confirm_verified !== true) return fail("INDEPENDENTLY_VERIFIED requires explicit owner confirmation (confirm_verified:true).");
        if (note.length < 20) return fail("INDEPENDENTLY_VERIFIED requires a reviewer note (>= 20 chars) describing how it was reproduced.");
      }
      if (PUBLISHABLE.includes(to) && !pub) createDraft(to);
      setStatus(to, "set_status");
      break;
    }
    case "flag_duplicate": {
      const dref = body.duplicate_ref;
      if (typeof dref !== "string" || !REF_RE.test(dref) || dref === ref) return fail("Valid duplicate_ref required.");
      const other = await db.prepare("SELECT id FROM cd_submissions WHERE ref = ?1").bind(dref).first();
      if (!other) return fail("Duplicate target not found.", 404);
      stmts.push(db.prepare("UPDATE cd_submissions SET duplicate_of = ?1, updated_at = ?2 WHERE id = ?3").bind(other.id, now, sub.id));
      stmts.push(db.prepare("INSERT INTO cd_relations (submission_id, related_id, kind, score, created_by, created_at) VALUES (?1,?2,'confirmed_duplicate',NULL,?3,?4)").bind(sub.id, other.id, admin, now));
      stmts.push(audit("flag_duplicate", { duplicate_of: null }, { duplicate_of: dref }));
      setStatus("REJECTED", "flag_duplicate");
      break;
    }
    case "link": {
      const rref = body.related_ref;
      if (typeof rref !== "string" || !REF_RE.test(rref) || rref === ref) return fail("Valid related_ref required.");
      if (!LINK_KINDS.includes(body.kind)) return fail("Unknown link kind.");
      if (!note) return fail("A note explaining the relationship is required.");
      const other = await db.prepare("SELECT id FROM cd_submissions WHERE ref = ?1").bind(rref).first();
      if (!other) return fail("Related submission not found.", 404);
      stmts.push(db.prepare("INSERT INTO cd_relations (submission_id, related_id, kind, score, created_by, created_at) VALUES (?1,?2,?3,NULL,?4,?5)").bind(sub.id, other.id, body.kind, admin, now));
      stmts.push(decision(`link:${body.kind}`, sub.evidence_status, sub.evidence_status, note));
      stmts.push(audit("link", undefined, { related: rref, kind: body.kind }));
      break;
    }
    case "edit_published": {
      if (!pub) return fail("Approve as a community report first; nothing to edit yet.");
      const f = {};
      const errs = [];
      const take = (k, min, max) => {
        if (body[k] === undefined) return;
        const v = cleanText(String(body[k]), { multiline: true });
        if (v.length < min || v.length > max) errs.push(k); else f[k] = v;
      };
      take("title", 5, 120); take("short_explanation", 20, 300); take("finding_instructions", 20, 2000);
      if (body.region !== undefined) { if (REGIONS.includes(body.region)) f.region = body.region; else errs.push("region"); }
      if (body.credit_name !== undefined) {
        if (body.credit_name === null || body.credit_name === "") f.credit_name = null;
        else if (sub.credit_pref === "named" && body.credit_name === sub.display_name) f.credit_name = sub.display_name;
        else errs.push("credit_name"); // credit only as the contributor selected
      }
      if (body.public_links !== undefined) {
        if (!Array.isArray(body.public_links) || body.public_links.length > 5) errs.push("public_links");
        else {
          const out = [];
          for (const l of body.public_links) {
            const url = safeUrl(String(l?.url || ""));
            if (!url) { errs.push("public_links"); break; }
            out.push({ label: cleanText(String(l.label || "Reference")).slice(0, 60), url });
          }
          f.public_links = JSON.stringify(out);
        }
      }
      if (body.related_guides !== undefined) {
        if (!Array.isArray(body.related_guides) || body.related_guides.length > 5 || !body.related_guides.every((p) => typeof p === "string" && /^\/(?!\/)[A-Za-z0-9\-_/.#]*$/.test(p))) errs.push("related_guides");
        else f.related_guides = JSON.stringify(body.related_guides);
      }
      if (errs.length) return fail(`Invalid: ${[...new Set(errs)].join(", ")}`);
      if (!Object.keys(f).length) return fail("Nothing to change.");
      const cols = Object.keys(f);
      const before = Object.fromEntries(cols.map((c) => [c, pub[c]]));
      stmts.push(db.prepare(`UPDATE cd_published SET ${cols.map((c, i) => `${c} = ?${i + 1}`).join(", ")}, updated_at = ?${cols.length + 1} WHERE submission_id = ?${cols.length + 2}`)
        .bind(...cols.map((c) => f[c]), now, sub.id));
      stmts.push(audit("edit_published", before, f));
      stmts.push(decision("edit_published", sub.evidence_status, sub.evidence_status, note));
      break;
    }
    case "publish": {
      if (!pub) return fail("No publication draft. Approve as a community report first.");
      if (!PUBLISHABLE.includes(sub.evidence_status)) return fail("Only community-reported, corroborated or verified submissions can be published.");
      if (sub.duplicate_of) return fail("Submission is flagged as a duplicate.");
      stmts.push(db.prepare("UPDATE cd_published SET is_published = 1, published_at = COALESCE(published_at, ?1), updated_at = ?1 WHERE submission_id = ?2").bind(now, sub.id));
      stmts.push(decision("publish", sub.evidence_status, sub.evidence_status, note));
      stmts.push(audit("publish", { is_published: pub.is_published }, { is_published: 1 }));
      break;
    }
    case "unpublish": {
      if (!pub) return fail("Not published.");
      stmts.push(db.prepare("UPDATE cd_published SET is_published = 0, map_approved = 0, updated_at = ?1 WHERE submission_id = ?2").bind(now, sub.id));
      stmts.push(decision("unpublish", sub.evidence_status, sub.evidence_status, note));
      stmts.push(audit("unpublish", { is_published: pub.is_published, map_approved: pub.map_approved }, { is_published: 0, map_approved: 0 }));
      break;
    }
    case "approve_map_pin": {
      if (!pub || !pub.is_published) return fail("Publish the discovery before approving a map pin.");
      if (!PUBLISHABLE.includes(sub.evidence_status)) return fail("Evidence status does not allow a map pin.");
      if (sub.category === "wildlife" && sub.evidence_status !== "INDEPENDENTLY_VERIFIED") return fail("Wildlife sightings cannot become map locations unless independently verified.");
      const p = body.pin || {};
      const checks = body.checks || {};
      for (const k of ["no_duplicate", "category_ok", "coordinates_ok", "description_ok", "evidence_ok", "specific_enough"]) {
        if (checks[k] !== true) return fail(`Pre-publication check not confirmed: ${k}`);
      }
      const x = Number(p.xPct), y = Number(p.yPct);
      if (!Number.isFinite(x) || !Number.isFinite(y) || x < 0 || x > 1 || y < 0 || y > 1) return fail("xPct/yPct must be numbers 0..1.");
      if (!Object.hasOwn(PIN_CATEGORIES, p.category)) return fail("Pin category must be live-discovery or easter-egg.");
      if (!REGIONS.slice(0, 8).includes(p.region)) return fail("Pin region must be a map region.");
      const title = cleanText(String(p.title || ""));
      const desc = cleanText(String(p.description || ""), { multiline: true });
      if (title.length < 5 || title.length > 100 || desc.length < 20 || desc.length > 500) return fail("Pin title (5-100) and description (20-500) required.");

      // Duplicate-location check against existing production pins (read-only).
      let nearest = null;
      try {
        const r = await env.ASSETS.fetch(new URL("/data/map-pins.json", request.url));
        const pins = (await r.json()).pins || [];
        for (const e of pins) {
          const d = Math.hypot(e.xPct - x, e.yPct - y);
          if (!nearest || d < nearest.d) nearest = { d, id: e.id, title: e.title };
        }
      } catch { /* checked below */ }
      if (!nearest) { if (body.override_nearby !== true) return fail("Could not read existing pins for a duplicate check; retry or set override_nearby after manual check."); }
      else if (nearest.d < NEARBY_DIST && body.override_nearby !== true) {
        return json({ ok: false, error: "A production pin already exists very close to this location.", nearest: { id: nearest.id, title: nearest.title } }, 409);
      }
      const pin = {
        title, category: p.category, categoryName: PIN_CATEGORIES[p.category], region: p.region,
        xPct: Math.round(x * 1000) / 1000, yPct: Math.round(y * 1000) / 1000,
        x: Math.round(x * MAP_W), y: Math.round(y * MAP_H),
        description: desc, tips: pub.finding_instructions, link: "/community-discoveries/",
      };
      stmts.push(db.prepare("UPDATE cd_published SET map_approved = 1, map_pin = ?1, updated_at = ?2 WHERE submission_id = ?3").bind(JSON.stringify(pin), now, sub.id));
      stmts.push(decision("approve_map_pin", sub.evidence_status, sub.evidence_status, note));
      stmts.push(audit("approve_map_pin", { map_approved: pub.map_approved }, { map_approved: 1, pin, override_nearby: body.override_nearby === true }));
      break;
    }
    case "remove_map_pin": {
      if (!pub || !pub.map_approved) return fail("No approved map pin.");
      stmts.push(db.prepare("UPDATE cd_published SET map_approved = 0, updated_at = ?1 WHERE submission_id = ?2").bind(now, sub.id));
      stmts.push(decision("remove_map_pin", sub.evidence_status, sub.evidence_status, note));
      stmts.push(audit("remove_map_pin", { map_approved: 1 }, { map_approved: 0 }));
      break;
    }
    default:
      return fail("Unknown action.");
  }

  try {
    await db.batch(stmts);
  } catch (e) {
    console.error("cd action error", e && e.message);
    return fail("Action failed.", 500);
  }
  return json({ ok: true, action, ref });
}
