Q-HUB-130: the gate that reads a plan's Cost (lesson 458) checks that a number sits beside the word push, that an agent, send or review is named and that a tier is named; it cannot tell that the figures are the plan's real ones, and a plan can pass it with a sentence that names all three (found in step 21).

Fix in: `plan-guard.mjs`. The Cost check near line 1139 reads only that a number, a unit and a tier are named; a check of the figures against the plan's real sends is the change.
