Q-HUB-477: the limit of twenty seconds on each git call of the startup bring-forward has no case, because a hung remote cannot be planted without a real wait, so the default is read from the source only (met in step 190; filed in step 195).

Fix in: `guard-cases/hook-dispatch.mjs`. The limit is a value the function takes, and a case passes a limit of one second against a planted fetch that sleeps longer and reads the line for a failed fetch.
