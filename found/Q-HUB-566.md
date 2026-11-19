Q-HUB-566: During a run of every planted failure one part printed an error from the removal of a temporary folder that was not empty, at line 1331 of the suite. Every planted failure still read as caught.

Fix in: `session-guards.test.mjs`. The removal is made safe against a folder that is still being written.
