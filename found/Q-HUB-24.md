Q-HUB-24: lesson 394 owes plan-guard a refusal of a first plan that does not install the gates first, and the fence passes a leading variable assignment as a read (found in step 48).

Fix in: `plan-guard.mjs`, `hook-dispatch.mjs`. The plan check refuses a first plan whose steps do not install the gates first, and the fence stops passing a line that opens with a variable assignment as a read.
