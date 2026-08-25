/* ==========================================================================
   main.js — shared by all four pages:
     /  ·  /what-we-build/  ·  /security/  ·  /audit/

   Every block guards for a missing element, because no page has all of them.
   ========================================================================== */
(function () {
  'use strict';

  var CONTACT_EMAIL = 'hello@wheelz365.com';

  var $  = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  document.documentElement.classList.add('js');

  /* ------------------------------ nav ------------------------------ */
  var nav = $('#nav');
  if (nav) {
    var onScroll = function () {
      nav.classList.toggle('is-stuck', window.scrollY > 12);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  var toggle = $('.nav__toggle');
  var mobileMenu = $('#mobile-menu');
  if (toggle && mobileMenu) {
    toggle.addEventListener('click', function () {
      var open = mobileMenu.hidden;
      mobileMenu.hidden = !open;
      toggle.setAttribute('aria-expanded', String(open));
    });
    $$('a', mobileMenu).forEach(function (a) {
      a.addEventListener('click', function () {
        mobileMenu.hidden = true;
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ------------------------------ legacy anchors ------------------------------
     The old single-page site linked to #early-access, #how, #why and friends,
     and those URLs are out in the world. GitHub Pages is static so it cannot
     301 them; remapping the hash on load is the next best thing.
     -------------------------------------------------------------------------- */
  var LEGACY_ANCHORS = {
    '#early-access': '#audit-cta',
    '#proof':        '#audit-cta',
    '#how':          '#how-we-work',
    '#why':          '#problem',
    '#integrations': '#security',
    '#compare':      '#faq',
    '#team':         '#ownership'
  };

  (function remapLegacyAnchor() {
    var target = LEGACY_ANCHORS[window.location.hash];
    if (!target) return;
    var el = $(target);
    if (!el) return;
    // replaceState so the back button doesn't bounce between the two hashes
    window.history.replaceState(null, '', target);
    el.scrollIntoView({ block: 'start' });
  })();

  /* ------------------------------ tabs ------------------------------
     No auto-advance: a panel that rotates away mid-sentence is worse than no
     motion at all. User-driven only.

     The section heading stays put — each panel carries its own copy, so there
     is nothing to swap out from here.
     ------------------------------------------------------------------ */
  var tabs = $$('.tab');
  var panels = $$('.panel');
  var current = 0;

  function showTab(index) {
    current = (index + tabs.length) % tabs.length;

    tabs.forEach(function (tab, i) {
      var active = i === current;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
    });

    panels.forEach(function (panel, i) {
      panel.classList.toggle('is-active', i === current);
      panel.hidden = i !== current;
    });
  }

  if (tabs.length) {
    // ?tab=build deep-links a step
    var wanted = (window.location.search.match(/[?&]tab=([a-z]+)/) || [])[1];
    var wantedIndex = 0;
    tabs.forEach(function (tab, i) { if (tab.dataset.tab === wanted) wantedIndex = i; });
    showTab(wantedIndex);

    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () { showTab(i); });
      tab.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight') { showTab(current + 1); tabs[current].focus(); }
        if (e.key === 'ArrowLeft')  { showTab(current - 1); tabs[current].focus(); }
      });
    });
  }

  /* ------------------------------ accordion ------------------------------ */
  $$('.acc-item').forEach(function (item) {
    var head = $('.acc-item__head', item);
    if (!head) return;
    head.addEventListener('click', function () {
      var isOpen = item.classList.contains('is-open');
      var group = item.closest('.accordion') || document;
      $$('.acc-item', group).forEach(function (other) {
        other.classList.remove('is-open');
        var h = $('.acc-item__head', other);
        if (h) h.setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        item.classList.add('is-open');
        head.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ------------------------------ archetype flow preview ---------------------
     Six trigger→action flows are pre-rendered in the DOM; this only toggles
     which one is visible as you move across the cards. The cards stay ordinary
     links to their section on /what-we-build/ — the preview is enhancement, so
     with JS off the first flow shows and every card still navigates.
     -------------------------------------------------------------------------- */
  var archCards = $$('.arch[data-flow]');
  if (archCards.length) {
    var flowPanels = $$('[data-flow-panel]');

    var setFlow = function (key) {
      archCards.forEach(function (card) {
        card.classList.toggle('is-current', card.dataset.flow === key);
      });
      flowPanels.forEach(function (panel) {
        panel.hidden = panel.dataset.flowPanel !== key;
      });
    };

    archCards.forEach(function (card) {
      // hover and keyboard focus only — click is left alone so the link works
      card.addEventListener('mouseenter', function () { setFlow(card.dataset.flow); });
      card.addEventListener('focus', function () { setFlow(card.dataset.flow); });
    });
  }

  /* ------------------------------ reveal on scroll ------------------------------ */
  var revealables = $$('.reveal');
  var revealAll = function () {
    revealables.forEach(function (el) { el.classList.add('is-in'); });
  };

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry, i) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        window.setTimeout(function () { el.classList.add('is-in'); }, i * 60);
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    revealables.forEach(function (el) { io.observe(el); });
    // safety net: never leave content invisible if the observer misbehaves
    window.setTimeout(revealAll, 4000);
  } else {
    revealAll();
  }

  /* ------------------------------ audit form ------------------------------
     GitHub Pages is static and cannot receive a POST, so submitting hands the
     visitor's own mail client a pre-filled message. No honeypot and no rate
     limiting here on purpose: both are server-side concepts and would be pure
     theatre in front of a mailto: link.
     ------------------------------------------------------------------------ */
  var form = $('#audit-form');

  if (form) {
    var status = $('#form-status');
    var submitBtn = $('button[type="submit"]', form);

    var FREE_EMAIL = [
      'gmail.com', 'googlemail.com', 'yahoo.com', 'yahoo.co.in', 'hotmail.com',
      'outlook.com', 'live.com', 'aol.com', 'icloud.com', 'me.com',
      'proton.me', 'protonmail.com', 'rediffmail.com', 'zoho.com', 'yandex.com'
    ];

    // mailto: URLs get truncated by some clients well before the spec limit, so
    // each free-text answer is capped and the visitor is told to paste the rest.
    var TEXT_CAP = 600;

    var fieldOf = function (control) { return control.closest('.field'); };

    var noteOf = function (control) {
      var field = fieldOf(control);
      return field ? $('.field__note', field) : null;
    };

    var setNote = function (control, message, state) {
      var field = fieldOf(control);
      var note = noteOf(control);
      if (field) field.classList.toggle('has-error', state === 'err');
      if (!note) return;
      // a hint written into the HTML is the resting state; remember it once
      if (note.dataset.hint === undefined) note.dataset.hint = note.textContent;
      note.textContent = message || note.dataset.hint;
      note.classList.toggle('is-err', state === 'err');
      note.classList.toggle('is-warn', state === 'warn');
    };

    var validate = function (control) {
      if (control.type === 'hidden' || control.disabled) return true;

      if (!control.checkValidity()) {
        var msg = control.validity.valueMissing
          ? 'This one’s required.'
          : (control.validationMessage || 'Please check this field.');
        setNote(control, msg, 'err');
        return false;
      }

      // A work address gets us to the right conversation faster, but plenty of
      // real 20-person firms run on Gmail — so this warns, it doesn't block.
      if (control.type === 'email' && control.value) {
        var domain = control.value.split('@')[1];
        if (domain && FREE_EMAIL.indexOf(domain.toLowerCase()) !== -1) {
          setNote(control, 'A work address helps us prepare — but this is fine too.', 'warn');
          return true;
        }
      }

      setNote(control, '', null);
      return true;
    };

    var controls = $$('input, select, textarea', form);
    controls.forEach(function (control) {
      control.addEventListener('blur', function () { validate(control); });
      control.addEventListener('change', function () { validate(control); });
    });

    var say = function (msg, state) {
      if (!status) return;
      status.textContent = msg;
      status.classList.toggle('is-ok', state === 'ok');
      status.classList.toggle('is-err', state === 'err');
    };

    var labelFor = function (control) {
      var field = fieldOf(control);
      var label = field ? $('.field__label', field) : null;
      if (!label) return control.name.replace(/_/g, ' ');
      return label.textContent.replace(/\s*\*\s*$/, '').trim();
    };

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var firstBad = null;
      controls.forEach(function (control) {
        if (!validate(control) && !firstBad) firstBad = control;
      });

      if (firstBad) {
        firstBad.focus();
        say('A couple of fields need a look before this can go.', 'err');
        return;
      }

      var lines = [];
      var truncated = false;

      controls.forEach(function (control) {
        var value = (control.value || '').trim();
        if (!value) return;
        if (value.length > TEXT_CAP) {
          value = value.slice(0, TEXT_CAP) + '…';
          truncated = true;
        }
        lines.push(labelFor(control) + ':\n' + value);
      });

      if (truncated) {
        lines.push('[One or more answers were shortened to fit the email — ' +
                   'please paste the full text before sending.]');
      }

      var company = ($('[name="company"]', form) || {}).value || '';
      var subject = 'Pain-point audit request' + (company ? ' — ' + company.trim() : '');

      var href = 'mailto:' + CONTACT_EMAIL +
        '?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(lines.join('\n\n'));

      window.location.href = href;

      if (submitBtn) {
        // remember the original markup — textContent would eat the arrow
        if (submitBtn.dataset.label === undefined) submitBtn.dataset.label = submitBtn.innerHTML;
        submitBtn.textContent = 'Opening your email…';
        // put the button back so a second attempt is possible: if the handoff
        // silently failed, a permanently spinning button reads as broken
        window.setTimeout(function () { submitBtn.innerHTML = submitBtn.dataset.label; }, 4000);
      }

      say('Your email app should be opening with this filled in — send it and we’ll ' +
          'reply within one working day. If nothing opened, email ' + CONTACT_EMAIL + ' directly.', 'ok');
    });
  }

  /* ------------------------------ misc ------------------------------ */
  var year = $('#year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
