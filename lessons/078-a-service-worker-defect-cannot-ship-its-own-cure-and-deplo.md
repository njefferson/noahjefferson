## 78 · A service-worker defect cannot ship its own cure, and "deployed" answers a different question from "fixed"

**Enforced by:** CHECKLIST running-on-the-reporting-device — a bug reported from a device is closed only when that device is confirmed running the build that fixes it. Ask for the version stamp, not for a retest.

A capture link failed on a real iPad with the browser naming the cause. A fix was
written, gated, deployed, and the same link was tried again on the deployed
build. **It failed identically** — which reads as one thing and was another.

The device was still being served by the OLD service worker. By deliberate design
(§7h) a new worker WAITS for the reader's press rather than taking over, so the
fix had been deployed and had never executed. The error naming a service worker
was itself proof that a worker — some worker — was in charge, and nothing had
established which one.

**The conclusion drawn from that test was wrong and expensive.** "My fix does not
work" led to a second, different fix built on a false premise. The second fix is
better and worth keeping, but it was designed for a problem that did not exist.

**The structural trap, which is what generalises:** in an offline-first app the
broken component is often the component that decides whether to accept its own
replacement. A worker that mishandles navigations is still the worker gatekeeping
the update. Every gate green, every deploy green, and the reporting device still
broken — with no contradiction anywhere.

**So the check before believing a device-reported bug is fixed is one question:**
*what version is that device running right now?* A build stamp on screen answers
it in a glance. Retesting the symptom does not, because a stale build reproduces
the old symptom perfectly.

**And say it to the reader, not only to the log.** If a defect can only be
escaped by taking an update, the release notes have to say so in words — the
person hitting it has no way to know the cure is sitting on their device waiting
for a press.

---
