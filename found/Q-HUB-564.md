Q-HUB-564: A case whose name holds a comma can be picked only by a shorter part of its name, because the switch splits its value at commas.

Fix in: `session-guards.test.mjs`. A name is taken whole, or the switch says how a name with a comma is given.
