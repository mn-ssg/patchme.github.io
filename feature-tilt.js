/* ============================================
   Bento Grid — Card Tilt Animation
   feature-tilt.js
   ============================================ */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.m-fg-card').forEach(card => {

    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const dx = (e.clientX - rect.left - rect.width  / 2) / (rect.width  / 2); // -1~1
      const dy = (e.clientY - rect.top  - rect.height / 2) / (rect.height / 2); // -1~1

      const rotY =  dx * 10;
      const rotX = -dy *  8;

      card.style.transition = 'transform 0.1s ease-out';
      card.style.transform  =
        `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.025)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transition = 'transform 0.7s cubic-bezier(0.16,1,0.3,1), ' +
                              'opacity 0.7s ease';
      card.style.transform  = '';
      card.addEventListener('transitionend', () => {
        card.style.transition = '';
      }, { once: true });
    });
  });
});
