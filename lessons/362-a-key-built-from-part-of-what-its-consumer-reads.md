## 362 · A key or a guard built from part of what its consumer reads fails silently in exactly the part it left out

**Enforced by:** CHECKLIST key-covers-consumer — when writing a cache key, a "does anything need X" guard or a rebuild trigger, list what the consumer actually reads and derive the key from that list, never from a shorter list that happens to sit nearby; then change one thing the short list leaves out and see the output move. For one instance in Jefferson-Photography-Studio, a colour mask joined into a group selecting in the export's pipeline as it does on its own, `tools/join-fold-check.mjs` on that app's held build refuses the commit.

**Smell:** an export or a rebuild that comes out byte-identical to its baseline after a change that should show; an Undo that returns the right controls and the wrong picture.

**Measured 2026-09-24 in Jefferson-Photography-Studio, twice in one night, the
same shape both times.**

- **The export ignored a joined colour mask.** `compileEdit` computed the
  colour key only when `masks.some((m) => m.type === 3)`, and `masks` there was
  each group's HEAD. The mask loop beside it folds every member of every
  group. So a colour mask joined to a gradient keyed on black in every export,
  quick-look preview and strip tile, while the shader, which computes the key
  unconditionally, showed the join on screen. Found because a workaround was
  rendered for the reader: its full export was byte-identical to the shipped
  one (MD5 equal) while the screen showed the change. In the export's own
  pipeline a saturated red inside a full gradient stayed (0.904, 0.169, 0.169)
  joined and went to 0.465 grey as its own head. The fix reads every member.
- **The screen's sky map ignored the masks.** `syncSkyMap` rebuilt the sky
  smoothing map only when a key changed, and the key was the edit with `masks`
  removed, while `buildSkyMap` renders every sample through the masks. After
  a mask changed, the screen kept a stale map and the export built a fresh one.
  Found by asserting Undo byte-exact: with a mask's own Foliage and smoothing
  on, one Undo of a whole-photo change left 97,096 sky pixels up to 34 levels
  off, and with smoothing at 0, or no masks, it was exact. The fix keys on the
  masks without their four bitmaps and keeps their stroke counter.

**Why it happens.** Both lists were written next to a list that was almost the
right one. `masks` meant heads because the adjustment belongs to the head; the
key dropped `masks` because they carry bitmaps too large to serialise. Each
reason was true. Neither asked what the consumer reads, which is the only
question a key or a guard answers. Nothing fails: the part left out simply
never changes the output, and a render of the common case looks right.

**Related.** §361 found a sheet whose candidates were byte-identical; this is the
same instrument, a byte-equal comparison where a difference was expected, used
on the product rather than on the pictures of it.
