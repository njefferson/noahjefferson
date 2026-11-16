Q-HUB-544: A typed message still waiting in the queue when a session ends stays counted as waiting after a resume, until a later message arrives, so the hold on a waiting message refuses calls over a message that the resumed session may never be given.

Fix in: `hook-dispatch.mjs`. The count of waiting messages reads the queue entries of the transcript and has no end for a message left at the close of a session.
