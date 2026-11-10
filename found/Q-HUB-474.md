Q-HUB-474: the talk before a plan, and each reply while a checked plan waits for its button, does not say in its first line that a message ending with a go-word brings the button in the next turn and that the switch to a lower tier is what lets the sends go, before the button or after it (filed in step 195).

Fix in: `stop-guard.mjs`, `doctrine/plans.md`. The stop guard refuses such a reply whose first line lacks the two statements, and the page states the rule, with a case on a reply with them and one without.
