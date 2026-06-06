# PATCH ME — Award-Level Interaction Upgrade (Design Spec)

**Date:** 2026-06-06
**Scope:** Elevate site interactions to modern "Awwwards-tier" feel, per professor feedback that current interactions feel weak.
**Status:** Approved design, ready for implementation planning.

---

## 1. Goal & Constraints

**Goal:** Add five high-impact interactions, polished to a cohesive level, without rewriting the existing scroll system.

**Hard constraints (decided with user):**
- **Keep the existing section-snap scroll** (GSAP `Observer` in `scroll-anim.js`). Do NOT switch to momentum/Lenis scroll — too risky, would require rebuilding all fixed-100vh section layouts.
- **index.html first.** Complete and verify on index, then expand the same system to `product.html` and `team.html`.
- **Polish the 5 chosen effects** — no WebGL/physics/sound tier for now.
- **Minimal coupling** to the fragile `scroll-anim.js`. The only edit there is dispatching one custom event per section transition.

**Chosen effects (from live demo):** 01 cursor+magnetic, 02 text scramble, 05 scroll-velocity reaction (user favorite), 06 tilt+glow. **Deferred:** 04 hover-float image (no natural home on index → lands in expansion phase on team/product). **Rejected:** 03 RGB split.

---

## 2. Architecture

### 2.1 New file: `interactions.js`
A single additive script containing five independent, self-guarding modules (IIFE each). Included on each page with one `<script>` line, loaded **after** existing scripts so it layers on top.

```
interactions.js
├── env guards (touch?, prefers-reduced-motion?) → exported flags
├── module: cursor        (01 — custom cursor + magnetic)
├── module: scramble      (02 — decode-on-enter, re-scramble on hover)
├── module: tiltGlow      (06 — upgrade bento tilt with cursor spotlight)
└── module: scrollReact   (05 — transition skew + CTA marquee)
```

Each module:
- Runs only if its target elements exist on the page (so the same file is safe on all 3 pages).
- Is independently toggleable (comment out one init call to disable one effect).
- No-ops when guards fail (see 2.3).

### 2.2 One-line hook into `scroll-anim.js`
`scrollReact` (05) needs to know when a section transition happens and how fast/which direction, but the site has **no native scroll** to read velocity from. Solution: `gotoSection()` in `scroll-anim.js` dispatches a custom event at transition start:

```js
// added inside gotoSection(index, direction), near the top:
window.dispatchEvent(new CustomEvent('patchme:section', {
  detail: { index, direction, prevIndex: currentIndex }
}));
```

`interactions.js` listens for `patchme:section` and drives the skew burst + marquee surge. This is the **only** change to existing JS, and it is purely additive (an event no existing code consumes).

### 2.3 Safety / fallbacks
- **Touch devices** (`matchMedia('(hover: none)')` or `'ontouchstart' in window`): cursor + magnetic disabled (native touch unaffected). Scramble, tilt-glow keep working but tilt is hover-based so effectively idle. Marquee still animates.
- **`prefers-reduced-motion: reduce`**: cursor static or default pointer restored; scramble resolves instantly to final text; skew/blur disabled; marquee reduced to a slow constant crawl or stopped.
- **No element found**: module init returns early. Pages without a given target are unaffected.
- The real OS cursor is hidden (`cursor: none`) **only when** the custom cursor module is active (desktop, motion allowed). Otherwise the default cursor stays.

---

## 3. Effect Specifications

### 3.1 — Custom cursor + magnetic (01)  [global]
- Two fixed elements: a small solid dot (instant) and a larger neon ring (`--accent #4cfdbf`) that follows with lerp lag (~0.18). `mix-blend-mode: difference` so it reads on any background.
- Ring grows (`.big`) when hovering interactive elements: `a`, `button`, nav links, bento cards, slider, headings, `[data-magnetic]`.
- **Magnetic** targets on index: nav links (TEAM/PRODUCT), logo. On product: the JOIN button (primary payoff). Element translates toward cursor (~0.4 of offset); inner label translates less (~0.2) for depth; eases back on leave.
- Implementation: vanilla rAF lerp loop + per-element `mousemove`/`mouseleave`. No library.

### 3.2 — Text scramble / decode (02)  [section headings]
- Replaces the existing random glitch effect (`script.js` glitch interval + `is-glitching`). The two must not both run on the same element — scramble takes over.
- On section enter, the heading "decodes": each char cycles random glyphs then settles. Hook: listen to `patchme:section` and scramble the incoming section's heading; OR trigger via the existing GSAP heading reveal timing. Also re-scramble on hover.
- Targets on index: hero `PATCH ME`, `DESIGNED FOR THE WRONG SKIN`, `THE FRICTION PROTOCOL`, `SYSTEM SPECIFICATIONS`, `READY FOR DEPLOYMENT?`.
- Accent-colored glyphs while scrambling; settles to original markup (must preserve inner `<span>` accent coloring — scramble operates on text nodes / restores final innerHTML).
- Coordinate with existing `glitch-text` / GSAP `SplitText` so they don't fight: scramble runs after the wipe reveal, glitch interval disabled for scrambled headings.

### 3.3 — Scroll-velocity reaction (05)  [★ favorite]
Two coordinated pieces, both driven by `patchme:section`:

**(a) Transition skew+blur on section content**
- When a section wipes in, its `.scroll-inner` (or content wrapper) gets a brief `skewY`/`skewX` + slight blur proportional to transition direction, decaying to 0 over the wipe duration (~0.6–1.2s) via rAF or a GSAP tween. Gives the snap a kinetic, "thrown" feel.
- Must not interfere with the wipe transform GSAP already applies to `outerWrappers`/`innerWrappers`. Apply skew/blur to an inner content node, not the wrapper GSAP animates. Verify no transform conflict.

**(b) Reactive marquee in CTA**
- Add a horizontal marquee band inside the CTA section (`#cta`), e.g. brand text "FUNCTIONAL WEAR ✦ FOR REAL SKIN ✦" looping.
- Base slow auto-scroll; on each `patchme:section` (especially entering CTA) it surges (speed spike) and skews briefly, then settles. On a momentum site this reads off scroll velocity; here it reads off transition events.
- Placement: inside `.m-cta`, layered with the existing title/footer (does not displace them). Respect the CTA frame already added.

### 3.4 — 3D tilt + neon spotlight (06)  [Features bento]
- Upgrade existing `feature-tilt.js` behavior on `.m-fg-card`: keep perspective tilt, add a radial neon spotlight (`--accent`) that follows the cursor within the card.
- **Decided:** the tilt logic moves into `interactions.js`'s `tiltGlow` module, which also adds the cursor-following radial neon spotlight. To avoid double-binding `mousemove` on `.m-fg-card`, the `<script src="feature-tilt.js">` include is removed from `index.html` and the `feature-tilt.js` file is deleted (its behavior is fully absorbed and upgraded by `tiltGlow`).

---

## 4. Files Touched

| File | Change | Risk |
|------|--------|------|
| `interactions.js` (new) | All 5 module implementations | n/a |
| `index.html` | Add `<script src="interactions.js">` after existing scripts; remove `feature-tilt.js` include (superseded by tiltGlow); add CTA marquee markup | low |
| `scroll-anim.js` | One added line: dispatch `patchme:section` event in `gotoSection` | low (additive event) |
| `main.css` (or new `interactions.css`) | Cursor, magnetic, scramble, marquee, spotlight styles | low |
| `product.html`, `team.html` | (Expansion phase) add same `<script>` + page-specific targets (incl. deferred 04) | later |

CSS approach: put interaction styles in a small dedicated block/file to keep them isolated and reversible.

---

## 5. Rollout & Verification

1. Build `interactions.js` + styles; wire into `index.html`; add the `scroll-anim.js` event line.
2. Implement in order: cursor+magnetic → scramble (replace glitch) → tilt+glow → scroll-react (skew + CTA marquee).
3. **Verify on index** via local server + Playwright screenshots and real scroll-through: confirm (a) section snap still works exactly as before, (b) no transform conflicts/jank, (c) touch + reduced-motion fallbacks behave.
4. Once index is solid and user-approved, **expand** to `product.html` (JOIN magnetic button shines) and `team.html` (member list → deferred **04 hover-float image**).

**Success criteria:**
- Existing GSAP section-snap navigation works identically to before (no regressions).
- All 5 effects run on index desktop; gracefully disabled on touch / reduced-motion.
- No console errors; no visible jank during transitions.
- Disabling interactions = removing one `<script>` line restores prior behavior.

---

## 6. Out of Scope (this iteration)
- Momentum/Lenis scroll rewrite.
- WebGL fluid distortion, physics drag, sound reactivity.
- Effect 04 on index (deferred to team/product expansion).
- Effect 03 (RGB split — rejected).
