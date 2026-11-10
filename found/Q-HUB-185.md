Q-HUB-185: step 33's report of the research plan carries a Found line that names a commit by a run of seven hex-set characters, so an agent filing the research plan's Found lines must restate it in words, because no guard holds the hex rule (found in the second review of step 54 of the redesign plan of 2 November, filed in step 54 of the same plan).

Fix in: `plan-fence.mjs`, `guard-cases/plan-fence.mjs`. An agent's write holding a run of seven or more hex-set characters that no command of its run printed is refused, as the agent rules already say.
