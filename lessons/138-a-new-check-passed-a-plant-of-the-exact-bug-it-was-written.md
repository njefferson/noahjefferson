## 138 · A new check passed a plant of the exact bug it was written for, because every record in the fixture had exactly one child

**Enforced by:** GATE 3d-printing-pal:tools/a11y.mjs — `checkJobsOnModel` presses
the LAST row of a parent that has MORE THAN ONE child, and FAILS rather than skips
when the fixture cannot offer one. · CHECKLIST plant-against-the-fixture — when
planting a bug to prove a new check works, ask whether the FIXTURE can express
that bug, not only whether the code can.

LESSONS 136 established that a gate written beside its design has to be written as
a question the design might fail. This is the same rule one level down, about the
DATA, and it was found the only way it can be: by planting.

A model card had gained a list of the jobs that print it, each row pressing
through to its job. The check pressed the first row and asserted the job that
opened was the one that row named. It was planted with the obvious bug — **every
row opens the first job** — and it passed.

**It could not have done anything else.** Every model in the fixture had exactly
one job. With one child, "each row opens the child it names" and "every row opens
the first child" are the same observation. The plant was real, the check was real,
and the two could not meet.

**Every green run before the plant was green for that reason and no other.** The
check looked correct, the failure message was well written, the assertion was the
right one to make — and its answer was determined by the shape of the seed rather
than by the behaviour of the code. **A check whose fixture cannot express its
failure is not a weak check; it is a check that has not run.**

**The fix is two-sided, and the second half is the one that lasts.** The seed grew
a second job on one model, and the check presses the LAST row rather than the
first — but more importantly it now FAILS, with a message saying exactly this, when
no parent in the fixture has two children. A check that quietly does nothing when
its evidence is absent is the fail-open shape this family has been round on
several times: the branch guard that skipped without `origin/main`, the surface
list that could not see divs, the registry selector that matched nothing.

**Why this is easy to miss, stated plainly.** A fixture is built to make the
common case work, and then it is inherited by every check written afterwards.
Nobody re-reads it. Its shape becomes an unexamined premise of every assertion
downstream, and "one of each" is the most natural shape to build and the one least
able to catch an off-by-one, a wrong index, a shared reference or a cached first
result. **The fixture is part of the check. Review it as such.**

**The rule.** When planting a bug to prove a new check works, ask two questions
rather than one: can the CODE express this bug, and can the FIXTURE? If a plant
passes, the check is not necessarily wrong — look at the data first. And if a
check needs a particular shape in the fixture, assert that shape rather than
assuming it, so a later seed change breaks the check loudly instead of quietly
retiring it.
