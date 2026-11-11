Q-HUB-521: A switch of model while the approval button is up restarts the worker and closes the button before it can be pressed, met at 10:45 California on 11 November.

Fix in: `plan-guard.mjs`. The approval call is put up again at the next prompt after a resume when the plan file is unchanged since the call that was closed.
