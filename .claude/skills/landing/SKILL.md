---
name: landing
description: How a worker in the hub checks, commits and pushes finished work to main.
---

This is for a worker in the hub repository at /home/user/noahjefferson. Write every path in full and never change directory.

1. Fetch and rebase onto the remote's main, with these two commands:
   - git -C /home/user/noahjefferson fetch origin main
   - git -C /home/user/noahjefferson rebase origin/main
2. Run the hub's seven checks, as the hub's own landing command spells them, each as its own command in the foreground:
   - node /home/user/noahjefferson/docs-check.mjs /home/user/noahjefferson
   - node /home/user/noahjefferson/lessons-check.mjs
   - node /home/user/noahjefferson/quote-check.mjs --repo /home/user/noahjefferson
   - node /home/user/noahjefferson/privacy-check.mjs --repo /home/user/noahjefferson
   - node /home/user/noahjefferson/third-person-check.mjs --repo /home/user/noahjefferson
   - node /home/user/noahjefferson/example-check.mjs --repo /home/user/noahjefferson
   - node /home/user/noahjefferson/pin-check.mjs --repo /home/user/noahjefferson
3. Where code changed, run the suite as well.
4. Commit with plain one-line messages that a reader of the history understands, with no trailer, no chat link and no model name.
5. Ask for the checker. The push waits until the checker has passed the exact commit.
6. Push main once, never forced, never with a flag that skips a hook.
7. Read the remote's head, and read the gates run for that commit. A push is not a release, and a green row for an earlier commit is not a run for this one.
