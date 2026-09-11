## 272 · Two plants in one run: the first failure aborts the walk and the second reports as passing

**Enforced by:** CHECKLIST one-plant-per-run — a negative control restores ONE
defect. A run carrying two proves the first and says nothing whatever about the
second, however loudly it prints. · JUDGEMENT — when a plant produces fewer
failures than defects planted, the missing ones were not measured; they were not
reached.

**Smell:** a plant that restores "the whole change". A run whose failure count is
lower than the number of defects put back. Any long sequential walk where an
early assertion's failure leaves later code reading a locator that no longer
matches — the throw ends the run, and everything after it is silently unrun.

**Quietkeep 3.23.29, 2026-09-11.** Two fixes landed together: one made a coverage
sheet stop reading the app's own bookkeeping clock as a date the reader had set,
the other made a hand-set *they owe me this* relation admit a node to the list of
what is with other people. Both had new browser assertions. To verify both at
once, both fixes were reverted and the four-minute walk run.

**It reported two failures, and the coverage assertions were not among them.**
The people assertion fails at roughly the two-thirds mark, and the code two lines
below it reads `.locator(…).textContent()` on a row that now does not exist —
which throws, and the walk ends. The coverage block never ran. Its checks were
not printed as skipped; they were not printed at all, and the eye reads a missing
failure as a pass.

**Planted separately, the coverage group produced three failures**, the clearest
of them pure arithmetic: *12 claimed, 11 rows naming a day*. The sheet counted one
more thing as dated than it had rows able to name a date — the entire defect in
one comparison, and it would have been believed absent.

**The shape, and why it is not merely §266.** That entry is about a control that
RUNS and passes anyway — a threshold, a guard clause, a sampling rate answering a
different question. This is a control that never runs, inside a run that
concludes. Both end at "the assertion did not fail", and only one of them is
about the assertion. A plant is a measurement, and a measurement needs to reach
the instrument.

**And it costs nothing to get right.** Two runs of the same walk is eight minutes
against four. The saving is imaginary the moment either plant is the one you
needed.
