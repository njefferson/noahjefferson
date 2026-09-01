## 201 · A relay that counts a refusal as an answer turns a blocked container into an agency outage

**Enforced by:** JUDGEMENT — only the caller knows which statuses mean "the service replied" and which mean "something in front of the service replied instead". · CHECKLIST relay-status — any code that proxies a request on behalf of something else must decide, explicitly, which HTTP statuses count as an answer; 403 and 407 from a gateway are not answers and must be named as refusals, by host. · CHECKLIST proxy-at-startup — a Node tool that fetches must carry the `NODE_USE_ENV_PROXY` re-exec (§173); a suite whose whole purpose is to talk to live services is the one where its absence is hardest to see.

**Smell:** `if (res.ok)` or no status check at all in a relay, forwarder, or
retry wrapper. Also: a run in which every independent upstream fails at once.
Also: a tool that fetches, in a repo where four other tools already carry the
proxy re-exec.

An end-to-end suite drove a browser against a local copy of the app and relayed
the browser's outbound requests through Node, so nothing was stubbed. It ran and
reported twenty-seven failures: no gauge answered, no tide curve drew, no survey
directory enumerated, the ribbon plotted nothing.

Read as findings, that is four independent public agencies — a federal water
service, a federal tide service and two state ones — all down in the same
minute. That does not happen, and **the implausibility was the only clue**,
because every failure message was in the app's own honest register: *"10 gauges
on this river did not answer, so there is no flow figure — not that the river
has none."* The app was telling the truth about what it had received. It had
received refusals.

Two defects, stacked, and each hid the other.

**The relay bypassed the proxy.** Node's own `fetch` ignores `HTTPS_PROXY`
unless `NODE_USE_ENV_PROXY` is set, and reads it at startup, so the re-exec in
§173 is the fix. Four bake tools in the same repo already carried those three
lines. The suite did not — and it is the hardest place to notice, because a
suite built to detect outages producing outage messages looks like it is working.

**And the relay counted the refusal as a response.** It fetched, got a body,
incremented its success counter and fulfilled the browser's request with it. A
403 from a gateway has a status and a body, so nothing threw, nothing was
logged, and the run's own summary line said it had relayed live responses from
four hosts. It had relayed four hosts' worth of "no".

**The general shape.** Three states look identical from inside a client: the
service said no, the network said no, and the request never left (§188, §173).
A relay sits exactly where those three can still be told apart — it is the last
code that sees the status line — and a relay that does not look is the component
that destroys the distinction for everything downstream. The fix is not a
cleverer retry. It is to name the refusal, by host, at the point of refusal and
again in the summary, so a red run is a question somebody can act on in one step
rather than an afternoon of disbelieving four agencies.

**What it cost.** Nothing shipped wrong. What it cost was the trust in the
suite: a session reading that output has to either disbelieve twenty-seven
checks or believe an impossible coincidence, and the honest thing — treating a
blocked host as a question rather than a finding — is only available to somebody
who has already worked out that the hosts were blocked.
