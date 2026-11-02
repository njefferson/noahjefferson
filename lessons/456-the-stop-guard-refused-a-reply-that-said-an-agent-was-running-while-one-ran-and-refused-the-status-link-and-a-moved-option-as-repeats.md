## 456 · The stop guard refused a reply that said an agent was running while one ran, and refused the status link and a moved option as repeats

**Enforced by:** GATE hub:session-guards.test.mjs — a reply saying a step is still running passes while an agent of the session is running and is refused as not finished when none is; a follow-up repeating only a line that carries the status page's link is no repeat, nor is the numbered option that a refusal of a choice not first asked to be moved, while a repeated ordinary sentence and an option line after any other refusal still are; five plants (the agent exemption, the link line, the option line, the refusal's kind, the kind the choice refusal records) each turn the case red

**Recorded 2026-11-02.** Measured over the session of 31 October and 1 November: eight refusals for a reply that said the work was not finished, and in five of them an agent of the session was running at that moment. Three more refused a follow-up for repeating a line of the refused reply: once the choice itself, which the refusal a few seconds before had asked to be moved to the top, and twice the status page's link, which the doctrine puts in every progress reply. The first of those left the choice buried under the report, and a message had to be typed to ask what was being asked.

**What was wrong.** The steps-left check in `stop-guard.mjs` already read the running agents, and the waiting check beneath it did not, though the doctrine says a running agent does not hold the turn and its completion brings the session back. The repeat check treated every line alike, so it refused the two lines that another rule requires to be written again. Two halves of one guard, written at different times, were never planted against each other.

**What is done now.** The waiting refusal is skipped while `stepsReturned` lists a running agent. The refusal record carries its kind, a refusal of a choice not first records `choice`, and the repeat check leaves out of the refused reply every line that carries an artifact link and, for that kind, every numbered option line.

**What the change leaves.** A reply that says it is waiting for the owner is still refused by the owing check, and a background task the session started still holds the stop. Only the report of an agent's state is passed.

**The general form.** When one rule requires a line and another refuses a repeated line, the second rule has to be told about the first, and a case has to run the two together.
