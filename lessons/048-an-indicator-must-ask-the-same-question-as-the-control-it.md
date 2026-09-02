## 48 · An indicator must ask the same question as the control it describes

**Enforced by:** GATE fauxplane:scripts/plant.mjs — the plant that freezes the readiness indicator; and GATE fauxplane:scripts/a11y-gate.mjs, which asserts the indicator claims tappable at the moment a tap is about to succeed.

Asked for a readiness indicator on fauxplane's radar — — the obvious build is a chip that inspects the aircraft list and decides
what to say. The tap handler already had its own precondition. That is **two
opinions about one fact**, and they drift into an indicator reading CONTACT over
a scope that ignores taps — worse than no indicator, because the reader then
concludes the fault is theirs.

So one pure function returns both the words and `tappable`, and the tap handler
asks IT.

**It drifted anyway, inside that very function, while it was being written.** The
healthy branch returned `tappable: true` as a literal instead of the computed
value — so a swept scope with no centre yet would have advertised a tap that
returns immediately. A unit test caught it. §42 had been written down the day
before.

**The general shape: deriving two outputs from one function is not enough — the
function has to actually use its own computation on every branch.** A literal on
one path is the same defect the structure was built to prevent, now hidden
inside the thing that was supposed to prevent it. Grep your own branches for
constants where a computed name belongs.

**A second, cheaper lesson from the same change.** The first plant for this
deleted the guard from the tap handler and the gate stayed GREEN — correctly, because
in the driven scenario the tap succeeded either way, so removing a guard that
was blocking nothing changed nothing observable. **A plant has to break
something the check can SEE**; "the code is different now" is not the test.

*(fauxplane 1.22.0, 2026-08-04.)*

---
