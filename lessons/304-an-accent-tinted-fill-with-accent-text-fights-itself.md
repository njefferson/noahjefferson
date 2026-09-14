## 304 · An accent-tinted fill with accent-coloured text on it fights itself — the more visible the state, the worse the contrast

**Enforced by:** GATE noahjefferson:palette-check.mjs — the accent-soft cross
product, once an app declares a measured `_renders` list so the pairings it
really paints are hard failures. · CHECKLIST accent-on-its-own-wash — wherever a
fill is the accent at an alpha, the text on it is a TEXT token, never the accent.

**Smell:** `background: var(--accent-soft); border: 1px solid var(--accent);
color: var(--accent)`. Any selected/active/outline treatment whose fill and text
derive from the same hue. A token pair whose names make the pairing read as
obviously correct.

**Measured 2026-09-14, Jefferson-Photography-Studio, four rules and eight
palettes.**

Four controls shipped that shape: `.accent-outline` (six buttons in the editor's
panel), `.welcome-back`, `.help-tutorials`, and the active icon card's badge —
where the badge's own wash sits INSIDE the card's wash, so the accent is read
through two tints of itself.

The arithmetic is the whole lesson. A wash of the accent over a ground moves
that ground TOWARD the accent. Text that is also the accent therefore loses
contrast in exact proportion to how visible the tint is — the control is fighting
its own state indicator, and the fix that makes the state more obvious makes the
label less readable.

Across the four families in both themes:

- **the accent on the PLAIN ground clears everywhere** — worst 4.87 (day,
  `--page`), most between 5 and 10;
- **the same accent on its own 12–15% wash falls to 4.13** and is under 4.5 in
  **six of the twenty-four ground x palette pairs** — all four families in the
  day theme over `--page`, and mono and soft in the night theme over
  `--surface-1`;
- **swapping the label to `--txt` clears everywhere by a margin** — worst 6.33.

So the remedy costs nothing: the accent border and the tint still carry the
signal, colour is still not the only carrier, and the label becomes readable.
Nothing about the control's look changes except the one thing that was failing.

**Why it survived every gate until now.** Text-on-accent-FILL is measured
(`onAccent`). Text-on-plain-surface is measured. Text on the accent WASH is a
third pairing, and it is the one an app reaches for when it wants "selected but
not shouting" — so it is common, it looks deliberate in the source, and the
token names (`--accent-soft` under `--accent`) read as a matched pair. It took
generating the palette spec from the live DOM to form the pairing at all.

**The generalisation:** a translucent fill made FROM a colour is not a neutral
surface for that colour. Check any pairing where the fill and the ink share a
hue, and check it at the alpha that ships rather than at the alpha that passes.
