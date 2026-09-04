## 238 · A test double that is more permissive than the real thing proves nothing about the difference

**Enforced by:** GATE unlisted-app:tools/d1-shim.mjs — the in-memory database
turns on the constraint enforcement the platform has on, and the suite's own
call helper goes through the Worker's error boundary rather than round it.
Planted the shipped defect and watched three assertions refuse it. · CHECKLIST
name-the-defaults — for every substitute, list the settings where the double and
the platform disagree, and say which way each defaults. · JUDGEMENT — whether a
disagreement is a simplification or a hole is a question about what the double
is standing in for.

**Smell:** a double whose setup is shorter than the platform's own defaults.
Any in-memory SQLite without an explicit `PRAGMA foreign_keys`. A test helper
that calls a router, a handler, or a controller directly rather than the entry
point the platform serves. And the tell in prose: a comment describing a double
as "minimal", where minimal has never been checked against what it is minimal
compared to.

**543 assertions, 2026-09-04.** A delete route cleared two of the three tables
that referenced the row it was deleting. Production refused it on the foreign
key and answered 500. The suite passed.

**SQLite defaults foreign keys OFF. D1 has them ON.** So the double was not a
smaller version of production, it was a MORE PERMISSIVE one, which is the single
property a double must never have — every constraint violation in the whole
application was invisible to the thing whose job was to see them. One line fixed
it, and every existing assertion still passed with it on, so nothing had ever
been leaning on the difference. It simply could not see that class of defect.

**The second half was the same mistake in a different place.** The helper
invoked the router directly. The router is wrapped, at the entry point, in the
try/catch that turns a thrown handler into the 500 a reader receives — so an
exception CRASHED the test file while production answered and carried on. A test
that cannot observe a 500 cannot assert anything about one, and the first real
one shipped.

**What found it was a person pressing a button.** Not a gate, not a review: a
cold reader was asked to change their mind about something, pressed the control
for it, and nothing happened. The most-tested route in the application, on the
most ordinary action in it.
