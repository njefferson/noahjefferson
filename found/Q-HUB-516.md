Q-HUB-516: A plan file last written below the top tier passes the plan check when the plan is running, so an amendment of a running plan's rules and price was first drawn on the lower tier at 13:00 California on 10 November.

Fix in: `plan-guard.mjs`. A plan file last written below the top tier is faulted whether the plan is new or running, and the entry to plan mode below the top tier is answered by a first line naming the tier wanted and a declared stop.
