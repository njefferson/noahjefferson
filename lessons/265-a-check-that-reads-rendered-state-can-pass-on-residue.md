## 265 · A check that reads rendered state can pass on residue, and a failure naming only the symptom buys two wrong fixes

**Enforced by:** CHECKLIST paint-or-clear-in-every-branch — an element a surface
paints in one branch and clears in another is asserted against a state the check
ENTERED, never against whatever the DOM happens to hold. · CHECKLIST
failure-messages-carry-the-diagnosis — a check whose failure has more than one
possible cause prints the fields that tell them apart, in the message, because the
log tail is all a later reader gets. · JUDGEMENT — whether an element's absence in
a given state is correct rendering or a defect.

**Smell:** a browser check that reads `textContent` or `hidden` on an element the
app paints conditionally. A surface with an "empty" branch that clears the same
elements a "populated" branch fills. A check that has passed for a long time and
goes red on a change that looks unrelated to it. And the tell: a failure message
that says a thing "did not render" and nothing else.

**2026-09-10.** An app's offer surface has a line naming the next fixed thing
today — an appointment, a real date. It is painted in the branch where the offer
has a head, and the branch for "nothing is asking" CLEARED it. An accessibility
walk asserted the line rendered, and read it during a focus session, when the work
surface has no head — so the empty branch was the one running.

**When that branch's condition was false, the line kept whatever it last said.**
The walk had painted it earlier in the run, in a different state; the DOM still
held that string; the check read it back and passed. It had been doing that for
as long as the check existed. A release then widened the empty branch's condition
for an unrelated reason, the clear started running, the residue went, and the
assertion went red — which was the check measuring something for the first time.

**THE MESSAGE THEN COST TWO WRONG FIXES.** It said only that the line did not
render, which is true of at least four causes: the element is absent, it is
present and empty, it is deliberately suppressed because it would name the head,
or the drive that was supposed to create the state failed. The first diagnosis
blamed two changes in adjacent releases and rebuilt the check's drive around
them, plus a new attribute on the app's markup so the drive could ask. The next
run found the drive working exactly as intended and the line still absent — the
hypothesis was wrong and the markup change was scope with no purpose. Both came
out. The second diagnosis fixed the clear, which was a real defect and still not
the cause.

Each of those cost a full run of the walk. **The fields that separate the causes
were one `page.evaluate` away and are now in the failure message**, which is
where a check with several failure modes has to put them: the run's log tail is
all a later session gets, and a message that names the symptom sends the next
person to guess in the same order.

**The general rule.** A check that reads rendered state is asserting about the
DOM, not about the code that produced it, and the DOM remembers. Either drive the
surface into the state under test and assert from there, or read a projection
rather than a paint. And when a check CAN fail several ways, the failure says
which — otherwise its cost is not one run, it is one run per hypothesis.

**See also §244** (a report that omits reads as an all-clear) — the same shape one
level up: there, coverage that was never gathered; here, a value that was never
re-computed. Both pass, and both look like evidence.

**And §262, reached independently in another repo on the same day.** That one is
about a COLD READER's finding carrying a diagnosis nobody asked for; this one is
about a session's own two diagnoses, built and reverted before the check could
tell them apart. The common part is worth naming once: a finding and its cause are
different objects, and the cost of merging them is paid by whoever builds on the
merge. §262 catches it arriving from outside; this catches it happening inside.
