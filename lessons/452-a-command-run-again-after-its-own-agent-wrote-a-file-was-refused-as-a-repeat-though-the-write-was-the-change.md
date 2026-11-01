## 452 · A command run again after its own agent wrote a file was refused as a repeat, though the write was the change

**Enforced by:** GATE hub:reply-guard.mjs — a Bash call whose text matches a failed call of the same agent is a repeat only when that agent's own transcript holds no Write, Edit, MultiEdit or NotebookEdit answered without an error after the failure; the transcript is the subagent's own file for an agent and the session's for the main thread, ordering is by position and never by a clock, and an unreadable transcript or a failure outside the tail leaves the repeat refused
**Enforced by:** GATE hub:session-guards.test.mjs — one case with six plants (the skip itself, the ordering, an errored write, the agent's own transcript, the set of write tools, Bash alone) seen red on each plant; the case also holds a re-run with no write between, a write before the failure, a read between, a failed write, another agent's write and a failed call of another tool all refused as before
**Enforced by:** GATE hub:agent-rules.md — the rule on failed commands now says a run after a write by the same agent is not a repeat, and the file's version moved from 2 to 3 as the last act of the plan that made the change

**Recorded 2026-11-01.** Found in an earlier plan's step 65 and in the review of step 63's route, and queued as Q-HUB-37. The reply guard keyed a Bash call by its command text alone. A check script that failed, was edited to fix the fault the error named, and was run again with the same words was refused as the call that failed unchanged, and the way past it, a recorded reading of the error, could not be made once the refusal had latched the agent. A step that fixed its script could not run it again.

**What is done now.** The guard asks the one thing the failure rule asks: did anything change. A write by the same agent between the failure and the call is the change, so the same text runs. Without a write, the repeat is refused exactly as before and the reading command still records the other case.

**What the change leaves.** A command whose inputs change by some other route, an edit made by a different agent or a file produced by another command, still counts as a repeat and takes the reading route. The guard cannot see those and does not guess at them.

**The general form.** A repeat is defined by what a call could learn, not by its text. A key built from the words alone refuses the fix and the failure alike.
