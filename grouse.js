/* Grouse & Company — shared motion for the round-two directions.
   Every scroll-linked piece reads one smoothed scroll value so movement settles gently rather than snapping. */
(function () {
  var rm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var G = window.G = { rm: rm, subs: [], sy: scrollY, off: 0 };
  document.documentElement.classList.add('js');
  function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }
  G.clamp = clamp;
  G.ease = function (t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  G.on = function (fn) { G.subs.push(fn); };

  var running = false;
  function frame() {
    var d = scrollY - G.sy;
    G.sy = rm ? scrollY : G.sy + d * 0.13;
    if (Math.abs(scrollY - G.sy) < 0.4) G.sy = scrollY;
    G.off = scrollY - G.sy;
    for (var i = 0; i < G.subs.length; i++) G.subs[i](G.off);
    if (G.sy !== scrollY) requestAnimationFrame(frame); else running = false;
  }
  G.kick = function () { if (!running) { running = true; requestAnimationFrame(frame); } };
  addEventListener('scroll', G.kick, { passive: true });
  addEventListener('resize', function () { G.sy = scrollY; G.kick(); });

  /* progress through a tall pinned section (0 at its top, 1 when its bottom meets the viewport bottom) */
  G.pin = function (el, off) {
    var r = el.getBoundingClientRect(), span = el.offsetHeight - innerHeight;
    return span > 0 ? clamp(-(r.top + off) / span, 0, 1) : 1;
  };
  /* 0 when the element's top sits at a*viewport, 1 when it reaches b*viewport */
  G.enter = function (el, off, a, b) {
    var t = el.getBoundingClientRect().top + off;
    return clamp((a * innerHeight - t) / ((a - b) * innerHeight), 0, 1);
  };

  /* ---------- storey rod: millimetres on the homepage, years on the British Interior page ---------- */
  G.rod = function (opts) {
    var rod = document.querySelector('.rod'); if (!rod) return;
    opts = opts || {};
    var svg = rod.querySelector('svg'), mk = rod.querySelector('.rmark'), val = rod.querySelector('.rv'), unit = rod.querySelector('.ru');
    var from = opts.from || 0, to = opts.to || 2400, step = opts.major || 500, minor = opts.minor || 50, years = !!opts.year;
    var NS = 'http://www.w3.org/2000/svg';
    function ticks() {
      var h = innerHeight, w = rod.clientWidth, pad = 14;
      svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      for (var v = from; v <= to + 0.001; v += minor) {
        var y = pad + (h - 2 * pad) * (v - from) / (to - from), maj = Math.abs((v - from) % step) < 0.001, mid = Math.abs((v - from) % (step / 2)) < 0.001;
        var l = maj ? w * .5 : mid ? w * .32 : w * .18;
        var ln = document.createElementNS(NS, 'line');
        ln.setAttribute('x1', w - l); ln.setAttribute('x2', w); ln.setAttribute('y1', y); ln.setAttribute('y2', y);
        ln.setAttribute('class', maj ? 'maj' : 'min'); svg.appendChild(ln);
        if (maj && v > from && v < to) {
          var t = document.createElementNS(NS, 'text'); t.setAttribute('x', 4); t.setAttribute('y', y + 3); t.textContent = years ? v : v; svg.appendChild(t);
        }
      }
    }
    ticks(); addEventListener('resize', ticks);
    var hero = opts.hero ? document.querySelector(opts.hero) : null;
    G.on(function (off) {
      var v, h = innerHeight, pad = 14;
      if (years && G.yearNow) v = G.yearNow(off);
      else { var max = document.documentElement.scrollHeight - h; v = from + (to - from) * clamp(max > 0 ? G.sy / max : 0, 0, 1); }
      if (v == null) v = from;
      var y = pad + (h - 2 * pad) * clamp((v - from) / (to - from), 0, 1);
      mk.style.transform = 'translateY(' + y + 'px)';
      mk.classList.toggle('low', y > h - 70);
      val.textContent = years ? Math.round(v) : Math.round(v).toLocaleString('en-GB');
      unit.textContent = years ? (opts.label ? opts.label(v) : 'AD') : 'mm';
      if (hero) { var hp = clamp((G.sy - (hero.offsetTop + hero.offsetHeight - h * 1.3)) / (h * .3), 0, 1); rod.style.opacity = hp; }
    });
  };

  /* ---------- film montage placeholder: crossfading stills with slow push-in and film grain ---------- */
  G.montage = function (root) {
    var shots = root.querySelectorAll('.shot'), cap = root.querySelector('.mcap'), no = root.querySelector('.mno'), i = 0;
    function show(k) {
      shots.forEach(function (s, j) { s.classList.toggle('on', j === k); });
      if (cap) cap.textContent = shots[k].getAttribute('data-cap');
      if (no) no.textContent = 'Shot ' + (k + 1) + ' of ' + shots.length;
    }
    show(0);
    if (!rm) setInterval(function () { i = (i + 1) % shots.length; show(i); }, 3600);
    var g = root.querySelector('.grain');
    if (g) {
      var c = document.createElement('canvas'); c.width = c.height = 160; var x = c.getContext('2d'), d = x.createImageData(160, 160);
      for (var p = 0; p < d.data.length; p += 4) { var n = Math.random() * 255; d.data[p] = d.data[p + 1] = d.data[p + 2] = n; d.data[p + 3] = 26; }
      x.putImageData(d, 0, 0); g.style.backgroundImage = 'url(' + c.toDataURL() + ')';
    }
  };

  /* ---------- the five systems: pinned list, image changes as you scroll ---------- */
  G.systems = function (sec) {
    var items = sec.querySelectorAll('[data-sys]'), imgs = sec.querySelectorAll('.sysimg img'), caps = sec.querySelectorAll('.syscap'), n = items.length, cur = -1;
    var count = sec.querySelector('.syscount');
    function set(k) {
      if (k === cur) return; cur = k;
      items.forEach(function (it, j) { it.classList.toggle('on', j === k); it.setAttribute('aria-pressed', j === k ? 'true' : 'false'); });
      imgs.forEach(function (m, j) { m.classList.toggle('on', j === k); });
      caps.forEach(function (m, j) { m.hidden = j !== k; });
      if (count) count.textContent = (k + 1) + ' / ' + n;
    }
    G.on(function (off) { var p = G.pin(sec, off); set(Math.min(n - 1, Math.floor(p * n))); });
    items.forEach(function (it, j) {
      it.addEventListener('click', function () {
        var top = sec.getBoundingClientRect().top + scrollY, span = sec.offsetHeight - innerHeight;
        scrollTo({ top: top + span * (j + .5) / n, behavior: rm ? 'auto' : 'smooth' });
      });
    });
    set(0);
  };

  function prepDash(scope) {
    scope.querySelectorAll('path,rect,line,polyline').forEach(function (p) {
      if (p.hasAttribute('data-keep')) return;
      p.setAttribute('pathLength', '1'); p.style.strokeDasharray = '1'; p.style.strokeDashoffset = rm ? 0 : 1;
    });
  }

  /* ---------- wardrobe: surveyed, detailed, specified and fitted as you scroll ---------- */
  G.build = function (root) {
    var groups = root.querySelectorAll('[data-s]'), steps = root.querySelectorAll('.step'), rev = root.querySelector('[data-rev]'), doors = root.querySelectorAll('.door');
    var revs = ['A · survey', 'B · detail', 'C · specify', 'D · as fitted'];
    groups.forEach(prepDash);
    G.on(function (off) {
      var p = rm ? 1 : G.pin(root, off), st = Math.min(3, Math.floor(p * 4.0001));
      groups.forEach(function (g, i) {
        var t = clamp((p * 4 - i) * 1.5, 0, 1);
        g.querySelectorAll('[pathLength]').forEach(function (el) { el.style.strokeDashoffset = 1 - t; });
        g.querySelectorAll('text,circle').forEach(function (el) { el.style.opacity = t > .75 ? 1 : 0; });
      });
      var paint = clamp((p - .8) / .15, 0, 1);
      doors.forEach(function (d) { d.style.fillOpacity = paint; });
      steps.forEach(function (s, i) { s.classList.toggle('on', i === st || rm); });
      if (rev) rev.textContent = revs[st];
    });
  };

  /* ---------- Georgian panel set out from a square and its diagonal ---------- */
  G.construct = function (svg, list) {
    var groups = ['s1', 's2', 's3', 's4'], steps = list ? list.querySelectorAll('li') : [];
    prepDash(svg);
    svg.querySelectorAll('text').forEach(function (t) { t.style.transition = 'opacity .5s'; });
    G.on(function (off) {
      var p = rm ? 1 : G.enter(svg, off, .92, .2);
      groups.forEach(function (g, i) {
        var t = clamp(p * 4 - i, 0, 1);
        svg.querySelectorAll('.' + g).forEach(function (el) { el.style.strokeDashoffset = 1 - t; });
        if (steps[i]) steps[i].classList.toggle('on', t > .05);
      });
      svg.querySelectorAll('text').forEach(function (t) { t.style.opacity = p > .5 ? 1 : 0; });
    });
  };

  /* ---------- line drawings that draw once on entering view (moulding profiles, frames) ---------- */
  G.draws = function () {
    var els = document.querySelectorAll('[data-draw]');
    els.forEach(prepDash);
    if (rm) { els.forEach(function (e) { e.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target; el.classList.add('in');
        el.querySelectorAll('[pathLength]').forEach(function (p, i) {
          p.style.transition = 'stroke-dashoffset 1.6s cubic-bezier(.6,.05,.2,1) ' + (i * .12) + 's';
          p.style.strokeDashoffset = 0;
        });
        io.unobserve(el);
      });
    }, { threshold: .35 });
    els.forEach(function (e) { io.observe(e); });
  };

  G.form = function (id) {
    var f = document.getElementById(id); if (!f) return;
    f.addEventListener('submit', function (e) { e.preventDefault(); var t = f.querySelector('.thanks'); if (t) t.hidden = false; });
    var pro = f.querySelector('.pro');
    if (pro) f.querySelectorAll('[name=role]').forEach(function (r) { r.addEventListener('change', function () { if (r.checked) pro.hidden = r.value === 'homeowner'; }); });
  };

  G.start = function () { G.subs.forEach(function (f) { f(0); }); };
})();
