## 100 · A check whose passing branch is "the feature is absent" measures nothing, and it is the shape you reach for by reflex

**Enforced by:** CHECKLIST no-vacuous-pass — an assertion about a conditional surface must DRIVE the condition and fail when it cannot. `if (thing) { assert } else { pass('correctly absent') }` is not a check; the else branch must be `fail`, or the state must be created before the assertion runs.

Written the same hour it happened, in a repo that already had the concept.

A release added one line to a surface — the next fixed appointment, on the
screen somebody deep in a task is actually looking at. The walk asserting it was
written like this:

    if (horizon.onWork) {
      ...assert it matches, assert it has no countdown...
    } else {
      pass('nothing fixed is ahead in this store, so the line is correctly absent')
    }

It ran green in both themes, twice, through a full release. **Both runs took the
else branch.** The store the walk builds has nothing dated today, so the line the
release existed for was never rendered and never measured once — and the gate
reported it as a pass, in words that sound like diligence.

**The sentence in the else branch is what makes it dangerous.** "Correctly
absent" is a true statement about a store with nothing in it. It reads as a
considered edge case. It is a receipt for work nobody did.

**This repo already knew.** Its membership gate carries explicit vacuity guards —
*"expected a waiting-for in the big sample and found none — the check is vacuous
for that kind"* — and fails rather than passing when the case it needs is
missing. That guard existed, in a file the same author had read that day, and the
new assertion still shipped with a pass-if-absent branch. **Knowing the failure
mode does not stop you writing it**, because "handle the case where it is not
there" feels like defensive care rather than like an escape hatch.

**The fix is two-part and both halves matter:**

- **Drive the condition.** Put the app into the state the feature needs, through
  the real write path. Here: set a date of today through the sheet — day-granular
  clocks are stored at the END of the chosen day, so today is genuinely still
  ahead while the walk runs.
- **Make the else branch FAIL.** Once the state is driven, reaching the else
  branch means the drive broke, and that is a finding, not an edge case.

**The tell when reviewing your own assertion:** ask what the gate would report if
the feature were deleted entirely. If the answer is "green", it is not a check —
whatever its output says.
