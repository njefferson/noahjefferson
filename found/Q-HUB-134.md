Q-HUB-134: reviews are not told apart from step agents and agents refused at least once are not counted by the cost instrument; both need the agents' first prompt, which the plan's rules forbid copying and which the instrument does not read (found in step 30 of the research plan of 2 November, filed in step 54 of the redesign plan).

Fix in: `session-cost.mjs`. The instrument reads the first prompt of each agent's transcript to tell reviews from step agents and counts agents refused at least once.
