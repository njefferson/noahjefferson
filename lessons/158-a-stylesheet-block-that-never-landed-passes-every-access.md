## 158 · A stylesheet block that never landed passes every accessibility check, because none of them ask where the words are

**Enforced by:** GATE solve-ent:tools/a11y.mjs — every `[data-surface]`'s first
words must start at the same horizontal inset as the page's main content, within
a pixel. · CHECKLIST look-at-it — a new surface gets a screenshot read by a human
before it is called done, because the checks that pass are not the ones that
would notice.

**Smell:** a new surface that went green first time. Contrast, target size,
landmarks and axe are all satisfied by *unstyled* markup — that is the point of
them, and it is also the hole.

A new update strip was added to Solve-ent along with its stylesheet block. The
edit that was supposed to add the CSS matched no anchor and did nothing, silently:
a `replace()` with no assertion on a file whose section headers had changed.

**Every gate went green.** The contrast was fine — an unstyled element inherits
the body's colours, which are the measured ones. The targets were fine; buttons
have a minimum height from a different rule. The landmarks were fine. axe had no
complaint. Every rendered colour still reverse-mapped to a token, because no
colour had been introduced. The one difference between the shipped page and the
intended one was that the strip ran flush to both screen edges, its text touching
the bezel, while every other word on the page was indented — and **not one check
in the suite asks where a word starts.**

It was caught by looking at a screenshot.

The check that closes it is four lines and one measurement: the first words of
every visible surface, against `main`'s content edge, within a pixel of
tolerance — a real surface measures 14.390625 against 14.4, and a surface whose
rules are not applying measures 0. It planted red immediately on the exact
defect, which the whole prior suite had passed.

**The general form: accessibility checks measure whether an element is USABLE,
never whether it belongs to the page it is on.** A surface can be perfectly
legible, perfectly clickable, perfectly announced, and obviously broken to
anybody looking at it. So a suite made only of those checks has a blind spot the
exact shape of "the styles did not apply", which is one of the most common ways a
front-end change goes wrong.

**And the smaller lesson underneath it, which cost the same afternoon:** a
scripted edit that matches nothing must FAIL. Every other edit in that session
asserted its anchor; this one did not, and the difference between the two is the
difference between a caught mistake and a shipped one.
