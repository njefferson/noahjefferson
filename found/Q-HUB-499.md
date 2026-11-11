Q-HUB-499: the landing command's verb prove runs the whole suite and every plant in one call, past the ten minutes a foreground call is given (found in step 198 of the plan of 10 November, filed in step 202).

Fix in: `plan-land.mjs`. A switch names one stage, so each stage is a call of its own inside the limit, with a case on the switch.
