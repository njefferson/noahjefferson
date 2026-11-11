Q-HUB-524: The privacy, third-person and quote checks read tracked files only, so the checks-only proof made before a commit does not read a file that is new, and the first run of them over the stand-down module and its case file is the proof made after the commit.

Fix in: `plan-land.mjs`. The proof for the checks alone also reads the files its manifest lists as added, or a plan orders a second proof after the commits.
