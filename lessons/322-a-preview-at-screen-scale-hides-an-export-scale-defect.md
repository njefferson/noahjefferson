## 322 · A preview at screen scale hides an export-scale defect, and a statistic on the population you were fixing cannot see what you broke outside it — and a fix that leaves the instrument's reading unchanged has not touched the cause

**Enforced by:** GATE `sky-stage-walk` (Jefferson-Photography-Studio,
`tools/sky-stage-walk.mjs`) — a smoothing stage is exported twice through the
real app, on and off, and the per-pixel chroma displacement between the two
files is bounded OVER THE WHOLE FRAME: max at the stage's own gate, the 99.9th
percentile at the defect's amplitude, and a floor so a stage that does nothing
also fails. · CHECKLIST measure-the-file-not-the-screen — a pixel stage is
verified on the app's EXPORT at the scale the reader keeps, with a picture of
the region the stage was not meant to touch, before the preview is believed.
· JUDGEMENT — the statistic that proved a fix works was built on the population
being fixed; the invariant of a smoothing stage is what it does to everything
else, and that needs its own instrument.

**Smell:** a residual measured on "the dark third of the sky" reported as the
whole verdict on a stage that runs on every pixel the mask gives weight to. A
"mean held" control on the same population. A preview screenshot at 900 px
standing in for a 2800 px file. A soft mask (feathered, 384 px) driving a
per-pixel replacement with no test of the pixel itself.

**Measured 2026-09-18, Jefferson-Photography-Studio.**

A sky colour-smoothing stage shipped with three controls green: 0 bytes changed
outside the mask, the sky's mean chroma held to 0.1, the residual on the dark
third of the sky down 86%. All three were true. The exported file of a practice
frame with oaks against the sky carried saturated blue and cyan along every
branch and leaf gap the soft mask leaked into, and yellow-green speckle across
the bright sky; a second frame's sky went pink beside its crown. The preview of
the same state looked clean at screen scale and the walks were green.

Read from the export: 32.8% of one frame's sky pixels had their chroma moved to
+141 on a scale where the sky sits at −58; the per-pixel chroma displacement
between the stage on and off reached **1.011** with a 99.9th percentile of
0.931, where the defect being smoothed is 0.06–0.09.

**THE FIRST DIAGNOSIS WAS WRONG, AND THE INSTRUMENT SAID SO.** It read as the
stage's design — the blend acting on every pixel the soft mask leaked into — and
a gate on the pixel's chroma distance was written, verified in node, and built.
The walk then read the identical 1.011 on the gated build. A blend bounded at
0.12 cannot move a pixel by 1.0, so the displacement was not the blend at all.
Exported again at amount 0.01 the same pixels still moved, and their colour
said what it was: blue 0.98 to blue 0.03 with red and green untouched. The
stage had nudged a bright pixel's blue a hundredth past 1.0 and the TIFF
writer stored it into a Uint16Array with no clamp, so 1.01 became 0.01; a
branch whose solved green went slightly negative wrapped to 1.0. The preview's
framebuffer clamps, the JPEG path clamps through Uint8ClampedArray, and the
node reproduction had used the JPEG path — every one of them was clean for the
same reason the TIFF was not.

**Why three green controls missed it.** "0 bytes outside the mask" is exactly
true — every wrapped pixel was INSIDE the soft mask. "Mean held" was measured
over pixels with weight above 0.85 in floating point, where nothing wraps. The
residual was measured on the dark third of the sky, where nothing is bright
enough to pass 1.0. Every instrument looked at the population being fixed, in
an arithmetic that cannot wrap. The population being broken, in the file the
reader keeps, had no instrument.

Fix: the stage clamps its own output in both renderers, the 16-bit write
clamps as the floor under every stage, and the gate stays because it is right
about leaf gaps even though it was not the cause. The walk above is the
instrument that was missing: it read 1.011 on the shipped build, 1.011 on the
gated build — which is what turned the diagnosis — and is the check that the
clamp has to turn green.
