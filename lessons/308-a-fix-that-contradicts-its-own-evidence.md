## 308 · A fix that contradicts a note the same session wrote six hours earlier, and nothing in the process can see it

**Enforced by:** CHECKLIST read-your-own-notes — before changing behaviour to fix
a reported fault, `git log --since` the days around it and read every
notes-only commit; a session that recorded "X is not the cause" and then changed
X is the failure this lesson is about. · CHECKLIST name-the-ruled-out — a commit
that changes behaviour states what it RULED OUT and how, not only what it
changed, so the next reader can see whether the ruling-out survived.

**Smell:** a commit message that asserts a cause without naming the experiment
that established it. Two notes-only commits close together with different
diagnoses. A behaviour change whose evidence is a single specimen. Any fix
landing the same day as the investigation that produced it.

**Measured 2026-09-15, Jefferson-Photography-Studio, reading back four days.**

A camera-rendered infrared JPEG rendered with a yellow sky under a colour look.
Over about seven hours one morning, one session wrote three commits:

- **03:38** — notes only: the same photograph as NEF renders correctly and as
  JPG renders with a yellow sky, and **"turning off the forced re-balance makes
  it worse, so that is not the cause"**.
- **04:23** — notes only: Restore depth **"pulls the blue channel down thirty
  levels and leaves red and green alone, which is what turns the sky yellow"**.
- **10:48** — a behaviour change that **turned off the forced re-balance** for
  such files, on the grounds that the balance was manufacturing a band and
  crushing the frame.

The second note names a cause. The first rules out the thing the third changed.
**The fix contradicted its own session's evidence, recorded hours earlier, in the
same repository, by the same author.** Nothing flagged it, because nothing reads
notes-only commits and no gate compares a change against a diagnosis.

**What it cost.** Four days later the reader reported the files as broken. The
investigation that followed re-derived the whole picture from scratch, built the
superseded commit to render the frames through it, and confirmed the outcome the
session had already written down — that removing the balance leaves the frames
worse, not better. Every hour of that was spent re-finding a fact that was in
the log.

**Why it is not simply carelessness.** The notes-only commits are the good habit
working: the session recorded what it measured before it knew what to do. The
gap is that a repository has no way to hold a LATER change against an EARLIER
observation. Tests assert behaviour; gates assert shape; nothing asserts that a
conclusion still agrees with the evidence that was gathered for it.

**The cheapest thing that would have caught it** is the checklist above: read the
notes-only commits from the days around a fault before changing behaviour for
it. They are the cheapest evidence in the repository and the only kind written
by somebody who had the failing case in front of them.

**And the corollary, which is the harder half:** when a reported fault and a
recent deliberate change point at each other, the change is the first suspect
and the record of why it was made is the first thing to read — not the code.
