Q-HUB-39: doctrine-read-guard.mjs counts lines and not text, so an edit that keeps the doctrine's length between a read and a resume is not seen and the resume is held on the old text; comparing the file's change time with the times of the results would see it (found in step 69).

Fix in: `doctrine-read-guard.mjs`. Compare the doctrine file's change time with the times of the read results, as the finding says, so an edit that keeps the line count is seen.
