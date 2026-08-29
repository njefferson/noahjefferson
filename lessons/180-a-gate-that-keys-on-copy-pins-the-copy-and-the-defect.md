## 180 · A gate that keys on copy pins the copy — and pins the defect with it

**Enforced by:** CHECKLIST hook-on-facts — a browser walk may key on structure
(an id, a `data-*` attribute, a count of controls) and never on the words a
control says; if a walk needs to know which step or state it is in, the app
should publish that as a fact. · CHECKLIST defect-shaped-anchor — when a walk
waits for a string, ask whether that string is one somebody might one day be
right to delete; if it is, it is not an anchor.

**Smell:** a comment in a test defending a literal string as "the guarantee".
Also: a copy fix that turns a green suite red in a file that has nothing to do
with the change.

A release fixed a prompt that read `Clarify (cold):` — a step's internal name
plus a stored enum value, on screen, on the second thing a new reader ever does.
The change was three words. It broke two browser walks.

**Both walks were waiting for the defect.** One stepped through a first-run
walkthrough by watching for the literal label `Get started`; the other waited for
that same routing prompt to *start with* `Clarify`. So the schema word being on
screen was load-bearing for the gate that was supposed to be protecting the
screen. Removing it timed the walk out twelve seconds at a time.

**And the anchor had been defended in writing.** The comment beside it read: *"a
step count is content; Get started is the guarantee."* That reasoning was right
about the count and wrong about the label in exactly the same way — both are
words somebody may rewrite, and rewriting words is the cheapest and most common
improvement anybody makes to an app.

**The fix is to publish the fact.** Which step is last, and which pass you are
on, are structural: the app now sets `data-last` and `data-step`, and both walks
read those. The words are free again, which is the point — a gate exists to stop
the app getting worse, and one that cannot survive the app getting better is
doing the opposite.

**The general shape, and it is not only about walks.** Any assertion keyed on a
user-facing string is a vote that the string should never change. Sometimes that
is exactly right — a legal notice, a guarantee an ADR names, a phrase another
gate parses. Those are worth pinning and worth saying so. Everything else is
copy, and copy that cannot be edited without a red build is copy that stops
being edited.
