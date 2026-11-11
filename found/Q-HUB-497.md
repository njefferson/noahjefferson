Q-HUB-497: the print the dispatcher adds at each prompt does not carry the plan-mode line the status prints, so a session in a plan mode that a resume brought back after an approval edits an approved section of the plan and is refused and latched, as at 19:56 California time on 10 November (found in the plan of 10 November, filed in step 202).

Fix in: `hook-dispatch.mjs`. The print carries that line, the kind of plan mode and the way forward, whenever plan mode is on.
