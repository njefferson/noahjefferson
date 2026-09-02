## 54 · A new check is measured somewhere, and "somewhere" is a claim nobody checks

**Enforced by:** GATE fauxplane:scripts/plant.mjs — a plant proves the check goes red ABOUT THE THING, in the harness the check actually runs in. Nothing else in any pipeline can tell a working check from a check that cannot fail.

On 2026-08-05, five defects surfaced on one page in one message. The fourth was
the layout. Fixed, gated, shipped, reported — with a new assertion that the
scope must not start past half the viewport.

The sweep then said this, about my own check:

 GREEN layout: the centre picker goes back above the scope <-- the check does not work
 UNPROVEN the gate stayed GREEN with the fault planted

**The check ran at 1024x900.** It was written inside an existing function that
pinned a desktop context for unrelated reasons — the tap-geometry maths. With the
fault fully planted, the scope there starts **27% down**. The threshold was 50%.
It could not fail at that size, on any build, ever.

**Two independent guesses, and neither announced itself.** The *threshold* was
picked from intuition rather than measurement. The *viewport* was inherited from
whatever function the code was pasted into. Both were invisible: the check reads
as correct, describes a real defect, cites the complaint, and returns green.

Measured afterwards, which is what should have happened first:

- 1024x900 — 27% down with the fault planted. The check's home. Cannot fail.
- 1024x768 — 45%. Still under the threshold, still cannot fail.
- 390x844 portrait — 55%. Would have fired, barely.
- 390x640 at 200% text — **275%**. Entirely below the fold.

**The generalisation is uncomfortable.** A check inherits its conditions from
wherever it was written, and those conditions are rarely stated in the check.
Viewport, fixture, permission set, palette, clock, locale — each one silently
decides what the check can see, and a check placed where the defect cannot appear
is indistinguishable from a check that works. It costs nothing, runs forever, and
raises the count of things that are "gated".

**What replaced it, and why it is a different kind of statement.** Two questions,
both measured before being written:

- **What may sit above the instrument, BY NAME** — an allow-list of the controls
 read *while* looking at it. That is DOM order, so it holds at every viewport,
 including the single one the plant harness runs. **A check that survives
 `--quick` is a check a plant can prove**; one that needs a specific layout to
 fire may be unprovable in the harness that is supposed to verify it.
- **How much room they take, in rem** — so the reader's text size scales it
 instead of an assumed 16px. Recorded in the source with the real numbers on
 both sides of the fix: 11.1rem after, 17.45–41.59rem before, ceiling 13.

**Write the measurement into the check.** A threshold with the observed numbers
beside it can be argued with by the next person. A bare `> 0.5` cannot — it looks
equally reasonable at every value it could have had.

**And the defect the new check declines to assert is stated, not hidden.** At
200% text the header and tabs take 407px of a 640px screen before the page
begins, so the instrument is below the fold whatever that page does. The
tempting move is one lenient threshold covering both — green everywhere, meaning
nothing. It went in the release notes as still broken instead. **A gate that
cannot honestly assert something must say so out loud; a gate quietly loosened to
stay green is worse than no gate, because it reports coverage it does not have.**

**Smell:** a new check written inside an existing test function, reusing its
context. Ask what that context fixes — viewport, fixture, permissions, palette —
and whether the defect can appear there at all. If you cannot say what the check
measured, you have not written a check, you have written a sentence.

**A full end-to-end walk in a browser is still a "somewhere", and it is not an
iPad.** Quietkeep's update walk is as honest as a walk gets: a real second
service worker, a real press of the real control, an assertion that the swap
completed and nothing is left waiting. It passed every release. Then, on an
iPad: An installed app on iPadOS will not reliably let a waiting
worker take over while the app is open — a platform behaviour headless Chromium
does not have and cannot be made to have. The walk was not weak; it was
measuring a machine where the defect cannot occur.

The generalisable move, when the real platform is out of reach: stop trying to
prove the happy path harder, and **assert the FAILURE path instead** — that is
the one thing a wrong platform can still tell you. The fix here was that a
stuck update must not silently reload; the check is a source assertion that the
timed blind reload is absent, which runs offline, on any machine, and went red
the moment the old behaviour was restored. **When you cannot reproduce the
environment, gate the BEHAVIOUR the environment would have exposed.**

Corollary worth saying plainly: a fix to an update mechanism can only reach a
reader through the update mechanism it fixes. Say that in the release note
rather than letting them find out.

*(fauxplane 1.28.0 and Quietkeep 1.20.2, 2026-08-05. The check was shipped and
reported as working before the sweep contradicted it — the sweep ran after the
push, which is why it was caught in an hour rather than in four releases.)*

---
