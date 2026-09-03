## 235 · A character is not an icon, and the two complaints about it were one cause

**Enforced by:** GATE unlisted-app:tools/panel-shot.mjs — every icon control in
the app's bar is measured in a real browser: the centre of its MARK against the
centre of its button, and for drawn marks a floor on how much of the button the
mark occupies. Three regressions planted and refused, including the original.
· CHECKLIST two-complaints-about-one-control-are-usually-one-cause — before
fixing either, measure both; a remedy aimed at one of two symptoms usually
cannot reach the other. · JUDGEMENT — which symptom is the cause is a reading,
and the measurement is what makes it one rather than a guess.

**Smell:** any single character standing in for an icon — `⌂`, `☰`, `✕`, `⚙`,
`ⓘ`, `←` — inside a control with a minimum tap size. The minimum size is the
tell: it forces a box much larger than the ink, and nothing then relates the two.
Also: a fix for an off-centre mark that adjusts padding.

**The unlisted app, 2026-09-03.** The home control in the app's bar was the
character U+2302, in a button with `min-height: 2.75rem` for the tap-target
rule. It was reported as two faults — too small, and not centred on its button.

**They are one.** A character in a box is placed by FONT METRICS: its ink sits
where the typeface puts it relative to the baseline, and the box is sized by a
completely unrelated accessibility floor. Measured, the ink's centre sat 3.21px
left and 4.61px above the button's centre. **No amount of padding moves ink** —
padding moves the box, and the ink moves with it, keeping the same offset. The
same disconnection makes it look small: the character was drawn to sit on a line
of text, not to fill a 44px square.

**The measurement chose the assertion, and the obvious one would have missed
it.** A size floor is what "too small" asks for, and the broken control measured
**55% of its button** — comfortably past any floor worth setting — because a
glyph's ink box is mostly the whitespace above the letterform. Centring is what
actually separated them: the two controls that were fine measured 0.09px out,
this one 4.61. So the gate asserts centring for every icon control and a size
only for DRAWN ones. **Text glyphs are exempt from the size rule on purpose**:
nobody can set the ink size of a character, and pretending otherwise is what
produced the defect. A control that needs to be bigger has to stop being a
character.

**The neighbouring control stayed a character, and that is the right answer.**
The ⓘ in the same bar measured 0.09px out — centred by luck of its typeface
rather than by construction, but centred, and not what anybody reported.
Converting it would have been an unrequested change to a working control, and
the gate now holds it to the same centring rule, so if that luck ever runs out
the release fails rather than a person noticing.

**Where the check went.** Into the existing browser gate rather than a new tool:
one headless launch per commit is the budget, and a second tool would have been
a second launch against the same page. Its failure line said "the panel is not
usable" — true when it only measured the ⓘ panel, and now the wrong file to send
somebody to. **A gate whose failure message names the wrong thing is worse than
one that does not run, because somebody acts on it** (§117). It names the check
instead.
