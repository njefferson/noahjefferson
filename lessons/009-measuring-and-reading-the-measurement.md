## 9 · Measuring, and reading the measurement

**Enforced by:** CHECKLIST no-beacon — read what the platform already counts server-side before adding any client-side measurement.

**Cloudflare already counts every request server-side, per host and per country
— reaching for an analytics beacon is the wrong tool AND a breach of §1.** Asked
how to see app usage by country, the session proposed enabling Cloudflare Web
Analytics across all eight Pages projects: a JS beacon, on apps whose stated
identity is *no analytics*. It then wrote a careful trade-off paragraph about
breaking that promise — reasoning about how to justify the violation instead of
questioning the premise. **Analytics → Account analytics** was already on,
already retaining the data, and already broke it down by **Top Hosts** and
**Requests by Country**, with nothing injected anywhere: 27.42k requests over 7
days across 36 countries, hosts itemised (`quietkeep.pages.dev` 2.81k,
`noahjefferson.pages.dev` 72). The edge counts what it already serves; a beacon
can only ever count *less*, because blockers drop it. Before proposing a
measurement, find out what the platform already measures for free — and when the
app's own doctrine forbids the thing you are about to suggest, that is the signal
to look harder, not to start writing the caveat.
*(the hub, 2026-08-01.)*

**Requests are not usage, and on a public host most of them are not people.**
That same 27.42k read as 62.3% United States, 10.5% France, 10.0% Germany, which
looks like an audience until composition is checked. France was one IP —
`185.177.72.22`, 2.7k requests, user agent `curl/8.7.1` — walking a secrets
wordlist against quietkeep: `/deploy/.env.smtp`, `/.aws/secret_access_key.txt`,
`/nuxt/secrets.env`, ~120 hits each, all 4xx. France, Germany, Netherlands,
Ireland and Singapore together — the five largest commercial hosting regions —
were **27.9%** of all traffic. Two composition checks separate machines from
people with no extra tooling: **the asset ratio** (html 12.29k against js 2.94k;
a real page load pulls html *and* its js, css and icons, so 4:1 means most html
responses never became a rendered page) and **the protocol mix** (HTTP/1.1 was
7.93k of 27.42k, **29%**, while current browsers negotiate h2/h3). The same page
offered "9.98k visits" in large type. Quote the filtered number, or state plainly
that the figure includes bots — an unqualified visit count is a flattering lie,
and it is the one a proud owner will repeat.
*(the hub, 2026-08-01.)*

**Third recurrence of the UI-guessing failure above — in a session that had this
file open.** Asked for per-app country data, the session twice described a
Cloudflare control it could not see: "Add filter → Host = …", then a per-site
export scope. Both were invented, and both times the owner had to send a screenshot to
refute them. The disproving evidence was available the whole time and was only
gathered *after* the second correction: `dash.cloudflare.com` and
`api.cloudflare.com` both fail CONNECT from the sandbox (HTTP `000`), so no claim
about that dashboard was ever verifiable from here. **Check whether the surface
you are about to describe is even reachable, and if it is not, say "I cannot see
it — send me a screenshot."** One screenshot costs a single message. The guess
cost four, plus the goodwill of the person who had to keep proving it wrong. Two
prior entries said this; writing them down did not stop it. What might: treat
*any* sentence naming a menu, tab or button in a third-party UI as requiring a
citation, exactly like a security claim (§7f).
*(the hub, 2026-08-01 — see the two entries above on UI paths and repo metadata.)*

**A sampled dataset does not return counts, and the drift is the tell you will
explain away twice before you believe it.** Cloudflare's
`httpRequestsAdaptiveGroups` returns SAMPLED rows: `count` is how many records
landed in the sample, and each carries a `sampleInterval` saying how many it
stands for. Summing raw counts under-reports by whatever rate that query drew.
The evidence appeared early and was dismissed as noise twice: a host no filter
touched went 5,106 → 4,488 → 3,483 across three runs, and excluding one *French*
IPv6 address appeared to cut *Korean* traffic 819 → 160 — which one address
cannot do, and which should have ended the matter on sight. **When a number
moves that a change cannot possibly have moved, stop and find the mechanism;
"sampling noise" is a label, not a diagnosis.**
*(the hub, 2026-08-01.)*

**Then the fix was wrong too, and the only reason that is known is a number
outside the tool.** Weighting by `count × avg(sampleInterval)` — the textbook
estimator — produced **684,433** requests for a 7-day window in which
Cloudflare's own Account analytics reported **27,424**. A 25× overshoot. Raw
counts gave 64,012, still 2.3×. Three figures, at most one right, none verified.
The tool now ships raw counts, names the weighted estimate beside them, and
prints the reconciliation gap, because a number that is confidently 25× wrong is
worse than one labelled unverified. **Reconcile any derived metric against a
figure the vendor publishes before believing it — the second implementation is
not more trustworthy than the first just because it is newer, and a fix that was
never checked against an outside number is a guess with more code around it.**
What survived all of this was never a magnitude: that `2a06:98c0::/29` is
Cloudflare's own range and `185.177.72.22` is a secrets scanner came from user
agents and 4xx shares, and those held while every total moved.
*(the hub, 2026-08-01.)*

**RESOLVED, same night — and the resolution corrects both entries above:
"unverified" had been declared one query before the data that verifies it.**
When the three irreconcilable totals (raw 64k / weighted 684k / dashboard 27k)
were treated as a question instead of a dead end, the discriminating evidence
turned out to be sitting in the same dataset list: a `requestSource` dimension,
and an overview dataset described as counting "requests made by end users." One
calibration run over fixed complete-UTC days settled everything. (1) The
dashboard counts `requestSource = eyeball` — end users. Eyeball-only raw counts
matched the dashboard's own CSV export **request-for-request on seven
countries** (DE 2,732, KR 559, GB 336, AU 233, CH 164, JP 133, SG 393) and
within 2 requests on FR; `httpRequestsOverviewAdaptiveGroups sum.requests`
independently returned the identical total, 27,807. (2) So `count` in the
adaptive datasets already IS the sampling-adjusted request count — the first
entry's "raw counts under-report" was wrong, and the ×sampleInterval "fix" was
double-applying an adjustment Cloudflare had already made. Exact equality on
seven rows is not possible any other way. (3) The run-to-run drift that started
the panic was the ROLLING WINDOW sliding between runs — identical queries over
fixed day boundaries agree to 0.0%. (4) The missing half of the traffic was
never missing: 35,784 requests were `edgeWorkerCacheAPI` — quietkeep's own
Worker machinery, the Cloudflare-IPv6 "France" traffic — plus 2,499
`earlyHintsCache`. Real requests, not visitors. Three rules earned here: **when
totals from the same system disagree, decompose by scope before doubting the
measurement — the datasets were counting different populations, and both were
right**; **windows must be fixed to day boundaries before any run-to-run
comparison means anything**; and **"unverifiable" is a claim like any other —
it is not allowed until the cross-checks within reach are actually exhausted,
and the person who declares it early is just giving up with a technical
vocabulary.**
*(the hub, 2026-08-01, later the same session.)*

**A filter applied to the headline but not to the breakdowns silently puts the
machines back.** The snapshot computed "real users" (~104 distinct phones +
tablets) one way, then built by-app, by-country and the heatmap from raw eyeball
**request** counts — a different population. So the dashboard's hero said 104
real users while its by-country bars said US 12,946, and the two were never
reconciled. Filtered to
distinct devices, by-country collapsed to US 72, Sweden 9, then single digits —
and it exposed inversions the request view had buried: Netherlands 1,150
requests / 3 real devices, Korea 529 / **0**, Ireland 492 / **0**, Singapore
260 / **0** (datacenter and single-app crawler traffic), while Sweden showed 47
requests but **9** real people — the #2 real audience, nearly invisible in the
raw view. **When you filter a headline metric to a trustworthy population, apply
the SAME filter to every breakdown that sits under it, or relabel the breakdowns
as the other population in the same breath. A per-country or per-app view left at
request granularity under a device-level headline is not a smaller version of the
headline — it is a different, more flattering number wearing the headline's
name.** The fix: `snapshot` now emits real-users-by-country and real-users-by-app
(distinct mobile+tablet IPs), the request views stay but are labelled "machines
included," and the dashboard leads with the device numbers and demotes requests
to a clearly-marked machine layer.
*(the hub, 2026-08-03.)*

**A chart drawn in JavaScript renders as a blank card in the owner's file viewer —
the script is stripped, so build the visualization in static HTML/CSS or the owner sees
nothing.** The usage dashboard built every bar, fill and the app×country table
in `<script>` (innerHTML from data arrays). It rendered correctly in the
published Artifact — which executes JS — and in my headless screenshots, so it
looked done. But the Artifact link would not open for the owner (private artifact +
iPad), and the fallback — the same HTML sent as a file and rendered inline —
runs in a viewer that **strips `<script>`**. Result: the static text (headings,
paragraphs, the one CSS-only grey bar) showed, while every JS-generated bar,
every fill, and the whole heatmap came out blank. Two rules. **(1) If the owner will see it as a sent
file, author it with zero JavaScript — every bar a static `style="width:N%"`,
every cell an inline colour — and verify by rendering with JS DISABLED at ~400px
before sending; the Artifact executing JS proves nothing about the file the owner
opens. (2) A `<table>` for a cross-tab collapses on an iPad regardless of JS
(this is the no-grid rule in a rendered page, not just markdown) — use bars.**
The fix replaced the heatmap with a static requests-vs-real bar comparison and
dropped every script; it now renders the same in the Artifact, the file viewer,
and offline.
*(the hub, 2026-08-03.)*
