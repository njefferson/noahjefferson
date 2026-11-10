Q-HUB-78: hook-dispatch.mjs carries a whitespace-only edit that landed with step 186's commit: the declaration of pageDueFile has lost the space before its parenthesis; it changes no behaviour, the verdict of that landing recorded it as outside the step's scope, and a later hub plan takes it back out (found in step 187, recorded by step 199).

Fix in: `hook-dispatch.mjs`. Restore the space before the parenthesis in the declaration of pageDueFile, which still reads without it at line 2738.
