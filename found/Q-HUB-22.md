Q-HUB-22: a plan with no Order escapes the review and pointer checks, because both read the Order section (found in step 31).

Fix in: `plan-guard.mjs`. A plan that has Steps and no Order section with an Order line is refused, so the review and pointer checks no longer skip it.
