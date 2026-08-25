## 103 · Anything generated FROM the app goes stale in the tree, and only a check at the moment of the change has ever stopped it

**Enforced by:** GATE hub:branch-guard.mjs · GATE quietkeep:tools/hooks/tour-fresh.sh · GATE quietkeep:tools/tour-shots.mjs — `.branch-guard` may name repo-local executables with `also=` (repeatable) and the generated pre-commit hook runs them on every commit, a missing or non-executable one FAILING rather than skipping. Quietkeep declares one that refuses a commit changing what its walkthrough photographs are OF without re-rendering them, with `tour:check` as the CI backstop and the guard itself verified in CI because `--no-verify` walks past any hook.

An app's first-run walkthrough described a screen the reader was looking at and
could not see yet — *"the box at the top"*, *"it offers you a small number of
things"* — with no picture of any of it. Five illustrations were added, rendered
from the running app rather than drawn.

**And a screenshot is believed on sight in a way prose is not.** Writing that has
gone out of date reads as out of date; a picture of a version that no longer
exists reads as proof of the version in front of you. **An illustrated help
screen that has drifted is worse than one with no pictures at all**, which makes
it the highest-stakes instance of the stale-record defect this family keeps
finding — the doors list, the strip list, the changelog, the four routing marks.

**The fix that has worked every time is one source plus a check that fails on
drift.** What was new here is WHERE the check has to sit. A review nobody does
will not catch it, and a CI gate catches it only after the change is published.
So it runs at the moment the change is made: the commit hook, which this family
already trusts precisely because *"an instruction in a file never once managed
it"*.

**Over-firing is the SAFE direction here, and that is a real exception worth
naming.** The usual rule is that a gate which cries wolf gets satisfied by
reflex — but that is dangerous because the reflex is to SUPPRESS. Here the
reflex is to regenerate, which is exactly the outcome wanted. A coarse hash that
fires on an edit which could not have changed a pixel costs a minute and leaves
the tree correct; a missed change ships a lie. **Ask which way the reflex points
before deciding how precise a gate has to be.**

**What NOT to build: a CI job that re-renders and compares the bytes.** Two of
these pictures show things that legitimately differ run to run — whichever
sample item is next in a queue, and the browser's real figures for free space —
so regenerating with nothing changed still rewrites four of ten files. That gate
would be permanently red, and a gate that is always red is one everybody learns
to ignore. It would have been the obvious design and it is the wrong one.

**And the fix command must be idempotent**, or the hook is telling somebody to
spend a minute they may not need. `--if-stale` compares the recorded hash first
and exits immediately when nothing moved, which is also what keeps ten binaries
out of every unrelated diff.

**The hook refuses rather than regenerating for you.** Rendering takes about a
minute of browser; a pre-commit hook that silently spends that — or hangs — is a
hook people disable, and a disabled hook protects nothing.
