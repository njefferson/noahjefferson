Q-HUB-482: the comment at line 9 of `session-brief.mjs` says the lessons number 81, and the folder holds 490, so a reader of the brief's source is told a count that is out by a factor of six (item P2.3 of the review file; filed in step 195).

Fix in: `session-brief.mjs`. The comment states no count, or reads it from the folder, with a check that the file carries no spelled count of the lessons.
