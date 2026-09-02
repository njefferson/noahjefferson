## 151 · Every secondary button in a shipped app was painted by the browser, not by the theme — and every gate was green

**Enforced by:** GATE molebridge:tools/a11y.mjs — every rendered colour is
reverse-mapped to the role token it came from, and a colour mapping to nothing
fails the run. · GATE noahjefferson:palette-check.mjs — `onAccent` is a measured
role now, and a spec may declare the pairings the app actually renders. ·
CHECKLIST a-size-modifier-is-not-a-class — a rule that only modifies another
rule needs the other one present, and nothing checks that in CSS.

`.button-small` set a height, a padding and a font size. It was written as a
modifier for `.button`, which carries the colour. Every element in the app used
it ALONE — `class="button-small"`, fifteen of them across the markup and four
modules — so `.button` never applied and Chromium painted them with its own
default button styling: `#6b6b6b` with white text in dark, `#efefef` with black
in light. Cold grey against a warm palette, completely unmoved by which of three
themes the reader chose.

It shipped that way for fifteen releases and passed every gate, including a
contrast gate measuring resolved pixels across three palettes and both modes.
**Nothing was wrong with the contrast** — UA button colours are legible, which
is why browsers chose them. The defect was that a colour reached the screen
without coming from the theme at all, and no gate in the family had ever asked
that question.

**Ask it directly.** Resolve every role token through the browser, build a map
from colour to token, and reverse-map each colour the gate measures. Anything
that maps to nothing came from outside the palette. It cost about forty lines
and found the defect on its first honest run — 144 measurements, all of them the
same four buttons.

Three details that are the difference between an instrument and a confident
liar:

- **Resolve tokens through the browser, not by parsing the declaration.** The
 first version read the custom property off the root, got a hex string where the
 parser wanted `rgb()`, and reported all 8,949 measurements as unmapped. A
 broken instrument at full confidence looks exactly like a catastrophic finding.
 A hidden probe element taking `color: var(--token)` gives back the computed
 form whatever the source was.
- **Composite the alpha tokens over every fill, and keep the fill in the name.**
 Otherwise every hairline and every tint reads as unmapped — and a tint over the
 page and the same tint over the top surface are different colours with
 different contrast, so a name that drops the fill cannot be acted on.
- **Token order decides collisions.** Two roles can legitimately hold the same
 value: a print palette collapses everything to black on white, so `--rail` and
 `--text-1` are both `#000` there. With edges registered first, every heading on
 the printed page reported itself as a rail. Foregrounds first.

**And the payoff is the reason to do it.** Once nothing paints outside the role
system, and the pairings the app makes are recorded from a real run rather than
typed, a colour set can be swapped wholesale on the palette gate alone — the
browser sweep drops from every palette to one. MoleBridge's default
accessibility run went from 16,586 measurements to 5,526 and gave up nothing,
because the two thirds it dropped were re-measuring what the palette gate
already proves. PALETTES.md §7b is the recipe.
