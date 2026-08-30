## 187 · A cap applied across two populations hides the one the feature exists to surface

**Enforced by:** JUDGEMENT — no gate can know which of the rows in a list is the
one a control was built to reveal. · CHECKLIST tag-the-origin — when a list is
assembled from more than one source, every row carries which source it came
from, and every ranking, cap, dedupe and sort is written against that tag rather
than against the merged list. · CHECKLIST test-the-new-row — a feature that finds
something new is tested with a new thing to find, in a list already full.

**Smell:** `.slice(0, N)` or a `sort` applied AFTER a `concat`. Also: a feature
that worked when the app knew little and stopped working once it knew a lot —
the classic shape is a cache, a bake, or a seed list that grew. Also: a button
labelled "find more" whose result is a list that already had plenty.

Thalweg's tide-station picker kept the nearest ten stations, sorted by distance
from the river's centre. That was correct while the app knew four stations and
the button that asks NOAA for the rest was the only way any others appeared.

Then the whole list was baked into the build — 61 stations instead of 4. Every
one of them is nearer the river's centre than the sort cared about, so the ten
kept were ten baked ones. **Anything the button found was ranked out before it
could be offered.** The button still ran, still reported what it had found, still
stored it; the reader would never see it in the picker. The one row the control
exists to produce was the only row the cap was guaranteed to drop, because it is
the only row with no reason to be near the top of a distance sort.

**The cap was not wrong and the sort was not wrong.** Both are right for the
population they were written for. The defect is that they were applied to a
merged list, after a `concat` had erased which rows came from where. Ten of
sixty-one is a sensible bound; ten of sixty-one *including the one new one* is a
different requirement, and nothing in the code said so.

The fix is three lines and is not a bigger cap: rows carry an `origin`, the new
ones are separated out before the cap, and only what was already known is
ranked and truncated.

    var fresh = rest.filter(function(f){ return f.origin === 'new'; });
    var known = rest.filter(function(f){ return f.origin !== 'new'; }).slice(0, 10);
    var stations = declared.concat(fresh, known);

**Why this is worth a lesson rather than a code comment.** Every app in this
family is offline-first, and offline-first means shipping data with the build —
a baked list, a precached index, a seeded catalogue. Each of those turns a small
population into a large one, under code written when it was small, and **the
thing that breaks is not the data path but the discovery path beside it**. The
list looks right. The count looks right. What is missing is a row that has never
existed yet, which is why nothing before it going in ever failed.

This is 182's sibling — a feature that cannot be found reads as missing — with
the finding done by the code rather than the reader.
