# Product Collection Section ("SELECT YOUR GEAR") Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a new 100vh "SELECT YOUR GEAR" 4-item product collection section to `product.html` between the hero and "REWRITING THE RULES", reusing the existing interaction layer.

**Architecture:** A new `.anim-section#p-collection` is auto-discovered by `scroll-anim.js` (it queries all `.anim-section`), so the wipe transition wires up with no scroll-logic change. Styling lives in `product.css` (`.pc-*` classes). Interactions reuse `interactions.js`: the bento tilt+spotlight selector gains `.pc-card`, and the scramble-on-entry handler is widened to decode every `.glitch-text` in the entering section.

**Tech Stack:** Static HTML/CSS/vanilla JS. Existing GSAP snap scroll (untouched). No build step, no unit-test runner.

**Spec:** `docs/superpowers/specs/2026-06-06-product-collection-section-design.md`

**Verification model:** Playwright harness (`/tmp/verify-collection.mjs`) drives wheel events through `product.html`, asserts the section-snap sequence now includes `p-collection`, asserts zero JS errors, and screenshots the section. Each task runs it.

**Assets (already on disk):** `assets/product-derma.jpg`, `assets/product-aegis.jpg`, `assets/product-flux.jpg`, `assets/product-halo.jpg`.

---

## File Structure

| File | Responsibility | Action |
|------|----------------|--------|
| `product.html` | Section markup between `#p-hero` and `#p-rules` | Modify |
| `product.css` | `.p-collection` + `.pc-*` styles, responsive | Modify |
| `interactions.js` | Add `.pc-card` to tilt + hover selectors; widen scramble-on-entry to all `.glitch-text` in section | Modify |
| `interactions.css` | `.pc-card` content z-index above the injected `.fx-spot` | Modify |
| `assets/product-*.jpg` | The 4 product images (already present) | Commit |

---

## Task 0: Pre-flight — server + verification harness + baseline

**Files:** Create `/tmp/verify-collection.mjs`

- [ ] **Step 1: Ensure the static server is running at repo root**

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8123/product.html || \
( cd "/Users/minguri/Desktop/학교/디지털 미디어 세미나/patchme.github.io" && python3 -m http.server 8123 >/tmp/patchme-server.log 2>&1 & sleep 1 )
```
Expected: `200` (or the server starts).

- [ ] **Step 2: Write the harness**

Create `/tmp/verify-collection.mjs`:
```js
import pw from '/Users/minguri/.npm/_npx/705bc6b22212b352/node_modules/playwright/index.js';
const { chromium } = pw;
import { mkdirSync } from 'fs';
mkdirSync('/tmp/patchme-shots', { recursive: true });

const EXPECT = process.env.EXPECT || 'p-hero -> p-rules -> p-action -> p-join';
const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const jsErrors = [];
page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/i.test(m.text())) jsErrors.push(m.text()); });
page.on('pageerror', e => jsErrors.push('PAGEERROR: ' + e.message));
await page.addInitScript(() => sessionStorage.setItem('patchme-loaded', '1'));
await page.goto('http://localhost:8123/product.html', { waitUntil: 'networkidle' });
await page.waitForTimeout(2500);

async function vis() {
  return page.evaluate(() => {
    const s = [...document.querySelectorAll('.anim-section')]
      .find(x => getComputedStyle(x).opacity === '1' && getComputedStyle(x).visibility !== 'hidden');
    return s ? s.id : 'none';
  });
}
async function advanceOne(from) {
  for (let k = 0; k < 30; k++) {
    await page.mouse.move(720, 450);
    await page.mouse.wheel(0, 140);
    await page.waitForTimeout(430);
    const v = await vis();
    if (v !== from) { await page.waitForTimeout(950); return v; }
  }
  return vis();
}
const steps = EXPECT.split(' -> ').length - 1;
const seq = [await vis()];
let cur = seq[0];
for (let i = 0; i < steps; i++) { cur = await advanceOne(cur); seq.push(cur); }
const got = seq.join(' -> ');
console.log('SECTION SEQUENCE:', got);
console.log('SNAP:', got === EXPECT ? 'OK' : 'MISMATCH (expected ' + EXPECT + ')');
console.log('JS ERRORS:', jsErrors.length ? jsErrors.slice(0, 10) : 'NONE');
await page.screenshot({ path: '/tmp/patchme-shots/collection-final.png' });
await browser.close();
console.log(got === EXPECT && jsErrors.length === 0 ? 'PASS' : 'FAIL');
```

- [ ] **Step 3: Baseline (before the new section)**

Run: `node /tmp/verify-collection.mjs`
Expected: `SECTION SEQUENCE: p-hero -> p-rules -> p-action -> p-join`, `SNAP: OK`, `JS ERRORS: NONE`, `PASS`. (A benign `problem-left.mp4`-style 404 is not on this page; ignore any unrelated resource note.)

---

## Task 1: Add the section markup + desktop styles

**Files:** Modify `product.html`, `product.css`

- [ ] **Step 1: Insert the section in `product.html`**

Between the end of the hero section (`</section>` that closes `#p-hero`) and the `<!-- 2. REWRITING THE RULES -->` comment, insert:
```html
<!-- ============================
     1.5 PRODUCT COLLECTION
============================= -->
<section class="p-collection anim-section" id="p-collection">
  <div class="pc-inner">
    <div class="pc-head">
      <h2 class="pc-title glitch-text anim-heading" data-text="SELECT YOUR GEAR">SELECT YOUR <span class="p-accent">GEAR</span></h2>
      <span class="pc-meta">04 UNITS</span>
    </div>
    <div class="pc-grid">
      <article class="pc-card">
        <img src="assets/product-derma.jpg" alt="SECOND SKIN base layer" loading="lazy">
        <div class="pc-ov"></div>
        <span class="pc-code glitch-text" data-text="DERMA-01">DERMA-01</span>
        <span class="pc-name glitch-text" data-text="SECOND SKIN">SECOND<br>SKIN</span>
      </article>
      <article class="pc-card">
        <img src="assets/product-aegis.jpg" alt="STORM SHELL jacket" loading="lazy">
        <div class="pc-ov"></div>
        <span class="pc-code glitch-text" data-text="AEGIS-02">AEGIS-02</span>
        <span class="pc-name glitch-text" data-text="STORM SHELL">STORM<br>SHELL</span>
      </article>
      <article class="pc-card">
        <img src="assets/product-flux.jpg" alt="CONDUIT compression tights" loading="lazy">
        <div class="pc-ov"></div>
        <span class="pc-code glitch-text" data-text="FLUX-03">FLUX-03</span>
        <span class="pc-name glitch-text" data-text="CONDUIT">CONDUIT</span>
      </article>
      <article class="pc-card">
        <img src="assets/product-halo.jpg" alt="NULL HOOD recovery hoodie" loading="lazy">
        <div class="pc-ov"></div>
        <span class="pc-code glitch-text" data-text="HALO-04">HALO-04</span>
        <span class="pc-name glitch-text" data-text="NULL HOOD">NULL<br>HOOD</span>
      </article>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Append the desktop styles to `product.css`**

Add at the end of the "1. HERO" area or after it (before "2. THE FRICTION"); placement is cosmetic, just keep it in `product.css`:
```css
/* ──────────────────────────────────────────
   1.5 PRODUCT COLLECTION — SELECT YOUR GEAR
   ────────────────────────────────────────── */
.p-collection {
  position: relative;
  background: var(--bg);
  overflow: hidden;
  height: clamp(600px, 56vw, 1080px);
}
.pc-inner {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: clamp(40px, 5vw, 96px) clamp(40px, 4.1vw, 79px);
}
.pc-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: clamp(20px, 3vh, 44px);
}
.pc-title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(20px, 3.3vw, 56px);
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 1px;
  line-height: 1;
}
.pc-meta {
  font-family: var(--font-display);
  font-size: clamp(10px, 0.9vw, 14px);
  letter-spacing: 3px;
  color: var(--text-dim);
  white-space: nowrap;
}
.pc-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: clamp(10px, 1.2vw, 22px);
}
.pc-card {
  position: relative;
  border-radius: clamp(10px, 1.2vw, 16px);
  overflow: hidden;
  background: #080808;
  aspect-ratio: 3 / 4.5;
  max-height: 64vh;
}
.pc-card img {
  width: 100%; height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.55s cubic-bezier(0.16,1,0.3,1);
}
.pc-card:hover img { transform: scale(1.04); }
.pc-ov {
  position: absolute; inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.8), transparent 34%);
}
.pc-code {
  position: absolute;
  top: clamp(12px, 1.4vw, 18px);
  left: clamp(14px, 1.4vw, 18px);
  font-family: var(--font-display);
  font-size: clamp(8px, 0.78vw, 11px);
  letter-spacing: 3px;
  color: var(--accent);
}
.pc-name {
  position: absolute;
  left: clamp(14px, 1.4vw, 18px);
  bottom: clamp(12px, 1.4vw, 18px);
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(13px, 1.4vw, 22px);
  letter-spacing: 1px;
  line-height: 1.05;
  color: #fff;
}
```

- [ ] **Step 3: Verify the new section is in the snap sequence and fits**

Run: `EXPECT='p-hero -> p-collection -> p-rules -> p-action -> p-join' node /tmp/verify-collection.mjs`
Expected: `SECTION SEQUENCE: p-hero -> p-collection -> p-rules -> p-action -> p-join`, `SNAP: OK`, `JS ERRORS: NONE`, `PASS`.

- [ ] **Step 4: Screenshot the section to confirm layout**

```bash
cat > /tmp/shot-collection.mjs <<'EOF'
import pw from '/Users/minguri/.npm/_npx/705bc6b22212b352/node_modules/playwright/index.js';
const { chromium } = pw;
const b = await chromium.launch({ channel:'chrome' });
const p = await b.newPage({ viewport:{width:1440,height:900} });
await p.addInitScript(()=>sessionStorage.setItem('patchme-loaded','1'));
await p.goto('http://localhost:8123/product.html'); await p.waitForTimeout(2500);
async function vis(){return p.evaluate(()=>{const s=[...document.querySelectorAll('.anim-section')].find(x=>getComputedStyle(x).opacity==='1'&&getComputedStyle(x).visibility!=='hidden');return s?s.id:'none';});}
async function adv(f){for(let k=0;k<30;k++){await p.mouse.move(720,450);await p.mouse.wheel(0,140);await p.waitForTimeout(430);const v=await vis();if(v!==f){await p.waitForTimeout(950);return v;}}return vis();}
let c=await vis(); c=await adv(c);
console.log('at', c);
await p.mouse.move(360,520); await p.waitForTimeout(600);
await p.screenshot({ path:'/tmp/patchme-shots/collection-shot.png' });
await b.close(); console.log('DONE');
EOF
node /tmp/shot-collection.mjs
```
Expected: `at p-collection`, `DONE`. Open `/tmp/patchme-shots/collection-shot.png` and confirm: header "SELECT YOUR GEAR" + "04 UNITS", 4 product cards in a row, each with code (top-left) + name (bottom-left), nothing clipped.

- [ ] **Step 5: Commit**

```bash
git add product.html product.css assets/product-derma.jpg assets/product-aegis.jpg assets/product-flux.jpg assets/product-halo.jpg
git commit -m "feat(product): add SELECT YOUR GEAR collection section

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 2: Wire interactions (tilt + spotlight + scramble)

**Files:** Modify `interactions.js`, `interactions.css`

- [ ] **Step 1: Add `.pc-card` to the tilt selector in `interactions.js`**

Find:
```js
    document.querySelectorAll('.m-fg-card, .t-mission-card').forEach(card => {
```
Replace with:
```js
    document.querySelectorAll('.m-fg-card, .t-mission-card, .pc-card').forEach(card => {
```

- [ ] **Step 2: Add `.pc-card` to the cursor hover-grow selector in `interactions.js`**

Find the `hoverSel` line:
```js
    const hoverSel = 'a, button, input, .nav-link, .nav-logo, .m-fg-card, .pfs-card, .pfs-slider-wrap, .glitch-text, .m-sol-cell, [data-magnetic]';
```
Replace with (adds `.pc-card`):
```js
    const hoverSel = 'a, button, input, .nav-link, .nav-logo, .m-fg-card, .pc-card, .pfs-card, .pfs-slider-wrap, .glitch-text, .m-sol-cell, [data-magnetic]';
```

- [ ] **Step 3: Widen the scramble-on-entry handler in `interactions.js`**

In `initScramble`, find:
```js
    addEventListener('patchme:section', e => {
      const sec = document.querySelectorAll('.anim-section')[e.detail.index];
      if (!sec) return;
      const h = sec.querySelector('.glitch-text');
      if (h) scrambleEl(h);
    });
```
Replace with (decode every `.glitch-text` in the entering section):
```js
    addEventListener('patchme:section', e => {
      const sec = document.querySelectorAll('.anim-section')[e.detail.index];
      if (!sec) return;
      sec.querySelectorAll('.glitch-text').forEach(scrambleEl);
    });
```

- [ ] **Step 4: Add the card content z-index plumbing to `interactions.css`**

The spotlight `.fx-spot` is appended as the LAST child of each card, so the card's overlay/code/name must sit above it. Append to `interactions.css`:
```css
/* product collection: keep card content above the injected spotlight */
.pc-card .pc-ov,
.pc-card .pc-code,
.pc-card .pc-name { z-index: 2; }
```
(The image stays unpositioned, so it renders below the absolutely-positioned `.fx-spot` — the spotlight lightens the image, while the gradient/code/name sit above it.)

- [ ] **Step 5: Verify interactions + no regression**

Run: `EXPECT='p-hero -> p-collection -> p-rules -> p-action -> p-join' node /tmp/verify-collection.mjs`
Expected: `SNAP: OK`, `JS ERRORS: NONE`, `PASS`.

Confirm a spotlight layer is created on each of the 4 cards:
```bash
node -e "import('/Users/minguri/.npm/_npx/705bc6b22212b352/node_modules/playwright/index.js').then(async m=>{const {chromium}=m.default;const b=await chromium.launch({channel:'chrome'});const p=await b.newPage({viewport:{width:1440,height:900}});await p.addInitScript(()=>sessionStorage.setItem('patchme-loaded','1'));await p.goto('http://localhost:8123/product.html');await p.waitForTimeout(2000);const n=await p.evaluate(()=>document.querySelectorAll('.pc-card .fx-spot').length);console.log('spotlight layers on pc-cards:',n,'(expect 4)');await b.close();})"
```
Expected: `spotlight layers on pc-cards: 4 (expect 4)`

- [ ] **Step 6: Visual confirm tilt + spotlight + decode**

Re-run the screenshot script from Task 1 Step 4 (`node /tmp/shot-collection.mjs`) — the mouse hovers a card. Open `/tmp/patchme-shots/collection-shot.png` and confirm a neon spotlight glow appears on the hovered card (and codes/names are visible, having settled after their decode).

- [ ] **Step 7: Commit**

```bash
git add interactions.js interactions.css
git commit -m "feat(interactions): extend tilt/spotlight + scramble to product collection

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 3: Responsive (mobile 2×2) + final verification

**Files:** Modify `product.css`

- [ ] **Step 1: Add the mobile rules to `product.css`**

Append:
```css
@media (max-width: 1024px) {
  .pc-grid { gap: 12px; }
  .pc-card { max-height: 56vh; }
}
@media (max-width: 768px) {
  .p-collection { height: auto; min-height: 100svh; }
  .pc-inner { position: relative; inset: auto; padding: 80px 24px 40px; justify-content: flex-start; }
  .pc-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
  .pc-card { max-height: none; aspect-ratio: 3 / 4; }
  .pc-title { font-size: clamp(18px, 6vw, 30px); }
  .pc-name { font-size: 15px; }
}
```

- [ ] **Step 2: Desktop still passes**

Run: `EXPECT='p-hero -> p-collection -> p-rules -> p-action -> p-join' node /tmp/verify-collection.mjs`
Expected: `SNAP: OK`, `JS ERRORS: NONE`, `PASS`.

- [ ] **Step 3: Mobile 2×2 renders without clipping**

```bash
cat > /tmp/shot-collection-mobile.mjs <<'EOF'
import pw from '/Users/minguri/.npm/_npx/705bc6b22212b352/node_modules/playwright/index.js';
const { chromium } = pw;
const b = await chromium.launch({ channel:'chrome' });
const p = await b.newPage({ viewport:{width:390,height:844}, hasTouch:true, isMobile:true });
const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>sessionStorage.setItem('patchme-loaded','1'));
await p.goto('http://localhost:8123/product.html'); await p.waitForTimeout(2500);
// advance one section (touch swipe up) to reach the collection
async function vis(){return p.evaluate(()=>{const s=[...document.querySelectorAll('.anim-section')].find(x=>getComputedStyle(x).opacity==='1'&&getComputedStyle(x).visibility!=='hidden');return s?s.id:'none';});}
for(let k=0;k<20 && await vis()!=='p-collection';k++){await p.mouse.wheel(0,200);await p.waitForTimeout(500);}
console.log('mobile at', await vis());
const cards = await p.evaluate(()=>document.querySelectorAll('.pc-card').length);
console.log('cards:', cards, '(expect 4) | pageerrors:', errs.length?errs:'NONE');
await p.screenshot({ path:'/tmp/patchme-shots/collection-mobile.png' });
await b.close(); console.log('DONE');
EOF
node /tmp/shot-collection-mobile.mjs
```
Expected: `mobile at p-collection`, `cards: 4 (expect 4)`, `pageerrors: NONE`. Open `/tmp/patchme-shots/collection-mobile.png` and confirm a 2×2 grid with no clipped cards.

- [ ] **Step 4: Reduced-motion fallback (tilt off, no errors)**

```bash
node -e "import('/Users/minguri/.npm/_npx/705bc6b22212b352/node_modules/playwright/index.js').then(async m=>{const {chromium}=m.default;const b=await chromium.launch({channel:'chrome'});const p=await b.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.addInitScript(()=>sessionStorage.setItem('patchme-loaded','1'));await p.goto('http://localhost:8123/product.html');await p.waitForTimeout(2000);const spots=await p.evaluate(()=>document.querySelectorAll('.pc-card .fx-spot').length);console.log('reduced-motion pc-card spotlights:',spots,'(expect 0) | errors:',errs.length?errs:'NONE');await b.close();})"
```
Expected: `reduced-motion pc-card spotlights: 0 (expect 0)` and `errors: NONE` (tilt module early-returns under reduced motion, so no `.fx-spot` is created).

- [ ] **Step 5: Commit**

```bash
git add product.css
git commit -m "feat(product): responsive 2x2 collection grid on mobile

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Self-Review Notes (covered)
- Section between hero and rules → Task 1. Auto-snap via `.anim-section` → verified Task 1 Step 3.
- Minimal cards (code + name only) → markup in Task 1 has no spec/category/brackets.
- Tilt+spotlight on `.pc-card` → Task 2 Steps 1,4; verified Step 5.
- Scramble heading + card code/name on entry → `.glitch-text` in markup + widened handler Task 2 Step 3.
- Cursor grow over cards → Task 2 Step 2.
- 100vh fit / centering → `.pc-inner` absolute inset:0 flex-center (works under `.scroll-inner` which is `position: relative`); verified by screenshot Task 1 Step 4.
- Responsive 2×2 + reduced-motion → Task 3.

## Out of Scope
- Clickable cards / detail pages; changes to other product sections; further image generation.
