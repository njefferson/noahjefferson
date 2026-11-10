Q-HUB-23: an agent cannot wait on a CI run except by repeated reads, so a land step stops before the run concludes and the main thread reads it (found in steps 41 and 47).

Not the repository's: The harness gives an agent no wait on a CI run, so the run is read by the main thread after the step ends.
