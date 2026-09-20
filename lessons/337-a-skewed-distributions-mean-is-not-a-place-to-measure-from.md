## 337 · A skewed distribution's mean is not a place to measure a distance from

**Enforced by:** GATE Jefferson-Photography-Studio:tools/mask-truth-walk.mjs —
the walk reports how far its largest missed block sits from the covered sky in
MADs below the MEDIAN, and refuses to draw any conclusion inside 2.5 of them.
**Enforced by:** CHECKLIST distance-in-spreads — a claim of the form "this is
far from that" needs the spread of "that" in the same breath. Before writing
one, compute the median and the MAD and say the distance in MADs. If the mean
and the median disagree, the distribution is skewed and the mean is not a
landmark.

A photo editor's sky-selection test reported one block of 18,933 px as missed
sky. Deciding whether it really was sky meant comparing it against the sky the
mask had taken, and the comparison reached for was the obvious one:

- the block's mean luminance: **0.264**
- the covered sky's mean luminance: **0.483**

Barely half as bright. That was written up as strong evidence the block was not
sky at all, and a gate was written that fired whenever a block came in below
75% of the sky's mean.

**The covered sky on that frame includes a large bright cloud.** Its median
luminance is 0.312 and its MAD is 0.028, so the mean sits six MADs above the
median — the distribution has a long bright tail and the mean is sitting in it,
describing nothing. Against the median the block is **1.8 MADs low**, which is
ordinary sky variation.

So the evidence was void. Half as bright as a number that nothing in the frame
actually is.

## The part worth being uncomfortable about

**The conclusion was right anyway.** Magnifying that corner three times shows a
heavily defocused branch at the frame's edge, leaf silhouettes along its
blurred boundary, unmistakably not sky. A second instrument, working from a
different key, independently refused the same pixels.

A right answer reached through a void argument is worse than a wrong one,
because nothing goes back and checks it. The gate built on it would have gone
on firing on the same void comparison against every future frame, and its
agreeing with the picture once is exactly what would have kept it.

## And the instrument that settled it was a crop

Not a statistic. Three times magnification of the disputed corner, read beside
the same place on the diagnostic map. That is twice on this one item that
magnifying beat measuring — the first was a "ragged edge" diagnosis that four
times magnification disproved, after a whole plan had been written on it.

§328 already says a number is a pointer to where to look and never evidence
about appearance. This is the sharper corollary: **when the question is what
something IS, the statistic's job is to say where to point the crop.**
