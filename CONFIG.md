# The configuration baseline

This file lists every configuration item of the hub, with its state as read on 2 November 2026, how it was read, and the item of `PROGRAM.md` that may change it. A change to any item below is a program item first (P-6). A difference found between this file and the tree is a finding, and a finding becomes an item. An open dependency update is an item (P-31 to P-34).

Commit and action pins are cut to six characters in this file, so the file never restates a full pin that a reader could mistake for a verified one. The full values are in the files named beside each.

## How it was read

- The hub's own settings, workflows, hook scripts and requirements file were read with the Read tool, and the files at the hub root were counted with the Grep tool. A line count is the number of lines Grep reports for a pattern that matches every line.
- The user-level settings file at `/root/.claude/settings.json` was read with the Read tool. It is outside the repository and is not tracked.
- Branch protection, the branch tips and the open pull requests were read through the connector's branch and pull request listings on 2 November 2026.
- Sibling repositories were not opened. Their pins and callers are the ones `REPOS.md` states, with its dates.
- Nothing in this file was changed by reading it.

## 1. Hooks

Three layers wire hooks and they stack: the project layer, the user layer, and the git layer.

### 1.1 Project hooks, in `/home/user/noahjefferson/.claude/settings.json`

Three events are wired.

- SessionStart runs `.claude/hooks/session-start.sh`. That script prints `session-brief.mjs`, then runs `branch-guard.mjs --install` with its output discarded. Every command in it ends in a form that lets the script go on, so it fails open. It does not clone the hub to the user-level path, which is why a fresh container runs with no dispatcher until a plan's first step installs it (Q-HUB-126). Changed by: P-50 (Q-HUB-126), and P-17.
- Stop runs `.claude/hooks/stop-guard.sh`, which runs `../noahjefferson/stop-guard.mjs` and exits 0 when that sibling path does not exist, so it fails open. Changed by: P-4 (the reply-prose refusals run only under an approved plan), with P-19 and P-20 for the harness mechanisms that may replace parts of it.
- PreToolUse, matcher `.*`, runs `.claude/hooks/plan-guard.sh`, which pipes the call into `./plan-guard.mjs` or `../noahjefferson/plan-guard.mjs`. It fails closed, but only when the session is in plan mode and the guard file cannot be found. Changed by: P-3 (the step shape is refused at the plan check), with P-4.

### 1.2 User hooks, in `/root/.claude/settings.json`

The file is written by `node /root/.claude/hub/hook-dispatch.mjs --install`, run from the clone at `/root/.claude/hub`. It wires nine events, each with one command, `node "/root/.claude/hub/hook-dispatch.mjs"` followed by the event name, an empty matcher and a timeout of 120 seconds.

- SessionStart, UserPromptSubmit, PreToolUse, PostToolUse, PostToolUseFailure, Stop, PreModelSwitch, PostModelSwitch and ConfigChange.
- PreModelSwitch answers allow with the switch's cost figures in a system message and writes a line to `status/switches.txt` in the session scratchpad; PostModelSwitch returns the tier line as added context and writes the same line. Neither blocks. The install's target file can be named by the environment variable `HOOK_DISPATCH_SETTINGS_FILE`, with the user-level file as the default. Changed by: P-18.
- ConfigChange appends one line to `status/config-changes.jsonl` in the session scratchpad for every change the harness reports to a settings file or a skill file, the sources being `user_settings`, `project_settings`, `local_settings`, `policy_settings` and `skills`: the time, the time in California, the source, the path or none, and whether this file names the path or its last segment. The status print lists each record newer than the last status. A change is recorded and never blocked, a `policy_settings` change among them, which the harness does not let a hook block; server-managed settings do not run the hook. A recorded change to a file this baseline names that no item of the program made is a drift, filed as a finding. Changed by: P-21.
- It also sets `showClearContextOnPlanAccept` to false.
- Every event runs the one file, `hook-dispatch.mjs`, which then runs the guards of every repository it finds under the launch directory, reading each repository's own `.claude/settings.json` hooks. So the project hooks of 1.1 and the dispatcher run on the same call.
- Guard files the dispatcher and its neighbours call, by name in the code: `pending-guard.mjs`, `report.mjs`, `plan-fence.mjs`, `plan-guard.mjs`, `approved-plan-guard.mjs`, `doctrine-read-guard.mjs`, `keep-info-guard.mjs`, `push-guard.mjs`, `drive-guard.mjs`, `reply-guard.mjs`, `stop-guard.mjs`, `compact-recall.mjs`, `transcript-tail.mjs`.
- The file exists in this container because a plan's first step installed it. In a fresh container it is absent until then.
- Changed by: P-4 and P-8 (which gates run and when), P-50 (Q-HUB-126, the install), P-21 (a ConfigChange hook would report a change to this file).

### 1.2a Synced skill reference files

- The harness syncs skill reference files into the user-level skills folder under `/root/.claude/`, outside the repository and untracked, and rewrites them without any item of the program making the change. The status of 21:32 California on 6 November read one that had been synced at 17:17 the same day, which this file did not name (Q-HUB-283).
- The synced skill reference files are baseline items of this file: the skill files under the user-level skills folder that a session reads, which the ConfigChange record reports with the source `skills`. Their state is the files as the harness last synced them.
- A recorded change to one of them (a ConfigChange line with the source `skills`) that no item of the program made is a drift, and is filed as a finding like any other difference between this file and the tree.
- Changed by: no item names them; a change enters as an item under P-6.

### 1.3 Git hooks

- `.githooks/pre-commit` is tracked and is generated by `branch-guard.mjs` from `.branch-guard`. It runs `example-check.mjs`, `privacy-check.mjs` and `plan-scope-check.mjs` in that order, each of which must exist and be executable or the commit is refused, and then refuses a commit on any branch but `main`.
- `.git/hooks/pre-commit` exists in this clone (found by Glob). It is the installed copy; its content was not compared with the tracked one in this step.
- `.branch-guard` says `work=main` and lists the three `also=` checks above.
- Changed by: no item names it. A change enters as an item under P-6. P-11 is the GitHub-side counterpart on the remote.

### 1.4 Hook events no setting wires

- The harness documents a ConfigChange hook and background task lists in the Stop hook's input (read 2 November 2026 at the maker's hooks page). The ConfigChange hook is served by the dispatcher and wired by its install (1.2), by P-21. The stop guard reads the task lists from its input as the Stop hook delivers them, so nothing is wired in a settings file for them (5 November 2026, P-19). The PreModelSwitch and PostModelSwitch hooks are served by the dispatcher and wired by its install (1.2), by P-18.
- Changed by: P-21 (ConfigChange), P-18 (the model-switch hooks), P-19 (the Stop input's task lists), P-20 (the Stop hook block cap).

### 1.5 The environment's own hooks the audit names

- The audit of 1 November 2026 names one: the cloud environment's git stop hook, which sent 42 stop-hook messages between 20:38 California time on 31 October and 16:35 on 1 November. It is wired from the environment's launcher settings, outside any repository. Where it is set is not known. Nothing in the repository wires or configures it.
- The audit names three harness behaviours that are not hooks and that act as configuration: the permission classifier that refuses an edit of the session's own permissions list (lesson 370), the approval prompt on a publish of an already published page, and the plan mode the harness restores at a resume.
- Changed by: P-12 (the git stop hook), P-13 (the classifier, as it bears on the permission rules), P-16 (the publish prompt), P-17 (plan mode at a resume).

## 2. Files at the hub root that run, refuse or are loaded

Line counts are from Grep on 2 November 2026. The refusal-site column of each entry is a proxy: the number of places that can refuse, not the number of distinct messages, and one site can build several messages. The method is written beside each count.

### 2.1 Session guards

The method for a file with a named refusal function: Grep counts the lines that call that function, and a definition line is taken off where the pattern matches it. These counts were redone in this step and equal the step 32 reading.

- `hook-dispatch.mjs`, 3614 lines. The dispatcher, the manager fence, the latch, the correction hold and the gates. Refusal sites 31: 22 lines with a call of `refuse(` and 9 with a call of `refusal(`. Changed by: P-4, P-7, P-8; P-2 for ejects; P-18 to P-21 may later replace parts of it; the findings P-47, P-48, P-131, P-135.
- `report.mjs`, 3103 lines. The status, the pointer, the status page, the approval marker reader and the agents' transcript reader. Refusal sites not counted, because it refuses through no one function. Changed by: P-2 (an EJECT state), P-19, P-52 (answered by P-10); the findings P-56, P-86, P-134.
- `plan-guard.mjs`, 919 lines. Refuses writes in plan mode and the plan check. Refusal sites 21: lines with a call of `deny(` or `denyShape(`. Changed by: P-3 (a step without its four labels is refused), P-8 (Q-HUB-124); the findings P-51, P-78, P-110, P-116, P-125.
- `approved-plan-guard.mjs`, 776 lines. Holds an approved plan's scope and writes the steps file and the marker. Refusal sites 9: lines with a call of `deny(`. Changed by: P-8 (Q-HUB-123); the findings P-47, P-65.
- `stop-guard.mjs`, 1156 lines. The Stop hook. Refusal sites 17: 14 calls of `refuse(` (the pattern matches 15 lines, one is the definition) and 3 lines with `process.exit(2)`, the third being the plant mode's. Changed by: P-4, P-2, P-19, P-20; the findings P-127, P-133, P-160.
- `plan-fence.mjs`, 585 lines. Holds each agent to the plan's Files and Commands. Refusal sites 14 as step 32 counted them, as returned refusal sentences. Not redone here, because no one pattern finds them. Changed by: P-8 (Q-HUB-122); the findings P-48, P-57, P-94, P-99, P-148.
- `pending-guard.mjs`, 395 lines. Refuses every call while an owner message sits undelivered. Refusal sites 3, carried from step 32 by the same method. Changed by: the findings P-59, P-121; the redesign plan keeps it running as it is (P-4).
- `keep-info-guard.mjs`, 286 lines. Refuses a commit that takes back what was read. Refusal sites 1, carried from step 32. Changed by: no item names it; the redesign plan keeps it running as it is (P-4).
- `doctrine-read-guard.mjs`, 263 lines. Holds the main thread to the doctrine read. Refusal sites 3, carried from step 32. Changed by: P-5; the findings P-92, P-103.
- `push-guard.mjs`, 346 lines. Only staging and main reach a remote. Refusal sites 18, carried from step 32 as returned refusal sentences; a Grep of the return lines naming a refusal finds 10 of them in this step, so the two methods differ and the carried figure stands until a method is written. Changed by: P-11 (branch protection may let part of it go), the finding P-74.
- `reply-guard.mjs`, 1483 lines. Turns a refused reply into a reading and a release command. Refusal sites 32, carried from step 32. Its tests are in `reply-guard.test.mjs`, 898 lines. Changed by: the findings P-90, P-96, P-98, P-112, P-114, P-115, P-118, P-145.
- `drive-guard.mjs`, 103 lines. Refuses Drive writes and whole-Drive searches. Refusal sites 6, carried from step 32. Changed by: the findings P-150, P-153, P-156.
- `branch-guard.mjs`, 358 lines. Refuses a commit on the wrong branch and generates the git hook. Refusal sites not counted. Changed by: no item names it; P-11 is its remote-side counterpart.
- `compact-recall.mjs`, 221 lines, and `transcript-tail.mjs`, 206 lines. Readers for the guards. They refuse nothing. Changed by: P-17, and for the first, the finding P-137.
- `session-brief.mjs`, 368 lines. Prints the brief at a start. Changed by: P-5.
- `session-cost.mjs`, 408 lines. The cost instrument. It is tracked now; the step 32 reading found it untracked at 395 lines. Changed by: P-10.
- `session-guards.test.mjs`, 9056 lines. The suite and its plants. Changed by: every item that changes a guard adds its cases here; P-54, P-105, P-163, P-164 and P-169 are findings against the runner.

Sum of the refusal sites counted: 31 + 21 + 9 + 16 + 14 + 3 + 1 + 3 + 18 + 32 + 6 = 154 across 11 files, the same total as step 32.

### 2.2 Files of rules and records that sessions read

- `agent-rules.md`, 30 lines, 14 rule lines, Rules version 4. Changed by: P-3, and only in the last step of the redesign plan.
- `aim-review.md`, 231 lines. The review's method. Changed by: P-1 and P-3 (the review reads Facts, Observe and Kill against the plan's goal and writes its own wall line).
- `DOCTRINE.md`, 2776 lines, read whole at every start. Changed by: P-5.
- `CLAUDE.md`, 1477 lines, loaded into every session. Changed by: P-5, and the parked item for its list that the redesign plan's last steps add.
- `LESSONS.md`, 564 lines, and `lessons/`, the lesson files. Changed by: no item names them; a lesson is appended as it is learned.
- `NOTES.md`, 135 lines, and `REPOS.md`, 495 lines. Changed by: P-7 for the Found queue, which moves to a folder; REPOS.md by P-35 to P-43 as the siblings are read.
- `PROGRAM.md`, 1496 lines. Changed by: each plan's close.

### 2.3 Gate and tool scripts that are not session guards

Line counts only. Changed by: no item names them unless a finding is listed; a change enters as an item under P-6.

- `palette-check.mjs` 388, `pwa-check.mjs` 263, `gate-args.mjs` 85, `docs-check.mjs` 153, `handoff-check.mjs` 341, `lessons-check.mjs` 402, `example-check.mjs` 177, `svg-check.mjs` 298, `binary-files.mjs` 33, `doctrine-sync.mjs` 210.
- `a11y-gate.mjs` 440, `a11y-scan.mjs` 42, `a11y-detail.mjs` 34, `scripts/check-textsize.mjs` 66.
- `privacy-check.mjs` 152, `privacy-history-check.mjs` 144, `privacy-mirror-check.mjs` 99, `privacy-patterns.mjs` 254, `third-person-check.mjs` 297, `quote-check.mjs` 288. Findings: P-152 (the privacy and third-person checks list tracked files and so miss untracked ones), P-89 (the quote check and the docs check count markdown differently).
- `pin-check.mjs` 103. Finding: P-72.
- `hub-pin-check.mjs` 157, `hub-gates-local.mjs` 126. Finding: P-167.
- `plan-scope-check.mjs` 426. Findings: P-61, P-81, P-91.
- `cf-analytics.mjs` 1526, `inline.mjs` 13, `render-icons.mjs` 13, `render-og.mjs` 15, `render-preview.mjs` 20, `render-social.mjs` 18, `render-standalone.mjs` 13.

The files in 2.1 and 2.3 and `reply-guard.test.mjs` are all 50 `.mjs` files of the hub, 31011 lines in all, as Grep reports them.

### 2.4 Allow lists

- `.example-allow` and `.quote-allow` exist at the hub root. `.third-person-allow` and `.doctrine-sync` do not exist there. Changed by: no item names them.

## 3. The agent rules version

- Rules version 4, in `/home/user/noahjefferson/agent-rules.md` and in the live clone's copy at `/root/.claude/hub/agent-rules.md`, both read in this step. The approved plan's Rules line pins version 4.
- The live clone is not pulled by the redesign plan. The next plan's first act is that pull.
- Changed by: P-3. The file changes only as the last act of the redesign plan, from the draft its step 55 writes, which raises the version to 5.

## 4. Pins

### 4.1 Action pins under `.github/workflows/`

Seven workflow files hold 17 `uses:` lines of three actions. Each is pinned by a full commit and tagged in a trailing comment. Counts are Grep's lines.

- `actions/checkout`, pin 3d3c42, tag v7.0.1: 8 uses. They are in `a11y.yml`, `cf-analytics.yml`, `branch-sweep.yml`, `deploy.yml`, `deploy-myfax.yml` and `doctrine.yml` once each, and in `hub-gates.yml` twice. No update is open for it. Changed by: no item names it.
- `actions/setup-node`, pin 820762, tag v7.0.0: 4 uses, in `a11y.yml`, `cf-analytics.yml`, `doctrine.yml` and `hub-gates.yml`. An update to v7.1.0 is open as pull request 13. Changed by: P-32.
- `cloudflare/wrangler-action`, pin ebbaa1, tag v4.0.0: 5 uses, two in `deploy.yml` and three in `deploy-myfax.yml`. An update to v4.1.3 is open as pull request 10. Changed by: P-34.
- The triggers of the seven files are carried from the step 32 reading and not re-read: `a11y.yml` on a push to main, a pull request and a dispatch; `cf-analytics.yml` on a dispatch; `branch-sweep.yml` on a dispatch and as a called workflow; `hub-gates.yml` as a called workflow only; `deploy.yml` on a push to main and a dispatch; `doctrine.yml` on a push to main and to `claude/**`, a pull request and a dispatch; `deploy-myfax.yml` on a dispatch.
- The shared gates workflow runs its gates on Node 22 by default. `.github/zizmor.yml` is the security audit's configuration.

### 4.2 The tool pin in `.github/requirements-ci.txt`

- `zizmor==1.29.0` with 11 hashes listed (11 `--hash` lines). It is installed by `doctrine.yml` and `hub-gates.yml` with hashes required. An update to 1.31.1 is open as pull request 14. Changed by: P-31.

## 5. Dependabot

- `.github/dependabot.yml` watches three ecosystems, each on a monthly interval: `github-actions` at the root, `pip` at `/.github`, and `npm` at the root with one group named tooling that takes every pattern. The commit prefix is `Keep a build tool up to date` and the label is `dependencies`.
- Open updates, as the connector listed them on 2 November 2026, all by Dependabot and none a draft:
  - 14, created 1 November: zizmor 1.29.0 to 1.31.1. Item P-31.
  - 13, created 1 November: actions/setup-node 7.0.0 to 7.1.0. Item P-32.
  - 12, created 1 October: the tooling group, two npm updates. Item P-33. Open 32 days.
  - 10, created 1 October: cloudflare/wrangler-action 4.0.0 to 4.1.3. Item P-34. Open 32 days.
- The schedule is changed by: no item names it. A change enters as an item under P-6. No gate refuses a dependency update that stands open.

## 6. Permission rules of the hub's settings

`/home/user/noahjefferson/.claude/settings.json` holds 21 entries in `permissions.allow`, on lines 4 to 24 of the file.

- The page tool, as the bare name `Artifact`.
- Git: `status`, `diff`, `log`, `add`, `commit`, `push`, `ls-remote`, `fetch`, `worktree add`, `merge --ff-only` and `pull --ff-only`, each as a prefix rule.
- Two build rules naming a sibling repository or the scratchpad: an npm run in the Jefferson-Photography-Studio folder, and an npm install in a worktree under the scratchpad.
- Node: any file in the Jefferson-Photography-Studio `tools` folder, `plan-scope-check.mjs`, `reply-guard.mjs --read`, anything under `/tmp/claude-0/`, and `--check`.
- Python: `-m http.server`, and `-I -m zipfile`.

Two of the rules name a sibling repository's path, which a session holding the hub alone cannot use. One is the bare tool name `Artifact`. P-13's acceptance excludes a bare tool rule, a wildcard alone and a rule for a whole program. A session cannot change this list for itself, because the permission classifier refuses the edit (lesson 370). Changed by: P-13.

## 7. Branch protection

As the connector's branch listing reports it on 2 November 2026, six branches, and every one reports protected as false.

- `main`, tip 7f49f6.
- `claude/solve-ent-algebra-trainer-exnzy7`, tip 6db821. A session branch from a sibling's work that sits on the hub's remote. Item P-168.
- Four Dependabot branches: `dependabot/github_actions/actions/setup-node-7.1.0` (9b44fc), `dependabot/github_actions/cloudflare/wrangler-action-4.1.3` (2edb68), the npm tooling group's branch under `dependabot/npm_and_yarn/` (a98f0b) and `dependabot/pip/dot-github/zizmor-1.31.1` (710e0a).

Because `main` is unprotected, the barriers to a push to main are `push-guard.mjs`, the plan gates and the hub's pre-commit hook; GitHub enforces none. Changed by: P-11. Whether a session or the owner can set it from a tablet was not read.

## 8. Each sibling's hub pin and sweep caller, as `REPOS.md` lists them

`REPOS.md` states how each repository wires the hub's gates, with its own dates (August to October 2026). It states no pin value for any sibling. No sibling workflow was read in this step. The instruction file's census of 4 September 2026 disagrees with `REPOS.md` for three repositories, and each program item states both.

- Quietkeep: the Spine plus the hub's privacy check and the privacy mirror check, checked out and run. Sweep caller owed. Item P-35.
- fauxplane: `deploy.yml` checks the hub out and runs the privacy check, the quote check and the branch guard in artefact form. Sweep caller owed. Item P-36.
- 3d-printing-pal: `gates.yml` checks the hub out and runs the same set. Sweep caller owed. Item P-37.
- Intersecting-parallels: `security.yml` checks the hub out at `main`, a moving reference. Sweep caller owed. Item P-38.
- photo-pointer: `ci.yml` has a hub checkout pinned by commit. The docs check is not in its CI. Sweep caller owed. Item P-39.
- MoleBridge: `gates.yml` checks the hub out pinned by commit. Sweep caller owed. Item P-40.
- Cv-Thalweg: `gates.yml` calls the hub's shared gates workflow, pinned by commit. Sweep caller owed. Item P-41.
- solve-ent: `gates.yml` checks the hub out pinned by commit. Sweep caller owed. Item P-42.
- Jefferson-Photography-Studio: `gates.yml` calls the shared gates workflow, pinned by commit, with the PWA check on. Its sweep caller is on its `main`. Its `deploy.yml` does not wait on the gates and its `main` is unprotected. No pin or caller item; branch protection is P-11.
- Jefferson-Line: not on the family list in `REPOS.md`. It owes the sweep caller and owes dropping its own copies of the pin check and the local gate runner. Item P-43.
- The hub's own sweep: the hub dispatches `.github/workflows/branch-sweep.yml` itself and holds no caller.

A pin that is not a commit the hub's `main` reaches runs the gates out of an older tree. Checking each pin against the hub is the work of P-35 to P-43, each in the sibling's own session. Changed by: P-35 to P-43.

## 9. Differences from the step 32 reading

Three facts differ, each read in this step and not by assumption.

- The hub's settings hold 21 allow entries, counted on lines 4 to 24 of the file. The step 32 reading and P-13 say 20.
- The remote's `main` was at 80197b when step 32 read it and is at 7f49f6 now, the commit that added the redesign record and the cost instrument. The local `main` is one commit ahead of the remote: the program file.
- `session-cost.mjs` is tracked and is 408 lines. Step 32 found it untracked at 395.

Everything else listed in section 2 matched on line count, and every refusal count that has a named function matched on count.
