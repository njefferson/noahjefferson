## 110 · A "hide these" list that grows from chrome to sections has changed class, and setting `hidden` in a loop silently stops working

**Enforced by:** JUDGEMENT, plus GATE quietkeep:tools/smoke.mjs (asks the screen
via `checkVisibility()`, never the attribute).

Three attempts, and only a measurement caught two of them. The source read
correctly through all three.

**One: the loop.** The list had held three selectors — a clock, a Contents
button, a capture accessory — and setting `hidden` on them at the top of the
refresh worked because nothing repaints them. Grown to fifteen sections, every
one has an owner: six paint in the list-rerender, one is painted deliberately
AFTER the work refresh because it has to read what everything else did, and one
is refreshed from two call sites outside the refresh chain entirely. **There is
no last word to hold.** Any ordering that works is one call site away from
silently not working.

**Two: the injected stylesheet.** Generating a `<style>` element from the list at
mount gives one copy of the selectors and cannot be outrun by a repaint. **The
app's CSP is `style-src 'self'` and refused it** — correctly. The console said
so; the mode went on stripping nothing; every gate that read the source agreed
it was stripped. A runtime-generated stylesheet is not available to any app with
a strict CSP, which in this family is all of them.

**Three, which shipped: a generated artefact.** The rule is written into the
stylesheet by the tool that owns the list, and the gate fails on drift — the same
shape as CHANGELOG.md and the pre-commit hook. **A second copy held by a gate is
not the same object as a second copy nobody checks.**

**And the mechanism change broke a gate that was reading the wrong thing.** A
smoke assertion read `.hidden` on one of the elements and went red, because the
element was not displayed and the attribute was not set. That is the gate working
— and the reason to ask `checkVisibility()` rather than an attribute in the first
place. An attribute is one of several ways a thing can be off the screen; the
screen is the only thing the reader has.

**Smell:** a list whose members changed KIND while the code that consumes it
stayed the same shape. Chrome nothing repaints and sections with owners are not
the same object, and the loop over them looks identical.
