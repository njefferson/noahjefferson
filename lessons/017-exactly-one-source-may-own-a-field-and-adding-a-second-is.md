## 17. Exactly one source may own a field, and adding a second is silent

**Enforced by:** CHECKLIST one-owner-per-field — when a second writer is added to any field, answer "which source owns this right now" in the code, not in your head.

An app gained a mode where a live data feed drove the same values the device's
own sensors did. Both kept writing. Nothing errored, nothing warned, and no
test failed — the store simply held whichever write landed last, and the two
sources ran at different rates, so the number on screen alternated between two
completely different realities several times a second.

**"Which source owns this field right now" has to be answerable, and it has to
be answered in one place.** Adding a second writer to a field is not an
additive change; it is a race, and a race between plausible values is invisible
in exactly the way a race between a value and a crash is not.

The shape that worked: every sensor takes an `owns` predicate and stops
WRITING when another source has the field — but keeps RUNNING, so its filters
stay converged and are ready the moment ownership comes back.

*(fauxplane, 2026-08-02.)*
