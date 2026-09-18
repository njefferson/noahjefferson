## 324 · A toggle pressed blind alternates, so a render is captioned with the control state read back, never the state it asked for

**Enforced by:** CHECKLIST caption-from-readback — an instrument that drives
a toggle reads its state first and presses only on a difference, and every
render it saves is labelled from the controls read back after settling, not
from the arm's own definition. · JUDGEMENT — a comparison sheet whose
captions come from intent cannot be told from one whose captions come from
measurement, and the one place the difference shows is the recorded state
that nobody reads because the pictures look right.

**Smell:** a per-arm "press X to turn X off" in a harness, with no read of X
before the press; a run log whose recorded states alternate down the page
while every arm asked for the same thing.

**What happened.** A candidate sheet for a film look rendered six arms per
frame through the real app, resetting the look between arms. One control —
a per-frame automatic behind a toggle — was meant to be OFF for the four
candidate arms so the sheet showed the look's own numbers, and each arm
pressed the toggle to get there. The look reset does not touch the toggle.
So the first arm turned it off, the second turned it back on, the third off,
the fourth on: two of the four candidates rendered with the automatic they
were defined as excluding. The pictures were plausible either way, because a
per-frame top-up and a stronger band look alike on a sheet, and the sheet
went out. What said so, the next day, was the run log: the instrument had
recorded every control's state under every render, and the lift column read
false, true, false, true.

**Why it is easy.** Pressing is what a harness does, and a press that lands
on a button with no state feels the same as one that lands on a toggle. The
arm's definition says "lift off", the code presses the lift, and the caption
is written from the definition. Nothing in that chain reads the app.

**The fix is two reads, not one.** Read the toggle before pressing and press
only when it differs from the state wanted; and caption the saved render
from the controls read back after the app has settled, so a caption can
only say what was measured. The second read is the one that would have
caught this on the first sheet — it did, in the log, and the log was not
part of the sheet.

**The cost.** One candidate pass thrown away and rerun (thirty renders,
about half an hour), and a sheet the owner had already been sent that
showed two of its four candidates under the wrong label.
