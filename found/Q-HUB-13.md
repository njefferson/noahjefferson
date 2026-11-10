Q-HUB-13: nothing refuses a plan whose Files names a repository and no file of its queue, so the step that copies queued findings into a repository's NOTES.md is not forced to exist; a repository's own parsers of NOTES.md also have to ignore a new `## Found queue` section before any agent writes one there, and the Jefferson-Photography-Studio notes are parsed by tools (found in step 43).

Not placed: searched plan-guard.mjs for a refusal tied to a queue file and found only the answered-line check for queued findings, and the other repository's parser of notes is outside this repository.
