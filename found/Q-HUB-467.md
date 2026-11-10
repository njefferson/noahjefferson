Q-HUB-467: an unnumbered `Next:` line written above an older one in the manager notes is not the one the review reads, which takes the last by its place, so the move the notes name first and the move the review judges can differ (filed in step 195).

Fix in: `report.mjs`, `aim-review.md`. The status and the review file both take the same line of the notes as the move, by one rule written once, with a case on notes that hold two unnumbered `Next:` lines.
