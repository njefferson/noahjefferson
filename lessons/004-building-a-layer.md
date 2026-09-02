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
