## 218 · A contrast gate measures the palette, and the defect was a pair nobody designed

**Enforced by:** GATE unlisted-app:tools/contrast-check.mjs — beyond the
declared token pairs it now refuses any colour set outside the tokens in
markup or view code, and any button class scoped to the element rather than
the class. · CHECKLIST rendered-pairs-need-a-browser — a token-pair gate
proves the palette and proves nothing about which pairs the page actually
puts together; a real assertion needs a rendered page. · JUDGEMENT — which
unintended combinations a page can produce cannot be enumerated from the
stylesheet, so the gates target the MECHANISMS that produce them.

**Smell:** an element selector for a class that markup also puts on a
different element (`button.quiet` where `<a class="button quiet">` exists).
Also: any inline colour, and especially one added to fix a contrast
complaint — it is a value in the one place nothing measures.

**The unlisted app, 2026-09-02.** Six of the app's navigation links were
unreadable in both themes from the first release. Settings, Cabins, Cruises,
the availability grid, the manual, and the link out to an event's source.
Measured after the report: **1.30:1 in the light theme and 1.64:1 in the dark,
against a floor of 4.5.** Found by somebody using the live app, not by any
gate and not on any device the work was done on.

**Two mechanisms, and each was harmless alone.** The stylesheet said
`button.quiet { background: var(--surface); color: var(--text) }` — an ELEMENT
selector, which cannot match `<a class="button quiet">`. Those anchors kept
`.button`'s accent FACE. Separately, each anchor carried
`style="color: var(--text)"`, added at some point to fix the way they looked,
which set the page's foreground on the page's darkest surface. Either one on
its own is a cosmetic difference. Together they are the page's text colour on
the page's accent colour, a pair nobody ever designed and nothing ever
measured.

**The gate was green throughout and was right about everything it checked.**
Twelve token pairs across two themes, every one of them passing, every one of
them a combination somebody had INTENDED — `--accent-text` on `--accent`,
`--text` on `--surface`, and so on. The failure is not in its arithmetic. It
is that a palette gate answers "are the colours we chose to pair legible" and
the question that matters is "are the colours this page actually puts together
legible", and only a rendered page can answer the second.

**So the new rules target the mechanism, not the appearance**, because the
appearance needs a browser and the mechanism does not. No colour may be set
outside the tokens anywhere in the markup or the view code — an inline colour
is by construction a value nothing measures. And no button class may be
scoped to `button`, because the element such a selector misses keeps a face
that was never paired with its text. Both were red on the tree before the fix,
which is the only evidence a gate is real.

**The inline style is the part worth remembering.** It was not sloppiness; it
was somebody fixing exactly this symptom, in the only place they could see it,
by hand. A fix applied outside the system that measures things is a fix that
cannot be checked, and this one made the ratio worse than leaving it alone
would have.

**And the sibling finding, reported in the same breath by the same user:** the
app's manual is read by JUMPING, and a contents list four screens above a
section is not navigation. There was no route back to the index and no route
out of the document short of scrolling the whole way up. Nothing in a link
checker can see this — every anchor resolved, and the gate said so on every
run. **A document that navigates in one direction passes every structural
check a document can have.** The rule is now a gate too: a page with a
contents list carries a standing link back to it, and every document carries a
standing way out.
