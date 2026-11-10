Q-HUB-32: the main thread's latch refuses a held agent's report write, so an agent it stops can record its state only in its hand-back, though the refusal's text says the agent returns what it has (found in steps 57 and 59).

Put right already: "latched agent's own progress note and report" in `hook-dispatch.mjs`. The refusal latch lets an agent write its own report and progress note for the step its prompt names.
