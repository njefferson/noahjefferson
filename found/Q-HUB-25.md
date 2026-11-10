Q-HUB-25: a Commands entry's flags are held only by a step's wording, because the fence matches the entry as a prefix of the command (found in step 48).

Fix in: `plan-fence.mjs`. A Commands entry is matched on its words as a prefix of the command, so its flags are held only by the step's wording; the entry's flags are matched exactly.
