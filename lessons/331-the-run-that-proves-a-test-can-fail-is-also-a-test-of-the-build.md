## 331 · The run that proves a test can fail is also a test of the build, and it is where a defect nothing else could see turns up

**Enforced by:** CHECKLIST — no parser can tell a test that was written to pass
from one that was watched failing.

"Make a new test FAIL once before trusting it" is already standing practice,
and the reason always given for it is that a test which has never failed is not
known to be a test. **That reason is incomplete, and the incompleteness costs
releases.** The fail-first run does not only exercise the assertion. It is the
first time the new code path is driven END TO END with something known to be
wrong in it — so it is also the run where anything ELSE wrong in the path shows
up, and it shows up loudly, because the run is expected to be red and is
therefore actually read.

## What it caught, 2026-09-19

A bitmap-mask atlas in an infrared editor was converted from a 2D texture to a
2D ARRAY, to raise a cap from four masks to eight without spending two more
texture units. A walk was written to prove a mask in the second layer renders,
and a defect was planted first — the layer index forced to 0 — so the walk
could be watched failing.

**It did not fail. It timed out on the welcome screen, with no photograph
open.** The cause was not the planted defect and had nothing to do with layers:
**`sampler2DArray` has no default precision in GLSL ES 3.00, and `sampler2D`
does.** Declaring one without a qualifier is not a warning about that uniform;
it is a compile error for the WHOLE shader. The app then reports itself
unsupported and opens nothing at all. The fix is one line,
`precision highp sampler2DArray;`.

**Nothing else in the toolchain could see it.** A shader is a STRING to the
type checker, so the build was green. The commit gates are text scans and pure
functions; none of them compiles a shader. Every other walk in the repository
opens a photograph first, so all of them would have failed too — as a timeout
on the welcome screen, which reads as an environment problem rather than as a
defect.

With the precision line in and the plant still there, the walk failed exactly
as designed: the mask in the high slot read an empty mask from layer 0 and the
frame came back undarkened. With the plant removed it renders the identical
number from the high slot as from slot 0.

## The general shape

A change can be wrong in two places at once: in the thing being tested, and in
whether the thing under test can run at all. An assertion written to pass
conflates them — a green run says "the code works" and a red one says "the code
is wrong", and neither says "the harness reached the code". **The fail-first run
separates them, because a failure of the WRONG KIND is legible.** A test that
fails for the reason you planted has proved the path; a test that fails some
other way has just found something.

So the check is not merely *did it go red*. It is **did it go red in the way I
planted**. A fail-first run that fails differently is a finding, not a
formality to click past on the way to the real run.

## The narrower half, worth its own line

**A type that resembles another does not inherit its defaults.** The default
precisions in a fragment shader are given to `float`, `int` and `sampler2D` by
name; every other sampler type is absent from that list, and the omission is
silent until something declares one. The same shape appears wherever a language
gives defaults by enumeration rather than by rule — the near neighbour looks
like precedent and is not.
