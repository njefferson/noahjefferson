Q-HUB-174: the installed hook .git/hooks/pre-commit was found to exist but its content was not compared with the tracked .githooks/pre-commit; the baseline says so (found in step 53 of the redesign plan of 2 November, filed in step 54 of the same plan).

Fix in: `CONFIG.md`. Its entry for the installed pre-commit hook still says the content was not compared with the tracked one; the comparison is made and recorded there.
