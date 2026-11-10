Q-HUB-76: the Sequence rule of aim-review.md is a reviewer's reading and no code reads it, so an Order that puts two independent steps in sequence goes if the reviewer misses it; the scratch reading of step 186 fired on the first Order of its plan and passed the current one, and is not kept in the hub (found in the session of 24 October, recorded by step 186).

Fix in: `plan-guard.mjs`. The Sequence rule exists only as a line of the review file, so the plan check should read an Order for two independent steps put in sequence.
