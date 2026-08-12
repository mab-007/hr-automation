/* ==========================================================================
   main.js — nav, tabs, accordion, stats carousel, reveals, early-access form.
   ========================================================================== */
(function () {
  'use strict';

  /* --------------------------------------------------------------------
     WHERE EARLY-ACCESS SIGNUPS GO
     GitHub Pages is static, so it cannot receive a form post by itself.
     Paste a Formspree / Getform / Google Apps Script endpoint below and the
     form will POST to it. Leave it empty and the form falls back to opening
     the visitor's mail client addressed to CONTACT_EMAIL.
     -------------------------------------------------------------------- */
  var FORM_ENDPOINT = '';
  var CONTACT_EMAIL = 'hello@wheelz365.com';

  var $  = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  document.documentElement.classList.add('js');

  /* ------------------------------ nav ------------------------------ */
  var nav = $('#nav');
  var onScroll = function () {
    nav.classList.toggle('is-stuck', window.scrollY > 12);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

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

  /* ------------------------------ tabs ------------------------------ */
  var TAB_TITLES = {
    connect:  'Import your people data, plug in attendance and<br class="br-lg"> your bank — in an afternoon.',
    automate: 'From a signed offer letter to salary in the bank,<br class="br-lg"> Wheelz365 runs the cycle for you.',
    approve:  'Only the exceptions reach you. Everything else<br class="br-lg"> is already reconciled.',
    pay:      'One click releases salaries, payslips, statutory<br class="br-lg"> challans and the journal entry.'
  };

  var tabs = $$('.tab');
  var panels = $$('.panel');
  var howTitle = $('#how-title');
  var pauseBtn = $('#tab-pause');
  var current = 0;
  var timer = 0;
  var playing = true;
  var CYCLE = 7000;

  function showTab(index, viaUser) {
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

    var key = tabs[current].dataset.tab;
    if (howTitle && TAB_TITLES[key]) howTitle.innerHTML = TAB_TITLES[key];
    if (viaUser) restartCycle();
  }

  function restartCycle() {
    window.clearInterval(timer);
    if (!playing) return;
    timer = window.setInterval(function () { showTab(current + 1); }, CYCLE);
  }

  if (tabs.length) {
    // keep the heading in sync with the active tab; ?tab=pay deep-links a step
    var wanted = (window.location.search.match(/[?&]tab=([a-z]+)/) || [])[1];
    var wantedIndex = 0;
    tabs.forEach(function (tab, i) { if (tab.dataset.tab === wanted) wantedIndex = i; });
    showTab(wantedIndex);

    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () { showTab(i, true); });
      tab.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight') { showTab(current + 1, true); tabs[current].focus(); }
        if (e.key === 'ArrowLeft')  { showTab(current - 1, true); tabs[current].focus(); }
      });
    });

    if (pauseBtn) {
      pauseBtn.addEventListener('click', function () {
        playing = !playing;
        pauseBtn.classList.toggle('is-playing', playing);
        pauseBtn.setAttribute('aria-label', playing ? 'Pause auto-advance' : 'Play auto-advance');
        playing ? restartCycle() : window.clearInterval(timer);
      });
    }

    // only auto-advance while the section is actually on screen
    var howSection = $('#how');
    if ('IntersectionObserver' in window && howSection) {
      new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) restartCycle();
        else window.clearInterval(timer);
      }, { threshold: 0.25 }).observe(howSection);
    } else {
      restartCycle();
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      playing = false;
      window.clearInterval(timer);
      if (pauseBtn) pauseBtn.classList.remove('is-playing');
    }
  }

  /* ------------------------------ accordion ------------------------------ */
  $$('.acc-item').forEach(function (item) {
    var head = $('.acc-item__head', item);
    head.addEventListener('click', function () {
      var isOpen = item.classList.contains('is-open');
      $$('.acc-item').forEach(function (other) {
        other.classList.remove('is-open');
        $('.acc-item__head', other).setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        item.classList.add('is-open');
        head.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ------------------------------ stats carousel ------------------------------ */
  var track = $('#stats-track');
  if (track) {
    var scrollByCard = function (dir) {
      var card = $('.stat-card', track);
      var amount = card ? card.getBoundingClientRect().width + 18 : 300;
      track.scrollBy({ left: amount * dir, behavior: 'smooth' });
    };
    var prev = $('[data-stats-prev]');
    var next = $('[data-stats-next]');
    if (prev) prev.addEventListener('click', function () { scrollByCard(-1); });
    if (next) next.addEventListener('click', function () { scrollByCard(1); });

    var syncArrows = function () {
      var max = track.scrollWidth - track.clientWidth - 2;
      if (prev) prev.disabled = track.scrollLeft <= 2;
      if (next) next.disabled = track.scrollLeft >= max;
    };
    syncArrows();
    track.addEventListener('scroll', syncArrows, { passive: true });
    window.addEventListener('resize', syncArrows);
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
        window.setTimeout(function () { el.classList.add('is-in'); }, i * 70);
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    revealables.forEach(function (el) { io.observe(el); });
    // safety net: never leave content invisible if the observer misbehaves
    window.setTimeout(revealAll, 4000);
  } else {
    revealAll();
  }

  /* ------------------------------ early-access form ------------------------------ */
  var form = $('#early-access-form');
  var status = $('#form-status');

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      var data = new FormData(form);
      var submit = $('button[type="submit"]', form);

      var say = function (msg, state) {
        status.textContent = msg;
        status.classList.toggle('is-ok', state === 'ok');
        status.classList.toggle('is-err', state === 'err');
      };

      var succeed = function () {
        form.reset();
        submit.disabled = false;
        submit.textContent = 'Get Early Access';
        say('Thanks — we’ll be in touch about early access shortly.', 'ok');
      };

      if (FORM_ENDPOINT) {
        submit.disabled = true;
        submit.textContent = 'Sending…';
        fetch(FORM_ENDPOINT, {
          method: 'POST',
          body: data,
          headers: { Accept: 'application/json' }
        }).then(function (res) {
          if (!res.ok) throw new Error('bad status');
          succeed();
        }).catch(function () {
          submit.disabled = false;
          submit.textContent = 'Get Early Access';
          say('Something went wrong. Email us at ' + CONTACT_EMAIL + ' instead.', 'err');
        });
        return;
      }

      // no endpoint configured — hand off to the visitor's mail client
      var lines = [];
      data.forEach(function (value, key) {
        if (value) lines.push(key.replace(/_/g, ' ') + ': ' + value);
      });
      var href = 'mailto:' + CONTACT_EMAIL +
        '?subject=' + encodeURIComponent('Wheelz365 early access request') +
        '&body=' + encodeURIComponent(lines.join('\n'));
      window.location.href = href;
      say('Opening your email app — send the message and we’ll take it from there.', 'ok');
    });
  }

  /* ------------------------------ misc ------------------------------ */
  var year = $('#year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
