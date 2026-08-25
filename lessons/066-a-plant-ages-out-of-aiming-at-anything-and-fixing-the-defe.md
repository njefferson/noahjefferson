## 66 · A plant AGES OUT of aiming at anything, and fixing the defect it guards is exactly when it happens

**Enforced by:** CHECKLIST re-aim-on-fix — when a release fixes a defect or retires a registry entry, re-aim every plant that named it IN THE SAME COMMIT, and watch each one go red again. A whole sweep is the only thing that reports a plant which has stopped aiming at anything; `--changed` selection cannot, because a plant whose target file did not move is not selected at all.

Doctrine §6 says plant a fault and watch the gate go red. LESSONS 32 and 38 cover
a plant that does not move the measurement. This is the other decay: a plant that
measures fine and no longer points at anything.

fauxplane fixed a defect it had published for twenty releases and retired its
entry from the standing-defect registry. The whole sweep then came back 99/102,
and two of the three misses were caused by that fix:

- **One reported itself STALE.** Its `find` named the registry entry's
  explanation, which the release deleted. A `find` that matches nothing breaks
  nothing, so no gate has anything to go red about.
- **One went GREEN, which is the dangerous one.** Its `find` still matched — the
  same sentence survives in OLDER releases' notes — but only the CURRENT release
  is checked against the registry, so deleting a copy from a past entry produces
  no fault at all. It passed, was counted as evidence, and protected nothing.

**The timing is the trap.** The moment you are least likely to audit a plant is
the moment you fix the thing it guards, because a fix feels like the end of that
defect's story rather than the start of its plants going stale. Nobody re-reads
the harness while writing a release note that says "this is fixed".

**A third failure came from the repair.** The replacement target was hand-typed
from the release note, which turned that line's `\u2014` escape into a real em
dash. It looked identical in a diff and matched nothing. **A `find` string is a
byte sequence, not prose** — build plant targets from the file's own bytes, and
never retype a line that contains an escape, a non-ASCII character, or
significant whitespace.

**The general claim: a green sweep is a statement about TODAY's code, and it
expires.** Across one session, five plants in one repo turned out to be
protecting nothing:

- it prefixed a line instead of removing it, so the entry was still present
- it broke a generator that no gate ever runs
- it deleted a lookup key that a documented fallback resolved anyway
- it named a defect a later release fixed
- it named a line a later release grew into a branch

Only the first is "the plant was too weak". The rest are AIMING failures, and
every one of them was invisible to every other check — a plant that produces no
fault produces no signal. The sweep is what found each one, which is the
argument for running it whole rather than selectively, restated with numbers.
