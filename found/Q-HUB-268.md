Q-HUB-268: a read of the ConfigChange record made right after the planted skill file was written returned that the file did not exist, and the hook's line for it was written within the same minute, so the record is not visible to a read taken at once after the change (found in step 86 of the plan that closes P-21, filed in step 87).

Not the repository's: the harness writes its configuration-change record some seconds after the change, so a read taken at once cannot see it.
