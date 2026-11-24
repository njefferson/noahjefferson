Q-HUB-610: Seen on 23 November 2026: pages of that day gave a command of the day that sets a variable before a program and has a worker read the clock, where the agent rules say that no command carries a variable assignment in front of it and that no agent reads a clock. Two workers named it, and one typed it in another form.

Fix in: `plans/native/skills/piece-of-work/SKILL.md`, `.claude/skills/piece-of-work/SKILL.md`. The procedure says that a block carries the day its page was drawn, and that no step reads a clock.
