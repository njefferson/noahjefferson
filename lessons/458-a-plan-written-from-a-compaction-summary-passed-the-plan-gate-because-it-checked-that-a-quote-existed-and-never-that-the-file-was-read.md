## 458 · A plan written from a compaction summary passed the plan gate, because it checked that a quote existed and never that the file was read; and no plan priced its run

**Enforced by:** GATE hub:session-guards.test.mjs — after a compaction a plan whose "What is" names a file is refused unless a Read of it, or a Grep of it or of a folder holding it, came back without an error after the newest compaction, and passes with no compaction, no steps or a read after it; a plan with steps and no "Cost" section stating the pushes, the sends and the tier is refused with a fault of the plan's shape that sets no latch; thirteen plants each turn the case red

**Recorded 2026-11-02.** Measured on 1 November at 11:15 California time, right after a compaction: a plan was written from the summary without the sweep's code or the gate's code being read, every check of the plan guard passed it, and the top tier was switched on for the plan to be redone. Earlier, on 31 October, a first plan had a push, a remote read and a pull of the clone in each of eleven steps, which nothing asked to be priced.

**What was wrong.** `whatIsProblem` proves that a quoted line is present in a file the plan names; it cannot know whether the session has opened that file since its context was replaced by a summary. Nothing asked a plan what it costs, and the cloud environment's git hook turns each unpushed commit into a turn of the main thread.

**What is done now.** `readAfterCompactionProblem` asks, of the files the "What is" bullets name and no others (the manager fence refuses the main thread a read of a hub source file, so a check over every file of Files would refuse every hub plan), for a successful Read or Grep after the newest `compact_boundary`. `costProblem` asks a plan with steps for a "Cost" section that has a number or none beside the word push, an agent, send or review, and a tier. The permissions allow list is not edited by a plan in a session the auto-mode classifier judges: it refuses that edit whatever the plan says (lesson 370).

**What it cannot judge.** That the file was understood, or that the cost stated is the cost. It forces the read and the statement.

**The general form.** A check that a fact is present is not a check that anyone has seen it.
