## 280 · A guard on the divisor is not a bound on the quotient, and it turns a large error into a discontinuity

**Enforced by:** CHECKLIST bound-the-output — for any user-facing quantity
computed as a reciprocal, a ratio, a tangent or an exponential, bound the RESULT
against what the data can be, not the denominator against zero. Derive the bound
by measuring every value the input actually takes, and assert that no real value
is clamped. · JUDGEMENT — the smell is a magic epsilon next to a division.

**Smell:** `d > 1e-3 ? 1/d : fallback`, or any `if (denominator small) return
something`. The question to ask is what the expression returns just before the
threshold, not at it.

**Infrared Photography Studio, 2026-09-12.** A per-radius correction applied a
gain of `1 / (1 + (k - 1) * s)`, where `k` is a measured channel ratio and `s` is
a strength slider running to 1.5. The guard read: if the divisor exceeds 1e-3,
invert it, otherwise return 1.

That guard admits a gain of a thousand. Worse, it is discontinuous exactly where
it fires: a band of 0 — a radius with no measurement, saved as a blank and read
back as a number — asks for 100x at strength 0.99 and 1x at strength 1.00. So
moving the slider made one ring of the picture brighten without limit and then
snap back to normal at the end of the travel. **A guard that produces a cliff is
not protecting anything; it is hiding the size of the error from whoever reads
the code.**

**The bound came from a census, which is what makes it defensible.** Every band
of every profile in existence — 30 shipped and 130 measured, 19,840 colour bands
— sits between 0.772 and 1.460, and the brightness curve between 1.000 and 1.288.
At the slider's maximum the largest honest correction any of them asks for is
1.52x. Half and double therefore leaves every real measurement untouched with
room on both sides, asserted across 906 combinations of band and strength, and a
corrupt band can no longer paint anything.

**Non-finite is a separate case and it must be neutral.** A NaN band returned 1
under the old guard, by accident, because `NaN > 1e-3` is false. That was the
right answer for the wrong reason. It is now explicit: a missing measurement
corrects nothing. A divisor driven at or below zero saturates at the upper bound
rather than changing sign.

**And the bound belongs to the kind of number, not to the field.** The same
validation was applied to the colour curve and the brightness curve, which are
different kinds: a ratio against green sitting around 1, and a SHARE of the
centre's brightness sitting between 0 and about 1.5, where 0 is the ordinary
reading out at the edges of every profile that ships. One bound for both refused
every profile carrying a brightness curve — and the symptom was not an error but
an absence: nothing matched any photograph and the correction panel simply did
not appear. Two kinds of number, two functions, so no caller can pass the wrong
bounds.
