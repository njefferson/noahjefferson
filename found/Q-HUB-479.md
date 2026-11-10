Q-HUB-479: the seed's template prints the Sends priced rule with a plain placeholder for the number, and `plan-seed.mjs` does not fill it, so the session writes the number by hand at each plan (met in step 193; filed in step 195).

Fix in: `plan-seed.mjs`. The seed fills the number from the plan's step count and its review, as it fills its other placeholders, with a case that reads the filled line in a print.
