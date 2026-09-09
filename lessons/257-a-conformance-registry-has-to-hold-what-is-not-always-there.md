## 257 · A coverage registry that cannot hold a sometimes-absent element makes the honest choice unregisterable

**Enforced by:** GATE quietkeep:tools/a11y.mjs — a registry entry may declare
`whenShown`; absence is a note per state and a FAILURE across the whole run. ·
CHECKLIST tolerance-needs-a-global-counterpart — any per-item exemption in a
coverage gate is paired with an assertion over the whole run that the item was
satisfied somewhere, or the exemption is an off switch. · CHECKLIST
plant-the-tolerant-path — a gate that learns to forgive is watched forgiving AND
watched refusing; the second run is the one that proves anything. · JUDGEMENT —
whether an element's absence on a given state is correct rendering or a defect.

**Smell:** a coverage list with no way to say "this is here only sometimes". An
element left out of a registry because adding it would fail. A live region, an
empty-state message, a receipt, a validation error — anything whose correct
rendering on most states is *nothing at all*. And the tell: a comment explaining
why something is NOT in the list.

**2026-09-09.** A contrast registry named, per surface, every text selector whose
colour pair must be measured, and refused a selector matching nothing visible —
correctly, because an entry that quietly stops matching is unmeasured ink, which
is what the registry exists to prevent (§28).

**That rule made one honest thing unregisterable.** A live region carrying the
sorting screens' confirmations is EMPTY on every state the walk stands in before
the reader does something. Registering it plainly failed five surfaces for
rendering correctly. Leaving it out shipped its ink unmeasured. **Both options
were wrong, and the second one is the one that had been taken** — the region was
`visually-hidden`, so there was no ink to measure and no pressure to notice.

**The fix is a declaration with a global counterpart.** An entry may say
`whenShown` with a reason. Per state, absence prints as a note. **Across the
whole run, the selector must have been seen at least once, in some state, in
some theme, or the run fails at the bottom.** That second half is the entire
design: without it, `whenShown` is an off switch, and a selector that had
stopped matching *everywhere* would go quiet — precisely the failure the plain
rule was written for. With it, the tolerance forgives only the states where
absence is the correct rendering, and never the case where the element is gone.

**Both paths were watched.** Live: the region measured on six state/theme
combinations, noted absent on four, and the whole-run line confirming it was
seen. Planted: the same entries re-aimed at a selector matching nothing
anywhere — one failure, naming the selector and its declared reason, exit
non-zero. A gate that has only ever been watched forgiving is not a gate that
refuses; the plant is what separates a tolerance from a hole, and it cost a
second fourteen-minute browser walk to establish.
