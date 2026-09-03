## 222 · The fix was already in a sibling repo, with a comment saying not to do what this one had just done

**Enforced by:** GATE unlisted-app:tools/help-check.mjs — refuses
`position: sticky` anywhere in the stylesheet, asserts the panel is a flex
column with `[open]` on the selector and its body the only scrolling box, and
that every document opts into the same frame. · GATE
unlisted-app:tools/qr-check.mjs — measures the encoder's real ceiling and
every payload the app can build at FULL length, printing the headroom. ·
CHECKLIST read-the-siblings-before-solving — before building a surface this
family already has (an info panel, a way out of a long dialog, patch notes,
a first-run block), open the sibling that has one and read its comments
first. · JUDGEMENT — which sibling has already solved a given problem is not
discoverable from a gate.

**Smell:** solving a UI problem this family of apps has solved before, from
first principles, on a machine that is not the device the app is read on.
Also: a test fixture that is a shortened stand-in for the real value.

**The unlisted app, 2026-09-02.** The owner reported that the ⓘ panel was far
too long with the only way out at the very bottom, and added: *look at sister
repos for their conventions.*

Three conventions were sitting there, and each answered a question that had
been answered badly here.

**The way out must not depend on `position: sticky`.** quietkeep's stylesheet
carries the finding in its own words: the sticky header was correct, honoured
by every engine, and **did not hold on the reference iPad — found twice, on
device.** The dependency was removed rather than debugged: the dialog is a flex
column that does not scroll, the body is the only box that moves, and the bar
cannot scroll away because it is not inside the box that scrolls. It needs no
support from any engine and cannot regress.

**And this repo had shipped `position: sticky` one hour earlier**, for the
manuals, to fix the same class of complaint, on the same family's same iPad.
The comment saying not to was already written, in a repo checked out beside
this one, and nothing made anybody open it.

**A panel shows the newest few and links to the rest.** MoleBridge's answer:
a panel a reader must scroll past thirty releases to leave punishes them for
opening it. Sixteen releases of notes were sitting between a reader and the
Close button here.

**A contents list is DERIVED from the headings it points at**, so the row and
the heading are one string and cannot drift. quietkeep's comment gives the
reason: a hand-written list of surfaces went stale in that repo inside a day.

**The general rule, and it is about cost as much as quality.** A family of
apps that shares gates but not conventions pays for each convention as many
times as it has apps, and pays again every time one is rediscovered wrong. The
sibling's comments are not documentation of that repo; they are the record of
what a device did. **Reading them is cheaper than the device finding out
again**, and on this occasion the device was going to be the owner's.

---

**Second finding, from the same report: an iPad camera reads a QR of plain
text perfectly and then offers to search the web for it.**

The square carried a ten-character code, which is exactly what it was designed
to carry, and the camera's offered action was a web search. Copy was available
and not the default. So a feature that worked, in the sense of encoding and
decoding correctly, did nothing useful at the only moment it existed for.

**A payload is not just data, it is a REQUEST FOR AN ACTION from whatever
reads it.** The fix was to carry an address the camera knows what to do with —
one tap into the app, code already in the field — and never to redeem on
arrival, because an address can be reached by accident and every code here is
spent when used.

**And chasing that turned up the worse thing.** The encoder is single-block
only and refuses payloads over 78 bytes. A real invitation link is 72. The
gate's fixture was that same link with a **four-character stub token** in place
of the real 32-character one, so it proved the shape and nothing about the
size — and the six bytes of headroom would have gone to zero the day the app
got a longer domain, failing at runtime, on an administrator's screen, in front
of the person being invited. **A fixture that stands in for a real value at a
different size is not a fixture, it is a smaller problem.** Every payload the
app can build is now measured at full length with its headroom printed.
