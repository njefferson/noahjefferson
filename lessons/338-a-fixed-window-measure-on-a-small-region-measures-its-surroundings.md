## 338 · A fixed-window measure on a small region measures its surroundings

**Enforced by:** CHECKLIST window-versus-region — before reporting any measure
computed over a neighbourhood (a gradient step, a box blur, a local variance,
a patch statistic), compare the window's reach against the size of the region
it is being computed on. If the region is not several windows across, the
number describes what is around it. Report the region's size beside the
measure, always, so the comparison cannot be skipped.
**Enforced by:** GATE Jefferson-Photography-Studio:tools/mask-truth-walk.mjs —
the walk prints the size of every block it characterises, in the same line as
the characterisation.

A photo editor's sky-selection test was miscounting one block as missed sky.
The block is a heavily defocused branch at a frame edge. The standard fix, and
the field's own answer since the late-nineties patents, is colour plus TEXTURE:
sky is smooth, leaves are not.

Measured on three frames' largest missed block, as a signed distance in MADs
from the confident sky's median, with gradient activity at a one-pixel and an
eight-pixel step:

- frame A, block 292 px: texture at 8 px **+52.6 MADs**
- frame B, block 406 px: texture at 8 px **+8.2 MADs**
- frame C, block 18,933 px: texture at 8 px **+0.1 MADs**

Read as a table that looks like a discriminator that works twice and fails
once. It is not. **The two large readings are the window reaching outside the
block.** Those blocks are about seventeen and twenty pixels across; an
eight-pixel gradient step samples well beyond them, into the crown structure
they sit inside. Their texture scores are a measurement of their surroundings.
Frame C's block is about 140 pixels across — the only one where the window
stays inside — and it reads as smooth as sky, which is what bokeh is.

So the honest result is not "works on two, fails on one". It is **the measure
was never tested on anything it could measure until frame C**, and where it
could, it separated nothing.

## The shape

Every neighbourhood operator has a reach, and every region has a size, and the
number is only about the region when the second is several times the first.
This is obvious stated plainly and invisible in a results table, because a
table prints the statistic and not the support it was computed over.

The trap has a direction that makes it worse: **small regions produce dramatic
numbers**, because a small region is mostly boundary and a boundary is where
the contrast is. So the confounded rows are the ones that look like the
strongest evidence, and a discriminator chosen off them will be adopted
precisely because of its artefacts.

## And validate on the hard case, not the easy ones

The two confounded frames were the ones where the answer was already obvious by
eye. The frame that motivated the whole exercise — the one with the defocused
branch — is where the measure had to work, and it is the one it was tested on
last. Had the order been reversed, the texture idea would have been closed in
one run instead of after a design.

**A discriminator is validated on the case that motivated it.** The cases where
it is easy do not vote.
