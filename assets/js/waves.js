/* ==========================================================================
   waves.js — the iridescent hero backdrop.

   The field is one continuous surface, not a pile of independent squiggles:
   every strand shares the same harmonics and is only phase-sheared by its
   depth. That shear makes strands bunch into bright ridges and splay into
   dark valleys, which is what gives the silk / oil-slick look.
   No libraries, no image assets.
   ========================================================================== */
(function () {
  'use strict';

  var canvas = document.getElementById('wave-canvas');
  if (!canvas || !canvas.getContext) return;

  var ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) return;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* shared harmonics — amplitude and wavelength are fractions of the canvas */
  var HARMONICS = [
    { cycles: 1.15, amp: 0.118, shear: 2.60, speed: 0.050, phase: 0.4 },
    { cycles: 2.40, amp: 0.044, shear: 5.20, speed: -0.082, phase: 2.1 },
    { cycles: 4.60, amp: 0.018, shear: 9.00, speed: 0.128, phase: 4.7 },
    { cycles: 8.90, amp: 0.006, shear: 14.00, speed: -0.190, phase: 1.3 }
  ];

  var W = 0, H = 0, dpr = 1;
  /* wave height is tied to the narrower of the two axes, otherwise a tall
     phone viewport turns the gentle rolling field into steep spikes */
  var ampBase = 0;
  var strands = [];
  var running = false;
  var rafId = 0;
  var startedAt = 0;

  /* deterministic pseudo-random so every reload looks identical */
  function rand(seed) {
    var x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
    return x - Math.floor(x);
  }

  function buildStrands() {
    strands = [];

    var count = Math.round(Math.min(220, Math.max(80, W / 7.5)));
    var fieldTop = H * 0.30;
    var fieldBottom = H * 1.18;

    for (var i = 0; i < count; i++) {
      var t = i / (count - 1);
      var depth = Math.pow(t, 0.92);          // 0 = far, 1 = near the viewer

      var s = {
        depth: depth,
        baseY: fieldTop + (fieldBottom - fieldTop) * depth + (rand(i) - 0.5) * H * 0.008,
        gain: 0.30 + depth * 1.15,            // near strands swing wider
        width: 0.9 + depth * 2.7,
        alpha: 0.075 + depth * 0.30,
        crest: rand(i + 313) > 0.82,          // the white specular ridges
        bloom: i % 3 === 0,                   // soft wide underlay, gives the field mass
        speckle: depth > 0.32 && i % 5 === 0,
        grad: null
      };

      s.grad = makeGradient(i, depth, s.crest);
      strands.push(s);
    }
  }

  /* Every strand gets its own hue origin and sweeps through most of the wheel
     across the width — that is what makes a single ridge read as an oil slick
     rather than one flat colour. */
  function makeGradient(i, depth, crest) {
    var g = ctx.createLinearGradient(0, 0, W, 0);
    var base = rand(i + 211) * 360 + depth * 40;
    var stops = 6;

    for (var j = 0; j <= stops; j++) {
      var pos = j / stops;
      var hue = (base + j * 58 + Math.sin(j * 1.7 + i * 0.09) * 26) % 360;
      var light = 58 + Math.sin(j * 2.1 + i * 0.13) * 10;
      var color = crest && j % 2 === 0
        ? 'hsl(' + hue.toFixed(0) + ',55%,95%)'
        : 'hsl(' + hue.toFixed(0) + ',92%,' + light.toFixed(0) + '%)';
      g.addColorStop(pos, color);
    }
    return g;
  }

  function yAt(s, x, time) {
    var y = s.baseY;
    for (var h = 0; h < HARMONICS.length; h++) {
      var m = HARMONICS[h];
      y += ampBase * m.amp * s.gain *
        Math.sin((x / W) * Math.PI * 2 * m.cycles + m.phase + s.depth * m.shear + time * m.speed);
    }
    return y;
  }

  /* dark rolling hills behind the light field — keeps the top half heavy */
  function drawBackdrop(time) {
    var g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#040405');
    g.addColorStop(0.44, '#07070c');
    g.addColorStop(1, '#0b0713');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    var ridges = [
      { y: H * 0.26, a: H * 0.085, k: 1.3, p: 0.8, c: 'rgba(30,22,50,0.8)' },
      { y: H * 0.38, a: H * 0.065, k: 2.0, p: 2.4, c: 'rgba(16,24,46,0.85)' }
    ];

    for (var r = 0; r < ridges.length; r++) {
      var ridge = ridges[r];
      ctx.beginPath();
      ctx.moveTo(0, H);
      for (var x = 0; x <= W; x += 14) {
        ctx.lineTo(x, ridge.y + Math.sin((x / W) * Math.PI * 2 * ridge.k + ridge.p + time * 0.03) * ridge.a);
      }
      ctx.lineTo(W, H);
      ctx.closePath();
      ctx.fillStyle = ridge.c;
      ctx.fill();
    }
  }

  /* travelling light — the warm glow that drifts across the wave field */
  function drawSpecular(time) {
    var sweeps = [
      { x: (0.5 + Math.sin(time * 0.055) * 0.44) * W, y: H * 0.82, r: Math.min(W, H) * 0.70, c: 'rgba(255,214,152,0.30)' },
      { x: (0.5 + Math.cos(time * 0.037 + 1.6) * 0.48) * W, y: H * 0.66, r: Math.min(W, H) * 0.52, c: 'rgba(146,196,255,0.22)' }
    ];

    for (var i = 0; i < sweeps.length; i++) {
      var s = sweeps[i];
      var g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r);
      g.addColorStop(0, s.c);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    }
  }

  function drawStrands(time) {
    var step = W > 1300 ? 16 : 11;

    for (var i = 0; i < strands.length; i++) {
      var s = strands[i];

      ctx.beginPath();
      ctx.moveTo(0, yAt(s, 0, time));
      for (var x = step; x <= W; x += step) {
        ctx.lineTo(x, yAt(s, x, time));
      }

      // wide, dim underlay first — the filaments then sit on top of a glow
      if (s.bloom) {
        ctx.strokeStyle = s.grad;
        ctx.lineWidth = s.width * 9;
        ctx.globalAlpha = 0.018 + s.depth * 0.055;
        ctx.stroke();
      }

      ctx.strokeStyle = s.grad;
      ctx.lineWidth = s.width;
      ctx.globalAlpha = s.crest ? Math.min(0.6, s.alpha * 2.2) : s.alpha;

      if (s.crest) {
        ctx.shadowBlur = 26;
        ctx.shadowColor = 'rgba(255,245,225,0.5)';
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      // a hot white core down the middle of each specular ridge
      if (s.crest) {
        ctx.strokeStyle = 'rgba(255,252,244,0.75)';
        ctx.lineWidth = Math.max(0.6, s.width * 0.35);
        ctx.globalAlpha = 0.10 + s.depth * 0.24;
        ctx.stroke();
      }

      if (s.speckle) drawSpeckles(s, i, time);
    }
    ctx.globalAlpha = 1;
  }

  /* the fine glitter sitting on the near waves */
  function drawSpeckles(s, i, time) {
    var dots = 42;
    ctx.globalAlpha = 0.12 + s.depth * 0.42;
    ctx.fillStyle = 'hsl(' + ((s.depth * 150 + i * 9 + 190) % 360).toFixed(0) + ',70%,84%)';

    for (var d = 0; d < dots; d++) {
      var x = ((d / dots) + rand(i * 7 + d) * 0.024) * W;
      var y = yAt(s, x, time) + (rand(i * 13 + d) - 0.5) * s.width * 2.4;
      var r = 0.5 + rand(i * 17 + d) * 1.2;
      ctx.fillRect(x, y, r, r);
    }
  }

  function render(time) {
    drawBackdrop(time);
    ctx.globalCompositeOperation = 'lighter';
    drawSpecular(time);
    drawStrands(time);
    ctx.globalCompositeOperation = 'source-over';
  }

  function frame(now) {
    if (!startedAt) startedAt = now;
    render((now - startedAt) / 1000);
    rafId = window.requestAnimationFrame(frame);
  }

  function start() {
    if (running || reduceMotion) return;
    running = true;
    rafId = window.requestAnimationFrame(frame);
  }

  function stop() {
    running = false;
    if (rafId) window.cancelAnimationFrame(rafId);
    rafId = 0;
  }

  function resize() {
    var rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = Math.round(rect.width);
    H = Math.round(rect.height);
    ampBase = Math.min(H, W * 0.62);

    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    buildStrands();
    render(startedAt ? (performance.now() - startedAt) / 1000 : 6);
  }

  ctx.fillStyle = '#050506';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  resize();

  var resizeTimer = 0;
  window.addEventListener('resize', function () {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(resize, 160);
  });

  // don't burn frames when the hero has scrolled away
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      entries[0].isIntersecting ? start() : stop();
    }, { threshold: 0 }).observe(canvas);
  } else {
    start();
  }

  document.addEventListener('visibilitychange', function () {
    document.hidden ? stop() : start();
  });
})();
