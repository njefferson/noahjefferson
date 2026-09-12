## 276 · A threshold's own justification names the scale it was measured on, and a second scale needs a second number rather than the same one

**Enforced by:** CHECKLIST threshold-scale — for every numeric limit in a
pipeline that accepts more than one kind of input, read the comment that
justifies the number and ask what it is a fraction OF. If the answer names a
property of one input kind (bit depth, gamma, full-scale, a code step), the limit
belongs to that kind and every other kind needs its own, derived the same way.
Write the derivation, not the number. · JUDGEMENT — a limit with no stated
derivation cannot be moved to a new scale at all; it can only be re-measured.

**Smell:** one named constant, two decode paths. Also: a limit whose comment
explains it in units the other path does not have — "an 8-bit code step", "after
the tone curve", "of what a JPEG can hold".

**Infrared Photography Studio, 2026-09-12.** A lens-profiling rig accepts both
camera raw and camera JPEG. Three of its limits — darkness, clipping and a floor
below which colour is withheld — were every one calibrated on rendered frames,
and every one was a single constant applied to both.

The colour floor is the clearest case because its own comment gives the
derivation: 0.09 is not a level that means anything on its own, it is where ONE
8-BIT CODE STEP falls to about 2% of the value. That makes it a statement about
the quantisation step, and the step is a property of the scale. Measured on
sixteen pairs of the same frame, one raw and one camera JPEG:

- raw reference green ran 0.0195 to 0.0753 with a step of 3.45e-5, so one step
 is 0.05% to 0.18% of the value;
- rendered reference green ran 0.0077 to 0.1090 with a step of 5.2e-4 to 2.5e-3,
 so one step is 2.3% to 6.8% of it.

So the floor was refusing measurements forty times better than its own target
while admitting ones three times worse than it. No raw frame in existence
reached it: the highest was 0.0753 against a floor of 0.09. The consequence was
not a rejection anybody saw — the frames were still used for brightness — it was
that the colour half of every profile ever measured came from the noisier path,
over-correcting by 3.5x in red and 2.3x in blue.

**The instrument error worth recording alongside it.** The first comparison
divided an 8-bit step of 1/255 by a value measured in LINEAR light and reported
one code step as 26% of the reference green. That is wrong by about sevenfold
and it looked like a finding. The profiler linearises 8-bit pixels through a
lookup before it sums anything, so the step had to be taken in linear light too,
at the level in question. **A ratio between two numbers on different scales is
the same mistake the lesson is about, one level up.**

**Why the derivation and not the number.** The sibling limit had already been
fixed the day before by scaling: raw linear was measured at 0.126 to 0.134 of the
rendered scale, so the darkness floor got a raw twin at roughly that ratio. That
worked, and it taught the wrong method — the colour floor's correct raw value is
NOT its rendered value over 7.6, because the thing it bounds is not the level but
the step, and the step does not scale with the level at all. Two limits on the
same pair of scales, two completely different conversions. Only the written
derivation says which.
