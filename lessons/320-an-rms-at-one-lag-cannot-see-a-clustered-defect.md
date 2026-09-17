## 320 · An RMS at one lag over a whole population cannot see a clustered defect, and it reports the defect as absent

**Enforced by:** GATE `harness-side made-to-fail line` — a comparison harness
prints, before its own results, the one ratio it MUST reproduce from something
already known (a report, a screenshot, an earlier figure) and refuses its own
output when that ratio is not there. · CHECKLIST sweep-the-lag-and-report-the-tail
— when a defect is a PATCH rather than a grain, a residual is measured at several
lags spanning the patch size, the sub-population the report points at is measured
separately, and the 95th percentile is printed beside the mean. · JUDGEMENT — a
rejection is only ever as good as the instrument that made it, so a candidate
rejected by a statistic later shown to be blind is not rejected.

**Smell:** a measured ratio far smaller than the one a person can see. A
statistic averaged over a large population when the report named a small part of
it ("the top of the sky", "around the tree"). A neighbour-difference residual
whose lag was chosen without measuring how big the artefact actually is. An RMS
standing alone, with no percentile beside it, on a defect described as patchy,
blotchy, mottled or splotchy — all four words mean CLUSTERED, and clustering is
the one thing a mean is built to hide.

**Measured 2026-09-17, Jefferson-Photography-Studio.**

Two screenshots of one frame under two looks: one sky smooth, the other covered
in coarse coloured blobs. A harness was built to decompose the difference — the
right question, with the previous day's lesson (§319) applied, measuring CHROMA
rather than luminance because the artefact is coloured.

**It came back 1.13x.** Pink IR 9.26, Aerochrome 10.48, on a defect anybody
could see at a glance. The harness's own made-to-fail line refused the run and
every row under it.

**Two errors, and neither was about colour.**

PLACE. The statistic averaged 652,339 sky pixels. The blobs live in the darkest,
most saturated third of the sky and fade downward, so two-thirds of the
population was clean and diluted the third that was not. Splitting the same sky
into brightness thirds and reporting the dark one moved the ratio on its own.

SCALE. The residual was taken against neighbours FOUR pixels away. Rendered at
1:1 the blobs are ten to twenty-five pixels across, so both the pixel and its
"neighbour" sit inside the same blob and a patch of uniformly wrong colour
reads as no residual at all. Sweeping the lag to 12, 24 and 48 found the peak at
12 — which is the blob size, measured rather than assumed.

Fixing both, with the 95th percentile printed beside the RMS: **2.03x**, and the
same decomposition then isolated the cause in one run.

**The expensive part is what the blind statistic had already been used for.**
Four earlier candidate fixes for a related artefact in the same repository were
rejected on a figure of the same construction, and one of those rejections was
written into the research file as settled. A statistic that cannot see the defect
does not report "inconclusive" — it reports the remedy as not working. Every one
of those candidates had to be put back on the table.

**And the cheap part is the line that caught it.** The gate was six lines at the
top of the harness's own output: state the ratio the instrument must reproduce
from something already known, print it, and say in words that nothing below is
trustworthy if it is not there. It cost nothing and it refused a table of eight
confident wrong rows — including one that would have exonerated a change made
the day before.
