## 368 · Reviewing until a round finds nothing does not converge on a change that each round's fixes make bigger

**Enforced by:** CHECKLIST settle-before-another-round — when a review round's fixes add a piece the approved plan did not name (a new control, a retry, a new state), stop reviewing and settle the design of the whole path in one pass: who owns each surface, what each failure does, what each wait says. Only then review again, and review the pass's own diff rather than the whole change. State the cost of each round before starting it.

**Smell:** each round's confirmed findings sit mostly in code the previous round added.

**Measured 2026-09-27 in Jefferson-Photography-Studio.** A plan item to stop
Keep waiting in silence named four small changes. It went through five review
rounds of six reviewers with a refuter per finding, about five million tokens
and seventy minutes a round. The rounds confirmed 10, 15, 21, 23 and 21
findings. From the third on, most were in pieces the earlier rounds had added:
a skip offer for stalled reads, a retry for writes refused for room, a way for
a look through a refused open. One of those was built in round one and removed
in round three. Round four's fix for a failed session clear went too wide and
was round five's worst finding. The diff grew to about 3,300 lines. The rounds
stopped at five on the owner's instruction about cost; the fifth's blocking
findings were fixed in one narrowed pass and it shipped.

**Why it happens.** A thorough review of a large change always finds something,
so "until a round finds nothing" has no cheap end. When the fixes add pieces,
each piece brings new interleavings with every other piece, and the next round
reviews those. The findings are real, which is what makes it feel like
progress: the cost per real defect rises every round while the count stays flat.

**The rule.** The first time a round's fix adds a piece the plan did not have,
the next step is a design pass, not a review round. After that, review only
what changed, with the few lenses the change touches.
