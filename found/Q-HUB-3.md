Q-HUB-3: pending-guard.mjs reads a queued message's stop word by its first word only and is not in the plan's Files, so a queued halt message that puts the word second holds agents only once it has been delivered, while the hold in hook-dispatch.mjs reads the word anywhere (found in step 42).

Fix in: `pending-guard.mjs`. The queued-message stop test at line 242 matches the word only as the first word, and it is made to match the word anywhere in the message as the hold in hook-dispatch.mjs does.
