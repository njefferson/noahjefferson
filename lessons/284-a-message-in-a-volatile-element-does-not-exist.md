## 284 · A message written into an element something else rewrites does not exist, and polling for it proves nothing either way

**Enforced by:** CHECKLIST message-outlives-the-moment — any explanation, warning
or reason gets an element NOTHING ELSE WRITES TO, and the check for it reads that
element at the END of the operation rather than racing it. A line that shares an
element with a progress readout is a line nobody has read. · JUDGEMENT — the
smell is a test that has to poll to find the thing it is testing.

**Smell:** `status.textContent = "why this happened"` a few lines above a loop
that sets `status.textContent` on every iteration. Also: any assertion
implemented as `setInterval` sampling the DOM hoping to catch a string.

**Infrared Photography Studio, 2026-09-12.** A rig was changed so that frames
picked while a measurement is running join it instead of starting a second
measurement over the same panel. On the pass that follows, the set is larger than
the one the reader last picked, so the run explains why its count grew.

That explanation was written into the progress line — and the next thing the run
does is read the set, which rewrites that same line on every file. The message
existed for a few milliseconds.

**What is worth recording is how it was found.** The harness polled the progress
line every 200ms for the whole run and never once caught the string, and the
honest reading of that is not "the message is missing" — a 200ms poll against a
line that changes faster is evidence about the poll. Both readings were open, and
the one that settled it was to stop racing: give the message an element of its
own, then read that element once, after the run ends, where a persistent message
must still be and a transient one cannot be.

**The rule underneath.** A message's lifetime is a design decision, not an
accident of which variable was in scope. If it explains something the reader
needs while they act, it lives until the action ends. And a check that has to
catch a message in flight is testing the harness's timing; a check that reads a
resting state is testing the app.
