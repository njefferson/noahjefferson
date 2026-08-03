---
name: analytics-check
description: >-
  Report who is using Noah's apps — totals, by-app, by-country, app x country,
  the real-user count, and the trend over time — from Cloudflare's edge, with no
  tracking added to any app. Use whenever Noah asks what the numbers look like,
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
- **Requests ≠ visits ≠ people.** One page load pulls many requests. "Real
  users" is distinct **mobile + tablet** IPs (the least-fakeable), with a softer
  ceiling that adds human-shaped desktop.
- **Exclude known scanners.** `185.177.72.22` is a secrets scanner that inflated
  one app. Keep the exclude list below current; if a new flooder appears, find
  it with the `top-ips` command and add its IP.
- **AI crawlers are now the largest bot category** hitting the apps — real, not
  a threat, and excluded from any human count by Cloudflare's `verifiedBotCategory`.

## Known scanner IPs to exclude

```
185.177.72.22
```

## Steps

1. **Dispatch the snapshot.** Run the `cf-analytics.yml` workflow (repo
   `njefferson/noahjefferson`, ref `main`) with:
   `command=snapshot`, `days=7` (or the window Noah asked for), and
   `exclude_ip` = the comma-joined known-scanner list above.
   Use the GitHub Actions MCP tools (`actions_run_trigger` → `run_workflow`).

2. **Wait ~60s, then read the newest completed run's job log** (`actions_list`
   → `list_workflow_runs`, then `get_job_logs`). The `list_workflow_runs`
   result can be large — if it overflows, extract the newest run id with a
   short python slice, then fetch that job's log.

3. **Extract three things from the log:**
   - the `TREND_ROW,...` line (one line);
   - the `== APP x COUNTRY (CSV) ==` block;
   - the `== TOTALS ==`, `== BY APP ==`, `== BY COUNTRY ==` sections.

4. **Append to the trend.** Take everything **after** `TREND_ROW,` and append it
   as one line to `docs/usage-trend.csv` in this repo. If the file does not
   exist, create it with this header first:
   ```
   date_end,days,total_requests,real_floor,real_ceiling,top_app,top_country
   ```
   Do not append a duplicate row for a `date_end` already present (a re-run of
   the same window overwrites, not stacks). Commit and push to `main` with a
   one-line message. This is the only write the skill makes.

5. **Present to Noah, in this order:**
   - **Totals** — eyeball requests, and the real-user band (`~floor` phones+tablets
     you can trust, `~ceiling` including human-shaped desktop).
   - **By app** — every app, descending.
   - **By country** — top ~15, descending.
   - **App × country** — the cross-tab (a compact table of the top apps ×
     top countries, or offer the full CSV).
   - **Trend** — the last ~8 rows of `docs/usage-trend.csv`, with the
     week-over-week change on `total_requests` and `real_floor`. This is the
     point of the whole thing: one week is noise, the slope is signal.

6. **Always attach the caveats** (short): eyeball-only and scanner-excluded;
   requests ≠ people; mobile/tablet is the trusted floor and desktop-Chrome is
   the uncertain band; sampled data, so read the trend not a single delta.

7. **If a run fails,** report the failure and the error line from the log. Never
   invent numbers to fill the gap — a missing week is an honest blank in the
   trend.

## Optional: a dashboard

If Noah wants something to look at rather than read, render an **Artifact** from
the same data — a small dashboard with the totals, the by-app bars, a country
list, and the trend line. Load the `dataviz` and `artifact-design` skills first.
Do not build a standing app or put the analytics token in a browser: the token
is a GitHub Actions secret and must stay server-side. An on-demand Artifact is
the app-feel without the infrastructure or the credential surface.

## What NOT to do

- Do not enable Cloudflare Web Analytics or any beacon — that is the §1
  violation this whole approach exists to avoid.
- Do not present the account-wide (all-source) totals as usage; always eyeball.
- Do not multiply by `sampleInterval`.
- Do not call requests "visits" or "people".
- Do not print raw client IPs into any public place — the workflow log is
  world-readable; the tool already keeps IPs out of `snapshot`/`people`/`humans`
  output by design.
