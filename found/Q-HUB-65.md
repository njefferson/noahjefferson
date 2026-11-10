Q-HUB-65: the reply guard's reading of a failed call quotes only the kept part of the error, where the rule asks for the notice to be copied character for character from the captured output (found in the session of 23 October, recorded by step 149).

Fix in: `reply-guard.mjs`. The reading of a failed call keeps the whole captured error, so the notice can be copied character for character.
