## 182 · A feature that cannot be found reads as missing, and "build it" is the expensive wrong answer

**Enforced by:** CHECKLIST found-first — before building anything a reader
reported as absent, look for it. Search the surface list, the sheets, the ranges
and the intents modules for the CAPABILITY, not for the words the reader used. ·
CHECKLIST door-names-destination — a control that opens a surface says that
surface's own heading, so what a reader lands on is the sentence they pressed. ·
JUDGEMENT — when the capability exists, the defect is the route, and the fix is
usually copy on one control rather than a new surface.

**Smell:** a report of the form "there is no way to X", in an app that has been
carefully built by somebody who would have thought about X. Also: a fix estimate
that starts at "a new screen" for a product whose every screen is argued over.

Eight things were found by walking an app as a reader with a head full of work.
**Three of the eight were already built.**

- *"The whole list, so the offer can be trusted"* — one tap away. The gauge
  opened a sheet listing every held item with its return date. The door's last
  clause was `see each`.
- *"A separate place to work through an import"* — a batch of exactly the
  imported, unrouted, unparented things already existed in the bulk surface, with
  seven wholesale verbs available to it. Nothing routed anybody there after an
  import.
- *"No way to say this capture is actually a project"* — a control in the detail
  sheet wrote the kind change. It was named for the feeling rather than the
  noun: *This is bigger than one step*.

**Why the reader is not wrong, and this is the part worth keeping.** A feature
nobody can find is not a smaller version of a feature. It is worse than a missing
one, because its presence in the source answers *have we handled this* for
everyone who comes after — the reviewer, the next session, the person writing the
release notes. The absence is invisible from the inside and total from the
outside. The sibling rule about a focus-revealed control being unreachable by
finger is the same defect wearing accessibility clothes.

**And the cost of getting it wrong is asymmetric.** Building the thing again is
the obvious response to "there is no way to X", and it is the expensive one: a
second surface for a capability that has one, two code paths to keep agreeing,
and the original still unfindable beside the new one. The cheap fix is almost
always a control naming its destination — three of these were, and one of them
cost four words.

**The tell is in the reader's own sentence.** *"There is no way to"* is a claim
about a ROUTE. Somebody who has used the app for weeks and cannot find something
is reporting navigation, and reading it as a feature request is the session
choosing the larger job. Ask what they would have pressed.
