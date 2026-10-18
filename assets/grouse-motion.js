/**
 * GROUSE & COMPANY — BRITISH JOINERY & INTERIORS
 * Bespoke Woodwork Geometry & Cinematic Workshop Motion Engine
 *
 * Provides:
 * 1. Three real-time HTML5 Canvas cinematic workshop motion loops:
 *    - 'varnish' : Warm hardwax oil / varnish sweep revealing English oak grain sheen
 *    - 'laser'   : Cinematic laser plumb & datum lines calibrating on period joinery
 *    - 'sawdust' : Gentle blow of golden oak sawdust drifting through workshop sunbeams
 * 2. Scroll-linked woodwork geometry animations:
 *    - Mortise & Tenon / Dovetail SVG joint assembly on scroll
 *    - Cockbead & 45° Mitre frame reveals
 *    - Live Plumb & Level Spirit Caliper tracking scroll depth
 *    - CAD-to-Craft X-Ray comparison slider
 */

(function () {
  'use strict';

  class WorkshopMotionPlayer {
    constructor(canvas, initialScene = 'laser') {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.scene = initialScene;
      this.time = 0;
      this.isPlaying = true;
      this.mouseX = 0.5;
      this.mouseY = 0.5;
      this.isHovering = false;
      this.puffTrigger = 0;

      // Load background stills if available
      this.images = {};
      const imgSources = {
        varnish: 'assets/workshop-varnish.png',
        laser: 'assets/workshop-laser.png',
        sawdust: 'assets/workshop-sawdust.png',
        fallbackVarnish: 'assets/detail-brass-handle-oak.jpg',
        fallbackLaser: 'assets/detail-cockbead-hinge.jpg',
        fallbackSawdust: 'assets/detail-timber-samples.jpg'
      };

      Object.keys(imgSources).forEach((key) => {
        const img = new Image();
        img.src = imgSources[key];
        img.onload = () => {
          this.images[key] = img;
        };
      });

      this.initParticles();
      this.bindEvents();
      this.resize();
      this.animate = this.animate.bind(this);
      requestAnimationFrame(this.animate);
    }

    initParticles() {
      // Sawdust particles for "Gentle blow of sawdust after a cut"
      this.sawdustParticles = Array.from({ length: 165 }, (_, i) => this.createSawdustParticle(true));
      // Ambient workshop motes for varnish & laser scenes
      this.ambientMotes = Array.from({ length: 55 }, () => ({
        x: Math.random(),
        y: Math.random(),
        r: Math.random() * 1.8 + 0.5,
        vx: (Math.random() - 0.5) * 0.0004,
        vy: -Math.random() * 0.0005 - 0.0001,
        alpha: Math.random() * 0.55 + 0.15,
        phase: Math.random() * Math.PI * 2
      }));
    }

    createSawdustParticle(randomAge = false) {
      const isBurst = Math.random() < 0.72;
      return {
        x: randomAge ? Math.random() : 0.18 + (Math.random() - 0.5) * 0.14,
        y: randomAge ? Math.random() : 0.68 + (Math.random() - 0.5) * 0.08,
        vx: (Math.random() * 0.0045 + 0.0018) * (isBurst ? 1.4 : 0.6),
        vy: -(Math.random() * 0.0038 + 0.0006) * (isBurst ? 1.3 : 0.5),
        size: Math.random() * 3.2 + 0.7,
        aspect: Math.random() * 2.2 + 1.0,
        angle: Math.random() * Math.PI * 2,
        vAngle: (Math.random() - 0.5) * 0.06,
        alpha: Math.random() * 0.75 + 0.2,
        life: randomAge ? Math.random() : 0,
        maxLife: Math.random() * 260 + 180,
        hue: 32 + Math.random() * 14
      };
    }

    triggerSawdustGust() {
      this.puffTrigger = 1.0;
      this.sawdustParticles.forEach((p, idx) => {
        if (idx % 2 === 0) {
          p.x = 0.15 + Math.random() * 0.25;
          p.y = 0.62 + Math.random() * 0.18;
          p.vx = Math.random() * 0.008 + 0.003;
          p.vy = -Math.random() * 0.006 - 0.001;
          p.life = 10;
        }
      });
    }

    bindEvents() {
      window.addEventListener('resize', () => this.resize());
      this.canvas.addEventListener('mousemove', (e) => {
        const rect = this.canvas.getBoundingClientRect();
        this.mouseX = (e.clientX - rect.left) / rect.width;
        this.mouseY = (e.clientY - rect.top) / rect.height;
        this.isHovering = true;
      });
      this.canvas.addEventListener('mouseleave', () => {
        this.isHovering = false;
      });
      this.canvas.addEventListener('click', () => {
        if (this.scene === 'sawdust') {
          this.triggerSawdustGust();
        }
      });
    }

    setScene(sceneName) {
      this.scene = sceneName;
      this.time = 0;
      if (sceneName === 'sawdust') {
        this.triggerSawdustGust();
      }
    }

    resize() {
      const rect = this.canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.width = Math.max(rect.width, 300);
      this.height = Math.max(rect.height, 220);
      this.canvas.width = this.width * dpr;
      this.canvas.height = this.height * dpr;
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    drawCoverImage(img, alpha = 1, scale = 1.0) {
      if (!img) return false;
      const ctx = this.ctx;
      const w = this.width;
      const h = this.height;
      const imgRatio = img.width / img.height;
      const canvasRatio = w / h;
      let drawW, drawH, offsetX, offsetY;

      if (imgRatio > canvasRatio) {
        drawH = h * scale;
        drawW = drawH * imgRatio;
      } else {
        drawW = w * scale;
        drawH = drawW / imgRatio;
      }
      offsetX = (w - drawW) / 2;
      offsetY = (h - drawH) / 2;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
      ctx.restore();
      return true;
    }

    renderVarnishScene() {
      const ctx = this.ctx;
      const w = this.width;
      const h = this.height;
      const t = this.time * 0.008;

      // Cycle position of the varnish/oil brush pass (0 to 1)
      const progress = this.isHovering
        ? this.mouseX
        : (Math.sin(t * 0.85 - Math.PI / 2) + 1) * 0.5;

      // Base layer: raw / pale quartersawn oak texture + subtle zoom
      const zoom = 1.02 + Math.sin(t * 0.4) * 0.015;
      const bgImg = this.images.varnish || this.images.fallbackVarnish;

      if (bgImg) {
        // Draw desaturated/paler "un-oiled" oak across full canvas first
        ctx.save();
        ctx.filter = 'saturate(0.55) brightness(1.08) contrast(0.92)';
        this.drawCoverImage(bgImg, 1, zoom);
        ctx.restore();

        // Clip region for the freshly oiled/varnished pass
        ctx.save();
        ctx.beginPath();
        const edgeX = w * (0.08 + progress * 0.84);
        ctx.moveTo(0, 0);
        ctx.lineTo(edgeX + 28, 0);
        // Slightly angled organic bristle wave edge
        for (let y = 0; y <= h; y += 20) {
          const wave = Math.sin(y * 0.04 + t * 2.5) * 6;
          ctx.lineTo(edgeX + wave - (y / h) * 24, y);
        }
        ctx.lineTo(0, h);
        ctx.closePath();
        ctx.clip();

        // Rich, warm oiled English oak with deep amber grain contrast
        ctx.filter = 'saturate(1.38) brightness(0.92) contrast(1.18) sepia(0.18)';
        this.drawCoverImage(bgImg, 1, zoom);

        // Warm amber oil tint & medullary ray shimmer
        const amberGrad = ctx.createLinearGradient(0, 0, edgeX, h);
        amberGrad.addColorStop(0, 'rgba(92, 54, 18, 0.22)');
        amberGrad.addColorStop(0.75, 'rgba(169, 135, 82, 0.18)');
        amberGrad.addColorStop(1, 'rgba(215, 165, 90, 0.34)');
        ctx.fillStyle = amberGrad;
        ctx.fillRect(0, 0, w, h);
        ctx.restore();

        // Wet specular sheen band right along the active varnish stroke
        const sheenGrad = ctx.createLinearGradient(edgeX - 95, 0, edgeX + 18, 0);
        sheenGrad.addColorStop(0, 'rgba(255, 240, 210, 0)');
        sheenGrad.addColorStop(0.65, 'rgba(247, 232, 198, 0.28)');
        sheenGrad.addColorStop(0.88, 'rgba(255, 248, 231, 0.52)');
        sheenGrad.addColorStop(1, 'rgba(255, 248, 231, 0)');
        ctx.fillStyle = sheenGrad;
        ctx.fillRect(edgeX - 100, 0, 125, h);

        // Fine bristle micro-striations in the wet coat
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 244, 220, 0.12)';
        ctx.lineWidth = 1;
        for (let y = 12; y < h; y += 9) {
          ctx.beginPath();
          ctx.moveTo(Math.max(0, edgeX - 160 - Math.sin(y) * 30), y);
          ctx.lineTo(edgeX - (y / h) * 20, y + Math.cos(y * 0.2) * 1.5);
          ctx.stroke();
        }
        ctx.restore();
      } else {
        // Procedural quartersawn English oak grain if image still loading
        this.drawProceduralOak(progress, t);
      }

      // Vignette & workshop sunbeam
      const vig = ctx.createRadialGradient(w * 0.5, h * 0.5, w * 0.2, w * 0.5, h * 0.5, w * 0.75);
      vig.addColorStop(0, 'rgba(21, 25, 10, 0)');
      vig.addColorStop(1, 'rgba(14, 17, 7, 0.58)');
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, w, h);

      this.renderAmbientMotes(ctx, w, h, t);
      this.renderHUD(ctx, w, h, 'REEL 01 // HARDWAX OIL ON ENGLISH OAK', `COAT 01 · SATIN SHEEN ${Math.round(progress * 100)}%`);
    }

    drawProceduralOak(progress, t) {
      const ctx = this.ctx;
      const w = this.width;
      const h = this.height;
      const edgeX = w * (0.1 + progress * 0.8);

      // Raw oak side
      ctx.fillStyle = '#C9B393';
      ctx.fillRect(0, 0, w, h);

      // Oiled oak side
      ctx.fillStyle = '#6E4720';
      ctx.fillRect(0, 0, edgeX, h);

      // Grain lines
      for (let y = 0; y < h; y += 4) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        for (let x = 0; x < w; x += 25) {
          ctx.lineTo(x, y + Math.sin(x * 0.015 + y * 0.05) * 4);
        }
        ctx.strokeStyle = 'rgba(35, 20, 8, 0.16)';
        ctx.lineWidth = (y % 16 === 0) ? 2 : 1;
        ctx.stroke();
      }

      // Specular highlight at edgeX
      const sheen = ctx.createLinearGradient(edgeX - 70, 0, edgeX + 15, 0);
      sheen.addColorStop(0, 'rgba(255,245,220,0)');
      sheen.addColorStop(0.8, 'rgba(255,245,220,0.45)');
      sheen.addColorStop(1, 'rgba(255,245,220,0)');
      ctx.fillStyle = sheen;
      ctx.fillRect(edgeX - 75, 0, 95, h);
    }

    renderLaserScene() {
      const ctx = this.ctx;
      const w = this.width;
      const h = this.height;
      const t = this.time * 0.012;

      const bgImg = this.images.laser || this.images.fallbackLaser;
      const zoom = 1.03 + Math.sin(t * 0.3) * 0.015;

      if (bgImg) {
        ctx.save();
        ctx.filter = 'brightness(0.68) contrast(1.12) saturate(0.88)';
        this.drawCoverImage(bgImg, 1, zoom);
        ctx.restore();
      } else {
        ctx.fillStyle = '#15190A';
        ctx.fillRect(0, 0, w, h);
      }

      // Dark olive architectural atmosphere overlay
      ctx.fillStyle = 'rgba(21, 25, 10, 0.36)';
      ctx.fillRect(0, 0, w, h);

      // Faint architectural CAD elevation lines representing "Resolve Before Build"
      ctx.save();
      ctx.strokeStyle = 'rgba(169, 135, 82, 0.22)';
      ctx.lineWidth = 1;
      const frameMarginX = w * 0.14;
      const frameMarginY = h * 0.12;
      ctx.strokeRect(frameMarginX, frameMarginY, w - frameMarginX * 2, h - frameMarginY * 2);
      ctx.strokeRect(frameMarginX + 14, frameMarginY + 14, w - (frameMarginX + 14) * 2, h - (frameMarginY + 14) * 2);

      // 45-degree cockbead mitre ticks at corners
      const corners = [
        [frameMarginX, frameMarginY, 1, 1],
        [w - frameMarginX, frameMarginY, -1, 1],
        [frameMarginX, h - frameMarginY, 1, -1],
        [w - frameMarginX, h - frameMarginY, -1, -1]
      ];
      corners.forEach(([cx, cy, dx, dy]) => {
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + dx * 14, cy + dy * 14);
        ctx.stroke();
      });
      ctx.restore();

      // Laser activation cycle:
      // 0..1: laser snaps on with high-precision self-levelling oscillation, then locks to datum
      const cycle = t % 8.0;
      const powerOn = Math.min(1, cycle * 2.5);
      const settleDamp = Math.exp(-cycle * 1.4) * Math.sin(cycle * 14) * 18;

      const laserX = this.isHovering
        ? w * this.mouseX
        : w * (0.36 + Math.sin(t * 0.45) * 0.18) + settleDamp;
      const laserY = this.isHovering
        ? h * this.mouseY
        : h * (0.44 + Math.cos(t * 0.35) * 0.1) - settleDamp * 0.5;

      ctx.save();
      ctx.globalAlpha = powerOn;

      // Vertical Plumb Laser Line (Warm Red-Amber Precision Laser)
      const vGlow = ctx.createLinearGradient(laserX - 24, 0, laserX + 24, 0);
      vGlow.addColorStop(0, 'rgba(235, 68, 44, 0)');
      vGlow.addColorStop(0.4, 'rgba(235, 68, 44, 0.18)');
      vGlow.addColorStop(0.5, 'rgba(255, 160, 110, 0.85)');
      vGlow.addColorStop(0.6, 'rgba(235, 68, 44, 0.18)');
      vGlow.addColorStop(1, 'rgba(235, 68, 44, 0)');
      ctx.fillStyle = vGlow;
      ctx.fillRect(laserX - 24, 0, 48, h);

      ctx.beginPath();
      ctx.moveTo(laserX, 0);
      ctx.lineTo(laserX, h);
      ctx.strokeStyle = 'rgba(255, 225, 200, 0.95)';
      ctx.lineWidth = 1.4;
      ctx.stroke();

      // Horizontal Datum Laser Line
      const hGlow = ctx.createLinearGradient(0, laserY - 24, 0, laserY + 24);
      hGlow.addColorStop(0, 'rgba(235, 68, 44, 0)');
      hGlow.addColorStop(0.4, 'rgba(235, 68, 44, 0.16)');
      hGlow.addColorStop(0.5, 'rgba(255, 160, 110, 0.82)');
      hGlow.addColorStop(0.6, 'rgba(235, 68, 44, 0.16)');
      hGlow.addColorStop(1, 'rgba(235, 68, 44, 0)');
      ctx.fillStyle = hGlow;
      ctx.fillRect(0, laserY - 24, w, 48);

      ctx.beginPath();
      ctx.moveTo(0, laserY);
      ctx.lineTo(w, laserY);
      ctx.strokeStyle = 'rgba(255, 225, 200, 0.92)';
      ctx.lineWidth = 1.4;
      ctx.stroke();

      // Crosshair node & calibration rings at intersection
      const pulse = 1 + Math.sin(t * 4) * 0.15;
      ctx.beginPath();
      ctx.arc(laserX, laserY, 12 * pulse, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 140, 100, 0.65)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(laserX, laserY, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#FFF5EE';
      ctx.fill();

      // Technical callout label right beside the laser intersection
      const labelX = laserX + 18 < w - 210 ? laserX + 18 : laserX - 205;
      const labelY = laserY - 18 > 45 ? laserY - 28 : laserY + 24;
      ctx.fillStyle = 'rgba(21, 25, 10, 0.84)';
      ctx.fillRect(labelX, labelY - 14, 192, 36);
      ctx.strokeStyle = 'rgba(169, 135, 82, 0.55)';
      ctx.strokeRect(labelX, labelY - 14, 192, 36);

      ctx.fillStyle = '#F7F1ED';
      ctx.font = '500 10px "Poppins", sans-serif';
      const plumbOffset = ((laserX / w - 0.5) * 8.4).toFixed(1);
      ctx.fillText(`PLUMB DATUM: ${plumbOffset > 0 ? '+' : ''}${plumbOffset}mm SCRIBE`, labelX + 8, labelY);
      ctx.fillStyle = '#A98752';
      ctx.font = '400 9px "Poppins", sans-serif';
      ctx.fillText('OUT-OF-SQUARE WALL RESOLVED', labelX + 8, labelY + 13);

      ctx.restore();

      // Dust motes glowing bright crimson/gold when passing through the laser planes!
      this.ambientMotes.forEach((m) => {
        m.x = (m.x + m.vx + 1) % 1;
        m.y = (m.y + m.vy + 1) % 1;
        const px = m.x * w;
        const py = m.y * h;
        const nearLaser = Math.abs(px - laserX) < 18 || Math.abs(py - laserY) < 18;
        ctx.beginPath();
        ctx.arc(px, py, nearLaser ? m.r * 1.9 : m.r, 0, Math.PI * 2);
        ctx.fillStyle = nearLaser
          ? `rgba(255, 175, 140, ${Math.min(1, m.alpha * 2.2)})`
          : `rgba(237, 231, 226, ${m.alpha * 0.45})`;
        ctx.fill();
      });

      this.renderHUD(ctx, w, h, 'REEL 02 // SITE LASER DATUM & SCRIBE CALIBRATION', 'TOLERANCE ±0.5mm · MICROVELLUM SURVEY');
    }

    renderSawdustScene() {
      const ctx = this.ctx;
      const w = this.width;
      const h = this.height;
      const t = this.time * 0.012;

      const bgImg = this.images.sawdust || this.images.fallbackSawdust;
      const zoom = 1.03 + Math.sin(t * 0.35) * 0.018;

      if (bgImg) {
        ctx.save();
        ctx.filter = 'brightness(0.84) contrast(1.12) saturate(1.08)';
        this.drawCoverImage(bgImg, 1, zoom);
        ctx.restore();
      } else {
        ctx.fillStyle = '#1F1810';
        ctx.fillRect(0, 0, w, h);
      }

      // Warm diagonal workshop sunbeam shaft
      ctx.save();
      const beamGrad = ctx.createLinearGradient(0, 0, w * 0.85, h);
      beamGrad.addColorStop(0, 'rgba(255, 226, 175, 0.24)');
      beamGrad.addColorStop(0.5, 'rgba(212, 169, 106, 0.12)');
      beamGrad.addColorStop(1, 'rgba(21, 25, 10, 0.45)');
      ctx.fillStyle = beamGrad;
      ctx.fillRect(0, 0, w, h);
      ctx.restore();

      // Periodic gentle breath of air every ~4.5 seconds
      const gustCycle = Math.sin(t * 1.35);
      const gustStrength = gustCycle > 0.55 ? (gustCycle - 0.55) * 2.2 : 0;
      if (this.puffTrigger > 0) {
        this.puffTrigger *= 0.94;
      }
      const totalGust = Math.max(gustStrength, this.puffTrigger);

      // Update & render sawdust particles
      this.sawdustParticles.forEach((p) => {
        p.life += 1;
        if (p.life > p.maxLife || p.x > 1.08 || p.y < -0.08 || p.y > 1.08) {
          Object.assign(p, this.createSawdustParticle(false));
        }

        // Fluid curl noise turbulence + gentle breath impulse
        const curlX = Math.cos(p.y * 6.0 + t * 1.8) * 0.0009 + totalGust * 0.0038;
        const curlY = Math.sin(p.x * 5.0 + t * 1.4) * 0.0008 - totalGust * 0.0016 + 0.00035; // slight gravity settle

        p.x += p.vx + curlX;
        p.y += p.vy + curlY;
        p.vx *= 0.992;
        p.vy *= 0.992;
        p.angle += p.vAngle;

        const px = p.x * w;
        const py = p.y * h;

        // Sunbeam illumination boost
        const inSunbeam = (px / w + py / h) < 1.35 ? 1.35 : 0.65;
        const fade = Math.sin((p.life / p.maxLife) * Math.PI);
        const alpha = Math.min(0.92, p.alpha * fade * inSunbeam);

        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(p.angle);
        ctx.fillStyle = `hsla(${p.hue}, 62%, 74%, ${alpha})`;
        // Draw tiny wood shaving / dust flake
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size * p.aspect * 0.5, p.size * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      this.renderHUD(ctx, w, h, 'REEL 03 // AFTER THE CUT — DOVETAIL & COCKBEAD JOINT', 'CLICK VIEWPORT TO TRIGGER SAWDUST BREATH');
    }

    renderAmbientMotes(ctx, w, h, t) {
      this.ambientMotes.forEach((m) => {
        m.x = (m.x + m.vx + 1) % 1;
        m.y = (m.y + m.vy + 1) % 1;
        const px = m.x * w;
        const py = m.y * h;
        const twinkle = (Math.sin(t * 2 + m.phase) + 1) * 0.5;
        ctx.beginPath();
        ctx.arc(px, py, m.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(247, 241, 237, ${m.alpha * (0.4 + twinkle * 0.6)})`;
        ctx.fill();
      });
    }

    renderHUD(ctx, w, h, leftLabel, rightLabel) {
      ctx.save();
      // Subtle bottom filmic gradient so HUD text is always crisp
      const grad = ctx.createLinearGradient(0, h - 56, 0, h);
      grad.addColorStop(0, 'rgba(21, 25, 10, 0)');
      grad.addColorStop(1, 'rgba(21, 25, 10, 0.78)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, h - 56, w, 56);

      ctx.font = '500 10px "Poppins", sans-serif';
      ctx.fillStyle = 'rgba(247, 241, 237, 0.88)';
      ctx.fillText(leftLabel, 18, h - 16);

      const rightWidth = ctx.measureText(rightLabel).width;
      ctx.fillStyle = '#A98752';
      ctx.fillText(rightLabel, w - rightWidth - 18, h - 16);
      ctx.restore();
    }

    animate() {
      if (this.isPlaying) {
        this.time += 1;
        if (this.scene === 'varnish') {
          this.renderVarnishScene();
        } else if (this.scene === 'laser') {
          this.renderLaserScene();
        } else {
          this.renderSawdustScene();
        }
      }
      requestAnimationFrame(this.animate);
    }
  }

  // Expose globally and auto-initialize any [data-workshop-canvas] elements
  window.GrouseWorkshopMotion = WorkshopMotionPlayer;

  function initAllMotionAndGeometry() {
    // 1. Initialize Workshop Canvas Players
    const players = new Map();
    document.querySelectorAll('canvas[data-workshop-canvas]').forEach((canvas) => {
      const initialScene = canvas.getAttribute('data-workshop-canvas') || 'laser';
      const player = new WorkshopMotionPlayer(canvas, initialScene);
      players.set(canvas.id || canvas, player);

      // Connect scene switcher buttons targeting this canvas
      const targetId = canvas.id;
      if (targetId) {
        document.querySelectorAll(`[data-workshop-target="${targetId}"]`).forEach((btn) => {
          btn.addEventListener('click', () => {
            const scene = btn.getAttribute('data-workshop-scene');
            if (scene) {
              player.setScene(scene);
              document.querySelectorAll(`[data-workshop-target="${targetId}"]`).forEach((b) => {
                b.classList.toggle('active', b === btn);
              });
            }
          });
        });
      }
    });

    // 2. Scroll-linked Woodwork Geometry Animations (Mortise & Tenon, Dovetails, Cockbead Mitre Frames)
    const revealEls = document.querySelectorAll('.joinery-reveal, .mitre-frame, .dovetail-joint, .scribe-line');
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-assembled');
          }
        });
      }, { threshold: 0.16 });
      revealEls.forEach((el) => observer.observe(el));
    } else {
      revealEls.forEach((el) => el.classList.add('is-assembled'));
    }

    // 3. Continuous scroll-driven Dovetail & Spirit-Level Datum updates
    const updateScrollGeometry = () => {
      const scrollY = window.scrollY || window.pageYOffset;
      const docHeight = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const scrollRatio = Math.min(1, Math.max(0, scrollY / docHeight));

      document.documentElement.style.setProperty('--scroll-ratio', scrollRatio.toFixed(4));
      document.documentElement.style.setProperty('--scroll-mm', Math.round(scrollRatio * 2400));

      // Update any live datum readouts
      document.querySelectorAll('[data-datum-readout]').forEach((el) => {
        const mm = Math.round(scrollRatio * 2400);
        el.textContent = `DATUM +${mm}mm · PLUMB 0.0°`;
      });

      // Scroll-linked dovetail interlocking joints
      document.querySelectorAll('[data-scroll-joint]').forEach((el) => {
        const rect = el.getBoundingClientRect();
        const vh = window.innerHeight;
        // Progress goes from 0 (entering bottom) to 1 (centered in viewport)
        const progress = Math.min(1, Math.max(0, (vh - rect.top) / (vh * 0.65)));
        const offsetPx = (1 - progress) * 28;
        el.style.setProperty('--joint-gap', `${offsetPx.toFixed(1)}px`);
        el.style.setProperty('--joint-progress', progress.toFixed(3));
      });
    };

    window.addEventListener('scroll', updateScrollGeometry, { passive: true });
    updateScrollGeometry();

    // 4. Interactive X-Ray CAD-to-Craft Sliders
    document.querySelectorAll('[data-xray-slider]').forEach((container) => {
      const range = container.querySelector('input[type="range"]');
      const overlay = container.querySelector('[data-xray-overlay]');
      const divider = container.querySelector('[data-xray-divider]');
      if (range && overlay) {
        const updateSlider = () => {
          const val = range.value;
          overlay.style.clipPath = `inset(0 ${100 - val}% 0 0)`;
          if (divider) divider.style.left = `${val}%`;
        };
        range.addEventListener('input', updateSlider);
        updateSlider();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAllMotionAndGeometry);
  } else {
    initAllMotionAndGeometry();
  }
})();
