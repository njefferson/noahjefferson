Q-HUB-98: the Drive guard refused the lane's folder search, the folder being outside the index and its listing outside the transcript's recent window, so the app lane stopped until the folder's exact title was named; for the hub plan, the guard passes a folder listed anywhere in the session or named by a link (found in step 215, recorded by step 219).

Fix in: `drive-guard.mjs`. A folder listed anywhere in the session or named by a link in a message the session was given is known to the guard, not only one returned inside the transcript's recent window.
