Q-HUB-26: the stash entry the last plan made stays in the hub repository, because the classifier refused its drop, and a stash pop in the hub checkout would apply that plan's files over its uncommitted work (found in step 49).

Not the repository's: the stash entry and the refusal of its drop belong to the harness's classifier and the checkout, and the hub's checkout holds no stash ref now.
