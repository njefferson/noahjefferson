Q-HUB-219: a step that writes new cases meets its own new case failing on its first run, and the rule that a red check ends the step leaves no room for the one fix that work needs, so the first send of step 58 looped on its own case until the reply guard stopped it (found in step 58 of the redesign plan of 2 November, filed in step 60 of the same plan).

Fix in: `plans/seed-template.md`. The template's rule on a red check leaves room for a step's own new case failing on its first run, so the send reports it and goes on instead of looping.
