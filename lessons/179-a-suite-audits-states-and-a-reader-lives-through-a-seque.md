## 179 · A suite audits STATES; a reader lives through a SEQUENCE — and every defect a walkthrough found was in the seconds between them

**Enforced by:** GATE cv-thalweg:tools/a11y.mjs — staleness is asserted at two
forced ages, and a card whose source has not answered is asserted to say so
rather than to report an absence. · CHECKLIST walk-it-cold — before calling a
release good, drive it as a reader: fresh profile, real engine, real viewport,
from the first frame, reading every word in the order it arrives. Not the
states the suite can put it into — the sequence a person actually gets. ·
JUDGEMENT — "is this true?" is a question about a value; "is this true YET?"
is a question about a request, and a UI answers the second one every time it
paints before its data lands.

**Smell:** any sentence about an absence — *no reading*, *no data*, *nothing
found*, *the network did not answer* — rendered from a state that a pending
request could still change.

Thalweg had 164 checks passing across six viewport geometries and two browser
engines. A twenty-minute walkthrough, cold, on a real iPhone viewport, found
four defects in the first fifteen seconds of the app's life. Every one of them
was a timing defect, and no state-based check could have caught any of them.

**The first frame said, in orange, that the network had failed.** Then the
landing said "These are stored readings". Then the river panel said "Stored
readings, seconds old. The network did not answer, so these are the last that
arrived" — printed directly above six gauges timestamped that same minute. The
app's own diagnostic, captured on the same load, logged every one of those
requests as ok.

The cause was a conflation worth naming, because it is not specific to this
app. A payload was flagged `stale` by a later refresh that failed, while
carrying readings fetched eight hundred milliseconds earlier, and the WARNING
was driven straight off that flag. **Staleness is a question about the age of
what is on screen. Whether the last request succeeded is a different question.**
Conflating them produced a confident falsehood in the one subject the app
exists to be trustworthy about. The fix is that the warning needs the data to
be old as well as unrefreshed; the flag still records the failed attempt.

Two more of the same shape, in the same fifteen seconds. A warning that read
the FIRST river in the list and captioned all four with one river's bad minute.
And a card whose own data source was simply slower than the others — a
different agency, on a different service — reporting "no thermometer
reporting" and "no flow reading", which describes a river with no instruments
in it rather than a request that had not come back. Before any payload existed
at all it now says *still asking*; when a declared source errors it says the
gauges did not answer.

**Why none of it was caught.** Every check in that suite either waited for the
app to settle and then measured, or forced a state and measured that. Both are
worth having and neither is a reader. A reader arrives at second zero and
reads whatever is on the screen at second two, and at second two this app was
making claims it had no basis for yet.

Three cheaper things the same walk turned up, all invisible to a suite that
never simply looks: closing the first-run dialog left focus on `BODY`, because
nothing had opened it and there was nothing to return focus to; a value carried
into one surface and not into the list it belonged to; and a panel printing raw
machine identifiers where the same app, two taps away, printed a readable name
it already had a function for.

**The rule.** Walk it cold before calling it good, and put a check on every
sentence that asserts an absence. §172 established that existence and
appearance are not what a reader gets; this is the same lesson in the time
axis. A screen can be correct in every state it can be put into and still be
wrong in the state a person actually meets it in.
