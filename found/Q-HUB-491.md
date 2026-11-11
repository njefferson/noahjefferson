Q-HUB-491: the line the dispatcher prints at each prompt read an agent's hand-back, which named the stop guard's file, as a message carrying the word stop and printed that everything was held, while the holds themselves read the message rightly (found in the plan of 10 November, filed in step 202).

Fix in: `hook-dispatch.mjs`. The printed line reads the word stop only in a message the session was typed, as the holds do, with a case on a hand-back that names the stop guard's file.
