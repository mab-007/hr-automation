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

  /* ------------------------------ nav ------------------------------
     A sentinel rather than a scroll listener. The old version ran a callback on
     every scroll event, on the same main thread the hero canvas is rendering on.
     This fires twice in the page's lifetime and cannot land mid-frame.
     ------------------------------------------------------------------ */
  var nav = $('#nav');
  if (nav) {
    if ('IntersectionObserver' in window) {
      var sentinel = document.createElement('div');
      sentinel.setAttribute('aria-hidden', 'true');
      sentinel.style.cssText =
        'position:absolute;top:0;left:0;width:1px;height:14px;pointer-events:none';
      document.body.prepend(sentinel);
      new IntersectionObserver(function (entries) {
        nav.classList.toggle('is-stuck', !entries[0].isIntersecting);
      }, { threshold: 0 }).observe(sentinel);
    } else {
      nav.classList.toggle('is-stuck', window.scrollY > 12);
      window.addEventListener('scroll', function () {
        nav.classList.toggle('is-stuck', window.scrollY > 12);
      }, { passive: true });
    }
  }

  var toggle = $('.nav__toggle');
  /* ---------------------- modal plumbing, shared ----------------------
     Both the menu overlay and the palette are modals. Each needs the same
     four things or it fails an accessibility audit: focus trapped inside,
     Escape to close, the page behind locked from scrolling, and focus
     returned to whatever opened it.
     -------------------------------------------------------------------- */
  var FOCUSABLE = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';
  var openModal = null;

  function lockScroll(on) {
    var b = document.body;
    if (on) {
      b.dataset.scrollY = String(window.scrollY);
      b.style.cssText += ';position:fixed;width:100%;top:' + -window.scrollY + 'px;';
    } else {
      var y = Number(b.dataset.scrollY || 0);
      b.style.position = ''; b.style.width = ''; b.style.top = '';
      window.scrollTo(0, y);
    }
  }

  function trap(e, container) {
    if (e.key !== 'Tab') return;
    var items = $$(FOCUSABLE, container).filter(function (el) { return el.offsetParent !== null; });
    if (!items.length) return;
    var first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  function makeModal(el, opener, onOpen) {
    var restoreTo = null;
    var api = {
      el: el,
      open: function () {
        if (openModal) openModal.close();
        restoreTo = document.activeElement;
        el.hidden = false;
        lockScroll(true);
        openModal = api;
        if (opener) opener.setAttribute('aria-expanded', 'true');
        // next frame, so the transition has a from-state to animate out of
        requestAnimationFrame(function () { el.classList.add('is-open'); });
        if (onOpen) onOpen();
      },
      close: function () {
        el.classList.remove('is-open');
        el.hidden = true;
        lockScroll(false);
        openModal = null;
        if (opener) opener.setAttribute('aria-expanded', 'false');
        if (restoreTo && restoreTo.focus) restoreTo.focus();
      },
      toggle: function () { el.hidden ? api.open() : api.close(); }
    };
    el.addEventListener('keydown', function (e) { trap(e, el); });
    return api;
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && openModal) { e.preventDefault(); openModal.close(); }
  });

  /* ------------------------------ overlay menu ------------------------------ */
  var overlayEl = $('#menu-overlay');
  if (toggle && overlayEl) {
    var menu = makeModal(overlayEl, toggle, function () {
      var first = $('a', overlayEl);
      if (first) first.focus();
    });
    toggle.addEventListener('click', menu.toggle);
    $$('a', overlayEl).forEach(function (a) {
      a.addEventListener('click', function () { menu.close(); });
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
    '#why':          '#problem',
    '#integrations': '#security',
    '#compare':      '#faq',
    '#team':         '#own',
    '#how-we-work':  '#how',      // renamed in the redesign
    '#what-we-build': '#build',
    '#ownership':    '#own',
    '#delivery':     '#own',
    '#who':          '#engagements',
    '#capabilities': '#problem'
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
  /* Generic tablist driver, shared by the phase tabs and the archetype picker.
     Panes are grid-stacked, so we never set .hidden — that would collapse the
     stack and reintroduce the layout shift it exists to prevent. `inert` keeps
     inactive panes out of the tab order; visibility:hidden keeps them out of
     the accessibility tree. */
  function wireTablist(triggers, panes, opts) {
    if (!triggers.length || !panes.length) return null;
    var cur = 0;
    var horizontal = !(opts && opts.vertical);

    function show(index) {
      cur = (index + triggers.length) % triggers.length;
      triggers.forEach(function (t, i) {
        var active = i === cur;
        t.classList.toggle('is-active', active);
        t.setAttribute('aria-selected', String(active));
        t.tabIndex = active ? 0 : -1;
      });
      panes.forEach(function (p, i) {
        var active = i === cur;
        p.classList.toggle('is-active', active);
        if (active) p.removeAttribute('inert');
        else p.setAttribute('inert', '');
      });
    }

    triggers.forEach(function (t, i) {
      // click covers mouse AND touch. The previous version listened only for
      // mouseenter, so on every phone the whole interaction was dead.
      t.addEventListener('click', function () { show(i); });
      t.addEventListener('keydown', function (e) {
        var next = horizontal ? 'ArrowRight' : 'ArrowDown';
        var prev = horizontal ? 'ArrowLeft' : 'ArrowUp';
        if (e.key === next) { e.preventDefault(); show(cur + 1); triggers[cur].focus(); }
        if (e.key === prev) { e.preventDefault(); show(cur - 1); triggers[cur].focus(); }
        if (e.key === 'Home') { e.preventDefault(); show(0); triggers[0].focus(); }
        if (e.key === 'End') { e.preventDefault(); show(triggers.length - 1); triggers[cur].focus(); }
      });
      // pointer hover is a nicety on top, never the only way in
      if (opts && opts.hover) {
        t.addEventListener('pointerenter', function (e) {
          if (e.pointerType === 'mouse') show(i);
        });
      }
    });

    show(0);
    return { show: show, triggers: triggers };
  }

  /* phase tabs */
  var phaseTabs = wireTablist($$('.tab'), $$('#how .stage__pane'), {});
  if (phaseTabs) {
    // ?tab=build still deep-links a phase
    var wanted = (window.location.search.match(/[?&]tab=([a-z-]+)/) || [])[1];
    phaseTabs.triggers.forEach(function (t, i) {
      if (t.dataset.tab === wanted) phaseTabs.show(i);
    });
  }

  /* archetype picker */
  wireTablist($$('.pick'), $$('#build .stage__pane'), { vertical: true, hover: true });

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

  /* ------------------------------ scroll progress + scrollspy ----------------
     One IntersectionObserver drives both. No scroll listener: the canvas is
     already using the main thread and a per-event handler would land mid-frame.
     -------------------------------------------------------------------------- */
  var progress = $('#nav-progress');
  var spyLinks = $$('[data-spy]');

  /* The progress bar prefers a CSS scroll() timeline — that runs on the
     compositor, off the main thread, which matters because the canvas is
     already using it. Only browsers without it get the rAF fallback, and even
     then the handler writes one compositor-friendly transform. */
  var CSS_SCROLL = window.CSS && CSS.supports && CSS.supports('animation-timeline', 'scroll()');

  if (progress && !CSS_SCROLL) {
    var ticking = false;
    var updateProgress = function () {
      ticking = false;
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var pct = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      progress.style.transform = 'scaleX(' + pct.toFixed(4) + ')';
    };
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(updateProgress); }
    }, { passive: true });
    updateProgress();
  }

  if (spyLinks.length && 'IntersectionObserver' in window) {
    var seen = {};
    var applySpy = function () {
      var best = null, bestRatio = 0;
      Object.keys(seen).forEach(function (id) {
        if (seen[id] > bestRatio) { bestRatio = seen[id]; best = id; }
      });
      spyLinks.forEach(function (a) {
        var on = bestRatio > 0.02 && a.dataset.spy === best;
        a.classList.toggle('is-current', on);
        if (on) a.setAttribute('aria-current', 'true');
        else a.removeAttribute('aria-current');
      });
    };

    var spyObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { seen[e.target.id] = e.intersectionRatio; });
      applySpy();
    }, { threshold: [0, 0.05, 0.25, 0.5, 0.75] });

    spyLinks.forEach(function (a) {
      var sec = document.getElementById(a.dataset.spy);
      if (sec) spyObserver.observe(sec);
    });
  }

  /* ------------------------------ ⌘K palette --------------------------------
     Keyboard-first navigation. Announced as a dialog, filters a static list,
     and never touches the network.
     -------------------------------------------------------------------------- */
  var palEl = $('#palette');
  if (palEl) {
    var palInput = $('#palette-input');
    var palList = $('#palette-list');
    var palOpener = $('#palette-open');

    var ITEMS = [
      { label: 'What we build',            hint: 'six automation patterns', href: '#build' },
      { label: 'How we work',              hint: 'six weeks, four phases',  href: '#how' },
      { label: 'Own the code',             hint: 'delivery modes',          href: '#own' },
      { label: 'Security',                 hint: 'data boundary',           href: '#security' },
      { label: 'Commercials',              hint: 'how engagements are structured', href: '#engagements' },
      { label: 'Questions',                hint: 'the usual four',          href: '#faq' },
      { label: 'Book an audit',            hint: '45 minutes, no obligation', href: 'audit/' },
      { label: 'Every automation, in detail', hint: 'page',                 href: 'what-we-build/' },
      { label: 'HR & hiring automation',   hint: 'featured use case',       href: 'what-we-build/#hiring' },
      { label: 'Security architecture',    hint: 'page',                    href: 'security/' },
      { label: 'Email us',                 hint: 'hello@wheelz365.com',     href: 'mailto:' + CONTACT_EMAIL }
    ];

    var filtered = ITEMS.slice();
    var sel = 0;

    function score(item, q) {
      var hay = (item.label + ' ' + item.hint).toLowerCase();
      if (!q) return 1;
      if (hay.indexOf(q) === 0) return 3;
      if (hay.indexOf(q) > -1) return 2;
      // loose subsequence, so "wwb" finds "What we build"
      var i = 0;
      for (var c = 0; c < hay.length && i < q.length; c++) if (hay[c] === q[i]) i++;
      return i === q.length ? 1 : 0;
    }

    function renderList() {
      palList.innerHTML = '';
      filtered.forEach(function (item, i) {
        var li = document.createElement('li');
        li.className = 'palette__item' + (i === sel ? ' is-sel' : '');
        li.id = 'pal-' + i;
        li.setAttribute('role', 'option');
        li.setAttribute('aria-selected', String(i === sel));
        li.innerHTML = '<span>' + item.label + '</span><em>' + item.hint + '</em>';
        li.addEventListener('click', function () { go(item); });
        li.addEventListener('pointerenter', function () { sel = i; paintSel(); });
        palList.appendChild(li);
      });
      palInput.setAttribute('aria-activedescendant', filtered.length ? 'pal-' + sel : '');
    }

    function paintSel() {
      $$('.palette__item', palList).forEach(function (li, i) {
        li.classList.toggle('is-sel', i === sel);
        li.setAttribute('aria-selected', String(i === sel));
      });
      palInput.setAttribute('aria-activedescendant', filtered.length ? 'pal-' + sel : '');
      var active = palList.children[sel];
      if (active && active.scrollIntoView) active.scrollIntoView({ block: 'nearest' });
    }

    function filter() {
      var q = palInput.value.trim().toLowerCase();
      filtered = ITEMS
        .map(function (it) { return { it: it, s: score(it, q) }; })
        .filter(function (r) { return r.s > 0; })
        .sort(function (a, b) { return b.s - a.s; })
        .map(function (r) { return r.it; });
      sel = 0;
      renderList();
    }

    var palette = makeModal(palEl, palOpener, function () {
      palInput.value = '';
      filter();
      palInput.focus();
    });

    function go(item) {
      palette.close();
      if (item.href.charAt(0) === '#') {
        var el = $(item.href);
        if (el) {
          history.replaceState(null, '', item.href);
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      } else {
        window.location.href = item.href;
      }
    }

    palInput.addEventListener('input', filter);
    palInput.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); sel = Math.min(sel + 1, filtered.length - 1); paintSel(); }
      if (e.key === 'ArrowUp')   { e.preventDefault(); sel = Math.max(sel - 1, 0); paintSel(); }
      if (e.key === 'Enter' && filtered[sel]) { e.preventDefault(); go(filtered[sel]); }
    });

    $$('[data-palette-close]', palEl).forEach(function (el) {
      el.addEventListener('click', palette.close);
    });
    if (palOpener) palOpener.addEventListener('click', palette.open);

    document.addEventListener('keydown', function (e) {
      var mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === 'k') { e.preventDefault(); palette.toggle(); return; }
      // bare "/" opens too, but not while the visitor is typing in a field
      var tag = (document.activeElement || {}).tagName;
      if (e.key === '/' && tag !== 'INPUT' && tag !== 'TEXTAREA' && tag !== 'SELECT') {
        e.preventDefault();
        palette.open();
      }
    });
  }

  /* ------------------------------ reveal on scroll ------------------------------ */
  var revealables = $$('.reveal');
  var revealAll = function () {
    revealables.forEach(function (el) { el.classList.add('is-in'); });
  };

  if ('IntersectionObserver' in window) {
    // stagger lives in CSS via --i, so no timer competes with the canvas rAF
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    revealables.forEach(function (el, i) {
      // index within its own group, so a long section doesn't stagger forever
      if (!el.style.getPropertyValue('--i')) el.style.setProperty('--i', String(i % 4));
      io.observe(el);
    });
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

  /* ------------------------------ pointer tilt -------------------------------
     Writes only --rx/--ry (angles on .app) and --mx/--my (a translate on the
     cursor light). All four are registered @property with inherits:false, so
     invalidation stops at the declaring element instead of walking .app's few
     hundred descendants. One layout read per hover session, taken on enter and
     re-taken lazily — never inside pointermove, which is the classic thrash.
     -------------------------------------------------------------------------- */
  if (document.documentElement.dataset.depth === 'full') {
    var TILT = 4;    // degrees at the extreme corner
    var LIFT = -5;   // px

    $$('.surface').forEach(function (surface) {
      var card = $('.app', surface) || $('.flow', surface);
      var cursor = $('.surface__cursor', surface);
      if (!card || !cursor) return;

      var rect = null, px = 0, py = 0, queued = false, releaseTimer = 0;

      function paint() {
        queued = false;
        if (!rect) rect = surface.getBoundingClientRect();
        var nx = (px - rect.left) / rect.width - 0.5;
        var ny = (py - rect.top) / rect.height - 0.5;
        card.style.setProperty('--ry', (nx * TILT * 2).toFixed(2) + 'deg');
        card.style.setProperty('--rx', (ny * -TILT * 2).toFixed(2) + 'deg');
        card.style.setProperty('--lz', LIFT + 'px');
        cursor.style.setProperty('--mx', (px - rect.left).toFixed(1) + 'px');
        cursor.style.setProperty('--my', (py - rect.top).toFixed(1) + 'px');
      }

      surface.addEventListener('pointerenter', function (e) {
        if (e.pointerType !== 'mouse') return;
        window.clearTimeout(releaseTimer);
        rect = surface.getBoundingClientRect();
        surface.classList.add('is-tracking');
        card.style.willChange = 'transform';
        cursor.style.willChange = 'transform';
        cursor.style.opacity = '1';
      }, { passive: true });

      surface.addEventListener('pointermove', function (e) {
        if (e.pointerType !== 'mouse') return;
        px = e.clientX; py = e.clientY;
        // pointermove can fire many times per frame; coalesce to one write
        if (!queued) { queued = true; requestAnimationFrame(paint); }
      }, { passive: true });

      surface.addEventListener('pointerleave', function () {
        surface.classList.remove('is-tracking');
        card.style.setProperty('--rx', '0deg');
        card.style.setProperty('--ry', '0deg');
        card.style.setProperty('--lz', '0px');
        cursor.style.opacity = '0';
        // release the compositor layers once the glide back has finished
        releaseTimer = window.setTimeout(function () {
          card.style.willChange = '';
          cursor.style.willChange = '';
        }, 520);
      }, { passive: true });

      window.addEventListener('resize', function () { rect = null; }, { passive: true });
      window.addEventListener('scroll', function () { rect = null; }, { passive: true });
    });
  }

  /* ------------------------------ misc ------------------------------ */
  var year = $('#year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
