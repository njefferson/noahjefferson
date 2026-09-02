## 21. A cache that only ever serves its own release can never be replaced

**Enforced by:** CHECKLIST cache-escape-hatch — every cache ships the path by which a later release replaces it, and that path is exercised from a genuinely stale client, not reasoned about.

An iPad in the field sat on v0.4.1 through two successful deploys of 0.4.2 and
0.4.3. The deploys were green, the Pages step really ran, and the device was
simply unreachable. **Waiting would never have fixed it** — this was not a propagation
delay, a CDN cache, or iOS being slow with a PWA. It was a closed loop:

- The service worker took its version from its registration URL (`/sw.js?v=…`)
 so the version was typed in exactly one place. **Consequence: `sw.js` was
 byte-identical between releases.**
- A browser replaces a service worker by re-fetching the registered script and
 **comparing bytes.** Identical bytes, no update, forever.
- The only code that could register the new URL was the app's own entry module —
 which the running worker served, cache-first, from its own release's cache.

Old worker → old entry module → re-registers old worker. Nothing about that
expires.

**The cruellest part is that a correct fix sealed it.** An earlier release had a
real bug — `caches.match` searches every cache on the origin, so a fresh
`index.html` arrived mixed with old modules, and the page ran old code under a
new stamp. Scoping lookups to the running worker's own cache was the right fix,
and it closed the last crack new code had been getting through. **When you make
a cache stricter, ask what used to leak through it that you needed.**

Three things worth carrying:

- **Find the one request that still escapes.** Here it was navigation, which was
 network-first all along, so `index.html` reached the device on every load. A
 new file referenced from it cannot be in any old cache, so it is fetched from
 the network — that file is the repair channel. Every offline-capable app has
 one such crack; know which it is BEFORE you need it.
- **Single-source-the-version is right, and it still needs a second signal.**
 §7b is not wrong — a hand-typed second copy does drift. But a version that
 lives only in a query string means the artefact the platform checks never
 changes. Keep the single source, and add something that compares the running
 release against the served one at boot.
- **Self-healing code that can force a reload is dangerous in the false-positive
 direction.** A detector that fires when it should not is a reload loop, which
 is worse than the stale build it fixes. Make the decision a pure function and
 test the DO-NOTHING cases harder than the acting one: first visit, current
 version, an update part-way through installing, another app's caches on the
 same origin, and the version unreadable because you are offline.

*(fauxplane, 2026-08-02 — two releases invisible on the target device; found by
checking what the server served versus what the device's own diagnostics report
said, which took one paste and no screenshots.)*
