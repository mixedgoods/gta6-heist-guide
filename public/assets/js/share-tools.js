// ==========================================================================
// GTA6HEISTGUIDE.COM — PRIVACY-SAFE SHARE & COPY HELPERS (Reddit / Discord / Link)
// Copies ONLY the active tool's selected/public configuration or summary.
// NEVER exposes unrelated localStorage progress, private notes, or full backups.
// ==========================================================================
(function (global) {
  'use strict';

  var ORIGIN = 'https://www.gta6heistguide.com';
  var ATTRIBUTION_REDDIT = '\n\n*Created with [GTA6HeistGuide.com](' + ORIGIN + ')*';
  var ATTRIBUTION_DISCORD = '\n*Created with GTA6HeistGuide.com*';
  var stylesInjected = false;

  function injectStyles() {
    if (stylesInjected || typeof document === 'undefined') return;
    stylesInjected = true;
    var style = document.createElement('style');
    style.id = 'gta6ShareToolsStyles';
    style.textContent = [
      '.gta-share-bar { display: flex; flex-wrap: wrap; align-items: center; gap: 0.45rem; }',
      '.gta-share-btn { display: inline-flex; align-items: center; gap: 0.32rem; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.18); color: #e2e8f0; border-radius: 7px; padding: 0.36rem 0.72rem; font-size: 0.74rem; font-weight: 800; font-family: var(--font-mono, monospace); cursor: pointer; transition: all 0.16s ease; white-space: nowrap; }',
      '.gta-share-btn:hover { transform: translateY(-1px); color: #fff; }',
      '.gta-share-btn.is-reddit { border-color: rgba(255, 107, 53, 0.45); background: rgba(255, 107, 53, 0.12); color: #fdba74; }',
      '.gta-share-btn.is-reddit:hover { background: rgba(255, 107, 53, 0.24); border-color: #fb923c; color: #fff; }',
      '.gta-share-btn.is-discord { border-color: rgba(129, 140, 248, 0.5); background: rgba(99, 102, 241, 0.16); color: #c7d2fe; }',
      '.gta-share-btn.is-discord:hover { background: rgba(99, 102, 241, 0.3); border-color: #818cf8; color: #fff; }',
      '.gta-share-btn.is-link { border-color: rgba(0, 240, 255, 0.42); background: rgba(0, 240, 255, 0.1); color: var(--neon-cyan, #00f0ff); }',
      '.gta-share-btn.is-link:hover { background: rgba(0, 240, 255, 0.22); border-color: var(--neon-cyan, #00f0ff); color: #fff; }',
      '.gta-share-btn.is-copied { border-color: var(--neon-green, #00ff88) !important; background: rgba(0, 255, 136, 0.2) !important; color: var(--neon-green, #00ff88) !important; }'
    ].join('\n');
    document.head.appendChild(style);
  }

  function fallbackCopy(text) {
    try {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      return true;
    } catch (e) {
      return false;
    }
  }

  function copyText(text, triggerBtn, toastLabel) {
    var payload = String(text || '');
    var done = function () {
      if (triggerBtn) {
        var orig = triggerBtn.getAttribute('data-orig-label') || triggerBtn.textContent;
        triggerBtn.setAttribute('data-orig-label', orig);
        triggerBtn.textContent = '✓ Copied!';
        triggerBtn.classList.add('is-copied');
        clearTimeout(triggerBtn._copyTimer);
        triggerBtn._copyTimer = setTimeout(function () {
          triggerBtn.textContent = orig;
          triggerBtn.classList.remove('is-copied');
        }, 1800);
      }
      if (global.GTA6 && typeof global.GTA6.showToast === 'function') {
        global.GTA6.showToast(toastLabel || '📋 Copied to clipboard!');
      } else if (typeof global.showToast === 'function') {
        global.showToast(toastLabel || '📋 Copied to clipboard!');
      }
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(payload).then(done).catch(function () {
        fallbackCopy(payload);
        done();
      });
    } else {
      fallbackCopy(payload);
      done();
    }
  }

  function formatReddit(title, lines, url) {
    var out = ['### ' + title, ''];
    (lines || []).forEach(function (l) { out.push(l); });
    if (url) {
      out.push('');
      out.push('**Link:** ' + url);
    }
    return out.join('\n') + ATTRIBUTION_REDDIT;
  }

  function formatDiscord(title, lines, url) {
    var out = ['**' + title + '**'];
    (lines || []).forEach(function (l) { out.push(l); });
    if (url) out.push(url);
    return out.join('\n') + ATTRIBUTION_DISCORD;
  }

  function buildShareBarHtml(prefix) {
    injectStyles();
    var p = prefix || 'gtaShare';
    return (
      '<div class="gta-share-bar" role="group" aria-label="Share and copy tools">' +
        '<button type="button" class="gta-share-btn is-reddit" data-share-action="reddit" data-share-prefix="' + p + '" title="Copy Markdown formatted for Reddit (no private progress included)">📋 Copy for Reddit</button>' +
        '<button type="button" class="gta-share-btn is-discord" data-share-action="discord" data-share-prefix="' + p + '" title="Copy Markdown formatted for Discord (no private progress included)">💬 Copy for Discord</button>' +
        '<button type="button" class="gta-share-btn is-link" data-share-action="link" data-share-prefix="' + p + '" title="Copy clean shareable URL">🔗 Copy Share Link</button>' +
      '</div>'
    );
  }

  function mountShareBar(container, handlers) {
    injectStyles();
    var el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return;
    el.innerHTML = buildShareBarHtml('mounted');
    el.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-share-action]');
      if (!btn) return;
      var action = btn.getAttribute('data-share-action');
      if (action === 'reddit' && handlers.getReddit) {
        copyText(handlers.getReddit(), btn, '📋 Reddit Markdown Copied!');
      } else if (action === 'discord' && handlers.getDiscord) {
        copyText(handlers.getDiscord(), btn, '💬 Discord Snippet Copied!');
      } else if (action === 'link' && handlers.getLink) {
        copyText(handlers.getLink(), btn, '🔗 Clean Share Link Copied!');
      }
    });
  }

  global.GTA6ShareTools = {
    ORIGIN: ORIGIN,
    injectStyles: injectStyles,
    copyText: copyText,
    formatReddit: formatReddit,
    formatDiscord: formatDiscord,
    buildShareBarHtml: buildShareBarHtml,
    mountShareBar: mountShareBar
  };
})(window);
