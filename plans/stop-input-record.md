# The Stop input's list of running background tasks: the record

Written by step 28 of the plan that serves P-19. Step 29 builds from this record and step 30 closes from it. Everything below was read in the session that wrote it; a fact that a later read contradicts ejects the step that meets it.

## What was read

The hub's main head of 5 November 2026 is the head both clones stand at. The working clone and the live clone were fast-forwarded to it and both were clean.

The agent rules file at the live clone reads version 5. The install ran from the live clone and printed its one closing line: hook-dispatch wired SessionStart, UserPromptSubmit, PreToolUse, PostToolUse, PostToolUseFailure, Stop, PreModelSwitch and PostModelSwitch in the user settings file.

The harness version is the version field of the session transcript's entries. It moves within one session, through 2.1.316 and 2.1.317 to 2.1.318, and the newest value is 2.1.318. The model-switch hooks need 2.1.251 or later, so that is met.

## P-19 and the findings its Depends line names

P-19 at the head: state open, plan none, goal 5. Acceptance: the hold on a stop while background work is running reads the background_tasks and session_crons lists of the Stop hook's input and not the transcript's task notices; a case with a planted input shows the stop held with one task running and passed with none; the cases for a lost task (lesson 440) are retired or kept for the reason written here. Address: the maker's hooks page, read on 2 November 2026. Depends: the harness version this container runs, and Q-HUB-113.

The harness version is read above and the dependence is met.

Q-HUB-113 says the harness's exact words for a TaskStop of a lost task were never observed in a transcript, so the lister matches the phrase no task found, case-insensitively, with or without an id. Kept: this plan does not observe those words and cannot, because it plants no lost task in a live harness. The Stop input list answers the need from the other side, since a task the harness no longer has is absent from the list or carries an ended status, so the guard no longer depends on the phrase wherever the list is present. The lister and its phrase stay as the fallback for an input without the list, and the finding stays open for that path.

The sentence for P-19's Done line at the close: Q-HUB-113 is kept, not fixed: the stop guard reads the Stop input's list first so the phrase for a lost task no longer decides the hold where the list is present, and the lister that matches the phrase stays as the fallback, so the words of a real lost-task answer are still unobserved.

No file under found/ is written by this plan. The five findings Q-HUB-85, Q-HUB-91, Q-HUB-95, Q-HUB-105 and Q-HUB-126 are P-17's Depends and are left alone.

## The Stop input as the documentation states it

Stop hooks receive stop_hook_active, last_assistant_message, background_tasks and session_crons. Both lists are present when the task registry is reachable and are empty when nothing is in flight or scheduled; both are omitted when the registry is not reachable.

A background_tasks entry carries id, type, status and description (capped at 1000 characters), and by type: command (shell only), agent_type (subagent only), server and tool (monitor and MCP task), name (workflow only). The type labels are shell, subagent, monitor, workflow, teammate, cloud session, MCP task, or the raw discriminant for a kind the documentation does not list.

A session_crons entry carries id, schedule, recurring and prompt.

The cap of eight consecutive continuations applies to Stop blocks (P-20 measures it; this plan does not change it).

## The hold as it reads today

In stop-guard.mjs, lines 386 to 417: HOLDS_STOP at line 401 drops every entry that starts with the word agent; line 403 reads runningWork from report.mjs and keeps the entries HOLDS_STOP passes; line 409 refuses when any remain and no owner message is queued, and the refusal lists them.

runningWork is report.mjs lines 1630 to 1639. It returns one entry per running agent and, from runningTasks, one per running background task. runningTasks is report.mjs lines 1558 to 1618. It opens a task on the harness's launch line in a tool result and ends it on a task notification with an ended status, on a stop line, on a TaskStop answered with no task found, or on the newest session start whose source is a startup or a resume.

The lister's two ways out are those last two, which lesson 440 states. Their cases are in session-guards.test.mjs lines 1263 to 1286, the guards tasks_not_found, tasks_not_found_call, tasks_restart and tasks_restart_source. The agents-hold case is lines 1243 to 1262, and the first running-work case, with the guards running_work and running_owed, is lines 1220 to 1242.

## How the Stop payload reaches the guard

The harness sends the Stop payload to hook-dispatch.mjs. The dispatcher reads all of stdin as raw text (line 3835) and, for each repository's Stop hook that names the stop-guard shim, replaces the command with the hub's own stop-guard.mjs and runs it with the same raw text as its input (lines 3806 to 3816, through the run function at line 3304). The payload therefore reaches the guard whole, with every key the harness sent, and stop-guard.mjs already parses it whole at its line 251.

So the one change in hook-dispatch.mjs that passes the payload whole is none: step 29 leaves hook-dispatch.mjs unchanged. report.mjs needs no named entry point either, since runningWork already exists and is exported; step 29 leaves report.mjs unchanged unless a case shows otherwise, and then it ejects.

## The design

The guard reads background_tasks from its input when the key is present as an array. It holds the stop on every entry whose type is not subagent and whose status is not an ended word. The ended words are completed, failed, killed, stopped, cancelled, canceled, done, finished, error, errored and terminated, compared without regard to case. Its refusal names each holding entry by its type and description, with the description cut to eighty characters, and gives the count of session_crons beside them as information, since a scheduled task is not work running and does not itself hold. Where the key is absent, or is not an array, the hold reads the lister through runningWork exactly as today, with HOLDS_STOP dropping agents, so lesson 440's cases are kept for that path. The queued-owner-message rule is unchanged and applies to both paths.

A running agent does not hold the turn: the harness's completion notice brings the session back. That is why a subagent entry never holds.

## The cases to add

One case, in the shape of the tasks cases, with four inputs run through stop-guard.mjs with a declared-stop reply, each given an input that carries a transcript path:

- background_tasks holding one shell entry with status running: the stop is refused (exit 2).
- background_tasks empty: the stop passes (exit 0).
- background_tasks holding one subagent entry with status running only: the stop passes.
- background_tasks absent, with a planted running task in the transcript: the stop is refused through the lister.

## The plants

Two plants, in the suite's PLANTS map, each a find text, a replacement and the file, and run only through the suite's plants option:

- input_read takes out the read of the list: the condition that tests the key for an array is replaced by false, so the guard falls back to the lister; the shell-entry input is then not refused.
- input_type takes out the type exclusion: the subagent test is replaced so that subagent entries hold; the subagent-only input is then refused.

The find texts are copied exactly from stop-guard.mjs as step 29 writes it. The existing plants running_work and agents_hold_stop name lines step 29 changes, so step 29 updates their find texts to the new lines in the same edit and runs the narrowed plants to see each caught.

## Invocations

The suite narrowed to the stop guard's plants: node /home/user/noahjefferson/session-guards.test.mjs --plants --files=stop-guard.mjs. The plants print each caught or missed.

The suite whole: node /home/user/noahjefferson/session-guards.test.mjs. It may pass ten minutes and then runs in the background with its output in a file under the scratchpad's scratch folder.

The cost instrument for this session, as its header gives it: node /home/user/noahjefferson/session-cost.mjs followed by the path of this session's transcript, which lies directly in the project folder under /root/.claude/projects/ and is found with Glob. It takes the transcript and not a subagent file.

The hub checks: node /home/user/noahjefferson/lessons-check.mjs with no argument; node /home/user/noahjefferson/docs-check.mjs followed by the repository path as a positional argument; and privacy-check.mjs, third-person-check.mjs, quote-check.mjs and example-check.mjs, each with --repo and the repository path.

## The two lessons

Lesson 381 gains one dated paragraph in a sentence: from 5 November 2026 the stop guard's hold on background work reads the Stop input's background_tasks list first and uses the transcript lister only when the input has no list. Lesson 440 gains one in a sentence: its cases are kept because the lister is the fallback for an input without the list, and the phrase for a lost task stays unobserved there (Q-HUB-113). Each Enforced by line is extended and nothing is removed.

## CONFIG.md

Two rows name the hold. Section 1.1, line 24, says the Stop hook is changed by P-4 with P-19 and P-20 for the mechanisms that may replace parts of it. Line 48 says the Stop input's task lists are not wired in either settings file and are changed by P-19. Line 69 names stop-guard.mjs, changed by P-4, P-2, P-19 and P-20. Step 29 changes line 48 only, to say the stop guard reads the list from its input as the Stop hook delivers it (nothing is wired in a settings file for it, since the list rides in the existing input), and leaves lines 24 and 69 as they stand.

## The close entries under P-10

A close entry is a heading sentence naming the plan, its steps, the step that wrote it and the date and the instrument's numbering, followed by bullets: the owner's messages with go-words and corrections, stop-hook messages by source, main-thread refusals by gate, agents with their tier and token counts and hook refusals, main-thread turns by tier, compactions, resumes and pushes, and a line on dollars that says the transcript holds no price list (Q-HUB-132). Where the instrument does not print a figure for a plan the entry says not measured.

Step 30 writes three: the knowledge-layer plan of 3 November (P-23), the hub-pin plan of 4 November (P-35) and this plan (P-19). It also sets P-19 to done with the sentence above, P-23 to done with a line naming the head of facts, the facts test and the planted break watched red, and P-35 to parked with a line naming the pin, the hook and the marker at the hub head with the hub's pin check green, the caller on staging, and the dry run waiting on the promote.

## REPOS.md

The Quietkeep section, lines 40 to 56, reads under Gates wired in CI: the full Spine, plus the hub's privacy-check and privacy-mirror-check checked out and run. The shared-workflow section, lines 327 to 331, reads: Seven repos call it as of 2026-08-29, and Quietkeep's swap is written and NOT settled, pushed to that repo's staging, waiting on the owner.

As it will read after step 30: lines 329 to 331 say that Quietkeep's spine workflow calls the shared workflow on its staging branch, read on 4 November 2026, that the hub's pin check passes on it, and that the dry run of the sweep waits on the promote; line 327 counts eight repos with Quietkeep among them. Step 30 reads the Quietkeep row and the shared-workflow lines again before it edits and changes only what P-35's Done facts support.
