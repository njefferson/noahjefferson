## 217 · A sentence of welcome is a claim about state, and nothing checks the welcome

**Enforced by:** GATE unlisted-app:tools/help-check.mjs — the join screen's
"You have a cabin. Welcome." is held to the Worker function that has to make it
true, and to the manual paragraph that repeats it; a fourth assertion refuses
the old spelling of an invitation that two screens still carried. · GATE
unlisted-app:tools/worker-check.mjs — asserts the invariant on every path
that puts somebody aboard, and on the way back out of a shared room. ·
CHECKLIST welcome-copy-is-an-assertion — every sentence of arrival copy that
says what the reader now HAS is written down as a claim and given something
that proves it. · JUDGEMENT — which sentences are claims about state and which
are pleasantries is a reading, and no pattern can make it.

**Smell:** a screen that congratulates somebody on reaching a state, with no
test naming that state. Also: the same artefact rendered by three screens with
three spellings of it, where only one of them is on the path anybody tests.

**The unlisted app, 2026-09-02.** The join screen had said "You have a cabin.
Welcome." since the first release. It was not true and had never been true.
Redemption created a person, attached them to whatever scope the invitation
named, and stopped; a line-scoped invitation — the ordinary kind, the kind the
app's own console mints — named no scope, so the new arrival got nothing. The
next screen they opened said "You are not in a cabin." Counted on the live
line: one person, zero cabins, zero people in a cabin.

**Every gate was green and none of them could have caught it**, because
nothing anywhere connected the sentence to a state. The a11y walk read the
screen and found the sentence legible. The Worker suite asserted that
redemption returned a token, that the seat was spent, that the ceiling held —
all true. The manual described cabins accurately as something a person makes.
The defect lived exactly in the gap between a promise and its subject, and
that gap has no file in it to scan.

**What made it invisible for ten releases** is that the sentence reads as
tone. "Welcome" is the pleasantry, and the eye stops there; "You have a cabin"
is the assertion, and it is in the same breath. The rule that comes out of it
is narrow enough to apply: arrival copy that says what the reader now HAS is
a claim about state, so it is written down as a claim and given something that
proves it. Copy that only greets them is not.

**The metaphor answered the design question the bug opened.** The app borrows
its vocabulary from passenger ships, and the question "what should happen to
somebody with no cabin" has an answer in that world that needs no meeting: a
line does not walk somebody up the gangway and leave them to find a berth. It
assigns one. That settled the arrival, and it settled the exit too — leaving a
cabin is offered with no confirm step, which is only honest if what you land in
is a place rather than a hole, so leaving your last one now moves you into one
of your own. **A borrowed metaphor is worth more than its readability**: it
carries answers to questions the design has not asked yet, and a session can
look them up instead of inventing them.

**And the thing found on the way was worse than the thing looked for.** Three
screens in that app mint an invitation. One printed the app's origin with
`#/join/` on it and the boarding code beside it; the other two printed the
WORKER's origin with no route and no code at all. Both were undeliverable —
the link opened an API host, and the code that works for somebody who installs
the app first, which is the order the app itself asks for, was never returned
by those two routes. The tested path was the correct one, so every suite was
green.

The shape is §199's: a second statement of a fact will go stale and the gate
will stay green. **The variant here is that it was never right to begin with.**
Copy-paste made three spellings on the day the second screen was written, and
only one of them was ever exercised. The fix is the same either way — one
function, one call site each, and a gate that fails on the old spelling rather
than on the absence of the new one, because absence is what a half-finished
refactor looks like and the old spelling is what a wrong one looks like.
