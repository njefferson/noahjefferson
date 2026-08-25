## 130 · A measurement state that mutates the fixture charges every check around it, and "put it last" is not the fix, because there is always work after the last thing in a list

**Enforced by:** GATE 3d-printing-pal:tools/a11y.mjs — the `undo-empty` state
reaches an emptied undo journal by RELOADING, which is the app's own behaviour and
costs nothing, and the state list asserts that nothing is queued after it. ·
CHECKLIST any-state-that-acts — before adding a state to a browser gate, ask what
it leaves behind for the states and the checks that follow.

A browser gate measures a list of STATES against one seeded app, and adding a state
is the ordinary way to cover a new appearance. print-tracker needed one: an Undo
button that is dimmed and dashed when there is nothing to undo is a second set of
colours on the same element, and a `.btn[aria-disabled]` rule nothing has looked at
on screen is a rule nobody has checked against the floors.

The obvious way to reach it is to press Undo until the journal empties, and that is
correct by this repo's own rule — a state should be reached through the app rather
than staged by setting an attribute. **It also empties the database.** The card-shape
check and the 320px-at-200% outcome question run after the state loop; both found an
empty board and reported the app broken.

**Putting it last did not fix it, and the reason generalises.** A list of states is
not the end of the run — there is always work after the last item, and it does not
live in the list, so nothing about "last" is visible from inside the state that
depends on it. Re-seeding afterwards then failed differently, because the seed is
not idempotent: it built a second set of records and the card check read the wrong
one.

**The fix was to find a route to the same state that costs nothing.** The undo
journal is in memory and everything else is in IndexedDB, so a RELOAD empties the
journal and keeps every record — and it is a state every reader meets, because every
session begins in it. Not a workaround: a better answer to "how does a reader get
here", which is the question a staged state is always avoiding.

**Ask of any new state: what does it leave behind?** A state that only opens a
dialog leaves nothing. A state that presses a destructive control leaves an
application the next check inherits, and the failure surfaces somewhere else
entirely, which is what makes it expensive to read.

---
