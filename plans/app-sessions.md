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

A second page was approved on 12 November 2026, California date. It changes hub pages only. It puts the operating answers on plans/native/running.md, makes the move a procedure, adds two lines to the short page, brings section 13 of doctrine/apps.md in line and corrects three call forms in HUB-REFERENCE.md. This run does not check that a session in an app finds the page and names the move. That is seen at the first app's next session started alone.

## The block for an app's session

This block is pasted at the start of an app's next session started with that app alone.

The procedure plans/native/skills/app-move/SKILL.md now stands in this block's place, and the block is kept as written.

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

## The second approved page

### Operating answers that stand: a change to the app-sessions project

This is a change to the project recorded in `plans/app-sessions.md`. The first page is finished: the never page is rewritten, the Hub environment has the setup script and it is proven, and the record is on main at 6fa70795bb78dae6d1a86b38a0bcb02d0830b88d. Approving this page starts a second run. It changes hub pages only.

#### Why

The operating questions of 12 November were answered in one chat and stand nowhere: how many repositories a session is started with, what to do with sessions already running with two, what is done once for an app, how a new app starts, which mode, which model, and what updates by itself. Three standing pages also still say the old thing or nothing:

- The move is a block to paste, and remembering to paste it is left to a person.
- The new-app checklist, section 13 of `doctrine/apps.md`, tells a session to start a new app with both the new repository and the hub, and has no step for the setup script.
- `HUB-REFERENCE.md` gives three call forms that reach the hub at a path beside the app, which does not exist when an app is started alone.

The intended outcome: any session in any repository answers an operating question from one hub page, and an app that is not moved yet is noticed by the session, not remembered by a person.

#### What the owner does afterwards

- Sessions now running with two repositories: nothing. They finish their work as they are.
- An app's next session: started with that app alone. The session names the move, or "move this app" starts it. One approval card, once for that app.
- An app not opened for a long time: nothing until it is next opened.
- A new app: its first session started with the new repository alone. The checklist places the script by one card.

#### 1. The result

Five things on main, in one commit.

**A. A new page, `plans/native/running.md`: how sessions are started and run.** One screen, with these parts:

- Starting a session: one repository for each session, the app alone, in its own environment. The hub is not picked beside it. The hub's own session is the hub alone.
- Sessions already running with two repositories: left to finish. A session's repositories are fixed when it is made, so none is converted. The next session for that app is started alone.
- Once for each app, the move: done at the app's first session started alone, by the procedure in B. The session offers it when the app's instruction file still describes the retired gates. The owner's part is one approval card. An app not opened for a long time needs nothing until then.
- The one line that starts the move where the hub is not in the container yet, as one fenced block:

```
Move this app to the hub's new way: follow plans/native/skills/app-move/SKILL.md in njefferson/noahjefferson.
```

- A new app: first session with the new repository alone; section 13 of `doctrine/apps.md` places the setup script.
- Mode: plan mode for the scope, because it gives the approve button. The run after approval in a mode that does not ask before each edit. Accept edits only when a session says it needs a write under a repository's `.claude` folder, and the session says when the last such write is done.
- Model: the worker and the checker carry their own tier. The main thread costs what it runs on. The top tier is for the scope and for a surprise that needs judgement; a lower tier holds the run after approval. A session cannot change its own model, and says plainly when the work in front of it does not need the top tier.
- What updates by itself: at every start and resume the hub's copy in the container is brought forward from the hub's main, with the short page, the roles, the procedures, the push guard and the dispatcher.
- What does not: an app's CI runs the hub's checks at the hub commit that app pins; the setup script's text changes only by a card in a session of that environment.

**B. The move as a procedure, `plans/native/skills/app-move/SKILL.md`.** It carries what the record's block carries: confirm the session was started with the app alone and stop if the hub sits beside it; put the three-line script on the session's environment by one card; shorten the app's instruction file to its own facts and one line naming the short page; point any check that looks for the hub beside the app at `/root/.claude/hub`; land on the work branch after a checker's pass; and the second route through the app's own start hook when the card cannot be shown. It adds one thing: when the last write under the configuration folder is done, the session says so, so the mode can be changed back. The block in the record stays as written, with one line added to the record saying the procedure now stands in its place.

**C. Two lines on the short page, `plans/native/page.md`,** at the end of "What is wanted from a session":

- A question about how sessions are started or run is answered from the hub's `plans/native/running.md`, in whatever repository it is asked.
- Where a repository's own instruction file still describes the gates retired on 12 November 2026, say so once at the start and name the move procedure, the hub's `plans/native/skills/app-move/SKILL.md`. Start it when asked.

**D. Section 13 of `doctrine/apps.md`, in three places and no others.**

- The session note that says to start with both the new repository and the hub is replaced: a new app's session is started with the new repository alone, and the hub reaches it through the installed copy at `/root/.claude/hub`.
- Step 1 gains: and one line naming the short page.
- A new step 5b: at the first session, read the session's environment and propose the three-line setup script by one approval card. The line that says who does which steps names 5b as the session's, with the card the owner's.

**E. Two small lines.** `HUB-REFERENCE.md`'s three call forms, at lines 278, 495 and 513, reach the hub at `/root/.claude/hub`. The hub's `CLAUDE.md` list of where things are gains the running page.

#### 2. How it is checked

- A checker that did none of the work opens the exact commit before the push.
  - The running page: each part above is there, in plain words, and nothing on it contradicts the record `plans/app-sessions.md`, the short page or `plans/native-setup.md` section G.
  - The procedure: it holds everything the record's block holds, by a side-by-side read, and the one added line.
  - The short page: the diff is exactly the two added lines.
  - Section 13: the diff is the three places and nothing else, and no other section of `doctrine/apps.md` changed.
  - `HUB-REFERENCE.md`: the three call forms and nothing else. `CLAUDE.md`: the one line.
  - Nothing quotes or names the owner, and there is no table.
- The hub's seven checks pass, the remote's head is read after the push, and the four workflow runs for the pushed commit are read once.
- Not checked in this run, and said so in the record: that a session in an app finds the page and names the move. That is seen at the first app's next session started alone.

#### 3. The steps

1. Worker A writes the running page and the procedure, and adds to the record this page as approved and the line about the procedure, and the one line in `CLAUDE.md`.
2. Worker B, at the same time, adds the two lines to the short page, changes section 13 in its three places, and corrects the three call forms.
3. One landing by the hub's landing procedure: a worker commits and runs the seven checks, the checker passes the exact commit, a worker pushes main once and reads the remote's head.
4. The managing session reads the four workflow runs once and reports.

#### 4. The cost

- Five agents in five sends, all on the sonnet tier: two workers, a worker for the commit, a checker, a worker for the push. A failed check adds two: a fix and a second look.
- By the last run's figures, between 13,000 and 45,000 tokens for each agent as the harness printed them, about 150,000 in all, and about 30 minutes.
- One push of main. The agents run in the foreground, so no turn forced by the environment's git hook is expected; one is forced if a turn ends before the push.
- Nothing in the run needs the top tier. The main thread can be switched down after the approval.

#### 5. The way back

- The commit is reverted on main through the same check. The reverted pages reach each session at its next start or resume.
- No environment is touched, nothing under a `.claude` folder is written, and nothing in any app is touched.

#### What only the owner does

- Approves this page. Nothing else in this run.

#### Where it can fail, and what follows

- **A line on the short page misleads.** Every session reads that page. The checker reads the two lines against the record, and the way back is one revert.
- **A check refuses a wording.** The form is changed and never the meaning; a change that would alter the meaning stops the step and is reported.
- **An app's session has no hub in its container and an instruction file that says the old thing.** Nothing can tell that session about the move. The one fenced line on the running page starts it there.
- **A hook or the harness refuses a step.** That route stops, the refusal is reported word for word, and no other way to the same end is tried.

#### Not known

- Which apps' own start hooks already install the hub when the app is started alone.
- Whether a session started with two repositories gets the hub's hooks once its environment has the script.
- Which environment Cv-Thalweg's sessions use.

#### Left out on purpose

- The setup script on the Default environment. It would cover any session started there, and it would also put the hub's hooks on every other project that uses it.
- The hub's session starting the apps' move sessions itself. An app may have a session mid-work, and the move is cheapest at the moment that app is next opened.
