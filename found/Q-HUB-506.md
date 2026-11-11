Q-HUB-506: the third-person, privacy and quote checks read tracked files, so a file a step writes and leaves untracked is not scanned until its commit, and the checks of a landing run before it (found in steps 198 and 199 of the plan of 10 November, filed in step 202).

Fix in: `plans/seed-template.md`, `plan-land.mjs`. The landing stages each new file before the first run of the checks, or the verb prove stages them by intent, with a case on an untracked file that holds a find.
