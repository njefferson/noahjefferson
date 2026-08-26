## 143 · The stale-clone guard ran at session start, and the clone was replaced four hours later — with the remote-tracking refs stale alongside it

**Enforced by:** CHECKLIST ls-remote-before-a-promote — before any merge to
production, read the TRUE remote with `git ls-remote origin refs/heads/<branch>`
and compare it to `git rev-parse HEAD`. Not `git log origin/main`, which reads a
local ref that goes stale with the tree it came in. · CHECKLIST
re-check-staleness-mid-session — a session-start check does not cover a session.
Any surprise about the tree — a file you wrote missing, a gate answering about
work you remember doing, a hook gone — is a staleness symptom before it is
anything else. · GATE noahjefferson:session-brief.mjs — §0 fetches both clones
and refuses to be quiet about either being behind, which is the right check
running at the wrong frequency.

**Smell:** a guard against an environment hazard, wired to a lifecycle event. Ask
what the hazard's actual arrival rate is. If it can happen at ANY moment and the
guard runs at ONE moment, the guard covers an instant and the reasoning covers a
session.

The hazard was already known and already mechanised. `session-brief.mjs` §0
fetches both clones before anything else and prints a loud warning if either is
behind, with a comment saying a container had re-cloned at a months-old commit
**three times in one session**. It ran at the start of this one and both trees
were current.

Four hours later, immediately before a promote to production, the container was
recycled and both repos were re-cloned at pinned older revisions. One sat **146
commits behind**. `git status` was clean, the branch was right, the files were
all there, and the tree was a different day's work wearing the same paths.

**And the natural hand check agreed with it.** The local remote-tracking refs had
come in with the stale clone, so `git log origin/main` and `git rev-parse
origin/staging` answered confidently about a different day. Nothing looked
wrong because nothing WAS inconsistent — a stale tree is internally coherent,
which is exactly why every gate passes on one. The brief's check works only
because it FETCHES first, and a check copied by hand without that step is not
the same check.

It was caught by `git ls-remote`, which asks the remote rather than the local
ref. Both clones were reset, the commit hook reinstalled (§135), and the promote
proceeded on a tree that had been proven rather than assumed.

**What would have shipped.** The merge would have been built on a tip 146 commits
behind and pushed to production — months of work undone, with every gate green,
because each one measures a tree for internal consistency and that tree had it.
The branch-state gate would have compared the record against the stale
`origin/main` and agreed with itself.

**The gate that names the hazard and leaves the remedy to the reader.** That
repo's `branch-state-check.mjs` reads `origin/main` from the local ref, prints
*"production read at origin/main <sha>, as last fetched"*, and on failure advises
**"`git fetch origin main` first — a stale remote-tracking ref makes this compare
against yesterday."** It knows. It says so. It does not do it. A gate that can
close the hole it describes and instead describes it is relying on the reader
being alert at the exact moment the hazard fires, which is the reader this whole
file exists because of.

**Cheap and correct:** fetch the one ref before reading it, and when the network
is not there, SAY the answer is from the last fetch rather than printing it as
current. Both branches of that are one line of output each.
