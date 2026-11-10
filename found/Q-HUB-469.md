Q-HUB-469: the plan check judges an amendment of a running plan against the findings filed after the plan's approval, so a finding a step of the plan itself files makes the amendment fail for want of an answer to it (filed in step 195).

Fix in: `plan-guard.mjs`. The amendment is judged against the findings the file held at the approval, with a case on a finding filed after the approval that the amendment does not answer.
