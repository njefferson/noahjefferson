Q-HUB-478: the stop guard calls the pointer with no set of running steps, so a Done line in the manager notes counts a step that still has a running agent; step 191 gave the pointer that fifth argument and `stop-guard.mjs` was outside its files (met in step 191; filed in step 195).

Fix in: `stop-guard.mjs`. The call passes the running steps of the state where it holds them, the plant `eject_pointer_notes` in `session-guards.test.mjs` takes the same new text, and a case holds a Done line beside a running agent.
