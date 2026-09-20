## 344 · A correction to something the app generates has to be stored as the GESTURE, not as the result

**Enforced by:** GATE Jefferson-Photography-Studio:tools/mask-fix-walk.mjs —
makes a correction, then drags the control that regenerates the thing, and
fails unless the correction is still there.
**Enforced by:** CHECKLIST what-regenerates-this — before letting a reader
edit anything the app produced for them, list every control that rebuilds it.
If any of them assigns the whole artefact, the edit cannot live inside the
artefact.

An app generates something for the reader — a selection, a layout, a summary,
a schedule — and gets it wrong on this one input. The obvious way to let them
fix it is to let them edit the thing. It is also the way that quietly throws
their work away.

**In a photo editor: a Sky mask is a bitmap the app finds from the photograph,
and three controls rebuild it — a reach slider, a feather slider and a toggle.
Each one assigns the whole bitmap.** Painting a correction into that bitmap
works perfectly until the reader touches any of those three, at which point
their hand work vanishes with no message and no undo entry that would bring it
back. The feature would pass every test anyone would think to write, because
the tests would not drag a slider afterwards.

**The fix is not to protect the bitmap. It is to store what the reader DID.**
A list of strokes — where the finger went, how wide, and which way — replayed
over whatever the generator produces next. The generator stays live, the
correction stays where it was put, and the two compose in one direction with
no ambiguity about who wins.

## The three things that make it work rather than nearly work

**One rasteriser, shared by the live preview and the replay.** The preview
under the finger and the replay after the fact must be the same code, or the
correction changes shape the moment it is finished — which reads as a bug in
the drawing and is a bug in the storage.

**The composite is derived, and derived data is where the stripping
temptation lives.** The replayed result is a second copy of a large buffer, so
"strip it from the undo snapshot to save memory" is the obvious optimisation
and it is a data-loss defect: in this app the preview renders on the GPU and
the export renders on the CPU from a *clone* of the edit, so a stripped
composite puts the corrected version on screen and the uncorrected one in the
saved file. The safe contract is copy-on-write — always freshly allocated,
never mutated after assignment, shared by reference — which is what the same
app already does for painted bitmaps, and what nobody thought to apply to the
derived one.

**And the preview is incremental or it is quadratic.** Rebuilding the whole
composite on every pointer move replays the stroke so far on each move, so the
hundredth move of a drag replays a hundred segments. Stamp only the new
segment into a buffer allocated when the gesture started; the replay at the
end is what makes it exact.

## What it measured

One take-out stroke moved the selection from 54.0% of the frame to 39.6%.
Dragging the control that rebuilds the whole selection from the photograph
left it at 39.8%, against 54.2% for the same control position with no
correction — so the regeneration happened and the stroke survived it. Clearing
the strokes returned exactly the uncorrected number. On a full-size export,
85.3% of the stroke's band differed from an uncorrected export and the rest of
the frame was identical to the byte.

**Jefferson-Photography-Studio, 2026-09-20.** The conventions it follows are
Lightroom's (a generated Select Sky is a *component* of a mask that a brush
adds to and subtracts from) and darktable's (drawn shapes combined with a
parametric mask, per module) — in both, the reader never edits the generated
weight, they add terms to it.
