## 133 · Every gate in this family is built by planting a failure and restoring, and the reflex for restoring is the one command that deletes the gate being built

**Enforced by:** CHECKLIST snapshot-before-planting — copy each file a plant
will touch into the scratchpad first and restore from there; `git checkout` is
only safe on a file whose current state is committed, which during gate
development it never is. · JUDGEMENT read-the-failure-not-the-count — a suite
that fails AFTER a restore is reporting lost work, not a bad plant.

The plant discipline is the strongest thing in this repo family: an assertion
that has never failed has not been tested, so a new gate is planted red before
it is trusted. The loop is plant, run, restore, and the restore is reflexively
`git checkout <file>`.

**That command does not undo the plant. It undoes everything uncommitted in the
file**, and while a gate is being written, the gate is uncommitted. Two plants
during one build reverted an in-progress `contexts.ts` and `diagnostic.ts` to
HEAD, deleting a new exported predicate and a fifty-line census function that
had already passed their own tests.

**The symptom is what makes it expensive.** Nothing failed at the moment of the
deletion. The suite went green on the plant, then failed on the RESTORE, with a
module-resolution error — `does not provide an export named` — which reads as a
broken plant or a bad import, not as work that is gone. Diagnosing it means
noticing that `git status` lists fewer modified files than it should, and file
counts are not what anybody checks when a test fails.

**The general shape, and it is worth carrying past this case: an undo is scoped
to a FILE, and the thing being undone is scoped to an EDIT.** Whenever those two
scopes differ, the undo takes bystanders with it. Same reason a `git stash` in a
dirty tree surprises people, and the same reason "revert that file" is a
different request from "revert that change".

The remedy costs one line before the first plant:

```
for f in <files>; do cp "$f" "$SNAP/$(echo $f | tr / _)"; done
```

and restoring copies back. It also survives what `git checkout` cannot: planting
a change to a file that is itself brand new and untracked, where `git checkout`
fails outright and the plant silently stays in place.
