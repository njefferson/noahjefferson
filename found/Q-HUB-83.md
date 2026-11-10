Q-HUB-83: the Doctrine gates run and the code scan for the hub commit were still in progress at the agent's read and at the main thread's read after a status, while the Deploy run and the Accessibility gate for that commit had concluded with success, so the two open runs were read again at the next status and not in the step that needed them (found in step 209 of the last plan, recorded by step 213).

Not the repository's: a run still in progress at a read is the CI service's timing, and only a later read of the run can show its conclusion.
