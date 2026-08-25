## 118 · A declared drag alternative satisfied the gate by existing, while doing less than the drag it stood in for

**Enforced by:** GATE 3d-printing-pal:tools/a11y.mjs — the press check now
presses for BOTH destinations a drag reaches, a column and a position within a
column, instead of pressing whichever button is first in the list.

Every drag is declared in `INTERACTIONS.json` beside the non-drag control that
satisfies it, and a declared drag with no alternative fails the build. A card
drag was declared honestly: *carries a card into another column, and to a
position within that column.* The alternative beside it opened a list of the
other columns.

**So reordering within a column was reachable by drag and by nothing else** — no
keyboard route, no screen-reader route, nothing for a hand that cannot hold a
drag steady. That is precisely SC 2.5.7. It shipped through three releases with
the interactions gate green every time.

**A gate can tell that an alternative EXISTS. It cannot tell that the alternative
covers what the drag does.** Equivalence is a claim about two behaviours, and the
only thing that can evaluate it is something that performs both.

**The declaration itself contained the evidence, in the `what` field, one line
above the `alternative` that omitted it.** Both were written in the same commit
by the same session. Describing a gesture completely and then describing its
replacement is where the gap opens, because the second description is written
while looking at the control rather than at the gesture.

**What actually caught it was a press check breaking for an unrelated reason.**
Adding the reorder buttons put one at the top of the move list, so the check that
pressed `#move-list button` first and asserted the card changed column went red —
"the move list closed and the card did not move". The gate was asserting the
weaker thing all along and only said so when the list order changed under it.

**The general form: when a gesture has N destinations, the alternative needs N
assertions, one per destination.** "Pressing the first thing in the list works"
is a test of the list's order.
