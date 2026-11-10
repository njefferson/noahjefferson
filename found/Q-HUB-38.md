Q-HUB-38: plan-scope-check.mjs passes a folder that has no plan pointer with an ok line, so a worktree whose pointer was never written looks as if it had been checked (found in step 63).

Fix in: `plan-scope-check.mjs`. A folder with no plan pointer prints a line that says nothing was checked, not an ok line that reads as a pass.
