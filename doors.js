/* Grouse & Company — a pair of painted, raised-and-fielded doors drawn on canvas, lit from the upper left. */
function GrouseDoors(leafL, leafR) {
  var rnd = (function () { var s = 7; return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; })();
  function poly(x, pts, fill) { x.beginPath(); x.moveTo(pts[0], pts[1]); for (var i = 2; i < pts.length; i += 2) x.lineTo(pts[i], pts[i + 1]); x.closePath(); x.fillStyle = fill; x.fill(); }
  function lin(x, x0, y0, x1, y1, a, b) { var g = x.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, a); g.addColorStop(1, b); return g; }
  var L = 'rgba(255,236,200,', D = 'rgba(0,0,0,';

  function panel(x, px, py, pw, ph) {
    var s = Math.min(pw, ph), m = Math.max(9, Math.min(18, s * .05)), b = Math.max(18, Math.min(48, s * .11));
    // ovolo moulding stuck around the opening
    poly(x, [px, py, px + pw, py, px + pw - m, py + m, px + m, py + m], lin(x, 0, py, 0, py + m, D + '.55)', L + '.10)'));
    poly(x, [px, py, px + m, py + m, px + m, py + ph - m, px, py + ph], lin(x, px, 0, px + m, 0, D + '.42)', L + '.07)'));
    poly(x, [px, py + ph, px + m, py + ph - m, px + pw - m, py + ph - m, px + pw, py + ph], lin(x, 0, py + ph, 0, py + ph - m, L + '.16)', D + '.18)'));
    poly(x, [px + pw, py, px + pw, py + ph, px + pw - m, py + ph - m, px + pw - m, py + m], lin(x, px + pw, 0, px + pw - m, 0, L + '.08)', D + '.22)'));
    // raised field and its bevels
    var ix = px + m, iy = py + m, iw = pw - 2 * m, ih = ph - 2 * m;
    poly(x, [ix, iy, ix + iw, iy, ix + iw - b, iy + b, ix + b, iy + b], L + '.085)');
    poly(x, [ix, iy, ix + b, iy + b, ix + b, iy + ih - b, ix, iy + ih], L + '.045)');
    poly(x, [ix, iy + ih, ix + b, iy + ih - b, ix + iw - b, iy + ih - b, ix + iw, iy + ih], D + '.24)');
    poly(x, [ix + iw, iy, ix + iw, iy + ih, ix + iw - b, iy + ih - b, ix + iw - b, iy + b], D + '.15)');
    var fx = ix + b, fy = iy + b, fw = iw - 2 * b, fh = ih - 2 * b;
    x.fillStyle = lin(x, fx, fy, fx + fw, fy + fh, L + '.05)', D + '.06)'); x.fillRect(fx, fy, fw, fh);
    x.lineWidth = 1;
    x.strokeStyle = L + '.20)'; x.beginPath(); x.moveTo(fx, fy + fh); x.lineTo(fx, fy); x.lineTo(fx + fw, fy); x.stroke();
    x.strokeStyle = D + '.35)'; x.beginPath(); x.moveTo(fx + fw, fy); x.lineTo(fx + fw, fy + fh); x.lineTo(fx, fy + fh); x.stroke();
    x.strokeStyle = D + '.14)'; x.beginPath();
    x.moveTo(ix, iy); x.lineTo(fx, fy); x.moveTo(ix + iw, iy); x.lineTo(fx + fw, fy); x.moveTo(ix, iy + ih); x.lineTo(fx, fy + fh); x.moveTo(ix + iw, iy + ih); x.lineTo(fx + fw, fy + fh); x.stroke();
    x.strokeStyle = D + '.55)'; x.beginPath(); x.moveTo(px, py + ph); x.lineTo(px, py); x.lineTo(px + pw, py); x.stroke();
    x.strokeStyle = L + '.12)'; x.beginPath(); x.moveTo(px + pw, py); x.lineTo(px + pw, py + ph); x.lineTo(px, py + ph); x.stroke();
  }

  function knob(x, cx, cy, r) {
    var sh = x.createRadialGradient(cx + r * .6, cy + r * .9, 0, cx + r * .6, cy + r * .9, r * 2.4);
    sh.addColorStop(0, D + '.5)'); sh.addColorStop(1, D + '0)');
    x.fillStyle = sh; x.beginPath(); x.arc(cx + r * .6, cy + r * .9, r * 2.4, 0, 6.283); x.fill();
    var rose = x.createRadialGradient(cx - r * .3, cy - r * .3, 0, cx, cy, r * 1.45);
    rose.addColorStop(0, '#c9a566'); rose.addColorStop(.7, '#8b6b3a'); rose.addColorStop(1, '#4a3820');
    x.fillStyle = rose; x.beginPath(); x.arc(cx, cy, r * 1.4, 0, 6.283); x.fill();
    var k = x.createRadialGradient(cx - r * .38, cy - r * .42, r * .05, cx, cy, r);
    k.addColorStop(0, '#f6e4b6'); k.addColorStop(.3, '#d3b072'); k.addColorStop(.72, '#8e6d3a'); k.addColorStop(1, '#3f2f19');
    x.fillStyle = k; x.beginPath(); x.arc(cx, cy, r, 0, 6.283); x.fill();
    x.fillStyle = 'rgba(255,250,235,.55)'; x.beginPath(); x.ellipse(cx - r * .35, cy - r * .4, r * .22, r * .14, -.6, 0, 6.283); x.fill();
  }

  function paint(leaf, side) {
    var cv = leaf.querySelector('canvas'), W = innerWidth, H = Math.max(innerHeight, 560);
    var w = Math.ceil(W / 2), Ht = Math.round(Math.max(H * 1.18, w * 2.15)), dpr = Math.min(2, devicePixelRatio || 1);
    var lockY = Ht * .56;
    cv.width = Math.round(w * dpr); cv.height = Math.round(Ht * dpr); cv.style.height = Ht + 'px';
    cv.style.top = Math.round(H * .58 - lockY) + 'px';
    var x = cv.getContext('2d'); x.setTransform(dpr, 0, 0, dpr, 0, 0);
    x.fillStyle = lin(x, 0, 0, 0, Ht, '#454c35', '#2b3120'); x.fillRect(0, 0, w, Ht);
    var g0 = side === 'l' ? 0 : -w;
    x.fillStyle = lin(x, g0, 0, g0 + 2 * w, 0, L + '.11)', D + '.22)'); x.fillRect(0, 0, w, Ht);

    var st = w * .16, tr = Ht * .07, lr = Ht * .075, br = Ht * .11;
    var up = [st, tr, w - 2 * st, lockY - lr / 2 - tr], lo = [st, lockY + lr / 2, w - 2 * st, Ht - br - (lockY + lr / 2)];
    // brushed paint: strokes follow the grain of each member
    var n = Math.round(w * Ht / 38);
    for (var i = 0; i < n; i++) {
      var rx = rnd() * w, ry = rnd() * Ht, len = 10 + rnd() * 46, lt = rnd() < .5;
      x.fillStyle = lt ? L + (.012 + rnd() * .02) + ')' : D + (.02 + rnd() * .035) + ')';
      var inRail = rx > st && rx < w - st && (ry < tr || (ry > lockY - lr / 2 && ry < lockY + lr / 2) || ry > Ht - br);
      if (inRail) x.fillRect(rx, ry, len, 1); else x.fillRect(rx, ry, 1, len);
    }
    // hairline joints where rails meet stiles
    x.fillStyle = D + '.22)';
    [[0, tr], [lockY - lr / 2, lockY + lr / 2], [Ht - br, Ht]].forEach(function (b) { x.fillRect(st, b[0], 1, b[1] - b[0]); x.fillRect(w - st, b[0], 1, b[1] - b[0]); });
    panel(x, up[0], up[1], up[2], up[3]);
    panel(x, lo[0], lo[1], lo[2], lo[3]);
    // meeting edge and outer edge
    if (side === 'l') {
      x.fillStyle = D + '.7)'; x.fillRect(w - 2, 0, 2, Ht); x.fillStyle = L + '.07)'; x.fillRect(w - 4, 0, 1, Ht);
      x.fillStyle = lin(x, 0, 0, 40, 0, D + '.35)', D + '0)'); x.fillRect(0, 0, 40, Ht);
    } else {
      x.fillStyle = D + '.55)'; x.fillRect(0, 0, 1, Ht); x.fillStyle = L + '.10)'; x.fillRect(1, 0, 1, Ht);
      x.fillStyle = lin(x, w, 0, w - 40, 0, D + '.4)', D + '0)'); x.fillRect(w - 40, 0, 40, Ht);
    }
    knob(x, side === 'l' ? w - st * .5 : st * .5, lockY, Math.max(9, Math.min(15, w * .019)));
    // falloff top and bottom
    var vt = (H * .58 - lockY) * -1;
    x.fillStyle = lin(x, 0, vt, 0, vt + H * .3, D + '.32)', D + '0)'); x.fillRect(0, vt, w, H * .3);
    x.fillStyle = lin(x, 0, vt + H, 0, vt + H * .65, D + '.45)', D + '0)'); x.fillRect(0, vt + H * .65, w, H * .35);
  }

  var shL = leafL.querySelector('.shade'), shR = leafR.querySelector('.shade'), last = 0;
  function draw() { paint(leafL, 'l'); paint(leafR, 'r'); }
  draw();
  var t; addEventListener('resize', function () { clearTimeout(t); t = setTimeout(draw, 150); });
  return {
    open: function (o) {
      last = o; var a = 84 * o;
      leafL.style.transform = 'rotateY(' + a + 'deg)';
      leafR.style.transform = 'rotateY(' + (-a) + 'deg)';
      shL.style.opacity = shR.style.opacity = (o * .62).toFixed(3);
    }
  };
}
