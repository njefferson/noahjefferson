## 149 · A gate placed after an expensive optional step is a gate that stops running when that step breaks

**Enforced by:** CHECKLIST gate-order — in any workflow, the cheap gates that
must never be skipped go BEFORE anything that downloads, builds or drives a
browser. · JUDGEMENT reading a red run means reading which steps were SKIPPED,
not only which one failed.

MoleBridge's first full workflow ran, in order: type check, tests, build,
palette, install a browser, walk the app, the accessibility gate, and then the
doctrine gates — privacy, quotations, grids, npm hygiene, zizmor.

The build failed, because it renders icons by driving a browser and the browser
install sat after it. Every step after the failure was **skipped**, including
`privacy-check.mjs`, which Doctrine §9b calls a HARD gate in every repository.

**So the run was red for a reason that had nothing to do with privacy, and the
privacy gate did not run.** Nobody would have noticed: the log ends at the
failure, the summary names the failed step, and a skipped step looks exactly
like a step that was not needed.

**The general shape.** A gate's coverage is not what it checks — it is what it
checks TIMES the probability everything before it succeeded. Put it behind a
network download and its coverage is the download's reliability. Put it behind a
browser and its coverage is the browser's. The gates that must never be skipped
are usually the cheapest ones, so this costs nothing to get right and is
invisible when it is wrong.

**This is LESSONS 139's neighbour rather than its repeat.** That one is a run
that fails in the middle and keeps going, so the tail is green. This one is a
run that fails in the middle and stops, so everything after it is silently
uncovered. Same underlying question — *which of these steps actually executed* —
and the two answers look identical from the summary line.

**The rule.** Order a workflow cheapest-and-most-important first. And when
reading a red run, look at what was skipped: those steps did not pass, and on
the next green run they will pass for the first time.

