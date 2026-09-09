## 253 · Every accessibility gate PASSES a confirmation that is announced and never shown

**Enforced by:** CHECKLIST both-halves-of-a-receipt — for every live region a
surface writes to, name the visible element that carries the same words, and
prove it survives the next paint. A `role="status"` element that is
`visually-hidden` is half a receipt, and the half a conformance check measures. ·
CHECKLIST the-success-path-too — a rule written for failures ("say it where it
can be SEEN as well as heard") applies to the confirmation of a write, which is
the path nobody writes rules about because nothing is wrong on it. · JUDGEMENT —
whether a given confirmation needs a visible half at all, or the screen's own
change is the receipt.

**Smell:** a live region whose only class is `visually-hidden`, written by a
success handler. A `say()`-style helper that writes two elements where one of
them is re-rendered on the next paint. A release note claiming a confirmation was
fixed, with no walk asserting anybody can see it. And the tell: an accessibility
suite that is green on the surface a reader says is silent.

**2026-09-09.** A planner's release note said "Setting a date says the day back
to you, not the digits" — and it did. The words were right, the day words came
from the same helper the rest of the app uses, and every one of them went into a
`role="status" aria-live="polite" class="visually-hidden"` paragraph. A screen
reader heard it. A sighted reader pressed *Set* and watched nothing happen. A
cold reader walking the promoted build reported the confirmation as missing
entirely, which was the accurate description.

**Twenty-five static gates, two picture walks, an axe pass in both themes and
246 reach assertions all passed it, and none of them was wrong to.** A correctly
announced live region is what those checks exist to confirm. Invisibility and
correctness are indistinguishable to a conformance check, because conformance is
defined over what assistive technology can obtain and says nothing about what
the screen shows. This is the same shape as a skip link nobody can reach by
finger (§95): the feature's presence in the source answers "have we handled
this" for everyone afterwards.

**The rule was already written, and applied to the wrong half.** Thirty lines
into the same file: "Say it where it can be seen AND where it can be heard. A
failure reported only to a visually-hidden region is a failure a sighted user
never learns about." Its remedy mirrored the message into the sheet's fact line.
That mirror never worked — the render function rewrites the fact line from its
own parts on every paint, and the commit helper paints immediately after a
write, so a mirrored message survived microseconds. What kept it looking fixed
for eight releases is that VALIDATION messages return before the commit helper
runs, so those alone stayed on screen. A rule with a remedy that only fires on
the path nobody tested is worse than no rule: it answers the question.

**And making it visible moved a layout, which is the second half of the
lesson.** Given its own line above the way out, the newly visible paragraph took
about 32px out of the one scrolling box in the dialog, and four focus rings that
had been clearing the scrollport edge by 3px stopped clearing it — a field's ring
is 2px at 3px offset, and the browser calls an element "fully visible", and so
declines to scroll it, without counting its outline. **Raising
`scroll-padding-block` does not fix that**, which is the lever everybody reaches
for: scroll padding applies when the browser scrolls, and it had already decided
not to. The fix was to stop shortening the box — the receipt shares the row the
way out already occupies. A newly visible element is a layout change, and the
walk that measures rings has to be re-run for it like any other.
