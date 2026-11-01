## 440 · A task lost in a container restart held the stop guard for good, because the lister of running tasks ended a task only on a notification or a stop line

**Enforced by:** GATE hub:report.mjs — `runningTasks`: a task whose `TaskStop` result says no task was found is ended, and every task launched before the newest `SessionStart` of source startup or resume is ended, while a compaction ends nothing; `stop-guard.mjs` reads the same function and so refuses a stop only for a task that can still be running
**Enforced by:** GATE hub:session-guards.test.mjs — the tasks cases: a not-found stop result passes the stop, a task launched before a restart passes, a task launched after the newest start with no stop result still refuses; plants take out the not-found read, the restart read and the source test

**Recorded 2026-11-01.** Measured on 31 October. The lister counted a task as ended by a task notification's status or by a "Successfully stopped task" line, and by nothing else. A container restart ends every process, so a background task launched before one never sends either, and `TaskStop` on its id answers that no task was found. The task stayed in the list as running, `stop-guard.mjs` refused every stop because of it, and the only way out was for the session to talk around a refusal about work that no longer existed.

**What is done now.** The lister ends a task on a not-found answer to a stop of its id, and ends every task launched before the newest start whose source is startup or resume. A compaction is a start too, but it keeps the container, so the source test is what tells the two apart, as `doctrine-read-guard.mjs` already does.

**What the change cannot see.** The harness's exact words for a stop of a lost task were not observed in a transcript when this was written; the lister matches "No task found" without regard to case, with or without an id. If the words differ, the restart rule still ends the task.

**The general form.** A list of live things that only shrinks on a message from the thing itself never shrinks when the thing is gone. The record needs a second way out, and it is the event that kills every member at once.
