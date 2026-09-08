## 246 · A rename strands every sentence that named the control, and the guide still reads perfectly

**Enforced by:** GATE guide-names:tools/guide-check.mjs — every
set-apart quotation on a guide page is either a control the app really renders
or a declared line in `.guide-allow` saying what it is instead, both directions,
in the commit hook. Watched: a control name changed by one word in the guide and
the gate refused; the declaration list printed on the same run. · CHECKLIST
rename-sweep — a control renamed in the app is a search of every document
surface in the same commit, not a follow-up. · JUDGEMENT — which quoted spans
are control names at all, which is why the excuse is a list rather than a rule.

**Smell:** any document that instructs — a guide, a manual, an onboarding page —
maintained in a different file from the screen it describes. The specific tell is
a tone or vocabulary pass touching button strings: the pass has a list of the
strings it changed, and that list has never been run against the prose.

**2026-09-07.** An app's guide told a reader to press "Add to the programme" and,
in the section on undoing an availability block, to press "Lift it". Neither
string exists in the app. The buttons say "Add to my day" and "I'm not Out after
all", and both had been renamed in earlier releases for good reasons. The guide
was not wrong when it was written; it was stranded, silently, by a commit that
had no reason to open it.

**This is not a typo class and it does not read as one.** A stale control name is
grammatical, in the right voice, and in the right place. The page passes a proof
read, passes a link check (it is not a link), and passes every prose gate in the
family. It is only wrong against a file nothing compared it to. The reader finds
out by looking for a button that is not there and concluding the app is broken,
or that they are.

**The first version of the gate was aimed at the wrong shape.** Control names in
this guide are written in `<strong>`, so `<strong>` looked like the marker.
Measured: 217 of them across three pages, of which **19** name a control. A gate
on that shape would have flagged 198 lines of honest prose on its first run,
which is the shape that teaches everybody to route around a gate rather than fix
it — the same measurement that narrowed `copy-count.mjs` in another repo (§204)
and made `quote-check.mjs` a list rather than a pattern (§108).

**Set-apart quotation was the shape that worked, and even it is ambiguous.**
Fifteen sites across the three pages, of which four were control names and
eleven were a person speaking in an example, a state the screen displays, an
invented place name, or a word used as a word. Ambiguous at fifteen sites is a
list. `.guide-allow` declares each non-control span and what it is instead,
checked both ways so a fix cannot leave its own excuse behind, and printed in
full on every run so the exemptions cannot become where the defects live.

**What the same read turned up once the strings were being compared at all:** a
guide promising two kinds of notification in an app that has none; a backup
policy stated as fact on two pages while the privacy page said backups may not
exist at all; a home button named by a character the app had replaced with a
drawing; a cap the server enforces that no screen ever mentioned; and three
separate places instructing a reader to cancel an invitation, with no control
anywhere that could. **Four of those five were fixed in the app rather than in
the prose**, which is the tell that the documents were right and the app had
drifted from its own promises — the opposite of what a "fix the guide" task
assumes.

**The general rule.** A document that names a control is making an assertion
about another file, and it is the only kind of assertion in these repos that
nothing checked. Everything else that crosses files here has a gate:
CHANGELOG.md against the rendered notes, the manual's guarded-operation list
against the router's, a schema against its migrations. Prose naming a button was
the last uncrossed seam, and it was uncrossed because prose does not look like a
claim.
