# What a gate enforces whole: the list to choose from

Prepared 2026-10-19 by step 119 of the plan that moved the loop's cost out of the hub. Nothing in `DOCTRINE.md` or `CLAUDE.md` is pruned by this file or by that step. The text is the owner's, a paragraph a gate enforces only in part stays and says which part (Doctrine §0e, LESSONS §396), and a session never prunes on its own reading. This list is what the owner chooses from: an item is replaced by one line, `*Enforced whole by:*` and the gate's file name, when the owner says so, and what the paragraph said stays in the lesson that recorded it.

**How an item got on the list.** A gate refuses the thing the paragraph describes, a case in `session-guards.test.mjs` feeds that gate the shapes the paragraph names, and a plant takes out the check and fails that case. The paragraph says nothing a person must still do that no gate checks. Every item names the gate and the cases, and the cases are named by a fragment of the name each carries in the suite, so each can be found with `--case=`. Each item is anchored by the paragraph's first words, quoted as they stand in `DOCTRINE.md` and `CLAUDE.md` at the time of writing; no line numbers are given, because they move with any edit.

## Doctrine paragraphs a gate enforces whole

1. **§0d, "ENFORCED, 2026-09-10, and no longer a paragraph."** The paragraph that says what `plan-guard.mjs` does in plan mode: it reads the mode out of the payload and the lock marker, allows only readers, refuses everything unrecognised. It is a description of the gate, and the gate is the file.
   - Gate: `plan-guard.mjs`, run by `hook-dispatch.mjs`.
   - Cases: "plan mode allows exactly a reply-guard reading, and nothing riding with it"; "in plan mode an agent may stop its own task".
   - The sentence that a gate nobody has watched refuse is a hypothesis is the lesson's, and stays there.

2. **§0e rule 2, "Every status prints the pointer, and each hand-back, after the goals."** The paragraph on the `Order:` and `Standing:` lines, `next: step N`, and what the print carries under it.
   - Gate: `report.mjs` (`pointerState`, `pointerBlock`, `statusPage`) and the dispatch gate in `hook-dispatch.mjs`.
   - Cases: "the pointer is the first number on the plan's Order line with no hand-back opening DONE"; "the dispatch gate sends only step N and a Standing step"; "every status prints, after the goals, `next: step N`".

3. **§0e rule 2, "Where the plan carries a review step, a fresh agent clears every move before it goes."** The review step, the verdict's first line, and what makes a review current.
   - Gate: `reviewGate` in `hook-dispatch.mjs`, `reviewState` in `report.mjs`, and the refusal of an Order with no review step in `plan-guard.mjs`.
   - Cases: "a verdict is the first line of the reviewer's hand-back"; "reviewState clears a move only for a review that BEGAN after the newest end"; "reviewGate refuses a step of a plan with a review step unless the current review cleared that step"; "ExitPlanMode refuses a plan with an Order whose Standing line names no step that follows the hub's aim-review.md".

4. **§0e rule 2, "The state of the work is one page, and the manager's part of it is kept where a status cannot rewrite it."** `status/fix-run.html`, `status/manager.txt`, the lines the notes carry, what the page draws from them, and the read of the page after a compaction.
   - Gate: `managerNotes`, `sortFound`, `stepChip`, `reviewWords` and `statusPage` in `report.mjs`, `isManagerNotes` in the manager fence, and `pageGate` in `hook-dispatch.mjs`.
   - Cases: "the manager's notes survive a status"; "the status page is drawn in the shape the owner reads"; "the main thread may write status/manager.txt in its own scratchpad"; "the status page gate holds the main thread to reads after a compaction".
   - This step adds the `Judged N:` line and the Judgement status line to that gate, and the page's shape (the Version, Open, What, Why, Next and Done lines and the chip of each step); the paragraph does not yet mention them, and it still describes the old page's outcome, explanations and decisions, which the page no longer draws.

5. **§0e rule 2, "Work running in the background is the work" and "A running agent does not hold the turn."** Two paragraphs: a stop is refused while a task the session started runs, and an agent does not count among the tasks.
   - Gate: `stop-guard.mjs`.
   - Cases: "a stop is refused while a task this session started is still running, declared or not, and allowed once it ends"; "a stop passes while an agent this session launched is still running".

6. **§0e rule 3, the tail beginning "Held work (LESSONS §376) is sent again only in a turn that follows a go-word."** Held work, the messages that are not the owner's, the message the harness never delivered, and the queue that loses one.
   - Gate: `pending-guard.mjs` and the held-work print in `hook-dispatch.mjs`.
   - Cases: the first ten cases of the suite (an enqueued message refuses the main thread and a delivered one refuses nothing), "a call refused while an owner message waits is held, printed at the top of the turn that delivers the message", "a message the counts call pending stops holding work once an owner message typed AFTER it has arrived".

7. **§0e rule 13, the paragraph beginning "Enforced by: the manager fence in `hook-dispatch.mjs`."** The list of what the main thread may do, the record it may read, and what the dispatch gate sends. It lists the gate's own allow-list, which moves with the code.
   - Gate: the manager fence and the dispatch gate in `hook-dispatch.mjs`, `plan-fence.mjs` for agents, `plan-guard.mjs` for the plan's shape.
   - Cases: "the manager fence lets the main thread read the record, send agents, stop a task, publish and write the status page"; "the dispatch gate passes only the approved plan's path and a step it has"; "the manager fence passes a read only of the record"; "the gates read the approved plan only while its hash matches the approval".
   - The first half of rule 13, that the manager checks each result against the plan and the owner's messages, is judgement and stays.

8. **§0e rule 14, the paragraph beginning "A Stop refusal never latches."** What the latch lets through, that an agent's refusal latches that agent only, what clears it, and what an agent cannot do.
   - Gate: the latch in `hook-dispatch.mjs` and the stop in `stop-guard.mjs`.
   - Cases: "a refusal latches the session"; "a refusal inside an agent latches that agent only"; "while latched the main thread's TaskStop passes"; "only a message the owner typed after the latch clears it"; "the latch goes by when a message was typed, not when it arrived".
   - The opening paragraph of rule 14, with its instruction to say in plain text what was refused and stop, stays.

9. **§11, "The web-task harness keeps designating a `claude/*` branch. IGNORE it".** The list of pushes the gate refuses, and the connector tools it refuses. The sentence that only `staging` and `main` reach a remote is the rule; the list is the gate.
   - Gate: `push-guard.mjs`, for the main thread and every agent.
   - Cases: "the push gate passes pushes that land on staging or main and refuses every other branch, deletion and bulk push" and the seven cases beside it.
   - The paragraph after it, on the branch sweep, is enforced by a workflow and not by a gate that refuses, and stays.

10. **§11e, the paragraph beginning "Enforced by: `doctrine-read-guard.mjs`, on the main thread."** What is due at a startup, a clear, a compaction and a resume, and what clears it.
    - Gate: `doctrine-read-guard.mjs`.
    - Cases: "while the doctrine is due the main thread may only read"; "a startup, a clear and a compaction make every line of the doctrine due"; "a resume owes nothing when the Read results since its last compaction cover every line".
    - The two paragraphs above it, on the cadence and on running `doctrine-sync.mjs`, are partly judgement and stay.

## Hub CLAUDE.md bullets a gate enforces whole

1. **"A TURN THAT ENDS WITH STEPS LEFT IS A RETURN TO THE OWNER, AND IT IS REFUSED."** Gate: `stop-guard.mjs`. Cases: "a turn that ends with steps of the approved plan unreturned and no agent running is refused"; "with an Order in the plan, a turn that ends with the pointer at a step is refused"; "with a review step in the plan, a turn that ends with steps left is refused".

2. **"THE NEXT STEP IS READ OFF A POINTER, NEVER CHOSEN FROM MEMORY."** Gate: `report.mjs` and the dispatch gate. Cases as item 2 of the doctrine list.

3. **"A PLAN WITH AN ORDER HAS A REVIEW STEP, AND A FRESH AGENT CLEARS EVERY MOVE BEFORE IT GOES."** Gate: `reviewGate`, `reviewState`, `plan-guard.mjs`. Cases as item 3 of the doctrine list.

4. **"THE STATE OF THE WORK IS ONE PAGE, AND THE FIRST READ AFTER A COMPACTION IS THAT PAGE."** Gate: `report.mjs` and `pageGate`. Cases as item 4 of the doctrine list. This step added clauses on the `Judged` line and on the page's shape.

5. **"THE RULES EVERY AGENT FOLLOWS ARE ONE FILE, AND A PLAN POINTS AT IT."** Gate: `rulesProblem` through `plan-guard.mjs`, `rulesGate` in `hook-dispatch.mjs`, `rulesFirst` in `plan-fence.mjs`. Cases: "a plan that sends agents carries the rules or points at them"; "the rules gate sends no step while the version a plan's Rules line pins is not the rules file's"; "an agent's first call is the Read of the shared rules"; "an agent may read the approved plan, or the steps file beside it, before the rules".

6. **"THE MAIN SESSION IS A MANAGER, AND DOES NO WORK ITSELF."** Gate: the manager fence, the dispatch gate and `plan-fence.mjs`. Cases as item 7 of the doctrine list, and "the manager fence passes a read of the session's own saved tool results".

7. **"A CORRECTION FROM THE OWNER HOLDS NEW STARTS, AND ONE WORD STOPS EVERYTHING."** Gate: the correction check and the stop hold in `hook-dispatch.mjs`. Cases: "while the owner's newest message does not end with a go-word, every main-thread action is refused except the status command and TaskStop"; "a read of the record passes a standing correction and does not latch"; "the owner's holds are read from the transcript"; "a message carrying the whole word stop and no go-word holds the whole session until a go-word".

8. **"THE WHOLE DOCTRINE IS READ AT EVERY SESSION START AND AFTER EVERY COMPACTION."** Gate: `doctrine-read-guard.mjs`. Cases as item 10 of the doctrine list.

9. **"AFTER A COMPACTION OR A RESUME THE OWNER'S MESSAGES AND THE LESSONS ARE BOUNDED, AND THE DOCTRINE IS NOT."** Gate: `compact-recall.mjs`, `session-brief.mjs`, `doctrine-read-guard.mjs`. Cases: "after a compaction only the messages typed after the last assistant reply come back: the newest ten"; "the brief prints every lesson title at a startup, and after a compaction or a resume ... only the count and the folder"; "a resume after a part read owes every line".

10. **"ONLY `staging` AND `main` REACH A REMOTE, IN EVERY REPO."** The one-line bullet that points back at the harness-branch item. Gate: `push-guard.mjs`. Cases as item 9 of the doctrine list. The bullet is a pointer, and the item it points at is a candidate by the same reasoning only in its rule sentence.

11. **"AskUserQuestion is permanently banned."** Gate: the refusal of the popup tool by `plan-guard.mjs`, the manager fence, `plan-fence.mjs` and `approved-plan-guard.mjs`. Case: "the choice popup tool is refused wherever it is called".

## Considered and left out, with the part no gate checks

- **§0, the ban on the popup tool.** The tool is refused everywhere (the case above), but the paragraph also tells a session to ask in plain text, and nothing checks that.
- **§0d, "AND A PLAN-MODE TURN ENDS WITH THE TOOL, NEVER WITH PROSE."** `stop-guard.mjs` refuses a reply that asks for approval in chat, and `plan-guard.mjs` refuses a write in plan mode, but a plan-mode turn that ends in a summary without asking for anything is not refused.
- **§0e rule 1, rule 4 and rule 6.** Rule 1 is judgement. Rule 4 also says the talk never pastes the plan, which nothing checks. The "never waiting on you" patterns in `stop-guard.mjs` have no case of their own in the suite.
- **§0e rule 2, the status paragraph and the finding paragraph.** What a status says is judgement, and no gate forces a finding to be recorded; the gate forces only that the next plan answers what was recorded.
- **§0e rule 15 and rule 12.** The state-claim gate reads words and cannot tell which read backs which sentence, and the paragraph says so.
- **§0f and §0g.** Each is gated in part (an Asked section, a watcher's verdict, a refused reply asking for the next work) and is wider than the gate.
- **§2, the table rule.** `docs-check.mjs` reads files and cannot see a chat reply.
- **§11f, "Enforced at the plan."** `plan-guard.mjs` requires the five sections, but no case in the suite removes that check, so it is not listed as whole.
- **The CLAUDE.md bullet "NO `cd`, IN ANY COMMAND".** The plan fence's refusal of `cd` for an agent has a case; the main thread's and plan mode's refusals have none of their own.
- **The CLAUDE.md bullets "A REFUSAL LATCHES UNTIL THE OWNER'S NEXT MESSAGE", "A STATUS IS THE MANAGER'S REPORT", "A STATEMENT OF STATE IS READ", "AN OPEN CHOICE IS THE FIRST THING IN A REPLY", "PLAN MODE ONLY, AND TALK DURING THE WORK" and "THE HARNESS IS THE OWNER SPEAKING".** Each carries an instruction to the session that no gate checks beside the part a gate does.
- **The bullets this step wrote** (the steps file, the judgement gate, the plan's quoted evidence and roadmap, the allow rules, the managing shapes, the planted session and the narrowed plants) describe gates that are new; they are not offered for replacement until they have run for a plan.
