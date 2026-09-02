## 105 · A gate nobody has watched fail is a hypothesis — and when you finally test them, most of what you find is broken TESTS, not broken gates

**Enforced by:** GATE quietkeep:tools/gate-audit.mjs — for every gate script,
plant the defect it exists to catch, run the exact command CI runs, require a
non-zero exit, restore, and require green again. A gate with no plant is
REPORTED, never skipped. Every sibling repo owes the same audit.

**Smell:** a gate you cannot remember seeing red. Also: any gate added in the
same session as the defect it was written for, where the "proof" was that the
original defect no longer reproduces — that shows the FIX works, not the gate.

One repo found five failed mechanisms in a single day — a gate absent from CI, a
walk re-enacting a state by hand instead of driving it, the most consequential
safeguard in the app audited in the one state where it guards nothing, a
renderer producing a state no person can reach, and a pre-commit hook that
regenerated ten files per commit and refused nothing. So all twenty-one of its
gates were put to the plant.

**Every one of them worked.** The audit's first run reported seven failures and
**all seven were the audit's own plants aimed at the wrong lever:**

- One measured declared colour PAIRS while the plant edited the wordmark, then
  the icon file — rendering assets was a different script from checking them.
- One built its store from `big-sample.ts` while two successive plants edited
  `sample.ts`, a file it never reads. It kept correctly reporting 16 of 16.
- One tracked only nouns that exist in the code, so an invented vocabulary
  entry was rightly none of its business.
- One inspected only files that actually call a notification API. Nothing did
  yet, so it reported itself **armed and dormant** and ignored banned copy in an
  unrelated constant — exactly right, and indistinguishable from broken until
  the plant included a real emitter.
- One measured the BUILT artefact, so a plant in source without a rebuild never
  reached it. The gate was right about what a person actually reads.

**The lesson is not "the gates were fine".** It is that **writing the plant is
where you find out what a gate actually asserts** — which is nearly always
narrower, and aimed at a different artefact, than its name suggests. Every wrong
plant taught something true about the gate that no amount of reading its output
had. Half of them were mine misreading which file was authoritative.

**So the audit must distinguish "planted and the gate passed" from "the plant
never applied".** `String.replace` returns the original string when its pattern
is not found, silently — so a plant written against a since-reworded line
mutates nothing, the gate correctly stays green, and the audit blames the gate.
**Refuse a plant that changed no bytes.** Without that, this tool manufactures
false accusations against working gates, which is worse than not running it.

**And require green again after the restore.** A gate left red by a restore that
did not restore poisons every gate after it, and the audit blames the wrong one.

**The recurring shape, now seen three times in one day:** the instrument built
to find a fault carries that fault. A screenshot tool rendered a state no finger
can reach. A staleness hook never refused. This audit accused seven innocent
gates. **Assume your new instrument has the defect it hunts, and check it first.**
