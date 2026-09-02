## 111 · A both-directions check that filters by a naming convention covers only the members that follow it — and the misfiled entry is exactly the one that does not

**Enforced by:** GATE quietkeep:tools/plain.mjs

The offer card's two lists must together account for every element of the card,
and the gate checks both directions — an element in neither list fails, and a
list naming an element that is not there fails too. That pair has held since it
was written; the card has not gone stale once.

The reverse check reads: every id in either list that begins `nextup-` must still
be on the card. **`#upkeep` was in the card's hidden list and is a section of the
work surface**, put there the day the mode was built. It begins with nothing, so
the reverse check skipped it, and the forward check only walks the card's own
elements, so it never asked. **The one runway section the mode did strip was the
one nothing was checking** — and it was in the wrong list for four releases in a
file whose entire subject is lists that go stale.

The prefix was not a mistake at the time: the check had to distinguish card ids
from everything else, and a convention was the cheapest way. **The cost is that
the filter and the misfiling have the same cause.** An entry lands in the wrong
list precisely because it does not look like its neighbours, which is the same
property the filter uses to exclude it.

**Smell:** any `.filter(x => x.startsWith(…))` inside a completeness check. The
filter defines the population the check is complete over, and that population is
smaller than the list. Ask what is in the list and not in the population — it is
one line, and it is where the answer will be.
