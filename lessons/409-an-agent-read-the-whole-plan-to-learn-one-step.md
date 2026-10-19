## 409 · An agent read the whole plan to learn one step, so approval and every amendment write a steps file holding the plan's Rules, Steps and Commands, and an agent may be sent that file

**Enforced by:** GATE hub:session-guards.test.mjs — the case for the steps file (approval through the tool, the owner's exit from plan mode in the app and an amendment each write the file beside the plan and hold only its Rules, Steps and Commands sections; the dispatch gate accepts a prompt naming it while it is exactly what the plan in force gives, refuses it when it is missing or stale, and the plan guard never takes it for the newest plan), with plants that take out each write, the section pattern, the prompt, the check and the exclusion

**Recorded 2026-10-19.** An agent is sent a plan path and a step number and read the whole plan to find its step, hundreds of lines of goals, findings, branches and files that the step does not use. The cost is paid at every send of every step.

**What is done now.** `approved-plan-guard.mjs` writes `<plan>.steps.md` beside the plan wherever the marker names a plan or moves its hash (`writeStepsFile`: approval, the owner's exit in the app, an amendment), from `stepsFileText` in `report.mjs`, which returns every section whose heading opens `## Rules`, `## Steps` or `## Commands` and nothing else. The file is a pure function of the plan's text. `sentStep` in `hook-dispatch.mjs` accepts a prompt naming that file in the plan's place, and `stepsFileProblem` refuses the send when the file on disk is not exactly what `stepsFileText` gives for the plan in force, or cannot be read, so an agent is never sent a copy that has drifted. `plan-guard.mjs` leaves `.steps.md` out when it looks for the newest plan.

**What the check cannot see.** That an agent reads only the steps file and not the plan; the plan fence still lets it read the plan, because the plan names the rules (lesson 410). The saving is available and not enforced.

**The general form.** What an agent is sent is the smallest text that holds its work, derived from the plan by a function and checked against the plan on every send, never a second copy written by hand.
