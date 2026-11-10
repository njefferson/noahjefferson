Q-HUB-77: the Doctrine gates run for the commit that landed step 186's work was still in progress when step 187 read it, so the gates' result for that commit was not known at that report, and the Deploy, Accessibility gate and code scan runs for it were not read in that step, because the listing it read covered doctrine.yml only (found in step 187, recorded by step 199).

Not the repository's: the conclusion of a CI run for a pushed commit is an event that must come first, and no step can make it arrive before the step ends.
