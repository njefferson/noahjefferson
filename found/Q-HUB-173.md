Q-HUB-173: the hub's allow list holds the bare tool name Artifact, which the acceptance of P-13 excludes (never a bare tool); nothing was changed, and the permission classifier refuses a session's edit of the list (lesson 370) (found in step 53 of the redesign plan of 2 November, filed in step 54 of the same plan).

Not the repository's: the bare Artifact entry still stands at the top of the allow list in `.claude/settings.json`, and the harness's classifier refuses a session's edit of that list, so only the owner can remove it.
