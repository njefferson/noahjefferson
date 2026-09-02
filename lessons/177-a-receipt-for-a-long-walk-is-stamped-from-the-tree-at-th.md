## 177 · A receipt for a long walk is stamped from the tree at the END, and four minutes is long enough to edit the thing it certifies

**Enforced by:** GATE quietkeep:tools/a11y-stamp.mjs — `writeStamp(hash)` takes
the hash the caller read BEFORE the walk began, so a source edited during the
run leaves the stamp and the tree disagreeing and the next commit is refused. ·
GATE quietkeep:tools/a11y-stamp.mjs — `uiSources()` hashes every `.ts` under
`src/`, not one subdirectory of it. · CHECKLIST guard-input-set — for any guard
over a generated artefact, write down what feeds the artefact and compare it to
what the guard hashes; two guards on one artefact must agree about its inputs.

**Smell:** a freshness receipt that computes its own hash at the moment it is
written. Also: a "what can change the rendered app" list that names a directory
rather than the build's input set.

An expensive walk that leaves a receipt is the right shape — it is how a
four-minute browser run stops being something a session decides to skip. Both
faults here are in the receipt, not in the walk, and both report green.

**The stamp was read at the end of the run.** The walk starts, asserts the
bundle matches `src/`, then spends four minutes in a browser; on a clean finish
it hashes the tree and writes that. So anything edited during those four minutes
is certified by a run that never saw it. It is not a narrow window — four
minutes is precisely when somebody moves on to the next file, and it happened:
the release notes were rewritten while the walk that would have measured them
was halfway through. The fix is one argument. Read the hash where the bundle
check already proves the tree and the artefact agree, carry it, write it at the
end. The tree then no longer matches the stamp and the next commit is refused,
which is correct — that tree was never walked.

**And the input set was one subdirectory of the input set.** The list was every
`.ts` under `src/ui/`, on the reasoning that UI modules are what render. But the
words on a screen are not all written in UI modules: in that app the line above
the offer list lives in `src/offer.ts`, every reason a card gives lives in
`src/nextup.ts`, and the history lines live in `src/log-words.ts`. A release
changed a rendered sentence in `src/offer.ts` and the receipt could not see it.

The file's own docstring already carried this lesson in a smaller form — an
earlier session had widened the list once, from the five files a screenshot tool
watches, and wrote *a guard whose input set is narrower than the thing it guards
is a guard with a hole in the middle, and it reports green through it.* It then
widened it to the wrong set and stopped.

**The honest input set is the artefact's own.** The walk serves a bundle built
from all of `src/`; the freshness check beside it already compares that bundle
against the newest file under `src/`, not under `src/ui/`. Two guards over one
artefact disagreeing about what feeds it is how one of them ends up with the
hole — and the one that disagreed was the one nobody would notice, because a
stale receipt looks exactly like a fresh one.

The cost rises and is worth stating rather than hiding: a change to a module
that renders nothing now asks for the walk as well. That is the price of a guard
that cannot be wrong about its own scope, and it is cheaper than one release
shipped on a receipt for a different tree.
