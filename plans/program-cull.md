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
