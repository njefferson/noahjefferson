## 203 · A computed quantity can be checked against the WORLD, and two paths through one model must be made to close

**Enforced by:** CHECKLIST physical-invariants — for anything computed from a physical model rather than fetched from a service, assert properties that follow from the world and were not tuned to (extremes, symmetries, known magnitudes at known dates); a value that merely "looks plausible" is untested. · CHECKLIST substitute-back — where the same quantity is reachable by two code paths, assert the loop closes by feeding one's output into the other, never by computing it the same way twice. · JUDGEMENT — which invariants exist is specific to the physics, and no gate can enumerate them.

**Smell:** a function that returns times, positions, angles or magnitudes and is tested only against a hardcoded expected value somebody read off another tool once. Also: a "fast" closed form and an "exact" evaluator for the same quantity, living in the same file, never compared.

An app added sunrise, sunset and civil twilight — arithmetic from a date and a
position, no request, nothing to go stale. Almost everything else it does comes
from a service and can only be checked against a fixture. **This could be
checked against the sky.**

**THE FIRST VERSION WAS EIGHT HOURS WRONG AND LOOKED RIGHT.** A longitude
correction applied twice — once in the day number, once in the noon estimate.
The declination was correct. Day length at the equinox was correct. Day length
at both solstices was correct to a minute. Every quantity that does not depend
on the time origin was right, which is exactly what made it survive reading.

The check that killed it was **solar noon against longitude**: local noon is
12:00 UT minus the longitude over fifteen, plus or minus the equation of time.
That is the one quantity a doubled longitude correction cannot satisfy. Adding
it took one line and it failed immediately.

The invariants that then made the result trustworthy were the ones **nothing had
been fitted to**: the equation of time peaking about sixteen minutes ahead in
early November and fifteen behind in mid-February. Those fall out of the model
or the model is wrong. A test that asserts sunrise equals a time copied from
another calculator proves the copying; a test that asserts the equation of time
peaks in early November proves the physics.

**THEN THE CLOSURE CHECK FOUND THE REAL ONE.** The feature needed the same
quantity two ways: the sun's altitude at an arbitrary instant (to shade a
chart) and the named crossings (to write sentences). Two formulations of one
thing, in one file, is how they come to disagree with nobody able to
adjudicate — so the suite substituted one back into the other: **the altitude
at the sunrise this code computes must BE the sunrise altitude.**

It was −0.65° where sunrise is defined as −0.833°. Forty-five seconds.

Nobody can act on forty-five seconds, and that is not the point. **A
disagreement nobody can adjudicate is how a defect comes to live in whichever
path is read less often** — and the shading path and the sentence path are read
by different people, one of whom cannot see the shading at all.

**The first hypothesis was wrong and testing it was the productive step.**
Taking the declination at the crossing rather than at solar noon is the obvious
suspect and is a real approximation in that algorithm; fixing it moved the
answer by a fraction of a second and left the 0.18° standing. That is what
established the real cause — the *transit* estimate, a two-term
equation-of-time approximation in one path against sidereal time and right
ascension in the other. Ruling out the plausible cause is what made the actual
one findable.

The resolution is the general one: **one definition, and the other refines to
it.** Not two formulations kept in sync by care.

**AND ONE TEST WAS ASSERTING A PROPERTY OF THE APPROXIMATION.** "Sunrise and
sunset straddle solar noon exactly" passed for as long as the model was crude
enough to make it true. Declination drifts across a day, so the asymmetry is
real and is tens of seconds. **Improving the model broke the test, and the test
was the thing that was wrong.** When a check fails immediately after an
accuracy improvement, suspect the check before restoring the error.
