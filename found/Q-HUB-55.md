Q-HUB-55: the header comment of session-guards.test.mjs, which lists what the suite covers, does not mention the four cases step 138 added (found in step 138).

Fix in: `session-guards.test.mjs`. Add the step 138 cases (a main-thread miss stops nothing, the check of a call, the reply guard keying a publish by the page's content) to the Covered list in the header comment.
