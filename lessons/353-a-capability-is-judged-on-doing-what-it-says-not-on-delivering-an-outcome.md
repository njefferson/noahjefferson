## 353 · A capability is judged on doing what it says, correctly — not on delivering an outcome by itself, because outcomes come from stacks

**Enforced by:** CHECKLIST one-thing-exactly — before adding a branch, a mode or
an exception to a control, ask what it is FOR. If the answer names a scenario
rather than the control's own job, the branch belongs in a second control the
reader composes with this one, or it already exists and is being duplicated.
**Enforced by:** CHECKLIST already-ships — before writing any special case,
check whether the thing it achieves is already a capability. A special case that
duplicates a shipped control is worse than the duplication, because the two
paths can disagree and only one of them is documented.
**Enforced by:** JUDGEMENT — no parser can tell a legitimate branch from a
scenario-shaped one, because both arrive as a condition with a good reason on
it. The instrument is the question above, and it has to be aimed by whoever is
about to type the branch.

**Smell:** a condition inside a control whose reason names one frame, one report or one scenario rather than the control's own job. Also: a special case that achieves what another shipped control in the same panel already does.

**Measured 2026-09-22 in Jefferson-Photography-Studio.** A defect came in: an
automatic sky selection stopped at an aircraft's wing, leaving the sky under the
wing unselected and unreachable. A control was designed to fix the cause — show
the boundary the detector chose and let it be moved, since the person looking at
the photograph knows where the horizon is and the detector only infers it.

**And then the design grew a special case, in the same sitting, unprompted.**
The boundary is one depth per column, so moving it down past the wing would take
the wing in along with the sky. So the record gained a rule: inside a span the
reader had moved, the colour model may overrule the boundary. It existed for one
purpose — so that this one control would solve the reported frame by itself.

**It was wrong twice over.** It duplicated a capability that had shipped months
earlier, because subtracting a second selection by colour was already a control
in the same panel. And it made the control's behaviour conditional, so a column
the reader had touched would obey a different rule from the column beside it,
and a reader would have to know which — a thing to learn, a thing to document, a
thing for a gate to assert, all to avoid using a control that was already there.

**The correction came from outside and it was one sentence:** a capability
cannot be judged alone beyond whether it does what it says and does it
correctly. The outcome was never this control's to deliver. Move the boundary to
where the horizon is, subtract the wing by its colour — two controls, each doing
one thing it can be held to, composing into the result.

## The tell

**The branch is described by a scenario rather than by the control's own job.**
"So that a wing is not swallowed" is a scenario. "The boundary goes where it is
put" is a job. A condition justified by the first is nearly always the second
control missing from the sentence — or, as here, already present and forgotten.

## Why it is hard to see from the inside

**A special case looks like thoroughness at the moment it is added.** It arrives
while the motivating example is still on screen, it demonstrably improves that
example, and refusing it feels like shipping something half-done. What is not on
screen is the second control that already composes with this one, or the reader
six months later meeting a conditional behaviour with no idea it is conditional.

The same shape drives feature creep generally: every case for a special case is
made against one example, and the cost is paid against all the others.

## Corollary, and it is the other half

**Do not let composing capabilities quietly retire one of them.** The same
session had already been told not to lose an intersection while building a
union: both are wanted, they answer different questions, and the one that is
used less is not the one that is needed less. A stack is worth having because
its parts stay distinct — collapsing two into one "smarter" control is the same
error as splitting one into special cases, arriving from the other direction.
