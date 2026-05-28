/* ============================================
   PATCH ME — Full-page scroll animation
   Ref: codepen.io/BrianCross/pen/PoWapLP
   ============================================ */

gsap.registerPlugin(Observer, SplitText);

const sections = Array.from(document.querySelectorAll('.anim-section'));
if (!sections.length) { throw new Error('no anim-sections'); }

/* Activate fixed-section layout via CSS */
document.body.classList.add('anim-active');
gsap.set(sections, { autoAlpha: 0 });

/* Create outer/inner wrappers for each section (wipe effect) */
sections.forEach(section => {
  const outer = document.createElement('div');
  outer.className = 'scroll-outer';
  const inner = document.createElement('div');
  inner.className = 'scroll-inner';
  while (section.firstChild) inner.appendChild(section.firstChild);
  outer.appendChild(inner);
  section.appendChild(outer);
});

const outerWrappers = sections.map(s => s.querySelector('.scroll-outer'));
const innerWrappers = sections.map(s => s.querySelector('.scroll-inner'));

let splitHeadings = [];
let currentIndex  = -1;
let animating     = false;
const topNav      = document.querySelector('.top-nav');

/* About 섹션 인덱스 (text-fill.js의 TextFill이 로드된 경우에만 사용) */
const aboutIdx = sections.findIndex(s => s.classList.contains('t-about'));

/* Initial wipe state */
gsap.set(outerWrappers, { yPercent: 100 });
gsap.set(innerWrappers, { yPercent: -100 });

/* ── Internal-scroll helper ────────────────────────
   For sections whose content is taller than the viewport,
   allow the user to scroll *inside* the section before
   transitioning to the next/previous section.            */
function canScrollInternally(direction) {
  if (currentIndex < 0) return false;
  const inner = innerWrappers[currentIndex];
  if (!inner) return false;

  /* Only sections with overflow-y: auto/scroll can actually scroll */
  const style = getComputedStyle(inner);
  if (style.overflowY !== 'auto' && style.overflowY !== 'scroll') return false;

  /* Check if there's actually content to scroll (content taller than container) */
  if (inner.scrollHeight <= inner.clientHeight + 2) return false;

  const tolerance = 2; /* px rounding tolerance */

  if (direction === 1) {
    return inner.scrollTop + inner.clientHeight < inner.scrollHeight - tolerance;
  } else {
    return inner.scrollTop > tolerance;
  }
}

function gotoSection(index, direction) {
  index = Math.max(0, Math.min(sections.length - 1, index));
  if (index === currentIndex) { animating = false; return; }
  animating = true;
  const dFactor = direction === -1 ? -1 : 1;

  /* Nav style: transparent on hero, dark everywhere else */
  if (topNav) topNav.classList.toggle('scrolled', index > 0);

  const tl = gsap.timeline({
    defaults: { duration: 1.25, ease: 'power1.inOut' },
    onComplete: () => { animating = false; }
  });

  /* ── Outgoing section ───────────────────────── */
  if (currentIndex >= 0) {
    const prevInner = innerWrappers[currentIndex];
    if (prevInner) prevInner.scrollTop = 0;

    gsap.set(sections[currentIndex], { zIndex: 0 });
    tl.to(innerWrappers[currentIndex], { yPercent: -15 * dFactor })
      .set(sections[currentIndex], { autoAlpha: 0 });
  }

  /* ── Incoming section (wipe) ────────────────── */
  gsap.set(sections[index], { autoAlpha: 1, zIndex: 1 });
  tl.fromTo(
    [outerWrappers[index], innerWrappers[index]],
    { yPercent: i => i ? -100 * dFactor : 100 * dFactor },
    { yPercent: 0 },
    0
  );

  /* ── Heading animation ──────────────────────── */
  const glitchH = sections[index].querySelector('.anim-heading.glitch-text');
  if (glitchH) {
    tl.fromTo(glitchH,
      { autoAlpha: 0, y: 40 * dFactor },
      { autoAlpha: 1, y: 0, duration: 1, ease: 'power2.out' },
      0.3
    );
  }

  if (splitHeadings[index]) {
    tl.fromTo(splitHeadings[index].chars,
      { autoAlpha: 0, yPercent: 120 * dFactor },
      {
        autoAlpha: 1, yPercent: 0, duration: 1, ease: 'power2',
        stagger: { each: 0.025, from: 'random' }
      },
      0.3
    );
  }

  /* Trigger IO-based reveal animations inside the incoming section */
  sections[index].querySelectorAll('.m-fg-card').forEach(card => {
    card.classList.add('is-visible');
  });

  /* ── About 섹션 진입: TextFill 리셋 ── */
  if (index === aboutIdx && typeof TextFill !== 'undefined') {
    TextFill.reset();
  }

  currentIndex = index;
}

/* Run after script.js DOMContentLoaded so m-reveal classes are already added */
document.addEventListener('DOMContentLoaded', () => {
  /* Hand off anim-heading elements from IO-based reveals to GSAP */
  sections.forEach(sec => {
    sec.querySelectorAll('.anim-heading').forEach(h => {
      h.classList.remove('m-reveal', 'm-reveal-left', 'm-reveal-right', 'm-reveal-scale');
      gsap.set(h, { clearProps: 'opacity,transform,y,x,visibility' });
    });
  });

  /* Pre-split non-glitch headings for char-by-char animation */
  splitHeadings = sections.map(sec => {
    const h = sec.querySelector('.anim-heading:not(.glitch-text)');
    return h ? new SplitText(h, { type: 'chars' }) : null;
  });

  /* TextFill 초기화 (team.html에 text-fill.js가 로드된 경우에만) */
  if (typeof TextFill !== 'undefined') {
    TextFill.init();
  }

  Observer.create({
    type: 'wheel,touch,pointer',
    wheelSpeed: -1,
    onDown: () => {
      if (animating || window.sliderDragging) return;
      if (canScrollInternally(-1)) return;

      /* About 섹션: fill 되감기 */
      if (currentIndex === aboutIdx &&
          typeof TextFill !== 'undefined' &&
          !TextFill.isAtStart()) {
        TextFill.advance(-1);
        return;
      }

      gotoSection(currentIndex - 1, -1);
    },
    onUp: () => {
      if (animating || window.sliderDragging) return;
      if (canScrollInternally(1)) return;

      /* About 섹션: fill 완료 전까지 다음 섹션 전환 차단 */
      if (currentIndex === aboutIdx &&
          typeof TextFill !== 'undefined' &&
          !TextFill.isDone()) {
        TextFill.advance(1);
        return;
      }

      gotoSection(currentIndex + 1, 1);
    },
    tolerance: 10,
    preventDefault: false
  });

  /* 첫 섹션은 wipe 없이 즉시 표시 (팀·프로덕트 진입 시 불필요한 애니메이션 제거) */
  gsap.set(sections[0], { autoAlpha: 1, zIndex: 1 });
  gsap.set(outerWrappers[0], { yPercent: 0 });
  gsap.set(innerWrappers[0], { yPercent: 0 });

  /* 첫 섹션의 글리치 헤딩 즉시 표시 */
  const firstGlitch = sections[0].querySelector('.anim-heading.glitch-text');
  if (firstGlitch) gsap.set(firstGlitch, { autoAlpha: 1, y: 0 });

  /* 첫 섹션의 SplitText 헤딩 즉시 표시 */
  if (splitHeadings[0]) {
    gsap.set(splitHeadings[0].chars, { autoAlpha: 1, yPercent: 0 });
  }

  /* feature item 등 reveal 트리거 */
  sections[0].querySelectorAll('.m-feature-item').forEach(item => {
    item.classList.add('is-visible');
  });

  if (topNav) topNav.classList.toggle('scrolled', false);

  if (0 === aboutIdx && typeof TextFill !== 'undefined') TextFill.reset();

  currentIndex = 0;
});
