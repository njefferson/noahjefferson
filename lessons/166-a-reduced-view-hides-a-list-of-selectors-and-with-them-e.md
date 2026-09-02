## 166 · A reduced view hides a list of selectors, and with them everything those elements were the only carrier of

**Enforced by:** CHECKLIST what-was-this-the-only-route-to — for every selector
a simplified, focus, compact or print view hides, name what information it
carried and where else that information appears. Anything with no second route
is being removed, not simplified. · GATE molebridge:tools/walk.mjs — the
one-step-at-a-time block asserts that the values AND the position are still on
screen with the setting on.

**Smell:** a CSS rule of the shape `[data-x="on"] .a, [data-x="on"] .b,
[data-x="on"] .c { display: none }`. The list is where this hides: each
selector was judged on its own and the set was never judged at all.

A stoichiometry trainer offers one-step-at-a-time, which puts less on the
screen. The rule hid three things: the equation card, the step rail, and the
progress line.

**The rail and the progress line were the only two things carrying the step.**
With both gone, a student on the setting worked a chain of six boxes that all
looked identical, with no way to tell the fourth from the second. The
accommodation for the reader who needs one thing at a time was the one that
stopped saying which thing.

**This was the SECOND time in the same rule.** The first was the values: the
rail also carried what the student had typed at each finished step, which the
next step needs, and hiding it took those away too. That was fixed by giving the
numbers a second route — a folded disclosure shown only when the rail is hidden.
The position had exactly the same defect, three selectors along in the same
declaration, and was not noticed for another eleven releases.

**Hiding is judged per element and lands per screen.** Each of the three was a
defensible thing to hide. What nobody asked was what the reader could still
learn afterwards, because that is a question about the SET, and the code offers
no place to ask it: a selector list has no line where the union lives.

**The transferable form: for every selector a reduced view hides, name the
information it carried and where else it appears.** If the answer is nowhere,
that view is not simpler, it is lamer — and the reader it was built for is the
one paying. Two outcomes are legitimate: give the information a second route, or
find that the element was never clutter and stop hiding it. The progress line
was the second kind; it now names the step as well as the problem and stays in
both modes.
