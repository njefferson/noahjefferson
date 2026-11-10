Q-HUB-21: the status page's published link stays behind its source: the reply guard refuses the identical publish after one failed, and its read command cannot pass the main thread's latch or fence (found in step 30).

Put right already: "THE REPLY GUARD'S RELEASE COMMAND PASSES THE FENCE AND THE LATCH" in `CLAUDE.md`. The release command now passes the fence and the latch, and the status page publish is keyed by its content so an edited page is no repeat.
