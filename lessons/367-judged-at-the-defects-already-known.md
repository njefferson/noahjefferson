## 367 · A change judged only at the defects already on the list fixes those and breaks the rest, unseen — whole frames beside what ships come first

**Enforced by:** CHECKLIST whole-frame-before-better — before any claim that a rendering change is better, render every frame of the corpus whole beside the build that ships, at the settings a reader gets by default, open each pair, and write better, worse or same per frame; 1:1 crops come after, chosen where the whole frames differ, never from the defect list alone.

**Smell:** a report of improvement whose every picture is a crop at a place that was already known to be wrong.

**Measured 2026-09-26 in Jefferson-Photography-Studio.** A learned sky
selection, two segmentation models fused and refined, replaced the hand-built
detector under the Aerochrome look. Every check was a 1:1 crop at a defect
already recorded: the sky inside a pylon's lattice, a pale building face taken
as sky, a band beside a tree. Each of those improved, and the numbers said so.
Over two days six rules were added to the fusion, each one answering a defect
seen on the same six practice frames and each one measured on them again.

Then the whole frames were put beside the shipping build for the first time.
The new selection was worse on every frame that has sky and better only on the
one frame that has none. White clouds had been taken into the sky, where the
sky stages darkened and tinted them: luma 216 to 148 on one frame, 230 to 156
on another. Painted steel inside a lattice went dull, 165 to 113, with round
red glows, because the selection is built at 1024 px and the steel is narrower
than one of its pixels. None of these was on the defect list, so no crop chosen
from that list could have shown them. And every render had used tuned
settings, not the look's shipped ones, so even the comparison that was made
was not of what a reader would see. The work was taken out before staging.

**Why it happens.** A defect list records the OLD build's failures. Checking
only there measures whether those went, never whether new ones came. The old
detector had kept the sky stages off clouds and steel by failing to select
them, and nothing on the list said that its failures were holding anything up.
Fitting each new rule to the same frames compounds it: the corpus becomes the
target, its numbers improve, and the pictures elsewhere in the same frames get
worse without anything measuring them. Lesson 328 is the same trap one level
down: a number standing in for looking.

**The rule.** Whole frames first, beside what ships, at the settings a reader
gets, before the word better. Then 1:1 where they differ. A rule fitted to a
corpus's defects is judged on the whole frames of that corpus, not at the
defect it was written for.
