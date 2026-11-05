# The Stop hook block cap: the record

Written by step 32 of the plan that serves P-20. Step 33 builds from this record, step 34 waits on CI while the planted run happens, and step 35 closes from it. Everything below was read in the session that wrote it; a fact that a later read contradicts ejects the step that meets it.

## What was read

The hub's main head of 5 November 2026 is the head both clones stand at after the fast-forwards of this step; the live clone moved over four commits and the working clone over one, and both were clean beforehand.

The agent rules file at the live clone reads version 5.

The harness version is the version field of the session transcript's entries. It moves within the session through 2.1.316 and 2.1.317 to 2.1.318, and the newest value is 2.1.318.

## P-20 and P-12 at the head

P-20 at the head was open, plan none, goal 6, and this step set it to planned under this plan's file name. Acceptance: the cap of eight consecutive continuations is measured once in this container with a planted run of consecutive stop refusals, and the result is written in the entry; the stop guard's refusals are then held below the cap, or the cap's variable is set in the environment. Address: the maker's hooks and environment-variables pages, read on 2 November 2026, with the note that the cap resets each time Claude calls a tool and that the hub's own stop hooks count against it. Depends: the harness version, met above, and P-12.

P-12, the environment's git stop hook, reads parked, plan none. It is the owner's setting, so the variable branch of the acceptance waits and this plan takes the branch that holds the guard's refusals below the cap.

## The cap as the documentation states it

After stop hooks have continued the turn eight times in a row, the harness overrides the next refusal and ends the turn. The count resets each time a tool is called. The cap is raised by the environment variable CLAUDE_CODE_STOP_HOOK_BLOCK_CAP. A hook's additional context goes through the same loop protections, the stop_hook_active input and the cap. The refusals of every Stop hook count, the environment's git check among them.

## What the transcript holds

A stop-hook refusal is a system entry of subtype stop_hook_summary whose hookErrors list is not empty. It also carries preventedContinuation, stopReason and the hook's own timing. A tool call is an assistant entry holding a tool_use block. The guard reads the transcript's tail with tailEntries, so both are visible to it; the refusal the guard is making at that moment is not yet written.

A scratch script read this session's transcript, 13181 entries: 53 stop-hook refusal entries in all, in runs between tool calls of 1 (42 runs), 2 (2 runs), 3 (1 run) and 4 (1 run). The longest run is 4, with its last refusal at 09:01 California time on 2 November, and the five entries after it were an assistant entry, one more stop-hook summary, a last-prompt entry, a cost-state entry and a tools-used entry. A run of nine or more would have been the measurement; 4 is not, so the plant runs.

## How the stop guard refuses today

The refusal path is the function refuse, lines 183 to 191 of stop-guard.mjs: it records the reply refused (one file per session under the stop-refused folder), writes the message to stderr and exits 2.

The handling of stop_hook_active is the block at lines 275 to 315, and it is the finding that shapes the design. When the flag is true, the guard first discharges the compaction notice and the tier line where the follow-up carries them, then makes at most one refusal, the follow-up that sends the refused reply again (lines 296 to 311, recorded as repeated so it is made once per turn), and then exits 0 at line 314. Every other refusal of the guard sits below that block and so runs only when the flag is false.

So within one continuation chain this guard refuses at most twice by construction: the first stop, and one repeat. It cannot reach eight by itself. The cap matters to it only through the other hooks' refusals in the same chain, and the one place it could add an eighth is that single repeat refusal. The hold is therefore designed on that line and nowhere else.

## The design of the hold

In stop-guard.mjs, a constant STOP_CAP of 8 and a constant HOLD_AT equal to STOP_CAP less one. A function stopBlocksSinceTool takes the tail's entries, walks back from the end until an assistant entry holding a tool_use block, and counts the system entries of subtype stop_hook_summary with a non-empty hookErrors list on the way.

In the repeat refusal, before it writes the record, the guard counts. Where the count is HOLD_AT or more it does not refuse: it writes one stderr line beginning STOP PASSED that names the count, the cap and the first repeated line, and exits 0. Where the count is lower, or the tail cannot be read, the repeat refusal is made as before. The dispatcher is not changed, because the tail shows the count: no counter file and no reset at PostToolUse is needed.

The hold's count is seven until step 35 sets STOP_CAP from the measurement.

## The design of the plant

A marker file at scratch/stop-cap-plant.json in the session scratchpad holds the plan's file name, a step number, a limit of nine and a log, empty at the start. The guard reads it at every stop, before the stop_hook_active block, because the plant has to refuse whatever the flag says.

A new exported function in report.mjs, runningForPlanStep, is the named entry point the guard needs. It takes the Stop payload, a plan name and a step, lists the running agents with runningAgents, reads each one's prompt with agentPrompt, and returns true when one names that step and a plan path that holds the name; the prompt names either the plan or its steps file, so the name is looked for inside the path. It returns false for anything it cannot read.

While the marker is armed, which means the plan name and step are present, the log is shorter than the limit, and runningForPlanStep is true, the guard refuses every stop with a line opening PLANT and the call's number out of the limit, appends the call's number, time and stop_hook_active value to the marker's log, and exits 2 before any other refusal can run. It refuses nothing of its own while armed. Once the log holds the limit it reads the marker as spent and the normal guard runs. A marker that is not JSON, such as the word spent, an empty object, or one with no plan and step, reads as absent, and so does a session with no scratchpad. Step 35 removes the marker by writing the word spent and then an empty object, so no harness tool deletes a file.

The refusal line tells the main thread to answer with the one line PLANT and the number and to make no tool call, so that no tool call resets the harness's count during the run.

## The cases to add in step 33

Two cases, each cited by plants that take out what they test. Both were drafted and watched green against a build of this design in this step, then taken out again so that step 33 builds them as its own work.

The hold case: three runs through stop-guard.mjs under a plan in force, each with a first stop refused for a waiting sentence and then a follow-up that repeats its lines. With six stop-hook refusals planted in the tail after the refusal, the repeat is refused. With seven, it passes with the STOP PASSED line. With seven where a tool call stands between the third and the fourth, the count is four and the repeat is refused. Guards: cap_hold_count, cap_hold_reset.

The plant case: a planted session with a scratchpad, a marker naming a planted plan file and step 34 with limit nine, and agents written under the session's subagents folder. With no agent, the stop passes and the log stays empty. With only an agent for step 36 of the same plan and an agent for step 34 of another plan, it passes and the log stays empty. With an agent for step 34 of the plan, written as the steps file's path, the first stop is refused with a line opening PLANT 1 of 9 and the next eight, sent with stop_hook_active true, with PLANT 2 to PLANT 9; the tenth passes; the log holds nine entries numbered in order whose first has the flag false and whose last has it true. A marker holding the word spent passes, and so does an empty object. Guards: cap_plant_armed, cap_plant_limit, cap_plant_log, cap_plant_line.

## The plants

Six, in the suite's PLANTS map, each a find text, a replacement and the file stop-guard.mjs, run only through the suite's plants option:

- cap_hold_count turns the test of the count against HOLD_AT into false, so the repeat is refused at seven.
- cap_hold_reset turns the break at a tool call into false, so the count runs across the tool call and the split run passes.
- cap_plant_armed removes the test that the agent is running, so the plant refuses with no agent.
- cap_plant_limit removes the test of the log against the limit, so the tenth stop is refused.
- cap_plant_log removes the push of the call to the log, so the log never fills.
- cap_plant_line changes the word PLANT at the head of the refusal line.

Step 33 copies the find texts exactly from the file as it writes it and runs the narrowed plants to see each caught.

## The instrument

The cost instrument now prints beside each plan's number the title line and the first program key of its Item section: from the plan text the approval result carries, or, where that holds no Item, from the plan file as last written under a plans folder, read from the Write call's input, when its title is the same. A plan whose text holds none says no item read or no title read. It is held by a case in the suite and two plants, cost_item_read and cost_write_read, both caught through the plants option narrowed to session-cost.mjs.

Run on this session's transcript it numbers nine plans. Plan 7 reads P-23 and is the knowledge-layer plan of 3 November; plan 8 reads P-35 and is the hub-pin plan of 4 November; plan 9 reads P-19 and is the plan that closed P-19. Plans 1 to 6 carry no Item section and print no item read. So the two close entries under P-10 that were written from agent counts and dates name the right items, and neither is changed.

## Invocations

The suite narrowed to the stop guard's plants: node /home/user/noahjefferson/session-guards.test.mjs --plants --files=stop-guard.mjs. A case alone: the same command with --case= and the case's opening words as one argument.

The suite whole: node /home/user/noahjefferson/session-guards.test.mjs. It may pass ten minutes and then runs in the background with its output to the tool's output file.

The instrument: node /home/user/noahjefferson/session-cost.mjs followed by the path of this session's transcript, directly in the project folder under /root/.claude/projects/.

The hub checks: node /home/user/noahjefferson/lessons-check.mjs; node /home/user/noahjefferson/docs-check.mjs followed by the repository path as a positional argument; and privacy-check.mjs, third-person-check.mjs, quote-check.mjs and example-check.mjs, each with --repo and the repository path.

## The lesson

Lesson 381 gains one dated paragraph in a sentence: from 5 November 2026 the stop guard adds no refusal to a continuation whose transcript tail already shows seven stop-hook refusals since the last tool call, and its plant mode refused nine stops in a row once to measure the harness's cap. Its Enforced by line is extended and nothing is removed.

## CONFIG.md

Line 24 says the Stop hook is changed by P-4 with P-19 and P-20, and stays. Line 49 names P-20 among the changers, and stays. Line 69 reads: the stop guard, 1027 lines, refusal sites 16, 14 calls of refuse( and 2 lines with process.exit(2), changed by P-4, P-2, P-19 and P-20. After step 33 it reads the line count of the file as built, refusal sites 17, 14 calls of refuse( and 3 lines with process.exit(2), the third being the plant's, with the changers unchanged. Step 33 counts the lines and sites from the file and does not copy these figures.

## The close entries under P-10

A close entry is a heading sentence naming the plan, its steps, the step that wrote it, the date and the instrument's numbering and the plan's item, followed by bullets: the owner's messages with go-words and corrections, stop-hook messages by source, main-thread refusals by gate, agents with tier and token counts and hook refusals, main-thread turns by tier, compactions, resumes and pushes, and a line on dollars that says the transcript holds no price list (Q-HUB-132). Where the instrument prints no figure the entry says not measured.

Step 35 writes one for this plan, after the newest entry, naming it by the first clause of its title, steps 32 to 36, step 35 as the writer, and the instrument's number for it with its item P-20.

The sentence for P-20's Done line at the close: the stop guard's refusals are held below the cap: the cap of eight was measured once with a planted run of nine consecutive refusals, and the result is that BLANK; the hold's count is BLANK; and the cases are the hold case and the plant case. Step 35 fills each blank from the marker's log and the transcript.

## The result, written by step 35

The Done line of P-20: the stop guard's refusals are held below the cap: the cap of eight was measured once with a planted run of nine consecutive refusals, and the result is that the harness honoured eight continuations, each answered by one line with no tool call, and overrode the ninth refusal, ending the turn with a warning that a hook had blocked the turn from ending nine consecutive times; the hold's count is seven, unchanged by the measurement; and the cases are the hold case and the plant case.

How it was read. The marker's log held nine calls on 5 November 2026 between 17:07:55 and 17:08:29 UTC, the first with the loop flag false and calls 2 to 9 with it true. The transcript holds nine stop-hook refusals opening PLANT, numbered 1 to 9 of 9, with eight assistant replies between them and no tool call anywhere in the run, so the count was never reset. The ninth refusal is followed at once by a system warning that names the cap and the variable that raises it, and then by nothing until step 34's end brought the session back about six minutes later. The measured cap equals the documented cap, so STOP_CAP stays 8 and the hold's count stays 7.

The marker was spent by writing the one word spent and then an empty object, so the plant mode reads it as absent and never arms again.

The instrument could not number this plan: its approval result was saved as a large-output file and does not open with the approval sentence, so the plan is folded into plan 9. That is filed as Q-HUB-248, and the close entry under P-10 says the figures by plan are not measured. Plans 7 and 8 name P-23 and P-35, as step 32 found, and their close entries were right.
