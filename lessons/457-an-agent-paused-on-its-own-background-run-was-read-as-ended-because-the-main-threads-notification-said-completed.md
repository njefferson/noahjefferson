## 457 · An agent paused on its own background run was read as ended, because the main thread's notification said completed

**Enforced by:** GATE hub:session-guards.test.mjs — an agent with no hand-back whose own transcript launched a background run that has not completed reads as still running though the notification says completed, and the running agents list it; once the run's completion is in its transcript, or the session restarted after its last entry, it reads as ended; three plants (the pause, the restart, the completion) each turn the case red

**Recorded 2026-11-02.** Measured four times on 1 November: a step told its agent to start a long run in the background and end its turn, the harness told the main thread the agent's turn had completed, and every reader took that for the agent's end. The status counted an end, the status gate refused the main thread's next calls, the judgement gate asked for a line for something that was not an end, the stop guard refused a stop with no agent running and steps left, and once a review was sent only to clear a step that was still running.

**What was wrong.** `agentEnd` in `report.mjs` returned an end whenever the notification said completed. An agent paused on its own run has completed a turn and not its work: the run's completion resumes it. The lost-task lessons cover a task that will never complete, not an agent that will resume.

**What is done now.** `agentEnd` returns null for an agent with no hand-back whose own transcript holds a background launch with no completion, stop or kill of that task after it (`runningTasks` run over the agent's own entries), unless the session restarted after its last entry, which ended the run with it. Every reader goes through `agentEnd`, so the status, the pointer, the judgement gate and the stop guard agree.

**The general form.** A notification that a turn completed is not a statement that the work did. The state of an agent is read from its own transcript.
