## 364 · A worktree has a `.git` file, not a directory, and every worktree runs one shared hooks directory

**Enforced by:** GATE hub:branch-guard.mjs — asks git where its hooks live (`git rev-parse --git-path hooks`) instead of joining `.git/hooks` onto the checkout. · CHECKLIST worktree-hooks — before committing from a second worktree, re-run `branch-guard.mjs --repo . --install` from the tree being committed, and again from the other tree before its next commit.

**Smell:** `ENOTDIR` on `.git/hooks`, or a pre-commit refusal naming a check file the tree being committed has never had.

**Measured 2026-09-25 in Jefferson-Photography-Studio.** A docs commit for
`main` was made in a separate `git worktree` so the working checkout could keep
a held product branch. Two things went wrong, in this order.

The commit was refused because a declared check, `tools/join-fold-check.mjs`,
was missing. `main` has never declared that check. The held branch does. The
hook git ran was the one the held branch's checkout had installed, because a
repository has ONE hooks directory and every worktree runs it. The refusal
stopped a commit under the wrong rules, but it named the wrong reason.

Re-installing the guard from the worktree then failed outright:
`branch-guard.mjs --install` wrote to `join(repo, '.git', 'hooks')`, and in a
linked worktree `.git` is a file naming the real git directory, so the
`mkdir` died on `ENOTDIR`. The guard could not be installed from the one kind
of checkout where the shared directory made installing it matter most.

**This repo already had the fix, in a different file.** The same repository's
`tools/patch-note-check.mjs` asks git where the `commit-msg` hook lives rather
than assuming `.git/hooks`, a change made days earlier for the same reason. One
rule, two places, one of them updated.

**The fix, and the rule.** The guard asks git for the hooks path and falls back
to the join only where git cannot answer; its log names the path it wrote. And
because the directory is shared, the hook in force belongs to whichever tree
installed it last: a session working in two worktrees re-installs from the tree
it is about to commit, and back again afterwards.
