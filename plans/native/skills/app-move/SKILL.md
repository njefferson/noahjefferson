---
name: app-move
description: How an app's session moves that app to the hub's new way, once: the setup script on its environment, a short instruction file, and its checks pointed at the installed hub.
---

This is for a session in one app's repository, started with that app alone. It is done once for an app. It was approved in the hub on 12 November 2026 as part of the record plans/app-sessions.md, and being asked to move the app starts it. Read the short page first, at /root/.claude/hub/plans/native/page.md. If that file is absent, the hub is not installed in this container: clone https://github.com/njefferson/noahjefferson.git to /root/.claude/hub, read the page there, and carry on.

The result
- This repository's CLAUDE.md holds this app's own facts and one line naming the short page, and no longer describes the gates retired on 12 November 2026. The hub's own CLAUDE.md is the model: what the repository is, its branches and its release route, what its own hooks run, and where things are.
- This session's environment carries the setup script below, so a new container has the hub's hooks before its session starts.
- Every one of this repository's own hooks and checks runs with the app alone in the container. One that looks for the hub beside the app looks at /root/.claude/hub.

How it is checked
- A checker that did none of the work opens the exact commit before the push. It reads the new CLAUDE.md against the old one, and confirms that every fact about this app that still holds is kept and that no rule of the short page is restated. It runs the checks this repository names before a commit, with the app alone, and reads their results.
- The environment is read back after the approval card and shows the script.

The steps
1. Check how this session was started. The launch folder is this app's repository and nothing sits beside it. If the hub's repository sits beside it, say so and stop: started that way, the app's own roles and settings do not load.
2. Read this session's environment and propose the setup script: the three lines below when it has none, or its own script with the three lines added at the end when it has one. Calling the tool is the request, and one approval card is shown.
3. A worker shortens CLAUDE.md and repoints any hook or check that looks for the hub beside the app.
4. A worker lands on the work branch by the landing procedure at /root/.claude/hub/plans/native/skills/landing/SKILL.md, after the checker's pass. No promotion to the production branch is part of this.
5. If a write under the configuration folder was needed, say when the last one is done, so the mode can be changed back.

The setup script
```
mkdir -p /root/.claude || true
[ -f /root/.claude/hub/hook-dispatch.mjs ] || git clone --quiet https://github.com/njefferson/noahjefferson.git /root/.claude/hub || true
[ -f /root/.claude/hub/hook-dispatch.mjs ] && node /root/.claude/hub/hook-dispatch.mjs --install || true
```

The cost
Two agents, a worker and a checker, on the cheapest tier that holds the rules, and about twenty minutes.

The way back
The commit is reverted on the work branch. The script is removed by the same card.

Where it can fail
- The card does not appear or is declined: say so plainly and change nothing in the environment. The second route is this repository's own start hook, which clones the hub to /root/.claude/hub when it is absent and runs the install from that clone, as the hub's .claude/hooks/session-start.sh does. That write is under the configuration folder, so the harness asks for it.
- A hook or the harness refuses a step: stop that route, report the refusal word for word, and try no other way to the same end.
