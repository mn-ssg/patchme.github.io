/* ============================================
   FOUR STEPS TO FREEDOM — Drag Slider
   steps-slider.js
   ============================================ */
document.addEventListener('DOMContentLoaded', () => {
  const wrap   = document.getElementById('pfs-slider-wrap');
  const slider = document.getElementById('pfs-slider');
  const fillEl = document.getElementById('pfs-progress-fill');

  if (!slider || !wrap) return;

  const cards = slider.querySelectorAll('.pfs-card');
  const total = cards.length;
  let current = 0;

  /* ── 카드 1칸 이동 거리 (카드 폭 + 갭) ── */
  function stepW() {
    if (!cards[0]) return 0;
    const gap = parseFloat(getComputedStyle(slider).gap) || 20;
    return cards[0].offsetWidth + gap;
  }

  /* ── 드래그 허용 범위 ── */
  function minX() { return -(total - 1) * stepW(); } // 마지막 카드
  function maxX() { return 0; }                       // 첫 카드

  /* ── 인덱스로 이동 ── */
  function goTo(index, animate = true) {
    current = Math.max(0, Math.min(total - 1, index));
    if (!animate) slider.style.transition = 'none';
    slider.style.transform = `translateX(${-current * stepW()}px)`;
    if (!animate) requestAnimationFrame(() => { slider.style.transition = ''; });
    if (fillEl) fillEl.style.width = `${((current + 1) / total) * 100}%`;
  }

  /* ── 마우스 드래그 ── */
  let dragX = null;
  let baseX = 0;

  wrap.addEventListener('mousedown', e => {
    dragX  = e.clientX;
    baseX  = -current * stepW();
    slider.style.transition = 'none';
    wrap.classList.add('is-dragging');
    window.sliderDragging = true; // GSAP Observer 차단
    e.preventDefault();
  });

  window.addEventListener('mousemove', e => {
    if (dragX === null) return;
    const raw = baseX + e.clientX - dragX;
    // 범위 초과 시 저항감 (rubber-band)
    const clamped = raw > maxX()
      ? maxX() + (raw - maxX()) * 0.2
      : raw < minX() ? minX() + (raw - minX()) * 0.2 : raw;
    slider.style.transform = `translateX(${clamped}px)`;
  });

  window.addEventListener('mouseup', e => {
    if (dragX === null) return;
    wrap.classList.remove('is-dragging');
    slider.style.transition = '';
    const delta = e.clientX - dragX;
    dragX = null;
    window.sliderDragging = false;
    if (Math.abs(delta) > 55) goTo(delta < 0 ? current + 1 : current - 1);
    else goTo(current);
  });

  /* ── 터치 ── */
  let touchX = null;

  wrap.addEventListener('touchstart', e => {
    touchX = e.touches[0].clientX;
    slider.style.transition = 'none';
    window.sliderDragging = true;
  }, { passive: true });

  wrap.addEventListener('touchmove', e => {
    if (touchX === null) return;
    const base = -current * stepW();
    const raw  = base + e.touches[0].clientX - touchX;
    const clamped = Math.max(minX(), Math.min(maxX(), raw));
    slider.style.transform = `translateX(${clamped}px)`;
  }, { passive: true });

  wrap.addEventListener('touchend', e => {
    if (touchX === null) return;
    slider.style.transition = '';
    const delta = e.changedTouches[0].clientX - touchX;
    touchX = null;
    window.sliderDragging = false;
    if (Math.abs(delta) > 45) goTo(delta < 0 ? current + 1 : current - 1);
    else goTo(current);
  });

  goTo(0);
  window.addEventListener('resize', () => goTo(current, false));
});
