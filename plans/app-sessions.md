# App sessions and the hub's install

This is the record of the project that followed the hub's rebuild, whose own record is plans/native-setup.md. It was approved on 12 November 2026.

## The approved page

### App sessions and the hub's install

Approving this starts the run. Nothing has been changed so far; the reads were made on 12 November 2026 between 12:08 and 13:17 California time.

### Why

The hub's rebuild closed with a list left for the next project (plans/native-setup.md, section G, last paragraph). A brand-new container gets the hub's hooks only when something installs them, and the step that used to do it is retired. The never page still names retired gates as what holds its rules. Each app's instruction file still describes the old way.

One item on that list is already done and is not in this plan: the two rules of 12 November are in the installed managing procedure (commit 4dda332).

### 1. The result

- **The never page.** `doctrine/never.md` names no retired gate as what holds a rule. Six passages are rewritten to say what holds each rule today: sections 0, 0d, 0f, 9b (two passages) and 11b. No rule's own words change.
- **The Hub environment's setup script.** A new container has the hub's hooks before its session starts. The script is three lines, and no line can fail, because a failing setup script stops a session from starting:

```
mkdir -p /root/.claude || true
[ -f /root/.claude/hub/hook-dispatch.mjs ] || git clone --quiet https://github.com/njefferson/noahjefferson.git /root/.claude/hub || true
[ -f /root/.claude/hub/hook-dispatch.mjs ] && node /root/.claude/hub/hook-dispatch.mjs --install || true
```

- **The record.** `plans/app-sessions.md` on main, holding this plan, what the run showed, and one block to paste at the start of each app's next session.
- **The block.** It has an app's session do five things:
  1. Confirm it was started with the app alone, and stop if the hub sits beside it.
  2. Put the same script on its own environment.
  3. Shorten its instruction file to the app's own facts and one line naming the short page, with the hub's own instruction file as the model.
  4. Point any of its own checks that look for the hub beside the app at `/root/.claude/hub`.
  5. Land on its work branch after a checker's pass.

### 2. How it is checked

- A checker that did none of the work opens the exact commit before the push.
  - It searches the never page for the name of every retired gate and finds none given as what holds a rule.
  - It reads each rewritten passage against the code that stands: `hook-dispatch.mjs`, `push-guard.mjs`, `branch-guard.mjs` and the privacy checks.
  - It confirms the diff changes no rule, and opens the record against this plan.
- The hub's seven checks pass, and the gates run for the pushed commit reads green.
- The environment is read back after the card and shows the script as written above.
- One new session is started in the Hub environment, its start lines are read, and it is archived. The proof is a start that prints the short-page line and no line saying the hub clone was absent.

### 3. The steps

1. Worker A puts the container's copy on main at the remote's head, writes the record with this plan and the block, and tries the script's three lines against a scratch folder and a scratch settings file.
2. Worker B, at the same time, rewrites the six passages of the never page.
3. The managing session proposes the script for the Hub environment, which shows one approval card. It reads the environment back and runs the new-session proof.
4. Worker A adds to the record what steps 1 to 3 showed.
5. One landing by the hub's landing procedure: commit, the seven checks, the checker's pass on the exact commit, one push of main, then the remote's head and the gates run are read.
6. The block is handed over in chat as one fenced block.

### 4. The cost

- Four agents in six sends, all on the sonnet tier, the tier the three acts of the rebuild ran on.
- By the third act's measure, about 11,000 output tokens and 400,000 cache-read tokens for each agent.
- About 45 minutes of run, not counting the wait on the card. One push of main.
- Nothing in the run needs the top tier.

### 5. The way back

- The commit is reverted on main through the same check.
- The script is removed by the same card route. Without it the hub's own start hook installs as it does today.
- The proof session is archived at the end of step 3.
- Nothing in any app is touched by this run.

### What only the owner does

- Approves this plan.
- Approves one card for the Hub environment's script.
- Later, for each of the nine apps: pastes the block at that app's next session, and approves that environment's card.

### Where it can fail, and what follows

- **The card does not show in the tablet app, or is declined.** Nothing changes and the hub is unaffected. The record says so, and the block names a second route for the apps: the app's own start hook clones and installs, as the hub's does. That write is under the app's configuration folder, so the harness asks for it.
- **The harness refuses to start the proof session.** The proof is read at the next hub session's start, and the record says not yet seen.
- **A hook or the harness refuses a worker's step.** That route stops, the refusal is reported word for word, and no other way to the same end is tried.
- **The scratch try changes the script's text.** The change is reported before the card is proposed, and the card shows the text as tried.

### Not known

- Whether any app's environment already has a setup script. Each app's session reads its own.
- Which environment Cv-Thalweg's sessions use, since none carries its name.

### Seen and left alone

- The installed managing procedure lacks the plain copy's line on the first look before a device build.
- `HUB-REFERENCE.md` gives three call forms that reach the hub at a path beside the app, at lines 278, 495 and 513.

## Where the work stands

Step 1 of the plan, first part. The container's copy was on a harness branch at the same commit as main. It was fetched from the remote, put on main, and fast-forwarded to the remote's head. The merge reported it was already up to date. The branch is main and the head is fc0d11041cef37c5a4eebf1a6e83f4e579ee25a7.

Step 1 of the plan, second part. The script's three lines were tried against a scratch folder, with a scratch settings file named by HOOK_DISPATCH_SETTINGS_FILE, and the script's text did not change. The real settings file under /root/.claude was the same before the first run and after the last, by modification time and checksum.

- Run A, a fresh folder: the three lines exited 0, 0 and 0. The clone was on disk afterwards, and the install wrote a settings file that wires SessionStart, UserPromptSubmit, PreToolUse, PostToolUse, PostToolUseFailure, Stop, PreModelSwitch, PostModelSwitch and ConfigChange.
- Run B, the same lines again in the same folder: the three lines exited 0, 0 and 0. No second clone was attempted, and the settings file held nine entries, one for each event, with no duplicate.
- Run C, a clone source that does not exist: the three lines exited 0, 0 and 0. The clone printed that the repository does not exist, no hub clone was on disk, the install line did not run, and no settings file was written.

No line ended non-zero in any of the three runs, which is what a setup script needs, because a failing one stops a session from starting. The scratch folder was deleted and a listing confirmed it was gone.

Step 2, on 12 November 2026. Six passages of doctrine/never.md were rewritten, in sections 0, 0d, 0f, 9b (two) and 11b, 25 lines in and 51 out, a figure that is the first commit's, ff227e8e377f8f2c46a140674b0f351b4d4f1b19. None of these names remains in the page: plan-fence.mjs, approved-plan-guard.mjs, report.mjs, the manager fence, tierGate, dispatchGate, PLAN-LOCK, the gate index, and the plan sections "Asked" and "Cost". The names plan-guard.mjs, plan-scope-check.mjs and stop-guard.mjs remain where the page says what each shell does today. The hub's seven checks each ended 0.

Two leads in section 9b changed, because each claimed what the code no longer does. Nothing refuses a commit line before git runs; the commit-message hook that branch-guard.mjs installs refuses a chat link, an attribution trailer or a model's name at the commit. The wiring status of the privacy step lives in each repository's entry in REPOS.md.

Step 3, on 12 November 2026 at about 18:10 California time. The setup script was proposed for the Hub environment and was not placed. The mobile app the request went to was a version that cannot show it, so the server answered; nothing was declined and nothing was changed. The environment still has no setup script. The request can be shown by a newer version of the app, or by a session opened at claude.ai on a computer. No proof session was started, since there was no script to prove. This is the first wall the approved page named.

What that leaves: the hub's own sessions are not held up, because the hub's start hook clones the hub and runs the install when the clone is absent. For an app's session the block's second route stands until the card can be shown.

Found in the run and left alone, each outside the approved page: branch-guard.mjs line 284 names the retired plan-fence.mjs in a comment; lessons 447 and 448 point at a gate index in the hub's instruction file, which has none; the lessons check passes and lists 26 citations of retired gates in LESSONS.md.

A checker that did none of the work failed the first commit on one fault and found the rest to hold. The rewrite of section 11b had dropped a duty: that a page which sends agents states its run in its cost part, and that one which holds its commits for one push at its end names the turns the environment's git hook will force.

The sentence was restored in a second commit, with the retired section's name replaced by the cost part of the page, and the two lesson numbers put back beside it.

The approved page's own cost part did not name those turns, and the run met one of them on 12 November 2026, when the environment's stop hook asked for a commit and a push while a worker was still writing.

The fix and the second check took the run to six agents, two more than the four the approved page named.

On 12 November 2026 at about 20:39 California time the setup script was proposed again, from another Claude app that could show the approval, and it was placed. The environment read back shows the three lines as the approved page wrote them.

The proof was run at once. One new session was started in the Hub environment with the hub's repository and one read-only question, on the sonnet tier, and it changed nothing.

The environment's own start log for that session shows the order: the repository cloned, the setup script run, and Claude Code started after it. The script's output was the dispatcher's line that it wired the nine events in /root/.claude/settings.json.

That session's start printed the session brief, then the dispatcher's two lines: the hub copy already current, and the short-page line at /root/.claude/hub. It printed no line saying the hub clone was absent, so the start hook's own clone and install did not run.

In that container /root/.claude/hub/hook-dispatch.mjs was present, the hub copy's head was eb6d9930659344d5c1ce1071cd683d44bfed8bcf, and the settings file held nine entries naming the dispatcher. The settings file was written at 20:39:56 California time, before Claude Code started.

The proof session was archived after its one answer. Its own result gave its cost as about 0.13 dollars at list price.

So a brand-new container of the Hub environment has the hub's hooks before its session starts. What remains of this project is the nine apps, each at its next session started with that app alone, with the block below.

A correction to the count above: the first landing took seven agents, not six, because the push was made by a fresh worker. Bringing this entry onto main takes three more: a worker, a checker and a worker for the push.

The four workflow runs for eb6d9930659344d5c1ce1071cd683d44bfed8bcf (the deploy, the doctrine gates, the accessibility gate and the code scan) each ended in success, read at 18:21 California time on 12 November 2026.

## The block for an app's session

This block is pasted at the start of an app's next session started with that app alone.

```
A piece of work from the hub's record: plans/app-sessions.md in njefferson/noahjefferson, approved there on 12 November 2026. Pasting this page here starts it. Read the short page first, at /root/.claude/hub/plans/native/page.md. If that file is absent, the hub is not installed in this container: clone https://github.com/njefferson/noahjefferson.git to /root/.claude/hub, read the page there, and carry on.

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

The setup script
mkdir -p /root/.claude || true
[ -f /root/.claude/hub/hook-dispatch.mjs ] || git clone --quiet https://github.com/njefferson/noahjefferson.git /root/.claude/hub || true
[ -f /root/.claude/hub/hook-dispatch.mjs ] && node /root/.claude/hub/hook-dispatch.mjs --install || true

The cost
Two agents, a worker and a checker, on the cheapest tier that holds the rules, and about twenty minutes.

The way back
The commit is reverted on the work branch. The script is removed by the same card.

Where it can fail
- The card does not appear or is declined: say so plainly and change nothing in the environment. The second route is this repository's own start hook, which clones the hub to /root/.claude/hub when it is absent and runs the install from that clone, as the hub's .claude/hooks/session-start.sh does. That write is under the configuration folder, so the harness asks for it.
- A hook or the harness refuses a step: stop that route, report the refusal word for word, and try no other way to the same end.
```
