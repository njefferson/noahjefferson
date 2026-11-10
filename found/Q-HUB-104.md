Q-HUB-104: the Drive guard counts a listed folder from the main thread's transcript only, so a folder an agent lists never passes for a later agent, and a compaction empties the main thread's listings; the hub plan's Drive guard item takes both, with the link in the person's message (found in step 218, recorded by step 219).

Fix in: `drive-guard.mjs`. The guard reads the listed folders from the calling transcript only, and it is made to count a folder listed by an agent or before a compaction, with the link in a message the session was given.
