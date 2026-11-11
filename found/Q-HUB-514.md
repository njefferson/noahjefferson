Q-HUB-514: the scope check counted 850 lines for a staged diff whose file held 935 lines, because `diffLineCount` in `plan-scope-check.mjs` adds the lines added and the lines removed per file, while a diff file also holds its headers and context lines, so a judge told to read every counted line meets a longer file than the count (found in the plan of 10 November, filed in step 421).

Fix in: `plan-scope-check.mjs`. The line that prints the count says it is lines added plus lines removed and not the length of a diff file, with a case on a diff that holds context lines.
