## 114 · The performance guard that skips the line it was never measured against — a length cap for minified bundles that hid 632 lines of hand-written prose

**Enforced by:** GATE noahjefferson:third-person-check.mjs · CHECKLIST
skip-condition — every scanner’s skip condition is measured against the tree it
will run on, in the commit that adds it, and the count of lines it drops is
printed or recorded. A length, a size or a depth standing in for
machine-generated is a proxy, and a proxy silently acquires whatever else
shares it.

`third-person-check.mjs` shipped 2026-08-11 and cleaned two repos to zero. On
2026-08-22 a reference stood in plain sight on line 205 of a design document in
a tree the gate called clean.

**The cause was one line of performance hygiene.** The scan loop carried
`if (line.length > 300) return;` under a comment reading *a hash or a minified
bundle is not prose, and a word boundary inside base64 is not a word* — correct
about the hazard, wrong about the test, and **the number was measured against
nothing.** 300 was an estimate of how long a line of prose gets.

**Measured after the fact, in the repo that was reporting clean:** 632 tracked
lines over 300 characters, hiding **12 real third-person references** across
three files — seven of them in the repo's own source-of-truth document, the file
its CLAUDE.md names first in "read these first". The hub had 31 such lines and
none carried a hit, which is why nothing looked wrong from the hub.

**The reason the estimate was wrong is a house style, not a mistake.** Markdown
in these repos is written one paragraph per line with soft-wrap off, because a
paragraph that reflows produces a diff nobody can read. Every substantive
paragraph in every design document therefore clears 300 characters *by
convention*. The guard was not skipping outliers; it was skipping the prose.

**The replacement tests the actual hazard.** Base64, hashes, data URIs and
minified bundles are unbroken runs of non-whitespace; hand-written prose has no
80-character word. Measured over both repos across the change: the same 45 and
44 machine lines skipped, zero prose lines lost, 12 references surfaced.

**The smell is general and it is cheap to check.** Wherever a scanner decides
*this line is not worth reading*, ask what the condition was measured against.
A skip written for a hazard is fine; a skip written for a hazard and **specified
by a proxy for it** — length standing in for machine-generated, size standing in
for binary, depth standing in for generated — silently acquires whatever else
shares the proxy. A single sibling adopting a house style moved 632 lines across
that threshold and nobody edited the gate.

**And the failure mode is the expensive one: green.** A gate that goes red on
its own bug gets fixed the day it lands. This one reported *no third-person
references in tracked files* over twelve of them for eleven days, in the exact
words that make the tree look audited — the same shape as §112 one layer down,
where the gates agreed the dirtiest repo was clean.
