Q-HUB-550: The landing procedure's first step fetches and rebases onto the remote's main before the files are staged and committed, and a rebase refuses a tree that holds uncommitted changes, so a worker that lands a piece of work finds the step cannot be done as written unless the remote's main has not moved.

Fix in: `.claude/skills/landing/SKILL.md`. The step gives no way to bring in the remote's main when the tree is dirty.
