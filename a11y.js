/* ════════════════════════════════════════════════════════════════
   Accessibility widget — global behaviour
   - Injects: skip link, floating button (bottom-right), preferences panel
   - Keyboard accessible: Esc closes, Tab is trapped while open, focus is
     moved into the panel on open and restored to the button on close
   - Semantic <button>s with aria-label / aria-expanded / aria-controls /
     aria-pressed; panel is role="dialog" aria-modal
   - Preferences persist in localStorage and re-apply on every page (global)

   NOTE: This widget is an ASSISTIVE TOOL only. The site itself must still be
   built to WCAG 2.0 AA / Israeli Standard (תקן ישראלי) 5568.
   ════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var STORAGE_KEY = 'faltee-a11y';
  var root = document.documentElement;

  var DEFAULTS = { fontStep: 0, contrast: false, underline: false, readable: false, motion: false, focus: false };
  var FONT_MIN = -2, FONT_MAX = 6, FONT_BASE = 16;

  var state = load();

  function load() {
    try {
      var saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      return Object.assign({}, DEFAULTS, saved);
    } catch (e) { return Object.assign({}, DEFAULTS); }
  }
  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {}
  }

  /* Apply current state to <html> — runs as early as possible to limit flash */
  function apply() {
    if (state.fontStep === 0) root.style.removeProperty('font-size');
    else root.style.fontSize = (FONT_BASE * (1 + state.fontStep * 0.1)).toFixed(1) + 'px';
    root.classList.toggle('a11y-contrast', !!state.contrast);
    root.classList.toggle('a11y-underline', !!state.underline);
    root.classList.toggle('a11y-readable-font', !!state.readable);
    root.classList.toggle('a11y-reduce-motion', !!state.motion);
    root.classList.toggle('a11y-focus', !!state.focus);
  }
  apply();

  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  ready(function () {
    /* ── Skip link → first content landmark ── */
    var skip = document.createElement('a');
    skip.className = 'a11y-skip';
    skip.textContent = 'דלג לתוכן הראשי';
    var main = document.querySelector('main, [role="main"], #main-content') ||
               document.getElementById('hero') ||
               document.querySelector('section');
    if (main) {
      if (!main.id) main.id = 'a11y-main';
      main.setAttribute('tabindex', '-1');
      skip.href = '#' + main.id;
    } else {
      skip.href = '#';
    }
    document.body.insertBefore(skip, document.body.firstChild);

    /* ── Floating button ── */
    var fab = document.createElement('button');
    fab.type = 'button';
    fab.className = 'a11y-fab';
    fab.id = 'a11yFab';
    fab.setAttribute('aria-label', 'פתיחת תפריט נגישות');
    fab.setAttribute('aria-haspopup', 'dialog');
    fab.setAttribute('aria-controls', 'a11yPanel');
    fab.setAttribute('aria-expanded', 'false');
    fab.innerHTML =
      '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
      '<circle cx="12" cy="12" r="10"/>' +
      '<circle cx="12" cy="7" r="1.4" fill="currentColor" stroke="none"/>' +
      '<path d="M5 9.5c4.5 1.6 9.5 1.6 14 0M12 9.5V14m0 0l-2.6 5.2M12 14l2.6 5.2"/>' +
      '</svg>';
    document.body.appendChild(fab);

    /* ── Panel ── */
    var panel = document.createElement('div');
    panel.className = 'a11y-panel';
    panel.id = 'a11yPanel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'true');
    panel.setAttribute('aria-labelledby', 'a11yTitle');
    panel.setAttribute('dir', 'rtl');
    panel.hidden = true;
    panel.innerHTML =
      '<div class="a11y-head">' +
        '<h2 class="a11y-title" id="a11yTitle">תפריט נגישות</h2>' +
        '<button type="button" class="a11y-close" id="a11yClose" aria-label="סגירת תפריט נגישות">✕</button>' +
      '</div>' +

      '<div class="a11y-group" role="group" aria-label="גודל טקסט">' +
        '<button type="button" class="a11y-item" data-act="inc"><span class="a11y-ico" aria-hidden="true">A+</span>הגדל טקסט</button>' +
        '<button type="button" class="a11y-item" data-act="dec"><span class="a11y-ico" aria-hidden="true">A−</span>הקטן טקסט</button>' +
      '</div>' +

      '<button type="button" class="a11y-item" data-toggle="contrast"  aria-pressed="false"><span class="a11y-ico" aria-hidden="true">◑</span><span class="a11y-state">ניגודיות גבוהה</span></button>' +
      '<button type="button" class="a11y-item" data-toggle="underline" aria-pressed="false"><span class="a11y-ico" aria-hidden="true">U̲</span><span class="a11y-state">הדגשת קישורים</span></button>' +
      '<button type="button" class="a11y-item" data-toggle="readable"  aria-pressed="false"><span class="a11y-ico" aria-hidden="true">Aa</span><span class="a11y-state">גופן קריא</span></button>' +
      '<button type="button" class="a11y-item" data-toggle="motion"    aria-pressed="false"><span class="a11y-ico" aria-hidden="true">⏸</span><span class="a11y-state">הפחתת אנימציות</span></button>' +
      '<button type="button" class="a11y-item" data-toggle="focus"     aria-pressed="false"><span class="a11y-ico" aria-hidden="true">⌖</span><span class="a11y-state">הדגשת פוקוס מקלדת</span></button>' +

      '<button type="button" class="a11y-item a11y-reset" data-act="reset"><span class="a11y-ico" aria-hidden="true">↺</span>איפוס הגדרות</button>' +

      '<a class="a11y-item a11y-statement" href="accessibility-statement.html">הצהרת נגישות</a>' +

      '<p class="a11y-note">הכלי הוא אמצעי סיוע בלבד. האתר מונגש בהתאם לתקן ישראלי ת״י 5568 ולרמה AA של WCAG 2.0.</p>';
    document.body.appendChild(panel);

    /* ── References ── */
    var closeBtn = panel.querySelector('#a11yClose');
    var toggleBtns = panel.querySelectorAll('[data-toggle]');
    var lastFocused = null;

    /* Reflect state on the toggle buttons */
    function syncUI() {
      toggleBtns.forEach(function (btn) {
        btn.setAttribute('aria-pressed', state[btn.getAttribute('data-toggle')] ? 'true' : 'false');
      });
    }
    syncUI();

    /* ── Actions ── */
    function setFont(delta) {
      state.fontStep = Math.max(FONT_MIN, Math.min(FONT_MAX, state.fontStep + delta));
      apply(); save();
    }
    function reset() {
      state = Object.assign({}, DEFAULTS);
      apply(); save(); syncUI();
    }

    panel.addEventListener('click', function (e) {
      var t = e.target.closest('[data-act], [data-toggle]');
      if (!t) return;
      var act = t.getAttribute('data-act');
      if (act === 'inc') return setFont(1);
      if (act === 'dec') return setFont(-1);
      if (act === 'reset') return reset();
      var key = t.getAttribute('data-toggle');
      if (key) {
        state[key] = !state[key];
        apply(); save();
        t.setAttribute('aria-pressed', state[key] ? 'true' : 'false');
      }
    });

    /* ── Open / close + keyboard handling ── */
    function focusables() {
      return Array.prototype.slice.call(
        panel.querySelectorAll('button, a[href], input, [tabindex]:not([tabindex="-1"])')
      ).filter(function (el) { return !el.disabled && el.offsetParent !== null; });
    }

    function onKeydown(e) {
      if (e.key === 'Escape') { e.preventDefault(); closePanel(); return; }
      if (e.key === 'Tab') {
        var f = focusables();
        if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }
    function onOutside(e) {
      if (!panel.contains(e.target) && e.target !== fab && !fab.contains(e.target)) closePanel();
    }

    function openPanel() {
      panel.hidden = false;
      fab.setAttribute('aria-expanded', 'true');
      lastFocused = document.activeElement;
      closeBtn.focus();
      document.addEventListener('keydown', onKeydown, true);
      document.addEventListener('mousedown', onOutside, true);
    }
    function closePanel() {
      panel.hidden = true;
      fab.setAttribute('aria-expanded', 'false');
      document.removeEventListener('keydown', onKeydown, true);
      document.removeEventListener('mousedown', onOutside, true);
      if (lastFocused && lastFocused.focus) lastFocused.focus(); else fab.focus();
    }

    fab.addEventListener('click', function () {
      if (panel.hidden) openPanel(); else closePanel();
    });
    closeBtn.addEventListener('click', closePanel);
  });
})();
