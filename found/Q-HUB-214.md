Q-HUB-214: the test file's four copy loops and its plant runner copied guard files flat, so a nested guard-copy path failed until its folder was made; step 57 made the folder before each copy (found in the reviews of step 57 of the redesign plan of 2 November, filed in step 60 of the same plan).

Put right already: "mkdirSync(dirname(to), { recursive: true })" in `session-guards.test.mjs`. The copy helper makes the destination's folder before each copy.
