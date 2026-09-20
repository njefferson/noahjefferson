## 340 · A published method's constants encode the data it was written for, and transplanting them is where it breaks

**Enforced by:** CHECKLIST published-method-transplant — for every literal
number in the source, say what about ITS data the number is a fact about, and
either restate it in terms of your own data or write down why it carries over.
Do this before the first run, not after the first wrong answer.
**Enforced by:** CHECKLIST reference-implementation-is-not-the-paper — when a
reimplementation is read alongside the paper, the paper's equations are the
source of truth and the code is a hint. Check each equation against the code
and record the disagreements.

A photo editor needed to find where the sky ends in an infrared frame. The
field settled this in 2013: a sky border position function b(x), one border row
per column, taken as the first row whose gradient exceeds a threshold t, with t
chosen by maximising an energy function that rewards a homogeneous region above
the border against a varied one below. Two pages of paper, three algorithms.
Structurally exactly right, and the structure transplanted without trouble.

**Every numeric constant in it was a fact about 8-bit greyscale photographs,
and three of the four had to be restated.** None of them announced itself.

## The threshold range was a fact about an operator and a bit depth

The paper searches t from 5 to 600 in 120 steps and states 1443 as the
theoretical maximum of an OpenCV Sobel on 8-bit data. The app's gradient is a
central difference on luma normalised to each frame's own 95th percentile. A
fixed range transplanted there means something different on every photograph.
The restatement is 120 QUANTILES of the frame's own gradient distribution,
which says the same thing — run from "most of the frame is an edge" to "almost
none of it is" — scale-free.

## The energy function is not scale-free, and its data was BOUNDED

Its denominator adds a covariance determinant, which has units of value³, to an
eigenvalue, which has units of value¹. So the balance between the two terms —
and the γ that was tuned against it — depends on the numeric range of the
channels. On 0..1 data the determinant term all but vanishes and a γ chosen on
0..255 data is weighting something else.

Scaling to 0..255 is the obvious repair and it is only half of one, because
**8-bit data is also bounded and scene-linear data is not.** Luma normalised to
a 95th percentile runs freely past 1 on anything specular, so one bright tail
inflates a region's determinant by orders of magnitude. Gamma-encoding and
clamping first is what restores the assumption.

Worth recording: that fix was reached for on a frame where the optimum had
walked off the end of the search, and **it did not fix that frame** — the cause
was elsewhere (§341). The argument for it was sound and the frame it was found
on was a coincidence. Both things can be true, and saying so is cheaper than
letting the next session assume the constant is load-bearing where it is not.

## A post-processing threshold was a priority, not a measurement

The paper's second no-sky test calls a photograph sky-less when the border sits
high AND zigzags. Wired as written, it refused a frame with real sky in it: an
oak fills that frame's top-left, so the border is high on the left and low on
the right and steps hard in between, which is what a canopy IS. The paper is
for a robot that must not drive into a wall, so a false "no sky" is cheap
there. In the editor the ranking is the opposite — a photograph with sky must
have all of it selected, and a photograph without one selecting a sky is not a
failure because the reader turns the mask off. Same equation, opposite cost
function, and nothing in the paper says so because nothing in the paper needed
to.

## And the reference implementation was not the paper

A well-known Python reimplementation was read for its equations. Two of its
transcriptions are wrong: its threshold step drops a term of the paper's
equation 11, and its energy function takes the determinant of the eigenVECTOR
matrix — which is ±1 for any symmetric matrix — where the paper writes λ1. Both
would have shipped silently, because both produce plausible borders on easy
frames. The code was useful for the ALGORITHM SHAPES and misleading for the
arithmetic, which is the normal case and is worth expecting.

**Jefferson-Photography-Studio, 2026-09-20.** Shen & Wang, "Sky Region
Detection in a Single Image for Autonomous Ground Robot Navigation",
International Journal of Advanced Robotic Systems 10(10), 2013.
