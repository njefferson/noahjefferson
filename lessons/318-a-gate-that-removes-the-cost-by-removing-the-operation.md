## 318 · A gate that removes an artefact's COST by switching the operation off reads as a fix in every number except the one it was built for

**Enforced by:** CHECKLIST prove-the-gate-opened — a change that makes a filter,
rule or branch conditional is not verified by the artefact disappearing. Measure
what fraction of the input the condition actually admits, on the cases the change
was for, BEFORE reading any outcome number. · JUDGEMENT — an operation that never
runs has no side effects, so every cost metric improves and the one benefit
metric quietly does not.

**Smell:** a conditional added to an expensive operation, followed by a sweep
where the harms all vanish. Two arms of a test returning byte-identical readings
at every step of a strength sweep, including full strength — that is not a filter
behaving gently, that is a filter that is off. A result that is better than the
change was designed to achieve.

**And the sibling smell, which is where it starts:** a threshold calibrated on a
whole-frame distribution and then applied per region. The percentiles say a tail
exists; they never say WHERE it is.

**Measured 2026-09-17, Jefferson-Photography-Studio.**

A wide colour blur cleared the mottle in one infrared sky and bled the edges of
every other frame it was tried on, rising with strength. A local gate was built to
aim it: act where there is little colour to lose, stand back where there is a lot.
The whole-frame distribution appeared to support it — the defective frame had 12%
of itself below 0.23 with a gap to 0.52, the two frames that needed nothing had
nothing below 0.44, and three camera files nothing below 0.69. The knee went in
that gap.

The sweep came back looking like a success. The busiest block that had climbed 50
to 115 under a fixed strength went 50, 50, 50, 48. The other raw's went 113 to
110 instead of rising. The edge bleeding the gate existed to remove was gone
completely, on every frame.

**It was gone because the filter was.** Only about 5% of the defective frame sat
below the knee and NOTHING in either camera file did — both returned byte-identical
readings at every step of the sweep including full strength, which is the tell
that was there to be read and was not. The sky the gate was built to clear moved
0.65 to 0.67 where the ungated version had reached 0.75.

**The reasoning error underneath, which is its own trap.** The gate's premise came
from a recorded measurement that the frame's channels were 97.9–99.4% CORRELATED,
read as meaning the region was near-neutral. Correlation is whether two channels
track each other across a frame, not whether they are equal at a pixel: a channel
at forty times another is perfectly correlated and violently non-neutral, which is
exactly what an infrared raw is. Splitting the frame in thirds afterwards showed
the region in question carrying the HIGHEST local colour in the picture, not the
lowest — the opposite of what the gate assumed, and one cheap measurement away the
whole time.

**What makes this family-level rather than one app's bug.** The pattern is any
optimisation or narrowing that is verified by its harms going away. A cache that
is never hit has no staleness. A validator that never matches has no false
positives. A retry that never fires has no thundering herd. Each reports clean on
every metric except a benefit number that nobody put in the same table — and the
fix is not more outcome metrics, it is one reading of how often the new condition
is true on the inputs it was written for.
