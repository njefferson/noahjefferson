## 230 · The strings nobody has to state are the ones that get published wrong — a byline and a placeholder are read first and written once

**Enforced by:** GATE noahjefferson:example-check.mjs — every placeholder and
every element marked `data-example` on a surface must be declared in
`.example-allow` with where it came from, both directions, and the list prints on
every run. · CHECKLIST invent-the-example-never-borrow-it — when writing sample
copy, invent the scenario; the nearest real one is the one in front of you and it
is somebody's. · CHECKLIST who-wrote-this-before-it-is-published — a byline is
declared per document from a fixed set with no default, never a free-text string
inherited from a template. · JUDGEMENT — an inherited byline is spelled exactly
like a true one.

**Smell:** any string that arrives with a file rather than being written for it —
a footer copied in with a converter, a placeholder typed while testing the form.
Also: a page published on a person's own site that they did not write.

**noahjefferson hub, 2026-09-03.** Two defects on two pages, found by reading the
deployed site rather than by any of the eleven gates behind it.

**The essay said "Written by Noah Jefferson" and a session wrote it.** The page
generator was ported from a sibling repo, and the per-essay metadata carried a
`footer` field holding free HTML. The string in it named the site's owner as the
author. It was never decided — it came in with the converter, was the only
example of the field, and the second essay would have inherited it too. The git
author of the commit that created the essay source is not a person.

**The plan walk loaded with four examples taken from a real plan.** The mission
placeholder, the assumption placeholder, the information-requirement placeholder
and the one sample output row were not invented; they were the plan in front of
the session that built the page, and they went onto a public site under somebody
else's name, in a browser field a stranger reads before anything else on the page.

**Why neither gate saw it, and this is the transferable part.** The hub runs a
privacy gate that anchors on the owner's name, a quote gate that finds set-apart
quotations, and a third-person gate that finds attributions carrying no name.
A placeholder trips none of them: it names nobody, quotes nobody, attributes
nothing. It is valid markup and honest prose. It is also, like a byline, a string
that no test asserts, no heading announces, and nobody re-reads after the day it
was typed — while being among the first things on the page a reader actually
takes in.

**What both fixes have in common.** Neither is a rule about content, because no
pattern can tell an invented plan from a real one — they are the same sentence,
and an inherited byline is spelled exactly like a true one. What can be checked
is whether anybody ever STATED it: the byline is now derived from a declared
`author` key with no default, and every example is declared in a list that prints
on every run. Same shape as `.quote-allow` and `.copy-allow`, for the reason
§103 gives — the only thing that has ever stopped this class is a check at the
moment of the change.

**AND THE BYLINE GATE NO LONGER EXISTS, BECAUSE THE SURFACE WENT.** The essay
was removed from the hub later the same day, and `essay.mjs` — which held the
declared `author` key, derived the byline from it and failed on an unknown one —
went with it, because a generator publishing zero documents is a check that
cannot fail (§7g). What is left of that half is the two checklist lines above.
This is worth knowing on its own: a rule whose only enforcement was a gate over
ONE surface loses its teeth the day that surface is deleted, and nothing
announces it — `lessons-check.mjs` would have gone red on the dangling citation,
which is the only reason it was noticed at all. The next document surface on any
site in this family rebuilds it in the commit that creates the surface.

**And the honest limit.** The example gate finds two exact shapes: a placeholder
attribute, and an element marked `data-example`. A sample assigned in script or
written into prose is invisible to it. The marker exists because of that gap —
marking an example is the same act as declaring it — and an unmarked one is not
caught. Three failure modes were planted and watched refuse: an undeclared
placeholder, a declaration matching nothing, and a provenance word outside the
list.
