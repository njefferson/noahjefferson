## 443 · A plan whose review step had no command it could run passed the plan gate and stalled at its first review

**Enforced by:** GATE hub:hook-dispatch.mjs — `reviewCommandProblem`: a plan with an Order whose Standing review step names `aim-review.md` is refused at `ExitPlanMode` and by `--check` unless its Commands hold an entry the plan fence would match for `node` on a script under the scratchpad's temp folder, using the fence's own matcher; the refusal sets no latch
**Enforced by:** GATE hub:session-guards.test.mjs — the plan-gate Commands and Files case: a plan with a review step and no such entry is refused, a plan with one passes, a plan with no Order is not asked; plants take out the wiring in `plan-guard.mjs`, the match and the review-step test

**Recorded 2026-11-01.** Measured on 31 October. `aim-review.md` tells the review agent that the only command it runs is `node` on its script under the temp folder. The plan gate found the review step by the file name and never read Commands for it. A plan could name the review step and list no command that allows the one thing the review does, and the fence, which refuses what Commands does not list, then refused the review's only command. The plan was approved and its first review could not run.

**What is done now.** The gate asks the fence. It builds a probe `node` line on a script under the temp folder, or under the directory of an absolute entry that is already there, and asks the fence's own `beginsWithEntry` whether some entry matches. The refusal names the fault and the entry to add.

**The general form.** A gate that checks a plan's sections one at a time cannot see that two of them must agree. Where one section grants and another uses the grant, the check is the user's matcher run on the user's text, not a second matcher.
