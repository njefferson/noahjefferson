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

**Bound what the other side pays, not what is convenient for you to count.** A
client split a region into map tiles and capped the tile *count* at 40 — by
doubling the tile *size* until it fit. The cap looked disciplined and was
meaningless: a bigger area produced the same number of requests, each one
heavier. MEASURED across seven regions, work per tile: the region we had tuned
against, 0.11 sq°; the next one, 3.8× that; a statewide region, **58×** — each
of its twelve "tiles" covering twice the entire area we had tested. The service
bills by work, not by request count, so the metric that was capped was the one
nobody was charged for. This is the same error as choosing the wrong unit of
work in the first place: pick the unit the *other side* feels. Fix the size you
know they will answer, let the count be whatever it is, and spend it over more
occasions — and when the honest count comes back absurd (616 tiles), that is the
answer telling you not to run there at all.
*(photo-pointer, 2026-07-28 — caught while about to point a nightly sweep at the
other six regions, one day after apologising for hammering the same service.)*

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

## 7 · Checking whether a name is free

**Ask "is this name taken in software?" — never "is another _X_ called this?"**
A name search scoped to your own product category filters out exactly the
companies that occupy the name. Two searches for a planner called *Perennial*
(`app task planner productivity App Store`) returned nothing and the name was
reported as un-killed. It is held by **three** software companies — Perennial
Labs, Perennial Systems, Perennial Software — and Perennial Labs was already
serving the exact subdomain the app wanted. One unscoped query,
`"Perennial Labs" web development agency`, returned two of the three at once.
The narrow query is a weak probe wearing a thorough one's clothes: it returns a
confident empty result. Run the unscoped *name + software* query FIRST, before
any category query and before the name is shown to anyone.
*(Horizons/planner, 2026-07-28 — Noah found the taken subdomain on his phone in
seconds after the session had put it on his to-do list.)*

**Search results about a topic are not results about a product.** Adding
"trademark class 9" to a name query returns SEO articles explaining trademark
classes. It happened twice in one session and both empty pages read as clean.
One of the names was *Chroma* — Razer Chroma is an entire class 9 ecosystem.
Any name search returning only advice articles is a FAILED probe, not a clear
one. Same shape as the USA-NPN 200-with-an-empty-body: a success response
carrying nothing is a question, not an answer.
*(Horizons/planner, 2026-07-28.)*

**Do not hand over a check a search could have answered.** The unreachable half
of a check does not excuse the reachable half. `perennial.pages.dev` genuinely
could not be loaded — this sandbox's gateway refuses CONNECT to `pages.dev`,
`itunes.apple.com` and `tmsearch.uspto.gov` alike, measured — but the company
occupying it was findable by search the whole time and was never searched for.
Before delegating any step: separate what is blocked from what was merely not
attempted, and attempt the second half. Doctrine §6 allows delegation only after
proving impossibility, and "I assumed it was impossible" is not that proof.
*(Horizons/planner, 2026-07-28 — asserted twice in consecutive turns, the second
time immediately after being corrected for the first.)*

**A list of rejected candidates is a trail, not a proof that the space is
empty.** Thirty-odd names died before *Quietkeep*, and the session read the
growing graveyard as evidence of diminishing returns and advised parking the
search — four times, across four separate turns, unasked. It was wrong on the
facts: the graveyard is what made each later round faster, because every entry
records a *cause of death*, and the causes are themselves design constraints
(collides with our own spec; diagnosis-flavoured; game-UI register; occupied in
class 9). The name that landed came out of a seam the earlier deaths pointed at.
**Write the record so a candidate can be reconsidered, not so the search can be
declared over** — and do not editorialise about when someone should stop. It is
their search.
*(Horizons/planner, 2026-07-28 — Noah: "A graveyard is not evidence that nothing
exists. It is a breadcrumb trail of progress.")*

**Naming bans in a repo's voice rules bind the session, not the owner.** This
repo's doctrine bars military vocabulary in naming. When Noah proposed one
himself, the session cited the ban back at him instead of checking the candidate.
A house style constrains what a session *proposes*; it does not overrule the
person the style belongs to. Check what the owner asks you to check, and if it is
still wrong, say why *on its merits* — *Quest log* died on register (it makes the
user a player character) and on being a literal game-UI panel name, which is a
real answer. The ban was not.
*(Horizons/planner, 2026-07-28.)*

**Say a name out loud before running a single registry check.** *Wynts* passed
npm, GitHub, the App Store, trademark and an internal grep — every check was a
*registry* check — and it sounds like **wince**, which the app's own shame-free
voice rules forbid. No registry catches a collision with an ordinary English
word; only pronunciation does. The check order that came out of it, cheapest and
most-likely-to-kill first: **1. say it aloud** · 2. grep your own spec (this kills
names that collide with your feature vocabulary — *Lens*, *Gauge*, *Alignment*
all died here) · 3. unscoped name+software search · 4. npm and GitHub ·
5. store and trademark searches on the owner's device. Steps 1 and 2 are free and
instant, and were being run last or not at all.
*(Horizons/planner, 2026-07-28 — caught by Noah after the name had already landed
on `staging`; the staging gate contained it and it cost nothing.)*

## 8 · Pinning

**A pin must match the environment it runs in, and a wrong pin is worse than
none — it looks deliberate.** Adding a first-ever `package.json` to the hub, the
session pinned `playwright-core` to a plausible-looking recent version (1.49.1,
which ships chromium revision **1148**) into a sandbox whose only browser is
`/opt/pw-browsers/chromium-1194`. The eight render/audit scripts all launch that
hardcoded `executablePath`, so the pair must match. Finding the right one took
probing four versions' `browsers.json`: 1.54.0→1181, 1.55.0→1187, **1.56.0→1194**,
1.57.0→1200. The version is now recorded in `package.json` **with the reason**,
so the next person changing it knows what it is married to. Introducing a pin is
not the safe half of the job; verifying it against the thing it must match is.
*(hub, 2026-07-28.)*

**A program that never exits, piped, produces no output at all.** `a11y-scan.mjs`
never calls `browser.close()`, and Node block-buffers stdout when it is a pipe —
so `node a11y-scan.mjs | head -30` printed nothing for three minutes and looked
like a hang. Redirected to a file instead, the same run had already produced its
full report. Worse, the empty pipe was used as *evidence* for a specific
diagnosis (a browser protocol mismatch) that was never actually established.
Suspect the instrument BEFORE naming a cause, not after — and when a long-running
process shows no output, redirect to a file before concluding anything about it.
*(hub, 2026-07-28. Same family as the USA-NPN empty body and the Overpass
"cancelled is not zero".)*

**Say a candidate name OUT LOUD before you check a single registry.** A name was
taken all the way to adoption on the strength of five clean checks — npm, GitHub,
the App Store, trademark, and a grep of the app's own spec. Every one of them was
a REGISTRY check, and registries only catch collisions with *products*. The name
was *Wynts*; said aloud it is a near-homophone of **wince**, which for an app
whose stated voice is calm and shame-free is disqualifying. Noah caught it in the
time it took to read it back. The check costs nothing and it runs first now:
say it, say it in a sentence, ask what it rhymes with and what it is one letter
from. A registry cannot hear.
*(planner, 2026-07-28. Fourth name attempt; the previous three died to searches
that were also being run in the wrong order — narrowest and most expensive first,
instead of cheapest and most-likely-to-kill first.)*

**Order your checks by cost times kill-rate, not by how official they feel.** The
same naming exercise ran expensive, authoritative, late-stage checks (trademark
databases, store searches) before free instant ones (say it aloud; grep our own
spec for the word). The free ones killed four candidates between them — *Lens*,
*Gauge*, *Alignment* and *Wynts* — and each would have done so in seconds. An
authoritative check is not a better check if a cheaper one would have answered.
*(planner, 2026-07-28.)*
