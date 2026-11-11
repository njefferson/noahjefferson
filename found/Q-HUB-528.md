Q-HUB-528: The manager fence refused the planner every read of the hub's own configuration, code and cost record on 11 November, so a plan for the hub could be drawn only from its pages.

Fix in: `hook-dispatch.mjs`. The main thread can read any file, so a plan for the hub is drawn from the hub's own record.
