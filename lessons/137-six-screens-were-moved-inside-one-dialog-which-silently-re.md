## 137 · Six screens were moved inside one dialog, which silently removed the gate that had been refusing an unmeasured screen since the app was built

**Enforced by:** GATE 3d-printing-pal:tools/a11y.mjs — `checkInfoMenu` asserts, in
both directions, that every sub-screen is reachable from a control and every
control points at a sub-screen that exists. · CHECKLIST derived-gate-moved — before
restructuring a surface, name which gate derives its coverage from the OLD shape,
and re-make that assertion by hand in the same commit.

This family has one gate it is genuinely proud of: the accessibility gate derives
its list of surfaces from the markup, so **adding a `<dialog id>` without a state
that opens it fails the build.** That is what stops a new screen shipping
unmeasured, it is written into two `CLAUDE.md` files as a settled decision, and it
has worked every time.

An information panel was then restructured from one long scroll into a menu of
five destinations. The five destinations are `<div>` elements inside the SAME
dialog. **The derivation cannot see them.** Five new screens — with their own
prose, their own controls, their own contrast and their own focus behaviour —
entered the app underneath a gate whose entire job was to refuse exactly that, and
it stayed green, because from where it stands nothing was added.

**Nothing failed. Nothing could have failed.** The check was not weakened, not
disabled, not exempted. Its input stopped containing the thing it measures.

**The alternative was available and was worse.** Five separate `<dialog>` elements
would have been picked up by the derivation for free — and would have stacked
modals on modals, given "back" and "close" the same job, and left a reader inside
two dialogs unsure which one Escape would take. **The better design was the one
that broke the gate**, which is the whole difficulty: the pressure is always to
notice this at the moment you are congratulating yourself on the cleaner
structure.

**What the hand-written replacement had to cover, and both halves earned their
place.** A destination no control reaches is content nobody can get to, which is
the original hazard. A control pointing at a destination that does not exist is
worse than a missing one, because it answers *is this handled* with **yes** — the
same shape as the skip link in LESSONS 95 that existed, satisfied every review,
and could not be reached. Planted red on both directions before shipping.

**The restructure also had to be walked rather than scripted.** Four other checks
reached the moved controls by id, and would have kept passing while the route to
them was broken — a section un-hidden from script renders perfectly and proves
nothing about whether anything on screen leads to it. Pressing the menu item is
what turns an unreachable screen into a missing locator. LESSONS 134 is the same
sentence about a door a finger opens; this is it one level in.

**And the move itself found four defects that reading had not**, all from the new
states rather than from the change being large: a scrolling region with nothing
focusable in it once the menu was hidden, so a keyboard could not scroll four of
the five destinations; a release list running `h2` straight to `h4` because its
head was a styled `<p>`, leaving a screen reader four unattached "New" and "Fixed"
headings; a contrast-registry selector that matched nothing in the new section,
which that registry treats as a failure rather than a skip; and a footer control
split into two spans with different colours while the registry still measured the
container, which holds no text of its own — the same shape as the chip fill in
LESSONS 136, three days later, in the same app.

**The general rule.** A derived gate is coverage that depends on the shape of the
thing it covers. Change the shape and the coverage changes with it, silently and
in the direction of less. **Ask what the gate derives from BEFORE the restructure,
not after** — the moment to notice is while choosing the new structure, because
afterwards everything is green and nothing is pointing at the hole.

---
