/* ═══════════════════════════════════════════════════════════════
   JR GROUP — CINEMATIC GOLD DUST PARTICLE SYSTEM
   Three-layer premium particle animation with logo integration,
   edge highlighting, shimmer, cursor interaction, and breathing glow.
   ═══════════════════════════════════════════════════════════════ */

// ─── GOLD PALETTE ────────────────────────────────────────────

const GOLD = [
  [212, 175, 55],   // Classic gold
  [228, 200, 110],  // Light gold
  [197, 160, 40],   // Deep gold
  [240, 225, 170],  // Pale shimmer
  [170, 135, 25],   // Dark accent
  [255, 235, 180],  // Bright highlight
];

function goldColor(idx) {
  const c = GOLD[idx % GOLD.length];
  return c;
}

// ─── TEXT / LOGO SAMPLING ────────────────────────────────────

function sampleLogoPoints(text, canvas, targetCount, fontSize) {
  const w = canvas.width;
  const h = canvas.height;
  const tmp = document.createElement('canvas');
  tmp.width = w;
  tmp.height = h;
  const ctx = tmp.getContext('2d');

  const size = fontSize || Math.min(w * 0.38, h * 0.6);
  ctx.fillStyle = '#fff';
  ctx.font = `900 ${size}px 'Bodoni Moda', 'Playfair Display', serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, w / 2, h / 2 - h * 0.06);

  const imgData = ctx.getImageData(0, 0, w, h);
  const points = [];
  const edgePoints = [];
  const step = Math.max(1, Math.floor(Math.sqrt((w * h) / (targetCount * 3))));

  for (let y = 0; y < h; y += step) {
    for (let x = 0; x < w; x += step) {
      const idx = (y * w + x) * 4;
      const a = imgData.data[idx + 3];
      if (a > 80) {
        points.push({ x, y, isEdge: false });

        // Detect edges — check if any neighbor is transparent
        let isEdge = false;
        for (const [dx, dy] of [[-step,0],[step,0],[0,-step],[0,step]]) {
          const nx = x + dx, ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= w || ny >= h) { isEdge = true; break; }
          const ni = (ny * w + nx) * 4;
          if (imgData.data[ni + 3] < 80) { isEdge = true; break; }
        }
        if (isEdge) edgePoints.push({ x, y });
      }
    }
  }
  return { points, edgePoints };
}

// ─── LAYER 1: BACKGROUND ATMOSPHERE PARTICLE ─────────────────

class AtmosphereParticle {
  constructor(w, h) {
    this.x = Math.random() * w;
    this.y = Math.random() * h;
    this.size = 0.15 + Math.random() * 0.35;
    this.baseAlpha = 0.02 + Math.random() * 0.06;
    this.alpha = this.baseAlpha;
    this.vx = (Math.random() - 0.5) * 0.08;
    this.vy = -0.02 - Math.random() * 0.06;
    this.shimmerSpeed = 0.3 + Math.random() * 1.2;
    this.shimmerOffset = Math.random() * Math.PI * 2;
    this.color = goldColor(Math.floor(Math.random() * GOLD.length));
    this.w = w;
    this.h = h;
  }

  update(t) {
    this.x += this.vx;
    this.y += this.vy;
    if (this.y < -5) { this.y = this.h + 5; this.x = Math.random() * this.w; }
    if (this.x < -5) this.x = this.w + 5;
    if (this.x > this.w + 5) this.x = -5;
    this.alpha = this.baseAlpha + Math.sin(t * this.shimmerSpeed + this.shimmerOffset) * 0.02;
  }

  draw(ctx) {
    if (this.alpha < 0.01) return;
    const [r, g, b] = this.color;
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.fillRect(this.x, this.y, this.size, this.size);
  }
}

// ─── LAYER 2: LOGO SURFACE PARTICLE ──────────────────────────

class SurfaceParticle {
  constructor(x, y) {
    this.homeX = x;
    this.homeY = y;
    this.x = x + (Math.random() - 0.5) * 600;
    this.y = y + (Math.random() - 0.5) * 600;
    this.vx = 0;
    this.vy = 0;
    this.size = 0.6 + Math.random() * 1.2;
    this.baseAlpha = 0.55 + Math.random() * 0.35;
    this.alpha = 0;

    // Multi-frequency shimmer for metallic effect
    this.shimSpeed1 = 0.6 + Math.random() * 2.0;
    this.shimSpeed2 = 2.0 + Math.random() * 3.5;
    this.shimOff1 = Math.random() * Math.PI * 2;
    this.shimOff2 = Math.random() * Math.PI * 2;
    this.shimInt = 0.12 + Math.random() * 0.25;

    // Micro-drift (doesn't leave letter shape)
    this.driftAngle = Math.random() * Math.PI * 2;
    this.driftSpeed = 0.0001 + Math.random() * 0.0004;
    this.driftRadius = 0.1 + Math.random() * 0.25;

    this.ease = 0.015 + Math.random() * 0.02;
    this.friction = 0.94;

    this.color = goldColor(Math.floor(Math.random() * GOLD.length));
    this.isHighlight = Math.random() < 0.25;

    // Track if particle is scattered by cursor
    this.scattered = false;
  }

  update(t, mx, my, mActive, breathe, cursorOnLogo) {
    // Metallic shimmer
    const s1 = Math.sin(t * this.shimSpeed1 + this.shimOff1);
    const s2 = Math.sin(t * this.shimSpeed2 + this.shimOff2) * 0.35;
    this.alpha = this.baseAlpha + (s1 + s2) * this.shimInt;

    // Breathing glow
    this.alpha += breathe * 0.08;

    if (this.isHighlight && s1 > 0.5) {
      this.alpha = Math.min(1, this.alpha + 0.35);
    }
    this.alpha = Math.max(0, Math.min(1, this.alpha));

    // Micro drift
    this.driftAngle += this.driftSpeed;
    const dx = this.homeX - this.x + Math.cos(this.driftAngle) * this.driftRadius;
    const dy = this.homeY - this.y + Math.sin(this.driftAngle) * this.driftRadius;

    this.vx += dx * this.ease;
    this.vy += dy * this.ease;

    // Cursor interaction — scatter particles when cursor is over the logo
    if (mActive) {
      const cdx = this.x - mx;
      const cdy = this.y - my;
      const dist = Math.sqrt(cdx * cdx + cdy * cdy);
      if (dist < 150) {
        // Strong scatter — send particles flying across the page
        const force = (1 - dist / 150) * 8;
        this.vx += (cdx / (dist || 1)) * force;
        this.vy += (cdy / (dist || 1)) * force;
        this.alpha = Math.min(1, this.alpha + 0.3);
        this.scattered = true;
      }
    }

    this.vx *= this.friction;
    this.vy *= this.friction;
    this.x += this.vx;
    this.y += this.vy;
  }

  draw(ctx) {
    if (this.alpha < 0.03) return;
    const [r, g, b] = this.color;
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.fillRect(this.x - this.size * 0.5, this.y - this.size * 0.5, this.size, this.size);

    // Highlight particles get a soft glow
    if (this.isHighlight && this.alpha > 0.5) {
      ctx.globalAlpha = this.alpha * 0.3;
      const s2 = this.size * 2.2;
      ctx.fillRect(this.x - s2 * 0.5, this.y - s2 * 0.5, s2, s2);
    }
  }
}

// ─── LAYER 3: EDGE ACCENT PARTICLE ──────────────────────────

class EdgeParticle {
  constructor(edgePoints) {
    this.edgePoints = edgePoints;
    this.progress = Math.random();
    this.speed = 0.0002 + Math.random() * 0.0005;
    this.size = 0.25 + Math.random() * 0.4;
    this.baseAlpha = 0;
    this.alpha = 0;
    this.color = goldColor(Math.floor(Math.random() * 3)); // brighter golds
    this.lifePhase = Math.random() * Math.PI * 2;
    this.lifeSpeed = 0.15 + Math.random() * 0.3;
    this.x = 0;
    this.y = 0;
    this.active = false;
    this.cooldown = Math.random() * 400; // stagger starts
  }

  update(t) {
    if (this.edgePoints.length === 0) return;

    this.cooldown--;
    if (this.cooldown > 0) return;

    this.active = true;
    this.progress += this.speed;
    if (this.progress >= 1) {
      this.progress = 0;
      this.cooldown = 200 + Math.random() * 600; // pause before next pass
      this.active = false;
      return;
    }

    // Life cycle — fade in, sustain, fade out
    this.lifePhase += this.lifeSpeed * 0.016;
    const lifeCurve = Math.sin(this.progress * Math.PI); // 0→1→0 over edge path
    this.alpha = lifeCurve * 0.4;

    // Position along edge path
    const idx = Math.floor(this.progress * this.edgePoints.length);
    const pt = this.edgePoints[Math.min(idx, this.edgePoints.length - 1)];
    this.x = pt.x + (Math.random() - 0.5) * 1.5;
    this.y = pt.y + (Math.random() - 0.5) * 1.5;
  }

  draw(ctx) {
    if (!this.active || this.alpha < 0.02) return;
    const [r, g, b] = this.color;
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.fillRect(this.x - this.size * 0.5, this.y - this.size * 0.5, this.size, this.size);
  }
}

// ─── MAIN SYSTEM ─────────────────────────────────────────────

export class GlitterSystem {
  constructor(canvasId, initialText = 'JR') {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.initialText = initialText;

    this.mx = -9999;
    this.my = -9999;
    this.mActive = false;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.isMobile = window.innerWidth < 768;

    this._paused = false;
    this._rafId = null;

    // Particle arrays
    this.atmosphereParticles = [];
    this.surfaceParticles = [];
    this.edgeParticles = [];
    this.edgePointsData = [];

    // Offscreen canvas for glow compositing
    this._offscreen = document.createElement('canvas');
    this._offCtx = this._offscreen.getContext('2d');

    this._resize();
    this._init();
    this._bind();
    this._loop(0);
  }

  _resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.canvas.width = w * this.dpr;
    this.canvas.height = h * this.dpr;
    this.canvas.style.width = w + 'px';
    this.canvas.style.height = h + 'px';
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this._offscreen.width = w * this.dpr;
    this._offscreen.height = h * this.dpr;
    this._offCtx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.w = w;
    this.h = h;
    this.cx = w / 2;
    this.cy = h / 2;
  }

  _init() {
    // ─── Layer 1: Background Atmosphere ───
    const atmCount = this.isMobile ? 80 : 220;
    for (let i = 0; i < atmCount; i++) {
      this.atmosphereParticles.push(new AtmosphereParticle(this.w, this.h));
    }

    // ─── Sample logo text ───
    const surfaceCount = this.isMobile ? 4000 : 8000;
    const { points, edgePoints } = sampleLogoPoints(
      this.initialText,
      { width: this.w * this.dpr, height: this.h * this.dpr },
      surfaceCount,
      this.isMobile ? Math.min(this.w * 0.55, this.h * 0.45) : Math.min(this.w * 0.35, this.h * 0.55)
    );

    this.edgePointsData = edgePoints.map(p => ({
      x: p.x / this.dpr,
      y: p.y / this.dpr
    }));

    // ─── Layer 2: Logo Surface Particles ───
    for (let i = 0; i < points.length; i++) {
      this.surfaceParticles.push(
        new SurfaceParticle(points[i].x / this.dpr, points[i].y / this.dpr)
      );
    }

    // ─── Layer 3: Edge Accent Particles ───
    const edgeCount = this.isMobile ? 6 : 15;
    for (let i = 0; i < edgeCount; i++) {
      this.edgeParticles.push(new EdgeParticle(this.edgePointsData));
    }
  }

  scatter() {
    this.surfaceParticles.forEach(p => {
      p.homeX = this.cx + (Math.random() - 0.5) * this.w * 0.95;
      p.homeY = this.cy + (Math.random() - 0.5) * this.h * 0.95;
      p.baseAlpha = 0.06 + Math.random() * 0.12;
      p.size = 0.2 + Math.random() * 0.5;
    });
  }

  morphToText(text) {
    this.initialText = text;
    const surfaceCount = this.isMobile ? 4000 : 8000;
    const { points, edgePoints } = sampleLogoPoints(
      text,
      { width: this.w * this.dpr, height: this.h * this.dpr },
      surfaceCount,
      this.isMobile ? Math.min(this.w * 0.55, this.h * 0.45) : Math.min(this.w * 0.35, this.h * 0.55)
    );

    this.edgePointsData = edgePoints.map(p => ({
      x: p.x / this.dpr,
      y: p.y / this.dpr
    }));

    this.surfaceParticles.forEach((p, i) => {
      if (i < points.length) {
        p.homeX = points[i].x / this.dpr;
        p.homeY = points[i].y / this.dpr;
        p.baseAlpha = 0.55 + Math.random() * 0.35;
        p.size = 0.6 + Math.random() * 1.2;
        p.scattered = false;
      } else {
        p.homeX = this.cx + (Math.random() - 0.5) * this.w * 0.85;
        p.homeY = this.cy + (Math.random() - 0.5) * this.h * 0.85;
        p.baseAlpha = 0.04 + Math.random() * 0.08;
        p.size = 0.2 + Math.random() * 0.4;
      }
    });

    this.edgeParticles.forEach(ep => {
      ep.edgePoints = this.edgePointsData;
      ep.progress = Math.random();
    });
  }

  pause() {
    if (this._paused) return;
    this._paused = true;
    if (this._rafId) { cancelAnimationFrame(this._rafId); this._rafId = null; }
  }

  resume() {
    if (!this._paused) return;
    this._paused = false;
    this._rafId = requestAnimationFrame(ts => this._loop(ts));
  }

  _bind() {
    window.addEventListener('resize', () => {
      this._resize();
      // Rebuild particles on resize
      this.atmosphereParticles = [];
      this.surfaceParticles = [];
      this.edgeParticles = [];
      this._init();
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) this.pause();
      else this.resume();
    });

    document.addEventListener('menu-toggle', e => {
      if (e.detail && e.detail.open) this.pause();
      else this.resume();
    });

    window.addEventListener('mousemove', e => {
      this.mx = e.clientX;
      this.my = e.clientY;
      this.mActive = true;
    });
    window.addEventListener('mouseleave', () => { this.mActive = false; });
    window.addEventListener('touchmove', e => {
      if (e.touches.length) {
        this.mx = e.touches[0].clientX;
        this.my = e.touches[0].clientY;
        this.mActive = true;
      }
    }, { passive: true });
    window.addEventListener('touchend', () => { this.mActive = false; });
  }

  _loop(ts) {
    if (this._paused) return;

    const t = ts * 0.001;
    const oc = this._offCtx;
    const mc = this.ctx;

    oc.clearRect(0, 0, this.w, this.h);
    mc.clearRect(0, 0, this.w, this.h);

    // Breathing glow — extremely subtle sinusoidal brightness variation
    const breathe = Math.sin(t * 0.3) * 0.5 + Math.sin(t * 0.17) * 0.3;

    // ─── Layer 1: Background Atmosphere ───
    for (const p of this.atmosphereParticles) {
      p.update(t);
      p.draw(oc);
    }

    // ─── Layer 2: Logo Surface Particles ───
    for (const p of this.surfaceParticles) {
      p.update(t, this.mx, this.my, this.mActive, breathe, true);
      p.draw(oc);
    }

    // ─── Layer 3: Edge Accent Particles ───
    for (const p of this.edgeParticles) {
      p.update(t);
      p.draw(oc);
    }

    oc.globalAlpha = 1;

    // ─── COMPOSITING ───

    // Layer 1 — Soft glow (skip on mobile for performance)
    if (!this.isMobile) {
      mc.save();
      mc.filter = 'blur(2px)';
      mc.globalAlpha = 0.35 + breathe * 0.04;
      mc.drawImage(this._offscreen, 0, 0, this.w, this.h);
      mc.restore();
    }

    // Layer 2 — Crisp particles
    mc.drawImage(this._offscreen, 0, 0, this.w, this.h);

    this._rafId = requestAnimationFrame(ts2 => this._loop(ts2));
  }
}
