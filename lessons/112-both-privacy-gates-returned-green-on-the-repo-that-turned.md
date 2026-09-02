## 112 · Both privacy gates returned green on the repo that turned out to be dirtiest, because one keys on a token somebody had already rewritten and the other covers one shape that repo does not use

**Enforced by:** CHECKLIST — run the comprehensive scan BEFORE the gates, not
after, and count what it returns. The gates
(`noahjefferson:privacy-check.mjs`, `noahjefferson:quote-check.mjs`) are the
floor; the scan is the scrub. No script can decide which of its candidates are
legitimate, which is exactly why the count has to be read by a person.

Four sibling repos were scanned for the first time on 2026-08-20. Everything
below is measured.

**THE HEADLINE, AND IT IS THE OPPOSITE OF WHAT THE GATES SAID.** Ranked by what
the gates reported, the repos went: fauxplane 0 disclosures, 3d-printing-pal 0,
photo-pointer 17, Intersecting Parallels 33. **Ranked by what was actually in
them, fauxplane was the worst and 3d-printing-pal was genuinely clean.** The
gate output and the truth were close to inverted.

**WHY FAUXPLANE'S GATES WERE BLIND, and neither is a bug.**

- `privacy-check.mjs` anchors every pattern on the owner's NAME or role. An
  earlier pass in that repo had find-replaced the name to "the owner"
  throughout, so almost nothing matched any more — **including `LICENSE.md`,
  whose Required Notice had been corrupted into a name that is nobody's.** *A
  gate keyed to a token stops seeing a repo the moment somebody rewrites that
  token, and it reports that as a clean tree.*
- `quote-check.mjs` covers exactly one shape, the `> *"…` blockquote. **That
  repo contains none.** Its quotations all live in `/* … */` source comments and
  wrapped prose, which the gate's own header says plainly it does not reach — so
  the green was accurate about its shape and meaningless about the repo.

**THE NUMBERS PER REPO, each read from the tool that produced it.**

- **3d-printing-pal** — privacy 0, quotes 0, scan 17 candidates, **0 real**.
  Every candidate was the app's own patch notes addressing the reader in the
  second person, the reader's voice in a design comment, or the voice tool
  citing product copy. The only repo where green meant clean.
- **photo-pointer** — privacy 17, quotes 0 (no blockquote exists there either),
  scan 30. The number that describes the job is **114 mentions of the owner's
  name in `CLAUDE.md` alone**, most of them wrapping across lines where no
  single-line pattern reaches. The gate found 17 of roughly 60 real sites.
- **Intersecting Parallels** — privacy 33, quotes 0, scan 77. Name occurrences
  across every non-image tracked file: **254 in 32 files**, and it was in the
  CODE rather than the docs — `walk.mjs` 19, `solver.mjs` 15, `ui.mjs` 14,
  `render.mjs` 12, `snap.mjs` 10, the tests 20 between them, plus `app.css`,
  `index.html` and `sw.js`.
- **fauxplane** — privacy 0, quotes 0, scan 87, and **roughly 60 real
  attribution sites across 30 files**: three Pages Functions, the accessibility
  gate, the plant data, nine test files, and eleven modules under `public/src`.

**THE SWEEP NO GATE PERFORMS, and it found more than all of them.** After every
named attribution was gone, a separate pass for THIRD-PERSON references carrying
no name at all — a bare pronoun standing in for the owner, or a personal
possession such as a device tied back by a possessive — found **49 more sites
in Intersecting Parallels and 84 in fauxplane**. Nothing in the family can see
these. A design record can be entirely free of somebody's name and still be
tied to them on every page.

**A THIRD PARTY IS THE SAME HARM, and it reads as ordinary product context.**
fauxplane's "Who this is for" named a relationship and stated personal facts
about a real person, in `CLAUDE.md`, in `NOTES.md` and as an HTML comment in
`index.html`. It survived because it looked like a design input, and it IS one —
so it was rewritten as the audience in product terms (a home cockpit builder
assembling a 747 flight deck, who is not a pilot). Every design consequence
survived; the person did not.

**THE PARTIAL-REPLACEMENT FAILURE MODE, which is new and which the grep caught.**
Rewriting a multi-line quotation by matching its opening lines leaves its TAIL
behind — a dangling fragment that still reads as somebody's speech and still ends
in a quotation mark. Three of these were produced during this scrub and all three
were caught only by grepping the literal sentences afterwards, not by re-running
any gate. **Re-grep every sentence you rewrite, across every file type**, which
also found the same 1.14.2 entry duplicated verbatim in one `CLAUDE.md` and one
design argument repeated across five files in another.

**AND THE SCRUB'S OWN NOTES TRIPPED THE GATE TWICE**, in two different repos, for
the same reason: writing down what was fixed meant naming the pattern, and
naming the pattern meant reproducing it. That is the rule working, and it is
worth expecting — describe the SHAPE ("a name-and-date prefix followed by a
quoted sentence"), never an instance.

**THE COST.** 583, 240 and 263 unit tests plus two full app walks and three
accessibility gates were re-run to prove that a comment-only scrub of this size
changed no behaviour. It changed none — and `public/` was touched in three of the
four repos, so **no version was bumped in any of them**: a release number for a
comment scrub is a claim about the app that is not true.

**Smell:** a privacy gate reporting green on a repo you have not read. Ask what
token it anchors on and whether anything has rewritten that token; ask what
shape it matches and whether this repo uses that shape. Both questions have
answers in the gate's own header, and both were answered wrong here by not
asking.
