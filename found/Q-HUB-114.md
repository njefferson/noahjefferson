Q-HUB-114: the --out flag of session-guards.test.mjs is ignored and the output goes to the task output file only (found in step 2 of the plan of 31 October).

Fix in: `session-guards.test.mjs`. The suite's header and argument handling name no out switch, so the flag is ignored; it should write the run's output to the named file.
