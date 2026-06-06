/* interactions.js — additive interactions. Safe to include on any page.
   Remove the <script> tag to fully disable. */
(function () {
  'use strict';
  const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const TOUCH   = matchMedia('(hover: none), (pointer: coarse)').matches || ('ontouchstart' in window);
  const CURSOR_OK = !REDUCED && !TOUCH;
  const MOTION_OK = !REDUCED;
  window.__patchmeFX = { REDUCED, TOUCH, CURSOR_OK, MOTION_OK };

  function initCursor() {
    const dot = document.createElement('div'); dot.className = 'fx-cur-dot';
    const ring = document.createElement('div'); ring.className = 'fx-cur-ring';
    document.body.append(dot, ring);
    document.body.classList.add('cursor-custom');

    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
    addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      dot.style.left = mx + 'px'; dot.style.top = my + 'px';
    });
    (function loop() {
      rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
      ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
      requestAnimationFrame(loop);
    })();

    const hoverSel = 'a, button, input, .nav-link, .nav-logo, .m-fg-card, .pfs-card, .pfs-slider-wrap, .glitch-text, .m-sol-cell, [data-magnetic]';
    document.querySelectorAll(hoverSel).forEach(el => {
      el.addEventListener('mouseenter', () => ring.classList.add('big'));
      el.addEventListener('mouseleave', () => ring.classList.remove('big'));
    });

    const magSel = '.nav-link, .nav-logo, .p-join-btn, [data-magnetic]';
    document.querySelectorAll(magSel).forEach(el => {
      const inner = el.querySelector('span') || el;
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        el.style.transform = `translate(${x * 0.4}px, ${y * 0.5}px)`;
        if (inner !== el) inner.style.transform = `translate(${x * 0.2}px, ${y * 0.25}px)`;
      });
      el.addEventListener('mouseleave', () => {
        el.style.transition = 'transform .4s cubic-bezier(.16,1,.3,1)';
        el.style.transform = '';
        if (inner !== el) inner.style.transform = '';
        setTimeout(() => { el.style.transition = ''; }, 400);
      });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (CURSOR_OK) initCursor();
  });
})();
