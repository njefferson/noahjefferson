Q-HUB-546: Nothing printed at a start, a clear or a compaction says that the standing pages are due, so the first call that is not a read is refused with the read hold's text instead of the session being told beforehand.

Fix in: `hook-dispatch.mjs`. The start print names the short page and the repositories and does not name the three pages the read hold waits for.
