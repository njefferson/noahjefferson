Q-HUB-115: the plan of 31 October quotes a line of report.mjs in its What is section that step 2 removed when it changed agentStep, so plan-guard --check prints one evidence fault on the plan that is approved and running; a plan's quoted evidence goes stale when the plan's own steps change that file (found in step 3 of the plan of 31 October).

Not placed: searched `plan-guard.mjs` for a re-read of a plan's quoted evidence after the plan's own steps change the quoted file and found only the check made at the approval.
