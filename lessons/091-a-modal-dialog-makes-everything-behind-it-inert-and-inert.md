## 91 · A modal dialog makes everything behind it INERT, and inert is neither hidden nor disabled — the click times out instead of failing

**Enforced by:** CHECKLIST — a walk helper that reports a control as unreachable
must report WHY, in the helper, at the moment it gives up. "Absent", "present but
covered", "disabled" and "the click was refused" are four different bugs and they
look identical in a list of names.

An automated pass reported three controls as unreachable. Two were tried in five
different sheets and only ever lived in one, so four attempts out of five failed
by construction — and the accounting keyed the result on the WORST attempt rather
than on whether the control was ever operated, so a control being pressed
perfectly well still counted as a gap.

The third was on the page footer and was the control that OPENS the panel. The
pass opened the panel first, so the button was behind a modal `<dialog>`, which
makes everything behind it inert. An inert element reports itself visible and
enabled, so the click retried until the timeout — it looked like a broken
control rather than a walk driving it in the wrong order.

**Three rounds went into theorising about markup that had already been read**,
because the helper only ever said "in the DOM but not visible" or "not in the
DOM". Adding one line — record the reason beside the id — named all three causes
in a single run.

**The general shape:** when a diagnostic keeps sending you back to source you
have already read, the defect is in the diagnostic. Spending one edit on WHY beats
a fourth theory, every time, and the cost is a string.
