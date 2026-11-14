---
name: landing
description: How a worker in any repository checks, commits and pushes finished work to its work branch.
---

This is for a worker in the repository it is told about. Write every path in full and never change directory. The repository's entry in /root/.claude/hub/REPOS.md gives its work branch, its production branch and its promote route. In the hub the work branch is main, so the work branch and the production branch are one.

1. Stage every changed and new file by name, then commit on the work branch with a plain one-line message that a reader of the history understands, with no trailer, no chat link and no model name. A new file is staged before the first check runs, because the checks read tracked files.
2. Run the checks the repository's own CLAUDE.md names, each as its own command in the foreground. Where code changed, run the repository's suite as well. In the hub the suite is the cases and every planted failure, `node session-guards.test.mjs` and then `node session-guards.test.mjs --plants`, and a change to a guard file, one the suite's own list of files names, runs both before a push.
3. Ask for the checker. The push waits until the checker has passed the exact commit.
4. Immediately before the push, read the remote's head. If it has moved since the work was begun, do not push: fetch, rebase and ask for the checker again, because a pass is for an exact commit. Then push the work branch once, never forced, never with a flag that skips a hook, as one foreground command with a five-minute limit. If it ends with no receipt, read the remote's head before anything else, and push again only if the head did not move.
5. Read the remote's head. A push is not a release, and a green row for an earlier commit is not a run for this one. Every workflow run for that exact commit is read by name and reported as concluded, with its conclusion, or as still running. A worker reads once and does not wait. The session that manages reads the runs through its connector, and reads the ones still running again at its next turn.
6. A promotion to the production branch is made only where the approved page says so, by the repository's own promote route named in /root/.claude/hub/REPOS.md, and it waits for a checker's pass of the exact commit as well.
7. In the hub, the rules check runs with the other checks: node /root/.claude/hub/rules-keep-check.mjs with the repository's path after --repo. A line that leaves a rules page is listed in plans/rules-released.md with why.
