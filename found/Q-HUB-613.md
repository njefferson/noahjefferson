Q-HUB-613: Seen on 23 November 2026 by the worker that built the piece: where the file has no state, a prompt whose words equal the last message that the record shows as filed is filed again, which cannot be told from the same words typed twice, and a typed message that holds a line shaped like the next heading of the file is read wrongly. The path with a state is touched by neither.

Fix in: `hook-dispatch.mjs`, `guard-cases/dispatch.mjs`. The path with no state tells a message by the time it was typed as well, and reads a heading only where the file wrote one.
