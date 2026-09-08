## 251 · A `??` chain reaches past the value it was written for, and reads somebody else's bookkeeping out as a promise

**Enforced by:** CHECKLIST who-wrote-this-field — for every `a ?? b ?? c` that
feeds a sentence, name the subsystem that writes each arm and what it means
there; an arm written by a different layer for its own purposes is not a
fallback, it is a different fact wearing the same shape. · CHECKLIST
same-precedence-as-the-grouping — where a list already decides what a record IS
before it looks at its values, any surface describing one record answers in that
order too, or the two disagree about the same row. Watched: the grouping asked
`onMenu` first and the two readouts asked it last (or never), and only the
readouts were wrong. · JUDGEMENT — whether a surviving value is state the reader
chose or machinery the app kept.

**Smell:** a nullish chain whose arms come from more than one writer. A field
named for the app's own scheduling (`review`, `revisit`, `recheck`, `sweep`)
appearing in a chain beside fields a person sets. A ternary arm that can be
shown to be unreachable. And the tell in the copy: a control promising an
ABSENCE — "no clock", "nothing scheduled", "no reminder" — where the store keeps
one for its own reasons.

**2026-09-08.** A planner's *Someday* button said "onto the Menu, no clock". A
thing sent there came back reading `on the Menu · comes back today`, and the
list of what returns said the same. The obvious reading is a broken invariant,
and it was not: routing clears every DEMAND clock, and the one that survived was
written by the write-gate at capture so that nothing is ever silent — a
`review` clock, excluded from the demand set in terms, passing both law belts
correctly because one governs demand-free *kinds* and the other governs *demand*
clocks on that placement.

**The data was right and two sentences described it wrongly**, both through
`n.clocks.due ?? n.clocks.review ?? n.clocks.start`. Neither had any idea the
node was on the Menu, so each fell through to the app's own bookkeeping marker
and announced it as a return date to somebody who had just been told there was
none.

**The correct precedence already existed one file over.** The grouping function
buckets `onMenu` BEFORE it looks at any clock, and has since it was written; the
readouts asked in the opposite order. One of them even carried an `onMenu` arm
that could never be reached, because the surviving clock made the clock arm
truthy for every item it applied to — a branch somebody wrote for exactly this
case, dead on arrival, and green.

**The general shape.** `??` reads as "or the next best version of the same
thing", and that is true only while every arm has one author and one meaning.
The moment one arm is another subsystem's private state, the chain stops being a
fallback and becomes a category error that type-checks: same type, same
plausible sentence, different fact. It cannot be caught by tests over the
STORE — the store was correct throughout — only by asking a surface what it
means, which is what a cold read does and a gate does not.
