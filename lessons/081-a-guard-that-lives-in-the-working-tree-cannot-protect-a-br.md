## 81 · A guard that lives in the working tree cannot protect a branch whose contents exclude it

**Enforced by:** GATE noahjefferson:branch-guard.mjs — refuses a commit on the wrong branch, generated per repo from `.branch-guard`, installed into `.git/hooks` and re-installed by `npm ci`; running it without `--install` fails on drift in either copy.

Committing on the wrong branch had happened repeatedly across sessions, with the
rule stated plainly in the file every session loads. Production would be checked
out to promote, not switched back, and the next release committed onto
production. **Nothing about the act looks different at the time** — the editor,
the diff and the commit output are identical. The only thing that ever caught it
was a push naming the other branch and moving nothing, which is luck wearing the
costume of a process.

So it became a pre-commit hook, and the first version **failed open.**

`core.hooksPath` was pointed at a tracked `.githooks/` directory — the obvious
choice, since it makes the hook reviewable and shared. Planted, and the commit on
production **went straight through**. Checking production out had DELETED the
hook: production predated it, so the checkout removed the file that was supposed
to be refusing the commit.

**The branch most in need of protecting is the one most likely to be older**, and
therefore the one least likely to contain the guard. The protection evaporates
exactly where it is needed. `.git/` belongs to no branch, so the working copy
lives there and survives every checkout; the tracked copy stays as the reviewable
source and a check compares both.

**Three further things this cost, each worth having separately:**

- **A hook cannot be a shared gate the way the others are.** Every other check
  here takes `--repo ../app` and runs from one file. A hook must be a real file
  inside the repo at commit time, so the only honest arrangement is to GENERATE
  it from one source and fail on drift — an artefact, not a fork.
- **The install must ride on something the repo already runs.** A fresh clone has
  no `.git/hooks` and no memory. `npm ci` is the one command every session and
  every CI job runs, so `prepare` is where the install belongs.
- **Two plants in a row passed for the same reason and neither was reassurance.**
  One because `git stash -u` had stashed the untracked hook; one because the
  checkout deleted it. A plant that passes means the plant did not reach the
  code, every time, and the temptation both times was to read it as the guard
  working.

**The general shape, which is not about git:** a check that ships inside the
thing it checks is absent in precisely the states that thing is broken or old.
Ask where the check LIVES relative to what it guards, and whether the guarded
state can remove it.
