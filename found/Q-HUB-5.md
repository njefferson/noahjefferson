Q-HUB-5: plan-scope-check.mjs hashes the whole plan, so a scope-neutral amendment of Steps or Order made after its verdict is recorded strands the commit until the check runs again (found in step 41).

Fix in: `plan-scope-check.mjs`. The plan hash covers the whole plan text, so it should cover only the sections that set the scope and leave Steps and Order out.
