## 191 · The view is a conversation, and the reader's last word has to win

**Enforced by:** JUDGEMENT — three different mechanisms produced the identical
symptom, and no gate distinguishes "the map did not move" from "the map moved
and something moved it back". · CHECKLIST one-door-for-the-view — every change
to a shared view goes through one function; a call that reaches the widget
directly has none of the guards and nothing says so. · CHECKLIST
claim-not-clock — when an async result may apply a view, have it capture a
claim at the moment of the press and check it on arrival; never a time window.

**Smell:** a go-there button reported as broken that works when its function is
called from the console. Also: `animate: true` on a move whose distance is not
bounded. Also: any async handler that applies a view when it resolves, with no
check that the reader still wants it. Also: several call sites doing the same
thing to a widget, one of which is a helper with guards in it.

A button that returned the reader to their own position stopped working, and
finding out why took four wrong diagnoses. Each fix revealed the next, and
every one presented identically: the map did not go where it was told.

**An open popup tethers the map.** Leaflet re-pans to keep a popup in view
whenever the view resets, so pressing a pin and then the go-back button arrived
at the destination and was hauled straight back to the pin. A label two hundred
miles away was insisting on staying visible, and the button looked dead.

**`animate: true` disables the library's own safety rule.** Leaflet refuses to
animate a pan longer than the window — its source says the tiles are lost and
the map lands in the wrong place — and asking for animation explicitly turns
that refusal off. A long jump therefore requested a smooth pan of hundreds of
thousands of pixels and did not move at all. A move that begins off screen was
never an animation anybody could follow; it is a jump.

**A fetch started by an earlier press applied its view on arrival**, over the
top of wherever the reader had gone in the meantime. Fixed with a counter, not
a clock: every view the reader asks for takes the next number, and a background
task holding an older one has been overruled and says nothing. A time window
would have to guess how slow the signal is, which is the thing it cannot know.

**And the reason the guards did not help: seven call sites bypassed them.**
Every go-there button called the widget directly rather than the helper that
held the deferral guard and the animation guard. **A guard in a helper protects
only the callers that go through the helper**, and nothing in the code had ever
said they must. Putting the guard in was half the work; finding the six other
doors was the other half.

**The general form.** A shared view is not a variable that the last writer
wins by accident — it is a conversation between the reader and several
background tasks, and the reader's most recent word has to beat every earlier
one regardless of which arrives last. Anything that can move it needs to say,
on the way in, whose idea it was.
