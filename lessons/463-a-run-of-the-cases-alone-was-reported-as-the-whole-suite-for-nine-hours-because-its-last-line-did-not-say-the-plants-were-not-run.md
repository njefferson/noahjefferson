## 463 · A run of the cases alone was reported as the whole suite for nine hours, because its last line did not say the plants were not run

**Enforced by:** GATE hub:session-guards.test.mjs — a run of the cases ends with a line saying the plants were not run and how many there are, and a run of plants narrowed to some guard files ends with a line giving the count it ran beside the total; two plants (the line of the cases, the line of the plants) each turn the case red

**Recorded 2026-11-02.** Measured on 1 November: a step ran the suite with no flag, which runs the cases and no plants, its report said so in a Found line, and the plan's closing still spoke of a full run. The plants were first run over that change about nine hours later, where the single process ran out of heap near the end and was redone by guard file.

**What is done now.** The cases run ends with `PLANTS NOT RUN: this run ran the cases only; the N plants run with --plants, by guard file (--files=a.mjs), and the full suite is the cases and every plant.` The plants run ends with `PLANTS RUN: M of N`, naming the guard files of a narrowed run and saying to add the counts of the by-file runs against the total.

**What is not done.** The plants runner still grows in memory with each plant, because each imports fresh copies of the guards; bounding it is a change to how the runner loads modules and is not small, so the runs by guard file stay the way until it is done (Q-HUB-84).

**The general form.** A green line from a half of an instrument has to say which half.
