Q-HUB-501: a plan file last written below the top tier passes the plan check when the plan is running, so an amendment of a running plan's rules and price was first drawn on the lower tier at 13:00 California time on 10 November (found in the plan of 10 November, filed in step 202).

Fix in: `plan-guard.mjs`. A plan file last written below the top tier is faulted whether the plan is new or running, and the entry to plan mode below the top tier is answered by a first line naming the tier wanted and a declared stop.
