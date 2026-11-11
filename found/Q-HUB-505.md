Q-HUB-505: the suite's list of guard files does not name `plan-land.mjs` or `program.mjs`, so the plants copy only the planted file and a plant of a file outside the list is not copied into the plant folder with the other guards (found in step 198 of the plan of 10 November, filed in step 202).

Fix in: `session-guards.test.mjs`. The two files join the list, with a case that holds every root command file of the hub to it.
