## 12 · The network is not down. You tried one host.

**Enforced by:** CHECKLIST probe-order — run the proxy status and the alternate hosts BEFORE reporting any block, and quote the status codes per host.

**The single most repeated failure across these apps, and the owner has watched
it happen every day.** A session makes one request, it fails, and the session
reports that it cannot reach the network — then hands the owner the work. It is
nearly always false. Doctrine §15b is the rule that came out of it; this is what
it cost.

**The measurement, taken the day the rule was written.** Three datasets were
recorded in a repo's NOTES.md as unobtainable because "the egress proxy denies
the hosts". A later session repeated that to the owner as three assigned tasks.
The owner pushed back — not on the technical claim, but on being
handed a vague task — which is the only reason anybody re-probed. Results, in
under a minute:

- `davidmegginson.github.io` — denied, as recorded. **The same repository on
 `raw.githubusercontent.com` returned 200.** Different allowlist entry.
- `ncei.noaa.gov`, `earth-info.nga.mil` — denied. **Both datasets were sitting
 in npm packages, and the npm registry is on the proxy's own allowlist.**
- One `raw.githubusercontent.com` URL returned **404**, which had been read as
 another failure. A 404 means the host answered. The path was wrong.

Two of the three were fetched, verified against the publisher's own test values,
and committed the same hour. The owner's task list went from three items to
zero. And the verification found **three real bugs in the code that consumed
them** — a magnetic model that was three to five degrees wrong — which would
have shipped precisely because the data was believed unobtainable and the code
was therefore never checked against reality. **Declaring a block does not just
cost you the data. It costs you every test that data would have made possible.**

**The diagnostic that gets skipped every time.** The proxy will tell you what it
allows: `curl -sS "$HTTPS_PROXY/__agentproxy/status"` prints the allowlist and
the recent denials with reasons. It costs one command and it is almost never the
first thing tried, or the tenth.

**Read the failure mode; they are not interchangeable.** `000` or a rejected
CONNECT is a policy denial of THAT HOST. Any HTTP status at all — 403, 404, 200
— means the host answered and the network is fine. Treating a 404 as
"unreachable" is the specific mistake that turned a wrong URL into a false
blocker.

**Where the data actually lives, in the order worth trying:** package registries
(npm, PyPI, crates, the Go proxy are commonly allowlisted by name, and a
startling amount of public reference data is packaged — coefficient tables,
geodata, dictionaries, conformance suites); then a different host for the same
bytes (git host versus pages host, CDN versus origin, mirror versus canonical);
then the origin.

**And keep the data separate from its terms.** They are different hosts and
different questions. In this same episode one dataset stayed unbuilt afterwards —
correctly — because its DATA was reachable but its published TERMS page was not,
which is a §15.1 licensing question and not a connectivity one. Saying "blocked"
for both would have been wrong in two different directions at once.

**The rule, plainly: a failed request is a fact about one host at one moment.
Never about the network, never about the data, and never a reason to make it the
owner's problem.** Inherited blocks get re-probed; "a previous session said so"
is not evidence.
*(Every app, every day, until 2026-08-02. The correction was blunt: seeing one
failure and assuming the whole network is unreachable, without ever trying the
right route before the wrong one, is the recurring failure this lesson names.)*

**A test suite whose inputs all share a timestamp cannot find a bug about
differing ages — and a filter test that never moves cannot find a bug about
movement.** fauxplane shipped to production with 84 passing unit tests, a green
accessibility gate over eighteen combinations, and ten planted faults all
caught. Opening it on a phone surfaced four real defects in about a
minute. Every one had the same shape: **the tests used inputs a real device
never produces.**

- **The altimeter could never display a number at all.** A derived value was
 stamped with its OLDEST input's timestamp and then aged against its OWN, much
 shorter window. A weather observation is always several minutes old; the
 altitude window was sixty seconds. So it expired the instant it was computed,
 every time, for ever. Every unit test passed because each one built its inputs
 at the same instant — the bug lived in the *interaction* between the
 derivation and the ageing, and only inputs of genuinely different ages
 expose it. The screen read "no update for 806s", 806 seconds being precisely
 the age of the observation it came from.
- **Fifteen attitude-filter tests passed while the gyroscope's roll axis was
 integrated with the wrong sign.** All fifteen fed a ZERO rotation rate. The
 gyro therefore contributed nothing, the accelerometer alone was correct, and a
 sign error in the integration was invisible in principle rather than by bad
 luck. On a real device the two halves of the filter fought continuously and
 the horizon never converged.
- **A convergence check that measured hand-shake.** It compared the filter
 against the INSTANTANEOUS accelerometer solution, which in a hand jitters
 several degrees continuously, so it never settled. Worth recording that the
 first fix was also wrong in a new way — smoothing the *reference* made it lag
 a turning device, scoring a perfectly-tracking filter as 3.8 degrees out. The
 answer was the smoothed *signed* residual: jitter is zero-mean and cancels, a
 real misalignment is a bias and does not. Three versions, two of them
 measuring something adjacent to the claim; this is §7g's shape in a filter
 rather than in a gate.
- **A read of state taken before that state was published.** The first-GPS-fix
 handler ran inside the geolocation callback, before the publish loop had
 written the fix down, so the code that needed a position correctly concluded
 there wasn't one — and then waited fifteen minutes for its next scheduled try.

**What to do about it, cheaply.** When a value's correctness depends on a
dimension — time, motion, order, scale — put a test on the AXIS, not just at a
point. Give inputs different ages. Feed a rotation, not a stillness. Publish
between the write and the read. The question to ask of any green suite is not
"did I test this function" but "does any test differ from the others along the
dimension the code actually varies in".

**And the corollary that made this cheap rather than expensive:** every one of
the four was found in a single on-device pass — once, for a minute. No amount
of the sandbox testing that preceded it would have found them, because the
sandbox has no hands, no compass and no clock skew. Ship to a real device
early; it is a better fuzzer than anything available in here.
*(fauxplane, 2026-08-02 — 0.2.0 to 0.2.1. Each of the four is now pinned by a
test that was watched to fail first.)*
