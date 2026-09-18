## 327 · A reader's failure is a search term before it is a measurement, and an instrument on the reader's side of the screen comes before the fix

**Enforced by:** GATE Jefferson-Photography-Studio:tools/mask-truth-walk.mjs
— the reader's Sky mask read from the reader's side: its true coverage
solved from the app's own overlay, held against the sky by colour, reported
as coverage at the edge, coverage of open sky, uncovered share and spill,
with the first build it ran on red by design (§11e's stop-and-look, applied
to the report rather than to the fix). · JUDGEMENT — when a defect arrives
in a product term (a mask that leaks, a selection with gaps, a control that
does not reach), the first act is one search for how the field names and
fixes that term, and the second is a measurement of the defect as the
reader sees it; only then the remedy.

**Smell:** a reader's report answered from the pipeline's vocabulary ("the
refinement's radius", "the seed") rather than the field's ("intersect with
a colour range"); a family of instruments that all read population MEANS on
a stage while the reported defect is a shape at an edge; a defect visible
on a rendered sheet, reported as an observation and not chased; a search
history that names the medium and the film and never the tool the reader
was holding.

**What happened.** A Sky mask on a tablet left a rim of unselected sky round
every object and none between the branches of a tree. The field's fix has a
name and one query finds it: intersect the place mask with a colour range,
which is how Lightroom's own Select Sky is repaired for halos and gaps in
trees and how darktable combines a drawn mask with a parametric one. The
app already carried both halves — a sky bitmap and a chroma key — and had
for months. Nothing here had asked the question, because every sky
instrument in the repository measured the look's stages by population means:
a rim along a roofline moved a mean, sky missed between twigs did not, and
the mask itself, the thing the reader holds, was read by no instrument at
all. The same rim had been visible on a rendered sheet the day before and
was written up as an observation. The searches run that week were for the
film, the depth and the contamination; none for the tool in the reader's
hand.

**Why it is easy.** A session that owns the pipeline hears a report in the
pipeline's terms and reaches for the nearest stage, where its instruments
already are. The reader's term is the field's term, and the field has
usually already solved it, in words a search returns. And a measurement is
easier to build on a quantity the code already exposes than on the thing
the reader sees, so the instruments cluster where the code is convenient and
not where the defect is.

**The rule.** When a defect is reported in a product term: one search for
how the field names and fixes that term, before any diagnosis from the
code; then an instrument that reads the defect from the reader's side, made
to fail on the build it is written against; then the remedy, whose
acceptance is that instrument going green. The instrument that would have
shown this one solves the mask's true coverage from the app's own overlay
and holds it against the sky by colour, and it read a 45–77% coverage at the
edges of the sky on the day it was written.

**The cost.** The fix was known to the field, one query away, and reached
the record from a screenshot; three instruments had been built on the
adjacent stages first.
