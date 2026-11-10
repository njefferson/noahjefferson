Q-HUB-475: the bringing forward of the copies at a session's start reads an approved plan left by an earlier session as in force, so the copies stay as they stand, where the step asked for a plan of the session itself (filed in step 195).

Fix in: `hook-dispatch.mjs`. The bringing forward counts a plan as in force only when the approval marker names the session that is starting, with a case on a marker of another session that leaves the copies to be brought forward.
