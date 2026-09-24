## 351 · A population statistic loses the pixels the control broke, so it falls smoothly across the frames it helps and the frames it destroys

**Enforced by:** CHECKLIST population-leaves-the-average — before reading a
population statistic as evidence about a control, ask whether the control can
move a member OUT of the population being averaged. If it can, the statistic is
measuring the survivors, and it will vary smoothly whatever the control does to
the rest. Name that mechanism in writing beside the number, or do not quote the
number.
**Enforced by:** CHECKLIST proxy-key — when a control keys on a cheap proxy for
the property it is actually aimed at (brightness for shade, hue for material,
size for importance), the corpus that prices it is chosen by the PROPERTY and
never by the proxy. A corpus sampled along the proxy cannot show the proxy
failing, because every frame in it agrees with the proxy by construction.
**Enforced by:** JUDGEMENT — no parser tells a statistic that carries its whole
population from one that loses it, and §328's gate only forces the renders to be
OPENED. Opening them is what worked here. The number was computed correctly the
whole time and pointed the wrong way the whole time.

**Smell:** a statistic averaged over a class of pixels that the control being priced can move pixels OUT of, such as the saturation of "foliage" pixels under a control that desaturates them. Also: a curve that falls smoothly and monotonically across every frame with no break, for a control that is visibly destroying some of them.

**Measured 2026-09-22 in Jefferson-Photography-Studio.** A shadow-desaturation
control was being priced for a false-colour look: nine raw frames, four amounts
each, thirty-six renders, with a foliage-population saturation printed beside
every one.

**The statistic said there was one smooth trade.** Across all nine frames the
figure fell from 0.64–0.75 at the control's off position to 0.40–0.54 at its
strongest, monotonically, frame by frame, with no break anywhere. Read as a
curve it is the textbook picture of a knob with a cost: turn it up, lose some
colour, pick a point.

**The renders say there is no such point.** At the strongest setting the
control costs nothing visible on one frame — a granite shoreline where it
removes red speckle from grey rock and touches nothing else — and has already
destroyed the look on another at half that strength, leaving a conifer stand
grey. Four of the nine are helped at every amount and four are ruined before
the halfway mark. That is a categorical split, and it is not in the numbers at
any amount.

## Why the number cannot see it

**The pixels that break leave the population.** The statistic averaged
saturation over pixels classified as the look's colour. The control's damage
IS desaturation, so a ruined pixel stops being counted — the average is taken
over whatever still qualifies, which on a destroyed frame is the handful of
survivors that were brightest. A frame that lost ninety per cent of its
coloured pixels and a frame that lost none can report the same mean, and did.

This is not a coding error and there was none to find. The classifier was
correct, the arithmetic was correct, the number was the right number for the
question it answers, and the question it answers is not the one being asked.

## Why the corpus agreed with the mistake

**The frames were chosen along the proxy.** The control keys on how dark a
pixel is, and the corpus was picked as shadow-rich against flat — which is a
sample stratified by exactly the quantity the control keys on. Every frame in
it was therefore a test of "how much shade is there", and the defect is "what
is the shade made of". Three of the four frames that turned out to be ruined
had been chosen as the safe ones.

The failure was legible the moment the renders were opened side by side and was
unreachable from any amount of sampling along that axis. **A corpus designed to
price a cost cannot discover that the cost was mis-specified**; it can only put
a number on the thing it was built to number.

## The shape, for other apps

A control that keys on a proxy has two populations that the proxy conflates,
and they are usually the artefact and the subject. The tell is that both live in
the same band of the proxy: dark ground and dark leaf, low-traffic and broken,
small file and unimportant. Where that is true, no threshold separates them and
no statistic over the band reports it — the separation has to come from a
selection that knows the property, or the control stays a per-shot tool a person
aims by hand rather than something applied automatically.

**And the per-shot tool is not the consolation prize.** It was already right.
What the nine frames refuted was applying one amount to every photograph, which
the app's own decision record had rejected in writing before any of this was
rendered, on a frame whose identifier nobody had written down — so the rejection
could not be re-opened and got re-litigated with pictures. **A rejection with no
named evidence behind it will be tested again.** Recording the frame is what
makes a rejected option stay rejected.
