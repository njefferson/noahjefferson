Q-HUB-507: in a session started in the folder above the repositories, the plan check found a real code name only in the tool results within the transcript's last 64 megabytes or on disk, so a name that passed one run of the check was refused at the approval call minutes later, at 12:40 California time on 10 November (met by the main thread in the plan of 10 November, filed in step 421).

Fix in: `plan-guard.mjs`. The check mode and the approval call find a code name in the same places, with a case on a name that one of them finds and the other does not.
