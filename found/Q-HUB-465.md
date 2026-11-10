Q-HUB-465: the suite's dry listing reads a plant as current when its find matches some other line of its file than the one it was written for, so a plant whose target moved can read as in order while it guards nothing (met after the fourth wave, on a plant on the check of a call; filed in step 195).

Fix in: `session-guards.test.mjs`. The dry listing compares a plant's find with the line it was written for, or counts the matches of the find in the file and names a plant whose find matches more than one place, with a case on a plant whose find also stands in another line.
