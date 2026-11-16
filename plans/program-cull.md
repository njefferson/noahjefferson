# The ranked list culled after the rebuild

This record holds the cull of the ranked list in PROGRAM.md after the hub was rebuilt on 12 November 2026. It was approved on 13 November 2026. It keeps the approved page, what the run showed, every one of the 350 items that were not done in one of three lists with its reason, the counts, and what stands, grouped by repository, as the input to the next page.

## The approved page

## The ranked list culled after the rebuild

Approving this starts the run. Nothing has been changed so far. The reads were made on 13 November 2026 between 05:48 and 05:54 California time, read from the clock. The checkout is on main at the remote's head, f92b47b, and its four workflow runs ended in success.

### What is

- `PROGRAM.md` holds 597 items. 248 are done. 350 are not: 274 open, 74 parked and 2 answered. Of the 350, 325 are findings, 8 are knowledge layers, 9 are siblings owing a pin or a sweep caller, 7 are parked settings and 1 is a harness item.
- 556 items are the hub's. About 40 name an app or something outside any repository. The app repositories are not in this session.
- The findings name the file each is to be fixed in. Many of those files are gone: the fifteen in `archive/RETIRED-FILES.txt`, and others such as `plans/seed-template.md`, `doctrine/plans.md` and `CONFIG.md`. Others stand but were rewritten small on 12 November, the dispatcher above all, which 28 findings name.
- The list's own head still describes the old way: six states, three ejects, the wall question and the rank. Two items already carry a state outside the six, "answered", written by hand.
- `program.mjs` has a verb that sets an item done, and none that closes one unbuilt. Done means the acceptance was observed, which is not true of a moot item. The tool reads any state word, so a new word needs no change to code.
- Nothing in the suite or in the seven checks reads the real `PROGRAM.md`. The suite's cases write their own.
- `found/` is the record of findings and nothing reads it as a queue.

Taken as read: the backlog meant is the list's 350 items that are not done, with their findings files. Nothing else is sorted.

### Why

The list's rule is that the next item taken is the highest in rank that nothing blocks. Most of what ranks today is about machinery retired on 12 November, so a way forward drawn from it now would rank dead work. The cull comes first, and the way forward is planned from what stands, on its own page.

### 1. The result

Two files on the hub's main, no code:

- A record, `plans/program-cull.md`. It holds this page as approved, the sorting rule, and every one of the 350 keys once, in one of three lists, each key on one line with its reason. It ends with the counts, which add to 350, and with what stands, grouped by repository, the parked items that wait on the owner set apart. That last part is the input to the next page.
- `PROGRAM.md`, changed in three ways and no other:
  - Each moot item's state word becomes `retired`.
  - Each moot item gains one line under its repository line, opening `Retired:`, saying what was looked for and not found.
  - The states part of the head gains one line saying what retired means and naming the record.

No item is deleted. No acceptance, title, rank or dependency changes. `found/`, `LESSONS.md`, `program.mjs` and the rest of the list's head are not touched.

#### The sorting rule

- **Moot.** The thing the item is about no longer exists. Either the file it names is in `archive/RETIRED-FILES.txt` or absent from the tree, or the file stands and the function, switch, section or behaviour the acceptance names is not in it. The reason names what was searched for and that it was not found.
- **Stands.** The thing exists and the acceptance is not met, or the item is about an app, a sibling's pin, a dependency, a setting or a knowledge layer that the rebuild did not touch. An item of a repository that is not in this session stands, with the words "not opened", unless its own text is wholly about a retired hub gate.
- **Unclear.** Neither can be shown by a read. The reason says what would settle it.

A parked item is sorted by the same rule. One that stands stays parked.

### 2. How it is checked

- A checker that did none of the sorting opens the six part files and draws ten keys from each, spread over the three bins. For each it reads the item and the tree and sorts it again by the rule. A part with a wrong bin fails by its key, the sorter of that part looks again at its whole part, and the checker draws again from it.
- The main thread reads the whole unclear list and sorts each by reading. What is left is only a choice that is the owner's, and it is listed in the record and in the report.
- Before the push, a second checker that did none of the work opens the exact commit. It confirms the diff of `PROGRAM.md` changes only state words, adds only `Retired:` lines and the one head line, and touches exactly the keys of the record's moot list. It confirms the three lists hold 350 keys with none twice and none missing, that `programEntries` in `program.mjs` still reads 597 entries, and that the seven checks ended 0. It answers CHECK PASS or CHECK FAIL with the full commit id.
- After the push a worker reads the remote's head and the four workflow runs for that commit.

Not checked in this run, said plainly: the items of the app repositories, which are not opened; and whether an item marked standing is still wanted, which is the next page's question.

### 3. The steps

1. Six sorters at once, sonnet, each given one share of the not-done items in key order and the rule: P-11 to P-93, P-94 to P-169, P-170 to P-243, P-244 to P-456, P-457 to P-530, and P-531 to P-597. Each reads its items, their findings files and the tree, changes nothing in the repository, and writes its part file under the session's scratchpad folder.
2. Checker A, sonnet: the sample of part 2.
3. The main thread sorts the unclear list.
4. Worker G, sonnet: writes `plans/program-cull.md` from the six parts and the main thread's sorting; applies the moot list to `PROGRAM.md` with a short script kept in the scratchpad and not in the repository; adds the head line; counts the entries with `programEntries`; runs the hub's seven checks and the suite's cases; commits once with one plain line.
5. Checker B, sonnet: the exact commit, as part 2.
6. Worker H, sonnet, on CHECK PASS: pushes main once, reads the remote's head and the four runs.

### 4. The cost

Ten agents on the sonnet tier: six sorters, two checkers, one worker to write and land, one to push. One landing and one push. About 900,000 tokens and about 45 minutes, an estimate from the size of the list, which is 5,933 lines. A failed part adds a sorter and a second draw, about 100,000 tokens.

The main thread reads the unclear list, which is the one place judgement is needed. The rest of the run does not need the top tier.

Turns the environment's hooks will force: none is expected before step 4, because the part files are outside the repository. Between the commit and Checker B's pass the stop hook may ask for a push; it is answered in plain text and nothing is pushed until the pass.

### 5. The way back

One revert of the commit on main, through the same landing. The list and its states return as they were and the record goes. A single item marked retired in error is put back by hand: its state word and its `Retired:` line, both named in the record.

### Walls

- **A sorter marks a live item moot.** Each line carries what was searched for, a tenth of each part is sorted again by a checker, nothing is deleted, and the record lists every key, so one item is put back by one edit.
- **Sorters disagree on the rule.** The rule is on this page and each sorter is given it whole. A doubt goes to unclear and not to a guess.
- **A check refuses a `Retired:` sentence.** The sentence names a file or a function and what was not found, and never a person. Worker G changes the form and never the meaning.
- **A standing item depends on a retired one.** The record lists each such pair. The dependency line is left as written, for the next page.
- **A hook or the harness refuses a step.** That route stops, the refusal is reported word for word, and no other way to the same end is tried.

### Left out on purpose

- The way forward. It is the next page, written from the record's last part after this run.
- The rewrite of the list's head for the new way, beyond the one line. It is its own small page, after the items.
- Any change to `program.mjs`, to `found/`, or to the lessons.
- The nine apps' moves. Each is done at that app's next session started alone, and none waits on this.

## What the run showed

- Six sorters sorted the six parts: 230 moot, 88 standing and 32 unclear.
- A checker that did none of the sorting drew ten keys from each part. It failed three parts the first time: two items were met and not moot, and one concern lived on in a lesson.
- Every moot line of those three parts was looked at again, and a second draw failed one key.
- One worker then judged again the thirteen moot lines in all six parts that rested only on the retired agent rules or review file, and the checker passed all thirteen.
- The page's rule had no bin for an item already met. Such items are listed under unclear with "met:", and their state is unchanged.

## Moot: marked retired

- P-45 (open, hub): Searched the tree for plans/seed-template.md (found only archive/plans/seed-template.md) and for a plan check that refuses a step (plan-guard.mjs is a shell that checks nothing, its --check prints that the plan check is retired); not found.
- P-46 (parked, hub): Searched every .mjs file of the tree for runningTasks and a matcher on the words of a stop of a lost task and found none (report.mjs is in RETIRED-FILES.txt; hook-dispatch.mjs holds only idInLaunchResult, which matches an id).
- P-57 (open, hub): Searched the tree for plan-fence.mjs (in RETIRED-FILES.txt, absent) and for a fence that judges an agent's write against a plan's Files; not found.
- P-59 (open, hub): Searched the tree for pending-guard.mjs (in RETIRED-FILES.txt, absent) and for any queued-message stop-word test in hook-dispatch.mjs; not found.
- P-60 (parked, hub): Searched hook-dispatch.mjs, CLAUDE.md, DOCTRINE.md, doctrine/never.md and plans/native/page.md for a hold on the stop word anywhere in a message and found none.
- P-61 (open, hub): plan-scope-check.mjs stands only as a shell that prints that it was retired on 12 November 2026 and hashes no plan; no plan hash was found in the tree.
- P-62 (parked, hub): Searched CLAUDE.md, DOCTRINE.md, doctrine/never.md, .claude/hooks and hook-dispatch.mjs for a rule that every scratchpad file is run through a harness and found none (only a comment on the app's identifier guard shims).
- P-64 (open, hub): Searched the tree for the smoke run's first phase, the judge's changed-plan record and a plan path stop and found only a comment about a tools/smoke.mjs in quote-check.mjs; not found.
- P-66 (open, hub): Searched the tree for report.mjs (in RETIRED-FILES.txt, absent) and for Found-line keying by step and place; not found.
- P-67 (open, hub): Searched hook-dispatch.mjs for a state page gate or a status gate after a compaction and found none; its only page reference is the short-page line.
- P-69 (open, hub): Searched for doctrine/plans.md and for Doctrine rule 2's pointer sentence; the file is absent from the tree and doctrine holds only apps.md and never.md.
- P-71 (open, hub): Searched for doctrine/plans.md and its paragraph on the stop guard's teeth (absent), and stop-guard.mjs is now a shell that refuses nothing.
- P-76 (open, hub): Searched for a plan check that reads an Order line and found none; plan-guard.mjs is a shell that checks no plan.
- P-78 (open, hub): Searched plan-guard.mjs (a shell that refuses only the choice popup) for a first-plan install refusal and plan-fence.mjs (retired, absent) for a variable-assignment rule; not found.
- P-79 (open, hub): Searched for plan-fence.mjs, which the item names (in RETIRED-FILES.txt, absent), and for a Commands-entry flag match anywhere in hook-dispatch.mjs; not found.
- P-81 (parked, hub): plan-scope-check.mjs is a shell that prints no owner message and the five captures were in an earlier session's scratchpad; searched the tree for any print of owner messages by a scope check and found none.
- P-84 (open, hub): Searched the standing files (page.md, worker.md, checker.md, the landing, piece-of-work and app-move skills) for "failure block", "syntax", "scratch" and a guard on a library file a script imports; none found, the item was machinery of the app's retired guard and agent-rules.md.
- P-88 (open, hub): Searched for a plan check that refuses a step reading another's output, and for the seed, the template and agent rules the item names (archive only); not found.
- P-91 (open, hub): plan-scope-check.mjs is a shell that prints one retirement line for every folder and has no plan pointer logic; searched for an ok line on a missing pointer and found none.
- P-92 (open, hub): Searched the tree for doctrine-read-guard.mjs (in RETIRED-FILES.txt, absent) and for a line count of a doctrine read in hook-dispatch.mjs; not found.
- P-94 (open, hub): Searched the tree for plan-fence.mjs (in RETIRED-FILES.txt, absent) and for a reader allowance in plan-guard.mjs (now a 34-line shell that only refuses the choice popup); neither the fence nor a Commands check was found.
- P-97 (open, hub): Searched for report.mjs (in RETIRED-FILES.txt, absent) and for a status page gate or large-read flag in hook-dispatch.mjs; the page gate was not found.
- P-100 (open, hub): Searched for report.mjs and guard-cases/report.mjs (californiaInstant and the duration chip); neither file is in the tree, and report.mjs is in RETIRED-FILES.txt.
- P-101 (open, hub): Searched for report.mjs (retired) and for a plan reader with an Order line, and for a plan check in plan-guard.mjs (now a shell that passes); no Order-line plan reader was found.
- P-102 (parked, hub): Searched for report.mjs and stepTimeChips (file in RETIRED-FILES.txt, absent from the tree); the step time chip was not found anywhere.
- P-103 (parked, hub): the read a resume owed was kept by doctrine-read-guard.mjs, which is in archive/RETIRED-FILES.txt, and no standing file makes a resume owe a read.
- P-106 (parked, hub): Searched push-guard.mjs (checkRefusal) and hook-dispatch.mjs for a refusal that prints a check command naming a hook path in the live clone; the refusal prints no command or path, and the gates that printed one are retired.
- P-112 (open, hub): Searched for reply-guard.mjs (in RETIRED-FILES.txt, absent) and for a 404 or owner-route record in hook-dispatch.mjs and push-guard.mjs; none found.
- P-113 (open, hub): Searched for reply-guard.mjs and plan-fence.mjs (both retired and absent) and for a latch on two fetches to one host in hook-dispatch.mjs and push-guard.mjs; none found.
- P-114 (open, hub): Searched for reply-guard.mjs (retired, absent) and a shared reply ledger or decline record in hook-dispatch.mjs and push-guard.mjs; none found.
- P-115 (open, hub): Searched for reply-guard.mjs (retired, absent) and a failed-call ledger in hook-dispatch.mjs and push-guard.mjs; none found.
- P-116 (parked, hub): Searched plan-guard.mjs (now a shell) and hook-dispatch.mjs for heldNames or a held dropped name; not found, and the plan approval gate is retired.
- P-118 (open, hub): Searched for reply-guard.mjs (retired, absent) and a failed-call reading in hook-dispatch.mjs and push-guard.mjs; none found.
- P-119 (parked, hub): The harness named lives in a past session's scratchpad, and a search of the tree for the step108 harness found no such file, so the item is wholly about a file that is absent from the tree.
- P-121 (open, hub): Searched for pending-guard.mjs (in RETIRED-FILES.txt, absent) and a pending-message hold in hook-dispatch.mjs; not found.
- P-122 (open, hub): Searched plan-guard.mjs (a shell whose --check prints that the plan check is retired) for a Rules versus Commands check; the plan check no longer exists.
- P-123 (open, hub): Searched the standing files for "verdict", "eight" and any limit on a scope record or a refusal that names it; none found, the item was machinery of the retired plan check and agent-rules.md.
- P-125 (open, hub): Searched plan-guard.mjs (now a shell) for a list of git readers in plan mode (ls-remote, show-ref, branch -r); the list is not in it.
- P-126 (open, hub): Searched hook-dispatch.mjs (322 lines) for the correction hold and readOfRecord or gitHistoryRead; neither is present.
- P-127 (open, hub): Searched stop-guard.mjs (an 11-line shell that discards input and exits 0) for the go-word refusal and its six verbs; not found.
- P-128 (parked, hub): Searched the tree outside found/, lessons/ and archive/ for the shipped check and for a plan check that reads its lines; none exists, and plan-guard.mjs is a shell.
- P-129 (open, hub): Searched plan-guard.mjs (a shell) for a plan check of Order and sequence; the plan check is retired.
- P-131 (open, hub): Searched hook-dispatch.mjs (rewritten to 322 lines) for pageDueFile; the declaration is not present.
- P-132 (open, hub): Searched hook-dispatch.mjs for a main-thread latch that ends running agents and for a reach of a main-thread refusal; not found.
- P-133 (open, hub): Searched stop-guard.mjs (an 11-line shell) for a compaction line or a repeat check; not found.
- P-138 (open, hub): Searched hook-dispatch.mjs for the correction gate and a bare option number reading; no correction gate is present.
- P-139 (open, hub): The finding's own text says the notes that outgrew the read live in the session scratchpad, and a search of the tree for a manager notes file found none (NOTES.md is a different file); the file is absent from the tree.
- P-145 (open, hub): Searched for reply-guard.mjs (retired, absent) and a publish-repeat key in hook-dispatch.mjs and push-guard.mjs; not found.
- P-146 (open, hub): Searched for report.mjs and a status command that stamps times (retired, absent) and for a check reading a written time against a print in the tree; none found, and the notes read live in the scratchpad.
- P-148 (open, hub): Searched for plan-fence.mjs (in RETIRED-FILES.txt, absent) and its count of rules read in an agent's first message; not found.
- P-150 (open, hub): Searched for drive-guard.mjs (in RETIRED-FILES.txt, absent) and a folder search guard in hook-dispatch.mjs; not found.
- P-151 (open, hub): Searched plan-guard.mjs (shell) and the tree for a send cap and an exception for a send ended by a guard; the finding itself recorded none, and the plan check is retired.
- P-153 (open, hub): Searched for drive-guard.mjs (retired, absent); transcript-tail.mjs stands but no Drive guard reads a listing from it in hook-dispatch.mjs or push-guard.mjs.
- P-154 (parked, hub): Searched for report.mjs and a status command that prints a notes change (retired, absent) and for a gate ordering calls in hook-dispatch.mjs; not found.
- P-155 (open, hub): Searched for report.mjs and guard-cases/report.mjs (held chip, After line); neither is in the tree.
- P-156 (open, hub): Searched for drive-guard.mjs (retired, absent) and a count of listed folders in hook-dispatch.mjs; not found.
- P-157 (parked, hub): Searched hook-dispatch.mjs for the restart gate, restartedPlanMode and start-mode.json; the gate and its plan-mode logic are not present.
- P-158 (open, hub): Searched hook-dispatch.mjs for the manager fence and a scheduled check-in pass; the fence is not present.
- P-159 (open, hub): Searched plan-guard.mjs (a shell that passes everything but the choice popup) for a refusal of a scratch folder named in a step; the plan check is retired.
- P-160 (open, hub): Searched stop-guard.mjs (an 11-line shell that never refuses a stop) for a send count or hold on a final stop; not found.
- P-165 (open, hub): Searched plan-guard.mjs (a shell) for a re-read of a plan's quoted evidence or an evidence fault; the plan check is retired.
- P-166 (parked, hub): Searched the tree for the --mark and --done commands and a button record (report.mjs and plan-land.mjs are in RETIRED-FILES.txt); none found.
- P-170 (open, hub): The Cost check the item names was searched for in /home/user/noahjefferson/plan-guard.mjs (now a 34-line shell that only refuses the choice popup and prints that the plan check is retired) and no Cost check or plan Cost figures were found.
- P-177 (parked, hub): the quoted passages it would mark sit in plans/redesign-record.md, which is absent from the tree and kept in archive/plans as written.
- P-178 (open, hub): The finding names plans/redesign-record.md as the file to fix and it was searched for in the live tree and is absent (only a copy is in /home/user/noahjefferson/archive/plans); the item is wholly about that record's reading of the maker's pages.
- P-179 (parked, hub): the baseline it would write the harness version into was CONFIG.md, which is absent from the tree, and no standing file holds a baseline.
- P-187 (open, hub): The 1477-line instruction file and its 777-line section "the rules that get broken anyway" were searched for in /home/user/noahjefferson/CLAUDE.md (now 34 lines), DOCTRINE.md and doctrine/never.md and not found; the old file is only in archive/CLAUDE-2026-11-12.md.
- P-190 (open, hub): The fence that should refuse a git directory flag was searched for: plan-fence.mjs is in RETIRED-FILES.txt and the plan's Commands rule is gone; /home/user/noahjefferson/push-guard.mjs only tolerates -C when parsing a push.
- P-191 (open, hub): The finding names plans/redesign-record.md, absent from the live tree (only archive/plans/redesign-record.md), and the item is wholly about that record's section on the in-container settings file.
- P-198 (parked, hub): The record whose statements about the cut settings-reference windows are to be checked, plans/redesign-record.md, is absent from the live tree (only in archive/plans), and the item is wholly about that research record.
- P-200 (open, hub): The count of thirty-three hook events was searched for in the live markdown and scripts and found only in PROGRAM.md and the finding, with the step 51 report and plans/redesign-record.md gone from the live tree.
- P-203 (parked, hub): the research record it would mark is plans/redesign-record.md, absent from the tree and kept in archive/plans as written.
- P-205 (open, hub): the siblings' plan guard shims call plan-guard.mjs, now a shell that refuses only the choice popup, so there is no plan guard left to read.
- P-207 (open, hub): The plan check that prints an evidence fault on a finished plan was searched for in /home/user/noahjefferson/plan-guard.mjs, whose --check only prints that the plan check is retired, and was not found.
- P-208 (open, hub): the review it asks for is against the redesign plan's Design and plan format, both absent from the tree.
- P-209 (open, hub): The baseline (CONFIG.md, absent from the live tree) that carries the claim was searched for; the ConfigChange hook now exists in /home/user/noahjefferson/hook-dispatch.mjs and the gates named in the claim (plan-fence, approved-plan-guard) are retired.
- P-212 (open, hub): The fix file CONFIG.md is absent from the live tree (only archive/CONFIG.md) and six of the seven guard files whose refusal sites are to be counted (plan-fence, pending-guard, keep-info-guard, doctrine-read-guard, reply-guard, drive-guard) are in RETIRED-FILES.txt.
- P-214 (open, hub): The fix file CONFIG.md and its baseline entry are absent from the live tree; the installed .git/hooks/pre-commit and the tracked .githooks/pre-commit were also compared and are identical today.
- P-216 (open, hub): The fix file report.mjs (the steps-file text) is in RETIRED-FILES.txt and the steps file with its Goals and Design sections was searched for in the live tree and is not found.
- P-218 (parked, hub): The plan's file-access rules the item sets against the harness paragraph were searched for in plans/native, .claude, CLAUDE.md, DOCTRINE.md, doctrine and archive and not found.
- P-219 (open, hub): The plan wording "at least" for a count in a step's Observe and the plan check or review that reads for it were searched for in plans/native and plan-guard.mjs and not found; plans with Observe lines and the plan check are retired.
- P-220 (open, hub): A step that orders a read with an Observe was searched for in the live markdown and scripts and found only in PROGRAM.md and the finding file; the steps format and plan check are retired.
- P-224 (open, hub): The live stop guard's closing check of the found folder was searched for in /home/user/noahjefferson/stop-guard.mjs, which is now an 11-line shell that reads and discards its input, and in hook-dispatch.mjs, and no closing check exists.
- P-226 (parked, hub): The Call chain section of a plan was searched for in plans/native, plans/native-setup.md and .claude and not found; the section belonged to the retired plan format and the redesign plan file lies outside the repository.
- P-230 (open, hub): The reset of the required talk by a refused approval call was searched for in /home/user/noahjefferson/plan-guard.mjs, which is now a shell with no plan gate or talk, and in hook-dispatch.mjs, and not found.
- P-231 (open, hub): The stop hook's instruction to send an agent was searched for in /home/user/noahjefferson/stop-guard.mjs, which never refuses a stop and prints nothing, and the correction hold is not in hook-dispatch.mjs; neither side of the conflict exists.
- P-233 (open, hub): The next plan's Found answered section was searched for in plans/native, plans/native-setup.md and .claude and not found; the section belonged to the retired plan format.
- P-236 (open, hub): Searched the standing files for "wall" in a report or review hand-back; worker.md's report order (done, seen, files, Found) has no wall line and no gate or rule reads one; the rule sat in retired agent-rules.md and aim-review.md.
- P-237 (open, hub): The dispatch gate's refusal words for a closed pointer were searched for in /home/user/noahjefferson/hook-dispatch.mjs and guard-cases/dispatch.mjs (no pointer, Order or review step) and not found.
- P-239 (open, hub): The fix file reply-guard.mjs is in RETIRED-FILES.txt and absent from the tree.
- P-240 (open, hub): The weighing of a review's depth against a full cases run for each gate step belongs to the plan format and Cost section of the retired plan machinery and was searched for in plans/native and not found.
- P-241 (open, hub): The plan phase's pointer read on each main-thread call was searched for in /home/user/noahjefferson/hook-dispatch.mjs and not found, as the dispatcher no longer reads a pointer.
- P-243 (open, hub): The review gate and rules gate named in the finding were searched for in /home/user/noahjefferson/hook-dispatch.mjs (322 lines) and not found.
- P-244 (open, hub): The stop hold the item narrows for agents is gone: /home/user/noahjefferson/stop-guard.mjs is a shell that discards input and never refuses, and a search of hook-dispatch.mjs and plans/native found no per-agent plan-state judgement.
- P-250 (parked, hub): The core asks page and the paragraphs on reading the whole doctrine are not in /home/user/noahjefferson/CLAUDE.md, which is now 34 lines and loads plans/native/page.md; the item is answered by P-268, itself moot.
- P-252 (open, hub): keep-info-guard.mjs is in archive/RETIRED-FILES.txt and absent from the tree, and the item is wholly about it and the plan steps that counted its findings.
- P-255 (open, hub): plan-fence.mjs and approved-plan-guard.mjs are both in archive/RETIRED-FILES.txt and absent from the tree, and the item is wholly about loosenings made against them in the dispatcher.
- P-256 (open, hub): report.mjs is in archive/RETIRED-FILES.txt and absent from the tree, and the item is wholly about its --gate function and case.
- P-257 (open, hub): The item is about a plan's step naming an output file under the plan rules; a search of plans/native and the three skills found no plan-step wording of this kind, and the plan rules page is archived.
- P-258 (open, hub): The item is about step 58's Observe line in the redesign plan, and plan steps with Observe lines no longer exist in plans/native or the skills.
- P-259 (open, hub): The item is about the step shape and Kill line of a retired plan, and the reply guard it names (reply-guard.mjs) is in archive/RETIRED-FILES.txt and absent from the tree.
- P-261 (open, hub): The item is about the review script and the pointer of report.mjs keyed to plan approvals; report.mjs is in archive/RETIRED-FILES.txt and absent from the tree.
- P-262 (parked, hub): The item is about a reword send's Observe line in a plan already closed and held outside the repository, and plan sends no longer exist in plans/native.
- P-263 (open, hub): The item is about a plan's Commands entry and its review under the approved-plan machinery (approved-plan-guard.mjs, retired), and no Commands entry exists in the new way.
- P-265 (open, hub): The item is about the plan fence refusing writes to read-only Files and step 59's second send; plan-fence.mjs is in archive/RETIRED-FILES.txt and absent from the tree.
- P-267 (open, hub): The published status page and its publishing gate (report.mjs, retired) are not in the tree: /home/user/noahjefferson/public holds no status page.
- P-272 (open, hub): A search of every .mjs, .sh and .md file outside found/, lessons/ and archive/ for a rules pin found only PROGRAM.md; the two gates it names (the rules pin at the exit and at the send) no longer exist.
- P-273 (open, hub): A search of the tree for a rules file read by a send gate and an exit gate found none; the send and exit gates are retired with the plan fence and approved-plan guard.
- P-274 (open, hub): The manager fence and the rules gate it names are not in the tree; plan-fence.mjs is retired and a search for the rules pin found nothing outside PROGRAM.md.
- P-276 (open, hub): The item is about the fence passing a rules-file read beside a refused call; plan-fence.mjs is in archive/RETIRED-FILES.txt and absent, and no rules-file read is required any more.
- P-281 (open, hub): The item asks that a plan step's text read a dependency branch tip against its parent; plan steps no longer exist and a search of plans/native, DOCTRINE.md and HUB-REFERENCE.md found no such step text.
- P-292 (open, hub): The item is about the plan seed's close step and a close entry written in a middle step; plan-seed.mjs is in archive/RETIRED-FILES.txt and absent, and plans no longer carry close steps.
- P-294 (open, hub): The item is about the plan fence matching a Commands entry and the plan guard's new-file mark; plan-fence.mjs is retired and plan-guard.mjs is now a shell that checks nothing.
- P-296 (parked, hub): plan-seed.mjs is in archive/RETIRED-FILES.txt and absent, and the item is wholly about the seed's print at a tool call.
- P-297 (parked, hub): plan-seed.mjs is in archive/RETIRED-FILES.txt and absent, and the item is wholly about the seed's print at a prompt.
- P-299 (open, hub): plan-seed.mjs is in archive/RETIRED-FILES.txt and absent, and the item is wholly about the seed's working copy count.
- P-308 (parked, hub): hook-dispatch.mjs lists ConfigChange as an event but writes no configuration-change record and holds no read of one; the plan that plants a change to read it is also retired.
- P-321 (parked, hub): The stop hold is gone: /home/user/noahjefferson/stop-guard.mjs discards input and never refuses a stop, so no stop word is read by a hold.
- P-328 (open, hub): The templates folder and templates/runner.mjs and templates/fetcher.mjs are absent, and the plan step shape and plan rules the templates were to meet are retired.
- P-333 (open, hub): The item is about a gate refusing a stop; stop-guard.mjs is now a shell that never refuses a stop by design, and the reply guard is retired.
- P-340 (open, hub): plan-seed.mjs and the plan check are retired and absent; the item is wholly about the seed's print for an app plan's requirements section.
- P-341 (open, hub): plan-seed.mjs is in archive/RETIRED-FILES.txt and absent, and the item is wholly about the seed printing an app's item.
- P-342 (open, hub): The plan rules page is archive/doctrine-plans.md and the named fix file doctrine/plans.md is absent; a search of plans/native for research lanes found nothing and no plan rules page remains.
- P-345 (parked, hub): The item is about the plan fence's added-context line under a restored plan mode; plan-fence.mjs is in archive/RETIRED-FILES.txt and absent.
- P-359 (parked, hub): The item concerns the start handler's print and the fence's first-call reading for a restored plan mode; plan-fence.mjs is retired and absent and Q-HUB-304 (P-345) is moot.
- P-368 (parked, hub): The item is about a worker restart ending the harness's plan mode under the rule that approval is only the button; approved-plan-guard.mjs is retired and no plan-mode approval gate remains in the tree.
- P-381 (parked, hub): The rule that a fresh agent clears every move after a refusal belonged to the reply guard and fence, both in archive/RETIRED-FILES.txt and absent.
- P-383 (parked, hub): The item is about checking a plan step's date, and plan steps and the plan check are retired (plan-guard.mjs --check prints that the check is retired).
- P-394 (open, hub): plan-guard.mjs --check now prints that the plan check is retired and exits 0, so there are no check-mode refusals to read.
- P-454 (open, hub): plan-seed.mjs is in archive/RETIRED-FILES.txt and absent, and the item is wholly about its batch print range.
- P-461 (open, hub): Searched for reply-guard.mjs (the release command) in the tree and it is absent; it is listed in /home/user/noahjefferson/archive/RETIRED-FILES.txt, and the item is wholly about it.
- P-466 (open, hub): Searched for the seed's close lines (plans/seed-template.md and plan-seed.mjs, the files the finding names) and neither is in the tree; the item is wholly about the seed's plan close.
- P-468 (open, hub): Searched /home/user/noahjefferson/hook-dispatch.mjs and the whole tree for a manager fence or a status-command refusal and found none; plans/native/cost.md and old plan pages mention it only as history.
- P-469 (open, hub): Searched the tree for a plan rules gate that asks for the rules page and found none; plan-guard.mjs refuses only the choice popup, and the 1190-line rules page doctrine/plans.md is absent.
- P-470 (open, hub): Searched the standing files for "version", "mkdir" as a forbidden check, and a plan's "Commands" or a seed; only app-move's setup script makes a folder, as its own step; the rule sat in retired agent-rules.md, aim-review.md and the seed.
- P-471 (open, hub): Searched /home/user/noahjefferson/plan-guard.mjs for a plan check of pictures measured in the container and found none; --check prints that the plan check is retired and passes.
- P-472 (open, hub): Searched for the seed's reading step in plans/seed-template.md and plan-seed.mjs and both are absent from the tree (plan-seed.mjs is in /home/user/noahjefferson/archive/RETIRED-FILES.txt).
- P-473 (open, hub): Searched /home/user/noahjefferson/stop-guard.mjs (a shell that refuses nothing) for a refusal of an untried-route choice and found none; the other guard named, reply-guard.mjs, is in /home/user/noahjefferson/archive/RETIRED-FILES.txt.
- P-474 (open, hub): Searched /home/user/noahjefferson/hook-dispatch.mjs for a manager fence or a refusal of the web fetch and search tools on the main thread and found none.
- P-475 (open, hub): Searched for a status print listing declined hosts; reply-guard.mjs and report.mjs, the files the finding names, are both in /home/user/noahjefferson/archive/RETIRED-FILES.txt, and session-brief.mjs prints only branch lines.
- P-476 (open, hub): Searched /home/user/noahjefferson/hook-dispatch.mjs and plan-seed.mjs for a tier gate on a cleared close step and found none; plan-seed.mjs is retired and the dispatcher no longer holds plan or step gates.
- P-478 (open, hub): Searched /home/user/noahjefferson/hook-dispatch.mjs for a manager fence refusing an environment read and found none.
- P-479 (open, hub): Searched for the plan check's pull fault; plan-guard.mjs, the file the finding names, is a shell whose --check prints that the plan check is retired.
- P-480 (open, hub): Searched for the plan check's tier fault and its lineage fallback; plan-guard.mjs, the file named, is a shell with no plan check.
- P-487 (open, hub): Searched the tree for a Drive guard; only comments in transcript-tail.mjs mention one and no guard code, refusal or search-passing logic exists.
- P-488 (open, hub): Searched for a latch on agents or an agent's report file in the progress folder; no guard in the tree latches an agent, since the dispatcher holds none of those gates.
- P-489 (open, hub): Searched for a plan's end message rule (the finding is about the stop guard and plan pages); stop-guard.mjs refuses nothing and doctrine/plans.md is absent.
- P-490 (open, hub): Searched /home/user/noahjefferson/hook-dispatch.mjs for an approval marker written from the transcript's approved exit and found no approval or marker logic.
- P-491 (open, hub): Searched /home/user/noahjefferson/plan-guard.mjs and the dispatcher for a refusal of entering plan mode, a latch or a status print and found none; plan-guard.mjs passes every call but the choice popup.
- P-492 (open, hub): Searched for the correction hold and its refusal in the tree and found none; the pending guard is retired (pending-guard.mjs in /home/user/noahjefferson/archive/RETIRED-FILES.txt).
- P-493 (open, hub): pending-guard.mjs, the guard the item is wholly about, is listed in /home/user/noahjefferson/archive/RETIRED-FILES.txt and is absent from the tree.
- P-494 (open, hub): compact-recall.mjs, which wrote the recall file, is listed in /home/user/noahjefferson/archive/RETIRED-FILES.txt and is absent; no recall file or owed-reads gate exists in the tree.
- P-495 (open, hub): Searched /home/user/noahjefferson/session-brief.mjs and hook-dispatch.mjs for a start print after a compaction stating its time and found none; a compaction start prints nothing.
- P-496 (open, hub): Searched /home/user/noahjefferson/stop-guard.mjs for the statement-of-state test and found none; the file reads and discards input and exits 0.
- P-497 (open, hub): compact-recall.mjs, which held the recall file of replies, is listed in /home/user/noahjefferson/archive/RETIRED-FILES.txt and is absent; no recall file exists.
- P-498 (open, hub): Searched for a recall folder, an arrival write of long owner messages and the plan fence; compact-recall.mjs and plan-fence.mjs are both in /home/user/noahjefferson/archive/RETIRED-FILES.txt.
- P-499 (open, hub): Searched the tree for a Drive guard's code passing a pasted folder link and found none (only comments in transcript-tail.mjs).
- P-500 (open, hub): Searched the tree for a Drive guard refusal naming a folder title and a file name and found none.
- P-501 (open, hub): Searched the tree for a Drive guard refusal text and a status print listing closed routes and found neither.
- P-504 (open, hub): Searched for a batch print in /home/user/noahjefferson/program.mjs and the tree and found none; plan-seed.mjs, which held it, is in /home/user/noahjefferson/archive/RETIRED-FILES.txt.
- P-507 (open, hub): Searched for plans/seed-template.md and guard-cases/plan-seed.mjs, the files the finding names, and both are absent from the tree.
- P-508 (open, hub): Searched for plans/seed-template.md and plan-seed.mjs, the files named, and found both absent; plan-seed.mjs is in /home/user/noahjefferson/archive/RETIRED-FILES.txt.
- P-510 (open, hub): Searched for doctrine/plans.md and plans/seed-template.md, the pages the finding names, and both are absent from the tree.
- P-512 (open, hub): Searched for plans/seed-template.md and guard-cases/plan-seed.mjs, which the finding names, and both are absent from the tree.
- P-513 (open, hub): Searched /home/user/noahjefferson/plan-guard.mjs for a plan-mode check of a call's single argument and found none; it passes every call but the choice popup, and guard-cases/plan-guard.mjs is absent.
- P-516 (open, hub): Searched the standing files for "Next" line, notes, status page and a review reading them; none found, report.mjs and aim-review.md are retired.
- P-518 (open, hub): Searched /home/user/noahjefferson/plan-guard.mjs for the plan check's amendment judgement and found none; it is a shell whose --check prints that the plan check is retired.
- P-519 (open, hub): Searched for the correction hold and its release; pending-guard.mjs, the file named in the finding, is in /home/user/noahjefferson/archive/RETIRED-FILES.txt and no hold exists in the tree.
- P-520 (open, hub): Searched for plans/seed-template.md, doctrine/plans.md and a plan check in plan-guard.mjs (a retired shell); the template and the page are absent.
- P-521 (open, hub): Searched /home/user/noahjefferson/hook-dispatch.mjs for a plan check fault on a missing Sends priced line and found none, and the plan check is retired.
- P-523 (open, hub): Searched /home/user/noahjefferson/stop-guard.mjs for a refusal of a reply's first line and found none (it refuses nothing), and doctrine/plans.md is absent.
- P-524 (open, hub): Searched /home/user/noahjefferson/hook-dispatch.mjs, bringForward included, for an approval marker or a plan in force and found none; bringForward judges only branch, uncommitted changes and fetch.
- P-527 (open, hub): Searched /home/user/noahjefferson/stop-guard.mjs for the pointer call and the plant eject_pointer_notes and found neither; the file reads and discards input and exits 0.
- P-529 (open, hub): Searched the standing files for a doctrine review file, a pruning list and "review" of entries; none found, and plans/doctrine-review.md is absent.
- P-530 (open, hub): Searched for doctrine/plans.md and for a constant listing what the stop refusal passes; the page is absent and stop-guard.mjs refuses nothing.
- P-532 (open, hub): Searched CLAUDE.md (34 lines), DOCTRINE.md, doctrine/ and plans/native/ for an index bullet on the review gate's rule and found none; the plans page doctrine/plans.md is in archive/doctrine-plans.md.
- P-535 (open, hub): Searched the live tree (CLAUDE.md, DOCTRINE.md, doctrine/, plans/native/) for the plan rules' first call and the steps file's preamble and found neither; the plan rules are only in archive/doctrine-plans.md.
- P-536 (open, hub): The latch and report-name rule were in plan-fence.mjs and hook-dispatch.mjs; plan-fence.mjs is absent from the tree and hook-dispatch.mjs (322 lines) holds no latch or report-file name.
- P-537 (open, hub): The identifier gate on hex-set words was in plan-fence.mjs, which is absent; a search of hook-dispatch.mjs and push-guard.mjs for a hash or hex gate found none.
- P-538 (open, hub): The write fence on a plan's Files was in plan-fence.mjs (absent) and plan-guard.mjs, now a shell that checks nothing; no Files check exists in the tree.
- P-539 (open, hub): The refusal of a tool's help flag and the step text naming the reply guard's usage were plan-fence.mjs and reply-guard.mjs behaviour; both are absent (reply-guard.mjs is in archive/RETIRED-FILES.txt).
- P-540 (open, hub): The redirect refusal was in plan-fence.mjs, which is absent from the tree; no redirect fence is in hook-dispatch.mjs or push-guard.mjs for agent lines in a scratchpad.
- P-541 (open, hub): Searched hook-dispatch.mjs for a printed line reading the word stop in a message and found none; the prompt event prints only the one short-page line.
- P-544 (open, hub): Searched doctrine/never.md, doctrine/apps.md and plans/native/running.md for a statement that a repository cannot be added to a session after its start and found none.
- P-545 (open, hub): The pointer's DONE count was in report.mjs, which is in archive/RETIRED-FILES.txt and absent from the tree.
- P-546 (open, hub): The print of the plan's goal and next move at each prompt was a hook-dispatch.mjs behaviour; the rewritten dispatcher prints only the one short-page line and holds no pointer or manager-notes reader.
- P-547 (open, hub): The plan-mode line in the prompt print was a hook-dispatch.mjs behaviour; the rewritten dispatcher has no plan-mode print (searched, not found).
- P-548 (open, hub): The item's files are plans/seed-template.md (now only archive/plans/seed-template.md), plan-fence.mjs (absent) and hook-dispatch.mjs (no red-run fence); none of the behaviour stands.
- P-549 (open, hub): The verb prove is in plan-land.mjs, which is in archive/RETIRED-FILES.txt and absent from the tree.
- P-550 (open, hub): The manager fence's write refusal of the plan file was in hook-dispatch.mjs; the rewritten dispatcher has no manager fence (searched for managerFence and plan-file writes, not found).
- P-551 (open, hub): The tier fault was in plan-guard.mjs, now a shell whose --check prints that the plan check is retired; no tier or plan-file check exists.
- P-552 (open, hub): The refusal at the price was in hook-dispatch.mjs; the rewritten dispatcher counts no sends and has no price refusal (searched, not found).
- P-553 (open, hub): The send count was in hook-dispatch.mjs and doctrine/plans.md; the count is not in the rewritten dispatcher and the plans page is only archive/doctrine-plans.md.
- P-554 (open, hub): Searched program.mjs and the live tree for manager notes or File at the close lines and found none; the landing step lived in plans/seed-template.md, which is now only in archive/plans/.
- P-559 (open, hub): The code-name check mode and approval call were in plan-guard.mjs, now a shell that checks nothing; searched for a code-name check there and found none.
- P-560 (open, hub): The stop refusal was in plan-guard.mjs and stop-guard.mjs; stop-guard.mjs is now an 11-line shell that never refuses a stop.
- P-563 (open, hub): The landing-step rule was for plans/seed-template.md, which is absent from the tree (only archive/plans/seed-template.md remains).
- P-564 (open, hub): The prompt hook's correction and stop reading was in hook-dispatch.mjs; the rewritten dispatcher prints only the one short-page line (searched, not found).
- P-565 (open, hub): plan-scope-check.mjs is a 9-line shell retired on 12 November 2026 that prints one line; the block it opened and closed is not in it.
- P-566 (open, hub): diffLineCount is not in plan-scope-check.mjs (a shell) or hook-dispatch.mjs; searched, not found.
- P-568 (open, hub): The manager fence refusing plan-file writes was in hook-dispatch.mjs; the rewritten dispatcher holds no manager fence (searched, not found).
- P-569 (open, hub): The running-plan tier fault was in plan-guard.mjs, now a shell that checks nothing.
- P-570 (open, hub): The refusal at the price was in hook-dispatch.mjs; the rewritten dispatcher holds no price refusal.
- P-571 (open, hub): The send count and the price were in hook-dispatch.mjs and the plans page; neither stands in the live tree.
- P-572 (open, hub): Searched program.mjs for the manager notes' File at the close lines and found none; the manager notes and the seed template are retired, so the verb file has no such input to take.
- P-573 (open, hub): The template's proof order and the manifest-first verb were in plans/seed-template.md and plan-land.mjs; neither stands in the live tree.
- P-574 (open, hub): The approval call put up again after a resume was in plan-guard.mjs, now a shell; no approval-call logic is in the tree.
- P-576 (open, hub): CONFIG.md is absent from the root (only archive/CONFIG.md remains) and the stand-down module it was to name is retired.
- P-577 (open, hub): The checks-only proof was in plan-land.mjs, which is in archive/RETIRED-FILES.txt and absent.
- P-578 (open, hub): The stand-down and its trial report concern stand-down.mjs, which is in archive/RETIRED-FILES.txt; the dispatcher skips no neighbouring hooks for a stand-down now (searched, not found).
- P-579 (open, hub): The Commands lists and the can-check line were in plans/seed-template.md, absent from the live tree.
- P-580 (open, hub): The stand-down file belongs to stand-down.mjs, retired; searched .claude/ and the root for a stand-down file and found none, and none is wanted.
- P-581 (open, hub): The manager fence's refusal of reads was in hook-dispatch.mjs; the rewritten dispatcher has no manager fence (searched, not found).
- P-582 (open, hub): The plan guard's refusal of the status command was in plan-guard.mjs; it is now a shell that passes every call but the choice popup and --check passes.
- P-583 (open, hub): The re-delivery of an answered message was pending-guard.mjs, which is in archive/RETIRED-FILES.txt and absent.
- P-590 (open, hub): reply-guard.mjs and reply-guard.test.mjs are in archive/RETIRED-FILES.txt and absent from the tree.

## Standing

- P-11 (parked, the hub and every app, on main and on staging where an app has one): Branch protection is a setting of the remote and not a file of the tree; the connector's listing was not read here and the acceptance is not shown met, and the app repositories are not opened.
- P-12 (parked, the cloud environment): The environment's own stop hook is outside the tree and the hub's stop-guard.mjs is a shell that never refuses, so the setting the acceptance names is untouched by the rebuild; not opened.
- P-13 (parked, the hub and every app): The hub's .claude/settings.json exists and still holds the bare tool name Artifact and lacks rules for several command shapes the item lists (session-cost, session-brief, git commit-tree), so the acceptance is not met; the siblings' files are not opened.
- P-14 (parked, the owner's preferences file, outside any repository): The file is outside every repository and the rebuild did not touch it; its proposed revisions are not shown applied and nothing in the tree settles them.
- P-16 (parked, the owner's session settings): The allow rule Artifact is still line 4 of the hub's .claude/settings.json and the prompt's origin is still unknown, so the acceptance is not met and no part of it was touched by the rebuild.
- P-22 (open, Jefferson-Photography-Studio): not opened; a knowledge layer in an app's own instruction file, untouched by the rebuild.
- P-24 (open, fauxplane): not opened; a knowledge layer in an app's own instruction file, untouched by the rebuild.
- P-25 (open, 3d-printing-pal): not opened; a knowledge layer in an app's own instruction file, untouched by the rebuild.
- P-26 (open, Intersecting-parallels): not opened; a knowledge layer in an app's own instruction file, untouched by the rebuild.
- P-27 (open, photo-pointer): not opened; a knowledge layer in an app's own instruction file, untouched by the rebuild.
- P-28 (open, MoleBridge): not opened; a knowledge layer in an app's own instruction file, untouched by the rebuild.
- P-29 (open, Cv-Thalweg): not opened; a knowledge layer in an app's own instruction file, untouched by the rebuild.
- P-30 (open, solve-ent): not opened; a knowledge layer in an app's own instruction file, untouched by the rebuild.
- P-35 (parked, Quietkeep): not opened; the sibling's pin and the promote that its dry run waits on are the sibling's own.
- P-36 (open, fauxplane): not opened; a sibling's pin and sweep caller.
- P-37 (open, 3d-printing-pal): not opened; a sibling's pin and sweep caller.
- P-38 (open, Intersecting-parallels): not opened; a sibling's pin and sweep caller.
- P-39 (open, photo-pointer): not opened; a sibling's pin and sweep caller.
- P-40 (open, MoleBridge): not opened; a sibling's pin and sweep caller.
- P-41 (open, Cv-Thalweg): not opened; a sibling's pin and sweep caller.
- P-42 (open, solve-ent): not opened; a sibling's pin and sweep caller.
- P-43 (open, Jefferson-Line): not opened; a sibling's pin and sweep caller, and the hub's pin-check.mjs it is to defer to still exists.
- P-44 (parked, hub): A commit on the remote's history and the owner's choice to keep or rewrite it, which the rebuild did not touch and no read of the tree shows made.
- P-49 (answered, the cloud environment): The environment's stop hook is outside the tree and untouched by the rebuild; it waits on P-12, which stands.
- P-55 (parked, hub): The naming of the session's plan file is the harness's and no file of the tree changes it; the acceptance is observed only in the next agent prompts and is not shown met.
- P-68 (open, hub): the half about sibling notes parsers is a sibling matter, not opened.
- P-72 (open, hub): pin-check.mjs still says in its header (line 16) and its pass line (line 103) that no script runs on undeclared dependencies while it refuses only root scripts with no package.json, so the words and the check still disagree.
- P-73 (parked, the six repositories the line says are unread, which it does not name; the siblings are listed in REPOS.md): not opened; the six siblings' settings are not in this session, and plan-guard.mjs stands as a shell they still call.
- P-74 (open, hub): push-guard.mjs and plans/native/skills/landing/SKILL.md read the remote's head only after the push (step 5) and nothing reads it immediately before a push, so the acceptance is not met.
- P-77 (parked, hub): The harness still gives an agent no wait on a CI run; plans/native/skills/landing/SKILL.md step 5 reads the run for the exact commit but states no concluded-state rule, so the acceptance is not shown met.
- P-89 (open, hub): docs-check.mjs still walks the folder with readdirSync while quote-check.mjs still reads git ls-files, so the two counts still differ on an untracked markdown file and no record of the re-read exists.
- P-93 (open, hub): lesson 387 stands with no note about lesson 398, so the acceptance is not met.
- P-105 (open, hub): session-guards.test.mjs still narrows a plants run (--files, --touched) and prints "NARROWED to ...: N of M plants" at line 1099, but it does not name the guard files left out, which the acceptance asks for.
- P-108 (open, hub): the Covered list in the header of session-guards.test.mjs does not name every group of guard-cases.
- P-117 (parked, Jefferson-Photography-Studio): not opened
- P-120 (parked, the app repositories): not opened
- P-130 (parked, hub): plans/native/skills/landing/SKILL.md step 5 reads the CI run for the exact commit, but does not require every run (gates, deploy, accessibility, code scan) to be read as concluded or named as still running.
- P-136 (parked, hub): plans/native/skills/landing/SKILL.md step 5 reads the CI run for the commit but does not require a report stating each run as concluded or in progress.
- P-144 (parked, hub): section 7i of doctrine/apps.md still sets the status page rule, and nothing publishes a page again at a new link.
- P-149 (parked, hub): plans/native/skills/landing/SKILL.md step 4 says push once but names no push time limit and does not run the push in the background with output in a file.
- P-152 (open, hub): privacy-check.mjs line 75 and third-person-check.mjs line 136 still list files with git ls-files only, so untracked files are not read and no case with an untracked lesson exists.
- P-162 (parked, the app the line names without a repository; the neighbouring lines of the queue name Jefferson-Photography-Studio): not opened
- P-163 (open, hub): session-guards.test.mjs runPlant calls runAll, whose first line awaits the import of push-guard.mjs outside any try, so a plant that deletes an export another file imports still throws instead of printing CAUGHT or MISSED.
- P-164 (open, hub): session-guards.test.mjs reads no --out switch (argValue handles only named switches and the header lists none), so the flag is still ignored and still not removed from usage.
- P-167 (open, hub and each sibling): hub-pin-check.mjs and hub-gates-local.mjs exist but .github/workflows/hub-gates.yml runs only pin-check.mjs and neither new file is wired in; sibling copies are not opened.
- P-172 (parked, hub): /home/user/noahjefferson/session-cost.mjs exists and only prints the harness's cumulative cost entry; it holds no price list file and prints no dollars by plan from tokens by tier, and the owner has not chosen.
- P-173 (parked, hub): /home/user/noahjefferson/session-cost.mjs still counts refusals through countRefusals with a fixed set of shapes; no check against the harness's documented hook output shapes and no "unseen" output exist.
- P-174 (open, hub): /home/user/noahjefferson/session-cost.mjs exists but does not read an agent's first prompt, does not count reviews apart from step agents and counts refusals by gate rather than agents refused at least once.
- P-175 (parked, hub): /home/user/noahjefferson/session-cost.mjs still counts resumes from the SessionStart hook entries (hookTimes) and its output does not say the count is a floor.
- P-176 (open, hub): /home/user/noahjefferson/session-cost.mjs counts agents by the model that served most of each but names no step an agent served and prints no off-tier agent at a plan's close.
- P-183 (open, hub): lessons/ still holds 26 lines citing the repository name unlisted-app, which /home/user/noahjefferson/REPOS.md does not list, and /home/user/noahjefferson/lessons-check.mjs has no check of citation repository names against REPOS.md.
- P-184 (open, hub): the dependency branches still stand on the remote and nothing refuses a stale dependency pull request.
- P-185 (parked, hub): A git ls-remote of origin still shows refs/heads/claude/solve-ent-algebra-trainer-exnzy7, and the answer as dropped in the next plan's Found answered section is not given.
- P-186 (open, hub): /home/user/noahjefferson/.claude/settings.json still holds the two allow entries naming /home/user/Jefferson-Photography-Studio paths and the owner has not kept or removed them.
- P-188 (parked, hub): Branch protection on main is an owner-only GitHub setting (SECURITY.md records it) and the item is answered only by P-11, which is parked.
- P-193 (open, hub): /home/user/noahjefferson/.claude/settings.json still holds no allow rule for session-cost.mjs, session-brief.mjs or git commit-tree, and it depends on the owner's P-13.
- P-197 (open, hub): The owner has not confirmed the list the measure prints, and /home/user/noahjefferson/session-cost.mjs exists printing messages, go-words, refusals and tokens by model, so the owner's confirmation and the P-10 entry change are not done.
- P-202 (parked, hub): No test of whether plan mode's blocks hold in this container's session exists in the tree, and the harness behaviour still has to be read by a live session in that mode.
- P-204 (parked, hub): /home/user/noahjefferson/REPOS.md exists but the siblings' workflow files were not opened here; the instruction file's census it names is gone with the old CLAUDE.md.
- P-206 (open, hub): The checkout is now on main with no uncommitted files, but the two findings Q-HUB-2 and Q-HUB-71 have not been answered as fixed or dropped.
- P-210 (open, hub): /home/user/noahjefferson/PROGRAM.md P-162 still gives the repository as the app the line names without a repository, and found/Q-HUB-110.md still names no repository.
- P-211 (open, hub): /home/user/noahjefferson/PROGRAM.md line 560, P-13's Known line, still says the hub's settings hold 20 allow rules.
- P-213 (parked, hub): /home/user/noahjefferson/.claude/settings.json line 4 still holds the bare allow entry Artifact and only the owner can remove it.
- P-215 (open, hub): The pins of the siblings are not written in any live file (REPOS.md states no pin value) and the siblings' workflows were not opened; the baseline's section 8 is gone with CONFIG.md.
- P-223 (open, hub): nothing serialises two workers staging in one worktree, and the piece-of-work procedure runs steps that touch different files together.
- P-232 (parked, hub): The research plan's reports and design conversation remain only in the session's scratchpad and transcript, and the choice of what is kept is the owner's.
- P-235 (open, hub): The plants runner still exists in /home/user/noahjefferson/session-guards.test.mjs, but the data point of 384 plants run in one process is recorded in neither P-54 nor P-169 in /home/user/noahjefferson/PROGRAM.md.
- P-248 (open, hub): /home/user/noahjefferson/doctrine-sync.mjs exists and its WATCHED list names DOCTRINE.md and lessons/ but not the files under doctrine/ (never.md, apps.md), so the acceptance is not met.
- P-249 (parked, hub): /home/user/noahjefferson/doctrine/never.md exists at 478 lines and the owner's choice of what to trim has not been made; stays parked.
- P-251 (open, hub): Lessons 383, 385 and 398 in /home/user/noahjefferson/lessons still stand unchanged, naming DOCTRINE.md as the file read and describing doctrine-read-guard.mjs before the move, and no restatement or note beside them was found.
- P-253 (open, hub): /home/user/noahjefferson/lessons-check.mjs exists but does not read item citations with a decimal point, and such citations remain in doctrine/never.md and doctrine/apps.md (for example section 16.8 and 15.1), so no single form is settled.
- P-264 (open, hub): Lesson 320 in /home/user/noahjefferson/lessons still declares only CHECKLIST items and no gate, and no note was found in it that the checklist form is kept by choice, so the acceptance is not met.
- P-266 (open, hub): The concern lives on in the standing roles: plans/native/roles/worker.md and checker.md name full paths and no change of directory, but no pipe rule, and no refusal or Kill line carries the remedy.
- P-277 (open, hub): aim-review.md is retired, but its concern lives on in plans/native/roles/checker.md, which says the checker changes nothing; the refusal of a write outside the scratchpad with that sentence in its text is not found in the tree.
- P-280 (open, hub): /home/user/noahjefferson/package.json still carries a //browser note pairing playwright-core 1.56.0 with chromium 1194 while the dependency reads 1.64.1, and the accessibility gate was not shown run at the installed version.
- P-282 (parked, hub): The remote still lists dependabot branches (cloudflare/wrangler-action-4.1.3 and npm_and_yarn/tooling-392aa810d0) that this item says are to be read once and recorded; the full set of four was not matched to the list.
- P-284 (open, hub): aim-review.md is retired, but the concern lives on in plans/native/roles/checker.md, which names no bare git reads and says nothing of format strings or percent codes.
- P-289 (parked, hub): /home/user/noahjefferson/.github/workflows/deploy-myfax.yml line 155 still runs npx --yes wrangler and pin-check.mjs line 56 still prints a note for npx without --no-install in a workflow with secrets.
- P-290 (open, hub): cf-analytics.yml and deploy-myfax.yml still use secrets with no environment set, and no zizmor auditor-persona run over them is recorded, so the acceptance is not met.
- P-291 (open, hub): The PROGRAM.md items count line opens with 597 but its breakdown (10, 7, 1, 1, 4, 9, 9, 409) sums to 450, and NOTES.md holds no items line; no case or check holds it.
- P-353 (open, hub): deploy-myfax.yml line 155 still runs npx --yes and pin-check.mjs still prints the note, with no declared acceptance read, so the note stands unjudged.
- P-443 (open, hub): No design for several sessions writing PROGRAM.md without sharing lines is recorded in DOCTRINE.md, doctrine/, plans/native or HUB-REFERENCE.md, and program.mjs still edits the shared count lines.
- P-455 (open, hub): /home/user/noahjefferson/session-guards.test.mjs still ends a full run with the PASS and FAIL lines then the count, and does not reprint the failed case names just before the count.
- P-462 (parked, hub): The container's page fetcher is the environment's and the rebuild did not touch it; the acceptance (a fetcher that writes the dropped span or names the file) is not met and no hub file holds such code.
- P-463 (parked, hub): The refusal comes from the harness's permission check, which the rebuild did not touch; no fetch runner taking one host to a call exists in the tree, so the acceptance is not met.
- P-464 (open, hub): The rule on a denied host stands as 15c in /home/user/noahjefferson/doctrine/apps.md (the named doctrine/plans.md is gone) and says nothing of how an allowed-hosts change made in a session is read or of a probe step, so the acceptance is not met.
- P-465 (parked, hub): The container's fetcher is the environment's and the rebuild did not touch it; the hub holds no code that saves a page or records hops, so the acceptance is not met.
- P-502 (open, hub): The finding is filed as not the repository's (the connector's log shape and the harness's rule); no reader of a saved red-run log is listed anywhere in the tree and the finding is not marked parked, so the acceptance is not met.
- P-503 (open, hub): /home/user/noahjefferson/found/Q-HUB-246.md, Q-HUB-247.md and Q-HUB-248.md exist and no heading of /home/user/noahjefferson/PROGRAM.md carries those keys, so no entry is ranked for them.
- P-506 (open, hub): /home/user/noahjefferson/session-guards.test.mjs prints PASS and FAIL lines in case order and then the count line, followed by further lines, with no repeat of the red cases after the passing ones.
- P-509 (open, hub): The dry listing in /home/user/noahjefferson/session-guards.test.mjs tests only that the find text is included in its file, and it has no wording or branch that names a find inside a case body as stale by design.
- P-514 (open, hub): The dry listing in /home/user/noahjefferson/session-guards.test.mjs checks only that a plant's find is included in its file once, and it neither counts matches nor names a plant whose find matches more than one place.
- P-526 (open, hub): bringForward in /home/user/noahjefferson/hook-dispatch.mjs already takes the limit as opts.seconds (default 20), but /home/user/noahjefferson/guard-cases/dispatch.mjs has no case that passes one second against a planted slow fetch.
- P-533 (open, hub): doctrine/apps.md still holds a cut remnant (the colour bullet reads "the branding is placeholder" then a line break and ". No app's colours") and no check refuses an empty pair of brackets in the doctrine's files; the full eleven were not each counted.
- P-542 (open, hub): DOCTRINE.md's index still lists id 0d twice (the harness line and the personal-words line) and doctrine/never.md holds "## 0d" and "### 0d" for the two sections; the id is not made unique.
- P-555 (open, hub): no case holds every root command file to the suite's list of files.
- P-558 (open, Jefferson-Photography-Studio): not opened
- P-562 (open, hub): no file of the hub holds a route for reading a pasted test-page report.
- P-586 (open, hub): .github/workflows/a11y.yml still runs on ubuntu-latest and installs chromium with playwright-core; the siblings' workflows are not opened and the acceptance (each read and pinned if met) is unmet.
- P-596 (open, hub): bringForward in hook-dispatch.mjs still brings the hub copies forward at every start and resume and the trial has not recorded a decision; the seed half is moot as plan-seed.mjs is retired.

## Unclear

- P-15 (parked, the owner's session settings): met: plans/native/running.md, under Model, gives the top tier to the scope and a surprise and a lower tier to the run after approval.
- P-52 (answered, hub): report.mjs is retired, but session-cost.mjs now holds countRefusals, which counts a refusal once per tool-result entry and has a planted-transcript line; running its planted check and reading whether a user entry opening with the stop hook's message is also counted would settle whether the acceptance is already met.
- P-58 (open, hub): met: git status shows a clean checkout and git stash list is empty, and hasGoWord is found only in found/Q-HUB-2.md, so the read the acceptance asks for shows no uncommitted go-word work; the line may be dropped with that read as its reason.
- P-70 (open, hub): met: doctrine/apps.md line 106 states the ruling of 2026-07-29 on the inline exception, and a search of doctrine/apps.md and doctrine/never.md for the sentence opening Open for the owner found none.
- P-80 (parked, hub): met: git stash list in the hub checkout is empty, which is the read the acceptance asks for.
- P-124 (parked, hub): A read of the checkout today shows branch main and an empty git status, so the acceptance reads as met, which is neither moot nor standing; the main thread must decide whether an observed-met item is dropped here.
- P-141 (parked, hub): The item records a main-thread call held by lesson 432 (which exists) and owes no change; whether a record-only item is moot, done or dropped is for the main thread to rule.
- P-142 (parked, hub): The item records a harness line followed over a gate, held by lesson 432 (which exists), and owes no change; the main thread must rule whether a record-only item is moot, done or dropped.
- P-161 (parked, hub): Whether each item the line names (agent review of a plan, cost test, asked-for clause, Drive guard link, plan kind line, corrections count, latch reach) is an item of PROGRAM.md or a retired matter needs a read of each against the list, which the main thread would settle.
- P-189 (open, hub): met: landing/SKILL.md orders the commit before the checks, so a check sees a new file; but it never names git add, so whether that is enough for the item is a doubt; the plan check and plan lists it names are retired.
- P-192 (parked, hub): It asks for the conclusion of an old Doctrine gates run (run 557) on the remote, which only a read of that run through the connector can settle and which was not read here.
- P-195 (open, hub): Doubt: no standing file carries the hex rule (searched "hex"), but checker.md requires a full commit id in its answer, which the rule would forbid, so whether the rule is dropped or lives is the owner's to say; plan-fence.mjs is retired. Also, plans/native/roles/checker.md requires the full commit id, which the item's rule would forbid.
- P-221 (open, hub): Doubt: no standing file carries the verbatim or no-hex rule (searched "hex", "verbatim"), but checker.md requires the full commit id; which wins is not settled by the standing files, and it depends on P-195. Also, plans/native/roles/checker.md requires the full commit id, which the item's rule would forbid.
- P-225 (open, hub): Doubt: worker.md keeps the Found line and checker.md requires a full commit id, but no standing file says to restate a commit in words or holds the hex rule (searched "hex"); the owner's choice, tied to P-195. Also, plans/native/roles/checker.md requires the full commit id, which the item's rule would forbid.
- P-234 (open, hub): The acceptance says nothing else is owed beyond what P-194 (done) and Q-HUB-154's file answer, so it appears already met; the owner or main thread saying whether to close it as done rather than retired would settle it.
- P-268 (parked, hub): met: /home/user/noahjefferson/CLAUDE.md was read at 34 lines, under the 200 target, and the old section on rules that get broken anyway is not in it; the owner's choice from the list progress/claude-md-list.txt (file absent) is not observed, so the main thread decides.
- P-269 (open, hub): PROGRAM.md's items line does state the key offset, but the other two parts (re-reading the close entry under P-10 and keeping the list of paragraphs where P-268 reads it) depend on P-268 being moot; the main thread decides whether the item is met in part or moot.
- P-270 (parked, hub): Doubt: worker.md and page.md carry "start no process you will not manage" but nothing on what an agent does while a run is in the background or on a resend reading the output files first; the agent-rules.md and plan fence it names are retired.
- P-279 (open, hub): session-guards.test.mjs still has plants and a plants run that names missed and stale plants, but the suite was rewritten and the 11 plants are not named; a plants --dry run would show whether any plant has no guard file.
- P-283 (parked, hub): The item asks that the CI run for the commit pushed by step 65 be read and its conclusion recorded; the commit is not named in the item, so the finding Q-HUB-242 and a read of the workflow runs would settle whether it was recorded.
- P-320 (open, hub): The seed's print it names is gone (plan-seed.mjs retired), but whether a lesson in the shape of lesson 472 on reading an app's research file whole exists would be settled by a search of lessons/ for that subject.
- P-364 (open, hub): Doubt: the steps file is retired machinery, but every standing role opens "Read the short page first", which is part of the acceptance (the rules' Read is the first call), though none says it is the one call of the first turn.
- P-379 (parked, hub): The stop hook that asks for a commit is the environment's not the repository's, but the plan landing rule it was to read is gone; the owner's word on whether to leave it with the environment would settle it.
- P-457 (open, hub): The case 'step 119: the plants of every guard file ...' in /home/user/noahjefferson/session-guards.test.mjs already compares each file's by-file count with the count a --files= dry run lists, so the acceptance looks met; running that case on main would settle whether it is done.
- P-467 (parked, hub): /home/user/noahjefferson/stop-guard.mjs is now a shell that refuses nothing and counts no branches, but the parked reason says the refusals came from the environment's git stop hook; seeing whether that hook still refuses on foreign remote branches would settle it.
- P-505 (open, hub): The comparing case the acceptance asks for appears to stand already in /home/user/noahjefferson/session-guards.test.mjs (the by-file case at step 119), and the count line shows both counts come from the same filtered list; running that case would settle whether the item can be closed by its result.
- P-515 (open, hub): /home/user/noahjefferson/privacy-patterns.mjs exists with its ATTRIBUTION patterns, but neither the item nor its finding says which word orders the fifth wave's close wrote past them, so the unmet acceptance cannot be tested; the close's lines would settle it.
- P-531 (open, hub): met: read /home/user/noahjefferson/session-brief.mjs (54 lines) and its comments state no count of the lessons, which is what the acceptance asks.
- P-543 (open, hub): met: read CLAUDE.md (34 lines); its only gates line names no file the hub lacks, and every file it names exists in the tree.
- P-556 (open, hub): met: read plans/native/skills/landing/SKILL.md, whose step 1 commits before step 2 runs the checks, so a new file is tracked before the checks read it; plan-land.mjs is retired and no untracked-file case exists.
- P-561 (open, hub): met: the finding already records the restart as the harness's, and the approval is the plan-mode button, as plans/native/running.md says under Mode.
- P-575 (open, hub): met: worker.md and checker.md say to write every path in full, which covers the bare scratchpad prefix; only the review file's ordering of the write before the command is not carried, as that file is retired.
- P-588 (open, hub): met: report.mjs, which sorted the Found lines, is named in archive/RETIRED-FILES.txt and absent from the tree, and the acceptance allows the file to be retired.
- P-593 (open, hub): met: read .claude/settings.json, which holds a permissions allow list of commands, and plans/native-setup.md, which records the harness's list as the design's replacement for step Commands; whether that shows the ask-before is for the owner to confirm.

## The counts

- Moot: 216.
- Standing: 100.
- Unclear: 34.
- In all: 350.
- Entries remaining in the list: 597.

## What stands, by repository

These are the standing and the unclear items, grouped by repository, with the parked ones set apart in each group.

- hub
  - Not parked: P-52, P-58, P-68, P-70, P-72, P-74, P-89, P-93, P-105, P-108, P-152, P-163, P-164, P-174, P-176, P-183, P-184, P-186, P-189, P-193, P-195, P-197, P-206, P-210, P-211, P-215, P-221, P-223, P-225, P-234, P-235, P-248, P-251, P-253, P-264, P-266, P-269, P-277, P-279, P-280, P-284, P-290, P-291, P-320, P-353, P-364, P-443, P-455, P-457, P-464, P-502, P-503, P-505, P-506, P-509, P-514, P-515, P-526, P-531, P-533, P-542, P-543, P-555, P-556, P-561, P-562, P-575, P-586, P-588, P-593, P-596
  - Parked, waiting on the owner or a setting: P-44, P-55, P-77, P-80, P-124, P-130, P-136, P-141, P-142, P-144, P-149, P-161, P-172, P-173, P-175, P-185, P-188, P-192, P-202, P-204, P-213, P-232, P-249, P-268, P-270, P-282, P-283, P-289, P-379, P-462, P-463, P-465, P-467
- Jefferson-Photography-Studio
  - Not parked: P-22, P-558
  - Parked, waiting on the owner or a setting: P-117
- the cloud environment
  - Not parked: P-49
  - Parked, waiting on the owner or a setting: P-12
- the owner's session settings
  - Not parked: none
  - Parked, waiting on the owner or a setting: P-15, P-16
- fauxplane
  - Not parked: P-24, P-36
  - Parked, waiting on the owner or a setting: none
- 3d-printing-pal
  - Not parked: P-25, P-37
  - Parked, waiting on the owner or a setting: none
- Intersecting-parallels
  - Not parked: P-26, P-38
  - Parked, waiting on the owner or a setting: none
- photo-pointer
  - Not parked: P-27, P-39
  - Parked, waiting on the owner or a setting: none
- MoleBridge
  - Not parked: P-28, P-40
  - Parked, waiting on the owner or a setting: none
- Cv-Thalweg
  - Not parked: P-29, P-41
  - Parked, waiting on the owner or a setting: none
- solve-ent
  - Not parked: P-30, P-42
  - Parked, waiting on the owner or a setting: none
- the hub and every app, on main and on staging where an app has one
  - Not parked: none
  - Parked, waiting on the owner or a setting: P-11
- the hub and every app
  - Not parked: none
  - Parked, waiting on the owner or a setting: P-13
- the owner's preferences file, outside any repository
  - Not parked: none
  - Parked, waiting on the owner or a setting: P-14
- Quietkeep
  - Not parked: none
  - Parked, waiting on the owner or a setting: P-35
- Jefferson-Line
  - Not parked: P-43
  - Parked, waiting on the owner or a setting: none
- the six repositories the line says are unread, which it does not name; the siblings are listed in REPOS.md
  - Not parked: none
  - Parked, waiting on the owner or a setting: P-73
- the app repositories
  - Not parked: none
  - Parked, waiting on the owner or a setting: P-120
- the app the line names without a repository; the neighbouring lines of the queue name Jefferson-Photography-Studio
  - Not parked: none
  - Parked, waiting on the owner or a setting: P-162
- hub and each sibling
  - Not parked: P-167
  - Parked, waiting on the owner or a setting: none

## Standing items that depend on retired ones

- P-320 (unclear) depends on P-341, now moot.

## Found and left alone

- The repository's .claude/settings.json still lists a command for the retired reply guard.
- The checker role requires the full commit id, while P-195, P-221 and P-225 ask for a rule against hex ids.

## The way forward

Approved on 13 November 2026. This part gives the order in which what stands is taken. Each piece is scoped on its own page and approved once when its turn comes. Costs are estimates, on the sonnet tier.

### Set done on 13 November 2026

- P-58: A read of /home/user/noahjefferson on main showed git status empty, git stash list empty, lessons 394 to 398 already committed under lessons/, and the name hasGoWord in no .mjs file, so no uncommitted go-word work stands and the line is dropped with that read as its reason.
- P-70: Read doctrine/apps.md line 106, which states the ruling of 2026-07-29 on the inline exception to the 44 pixel target, and a search of doctrine/apps.md, doctrine/never.md and DOCTRINE.md for the sentence opening Open for the owner found none.
- P-80: The command git stash list in /home/user/noahjefferson printed nothing, so no stash entry of that plan stands.
- P-124: In /home/user/noahjefferson the branch read main and git status printed nothing, so no modified tracked file or untracked lesson of that stretch stands and the line is dropped with that read as its reason.
- P-141: found/Q-HUB-89.md records the whole read sent again as the main thread's own call, and lessons/432-instructions-doctrine-and-hooks-outrank-the-notices-the-harness-prints.md exists and records that whole read, so the line records a held call and no change is owed.
- P-142: found/Q-HUB-90.md records the harness line followed over the gate, and lessons/432-instructions-doctrine-and-hooks-outrank-the-notices-the-harness-prints.md exists and holds the rule that a harness notice yields to a gate, so the line records a held call and no change is owed.
- P-531: Read session-brief.mjs (54 lines) and a search of it for the words lesson, 81 and 490 found none, so its comments state no count of the lessons.
- P-543: Read CLAUDE.md (34 lines): its only gates line says the gates before 12 November 2026 are retired and names no gates file, and every file path it names exists in the hub tree.
- P-588: report.mjs, the file that sorted the Found lines, is listed in archive/RETIRED-FILES.txt and is absent from the tree (ls report.mjs failed), and no other .mjs file holds Found line sorting, so the file that sorts them is retired.

Seven more were looked at and not set done, P-15, P-52, P-234, P-268, P-457, P-505 and P-561, each because a part of its acceptance was not observed, and each is listed below.

### The order

1. Workflows and the supply chain: P-167, P-184, P-185, P-280, P-282, P-289, P-290, P-353, P-586. A workflow that handles secrets runs a package unpinned, two workflows use secrets with no environment set, dependency branches and one session branch sit on the remote, and one check is not wired into the gates. It is first because it is the only piece about secrets. About four agents and 250,000 tokens. Run on 13 November 2026; what it did is under Piece 1 below.
2. The procedures and the roles: P-74, P-77, P-130, P-136, P-149, P-189, P-223, P-266, P-270, P-277, P-284, P-364, P-464, P-556, P-561, P-562, P-575. Pages only: what the landing reads before and after a push, what the roles say about shell shapes and writes, and two sentences the apps page lacks. It is second because it is the cheapest and reaches every session at its next start. About three agents and 100,000 tokens. Run on 13 November 2026; what it did is under Piece 2 below.
3. The checks agree with their words: P-72, P-89, P-152, P-183, P-248, P-253, P-515, P-533, P-542. Checks that list files two ways, skip untracked files, or say more than they do. It comes third because guard files change, so the full suite and every planted failure run. About five agents and 300,000 tokens.
4. The suite's runner: P-105, P-108, P-163, P-164, P-235, P-279, P-455, P-457, P-505, P-506, P-509, P-514, P-526, P-555. One guard file, the full suite and every planted failure. About four agents and 300,000 tokens.
5. The list and the records: the list's head rewritten for the new way, and P-93, P-161, P-192, P-206, P-210, P-211, P-234, P-251, P-264, P-269, P-283, P-291, P-320, P-443, P-503, P-596. It comes after the pieces whose results it records. About four agents and 200,000 tokens.
6. The cost instrument: P-52, P-172, P-173, P-174, P-175, P-176, P-197. It was built to measure plans, and plans in that form are gone. It waits on the owner's word that a measure by piece of work is still wanted, so it is last.

### Waits on the owner

Each stays parked or open as it is.

- Branch protection on main, set at GitHub: P-11, P-188.
- The environment's stop hook, set in the cloud environment: P-12, P-49, P-379, P-467.
- The settings allow list, including the bare Artifact entry and two entries naming another repository's paths: P-13, P-16, P-186, P-193, P-213, P-593.
- The preferences file outside any repository: P-14.
- One commit in the remote's history, kept or rewritten: P-44.
- What of the never page is trimmed: P-249.
- What of an earlier research plan's reports is kept: P-232.
- A rule against hex ids, which the checker's role now contradicts by requiring the full commit id: P-195, P-221, P-225. Recommended: retire the three, because the role is the later word.
- P-15: the acceptance needs the top tier on a plan's writing and every eject and the next tier on management, and no setting or record of that split was observed.
- P-268: the acceptance needs a recorded choice from a list of CLAUDE.md shapes, and no such record was observed.
- P-185: a session branch on the remote that holds 357 commits main lacks, to be landed or removed.
- P-184: whether a check that makes a stale dependency pull request an item is still wanted, now that no dependency pull request is open.

### Belongs to the apps

Each is taken at that app's next session started alone, after its move: the eight knowledge layers P-22 and P-24 to P-30; the nine pins and sweep callers P-35 to P-43; and P-68, P-73, P-117, P-120, P-162, P-204, P-215 and P-558; P-562, because the route for a pasted test-page report is the app's to give; P-167, which depends on the siblings' own pins; and P-586, which is about siblings whose CI installs a browser, the hub's own gate having passed on the current runner image on 13 November 2026.

### The harness's or the environment's

Nothing planned. P-55, P-144, P-202, P-462, P-463, P-465 and P-502 stay as they are.

### Found in this run and left alone

- The Done line of P-194 names plans/seed-template.md, which is absent from the tree and kept under archive/, and that is why P-234 stands.
- The suite's by-file case compares two dry listings and no real narrowed run, which is why P-457 and P-505 stand.

### Piece 1, run on 13 November 2026

The fax deploy's last step now runs the copy of wrangler that the pinned wrangler action installs in the worker folder, behind a version check, so a missing or wrong tool stops the step before any key is sent. The jobs in the fax deploy and in the analytics report were given names. The security page's paragraph now records the ten secrets-outside-environment findings of those two workflows with the reason they stand. The browser note in package.json was rewritten to the pair that was run. Pull requests 10 and 12 were closed without merging, after each one's change was read on main.

Set done:

- P-280: the accessibility gate ran once at playwright-core 1.64.1 and chromium revision 1243, ended with exit code 0 and its PASS line, and the note says so.
- P-282: two of the four dependency branches were gone, and the pull requests of the other two were closed after their changes were read on main.
- P-289: the fax deploy's last step runs the installed wrangler behind a version check, and the pin check prints no note for the file.
- P-290: the audit shows no anonymous-definition finding after the two jobs were named, and the findings left are recorded in SECURITY.md.
- P-353: the note was put right in the workflow itself, and the pin check ends with no note about it.

Moved:

- P-184 went to waits on the owner, as a question of whether the check is still wanted.
- P-185 went to waits on the owner, to be landed or removed.
- P-167 went to belongs to the apps, because it depends on the siblings' own pins.
- P-586 went to belongs to the apps, because it is about the siblings' CI images.

Not checked: a real run of the fax deploy needs the owner's dispatch and live credentials. Its first dispatch with the test key shows the change. A missing or wrong tool stops the step before any key is sent.

Found and left alone:

- The job in deploy.yml has no name, which the audit shows as informational and P-290 does not name.
- The two dependency branch names still stood on the remote after their pull requests were closed.

### Piece 2, run on 13 November 2026

Four sentences were written into both landing procedures, five into both worker roles, three into both checker roles and two into both managing procedures. One bullet was added to the running page under Mode, and one paragraph to section 15c of the apps page. Each pair of copies, the one under plans/native and the one under .claude, carries the same sentence in its own wording of paths and step numbers.

Set done in full:

- P-77
- P-130
- P-136
- P-189
- P-464
- P-561
- P-575

Set done with a half dropped by the approved page:

- P-74: the case is dropped.
- P-223: the case is dropped.
- P-270: the case is dropped.
- P-556: the case is dropped.
- P-266: the refusal is dropped.
- P-277: the refusal is dropped.
- P-149: the background run with its output in a file is dropped.
- P-364: the steps file is dropped.

The halves were dropped because the rebuild of 12 November keeps a hook for three rules only, so no gate was built.

Marked retired: P-284.

Moved: P-562 to the apps.

Not checked: that a session follows the new sentences, which the next pieces show.

Found and left alone:

- Nothing in the repository holds the two copies of a role or a procedure together, which is left for piece 3.
- The two copies of each role name the short page at different paths on purpose.

### Piece 3, run on 14 November 2026

Landed: the three fixes of the proof of 14 November, P-248 and P-253, and the pin check's own header and pass line narrowed to what it refuses. The hub's stop shim now stands aside where the dispatcher is wired, so a refusal prints once, and still runs the guard where none is wired. CLAUDE.md lists three shells. The hub's landing procedure says eight checks. The drift tool lists a changed file under doctrine/ with the headings of its changed sections, and the lessons check reads a citation written with a point as the lesson number, with one sentence in DOCTRINE.md that states the form.

Set done:

- P-248: doctrine-sync.mjs lists a changed file under doctrine/ with its changed headings, and its case passed in the full run.
- P-253: DOCTRINE.md states the form and lessons-check.mjs reads it, and its cases passed in the full run.

Left open:

- P-72 stays open. The check's own words now agree with what it refuses, and three other descriptions still say it holds no undeclared dependencies: doctrine/hub.md line 1137, HUB-REFERENCE.md line 287 and .github/workflows/doctrine.yml line 19. The first is a line of a rules page, which this piece did not change.
- P-515 stays open. Neither the item, its finding found/Q-HUB-466.md, nor any lesson names the word orders, so nothing was changed.
- The worker for P-89 and P-152 was sent again later on 14 November 2026 and its send passed.
- The four checks now read one set of files through gate-files.mjs, tracked files and new files that are not ignored.
- P-89 and P-152 are both set done.

Found and left:

- The quote check's sweep mode still lists files with its own tracked list.
- The hub's landing procedure still gives "because the checks read tracked files" as the reason for staging first. It is a line of a rules page and was not changed.

Left out of this piece on purpose: P-183, P-533, P-542, and a check to hold the two copies of a role or a procedure together.

### Piece 4, run on 14 November 2026

Landed: a run of the cases ends with its red cases and then the count line. A planted failure whose run throws prints CAUGHT with the throw named. The out flag, written --out=<file>, writes the run's print to the file. A narrowed run and a narrowed dry listing each print the line naming the guard files left out and how many planted failures that is. The dry listing gained three lines: the count it would run, the plants whose find stands in more than one place, and the plants stale by design. The suite's header comment names every group of cases and every case file, and a case holds it. The suite's file list names every root command file, with plan-land.mjs gone and doctrine-sync.mjs and pin-check.mjs added, and a case holds it. A new case passes one second to the start's git call against a planted fetch that sleeps for six. The turn rule and the staging line were changed in the procedures, and their old lines are released in plans/rules-released.md.

Set done: P-455, P-506, P-163, P-164, P-105, P-457, P-505, P-509, P-514, P-555, P-108, P-526 and P-235. The data point of P-235 stands as a Known line in the entries of P-54 and P-169. The full run over the whole change was made once: 120 of 120 cases passed and 255 of 255 planted failures were caught, none missed and none stale.

Left open: P-279 stays open. The full dry listing shows no planted failure whose file a full run does not run, and no record names the eleven.

Found and left:

- The dry listing names bare_source_read as stale by design although its run is caught, because its case reads the suite's own text.
- The new listing lines do not change the listing's exit code.
- The out flag takes only the form with an equals sign.
- A throw that escapes a plain run of the cases is not wrapped.
- The entry of P-235 gives 384 planted failures for hook-dispatch.mjs, and the suite holds 68 for that file today.

### Piece 5, run on 14 November 2026

Landed: a dated note of 14 November 2026 at the end of each of five lessons (320, 383, 385, 387 and 398), saying which gate the lesson's account describes and what of it still stands. A count verb in program.mjs, with cases for a line that holds, a wrong opening number, a breakdown that does not sum, a line with no breakdown and the real PROGRAM.md, and planted failures for each. The items count line under "## Items" corrected to open with 597 and sum to 597, adding 15 other entries and counting 537 findings from Q-HUB-1 to Q-HUB-543. The three goal lines in the head of PROGRAM.md, for goals 3, 4 and 5. The rest of the head was left as written, because the pages it summarises were made live again on 14 November 2026.

Set done: P-206, P-234, P-596, P-192, P-93, P-251, P-264 and P-291. P-192 was set done on a read of run 557 made through the connector on 14 November 2026, which had concluded with success on 2 November 2026.

Stay, each with a Known line of 14 November 2026 in its entry:

- P-161: four of the seven matters it names are in no entry, and the plan that named them is not in the tree.
- P-283: it waits on a run for a commit the item does not name, which was not read.
- P-210: Q-HUB-110 and P-162 still name no repository, and naming it needs a read of the app's own repository.
- P-211: P-13's Known line now gives 21 allow rules on 2 November 2026 and 34 today; the step 32 report is not in the tree, so the item stays open.
- P-269: the close entry under P-10 still reads as taken before the push, and the list of paragraphs that P-268 reads is not kept in the repository.
- P-320: no lesson yet says to read an app's own research file whole, and the seed print has no file left to stand in.
- P-503: no entry is ranked for Q-HUB-246, Q-HUB-247 or Q-HUB-248, and three entries would change the item count.
- P-443: left open and not parked; the doctrine records only an append with a pull before each write and an eject on conflict, which was not built, and the design is work for a page of its own.

Found and left:

- The lines of this record that retired an item because a file was absent rest, for doctrine/plans.md, plans/seed-template.md, agent-rules.md, aim-review.md and for the size of hook-dispatch.mjs and stop-guard.mjs, on a state of the tree that changed on 14 November 2026. Those retired items need a second read.
- archive/RETIRED-FILES.txt still lists agent-rules.md and aim-review.md, which are in the tree again.
- The done of P-194 may not hold, because agent-rules.md does not name the quote check's blockquote refusal.
- P-124 carries both a Done line and a Parked line.
- The seed template's list of checks lacks two checks the workflow runs.
- Lesson 320's declaration line still says checklist, with the choice written only in its note.

### The retired items read a second time, 14 November 2026

Why: several subjects of the retirements came back on 14 November 2026. The plans page, the agent rules, the review file and the seed's standing text are live again, the dispatcher holds the main thread again, and the stop guard judges a final reply again. So some Retired lines of 13 November 2026 were no longer true, and an item closed for a reason that stopped being true is an item lost.

Read again: 104 of the 217 retired items named one of those files or holds. Each was read against the tree as it stands today. The other 113 were not touched. No item was judged for whether its acceptance is met, and none was set done.

Counts: 98 are open again and 6 stay retired. Of the 6, four have a new Retired line that says what was looked for today and not found (P-131, P-139, P-145 and P-529) and two keep their old line because it is still true (P-46 and P-566). Retired fell from 217 to 119, and open rose from 45 to 143. Done stays 301, parked 32 and answered 2. The items count line still opens with 597 and holds.

Open again, 98 keys: P-45, P-59, P-60, P-62, P-67, P-69, P-71, P-79, P-84, P-88, P-92, P-97, P-106, P-112, P-113, P-114, P-115, P-116, P-118, P-121, P-123, P-126, P-127, P-132, P-133, P-138, P-150, P-153, P-154, P-156, P-157, P-158, P-160, P-209, P-224, P-230, P-231, P-236, P-237, P-241, P-243, P-244, P-274, P-284, P-308, P-321, P-333, P-342, P-466, P-468, P-469, P-470, P-472, P-473, P-474, P-476, P-478, P-488, P-489, P-490, P-491, P-492, P-495, P-496, P-507, P-508, P-510, P-512, P-516, P-519, P-520, P-521, P-523, P-524, P-527, P-530, P-532, P-536, P-537, P-540, P-541, P-546, P-547, P-548, P-550, P-552, P-553, P-554, P-560, P-563, P-564, P-568, P-570, P-571, P-572, P-573, P-579 and P-581.

Still retired, 6 keys: P-46, P-131, P-139, P-145, P-529 and P-566.

What was written: for each of the 98, the state is open, the old Retired line is kept word for word as a Known line headed "retired on 13 November 2026 with this line", and a second Known line headed "read on 14 November 2026" says which file and line shows its subject in the tree today and which part is still not there. The title, the Acceptance and the Depends line were not changed. program.mjs has no verb that writes this change, so the edits were made by a script run once.

Why so many: nearly all of those open again are cases where a rules page is live again and the gate that enforced it is still retired. Each waits on which gates are built again. The open list has grown by 98, from 45 open items to 143. Ranking them is for a later page.

Found and left:

- The page at doctrine/plans.md says an agent is latched after a refusal, while the dispatcher latches the main thread only (P-488).
- P-308's old line is true of the code. It is open only because the plans page states the record.
- P-554 and P-572 name a rule, the manager notes' File at the close lines, that stands in no live file.
- archive/RETIRED-FILES.txt gained a note that agent-rules.md and aim-review.md are in the tree again. No line of it was removed.

## The way forward from 14 November 2026

The way forward of 13 November 2026 is used up apart from its piece 6. 98 retired items came back open on 14 November 2026, and this section sorts the 125 open hub items and gives the order in which they are taken. Each piece is scoped on its own page and approved once when its turn comes. This section was drawn on 14 November 2026, and no item changed state by it.

### The counts

125 open hub items were sorted once each.

- Group 1, held already: 20.
- Group 2, set aside by a later page: 24.
- Group 3, a gap: 35.
- Group 4, records and wording: 32.
- Group 5, waits: 14.

### The order in which they are taken

Each piece is scoped on its own page and approved once when its turn comes. Costs are estimates, on the sonnet tier.

1. The items held already (group 1, 20 items). Each acceptance is read against the hold or the check its line names. An item is set done where the hold does what the acceptance asks, and stays open with the reason where it does not. It is first because it changes nothing but the list and shows what the five holds already cover. About four sends and 200,000 tokens.
2. The items set aside by a later page (group 2, 24 items). Each acceptance is read against the sentence its line names. An item is retired with that sentence as its Retired line where the sentence covers all of what it asks, and stays open where it asks for more. It runs with piece 1 in one landing. About four sends and 200,000 tokens.
3. The rules the workers and the checker read (4 items: P-84, P-123, P-284, P-470). Wording in agent-rules.md and aim-review.md, which every worker and checker reads at every send. About three sends and 120,000 tokens.
4. The small records (7 items: P-72, P-211, P-269, P-320, P-474, P-503, P-532). The pin check's three other descriptions, the list's small records, one lesson, and one index bullet. About four sends and 150,000 tokens.
5. The doctrine's own lines (2 items: P-533, P-542). A page of its own that shows every line before and after, because the wording of those pages is not a session's to change unseen. About four sends and 200,000 tokens.
6. The plans page and the seed template (18 items: P-71, P-150, P-153, P-156, P-209, P-236, P-342, P-510, P-530, and P-45, P-88, P-466, P-472, P-507, P-512, P-548, P-563, P-579). Each asks for an edit where a live page names a gate that is retired, or where the template words a step of the old plan shape. The short page already says that such a page binds as written and that only the refusal no longer arrives, so each is read first against that sentence, and most are expected to close without an edit. It is last because it is the least likely to change anything a session does. About four sends and 200,000 tokens.
7. The gaps (group 3, 35 items). These wait on the choice below, and what is chosen is built as one piece.

P-183 is not in a piece. Its fix names an app that is on no list, or renames it in nineteen lessons, and what is said of an unlisted app is not a session's to settle. It waits with group 5.

### The gaps, by what each would protect

The 35 items come down to these subjects. Each line says what the rule protects, what a small hold would be, and whether it is recommended.

Recommended to build, as one piece of about five sends and 400,000 tokens, with a proof in a fresh session:

- The read at a start (P-92, P-469, and with it P-133 and P-495). The standing pages are to be read whole at every start and after a compaction, before anything else, and nothing holds a session to it. A session that has not read the rules cannot follow them, and every other rule rests on this one. The hold: after a start or a compaction the main thread may only read until the two standing pages have been read whole.
- A message still waiting (P-59, P-121). The hold on a typed message reads only a message that has been delivered. One that sits in the queue while work goes on is not seen, so the work goes on over it. The hold: the dispatcher reads the queue as well.
- The approved page (P-550, P-568). A page is changed only by a change that is written and approved, and nothing stops a rewrite of the plan file after the button. The hold: the plan file is written only in plan mode, where the button follows.
- The state line (P-333, P-489, P-560). A reply is to end by saying whether the work is finished, paused on what, or running what. The reply hold judges four faults and this is not one of them. The hold: a fifth fault, a final reply with no state line.

Recommended to add as a line of the landing procedure, with no hold:

- Findings are filed (P-224, P-554, P-572). What a piece finds and leaves is written today as a line of the record, where nothing brings it to the next page. The landing files each such line with the list's own tool, so that it has a key and an entry.

Recommended not to build:

- A fence on a worker's shell lines and writes (P-79, P-593, P-540, P-537, P-195, P-221, P-225). The old fence judged every call of a worker against a list in the plan. The new way judges the output instead: a checker that did none of the work passes the exact commit, and the push guard holds the push until then.
- A fence on what the main thread may read (P-478). The hold on the main thread passes every read on purpose, and P-581, held already, asks for exactly that. Building it would bring back the refusals that cost a turn for a question one file answers.
- The record of hosts that were declined (P-112, P-114, P-115, P-118). The harness now asks for a host itself, by name, and the rule that a blocked host is a question stands on its page.
- The other tests of a reply (P-473, P-496, P-523). Each needs the guard to read meaning, and a guard that guesses refuses good replies.
- The approval marker, the start that waits for an open plan, and the record of a changed setting (P-490, P-524, P-308). Each served a gate that is retired.
- A hold for a bare option number (P-138). A choice is answered by a page and the button, which the hold on a typed message already passes.

Not a hold, and left open as work:

- How several sessions write the list without meeting on one line (P-443). It needs a design, on a page of its own.
- The word orders the privacy patterns miss (P-515). No record names them, so nothing can be built until one does.

### What waits (group 5, 14 items, and P-183)

- On the owner: P-174, P-176 and P-197 (the cost instrument, piece 6 of the way forward of 13 November 2026); P-184; P-186 and P-193 (the settings allow list); P-321 (the shape of the stop word); P-183.
- On another repository: P-62, P-68, P-210, P-215, P-562, P-586.
- On the harness: P-502.

### The items, one line each

#### Group 1, held already

#### Group 2, set aside by a later page

- P-67: The goals at the top of doctrine/hub.md say goal 3 was removed on 14 November 2026 because the status reports did not say what was needed, and this item is about the gate on the status page.
- P-97: The goals at the top of doctrine/hub.md say goal 3 was removed on 14 November 2026, and this item is about the source of the status page that went with it.
- P-116: The short page's sentence that the session scopes the work on one page with five parts and the plan is approved once sets aside the plan approval gate and its held names, described at doctrine/hub.md lines 310 to 314.
- P-154: The goals at the top of doctrine/hub.md say goal 3 was removed on 14 November 2026, and this item is about what a status printed after a notes edit.
- P-157: The short page's sentence that plan mode is for the scope because it gives the approve button, with the approval at the button only (plans/native/running.md, Mode), sets aside the restart gate described at doctrine/plans.md lines 330 to 347.
- P-230: The short page's sentence that the session scopes the work on one page with five parts and the plan is approved once sets aside the talk-before-approval gate described at doctrine/plans.md lines 313 to 330.
- P-237: The short page's sentence that where a rules page and the short page differ on how work is scoped and who does its steps the short page holds sets aside the dispatch gate and its pointer described at doctrine/plans.md lines 536 to 544.
- P-241: The short page's sentence that where a rules page and the short page differ on how work is scoped and who does its steps the short page holds sets aside the pointer read on each call, described at doctrine/plans.md lines 75 to 98.
- P-243: The short page's sentence that where a rules page and the short page differ on how work is scoped and who does its steps the short page holds sets aside the review gate and rules gate described at doctrine/plans.md lines 118 to 131 and 572 to 579.
- P-468: The status command is a status report, which went with goal 3 ("Goal 3 was removed on 14 November 2026. Background work is checked ... directly, and the status reports did not say what was needed.", the goals at the top of doctrine/hub.md).
- P-476: A step gate on a cleared close step belongs to the old shape of a plan's steps; the short page says "Where one of them and this page differ on how a piece of work is scoped and who does its steps, this page holds" (line 63), and "Workers on the cheapest tier do the steps" (line 36).
- P-521: The plan check's fault for a missing Sends priced line is of the old shape of a plan's steps; the short page's page of five parts, with the cost as its part 4, replaced it, and line 63 says this page holds where they differ.
- P-552: The refusal at the price and the count of a plan's sends are of the old shape of a plan's steps; the short page says "Say what a long run will cost before it starts" (line 18) and, where it differs on how work is scoped, "this page holds" (line 63).
- P-553: The count of a plan's sends against the plan's price is of the old shape of a plan's steps; the short page says "Say what a long run will cost before it starts" (line 18) and "this page holds" where they differ (line 63).
- P-570: The refusal at the price is of the old shape of a plan's steps; the short page says "Say what a long run will cost before it starts" (line 18) and "this page holds" where they differ on how work is scoped (line 63).
- P-571: The count of sends against the amendment's price is of the old shape of a plan's steps; the short page says "A plan is changed only for a reason ... written in full and approved before any work is done under it" (line 21) and "this page holds" (line 63).

#### Group 3, a gap

- P-59: The rule that a message waiting in the queue holds the calls, stated at doctrine/plans.md lines 303 to 312 and doctrine/hub.md lines 401 to 408, is held by nothing because the pending-message guard is absent and the dispatcher reads only delivered messages; it serves W.
- P-79: The rule that Bash runs only a command the step's Commands line names, at agent-rules.md line 18 and doctrine/hub.md lines 381 to 382, is held by nothing now that the fence that matched the entry is absent and hook-dispatch.mjs has no match; it serves L.
- P-92: The read hold now holds a session until the standing pages are read whole, but it judges a read by the line count, so an edit that keeps the length is not seen and no comparison of change times with read times exists.
- P-112: The rule that a failed call to a host is recorded as a reading and a 404 is a routing success, at agent-rules.md line 25, doctrine/plans.md lines 472 to 475 and doctrine/apps.md line 763, is held by nothing because the reply guard that kept the record is absent; it serves W.
- P-114: The rule that a record of declined hosts is kept and released, at doctrine/plans.md lines 472 to 475 and doctrine/hub.md lines 657 to 664, is held by nothing because the shared ledger is in the absent reply guard; it serves W.
- P-115: The rule that a failed call is recorded with its reading, at agent-rules.md line 25 and doctrine/apps.md lines 309 to 316, is held by nothing because the failed-call ledger is in the absent reply guard, and whether a lookup counts is a doubt written here; it serves W.
- P-118: The rule that the proxy notice is copied character for character into the release command, at agent-rules.md line 25 and doctrine/hub.md lines 657 to 664, is held by nothing because the reply guard that offered the reading is absent; it serves W.
- P-121: The hold on a waiting message ends when the message is delivered, but a delivered message with no go-word is still held by the typed word hold, and whether that meets "only until it is delivered once" is the doubt that keeps it open.
- P-133: No compaction line check stands in stop-guard.mjs, so the repeat check has no compaction line to set aside; whether the item survives is still a doubt.
- P-138: The rule of the correction hold, at doctrine/hub.md lines 409 to 429, is not held for a bare option number, which hook-dispatch.mjs lines 384 and 409 to 412 hold like any message with no go-word; it serves R.
- P-195: The rule is NO HEX WRITTEN at agent-rules.md line 21 and aim-review.md lines 114 to 137, no hook or check in the tree reads an agent's write for a run of seven or more hex-set characters, and it serves "Lighter never means less protected"; doubt written: the way forward of 13 November 2026 recommended retiring it on a conflict with the checker's role that is not now seen, since the checker's id is one a command printed.
- P-221: The rules are the no-hex rule at agent-rules.md line 21 and the rule that quoted text stays as written, and no guard or case holds which wins at a digit run in page text, serving "Lighter never means less protected"; doubt written: it depends on P-195 and may fall with it.
- P-224: The landing now files each finding with the list's own tool, but no closing check of the found folder stands in stop-guard.mjs or hook-dispatch.mjs.
- P-225: The rule is NO HEX WRITTEN at agent-rules.md line 21, which tells an agent to restate such a line in words, but no guard holds it, serving "Lighter never means less protected"; doubt written: the item's own acceptance says only that the agent rules say it, which they do.
- P-308: The rule that a ConfigChange record is written and read, at doctrine/plans.md lines 844 to 848, is held by nothing because hook-dispatch.mjs wires the event at lines 58 and 66 and writes no record; it serves L.
- P-333: The state line is now judged, but no gate refuses a declared stop while the call a refusal names was not made.
- P-443: The rule is doctrine/plans.md line 858, that the program is appended with a pull before every write and an eject on conflict, which nothing holds, and it serves "The owner is away from a session for hours" because a session that meets another session's push as a conflict stops with nobody to go on.
- P-469: The read hold asks for the whole of each standing page again and never for the changed lines only, and no case holds a pull that changes three lines.
- P-473: The rule that a choice may not name an untried route (doctrine/plans.md lines 470 to 471 and 481 to 492) is held by no test in stop-guard.mjs lines 98 to 106; it serves the purpose that no work is held behind a question (a choice sent back before its routes were tried).
- P-478: The rule that the main thread's reads are only of the record, with a refusal that says to send an agent (doctrine/plans.md lines 509 to 524), is held by nothing, since holdManager in hook-dispatch.mjs lines 535 to 551 passes every read; it serves the purpose that the paid tier is kept for judgement (the top tier is not spent on reading source). Doubt written: P-581 asks the opposite (reads pass), so these two must be settled together at the choice.
- P-489: No test of an end message's addresses stands in stop-guard.mjs, and no case lists addresses without a sentence for each.
- P-490: The rule that an approval is recorded as a marker from the transcript's approved exit (doctrine/plans.md lines 330 to 339 and 547 to 552) is held by nothing, since hook-dispatch.mjs lines 348 to 365 read the exit and write no marker; it serves the purpose that the work goes forward with nobody watching it (a restart must not lose the approval). Doubt written: the page's approval marker belongs to the retired gates, and the short page says the page is approved once at the button.
- P-495: The start print after a compaction still states no compaction time, so the print and its case remain.
- P-496: The rule that a statement of state is read in the same turn (the short page's never-rules, and doctrine/hub.md lines 268 to 273) is held by no test in stop-guard.mjs lines 98 to 106, and the item's exemption for a proposed option would live inside that test; it serves "Lighter never means less protected". Doubt written: with no test there is no false refusal now, so the real gap is the test itself.
- P-515: The rule is the never rule against attributing a message or a decision to the owner, at doctrine/never.md lines 116 to 151 and the first never-rule of the short page, which privacy-check.mjs holds through the patterns in privacy-patterns.mjs that miss some word orders, serving "Lighter never means less protected".
- P-523: The rule that the talk before a plan states in its first line what brings the button and the lower tier (doctrine/plans.md lines 313 to 318 and 456 to 457) is held by none of the four faults in stop-guard.mjs lines 87 to 119; it serves the purpose that the paid tier is kept for judgement. Doubt written: the button belongs to the plan route the short page revised, so this may be set aside.
- P-524: The rule that the start brings the hub forward only with no plan of the session open (doctrine/plans.md lines 861 to 862) is held by nothing, since bringForward in hook-dispatch.mjs lines 203 to 246 reads no approval marker and no plan in force; it serves the purpose that the work goes forward with nobody watching it (a start must not run over work in progress).
- P-527: The acceptance asks that a stop be held on a Done line beside a running agent, with a case and a planted failure; stop-guard.mjs is live again and holds no such thing, the pointer print it rode on went with goal 3, and whether the hold survives without that print is a doubt written here; it serves the purpose that the work goes forward with nobody watching it.
- P-537: The rule against a run of seven or more hex-set characters in a write (agent-rules.md line 21, plans/seed-template.md line 13) is held by no gate, since plan-fence.mjs is retired and neither hook-dispatch.mjs nor push-guard.mjs has one; it serves "Lighter never means less protected". Doubt written: the item asks only that the gate not refuse plain words, which is moot until a gate stands.
- P-540: The rule that an agent's shell line carries no redirect (agent-rules.md lines 18 and 20) is held by nothing, since holdManager passes every agent call (hook-dispatch.mjs line 537) and judges redirects for the main thread only (lines 543 to 547); it serves "Lighter never means less protected".
- P-546: The acceptance asks that the next move be printed at every prompt; the next move is a fact a session needs in order to act and not a status report, nothing prints it, and it is settled together with P-547.
- P-547: The rule that the print at each prompt says plan mode is on and what kind it is (doctrine/plans.md lines 300 to 302 and 344 to 370) is held by nothing, since hook-dispatch.mjs lines 644 to 647 print no plan-mode line; it serves the purpose that no work waits on a refusal a session could have avoided; the way forward half of the item went with goal 3.
- P-550: The rule that a plan is changed only for a reason and approved before work is done under it (the short page, "What is wanted from a session", line 21) is held by nothing against a rewrite of the plan file while it runs, since mayWrite passes a plan-file write (hook-dispatch.mjs lines 319 to 322 and 539); it serves the purpose that the work goes forward with nobody watching it.
- P-554: The landing's new last step files findings with the list's own tool, but neither it nor the verb file reads a manager note's File at the close line, and no case holds a notes file.
- P-560: The refusal of a reply with no state line names the state line and its three forms, but its first line does not say that nothing is running and a message is awaited.
- P-568: The rule that a plan is changed only for a reason and approved before work is done under it (the short page, "What is wanted from a session", line 21) is held by nothing against a main-thread write of the plan file with a plan in force, since mayWrite passes it (hook-dispatch.mjs lines 319 to 322 and 539); it serves the purpose that the work goes forward with nobody watching it.
- P-572: The verb file reads no manager note's File at the close line, and no case holds one.
- P-593: The rule is agent-rules.md line 18, that Bash runs only a command the step's Commands line names, and no guard in hook-dispatch.mjs, plan-guard.mjs or shell-words.mjs reads a shell line against it, serving "Lighter never means less protected"; doubt written: the short page's steps carry no Commands line and the finding says the harness's allow list replaces such lists, so the item may instead wait on the settings allow list.

#### Group 4, records and wording

- P-45: The edit is in plans/seed-template.md, whose line 12 and the ten-minute rule at agent-rules.md line 30 differ from the item's wording.
- P-69: The edit is in doctrine/plans.md lines 75 to 77, where the pointer sentence says the next move is read from a print that no file now makes, while the review that names the move is described at lines 101 to 110; the sentence is to say what is true of the code.
- P-71: The edit is in doctrine/plans.md lines 1030 to 1045, the paragraph on the stop guard's teeth, which disagrees with the four refusals now at stop-guard.mjs lines 98 to 115.
- P-72: The pin check's header now agrees with what it refuses, and three descriptions still say it holds no undeclared dependencies: doctrine/hub.md line 1137, HUB-REFERENCE.md line 287 and .github/workflows/doctrine.yml line 19, so the edit is in those three files.
- P-84: The edit is in agent-rules.md, lines 28 and 29, which carry the failure-block and harness rules but do not say a library file a scratch script imports needs the block.
- P-88: The edit is in plans/seed-template.md, lines 20 to 24, and agent-rules.md line 22, to say a step that reads another step's output names the file in its Facts.
- P-106: The edit is to the item's entry in PROGRAM.md (reword or retire against the refusals now printed at push-guard.mjs lines 298 to 303), and to doctrine/hub.md lines 375 and 657 to 664, which still describe printed check commands that no live gate prints.
- P-113: The edit is to the item's entry in PROGRAM.md (reword or retire, since the reply guard that counted fetches is gone) or a case in guard-cases/dispatch.mjs with two WebFetch calls to one host and no latch file written; the entry's acceptance names a case that does not exist.
- P-123: The edit is in agent-rules.md, which does not carry the eight-word limit that doctrine/never.md lines 162 to 166 state.
- P-126: The edit is in guard-cases/dispatch.mjs, adding to the correction case at line 529 a Bash git log that passes with no refusal, with the item's entry reworded to say readOfRecord and gitHistoryRead are not in the code.
- P-150: The edit is in doctrine/plans.md lines 830 to 835, which name a Drive guard as running when it is absent from the tree, and the doubt on how much of it the page describes is written here.
- P-153: The edit is in doctrine/plans.md lines 830 to 835, which name a Drive guard as running when it is absent from the tree.
- P-156: The edit is in doctrine/plans.md lines 830 to 835, which name a Drive guard as running when it is absent from the tree.
- P-158: The case for a read-only Bash of a run in progress is written, and what remains is a named way for the closing of a plan to read a run still going, which no page or code names.
- P-160: The edit is to the item's entry in PROGRAM.md (reword or retire, since no live gate holds a final stop on a step's sends), as stop-guard.mjs lines 87 to 116 judge a reply only.
- P-183: The finding gives two ways out, naming the one repository in the family list of REPOS.md or correcting the nineteen citations, so the edit is in REPOS.md or the lesson files under lessons/; no rule on a live page is broken, because lessons-check.mjs checks cited gate files and not repository names. Taken with what waits, as the order says.
- P-209: The acceptance asks that the baseline state the result of a search of the guard files, so the edit is in doctrine/plans.md lines 844 to 848, which still says a ConfigChange record is held by hook-dispatch.mjs.
- P-211: The edit is in PROGRAM.md, in the entry of P-13 and in any other record carrying the count of 20 allow entries; the step 32 report that carried it is not in the tree, so the entry may need its wording changed to say so.
- P-236: The acceptance allows the wall line to be the main thread's reading by design with the page saying so, and the edit is in doctrine/plans.md line 801, which states that no gate reads it, and its mention of the rules version.
- P-244: The edit is in doctrine/plans.md lines 824 to 835, which state agent sends judged in every state and a stop guard run under a plan only, where the code passes an agent's stop and runs the guard on the main thread only, and the record the acceptance asks for is to be added there.
- P-269: The edit is in PROGRAM.md, in the close entry under P-10 and the list of paragraphs that P-268 reads, which is not kept in the repository; the offset of the keys is already stated in the items line.
- P-274: The edit is to the item's entry in PROGRAM.md (reword or retire, since the rules gate it names is retired), and to agent-rules.md line 7 and doctrine/plans.md lines 572 to 579, which still describe a rules gate and a pin that no live file holds.
- P-279: The edit is to the item's entry in PROGRAM.md, which names 11 plants of a total of 1098 that the suite has since replaced, so the entry is reworded or retired against the dry listing and the full plants run recorded for 14 November 2026.
- P-284: The acceptance asks that aim-review.md name the bare git reads a review may make and say a format string is not among them, so the edit is in aim-review.md.
- P-320: The edit is a new lesson under lessons/ in the shape of lesson 472, saying to read an app's own research file whole before outside sources are named, and the seed print it also asks for has no file left to stand in.
- P-342: The edit is in doctrine/plans.md, which has no line stating a shape for research.
- P-466: The edit is in plans/seed-template.md lines 57 to 72, whose close step has no final line recording what could not be read.
- P-470: The edit is in agent-rules.md and aim-review.md (a sentence that no step or review checks a version or makes a folder) and in plans/seed-template.md (the Commands block at lines 27 to 54).
- P-472: The edit is in plans/seed-template.md, which holds no reading step; the rule that every route is tried is already at doctrine/plans.md lines 470 to 471.
- P-474: The live page doctrine/plans.md line 523 says a web read passes the manager fence, so the item asks for the opposite of a rule on a live page; the edit is to the item's entry in PROGRAM.md (reword or retire against that line), not to code. Doubt written: if a refusal of web calls is wanted, it is a new rule and not a restored one.
- P-488: The edit is to the item's entry in PROGRAM.md (reword or retire, since no agent is latched), or a case in guard-cases/dispatch.mjs in which an agent writes a report file twice with a latch standing; doctrine/plans.md lines 592 to 597 still say an agent is latched.
- P-491: The case for the entry call made in plan mode is written, and what remains is the status print that reads the mode at the time of the print, which nothing prints.
- P-492: The edit is in guard-cases/dispatch.mjs, adding to the correction case at line 529 a newest message that is a pasted test report with the plan-file write still passing, and the entry's wording noting that the second branch of the acceptance is the one the code holds.
- P-503: The edit is in PROGRAM.md, which needs an entry ranked for each of Q-HUB-246, Q-HUB-247 and Q-HUB-248, and the items count line changes with them.
- P-507: The edit is in plans/seed-template.md line 21 (the rule for a changed print or guard, to add the text and counts the old print produced).
- P-508: The edit is in plans/seed-template.md line 78, whose rule on reading the working copy's status beside other steps is to name a folder another step writes under as owned whole; the batch print half is of the retired seed command and is not asked.
- P-510: The edit is in doctrine/plans.md lines 854 to 858 and plans/seed-template.md lines 72, 84 and 87 (a sentence that a line names no person and no message sent to the session).
- P-512: The edit is in plans/seed-template.md (rule lines at 9, 78 and 84 to be replaced with the fifth wave's wording); the case file it names is retired.
- P-516: The edit is in aim-review.md lines 42 to 47, which read the unnumbered Next line of the notes and fall back on a status line that is retired; the status half of the item went with goal 3, and the review file's reading is what remains.
- P-519: The edit is in guard-cases/dispatch.mjs, adding a case with two plan-file writes and a go message between them, and the item's entry reworded to say the pending-message hold is not in the tree.
- P-520: The edit is in plans/seed-template.md and doctrine/plans.md, which the acceptance asks to state four lessons; the print it also asks for belonged to the plan check, which is retired.
- P-530: The edit is in doctrine/plans.md lines 300 to 303 (give the list the code holds in READS and STOP_TEXT, hook-dispatch.mjs lines 59 to 60 and 280 to 284).
- P-532: The edit is in doctrine/hub.md line 36 (the index bullet on the review gate, to state the plans page's rule or point at doctrine/plans.md lines 101 to 146).
- P-533: The edit is in doctrine/apps.md, putting right the eleven remnants of the scrub; the small check refusing an empty pair of brackets is a hygiene addition and no live rule requires it.
- P-536: The edit is to the item's entry in PROGRAM.md (reword or retire, since no agent is latched), or a case in guard-cases/dispatch.mjs in which an agent writes a second send's report with a latch standing; doctrine/plans.md lines 718 to 731 still say an agent is latched.
- P-541: The case for a hand-back naming stop-guard.mjs is written, and what remains is the printed line that reads the word stop in a typed message, which the prompt does not print, so the entry is to be reworded to the hold.
- P-542: The edit is in DOCTRINE.md and doctrine/never.md, where one of two sections takes a free id and every citation is swept in the same change.
- P-548: The edit is in plans/seed-template.md line 9 (the file step's order, naming one run for the step's own cases); the one-repair rule already stands at agent-rules.md line 25, and the fence half names retired plan-fence.mjs, so no fence is asked for here.
- P-563: The edit, if any, is in plans/seed-template.md, which already keeps the landing step as its own block at lines 83 to 87 apart from the file steps' rules at lines 77 to 78; the entry's record is what changes.
- P-564: The case for a hand-back that closes a step and one whose report holds the word stop is written, and what remains is the typed side, a printed line naming a correction or a stop, which the prompt does not print, so the entry is to be reworded to the hold.
- P-573: The edit is in plans/seed-template.md lines 63, 66 and 69, where each take-up block orders the landing command's proof for the checks alone before the manifest is written, though that command is retired; the order is to be put right or the line dropped with the command.
- P-579: The edit is in plans/seed-template.md (the Commands list at lines 27 to 54, to add the can-check line for a step that reads a guard's refusals).
- P-581: The case and the planted failure are written, and what remains is a settled meaning of the cost record, which no page or code gives, and the rewording of doctrine/plans.md lines 509 to 523 against P-478's settling.

#### Group 5, waits

- P-60: It waits on the choice between the whole word in any typed message and a reading by meaning, which the acceptance names and which is not recorded, while hook-dispatch.mjs lines 273 to 275 and 400 to 408 hold the whole word as CLAUDE.md line 23 states. The checker's finding is confirmed.
- P-62: It waits on another repository, because the harness guard it names is a hook of the app's repository and is not in this tree.
- P-68: Half of it is a refusal in the hub's plan guard, but the other half is each sibling repository's own notes parser, which only a session in that repository can read or change, and the way forward of 13 November 2026 already sent it to the apps.
- P-127: It waits on the choice whether the go-word refusal's six verbs at stop-guard.mjs lines 46 to 63 are widened by a plan that names them or are left as they are, which the acceptance names and which is not recorded. The checker's finding is confirmed.
- P-132: It waits on the choice whether a main-thread refusal reaches work already running, which the acceptance names and which is not recorded, while the latch at hook-dispatch.mjs lines 444 to 466 leaves agents out as the line suggested. The sorting into held already is corrected.
- P-174: It waits on the owner's decision whether a measure by piece of work is still wanted, which is piece 6 of the way forward of 13 November 2026; session-cost.mjs still holds the instrument.
- P-176: It waits on the same decision of the owner as the rest of the cost instrument, piece 6 of the way forward of 13 November 2026, because it asks the instrument to name a plan's step and a plan's close, and plans in that form are gone.
- P-184: It waits on the owner, whether a check that makes a stale dependency pull request an item is still wanted, now that none is open; the way forward of 13 November 2026 lists it under waits on the owner.
- P-186: It waits on the owner, who keeps or removes the two allow-list entries naming another repository's paths, as part of P-13 in the settings.
- P-193: It waits on the owner, who sets the prefix rules in the settings allow list, answered by the exact values of P-13.
- P-197: It waits on the owner, who confirms or changes the list the cost measure prints, and on P-10, which is piece 6 of the way forward of 13 November 2026.
- P-210: It waits on another repository: naming the repository for Q-HUB-110 and P-162 needs a read of the app's own repository, which is not opened in this session.
- P-215: It waits on another repository, since each sibling's pin is read from that sibling's own workflows, and the way forward of 13 November 2026 sent it to the apps.
- P-231: It waits on the owner, to whom the acceptance says the conflict is put once with one suggestion, though the stop guard now holds no instruction to send an agent and the conflict cannot arise at hook-dispatch.mjs lines 285 and 409 to 412 and stop-guard.mjs lines 98 to 116.
- P-321: It waits on the choice of the stop word's shape, which the item's acceptance names and which is still unmade, while the stop hold at hook-dispatch.mjs lines 272 to 275 and 404 to 408 takes the whole word in any typed message as the live rule states.
- P-502: It waits on the harness, whose connector returns a job log's lines too long to read, unless the finding is parked as the harness's.
- P-562: It waits on another repository, because the way forward of 13 November 2026 sent it to the apps: the route for a pasted test-page report is the app's to give.
- P-586: It waits on another repository, since each sibling whose CI installs a browser must be read for its image and Playwright version, and the hub's own gate passed on the current runner image on 13 November 2026.

### Pieces 1 and 2 of the way forward from 14 November 2026, run that day

Each of the 44 items of groups 1 and 2 was read against its own acceptance, not against the line that sorted it. The 28 lines that stay open were moved to the group their answer gives and reworded to say what the reading found. The 16 retired keep their lines where they stood. The counts and the order written above were left as they were.

Set aside by a later page, 24 items. 16 are retired, each with the sentence that set it aside as its Retired line, a "Retired:" line in its entry, and its state now retired: P-67, P-97, P-116, P-154, P-157, P-230, P-237, P-241, P-243, P-468, P-476, P-521, P-552, P-553, P-570 and P-571. 8 stay open, because each asks for more than the sentence covers: P-69, P-508, P-573, P-547, P-516, P-520, P-527 and P-546.

A first commit of that day retired 20. The check failed it for P-516, P-520, P-527 and P-546, because each asks for more than the sentence covers, and they were opened again the same day, each entry reading as it did before the first commit. The four moved to the group their new line gives: P-516 and P-520 to group 4, P-527 and P-546 to group 3.

- P-516, now group 4: aim-review.md lines 42 to 47 read the unnumbered Next line of the notes and fall back on a status line that is retired; the status half of the item went with goal 3.
- P-520, now group 4: plans/seed-template.md and doctrine/plans.md are asked to state four lessons; the print it also asks for belonged to the plan check, which is retired.
- P-527, now group 3: a stop is asked to be held on a Done line beside a running agent, which stop-guard.mjs holds nothing of, and whether the hold survives without the pointer print is a doubt.
- P-546, now group 3: the next move is a fact a session needs in order to act, nothing prints it, and it is settled together with P-547.
- P-69, now group 4: doctrine/plans.md lines 75 to 77 still say the next move is read from a print that no file makes, and the sentence is to say what is true of the code.
- P-508, now group 4: the rule on reading the working copy's status beside other steps, at plans/seed-template.md line 78, still names no folder another step writes under as owned whole.
- P-573, now group 4: the take-up blocks at plans/seed-template.md lines 63, 66 and 69 still order the proof for the checks alone before the manifest, for a command that is retired.
- P-547, now group 3: the rule that the print at each prompt says plan mode is on and what kind it is is held by nothing, and the way forward half of the item went with goal 3.

Held already, 20 items. None was set done. In 16 of them the hold does what the item wants, and the acceptance still asks for a case, a planted failure, a print or a line of a page that does not exist. 4 wait on a choice.

- The 16, now in group 4: P-106, P-113, P-126, P-158, P-160, P-244, P-274, P-279, P-488, P-491, P-492, P-519, P-536, P-541, P-564 and P-581.
- The 4 that wait on a choice, now in group 5: P-60 (the whole word in any typed message or a reading by meaning), P-127 (whether the six verbs of the go-word refusal are widened), P-132 (whether a refusal of the main thread reaches work already running) and P-231 (a conflict that can no longer arise, put once with one suggestion).

The cases the 16 ask for are work for a piece of its own, in guard-cases/dispatch.mjs unless another file is named, with the keys each would close:

- A Bash git log that passes under a correction, added to the correction case near line 529 (P-126).
- A newest message that is a pasted test report with the plan-file write still passing, added to the same case (P-492).
- Two plan-file writes with a go message between them (P-519).
- Two WebFetch calls to one host in one message, with no latch file written (P-113).
- An agent that writes its report file twice with a latch standing (P-488).
- An agent that writes a second send's report with a latch standing (P-536).
- A call to enter plan mode with the permission mode set to plan, near line 542 (P-491).
- A hand-back that names stop-guard.mjs, and a hand-back that closes a step with no stop word, near line 503 (P-541 and P-564).
- A read-only Bash of a run in progress that passes the manager hold (P-158).
- A read of the hub's configuration, code and cost record under the manager hold, and a planted failure that takes the exemption of reads out of holdManager (P-581).
- No case can be written yet for P-106, P-160, P-274, P-244 and P-279. Each asks for a print, a gate, a case on a send or a record that no live file holds, so the entry is to be reworded or retired first; P-244 asks for a line in doctrine/plans.md, and P-279 for a full run of the plants listing against a total the suite has since replaced.

Counts of the open hub items by group after this piece, from the corrected items list with the 16 retired left out: group 1, held already, 0; group 2, set aside by a later page, 0; group 3, a gap, 38; group 4, records and wording, 53; group 5, waits, 18. Total 109. The program holds 127 open entries, because 18 open entries are not hub items and were never sorted.

Found and left:

- The cases the suite holds for the dispatcher cover the hold on the typed word, the correction hold, the latch and the manager hold, but none uses a git log under a correction, a fetch, a write of a report by an agent, a pasted report, a plan-file write between two messages, or a read of the hub's configuration under the manager hold.
- The answers files end with a tally and carry no Found line, so the lines here are taken from their doubts: P-231 may be struck, because the conflict no longer exists; P-158 may belong with the items set aside by a later page, because the short page's own closing is a checker's pass and a read of the runs after the push; the acceptances of P-541 and P-564 describe a printed line that does not exist, and the behaviour wanted is held; P-581 and P-478 ask opposite things and are settled together; P-69 and P-547 may be struck instead of reworded, since the print each describes went with goal 3.
- The eleven plants of P-279 are named in no record, and the total they were counted against is no longer the suite's.
- Five of the sixteen retirements rest on thin cover by the check's reading: P-116, P-157, P-230, P-241 and P-571, named here so that a later read can find them.
- doctrine/hub.md still describes the status page gate and the plan gate's name check.
- aim-review.md still falls back on a status line that is retired.
- agent-rules.md still describes the rules gate and the plan check.

### The cases the holds lacked, run on 15 November 2026

Eleven things the holds do today were held by no case, so a later change could have undone any of them unseen. Pieces 1 and 2 of the way forward found them when each item's acceptance asked for a case the suite did not have. This piece writes the eleven cases and a planted failure for each, in guard-cases/dispatch.mjs, and reads each item against its case.

The eleven cases, each with its planted failure:

- P-126: a Bash git log, plain, with -C and piped, passes under a standing correction while an Agent send stays held (cr_git_log_read).
- P-492: with a pasted test report as the newest message, the plan file and the scratchpad can be written, and the first refusal of a new start says so (cr_pasted_report_plan).
- P-519: a go message between two writes of the plan file releases the correction hold (cr_go_between_writes).
- P-113: two fetches to one host in one message write no latch, for the main thread and for an agent (wf_two_fetches).
- P-488: a latched agent writes its own report file twice, and edits it, while the main thread stays held (lg_report_again).
- P-536: a latched agent writes the report of a first, second and third send, and the second send's note (lg_report_second_send).
- P-491: an entry to plan mode passes with nothing printed and no latch when the reported mode is already plan (pm_enter_plan).
- P-541: a hand-back naming stop-guard.mjs is no word stop and no correction, and a typed stop still holds (hb_names_stop_file).
- P-564: a hand-back that closes a step, and one whose report holds the word stop, set no hold and leave the one prompt line (hb_closes_step).
- P-158: read-only Bash calls of a run in progress and a read of its task output pass the manager hold, and a redirect is still refused (mg_check_in).
- P-581: the main thread's Read, Grep, Glob and Bash of a settings file, the hub's code and a session transcript pass the manager hold (mg_reads_of_record).

No hold was changed. hook-dispatch.mjs and stop-guard.mjs are as they were, and each new planted failure edits a copy of the hold in the plant's own run.

Set done, six: P-126, P-492, P-519, P-113, P-488 and P-536. Each case meets every part of its acceptance, and the done line names the case, the planted failure and the full run that passed them.

Left open, five, each with a Known line in its entry saying what remains:

- P-491: the status print that reads the mode at the time of the print, which nothing prints.
- P-541: the printed line that reads the word stop in a typed message, which the prompt does not print. The entry is to be reworded to the hold.
- P-564: the typed side, a printed line naming a correction or a stop, which the prompt does not print. The entry is to be reworded to the hold.
- P-158: a named way for the closing of a plan to read a run still going, which no page or code names.
- P-581: what the cost record is, which no page or code says, so whether a session transcript is that record is in doubt.

The suite after the run: 134 of 134 cases passed with none red, and 270 of 270 planted failures were caught with none missed and none stale. Before this piece it held 123 cases and 259 planted failures. The program holds 121 open entries where it held 127, and 307 done where it held 301. The count verb holds the items count line at 597.

Found and left:

- Several of the new planted failures share a find line with an older one, and the dry listing does not name them as ambiguous: hb_names_stop_file and hb_closes_step share one with hw_harness, wf_two_fetches and pm_enter_plan share one with each other, and the two latch plants lg_report_again and lg_report_second_send carry the line of hl_agent_free inside their own.
- P-158 may belong with the items set aside by a later page, since the short page's closing is a checker's pass and a read of the runs after the push.
- P-541 and P-564 ask for a printed line the prompt does not print, and what they want is held, so their entries are to be reworded.
- The cost record named by P-581 has no definition in the tree.

### Four rules given a hold, run on 16 November 2026

Four rules stood on live pages with nothing to hold a session to them. This piece gives each a small hold, in hook-dispatch.mjs and stop-guard.mjs, each with its cases and planted failures, and reads the fourteen items they answer against their acceptances.

The four holds, each with the opening words of its refusal and what lifts it:

- The read at a start: "STANDING PAGES UNREAD". Until the short page, doctrine/never.md and doctrine/hub.md have each been read whole, only reads and the main thread's TaskStop pass. The three reads lift it, and a compaction makes the read due again.
- A message still waiting: "MESSAGE WAITING". A typed message in the queue, not yet delivered, holds as a delivered one does, a stop message holding every call and a message with no go-word holding new starts, and the refusal prints the message. Nothing lifts it while it waits; a later typed message that ends with a go-word, or an approval at the button, lifts it once it is delivered.
- The approved page: "PLAN FILE WRITE OUTSIDE PLAN MODE". A write of a file under the plans folder on the main thread outside plan mode is refused. Plan mode lifts it, and where the harness names no mode for a call the write passes as before.
- The state line: a fifth fault of the reply hold in stop-guard.mjs, whose refusal names the state line and its three forms. A final reply whose last line opens with State and says finished, paused or running lifts it.

The landing procedure gains one step, the last in its list although it is done before the commit: each thing found and left is filed with the list's own tool, so that it has a key and an entry. Two lines of CLAUDE.md and one line of the running page were brought to the holds, with the old lines listed in plans/rules-released.md.

Each hold passes on its own error: a hold that throws lets the call pass, one line goes to the error output, and the other holds still judge the call. A case holds this for the read hold and for the plan file hold, and the dispatcher's own case holds it for every hold.

Set done, three: P-59 (the hold on a message still waiting), P-550 and P-568 (the plan file hold). Each done line names the hold, the case and the full run.

Left open, eleven, each with a Known line in its entry and a sentence in the items list above saying what remains:

- P-92: a change that keeps a page's length is not seen, and no comparison of change times with read times exists.
- P-469: the read hold asks for the whole page again and never the changed lines only, and no case holds a pull that changes three lines.
- P-133: no compaction line check stands in stop-guard.mjs for the repeat check to set aside.
- P-495: the start print after a compaction states no compaction time.
- P-121: in doubt, because a delivered message with no go-word is still held by the typed word hold, whether that meets "only until it is delivered once".
- P-333: no gate refuses a declared stop while the call a refusal names was not made.
- P-489: no test of an end message's addresses.
- P-560: the refusal does not say in its first line that nothing is running and a message is awaited.
- P-224: no closing check of the found folder.
- P-554 and P-572: no reading of the manager notes' File at the close lines by the landing step or the verb file, and no case on a notes file.

The suite after the run: 149 of 149 cases passed with none red, and 310 of 310 planted failures were caught with none missed and none stale. The eight checks and the security check passed. The program holds 607 entries after the filing, and the count verb holds the items count line.

Findings filed, ten, as Q-HUB-544 to Q-HUB-553 (P-598 to P-607): a waiting message counted as waiting after a resume; a waiting stop message overtaken by a later message let go unprinted; nothing printed at a start saying the standing pages are due; the read hold's switch in a hook process's environment; a path beneath a folder of the plans folder refused by the manager hold first; the landing step standing last though done before the commit; the landing step one that cannot rebase a dirty tree; the short page's sentence that nothing stops a session that breaks a rule now held; the short page's sentence on the final reply lacking the state line; and the native copy of the landing procedure lacking the filing step.
