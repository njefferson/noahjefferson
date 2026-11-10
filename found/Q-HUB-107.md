Q-HUB-107: the text of steps 219, 220 and 221 told an agent to write scratch scripts under the temp folder that holds the scratchpad, and the plan fence refuses a write there outside the scratchpad, so the step text led an agent into a latching refusal; for the plan after this one, a plan gate that refuses a step naming a scratch folder the fence does not pass (Found 219.1, recorded by step 232).

Fix in: `plan-guard.mjs`. A plan whose step text names a scratch folder outside the session scratchpad is refused, because the plan fence refuses to let an agent write there.
