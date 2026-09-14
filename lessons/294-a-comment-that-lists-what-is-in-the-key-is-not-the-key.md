## 294 · A list that states its own completeness is the list nobody checks against the code, and the item missing from it is the one nobody looks for

**Enforced by:** CHECKLIST key-from-the-render — a cache key is derived by
listing what the RENDER READS, in the function that renders, and nowhere else; a
prose list beside the key is a summary, never the source. · JUDGEMENT — a comment
asserting that an enumeration is complete makes the enumeration harder to
correct, not easier to trust.

**Smell:** "everything that would make this wrong is in the key". "all of it
below". "each of these is handled". Any enumeration whose header claims it is
exhaustive. A key built by hand from a list, while the thing being keyed reads
module-level state the list does not name.

**Measured 2026-09-14, Jefferson-Photography-Studio.** A quick look renders every
picked file through the real pipeline and keeps the pictures on the device, keyed
on the file's identity, the build's declared pipeline version, the preview size
and the reader's lens profiles. Above the key, a header: *what makes a cached
picture wrong, and every one of these is in the key* — then four bullets, one of
which even carried a measurement.

The renderer also reads the live creative grade: the look, the channel swap, the
white-balance bias and the depth lift. That is the whole point of the grid, and
it was in neither the list nor the key. Scan a folder under one look, press
another, scan the same folder: every tile came back under the first look, and the
app said so in its own words — *3 of 3 came back from this device, no decoding
needed*. A cache reporting a hit is reporting that its key matched, which is a
fact about the key and not about the picture.

**The list is what made it survive.** Three separate pieces of work touched that
file, and each read a header saying the enumeration was complete and moved on.
An item missing from a list that admits it might be incomplete gets added by the
next person who notices; an item missing from a list that says it is complete is
read as deliberate.

**And the damage compounded downstream.** The stored row also carried a
strip-sized twin, handed to the session when a reader keeps the set — and the
session stamped it with the CURRENT grade, under a comment that said *the grid
rendered this one under the live grade*. True of a fresh render, false of a hit.
A stale picture marked CURRENT is worse than a stale picture: the machinery that
redraws tiles only ever looks at ones whose stamp has stopped matching, so that
tile could never be found again.

**What to do instead.** Derive the key from the render rather than from a list
beside it: the function that builds the picture names every input it reads, and
the key is built from those names. Where a version number stands in for code that
cannot be derived, gate it — a hash of the sources the render is made of, refusing
the commit until the number moves, which this repo family already had and which
is why only the RUNTIME half of the key could rot. And when the key changes shape,
raise that number even though a longer key misses by itself: rows written before
carry no record of the state they are pictures of, so they must be unreachable
rather than merely unmatched.
