Q-HUB-503: the dispatcher counts a plan's sends across the approvals of its amendments, while the amendment approved at 15:47 California time on 10 November priced its sends from its own approval, so at the first send under it the count read nine of eight priced (found in the plan of 10 November, filed in step 202).

Fix in: `hook-dispatch.mjs`, `doctrine/plans.md`. The count and the page say the same thing, either the count from the newest approval or the price as the plan's total.
