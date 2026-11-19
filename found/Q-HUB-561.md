Q-HUB-561: The reply hold refuses a final reply past 150 words, and the refused reply has already been shown. Each rewrite is added beneath it, so a refusal adds to what is read. Seen on 16 November in an app's session, where three versions of one reply were shown, and on 17 and 18 November in the hub's.

Fix in: `stop-guard.mjs`. The hold is rebuilt so that a reply over the limit does not put a second copy on the screen, from what a hook at a stop can do.
