## 29 · A check satisfiable by coincidence reports coverage it does not have

**Enforced by:** GATE intersecting-parallels:a11y-gate.mjs — a control whose visible text is a single alphanumeric character and which carries an `aria-label` fails; the honest markup is an `aria-hidden` glyph plus an `.sr-only` name.

Doctrine §7e asks for the information surface to be **a letter `i`** in the app's
chrome. The obvious markup is `<button aria-label="Information — …">i</button>`,
and the repo's own WCAG SC 2.5.3 check — *the visible words must appear in the
accessible name* — passes it, because `"information".includes("i")` is true.

It passes for a reason that has nothing to do with the criterion. The intent of
2.5.3 is that someone driving the app by voice can say what is written on the
button; "i" is not a phrase anyone can say, and the substring test cannot tell the
difference between a name that contains the label and a name that happens to
contain that letter.

**The near-miss is the point.** Nothing would have gone red. The control would
have shipped, the gate would have reported the app clean, and the defect would
only ever surface for someone using voice control — the exact population the
criterion exists for, and the one least likely to be in the room.

**The tell to look for: a check whose PASS condition can be met by an input that
obviously violates the thing being checked.** Substring, `includes`, "not empty",
"length > 0" and `!== null` are where these live. When a check is written, ask
what the cheapest passing input looks like — if that input is one you would reject
on sight, the check is measuring the wrong thing.

The fix here was not a better substring test. It was noticing that **one character
is a symbol wearing a letter's clothing**, and using the markup already standard
for icons: mark the glyph decorative, put a real sentence in an `.sr-only` span.
Then there is no visible text for 2.5.3 to be about, and voice control gets a
phrase instead of a keystroke.

*(Intersecting Parallels 1.21.0, 2026-08-03. Caught while writing the control,
not by a gate — which is why the gate now exists.)*

---
