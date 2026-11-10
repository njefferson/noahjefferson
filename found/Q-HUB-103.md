Q-HUB-103: the page's chips mark steps held after the nearest earlier step in Order even where the After line ties them to nothing; display only; for the hub plan (found in step 218, recorded by step 219).

Fix in: `report.mjs`, `guard-cases/report.mjs`. The held chip names the nearest earlier step in Order and ignores the After line, so it is drawn from the After line where the plan has one.
