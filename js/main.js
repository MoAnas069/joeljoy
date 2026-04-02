/* ═══════════════════════════════════════════════════════════════
   HOMEPAGE MAIN — Cinematic Gold Dust Experience
   ═══════════════════════════════════════════════════════════════ */

import { GlitterSystem } from './particles.js';
import { initNavigation, initRevealAnimations, initSmoothScroll } from './nav.js';

document.fonts.ready.then(() => {
  // Initialize cinematic particle system
  const glitter = new GlitterSystem('particle-canvas', 'JR');

  // After particles form THE J, schedule a subtle scroll-triggered scatter
  let scattered = false;
  window.addEventListener('scroll', () => {
    if (!scattered && window.scrollY > window.innerHeight * 0.3) {
      scattered = true;
      glitter.scatter();
    }
    if (scattered && window.scrollY < 100) {
      scattered = false;
      glitter.morphToText('JR');
    }
  });

  initNavigation();
  initRevealAnimations();
  initSmoothScroll();
});
