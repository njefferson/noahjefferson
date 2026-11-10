Q-HUB-470: a message that arrives while the plan file is being written holds every call until the turn ends, though it ends with a go-word and carries no stop (filed in step 195).

Fix in: `pending-guard.mjs`. A message that ends with a go-word and carries no stop releases the hold once it has arrived as a prompt, with a case on a message that arrives between two writes of the plan file.
