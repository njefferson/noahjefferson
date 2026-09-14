## 306 · A check is only as wide as the inputs it is ever given, and a correct check that never meets the hard case reads exactly like coverage

**Enforced by:** CHECKLIST input-population — for every check that measures a
property of rendered content, name the input that would break it and assert the
check is run with that input, not only with the content the app happens to hold.
· CHECKLIST put-it-where-everything-passes — a per-state check belongs inside
the function every state already calls, never in a list of states beside it. ·
JUDGEMENT — when a cold read finds something a gate is plainly for, ask what
input the gate was given before asking what the gate is missing.

**Smell:** a gate whose population is a hand-written list of ids with a comment
proud of how the list has grown. A walk with a hundred and twenty states where
every one holds short strings, small numbers, one child, a fresh store. A
finding that arrives from a human and lands on a property something already
measures.

**Measured 2026-09-14, Quietkeep, twice in one afternoon, in opposite shapes.**

**Shape one: the population was a list.** A cold read reported a select box
running off the right edge of a 390px phone. Reproduced first-hand: page
`scrollWidth` 427 against a 390 viewport, the control from x=199 to x=427, its
computed `min-width` still `auto` inside a 158px grid cell. The accessibility
walk DROVE that exact state and audited it for contrast, axe, accessible names,
target sizes, separation and focus rings, and never asked whether it fit,
because horizontal overflow was asked of eleven surfaces named in a list — a
list the control had never been added to. The fix that matters is not the CSS.
The check moved inside the per-state geometry audit that all 122 states already
call, and printed 246 lines on its next run, 123 states across both themes,
naming each state. No other screen was overflowing; the point is that nothing
had been in a position to know that.

**Shape two, and it is the harder one: the check was already everywhere and had
never been handed the hard input.** The same read reported an item that could
not be disposed of. Its title filled the sheet, leaving the scroll area
TWENTY-SIX pixels of client height against 1,515px of content, so all three
controls that dispose of it were painted outside that window and clipped; at
320px with 200% text they sat at negative coordinates entirely off-screen. The
walk already carried a check called `auditReach` whose question is exactly
right — is every control inside its scroller's visible box, or somewhere that
scroller can scroll it to — and it had asked that question at every state since
it was written. Every one of those states had a short title. The check was not
narrow, not wrong, and not missing. It had simply never been given a long name.

**The general shape.** There is an established rule that a new surface joins
the measurement in the commit that creates it. This is that rule one level up,
and it is the level nobody writes down: a surface being measured is not the
same as the PROPERTY being exercised. Coverage counts states; defects live in
inputs. Every input a walk uses is chosen by whoever wrote the walk, which
means it is chosen to be convenient, which means it is chosen to be small — and
a check that only ever meets small inputs produces a green line indistinguishable
from a check that holds.

**The test, before trusting any gate that measures rendered content:** name the
input that would break it, and find where the walk supplies it. If the answer is
"nowhere", the gate's green is about the inputs, not the code.

**And the reachability rule specifically is not enough on its own, which took a
wrong assertion to see.** "Every control can be scrolled to" passes through a
26px slit: each control is reachable, one at a time, and the rule is satisfied
by its own terms. It was written for a control parked off-canvas by CSS, not for
a scroll window squeezed to nothing. A number was needed beside it — the window
has to be a window.

**THE STATE ITSELF WAS WRONG THREE TIMES FIRST, and each way looked like a
result.** Worth keeping, because adding the missing input is where the next
person will be.

- It asserted the wrong quantity. The first version held the TITLE to at most
  45% of the sheet and PASSED, at 253px of 717px, in a state whose scroll window
  was 26px. Bounding the title was the fix; the window having somewhere to
  scroll is the property. Only the property is worth gating, and the fix passing
  is not evidence the property holds.
- It looked in the wrong place and reported the app. It searched a sheet that
  turned out to be a navigation panel of eight doors rather than a list of
  items, found nothing, and failed with "the item is not on any surface to be
  opened" — a sentence about the app, produced by a mistake in the walk.
- It waited for the wrong outcome. It expected the sheet to close after the
  disposing control was pressed. That control writes its event and STAYS, because
  every destructive control in that app has its reverse twin beside it. Asserting
  the twin arrived is the stronger claim, and "fixing" the walk by closing the
  sheet itself would have thrown away the evidence.

**One CSS fact banked on the way, because it cost a full run to find.** A
percentage `max-height` resolves against the containing block's HEIGHT, and a
box whose height is `auto` — capped by its own `max-height` — is not definite,
so the percentage computes to `none`. The rule was live, the selector matched,
and the measurement was identical before and after it: title 972px, window 26px.
Viewport units are definite always. A declaration that parses is not a
declaration that applies, and the only way to tell is to measure the box.
