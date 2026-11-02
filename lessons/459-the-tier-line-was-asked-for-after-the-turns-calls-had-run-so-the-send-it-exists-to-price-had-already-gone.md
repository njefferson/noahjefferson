## 459 · The tier line was asked for after the turn's calls had run, so the send it exists to price had already gone

**Enforced by:** GATE hub:session-guards.test.mjs — while an approved plan is in force and the top tier serves the main thread, an agent is refused until a text of the main thread written since the model changed opens with a line naming the tier and saying whether the work needs it; the refusal gives the words and sets no latch; a lesser tier, no plan, a subagent, a tool that sends no agent and a line said before the model changed to another and back are judged as they should be; eight plants each turn the case red

**Recorded 2026-11-02.** Measured on 1 November at 16:22 California time and again at 20:11: after the plan was approved and a worker restarted, the top tier sent a review and was then refused by the stop guard for not naming the tier, and the model was changed by hand a minute later. Lesson 434 put the line in a Stop hook, which can only judge a reply after the turn's tool calls have run.

**What was wrong.** The decision the line exists to inform, whether the work should be on the top tier at all, is made at the first agent sent, and the check came after it.

**What is done now.** `tierGate` in `hook-dispatch.mjs` refuses a main-thread Agent, Task, SendMessage or Workflow call, with no latch, while the serving model (`servingModel`, the newest main-thread reply's own model field) is a top-tier id, a plan is in force, and no main-thread text since the run of that model began has a first line that names the tier (the model's id, the top-tier words, or the phrase) and carries a word saying whether the work needs it. A transcript with no readable model is never read as a lesser tier. The stop guard's check stays, for the reply that sends nothing.

**The general form.** A rule about a decision is enforced before the decision, not in the report of it.
