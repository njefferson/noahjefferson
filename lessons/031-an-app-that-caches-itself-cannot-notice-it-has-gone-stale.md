## 31 · An app that caches itself cannot notice it has gone stale

**Enforced by:** GATE hub:pwa-check.mjs — the new worker must wait, the reader must be told in the markup, the diagnostic must be able to read `caches.keys`, and the cache name must carry the release.

**The failure is invisible by construction.** Caching is precisely the business of
not asking the network, so a stale app looks perfectly fine — it is just old.
Nothing errors, nothing is missing, and the version stamp on screen is the old one
reporting itself perfectly accurately. There is no symptom. Nobody finds this by
using the app, which is why it survives indefinitely.

**And `skipWaiting` makes it actively worse, while being the default advice.**
Intersecting Parallels had it for twenty-two releases. A new worker takes over the
instant it installs — but the page that is OPEN has already loaded the previous
release's HTML and modules. `activate` then deletes the old cache, so anything
that page requests afterwards is served the NEW file. Old markup, new modules, no
reload, nothing said. The "helpful" setting produces a mixed app.

**The trade, stated plainly: an old app that works is a smaller problem than a
mixed one that does not.** So the new worker waits, and the page offers a reload.
Until the reader accepts, they have a consistent old app.

**Detecting it is not telling anyone.** The first version of this reported cache
state in the diagnostic and stopped there — which reads like a fix and is not.
Nobody opens a diagnostic to discover they are running last week's build. It needs
a standing indicator with both ways out (§3), saying what happens to their work.

**Never announce it to a newcomer.** On a first visit there is nothing being
replaced, and "a new version is ready" thirty seconds after arriving is nonsense.

**Test with a REAL second worker.** Serve a genuinely different `sw.js` and let
the browser's own update machinery run. A mocked registration proves the mock
works and nothing else.

*(Doctrine §7h. Intersecting Parallels 1.22.0, 2026-08-03.)*

---
