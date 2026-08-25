## 125 · Three gates in one day read commented-out markup as markup, and the third had 7.5KB of prose between it and the tag it was looking for

**Enforced by:** CHECKLIST strip-before-offset — any gate that finds an element
by searching an HTML file for `<tag` or `id="x"` blanks comments FIRST, before
the search, not after the slice. · GATE quietkeep:tools/plain.mjs — its
non-empty guard is what surfaced the third one, in the same run that introduced
it.

An HTML file that explains itself is mostly explanation. Quietkeep's
`public/index.html` carries a paragraph of reasoning above most elements, and
those paragraphs quote the markup they are about. Three separate gates searched
that file for a tag or an id and got prose:

- `controls.mjs` builds a landmark stack by matching `<section …>`. A comment
  quoting `<section id="held">` pushed a region that never opened and never
  popped, so **every control after it reported the wrong region** — and the gate
  correctly demanded a release note for a move that had not happened. Its own
  header already confesses two earlier bugs in that same function, both of which
  "produced a confident wrong answer rather than an error". This was the third.
- `narrows-check.mjs` had it **on its first run**, from the comment written to
  explain the fix it was shipping with.
- `plain.mjs` sliced `<main>` out of the raw file. The first `<main` in that
  file is in a comment, **7.5KB before the real one**, so the slice was prose
  and the region list came back EMPTY.

**Two of the three would have been silently wrong; the third was caught by a
guard that exists for exactly that.** `plain.mjs` asserts a minimum count before
iterating — 0 regions found, expected at least 8 — which is §100, a check whose
passing branch is "the feature is absent" measures nothing. Without it the
"every region is declared" loop would have iterated an empty list and reported
green about a surface it never read.

**The fix is ordering, not cleverness.** Blank comments to SPACES rather than
deleting them, so offsets stay offsets and a line number stays a line number,
and do it before any search — including before the slice. `surfaces.mjs` had
done this since it was written; the sentence is one line and its absence is
invisible until the file's prose happens to quote the right tag.

**Why it clusters:** a gate's own explanation is inside the gate's input. The
commit that adds a check is the commit most likely to write a comment quoting
the markup the check is about, so the defect and its trigger arrive together.
Expect it rather than being surprised by it.
