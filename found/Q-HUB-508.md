Q-HUB-508: a session whose plan file is edited after the newest message it was given stops for the talk turn and a message, and nothing printed says that nothing is running, so on 10 November it sat stopped from 12:41 to 15:36 California time with no sign to the reader of what it waited on (met by the main thread in the plan of 10 November, filed in step 421).

Fix in: `plan-guard.mjs`, `stop-guard.mjs`. The refusal that ends such a stop says in its first line that nothing is running and that a message is awaited, with a case that reads the line.
