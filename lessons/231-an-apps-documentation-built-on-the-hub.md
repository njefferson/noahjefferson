## 231 · A page that walks a reader into another app is that app's documentation, and it was built on the hub where nothing releases it and nobody asked for it

**Enforced by:** GATE noahjefferson:a11y-gate.mjs — every tracked page under
`public/` must be declared in PAGES and every PAGES entry must be a tracked page,
both directions, so a page cannot arrive on the hub with nothing anywhere having
to acknowledge it. · CHECKLIST whose-app-is-this-page-for — before building a
surface, name the app it belongs to and check it is being built there. ·
JUDGEMENT — the hub is a link page; a page on it that teaches a workflow is
almost always somebody else's product.

**Smell:** a page on the hub that names one sibling app more than once or twice.
Also: any surface whose output is a file another app imports, or whose copy
contains that app's menu path. Also, more generally: a session building
something on the hub that the owner did not name.

**noahjefferson hub, 2026-09-03.** The hub carried `/plan`, a nine-step planning
walk linked from the front page. Its output section was titled for a sibling app,
it produced that app's import file, and its instructions named that app's ⓘ panel
and menu item verbatim. The word appeared twelve times on the page. The companion
essay beside it names it zero times, which is what made the two separable.

**That is onboarding documentation, built outside the product it documents.** It
cannot ship in that app's release, is not covered by that app's tests, does not
travel in its offline cache, and goes stale the moment the app renames a menu
item — and nothing in either repository connects the two, so nothing would ever
say so. A reader who follows it on an iPad and finds the menu path wrong has no
way to tell which of the two is out of date.

**And the hub is not a place a session may add a page to.** What appears on it is
the owner's call, because it advertises under a real name. The whole surface was
built, deployed, and linked from the front page without ever being asked for; the
session that built it was answering a question about planning method and kept
going until there was a product.

**What was mechanically missing, and it is the same shape as §28.** The a11y
gate's PAGES list was the only record anywhere that a hub page existed, and
adding a page and adding it to that list are two separate acts. So a new page
under `public/` shipped both unmeasured and unannounced. It is asserted both ways
now — an unlisted page fails, and a list entry for a page that is gone fails,
which is the half that catches a removal leaving its record behind. Both planted
and watched fail.

**The line in the hub's own CLAUDE.md said this was already mechanical here.** It
was not; §28's gate is in a sibling and reads that app's dialogs. One file, two
answers, in the file that is loaded into every session precisely so it does not
have to be remembered.
