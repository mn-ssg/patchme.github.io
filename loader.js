/* ============================================
   PATCH ME — Site Loader
   loader.js
   ============================================ */
(function () {
  const loader   = document.getElementById('site-loader');
  const fillEl   = document.getElementById('sl-fill');
  const pctEl    = document.getElementById('sl-pct');
  const statusEl = document.getElementById('sl-status');

  if (!loader || !fillEl || !pctEl || !statusEl) return;

  /* 이미 이번 세션에서 로더를 본 경우 즉시 숨김 */
  if (sessionStorage.getItem('patchme-loaded')) {
    loader.style.display = 'none';
    return;
  }

  /* 단계별 상태 메시지 */
  const STATUSES = [
    'INITIALIZING SYSTEM',
    'LOADING MATERIALS',
    'CALIBRATING FABRIC',
    'PATCHING INTERFACE',
    'COMPILING OUTPUT',
    'SYSTEM READY',
  ];

  const TOTAL_MS = 2600;  /* 총 소요 시간 (ms) */
  const TICK_MS  = 18;    /* 업데이트 간격 */
  const TICKS    = TOTAL_MS / TICK_MS;

  /* easeInOutQuart — 처음 빠르게, 중간 느리게, 마지막 빠르게 */
  function ease(t) {
    return t < 0.5
      ? 8 * t * t * t * t
      : 1 - Math.pow(-2 * t + 2, 4) / 2;
  }

  /* 세 자리 패딩 (000, 023, 100) */
  function pad3(n) {
    if (n < 10)  return '00' + n;
    if (n < 100) return '0' + n;
    return '' + n;
  }

  let tick    = 0;
  let prevPct = -1;

  const timer = setInterval(() => {
    tick++;
    const raw = Math.min(tick / TICKS, 1);
    const pct = Math.round(ease(raw) * 100);

    /* 프로그레스 바 */
    fillEl.style.width = pct + '%';

    /* 퍼센트 숫자 — 값이 바뀔 때만 업데이트 + flash */
    if (pct !== prevPct) {
      pctEl.textContent = pad3(pct);
      prevPct = pct;

      /* 10의 배수마다 짧은 teal 플래시 */
      if (pct % 10 === 0 && pct > 0) {
        pctEl.classList.add('sl-pct--flash');
        setTimeout(() => pctEl.classList.remove('sl-pct--flash'), 120);
      }
    }

    /* 상태 메시지 */
    const idx = Math.min(
      STATUSES.length - 1,
      Math.floor(raw * STATUSES.length)
    );
    statusEl.textContent = STATUSES[idx];

    /* 완료 */
    if (tick >= TICKS) {
      clearInterval(timer);
      fillEl.style.width   = '100%';
      pctEl.textContent    = '100';
      statusEl.textContent = 'SYSTEM READY';

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
