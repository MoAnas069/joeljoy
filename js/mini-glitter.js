/* ═══════════════════════════════════════════════════════════════
   MINI GLITTER — Lightweight inline real-estate shape outlines
   Used on inner pages as a decorative section divider.
   ~300 particles, no blur filter, no offscreen canvas.
   ═══════════════════════════════════════════════════════════════ */

const SHAPES = {
  house: (count) => {
    const pts = [];
    for (let i = 0; i < count; i++) {
      const r = Math.random();
      let x, y;
      if (r < 0.25) { // roof left
        const t = Math.random();
        x = -0.5 + t * 0.5; y = -t * 0.5;
      } else if (r < 0.5) { // roof right
        const t = Math.random();
        x = t * 0.5; y = -0.5 + t * 0.5;
      } else if (r < 0.6) { // left wall
        x = -0.5; y = Math.random() * 0.5;
      } else if (r < 0.7) { // right wall
        x = 0.5; y = Math.random() * 0.5;
      } else if (r < 0.8) { // base
        x = -0.5 + Math.random(); y = 0.5;
      } else if (r < 0.9) { // door
        x = -0.08 + Math.random() * 0.16; y = 0.2 + Math.random() * 0.3;
      } else { // window left
        const wx = -0.3 + Math.random() * 0.12;
        const wy = 0.1 + Math.random() * 0.12;
        x = wx; y = wy;
      }
      pts.push({ x, y });
    }
    return pts;
  },

  key: (count) => {
    const pts = [];
    for (let i = 0; i < count; i++) {
      const r = Math.random();
      let x, y;
      if (r < 0.35) { // bow circle
        const a = Math.random() * Math.PI * 2;
        const rad = 0.22 + (Math.random() - 0.5) * 0.04;
        x = Math.cos(a) * rad; y = -0.38 + Math.sin(a) * rad;
      } else if (r < 0.65) { // shaft
        x = (Math.random() - 0.5) * 0.04; y = -0.16 + Math.random() * 0.7;
      } else if (r < 0.82) { // teeth
        const t = Math.floor(Math.random() * 3);
        x = 0.02 + Math.random() * 0.15; y = 0.32 + t * 0.09;
      } else { // teeth vertical tips
        const t = Math.floor(Math.random() * 3);
        x = 0.15; y = 0.3 + t * 0.09 + Math.random() * 0.06;
      }
      pts.push({ x, y });
    }
    return pts;
  },

  skyline: (count) => {
    const pts = [];
    const buildings = [
      { x: -0.7, w: 0.1, h: 0.25 }, { x: -0.55, w: 0.08, h: 0.5 },
      { x: -0.42, w: 0.1, h: 0.4 }, { x: -0.28, w: 0.06, h: 0.65 },
      { x: -0.18, w: 0.1, h: 0.45 }, { x: -0.04, w: 0.08, h: 0.8 },
      { x: 0.08, w: 0.1, h: 0.55 }, { x: 0.22, w: 0.07, h: 0.7 },
      { x: 0.32, w: 0.1, h: 0.35 }, { x: 0.46, w: 0.08, h: 0.5 },
      { x: 0.58, w: 0.1, h: 0.3 },
    ];
    const per = Math.floor(count / buildings.length);
    buildings.forEach(b => {
      for (let i = 0; i < per; i++) {
        const s = Math.random();
        const base = 0.35;
        if (s < 0.35) pts.push({ x: b.x + Math.random() * b.w, y: base - b.h }); // top edge
        else if (s < 0.55) pts.push({ x: b.x, y: base - Math.random() * b.h }); // left wall
        else if (s < 0.75) pts.push({ x: b.x + b.w, y: base - Math.random() * b.h }); // right wall
        else pts.push({ x: b.x + Math.random() * b.w, y: base }); // base
      }
    });
    // ground line
    for (let i = 0; i < 30; i++) pts.push({ x: -0.8 + Math.random() * 1.6, y: 0.35 });
    return pts;
  },

  handshake: (count) => {
    const pts = [];
    for (let i = 0; i < count; i++) {
      const r = Math.random();
      let x, y;
      if (r < 0.2) { // left arm
        const t = Math.random();
        x = -0.6 + t * 0.3; y = -0.1 + t * 0.15;
      } else if (r < 0.4) { // right arm
        const t = Math.random();
        x = 0.3 + t * 0.3; y = 0.05 - t * 0.15;
      } else if (r < 0.7) { // clasped hands center
        const a = Math.random() * Math.PI * 2;
        const rx = 0.15, ry = 0.1;
        x = Math.cos(a) * rx; y = Math.sin(a) * ry;
      } else { // fingers detail
        x = -0.12 + Math.random() * 0.24;
        y = -0.08 + Math.random() * 0.16;
      }
      pts.push({ x, y });
    }
    return pts;
  }
};

// Per-page shape assignments
const PAGE_SHAPES = {
  'about':       'key',
  'buy':         'house',
  'sell':        'handshake',
  'communities': 'skyline',
  'listings':    'house',
  'blog':        'skyline',
  'contact':     'key'
};

class MiniParticle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.tx = x;
    this.ty = y;
    this.vx = 0;
    this.vy = 0;
    this.size = 0.4 + Math.random() * 0.8;
    this.baseAlpha = 0.25 + Math.random() * 0.35;
    this.alpha = this.baseAlpha;
    this.shimmerSpeed = 1.5 + Math.random() * 3;
    this.shimmerOffset = Math.random() * Math.PI * 2;
    this.driftAngle = Math.random() * Math.PI * 2;
    this.driftSpeed = 0.0003 + Math.random() * 0.0008;
    this.driftRadius = 0.15 + Math.random() * 0.4;
    this.ease = 0.02 + Math.random() * 0.02;
    this.friction = 0.94;
    this.isHighlight = Math.random() < 0.12;
  }

  update(t) {
    // Shimmer
    const shimmer = Math.sin(t * this.shimmerSpeed + this.shimmerOffset);
    this.alpha = this.baseAlpha + shimmer * 0.2;
    if (this.isHighlight && shimmer > 0.7) this.alpha = Math.min(1, this.alpha + 0.35);

    // Drift toward target
    this.driftAngle += this.driftSpeed;
    const dx = this.tx - this.x + Math.cos(this.driftAngle) * this.driftRadius;
    const dy = this.ty - this.y + Math.sin(this.driftAngle) * this.driftRadius;
    this.vx += dx * this.ease;
    this.vy += dy * this.ease;
    this.vx *= this.friction;
    this.vy *= this.friction;
    this.x += this.vx;
    this.y += this.vy;
  }

  draw(ctx) {
    if (this.alpha < 0.04) return;
    ctx.globalAlpha = this.alpha;
    ctx.fillRect(this.x - this.size * 0.5, this.y - this.size * 0.5, this.size, this.size);
    if (this.isHighlight && this.alpha > 0.4) {
      ctx.globalAlpha = this.alpha * 0.4;
      const s2 = this.size * 2;
      ctx.fillRect(this.x - s2 * 0.5, this.y - s2 * 0.5, s2, s2);
    }
  }
}

export function initMiniGlitter(canvasId, shapeName) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const isMobile = window.innerWidth < 768;
  const count = isMobile ? 200 : 350;
  const particles = [];
  let paused = false;
  let rafId = null;

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { w, h };
  }

  let { w, h } = resize();
  const cx = w / 2;
  const cy = h / 2;

  // Generate shape points
  const shapeFn = SHAPES[shapeName] || SHAPES.house;
  const pts = shapeFn(count);
  const scaleX = isMobile ? w * 0.35 : w * 0.22;
  const scaleY = isMobile ? h * 0.35 : h * 0.35;

  // Create particles scattered, then assign targets
  for (let i = 0; i < count; i++) {
    const p = new MiniParticle(
      cx + (Math.random() - 0.5) * w * 0.8,
      cy + (Math.random() - 0.5) * h * 0.8
    );
    if (i < pts.length) {
      p.tx = cx + pts[i].x * scaleX;
      p.ty = cy + pts[i].y * scaleY;
    } else {
      p.tx = cx + (Math.random() - 0.5) * w * 0.6;
      p.ty = cy + (Math.random() - 0.5) * h * 0.6;
      p.baseAlpha = 0.04 + Math.random() * 0.08;
      p.size = 0.2 + Math.random() * 0.3;
    }
    particles.push(p);
  }

  ctx.fillStyle = '#D4AF37';

  // Visibility-based pause
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && paused) {
        paused = false;
        rafId = requestAnimationFrame(loop);
      } else if (!entry.isIntersecting && !paused) {
        paused = true;
        if (rafId) cancelAnimationFrame(rafId);
      }
    });
  }, { threshold: 0.05 });
  observer.observe(canvas);

  // Menu pause
  document.addEventListener('menu-toggle', e => {
    if (e.detail && e.detail.open) {
      paused = true;
      if (rafId) cancelAnimationFrame(rafId);
    } else {
      paused = false;
      rafId = requestAnimationFrame(loop);
    }
  });

  window.addEventListener('resize', () => {
    const dims = resize();
    // Re-map targets on resize
    const ncx = dims.w / 2;
    const ncy = dims.h / 2;
    const nsx = (window.innerWidth < 768 ? dims.w * 0.35 : dims.w * 0.22);
    const nsy = dims.h * 0.35;
    particles.forEach((p, i) => {
      if (i < pts.length) {
        p.tx = ncx + pts[i].x * nsx;
        p.ty = ncy + pts[i].y * nsy;
      }
    });
  });

  function loop(ts) {
    if (paused) return;
    const t = ts * 0.001;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#D4AF37';
    for (let i = 0; i < particles.length; i++) {
      particles[i].update(t);
      particles[i].draw(ctx);
    }
    ctx.globalAlpha = 1;
    rafId = requestAnimationFrame(loop);
  }

  rafId = requestAnimationFrame(loop);
}

// Auto-detect page and shape
export function autoInitGlitter() {
  const path = window.location.pathname.replace(/\//g, '').replace('.html', '') || 'index';
  const shapeName = PAGE_SHAPES[path] || 'house';
  initMiniGlitter('mini-glitter-canvas', shapeName);
}
