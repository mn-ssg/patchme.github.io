/* ============================================
   Feature List — Tilt & Description Reveal
   feature-tilt.js
   ============================================ */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.m-feature-item').forEach(item => {
    const bg   = item.querySelector('.m-feature-bg');
    const desc = item.querySelector('.m-feature-desc');
    if (!bg) return;

    /* ── Background tilt ── */
    item.addEventListener('mousemove', e => {
      const rect = item.getBoundingClientRect();
      const dx = (e.clientX - rect.left - rect.width  / 2) / (rect.width  / 2);
      const dy = (e.clientY - rect.top  - rect.height / 2) / (rect.height / 2);

      const rotY =  dx * 12;
      const rotX = -dy *  5;

      bg.style.transition = 'transform 0.1s ease-out';
      bg.style.transform  = `perspective(700px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.07)`;
    });

    item.addEventListener('mouseleave', () => {
      bg.style.transition = 'transform 0.75s cubic-bezier(0.16,1,0.3,1)';
      bg.style.transform  = '';
      bg.addEventListener('transitionend', () => {
        bg.style.transition = '';
      }, { once: true });
    });
  });
});
