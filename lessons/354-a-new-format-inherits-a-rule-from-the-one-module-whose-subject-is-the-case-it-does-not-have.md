## 354 · A new format inherits a rule from the one module whose whole subject is the case the new format does not have — and inherits the prose with it, so the limit gets written down twice as though it had been decided

**Enforced by:** CHECKLIST rule-inherited-from-where — when a new writer reuses a
predicate from an existing one, name in a comment WHICH QUESTION that predicate
answers, not what it returns. A predicate named for its verdict (`canTravel`,
`isValid`, `isSafe`) carries no trace of the case it was written for. Where the
new caller does not have that case, the inheritance is a defect and its prose is
what makes the defect look considered.
**Enforced by:** GATE — `Jefferson-Photography-Studio:tools/keep-walk.mjs`, which
paints a real stroke, saves, reopens and reads the selection's coverage back off
the app's own rendered matte. A container round-trip cannot see this: the bytes
it was handed came back exactly, and they were the wrong bytes.
**Enforced by:** CHECKLIST typed-array-through-json — before storing anything as
JSON, list every typed array reachable from it. `JSON.stringify(new
Float32Array([1,2]))` is `{"0":1,"1":2}`: an object with no `length`, which any
loop reading `.length` treats as empty and skips in silence.

**Measured 2026-09-22 in Jefferson-Photography-Studio.** A new archive format
carried a photograph's original bytes beside the edit made of it. It filtered
its masks through a predicate borrowed from the app's mask LIBRARY — a feature
that saves a mask to reuse on OTHER photographs, where a painted bitmap is
meaningless because pixels painted on one frame are wrong on the next.

**The new format has no other photograph.** It carries this one, byte for byte,
so those pixels are exactly right for it forever. The borrowed rule was correct
in the module it came from and could not have been correct here — and the same
reasoning had been extended, by hand, to the warp field and the imported colour
lattice. Every painted selection, the warp and the LUT were dropped from every
saved edit.

## What made it survive review

**The prose came with the predicate.** The library's own header explains, well
and at length, why a bitmap must not be stored — and that explanation was
paraphrased into the new format's comments, then into the decision record, which
listed the three losses as a LIMIT and moved on to how to announce it to the
reader. By the time anyone read it, the constraint had been written down three
times and argued for once, in a file about something else.

The record's next action was a caveat dialog: new reader-facing copy, an
accessibility pass, a modal on the primary save flow. **An accepted loss grows
work.** The argument had moved from whether the data should be dropped to how to
phrase the dropping, and nothing in the artefacts pointed back at the first
question.

**No size argument existed either.** The bitmaps are capped at 384px on the
longer edge — about 147 KB against a 28 MB raw — and unlike the raw they
compress.

## What the instruments said

**The container's own round-trip was green throughout, and honestly so.** It
asserted that every byte handed to the writer came back from the reader,
byte-identical, with damage refused. That is true and it is the wrong question:
the writer was handed the wrong bytes. A format test that starts at the
serialiser can only ever check that the serialiser is consistent.

**The walk that found it renders.** It paints a stroke with a real pointer drag,
saves through the real share-sheet path, picks the file back through the real
picker and measures the selection's coverage off the canvas — 22.09% before,
22.09% after. Planted with an all-zero bitmap of the correct LENGTH, the
container check stays green and the walk reads zero coverage, which is the exact
shape of the defect: a restored selection that selects nothing looks like the
edit surviving.

## The second defect, found by writing the first one down

The same edit stored hand-correction strokes, and a stroke's points were a
`Float32Array`. `JSON.stringify` renders that as `{"0":…,"1":…}` — no `length` —
so the replay loop read every stroke as zero dabs and skipped it. **Every hand
correction had been lost on every reopen since the format existed**, silently,
while the selection itself came back: the result looked merely imprecise rather
than incomplete, which is why nobody chased it.

It was not found by a test. It was found while auditing what else in the same
object was a typed array, which is the question the checklist above exists to
force.

## The shape, for other apps

Two predicates decide the same-sounding thing in different places, and their
names describe the ANSWER rather than the question: *can this travel*, *is this
valid*, *is this safe*. One is about portability across subjects; the other is
about identity with one subject. They are opposites, and the second one is
almost always the newer code.

The tell is a comment in the new module that explains the rule by describing the
old module's situation. When that appears, the rule was not decided — it was
copied, and its justification travelled with it and now reads like analysis.
