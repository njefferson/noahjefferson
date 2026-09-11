## 274 · Two records of one name, and the gate named for guarding it guarded one

**Enforced by:** GATE quietkeep:tools/reasons.mjs — holds BOTH vocabularies total
over their key types, and asserts each record is typed on that key rather than on
`string`, because the compiler's totality evaporates the moment the key widens. ·
CHECKLIST grep-the-name — before trusting a gate that reads one file by path,
grep the repository for the identifier it guards. More than one hit is the finding.

**Smell:** a gate that opens a source file by a hard-coded path to read a
constant. `Record<string, string>` where the keys are a closed union that exists
in the same codebase. A gate whose header says it guards "the vocabulary" without
saying which one. Any pair of files that legitimately need the same name for the
same idea about different sets.

**Quietkeep 3.23.29, 2026-09-11.** `tools/reasons.mjs` exists because seven push
sites once wrote their own warrant literals and two had independently written the
same sentence. It reads `src/nextup.ts`, takes `NextUpReason` apart, and proves
`REASON_WORDS` total over it — the compiler enforces the same thing, and the gate
says so out loud precisely because a `Record<K, V>` stops being total when the key
type widens.

**There are two `REASON_WORDS`.** The other is in `src/ui/work.ts`, keyed on
`CoverReason` from the write gate, and it supplies the count lines on the one
surface in that app whose entire stated purpose is being checkable from the
outside by a reader who does not trust it. It was ungated for its whole life, and
typed `Record<string, string>`, so the compiler had nothing to say either.

**Measured by planting, not by reading.** A new `CoverReason` was added and its
words deliberately omitted: every check in the gate passed, and the sheet would
have rendered `undefined` beside a count. The second plant — widening the key back
to `string` — is the one that says why the type alone is not enough.

**The shape.** §243 is the same disease in its two-gates form: two lists for one
idea, and neither was right. This is the one-gate form, which is harder to see,
because the gate's name and its docblock both describe the WHOLE idea while its
`readFileSync` describes half. A gate that names a concept and opens one file is
making a claim about the repository it has not checked — and the half it does
check is, by the usual luck, the half somebody was already thinking about.
