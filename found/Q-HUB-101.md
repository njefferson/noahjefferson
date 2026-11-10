Q-HUB-101: the Drive guard passes a folder listed this session only while its listing sits in the transcript's last eight megabytes, so the pass decays as the transcript grows; for the hub plan with the Drive guard's link item (found in step 218, recorded by step 219).

Fix in: `drive-guard.mjs`, `transcript-tail.mjs`. The Drive guard reads a listing from the default eight megabyte tail, so it reads from the widening tail that the owner-message reader uses.
