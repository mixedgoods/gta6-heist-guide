// ==========================================================================
// GTA6HEISTGUIDE.COM — GAMING GEAR VALIDATION & LEONIDA DROP ROTATION ENGINE
// Pure, zero-dependency product validation, refresh-driven 3-product
// collection rotation (tab-scoped sessionStorage), and legacy daily helpers.
// Works identically in browsers (window.GTA6GearRotation) and Node.js tests.
//
// Rules enforced:
// 1. LEONIDA DROP displays 3 coordinated, distinct active products together
//    (1 Main Editor's Pick + 2 Complementary Picks).
// 2. Refreshing the page (or clicking SHOW ANOTHER DROP) advances to the
//    next complete themed collection in the current tab's sessionStorage
//    sequence without repeating any collection until the full cycle ends.
// 3. Keeps the active collection completely stable while the page stays open
//    (zero timers, zero Math.random(), zero auto-redirects, zero new cookies).
// 4. Strictly enforces Amazon-Only product images inside LEONIDA DROP
//    (rejecting Wikimedia, manufacturer, third-party, AI, SVG, placeholders,
//    and expired >24h or non-mobile-approved Amazon API image URLs).
// 5. Rejects disabled, unverified, malformed, missing-tag, non-direct Amazon
//    URLs, generated/SVG illustrations, or forbidden price/rating/scarcity text.
// ==========================================================================
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.GTA6GearRotation = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var DEFAULT_TIMEZONE = 'America/Chicago';
  var DEFAULT_EPOCH_DATE = '2026-11-19';
  var DEFAULT_TAG = 'gta6heistguid-20';
  var DEFAULT_DROP_STORAGE_KEY = 'gta6_leonida_drop_cycle_v1';
  var AMAZON_IMAGE_MAX_AGE_MS = 24 * 60 * 60 * 1000;
  var ASIN_RE = /^[A-Z0-9]{10}$/;

  // Guardrails against stale prices, Amazon star ratings/review counts, and fake scarcity
  var FORBIDDEN_PRICE_RE = /(?:^|[\s(])(?:\$|USD\s*)\d+(?:\.\d{2})?(?:\b|$)/i;
  var FORBIDDEN_RATING_RE = /(?:\b\d(?:\.\d)?\s*(?:\/\s*5|out of 5)\s*stars?\b|\bamazon\s+(?:star\s+)?rating\b|\b\d[\d,]*\+?\s*amazon\s+(?:customer\s+)?reviews?\b|\u2605)/i;
  var FORBIDDEN_SCARCITY_RE = /\b(?:only\s+\d+\s+left|in\s+stock\s+now|limited\s+time\s+deal|flash\s+sale|expires\s+in\s+\d+|hurry,?\s+deal\s+ends)\b/i;

  function parseYmdToDayNumber(ymd) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(ymd || '').trim());
    if (!m) return null;
    var year = Number(m[1]);
    var month = Number(m[2]);
    var day = Number(m[3]);
    if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) return null;
    return Math.floor(Date.UTC(year, month - 1, day) / 86400000);
  }

  function getCalendarDateInTimeZone(dateInput, timeZone) {
    var tz = timeZone || DEFAULT_TIMEZONE;
    var d = dateInput instanceof Date
      ? dateInput
      : (dateInput !== undefined && dateInput !== null ? new Date(dateInput) : new Date());
    if (isNaN(d.getTime())) {
      d = new Date();
    }

    var year, month, day;
    if (typeof Intl !== 'undefined' && typeof Intl.DateTimeFormat === 'function') {
      var fmt = new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
      var parts = fmt.formatToParts(d);
      for (var i = 0; i < parts.length; i++) {
        if (parts[i].type === 'year') year = Number(parts[i].value);
        else if (parts[i].type === 'month') month = Number(parts[i].value);
        else if (parts[i].type === 'day') day = Number(parts[i].value);
      }
    } else {
      var shifted = new Date(d.getTime() - 6 * 3600000);
      year = shifted.getUTCFullYear();
      month = shifted.getUTCMonth() + 1;
      day = shifted.getUTCDate();
    }

    var mm = month < 10 ? '0' + month : String(month);
    var dd = day < 10 ? '0' + day : String(day);
    var isoDate = year + '-' + mm + '-' + dd;
    var dayNumber = Math.floor(Date.UTC(year, month - 1, day) / 86400000);

    return {
      year: year,
      month: month,
      day: day,
      isoDate: isoDate,
      dayNumber: dayNumber,
      timeZone: tz
    };
  }

  function formatDisplayDate(calendarDate) {
    var months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    var mName = months[(calendarDate.month - 1) % 12] || 'Unknown';
    return mName + ' ' + calendarDate.day + ', ' + calendarDate.year;
  }

  function getNextCalendarDateIso(calendarDate) {
    var nextUtc = new Date((calendarDate.dayNumber + 1) * 86400000);
    var y = nextUtc.getUTCFullYear();
    var m = nextUtc.getUTCMonth() + 1;
    var d = nextUtc.getUTCDate();
    return y + '-' + (m < 10 ? '0' + m : String(m)) + '-' + (d < 10 ? '0' + d : String(d));
  }

  function validateAmazonSpecialLink(urlStr, expectedAsin, expectedTag) {
    var tag = expectedTag || DEFAULT_TAG;
    var reasons = [];
    if (typeof urlStr !== 'string' || !urlStr.trim()) {
      reasons.push('missing_amazon_url');
      return { valid: false, reasons: reasons, host: null };
    }
    var parsed;
    try {
      parsed = new URL(urlStr.trim());
    } catch (e) {
      reasons.push('invalid_url_syntax');
      return { valid: false, reasons: reasons, host: null };
    }
    if (parsed.protocol !== 'https:') {
      reasons.push('non_https_url');
    }
    var host = parsed.hostname.toLowerCase();
    if (host !== 'www.amazon.com' && host !== 'amazon.com') {
      reasons.push('non_direct_amazon_host');
    }
    var dpMatch = /^\/dp\/([A-Z0-9]{10})(?:\/|$)/i.exec(parsed.pathname);
    if (!dpMatch) {
      reasons.push('missing_direct_dp_asin_path');
    } else if (expectedAsin && dpMatch[1].toUpperCase() !== String(expectedAsin).toUpperCase()) {
      reasons.push('asin_url_mismatch');
    }
    var urlTag = parsed.searchParams.get('tag');
    if (!urlTag) {
      reasons.push('missing_associates_tag');
    } else if (urlTag !== tag) {
      reasons.push('wrong_associates_tag');
    }
    return {
      valid: reasons.length === 0,
      reasons: reasons,
      host: host,
      asin: dpMatch ? dpMatch[1].toUpperCase() : null,
      tag: urlTag
    };
  }

  function checkForbiddenCopy(strings) {
    var reasons = [];
    for (var i = 0; i < strings.length; i++) {
      var val = strings[i];
      if (typeof val !== 'string' || !val) continue;
      if (FORBIDDEN_PRICE_RE.test(val)) reasons.push('forbidden_static_price');
      if (FORBIDDEN_RATING_RE.test(val)) reasons.push('forbidden_amazon_rating_or_review');
      if (FORBIDDEN_SCARCITY_RE.test(val)) reasons.push('forbidden_scarcity_claim');
    }
    return reasons;
  }

  // Strict Amazon-Only image guard for LEONIDA DROP.
  // Rejects Wikimedia Commons, manufacturer/retailer URLs, SVGs, AI illustrations,
  // placeholders, unapproved mobile displays, and >24h stale Creators API image URLs.
  function isAuthorizedAmazonDropImage(product, nowMs) {
    if (!product || typeof product !== 'object') return false;
    var img = product.amazonDropImage;
    if (!img || typeof img !== 'object') return false;
    if (img.authorized !== true) return false;
    if (img.mobileApproved !== true) return false;
    if (img.source !== 'amazon-recommended-widget' && img.source !== 'amazon-creators-api') return false;
    var url = typeof img.url === 'string' ? img.url.trim() : '';
    if (!/^https:\/\/(?:m\.media-amazon\.com|images-na\.ssl-images-amazon\.com)\//i.test(url)) {
      return false;
    }
    if (/\.svg(?:$|\?)/i.test(url)) return false;
    var fetchedMs = Date.parse(String(img.fetchedAt || ''));
    if (!Number.isFinite(fetchedMs)) return false;
    var refNow = typeof nowMs === 'number' && Number.isFinite(nowMs) ? nowMs : Date.now();
    if (refNow - fetchedMs > AMAZON_IMAGE_MAX_AGE_MS || fetchedMs - refNow > 600000) {
      return false;
    }
    return true;
  }

  function validateProduct(product, options) {
    var opts = options || {};
    var expectedTag = opts.expectedTag || DEFAULT_TAG;
    var requireDaily = Boolean(opts.requireDaily);
    var reasons = [];

    if (!product || typeof product !== 'object') {
      return { valid: false, reasons: ['invalid_product_object'] };
    }
    if (product.active !== true) {
      reasons.push('product_inactive');
    }
    if (requireDaily && product.dailyEligible !== true) {
      reasons.push('not_daily_eligible');
    }
    if (!product.id || typeof product.id !== 'string' || !product.id.trim()) {
      reasons.push('missing_id');
    }
    if (!product.productName || typeof product.productName !== 'string' || !product.productName.trim()) {
      reasons.push('missing_product_name');
    }
    if (!product.category || typeof product.category !== 'string' || !product.category.trim()) {
      reasons.push('missing_category');
    }
    if (!product.asin || !ASIN_RE.test(String(product.asin).trim())) {
      reasons.push('invalid_or_missing_asin');
    }
    if (product.associatesTag !== expectedTag) {
      reasons.push('invalid_or_missing_associates_tag');
    }
    var linkCheck = validateAmazonSpecialLink(product.amazonSpecialLink, product.asin, expectedTag);
    if (!linkCheck.valid) {
      reasons = reasons.concat(linkCheck.reasons);
    }
    var mediaType = product.mediaType;
    var imgSrc = typeof product.imageSource === 'string' ? product.imageSource.trim() : '';
    var licStatus = (product.imageLicense && product.imageLicense.status) ? String(product.imageLicense.status) : '';

    // Strictly forbid generated, artificial, illustrative, Wikimedia, or local non-Amazon product images
    if (
      mediaType === 'illustration' ||
      /gear-illustrations/i.test(imgSrc) ||
      /\.svg(?:$|\?)/i.test(imgSrc) ||
      /illustration|generated|artificial|synthetic|mockup/i.test(licStatus)
    ) {
      reasons.push('forbidden_generated_or_illustrative_image');
    }

    if (
      /gear-photos/i.test(imgSrc) ||
      /wikimedia\.org|wikipedia\.org/i.test(imgSrc)
    ) {
      reasons.push('forbidden_non_amazon_product_image');
    }

    if (mediaType === 'photo') {
      if (!isAuthorizedAmazonDropImage(product)) {
        reasons.push('missing_or_unauthorized_image');
      }
      if (!product.imageAlt || typeof product.imageAlt !== 'string' || !product.imageAlt.trim()) {
        reasons.push('missing_image_alt');
      }
      if (!/approved/i.test(licStatus)) {
        reasons.push('unverified_image_license');
      }
    } else if (mediaType === 'none') {
      if (imgSrc) {
        reasons.push('text_only_card_must_not_reference_image');
      }
      if (requireDaily) {
        reasons.push('daily_pick_requires_verified_real_photo');
      }
    } else {
      reasons.push('invalid_media_type');
    }
    if (!product.compatibility || typeof product.compatibility !== 'string' || !product.compatibility.trim()) {
      reasons.push('missing_compatibility');
    }
    if (!product.shortDescription || typeof product.shortDescription !== 'string' || !product.shortDescription.trim()) {
      reasons.push('missing_short_description');
    }
    if (!product.honestDisadvantages || typeof product.honestDisadvantages !== 'string' || !product.honestDisadvantages.trim()) {
      reasons.push('missing_honest_disadvantages');
    }
    if (!product.researchVerifiedDate || !product.linkVerifiedDate) {
      reasons.push('missing_verification_dates');
    }
    if (requireDaily) {
      if (!product.editorialIntro || !product.whyInteresting || !product.whatMakesItDifferent || !product.intendedAudience) {
        reasons.push('missing_daily_editorial_fields');
      }
    }

    reasons = reasons.concat(checkForbiddenCopy([
      product.productName,
      product.shortDescription,
      product.whyInteresting,
      product.editorialIntro,
      product.whatMakesItDifferent,
      product.intendedAudience,
      product.compatibility,
      product.honestDisadvantages
    ]));

    var unique = [];
    for (var r = 0; r < reasons.length; r++) {
      if (unique.indexOf(reasons[r]) === -1) unique.push(reasons[r]);
    }
    return {
      valid: unique.length === 0,
      reasons: unique,
      destinationHost: linkCheck.host
    };
  }

  function getApprovedCatalogProducts(catalog, options) {
    var opts = options || {};
    var expectedTag = (catalog && catalog.associatesTag) || opts.expectedTag || DEFAULT_TAG;
    var list = (catalog && Array.isArray(catalog.products)) ? catalog.products : [];
    var approved = [];
    for (var i = 0; i < list.length; i++) {
      var res = validateProduct(list[i], { expectedTag: expectedTag, requireDaily: false });
      if (res.valid) approved.push(list[i]);
    }
    return approved;
  }

  function getEligibleDailyProducts(catalog, options) {
    var opts = options || {};
    var expectedTag = (catalog && catalog.associatesTag) || opts.expectedTag || DEFAULT_TAG;
    var list = (catalog && Array.isArray(catalog.products)) ? catalog.products : [];
    var eligible = [];
    for (var i = 0; i < list.length; i++) {
      var res = validateProduct(list[i], { expectedTag: expectedTag, requireDaily: true });
      if (res.valid) eligible.push(list[i]);
    }
    eligible.sort(function (a, b) {
      var ao = typeof a.dailyOrder === 'number' ? a.dailyOrder : 9999;
      var bo = typeof b.dailyOrder === 'number' ? b.dailyOrder : 9999;
      if (ao !== bo) return ao - bo;
      return String(a.id).localeCompare(String(b.id));
    });
    return eligible;
  }

  function selectDailyPick(catalog, dateInput, options) {
    var opts = options || {};
    var rotCfg = (catalog && catalog.rotationConfig) || {};
    var timeZone = opts.timeZone || rotCfg.timezone || DEFAULT_TIMEZONE;
    var epochDateStr = opts.epochDateChicago || rotCfg.epochDateChicago || DEFAULT_EPOCH_DATE;
    var epochDay = parseYmdToDayNumber(epochDateStr);
    if (epochDay === null) epochDay = parseYmdToDayNumber(DEFAULT_EPOCH_DATE);

    var cal = getCalendarDateInTimeZone(dateInput, timeZone);
    var eligible = getEligibleDailyProducts(catalog, opts);

    if (!eligible.length) {
      return {
        ok: false,
        reason: 'no_eligible_products',
        product: null,
        index: -1,
        poolSize: 0,
        calendarDate: cal,
        displayDate: formatDisplayDate(cal),
        nextRotationDate: getNextCalendarDateIso(cal)
      };
    }

    var delta = cal.dayNumber - epochDay;
    var index = ((delta % eligible.length) + eligible.length) % eligible.length;
    var nextIndex = (index + 1) % eligible.length;

    return {
      ok: true,
      product: eligible[index],
      nextProduct: eligible[nextIndex],
      index: index,
      slotNumber: index + 1,
      poolSize: eligible.length,
      calendarDate: cal,
      displayDate: formatDisplayDate(cal),
      nextRotationDate: getNextCalendarDateIso(cal),
      nextRotationLabel: getNextCalendarDateIso(cal) + ' at 12:00 AM CT (America/Chicago)'
    };
  }

  // ---------- LEONIDA DROP: 3-PRODUCT COLLECTION VALIDATION & REFRESH CYCLE ----------

  function buildProductIndex(catalog) {
    var map = {};
    var list = (catalog && Array.isArray(catalog.products)) ? catalog.products : [];
    for (var i = 0; i < list.length; i++) {
      if (list[i] && list[i].id) {
        map[list[i].id] = list[i];
      }
    }
    return map;
  }

  function validateDropCollection(collection, catalog, options) {
    var opts = options || {};
    var expectedTag = (catalog && catalog.associatesTag) || opts.expectedTag || DEFAULT_TAG;
    var productIndex = opts.productIndex || buildProductIndex(catalog);
    var reasons = [];

    if (!collection || typeof collection !== 'object') {
      return { valid: false, reasons: ['invalid_collection_object'], resolvedItems: [] };
    }
    if (collection.active !== true) {
      reasons.push('collection_inactive');
    }
    if (!collection.id || typeof collection.id !== 'string' || !collection.id.trim()) {
      reasons.push('missing_collection_id');
    }
    if (!collection.name || typeof collection.name !== 'string' || !collection.name.trim()) {
      reasons.push('missing_collection_name');
    }
    if (!collection.description || typeof collection.description !== 'string' || !collection.description.trim()) {
      reasons.push('missing_collection_description');
    }
    reasons = reasons.concat(checkForbiddenCopy([
      collection.name,
      collection.tagline,
      collection.description
    ]));

    var items = Array.isArray(collection.items) ? collection.items : [];
    if (items.length !== 3) {
      reasons.push('collection_must_have_exactly_3_products');
    }

    var seenIds = {};
    var seenAsins = {};
    var resolvedItems = [];
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      if (!item || typeof item !== 'object' || !item.productId) {
        reasons.push('missing_collection_item_product_id');
        continue;
      }
      var pos = Number(item.position);
      if (pos !== i + 1) {
        reasons.push('invalid_item_position_' + String(item.productId));
      }
      if (i === 0 && item.role !== 'main') {
        reasons.push('position_1_must_be_main_pick');
      }
      if (i > 0 && item.role !== 'supporting') {
        reasons.push('supporting_position_invalid_role');
      }
      if (seenIds[item.productId]) {
        reasons.push('duplicate_product_in_collection:' + item.productId);
        continue;
      }
      seenIds[item.productId] = true;

      var prod = productIndex[item.productId];
      if (!prod) {
        reasons.push('unknown_product_in_collection:' + item.productId);
        continue;
      }
      var pCheck = validateProduct(prod, { expectedTag: expectedTag, requireDaily: false });
      if (!pCheck.valid) {
        reasons.push('invalid_product_in_collection:' + item.productId + '(' + pCheck.reasons.join(',') + ')');
        continue;
      }
      if (seenAsins[prod.asin]) {
        reasons.push('duplicate_asin_in_collection:' + prod.asin);
        continue;
      }
      seenAsins[prod.asin] = true;

      reasons = reasons.concat(checkForbiddenCopy([item.roleLabel, item.pairingNote]));

      resolvedItems.push({
        position: pos,
        role: item.role,
        roleLabel: item.roleLabel || (pos === 1 ? "Main Editor's Pick" : ('Complementary Pick #' + pos)),
        pairingNote: item.pairingNote || prod.whyInteresting || prod.shortDescription,
        product: prod
      });
    }

    var unique = [];
    for (var r = 0; r < reasons.length; r++) {
      if (unique.indexOf(reasons[r]) === -1) unique.push(reasons[r]);
    }
    return {
      valid: unique.length === 0 && resolvedItems.length === 3,
      reasons: unique,
      resolvedItems: resolvedItems
    };
  }

  function getValidDropCollections(catalog, options) {
    var opts = options || {};
    var expectedTag = (catalog && catalog.associatesTag) || opts.expectedTag || DEFAULT_TAG;
    var productIndex = buildProductIndex(catalog);
    var raw = (catalog && Array.isArray(catalog.leonidaDropCollections)) ? catalog.leonidaDropCollections : [];
    var valid = [];

    for (var i = 0; i < raw.length; i++) {
      var res = validateDropCollection(raw[i], catalog, {
        expectedTag: expectedTag,
        productIndex: productIndex
      });
      if (res.valid) {
        valid.push({
          id: raw[i].id,
          order: typeof raw[i].order === 'number' ? raw[i].order : (i + 1),
          name: raw[i].name,
          tagline: raw[i].tagline || '',
          description: raw[i].description,
          accent: raw[i].accent || 'cyan',
          items: res.resolvedItems
        });
      }
    }

    valid.sort(function (a, b) {
      if (a.order !== b.order) return a.order - b.order;
      return String(a.id).localeCompare(String(b.id));
    });
    return valid;
  }

  function readCycleStorage(storage, key) {
    if (!storage || typeof storage.getItem !== 'function') return null;
    try {
      var raw = storage.getItem(key);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.order)) return null;
      var idx = Number(parsed.index);
      var cycle = Number(parsed.cycle);
      if (!Number.isInteger(idx) || idx < 0) return null;
      return {
        order: parsed.order.slice(),
        index: idx,
        cycle: Number.isInteger(cycle) && cycle >= 1 ? cycle : 1
      };
    } catch (e) {
      return null;
    }
  }

  function writeCycleStorage(storage, key, state) {
    if (!storage || typeof storage.setItem !== 'function') return false;
    try {
      storage.setItem(key, JSON.stringify({
        order: state.order,
        index: state.index,
        cycle: state.cycle
      }));
      return true;
    } catch (e) {
      return false;
    }
  }

  function reconcileCycleState(validCollections, stored) {
    var validIds = [];
    var validMap = {};
    for (var i = 0; i < validCollections.length; i++) {
      validIds.push(validCollections[i].id);
      validMap[validCollections[i].id] = validCollections[i];
    }

    if (!stored || !stored.order.length) {
      return {
        hadPriorState: false,
        order: validIds,
        index: 0,
        cycle: 1,
        validMap: validMap
      };
    }

    // Preserve stored order for still-valid collection IDs; append any newly valid IDs at the end
    var reconciledOrder = [];
    var seen = {};
    var currentStoredId = stored.order[stored.index] || null;
    var removedBeforeCurrent = 0;

    for (var j = 0; j < stored.order.length; j++) {
      var cid = stored.order[j];
      if (validMap[cid] && !seen[cid]) {
        reconciledOrder.push(cid);
        seen[cid] = true;
      } else if (j < stored.index) {
        removedBeforeCurrent++;
      }
    }
    for (var k = 0; k < validIds.length; k++) {
      if (!seen[validIds[k]]) {
        reconciledOrder.push(validIds[k]);
        seen[validIds[k]] = true;
      }
    }

    var newIndex = currentStoredId ? reconciledOrder.indexOf(currentStoredId) : -1;
    if (newIndex === -1) {
      newIndex = Math.max(0, Math.min(reconciledOrder.length - 1, stored.index - removedBeforeCurrent));
    }

    return {
      hadPriorState: true,
      order: reconciledOrder,
      index: newIndex,
      cycle: stored.cycle || 1,
      validMap: validMap
    };
  }

  function selectDropCollection(catalog, storage, options) {
    var opts = options || {};
    var dropCfg = (catalog && catalog.leonidaDropConfig) || {};
    var storageKey = opts.storageKey || dropCfg.sessionStorageKey || DEFAULT_DROP_STORAGE_KEY;
    var advanceOnLoad = opts.advanceOnLoad !== false;

    var validCollections = getValidDropCollections(catalog, opts);
    if (!validCollections.length) {
      return {
        ok: false,
        reason: 'no_valid_drop_collections',
        collection: null,
        index: -1,
        slotNumber: 0,
        totalCollections: 0,
        cycle: 0
      };
    }

    var stored = readCycleStorage(storage, storageKey);
    var state = reconcileCycleState(validCollections, stored);
    var total = state.order.length;
    var nextIndex = state.index;
    var nextCycle = state.cycle;

    if (state.hadPriorState && advanceOnLoad) {
      if (nextIndex + 1 >= total) {
        nextIndex = 0;
        nextCycle = state.cycle + 1;
      } else {
        nextIndex = state.index + 1;
      }
    }

    var persisted = writeCycleStorage(storage, storageKey, {
      order: state.order,
      index: nextIndex,
      cycle: nextCycle
    });

    var activeId = state.order[nextIndex];
    var upcomingId = state.order[(nextIndex + 1) % total];

    return {
      ok: true,
      collection: state.validMap[activeId],
      nextCollection: state.validMap[upcomingId],
      index: nextIndex,
      slotNumber: nextIndex + 1,
      totalCollections: total,
      cycle: nextCycle,
      order: state.order.slice(),
      isInitialVisit: !state.hadPriorState,
      persisted: persisted
    };
  }

  function advanceDropCollection(catalog, storage, options) {
    var opts = options || {};
    var dropCfg = (catalog && catalog.leonidaDropConfig) || {};
    var storageKey = opts.storageKey || dropCfg.sessionStorageKey || DEFAULT_DROP_STORAGE_KEY;

    var validCollections = getValidDropCollections(catalog, opts);
    if (!validCollections.length) {
      return {
        ok: false,
        reason: 'no_valid_drop_collections',
        collection: null,
        index: -1,
        slotNumber: 0,
        totalCollections: 0,
        cycle: 0
      };
    }

    var stored = readCycleStorage(storage, storageKey);
    var state = reconcileCycleState(validCollections, stored);
    var total = state.order.length;
    var currentIndex = typeof opts.currentIndex === 'number' && opts.currentIndex >= 0 && opts.currentIndex < total
      ? opts.currentIndex
      : state.index;

    var nextIndex = currentIndex + 1;
    var nextCycle = state.cycle;
    if (nextIndex >= total) {
      nextIndex = 0;
      nextCycle = state.cycle + 1;
    }

    var persisted = writeCycleStorage(storage, storageKey, {
      order: state.order,
      index: nextIndex,
      cycle: nextCycle
    });

    var activeId = state.order[nextIndex];
    var upcomingId = state.order[(nextIndex + 1) % total];

    return {
      ok: true,
      collection: state.validMap[activeId],
      nextCollection: state.validMap[upcomingId],
      index: nextIndex,
      slotNumber: nextIndex + 1,
      totalCollections: total,
      cycle: nextCycle,
      order: state.order.slice(),
      isInitialVisit: false,
      persisted: persisted
    };
  }

  return {
    DEFAULT_TIMEZONE: DEFAULT_TIMEZONE,
    DEFAULT_EPOCH_DATE: DEFAULT_EPOCH_DATE,
    DEFAULT_TAG: DEFAULT_TAG,
    DEFAULT_DROP_STORAGE_KEY: DEFAULT_DROP_STORAGE_KEY,
    AMAZON_IMAGE_MAX_AGE_MS: AMAZON_IMAGE_MAX_AGE_MS,
    parseYmdToDayNumber: parseYmdToDayNumber,
    getCalendarDateInTimeZone: getCalendarDateInTimeZone,
    formatDisplayDate: formatDisplayDate,
    getNextCalendarDateIso: getNextCalendarDateIso,
    validateAmazonSpecialLink: validateAmazonSpecialLink,
    isAuthorizedAmazonDropImage: isAuthorizedAmazonDropImage,
    validateProduct: validateProduct,
    getApprovedCatalogProducts: getApprovedCatalogProducts,
    getEligibleDailyProducts: getEligibleDailyProducts,
    selectDailyPick: selectDailyPick,
    validateDropCollection: validateDropCollection,
    getValidDropCollections: getValidDropCollections,
    selectDropCollection: selectDropCollection,
    advanceDropCollection: advanceDropCollection
  };
});
