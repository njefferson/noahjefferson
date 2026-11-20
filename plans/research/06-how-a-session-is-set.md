# How a session is set: the settings, the environment and the levers

Made by a step of the research page drawn on 19 November 2026. It records and recommends nothing. The documentation it cites was saved by that page's first step on the day it ran, and the commit that holds this file dates it.

## What the part is for

- The short page says sessions run for hours with nobody watching, and that the result comes back as a few plain lines. Source: plans/native/page.md:7
- The short page says the cheapest tier that holds the rules does everything except judgement. Source: plans/native/page.md:9
- The short page says lighter never means less protected, and that nothing is dropped to make the work run faster. Source: plans/native/page.md:11
- The short page says a long run's cost is stated before it starts, and that workers on the cheapest tier do the steps. Source: plans/native/page.md:18
- The short page names the cost part of a page as how many agents, on which tier, and about how long. Source: plans/native/page.md:34
- The short page says every time given to the reader is California time. Source: plans/native/page.md:43
- The page on running sessions says the worker and the checker carry their own tier, so a step costs the same whatever serves the main thread, and the main thread costs what it runs on. Source: plans/native/running.md:70
- The page on running sessions says the top tier is for the scope and for a surprise that needs judgement, and a lower tier holds the run after approval. Source: plans/native/running.md:71
- The page on running sessions says a session cannot change its own model, and that the tier is changed by the model command typed alone while the thread is idle. Source: plans/native/running.md:72
- The page on running sessions says plan mode is used for the scope because it gives the approve button, and that the run after approval is in a mode that does not ask before each edit. Source: plans/native/running.md:63
- The page on running sessions says the hub's copy in the container is brought forward from the hub's main at every start and resume. Source: plans/native/running.md:77
- The page on running sessions says the setup script's text is stored on each environment and changes only by a card in a session of that environment. Source: plans/native/running.md:82
- The record of the rebuild lists the settings that are changed by a person in the cloud environment or on GitHub, and when each is needed. Source: archive/plans/redesign-record.md:432
- The record of the rebuild says the main thread runs on Opus for runs that dispatch and compare, and on the top tier only in the fresh session that writes the design, and that a switch re-reads the conversation uncached. Source: archive/plans/redesign-record.md:437
- The appendix of the first research file says each model has its own cache, and that after a change of model the next request reads the whole conversation with no cache. Source: plans/research/00-what-was-read.md:7
- The appendix of the first research file records that a card setting five variables on the Hub environment was refused, naming one variable as reserved among those that steer the session's runtime. Source: plans/research/00-what-was-read.md:39

## What is there today

- The user-level settings file at /root/.claude/settings.json wires nine events, SessionStart, UserPromptSubmit, PreToolUse, PostToolUse, PostToolUseFailure, Stop, PreModelSwitch, PostModelSwitch and ConfigChange. Source: /root/.claude/settings.json:2-110
- Each of the nine entries in the user-level file has an empty matcher, runs the dispatcher in the clone at /root/.claude/hub with the event's name, and has a timeout of 120. Source: /root/.claude/settings.json:5-10
- The user-level file sets showClearContextOnPlanAccept to false. Source: /root/.claude/settings.json:112
- The user-level file holds no permissions, env or model key. Source: /root/.claude/settings.json:1-113
- The launcher settings file at /root/.claude/launcher-settings.json wires a SessionStart hook that runs session-start-setup-script-failure.sh. Source: /root/.claude/launcher-settings.json:4-14
- The launcher settings file wires a Stop hook that runs stop-hook-git-check.sh. Source: /root/.claude/launcher-settings.json:15-25
- The launcher settings file allows the Skill tool. Source: /root/.claude/launcher-settings.json:28-30
- The launcher settings file denies reads of the folder named remote under the configuration folder, in two spellings, and of /run/ccr. Source: /root/.claude/launcher-settings.json:32-34
- The launcher settings file denies edits of itself in three spellings. Source: /root/.claude/launcher-settings.json:35-37
- The launcher settings file denies edits of stop-hook-git-check.sh and of user-prompt-submit-reply-reminder.py, each in two spellings. Source: /root/.claude/launcher-settings.json:38-41
- The launcher settings file holds ten deny entries and does not deny edits of session-start-setup-script-failure.sh. Source: /root/.claude/launcher-settings.json:31-42
- The two folders the launcher settings deny reading, the one named remote under the configuration folder and /run/ccr, were not opened by this step. Source: this step's reading of its places
- The stop script exits 0 where no git repository can be found from the working directory, where the input says a stop hook is already active, and where the repository has no remote. Source: /root/.claude/stop-hook-git-check.sh:21-55
- The stop script exits 2 with a message asking for a commit and a push where there are uncommitted changes. Source: /root/.claude/stop-hook-git-check.sh:85-88
- The stop script exits 2 with a message asking for a commit and a push where there are untracked files. Source: /root/.claude/stop-hook-git-check.sh:91-95
- The stop script exits 2 where commit signing is configured and a local commit has no signature or a committer address other than the one it names. Source: /root/.claude/stop-hook-git-check.sh:135-171
- The stop script exits 2 where the branch has commits not on its remote branch, and otherwise exits 0. Source: /root/.claude/stop-hook-git-check.sh:174-185
- The session-start script reads a note at /root/.claude/environment-manager/setup-script-failed that the environment manager leaves when the setup script failed, and exits 0 where the note is absent or is a link. Source: /root/.claude/session-start-setup-script-failure.sh:16-18
- The session-start script prints fixed wording and the exit code only, and its comments give the reason as that the script's output can carry text from outside parties. Source: /root/.claude/session-start-setup-script-failure.sh:7-10
- The session-start script starts no program, and every command in it is a builtin. Source: /root/.claude/session-start-setup-script-failure.sh:12-15
- The session-start script's printed steps tell the model to read the note, find the cause, propose a corrected script with the update_environment tool for approval on a card, and install by hand if the task needs it. Source: /root/.claude/session-start-setup-script-failure.sh:30-37
- The reply-reminder script is a UserPromptSubmit hook that adds the text in the variable CCR_OPUS_REMINDER_HOOK_BODY as context, and does nothing when the variable is empty. Source: /root/.claude/user-prompt-submit-reply-reminder.py:39-43
- The reply-reminder script's comments say the environment manager registers it in the launcher settings only when that variable is set, for sessions that start from a chat-tool message. Source: /root/.claude/user-prompt-submit-reply-reminder.py:17-21
- The reply-reminder script emits only where the last main-loop model in the transcript is Opus-class or cannot be told, and exits 0 on any failure. Source: /root/.claude/user-prompt-submit-reply-reminder.py:79-99
- The launcher settings file wires no UserPromptSubmit hook. Source: /root/.claude/launcher-settings.json:3-26
- The hub's own .claude/settings.json holds 34 allow entries on lines 4 to 37 and no deny, env or model key. Source: .claude/settings.json:1-73
- The hub's allow entries are the page tool Artifact, git prefix rules for status, diff, log, add, commit, push, ls-remote, fetch, worktree add, merge, pull, rebase, rm, show and rev-parse, and a pull of the hub's clone from the checkout. Source: .claude/settings.json:5-15
- The hub's allow entries also hold an npm rule for a worktree under the scratchpad, node rules for the hub's check scripts and for paths under /tmp/claude-0/, node --check, and two python rules. Source: .claude/settings.json:17-37
- The hub's allow entries hold an npm rule and two node rules that name the Jefferson-Photography-Studio folder. Source: .claude/settings.json:16-18
- The hub's settings wire SessionStart to .claude/hooks/session-start.sh, Stop to .claude/hooks/stop-guard.sh, and PreToolUse with the matcher .* to .claude/hooks/plan-guard.sh. Source: .claude/settings.json:40-71
- session-start.sh clones the hub into /root/.claude/hub where the dispatcher is absent, and runs the dispatcher's install after it. Source: .claude/hooks/session-start.sh:11-24
- session-start.sh then prints the session brief and installs the branch guard, each ending in a form that lets the script go on. Source: .claude/hooks/session-start.sh:26-27
- stop-guard.sh exits 0 where the user-level settings name hook-dispatch.mjs, and otherwise runs the stop guard of a copy beside the checkout when one exists. Source: .claude/hooks/stop-guard.sh:12-18
- plan-guard.sh pipes the call to the plan guard it finds in the checkout or beside it, and where it finds none it refuses only when the call's permission mode is plan. Source: .claude/hooks/plan-guard.sh:26-44
- The dispatcher's install writes the nine events into the user-level file, or into the file named by HOOK_DISPATCH_SETTINGS_FILE, replacing any earlier dispatcher entry. Source: hook-dispatch.mjs:86-101
- The dispatcher's install sets showClearContextOnPlanAccept to false, with the comment that an approval taken with clear context is a deny of ExitPlanMode. Source: hook-dispatch.mjs:96-97
- The dispatcher's list of events is the nine that the user-level file wires. Source: hook-dispatch.mjs:65
- The dispatcher names the model commands for a run and for a page, claude-opus-5-5 and claude-fable-5-2. Source: hook-dispatch.mjs:66-68
- The dispatcher does not ask a repository's own hooks about ConfigChange, PreModelSwitch and PostModelSwitch. Source: hook-dispatch.mjs:75-76
- The dispatcher's head comment says an error thrown outside the push guard's own refusal is printed and the event exits 0. Source: hook-dispatch.mjs:48-49
- The dispatcher's head comment says the install runs from a stable clone, so a broken edit in a working copy cannot refuse its own fix. Source: hook-dispatch.mjs:45-46
- The dispatcher brings the hub's copy forward from the remote's main at SessionStart, and prints one line at each UserPromptSubmit. Source: hook-dispatch.mjs:38-42
- The session's environment is named Hub and is personal. Source: the words read by the managing session on 19 November 2026
- The environment's network is limited, with package registries and the hosts of connected servers allowed and one allowed host pattern, *.pages.dev. Source: the words read by the managing session on 19 November 2026
- The environment holds no variable names and no network secrets. Source: the words read by the managing session on 19 November 2026
- The environment's setup script is three lines: it makes the configuration folder, clones the hub into it where the dispatcher is absent, and runs the dispatcher's install. Source: the words read by the managing session on 19 November 2026
- The environment lists no repositories, and the account holds 23 other cloud environments. Source: the words read by the managing session on 19 November 2026
- The session's effort is xhigh, and it compacts by the model's default at 901,600 tokens of a window of 980,000. Source: the words read by the managing session on 19 November 2026
- The cost print opens with a block that plants a transcript and prints the planted counts beside the known figures, and its fourth line says they match. Source: scratchpad:research/cost.txt:1-4
- The cost print reads 25 approved plans, and its total over every transcript named lists 4 compactions, 1 start, 20 resumes and 4 compaction start hooks. Source: scratchpad:research/cost.txt:654-682
- The cost print's totals for the main thread are 597 turns on claude-fable-5-2 with cache read 309,507,736 and cache written 17,185,871. Source: scratchpad:research/cost.txt:670
- The cost print's totals for the main thread are 185 turns on claude-opus-5-5 with cache read 76,058,032 and cache written 5,514,275. Source: scratchpad:research/cost.txt:671
- The cost print's totals for the main thread also hold 12 turns on claude-fable-5-1 and 2 synthetic turns. Source: scratchpad:research/cost.txt:672-673
- The cost print's totals for agents are 235 agents, all served mostly by claude-sonnet-5-5, with 2,469 turns, cache read 140,303,961 and cache written 11,606,766. Source: scratchpad:research/cost.txt:674-677
- The cost print lists the four compactions on 14 November at 11:01, 16 November at 09:37, 16 November at 19:40 and 18 November at 21:48 California time, from contexts of 910,474, 922,629, 901,139 and 918,243 tokens. Source: scratchpad:research/cost.txt:681
- The cost print reports 96 stop-hook messages in 89 stops, 82 from command hook 3 and 14 from command hook 1. Source: scratchpad:research/cost.txt:656-659
- The cost print gives the opening words of the stop-hook messages as 37 for uncommitted changes, 28 for untracked files, 17 for unpushed commits and 14 for a refused reply. Source: scratchpad:research/cost.txt:660-664
- The cost print reports 2 hook refusals on the main thread with no gate named in their text, and 2 refusals of agents by the push gate. Source: scratchpad:research/cost.txt:665-666,678-679
- The cost print gives the harness's own running cost entry, the last of 62, as 542.67 dollars, carrying five models. Source: scratchpad:research/cost.txt:647
- The harness's running cost entry lists claude-fable-5-2 with cache read 360,484,013 and claude-opus-5-5 with cache read 94,593,256. Source: scratchpad:research/cost.txt:650-651
- The harness's running cost entry lists claude-sonnet-5-5 with output 2,495,434 and claude-haiku-5-5 with input 500,202 and no cache use. Source: scratchpad:research/cost.txt:649,652
- The cost print gives plan 6 as the plan with the most agents, 118, and 594 agent turns with cache read 49,176,010. Source: scratchpad:research/cost.txt:166-169
- The cost print gives the plan of 19 November that drew the research, plan 25, with 1 agent on claude-sonnet-5-5 and 2 stop-hook messages. Source: scratchpad:research/cost.txt:623-645

## What was there before the rebuild

- The configuration baseline of 2 November 2026 lists every configuration item of the hub with its state, how it was read, and the program item that may change it. Source: 4ea3157:CONFIG.md:3
- The baseline says hooks are wired in three layers that stack, the project layer, the user layer and the git layer. Source: 4ea3157:CONFIG.md:17
- The baseline's project hooks are SessionStart, which prints the brief and installs the branch guard and fails open, Stop, which runs the stop guard of a copy beside the checkout and fails open, and PreToolUse with the matcher .*, which runs the plan guard. Source: 4ea3157:CONFIG.md:21-25
- The baseline says the project's session-start script did not clone the hub to the user-level path, so a fresh container ran with no dispatcher until a plan's first step installed it. Source: 4ea3157:CONFIG.md:23
- The baseline's user-level file is written by the dispatcher's install from the clone at /root/.claude/hub and wires nine events with an empty matcher and a timeout of 120 seconds. Source: 4ea3157:CONFIG.md:29-31
- The baseline says PreModelSwitch answered allow with the switch's cost figures and wrote a line to status/switches.txt, and PostModelSwitch returned the tier line as added context, and neither blocked. Source: 4ea3157:CONFIG.md:32
- The baseline says ConfigChange appended a line to status/config-changes.jsonl in the scratchpad for each reported change to a settings file or a skill file, and never blocked one. Source: 4ea3157:CONFIG.md:33
- The baseline says the user-level file also set showClearContextOnPlanAccept to false. Source: 4ea3157:CONFIG.md:34
- The baseline says the harness syncs skill reference files into a user-level skills folder and rewrites them without any program item making the change. Source: 4ea3157:CONFIG.md:42
- The baseline's git hook was .githooks/pre-commit, generated by the branch guard from .branch-guard, running three checks and refusing a commit on any branch but main. Source: 4ea3157:CONFIG.md:50-52
- The baseline names the cloud environment's own git stop hook as wired from the environment's launcher settings outside any repository, with its place not known. Source: 4ea3157:CONFIG.md:62
- The baseline names three harness behaviours that act as configuration and are not hooks: the permission classifier that refuses an edit of the session's own permissions list, the approval prompt on a publish of an already published page, and the plan mode the harness restores at a resume. Source: 4ea3157:CONFIG.md:63
- The baseline counts 154 refusal sites across 11 guard files, the dispatcher at 3614 lines among them. Source: 4ea3157:CONFIG.md:74,92
- The baseline reads the agent rules at version 4 in the hub's root and in the clone. Source: 4ea3157:CONFIG.md:124
- The baseline reads 21 allow entries in the hub's settings, on lines 4 to 24, and says two of them name a sibling repository's path. Source: 4ea3157:CONFIG.md:156-164
- The baseline reads six branches on the hub's remote, every one reporting protected as false. Source: 4ea3157:CONFIG.md:168
- The baseline reads three pinned actions and a pinned zizmor version, and four open updates from the dependency bot. Source: 4ea3157:CONFIG.md:134-151
- The baseline gives each sibling's gate wiring as the hub's file lists it, and says no sibling workflow was read in that step. Source: 4ea3157:CONFIG.md:178
- The record of the rebuild's section 8 lists two layers of hooks that stack, the hub's project settings with 20 allow rules and the user-level file with six events. Source: archive/plans/redesign-record.md:362-363
- The record's section 8 gives the always-loaded text of the time, including an instruction file of 1477 lines. Source: archive/plans/redesign-record.md:368
- The record's section 11 says branch protection on the hub's main and on each app's main and staging is set on GitHub before any stage that removes a transcript gate. Source: archive/plans/redesign-record.md:439
- The record's section 11 says the environment's own git stop hook was to be narrowed or turned off before such a stage, and that where it lives was not found by step 31. Source: archive/plans/redesign-record.md:440
- The record's section 11 says per-repository permission rules are one prefix rule per command shape, and that a session cannot write them for itself because the classifier refuses an edit of its own permissions list. Source: archive/plans/redesign-record.md:441
- The record's section 11 says the documentation adds that allow rules apply only once the folder is trusted, and that a session holding several repositories reads no permission rules from any repository. Source: archive/plans/redesign-record.md:441
- The first research file records that the container's user-level settings file at 20:56 on 16 November held the hooks and no env and no model, and was last written on 13 November. Source: plans/research/00-what-was-read.md:48
- The first research file records that the repository's settings file held permissions and hooks, and that the process environment held none of the model variables. Source: plans/research/00-what-was-read.md:48
- The first research file records that the dispatcher before the rebuild sent no agent while a top-tier model served the main thread, and held nothing where the model could not be read. Source: plans/research/00-what-was-read.md:50
- The first research file records a second refusal, of a card setting four variables on the Hub environment, which named ANTHROPIC_DEFAULT_SONNET_MODEL as reserved in the words of the first. Source: plans/research/00-what-was-read.md:45
- The first research file records that the first refusal named CLAUDE_CODE_SUBAGENT_MODEL_FORCE as reserved and said it can be set in Settings. Source: plans/research/00-what-was-read.md:39

## What the documentation says

- The compaction window can be set by the /autocompact command, by autoCompactWindow in a settings file, by the --autocompact flag for one launch, by CLAUDE_CODE_AUTO_COMPACT_WINDOW in scripts and cloud environments, and by a subagent's own field. Source: docs:model-config.md, Set the auto-compact window
- The variable CLAUDE_CODE_AUTO_COMPACT_WINDOW takes precedence over the command, the flag and the setting unless Claude Code ignores its value. Source: docs:model-config.md, Set the auto-compact window
- The window is a size of 100K tokens or more, and Claude Code caps it at the model's context window. Source: docs:model-config.md, Set the auto-compact window
- By default, models with a native 1M window compact at about 967K tokens, and cloud sessions compact as the conversation approaches the model's limit. Source: docs:model-config.md, Default auto-compact thresholds
- A cloud session sets CLAUDE_AUTOCOMPACT_PCT_OVERRIDE itself, so compaction triggers partway through the window, and a value added to the environment does not change it. Source: docs:claude-code-on-the-web.md, Manage context
- In a cloud session /autocompact can be run with a token count where the window variable is not set. Source: docs:claude-code-on-the-web.md, Manage context
- A cloud session also sets some variables itself when it starts, and for CLAUDE_AUTOCOMPACT_PCT_OVERRIDE the session's value overrides one added to the environment. Source: docs:cloud-environments.md, Set environment variables
- The idleCompaction setting governs when Claude Code also compacts a conversation left idle. Source: docs:model-config.md, Default auto-compact thresholds
- A long conversation left idle on the one-hour cache lifetime can be compacted, and idleCompaction set to false turns that off. Source: docs:prompt-caching.md, Compacting the conversation
- Effort is set by /effort, by the model picker, by --effort, by CLAUDE_CODE_EFFORT_LEVEL, by modelSettings or effortLevel in settings, and by frontmatter in a skill or a subagent. Source: docs:model-config.md, Set the effort level
- The effortLevel setting accepts low, medium, high and xhigh, and the key does not accept max. Source: docs:model-config.md, Set the effort level
- CLAUDE_CODE_EFFORT_LEVEL overrides --effort and /effort. Source: docs:env-vars.md, the paragraph before Variables
- In a cloud session /model and /effort take the value as an argument in place of the terminal picker. Source: docs:claude-code-on-the-web.md, Manage context
- A subagent with no effort of its own runs at the session's level on the main conversation's model, and does not on another model. Source: docs:model-config.md, Effort level of subagents and teammates
- The cache lifetime has two buckets, the main conversation and everything else, and each takes 5m or 1h. Source: docs:prompt-caching.md, Choose the TTL yourself
- The main conversation's lifetime is set by promptCacheTtl or CLAUDE_CODE_PROMPT_CACHE_TTL, and the other bucket's by subagentPromptCacheTtl or CLAUDE_CODE_SUBAGENT_PROMPT_CACHE_TTL. Source: docs:prompt-caching.md, Choose the TTL yourself
- Where several controls apply the first match wins, in the order FORCE_PROMPT_CACHING_5M, the bucket's variable, the bucket's setting, a subagent's cacheTtl field, ENABLE_PROMPT_CACHING_1H, then the default. Source: docs:prompt-caching.md, Choose the TTL yourself
- By default Claude Code requests the one-hour lifetime for the main conversation only on a Claude subscription within the plan's included usage, and the other bucket gets five minutes. Source: docs:prompt-caching.md, Which TTL each request gets
- When usage credits are drawn on, the main conversation drops to the five-minute lifetime unless a lifetime is chosen. Source: docs:prompt-caching.md, Which TTL each request gets
- Subagents, workflows, forks, compaction and session titles fall in the other bucket and get five minutes by default. Source: docs:prompt-caching.md, Which TTL each request gets
- Claude Code asks to confirm a model switch only while the cache is warm and the new model is not the one that produced the last response. Source: docs:prompt-caching.md, Switching models
- Each model has its own cache, so a switch with /model makes the next request read the whole history with no cache hits. Source: docs:prompt-caching.md, Switching models
- The opusplan setting makes each plan-mode toggle a model switch that starts a fresh cache. Source: docs:prompt-caching.md, Switching models
- With an API key or a Claude subscription, changing effort keeps the cache on Fable 5.1 and later, Opus 5.5, Sonnet 5.5 and Haiku 5.5, and on most other models it does not. Source: docs:prompt-caching.md, Changing effort level
- Prompt caching can be turned off by DISABLE_PROMPT_CACHING, or per model tier by DISABLE_PROMPT_CACHING_FABLE, _OPUS, _SONNET and _HAIKU. Source: docs:env-vars.md, Variables
- The cost output adds a Prompt cache (main) line giving requests, the share of input from cache, misses and whether the cache is warm with its lifetime, for the main conversation only. Source: docs:costs.md, Prompt cache statistics
- A model is set, in order, by the model command, the launch flag, ANTHROPIC_MODEL, the model setting, then ANTHROPIC_DEFAULT_MODEL. Source: docs:model-config.md, Setting your model
- ANTHROPIC_DEFAULT_OPUS_MODEL is the model the opus alias resolves to and that opusplan uses while plan mode is active. Source: docs:env-vars.md, Variables
- CLAUDE_CODE_SUBAGENT_MODEL_FORCE set to 1 forces one model onto subagents, teammates and workflow agents. Source: docs:env-vars.md, Variables
- To change a setting for a cloud session, the page says to set an environment variable on the environment or, in a session with one repository outside a project's threads, to commit the key to that repository's .claude/settings.json. Source: docs:settings.md, Settings in cloud sessions
- Environment variables use KEY=value lines, are read when a session is created and each time Claude Code starts in the session's VM, and can be read by anyone who uses the environment. Source: docs:cloud-environments.md, Set environment variables
- An edit to an environment's variables reaches an existing session only when its VM is next restored or rebuilt. Source: docs:cloud-environments.md, Set environment variables
- The documentation lists variables Claude Code ignores from every settings file because its hosting environments own them, CLAUDE_CODE_REMOTE and CLAUDE_CODE_ACCOUNT_UUID among them. Source: docs:settings-reference.md, env
- In a cloud session Claude Code ignores six transport variables from a settings file's env block, among them NODE_EXTRA_CA_CERTS and CLAUDE_CODE_OAUTH_SCOPES, and notes each in the debug log. Source: docs:network-config.md, the cloud sessions paragraph
- The documentation names no list of model variables that a cloud session keeps from an environment's variables. Source: this step's reading of the pages named under the documentation places
- The advisor is set by the /advisor command, by advisorModel in a settings file, or by --advisor for one launch. Source: docs:advisor.md, Enable the advisor
- The /advisor command works without a terminal picker, in non-interactive mode, in the Agent SDK, the desktop app and over Remote Control, and /advisor off turns it off. Source: docs:advisor.md, Use the /advisor command
- CLAUDE_CODE_DISABLE_ADVISOR_TOOL set to 1 makes /advisor unavailable and ignores any advisorModel. Source: docs:advisor.md, Turn the advisor off
- The advisor needs a feature flag fetched from Anthropic unless the provider is Claude Platform on AWS or Claude Models on Google Cloud. Source: docs:advisor.md, Requirements
- The agent setting runs the main thread as a named subagent, with that agent's system prompt, tool restrictions and model, and may be set in any file. Source: docs:settings-reference.md, agent
- The --agent flag takes precedence over the agent setting for one session. Source: docs:settings-reference.md, agent
- An agent run as the main thread can list the subagent types it may spawn with Agent(agent_type) in its tools field, and that list applies only to the main thread. Source: docs:sub-agents.md, Restrict which subagents can be spawned
- A subagent's autoCompactWindow field has no effect where the session runs as that subagent. Source: docs:sub-agents.md, Auto-compaction
- Frontmatter hooks of an agent run alongside the hooks in settings.json when the agent runs as the main session. Source: docs:sub-agents.md, Hooks in subagent frontmatter
- permissions.deny lists tool uses Claude Code blocks, and may be set in any file. Source: docs:settings-reference.md, permissions.deny
- Deny rules for Read and Edit apply to the built-in file tools, to file commands Claude Code recognizes in Bash and to redirection targets, and not to a command that reads files without naming them or to arbitrary subprocesses. Source: docs:settings-reference.md, permissions.deny
- --disallowedTools adds deny rules for one session beside the key. Source: docs:settings-reference.md, permissions.deny
- In a cloud thread in a project none of a repository's permission rules, hooks or env apply. Source: docs:settings.md, Settings in cloud sessions
- A repository's .claude/settings.json is read in a session with one repository outside a project's threads, and in a session with several repositories only the enabledPlugins and extraKnownMarketplaces keys are read. Source: docs:settings.md, Settings in cloud sessions
- User settings and project local settings are not read in a cloud session. Source: docs:settings.md, Settings in cloud sessions
- The user-level SessionStart hooks in ~/.claude/settings.json are not expected in the cloud, and the page says which other hooks run depends on where the session runs. Source: docs:cloud-environments.md, Setup scripts vs. SessionStart hooks
- Managed settings: a managed-settings.json file or MDM profile on a device does not reach a cloud session, and server-managed settings do. Source: docs:settings.md, Settings in cloud sessions
- Server-managed settings reach cloud sessions except Claude Tag sessions, and are fetched when the session starts. Source: docs:cloud-environments.md, What carries over from your setup
- Server-managed settings are available for Claude for Teams and Claude for Enterprise, and are fetched at startup and refreshed hourly. Source: docs:server-managed-settings.md, the introduction and Choose between server-managed and endpoint-managed settings
- A setup script runs as root before Claude Code launches, must exit zero and finish within about five minutes for the environment to be cached, and runs before the environment's variables are set. Source: docs:cloud-environments.md, Script requirements
- The setup script is skipped where a cached environment exists, runs again when the script or the allowed hosts change or after about seven days, and does not run when a VM is restored after being idle. Source: docs:cloud-environments.md, Environment caching
- An environment has one network access level, Limited by default, with an Allowed domains list in which a leading *. matches every subdomain. Source: docs:cloud-environments.md, Allow specific domains
- After a compaction Claude Code runs SessionStart hooks that match the compact source and re-reads up to five recent files. Source: docs:context-window.md, What survives compaction
- The documentation gives debug-your-config sections named Check resolved settings and Check hooks for finding what a session loaded. Source: docs:debug-your-config.md, Check resolved settings

## What is not known

- Whether the account's plan carries server-managed settings is not known, because the facts given for this step and the pages read do not say. Source: this step's reading, looked for in the facts and in docs:server-managed-settings.md
- Which source sets the session's compaction window of 901,600 tokens is not known, because the settings files read hold no autoCompactWindow and no env block. Source: this step's reading, looked for in /root/.claude/settings.json, /root/.claude/launcher-settings.json and .claude/settings.json
- The values of the process environment's variables in this session are not known, because no command of this step reads them. Source: this step's reading
- Which cache lifetime the main conversation's requests get in this session is not known, because no file read sets one and the account's billing kind is not among the facts. Source: this step's reading, looked for in the settings files and docs:prompt-caching.md
- Whether a cloud session can pass a launch flag such as --advisor or --autocompact is not known, because the pages read name the flags and name no cloud route for them. Source: docs:advisor.md, Use the --advisor flag, and docs:model-config.md, Set the auto-compact window
- Whether the session's effort of xhigh was set by a variable, a setting or a command is not known, because the files read hold no effortLevel and no variable. Source: this step's reading, looked for in the settings files
- What another settings file under /home, named by an earlier worker's report as a launcher file under /home/claude, holds is not known, because it is not among this step's places. Source: scratchpad:progress/research-step-7-report.txt:9
- What the folder named remote under the configuration folder and /run/ccr hold is not known, because the harness denies reads of both. Source: /root/.claude/launcher-settings.json:32-34
- What the other 23 environments hold is not known, because the facts give only their count. Source: the words read by the managing session on 19 November 2026
- Which pages of the documentation list the model variables a cloud session reserves is not known, because the pages read do not name such a list. Source: this step's reading, looked for in docs:env-vars.md, docs:settings-reference.md and docs:cloud-environments.md
- The part of the first section of the rebuild's record and of plans/native-setup.md that bears on this part is not known, because neither is among this step's places. Source: this step's reading of its places
- Whether the copy of the hub's settings at /root/.claude/hub/.claude/settings.json differs from the checkout's is not known, because this step did not open it. Source: this step's reading of its places

## Found

- The documentation says the user-level ~/.claude/settings.json is not read in a cloud session and that user-level SessionStart hooks are not expected in the cloud, and the container's /root/.claude/settings.json wires nine events to the dispatcher. Source: docs:settings.md, Settings in cloud sessions, and /root/.claude/settings.json:2-110
- The launcher settings hold ten deny entries, and an earlier worker's report of the same file counts eight. Source: /root/.claude/launcher-settings.json:31-42, and scratchpad:progress/research-step-7-report.txt:8
- The hub's .claude/settings.json holds 34 allow entries, the baseline of 2 November reads 21 on lines 4 to 24, and the record's section 8 says 20. Source: .claude/settings.json:4-37, 4ea3157:CONFIG.md:156, and archive/plans/redesign-record.md:362
- The record's section 8 says the user-level file wired six events, and the baseline of 2 November says it wired nine. Source: archive/plans/redesign-record.md:363, and 4ea3157:CONFIG.md:29-31
- The record's section 11 says where the environment's git stop hook lives was not found, and the launcher settings file names its script as stop-hook-git-check.sh in a Stop hook. Source: archive/plans/redesign-record.md:440, and /root/.claude/launcher-settings.json:15-25
- The baseline says where the environment's git stop hook is set is not known, and the launcher settings file wires it. Source: 4ea3157:CONFIG.md:62, and /root/.claude/launcher-settings.json:15-25
- The documentation gives about 967K tokens as the default compaction point of a model with a native 1M window, the facts given for this step give 901,600 of a window of 980,000, and the cost print's four compactions began from contexts between 901,139 and 922,629 tokens. Source: docs:model-config.md, Default auto-compact thresholds, the words read by the managing session on 19 November 2026, and scratchpad:research/cost.txt:681
- The launcher settings deny edits of user-prompt-submit-reply-reminder.py and wire no UserPromptSubmit hook. Source: /root/.claude/launcher-settings.json:3-26,40-41
- The launcher settings deny edits of stop-hook-git-check.sh and of themselves and do not deny edits of session-start-setup-script-failure.sh, which they also wire. Source: /root/.claude/launcher-settings.json:4-14,35-41
- The hub's .claude/settings.json holds allow rules that name the Jefferson-Photography-Studio folder, which the baseline of 2 November and the record's section 8 each say a session holding the hub alone cannot use. Source: .claude/settings.json:16-18, 4ea3157:CONFIG.md:164, and archive/plans/redesign-record.md:362
