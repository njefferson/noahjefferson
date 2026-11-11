Q-HUB-518: The dispatcher counts a plan's sends across the approvals of its amendments, while the amendment approved at 15:47 California on 10 November priced its sends from its own approval, so at the first send under it the count read nine of eight priced.

Fix in: `hook-dispatch.mjs`, `doctrine/plans.md`. The count and the page say the same thing, either the count from the newest approval or the price as the plan's total.
