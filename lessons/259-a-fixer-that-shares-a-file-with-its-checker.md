## 259 · A fixer that reads its rules out of its checker can corrupt in the one way the checker cannot see

**Enforced by:** CHECKLIST bound-a-slice-by-two-markers — a script that lifts a
region out of another file names BOTH ends, never "from here to the end". ·
CHECKLIST read-a-bulk-rewrite-as-a-diff — a rewrite touching more files than can
be read one by one is read as `git diff --stat` plus a sample, BEFORE the gate is
run, because a green gate over a bulk rewrite is evidence about the gate's
population and nothing else. · JUDGEMENT — whether a fixer sharing a source of
truth with its checker is worth the coupling it buys.

**Smell:** a fixer that parses its checker's source to avoid a second copy of the
rules — which is the right instinct. Then: a slice taken with `indexOf(start)`
and no end. A rewrite reported by count ("240 files") rather than by diff. A
gate run immediately after a bulk change and believed.

**2026-09-09.** A spelling gate held a declared word map — about 260 pairs — and
a one-off rewriter was written to apply it across the tree. Restating the map in
the rewriter would have been the second copy the gate exists to prevent, so the
rewriter parsed it out of the gate's own source. Correct.

**It sliced from the map's opening line to the end of the file.** Below the map,
in the same file, sat the gate's POPULATION list, which says which kinds of file
a reader reads. Its entries look exactly like map entries — `kind: 'md'` — so the
parse swallowed one, and the rewriter learned that the word "kind" should be
spelled "md". It rewrote `kind` to `md` in 240 files.

**The gate then passed it.** Of course it did: "md" is not one of the spellings
it looks for, and the file it would have had to read to notice was itself. The
tree was corrupt, every gate was green, and the only signal was a diff nobody
had opened — 240 files was a number in a summary line rather than something read.

**The general shape is worse than the bug.** A checker's population list and its
rule list live in one file because they are one idea; a fixer reading that file
gets both, and the failure mode of taking too much is *silent and wide*, because
the extra rule is applied to the tree while the gate that would catch it is
downstream of nothing. The two halves that make it invisible are the unbounded
slice and the unread diff, and either one alone is survivable.

**What it costs to fix is nothing.** An end marker — a literal comment line the
fixer looks for — turns "to the end of the file" into a region somebody declared.
And a bulk rewrite is read as a diff before its gate is trusted, because the gate
was written to catch a class of error the rewrite has just left the class of.

**See also §243** (two gates carrying two lists for one idea, and neither was
right) — the same coupling from the other end. Sharing the list is right; taking
it without saying where it stops is where this goes.
