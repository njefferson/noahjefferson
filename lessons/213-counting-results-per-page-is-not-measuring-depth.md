## 213 · Counting results per page is not measuring depth — it can be the same page, five times

**Enforced by:** CHECKLIST compare-contents-not-counts — when probing whether a
paginated source has more behind it, compare the SET of items returned, never
the count; two pages returning fifteen each is evidence of nothing until you
know they are different fifteen. · CHECKLIST try-every-pagination-shape —
before concluding a site paginates or does not, probe each idiom it might use
(`?paged=N`, `/page/N/`, `?offset=`, a list view, its API), because a wrong URL
shape is your error and reads exactly like the site's limitation. · JUDGEMENT —
whether deeper coverage is worth the requests is a decision about somebody
else's server, and no gate can make it.

**Smell:** any sentence of the form "page two returned fifteen results, so
there are more". Also: a coverage number quoted from a browser session being
used to size a job that will run without one.

**The unlisted app, 2026-09-02.** A casino's event calendar was wired at fifteen
events, with a note that only the first page was read and roughly seventy-two
existed. Deciding whether to read deeper, the pagination was probed: pages two
through six answered 200 and yielded 15, 16, 15, 15, 16 event links. That reads
as five more pages of events and a straightforward cost question.

It was the same page five times. `?paged=2`, `/calendar/page/2/` and
`?view=list` all return the identical fifteen — the paging happens in the
browser, and the links are decorative. **The counts were consistent because
they were the same list**, and nothing in a per-page tally can tell that apart
from real depth. Comparing the sets took one probe and settled it immediately.

**And the number that started it was true and inapplicable.** Recon's
seventy-two was real: it came from a browser, where the JavaScript runs. A
nightly job has no browser, so the figure described a capability the pipeline
did not have — the same shape as §212, where the defect lived between the file
and its host rather than in either.

**What the deeper route actually cost, once measured.** The site's REST API
returns about a hundred event posts in ONE request, with their URLs — but its
custom-field block comes back empty, so it carries no event dates, and those
live only in each event's own page. Full coverage was therefore one request
plus a hundred page fetches per night, against a small operator's website, for
events months out that a one-day-at-a-time surface cannot show until they are
close. Declining that is a judgement about someone else's server, not a
shortfall.

**The general form.** Depth is a claim about CONTENT, and every cheap probe
measures VOLUME. Volume is equal under the two hypotheses you are trying to
separate — more pages, or the same page repeated — so it cannot distinguish
them, and it produces a confident number either way. Compare what came back,
not how much.
