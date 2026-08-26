## 144 · Two guards covering one condition make each other unplantable, and each reads as load-bearing on its own

**Enforced by:** CHECKLIST plant-both-guards — when a planted removal leaves every
measurement unmoved, look for a SECOND guard covering the same condition before
concluding the first one is dead. Plant the removal of both.

**Smell:** two guards written at different times, in different vocabularies, for
what turns out to be the same degenerate case. Each is individually correct, each
fires on real candidates, and neither can be shown to matter — because removing
either one leaves the other holding the line.

Solve-ent's generator refuses to pose a problem whose error classes would predict
something a student could not tell apart. Two of its refusals concern
proportions, and they were written a day apart from opposite directions:

- `RATIO_NOT_UNITY` — a recipe of one-to-one cannot teach a ratio, because using
  it upside down, ignoring it entirely and getting it right all produce the same
  number.
- `SCALE_NOT_RECIPE` — the additive misconception, *add the difference between
  the two numbers*, must not land on the correct answer.

They look unrelated. They are the same condition: the gap between the additive
answer and the right one is `(c − a)(b − a)/a`, which is zero at `a = b`, which
is exactly a one-to-one ratio. So `SCALE_NOT_RECIPE` refuses every candidate
`RATIO_NOT_UNITY` refuses, and more.

**Removing `RATIO_NOT_UNITY` moved no measurement at all**, which under §32 says
the code path is dead. It is not dead — it fires 354 times in a 10,500-problem
sweep. It is COVERED. Removing both moved two numbers at once: a collision
appeared, and the share of stages that can attribute nothing went from 9.30% to
10.52%.

**The order this was found in matters, because two of the three attempts said
"dead path" and both were wrong for different reasons.**

1. The first removal moved nothing because the recipe table contained no
   one-to-one ratio — the guard was armed and dormant, refusing only a 4:5
   recipe, and refusing that for the reason in §145.
2. Adding one-to-one recipes gave it something real to refuse. The removal still
   moved nothing, this time because of the overlap.
3. Removing both moved everything.

**So a green plant has a third answer, and it is the one worth adding to §32's
two.** That section says: after a planted fault leaves a gate green, establish
whether the check is empty or the code path is unreachable. There is a third —
**the path is live and something else is standing in front of it** — and it is
the only one of the three where the guard you are doubting is entirely correct.
Distinguishing them costs one line: count how often the guard actually fires. A
guard firing hundreds of times and changing nothing when removed is covered, not
dead.

**What to do about it is NOT to delete one.** Both are kept, because they say
different things to whoever reads them next — one is a statement about what a
proportion problem has to be, the other is a statement about a specific
misconception's separation — and a condition worth two independent expressions
is a condition worth keeping two expressions of. What was added is a sentence in
the code beside them saying they overlap and that neither is provable alone.
**The overlap is invisible from either line by itself**, which is what makes it
worth writing rather than leaving to be rediscovered by the next person who
plants one of them.

*(Solve-ent 0.1.0, 2026-08-26. Related: §32, a plant that does not move the
measurement; §7g, a check that cannot fail.)*
