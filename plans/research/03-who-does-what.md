# Who does what: the roles, the procedures and the step

Made by a step of the research page drawn on 19 November 2026. It records and recommends nothing. The documentation it cites was saved by that page's first step on the day it ran, and the commit that holds this file dates it.

## What the part is for

- The short page says the money spent on a session buys judgement and that the cheapest tier that holds the rules does everything else. Source: `plans/native/page.md:9`
- The short page says a piece of work is done by workers on the cheapest tier, then a checker that did none of the work opens the real output, and nothing is pushed until the checker has passed the exact commit. Source: `plans/native/page.md:36`
- The short page says each step is a list that cannot be done wrong, giving what it depends on, exactly what to do and with which commands, what must be seen for it to be done, and what ends it. Source: `plans/native/page.md:32`
- The short page says a step that meets what its page did not foresee ejects and the run stops there, and that the top tier then finds the cause before the page is changed. Source: `plans/native/page.md:38`
- The short page says a session does what was asked and nothing more, and that a correction narrows the work. Source: `plans/native/page.md:17`
- The record's requirement is that a step is a list that cannot be done wrong, that what returns needing judgement ejects to the plan where the higher tier judges, and that a lower tier does not judge alone. Source: `archive/plans/redesign-record.md:52`
- The record's requirement is that no step decides in isolation, that a plan does not continue on a logged error, and that the manager does not do the workers' work. Source: `archive/plans/redesign-record.md:53`
- The record's requirement is that the top tier is used for judgement and for a plan's writing and is not left running past the work that needs it. Source: `archive/plans/redesign-record.md:33`
- The record's requirement is that the context a task needs sits immediately beside the task, inside the plan's step. Source: `archive/plans/redesign-record.md:71`
- The record's requirement is that a failure the session can foresee is designed out of the plan and is not allowed to happen. Source: `archive/plans/redesign-record.md:70`
- The record describes three ejects: a step ejects to the plan, a plan ejects to the program, and the program ejects only where what moved is a matter of the person the hub serves. Source: `archive/plans/redesign-record.md:394`
- The record says each eject is a recorded move with its reason, so a later plan cannot pick the item up without reading why a plan stopped. Source: `archive/plans/redesign-record.md:400`
- The setup record says the hub holds three roles as the harness's own definitions: a manager that plans and judges and cannot edit, a worker, and a checker that can read and run and cannot edit. Source: `plans/native-setup.md:15`
- The setup record says what remained for a person to switch on was running the main thread as a manager role and naming a stronger tier as its adviser. Source: `plans/native-setup.md:41`

## What is there today

- Two role files stand in the shared copy under `plans/native/roles/`, the worker and the checker, and two stand in the hub's own agents folder with the same names. Source: Glob of `plans/native` and `.claude/agents`, run in this step
- No file under either roles folder defines a manager. Source: Glob of `plans/native` and `.claude/agents`, run in this step
- The hub's own settings file holds no key named agent, so no role is set as the main thread there. Source: Grep of `.claude/settings.json` for the word agent, run in this step
- The worker's definition names the sonnet tier, the tools Read, Edit, Write, Bash, Grep and Glob, and sets omitClaudeMd to true. Source: `.claude/agents/worker.md:4`
- The checker's definition names the sonnet tier, the tools Read, Grep, Glob and Bash, and sets omitClaudeMd to true. Source: `.claude/agents/checker.md:5`
- Neither definition lists the Agent tool, so neither role is given a way to send another agent. Source: `.claude/agents/worker.md:5`
- The worker is told to read the short page first as its first call and alone, then the agent rules whole. Source: `.claude/agents/worker.md:9`
- The worker is told to do the step and nothing outside it, and that a step seeming to need something outside it stops and says so. Source: `.claude/agents/worker.md:15`
- The worker is told to write every path in full, never to change directory, and to run commands in the foreground. Source: `.claude/agents/worker.md:16`
- The worker is told that when other workers run beside it, it stages nothing and commits nothing. Source: `.claude/agents/worker.md:19`
- The worker is told to push only when the checker has passed the exact commit, and to treat a refusal from a hook or the harness as an instruction. Source: `.claude/agents/worker.md:20`
- The worker's report lists what was done, what was seen, the files changed and what was found and not fixed on lines opening with Found, and its first word is DONE, FAILED, REFUSED or EJECT. Source: `.claude/agents/worker.md:24`
- The shared copy of the worker names the agent rules by a path under the configuration folder, and the hub's copy names them by a path in the working copy. Source: `plans/native/roles/worker.md:11`
- The shared copy of the worker adds two lines the hub's copy lacks: read the repository's entry in the repositories list, and commit on the work branch only. Source: `plans/native/roles/worker.md:15`
- The shared copy of the worker ends with a report line naming DONE, FAILED, REFUSED and EJECT. Source: `plans/native/roles/worker.md:26`
- The checker is told it did none of the work it judges and changes nothing: no edit, no write, no commit, no push. Source: `.claude/agents/checker.md:13`
- The checker is told to open the real output, judge it against the stated result part by part, and never fix what it finds but name it. Source: `.claude/agents/checker.md:15`
- The checker is told a file it needs for a check is written only in the session's scratchpad. Source: `.claude/agents/checker.md:18`
- The checker's answer opens with CHECK PASS or CHECK FAIL followed by the full id of the commit judged, then lists what was opened and what each thing showed. Source: `.claude/agents/checker.md:21`
- The checker is told to read the review file whole, and the review file says its first line is ON-AIM or OFF-AIM, then ROUTE-CLEAR or ROUTE-REFUSED. Source: `aim-review.md:68`
- The review file says the review is a fresh agent on the cheapest model that holds the rules and that wrote neither the plan nor the step it reviews. Source: `aim-review.md:22`
- The review file says the only command the review runs is node on one script under the container's temporary folder. Source: `aim-review.md:29`
- The agent rules say an agent's prompt is only the plan's path and a step number, and that the agent reads the rules file before anything else. Source: `agent-rules.md:5`
- The agent rules say a step has four parts read first in this order, Facts, Do, Observe and Kill, and that the step is done when Observe is seen and not before. Source: `agent-rules.md:22`
- The agent rules say the report is written as the work lands, and that the hand-back is one word and then a wall line. Source: `agent-rules.md:23`
- The agent rules say the wall line is one sentence on whether the step serves the plan's goal 1, whether that goal serves the asks, and whether what the step saw moved either answer. Source: `agent-rules.md:24`
- The agent rules say a red check is repaired once by the agent that made it, in a file it wrote in that send, and a second red check ends the step. Source: `agent-rules.md:25`
- The agent rules say EJECT is the hand-back for what the step did not foresee, and that an unforeseen thing is never settled by the agent's own choice. Source: `agent-rules.md:26`
- The agent rules say that at any refusal the agent hands back REFUSED, and that a different command for the same end is a second route and is refused. Source: `agent-rules.md:27`
- The agent rules say a step that lists its commands runs those, in that order, and nothing else. Source: `agent-rules.md:33`
- The shared copy of the piece-of-work procedure has sixteen numbered items and the hub's copy has fifteen. Source: `plans/native/skills/piece-of-work/SKILL.md:28`
- The piece-of-work procedure says the session that manages plans, sends and judges while workers do the steps. Source: `.claude/skills/piece-of-work/SKILL.md:6`
- The piece-of-work procedure says the page is scoped with five parts and put to approval once, after which the work runs to its end without further asking. Source: `.claude/skills/piece-of-work/SKILL.md:9`
- The piece-of-work procedure says workers that run together stage nothing and commit nothing, and one worker stages and commits after them. Source: `.claude/skills/piece-of-work/SKILL.md:10`
- The piece-of-work procedure says a checker that did none of the work answers CHECK PASS or CHECK FAIL for the exact commit before anything is pushed. Source: `.claude/skills/piece-of-work/SKILL.md:11`
- The shared copy of the piece-of-work procedure holds an item the hub's copy lacks, which says the first look before a build reaches a device is the checker's, in the container. Source: `plans/native/skills/piece-of-work/SKILL.md:12`
- The piece-of-work procedure says from the first uncommitted change to the push the managing session starts no other work and ends a turn only while a worker or the checker it sent is still running. Source: `.claude/skills/piece-of-work/SKILL.md:17`
- The piece-of-work procedure says when a step ejects the run stops and returns on the top tier, and the changed page opens with what the step met, why the page was drawn that way and how far the cause reaches. Source: `.claude/skills/piece-of-work/SKILL.md:19`
- The piece-of-work procedure says a run starts at a typed message that asks for the run, because the harness's own check judges a send against the typed messages. Source: `.claude/skills/piece-of-work/SKILL.md:26`
- The piece-of-work procedure says a cause found at a stop is filed as a finding by the next worker step. Source: `.claude/skills/piece-of-work/SKILL.md:27`
- The hub's landing procedure has eight numbered items and the shared copy has seven, and the two differ in their commands and paths. Source: `.claude/skills/landing/SKILL.md:25`
- The shared landing procedure sends a worker to the repository's entry in the repositories list for its work branch, its production branch and its promote route. Source: `plans/native/skills/landing/SKILL.md:6`
- The hub's landing procedure says to ask for the checker after the commit and that the push waits until the checker has passed the exact commit. Source: `.claude/skills/landing/SKILL.md:22`
- The hub's landing procedure says to file each thing the piece found and left with the program tool before the commit. Source: `.claude/skills/landing/SKILL.md:25`
- The app-move procedure exists only in the shared copy, and the hub's skills folder also holds a procedure named analytics-check that the shared copy lacks. Source: Glob of `plans/native` and `.claude`, run in this step
- The app-move procedure says it is done once for an app and starts when the session is asked to move the app. Source: `plans/native/skills/app-move/SKILL.md:6`
- The app-move procedure says its cost is two agents, a worker and a checker, on the cheapest tier that holds the rules. Source: `plans/native/skills/app-move/SKILL.md:32`
- The running page says the main thread cannot edit a repository file, stage, commit or push, and that a worker does the step. Source: `plans/native/running.md:50`
- The running page says sending an agent or a workflow is refused on the main thread while a top-tier model serves. Source: `plans/native/running.md:52`
- The running page says a write of a page under the plans folder is refused on the main thread while a tier below the top serves. Source: `plans/native/running.md:53`
- The running page says that after a worker's hand-back opens with EJECT nothing more is sent until a plan is approved, and that the approval is refused while the page does not open with a part headed Why it stopped. Source: `plans/native/running.md:54`
- The running page says a send that names a model above the sonnet tier is refused, because the roles carry their tier. Source: `plans/native/running.md:55`
- The running page says the worker and the checker carry their own tier, so the steps cost the same whatever serves the main thread. Source: `plans/native/running.md:70`
- The short page names the agent rules for a worker and the review file for a checker. Source: `plans/native/page.md:63`
- The short page says those pages bind as written, and that where one names a gate retired on 12 November 2026 the behaviour it asks of a session still binds. Source: `plans/native/page.md:64`
- The short page carries the step's four things as a sentence of plain words and carries no label for them. Source: `plans/native/page.md:32`
- The agent rules carry the step's four parts by the labels Facts, Do, Observe and Kill. Source: `agent-rules.md:22`
- The seed's standing text opens each step block with a number and a sentence and then the labels Facts, Do, Observe and Kill, and ends with a report path and an estimate. Source: `plans/seed-template.md:63`
- The seed's standing text states the four parts and the red-check repair among the rules of a plan. Source: `plans/seed-template.md:9`
- The plans page says every step carries Facts, Do, Observe and Kill. Source: `doctrine/plans.md:815`
- The piece-of-work procedure names the four things by plain words, what it depends on, what to do, what must be seen and what ends it, and carries no label for them. Source: `.claude/skills/piece-of-work/SKILL.md:18`
- The dispatcher today holds no code that reads the words Facts, Observe or Kill. Source: Grep of `hook-dispatch.mjs` for those words, run in this step
- No markdown page of the hub holds the words Must be seen. Source: Grep of the hub's pages for those words, run in this step
- The plan-shape check, the plan fence and the script gate are not files of the hub today: no file named plan-fence.mjs stands, and no source file holds the names rulesFirst, scriptProblem or WORKFLOW_SCRIPTS_ACCEPTED. Source: Glob and Grep run in this step

## What was there before the rebuild

- The commit before the rebuild is 4ea3157, and these lines are read from the copy of it saved in the scratchpad. Source: git rev-parse run in this step
- The plan fence's head comment says an agent works inside the approved plan and nowhere else, and that the plan is a ceiling enforced for each call. Source: `4ea3157:plan-fence.mjs:3`
- The plan fence's head comment says an agent's first call had to be a Read of the shared rules file, with a Read of the approved plan allowed before it. Source: `4ea3157:plan-fence.mjs:11`
- The plan fence's head comment says an agent passes only its own return, its own TaskStop, a sweep dispatch, a read, a write under the plan's Files section, or a shell line matching a reader or the plan's Commands section. Source: `4ea3157:plan-fence.mjs:19`
- The plan fence's head comment says the shell line is split where a new command starts, and every segment must be a reader or begin with an entry of the Commands section. Source: `4ea3157:plan-fence.mjs:34`
- The plan fence's head comment says a segment that is cd, pushd or popd, at any depth, is refused before anything else is judged. Source: `4ea3157:plan-fence.mjs:41`
- The plan fence's head comment says an agent sent for the plan's review step writes in the scratchpad and nowhere else. Source: `4ea3157:plan-fence.mjs:53`
- The dispatcher defined the four step labels as the list Facts, Do, Observe and Kill. Source: `4ea3157:hook-dispatch.mjs:1921`
- The dispatcher's step-shape check passed a plan with no Steps section, and for every step not on the Standing line required each label written as the word and a colon. Source: `4ea3157:hook-dispatch.mjs:1926`
- The dispatcher's step-shape check did not judge a Standing step, whose text is the instruction it passes on. Source: `4ea3157:hook-dispatch.mjs:1929`
- The step-shape refusal told the writer that every step has Facts as the asks and facts it depends on restated, Do as the exact actions, Observe as what must be seen, and Kill as what ends it with nothing further written. Source: `4ea3157:hook-dispatch.mjs:1947`
- The plan guard called the step-shape check as a fault of the plan's shape that sets no latch. Source: `4ea3157:plan-guard.mjs:1095`
- The plan guard also read a fifth part of a step, Files, alongside Facts, Do, Observe and Kill, to tell whether a step writes files. Source: `4ea3157:plan-guard.mjs:860`
- The plan guard read a step's Do part as the text from its label to the next label of the five. Source: `4ea3157:plan-guard.mjs:866`
- The agent rules at that commit stood at version 6 and carried the words Facts, Observe and Kill on two long lines. Source: `4ea3157:agent-rules.md:3`
- The step-shape comment at that commit named the agent rules as version 5. Source: `4ea3157:hook-dispatch.mjs:1920`
- The plan guard's note says a step that is not on the Standing line carries Facts, Do, Observe and Kill so the agent is told what it depends on, what to do, what means done and what ends it. Source: `4ea3157:plan-guard.mjs:1095`
- The record says a step is either a no-fail list or it is not a step, with the exact commands, the exact files it may change, the observation that means it worked, and kill conditions written before the run. Source: `archive/plans/redesign-record.md:418`
- The record says a red check ends the step and no write follows a red check in the same step, and that the agents' rule letting a failed command run again after a write licenses the loop that hurt. Source: `archive/plans/redesign-record.md:418`
- The record describes the wall check as a standing question asked at every stop, every plan boundary and every finding before the ladder question: does the step still serve its item, does the item still serve the app's thesis, and has what was seen moved either. Source: `archive/plans/redesign-record.md:392`
- The record says a step ejects to the plan, which is rewritten from the files, a plan ejects to the program, and the program ejects only where the matter is a person's own. Source: `archive/plans/redesign-record.md:396`
- The record names as not covered the agent back to the manager: the raw channel, with a hand-back that says only what ran and what differs. Source: `archive/plans/redesign-record.md:407`
- Lesson 375 recorded that a subagent the safety classifier stops returns less and the workflow counts it as done, with 133 sonnet-tier agents counted and 8 stopped, and 129 opus-tier agents counted and none stopped. Source: `lessons/375-a-stopped-agent-returns-less-and-says-nothing.md:9`
- Lesson 375 recorded the remedy that each stopped item is re-run on the session's model with its original prompt, and that a withheld result is never reported as found nothing. Source: `lessons/375-a-stopped-agent-returns-less-and-says-nothing.md:17`
- Lesson 375 recorded that the classifier's reasons are not visible from the session and the model split is a count and not an explanation. Source: `lessons/375-a-stopped-agent-returns-less-and-says-nothing.md:15`
- Lesson 400 recorded that a status print of about 120 KB reached the main thread as a preview of about 2 KB, and the manager worked from the preview. Source: `lessons/400-the-manager-read-the-preview-of-a-saved-print-and-a-refused-read-was-never-read-again.md:5`
- Lesson 400 recorded that a read the fence refused left nothing behind, so the next step went on the strength of what was missing. Source: `lessons/400-the-manager-read-the-preview-of-a-saved-print-and-a-refused-read-was-never-read-again.md:7`
- Lesson 400 recorded that a read counts as made when any Read of that exact path returned without an error, and that a read made through Grep or Bash is not recorded. Source: `lessons/400-the-manager-read-the-preview-of-a-saved-print-and-a-refused-read-was-never-read-again.md:11`
- Lesson 403 recorded that the harness's Workflow tool runs agents in order from a script with no turn of the main thread between them, and that it had been refused outright. Source: `lessons/403-a-plans-own-script-may-run-its-steps-but-only-the-script-the-owner-read-and-only-behind-a-constant-that-is-off.md:5`
- Lesson 403 recorded that a script was accepted only if it was byte for byte the plan's Script section, with its hash recorded at approval. Source: `lessons/403-a-plans-own-script-may-run-its-steps-but-only-the-script-the-owner-read-and-only-behind-a-constant-that-is-off.md:7`
- Lesson 403 recorded that acceptance sat behind a constant that was false, because nothing yet showed the plan fence held an agent a workflow starts. Source: `lessons/403-a-plans-own-script-may-run-its-steps-but-only-the-script-the-owner-read-and-only-behind-a-constant-that-is-off.md:9`
- The dispatcher at that commit held the constant for accepting workflow scripts, set to false. Source: `4ea3157:hook-dispatch.mjs:3279`
- Lesson 410 recorded that the rules-first fence as built would have refused an agent's Read of the plan, latching the agent at its first call. Source: `lessons/410-the-rules-first-fence-would-have-latched-every-agent-and-a-workflows-agents-were-never-found.md:5`
- Lesson 410 recorded that the agents a workflow starts keep their transcripts one level below the subagents folder, where the status, the pointer, the stop guard and the plan fence did not look. Source: `lessons/410-the-rules-first-fence-would-have-latched-every-agent-and-a-workflows-agents-were-never-found.md:5`
- Lesson 410 recorded that the probe of whether the fence holds an agent inside a workflow was not run, so the script gate stayed off. Source: `lessons/410-the-rules-first-fence-would-have-latched-every-agent-and-a-workflows-agents-were-never-found.md:9`

## What the documentation says

- The documentation says a session can run as a named subagent with the flag or the agent setting, so that the main thread takes that subagent's tool restrictions and model. Source: `docs:sub-agents`, Invoke subagents explicitly
- The documentation says a custom subagent's prompt replaces the default Claude Code system prompt unless the prompt is empty, and that CLAUDE.md files still load even when omitClaudeMd is set. Source: `docs:sub-agents`, Invoke subagents explicitly
- The documentation says the choice of session agent persists when the session is resumed, with a warning if the agent no longer exists. Source: `docs:sub-agents`, Invoke subagents explicitly
- The documentation says the agent setting may sit in any settings file, is unset by default, and is overridden for one session by the flag. Source: `docs:settings-reference`, agent
- The documentation says an agent run as the main thread can list the only agent types it may send, written Agent with the types in parentheses, and sees only the allowed types if it tries another. Source: `docs:sub-agents`, Restrict which subagents can be spawned
- The documentation says that omitting Agent from an agent's tools means it cannot send any subagent with the Agent tool, and that a type list is ignored inside a subagent's own definition. Source: `docs:sub-agents`, Restrict which subagents can be spawned
- The documentation says only name and description are required in an agent's frontmatter, and that a field Claude Code does not recognize is ignored without an error. Source: `docs:sub-agents`, Frontmatter reference
- The documentation lists these optional fields: tools, disallowedTools, model, permissionMode, maxTurns, autoCompactWindow, skills, mcpServers, hooks, memory, background, omitClaudeMd, effort, isolation, color, initialPrompt and experimental. Source: `docs:sub-agents`, Frontmatter reference
- The documentation says the model is taken from the first of these that is set: the per-invocation parameter, the definition's model field, the subagent model variable, then the main conversation's model. Source: `docs:sub-agents`, Choose a model
- The documentation says a nested subagent with no model field runs on its parent's model. Source: `docs:sub-agents`, Which model a nested subagent runs on
- The documentation says a subagent by default can send subagents of its own up to three layers below the main conversation, and that at the limit the Agent tool is withheld. Source: `docs:sub-agents`, Let subagents spawn their own subagents
- The documentation says that when 20 subagents are running, sending another with the Agent tool fails, and that workflow agents and team teammates follow their own limits. Source: `docs:sub-agents`, Concurrent subagent limit
- The documentation says each subagent starts with a fresh isolated context, sees a delegation message and not the conversation, and receives the CLAUDE.md files unless omitClaudeMd is set. Source: `docs:sub-agents`, What loads at startup
- The documentation says when the main conversation is in auto, accept-edits or bypass mode, a subagent runs in that mode whatever permission mode its definition sets. Source: `docs:sub-agents`, Permission modes
- The documentation says when the main conversation is in plan mode, a subagent stays in plan mode whichever mode its definition sets, unless it runs as an agent team teammate. Source: `docs:sub-agents`, Permission modes
- The documentation says a subagent that Claude sends from the main conversation starts in the background by default, and that a background subagent's permission prompts surface in the main session. Source: `docs:sub-agents`, Run subagents in foreground or background
- The documentation says to use subagents where the task produces verbose output, needs tool restrictions or is self-contained, and to use the main conversation where the task needs back-and-forth or shares context across phases. Source: `docs:sub-agents`, Choose between subagents and main conversation
- The documentation says agent teams are experimental, disabled by default, led by one session, and that teammates message each other directly. Source: `docs:agent-teams`, the page's opening
- The documentation says agent teams add coordination overhead and use significantly more tokens, and that sequential tasks and same-file edits suit a single session or subagents better. Source: `docs:agent-teams`, When to use agent teams
- The documentation says spawning teammates needs an interactive session, and that with the non-interactive flag a named subagent runs as an ordinary subagent. Source: `docs:agent-teams`, Enable agent teams
- The documentation says cross-session messaging sends plain text only, never the sender's conversation history or files. Source: `docs:cross-session-messaging`, Message your other Claude Code sessions
- The documentation says a message from another session cannot approve anything, cannot change configuration and cannot run a command it contains, and that permission prompts still fire. Source: `docs:cross-session-messaging`, How a session treats an incoming message
- The documentation says the inbound setting takes accept, hold or refuse, and that with no value set the choice is made from the two sessions' permission-mode classes. Source: `docs:cross-session-messaging`, Control inbound messages
- The documentation says a held message is kept at most for a five-minute deadline by default in a non-interactive session and then dropped. Source: `docs:cross-session-messaging`, Non-interactive sessions
- The documentation says a message to a cloud session or one on another machine needs Remote Control and a claude.ai sign-in, and that an API key does not find those sessions. Source: `docs:cross-session-messaging`, Availability
- The documentation says a workflow is a script that runs many subagents, and that a saved script lives under the project's workflows folder or the personal one and runs by name. Source: `docs:workflows`, Save the workflow for reuse
- The documentation says a saved workflow accepts input through an args parameter. Source: `docs:workflows`, Pass input to a saved workflow
- The documentation says that in auto mode the approval prompt for a workflow appears at the first launch only, and that with the non-interactive flag it never appears and the launch goes through the ordinary permission rules. Source: `docs:workflows`, Approve the plan before it runs
- The documentation says the agents a workflow spawns use the session's permission rules. Source: `docs:workflows`, Approve the plan before it runs
- The documentation says a workflow takes no input once started, its script has no direct filesystem or shell access, it runs up to 16 agents at once by default, and it allows 1,000 agents in total. Source: `docs:workflows`, Behavior and limits
- The documentation says a workflow can be resumed from its saved results, that a completed agent returns its saved result, and that the first agent whose prompt differs runs again with every agent after it. Source: `docs:workflows`, Which agents run again
- The documentation says a workflow run does not continue by itself after the session is backgrounded or exited, and continues only when Claude relaunches it. Source: `docs:workflows`, Resume after you leave the session
- The documentation says the goal command sets a condition that a model checks after every turn, and that the evaluator does not run commands or read files independently. Source: `docs:goal`, Write an effective condition
- The documentation says the goal command is a wrapper around a session-scoped prompt-based stop hook, and that its evaluator returns not yet met, met or impossible. Source: `docs:goal`, How evaluation works
- The documentation says a goal condition can be up to 4,000 characters, and that a turn or time clause in it bounds how long it runs. Source: `docs:goal`, Write an effective condition
- The documentation says a cloud scheduled task is a saved configuration of a prompt, repositories and connectors, with a schedule, API or GitHub trigger, and that it is in research preview. Source: `docs:routines`, the page's opening
- The documentation says the non-interactive flag runs Claude Code without a person at the prompt and exits with code 0 on success and non-zero when the run fails. Source: `docs:headless`, Basic usage
- The documentation says the bare option skips auto-discovery of hooks, skills, custom commands, subagents, plugins, MCP servers, auto memory and CLAUDE.md. Source: `docs:headless`, Start faster with bare mode
- The documentation says a skill with the fork context runs in a new subagent of the type named in its agent field, which does not see the conversation, and which by default runs in the background. Source: `docs:skills`, Run skills in a subagent
- The documentation says a skill's disable-model-invocation field stops Claude from loading it on its own and also stops it being preloaded into subagents. Source: `docs:skills`, Frontmatter reference
- The documentation says the allowed-tools field of a skill grants tools without asking for the turn that invokes it, and the grant clears at the next message. Source: `docs:skills`, Frontmatter reference

## What is not known

- Whether any file of the hub's own roles or settings sets the main thread to run as a manager, apart from the settings file read here, is not known: only `.claude/settings.json` was searched, and the user-level settings file is read by another file of this research. Source: this step's reading
- Whether the sonnet alias in the role files selects the same model version the agent rules assume is not known, because the documentation's page on model versions was not searched for this part. Source: this step's reading
- What the plan check named as faults of a plan's shape other than the step-shape fault is not known from this reading: the plan guard's list of faults is read by file 02, and only the step-shape lines were searched here. Source: this step's reading
- Whether a step with the labels Depends on, Commands, Must be seen and Ends it, as used by pages drawn on 17 to 19 November, is checked by any file of the hub is not known: no hub page holds Must be seen. Source: Grep of the hub's pages for those words, run in this step
- Whether the hub's two copies of each procedure are meant to differ is not known: no page states it. Source: this step's reading
- What lesson 375's checklist, a search of a workflow's transcripts for the stop sentence, is run by today is not known: no file of today's hub was searched for the sentence. Source: this step's reading
- Whether the apps' repositories carry their own copies of the roles is not known: no app's repository is read from this session. Source: the words read by the managing session on 19 November 2026

## Found

- The setup record names three roles as the harness's own definitions, a manager among them, and the hub's two roles folders hold two files, a worker and a checker. Source: `plans/native-setup.md:15`
- The record of 16 and 17 November says the shared worker role's line 26 names three of the four hand-back words and not EJECT, and that line today names four. Source: `plans/native/roles/worker.md:26`
- The checker's definition says its answer opens with CHECK PASS or CHECK FAIL, and the review file it is told to read says its first line is ON-AIM or OFF-AIM followed by a route word. Source: `.claude/agents/checker.md:21`
- The step-shape comment at the commit before the rebuild names the agent rules as version 5, and the rules file at that commit says version 6. Source: `4ea3157:hook-dispatch.mjs:1920`
- The record says the agents' rule letting a failed command run again after a write licenses the loop that hurt, and the agent rules today let a red check be repaired once after a write. Source: `archive/plans/redesign-record.md:418`
- The shared and the hub's copies of the piece-of-work procedure differ by one item, and the shared and the hub's copies of the landing procedure differ by items and by commands. Source: `plans/native/skills/piece-of-work/SKILL.md:12`
- The review file names `reviewState` in report.mjs and `reviewGate` in hook-dispatch.mjs as what reads the review's verdict, and no file named report.mjs stands today and no source file holds reviewState, reviewGate or planOrder. Source: `aim-review.md:7`
