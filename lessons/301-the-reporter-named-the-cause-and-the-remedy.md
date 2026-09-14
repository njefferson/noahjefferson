## 301 · When a report names the cause, test THAT first — and when it names a remedy that works, the defect is downstream of the remedy

**Enforced by:** CHECKLIST report-first — the first experiment of any
investigation tests the mechanism the reporter named, and a theory is only
formed once that test has come back. · JUDGEMENT — a reporter who can make the
symptom come and go has already done the bisection; treat their control as
evidence, not as a coincidence.

**Smell:** an investigation whose first hour is spent in a subsystem the report
did not mention. "They probably meant X." A screenshot being read as evidence
about which component is at fault rather than about what the reader sees. Any
sentence beginning "what they're actually describing is".

**Measured 2026-09-14, Jefferson-Photography-Studio.** The report was five words:
*blue circles instead of fixed hotspots*. In that app "hot spot" means two
things — the infrared lens hot-spot its correction removes, and a dust spot a
reader has healed — and the first reading was the lens. A screenshot then arrived
with the Corrections panel open on Dust & spots, which was read as settling it
the OTHER way, and three turns went into the heal path: a colour term added to
the clone-source search, a widened candidate ring, an instrument built, a defect
written up as reproduced. Two pipeline changes, both reverted.

The reporter's next message: *turning down hot spot repair strength fixes it*.
That is the original reading, plus the control that makes the symptom come and
go, plus an offer of the recalibration theory. **It was the first sentence all
along.**

**The screenshot was the trap, and it is worth naming.** It showed which panel
was open, which says what the reader had been trying, not what is at fault — the
reader had opened Corrections BECAUSE the correction is where hot-spot strength
lives. Reading a screenshot for component attribution instead of for symptom is
how a piece of evidence pointed the wrong way while feeling decisive.

**What the right first experiment would have cost.** Toggling that one control on
the reported frame and measuring: red -6, green +5, blue +3 at the centre at full
strength, fading to nothing two-thirds out. Minutes, and it settles which
subsystem is involved before any theory exists.

**AND THE SECOND HALF IS THE MORE USEFUL ONE.** A remedy that works is a
bisection the reporter has already performed. Once "turning it down fixes it" is
on the table, the question is no longer *what is broken* but *why does their
answer not stick* — and there the actual defect was waiting in plain sight: the
strength was hard-coded to full on every open, so a fix they had already found
had to be reapplied on every photograph, sixty-two times in the session that
produced the report. Nothing was miscalculating. The app was forgetting.
