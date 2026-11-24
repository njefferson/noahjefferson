Q-HUB-595: Seen on 23 November 2026: the run script of the hub is one loop that waits for each step, and the procedure says that steps which touch different files run together. So every run since 20 November went one step after another, and a run of ten agents on 23 November took 79 minutes.

Fix in: `plans/native/run-page.js`, `plans/native/skills/piece-of-work/SKILL.md`, `.claude/skills/piece-of-work/SKILL.md`. The script sends together the steps that a page marks as sharing no file, and one worker stages and commits after them.
