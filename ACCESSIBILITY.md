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

### F-02 · "← Back to Noah Jefferson's apps" was 216.8×16px
**Found:** 2026-07-28 · first run of `a11y-gate.mjs`
**Rule:** Doctrine §4 (targets ≥44px)
**Detail:** `public/accessibility.html` `.foot a` measured **216.8 × 16 px** in
both themes at both viewports. It sits on its own line before a `<br>`, so
nothing constrains its height and no inline exemption applies.
**Fix:** `display:inline-flex; min-height:44px`. Measured after: 220.8 × 44.
**Status:** FIXED 2026-07-28. Verified: gate re-run, 0 failures.

### F-03 · The email link is exempt, and that is a decision to confirm
**Found:** 2026-07-28 · **Status: OPEN — needs Noah's word**
**Detail:** `.contact-email` measures 244.1×19px, below §4's 44px. It sits inside
a sentence ("Email *address*. Say which app and what happened…"), which WCAG 2.2
SC 2.5.8 explicitly exempts — forcing 44px there would break the paragraph's
line flow and make the page worse. The gate exempts it and prints the exemption
on every run.
**Open question:** §4 states "Targets >= 44px" with no exception. Either §4 gains
the inline exception in writing, or the link is restructured onto its own line.
Recorded rather than decided by a session.

### F-04 · axe cannot check contrast on transformed elements
**Found:** 2026-07-28 · **Status: KNOWN INSTRUMENT LIMITATION**
**Detail:** axe-core reports `color-contrast` as `incomplete` rather than a
violation for elements under a CSS transform — a green axe run over such content
proves nothing (inherited from photo-pointer, LESSONS §5). This is why the
registry above is computed by hand rather than delegated to axe.
**Status:** Mitigated by the hand-computed registry. Not fixable in axe.
