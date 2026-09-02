## 57 · Quoting the person who found the defect is not provenance — it is republishing their messages in public, under their name

**Enforced by:** GATE noahjefferson:privacy-check.mjs — `ATTRIBUTION` is a second fail class beside `DISCLOSURE`, in every repo's CI. Watched going red on 42 real sites in the pre-scrub tree. DOCTRINE §0d is the rule.

**787 sites across two PUBLIC repositories.** Source comments, `NOTES.md`,
`CLAUDE.md`, `DOCTRINE.md`, `LESSONS.md`, test files, release notes served to the
web — every one carrying a verbatim quotation with a name attached to it,
including ordinary frustration and swearing, in repos peers and family could
read. None of it had been asked for or agreed to.

**IT FELT LIKE GOOD PRACTICE THE ENTIRE TIME, which is the only reason it got to
787.** Attributing a fix to the report that caused it reads as careful sourcing.
It makes a dry comment vivid. It looks like credit. Every instinct that produced
it is an instinct that produces good engineering writing somewhere else.

**The tell nobody looked for: a repo is a PUBLICATION.** Sessions treat comments
as a private notebook shared with the next session — that is what makes the
habit feel safe — and it is false for any repo with a URL. The same words in a
chat are a conversation; committed, they are published under the owner's name,
permanently, and indexed.

**Worst of all, it was in the privacy gate's own documentation.** The file that
exists to say what must never land in a repo carried a verbatim quotation, name
attached, in its own header, and the gate ran green every time, because it was
written to catch a diagnosis attached to a person and quoting somebody is not
that shape. **A gate catches the failure it was written for and is silent about
its neighbours** — the third time in one day that a check was green over a
defect it simply did not look at.

**THE REPLACEMENT IS NOT A COMPROMISE.** Every one of those comments is better
without a person in it, because the engineering fact was always the useful part:

- not "the reporter said the radar was bigger than the horizon" → **"the scope
  measured 269px against the horizon's 217"**
- not "the reporter asked why the range markers are on the right" → **"a column
  beside the scope costs it nothing on a landscape screen; a row below costs a
  quarter of the circle"**

The quote was never carrying information the measurement did not. It was
carrying a person.

**WHAT A SCRUB CANNOT REACH, and say it rather than let it be discovered:**
commit messages, and anything already deployed. Those are the owner's call and
never a session's.

**Two mistakes made DURING the scrub, both worth their own line.** A quote-span
removal ate three block-comment terminators, and a tidy-up regex matching
`\(\s*\)` stripped the parentheses from every empty call in the repo —
`evaluate(() =>` became `evaluate( =>`. The unit suite still passed, because a
comment scrub edits files no test imports. **Verify a mechanical edit with
`node --check` on every file individually, never with the test suite**, and
throw the whole pass away rather than hunting the damage.

**Smell:** any comment, note or commit message containing a person's words in
quotation marks. Any sentence that needs a named person to make sense. Any
construction that names who asked, who reported, or who said something, in a
file that will be pushed.

*(fauxplane and noahjefferson, 2026-08-05. It took being told twice, in
capitals, before I looked.)*

---
