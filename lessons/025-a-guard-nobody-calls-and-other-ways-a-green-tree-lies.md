## 25 · A guard nobody calls, and other ways a green tree lies

**Enforced by:** CHECKLIST plant-the-fault — the same mutation rule as §7g. A guard is not wired until breaking it turns something red.

**A green tree is evidence only about the checks that actually ran — so break
the invariant and watch something go red, rather than reading the gate and
believing it.** Every item below was a guard, a signal or a tool that looked
correct, was documented as correct, and was not wired to anything.

*(photo-field-tools, 2026-08-02, building a new app from a written spec. Every
item here was found by making a check FAIL on purpose, or by looking at a
screenshot after the checks had already gone green.)*

### The guard that was never called

The light meter has one hard rule: with no calibration profile it shows relative
stops only and must never print an absolute EV or a lux value. The module had a
function for it, `canShowAbsolute`, a header comment saying the rule was
"enforced in ONE place", and an acceptance check asserting no absolute value
reaches the panel. All three looked right.

Setting the function to `return true` — the most direct possible violation of
the rule — **changed nothing and the gate stayed green.** The render branch read
`calibrationState.calibrated` directly and never called the guard at all. The
function was dead, the comment was false, and the gate was passing for reasons
unconnected to the thing it claimed to protect.

Wiring the branch through the guard and re-running the same mutation produced
four failures including two crashes.

**The lesson is not "write a guard".** It is that **a mutation test is the only
thing that proves a gate is connected to the code it names.** A gate can be
correct, a guard can be correct, and the wire between them can be missing — and
every observable signal is identical to the healthy case. This is 7e's "comment
that made the bug sound principled" with a second layer: the comment described
an architecture that the code did not have, and the comment is exactly why
nobody checked.

**Do this on every load-bearing invariant before shipping it:** break it in the
crudest way available, watch the gate fail, put it back. If the gate does not
fail, you have learned something far more valuable than a passing run.

### A signal that distinguishes nothing

The hotspot grid must never let an UNTESTED lens combination read as a clean
one — spec called it load-bearing in the field. Four channels were declared and
documented: a dash instead of a number, an empty severity bar, a dashed hatched
border, and the word UNTESTED in the accessible name. The acceptance gate
checked fill, hatch, border style, text and accessible name. Green.

Then a screenshot: **a clean cell is severity step 0, so it also drew three
empty segments.** On that channel the two states were pixel-identical. One of
the four declared signals carried no information at all, and the register said
it did.

Fixed by drawing no bar on untested cells — *absence* versus presence is a real
difference; three empty boxes beside three empty boxes is not. The gate now
asserts absence rather than counting segments.

**When you declare N redundant channels, check each one against the state it is
supposed to distinguish FROM, not merely that it exists.** "Untested has an
empty bar" is true and useless. The question is always "and what does clean
have?"

### Two gate bugs that flagged correct code

Both would have been "fixed" in the app by anyone in a hurry, making it worse.

**Measuring inert content.** A modal opened with `showModal` makes everything
behind it inert — unreachable by pointer, keyboard or AT. A structural sweep
over `document` still finds it, so every chip on the page behind "collided" at
0px with every control in the dialog, and f-numbers appeared as duplicate names
across two surfaces that can never both be live. Dozens of failures, all
imaginary. Scope structural checks to `dialog[open]` when one is open.

**Rects that extend past their clipping box.** A control inside a scroll
container has a `getBoundingClientRect` that runs on past the container when the
content overflows — so an off-screen chip appeared to sit 0px from a footer
button a finger could never reach it from. Intersect with every clipping
ancestor before measuring spacing. Size still uses the real rect; a 30px button
is 30px whether or not it is scrolled.

**And one more, on SC 2.5.3** (visible words must appear in the accessible
name): comparing `textContent` as a single substring is wrong the moment a
control is built from two elements. "Body" + "Z50 II" serialises as `BodyZ50 II`
with no separator, which can never be a substring of any sensible label. Use
`innerText`, tokenise into words, and strip trailing punctuation — otherwise
`VR.` in a label fails to match `VR` on the button and the gate teaches people
to ignore it.

**All four are the same failure**: the instrument modelled the DOM instead of
modelling what a person can reach and say. PALETTES.md §7 already says suspect
the instrument first; this is the same rule for structural checks, not just
colour ones.

### The grid column that widened the whole page

At 320px the entire page — header included — measured 345px and scrolled
sideways. The cause was two layers away from the symptom: `body` is a CSS grid,
a grid column defaults to `auto`, and an `auto` column sizes to its widest
descendant's **min-content**. The horizontally-scrolling hotspot matrix, sitting
correctly inside its own `overflow-x: auto` container, was still dictating the
width of everything above it.

`grid-template-columns: minmax(0, 1fr)` fixed it. **A scroll container can only
do its job if its ancestors are allowed to be narrower than it** — and in grid
and flex layouts they are not, by default. Worth checking on any app with a wide
table, code block or chart inside a grid or flex shell.

### Two test expectations that were wrong, not the code

Both caught immediately because the anchors came from outside the
implementation, which is the entire argument for writing them that way.

Vertical frame-fill needs *more* distance than horizontal, not less: the short
sensor dimension covers less real-world height at any distance, so a subject
already fills more of the vertical frame and you must back further away. And ISO
450 snaps *up* to 500 — it is an exact linear tie between 400 and 500, and the
geometric midpoint is 447.2, so log-space snapping breaks the tie upward. That
case is precisely the difference between log and linear snapping, and a suite
without it would pass with either rule implemented.

### When the spec contradicts itself, say which half you followed

Three places needed a written decision rather than a silent pick: the spec asked
for a press-and-hold gesture that Doctrine §4 forbids outright (built as a
toggle); §5.1 wanted a label "on the IR body" while acceptance §11.2 wanted it
on every result (took the stricter); and the spec's own derived figure was
wrong — "0.76× the f-number, i.e. about two-thirds of a stop" is right on the
ratio and wrong on the conversion, because aperture stops go as √2 and it is
0.78 stops. The app computes it rather than quoting either number.

**A spec is a document with bugs in it.** Implementing a wrong derived figure
faithfully is not fidelity, and neither is quietly correcting it. Compute from
the primary formula, pin it with a test, and put the discrepancy in NOTES.md
where the owner can rule on it.

### The auditor skipped the file it could not read, and said "Good job!"

`zizmor --offline .github/workflows/` printed
`No findings to report. Good job!` and exited **0** while one of the five
workflows had never been audited at all. A YAML error — a `run:` line written
as `run: "$RUNNER_TEMP/bin/zizmor" --offline …`, which YAML reads as a quoted
scalar followed by garbage — made the file unparseable, and zizmor's default
behaviour is to log `failed to parse input` at WARN, skip it, and carry on. The
warning scrolled past in a wall of cheerful `🌈 completed` lines. The only
reason it was caught is that the file count in the output dropped from five to
four.

This is §7g and the top of this section in a tool somebody else wrote: **a check
that silently reduces its own scope is worse than one that fails, because the
green tick now certifies less than you think it does — and it is the malformed
workflow, the one most likely to be wrong, that gets excused.** zizmor ships
`--strict-collection` for exactly this and it is not the default. It is now on
in both repos and in `npm run security`.

**Ask of every third-party checker: what does it do with input it cannot
handle?** Skipping-and-passing is a common default and it is never the one you
want. Verified the way §7g demands — the broken file was re-broken on purpose
and the two commands run side by side: without the flag, exit 0 and "Good
job!"; with it, exit 1.
*(the hub and photo-field-tools, 2026-08-03.)*

---
