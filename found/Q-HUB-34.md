Q-HUB-34: standing reviews ran a shell line (a read, a listing, a git status) before reading their rules file, although the step forbids any shell line before that read, and no guard refused it; nothing was changed by those lines (found in step 63).

Put right already: "the rules-first refusal says a call a gate must see goes in a turn of its own" in `guard-cases/plan-fence.mjs`. The case calls rulesFirst with a Bash call and no read of the rules and fails when that call is not refused.
