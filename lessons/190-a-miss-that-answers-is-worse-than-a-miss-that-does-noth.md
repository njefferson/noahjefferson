## 190 · A miss that answers confidently is worse than a miss that does nothing

**Enforced by:** JUDGEMENT — no gate can tell a press that reached its target
from one that missed and was answered by something else, because both produce
a correct-looking result. · CHECKLIST measure-the-target — for anything pressed
with a finger, measure the tappable width by walking out from its centre and
asking the document what is on top; do not read the radius out of the source
and assume it. · CHECKLIST what-does-a-miss-do — for every small control on a
surface that also handles presses, ask what the press does when it misses, and
whether the reader could tell that it missed.

**Smell:** a control drawn with a radius or a size in single-digit pixels.
Also: any surface where a background handler answers presses — a map, a canvas,
a chart — with small controls drawn on top of it. Also: a report that a control
"does nothing" or "does the wrong thing" when the control is demonstrably
wired up and works under a mouse.

An app for reading a river on a riverbank drew its pins as small circles: 13
pixels across for a public access site, 11 for an idle tide station, 19 for the
live one. Measured, not read off the source. The floor for a finger is 44.

Being fiddly was not the defect. The defect was what a miss DID. The map's own
handler ran and answered the miss as a question about the depth of the water
underneath it — so pressing a circle labelled "places I can go" returned a
depth reading, confidently, with a sentence explaining itself. The reader's
report was that the circles could not be pressed and returned depths, and that
was an exact description of a thing nobody had designed.

**Nothing is a better wrong answer than something.** A press that does nothing
invites a second, better-aimed press. A press that returns a plausible answer
ends the question, and the reader concludes the control is decoration. The same
shape appears wherever a fallback is more confident than the thing it stood in
for.

**The obvious fix is the wrong one.** A 44-pixel transparent disc under every
pin blankets a zoomed-out map carrying ninety of them, and the press the whole
app exists for stops working. Resolve the press in code instead: the nearest
target within a finger's width wins, and if none is near, the surface keeps the
press. That also picks the NEAREST rather than whichever transparent shape
happened to paint last, which a stack of discs cannot do. The dense layer —
hundreds of soundings, three pixels apart — is deliberately left out, because
rescuing a near miss there would mean no press ever reached the surface again.

**And the reason it was reported as two complaints, not one.** The same message
said the circles looked like the other markers. They did: a green ring on a
dark middle beside a teal ring on a dark middle, at five pixels' radius,
outdoors. Two small controls that are hard to hit and hard to tell apart are
one defect wearing two coats, and fixing only the geometry would have left the
reader still unable to say what they had pressed. Hue is the cue a colour-blind
reader does not get and the first one sunlight takes; the difference has to be
a SHAPE.
