## 73 · Splitting one surface into five re-creates every per-surface obligation five times, and none of them are in the diff

**Enforced by:** CHECKLIST split-repeats-the-obligations — when a surface becomes several, list what the ORIGINAL had that was hard-won (the way out, the repaint, the focus return, the overflow rule) and assert each on every new surface before believing the split.

One dialog became six. Every element kept its id and its classes, no handler
changed, the typecheck was clean and the structural walk was green. Three
separate defects had shipped, and all three were things the original surface had
solved years of releases earlier.

- **The way out went off the bottom.** The original was a flex column that did
  not scroll, with the close control outside the box that did — a fix recorded
  in the CSS as *"found twice, on device"*. The new sheets were ordinary
  dialogs: the whole box scrolled, and the Close sat after the body, inside it.
  On three of five, at phone width, scrolling to the end put the way out off
  screen. **The exact defect, reintroduced five times over, by a change that
  touched no CSS at all.**
- **The repaint stopped running.** Half of what those screens showed was read
  from storage at open time, by the panel's own open handler. The elements moved
  out from under it while the handler went on calling for them, so a screen
  reached by the new route showed the state the app was in at boot. The file's
  own comments record that same defect being fixed twice before.
- **The accessibility gate stopped measuring three quarters of it.** Its registry
  was one list because the surface was one dialog. Split by surface, nine entries
  went red immediately — each one naming a control the gate had been claiming to
  check on a screen it was not on.

**The reason none of it appeared in review:** a split diff is almost entirely
moved lines. The eye reads *this block is now over here*, correctly, and there is
nothing on screen that says *and the property that block relied on came from its
old parent*. Inherited behaviour has no diff.

**So the move is to enumerate before splitting, not to review after.** Take the
original surface and write down what it does that was expensive to learn — every
comment beginning "found on device" is one. Each entry becomes an assertion, and
each assertion runs against every new surface. Here that meant one loop over five
ids asking the browser whether each Close was on screen and unobstructed at the
bottom of its own scroll, and it went red on three the first time it ran.

**The general shape:** a container's children inherit properties nobody wrote
down, because the container was where they were written. Splitting the container
is the moment those properties become five separate promises, and the moment
nobody can see that they were ever one.

---
