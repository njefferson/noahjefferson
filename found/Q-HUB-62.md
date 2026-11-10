Q-HUB-62: a lookup that failed is not flagged by the reply guard as a failed call (found in the session of 23 October, recorded by step 149).

Fix in: `reply-guard.mjs`. The failed-call ledger records only calls the harness marks as errors, and a lookup that returns nothing or an error text is made to be recorded as failed.
