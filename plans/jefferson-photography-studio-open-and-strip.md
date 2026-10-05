# The open and the strip, off the page

## Goals
Every step serves one of these, named in the Served by line. Goals 2 to 6 are the standing block of the hub CLAUDE.md under `## Goals every session serves`, quoted word for word; goal 1 is the app's own.
1. The app works on the device: a photograph opens with its look in one stage, every control answers while the strip builds, and what the device measures is in its report.
2. The owner's time and credit go to judgement only: agents on the cheapest model that holds the rules, nothing at the top model but management, and no turn spent watching.
3. The work is visible every few minutes without being asked for: a status at each agent's return and at each timer return.
4. Nothing comes back to the owner for a decision but a choice only the owner can make, shown with pictures where it is about how a photograph looks, and the end of the plan.
5. An approved plan runs to its end through agents with no amendment; a refusal, a failure or a defect found on the way is handled by the main thread and recorded for the next plan, never handed back.
6. The owner's rules bind as written, and the main thread is held by gates that leave it no choice to make, never by the owner reading its replies; where two rules meet, the conflict and one suggestion go to the owner once.
Served by: steps 1 to 9 serve goal 1; steps 7, 8, 9, 11, 12 and 13 serve goals 5 and 6; step 10 serves goals 2 and 6; step 14 serves goals 2 and 3.

## Order
Order: 1 2 3 4 5 6 7 8 9 10 11 12 13
Standing: 14
The status command prints `next: step N`, the first number in Order with no hand-back whose first line opens DONE; a hand-back opening REFUSED or FAILED leaves N where it is. Steps 1 to 9 are the app's, in the Jefferson-Photography-Studio repository and the session scratchpad; steps 10 to 13 are the hub's and run last, so that a defect in a fence on the main thread cannot stall the app's work. A Standing step may be sent at any time.

## Rules for every agent, read before anything else
An agent's prompt is only this file's path and a step number; everything it is told is here, where the owner reads it. These bind every command an agent writes, and the plan fence refuses what breaks them; a refusal is a failure that has already happened, never the way to find out.
- Never `cd`, and never pushd or popd either, at any depth. Write every path in full.
- Every file is read with the Read or Grep tool, never through Bash, whatever this session's mode says about reading through Bash. Bash runs only a command the step's Commands line names, the git reads among them, one command per call and never joined to another with `&&`, `;` or a pipe except where the line shows one.
- No command carries a variable assignment in front of it. The time is `TZ=America/Los_Angeles date`.
- Write `git push` bare, with no redirect and no pipe after it.
- Every command is a reader, or begins with an entry of the Commands section below. A step's own Commands line names every command shape its agent may run, and the agent runs nothing outside that line: no loop, no pipe except where the line shows one, and no script written around them.
- A progress note is written with the Write tool to `progress/step-N.txt` (new) in the session scratchpad, at each stage and at least every five minutes; the folder already exists. Before a command expected to run longer than five minutes, say how long, and have it print its progress as it goes.
- The hand-back is two lines: the first is one word, DONE, REFUSED or FAILED, and the second is one sentence. Everything else the agent would report, every command's output included, is written with the Write tool to `progress/step-N-report.txt` (new) in the session scratchpad before the hand-back. A report ends with a line beginning `Found:` for each thing found and not fixed.
- After a command fails and the code it runs is edited, record the reading the reply guard names before running it again; an unchanged repeat with no recorded reading is refused. The reading is recorded only through the live clone's path, `node /root/.claude/hub/reply-guard.mjs --read`.
- At any refusal, stop and hand back REFUSED, with the refusal's text in the report. A different command for the same end is a second route, and refused.
- Do the named step and nothing outside it. Give every scratch script a printed MADE TO FAIL block.
- For git state, use the reads the fence counts: `git rev-parse --abbrev-ref HEAD` for the current branch, and `git log`, `git status`, `git diff`, `git show`, `git rev-parse`, a bare `git branch`, and `git remote -v`.
- Every agent runs on Sonnet, except step 14's timer, which runs on Haiku because it runs one command and judges nothing.
- A step that lists its commands runs those, in that order, and nothing else.

## Asked
- The app's open and strip work, carried from the previous plan and run here as a plan of its own: a photograph's look arrives in one stage, the controls answer while the strip's tiles are drawn, and the device's report says where the seconds go.
- The leftovers of the v2.65.3 release that the Carried section lists, and the one hub step that section records for this plan.
- The work stops at the staging site for the owner's pass on the device. Moving staging to production needs the owner's go and is not in this plan.
- The one decision that comes back to the owner is the pictures at the end, with the two look questions beside them.
- One agent at a time, on Sonnet; the timer on Haiku gives a status every few minutes while an agent runs; a status at every return.

## Steps
All implementation, tests, commits, pushes and reads of CI are done by agents. The main thread gives the status, publishes the status page, sends the step the status names, and ends its turn. The app's work lands as one commit after one scope verdict, because the scope record is held to the whole working tree and a second commit would need a second verdict.

1. **Read the record, set the harness up and measure before, app, one agent.** It changes no source file except the one named in the fourth bullet.
   - Reads with the Read and Grep tools: the Carried section below; the v2.65.3 entry in `NOTES.md` with its two Found paragraphs; `docs/ARCHITECTURE.md`; the Options and Rejected sections of decision records 019, 023 and 071 under `docs/decisions/`, and any other record that Grep finds naming `makeThumb`, `skyMaskFor` or the strip. The Carried section's line numbers are a reading of the tree on 2026-10-04 and some have moved since (on that day `syncSkyMap` stood at line 2295 and `restripForGrade` at line 14985 of `src/main.ts`); the names are what to look up. It reads whether the three `.third-person-allow` declarations and the other items of the Carried section's "Left from the release" bullet are already on staging, and records which are.
   - Writes `.claude/PLAN` in the app repository: one line, the absolute path of this plan as approved.
   - Sets up: `npm ci`, then the harness packages, then a build; starts `python3 -m http.server 8131` over the app's `dist` as a command of its own, in the background, and confirms it answers.
   - Reads whether a walk run by its absolute path passes its freshness check from the agent's start directory: `requireFreshDist` and `distFreshness` in `tools/fresh-dist.mjs` default to the current directory, and no agent may `cd`. If a walk refuses a current `dist` for that reason, it makes the one change that fixes it: both default to the repository root found from the file's own location. That is the only source change in this step.
   - Measures before, with a scratch session harness in the scratchpad (a MADE TO FAIL block that plants a page hold of known length and prints it): one session over the practice set in `public/examples` under Aerochrome, recording the longest pause by the frame watch in `src/startup.ts`, the time from opening a photograph to its sky and depth landing, and each tile's wall time. The watch ends after one minute (`FRAME_WATCH_MS`) unless the graphics are still building, so the harness also counts its own animation frames over the whole session and records both. The numbers go to `before.txt` in the scratchpad and into the report.
   - Stops the server with TaskStop and confirms the port by running the walk runner with an `--only=` value that matches nothing, which prints that nothing is serving `dist` when the port is closed.
   - Commands: `git -C /home/user/Jefferson-Photography-Studio status`, `log`, `diff` and `rev-parse`, one command each; `npm --prefix /home/user/Jefferson-Photography-Studio ci`; `npm --prefix /home/user/Jefferson-Photography-Studio install --no-save esbuild playwright-core`; `npm --prefix /home/user/Jefferson-Photography-Studio run build`; `python3 -m http.server 8131 --directory /home/user/Jefferson-Photography-Studio/dist`; `node /home/user/Jefferson-Photography-Studio/tools/fresh-dist.mjs --repo=/home/user/Jefferson-Photography-Studio`; `node /home/user/Jefferson-Photography-Studio/tools/walk-all.mjs --only=none`; `node` on the scratch harness it writes under `/tmp/claude-0/`; `node --check` on a file it edited. Nothing else runs.
2. **The tile module and the tile job, app, one agent.** The Carried section's "Tiles are drawn off the page", whole.
   - Before the first edit it reads how `src/export.worker.ts` runs `compileEdit` and encodes a picture in a worker, and reuses that path. If the export worker does not already show the way to a JPEG encode off the page on an iPad, a web search for the encode's support there is its first read.
   - It writes `src/tile.ts` (new) with `solveLift` and `makeThumb`'s assembly of a tile's parameters, adds the tile job to `src/decode.worker.ts` and its client in `src/decodeClient.ts`, and turns `realThumbnails` into the page's store-and-show. `makeThumb` keeps its name and signature on the page for the quick look, and stays the path where the device has no worker.
   - The proof is a scratch comparison in the scratchpad, made to fail once, that draws every practice-set tile on the page and in the worker from the same inputs and compares the bytes. The walks that compare tiles with opens run in step 7.
   - It builds, and runs the app's own gate tools that its edit can touch (the preview-version check and its record when `PREVIEW_PIPELINE` has to move, the architecture map, the contract check and its allow list), one command each, with the server started and stopped as in step 1.
   - Commands: `git -C /home/user/Jefferson-Photography-Studio status`, `diff` and `log`; `npm --prefix /home/user/Jefferson-Photography-Studio run build`; `python3 -m http.server 8131 --directory /home/user/Jefferson-Photography-Studio/dist`; `node /home/user/Jefferson-Photography-Studio/tools/` followed by one gate tool or walk; `node` on the scratch comparison under `/tmp/claude-0/`; `node --check`. Nothing else runs.
3. **The open photograph waits for the worker's selection, app, one agent.** The Carried section's "The open photograph never builds or refines its selection on the page", whole.
   - `skyMaskFor`, the lift re-solve in `solveLift`'s caller and `syncSkyMap` wait for the selection `requestSkySelection` brings; the worker's selection carries the refined mask, so the refinement moves to the worker beside `src/sky.worker.ts` and `src/skyfine.ts`. The on-page build stays only where `requestSkySelection` resolves null. The picture draws first, as now.
   - The proof is the same scratch session as step 1, run again: the longest pause and the time to the look's sky stages, with the parts step 4 adds read once it lands.
   - Commands: as step 2. Nothing else runs.
4. **The device says where the seconds go, app, one agent.** The Carried section's "The device says where the seconds go", whole.
   - `switchSplit` gains the selection's wait, the lift solve and the sky map build, and `tools/switch-instrument-walk.mjs`, which holds the parts to the whole, is extended to the new parts. The worker returns its tile timings with the bytes, and `src/diagnostic.ts` prints the one new line for the last tile drawn: decode, selection, lift, pixels, encode, and whether it ran on the page or in a worker. The report still carries nothing the reader wrote.
   - Commands: as step 2. Nothing else runs.
5. **The Aerochrome blob on the camera JPEG NIR_1597, app, one agent.** The Carried section's "Left from the release" bullet, its second item.
   - It fetches NIR_1597.JPG through `tools/owner-images.mjs`, the one door to the owner's test photographs and the only source of a photograph here. If the host refuses, that is named in the report with the exact hosts, never read as the data being absent.
   - It renders that frame under Aerochrome at each release commit after v2.64.56, each built in a worktree under a `.worktrees/` (new) directory inside the app repository (so that the repository's installed packages are found from it) that it removes afterwards, and OPENS every render with the Read tool before it says anything about it. It names the first commit that shows the blob. If the release caused it, it diagnoses and fixes it in the files this plan lists, after reading decision records 019 and 023 for what they reject. If the release did not cause it, the report says so with the renders' paths.
   - Commands: `git -C /home/user/Jefferson-Photography-Studio log`, `show`, `rev-parse`, `diff` and `status`; `git -C /home/user/Jefferson-Photography-Studio worktree add`, `worktree list` and `worktree remove`; `node /home/user/Jefferson-Photography-Studio/node_modules/vite/bin/vite.js build` on a worktree's root; `python3 -m http.server`; `node /home/user/Jefferson-Photography-Studio/tools/` followed by `owner-images.mjs` or `look-sheet.mjs`; `node` on a scratch script under `/tmp/claude-0/`; `node --check`. Nothing else runs.
6. **The picture script's second control, and the five sheets, app, one agent.** The Carried section's "Left from the release" bullet, its third and fourth items.
   - It reads the v2.65.3 entry's paragraph "Found in the comparison pictures, and not fixed" in `NOTES.md`, finds which script rendered those pictures, and explains why setting Natural IR's Hue shift to the value it already held moved six frames, with the suspect that entry names tested first. It fixes the cause in the app or in the script, whichever it is.
   - It renders the five picture sheets again from the integrated tree with `tools/look-sheet.mjs`, both controls passing, and OPENS each one with the Read tool. It compares the sheets' candidates pixel for pixel and redraws around the difference when two match, because a sheet whose candidates are the same file cannot be chosen from. It lists the sheets' paths in the report; the main thread sends them, with the two look questions of the Carried section beside them, as the owner's only choice at the end of the plan.
   - Commands: as step 5, without the worktree entries. Nothing else runs.
7. **Check once and fix, and write the NOTES entry, app, one agent.** It runs the checks over the integrated tree, once, and fixes a failure in the files this plan lists, with the reading recorded through the live clone's reply guard before any repeat.
   - In order: the build; every `also=` tool named in the app's `.branch-guard`, one command each; the walks that compare tiles with opens (tile-truth, agreement, opens-as-shot, aerochrome, switch-instrument, build-wait, sky-stage); step 1's session harness again for the after numbers; then every walk in parts, as v2.65.3 was verified, each part a foreground command with a Bash timeout of 600000 milliseconds and `--only=` naming the part. About two hours of walk time in all, stated here so the owner sees it at approval. The server is started once as a command of its own and stopped at the end, the port confirmed.
   - A red walk is run once against the parent commit's build before it is called new; bar-fit and the control sweep were red before this work, and the report says whether they still are, with the counts.
   - It ends by writing the release's entry at the top of `NOTES.md`: what changed for the reader, the before and after numbers, what was verified headless and what needs the owner's hands on the iPad, and every `Found:` line of steps 1 to 6.
   - Commands: as step 2, plus `node /home/user/Jefferson-Photography-Studio/tools/walk-all.mjs --only=` with the names of one part, and `node /home/user/Jefferson-Photography-Studio/tools/preview-version-check.mjs --record` when the number has moved. Nothing else runs.
8. **Scope verdict, app, one agent that made none of the diff.** It runs the scope check and reads what it prints, reads this plan by its path and the app's diff, judges whether every change is inside this plan and inside what the owner asked for, and writes its finding with the Write tool to `scope-verdict.txt` (new) in the session scratchpad, quoting no owner message. If the finding begins IN-SCOPE it records it; otherwise it records nothing and hands back FAILED with the finding in its report.
   - Commands: `node /home/user/noahjefferson/plan-scope-check.mjs --repo=/home/user/Jefferson-Photography-Studio`; `git -C /home/user/Jefferson-Photography-Studio diff` and `status`; and to record, the tool's own usage line with the finding on standard input from the file and no cat and no pipe: `node /home/user/noahjefferson/plan-scope-check.mjs --repo=/home/user/Jefferson-Photography-Studio --record --verdict="IN-SCOPE: <the finding's first line>"` with the finding's file in the scratchpad redirected in. Nothing else runs.
9. **Land on staging, app, one agent.** In order: `git add` of the files the diff holds, named one by one, with `.plan-scope`; `git commit -m` with a message written for the reader, whose subject opens with Faster and whose body lists the Fixed items, with no trailer of any kind and no link to a chat; `git push` bare, on `staging`; `git ls-remote origin staging`. Then it reads Gates and Deploy for the pushed SHA through the GitHub connector's workflow-listing tools, which are reads, until each has a conclusion, and reads the staging site's offline worker through a web read until it names that SHA. Its report carries the receipt line, the remote's staging head, each run's conclusion and the version the worker names.
   - A commit refused by a hook is a REFUSED hand-back with the hook's text. The commit hook runs the preview-version check, the contract check, the architecture check, the decisions check and the patch-note check; they were run in step 7, and a refusal here means the tree moved after it.
   - Commands: `git add`, `git commit`, `git push`, `git ls-remote`, `git log` and `git status`, each on `/home/user/Jefferson-Photography-Studio`. Nothing else runs.
10. **The main thread's reads narrow, hub, one agent.** The Carried section's last bullet. `managerFence` in `hook-dispatch.mjs` passes any read through `isRead` and `planGuardReads`; after this step it passes a read only of the approved plan, the progress notes, the report files and the hub's doctrine, and refuses every other read with a reason that says to send an agent.
   - It keeps passing everything the fence passes today that is not a read (the status command, TaskStop, the plan file's writes, the status page, entering and leaving plan mode, the dispatch of an agent). It keeps the doctrine read passing, because the doctrine read guard holds the main thread to that read until it is done, and a narrowed fence that refused it would hold the main thread forever.
   - A case and a plant for each: a read of the plan passes, a read of a progress note passes, a read of a report file passes, a read of the doctrine passes, a read of an app source file is refused with a reason that says to send an agent, and that refusal latches the main thread as every refusal on it does (Doctrine §0d), which the case states. The record: `DOCTRINE.md` §0e rule 13's enforcement paragraph says the fence passes those four reads only, and one index line in the hub `CLAUDE.md`. It writes `.claude/PLAN` in the hub: one line, the absolute path of this plan as approved.
   - Commands: `git -C /home/user/noahjefferson diff`; `node --check /home/user/noahjefferson/hook-dispatch.mjs` and the same for session-guards.test.mjs, one command each. Nothing else runs; the suite runs once, in step 11.
11. **Check once and fix, hub, one agent.** It runs the suite, the plants and the hub's gates over the working copy. A failure is fixed in the files this plan lists for the hub, with the reading recorded through the live clone's reply guard before the command runs again, until every one passes. The report carries every count and every line that was not CAUGHT.
   - Commands: `node /home/user/noahjefferson/session-guards.test.mjs`; `node /home/user/noahjefferson/session-guards.test.mjs --plants` in the foreground with a Bash timeout of 600000 milliseconds, run again if it times out, since the plants took about eight minutes in the previous plan's step 4; `node /home/user/noahjefferson/docs-check.mjs /home/user/noahjefferson`; `node /home/user/noahjefferson/privacy-check.mjs --repo /home/user/noahjefferson`; `node /home/user/noahjefferson/quote-check.mjs --repo /home/user/noahjefferson`; `node /home/user/noahjefferson/third-person-check.mjs --repo /home/user/noahjefferson`; `node /home/user/noahjefferson/lessons-check.mjs`; `node /root/.claude/hub/reply-guard.mjs --read` with the reading a refusal names, before any repeat; `node --check` on a file it edited. Nothing else runs.
12. **Scope verdict, hub, one agent that made none of the hub's diff.** As step 8, over the hub.
   - Commands: `node /home/user/noahjefferson/plan-scope-check.mjs --repo=/home/user/noahjefferson`; `git -C /home/user/noahjefferson diff` and `status`; and to record, the tool's usage line with `--record --verdict="IN-SCOPE: <the finding's first line>"` and the finding's file in the scratchpad redirected in. Nothing else runs.
13. **Land, hub, one agent.** In order: `git -C /home/user/noahjefferson add .plan-scope CLAUDE.md DOCTRINE.md hook-dispatch.mjs session-guards.test.mjs`; `git -C /home/user/noahjefferson commit -m "Gates: the main thread reads only its plan, the progress notes, the reports and the doctrine"`; `git -C /home/user/noahjefferson push origin main`; `git -C /home/user/noahjefferson ls-remote origin main`; `git -C /root/.claude/hub pull`; `git -C /root/.claude/hub rev-parse HEAD`. Then it reads the hub's CI runs for the pushed commit through the GitHub connector's workflow-listing tools until each has a conclusion, and writes the push's receipt line, the remote's main, the clone's head and each run's conclusion in its report. Nothing else runs.
14. **The timer, one agent on Haiku, standing: sent whenever another agent is running and no timer runs.** It rewrites `timer.mjs` (new) in the session scratchpad with the Write tool so that it ignores `progress/step-14.txt` (new) and writes no progress note of its own: a Node script importing only `node:fs` that reads the newest line of every other progress note under the scratchpad every ten seconds, prints them, and exits 0 when any line has changed or after 270 seconds, whichever comes first, printing which; its MADE TO FAIL block prints the notes it found and exits 2 when the progress folder is missing. Then it runs exactly one command, `node` followed by the full path of that file, once, and hands back DONE with what it printed as its report. The main thread gives the status at its return and sends it again while an agent runs.

## Carried to the new session
The app's work from the plan this one replaces, for the new session's plan. Read in the code on 2026-10-04 and reported from the device the same day at v2.65.7, with two pictures and the diagnostic: a photograph opens in two stages, Aerochrome's sky and depth landing seconds after the picture; while the strip's tiles rebuild no control answers; the longest pause was 6.44 seconds.
- **The cause.** Three paths build the sky selection on the page's thread. `skyMaskFor` (src/main.ts, line 2179) builds it from the 1024 px copy whenever the decode worker's selection has not landed at that turn; `syncSkyMap` (line 2296) refines it with the guided filter and builds the sky map through the full-size row denoiser on the first edit with depth; and `makeThumb` (line 13001) draws every strip tile through `compileEdit` on the page, asking `skyMaskFor` for the tile's own selection (lines 13174 and 13201) and solving the lift there (line 13174), with `realThumbnails` (line 14793) running two such tiles at a time and `restripForGrade` (lines 15008 and 15054) marking every tile stale on a look press, so a set of ninety pays all of it on the page. The decode worker already builds the selection off the page when asked (src/decodeClient.ts, lines 134 and 228, through src/skyClient.ts), and the export already runs `compileEdit` in a worker (src/export.worker.ts).
- **Tiles are drawn off the page.** A tile job in the decode worker: the decode, the sky selection from the worker's own copy, the baseline, the lift solve, the tile's pixels through `compileEdit`, and the JPEG encode, returning the bytes. The page sends the inputs `makeThumb` now reads from its own state and does nothing per tile but store and show the result. `solveLift` (line 4184) and `makeThumb`'s assembly of the tile's params move to `src/tile.ts` (new), which the page and the worker both import; `makeThumb` keeps its name and signature on the page for the quick look. The worker's tile is byte for byte the page's tile for the same inputs on the practice set, checked by a scratch comparison made to fail once, and the walks that compare tiles with opens run after.
- **The open photograph never builds or refines its selection on the page.** The lift re-solve (line 4287) and `syncSkyMap` wait for the worker's selection, which carries the refined mask; the on-page build stays only where `requestSkySelection` resolves null because the device has no worker. The picture draws first, as now, and the look's sky stages follow when the worker answers.
- **The device says where the seconds go.** `switchSplit` (line 15663) gains the sky selection's wait, the lift solve and the sky map build; the report gains one line for the last tile drawn: decode, selection, lift, pixels, encode, and whether it ran on the page or in a worker.
- **What it must satisfy:** no tile's render holds the page's thread, measured by the frame watch in `src/startup.ts` in the headless session walk over the practice set before and after; the tiles match their opens; one verification over the integrated change, the way the release of v2.65.3 was verified. Then NOTES, the push to staging written bare, Gates and Deploy for that SHA, and the live version read.
- **Left from the release of v2.65.3**, recorded in that repo's NOTES: the three `.third-person-allow` lines for the dark-channel paper's citations in `src/localmap.ts`, `src/pipeline.ts` and `src/gl.ts`, committed on staging; the Aerochrome blob on the camera JPEG NIR_1597, found by rendering that frame at each release commit after v2.64.56 and fixed if the release caused it; the picture script's second control, which moved six frames by up to 2 levels in 255 when set to the value it already held, explained and fixed; the five picture sheets rendered again with both controls passing and opened before they go to the owner, as the owner's only choice, with the two look questions beside them: a per-kind hue for Natural IR, and Aerochrome's band moves with Restore depth, which decision 019 rejects.
- **The sweep caller** already on JPS staging reaches main with the release's promotion; the sweep's JPS half runs after that, as the hub's `.github/workflows/branch-sweep.yml` says.
- **For that plan's record:** the main thread's manager fence passes any read, so nothing refuses the main thread reading the app to diagnose; narrowing it to the plan, the progress notes, the report files and the doctrine is a hub step for that plan.

## Commands
- node /home/user/Jefferson-Photography-Studio/tools/
- node /home/user/noahjefferson/session-guards.test.mjs
- node /home/user/noahjefferson/lessons-check.mjs
- node /home/user/noahjefferson/docs-check.mjs
- node /home/user/noahjefferson/privacy-check.mjs
- node /home/user/noahjefferson/quote-check.mjs
- node /home/user/noahjefferson/third-person-check.mjs
- node /home/user/noahjefferson/plan-scope-check.mjs
- node /root/.claude/hub/reply-guard.mjs --read
- node /tmp/claude-0/
- node --check
- npm --prefix /home/user/Jefferson-Photography-Studio ci
- npm --prefix /home/user/Jefferson-Photography-Studio install --no-save esbuild playwright-core
- npm --prefix /home/user/Jefferson-Photography-Studio run build
- node /home/user/Jefferson-Photography-Studio/node_modules/vite/bin/vite.js build
- python3 -m http.server
- TZ=America/Los_Angeles date
- git status
- git diff
- git log
- git show
- git rev-parse
- git ls-remote
- git worktree add
- git worktree list
- git worktree remove
- git add
- git commit
- git push
- git pull

## Cost
- Step 1: one agent, twenty to forty minutes, most of it the install, the build and the before measurement.
- Steps 2 to 6: one agent each, twenty to forty minutes; the edits are in a 15,000-line file.
- Step 7: one agent, up to two and a half hours, most of it the walks run in parts. This is the largest spend in the plan and is the same sweep v2.65.3 was verified with.
- Steps 8 and 9: one agent each, a few minutes, plus the staging Gates and Deploy runs.
- Steps 10 to 13: one agent each; step 11 is ten to thirty minutes, most of it the plants' eight-minute run; steps 12 and 13 are a few minutes plus the hub's CI.
- Step 14: a Haiku agent per four and a half minutes while any other agent runs.

## Looked up
- In the app repository, read 2026-10-04: the v2.65.3 entry of `NOTES.md` and its two Found paragraphs; the frame watch at the top of `src/startup.ts`, which stops after one minute unless the graphics are still building; `tools/fresh-dist.mjs`, whose freshness check defaults to the current directory; `tools/walk-all.mjs`, which needs a server on port 8131; the header of `tools/tile-truth-walk.mjs`, the walk that compares tiles with opens; the whole of `.branch-guard`, the chain of tools run on every commit, the plan-scope tool among them; the header of `tools/owner-images.mjs`, the closed door to the owner's test photographs; and `tools/.preview-pipeline`, whose recorded version was 92. The named functions of the Carried section all exist in `src/main.ts`, `src/skyClient.ts` and `src/pipeline.ts`, at lines that have moved by a few.
- In the hub, read 2026-10-04: `managerFence`, `isRead`, `planGuardReads`, `planFiles` and `planCommands` in `hook-dispatch.mjs`, and `plan-fence.mjs`, for what a plan's Files and Commands sections must look like; `plan-scope-check.mjs`, whose verdict is keyed to the plan's hash and the whole working tree's hash, so one commit takes one verdict; the sections `plan-guard.mjs` demands of a plan. Hub main stood at feb0efc, as the previous plan's last landing step recorded.
- Nothing outside the repositories bears on moving this code to a worker: the app already runs `compileEdit` and a picture encode in a worker for its export. The one outside question, whether a picture can be encoded in a worker on an iPad, is step 2's first read.

## Branches
- A cheaper tile drawn on the page (a smaller tile, fewer at a time): not taken; the page would still solve the lift and build the selection, and the Carried section names exactly that page-thread work as the cause.
- A second, tile-only worker: not taken; the decode worker already holds the decoded frame and builds the selection, and a second worker would hold a second copy of a frame, on devices where the export pool is budgeted against a 600 MB ceiling because the tab is killed rather than swapped.
- A commit per step: not taken; every commit runs the scope check against the whole working tree, so a second commit would need a second verdict and the app's work would be judged twice.
- The hub's fence narrowing first: not taken; a defect in a fence on the main thread would stall every app step behind it, so it lands last.
- Promoting staging to production at the end: not taken; it needs the owner's go after the pass on the device.

## Call chain
- Opening a photograph today: `requestSkySelection` in `src/skyClient.ts` asks the decode worker through `src/decodeClient.ts` and `src/decode.worker.ts`; the page's `skyMaskFor` takes the answer or builds the selection itself; `syncSkyMap` refines it and builds the sky map on the first edit with depth; `solveLift` solves the lift. After this plan the page takes the worker's refined selection and builds none of it, except where `requestSkySelection` resolves null.
- Drawing a tile today: `realThumbnails` runs two at a time, each calls `makeThumb`, which asks `skyMaskFor` and `solveLift` and draws through `compileEdit` in `src/pipeline.ts`; `restripForGrade` marks every tile stale on a look press and `realThumbnails` draws them again. After this plan `realThumbnails` sends each tile's inputs to the worker through `src/decodeClient.ts`; the worker decodes, builds the selection, runs the lift through `src/tile.ts` (new) and `compileEdit`, encodes, and returns bytes with its timings; the page stores and shows them.
- Reporting: `switchSplit` in `src/main.ts` and `src/diagnostic.ts` print the parts and the tile line the worker's timings fill.
- Sending an agent: the dispatch gate in `hook-dispatch.mjs` reads the approval marker, the plan's Steps and Served by line and the pointer, and passes only the step the status names or the Standing step. Each agent call is held by `plan-fence.mjs` to this plan's Files and Commands.
- A commit in either repository: the hook runs the repository's `also=` tools, the plan-scope tool among them, which compares the recorded verdict with the plan's hash and the working tree's hash.

## Whole app
- Why: a photograph opening in two stages and a strip that stops every control are the app's first minutes on the device, and the cause is work the page does that a worker already does elsewhere in the app. Moving it changes what the decode worker does and holds, the tile's cache key and stamp, the preview version, and the report.
- What would make it wrong:
  - A worker tile that differs from the page tile. Tested: a byte comparison on the practice set, made to fail once, then the walks that compare tiles with opens.
  - A device with no worker losing its strip or its sky. Tested: the page path stays, and a walk with the worker refused draws tiles and the sky.
  - Memory: a tile job holding a second full frame beside the decoded one. Tested by reading the worker's allocations in step 2, and by the pool-budget check in step 7.
  - The before and after numbers not being comparable, because the frame watch stops after a minute. Tested: step 1 records its own frame count over the whole session beside the watch's number.
  - The hub's narrowed read fence holding the main thread out of the doctrine. Tested: the doctrine read is a case in step 10.
  - The narrowed fence latching the main thread on a stray read. Tested: step 10's case states the latch, and the report names every read the fence refused while the plan ran.
  - A staging site that deployed an older commit. Tested: step 9 reads the worker's cache name against the pushed SHA.

## Leaves open
- Line numbers in the Carried section have moved by a few lines; step 1 reads by name.
- The scratch entries in Commands name `/tmp/claude-0/`, the scratchpad root of the container this plan was written in. If the new session's scratchpad is elsewhere, it changes those entries, and step 14's, to its own path before it proposes the plan; that is authoring, not amendment.
- The new session copies this file into its plans folder and proposes that copy; nothing here is approved yet.
- The hub must sit beside the app repository, because the app's plan-scope door calls the hub's gate at the path beside it.
- Promotion of staging to production waits for the owner's go after the device pass and is not in this plan. The sweep's JPS half runs after it.
- The pictures at the end are the owner's choice and come back as the plan's last message; they are not a step.
- A refusal on the main thread still latches until the owner's next message. Under step 10 that includes a stray read of an app file, which is two rules meeting: a refusal latches (Doctrine §0d), and a failure found on the way is handled by the main thread and never handed back (goal 5). Step 10 builds the first as written. The conflict and one suggestion go to the owner once, in the last message: that a refused read be a fifth refusal that does not latch, since a read changes nothing.
- Building, testing and running a scratch harness execute code, and no hook sees inside a script it lets run.
- A host the session cannot reach (the Drive link behind `tools/owner-images.mjs`, the package registry) is named in the report with the exact hosts and asked about, never reported as the data being absent.

## Files
- JPS, new: `src/tile.ts` (new), `docs/decisions/` (a record, only if the decisions check asks for one)
- JPS, changed: `src/main.ts`, `src/decode.worker.ts`, `src/decodeClient.ts`, `src/skyClient.ts`, `src/sky.worker.ts`, `src/skyfine.ts`, `src/sky.ts`, `src/skymap.ts`, `src/localmap.ts`, `src/pipeline.ts`, `src/gl.ts`, `src/look.ts`, `src/diagnostic.ts`, `src/previewcache.ts`, `tools/.preview-pipeline`, `tools/fresh-dist.mjs`, `tools/switch-instrument-walk.mjs`, `tools/look-sheet.mjs`, `.third-person-allow`, `.contract-allow`, `docs/ARCHITECTURE.md`, `NOTES.md`, `.plan-scope`, `.claude/PLAN`
- Hub, changed: `hook-dispatch.mjs`, `session-guards.test.mjs`, `DOCTRINE.md`, `CLAUDE.md`, `.plan-scope`, `.claude/PLAN`

## Verification
- The app: step 7 passes the build, every commit tool, the walks that compare tiles with opens, the after measurement beside the before, and every walk in parts with the red ones compared to the parent; step 8 records IN-SCOPE; step 9 reads the remote's staging at the pushed commit, Gates and Deploy for that SHA, and the staging worker naming it.
- What needs the owner's hands on the device: a photograph opening in one stage on the iPad, the controls answering while the strip draws, and the new report line. The headless numbers say the page is freer; only the device says it is free enough.
- The hub: step 11 passes the suite, every plant is caught, and the four document gates and the lessons check pass; step 12 records IN-SCOPE; step 13 reads the remote's main at the pushed commit, the clone at the same, and each CI run's conclusion.
- The handoff: the first status after approval prints the goals and `next: step 1`.
