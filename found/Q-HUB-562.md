Q-HUB-562: The hold refuses any name that carries neither sonnet nor haiku, and an empty string is such a name.

Fix in: `hook-dispatch.mjs`, `guard-cases/dispatch.mjs`. An empty name is read as no name.
