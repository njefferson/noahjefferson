## 145 · A tolerance on a COUNTED quantity has nothing to absorb, and the first thing it does is reject something correct

**Enforced by:** CHECKLIST counted-not-measured — before writing a margin, ask
whether the quantity it applies to was MEASURED or COUNTED. A counted quantity
takes an equality; a margin on one is a margin with no error to accommodate.

**Smell:** a tolerance beside an integer. Coefficients, atom counts, ratios from
a balanced equation, indices, versions, roster numbers — anything arrived at by
counting rather than by reading an instrument. If nothing about the value can be
slightly off, a band around it is not slack, it is an exclusion zone.

Solve-ent's proportion problems are built from mole ratios: two coefficients out
of a balanced equation, so `2 mol of Fe makes 3 mol of CO`. The generator refuses
a one-to-one ratio, because at one-to-one three separate misconceptions all
produce the correct answer. That refusal was written as a margin — the ratio had
to sit at least 0.2 away from 1 — by the same reflex that had correctly written
margins for every measured quantity in the file.

Two things went wrong and only the second is obvious.

**It excluded a good problem.** A 4:5 recipe has a ratio of 0.8, which is a
perfectly ordinary proportion to teach with: used upside down it gives 0.64 of
the right answer, which no student could mistake for it. The margin threw it out.

**And it threw it out by a floating-point hair.** `|0.8 − 1|` evaluates to
0.19999999999999996, which is less than 0.2. The recipe was inside the band by
four parts in a quintillion. Had the margin been 0.25 the same code would have
excluded the same recipe for a real reason; at 0.2 it excluded it for no reason
at all, and the difference is invisible in the source. **A margin whose boundary
lands exactly on a value in the domain is a margin whose behaviour at that value
is decided by binary representation**, and every such margin has a value it does
this to.

The fix is one character class shorter than the thing it replaced: `from === to`.
It is exact because the quantities are exact, it needs no constant, and it cannot
have a boundary case, because there is no boundary.

**The general form: a tolerance is an admission that a number might be a little
wrong, and it belongs only where that is true.** Reaching for one everywhere is
consistency in the wrong dimension — the file's other margins are correct
precisely because the values they guard came off a balance or a burette. Two
kinds of number that look identical in a struct are being treated as one kind,
which is the shape §140 is about, one level down.

*(Solve-ent 0.1.0, 2026-08-26. Found because removing the guard entirely changed
nothing measurable — §144 — which is what sent somebody to read what it was
actually rejecting.)*
