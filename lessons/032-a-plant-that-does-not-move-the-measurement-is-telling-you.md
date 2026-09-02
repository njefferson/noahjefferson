## 32 · A plant that does not move the measurement is telling you the path is dead

**Enforced by:** CHECKLIST plant-moves-the-number — when a planted fault leaves a gate green, establish whether the check is empty or the code path is unreachable, before writing a stronger plant.

§6 says plant a fault and watch the gate go red. The interesting case is the one
that stays green, and the instinct — "my plant was too weak, write a bigger one"
— is usually wrong.

Building §7h's update offer, one check went through three versions:

1. **The check was empty.** It claimed "a first visit is not told a new version is
 ready" but measured *after* a forced reload, by which point it was a second
 visit. The name said one thing and the measurement said another; the fault
 went in and nothing went red.
2. **Rewritten to measure the real first visit, the plant still changed nothing.**
 Removing the guard the check was supposedly about moved neither value. That is
 not a weak plant — it is a message. The guard was never what suppressed the
 offer: on a first visit the worker races past `installed` before `register`
 resolves, so **the offer was unreachable on that path entirely**, which meant a
 real update could be missed too. The bug the check was written to protect
 against was already present, in a form the check could not see.
3. **Only after fixing that** did the realistic fault — offering straight from
 `updatefound`, without asking what state was reached — flip the flag on for
 every newcomer, and the check discriminate.

**So the diagnostic question after a green plant is not "how do I make this
fail?" It is "does the quantity I am measuring depend on the line I changed?"**
If it does not, one of two things is true and both are worth knowing: the check
is measuring something else, or the code you planted in never runs.

The cheapest way to answer it is a throwaway probe that prints the raw value
with and without the fault — twenty lines, outside the gate, thrown away
afterwards. That is what turned the guess into the finding here.

*(Intersecting Parallels 1.22.0, 2026-08-03. Related: §29, a check satisfiable by
coincidence; this is its mirror image — a check falsifiable by nothing.)*

---
