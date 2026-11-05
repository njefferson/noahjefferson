# The config-change hook: the record

Written by step 37 of the plan that serves P-21. Step 38 builds from this record and step 39 closes from it. Everything below was read in the session that wrote it; a fact that a later read contradicts ejects the step that meets it.

## What was read

The hub's main head of 5 November 2026 is the head both clones stand at after the fast-forwards of this step; the live clone moved over three commits and the working clone over two, and both were clean beforehand.

The agent rules file at the live clone reads version 5.

## P-21, P-6, P-180 and P-201 at the head

P-21 at the head was open, plan none, goal 6, and this step set it to planned under this plan's file name. Acceptance: a ConfigChange hook reports a change to a user, project or local settings file or a skill file, and the baseline's drift detection uses it; a run in this container shows the hook firing on a planted change. A change to managed policy settings cannot be blocked by it, and server-managed settings do not run it. Gate whose job it does: none today. Depends: the harness version and P-6.

P-6 reads done, by step 53 of the redesign plan, which wrote CONFIG.md.

P-180 acceptance as it reads: answered by P-20's measured run; Q-HUB-161 gives the documentation's words. P-201 acceptance as it reads: answered by P-20. Both are open, plan none, depend on P-20. P-20's Done line, written by its step 35, says the cap of eight was measured once with a planted run of nine consecutive refusals made by the hub's own stop guard and that the harness overrode the ninth. That answers both, so step 39 sets both done.

## The event as the documentation states it

A ConfigChange hook runs when a configuration file changes during a session. The matcher is the source: user_settings for the user settings file, project_settings and local_settings for a repository's two settings files, policy_settings for the managed settings file or a file in its folder, and skills for a skill file under a repository's skills folder. The input carries the common fields, source and optionally file_path. A hook can block a change with exit code 2 or a JSON decision. A policy_settings change cannot be blocked; the hook still fires and a blocking decision is ignored. The harness does not run the hook when server-managed settings arrive or refresh. The harness discards a ConfigChange hook's systemMessage and continue, and a blocked change surfaces no message to the owner or to the model, only a debug line. So the hook can record and can block and can tell nobody anything; the owner reads the report through a file the status prints.

## How the dispatcher dispatches an event and how the install writes its list

The event name is the first argument of the command (the last block of hook-dispatch.mjs); the payload is read from standard input and parsed. The function main takes the event and the payload and branches on the event name; the two model-switch events are handled first, by modelSwitch, which writes a line to status/switches.txt in the session scratchpad through scratchpadOf and returns. The constant EVENTS holds the eight wired events, and the function install writes one entry for each, an empty matcher and the command node, the hub path of hook-dispatch.mjs and the event name, replacing any earlier hook-dispatch entry. The install target is the file the environment variable HOOK_DISPATCH_SETTINGS_FILE names, with the user settings file as the default.

## The design of the handler

In main, before the other branches, on the event ConfigChange: build one JSON object with the time, the source, the file path where given, the session id and the plan file the approval marker names where one is in force, append it as one line to status/config-changes.jsonl in the session scratchpad (the folder made where absent), and return 0. It never blocks and never writes to stderr, so no change is held, and a failure to write is swallowed because the change goes ahead whatever the record does. Exported as a named function configChange(p) so a case can call it through the dispatcher's command line.

## The design of the status line

A named function in report.mjs, configChangesBlock, reads status/config-changes.jsonl from the session scratchpad and returns the lines of the changes made since the last status stamp, each by time in California time, source and path. A change is marked with the word drift where no Files line of the approved plan in force names the file, and carries the words under the plan where one does; with no plan in force every change is drift. The status print includes the block and the status page carries the same lines. A missing or unreadable record prints nothing.

## The install's list

EVENTS gains ConfigChange, so the install wires it with an empty matcher, which means every source runs it. The install is then run from the live clone.

## The cases to add in step 38

A planted ConfigChange input through the dispatcher's command line for each of the five sources, showing one line each in the record and exit 0. A planted record showing the status block's drift word for a file outside the plan's Files and the under-the-plan words for one inside. The install's written settings, through HOOK_DISPATCH_SETTINGS_FILE, naming ConfigChange.

## The plants

One that takes out the record's append, one that takes out the drift word, and one that takes ConfigChange out of EVENTS. Each is run only through the suite's plants option, narrowed to hook-dispatch.mjs and report.mjs.

## The probe

After the push and the live clone's fast-forward, the install is run from the live clone twice. The first wires the event; the second rewrites the user settings file and is the user-settings plant. A skill file under the hub's skills folder is edited by one added line and edited back, and is the skills plant. After each the record file is read. Whether the harness fires the event for a write made by a child process, or by the Edit tool, is not stated in the documentation; the report says which plant fired.

## The sources not planted and why

Project settings: the file is tracked gate wiring and an edit changes what runs in every session of the repository. Local settings: a file left behind dirties the tree or lives untracked where the privacy gates do not look. Managed policy: the file is outside the repository and the documentation's words stand in the baseline. Server-managed settings never run the hook.

## The baseline's rows

CONFIG.md section 1.2 says the user settings file wires eight events; after step 38 it names nine, with ConfigChange added and a sentence that the handler records and never blocks. Section 1.4 says the ConfigChange hook is not wired in either settings file; after step 38 it says the install wires it and the handler is the drift record, changed by P-21. The lines naming P-21 as the changer stay.

## Invocations

The suite narrowed: node /home/user/noahjefferson/session-guards.test.mjs --plants --files=hook-dispatch.mjs,report.mjs. A case alone: the same command with --case= and the case's opening words. The suite whole: node /home/user/noahjefferson/session-guards.test.mjs, in the background where it may pass ten minutes. The instrument: node /home/user/noahjefferson/session-cost.mjs followed by the transcript's path. The hub checks: lessons-check.mjs, docs-check.mjs with the repository path as a positional argument, and privacy-check.mjs, third-person-check.mjs, quote-check.mjs and example-check.mjs each with --repo and the repository path.

## The close entry and the Done lines

The close entry under P-10 is a heading sentence naming the plan by the first clause of its title, steps 37 to 40, step 39 as the writer, the date, the instrument's number (11) and the item P-21, then bullets in the instrument's categories and the line that the transcript holds no price list (Q-HUB-132).

The sentence for P-21's Done line: the ConfigChange handler in the dispatcher records every change to a settings or skill file as one line in the session scratchpad and the status prints it as drift where no plan in force names the file; the handler is the gate that does the job now; the probe in this container showed BLANK; a change to managed policy settings cannot be blocked by it and server-managed settings do not run it.

The sentence for P-180's Done line: P-20's planted run, made by the hub's own stop guard, was counted by the harness, which overrode the ninth consecutive refusal, so the hub's own hooks count against the cap. For P-201: the cap of eight was measured in this container by P-20 and equals the documented cap.

## The instrument, as fixed

Step 37 changed session-cost.mjs to read an approval whose result opens with the harness's large-output wrapper from the saved file the wrapper names, and from the wrapper's preview where the file does not exist; a case and a plant (cost_saved_read) hold it. Run on this session's transcript it numbers eleven plans: plan 10 is the P-20 plan and plan 11 is this plan. The P-20 close entry under P-10 now carries plan 10's figures. What the instrument cannot see, as the redesign record lists it, stands; the large-output read is no longer on that list.

## The plant's reply line

The stop guard's plant refusal still opens with PLANT and the number out of the limit, and now tells the main thread to answer with one line that names the measurement, the number of the refusal out of the limit and what ends the run, with no tool call. Lesson 381 carries the sentence that a reply a guard dictates still carries information.
