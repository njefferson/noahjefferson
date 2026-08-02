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

## This file is ENFORCED, not just read

Noah, 2026-08-02: *"I thought lessons was a good document, but you don't do
fuck-all with it."* He was right — 2400 lines that every session read and then
ignored, because reading was all the file ever asked for. §14 is the autopsy:
in one build every **gated** rule held and every **prose** rule lost.

So each lesson now has to say how it is enforced. Run it:

```
node lessons-check.mjs               # every lesson declares its enforcement
node lessons-check.mjs --checklist   # the steps no script can do — read at handoff
node pin-check.mjs      --repo ../x  # §8, Doctrine §16.1 — nothing floats on a tag
node handoff-check.mjs  --repo ../x  # §10, §14 — the handoff is a deliverable
```

**Every `## ` section carries an `**Enforced by:**` line**, naming one of:

- **`GATE <repo>:<path>`** — an executable check. `lessons-check.mjs` verifies
  the file EXISTS. A cited gate that is not there is the precise failure §7g and
  Doctrine §4 both describe, so it FAILS rather than reading as coverage.
- **`CHECKLIST <id>`** — a session-time step no script can perform. Printed by
  `--checklist` so it is read at the moment it matters.
- **`JUDGEMENT`** — genuinely not automatable. Must also carry a **`Smell:`**
  line, so the lesson is recognisable when you are standing in it.

**A section with no declaration FAILS.** That is deliberate: it makes the
un-gated lessons countable instead of letting them blend in with the gated ones.
Right now that is 3 judgement calls and 14 checklist items against 6 gate
citations — the honest picture, and the list of what to automate next.

**Adding a lesson?** It does not land without a declaration. If you cannot
gate it, say `CHECKLIST` and give it an id; if you cannot even do that, say
`JUDGEMENT` and write the smell. "Somebody will remember this" is not an option
the file accepts any more.

---

> A repo may also keep its own `LESSONS.md` for **stack contract** detail —
> build, deploy and vendor conventions specific to that codebase (photo-pointer
> has one). That is a different document. This is the shared one.

---

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

## 2. Statistics that are right and useless

**Enforced by:** JUDGEMENT

**Smell:** the arithmetic checks out and nobody asked the question it answers. Say what the number is FOR before computing it.

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

**Enforced by:** GATE photo-pointer:scripts/check-etiquette.mjs · CHECKLIST read-the-policy — cite the published policy before writing or changing any pacing.

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

**Enforced by:** CHECKLIST run-it-twice — any discovery, ingest or migration pass is run twice and the second run's output diffed against the first.

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

**Enforced by:** CHECKLIST literal-words — when a headless repro will not come, measure the data and read the reporter's words literally before theorising.

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

**Enforced by:** GATE hub:a11y-gate.mjs — every page is measured at more than one viewport including the small-phone-at-200%-text case.

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

**A format that does not render is not a format.** Markdown tables were used
repeatedly in Noah's chat replies, and then again in a plan file written for him
to read — after he had already said they do not work. On iPad they do not
display: the reader gets pipes and dashes, and the information inside them is
lost entirely. Every one of those tables was written by a session that could see
it render correctly on its own side, which is the whole failure — the format was
checked against the writer's output instead of the reader's device. **Check the
format against the reader's device, not your own.** The fix costs nothing: a
headed list carries the same content and renders everywhere. Same shape as the
fixed-size place card that would not open at 200% text — it looked fine where it
was built and was unusable where it was read.
*(Hub, 2026-07-29. The rule is Doctrine §2.)*

## 7 · Checking whether a name is free

**Enforced by:** CHECKLIST name-search — search the name as software, not as a member of its own category, before proposing it.

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

## 7b · Gates you never watched

**Enforced by:** CHECKLIST watch-the-gate — after pushing, READ the CI run. A workflow that exits 0 is not evidence a step ran; a skipped step exits 0 too.

**Running the command locally is not the same as watching the gate.** Quietkeep's
CI workflow failed on **all four of its runs, every run since it was created**,
always on the first step — `npm ci` died with `EJSONPARSE` because `package.json`
had unescaped double quotes inside a script string. Meanwhile every session
verified the same code by invoking the tools *directly*
(`node --experimental-strip-types --test …`, `npx tsc --noEmit`), which bypass
`package.json` and pass. So the local check was green, the CI check was red, and a
commit message reading *"Verified: 14/14 tests, tsc clean"* sat on a SHA with a
failing run attached. Every statement was individually true and the picture they
painted was false.

Three things fall out of it, all cheap:

- **If you cite a workflow as verification, open the run.** A gate nobody has
  watched pass is a file, not a gate — the same finding as the accessibility gate
  that had no `process.exit` in it, in a second place.
- **Exercise the entry point CI uses, not a shortcut around it.** `npm run test`
  and `node --test …` are not the same command; only one of them parses
  `package.json`.
- **`package.json` is executable configuration — validate it.**
  `python3 -c "import json;json.load(open('package.json'))"` costs nothing and
  catches the whole class.

*(Quietkeep, 2026-07-28 — found only because a rename touched `package.json` and
the failure finally surfaced locally. It had been red for a day.)*

## 7c · Marks, palettes, and what a shape says

**Enforced by:** GATE hub:palette-check.mjs · JUDGEMENT

**Smell:** a mark that reads correctly to you and has never been shown to anyone who uses the audience's own vocabulary.

**Check a mark against the audience's own vocabulary, not only against other
logos.** Two icon candidates for Quietkeep were spirals, and every check run on
them was a *collision* check — does this look like another brand, an app icon, a
loading spinner. All of that passed or was fixable, and I rejected them on
legibility. Noah rejected them on meaning: *"a spiral is the loss of control, and
anxiety laden."* **A spiral is the shape of tightening inward with no way out.**
For an app that exists to meet people at exactly that moment, putting it on the
front door says the app is the feeling rather than the answer to it.

This is the visual form of the *wince* lesson. A lookalike check asks "does this
resemble something else" — a meaning check asks "what does this say to the person
holding it", and only the second one catches this. Any product with a specific
audience has vocabulary like this, verbal and visual; find out what it is before
drawing, not after.

*(Quietkeep, 2026-07-28 — caught by the owner, after a session had rejected the
same two candidates for entirely different and lesser reasons.)*

**"Make it lighter" can be arithmetically impossible, and the arithmetic is worth
running before answering.** A three-tone mark where each step needs 3:1 over the
last needs roughly **9:1 of luminance range end to end**. Asked to lighten a
near-black icon, every naive "lift everything a step" variant failed the second
step at 2.0–2.4:1 — there is no room above a light field. The fix was to
**invert** rather than pale: light field, dark form, bright warm detail. Same
idea, same composition, and it measured *better* — 8.92:1 / 6.48:1 against the
original 3.34:1 / 3.45:1, and it stopped collapsing in grayscale at 32–48px.
Compute the ladder before you reach for the brightness slider, and render the
rejected variants so the choice is visible rather than argued.

*(Quietkeep, 2026-07-28.)*

**Checking is not the same as checking with the right instrument — and a cached
index is the wrong one.** Two sessions running told Noah a repo topic still had a
typo in it. He had fixed it before the first report. The reports were not guesses;
they quoted a GitHub **search** API response, which is a *cached index*, not a read
of current state — and the proof was sitting in the same payload, an `updated_at`
frozen through four subsequent pushes. Nobody looked at it. Meanwhile the direct
`api.github.com/repos/...` endpoint 403s through this sandbox's proxy, so there was
no live read available at all.

Two rules, both cheap:

- **Ask any "current state" response when it last changed**, and check that against
  what you know has happened since. A stale timestamp beside stale data is the
  instrument confessing.
- **When the owner is the only witness, ask clearly and believe the answer.** The
  failure here was not the stale read — it was reporting "read back from the API,
  not assumed" as though it outranked his word. It did not. Doctrine §10 already
  says confirmation *is* the verification; a cache was being smuggled in as a
  second opinion.

*(Quietkeep, 2026-07-28.)*

**A detail visible in a screenshot is not a fact you were told.** Debugging a
site that would not load on Noah's iPad, a session noticed the status bar read
LTE, inferred that earlier failed attempts must have been on Wi-Fi, and wrote
"the likelier cause is a network-level block" into a permanent verification
record as reasoning. **He had been on LTE the entire time, same device, one
network.** The invented variable also crowded out the explanation that actually
fit every observation — both failing URLs were preview deployments on a Pages
project that had no production deployment yet, and the apex worked the moment one
existed.

Screenshots, API responses, and unset environment variables are all
**instruments**. Reading one is not the same as being told something, and the gap
between them is where confident wrong answers come from. If a variable matters to
a diagnosis and the owner has not stated it, **ask — one line — rather than infer
it and build on the inference.** Guessing about someone else's setup and
presenting it as analysis is worse than saying "I don't know why."

*(Quietkeep, 2026-07-28 — the third instance in one day, after a cached search
index reported as current repo state and an unset secret name reported as a
missing secret. Same error, three costumes.)*

## 7d · Green is not a synonym for correct

**Enforced by:** CHECKLIST adversarial-pass — before a boundary widens, run reviewers told to REFUTE one invariant each and write the repro, not the risk.

**A fully green tree is where the worst defects hide, not where they are
absent.** Quietkeep had 18 passing tests, a green CI pipeline with a
type-check, a headless walk of the built app, an accessibility gate, a
contrast gate and a changelog gate — every one passing — and a documentation
set that read as thorough. Five adversarial reviewers, each told to *refute*
one specific claim rather than confirm it, found roughly **35 real code
defects** (including the core event-fold mutating its own base state, so a
rejected write corrupted memory; the no-silent-nodes invariant defeatable
five different ways; and a service worker serving a 503 error page over the
cached app) and **22 false or stale documentation claims** (gates described
in the present tense that did not exist — the same shape as a fake CI gate
found earlier the same day). Nothing here was exotic; all of it was reachable
by ordinary use.

Why the green tree hid it: **tests written by the author encode the author's
model, and the author's model is exactly where the bug lives.** The property
test for "no silent nodes" folded events one at a time — the same wrong mental
model as the gate it was testing — so both agreed, and both were wrong. A test
suite proves the code does what its author expected; it cannot prove the
expectation was right.

The move that worked, and is worth repeating on anything load-bearing before
it ships: **spawn independent reviewers, give each ONE invariant, and tell
them to break it — write the repro, not describe the risk.** Adversarial
framing ("refute this") finds what confirmatory framing ("check this") cannot,
because the second is satisfied by the first passing example and the first is
not satisfied until it has genuinely failed to break the claim. Cost was real
(five agents, deep work) and it was cheap against shipping any one of the
severe findings to the person the app is for.

Corollary, learned the same run: **do the audit at the right moment.** It was
gated to run after the write-path was built and *before* the first public
input surface (a URL capture endpoint) shipped — so the fixes landed on the
last safe tree rather than being retrofitted under a live attack surface. An
audit is worth most just before a boundary widens, not after.

*(Quietkeep, 2026-07-28 — every finding reproduced with a runnable script
before it was believed, and pinned with a regression test before it was
called fixed.)*

## 7e · The comment that made the bug sound principled

**Enforced by:** JUDGEMENT

**Smell:** a comment that ARGUES for the design rather than describing it. A rationale is a claim; check the claim, not the prose.

**A comment stating a rationale is a claim, and an unverified one costs more
than no comment at all — because it stops the next reader checking.** Quietkeep's
sync driver ran every arriving event back through the app's write boundary, under
a comment reading *"an event over a wire is still an event; law 1 is enforced on
them exactly as on a keystroke."* That sentence is why the design survived
several passes: it sounds like the careful choice, and each reader in turn
declined to re-examine something already argued.

It was wrong, and the repo already contained the right answer — the import
button's "take in what I don't have" had solved the identical problem correctly
months earlier. **Another device's log is already-gated history**: the boundary
ran on the device that wrote it, and its repairs are in the log beside the
events that needed them. Re-running the boundary on history

- writes a SECOND repair carrying the same derived id as the one already there —
  not rejected, just written, and then refused by the store's unique index at the
  append, so the failure surfaces a layer away from its cause;
- refuses the same shard delivered twice, as a creation landing on a node that
  already exists, which is the ordinary case for anyone using two devices;
- refuses anything whose subject is still in the next chunk — a re-parenting, a
  dependency, a rename — which over a wire is not an error but a Tuesday.

Three lessons, in increasing order of how much time they save.

**Search for prior art by the SHAPE of the problem, not by its vocabulary.** The
correct implementation was not found by reading about "sync"; it was found by
asking who else in the codebase takes in events this device did not write. Two
features can be the same operation arriving by different roads — a file on a
memory stick and a chunk from a relay are both another device's shard — and the
second one written should share the first one's code, not re-derive it worse.

**Verify the failure before you write down the reason for it.** The first draft
of the fix carried its own confident rationale: that the boundary refuses a
creation naming an absent parent. It does not — it repairs it. Every reason above
is now asserted against the real boundary in the test file *before* the test
asserts the fix survives it, so the argument cannot quietly stop being about
anything. Writing "prove it breaks first" as an assertion, not a belief, is what
caught it.

**A hook every caller passes the identity function to is a lie in the type
signature.** The parameter's own docstring claimed it ran the gate while every
call site passed `events => [...events]`. Deleting it was the fix; keeping it
"for flexibility" would have preserved the false claim in the one place a reader
is most likely to trust it.

*(Quietkeep, 2026-07-30. The same commit fixed a second defect of the same
family: identity on the wire was keyed by `device#seq`, but a gate-written repair
deliberately carries its cause's device AND seq so replays stay deterministic —
so the key identified a PAIR, not an event, and silently dropped half of every
capture that crossed. Two tests, red before the fix. Both defects were invisible
to a green tree of 567 passing tests, because nothing had ever run the real data
shape through the real path.)*

## 7f · A security claim is a liability until a test pins it

**Enforced by:** CHECKLIST security-claim — every security sentence in docs or comments names the test that pins it, or it is deleted.

**Three times in two days, a confident security sentence in this codebase was
wrong, and the OWNER caught each one — not a test, not a review.** The pattern is
specific enough to name: a comment or a piece of user-facing copy states a
guarantee that the code *nearly* provides, rounded up to the clean version.

The three, in order:
- *"The relay is handed the sealed body and nothing more."* True of the request
  BODY; false of the transport, which still exposes the sync id, IP, size and
  timing.
- *"[The compression-oracle] channel does not exist here — the relay cannot put
  events into somebody's log."* The first clause is true and the conclusion is
  not: a `?text=` capture endpoint is exactly an injection leg, so the channel
  exists and needed padding to close.
- *"[The relay] deliberately cannot tell how MUCH you sync."* Padding blurs a
  size into a bucket, so it defeats the fine-grained oracle — but a bigger
  planner is still visibly bigger (more chunks, larger buckets), so "cannot tell
  how much" overstates it.

Each was found by an adversarial audit or by the owner reading the words, never
by the 600-plus passing tests — **because a prose claim has nothing asserting it.**
The code did roughly what the sentence said, so nothing failed; the gap was
between "roughly" and the absolute the sentence promised, and only a human
comparing the sentence to the threat model saw it.

**The rule that falls out: a security guarantee stated in a comment or in UI copy
is not done until a test pins the exact wording to the exact property.** Quietkeep
now does this — `test/seal.test.ts` asserts a wrong key and a matching-guess
produce identical sizes; `test/devices.test.ts` asserts the key-replacement copy
states the backlog window and does NOT claim an instant total cut-off;
`test/security.test.ts` greps the security page for procedural leakage AND for
each overclaimed absolute. A claim with a test behind it is a guarantee; a claim
without one is a hope with good grammar.

**Corollary on who to trust.** The model wrote all three wrong sentences and was
confident in each. The owner, reading them against what he understood the system
to do, was right every time. When a non-expert says *"I don't believe your
security assurances"*, that is not a knowledge gap to reassure away — it is the
most reliable detector in the room, and the correct response is an adversarial
re-audit that treats the model's own prior claims as the prime suspects.

*(Quietkeep, 2026-07-30 — pre-promote audit, 13-agent adversarial pass. The
crypto, cross-household isolation, replay integrity and XSS posture were attacked
and HELD; every finding that survived verification was an honesty overclaim or a
copy correction, not an exploit. The hold-to-promote was for the words, not the
walls.)*

## 7g · A check that cannot fail

**Enforced by:** CHECKLIST plant-the-fault — every gate is made to go RED on purpose before it is trusted, and the mutation is recorded.

**Plant the fault. A check you have never seen go red is not evidence, and it
is indistinguishable from a check that works.** Intersecting Parallels shipped a
roof — inclined planes, a new kind of vanishing point — with a headless check
reading *"and Solid shades the roof planes as well as the walls — ok"*. It had
been green from the moment it was written. Deleting **an entire roof plane** did
not move it: the check counted the TOTAL shaded pixels on the canvas, and the
two walls alone (42,939px) cleared its threshold of 500 without the roof
contributing anything. Planting that deletion is what exposed it, and underneath
it was a real defect that had shipped to `staging` unnoticed — **the roof's
planes were never being drawn at all.** The renderer derived a solid's visible
faces from its top and bottom faces; a roof has neither, so it returned an empty
list every frame. Rewritten to measure the roof's own contribution as a
before-and-after difference, the same check reports 9,081 and 17,944px.

**Then it happened twice more in the same hour, on the check written to cover
the fix.** The rule being asserted was that you only see a roof below your eye
level. Version one compared an overhead house against the wall count measured in
a *different pose* — two poses, so the difference said nothing, and it passed
with the eye-level test removed entirely. Version two fixed the comparison but
put the house so high that the ridge ran off the top of the page, so nothing was
painted whichever way the renderer behaved: it was measuring the edge of the
canvas. Three consecutive versions of one check, none of which could fail, each
written in good faith immediately after the code it was checking.

The distinct failure is not "the test was weak". It is that **a check written
alongside its code inherits the author's framing, so it tends to measure
something ADJACENT to its claim** — total area instead of the new area, one pose
against another, a region that happens to be empty. It then passes forever and
reads, in the log, exactly like proof.

Three things that turn this around, cheap enough to be unconditional:

- **Make it fail on purpose before you believe it.** Break the specific thing it
  names — delete the face, disable the reseat, negate the rule — and watch that
  check and only that check go red. If it stays green, the check is not about
  what its name says.
- **Measure the DIFFERENCE the change makes, not the total afterwards.** A total
  is dominated by whatever was already there. Almost every empty check in this
  family was a total that a pre-existing thing was already satisfying.
- **Assert the fixture, not just the result.** A check whose setup silently puts
  the subject off-screen, off-canvas or out of range proves nothing and says so
  in the same words as a real pass. Make it state that the thing it is about is
  actually there — *every corner above the horizon AND on the page* — so a broken
  fixture fails loudly instead of passing quietly.

This is the practical edge of 7d. Adversarial *reviewers* catch the code the
author's model got wrong; planting catches the **gate** the author's model got
wrong, and it needs no second agent — just the discipline to spend two minutes
breaking your own green.

*(Intersecting Parallels, 2026-08-01 — D54. Also the run where `git checkout
<file>` was used to undo a planted fault on a file whose real work was still
uncommitted, destroying it; the copy taken before planting is what got it back.
Back up before you plant, and never reach for `git checkout` on a dirty file.)*

## 8 · Pinning

**Enforced by:** GATE hub:pin-check.mjs — rejects unpinned GitHub Actions, a missing lockfile, and `npm install` in automation.

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

**Dim text with a token, never with `opacity` — an opacity is invisible to a
contrast gate.** Frame's corner build stamp was `--dim` at `opacity: .65`. The
token pair `--dim` on `--bg` measures 4.79:1, so `contrast-check.mjs` passed it
every single run; what a reader actually saw, once the browser composited that
opacity against the background, was **2.54:1** — a plain WCAG AA failure on the
one element whose entire purpose is being readable in a screenshot. A token-based
gate compares two declared colours. It cannot see `opacity`, and it cannot see a
colour that gets composited at paint time. Photo Pointer hit exactly this in its
1.14.2 (a `--dim` stamp that "photographed as a smudge") and fixed it the same
way. Two apps, same author, same trap, found three days apart — so: if text needs
to be quieter, define a quieter token and add the pair to the gate. Never reach
for `opacity` on text.
*(Frame 3.1.4 / Photo Pointer 1.14.2, 2026-07-28.)*

**A "never re-fix this" entry blesses the PATTERN, not every number in it.**
Studio's audit list records *"look-button state as TEXT (norm/R⇄B) not hue"* as
audited-correct — right call, it is the non-hue channel someone who cannot
separate the colours depends on. It shipped at **8px**. So the accessibility fix
was real and the thing implementing it was too small to read, and the register
entry made it look settled. When a NEVER-CHURN list protects a pattern, check
that the pattern's own parameters still hold up; raising the size finishes that
fix rather than churning it, and saying so explicitly in the register is what
stops the next session reading it as a regression.
*(Studio, 2026-07-28.)*

**A pure unit conversion is provable; a conversion plus a redesign is not.**
Converting ~435 px font sizes to rem across four apps was verifiable to the
element — render every screen before and after, assert every computed size is
identical, then assert they all scale 1.25× at a raised browser default. That
proof only exists because the pass changed *units and nothing else*. The
temptation each time was to fix the 8px and 9px text in the same commit; doing so
would have destroyed the "pixel-identical" gate and left nothing but assertion.
Ship the mechanical change with its proof, then the judgement calls as their own
release with their own reasoning.
*(cross-app px→rem sweep, 2026-07-28.)*

**The session git relay cannot delete a remote branch, and the GitHub MCP has no
tool that can either.** `git push origin --delete <b>` and the equivalent
`git push origin :refs/heads/<b>` both die the same way — *"send-pack: unexpected
disconnect while reading sideband packet / the remote end hung up unexpectedly"* —
then print a misleading `Everything up-to-date`, so a careless read looks like
success. The relay drops the connection on any ref *deletion*; pushes that create
or advance a ref work fine. The GitHub MCP offers `create_branch` and
`list_branches` but nothing to remove one. So deleting a branch is a manual step
for Noah (GitHub → Branches → the bin icon), and it should be handed over as one
rather than retried. Delete the LOCAL branch from the session by all means — that
part works — but verify with `git ls-remote --heads origin` before reporting a
branch gone. This is why stale `claude/*` branches accumulate in every repo.
*(2026-07-28; the same wall was recorded in Frame's CLAUDE.md on 2026-07-18 and
re-hit here, which is the argument for it living in the hub instead.)*

**A scalar field is safe with LWW alone; a mutable field needs three copies or it
aliases history.** Quietkeep's event-sourced fold added `sourceTags: string[]` to
its node state the way it adds scalars — stamp it, last-writer-wins — and shipped
it green. An adversarial audit found it holed copy-on-write in two places at once:
the fold's copy-on-write clone deep-copied the scalars' containers but let the
top-level spread *alias* the array, and the reducer stored the log event's payload
array *by reference*, so a later mutation of live state could rewrite an
"immutable" log event and vice versa. A mutable (array/object) field needs all
three: copy-on-clone, copy-on-store-from-payload, and default-on-deserialise. The
scalars needed none of them, which is exactly why the new field was written as if
it needed none either. When you add the first non-scalar to a reducer that has only
ever held scalars, the whole aliasing discipline is new surface — audit it as such.
*(Quietkeep Phase 2, 2026-07-29.)*

**A single-item test cannot see a bug that needs two, and `Array.sort` is the
classic hiding place.** The same field above also crashed the app on *update*: a
snapshot cut before the field existed deserialised its nodes with the field
`undefined`, and a projection that sorted the inbox by `n.sourceTags.includes(...)`
threw. Every test passed — because every test had one inbox item, and V8's
`Array.sort` skips the comparator entirely for length ≤ 1, so the throwing line
never ran. The crash needed two items. Projections that sort, dedupe, or compare
must be tested with **≥2 elements**, and any "state survives an upgrade" claim must
be tested against a snapshot that is genuinely *missing* the new fields, not one
freshly written by the current code (which can never be missing them). Deserialise
is a migration; migrations are additive-only and must backfill, and the backfill
needs its own made-to-fail-first test.
*(Quietkeep Phase 2, 2026-07-29; found by an adversarial audit run against a fully
green tree — the third time "green is not correct" earned its place at the top of
this file.)*

**`git add -A` is unsafe whenever anything else can write into the working tree —
and during an adversarial audit, something always can.** A Quietkeep release
commit swept up `tools/.pz.mjs`, a probe script an auditing subagent had written
into the repo to test a gate, and pushed it. Nothing referenced it and no gate
noticed, because no gate asks "is every tracked file supposed to be here". The
same session also had to revert an auditor's deliberate `if (false && …)` break
that had been sitting in the tree for eleven minutes after the agent went quiet —
a break which, had it been committed, would have shipped the release's headline
feature silently disabled. Both are the same root cause: **a working tree with
concurrent writers is not a safe thing to stage wholesale.** Stage the paths you
actually changed, and before any release commit, read `git status` as a list of
claims to check rather than a formality to clear. Subagents should write probes to
a scratchpad outside the repo — but assume one will not, because one did.
*(Quietkeep 0.7.1, 2026-07-29.)*

**An allowlist of "what counts" turns adding a category into a silent deletion.**
Quietkeep's calendar export picked entries from `new Set(['ready','soon','later'])`
— the group keys of its todo list. A later release added a fourth group for dates
that had gone by, and every one of those items dropped out of the exported `.ics`
without a word: the single thing a reminder is most *for*, gone, with all eight CI
gates green. The gate that should have caught it compared the file against the
count the UI itself promised, so both sides moved together and neither noticed.
**Two things generalise.** First, the failure directions are not symmetric: an
allowlist that forgets a new category silently loses data, while an exclusion that
forgets one merely includes something it shouldn't — so in any app whose promise is
"nothing is lost", write the rule as *what is excluded*. Second, a consistency check
between two projections of the same source proves they agree, not that either is
right; at least one gate must name a concrete expected item ("the passed date is in
the file") rather than compare two derived numbers.
*(Quietkeep 0.9.0, 2026-07-29.)*

**A test that asserts against the constant the code uses can never fail.**
`assert.equal(view.cards.length, REPLAN_CAP)` looked like it pinned a product law
that says "show at most three". It pinned nothing: change the cap to five and both
sides move together. The same audit found `assert.deepEqual(f(s), f(s))` presented
as an ordering guarantee — true of any pure function, including one that never
sorts — and an assertion that a hardcoded `[]` equals `[]`. **A gate must state the
expected value independently of the implementation**: a literal `3`, an explicit
list in the expected order, a table of inputs to expected strings. If the assertion
would still hold after you delete the mechanism it names, it is decoration. The
cheapest way to find out is to delete the mechanism and watch.
*(Quietkeep 0.9.0, 2026-07-29; four such checks in one feature, found by a subagent
whose only brief was "are these checks theatre".)*

**Words that reach a user need tests as much as logic does.** Three functions that
produced every sentence on a new surface — how long ago a date was, how many there
were, what a card's context said — had *no* coverage in any of eight gates. Each
could be replaced with a constant string and everything stayed green, which means a
card thirteen months behind could read "that date was yesterday", and the count line
could say "One" however many there were. Two reasons they slipped: the tests that
existed asserted `length > 0` plus a denylist of forbidden words, which a single
space satisfies; and the browser walk only ever produced *one* item, so every plural
branch was unreachable. **Table-test user-facing strings against expected values, and
make the end-to-end walk carry at least two of anything that can be counted.**
*(Quietkeep 0.9.0, 2026-07-29.)*

**Restore backups by full path, not by basename.** A script that verified fixes by
breaking them saved `src/replan.ts` and `src/ui/replan.ts` into one scratch
directory. Same basename, so the second `cp` silently overwrote the first, and the
next restore wrote the UI module over the projection module. Nothing warned; the
damage showed up as a cascade of unrelated test failures several steps later. If a
throwaway script backs up more than one file, key the copies by the full path
(`src_ui_replan.ts`), or use `git stash`/a worktree — and when a break-and-restore
loop starts failing in files it never touched, suspect the harness before the code.
*(Quietkeep 0.9.0, 2026-07-29.)*

**Feedback rendered above the control that triggers it reads as "nothing
happened".** Quietkeep's calendar button had a live region directly above it,
which is fine on a short surface. That panel had grown past ten thousand pixels,
so the button was reached by scrolling *down* — and the confirmation then updated
off the top of the reader's view. It had worked correctly for three releases;
the owner reported it as doing nothing at all. **On any surface long enough to
scroll, the confirmation goes BELOW the control**, and the same reasoning applies
to error text, counts, and anything else that answers a press. A related finding
in the same session: the only way to close that panel was beneath every release
note, measured at 10,130px down. If a surface grows without bound, its way out
has to be pinned — and once pinned, check it against WCAG 2.2 **2.4.11 Focus Not
Obscured**, because a sticky header that covers the control you just focused is
its own AA failure. At 200% text on a 320px screen the first version of that
header took **99% of the dialog**.
*(Quietkeep 0.10.1, 2026-07-29; found by the owner on device, not by eight green
CI gates.)*

**`rem` inside a media query resolves against the INITIAL root font size, never
the current one.** A `@media (max-height: 32rem)` threshold written specifically
for a 200%-zoom case silently never matched, because the query evaluated `rem`
at 16px while the page was rendering at 32px. Nothing errors; the rule simply
does not apply, and the layout it was meant to fix stays broken. **Use `px` in
media-query thresholds**, and verify a responsive rule by measuring the element
at the viewport it targets rather than by reading the CSS.
*(Quietkeep 0.10.1, 2026-07-29.)*

**A "replace" that clears before it writes will eventually clear and then fail.**
Quietkeep's import validated a file, called it ready, then ran `reset()` followed
by `append()`. A file with two records sharing an id passed validation — which
never looked at ids — and the append hit the store's unique-id constraint *after*
the clear. The user's real data was gone, replaced by whichever rows happened to
land first, with a raw database error on screen, underneath a shipped patch note
promising that damaged files were refused before anything was touched. **Two
rules.** Validation at a destructive boundary must ask *every question the write
will ask*, not a subset — the storage layer's constraints are part of the
contract. And validation is never enough on its own: make the destructive
operation **atomic** (one transaction, clear-and-refill together), because no
amount of checking can rule out a quota or disk failure halfway through.
*(Quietkeep 0.10.0→0.10.1, 2026-07-29; found by an adversarial audit, rated
CRITICAL, in the feature whose entire purpose was data safety.)*

**Spreading a large discriminated union in TypeScript can hang the compiler.**
`{ ...event, seq: -5 }` in a test, where `AppEvent` is a ~60-member union, took
`tsc --noEmit` from **2 seconds to over three minutes** — no error, no warning,
just a check that never finished, which reads exactly like a hung machine.
`Object.assign({}, base as Record<string, unknown>, over)` sidesteps the
distribution and restores it. **If a typecheck suddenly takes minutes, look for a
spread over a union before you look at your machine.**
*(Quietkeep 0.10.1, 2026-07-29.)*

**A gate that exists only in the CI file is a gate you cannot run.** Quietkeep's
banned-vocabulary check lived as an inline `grep` inside `spine.yml`. Running it
"locally" therefore meant re-typing an approximation of it at a terminal — and
the approximation was wrong, so two consecutive releases were reported green on
all nine gates and both went **red in CI on the tenth**. The failing content was
a source comment that explained a prohibition *by quoting the prohibited word*,
which is a trap the repo's own notes already recorded from an earlier phase; it
recurred because nothing structural stopped it. **Every gate belongs in one
place the developer and CI both invoke** — a package script, a make target, a
committed shell file — with the CI step being a one-line call to it. Two copies
of one rule always drift, and the copy that drifts is the one you type from
memory. The corollary is sharper than "be careful": *"green locally" is a claim
about nothing unless the local thing and the CI thing are the same bytes.*
*(Quietkeep 0.15.0/0.16.0, 2026-07-29 — the same session in which I had written
a commit message criticising a hand-copied constant elsewhere in the codebase.)*

**A projection nobody can reach is a unit test wearing a feature's clothes.**
Quietkeep shipped this shape four separate times: a `parent` field written by the
fold and settable by no control; an interval-setting event with no UI path; a
resume-card tier that ranked **second** in the priority list over a set nothing
could populate; and a project "role" whose documented consequence was never
enforced because the role was never folded. Each looked done — schema present,
fold correct, tests passing — and each did nothing for anyone. **Before calling a
capability built, name the tap that reaches it.** If the answer is a test file, it
is not built. Worse, these are invisible to the usual gates: unit tests pass
because the projection is correct, and end-to-end walks pass because they never
try the path that does not exist.
*(Quietkeep 0.13.0–0.16.0, 2026-07-29.)*

**An exceptions surface must be able to reach zero, and say nothing when it
does.** Quietkeep's review lists only what is structurally broken — a container
with no live work under it, a node whose parent is gone — and when there is
nothing it is **not on the page at all**. No "all clear", no green tick, no
count of zero. The reason is not minimalism: a surface that always renders
something trains you to skim it, and once skimmed it cannot deliver the one
message it exists for. The same rule made the empty state honest rather than
congratulatory — a congratulation is a score, and scores were already banned.
*(Quietkeep 0.13.0, 2026-07-29.)*

**Save the user's context at the moment of interruption, not at the moment of
exit.** Quietkeep's focus feature writes its "here is where you were" card the
instant an interruption is *recorded*, not when the session is *ended*. The
distinction is the whole feature: people do not get to press a button on the way
out of the room, and a design that saves state only on a tidy exit saves it only
in the cases where it was never at risk. The test that proves it writes no
"ended" event at all — it simulates the app being killed — and it is the one test
in that file that a plausible-looking alternative design fails.
*(Quietkeep 0.14.0, 2026-07-29.)*

**Never let a tool grade a third party.** Building a surface for work someone
*else* is doing, every instinct offers a health word — "at risk", "slipping",
amber/red. Each is a judgement about a person, made by software, on evidence it
does not have, and rendered unarguable by being displayed. Quietkeep's portfolio
states only facts joined by middots: who is running it, when an answer is owed,
how many things are outstanding, when anything last moved. The same rule ruled
out any colour keyed to how long someone has had something. **If a product has a
no-shame rule, the place it will first be broken is the screen about somebody who
never agreed to be measured.**
*(Quietkeep 0.16.0, 2026-07-29.)*

**"One concept, two places, one of them checking" is the defect shape to hunt
for first.** An adversarial audit of five Quietkeep releases found four real
bugs, and three were literally the same mistake: a spent resume card was
excluded from the held list but not from the stalled-project check; a let-go
person was filtered out by the function that names who owes you something but
not by the one that names who is running a project; a formula-injection guard
was written for CSV export and not for the Markdown export beside it. In every
case the concept was already understood and written down correctly *somewhere* —
the bug was the second place that had never been told. **When you fix a class of
thing, grep for every other site that asks the same question**, and prefer
collapsing them into one shared predicate over adding a second guard. This is
also the cheapest thing to search for in someone else's code: find any rule
stated in two places and one of them is probably stale.
*(Quietkeep 0.17.1, 2026-07-29.)*

**Free text the user typed will break any document you paste it into.** A
captured item title containing newlines and a `##` turned a Quietkeep status
report into one that read **"Nothing to report."** while reporting real work —
the title ended the bullet list, opened a heading, and contributed a bare line of
its own. The app stores titles verbatim deliberately (a share-target capture
composes title/text/url with newlines, so multi-line titles are *normal*, not
hostile). The lesson is not about escaping one format: **every export path needs
its own guard, and writing one is the moment to write the others.** CSV had a
formula-injection guard already; Markdown, sitting in the same file, had nothing.
The consequence is worse than a rendering blemish — it is a document handed to
another person that says something untrue.
*(Quietkeep 0.17.1, 2026-07-29.)*

**"Since last time" is a question about what you KNEW, not about the clock.**
Quietkeep's status report computed its delta by cutting the log at the timestamp
of the previous report. Correct until data can arrive out of order — then a
sync/import from another device, carrying work stamped *before* your last report,
lands on the already-reported side of the line and is **silently absent from
every report you ever send again**. You had never seen it and had certainly never
told anyone about it. The fix is to record what the reporting device actually
held at the time: a **per-device high-water mark**, which a log-based system
usually has already for sync. Any "what's new since X" feature in a system that
accepts foreign history has this bug until proven otherwise.
*(Quietkeep 0.17.1, 2026-07-29.)*

**A feature that works exactly once is a re-render eating the focus, not a
broken handler.** Intersecting Parallels shipped arrow-key nudge on its
vanishing-point list — press ArrowRight, the point moves 1px. Press it again
and nothing happens, ever. The handler was fine: every edit called a helper
that rebuilt the whole panel, so the focused `<button>` was destroyed and
replaced by an identical-looking one, and the second keypress went to `<body>`.
The keyboard surface the whole accessibility design rested on was, in practice,
a single keystroke. **No unit test can see this, because no unit test has a
focus** — all 38 passed. It was caught by a headless walk driving real key
events, on its first run. Two things generalise: any list that re-renders on
change must update nodes IN PLACE (rebuild only when the SET of items changes),
and the fix is never "restore focus by id afterwards" — that patches the
symptom while leaving a reader's caret position, text selection, and IME state
still being destroyed on every keystroke. Doctrine §14: the frame was the bug.
*(Intersecting Parallels 0.1.0, 2026-07-29.)*

**An accessibility gate pointed at `file://` cannot test an app made of ES
modules — it measures a blank page and passes.** The gate ported from this hub
loaded pages with `pathToFileURL`, which is correct for a static page and
silently wrong for anything with `<script type="module">`: a file:// origin is
opaque, so every import is blocked by CORS and the app never boots. The gate
would have reported an empty shell as clean, in both themes, at both viewports,
forever. It now serves `public/` over HTTP from inside the gate itself — the
same directory wrangler uploads — and waits for the app to actually finish
booting before measuring anything, failing loudly if it does not. Same family
as the throttled probe reported as "no photos nearby": **an instrument that
cannot reach the thing it is measuring returns a confident pass.** While fixing
it, the same gate gained the app's DIALOGS as scanned surfaces; a closed
`<dialog>` is invisible to axe, so three of the app's four surfaces had been
outside the gate without anyone choosing that.
*(Intersecting Parallels 0.1.0, 2026-07-29.)*

**`actions/upload-artifact` silently skips dot-directories, so the evidence you
collect for failures is missing exactly when you need it.** The app walk writes
screenshots to `.walk-shots/` and uploads them, so a failed CI run shows what
the app looked like at each step. The first run uploaded nothing: v4 excludes
hidden paths unless `include-hidden-files: true`, and it reports that as a
warning in a green run — which nobody reads, because the run was green. The
first time anyone would have noticed is a red run with no pictures attached.
Set `include-hidden-files: true` AND `if-no-files-found: error`, so a missing
artifact fails its own step rather than waiting to disappoint you later. The
general rule: **a diagnostic that only matters on failure must be verified on a
success**, or it is not there at all.
*(Intersecting Parallels 0.1.0, 2026-07-29.)*

**A topological solve written the obvious way is O(n²), and the cost only
appears at the scale the spec actually names.** The perspective solver
re-resolves every constructed point whenever a vanishing point moves. Written
as "a set of pending dependencies per point, rescanned until nothing moves,
with a linear lookup by id inside the loop", it measured 37.2ms per solve+frame
at the 2,000 edges the spec's own acceptance test asks for — against a 16ms
frame — while being instant at the twelve edges every test used. Rewritten as
Kahn's algorithm over an index built once, plus batching canvas strokes by
style instead of one draw call per edge, plus applying drags on rAF rather than
per pointer event: 21.3ms median, 17.7ms on a CI runner. **Put the spec's
stated scale in a gate, or you will only ever measure the toy case** — and when
it fails, fix the shape of the algorithm rather than the threshold in the test.
*(Intersecting Parallels 0.1.0, 2026-07-29.)*

**A gate that checks a LABEL passes while the thing the label describes is
broken.** Intersecting Parallels' browser walk asserted that every drawn stroke
"binds to a guide, not to nothing" — and it was green on the build where Noah
drew four lines at a vanishing point and reported *"the lines do not converge on
the vanishing point."* Every stroke did carry a binding. The binding was
`horizontal`, which is a **parallel** family: lines bound to it converge
nowhere. The check was reading the app's own word for what it had done instead
of measuring what it had drawn. The replacement computes the perpendicular
distance from the vanishing point to each bound line — 0.000px now, and no
label can satisfy it. **When a property is geometric, physical, or visual,
assert the measurement, not the metadata**; the metadata is written by the same
code you are testing, so it agrees with itself by construction. Same family as
the self-referential assertion (`assert.equal(cards.length, CAP)`) and the
consistency check between two projections of one source: all three compare the
code to itself.
*(Intersecting Parallels 0.1.1, 2026-07-29 — found by the owner on his iPad,
against a walk of 33 green checks.)*

**Two guides that are nearly the same LINE are not nearly the same
CONSTRAINT.** The same defect had a second layer underneath. With both vanishing
points on the horizon, a stroke drawn near the horizon measures within a couple
of degrees of BOTH — a real ranking, taken with a 3° hand tremor, read
`VP2 0.87° | horizontal 1.99° | VP1 3.00°`. Scoring by angle alone therefore let
a tremor choose between two guides whose lines are visually identical but which
converge in OPPOSITE directions, and between a vanishing point and an axis whose
whole meaning is that it never converges. The fix was to notice that the gesture
carried information the geometry had discarded: the direction the hand was
travelling says which vanishing point is being reached for, even though the
binding itself is direction-less. **When two candidates are within measurement
noise of each other, do not break the tie with more precision — break it with a
different signal the user already gave you.**
*(Intersecting Parallels 0.1.1, 2026-07-29.)*

**A `display` rule on a `<dialog>` silently defeats the browser's own hiding.**
Adding `#about { display: flex }` to lay out a dialog beat the user-agent's
`dialog:not([open]) { display: none }` on specificity — so `close()` succeeded,
`dialog.open` went false, every handler ran, and **the panel stayed on screen**.
A worse version of the bug being fixed, shipped by the fix. It was caught only
because the check asked the browser `checkVisibility()` after the close instead
of trusting that closing had closed it. **Any `display` you set on a `<dialog>`
must be scoped to `[open]`**, and any test of "did it close" must assert the
thing is *gone*, not that its state flag flipped.
*(Quietkeep 0.21.1, 2026-07-29.)*

**`<input type="file">` fires a `cancel` event, and it BUBBLES.** An Escape
handler on an ancestor `<dialog>` therefore fires when the user dismisses the
file chooser — closing the whole panel the instant anybody picks a file to
import. The dialog's own `cancel` is what you want; a descendant's is not.
**Guard every `cancel` listener with `e.target === dialog`.** More generally:
before listening for a named event on a container, check whether any descendant
fires the same name — `cancel`, `close`, `toggle`, `change`, `input`, `error` and
`invalid` all exist on multiple elements and several of them bubble.
*(Quietkeep 0.21.1, 2026-07-29 — introduced and caught within minutes, by the
headless walk rather than by review.)*

**A positioning complaint is often a length problem.** Noah reported twice that
the close control on a panel was in a terrible position and moved when he
scrolled. Both true. But the reason it was ever far from his thumb was that the
panel rendered every release note ever written and measured **17,000 to 25,000
pixels** — a number nobody had looked at, on a surface that had grown a little
with each release. Fixing the header's position without fixing the length would
have left the panel exactly as unusable to read. **When a control is hard to
reach, measure the container before you move the control**, and put a bound on
any surface that grows by accumulation.
*(Quietkeep 0.21.1, 2026-07-29.)*

**A feature that produces an artifact needs a gate on the artifact.** A "Print"
button was reachable, operable, correctly labelled, correctly focus-ringed, at
44px, and passed every contrast and axe check in both themes — while sending the
printer the modal dialog it was launched from, the entire app behind that, and no
print stylesheet whatsoever, because the repo had none. **Every check passed on
the day it was broken.** The generalisation is not about printing: if the point of
a control is to make a file, a page, a printout or a message, at least one check
must inspect that output. For print specifically, stub `window.print()` and assert
what *would* have gone to paper.
*(Quietkeep 0.16.0→0.21.0, 2026-07-29.)*

**Wire the escape hatch first.** In any modal or blocking flow, attach the
close/cancel handler as the first statement of the setup, before anything that
can throw. A panel's close was attached ~490 lines in, after the content,
storage, import and export wiring — every one of which had to succeed for the
thing to be closeable, with failures swallowed silently by the caller. **A dialog
you cannot leave is the worst failure a dialog has**, and it should never be the
last capability the code makes possible.
*(Quietkeep 0.21.1, 2026-07-29.)*

**Test the property, not the technique.** A check written against `position:
sticky` proves nothing a user cares about and dies at the next refactor. "The way
out is reachable from anywhere in this panel" survives every rewrite of how that
is achieved, and it is the sentence the owner actually said. The same applies to
"there is no progress bar" (assert the rendered markup has no `<progress>`, no
`role="progressbar"`, no percentage width) rather than to any particular CSS.
*(Quietkeep 0.21.1, 2026-07-29.)*

**"Is there a way out" is a product requirement, not a code detail — write it
down as one.** Two separate rules already existed about this: an accessibility
bullet saying a dismiss control must stay reachable (buried inside a clause about
sizing floors and overflow), and an engineering rule about wiring the close
handler first. Neither said the thing a user would say: **every surface that
takes the screen must be closeable, from the first frame, from anywhere in it,
without earning it.** So the same defect shipped twice on the same panel while
both rules were technically on the books. **A requirement scattered across two
sections in two vocabularies is not captured.** If the owner can state it in one
sentence, the doctrine should contain that sentence.
*(Quietkeep 0.21.1, 2026-07-29 — Noah asked "is all of that captured?", and the
honest answer was no.)*

**Acting on unrecognised input is a failure even when the action is correct.**
A screenshot of one app arrived in the session for a different one. The right
first move was one sentence — *"this isn't an app I have here, did you mean
another session?"* — and instead the session reasoned about a bug whose code it
could not see and began attaching a repository. Worse, when told to stop, it kept
the one instruction in the message that generalised and committed that, because
that part was genuinely asked for and app-independent. **That is the trap: partial
compliance with a misdirected request looks like helpfulness and produces
something to show for itself, which is exactly why it is harder to notice than
plain disobedience.** The asymmetry is the whole argument — a clarifying question
costs one message and the owner answers in his own words; a guess produces
confident output he can only evaluate by reading it, and he is the expensive
resource. **Unrecognised subject → question first, tool calls never.**
*(Cross-app, 2026-07-29 — Noah, in anger, and correctly.)*

**A test that compares two failures is not a test that a failure says nothing.**
The check asserted that a wrong-key refusal and a tampered-blob refusal produced
the same message. It passed against an implementation that appended the
ciphertext length and the IV to that message — because those two cases happen to
share a length and an IV, so the leak cancelled out inside the very comparison
written to catch it. **Two hand-picked cases agreeing is a much weaker claim than
the value being constant, and the gap between the two is where the defect lives.**
The rewrite proves it across six failures deliberately differing in key, in size
and in which byte was disturbed, and refuses any digit in the message at all,
since any number there is a measurement of the input. *When a property is "does
not depend on X", the test has to vary X.*
*(Quietkeep sync stage 2, 2026-07-29.)*

**A test named for a claim is the one most likely to be theatre, because its name
does the reassuring.** The test called THE CLAIM existed solely to assert *"the
relay cannot read anything"* — and it passed with the plaintext on the wire. It
searched the base64 envelope for the secret, and base64 of "roofer" does not
contain "roofer". Four unrelated round-trip tests happened to red on the same
break, so it would not have shipped; that is luck, not a gate, and luck does not
survive a refactor. **Encoding is not encryption, and a test that reads the
encoded form is testing the encoding.** Decode first, then look for the content
in the bytes — and assert the bytes do not parse as a document at all, which
plaintext always would and sixteen-plus random bytes never will.
*(Quietkeep sync stage 2, 2026-07-29 — found by deliberately breaking the code
after every gate was already green, which is the only reason it was found.)*

**The deliberate-failure proof is worth more on the tests you are proudest of.**
Three proofs behaved exactly as predicted and taught nothing. The fourth —
against the one test with a capitalised name and a paragraph of justification
above it — found that it had no power over the single break it existed to
prevent. **Confidence in a check is uncorrelated with its detection power, and
the checks carrying the most confidence are the ones nobody re-examines.** Run
the proof against the assertion you would have skipped as obviously fine.
*(Quietkeep sync stage 2, 2026-07-29.)*

**Any number in a refusal message is a measurement of the input.** "Could not be
opened" is a refusal; "could not be opened (28 bytes)" is a refusal plus an
oracle. This generalises past crypto: sizes, counts, indexes, offsets and
durations in error strings all tell whoever supplied the input something about
what happened to it. **A refusal should be a constant.** If it needs detail to be
debuggable, the detail belongs where the owner can see it and a stranger cannot.
*(Quietkeep sync stage 2, 2026-07-29.)*

**A fake that cannot express the failure cannot detect it.** The traversal test
on the relay — percent-encoded `../<other id>/<chunk>` names, five variants,
capitalised name, paragraph of justification — passed with the guard deleted
outright. The fake store was a flat `Map`, and in a flat key-value namespace
there is no traversal at all: the crafted key is a literal string that does not
exist, so the lookup misses for a reason that has nothing to do with the guard.
**The test was verifying the fake.** The rewrite runs it against a store that
resolves keys as a filesystem would — decoding escapes, collapsing `..` — and
asserts FIRST that this store really would hand over the other mailbox, so the
guard is provably the only thing standing in the way. *When a test uses a double,
ask whether the double is even capable of the failure; if it is not, the test's
subject is the double.*
*(Quietkeep sync stage 3, 2026-07-29.)*

**The comment above a guard is a claim, and it can be false while the guard is
fine.** The one above the relay's chunk-name check said that without it a crafted
name "reads a mailbox the caller does not have the id for". That is not true of a
flat store, and believing it meant the wrong thing got tested for an hour. The
guard was worth keeping for a narrower reason — no adapter can ever be handed a
key with structure in it — and the honest narrow reason is the one that told me
which store to test against. **An overclaimed rationale does not just mislead the
next reader; it misdirects the test you write next.**
*(Quietkeep sync stage 3, 2026-07-29.)*

**A denylist has to name the claim, not the letters.** Banning the word "lost"
fired on the correct sentence *"nothing here is lost"* — the reassurance the rule
existed to protect. The identical mistake had already happened with a check that
banned `"by "` and rejected the right answer *"put by"*. **Twice is a pattern:
substring bans on prose reject correct output at least as often as wrong output,
because the forbidden word is usually forbidden as an ASSERTION and appears
legitimately under negation.** Ban "was lost" and "data loss"; assert the good
sentence positively.
*(Cross-app, 2026-07-29 — second occurrence.)*

**A 204 cannot carry a body, and `JSON.stringify(null)` is not nothing.** It
returns the string `"null"`, and handing that to `new Response` with status 204
throws — so every CORS preflight would have been a 500, on a code path no unit
test would touch unless it deliberately sent OPTIONS. **The near-empty value that
the platform counts as non-empty is a whole family of bug**: `""` vs `null`, `[]`
vs absent, `0` vs unset. Send OPTIONS in the tests.
*(Quietkeep sync stage 3, 2026-07-29.)*

**A gate that measures the wrong thing and is right most of the time is worse
than no gate, because its green is evidence.** Two smoke checks compared the app's
correct LOCAL day against `new Date().toISOString().slice(0, 10)`, which is UTC,
in a browser context deliberately pinned to America/Denver. They passed for
eighteen hours a day and red for the six when the two zones are on different
dates. One reported the app as accepting a date in the past; the other computed
"six days ahead" by adding six times 86,400,000 to a UTC instant — which lands
seven LOCAL days out in the evening — and so made the app's correct arithmetic
look wrong. **Pinning a non-UTC timezone in the harness is only half the job; the
expected values have to be computed in that same zone.** A mixed-zone comparison
is not a flaky test, it is a wrong test with a schedule.
*(Quietkeep, 2026-07-30 — found because a session ran past midnight UTC.)*

**One artifact must not state two dates.** An export's filename was built from the
UTC instant while the file's own contents stated the local day, so a calendar
export taken at seven in the evening west of Greenwich was named 2026-07-30 and
said "as of 2026-07-29". The name is the part a person sees in Files, so it is the
one that has to be right, and the two must come from the same computation. **Any
time a value appears in both a filename and a body, they are one fact with two
writers** — the shape that has produced more defects in this project than any
other. Check it explicitly, in both hemispheres: a fix that only handles negative
offsets is not a fix.
*(Quietkeep, 2026-07-30.)*

**Let a session cross midnight on purpose before shipping anything temporal.** The
date rolling over found a real product defect and two wrong gates in one minute,
none of which nine green gates had ever noticed. A whole class of bug is only
reachable at a boundary the clock crosses once a day, and the cheapest way to find
it is to be there. If a session cannot wait, run the suite with the harness clock
set to 23:55 in the pinned zone.
*(Quietkeep, 2026-07-30.)*

**"The build is stale" is a real explanation and it should be checked second, not
last.** A fix to source did not show up in a browser gate because that gate loads
the built bundle, and the build had not been re-run. Ten seconds of confusion, and
the only reason it was short is that the failing assertion named a date that could
not have come from the new code. **Any gate that consumes a build artifact should
be preceded by the build in the same command**, not merely earlier in the script.
*(Quietkeep, 2026-07-30.)*

**`cancel-in-progress` on a production deploy turns "promoted" into a lie.** A
promote to `main` was pushed, its deploy started, and a Project-facts commit
pushed twenty seconds later cancelled it — GitHub's concurrency group did
exactly what it was told. The run's conclusion was **`cancelled`**, not
`failure`, so nothing was red anywhere: the branch was correct, the previous
checks were green, and production was quietly still serving the previous
release. It only surfaced because the deploy status was read one release at a
time instead of assumed. It also happened to be harmless — the second push
carried the same `public/` tree, so production landed anyway. That is luck, and
luck is not a deploy strategy. **Latest-wins is right for previews and wrong for
production**: `cancel-in-progress: ${{ github.ref_name != 'main' }}`. Two things
generalise beyond the flag. A `cancelled` run reads as neutral to every glance
and every notification, so it is the perfect place for a silent staleness bug to
live — the same shape as "cancelled is not zero" from the Overpass sweep. And
the moment after a release is exactly when a session wants to push
record-keeping commits, which is exactly when the deploy it is recording is
still in flight: **do not push again until the deploy you are claiming has
finished.**
*(Intersecting Parallels 0.5.0, 2026-07-30.)*

**Pushing again cancels the run you were waiting on.** A verification run was
watched through eleven of fourteen steps and then killed at the browser gate,
because a docs commit went up on the same branch and the concurrency group
superseded it. Nothing was wrong with the code and nothing was wrong with the
gate; the evidence was simply destroyed by the next push. **Between "pushed" and
"green", the branch is a held resource.** If a docs change cannot wait, it can go
on the other repo, or after.
*(Quietkeep, 2026-07-30. Two sessions hit this independently within the same hour
— the entry above is the same failure on a production deploy in another app. When
one mistake is found twice in one hour by two people who could not see each
other's work, it is not carelessness, it is a missing guard rail: `staging` and
`main` want `cancel-in-progress` set differently, and every session wants to
commit its record-keeping the moment the thing it is recording is still in
flight.)*

**Assert on the store, not on the sentence.** A button that reported "13 sample
things" while committing nothing left the message assertion passing and reded only
the three checks that read the database. **The copy on screen is written by the
same code that failed, so it agrees with itself.** Every check on an action that
writes should read the thing written — the row count, the log, the file on disk —
and the check on the wording is a separate, weaker claim that must never stand in
for it.
*(Quietkeep, 2026-07-30 — the proof was written expecting all seven checks to red;
four did not, and that was the finding.)*

**Check the invariant against the code that enforces it, not against your memory
of it.** Two consecutive mistakes came from one misremembering: that a container
is kept alive by its clocked children. It is not — containment satisfies the
CHILD, so a parent whose children are all clocked is still silent. Believing the
wrong version produced a sample set that leaned on the gate's cures, and then a
test asserting a state the app cannot reach at all. **A law you can quote is not a
law you have read**; the enforcement function is the specification, and it takes
thirty seconds to open.
*(Quietkeep, 2026-07-30.)*

**When a generated demonstration exists, run it through the real write path.** The
temptation is a fixture that skips validation "because we control the input" — and
that is exactly how a privileged path gets added for a fixture and then quietly
becomes how the feature works. Going through the app's own boundary meant a bug in
the generator surfaced as a plain refusal instead of as a corrupt store, and it
revealed two wrong beliefs about the invariants in the process.
*(Quietkeep, 2026-07-30.)*

**A `git push` that prints nothing alarming can be a no-op, and "I pushed it" is
not evidence.** A workflow fix was committed while the working tree was on
`staging`, then pushed with `git push -u origin main`. That command pushes the
LOCAL `main` — which had not moved — so it succeeded, printed a tracking line,
and sent nothing. The remote kept the old file for another twenty minutes while
being described as fixed, and it only came out because `origin/main`'s copy of
the file was read directly: `git show origin/main:path`. Two rules, both seconds
long. **Check the branch you are ON before committing** (`git branch
--show-current`), because a commit lands where you are standing, not where you
were thinking. And **verify a push by reading the remote, not the push output** —
`git ls-remote --heads origin`, or better, read back the one line you changed.
This is the same family as the deploy lesson directly above: the failure mode of
release plumbing is not an error message, it is a success message about
something other than what you meant.
*(Intersecting Parallels 0.5.0, 2026-07-30 — found while writing the lesson
above, which is its own kind of evidence.)*

**When an owner objects to a behaviour, separate the property they object to
from the mechanism that provides it — then remove only the property.** Noah, in
capitals: *"WHY is there ANYTHING besides VPs, and perfect vertical and
horizontal lines acting as ANCHORS FOR MY LINES?!"* The response was to delete
endpoint joining entirely. Two releases later he was back with screenshots of a
cube falling apart: *"Being unable to connect line ends means everything breaks
when you do adjustments."* Both statements were right, because the one mechanism
was doing two separable things: joining decided a line's DIRECTION (which he was
objecting to, because it bent lines off their guides) and also WHERE ALONG that
direction the line ended (which he needed, because shared corners are what hold
a drawing together under an edit). Deleting the mechanism took the wanted half
with the unwanted half, and cost him a round trip plus a broken drawing.
**Before deleting a mechanism an owner has complained about, enumerate what else
it provides and say so** — "this also does X; do you want X to stop too?" is one
line, and it is much cheaper than shipping the removal and having the owner
discover X was load-bearing.
*(Intersecting Parallels 0.2.0 → 0.5.0, 2026-07-30.)*

**A probe must print what it measured, never a verdict written in advance.** A
diagnostic script ended with `console.log("edge binding = VP1, but VP1 is Npx
off the line")` — the "binding = VP1" half was a hardcoded string, not a read of
the data. After the fix, the same script printed the same accusation, because
the only live number in the sentence (the distance) is legitimately large for an
UNBOUND line, which is what the edge had correctly become. Half a minute was
spent believing the fix had failed. **Print the field, not your expectation of
the field** — `stored binding = ${...}` — and let the reader compare. Same
family as the diagnostic selector that counted legend swatches and reported
markers: an instrument that can only say one thing will keep saying it.
*(Intersecting Parallels, 2026-07-29.)*

**To trust a test, delete the mechanism it names — and check that your deletion
actually changed the behaviour.** A hysteresis test was written, passed, and was
then run against the hysteresis DELETED — where it passed again, because a
different rule was already pinning the case it had chosen. It was decoration.
Rewritten to sit exactly on the boundary where nothing else breaks the tie, it
failed without the mechanism and passed with it. The subtler trap, hit the same
day: a "nothing moves" test was checked by breaking the code that preserved the
coordinates — and the break was a NO-OP, because the fields were never written
in the first place, so the test could not distinguish. **If your deliberate break
does not turn something red, suspect the break before you trust the test**; make
the break large and obviously behaviour-changing, or reinstate the ORIGINAL
buggy code, which is the only break guaranteed to be real.
*(Intersecting Parallels 0.4.0, 2026-07-29. Sharpens "a test that asserts
against the constant the code uses can never fail".)*

**An indicator people will aim at must lie on the thing they are aiming for.**
Off-screen vanishing points got an edge marker pinned along the ray from the
VIEWPORT CENTRE to the point — correct as a compass, and used by the owner as a
target to draw at. Measured from one stroke's origin: the marker sat at screen
x=834 while the point's true direction left the viewport at x=1819, so aiming at
the marker was several degrees off the actual guide from every origin, and no
amount of scoring could recover an intent the gesture never contained. The fix
was not a better guess — it was to stop requiring aim: the candidate guide lines
are now drawn from the exact point the stroke starts, so a line is FOLLOWED
rather than aimed at. **When a UI element gets repurposed as a target, either put
it where the target is, or remove the need to aim.**
*(Intersecting Parallels 0.2.0, 2026-07-29.)*

**A synthetic input model can manufacture the failure you then go and "fix", so
calibrate it or label it.** A headless repro of finger drawing used ±6px of
high-frequency wobble over a 35px sample — far coarser than a real fingertip —
and produced "5 of 14 strokes stray", which was reported as though it described
the owner's experience. It described the noise model. The genuine defect
underneath was found only by measuring a POSITION (an affordance 985px away from
where it implied) rather than a rate. **State the model's parameters next to any
number it produces**, and prefer a measurement that does not depend on simulated
human noise at all — a distance, an incidence, a coordinate — because those hold
whatever the hand does.
*(Intersecting Parallels, 2026-07-29.)*

**A guard on a destructive action must test intent, not dexterity.** Hold-to-confirm
is the fashionable pattern and it is a hand-steadiness exam: tremor is a supported
condition in these apps, so a guard a shaking hand cannot pass is a guard that locks
somebody out of their own data at the exact moment they want it gone. Typing a short
word tests the thing actually in question — did this person mean it — and it costs
nothing to forgive case and stray whitespace, because neatness under pressure was
never the property being checked.
*(Quietkeep 0.23.0, 2026-07-30.)*

**Two guarded actions must never share a confirmation token.** If the reversible
"clear the list" and the irreversible "erase everything" both accept the same typed
word, then satisfying the guard for the safe one and switching mode leaves a
satisfied-looking control sitting in front of the dangerous one. **Authorisation
crosses whenever the token is the same and the target can change.** Different words
per action, and switching target clears whatever was entered — the second half
matters as much as the first, and it belongs in the UI test rather than in a habit.
*(Quietkeep 0.23.0, 2026-07-30.)*

**Never reveal a surface before it can say anything.** The confirmation panel was
unhidden and THEN filled in, because the count came from an async store read — so
for as long as that read took, an empty paragraph sat above the go-ahead button, in
the one place where the sentence is the entire safeguard. Compute, write, then
reveal. **A surface that appears before its content is a surface that can be acted
on before it has warned anybody**, and the window is exactly as long as the slowest
device makes it.
*(Quietkeep 0.23.0, 2026-07-30.)*

**A control that only appears after a click is still a control somebody reads.** The
accessibility gate correctly refused a registry entry pointing inside a hidden
block. The tempting fix is to drop the entry; the right fix is to open the block in
the audited state, because otherwise the exemption lands on exactly the surfaces
that are conditional — confirmations, error states, revealed detail — which are the
ones people meet while already under strain.
*(Quietkeep 0.23.0, 2026-07-30.)*

**A share tile with no words on it is an unfinished tile — and the rule to
finish it was already written.** Noah: *"The social preview tile has no words."*
The doctrine already said (§3) that AI-generated imagery must be prompted
wordless "and all lettering is overlaid afterwards by us"; the artwork was
generated wordless, the overlay never happened, and the bare gradient shipped as
`og.png` and as the repo's social preview. A card renders at roughly 360px next
to nothing but a bare domain — pretty, and it names nothing. **When a rule has
two halves, the second half is the one that goes missing**, because the first
half produces a file that looks like a finished deliverable. The fix is a
generator committed next to the art (`render-og.mjs`, `npm run render:og`), so
the tile is reproducible instead of being a binary someone hand-made once.
*(Intersecting Parallels 0.5.1, 2026-07-30.)*

**Text over a picture has no background colour, so measure the lightest pixel
under the actual glyphs.** A contrast gate for words baked into an image cannot
read a CSS pair — the background of a letter is whatever pixel happens to be
beneath it, and a sun in the corner is a different background from the navy in
the middle. What worked: render the tile TWICE, once with the text hidden
(`visibility`, not `display`, so the boxes do not move), sample the backdrop
image inside each text run, take the lightest pixel found — worst case for light
text — and compute the real WCAG ratio against the real text colour, printing
the offending pixel's rgb AND coordinates. Two things fell out of it immediately.
First, sample the LINE rects (`Range.getClientRects()`), not the element box: a
block is as wide as its container, so the first run failed all three lines on
backdrop out where the sun is and no letter is ever drawn — the instrument was
wrong before the design was. Second, when a line did genuinely fail (a tagline
run out across a wide column onto the horizon glow, 2.92:1), the fix was to
narrow the column, NOT to deepen the wash: a scrim heavy enough to make any
placement safe also erased the left vanishing point, on a picture whose subject
is three of them. **Buying contrast by darkening the artwork is paying for the
gate with the thing the gate exists to protect** (§14: fix the frame, not the
constant). Shipped at 9.97:1, 8.44:1, 5.10:1, and the coordinates in the output
are what made both diagnoses take a minute each.
*(Intersecting Parallels 0.5.1, 2026-07-30. Also: an image containing text needs
its words in the alt attribute — an alt that describes only the scene withholds
the text from the people who cannot see it.)*

**When a generative tool keeps failing a STRUCTURAL requirement, stop prompting
and compute the structure.** Three rounds of increasingly precise prompts asked
an image model for three-point perspective. Every render drew the two horizon
points, drew the third point, and then drew the vertical edges PARALLEL — the
third point was decoration. Noah: *"It CANNOT draw in 3 point perspective."* He
was right, and the prompt was never the problem: consistency across every line
in a picture is not a thing a describe-and-hope interface can be asked for. The
artwork is now projected through a real camera (~200 lines), and the model's job
shrank to what it is good at — nothing, in this case, since the geometry IS the
art. **The tell is a requirement that is a relationship between many outputs
rather than a property of one.** Wording will not fix those; a solver will.
*(Intersecting Parallels, 2026-07-30.)*

**A convergence check can pass on parallel lines, so measure the SPREAD too.**
Verifying "these lines run to that point" by perpendicular distance is
necessary and not sufficient: a bundle of parallel lines all miss a far-off
point by very little, which is exactly how the bad artwork would have passed. The
second number is the angular spread of the family — parallel means ~0°, genuinely
converging means degrees. Reinstating the bug proved both halves at once: worst
miss went to 208.16px and spread to 0.00°. **When a property is "these things
agree about X", check the agreement AND check that they are not all the same
thing.** Same shape as the earlier lesson about a test that passes with the
mechanism deleted.
*(Intersecting Parallels, 2026-07-30.)*

**Some layouts an owner asks for are not merely ugly, they are impossible — say
which, and name the way out.** Noah's wide social tile put the two horizon
vanishing points 1076px apart and the third 502px below. No real camera has
those three points: the principal point is the orthocentre of their triangle,
f² = -(A-P)·(B-P), and there it comes out NEGATIVE. The constraint is
d > s — the third point must be farther out than half the spread of the other
two — and his own hand-drawn reference sits just inside it, at d=835 to s=795.
The useful refusal is not "invalid input" but *"move the horizon points 44px
closer together, or the third point 44px farther out"*, so the answer names both
exits and lets him choose the one that costs him less. **A validator that only
says no makes the owner guess; one that says which way is a collaborator.**
*(Intersecting Parallels, 2026-07-30.)*

**A link that exists is not a link that works — count the taps a stranger would
need, and how many of them are invisible.** The apps had been made to "point
both ways", and technically they did: every tool carried "‹ Studio" in its bar
and the Infrared ⓘ dialog carried a line to the hub. But the Studio page itself
had NOTHING pointing up, so the chain dead-ended one rung short, and the single
hub link in the whole app was the fourth of five identical grey text lines
inside a dialog, worded "More free tools by Noah Jefferson" — which describes a
category, not a way back. Noah couldn't find it on device. **Cross-app links
are the easiest thing to mark done and the hardest thing to notice are broken,
because the person who added them always knows where they are.** The check that
would have caught it costs nothing: walk it from the far end, on a phone, and
count how many steps are visible without scrolling or opening something. Here
it went from "one buried line inside a dialog" to one visible control per level.
*(Photography Studio ← the hub, 2026-07-30.)*

**Measuring contrast against a gradient: computed style will confidently tell
you the page is black.** `background: radial-gradient(...)` sets no
background-COLOR, so walking up the tree looking for an opaque one falls through
every ancestor to its fallback. A light-theme page measured against that
fallback returned 1.11:1, which is absurd on its face — and absurdity is the
signal, per "suspect the instrument first". Three more traps sat behind it, each
producing a confident wrong answer: sampling a rail at the tangent of a
999px-radius pill reads pure antialiasing and under-reports by ~0.5; a gradient
backdrop CHANGES with position, so a rail must be compared against the pixel
touching it, not a convenient patch elsewhere; and `:focus-visible` never
matches a scripted `.focus()` in Chromium, so a perfectly good focus ring
reports as `outline: 0px none` until the harness presses a real Tab. **If a
visual property is worth asserting, assert it on real painted pixels off a
screenshot, and drive it the way a person would.**
*(Photography Studio, 2026-07-30.)*

**A calibrated token that fails in one place is a finding, not a fix to make in
passing.** The rail token measured 2.87:1 on the launcher's light-theme
gradient, under the 3:1 rule. The tempting move — nudge it, or drop in a
one-off color — would have churned a value defined in five files and calibrated
against a documented surface set, inside a change about navigation. The cheap
test that settled it: measure an ALREADY-SHIPPED, already-audited control
sitting on the same backdrop. It came out worse (2.68:1), which proved the
shortfall belonged to the token on that gradient and not to the new work. It got
recorded with its numbers and left for its own pass. **When something measures
out of spec, first find out whether you brought it — the control group is
usually already on screen.**
*(Photography Studio, 2026-07-30.)*

**Surface colours and text colours are one system — you cannot tune either
alone.** "Cards don't stand out from the page" looks like a one-line fix: move
the surfaces apart. It isn't. Pushing surfaces away from the page pushes the
*pressed* surface toward the text sitting on it, so every naive spread broke
text-on-pressed contrast; and in a dark theme, lifting surfaces also weakens a
light hairline riding on them, so the rail token has to move in the same breath.
Four knobs — surface lift, page move, rail strength, quiet-text strength — and
changing one silently spends the budget of the others. **Solve them together
against the whole matrix, or a fix in one place is a regression somewhere you
weren't looking.** The frontier is worth computing rather than guessing: for the
Studio it turned out to be page→card 1.30:1 dark / 1.27:1 light, and past that
something correct breaks.
*(Photography Studio + the hub, 2026-07-30.)*

**Near-black has no room left underneath it — check which direction is even
available before designing the fix.** The obvious way to separate cards from the
page in a dark theme is to darken the page, leaving every text and rail ratio on
the surfaces untouched. It does nothing: at `#0b0c0f` the page is already at the
luminance floor, so 55% darker moved separation 1.09 → 1.13. The `+0.05` term in
the WCAG contrast formula dominates down there — ratios between two very dark
colours barely move no matter what you do. Light themes are the mirror image
near white. **The cheap direction is often the unavailable one; spend a minute
computing which way has headroom before committing to an approach.**
*(Photography Studio, 2026-07-30.)*

**An optimiser will happily destroy the brand to win the metric.** Asked to
maximise card/page separation on the hub, the search returned a palette that
washed the magenta accent from `#E0619E` to `#F8DAE8` — a pale pink — because
that bought 2.89:1. The spectral accents ARE the hub's identity; the "best"
answer was unusable. Re-run with the brand pinned (accent shift capped at 5%)
and the honest answer appeared: a modest 1.08 → 1.18, plus the genuinely
valuable part, two accents lifted off the 4.5:1 line where they'd been sitting
at 4.52 and 4.68. **Constrain the search by what must not change, or the
objective will quietly eat it — and check the winning output by eye before
believing it.**
*(the hub, 2026-07-30.)*

**A rule can be correct and still be wrong where you applied it — and the
tempting fix is to edit the data until the rule is happy.** A palette gate
enforced "the surface ladder steps monotonically away from the page." True for an
ELEVATION ladder (rest → raised → pressed). False for a STATE ladder: a
light-theme hover legitimately darkens *toward* the page, and the rule failed a
hub hover that was right. What makes this worth writing down is the near-miss:
the first instinct was to reorder the data — list the hover as if it were the
resting surface — so the numbers would line up. That would have left a permanent
lie in a reference file other apps copy from, to protect a rule that was the
thing at fault. **When a gate flags something you believe is correct, establish
whether the rule governs that case before touching the data.** The fix was to
make the rule kind-aware; a state ladder owes only that its states are
perceptible (ΔE ≥ 2.3), not that they ascend.
*(the hub's palette gate, 2026-07-30.)*

**Do not state a UI or platform path as fact unless you have verified it — "I
don't know" beats a confident wrong answer, every time.** Asked where to edit
GitHub repo metadata from an iPhone, the session invented tap-paths ("gear next
to About", "Request Desktop Website"), and when each was refuted it adjusted the
guess rather than establishing the truth — costing Noah minutes of proving each
answer wrong. Then, writing THIS very lesson, it did the same thing again: it
asserted repo metadata "cannot be edited from the mobile site or app at all,"
another unverified absolute — and Noah corrected it, because the GitHub mobile
app *can* edit the description. So the honest state of what is actually known is
small: the description is editable in the app; what else the mobile surfaces
allow was never verified and must not be claimed either way. The failure is the
same shape as the security overclaims (7f): asserting past what is known, which
turns the non-expert owner into the fact-checker for the expert. It is so
ingrained that it survived into the sentence meant to cure it. When you don't
know a platform detail, say so and find it, or scope the claim to exactly what
you have seen — never a sweeping "you can" or "you can't." A wrong direction, in
either direction, spends the other person's time to discover it was empty.
*(Quietkeep, 2026-07-30 — and the entry itself had to be corrected once.)*

**A session CANNOT edit repo metadata. Stop trying, stop hunting for a way,
stop sending Noah on UI expeditions — it is his manual step, full stop.**
Description, website, topics and social-preview are not editable by any tool a
session has: there is no GitHub MCP call for them, and there is no back door.
Noah has said this every time an app is set up, and every time a session tries
anyway — searches for a tool, proposes tap-paths, offers to "just do it" — which
is worse than useless because it burns his time proving the wall is still a wall.
Doctrine §10 already says the values are his to set; this says the behaviour that
rule keeps failing to produce. When metadata comes up: state the exact values
once, in plain text, say they are Noah's to paste in whenever he is at it, and
move on. Do NOT attempt it, do NOT re-offer it, do NOT explain where the buttons
are. He knows where they are — the app edits the description, and the rest he
handles. The only job a session has here is to hand over correct values and drop
it.
*(Quietkeep, 2026-07-30 — logged because it keeps happening despite being told.)*

## 9 · Measuring, and reading the measurement

**Enforced by:** CHECKLIST no-beacon — read what the platform already counts server-side before adding any client-side measurement.

**Cloudflare already counts every request server-side, per host and per country
— reaching for an analytics beacon is the wrong tool AND a breach of §1.** Asked
how to see app usage by country, the session proposed enabling Cloudflare Web
Analytics across all eight Pages projects: a JS beacon, on apps whose stated
identity is *no analytics*. It then wrote a careful trade-off paragraph about
breaking that promise — reasoning about how to justify the violation instead of
questioning the premise. **Analytics → Account analytics** was already on,
already retaining the data, and already broke it down by **Top Hosts** and
**Requests by Country**, with nothing injected anywhere: 27.42k requests over 7
days across 36 countries, hosts itemised (`quietkeep.pages.dev` 2.81k,
`noahjefferson.pages.dev` 72). The edge counts what it already serves; a beacon
can only ever count *less*, because blockers drop it. Before proposing a
measurement, find out what the platform already measures for free — and when the
app's own doctrine forbids the thing you are about to suggest, that is the signal
to look harder, not to start writing the caveat.
*(the hub, 2026-08-01.)*

**Requests are not usage, and on a public host most of them are not people.**
That same 27.42k read as 62.3% United States, 10.5% France, 10.0% Germany, which
looks like an audience until composition is checked. France was one IP —
`185.177.72.22`, 2.7k requests, user agent `curl/8.7.1` — walking a secrets
wordlist against quietkeep: `/deploy/.env.smtp`, `/.aws/secret_access_key.txt`,
`/nuxt/secrets.env`, ~120 hits each, all 4xx. France, Germany, Netherlands,
Ireland and Singapore together — the five largest commercial hosting regions —
were **27.9%** of all traffic. Two composition checks separate machines from
people with no extra tooling: **the asset ratio** (html 12.29k against js 2.94k;
a real page load pulls html *and* its js, css and icons, so 4:1 means most html
responses never became a rendered page) and **the protocol mix** (HTTP/1.1 was
7.93k of 27.42k, **29%**, while current browsers negotiate h2/h3). The same page
offered "9.98k visits" in large type. Quote the filtered number, or state plainly
that the figure includes bots — an unqualified visit count is a flattering lie,
and it is the one a proud owner will repeat.
*(the hub, 2026-08-01.)*

**Third recurrence of the UI-guessing failure above — in a session that had this
file open.** Asked for per-app country data, the session twice described a
Cloudflare control it could not see: "Add filter → Host = …", then a per-site
export scope. Both were invented, and both times Noah had to send a screenshot to
refute them. The disproving evidence was available the whole time and was only
gathered *after* the second correction: `dash.cloudflare.com` and
`api.cloudflare.com` both fail CONNECT from the sandbox (HTTP `000`), so no claim
about that dashboard was ever verifiable from here. **Check whether the surface
you are about to describe is even reachable, and if it is not, say "I cannot see
it — send me a screenshot."** One screenshot costs a single message. The guess
cost four, plus the goodwill of the person who had to keep proving it wrong. Two
prior entries said this; writing them down did not stop it. What might: treat
*any* sentence naming a menu, tab or button in a third-party UI as requiring a
citation, exactly like a security claim (§7f).
*(the hub, 2026-08-01 — see the two entries above on UI paths and repo metadata.)*

**A sampled dataset does not return counts, and the drift is the tell you will
explain away twice before you believe it.** Cloudflare's
`httpRequestsAdaptiveGroups` returns SAMPLED rows: `count` is how many records
landed in the sample, and each carries a `sampleInterval` saying how many it
stands for. Summing raw counts under-reports by whatever rate that query drew.
The evidence appeared early and was dismissed as noise twice: a host no filter
touched went 5,106 → 4,488 → 3,483 across three runs, and excluding one *French*
IPv6 address appeared to cut *Korean* traffic 819 → 160 — which one address
cannot do, and which should have ended the matter on sight. **When a number
moves that a change cannot possibly have moved, stop and find the mechanism;
"sampling noise" is a label, not a diagnosis.**
*(the hub, 2026-08-01.)*

**Then the fix was wrong too, and the only reason that is known is a number
outside the tool.** Weighting by `count × avg(sampleInterval)` — the textbook
estimator — produced **684,433** requests for a 7-day window in which
Cloudflare's own Account analytics reported **27,424**. A 25× overshoot. Raw
counts gave 64,012, still 2.3×. Three figures, at most one right, none verified.
The tool now ships raw counts, names the weighted estimate beside them, and
prints the reconciliation gap, because a number that is confidently 25× wrong is
worse than one labelled unverified. **Reconcile any derived metric against a
figure the vendor publishes before believing it — the second implementation is
not more trustworthy than the first just because it is newer, and a fix that was
never checked against an outside number is a guess with more code around it.**
What survived all of this was never a magnitude: that `2a06:98c0::/29` is
Cloudflare's own range and `185.177.72.22` is a secrets scanner came from user
agents and 4xx shares, and those held while every total moved.
*(the hub, 2026-08-01.)*

**RESOLVED, same night — and the resolution corrects both entries above:
"unverified" had been declared one query before the data that verifies it.**
When the three irreconcilable totals (raw 64k / weighted 684k / dashboard 27k)
were treated as a question instead of a dead end, the discriminating evidence
turned out to be sitting in the same dataset list: a `requestSource` dimension,
and an overview dataset described as counting "requests made by end users." One
calibration run over fixed complete-UTC days settled everything. (1) The
dashboard counts `requestSource = eyeball` — end users. Eyeball-only raw counts
matched the dashboard's own CSV export **request-for-request on seven
countries** (DE 2,732, KR 559, GB 336, AU 233, CH 164, JP 133, SG 393) and
within 2 requests on FR; `httpRequestsOverviewAdaptiveGroups sum.requests`
independently returned the identical total, 27,807. (2) So `count` in the
adaptive datasets already IS the sampling-adjusted request count — the first
entry's "raw counts under-report" was wrong, and the ×sampleInterval "fix" was
double-applying an adjustment Cloudflare had already made. Exact equality on
seven rows is not possible any other way. (3) The run-to-run drift that started
the panic was the ROLLING WINDOW sliding between runs — identical queries over
fixed day boundaries agree to 0.0%. (4) The missing half of the traffic was
never missing: 35,784 requests were `edgeWorkerCacheAPI` — quietkeep's own
Worker machinery, the Cloudflare-IPv6 "France" traffic — plus 2,499
`earlyHintsCache`. Real requests, not visitors. Three rules earned here: **when
totals from the same system disagree, decompose by scope before doubting the
measurement — the datasets were counting different populations, and both were
right**; **windows must be fixed to day boundaries before any run-to-run
comparison means anything**; and **"unverifiable" is a claim like any other —
it is not allowed until the cross-checks within reach are actually exhausted,
and the person who declares it early is just giving up with a technical
vocabulary.**
*(the hub, 2026-08-01, later the same session.)*

## 10 · Explaining your own failure with Noah's inaction

**Enforced by:** GATE hub:handoff-check.mjs · CHECKLIST evidence — every claim about external state cites the log line or response it came from.

**When a call fails, the cause is a claim about the world — go and find it.
"You must not have approved it" is the one guess that costs the person who
cannot check it, so it is the last one you are allowed to reach for, never the
first.**

MyFax PR #1, 2026-08-01. Subscribing to PR activity through the
`claude-code-remote` MCP server returned `MCP error -32003: MCP tool call
requires approval`. What followed was the whole anti-pattern in about four
minutes: the identical call was **retried verbatim** (twice — the same call is
not new evidence), then the same server's `send_later` failed the same way, and
Noah was told the tools were "blocked pending approval in this session" and that
"this session can't run that prompt". He had approved everything. He said so,
with some feeling, and he was right.

The diagnosis took two minutes once it was actually attempted, and every piece
of it was sitting on disk the entire time:

- `~/.claude/mcp-needs-auth-cache.json` contained exactly one server —
  `711ebc42-…` — and the failing server, `bf7c680d-…`, was **not in it**. The
  harness did not think that server needed authorisation at all.
- `~/.claude/launcher-settings.json` pre-allows `"Skill"` and nothing else, so
  the approval gate is a harness permission policy, not a pending user action.
- **The decisive tell was in the transcript before the wrong explanation was
  ever offered**: `mcp__github__subscribe_pr_activity` — the *same action, same
  PR, different server* — succeeded on the first attempt. Two servers, one
  action, opposite outcomes is a server-side difference. It cannot be something
  the user did or failed to do, because the user did the same nothing for both.

Three things generalise, and none of them are about MCP:

- **A failed call is a puzzle you own.** Read the error code, check the tool's
  state, find the config that governs it, and compare against a call that
  works. Attributing it to the user before doing that is not a hypothesis, it is
  a way of stopping.
- **Guess in the direction where being wrong costs YOU.** "The server is
  misconfigured" is wrong at the price of a minute of your own time. "You didn't
  approve it" is wrong at the price of sending Noah to inspect a setting that
  was never the problem, while telling him the fault was his — and he is the
  only one who can disprove it.
- **"I don't know why yet" is a complete, honest answer.** Say what you ruled
  out, say what the fallback costs, and move. The failure here was never not
  knowing; it was filling the gap with the user's name.

*(the hub / MyFax, 2026-08-01. Codified as Doctrine §5b the same hour — the
fallback, a session-only cron, was fine; the explanation was the defect.)*

**A carry list written by hand is a bug with a delay fuse — and a test that
names its coverage shares the blind spot of the code it guards.** Quietkeep's
"fold a duplicate" verb writes across what the survivor lacks: dates, the note,
people, children. That list was written once, correctly, by the release that
built it. Then three later releases each added a field to the same data
structure — a standing decline, a decision log, dependency edges — and not one
of them visited the merge, because nothing made them. Every omission silently
took a real record off every surface the moment a duplicate was folded. The
part worth carrying between apps is not "we forgot"; it is that **the test could
never have caught it.** It was called *"a fold carries the date, the note, the
people, and the children — nothing swallowed"*, and it asserted exactly those
four, so it enumerated the same list the code did and was blind in precisely the
same place, permanently. A test whose name is a promise and whose body is an
enumeration is not guarding the promise. The fix is a **totality gate**: a map
from every field of the structure to a decision — carried, handled elsewhere, or
deliberately left behind *with the reason in words* — checked by the type system
so a new field cannot compile until someone has written the sentence. A reasoned
"not carried" is a fine answer; forcing the sentence is the whole mechanism.
Anywhere one structure is copied, transformed, or exported field-by-field —
serialisers, API mappers, form submissions, migrations — the hand-written list
will drift the same way, and the same gate stops it. Two smaller riders from the
same audit: writing the invariant *generically* (for every object-valued key,
assert identities differ) found two aliasing bugs a field-list test had been
walking past; and a randomised property test needs its own **coverage** pin,
because Quietkeep's strongest test had silently stopped exercising nine of the
kinds it was supposed to cover, including the one branch changed since it was
written.
*(Quietkeep, 2026-08-01 — the 1.9.2 audit of nine releases.)*

## 11 · Instruments, signs, and the checks that measure the wrong thing

**Enforced by:** CHECKLIST two-derivations — derive any geometry or sign-sensitive result a second, independent way and compare before believing either.

**Two independent derivations of the same geometry catch sign errors that
neither catches alone — and both looked completely plausible on screen.**
fauxplane computes aircraft pitch and roll two ways: from the orientation
event's Euler angles through a rotation matrix, and from the accelerometer's
gravity vector. The gravity route had its roll sign inverted, so it returned
**+30 degrees for a 30-degree LEFT bank**. Nothing about that is visible in
isolation: the horizon tilts smoothly, tracks the device, and returns to level.
The test that found it derives the gravity vector *from* the matrix and asserts
the two routes agree across a grid of attitudes — a thing neither implementation
could fake. Two riders, both earned the hard way in the same hour: the first
version of that test took the third **column** of the rotation matrix where the
maths needs the third **row**, and confidently accused correct code of
disagreeing with itself (suspect the instrument first); and self-consistency
between two derivations is *not* the same as being right, so a second test now
pins the aviation convention itself — right wing down is a positive roll — or a
future refactor that mirrors both routes together would still pass.
*(fauxplane, 2026-08-02.)*

**The same session, the same shape, in a different subsystem.** The World
Magnetic Model's north component was 180 degrees out, because X is the
*northward* component while the spherical-coordinate unit vector points *south*.
Y and Z were both right, which put the horizontal field exactly reversed. A pure
axial dipole reported a declination of 180 at every point on earth — a number
that is finite, stable, and varies sensibly with position. **Anywhere a sign
convention crosses a coordinate-frame boundary, find an invariant that does not
depend on the implementation** (a pure axial dipole has zero declination
everywhere; a dipole tilted into the 90E plane has zero declination on that
meridian) rather than checking the output against a remembered real-world value,
which is how a half-remembered constant becomes the thing under test.

**DIMMING A UI WITH A BRIGHTNESS FILTER DESTROYS EVERY CONTRAST PAIR YOU
MEASURED.** This is arithmetic, not opinion: the WCAG formula's `+0.05` term
means scaling foreground and background *together* reduces the ratio. Measured
on fauxplane's palette, a `filter: brightness(0.45)` — the obvious way to dim a
cockpit display at night — takes primary text from **14.5:1 to about 3.7:1**. A
fail state, produced by the one control whose entire purpose is legibility, and
completely invisible to a contrast gate that reads authored token values. The
fix is to make each dim level a **measured palette block** (PALETTES §6 already
has the mechanism: value blocks, no new token names) and run the whole
accessibility sweep in each. Any app that dims, tints, fades or "de-emphasises"
a whole surface is on this hook, not only cockpit panels.
*(fauxplane, 2026-08-02.)*

**A real Content-Security-Policy will block your own test harness, and that is
the policy working.** The accessibility gate injected axe-core with
Playwright's `addScriptTag({path})`, which inlines the file — and `script-src
'self'` correctly refused it. The available wrong answer is to relax the policy
for the gate, which means testing a policy the deploy does not have. The right
one costs four lines: serve the tool from the harness's own static server so it
is same-origin. Worth knowing before writing the CSP, because the first symptom
looks like the harness being broken. The related win: a CSP is only possible at
all because the app was written with **no inline script and no inline style from
the first commit** — Doctrine §16.6 is right that it is a refactor, not a
header, and the refactor is nearly free if it happens on day one and expensive
ever after.
*(fauxplane, 2026-08-02.)*

**"No console errors" and "this optional file is deliberately absent" are in
direct conflict, and the fix is a committed manifest.** Three data bundles were
knowingly not shipped, each for a good reason. Fetching them produced a 404 on
every boot — which is a console error whatever the intent, and an HTTP status
cannot tell a user the difference between "not generated yet" and "deliberately
not approximated". Putting the reasons in a committed `data/manifest.json` that
the loaders consult *first* cleaned the console and, more usefully, gave the
capability page a sentence somebody wrote on purpose. Anywhere an app probes for
optional content, the probe result is worse documentation than a written answer.
A second turn of the same screw: those written reasons then appeared verbatim on
an instrument face and turned one altitude readout into eight lines of prose, so
each entry now carries a **short reason** for a gauge and a **long detail** for
the page with room for it.
*(fauxplane, 2026-08-02.)*

**A "mark this stale now" flag that the ageing machine re-derives away.**
A store recomputed each field's LIVE/STALE/FAIL from its timestamp on every
publish — a good design, and the reason "kill the network and watch the feeds
decay" needed no per-instrument code. But `markStale()`, called on
`visibilitychange` because iOS stops delivering sensor events when backgrounded,
set the flag and was overwritten **40 ms later** by the next publish, which saw
a reading still inside its freshness window and called it LIVE again. The
instruction survived exactly one frame. **Wherever a derived property is
recomputed on a loop, an imperative override needs somewhere sticky to live** —
here a flag on the field that only a genuinely new reading clears. Found by a
test asserting the state 200 ms after the call rather than immediately, which is
the only version of that test that could have failed.
*(fauxplane, 2026-08-02.)*

**§7g again, immediately, on a brand-new check — this is not a rare failure.**
A gate asserted that the built-in-test page "reads the live store" by checking
that *something* on it reported FAIL. Planting the fault — disabling the live
merge entirely — left the gate **green**, because unrelated feed rows were
already FAIL in that build and satisfied the count on their own. Exactly the
roof-plane shape: a total that a pre-existing thing was already satisfying.
Rewritten to name the four specific entries whose status only the merge can
know, it caught the plant immediately. The point worth carrying is that this was
written *by someone who had just read §7g and was actively trying to avoid it*,
in the same session, and it still happened — so **planting is not a discipline
you can replace with care.** Its companion: when the plant script reported "red,
but for a different reason", the check was right and the script's expected
pattern was stale. A planting harness that only asserts non-zero exit will
happily bless a check that fires for the wrong cause; assert the *message*.
*(fauxplane, 2026-08-02 — 10 planted faults, 10 caught, after two rounds.)*

**A headless browser has no sensors, so every automated look at a
sensor-driven app sees the same failed screen.** That screen is worth asserting
— it is the all-permissions-denied acceptance criterion — but it is also the one
state in which a mirrored horizon, an upside-down tape or a needle at the wrong
end of its scale is completely invisible. A small script that drives the app's
own state store from outside, through the same public write the sensors use, and
screenshots two or three deliberately opposite scenes (climbing right turn,
descending left turn) costs half an hour and is the only reason the roll-sign
bug above was visually confirmed rather than merely argued. It is a test bench
holding wires to the connector, not a signal generator soldered inside the box —
worth saying plainly in the file header for any app whose whole premise is that
it contains no synthetic data path.
*(fauxplane, 2026-08-02.)*

**A test built from a degenerate case validates the degenerate case — and can be
structurally blind to the bug.** fauxplane's magnetic model was tested with two
synthetic fields: a pure axial dipole (declination must be zero everywhere) and
a dipole tilted into one meridian plane (declination must be zero on it). Both
are good invariants, both passed, and both are **degree 1** — where every
Schmidt normalisation factor happens to be exactly 1. The implementation had the
m=0 normalisation wrong at every degree from 2 to 12, and the tests could not
see it in principle, not by bad luck. The symptom was worse than a crash:
declination came out **three to five degrees wrong** while total intensity and
inclination stayed close, because the dipole term dominates those two. A pilot
reconciling a compass against a GPS track would have been handed a plausible,
stable, wrong number.

Two more bugs in the same file had the same character. The northward component
was negated (theta-hat points *south*, so X = -B_theta), and the
geocentric-to-geodetic rotation had its angle backwards — zero error at the
equator, degrees of it at high latitude. Each was individually invisible: the
output was always finite, stable, and varied sensibly with position.

**The rule: when a published model has published test values, those are the
test.** NOAA ships a 213-row validation table with the World Magnetic Model.
Running against it found all three bugs in one pass and now holds the
implementation to 0.05 degrees at a hundred points including the poles and
100 km altitude. The generalisation past geomagnetism: reference implementations
and conformance suites exist for most standards worth implementing — codecs,
colour spaces, geodesy, date arithmetic, unicode — and reaching for one is
cheaper than deriving your own invariants AND strictly stronger, because the
invariants you can think of are drawn from the same understanding that wrote the
bug.
*(fauxplane, 2026-08-02.)*

**"The proxy blocks it" can be true of the host you tried and false of the
data.** A previous session recorded three data bundles as unobtainable because
the egress proxy denied their hosts, and a later session repeated that to the
owner as work he would have to do. He pushed back on being handed a vague task,
which prompted an actual re-probe — and two of the three were reachable all
along by a different route: the npm registry is on the proxy's allowlist, and
`raw.githubusercontent.com` served the same publisher's same repository that
`*.github.io` would not. Both files were fetched, verified and committed inside
an hour, and the owner's task list went from three items to zero.

Three things fall out, in increasing order of cost:
- **Re-probe blocks rather than inheriting them.** A recorded block is a
  measurement of one host at one moment, not a property of the data.
- **A blocked host is not a blocked ecosystem.** Package registries, git hosts
  and mirrors are separate allowlist entries, and the data you want is very
  often in a package somebody already made for exactly that reason.
- **Before delegating anything, separate what is blocked from what was merely
  not attempted** — Doctrine §6 already says this, and it was still the owner
  who had to ask.

The honesty rider: one of the three, OurAirports, stayed unbuilt afterwards —
not because it was unreachable (it was), but because its published TERMS page
was not, and nothing in the current release consumes it. **When the reason for
a block changes, rewrite the reason.** The stale "egress denied" note had become
false, and a false reason is worse than no reason: it stops the next person
looking.
*(fauxplane, 2026-08-02.)*

**Do not hand the owner a decision he has no basis to make, dressed as routine.**
The same handoff asked him to rule on whether the module tree should live at
`public/src/` or at repo-root `/src` with a bundler. That is a technical call
with a correct answer — the deploy root is `public/`, native ES modules need no
bundler, and the repo had already settled against a build step — and the session
had already made it correctly. Presenting a settled, defensible decision as an
open question reads as either fishing for cover or as an admission it was done
wrong, and it costs the owner the effort of reconstructing an argument that was
already complete. **Flag a deviation, state the reason, own it.** Ask only when
the answer genuinely turns on something only he knows: taste, priority, risk
appetite, or what the thing is for.
*(fauxplane, 2026-08-02 — owner: "you make it sound routine like I shouldn't
have to be asked and you should have done it the right way in the first place.")*

**A fault-injection harness that is not crash-safe is a saboteur with good
intentions.** fauxplane's planting script backed each file up IN MEMORY and
restored it in a `finally` — correct for every failure mode it was designed for,
and useless for the one that happened. An outer shell timeout killed the run
partway through a plant. The `finally` never executed. The working tree kept the
injected fault, which happened to be the one that disables the built-in-test
page's live merge.

It surfaced twenty minutes later, after a clean commit had already been pushed,
as a gate failure that looked exactly like a real regression in code that had
just been verified. The wasted effort went into re-reading correct code hunting
for a bug that a test harness had written. The tell, missed at first, was that
the *same commit* had passed the same gate minutes earlier: **when a gate flips
without the code changing, suspect the tooling before the code.**

The fix is three cheap parts, and it is worth having before the first
interruption rather than after: write the backup TO DISK before touching the
file, handle SIGINT/SIGTERM/SIGHUP with a synchronous restore, and **restore any
leftover backup at the start of the next run** so a SIGKILL — which no handler
can catch — repairs itself rather than needing a diagnosis. Verified by actually
SIGKILLing a run and watching the next one report "restored from an interrupted
earlier run" and go green.

This generalises to anything that deliberately puts a repo into a broken state
for a moment: migration dry-runs, permission-downgrade tests, chaos scripts,
codemod previews. If the process can be killed — and it can — the repair has to
survive the process.
*(fauxplane, 2026-08-02. Same family as the earlier rule against `git checkout`
to undo a plant: both are about the fact that the undo is the dangerous half.)*

## 12 · The network is not down. You tried one host.

**Enforced by:** CHECKLIST probe-order — run the proxy status and the alternate hosts BEFORE reporting any block, and quote the status codes per host.

**The single most repeated failure across these apps, and the owner has watched
it happen every day.** A session makes one request, it fails, and the session
reports that it cannot reach the network — then hands the owner the work. It is
nearly always false. Doctrine §15b is the rule that came out of it; this is what
it cost.

**The measurement, taken the day the rule was written.** Three datasets were
recorded in a repo's NOTES.md as unobtainable because "the egress proxy denies
the hosts". A later session repeated that to the owner as three things he would
have to go and do. He pushed back — not on the technical claim, but on being
handed a vague task — which is the only reason anybody re-probed. Results, in
under a minute:

- `davidmegginson.github.io` — denied, as recorded. **The same repository on
  `raw.githubusercontent.com` returned 200.** Different allowlist entry.
- `ncei.noaa.gov`, `earth-info.nga.mil` — denied. **Both datasets were sitting
  in npm packages, and the npm registry is on the proxy's own allowlist.**
- One `raw.githubusercontent.com` URL returned **404**, which had been read as
  another failure. A 404 means the host answered. The path was wrong.

Two of the three were fetched, verified against the publisher's own test values,
and committed the same hour. The owner's task list went from three items to
zero. And the verification found **three real bugs in the code that consumed
them** — a magnetic model that was three to five degrees wrong — which would
have shipped precisely because the data was believed unobtainable and the code
was therefore never checked against reality. **Declaring a block does not just
cost you the data. It costs you every test that data would have made possible.**

**The diagnostic that gets skipped every time.** The proxy will tell you what it
allows: `curl -sS "$HTTPS_PROXY/__agentproxy/status"` prints the allowlist and
the recent denials with reasons. It costs one command and it is almost never the
first thing tried, or the tenth.

**Read the failure mode; they are not interchangeable.** `000` or a rejected
CONNECT is a policy denial of THAT HOST. Any HTTP status at all — 403, 404, 200
— means the host answered and the network is fine. Treating a 404 as
"unreachable" is the specific mistake that turned a wrong URL into a false
blocker.

**Where the data actually lives, in the order worth trying:** package registries
(npm, PyPI, crates, the Go proxy are commonly allowlisted by name, and a
startling amount of public reference data is packaged — coefficient tables,
geodata, dictionaries, conformance suites); then a different host for the same
bytes (git host versus pages host, CDN versus origin, mirror versus canonical);
then the origin.

**And keep the data separate from its terms.** They are different hosts and
different questions. In this same episode one dataset stayed unbuilt afterwards —
correctly — because its DATA was reachable but its published TERMS page was not,
which is a §15.1 licensing question and not a connectivity one. Saying "blocked"
for both would have been wrong in two different directions at once.

**The rule, plainly: a failed request is a fact about one host at one moment.
Never about the network, never about the data, and never a reason to make it the
owner's problem.** Inherited blocks get re-probed; "a previous session said so"
is not evidence.
*(Every app, every day, until 2026-08-02. Owner: "You always can. You just see
one failure and assume the Internet is unreachable, but you never try the right
ways, and you always try the wrong way first.")*

---

## 13 · A guard nobody calls, and other ways a green tree lies

**Enforced by:** CHECKLIST plant-the-fault — the same mutation rule as §7g. A guard is not wired until breaking it turns something red.

*(photo-field-tools, 2026-08-02, building a new app from a written spec. Every
item here was found by making a check FAIL on purpose, or by looking at a
screenshot after the checks had already gone green.)*

### The guard that was never called

The light meter has one hard rule: with no calibration profile it shows relative
stops only and must never print an absolute EV or a lux value. The module had a
function for it, `canShowAbsolute()`, a header comment saying the rule was
"enforced in ONE place", and an acceptance check asserting no absolute value
reaches the panel. All three looked right.

Setting the function to `return true` — the most direct possible violation of
the rule — **changed nothing and the gate stayed green.** The render branch read
`calibrationState().calibrated` directly and never called the guard at all. The
function was dead, the comment was false, and the gate was passing for reasons
unconnected to the thing it claimed to protect.

Wiring the branch through the guard and re-running the same mutation produced
four failures including two crashes.

**The lesson is not "write a guard".** It is that **a mutation test is the only
thing that proves a gate is connected to the code it names.** A gate can be
correct, a guard can be correct, and the wire between them can be missing — and
every observable signal is identical to the healthy case. This is 7e's "comment
that made the bug sound principled" with a second layer: the comment described
an architecture that the code did not have, and the comment is exactly why
nobody checked.

**Do this on every load-bearing invariant before shipping it:** break it in the
crudest way available, watch the gate fail, put it back. If the gate does not
fail, you have learned something far more valuable than a passing run.

### A signal that distinguishes nothing

The hotspot grid must never let an UNTESTED lens combination read as a clean
one — spec called it load-bearing in the field. Four channels were declared and
documented: a dash instead of a number, an empty severity bar, a dashed hatched
border, and the word UNTESTED in the accessible name. The acceptance gate
checked fill, hatch, border style, text and accessible name. Green.

Then a screenshot: **a clean cell is severity step 0, so it also drew three
empty segments.** On that channel the two states were pixel-identical. One of
the four declared signals carried no information at all, and the register said
it did.

Fixed by drawing no bar on untested cells — *absence* versus presence is a real
difference; three empty boxes beside three empty boxes is not. The gate now
asserts absence rather than counting segments.

**When you declare N redundant channels, check each one against the state it is
supposed to distinguish FROM, not merely that it exists.** "Untested has an
empty bar" is true and useless. The question is always "and what does clean
have?"

### Two gate bugs that flagged correct code

Both would have been "fixed" in the app by anyone in a hurry, making it worse.

**Measuring inert content.** A modal opened with `showModal()` makes everything
behind it inert — unreachable by pointer, keyboard or AT. A structural sweep
over `document` still finds it, so every chip on the page behind "collided" at
0px with every control in the dialog, and f-numbers appeared as duplicate names
across two surfaces that can never both be live. Dozens of failures, all
imaginary. Scope structural checks to `dialog[open]` when one is open.

**Rects that extend past their clipping box.** A control inside a scroll
container has a `getBoundingClientRect` that runs on past the container when the
content overflows — so an off-screen chip appeared to sit 0px from a footer
button a finger could never reach it from. Intersect with every clipping
ancestor before measuring spacing. Size still uses the real rect; a 30px button
is 30px whether or not it is scrolled.

**And one more, on SC 2.5.3** (visible words must appear in the accessible
name): comparing `textContent` as a single substring is wrong the moment a
control is built from two elements. "Body" + "Z50 II" serialises as `BodyZ50 II`
with no separator, which can never be a substring of any sensible label. Use
`innerText`, tokenise into words, and strip trailing punctuation — otherwise
`VR.` in a label fails to match `VR` on the button and the gate teaches people
to ignore it.

**All four are the same failure**: the instrument modelled the DOM instead of
modelling what a person can reach and say. PALETTES.md §7 already says suspect
the instrument first; this is the same rule for structural checks, not just
colour ones.

### The grid column that widened the whole page

At 320px the entire page — header included — measured 345px and scrolled
sideways. The cause was two layers away from the symptom: `body` is a CSS grid,
a grid column defaults to `auto`, and an `auto` column sizes to its widest
descendant's **min-content**. The horizontally-scrolling hotspot matrix, sitting
correctly inside its own `overflow-x: auto` container, was still dictating the
width of everything above it.

`grid-template-columns: minmax(0, 1fr)` fixed it. **A scroll container can only
do its job if its ancestors are allowed to be narrower than it** — and in grid
and flex layouts they are not, by default. Worth checking on any app with a wide
table, code block or chart inside a grid or flex shell.

### Two test expectations that were wrong, not the code

Both caught immediately because the anchors came from outside the
implementation, which is the entire argument for writing them that way.

Vertical frame-fill needs *more* distance than horizontal, not less: the short
sensor dimension covers less real-world height at any distance, so a subject
already fills more of the vertical frame and you must back further away. And ISO
450 snaps *up* to 500 — it is an exact linear tie between 400 and 500, and the
geometric midpoint is 447.2, so log-space snapping breaks the tie upward. That
case is precisely the difference between log and linear snapping, and a suite
without it would pass with either rule implemented.

### When the spec contradicts itself, say which half you followed

Three places needed a written decision rather than a silent pick: the spec asked
for a press-and-hold gesture that Doctrine §4 forbids outright (built as a
toggle); §5.1 wanted a label "on the IR body" while acceptance §11.2 wanted it
on every result (took the stricter); and the spec's own derived figure was
wrong — "0.76× the f-number, i.e. about two-thirds of a stop" is right on the
ratio and wrong on the conversion, because aperture stops go as √2 and it is
0.78 stops. The app computes it rather than quoting either number.

**A spec is a document with bugs in it.** Implementing a wrong derived figure
faithfully is not fidelity, and neither is quietly correcting it. Compute from
the primary formula, pin it with a test, and put the discrepancy in NOTES.md
where the owner can rule on it.

---

## 14 · Gated in the code, freelance in the handoff

**Enforced by:** GATE hub:handoff-check.mjs — the handoff is a deliverable and has its own checker.

*(photo-field-tools, 2026-08-02. The owner, at the end of a build whose four
CI gates were all green: "Why the fuck do you get so many things wrong when
you start a new project? I have a very detailed doctrine and in this session
alone you've ignored all of it.")*

He was right, and the interesting part is WHICH rules got ignored.

**The rules that held, perfectly, all session:** contrast floors, touch-target
sizes, tremor spacing, offline behaviour, the acceptance criteria, the untested-
vs-clean distinction, no-lens-preloaded, no-filter-control. Every one of those
was checked by something that exits non-zero, and every one of them was also
deliberately broken once to prove the checker bites.

**The rules that were ignored, every single time they came up:** hand over the
preview URL (§7). Don't give Noah a manual step you haven't verified end to end
(§6). Don't diagnose his setup without evidence (§5b). iPad-first — no step
that assumes a desktop (§2).

Not one of those has a gate. All of them are prose.

**So the failure is not "the doctrine wasn't read".** It was read closely enough
to be quoted in the commit messages. The failure is that it was applied to the
ARTEFACT and not to the HANDOFF — rigorous about the software, freelance about
the sentence at the end that tells the owner what to do next.

### The single mechanism underneath all four

**Asserting something about the world outside the sandbox instead of checking
it, where the assertion creates work for the owner.**

- Told him to add Cloudflare secrets and create a Pages project. Both already
  existed. The deploy log said so and the log was one tool call away — the
  session had GitHub Actions access the whole time and never looked.
- Told him to upload an image "from the repo", to a man on an iPad, when the
  session could have attached the file directly.
- Deployed to staging four times and never gave him the URL, then told him the
  build was "waiting on your on-device pass".
- Modelled his converted camera from a spec document instead of from the
  hardware, and built a per-shoot wavelength dial after reading his own IR notes
  saying the cutoff is *"a fixed property of the camera, established once —
  never a per-shoot question."*

Each one individually looks like carelessness. Together they are one habit: the
code got evidence and the human got inference.

### What does NOT fix it

**Writing more doctrine.** There are 847 lines of it and every rule broken here
was already in there, stated plainly. A rule that was ignored once at 847 lines
will be ignored again at 900. Asking the owner to write it better is asking him
to pay for the session's mistake.

### What does

Doctrine's own answer, §15.7 and §16.8: **MAKE IT A GATE, NOT AN INTENTION. A
rule that lives only in prose is a rule that loses to whoever is in a hurry.**
That rule was written about pinning and pacing. It generalises to the handoff,
and this session is the proof: the gated half was clean and the prose half was
a mess, in the same repo, in the same hours, by the same process.

**The handoff is a deliverable and it needs a checker.** Before any "here's
where things stand" message:

- If a deploy ran, READ THE LOG and quote the URL from it. A workflow that
  exits 0 is not evidence of a deploy — a gracefully-skipped deploy also exits
  0. Check whether the steps ran or were skipped.
- Any claim about external state — secrets, projects, permissions, whether
  something exists — cites the log line or API response it came from, or it is
  not made.
- Any manual step handed over is either verified end to end, or accompanied by
  the reason it could not be. "Upload the file in the repo" fails this: the
  session never confirmed he could reach it, and could have just sent it.
- Any file the owner is asked to act on is ATTACHED, not described by path.

The first two are mechanically checkable and should be a script in any repo
that deploys. The last two are not, which is exactly why they need to be on a
list that gets read rather than left to judgement at the end of a long session,
when judgement is worst.
