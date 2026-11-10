Q-HUB-430: a review for a second send was made stale by the end of a sibling step before the send went, which cost a further review (met by the main thread on 9 November; filed in step 382); the fix is for the review gate to judge staleness against the ends of steps that share a file or a dependency with the step it clears, and not against every step's end, with a case on two steps that share nothing.

Put right already: "stays current while a step that N does not follow ends" in `hook-dispatch.mjs`. The review gate's After line narrows what stales a review to steps the cleared step follows.
