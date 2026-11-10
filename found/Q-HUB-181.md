Q-HUB-181: the redesign plan's verbatim rule and its no-hex rule conflict at digit runs in page text, and no guard holds either against an agent's file write (found in the review of step 51 of the redesign plan of 2 November, filed in step 54 of the same plan).

Fix in: `plan-fence.mjs`. The agent's file-write check holds the no-hex rule and sets digit runs in page text apart, so the verbatim rule and the no-hex rule no longer conflict.
