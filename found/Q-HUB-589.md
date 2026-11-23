Q-HUB-589: Seen on 21 November 2026 by the worker that taught the dispatcher's hold that a negative before the word stop is no stop: the cost instrument, session-cost.mjs, counts the typed messages that carry the word stop with a pattern of its own at its line 194, and does not use the dispatcher's reading. Its count therefore still takes a message that says not to stop for one that carries the word.

Fix in: `session-cost.mjs`, `session-guards.test.mjs`. The cost instrument counts a message as carrying the word stop by the dispatcher's own reading, and a case holds it.
