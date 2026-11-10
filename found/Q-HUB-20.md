Q-HUB-20: nothing reads the remote's head immediately before a push, a merge or a pull, so a commit another session pushes in between is found by the refusal and not before (found in steps 30 and 48).

Not placed: push-guard.mjs, the dispatcher and the seed template were searched for a read of the remote's head before a push and none was found as a gate.
