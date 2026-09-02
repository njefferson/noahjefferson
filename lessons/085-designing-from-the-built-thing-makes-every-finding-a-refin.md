## 85 · Designing from the built thing makes every finding a refinement of its frame, and the frame is what is wrong

**Enforced by:** CHECKLIST — for any "what should this be" question, write the design from the REQUIREMENT with the source closed, and only then open the code to measure the gap. If a design document's first section describes current behaviour, it is an audit wearing a design's title. **Smell:** a run of releases that each fix a real defect while the problem they are aimed at does not move.

An app had shipped release after release. Each one started the same way: read
the code, find a defect, fix it, ship it. Every fix was real, gated and verified.
The central complaint did not move at all, through weeks of them.

The reason is structural, not a matter of effort. **Starting from the artifact
makes the artifact the evidence base, when the artifact is the hypothesis under
test.** Everything found that way is a defect *relative to the current design*,
so every fix is a refinement inside a frame that is never itself examined. The
better the fixes, the more the frame looks settled.

Writing the design cold — from the requirement, with the source closed — took
under an hour and found the thing seven releases had walked past: a promise the
code enforced (*every item carries a clock*) that was not the promise a reader
reads (*it comes back as something I can act on*). Those two agree everywhere
except on the app's widest path in, where an item was clocked, counted as
covered by the app's own proof, and never once offered as work.

**Three properties of this failure worth recognising early:**

- **The frame usually has a written justification.** This one did — an ADR
  recorded the exclusion with a reason, and the reason was carefully argued. It
  held only under an assumption nobody had stated. A decision that was examined
  and passed through is harder to find than one nobody wrote down, because the
  record reads as evidence the question was settled.
- **The complaint not moving IS the signal**, and it is available long before any
  particular defect is found. A run of correct fixes that changes nothing for the
  person is not a sign to fix faster.
- **Do the comparison second, and let it correct you.** The design written blind
  got a fact wrong — it claimed the decision was never recorded. Checking found
  the ADR, and the corrected finding was *stronger* than the guess. Blind is the
  right way to write the design and the wrong way to keep it.

**The general shape:** ask what the thing SHOULD be before asking what is wrong
with it. If you cannot state the requirement without describing the
implementation, you are auditing, and an audit cannot tell you that the whole
approach is wrong — only that it is imperfectly built.
