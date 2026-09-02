## 199 · A second statement of a fact a gate already guards will go stale, and the gate will stay green

**Enforced by:** CHECKLIST one-statement-per-guarded-fact — when adding a sentence that restates something a gate asserts, delete it or delete the other one; if both must exist, the gate has to read both. · JUDGEMENT — a gate anchors on a pattern, and prose about the same fact does not match that pattern, which is the entire mechanism.

**Smell:** a heading or preamble summarising a list the gate reads item by item.
A count in prose ("all fourteen below are…"). A narrative line stating a version,
a status or a total that a checker derives from somewhere else. Anything of the
form "this section contains no…" sitting above a section a gate walks.

**Three instances in one repo inside one week**, each with every gate green.

**One.** A questions file had a gate refusing any closed question filed under the
`Open` heading — a real check, and it held. Above it sat the sentence *"Nothing
is open. All fourteen questions below are closed."* The gate reads `Status:`
lines. It does not read that paragraph. Opening a question made the sentence
false and nothing failed.

**Two.** A branch-state gate reads the bullet whose text begins with the bare
production URL and compares it against what the host serves. Eleven hundred
lines above it, a prose bullet began *"PRODUCTION CARRIES 3.15.0"*. **It had been
wrong through two promotes.** The gated line was right the whole time.

**Three.** A known-defects section read *"nothing outstanding"* while a measured,
reported defect rode the *still to sort* line of **six consecutive releases'**
patch notes. That section's own header explains why: a defect recorded in a
release's notes "rotates out of view the moment the next release is cut". It had
also predicted its own failure, noting it was ungated and that every ungated list
in the repo had eventually rotted. It rotted at one entry.

**Why it is worse than an ordinary stale comment.** The gate's green is doing
active harm: it is evidence, and it is evidence about the wrong sentence. The
prose is the one a person reads first — a heading is read before any status
line, a summary before the list it summarises — so the false statement is the
one with the wider audience and the true statement is the one with the checker.

**The rule is not "gate the prose too".** It is that a fact with a checker gets
stated once, in the place the checker looks. Everything else points at it.
