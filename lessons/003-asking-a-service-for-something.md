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
*(photo-pointer, 2026-07-27 — roughly fifty pointless requests before the pattern
was caught: hammering shared infrastructure that had already signalled it was
struggling.)*

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
