Q-HUB-11: a Found line is keyed by its step and its place among that step's Found lines, so a report file rewritten with its Found lines in another order renames them under notes already written in status/manager.txt (found in step 43).

Fix in: `report.mjs`. A Found line is keyed by its content as well as its place, so a report rewritten with its Found lines in another order keeps the sorting already written in the manager notes.
