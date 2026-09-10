## 268 · A measurement taken somewhere other than where the report came from does not refute the report, it changes the subject

**Enforced by:** CHECKLIST measure-where-they-stood — before a report is
answered with a measurement, the measurement's conditions are compared against
the report's, item by item, and any that differ are named in the reply. ·
JUDGEMENT — a number that disagrees with a report is first evidence about the
instrument, and only then about the claim.

**Smell:** a reply of the form "measured it and it fits", where the report came
from a device and the measurement came from a test harness. Any browser walk
with one viewport doing duty for every viewport. A conclusion of *no fix
written* resting on a single number.

**Quietkeep, 2026-09-10.**

A cold read of the deployed app reported the sorting question at y=655 in an
844px viewport with the answers cut off, and counted sixteen scrolls for
sixteen items.

The next release measured it. Inside the job, in the walk's own viewport, the
question sat at 217, the card at 250, the first answer at 341, and the last of
nine ended at 670 — comfortably inside 720. **The release concluded that the
finding did not reproduce, wrote three assertions to hold the margin, and
shipped no fix.** The commit says so in its first line, and it was wrong.

**The walk is 720px TALL, and that was the half that got checked.** The half
that mattered is WIDTH. The content column caps at 600px, so from 600 up the
frame is short and the card's prose reflows wide; the walk sits above that cap
and the reader's phone sits below it. Measured at 390x844 — their viewport, not
one near it:

    frame ends 484 · question top 655 · first answer top 779, bottom 882
    last answer bottom 1310 · 9 of 9 answers below the fold

The 655 is theirs to the pixel. And it is WORSE than reported: not one of the
nine answers is fully on screen, the first being cut by the bottom edge. Every
item costs a scroll before any answer can be read, exactly as counted.

**What makes this expensive rather than merely wrong.** A measurement carries
more authority than a report, so it closes the question — and it closed this
one for a release, under three green assertions that will keep passing forever
because they measure a viewport nobody uses. The finding survived only because
somebody went back to it; nothing in the pipeline could have.

**And the second guess was ruled out the same way it was made.** The release
also guessed the scroll being counted was reaching the DOOR on the runway, and
wrote a probe that read `door top 0, hidden true` — an element that is
`display:none` outside its own stance, so the zero was about nothing. Measured
properly, the door is at 591–664 of 844 and needs no scroll at all. Two guesses,
two measurements, and neither was taken where the reader was standing.

**The rule this leaves.** A walk that measures layout owns a viewport per
CLAIM, not a viewport per walk — and the one that must exist is the one the
reports come from. Quietkeep's walk now measures the sorting surface at
390x844 and prints every number on every run.

**And what to do when the honest assertion would be red.** The true claim here
is that no answer is below the fold, and it fails today. Shipping it red puts a
permanent failure in CI, which is a gate everybody learns to read past — worse
than the defect. So the measured state is recorded as a RATCHET: it may shrink,
never grow, with the number printed every run and the defect written up as
open. A ratchet is honest about being a holding action; a threshold picked to
pass is not.

**Related.** §262 — a cold reader's finding is a fact about the READER's view
until somebody checks whose view it was; this is the mirror, where the checking
was done in the wrong place. §266 — a control that passes has told you about
your instrument first.
