## 464 · Twenty-three reviews wrote one report file and only the last survived, because the file was keyed by the step number alone

**Enforced by:** GATE hub:session-guards.test.mjs — a latched agent may write `step-N-review-K.txt` directly in `progress/` of the scratchpad for the step its prompt names, and another step's, a name with no number and every other file stay refused; one plant (the pattern of the name) turns the case red

**Recorded 2026-11-02.** Measured on 1 November: the first plan of the day sent twenty-three reviews of one Standing step, all writing `progress/step-9-report.txt`, and only the last record survives; a review's reasoning can now be read only from its transcript. The queue held this as Q-HUB-121, and lesson 455 avoided the collision for plans by numbering a plan's steps from a new number.

**What is done now.** The agent rules (version 4) tell the Standing review step to write its record to `progress/step-N-review-K.txt`, K one more than the number of such files already there (found with Glob), so a later review never writes over an earlier one. `agentReportWrite` in `hook-dispatch.mjs` lets a latched agent write that name for its own step. The report file of a step that is re-sent is still `step-N-report.txt`, because a re-sent agent reads it first and resumes from it.

**What it leaves.** A step that is sent twice still writes one report file. That is deliberate: the second send continues the first.

**The general form.** A name that two uses can share is a name that one of them will lose.
