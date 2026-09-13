## 288 · A reading taken before a known transient settles measures the transient, and comes out stable enough to publish

**Enforced by:** CHECKLIST measure-the-settled-state — before the first
reading, wait on the signal the app itself uses to say the state is final (the
class it sets, the status it writes), never on "the element has loaded" or a
timeout. · JUDGEMENT — two different subjects agreeing to three decimals is a
fact about the instrument, not about the subjects.

**Smell:** `img.complete && naturalWidth > 0` as a readiness test on a surface
that shows a placeholder first. A before/after comparison where "before" is
whenever the walk got there. Any per-item measurement whose values across
different items differ by less than their own precision.

**Measured 2026-09-13, Jefferson-Photography-Studio.**

A tile in the photo strip shows the camera's own embedded JPEG the instant a
file lands, then replaces it with the app's own render — a shipped feature,
marked in the markup with a `.provisional` class. Both pictures satisfy "the
image has loaded".

A probe compared each tile before and after its photograph was opened, to test
whether the tile's guess at the opening baseline matches the real thing. It
reported a drift of **0.2726 of 1** on one frame and **0.2730** on another, with
a centre-against-edge ratio moving 2.567 to 2.342 on both. That was written into
the project record and a commit message as *five times worse than previously
measured*.

It was the camera's picture being replaced by the app's. Waiting for every tile
to lose `.provisional` before the first reading gives **0.0000 on both frames**.

**WHY IT SURVIVED REVIEW: it was stable, it was plausible, and it pointed at a
defect somebody had already written down.** The number reproduced across runs,
it had the sign and rough size the open item predicted, and it arrived while
looking for exactly that. A measurement that confirms what you went in
believing gets less scrutiny than one that surprises you, which is backwards.

**THE TELL WAS IN THE DATA AND WAS READ AS CONFIRMATION.** Two different
photographs, of different scenes, produced 0.2726 and 0.2730 — agreement to
three decimals. A per-photo divergence in a measured baseline cannot do that;
only a systematic swap between two rendering paths can. Identical results from
different subjects mean the instrument is measuring something they share.

**And the control was the wrong one anyway**, which the same repo had already
recorded: comparing a tile against a tile proves the two readings agree, and
they can agree by going through the same function. The control has to be what
the reader is actually comparing against — the photograph on screen.

**The cost was small only because it was caught before it was built on.** The
next step would have been refactoring the app's opening path, which is its most
load-bearing function, to close a gap that is not there.
