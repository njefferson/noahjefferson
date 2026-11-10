Q-HUB-468: the suite's case filter refuses a case name that holds a space and is not written in double quotes, and the seed's template does not spell the switch with the quotes, so a step that follows the template meets the refusal (filed in step 195).

Fix in: `plans/seed-template.md`. The template spells the case switch whole inside double quotes wherever it names a case, with a case that reads the quotes in a print of the template.
