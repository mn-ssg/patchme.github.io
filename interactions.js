/* interactions.js — additive interactions. Safe to include on any page.
   Remove the <script> tag to fully disable. */
(function () {
  'use strict';
  const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const TOUCH   = matchMedia('(hover: none), (pointer: coarse)').matches || ('ontouchstart' in window);
  const CURSOR_OK = !REDUCED && !TOUCH;
  const MOTION_OK = !REDUCED;
  window.__patchmeFX = { REDUCED, TOUCH, CURSOR_OK, MOTION_OK };

  document.addEventListener('DOMContentLoaded', () => {
    // modules added in later tasks
    console.log('[interactions] init', window.__patchmeFX);
  });
})();
