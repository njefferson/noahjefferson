## 127 · Two gates were written, planted red, and passed locally for a release and longer, having never once run on a runner — because the gate list lives in two files and nothing compared them

**Enforced by:** GATE 3d-printing-pal:tools/gates-parity.mjs — the check chain and
the workflow's steps are compared in both directions, and the check asserts its own
presence on both sides. · CHECKLIST every-sibling-owes-this — any repo whose CI
names gates individually has the same two lists.

`npm run check` is a single `&&` chain in `package.json`. CI runs the same gates as
SEPARATE NAMED STEPS, on purpose: a workflow that runs one command reports one red
X, and a run that cannot be read by step is a run that gets read by conclusion,
which §53 and §117 are both about.

That is the right trade and it has a cost nobody priced. **The list of gates now
exists in two files, and adding to one is the natural way to add.**

`shell` and `fromurl` went into the chain and not into the workflow. Both were
written properly, both were planted red, both passed on every local run — and
neither had ever executed in CI, `fromurl` for a release and `shell` for
considerably longer. Nothing was wrong with either gate. They were simply not
there, and Gates went green saying so in the same voice it says everything.

**This is worse than a gate nobody wrote.** A missing gate is an absence somebody
may notice. A gate that exists, is tested, is planted red, and runs only on the
machine of whoever wrote it produces a green local chain that reads as coverage
and a green CI run that never looked. It is §53's shape — the evidence that
something happened is a green thing that did not do it — one layer up.

**The two lists are comparable mechanically, which is the whole reason this is a
gate and not a note.** The only real difficulty is that CI has two spellings: an
npm script, and a hub gate invoked directly as `node .hub/<file>.mjs` where the
chain spells the same gate `../noahjefferson/<file>.mjs`. Resolve the script body
to its hub filename and both spellings match.

**Exemptions are a declared list with a reason each, never a pattern** — §108's
finding, and it earned itself again here: `doctrine-sync` is deliberately not in
CI, because a sibling going red because the hub moved trains everyone to ignore
red, and CI cannot tell a session what it has not read.

**The check must assert its own presence on both sides.** A parity check missing
from one list is exactly the defect it exists to find, and it cannot find it from
outside. It went red on six items the first time it ran, and one of them was
itself.

It also went red on an exemption that was wrong before anyone had used it:
`branch-guard` looked like a CI-only gate and is not — CI invokes it directly
rather than through npm, and the chain does not run it at all. **A hand-written
exemption is a guess until something checks it**, which is §119 again: a
definition nothing checks goes narrow, or in this case simply wrong.

**The general shape: whenever the same list has to exist in two files, the thing
that compares them is a gate, and it goes in both.** Every repo in this family
that names its CI gates individually owes this check.

---
