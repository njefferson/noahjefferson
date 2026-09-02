## 113 · A control that undoes a state lived inside the thing that state hides, and the comment forbidding exactly that was written above it

**Enforced by:** GATE quietkeep:tools/plain.mjs — `#nextup-plain-off` is asserted
not to be a descendant of `<section id="nextup">`, statically. Every sibling with
a mode, a panel or a takeover owes the same question about its own way out.

Quietkeep's *Just one thing* is a mode with one visible exit, and the exit sat
inside the offer card. **The offer card is hidden whenever nothing is being
asked** — correct behaviour, long-standing, an empty morning saying so. And the
mode **survives a reload by design**, because a state you must re-enter on every
reload is one more thing to operate on the day you can least afford it.

Those two facts are each right. Together they make *mode on, nothing to offer*
reachable by turning it on and finishing the last thing — and rendered, that
screen carries capture, the proof line, the two doors, the footer, and **nothing
that turns the mode off.**

**The element carried the rule, in a comment, directly above itself**: entering
the mode is a choice, being unable to leave it would be a trap, and the reader
who most needs this state is least able to go looking for the exit. Written when
it was created. Inside the container that hides.

**The defect predated the release that made it matter, and no diff could show
it.** Before the mode's strip reached past the card, the same state left the
reader stuck in a mode with the whole app still under it — annoying, survivable.
After, it is a blank screen. **Nothing about the exit's markup changed in that
release.** A release note about what changed cannot mention it, a reviewer
reading the diff cannot see it, and the only thing that found it was rendering
the state the release had just made dangerous and looking at what was on it.

**Smell, and it is checkable in an afternoon:** for every mode, overlay, focus
state or takeover, list what hides it and what leaves it, then ask whether the
second is inside the first. The answer is a containment question about the DOM,
which means it can be asserted rather than remembered — and a comment stating the
rule is not the assertion, as this one demonstrated for the life of the feature.

**And the general form, which is not about DOM at all:** the control that exits
a state must not depend on the state's own preconditions. A logout link rendered
only when a session is valid, an abort button drawn by the job it aborts, a
"disable" switch inside the feature it disables — same shape, same failure, and
each looks correct in the source.
