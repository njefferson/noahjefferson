## 1. Reading data honestly

**Enforced by:** CHECKLIST empty-success — every fetch path treats an empty-but-200 response as a failure, not as data.

**A success response carrying nothing is not an answer — it is a question.**
USA-NPN returned HTTP 200 with `[]` twice and it was read as "no records in this
region". Three unrelated mistakes produce that identical shape: a GET where the
service wants a POST form body, a five-year date span where it wants one
calendar year per call, and bounding-box axes swapped. None of them is
distinguishable from a genuinely empty area. Whenever an empty result is
possible, **log the exact request that produced it**, and log the field names of
the first row you do get, so the next zero is evidence instead of a guess.
*(photo-pointer, 2026-07-27 — the fix turned 0 records into 45,222.)*

**A failed probe is a wrong answer wearing a real answer's clothes.** A
throttled request that gets swallowed becomes a place that quietly reports "no
photos nearby." One Wikimedia run reported 32 tagged ghost towns and Bodie —
the most photographed ghost town in California — with nothing. Only Bodie's
absence gave it away. Count failures, **name them in the log**, and refuse to
commit a result with more than a small fraction missing. The refusal fired
immediately on the next run: 84 of 205 failed, all in one alphabetical block,
which is a throttle burst and not 84 places without photographs.
*(photo-pointer, 2026-07-26.)*

**Round numbers in data are not measurements.** 1,785 of 18,185 harvested photo
coordinates sat on an exact tenth of a degree — someone typing roughly where
they were. A tenth of a degree is about eleven kilometres. Clustered, they
became a confident pin in the middle of a field. Real instrument readings almost
never land on a round grid; when a lot of them do, that is the tell.
*(photo-pointer, 2026-07-27.)*

**Count the thing you actually mean.** The densest photo cluster in the region
had 187 files, 160 of them at one identical coordinate — a single upload batch,
geotagged once. File count said "the most photographed place here"; what it
measured was one person having been somewhere. Counting *distinct coordinates a
camera was set down at* measures the claim being made. Show the other number,
just do not let it decide.
*(photo-pointer, 2026-07-27.)*

**A moving camera defeats every "how many separate places" heuristic.** Counting
distinct coordinates was meant to mean "distinct places a camera was set down",
and it does defeat a batch upload geotagged once. It does not defeat a 360 rig
capturing continuously from a vehicle: every frame lands on its own coordinate,
so a stretch of road scored 376 "vantage points" off one person on one
afternoon. The geometry could not tell; the filenames could — those uploads are
named "<token> with Labpano Pilot One", and a second set "with Suzuki Dl1000",
which is somebody photographing from a motorcycle. **When a metric can be
saturated by one actor, find a second, independent field that identifies the
actor** — do not tighten the first metric.
*(photo-pointer, 2026-07-27. This overturned the layer's own headline result
after it had already been reported as good.)*

**"Cancelled" is not "zero".** A workflow that hits its timeout reports as
cancelled, which reads at a glance like a completed run that found nothing. Only
a *successful* run that logged "none found" is a real zero.
*(photo-pointer, 2026-07-25 — Overpass mirrors overloaded; a re-dispatch half an
hour later worked fine.)*
