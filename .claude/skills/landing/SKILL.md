---
name: landing
description: How a worker in the hub checks, commits and pushes finished work to main.
---

This is for a worker in the hub repository at /home/user/noahjefferson. Write every path in full and never change directory.

1. Fetch and rebase onto the remote's main, with these two commands:
   - git -C /home/user/noahjefferson fetch origin main
   - git -C /home/user/noahjefferson rebase origin/main
2. Stage every changed and new file by name, because the checks read tracked files. Then run the hub's seven checks, as the hub's own landing command spells them, each as its own command in the foreground:
   - node /home/user/noahjefferson/docs-check.mjs /home/user/noahjefferson
   - node /home/user/noahjefferson/lessons-check.mjs
   - node /home/user/noahjefferson/quote-check.mjs --repo /home/user/noahjefferson
   - node /home/user/noahjefferson/privacy-check.mjs --repo /home/user/noahjefferson
   - node /home/user/noahjefferson/third-person-check.mjs --repo /home/user/noahjefferson
   - node /home/user/noahjefferson/example-check.mjs --repo /home/user/noahjefferson
   - node /home/user/noahjefferson/pin-check.mjs --repo /home/user/noahjefferson
   - node /home/user/noahjefferson/rules-keep-check.mjs --repo /home/user/noahjefferson
3. Where code changed, run the suite as well. The suite is the cases and every planted failure, as two commands in the foreground, `node /home/user/noahjefferson/session-guards.test.mjs` and then `node /home/user/noahjefferson/session-guards.test.mjs --plants`. A change to a guard file, one the suite's own list of files names, runs both before a push.
4. Commit with plain one-line messages that a reader of the history understands, with no trailer, no chat link and no model name.
5. Ask for the checker. The push waits until the checker has passed the exact commit.
6. Immediately before the push, read the remote's head. If it has moved since the fetch of step 1, do not push: fetch, rebase and ask for the checker again, because a pass is for an exact commit. Then push main once, never forced, never with a flag that skips a hook, as one foreground command with a five-minute limit. If it ends with no receipt, read the remote's head before anything else, and push again only if the head did not move.
7. Read the remote's head. A push is not a release, and a green row for an earlier commit is not a run for this one. Every workflow run for that commit, the gates, the deploy, the accessibility gate and the code scan, is read by name and reported as concluded, with its conclusion, or as still running. A worker reads once and does not wait. The session that manages reads the runs through its connector, and reads the ones still running again at its next turn.
