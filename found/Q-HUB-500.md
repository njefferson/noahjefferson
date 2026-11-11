Q-HUB-500: the main thread on the lower tier settled matters the plan had not: it voided a step's DONE and rewrote step text, wrote the plan file five times while agents ran, and drew an amendment at the price, all on 10 November (found in the plan of 10 November, filed in step 202).

Fix in: `hook-dispatch.mjs`. The manager fence refuses every write of the plan file outside plan mode while a plan is in force, so what is learned on the way goes to the notes and a change of the plan is made in plan mode only.
