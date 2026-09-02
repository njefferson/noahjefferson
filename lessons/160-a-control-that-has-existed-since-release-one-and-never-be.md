## 160 · A control that had existed since the first release did nothing in six of its fourteen positions, and nothing could have noticed

**Enforced by:** GATE solve-ent:test/tiers.test.ts — every difficulty a topic
declares must differ from the one below it on a UNIFORM measure, or the build
fails. · CHECKLIST unexercised-parameter — for any parameter a screen never
varies, ask what it produces at each value before building the control that
varies it.

**Smell:** a parameter the whole application threads through — a tier, a mode, a
level, a size — where every entry point passes the same value. It is not dead
code: it is read, branched on, tested, and its other values have never once
reached a reader.

Solve-ent generates problems from `(topic, tier, index)` and `TIERS` had been
`[1, 2, 3]` since the first commit. Seven topics, three difficulties, twenty-one
squares, all generated in every sweep, all green. Every screen opened at tier 1.

The moment a difficulty picker was considered, the first question was whether
choosing one would change anything a reader could tell. Measured across three
hundred problems per square: **six of the fourteen steps changed nothing.** Two
topics were flat from end to end.

**Three of the six were a draft function whose third branch had never been
written.** `const exponent = tier === 1 ? 2 : nextInt(rng, 2, 3)` is a step with
TWO positions and THREE labels, and it reads at a glance like a ladder. Three
different generators had the same shape, written by three different hands on
three different days. Nothing in a type checker, a test suite or a review can
see it, because the code is correct — it is the LABEL that is a claim.

**The other three were "the numbers get bigger", which is not a different
question.** A proportion with a 4:5 ratio instead of 1:2, or an amount drawn to
400 instead of 40, poses the same move. Whether that counts as a difficulty is a
judgement, and the way to keep the judgement honest is to make the measure
uniform: no topic gets a probe chosen for it (§141), so the signals are
structural — how many stages, how many parts, how precise the answer, how big
the numbers with exponent fields counted — and a topic that cannot clear the
floor on any of them has not got a difficulty there.

**The fix was not to invent one.** Difficulty is declared per topic now: five
have three, one has two, one has ONE, and the generator REFUSES a value a topic
has not declared rather than clamping to one that exists. Clamping is what lets
a caller believe it asked for something harder — which is the state the app was
already in, silently, for eleven releases.

**Widening the sweeps to the difficulties that were now real found two defects
that had been green the whole time**, and both are the same shape as the lesson:
a check whose population was narrower than the thing it claimed. A no-leak check
had only ever looked at tier 2 and missed a question whose intermediate answer
was printed in its own prompt. A collision guard covered a case that could only
arise on chains longer than any that had ever been generated. **A sweep is only
as wide as the space that has ever been posed, and adding one link to a chain is
adding a space nothing has ever swept.**

**The general form: a parameter that nothing varies is a parameter nothing has
ever tested the meaning of.** Its values are all exercised and none of them are
compared. The cheap gate is to measure each value against the one below on a
measure chosen before the answers are known, and to write it BEFORE the control
that exposes the parameter, because afterwards the honest answer costs a
feature.

**And a name is part of the same claim.** The picker names difficulties rather
than numbering them, and each name describes the QUESTION — "Four steps", "Past
a cube". "Hard" is a statement about whoever picks it; in an app whose whole
discipline is saying what happened to a move rather than what is true of a
person, the difficulty labels are the same rule one step further out.
