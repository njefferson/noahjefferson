## 281 · A "keep the better one" rank scored on one axis will refuse an answer of a different KIND, and report it as keeping the better one

**Enforced by:** CHECKLIST rank-across-kinds — wherever code keeps the better of
two versions of the same thing, write down what its score measures and then ask
what a version could differ by that the score cannot see. If one version can
carry a WHOLE COMPONENT the other lacks, presence of that component outranks the
score; the score only separates versions of the same kind. · JUDGEMENT — the
failure is silent and its message is the word "kept".

**Smell:** a comparison of the form `if (incoming.n < existing.n) keep existing`,
where `n` is a count of effort — frames, samples, runs, votes — and the thing
being compared has parts that can be absent. Also: a data generation on a device
that a bug fix has just made obsolete, and a replace rule that predates it.

**Infrared Photography Studio, 2026-09-12.** A measured lens profile has two
halves: a brightness curve and a colour curve. Re-measuring the same lens, focal
length and aperture replaces what is stored, and the rule for which one to keep
was frame count — sound, because more frames of sky average out the sky's own
gradient, and written down with that reason.

The colour half is withheld when the frames have too little green to divide by,
and it is then stored as a flat 1. **So a profile that measures nothing about
colour could be shot six times and outrank one that measures it from one frame.**

**What made it bite was a fix.** The floor below which colour is withheld had
been set for the scale a camera JPEG uses, so raw frames could never clear it —
for the whole life of the feature. Fixing that made raw frames measure colour for
the first time. A device that had been measuring all week was therefore holding a
generation of six-frame profiles with a flat 1 in them, and the freshly measured
one-frame profiles that finally had colour in them lost to every one.

**Measured, by restoring that device's own backup and offering it the new runs:
fifteen colour-carrying profiles turned away.** Each reported as "kept", which is
the correct word for what happened and tells the reader nothing. The correction
would have stayed brightness-only, with the release notes saying colour was fixed.
After the change the same sequence takes that device from 11 of 76 profiles
carrying colour to 68 of 76 — the remaining 8 being combinations nothing re-shot,
which is coverage rather than a fault, and worth separating in the assertion.

**The shape to remember.** Frame count compares two answers to the same question.
Colour against no colour is two different questions, and no amount of the first
axis should settle it. The rank is two-level now: a profile that says something
about colour wins, and only within the same kind does the count decide.
