## 260 · A protection that is correct in one format is destruction in another, and the same code runs both

**Enforced by:** CHECKLIST no-region-substitution-across-formats — a rewriter
that shields a region and restores it afterwards is written per format, or it
substitutes nothing at all. · CHECKLIST report-what-was-left — a line a rewriter
declines to touch is PRINTED with its path and number, so "protected" is a thing
somebody can read rather than a claim. · JUDGEMENT — whether a rewrite needs
region protection at all, or can be made line-atomic instead.

**Smell:** a rewriter with a `protect()` and a `restore()`. Placeholders written
into the text and swapped back at the end. One file walker handling `.md`, `.html`
and `.ts` with one set of rules. A byte count that changed in a file nobody
expected the change to reach.

**2026-09-09.** The second attempt at a whole-tree spelling rewrite (after §259
took the first) shielded quoted runs before substituting: replace each `"…"` with
a numbered placeholder, rewrite the prose between, put the quotations back. The
reasoning is sound and is the standard trick — a quotation is somebody's words
and must not be respelled.

**In Markdown prose that is right. In HTML every attribute is a quoted run.**
`class="…"`, `href="…"`, `id="…"` — the whole document is quotation marks, and the
placeholder pass rewrote structure into numbers and put back something that did
not round-trip. One page came out **1,139 bytes shorter** than it went in.

**The tell was a byte count, not a gate.** Every check passed: the page still
parsed, the spelling gate was green, the tests did not read that file. What said
something was wrong was `git diff --stat` on a file the change had no business
touching, which is the same instrument §259 needed and the same one that had not
been read.

**The version that shipped substitutes no region at all.** A line is rewritten
whole or left alone whole; every line left alone is printed with its path and
line number for a person to read. That is coarser and it is *atomic*: there is no
restore step, so there is nothing for a restore step to get wrong, and the
coarseness costs nothing when no target word spans a line — which is a property
you check once rather than a mechanism you maintain.

**The general rule.** Region protection is format-specific reasoning wearing
general-purpose code. If a rewriter must protect regions, it gets one
implementation per format and each one is planted against its own format's worst
case. If it can be made line-atomic instead, that is strictly better, because the
failure mode of "left a line alone" is a line somebody reads, and the failure
mode of a bad restore is a file nobody reads.
