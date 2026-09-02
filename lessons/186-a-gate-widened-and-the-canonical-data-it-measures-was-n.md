## 186 · A gate was widened and the canonical data it measures was never re-run

**Enforced by:** GATE hub:palette-check.mjs — the colour floors, which found
this the moment it was pointed at `families.json`. · CHECKLIST
re-measure-the-canon — widening a gate is not finished until every artefact the
gate is the authority for has been run through the new version, in the same
commit. · CHECKLIST gate-your-own-data — a gate that runs on siblings and not on
the hub's own canonical file is a gate with a hole exactly where the source of
truth lives. · JUDGEMENT — a doctrine sentence stating a measured fact
("all four clear every hard floor") is a claim with a date on it, and widening
the measurement expires it.

**Smell:** a gate whose scope grew — one token to a whole ladder, one file to a
directory, one branch to all of them. Also: any canonical artefact that only a
local `npm run` command checks. Also: the phrase "already pass" in a document
nobody re-ran.

`palette-check.mjs` tests text against an accent-tinted fill. On 2026-08-25 it
was widened from the primary text token to the WHOLE text ladder, because an app
rendering a hint under a highlighted row was outside what it measured — a good
change, found by reverse-mapping one app's actually-painted pairings.

The hub's four palette families were never run through the widened check.
**Seventeen hard-floor failures across sixteen palettes**, from that day, in the
file every app is told to adopt from. `PALETTES.md` went on saying all four clear
every hard floor in both modes.

**Nothing caught it, and the reason is structural.** The gate runs in siblings
against each app's own palette; the only thing that runs it against
`families.json` is the hub's `npm run check`, a local command. The hub gates
every sibling's copy of the data and not the original.

**The cost lands on somebody who did as they were told.** print-tracker adopted
Instrument verbatim, as recommended, and its palette gate now fails on four
pairings that are byte-identical to the family's. From inside that repo it looks
like its own debt. It is not, and a session sent to "fix the four colour floors"
there would have restyled an app to work around a defect in the hub.

**The tell that it was inherited took one command.** The app's palette file and
the family were identical in every surface, text token, accent and alpha — so
the question was never "what is wrong with this app's colours" but "does the
family still pass", and that had not been asked since the gate changed.

**And the rule.** When a gate's scope widens, re-run it over the canonical data
in the same commit, and if the canon now fails, the commit that widened the gate
is not finished. Otherwise the widening is a promise about files nobody
re-measured, and the document describing them keeps making a claim that was
retired without anybody noticing.
