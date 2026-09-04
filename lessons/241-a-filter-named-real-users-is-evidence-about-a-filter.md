## 241 · A filter is named for what it was built to remove, and the name then argues for it — 150 "real users" against about five people

**Enforced by:** CHECKLIST divide-requests-by-devices — before any distinct-IP
count is reported as people, divide the requests by the devices. A rendered page
is a document plus its stylesheet, scripts, icons and images, so a reader leaves
tens of requests; a ratio near one is a distributed crawler wearing a phone's
user-agent string. · CHECKLIST anchor-a-usage-number-to-something-known — never
quote a headcount that has not been compared against a fact from outside the
data (an invite list, a login count, a known reader). One anchored app sizes the
error for every other app in the same report. · CHECKLIST
say-what-the-filter-removed-never-what-it-is-called — `requestSource=eyeball`
removes Cloudflare's own worker and cache traffic and nothing else;
`clientDeviceType` removes desktop user-agent strings and nothing else. Neither
removes machines. · JUDGEMENT — development traffic, agent sessions and the
project's own devices are indistinguishable from readers at the edge and cannot
be subtracted without something identifying them, so every number here is an
upper bound; how much of it to believe is not a computation.

**Smell:** a metric whose name contains the conclusion — "real users", "humans",
"visitors". Also: a caveat recorded in the same file that then presents the
number as the trustworthy one. Also: a country with more devices than it has
requests-per-device to justify them.

**The hub, 2026-09-04.** A weekly snapshot for the seven days ending 2026-09-03
reported 22,922 eyeball requests and **150 distinct mobile/tablet IPs as the
number to trust**, with 526 as a softer ceiling that added human-shaped desktop.
It was presented first, broken down by country and by app, and written up as the
honest layer with the request counts labelled beneath it as machines.

Measured against what is actually known: the one invite-only app in the family
had **three** users. One other app had one confirmed reader from outside the
project. Everything else resolved to three devices in routine use — a phone, a
tablet and a desktop — plus agent sessions and development traffic against apps
still being built. **About five people. The trusted figure overstated it by
roughly thirty times.**

Three independent causes, each sufficient alone:

1. **One person is many IPs in a week.** This was written in the same file, four
   paragraphs above the instruction to lead with the number: phone IPs change on
   wifi↔cellular switching, CGNAT reassignment and session teardown, and there is
   no interval to collapse them on. That paragraph concluded the count was a
   *band* rather than a headcount — and then the bottom of the band was reported
   as the count. The caveat was recorded and not applied.
2. **A mobile user agent is a string.** "Distinct phones+tablets (the
   least-fakeable)" was an assumption that had never been measured. Scrapers send
   iPhone and Android user agents as a matter of routine, so the device filter
   selects a *claim about hardware*, not hardware.
3. **Traffic from the development side is ordinary eyeball traffic.** Building,
   testing and agent sessions against apps under construction arrive at the edge
   indistinguishable from a reader, and an app that deliberately has no accounts
   has nothing to subtract them by.

**The tell was in the data and was read backwards.** One country showed four
"real devices" against five requests for the entire week — about 1.25 requests
each. A device that makes one request never rendered anything. That single
division separates a few readers from a distributed crawler, it was never
computed, and the shape was instead written up as *the clearest proof the filter
was working* — because the file naming the metric had named that exact pattern
in advance as the thing to call out. A prediction that tells you what a signal
will mean also tells you not to check it.

**The general form.** A filter earns its name from the population it was built
to exclude, and afterwards the name does the arguing. `requestSource=eyeball`
excludes Cloudflare's own machinery and was reported as separating people from
machines. The device filter excludes desktop user-agent strings and was reported
as isolating real users. Neither ever claimed what its label implied, and no step
between the query and the reader re-asked what had actually been removed. **A
number called "real users" is not evidence about users; it is evidence about a
filter.**

And the check that would have caught it costs one question. For at least one app,
somebody already knows the answer — an invite list, a login count, a friend who
said so. Get that number before reporting any of the others, because it is the
only thing in the report that can be wrong in a way you can see.
