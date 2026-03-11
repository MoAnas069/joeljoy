/* ═══════════════════════════════════════════════════════════════
   MICRO-GLITTER PARTICLE SYSTEM — "The Golden Journey"
   Ultra-fine gold dust particles that form text and shapes.
   Particles appear as microscopic metallic powder, not spheres.
   ═══════════════════════════════════════════════════════════════ */

// ─── TEXT SAMPLING ────────────────────────────────────────────

function sampleTextPoints(text, targetCount = 3000) {
  const canvas = document.createElement('canvas');
  const size = 1200;
  canvas.width = size;
  canvas.height = size / 3;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#fff';

  // Use a large bold font for clean sampling
  const fontSize = Math.min(size / (text.length * 0.65), size / 3 * 0.8);
  ctx.font = `700 ${fontSize}px 'Playfair Display', serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, size / 2, size / 3 / 2);

  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const points = [];
  const step = Math.max(1, Math.floor(Math.sqrt((canvas.width * canvas.height) / (targetCount * 2.5))));

  for (let y = 0; y < canvas.height; y += step) {
    for (let x = 0; x < canvas.width; x += step) {
      if (imgData.data[(y * canvas.width + x) * 4 + 3] > 100) {
        points.push({
          x: (x / canvas.width - 0.5) * 2,
          y: (y / canvas.height - 0.5) * 2
        });
      }
    }
  }
  return points;
}

// ─── SHAPE GENERATORS ─────────────────────────────────────────

function generateSkylineShape(count) {
  const pts = [];
  const buildings = [
    { x: -0.8, w: 0.1, h: 0.3 }, { x: -0.65, w: 0.08, h: 0.55 },
    { x: -0.5, w: 0.12, h: 0.45 }, { x: -0.35, w: 0.06, h: 0.7 },
    { x: -0.22, w: 0.1, h: 0.5 }, { x: -0.08, w: 0.08, h: 0.88 },
    { x: 0.04, w: 0.1, h: 0.6 }, { x: 0.18, w: 0.07, h: 0.78 },
    { x: 0.28, w: 0.12, h: 0.4 }, { x: 0.44, w: 0.08, h: 0.55 },
    { x: 0.56, w: 0.1, h: 0.35 }, { x: 0.7, w: 0.12, h: 0.28 },
  ];
  const per = Math.floor(count / buildings.length);
  buildings.forEach(b => {
    for (let i = 0; i < per; i++) {
      const r = Math.random();
      const base = 0.4;
      if (r < 0.4) pts.push({ x: b.x + Math.random() * b.w, y: base - b.h });
      else if (r < 0.7) pts.push({ x: b.x, y: base - Math.random() * b.h });
      else pts.push({ x: b.x + b.w, y: base - Math.random() * b.h });
    }
  });
  for (let i = 0; i < 80; i++) pts.push({ x: -0.9 + Math.random() * 1.8, y: 0.4 });
  return pts;
}

function generateHouseShape(count) {
  const pts = [];
  for (let i = 0; i < count; i++) {
    const r = Math.random();
    let x, y;
    if (r < 0.3) { // roof left slope
      const t = Math.random();
      x = -0.4 + t * 0.4; y = 0.1 - t * 0.4;
    } else if (r < 0.6) { // roof right slope
      const t = Math.random();
      x = t * 0.4; y = -0.3 + t * 0.4;
    } else if (r < 0.7) { // left wall
      x = -0.4; y = 0.1 + Math.random() * 0.4;
    } else if (r < 0.8) { // right wall
      x = 0.4; y = 0.1 + Math.random() * 0.4;
    } else if (r < 0.9) { // bottom
      x = -0.4 + Math.random() * 0.8; y = 0.5;
    } else { // door
      x = -0.08 + Math.random() * 0.16; y = 0.25 + Math.random() * 0.25;
    }
    pts.push({ x, y });
  }
  return pts;
}

function generateKeyShape(count) {
  const pts = [];
  for (let i = 0; i < count; i++) {
    const r = Math.random();
    let x, y;
    if (r < 0.3) { // bow circle
      const a = Math.random() * Math.PI * 2;
      const rad = 0.2 + Math.random() * 0.03;
      x = Math.cos(a) * rad; y = -0.35 + Math.sin(a) * rad;
    } else if (r < 0.35) { // inner bow
      const a = Math.random() * Math.PI * 2;
      const rad = 0.09;
      x = Math.cos(a) * rad; y = -0.35 + Math.sin(a) * rad;
    } else if (r < 0.65) { // shaft
      x = (Math.random() - 0.5) * 0.05; y = -0.15 + Math.random() * 0.65;
    } else if (r < 0.8) { // teeth horizontal
      const t = Math.floor(Math.random() * 3);
      x = 0.025 + Math.random() * 0.14; y = 0.32 + t * 0.08;
    } else { // teeth vertical
      const t = Math.floor(Math.random() * 3);
      x = 0.14; y = 0.3 + t * 0.08 + Math.random() * 0.06;
    }
    pts.push({ x, y });
  }
  return pts;
}

// ─── MICRO PARTICLE ───────────────────────────────────────────

class MicroParticle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.tx = x;
    this.ty = y;
    this.vx = 0;
    this.vy = 0;
    // Micro-glitter: fine but visible, 0.5 to 1.8px
    this.size = 0.5 + Math.random() * 1.3;
    this.baseAlpha = 0.45 + Math.random() * 0.45;
    this.alpha = this.baseAlpha;
    // Sparkle: random shimmer
    this.shimmerSpeed = 1 + Math.random() * 4;
    this.shimmerOffset = Math.random() * Math.PI * 2;
    this.shimmerIntensity = 0.15 + Math.random() * 0.35;
    // Drift
    this.driftAngle = Math.random() * Math.PI * 2;
    this.driftSpeed = 0.0005 + Math.random() * 0.001;
    this.driftRadius = 0.2 + Math.random() * 0.5;
    // Physics
    this.ease = 0.025 + Math.random() * 0.025;
    this.friction = 0.93;
    // Sparkle highlight: ~15% particles flash brighter with glow
    this.isHighlight = Math.random() < 0.15;
    // Glow radius for this particle
    this.glowSize = 2 + Math.random() * 4;
  }

  setTarget(x, y) {
    this.tx = x;
    this.ty = y;
  }

  update(t, mx, my, mActive) {
    // Shimmer / sparkle
    const shimmer = Math.sin(t * this.shimmerSpeed + this.shimmerOffset);
    this.alpha = this.baseAlpha + shimmer * this.shimmerIntensity;
    if (this.isHighlight && shimmer > 0.7) {
      this.alpha = Math.min(1, this.alpha + 0.3);
    }

    // Subtle drift
    this.driftAngle += this.driftSpeed;
    const dx = this.tx - this.x + Math.cos(this.driftAngle) * this.driftRadius;
    const dy = this.ty - this.y + Math.sin(this.driftAngle) * this.driftRadius;

    this.vx += dx * this.ease;
    this.vy += dy * this.ease;

    // Mouse: gentle repulsion like dust in air
    if (mActive) {
      const mdx = this.x - mx;
      const mdy = this.y - my;
      const dist = Math.sqrt(mdx * mdx + mdy * mdy);
      if (dist < 100) {
        const force = (1 - dist / 100) * 4;
        this.vx += (mdx / (dist || 1)) * force;
        this.vy += (mdy / (dist || 1)) * force;
      }
    }

    this.vx *= this.friction;
    this.vy *= this.friction;
    this.x += this.vx;
    this.y += this.vy;
  }

  draw(ctx) {
    if (this.alpha < 0.05) return;

    // Core micro dot
    ctx.globalAlpha = this.alpha;
    ctx.fillRect(this.x - this.size * 0.5, this.y - this.size * 0.5, this.size, this.size);

    // Highlight sparkle: brighter + larger dot
    if (this.isHighlight && this.alpha > 0.5) {
      ctx.globalAlpha = this.alpha * 0.55;
      const s2 = this.size * 2.2;
      ctx.fillRect(this.x - s2 * 0.5, this.y - s2 * 0.5, s2, s2);
    }
  }
}

// ─── PARTICLE SYSTEM ──────────────────────────────────────────

export class GlitterSystem {
  constructor(canvasId, initialText = 'THE J') {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.mx = 0;
    this.my = 0;
    this.mActive = false;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.isMobile = window.innerWidth < 768;
    this.count = this.isMobile ? 2000 : 5000;
    this.initialText = initialText;
    this.currentShape = null;
    this.ambientDust = [];

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
    // Sync offscreen canvas size
    this._offscreen.width = w * this.dpr;
    this._offscreen.height = h * this.dpr;
    this._offCtx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.w = w;
    this.h = h;
    this.cx = w / 2;
    this.cy = h / 2;
  }

  _init() {
    // Create particles — scattered across viewport
    for (let i = 0; i < this.count; i++) {
      const x = Math.random() * this.w;
      const y = Math.random() * this.h;
      this.particles.push(new MicroParticle(x, y));
    }

    // Ambient micro-dust (always floating, very subtle)
    const dustCount = this.isMobile ? 40 : 120;
    for (let i = 0; i < dustCount; i++) {
      this.ambientDust.push({
        x: Math.random() * this.w,
        y: Math.random() * this.h,
        size: 0.2 + Math.random() * 0.4,
        alpha: 0.05 + Math.random() * 0.12,
        vx: (Math.random() - 0.5) * 0.15,
        vy: -0.05 - Math.random() * 0.15
      });
    }

    // Set fill color once (gold)
    this.ctx.fillStyle = '#D4AF37';

    // Morph to initial text
    this.morphToText(this.initialText);
  }

  morphToText(text) {
    const pts = sampleTextPoints(text, this.count);
    this._applyShape(pts, 'text');
  }

  morphToShape(shapeName) {
    let pts;
    switch (shapeName) {
      case 'skyline': pts = generateSkylineShape(this.count); break;
      case 'house': pts = generateHouseShape(this.count); break;
      case 'key': pts = generateKeyShape(this.count); break;
      default: pts = generateHouseShape(this.count);
    }
    this._applyShape(pts, shapeName);
  }

  scatter() {
    this.particles.forEach(p => {
      p.setTarget(
        this.cx + (Math.random() - 0.5) * this.w * 0.9,
        this.cy + (Math.random() - 0.5) * this.h * 0.9
      );
      p.baseAlpha = 0.08 + Math.random() * 0.15;
      p.size = 0.2 + Math.random() * 0.5;
    });
  }

  _applyShape(pts, shapeName) {
    this.currentShape = shapeName;
    const scaleX = this.w * 0.38;
    const scaleY = this.h * 0.38;
    const offsetY = -this.h * 0.05; // slight upward offset

    this.particles.forEach((p, i) => {
      if (i < pts.length) {
        p.setTarget(
          this.cx + pts[i].x * scaleX,
          this.cy + pts[i].y * scaleY + offsetY
        );
        p.baseAlpha = 0.3 + Math.random() * 0.55;
        p.size = 0.3 + Math.random() * 0.9;
        p.isHighlight = Math.random() < 0.08;
      } else {
        // Excess particles float as ambient dust around the shape
        p.setTarget(
          this.cx + (Math.random() - 0.5) * this.w * 0.7,
          this.cy + (Math.random() - 0.5) * this.h * 0.7
        );
        p.baseAlpha = 0.04 + Math.random() * 0.1;
        p.size = 0.2 + Math.random() * 0.4;
        p.isHighlight = false;
      }
    });
  }

  _bind() {
    window.addEventListener('resize', () => {
      this._resize();
      if (this.currentShape === 'text') {
        this.morphToText(this.initialText);
      }
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
    const t = ts * 0.001;
    const oc = this._offCtx;
    const mc = this.ctx;

    // Clear both canvases
    oc.clearRect(0, 0, this.w, this.h);
    mc.clearRect(0, 0, this.w, this.h);

    // Draw everything to offscreen canvas
    oc.fillStyle = '#D4AF37';

    // Ambient dust
    this.ambientDust.forEach(d => {
      d.x += d.vx;
      d.y += d.vy;
      if (d.y < -5) { d.y = this.h + 5; d.x = Math.random() * this.w; }
      if (d.x < -5) d.x = this.w + 5;
      if (d.x > this.w + 5) d.x = -5;
      oc.globalAlpha = d.alpha;
      oc.fillRect(d.x, d.y, d.size, d.size);
    });

    // Main particles
    for (let i = 0; i < this.particles.length; i++) {
      this.particles[i].update(t, this.mx, this.my, this.mActive);
      this.particles[i].draw(oc);
    }
    oc.globalAlpha = 1;

    // COMPOSITE: Layer 1 — blurred glow (drawn from offscreen)
    mc.save();
    mc.filter = `blur(${this.isMobile ? 3 : 5}px)`;
    mc.globalAlpha = 0.6;
    mc.drawImage(this._offscreen, 0, 0, this.w, this.h);
    mc.restore();

    // COMPOSITE: Layer 2 — sharp crisp particles on top
    mc.drawImage(this._offscreen, 0, 0, this.w, this.h);

    requestAnimationFrame(ts2 => this._loop(ts2));
  }
}
