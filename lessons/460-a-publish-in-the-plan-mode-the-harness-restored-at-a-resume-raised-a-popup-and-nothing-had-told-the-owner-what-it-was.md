## 460 · A publish in the plan mode the harness restored at a resume raised a popup, and nothing had told the owner what it was

**Enforced by:** GATE hub:session-guards.test.mjs — while the harness's plan mode began at a resume or a compaction after the approval, an Artifact publish is refused with no latch until a text of the main thread written since that plan mode began says that the resume restored plan mode and that leaving it is the move; a text written before it, an Artifact read, another tool, a subagent and a plan mode the owner entered are not held; eight plants each turn the case red

**Recorded 2026-11-02.** Measured on 1 November between 05:43 and 05:48 California time: after a resume the harness put the session in plan mode, the first publish of the status page raised an approval popup, and four messages were typed about it before anything said what it was. The session then put a question instead of explaining, and was refused for that. Lesson 432 made every gate treat that plan mode as outside plan mode, and the harness still asks about each publish in it.

**What is done now.** `restartPublishGate` in `hook-dispatch.mjs` uses `restartedPlanMode`, the one reading of whether the plan mode is a restart's, and refuses the publish until the session has said so in words. The line that clears it names plan mode, a resume or a compaction, and leaving or exiting. The refusal sets no latch, and writing the line is what clears it.

**What it leaves.** The popup itself is the harness's; the owner still meets it once, knowing what it is.

**The general form.** A gate that stops a thing from being a surprise is worth more than one that stops the thing.
