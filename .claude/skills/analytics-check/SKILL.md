---
name: analytics-check
description: >-
 Report who is using the owner's apps — totals, by-app, by-country, app x country,
 the real-user count, and the trend over time — from Cloudflare's edge, with no
 tracking added to any app. Use whenever the owner asks what the numbers look like,
 who is using the apps, how many users/people/visitors there are, whether
 anything changed, or for /analytics-check. Runs the cf-analytics `snapshot`
 command in the hub, appends one row to the running trend, and presents every
 view with the caveats that keep the number honest. Never a beacon; never
 claims requests are people.
---

# analytics-check

The recurring answer to "who is using my apps, and did it change." Everything it
needs already exists in this repo: `cf-analytics.mjs` and the
`.github/workflows/cf-analytics.yml` workflow. This skill drives them and keeps
the trend.

## The facts this rests on (verified 2026-08, see LESSONS.md §9)

- **The data is edge-counted, not a beacon.** Cloudflare already counts every
 request it serves. Nothing is injected into any app; Doctrine §1 holds.
- **`requestSource = eyeball` is the population the dashboard counts** — end
 users, not Worker subrequests or cache machinery. Always filter to it. Without
 it the totals are ~2x higher and meaningless as "usage".
- **`count` is already sampling-adjusted.** NEVER multiply by `sampleInterval`
 — an earlier version did and was 3–12x too high.
- **Requests ≠ visits ≠ people, and this is the trap the owner caught.** The by-app,
 by-country and heatmap numbers are eyeball **requests** — `requestSource=eyeball`
 strips Cloudflare's own worker/cache traffic but NOT crawlers, monitors and
 scrapers, which are eyeball-class too. So a country can read thousands of
 requests and have **zero** real users (Korea, Ireland, Singapore did). "Real
 users" is distinct **mobile + tablet** IPs (the least-fakeable), with a softer
 ceiling that adds human-shaped desktop. `snapshot` now emits **real users by
 country and by app** (the `REAL USERS ...` sections and the `REAL USERS (CSV)`
 block) alongside the request views. **Lead with the real-user numbers; the
 request numbers are the machine layer, shown second and always labelled.**
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
(Doctrine §1). "Distinct phones+tablets as a band + a rough network-spread number"
is the floor of what's knowable, and it is the honest, no-tracking answer anyway.

## Known scanner IPs to exclude

```
185.177.72.22
```

## Steps

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
 as one line to `docs/usage-trend.csv` in this repo. If the file does not
 exist, create it with this header first:
 ```
 date_end,days,total_requests,real_floor,real_ceiling,top_app,top_country
 ```
 Do not append a duplicate row for a `date_end` already present (a re-run of
 the same window overwrites, not stacks). Commit and push to `main` with a
 one-line message. This is the only write the skill makes.

5. **Present to the owner, real users FIRST, machine layer SECOND:**
 - **Real users** — the band (`~floor` phones+tablets to trust, `~ceiling`
 incl. human-shaped desktop).
 - **Real users by country** — descending; these sum to ~floor. Call out any
 inversion (a low-request country with real people, e.g. Sweden) — it's the
 clearest proof the filter matters.
 - **Real users by app** — descending; this is the true "which apps get used."
 Name the apps that had big request counts but few real devices.
 - **The machine layer** (labelled, second): total requests, and where they
 concentrate — the single-country request blocks that turned out to be ~0
 real users (crawlers). App × country heatmap lives here.
 - **Trend** — the last ~8 rows of `docs/usage-trend.csv`; week-over-week change
 on `real_floor` first, `total_requests` second. One week is noise, the slope
 is signal — and the floor is the slope that matters.

6. **Always attach the caveats** (short): two layers never conflated (real users
 vs requests); eyeball ≠ human (AI crawlers are eyeball-class); mobile/tablet
 is the trusted floor; single-digit country counts are sampling-noisy — trust
 the shape; read the trend not a single delta.

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
offline. **Avoid a `<table>` for the cross-tab** — tables collapse for him;
use bars. Verify by rendering with JS DISABLED at ~400px width before sending.

**Deliver it two ways**: publish the Artifact (a link) AND send the standalone
file via the file tool with inline render — the link needs him signed in and can
fail to open on the iPad, the file always renders. Do not build a standing app or
put the analytics token in a browser: the token is a GitHub Actions secret and
must stay server-side.

## What NOT to do

- Do not enable Cloudflare Web Analytics or any beacon — that is the §1
 violation this whole approach exists to avoid.
- Do not present the account-wide (all-source) totals as usage; always eyeball.
- Do not present **request** counts as **users**. Requests are the machine layer;
 lead with distinct mobile+tablet devices. The owner caught this once — a by-country
 view in the thousands that was mostly crawlers. Do not make him catch it twice.
- Do not multiply by `sampleInterval`.
- Do not call requests "visits" or "people".
- Do not print raw client IPs into any public place — the workflow log is
 world-readable; the tool already keeps IPs out of `snapshot`/`people`/`humans`
 output by design.
