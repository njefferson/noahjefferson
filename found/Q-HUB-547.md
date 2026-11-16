Q-HUB-547: The read hold can be switched off by the variable HOOK_DISPATCH_READ_HOLD in a hook process's own environment. The variable exists for the suite's cases and is a way round the hold if a session's settings could set it.

Fix in: `hook-dispatch.mjs`. The test seam is read in every run of the dispatcher, not only in the suite's.
