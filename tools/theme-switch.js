/* ==========================================================================
   theme-switch.js — TEMPORARY REVIEW TOOL, NOT FOR PRODUCTION

   Adds a floating picker so a theme can be chosen by eye on a real page.
   It is loaded from index.html by ONE line, tagged `data-review-tool`. When a
   theme is chosen, delete this file, drop that line, and set the winning
   tokens as the default in :root.

   It also honours ?theme=slate for screenshotting, and remembers the choice
   in localStorage so a reload doesn't reset it.
   ========================================================================== */
(function () {
  'use strict';

  var THEMES = [
    { id: '',       name: 'Midnight',  note: 'current — near-black' },
    { id: 'slate',  name: 'Slate',     note: 'softer dark' },
    { id: 'ink',    name: 'Ink',       note: 'deep navy' },
    { id: 'paper',  name: 'Paper',     note: 'warm light' },
    { id: 'snow',   name: 'Snow',      note: 'cool light' }
  ];

  var KEY = 'wz-theme';
  var root = document.documentElement;

  function apply(id) {
    if (id) root.setAttribute('data-theme', id);
    else root.removeAttribute('data-theme');
    try { localStorage.setItem(KEY, id); } catch (e) {}
    paint();
  }

  var fromUrl = (location.search.match(/[?&]theme=([a-z]*)/) || [])[1];
  var stored = null;
  try { stored = localStorage.getItem(KEY); } catch (e) {}
  apply(fromUrl !== undefined ? fromUrl : (stored || ''));

  var css = document.createElement('style');
  css.textContent = [
    '.tsw{position:fixed;right:16px;bottom:16px;z-index:9999;font:500 12px/1.3 ui-sans-serif,system-ui,sans-serif}',
    '.tsw__panel{display:grid;gap:2px;padding:6px;border-radius:12px;',
    '  background:rgba(18,18,22,.92);border:1px solid rgba(255,255,255,.14);',
    '  box-shadow:0 18px 44px -14px rgba(0,0,0,.7);backdrop-filter:blur(10px)}',
    '.tsw__b{display:flex;align-items:baseline;gap:8px;padding:8px 12px;border:0;border-radius:8px;',
    '  background:none;color:rgba(246,246,248,.66);cursor:pointer;text-align:left;white-space:nowrap}',
    '.tsw__b:hover{background:rgba(255,255,255,.07);color:#fff}',
    '.tsw__b[aria-pressed="true"]{background:rgba(124,134,255,.24);color:#fff}',
    '.tsw__b em{font-style:normal;font-size:10px;opacity:.6}',
    '.tsw__h{padding:4px 12px 6px;font-size:10px;letter-spacing:.08em;text-transform:uppercase;',
    '  color:rgba(246,246,248,.42)}',
    '.tsw__x{position:absolute;top:-9px;right:-9px;width:20px;height:20px;border-radius:50%;',
    '  border:1px solid rgba(255,255,255,.18);background:#15151a;color:#fff;cursor:pointer;font-size:11px;line-height:1}'
  ].join('');
  document.head.appendChild(css);

  var wrap = document.createElement('div');
  wrap.className = 'tsw';
  wrap.innerHTML = '<div class="tsw__panel"><p class="tsw__h">Background theme</p></div>' +
                   '<button class="tsw__x" type="button" title="Hide">×</button>';
  var panel = wrap.firstChild;

  THEMES.forEach(function (t) {
    var b = document.createElement('button');
    b.className = 'tsw__b';
    b.type = 'button';
    b.dataset.theme = t.id;
    b.innerHTML = t.name + ' <em>' + t.note + '</em>';
    b.addEventListener('click', function () { apply(t.id); });
    panel.appendChild(b);
  });

  wrap.querySelector('.tsw__x').addEventListener('click', function () { wrap.remove(); });

  function paint() {
    var cur = root.getAttribute('data-theme') || '';
    Array.prototype.forEach.call(wrap.querySelectorAll('.tsw__b'), function (b) {
      b.setAttribute('aria-pressed', String(b.dataset.theme === cur));
    });
  }

  function mount() { document.body.appendChild(wrap); paint(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
