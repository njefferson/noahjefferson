## 342 · The instrument that judges a feature can be built on that feature's own rendering, so changing the rendering makes it lie instead of fail

**Enforced by:** CHECKLIST who-reads-this-pixel — before changing anything a
test READS — an overlay's blend, a status string's wording, a debug colour —
grep for the constants themselves, not just for the function name. A test that
inverts your arithmetic has copied your numbers, and a copy does not move when
you do.

A photo editor's sky-mask overlay is one line of shader:

`g = mix(outside, inside, cov)` where `inside = mix(g, cyan, 0.32)` and
`outside = mix(luma(g), g, 0.5) * 0.5`.

The acceptance test for the sky mask reads the canvas twice — overlay on,
overlay off — and SOLVES that expression for `cov`. It has to: the overlay is
the only place the true post-feather, post-invert coverage appears on the
reader's side of the screen. So the test carries its own copy of `0.32`, of the
`0.5`s, and of the cyan.

**The change that was about to be made was to drop the cyan from that mode**,
because on a look that swaps red and blue the tint is the same colour as the
foliage it is drawn over. Harmless-looking, and it would not have failed
anything. The test would have kept solving — against constants that no longer
describe the render — and kept reporting coverage, edge-band and spill figures
for every frame, all of them plausible and all of them wrong. **The instrument
the repository uses to decide whether the sky mask is correct would have
started lying, silently, in the same commit that improved what the reader
sees.**

The fix is not clever: the new view is a NEW mode, the old mode's shader does
not change a character, and a comment in each names the other. What is worth
carrying is the shape of the trap.

## Why this kind of coupling is normal and invisible

A test on the reader's side of the screen has nothing to read but pixels.
Anything it wants to know that is not a pixel — a weight, a coverage, a state —
it has to recover by inverting the rendering. So the better the test is at
measuring what the reader actually sees, the more tightly it is welded to how
the reader is shown it. The instruments most worth having are the ones most
exposed to this.

Two things follow. **A rendering that a test inverts is API**, and it gets a
comment saying so at the source, not only in the test. And **a rendering change
is additive by default** — a new mode, a new colour, a second overlay — because
the cost of an extra branch is a few instructions and the cost of moving the
old one is an instrument that agrees with itself.

**Jefferson-Photography-Studio, 2026-09-20.** Found by reading the test while
designing the change, not by running anything; nothing would have run red.
