Q-HUB-216: report.mjs still carries the status gate's function, reached by its --gate flag, and the case for it, with nothing calling them since the status refusal was removed; a later plan removes both (found in step 58 of the redesign plan of 2 November, filed in step 60 of the same plan).

Fix in: `report.mjs`, `session-guards.test.mjs`. The status gate's function behind the gate flag and its case stay with no caller and should be removed.
