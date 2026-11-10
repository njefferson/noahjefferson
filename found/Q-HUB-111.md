Q-HUB-111: the plants harness in session-guards.test.mjs throws out of a plant that deletes an export another guard file imports, instead of printing CAUGHT or MISSED, because no plant run is wrapped in a try/catch (found in step 2 of the plan of 31 October).

Fix in: `session-guards.test.mjs`. Wrap the imports and the case run inside runAll, or the call of it in runPlant, in a try and catch so a plant that deletes an export another guard imports prints CAUGHT instead of throwing.
