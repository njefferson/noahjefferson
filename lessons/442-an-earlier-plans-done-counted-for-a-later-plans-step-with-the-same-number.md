## 442 · An earlier plan's DONE counted for a later plan's step with the same number, because the reader of an agent's step kept the number and dropped the plan path

**Enforced by:** GATE hub:report.mjs — `agentPrompt` keeps the plan path from an agent's prompt beside the step number, and `stepEnds` keeps only agents whose prompt names the plan in force, by its path or by the steps file beside it, so the pointer, the review state, the stop guard's count and the status page never count another plan's end
**Enforced by:** GATE hub:session-guards.test.mjs — the plan-key cases: two plans in one session with the same step numbers, where a hand-back of the earlier plan's step one does not count for the later plan's step one; plants take out the key read and the filter

**Recorded 2026-11-01.** Queued as Q-HUB-8 in October and met again on 31 October. The function that read an agent's step took the number out of its prompt and nothing else. A session that runs plan after plan keeps every earlier agent in its transcript, and step 1 of the last plan has the same number as step 1 of this one. The effect seen was one-sided, as the queued line said: an earlier plan's agents made the review stale, and a stale review only refuses and never clears a step wrongly. The same read fed the pointer and the status page, so the plan's own count of ends was open to the same mix.

**What is done now.** The prompt reader returns the path with the number, `agentStep` delegates to it, and the list of ends drops an agent whose prompt names a plan other than the one the approval marker names or the steps file beside it.

**The general form.** A key that is unique inside one document is not unique in a record that holds many. When a reader takes a number out of text, it also takes the thing the number is a number of.
