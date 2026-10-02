## 381 · Work running in the background is the work, and the session stays with it

**Enforced by:** GATE noahjefferson:stop-guard.mjs — refuses every stop while a task the session launched (a background command, a workflow) has no notification ending it and no TaskStop · GATE noahjefferson:report.mjs · JUDGEMENT

**Smell:** a turn ended under a declared stop while a workflow or background command the session started keeps running; a long gap between statuses with work in flight; the owner asking what the progress is.

**Recorded 2026-10-02.** The five-minute status rule was enforced only by `report.mjs`, which refuses a tool call once five minutes pass without a status. A session that ends its turn makes no tool call, so nothing refused it. The session ended turns with "Stopping here" while two review workflows, a look re-fit and a long render ran, and gave no status for ninety minutes, then for another thirty, until the owner asked. The rule's intent covered that time, since the work was running; the session read its idle turns as outside the work. The stop hook now reads the transcript for every task the session launched and refuses the stop while one has not ended, declared stop or not. Measured on the session that prompted it: thirty launched, three still running, and those three named exactly.
