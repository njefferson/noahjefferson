Q-HUB-59: the reply guard's owner route is recorded for a fetch that failed with a 404 on a wrong path, which is a fault of the path and not a host the container cannot reach (found in the session of 23 October, recorded by step 149).

Fix in: `reply-guard.mjs`. A 404 on a wrong path is read as a fault of the path and sets no owner route, where today every status at 400 and above is recorded.
