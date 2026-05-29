/* ============================================
   PATCH ME — Site Loader
   loader.js
   ============================================ */
(function () {
  const loader = document.getElementById('site-loader');
  const fillEl = document.getElementById('sl-fill');

  if (!loader || !fillEl) return;

  /* 이미 이번 세션에서 로더를 본 경우 즉시 숨김 */
  if (sessionStorage.getItem('patchme-loaded')) {
    loader.style.display = 'none';
    return;
  }

  const TOTAL_MS = 2600;  /* 총 소요 시간 (ms) */
  const TICK_MS  = 18;    /* 업데이트 간격 */
  const TICKS    = TOTAL_MS / TICK_MS;

  /* easeInOutQuart — 처음 빠르게, 중간 느리게, 마지막 빠르게 */
  function ease(t) {
    return t < 0.5
      ? 8 * t * t * t * t
      : 1 - Math.pow(-2 * t + 2, 4) / 2;
  }

  let tick = 0;

  const timer = setInterval(() => {
    tick++;
    const raw = Math.min(tick / TICKS, 1);
    fillEl.style.width = Math.round(ease(raw) * 100) + '%';

    /* 완료 */
    if (tick >= TICKS) {
      clearInterval(timer);
      fillEl.style.width = '100%';

      /* 세션 기록 후 페이드 아웃 */
      sessionStorage.setItem('patchme-loaded', '1');
      setTimeout(() => {
        loader.classList.add('sl--done');
        loader.addEventListener('transitionend', () => {
          loader.style.display = 'none';
        }, { once: true });
      }, 380);
    }
  }, TICK_MS);
})();
