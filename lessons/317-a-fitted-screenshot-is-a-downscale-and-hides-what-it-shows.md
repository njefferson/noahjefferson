## 317 · A fitted screenshot is a downscale, and an absolute threshold cannot see a relative defect — two instruments agreeing on the wrong answer

**Enforced by:** CHECKLIST measure-at-1to1-and-relatively — when the defect is
per-pixel (speckle, pepper, banding, aliasing), the picture goes back at 1:1 with
no fit, and the metric is a percentile against that region's own median, never a
fixed threshold. · JUDGEMENT — a screenshot scaled to fit is a low-pass filter
applied to the evidence, and an absolute cut answers a different question from the
one a relative defect asks.

**Smell:** a whole-frame render used as proof that something per-pixel is absent.
Any metric of the form "share of pixels below a fixed value" aimed at a defect
described with a comparative word — paler, blotchier, noisier. A measurement and
a picture agreeing that a reported defect is not there, when the person who
reported it is looking at the same file.

**Measured 2026-09-17, Jefferson-Photography-Studio, one full diagnosis published
against the wrong conclusion.**

Pale speckle was reported in the sky of an infrared rendering. The repository's
own test raw was run through the whole pipeline one stage at a time, scanning
blocks down the sky, and the report went back saying that frame did not have the
artefact and asking for one that did. Both halves of that were produced by the
instrument.

The render used as proof was a fitted screenshot of the whole frame at 724px on a
source thousands of pixels wide. **Downscaling is averaging**, so single-pixel
dots were gone before anything looked at them; at 1:1 the same sky is dense with
them. The metric was the share of pixels carrying no hue at all, a fixed cut —
and these dots are not colourless, they are merely far less saturated than the
sky around them, so the cut read 0.00% on a sky that was visibly peppered.

**Two instruments, both wrong in the same direction, agreeing.** That agreement is
what made the conclusion feel safe. A picture and a number that agree are not two
pieces of evidence when the same property — scale — breaks both.

**The metric that worked was relative**: the tenth percentile of chroma over the
median inside one block. An even sky reads near 0.94; the peppered ones read 0.65
to 0.72. The same reading then ran the ablation properly and showed the artefact
present with the look entirely off, which is the fact the whole diagnosis turned
on and which the first pass had made unreachable.

**The correction came from the person who reported it**, with a 1:1 crop of the
very file that had just been declared clean.
