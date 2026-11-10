Q-HUB-476: the suite loads every case file before it runs any case, so a case file that does not parse at that moment, as one did while six steps wrote at once, fails the whole run with a load error for every other step's cases (met in the second send of step 189; filed in step 195).

Fix in: `session-guards.test.mjs`. A case file that cannot be loaded is reported by name and its cases are counted as not run while the others run, and the run exits non-zero, with a case on a planted case file that does not parse.
