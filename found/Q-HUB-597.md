Q-HUB-597: Seen on 23 November 2026 by the worker that built the piece: a session whose file of typed messages was written before the change has no state file beside it, so nothing is added until the next start writes the state. Where no count was recorded at a compaction the file is due whole, and a resume leaves an earlier count as it is.

Fix in: `hook-dispatch.mjs`, `guard-cases/dispatch.mjs`. A session with no state file beside its file of typed messages has the state written at the next typed message.
