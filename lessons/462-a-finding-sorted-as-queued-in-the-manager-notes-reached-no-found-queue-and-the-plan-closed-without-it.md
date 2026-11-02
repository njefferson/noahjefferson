## 462 · A finding sorted as queued in the manager notes reached no Found queue, and the plan closed without it

**Enforced by:** GATE hub:session-guards.test.mjs — when the pointer reads next none, a stop is refused for a Found line of a step of the plan that the manager notes sort as queued with a note naming no key of the Found queue of a repository the plan's Files names, or a key that queue does not hold; a note naming a key it holds, a line sorted as fixed, an unsorted line, a line of a step outside the plan and a declared stop with what is open let it end; six plants each turn the case red

**Recorded 2026-11-02.** Measured on 1 November at 16:35 California time: the pause defect of lesson 457 was recorded as a queued Found line in the scratchpad's manager notes, with three others, and none of them reached the `## Found queue` of the hub's NOTES.md, which is the only record the next plan must answer. A defect that came back four times would have left the session with no record.

**What was wrong.** The doctrine says a finding is recorded for the next plan; the gate checks that a plan answers what the queue holds, and nothing checked that what the manager sorted as queued was in the queue.

**What is done now.** `stop-guard.mjs` reads the Found lines of the plan's own steps since its approval (`foundLines`, `markerApprovalTime`), only those of the steps in its Order and Standing lines, so an earlier plan's lines in the notes do not hold the close, and refuses the closing stop for a line sorted queued whose note holds no `Q-TAG-N` key present in the queue of a repository the plan's Files names. The refusal sets no latch, and a declared stop with what is open passes, so a finding no agent can record never traps the session.

**What it cannot judge.** That the queued line says what the finding was.

**The general form.** A record kept in two places is read from the one the next reader uses.
