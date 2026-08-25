## 20. Ask what the standard says BEFORE inventing the convention

**Enforced by:** CHECKLIST check-the-standard — before inventing a convention in a domain that has one, find what the real instrument does; a departure you can name is engineering, the same code unnamed is a bug.

Asked point-blank whether I was using industry standards or guessing, the honest
answer was: standards for the physics, invention for the presentation. The
filter was a named Mahony PI complementary filter with gains chosen by computing
the damping ratio. The *display* conventions were my own reasoning dressed in
confident comments.

Checking took ten minutes and immediately contradicted something already built:
**a real EFIS clears the ENTIRE artificial horizon when attitude is lost — no
certified aircraft draws bank without pitch.** And the colour standard is
specific: RED for a condition needing immediate action, AMBER for one the crew
should merely be aware of. A degraded-but-usable parameter is the amber case,
and I had drawn it in the cyan I was using for "derived".

Two outcomes, and the second matters more:
- The amber was simply a bug, fixed.
- The bank-without-pitch display was kept, but **relabelled in the code as a
 knowing departure** with the reason the standard does not decide the case —
 a certified AHRS gives both angles or neither, so "measured bank, no pitch
 source in existence" is not a failure mode the convention was written
 against. Guarded against the hazard the convention protects (the horizon and
 ladder are both removed, so nothing can be misread as a horizon).

**A departure you can name and justify is engineering. The identical code
without the check is a guess that happened to look confident.**

*(fauxplane, 2026-08-02.)*
