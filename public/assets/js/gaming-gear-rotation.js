// ==========================================================================
// GTA6HEISTGUIDE.COM — LEONIDA EDITOR'S PICK DETERMINISTIC DAILY ROTATION
// Pure, zero-dependency, timezone-deterministic daily product selector.
// Works identically in browsers (window.GTA6GearRotation) and Node.js tests.
//
// Rules enforced:
// 1. Every visitor sees the exact same pick on a given America/Chicago date.
// 2. Rotates once per calendar day at 00:00:00 America/Chicago (DST-safe).
// 3. Cycles through all approved daily-eligible products without repeating
//    until the entire active eligible pool has been exhausted.
// 4. Rejects disabled, unverified, malformed, missing-tag, non-direct Amazon
//    URLs, unapproved imagery, or forbidden price/rating/scarcity strings.
// 5. Never uses Math.random(), timers, auto-redirects, or user profiling.
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
      // Safe fallback if Intl is unavailable in a minimal environment (UTC-6 CST)
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
    if (!product.imageSource || typeof product.imageSource !== 'string' || !product.imageSource.startsWith('/assets/')) {
      reasons.push('missing_or_unauthorized_image');
    }
    if (!product.imageAlt || typeof product.imageAlt !== 'string' || !product.imageAlt.trim()) {
      reasons.push('missing_image_alt');
    }
    if (!product.imageLicense || !product.imageLicense.status || !/approved|authorized/i.test(product.imageLicense.status)) {
      reasons.push('unverified_image_license');
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

    // Content compliance checks across user-visible strings
    var textFields = [
      product.productName,
      product.shortDescription,
      product.whyInteresting,
      product.editorialIntro,
      product.whatMakesItDifferent,
      product.intendedAudience,
      product.compatibility,
      product.honestDisadvantages
    ];
    for (var i = 0; i < textFields.length; i++) {
      var val = textFields[i];
      if (typeof val !== 'string' || !val) continue;
      if (FORBIDDEN_PRICE_RE.test(val)) reasons.push('forbidden_static_price');
      if (FORBIDDEN_RATING_RE.test(val)) reasons.push('forbidden_amazon_rating_or_review');
      if (FORBIDDEN_SCARCITY_RE.test(val)) reasons.push('forbidden_scarcity_claim');
    }

    // Deduplicate reasons
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
    // Stable deterministic ordering by dailyOrder (if numeric), then id
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

  return {
    DEFAULT_TIMEZONE: DEFAULT_TIMEZONE,
    DEFAULT_EPOCH_DATE: DEFAULT_EPOCH_DATE,
    DEFAULT_TAG: DEFAULT_TAG,
    parseYmdToDayNumber: parseYmdToDayNumber,
    getCalendarDateInTimeZone: getCalendarDateInTimeZone,
    formatDisplayDate: formatDisplayDate,
    getNextCalendarDateIso: getNextCalendarDateIso,
    validateAmazonSpecialLink: validateAmazonSpecialLink,
    validateProduct: validateProduct,
    getApprovedCatalogProducts: getApprovedCatalogProducts,
    getEligibleDailyProducts: getEligibleDailyProducts,
    selectDailyPick: selectDailyPick
  };
});
