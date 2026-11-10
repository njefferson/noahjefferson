Q-HUB-207: skipping the whole manager fence under a finished plan's marker would pass a free-text agent send that the plan fence then lets write the finished plan's Files and run its Commands; step 56 keeps the send branch in every state (found in the reviews of step 56 of the redesign plan of 2 November, filed in step 60 of the same plan).

Put right already: "(!skipped || send) ? managerFence(p, opts)" in `hook-dispatch.mjs`. The manager fence is run for a send in every state, a finished plan included.
