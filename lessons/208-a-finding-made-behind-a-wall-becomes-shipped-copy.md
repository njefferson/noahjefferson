## 208 · A finding made behind a wall becomes shipped copy, and nothing ever re-asks it

**Enforced by:** CHECKLIST date-the-negative — a sentence asserting that
something does not exist records WHEN it was looked for and WHERE, in the file
that carries the claim, so the next reader can tell a fact from a snapshot. ·
CHECKLIST re-ask-on-unblock — when a host is added to a session's egress, the
first thing done with it is re-asking every question that was answered while it
was refused; the unblock is not the end of the task, it is the start of it. ·
GATE Cv-Thalweg:tools/render-test.mjs asserts the app no longer carries the
specific retracted claim, because a corrected feature with the old denial still
in the panel is worse than never having built it. · JUDGEMENT — no gate can
know that a negative was reached through a firewall.

**Smell:** any shipped sentence of the form "no published X exists", "no such
data could be found", "there is no source for Y". Also a generator or a notes
file whose header states an absence as settled. Also the phrase "could not be
reached" hardening into "does not exist" across two rewrites of the same
paragraph.

§188 says a blocked host is a question, asked in the moment. This is what
happens when it is not: **the finding does not stay in the session. It becomes
product copy, a generator's header comment, a design note, and a reason not to
build something** — and none of those carries the fact that it was reached
through a wall.

An app spent its whole life telling readers, in its own interface, that no
published boat-ramp dataset existed for its rivers. The same claim opened the
header of the generator that baked the substitute dataset, and sat in the repo's
notes as a measured finding. It was false. Six state hosts that publish exactly
that data were refused at the CONNECT tunnel by the container's egress and never
reached; a seventh, the item-search endpoint that would have found the layer by
name, was refused too. The moment those were added, the data was found in
minutes: 677 facilities, 97 of them on those rivers, published by the same
department whose OTHER dataset the app was already baking as the consolation
prize.

**The asymmetry is the whole lesson.** A positive claim gets re-checked, because
something breaks when it goes stale — a URL 404s, a gate fails, a number looks
wrong. **A negative claim never breaks.** "There is no such dataset" keeps
rendering perfectly forever, and the only thing that can dislodge it is somebody
deciding to ask again, which nobody does, because the file says it was already
asked.

**So write the negative with its evidence attached.** Not "no published list
exists" but "asked of these hosts, on this date, and none published one" — the
first is a claim about the world and the second is a claim about a search, and
only the second is true. A reader of the second knows what to do with it.

**And when a wall comes down, the debt is retroactive.** Adding a host is not
housekeeping; it invalidates every conclusion that was reached without it. The
first work after an unblock is re-asking, and it is fast, because the questions
are already written down.

**Two things found in the wake of the correction, both older than it.** A new
map layer was drawn and left out of the list that routes taps to pins — perfect
in every screenshot, inert under a thumb, returning a depth reading for a press
twenty pixels off. And a touch-target check written for the NEW control failed
on the control beside it, which had been thirty pixels tall since the app's
first week in a product read one-handed outdoors. **Building the thing that was
written off is how the surrounding defects get found**, because a feature nobody
built is also a feature nobody measured around.
