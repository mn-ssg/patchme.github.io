# Product Collection Section — "SELECT YOUR GEAR" (Design Spec)

**Date:** 2026-06-06
**Page:** `product.html`
**Position:** New section inserted **between section 1 (hero `p-hero`) and section 2 (`p-rules`)**.
**Status:** Approved design (visual mockup confirmed), ready for implementation planning.

---

## 1. Goal

Introduce a section that **shows and explains the product** as a 4-item collection, styled as a techwear "select your gear" inventory screen. It must fit the existing GSAP section-snap system (one 100vh panel) and reuse the interaction layer already built (`interactions.js`).

**Design intent (from user feedback):** muted/subtle (not heavy neon), distinctive fashion-forward garment silhouettes (Satisfy-like), and **minimal card content** — the product image is the hero, not text.

---

## 2. The 4 Items

Generated product images (Higgsfield, toned-down mood) are already saved in `assets/`:

| Code | Name | Category | Asset |
|------|------|----------|-------|
| DERMA-01 | SECOND SKIN | Base layer | `assets/product-derma.jpg` |
| AEGIS-02 | STORM SHELL | Shell jacket | `assets/product-aegis.jpg` |
| FLUX-03 | CONDUIT | Compression tights | `assets/product-flux.jpg` |
| HALO-04 | NULL HOOD | Recovery hoodie | `assets/product-halo.jpg` |

All four: matte black garment, pure black background, faint subtle mint-green (#4cfdbf) accent, ~896×1200 source → resized JPEG (~33–50 KB each). Category is metadata only — **not shown on the card** (cards stay minimal).

---

## 3. Layout

One 100vh `anim-section` (`id="p-collection"`), auto-discovered by `scroll-anim.js` (it queries all `.anim-section`), so the wipe transition wires up automatically — **no `scroll-anim.js` change for the section itself.**

```
┌───────────────────────────────────────────────┐
│  SELECT YOUR GEAR                     04 UNITS │   ← section header
│                                                │
│   ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐       │
│   │DERMA-01│ │AEGIS-02│ │FLUX-03│ │HALO-04│    │   ← code (top-left)
│   │ [img]  │ │ [img]  │ │ [img] │ │ [img] │    │
│   │        │ │        │ │       │ │       │    │
│   │SECOND  │ │STORM   │ │CONDUIT│ │NULL   │    │   ← name (bottom-left)
│   │SKIN    │ │SHELL   │ │       │ │HOOD   │    │
│   └──────┘  └──────┘  └──────┘  └──────┘       │
└───────────────────────────────────────────────┘
```

**Card content (minimal — only these):**
- Product image (fills card, `object-fit: cover`, rounded corners).
- Subtle bottom gradient for name legibility.
- `code` (e.g. `DERMA-01`) — small, accent color, top-left.
- `name` (e.g. `SECOND SKIN`) — bold, white, bottom-left.
- **No** spec text, **no** category label, **no** HUD corner brackets.

**Markup classes (prefix `pc-`):** `.p-collection` (section) › content wrapper › `.pc-head` (h2 `.pc-title` + `.pc-meta`) and `.pc-grid` containing four `.pc-card`, each with `<img>`, `.pc-ov` (gradient), `.pc-code`, `.pc-name`.

**Sizing / fit:** The header + 4-across card row must fit within 100vh. Cards use `aspect-ratio: 3 / 4.5`; the grid is width-driven at desktop. On viewports too short for the natural card height, cap via a height constraint (e.g. card `max-height` tied to available viewport) so nothing clips and the snap stays intact. Center the content block vertically within the panel (reuse the `anim-active … .scroll-inner` flex-centering pattern used by other content-sized sections).

**Responsive:**
- ≤1024px: 4 columns may get tight → allow 2×2 if needed.
- ≤768px (mobile): **2×2 grid**; permit internal scroll of the section if content exceeds the viewport (consistent with how other tall sections behave in `anim-active` mobile).

---

## 4. Interactions (reuse `interactions.js` — already on product.html)

1. **Custom cursor + magnetic** — global, already active. Cursor ring grows over `.pc-card` (add `.pc-card` to the existing `hoverSel`).
2. **Tilt + neon spotlight** — extend `initTiltGlow`'s selector from `.m-fg-card, .t-mission-card` to also include **`.pc-card`**. The spotlight `.fx-spot` requires the card to be `position: relative` and its real content lifted above the spot (same plumbing already used for `.t-mission-card`): add a CSS rule `.pc-card > :not(.fx-spot) { position: relative; z-index: 2; }` and ensure `.pc-card` is positioned.
3. **Scramble decode** — the section heading `SELECT YOUR GEAR` gets class `glitch-text` so it decodes on section entry (existing behavior). Additionally, each card's `.pc-code` and `.pc-name` get class `glitch-text` so:
   - they re-scramble on hover (existing `initScramble` wires `mouseenter` on every `.glitch-text`), and
   - they decode on section entry — this requires a **small enhancement** to `initScramble`'s `patchme:section` handler: change it from scrambling the section's *first* `.glitch-text` to scrambling **all** `.glitch-text` in the incoming section (`querySelectorAll(...).forEach(scrambleEl)`). Low-risk, additive.
   - Note: `.glitch-text` also receives `scramble-active`, which only hides the (nonexistent here) glitch pseudo-elements — harmless on these elements.

No marquee in this section.

---

## 5. Files Touched

| File | Change |
|------|--------|
| `product.html` | Insert `<section class="p-collection anim-section" id="p-collection">…</section>` between `p-hero` and `p-rules`; mark heading + each card code/name with `glitch-text` |
| `product.css` | `.p-collection` + `.pc-*` styles, `anim-active` fit/centering override, responsive (2×2 mobile) |
| `interactions.js` | (a) add `.pc-card` to tilt selector; (b) `patchme:section` scramble handler → scramble all `.glitch-text` in the incoming section |
| `interactions.css` | `.pc-card` spotlight plumbing (`position: relative` + `.pc-card > :not(.fx-spot){position:relative;z-index:2}`) |
| `assets/` | `product-derma.jpg`, `product-aegis.jpg`, `product-flux.jpg`, `product-halo.jpg` (already added) |

The `interactions.js` scramble change affects all pages, but the behavior (scramble every heading-class element in the entering section) is a strict improvement and safe where there is only one such element.

---

## 6. Verification

- Playwright harness for product.html: confirm section snap sequence is now `p-hero → p-collection → p-rules → p-action → p-join`, no JS errors, and the panel fits 100vh without clipping the 4 cards.
- Visual screenshot of `#p-collection` (desktop) matching the approved mockup; hover a card to confirm tilt + spotlight; confirm codes/names decode on entry.
- Reduced-motion: tilt disabled (existing guard), scramble resolves instantly (existing guard), images still shown.
- Mobile (≤768px): 2×2 grid, no clipping.

**Success criteria:** new section reads as the approved "SELECT YOUR GEAR" mockup; existing snap navigation and other sections unaffected; no console errors; effects degrade gracefully on touch / reduced-motion.

---

## 7. Out of Scope
- Clickable cards / product detail pages (showcase only).
- Changing the other product sections.
- Generating further image variants (current four approved).
