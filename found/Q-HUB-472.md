Q-HUB-472: the plan check does not fault a plan that has steps and holds no line of priced sends, so the dispatcher's refusal past the price never applies to a plan written without the line (filed in step 195).

Fix in: `hook-dispatch.mjs`. The plan check faults a plan with steps whose own rules hold no line opening with the words Sends priced, a colon and a whole number, with a case on a plan with the line and one without.
