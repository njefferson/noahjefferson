Q-HUB-545: A waiting message that carries the word stop and is overtaken by a later typed message is let go by the hold on a waiting message without its words being printed, so the message is not shown to be answered.

Fix in: `hook-dispatch.mjs`, `guard-cases/dispatch.mjs`. The case that holds the overtaken message asserts only that nothing is refused.
