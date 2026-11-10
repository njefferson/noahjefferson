Q-HUB-12: the state page gate holds nothing while the page does not exist, so a session that never gives a status after a compaction is never held to read it; the status command is what writes the page (found in step 43).

Fix in: `hook-dispatch.mjs`. The state page gate holds the main thread after a compaction even while the page does not yet exist, instead of returning nothing at that point.
