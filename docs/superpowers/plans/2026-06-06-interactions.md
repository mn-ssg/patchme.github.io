# Award-Level Interactions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 5 polished interactions (custom cursor + magnetic, text scramble, scroll-velocity reaction, 3D tilt + neon spotlight) to `index.html` via one additive script, keeping the existing GSAP section-snap scroll intact.

**Architecture:** A single new `interactions.js` (5 self-guarding modules) + `interactions.css`, loaded after existing scripts on `index.html`. The only edit to fragile existing JS is one dispatched `CustomEvent` in `scroll-anim.js`. Effects auto-disable on touch / `prefers-reduced-motion`.

**Tech Stack:** Vanilla JS (rAF lerp loops), CSS, existing GSAP (untouched). No new libraries. No build step (static GitHub Pages site).

**Spec:** `docs/superpowers/specs/2026-06-06-interactions-design.md`

**Verification model:** No unit-test runner exists. "Tests" = a Playwright harness (`/tmp/verify-interactions.mjs`) that loads the page through a local server, asserts zero console errors, drives wheel events to confirm the section-snap sequence still works, and screenshots for visual confirmation. Each task runs it.

---

## File Structure

| File | Responsibility | Action |
|------|----------------|--------|
| `interactions.js` | All 5 interaction modules + env guards | Create |
| `interactions.css` | Cursor, magnetic, scramble-neutralize, spotlight, marquee styles | Create |
| `index.html` | Link the two new files; remove `feature-tilt.js` include; add CTA marquee markup | Modify |
| `scroll-anim.js` | Dispatch one `patchme:section` CustomEvent in `gotoSection` | Modify (1 line) |
| `feature-tilt.js` | Logic absorbed + upgraded by `interactions.js` tiltGlow | Delete |

**Coordination decisions (locked):**
- **Scramble targets only `.glitch-text` headings** (hero `PATCH ME`, `THE FRICTION PROTOCOL`, CTA `READY FOR DEPLOYMENT?`). These are NOT split by GSAP `SplitText`, so there is no markup conflict. SplitText char-reveal headings (`WRONG SKIN`, `SYSTEM SPECIFICATIONS`) keep their existing animation untouched.
- **Glitch is neutralized via CSS, not by editing `script.js`:** the scramble module adds `.scramble-active` to each `.glitch-text`; CSS hides the `::before/::after` glitch layers. `script.js` stays untouched.
- **05 transition reaction = CTA marquee** (the demo the user loved), driven by `patchme:section`. No skew is applied to GSAP-animated nodes (avoids transform conflicts).

---

## Task 0: Pre-flight — start servers & save the verification harness

**Files:**
- Create: `/tmp/verify-interactions.mjs`

- [ ] **Step 1: Start a static server at repo root (for the page + assets)**

Run from repo root:
```bash
python3 -m http.server 8123 >/tmp/patchme-server.log 2>&1 &
sleep 1 && curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8123/index.html
```
Expected: `200`

- [ ] **Step 2: Write the verification harness**

Create `/tmp/verify-interactions.mjs`:
```js
import pw from '/Users/minguri/.npm/_npx/705bc6b22212b352/node_modules/playwright/index.js';
const { chromium } = pw;
import { mkdirSync } from 'fs';
mkdirSync('/tmp/patchme-shots', { recursive: true });

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));
await page.addInitScript(() => sessionStorage.setItem('patchme-loaded', '1'));
await page.goto('http://localhost:8123/index.html', { waitUntil: 'networkidle' });
await page.waitForTimeout(2500);

async function visible() {
  return page.evaluate(() => {
    const s = [...document.querySelectorAll('.anim-section')]
      .find(x => getComputedStyle(x).opacity === '1' && getComputedStyle(x).visibility !== 'hidden');
    return s ? s.id : 'none';
  });
}
const seq = [await visible()];
for (let i = 0; i < 5; i++) {
  await page.mouse.move(720, 450);
  await page.mouse.wheel(0, 140);
  await page.waitForTimeout(1700);
  seq.push(await visible());
}
await page.screenshot({ path: '/tmp/patchme-shots/verify-final.png' });
console.log('SECTION SEQUENCE:', seq.join(' -> '));
console.log('CONSOLE ERRORS:', errors.length ? errors.slice(0, 10) : 'NONE');
await browser.close();
console.log(errors.length ? 'FAIL' : 'PASS');
```

- [ ] **Step 3: Establish the baseline**

Run: `node /tmp/verify-interactions.mjs`
Expected: `SECTION SEQUENCE: hero -> problem -> solution -> p-friction -> features -> cta` and `CONSOLE ERRORS: NONE` and `PASS`. This is the snap behavior every later task must preserve.

---

## Task 1: Scaffold `interactions.js` + `interactions.css` (env guards only)

**Files:**
- Create: `interactions.js`
- Create: `interactions.css`
- Modify: `index.html` (add `<link>` and `<script>`)

- [ ] **Step 1: Create `interactions.css` with the env/cursor base (empty effect blocks for now)**

```css
/* interactions.css — award-level interactions. Isolated & reversible. */

/* hide OS cursor only when custom cursor is active */
body.cursor-custom { cursor: none; }
body.cursor-custom a, body.cursor-custom button { cursor: none; }
```

- [ ] **Step 2: Create `interactions.js` skeleton with guards**

```js
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
```

- [ ] **Step 3: Wire both files into `index.html`**

In `index.html`, add the stylesheet after `loader.css` (around line 13):
```html
  <link rel="stylesheet" href="interactions.css">
```
Add the script as the LAST script, after `scroll-anim.js` (around line 324):
```html
<script src="interactions.js"></script>
```

- [ ] **Step 4: Verify nothing broke**

Run: `node /tmp/verify-interactions.mjs`
Expected: same section sequence as baseline, `CONSOLE ERRORS: NONE`, `PASS`. (The `[interactions] init` log is type `log`, not `error`, so it is ignored.)

- [ ] **Step 5: Commit**

```bash
git add interactions.js interactions.css index.html
git commit -m "feat(interactions): scaffold additive interactions module with env guards

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 2: Custom cursor + magnetic (effect 01)

**Files:**
- Modify: `interactions.js` (add `initCursor`, call it)
- Modify: `interactions.css` (cursor + magnetic styles)

- [ ] **Step 1: Add cursor + magnetic CSS to `interactions.css`**

```css
/* --- custom cursor --- */
.fx-cur-dot, .fx-cur-ring {
  position: fixed; top: 0; left: 0; border-radius: 50%;
  pointer-events: none; z-index: 99999;
  transform: translate(-50%, -50%); mix-blend-mode: difference;
}
.fx-cur-dot  { width: 7px; height: 7px; background: #fff; }
.fx-cur-ring {
  width: 38px; height: 38px; border: 1px solid var(--accent);
  transition: width .25s, height .25s, background .25s, opacity .25s;
}
.fx-cur-ring.big {
  width: 74px; height: 74px; background: rgba(76,253,191,.12);
}
```

- [ ] **Step 2: Add `initCursor()` to `interactions.js` and call it**

Inside the IIFE, add this function:
```js
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
```
Update the DOMContentLoaded block:
```js
  document.addEventListener('DOMContentLoaded', () => {
    if (CURSOR_OK) initCursor();
  });
```

- [ ] **Step 3: Verify desktop behavior + no regression**

Run: `node /tmp/verify-interactions.mjs`
Expected: section sequence unchanged, `CONSOLE ERRORS: NONE`, `PASS`. Open `http://localhost:8123/index.html` in a real browser: confirm the neon ring follows the mouse with lag, grows over nav links/cards, and nav links pull toward the cursor.

- [ ] **Step 4: Verify touch fallback**

Add a touch-emulation check. Run:
```bash
node -e "import('/Users/minguri/.npm/_npx/705bc6b22212b352/node_modules/playwright/index.js').then(async ({chromium})=>{const b=await chromium.launch({channel:'chrome'});const p=await b.newPage({hasTouch:true,isMobile:true,viewport:{width:390,height:844}});await p.addInitScript(()=>sessionStorage.setItem('patchme-loaded','1'));await p.goto('http://localhost:8123/index.html');await p.waitForTimeout(1500);const has=await p.evaluate(()=>document.body.classList.contains('cursor-custom')||!!document.querySelector('.fx-cur-ring'));console.log('custom cursor on touch:',has,'(expect false)');await b.close();})"
```
Expected: `custom cursor on touch: false (expect false)`

- [ ] **Step 5: Commit**

```bash
git add interactions.js interactions.css
git commit -m "feat(interactions): custom neon cursor + magnetic nav

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 3: Text scramble / decode (effect 02)

**Files:**
- Modify: `interactions.js` (add `initScramble`, call it)
- Modify: `interactions.css` (neutralize glitch, scramble glyph color)

- [ ] **Step 1: Add scramble CSS to `interactions.css`**

```css
/* --- text scramble: neutralize old glitch, color scrambling glyphs --- */
.glitch-text.scramble-active::before,
.glitch-text.scramble-active::after { display: none !important; }
.fx-scr { color: var(--accent); }
```

- [ ] **Step 2: Add `initScramble()` to `interactions.js`**

```js
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
```
Add to the DOMContentLoaded block:
```js
    initScramble();
```
(`patchme:section` is wired in Task 5; the listener simply never fires until then.)

- [ ] **Step 3: Verify decode + glitch neutralized + no regression**

Run: `node /tmp/verify-interactions.mjs`
Expected: section sequence unchanged, `CONSOLE ERRORS: NONE`, `PASS`. In a real browser, confirm `PATCH ME` decodes from random glyphs on load and re-scrambles on hover, and the old jitter/RGB glitch no longer appears.

- [ ] **Step 4: Verify accent markup survives scramble**

```bash
node -e "import('/Users/minguri/.npm/_npx/705bc6b22212b352/node_modules/playwright/index.js').then(async ({chromium})=>{const b=await chromium.launch({channel:'chrome'});const p=await b.newPage();await p.addInitScript(()=>sessionStorage.setItem('patchme-loaded','1'));await p.goto('http://localhost:8123/index.html');await p.waitForTimeout(3000);const ok=await p.evaluate(()=>!!document.querySelector('.m-hero-title .m-hero-me'));console.log('accent span restored after scramble:',ok,'(expect true)');await b.close();})"
```
Expected: `accent span restored after scramble: true (expect true)`

- [ ] **Step 5: Commit**

```bash
git add interactions.js interactions.css
git commit -m "feat(interactions): text scramble/decode, replacing random glitch

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 4: 3D tilt + neon spotlight (effect 06), retire feature-tilt.js

**Files:**
- Modify: `interactions.js` (add `initTiltGlow`, call it)
- Modify: `interactions.css` (spotlight layer)
- Modify: `index.html` (remove `feature-tilt.js` include)
- Delete: `feature-tilt.js`

- [ ] **Step 1: Add spotlight CSS to `interactions.css`**

```css
/* --- bento tilt spotlight --- */
.fx-spot {
  position: absolute; inset: 0; z-index: 1; pointer-events: none;
  opacity: 0; transition: opacity .3s; mix-blend-mode: screen;
}
```
(`.m-fg-content` already has `z-index: 2`, so the spotlight sits above the image and below the text.)

- [ ] **Step 2: Add `initTiltGlow()` to `interactions.js`**

```js
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
```
Add to the DOMContentLoaded block:
```js
    initTiltGlow();
```

- [ ] **Step 3: Remove the old tilt include and delete the file**

In `index.html`, delete this line (around line 320):
```html
<script src="feature-tilt.js"></script>
```
Then:
```bash
git rm feature-tilt.js
```

- [ ] **Step 4: Verify single listener + no regression**

Run: `node /tmp/verify-interactions.mjs`
Expected: section sequence unchanged, `CONSOLE ERRORS: NONE`, `PASS`. In a real browser, confirm bento cards tilt AND a neon spotlight follows the cursor inside the card (and there is no double/janky tilt from a duplicate listener).

- [ ] **Step 5: Commit**

```bash
git add interactions.js interactions.css index.html
git commit -m "feat(interactions): bento tilt + cursor spotlight; retire feature-tilt.js

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 5: Section-transition event + CTA reactive marquee (effect 05 ★)

**Files:**
- Modify: `scroll-anim.js` (dispatch `patchme:section`)
- Modify: `index.html` (CTA marquee markup)
- Modify: `interactions.js` (add `initScrollReact`, call it)
- Modify: `interactions.css` (marquee styles)

- [ ] **Step 1: Dispatch the transition event from `scroll-anim.js`**

In `scroll-anim.js`, inside `gotoSection(index, direction)`, immediately after this existing line (around line 77):
```js
  const dFactor = direction === -1 ? -1 : 1;
```
add:
```js
  window.dispatchEvent(new CustomEvent('patchme:section', { detail: { index, direction } }));
```

- [ ] **Step 2: Add the marquee markup inside the CTA section in `index.html`**

In `index.html`, inside `<section class="m-cta ...">`, directly after the closing `</div>` of `.m-cta-bg` and before `.m-cta-inner` (around line 301), insert:
```html
  <div class="cta-marquee" aria-hidden="true">
    <div class="cta-marquee-track" id="cta-marquee-track">
      <b>FUNCTIONAL&nbsp;WEAR&nbsp;✦&nbsp;</b><span>FOR&nbsp;REAL&nbsp;SKIN&nbsp;✦&nbsp;</span><b>FUNCTIONAL&nbsp;WEAR&nbsp;✦&nbsp;</b><span>FOR&nbsp;REAL&nbsp;SKIN&nbsp;✦&nbsp;</span><b>FUNCTIONAL&nbsp;WEAR&nbsp;✦&nbsp;</b><span>FOR&nbsp;REAL&nbsp;SKIN&nbsp;✦&nbsp;</span><b>FUNCTIONAL&nbsp;WEAR&nbsp;✦&nbsp;</b><span>FOR&nbsp;REAL&nbsp;SKIN&nbsp;✦&nbsp;</span>
    </div>
  </div>
```

- [ ] **Step 3: Add marquee CSS to `interactions.css`**

```css
/* --- CTA reactive marquee --- */
.cta-marquee {
  position: absolute; left: 0; right: 0; top: 64%;
  z-index: 1; pointer-events: none; overflow: hidden;
  opacity: .9; mask-image: linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent);
}
.cta-marquee-track {
  display: inline-flex; white-space: nowrap;
  font-family: var(--font-display); font-weight: 700;
  font-size: clamp(26px, 4vw, 56px); letter-spacing: 2px;
  will-change: transform;
}
.cta-marquee-track b { color: var(--accent); }
.cta-marquee-track span { color: transparent; -webkit-text-stroke: 1px rgba(255,255,255,.35); }
```

- [ ] **Step 4: Add `initScrollReact()` to `interactions.js`**

```js
  function initScrollReact() {
    const track = document.getElementById('cta-marquee-track');
    if (!track) return;
    let x = 0, vel = 0, half = 0;
    const base = MOTION_OK ? 0.5 : 0;
    const measure = () => { half = track.scrollWidth / 2; };
    requestAnimationFrame(measure);
    addEventListener('resize', measure);
    addEventListener('patchme:section', e => { vel += 55 * (e.detail.direction || 1); });
    (function loop() {
      vel *= 0.9;
      x -= (base + vel * 0.15);
      if (half) { if (x <= -half) x += half; if (x > 0) x -= half; }
      const skew = MOTION_OK ? Math.max(-14, Math.min(14, vel * 0.3)) : 0;
      track.style.transform = `translateX(${x}px) skewX(${skew}deg)`;
      requestAnimationFrame(loop);
    })();
  }
```
Add to the DOMContentLoaded block:
```js
    initScrollReact();
```

- [ ] **Step 5: Verify marquee reacts + event fires + no regression**

Run: `node /tmp/verify-interactions.mjs`
Expected: section sequence unchanged, `CONSOLE ERRORS: NONE`, `PASS` (the harness wheels through all sections, so the marquee receives several `patchme:section` surges).

Confirm the event is wired:
```bash
node -e "import('/Users/minguri/.npm/_npx/705bc6b22212b352/node_modules/playwright/index.js').then(async ({chromium})=>{const b=await chromium.launch({channel:'chrome'});const p=await b.newPage({viewport:{width:1440,height:900}});await p.addInitScript(()=>{sessionStorage.setItem('patchme-loaded','1');window.__evt=0;addEventListener('patchme:section',()=>window.__evt++);});await p.goto('http://localhost:8123/index.html');await p.waitForTimeout(2500);await p.mouse.move(720,450);await p.mouse.wheel(0,140);await p.waitForTimeout(1700);const n=await p.evaluate(()=>window.__evt);console.log('patchme:section fired:',n,'(expect >=1)');await b.close();})"
```
Expected: `patchme:section fired: 1 (expect >=1)`. Open `#cta` in a real browser and scroll into it: confirm the marquee crawls and surges/skews on entry.

- [ ] **Step 6: Commit**

```bash
git add scroll-anim.js index.html interactions.js interactions.css
git commit -m "feat(interactions): section-transition event + CTA reactive marquee

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 6: Final index verification (fallbacks + full visual pass)

**Files:** none (verification only)

- [ ] **Step 1: Reduced-motion fallback**

```bash
node -e "import('/Users/minguri/.npm/_npx/705bc6b22212b352/node_modules/playwright/index.js').then(async ({chromium})=>{const b=await chromium.launch({channel:'chrome'});const p=await b.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.addInitScript(()=>sessionStorage.setItem('patchme-loaded','1'));await p.goto('http://localhost:8123/index.html');await p.waitForTimeout(2500);const cur=await p.evaluate(()=>document.body.classList.contains('cursor-custom'));console.log('cursor under reduced-motion:',cur,'(expect false)');console.log('errors:',errs.length?errs:'NONE');await b.close();})"
```
Expected: `cursor under reduced-motion: false (expect false)` and `errors: NONE`.

- [ ] **Step 2: Full desktop pass + screenshots of every section**

Run: `node /tmp/verify-interactions.mjs`
Expected: `SECTION SEQUENCE: hero -> problem -> solution -> p-friction -> features -> cta`, `CONSOLE ERRORS: NONE`, `PASS`. Review `/tmp/patchme-shots/verify-final.png`.

- [ ] **Step 3: Manual confirmation checklist (real browser, `http://localhost:8123/index.html`)**

Confirm each:
- Neon cursor follows with lag; grows over interactive elements.
- Nav links pull toward cursor (magnetic), spring back on leave.
- `PATCH ME` / `FRICTION PROTOCOL` / `READY FOR DEPLOYMENT?` decode on entry; re-scramble on hover; no old glitch jitter.
- Bento cards tilt with a cursor-tracking neon spotlight.
- CTA marquee crawls and surges/skews when entering the section.
- Section snap navigation feels identical to before.

- [ ] **Step 4: Final commit (only if any tweak was needed during this pass; otherwise skip)**

```bash
git add -A
git commit -m "chore(interactions): final index verification tweaks

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Out of Scope (this plan)
- `product.html` / `team.html` rollout (next plan) — including deferred **effect 04 (hover-float image)** on the team member list and the magnetic JOIN button payoff.
- Momentum/Lenis scroll, WebGL, physics, sound (rejected/deferred in spec).

## Post-Implementation: Expansion (separate plan)
Once index is approved, write a follow-up plan to: include `interactions.css` + `interactions.js` on `product.html` and `team.html`, add a marquee or transition reaction where appropriate, implement effect 04 on the team member list, and confirm the magnetic JOIN button on product.
