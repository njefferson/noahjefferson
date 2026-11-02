## 470 · Calls sent together after a TaskStop of an agent's run were all refused by the status gate, because the agent ended again

**Enforced by:** JUDGEMENT — after a TaskStop of a run an agent started, the status is given alone in its own message before any other call is made, because stopping the run ends the agent's turn and a status is then due

**Smell:** a message that carries a TaskStop and, beside it, edits, an agent send or a publish; six refused calls in one message with the status gate's text

**Recorded 2026-11-02.** Measured on 1 November at 06:06 California time. The main thread stopped a leftover background run of step 2's agent; that woke the agent, which ended again, and five calls sent in one message (a file count, two Edits, an Agent and an Artifact) were each refused by the status gate. The gate held as written, and the cost was six refused calls and a turn of the main thread's tier.

**The test.** A TaskStop of an agent's run is the last call of its message when anything else is waiting; the next message is the status, alone, and the held calls follow it.

**The general form.** An action that changes the state a gate reads has to be followed by the gate's answer before the next action is chosen.
