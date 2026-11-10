Q-HUB-259: the plan seed's movable read of the working copy counts untracked new files from git status in its changed-lines figure, so a working copy with two new files uncommitted prints 2 changed lines where it holds no edit of a tracked file; harmless and unmarked in the print (found in step 82 of the plan that wrote the seed, filed in step 83).

Fix in: `plan-seed.mjs`. The movable read of the working copy counts every line of git status at line 385, so untracked files are counted and the figure is left unmarked.
