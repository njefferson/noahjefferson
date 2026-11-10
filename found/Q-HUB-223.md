Q-HUB-223: the plan's Commands listed the commit amend and the review cleared it, but neither read the harness's classifier, which refuses an amend in auto mode whatever the plan lists; a plan that rewrites a commit names the mode it needs (found in step 58 of the redesign plan of 2 November, filed in step 60 of the same plan).

Fix in: `doctrine/plans.md`. The plan rules state that a plan which rewrites a commit names the permission mode it needs, since the classifier refuses an amend in auto mode whatever the Commands list.
