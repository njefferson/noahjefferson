Q-HUB-495: the pointer counts a step as done on a hand-back that opens DONE though the agent wrote no report file named for that step and its hand-back speaks of another step's work, as an agent sent as step 199 did at 12:25 California time on 10 November, so a step can read as done with none of its work made (found in the plan of 10 November, filed in step 202).

Fix in: `report.mjs`. A DONE counts only where the step's own report file stands and opens DONE, with a case on a hand-back that opens DONE beside no report file.
