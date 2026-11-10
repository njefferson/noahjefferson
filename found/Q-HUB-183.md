Q-HUB-183: no guard serialises two agents' staging and commits in one worktree, so two steps the After line lets run together can collide at `git add` and `git commit` (found in the review of step 53 of the redesign plan of 2 November, filed in step 54 of the same plan).

Fix in: `plan-fence.mjs`, `hook-dispatch.mjs`. A guard is to hold one agent's git add or git commit while another agent's is in progress in the same worktree; a search for serialising or an index lock found none.
