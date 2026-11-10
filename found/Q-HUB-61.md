Q-HUB-61: the shared reply ledger outlives the agent that met a decline, so the decline stays in force after that agent has ended (found in the session of 23 October, recorded by step 149).

Fix in: `reply-guard.mjs`. The reading of a decline looks the host up across the whole ledger whatever agent met it, so a decline an ended agent met is scoped to that agent's own run.
