Q-HUB-1: plan-fence.mjs lets an agent write any file under the session scratchpad, so a worktree kept there is bounded by no Files list; only plan-scope-check.mjs and the pre-commit hook judge the diff against the plan (found in step 41).

Not placed: searched plan-fence.mjs for worktree and scratchpad and found the scratchpad write allowance stated as designed, with no rule that bounds a worktree kept there.
