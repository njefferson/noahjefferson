## 193 · Each paragraph was written for a good reason and the sum of them was the defect

**Enforced by:** GATE Cv-Thalweg:tools/render-test.mjs — a budget on VISIBLE prose before the last primary control of a panel, where text inside a closed disclosure does not count, paired with a check that every long sentence is still present somewhere in the panel. · CHECKLIST act-then-explain — a section leads with the control that does the thing; the explanation follows it. · CHECKLIST measure-the-panel-not-the-paragraph — review a surface by where its last control sits, not by reading each block in turn.

**Smell:** a panel where every section is heading, prose, prose, button. Also:
a reader asking where a feature is when it is on the same screen, lower down.
Also: any review that approved each part separately and never opened the whole
thing on a real screen.

A panel carried eight sections. Each opened with a heading, then two or three
paragraphs saying what the thing was and where its data came from, and only
then the button that did it. Every one of those paragraphs was correct, load
bearing, and there for a reason somebody could defend — provenance, what the
state had not measured, why part of a survey is blank.

Measured on a 900px window: **1,277 characters of prose stood between the top
of the panel and its last primary control, which sat 733px down a 661px
panel** — off the bottom of the screen. The reader's report was that the button
worked but left a wall of text that pushed everything else out of sight.

**No review of any single section would ever have found this.** Each block was
justified on its own and the defect existed only in the sum. That is the
general lesson: some faults are not present in any part and only appear in the
total, so a surface has to be reviewed as a surface — by where its last control
lands on a real screen — and not as a sequence of blocks each of which reads
fine.

**The fix is order, not deletion.** Control first; then the one short line that
answers the question the surface is most often asked; then everything else
behind a disclosure whose summary says what it holds. 1,277 characters became
265 and not a word was cut. Deleting the provenance would have produced a
tidier panel and a less trustworthy app, which is why the gate has two halves.

**A length budget alone rewards the wrong fix.** A panel shortened by dropping
its caveats passes a budget perfectly. So the gate also asserts that the long
sentences are still there — folded, not gone. **Any gate that measures an
amount needs a companion that measures what was kept**, or the cheapest way to
go green is to destroy the thing being measured.

**And a trap in the measuring.** `el.compareDocumentPosition(node) &
DOCUMENT_POSITION_PRECEDING` is true when NODE precedes EL, not the reverse.
Read the wrong way round, the check counted everything AFTER the control and
reported 2,280 characters where the answer was 265 — a number alarming enough
to look like a real finding. A measurement that disagrees violently with a
direct observation is a bug in the measurement until proven otherwise.
