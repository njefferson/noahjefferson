## 319 · Every instrument built after a diagnosis measures the diagnosis, so no measurement can contradict it

**Enforced by:** CHECKLIST measure-something-the-hypothesis-does-not-predict — when
a diagnosis has survived more than two failed remedies, the next measurement is
not a better version of the last one. It is a quantity the hypothesis says
nothing about, chosen so the hypothesis can come out WRONG. · JUDGEMENT — a
framing chosen in the first hour silently selects every instrument after it, and
instruments that agree with each other are not corroboration when they share a
parent.

**Smell:** three or more remedies aimed at the same stage, each failing for its
own plausible reason. A defect described in the words of a subsystem ("colour
noise", "a caching bug", "a race") before anything was measured. A run of
measurements that all confirm the frame and none that could have broken it. And
the specific tell: a number appears in your own output that the hypothesis does
not account for, and the next thing written is a plan that ignores it.

**Measured 2026-09-17, Jefferson-Photography-Studio, across two days and eight
failed remedies.**

Pale speckle was reported in an infrared sky. It was described as splotchy
COLOUR, on a colour look, so it was framed as colour noise within the first
hour. Everything after that was selected by the framing: a decision-based
median on colour, a narrow colour blur, a wide colour blur, a fixed floor on
that blur, a per-photograph strength for it, a local gate on it, per-channel
strength on the luminance filter aimed at helping colour, and finally aiming the
colour blur at one channel. Eight. Each had a measurement behind it and each
measurement was of chroma, so every result was consistent with the frame.

**The defect was luminance.** The filter that could have reached it — the
bilateral's spatial window — had been left at 5x5 while the COLOUR half of the
same function was widened to a thirteen-pixel span months earlier, for the
explicit reason that the artefact is three to five pixels across and a five-pixel
window cannot flatten something that nearly fills it. That asymmetry was written
in the repository's own research file the whole time. The fix is one constant.

**What broke the frame, in order, and none of it was insight.**

A trace was run only because the owner corrected the METHOD — stop working the
tip of the branch until it is pulp and then moving one joint up; start at the
beginning and follow the thing forward. That produced a quantity nothing had
measured: the share of the residual that was ACHROMATIC at each stage. It read
29.3% at the final pixel.

**And that number was reported and then walked past.** The next act was a plan
for a ninth colour-side remedy. The datum that contradicted two days of work was
on screen, in a list, in its author's own output.

What actually stopped it was a GATE written into the plan before the work began —
"measure what fraction of the visible colour noise sits in the component the
current stage keeps; if it is small, the diagnosis is wrong, build nothing." It
came back 11.9%. That refused the ninth attempt.

**The transferable part is the gate, not the diagnosis.** A hypothesis that has
already survived several failures will not be killed by another measurement
designed under it. It has to be put at risk in advance, by a number written down
before the run with a threshold that forbids building. Writing the kill condition
is cheap while you still believe the hypothesis; it is nearly impossible once a
remedy is half-built.
