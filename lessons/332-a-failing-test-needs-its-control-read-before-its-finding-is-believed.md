## 332 · A failing test needs its CONTROL read before its finding is believed, and a test that cannot isolate its claim is deleted rather than kept red

**Enforced by:** CHECKLIST — no parser can tell a finding from an artefact of
the harness.

A new test that goes red is usually treated as having found something. It has
found that *the measurement differed*, which is not the same claim. Between the
property under test and the number on screen sits the whole harness, and every
part of it can move for reasons that have nothing to do with the property.

**So a red result is read in this order.** What else changed between the two
measurements? Is there a version of this comparison where the property is held
OUT — where the thing under test contributes nothing — and does that version
come back clean? Only when the control is clean does the red mean what the
test's name says.

## What it caught, 2026-09-19

A walk was written to prove an infrared editor's sky selection does not drift
when the photograph is graded: build the selection under one look, rebuild it
under another, render back under the first, compare. **It failed on correct
code.** The obvious reading was a real drift bug in code that had just been
written.

The control was the identical comparison with the mask's adjustment NEUTRAL, so
the selection contributed nothing to the frame. **It failed too.** Switching a
look away and back does not return the same photograph in that app, with no
mask involved at all. The walk had been measuring that, and the selection was
never implicated.

Two things came out of one control. The finding the test claimed was false.
And a **real, separate defect** — a look that does not reproduce across a
switch — was found, recorded, and would otherwise have been shipped inside a
misdiagnosis of something else.

## The test was deleted, not kept red

Keeping it would have been worse than never writing it. A check that fails for
a reason other than the one it names trains everyone who sees it to read red as
noise, which is the one thing a gate cannot survive; and the next person to
touch that area inherits a failing test that accuses the wrong code.

**What it was chasing turned out to be guaranteed by a signature.** The function
in question takes a bitmap, a guide, a radius and a feather — it has no access
to the edit at all, so no grade can reach it even by mistake. A compile-time
guarantee is stronger than a browser walk, and the walk's own reasoning was
moved into that function's contract so a second one does not get written.

## The narrower half, worth its own line

**A readout too coarse to show the defect is not a test.** The first version of
that walk read a status line that rounds coverage to whole percent. The planted
bug — the generation path taking the live white balance instead of the
automatic one — sailed straight through it at "32%" either way. It was only
after the readout became a framebuffer hash that the plant was caught, and only
then that the control could be trusted to mean anything either.
