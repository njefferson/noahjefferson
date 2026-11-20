# What is read: what a session, a worker and a checker each read, and when

Made by a step of the research page drawn on 19 November 2026. It records and recommends nothing. The documentation it cites was saved by that page's first step on the day it ran, and the commit that holds this file dates it.

## What the part is for

- The short page describes itself as what a worker or a checker reads first, and says it is short on purpose. Source: plans/native/page.md:3
- The short page says the work goes forward with nobody watching it, and the result comes back in a few plain lines. Source: plans/native/page.md:7
- The short page says the hub is built so that nobody has to come back to it and start over. Source: plans/native/page.md:12
- The short page says a session cannot serve a rule it does not understand, so every rule is written with its reason beside it. Source: plans/native/page.md:13
- The short page lists the standing pages: doctrine/never.md and doctrine/hub.md are read whole at every start and after a compaction, before anything else. Source: plans/native/page.md:60
- The short page says doctrine/plans.md is read whole before a page is scoped, and doctrine/apps.md where the work points at one of its sections. Source: plans/native/page.md:61
- The short page names agent-rules.md for a worker, aim-review.md for a checker, and plans/seed-template.md for the drafting of a page. Source: plans/native/page.md:63
- The short page says that where a standing page names a retired gate, the behaviour it asks of a session still binds, and that where a page and the short page differ on how work is scoped and who does its steps, the short page holds. Source: plans/native/page.md:64
- The record of the redesign lists a requirement that the doctrine is grouped so the whole is not read repeatedly. Source: archive/plans/redesign-record.md:47
- The record lists a requirement that the doctrine read at a start is applied at each step, with the facts restated in the step. Source: archive/plans/redesign-record.md:44
- The record lists a requirement that the references a session has built are used at the point of decision, and that the doctrine is read by the part that applies. Source: archive/plans/redesign-record.md:43
- The record lists a requirement that the context a task needs sits immediately beside the task, inside the plan's step. Source: archive/plans/redesign-record.md:71
- The setup record says each repository holds one short page, with the never-rules, and that procedures are skills. Source: plans/native-setup.md:15
- The setup record says the harness's own summary is that the instruction file is loaded by the main thread and by every agent, so each line of it takes attention on every task. Source: plans/native-setup.md:11
- The setup record says a procedure belongs in a skill, whose body loads only when used. Source: plans/native-setup.md:11
- The hub's instruction file loads the short page by an import on its third line, and says to read the page first if the import did not load. Source: CLAUDE.md:3
- The page on how sessions run gives the reason for the read at a start: a session that has not read the rules cannot follow them, and every other rule rests on this one. Source: plans/native/running.md:59

## What is there today

- The hub's instruction file holds 36 lines and 3,263 characters. Source: wc -l -c, the first of block Q's commands, run in this step
- The index file DOCTRINE.md holds 75 lines and 5,710 characters. Source: wc -l -c, the first of block Q's commands, run in this step
- doctrine/never.md holds 501 lines and 32,461 characters. Source: wc -l -c, the first of block Q's commands, run in this step
- doctrine/hub.md holds 1,499 lines and 110,627 characters. Source: wc -l -c, the first of block Q's commands, run in this step
- doctrine/plans.md holds 1,247 lines and 87,800 characters. Source: wc -l -c, the first of block Q's commands, run in this step
- doctrine/apps.md holds 1,346 lines and 84,307 characters. Source: wc -l -c, the first of block Q's commands, run in this step
- agent-rules.md holds 33 lines and 7,844 characters, and aim-review.md holds 260 lines and 16,749. Source: wc -l -c, the first of block Q's commands, run in this step
- plans/seed-template.md holds 87 lines and 51,501 characters. Source: wc -l -c, the first of block Q's commands, run in this step
- plans/native/page.md holds 65 lines and 5,719 characters, and plans/native/running.md holds 82 lines and 9,443. Source: wc -l -c, the first of block Q's commands, run in this step
- The hub's copy of the worker role holds 26 lines and 2,154 characters, and of the checker role 21 lines and 1,334. Source: wc -l -c, the first of block Q's commands, run in this step
- The copy of the worker role under .claude/agents holds 24 lines and 1,784 characters, and of the checker role 21 lines and 1,348. Source: wc -l -c, the first of block Q's commands, run in this step
- The hub's copies of the three procedures hold 28 lines and 5,585 characters for piece-of-work, 14 and 2,513 for landing, and 39 and 3,971 for app-move. Source: wc -l -c, the first of block Q's commands, run in this step
- The copies of the two procedures under .claude/skills hold 27 lines and 5,471 characters for piece-of-work and 25 and 3,161 for landing. Source: wc -l -c, the first of block Q's commands, run in this step
- The twenty files counted hold 5,456 lines and 442,745 characters together. Source: wc -l -c, the first of block Q's commands, run in this step
- The three pages the read hold requires, the short page, never.md and hub.md, hold 2,065 lines and 148,807 characters between them. Source: wc -l -c, the first of block Q's commands, run in this step
- The dispatcher's list of standing pages is the short page, doctrine/never.md and doctrine/hub.md. Source: hook-dispatch.mjs:654
- The dispatcher holds the main thread to reads, and TaskStop, after a start, a clear or a compaction, until each standing page has been read whole in the hub's copy or in a checkout of the hub. Source: hook-dispatch.mjs:719
- A read counts only where the Read results of the main thread, taken together, return every line of the file as it stands. Source: hook-dispatch.mjs:672
- The hold looks for the reads in the transcript since the last compaction, widening its tail through 2, 8 and 32 megabytes. Source: hook-dispatch.mjs:740
- A call by an agent is never held by the read, and a transcript that cannot be read leaves the call through. Source: hook-dispatch.mjs:723
- A resume owes the read only where the transcript since the last start or compaction does not hold it. Source: hook-dispatch.mjs:721
- The page on how sessions run says workers and checkers are not held by the read, and that only reads pass while it stands. Source: plans/native/running.md:59
- The dispatcher prints one line naming the short page at a session's start. Source: hook-dispatch.mjs:79
- The brief script prints the heading line, the branch lines and the one line naming the short page, and nothing else. Source: session-brief.mjs:6
- The repository's settings wire three hooks: session-start.sh at SessionStart, stop-guard.sh at Stop, and plan-guard.sh at PreToolUse for every tool. Source: .claude/settings.json:40
- The stop hook shim stands aside where the user-level settings name hook-dispatch.mjs. Source: .claude/hooks/stop-guard.sh:16
- Both copies of the worker role are told to read the short page as the first call and alone, then the agent rules whole. Source: .claude/agents/worker.md:9
- Both copies of the checker role are told to read the short page first, then the review file whole. Source: .claude/agents/checker.md:9
- The role files under .claude/agents set omitClaudeMd to true, so an agent started from them is given none of the project's instruction file. Source: .claude/agents/worker.md:6
- The copy of the worker role under plans/native/roles names the pages by their paths under the installed copy of the hub, and the copy under .claude/agents names them by their paths in the checkout. Source: plans/native/roles/worker.md:9
- The agent rules say an agent reads them by their full path before anything else. Source: agent-rules.md:5
- The agent rules say a plan with a Steps section carries a Rules section, and name a gate that refuses a plan whose section is neither the pointer line nor every rule line. Source: agent-rules.md:7
- The review file says an agent that follows it is the review, and that its hand-back is the verdict. Source: aim-review.md:3
- The page on how sessions run says the hub's copy in a container is brought forward from the hub's main at every start and resume, with the short page, the roles, the procedures, the push guard and the dispatcher. Source: plans/native/running.md:77
- The ledger's index says a rule counts as kept only when a live page was quoted stating all of it, and a doubt counted as dropped. Source: plans/rules-ledger/index.md:9
- The ledger's index gives 1,390 rules read, 244 kept whole, 182 kept in part and 964 dropped. Source: plans/rules-ledger/index.md:15
- The ledger's index gives the old instruction file as 444 rules, 206 kept, 52 in part and 186 dropped. Source: plans/rules-ledger/index.md:24
- The ledger's index gives the old plans page as 386 rules, 19 kept, 51 in part and 316 dropped. Source: plans/rules-ledger/index.md:25
- The ledger's index gives the seed's standing text as 149 rules, 4 kept, 18 in part and 127 dropped, and the configuration baseline as 144 rules, 2 kept, 24 in part and 118 dropped. Source: plans/rules-ledger/index.md:26
- The ledger's index gives the handoff page as 127 rules, 1 kept, 22 in part and 104 dropped. Source: plans/rules-ledger/index.md:28
- The ledger's index gives the agent rules as 60 rules, 6 kept, 9 in part and 45 dropped, and the review file as 60 rules, 0 kept, 2 in part and 58 dropped. Source: plans/rules-ledger/index.md:29
- The ledger's index gives the passages the rebuild rewrote on the never page, the apps page and the other standing pages as 20 rules, 6 kept, 4 in part and 10 dropped. Source: plans/rules-ledger/index.md:31
- The ledger's index says the hooks told a session 187 things at a start, at a prompt or in a refusal, of which 51 are still told, 54 told in part and 82 no longer told. Source: plans/rules-ledger/index.md:20
- The ledger's index counts as live pages the hub's instruction file, the pages under plans/native, the roles and procedures under .claude, DOCTRINE.md, never.md, apps.md and seven reference pages, and does not count the archive, the lessons, the findings, the ranked list or the records under plans. Source: plans/rules-ledger/index.md:11
- The index file DOCTRINE.md says the hub's instruction file as it stood on 11 November 2026 is doctrine/hub.md, read whole at every start. Source: DOCTRINE.md:27

## What was there before the rebuild

- The instruction file at the commit before the rebuild held 1,496 lines and 110,271 characters. Source: wc -l -c, the second of block Q's commands, run in this step
- DOCTRINE.md then held 67 lines and 4,702 characters, never.md 501 and 32,461, plans.md 1,247 and 87,800, and apps.md 1,333 and 83,321. Source: wc -l -c, the second of block Q's commands, run in this step
- The agent rules then held 33 lines and 7,844 characters, the review file 260 and 16,749, and the seed 87 and 51,501. Source: wc -l -c, the second of block Q's commands, run in this step
- HANDOFF.md then held 345 lines and 22,300 characters, and CONFIG.md 202 and 23,566. Source: wc -l -c, the second of block Q's commands, run in this step
- The old instruction file opened by saying it inherits the index file DOCTRINE.md and that where anything overlaps it the doctrine wins. Source: 4ea3157:CLAUDE.md:3
- The old instruction file held a block of standing goals, loaded into every session at every turn. Source: 4ea3157:CLAUDE.md:11
- The old instruction file held a one-page section of core asks, printed at every start and resume by the brief script beside the brief. Source: 4ea3157:CLAUDE.md:24
- The old instruction file said the start hook printed the brief, which named the branch, the doctrine's movement, the repository family, every lesson title and each repository's state file. Source: 4ea3157:CLAUDE.md:47
- The old brief script said the only file loaded automatically was the instruction file, and that everything else had to be opened by somebody. Source: 4ea3157:session-brief.mjs:8
- The old brief script printed the core asks at a startup, a compaction, a resume and a clear alike. Source: 4ea3157:session-brief.mjs:37
- The old index file said the plan rules were read at the entry to plan mode, and the never rules at every start. Source: 4ea3157:DOCTRINE.md:18
- The old read guard made the never page due at every start and after every compaction, the plans page due at the entry to plan mode, and nothing due from the apps page. Source: 4ea3157:doctrine-read-guard.mjs:3
- The old read guard recorded the maker's measure that adherence falls once an instruction file passes about two hundred lines, so no start read the whole. Source: 4ea3157:doctrine-read-guard.mjs:11
- The old read guard made every line of the never page due at a startup, a clear and a compaction, and at a resume only where the transcript did not hold a whole read. Source: 4ea3157:doctrine-read-guard.mjs:31
- The old recall script printed the newest ten typed messages since the previous compaction after a compaction, and filed every one in a file under the scratchpad. Source: 4ea3157:compact-recall.mjs:11
- The old recall script held the main thread to reading until a Read result covered the whole recall file. Source: 4ea3157:compact-recall.mjs:18
- The old index file gave the number of the section that held each rule, and said every section number cited anywhere in the hub was the number in its lines. Source: 4ea3157:DOCTRINE.md:21
- The current standing read adds doctrine/hub.md to the short page and the never page, where the old guard named the never page alone at a start. Source: hook-dispatch.mjs:654

## What the documentation says

- The memory page sets a target of under 200 lines for each instruction file, and says longer files use more context and reduce adherence. Source: docs:memory, Write effective instructions
- The memory page says imports load together with the file that imports them, so they do not reduce its context cost. Source: docs:memory, Write effective instructions
- The memory page says imports can be nested to a depth of four hops. Source: docs:memory, Import additional files
- The memory page says block-level HTML comments in an instruction file are stripped before the content is injected. Source: docs:memory, How CLAUDE.md files load
- The memory page says instruction files in subdirectories load when the session reads, writes or edits a file in that subdirectory, and not at launch. Source: docs:memory, How CLAUDE.md files load
- The memory page says path-scoped rules load only when the session works with matching files. Source: docs:memory, Path-specific rules
- The memory page says a warning is shown at startup when an instruction file is over the recommended length, and that a file over 4 MiB is skipped. Source: docs:memory, My CLAUDE.md is too large
- The memory page says the project-root instruction file is re-read from disk and put back after a compaction. Source: docs:memory, Instructions seem lost after /compact
- The context window page says the project-root instruction file and unscoped rules are re-injected from disk after a compaction. Source: docs:context-window, What survives compaction
- The context window page says rules with a paths field, and nested instruction files, are reloaded on demand after a compaction. Source: docs:context-window, What survives compaction
- The context window page says invoked skill bodies are re-injected after a compaction, capped at 5,000 tokens each and 25,000 in total, oldest dropped first. Source: docs:context-window, What survives compaction
- The context window page says up to five files read or edited are re-read after a compaction, and a file over 5,000 tokens comes back as a path reference. Source: docs:context-window, What survives compaction
- The context window page says SessionStart hooks that match the compact source are run and their output is added to the compacted context. Source: docs:context-window, What survives compaction
- The context window page says context that hooks added earlier is summarized with the rest of the conversation. Source: docs:context-window, What survives compaction
- The skills page says a skill's body loads only when it is used, and enters the conversation as one message that stays across later turns. Source: docs:skills, Skill content lifecycle
- The skills page says the description and the when-to-use text are cut at 1,536 characters in the skill listing. Source: docs:skills, Frontmatter reference
- The skills page says that after a compaction the most recent invocation of each skill is re-attached, keeping its first 5,000 tokens, within a shared budget of 25,000. Source: docs:skills, Skill content lifecycle
- The best-practices page says every line of the instruction file takes attention on every task, so it should hold only what the session could not work out from the code. Source: docs:best-practices, Keep CLAUDE.md short
- The best-practices page recommends staying under 200 lines, and says that a line kept being ignored belongs in a hook or the file has grown too long. Source: docs:best-practices, Keep CLAUDE.md short
- The best-practices page says a rule that must hold every time is a hook, a deny rule or a managed setting, and the instruction file is for guidelines. Source: docs:best-practices, Enforce the rules that can't have exceptions
- The best-practices page says to keep the enforced set small, and names forty hooks and deny rules as a sign that most are preferences. Source: docs:best-practices, Choose who a rule applies to
- The how-it-works page says a compaction summary keeps requests and key snippets, and that detailed early instructions may be lost. Source: docs:how-claude-code-works, The context window
- The how-it-works page says a Compact Instructions section in the instruction file controls what is preserved in a compaction. Source: docs:how-claude-code-works, The context window
- The claude-directory page says the instruction file is loaded into context at session start, and that settings and hooks are enforced where the instruction file is guidance. Source: docs:claude-directory, Explore the directory
- The sub-agents page says each agent starts with a fresh context and does not see the conversation, the skills already invoked, or the files already read. Source: docs:sub-agents, What loads at startup
- The sub-agents page lists what a non-fork agent starts with: its system prompt, the task message, the instruction files, a git status snapshot, preloaded skills, and a roster of other named agents. Source: docs:sub-agents, What loads at startup
- The sub-agents page says an agent whose definition sets omitClaudeMd loads only the managed policy files, and a subdirectory's instruction file still loads when the agent works with files there. Source: docs:sub-agents, What loads at startup
- The sub-agents page says an agent receives its own system prompt and basic environment details, not the Claude Code system prompt. Source: docs:sub-agents, Write subagent files
- The sub-agents page says the skills field injects each listed skill's full content at startup, and does not limit which skills the agent can invoke. Source: docs:sub-agents, Frontmatter reference
- The sub-agents page says the main conversation keeps its full instruction file when it reads an agent's result, and a rule that must reach the agent is restated in the delegation prompt. Source: docs:sub-agents, What loads at startup

## What is not known

- Which pages a given worker or checker actually read at a given send is not recorded in any file read here, and no transcript was opened. Source: this step's reading
- No source read measures the effect on adherence of reading 2,065 lines at a start, or of the roles' two copies naming different paths. Source: this step's reading
- The documentation's figure of 200 lines is stated for instruction files, and the sources read do not say whether it applies to pages read by a Read call. Source: docs:memory, Write effective instructions
- The 31 part files of the ledger were not opened, and only its index was read, so no count by rule is given here. Source: this step's reading
- Only lines 1 to 60 and 645 to 773 of hook-dispatch.mjs were read, so the other holds are not described here. Source: this step's reading
- The head comments of the old read guard, recall script and brief script were read to about line 40, and the rest of those files was not read. Source: this step's reading
- The pages of documentation were searched and read at the sections named, not whole. Source: this step's reading
- The apps' repositories were not read, so what an app's session reads at its start is not known from here. Source: this step's reading

## Found

- The index file says the three files in the doctrine folder are the doctrine, and the folder holds four pages: apps.md, hub.md, never.md and plans.md. Source: DOCTRINE.md:25
- doctrine/hub.md holds 1,499 lines and the instruction file at the commit before the rebuild held 1,496, and the two are described as the same file as it stood on 11 November 2026. Source: wc -l -c, both of block Q's commands, run in this step
- The agent rules name a gate that refuses a plan whose rules section is neither the pointer nor every rule, and name a check in the plan guard, and the dispatcher read here holds no such gate while the plan guard says its check is retired. Source: agent-rules.md:7
- The review file says the dispatcher reads a verdict from the agent's transcript through a function in the dispatcher, and no function of that name stands in hook-dispatch.mjs. Source: aim-review.md:5
- The two copies of the worker role differ: the copy under plans/native/roles holds lines naming the repository's entry in REPOS.md and committing on the work branch only, and the copy under .claude/agents holds neither. Source: plans/native/roles/worker.md:15
- The two copies of the piece-of-work procedure differ: the copy under plans/native/skills holds a fifth item on the first look before a build reaches a device and 16 items, and the copy under .claude/skills holds 15. Source: plans/native/skills/piece-of-work/SKILL.md:12
- The two copies of the landing procedure differ in kind: the copy under plans/native/skills is written for any repository and holds 7 steps, and the copy under .claude/skills is written for the hub alone and holds 8. Source: plans/native/skills/landing/SKILL.md:6
- The brief script today says it prints a heading, branch lines and one line and nothing else, while the old instruction file said the brief printed lesson titles and the core asks. Source: session-brief.mjs:6
