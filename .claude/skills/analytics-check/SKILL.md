---
name: analytics-check
description: >-
 Report what is hitting the owner's apps and from where — traffic totals, by-app,
 by-country, app x country, crawler and scanner activity, a device upper bound,
 and the trend — from Cloudflare's edge, with no tracking added to any app. Use
 whenever the owner asks what the numbers look like, what is hitting the apps,
 whether anything changed or looks anomalous, or for /analytics-check. This
 measures TRAFFIC, not people: it cannot answer "how many users do I have" and
 must say so rather than answering anyway. Anchors every run against
 jefferson-line, whose invite list is a known headcount, and reports the
 overstatement factor that comes back. Never a beacon; never claims requests are
 people; never claims DEVICES are people either — the device count is an upper
 bound that once read 150 against about five.
---

# analytics-check

**What is hitting these apps, from where, and did the shape change.** Everything
it needs already exists in this repo: `cf-analytics.mjs` and the
`.github/workflows/cf-analytics.yml` workflow. This skill drives them, anchors
them against the one app with a known headcount, and keeps the trend.

**This is a traffic instrument, and it was re-scoped to be one on 2026-09-04
after being read as a usage instrument and being wrong by ~30x** (LESSONS §241).
It is good at: which surfaces are being touched at all, where from, what is
crawling them, whether a scanner has appeared, and whether any of that moved. It
is structurally incapable of counting people, because these apps have no accounts
by design (Doctrine §1). **When the question is "how many people use my apps",
the answer is the invite list and what the owner knows — not this tool.** Say
that plainly; do not produce a number to fill the gap.

## The facts this rests on (verified 2026-08, see LESSONS.md §9)

- **The data is edge-counted, not a beacon.** Cloudflare already counts every
 request it serves. Nothing is injected into any app; Doctrine §1 holds.
- **`requestSource = eyeball` is the population the dashboard counts** — end
 users, not Worker subrequests or cache machinery. Always filter to it. Without
 it the totals are ~2x higher and meaningless as "usage".
- **`count` is already sampling-adjusted.** NEVER multiply by `sampleInterval`
 — an earlier version did and was 3–12x too high.
- **Requests ≠ visits ≠ people.** The by-app, by-country and heatmap numbers are
 eyeball **requests** — `requestSource=eyeball` strips Cloudflare's own
 worker/cache traffic but NOT crawlers, monitors and scrapers, which are
 eyeball-class too. So a country can read thousands of requests and have zero
 readers behind them (Korea, Ireland, Singapore did). `snapshot` emits a device
 view alongside the request views — the `REAL USERS ...` sections and the
 `REAL USERS (CSV)` block — which is distinct **mobile + tablet** IPs, with a
 softer bound that adds human-shaped desktop.
- **AND THE DEVICE COUNT IS NOT PEOPLE EITHER — measured 2026-09-04, wrong by
 ~30x.** The sections above are named `REAL USERS` in the tool's output and that
 name is doing the arguing. Week ending 2026-09-03 it read **150**; the actual
 population was **about five** — three on the one invite-only app, one confirmed
 reader elsewhere, and otherwise a phone, a tablet and a desktop in routine use
 plus agent sessions and development traffic. Three reasons, each sufficient
 alone: one person throws off many IPs in a week (see the ceiling section below,
 which says exactly this and was not applied); a mobile user agent is a *string*
 and scrapers send one routinely, so the filter selects a claim about hardware
 rather than hardware; and building, testing and agent traffic is
 indistinguishable from a reader at an edge with no accounts to key on.
 **So: the device count is an UPPER BOUND, not a floor. Never present it as a
 headcount, and never lead with it as the honest layer.** (LESSONS §241.)
- **The one division that separates readers from crawlers: requests ÷ devices.**
 A rendered page is a document plus stylesheet, scripts, icons and images, so a
 real reader leaves tens of requests. Four "devices" against five requests for a
 whole week — 1.25 each — is a distributed crawler, and on 2026-09-04 that exact
 shape was written up as the clearest proof the filter worked. Compute the ratio
 before quoting any device number.
- **Anchor to something known before reporting anything.** For at least one app
 somebody already knows the real answer — an invite list, a login count, a friend
 who said so. Ask for that first; it is the only figure in the report that can be
 checked, and it sizes the error for all the others.
- **Exclude known scanners.** `185.177.72.22` is a secrets scanner that inflated
 one app. Keep the exclude list below current; if a new flooder appears, find
 it with the `top-ips` command and add its IP.
- **AI crawlers are now the largest bot category** hitting the apps — real, not
 a threat, and excluded from any human count by Cloudflare's `verifiedBotCategory`.

## The ceiling of what's knowable — do not chase these again (verified 2026-08-03)

The owner asked, in order, for by-state, then how phones change IP, then MAC tracking.
The answers are settled; re-deriving them wastes a session.

- **Geography is country-only.** `httpRequestsAdaptiveGroups` has 102 dimensions but
 only two are geographic — `clientCountryName` and `coloCode` (serving data-centre)
 — and on this plan **`coloCode` AND `clientASNDescription` (network owner) are
 query-gated** ("account does not have access to the field"). So there is no
 by-state / by-metro / by-city / by-colo view, and no ISP labels. `clientIP` *is*
 available, so the one sub-country signal is IP-block clustering — distinct
 mobile/tablet IPs and distinct **/24 blocks** (the `region` command) — which
 speaks to "how many separate networks," never to where or who.
- **Unlocking colo/ASN = Cloudflare Enterprise**, custom-priced (thousands/mo, talk
 to sales). Pro (~$20/mo) and Business (~$200/mo) do **not** open the adaptive
 geo/ASN fields. And the apps are `*.pages.dev` — plan tiers attach to zones/custom
 domains, not free Pages projects — so it isn't even a clean upgrade. **Not worth
 it for free hobby apps; country + /24 count is the sensible ceiling.** (Confirm the
 exact field↔plan boundary with Cloudflare if it ever matters — it shifts.)
- **Distinct IPs overcount people and cannot be de-duplicated by time.** Phone public
 IPs change on network events, not a clock: CGNAT reassignment, session teardown
 (signal loss, airplane mode, reboot, idle), crossing to a different carrier
 gateway region, and above all **wifi↔cellular switching**. Local tower-to-tower
 handovers usually *keep* the IP. So one phone throws off many IPs across many /24s
 in a week — there is no interval to collapse them on. This is why the real-user
 count is a **band**, not a headcount.
- **MAC address is untrackable from the web, full stop.** It is Layer-2, stripped at
 the first router hop, never in HTTP or anything Cloudflare sees; modern phones also
 randomize it per network. Do not propose it.

The through-line: the web hands out no stable per-person identifier by design. An
exact headcount would need logins/accounts, which these apps deliberately refuse
(Doctrine §1). So the honest answer is an **upper bound plus a shape** — at most
N devices touched these surfaces, concentrated here — and the true figure sits
far below it, unknowably far without a fact from outside the data. That is not a
shortfall to apologise for; it is what no-tracking costs, and it is the right
trade. What is NOT honest is quoting the bound as the count.

## The control case: jefferson-line

**jefferson-line is invite-only, so its real headcount is KNOWN.** That makes it
the one place in the whole dataset where the tool's answer can be marked against
the truth — and the factor that comes back is the only honest guide to how far
off every other app's number is.

The first measurement, week ending 2026-09-03: the tool reported **29 devices**
for `jefferson-line.pages.dev`; the invite list held **3**. **A factor of ~9.7 on
an app with no crawl surface at all** — nobody can link to an invite-only app, so
that entire gap is IP churn, agent sessions and development traffic, with no
crawler component to blame it on. Every other app carries that same inflation
*plus* whatever crawls it.

Each run: ask for the current invite count (a one-word answer), record it beside
the reported device count, and quote the resulting factor when presenting
anything else. **If the count is not available, leave the control columns blank
and say the run is unanchored** — never carry the previous week's factor forward
as if it were measured.

Why this beats any filter improvement: the ratio check added in the same commit
would have caught Sweden (4 devices, 5 requests) and would NOT have caught China
(19 devices, ~45 requests each, and no real readers). No test inside the data
separates a crawler with a good session shape from a person. Only the control
does.

## Known scanner IPs to exclude

```
185.177.72.22
```

## Steps

0. **Anchor first.** Ask for jefferson-line's current invite count before
 reporting anything. It is one word, it is the only true number in the run, and
 the lesson this skill was rewritten for is that no amount of care inside the
 data substitutes for it.

1. **Dispatch the snapshot.** Run the `cf-analytics.yml` workflow (repo
 `njefferson/noahjefferson`, ref `main`) with:
 `command=snapshot`, `days=7` (or the window the owner asked for), and
 `exclude_ip` = the comma-joined known-scanner list above.
 Use the GitHub Actions MCP tools (`actions_run_trigger` → `run_workflow`).

2. **Wait ~60s, then read the newest completed run's job log** (`actions_list`
 → `list_workflow_runs`, then `get_job_logs`). The `list_workflow_runs`
 result can be large — if it overflows, extract the newest run id with a
 short python slice, then fetch that job's log.

3. **Extract from the log:**
 - the `TREND_ROW,...` line (one line);
 - the `== REAL USERS BY COUNTRY ==`, `== REAL USERS BY APP ==` sections and
 the `== REAL USERS (CSV) ==` block — **these lead the presentation**;
 - the `== TOTALS ==` line (requests + the real-user band);
 - the request views — `== BY APP (... machines included) ==`,
 `== BY COUNTRY (... machines included) ==`, `== APP x COUNTRY (CSV ...) ==`
 — these are the **machine layer**, shown second.

4. **Append to the trend.** Take everything **after** `TREND_ROW,` and append it
 to `docs/usage-trend.csv` in this repo, then add the two control fields. The
 header is:
 ```
 date_end,days,total_requests,device_upper_bound,device_upper_bound_loose,top_app_by_requests,top_country,control_devices,control_known
 ```
 `TREND_ROW` supplies the first seven fields in that order. **`control_devices`
 is what the run reported for `jefferson-line.pages.dev` in the REAL USERS (CSV)
 block, and `control_known` is the invite count from step 0** — both blank if the
 app was not live that week or the count was not given. The columns were renamed
 from `real_floor`/`real_ceiling`/`top_app` on 2026-09-04; the recorded values
 never changed, only the labels, which were the lie in file form.
 Do not append a duplicate row for a `date_end` already present (a re-run of
 the same window overwrites, not stacks). Commit and push to `main` with a
 one-line message. This is the only write the skill makes.

5. **Present it as traffic and a shape, never as a headcount:**
 - **Open with the control.** jefferson-line reported N devices against an
 invite list of M — a factor of N/M. State it first and let it caveat
 everything below, because it is the only claim in the report that was checked
 against the world.
 - **Devices** — stated as an upper bound in those words: "at most ~N
 phones/tablets, and the real figure is far below it." Give the
 requests-per-device ratio beside it; under ~10 the population is mostly
 machines.
 - **By country and by app** — descending, useful as SHAPE (which surfaces get
 touched at all, from where) and worthless as counts. Say so in the same
 breath. A low-request country with several devices is a distributed crawler,
 not an inversion worth celebrating — check the ratio before calling it people.
 - **The request layer** (labelled): totals, and where they concentrate — the
 single-country blocks that are plainly crawlers. App × country heatmap here.
 - **Trend** — the last ~8 rows of `docs/usage-trend.csv`. Read the SLOPE, and
 say plainly that every row is an upper bound measured the same way, so the
 direction is meaningful and the level is not. New surfaces going live raise it
 without anyone new arriving; say which ones are new.

6. **Always attach the caveats** (short): the device count is an upper bound and
 has been ~30x over (LESSONS §241); eyeball ≠ human (AI crawlers are
 eyeball-class, and they send mobile user agents); one person is many IPs in a
 week; development and agent traffic is in every number and cannot be
 subtracted; single-digit country counts are sampling-noisy — trust the shape;
 read the trend, not a single delta.

7. **If a run fails,** report the failure and the error line from the log. Never
 invent numbers to fill the gap — a missing week is an honest blank in the
 trend.

## Optional: a dashboard

If the owner wants something to look at rather than read, render a small dashboard —
real users by country and by app, the requests-vs-real comparison, the trend.
Load the `dataviz` and `artifact-design` skills first.

**Build it with ZERO JavaScript — every bar a static `style="width:N%"`, every
heatmap cell an inline colour, no `<script>` at all.** the owner reads on an iPad, and
the file viewer that shows a sent HTML file **strips scripts**: a chart drawn in
JS renders as a blank card with floating numbers (happened 2026-08-03, LESSONS
§9). Static HTML/CSS renders identically in the Artifact, the file viewer, and
offline. **Avoid a `<table>` for the cross-tab** — tables collapse on the target device;
use bars. Verify by rendering with JS DISABLED at ~400px width before sending.

**Deliver it two ways**: publish the Artifact (a link) AND send the standalone
file via the file tool with inline render — the link needs a signed-in reader and can
fail to open on the iPad, the file always renders. Do not build a standing app or
put the analytics token in a browser: the token is a GitHub Actions secret and
must stay server-side.

## What NOT to do

- Do not enable Cloudflare Web Analytics or any beacon — that is the §1
 violation this whole approach exists to avoid.
- Do not present the account-wide (all-source) totals as usage; always eyeball.
- Do not present **request** counts as **users**. A by-country view in the
 thousands that was mostly crawlers was caught once already.
- **Do not present DEVICE counts as users either** — that is the same mistake one
 filter further along, and it shipped on 2026-09-04 reading 150 against about
 five (LESSONS §241). The device sections are an upper bound. If a number is
 going to be called people, it has to have been anchored to something known
 outside the data first.
- Do not repeat the tool's own `REAL USERS` wording back as a claim. It is a
 column heading, not a finding.
- Do not multiply by `sampleInterval`.
- Do not call requests "visits" or "people".
- Do not print raw client IPs into any public place — the workflow log is
 world-readable; the tool already keeps IPs out of `snapshot`/`people`/`humans`
 output by design.
