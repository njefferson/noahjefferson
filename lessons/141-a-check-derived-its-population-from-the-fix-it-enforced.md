## 141 · A check derived its own population from the fix it enforced, so it could only ever confirm the surfaces already fixed

**Enforced by:** JUDGEMENT

**Smell:** a check discovers what to measure instead of being handed a list —
which is right, and is not the end of the question. Read the predicate it
discovers WITH. If that predicate is satisfied by the remedy, the check has
defined its population as *the things already fixed*, and it can never be red
about anything untouched. Ask it directly: **could this go red on something
nobody has ever looked at?** If not, it is a receipt, not a gate.

A dialog whose way out is the last thing inside the box that scrolls means
leaving costs a scroll through everything you opened it to get past. The remedy
is a flex column with a non-scrolling bar and a `.sheet-body` that moves. The
defect had been found twice on a device, fixed for one surface, then found again
across five more when a panel was split — so a check was written, and written
carefully: it was a hand-written list of six, that went stale within the hour,
and it was rewritten to derive its subjects from the markup with a comment
saying **"DERIVED FROM THE MARKUP, never hand-listed"**.

It derived them like this:

    const body = d.querySelector('.sheet-body, .about-body');
    const close = d.querySelector('[id$="-close"]');
    return body && close ? [...] : null;

`.sheet-body` **is the fix.** A dialog that never received it was not a failing
row; it was not a row. The check then reported *"every scrolling surface with a
way out"* — a claim about a population it had defined into existence.

Two dialogs in that app had never been sheets and never been the ⓘ, so no
generalisation had ever travelled to them: 587 lines of markup and 83, **the two
longest surfaces in the product.** Both carried the original defect untouched
through every release since the fix existed. It was reported by a person using
the app, on the surface where sorting a batch of a few hundred items meant
scrolling all of them to reach Close.

**The second filter had the same shape one step along.** The way out was
identified as `[id$="-close"]`, so a screen leaving by *Skip* and one leaving by
*Keep going* had never matched it either. Fifteen of twenty-one dialogs were
being measured by a check that said *every*.

Two things came out of it, and only the second is transferable:

- The invariant, stated once and checked without opening anything: **no way out
  is inside the box that scrolls.** It needs no app state, so it covers every
  dialog rather than the ones a walk knows a route to, and a new surface is red
  from the day it exists. What the walk cannot reach is PRINTED, never dropped.
- A way out is a thing the markup DECLARES (`data-way-out`), not a thing a
  naming convention implies. A convention is a filter wearing a costume.

Same family as §104 (an absence identical to a presence) and §22/§28 (a list
that cannot fail on a screen it has never heard of). The new part is that
*deriving* the list does not by itself escape any of them — the derivation
carries a predicate, and the predicate is where the exemption hides.
