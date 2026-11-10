Q-HUB-203: the review gate and the rules gate still judge a send in conversation, where every send is refused with no plan anyway; step 58 narrowed the review gate and left the rules gate as it was (found in step 56 of the redesign plan of 2 November, filed in step 60 of the same plan).

Fix in: `hook-dispatch.mjs`. The rules gate is narrowed as the review gate was narrowed, so a send made in conversation is judged by the no-plan refusal alone.
