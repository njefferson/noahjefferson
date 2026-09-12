## 282 · Two controls with the same shape and different scopes: the narrow one is the one in reach, and the reader's files prove it

**Enforced by:** CHECKLIST scope-in-the-label — where two controls do the same
VERB over different amounts (this run against everything; this page against the
whole document; selected against all), each label names its own scope, and the
wider one is reachable at the moment the narrow one is. A control whose scope is
only in the surrounding prose has no scope. · JUDGEMENT — the evidence is what
the reader's output looks like, not what they say about the UI.

**Smell:** "Save", "Export", "Copy", "Delete" appearing twice on one surface
with nothing but position to tell them apart. Also: a wide-scope action placed
after a variable-length list, so how far the reader must travel to reach it
depends on how much work they just did.

**Infrared Photography Studio, 2026-09-12.** A lens rig has "Save as a file",
which writes the run just finished, and "Save a backup of all of them", which
writes every profile on the device. The first sits in the result's own action row.
The second sat below the whole results list — which is as long as the number of
frames measured, so after a ninety-frame run it is several screens down on a
tablet.

Four batches were measured. **Four single-run files came out and no backup**, and
the backup was reported as not findable straight after an import. That is the
whole diagnosis, and it arrived as four attached files rather than as a complaint
about the UI: the reader pressed the button that was there and got what it does.

**The fix has two halves and the second is the one that gets skipped.** Moving
the wide action into reach is obvious. Making both labels state their own scope —
"Save this run as a file" against "Back up every profile on this device" — is
what stops the reader having to remember which is which, and it is the half a
diff-minded change leaves out, because the old labels were not WRONG.

**Why the placement was not an oversight.** The wide action belongs with the
stored-profile list, which is the right home for it; the error was assuming one
home is enough. One implementation, two places to press it, and the note each
writes says which scope ran.
