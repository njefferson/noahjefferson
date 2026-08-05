# ACCESSIBILITY.md — noahjefferson hub

Append-only register (Doctrine §4, §12). Rows are **never deleted and never
silently edited**. A fixed row keeps its original number and gains a resolution
line naming the release that fixed it.

Target: **WCAG 2.2 AA**. The public statement is
[`public/accessibility.html`](public/accessibility.html), served at
[/accessibility](https://noahjefferson.pages.dev/accessibility) and linked from
every sibling app's About screen.

**Enforcement:** [`a11y-gate.mjs`](a11y-gate.mjs), run by
[`.github/workflows/a11y.yml`](.github/workflows/a11y.yml) on every push and
pull request. It exits non-zero. `a11y-scan.mjs` and `a11y-detail.mjs` are
diagnostics only — they always exit 0 and prove nothing.

---

## Part 1 — What the gate enforces

- **Pages** — `public/index.html`, `public/accessibility.html`
- **Themes** — light and dark, both, every run
- **Viewports** — 390×844 and 320×568
- **axe** — wcag2a, wcag2aa, wcag21a, wcag21aa, best-practice; any violation fails
- **Contrast** — computed per registered selector; AA thresholds (4.5:1, or 3:1
 for large text). Against a gradient, the **worst** colour stop is used
- **Targets** — ≥44px, except inline-in-a-sentence (WCAG 2.2 SC 2.5.8), which is
 exempted **and printed**
- **Target spacing** — ≥8px between any two non-inline targets, because tremor
 overshoots and a 2px miss on a touching neighbour lands on the wrong control
 (Doctrine §4). Inline-in-a-sentence targets carry the same exemption they get
 from the size rule
- **Non-text contrast** — registered control boundaries need 3:1 (WCAG 1.4.11),
 measured as the best boundary signal (border or fill) against the **worst**
 gradient stop, same as text. A registered selector that stops matching fails
 loudly, never skipped
- **Also** — `lang` present, exactly one `<h1>`, no `<img>` missing `alt`, no
 unnamed interactive element, no page errors

### The contrast registry

Selectors live in `PAGES[].registry` in `a11y-gate.mjs`. **A registered selector
that matches nothing fails the build** — it is never skipped, because a renamed
class must not silently drop out of coverage.

`index.html` — `.tag .foot .sub .vchip .app-name .app-sub .go .group-title .label .name h1 h2`
`accessibility.html` — `.foot .sub .lead .apps .contact-email h1 h2`

**Adding a new foreground/background pair? Add it here and to the registry in the
same commit that introduces it** (§4).

### Design-time bindings

- Meaning never rides on hue alone; a grayscale render must stay readable.
- No fixed size that ignores the space available; no floor that exceeds it.
- Type in `rem` so the reader's text-size preference is honoured, not just zoom.
- `:focus-visible` rings are never removed.

---

## Part 2 — Findings register

### F-01 · Footer "Accessibility" link was 73.8×14px
**Found:** 2026-07-28 · first run of `a11y-gate.mjs`
**Rule:** Doctrine §4 (targets ≥44px) / WCAG 2.2 SC 2.5.8
**Detail:** `public/index.html` `.foot-links a` measured **73.8 × 14 px** in both
themes at both viewports. Height 14px against a 44px requirement.
**Fix:** `display:inline-flex` with `min-height:44px` and horizontal padding —
the text sits where it did, the hit area grew. `.foot-links` `margin-top`
dropped 10px→0 to absorb the added height.
**Status:** FIXED 2026-07-28. Verified: gate re-run, 0 failures.

### F-02 · "← Back to the owner Jefferson's apps" was 216.8×16px
**Found:** 2026-07-28 · first run of `a11y-gate.mjs`
**Rule:** Doctrine §4 (targets ≥44px)
**Detail:** `public/accessibility.html` `.foot a` measured **216.8 × 16 px** in
both themes at both viewports. It sits on its own line before a `<br>`, so
nothing constrains its height and no inline exemption applies.
**Fix:** `display:inline-flex; min-height:44px`. Measured after: 220.8 × 44.
**Status:** FIXED 2026-07-28. Verified: gate re-run, 0 failures.

### F-03 · The email link is exempt, and that is a decision to confirm
**Found:** 2026-07-28 · **Status: CLOSED 2026-07-29 — the owner ruled, see below**
**Detail:** `.contact-email` measures 244.1×19px, below §4's 44px. It sits inside
a sentence ("Email *address*. Say which app and what happened…"), which WCAG 2.2
SC 2.5.8 explicitly exempts — forcing 44px there would break the paragraph's
line flow and make the page worse. The gate exempts it and prints the exemption
on every run.
**Open question:** §4 states "Targets >= 44px" with no exception. Either §4 gains
the inline exception in writing, or the link is restructured onto its own line.
Recorded rather than decided by a session.
**Status:** CLOSED 2026-07-29 — the owner ruled: §4 gains the exception. The doctrine
now carries SC 2.5.8's inline exception in writing, matching what the gate has
done and printed all along. The link stays in its sentence. The gate's end-of-run
summary no longer says the question is open.

### F-04 · axe cannot check contrast on transformed elements
**Found:** 2026-07-28 · **Status: KNOWN INSTRUMENT LIMITATION**
**Detail:** axe-core reports `color-contrast` as `incomplete` rather than a
violation for elements under a CSS transform — a green axe run over such content
proves nothing (inherited from photo-pointer, LESSONS §5). This is why the
registry above is computed by hand rather than delegated to axe.
**Status:** Mitigated by the hand-computed registry. Not fixable in axe.

### F-05 · Target spacing was never checked, only target size
**Found:** 2026-07-29 · the owner's instruction that tremor MUST be supported
**Rule:** Doctrine §4 (tremor is a fail state — targets are spaced, not only sized)
**Detail:** The gate measured every target's own box and nothing about the gap
between neighbours. Size alone is the wrong measurement for tremor: the failure
mode is **overshoot**, so two 44px targets touching each other still send a 2px
miss to the wrong control. Nothing in the repo would have caught a zero-gap list.
**Fix:** `a11y-gate.mjs` gained a pairwise spacing check over the rects it was
already collecting — `MIN_SPACING = 8`, applied to non-inline targets, with the
same inline-in-a-sentence exemption the size rule carries and the same loud
reporting. 8px is our own floor, not a WCAG citation: SC 2.5.8 treats spacing as
compensation for insufficient size rather than as an absolute gap.
**Status:** FIXED 2026-07-29. Verified by breaking it: `.tiles` gap 11px→2px
produced **16 failures across both themes and both viewports**, each naming the
two targets and the measured gap, exit 1. Reverted; the real layout passes.

### F-06 · `.tiles.compact` sits exactly on the spacing floor
**Found:** 2026-07-29 · **Status: FIXED 2026-07-29 — the owner ruled, see below**
**Detail:** The compact handle rows (`.tiles.compact`) use `gap:8px`, which meets
the new ≥8px rule exactly. It passes, so this is not a failure — but any future
tightening of that value fails the build, and 8px is the least spacing a tremor
overshoot can tolerate rather than a comfortable one.
**Open question:** whether to raise the compact gap. Recorded rather than changed,
because the page currently passes and a session should not redesign a working
layout on its own initiative.
**Status:** FIXED 2026-07-29 — the owner ruled: raise it. `.tiles.compact` gap 8px →
11px, matching the main list, so the compact rows carry real margin above the
tremor spacing floor instead of sitting exactly on it. Verified: gate re-run
green.

### F-07 · Card and chip boundaries are below 3:1 (WCAG 1.4.11)
**Found:** 2026-07-29 · first run of the new non-text contrast check
**Rule:** Doctrine §4 (contrast is not only for text) / WCAG 1.4.11
**Detail:** `a.tile`, `a.approw` and `.vchip` are bounded only by a `--line`
border. Measured against the **worst** background stop — the radial overlay,
`#E8EEFC` light and `#16203F` dark, which is darker/lighter than the linear
gradient and is the case that actually decides it:

- border **1.18:1** light, **1.23:1** dark (needs 3:1)
- fill **1.03:1** light, **1.07:1** dark — `--surface` nearly matches the overlay,
 so the fill carries no boundary information at all

Reaching 3:1 means `--line` roughly `#26304F` → `#646FA0` (dark) and `#D5DCEA` →
`#7482A0` (light). Those borders go from invisible to clearly drawn.
**Both readings are honest:** strictly, the boundary is below 3:1. Arguably 1.4.11
does not bite, because each card contains link text that already passes AA, so the
component identifies itself and the card is grouping rather than the identifier.
Doctrine §3 says gentle contrast is tuned *within* AA, never against it, which
points at fixing it.
**Status:** FIXED 2026-07-29, on the owner's word ("what do you suggest?" → fix it,
plan approved). `--line` raised to COMPUTED values on both deployed pages:
dark `#26304F` → `#646FA0` (**3.29:1**), light `#D5DCEA` → `#7482A0` (**3.32:1**),
each against the worst gradient stop. The `prefers-contrast: more` block was
recomputed so the preference still strengthens rather than newly weakening:
dark `#828CBC` (**4.90:1**), light `#5A6784` (**4.87:1**), verified applied in a
real render (a first probe read the default mid-`border-color` transition —
.16s ease — and looked like the block was dead; a settled re-read showed both
values live. Suspect the instrument first). Hover border colours also failed the
same rule and were raised — dark `#33406B` (1.59:1) → `#7C87B5` (**4.56:1**),
light `#B9C4DC` (1.51:1) → `#63718F` (**4.21:1**) — so hovering strengthens a
boundary, never erases it. `a.tile`, `a.approw`, `.vchip` are now registered in
`nonText`; the fail→pass transition on the exact selectors that measured 1.18:1
and 1.23:1 is the §6 proof. `.ns-list a` is NOT registered: it lives inside
`<noscript>`, so the selector cannot match while JS runs — the loud-failure rule
caught precisely that on first arming — and it borrows the same tokens, so it is
covered by proxy. The og/social card templates keep the old token on purpose:
static share images, not deployed pages.

### F-08 · Status messages (4.1.3) are not machine-checkable
**Found:** 2026-07-29 · **Status: BY DESIGN — declaration, not a gate**
**Detail:** Whether a live region exists, and whether it actually announces the
right thing at the right moment, cannot be determined statically. Doctrine §4
carries the rule; each app declares its status messages and the region serving
them, and it is verified by hand with a screen reader.
**Why it is recorded rather than gated:** a check that always passes reads as
coverage. That is precisely the failure §4 documents about itself — a documented
gate nobody ran, believed for months.

### F-09 · `<canvas>` text alternative — check added, inert here
**Found:** 2026-07-29 · **Status: LIVE, but never exercised on this repo**
**Rule:** Doctrine §4 (a canvas is non-text content) / WCAG 1.1.1
**Detail:** The gate now fails any `<canvas>` lacking an accessible name or
fallback content. The hub has no canvas, so this check cannot fire here; it exists
for the sibling apps that share this gate, Intersecting Parallels above all, where
the drawing surface *is* the app.
**Proved by breaking it (§6):** an empty `<canvas>` injected into `index.html`
produced 4 failures across both themes and both viewports, exit 1. Reverted. The
check works; it simply has nothing to catch here.
