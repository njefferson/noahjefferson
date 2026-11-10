Q-HUB-208: the sibling drift tool doctrine-sync.mjs lists only DOCTRINE.md and reads changed sections from its headings, so after the move a change under doctrine/ reaches no sibling session until the tool is pointed at the folder; the tool is on no Files line of the redesign plan, and the item is ranked high (found in step 57 of the redesign plan of 2 November, filed in step 60 of the same plan).

Fix in: `doctrine-sync.mjs`. The tool's list of watched paths gains the `doctrine/` folder and reads changed sections from the files under it.
