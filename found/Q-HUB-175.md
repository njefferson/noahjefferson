Q-HUB-175: REPOS.md states no pin value for any sibling and no sibling workflow was read, so the baseline's section 8 records wiring and dates and not pins; P-35 to P-43 carry the reads (found in step 53 of the redesign plan of 2 November, filed in step 54 of the same plan).

Fix in: `CONFIG.md`, `REPOS.md`. The pin of each sibling is read from its workflows and recorded once the reads of P-35 to P-43 are made, as REPOS.md holds no pin value now.
