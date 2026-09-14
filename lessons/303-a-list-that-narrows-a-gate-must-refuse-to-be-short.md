## 303 · A list that narrows a gate must refuse to be short, because a skip and an absence look identical from inside it

**Enforced by:** GATE Jefferson-Photography-Studio:tools/palette-spec.mjs —
every element the sweep sees and cannot account for aborts the generation and
names it, rather than being passed over. · GATE
`Jefferson-Photography-Studio:tools/a11y-walk.mjs` section 4 — the committed
list is re-measured from the running app and fails in BOTH directions. · GATE
`Jefferson-Photography-Studio:tools/palette-spec-check.mjs` — the artefact is
pinned to the sha256 of the stylesheet it was generated from. · CHECKLIST
instrument-the-drops — before trusting any sweep's output, make it report what
it DISCARDED and why, and read that list before reading the results.

**Smell:** a generated list that makes a gate quieter — an allow-list, an
exemption list, an "observed" list, a `_renders`. A sweep that `continue`s past
anything. A filter written to keep the output clean. A count that is smaller
than a hand count of the same thing and was not investigated because the small
number was plausible.

**Measured 2026-09-14, Jefferson-Photography-Studio, wiring the hub's palette
gate.**

`palette-check.mjs` measures the full cross product of text roles against every
fill tinted with the accent wash — which is what makes a palette portable. In
this app that produced **seventeen hard failures**, and the alpha that clears all
of them is **0.0287 against the shipped 0.15**: not a fix, the deletion of a
visible selected state.

`_renders` is the gate's own answer. A pairing the app was OBSERVED to paint
stays a failure; one it does not paint becomes a note, because it is a forecast
about a screen nobody has built. Its instruction is explicit: the list must be
MEASURED, never typed.

**So the list was measured, and it was wrong in three separate ways, each of
which made it SHORTER — which is the direction that turns a defect into a
note.**

- **It swept the state the app boots into.** Nine elements painting the wash
  measured 0x0 — six `.accent-outline` buttons, the crop tools, the welcome-back
  button, the install prompt — because the editor had no photo open. The sweep
  reported what it visited and nothing said which states those were.
- **Then requiring visibility was itself the wrong instrument.** What the gate
  needs is the triple of role tokens an element paints, and `display:none`
  changes none of them. Measured on all eight hidden elements: the ground each
  reverse-maps to while hidden is the SAME one it maps to forced visible. The
  size check was a proxy for "does this ever render" and a bad one — it cannot
  tell "never used" from "not right now".
- **The ground can be a gradient, and then there is no single one.** The landing
  page paints `radial-gradient(..., var(--bg-2), var(--bg))` on its body, so a
  walk looking for an opaque `backgroundColor` reaches `<html>` and finds
  nothing. Five more elements dropped. The honest answer is BOTH stops: two
  grounds, two contrast ratios, two pairings.

**Two pairings became seven.** The first version emitted
`--text-1 on --accent-soft over --surface-1` and `--text-3 …`, and it looked
right — a small app paints few pairings, and a short list of correct entries is
indistinguishable from a complete one.

**What found it was instrumenting the drops, not reading the results.** The same
sweep, re-run with every discarded element printed and a reason beside it,
answered the question in one run. Nothing about the output of the first version
was wrong; the elements it named really were painted pairings. It was the
silence that was wrong.

**So the rule is not "sweep more states" — it is that a sweep narrowing a gate
has no permission to skip.** Three holes became three abort conditions: a text
colour that maps to no known token, a ground that maps to no role or gradient
stop, and (removed once measured) visibility. The accent ITSELF is a known text
colour and is recorded as *skipped, not dropped*, printed on every run, because
the gate forms no accent-on-wash pairing — out of scope is a thing to say out
loud, not a thing to fall through.

**And a committed artefact needs two holds, because they cover different
halves.** `palette-spec-check.mjs` pins the spec to the sha256 of
`public/palette.css` and runs in the commit hook with no browser. It cannot see
`_renders`, which is measured from the whole app — so section 4 of the a11y
walk re-measures that list against the running app and fails on any difference
in either direction. The sweep is IMPORTED by the walk from the generator
rather than reimplemented: two implementations of one measurement is how a check
comes to agree with itself and with nothing else.

**And the same shape, the same afternoon, in the hub's own lessons gate.**
`lessons-check.mjs` reads a lesson's `**Enforced by:**` block with
`/\*\*Enforced by:\*\*\s*(.+)/`, and `.` does not match a newline — so it read
exactly ONE LINE of a wrapped prose block, for as long as it had existed. A
lesson declaring `GATE x · CHECKLIST y` with the separator past the first wrap
passed on the strength of its first token while the second was never resolved,
never verified to exist, and never printed by `--checklist`. **Widened to read
the whole block, the count went from 130 declarations to 160** — and four
lessons that had been declaring JUDGEMENT on a continuation line turned out to
carry no `**Smell:**` line at all, one of them declaring a bare `JUDGEMENT` with
no name after it. Four unautomatable lessons with nothing making them
recognisable, inside the gate whose entire job is to refuse exactly that.

It is the same failure as the short `_renders` list and it deserves the same
sentence: **a check that reads less than it appears to reports a pass about the
part it read.** Neither gate was wrong about anything it said. Both were quiet
about the part they never reached.

**AND A THIRD, the same day, in the accessibility walk beside it.** That walk's
hit-area sweep measures every page and the inside of every dialog. The crop bar
in Jefferson-Photography-Studio is neither: it is a MODE, and it only exists
once you enter crop or straighten. So a whole panel of controls, on the surface
that app is most used by finger, had never been in the sweep at all. Pointed at
it for the first time, Reset and Done measured **28px tall** and the ratio chips
**43 reachable** against a 44 floor.

**What made it invisible is that everything around them was correct.** The chips
buy their target with a `::before` extension and the straighten nudges declare
`min-height` outright, so nothing about the bar looked unconsidered — there was
no loose thread to pull. A sweep's blind spot does not look like a blind spot
from inside the sweep; it looks like a clean result.

The chips' 43 is its own small lesson: the design is 32px plus a ±6 extension,
which is exactly 44, and the walk measures REACHABLE area by hit testing outward
from the edges, where the two probes either side do not both reach the
extension's outermost pixel. **A design that hits the floor exactly has no
margin and loses one pixel to rounding.** Aim past the floor, not at it.

So the rule generalises past generated lists: **enumerate the states, not just
the surfaces.** A page, a dialog and a mode are three different things, and only
the first two are on screen when nobody has pressed anything.
