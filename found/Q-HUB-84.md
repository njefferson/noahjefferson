Q-HUB-84: the Doctrine gates' plants runner grows in memory with each plant and ran out of heap once in this container, so a run of the gates can end without a verdict; the next hub plan should bound it (found in step 209 of the last plan, recorded by step 213).

Put right already: "runs its plants in chunks of PLANT_CHUNK each in a new process" in `session-guards.test.mjs`. A plants run now starts a new process for each chunk, so the heap is bounded.
