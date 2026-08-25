## 70 · A version number is a DELIVERY MECHANISM in a cached app, and a release that forgets to bump it publishes something no existing reader can receive

**Enforced by:** GATE Quietkeep:tools/release-check.mjs — every file that reaches a reader through the service-worker cache must be unchanged since the commit that introduced the current head triplet. It measures the WORKING TREE against that commit, so it cannot be satisfied by two stale numbers agreeing with each other. Run it wherever a service worker caches a shell; it needs full history, so the checkout that runs it takes `fetch-depth: 0` and the gate fails loudly rather than skipping on a shallow clone.

A commit announced itself as `1.36.3 (CAPABILITY)`. It added a user-visible line
to the app's main screen, the clock logic behind it, and its markup. It added no
changelog entry and did not touch `sw.js`.

**Both omissions had one cause, and it is the part worth carrying to other
repos.** Under this taxonomy a CAPABILITY release from `1.36.2` is `1.37.0`, not
`1.36.3` — so the changelog gate *would have refused that entry*. The response to
the refusal was to skip the entry rather than fix the number. **A gate that
refuses a malformed record invites the record to be omitted instead**, and
omission is the one state most gates read as fine.

**The consequence is not documentation, it is delivery.** The bundle and the
shell are precached entries served cache-first from a cache named for the
version. A browser installs a new worker only when the BYTES at `sw.js` change.
Unchanged bytes mean no new worker, no new cache, and no "a new version is
ready" — so every already-installed reader keeps being served the previous
bundle indefinitely, while the edge holds the new one. **The deploy went green.
It published something that could not arrive.**

This is the sibling of the four-releases-never-deployed lesson (§53) and the
opposite failure: there, the deploy failed and was reported as shipped; here the
deploy *succeeded* at publishing a build no existing reader can reach. Both look
identical from the push output, and both look identical from the deploy log.

**And every gate was green, correctly.** The changelog gate compares the
changelog head against the cache name. Both said `1.36.2`. They agreed — about a
number that had stopped moving. **A consistency check between two values cannot
notice that both have stood still**, which is why the new gate measures against
the working tree instead of against another number.

**The general shape.** In any app that caches its own shell, the version string
is not metadata about the release, it is the mechanism BY WHICH the release
reaches anybody. Treat "did the shipped surface change without the version
changing" as a first-class gate wherever a service worker exists — and verify it
against a real historical commit rather than a plant, which is available for free
the moment the defect is found.

---
