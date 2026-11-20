# What is kept: the ranked list, the findings, the lessons, the plans and the archive

Made by a step of the research page drawn on 19 November 2026. It records and recommends nothing. The documentation it cites was saved by that page's first step on the day it ran, and the commit that holds this file dates it.

## What the part is for

- The ranked list ranks every item of work across the hub and the apps, and a plan serves one item and writes its state at the close. Source: PROGRAM.md:3
- New work enters the ranked list by being ranked, and the next item taken is the highest in rank that no open dependency blocks. Source: PROGRAM.md:3
- The program's acts are five commands, and program.mjs says each of them prints what it wrote. Source: program.mjs:3-16
- The ranked list has six states, and a seventh word, retired, marks an item whose subject was removed in the rebuild of 12 November 2026. Source: PROGRAM.md:11-19
- The instruction file says program.mjs writes the ranked list. Source: CLAUDE.md:30
- A finding that was not put right and does not stop the plan it was found in is filed one to a file in found/ under the next free key. Source: NOTES.md:15
- The instruction file calls found/ the record of findings and says nothing reads it as a queue. Source: CLAUDE.md:34
- The lessons file says the doctrine says what must be done and the lessons say what has gone wrong, with the numbers. Source: LESSONS.md:8-10
- A lesson earns a place when it is transferable to a different app and carries evidence, which are the lessons file's own terms for admission. Source: LESSONS.md:16-20
- The instruction file calls LESSONS.md and lessons/ the archive of what went wrong and what it cost, and says no session loads it. Source: CLAUDE.md:33
- The record of the rebuild lists the lessons as an archive that no session loads, and the ranked list as staying. Source: plans/native-setup.md:19
- The archive holds the pages that describe the gates and the way of working retired on 12 November 2026, kept as they were written, and no session loads them. Source: archive/README.md:3-5
- The retired-files list names the gate files retired on 12 November 2026 and says the lessons citing them are kept as written. Source: archive/RETIRED-FILES.txt:1
- The plans folder holds the record of the rebuild, which the instruction file calls the record of how the hub was rebuilt and where the work stands. Source: CLAUDE.md:27
- The rules-released page holds the lines that left a rules page, each fenced block under a line giving the date and why. Source: plans/rules-released.md:3
- The culled-list record holds the cull of the ranked list after the rebuild, with every item that was not done placed in one of three lists with its reason. Source: plans/program-cull.md:3
- The hub's notes file is for what a session working on the hub needs to know that no other file holds. Source: NOTES.md:3
- The record of 2 November 2026 lists as a requirement that errors found are recorded as lessons and gates for the next plan, and that recurring problems enter the next plan by being ranked. Source: archive/plans/redesign-record.md:39
- The record of 2 November 2026 lists as a requirement that all work is ranked through change management and that new work updates the dependencies and the list. Source: archive/plans/redesign-record.md:56
- The record of 2 November 2026 lists as a requirement that lessons are learned as the work goes and that a stumble just seen is recorded with its fix for the next plan. Source: archive/plans/redesign-record.md:59
- The record of 2 November 2026 lists as a requirement that each reported defect is recorded as a finding, one entry each, and verified in the hub before any change. Source: archive/plans/redesign-record.md:24
- The record of 2 November 2026 lists as a requirement that research precedes a plan and is recorded in enough detail for the plan to rest on. Source: archive/plans/redesign-record.md:51
- The short page names none of the ranked list, found/, the lessons or the archive. Source: Grep of plans/native/page.md for those names, run in this step, no match

## What is there today

- PROGRAM.md is 6,970 lines and 539,245 bytes, LESSONS.md 578 lines and 106,676 bytes, NOTES.md 15 lines and 1,963 bytes. Source: the command wc -l -c on the eight files, run in this step
- plans/native-setup.md is 61 lines and 12,379 bytes, plans/native/cost.md 180 lines and 12,023 bytes, plans/rules-released.md 47 lines and 4,254 bytes. Source: the command wc -l -c on the eight files, run in this step
- archive/README.md is 6 lines and 212 bytes, and archive/RETIRED-FILES.txt is 17 lines and 585 bytes. Source: the command wc -l -c on the eight files, run in this step
- The count line of the ranked list opens with 621 items, and a Grep for lines opening with Repository finds 621. Source: PROGRAM.md:60 and a Grep of PROGRAM.md run in this step
- By a Grep of the lines that open with Repository and carry a state, 311 items are done, 141 open, 135 retired, 32 parked, and 2 are in another named state. Source: Grep of PROGRAM.md for State: done, open, retired and parked, and for planned, running, ejected or answered, run in this step
- The count line's breakdown names 10 built by the redesign plan, 7 parked items, 1 blind-areas item, 1 workflow-security item, 4 documented mechanisms, 9 knowledge layers, 4 dependency updates, 9 siblings, 15 other entries and 561 findings. Source: PROGRAM.md:60
- The head of the ranked list says the order of the standing items from 13 November 2026 is the way forward in plans/program-cull.md. Source: PROGRAM.md:54
- The ranked list's entry form is a key, a title, a repository, a goal, a state, a plan, an acceptance and dependencies. Source: PROGRAM.md:41
- A state moves by program.mjs: claim sets items planned, file files findings, done sets items done, measure writes a plan's close entry, lesson writes the next lesson, and count checks the count line. Source: program.mjs:9-14
- The file verb files each finding with its file in found/ and its item in the program, both counts raised. Source: program.mjs:10
- The lesson verb writes the next lesson's file and its row in LESSONS.md. Source: program.mjs:13
- The single-digit names in found/ are 8 files, Q-HUB-1 to Q-HUB-9 with Q-HUB-7 absent. Source: Glob of found/Q-HUB-[0-9].md, run in this step
- The found/ folder holds files named Q-HUB and a number, and a Glob of the whole folder returns its first 100 names and says there are more. Source: Glob of found/ , run in this step
- The count line says its 561 findings are one for each key of the Found queue from Q-HUB-1 to Q-HUB-543 that has a file or a line. Source: PROGRAM.md:60
- The lessons folder holds files named with a number and a title, and the highest number among the names listed is 483. Source: Glob of lessons/4[0-9][0-9]*, run in this step
- LESSONS.md lists each lesson as a row of the form of a section sign, a number, a title and a link into lessons/. Source: LESSONS.md:178
- LESSONS.md says every lesson has to say how it is enforced, and gives the autopsy of a build in which every gated rule held and every prose rule lost. Source: LESSONS.md:22-28
- The plans folder holds six files at its top, app-sessions.md, jefferson-photography-studio-open-and-strip.md, native-setup.md, program-cull.md, rules-released.md and seed-template.md, with the folders native/, research/ and rules-ledger/ beneath it. Source: Glob of plans/, run in this step
- The folder plans/rules-ledger/ holds index.md and 31 part files. Source: Glob of plans/, run in this step
- The record of the app sessions says it followed the rebuild and was approved on 12 November 2026. Source: plans/app-sessions.md:3
- The record of the cull gives, as read on 13 November 2026, 597 items of which 248 were done and 350 were not. Source: plans/program-cull.md:13
- The ranked list's entries tied to a repository other than the hub name Jefferson-Photography-Studio, Quietkeep, fauxplane, 3d-printing-pal, Intersecting-parallels, photo-pointer, MoleBridge, Cv-Thalweg, solve-ent and Jefferson-Line. Source: Grep of the lines of PROGRAM.md opening with Repository, run in this step
- The retired-files list names 15 files on lines 2 to 16, and its last line says two of them, aim-review.md and agent-rules.md, are in the tree again. Source: archive/RETIRED-FILES.txt:2-17
- The archive's own pages include archive/plans/redesign-record.md, whose section 8 is the configuration inventory of 2 November 2026 and whose section 13 names the program item that answers each section. Source: archive/plans/redesign-record.md:356 and archive/plans/redesign-record.md:459
- The instruction file loads the short page with an import and lists the ranked list, the lessons, found/ and the archive under where things are. Source: CLAUDE.md:3 and CLAUDE.md:26-36
- The running page names none of the ranked list, found/, the lessons or the archive. Source: Grep of plans/native/running.md for those names, run in this step, no match
- The hub's notes file holds one dated section on a template-injection fix of 5 November 2026 and the section on the found queue. Source: NOTES.md:5-15
- The ledger index counts 1,390 rules read, 244 kept whole, 182 kept in part and 964 dropped, and says it records a state and chooses nothing. Source: plans/rules-ledger/index.md:3 and plans/rules-ledger/index.md:15-18
- The ledger index counts as live pages the instruction file, the pages under plans/native, the roles and procedures under .claude and the standing pages, and says the archive, the lessons, the findings, the ranked list and the records under plans did not count. Source: plans/rules-ledger/index.md:11
- The rules-released page holds entries dated 14, 16 and 17 November 2026. Source: plans/rules-released.md:5-42

## What was there before the rebuild

- The ranked list's opening paragraph and thesis at the commit before the rebuild read as they read today. Source: 4ea3157:PROGRAM.md:3-7
- The notes file at the commit before the rebuild had the same two sections it has today, and its found-queue section says foundQueue in hook-dispatch.mjs reads the folder. Source: 4ea3157:NOTES.md:15
- The dispatcher at the commit before the rebuild defined foundQueue and used it to build the set of queued findings. Source: 4ea3157:hook-dispatch.mjs:2183 and 4ea3157:hook-dispatch.mjs:2280
- The handoff page at the commit before the rebuild was a file to read first in any new session, carrying an approved plan whose build was cut short, to be deleted when every gate read built. Source: 4ea3157:HANDOFF.md:1-7
- The handoff page's first step for a new session was a clone of main and an install from the clone, then a probe. Source: 4ea3157:HANDOFF.md:17-21
- The configuration baseline at the commit before the rebuild listed every configuration item of the hub with its state as read on 2 November 2026, and said a change to any item is a program item first. Source: 4ea3157:CONFIG.md:3
- The session brief at the commit before the rebuild said the only file loaded automatically is CLAUDE.md and that the lessons had to be opened. Source: 4ea3157:session-brief.mjs:8-12
- The session brief printed the lessons index as titles only, because a long file is not a briefing. Source: 4ea3157:session-brief.mjs:22-27
- The instruction file at the commit before the rebuild said the brief prints every lessons title. Source: 4ea3157:CLAUDE.md:50
- The record of 2 November 2026 gives the always-loaded text then as DOCTRINE.md 2776 lines, CLAUDE.md 1477 lines, LESSONS.md 564 lines, NOTES.md 135 lines and REPOS.md 495 lines. Source: archive/plans/redesign-record.md:368
- The record of 2 November 2026 gives the lessons then as 478 files with 524 declarations of the form Enforced by, 248 of them gate, 231 checklist and 45 judgement. Source: archive/plans/redesign-record.md:372
- The record of 2 November 2026 says the found queue of NOTES.md then held 127 lines opening with a key from Q-HUB-1 to Q-HUB-130, with 7, 14 and 28 absent. Source: archive/plans/redesign-record.md:384
- Section 13 of the record names the program item that answers each section, among them P-6 for the configuration inventory and P-31 to P-43 for the dependency updates and the sibling pins. Source: archive/plans/redesign-record.md:470
- The ledger index records that LESSONS.md, the archive, the findings, the ranked list and the plans records were outside the pages it counted as live. Source: plans/rules-ledger/index.md:11
- The record of the rebuild lists the findings queue as a queue of work among what is retired, and the program as the ranked list of the apps' work among what stays. Source: plans/native-setup.md:19

## What the documentation says

- Claude Code has two memory systems, the instruction file and auto memory, both loaded at the start of every conversation and treated as context and not as enforced configuration. Source: docs:memory, under CLAUDE.md vs auto memory
- The page says to use a hook before a tool call to block an action regardless of what Claude decides. Source: docs:memory, under CLAUDE.md vs auto memory
- Auto memory is written by Claude, holds learnings and patterns, is scoped per repository, and loads the first 200 lines or 25KB. Source: docs:memory, under CLAUDE.md vs auto memory
- Auto memory saves four kinds of notes: user, feedback, project and reference. Source: docs:memory, under Auto memory
- Auto memory is on by default in local sessions, and a session in a self-hosted environment runs with it off by default. Source: docs:memory, under Enable or disable auto memory
- Each project's auto memory directory is under the configuration folder's projects folder and holds a MEMORY.md index and one topic file per memory. Source: docs:memory, under Storage location
- Auto memory is machine-local and its files are not shared across machines or cloud environments. Source: docs:memory, under Storage location
- The retention sweep excludes the memory files, and MEMORY.md and topic files stay until Claude or the user edits or deletes them. Source: docs:memory, under Storage location
- Only the first 200 lines or 25KB of MEMORY.md load at the start of a conversation, and topic files are read on demand. Source: docs:memory, under How it works
- An instruction file over 200 lines consumes more context and may reduce adherence, and a file over 4 MiB is skipped. Source: docs:memory, under My CLAUDE.md is too large
- After a compaction the project-root instruction file is re-read from disk and re-injected, and an instruction given only in conversation is lost. Source: docs:memory, under Instructions seem lost after /compact
- Transcripts are stored as JSONL under the configuration folder's projects folder, one file per session. Source: docs:sessions, under Where transcripts are stored
- A transcript's entry format is internal to Claude Code and changes between versions. Source: docs:sessions, under Where transcripts are stored
- A resumed session restores the conversation from the last compaction's summary, the model, the agent, the permission mode and an active goal. Source: docs:sessions, under What a resumed session restores
- A background subagent or background Bash command that ended with the previous process shows in a resumed transcript as a note that it did not finish. Source: docs:sessions, under What a resumed session restores
- The clear command starts fresh with an empty context and saves the previous session, and the compact command replaces history with a summary. Source: docs:sessions, under Manage context within a session
- The retention sweep deletes transcripts and the files in its table once older than cleanupPeriodDays, by default 30 days. Source: docs:claude-directory, under Cleaned up automatically
- Plan files written during plan mode, file snapshots, debug logs and subagent transcripts are among the paths the sweep cleans. Source: docs:claude-directory, under Cleaned up automatically
- The scratchpad is a per-session directory under the temp directory, and its files last as long as the session's transcript and can be cleared by the operating system, such as on restart. Source: docs:claude-directory, under Session scratchpad directory
- The page's advice for keeping something Claude wrote in the scratchpad is to ask Claude to move it into the project. Source: docs:claude-directory, under Session scratchpad directory
- Checkpointing tracks the changes made by Claude's file editing tools and keeps snapshots for the 100 most recent checkpoints in a session. Source: docs:checkpointing, under Automatic tracking
- Snapshots are deleted by the retention sweep about 30 days after the session last saved one. Source: docs:checkpointing, under Automatic tracking
- A file that only Bash commands changed is not tracked, and most subagent edits and edits from other concurrent sessions are not captured. Source: docs:checkpointing, under Limitations
- The page says checkpoints are for session-level recovery and are not a replacement for version control. Source: docs:checkpointing, under Not a replacement for version control
- A project is one coordinating conversation plus the threads it starts, and each thread is usually a cloud session. Source: docs:claude-projects, under How a project is organized
- Project memory is notes Claude keeps as files, with MEMORY.md read by each cloud thread at its start. Source: docs:claude-projects, under Give a project standing context
- Project instructions are text sent to each new thread, up to 16,000 characters. Source: docs:claude-projects, under Give a project standing context
- Project memory is separate from the auto memory Claude Code keeps on a machine, and from the instruction files in the project's repositories. Source: docs:claude-projects, under Give a project standing context
- Cloud threads load each repository's CLAUDE.md but not its skills, its settings file, its hooks or its agents. Source: docs:claude-projects, under What threads pick up from your repositories
- The page says projects are in public beta and are not offered on Team or Enterprise plans yet. Source: docs:claude-projects, opening note

## What is not known

- The folder found/ holds 568 files. Source: du --inodes -s found, run in this step, less one for the folder itself
- The folder lessons/ holds 491 files. Source: du --inodes -s lessons, run in this step, less one for the folder itself
- Whether the numbers of the files in lessons/ have gaps is not known, because no command of this step lists them. Source: this step's reading
- The size of found/, lessons/ and plans/ in lines and bytes is not known, because the step's counting command names eight files only. Source: this step's reading, the command wc -l -c run in this step
- The sizes of PROGRAM.md, LESSONS.md and NOTES.md at the commit before the rebuild are not known beyond the figures the record of 2 November 2026 gives for LESSONS.md and NOTES.md. Source: this step's reading, looked for in S/research/before/ and archive/plans/redesign-record.md:368
- Which session reads the ranked list, the lessons or found/, and when, is not stated by the short page, the running page or the instruction file beyond the line that says no session loads the lessons. Source: this step's reading, looked for with Grep in plans/native/page.md and plans/native/running.md
- Whether any app's repository loads or writes its own ranked list, found/ or lessons is not known, because no app's repository is read from this session. Source: this step's reading, looked for in the hub's records only
- Whether auto memory is on in the Hub environment's session is not known, because the page names local sessions and self-hosted environments and not the cloud environment. Source: docs:memory, under Enable or disable auto memory
- What the documentation offers for a ranked list of work, for a findings folder or for an archive of lessons is not known, because none of the five pages names one. Source: this step's reading of the headings of memory, sessions, claude-directory, checkpointing and claude-projects
- The scratchpad's contents after this session ends are not known beyond what the page says of its retention. Source: docs:claude-directory, under Session scratchpad directory

## Found

- LESSONS.md says every session on any app should read it alongside DOCTRINE.md, and the instruction file says no session loads it. Source: LESSONS.md:3-5 and CLAUDE.md:33
- The notes file says foundQueue in hook-dispatch.mjs reads the found/ folder, the dispatcher today has no such name, and the instruction file says nothing reads found/ as a queue. Source: NOTES.md:15, a Grep of hook-dispatch.mjs for foundQueue run in this step, and CLAUDE.md:34
- The head of the ranked list says the order of the standing items is the way forward in plans/program-cull.md, and that record says the way forward is planned on its own page. Source: PROGRAM.md:54 and plans/program-cull.md:25
- The record of the cull counts 597 items as read on 13 November 2026, and the ranked list's count line today counts 621. Source: plans/program-cull.md:13 and PROGRAM.md:60
- The retired-files list is headed as the gate files retired on 12 November 2026 and names aim-review.md and agent-rules.md, and its last line says both are in the tree again. Source: archive/RETIRED-FILES.txt:1 and archive/RETIRED-FILES.txt:17
