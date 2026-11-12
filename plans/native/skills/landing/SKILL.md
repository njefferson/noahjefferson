---
name: landing
description: How a worker in any repository checks, commits and pushes finished work to its work branch.
---

This is for a worker in the repository it is told about. Write every path in full and never change directory. The repository's entry in /root/.claude/hub/REPOS.md gives its work branch, its production branch and its promote route. In the hub the work branch is main, so the work branch and the production branch are one.

1. Commit on the work branch with a plain one-line message that a reader of the history understands, with no trailer, no chat link and no model name.
2. Run the checks the repository's own CLAUDE.md names, each as its own command in the foreground. Where code changed, run the repository's suite as well.
3. Ask for the checker. The push waits until the checker has passed the exact commit.
4. Push the work branch once, never forced, never with a flag that skips a hook.
5. Read the remote's head, and read the CI run for that exact commit. A push is not a release, and a green row for an earlier commit is not a run for this one.
6. A promotion to the production branch is made only where the approved page says so, by the repository's own promote route named in /root/.claude/hub/REPOS.md, and it waits for a checker's pass of the exact commit as well.
