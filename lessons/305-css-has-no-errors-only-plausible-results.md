## 305 · CSS has no errors, only plausible results — an undefined token inherits and an over-specific selector silently wins

**Enforced by:** GATE Jefferson-Photography-Studio:tools/token-check.mjs —
every bare `var(--x)` names a property something defines; a `var()` WITH a
fallback is deliberate and is not checked. · CHECKLIST specificity-after-edit —
after adding a declaration to a broad selector, name the narrower rules it now
outranks and check each still wins.

**Smell:** a colour token spelled differently from its neighbours (`--txt-1`
beside `--txt`, `--txt-2`, `--txt-3`). A rule added to an id-scoped element
selector (`#panel button`) that sets a property some `#thatButton` rule also
sets. A DOM-reading contrast sweep that agrees with every rendered colour —
it always will, because the rendered colour is real whatever produced it.

**Measured 2026-09-14, Jefferson-Photography-Studio, one afternoon, both
directions.**

**A property that does not exist inherits.** `color: var(--txt-1)` where nothing
declares `--txt-1` is not a parse error and does not warn: the declaration is
invalid at computed-value time, which for an inherited property means INHERIT.
The element takes its parent's colour and looks entirely plausible. Three
declarations in the crop bar named `--txt-1`; no stylesheet in this repo has
ever defined it — the eighty real tokens are spelled `--txt`, `--txt-2`,
`--txt-3`. They had been doing nothing for as long as they had existed, and the
thing that found them was reverse-mapping rendered colours back to the tokens
they came from for a palette spec, which is a browser run. A text scan refuses
the commit instead, and it is twenty lines.

**And a broad selector silently outranks a narrow one.** Fixing the crop bar
meant giving its buttons a glass treatment, written as `#cropTools button { … }`
— one id and one element, **0,1,0,1**. That outranks `#cropDone` (0,1,0,0) and
`.ratio-chip[aria-pressed="true"]` (0,0,2,0), so it deleted the accent fill from
the two controls in that bar whose entire job is to look filled: the primary
exit and the selected ratio. It built cleanly. It deployed to nothing only
because a probe was run before the push. The fix is two `:not()`s —
`#cropTools button:not(.primary):not([aria-pressed="true"])` — and they are
load-bearing, not tidiness: excluded by the selector, those rules never collide
at all.

**The shared shape.** Neither failure produces an error, a warning, or a visibly
broken page. Both produce something that renders, looks designed, and passes any
check that reads the DOM — because the DOM is telling the truth about a colour
nobody wrote. The instrument that catches a rendered-colour bug cannot catch a
bug about which RULE produced it. That needs a source scan and a specificity
check, and both are cheap.

**The near-miss worth recording:** the first re-measurement after the glass fix
came back at 1.56:1 — unchanged — and the honest reading of that was "the fix
did not work". It was the probe: its ancestor walk looked for an opaque
background and stepped straight PAST `#cropTools` once the fill became `rgba`
glass, measuring the chips against the stage behind the HUD. A translucent
ancestor is part of the answer, never a thing to skip. Suspect the instrument
(§302), and note that the instrument had been correct until the code it measured
changed shape underneath it.
