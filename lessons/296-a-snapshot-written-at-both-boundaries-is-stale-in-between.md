## 296 · A snapshot seeded on arrival and rewritten on departure is stale for the whole interval it is most read in

**Enforced by:** CHECKLIST live-over-cached — any reader of "this thing's current
state" checks whether the thing is the ACTIVE one first, and answers from the
live object rather than from the cache when it is. · JUDGEMENT — a cache keyed by
identity, written at both ends of a visit and never during it, is correct
everywhere except the case that matters.

**Smell:** a map from id to a snapshot, written in an `activate` and again in a
`deactivate`, read by anything asking what an item currently is. A per-item cache
consulted while that item is on screen. `flushRecord`-style functions that move
an undo stack and are mistaken for a write-through.

**Measured 2026-09-14, Jefferson-Photography-Studio.** A photo editor keeps a map
of working states, one per photo in the session, so leaving a photo and coming
back restores it. The map is SEEDED when a photo is activated and REWRITTEN when
it is left. Both writes are correct. Nothing writes to it in between, and in
between is the entire time the reader is editing.

The function answering "what is this photo's own edit" read that map first. For
every photo except the open one it was right. For the open one it returned the
state the reader ARRIVED in — so pressing a look changed the frame, changed every
other tile in the strip, and could not change the tile of the photograph the
reader was looking at, because that tile's stamp was computed from the arrival
state and never moved. The one tile a reader checks a look against first was the
one tile that never followed.

**Why it reads as correct.** The map is genuinely the answer for N-1 of N items,
and the one it is wrong about is the one whose live state is sitting in a
module-level object a few lines away — so the defect is invisible in the function
(which reads a well-named map) and invisible at the call site (which asks a
well-named question). It also cannot be found by reasoning about staleness in
general, because the map is not stale: it is exactly what was written, at both
moments it is written.

**The fix is one line and the shape generalises.** Ask whether this is the active
item before consulting any per-item cache of live state, and answer from the live
object when it is. The cache then means what its name says — what each item was
when you last left it — instead of meaning that for some items and something else
for one.

**And it explains why a second defect stayed latent.** A neighbouring bug flattened
an opened photo's tile, and nobody saw it, because nothing ever redrew that tile:
arriving at a photo does not change its stamp by design. Fixing this one, and the
toggle that never redrew the strip, would have made the flattening universal.
Defects in the same machinery hide each other, and the one you fix first decides
what the reader sees next — so they ship together or they ship as a regression.
