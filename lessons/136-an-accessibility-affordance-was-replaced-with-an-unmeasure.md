## 136 · An accessibility affordance was REPLACED with an unmeasured one, and the check written alongside it asked a question the new design could not fail

**Enforced by:** GATE 3d-printing-pal:tools/a11y.mjs — `checkChips` measures the
CONTRAST RATIO between a control's on and off fills against SC 1.4.11's 3:1, not
whether the two values differ. · CHECKLIST replacing-an-affordance — when an
accessibility cue is removed, name the failure mode it covered and produce a
NUMBER for the replacement against that same mode, before the change ships.

A set of filter buttons said which job types were showing with a tick. The tick
was a shape: unambiguous, and independent of colour by construction. It was
replaced with a lit state — the type's accent as text and border over a raised
surface — and the risk was correctly identified in the commit that did it: **if on
and off differ only in hue, greyscale, colour blindness and a bright screen all
lose the answer.**

**The mitigation was asserted rather than measured.** The comment in the stylesheet
said the fill was the cue that survives all three. The fills differed by **1.63:1
in the dark theme and 1.54:1 in the light one**, against a floor of 3:1. So the
fill contributed nothing and the state rested entirely on grey-to-colour — the
exact failure that had been named, shipped in the same commit that named it.

**THE CHECK WAS WRITTEN TO CONFIRM THE DESIGN RATHER THAN TO TEST IT.** It asserted
the two fills were different. They were, as strings: `rgba(0,0,0,0)` against
`rgb(65,65,65)`. That check could not fail unless the same value had been written
twice by accident. **A test that cannot fail against the design it was written
beside is a restatement of the design.**

The number was available in the same file. `ratio()` had been sitting in
`a11y.mjs` the whole time, the palette gate measures 3:1 for non-text, and the
reach was for `!==` instead.

**And the render was looked at, which is what made it feel checked.** The screenshot
read as lit and unlit to the person who had just chosen the colours, on a large
display, with full colour vision. Rendering and looking is the right instinct and
LESSONS 124 exists to demand it — but looking is a measurement by whoever is
looking, and it cannot answer a question about somebody else's eyes.

**Two rules, and the first is the cheap one.**

Whenever an accessibility affordance is REMOVED — a tick, a shape, a text label, a
second cue of any kind — the thing replacing it owes a number against the same
failure mode. Not a sentence in a comment. The old cue was doing work; state what
work, and measure that the new one does it.

And a gate written in the same commit as the design it checks has to be written as
a question the design might FAIL. If the answer is obvious while writing it, it is
not a check. Inequality is not perceptibility; presence is not reachability;
existence is not correctness. Each of those pairs has cost this family a release.

**The fix measures 9.14–10.35:1 in the dark theme and 5.04–7.83:1 in the light
one, and the difference is LUMINANCE rather than hue** — which is the property that
survives colour blindness, greyscale and sunlight. A hue survives none of them.

---
