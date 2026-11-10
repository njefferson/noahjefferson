Q-HUB-18: pin-check.mjs is described as refusing a script that runs on undeclared dependencies, and it refuses only a repository with root scripts and no package.json (found in step 45).

Fix in: `pin-check.mjs`. The header and the pass line say no script runs on undeclared dependencies while the check refuses only root scripts with no package.json, so the words are narrowed to what the check does.
