## 307 · A session does not get to settle a matter of taste, and a policy calibrated on one file is a taste call wearing a measurement

**Enforced by:** CHECKLIST one-file-one-file — a threshold, floor or exception
derived from a single specimen ships as a CONTROL with a default, never as a
policy; the count of specimens goes in the commit message. · CHECKLIST
ask-the-history — when a report says "didn't this used to work", answer it from
`git log -S` on the behaviour, never from recollection, and name the commit and
the date.

**Smell:** a commit message whose evidence is "that photo", "the frame", "this
file". A constant introduced alongside the one measurement that motivated it. A
code comment conceding that neither outcome is right and then picking one. Any
sentence of the form "X is better than Y" about something the user looks at,
written by whoever changed it.

**Measured 2026-09-14, Jefferson-Photography-Studio.**

A camera-rendered infrared JPEG can arrive with all its colour in one band. Three
days earlier a session had found that applying a false-colour look to such a file
produced a harsh rendering — gray-world balance manufactures the missing band by
crushing red sixfold — and made skipping the balance the rule. The evidence was
**one photograph**: crushed shadows falling from 13% to 3%, with fifteen
two-band frames confirmed unaffected.

The reporter then opened six such files and said the result did not work.

**Two things were wrong, and only one of them was a bug.** The explanation for
the skipped balance appeared on a first visit to each photo and vanished on every
return (§303's shape: state cached from an event that only fires once). That was
a defect and was fixed. **The other was not a defect at all — it was a decision,
and it had been taken by a session on the reader's behalf.**

**The arithmetic nobody redid.** Measured on a second one-band frame after the
control was built: unbalanced rgb(66,107,178), balanced rgb(131,99,93) — an
entirely different picture — and **0.0% crushed either way.** The 13% that
justified the policy was one photograph's number. A rendering that costs nothing
in shadows on this frame was being withheld because it cost something on
another.

**One specimen cannot tell a defect from a distribution.** Fifteen controls in
the *unaffected* group did not help, because they were controls for the wrong
question: they established that two-band files were untouched, not that one-band
files all behave like the one that was measured.

**And the shape of the remedy matters as much as the remedy.** The fix was not
to flip the policy back — that would be the same error with the opposite sign,
and this session's taste substituted for the last one's. It was to make it a
control with a default and let the person whose photographs they are decide per
frame. The standing rule that every automatic lands on a visible, undoable
slider already said this; it had been applied to the automatics and not to the
exceptions.

**The question that opened it — "didn't they used to work?" — was answerable in
one command** (`git log -S` on the constant) and not from memory. The answer was
yes, it changed, here is the commit and the date and the evidence it was made
on. A report that contradicts a recent deliberate change is the most valuable
kind there is, because it is the only way the sample size of one gets found.
