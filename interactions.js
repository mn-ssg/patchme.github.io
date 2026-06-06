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

  const SCR_CHARS = '!<>-_\\/[]{}—=+*^?#________';
  function scrambleEl(el) {
    if (REDUCED) return;
    const finalHTML = el.dataset.fxFinal || el.innerHTML;
    el.dataset.fxFinal = finalHTML;
    const text = el.textContent;
    const queue = [];
    for (let i = 0; i < text.length; i++) {
      const start = Math.floor(Math.random() * 18);
      const end = start + Math.floor(Math.random() * 18);
      queue.push({ to: text[i], start, end, char: '' });
    }
    let frame = 0;
    (function run() {
      let out = '', done = 0;
      for (const q of queue) {
        if (frame >= q.end) { done++; out += q.to; }
        else if (frame >= q.start) {
          if (!q.char || Math.random() < 0.28) q.char = SCR_CHARS[Math.floor(Math.random() * SCR_CHARS.length)];
          out += `<span class="fx-scr">${q.char}</span>`;
        }
      }
      el.innerHTML = out;
      if (done < queue.length) { frame++; requestAnimationFrame(run); }
      else el.innerHTML = finalHTML; // restore accent spans
    })();
  }

  function initScramble() {
    const targets = [...document.querySelectorAll('.glitch-text')];
    targets.forEach(el => {
      el.classList.add('scramble-active');      // CSS kills the old glitch layers
      el.dataset.fxFinal = el.innerHTML;
      if (!REDUCED) scrambleEl(el);              // decode on load
      el.addEventListener('mouseenter', () => scrambleEl(el)); // re-scramble on hover
    });
    // decode the incoming section's heading on each transition
    addEventListener('patchme:section', e => {
      const sec = document.querySelectorAll('.anim-section')[e.detail.index];
      if (!sec) return;
      const h = sec.querySelector('.glitch-text');
      if (h) scrambleEl(h);
    });
  }

  function initTiltGlow() {
    document.querySelectorAll('.m-fg-card').forEach(card => {
      const spot = document.createElement('div');
      spot.className = 'fx-spot';
      card.appendChild(spot);
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const dx = (e.clientX - r.left - r.width / 2) / (r.width / 2);
        const dy = (e.clientY - r.top - r.height / 2) / (r.height / 2);
        card.style.transition = 'transform .1s ease-out';
        card.style.transform =
          `perspective(900px) rotateX(${-dy * 8}deg) rotateY(${dx * 10}deg) scale(1.025)`;
        spot.style.opacity = '1';
        spot.style.background =
          `radial-gradient(circle at ${e.clientX - r.left}px ${e.clientY - r.top}px, rgba(76,253,191,.30), transparent 55%)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transition = 'transform .7s cubic-bezier(.16,1,.3,1)';
        card.style.transform = '';
        spot.style.opacity = '0';
      });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (CURSOR_OK) initCursor();
    initScramble();
    initTiltGlow();
  });
})();
