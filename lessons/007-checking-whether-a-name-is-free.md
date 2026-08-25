## 7 · Checking whether a name is free

**Enforced by:** CHECKLIST name-search — search the name as software, not as a member of its own category, before proposing it.

**Ask "is this name taken in software?" — never "is another _X_ called this?"**
A name search scoped to your own product category filters out exactly the
companies that occupy the name. Two searches for a planner called *Perennial*
(`app task planner productivity App Store`) returned nothing and the name was
reported as un-killed. It is held by **three** software companies — Perennial
Labs, Perennial Systems, Perennial Software — and Perennial Labs was already
serving the exact subdomain the app wanted. One unscoped query,
`"Perennial Labs" web development agency`, returned two of the three at once.
The narrow query is a weak probe wearing a thorough one's clothes: it returns a
confident empty result. Run the unscoped *name + software* query FIRST, before
any category query and before the name is shown to anyone.
*(Horizons/planner, 2026-07-28 — the taken subdomain surfaced on a phone in
seconds, after the session had put it on a to-do list instead of checking it.)*

**Search results about a topic are not results about a product.** Adding
"trademark class 9" to a name query returns SEO articles explaining trademark
classes. It happened twice in one session and both empty pages read as clean.
One of the names was *Chroma* — Razer Chroma is an entire class 9 ecosystem.
Any name search returning only advice articles is a FAILED probe, not a clear
one. Same shape as the USA-NPN 200-with-an-empty-body: a success response
carrying nothing is a question, not an answer.
*(Horizons/planner, 2026-07-28.)*

**Do not hand over a check a search could have answered.** The unreachable half
of a check does not excuse the reachable half. `perennial.pages.dev` genuinely
could not be loaded — this sandbox's gateway refuses CONNECT to `pages.dev`,
`itunes.apple.com` and `tmsearch.uspto.gov` alike, measured — but the company
occupying it was findable by search the whole time and was never searched for.
Before delegating any step: separate what is blocked from what was merely not
attempted, and attempt the second half. Doctrine §6 allows delegation only after
proving impossibility, and "I assumed it was impossible" is not that proof.
*(Horizons/planner, 2026-07-28 — asserted twice in consecutive turns, the second
time immediately after being corrected for the first.)*

**A list of rejected candidates is a trail, not a proof that the space is
empty.** Thirty-odd names died before *Quietkeep*, and the session read the
growing graveyard as evidence of diminishing returns and advised parking the
search — four times, across four separate turns, unasked. It was wrong on the
facts: the graveyard is what made each later round faster, because every entry
records a *cause of death*, and the causes are themselves design constraints
(collides with our own spec; diagnosis-flavoured; game-UI register; occupied in
class 9). The name that landed came out of a seam the earlier deaths pointed at.
**Write the record so a candidate can be reconsidered, not so the search can be
declared over** — and do not editorialise about when someone should stop. It is
their search.
*(Horizons/planner, 2026-07-28 —
)*

**Naming bans in a repo's voice rules bind the session, not the owner.** This
repo's doctrine bars military vocabulary in naming. When the owner proposed one,
the session cited the ban back at the owner instead of checking the candidate.
A house style constrains what a session *proposes*; it does not overrule the
person the style belongs to. Check what the owner asks you to check, and if it is
still wrong, say why *on its merits* — *Quest log* died on register (it makes the
user a player character) and on being a literal game-UI panel name, which is a
real answer. The ban was not.
*(Horizons/planner, 2026-07-28.)*

**Say a name out loud before running a single registry check.** *Wynts* passed
npm, GitHub, the App Store, trademark and an internal grep — every check was a
*registry* check — and it sounds like **wince**, which the app's own shame-free
voice rules forbid. No registry catches a collision with an ordinary English
word; only pronunciation does. The check order that came out of it, cheapest and
most-likely-to-kill first: **1. say it aloud** · 2. grep your own spec (this kills
names that collide with your feature vocabulary — *Lens*, *Gauge*, *Alignment*
all died here) · 3. unscoped name+software search · 4. npm and GitHub ·
5. store and trademark searches on a personal device. Steps 1 and 2 are free and
instant, and were being run last or not at all.
*(Horizons/planner, 2026-07-28 — caught by the owner after the name had already landed
on `staging`; the staging gate contained it and it cost nothing.)*
