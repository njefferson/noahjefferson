## 292 · A comment saying two code paths do the same thing is not a measurement, and the path nobody compared is the wrong one

**Enforced by:** CHECKLIST compare-the-outputs — when a second path is built for
something the product already does, the first check is the two OUTPUTS against
each other, before any behaviour is added on top. · JUDGEMENT — where two
implementations of one idea exist and must agree, deleting one is the fix;
aligning them is a promise to keep aligning them.

**Smell:** a function whose comment claims parity with another ("the same
automatics an open applies", "matches the preview"). Any "batch", "bulk",
"headless" or "server-side" twin of an interactive path.

**Measured 2026-09-14, Jefferson-Photography-Studio.**

Exporting a set of picked photographs was built on the function the app's batch
mode already used to work out how a photo develops. That function's own comment
says it applies the same automatics opening a photo applies, and it was written
by somebody who had just fixed it to be closer.

Against the same photograph opened and exported by hand it came out **43 of 255
on the worst channel and 6 on the mean** — a visibly different picture. The cause
was one parameter: the batch path sets the channel swap from the chosen look,
while an open leaves the running value, which defaults on for a raw. Everything
else agreed, which is what made the comment feel true.

**The fix was not to align the two.** One description of "export the photo that
is open" is now built once and used by both the export button and the bulk run,
and the bulk run OPENS each photo through the app's own path rather than
computing what opening it would do. Byte-identical then holds by construction
rather than by vigilance, and the check that proves it compares the two files.

The general shape: a second implementation written to match a first is correct on
the day it is written and drifts from then on, silently, because nothing compares
them. If two paths must produce the same bytes, make them the same path.
