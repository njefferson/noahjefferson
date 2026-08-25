## 108 · The rule said never quote the owner and never name the owner; only the NAME half was gated, and five verbatim sentences sat in two repos with every check green

**Enforced by:** GATE noahjefferson:quote-check.mjs — every set-apart quotation
(`> *"…`) is declared in a repo-local `.quote-allow` as *document*,
*product-copy* or *analysis*, both directions checked. Every sibling repo owes
the same wiring.

The rule has two halves: **never attribute anything to the owner by name, and
never in what words.** `privacy-check.mjs` enforces the first — every pattern in it
anchors on `noah` or `the owner`, which is correct and was fitted to 787 real
sites that all carried a name.

**A verbatim sentence of somebody's speech carries no name.** Six were found by
hand, all green on every gate in both repos:

- Two introduced by an attribution phrase and nothing else — one after
  *"Settled:"*, one after *"what was reported from the device"*, which is the
  *who reported it* pattern the rule names in terms.
- Three set apart as blockquotes under an explicit attribution line — *the owner,
  on…*, *reported from a device*, *recording the owner's own framing* — two of
  them first-person paragraphs, one carrying a typo, which is what raw message
  text looks like.
- One a copy of another, in a second record, found only because the first was.

**THREE MECHANICAL RULES WERE TRIED AGAINST THEM AND ALL THREE FAILED.** The
counts are the argument, and they were measured rather than guessed:

- **A speech cue near a quotation** — *settled*, *reported*, then a quote mark —
  flagged **39 files**. `settled` is a variable name in a UI module.
- **A block quotation with no source named in the lines before it** flagged
  **138**. Wrapped prose beginning with a quote character is everywhere.
- **A quotation carrying a first-person pronoun** flagged **227**. First person
  is the PRODUCT'S idiom: *"what am I waiting on Sam for"* is UI copy, and the
  reader's own voice is quoted on purpose throughout.

Every one would have been a gate firing on honest prose — which
`privacy-check.mjs` already records as the one thing a privacy gate cannot
afford, because a false positive teaches sessions to route around it. **The
third attempt is the instructive one: ordinary speech and the product's voice
are the same shape.** No pattern separates them.

**So the gate does not guess — it makes a LIST.** One narrow construction, the
blockquote that exists to reproduce somebody's words, of which there were
nineteen across two repos. Nineteen is a list a person can read. Each is declared
with a reason from a closed set, and a new one fails until somebody says which it
is. Same shape as the a11y contrast registry and the plain-mode lists, and for
the same reason as LESSONS 103: the only thing that has ever stopped this class
is a check at the moment of the change.

**AND THE FIRST SCRUB MISSED THREE OF SEVEN, BECAUSE THE GATE READS MARKDOWN.**
Four violations were blockquotes and were fixed; the same sentences were also
sitting inline in **source comments** — two in `src/`, one in a walk — and in
three more places in a NOTES file, all found only by grepping for the exact
sentences afterwards. **Fixing the instances a new gate can see, and calling the
class closed, is the gate's coverage mistaken for the rule's scope.** After
writing a gate, grep for the literal thing it just found, everywhere, in every
file type.

**One of them was self-inflicted and is the sharpest part.** The gate's audit
plant used the REAL sentence — so proving the gate catches republished speech
put republished speech into a tracked file permanently, in the tool whose job is
that proof. A synthetic quotation tests it identically. **Any fixture built from
a real violation carries the violation**, and the file that hunts a class is the
last place anyone looks for it.

**What is NOT covered, stated because the alternative is a false receipt.** The
emphasised shape `*"…"*` in source is a LIVE IDIOM — comments cite the event
vocabulary, a product law and the app's own strings that way twenty-three times
in one repo — so gating it would demand a declaration for every legitimate
citation. And a plain `"…"` in a `//` comment, which is what hid one of the
seven, matches 305 lines in one repo: a list nobody reads is the same as no list.
`--sweep` prints the readable half and the header names the stone left unturned.

**AND AN EIGHTH, IN THE MIRROR IMAGE, FOUND AFTER ALL OF THE ABOVE.** Every
attribution pattern in `privacy-check.mjs` reads left to right — role, then a
colon or a speech verb, then the quotation. **Written the other way round it is
the same act and matched nothing**: a bolded sentence of verbatim speech, closed,
then the role and a date, sitting in a repo's own question log. Now covered, and the
narrowing is the interesting part — the closing quote must carry a markdown
emphasis close, which is what separates a finished quotation from an HTML
attribute (a site's own `content="…"` metadata fired on all six otherwise), and
the possessive role is excluded because *the owner's call* is the anonymised form
the lessons depend on. Measured: 0 hits in one repo across 41 files, 1 in the
other across 363, and that 1 was the violation.

**The generalisable bit: a pattern encodes a word ORDER, and nobody notices,
because the order feels like part of the meaning.** For every attribution or
disclosure rule, write the same sentence backwards and run it.

**AND FIVE MORE AFTER ALL OF THAT, in ordinary wrapped markdown prose.** The
gate catches the `> *"…` blockquote; it does not catch a quotation sitting in a
normal paragraph, and that is where the rest were — **including the privacy rule
itself, recorded as a verbatim quotation, in the file the rule governs.**

The emphasised shape alone is useless in markdown: **287 hits in one repo**,
almost all of it the app's own UI copy being quoted. What separates a
republished sentence from quoted UI copy is an **ATTRIBUTION CUE in front of
it** — *settled*, *reported*, *verbatim*, *the owner,* — which every real
violation had and no piece of quoted product copy does. Two exclusions make it
readable: a DOCUMENT named in the gap is a citation, and a NON-HUMAN reporter
("the surface reported", "the walk reported") is a measurement. Measured: **10
hits across 131 markdown files, 5 of them real**, and the 3 that survive the fix
are two citations and one window crossing into the next section's title.

**So the count went 8 → 9 → 14 across one session, and every jump came from
widening WHERE the tool looked rather than from looking harder.** Blockquotes,
then source comments, then wrapped comments, then wrapped prose. Each time the
previous number felt like the total, because a scan that returns nothing new
feels like completeness and is indistinguishable from a scan pointed the wrong
way.

**Smell:** any rule with two clauses where one is gated. Read the gate's patterns
and ask which clause each one serves — here every pattern served the same clause,
and the file's own header described it as covering both. **A gate that covers
half a rule reports green about the other half**, and the description of it will
say otherwise, because the description was written from the rule and not from the
patterns.
