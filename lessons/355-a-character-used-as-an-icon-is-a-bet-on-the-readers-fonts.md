## 355 · A character used as an icon is a bet on the reader's fonts, and the bet is lost silently, beside an SVG of the same icon that works

**Enforced by:** CHECKLIST symbol-glyphs — before shipping any page, grep the
served markup and scripts for characters outside the basic text blocks that are
used as pictures (arrows, share marks, dingbats, anything with `&#xFE0E;` after
it) and check each one against the fonts of the device the app is actually used
on, not the machine it was built on. · JUDGEMENT — whether a character is text
(a word, a punctuation mark the reader's own fonts must carry) or a picture
(which belongs in an SVG the page ships itself).

**Smell:** an icon typed as an entity with a text-presentation selector after it,
such as `&#x2BAD;&#xFE0E;`. Also: the same icon drawn two different ways on two
pages of one app.

**Measured 2026-09-24 in Jefferson-Photography-Studio, reported from the
device.** The launcher's "Share this app" button drew its arrow as U+2BAD,
followed by the text-presentation selector. No font on the iPad carries that
code point, so it rendered as an empty box. The editor's own Share button, one
page away, drew the same arrow as an inline SVG and rendered correctly. So did
Macro Studio's. The launcher's install instructions used the same character a
second time.

**Nothing could have caught it in the container.** A desktop Chromium has a font
that carries the arrow, so every screenshot showed an arrow, and the button
appears only when the app is installed, which is when nobody was looking at it.
**The fix is not a better character, it is no character**: the SVG the rest of
the app already used, with a size rule on each page that loads it. The launcher
did not load the stylesheet that sized it in the editor, and Macro Studio's copy
of the SVG had no size rule at all.
