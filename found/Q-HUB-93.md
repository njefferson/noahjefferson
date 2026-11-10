Q-HUB-93: the reply guard keys a repeat on the tool, the file and the link, not on the description, so a publish with a changed description is refused as the same call; for the hub plan (found in step 0, recorded by step 219).

Fix in: `reply-guard.mjs`. The identity of a call blanks the description for every tool, so a publish with a changed description is refused as the same call, and the identity should include it for an artifact publish.
