Q-HUB-242: the Doctrine gates run for the commit pushed by step 65 was still in progress when the step ended; its conclusion is read at the next turn that touches the work (found in step 65 of the plan of 3 November).

Not the repository's: the conclusion of the CI run for a pushed commit is an event that must come first, and no step can make it arrive before the step ends.
