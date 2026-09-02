## 82 · Removing an unwanted automatic behaviour means enumerating its TRIGGERS, and the reported one is rarely the only one

**Enforced by:** JUDGEMENT — no gate can see it, because each partial fix is correct, tested, and closes the case it was opened for. **Smell:** a fix whose subject is *when* something happens rather than *whether* it should. Grep for every assignment to the flag that gates it; if the initial value was not one of the things you changed, you have not finished.

A surface put a forced choice on screen by itself. It was fixed twice, correctly,
and it kept happening.

- The first fix stopped a **capture** turning it on. Ten thoughts in a row had
  meant ten interruptions on the one path that must stay frictionless. Real
  defect, real fix, shipped with a comment explaining it.
- The second stopped an optional preliminary pass **leading** when there was
  nothing for it to do — an optional step you decline on every item is a toll
  with a bypass. Also real, also fixed, also documented.
- Nobody looked at the **initial value of the flag**, so arriving with anything
  waiting still walked you straight into it. That is the modal session — in this
  category the typical open is a re-entry after weeks, which is exactly when the
  queue is longest and the interruption costs most.

Both fixes were about *which trigger* fires the behaviour. Neither asked whether
the behaviour should exist. The flag was named for suppression and initialised to
"not suppressed", and every fix since had adjusted the transitions and left the
starting state alone — so the surface's default was still to intrude, and each
fix had narrowed the ways it could rather than removed the fact that it did.

**Why it survives fixing.** A partial fix is indistinguishable from a whole one
from the inside. The reported path is now quiet, the test asserting it passes,
and the comment in the code says the class was addressed. The next session reads
that comment and reads *this behaviour has been dealt with*. Each fix makes the
remainder harder to find, because it looks like the ground has been covered.

**Two things that would have caught it, both cheap:**

- **Enumerate the triggers before fixing the reported one.** Every caller, every
  transition, and the initial value. Write them down; fix the class or say in
  the commit which ones you are deliberately leaving.
- **Look at the markup order.** The surface rendered at document order 218 and
  the thing the app exists to answer rendered at 384. That is readable without
  running anything, and it said plainly that the interruption was structural,
  not incidental. Nobody had looked, through two fixes aimed at the same spot.

**The general shape:** when the complaint is *it does this by itself*, the fix is
not a better condition on the trigger you were shown. Ask what turns it on, in
full — including the value it starts with — and then ask whether it should turn
itself on at all. **A behaviour with three triggers and two fixes is not
two-thirds fixed; it is still a behaviour that happens by itself.**
