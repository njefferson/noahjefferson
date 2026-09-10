## 269 · A find-and-replace cannot tell a gate's own fixture from the prose it is fixing, so the sweep disarms the gate and nothing goes red

**Enforced by:** GATE gates-audit:quietkeep:tools/gate-audit.mjs — every gate is
run against a deliberately planted defect and must go red, and a plant that
changes nothing is reported as UNVERIFIED rather than passed. · CHECKLIST
sweep-touches-fixtures — after any repository-wide replacement, the gates whose
fixtures contain the replaced text are re-audited before the sweep is committed.

**Smell:** a gate whose plant edits a string that also appears in the app. Any
`s.replace(A, B)` fixture where A and B differ by exactly the thing some other
rule is trying to normalize. A sweep whose report counts files changed and not
which of them were test fixtures.

**Quietkeep, 2026-09-10.**

The spelling gate refuses a British spelling in anything a reader reads. Its
plant, in `gate-audit.mjs`, edited one heading in `public/index.html`: the
heading read the British spelling, and the plant wrote the American one in to
prove the gate would catch the difference.

Then the app was swept, on instruction, to take British spelling out of
everything a reader reads. The sweep reached `gate-audit.mjs` too — correctly,
by its own rule, since it has no way to know that one of those strings is a
gate's ammunition. **Both halves of the replace became the same word.**

`edit` found nothing to change. The gate was never re-armed, and for three
releases it ran on every commit and in CI, green every time, unable to fail.

**IT WAS NOT FOUND BY ANYTHING RED.** Nothing was red; that is the whole
problem. It was found by `gates:audit`, which plants a failure in each gate and
reports one that stays green as UNVERIFIED rather than as passing — the
distinction is the entire value of the tool, and this is the case it was built
for. A run reporting "26 gates audited · 0 not doing their job · 1 unverified"
is the only signal that ever existed.

**The repair has a direction to it, and the direction is the point.** The plant
now writes the WRONG spelling deliberately. A sweep in the same direction as
the original cannot touch it, because breaking this fixture would require
INTRODUCING a British spelling — which is the thing the sweep exists to remove.
A fixture whose failure mode is the opposite of the rule's failure mode cannot
be disarmed by enforcing the rule.

**And the gate reads its own tools**, so the deliberately wrong word had to be
declared in `.spelling-allow` with its reason. That declaration is checked both
ways and printed on every run, which means the exemption cannot outlive the
fixture — the pattern this repository already uses everywhere it lets one rule
step aside for another.

**The general shape.** Any repository-wide normalization — a spelling, a
renamed control, a vocabulary ban, a licence header — is a change to the
CORPUS, and a gate's fixtures live in the corpus. The sweep will find them, and
it will make them agree with the rule, which is precisely what stops them
testing it.

**Related.** §259 — a fixer that reads its rules out of its checker can corrupt
in the one way the checker cannot see; same family, one layer down. §254 — a
spelling rule is a LIST and its population is what a reader reads.
