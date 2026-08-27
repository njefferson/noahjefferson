## 169 · Comparing two apps by READING one is not comparison — enumerate both sets, or you find the first difference and stop

**Enforced by:** CHECKLIST enumerate-before-comparing — when asked what one app
should take from another, list the members of the comparable set in BOTH apps
first (chrome controls, screens, panels, gates, settings) and diff the lists.
Only then read for reasoning. A finding produced before that list exists is a
finding that stopped at the first hit. · JUDGEMENT — no script can tell whether
a comparison was exhaustive.

**Smell:** a comparison that returns exactly one adoption, and that adoption is
one a written rule already predicted. Rule-derivable findings are the cheap
ones: they are pattern matches against something already known, so they surface
first and they feel like an answer because they produce a shippable change.

Solve-ent was asked what it should adopt from MoleBridge's interface. The chrome
of MoleBridge's `index.html` was read, the build stamp was found, it matched
Doctrine §7b — the version must be on screen, not only in an About panel — and
that shipped as a release. It was a correct finding. It was also the ONLY one
reported, and the comparison had not been done.

The enumeration takes one command and says everything at once:

- MoleBridge chrome: `build-stamp`, `table-open`, `calc-open`, `report-open`,
  `info-open`
- Solve-ent chrome: `build-stamp`, `info-open`

**Three of four controls missing**, one of which — the calculator — was reported
as absent from the app by somebody using it, two exchanges later, from a
screenshot of the screen it was supposed to be on. The button sits forty lines
ABOVE the stamp in the same file that had been open, carrying a comment stating
why it belongs in the chrome.

**The aggravating factor, which is not the cause.** Solve-ent HAD a calculator;
it was a disclosure inside the work screen. So MoleBridge's calculator button
reads as *already have that* rather than as *in a different place, and the place
is the point*. This is the §95 shape one level up: a feature's presence answers
"is this handled" for the reader of the source, while the screen says no. It is
not the cause, because the comparison that would have raised the question was
never run.

**The rule.** Reading is how you find out WHY the other app did something.
Enumerating is how you find out WHAT it did. Doing the second first is what
makes the first honest, and doing only the first returns whichever difference
happened to be phrased most like a rule you already carry.
