Q-HUB-526: A step that asks what a hook refuses has only the dispatcher's can-check to ask it by command, and the plan's Commands did not list it, so the cases of step 205 were written from the push guard's file read with Read.

Fix in: `plans/seed-template.md`. The template lists the dispatcher's can-check line among the Commands of a step that needs a guard's refusal read.
