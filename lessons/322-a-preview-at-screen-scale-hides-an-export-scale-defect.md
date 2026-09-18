## 322 · A preview at screen scale hides an export-scale defect, and a statistic on the population you were fixing cannot see what you broke outside it

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
0.931, where the defect being smoothed is 0.06–0.09. Two mechanisms, both in the
stage's design: the blend acted on every pixel with any mask weight, and a
texel whose target was garbage was blended in regardless.

**Why three green controls missed it.** "0 bytes outside the mask" is exactly
true — the branches were INSIDE the soft mask. "Mean held" was measured over
pixels with weight above 0.85, which excludes every leaked edge. The residual
was measured on the dark third of the sky, which is where the mottle lives and
where nothing was wrong. Every instrument looked at the population being fixed.
The population being broken had no instrument.

Fix: gate the blend on the pixel's own chroma distance to the target (a
mottled sky pixel is hundredths away, a branch is half a range), weight each
map texel by the mask, drop non-finite samples; the same gate in the shader.
The walk above is the instrument that was missing, and it read 1.011 on the
shipped build before the fix was written.
