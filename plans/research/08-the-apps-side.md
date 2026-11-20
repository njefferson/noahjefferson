# The apps' side, from the hub's records only

Made by a step of the research page drawn on 19 November 2026. It records and recommends nothing. The documentation it cites was saved by that page's first step on the day it ran, and the commit that holds this file dates it.

## What the part is for

- The apps' side is the part of the hub that concerns the other repositories: what the hub's own list says of each one, what each calls in the hub, and what is asked of an app to move to the new way. Source: this step's reading of the questions it was given
- The hub's record of the requirements says a finding brought from an app's session is taken directly in the hub session and lands in the hub as a file. Source: archive/plans/redesign-record.md:31
- The record says a session does what was asked and takes no step that leaves the app unworkable, including a change to the session's own set of repositories. Source: archive/plans/redesign-record.md:29
- The record says what a session does in the other repositories is answered from the files, with a recommendation. Source: archive/plans/redesign-record.md:32
- The record says an app's essential facts are kept in front of the session each time work touches them. Source: archive/plans/redesign-record.md:49
- The record says one finished redesign meets the stated intent, and that app work waits on it. Source: archive/plans/redesign-record.md:46
- The record says sessions already running take the changes in, and several sessions working on apps stop writing over each other in the hub. Source: archive/plans/redesign-record.md:60
- The record says the knowledge layer is justified for each repository and not for one app only, and that the hub is considered with the apps. Source: archive/plans/redesign-record.md:63
- The design says the second act builds the parts in the hub and the fifth act brings in the other nine repositories. Source: plans/native-setup.md:23
- The record says the parts reach the nine other repositories through the hub's copy in each session's container: the short page, the two procedures and the two roles as files there, and the push guard and the check before a push through the hub's hooks. Source: plans/native-setup.md:49
- The record says a role loads as the harness's own definition only in a session started in the repository that holds it, and a session started above several repositories gives its agents the role files by their paths. Source: plans/native-setup.md:49
- The record says a session in any of the ten repositories runs the hub's one dispatcher, the push guard with the check before a push, the four shells and that repository's own hooks. Source: plans/native-setup.md:59
- The record leaves for the next project that each app's session is started with that app alone, that an environment's setup script is the place that installs the hub, and that each app's own instruction file still describes the old way. Source: plans/native-setup.md:61
- The short page says where a repository's own instruction file still describes the gates retired on 12 November 2026, a session says so once at the start and names the move procedure. Source: plans/native/page.md:24
- The short page says a session adds, removes, proposes or mentions no app on the hub's public pages unless it has been named. Source: plans/native/page.md:53

## What is there today

- The hub's own list, REPOS.md, opens a section for each of ten repositories: the hub, Quietkeep, fauxplane, 3d-printing-pal, Intersecting-parallels, photo-pointer, MoleBridge, Cv-Thalweg, solve-ent and Jefferson-Photography-Studio. Source: REPOS.md:28
- Jefferson-Line has no section in that list. It is named once, in the line on the branch sweep caller, as not on the list. Source: REPOS.md:469
- The hub: branches are main only, there is no staging, and a push to main redeploys. Source: REPOS.md:32
- The hub deploys to its own pages.dev address, and its branch guard is installed with work=main and nothing else permitted. Source: REPOS.md:33
- The hub also hosts the shared accessibility statement at /accessibility, which every app's About screen links to. Source: REPOS.md:37
- Quietkeep: branches are staging and main, and every product change lands on staging and waits for the on-device pass and an explicit promote. Source: REPOS.md:44
- Quietkeep deploys to quietkeep.pages.dev from main and staging.quietkeep.pages.dev from staging, and a second edition, Quietkeep Sync, deploys to quietkeep-sync.pages.dev and its staging address. Source: REPOS.md:46
- Quietkeep's branch guard is installed with work=staging and promote=main through QUIETKEEP_PROMOTE=1. Source: REPOS.md:51
- Quietkeep's spine workflow calls the hub's shared gates workflow on its staging branch, read on 4 November 2026. Source: REPOS.md:53
- fauxplane: branches are staging and main, staging is a hard release gate, and the harness's claude branch is ignored. Source: REPOS.md:63
- fauxplane deploys to fauxplane.pages.dev and, from staging, to staging.fauxplane.pages.dev. Source: REPOS.md:61
- fauxplane's branch guard was installed on 2026-08-20 with work=staging and promote=main through FAUXPLANE_PROMOTE=1. Source: REPOS.md:66
- fauxplane's deploy.yml checks the hub out and runs privacy-check, quote-check and branch-guard with the artefact switch. Source: REPOS.md:68
- 3d-printing-pal: branches are staging and main, a push to main deploys production, and staging is the candidate that waits for the on-device pass. Source: REPOS.md:83
- 3d-printing-pal deploys to 3d-printing-pal.pages.dev and, from staging, to staging.3d-printing-pal.pages.dev. Source: REPOS.md:81
- 3d-printing-pal's branch guard was installed on 2026-08-20 with work=staging and promote=main through PAL_PROMOTE=1. Source: REPOS.md:85
- 3d-printing-pal's gates.yml checks the hub out and runs the privacy, quote and branch checks beside docs, pins, pwa, palette, textsize and its own gates, and a security job runs zizmor. Source: REPOS.md:87
- Intersecting-parallels: branches are staging and main, a product change goes staging, preview, on-device pass, explicit promote, main, and docs-only changes may land on main directly. Source: REPOS.md:103
- Intersecting-parallels deploys to intersecting-parallels.pages.dev and, from staging, to staging.intersecting-parallels.pages.dev, and the repository's name carries a capital I while its Pages project is lowercase. Source: REPOS.md:97
- Intersecting-parallels' branch guard was installed on 2026-08-20 with work=staging and promote=main through IP_PROMOTE=1. Source: REPOS.md:106
- Intersecting-parallels has five workflows, and its security.yml checks the hub out at main and runs pin-check, docs-check, privacy-check, quote-check and the branch check. Source: REPOS.md:108
- photo-pointer: branches are staging and main only, pull requests are not used, and a long-lived accessibility branch can no longer be pushed because only staging and main reach a remote. Source: REPOS.md:123
- photo-pointer deploys to photo-pointer.pages.dev and, from staging, to staging.photo-pointer.pages.dev. Source: REPOS.md:121
- photo-pointer's branch guard was installed on 2026-08-20 with work=staging and promote=main through POINTER_PROMOTE=1. Source: REPOS.md:129
- photo-pointer's ci.yml runs a SHA-pinned hub checkout with privacy-check, quote-check and the branch check. Source: REPOS.md:131
- MoleBridge: branches are staging and main, main is the Cloudflare Pages production branch, and promotion is a merge. Source: REPOS.md:151
- MoleBridge deploys to molebridge.pages.dev. Source: REPOS.md:154
- MoleBridge's branch guard is installed with work=staging and promote=main through MOLEBRIDGE_PROMOTE, with an also= check of tools/version-check.mjs. Source: REPOS.md:156
- MoleBridge's gates.yml checks the hub out SHA-pinned and runs privacy-check, quote-check, docs-check, pin-check and the branch check, beside its own checks. Source: REPOS.md:158
- Cv-Thalweg: branches are staging and main since 2026-08-29, and promotion is through THALWEG_PROMOTE=1 to main, which is production. Source: REPOS.md:188
- Cv-Thalweg deploys to cv-thalweg.pages.dev, and staging deploys to staging.cv-thalweg.pages.dev. Source: REPOS.md:196
- Cv-Thalweg's gates.yml calls the hub's reusable hub-gates.yml, pinned by SHA, and it was the first caller of that workflow. Source: REPOS.md:213
- solve-ent: branches are staging and main, and main is production and deploys. Source: REPOS.md:232
- solve-ent deploys to its pages.dev address from main through deploy.yml. Source: REPOS.md:234
- solve-ent's branch guard was installed on 2026-08-26 with work=staging and promote=main through SOLVENT_PROMOTE, with an also= check of tools/version-check.mjs. Source: REPOS.md:238
- solve-ent's gates.yml checks the hub out SHA-pinned and runs privacy-check, quote-check, docs-check, pin-check and the branch check ahead of the repository's own tests. Source: REPOS.md:241
- Jefferson-Photography-Studio: every commit is made on staging, and main is moved to the same commit by a fast-forward push of staging to main with no pull request. Source: REPOS.md:288
- Jefferson-Photography-Studio deploys from main to its own pages.dev project named for the studio, and from staging to a staging subdomain of it. Source: REPOS.md:286
- Jefferson-Photography-Studio's branch guard file says work=staging, promote=main and escape=JPS_PROMOTE, plus a long also= chain that runs on every commit. Source: REPOS.md:296
- Jefferson-Photography-Studio's gates.yml calls the shared hub-gates.yml, pinned by SHA with pwa true, and its deploy.yml does not wait on it. Source: REPOS.md:301
- The hub's reusable workflow takes a caller's pin from the uses line of the calling workflow file, and refuses a caller that does not name exactly one full 40-character commit. Source: .github/workflows/hub-gates.yml:146
- The reusable workflow's inputs are node-version, pwa, mirror, third-person, examples, docs-path, palette-path, textsize-paths and zizmor. Source: .github/workflows/hub-gates.yml:31
- REPOS.md says eight repositories call the shared workflow as of 4 November 2026: Cv-Thalweg, fauxplane, 3d-printing-pal, Intersecting-parallels, photo-pointer, MoleBridge and Solve-ent as of 2026-08-29, and Quietkeep read on 4 November. Source: REPOS.md:328
- HUB-REFERENCE.md records a census read on 2026-09-04 in which four call the shared workflow: Quietkeep, Cv-Thalweg, 3d-printing-pal and Jefferson-Photography-Studio. Source: HUB-REFERENCE.md:437
- That census has three still copying the job: MoleBridge with a pin of 26 August, solve-ent with a pin of 27 August, and fauxplane passing no ref at all. Source: HUB-REFERENCE.md:445
- That census has two referencing the hub in no workflow: Intersecting-parallels and photo-pointer. Source: HUB-REFERENCE.md:450
- The census records that tools/hub-pin-check.mjs is carried by five repositories: Quietkeep, Cv-Thalweg, solve-ent, 3d-printing-pal and Jefferson-Photography-Studio. Source: HUB-REFERENCE.md:453
- The census records that Jefferson-Photography-Studio is re-pinned, since 22 September, and that its pin check refuses a pin on no branch of the hub. Source: HUB-REFERENCE.md:482
- HUB-REFERENCE.md records that the hub's history was rewritten on 2026-09-18, that four hub commits named in the census are unreachable from main, and that a pre-rewrite pin still works because GitHub keeps serving a commit no ref reaches. Source: HUB-REFERENCE.md:466
- HUB-REFERENCE.md says re-pinning is the whole remedy and is per repository. Source: HUB-REFERENCE.md:478
- REPOS.md records that the doctrine markers of fauxplane and Intersecting-parallels name hub commits that no longer exist, and that photo-pointer has no .doctrine-sync. Source: REPOS.md:405
- REPOS.md says doctrine-sync is run first in any sibling session and its adopt switch only after the drift is read. Source: REPOS.md:460
- REPOS.md records that Quietkeep's zizmor findings were fixed on 2026-10-31 and that switching the flag on for that repository is the hub's call. Source: REPOS.md:389
- REPOS.md lists what each repository still owes: Jefferson-Photography-Studio owes branch protection on main requiring the Gates check, the local privacy gates and METADATA.md rows. Source: REPOS.md:311
- REPOS.md lists photo-pointer as owing the baseline, the README table and docs-check in CI, and 3d-printing-pal as owing the baseline. Source: REPOS.md:138
- REPOS.md says the branch sweep caller is owed by every repository but the hub and Jefferson-Photography-Studio, and that Jefferson-Line owes it too. Source: REPOS.md:462
- METADATA.md holds a section for Quietkeep, fauxplane, the hub, 3d-printing-pal, solve-ent, MoleBridge, Cv-Thalweg and Jefferson-Photography-Studio, and none for photo-pointer or Intersecting-parallels. Source: METADATA.md:38
- METADATA.md records the Jefferson-Photography-Studio items as live and awaiting confirmation, and every item of the other repositories' sections as set. Source: METADATA.md:463
- HUB-REFERENCE.md says the per-app list of the baseline is kept current, and that every other sibling than those it lists is still owed, to be checked in the repository and not from that line. Source: HUB-REFERENCE.md:182
- The records say nothing, in the places this step was given, of whether any one app has been moved to the new way. The pages that bear on it say what the move is and that each app's own instruction file still describes the old way. Source: plans/native-setup.md:61
- The move is done once for each app, at the app's first session started alone, and the session offers it when the app's instruction file still describes the retired gates. Source: plans/native/running.md:17
- The hub's own instruction file and its reference sections were moved on 12 November 2026, and the old instruction file is in the archive as it was written. Source: HUB-REFERENCE.md:3
- The ranked list names these repositories by lines that open with the word Repository, a colon, a space, the name and a full stop. The count for the hub is 584. Source: Grep count of lines opening Repository: hub. in PROGRAM.md, run in this step
- The count for Jefferson-Photography-Studio is 12. Source: Grep count of lines opening Repository: Jefferson-Photography-Studio. in PROGRAM.md, run in this step
- The count for Quietkeep is 3. Source: Grep count of lines opening Repository: Quietkeep. in PROGRAM.md, run in this step
- The count for each of solve-ent, photo-pointer, fauxplane, MoleBridge, Intersecting-parallels, Cv-Thalweg and 3d-printing-pal is 2, taken one at a time. Source: Grep count of lines opening Repository: with each name and a full stop in PROGRAM.md, run in this step
- The count for Jefferson-Line is 1. Source: Grep count of lines opening Repository: Jefferson-Line. in PROGRAM.md, run in this step
- The eleven counts add to 614, and one Grep over all eleven names together printed 614. Source: Grep count of lines opening Repository: with the eleven names in PROGRAM.md, run in this step
- The move procedure is for a session in one app's repository, started with that app alone, and it is done once for an app. Source: plans/native/skills/app-move/SKILL.md:6
- The move procedure is started by being asked to move the app, and it first reads the short page, cloning the hub to /root/.claude/hub if the page is absent. Source: plans/native/skills/app-move/SKILL.md:6
- The move procedure's result is a CLAUDE.md that holds the app's own facts and one line naming the short page, and no longer describes the gates retired on 12 November 2026. Source: plans/native/skills/app-move/SKILL.md:9
- The move procedure's second result is that the app's environment carries the setup script, so a new container has the hub's hooks before its session starts. Source: plans/native/skills/app-move/SKILL.md:10
- The move procedure's third result is that every one of the app's own hooks and checks runs with the app alone in the container, and one that looks for the hub beside the app looks at /root/.claude/hub. Source: plans/native/skills/app-move/SKILL.md:11
- The move procedure's check is a checker that did none of the work, who opens the exact commit before the push, reads the new CLAUDE.md against the old and runs the app's own pre-commit checks with the app alone. Source: plans/native/skills/app-move/SKILL.md:14
- The move procedure's first step is to check that the launch folder is the app's repository with nothing beside it, and to stop if the hub's repository sits beside it. Source: plans/native/skills/app-move/SKILL.md:18
- The move procedure's second step is to read the session's environment and propose the setup script, which is shown as one approval card. Source: plans/native/skills/app-move/SKILL.md:19
- The move procedure's third and fourth steps are a worker who shortens CLAUDE.md and repoints hooks, and a worker who lands on the work branch by the landing procedure after the checker's pass, with no promotion to the production branch. Source: plans/native/skills/app-move/SKILL.md:20
- The move procedure's setup script is three lines: make the configuration folder, clone the hub into it when the dispatcher is absent, and run the dispatcher's install. Source: plans/native/skills/app-move/SKILL.md:26
- The move procedure costs two agents on the cheapest tier that holds the rules and about twenty minutes, and its way back is a revert of the commit on the work branch and removal of the script by the same card. Source: plans/native/skills/app-move/SKILL.md:32
- If the card does not appear or is declined, the procedure changes nothing in the environment, and the second route is the app's own start hook, which clones the hub when it is absent and runs the install. Source: plans/native/skills/app-move/SKILL.md:38
- The running page says the one approval the move needs is a card that puts the setup script on the app's environment, and an app not opened for a long time needs nothing until it is next opened. Source: plans/native/running.md:19
- The running page gives one line that starts the move where the hub is not in the container yet. Source: plans/native/running.md:22
- The running page says a new app's first session is started with the new repository alone, and section 13 of doctrine/apps.md places the setup script on its environment by one card. Source: plans/native/running.md:30
- The running page says that where a session has two repositories, the dispatcher prints one line naming them, none of them loaded its own roles, settings or instruction file, and the next session for that app is started alone. Source: plans/native/running.md:34
- The running page says the setup script's text is stored on each environment and changes only by a card in a session of that environment, and that an app's CI runs the hub's checks at the hub commit that app pins. Source: plans/native/running.md:81

## What was there before the rebuild

- Before the rebuild REPOS.md is 498 lines and ends with the section The rule this file is under, which says a fact learned about a repository by going to look for it belongs in the file in the same session. Source: 4ea3157:REPOS.md:493
- Before the rebuild REPOS.md opens a section for the same ten repositories as today, from the hub at line 28 to Jefferson-Photography-Studio at line 284. Source: 4ea3157:REPOS.md:28
- Before the rebuild REPOS.md said it is loaded into every session by the SessionStart hook at .claude/hooks/session-start.sh. Source: 4ea3157:REPOS.md:19
- Before the rebuild REPOS.md gave the count of repositories calling the shared workflow as eight as of 4 November 2026, with Quietkeep read on that date. Source: 4ea3157:REPOS.md:328
- Before the rebuild REPOS.md named the dangling doctrine markers of fauxplane and Intersecting-parallels and the missing .doctrine-sync of photo-pointer. Source: 4ea3157:REPOS.md:405
- Before the rebuild REPOS.md said Jefferson-Line owes the branch sweep caller and was not on the list. Source: 4ea3157:REPOS.md:469
- Before the rebuild HANDOFF.md told a new session to make as its first plan a step that clones the hub to /root/.claude/hub and installs the dispatcher from the clone. Source: 4ea3157:HANDOFF.md:17
- Before the rebuild HANDOFF.md said the install was needed because a container is rebuilt every session, and that the environment's setup script that would do it for every session was not reachable from the tablet app. Source: 4ea3157:HANDOFF.md:11
- Before the rebuild HANDOFF.md recorded a session launched in the parent of two repositories, where project hooks load only from the launch directory and none of the hub's hooks ran. Source: 4ea3157:HANDOFF.md:50
- Before the rebuild HANDOFF.md said every repository's working tree must carry a working plan-guard.sh before the install, because the dispatcher runs each repository's own hooks from its working tree on every event. Source: 4ea3157:HANDOFF.md:36
- Before the rebuild HANDOFF.md said Jefferson-Photography-Studio's main still had the old shim until a named branch merged. Source: 4ea3157:HANDOFF.md:40
- Before the rebuild HANDOFF.md kept a three-line setup script in case a session could reach an environment's settings some other way, which clones or pulls the hub and installs the dispatcher. Source: 4ea3157:HANDOFF.md:288
- Before the rebuild HANDOFF.md recorded that the dispatcher runs each touched repository's own hooks with the project directory set to that repository, and skips the repository that is the launch directory. Source: 4ea3157:HANDOFF.md:127
- Before the rebuild HANDOFF.md recorded as found and not fixed that a lesson cites a Jefferson-Photography-Studio file that exists only on an unmerged branch. Source: 4ea3157:HANDOFF.md:282

## What the documentation says

- A cloud environment is the saved configuration that controls network access, environment variables and setup scripts, and every cloud session runs in one. Source: docs:claude-code-on-the-web, Cloud environments
- The same page says environments apply wherever a cloud session is started: the Desktop app, the mobile app, the browser, the terminal with the cloud switch, scheduled tasks and Claude Tag. Source: docs:cloud-environments, Configure cloud environments
- An environment can allow or deny network access, set environment variables, store network secrets and run a setup script before Claude starts. Source: docs:cloud-environments, Configure cloud environments
- Environments a person creates are personal to the account, and shared environments created for the organization appear alongside them. Source: docs:cloud-environments, Configure your environment
- The Default environment defines no variables or setup script and has Limited network access, and with only Default available every session runs in it. Source: docs:cloud-environments, The Default environment
- When more than one environment exists, a session started in the apps or the browser uses the environment shown in the selector, and a thread in a project uses the environment in the project's settings. Source: docs:cloud-environments, The Default environment
- The selector appears only until a new session's first message is sent, and the environment of a running session of one's own can be edited from the caret after its title. Source: docs:cloud-environments, Configure your environment
- Each session in an Anthropic-hosted environment gets a fresh virtual machine running Ubuntu 24.04 with the repository cloned. Source: docs:cloud-environments, What's available in cloud sessions
- A repository's CLAUDE.md, rules, skills, agents and commands are available in a cloud session as part of the clone. Source: docs:cloud-environments, What carries over from your setup
- A repository's own settings hooks and permission rules are available in a session with one repository, and for a session with several repositories the page points to the settings page for which settings it reads. Source: docs:cloud-environments, What carries over from your setup
- A repository's .mcp.json servers load in a session with one repository, found from the session's working directory. Source: docs:cloud-environments, What carries over from your setup
- The user-level CLAUDE.md, skills, agents and commands on a person's own machine are not available in a cloud session, and the page says to commit them to the repository. Source: docs:cloud-environments, What carries over from your setup
- Transport variables in a repository's settings env block, such as the extra CA certificates variable, are ignored in a cloud session. Source: docs:cloud-environments, What carries over from your setup
- The web page says permission rules in the repository's settings are ignored where managed settings set allowManagedPermissionRulesOnly, and for a session with several repositories it points to which settings reach a cloud session. Source: docs:claude-code-on-the-web, Turn off plugin suggestions
- Anyone who uses an environment can read its environment variables and setup script. Source: docs:cloud-environments, What carries over from your setup
- A setup script is a Bash script that runs as root when a new cloud session starts, before Claude Code launches. Source: docs:cloud-environments, Setup scripts
- A setup script must exit zero or the session fails to start or starts without what the script failed to install, and the page says to append a fallback to non-critical commands. Source: docs:cloud-environments, Script requirements
- A setup script should finish within about five minutes so the environment cache can build. Source: docs:cloud-environments, Script requirements
- A setup script runs before the environment's variables are set, so any value it needs is set in the script itself. Source: docs:cloud-environments, Script requirements
- When setup completes in time, the filesystem is snapshotted and later sessions skip the setup script, and the script runs again when the script or allowed hosts change and when the cache expires after about seven days. Source: docs:cloud-environments, Environment caching
- The cache keeps what the script writes to disk and loses anything that was only running. Source: docs:cloud-environments, Environment caching
- A setup script does not run when a session's virtual machine is restored after being idle, so a change to it reaches an existing session only when its machine was reclaimed and rebuilt. Source: docs:cloud-environments, Environment caching
- The page says a setup script provisions the machine itself, and a SessionStart hook is for project setup that should run everywhere, cloud and local. Source: docs:cloud-environments, Setup scripts vs. SessionStart hooks
- The hub's record of what it read on 16 and 17 November says a setup script runs as root before the session starts and is skipped when a cached environment exists. Source: plans/research/00-what-was-read.md:13
- The hub's record of that reading says that in a cloud session with one repository the repository's own settings file is read, and the settings of a person's own machine are not. Source: plans/research/00-what-was-read.md:11
- The hub's record of the harness's documentation read on 12 November 2026 says a session with several repositories starts above the clones and reads no hooks, permissions or roles from a repository's own configuration folder. Source: plans/native-setup.md:49

## What is not known

- Whether any one app has been moved to the new way is not known, because the records this step was given hold no list of moved apps and no app's repository was opened. Looked for in REPOS.md, HUB-REFERENCE.md, plans/native-setup.md, plans/native/running.md and the app-move procedure. Source: this step's reading
- What each app's own CLAUDE.md, hooks and workflows say today is not known, because no app's repository is opened by this step. Source: this step's reading
- The pin each app's workflow carries today is not known. The records give dated pins for some and none for others, and name no pin as current. Looked for in REPOS.md and HUB-REFERENCE.md. Source: REPOS.md:328
- The doctrine marker of each app other than fauxplane, Intersecting-parallels and photo-pointer is not known, because the records name only those three. Looked for in REPOS.md and HUB-REFERENCE.md. Source: REPOS.md:405
- Which hub gates each app runs today is not known beyond what REPOS.md and HUB-REFERENCE.md gave on their dates, since the hub's reusable workflow is read here and the callers are not. Source: .github/workflows/hub-gates.yml:12
- Whether the app environments carry the app-move setup script is not known, because no environment was read by this step. Source: this step's reading
- Whether Jefferson-Line has branches, a deploy address or a moved instruction file is not known, because the hub's list gives it no section. Looked for in REPOS.md and METADATA.md. Source: REPOS.md:469
- Whether today's REPOS.md and the file at 4ea3157 differ line by line is not known, because this step compared only their headings and last lines. Source: 4ea3157:REPOS.md:498
- Whether .claude/hooks/session-start.sh still loads REPOS.md into each session is not known, because that file is not among the places this step may open. Source: REPOS.md:19
- What the harness's settings page says on the settings a cloud session with several repositories reads is not known to this step, because that page is not among the places this step may open. Source: docs:cloud-environments, What carries over from your setup
- The sections of doctrine/apps.md, including section 13 on a new app, were not opened by this step, so what they ask of an app is not known here. Source: plans/native/running.md:30
- Which app sessions are running with two repositories today is not known, because no session is read by this step. Source: plans/native/running.md:11

## Found

- REPOS.md says eight repositories call the shared workflow as of 4 November 2026, including photo-pointer and Intersecting-parallels, and the census in HUB-REFERENCE.md read on 2026-09-04 says four call it and that photo-pointer and Intersecting-parallels reference the hub in no workflow. Source: REPOS.md:328 and HUB-REFERENCE.md:437
- REPOS.md names Jefferson-Photography-Studio as calling the shared workflow in its Gates entry, and the eight it counts on 4 November do not include it. Source: REPOS.md:301 and REPOS.md:328
- The earlier reading of the research page gives 580 lines of the ranked list that name the hub, and Grep's count today is 584. Source: Grep count of lines opening Repository: hub. in PROGRAM.md, run in this step
- The hub's list names ten repositories in sections and a branch sweep line names an eleventh, Jefferson-Line, which has no section, and the ranked list names it in one line. Source: REPOS.md:469
- METADATA.md has no section for photo-pointer or Intersecting-parallels, while it has sections for the other eight repositories the hub's list gives. Source: METADATA.md:38
- hub-gates.yml says zizmor is opt-in while three repositories still carry findings and that REPOS.md names them, and REPOS.md names the findings of one repository, Quietkeep, as fixed on 2026-10-31. Source: .github/workflows/hub-gates.yml:85 and REPOS.md:389
