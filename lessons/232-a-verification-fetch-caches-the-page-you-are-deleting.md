## 232 · A removed page outlives its removal at the edge, and the fetch that verified it is what put it there for a week

**Enforced by:** CHECKLIST removal-is-not-done-until-the-edge-agrees — after
deleting a deployed page, request the bare URL with no cache-buster and read
`cf-cache-status` and `age`; a HIT means the old page is still being served and
the removal is only true at the origin. · CHECKLIST verify-with-a-cache-buster —
add a query string to any verification fetch of a page you are about to change or
remove, so the check does not populate the cache it is checking. · JUDGEMENT —
"the deploy is green" and "nobody can reach the old page" are different claims.

**Smell:** any removal of a URL from a CDN-fronted static site. Also: a response
carrying `s-maxage` in days on a page whose content is expected to change. Also:
reading a live page to confirm a defect before fixing it.

**noahjefferson hub, 2026-09-03.** Two pages were removed from the hub and both
deploys went green for their exact commits. Both URLs kept serving the old pages
from Cloudflare's edge afterwards — `cf-cache-status: HIT` under a seven-day
`s-maxage`, while any request carrying a cache-busting query string returned the
front page from the origin, correctly.

**The second one was cached by the check that verified it.** Its `age` was 1432
seconds, not the 137437 of the first — because the only reason that URL was in
the edge cache at all was the fetch made twenty-four minutes earlier to read its
byline and confirm the fix had shipped. A page that had gone unvisited would have
disappeared with the deploy. **Verifying a page immediately before deleting it is
what gave the stale copy its full week.**

**The root document was never stale.** `/` came back `max-age=0,
must-revalidate` on every request, so no visitor was ever shown a link to either
removed page; only somebody holding the direct URL could reach one. That
asymmetry is the part worth carrying: the page whose freshness is obvious was
fine, and the pages nobody thinks about were the ones pinned for a week.

**And purging was not available.** A `*.pages.dev` hostname is not a zone in the
account, the session had no Cloudflare credential, and the connector needed an
interactive authorisation. So the honest report was the expiry date, not a
remedy — which is only acceptable because it was stated rather than left for
somebody to discover by opening the URL.
