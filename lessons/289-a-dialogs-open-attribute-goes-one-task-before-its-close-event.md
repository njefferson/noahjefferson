## 289 · A dialog's `open` attribute is gone one task before its `close` event fires, so a harness that polls the attribute measures the moment before every handler has run

**Enforced by:** CHECKLIST settle-past-the-queued-task — after waiting on a DOM
fact that a browser API changes synchronously, yield one frame and one task
before asserting anything a QUEUED event handler was going to do. ·
JUDGEMENT — when a correct build fails a check deterministically while an
almost-identical probe passes, the difference between them is the instrument,
not the product.

**Smell:** `waitForFunction(() => !dialog.hasAttribute("open"))` followed
immediately by an assertion about focus, state or content. Any check that passes
when an extra round trip happens to sit in front of it.

**Measured 2026-09-14, Jefferson-Photography-Studio.**

`HTMLDialogElement.close()` removes the `open` attribute and restores the focus
synchronously, and then QUEUES the `close` event. Anything a `close` listener
does — here, putting the focus back into a grid whose keys only fire with focus
inside it — has not happened yet at the moment the attribute goes.

A walk polled for the attribute and pressed a key at once. It reported the fix
as absent, twice, deterministically, against a build where the fix was present
and correct. A probe written to diagnose it passed every time, and the only
difference between the two was one `evaluate` round trip, which had happened to
give the queued task somewhere to run.

The cure is in the harness, not the product: yield one frame and one task after
the attribute clears. That is the boundary itself rather than a guess at a
duration, and no reader can press a key inside that window.

**The general shape, which is not about dialogs.** A browser API that changes
observable DOM state synchronously and dispatches its event asynchronously has
two "afters", and the one that is easy to poll for is the earlier one. Waiting
on the easy one and asserting the late one's work is a race the harness loses
silently, and reports as a defect in the code.
