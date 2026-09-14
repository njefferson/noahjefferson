## 295 · A check can be vacuous at the TRIGGER rather than at the assertion, and it reads as a clean 0.00 against the defect

**Enforced by:** CHECKLIST fail-it-first — every new check is run against the
unfixed build and its failure printed, and a check that comes back GREEN there is
rewritten, never explained. · JUDGEMENT — when a negative control passes, suspect
the setup before the subject.

**Smell:** a check whose before-and-after are taken in one session, where the
action between them is meant to be inert. "Nudge it and put it back." "Fire the
event without changing the value." A difference of exactly 0.00 reported as a
pass.

**Measured 2026-09-14, Jefferson-Photography-Studio.** The claim: whether a
photograph has been OPENED must not change the tile that represents it. The
defect: the thumbnail renderer discarded the depth curve a photo had already
solved, but only on the branch taken for a photo with its own edit.

The check opened a photo, then fired the app's own restripe with a control event
that changed no value, then compared the tile before and after. It measured 0.00
against a build with the defect in it and reported a pass. The assertion was
right, the threshold was right, the instrument read the pictures correctly — and
the trigger did nothing, because opening a photo deliberately does not change its
stamp, so the tile was never redrawn and the defective branch never ran.

**The general shape.** A before-and-after check has three parts and the
literature of vacuous checks is almost entirely about the assertion. The trigger
fails silently in a way the assertion cannot: an assertion that cannot
discriminate still produces a number, while a trigger that does not fire produces
the SAME number, which is exactly what "no change" is supposed to look like. A
passing before-and-after with a zero difference is indistinguishable from a
correct build, and that is the whole trap.

**What replaced it.** Two independent runs of the same files rather than two
readings of one run: one session where the photo is opened first, one where it
never is, both brought to the same state by the same press, and the two tiles
compared across the sessions. There is no inert trigger to get wrong, because
there is no trigger — the difference between the runs IS the condition under
test. It measured 23.53 of 255 against the defect and 2.08 with it fixed, which
is the encoder and the resample.

**And the threshold came from those two numbers, not from taste.** A tolerance
picked before the measurement is a guess that the check then enforces; picked
after, with an order of magnitude between the two readings, it is a fact with the
failing number written beside it in the file.
