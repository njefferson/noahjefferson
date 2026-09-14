## 299 · A shared look that lives in one app's stylesheet reaches one app, and the feature ships looking like it works

**Enforced by:** CHECKLIST look-with-the-module — anything more than one app
shows gets its CSS beside the module that provides it and imported from there,
never added to an app stylesheet. · JUDGEMENT — when adding a feature a sibling
already has, open the sibling's version and copy its SHAPE, not its markup.

**Smell:** a class added to `style.css` for an element that also exists on
another page. A second app's entry point importing only its own stylesheet. A
feature that renders but at the wrong size, the wrong colour, or without the
`user-select` you wrote — the shape of a class that simply is not there.

**Measured 2026-09-14, Jefferson-Photography-Studio.** One repository serves two
apps from separate entry points and separate stylesheets. The build stamp — the
version shown on screen so a screenshot says which build it came from — existed
in the editor and had never existed in the other app at all, for that app's whole
life.

Adding it was markup plus a boot write, and it rendered: the right text, in the
right corner, visible at rest. It was not the stamp. `.ver-tag` lives in
`style.css`, which the second app does not load, so the class did nothing:
`rgb(234,234,234)` at inherited size against the editor's `rgb(193,193,193)` at
11px, and `user-select` never reached it. **A feature that renders is the hardest
kind of missing**, because every check that asks "is it there" says yes.

**THE PATTERN WAS ALREADY IN THIS REPOSITORY, IN THE FILE NEXT DOOR, WITH ITS
REASONING WRITTEN OUT.** `swstrip.css` holds the update strip's look and is
imported by `swupdate.ts`, under a header saying in as many words that three
stylesheets would otherwise carry three copies and "which one is current" would
have three answers. The next feature to need exactly that did not use it. Nobody
had to be persuaded of the principle — it was sitting six inches away, agreed,
and the new work went the other way anyway.

**That is the part worth keeping.** A pattern is not adopted by being written
down, and a second instance of a solved problem does not announce itself as one:
it arrives as "add a small thing to the app that does not have it", and the
solved version is in a file nobody has a reason to open. The cheap habit that
would have caught it: before adding a feature the sibling already has, open the
sibling's implementation — not to copy the markup, which differs, but to see
where it put its CSS.

**And the measurement is what found it.** The stamp was asserted against the
other app's, both themes, in one probe: on screen at rest, the colour IS the
`--txt-3` token rather than merely different, opacity exactly 1 (a stamp dimmed
with opacity is invisible to a contrast gate), the same 11px, selectable. Four
comparisons, one of which came back wrong, and the wrong one was invisible to the
eye at a glance.
