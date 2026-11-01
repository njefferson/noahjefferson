## 445 · A Files section with no code span named nothing, and the plan gate read it as a plan

**Enforced by:** GATE hub:hook-dispatch.mjs — `filesSpanProblem`: a plan with Steps whose Files section holds no whitespace-free code span, or has no Files section, is refused at `ExitPlanMode` and by `--check`; the refusal sets no latch
**Enforced by:** GATE hub:session-guards.test.mjs — the plan-gate Commands and Files case: a Files section of prose only is refused, one with a span passes, a plan with no Steps is not asked; plants take out the wiring, the span test and the Steps test

**Recorded 2026-11-01.** Measured on 31 October. The fence reads Files by its code spans, and the dispatcher's name check finds a file name in a plan only in a span. A Files section written as prose names nothing to either, and the plan gate had a comment saying so, "Prose names nothing", and no refusal. A plan with Steps and a Files section of prose left every agent of it with no file it could write, and the approval gave no sign of it.

**What is done now.** A refusal for a plan with Steps whose Files holds no span. The fixtures the other plan cases build now carry Files and Commands, and the case that sends from a steps file uses a repository holding a file by the name the Files section gives, because the name check has to find it.

**The general form.** When the reader of a section looks for one shape, the section is checked for that shape before the reader is asked to find it. The comment that says "this names nothing" is the place the refusal was owed.
