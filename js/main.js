/* ═══════════════════════════════════════════════════════════════
   HOMEPAGE MAIN — Minimal Gateway
   ═══════════════════════════════════════════════════════════════ */

import { GlitterSystem } from './particles.js';
import { initNavigation, initRevealAnimations, initSmoothScroll, initCountUp } from './nav.js';

document.fonts.ready.then(() => {
  // Initialize micro-glitter particle system
  const glitter = new GlitterSystem('particle-canvas', 'THE J');

  // After particles form THE J, schedule a subtle scroll-triggered scatter
  let scattered = false;
  window.addEventListener('scroll', () => {
    if (!scattered && window.scrollY > window.innerHeight * 0.3) {
      scattered = true;
      glitter.scatter();
    }
    if (scattered && window.scrollY < 100) {
      scattered = false;
      glitter.morphToText('THE J');
    }
  });

  initNavigation();
  initRevealAnimations();
  initSmoothScroll();
  initCountUp();
});
