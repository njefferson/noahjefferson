Q-HUB-96: an agent's first message held the steps file read alone and the rules file was read in its second message; the fence did not refuse it, though the rule asks for both reads in the first message; for the hub plan, the fence's count of the rules read in the head of the transcript (found in step 213, recorded by step 219).

Fix in: `plan-fence.mjs`. Count the steps file and the rules file read in the first message of an agent's transcript, as the finding asks.
