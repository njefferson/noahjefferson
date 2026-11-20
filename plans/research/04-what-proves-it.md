# What proves it: every check and where it runs

Made by a step of the research page drawn on 19 November 2026. It records and recommends nothing. The documentation it cites was saved by that page's first step on the day it ran, and the commit that holds this file dates it.

## What the part is for

- The hub's checks exist so that a rule is held by something that exits non-zero and not only by prose. Source: .github/workflows/doctrine.yml:5
- The hub's landing procedure asks for the eight checks, the suite where code changed, a checker's pass of the exact commit, one push of main, and a read of every workflow run for that commit by name. Source: .claude/skills/landing/SKILL.md:11
- The short page says a checker that did none of the work opens the real output and judges it against the stated result, and that nothing is pushed until it has passed the exact commit. Source: plans/native/page.md:36
- The short page says a check is stated in the piece's page as who opens the real output, and against what. Source: plans/native/page.md:31
- The record of the redesign lists, among what failed under the old controls, a cases-only suite run reported as the full suite. Source: archive/plans/redesign-record.md:111
- The record also lists two steps that changed tests to fit a change and came back DONE under a rule that lets a failed command run again after a write. Source: archive/plans/redesign-record.md:112
- The suite's own head comment says it is fed shaped transcripts and real git repositories, and that a plants run takes each check out of a copy so that a case naming it must then fail. Source: session-guards.test.mjs:3
- The short page says a repository's gates retired on 12 November 2026 no longer refuse, so nothing stops a session that breaks the behaviour they asked for. Source: plans/native/page.md:64

## What is there today

- A check runs in one of three places: in a session, at a commit, or on GitHub. Source: this step's reading of .claude/skills/landing/SKILL.md, .branch-guard and .github/workflows/doctrine.yml
- In a session, the push guard refuses a push of staging or main unless an agent that changed nothing handed back CHECK PASS and the full id of that exact commit. Source: push-guard.mjs:34
- The push guard reads that pass from the agents' transcripts and never from a file an agent could write, and a transcript that cannot be read is no pass. Source: push-guard.mjs:40
- The push guard passes a checker's own file in the session's scratchpad and counts no pass from an agent that ran git commit, git add or git push. Source: push-guard.mjs:38
- In a session, the stop guard runs once on the main thread, and an agent's stop does not run it. Source: session-guards.test.mjs, case name beginning dispatch Stop, printed by the run of node session-guards.test.mjs in this step
- The stop guard refuses at most twice in one chain of stops, and the third stop passes with one line saying so. Source: session-guards.test.mjs, case name beginning stop guard: it refuses at most twice, printed by the run of node session-guards.test.mjs in this step
- At a commit, the commit-msg hook that branch-guard.mjs installs refuses a message holding a trailer, a chat link or a model's name. Source: session-guards.test.mjs, case name beginning step114, printed by the run of node session-guards.test.mjs in this step
- The hub's `.branch-guard` names work=main and three repository-local checks run by also=: example-check.mjs, privacy-check.mjs and plan-scope-check.mjs. Source: .branch-guard:2
- The hub's reference page says each also= check runs on every commit, and that a declared check that is missing or not executable is a failure and never a skip. Source: HUB-REFERENCE.md:241
- The hub's reference page says msg-also= names a check that reads the commit message and runs after the hub's own refusals, and that a non-zero exit refuses the commit. Source: HUB-REFERENCE.md:249
- On GitHub the hub has seven workflow files: a11y.yml, hub-gates.yml, deploy.yml, branch-sweep.yml, deploy-myfax.yml, cf-analytics.yml and doctrine.yml. Source: the Glob of .github/workflows run in this step
- doctrine.yml runs on a push to main or to a claude/ branch, on a pull request and on request. Source: .github/workflows/doctrine.yml:29
- doctrine.yml runs these in order: the lessons check, the suite and then the suite's plants, the rules-keep check against the commit before the push, the docs check, the privacy check, the quote check, a workflow security audit, the pin check, the palette check, and the checklist of steps no script performs. Source: .github/workflows/doctrine.yml:60
- doctrine.yml fetches the whole history so that the rules-keep check can read the commit before the push. Source: .github/workflows/doctrine.yml:48
- doctrine.yml runs the checklist step even after an earlier step failed. Source: .github/workflows/doctrine.yml:144
- hub-gates.yml is a reusable workflow that an app calls with a pin, and its inputs are facts about the app. Source: .github/workflows/hub-gates.yml:12
- hub-gates.yml reads the pin out of the calling workflow's own file, requires exactly one 40-character commit, and checks out the hub at that commit. Source: .github/workflows/hub-gates.yml:146
- hub-gates.yml runs the branch guard in its artefact form, the privacy check, the quote check, the docs check, the pin check and the svg check on every call. Source: .github/workflows/hub-gates.yml:178
- hub-gates.yml runs the third-person check and the example check by default, and the privacy-mirror, pwa, palette, text-size and zizmor steps only where the caller's input asks. Source: .github/workflows/hub-gates.yml:201
- The running page says an app's CI runs the hub's checks at the hub commit that app pins, and moves when that pin is moved. Source: plans/native/running.md:81
- a11y.yml runs the accessibility gate on a push to main, on a pull request and on request. Source: .github/workflows/a11y.yml:11
- deploy.yml deploys the site on a push to main and on request, and it runs no check of the hub. Source: .github/workflows/deploy.yml:11
- deploy-myfax.yml and cf-analytics.yml run only on request. Source: .github/workflows/deploy-myfax.yml:22
- branch-sweep.yml is a dry run unless its delete input is true. Source: .github/workflows/branch-sweep.yml:28
- The suite has 157 cases and ended `157/157 passed`, with `RED CASES: none`. Source: node session-guards.test.mjs --out of the scratchpad's suite-now.txt, run in this step
- The same run printed that 1,256 tracked files were watched and no case changed one, and that 0 of 157 cases ended in a bare true. Source: node session-guards.test.mjs --out of the scratchpad's suite-now.txt, run in this step
- The suite has 345 planted failures, listed by file: session-guards.test.mjs 52, hook-dispatch.mjs 145, push-guard.mjs 37, program.mjs 35, stop-guard.mjs 18, rules-keep-check.mjs 10, and 17 other files with 48 between them. Source: node session-guards.test.mjs --plants --dry, run in this step
- The dry listing says a run would run 345 of the 345 listed and skip 0 as stale. Source: node session-guards.test.mjs --plants --dry, run in this step
- The dry listing names one ambiguous plant, wq_stop_text in hook-dispatch.mjs, whose find stands in two places, and one stale by design, bare_source_read in session-guards.test.mjs. Source: node session-guards.test.mjs --plants --dry, run in this step
- The suite's file list at its head names 27 files, and its comment names 16 case files under guard-cases/. Source: session-guards.test.mjs:52
- A plain run copies the checkout and runs in the copy, ends with its red cases and then the count, and says in its last lines that the plants were not run. Source: session-guards.test.mjs:15
- A plants run puts at most 25 plants in one process unless the environment says otherwise. Source: session-guards.test.mjs:27
- A run on 18 and 19 November of the whole suite took about one minute with 157 cases, and a run of every planted failure about five minutes with 345. Source: the words read by the managing session on 19 November 2026
- The landing procedure runs the cases and then the plants as two commands in the foreground, and says a change to a guard file runs both before a push. Source: .claude/skills/landing/SKILL.md:20
- The landing procedure names eight checks: docs, lessons, quote, privacy, third-person, example, pin and rules-keep. Source: .claude/skills/landing/SKILL.md:12
- The landing procedure says a push is not a release, and that the gates, the deploy, the accessibility gate and the code scan are each read by name as concluded or still running. Source: .claude/skills/landing/SKILL.md:24
- The landing procedure asks that findings be filed with the ranked list's own tool before the commit and after the checks. Source: .claude/skills/landing/SKILL.md:25
- The hub's own rules in SECURITY.md say a check can be required on a branch only if it already ran on that commit somewhere else, and that a repository with one branch can have no required checks. Source: SECURITY.md:113
- The hub's cost record states figures by event for three acts and ten older entries, and says no dollars are known for one plan. Source: plans/native/cost.md:178
- The ledger's fields say what the old page named as the enforcer of a rule, whether the rule is carried, partial or dropped, and the live line where one was found. Source: plans/rules-ledger/index.md:159
- The ledger counts 1,390 rules read, 244 kept whole, 182 kept in part and 964 dropped, and of the 1,146 not kept whole 648 name an enforcer. Source: plans/rules-ledger/index.md:15
- The ledger's by-page counts are: CLAUDE.md 206 kept, 52 in part, 186 dropped; doctrine/plans.md 19, 51, 316; seed-template.md 4, 18, 127; CONFIG.md 2, 24, 118; HANDOFF.md 1, 22, 104; agent-rules.md 6, 9, 45; aim-review.md 0, 2, 58. Source: plans/rules-ledger/index.md:24
- The ledger counts 187 things the hooks told a session, of which 51 are still told, 54 told in part and 82 no longer told. Source: plans/rules-ledger/index.md:20

## What was there before the rebuild

- The suite's head comment at the commit before the rebuild named the guards of LESSONS 376, with the same three modes: every case, plants, and a case filter. Source: 4ea3157:session-guards.test.mjs:3
- That comment lists as covered the pending-guard, keep-info-guard, compact-recall, the manager's gates, the state-claim gate, the plan fence, the approved-plan guard and the doctrine-read guard. Source: 4ea3157:session-guards.test.mjs:41
- That comment records that the suite's case files under guard-cases/ were one per guard file, and that a plants run narrowed to a file runs its plants wherever they are written. Source: 4ea3157:session-guards.test.mjs:24
- That comment records that a plants run names every stale plant before it runs and repeats every missed or stale plant in its last lines. Source: 4ea3157:session-guards.test.mjs:37
- The commit before the rebuild had plan-land.mjs, which landed a plan as one command with three verbs: prove, commit and push. Source: 4ea3157:plan-land.mjs:5
- Its prove verb committed nothing, ran every stage whatever an earlier one showed, and wrote each stage's print to a file. Source: 4ea3157:plan-land.mjs:15
- Its push verb fetched, rebased, counted, pushed as a fast-forward, read the remote and pulled a clone. Source: 4ea3157:plan-land.mjs:19
- plan-land.mjs is listed in the file of retired files and is not in the checkout today. Source: archive/RETIRED-FILES.txt:13
- The record of the redesign counted the cost of the old controls by event, among them 78 stop-hook refusals in 67 stops over one session. Source: archive/plans/redesign-record.md:342
- The record says its instrument cannot see refusals printed at prompt time, reviews told apart from step agents, or a resume whose start hook did not run. Source: archive/plans/redesign-record.md:354
- The ledger's index says it holds the pages of the old way and checks each rule against a live page, and that a doubt counted as dropped. Source: plans/rules-ledger/index.md:9
- The ledger records the size and time of the suite before the rebuild nowhere in its index. Source: this step's reading of plans/rules-ledger/index.md

## What the documentation says

- The best-practices page says Claude is often wrong about being done because it has no way to check its own work, and advises giving it a check to run. Source: docs:best-practices, Give Claude a check to run
- The best-practices page says a line in the instruction file such as always typecheck works most of the time and not every time, and that a Stop hook enforces it. Source: docs:best-practices, line 160 under the instruction file example
- The best-practices page says a Stop hook runs a script when Claude tries to end its turn, and exit code 2 sends Claude back to work with the script's stderr as the reason. Source: docs:best-practices, Enforce the check with a Stop hook
- The best-practices page says the turn does not end until the check passes or the block limit is reached. Source: docs:best-practices, Give Claude a check to run
- The best-practices page advises asking for evidence, the command run and its output, and says a bare statement that all tests pass tells you very little. Source: docs:best-practices, Give Claude a check to run
- The hooks-guide page says the harness overrides a Stop hook after it blocks eight times in a row with no tool call in between, and advises reading the stop_hook_active field. Source: docs:hooks-guide, Stop hook hits the block cap
- The hooks page says exit code 2 on a Stop hook sends Claude back to keep working, and that exit code 2 on an event for something already done cannot prevent it. Source: docs:hooks, Exit code 2 behavior per event
- The hooks page says a JSON field that sets continue to false on a Stop event takes precedence over exit code 2. Source: docs:hooks, Exit code 2
- The hooks-guide page says hook timeouts vary by type and can be set per hook in seconds. Source: docs:hooks-guide, timeout field under hook behaviour
- The workflows page says a run takes no input once started, and that for sign-off between stages each stage runs as its own workflow. Source: docs:workflows, Behavior and limits
- The workflows page says a run is limited to 16 concurrent agents by default, 4,096 items in one parallel or pipeline call, and 1,000 agents in total. Source: docs:workflows, Behavior and limits
- The workflows page says an agent's report of a claim it could not check is listed as unverified and not counted as refuted. Source: docs:workflows, Run a bundled workflow
- The github-actions page says the Claude Code action runs on GitHub-hosted runners that consume GitHub Actions minutes, and that each interaction consumes API tokens. Source: docs:github-actions, Manage costs
- The code-review page says a review never approves or blocks the pull request, so the decision to merge stays with the team. Source: docs:code-review, opening summary
- The code-review page says a review runs on Anthropic infrastructure, reads the repository read-only, posts a check run, and works from the diff without building or running the code. Source: docs:code-review, What a review can access
- The code-review page says a review follows REVIEW.md from the base or default branch and never from the pull request's own changes. Source: docs:code-review, Who controls a review
- The costs page says agent teams spawn instances that each have their own context window and that token use scales with teammates and how long each runs. Source: docs:costs, Agent team token costs
- The costs page says the cache line it describes covers the main conversation only and not subagents. Source: docs:costs, Using the /usage command
- The checkpointing page says a file only a Bash command changed is not tracked, and that edits made by a subagent are usually not restored by a rewind. Source: docs:checkpointing, Limitations
- The checkpointing page says checkpoints are for quick session-level recovery and are not a replacement for version control. Source: docs:checkpointing, Not a replacement for version control

## What is not known

- What the suite's time and size were before the rebuild is not recorded in the sources named for this file: the head comment of the old suite, the redesign record's sections 3 and 7, SECURITY.md, HUB-REFERENCE.md and plans/native/cost.md hold no count of cases, plants or minutes for it. Source: this step's reading of those files
- Whether doctrine.yml's last runs on GitHub passed is not known from this reading, because the workflow runs were not read. Source: this step's reading, which opened no workflow run
- Whether any required check or ruleset stands on the hub's main is not known to this step, which read no GitHub interface file. Source: this step's reading, with file 07-github.md holding that question
- What any app's own checks and CI run is not known, because the apps' repositories are not read from this session. Source: this step's reading of plans/native/running.md:81
- How long each of the eight checks takes is not known, because no source gives a time for one and this step timed none. Source: this step's reading of .claude/skills/landing/SKILL.md
- Whether a check run on GitHub for a commit is the same as the same check run in a session at that commit is not stated by any source read. Source: this step's reading of .github/workflows/doctrine.yml
- What the ledger records of what holds a rule today beyond the live line where one was found is not stated: its fields name the old enforcer and a live quote and no present-day check. Source: plans/rules-ledger/index.md:159

## Found

- doctrine.yml names the lessons, rules-keep, docs, privacy, quote and pin checks and the suite, and does not name the third-person check or the example check, which the landing procedure names among its eight. Source: .github/workflows/doctrine.yml:60 against .claude/skills/landing/SKILL.md:12
- The hub's `.branch-guard` names plan-scope-check.mjs as a check run on every commit, and the suite has a case saying that script prints one line saying it was retired on 12 November 2026 and exits 0. Source: .branch-guard:5 against the printed case name beginning shell plan-scope-check.mjs
- The harness's Stop-hook cap is eight blocks in a row, and the hub's stop guard says it refuses at most twice in one chain. Source: docs:hooks-guide, Stop hook hits the block cap, against the printed case name beginning stop guard: it refuses at most twice
- The dry listing of the plants names one plant whose find stands in two places, where a run takes out the first place only, and one plant stale by design that no running case can catch. Source: node session-guards.test.mjs --plants --dry, run in this step
- doctrine.yml's comments say the hub is a main-only repository, and the research page says GitHub lists two branches of the hub. Source: .github/workflows/doctrine.yml:26 against the words read by the managing session on 19 November 2026
