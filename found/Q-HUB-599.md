Q-HUB-599: Seen on 22 and 23 November 2026: a page that is changed after the go-word that followed its brief is walked and briefed again, and the button waits for a new go-word, whatever the size of the change. A corrected count cost two round trips on 22 November.

Fix in: `hook-dispatch.mjs`, `guard-cases/dispatch.mjs`. It is drawn with the part that puts a step right without a new signature, so that one rule says which changes of a page go back for a decision.
