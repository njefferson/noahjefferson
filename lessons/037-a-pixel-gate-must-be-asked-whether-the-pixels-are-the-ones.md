## 37 · A pixel gate must be asked whether the pixels are the ones it thinks

**Enforced by:** GATE fauxplane:scripts/a11y-gate.mjs — the contrast sampler grows the viewport to the document height BEFORE measuring, so the coordinates it reads and the screenshot it samples come from one layout.

fauxplane's contrast registry measures text against the real backdrop by hiding
the text, taking a full-page screenshot, and sampling the pixel where the text
was. It reported:

 power annunciator (OFF, lit) measured 1.00:1 against the real backdrop

A ratio of exactly 1.00 means the foreground was compared against **its own
colour** — the pixel sampled for the BACKDROP was the element's own text.

**`page.screenshot({ fullPage: true })` grows the viewport to the document
height to take the shot.** Anything sized by viewport height — a percentage
height, flex distribution down a column, a panel sized to fill the screen —
reflows while it does. The coordinates had been read at a 768px viewport and
were being sampled out of an image laid out at 1030px, so they pointed at
whatever had slid into that spot: in this case the element itself, still
painted, a hundred pixels from where the measurement said it was.

**Three investigations went straight past it, and all three were correct.** The
DOM said the element was hidden. `elementsFromPoint` said nothing was behind it.
A hand-rolled replication of the sampler measured a clean 10:1. Every one of
them was looking at the DOM; the gate was looking at a screenshot.

**The general shape: when a check disagrees with your reasoning, suspect the
CHECK'S INSTRUMENT before the reasoning.** A gate that measures pixels has a
second question nobody asks it — not "is this colour right" but "are these the
pixels of the thing I named". Growing the viewport first makes the capture a
no-op and the two agree by construction, which is better than a correction
factor because there is nothing left to get wrong.

*(fauxplane, 2026-08-03.)*

---
