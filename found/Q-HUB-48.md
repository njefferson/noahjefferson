Q-HUB-48: a plan with no Order line still has no Found lines on its status page and no next-step pointer in the print, because that step drew only the sections and the chips, so the page's Found section is empty for such a plan (found in step 133).

Fix in: `report.mjs`. The no-Order branch of the plan reader returns no found list, and it is made to return the Found lines of the plan's steps as the branch with an Order does.
