Q-HUB-487: the identifier gate reads an English word of seven or more letters drawn only from the first six letters of the alphabet as a hash, in a search pattern and in a written report alike, and it latched the first send of step 400 on 10 November on its own search pattern (found in step 400, filed in step 407).

Fix in: `plan-fence.mjs`. The run of hex-set characters the gate refuses is judged as a hash only when it holds a digit, or the gate says in its refusal that a word of letters alone is what it met and how to spell the search without it.
