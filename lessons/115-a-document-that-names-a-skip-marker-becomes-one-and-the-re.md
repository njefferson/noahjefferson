## 115 · A document that NAMES a skip marker becomes one, and the region it opens runs to the end of the file

**Enforced by:** GATE noahjefferson:privacy-check.mjs · GATE
noahjefferson:third-person-check.mjs — an unclosed sentinel region is now a
FAILURE in both, reported as a COVERAGE failure rather than a find, because
nothing was detected in those lines and nothing looked at them.

Two gates skip a region marked by a sentinel, so that a file mirroring the
disclosure patterns is not flagged by the patterns it carries. The marker is
matched with a plain substring test, and a line **mentioning** it in prose or in
backticks matches exactly as well as a line **using** it.

**A hazards note warning that one marker with two meanings is a trap named the
marker, and made the fourteen lines after itself invisible.** Nothing closed the
region, so it ran to the end of the file. The gate reported the tree clean.

**What caught it was an unrelated rule, and that is the part worth keeping.** A
skipped region may contain no date — a second-order check on the exemption
itself, written because an exemption is where material collects. The appended
paragraph happened to carry one. **Prose without a date would have gone on being
unscanned indefinitely**, and nothing in the output would have differed.

**The blast radius is what separates this from an ordinary miss.** A pattern that
is too narrow misses one shape. An unclosed region misses **everything after a
point** — every rule, every pattern, both halves of the rule — and the amount it
misses grows every time somebody appends to the file. It was 14 lines when found
because the paragraph was recent; the same defect in an older document would
have been most of it.

**The general form: an exemption mechanism whose trigger is a string cannot
distinguish use from mention, and documentation is nothing but mention.** The
gates' own sources dodge it by building the marker with `+` at runtime, which
prose cannot do — so the fix in prose is to write the halves apart, and the fix
in the gate is to refuse an exemption that never ends. A scoped exemption needs
its scope asserted; an unterminated one is not a scope, it is a switch.

**And it caught itself on the first run.** The comment added to `split()`
explaining this failure named the marker whole, opened a region in
`privacy-patterns.mjs`, and went red — which is the only reason this entry can
say the check works rather than that it looked right.
