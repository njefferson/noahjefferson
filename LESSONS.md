# Cross-app lessons

Things that turned out to be true, cost real time to find out, and are **not
specific to one app**. Every session on any of Noah's apps should read this
alongside [`DOCTRINE.md`](DOCTRINE.md).

**The difference between the two files:** the Doctrine says what you must do.
This says what has actually gone wrong, with the numbers, so it does not go
wrong again somewhere else. A rule you can restate without knowing why it exists
is a rule that gets waived by whoever is in a hurry.

**This file is append-only in spirit.** Sharpen an entry when new evidence comes
in; do not delete one because it feels obvious now. It felt obvious the second
time too.

**How to add one.** A lesson earns a place here when it is *transferable* — it
would have saved time in a different app, not just a different file. Give it a
one-line rule you could shout across a room, then the concrete evidence: real
numbers, the real symptom, the app and date. A lesson without evidence is an
opinion, and opinions are what this file exists to replace.

> A repo may also keep its own `LESSONS.md` for **stack contract** detail —
> build, deploy and vendor conventions specific to that codebase (photo-pointer
> has one). That is a different document. This is the shared one.

---

## 1. Reading data honestly

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

## 2. Statistics that are right and useless

**The correct arithmetic can answer the wrong question.** The median day-of-year
across every "in flower" record put California poppy at 25 June in the Sierra
foothills, where it peaks in early April. The median of a March-to-August season
genuinely is late June. It is also a date that sends someone to an empty
hillside. Before shipping a statistic, say out loud what a reader will *do* with
it, and check the number answers that.
*(photo-pointer, 2026-07-27 — replaced with the busiest fortnight.)*

**Put the threshold on the thing you are claiming.** "Enough observations to
publish a date" was counting a species' entire season, so Pacific dogwood got
dated 2 February off six sightings and Fremont cottonwood off three — dates
printed on cards with almost nothing behind them. The bar belongs on the window
being named, not on the neighbourhood it sits in.
*(photo-pointer, 2026-07-27 — 24 dated species became 18, and the 18 are right.)*

**Show the denominator.** A card that says "41 of 313 records fall in this
fortnight" lets the reader see a diffuse season as diffuse. A card that says
only "early November" reads as a promise.

## 3. Asking a service for something

**Read the service's published policy before writing the client, and make it a
gate.** Wikimedia's API:Etiquette asks for a total concurrency of at most 1 and
at least a second between requests. Four concurrent at 120 ms had been running
for weeks, which is why the throttling happened — the service was asking us to
stop and we read it as a performance problem. Prose in a contributing guide
loses to whoever is in a hurry; a CI check does not. Every networked adapter now
declares the policy URL it operates under and what it actually does, and the
build fails if the second is looser than the first.
*(photo-pointer, 2026-07-26. The gate immediately found four more adapters
ignoring `Retry-After`.)*

**Retrying on a different server is not a retry — it is moving your load onto
someone else.** A client cycled three Overpass mirrors three times before giving
up: nine requests for one query. MEASURED over one afternoon: 11 map tiles
answered in 3–14 seconds (median 5), and 8 took 86–739 seconds — and that extra
time was not the service computing, it was the retry loop failing, sleeping, and
asking the next volunteer the same question. One tile spent 333 seconds to be
told there was nothing there. A 504 from an overloaded server means "this is too
much right now"; the honest answer is to stop, not to go and ask the neighbours,
especially when three of them are all the public capacity there is. **One host
per run, never on failure. Two attempts, not nine.**
*(photo-pointer, 2026-07-27 — roughly fifty pointless requests before the owner
asked "make sure you are not hammering them and making it worse". He was right.)*

**Know when to go away.** When several requests in a row fail, the considerate
response is to abandon the run — not to grind through the remaining work proving
the service is down. The right moment to walk away was the second tile; instead
it spent 45 minutes to be cancelled anyway. A circuit breaker after N
consecutive failures took the worst case from ~250 failed requests to 6. And a
run that gives up must write NOTHING, so a partial sweep can never be mistaken
for the whole picture.
*(photo-pointer, 2026-07-27.)*

**Keep what they already gave you.** A run that fails part-way must not make the
next attempt re-fetch everything — that asks a service you have just decided is
struggling to redo work it already did for you. Cache what answered, with a
timestamp, and ask only for what is missing. This is the same rule twice now:
the Commons sweep learned it after re-probing 205 places to be told what it
already knew.
*(photo-pointer, 2026-07-26 and again 2026-07-27.)*

**Say who you are, accurately.** Two client identities had drifted — one claimed
version 1.15 while the app was 1.20, the other claimed 0.1 — so an operator
looking at a spike in their logs could not have told which build of ours caused
it, even though both carried a contact URL. A User-Agent that is stale is barely
better than an anonymous one. Derive it from the version the app actually ships.
*(photo-pointer, 2026-07-27.)*

**The gentler run got the better answer.** Dropping concurrency and adding a
delay did not cost coverage — it went from 32 tagged places and 336 photos to 51
and 882, with zero failures. When the instinct is to retry harder, try retrying
slower first.
*(photo-pointer, 2026-07-26.)*

**Ask once for what you can keep.** A whole 195-request re-harvest was needed
only because the workflow committed `data/` and silently discarded the
coordinates it had just fetched into `ingest/inputs/`. Someone else's bandwidth
paid for a `git add` line.
*(photo-pointer, 2026-07-27.)*

**Discover what a service publishes about itself; do not hard-code it.** Three
separate times, hand-written tables of a service's own vocabulary went stale or
were incomplete — GNIS splits features across eleven category layers, NRHP field
names vary in case, and PAD-US publishes its own coded-value domains that a
hand-written decode table kept missing (17 designation codes leaked through as
raw jargon). Read the service's metadata at runtime and keep the local table
only as a fallback.
*(photo-pointer, 2026-07-25/26.)*

**Probe candidate endpoints, do not bet on one.** A guessed ArcGIS service URL
returned `SITE_NOT_INITIALIZED` and cost a full runner cycle. Try a list in
order, treat "this site is down" as a reason to try the next one, and allow an
environment variable to pin a known-good one without a code change.
*(photo-pointer, 2026-07-26.)*

**Honour an honour system.** USA-NPN asks callers to identify themselves via a
`request_src` parameter and enforces nothing. Send it anyway. That is the entire
lesson.

## 4. Building a layer

**A discovery pass must survive being run twice.** The photo-density layer
counted *its own pins from the previous run* as prior knowledge. Run two found
its 43 discoveries, decided each was already explained by the pin it had itself
created for it, and committed an empty layer that deleted all 128 from run one.
Anything that finds "what nothing else explains" must exclude its own output
from "everything else" — and the check is simply: run it twice and see if the
second run is a no-op or a deletion.
*(photo-pointer, 2026-07-27.)*

**Never run two writers against the same file.** Two enrichment jobs on the same
region race the same JSON. Rebase-on-push does not save you; a whole-file diff
against another whole-file diff conflicts every time.
*(photo-pointer — a standing rule, broken once on 2026-07-27 and it happened not
to collide, which is luck, not a result.)*

**A wrong label is worse than no pin.** Where a source's own type is generic and
its name says nothing about what a place is, leave it unmapped rather than
guessing. "Girard - 4E17" is a Forest Service trail designator, not a place to
stand.
*(photo-pointer, 2026-07-26.)*

**An unmapped code should stay visible, not be silently dropped.** A raw code
leaking into the interface is ugly and gets found and fixed. A silently swallowed
one never does.
*(photo-pointer, 2026-07-26.)*

**A behaviour-driven layer is also a coverage audit.** Where people demonstrably
go and we know nothing for kilometres around is rarely an obscure place — it is
a place our sources were never asked about. 26 of 43 discoveries landed in cells
holding fewer than five known places, and the cause was structural: the map is a
bounding BOX while the OpenStreetMap ingest is by COUNTY, so everything in the
box outside the named counties had no data at all. Nobody would have found that
by looking at the map; the discoveries found it by falling into the hole.
*(photo-pointer, 2026-07-27.)*

## 5. Verifying

**When a headless repro will not come, measure the data and read the user's
words literally.** A card that "opens, pushes down, then closes" was never
reproduced in the harness across synthetic clicks, real touch taps, forced pans,
and twenty cards left alone. The diagnosis came from two exact phrases — "they
are NOT one pin" and "pushes down" — plus measuring the actual data: two places
353 m apart with scores 0.258 and 0.126. An earlier pass guessed from the same
screenshots and was wrong.
*(photo-pointer, 2026-07-26.)*

**A diagnostic selector that matches decoration reports success falsely.**
Counting `.pin` said the map had markers when it had none, because the legend's
swatches use the same class. Count the thing the framework actually mounts.
*(photo-pointer, 2026-07-26.)*

**An automated accessibility audit can silently decline to check.** Leaflet
popups use CSS transforms, so axe cannot resolve their background and drops
colour-contrast into `incomplete` rather than `violations`. An audit that only
reads `violations` will call blue-on-blue clean. Compute the ratio directly for
anything the audit can't reach.
*(photo-pointer, 2026-07-20 — the popup buttons measured 1.26:1.)*

**A CSS rule you did not write can outrank yours.** `.leaflet-container a` beats
a bare class selector, so a white button colour was silently overridden into
blue text on blue. Specificity, not source order.
*(photo-pointer, 2026-07-20.)*

**Headless browsers run in UTC.** Any time-of-day assertion needs the real
timezone set explicitly or sunset reads as 3:21 AM.

**Small samples of a flaky test prove nothing.** A 3-of-6 versus 1-of-6 reading
looked like a real difference and was noise. Also worth knowing: raising a poll
deadline from 6 s to 15 s made a failure *more* frequent, which ruled out
"timeout" entirely.
*(photo-pointer, 2026-07-26.)*

## 6. Interface

**No fixed size may ignore the space available.** A place card had three
hard-coded sizes computed once at creation time from the window, never from the
map. At 200% text on a small phone the card would not open at all; at 150% it
rendered wider than the map and pushed its own close button off-screen. Raising
text size is equivalent to shrinking the viewport — measure at the moment of
opening, from the container that actually exists.
*(photo-pointer, 2026-07-26. Four of five viewport sizes failed before the fix,
zero after.)*

**A floor must never exceed the space available.** The fix's own minimum width of
160 px inside a 160 px map re-broke the same close button. A guard against small
is a fixed size too.
*(photo-pointer, 2026-07-26.)*

**When a feature is invisible, check the label before moving anything.** Tide
times could not be found because they lived inside a collapsed section labelled
"Tonight & light" — a name that never says "tides". The entire fix was one
string. Restructuring the card instead was wrong, and was correctly called out.
*(photo-pointer, 2026-07-26.)*

**Fix exactly what was reported.** The above is the specific case; the general
rule is that a report of "this label is wrong" is a request to change the label.
Widening it into a redesign is not initiative, it is not listening — and it
destroys working behaviour the reporter never complained about.

**Use the accepted pattern instead of inventing one.** An off-state rendered as
strike-through read as *deleted*, not *off*. The standard filter-chip pattern —
filled when selected, outlined when not, with a tick — communicates it without
being explained.
*(photo-pointer, 2026-07-25. Noah: "Use actual accepted design principles
instead of making shit up.")*

**Meaning must never ride on hue alone**, and at more than a handful of
categories the hues stop being distinguishable anyway. The glyph carries the
meaning; colour reinforces it. See Doctrine §4 — this is a hard gate, not a
preference.
