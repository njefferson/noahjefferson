## 285 · A comment that names the fix answers the question for everybody after, and a defect under one is invisible twice over

**Enforced by:** JUDGEMENT — when a comment says a pattern is in place ("cached
in a small ring, like X"), READ THE CODE UNDER IT before believing it, and be
most suspicious where the comment names a sibling that really does have the fix.
· CHECKLIST fix-the-family — a defect fixed in one implementation gets every
sibling with the same shape opened in the same session, by grep on the shape and
not on the words.

**Smell:** a doc comment that cites another module's solution. It is written by
whoever copied the structure, at the moment they intended to copy the behaviour.

**Infrared Photography Studio, 2026-09-12.** The denoiser's row cache had been
fixed a week earlier: it used to fill a whole source row the first time any tap
landed on it, which is right for a scan that walks the picture top to bottom and
catastrophic the moment a straighten angle makes it walk a slant — measured at
119 times the work.

The sharpening pass has the same structure and did not get the fix. Its doc
comment read that luma rows were "cached in a small ring, like the denoiser, so
scanning exports stay close to 1x decode cost", directly above a map that filled
every pixel of a row on first touch.

**Measured before touching it:** 2.0 source samples per output pixel scanning row
by row, 4.4 through a crop, **75.6 down a four-degree slant**, 1001 down the
columns. On the real path a 1.9-megapixel crop took 4.8 seconds plain and **207
seconds straightened by four degrees** — 110 seconds a megapixel against 2.6.

**Why the comment is the lesson rather than the numbers.** Two people could have
found this: whoever fixed the denoiser, by opening its siblings; and anyone
wondering why a straightened export was slow, who would have searched for the
known defect, found this file, read the comment, and moved on. The comment did
not merely fail to help — it closed the question. An absent comment leaves a
reader looking at a map and a fill loop.

**And the release that made it ordinary.** The defect had been survivable while
straightening was a manual slider nobody touched. An automatic horizon leveller
shipped two releases before this was measured, which turned an exotic combination
into a default one. A dormant defect's severity is set by the feature that starts
reaching it, and nothing re-runs the old measurements when that feature ships.
