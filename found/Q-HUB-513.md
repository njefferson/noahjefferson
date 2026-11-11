Q-HUB-513: the first run of the scope check in the release of 2.79 ended with the line that opens the printed messages and no line that closes them, so a runner that drops the lines between the two dropped the rest of the output, the diff's line count among it, and a second run counted 850 (found in the plan of 10 November, filed in step 421).

Not placed: the cause of the missing closing line was not traced in `plan-scope-check.mjs`; the step that met it changed its runner to filter stdout and stderr apart, which does not explain the first run.
