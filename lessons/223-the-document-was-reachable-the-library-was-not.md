## 223 · The host was unblocked, the library still would not load, and the check that saved it was in the document itself

**Enforced by:** GATE Jefferson-Line:tools/worker-check.mjs — eight dates from
the source document are asserted against the weekday the document prints
beside them, and a separate assertion refuses any span claiming to be a
move-in or move-out date. · GATE Jefferson-Line:tools/help-check.mjs — the
dates must name the document they came from, say how the text was extracted,
and say what the document does NOT contain. · CHECKLIST
find-the-redundancy-in-the-source — when a document must be parsed by
something hand-written, look for a field it already carries that is derivable
from the field you want, and check one against the other. · JUDGEMENT — which
adjacent fact is close enough to be mistaken for the one asked for is a
reading, and it is where the confident wrong answer comes from.

**Smell:** extracting structured data from a document with a parser written
for that document, and validating it by reading the output and finding it
plausible. Also: an answer that is *nearly* what was asked for, sitting in the
same table as the thing that is missing.

**Jefferson Line, 2026-09-02.** The owner asked whether a university's academic
calendar could be imported. The hosts were blocked, which was reported as a
question rather than a finding (§188), and the owner opened them in a minute.

**Then everything downstream failed anyway, and each failure was different.**
The calendar page renders through a hosted-calendar widget whose actual feed
lives on two OTHER hosts, still blocked. The PDF behind it fetched fine — and
no PDF library would load in that container, the cryptography binding panicking
on import for all of them. The file's own content streams decompressed, and
carried hex glyph indices from subset fonts rather than text.

So the text came out through each font's ToUnicode map, decoded by about forty
lines written for this one file. **That is exactly the situation where output
gets validated by reading it and finding it plausible** — and the dates were
plausible: a semester starting in August, a break in November, commencement in
May. Every one of them could have been shifted by a row and still read
perfectly.

**The check was already in the document.** The memorandum prints a weekday
letter beside every date — *M August 17*, *W November 11*. That is redundant
information, derivable from the date, and it cannot share a mistake with a
decoder that does not know what a weekday is. All twenty-six were verified
against the real calendar, and it caught the actual defect: the first pass had
each label attached to the *following* date, and the weekday letters said so.

**The general rule: when a hand-written parser is the only way in, look for
what the source already says twice.** A document that carries both a date and
its weekday, a total and its parts, a count and a list, is offering a check
that is free and that your parser cannot fake. It is worth more than any amount
of reading the output over.

**And the finding that had nothing to do with parsing.** The whole request was
for move-in and move-out weekends. The document does not contain them. What it
does contain, three rows from the top, is *"Advising, meetings, orientation,
testing, etc."* for the week before classes — which is nearly the same week,
is not a housing date, and is not labelled as one. Residence dates are the
housing office's and are published elsewhere.

**An adjacent fact in the same table is where a confident wrong answer comes
from.** It requires no error to reach: the parse is right, the date is real,
the row is genuinely there. Only the label is somebody's inference. The app
says the dates it has, says move-in is not among them and where it lives
instead, and a gate refuses any span that claims otherwise — because **a date
invented from an adjacent one is worse than a missing one, since it looks like
knowledge.**
