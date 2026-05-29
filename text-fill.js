/* ============================================
   Text Fill on Scroll — text-fill.js
   About 섹션 제목의 글자별 순차 채우기 애니메이션
   ============================================ */

const TextFill = (() => {
  const DIM            = 'rgba(255,255,255,0.12)';
  const WHITE          = '#ffffff';
  const ACCENT         = '#4cfdbf';
  const CHARS_PER_STEP = 10;   // 스크롤 1회당 채울 글자 수
  const STAGGER        = 0.045; // 글자 간 지연 (초)
  const FILL_DURATION  = 0.35; // 글자 하나 채우기 시간

  let chars   = [];
  let filled  = 0;     // 다음에 채울 글자 인덱스
  let filling = false; // 애니메이션 진행 중 플래그
  let ready   = false;

  /* ── init ──────────────────────────────────
     SplitText로 .t-about-heading을 글자별로 분리하고
     모든 글자를 어두운 색으로 초기화합니다.          */
  function init() {
    const heading = document.querySelector('.t-about-heading');
    if (!heading) return;

    /* SplitText로 글자 분리 (공백 포함) */
    const split = new SplitText(heading, {
      type: 'chars',
      charsClass: 'tf-char'
    });
    chars = split.chars;

    /* 모든 글자 어둡게 시작 */
    gsap.set(chars, { color: DIM, opacity: 1 });

    filled  = 0;
    filling = false;
    ready   = true;
  }

  /* ── reset ─────────────────────────────────
     섹션 재진입 시 모든 글자를 다시 어둡게 초기화   */
  function reset() {
    if (!ready) return;
    gsap.killTweensOf(chars);
    gsap.set(chars, { color: DIM });
    filled  = 0;
    filling = false;
  }

  function isDone()    { return ready && filled >= chars.length; }
  function isAtStart() { return !ready || filled <= 0; }

  /* ── advance ────────────────────────────────
     direction  1: 다음 배치 글자들을 white로 채움
     direction -1: 이전 배치 글자들을 다시 어둡게    */
  function advance(direction) {
    if (!ready || filling) return;

    if (direction > 0) {
      if (isDone()) return;
      filling = true;

      const end   = Math.min(chars.length, filled + CHARS_PER_STEP);
      const batch = chars.slice(filled, end);

      batch.forEach((char, i) => {
        gsap.to(char, {
          color: char.closest('.tf-accent-word') ? ACCENT : WHITE,
          duration: FILL_DURATION,
          delay: i * STAGGER,
          ease: 'power2.out',
          overwrite: 'auto'
        });
      });

      filled = end;

      /* 배치 전체 애니메이션이 끝난 후 플래그 해제 */
      const totalTime = (batch.length - 1) * STAGGER + FILL_DURATION;
      gsap.delayedCall(totalTime, () => { filling = false; });

    } else {
      if (isAtStart()) return;
      filling = true;

      const start = Math.max(0, filled - CHARS_PER_STEP);
      const batch = chars.slice(start, filled).reverse();

      batch.forEach((char, i) => {
        gsap.to(char, {
          color: DIM,
          duration: 0.25,
          delay: i * 0.035,
          ease: 'power2.in',
          overwrite: 'auto'
        });
      });

      filled = start;

      const totalTime = (batch.length - 1) * 0.035 + 0.25;
      gsap.delayedCall(totalTime, () => { filling = false; });
    }
  }

  return { init, reset, advance, isDone, isAtStart };
})();
